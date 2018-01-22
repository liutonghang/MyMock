package grp.pb.branch.beibuwan.trans;

import grp.pb.branch.beibuwan.trans.util.BBWMsgConstant;
import grp.pt.idgen.IdGen;
import grp.pt.pb.exception.PbException;
import grp.pt.pb.payment.IVoucher;
import grp.pt.pb.payment.PayClearVoucher;
import grp.pt.pb.tips.TipsMessageDTO;
import grp.pt.pb.trans.model.MsgHead;
import grp.pt.pb.trans.model.MsgParser;
import grp.pt.pb.trans.model.MsgReqBody;
import grp.pt.pb.trans.model.MsgResBody;
import grp.pt.pb.trans.model.TransLogDTO;
import grp.pt.pb.trans.model.TransResManager;
import grp.pt.pb.trans.model.TransReturnDTO;
import grp.pt.pb.trans.util.Context;
import grp.pt.pb.trans.util.SocketUtil;
import grp.pt.pb.trans.util.TransUtil;
import grp.pt.pb.util.ChangeUtil;
import grp.pt.pb.util.ElementUtil;
import grp.pt.pb.util.PbParaConstant;
import grp.pt.pb.util.PbUtil;
import grp.pt.pb.util.PropertiesHander;
import grp.pt.pb.util.TradeConstant;
import grp.pt.pb.util.XmlUtils;
import grp.pt.util.DateUtil;
import grp.pt.util.PlatformUtils;
import grp.pt.util.StringUtil;
import grp.pt.util.exception.CommonException;
import grp.pt.util.model.Session;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.UnsupportedEncodingException;
import java.net.Socket;
import java.net.SocketTimeoutException;
import java.net.UnknownHostException;
import java.text.SimpleDateFormat;
import java.util.Date;

import org.apache.log4j.Logger;
import org.dom4j.Document;
import org.dom4j.DocumentHelper;

public class BBWMsgParser extends MsgParser{
	 private static Logger log =Logger.getLogger(BBWMsgParser.class);
	 		
	/**
	 * 银行核心socket配置文件
	 * 
	 */
	private static String IP = PropertiesHander.getValue("trans", "IP");
	private static String PORT = PropertiesHander.getValue("trans", "Port");
	private static String OUTTIME = PropertiesHander.getValue("trans", "OutTime");
	/**
	 * 远程授权socket配置文件
	 * 
	 */ 
	private static String REMOTE_AUTHORIZE_IP = PropertiesHander.getValue("gxbbw", "remoteAuthen.IP");
	private static String REMOTE_AUTHORIZE_PORT = PropertiesHander.getValue("gxbbw", "remoteAuthen.Port");
	
	/**
	 * 分割符  "|"
	 */ 
	private static String SPLIT = "|";
	
	/**
	 * 拼装
	 * 
	 * @param sc
	 * @param context
	 * @param t
	 * @param objects
	 * @return
	 * @throws UnsupportedEncodingException
	 */
	public byte[] doAssemble(Session sc, Context context, IVoucher t,
			 String traCode, Object... objects) throws Exception {
		//返回结果
		ByteArrayOutputStream byteOut = new ByteArrayOutputStream();
		Document document = DocumentHelper.createDocument();
		//报文头
		reqBodyHead(sc,t,traCode,document);
		
		//转账请求报文
		if((BBWMsgConstant.PAYTRANS_TRACODE).equals(traCode)){
			reqBody4coreTrans(sc, t, document);
			
		}
		//交易状态查询请求报文
		else if(BBWMsgConstant.PAYTRANS_QUERYCODE.equals(traCode)){
			reqBody4queryTrans(sc, t, document, objects);

		}
		//冲销
		else if (BBWMsgConstant.REVERSAL.equals(traCode)) {
			reqBody4WriteOff(t, document);
			
		}
		//对账    
		else if(BBWMsgConstant.CHECK_SERIAL_NO.equals(traCode)){
			reqBody4CheckSerialNo(document, objects);
			
		}
		//划款申请,即发送正向tips
		else if(BBWMsgConstant.SEND_TIPS.equals(traCode)){
			TipsMessageDTO tmDTO = (TipsMessageDTO) objects[0];
			reqBody4SendTips(document, tmDTO);
			
		}		
		//退款划款申请，即发送逆向tips    
		else if(BBWMsgConstant.SEND_REFUND_TIPS.equals(traCode)){
			TipsMessageDTO tmDTO = (TipsMessageDTO) objects[0];
			String ori_tips_file_name = (String) objects[1];
			PayClearVoucher payClearVoucher = (PayClearVoucher) t;
			reqBody4SendRefundTips(document, payClearVoucher, tmDTO,ori_tips_file_name);
			
		}
		//柜员同步
		else if(BBWMsgConstant.UPDATE_PBUSER.equals(traCode)){
			getPbUserAndNetworkFileName(sc,document);
		}
		
		document.setXMLEncoding(BBWMsgConstant.GBK);
		String body = document.asXML();

		byte[] allLenBytes = TransUtil.getFixlenStrBytes
				(String.valueOf(body.getBytes(BBWMsgConstant.GBK).length), 5);   
		byteOut.write(allLenBytes);
		byteOut.write(body.getBytes(BBWMsgConstant.GBK));
		
		return byteOut.toByteArray();
	}
	/**
     * TR06 柜员同步
     */
	private void getPbUserAndNetworkFileName(Session sc, Document document) {
		XmlUtils.createXMLByXPath(document, "/ebank/BrChno","");//部门号 TODO：待定

	}

