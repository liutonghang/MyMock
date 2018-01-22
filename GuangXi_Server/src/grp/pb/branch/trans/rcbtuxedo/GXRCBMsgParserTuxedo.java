package grp.pb.branch.trans.rcbtuxedo;



import grp.pt.pb.common.IBankAccountService;
import grp.pt.pb.common.model.BankAccount;
import grp.pt.pb.exception.PbException;
import grp.pt.pb.payment.IVoucher;
import grp.pt.pb.trans.model.TransReturnDTO;
import grp.pt.pb.trans.util.Context;
import grp.pt.pb.trans.util.SocketUtil;
import grp.pt.pb.trans.util.TransUtil;
import grp.pt.pb.util.PbUtil;
import grp.pt.pb.util.PropertiesHander;
import grp.pt.pb.util.StaticApplication;
import grp.pt.pb.util.TradeConstant;
import grp.pt.pb.util.XmlUtils;
import grp.pt.util.DateUtil;
import grp.pt.util.PlatformUtils;
import grp.pt.util.exception.CommonException;
import grp.pt.util.model.Session;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.net.Socket;
import java.net.SocketTimeoutException;


import org.apache.log4j.Logger;
import org.dom4j.Document;

import org.dom4j.DocumentHelper;


import bea.jolt.JoltRemoteService;
import bea.jolt.JoltSession;
import bea.jolt.JoltSessionAttributes;


public class GXRCBMsgParserTuxedo {

	private static Logger logger = Logger.getLogger(GXRCBMsgParserTuxedo.class);
	
	ByteArrayOutputStream byteArray = new ByteArrayOutputStream();
	
	private static IBankAccountService bankAccountService = StaticApplication.getBankAccountService();
	
	public GXRCBMsgResBodyTuxedo doSocket(Session sc, Context context, IVoucher t,Object ...objects) throws Exception{
		ByteArrayOutputStream byteArray = new ByteArrayOutputStream();
		String transCode = objects[0].toString();		
        Document head = null;
        Document body =null;
        byte[] reqBodys = null;
        byte[] resBodys = null;
        byte[] req = null;
		String resBody = null;		
		//支付
		if("718012".equals(transCode)){
			head = getHead(transCode, sc, t ,t.getTransId());
			body = getTransBody(head, t);
			int length = body.asXML().getBytes("GBK").length;
			reqBodys = body.asXML().getBytes("GBK");
			byteArray.write(TransUtil.getFixlenStrBytes(String.valueOf(length), 8));
			byteArray.write(reqBodys);
			req = byteArray.toByteArray();
			resBodys = handleSocket(context, req , null);
			return parsers(resBodys,t);
		}else if("718013".equals(transCode)){
			head = getHead(transCode, sc, t,objects[2].toString());
			body = queryTransBody(head, t, objects[1].toString());
			int length = body.asXML().getBytes("GBK").length;
			reqBodys = body.asXML().getBytes("GBK");
			byteArray.write(TransUtil.getFixlenStrBytes(String.valueOf(length), 8));
			byteArray.write(reqBodys);
			req = byteArray.toByteArray();
			resBodys = handleSocket(context, req, null);
			return parserss(resBodys,t);
		}else if("718006".equals(transCode)){
			head = getHead(transCode, sc, t,objects[2].toString());
			body = checkFile(head,objects[1].toString());
			int length = body.asXML().getBytes("GBK").length;
			reqBodys = body.asXML().getBytes("GBK");
			byteArray.write(TransUtil.getFixlenStrBytes(String.valueOf(length), 8));
			byteArray.write(reqBodys);
			req = byteArray.toByteArray();
			resBodys = handleSocket(context, req, null);
			return parserFile(resBodys);
		}
		    //核心ip端口
		    String appAddress = PropertiesHander.getValue("gxtuxedo", "appaddress");
			//拼装完整报文
			String reqBody = reqBody(sc, t, objects);		
	        transCode = reqBody.substring(8,14);
			resBody = doTuxedo(reqBody,transCode,appAddress);		
		    //解析
		    return parser(resBody,t);
	}

