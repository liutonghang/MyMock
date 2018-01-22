package grp.pb.branch.gxboc.trans;

import grp.pt.pb.common.IBankAccountService;
import grp.pt.pb.common.model.BankAccount;
import grp.pt.pb.payment.IVoucher;
import grp.pt.pb.payment.PayClearVoucher;
import grp.pt.pb.payment.PayVoucher;
import grp.pt.pb.realpay.RealPayVoucher;
import grp.pt.pb.trans.model.MsgReqBody;
import grp.pt.pb.trans.model.TransResManager;
import grp.pt.pb.trans.util.MsgConstant;
import grp.pt.pb.trans.util.TransUtil;
import grp.pt.pb.util.ChangeUtil;
import grp.pt.pb.util.PayConstant;
import grp.pt.pb.util.StaticApplication;
import grp.pt.pb.util.TradeConstant;
import grp.pt.util.PlatformUtils;
import grp.pt.util.StringUtil;
import grp.pt.util.exception.CommonException;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;

import org.apache.log4j.Logger;
import org.eclipse.jetty.util.log.Log;


/*******************************************************************************
 *发送请求报文体【广西中行】
 * 
 * @author zhouqi
 * 
 */
public class GXBOCMsgReqBody extends MsgReqBody {
	
	private static IBankAccountService bankAccountService;
	static{
		if(bankAccountService == null){
			bankAccountService = (IBankAccountService) StaticApplication.getBean("pb.common.BankAccountService");
		}
	}
	
	
private static Logger logger = Logger.getLogger(GXBOCMsgReqBody.class);
	
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
	public GXBOCMsgReqBody(){}
	
	
	/***
	 * 
	 * @param t    凭证对象
	 * @param resManager  配置信息
	 * @param objects   参数...
	 */
	public GXBOCMsgReqBody(IVoucher t, TransResManager resManager,
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
		this.setReqHead(new GXBOCMsgHead(msgBody.length + MsgConstant.REQHEADLEN, objects[0] + "", t.getUserCode(),
				new SimpleDateFormat("yyyyMMddhhmmss").format(new Date()), t.getTransId(), 0));
	}
	

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
		//byteOut.write(TransUtil.getRegionBytes("148","付款账号","611957644862", 32));
		logger.info("付款人账号："+voucher.getPayAcctNo());
		byteOut.write(TransUtil.getRegionBytes("143","付款帐户名称",voucher.getPayAcctName(), 60));
		//byteOut.write(TransUtil.getRegionBytes("143","付款帐户名称","广西壮族自治区财政厅财政零余额帐户", 60));
		byteOut.write(TransUtil.getRegionBytes("155","付款机构",voucher.getPayAcctCode(), 10));
		byteOut.write(TransUtil.getRegionBytes("156","柜员号",voucher.getUserCode(), 20));
		logger.info("付款机构："+voucher.getPayAcctCode());
		if(StringUtil.isEmpty(voucher.getPayeeAcctNo())){
			throw new IOException("收款人账户未空");
		}
		List<BankAccount> bankaccList;
//		if(voucher instanceof PayVoucher){
//			if( TradeConstant.PAY2PAYEE == voucher.getTrade_type()&&"7".equals((String) PlatformUtils.getProperty(voucher, "pb_set_mode_code"))){
//				
//				try {
//					String admdiv_code = (String) PlatformUtils.getProperty(voucher, "admdiv_code");
//					String bank_code = (String) PlatformUtils.getProperty(voucher, "pay_account_code");
//					bankaccList = bankAccountService.loadAccounts(admdiv_code, bank_code, IBankAccountService.TYPE_INNER_HANGING_ACCOUNT);
//					if(bankaccList.size() != 0){
//						
//						byteOut.write(TransUtil.getRegionBytes("149","收款账号",bankaccList.get(0).getAccount_no(), 32));
//						logger.info("收款人账号："+ bankaccList.get(0).getAccount_no());
//						byteOut.write(TransUtil.getRegionBytes("144","收款帐户名称",bankaccList.get(0).getAccount_name(), 100));
//						
//					}
//				} catch (Exception e) {
//					
//					
//				}
//			}else if(TradeConstant.PAY2PAYEE == voucher.getTrade_type()&&"8".equals((String) PlatformUtils.getProperty(voucher, "pb_set_mode_code"))){
//				try {
//					String admdiv_code = (String) PlatformUtils.getProperty(voucher, "admdiv_code");
////					String bank_code = (String) PlatformUtils.getProperty(voucher, "pay_account_code");
//					String bank_code = "14553";
//					bankaccList = bankAccountService.loadAccounts(admdiv_code, bank_code, IBankAccountService.TYPE_SALARY_ACCOUNT);
//					if(bankaccList.size() != 0){
//						
//						byteOut.write(TransUtil.getRegionBytes("149","收款账号",bankaccList.get(0).getAccount_no(), 32));
//						logger.info("收款人账号："+voucher.getPayeeAcctNo());
//						byteOut.write(TransUtil.getRegionBytes("144","收款帐户名称",bankaccList.get(0).getAccount_name(), 100));
//						
//					}
//				} catch (Exception e) {
//					
//					
//				}
//			}else{
//				byteOut.write(TransUtil.getRegionBytes("149","收款账号",voucher.getPayeeAcctNo(), 32));
//				logger.info("收款人账号："+voucher.getPayeeAcctNo());
//				byteOut.write(TransUtil.getRegionBytes("144","收款帐户名称",voucher.getPayeeAcctName(), 100));
//				logger.info("收款人账户名称："+voucher.getPayeeAcctName());
//			}
//		}else{
//			byteOut.write(TransUtil.getRegionBytes("149","收款账号",voucher.getPayeeAcctNo(), 32));
//			logger.info("收款人账号："+voucher.getPayeeAcctNo());
//			byteOut.write(TransUtil.getRegionBytes("144","收款帐户名称",voucher.getPayeeAcctName(), 100));
//			logger.info("收款人账户名称："+voucher.getPayeeAcctName());
//		}
		//ztl 2016年9月27日18:57:04   适应中行要求，去掉公务卡、信用卡 7、 8的结算方式控制
		byteOut.write(TransUtil.getRegionBytes("149","收款账号",voucher.getPayeeAcctNo(), 32));
		logger.info("收款人账号："+voucher.getPayeeAcctNo());
		byteOut.write(TransUtil.getRegionBytes("144","收款帐户名称",voucher.getPayeeAcctName(), 100));
		logger.info("收款人账户名称："+voucher.getPayeeAcctName());
		
