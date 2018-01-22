package grp.pb.branch.trans;

import grp.pt.pb.exception.PbException;
import grp.pt.pb.payment.IVoucher;
import grp.pt.pb.trans.model.MsgHead;
import grp.pt.pb.trans.model.MsgParser;
import grp.pt.pb.trans.model.MsgReqBody;
import grp.pt.pb.trans.model.MsgResBody;
import grp.pt.pb.trans.model.TransResManager;
import grp.pt.pb.trans.util.Context;
import grp.pt.pb.trans.util.MsgConstant;
import grp.pt.pb.trans.util.SocketUtil;
import grp.pt.pb.trans.util.TransUtil;
import grp.pt.util.exception.CommonException;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.net.Socket;
import java.net.SocketTimeoutException;

import org.apache.log4j.Logger;

import com.ccb.gx.Security;
import com.river.common.UploadFileUtil;

/*******************************************************************************
 * 解析回执报文【广西建行】
 * 
 * @author FWQ
 * 
 */
public class GXCCBMsgParser extends MsgParser {

	private static Logger logger = Logger.getLogger(GXCCBMsgParser.class);

	private static byte[] msgHeadSecurity = null;
	
	static{
		//GXCCB报文加密
		msgHeadSecurity = UploadFileUtil.getFromPro("trans", "msgHeadSecurity").getBytes();
	}
	// 请求报文体

	@Override
	public MsgReqBody newMessage(IVoucher t, TransResManager config,
			Object... objects) throws Exception {
		return new GXCCBMsgReqBody(t, config, objects);
	}
	
	@Override
	public MsgResBody newMessage(Object... objects) throws Exception {
		return new GXCCBMsgResBody(objects);
		
	}

	/***
	 * 解析请求报文头
	 * 
	 * @param headBytes
	 * @return
	 * @throws Exception
	 */
	public MsgHead parseReqHead(byte[] headBytes) throws Exception {
		int msgLen = Integer.parseInt(new String(headBytes, 0, 4));
		String tradeCode = new String(headBytes, 4, 6);
		String operator = new String(headBytes, 10, 12);
		String tradeTime = new String(headBytes, 22, 14);
		String tradeId = new String(headBytes, 36, 19);
		int isHasFile = Integer.parseInt(new String(headBytes, 55, 1));
		return new GXCCBMsgHead(msgLen, tradeCode, operator, tradeTime,
				tradeId, isHasFile);
	}

	/***************************************************************************
	 * 解析响应报文头
	 */
	@Override
	public MsgHead parseResHead(byte[] headBytes) throws Exception {
		int msgLen = Integer.parseInt(new String(headBytes, 0, 4));
		String tradeCode = new String(headBytes, 4, 6);
		String tradeId = new String(headBytes, 10, 19);
		// 六位交易吗中、转账失败交易码可能存在字母
		String code = new String(headBytes, 29, 6);
		int reqCode;
		if (code.matches("\\d+")) {
			reqCode = Integer.parseInt(code);
		} else {
			reqCode = 1;
		}
		int isHasFile = Integer.parseInt(new String(headBytes, 35, 1));
		return new GXCCBMsgHead(msgLen, tradeCode, tradeId, reqCode, code,
				isHasFile);
	}

	/***
	 * 解析响应报文
	 */
	@Override
	public MsgResBody parseResContent(byte[] message, TransResManager m)
			throws Exception {
		MsgResBody resBody = new GXCCBMsgResBody();
		//--------------------------------------------
		logger.info("######响应密文报文：" + new String(message));
		String resMesg = new String(message);
		String resMesgNoLen = resMesg.substring(4, resMesg.length());
		String resMesgSec = new String(Security.DECRYPT(msgHeadSecurity, resMesgNoLen.getBytes()));
		String resMesgLen = new String(TransUtil.getFixlenStrBytes(resMesgSec.length()+"", 4));
		byte[] allResMesg = (resMesgLen + resMesgSec).getBytes();
		logger.info("######响应明文报文：" + new String(allResMesg));
		//-------------------------------------------
		byte[] headBytes = TransUtil.lenBytes( allResMesg,0,MsgConstant.RESHEADLEN + 4);
		byte[] bodyBytes = new String(allResMesg, MsgConstant.RESHEADLEN + 4,allResMesg.length-(MsgConstant.RESHEADLEN + 4)).getBytes();
		super.parseResContent(m,resBody, headBytes, bodyBytes);
		return resBody;
	}
	