	/**
	 * 解析跨行报文718012
	 * @param resBody
	 * @param t
	 * @return
	 * @throws Exception 
	 */
	private GXRCBMsgResBodyTuxedo parsers(byte[] resBody , IVoucher t) throws Exception {
		GXRCBMsgResBodyTuxedo body = new GXRCBMsgResBodyTuxedo();
		String resString = new String(resBody);
		if(Integer.parseInt(resString.substring(0, 8))==resString.getBytes().length-8){
			Document document=DocumentHelper.parseText(resString.substring(8));
			//返回交易码
			String respcode=document.selectSingleNode("/Root/Head/respcode").getText();
			//响应信息
			String respmsg = document.selectSingleNode("/Root/Head/respmsg").getText();
			String hostjnl = "";
			//成功
			if("000000".equals(respcode)){
				//流水
				hostjnl = document.selectSingleNode("/Root/Body/hostjnl").getText();
				body.setStatus(0);
				body.setBankTransId(hostjnl);
				body.setReason(respmsg);
			}	
			else {
				body.setStatus(TransReturnDTO.FAILURE);
				body.setReason(respmsg);
			}
		}else {
			logger.info("获取报文不全");
			body.setStatus(TransReturnDTO.UNKNOWN);
			body.setReason("获取报文不全");
		}
		return body;
	}

	
	/**
	 * 解析跨行报文718013
	 * @param resBody
	 * @param t
	 * @return
	 * @throws Exception
	 */
	private GXRCBMsgResBodyTuxedo parserss(byte[] resBody , IVoucher t) throws Exception {
		GXRCBMsgResBodyTuxedo body = new GXRCBMsgResBodyTuxedo();
		String resString = new String(resBody);
		if(Integer.parseInt(resString.substring(0, 8))==resString.getBytes().length-8){
			Document document=DocumentHelper.parseText(resString.substring(8));
			//返回交易码
			String respcode=document.selectSingleNode("/Root/Head/respcode").getText();
			//响应信息
			String respmsg = document.selectSingleNode("/Root/Head/respmsg").getText();
			String transtatus = "";
			//失败原因
			String msgcont = "";
			//成功
			if("000000".equals(respcode)){
				//状态
				transtatus = document.selectSingleNode("/Root/Body/transtatus").getText();
				body.setReason(respmsg);
				if(t.getTrade_type() == TradeConstant.PAY2PAYEE){
					if("0".equals(transtatus)){
						body.setStatus(0);
					}
					else if("1".equals(transtatus)){
						body.setStatus(1);
					}
					else if("2".equals(transtatus)){
						throw new PbException("已冲销不能支付");
					}
					else if("3".equals(transtatus)){
						body.setStatus(TransReturnDTO.UNKNOWN);
						body.setReason("核心返回异常！");
					}
				}
			}	
			else {
				msgcont = document.selectSingleNode("/Root/Head/respmsg").getText();
				body.setStatus(TransReturnDTO.FAILURE);
				body.setReason(respmsg);
			}
		}
		else {
			logger.info("获取报文不全");
			body.setStatus(TransReturnDTO.UNKNOWN);
			body.setReason("获取报文不全");
		}
		return body;
	}
	
	/**
	 * 跨行对账
	 * @param resBody
	 * @return
	 * @throws Exception
	 */
	private GXRCBMsgResBodyTuxedo parserFile(byte[] resBody) throws Exception {
		GXRCBMsgResBodyTuxedo body = new GXRCBMsgResBodyTuxedo();
		String resString = new String(resBody);
		if(Integer.parseInt(resString.substring(0, 8))==resString.getBytes().length-8){
			Document document=DocumentHelper.parseText(resString.substring(8));
			//返回交易码
			String respcode=document.selectSingleNode("/Root/Head/respcode").getText();
			//返回文件名称
			String fileName=document.selectSingleNode("/Root/Body/filename").getText();
			//成功
			if("000000".equals(respcode)){
				if(!"".equals(fileName) || fileName != null){
					body.setFileName(fileName);
				}
				else {
					body.setStatus(TransReturnDTO.FAILURE);
				}
			}else {
				body.setStatus(TransReturnDTO.FAILURE);
			}		
		}else {
			logger.info("获取报文不全");
			body.setStatus(TransReturnDTO.UNKNOWN);
			body.setReason("获取报文不全");
		}
		return body;
	}
	