	/**
     * TR05 发送正向tips
     */
	private void reqBody4SendTips(Document document, TipsMessageDTO tmDTO) {
		String tipsFileName = tmDTO.getFielName();
		if(tipsFileName.trim().endsWith(".txt")){
			tipsFileName = tipsFileName.trim().substring(0, tipsFileName.length()-4);
		}
		XmlUtils.createXMLByXPath(document, "/ebank/FileNm",tipsFileName);//文件名称
		
	}
	/**
     * TR06 发送逆向tips
     */
	private void reqBody4SendRefundTips(Document document, PayClearVoucher t, TipsMessageDTO tmDTO, String ori_tips_file_name) {
		String tipsFileName = tmDTO.getFielName();
		if(tipsFileName.endsWith(".txt")){
			tipsFileName = tipsFileName.substring(0, tipsFileName.length()-4);
		}
		XmlUtils.createXMLByXPath(document, "/ebank/FileNm",tipsFileName);//文件名称
		if(ori_tips_file_name.trim().endsWith(".txt")){
			ori_tips_file_name = ori_tips_file_name.trim().substring(0, tipsFileName.length()-4);
		}
		XmlUtils.createXMLByXPath(document, "/ebank/OriFileNm",ori_tips_file_name);//原划款申请文件名
		
		XmlUtils.createXMLByXPath(document, "/ebank/AcpDate",t.getPay_entrust_date());//委托日期  这个是前台补录的
		XmlUtils.createXMLByXPath(document, "/ebank/TxId",t.getPay_dictate_no());//支付交易序号 这个是前台补录的

	}



	/**
     * 生成公共的报文头
     */
    private void reqBodyHead(Session sc, IVoucher t, String traCode,Document document) {
		XmlUtils.createXMLByXPath(document, "/ebank/tellNo",sc.getUserCode());//柜员号
		XmlUtils.createXMLByXPath(document, "/ebank/nodeNo",sc.getBelongOrgCode());//网点号
		XmlUtils.createXMLByXPath(document, "/ebank/tranCode",traCode);//交易码
		
	}
    