	public MsgReqBody parseReqContent(InputStream in) throws Exception {
		MsgReqBody reqBody = new GXCCBMsgReqBody();
		byte[] lenBytes = SocketUtil.read(in, 4);
		int len = Integer.parseInt(new String(lenBytes));
		byte[] allBytes = SocketUtil.read(in, len);
		logger.info("######请求密文报文：" + new String(allBytes));
		String resMesgSec = new String(Security.DECRYPT(msgHeadSecurity, allBytes));
		String resMesgLen = new String(TransUtil.getFixlenStrBytes(resMesgSec.length()+"", 4));
		byte[] allResMesg = (resMesgLen + resMesgSec).substring(0, MsgConstant.REQHEADLEN + 4).getBytes();
		logger.info("######请求明文报文：" + new String(allResMesg));
//		byte[] headBytes = SocketUtil.read(in, MsgConstant.REQHEADLEN + 4);
		//-------------------------------------------
		
		//-------------------------------------------
		MsgHead reqHead = this.parseReqHead(allResMesg);
		reqBody  = parseReqContent(reqHead,resMesgSec);
		return reqBody;
	}
	
	public MsgReqBody parseReqContent(MsgHead reqHead ,String resMesgSec)
			throws Exception {
		MsgReqBody reqBody = new GXCCBMsgReqBody();
//		int msgBodyLen = reqHead.getMsgLen() - MsgConstant.REQHEADLEN;
		byte[] bodyBytes = resMesgSec.substring( MsgConstant.REQHEADLEN, reqHead.getMsgLen()).getBytes();
//		byte[] bodyBytes = SocketUtil.read(in, msgBodyLen);
		logger.info("GXCCB bodyMessage：" + new String(bodyBytes));
		Object[] objs = null;
		if(reqHead.getTradeCode().equalsIgnoreCase(MsgConstant.QUERY_BANKFLOW_TRACODE)){
			objs = new Object[3];
		}else if(reqHead.getTradeCode().equalsIgnoreCase(MsgConstant.QUERY_TRADESTATUS_TRACODE)){
			objs = new Object[5];
		}else if(reqHead.getTradeCode().equalsIgnoreCase(MsgConstant.QUERY_ACCTBALANCE_TRACODE)){
			objs = new Object[1];
			// 验证码
		} else if (reqHead.getTradeCode().equalsIgnoreCase(MsgConstant.QUERY_USERCODE)) {
			objs = new Object[2];
		} else {
			throw new PbException("请求报文类型：" + reqHead.getTradeCode()
					+ ",没有找到字段长度！");
		}
		int j = 5; // 域名和长度
		for (int i = 0; i < objs.length; i++) {
			int len = Integer.parseInt(new String(bodyBytes, j - 2, 2));
			objs[i] = new String(bodyBytes, j, len).trim();
			j = j + len + 5;
		}
		reqBody.setObjs(objs);
		reqBody.setReqHead(reqHead);
		return reqBody;
	}
	
	
	public byte[] sendMessage(TransResManager m, Context context, IVoucher t,
			Object... objects) throws Exception {
		return super.sendMessage(m, context, t, objects);
	}

	
	
//	@Override
//	public byte[] loadRequestByReturn(InputStream in) throws Exception {
//		MsgReqBody reqBody = parseReqContent(in);
//		ByteArrayOutputStream arrayOut = new ByteArrayOutputStream();
//		MsgResBody resBody = this.newMessage();
//		arrayOut.write(resBody.readResHead());
//		arrayOut.write(resBody.readResMsgBody());
//		return arrayOut.toByteArray();
//	}

