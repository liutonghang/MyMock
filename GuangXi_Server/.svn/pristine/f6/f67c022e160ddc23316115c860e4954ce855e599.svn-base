package grp.pb.branch.gxboc.service;

import grp.pb.branch.gxboc.trans.transUtilForGXBOCTrans;
import grp.pt.pb.trans.util.TransUtil;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;

/***
 * 
 * 请求报文头描述 按字节拼装报文： 5位报文长度（不包括该5位） 4位交易码 10位机构号 10位柜员号 2位凭证笔数 4位年度 9位区划
 * 1位凭证类型（1=直接支付；2=授权支付;3实拨） 1位结算方式（1转账；2现金） 响应报文头描述 按字节拼装报文： 5位报文长度（不包括该5位）
 * 4位返回状态编码 2位总页码 4位总笔数 2位当前页码 2位当前也明细数 60位错误信息描述
 */
public class GXBOCBLMsgHead extends MsgHead {

	/**
	 * 机构号
	 */
	private String bank_no;

	/**
	 * 笔数
	 */
	int num;

	/**
	 * 年度
	 */
	String year;

	/**
	 * 区划
	 */
	 String admdiv_code;

	/**
	 * 凭证类型
	 */
	private String vt_type;

	/**
	 * 结算方式
	 */
	private String set_mode;

	/**
	 * 返回状态码
	 */
	private String status;

	/**
	 * 总页码
	 */
	private int total_pages;

	/**
	 * 当前页码
	 */
	private int now_page;

	/**
	 * 当前明细数
	 */
	private int page_size;

	/**
	 * 总金额
	 */
	private BigDecimal amt = BigDecimal.ZERO;
	/**
	 * 60位错误信息修复
	 */
	private String error_msg;

	public static int MSGHEADLENGTH = 99;
	public GXBOCBLMsgHead() {
		super();
	}

	/***
	 * 
	 * @Description: 请求报文头
	 * @author: 柯伟
	 * @date: 2014-5-27 上午10:36:45
	 * @param msgLen  报文长度
	 * @param tradeCode 交易码
	 * @param org_no 机构号
	 * @param operator 柜员号
	 * @param num 凭证笔数
	 * @param year  业务年度
	 * @param admdiv 行政区划
	 * @param vtType  凭证类型
	 * @param set_mode 结算方式
	 */
	public GXBOCBLMsgHead(int msgLen, String tradeCode, String org_no,
			String operator, int num, String year, String admdiv,
			String vtType, String set_mode) {
		this.msgLen = msgLen;
		this.tradeCode = tradeCode;
		this.bank_no = org_no;
		this.operator = operator;
		this.num = num;
		this.year = year;
		this.admdiv_code = admdiv;
		this.vt_type = vtType;
		this.set_mode = set_mode;
	}

	/***
	 * 拼装请求报文头
	 */
	@Override
	public byte[] readReqHead() throws IOException {
		// 数字类型补0，其他左补空格 
		ByteArrayOutputStream byteOut = new ByteArrayOutputStream();
		byteOut.write(TransUtil.getFixlenStrBytesByAddSpace(this.getMsgLen() + "",5));
		byteOut.write(TransUtil.getFixlenStrBytesByAddSpace(this.getTradeCode(), 4));
		byteOut.write(TransUtil.getFixlenStrBytesByAddSpace(this.getBank_no(), 10));
		byteOut.write(TransUtil.getFixlenStrBytesByAddSpace(this.getOperator(), 10));
		byteOut.write(TransUtil.getFixlenStrBytes(this.getNum()+"",2));
		byteOut.write(TransUtil.getFixlenStrBytesByAddSpace(this.getYear()+"",4));
		byteOut.write(TransUtil.getFixlenStrBytesByAddSpace(this.getAdmdiv_code(),9));
		byteOut.write(TransUtil.getFixlenStrBytesByAddSpace(this.getVt_type()+"", 1));
		byteOut.write(TransUtil.getFixlenStrBytesByAddSpace(this.getSet_mode() + "",1));
		return byteOut.toByteArray();
	}