	/**
	 * 解析
	 * @param resBody
	 * @param t
	 * @return
	 * @throws Exception
	 */
	private GXRCBMsgResBodyTuxedo parser(String resBody, IVoucher t) throws Exception {
		GXRCBMsgResBodyTuxedo body = new GXRCBMsgResBodyTuxedo();	
		//交易码
		String	transCode = resBody.substring(8,14);
		//报文体长度
		int trasnBodyLength = resBody.getBytes("GBK").length-58;
		//返回报文不带报文头
		String resString = resBody.substring(58);
		//响应信息
		String rspMsg = this.getvalue(resString, "RspMsg");
		//响应码
		String rspCode = this.getvalue(resString, "RspCode");
		if(resBody.length()>8){
			if(resString.getBytes("GBK").length == trasnBodyLength){
				//860009账号信息查询
				if("860009".equals(transCode)){
					//成功
					if("000000".equals(rspCode)){
						String payAmount = this.getvalue(resString, "Bal");
						if(payAmount == null){
							//TODO:报错
							throw new PbException("Bal该字段没有相应的值");
						}
						body.setPayAmount(new BigDecimal(payAmount));
					}
					else if("NPS000".equals(rspCode)){
						body.setStatus(TransReturnDTO.FAILURE);
						body.setReason("账户不存在！");
					}
					else{
						body.setStatus(TransReturnDTO.FAILURE);
						body.setReason("账号信息查询失败！");
					}
				}
				//860001记账
				else if("860001".equals(transCode)){
					String bankTransId = this.getvalue(resString, "SerSeqNo");
					//TODO:响应信息、核心流水需要记录
					//成功
					if("000000".equals(rspCode)){
						body.setStatus(0);
						body.setBankTransId(bankTransId);
					}else{
						body.setStatus(TransReturnDTO.FAILURE);
						body.setReason(rspMsg);
					}
				}
				//860002冲销
				else if("860002".equals(transCode)){
					//成功
					if("000000".equals(rspCode)){
						body.setStatus(0);
					}else{
						body.setStatus(TransReturnDTO.FAILURE);						
						body.setReason(rspMsg);
					}
				}
				//860004生成对账文件
				else if("860004".equals(transCode)){
					//成功
					if("000000".equals(rspCode)){
						//对账文件名
						String fileName = getvalue(resString, "AgtContF0");
						if("".equals(fileName) || fileName == null){
							throw new PbException("没有对账文件名");
						}
						body.setFileName(fileName);											
					}
					else {
						body.setStatus(TransReturnDTO.FAILURE);						
						body.setReason(rspMsg);
					}
				}
				//860008交易结果查询
				else if("860008".equals(transCode)){
					String EndFlag = getvalue(resString, "EndFlag");
					body = getQueryTransResult(EndFlag, t, rspCode);
				}
				else {
					//TODO:响应信息
					logger.info(rspMsg);
					body.setStatus(TransReturnDTO.FAILURE);
					body.setReason(rspMsg);
				}
			}
		}
			else {
				logger.info("获取报文不全");
				body.setStatus(TransReturnDTO.UNKNOWN);
				body.setReason("获取报文不全");
			}
		return body;
		}		