		//byteOut.write(TransUtil.getRegionBytes("149","收款账号","611957644862", 32));
		
		//byteOut.write(TransUtil.getRegionBytes("144","收款帐户名称","广西壮族自治区财政厅财政零余额帐户", 60));
		byteOut.write(TransUtil.getRegionBytes("145","收款帐户行名",voucher.getPayeeAcctBank(), 60));
		//getChangeType()).equals("0")?"1":"0"
		//String changeType = voucher.getChangeType();
		String realityChangeType = null;
		
		//同城同行:1 
		//异地同行:3
		//同城跨行:2
		//异地跨行:4
		//信用卡：7
		//公务卡：8
		if(voucher instanceof PayVoucher){
			if( TradeConstant.PAY2PAYEE == voucher.getTrade_type()){
				realityChangeType = (String) PlatformUtils.getProperty(voucher, "bank_setmode_code");
			}else{
				realityChangeType = "1";
			}
		}else if(voucher instanceof RealPayVoucher){
			if( TradeConstant.REALTOPAYEE == voucher.getTrade_type()){
				realityChangeType = (String) PlatformUtils.getProperty(voucher, "pb_set_mode_code");
			}else{
				realityChangeType = "1";
			}
		}else{
			String changeType = voucher.getChangeType();
			if(changeType.equals("1")){
				realityChangeType = "1";
			}else{
				realityChangeType = "2";
			}
		}
		byteOut.write(TransUtil.getRegionBytes("086","交易类型",realityChangeType, 2));
		logger.info("交易类型："+realityChangeType);
		//byteOut.write(("057"+voucher.getChangeDate()).getBytes());
		byteOut.write(TransUtil.getRegionBytes("057","交易日期",voucher.getChangeDate(), 8));
		byteOut.write(TransUtil.getRegionBytes("123","收款方支付联行号",voucher.getPayeeAcctBankNo(), 14));
		logger.info("收款行行号："+voucher.getPayeeAcctBankNo());
		byteOut.write(TransUtil.getRegionBytes("174","国库代码",voucher.getAdmdivCode(), 16));
		byteOut.write(TransUtil.getRegionBytes("111","支付令号",voucher.getVouNo(), 30));
		byteOut.write(TransUtil.getRegionBytes("087","凭证种类",voucher.getVtCode(), 9));
		byteOut.write(TransUtil.getRegionBytes("114","交易包号",voucher.getPageNo(), 30));
		byteOut.write(TransUtil.getRegionBytes("097","交易金额",voucher.getAmt(), 18));
		byteOut.write(getRegionBytes4GXBOC("154","摘要信息",voucher.getPaySummaryName(), 200));
		// 交易渠道 I：网银 A：系统自动发起 G：柜面 长度10位
		//byteOut.write(TransUtil.getRegionBytes("305","交易渠道","G", 10));
		String quDao = "G";
		Integer transCGA =  (Integer)PlatformUtils.getProperty(voucher, "is_self_counter");
		logger.info("++++++++++++++++++++++++交易渠道："+transCGA);
		if(1==transCGA){
			quDao = "I";
		}
		if(voucher  instanceof PayClearVoucher){
			quDao = "A";
		}
		byteOut.write(TransUtil.getRegionBytes("305","交易渠道",quDao, 10));
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
		byteOut.write(TransUtil.getRegionBytes("098","国库代码",voucher.getAdmdivCode(), 16));
		byteOut.write(TransUtil.getRegionBytes("099","原交易日期",String.valueOf(PlatformUtils.getProperty(voucher, "payDate")), 8));
		return byteOut.toByteArray();
	}
	/**
	 * 获取某一域的字节数组
	 * 
	 * @param regionNo
	 *            域号
	 * @param value
	 *            域值
	 * @param regionLen
	 *            域限定长度
	 * @return 域字节数组
	 * @throws IOException
	 */
	public static byte[] getRegionBytes4GXBOC(String regionNo, String regionDes,
			String value, int regionLen) throws IOException {
		if (value == null) {
			value = "";
		}
		// 保存字节流
		ByteArrayOutputStream regionOut = new ByteArrayOutputStream();

		// 3位域号字节
		byte[] regionNoBytes = ChangeUtil.stringToBytes(regionNo, 3);
		regionOut.write(regionNoBytes);
		// 域值字节
		byte[] regionDataBytes = value.getBytes("GBK");
		// 域值长度
		int len = regionDataBytes.length;
		// 域值得长度大于限定的长度
		if (len > regionLen) {
			throw new RuntimeException(regionDes + "【" + regionNo + "】的域值:"
					+ value + ",长度：" + len + " 大于该域限定长度：" + regionLen);
		}
		byte[] regionLenBytes = getFixlenStrBytes4GXBOC(len + "", 3);
		regionOut.write(regionLenBytes);
		regionOut.write(regionDataBytes);
		return regionOut.toByteArray();
	}
	/**
	 * 将字符串前补0转换成指定长度的字节数组
	 * 
	 * @param s
	 * @param len
	 * @return
	 */
	public static byte[] getFixlenStrBytes4GXBOC(String str ,int len){
		if(str==null){
			str = "";
		}
		byte[] strByte = str.getBytes();
		if(strByte.length>len){
			throw new RuntimeException("字符串["+str+"]长度："+strByte.length+"大于要转换的字节数组长度："+len);
		}
		StringBuffer sb = new StringBuffer();
		for(int i=0;i<len-strByte.length;i++){
			sb.append('0');
		}
		sb.append(str);
		return sb.toString().getBytes();
	}
}