	/***
	 * @Description: 响应报文头
	 * @author: 柯伟
	 * @date: 2014-5-28 上午10:31:08
	 * @param msgLen  报文长度
	 * @param returnStatus 返回状态编码
	 * @param total_pages 总页码
	 * @param num 总笔数
	 * @param now_page 当前页码
	 * @param now_pageSize 当前页明细数
	 * @param error_msg 错误信息
	 */
	public GXBOCBLMsgHead(int msgLen,String returnStatus,
			int total_pages, int num, int now_page, int now_pageSize,
			String error_msg) {
		this.msgLen = msgLen;
		this.status = returnStatus;
		this.total_pages = total_pages;
		this.num = num;
		this.now_page = now_page;
		this.page_size = now_pageSize;
		this.error_msg = error_msg;
	}
	
	public GXBOCBLMsgHead(int msgLen,String returnStatus,
			int total_pages, int num, int now_page, int now_pageSize,
			String error_msg,BigDecimal totalAmt ) {
		this.msgLen = msgLen;
		this.status = returnStatus;
		this.total_pages = total_pages;
		this.num = num;
		this.now_page = now_page;
		this.page_size = now_pageSize;
		this.error_msg = error_msg;
		this.amt = totalAmt;
	}

	/***
	 * 拼装响应报文头
	 */
	@Override
	byte[] readResHead() throws IOException {
		// 数字类型补0，其他左补空格 
		ByteArrayOutputStream byteOut = new ByteArrayOutputStream();
		byteOut.write(TransUtil.getFixlenStrBytesByAddSpace(this.getMsgLen() + "",5));
		byteOut.write(TransUtil.getFixlenStrBytes(this.getStatus(), 4));
		byteOut.write(TransUtil.getFixlenStrBytes(this.getTotal_pages()+ "", 4));
		byteOut.write(TransUtil.getFixlenStrBytes(this.getNum() + "",6));
		byteOut.write(TransUtil.getFixlenStrBytes(this.getAmt().toString(), 17));
		byteOut.write(TransUtil.getFixlenStrBytes(this.getNow_page()+ "", 4));
		byteOut.write(TransUtil.getFixlenStrBytes(this.getPage_size()+ "", 4));
		String errorMsg = this.getError_msg().trim();
		errorMsg = errorMsg.replace("#", "");
		if(errorMsg.getBytes("GBK").length>60){
			
			byte[] strByte = new byte[60];
			
			for(int i = 0;i<60;i++){
				strByte[i] = errorMsg.getBytes("GBK")[i];
			}
			errorMsg = new String(strByte,"GBK"); 
			

		}
		byteOut.write(transUtilForGXBOCTrans.getFixlenStrBytesByAddSpaceBefore(errorMsg + "", 60));
		return byteOut.toByteArray();
	}
	
	public String getBank_no() {
		return bank_no;
	}

	public void setBank_no(String bankNo) {
		bank_no = bankNo;
	}

	public int getNum() {
		return num;
	}

	public void setNum(int num) {
		this.num = num;
	}

	public String getYear() {
		return year;
	}

	public void setYear(String year) {
		this.year = year;
	}

	public String getAdmdiv_code() {
		return admdiv_code;
	}

	public void setAdmdiv_code(String admdivCode) {
		admdiv_code = admdivCode;
	}


	public BigDecimal getAmt() {
		return amt;
	}

	public void setAmt(BigDecimal amt) {
		this.amt = amt;
	}

	public String getSet_mode() {
		return set_mode;
	}

	public void setSet_mode(String setMode) {
		set_mode = setMode;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public int getTotal_pages() {
		return total_pages;
	}

	public void setTotal_pages(int totalPages) {
		total_pages = totalPages;
	}

	public int getNow_page() {
		return now_page;
	}

	public void setNow_page(int nowPage) {
		now_page = nowPage;
	}

	public int getPage_size() {
		return page_size;
	}

	public void setPage_size(int pageSize) {
		page_size = pageSize;
	}

	public String getError_msg() {
		return error_msg;
	}

	public void setError_msg(String errorMsg) {
		error_msg = errorMsg;
	}

	public String getVt_type() {
		return vt_type;
	}

	public void setVt_type(String vtType) {
		vt_type = vtType;
	}


}