	/**
	 * 请求报文体
	 * @param sc
	 * @param t
	 * @param objects
	 * @return
	 * @throws IOException
	 * @throws Exception 
	 */
	private String reqBody(Session sc, IVoucher t, Object[] objects) throws IOException, Exception {	
        StringBuffer byteOut = new StringBuffer();
		StringBuffer sb = new StringBuffer();
		String transCode = objects[0].toString();
		//同行
		String head = getMsgHead(transCode);;
		//860009账号信息查询
		if("860009".equals(transCode)){			
			sb.append(getReqBody(sc,t));
			//帐号
			sb.append("<AcctNo>"+t.getPayAcctNo()+"</>");
		}
		//860001记账
		else if("860001".equals(transCode)){			
			sb.append(getReqBody(sc,t));
			//交易类型
			sb.append("<TranType>"+"1"+"</>");
			//币种
			sb.append("<Ccy>"+"01"+"</>");
			//金额
			sb.append("<Amt>"+t.getAmt()+"</>");
			//**现金项目
			sb.append("<CashItemCode>"+"5020"+"</>");
			
			//TODO:VouKind/PreCharCode/BMSZPHM,是否与CashFlag标志有关，是现金的时候，是否需要传值？
			
			//前置日期
			sb.append("<TranDate1>"+PbUtil.getCurrLocalDate()+"</>");
			//前置流水
			sb.append("<SerSeqNo1>"+t.getTransId()+"</>");
			//**外围系统代码
			sb.append("<SubSystem>"+GXTradeConstantTuxedo.SUB_SYSTEM+"</>");
			//**业务编码
			sb.append("<AgtCode>"+"CZZF"+"</>");
			//业务明细
			sb.append("<AgtCont0>"+t.getTransId()+"</>");						
			sb.append("<CtrlFlg>"+"1"+"</>");
			//借方现转标志 2-转账
			//TODO: 需要根据结算方式（set_mode_code）判断什么类型的是现金(现场)
			String set_mode_code = (String) PlatformUtils.getProperty(t, "set_mode_code");
			sb.append("<CashFlag>"+"2"+"</>");
			//借方帐号
			sb.append("<PyrAcc>"+t.getPayAcctNo()+"</>");
			//借方户名
			sb.append("<PyrNm>"+t.getPayAcctName()+"</>");
			//借方备注
			sb.append("<Memo>"+t.getPaySummaryName()+"</>");
			//借方摘要码
			sb.append("<MemoCode>"+"5351"+"</>");
			//贷方现转标志  2-转账
			sb.append("<CashFlag1>"+"2"+"</>");
			//贷方帐号
			sb.append("<AccptAcctNo>"+t.getPayeeAcctNo()+"</>");
			//收款户名
			sb.append("<AccptName>"+t.getPayeeAcctName()+"</>");
			//借方备注
			sb.append("<Memo1>"+t.getPaySummaryName()+"</>");
			//贷方摘要码
			sb.append("<MemoCode1>"+"5351"+"</>");
			//**业务种类
			sb.append("<BusiSysType>"+"1900CZZF0001"+"</>");			
		}
		//860002冲销
		else if("860002".equals(transCode)){			
			sb.append(getReqBody(sc,t));
			String dateString = (String) PlatformUtils.getProperty(t, "batchreq_date");
			String hold8 =  (String) PlatformUtils.getProperty(t, "hold8");
		    String date = DateUtil.DateToString(DateUtil.stringToDate(dateString,"yyyyMMdd"), "yyyy-MM-dd");
			//原前置日期，取上一次的请款日期
			sb.append("<TranDate1>"+date+"</>");
			//原前置流水，上一次请款交易流水
			logger.info(hold8);
			sb.append("<SerSeqNo1>"+hold8+"</>");
			//**外围系统代码
			sb.append("<SubSystem>"+GXTradeConstantTuxedo.SUB_SYSTEM+"</>");
			//冲销确认
			sb.append("<Flag>"+"1"+"</>");
			
		}
		//860004生成对账文件
		else if("860004".equals(transCode)){			
			sb.append(getReqBody(sc,t));
			//**业务编码
			sb.append("<AgtCode>"+"CZZF"+"</>");
			//对账日期
			sb.append("<TranDate1>"+objects[1]+"</>");
		}
		//860008交易结果查询
		else if("860008".equals(transCode)){			
			sb.append(getReqBody(sc,t));
			//原业前置流水
			sb.append("<AgtCont0>"+t.getTransId()+"</>");
			//原前置日期
			sb.append("<TranDate1>"+objects[1]+"</>");
			//**外围系统代码
			sb.append("<SubSystem>"+GXTradeConstantTuxedo.SUB_SYSTEM+"</>");
		}
		//报文体长度
		int length = sb.toString().getBytes("GBK").length;
		byteOut.append(new String(TransUtil.getFixlenStrBytes(String.valueOf(length), 8)));
		//报文头
		byteOut.append(head);
		//报文体
		byteOut.append(sb);
		return byteOut.toString();
	}
	
	/**
	 * 拼装报文头
	 * @param transCode
	 * @return
	 * @throws IOException 
	 */
	private String getMsgHead(String transCode) throws IOException{
		ByteArrayOutputStream byteOut = new ByteArrayOutputStream();
		//交易代码
		byteOut.write(TransUtil.getRightByAddSpace(transCode, 6));
		//报文类型(RQ请求)
		byteOut.write(TransUtil.getRightByAddSpace("RQ", 2));
		//文件传送标志
		byteOut.write(TransUtil.getRightByAddSpace("0", 1));
		//报文校验码
		byteOut.write(TransUtil.getRightByAddSpace(null, 32));
		//服务名称
		byteOut.write(TransUtil.getRightByAddSpace(transCode,8));
		//报文协议
		byteOut.write(TransUtil.getRightByAddSpace("1",1));
		return new String(byteOut.toByteArray());
	}
	