	/**
     * TR01 核心转账
     */
	private void reqBody4coreTrans(Session sc, IVoucher t,Document document) {
		//请款，上传核心的付款人是零余额账户，收款人是实际收款人。所以先改变trade_type的值，再改回来
		int tradeType = t.getTrade_type();
		//专户清算的时候不变
		if(tradeType != TradeConstant.CLEARTOAGENT && tradeType != TradeConstant.AGENTTOCLEAR){
			PlatformUtils.setProperty(t, "trade_type", TradeConstant.PAY2PAYEE);
		}
		
		XmlUtils.createXMLByXPath(document, "/ebank/PayerAccNo",t.getPayAcctNo());//付款账号
		XmlUtils.createXMLByXPath(document, "/ebank/PayerAccNm",t.getPayAcctName());//付款户名
		XmlUtils.createXMLByXPath(document, "/ebank/PayeeAccNo",t.getPayeeAcctNo());//收款账号
		XmlUtils.createXMLByXPath(document, "/ebank/PayeeAccNm",t.getPayeeAcctName());//收款户名
		XmlUtils.createXMLByXPath(document, "/ebank/PayeeBankNo",t.getPayeeAcctBankNo());//收款行号
		XmlUtils.createXMLByXPath(document, "/ebank/FrontDate",PbUtil.getCurrDate());//前置日期 yyyyMMdd
		XmlUtils.createXMLByXPath(document, "/ebank/FrontSerial",t.getTransId());//前置流水
		PlatformUtils.setProperty(t, "trade_type",tradeType);
		XmlUtils.createXMLByXPath(document, "/ebank/TranType",getTranType(t));//转账类型    0：代垫,1：行内转账,2：跨行转账,3：退款转账,4:公务卡还款，5：现金支付，6预算外清算
		XmlUtils.createXMLByXPath(document, "/ebank/itemTp",getPayType(t));//支付类型    1.预算内直接支付；2.预算内授权支付；6.预算外直接；7.预算外授权；8.预算外专项直接
		XmlUtils.createXMLByXPath(document, "/ebank/TranAmt",t.getAmt());//交易金额
		XmlUtils.createXMLByXPath(document, "/ebank/BillNo",t.getVouNo());//凭证号
		XmlUtils.createXMLByXPath(document, "/ebank/BillType",getBillType(t));//1：直接支付   2：授权支付
		XmlUtils.createXMLByXPath(document, "/ebank/SetYear",PbUtil.getCurrYear()+"");//年度
		XmlUtils.createXMLByXPath(document, "/ebank/AdmDivCode",t.getAdmdivCode());//区划码
		XmlUtils.createXMLByXPath(document, "/ebank/ReMark",(String)PlatformUtils.getProperty(t, "pay_summary_name"));//TODO:备注		
		if("3".equals(getTranType(t))){
			//退款时候需要录入原正向的支付凭证号 和 退款标识
			XmlUtils.createXMLByXPath(document, "/ebank/PrimBillNo",(String) PlatformUtils.getProperty(t, "ori_payvoucher_code"));//原支付凭证号
			String isRefundAll = null;//退款标识       1：全额退款      2：部分退款
			if(2 == (Integer)PlatformUtils.getProperty(t, "refund_type")){
				//按单退款
				isRefundAll = "1";
			}else if(1 == (Integer)PlatformUtils.getProperty(t, "refund_type")){
				//按明细退款
				isRefundAll = "2";
			}
			XmlUtils.createXMLByXPath(document, "/ebank/RetFlag",isRefundAll);//1：全额退款      2：部分退款


		}
	
	
	}
	//支付类型    1.预算内直接支付；2.预算内授权支付；6.预算外授权；7.预算内授权；8.预算外专项直接
	private String getPayType(IVoucher t) {
		String fund_type_code = (String) PlatformUtils.getProperty(t, "fund_type_code");
		String pay_type_code = (String) PlatformUtils.getProperty(t, "pay_type_code");
		if(fund_type_code.startsWith("1")){
			//预算内
			if("11".equals(pay_type_code)){
				//直接支付
				return "1";
			}else if("12".equals(pay_type_code)){
				//授权支付
				return "2";
			}
		}else if(fund_type_code.startsWith("2")){
			//预算外
			if("11".equals(pay_type_code)){
				//直接支付
				return "6";
			}else if("12".equals(pay_type_code)){
				//授权支付
				return "7";
			}
		}else{
			//预算外专项直接为8
			throw new PbException("请配置相关的结算方式");
		}
		return null;
		
		
	}

	/**
     * TR03 对账
     */
	private void reqBody4CheckSerialNo(Document document, Object... objects) {
		String queryDate = (String) objects[0];
		log.info("此次对账的日志是："+queryDate);
		XmlUtils.createXMLByXPath(document, "/ebank/StrDate",queryDate);//开始日期
		XmlUtils.createXMLByXPath(document, "/ebank/EndDate",queryDate);//结束日期
	}
	