	public byte[] getReturnMessage(Context context,byte[] req1, byte[] req2)throws Exception{

		// 创建套接字与服务端连接
		Socket socket = null;
		try {
			// 创建套接字链接
			socket = SocketUtil.createSocket(context, true);
			//-------------------------------------------
			logger.info("######请求明文报文：" + new String(req1));
			String reqMesg = new String(req1);
			String reqMesgNoLen = reqMesg.substring(4, reqMesg.length());
			String reqMesgSec = new String(Security.ENCRYPT(msgHeadSecurity, reqMesgNoLen.getBytes()));
			String reqMesgLen = new String(TransUtil.getFixlenStrBytes(reqMesgSec.length()+"", 4));
			byte[] allReqMesg = (reqMesgLen + reqMesgSec).getBytes();
			logger.info("######请求密文报文：" + new String(allReqMesg));
			//-------------------------------------------
			// 将报文字节流输出到套接字输出流发送
			socket.getOutputStream().write(allReqMesg);
			socket.getOutputStream().flush();
			if (req2 != null) {
				//-------------------------------------------
				logger.info("######请求明文报文：" + new String(req2));
				String resMesg = new String(req2);
				String resMesgNoLen = reqMesg.substring(4, resMesg.length());
				String resMesgSec = new String(Security.ENCRYPT(msgHeadSecurity, resMesgNoLen.getBytes()));
				String resMesgLen = new String(TransUtil.getFixlenStrBytes(resMesgSec.length()+"", 4));
				byte[] allResMesg = (resMesgLen + resMesgSec).getBytes();
				logger.info("######请求密文报文：" + new String(allResMesg));
				//-------------------------------------------
				socket.getOutputStream().write(allResMesg);
				socket.getOutputStream().flush();
			}
			logger.info("######请求报文发送成功");
			// 读取回执报文
			InputStream in = socket.getInputStream();
			logger.info("######已返回回执报文");
			// 读取响应报文
			ByteArrayOutputStream baos = new ByteArrayOutputStream();
			int i = -1;
			byte[] msgLenBytes = new byte[4];
			
			int cou = in.read( msgLenBytes );
			if(cou != 4 ){
				throw new RuntimeException("报文长度必须大于4");
			}
			baos.write(msgLenBytes);
			
			int msgLen = Integer.parseInt( new String(msgLenBytes));
			byte[] msgBody = SocketUtil.read(socket.getInputStream(),msgLen);
			baos.write(msgBody);
			
			return baos.toByteArray();
		} catch (SocketTimeoutException ex) {
			logger.error("@@@@@@@@",ex);
			throw new SocketTimeoutException("读取响应报文超时！");
		} catch (Exception e) {
			logger.error("####", e);
			throw new CommonException(e.getMessage());
		} finally {
			SocketUtil.close(socket);
		}
		
	}
	

	
	// /***
	// * 实例化请求报文体
	// */
	// @Override
	// public MsgReqBody newMessage(Object o,String userCode, String transType,
	// String queryDate,String payeeAcctNo,String payeeAcctBankName) {
	// msgReqBody = new GXCCBMsgReqBody(o, userCode,
	// transType,queryDate,payeeAcctNo,payeeAcctBankName);
	// return msgReqBody;
	// }
	//	
	// /***************************************************************************
	// * 实例化响应报文体
	// */
	// public MsgResBody newMessage(String hold1, String hold2, String
	// hold3,String hold4, String userCode, String transType,String transId) {
	// if (transType.equalsIgnoreCase(MsgConstant.PAYTRANS_TRACODE)) {
	// msgResBody = new GXCCBMsgResBody(hold1, hold2,
	// hold3,userCode,transId);
	// } else if
	// (transType.equalsIgnoreCase(MsgConstant.QUERY_TRADESTATUS_TRACODE)) {
	// msgResBody = new GXCCBMsgResBody(hold1, Integer.parseInt(hold2),
	// userCode,transId);
	// } else if (transType.equalsIgnoreCase(MsgConstant.QUERY_USERCODE)) {
	// msgResBody = new GXCCBMsgResBody(hold1, hold2, transId,userCode);
	// } else if
	// (transType.equalsIgnoreCase(MsgConstant.QUERY_BANKFLOW_TRACODE)) {
	// msgResBody = new GXCCBMsgResBody(hold1, Integer.parseInt(hold2),new
	// BigDecimal(hold3), hold4, userCode);
	// }
	// return msgResBody;
	// }