	/**
	 * 公共部分
	 * 机构码
	 * 交易柜员
	 * 交易来源
	 * @param sc
	 * @return
	 */
	private String getReqBody(Session sc ,IVoucher t){
		StringBuffer sb = new StringBuffer();
        String bankCode = "";
        //虚拟柜员号
        String virtualUser = PropertiesHander.getValue("gxtuxedo", "virtualUser");
	    String is_self_counter = String.valueOf(PlatformUtils.getProperty(t, "is_self_counter"));		
	    //自助柜面传虚拟柜员
	    if("1".equals(is_self_counter)){
	    	int tradeType = t.getTrade_type();
	    		try{
				    //请款
				if(TradeConstant.ADVANCE2PAY == tradeType){
					BankAccount bankAccount = bankAccountService.loadAccountByAccountNo(t.getPayeeAcctNo());
					bankCode = bankAccount.getBank_code();
					//支付，冲销,退票,退款
				}else if(TradeConstant.PAY2ADVANCE_WRITEOFF == tradeType || TradeConstant.PAY2ADVANCE_REFUND == tradeType || TradeConstant.PAY2ADVANCE_RETURN == tradeType
						|| TradeConstant.PAY2PAYEE == tradeType){
					BankAccount bankAccount = bankAccountService.loadAccountByAccountNo(t.getPayAcctNo());
					bankCode = bankAccount.getBank_code();
				}
			}catch(Exception e){
				e.printStackTrace();
			}
			sb.append("<Brc>"+bankCode+"</>");
	    	sb.append("<Teller>"+virtualUser+"</>");
		}
	    else {
			//机构码
			sb.append("<Brc>"+sc.getBankcode()+"</>");
//	        sb.append("<Brc>"+"1256"+"</>");
			//交易柜员
			sb.append("<Teller>"+sc.getUserCode()+"</>");
//			sb.append("<Teller>"+"rwtls"+"</>");
		}
		//交易来源
		sb.append("<ChannelId>"+GXTradeConstantTuxedo.CHANNELID+"</>");
		return sb.toString();
	}
	
	
	
	/**
	 * 交易状态查询结果
	 * @param EndFlag
	 * @param t
	 * @param RspCode
	 * @return
	 */
	private GXRCBMsgResBodyTuxedo getQueryTransResult(String EndFlag,IVoucher t,String RspCode){
		GXRCBMsgResBodyTuxedo body = new GXRCBMsgResBodyTuxedo();
		//成功
		if("000000".equals(RspCode)){
			//再次请款
			if(t.getTrade_type()==TradeConstant.ADVANCE2PAY || t.getTrade_type() == TradeConstant.PAY2PAYEE){
				//未支付--》
				if("0".equals(EndFlag)){
					body.setStatus(1);
				}
				//已支付--》更新标识
				else if("1".equals(EndFlag)){
					body.setStatus(0);
				}
				else {
					body.setStatus(TransReturnDTO.UNKNOWN);
					body.setReason("核心返回异常！");
				}
			}
			//冲销
			else if(t.getTrade_type() == TradeConstant.PAY2ADVANCE_WRITEOFF){
				//未支付--》冲销
				if("4".equals(EndFlag)){
					body.setStatus(0);
				}
				//其他
				else {
					body.setStatus(1);
					body.setReason("冲销失败");
				}
			  }
		}						
		else if("nps008".equals(RspCode)){
			body.setStatus(TransReturnDTO.FAILURE);
			body.setReason("原交易不存在");
		}
		else{
			body.setStatus(TransReturnDTO.UNKNOWN);
			body.setReason("核心返回异常！");
		}
		return body;								   
	}
	