	/**
     * TR02 冲销
     */
	private void reqBody4WriteOff(IVoucher t, Document document) {
		
		XmlUtils.createXMLByXPath(document, "/ebank/FrontDate",
				DateUtil.getDateString(new Date(), DateUtil.DATE_FORMAT_2));//前置日期 yyyyMMdd
		XmlUtils.createXMLByXPath(document, "/ebank/FrontSerial",t.getTransId());//前置流水
		XmlUtils.createXMLByXPath(document, "/ebank/PrimFrontDate",(String)PlatformUtils.getProperty(t, "batchreq_date"));//原前置日期
		XmlUtils.createXMLByXPath(document, "/ebank/PrimFrontSerial",(String)PlatformUtils.getProperty(t, "hold7"));//原前置流水
		XmlUtils.createXMLByXPath(document, "/ebank/TranType","0");//转账类型
		XmlUtils.createXMLByXPath(document, "/ebank/BillNo",t.getVouNo());//凭证号
		XmlUtils.createXMLByXPath(document, "/ebank/ReMark",(String)PlatformUtils.getProperty(t, "pay_summary_name"));//备注
	}
	//1：直接支付   2：授权支付
	private String getBillType(IVoucher t) {
		
		String pay_type_code = (String) PlatformUtils.getProperty(t, "pay_type_code");
		if("11".equals(pay_type_code)){
			//1：直接支付
			return "1";
		}else if("12".equals(pay_type_code)){
			//2：授权支付
			return "2";
		} else{
			throw new PbException("根据pay_type_code无法确定bill的类型");
		}
		
	}
	//转账类型    0：代垫, 1：行内转账,2：跨行转账,3：退款转账,4: 公务卡还款，5：现金支付，6预算外清算
	private String getTranType(IVoucher t) {
		String cashCode = ElementUtil.getEleValue(PbParaConstant.CASH,
				"现金", t.getAdmdivCode());
		if(TradeConstant.ADVANCE2PAY == t.getTrade_type()){
			//0:代垫
			return "0";
		} else if(TradeConstant.PAY2ADVANCE_REFUND == t.getTrade_type()
				||TradeConstant.PAY2AGENT_REFUND == t.getTrade_type()){
			//3:退款
			return "3";
		} else if("2".equals(PlatformUtils.getProperty(t, "business_type_code"))){
			//公务卡还款的business_type_code是2，返回4
			return "4";
		}
		
		else if(cashCode.equals(PlatformUtils.getProperty(t, "set_mode_code").toString())){
			//现金支付，返回5
			return "5";
		} else if((TradeConstant.CLEARTOAGENT==t.getTrade_type()||TradeConstant.AGENTTOCLEAR==t.getTrade_type())&&((String)(PlatformUtils.getProperty(t, "fund_type_code"))).startsWith("2")){
			//预算外清算，返回6
			return "6";
		} else if(TradeConstant.PAY2PAYEE == t.getTrade_type()){ //支付凭证
			// 根据补录银行的结算方试判断同行、跨行
			String pbSetModeCode =  PlatformUtils.getProperty(t,
					"pb_set_mode_code")==null?"" :String.valueOf(PlatformUtils.getProperty(t,
					"pb_set_mode_code")) ;
			if("2".equals(pbSetModeCode)||"4".equals(pbSetModeCode)){
				//2:跨行  
				return "2";
			} else if("1".equals(pbSetModeCode)||"3".equals(pbSetModeCode)){
				//1:同行
				return "1";
			}else {
				log.error("请配置相关的结算方式");
				throw new PbException("请配置相关的结算方式");
			}
			
		}else if(TradeConstant.CLEARTOPAYEE==t.getTrade_type()
				||TradeConstant.CLEARTOAGENT==t.getTrade_type()){
			//划款凭证
			String is_same_bank = String.valueOf(PlatformUtils.getProperty(t, "is_same_bank")) ;
			if(IVoucher.NOTSAMEBANK.equals(is_same_bank)){
				//2:跨行  
				return "2";
			}else if(IVoucher.SAMEBANK.equals(is_same_bank)){
				//1:同行
				return "1";
			}else{
				log.error("请配置相关的结算方式,is_same_bank的值为"+is_same_bank);
				throw new PbException("请配置相关的结算方式");
			}
		}else{
			log.error("请配置结算方式");
			throw new PbException("请配置结算方式");
		}
		

	}
	/**
     * TR04 查询交易状态
     */
	private void reqBody4queryTrans(Session sc, IVoucher t, Document document, Object... objects) {

		TransLogDTO logDTO = (TransLogDTO) objects[0];
		XmlUtils.createXMLByXPath(document, "/ebank/FrontDate",PbUtil.getCurrDate());//前置日期
		XmlUtils.createXMLByXPath(document, "/ebank/FrontSerial",seqReq());//前置流水
		SimpleDateFormat sf = new SimpleDateFormat("yyyyMMdd");
		XmlUtils.createXMLByXPath(document, "/ebank/PrimFrontDate",logDTO.getCreate_date());//原前置日期
		XmlUtils.createXMLByXPath(document, "/ebank/PrimFrontSerial",logDTO.getTrans_log_id());//原前置流水
		XmlUtils.createXMLByXPath(document, "/ebank/BillNo",t.getVouNo());//凭证号
		XmlUtils.createXMLByXPath(document, "/ebank/ReMark",(String)PlatformUtils.getProperty(t, "remark"));//TODO:备注
		
	}
	