	// /***
	// * 解析请求报文体
	// * @param in
	// * @return
	// * @throws Exception
	// */
	// public MsgReqBody parseReqContent(InputStream in) throws Exception{
	// byte[] headBytes = SocketUtil.read(in, MsgConstant.REQHEADLEN + 4);
	// MsgHead reqHead = this.parseReqHead(headBytes);
	// MsgReqBody reqBody = (MsgReqBody)parseContext(new
	// GXCCBMsgReqBody(),in,reqHead,MsgConstant.REQHEADLEN,1);
	// reqBody.setReqHead(reqHead);
	// return reqBody;
	// }
	//	
	// public MsgReqBody parseReqContent(InputStream in,MsgHead reqHead) throws
	// Exception {
	// MsgReqBody reqBody = (MsgReqBody)parseContext(new
	// GXCCBMsgReqBody(),in,reqHead,MsgConstant.REQHEADLEN,1);
	// reqBody.setReqHead(reqHead);
	// return reqBody;
	// }

	// /****
	// * 解析响应报文体
	// * @param in
	// * @param isRequest 是否请求报文
	// * @return
	// * @throws Exception
	// */
	// @Override
	// public MsgResBody parseResContent(InputStream in) throws Exception {
	// byte[] headBytes = SocketUtil.read(in, MsgConstant.RESHEADLEN + 4);
	// logger.info("########响应报文头信息："+new String(headBytes,"GBK"));
	// MsgHead msgHead = this.parseResHead(headBytes);
	// MsgResBody resBody = (MsgResBody)parseContext(new
	// GXCCBMsgResBody(),in,msgHead,MsgConstant.RESHEADLEN,0);
	// resBody.setResHead(msgHead);
	// logger.info("########响应信息："+resBody.getResponseMsg());
	// return resBody;
	// }

	// /****
	// * 解析报文公用方法
	// * @param o 请求报文或响应报文对象
	// * @param in 文件流
	// * @param msgHead 报文头
	// * @param headLen 报文头的长度
	// * @param isRequest 是否请求报文
	// * @return
	// * @throws Exception
	// */
	// Object parseContext(Object o, InputStream in, MsgHead msgHead, int
	// headLen,
	// int isRequest) throws Exception {
	// // 报文体长度
	// int msgBodyLen = msgHead.getMsgLen() - headLen;
	// // 报文体字节数组
	// byte[] bodyBytes = SocketUtil.read(in, msgBodyLen);
	// // 结果
	// List<TransResConfig> results =
	// ResultCache.getResults(msgHead.getTradeCode() + "_" + isRequest);
	// int j = 5; // 域名和长度
	// for (TransResConfig r : results) {
	// int len = Integer.parseInt(new String(bodyBytes, j - 2, 2));
	// String value = new String(bodyBytes,j,len,"GBK").trim();
	// // String value = new String(bodyBytes, j, len).trim();
	// Field f = o.getClass().getField(r.getField_name());
	// String typeName = f.getType().getName();
	// if (typeName.equalsIgnoreCase("java.lang.Integer")
	// || typeName.equalsIgnoreCase("int")) {
	// //PlatformUtils.setProperty(o, r.getField_name(),
	// Integer.parseInt(value));
	// DataInject.inject(o,r.getField_name(),Integer.parseInt(value));
	// } else if (typeName.equalsIgnoreCase("java.math.BigDecimal")) {
	// try{
	// DataInject.inject(o,r.getField_name(),new BigDecimal(value));
	// }catch( Exception e ){
	// logger.error("查询余额，返回结果异常" + r.getField_name() +"值为：" +value );
	// }
	//				
	// } else {
	// //PlatformUtils.setProperty(o, r.getField_name(), value);
	// DataInject.inject(o,r.getField_name(),value);
	// }
	// j = j + len + 5;
	// }
	// return o;
	// }
	//	
	//

}
