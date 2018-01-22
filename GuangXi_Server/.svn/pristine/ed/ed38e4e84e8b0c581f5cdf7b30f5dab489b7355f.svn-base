package grp.pb.branch.gxboc.service;

import java.io.IOException;
import java.math.BigDecimal;

/***
 * 响应报文体
 * @author zhouqi
 *
 */
public abstract class MsgResBody {

	//转账类型
	private String tranType;

	// 属性数组 ...公共不确定的属性
	private Object[] objs;
	
	//状态
	private int resStatus;

	//响应消息
	private String resMsg;

	//交易流水号
	private String transId;

	//文件名称
	private String filePath;

	//响应报文头
	private MsgHead resHead;
	
	/***
	 * 无参构造方法
	 */
	public MsgResBody() {}
	
	/***
	 * 构造方法
	 * 
	 * @param t
	 * @param objects
	 */
	public MsgResBody(Object... objects) {
		this.objs = objects;
	}


	/***************************************************************************
	 * 响应报文头
	 * 
	 * @return
	 */
	public byte[] readResHead() throws IOException {
		return resHead.readResHead();
	}

	/***************************************************************************
	 * 响应报文体
	 * 
	 * @return
	 */
	public abstract byte[] readResMsgBody() throws Exception;
	
	
//	/*************************行号查询 ******************/
//	//收款人账号
//	public String payeeAcctNo;
//	//收款人开户行名称
//	public String payeeAcctBankName;
//	
//	/*************************转账 ******************/
//	//核心记帐日期YYYYMMDD
//	public String transDate;
//	//核心记帐流水号
//	public String bankTransId;
//	
//	
//	/*************************指定日期查询流水 ******************/
//	//总成功笔数
//	public int succCount;
//	//总成功金额
//	public BigDecimal  succAmt;
//	
//	/*************************指定日期查询待清算授权支付凭证信息 ******************/
//	//主单文件名称
//	public String billFileName;
//	//明细单文件名称
//	public String detailFileName;
	
	//交易信息
	public static class SerialNo {

		public SerialNo() {}

		private String transId;

		private String payeeAcctNo;

		private String payAcctNo;

		private BigDecimal transAmt;

		private int transResult;
		//借贷标志
		private String lendSign;
		//冲正标志
		private String czSign;
		//对方账户
		private String recipAccount;
		//交易金额
		private String tradeAmount;
		//对方账户名称
		private String recipAccountName;
		//对方开户行名称
		private String recipAccountBankName;
		//交易日期
		private String tradeDate;
		//对方开户行行号
		private String recipAccountBankNo;
		//凭证代号
		private String payVoucherNo;
		//判断标志位
		private String bcSign;
		
		public String getBcSign() {
			return bcSign;
		}

		public void setBcSign(String bcSign) {
			this.bcSign = bcSign;
		}

		public String getPayVoucherNo() {
			return payVoucherNo;
		}

		public void setPayVoucherNo(String payVoucherNo) {
			this.payVoucherNo = payVoucherNo;
		}

		public String getTradeAmount() {
			return tradeAmount;
		}

		public void setTradeAmount(String tradeAmount) {
			this.tradeAmount = tradeAmount;
		}

		public String getRecipAccountName() {
			return recipAccountName;
		}

		public void setRecipAccountName(String recipAccountName) {
			this.recipAccountName = recipAccountName;
		}

		public String getRecipAccountBankName() {
			return recipAccountBankName;
		}

		public void setRecipAccountBankName(String recipAccountBankName) {
			this.recipAccountBankName = recipAccountBankName;
		}

		public String getTradeDate() {
			return tradeDate;
		}

		public void setTradeDate(String tradeDate) {
			this.tradeDate = tradeDate;
		}

		public String getRecipAccountBankNo() {
			return recipAccountBankNo;
		}

		public void setRecipAccountBankNo(String recipAccountBankNo) {
			this.recipAccountBankNo = recipAccountBankNo;
		}

		public String getRecipAccount() {
			return recipAccount;
		}

		public void setRecipAccount(String recipAccount) {
			this.recipAccount = recipAccount;
		}

		public String getLendSign() {
			return lendSign;
		}

		public void setLendSign(String lendSign) {
			this.lendSign = lendSign;
		}

		public String getCzSign() {
			return czSign;
		}

		public void setCzSign(String czSign) {
			this.czSign = czSign;
		}

		public String getTransId() {
			return transId;
		}

		public void setTransId(String transId) {
			this.transId = transId;
		}

		public String getPayeeAcctNo() {
			return payeeAcctNo;
		}

		public void setPayeeAcctNo(String payeeAcctNo) {
			this.payeeAcctNo = payeeAcctNo;
		}

