package grp.pb.branch.gxboc.trans;

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
import grp.pt.util.exception.CommonException;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.net.Socket;
import java.net.SocketTimeoutException;

import org.apache.log4j.Logger;

/*******************************************************************************
 * 解析回执报文【湖南建行】
 * 
 * @author zhouqi
 * 
 */
public class GXBOCMsgParser extends MsgParser {

	private static Logger logger = Logger.getLogger(GXBOCMsgParser.class);

	@Override
	public MsgReqBody newMessage(IVoucher t, TransResManager config,
			Object... objects) throws Exception {
		return new GXBOCMsgReqBody(t, config, objects);
		
	}
	
	@Override
	public MsgResBody newMessage(Object... objects) throws Exception {
		return new GXBOCMsgResBody(objects);
		
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
		return new GXBOCMsgHead(msgLen, tradeCode, operator, tradeTime,
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
		String code = new String(headBytes, 29, 6,"GBK");
		int reqCode;
		if (code.matches("\\d+")) {
			reqCode = Integer.parseInt(code);
		} else {
			reqCode = 1;
		}
		int isHasFile = Integer.parseInt(new String(headBytes, 35, 1));
		return new GXBOCMsgHead(msgLen, tradeCode, tradeId, reqCode, code,
				isHasFile);
	}

	/***
	 * 解析响应报文
	 */
	@Override
	public MsgResBody parseResContent(byte[] message, TransResManager m)
			throws Exception {
		MsgResBody resBody = new GXBOCMsgResBody();
		byte[] headBytes = transUtilForGXBOCTrans.lenBytes(MsgConstant.RESHEADLEN + 4, message);
		byte[] bodyBytes = new String(message, MsgConstant.RESHEADLEN + 4,message.length-(MsgConstant.RESHEADLEN + 4),"GBK").getBytes("GBK");
		System.out.println("回执报文体："+new String(bodyBytes,"GBK"));
		super.parseResContent(m,resBody, headBytes, bodyBytes);
		return resBody;
	}
	
	public MsgReqBody parseReqContent(InputStream in) throws Exception {
		MsgReqBody reqBody = new GXBOCMsgReqBody();
		byte[] headBytes = SocketUtil.read(in, MsgConstant.REQHEADLEN + 4);
		logger.info("GXBOC headMessage：" + new String(headBytes));
		MsgHead reqHead = this.parseReqHead(headBytes);
		reqBody  = parseReqContent(in,reqHead);
		// 报文体长度
		return reqBody;
	}
	
	public MsgReqBody parseReqContent(InputStream in, MsgHead reqHead)
			throws Exception {
		MsgReqBody reqBody = new GXBOCMsgReqBody();
		int msgBodyLen = reqHead.getMsgLen() - MsgConstant.REQHEADLEN;
		byte[] bodyBytes = SocketUtil.read(in, msgBodyLen);
		logger.info("GXBOC bodyMessage：" + new String(bodyBytes));
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


	public byte[] getReturnMessage(Context context,byte[] req1, byte[] req2)throws Exception{

		// 创建套接字与服务端连接
		Socket socket = null;
		try {
			// 创建套接字链接
			socket = SocketUtil.createSocket(context, true);
			logger.info("######请求报文：" + new String(req1,"GBK"));
			// 将报文字节流输出到套接字输出流发送
			socket.getOutputStream().write(req1);
			socket.getOutputStream().flush();
			if (req2 != null) {
				socket.getOutputStream().write(req2);
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

}
