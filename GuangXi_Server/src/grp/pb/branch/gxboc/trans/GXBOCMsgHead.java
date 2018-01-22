package grp.pb.branch.gxboc.trans;

import grp.pt.pb.trans.model.MsgHead;
import grp.pt.pb.trans.util.TransUtil;
import grp.pt.pb.trans.util.MsgConstant;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

/*******************************************************************************
 * 报文头【广西中行】
 * 
 * @author zhouqi
 * 
 */
public class GXBOCMsgHead extends MsgHead {

	/***
	 * 无参构造方法
	 */
	public GXBOCMsgHead() { }

	/***
	 * 请求报文头
	 * 
	 * @param msgLen
	 * @param tradeCode
	 * @param operator
	 * @param tradeTime
	 * @param tradeId
	 * @param isHasFile
	 */
	public GXBOCMsgHead(int msgLen, String tradeCode, String operator,
			String tradeTime, String tradeId, int isHasFile) {
		super(msgLen, tradeCode, operator, tradeTime, tradeId, isHasFile);
	}

	/***
	 * 响应报文头
	 * 
	 * @param msgLen
	 * @param tradeCode
	 * @param tradeId
	 * @param reqCode
	 * @param resposeCode
	 * @param isHasFile
	 */
	public GXBOCMsgHead(int msgLen, String tradeCode, String tradeId,
			int reqCode, String resposeCode, int isHasFile) {
		super(msgLen, tradeCode, tradeId, reqCode, resposeCode, isHasFile);
	}

	/***
	 * 拼装请求报文头
	 */
	@Override
	public byte[] readReqHead() throws IOException {
		// 字节输出流
		ByteArrayOutputStream byteOut = new ByteArrayOutputStream();
		byteOut.write(TransUtil.getFixlenStrBytes(this.getMsgLen() + "", 4));
		byteOut.write(TransUtil.getFixlenStrBytes(this.getTradeCode(), 6));
		byteOut.write(TransUtil.getFixlenStrBytes(this.getOperator(), 12));
		byteOut.write(TransUtil.getFixlenStrBytes(this.getTradeTime(), 14));
		byteOut.write(TransUtil.getFixlenStrBytes(this.getTradeId(), 19));
		byteOut.write((this.getIsFile() + "").getBytes());
		return byteOut.toByteArray();
	}

	/***
	 * 拼装响应报文头
	 */
	@Override
	public byte[] readResHead() throws IOException {
		// 字节输出流
		ByteArrayOutputStream byteOut = new ByteArrayOutputStream();
		byteOut.write(TransUtil.getFixlenStrBytes(this.getMsgLen() + "", 4));
		byteOut.write(TransUtil.getFixlenStrBytes(this.getTradeCode(), 6));
		byteOut.write(TransUtil.getFixlenStrBytes(this.getTradeId(), 19));
		// TODO 验证码接口是将响应码设置在responseCode，暂时先这样兼容
		if (this.getTradeCode().equalsIgnoreCase(MsgConstant.QUERY_USERCODE)) {
			byteOut.write(TransUtil.getFixlenStrBytes(this.getResponseCode()
					+ "", 6));
		} else {
			byteOut.write(TransUtil.getFixlenStrBytes(this.getReqCode() + "", 6));
		}
		byteOut.write((this.getIsFile() + "").getBytes());
		return byteOut.toByteArray();
	}

}
