package grp.pb.branch.gxboc.service;

import java.io.IOException;

/*******************************************************************************
 * 报文头(公用的包括请求和响应)
 * 
 * @author zhouqi
 * 
 */
public abstract class MsgHead{
	
	// 报文长度：4位
	int msgLen;

	// 交易码：6位
	String tradeCode;

	// 操作员号：12位
	String operator;

	// 交易时间：14位 YYYYMMDDhhmmss
	private String tradeTime;

	// 流水号：19位
	private String tradeId;

	// 是否有文件传输：1位 0：无 1：有
	private int isFile = 0;
	
	// 响应代码 6位 000000成功 其他失败
	//错误返回的结果可包含字母
	private int reqCode = 1;
	
	//响应码
	private String responseCode;

	/***
	 * 无参构造方法
	 */
	public MsgHead(){}

	
	/***
	 * 请求报文头
	 * @param msgLen     报文长度
	 * @param tradeCode  交易码
	 * @param operator   操作员号
	 * @param tradeTime  交易时间
	 * @param tradeId    流水号
	 * @param isHasFile  是否有文件传输
	 */
	public MsgHead(int msgLen, String tradeCode, String operator,
			String tradeTime, String tradeId, int isHasFile) {
		this.msgLen = msgLen;
		this.tradeCode = tradeCode;
		this.operator = operator;
		this.tradeTime = tradeTime;
		this.tradeId = tradeId;
		this.isFile = isHasFile;
	}

	/***
	 * 响应报文头
	 * @param msgLen    报文长度
	 * @param tradeCode 交易码
	 * @param tradeId   流水号
	 * @param reqCode   响应代码
	 * @param responseCode 响应码
	 * @param isHasFile  是否有文件传输
	 */
	public MsgHead(int msgLen, String tradeCode, String tradeId, int reqCode,
			String responseCode, int isHasFile) {
		this.msgLen = msgLen;
		this.tradeCode = tradeCode;
		this.tradeId = tradeId;
		this.reqCode = reqCode;
		this.responseCode = responseCode;
		this.isFile = isHasFile;
	}

	

	/**
	 * 拼装请求报文头
	 * 
	 * @return
	 * @throws IOException
	 */
	abstract byte[] readReqHead() throws IOException;

	/**
	 * 拼装响应报文头
	 * @return
	 * @throws IOException
	 */
	abstract byte[] readResHead() throws IOException;

	
	public String getTradeId() {
		return tradeId;
	}

	public void setTradeId(String tradeId) {
		this.tradeId = tradeId;
	}

	public int getMsgLen() {
		return msgLen;
	}

	public void setMsgLen(int msgLen) {
		this.msgLen = msgLen;
	}

	public String getTradeCode() {
		return tradeCode;
	}

	public void setTradeCode(String tradeCode) {
		this.tradeCode = tradeCode;
	}

	public String getOperator() {
		return operator;
	}

	public void setOperator(String operator) {
		this.operator = operator;
	}

	public String getTradeTime() {
		return tradeTime;
	}

	public void setTradeTime(String tradeTime) {
		this.tradeTime = tradeTime;
	}

	public int getIsFile() {
		return isFile;
	}

	public void setIsFile(int isFile) {
		this.isFile = isFile;
	}

	public int getReqCode() {
		return reqCode;
	}

	public void setReqCode(int reqCode) {
		this.reqCode = reqCode;
	}

	public String getResponseCode() {
		return responseCode;
	}

	public void setResponseCode(String responseCode) {
		this.responseCode = responseCode;
	}

}