	/**
	 * 调用Tuxdeo方法
	 * @param reqBody
	 * @return
	 */
	protected String doTuxedo(String reqBody, String transCode,String appAddress) {
		// 请求报文
		logger.info("######请求报文：" + reqBody);
		System.setProperty("bea.jolt.encoding", "iso8859_1");
		JoltRemoteService joltService = null;
		JoltSession session = null;
		JoltSessionAttributes sattr = null;
		String userName = PropertiesHander.getValue("gxtuxedo", "userName");
//		String userPassword = PropertiesHander.getValue("gxtuxedo", "userPassword");
//		String appPassword = PropertiesHander.getValue("gxtuxedo", "appPassword");
		String userRole = PropertiesHander.getValue("gxtuxedo", "userRole");
		try {			
			sattr = new JoltSessionAttributes();
			// 建立目标连接地址
			sattr.setString("APPADDRESS", "//" + appAddress);
			// TIMEOUT时间
			int timeout = Integer.parseInt(PropertiesHander.getValue("gxtuxedo", "timeout"));
			sattr.setInt("IDLETIMEOUT", timeout);
			// 建立远程链接
			session = new JoltSession(sattr, null, null, null,
					null);
			// 服务
			joltService = new JoltRemoteService(toISO8859(transCode), session);			
			// 设置发送消息
			joltService.setString("STRING",toISO8859(reqBody));
			// 调用服务
			joltService.call(null);
			// 获取返回信息
			String respStr = joltService.getStringDef("STRING", null);
			if (respStr == null) {
				String error = "receive NULL from TUXEDO.";
				logger.error(error);
				throw new RuntimeException(error);
			}
			String resp = new String (respStr.getBytes("iso8859_1"), "GBK");
			logger.info("######回执报文：" + resp);
			return resp;
		} catch (Exception e) {
			e.printStackTrace();
			throw new RuntimeException("调用Tuxedo失败，原因：" + e.getMessage());
		} finally {
			/**
			 * 解决生产空指针问题
			 * edit by liutianlong 2017年12月4日
			 */
			if(joltService != null ){
				joltService.clear();
				joltService.done();
			}
			if(session != null ){
				session.endSession();
			}
		}
	}
	
	/**
	 * 转换格式8859_1
	 * @param msg
	 * @return
	 */
	public static final String toISO8859(String msg) {
	    try {
	      byte[] b = msg.getBytes("GB2312");
	      String convert = new String(b, "8859_1");
	      return convert; } catch (Exception e) {
	    }
	    return new String("Convert failed!");
	  }
	
	
	/**
	 * Socket
	 * @param context
	 * @param reqBody
	 * @param towReqBody
	 * @return
	 * @throws Exception
	 */
	public static byte[] handleSocket(Context context, byte[] reqBody,
			byte[] towReqBody) throws Exception {
		// 创建套接字与服务端连接
		Socket socket = null;
		try {
			// 创建套接字链接
			socket = SocketUtil.createSocket(context, true);
			logger.info("######请求报文：" + new String(reqBody,"GBK"));
			// 将报文字节流输出到套接字输出流发送
			socket.getOutputStream().write(reqBody);
			socket.getOutputStream().flush();
			if (towReqBody != null) {
				socket.getOutputStream().write(towReqBody);
				socket.getOutputStream().flush();
			}
			logger.info("######请求报文发送成功");
			// 读取回执报文
			InputStream in = socket.getInputStream();
			byte[] len = SocketUtil.read(in, 8);
			String leng = new String(len,"GBK");
			int length = Integer.parseInt(leng);
			byte[] body = SocketUtil.read(in,length);			
			logger.info("######已返回回执报文");
			// 读取响应报文
			ByteArrayOutputStream baos = new ByteArrayOutputStream();
			baos.write(len);
			baos.write(body);
			logger.info("######响应报文：" + new String(baos.toByteArray()));
			return baos.toByteArray();
		} catch (SocketTimeoutException ex) {
			logger.error(ex);
			throw new SocketTimeoutException("读取响应报文超时！");
		} catch (Exception e) {
			logger.error("", e);
			throw new CommonException(e.getMessage());
		} finally {
			SocketUtil.close(socket);
		}
	}
	
