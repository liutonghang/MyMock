package grp.pb.branch.trans;

import grp.pt.pb.payment.IVoucher;
import grp.pt.pb.payment.PayRequest;
import grp.pt.pb.trans.model.MsgReqBody;
import grp.pt.pb.trans.model.TransResManager;
import grp.pt.pb.trans.util.MsgConstant;
import grp.pt.pb.trans.util.TransUtil;
import grp.pt.util.PlatformUtils;
import grp.pt.util.exception.CommonException;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;

import org.apache.log4j.Logger;
import org.eclipse.jetty.util.log.Log;


/*******************************************************************************
 *发送请求报文体【广西建行】
 * 
 * @author FWQ
 * 
 */
public class GXCCBMsgReqBody extends MsgReqBody {
	
private static Logger logger = Logger.getLogger(GXCCBMsgReqBody.class);
	
	// 当前请求报文体
	private byte[] msgBody;
	
	/**
	 * 获取请求报文体
	 */
	public byte[] readReqMsgBody() {
		return msgBody;
	}
	
	/***
	 * 无参构造方法
	 */
	public GXCCBMsgReqBody(){}
	
	
	/***
	 * 
	 * @param t    凭证对象
	 * @param resManager  配置信息
	 * @param objects   参数...
	 */
	public GXCCBMsgReqBody(IVoucher t, TransResManager resManager,
			Object... objects) {
		super(t, resManager, objects);
		if(objects==null || objects.length==0 || objects[0]==null){
			throw new CommonException("凭证类型不能为空！"); 
		}
		// 第一个参数是转账类型
		this.setTranType(objects[0].toString());
		// 除了凭证信息，接口传的参数
		Object[] objs = new Object[objects.length - 1];
		for (int i = 1; i < objects.length; i++) {
			objs[i - 1] = objects[i];
		}
		// 转账
		if (this.getTranType().equalsIgnoreCase(MsgConstant.PAYTRANS_TRACODE)) {
			try {
				this.msgBody = transBytes();
			} catch (IOException e) {
				throw new CommonException("拼装转账请求报文体失败,原因：" + e.getMessage()); 
			}
		// 查询交易结果
		}else if(this.getTranType().equalsIgnoreCase(MsgConstant.QUERY_TRADESTATUS_TRACODE)){
			try {
				this.msgBody = queryTransBytes();
			} catch (IOException e) {
				throw new CommonException("拼装交易状态查询请求报文体失败,原因：" + e.getMessage()); 
			}
		//指定账户查询余额
		}else if(this.getTranType().equalsIgnoreCase(MsgConstant.QUERY_ACCTBALANCE_TRACODE)){
			try {
				this.msgBody = queryAcctAmtBytes();
			} catch (IOException e) {
				throw new CommonException("拼装指定账户查询余额请求报文体失败,原因：" + e.getMessage()); 
			}
		//指定日期查询流水
		}else if(this.getTranType().equalsIgnoreCase(MsgConstant.QUERY_BANKFLOW_TRACODE)){
			try {
				this.msgBody = querySerialnoBytes();
			} catch (IOException e) {
				throw new CommonException("拼装指定日期查询流水请求报文体失败,原因：" + e.getMessage()); 
			}
		//行号查询
		}else if (this.getTranType().equalsIgnoreCase(MsgConstant.QUERY_BANKNOLIST_TRACODE)){
			try {
				this.msgBody = queryBanksBytes();
			} catch (IOException e) {
				throw new CommonException("拼装行号查询请求报文体失败,原因：" + e.getMessage()); 
			}
		}else if(objects[0].equals(MsgConstant.QUERY_QUYPAY)){
			try {
				this.msgBody = queryPayDetail();
			} catch (IOException e) {
				throw new CommonException("拼装XXX请求报文体失败,原因：" + e.getMessage()); 
			}
		}
		
		this.setReqHead(new GXCCBMsgHead(msgBody.length + MsgConstant.REQHEADLEN, objects[0] + "", t.getUserCode(),
				new SimpleDateFormat("yyyyMMddhhmmss").format(new Date()), t.getTransId(), 0));
	}
	
	
//	/***************************************************************************
//	 * 
//	 * @param sc
//	 *            会话信息
//	 * @param o
//	 *            对象
//	 * @param transType
//	 *            交易码
//	 * @param queryDate
//	 * 			 查询日期
//	 * @param payeeAcctNo
//	 * 		 	 收款行帐号
//	 * @param payeeAcctBankName
//	 * 			 收款人开户行名称
//	 */
//	public GXCCBMsgReqBody(Object o, String userCode, String transType,String queryDate,String payeeAcctNo,String payeeAcctBankName,String admdiv_code,String vt_code) {
//		super(o, userCode, transType,queryDate,payeeAcctNo,payeeAcctBankName);
//		this.admdiv_code=admdiv_code;
//		this.vt_code=vt_code;
//		if(transType.equalsIgnoreCase(MsgConstant.QUERY_QUYPAY)){
//			try {
//				this.msgBody = queryPayDetail();
//			} catch (IOException e) {
//				throw new CommonException("拼装XXX请求报文体失败,原因：" + e.getMessage()); 
//			}
//			this.setReqHead(new GXCCBMsgHead(msgBody.length+ MsgConstant.REQHEADLEN, MsgConstant.QUERY_QUYPAY, 
//					userCode,now ,"0"));
//		//行号查询
//		}
//	}

