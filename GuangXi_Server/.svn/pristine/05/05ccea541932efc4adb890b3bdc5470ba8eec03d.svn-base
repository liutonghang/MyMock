package grp.pb.branch.gxboc.service;

import grp.pt.pb.payment.IVoucher;
import grp.pt.pb.trans.util.Context;
import grp.pt.pb.trans.util.SocketUtil;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.util.List;

import org.apache.log4j.Logger;
/***
 * 核心转账处理类
 * @author zq
 *
 */
public abstract class MsgParser {
	
	private static Logger logger = Logger.getLogger(MsgParser.class);

	/***
	 * 实例化请求报文体
	 * 
	 * @param t
	 * @param objects
	 * @param config
	 * @return
	 * @throws Exception
	 */
	public abstract MsgReqBody newMessage(IVoucher t, TransResManager config,
			Object... objects) throws Exception;
	
	/***
	 * 解析请求报文头
	 * 
	 * @param headBytes
	 * @return
	 * @throws Exception
	 */
	public abstract MsgHead parseReqHead(byte[] headBytes) throws Exception;
	
	
	/***
	 * 解析请求报文
	 * 
	 * @param headBytes
	 *            报文头
	 * @param bodyBytes
	 *            报文体
	 * @return
	 * @throws Exception
	 */
	public void parseReqContent(TransResManager resManager,MsgReqBody reqBody, byte[] headBytes,
			byte[] bodyBytes) throws Exception {
		MsgHead reqHead = this.parseReqHead(headBytes);
		List<TransResConfig> configList = resManager.getReqConfigList();
		Object [] objs = new Object[configList.size()];
		int i = 0;
		int j = 5; // 域名和长度
		for (TransResConfig t : resManager.getReqConfigList()) {
			int len = Integer.parseInt(new String(bodyBytes, j - 2, 2));
			objs[i] = new String(bodyBytes, j, len).trim();
			logger.info("字段名：" + t.getField_name() + ",值：" + objs[i]);
			j = j + len + 5;
			i++;
		}
		reqBody.setObjs(objs);
		reqBody.setReqHead(reqHead);
	}
	
	/***
	 * 根据已有的报文头，解析请求报文体
	 * 
	 * @param in
	 * @param reqHead
	 * @return
	 * @throws Exception
	 */
	public MsgReqBody parseReqContent(InputStream in,MsgHead reqHead) throws Exception {
		return null;
	}
	public MsgReqBody parseReqContent(MsgHead reqHead, String allResMesg) throws Exception {
		return null;
	}
	
	/**
	 * 解析请求报文
	 * @param in
	 * @return
	 * @throws Exception
	 */
	public MsgReqBody parseReqContent(InputStream in)throws Exception {
		return null;
	}
	
	
	/***
	 * 实例化响应报文体
	 * @param objects
	 * @return
	 * @throws Exception
	 */
	public abstract MsgResBody newMessage(Object... objects) throws Exception;
	
	
	/**
	 * 解析响应报文头
	 * 
	 * @param headBytes
	 * @return
	 * @throws Exception
	 */
	public abstract MsgHead parseResHead(byte[] headBytes) throws Exception;

	
	/***
	 * 解析响应报文
	 * @param resBody
	 * @param headBytes
	 * @param bodyBytes
	 * @throws Exception
	 */
	public void parseResContent(TransResManager resManager,MsgResBody resBody, byte[] headBytes,
			byte[] bodyBytes) throws Exception {
		MsgHead resHead = this.parseResHead(headBytes);
		int i = 0;
		int j = 5; // 域名和长度
		List<TransResConfig> configList = resManager.getResConfigList();
		Object [] objs = new Object[configList.size()];
		for (TransResConfig t : configList) {
			//xcg 2016-10-8 09:59:11     解析响应报文转码GBK（广西中行）
			int len = Integer.parseInt(new String(bodyBytes, j - 2, 2,"GBK"));
			objs[i] = new String(bodyBytes, j, len,"GBK").trim();
			logger.info("字段名：" + t.getField_name() + ",值：" + objs[i]);
			j = j + len + 5;
			i++;
			if(resHead!=null && resHead.getReqCode()!=0){
				throw new RuntimeException(objs[0].toString());
			}
		}
		resBody.setObjs(objs);
		resBody.setResHead(resHead);
	}
	

	/***
	 * 解析响应报文
	 * 
	 * @param message
	 * @param m
	 * @return
	 * @throws Exception
	 */
	public abstract MsgResBody parseResContent(byte[] message, TransResManager m) throws Exception;
	
	
	/***
	 * 解析响应报文体
	 * 
	 * @param in
	 * @return
	 * @throws Exception
	 */
	public MsgResBody parseResContent(InputStream in) throws Exception {
		return null;
	}
	

	/***
	 * 发送并返回回执信息
	 * 
	 * @param m
	 *            配置信息
	 * @param context
	 *            banktrans属性文件
	 * @param byteOut
	 *            待发送的报文字节数组
	 * @return
	 * @throws Exception
	 */
	public byte[] sendMessage(TransResManager m, Context context, IVoucher t,
			Object... objects) throws Exception {
		// 1、拼装报文
		MsgReqBody msgBody = this.newMessage(t, m, objects);
		ByteArrayOutputStream byteWriter = new ByteArrayOutputStream();
		byteWriter.write(msgBody.readReqHead());
		byteWriter.write(msgBody.readReqMsgBody());
		//return SocketUtil.handleSocket(context, byteWriter.toByteArray(),null);
		return getReturnMessage( context, byteWriter.toByteArray(),null );
	}
	
	public byte[] getReturnMessage(Context context,byte[] req1,
			byte[] req2)throws Exception{
		return SocketUtil.handleSocket(context, req1,req2);
	}
	
	/***
	 * 测试打印请求报文，并模拟银行返回回执报文
	 * @param in
	 * @return
	 * @throws Exception
	 */
	//public abstract byte[] loadRequestByReturn(InputStream in) throws Exception;

}