	/**
	 * 发送，并获取回执
	 * 
	 * @return
	 * @throws Exception
	 */
	public byte[] doSend(Context context, byte[] reqByte) throws Exception {
		// 创建套接字与服务端连接
		Socket socket = null;
		try {
			// 创建套接字链接
			socket = createSocket();
			// 将报文字节流输出到套接字输出流发送
			socket.getOutputStream().write(reqByte);
			socket.getOutputStream().flush();
			log.info("######请求报文发送成功");
			// 读取回执报文
			InputStream in = socket.getInputStream();
			log.info("######已返回回执报文");
			// 读取响应报文
			ByteArrayOutputStream baos = new ByteArrayOutputStream();
			byte[] len = SocketUtil.read(in, 5);
			int length = Integer.parseInt(new String(len,"GBK"));
			log.info("报文长度："+length);
			byte[] resMsg = SocketUtil.read(in, length);
			baos.write(len);
			baos.write(resMsg);
			return baos.toByteArray();
		} catch (SocketTimeoutException ex) {
			log.error(ex);
			throw new SocketTimeoutException("读取响应报文超时！");
		} catch (Exception e) {
			log.error("接口调用失败，原因：", e);
			throw new CommonException(e.getMessage());
		} finally {
			SocketUtil.close(socket);
		}
	}
	public Socket createSocket() {
		Socket socket = null;
		try {
			socket = new Socket(IP, Integer.parseInt(PORT));
			// 设置socket超时时间
			socket.setSoTimeout(Integer.parseInt(OUTTIME));
		} catch (UnknownHostException e) {
			log.error(e);
			throw new PbException("无法建立于核心系统的通讯，" + "通讯地址为ip="
					+ IP + "，端口=" + PORT + "!");

		} catch (IOException e) {
			log.error(e);
			throw new PbException("无法建立于核心系统的通讯，" + "通讯地址为ip="
					+ IP + "，端口=" + PORT + "!");
		}
		return socket;
	}
	/**
	 * 解析
	 * 
	 * @param response
	 * @return
	 * @throws Exception 
	 */
	public BBWMsgResBody doParser(Session sc, IVoucher t, byte[] response,String traCode)
			throws Exception {
		log.info("解析回执xml报文开始...");
		
		BBWMsgResBody resBody = new BBWMsgResBody();
		String msg = new String(response,BBWMsgConstant.GBK).substring(5);
		Document document=DocumentHelper.parseText(msg);
		 //处理结果码
		String rspcode = document.selectSingleNode("/ebank/hostReturnCode").getText();
		 //银行交易流水号
		if (BBWMsgConstant.SUCCESS.equals(rspcode)) {
			//成功
			resBody.setResStatus(TransReturnDTO.SUCESS);
		} else if(BBWMsgConstant.SEND_TIPS.equals(traCode)||(BBWMsgConstant.SEND_REFUND_TIPS.equals(traCode))){
			//发送tips ， 直接返回成功，不校验返回码
			resBody.setResStatus(TransReturnDTO.SUCESS);
		} else{
			// 失败
			resBody.setResStatus(TransReturnDTO.FAILURE);
			 //处理结果说明
			String rspdesc = document.selectSingleNode("/ebank/hostErrorMessage").getText();
			resBody.setResMsg(rspdesc);
			return resBody;
		}
		
		if(BBWMsgConstant.PAYTRANS_TRACODE.equals(traCode)){
			//转账TR01
			String hostDate = document.selectSingleNode("/ebank/HostDate").getText();//核心日期
			String HostSerial = document.selectSingleNode("/ebank/HostSerial").getText();//核心流水
			String userSerial = document.selectSingleNode("/ebank/UserSq").getText();//柜员流水   
			resBody.setBankTransId(HostSerial);
			resBody.setUserSerial(userSerial);
		} else if(BBWMsgConstant.REVERSAL.equals(traCode)){
			//冲正TR02
			String hostDate = document.selectSingleNode("/ebank/HostDate").getText();//核心日期
			String HostSerial = document.selectSingleNode("/ebank/HostSerial").getText();//核心流水
			String userSerial = document.selectSingleNode("/ebank/UserSq").getText();//柜员流水  
			resBody.setBankTransId(HostSerial);
			resBody.setUserSerial(userSerial);
		} else if(BBWMsgConstant.CHECK_SERIAL_NO.equals(traCode)){
			//对账 TR03
			String fileFlag = document.selectSingleNode("/ebank/FileFlag").getText();//是否有文件产生  0：无      1：有
			if("0".equals(fileFlag)){
				throw new PbException("没有返回文件");
			}
			String fileName = document.selectSingleNode("/ebank/FileName").getText();//文件名称
			resBody.setFileName(fileName);
		} else if(BBWMsgConstant.PAYTRANS_QUERYCODE.equals(traCode)){
			//转账状态查询交易 TR04
			String result = document.selectSingleNode("/ebank/Result").getText();//交易结果 0：成功   1：失败   2：没收到  3：状态不确定
			if(StringUtil.isEmpty(result)){
				throw new PbException("交易状态查询回执报文异常，交易结果不能为空");
			}
			String HostSerial = document.selectSingleNode("/ebank/HostSerial").getText();//核心流水
			if("0".equals(result)){
				resBody.setResult(TransReturnDTO.SUCESS);
				resBody.setBankTransId(HostSerial);
			}else if("1".equals(result)){
				resBody.setResult(TransReturnDTO.FAILURE);
			}else if("2".equals(result)){
				resBody.setResult(TransReturnDTO.FAILURE);
			}else if("3".equals(result)){
				//核心返回的交易状态是不确定
				resBody.setResult(TransReturnDTO.UNKNOWN);
			}
			
		} else if(BBWMsgConstant.SEND_TIPS.equals(traCode)){
			//上传tips全部返回成功
			resBody.setResStatus(0);
		} else if(BBWMsgConstant.SEND_REFUND_TIPS.equals(traCode)){
			//上传逆向tips全部返回成功
			resBody.setResStatus(0);
		} else if(BBWMsgConstant.UPDATE_PBUSER.equals(traCode)){
			//柜员同步
			String fileName  = document.selectSingleNode("/ebank/FileNm").getText();//柜员文件名称
			String fileName1 = document.selectSingleNode("/ebank/FileNmBr").getText();//网点文件名称
			resBody.setFileName(fileName);
			resBody.setFileName1(fileName1);
		}
		
		
		else{
			log.info("请配置交易码");
			throw new PbException("请配置交易码");
		} 
		
		
		
		return resBody;
	}