		public String getPayAcctNo() {
			return payAcctNo;
		}

		public void setPayAcctNo(String payAcctNo) {
			this.payAcctNo = payAcctNo;
		}

		public BigDecimal getTransAmt() {
			return transAmt;
		}

		public void setTransAmt(BigDecimal transAmt) {
			this.transAmt = transAmt;
		}

		public int getTransResult() {
			return transResult;
		}

		public void setTransResult(int transResult) {
			this.transResult = transResult;
		}
	}

	
	
//	/*************************交易状态查询 ******************/
//	//交易结果标志 0：成功   1：失败   2：没收到  3：状态不确定
//	public int responseStatus = 3;
//
//	/*************************指定账户查询余额 ******************/
//	//帐户余额
//	public BigDecimal acctAmt;
//	
//	/*************************用户登录获取验证码 ******************/
//	public String verifyCode;
//	
//	
//	/**************************公用的字段************************/
//	//响应信息
//	public String responseMsg;
//	
//	//文件路径
//	public String filePath;
//	
//	//交易流水号
//	public String transId;
	
//	public String getResponseMsg() {
//		return responseMsg;
//	}
//
//	public String getPayeeAcctNo() {
//		return payeeAcctNo;
//	}
//
//	public void setPayeeAcctNo(String payeeAcctNo) {
//		this.payeeAcctNo = payeeAcctNo;
//	}
//
//	public String getPayeeAcctBankName() {
//		return payeeAcctBankName;
//	}
//
//	public void setPayeeAcctBankName(String payeeAcctBankName) {
//		this.payeeAcctBankName = payeeAcctBankName;
//	}
//
//	public String getTransDate() {
//		return transDate;
//	}
//
//	public void setTransDate(String transDate) {
//		this.transDate = transDate;
//	}
//
//	public String getBankTransId() {
//		return bankTransId;
//	}
//
//	public void setBankTransId(String bankTransId) {
//		this.bankTransId = bankTransId;
//	}
//
//	public int getSuccCount() {
//		return succCount;
//	}
//
//	public void setSuccCount(int succCount) {
//		this.succCount = succCount;
//	}
//
//	public BigDecimal getSuccAmt() {
//		return succAmt;
//	}
//
//	public void setSuccAmt(BigDecimal succAmt) {
//		this.succAmt = succAmt;
//	}
//
//	public int getResponseStatus() {
//		return responseStatus;
//	}
//
//	public void setResponseStatus(int responseStatus) {
//		this.responseStatus = responseStatus;
//	}
//
//	public BigDecimal getAcctAmt() {
//		return acctAmt;
//	}
//
//	public void setAcctAmt(BigDecimal acctAmt) {
//		this.acctAmt = acctAmt;
//	}
//
//	public String getVerifyCode() {
//		return verifyCode;
//	}
//
//	public void setVerifyCode(String verifyCode) {
//		this.verifyCode = verifyCode;
//	}
//
//	public void setResponseMsg(String responseMsg) {
//		this.responseMsg = responseMsg;
//	}
//
//	public String getFilePath() {
//		return filePath;
//	}
//
//	public void setFilePath(String filePath) {
//		this.filePath = filePath;
//	}
//
//	public String getTransId() {
//		return transId;
//	}
//
//	public void setTransId(String transId) {
//		this.transId = transId;
//	}
//
//	public String getBillFileName() {
//		return billFileName;
//	}
//
//	public void setBillFileName(String billFileName) {
//		this.billFileName = billFileName;
//	}
//
//	public String getDetailFileName() {
//		return detailFileName;
//	}
//
//	public void setDetailFileName(String detailFileName) {
//		this.detailFileName = detailFileName;
//	}
	
	public String getTranType() {
		return tranType;
	}

	public void setTranType(String tranType) {
		this.tranType = tranType;
	}

	public Object[] getObjs() {
		return objs;
	}

	public void setObjs(Object[] objs) {
		this.objs = objs;
	}
	
	public MsgHead getResHead() {
		return resHead;
	}

	public void setResHead(MsgHead resHead) {
		this.resHead = resHead;
	}
	
	public int getResStatus() {
		return resStatus;
	}

	public void setResStatus(int resStatus) {
		this.resStatus = resStatus;
	}

	public String getResMsg() {
		return resMsg;
	}

	public void setResMsg(String resMsg) {
		this.resMsg = resMsg;
	}

	public String getTransId() {
		return transId;
	}

	public void setTransId(String transId) {
		this.transId = transId;
	}

	public String getFilePath() {
		return filePath;
	}

	public void setFilePath(String filePath) {
		this.filePath = filePath;
	}

}