	 /***********************************************************************
	 * 指定待清算授权支付凭证信息
	 * 
	 * @return
	 * @throws IOException
	 */
	private byte[] queryPayDetail() throws IOException {
		ByteArrayOutputStream byteOut = new ByteArrayOutputStream();
		byteOut.write(TransUtil.getRegionBytes("057","查询日期",this.getObjs()[0].toString(), 8));
		byteOut.write(TransUtil.getRegionBytes("174","国库代码",this.getObjs()[1].toString(), 16));
		byteOut.write(TransUtil.getRegionBytes("087","凭证种类",this.getObjs()[2].toString(), 9));
		return byteOut.toByteArray();
	}

	 /***********************************************************************
		 * 指定账户查询余额指定账户查询余额
		 * 
		 * @return
		 * @throws IOException
		 */
	private byte[] querySerialnoBytes() throws IOException {
		ByteArrayOutputStream byteOut = new ByteArrayOutputStream();
		byteOut.write(TransUtil.getRegionBytes("057","查询日期",this.getObjs()[1].toString(), 8));
		byteOut.write(TransUtil.getRegionBytes("174","国库代码",voucher.getAdmdivCode(), 16));
		byteOut.write(TransUtil.getRegionBytes("087","凭证种类",voucher.getVtCode(), 9));
		return byteOut.toByteArray();
	}
	
	/***************************************************************************
	 * 指定账户查询余额指定账户查询余额
	 * 
	 * @return
	 * @throws IOException
	 */
	private byte[] queryAcctAmtBytes() throws IOException {
		ByteArrayOutputStream byteOut = new ByteArrayOutputStream();
		byteOut.write(TransUtil.getRegionBytes("148","账号",voucher.getPayAcctNo(), 32));
		return byteOut.toByteArray();
	}
	

	/***
	 * 行号请求报文体
	 * @return
	 * @throws IOException
	 */
	private byte[] queryBanksBytes() throws IOException {
		ByteArrayOutputStream byteOut = new ByteArrayOutputStream();
		byteOut.write(TransUtil.getRegionBytes("148","收款人账号",voucher.getPayeeAcctNo(), 32));
		byteOut.write(TransUtil.getRegionBytes("145","收款人开户行名称",voucher.getPayeeAcctBank(), 60));
		return byteOut.toByteArray();
	}

