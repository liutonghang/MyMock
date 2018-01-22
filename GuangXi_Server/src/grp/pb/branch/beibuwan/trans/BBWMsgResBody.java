package grp.pb.branch.beibuwan.trans;

import grp.pt.pb.trans.model.MsgResBody;

import java.math.BigDecimal;

public class BBWMsgResBody extends MsgResBody {
	/**
	 * 账户余额
	 */
	private BigDecimal acctBalance;
	/**
	 * 返回错误码
	 */
	private String resCode;
	/**
     * 账户户名
     */
    private String acctName;
	/**
	 * 流水文件名 ，也是柜员文件
	 */
	private String fileName;
	/**
	 * 网点文件
	 */
	private String fileName1;
	/**
	 * 交易结果  0：成功   1：失败   2：没收到  3：状态不确定
	 */
    private Integer result = 1;
	/**
	 * 柜员流水，用于打印传票
	 */
    private String UserSerial;

	public String getUserSerial() {
		return UserSerial;
	}

	public void setUserSerial(String userSerial) {
		UserSerial = userSerial;
	}

	public Integer getResult() {
		return result;
	}

	public void setResult(Integer result) {
		this.result = result;
	}

	public String getAcctName() {
		return acctName;
	}

	public void setAcctName(String acctName) {
		this.acctName = acctName;
	}



	public BigDecimal getAcctBalance() {
		return acctBalance;
	}

	public void setAcctBalance(BigDecimal acctBalance) {
		this.acctBalance = acctBalance;
	}

	public String getFileName() {
		return fileName;
	}

	public void setFileName(String fileName) {
		this.fileName = fileName;
	}
	public String getFileName1() {
		return fileName1;
	}
	public void setFileName1(String fileName1) {
		this.fileName1 = fileName1;
	}
	public String getResCode() {
		return resCode;
	}

	public void setResCode(String resCode) {
		this.resCode = resCode;
	}



	@Override
	public byte[] readResMsgBody() throws Exception {
		// TODO Auto-generated method stub
		return null;
	}

}