	@Override
	public MsgReqBody newMessage(IVoucher t, TransResManager config,
			Object... objects) throws Exception {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public MsgHead parseReqHead(byte[] headBytes) throws Exception {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public MsgResBody newMessage(Object... objects) throws Exception {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public MsgHead parseResHead(byte[] headBytes) throws Exception {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public MsgResBody parseResContent(byte[] message, TransResManager m)
			throws Exception {
		// TODO Auto-generated method stub
		return null;
	}

    public String seqReq() {
		// 流水ID
		StringBuffer flowIdSb = new StringBuffer(16);
		String id = IdGen.genStrId("SEQ_TRANS_FLOW_ID");
		if (id.length() > 8) {
			id = id.substring(id.length() - 8);
		} else {
			id = ChangeUtil.getFixlenStr(id, 8);
		}
		flowIdSb.append(id);
		return flowIdSb.toString();
    }
	/**
	 * 拼装远程授权的报文
	 * 
	 * @param flag 1表示申请授权 ； 0表示查询授权
	 * @return
	 * @throws Exception 
	 */
	public byte[] assembleAuthorize(Session sc, IVoucher t, String traCode,
			String flag) throws Exception {
		ByteArrayOutputStream byteOut = new ByteArrayOutputStream();
		StringBuilder sb = new StringBuilder();
		if(BBWMsgConstant.REMOTE_AUTHORIZE.equals(traCode)){
			//远程授权
			sb.append(SPLIT);
			sb.append(sc.getIp()).append(SPLIT);//终端IP
			sb.append(flag).append(SPLIT);//操作标识   0-发送授权申请；1-查询授权结果
			sb.append("0").append(SPLIT);//渠道   0-核心；1-理财；2-现金管理；3-新柜面；4-支付密码；5-二代大小额； TODO:根据t来判断
			if(BBWMsgConstant.APPLY_REMOTE_AUTHORIZE.equals(flag)){
				sb.append(t.getTransId()).append(SPLIT);//流水号
			} else if(BBWMsgConstant.GET_REMOTE_AUTHORIZE_RESULT.equals(flag)){
				sb.append("查查查").append(SPLIT);//TODO:需要去 表中查询一下远程授权的id
			}
			sb.append(sc.getBelongOrgCode()).append(SPLIT);//机构号
			sb.append(sc.getUserCode()).append(SPLIT);//柜员号
			sb.append("TR01").append(SPLIT);//交易码  TODO:需要根据t来判断
			sb.append(sc.getTellerCode()).append(SPLIT);//授权级别
		}
		
		
		byte[] allLenBytes = TransUtil.getFixlenStrBytes
				(String.valueOf(sb.toString().getBytes(BBWMsgConstant.GBK).length), 5);
		
		byteOut.write(allLenBytes);
		byteOut.write(sb.toString().getBytes(BBWMsgConstant.GBK));
		
		return byteOut.toByteArray();
	}
	/**
	 * 发送远程授权的报文
	 * 
	 * @param response
	 * @return
	 * @throws SocketTimeoutException 
	 * @throws Exception 
	 * @throws Exception 
	 */
		// 创建套接字与服务端连接
	public byte[] sendAuthorize(byte[] reqByte) throws SocketTimeoutException {
		Socket socket = null;
		try {
			// 创建套接字链接
			socket = createAuthorizeSocket();
			// 将报文字节流输出到套接字输出流发送
			socket.getOutputStream().write(reqByte);
			socket.getOutputStream().flush();
			log.info("######请求报文发送成功");
			// 读取回执报文
			InputStream in = socket.getInputStream();
			log.info("######已返回回执报文");
			// 读取响应报文
			ByteArrayOutputStream baos = new ByteArrayOutputStream();
			byte[] len = SocketUtil.read(in, 5);
			int length = Integer.parseInt(new String(len,"GBK"));
			log.info("报文长度："+length);
			byte[] resMsg = SocketUtil.read(in, length);
			baos.write(len);
			baos.write(resMsg);
			return baos.toByteArray();
		} catch (SocketTimeoutException ex) {
			log.error(ex);
			throw new SocketTimeoutException("读取响应报文超时！");
		} catch (Exception e) {
			log.error("接口调用失败，原因：", e);
			throw new CommonException(e.getMessage());
		} finally {
			SocketUtil.close(socket);
		}
	}
	/**
	 * 创建远程授权的socket
	 * 
	 * @param response
	 * @return
	 * @throws SocketTimeoutException 
	 * @throws Exception 
	 * @throws Exception 
	 */
	private Socket createAuthorizeSocket() {
		Socket socket = null;
		try {
			socket = new Socket(REMOTE_AUTHORIZE_IP, Integer.parseInt(REMOTE_AUTHORIZE_PORT));
			// 设置socket超时时间
			socket.setSoTimeout(Integer.parseInt(OUTTIME));
		} catch (UnknownHostException e) {
			log.error(e);
			throw new PbException("无法建立于核心系统的通讯，" + "通讯地址为ip="
					+ REMOTE_AUTHORIZE_IP + "，端口=" + REMOTE_AUTHORIZE_PORT + "!");

		} catch (IOException e) {
			log.error(e);
			throw new PbException("无法建立于核心系统的通讯，" + "通讯地址为ip="
					+ REMOTE_AUTHORIZE_IP + "，端口=" + REMOTE_AUTHORIZE_PORT + "!");
		}
		return socket;
	}
	/**
	 * 解析远程授权的报文
	 * 
	 * @param response
	 * @return
	 * @throws SocketTimeoutException 
	 * @throws Exception 
	 * @throws Exception 
	 */
	public BBWMsgResBody authorizeParser(Session sc, IVoucher t,
			byte[] response, String traCode) throws Exception {
		log.info("解析回执xml报文开始...");
		
		BBWMsgResBody resBody = new BBWMsgResBody();
		String msg = new String(response,BBWMsgConstant.GBK);
		if(BBWMsgConstant.REMOTE_AUTHORIZE.equals(traCode)){
			//远程授权
			resBody.setResCode(msg.split(SPLIT)[4]);//授权结果
			resBody.setResMsg(msg.split(SPLIT)[5]);//结果描述
		}

		
		return resBody;
	}
}