	/***************************************************************************
	 * 转账请求报文体
	 * 
	 * @return
	 */
	private byte[] transBytes() throws IOException {
		ByteArrayOutputStream byteOut = new ByteArrayOutputStream();
		byteOut.write(TransUtil.getRegionBytes("148","付款账号",voucher.getPayAcctNo(), 32));
		logger.info("付款人账号："+voucher.getPayAcctNo());
		byteOut.write(TransUtil.getRegionBytes("143","付款帐户名称",voucher.getPayAcctName(), 60));
		byteOut.write(TransUtil.getRegionBytes("155","付款机构",voucher.getPayAcctCode(), 10));
		logger.info("付款机构："+voucher.getPayAcctCode());
		byteOut.write(TransUtil.getRegionBytes("149","收款账号",voucher.getPayeeAcctNo(), 32));
		logger.info("收款人账号："+voucher.getPayeeAcctNo());
		byteOut.write(TransUtil.getRegionBytes("144","收款帐户名称",voucher.getPayeeAcctName(), 60));
		byteOut.write(TransUtil.getRegionBytes("145","收款帐户行名",voucher.getPayeeAcctBank(), 60));
		byteOut.write(TransUtil.getRegionBytes("086","交易类型",(voucher.getChangeType()).equals("0")?"1":"0", 2));
		logger.info("交易类型："+voucher.getChangeType());
		//byteOut.write(("057"+voucher.getChangeDate()).getBytes());
		byteOut.write(TransUtil.getRegionBytes("057","交易日期",voucher.getChangeDate(), 8));
		byteOut.write(TransUtil.getRegionBytes("123","收款方支付联行号",voucher.getPayeeAcctBankNo(), 14));
		logger.info("收款行行号："+voucher.getPayeeAcctBankNo());
		byteOut.write(TransUtil.getRegionBytes("174","国库代码",voucher.getAdmdivCode(), 16));
		byteOut.write(TransUtil.getRegionBytes("111","支付令号",voucher.getVouNo(), 30));
		byteOut.write(TransUtil.getRegionBytes("087","凭证种类",voucher.getVtCode(), 9));
		byteOut.write(TransUtil.getRegionBytes("114","交易包号",voucher.getPageNo(), 30));
		byteOut.write(TransUtil.getRegionBytes("097","交易金额",voucher.getAmt(), 18));
		if(voucher instanceof PayRequest){
			byteOut.write(TransUtil.getRegionBytes("154","摘要信息",((PayRequest) voucher).getRemark(), 60));

		}else {
			byteOut.write(TransUtil.getRegionBytes("154","摘要信息",voucher.getPaySummaryName(), 60));
		}
		// 交易渠道 I：网银 A：系统自动发起 G：柜面 长度10位
		byteOut.write(TransUtil.getRegionBytes("305","交易渠道","G", 10));
		//添加银行业务类型，转账为1，其余为0
		/**
		 * 使用反射获取对象，避免IVoucher.java的修改
		 * edit by liutianlong 2016年7月28日
		 */
		/*int business_type = (Integer) PlatformUtils.getProperty(voucher, "business_type");
		if(business_type == 1){
			byteOut.write(TransUtil.getRegionBytes("666","银行业务类型",String.valueOf(PlatformUtils.getProperty(voucher, "bankbusinesstype")), 1));
		}else{
			byteOut.write(TransUtil.getRegionBytes("666","银行业务类型","0", 1));
		}*/
		return byteOut.toByteArray();
	}
	
	
	/***************************************************************************
	 * 交易状态查询
	 * 
	 * @return
	 */
	private byte[] queryTransBytes() throws IOException {
		ByteArrayOutputStream byteOut = new ByteArrayOutputStream();
		byteOut.write(TransUtil.getRegionBytes("087","原凭证种类",voucher.getVtCode(), 9));
		byteOut.write(TransUtil.getRegionBytes("120","原交易流水号",voucher.getTransId(), 20));
		byteOut.write(TransUtil.getRegionBytes("148","原付款人账号",voucher.getPayAcctNo(), 32));
		byteOut.write(TransUtil.getRegionBytes("149","原收款人账号",voucher.getPayeeAcctNo(), 32));
		byteOut.write(TransUtil.getRegionBytes("097","原交易金额",voucher.getAmt(), 18));
		return byteOut.toByteArray();
	}
}