	/**
	 * 跨行公共报文头
	 * @param transCode
	 * @param sc
	 * @param t
	 * @return
	 */
	private Document getHead(String transCode,Session sc,IVoucher t,String transId){
		Document head =  DocumentHelper.createDocument();
		//交易机构
		XmlUtils.createXMLByXPath(head, "/Root/Head/brc", sc.getBankcode());
//		XmlUtils.createXMLByXPath(head, "/Root/Head/brc", "1726");
		//交易柜员
		XmlUtils.createXMLByXPath(head, "/Root/Head/teller", sc.getUserCode());
//		XmlUtils.createXMLByXPath(head, "/Root/Head/teller", "134843");
		//渠道ID临时
		XmlUtils.createXMLByXPath(head, "/Root/Head/channelid", GXTradeConstantTuxedo.CHANNELID);
		//渠道日期
		XmlUtils.createXMLByXPath(head, "/Root/Head/channeldate", PbUtil.getCurrDate());
		//渠道流水号
		XmlUtils.createXMLByXPath(head, "/Root/Head/channelseq", transId);
		//交易码
		XmlUtils.createXMLByXPath(head, "/Root/Head/transcode", transCode);
		return head;		
	}
	
	/**
	 * 大额跨行转账【718012】
	 * @param head
	 * @param t
	 * @return
	 */
	private Document getTransBody(Document head,IVoucher t){
		//转出帐号
		XmlUtils.createXMLByXPath(head, addDocument("payacctno"), t.getPayAcctNo());
//		XmlUtils.createXMLByXPath(head, addDocument("payacctno"), "172613010109545663");
		//转出币种
		XmlUtils.createXMLByXPath(head, addDocument("ccy"), "CNY");
		//转出客户名称
		XmlUtils.createXMLByXPath(head, addDocument("payacctname"), t.getPayAcctName());
//		XmlUtils.createXMLByXPath(head, addDocument("payacctname"), "黑名单测试7");
		//转入帐号
		XmlUtils.createXMLByXPath(head, addDocument("recvacctno"), t.getPayeeAcctNo());
		//转入户名
		XmlUtils.createXMLByXPath(head, addDocument("recvacctname"), t.getPayeeAcctName());
		//转入行行号
		XmlUtils.createXMLByXPath(head, addDocument("recvbankno"), t.getPayee_account_bank_no());
		//转出金额
		XmlUtils.createXMLByXPath(head, addDocument("amount"), t.getAmt());
		//业务类型
		XmlUtils.createXMLByXPath(head, addDocument("txtpcd"), "A100");
		//业务种类
		XmlUtils.createXMLByXPath(head, addDocument("txctgypurpcd"), "02102");
		//控制标志
		XmlUtils.createXMLByXPath(head, addDocument("ctlflag"), "1");
		//备注
		XmlUtils.createXMLByXPath(head, addDocument("memo"), "跨行转账");
		//附言
		XmlUtils.createXMLByXPath(head, addDocument("addword"), t.getPaySummaryName());
		return head;
	}
	
	/**
	 * 跨行检查交易状态
	 * @param head
	 * @param t
	 * @return
	 */
	private Document queryTransBody(Document head,IVoucher t,String date){
		//原渠道
		XmlUtils.createXMLByXPath(head, addDocument("ochannelid"), GXTradeConstantTuxedo.CHANNELID);
		//原交渠道日期
		XmlUtils.createXMLByXPath(head, addDocument("ochanneldate"),DateUtil.DateToString(DateUtil.stringToDate(date, "yyyy-MM-dd"), "yyyyMMdd"));
		//原渠道流水号
		XmlUtils.createXMLByXPath(head, addDocument("ochannelseq"), t.getTransId());
		return head;
	}
	
	/**
	 * 跨行对账
	 * @param head
	 * @param queryDate
	 * @return
	 */
	private Document checkFile(Document head,String queryDate){
		//历史查询标志
		XmlUtils.createXMLByXPath(head, addDocument("lisflag"),"");
		//往来标志
		XmlUtils.createXMLByXPath(head, addDocument("srflag"),"");
		//委托日期 起
		XmlUtils.createXMLByXPath(head, addDocument("begwkdt"),queryDate);
		//委托日期 止
		XmlUtils.createXMLByXPath(head, addDocument("endwkdt"),queryDate);
		//分页查询标志
		XmlUtils.createXMLByXPath(head, addDocument("qryflag"),"0");
		return head;
	}
	
	public String addDocument(String node){
		return "/Root/Body/"+node;
	}
	/**
	 * 解析返回报文公用方法
	 * @param content
	 * @param key
	 * @return
	 */
	protected String getvalue( String content, String key ){
		int beginIndex = content.indexOf("<"+key );
		if( beginIndex == -1){
			return null;
		}
		int endIndex = content.indexOf("</>", beginIndex);
		return content.substring(beginIndex+("<"+key+">").length(), endIndex);
	   }
}
