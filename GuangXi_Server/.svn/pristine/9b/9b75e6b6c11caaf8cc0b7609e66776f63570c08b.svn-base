package grp.pt.pb.payment.impl;

import static grp.pt.pb.util.PayConstant.BILL_TYPE_PAY_ACCOUNT_NOTE;
import static grp.pt.pb.util.PayConstant.BILL_TYPE_PAY_REQUEST;
import static grp.pt.pb.util.PayConstant.BILL_TYPE_PAY_VOUCHER;
import static grp.pt.pb.util.PayConstant.WORK_FLOW_DISCARD;
import static grp.pt.pb.util.PayConstant.WORK_FLOW_NEXT;
import grp.pt.bill.BillEngine;
import grp.pt.bill.BillType;
import grp.pt.bill.BillTypeNotFoundException;
import grp.pt.bill.BillTypes;
import grp.pt.bill.Billable;
import grp.pt.bill.BizType;
import grp.pt.bill.BizTypes;
import grp.pt.bill.CheckFailException;
import grp.pt.bill.ConditionObj;
import grp.pt.bill.ConditionPartObj;
import grp.pt.bill.DaoSupport;
import grp.pt.bill.Paging;
import grp.pt.bill.ReturnPage;
import grp.pt.borm.model.ObjectAttrDTO;
import grp.pt.common.model.ElementDTO;
import grp.pt.database.SQLUtil;
import grp.pt.database.SimpleObjectUtils;
import grp.pt.database.sql.Eq;
import grp.pt.database.sql.Field;
import grp.pt.database.sql.Gt;
import grp.pt.database.sql.In;
import grp.pt.database.sql.Lt;
import grp.pt.database.sql.NativeSQL;
import grp.pt.database.sql.OrderBy;
import grp.pt.database.sql.Select;
import grp.pt.database.sql.Set;
import grp.pt.database.sql.SqlGenerator;
import grp.pt.database.sql.Table;
import grp.pt.database.sql.Where;
import grp.pt.idgen.IdGen;
import grp.pt.pb.assp.AsspOperator;
import grp.pt.pb.assp.AsspOperatorAdapter;
import grp.pt.pb.assp.handler.XmlAssembleHandler;
import grp.pt.pb.assp.handler.XmlConstant;
import grp.pt.pb.common.BalanceService;
import grp.pt.pb.common.IBankAccountService;
import grp.pt.pb.common.IBankNoService;
import grp.pt.pb.common.IBaseBizService;
import grp.pt.pb.common.IFinService;
import grp.pt.pb.common.INetworkService;
import grp.pt.pb.common.IPbConfigService;
import grp.pt.pb.common.IPbLogService;
import grp.pt.pb.common.impl.BankAccountValueSetUtil;
import grp.pt.pb.common.impl.CommonMethod;
import grp.pt.pb.common.impl.PayCommonService;
import grp.pt.pb.common.model.BankAccount;
import grp.pt.pb.common.model.BanknetzDTO;
import grp.pt.pb.exception.FinIsinDayException;
import grp.pt.pb.exception.PbException;
import grp.pt.pb.job.EVoucherAnalytic;
import grp.pt.pb.job.MyThreadPoolExecutor;
import grp.pt.pb.officialcard.OfficalCardConsumer;
import grp.pt.pb.officialcard.OfficalCardConsumerDetail;
import grp.pt.pb.officialcard.abc.AutoImportOfficalCardConsumerJop;
import grp.pt.pb.payment.BatchReqMoneyVoucher;
import grp.pt.pb.payment.IPbBalanceService;
import grp.pt.pb.payment.PayAccountNote;
import grp.pt.pb.payment.PayClearVoucher;
import grp.pt.pb.payment.PayDaily;
import grp.pt.pb.payment.PayRequest;
import grp.pt.pb.payment.PayService;
import grp.pt.pb.payment.PayVoucher;
import grp.pt.pb.payment.PbRefReqVoucher;
import grp.pt.pb.payment.RefundSerial;
import grp.pt.pb.payment.RrefundVoucherDTO;
import grp.pt.pb.payment.WriteoffVoucher;
import grp.pt.pb.trans.ITransService;
import grp.pt.pb.trans.ex.PbTransBusinessException;
import grp.pt.pb.trans.ex.PbTransException;
import grp.pt.pb.trans.ex.PbTransSucceedException;
import grp.pt.pb.trans.ex.PbTransUnKnownException;
import grp.pt.pb.trans.model.MsgResBody.SerialNo;
import grp.pt.pb.trans.model.TransReturnDTO;
import grp.pt.pb.util.Base64;
import grp.pt.pb.util.BillUtils;
import grp.pt.pb.util.ChangeUtil;
import grp.pt.pb.util.ConditionObjUtils;
import grp.pt.pb.util.ElementUtil;
import grp.pt.pb.util.NormalCaculate;
import grp.pt.pb.util.PayConstant;
import grp.pt.pb.util.PbIdGen;
import grp.pt.pb.util.PbParaConstant;
import grp.pt.pb.util.PbParameters;
import grp.pt.pb.util.PbUtil;
import grp.pt.pb.util.StaticApplication;
import grp.pt.pb.util.TimeCalculator;
import grp.pt.pb.util.TradeConstant;
import grp.pt.pb.util.VoucherStatus;
import grp.pt.pb.util.VtConstant;
import grp.pt.pb.util.XMLVoucherBody;
import grp.pt.util.BaseDAO;
import grp.pt.util.CollectionUtils;
import grp.pt.util.ComplexMapper;
import grp.pt.util.DateTimeUtils;
import grp.pt.util.DateUtil;
import grp.pt.util.ListUtils;
import grp.pt.util.NumberUtil;
import grp.pt.util.Parameters;
import grp.pt.util.PlatformUtils;
import grp.pt.util.StringUtil;
import grp.pt.util.exception.CommonException;
import grp.pt.util.model.Session;
import grp.pt.util.transation.ISmalTrans;
import grp.pt.util.transation.ISmallTransService;
import grp.pt.workflow.IWorkflowRunService;
import grp.pt.workflow.core.WorkflowException;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.lang.reflect.InvocationTargetException;
import java.math.BigDecimal;
import java.net.SocketTimeoutException;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeSet;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;

import org.apache.log4j.Logger;
import org.springframework.jdbc.core.RowMapper;

/**
 * 支付管理实现类
 * 
 * @author YY
 * @version 2011/5/31
 */
public class PayServiceImpl implements PayService {

	private static Logger log = Logger.getLogger(PayServiceImpl.class);

	/**
	 * 额度修改组件
	 */
	private BalanceService balanceService = null;

	/**
	 * 数据库底层组件
	 */
	private DaoSupport daoSupport = null;

	private BaseDAO baseDao;

	/**
	 * 工作流引擎
	 */
	private IWorkflowRunService workflow = null;

	/**
	 * 基础业务类
	 */
	private IBaseBizService baseBizService;

	private IPbConfigService configService = null;

	private ISmalTrans smallTrans;

	/**
	 * 银行账户服务接口
	 */
	private IBankAccountService bankAccountService;

	/**
	 * 银行接口
	 */
	private ITransService transService;
	/**
	 * 财政操作
	 */

	private IFinService finService;
	
	private BillEngine billEngine;
	
	private IPbLogService logService;
	
	private PayCommonService payCommonService;

	public BillEngine getBillEngine() {
		return billEngine;
	}
	
	public PayCommonService getPayCommonService() {
		return payCommonService;
	}

	public void setPayCommonService(PayCommonService payCommonService) {
		this.payCommonService = payCommonService;
	}
	
	public IPbLogService getLogService() {
		return logService;
	}

	public void setLogService(IPbLogService logService) {
		this.logService = logService;
	}

	public IFinService getFinService() {
		return finService;
	}

	public void setFinService(IFinService finService) {
		this.finService = finService;
	}
	
	/**
	 * 补充行号
	 */
	private IBankNoService bankNoService;

	private IPbBalanceService pbBalanceService;
	
	public IPbBalanceService getPbBalanceService() {
		return pbBalanceService;
	}

	public void setPbBalanceService(IPbBalanceService pbBalanceService) {
		this.pbBalanceService = pbBalanceService;
	}

	public IBankNoService getBankNoService() {
		return bankNoService;
	}

	public void setBankNoService(IBankNoService bankNoService) {
		this.bankNoService = bankNoService;
	}
	
	private  INetworkService netWorkService ;
	
	public INetworkService getNetWorkService() {
		return netWorkService;
	}

	public void setNetWorkService(INetworkService netWorkService) {
		this.netWorkService = netWorkService;
	}
	
	public ReturnPage loadRefReqVouchers(Session sc, List<String> fieldNames,
			ConditionObj obj, Paging page) {
		
		long billTypeId = Parameters.getLongParameter(PayConstant.BILL_TYPE_REFREQVOUCHER);
		
		return payCommonService.loadPageDataByBillType(sc,fieldNames,obj,page,billTypeId);

	}

	/**
	 * 加载凭证列表
	 */
	public ReturnPage loadPayVouchers(Session sc, List<String> fieldNames,
			ConditionObj obj, Paging page) {
		long billTypeId = Parameters.getLongParameter(PayConstant.BILL_TYPE_PAY_VOUCHER);
		return payCommonService.loadPageDataByBillType(sc,fieldNames,obj,page,billTypeId);
	}
	
	/**
	 * 加载入账通知单列表
	 */
	public ReturnPage loadAccountNotes(Session sc, List<String> fieldNames,
			ConditionObj obj, Paging page) {
		long billTypeId = Parameters.getLongParameter(
				PayConstant.BILL_TYPE_PAY_ACCOUNT_NOTE);
		return payCommonService.loadPageDataByBillType(sc,fieldNames,obj,page,billTypeId);
	}

	
	
	/**
	 * 加载历史入账通知单列表
	 */
	public ReturnPage loadAccountNoteHis(Session sc, List<String> fieldNames,
			ConditionObj obj, Paging page) {
		return payCommonService.loadPageDataByBillType(sc,fieldNames,obj,page,20);
	}
	
	/**
	 * 加载支出日报列表
	 */
	public ReturnPage loadPayDailies(Session sc, List<String> fieldNames,
			ConditionObj obj, Paging page) {
		long billTypeId = Parameters.getLongParameter(
				PayConstant.BILL_TYPE_PAY_CLEAR_DAILY);
		return payCommonService.loadPageDataByBillType(sc,fieldNames,obj,page,billTypeId);
	}

	/**
	 * 加载划款单列表
	 */
	public ReturnPage loadClearVouchers(Session sc, List<String> fieldNames,
			ConditionObj obj, Paging page) {
		long billTypeId = Parameters.getLongParameter(
				PayConstant.BILL_TYPE_PAY_CLEAR_VOUCHER);
		return payCommonService.loadPageDataByBillType(sc,fieldNames,obj,page,billTypeId);

	}

	/**
	 * 加载冲销列表
	 */
	public ReturnPage loadWriteoffVouchers(Session sc, List<String> fieldNames,
			ConditionObj obj, Paging page) {
		return payCommonService.loadPageDataByBillType(sc,fieldNames,obj,page,18);

	}
	@Override
	public ReturnPage loadRefundVouchers(Session sc, List<String> fieldNames,
			ConditionObj obj, Paging page) {
		// TODO Auto-generated method stub
		long billTypeId = Parameters.getLongParameter(PayConstant.BILL_TYPE_REFUND_SERIAL);
		return payCommonService.loadPageDataByBillType(sc,fieldNames,obj,page,billTypeId);
		
	}
	/**
	 * 加载明细列表
	 */
	public ReturnPage loadPayReqs(Session sc, List<String> fieldNames,
			ConditionObj obj, Paging page) {
		long billTypeId = Parameters.getLongParameter(PayConstant.BILL_TYPE_PAY_REQUEST);
		return payCommonService.loadPageDataByBillType(sc,fieldNames,obj,page,billTypeId);
		
	}
	
	public ReturnPage loadClearQuotaNotes(Session sc, List<String> fieldNames,
			ConditionObj obj, Paging page) {
		long billTypeId = Parameters.getLongParameter(
				PayConstant.BILL_TYPE_PAY_CLEAR_QUOTA_NOTE);
		return payCommonService.loadPageDataByBillType(sc,fieldNames,obj,page,billTypeId);
	}

	/**
	 * 加载内部清算单列表
	 */
	public ReturnPage loadInClearVouchers(Session sc, List<String> fieldNames, ConditionObj obj, Paging page) {
		long billTypeId = Parameters.getLongParameter(PayConstant.BILL_TYPE_PAY_IN_CLEAR_VOUCHER);
		return payCommonService.loadPageDataByBillType(sc,fieldNames,obj,page,billTypeId);

 	}
	
	/**
	 * 银行对账查询
	 * @throws Exception 
	 */
	public ReturnPage queryhisSerialno(Session sc, List<String> fieldsNames,
			ConditionObj obj, Paging page) {
		// TODO Auto-generated method stub
		long billTypeId = Parameters.getLongParameter(PayConstant.BILL_TYPE_PAY_VOUCHER);
		Where where = new Where();
		SQLUtil.addCondition(where, obj);
		OrderBy order = SQLUtil.convertOrder(obj);
		List<PayVoucher> payVoucherList = (List<PayVoucher>) billEngine.loadBillByBillType(sc, billTypeId,
				fieldsNames, where, order, page);
		
		for(PayVoucher payVoucher : payVoucherList){
			String reconciliation_flag = payVoucher.getReconciliation_flag();
			if(reconciliation_flag.equals("1")){
				payVoucher.setReconciliation_flag("对账成功");
			}else if(reconciliation_flag.equals("2")){
				payVoucher.setReconciliation_flag("对账失败");
			}else if(reconciliation_flag.equals("0")){
				payVoucher.setReconciliation_flag("未对账");
			}
		}
		ReturnPage returnpage = new ReturnPage(payVoucherList,page);
		return returnpage;
	}
	

	
	public List<PayVoucher> loadPayVoucherByObj(Session sc, ConditionObj obj) {
		long billTypeId = Parameters.getLongParameter(PayConstant.BILL_TYPE_PAY_VOUCHER);
		Where where = new Where();
		SQLUtil.addCondition(where, obj);
		OrderBy order = SQLUtil.convertOrder(obj);
		return (List<PayVoucher>) billEngine.loadBillByBillType(sc, billTypeId,
				new ArrayList<String>(), where, order, null);
	}
	
	@Override
	public List<PayRequest> loadPayRequestByAgencyCode(Session sc,String agencyCode, String admdivCode,String payRefundFlage) {
		long billTypeId = Parameters.getLongParameter( BILL_TYPE_PAY_REQUEST);
		Where where = new Where().addLogic(SimpleObjectUtils.ONE_EQUALS_ONE);
		where.and(new Eq("agency_code","'"+agencyCode+"'")).and(new Eq("admdiv_code","'"+admdivCode+"'"))
				.and(new Eq("year",String.valueOf(sc.getBusiYear())));
		where.addLogic(new NativeSQL(" and pay_type_code like '"+ConditionObjUtils.parsePayType(sc, admdivCode, "2")+"%'"));
		if(!StringUtil.isTrimEmpty(payRefundFlage)){
			if("1".equals(payRefundFlage)){
				where.and(new Gt("pay_amount",0));
				where.addLogic(new NativeSQL(" and exists (select 1 from pb_pay_voucher p" +
						" where p.pay_voucher_id = objsrc_2621.pay_voucher_id and (p.pay_date is not null or p.batchreq_date is not null)) "));
			}else if("2".equals(payRefundFlage)){
				where.and(new Lt("pay_amount",0)); 
				////退款的数据，额度重算不包含导入的老数据
				where.addLogic(new NativeSQL(" and exists (select 1 from pb_pay_voucher p" +
				//import_flag = 0 新系统数据；import_flag = 1 清算导入的数据；import_flag =2 做退款录入导入的数据
				//import_flag = 0 的数据参与清算
				" where p.import_flag = 0 and clear_flag = 1 and p.pay_voucher_id = objsrc_2621.pay_voucher_id) "));	
			}
		}
		List<PayRequest> details = new ArrayList<PayRequest>();
		details = (List<PayRequest>) billEngine.loadBillByBillType(sc, billTypeId, null, where, null,null);
		return details;
	}
	
	/**
	 * 银行对账管理
	 */
	@Override
	public void checkhisSerialno(Session sc,String is_onlyreq,String vt_code,String admdiv_code,String pay_date,String pay_date_end) throws Exception {
		// TODO Auto-generated method stub
		Timestamp startDate = new Timestamp((DateUtil.stringToDate(pay_date,"yyyyMMdd")).getTime());
		// 获得一天后的结束时间
		Timestamp endDate = new Timestamp(DateUtil.getEndTime(
				startDate, 0, 0, 1));
		String sql = "select agent_business_no,pay_voucher_id,accthost_seqid,pay_account_no,payee_account_no,vt_code,admdiv_code,pay_date,pay_amount,reconciliation_flag" 
			+ " from pb_pay_voucher "
			+ "where vt_code = "
			+ vt_code
			+ " and is_onlyreq = "
			+ is_onlyreq
			+ " and admdiv_code = "
			+ admdiv_code
			+ " and  pay_date >=  to_date('"
			+ startDate.toLocaleString()
			+ "', 'yyyy-MM-dd HH24:mi:ss') and pay_date < to_date('"
			+ endDate.toLocaleString()
			+ "', 'yyyy-MM-dd HH24:mi:ss')";
//	List<PayVoucher> payVoucherList = baseDao.queryForList(sql,
//			new RowMapper<PayVoucher>() {
//				public PayVoucher mapRow(final ResultSet r, final int i)
//						throws SQLException {
//					final PayVoucher voucher = new PayVoucher();
//					voucher.setPay_voucher_id(r.getLong("pay_voucher_id"));
//					voucher.setAgent_business_no(r.getString("accthost_seqid"));
//					voucher.setPay_account_no(r.getString("pay_account_no"));
//					voucher.setPayee_account_no(r.getString("payee_account_no"));
//					voucher.setVt_code(r.getString("vt_code"));
//					voucher.setAdmdiv_code(r.getString("admdiv_code"));
//					voucher.setPay_date(r.getTimestamp("pay_date"));
//					voucher.setPay_amount(r.getBigDecimal("pay_amount"));
//					voucher.setReconciliation_flag(r.getString("reconciliation_flag"));
//					return voucher;
//				}
//			});
		List<PayVoucher> payVoucherList = baseDao.queryForList(sql,null,new ComplexMapper( PayVoucher.class ));
		List<String> dateList = new ArrayList<String>();
		for (PayVoucher p : payVoucherList) {
			if (null != p.getPay_date()) {
				String date = DateUtil.DateToString(p.getPay_date(),
						"yyyyMMdd");
				if (!dateList.contains(date)) {
					dateList.add(date);
				}
				break;
			}
		}
		
		if (dateList == null || dateList.size() == 0) {
			throw new CommonException("无需对账数据【根据条件查询未进行对账数据】！");
		}

		List<SerialNo> serialList = new ArrayList<SerialNo>();
		// 查询今日所有该凭证类型凭证的交易流水 and 20130923 by zhouqi 根据当前日期查询流水
		for (String date : dateList) {
			List<SerialNo> tempList = transService.queryHisSerialno(sc, payVoucherList.get(0), date);
            for(SerialNo seri : tempList){
            	if(seri.getTransResult() == 0){
            		serialList.add(seri);
            	}
            }
		}
		
		if (serialList == null || serialList.size() == 0) {
			throw new CommonException("银行接口【根据日期查询流水】无返回信息！");
		}

	   String cashCode = "";
		  // 找出流水号不在今日交易成功的流水中的凭证号,现金交易不必校验交易流水
		for (PayVoucher payVoucher : payVoucherList) {
			cashCode = ElementUtil.getEleValue(PbParaConstant.CASH, "现金",payVoucher.getAdmdiv_code());
			if (!cashCode.equals(payVoucher.getSet_mode_code())
					&& payVoucher.getManual_trans_flag() != 1) {
				payVoucher.setReconciliation_flag("2");
				for (SerialNo seri : serialList) {
					if (payVoucher.getAgent_business_no().equals(seri.getTransId().trim())
							&& payVoucher.getPay_account_no().equals(seri.getPayAcctNo().trim())
//							&& payVoucher.getPayee_account_no().equals(seri.getPayeeAcctNo())
							&& payVoucher.getAmt().equals(seri.getTransAmt().toString().trim())) {
						// 对账成功
						payVoucher.setReconciliation_flag("1");
						break;
					}
				}
			}
		}
        
		if(payVoucherList != null && payVoucherList.size() > 0){
		   baseDao.batchUpdate("PB_PAY_VOUCHER", "reconciliation_flag#PAY_VOUCHER_ID", payVoucherList);
		}
	}
	
    /**
	 *  退回主办行,在凭证排查功能中使用
	 * @param sc
	 * @param ids
	 * @param operRemark
	 * @param isYearSummary 1——年结
	 * @throws NoSuchMethodException
	 * @throws InvocationTargetException
	 * @throws IllegalAccessException
	 */
	@SuppressWarnings("unchecked")
    public void returnPayVoucherNoWf(final Session sc,
			List<PayVoucher> payVoucherList, final String operRemark,final int isYearSummary) {
		long ids[] = BillUtils.getBillIds(payVoucherList);
		// 获取支付凭证单据类型
		long billTypeId = Parameters
				.getLongParameter(PayConstant.BILL_TYPE_PAY_VOUCHER);
		// 明细列表
		List<PayRequest> requestList = (List<PayRequest>) payCommonService
				.loadDetailsByBill(sc, billTypeId, ids, null);
		// 将明细设置到对应的凭证中
		PbUtil.setBillDetails(payVoucherList, requestList, "pay_voucher_id");
		// 调用工作流录入，复审岗退票，不需录入工作流
		StringBuffer vouCodeStr = new StringBuffer();
		for (final PayVoucher payVoucher : payVoucherList) {
			try {
				smallTrans.newTransExecute(new ISmallTransService() {
					public void doExecute() throws Exception {
	                    List<String> updateFields = new ArrayList<String>();
						payVoucher.setReturn_reason(operRemark);
						
						// 获取该凭证的明细列表
						List<Billable> detailList = payVoucher.getDetails();
						List<PayRequest> reqList = new ArrayList<PayRequest>();
						for (Billable bill : detailList) {
							reqList.add((PayRequest) bill);
						}
					
						payVoucher.setBusiness_type(2);//放到签章发送前，安徽农行那边取签章位置时加了business_type过滤条件
						// 调用工作流录入，复审岗退票，不需录入工作流
								
						List<PayVoucher> tempList = new ArrayList<PayVoucher>();
						tempList.add(payVoucher);
						if ("1".equals(PbParameters
								.getStringParameter(PbParaConstant.RETRUN_VOUCER_MODEL,payVoucher.getAdmdiv_code()) )
								||PbParameters
								.getStringParameter(PbParaConstant.RETRUN_VOUCER_MODEL,payVoucher.getAdmdiv_code()) == null) {
							// 设置voucherFlag为退回
							PbUtil.batchSetValue(tempList, "voucherFlag",
									XmlConstant.VOUCHERFLAG_VALUE_BACK);
							baseBizService.returnback2EVoucher(sc, tempList,
									new String[] { payVoucher
											.getReturn_reason() });
						} else if ("0".equals(PbParameters
								.getStringParameter(PbParaConstant.RETRUN_VOUCER_MODEL,payVoucher.getAdmdiv_code()))) {
							String decOrgType = PbParameters
									.getStringParameter(PayConstant.DEST_MOF_ORG_TYPE);
							PbUtil.batchSetValue(tempList, "voucherFlag",
									XmlConstant.VOUCHERFLAG_VALUE_RETURN);
							PbUtil.batchSetValue(tempList, "pay_amount",
									NumberUtil.BIG_DECIMAL_ZERO);
							PbUtil.batchSetValue(reqList,
									"pay_amount", NumberUtil.BIG_DECIMAL_ZERO);
							baseBizService.signAndSend4EVoucher(sc, decOrgType,
									XmlConstant.VOUCHERFLAG_VALUE_RETURN,
									tempList);
						} else if ("2".equals(PbParameters
								.getStringParameter(PbParaConstant.RETRUN_VOUCER_MODEL,payVoucher.getAdmdiv_code()))) {
							String decOrgType = PbParameters
									.getStringParameter(PayConstant.DEST_MOF_ORG_TYPE);
							
							//2016-7-21 16:17:07 sh 安徽退票时需要补录XPayDate、XAgentBusinessNo
							Timestamp nowTime = DateTimeUtils.nowDatetime();
		                    updateFields.add("pay_date");
		                    for(PayVoucher v :tempList){
		                        v.setVoucherFlag(XmlConstant.VOUCHERFLAG_VALUE_RETURN);
		                        v.setPay_amount(NumberUtil.BIG_DECIMAL_ZERO);
		                        v.setPay_date(nowTime);
		                        v.setAgent_business_no(seqReq(v.getVt_code()));
		                        PbUtil.batchSetValue(v.getDetail(), "agent_business_no", v.getAgent_business_no());
		                    }
		                    for(PayRequest r :reqList){
		                        r.setPay_date(nowTime);
		                        r.setPay_amount(NumberUtil.BIG_DECIMAL_ZERO);
		                    }
							
							baseBizService.signAndSend2EVoucher(sc, decOrgType,
									XmlConstant.VOUCHERFLAG_VALUE_RETURN,
									tempList);
						}
						
				
						// 将明细单中task_id设置到主单
						payVoucher.setTask_id(-1);
						if(isYearSummary == 1){
							payVoucher.setTask_id(-10);
						}
						/**
						 * 自助柜面退回财政时，需要更新拼争状态为本方已退回
						 * lfj 2015-12-02
						 */
						VoucherStatus.S_VOCHER_M_RETURNED.setVoucherStatus(payVoucher);
						
						List<PayVoucher> pvList=new ArrayList<PayVoucher>();
						pvList.add(payVoucher);
						
						updateFields.add("return_reason");
						updateFields.add("voucher_status");
						updateFields.add("voucher_status_des");
						//单据标识置为退回，需要保存  lfj 2015-12-02
						updateFields.add("voucherFlag");
						updateFields.add("business_type");
						updateFields.add("task_id");
						billEngine.updateBill(sc, updateFields, pvList, false);
						updateFields.remove("return_reason");
						updateFields.remove("business_type");
						billEngine.updateBill(sc, updateFields, reqList, false);
					}
				});
			} catch (Exception e) {
				e.printStackTrace();
				log.error(e.getMessage());
				vouCodeStr.append(e.getMessage());
			}
		}
		if (vouCodeStr.length() != 0) {
			throw new CommonException("", vouCodeStr.toString());
		}
	}
	/**
	 * 支付凭证审核 直接支付凭证、授权支付凭证一岗审核，录入工作流
	 */
	public void auditPayVoucher(Session sc, List<PayVoucher> payVoucherList) {
		// 如果没有需要登记的数据则直接返回
		if (ListUtils.isEmpty(payVoucherList)) {
			return;
		}
		// 调用工作流录入
		workflow.createProcessInstance(sc, "PB_PAY_VOUCHER", payVoucherList, false);
		// 完成送审操作
		workflow.signalProcessInstance(sc, payVoucherList, PayConstant.WORK_FLOW_NEXT,
				"支付凭证送审");

		// 将明细单中task_id设置到主单，设置创建用户为当前审核用户
		for (PayVoucher voucher : payVoucherList) {
			voucher.setCreate_user_id(sc.getUserId());
			voucher.setCreate_user_name(sc.getUserName());
			voucher.setCreate_user_code(sc.getUserCode());
			voucher.setAudit_user_code(sc.getUserCode());
		}

		List<String> updateFields = new ArrayList<String>();
		updateFields.add("task_id");
		// 更新收款人行号
		updateFields.add("payee_account_bank_no");
		updateFields.add("payee_account_bank");
		updateFields.add("create_user_id");
		updateFields.add("create_user_name");
		updateFields.add("create_user_code");
		updateFields.add("last_ver");
		updateFields.add("pb_set_mode_code");
		updateFields.add("pb_set_mode_name");
		updateFields.add("bankbusinesstype");
		updateFields.add("city_code");
		updateFields.add("remark");
		updateFields.add("urgent_flag");
		updateFields.add("urgent_flag_name");
		updateFields.add("add_word");
		updateFields.add("audit_user_code");
		// 更新主单字段
		billEngine.updateBill(sc, updateFields, payVoucherList, false);
	}

	/**
	 * 登记财政退款凭证信息
	 */
	public void acceptCommonSignRefPayVoucher(Session sc,
			List<PayVoucher> payVoucherList, int recordType) throws Exception{

		
		List<PayVoucher> pvl = new ArrayList<PayVoucher>();
		pvl = payVoucherList;

		this.acceptCommonSignPayVoucherNotFlow(sc, payVoucherList, recordType,true);

		// 生成的时候不能调用工作流，通过调用系统内部操作日志接口进行操作日志的保存
		// 保存的操作日志将保存在pb_wf_tasklog表中
		this.getLogService().saveTaskLogInfo(sc, pvl, "退款申请签章发送");

	
	}

	/**
	 * 更新原退款凭证明细的退款金额
	 * 
	 * @param sc
	 * @param refVoucherList
	 */
	private void updateOriVoucherAmt(Session sc, List<PayVoucher> refVoucherList) {
		// 获取主单单据类型ID
		long billTypeId = Parameters.getLongParameter(PayConstant.BILL_TYPE_PAY_VOUCHER);
		// 主单ID数组
		long ids[] = BillUtils.getBillIds(refVoucherList);
		// 查询对应的明细信息
		List<PayRequest> requests = (List<PayRequest>) payCommonService.loadDetailsByBill(
				sc, billTypeId, ids, null);
		// 设置单据和明细的关联关系
		PbUtil.setBillDetails(refVoucherList, requests, "pay_voucher_id");

		// 原支付凭证编码数组
		String[] oriCodes = new String[refVoucherList.size()];
		for (int i = 0; i < refVoucherList.size(); i++) {
			oriCodes[i] = refVoucherList.get(i).getOri_pay_voucher_code();
		}
		// 原支付凭证数组
		List<PayVoucher> oriPayVoucherList = (List<PayVoucher>) payCommonService
				.loadBillsWithDetails(sc, billTypeId, "pay_voucher_code",
						oriCodes);
		// 原支付凭证明细数组
		List<Billable> oriPayRequestsList = new ArrayList<Billable>();
		// 原支付凭证Map
		Map<String, HashMap<String, Billable>> oriMaps = new HashMap<String, HashMap<String, Billable>>();
		for (PayVoucher oriPay : oriPayVoucherList) {
			List<Billable> oriDetails = oriPay.getDetails();
			oriPayRequestsList.addAll(oriDetails);
			HashMap<String, Billable> oriDetailMap = new HashMap<String, Billable>();
			for (Billable b : oriDetails) {
				oriDetailMap.put(b.getCode(), b);
			}
			oriMaps.put(oriPay.getPay_voucher_code(), oriDetailMap);
		}

		for (PayVoucher refPay : refVoucherList) {
			if (oriMaps.containsKey(refPay.getOri_pay_voucher_code())) {
				// 原支付凭证明细Map
				HashMap<String, Billable> oriRequests = oriMaps.get(refPay
						.getOri_pay_voucher_code());
				// 退款凭证明细
				List<Billable> refRequests = refPay.getDetails();
				for (Billable refReq : refRequests) {
					if (oriRequests.containsKey(refReq.getCode())) {
						// 原支付凭证明细
						Billable oriReq = oriRequests.get(refReq.getCode());
						long oriReqId = (Long) PlatformUtils.getProperty(
								oriReq, "pay_request_id");
						BigDecimal refAmt = (BigDecimal) PlatformUtils
								.getProperty(oriReq, "pay_refund_amount");
						refAmt = refAmt == null ? BigDecimal.ZERO : refAmt;
						BigDecimal addRefAmt = (BigDecimal) PlatformUtils
								.getProperty(refReq, "pay_amount");
						PlatformUtils.setProperty(oriReq, "pay_refund_amount",
								refAmt.add(addRefAmt.abs()));
						PlatformUtils.setProperty(refReq, "ori_request_id",
								oriReqId);
					}
				}
			}
		}

		// 更新原退款明细退款金额
		List<String> fileds = new ArrayList<String>();
		fileds.add("pay_refund_amount");
		billEngine.updateBill(sc, fileds, oriPayRequestsList, false);
	}

	public void acceptCommonSignPayVoucher(final Session sc,
			final List<PayVoucher> payVoucherList, final int recordType,final boolean pay){

		final TimeCalculator total = new TimeCalculator(log);
		total.start();
		total.middle("+++++++支付开始");
		// 如果没有需要登记的数据则直接返回
		if (ListUtils.isEmpty(payVoucherList)) {
			return;
		}

		// 判断当前时间是否在财政的日始日终时间之内，不是则抛出异常提示
		if (!finService.isInDay(payVoucherList.get(0))) {
			throw new FinIsinDayException( "当前时间不在财政【"
					+ payVoucherList.get(0).getAdmdiv_code() + "】日始日终时间之内！");
		}

		// 获取主单单据类型ID
		long billTypeId = Parameters.getLongParameter(PayConstant.BILL_TYPE_PAY_VOUCHER);
		// 获取支付明细的单据类型ID
		final long detailBillTypeId = Parameters.getLongParameter(
				PayConstant.BILL_TYPE_PAY_REQUEST);
		// 明细为空才加载明细
		if (ListUtils.isEmpty(payVoucherList.get(0).getDetails())) {
			// 主单ID数组
			long ids[] = BillUtils.getBillIds(payVoucherList);
			// 查询对应的明细信息
			List<PayRequest> requests = (List<PayRequest>) payCommonService
					.loadDetailsByBill(sc, billTypeId, ids, null);
			// 设置单据和明细的关联关系
			PbUtil.setBillDetails(payVoucherList, requests, "pay_voucher_id");
		}
		//modify by cyq 2015/1/14  批量验证
		//this.batchPayVoucherValidate2EVoucher(payVoucherList);
		if(!(payVoucherList.get(0).getSet_mode_name().contains("现金")||payVoucherList.get(0).getSet_mode_name().contains("现付"))){//如果是现金支付不做校验
			this.batchPayVoucherValidate2EVoucher(payVoucherList);
		}
		// 记录确认支付失败凭证号和出错信息
		StringBuffer vouCodeStr = new StringBuffer();
		final List<PayVoucher> payVoucherSingleList = new ArrayList<PayVoucher>(1);
		// 是否签章发送，1--发送；0--不发送
		final int isSend = PbParameters.getIntParameter(PbParaConstant.IS_SEND_PAYVOUCHER);
		
		for (final PayVoucher payVoucher : payVoucherList) {
			boolean sendabled = true;
			if(payVoucher.isError()){
				vouCodeStr.append("【" + payVoucher.getPay_voucher_code() + "】"
																+ payVoucher.getErrorMessage());
				continue;
			}
			try {
				
				smallTrans.newTransExecute(new ISmallTransService() {

					public void doExecute() throws Exception {
						int  condrolDays =  PbParameters.getIntParameter("pb.trans.notTransDay", payVoucher.getAdmdiv_code());
						if(condrolDays < 0){
							throw new PbException("参数:pb.trans.notTransDay 配置不合法!");
						}else if(condrolDays > 0){
							int day = DateTimeUtils.daysBetween(payVoucher.getVou_date(),DateTimeUtils.TransLogDateTime());
							if(day > condrolDays){
								throw new PbException("凭证"+payVoucher.getCode()+"超过["+condrolDays+"]天未支付，请重新选择支付数据！");
							}
						}
						lockBillForTrans(sc, payVoucher, "business_type", 1, payVoucher.getBusiness_type());
						// 获取该凭证的明细列表
						List<Billable> detailList = payVoucher.getDetails();
						List<PayRequest> reqList = new ArrayList<PayRequest>();
						for (Billable bill : detailList) {
							PayRequest req = (PayRequest)bill;
							req.setSet_mode_code(payVoucher.getSet_mode_code());
							req.setSet_mode_name(payVoucher.getSet_mode_name());
							reqList.add(req);
						}
						//从明细中向主单赋值，基层预算单位
						payVoucher.setAgency_name(reqList.get(0).getAgency_name());
						//减少明细循环次数，移到上面明细循环体赋值  ZJM 2015-07-16
//						PbUtil.batchSetValue(reqList, "set_mode_code", payVoucher.getSet_mode_code());
//						PbUtil.batchSetValue(reqList, "set_mode_name", payVoucher.getSet_mode_name());
						
						TimeCalculator tc = new TimeCalculator(log);
						tc.start();
						tc.middle("+++++++++++++走工作流开始");
						payVoucherSingleList.clear();
						payVoucherSingleList.add(payVoucher);
						if (!(payVoucher.getTask_id() > 0)) {
							// 调用工作流录入
							workflow.createProcessInstance(sc,
									"PB_PAY_VOUCHER", payVoucherSingleList, false);
						}
						
						String payName="";
						if(pay){
							payName="支付";
						}else{
							payName="人工转账";
						}
						// 完成送审操作
						workflow.signalProcessInstance(sc, payVoucherSingleList,
								PayConstant.WORK_FLOW_NEXT, payName);
						tc.middle("+++++++++++++走工作流耗时:");
						
						//进行额度控制
						String directPay = PbParameters.getStringParameter(PbParaConstant.DIRECTPAY_PAY_TYPE_CODE, payVoucher.getAdmdiv_code());
						/**
						 * 如果是授权支付
						 * lfj 2015-09-23
						 */
						boolean flowType = payVoucher.getPay_amount().signum() == 1;
						if(!payVoucher.getPay_type_code().startsWith(directPay) && flowType){//并且是正向支付，否则has_advance == 2 时，转账时会恢复一次额度
							
							//advance.acct.bank ,0-不根据网点过滤；1-根据网点过滤；2-没有垫支户,
							int has_advance = PbParameters.getIntParameter(PbParaConstant.IS_HAS_ADVANCE_ACCT);
							if(has_advance == 2 ) {
								/**
								 * 没有垫支户，扣减额度
								 * lfj 2015-09-23
								 */
								balanceService.payRequestsEntrance(sc, reqList, false);
							} else {
								/**
								 * 有垫支户，现金、现付情况，正向
								 * lfj 2015-09-23
								 */
								String setModeName = payVoucher.getSet_mode_name();
								/**
								 * setModeName判断是否为现金、现付情况时，使用contains（包含）来处理各地要素不同的情况
								 * 2015-11-26
								 */
								if(setModeName != null) {
									if (setModeName.contains("现金") || setModeName.contains("现付")) {
										balanceService.payRequestsEntrance(sc, reqList, false);
									}
								}
							}
						}

						// 调用银行核心接口实现支付
						total.middle("+++++++++++调用银行核心系统转账开始");
						// String pbCash =
						// PbParameters.getParameterValue(PbParaConstant.CASH,
						// payVoucher.getAdmdiv_code());
						// if(pbCash==null){
						// throw new CommonException("请检查系统参数配置，默认结算方式：现金为空！");
						// }
						
						//当不为“挂账”时（湖南交行特殊业务：零余额到内部账户）
					
						if(pay){
							trans(total,sc,reqList,payVoucher);
						}else{
							//add zhouqi20140422 人工转账记录日志并交易流水号赋值
							transService.manTrans(sc, payVoucher);					
							payVoucher.setManual_trans_flag( 1 );
						}	
						// 更新单和明细等信息并走工作流，发送回单
						PbUtil.batchSetValue(payVoucherSingleList, "payUser_code",
								sc.getUserCode());
						PbUtil.batchSetValue(payVoucherSingleList, "payUser_name",
								sc.getUserName());
						PbUtil.batchSetValue(payVoucherSingleList, "trans_succ_flag",
								TradeConstant.TRANS_SUCC);
						updateAcceptPayVoucher(sc, payVoucherSingleList, reqList);
					}
				});
			
					
			}catch(PbTransUnKnownException e){
				sendabled = false;
				vouCodeStr.append(e.getMessage());
				log.error(e.getMessage());
				payVoucher.setReturn_reason(e.getMessage());
				payVoucher.setTrans_succ_flag(TradeConstant.TRANS_UNKOWN);
				List<String> updateFileList = new ArrayList<String>();
				updateFileList.add("return_reason");
				updateFileList.add("trans_succ_flag");
				//转账异常后保存失败原因
				updateField(sc,payVoucher,updateFileList);
			}
			catch (PbTransException e1) {
				sendabled = false;
				log.error(e1.getMessage());
				vouCodeStr.append(e1.getMessage());
				payVoucher.setReturn_reason(e1.getMessage());
				payVoucher.setTrans_succ_flag(TradeConstant.TRANS_FAIL);
				List<String> updateFileList = new ArrayList<String>();
				if(TradeConstant.PAY2PAYEE==payVoucher.getTrade_type()){
					payVoucher.setPb_set_mode_code_last(payVoucher.getPb_set_mode_code());
					updateFileList.add("pb_set_mode_code_last");
				}
				
				updateFileList.add("return_reason");
				updateFileList.add("trans_succ_flag");
				//转账异常后保存失败原因
				updateField(sc,payVoucher,updateFileList);
				
			} catch (SocketTimeoutException e) {
				sendabled = false;
				log.error(e.getMessage());
				vouCodeStr.append(e.getMessage());
			} catch (Exception e) {
				sendabled = false;
				e.printStackTrace();
				log.error("支付失败：原因："+e.getMessage());
				vouCodeStr.append("【"+payVoucher.getCode()+"】:"+e.getMessage());
				
			}
			//签章发送放在事务中
			if(isSend ==1 && sendabled && payVoucher.getPay_amount().signum()>0 ){
				try {
					smallTrans.newTransExecute(new ISmallTransService() {
						public void doExecute() throws Exception {
								PayServiceImpl.this.signAndSendPayVoucherByNoFlow(sc,payVoucherSingleList, 1);
							}
						});
				} catch (Exception e) {
					vouCodeStr.append("【"+payVoucher.getCode()+"】转账成功，");
					vouCodeStr.append(e.getMessage() + ";");
					log.error("签章异常",e);
				}
			}
			}
			if (vouCodeStr.length() != 0) {
				throw new PbException(vouCodeStr.toString());
			}
			log.debug("支付完成");
			total.stop();
	}
	
	/**
	 * 新起一个事务更新列表中的字段
	 * @param sc
	 * @param payVoucher
	 * @throws Exception 
	 */
	public void updateField(final Session sc,final PayVoucher payVoucher,final List<String> updateFileList){
		try {
			smallTrans.newTransExecute(new ISmallTransService() {
				public void doExecute() throws Exception {
					List<PayVoucher> vouList = new ArrayList<PayVoucher>();
					vouList.add(payVoucher);
					billEngine.updateBill(sc, updateFileList, vouList, false);	
				}
			});
		} catch (Exception e) {
			e.printStackTrace();
		}
		
	}
	
	//modify by sunhui 2015-4-8 09:37:56
	public void batchPayVoucherValidate2EVoucher(List<PayVoucher> payVoucherList) {
		
		//如果通过凭证库校验数据篡改的标志位0则不校验，为1则校验
		if( 0 == PbParameters.getIntParameter( PbParaConstant.VOUCHER_CHANGED ) ){
			return;
		}
		
		String forwardAdmdiv = PbParameters.getStringParameter("pb.forward.admdiv");
		
		if(payVoucherList.get(0).getPay_amount().compareTo(new BigDecimal(0))==1
				&& !payVoucherList.get(0).getAdmdiv_code().equals(forwardAdmdiv)){

			String admdivCode = payVoucherList.get(0).getAdmdivCode();
			String vtCode = payVoucherList.get(0).getVtCode();
			XMLVoucherBody voucherBody = new XMLVoucherBody();
			EVoucherAnalytic ev = new EVoucherAnalytic(voucherBody);
			Map<String,XMLVoucherBody> VoucherBodys = ev.receiveVoucherByNos(admdivCode, vtCode,payVoucherList);
			for (final PayVoucher payVoucher : payVoucherList) {
				//根据VouNo从解析的XMLVoucherBody的map中取出相应的XMLVoucherBody
				voucherBody = VoucherBodys.get(payVoucher.getVouNo());
				if(voucherBody==null){
					throw new PbException("凭证号【"+payVoucher.getVouNo()+"】在凭证库中不存在，与凭证库校验数据失败！");
				}
				Billable oriBill = ev.resolveBizHandler(voucherBody);
				// 1金额不能超
				// 2.收款人账号不能修改payee_account_no
				PayVoucher oriPay = (PayVoucher) oriBill;
				int i = payVoucher.getPay_amount().compareTo(
						oriPay.getOri_pay_amount());
				//如果支付金额小于等于原始金额
				if (i < 1) {
					//原凭证收款人账号为空时，才允许改收款人账号
					if (!StringUtil.isEmpty(oriPay.getOri_payee_account_no())) {
						if(StringUtil.isEmpty( payVoucher.getPayee_account_no() )){
							payVoucher.setErrorMessage("收款账号不能为空！");
							payVoucher.setError(true);
							//throw new PbTransException("收款账号不能为空!");
						}else if(!payVoucher.getPayee_account_no().equals(oriPay.getOri_payee_account_no())){
							payVoucher.setErrorMessage("收款账号被篡改！！");
							payVoucher.setError(true);
							//throw new PbTransException("收款账号被篡改！");
						}
					}
				} else {
					//throw new PbTransException("支付金额大于原始金额！");
					payVoucher.setErrorMessage("支付金额大于原始金额！");
					payVoucher.setError(true);
				}
			}
		}
	}
	
	public void acceptCommonSignPayVoucherNotFlow(final Session sc,
			List<PayVoucher> payVoucherList, final int recordType,final boolean pay){

		final TimeCalculator total = new TimeCalculator(log);
		total.start();
		total.middle("+++++++支付开始");
		// 如果没有需要登记的数据则直接返回
		if (ListUtils.isEmpty(payVoucherList)) {
			return;
		}

		// 判断当前时间是否在财政的日始日终时间之内，不是则抛出异常提示
		if (!finService.isInDay(payVoucherList.get(0))) {
			throw new FinIsinDayException("当前时间不在财政【"
					+ payVoucherList.get(0).getAdmdiv_code() + "】日始日终时间之内！");
		}

		// 获取主单单据类型ID
		long billTypeId = Parameters.getLongParameter(PayConstant.BILL_TYPE_PAY_VOUCHER);
		// 获取支付明细的单据类型ID
		final long detailBillTypeId = Parameters.getLongParameter(
				PayConstant.BILL_TYPE_PAY_REQUEST);
		// 明细为空才加载明细
		if (ListUtils.isEmpty(payVoucherList.get(0).getDetails())) {
			// 主单ID数组
			long ids[] = BillUtils.getBillIds(payVoucherList);
			// 查询对应的明细信息
			List<PayRequest> requests = (List<PayRequest>) payCommonService
					.loadDetailsByBill(sc, billTypeId, ids, null);
			// 设置单据和明细的关联关系
			PbUtil.setBillDetails(payVoucherList, requests, "pay_voucher_id");
		}

		// 记录确认支付失败凭证号和出错信息
		StringBuffer vouCodeStr = new StringBuffer();
		final int isSend = PbParameters.getIntParameter(PbParaConstant.IS_SEND_PAYVOUCHER);
		final List<PayVoucher> vouList = new ArrayList<PayVoucher>();
		for (final PayVoucher payVoucher : payVoucherList) {
			boolean sendabled = true;
			try {
				smallTrans.newTransExecute(new ISmallTransService() {
					
					public void doExecute() throws Exception {
						//支付天数参数控制
						int  condrolDays =  PbParameters.getIntParameter("pb.trans.notTransDay", payVoucher.getAdmdiv_code());
						if(condrolDays < 0){
							throw new PbException("参数:pb.trans.notTransDay 配置不合法!");
						}else if(condrolDays > 0){
							int day = DateTimeUtils.daysBetween(payVoucher.getVou_date(),DateTimeUtils.TransLogDateTime());
							if(day > condrolDays){
								throw new PbException("有凭证超过["+condrolDays+"]天未支付，请重新选择支付数据！");
							}
						}
						
						lockBillForTrans(sc, payVoucher, "business_type", 1, payVoucher.getBusiness_type());
						
						// 获取该凭证的明细列表
						List<Billable> detailList = payVoucher.getDetails();
						List<PayRequest> reqList = new ArrayList<PayRequest>();
						for (Billable bill : detailList) {
							reqList.add((PayRequest) bill);
						}
						//从明细中向主单赋值，基层预算单位
						payVoucher.setAgency_name(reqList.get(0).getAgency_name());
						PbUtil.batchSetValue(reqList, "set_mode_code", payVoucher.getSet_mode_code());
						PbUtil.batchSetValue(reqList, "set_mode_name", payVoucher.getSet_mode_name());
						
						//在请款时控制额度
//						// 授权支付进行额度控制
//						if (recordType != 0) {
//							total.middle("+++++++++++授权支付额度控制开始");
//							List<PayRequestSaveAction> actions = new ArrayList<PayRequestSaveAction>(
//									reqList.size());
//							for (PayRequest request : reqList) {
//								request.setBill_type_id(detailBillTypeId);
//								actions.add(new PayRequestSaveAction(request));
//							}
//							// 如果是授权支付才进行额度控制
//							// 1记账 2强制记账
//							if (recordType == 1) {
//								balanceService.payRequestEntrance(sc, actions,
//										false);
//							} else if (recordType == 2) {
//								balanceService.payRequestEntrance(sc, actions,
//										true);
//							}
//							total.middle("+++++++++++授权支付额度控制耗时：");
//						}

						TimeCalculator tc = new TimeCalculator(log);
						tc.start();
//						tc.middle("+++++++++++++走工作流开始");
//						if (!(reqList.get(0).getTask_id() > 0)) {
//							// 调用工作流录入
//							workflow.createProcessInstance(sc,
//									"PB_PAY_REQUEST", reqList, false);
//						}

						// 完成送审操作
//						workflow.signalProcessInstance(sc, reqList,
//								WORK_FLOW_NEXT, "转账");
//						tc.middle("+++++++++++++走工作流耗时:");

						// 调用银行核心接口实现支付
						total.middle("+++++++++++调用银行核心系统转账开始");
						// String pbCash =
						// PbParameters.getParameterValue(PbParaConstant.CASH,
						// payVoucher.getAdmdiv_code());
						// if(pbCash==null){
						// throw new CommonException("请检查系统参数配置，默认结算方式：现金为空！");
						// }
						
						//当不为“挂账”时（湖南交行特殊业务：零余额到内部账户）
					
						if(pay){
							trans(total,sc,reqList,payVoucher);
						}else{
							payVoucher.setManual_trans_flag( 1 );
						}
						
						
						
						vouList.add(payVoucher);
						// 更新单和明细等信息并走工作流，发送回单
						updateAcceptPayVoucher(sc, vouList, reqList);
					}
				});
			}catch(PbTransUnKnownException e){
				sendabled = false;
				vouCodeStr.append(e.getMessage());
				log.error(e.getMessage());
				payVoucher.setReturn_reason(e.getMessage());
				payVoucher.setTrans_succ_flag(TradeConstant.TRANS_UNKOWN);
				List<String> updateFileList = new ArrayList<String>();
				updateFileList.add("return_reason");
				updateFileList.add("trans_succ_flag");
				//转账异常后保存失败原因
				updateField(sc,payVoucher,updateFileList);
			}
			catch (PbTransException e1) {
				sendabled = false;
				payVoucher.setReturn_reason(e1.getMessage());
				payVoucher.setTrans_succ_flag(TradeConstant.TRANS_FAIL);
				List<String> updateFileList = new ArrayList<String>();
				updateFileList.add("return_reason");
				updateFileList.add("trans_succ_flag");
				//转账异常后保存失败原因
				updateField(sc,payVoucher,updateFileList);
				log.error(e1.getMessage());
				vouCodeStr.append(e1.getMessage());//add by lix 2015.07.10 自助柜面支付失败抛出异常，不再签章发送回单
			} catch (SocketTimeoutException e) {
				sendabled = false;
				log.error(e.getMessage());
				vouCodeStr.append(e.getMessage());
			} catch (Exception e) {
				sendabled = false;
				e.printStackTrace();
				log.error("支付失败：原因："+e.getMessage());
				vouCodeStr.append("【"+payVoucher.getCode()+"】:"+e.getMessage());
			}
			//签章发送放在事务中
			if(isSend ==1 && sendabled && payVoucher.getPay_amount().signum()>0 ){
				try {
					smallTrans.newTransExecute(new ISmallTransService() {

						public void doExecute() throws Exception {
							PayServiceImpl.this.signAndSendPayVoucherByNoFlow(sc,vouList, 1);
							}
						});
				} catch (Exception e) {
					vouCodeStr.append("【"+payVoucher.getCode()+"】转账成功，");
					vouCodeStr.append(e.getMessage() + ";");
					//TODO：异常处理
					log.error("签章异常",e);
				}
			}
			}
			if (vouCodeStr.length() != 0) {
				throw new PbException(vouCodeStr.toString());
			}
			log.debug("支付完成");
			total.stop();
	}
	
	private void trans(final TimeCalculator total, final Session sc,
			List<PayRequest> reqList, final PayVoucher payVoucher)
			throws Exception {
		// ///////////////
		TransReturnDTO transResult = null;
//		// 如果不等于挂账
//		if (payVoucher.getTrade_type() != TradeConstant.PAY2HUNGACCOUNT) {

			if (payVoucher.getPay_amount().signum() == 1) {
				String cashCode = ElementUtil.getEleValue(PbParaConstant.CASH,
						"现金", payVoucher.getAdmdiv_code());//重庆现金为现付
				if (StringUtil.isEmpty(cashCode)) {
					throw new CommonException("没有配置【现金】资金结算拨付方式！  请先配置！");
				}
				if (cashCode.equals(payVoucher.getSet_mode_code())) {
					// TODO 是否有垫支户到零余额的接口
					// 垫支户为空
					// 根据网点过滤
					// 校验是否存在多个垫支户的问题 yfy 2014-06-19
					// edit by liutianlong 20140131  是否存在垫支户
					//0-不根据网点过滤；1-根据网点过滤；2-没有垫支户,如果不是没有垫支户，就都进行请款操作
					int has_advance = PbParameters.getIntParameter("advance.acct.bank");
					final int isTranOnSameAcct = PbParameters.getIntParameter(PbParaConstant.ISTRANS_ON_SAME_ACCT);//添加收付款人一致是否转账参数控制
					if( has_advance != 2&&isTranOnSameAcct!=1){//三峡银行现金先请款再转账，转账时，把钱转到尾箱
						BankAccount bankAccount = BankAccountValueSetUtil.getAdvanceAccount(payVoucher, sc);
						payVoucher.setAdvance_account_bank(bankAccount.getBank_name());
						payVoucher.setAdvance_account_no(bankAccount.getAccount_no());
						payVoucher.setAdvance_account_name(bankAccount.getAccount_name());
						payVoucher.setTrade_type(TradeConstant.ADVANCE2PAY);
						for (PayRequest tempRequset : reqList) {
							tempRequset.setAdvance_account_bank(bankAccount.getBank_name());
							tempRequset.setAdvance_account_no(bankAccount.getAccount_no());
							tempRequset.setAdvance_account_name(bankAccount.getAccount_name());
						}
					}else{
						payVoucher.setTrade_type(TradeConstant.PAY2PAYEE);
					}
					//end edit
				} else {
					payVoucher.setTrade_type(TradeConstant.PAY2PAYEE);
				}
			} else {
				payVoucher.setTrade_type(TradeConstant.PAY2ADVANCE_REFUND);
			}
			log.info("凭证号：" + payVoucher.getPay_voucher_code());

			//hsq 2015年11月9日18:54:59  厦门农行备户金额度控制
			//备户金额度控制必须加入到事务中
			Integer isBHJPay = PbParameters.getIntParameter(PbParaConstant.IS_BHJ_PAY);//1是，0否
			controlBHJ(sc, payVoucher, isBHJPay, payVoucher.getTrade_type());

			// 如果是退款
			if (payVoucher.getTrade_type() == TradeConstant.PAY2ADVANCE_REFUND) {
				// 退款的转账模式
				int refPay = PbParameters.getIntParameter("pb.ref.payTrans");
				if (refPay == 0) {// 不需要转账
					transResult = transService.manTrans(sc, payVoucher);
					payVoucher.setManual_trans_flag( 1 );
				} else if (refPay == 1) {// 零余额到垫支户
					int refCon = PbParameters.getIntParameter("pb.payRefund.consistent");
					/**
					 * 退款模式 零余额-》垫支户，仅当正逆向不一致时才重新对
					 * payvoucher中的垫支户进行设置；当正逆向一致时，使用
					 * 原垫支户
					 */
					if(refCon == 0){
//						payVoucher.setTrade_type(TradeConstant.PAY2ADVANCE_REFUND);
						BankAccount bankAccount = BankAccountValueSetUtil.getAdvanceAccount(payVoucher, sc);
						payVoucher.setAdvance_account_no(bankAccount.getAccount_no());
						payVoucher.setAdvance_account_name(bankAccount.getAccount_name());
						payVoucher.setAdvance_account_bank(bankAccount.getBank_name());
					}
					//历史凭证导入时未导入垫支户，此处修改为如果垫支户为空则从账户表加载垫支户   ZJM 2015-09-11
					if(StringUtil.isEmpty(payVoucher.getAdvance_account_no())){
						BankAccount bankAccount = BankAccountValueSetUtil.getAdvanceAccount(payVoucher, sc);
						payVoucher.setAdvance_account_no(bankAccount.getAccount_no());
						payVoucher.setAdvance_account_name(bankAccount.getAccount_name());
						payVoucher.setAdvance_account_bank(bankAccount.getBank_name());
					}
					transResult = transService.payTrans(sc, payVoucher);
				} else if (refPay == 2) {// 零余额到本网点的垫支户，本网点垫支户再到归集行划款户
					// TODO:两次定值，一次转账，两次交易类型要改变
				    //历史凭证导入时未导入垫支户，此处修改为如果垫支户为空则从账户表加载垫支户   ZJM 2015-09-11
                    if(StringUtil.isEmpty(payVoucher.getAdvance_account_no())){
                        BankAccount bankAccount = BankAccountValueSetUtil.getAdvanceAccount(payVoucher, sc);
                        payVoucher.setAdvance_account_no(bankAccount.getAccount_no());
                        payVoucher.setAdvance_account_name(bankAccount.getAccount_name());
                        payVoucher.setAdvance_account_bank(bankAccount.getBank_name());
                    }
					// 零余额到本网点的垫支户
					TransReturnDTO transToAdvance = transService.payTrans(sc,
							payVoucher);
					// 本网点垫支户再到归集行划款户
					if (transToAdvance != null
							&& transToAdvance.getResStatus() == 0) {
						// TODO:定值，交易类型要改变
						payVoucher.setTrade_type(TradeConstant.ADVANCETOAGENT);
						// 设置划款户
						BankAccount bankAccount = BankAccountValueSetUtil
								.getAgentAccount(payVoucher, sc);
						payVoucher.setAgent_account_no(bankAccount
								.getAccount_no());
						payVoucher.setAgent_account_name(bankAccount
								.getAccount_name());
						payVoucher.setAgent_account_bank(bankAccount
								.getBank_name());
						transResult = transService.payTrans(sc, payVoucher);
					} else {
						throw new PbTransBusinessException(
								transToAdvance.getResMsg());
					}
				} else if (refPay == 3) {// 零余额到归集行划款户
					// TODO:定值，交易类型要改变
					payVoucher.setTrade_type(TradeConstant.PAY2AGENT_REFUND);
					// 设置划款户
					BankAccount bankAccount = BankAccountValueSetUtil
							.getAgentAccount(payVoucher, sc);
					payVoucher.setAgent_account_no(bankAccount.getAccount_no());
					payVoucher.setAgent_account_name(bankAccount
							.getAccount_name());
					payVoucher
							.setAgent_account_bank(bankAccount.getBank_name());
					transResult = transService.payTrans(sc, payVoucher);

				}
			}else{
				transResult = transService.payTrans(sc, payVoucher);
				log.info("凭证号：" + payVoucher.getPay_voucher_code());
			}

		// 给支付明细交易流水赋值
		PbUtil.batchSetValue(reqList, "agent_business_no",
				payVoucher.getAgent_business_no());

		total.middle("+++++++++++调用银行核心系统转账耗时：");
		// 交易成功
		if (transResult != null && transResult.getResStatus() == 0) {
			List<PayVoucher> vouList = new ArrayList<PayVoucher>();
			vouList.add(payVoucher);
		} else {
			throw new PbTransException(transResult.getResMsg());
		}

	}

	/**
	 * 登记普通支付凭证信息，包括正常支付的数据包括直接支付、授权支付（不包括，托收、一款两票）
	 * 
	 * @param sc
	 * @param pvList
	 *            支付凭证list，里面是修改过收款人行号、结算方式后的数据
	 * @param recordType
	 *            0不记账 1记账 2强制记账
	 */
	public void acceptCommonSignPayVoucher(final Session sc,
			List<PayVoucher> payVoucherList, final int recordType) {
		
		acceptCommonSignPayVoucher(sc,payVoucherList,recordType,true );
	}
	
	/**
	 * 特殊指令支付，包括现金及一款两票等业务
	 * @param sc
	 * @param p
	 * @param accountType
	 * @throws Exception 
	 */
	public void sepcialPay(final Session sc, PayVoucher p,String accountType) throws Exception{
	
		String cashCode = ElementUtil.getEleValue(PbParaConstant.CASH, "现金",p.getAdmdiv_code());//重庆现金为现付
		
		List<PayVoucher> list = new ArrayList<PayVoucher>();
		list.add( p );
		
		//如果是现金，直接调用转账处理即可
		if (cashCode.equals( p.getSet_mode_code() ) ){
			acceptCommonSignPayVoucher(sc, list, 0);
		}else{//请款加转账
			String returnMsg;
			String payVoucherCode = p.getPay_voucher_code();
			if( StringUtil.isEmpty( p.getBatch_no() ) ){
				try {
					returnMsg = this.batchReqMoney(sc, list, accountType);
				}catch(SocketTimeoutException es){
					throw new SocketTimeoutException("请款超时");
				}catch (Exception e) {
					throw new RuntimeException("请款失败");
				}
			}else{
				try {
					returnMsg = this.batchReqMoney(sc, list, accountType);
				}catch(SocketTimeoutException es){
					throw new SocketTimeoutException("请款超时");
				}catch (Exception e) {
					throw new RuntimeException("请款失败");
				}
			}
			for (PayVoucher rp:list){
				rp.setTransReqId(rp.getAgent_business_no());
			}
			if( !StringUtil.isEmpty( returnMsg )&& returnMsg.contains("超时")){
				throw new SocketTimeoutException(returnMsg);
			}
			if( !StringUtil.isEmpty( returnMsg )){
				throw new RuntimeException(returnMsg);
			}
			
			p.setPay_voucher_code(payVoucherCode);
			try {
				this.acceptCommonSignPayVoucher(sc, list, 0);
			}catch (Exception e) {
				this.writeoffVoucher(sc, list);
				throw new Exception(e);
			}
			
			
		}
	}
	
	/***************************************************************************
	 * add zhouqi 20131217 湖南农行转账接口
	 * 
	 * @param sc
	 * @param payList
	 * @param transType
	 * @throws Exception
	 */
	public String accepBankTransferVoucher(final Session sc,
			List<PayVoucher> payList, final boolean isTrans) throws Exception {
		if (ListUtils.isEmpty(payList)) {
			throw new CommonException("凭证信息为空");
		}
		StringBuffer excetionMsg = new StringBuffer();
		String admdivCode = payList.get(0).getAdmdiv_code();
		// 判断当前时间是否在财政的日始日终时间之内，不是则抛出异常提示
		if (!finService.isInDay(payList.get(0))) {
			throw new FinIsinDayException("当前时间不在财政【" + admdivCode+ "】日始日终时间之内！");
		}
		// 获取主单单据类型ID
		long billTypeId = Parameters.getLongParameter(PayConstant.BILL_TYPE_PAY_VOUCHER);
		// 明细为空才加载明细
		Object details = PlatformUtils.getProperty(payList.get(0), "details");
		if (details == null || ((List) details).size() == 0) {
			// 主单ID数组
			long ids[] = BillUtils.getBillIds(payList);
			// 查询对应的明细信息
			List<PayRequest> requests = (List<PayRequest>) payCommonService
					.loadDetailsByBill(sc, billTypeId, ids, null);
			// 设置单据和明细的关联关系
			PbUtil.setBillDetails((List<PayVoucher>) payList, requests,"pay_voucher_id");
		}
		StringBuffer errorMsg = new StringBuffer();
		final TimeCalculator total = new TimeCalculator(log);
		total.start();
		total.middle("+++++++转账开始");
		//modify by cyq 2015/1/14  批量验证
		this.batchPayVoucherValidate2EVoucher(payList);
		final List<PayVoucher> payVoucherSingleList = new ArrayList<PayVoucher>(1); 
		//转账后是否签章发送
		int isSend = PbParameters.getIntParameter(PbParaConstant.IS_SEND_PAYVOUCHER);
		for (PayVoucher pp : payList) {
			boolean sendabled = true;
			if(pp.isError()){
				errorMsg.append("【" + pp.getPay_voucher_code() + "】"
																+ pp.getErrorMessage());
				continue;
			}
			
			// 获取该凭证的明细列表
			List<PayRequest> detailList = new ArrayList<PayRequest>();
			for (Billable bill : pp.getDetails()) {
				detailList.add((PayRequest) bill);
			}
			final PayVoucher p = pp;
			final List<PayRequest> reqList = detailList;
			try {
				
				smallTrans.newTransExecute(new ISmallTransService() {
					public void doExecute() throws Exception {
						//支付天数参数控制
						int  condrolDays =  PbParameters.getIntParameter("pb.trans.notTransDay", p.getAdmdiv_code());
						if(condrolDays < 0){
							throw new PbException("参数:pb.trans.notTransDay 配置不合法!");
						}else if(condrolDays > 0){
							int day = DateTimeUtils.daysBetween(p.getVou_date(),DateTimeUtils.TransLogDateTime());
							if(day > condrolDays){
								throw new PbException("有凭证超过["+condrolDays+"]天未支付，请重新选择支付数据！");
							}
						}
						
						lockBillForTrans(sc, p, "business_type", 1, p.getBusiness_type());
						
						if(p.getPay_amount().signum() == 1){
							if(ElementUtil.getEleValue(PbParaConstant.CASH, "现金",p.getAdmdiv_code()).equals(p.getSet_mode_code())){//重庆现金改为现付
								p.setTrade_type(TradeConstant.PAY2PAYEECASH);
							}else{
								p.setTrade_type(TradeConstant.PAY2PAYEE);
							}
						}else{
							p.setTrade_type(TradeConstant.PAY2ADVANCE_REFUND);
						}
						//先走工作流，再转账
						TimeCalculator tc = new TimeCalculator(log);
						tc.start();
						tc.middle("+++++++++++++走工作流开始");
						payVoucherSingleList.clear();
						payVoucherSingleList.add(p);
						if (!(p.getTask_id() > 0)) {
							// 调用工作流录入
							workflow.createProcessInstance(sc,"PB_PAY_VOUCHER", 
									payVoucherSingleList, false);
						}
						// 完成送审操作
						workflow.signalProcessInstance(sc, payVoucherSingleList, 
								PayConstant.WORK_FLOW_NEXT, "转账");
						
						//进行额度控制
						//直接支付的pay_type_code
						String directPay = PbParameters.getStringParameter(PbParaConstant.DIRECTPAY_PAY_TYPE_CODE, 
								p.getAdmdiv_code());
						if(p.getPay_amount().signum() == 1 && !p.getPay_type_code().startsWith(directPay)){
							balanceService.payRequestsEntrance(sc, reqList, false);
						}
						tc.middle("+++++++++++++走工作流耗时:");
						total.middle("+++++++++++调用银行核心系统转账开始");
						
						//hsq 2015年10月12日15:52:47 厦门农行备户金额度控制
						//备户金额度控制必须加入到事务中
						Integer isBHJPay = PbParameters.getIntParameter(PbParaConstant.IS_BHJ_PAY);
						controlBHJ(sc, p, isBHJPay, p.getTrade_type());
						
						TransReturnDTO transResult = null;
						if (isTrans) {
							/**
							 * 需求源于贵州农行
							 * 退款时,若退款模式为不需要转账,则直接返回成功
							 * lfj 2015-08-06
							 */
							// 退款的转账模式
							int refPay = PbParameters.getIntParameter("pb.ref.payTrans");
							if(p.getPay_amount().signum() == -1 && refPay == 0) {
								transResult = transService.manTrans(sc, p);
								p.setManual_trans_flag( 1 );
							} else {
								transResult = transService.payTrans(sc, p);
							}
						} else {
							transResult = transService.manTrans(sc, p);
							p.setManual_trans_flag( 1 );
						}
						total.middle("+++++++++++调用银行核心系统转账耗时：");
						if (transResult != null && transResult.getResStatus() == 0) {
							Timestamp nowTime = DateTimeUtils.nowDatetime();
							// 设置为已转账
							p.setBusiness_type(PayConstant.Has_CONFIRMED);
							//p.setVoucherFlag(XmlConstant.VOUCHERFLAG_VALUE_RETURN);
							if (!p.getSet_mode_name().contains("现金")) {
								p.setXPayAmt(p.getPay_amount());
							}
							// 更新支付凭证数据
//							p.setTask_id(reqList.get(0).getTask_id());
							p.setPay_date(nowTime);
							p.setPayDate(PbUtil.getCurrDate());
							p.setTrans_succ_flag( TradeConstant.TRANS_SUCC );
							p.setTrans_res_msg("转账成功");
							List<String> updateFileList = new ArrayList<String>();
							updateFileList.add("pay_date");
							updateFileList.add("payDate");
							updateFileList.add("business_type");
							updateFileList.add("task_id");
							updateFileList.add("trans_res_msg");
							updateFileList.add("trans_succ_flag");
							updateFileList.add("agent_business_no");
						    updateFileList.add("accthost_seqid");
						//	updateFileList.add("voucherFlag");
							updateFileList.add("last_ver");
							updateFileList.add("pay_amount");
							updateFileList.add("payee_account_name");
							updateFileList.add("payee_account_no");
							updateFileList.add("payee_account_bank");
							updateFileList.add("payee_account_bank_no");
							updateFileList.add("majorUserCode");
							updateFileList.add("cash_no");
							updateFileList.add("tellerCode");
							updateFileList.add("cashTransFlag");
					
							
							
							//农行专项资金
							updateFileList.add("cntrl_spcl_fund_bdgtdocno");
							updateFileList.add("local_sepr_bdgtdocno");
							//updateFileList.add("acct_warrntcode");
							//updateFileList.add("bdgt_subjcode");
							updateFileList.add("fund_src");
							updateFileList.add("spcl_type_name");
							updateFileList.add("spcl_type_code");
							updateFileList.add("manual_trans_flag");
							
							billEngine.updateBill(sc, updateFileList, payVoucherSingleList,false);
							//更新明细数据
							PbUtil.batchSetValue(reqList, "agent_business_no", p.getAgent_business_no());
							PbUtil.batchSetValue(reqList, "set_mode_code", p.getSet_mode_code());
							PbUtil.batchSetValue(reqList, "set_mode_name", p.getSet_mode_name());
							//防止其未将只支付日期注入明细中PbUtil.batchSetValue(reqList, "pay_date", nowTime);
							for(PayRequest temp:reqList){
								temp.setPay_date(nowTime);
							}
							List<String> detailUpdateListList = new ArrayList<String>();
							detailUpdateListList.add("pay_date");
							detailUpdateListList.add("agent_business_no");
							detailUpdateListList.add("set_mode_code");
							detailUpdateListList.add("set_mode_name");
							/**
							 * BUG #11933 现金限额时，单条明细情况下会修改金额字段,
							 * 若不更新，则会造成计划额度计算失败
							 * lfj 2015-11-02
							 */
							detailUpdateListList.add("pay_amount");
							billEngine.updateBill(sc, detailUpdateListList, reqList, false);
							tc.stop();
						} else {
							log.error("转账失败,核心返回消息：" + transResult.getResMsg());
							throw new PbTransException(transResult
									.getResMsg());
						}
					}
				});
			}catch(PbTransUnKnownException e){
				sendabled = false;
				//转账异常后保存失败原因
				p.setReturn_reason(e.getMessage());
				p.setBusiness_type(PayConstant.Fail_CONFIRMED);//TradeConstant.TRANS_UNKOWN前台没有这个状态，更新为失败状态，在转账失败状态下可以查询到数据
				List<String> updateFileList = new ArrayList<String>();
				updateFileList.add("return_reason");
				updateFileList.add("agent_business_no");
				updateFileList.add("business_type");
				updateField(sc,p,updateFileList);
				log.error(e.getMessage());
				errorMsg.append("【" + p.getPay_voucher_code() + "】"+ e.getMessage());
			}catch (PbTransException e1) {
				sendabled = false;
				//转账异常后保存失败原因
				p.setReturn_reason(e1.getMessage());
				p.setBusiness_type(PayConstant.Fail_CONFIRMED);
				List<String> updateFileList = new ArrayList<String>();
				updateFileList.add("return_reason");
				updateFileList.add("agent_business_no");
				updateFileList.add("business_type");
				updateField(sc,p,updateFileList);
				log.error(e1.getMessage());
				errorMsg.append("【" + p.getPay_voucher_code() + "】"+ e1.getMessage());
			} catch (WorkflowException we){
				sendabled = false;
				log.error("转账失败：原因：" + we.getMessage());
				errorMsg.append("【" + p.getPay_voucher_code() + "】"+ we.getMessage());
			}
			catch (Exception e) {
				sendabled = false;
				log.error("转账失败：原因：" + e.getMessage());
				errorMsg.append("【" + p.getPay_voucher_code() + "】"+ e.getMessage());
				/**
				 * 重庆农行
				 * 关于多级账簿 不足10位的填充0的问题，需要优化
				 * 1、支付凭证初次支付时，按要求填充
				 * 2、支付失败，再次支付就不填充了
				 * 3、再次支付失败，需填充时，手工维护为未支付状态
				 * 
				 * 跟重庆农行科技部协商转账失败后不填充0，所以失败后更新凭证状态
				 */
				p.setBusiness_type(PayConstant.Fail_CONFIRMED);
				updateTradeResMsg(sc, p);
			}
			//签章发送放在事务中
			if(isSend ==1 && sendabled && p.getPay_amount().signum()>0 ){
				try {
					smallTrans.newTransExecute(new ISmallTransService() {

						public void doExecute() throws Exception {
								signAndSendPayVoucherByNoFlow(sc,payVoucherSingleList, 1);
							}
						});
				} catch (Exception e) {
					errorMsg.append("【" + p.getPay_voucher_code() + "】转账成功，");
					errorMsg.append(e.getMessage() + ";");
					//TODO：异常处理
					log.error("签章异常",e);
				}
			}
		}
		log.debug("转账完成");
		total.stop();
		if (errorMsg.length() > 0) {
			excetionMsg.append("存在转账失败的数据，凭证"+ errorMsg.substring(0, errorMsg.length() - 1));
			throw new Exception(excetionMsg.toString());//自助柜面需捕获到错误异常信息,否则会走签章发送流程
		}
		return excetionMsg.toString();
	}
	

	/**
	 * add by liutianlong 湖南农行多线程转账
	 */
	public String acceptTransVouhcerByThread(final Session sc,
			List<PayVoucher> payList, final boolean isTrans){
		if (ListUtils.isEmpty(payList)) {
			throw new CommonException("凭证信息为空");
		}
		String excetionMsg = null;
		String admdivCode = payList.get(0).getAdmdiv_code();
		// 判断当前时间是否在财政的日始日终时间之内，不是则抛出异常提示
		if (!finService.isInDay(payList.get(0))) {
			throw new FinIsinDayException("当前时间不在财政【" + admdivCode+ "】日始日终时间之内！");
		}
		// 获取主单单据类型ID
		long billTypeId = Parameters.getLongParameter(PayConstant.BILL_TYPE_PAY_VOUCHER);
		// 明细为空才加载明细
		Object details = PlatformUtils.getProperty(payList.get(0), "details");
		if (details == null || ((List) details).size() == 0) {
			// 主单ID数组
			long ids[] = BillUtils.getBillIds(payList);
			// 查询对应的明细信息
			List<PayRequest> requests = (List<PayRequest>) payCommonService.loadDetailsByBill(sc, billTypeId, ids, null);
			// 设置单据和明细的关联关系
			PbUtil.setBillDetails((List<PayVoucher>) payList, requests,"pay_voucher_id");
		}
		final StringBuffer errorMsg = new StringBuffer();
		TimeCalculator total = new TimeCalculator(log);
		log.info("批量转账开始................");
		this.batchPayVoucherValidate2EVoucher(payList);
		total.start();
		//多线程转账线程池
		MyThreadPoolExecutor transPool = new MyThreadPoolExecutor(3, 200, 0, TimeUnit.SECONDS,
				new LinkedBlockingQueue(),new ThreadPoolExecutor.DiscardOldestPolicy());
		
		//转账后是否签章发送
		int isSend = PbParameters.getIntParameter(PbParaConstant.IS_SEND_PAYVOUCHER);
		
		final List<PayVoucher> payVoucherSingleList = new ArrayList<PayVoucher>(1); 
		
		for (final PayVoucher pp : payList) {
			transPool.execute(new Runnable() {
				public void run() {
					//如果超出参数中的参数天数，则不能支付
					int  condrolDays =  PbParameters.getIntParameter("pb.trans.notTransDay", pp.getAdmdiv_code());
					if(condrolDays < 0){
						throw new PbException("参数:pb.trans.notTransDay 配置不合法!");
					}else if(condrolDays > 0){
						int day = 0;
						try {
							day = DateTimeUtils.daysBetween(pp.getVou_date(),DateTimeUtils.TransLogDateTime());
						} catch (ParseException e) {
							// TODO Auto-generated catch block
							e.printStackTrace();
						}
						if(day > condrolDays){
							throw new PbException("有凭证超过["+condrolDays+"]天未支付，请重新选择支付数据！");
						}
					}
					final TimeCalculator one = new TimeCalculator(log);
					log.info("凭证号：" + pp.getPay_voucher_code() + "   " + "转账开始.......");
					one.start();
					// 获取该凭证的明细列表
					final List<PayRequest> detailList = new ArrayList<PayRequest>();
					for (Billable bill : pp.getDetails()) {
						detailList.add((PayRequest) bill);
					}
					//从明细中向主单赋值，基层预算单位
					PbUtil.batchSetValue(detailList, "set_mode_code", pp.getSet_mode_code());
					PbUtil.batchSetValue(detailList, "set_mode_name", pp.getSet_mode_name());
					pp.setVou_date(new SimpleDateFormat("yyyyMMdd").format(new Date()));
					pp.setAgency_name(detailList.get(0).getAgency_name());
					
					try {
						smallTrans.newTransExecute(new ISmallTransService() {
							public void doExecute() throws Exception {
								TimeCalculator tc = new TimeCalculator(log);
								log.info("+++++++++++++调用银行核心系统开始");
								tc.start();
								if(pp.getPay_amount().signum() == 1){
									if(ElementUtil.getEleValue( PbParaConstant.CASH, "现金",pp.getAdmdiv_code()).equals(pp.getSet_mode_code())){
										pp.setTrade_type(TradeConstant.PAY2PAYEECASH);
									}else{
										pp.setTrade_type(TradeConstant.PAY2PAYEE);
									}
								}else{
									pp.setTrade_type(TradeConstant.PAY2ADVANCE_REFUND);
								}
								List<PayVoucher> list = new ArrayList<PayVoucher>();
								list.add(pp);
								//先走工作，再转账
								if (!(pp.getTask_id() > 0)) {
									// 调用工作流录入
									workflow.createProcessInstance(sc,"PB_PAY_VOUCHER", list, false);
								}
								// 完成送审操作
								workflow.signalProcessInstance(sc, list, PayConstant.WORK_FLOW_NEXT, "转账");
								
								//进行额度控制
								String directPay = PbParameters.getStringParameter(PbParaConstant.DIRECTPAY_PAY_TYPE_CODE, pp.getAdmdiv_code());
								if(pp.getPay_amount().signum() == 1 && !pp.getPay_type_code().startsWith(directPay)){
									balanceService.payRequestsEntrance(sc, detailList , false);
								}
								
								TransReturnDTO transResult = null;
								if (isTrans) {
									/**
									 * 需求源于贵州农行
									 * 退款时,若退款模式为不需要转账,则直接返回成功
									 * lfj 2015-08-06
									 */
									// 退款的转账模式
									int refPay = PbParameters.getIntParameter("pb.ref.payTrans");
									if(pp.getPay_amount().signum() == -1 && refPay == 0) {
										transResult = transService.manTrans(sc, pp);
										pp.setManual_trans_flag( 1 );
									} else {
										transResult = transService.payTrans(sc, pp);
										pp.setManual_trans_flag( 1 );
									}
								} else {
									transResult = transService.manTrans(sc, pp);
								}
								one.middle("+++++++++++调用银行核心系统转账耗时：");
								if (transResult != null && transResult.getResStatus() == 0) {

									Timestamp nowTime = DateTimeUtils.nowDatetime();
									// 设置为已转账
									pp.setBusiness_type(PayConstant.Has_CONFIRMED);
									/**
									 * BUG #13012 【直接/授权支付退款通知书查询】根据凭证状态过滤无效
									 * 修复退款通知书转账时将凭证状态置为回单状态导致查询凭证状态错误
									 * lfj 2016-04-19
									 */
//									pp.setVoucherFlag(XmlConstant.VOUCHERFLAG_VALUE_RETURN);
									if (!pp.getSet_mode_name().contains("现金")) {
										pp.setXPayAmt(pp.getPay_amount());
									}
									// 更新支付凭证数据
//									p.setTask_id(reqList.get(0).getTask_id());
									pp.setPay_date(nowTime);
									pp.setPayDate(PbUtil.getCurrDate());
									pp.setTrans_res_msg("转账成功");
									List<String> updateFileList = new ArrayList<String>();
									updateFileList.add("pay_date");
									updateFileList.add("payDate");
									updateFileList.add("business_type");
									updateFileList.add("task_id");
									updateFileList.add("trans_res_msg");
									updateFileList.add("agent_business_no");
								//	updateFileList.add("voucherFlag");
									updateFileList.add("last_ver");
									updateFileList.add("XPayAmt");
									updateFileList.add("payee_account_name");
									updateFileList.add("payee_account_no");
									updateFileList.add("payee_account_bank");
									updateFileList.add("payee_account_bank_no");
									updateFileList.add("majorUserCode");
									updateFileList.add("cash_no");
									updateFileList.add("tellerCode");
									updateFileList.add("cashTransFlag");
									updateFileList.add("manual_trans_flag");
//									List<PayVoucher> pList = new ArrayList<PayVoucher>();
//									pList.add(p);
									billEngine.updateBill(sc, updateFileList, list,false);
									//更新明细数据
//									PbUtil.batchSetValue(reqList, "pay_date", nowTime);
									//防止其未将只支付日期注入明细中PbUtil.batchSetValue(reqList, "pay_date", nowTime);
									for(PayRequest temp:detailList){
										temp.setPay_date(nowTime);
									}
									PbUtil.batchSetValue(detailList, "agent_business_no", pp.getAgent_business_no());
									billEngine.updateBill(sc, null, detailList, false);
									one.middle("凭证号：" + pp.getPay_voucher_code() + "   " + "结束，耗时：");
								} else {
									log.error("转账失败,核心返回消息：" + transResult.getResMsg());
									throw new PbTransBusinessException(transResult
											.getResMsg());
								}
							}
						});
					}catch (PbTransException e1) {
						//转账异常后保存失败原因
						pp.setReturn_reason(e1.getMessage());
						List<String> updateFileList = new ArrayList<String>();
						updateFileList.add("return_reason");
						updateField(sc,pp,updateFileList);
						log.error(e1.getMessage());
						errorMsg.append("【" + pp.getPay_voucher_code() + "】"+ e1.getMessage());
					} catch (WorkflowException we){
						log.error("转账失败：原因：" + we.getMessage());
						errorMsg.append("【" + pp.getPay_voucher_code() + "】"+ we.getMessage());
					}
					catch (Exception e) {
						log.error("转账失败：原因：" + e.getMessage());
						errorMsg.append("【" + pp.getPay_voucher_code() + "】"+ e.getMessage());
//						pp.setBusiness_type(PayConstant.Fail_CONFIRMED);
//						updateTradeResMsg(sc, pp);
						
					}
				
				}
			});
		}
		transPool.lock();
		log.info("批量转账结束................");
		total.stop();
		for (final PayVoucher pp : payList) {
			payVoucherSingleList.clear();
			payVoucherSingleList.add(pp);
			if(isSend ==1 && pp.getBusiness_type()==1 && pp.getPay_amount().signum()>0 ){
			try {
				smallTrans.newTransExecute(new ISmallTransService() {

					public void doExecute() throws Exception {
							PayServiceImpl.this.signAndSendPayVoucherByNoFlow(sc,payVoucherSingleList, 1);
						}
					});
			} catch (Exception e) {
				errorMsg.append("【" + pp.getPay_voucher_code() + "】转账成功，");
				errorMsg.append(e.getMessage() + ";");
				//TODO：异常处理
				log.error("签章异常",e);
			}
			}
		}
		if (errorMsg.length() > 0) {
			excetionMsg = "操作失败，凭证"+ errorMsg.substring(0, errorMsg.length() - 1);
		}
		return excetionMsg;
	}
	
	/**
	 * 生成入账通知单
	 * @param sc
	 * @param ids
	 */
	@SuppressWarnings("unchecked")
	public List<PayAccountNote> createNote(Session sc, long[] ids) {
		// 校验传入id数组是否为空
		NormalCaculate.longArrayCaculate(ids, "");
		// 取得主单的单据类型(支付凭证)
		long pay_voucher_id = Parameters.getLongParameter(
				BILL_TYPE_PAY_VOUCHER);
		// 根据ID查询待汇总的主单信息集合
		List<PayVoucher> vouchers = (List<PayVoucher>) payCommonService
				.loadBillsWithDetails(sc, pay_voucher_id, ids);
		return createNote(sc, vouchers);
	}
	
	public List<PayAccountNote> createNote(Session sc, List<PayVoucher> vouchers) {
		if(CollectionUtils.isListEmpty(vouchers)) {
			return null;
		}
		
		if(CollectionUtils.isListEmpty(vouchers.get(0).getDetails())) {
			long [] ids = BillUtils.getBillIds(vouchers);
			long billTypeId = Parameters.getLongParameter(
					BILL_TYPE_PAY_VOUCHER);
			List<PayRequest> requests = (List<PayRequest>) payCommonService.loadDetailsByBill(sc, 
					billTypeId, ids, null);
			// 设置单据和明细的关联关系
			PbUtil.setBillDetails((List<PayVoucher>) vouchers, requests, "pay_voucher_id");
		}
		
		// 将主单收、付款人信息复制到明细
		List<PayRequest> requests = (List<PayRequest>) PbUtil
				.copyPayInfo(vouchers);
		// 取得汇总单据类型(入账通知单)
		long billTypeId = Parameters.getLongParameter(
				BILL_TYPE_PAY_ACCOUNT_NOTE);
		
		// 汇总保存
		List<PayAccountNote> panList = (List<PayAccountNote>) billEngine
				.createGroupBill(sc, billTypeId, requests, false);

		payCommonService.updateBillId4Details(sc, panList, requests);
		
		// 更新pb_pay_voucher表上的主键

		// 获取vt_code
		String vtCode = configService.getVoucherTypeCode(panList.get(0)
				.getBiz_type_id(), panList.get(0).getAdmdiv_code());

		for (PayAccountNote dto : panList) {
			dto.setVt_code(vtCode);
			dto.setVoucherFlag(XmlConstant.VOUCHERFLAG_VALUE_SEND);
			VoucherStatus.S_VOCHER_M_NO_SEND.setVoucherStatus(dto);
			dto.setVou_date(new SimpleDateFormat("yyyyMMdd").format(new Date()));
			// 需要更新send_flag
			dto.setSend_flag(0);
		}
		// 更新PayAccountNote
		List<String> updateFileds = new ArrayList<String>();
		updateFileds.add("vt_code");
		updateFileds.add("voucherFlag");
		updateFileds.add("voucher_status");
		updateFileds.add("voucher_status_des");
		updateFileds.add("vou_date");
		updateFileds.add("send_flag");
		billEngine.updateBill(sc, updateFileds, panList, false);
		
		// 建立凭证主单与入账通知单的关系
		for ( PayVoucher p : vouchers ) {
			PayRequest r = (PayRequest) p.getDetails().get(0);
			p.setPay_account_note_id(r.getPay_account_note_id());
		}
		
		List<String> updateFileds2 = new ArrayList<String>();
		updateFileds2.add("pay_account_note_id");
		
		billEngine.updateBill(sc, updateFileds2, vouchers, false);
		
		return panList;
	}
	
	/**
	 * 撤销生成入账通知单
	 */
	public void unCreateNote(Session sc, long[] ids) throws Exception{
		// 入账通知单单据类型
		long billTypeId = Parameters.getLongParameter(
				PayConstant.BILL_TYPE_PAY_ACCOUNT_NOTE);
		//因此处需记录日志，需查询单据信息
		List<Long> list = new ArrayList<Long>();
		for(int i=0;i<ids.length;i++){
			list.add(ids[i]);
		}
		List<Billable> bizList = (List<Billable>) billEngine.loadBillByIds(sc, billTypeId, list);
		CommonMethod.deleteBill(sc, billTypeId, ids);
		/**
		 * 清空pay_voucher、pay_request表中的clear_voucher_id
		 */
		Where where = null;
		for(long id : ids){
			where = new Where();
			where.addLogic(new Eq("pay_account_note_id", id));
			billEngine.updateBill(sc, Parameters.getLongParameter(PayConstant.BILL_TYPE_PAY_VOUCHER),
					new Set().add("pay_account_note_id", 0), where);
			billEngine.updateBill(sc, Parameters.getLongParameter(PayConstant.BILL_TYPE_PAY_REQUEST),
					new Set().add("pay_account_note_id", 0), where);
		}
	    // 保存的操作日志将保存在pb_wf_tasklog表中
	    logService.saveTaskLogInfo(sc, bizList, "撤销生成入账通知书");
		
	}

	/**
	 * 入账通知单生成并发送
	 */
	public void createAccountNote(Session sc, long[] ids) throws Exception {
		
		List<PayAccountNote> payAccountNoteList = createNote(sc, ids);
		Timestamp nowTime = DateTimeUtils.nowDatetime();
		for ( PayAccountNote dto : payAccountNoteList ) {
			// 发送
			dto.setSend_flag(1);
			dto.setSend_date(nowTime);
		}
		// 更新send_flag
		List<String> updateFileds = new ArrayList<String>();
		updateFileds.add("send_flag");
		updateFileds.add("send_date");
		billEngine.updateBill(sc, updateFileds, payAccountNoteList, false);
		 // 保存的操作日志将保存在pb_wf_tasklog表中
	    logService.saveTaskLogInfo(sc, payAccountNoteList, "入账通知书签章发送");
		try {
			String decOrgType = PbParameters
					.getStringParameter(PayConstant.DEST_MOF_ORG_TYPE);
			baseBizService.signAndSend2EVoucher(sc, decOrgType,
					XmlConstant.VOUCHERFLAG_VALUE_SEND, payAccountNoteList);
		} catch (Exception e) {
			throw new PbException("入账通知单签章发送凭证库发生异常,原因" + e.getMessage(), e);
		}
	}

	/**
	 * 入账通知签章发送
	 */
	@SuppressWarnings("unchecked")
	public void signAndSendAccountNoteOrDaily(final Session sc, long[] ids,
			long billTypeId) throws Exception {
		// 校验传入id数组是否为空
		NormalCaculate.longArrayCaculate(ids, "");
		// 更新发送标志
		final List<String> updateFields = new ArrayList<String>(2);
		updateFields.add("send_flag");
		//更新发送日期
        Timestamp nowTime = DateTimeUtils.nowDatetime();
		updateFields.add("send_date");
		
		if (billTypeId == Parameters.getLongParameter(
				PayConstant.BILL_TYPE_PAY_ACCOUNT_NOTE)) {
//			List<PayAccountNote> panList = (List<PayAccountNote>) billEngine
//					.loadBillByIds(sc, billTypeId, NumberUtil.toObjectList(ids));
			List<PayAccountNote> panList = (List<PayAccountNote>) payCommonService
					.loadBillsWithDetails(sc, billTypeId, ids);
            for(PayAccountNote pan:panList){
                pan.setSend_date(nowTime);
                pan.setSend_flag(1);
            }
			billEngine.updateBill(sc, updateFields, panList, false);
			try {
				// 保存的操作日志将保存在pb_wf_tasklog表中
			    logService.saveTaskLogInfo(sc, panList, "入账通知书签章发送");
				String decOrgType = PbParameters
						.getStringParameter(PayConstant.DEST_MOF_ORG_TYPE);
				baseBizService.signAndSend2EVoucher(sc, decOrgType,
						XmlConstant.VOUCHERFLAG_VALUE_SEND, panList);
			} catch (Exception e) {
				throw new PbException("入账通知单签章发送凭证库发生异常,原因：" + e.getMessage(),
						e);
			}
		} else if (billTypeId == Parameters.getLongParameter(
				PayConstant.BILL_TYPE_PAY_CLEAR_DAILY)) {
//			List<PayClearDaily> panList = (List<PayClearDaily>) billEngine
//					.loadBillByIds(sc, billTypeId, NumberUtil.toObjectList(ids));
			//List<PayClearDaily> panList = (List<PayClearDaily>) this.loadBillsWithDetails(sc, billTypeId, ids);
			List<PayDaily> panList = (List<PayDaily>) payCommonService
					.loadBillsWithDetails(sc, billTypeId, ids);
            for(PayDaily pan:panList){
                pan.setSend_date(nowTime);
                pan.setSend_flag(1);
            }
			Map<String,List<PayDaily>> hashMap = new HashMap<String, List<PayDaily>>();
			for(PayDaily p:panList){
				String key = p.getVt_code();
				if(ListUtils.isEmpty(hashMap.get(key))){
					List<PayDaily> tempList = new ArrayList<PayDaily>();
					tempList.add(p);
					hashMap.put(key, tempList);
				}else{
					hashMap.get(key).add(p);
				}
			}
			
			StringBuffer errorMsg  = new  StringBuffer();
			for(  String list : hashMap.keySet()){
				final List<PayDaily> daliyList = hashMap.get(list);
				try {
					smallTrans.newTransExecute(new ISmallTransService() {
						public void doExecute() throws Exception {
							// 保存的操作日志将保存在pb_wf_tasklog表中
						    logService.saveTaskLogInfo(sc, daliyList, "日报签章发送");
							billEngine.updateBill(sc, updateFields, daliyList, false);
							
							String decOrgType = PbParameters
							.getStringParameter(PayConstant.DEST_MOF_ORG_TYPE);
							baseBizService.signAndSend2EVoucher(sc, decOrgType,
							XmlConstant.VOUCHERFLAG_VALUE_SEND, daliyList);
						}
					});
				} catch (Exception e) {
					errorMsg.append(e.getMessage());
				}
				
				if(!StringUtil.isEmpty(errorMsg.toString())){
					throw new PbException("日报通知单签章发送凭证库发生异常,原因：" + errorMsg.toString());
				}
			}
			
		}

		// List<PayAccountNote>
		// panList=(List<PayAccountNote>)billEngine.loadBillByIds(sc,
		// billTypeId, NumberUtil.toObjectList(ids));
		// panList1=panList;
		// //获取vt_code
		// String vtCode=configService.getVoucherTypeCode(sc,
		// panList.get(0).getBiz_type_id());
		// try{
		// String decOrgType =
		// PbParameters.getStringParameter(PayConstant.DEST_MOF_ORG_TYPE);
		// baseBizService.signAndSend2EVoucher(sc,decOrgType,XmlConstant.VOUCHERFLAG_VALUE_SEND,
		// panList);
		// }catch(Exception e){
		// throw new PbException("入账通知单签章发送凭证库发生异常",e);
		// }
	}

	/**
	 * 支出日报生成
	 */
	@SuppressWarnings("unchecked")
	public void createPayDaily(Session sc, long[] ids) {
		// 校验ID集合
		NormalCaculate.longArrayCaculate(ids, "");
		// 取得汇总单单据类型
		long billTypeId = Parameters.getLongParameter(
				PayConstant.BILL_TYPE_PAY_CLEAR_DAILY);

		long voucherId = Parameters.getLongParameter(PayConstant.BILL_TYPE_PAY_VOUCHER);
		// 根据ID查询待汇总的主单信息集合
		List<PayVoucher> vouchers = (List<PayVoucher>) payCommonService
				.loadBillsWithDetails(sc, voucherId, ids);
		//是否等待签收成功 且日报生成在划款单之前
		if(PbParameters.getIntParameter( PbParaConstant.DAILY_IS_WARIT_CONFIRM, vouchers.get(0).getAdmdiv_code())==1){
			dealFail(vouchers);
		}
		// 将主单收、付款人信息复制到明细
		List<PayRequest> requests = (List<PayRequest>) PbUtil
				.copyPayInfo(vouchers);
		// 校验明细集合
		NormalCaculate.listCaculate(requests, "");
		// 汇总并保存
		List<PayDaily> pdList = (List<PayDaily>) billEngine.createGroupBill(sc,
				billTypeId, requests, false);

		// 获取vtcode
		String vtCode = configService.getVoucherTypeCode( pdList.get(0)
				.getBiz_type_id(), pdList.get(0).getAdmdiv_code());
		pdList = getPayDailyList(pdList,vtCode);
		// 设置voucherFlag
		PbUtil.batchSetValue(pdList, "voucherFlag",
				XmlConstant.VOUCHERFLAG_VALUE_SEND);
		PbUtil.batchSetValue(pdList, "send_flag", 1);
		List<String> updateFields = new ArrayList<String>(1);
		updateFields.add("vt_code");
		updateFields.add("send_flag");
		updateFields.add("vou_date");
		updateFields.add("voucherFlag");
		
		//更新字段 ----> code,  id,  name 
		updateFields.add("pay_bank_code");
		updateFields.add("pay_bank_id");
		updateFields.add("pay_bank_name");
		
		// 更新支付凭证数据
		billEngine.updateBill(sc, updateFields, pdList, false);

		// 更新pb_pay_requst表中的Pay_daily_id
		payCommonService.updateBillId4Details(sc, pdList, requests);
		// 更新pb_pay_voucher表中的Pay_daily_id
		for(PayVoucher voucher : vouchers) {
			PayRequest request = (PayRequest) voucher.getDetails().get(0);
			voucher.setPay_daily_id(request.getPay_daily_id());
		}
		List<String> updateFields1 = new ArrayList<String>();
		updateFields1.add("pay_daily_id");
		billEngine.updateBill(sc, updateFields1, vouchers, false);

		// 明细走工作流
//		workflow.signalProcessInstance(sc, requests, WORK_FLOW_NEXT, "生成授权日报");
		try {
			String decOrgType = PbParameters
					.getStringParameter(PayConstant.DEST_MOF_ORG_TYPE);
			baseBizService.signAndSend2EVoucher(sc, decOrgType,
					XmlConstant.VOUCHERFLAG_VALUE_SEND, pdList);
		} catch (Exception e) {
			throw new PbException("授权支出日报签章发送凭证库失败,原因：" + e.getMessage(), e);
		}
	}
	public void dealFail(List<PayVoucher> allVouchers){
		StringBuffer noConfirmed = new StringBuffer();
		//9表示回单对方签收成功,3表示发送单签收成功
		boolean hasFailed = false;
		for(PayVoucher p : allVouchers){
			if(!("9".equals(p.getVoucher_status()) || "3".equals(p.getVoucher_status()))){	
				noConfirmed.append(p.getPay_voucher_code()).append(",");
				hasFailed =true;
			}
		}
		if(hasFailed){
			
			throw new PbException("凭证处理失败：财政未签收成功，无法生成日报！|"+noConfirmed.toString().substring(0,noConfirmed.toString().length() - 1));
		}
//		if (StringUtil.isNotEmpty(noConfirmed.toString())) {
//			int length = noConfirmed.toString().length();
//			String noStr = noConfirmed.toString().substring(0,length - 1);
//			throw new CommonException("", "凭证：" + noStr + "财政未签收成功，无法清算！");
//		}
	};
	/**
	 * 生成日报 通用方法
	 * @param sc
	 * @param vouchers
	 */
	private void createPayDailyNormal(Session sc, List<PayVoucher> vouchers) throws Exception{
		// 取得汇总单单据类型
		long billTypeId = Parameters.getLongParameter(
				PayConstant.BILL_TYPE_PAY_CLEAR_DAILY);
		// 将主单收、付款人信息复制到明细
		List<PayRequest> requests = (List<PayRequest>) PbUtil
				.copyPayInfo(vouchers);
		// 校验明细集合
		NormalCaculate.listCaculate(requests, "");
		
		//是否等待签收成功
		if(PbParameters.getIntParameter( PbParaConstant.DAILY_IS_WARIT_CONFIRM, vouchers.get(0).getAdmdiv_code())==1){
			dealFail(vouchers);
		}
		
		
		// 汇总并保存
		List<PayDaily> pdList = (List<PayDaily>) billEngine.createGroupBillByBills(sc,
				billTypeId, vouchers, true, true);

		
		List<ElementDTO> elementDTOList = StaticApplication.getMasterDataService().loadAllEleValues( "PAY_BANK",pdList.get(0).getAdmdiv_code());
		//凭证状态赋值
		for (PayDaily dto : pdList) {
		VoucherStatus.S_VOCHER_M_NO_SEND.setVoucherStatus(dto);
		}
		//  遍历出level_num=1
		ElementDTO eledto = null;
		for (ElementDTO elementDTO : elementDTOList) {
			if (elementDTO.getLevel_num() == 1) {
				eledto = elementDTO;
			}
		}
		if (eledto == null) {
			throw new PbException("未找到level_num为1 的基础要素PAY_BANK");
		}

		//对循环赋值
		for (PayDaily dto : pdList) {
			// 获取vtcode
			String vtCode = configService.getVoucherTypeCode( dto
					.getBiz_type_id(), pdList.get(0).getAdmdiv_code());
			dto.setVt_code(vtCode);
			if(StringUtil.isEmpty(dto.getVou_date())){
				dto.setVou_date(new SimpleDateFormat("yyyyMMdd").format(new Date()));
			}
			dto.setPay_bank_code(eledto.getCode()); //code
			dto.setPay_bank_id(eledto.getId());//id
			dto.setPay_bank_name(eledto.getName());//name
		}

		//补充一级代理银行
		
		
		// 设置voucherFlag
		PbUtil.batchSetValue(pdList, "voucherFlag",
				XmlConstant.VOUCHERFLAG_VALUE_SEND);
		//PbUtil.batchSetValue(pdList, "send_flag", 1);
		List<String> updateFields = new ArrayList<String>(1);
		updateFields.add("vt_code");
		//updateFields.add("send_flag");
		updateFields.add("vou_date");
		updateFields.add("voucherFlag");
		
		//更新字段 ----> code,  id,  name 
		updateFields.add("pay_bank_code");
		updateFields.add("pay_bank_id");
		updateFields.add("pay_bank_name");
		//更新凭证状态
		updateFields.add("voucher_status");
		updateFields.add("voucher_status_des");

		// 保存的操作日志将保存在pb_wf_tasklog表中
	    logService.saveTaskLogInfo(sc, pdList, "日报生成");
		// 更新支付凭证数据
		billEngine.updateBill(sc, updateFields, pdList, false);

		// 更新pb_pay_requst表中的Pay_daily_id
		payCommonService.updateBillId4Details(sc, pdList, requests);
		
		//更新主单pay_daily_id
		for(PayVoucher voucher : vouchers) {
			PayRequest request = (PayRequest) voucher.getDetails().get(0);
			voucher.setPay_daily_id(request.getPay_daily_id());
		}
		List<String> updateFields1 = new ArrayList<String>();
		updateFields1.add("pay_daily_id");
		billEngine.updateBill(sc, updateFields1, vouchers, false);
	}
	
	/**
	 * 支出日报生成
	 * 只生成，不发送
	 */
	@SuppressWarnings("unchecked")
	public void createPayDailyNoSend(Session sc, long[] ids) throws Exception{
		// 校验ID集合
		NormalCaculate.longArrayCaculate(ids, "");
		
		long voucherId = Parameters.getLongParameter(PayConstant.BILL_TYPE_PAY_VOUCHER);
		// 根据ID查询待汇总的主单信息集合
		List<PayVoucher> vouchers = (List<PayVoucher>) payCommonService
				.loadBillsWithDetails(sc, voucherId, ids);
		
		createPayDailyNormal(sc, vouchers);
	}
	/**
	 * @author kewei
	 * @todo 根据划款单生成日报
	 * @param sc
	 * @throws BillTypeNotFoundExceptions
	 * @throws CheckFailException
	 * @throws Exception
	 */
	public void createPayDailyByClearVoucher(Session sc,long[] ids1) 
			throws BillTypeNotFoundException, CheckFailException, Exception{
		long payVouBillTypeId = Parameters.getLongParameter(
				PayConstant.BILL_TYPE_PAY_VOUCHER);
		// 明细列表
		List<PayRequest> reqList = (List<PayRequest>) payCommonService
				.loadDetailsByBill(sc, payVouBillTypeId, ids1, null);
		
		//(2)得到所有的划款单
		List<Long> idList = new ArrayList<Long>();
		
		//判断划款单是否已经生成
		for(PayRequest req:reqList){
			if(StringUtil.isEmpty(req.getPay_clear_voucher_code())){
				throw new PbException("凭证号【"+req.getPay_voucher_code()+"】划款单未生成,授权日报无法按照划款单生成！");
			}
			if(!idList.contains(req.getPay_clear_voucher_id()))
				idList.add(req.getPay_clear_voucher_id());
		}
		
		long[] ids = new long[idList.size()];
		for( int i = 0;i < idList.size(); i++ ){
			ids[i] = idList.get(i);
		}
		//List<PayClearVoucher> clearList = (List<PayClearVoucher>) this.loadClearVoucher(sc, null, ids, null, null).getPageData();
		
		List<PayClearVoucher> clearList = (List<PayClearVoucher>) billEngine
				.loadBillByIds(sc, Parameters.getLongParameter(PayConstant.BILL_TYPE_PAY_CLEAR_VOUCHER), 
						NumberUtil.toObjectList(ids));
		List<PayDaily> pdList = new ArrayList<PayDaily>();
		//凭证状态赋值
		for (PayDaily dto : pdList) {
		VoucherStatus.S_VOCHER_M_NO_SEND.setVoucherStatus(dto);
		}
		// 取得汇总单单据类型
		long billTypeId = Parameters.getLongParameter(
				PayConstant.BILL_TYPE_PAY_CLEAR_DAILY);
		//生成日报
		for( PayClearVoucher pc : clearList ){
			PayDaily daily = new PayDaily();
			daily.setAdmdiv_code(pc.getAdmdiv_code());
			daily.setYear(pc.getYear());
			daily.setVt_code("2206");
			daily.setVou_date(pc.getVou_date());
			daily.setCode("");
			daily.setPay_amount(pc.getPay_amount());
			daily.setFund_type_code(pc.getFund_type_code());
			daily.setFund_type_name(pc.getFund_type_name());
			daily.setPay_type_code(pc.getPay_type_code());
			daily.setPay_type_name(pc.getPay_type_name());
			//把支付方式id赋值单号生成支持配置支付方式
			ElementDTO element = ElementUtil.getMdService().loadEleValueByCode(
					PayConstant.PAYTYPE, pc.getPay_type_code(), daily.getAdmdiv_code());
			daily.setPay_type_id(element.getId());
			daily.setPay_bank_code(pc.getPay_bank_code());
			daily.setPay_bank_name(pc.getPay_bank_name());
			daily.setBill_type_id(billTypeId);
//			daily.setTask_id(pc.getTask_id());
			daily.setBgt_type_code(pc.getBgt_type_code());
			daily.setBgt_type_name(pc.getBgt_type_name());
			daily.setDetails(pc.getDetails());
			pdList.add(daily);
		}
		pdList = getPayDailyList(pdList,"2206");
		//保存日报
		this.billEngine.saveBills(sc, pdList);
		PbUtil.batchSetValue(pdList, "voucherFlag",
				XmlConstant.VOUCHERFLAG_VALUE_SEND);
		List<String> updateFields = new ArrayList<String>(1);
		updateFields.add("vt_code");
		updateFields.add("vou_date");
		updateFields.add("voucherFlag");
		//柯伟更改，吉林建行
		updateFields.add("pay_account_bank");
		updateFields.add("pay_account_code");
		// 更新支付凭证数据
		billEngine.updateBill(sc, updateFields, pdList, false);
		//更新凭证状态
		updateFields.add("voucher_status");
		updateFields.add("voucher_status_des");

		// 更新pb_pay_requst表中的Pay_daily_id
		payCommonService.updateBillId4Details(sc, pdList, reqList);
		//更新主单pay_daily_id
		List<PayVoucher> vouchers = (List<PayVoucher>) payCommonService
				.loadBillsWithDetails(sc, payVouBillTypeId, ids1);
		for(PayVoucher voucher : vouchers) {
			PayRequest request = (PayRequest) voucher.getDetails().get(0);
			voucher.setPay_daily_id(request.getPay_daily_id());
		}
		List<String> updateFields1 = new ArrayList<String>();
		updateFields1.add("pay_daily_id");
		billEngine.updateBill(sc, updateFields1, vouchers, false);

		
	}
	
	/**
	 * 签章发送支付凭证
	 */
	public void signAndSendPayVoucher(Session sc,
			List<PayVoucher> payVoucherList, boolean bool, int voucherFlag) throws Exception {
		
		//edit by liutianlong 2016年1月4日，voucherFlag的值直接从业务对象中取
		//真正的值在下载或本方生成时已保存入库
		int voucher_flag = payVoucherList.get(0).getVoucherFlag();
//		
//		int voucher_flag = voucherFlag;
//		//如果是退款的签章发送，voucherFlag要改成0
//		if(payVoucherList.get(0).getPay_amount().signum() == -1){
//			voucher_flag = XmlConstant.VOUCHERFLAG_VALUE_SEND;
//		}
//		 
		//end edit
		
		TimeCalculator tc = new TimeCalculator(log);
		log.debug("签章发送开始-----");
		tc.start();
		// 主单ID数组
		long ids[] = BillUtils.getBillIds(payVoucherList);
		// 支付凭证单据类型
		long billTypeId = Parameters.getLongParameter(PayConstant.BILL_TYPE_PAY_VOUCHER);
		// 明细列表
		List<PayRequest> requestList = new ArrayList<PayRequest>();;
		if(ListUtils.isEmpty(payVoucherList.get(0).getDetails())){
			requestList = (List<PayRequest>) payCommonService
			.loadDetailsByBill(sc, billTypeId, ids, null);
		}else{
			for(PayVoucher p : payVoucherList){
				requestList.addAll((List) p.getDetails());
			}
		}
//		List<PayRequest> requestList = (List<PayRequest>) this
//				.loadDetailsByBill(sc, billTypeId, ids, null);
		// 将明细设置到对应的凭证中
		
		PbUtil.setBillDetails(payVoucherList, requestList, "pay_voucher_id");

		// 设置XPayAmount，宁夏中行使用，不需要更新
		for (PayVoucher p : payVoucherList) {
			p.setXPayAmt(p.getPay_amount());
			p.setVoucherFlag(voucher_flag);
			
		}
//		for (PayRequest r : requestList) {
//			r.setXPayAmt(r.getPay_amount());
//		}
		
		tc.middle("+++++++++++++走工作流开始");
		if (payVoucherList.get(0).getTask_id() == 0) {
			// 调用工作流录入
			workflow.createProcessInstance(sc,
					"PB_PAY_VOUCHER", payVoucherList, false);
//			for (PayVoucher pay : payVoucherList) {
//				List<Billable> reqlist = pay.getDetails();
//				pay.setTask_id(((PayRequest)reqlist.get(0)).getTask_id());
//			}
		}
		tc.middle("+++++++++++++走工作流耗时:");
		
		// 更新发送标志
		List<String> updateFields = new ArrayList<String>(2);
		updateFields.add("send_flag");
		updateFields.add("voucherFlag");
		updateFields.add("last_ver");
		updateFields.add("voucher_status_des");
		updateFields.add("task_id");
		updateFields.add("voucher_status");
		updateFields.add("voucherflag");
		
//		PbUtil.batchSetValue(payVoucherList, "voucher_status", 20);//20为已经发送
		
		PbUtil.batchSetValue(payVoucherList, "send_flag", 1);
		PbUtil.batchSetValue(payVoucherList, "voucher_status_des", null);
		billEngine.updateBill(sc, updateFields, payVoucherList, false);
		billEngine.updateBill(sc, null, requestList, false);

		// 完成送审操作
		String decOrgType = PbParameters
		.getStringParameter(PayConstant.DEST_MOF_ORG_TYPE);
		
		//根据要签章的凭证的区划，从参数表中取是否配置了该区划下的省分行路由，如果配置了则签章到省分行
		String forwardAdmdiv = PbParameters.getStringParameter("pb.forward.admdiv");
		if( StringUtil.isNotEmpty( forwardAdmdiv ) && 
				payVoucherList.get( 0 ).getAdmdiv_code().equals(forwardAdmdiv) ){
			decOrgType = PbParameters.getStringParameter( PbParaConstant.FORWARD_ORG_TYPE );
			updateFields.clear();
			updateFields.add("clear_flag");
			PbUtil.batchSetValue(payVoucherList, "clear_flag", 1);
			
			//add by liutianlong 20150511 转发的数据不能被市行做清算、日报、入账通知书
			PbUtil.batchSetValue(payVoucherList, "pay_clear_voucher_id", -1);
			PbUtil.batchSetValue(payVoucherList, "pay_daily_id", -1);
			PbUtil.batchSetValue(payVoucherList, "pay_account_note_id", -1);
			updateFields.add("pay_clear_voucher_id");
			updateFields.add("pay_daily_id");
			updateFields.add("pay_account_note_id");
			//end add
			billEngine.updateBill(sc, updateFields, payVoucherList, false);
		}

		if (bool == true) {
			workflow.signalProcessInstance(sc, payVoucherList, PayConstant.WORK_FLOW_NEXT,
					"支付凭证签章发送");
			try {
				baseBizService.signAndSend2EVoucher(sc, decOrgType, voucher_flag, payVoucherList);
			} catch (Exception e) {
				throw new PbException("签章发送凭证库发生异常," + e.getMessage(), e);
			}
		}else{
			PayVoucher p = payVoucherList.get(0);
			
			String voucherNos[] = new String[payVoucherList.size()];
			for( int i =0; i < payVoucherList.size(); i++ ){
				voucherNos[i] =  payVoucherList.get(i).getPay_voucher_code();
			}
			baseBizService.sendVoucher(sc, p.getVt_code(), p.getAdmdiv_code(), decOrgType, p.getYear(), voucherNos);
		}
	
		log.debug("签章发送结束！");
		tc.stop();
	}

	 /**
     * 签章发送支付凭证不走工作流(使用于 5201,8202,2203,2204签章发送)
     */
    public void signAndSendPayVoucherByNoFlow(Session sc,
			List<PayVoucher> payVoucherList, int voucherFlag) throws Exception {

    	//edit by liutianlong 2016年1月4日，voucherFlag的值直接从业务对象中取
    	//真正的值在下载或本方生成时已保存入库
    	int voucher_flag = payVoucherList.get(0).getVoucherFlag();
		// 操作凭证库
		final AsspOperator asspOperator = new AsspOperatorAdapter();
		// 如果是退款的签章发送，voucherFlag要改成0
//		if (payVoucherList.get(0).getPay_amount().signum() == -1) {
//			voucher_flag = XmlConstant.VOUCHERFLAG_VALUE_SEND;
//		}
		TimeCalculator tc = new TimeCalculator(log);
		log.debug("签章发送开始-----");
		tc.start();
		// 主单ID数组
		long ids[] = BillUtils.getBillIds(payVoucherList);
		// 支付凭证单据类型
		long billTypeId = Parameters.getLongParameter(BILL_TYPE_PAY_VOUCHER);
		// 明细列表
		List<PayRequest> requestList = new ArrayList<PayRequest>();

		if (ListUtils.isEmpty(payVoucherList.get(0).getDetails())) {
			requestList = (List<PayRequest>) payCommonService.loadDetailsByBill(sc,
					billTypeId, ids, null);
			/**
			 * 当没有加载支付凭证明细时，才需要该操作 lfj 2015-06-16
			 */
			PbUtil.setBillDetails(payVoucherList, requestList, "pay_voucher_id");
		} else {
			for (PayVoucher p : payVoucherList) {
				requestList.addAll((List) p.getDetails());
			}
		}

		// 设置XPayAmount，宁夏中行使用，不需要更新
        Timestamp nowTime = DateTimeUtils.nowDatetime();
		for (PayVoucher p : payVoucherList) {
			p.setXPayAmt(p.getPay_amount());
			p.setVoucherFlag(voucher_flag);
			p.setSendUser_code(sc.getUserCode());
			//更新发送日期
			p.setSend_date(nowTime);
		}
		for (PayRequest r : requestList) {
			r.setXPayAmt(r.getPay_amount());
		}

		// 更新发送标志
		List<String> updateFields = new ArrayList<String>(2);
		updateFields.add("send_date");
		updateFields.add("send_flag");
		updateFields.add("voucherFlag");
		updateFields.add("last_ver");
		updateFields.add("voucher_status_des");
		updateFields.add("voucher_status");
		updateFields.add("sendUser_code");
		updateFields.add("return_reason");
		PbUtil.batchSetValue(payVoucherList, "voucher_status", 6);// 已发送状态根据send_flag确定，此处改为财政未接收,便于在查询界面查询
		PbUtil.batchSetValue(payVoucherList, "send_flag", 1);
		PbUtil.batchSetValue(payVoucherList, "voucher_status_des", "对方未接收");
		PbUtil.batchSetValue(payVoucherList, "return_reason", null);//正常回单时，退票原因要清空 hsq 2015年12月1日23:58:35

	
		// 完成送审操作
		String decOrgType = PbParameters
				.getStringParameter(PayConstant.DEST_MOF_ORG_TYPE);

		// 根据要签章的凭证的区划，从参数表中取是否配置了该区划下的省分行路由，如果配置了则签章到省分行
		String forwardAdmdiv = PbParameters
				.getStringParameter("pb.forward.admdiv");
		PayVoucher first = payVoucherList.get(0);
		boolean isForward = false;
		if(StringUtil.isNotEmpty(forwardAdmdiv)
					&& first.getAdmdiv_code()
							.equals(forwardAdmdiv)) {
			isForward = true;
			if(first.getPay_amount().signum() == 1) {
				// 市行转发省行的时候，更新clear_flag以便可以进行退款录入
				updateFields.add("clear_flag");
				PbUtil.batchSetValue(payVoucherList, "clear_flag", 1);
			}
		}
		/**
		 * 更新send_flag、voucherflag、last_ver、voucher_status_des、voucher_status
		 * 当存在转发情况时，更新clear_flag lfj 2015-06-16
		 */
		billEngine.updateBill(sc, updateFields, payVoucherList, true);
		//保存日志在签章发送之前
		logService.saveTaskLogInfo(sc, payVoucherList,"签章发送");
		try {
			if (isForward) {
				sendVoucherByGreen(sc,payVoucherList);
			} else {

				baseBizService.signAndSend2EVoucher(sc, decOrgType,
						voucher_flag, payVoucherList);
			}
		} catch (Exception e) {
			throw new PbException("签章发送凭证库发生异常," + e.getMessage(), e);
		}
		log.debug("签章发送结束！");
		tc.stop();

	
    }

	/**
	 * 退款申请签章发送
	 */
	public void signAndSendRefRequest(Session sc,
			List<PbRefReqVoucher> refReqVoucherList) throws Exception {
		// 更新发送标志
		List<String> updateFields = new ArrayList<String>(2);
		updateFields.add("send_flag");
		updateFields.add("last_ver");
		PbUtil.batchSetValue(refReqVoucherList, "send_flag", 1);
		billEngine.updateBill(sc, updateFields, refReqVoucherList, false);
		String decOrgType = PbParameters
				.getStringParameter(PayConstant.DEST_MOF_ORG_TYPE);

		List<PbRefReqVoucher> pvl = new ArrayList<PbRefReqVoucher>();
		pvl = refReqVoucherList;
		logService.saveTaskLogInfo(sc, pvl, "退款申请签章发送");
		try {
			baseBizService.signAndSend2EVoucher(sc, decOrgType,
					XmlConstant.VOUCHERFLAG_VALUE_SEND, refReqVoucherList);
		} catch (Exception e) {
			throw new PbException("签章发送凭证库发生异常,原因：" + e.getMessage(), e);
		}
		
	}

	/**
	 * 更新退款申请状态
	 */
	public void updateRefReqStatus(Session sc, String reqCodes[], int status) {
		StringBuffer reqCodeStr = new StringBuffer("(");
		for (int i = 0; i < reqCodes.length; i++) {
			reqCodeStr.append("'" + reqCodes[i] + "'");
			if (i < reqCodes.length - 1)
				reqCodeStr.append(",");
		}
		reqCodeStr.append(")");

		ConditionObj obj = new ConditionObj();
		ConditionPartObj cpo1 = new ConditionPartObj(ConditionObj.AND, false,
				"refreq_voucher_code", ConditionObj.IN, reqCodeStr, false,
				false, null);
		cpo1.setDataType(3);
		obj.getConditionPartObjs().add(cpo1);

		long billTypeId = Parameters.getLongParameter(
				PayConstant.BILL_TYPE_REFREQVOUCHER);
		Where where = new Where();
		SQLUtil.addCondition(where, obj);
		OrderBy order = SQLUtil.convertOrder(obj);
		List<PbRefReqVoucher> refReqVoucherList = (List<PbRefReqVoucher>) billEngine
				.loadBillByBillType(sc, billTypeId, null, where, order, null);

		// long billTypeId = Parameters.getLongParameter(
		// BILL_TYPE_REFREQVOUCHER);
		// List<PbRefReqVoucher> refReqVoucherList =
		// (List<PbRefReqVoucher>)this.loadBillsWithDetails(sc, billTypeId,
		// "pay_refreq_code", reqCodes);

		// 更新发送标志
		List<String> updateFields = new ArrayList<String>(2);
		updateFields.add("send_flag");
		updateFields.add("last_ver");
		PbUtil.batchSetValue(refReqVoucherList, "send_flag", status);
		billEngine.updateBill(sc, updateFields, refReqVoucherList, false);
	}

	/**
	 * 请款后凭证退票
	 * 
	 * @param sc
	 * @param ids
	 * @param operRemark
	 * @throws NoSuchMethodException
	 * @throws InvocationTargetException
	 * @throws IllegalAccessException
	 */
	@SuppressWarnings("unchecked")
	public void returnPayVoucherAfterReq(final Session sc,
			List<PayVoucher> payVoucherList, final String operRemark) {
		// 主单ID数组
		long ids[] = BillUtils.getBillIds(payVoucherList);
		// 获取支付凭证单据类型
		long billTypeId = Parameters
				.getLongParameter(PayConstant.BILL_TYPE_PAY_VOUCHER);
		// 明细列表
		List<PayRequest> requestList = (List<PayRequest>) payCommonService
				.loadDetailsByBill(sc, billTypeId, ids, null);
		// 将明细设置到对应的凭证中
		PbUtil.setBillDetails(payVoucherList, requestList, "pay_voucher_id");
		// 调用工作流录入，复审岗退票，不需录入工作流
		StringBuffer vouCodeStr = new StringBuffer();
		final List<PayVoucher> list = new ArrayList<PayVoucher>();
		for (final PayVoucher payVoucher : payVoucherList) {
			try {
				smallTrans.newTransExecute(new ISmallTransService() {
					public void doExecute() throws Exception {
						
						payVoucher.setReturn_reason(operRemark);
						
						// 获取该凭证的明细列表
						List<Billable> detailList = payVoucher.getDetails();
						List<PayRequest> reqList = new ArrayList<PayRequest>();
						for (Billable bill : detailList) {
							reqList.add((PayRequest) bill);
						}
						//System.out.println(reqList.get(0).getPay_voucher_code());
						
						// 如果已请款
						if (payVoucher.getBatchreq_status() == 1) {
							TransReturnDTO transReturn1 = transService
									.queryTrans(sc, payVoucher);
							int i = transReturn1.getResStatus();
							// 交易状态为成功和不确定transReturn1态不能退票
							if (TradeConstant.RESPONSESTATUS_SUCCESS == i
									|| TradeConstant.RESPONSESTATUS_NOTCONFIRM == i || TransReturnDTO.UNKNOWN == i) {
								throw new CommonException("", "凭证："
										+ payVoucher.getCode()
										+ "已交易或不确定，无法退回！");
							}

						}
						list.removeAll(list);
						list.add(payVoucher);
						// 调用工作流录入，复审岗退票，不需录入工作流
						if (!(payVoucher.getTask_id() > 0)) {
							workflow.createProcessInstance(sc, "PB_PAY_VOUCHER", list,
									false);
						}
						
						workflow.signalProcessInstance(sc, list, PayConstant.WORK_FLOW_DISCARD, "支付凭证退票");						
						List<PayVoucher> tempList = new ArrayList<PayVoucher>();
						tempList.add(payVoucher);
						if ("1".equals(PbParameters
								.getStringParameter(PbParaConstant.RETRUN_VOUCER_MODEL,payVoucher.getAdmdiv_code() ))
								||PbParameters
								.getStringParameter( PbParaConstant.RETRUN_VOUCER_MODEL,payVoucher.getAdmdiv_code() ) == null) {
							// 设置voucherFlag为退回
							PbUtil.batchSetValue(tempList, "voucherFlag",
									XmlConstant.VOUCHERFLAG_VALUE_BACK);
							baseBizService.returnback2EVoucher(sc, tempList,
									new String[] { payVoucher
											.getReturn_reason() });
						} else if ("0".equals(PbParameters
								.getStringParameter(PbParaConstant.RETRUN_VOUCER_MODEL,payVoucher.getAdmdiv_code()))) {
							String decOrgType = PbParameters
									.getStringParameter(PayConstant.DEST_MOF_ORG_TYPE);
							PbUtil.batchSetValue(tempList, "voucherFlag",
									XmlConstant.VOUCHERFLAG_VALUE_RETURN);
							PbUtil.batchSetValue(tempList, "pay_amount",
									NumberUtil.BIG_DECIMAL_ZERO);
							PbUtil.batchSetValue(reqList,
									"pay_amount", NumberUtil.BIG_DECIMAL_ZERO);
							baseBizService.signAndSend4EVoucher(sc, decOrgType,
									XmlConstant.VOUCHERFLAG_VALUE_RETURN,
									tempList);
						} else if ("2".equals(PbParameters
								.getStringParameter(PbParaConstant.RETRUN_VOUCER_MODEL,payVoucher.getAdmdiv_code()))) {
							String decOrgType = PbParameters
									.getStringParameter(PayConstant.DEST_MOF_ORG_TYPE);
							PbUtil.batchSetValue(tempList, "voucherFlag",
									XmlConstant.VOUCHERFLAG_VALUE_RETURN);
							PbUtil.batchSetValue(tempList, "pay_amount",
									NumberUtil.BIG_DECIMAL_ZERO);
							PbUtil.batchSetValue(reqList,
									"pay_amount", NumberUtil.BIG_DECIMAL_ZERO);
							baseBizService.signAndSend2EVoucher(sc, decOrgType,
									XmlConstant.VOUCHERFLAG_VALUE_RETURN,
									tempList);
						}
						
				
						// 将明细单中task_id设置到主单
//						payVoucher.setTask_id(reqList.get(0).getTask_id());
						payVoucher.setBusiness_type(2);
						List<PayVoucher> pvList=new ArrayList<PayVoucher>();
						pvList.add(payVoucher);
						
						List<String> updateFields = new ArrayList<String>();
						updateFields.add("return_reason");
						updateFields.add("business_type");
						updateFields.add("task_id");
						billEngine.updateBill(sc, updateFields, pvList, false);
						updateFields.remove("return_reason");
						updateFields.remove("business_type");
						billEngine.updateBill(sc, updateFields, reqList, false);
					}
				});
			} catch (Exception e) {
				e.printStackTrace();
				log.error(e.getMessage());
				// 更新该凭证的交易返回结果
				updateTradeResMsg(sc, payVoucher);
				vouCodeStr.append(e.getMessage());
			}
		}
		if (vouCodeStr.length() != 0) {
			throw new CommonException("", vouCodeStr.toString());
		}

		// 将明细单中task_id设置到主单
		// for(PayVoucher voucher:payVoucherList){
		// voucher.setTask_id(voucher.getDetails().get(0).getTask_id());
		// }
		//		
		//		
		//		
		//		
		// /**
		// * 授权支付凭证接收时记账成功的在计划额度中增加了add_pay_amount，退回时需要进行恢复
		// */
		// //获得授权支付的vt_code
		// String vtCode =configService.getAccreditPayVoucherVtCode(sc);
		// //授权支付凭证
		// if(payVoucherList.get(0).getVt_code().equals(vtCode)){
		// //记账成功的凭证的明细
		// List<PayRequest> oriAccountReqList = new ArrayList<PayRequest>();
		// //获得需要记账的，记账失败的不需要重新记账
		// for( PayVoucher voucher : payVoucherList ){
		// //如果不是记账失败的则需要恢复额度
		// if( voucher.getAccountfailure_flag() != 0 ){
		// continue;
		// }
		// List<Billable> detailList = voucher.getDetails();
		// for( Billable billable : detailList ){
		// oriAccountReqList.add( (PayRequest)billable );
		// }
		// }
		//			
		// //拷贝一份明细列表，将支付金额设置为0，作为新明细列表
		// List<PayRequest> currentAccountReqList =
		// PbUtil.cloneList(oriAccountReqList);
		// //明细单退票数据金额设置为0
		// PbUtil.batchSetValue(currentAccountReqList, "pay_amount",
		// NumberUtil.BIG_DECIMAL_ZERO );
		//	
		// //创建额度修改Action
		// List<PayRequestUpdateAction> updateActionList =
		// PbUtil.createPayRequestUpdateAction(oriAccountReqList,currentAccountReqList);
		// //恢复计划额度
		// this.balanceService.payRequestEntrance(sc, updateActionList, false);
		//		
		// }
		// try {
		// //调用凭证库接口需要一个数组
		// String errMsg[] = new String[ids.length];
		// for( int i = 0; i < payVoucherList.size(); i++ ){
		// errMsg[i] = operRemark;
		// }
		// baseBizService.returnback2EVoucher(sc, payVoucherList, errMsg);
		// } catch (Exception e) {
		// throw new PbException(e);
		// }
	}

	/**
	 * 凭证退票初审
	 * 
	 * @param sc
	 * @param ids
	 * @param operRemark
	 * @throws NoSuchMethodException
	 * @throws InvocationTargetException
	 * @throws IllegalAccessException
	 */
	@SuppressWarnings("unchecked")
	public void auditReturnPayVoucher(final Session sc,
			List<PayVoucher> payVoucherList, String operRemark) {
		// 主单ID数组
		long ids[] = BillUtils.getBillIds(payVoucherList);
		// 获取支付凭证单据类型
		long billTypeId = Parameters
				.getLongParameter(PayConstant.BILL_TYPE_PAY_VOUCHER);
		// 明细列表
		final List<PayRequest> requestList = (List<PayRequest>) payCommonService
				.loadDetailsByBill(sc, billTypeId, ids, null);
		// 将明细设置到对应的凭证中
		PbUtil.setBillDetails(payVoucherList, requestList, "pay_voucher_id");

		// 调用工作流录入，复审岗退票，不需录入工作流
		if (!(payVoucherList.get(0).getTask_id() > 0)) {
			workflow.createProcessInstance(sc, "PB_PAY_VOUCHER", payVoucherList,
					false);
		}
		// 完成退回操作
		workflow.signalProcessInstance(sc, payVoucherList, PayConstant.WORK_FLOW_NEXT,
				"凭证退票初审");

		// 将明细单中task_id设置到主单
//		for (PayVoucher voucher : payVoucherList) {
//			voucher.setTask_id(voucher.getDetails().get(0).getTask_id());
//		}

		// 设置业务类型 ： 2 已退票
		PbUtil.batchSetValue(payVoucherList, "business_type",
				PayConstant.HASBACK_CONFIRMED);
		// 设置退票原因
		PbUtil.batchSetValue(payVoucherList, "return_reason", operRemark);

		List<String> updateFields = new ArrayList<String>();
		updateFields.add("task_id");
		updateFields.add("business_type");
		updateFields.add("last_ver");
		updateFields.add("return_reason");

		billEngine.updateBill(sc, updateFields, payVoucherList, false);

		billEngine.updateBill(sc, updateFields, requestList, false);
	}

	/**
	 * 凭证退票
	 * 
	 * @param sc
	 * @param ids
	 * @param operRemark
	 * @throws Exception 
	 * @throws NoSuchMethodException
	 * @throws InvocationTargetException
	 * @throws IllegalAccessException
	 */
	@SuppressWarnings("unchecked")
	public void returnSignPayVoucher(final Session sc,
			List<PayVoucher> payVoucherList, String returnRes) throws Exception {

		// 判断凭证的pay_voucher_id是否为0，为0去加载并赋值
		if (payVoucherList.get(0).getPay_voucher_id() == 0) {
			// 给凭证库下载过来的凭证主单的pay_voucher_id,last_ver赋值
			setIdByVoucher(payVoucherList);
		}
		// 主单ID数组
		long ids[] = BillUtils.getBillIds(payVoucherList);
		// 支付凭证单据类型
		long billTypeId = Parameters.getLongParameter(BILL_TYPE_PAY_VOUCHER);
		// 明细列表

		List<PayRequest> requestList = new ArrayList<PayRequest>();
		
		if (ListUtils.isEmpty(payVoucherList.get(0).getDetails())) {
			requestList = (List<PayRequest>) payCommonService.loadDetailsByBill(sc,
					billTypeId, ids, null);
		} else {
			for (PayVoucher p : payVoucherList) {
				for (Billable bill : p.getDetails()) {
					requestList.add((PayRequest) bill);
				}
			}
		}

		// 将明细设置到对应的凭证中
		PbUtil.setBillDetails(payVoucherList, requestList, "pay_voucher_id");
		StringBuffer codes = new StringBuffer();
		for (PayVoucher p : payVoucherList) {
			// add by liutianlong交易过并且凭证处于支付失败状态
			if (p.getBusiness_type() == PayConstant.Fail_CONFIRMED) {
				// 需要查询交易状态
				TransReturnDTO transReturn1 = transService.queryTrans(sc, p);
				int i;
				if (transReturn1 == null) {
					i = TradeConstant.RESPONSESTATUS_FAIL;
				} else {
					i = transReturn1.getResStatus();
				}
				// 交易状态为成功和不确定transReturn2态不能退票
				if (TradeConstant.RESPONSESTATUS_SUCCESS == i
						|| TradeConstant.RESPONSESTATUS_NOTCONFIRM == i || TransReturnDTO.UNKNOWN == i) {
					codes.append(p.getCode()).append(",");
				}
			}
		}
		if (StringUtil.isNotEmpty(codes.toString())) {
			int length = codes.toString().length();
			String noStr = codes.toString().substring(0, length - 1);
			throw new CommonException("", "凭证：" + noStr + "已支付成功或不确认，无法退票！");
		}

		// 调用工作流录入，复审岗退票，不需录入工作流
		if (!(payVoucherList.get(0).getTask_id() > 0)) {
			workflow.createProcessInstance(sc, "PB_PAY_VOUCHER", payVoucherList,
					false);
		}
		// 完成退回操作
		workflow.signalProcessInstance(sc, payVoucherList, WORK_FLOW_DISCARD,
				"凭证退票");
		
		// 设置业务类型 ： 2 已退票
		PbUtil.batchSetValue(payVoucherList, "business_type",
				PayConstant.HASBACK_CONFIRMED);

		// 根据要签章的凭证的区划，从参数表中取是否配置了该区划下的省分行路由，如果配置了则签章到省分行
		String forwardAdmdiv = PbParameters
				.getStringParameter("pb.forward.admdiv");
		// 操作凭证库
		AsspOperator asspOperator = new AsspOperatorAdapter();
		List<String> updateFields = new ArrayList<String>();
		try {

			if (StringUtil.isNotEmpty(forwardAdmdiv)
					&& payVoucherList.get(0).getAdmdiv_code()
							.equals(forwardAdmdiv)) {
				String decOrgType = PbParameters
						.getStringParameter(PbParaConstant.FORWARD_ORG_TYPE);

				// 获得本地路由
				String srcOrgType = PbParameters
						.getStringParameter(PayConstant.ORI_ORG_TYPE);

				StringBuffer msg = new StringBuffer("2");
				for (PayVoucher payVoucher : payVoucherList) {

					PayVoucher p = payVoucher;
					// TODO:市行转发省行
					// 1.拼装请求报文 "2+凭证号+|+区划+|+年度+|+退回原因&+凭证号+|+区划+|+年度+|+退回原因 "
					msg.append(p.getPay_voucher_code()).append("|")
							.append(p.getAdmdivCode()).append("|")
							.append(p.getYear()).append("|").append(returnRes)
							.append("&");
				}
				msg = msg.deleteCharAt(msg.length() - 1);

				byte[] requestMessage = Base64.encode(msg.toString().getBytes(
						"GBK"));

				// 调用绿色通道发送
				byte[] rv = asspOperator.requestData(payVoucherList.get(0)
						.getAdmdivCode(), srcOrgType, decOrgType,
						requestMessage);

				if (rv == null) {
					throw new Exception("同步绿色通道未返回回执结果!");
				}

				if (rv != null
						&& new String(rv, "GBK").substring(0, 3).equals("9999")) {

					String rvv = new String(rv, "GBK").substring(4);
					throw new Exception(rvv);
				}

			} else {
				String returnMode = PbParameters.getStringParameter(
                        PbParaConstant.RETRUN_VOUCER_MODEL,
                        payVoucherList.get(0).getAdmdiv_code());
				if (StringUtil.isEmpty(returnMode)
						|| "1".equals(returnMode)) {
					// 设置voucherFlag为退回
					PbUtil.batchSetValue(payVoucherList, "voucherFlag",
							XmlConstant.VOUCHERFLAG_VALUE_BACK);
				} else if ("0".equals(returnMode)
						|| "2".equals(returnMode)) {
					Timestamp nowTime = DateTimeUtils.nowDatetime();
		            updateFields.add("pay_date");
		            for(PayVoucher v :payVoucherList){
		                v.setVoucherFlag(XmlConstant.VOUCHERFLAG_VALUE_RETURN);
		                v.setPay_date(nowTime);
		                v.setPay_amount(NumberUtil.BIG_DECIMAL_ZERO);
		                v.setAgent_business_no(this.seqReq(v.getVt_code()));
		                PbUtil.batchSetValue(v.getDetail(), "agent_business_no", v.getAgent_business_no());
		            }
		            for(PayRequest r :requestList){
		                r.setPay_date(nowTime);
		                r.setPay_amount(NumberUtil.BIG_DECIMAL_ZERO);
		            }
				}
				
				// 设置退票原因
				PbUtil.batchSetValue(payVoucherList, "return_reason", returnRes);
				// 设置本方退回的状态
				PbUtil.batchSetValue(payVoucherList, "voucher_status", 22);
				PbUtil.batchSetValue(payVoucherList, "voucher_status_des",
						"本方已退回");
				updateFields.add("task_id");
				updateFields.add("business_type");
				updateFields.add("voucherFlag");
				updateFields.add("last_ver");
				updateFields.add("return_reason");
				updateFields.add("voucher_status");
				updateFields.add("voucher_status_des");

				// 更新主单字段
				billEngine.updateBill(sc, updateFields, payVoucherList, false);
				
				// 如果没配置或者配置为空则调用退回接口
				if (StringUtil.isEmpty(returnMode) || "1".equals(returnMode)) {
					// 退票原因数组
					String errMsg[] = new String[ids.length];
					for (int i = 0; i < payVoucherList.size(); i++) {
						errMsg[i] = returnRes;
					}
					baseBizService.returnback2EVoucher(sc, payVoucherList,
							errMsg);
				} else if ("0".equals(returnMode)) { // 如果
					String decOrgType = PbParameters
							.getStringParameter(PayConstant.DEST_MOF_ORG_TYPE);
					baseBizService.signAndSend4EVoucher(sc, decOrgType,
							XmlConstant.VOUCHERFLAG_VALUE_RETURN,
							payVoucherList);
				} else if ("2".equals(returnMode)) {// 走签章发送模式
					String decOrgType = PbParameters
							.getStringParameter(PayConstant.DEST_MOF_ORG_TYPE);
					baseBizService.signAndSend2EVoucher(sc, decOrgType,
							XmlConstant.VOUCHERFLAG_VALUE_RETURN,
							payVoucherList);
				}

			}
		} catch (Exception e) {
			throw new PbException(e);
		}

	}

	/**
	 * 汇总清算单退回财政
	 * @param sc
	 * @param bpVoucherList
	 * @param billTypeId
	 * @param returnRes
	 */
	public void returnClearNote(final Session sc, List<? extends Billable> clearNoteList,
									 	   String returnRes) {
		int i = 0;
		String errMsg[] = new String[clearNoteList.size()];
		for(Billable bill : clearNoteList){
			// 将主单的voucherflag改为2-已退回
			PlatformUtils.setProperty(bill, "voucherFlag", XmlConstant.VOUCHERFLAG_VALUE_BACK);
			// 设置退票原因
			PlatformUtils.setProperty(bill, "return_reason", returnRes);
			// 设置本方退回的状态
			PlatformUtils.setProperty(bill, "voucher_status", "22");
			PlatformUtils.setProperty(bill, "voucher_status_des", "本方已退回");
			errMsg[i++] = returnRes;
		}

		final List<String> updateFields = new ArrayList<String>();
		updateFields.add("voucherFlag");
		updateFields.add("last_ver");
		updateFields.add("return_reason");
		updateFields.add("voucher_status");
		updateFields.add("voucher_status_des");
		// 更新主单字段
		try {
			billEngine.updateBill(sc, updateFields, clearNoteList, false);
			baseBizService.returnback2EVoucher(sc, clearNoteList, errMsg);
		} catch (Exception ex) {
			throw new PbException(ex.getMessage());
		}
	}
	
	/**
	 * 更新凭证中的凭证及明细信息
	 * 
	 * @param sc
	 * @param pvList
	 * @param requests
	 */

	public void updateAcceptPayVoucher(Session sc, List<PayVoucher> pvList,
			List<PayRequest> requests) {
		TimeCalculator tc = new TimeCalculator(log);
		// 已经存在task_id说明是审核后进行的确认，不需录入工作流

		tc.middle("+++++++++++++更新单据开始");
		Timestamp nowTime = DateTimeUtils.nowDatetime();
		String nowTimeOfStr =  new SimpleDateFormat("yyyyMMdd").format(nowTime);

		// 对单据赋支付日期
		// PbUtil.batchSetValue(pvList, "pay_date", nowTime);
		// 使用反射时，有的地pay_date反射不进去，先这样写，使黑龙江、河南pay_date都有值
		for (PayVoucher dto : pvList) {
			dto.setPay_date(nowTime);
			dto.setPayDate(PbUtil.getCurrDate());
			dto.setBusiness_type(PayConstant.Has_CONFIRMED);
			//转账过程不要更新voucherFlag edit by liutianlong 2016年1月4日
//			dto.setVoucherFlag(XmlConstant.VOUCHERFLAG_VALUE_RETURN);
			dto.setReturn_reason("");
			//转账成功状态
			dto.setTrans_succ_flag( TradeConstant.TRANS_SUCC );
			if ("0".equals(dto.getFapAbc())) {
				dto.setWrite_off_status(3);
				dto.setWrite_off_describe("已核销");
			}
			
			for( PayRequest req : requests ){
				if(req.getPay_voucher_id() == dto.getPay_voucher_id()){
					req.setPay_date( nowTime );
					req.setPay_dateOfStr(nowTimeOfStr);
					req.setAgent_business_no(dto.getAgent_business_no());
					if(req.getPay_amount() == null){
						req.setPay_amount(req.getOri_pay_amount());
					}
					if(StringUtil.isEmpty(req.getPayee_account_no())){
						req.setPayee_account_no(pvList.get(0).getPayee_account_no());
					}
					if(StringUtil.isEmpty(req.getPayee_account_name())){
						req.setPayee_account_name(pvList.get(0).getPayee_account_name());
					}
					if(StringUtil.isEmpty(req.getPayee_account_bank())){
						req.setPayee_account_bank(pvList.get(0).getPayee_account_bank());
					}
					if(StringUtil.isEmpty(req.getPayee_account_bank_no())){
						req.setPayee_account_bank_no(pvList.get(0).getPayee_account_bank_no());
					}
				}
			}
		}

		
		// 更新支付凭证数据
		List<String> updateFileList = new ArrayList<String>();
		updateFileList.add("pay_date");
		updateFileList.add("payDate");
		updateFileList.add("payUser_code");
		updateFileList.add("payUser_name");
		updateFileList.add("trans_succ_flag");
		updateFileList.add("business_type");
		updateFileList.add("payee_account_bank_no");
		updateFileList.add("payee_account_name");
	    updateFileList.add("payee_account_no");
	    updateFileList.add("return_reason");
	    updateFileList.add("payee_account_bank");
		updateFileList.add("bank_setmode_id");
		updateFileList.add("bank_setmode_code");
		updateFileList.add("bank_setmode_name");
		updateFileList.add("task_id");
		updateFileList.add("trans_res_msg");
		updateFileList.add("pb_set_mode_code");
		updateFileList.add("pb_set_mode_name");
		updateFileList.add("agent_business_no");
		updateFileList.add("accthost_seqid");
//		updateFileList.add("voucherFlag");
		updateFileList.add("fapAbc");
		updateFileList.add("write_off_status");
		updateFileList.add("write_off_describe");
		updateFileList.add("last_ver");
		updateFileList.add("trade_type");
		updateFileList.add("pay_amount");
		updateFileList.add("hold4");
		updateFileList.add("manual_trans_flag");
		
		
		//授权现金交易时 设置垫支户
		String cashCode = ElementUtil.getEleValue(PbParaConstant.CASH, "现金",pvList.get(0).getAdmdiv_code());
		//正逆向不一致，退款时需重新定值垫支户
		int payRefund_consistent = PbParameters.getIntParameter("pb.payRefund.consistent");
		if ( (cashCode.equals( pvList.get(0).getSet_mode_code() )) || (payRefund_consistent==0 && pvList.get(0).getPay_amount().compareTo(new BigDecimal(0)) < 0) ) {
			updateFileList.add("advance_account_no");
			updateFileList.add("advance_account_bank");
			updateFileList.add("advance_account_name");
			
		}


		billEngine.updateBill(sc, updateFileList, pvList, false);
		// 因为需要定值清算账户等所以需要全部更新,也就是第二个参数需要传null
		billEngine.updateBill(sc, null, requests, false);
		tc.middle("++++++++++++++++更新单据耗时：");
	
		tc.stop();
	}

	/**
	 * 更新凭证交易的交易流水号和交易返回消息
	 * 
	 * @param sc
	 * @param payVoucher
	 */
	private void updateTradeResMsg(final Session sc, final PayVoucher payVoucher) {
		// 更新支付凭证数据
		try {
			this.smallTrans.newTransExecute(new ISmallTransService(){

				@Override
				public void doExecute() throws Exception {
					List<String> updateFileList = new ArrayList<String>();
					updateFileList.add("trans_res_msg");
					updateFileList.add("agent_business_no");
					updateFileList.add("business_type");
					List<PayVoucher> pvList = new ArrayList<PayVoucher>();
					pvList.add(payVoucher);
					billEngine.updateBill(sc, updateFileList, pvList, false);
					
				}
				
			});
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	
	/**
	 * 更新单据审核意见
	 * 
	 * @param sc
	 * @param bills
	 * @param auditRemark
	 */
	private void addAuditSuggestion(Session sc, List<? extends Billable> bills,
			String auditRemark) {
		List<String> fieldNames = new ArrayList<String>(2);
		fieldNames.add("audit_remark");
		fieldNames.add("voucherFlag");
		fieldNames.add("last_ver");
		for (Billable bill : bills) {
			bill.setAuditRemark(auditRemark);
		}
		billEngine.updateBill(sc, fieldNames, bills, false);
	}

	/**
	 * 初审岗凭证送审
	 */
	public void submitVoucher(Session sc, List<PayVoucher> payVoucherList,
			String auditRemark) {
		if (ListUtils.isEmpty(payVoucherList)) {
			return;
		}
		// 完成送审操作
		workflow.signalProcessInstance(sc, payVoucherList, PayConstant.WORK_FLOW_NEXT,
				auditRemark);
		// 将明细单中task_id设置到主单，设置创建用户为当前审核用户
		for (PayVoucher voucher : payVoucherList) {
			voucher.setCreate_user_id(sc.getUserId());
			voucher.setCreate_user_name(sc.getUserName());
			voucher.setCreate_user_code(sc.getUserCode());
			voucher.setAuditRemark(auditRemark);
			voucher.setBusiness_type(PayConstant.NO_CONFIRMED);
			voucher.setAudit_user_code(sc.getUserCode());
		}

		List<String> updateFields = new ArrayList<String>(4);
		updateFields.add("task_id");
		updateFields.add("audit_remark");
		updateFields.add("last_ver");
		updateFields.add("audit_user_code");
		updateFields.add("payee_account_bank_no");
		updateFields.add("payee_account_bank");
		updateFields.add("pb_set_mode_code");
		updateFields.add("pb_set_mode_name");
		updateFields.add("create_user_id");
		updateFields.add("create_user_name");
		updateFields.add("create_user_code");
		updateFields.add("city_code");
		updateFields.add("business_type");
		updateFields.add("add_word");
		// 更新主单字段
		billEngine.updateBill(sc, updateFields, payVoucherList, false);
	}

	/**
	 * 复审岗被退回凭证送审
	 * @throws Exception 
	 */
	public void unsubmitVoucher(Session sc, List<PayVoucher> payVoucherList,
			String auditRemark) throws Exception {
		if (ListUtils.isEmpty(payVoucherList)) {
			return;
		}
		// 获取主单单据类型ID
		long billTypeId = Parameters.getLongParameter(PayConstant.BILL_TYPE_PAY_VOUCHER);
		// 主单ID数组
		long ids[] = BillUtils.getBillIds(payVoucherList);
		// 查询对应的明细信息
		List<PayRequest> requests = (List<PayRequest>) payCommonService
				.loadDetailsByBill(sc, billTypeId, ids, null);
		// 设置单据和明细的关联关系
		PbUtil.setBillDetails(payVoucherList, requests, "pay_voucher_id");
		
		StringBuffer codes = new StringBuffer();
		boolean flag = false;
		for(PayVoucher p : payVoucherList){
			//add by liutianlong交易过并且凭证处于支付失败状态
			if(p.getBusiness_type() == PayConstant.Fail_CONFIRMED){
				//需要查询交易状态
				TransReturnDTO transReturn1 = transService.queryTrans(sc, p);
				int  i;
				if(transReturn1 == null){
					i = TradeConstant.RESPONSESTATUS_FAIL;
				}else{
					i = transReturn1.getResStatus();
				}
				// 交易状态为成功和不确定transReturn2态不能退票
				if (TradeConstant.RESPONSESTATUS_SUCCESS == i
						|| TradeConstant.RESPONSESTATUS_NOTCONFIRM == i || TransReturnDTO.UNKNOWN == i) {
					codes.append(p.getCode()).append(",");
				}
			}
			//edit daiguodong 公务卡无统发户退回上岗校验明细是否全部转账失败
			if(p.getBusiness_type_code().equals("2")){
				for(Billable b : p.getDetails()){
					PayRequest r = (PayRequest) b;
					if(r.getTrans_succ_flag() == 1){
						flag = true;
					}
				}
			}
		}
		if(flag){
			throw new CommonException("凭证明细存在支付成功的数据，无法退回上岗！");
		}
		
		if (StringUtil.isNotEmpty(codes.toString())) {
			int length = codes.toString().length();
			String noStr = codes.toString().substring(0,
					length - 1);
			throw new CommonException("", "凭证：" + noStr + "已支付成功或不确认，无法退回上岗！");
		}
		// 完成送审操作
		workflow.signalProcessInstance(sc, payVoucherList, PayConstant.WORK_FLOW_BACK, "退回上岗");
		// 将明细单中task_id设置到主单，设置创建用户为当前审核用户
		for (PayVoucher voucher : payVoucherList) {
			voucher.setAuditRemark(auditRemark);
			voucher.setReturn_reason(auditRemark);
			voucher.setBatchreq_status(0);
			voucher.setRepayment_flag(0);
		}

		List<String> updateFields = new ArrayList<String>(3);
		updateFields.add("task_id");
		updateFields.add("audit_remark");
		updateFields.add("last_ver");
		updateFields.add("return_reason");
		updateFields.add("batchreq_status");
		updateFields.add("repayment_flag");

		// 更新主单字段
		billEngine.updateBill(sc, updateFields, payVoucherList, false);
	}



	/**
	 * 通过CODE查询ID数组
	 * 
	 * @param sc
	 * @param codes
	 * @param codeName
	 * @param billTypeId
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public long[] bankChageCodeToIds(Session sc, List<String> codes,
			String codeName, long billTypeId) {
		// 校验选择的明细ID集合是否为空
		NormalCaculate.listCaculate(codes, "");
		In in = new In(new Field(codeName));

		for (String code : codes)
			in.addValue(code);
		List<Billable> bills = (List<Billable>) billEngine
				.loadBillByBillTypeWithoutRight(sc, billTypeId, null,
						new Where().addLogic(in), null, null);
		int lenth = bills.size();
		long[] ids = new long[lenth];
		for (int i = 0; i < lenth; i++)
			ids[i] = bills.get(i).getId();
		return ids;
	}

	/**
	 * 退款通知书录入
	 */
	public List<PayVoucher> inputRefundVoucher(Session sc,
			RrefundVoucherDTO rvDto) throws Exception {
		
		PayVoucher refundPayVoucher = createRefundVoucher(sc,rvDto);
		List<PayVoucher> pvl = new ArrayList<PayVoucher>();
//		refundPayVoucher.setTask_id(0);
		pvl.add(refundPayVoucher);
		workflow.createProcessInstance(sc, "PB_PAY_VOUCHER", pvl,false);
//		refundPayVoucher.setTask_id(refundPayVoucher.getDetails().get(0).getTask_id());
		try {
			billEngine.saveBill(sc, refundPayVoucher);
			payCommonService.setBillId4Details(pvl);
			// 保存新明细
			billEngine.saveBills(sc, refundPayVoucher.getDetails());
		} catch (Exception e) {
			log.error("", e);
			throw new PbException("退款通知书保存异常：" + e.getMessage());
		}
		// 生成的时候不能调用工作流，通过调用系统内部操作日志接口进行操作日志的保存
		// 保存的操作日志将保存在pb_wf_tasklog表中
		logService.saveTaskLogInfo(sc, pvl, "退款生成");
		return pvl;
	}

	
	/**
	 *生成退款凭证信息
	 * @param sc
	 * @param rvDto
	 * @return
	 */
	public PayVoucher createRefundVoucher( Session sc, RrefundVoucherDTO rvDto ){

		// 支付凭证单据类型
		long payVoucherBTid = Parameters.getLongParameter(
				PayConstant.BILL_TYPE_PAY_VOUCHER);
		// 支付明细单据类型
		long payReqBTid = Parameters.getLongParameter(PayConstant.BILL_TYPE_PAY_REQUEST);

		// 退款明细列表
		List<PayRequest> refRequestList = null;
		String ori_voucher_code = "";
		// 按单退款 payId为支付凭证id
		if (rvDto.isBillRef()) {
			// 查询凭证的所有明细信息
			// 拿原来的主单和明细，然后复制 ，金额改为负值
			refRequestList = (List<PayRequest>) payCommonService.loadDetailsByBill(sc,
					payVoucherBTid, new long[] { rvDto.getPayId() }, null);
			PayVoucher payvoucher = (PayVoucher) billEngine.loadBillById(sc,
					payVoucherBTid, rvDto.getPayId());
			ori_voucher_code = payvoucher.getPay_voucher_code();
			payvoucher.setPay_refund_amount(payvoucher.getPay_amount());
			// 设置凭证所有明细的退款金额为支付金额
			for (PayRequest request : refRequestList) {
				// 一单多明细的情况
				request.setPay_account_no(payvoucher.getPay_account_no());
				request.setPay_refund_amount(request.getPay_amount());
				request.setRemark(rvDto.getRefReason());
				request.setOri_pay_voucher_code(payvoucher.getPay_voucher_code());
			}
		} else { // 按明细退款 payId为支付明细id
			// 查询退款的明细信息
			PayRequest request = (PayRequest) billEngine.loadBillById(sc,
					payReqBTid, rvDto.getPayId());
			// 没有设置零余额账户 查询余额用
			PayVoucher payvoucher = (PayVoucher) billEngine.loadBillById(sc,
					payVoucherBTid, request.getPay_voucher_id());
			//edit by liutianlong 20150805 支持1.0报文规范，记录原支付明细id
			//（1.0字段映射支付明细Id映射的dto_name为str_pay_request_id
			ori_voucher_code = request.getStr_pay_request_id();
			// 设置退款金额为录入的退款金额
			request.setPay_refund_amount(rvDto.getRefAmount());
			request.setPay_amount(rvDto.getRefAmount());
			request.setPay_account_no(payvoucher.getPay_account_no());
			request.setRemark(rvDto.getRefReason());
			request.setPay_account_no(payvoucher.getPay_account_no());	
			//request.setOri_pay_voucher_code(request.getStr_pay_request_id());
//			request.setOri_pay_voucher_code(request.getStr_pay_request_id());
			refRequestList = new ArrayList<PayRequest>();
			refRequestList.add(request);
		}

		// 原退款明细列表
		List<PayRequest> oriRequestList = new ArrayList<PayRequest>();
		for (PayRequest refRequest : refRequestList) {
			// 退款金额
			BigDecimal refundAmount = refRequest.getPay_refund_amount();

			// 退款金额不为0 //TODO 判断退款金额为0移到前台
			if (refundAmount == null
					|| refundAmount.compareTo(NumberUtil.BIG_DECIMAL_ZERO) == 0)
				throw new RuntimeException("退款金额不能为0");
			// 转负值
			if (refundAmount.signum() > 0) {
				// refRequest.setPay_refund_amount(refundAmount.negate());
				refundAmount = refundAmount.negate();
			}

			// 原明细 克隆？
			PayRequest oriReq = (PayRequest) billEngine.loadBillById(sc,
					payReqBTid, refRequest.getPay_request_id());
			if (oriReq == null) {
				throw new RuntimeException("没有查询到原申请，请重新确认录入数据！");
			}
			// if(oriReq.getClear_date() == null){
			// throw new RuntimeException("原申请未清算，请重新选择");
			// }
			// 已退金额 正
			BigDecimal oriRefundAmount = oriReq.getPay_refund_amount();
			if (oriRefundAmount != null) {
				// 原退款金额 (正)- 新录入退款金额(负)-支付金额（正）
				if (oriRefundAmount.subtract(refundAmount).subtract(
						oriReq.getPay_amount()).compareTo(
						NumberUtil.BIG_DECIMAL_ZERO) > 0) {
					throw new RuntimeException("退款总金额不能大于支付金额");
				}
				// 设置原退款金额
				oriReq.setPay_refund_amount(oriRefundAmount
						.subtract(refundAmount));
			} else {
				if (refundAmount.add(oriReq.getPay_amount()).compareTo(
						NumberUtil.BIG_DECIMAL_ZERO) < 0)
					throw new RuntimeException("退款金额不能大于支付金额");
				// 设置原退款金额
				oriReq.setPay_refund_amount(refundAmount.abs());
			}

			oriRequestList.add(oriReq);

			// 设置退款明细信息
			refRequest.setOri_request_id(refRequest.getPay_request_id());
			//保存原支付凭证对应的划款信息，用于tips退款
			refRequest.setOri_clear_voucher_date(StringUtil.isEmpty(refRequest.getClear_voucher_date())?PbUtil.getCurrDate():refRequest.getClear_voucher_date());
			refRequest.setOri_trano(getTipsTraNo(sc));
			refRequest.setPay_request_id(IdGen.genNumId());
			refRequest.setStr_pay_request_id(String.valueOf(refRequest.getPay_request_id()));
//			refRequest.setPay_request_code(null);
			refRequest.setPay_amount(refundAmount);
			refRequest.setPay_refund_amount(null);
			refRequest.setClear_date(null);
			refRequest.setBill_type_id(payReqBTid);
			//refRequest.setBiz_type_id(bizTypeId)
			refRequest.setOri_pay_voucher_code(refRequest.getPay_voucher_code());

			// if(payType==1)//授权支付
			// refRequest.setBiz_type_id(7967);
			// else if(payType==0)//直接支付
			// refRequest.setBiz_type_id(7966);
			refRequest.setPay_date(null);
			refRequest.setPay_clear_voucher_id(0);
			refRequest.setOri_pay_clear_voucher_code(refRequest
					.getPay_clear_voucher_code());
			refRequest.setOri_clear_voucher_date(refRequest
					.getClear_voucher_date());
			refRequest.setOri_trano(refRequest.getTips_tra_no());
			refRequest.setPay_daily_id(0);
			refRequest.setPay_daily_code(null);
			refRequest.setPay_account_note_id(0);
			refRequest.setPay_account_note_code(null);
			refRequest.setIs_self_counter(rvDto.getIs_self_counter());
		}
		// 查询账户中的余额 and by zhouqi 20130922
		// String str=refRequestList.get(0).getPay_account_no();
		// refRequestList.get(0).setPayee_account_no(str);
		if ("1".equals(PbParameters.getStringParameter(PayConstant.PB_REF_QUERY_ACCTBALANCE))) {
			log.info("零余额账号:" + (refRequestList.get(0)).getPay_account_no());
			BigDecimal acctAmt;
			try {
				acctAmt = transService.queryAcctBalance(sc,refRequestList.get(0));
				log.info("账户余额:" + acctAmt);

				// TODO 如果是没有提供查询额度接口的银行则直接返回true
				// 累计需要退款金额
				BigDecimal refundMoney = new BigDecimal(0);
				for (PayRequest req : refRequestList) {
					refundMoney = refundMoney.add(req.getPay_amount());
				}
				// 如果
				if (acctAmt != null
						&& acctAmt.add(refundMoney).compareTo(new BigDecimal(0)) < 0) {
					throw new CommonException("", "账户余额：accountBalance" + acctAmt
							+ " 退款金额 ：" + refundMoney + "，账户余额不足不能退款！");
				}
			} catch (Exception e) {
				throw new RuntimeException( e.getMessage() );
			}
		}
//			// 走工作流
//			workflow.createProcessInstance(sc, "PB_PAY_REQUEST", refRequestList,
//				false);

		// //如果是授权支付，需要还原额度
		// List<PayRequestSaveAction> actions=new ArrayList(ls.size());
		// if(payType==1){
		// for(PayRequest o : ls){
		// o.setBill_type_id(payReqBTid);
		// actions.add(new PayRequestSaveAction(o));
		// }
		// //进行额度控制，pay_amount为负，额度控制后会增加
		// balanceService.payRequestEntrance(sc, actions, false);
		// }

		// 生成新的退款凭证
		PayVoucher refVoucher = this.createRefundVoucherBill(sc,
				refRequestList, rvDto.isBillRef(), rvDto.getPayType(), rvDto
						.getRefReason());

		refVoucher.setCashTransFlag(rvDto.getCashTransFlag());
		refVoucher.setWriteoffVouNo(rvDto.getWriteoffVouNo());
		refVoucher.setWriteoffVouSeqNo(rvDto.getWriteoffVouSeqNo());
		refVoucher.setWriteoffTlId(rvDto.getWriteoffTlId());
		refVoucher.setOri_voucher_code(ori_voucher_code);
		refVoucher.setAbis_account_no(rvDto.getAbis_account_no());
			// 加入退款流水号
		String refundSerialNo = rvDto.getRefundSerialNo();
		if ( !StringUtil.isEmpty(refundSerialNo) ) {
			refVoucher.setRefundSerialNo(refundSerialNo);
			// 补录 agent_business_no 和 pay_date
			refVoucher.setAgent_business_no(seqReq(refVoucher.getVt_code()));
			refVoucher.setPay_date(Timestamp.valueOf(grp.pt.pb.util.PbUtil.getCurrLocalDateTime()));
		}
		//重置
		refVoucher.setPay_clear_voucher_code(null);
		refVoucher.setPay_clear_voucher_id((long)0);
		refVoucher.setClear_flag(0);
		refVoucher.setPay_daily_id((long)0);
		refVoucher.setPay_account_note_id((long)0);
		refVoucher.setImport_flag(0);//add by lix导入标志重置0,新增网点后以前导入的支付凭证有部分做退款业务,录入后
		//重置生成的退款通知书凭证状态
		refVoucher.setVoucher_query_flag(0);
		refVoucher.setVoucher_status_des(null);
		
		//设置为发送单标志 add by liutianlong 2016年1月4日
		refVoucher.setVoucherFlag(XmlConstant.VOUCHERFLAG_VALUE_SEND);
		//end add
		
		// 更新原有明细（加退款金额）
		billEngine.updateBill(sc, null, oriRequestList, false);
		return refVoucher;

	}
	
	/**
	 * 创建退款通知书
	 */
	@SuppressWarnings("unchecked")
	public PayVoucher createRefundVoucherBill(Session sc,
			List<PayRequest> refRequestList, boolean isBillRef, int payType,
			String refReason) {
		// 支付凭证单据类型
		long payVoucherBTid = Parameters.getLongParameter(
				PayConstant.BILL_TYPE_PAY_VOUCHER);

		// 加载出原支付凭证，修改相应属性值作为退款通知书
		PayVoucher oriVoucher = (PayVoucher) billEngine.loadBillById(sc,
				payVoucherBTid, refRequestList.get(0).getPay_voucher_id());

		PayVoucher voucher = null;
		
		voucher = (PayVoucher) oriVoucher.clone();
		oriVoucher.setPay_refund_date(DateTimeUtils.nowDatetime());//跟pay_date时间格式保持一致
		// 按单退款
		if (isBillRef) {
			// 设置原支付凭证按单退款
			oriVoucher.setRefund_type(PayConstant.REFUNDTHYPE_BILL);
			oriVoucher.setPay_refund_amount(oriVoucher.getPay_amount());
			// 退款类型 按单退款：1
			voucher.setRefund_type(PayConstant.REFUNDTHYPE_BILL);
			voucher.setOri_voucher_id(voucher.getId());
			// 原业务单据号 按单退RefundType=2：需要退款的原支付凭证单号
			voucher.setOri_pay_voucher_code(voucher.getPay_voucher_code());
			voucher.setOri_pay_amount(voucher.getPay_amount());
		} // 按明细退款
		else {
			// 设置原支付凭证按明细退款，不能再按单退
			// if(oriVoucher.getRefund_type()==0){
			oriVoucher.setRefund_type(PayConstant.REFUNDTHYPE_DETAIL);
			// }
			// 支付明细单据类型
			long payReqBTid = Parameters.getLongParameter(
					PayConstant.BILL_TYPE_PAY_REQUEST);
			// 加载出原支付明细
			PayRequest request = (PayRequest) billEngine.loadBillById(sc,
					payReqBTid, refRequestList.get(0).getOri_request_id());

			// 退款类型 按明细退款:2
			voucher.setRefund_type(PayConstant.REFUNDTHYPE_DETAIL);
			voucher.setOri_voucher_id(request.getId());
			// 原业务单据号 按明细退RefundType=1：需要退款的支付明细单号
			voucher.setOri_pay_voucher_code(request.getCode());
			//voucher.setOri_pay_voucher_code(request.getStr_pay_request_id());
//			voucher.setOri_pay_voucher_code(request.getStr_pay_request_id());
			voucher.setOri_pay_amount(request.getPay_amount());
			oriVoucher.setPay_refund_amount(oriVoucher.getPay_refund_amount().add(refRequestList.get(0).getPay_amount().abs()));
		}

		// 设置退款通知书ID
		long voucherId = IdGen.genNumId();
		voucher.setId(voucherId);
		voucher.setStr_voucher_id(voucherId+"");
		voucher.setCode(null);
		// 退款通知书业务类型
		voucher.setBusiness_type(PayConstant.NO_CONFIRMED);
		// 凭证日期
		voucher.setVou_date(PbUtil.getCurrDate());
		// 退款原因备注
		voucher.setRemark(refReason);
//		voucher.setTask_id(refRequestList.get(0).getTask_id());
		// //实际退款日期 退款通知书确认是赋值
		// voucher.setPay_date(DateTimeUtils.nowDatetime());
		voucher.setPay_date(null);
		// 流水号设为null
		voucher.setAgent_business_no(null);
		voucher.setBill_type_id(payVoucherBTid);
		voucher.setSend_flag(0);
		voucher.setSend_date(null);
		// 设置批次号
		voucher.setBatch_no(null);
		// 设置批次状态
		voucher.setBatchreq_status(0);
		voucher.setTrans_res_msg("");
		//设置打印次数
		voucher.setPrint_num(0);
		// 主单设置is_self_counter 
		voucher.setIs_self_counter(refRequestList.get(0).getIs_self_counter());
		
		// 设置交易类型为
		voucher.setTrade_type(-1);
		voucher.setIs_onlyreq(0);
		voucher.setPay_amount(NumberUtil.BIG_DECIMAL_ZERO);
		voucher.setElimination_clear_flag(0);
		//edit by lituianlong 2015-06-10 新生成的退款通知书将转账标识设置为0
		voucher.setTrans_succ_flag(0);	
		//end eidt
		//edit by liutianlong 20150807，记录原支付凭证号
		voucher.setOri_payvoucher_code(oriVoucher.getPay_voucher_code());
		
		// 修改明细的属性
		for (PayRequest refRequest : refRequestList) {
			refRequest.setPay_voucher_id(voucherId);
			refRequest.setPay_summary_name(refReason);
			// 累计金额
			voucher.setPay_amount(voucher.getPay_amount().add(
					refRequest.getPay_amount()));
//			refRequest.setStr_pay_request_id(voucherId+"");
			//edit by liutianlong 20150810,原支付凭证id不修改
//			refRequest.setStr_voucher_id(voucherId+"");
			//end edit
			//delete by liutianlong
			//refRequest.setVt_code(voucher.getVt_code());
		}

		BillType groupBillType = BillTypes.getInstance().getBillTypeById(voucher.getBill_type_id());
				
		BizType bizType = BizTypes.getInstance().caculateBizType(groupBillType,voucher);
				
		if(bizType == null){
			throw new RuntimeException("无法确定汇总单的业务类型，请检查业务类型["+groupBillType+"]的配置！");
		}
		voucher.setVt_code(bizType.getBizTypeCode());
		
		voucher.setBiz_type_id(bizType.getBizTypeId());
		
		PbUtil.batchSetValue(refRequestList, "vt_code", bizType.getBizTypeCode());
		
		voucher.setDetails((List) refRequestList);
		voucher.setHold4(refRequestList.get(0).getHold4());

		// 更新原支付凭证的退款类型标示
		billEngine.updateBill(sc, oriVoucher);
//		List<PayVoucher> updateList = new ArrayList<PayVoucher>();
//		updateList.add(oriVoucher);
//		billEngine.updateBill(sc, null, updateList, false);

		return voucher;
	}

	/**
	 * 退款申请单录入
	 */

	public PbRefReqVoucher inputRefundRequest(Session sc,
			PayVoucher oriPayVoucher, boolean isBillRef, int payType,
			BigDecimal refAmt, String refReason) throws Exception {
		// 直接/授权支付退款申请单单据类型
		long refReqBTid = Parameters.getLongParameter(
				PayConstant.BILL_TYPE_REFREQVOUCHER);

		PbRefReqVoucher refReqVoucher = new PbRefReqVoucher();
		refReqVoucher.setRefreq_voucher_id(IdGen.getInstance(1).genNumIds(
				"SEQ_REFREQ_VOUCHER_ID", 1).get(0));
		// 单号规则：凭证类型编码（4位）+区划编码(6位)+机构编码（3位）+日期（8位）+流水号（4位），如：2252460000102201310300001
		refReqVoucher.setRefreq_voucher_code(this.generateRefReqCode(sc,
				oriPayVoucher));
		refReqVoucher.setAdmdiv_code(oriPayVoucher.getAdmdiv_code());
		refReqVoucher.setYear(sc.getBusiYear());
		refReqVoucher.setVt_code(VtConstant.REFUND_REQUEST_VT_CODE);
		refReqVoucher.setVou_date(PbUtil.getCurrDate());

		refReqVoucher.setBill_type_id(refReqBTid);
		BizType bizType = configService.getBizTypeByVtCode(refReqVoucher.getAdmdiv_code(),
				VtConstant.REFUND_REQUEST_VT_CODE);
		refReqVoucher.setBiz_type_id(bizType.getBizTypeId());

		// 将原支付凭证的支付方式和预算单位要素信息拷贝到退款申请单
		String eleNames[] = new String[] { "pay_type", "fund_type", "agency",
				"pay_bank" };
		PbUtil.copyElementValue(oriPayVoucher, refReqVoucher, eleNames, null);
		// 将原支付凭证的收付款信息反转拷贝到退款申请的收付款信息
		String fromEleNames[] = new String[] { "pay_account", "payee_account" };
		String toEleNames[] = new String[] { "payee_account", "pay_account" };
		String postFixs[] = new String[] { "id", "code", "no", "name", "bank" };
		PbUtil.copyElementValue(oriPayVoucher, refReqVoucher, fromEleNames,
				toEleNames, postFixs);

		// 银行交易流水号
		refReqVoucher
				.setAgent_business_no(oriPayVoucher.getAgent_business_no());
		// 原凭证单号
		refReqVoucher.setOri_pay_voucher_code(oriPayVoucher
				.getPay_voucher_code());
		// 按单退款
		refReqVoucher.setRefund_type(2);
		// 退款金额
		refReqVoucher.setPay_amount(refAmt);
		// 退款原因
		refReqVoucher.setRemark(refReason);
		refReqVoucher.setCreate_date(new Timestamp(DateUtil.getCurTime()));
		refReqVoucher.setCreate_user_id(sc.getUserId());
		refReqVoucher.setCreate_user_name(sc.getUserName());

		// // 支付凭证所属的财政
		// AdmdivDTO admdiv =
		// finService.loadAdmdivByCode(oriPayVoucher.getAdmdiv_code());
		// refReqVoucher.setPay_bank_name(admdiv.getPay_bank_name());
		// refReqVoucher.setPay_bank_no(admdiv.getPay_bank_no());

		List<PbRefReqVoucher> pvl = new ArrayList<PbRefReqVoucher>();
		pvl.add(refReqVoucher);

		// 更新原支付凭证退款金额
		oriPayVoucher.setPay_refund_amount(oriPayVoucher.getPay_refund_amount()
				.add(refAmt));
		List<String> fieldNames = new ArrayList<String>(2);
		fieldNames.add("pay_refund_amount");
		fieldNames.add("last_ver");
		List<PayVoucher> payVoucherList = new ArrayList<PayVoucher>();
		payVoucherList.add(oriPayVoucher);
		billEngine.updateBill(sc, fieldNames, payVoucherList, false);

		// 保存新录入的退款申请单
		billEngine.saveBill(sc, refReqVoucher);
		// 生成的时候不能调用工作流，通过调用系统内部操作日志接口进行操作日志的保存
		// 保存的操作日志将保存在pb_wf_tasklog表中
		logService.saveTaskLogInfo(sc, pvl, "退款申请单录入");

		return refReqVoucher;
	}

	/**
	 * 生成退款申请单单号
	 * 
	 * @param sc
	 * @param oriPayVoucher
	 * @return
	 */
	private String generateRefReqCode(Session sc, PayVoucher oriPayVoucher) {
		StringBuffer refReqCode = new StringBuffer();
		refReqCode.append(VtConstant.REFUND_REQUEST_VT_CODE);
		refReqCode.append(oriPayVoucher.getAdmdiv_code());
		refReqCode.append(PbParameters
				.getStringParameter(PayConstant.ORI_ORG_TYPE));
		refReqCode.append(PbUtil.getCurrDateTime());

		String idSeqStr = IdGen.getInstance(1).genStrId(
				"SEQ_REFREQ_VOUCHER_CODE");
		if (idSeqStr.length() > 4) {
			idSeqStr = idSeqStr.substring(idSeqStr.length() - 4, idSeqStr
					.length());
		}
		refReqCode.append(ChangeUtil.getFixlenStr(idSeqStr, 4));
		return refReqCode.toString();
	}
	
	/**
	 * payType=1 柜面正常作废走工作流(更新is_valid=0)
	 * payType=0 自助柜面调用作废不走工作流(更新is_valid=0)
	 * payType=2 年结功能作废不走工作流(更新task_id=-10,is_valid=0)
	 */
	@SuppressWarnings("unchecked")
	public void invalidateRefundVoucher(Session sc, List<PayVoucher> vouchers,
			int payType) {


		// 如果没有需要登记的数据则直接返回
		if (ListUtils.isEmpty(vouchers)) {
			return;
		}
		// 主单ID数组
		long ids[] = BillUtils.getBillIds(vouchers);
		// 支付凭证单据类型
		long billTypeId = Parameters.getLongParameter(BILL_TYPE_PAY_VOUCHER);
		// 明细列表
		List<PayRequest> refundReqs = (List<PayRequest>) payCommonService
				.loadDetailsByBill(sc, billTypeId, ids, null);
		// 将明细设置到对应的凭证中
		PbUtil.setBillDetails(vouchers, refundReqs, "pay_voucher_id");

		long detailTypeId = Parameters.getLongParameter(BILL_TYPE_PAY_REQUEST);

		// 更新主单的is_valid
		for (PayVoucher voucher : vouchers) {
			voucher.setIs_valid(0);			
		}

		int lenth = refundReqs.size();
		long[] ori_Req_ids = new long[lenth];
		for (int i = 0; i < lenth; i++) {
			PayRequest req = refundReqs.get(i);
			ori_Req_ids[i] = req.getOri_request_id();
		}
		// 查询原有的支付申请
		List<PayRequest> ori_Reqs = (List<PayRequest>) billEngine
				.loadBillByIds(sc, detailTypeId, NumberUtil
						.toObjectList(ori_Req_ids));
		// 建立索引
		List<Long> ori_voucher_ids = new ArrayList<Long>();
		Map<Long, PayRequest> oriReqIndex = new HashMap<Long, PayRequest>();
		for (PayRequest req : ori_Reqs) {
			oriReqIndex.put(req.getPay_request_id(), req);
			ori_voucher_ids.add(req.getPay_voucher_id());
		}
		//记录所有作废明细的金额的累加值，用于对原主单已退金额进行回退更新
        BigDecimal totalAmount = BigDecimal.ZERO;
		// 根据作废的退款申请，进行逐一退款
		for (PayRequest refundReq : refundReqs) {
//			totalAmount = totalAmount.add(refundReq.getPay_amount());
			refundReq.setIs_valid(0); // 作废
			PayRequest oriReq = oriReqIndex.get(refundReq.getOri_request_id()); // 获取原申请
			oriReq.setPay_refund_amount(oriReq.getPay_refund_amount().add(
					refundReq.getPay_amount())); // 修改原申请的退款金额为退款金额 - 作废的退款申请金额
		}
		//根据原有支付明细查询原主单信息
		List<PayVoucher> ori_vouchers = (List<PayVoucher>) billEngine.
			loadBillByIds(sc, billTypeId, ori_voucher_ids);
		PbUtil.setBillDetails(ori_vouchers, ori_Reqs, "pay_voucher_id");
		for(PayVoucher p : ori_vouchers){
			BigDecimal refundAmount = BigDecimal.ZERO;
			for(Billable b : p.getDetails()){
				PayRequest r = (PayRequest)b;
				refundAmount = refundAmount.add(r.getPay_refund_amount());
			}
			p.setPay_refund_amount(refundAmount);
			if(p.getPay_refund_amount().signum() == 0){
				p.setRefund_type(0);
				//如果已退金额为0,将退款日期至空
				p.setPay_refund_date(null);
			}
		}
//		for (PayRequest payRequest : ori_Reqs) {
//			PayVoucher ori_voucher = (PayVoucher) billEngine.loadBillById(sc,
//					billTypeId, payRequest.getPay_voucher_id());
//			//原凭证主单已退金额更新
//			ori_voucher.setPay_refund_amount(ori_voucher.getPay_refund_amount().add(totalAmount));
//			//add by liutianlong 已退金额为0时，refund_type置为0，避免按明细退款后，作废后，前台无法在按单退款
//			if(ori_voucher.getPay_refund_amount().signum() == 0){
//				ori_voucher.setRefund_type(0);
//			}
//			ori_vouchers.add(ori_voucher);
//		}
		
		List<String> updateFields = new ArrayList<String>();
		//自助柜面作废退款凭证，不走工作流
		if(payType == 1){
			workflow.signalProcessInstance(sc, vouchers, WORK_FLOW_DISCARD, "作废"); // 工作流作废明细
		}
		//年结需求更新task_id为-10
		if(payType == 2){
			for (PayVoucher voucher : vouchers) {
				voucher.setTask_id(-10);	
			}
		}
		
		updateFields.add("task_id");
		updateFields.add("is_valid");
		updateFields.add("last_ver");
		billEngine.updateBill(sc, updateFields, vouchers, false);
		billEngine.updateBill(sc, updateFields, refundReqs, false);
		updateFields.add("pay_refund_amount");
		//更新原主单信息
		List<String> updateOriVoucherField = new ArrayList<String>();
		updateOriVoucherField.add("pay_refund_amount");
		updateOriVoucherField.add("refund_type");
		updateOriVoucherField.add("pay_refund_date");
		billEngine.updateBill(sc,updateOriVoucherField, ori_vouchers, false);
		billEngine.updateBill(sc, updateFields, ori_Reqs, false);
	
	}
	
	/**
	 * 作废退款申请
	 */
	public void invalidateRefundRequest(Session sc,
			List<PbRefReqVoucher> refReqVoucherList, int payType) {
		// 加载出退款申请对应的原支付凭证
		int num = refReqVoucherList.size();
		StringBuffer oriVouCodeStr = new StringBuffer("(");
		for (int i = 0; i < num; i++) {
			oriVouCodeStr.append("'"
					+ refReqVoucherList.get(i).getOri_pay_voucher_code() + "'");
			if (i < num - 1)
				oriVouCodeStr.append(",");
		}
		oriVouCodeStr.append(")");

		ConditionObj obj = new ConditionObj();
		// 已经清算条件（明细的clear_date不为空）
		ConditionPartObj cpo1 = new ConditionPartObj(ConditionObj.AND, false,
				"pay_voucher_code", ConditionObj.IN, oriVouCodeStr, false,
				false, null);
		cpo1.setDataType(3);
		obj.getConditionPartObjs().add(cpo1);

		long billTypeId = Parameters.getLongParameter(PayConstant.BILL_TYPE_PAY_VOUCHER);
		Where where = new Where();
		SQLUtil.addCondition(where, obj);
		OrderBy order = SQLUtil.convertOrder(obj);
		List<PayVoucher> payVoucherList = (List<PayVoucher>) billEngine
				.loadBillByBillType(sc, billTypeId, null, where, order, null);
		// 恢复原支付凭证的退款金额
		for (PbRefReqVoucher refReqVoucher : refReqVoucherList) {
			for (PayVoucher payVoucher : payVoucherList) {
				if (payVoucher.getPay_voucher_code().equals(
						refReqVoucher.getOri_pay_voucher_code())) {
					payVoucher.setPay_refund_amount(payVoucher
							.getPay_refund_amount().subtract(
									refReqVoucher.getPay_amount()));
				}
			}
			refReqVoucher.setSend_flag(2); // 标记退款申请已作废
		}

		// 更新原支付凭证
		List<String> fieldNames = new ArrayList<String>(2);
		fieldNames.add("pay_refund_amount");
		fieldNames.add("last_ver");
		billEngine.updateBill(sc, fieldNames, payVoucherList, false);
		// 更新退款申请状态标识
		fieldNames.clear();
		fieldNames.add("send_flag");
		fieldNames.add("last_ver");
		billEngine.updateBill(sc, fieldNames, refReqVoucherList, false);
	}

	

	public void updatePayVoucher(Session sc,List<PayVoucher> vouList,final boolean isFlow, final String remark) 
			throws Exception {
		
		//更新的字段
		List<String> fieldNames = new ArrayList<String>();
		fieldNames.add("is_onlyreq");
		fieldNames.add("payee_account_bank_no");
		fieldNames.add("is_import");
//		fieldNames.add("task_id");
		
		fieldNames.add("business_type");
		//公务卡和非公务卡转化，更新task_id
		fieldNames.add("task_id");
		//增加更新支付日期
		fieldNames.add("pay_date");
		
		for( PayVoucher p : vouList){
			//转公务卡，行号不是12位，公务卡行号配置不为空时
			if(1 == p.getIs_onlyreq() && !StringUtil.isEmpty(p.getPayee_account_bank_no()) 
					&& p.getPayee_account_bank_no().length() != 12
					&& !StringUtil.isEmpty(PbParameters.getStringParameter(PbParaConstant.PB_GONGWUKA_BANK_NO))){
				//设置成公务卡的行号
				p.setPayee_account_bank_no(PbParameters.getStringParameter(PbParaConstant.PB_GONGWUKA_BANK_NO));
			}
			//转非公务卡，在未请款、行号不为12位时，将行号设置成null
			else if(0 == p.getIs_onlyreq() && 1 != p.getBatchreq_status() && !StringUtil.isEmpty(p.getPayee_account_bank_no()) 
					&& p.getPayee_account_bank_no().length() != 12){
				p.setPayee_account_bank_no(null);
			}
			//导出即支付完成
			if(p.getPay_date()!=null){
				List<String> fieldRequest = new ArrayList<String>();
				//更新明细
				long billTypeId = Parameters.getLongParameter(BILL_TYPE_PAY_VOUCHER);
				
				List<PayRequest> reqeusts = (List<PayRequest>) payCommonService
				.loadDetailsByBill(sc, billTypeId, new long[]{p.getPay_voucher_id()}, null);
				for (PayRequest payRequest : reqeusts) {
					payRequest.setPay_date(DateTimeUtils.nowDatetime());
					payRequest.setAgent_business_no(p.getAgent_business_no());
					payRequest.setPayee_account_bank(p.getPayee_account_bank());
					payRequest.setPayee_account_name(p.getPayee_account_name());
					payRequest.setPayee_account_no(p.getPayee_account_no());
					
				}
				fieldRequest.add("pay_date");
				fieldRequest.add("agent_business_no");
				fieldRequest.add("payee_account_bank");
				fieldRequest.add("payee_account_name");
				fieldRequest.add("payee_account_no");
				//更新明细
				billEngine.updateBill(sc, fieldRequest, reqeusts, false);
			}
		}
		//更新主单
		billEngine.updateBill(sc, fieldNames, vouList, false);
		if (isFlow) {
			long billTypeId = Parameters.getLongParameter(PayConstant.BILL_TYPE_PAY_VOUCHER);
			List<PayRequest> reqList = (List<PayRequest>) payCommonService
					.loadDetailsByBill(sc, billTypeId, BillUtils.getBillIds(vouList), null);
			//工作流流转条件，因为是按明细走工作流，所以要用明细的“is_onlyreq”进行匹配
			PbUtil.batchSetValue(reqList, "is_onlyreq", vouList.get(0).getIs_onlyreq());
			workflow.signalProcessInstance(sc, vouList, PayConstant.WORK_FLOW_NEXT, remark);
		}
	}
	
	/***************************************************************************
	 * 导入完成支付
	 */
	public String inputPayVoucher(Session sc, InputStream in) throws Exception {
		StringBuffer codeBuffer = null;
		StringBuffer succMsg = null;
		StringBuffer errorMsg = null;
		StringBuffer antMsg = null;
		List<String> dataList = new ArrayList<String>();
		BufferedReader bufr = new BufferedReader(new InputStreamReader(in,
				"UTF-8"));
		String str;
		while ((str = bufr.readLine()) != null) {
			if (!str.equals("")) {
				dataList.add(str);
			}
		}
		int a = 1;
		int i = 1;
		for (int j = 0; j < dataList.size(); j++) {
			PayVoucher payVoucher = getPayVoucherObj(dataList.get(j));
			// 对数据进行判断
			if (payVoucher.getPay_voucher_id() == 0) {
				throw new PbException("第[" + a + "]行序号不可为空!");
			}
			if (payVoucher.getPay_account_no() == null
					|| payVoucher.getPay_account_no().length() == 0) {
				throw new PbException("第[" + a + "]行付款人帐号不可为空!");
			}
			if (payVoucher.getPay_account_name() == null
					|| payVoucher.getPay_account_name().length() == 0) {
				throw new PbException("第[" + a + "]行付款人名称不可为空!");
			}
			if (payVoucher.getPayee_account_no() == null
					|| payVoucher.getPayee_account_no().length() == 0) {
				throw new PbException("第[" + a + "]行收款人帐号不可为空!");
			}
			if (payVoucher.getPayee_account_name() == null
					|| payVoucher.getPayee_account_name().length() == 0) {
				throw new PbException("第[" + a + "]行收款人名称不可为空!");
			}
			if (payVoucher.getPayee_account_bank() == null
					|| payVoucher.getPayee_account_bank().length() == 0) {
				throw new PbException("第[" + a + "]行收款人行名不可为空!");
			}
			if (payVoucher.getPayee_account_bank_no() == null
					|| payVoucher.getPayee_account_bank_no().length() == 0) {
				throw new PbException("第[" + a + "]行收款人行号不可为空!");
			}
			if (payVoucher.getPay_amount() == new BigDecimal(0)) {
				throw new PbException("第[" + a + "]行发生额不可为空!");
			}
			if (payVoucher.getPay_voucher_code() == null
					|| payVoucher.getPay_voucher_code().length() == 0) {
				throw new PbException("第[" + a + "]行支付令号不可为空!");
			}
			if (payVoucher.getPay_date() == null) {
				throw new PbException("第[" + a + "]行交易日期不可为空!");
			}
			if (payVoucher.getBusiness_type() == -1) {
				throw new PbException("第[" + a + "]行交易状态不对!");
			}
			int query = daoSupport
					.queryForInt("SELECT COUNT(*) FROM PB_PAY_VOUCHER WHERE BATCHREQ_STATUS=1 AND IS_IMPORT=1 AND BUSINESS_TYPE=0 AND PAY_VOUCHER_CODE='"
							+ payVoucher.getPay_voucher_code() + "'");
			if (query > 0) {
				// 支付成功
				if (payVoucher.getBusiness_type() == 1) {
					daoSupport
							.executeUpdate(
									"UPDATE PB_PAY_VOUCHER SET BUSINESS_TYPE=1,PAY_DATE=#pay_date# WHERE PAY_VOUCHER_CODE=#pay_voucher_code#",
									payVoucher);
					if (codeBuffer == null) {
						codeBuffer = new StringBuffer();
					}
					codeBuffer.append("'" + payVoucher.getPay_voucher_code()
							+ "',");
					if (succMsg == null) {
						succMsg = new StringBuffer();
					}
					succMsg.append(payVoucher.getPay_voucher_code() + ",");
				} else { // 支付失败
					daoSupport
							.executeUpdate(
									"UPDATE PB_PAY_VOUCHER SET TRANS_RES_MSG=#trans_res_msg# WHERE PAY_VOUCHER_CODE=#pay_voucher_code#",
									payVoucher);
					if (errorMsg == null) {
						errorMsg = new StringBuffer();
					}
					errorMsg.append(payVoucher.getPay_voucher_code() + ",");
				}
			} else {
				if (antMsg == null) {
					antMsg = new StringBuffer();
				}
				antMsg.append(payVoucher.getPay_voucher_code() + ",");
			}
			a++;
		}
		if (codeBuffer != null) {
			List<PayRequest> payList = daoSupport
					.query(
							"select * from pb_pay_request p where exists (select 1 from pb_pay_voucher where pay_voucher_code in ("
									+ codeBuffer.substring(0, codeBuffer
											.length() - 1)
									+ ") and pay_voucher_id = p.pay_voucher_id) ",
							PayRequest.class);
			for (PayRequest p : payList) {
				p.setIs_onlyreq(1);
			}
			List<PayVoucher> list = daoSupport
					.query(
							"select * from pb_pay_voucher where pay_voucher_code in ("
									+ codeBuffer.substring(0, codeBuffer
											.length() - 1)
									+ ")",
									PayVoucher.class);
			workflow.signalProcessInstance(sc, list, PayConstant.WORK_FLOW_NEXT, "支付成功");
		}
		StringBuffer strBuffer = new StringBuffer();
		if (succMsg != null) {
			strBuffer.append(("导入成功的凭证：【" + succMsg.substring(0, succMsg
					.length() - 1))
					+ "】");
		}
		if (errorMsg != null) {
			strBuffer.append(("导入失败的凭证：【" + errorMsg.substring(0, errorMsg
					.length() - 1))
					+ "】");
		}
		if (antMsg != null) {
			strBuffer.append(("导入的凭证未找到：【" + antMsg.substring(0, antMsg
					.length() - 1))
					+ "】");
		}
		return strBuffer.toString();
	}

	/***************************************************************************
	 * 支付
	 * 
	 * @param data
	 *            序号|1||付款人帐号|付款人名称|收款人名称|收款人帐号|收款人行名|上表的行号|发生额|用途|0703|支付令号|1||交易日期
	 *            |成功/失败|如果失败该域为失败原因,如果成功该域为空|
	 * @return
	 */
	private PayVoucher getPayVoucherObj(String data) {
		PayVoucher payVoucher = new PayVoucher();
		String[] d = data.split("\\|");
		try {
			String s = d[0];
			try {
				payVoucher.setPay_voucher_id(Long.parseLong(d[0]));
			} catch (Exception ex) {
				payVoucher.setPay_voucher_id(Long.parseLong(d[0].substring(1)));
			}
			payVoucher.setPay_account_no(d[3]);
			payVoucher.setPay_account_name(d[4]);
			payVoucher.setPayee_account_name(d[5]);
			payVoucher.setPayee_account_no(d[6]);
			payVoucher.setPayee_account_bank(d[7]);
			payVoucher.setPayee_account_bank_no(d[8]);
			payVoucher.setPay_amount(new BigDecimal(d[9]));
			payVoucher.setPay_summary_name(d[10]);
			payVoucher.setPay_voucher_code(d[12]);
			SimpleDateFormat sdf = new SimpleDateFormat(
					"yyyy-MM-dd 00:00:00.000");
			payVoucher.setPay_date(Timestamp.valueOf(sdf
					.format(new SimpleDateFormat("yyyyMMdd").parse(d[15]))));
			payVoucher.setBusiness_type(d[16].equals("成功") ? 1 : d[16]
					.equals("失败") ? 0 : -1);
			payVoucher.setTrans_res_msg(d.length > 17 ? d[17] : "");
			return payVoucher;
		} catch (Exception ex) {
			throw new PbException("公务卡支付失败,原因:当前文件无效,请检查txt格式！");
		}
	}

	/***************************************************************************
	 * 入账通知单打印
	 */
	public void printAccountNote(Session sc, long[] ids, boolean isPrintFlow) throws Exception{
		NormalCaculate.longArrayCaculate(ids, "");
		long billTypeId = Parameters.getLongParameter(
				PayConstant.BILL_TYPE_PAY_ACCOUNT_NOTE);
		payCommonService.print(sc, billTypeId, ids, "pay_account_note_id");
		if (isPrintFlow) {
			List<PayAccountNote> list = (List<PayAccountNote>) billEngine
					.loadBillByIds(sc, billTypeId, NumberUtil.toObjectList(ids));
			// // 明细列表
			List<PayRequest> requestList = (List<PayRequest>) payCommonService
					.loadDetailsByBill(sc, billTypeId, ids, null);
			PbUtil.setBillDetails(list, requestList, "pay_account_note_id");
			
			workflow.signalProcessInstance(sc, list, PayConstant.WORK_FLOW_NEXT,
					"入账通知单打印操作");
		}
	}

	@SuppressWarnings("unchecked")
	public void unauditPayVoucher(Session sc, List<PayVoucher> payVoucherList) {

		// 如果没有需要登记的数据则直接返回
		if (ListUtils.isEmpty(payVoucherList)) {
			return;
		}
		// 主单ID数组
		long ids[] = BillUtils.getBillIds(payVoucherList);
		// 支付凭证单据类型
		long billTypeId = Parameters
				.getLongParameter(PayConstant.BILL_TYPE_PAY_VOUCHER);
		// 明细列表
		List<PayRequest> requestList = (List<PayRequest>) payCommonService
				.loadDetailsByBill(sc, billTypeId, ids, null);
		// 将明细设置到对应的凭证中
		PbUtil.setBillDetails(payVoucherList, requestList, "pay_voucher_id");

		// 完成撤销送审操作
		workflow.signalProcessInstance(sc, payVoucherList, PayConstant.WORK_FLOW_UNDO, "撤销送审");

		this.addAuditSuggestion(sc, payVoucherList, null);
	}

	@SuppressWarnings("unchecked")
	public void uncreatePayDaily(Session sc, long[] ids) throws Exception{
		long billTypeId = Parameters.getLongParameter(
				PayConstant.BILL_TYPE_PAY_CLEAR_DAILY);
		//此处需要保存日志，故查询单据详细信息
		List<Long> list = new ArrayList<Long>();
		for(int i=0;i<ids.length;i++){
			list.add(ids[i]);
		}
		List<Billable> bizList = (List<Billable>) billEngine.loadBillByIds(sc, billTypeId, list);
		// List<PayRequest> requests = (List<PayRequest>)
		// CommonMethod.deleteRelation(sc, billTypeId ,ids);
		// 查询明细集合
		List<PayRequest> requests = (List<PayRequest>) payCommonService.loadDetailsByBill(
				sc, billTypeId, ids, null);
		updateBillDetailRelation(sc, requests, billTypeId);
		CommonMethod.deleteBill(sc, billTypeId, ids);
		Where where = null;
		for(long id : ids){
			where = new Where();
			where.addLogic(new Eq("pay_daily_id", id));
			billEngine.updateBill(sc, Parameters.getLongParameter(PayConstant.BILL_TYPE_PAY_VOUCHER),
					new Set().add("pay_daily_id", 0), where);
		}
	    // 保存的操作日志将保存在pb_wf_tasklog表中
	    logService.saveTaskLogInfo(sc, bizList,"撤销日报生成");
	//	workflow.signalProcessInstance(sc, requests, WORK_FLOW_UNDO, "");
	}

	/**
	 *更新明细的关联字段为0
	 * 
	 * @param sc
	 * @param detailList
	 * @param billType_id
	 */
	private void updateBillDetailRelation(Session sc,
			List<? extends Billable> detailList, long billType_id) {

		if (ListUtils.isEmpty(detailList)) {
			return;
		}
		List<String> fieldNames = new ArrayList<String>(1);

		// 获得主键
		List<ObjectAttrDTO> attList = BillTypes.getInstance().getBillTypeById(
				billType_id).getObjDto().getPrimaryField();
		fieldNames.add(attList.get(0).getAttr_code());

		String realtionId = attList.get(0).getAttr_code();
		for (Billable as : detailList) {
			PlatformUtils.setProperty(as, realtionId, 0);
		}

		billEngine.updateBill(sc, fieldNames, detailList, false);
	}

	/**
	 * 重新发送至凭证库
	 * 
	 * @param sc
	 * @param billTypeId
	 * @param ids
	 */
	public void sendAsspVoucher(Session sc, long billTypeId, long[] ids) {
		// 主单集合，包含明细
		List<Billable> bills = (List<Billable>) payCommonService
				.loadBillsWithDetails(sc,
				billTypeId, ids);

		sendAsspVoucher(sc, bills);
	}

	/**
	 * 用指定类型的vt_code发送凭证目前只有2351使用。
	 * 
	 * @param sc
	 * @param billTypeId
	 * @param ids
	 * @param vtCode
	 */
	public void sendAsspVoucherByVtcode(Session sc, long billTypeId,
			long[] ids, String vtCode) {
		List<Billable> bills = (List<Billable>) payCommonService
				.loadBillsWithDetails(sc,
				billTypeId, ids);

		for (Billable bill : bills) {
			PlatformUtils.setProperty(bill, "vt_code", vtCode);
		}
		sendAsspVoucher(sc, bills);
	}

	/**
	 * 发送凭证
	 * 
	 * @param sc
	 * @param billList
	 */
	private void sendAsspVoucher(Session sc, List<Billable> billList) {
		// 记录发送错误的单号
		List<String> errorList = new ArrayList<String>();
		String decOrgType = Parameters.getStringParameter(PayConstant.DEST_MOF_ORG_TYPE);
		
		Map<String,List<Billable>> hashMap = new HashMap<String, List<Billable>>();
		for(Billable bill:billList){
			String key = (String) PlatformUtils.getProperty(bill, "vt_code");
			if(ListUtils.isEmpty(hashMap.get(key))){
				List<Billable> tempList = new ArrayList<Billable>();
				tempList.add(bill);
				hashMap.put(key, tempList);
			}else{
				hashMap.get(key).add(bill);
			}
		}
		for(  String list : hashMap.keySet()){
			List<Billable> bill = hashMap.get(list);
			String[] billNos = PbUtil.getBillNos(bill);
			String admDivCode = (String) PlatformUtils.getProperty(bill.get(0), "admdiv_code");
			String vtCode = (String) PlatformUtils.getProperty(bill.get(0), "vt_code");
			int year = (Integer) PlatformUtils.getProperty(bill.get(0), "year");
			// 批量发送
			try {
				baseBizService.sendVoucher(sc, vtCode, admDivCode, decOrgType, year, billNos);
			}catch( Exception e ){
				System.out.println(e.getMessage());
				
				System.out.println();
				log.error(e.getMessage());
				throw new RuntimeException(e.getMessage());
			}
		}

	}

	

	// //////////////////////////////////////////edit请款、转账和冲销块/////////////////////////////////////////////////////////////////////////

	public static final String UPDATESQL = " update pb_pay_voucher set "
			+ "batchreq_status=#batchreq_status#,batchreq_date=#batchreq_date#,"
			+ " advance_account_name=#advance_account_name# ,"
			+ "advance_account_no=#advance_account_no# ,"
			+ "advance_account_bank=#advance_account_name#,last_ver=#last_ver#,agent_business_no=#agent_business_no# "
			+ "where batch_no=#batch_no#";
	public static final String UPDATESQL_JILINCCB = " update pb_pay_voucher set "
			+ "batchreq_status=#batchreq_status#,batchreq_date=#batchreq_date#,"
			+ " advance_account_name=#advance_account_name# ,"
			+ "advance_account_no=#advance_account_no# ,"
			+ "advance_account_bank=#advance_account_name#,last_ver=#last_ver#,agent_business_no=#agent_business_no#,voucher_status=#voucher_status# "
			+ "where batch_no=#batch_no#";
	public static final String UPDATESQL1 = " update pb_pay_voucher set batchreq_status=#batchreq_status#,batchreq_date=#batchreq_date#,batch_no=#batch_no#,writeoff_flag=#writeoff_flag#,last_ver=#last_ver#,task_id=#task_id#  where pay_voucher_id=#pay_voucher_id#";
	public static final String UPDATESQL2 = "update pb_pay_request set advance_account_no=#advance_account_no#,advance_account_name=#advance_account_name#,advance_account_bank=#advance_account_bank# where pay_request_id=#pay_request_id#";
	public static final String INSERTSQL = "insert into pb_writeoff_voucher(writeoff_voucher_id,pay_voucher_id,create_date,writeoff_date,advance_account_no,advance_account_name,advance_account_bank,pay_amount,batch_no,pay_account_no,pay_account_name,pay_account_bank,agent_business_no,admdiv_code,pay_voucher_code,print_num) "
			+ "values(#writeoff_voucher_id#,#pay_voucher_id#,#create_date#,#writeoff_date#,#advance_account_no#,#advance_account_name#,#advance_account_bank#,#pay_amount#,#batch_no#,#pay_account_no#,#pay_account_name#,#pay_account_bank#,#agent_business_no#,#admdiv_code#,#pay_voucher_code#,#print_num#)";

	//插入请款凭证表 chengkai 2014-7-11 10:23:26
	public static final String insertSQLBatchReqVoucher = "INSERT INTO PB_BATCHREQ_VOUCHER(BILL_NO,PAY_ACCOUNT_NO,PAY_ACCOUNT_NAME,"
		+ "PAY_ACCOUNT_BANK,PAYEE_ACCOUNT_NO,PAYEE_ACCOUNT_NAME,PAYEE_ACCOUNT_BANK,PAY_AMT,ADMDIV_CODE,"
		+ "REMARK,CREATE_DATE,CREATE_USER_ID,CREATE_USER_NAME,BATCHREQ_DATE,VT_CODE,PAY_ALLNUM,PRINT_NUM,"
		+ "PRINT_DATE,TYPE,BATCHREQ_STATUS,BATCHREQ_CSTATUS)values(#bill_no#,#pay_account_no#,#pay_account_name#,#pay_account_bank#,#payee_account_no#,"
		+ "#payee_account_name#,#payee_account_bank#,#pay_amt#,#admdiv_code#,#remark#,#create_date#,#create_user_id#,"
		+ "#create_user_name#,#batchreq_date#,#vt_code#,#pay_allnum#,#print_num#,#print_date#,#type#,#batchreq_status#,#batchreq_cstatus#)"; 

	
	/***************************************************************************
	 * 单笔请款
	 * @param session
	 * @param payVoucherList
	 * @param accountType
	 */
	public String batchReqMoney(Session session,
			List<PayVoucher> payVoucherList, String accountType)
			throws Exception {

		return reqMoney(session,payVoucherList);
	}
	
	/**
	 * 单笔请款
	 * @param sc
	 * @param payVoucherList
	 * @return
	 * @throws Exception
	 */
	public String reqMoney(final Session sc,List<PayVoucher> payVoucherList) throws Exception {
		// 判断当前时间是否在财政的日始日终时间之内，不是则抛出异常提示
		if (!finService.isInDay(payVoucherList.get(0))) {
			throw new FinIsinDayException("当前时间不在财政【"
				+ payVoucherList.get(0).getAdmdiv_code() + "】日始日终时间之内！");
		}
		StringBuffer excetionMsg = null;
		for (PayVoucher p : payVoucherList) {
			List<PayVoucher> templist = new ArrayList<PayVoucher>();
			templist.add(p);
			p.setBatchreq_num(1);
			p.setBatchreq_date(new SimpleDateFormat("yyyyMMdd").format(new Date()));
//			p.setPay_summary_name("请款");

			//add zhouqi 根据当前网点加载垫支户
			BankAccount bankAccount = BankAccountValueSetUtil.getAdvanceAccount(p, sc);
			if (bankAccount == null) {
				throw new CommonException("无法获取当前网点的垫支户！");
			}
			// 支付凭证单据类型
			long payVoucherBTid = Parameters.getLongParameter(
					BILL_TYPE_PAY_VOUCHER);
			// 更新垫支户到主单
			p.setAdvance_account_bank(bankAccount.getBank_name());
			p.setAdvance_account_no(bankAccount.getAccount_no());
			p.setAdvance_account_name(bankAccount.getAccount_name());
			// 网点
			p.setPay_account_code(bankAccount.getBank_code());
			// 查询凭证的所有明细信息
			List<PayRequest> details = null;
			if(ListUtils.isEmpty(p.getDetails())) {
				details = (List<PayRequest>) payCommonService
						.loadDetailsByBill(sc, payVoucherBTid, new long[]{p.getPay_voucher_id()}, null);
			} else {
				details = new ArrayList<PayRequest>();
				for (Billable bill : p.getDetails()) {
					details.add((PayRequest) bill);
				}
			}
			final List<PayRequest> requestList = details;
			for (PayRequest request : requestList) {
				request.setAdvance_account_no(bankAccount.getAccount_no());
				request.setAdvance_account_bank(bankAccount.getBank_name());
				request.setAdvance_account_name(bankAccount.getAccount_name());
			}
			
			//主单要更新的字段
			final List<String> updateFields = new ArrayList<String>();
			updateFields.add("batchreq_status");
			updateFields.add("batchreq_date");
			updateFields.add("advance_account_name");
			updateFields.add("advance_account_no");
			updateFields.add("advance_account_bank");
			updateFields.add("last_ver");
			updateFields.add("agent_business_no");
			updateFields.add("payUser_code");
			try {
				final Session session = sc;
				final PayVoucher payVoucher = p;
				
				
				// 完成划款账户到零余额的转账，然后更新凭证表中的请款是否成功状态
				this.smallTrans.newTransExecute(new ISmallTransService() {
					public void doExecute() throws Exception {
						
						//进行额度控制
						String accreditPay = PbParameters.getStringParameter(PbParaConstant.ACCREDIT_PAY_TYPE_CODE, payVoucher.getAdmdiv_code());
						if(StringUtil.isEmpty(accreditPay)){
							throw new CommonException("当前菜单id为" + sc.getCurrMenuId()
									+ "，财政" + payVoucher.getAdmdiv_code() + "没授权支付的配置！");
						}
						
						lockBillForTrans(sc, payVoucher, "batchreq_status", 1, payVoucher.getBatchreq_status());
						
						if(payVoucher.getPay_type_code().startsWith(accreditPay)){
							balanceService.payRequestsEntrance(sc, requestList, false);
						}
						// 垫支户到零余额
						payVoucher.setTrade_type(TradeConstant.ADVANCE2PAY);
						List<PayVoucher> tempList = new ArrayList<PayVoucher>();
						tempList.add(payVoucher);
						//保存请款日志操作
						logService.saveTaskLogInfo(sc, tempList, "请款");
						TransReturnDTO transResult = transService.payTrans(session,
								payVoucher);
						if (transResult == null || transResult.getResStatus() != 0) {
							throw new CommonException("", "请款失败，原因："
									+ transResult.getResMsg());
						}
						payVoucher.setPayUser_code(sc.getUserCode());
						payVoucher.setBatchreq_status(BatchReqMoneyVoucher.STATUS_SUCCESS);
						tempList.clear();
						tempList.add(payVoucher);
						if("JILIN".equals(PbParameters.getStringParameter("pb.bankHXCode"))){
							VoucherStatus.P_VOCHER_NOPAY.setVoucherStatus(payVoucher);
							//吉林更新凭证状态的字段
							updateFields.add("voucher_status");
							billEngine.updateBill(sc, updateFields,tempList , false);
						}else{
							billEngine.updateBill(sc, updateFields,tempList , false);
						}
						//明细不需要更新的字段移除
						updateFields.remove("batchreq_status");
						updateFields.remove("batchreq_date");
						updateFields.remove("last_ver");
						updateFields.remove("agent_business_no");
						updateFields.remove("payUser_code");
						//更新明细字段
						billEngine.updateBill(sc, updateFields,payVoucher.getDetails() , false);
						
					}
				});
			} catch (SocketTimeoutException ex) {
				if (excetionMsg == null) {
					excetionMsg = new StringBuffer();
				}
				excetionMsg.append(ex.getMessage() + ",");

			} catch (Exception e) {
				log.error(e.getMessage(), e);
				// 如果请款失败则更新请款状态为失败（-1）
				p.setBatchreq_status(BatchReqMoneyVoucher.STATUS_FAILURE);
				updateField(sc, p, updateFields);
				if (excetionMsg == null) {
					excetionMsg = new StringBuffer();
					excetionMsg.append(e.getMessage() + ",");
					excetionMsg.append("当前存在请款失败的数据，凭证号为：");
				}
				excetionMsg.append(p.getPay_voucher_code() + ",");
			}
		}
		return excetionMsg != null ? excetionMsg.substring(0, excetionMsg
				.length() - 1) : null;
	}

	/**
	 * 单笔请款
	 * @param sc
	 * @param payVoucherList
	 * @return
	 * @throws Exception
	 */
	public String ReqPayout(final Session sc,List<PayVoucher> payVoucherList) throws Exception {
		StringBuffer excetionMsg = null;
		// 判断当前时间是否在财政的日始日终时间之内，不是则抛出异常提示
		if (!finService.isInDay(payVoucherList.get(0))) {
			throw new FinIsinDayException("当前时间不在财政【"
				+ payVoucherList.get(0).getAdmdiv_code() + "】日始日终时间之内！");
		}
		
		final List<PayVoucher> templist = new ArrayList<PayVoucher>();
		
		for (PayVoucher p : payVoucherList) {
			
			templist.add(p);
			p.setBatchreq_num(1);
			p.setBatchreq_date(new SimpleDateFormat("yyyyMMdd").format(new Date()));
			p.setPay_summary_name("请款");

			//add zhouqi 根据当前网点加载垫支户
			BankAccount bankAccount = BankAccountValueSetUtil.getAdvanceAccount(p, sc);
			if (bankAccount == null) {
				throw new CommonException("无法获取当前网点的垫支户！");
			}
			// 支付凭证单据类型
			long payVoucherBTid = Parameters.getLongParameter(
					BILL_TYPE_PAY_VOUCHER);
			// 更新垫支户到主单
			p.setAdvance_account_bank(bankAccount.getBank_name());
			p.setAdvance_account_no(bankAccount.getAccount_no());
			p.setAdvance_account_name(bankAccount.getAccount_name());
			// 网点
			p.setPay_account_code(bankAccount.getBank_code());
			// 查询凭证的所有明细信息
			final List<PayRequest> requestList = (List<PayRequest>) payCommonService
					.loadDetailsByBill(sc, payVoucherBTid, new long[]{p.getPay_voucher_id()}, null);
			for (PayRequest request : requestList) {
				request.setAdvance_account_no(bankAccount.getAccount_no());
				request.setAdvance_account_bank(bankAccount.getBank_name());
				request.setAdvance_account_name(bankAccount.getAccount_name());
			}
			final List<String> updateFields = new ArrayList<String>();
			updateFields.add("batchreq_status");
			updateFields.add("batchreq_date");
			updateFields.add("advance_account_name");
			updateFields.add("advance_account_no");
			updateFields.add("advance_account_bank");
			updateFields.add("last_ver");
			updateFields.add("agent_business_no");
			updateFields.add("business_type");
			updateFields.add("voucherFlag");
			updateFields.add("is_onlyreq");
			updateFields.add("task_id");
			updateFields.add("pay_date");
			updateFields.add("trans_res_msg");
			try {
				final Session session = sc;
				final PayVoucher payVoucher = p;
				
				
				// 完成划款账户到零余额的转账，然后更新凭证表中的请款是否成功状态
				this.smallTrans.newTransExecute(new ISmallTransService() {
					public void doExecute() throws Exception {
						
						lockBillForTrans(sc, payVoucher, "batchreq_status", 1, payVoucher.getBatchreq_status());
						
						TimeCalculator tc = new TimeCalculator(log);
						tc.start();
						tc.middle("+++++++++++++走工作流开始");
						
						// start zhaoyong 2015-03-06  更改处理流程顺序。。。先走工作流。。再转账支付
						try{
							templist.removeAll(templist);
							templist.add(payVoucher);
							
							if (!(payVoucher.getTask_id() > 0)) {
								// 调用工作流录入
//								workflow.createProcessInstance(session,"PB_PAY_REQUEST", requestList, false);
								workflow.createProcessInstance(session,"PB_PAY_VOUCHER", templist, false);
							}
							// 完成送审操作
//							workflow.signalProcessInstance(session, requestList,WORK_FLOW_NEXT, "转账");
							workflow.signalProcessInstance(session, templist,WORK_FLOW_NEXT, "转账");
							tc.middle("+++++++++++++走工作流耗时:");
						}
						catch( Exception e ){
							throw new WorkflowException( "凭证号为" + payVoucher.getPay_voucher_code() + "支付凭证走工作流异常" ); 
						}
						// end zhaoyong 2015-03-06  更改处理流程顺序。。。先走工作流。。再转账支付
						
						// 垫支户到零余额
						payVoucher.setTrade_type(TradeConstant.ADVANCE2PAY);
						TransReturnDTO transResult = transService.payTrans(session,
								payVoucher);
						if (transResult == null || transResult.getResStatus() != 0) {
							throw new CommonException("", "请款失败，原因："
									+ transResult.getResMsg());
						}
						payVoucher.setBatchreq_status(BatchReqMoneyVoucher.STATUS_SUCCESS);

						Timestamp nowTime = DateTimeUtils.nowDatetime();
						// 设置为已转账
						payVoucher.setBusiness_type(PayConstant.Has_CONFIRMED);
						payVoucher.setVoucherFlag(XmlConstant.VOUCHERFLAG_VALUE_RETURN);
						payVoucher.setIs_onlyreq(1);
//						if (!p.getSet_mode_name().contains("现金")) {
//							p.setXPayAmt(p.getPay_amount());
//						}
						// 更新支付凭证数据
//						payVoucher.setTask_id(requestList.get(0).getTask_id());
						payVoucher.setPay_date(nowTime);
						payVoucher.setTrans_res_msg("转账成功");
						
						
						for (PayRequest request : requestList) {
							request.setPay_date(nowTime);
							request.setAgent_business_no(payVoucher.getAgent_business_no());
							request.setTask_id(payVoucher.getTask_id());
						//	request.setIs_onlyreq(1);//----------
						//	request.setVoucherFlag(XmlConstant.VOUCHERFLAG_VALUE_RETURN);
						}
						
					
//						List<PayVoucher> tempList = new ArrayList<PayVoucher>();
//						tempList.add(payVoucher);
						templist.removeAll(templist);
						templist.add(payVoucher);
						billEngine.updateBill(sc, updateFields, templist, false);
						updateFields.remove("batchreq_status");
						updateFields.remove("batchreq_date");
						updateFields.remove("last_ver");
						updateFields.remove("business_type");
						updateFields.remove("voucherFlag");
						updateFields.remove("is_onlyreq");
						updateFields.remove("trans_res_msg");
						billEngine.updateBill(sc, updateFields, requestList, false);
					}
				});
			} catch (SocketTimeoutException ex) {
				if (excetionMsg == null) {
					excetionMsg = new StringBuffer();
				}
				excetionMsg.append(ex.getMessage() + ",");

			} catch (Exception e) {
				// 如果请款失败则更新请款状态为失败（-1）
				p.setBatchreq_status(BatchReqMoneyVoucher.STATUS_FAILURE);
				updateField(sc, p, updateFields);
				log.error(e.getMessage(), e);
				if (excetionMsg == null) {
					excetionMsg = new StringBuffer();
					excetionMsg.append(e.getMessage() + ",");
					excetionMsg.append("当前存在请款失败的数据，凭证号为：");
				}
				excetionMsg.append(p.getPay_voucher_code() + ",");
			}
		}
		return excetionMsg != null ? excetionMsg.substring(0, excetionMsg
				.length() - 1) : null;
	}
	/**
	 * 再次请款
	 * 
	 * @param session
	 * @param payVoucherList
	 */
	public String batchRepeatReqMoney(Session session,
			List<PayVoucher> payVoucherList, String accountType)
			throws Exception {
		//再次请款改为单笔
		return reqMoney(session,payVoucherList);
	}

	
	
	/**
	 * 授权支付只请款
	 * @param session
	 * @param payVoucherList
	 * @param accountType
	 * @return
	 */
	public String requsetPayout(Session session,
			List<PayVoucher> payVoucherList, String accountType)throws Exception 
	{
		//调用授权支付只请款(单笔请款)方法
		return ReqPayout(session,payVoucherList);
		/**
		// 判断当前时间是否在财政的日始日终时间之内，不是则抛出异常提示
		if (!finService.isInDay(payVoucherList.get(0).getAdmdiv_code())) {
				throw new CommonException("", "当前时间不在财政【"
							+ payVoucherList.get(0).getAdmdiv_code() + "】日始日终时间之内！");
		}
				
		// TODO: 黑龙江直接支付业务分
		// 预算内和预算外，分别对应不同的零余额账户，故需要对pay_account_no进行分组，批量请款时，才能保证转入对应零余额账户中
		Map<String, List<PayVoucher>> voucherByZeroAccount = new HashMap<String, List<PayVoucher>>();
		for (PayVoucher p : payVoucherList) {
			List<PayVoucher> tempList = voucherByZeroAccount.get(p
					.getPay_account_no());
			if (ListUtils.isEmpty(tempList)) {
				tempList = new ArrayList<PayVoucher>();
				tempList.add(p);
				voucherByZeroAccount.put(p.getPay_account_no(), tempList);
			} else {
				tempList.add(p);
			}
		}
		
		//分组请款
		StringBuffer resMsg = new StringBuffer();
		for (Map.Entry<String, List<PayVoucher>> entry : voucherByZeroAccount
				.entrySet()) {
			
			String msg = null;
			
			if (entry.getValue() == null || (entry.getValue()!=null&&entry.getValue().size() == 0)) {
				throw new CommonException("请款信息为空！");
			}
			// 1、设置批次号、更新批次号
			try {
				
					for (PayVoucher p : payVoucherList) {
						if (!StringUtil.isEmpty(p.getBatchreq_no())) {
							throw new RuntimeException("单号为"
									+ p.getPay_voucher_code() + "的凭证已经请过款！");
						}
						//后面请款时逐笔进行的，需要逐笔设置批次号
						List<PayVoucher> list = new ArrayList<PayVoucher>();
						list.add(p);
						settingBatchNo(session, list);
					}
			} catch (Exception e) {
				throw new CommonException("设置批次号失败，原因：" + e.getMessage());
			}
			// 2、批量请款、更新请款日期和请款状态
			for( PayVoucher p : payVoucherList ){
				msg= accountBatchReqPayout(session, p, accountType);
			}
			if (msg != null) {
				resMsg.append(msg);
			}

		}
		return resMsg.toString().equals("") ? null : resMsg.toString();
		**/
		//return null;
	}
	
	
	
	
	public static final String UPDATEPAYVOUCHER=" update pb_pay_voucher set batchreq_status=#batchreq_status#, "
		+"batchreq_date=#batchreq_date#, advance_account_name=#advance_account_name#, advance_account_no=#advance_account_no#, "
		+"advance_account_bank=#advance_account_bank#, last_ver=#last_ver#,agent_business_no=#agent_business_no#, "
		+"business_type=#business_type#, voucherFlag=#voucherFlag#, is_onlyreq=#is_onlyreq#, task_id=#task_id#, "
		+"pay_date=#pay_date#, trans_res_msg=#trans_res_msg# where batch_no=#batch_no#";
	
	
	public static final String UPDATEPAYREQUEST=" update pb_pay_request set advance_account_no=#advance_account_no#, "
		+"advance_account_name=#advance_account_name#,advance_account_bank=#advance_account_bank#, pay_date=#pay_date#, " 
		+"agent_business_no=#agent_business_no#,task_id=#task_id# " +
				"where pay_request_id=#pay_request_id#";


	
	
	
	
	/**
	 * 授权支付只请款-再次请款
	 * @param session
	 * @param payVoucherList
	 * @param accountType
	 * @return
	 * @throws Exception
	 */
	public String batchRepeatReqPayout(Session session,
			List<PayVoucher> payVoucherList, String accountType)
			throws Exception {
		//再次请款调用授权支付只请款(单笔请款)方法
		return ReqPayout(session,payVoucherList);
		
		/*
		StringBuffer strBuffer = new StringBuffer();
		if (payVoucherList == null || payVoucherList.size() == 0) {
			throw new CommonException("请款信息为空！");
		}
		
	
		// 判断当前时间是否在财政的日始日终时间之内，不是则抛出异常提示
		if (!finService.isInDay(payVoucherList.get(0).getAdmdiv_code())) {
				throw new CommonException("", "当前时间不在财政【"
							+ payVoucherList.get(0).getAdmdiv_code() + "】日始日终时间之内！");
		}
		List<String> batchNos = new ArrayList<String>();
		for (PayVoucher payVoucher : payVoucherList) {
			String batchNo = payVoucher.getBatch_no();
			if (!batchNos.contains(batchNo)) {
				batchNos.add(batchNo);
			}
		}
		for (int b = 0; b < batchNos.size(); b++) {
			String sql = "select * from pb_pay_voucher where batch_no ='"
					+ batchNos.get(b) + "'";
			List<PayVoucher> payVouchers = daoSupport.query(sql,
					PayVoucher.class);
			// 调用请款
			for( PayVoucher payVoucher : payVouchers ){
				String s = this.accountBatchReqPayout(session, payVoucher, accountType);
				strBuffer.append(s);
			}
//			String s = this.accountBatchReqPayout(session, payVouchers, accountType);
//			if (s != null) {
//				if (strBuffer == null) {
//					strBuffer = new StringBuffer();
//				}
//				strBuffer.append(s);
//			}
		}
		return strBuffer.length() == 0 ? null : strBuffer.toString();
		*/
	}
	
	/*******************************************************************************************************************************************
	 * 人工转账
	 
	 * @param sc
	 * @param ids
	 * @author liuteng
	 */
	@SuppressWarnings("unchecked")
	public void artificialtransferPayVoucher(Session sc, List<PayVoucher> pvList,
			int recordType ,boolean pay) throws Exception {
		
		acceptCommonSignPayVoucher(sc,pvList,recordType,false );
			}
	
	//**********************************************************************************************************************************************************************************
	/**
	 * 冲销凭证
	 * 
	 * @param session
	 * @param vList
	 */
	public String writeoffVoucher(final Session sc, List<PayVoucher> payVoucherList)
			throws Exception {
		//冲销凭证之前 查询是否已经支付成功
		for(PayVoucher tempVoucher:payVoucherList){
			tempVoucher.setTrade_type(TradeConstant.PAY2PAYEE);
			
			TransReturnDTO transReturn1 = transService.queryTrans(sc, tempVoucher);
			
			int  i;
			if(transReturn1 == null){
				i = TransReturnDTO.FAILURE;
			}else{
				i = transReturn1.getResStatus();
			}
			

			// 交易状态为成功和不确定transReturn2态不能退票
			if (TransReturnDTO.UNKNOWN == i || TransReturnDTO.SUCESS == i || i == TradeConstant.TRANS_UNKOWN) {
				throw new CommonException("", "凭证："
						+ tempVoucher.getCode()
				+ "已支付成功或不确认，无法冲销！");
			}
		}

		StringBuffer excetionMsg = null;

		// 重新生成batchno,重新生成一个Payvoucher ,付款人是零余额，收款人事垫支户,金额不变，
		List<PayVoucher> tranpayVoucherList = new ArrayList();
		for (PayVoucher payVoucher : payVoucherList) {
			PayVoucher payvoucher1 = payVoucher;
			// 交易使用
			payvoucher1.setPay_voucher_code(payVoucher.getPay_voucher_code());
			payvoucher1.setPay_account_no(payVoucher.getPay_account_no());
			payvoucher1.setPay_account_name(payVoucher.getPay_account_name());
			payvoucher1.setPay_account_bank(payVoucher.getPay_account_bank());

			payvoucher1.setPayee_account_no(payVoucher.getAdvance_account_no());
			payvoucher1.setPayee_account_name(payVoucher
					.getAdvance_account_name());
			payvoucher1.setPayee_account_bank(payVoucher
					.getAdvance_account_bank());
			payvoucher1.setPayee_account_bank_no("");
			payvoucher1.setPay_amount(payVoucher.getPay_amount());

			// 冲销凭证更新使用
			payvoucher1.setPay_voucher_id(payVoucher.getPay_voucher_id());
			payvoucher1.setBatch_no(payVoucher.getBatch_no());
			payvoucher1.setAdmdiv_code(payVoucher.getAdmdiv_code());
			tranpayVoucherList.add(payvoucher1);
		}
		
		long billTypeId = Parameters.getLongParameter(
				PayConstant.BILL_TYPE_PAY_VOUCHER);
		// 明细为空才加载明细，此明细用来恢复额度
		if (ListUtils.isEmpty(payVoucherList.get(0).getDetails())) {
			// 主单ID数组
			long ids[] = BillUtils.getBillIds(payVoucherList);
			// 查询对应的明细信息
			List<PayRequest> requests = (List<PayRequest>) payCommonService
							.loadDetailsByBill(sc, billTypeId, ids, null);
			
			// 设置单据和明细的关联关系
			PbUtil.setBillDetails(payVoucherList, requests, "pay_voucher_id");
		}

		// final List<PayVoucher> list=payVoucherList;
		for (PayVoucher payVoucher : tranpayVoucherList) {
			try {
				final Session session = sc;
				final PayVoucher batchPayVoucher = payVoucher;
				
				
				this.smallTrans.newTransExecute(new ISmallTransService() {

					public void doExecute() throws Exception {
						
						lockBillForTrans(sc, batchPayVoucher, "batchreq_status", 0, batchPayVoucher.getBatchreq_status());
						
						batchPayVoucher
								.setTrade_type(TradeConstant.PAY2ADVANCE_WRITEOFF);
						saveWriteoffVoucher(batchPayVoucher);
						
						List<PayRequest> requests = new ArrayList<PayRequest>();
						for( Billable bill : batchPayVoucher.getDetails()){
							PayRequest r = (PayRequest)bill;
							r.setPay_amount(r.getPay_amount().negate());
							requests.add(r);
						}
						//进行额度控制，即恢复额度
						String directPay = PbParameters.getStringParameter(PbParaConstant.DIRECTPAY_PAY_TYPE_CODE, batchPayVoucher.getAdmdiv_code());
						if( !batchPayVoucher.getPay_type_code().startsWith(directPay)){
							balanceService.payRequestsEntrance(session, requests , false);
						}
						List<PayVoucher> tempList = new ArrayList<PayVoucher>();
						tempList.add(batchPayVoucher);
						//保存冲销日志
						logService.saveTaskLogInfo(sc, tempList, "冲销凭证");
						TransReturnDTO transResult = transService.payTrans(
								session, batchPayVoucher);
						clearBatchNo(batchPayVoucher);
						if (transResult == null
								|| transResult.getResStatus() != 0) {
							throw new CommonException("", batchPayVoucher
									.getPay_voucher_code()
									+ ",");
						}
					}
				});
				
				
			}catch (PbTransException e1) {
				log.error(e1.getMessage());
				payVoucher.setReturn_reason(e1.getMessage());
				List<String> updateFileList = new ArrayList<String>();
				updateFileList.add("return_reason");
				//转账异常后保存失败原因
				updateField(sc,payVoucher,updateFileList);
				if (excetionMsg == null) {
					excetionMsg = new StringBuffer();
				}
				excetionMsg.append(e1.getMessage() + ",");
			} catch (Exception e) {
				log.error(e.getMessage(), e);
				if (excetionMsg == null) {
					excetionMsg = new StringBuffer();
				}
				excetionMsg.append(e.getMessage() + ",");
			}
		}
		return excetionMsg != null ? "存在冲销失败的凭证，凭证号为："
				+ excetionMsg.substring(0, excetionMsg.length() - 1).toString()
				: null;
	}

	/**
	 * 冲销凭证
	 * 
	 * @param session
	 * @param vList
	 */
	public String writeoffVoucherAndtask(Session sc, List<PayVoucher> payVoucherList)
			throws Exception {		
		StringBuffer excetionMsg = null;

		// 重新生成batchno,重新生成一个Payvoucher ,付款人是零余额，收款人事垫支户,金额不变，
		List<PayVoucher> tranpayVoucherList = new ArrayList();
		for (PayVoucher payVoucher : payVoucherList) {
			PayVoucher payvoucher1 = payVoucher;
			// 交易使用
			payvoucher1.setPay_voucher_code(payVoucher.getPay_voucher_code());
			payvoucher1.setPay_account_no(payVoucher.getPay_account_no());
			payvoucher1.setPay_account_name(payVoucher.getPay_account_name());
			payvoucher1.setPay_account_bank(payVoucher.getPay_account_bank());

			payvoucher1.setPayee_account_no(payVoucher.getAdvance_account_no());
			payvoucher1.setPayee_account_name(payVoucher
					.getAdvance_account_name());
			payvoucher1.setPayee_account_bank(payVoucher
					.getAdvance_account_bank());
			payvoucher1.setPayee_account_bank_no("");
			payvoucher1.setPay_amount(payVoucher.getPay_amount());

			// 冲销凭证更新使用
			payvoucher1.setPay_voucher_id(payVoucher.getPay_voucher_id());
			payvoucher1.setBatch_no(payVoucher.getBatch_no());
			payvoucher1.setAdmdiv_code(payVoucher.getAdmdiv_code());
			tranpayVoucherList.add(payvoucher1);
		}
		
		long billTypeId = Parameters.getLongParameter(
				PayConstant.BILL_TYPE_PAY_VOUCHER);
		// 明细为空才加载明细，此明细用来恢复额度
		if (ListUtils.isEmpty(payVoucherList.get(0).getDetails())) {
			// 主单ID数组
			long ids[] = BillUtils.getBillIds(payVoucherList);
			// 查询对应的明细信息
			List<PayRequest> requests = (List<PayRequest>) payCommonService
					.loadDetailsByBill(sc, billTypeId, ids, null);
			//金额变成负，用来恢复额度
			for(PayRequest r : requests){
				r.setPay_amount(r.getPay_amount().negate());
			}
			// 设置单据和明细的关联关系
			PbUtil.setBillDetails(payVoucherList, requests, "pay_voucher_id");
		}

		// final List<PayVoucher> list=payVoucherList;
		for (PayVoucher payVoucher : tranpayVoucherList) {
			try {
				final Session session = sc;
				final PayVoucher batchPayVoucher = payVoucher;
				this.smallTrans.newTransExecute(new ISmallTransService() {

					public void doExecute() throws Exception {
						
						lockBillForTrans(session, batchPayVoucher, "batchreq_status", 0, batchPayVoucher.getBatchreq_status());
						
						batchPayVoucher
								.setTrade_type(TradeConstant.PAY2ADVANCE_WRITEOFF);
						saveWriteoffVoucher(batchPayVoucher);
						
						List<PayRequest> requests = new ArrayList<PayRequest>();
						for( Billable bill : batchPayVoucher.getDetails()){
							PayRequest r = (PayRequest)bill;
							requests.add(r);
						}
						//进行额度控制，即恢复额度
						String directPay = PbParameters.getStringParameter(PbParaConstant.DIRECTPAY_PAY_TYPE_CODE, batchPayVoucher.getAdmdiv_code());
						if(!batchPayVoucher.getPay_type_code().startsWith(directPay)){
							balanceService.payRequestsEntrance(session, requests , false);
						}

						TransReturnDTO transResult = transService.payTrans(
								session, batchPayVoucher);
						batchPayVoucher.setTask_id(0);
						clearBatchNo(batchPayVoucher);						
						if (transResult == null
								|| transResult.getResStatus() != 0) {
							throw new CommonException("", batchPayVoucher
									.getPay_voucher_code()
									+ ",");
						}
					}
				});
			}catch (PbTransException e1) {
				log.error(e1.getMessage());
				payVoucher.setReturn_reason(e1.getMessage());
				List<String> updateFileList = new ArrayList<String>();
				updateFileList.add("return_reason");
				//转账异常后保存失败原因
				updateField(sc,payVoucher,updateFileList);
                if (excetionMsg == null) {
                    excetionMsg = new StringBuffer();
                }
                excetionMsg.append(e1.getMessage() + ",");
			} catch (Exception e) {
				log.error(e.getMessage(), e);
				if (excetionMsg == null) {
					excetionMsg = new StringBuffer();
				}
				excetionMsg.append(e.getMessage() + ",");
			}
		}
		return excetionMsg != null ? "存在冲销失败的凭证，凭证号为："
				+ excetionMsg.substring(0, excetionMsg.length() - 1).toString()
				: null;
	}

	/***
	 * 保存冲销凭证
	 * 
	 * @param payList
	 * @throws Exception
	 */
	public void saveWriteoffVoucher(PayVoucher p) throws Exception {
		List<WriteoffVoucher> writeList = new ArrayList<WriteoffVoucher>();
		WriteoffVoucher w = null;
		try {
			w = new WriteoffVoucher();
			w.setWriteoff_voucher_id(IdGen.genNumId());
			w.setPay_voucher_id(p.getPay_voucher_id());
			w.setCreate_date(DateTimeUtils.nowDatetime());
			w.setWriteoff_date(new SimpleDateFormat("yyyyMMdd")
					.format(new Date()));
			w.setPay_amount(p.getPay_amount());
			w.setAdvance_account_bank(p.getPayee_account_bank());
			w.setAdvance_account_name(p.getPayee_account_name());
			w.setAdvance_account_no(p.getPayee_account_no());
			w.setBatch_no(p.getBatch_no());
			w.setPay_account_name(p.getPay_account_name());
			w.setPay_account_no(p.getPay_account_no());
			w.setPay_account_bank(p.getPay_account_name());
			w.setAgent_business_no(p.getAgent_business_no());
			w.setAdmdiv_code(p.getAdmdiv_code());
			w.setPay_voucher_code(p.getPay_voucher_code());
			daoSupport.executeUpdate(INSERTSQL, w);
		} catch (Exception ex) {
			throw new CommonException("", "冲销凭证设置失败，原因：" + ex.getMessage());
		}
	}

	/****
	 * 清空批次号
	 * 
	 * @param sc
	 * @param payList
	 * @throws Exception
	 */
	public void clearBatchNo(PayVoucher p) throws Exception {
		try {
			PayVoucher payvoucher = p;
			payvoucher.setBatchreq_date("");
			payvoucher.setBatch_no("");
			payvoucher.setBatchreq_status(BatchReqMoneyVoucher.STATUS_INIT);
			payvoucher.setWriteoff_flag(1);

			List<String> updateFileList = new ArrayList<String>();
			updateFileList.add("batch_no");
			updateFileList.add("batchreq_date");
			updateFileList.add("batchreq_status");
			updateFileList.add("last_ver");
			updateFileList.add("writeoff_flag");
			updateFileList.add("task_id");

			// 更新批次号
			daoSupport.executeUpdate(UPDATESQL1, payvoucher);
		} catch (Exception ex) {
			throw new Exception("清空批次号失败，原因：" + ex.getMessage());
		}
	}

	// //////////////////////////////////////////end请款转账块/////////////////////////////////////////////////////////////////////////

	public BaseDAO getBaseDao() {
		return baseDao;
	}

	public void setBaseDao(BaseDAO baseDao) {
		this.baseDao = baseDao;
	}

	public IPbConfigService getConfigService() {
		return configService;
	}

	public void setConfigService(IPbConfigService configService) {
		this.configService = configService;
	}

	public IBaseBizService getBaseBizService() {
		return baseBizService;
	}

	public void setBaseBizService(IBaseBizService baseBizService) {
		this.baseBizService = baseBizService;
	}

	public void setBalanceService(BalanceService balanceService) {
		this.balanceService = balanceService;
	}

	public void setBillEngine(BillEngine billEngine) {
		this.billEngine = billEngine;
	}

	public void setDaoSupport(DaoSupport daoSupport) {
		this.daoSupport = daoSupport;
	}

	public void setWorkflow(IWorkflowRunService workflow) {
		this.workflow = workflow;
	}

	public ISmalTrans getSmallTrans() {
		return smallTrans;
	}

	public void setSmallTrans(ISmalTrans smallTrans) {
		this.smallTrans = smallTrans;
	}

	public IBankAccountService getBankAccountService() {
		return bankAccountService;
	}

	public void setBankAccountService(IBankAccountService bankAccountService) {
		this.bankAccountService = bankAccountService;
	}

	public ITransService getTransService() {
		return transService;
	}

	public void setTransService(ITransService transService) {
		this.transService = transService;
	}

	/**
	 * 单条查询财政资金跨行业务，网银可根据“核销状态”字段判断跨行落地业务的执行情况 并更新batcthreq_status
	 */
	public void queryDifTransAndUpdate(final Session sc, long[] ids)
			throws Exception {
		NormalCaculate.longArrayCaculate(ids, "");
		String strIds = "";
		for (long id : ids) {
			strIds += id + ",";
		}
		INetworkService iNetworkService = (INetworkService) StaticApplication
				.getBean("pb.common.impl.NetworkService");
		final BanknetzDTO network = iNetworkService.getBanknetzDTOByBankId(sc
				.getBelongOrgId());
		// 查询本地交易日志记录成功的核心交易流水
		String sql = " select v.pay_voucher_id,v.pay_account_no,l.accthost_seqid from pb_pay_voucher v ,pb_trans_log l "
				+ "where v.pay_voucher_id in ("
				+ strIds.substring(0, strIds.length() - 1)
				+ ") "
				+ "and v.pay_voucher_code = l.voucher_no and l.trans_succ_flag = 1";
		List<PayVoucher> vouchers = baseDao.queryForList(sql,
				new RowMapper<PayVoucher>() {
					public PayVoucher mapRow(ResultSet r, int i)
							throws SQLException {
						PayVoucher voucher = new PayVoucher();
						voucher.setPay_voucher_id(r.getLong("pay_voucher_id"));
						voucher.setAgent_business_no(r
								.getString("accthost_seqid"));
						voucher
								.setPay_account_no(r
										.getString("pay_account_no"));
						voucher.setPay_account_code(network.getBank_code());
						return voucher;
					}
				});

		if (!ListUtils.isEmpty(vouchers)) {
			for (final PayVoucher voucher : vouchers) {
				smallTrans.newTransExecute(new ISmallTransService() {

					public void doExecute() throws Exception {

						int status = 0;
						// 如果配置了非农行的不调用转账接口，也就不用进行核销
						if (PbParameters
								.getIntParameter("pb.trans.otherNoTrans") == 1) {
							status = 3;
						} else {
							// 请求核心查询核销状态
							TransReturnDTO transResult = transService
									.queryTrans(sc, voucher);
							// 核销状态标识
							status = transResult.getResStatus();
						}

						// 核销状态描述
						String describe = "";
						switch (status) {
						case 0:
							describe = "未核销";
							break;
						case 1:
							describe = "核销未成功";
							break;
						case 2:
							describe = "核销中, 等待人工干预";
							break;
						case 3:
							describe = "已核销";
							break;
						default:
							break;
						}
						// 更新核销状态
						String updateSql = "update pb_pay_voucher v set v.write_off_status = ? ,v.write_off_describe = ?"
								+ " where v.pay_voucher_id = ?";
						baseDao.execute(updateSql, new Object[] { status,
								describe, voucher.getPay_voucher_id() });
						// //处于核销状态
						// if("0".equals(resBody.getResHead().getReqCode()+"")){
						// voucher.setBatchreq_status(1);
						// //更新
						// baseDao.execute("update pb_pay_voucher set batchreq_status = 1 where pay_voucher_id = "
						// + voucher.getPay_voucher_id());
						// }

					}
				});
			}
		}
	}

	@Override
	public void deletePayVouchers(Session sc, List<PayVoucher> payVoucherList) {
		// 没有需要删除的单据
		if (ListUtils.isEmpty(payVoucherList)) {
			return;
		}
		try {
			List<PayRequest> reqList = new ArrayList<PayRequest>();

			// 主单ID数组
			long ids[] = BillUtils.getBillIds(payVoucherList);
			long billTypeId = Parameters.getLongParameter(
					PayConstant.BILL_TYPE_PAY_VOUCHER);

			List<PayRequest> requestList = (List<PayRequest>) payCommonService
					.loadDetailsByBill(sc, billTypeId, ids, null);

			billEngine.deleteBill(sc, payVoucherList);
			billEngine.deleteBill(sc, requestList);
		} catch (Exception e) {
			log.error(e.getMessage(), e);
			throw new RuntimeException("删除凭证失败 ,原因 :" + e.getMessage());
		}
	}

	interface ISerialNoGetter{
		
		public List<SerialNo>  getSerialList(Session sc, List<PayVoucher> pvList) throws Exception;
	}

	class HuNanSerialNoGetterImpl implements ISerialNoGetter{
		@Override
		public List<SerialNo> getSerialList(Session sc ,List<PayVoucher> pvList) {
			List<SerialNo> serialList = new ArrayList<SerialNo>();
			TreeSet dateSet = new TreeSet(); 
			for (PayVoucher p : pvList) {
				if (null != p.getPay_date()) {
					dateSet.add(p.getPay_date());
				}
			}
			String startDate = DateUtil.DateToString((Timestamp)dateSet.first(),"yyyyMMdd");
			String endDate = DateUtil.DateToString((Timestamp)dateSet.last(), "yyyyMMdd");
			//serialList = 
			return null;
		}
	}

	class SerialNoGetterImpl implements ISerialNoGetter{

		@Override
		public List<SerialNo> getSerialList(Session sc ,List<PayVoucher> pvList) throws Exception {
			List<SerialNo> serialList = new ArrayList<SerialNo>();
			List<String> dateList = new ArrayList<String>();
			for (PayVoucher p : pvList) {
				if (null != p.getPay_date()) {
					String date = DateUtil.DateToString(p.getPay_date(),
							"yyyyMMdd");
					if (!dateList.contains(date)) {
						dateList.add(date);
					}
				}
			}
			// 判断所有的支付凭证是否都已交易成功
			StringBuffer voucherNoSb = new StringBuffer();
			for (String date : dateList) {
				serialList = transService.checkSerialno(sc, pvList.get(0), date);
				if (ListUtils.isEmpty(serialList)) {
					throw new CommonException("银行接口【根据日期查询流水】无返回信息！");
				}
			}
			return serialList;
		}
	}

	
	@Override
	 public String queryPayeeAcctNameInBank(Session sc, PayVoucher p)
			throws Exception {
		return null;
//		//户名
//		String acctName = "";
//		//先去本地查询pb_bankno_cache
//		String sql = "select payee_account_name_inbank from pb_pay_voucher where payee_account_no = ?";
//		Map map = (Map) this.baseDao.queryForOne(sql, new Object[]{payeeAcctNo} );
//		acctName = (String)map.get("payee_account_name_inbank ");
//		if(StringUtil.isEmpty(acctName)){
//			//向银行核心发起查询
//			acctName = transService.queryPayeeAcctNameInBank(sc, payeeAcctNo);
//			//更新缓存表
//			if(!StringUtil.isEmpty(acctName)){
//				String updateSql = "update pb_pay_voucher set payee_account_name_inbank = '"+acctName+"' where payee_account_no = '"+payeeAcctNo+"'";
//				this.daoSupport.executeUpdate(updateSql);
//			}
//		}
//		return acctName;
	}

	/**
	 * 用于支付成功使用，不调用银行核心接口(不走工作流)
	 * @throws Exception 
	 */
	@SuppressWarnings("unchecked")
	public void acceptCommonSignPayVoucherSuccNoWorkFlow(Session sc,
			List<PayVoucher> payVoucherList) throws Exception {
		
		// 如果没有需要登记的数据则直接返回
		if (ListUtils.isEmpty(payVoucherList)) {
			return;
		}
		// 判断当前时间是否在财政的日始日终时间之内，不是则抛出异常提示
		if (!finService.isInDay(payVoucherList.get(0))) {
			throw new FinIsinDayException("当前时间不在财政【"
					+ payVoucherList.get(0).getAdmdiv_code() + "】日始日终时间之内！");
		}

		// 获取主单单据类型ID
		long billTypeId = Parameters
				.getLongParameter(PayConstant.BILL_TYPE_PAY_VOUCHER);
		// 获取支付明细的单据类型ID
		final long detailBillTypeId = Parameters.getLongParameter(
				PayConstant.BILL_TYPE_PAY_REQUEST);
		
		List<PayRequest> requests = new ArrayList<PayRequest>();
		// 明细为空才加载明细
		if (ListUtils.isEmpty(payVoucherList.get(0).getDetails())) {
			// 主单ID数组
			long ids[] = BillUtils.getBillIds(payVoucherList);
			// 查询对应的明细信息
			requests = (List<PayRequest>) payCommonService
					.loadDetailsByBill(sc, billTypeId, ids, null);
			// 设置单据和明细的关联关系
			PbUtil.setBillDetails(payVoucherList, requests, "pay_voucher_id");
		}else{
			for(PayVoucher voucher : payVoucherList){
				requests.addAll((List)voucher.getDetails());
			}
		}

		updateAcceptPayVoucher(sc, payVoucherList, requests);
		
		//单独处理签章发送，遇到异常时，不要抛出去;没有影响支付，签章发送失败的话可以在柜面上再次发送

	    this.signAndSendPayVoucherByNoFlow(sc, payVoucherList, 1);
	
	}


	/**
	 * 用于支付成功使用，不调用银行核心接口
	 */
	@SuppressWarnings("unchecked")
	public void acceptCommonSignPayVoucherSucc(final Session sc,
			List<PayVoucher> payVoucherList, final int recordType, final boolean isTrans) {
		final TimeCalculator total = new TimeCalculator(log);
		total.start();
		total.middle("+++++++支付开始");
		// 如果没有需要登记的数据则直接返回
		if (ListUtils.isEmpty(payVoucherList)) {
			return;
		}
		// 判断当前时间是否在财政的日始日终时间之内，不是则抛出异常提示
		if (!finService.isInDay(payVoucherList.get(0))) {
			throw new FinIsinDayException( "当前时间不在财政【"
					+ payVoucherList.get(0).getAdmdiv_code() + "】日始日终时间之内！");
		}

		// 获取主单单据类型ID
		long billTypeId = Parameters
				.getLongParameter(PayConstant.BILL_TYPE_PAY_VOUCHER);
		// 获取支付明细的单据类型ID
		final long detailBillTypeId = Parameters.getLongParameter(
				PayConstant.BILL_TYPE_PAY_REQUEST);
		// 明细为空才加载明细
		if (ListUtils.isEmpty(payVoucherList.get(0).getDetails())) {
			// 主单ID数组
			long ids[] = BillUtils.getBillIds(payVoucherList);
			// 查询对应的明细信息
			List<PayRequest> requests = (List<PayRequest>) payCommonService
					.loadDetailsByBill(sc, billTypeId, ids, null);
			// 设置单据和明细的关联关系
			PbUtil.setBillDetails(payVoucherList, requests, "pay_voucher_id");
		}

		// 记录确认支付失败凭证号和出错信息
		StringBuffer vouCodeStr = new StringBuffer();
		final List<PayVoucher> list = new ArrayList<PayVoucher>();
		for (final PayVoucher payVoucher : payVoucherList) {
			try {
				
				smallTrans.newTransExecute(new ISmallTransService() {

					public void doExecute() throws Exception {
						//如果超出参数中的参数天数，则不能支付
						int  condrolDays =  PbParameters.getIntParameter("pb.trans.notTransDay", payVoucher.getAdmdiv_code());
						if(condrolDays < 0){
							throw new PbException("参数:pb.trans.notTransDay 配置不合法!");
						}else if(condrolDays > 0){
							int day = 0;
							try {
								day = DateTimeUtils.daysBetween(payVoucher.getVou_date(),DateTimeUtils.TransLogDateTime());
							} catch (ParseException e) {
								// TODO Auto-generated catch block
								e.printStackTrace();
							}
							if(day > condrolDays){
								throw new PbException("有凭证超过["+condrolDays+"]天未支付，请重新选择支付数据！");
							}
						}
						
						lockBillForTrans(sc, payVoucher, "business_type", 1, payVoucher.getBusiness_type());
						
						// 获取该凭证的明细列表
						List<Billable> detailList = payVoucher.getDetails();
						List<PayRequest> reqList = new ArrayList<PayRequest>();
						for (Billable bill : detailList) {
							reqList.add((PayRequest) bill);
						}
						
						//在请款时控制额度
//						// 授权支付进行额度控制
//						if (recordType != 0) {
//							total.middle("+++++++++++授权支付额度控制开始");
//							List<PayRequestSaveAction> actions = new ArrayList<PayRequestSaveAction>(
//									reqList.size());
//							for (PayRequest request : reqList) {
//								request.setBill_type_id(detailBillTypeId);
//								actions.add(new PayRequestSaveAction(request));
//							}
//							// 如果是授权支付才进行额度控制
//							// 1记账 2强制记账
//							if (recordType == 1) {
//								balanceService.payRequestEntrance(sc, actions,
//										false);
//							} else if (recordType == 2) {
//								balanceService.payRequestEntrance(sc, actions,
//										true);
//							}
//							total.middle("+++++++++++授权支付额度控制耗时：");
//						}

						TimeCalculator tc = new TimeCalculator(log);
						tc.start();
						tc.middle("+++++++++++++走工作流开始");
						list.removeAll(list);
						list.add(payVoucher);
						if (!(payVoucher.getTask_id() > 0)) {
							// 调用工作流录入
							workflow.createProcessInstance(sc,
									"PB_PAY_VOUCHER", list, false);
						}

						// 完成送审操作
						workflow.signalProcessInstance(sc, list,
								PayConstant.WORK_FLOW_NEXT, "转账");
						tc.middle("+++++++++++++走工作流耗时:");

						// 调用银行核心接口实现支付
						total.middle("+++++++++++调用银行核心系统转账开始");
						String cashCode = ElementUtil.getEleValue( PbParaConstant.CASH, "现金",payVoucher.getAdmdiv_code());
						if (StringUtil.isEmpty(cashCode)) {
							throw new CommonException("没有配置【现金】资金结算拨付方式！  请先配置！");
						}
						if (cashCode.equals( payVoucher.getSet_mode_code())&&payVoucher.getPay_amount().signum()==1 ) {
							// TODO 是否有垫支户到零余额的接口
							// 垫支户为空
							BankAccount bankAccount = BankAccountValueSetUtil
											.getAdvanceAccount(payVoucher, sc);
							payVoucher.setAdvance_account_bank(bankAccount.getBank_name());
							payVoucher.setAdvance_account_no(bankAccount.getAccount_no());
							payVoucher.setAdvance_account_name(bankAccount.getAccount_name());
							payVoucher.setTrade_type(TradeConstant.ADVANCE2PAY);
							for(PayRequest tempRequset :reqList){
								tempRequset.setAdvance_account_bank(bankAccount.getBank_name());
								tempRequset.setAdvance_account_no(bankAccount.getAccount_no());
								tempRequset.setAdvance_account_name(bankAccount.getAccount_name());
							}
						}else if(cashCode.equals( payVoucher.getSet_mode_code())){                   //现金退款
							payVoucher.setTrade_type(TradeConstant.PAY2ADVANCE_REFUND);
						}else if( payVoucher.getTrade_type() == 0 ){
							// 设置类型为零余额到收款人
							payVoucher.setTrade_type(payVoucher.getPay_amount()
									.signum() == 1 ? TradeConstant.PAY2PAYEE
									: TradeConstant.PAY2ADVANCE_REFUND);
//							payVoucher.setXPayAmt(payVoucher.getPay_amount());
						}
						log.info("凭证号：" + payVoucher.getPay_voucher_code());
						TransReturnDTO transResult = null;
						transResult = transService.manTrans(sc,payVoucher);
						// 给支付明细交易流水赋值
						PbUtil.batchSetValue(reqList, "agent_business_no",
								payVoucher.getAgent_business_no());

						total.middle("+++++++++++调用银行核心系统转账耗时：");
						// 交易成功
						if (transResult != null
								&& transResult.getResStatus() == 0) {
							List<PayVoucher> vouList = new ArrayList<PayVoucher>();
							vouList.add(payVoucher);
							// 更新单和明细等信息并走工作流，发送回单
							updateAcceptPayVoucher(sc, vouList, reqList);
						} else {
							throw new PbTransBusinessException(transResult
									.getResMsg());
						}
					
					}
				});
			}
			catch (PbTransSucceedException e1) {
				log.error(e1.getMessage());
			} catch (SocketTimeoutException e) {
				log.error(e.getMessage());
				vouCodeStr.append(e.getMessage());
			} catch (Exception e) {
				e.printStackTrace();
				log.error("支付失败：原因："+e.getMessage());
				//更新该凭证的交易返回结果
				updateTradeResMsg(sc,payVoucher);
				//不要加上"\n"否则在js中捕获异常信息出错  var msg = (new Function("return " + response.responseText))();
				//vouCodeStr.append("【"+payVoucher.getCode()+"】:"+e.getMessage()+"\n");
				vouCodeStr.append("【"+payVoucher.getCode()+"】:"+e.getMessage());
			}
		}
		if (vouCodeStr.length() != 0) {
			throw new CommonException("", vouCodeStr.toString());

		}
		log.debug("支付完成");
		total.stop();
	}
	
	public static String getTipsTraNo(Session sc) {
		String pb_tips_tra_no = "SEQ_PB_TIPS_TRA_NO";
		PbIdGen.genSeqIfNotExists(sc, pb_tips_tra_no, 00000000, 99999999, 1, true);
		String traNo = PbIdGen.genStrId(pb_tips_tra_no);
		return StringUtil.leftPadCut(traNo, 8, '0');
	}

	/**
	 * 转发凭证，将授权支付凭证
	 * @param sc
	 * @param payVoucherList
	 */
	public void sendFullSignsForwardPayVoucher(Session sc,List<PayVoucher> payVoucherList,final String decOrgType,boolean isFlow){
		// 从页面上操作转发按钮时，明细为空，需要加载一下明细
		if (ListUtils.isEmpty(payVoucherList.get(0).getDetails())) {
			// 主单ID数组
			long ids[] = BillUtils.getBillIds(payVoucherList);
			// 支付凭证单据类型
			long billTypeId = Parameters
					.getLongParameter(BILL_TYPE_PAY_VOUCHER);
			// 明细列表
			List<PayRequest> requestList = (List<PayRequest>) payCommonService
					.loadDetailsByBill(sc, billTypeId, ids, null);
			// 将明细设置到对应的凭证中
			PbUtil.setBillDetails(payVoucherList, requestList, "pay_voucher_id");
		}
		/* 完成送审操作*/
		//获得本地路由
		final String srcOrgType = PbParameters.getStringParameter(PayConstant.ORI_ORG_TYPE);
		//操作凭证库
		final AsspOperator asspOperator = new AsspOperatorAdapter();
		
		StringBuffer errorBuffer = new StringBuffer();
		
		String errorMessage = "";
		
		for( PayVoucher payVoucher : payVoucherList ){
			
			final PayVoucher p = payVoucher;
			//拼装报文
			final XmlAssembleHandler assembleHandler = new XmlAssembleHandler();
			
			try {
				String msg = assembleHandler.getVoucherXml(sc, p, (String)PlatformUtils.getProperty(p, "admdiv_code")+"_"+(String)PlatformUtils.getProperty(p, "vt_code"));
				String fsMsg ="0"+msg;
				
				final byte[] requestMessage = Base64.encode(fsMsg.getBytes("GBK"));
				
				final Session session = sc;
				
				smallTrans.newTransExecute(new ISmallTransService() {
					public void doExecute() throws Exception {
						/**
						 *** 省行转发市行  调用绿色通道
						 */
						byte[] rv = asspOperator.requestData(p.getAdmdiv_code(), srcOrgType, decOrgType, requestMessage);
						
						if(rv==null){
							throw new Exception("同步绿色通道未返回回执结果!");
						}
						
						String rvv = new String(rv,"GBK").substring(4);
						
						if(rv != null && new String(rv,"GBK").substring(0, 4).equals("9999")){
							
							throw new Exception(rvv+"");
						}
						//设置为转发状态
						p.setForward_flag(1);
						List<String> updateFields = new ArrayList<String>(2);
						updateFields.add("last_ver");
						updateFields.add("forward_flag");
						List<PayVoucher> payList = new ArrayList<PayVoucher>();
						payList.add(p);
						billEngine.updateBill(session, updateFields, payList, false);
						
					}
				});
			} catch (Exception e) {
				errorMessage = e.getMessage();
				this.log.error("转发失败",e);
				errorBuffer.append( p.getPay_voucher_code() + "," );
			}
		}

		// 如果没有异常信息则直接返回
		if (StringUtil.isEmpty(errorBuffer.toString())) {
			return;
		}
		errorBuffer.deleteCharAt(errorBuffer.length() - 1);
		throw new RuntimeException("凭证号为" + errorBuffer + "发送失败,失败原因"
				+ errorMessage);

	}
	
	/**
	 * 根据支付凭证加载明细并，并更新task_id及last_ver
	 * @param sc
	 * @param payVoucherList
	 * @param isFlow
	 */
	private void setPayVoucherDtail( Session sc, List<PayVoucher> payVoucherList,boolean isFlow){
		
		//判断凭证的pay_voucher_id是否为0，为0去加载并赋值
		if(payVoucherList.get(0).getPay_voucher_id()==0){
			//给凭证库下载过来的凭证主单的pay_voucher_id,last_ver赋值
			setIdByVoucher(payVoucherList);
		}
		// 主单ID数组
		long ids[] = BillUtils.getBillIds(payVoucherList);
		
		// 支付凭证单据类型
		long billTypeId = Parameters.getLongParameter(PayConstant.BILL_TYPE_PAY_VOUCHER);
		// 明细列表
		List<PayRequest> requestList = new ArrayList<PayRequest>();
		//青岛发过来的退款,需要保存的凭证,此时已关联了明细
		if(payVoucherList.get(0).getPay_amount().signum() == -1){
			for(PayVoucher p : payVoucherList){
				for( Billable bill : p.getDetails()){
					requestList.add((PayRequest) bill);
				}
			}
		}else{
			requestList = (List<PayRequest>) payCommonService
					.loadDetailsByBill(sc, billTypeId, ids, null);
		}
		// 将明细设置到对应的凭证中
		PbUtil.setBillDetails(payVoucherList, requestList, "pay_voucher_id");
		//走工作流录入，到划款单生成的节点，流转线需要添加条件forward_flag==1
		if(isFlow){
			PbUtil.batchSetValue(requestList, "forward_flag", 1);
			//530 版本签章发送不走工作流
			//workflow.createProcessInstance(sc,"PB_PAY_VOUCHER", payVoucherList, false);
			for(PayVoucher voucher : payVoucherList){
//				voucher.setTask_id(voucher.getDetail().get(0).getTask_id());
				voucher.setBusiness_type(1);
				voucher.setSend_flag(1);
			}
			//更新task_id,last_ver字段
			List<String> updateFields = new ArrayList<String>(2);
			updateFields.add("task_id");
			updateFields.add("last_ver");
			updateFields.add("business_type");
			updateFields.add("send_flag");
			billEngine.updateBill(sc, updateFields, payVoucherList, false);
			billEngine.updateBill(sc, updateFields, requestList, false);
		}
	}
	
	
	@Override
	public void setPayVoucherAndDetail(Session sc,
			List<PayVoucher> payVoucherList) {
		//判断凭证的pay_voucher_id是否为0，为0去加载并赋值
		if(payVoucherList.get(0).getPay_voucher_id()==0){
			//给凭证库下载过来的凭证主单的pay_voucher_id,last_ver赋值
			setIdByVoucher(payVoucherList);
		}
		// 主单ID数组
		long ids[] = BillUtils.getBillIds(payVoucherList);
		
		// 支付凭证单据类型
		long billTypeId = Parameters.getLongParameter(PayConstant.BILL_TYPE_PAY_VOUCHER);
		// 明细列表
		List<PayRequest> requestList = (List<PayRequest>) payCommonService
				.loadDetailsByBill(sc, billTypeId, ids, null);
		// 将明细设置到对应的凭证中
		PbUtil.setBillDetails(payVoucherList, requestList, "pay_voucher_id");
		
		for(PayVoucher p :payVoucherList){
			for(Billable r : p.getDetails()){
				//报文里面的主单的明细
				PayRequest pq = (PayRequest)r;
				for(PayRequest pr : requestList){
					if(pq.getPay_request_code().equals(pr.getPay_request_code())){
						pr.setPay_amount(pq.getPay_amount());
					}
				}
			}
		}
		List<String> updateFields = new ArrayList<String>(2);
		updateFields.add("pay_amount");
		billEngine.updateBill(sc, updateFields, payVoucherList, false);
		billEngine.updateBill(sc, updateFields, requestList, false);
	}
	
	/**
	 * 根据pay_voucher_code分别给payvoucher赋值Pay_voucer_id
	 * @param list
	 */
	private void setIdByVoucher(List<PayVoucher> list){
		In in = new In(new Field("pay_voucher_code"));
		for(PayVoucher p :list){
			in.addValue(p.getPay_voucher_code());
		}
		Select select = new Select().from(new Table("pb_pay_voucher"));
		
		Where where = new Where().addLogic(in);
		where.add(new Eq("and",null,"admdiv_code", "'" + list.get(0).getAdmdiv_code() + "'"));
		select.where(where);
		
		
		List<PayVoucher> payList = daoSupport.query(SqlGenerator.generateSql(select), PayVoucher.class);
		for(PayVoucher voucher : list){
			for(int i=0;i<payList.size();i++){
				if(voucher.getPay_voucher_code().equals(payList.get(i).getPay_voucher_code())){
					voucher.setPay_voucher_id(payList.get(i).getPay_voucher_id());
					voucher.setLast_ver(payList.get(i).getLast_ver());
					voucher.setPay_amount(list.get(0).getPay_amount());
				}
			}
		}
		
		
	}
	
	/****
	 * 这个最好写成公用的方法，回头整理wwj
	 * 生成交易流水ID yyMMdd-凭证类型-7位序列
	 * @param vtCode 凭证类型
	 * @return
	 */
	String seqReq(String vtCode) {
		// 流水ID
		StringBuffer flowIdSb = new StringBuffer();
		flowIdSb.append(PbUtil.getCurrDate("yyMMdd")).append("-");
		flowIdSb.append(vtCode).append("-");
		String id = IdGen.genStrId("SEQ_TRANS_FLOW_ID");
		if( id.length()>7 ){
			id = id.substring(id.length()-7);
		}else{
			id = ChangeUtil.getFixlenStr(id, 7);
		}
		flowIdSb.append(id);
		return flowIdSb.toString();
	}
	
	@Override
	public void delRefundVouchers(Session sc, long[] ids) {
		long billTypeId = Parameters.getLongParameter(PayConstant.BILL_TYPE_REFUND_SERIAL);
		List<RefundSerial> payCols = (List<RefundSerial>) billEngine
				.loadBillByIds(sc, billTypeId, NumberUtil.toObjectList(ids));
		for (RefundSerial payCollection : payCols) {
			BillType billType = BillTypes.getInstance().getBillTypeById(billTypeId);
			payCollection.setBiz_type_id(billType.getBizTypes().get(0).getBizTypeId());
			payCollection.setBill_type_id(billTypeId);
		}
		try {
			billEngine.deleteBill(sc, payCols);
		} catch (BillTypeNotFoundException e) {
			log.error("", e);
			throw new PbException("自助柜面退款流水删除异常：" + e.getMessage());
		}

	}
	


	@Override
	public void addRefundVoucher(Session sc, RefundSerial refund)
			throws Exception {
		if (refund == null) {
			return;
		}
		long billTypeId = Parameters.getLongParameter(PayConstant.BILL_TYPE_REFUND_SERIAL);
		BillType billType = BillTypes.getInstance().getBillTypeById(billTypeId);
		refund.setBiz_type_id(billType.getBizTypes().get(0).getBizTypeId());
		refund.setBill_type_id(billTypeId);
		try {
			billEngine.saveBill(sc, refund);
		} catch (Exception e) {
			log.error("自助柜面退款流水保存异常", e);
			throw new PbException("自助柜面退款流水保存异常：" + e.getMessage());
		}
	}

	@Override
	public RefundSerial getRefundVoucherByTransserialid(long transserialid) {
		String sql = "select * from PB_TRANS_SERIAL where trans_serial_id = ?";
		return daoSupport.queryForObject(sql, new Object[] { transserialid },
				RefundSerial.class);
	}

	@Override
	public void editRefundVoucher(Session sc, final RefundSerial refund)
			throws PbException {
		if (refund == null) {
			return;
		}
		long billTypeId = Parameters.getLongParameter(PayConstant.BILL_TYPE_REFUND_SERIAL);
		BillType billType = BillTypes.getInstance().getBillTypeById(billTypeId);
		refund.setBiz_type_id(billType.getBizTypes().get(0).getBizTypeId());
		refund.setBill_type_id(billTypeId);
		List<RefundSerial> refundSerialList = new ArrayList<RefundSerial>();
		List<String> updateFields = new ArrayList<String>();
		updateFields.add("trans_serial_no");
		updateFields.add("payee_account_no");
		updateFields.add("payee_account_bank");
		updateFields.add("payee_account_name");
		updateFields.add("pay_account_no");
		updateFields.add("pay_account_name");
		updateFields.add("income_amount");
		updateFields.add("trans_date");
		updateFields.add("refund_remark");
		updateFields.add("pay_summary_name");
		updateFields.add("remark");
		updateFields.add("ori_pay_voucher_code");
		updateFields.add("is_match");
		updateFields.add("refund_status");
		updateFields.add("account_balance");
		refundSerialList.add(refund);
		billEngine.updateBill(sc, updateFields, refundSerialList, false);
	}

	/**
	 * 重新发送凭证信息,除划款单外的凭证可以使用
	 * 逻辑为：先作废，在签章并发送
	 * @param sc
	 * @param billTypeId
	 * @param ids
	 */
	public void sendAsspVoucherAgain(final Session sc, long billTypeId, long[] ids ) {
		// 主单集合，包含明细
		List<Billable> billList = (List<Billable>) payCommonService
				.loadBillsWithDetails(sc,
				billTypeId, ids);
		//单号
		String voucherNos[] = PbUtil.getBillNos(billList);
		String admDivCode = (String)PlatformUtils.getProperty(billList.get(0), "admdiv_code");
		String vtCode = (String)PlatformUtils.getProperty(billList.get(0), "vt_code");
		int year = billList.get(0).getYear();
		try{
			
			//先更新本地数据库
			List<String> updateFields = new ArrayList<String>();
			updateFields.add("voucher_query_flag");
			PbUtil.batchSetValue(billList, "voucher_query_flag", 0);
			billEngine.updateBill(sc, updateFields, billList, false);
			
			AsspOperator asspOperator = new AsspOperatorAdapter();
			//调用作废
			asspOperator.asspDiscardVoucher(admDivCode, vtCode, voucherNos, year);
			
			String mof_org_type = PbParameters.getParameterValue(PayConstant.DEST_MOF_ORG_TYPE);
			
			//调用签章发送
			baseBizService.signAndSend2EVoucher(sc, mof_org_type , 1 , billList);
			
		}catch( Exception e ){
			//打印日志
			log.info(e);
			throw new PbException("作废凭证失败," + e.getMessage(), e);
		}
	}

	/**
	 * 冲销凭证(现金)
	 * 
	 * @param session
	 * @param vList
	 */
	public String writeoffVoucherCash(Session sc, List<PayVoucher> payVoucherList)
			throws Exception {
		// 获取主单单据类型ID
		long billTypeId = Parameters
				.getLongParameter(BILL_TYPE_PAY_VOUCHER);
		if (ListUtils.isEmpty(payVoucherList.get(0).getDetails())) {
			// 主单ID数组
			long ids[] = BillUtils.getBillIds(payVoucherList);
			// 查询对应的明细信息
			List<PayRequest> requests = (List<PayRequest>) payCommonService
					.loadDetailsByBill(sc, billTypeId, ids, null);
			// 设置单据和明细的关联关系
			PbUtil.setBillDetails(payVoucherList, requests, "pay_voucher_id");
		}
		if(!payVoucherList.get(0).getSet_mode_code().equals(ElementUtil.getEleValue(PbParaConstant.CASH, "现金",payVoucherList.get(0).getAdmdiv_code()))){
			//验证凭证是否已经发送
			for(PayVoucher tempVoucher:payVoucherList){
				if (tempVoucher.getSend_flag()==1) {
					throw new PbException("凭证："
							+ tempVoucher.getCode()
					+ "已回单，无法冲销！");
				}
			}
		}
		StringBuffer excetionMsg = null;

		// 重新生成batchno,重新生成一个Payvoucher ,付款人是零余额，收款人事垫支户,金额不变，
		List<PayVoucher> tranpayVoucherList = new ArrayList();
		for (PayVoucher payVoucher : payVoucherList) {
			PayVoucher payvoucher1 = payVoucher;
			// 交易使用
			payvoucher1.setPay_voucher_code(payVoucher.getPay_voucher_code());
			payvoucher1.setPay_account_no(payVoucher.getPay_account_no());
			payvoucher1.setPay_account_name(payVoucher.getPay_account_name());
			payvoucher1.setPay_account_bank(payVoucher.getPay_account_bank());

			payvoucher1.setPayee_account_no(payVoucher.getAdvance_account_no());
			payvoucher1.setPayee_account_name(payVoucher
					.getAdvance_account_name());
			payvoucher1.setPayee_account_bank(payVoucher
					.getAdvance_account_bank());
			payvoucher1.setPayee_account_bank_no("");
			payvoucher1.setPay_amount(payVoucher.getPay_amount());

			// 冲销凭证更新使用
			payvoucher1.setPay_voucher_id(payVoucher.getPay_voucher_id());
			payvoucher1.setBatch_no(payVoucher.getBatch_no());
			payvoucher1.setAdmdiv_code(payVoucher.getAdmdiv_code());
			tranpayVoucherList.add(payvoucher1);
		}
		final List<PayVoucher> list = new ArrayList<PayVoucher>();
		for (PayVoucher payVoucher : tranpayVoucherList) {
			try {
				final Session session = sc;
				final PayVoucher batchPayVoucher = payVoucher;
				
				this.smallTrans.newTransExecute(new ISmallTransService() {

					public void doExecute() throws Exception {
						
						lockBillForTrans(session, batchPayVoucher, "batchreq_status", 0, batchPayVoucher.getBatchreq_status());
						
						List<Billable> detailList = batchPayVoucher.getDetails();
						List<PayRequest> reqList = new ArrayList<PayRequest>();
						for (Billable bill : detailList) {
							//设置金额为负数，用来恢复额度
							bill.setAmount(bill.getAmount().negate());
							reqList.add((PayRequest) bill);
						}
						//进行额度控制，即恢复额度
						String directPay = PbParameters.getStringParameter(PbParaConstant.DIRECTPAY_PAY_TYPE_CODE,
								batchPayVoucher.getAdmdiv_code());
						if(!batchPayVoucher.getPay_type_code().startsWith(directPay)){
							balanceService.payRequestsEntrance(session, reqList , false);
						}
						
//						TimeCalculator tc = new TimeCalculator(log);
//						tc.start();
//						tc.middle("+++++++++++++走工作流开始");
//						list.removeAll(list);
//						list.add(batchPayVoucher);
//						// 完成撤销操作
//						workflow.signalProcessInstance(session, list,
//								WORK_FLOW_UNDO, "撤销");
//						// 完成作废操作
//						workflow.signalProcessInstance(session, list,
//								WORK_FLOW_DISCARD, "作废");
//						tc.middle("+++++++++++++走工作流耗时:");
						batchPayVoucher
						.setTrade_type(TradeConstant.PAY2PAYEE);
						TransReturnDTO transResult = transService.queryTrans(
								session, batchPayVoucher);
						if (transResult != null
								&& transResult.getResStatus() == 0) {
							throw new PbException(batchPayVoucher
									.getPay_voucher_code()
									+ ",");
						}
						batchPayVoucher
								.setTrade_type(TradeConstant.PAY2ADVANCE_WRITEOFF);
						saveWriteoffVoucher(batchPayVoucher);
						clearBatchNo(batchPayVoucher);
	                    List<PayVoucher> tempList = new ArrayList<PayVoucher>();
                        tempList.add(batchPayVoucher);
                        //保存冲销日志
                        logService.saveTaskLogInfo(session, tempList, "冲销凭证(现金)");
						transResult = transService.payTrans(
								session, batchPayVoucher);
						if (transResult == null
								|| transResult.getResStatus() != 0) {
							throw new PbException( batchPayVoucher
									.getPay_voucher_code()
									+ ",");
						}
					}
				});
			} catch (Exception e) {
				log.error(e.getMessage(), e);
				if (excetionMsg == null) {
					excetionMsg = new StringBuffer();
				}
				excetionMsg.append(e.getMessage() + ",");
			}
		}
		return excetionMsg != null ? "存在冲销失败的凭证，凭证号为："
				+ excetionMsg.substring(0, excetionMsg.length() - 1).toString()
				: null;
	}
	/**
	 * 现金退回财政不走财政
	 */
	@Override
	public void returnSignPayVoucherForCash(Session sc,
			List<PayVoucher> payVoucherList, String returnRes) {
		// 主单ID数组
			long ids[] = BillUtils.getBillIds(payVoucherList);
			// 支付凭证单据类型
			long billTypeId = Parameters
						.getLongParameter(PayConstant.BILL_TYPE_PAY_VOUCHER);
			// 明细列表
			List<PayRequest> requestList = (List<PayRequest>) payCommonService
						.loadDetailsByBill(sc, billTypeId, ids, null);
			// 将明细设置到对应的凭证中
			PbUtil.setBillDetails(payVoucherList, requestList, "pay_voucher_id");

//				// 调用工作流录入，复审岗退票，不需录入工作流
//				if (!(requestList.get(0).getTask_id() > 0)) {
//					workflow.createProcessInstance(sc, "PB_PAY_REQUEST", requestList,
//							false);
//				}
//				// 完成退回操作
//				workflow.signalProcessInstance(sc, requestList, WORK_FLOW_DISCARD,
//						"凭证退票");

				// 将明细单中task_id设置到主单
//				for (PayVoucher voucher : payVoucherList) {
//					voucher.setTask_id(voucher.getDetails().get(0).getTask_id());
//				}

				// 设置业务类型 ： 2 已退票
				PbUtil.batchSetValue(payVoucherList, "business_type",
						PayConstant.HASBACK_CONFIRMED);
				if ("1"
						.equals(PbParameters
								.getStringParameter( PbParaConstant.RETRUN_VOUCER_MODEL, payVoucherList.get(0).getAdmdiv_code()  ))) {
					// 设置voucherFlag为退回
					PbUtil.batchSetValue(payVoucherList, "voucherFlag",
							XmlConstant.VOUCHERFLAG_VALUE_BACK);
				} else if ("0".equals(PbParameters
						.getStringParameter( PbParaConstant.RETRUN_VOUCER_MODEL, payVoucherList.get(0).getAdmdiv_code()  ))
						|| "2".equals(PbParameters
								.getStringParameter( PbParaConstant.RETRUN_VOUCER_MODEL, payVoucherList.get(0).getAdmdiv_code() ))) {
					PbUtil.batchSetValue(payVoucherList, "voucherFlag",
							XmlConstant.VOUCHERFLAG_VALUE_RETURN);
					PbUtil.batchSetValue(payVoucherList, "pay_amount",
							NumberUtil.BIG_DECIMAL_ZERO);
					PbUtil.batchSetValue(requestList, "pay_amount",
							NumberUtil.BIG_DECIMAL_ZERO);
				}
				// 设置退票原因
				PbUtil.batchSetValue(payVoucherList, "return_reason", returnRes);

				List<String> updateFields = new ArrayList<String>();
				updateFields.add("task_id");
				updateFields.add("business_type");
				updateFields.add("voucherFlag");
				updateFields.add("last_ver");
				updateFields.add("return_reason");

				// 更新主单字段
				billEngine.updateBill(sc, updateFields, payVoucherList, false);

				updateFields.remove("business_type");
				updateFields.remove("voucherFlag");
				updateFields.remove("return_reason");
				// 更新明细单task_id
				billEngine.updateBill(sc, updateFields, requestList, false);
				
				try {
					String returnMode = PbParameters.getStringParameter(PbParaConstant.RETRUN_VOUCER_MODEL, payVoucherList.get(0).getAdmdiv_code() );
					//如果没配置或者配置为空则调用退回接口
					if ( StringUtil.isEmpty( returnMode )|| "1".equals( returnMode )) {
						// 退票原因数组
						String errMsg[] = new String[ids.length];
						for (int i = 0; i < payVoucherList.size(); i++) {
							errMsg[i] = returnRes;
						}
						baseBizService.returnback2EVoucher(sc, payVoucherList, errMsg);
					} else if ("0".equals(returnMode)) { //如果
						String decOrgType = PbParameters
								.getStringParameter(PayConstant.DEST_MOF_ORG_TYPE);
						baseBizService.signAndSend4EVoucher(sc, decOrgType,
								XmlConstant.VOUCHERFLAG_VALUE_RETURN, payVoucherList);
					} else if ("2".equals(returnMode)) {//走签章发送模式
						String decOrgType = PbParameters
								.getStringParameter(PayConstant.DEST_MOF_ORG_TYPE);
						baseBizService.signAndSend2EVoucher(sc, decOrgType,
								XmlConstant.VOUCHERFLAG_VALUE_RETURN,
								payVoucherList);
					}

				} catch (Exception e) {
					throw new PbException(e);
				}
	}
	/**
	 * 授权支付额度控制(只控制在请款和现金)
	 * @param payVoucher
	 * @author ruanzx
	 * @date 20141208
	 */
	public static final String payAmtQuerySQL = "select sum(ed - pay_money + (return_money * -1)) pay_amount  from " +
			"(select decode(sum(plan_amount), null, 0, sum(plan_amount)) ed,0 pay_money,0 return_money from " +
			"pb_plan_detail d where year = #year# and plan_month <= to_number(to_char(sysdate, 'mm')) and agency_code " +
			"= #agency_code# and fund_type_code = #fund_type_code# and exp_func_code = #exp_func_code# and " +
			"(select n.bgt_type_code from pb_plan_agent_note n where n.plan_agent_note_id = d.plan_agent_note_id) = substr(#bgt_type_code#,0,1) union select 0 ed, " +
			"decode(sum(pay_amount), null, 0, sum(pay_amount)) pay_money, 0 return_money from pb_pay_voucher " +
			"where year = #year# and pay_amount > 0 and agency_code = #agency_code# and fund_type_code = " +
			"#fund_type_code# and exp_func_code = #exp_func_code# and bgt_type_code = #bgt_type_code# and " +
			"pay_type_code = #pay_type_code# and ((batchreq_status = 1 and business_type = 0) or (pay_date is not null)) union all select 0 ed, 0 pay_money, " +
			"decode(sum(pay_amount), null, 0, sum(pay_amount)) return_money from pb_pay_voucher where exists " +
			"(select 1 from pb_pay_request pr where pay_voucher_id = pr.pay_voucher_id and pr.clear_date is not null) " +
			"and refund_type in (1, 2) and year = #year# and pay_amount < 0 and agency_code = #agency_code# and " +
			"fund_type_code = #fund_type_code# and exp_func_code = #exp_func_code# and bgt_type_code = " +
			"#bgt_type_code# and pay_type_code = #pay_type_code#)";

	/**
	 * 对日报统一赋值
	 * @param pbList
	 * @return
	 */
	public List<PayDaily> getPayDailyList(List<PayDaily> pdList,String vtCode){
		List<ElementDTO> elementDTOList = StaticApplication.getMasterDataService().loadAllEleValues( "PAY_BANK",pdList.get(0).getAdmdiv_code());
		ElementDTO eledto = null;
		int count = 0;
		for (ElementDTO elementDTO : elementDTOList) {
			if (elementDTO.getLevel_num() == 1) {
				eledto = elementDTO;
				count++;
			}
		}
		if (eledto == null) {
			throw new PbException("未找到level_num为1 的基础要素PAY_BANK");
		}
//		if ( count > 1) {
//			throw new PbException("基础要素PAY_BANK只配置一个即可");
//		}
		//对循环赋值
		for (PayDaily dto : pdList) {
			dto.setVt_code(vtCode);
			dto.setVou_date(new SimpleDateFormat("yyyyMMdd").format(new Date()));
			dto.setPay_bank_code(eledto.getCode()); //code
			dto.setPay_bank_id(eledto.getId());//id
			dto.setPay_bank_name(eledto.getName());//name
			dto.setPay_account_bank(eledto.getName());
			dto.setPay_account_code(eledto.getCode());
		}
		return pdList;
	}
	
	/***
	 * 人工质疑的授权支付凭证
	 */
	public void checkResultVoucher(Session sc,String voucherNo,String admdivCode,int result,String remark) throws Exception{
		
		ConditionObj obj = new ConditionObj();
		
		obj.and("pay_voucher_code", obj.EQUAL, voucherNo , null);
		obj.and("admdiv_code", obj.EQUAL,  admdivCode , null);
		obj.and("vt_code", obj.EQUAL, VtConstant.ACCREDIT_VT_CODE, null);
		
		List<PayVoucher> vouList = this.loadPayVoucherByObj(sc, obj);
		
		if(vouList.size()!=1){
			String errMsg = "查询人工质疑凭证异常,加载人工质疑数据为 "+vouList.size()+"条";
			log.info(errMsg);
			throw new Exception("errMsg");
		}
		
		PbUtil.batchSetValue(vouList, "fin_feedback_status",result);
		PbUtil.batchSetValue(vouList, "remark",remark);
		
		List<String> updateFields = new ArrayList<String>();
		updateFields.add("fin_feedback_status");
		updateFields.add("remark");
		updateFields.add("is_valid");
		
		if(result == 1){
			updateField(sc,vouList.get(0),updateFields);
		}else if(result == 0){
			PbUtil.batchSetValue(vouList, "is_valid",0);
			updateField(sc,vouList.get(0),updateFields);
		}
		log.info("人工质疑凭证号："+voucherNo+"处理成功");
				
	}
	
    /**
     * 删除退款录入的退款申请（厦门）
     */
	@Override
	public void deleteRefundVouchers(Session sc, List<PayVoucher> payVoucherList) {
		
		// 没有需要删除的单据
		if (ListUtils.isEmpty(payVoucherList)) {
			return;
		}
		try {
			List<PayRequest> reqList = new ArrayList<PayRequest>();

			// 主单ID数组
			long ids[] = BillUtils.getBillIds(payVoucherList);
			long billTypeId = Parameters.getLongParameter(
					BILL_TYPE_PAY_VOUCHER);

			List<PayRequest> requestList = (List<PayRequest>) payCommonService
					.loadDetailsByBill(sc, billTypeId, ids, null);
			// 将明细设置到对应的凭证中
			PbUtil.setBillDetails(payVoucherList, requestList, "pay_voucher_id");

			long detailTypeId = Parameters.getLongParameter(BILL_TYPE_PAY_REQUEST);

			int lenth = requestList.size();
			long[] ori_Req_ids = new long[lenth];
			for (int i = 0; i < lenth; i++) {
				PayRequest req = requestList.get(i);
				ori_Req_ids[i] = req.getOri_request_id();
			}
			// 查询原有的支付申请
			List<PayRequest> ori_Reqs = (List<PayRequest>) billEngine
					.loadBillByIds(sc, detailTypeId, NumberUtil
							.toObjectList(ori_Req_ids));
			//根据原有支付明细查询原主单信息
			PayVoucher ori_voucher = (PayVoucher) billEngine.loadBillById(sc,
					billTypeId, ori_Reqs.get(0).getPay_voucher_id());
			// 建立索引
			Map<Long, PayRequest> oriReqIndex = new HashMap<Long, PayRequest>();
			for (PayRequest req : ori_Reqs) {
				oriReqIndex.put(req.getPay_request_id(), req);
			}
			//记录所有要删除明细的金额的累加值，用于对原主单已退金额进行回退更新
	        BigDecimal totalAmount = BigDecimal.ZERO;
			// 根据录入的退款申请，进行逐一退款
			for (PayRequest refundReq : requestList) {
				totalAmount = totalAmount.add(refundReq.getPay_amount());
				PayRequest oriReq = oriReqIndex.get(refundReq.getOri_request_id()); // 获取原申请
				oriReq.setPay_refund_amount(oriReq.getPay_refund_amount().add(
						refundReq.getPay_amount())); // 修改原申请的退款金额为退款金额 - 要删除的退款申请金额
			}
			//原凭证主单已退金额更新
			ori_voucher.setPay_refund_amount(ori_voucher.getPay_refund_amount().add(totalAmount));
			//已退金额为0时，refund_type置为0
			if(ori_voucher.getPay_refund_amount().signum() == 0){
				ori_voucher.setRefund_type(0);
			}
			List<PayVoucher> ori_vouchers = new ArrayList<PayVoucher>();
			ori_vouchers.add(ori_voucher);
			
			List<String> updateFields = new ArrayList<String>();
			updateFields.add("last_ver");
			updateFields.add("pay_refund_amount");
			//更新原主单信息
			List<String> updateOriVoucherField = new ArrayList<String>();
			updateOriVoucherField.add("pay_refund_amount");
			updateOriVoucherField.add("refund_type");
			billEngine.updateBill(sc,updateOriVoucherField, ori_vouchers, false);
			billEngine.updateBill(sc, updateFields, ori_Reqs, false);
			billEngine.deleteBill(sc, payVoucherList);
			billEngine.deleteBill(sc, requestList);
		} catch (Exception e) {
			log.error(e.getMessage(), e);
			throw new RuntimeException("删除凭证失败 ,原因 :" + e.getMessage());
		}
	}
	
	/**
	 * 全部签章发送
	 * @param payVoucherList
	 * @return
	 */
	@Override
	public String signAndSendAllPayVoucher(final Session sc,List<PayVoucher> payVoucherList){
		TimeCalculator tc;
		MyThreadPoolExecutor transPool;
		final StringBuffer errorMsg = new StringBuffer();
		try {
			log.info("批量签章发送的总笔数为"+"------"+payVoucherList.size());
			if(ListUtils.isEmpty(payVoucherList)){
				throw new Exception("没有可以签章的数据");
			}
			//根据buniness_type,vt_code,pay_account_no进行分组
			Map<String,List<PayVoucher>> hashMap = new HashMap<String, List<PayVoucher>>();
			for(PayVoucher p:payVoucherList){
				String key = p.getBusiness_type()+p.getVt_code()+p.getPay_account_no();
				if(ListUtils.isEmpty(hashMap.get(key))){
					List<PayVoucher> tempList = new ArrayList<PayVoucher>();
					tempList.add(p);
					hashMap.put(key, tempList);
				}else{
					hashMap.get(key).add(p);
				}
			}
			//对一组超过20笔的进行再次分组
			Map<String,List<PayVoucher>> hashMap1 = new HashMap<String, List<PayVoucher>>();
			for(String s : hashMap.keySet()){
				List<PayVoucher> tmpList = new ArrayList<PayVoucher>();
				List<PayVoucher> tmpList2 = new ArrayList<PayVoucher>();
				tmpList = hashMap.get(s);
				PayVoucher p = tmpList.get(0);
				String key = p.getBusiness_type()+p.getVt_code()+p.getPay_account_no();
				int count = 0;
				//计算分多少组
				if(tmpList.size()>20){
					if(tmpList.size()%20>0){
						count = tmpList.size()/20+1;
					}else{
						count = tmpList.size()/20;
					}
					//最后一组
					int scount =count-2;
					int fromIndex = 0;
					int toIndex = 20 ;
					for(int i=0;i<count;i++){
						tmpList2 = tmpList.subList(fromIndex,toIndex);
						hashMap1.put(key+i, tmpList2);
						fromIndex = fromIndex+20;
						//判断最后一组的时候最后的索引变成余数的截取数量
						int acount = tmpList.size()%20;
						if(scount==i && acount>0){
							toIndex+=acount;
						}else{
							toIndex +=20;
						}
					}
				}else{
					hashMap1.put(key, tmpList);
				}
			}
			tc = new TimeCalculator(log);
			tc.start();
			transPool = new MyThreadPoolExecutor(4, 6, 0, TimeUnit.SECONDS,
					new LinkedBlockingQueue(),new ThreadPoolExecutor.DiscardOldestPolicy());
			for( final String list : hashMap1.keySet()){
				final List<PayVoucher> payList = hashMap1.get(list);
				transPool.execute(new Runnable() {
					public void run() {
						try {
							smallTrans.newTransExecute(new ISmallTransService() {
								public void doExecute() throws Exception {
									log.info("付款账号为"+payList.get(0).getPay_account_no()+"数量为"+payList.size()+"笔数据打成一个包批量签章发送");
									signAndSendPayVoucherByNoFlow(sc, payList, XmlConstant.VOUCHERFLAG_VALUE_RETURN);
								}
							});
						}catch(PbException e){
							e.printStackTrace();
							errorMsg.append("付款账号为"+payList.get(0).getPay_account_no()+"数量为"+payList.size()+"笔数据签章批量签章失败原因："+e.getMessage());
						} catch (Exception e) {
							e.printStackTrace();
							errorMsg.append("数据签章批量签章失败原因："+e.getMessage());
						}
					}
				});
			}
			transPool.lock();
			System.out.println("执行完了签章发送批量");
			tc.stop();
		} catch (Exception e) {
			e.printStackTrace();
		}
		return errorMsg.toString();
	}
	
	/**
	 * 公务卡消费明细推送
	 */
	@Override
	public void impCardConsumerInfo(String consumerDate)throws Exception {
		AutoImportOfficalCardConsumerJop importOfficalCard=new AutoImportOfficalCardConsumerJop();
		try {
			final Map<String, List<OfficalCardConsumerDetail>> consumerMap = importOfficalCard.
			parserConsumerFils(consumerDate);
			if(consumerMap.isEmpty()){
				throw new CommonException("当前日期"+consumerDate+"没有获取公务卡明细文件内容");
			}
			smallTrans.newTransExecute(new ISmallTransService() {
				@Override
				public void doExecute() throws Exception {
					// 保存消费信息
					List<OfficalCardConsumer> consumers = AutoImportOfficalCardConsumerJop
							.saveConsumers(consumerMap);
					if(ListUtils.isNotEmpty(consumers)){
						// 发送消费信息至财政
						AutoImportOfficalCardConsumerJop.consumerSendTofin(consumers);
					}
				}
			});
		} catch (Exception e) {
			e.printStackTrace();
			throw new CommonException("公务卡消费明细推送失败：" + e.getMessage());
		}
	}
	
	
	@Override
	public String transferAndVerifyForABC(final Session sc, List<PayVoucher> payList,
			PayVoucher sumPayVoucher) throws Exception {
		checkTransferVouchers(sc,payList);
		
		StringBuffer excetionMsg = new StringBuffer(100);

		// 获取主单ids
		int size = payList.size();
		long ids[] = new long[size];
		StringBuilder sb = new StringBuilder("支票号：["+sumPayVoucher.getCheckNo()+"] 所包含的凭证：[");
		for(int i =0;i<size;i++){
			PayVoucher payVoucher = payList.get(i);
			ids[i] =payVoucher.getPay_voucher_id();
			sb.append(payVoucher.getPay_voucher_code());
			if(i<size-1){
				sb.append(",");
			}else{
				sb.append("] ");
			}
		}
		final String vouchersInfo = sb.toString();
		// 获取主单单据类型ID
		long billTypeId = Parameters.getLongParameter(PayConstant.BILL_TYPE_PAY_VOUCHER);
		//查询对应的明细信息
		List<PayRequest> requests = (List<PayRequest>) payCommonService.loadDetailsByBill(sc, billTypeId, ids, null);
		//设置单据和明细的关联关系
		PbUtil.setBillDetails((List<PayVoucher>) payList, requests,"pay_voucher_id");
		StringBuffer errorMsg = new StringBuffer(100);
		final TimeCalculator total = new TimeCalculator(log);
		total.start();
		total.middle("+++++++转账核销开始");
		
		final List<String> billUpdateFileList4ABC = getBillUpdateFileList4ABC();
		final List<String> detailUpdateFileList =  getDetailUpdateFileList();
		//转账后是否签章发送
		int isSend = PbParameters.getIntParameter(PbParaConstant.IS_SEND_PAYVOUCHER);
		boolean sendabled = true;//是否可以签章发送
		
		sumPayVoucher.setVou_date(new SimpleDateFormat("yyyyMMdd").format(new Date()));
		final PayVoucher p = sumPayVoucher;
		final List<PayVoucher> pList = payList;
		final List<PayRequest> reqList = requests;
		try {
			smallTrans.newTransExecute(new ISmallTransService() {
				public void doExecute() throws Exception {
					// 设置类型为零余额到收款人
					p.setTrade_type(p.getPay_amount().signum() == 1 ? TradeConstant.PAY2PAYEE
									: TradeConstant.PAY2ADVANCE_REFUND);
					//先走工作流，再转账
					TimeCalculator tc = new TimeCalculator(log);
					tc.start();
					tc.middle("+++++++++++++走工作流开始");
					if (!(pList.get(0).getTask_id() > 0)) {
						// 调用工作流录入
						workflow.createProcessInstance(sc,"PB_PAY_VOUCHER", pList, false);
					}
					// 完成送审操作
					workflow.signalProcessInstance(sc, pList,PayConstant.WORK_FLOW_NEXT, "转账");
					//进行额度控制
					String directPay = PbParameters.getStringParameter(PbParaConstant.DIRECTPAY_PAY_TYPE_CODE, 
							p.getAdmdiv_code());
					if(p.getPay_amount().signum() == 1 && !p.getPay_type_code().startsWith(directPay)){
						balanceService.payRequestsEntrance(sc, reqList, false);
					}
					tc.middle("+++++++++++++走工作流耗时:");
					total.middle("+++++++++++调用银行核心系统转账开始");
					TransReturnDTO transResult = null;
					log.info(vouchersInfo+" 开始支付");
					transResult = transService.payTrans(sc, p);
					
					total.middle("+++++++++++调用银行核心系统转账耗时：");
					if (transResult != null && transResult.getResStatus() == 0) {
						Timestamp nowTime = DateTimeUtils.nowDatetime();
						for(PayVoucher v:pList){
							// 设置为已转账
							v.setBusiness_type(PayConstant.Has_CONFIRMED);
							v.setTrans_succ_flag(TradeConstant.TRANS_SUCC);
							v.setTrans_pay_status_des(TradeConstant.TRANS_STATUS_SUCCESS_DES);
							v.setVoucherFlag(XmlConstant.VOUCHERFLAG_VALUE_RETURN);
							v.setTrans_res_msg(TradeConstant.TRANS_STATUS_SUCCESS_DES);
							v.setAccthost_seqid(transResult.getBankTransId());
							// 更新支付凭证数据
							v.setPay_date(nowTime);
							v.setPayDate(PbUtil.getCurrDate());
							//设置流水号
							v.setTransId(p.getTransId());
						}
						billEngine.updateBill(sc, billUpdateFileList4ABC, pList,false);
						for (PayRequest temp : reqList) {
							temp.setPay_date(nowTime);
							temp.setAgent_business_no(p.getAgent_business_no());
							temp.setTrans_succ_flag(TradeConstant.TRANS_SUCC);
							temp.setTrans_pay_status_des(TradeConstant.TRANS_STATUS_SUCCESS_DES);
							temp.setTrans_res_msg(TradeConstant.TRANS_STATUS_SUCCESS_DES);
						}
						billEngine.updateBill(sc, detailUpdateFileList,reqList, false);
						tc.stop();
					} else {
						log.error("转账核销失败,核心返回消息：" + transResult.getResMsg());
						throw new PbTransException(transResult
								.getResMsg());
					}
				}
			});
		} catch (PbTransException e) {
			sendabled = false;
			log.error("转账核销失败",e);
			errorMsg.append(e.getMessage());
			for(PayVoucher v :payList){
				v.setBusiness_type(PayConstant.Fail_CONFIRMED);
				v.setReturn_reason(e.getMessage());
			}
			List<String> updateFileList = new ArrayList<String>();
			updateFileList.add("return_reason");
			updateFileList.add("agent_business_no");
			updateFileList.add("business_type");
			updateField(sc,p,updateFileList);
		} catch (WorkflowException we){
			sendabled = false;
			String errorInfo = vouchersInfo+"转账核销失败：原因：" + we.getMessage() ;
			log.error("转账失败：原因：" + we.getMessage());
			errorMsg.append(errorInfo) ;
		} catch (Exception e) {
			sendabled = false;
			String errorInfo = vouchersInfo+"转账核销失败：原因：" + e.getMessage() ;
			log.error(errorInfo);
			errorMsg.append(errorInfo);
		}
		//签章发送放在事务中
		if(isSend ==1 && sendabled ){
			try {
				smallTrans.newTransExecute(new ISmallTransService() {

					public void doExecute() throws Exception {
							
							List<String> updateFileList = new ArrayList<String>();
							PbUtil.batchSetValue(pList, "send_flag", "1");
							updateFileList.add("send_flag");
				
							billEngine.updateBill(sc, updateFileList, pList, false);
							String decOrgType = PbParameters
								.getStringParameter(PayConstant.DEST_MOF_ORG_TYPE);
							try {
								baseBizService.signAndSend2EVoucher(sc, decOrgType,
								XmlConstant.VOUCHERFLAG_VALUE_RETURN, pList);
							} catch (Exception e) {
								log.error("凭证签章失败", e);
								throw new PbException("签章异常:" + e.getMessage() + "!");
							}
						}
					});
			} catch (Exception e) {
				errorMsg.append("【" + pList.get(0).getPay_voucher_code() + "】转账成功，");
				errorMsg.append(e.getMessage() + ";");
				//TODO：异常处理
				log.error("签章异常",e);
			}
		}
		total.stop();
		if (errorMsg.length() > 0) {
			excetionMsg.append("操作失败，凭证").append(errorMsg.substring(0, errorMsg.length() - 1));
		}
		log.debug("转账核销完成");
		return excetionMsg.toString();
	}
	
	/**
	 * 对支付数据进行校验
	 * @param sc
	 * @param payList
	 * @return
	 * @throws ParseException
	 */
	private List<PayVoucher> checkTransferVouchers(Session sc,List<PayVoucher> payList) throws ParseException{
		//1、判断凭证信息是否为空
		if (ListUtils.isEmpty(payList)) {
			throw new PbException("凭证信息为空");
		}

		String admdivCode = payList.get(0).getAdmdiv_code();
		//2、判断当前时间是否在财政的日始日终时间之内，不是则抛出异常提示
		if (!finService.isInDay(payList.get(0))) {
			throw new FinIsinDayException("当前时间不在财政【" + admdivCode
					+ "】业务办理日始日终时间之内!详情联系主办行【"+finService.loadAdmdivByCode(admdivCode).getManager_bank_name()+"】");
		}
		//3、对凭证天数进行校验,超过天数报错
		int  condrolDays =  PbParameters.getIntParameter("pb.trans.notTransDay", admdivCode);
		if(condrolDays < 0){
			throw new PbException("参数:pb.trans.notTransDay 配置不合法!");
		}else if(condrolDays > 0){
			StringBuffer errorInfo = new StringBuffer(100);
			for (final PayVoucher payVoucher : payList) {
				int day = DateTimeUtils.daysBetween(payVoucher.getVou_date(),DateTimeUtils.TransLogDateTime());
				if(day > condrolDays){
					errorInfo.append("凭证[").append(payVoucher.getPay_voucher_code()).append("]超过[").append("]天未支付，请重新选择支付数据！");
					throw new PbException(errorInfo.toString());
				}
			}
		}
		//4、凭证库批量校验支付数据是否篡改
		batchPayVoucherValidate2EVoucher(payList);
		//5、加载明细数据
		// 获取主单单据类型ID
		long billTypeId = Parameters.getLongParameter(PayConstant.BILL_TYPE_PAY_VOUCHER);
		// 明细为空才加载明细
		List<Billable> details = payList.get(0).getDetails();
		if (ListUtils.isEmpty(details)) {
			
			// 主单ID数组
			long ids[] = BillUtils.getBillIds(payList);
			// 查询对应的明细信息
			List<PayRequest> requests = (List<PayRequest>) payCommonService.loadDetailsByBill(sc, billTypeId, ids, null);
			// 设置单据和明细的关联关系
			PbUtil.setBillDetails((List<PayVoucher>) payList, requests,"pay_voucher_id");
		}
		return payList;
		
	}
	
	private List<String> getBillUpdateFileList4ABC(){
		List<String> updateFileList = new ArrayList<String>(30);
		updateFileList.add("pay_date");
		updateFileList.add("payDate");
		updateFileList.add("business_type");
		updateFileList.add("task_id");
		updateFileList.add("accthost_seqid");
		updateFileList.add("return_reason");
		updateFileList.add("trans_res_msg");
		updateFileList.add("trans_succ_flag");
		updateFileList.add("agent_business_no");
		updateFileList.add("voucherFlag");
		updateFileList.add("last_ver");
		updateFileList.add("pay_amount");
		updateFileList.add("payee_account_name");
		updateFileList.add("payee_account_no");
		updateFileList.add("payee_account_bank");
		updateFileList.add("payee_account_bank_no");
		
		updateFileList.add("is_self_counter");
		updateFileList.add("majorUserCode");
		updateFileList.add("cash_no");
		updateFileList.add("tellerCode");
		updateFileList.add("cashTransFlag");
		updateFileList.add("city_code");
		
		//农行专项资金
		updateFileList.add("cntrl_spcl_fund_bdgtdocno");
		updateFileList.add("local_sepr_bdgtdocno");
		updateFileList.add("fund_src");
		updateFileList.add("spcl_type_name");
		updateFileList.add("spcl_type_code");
		
		updateFileList.add("paypwd");
		updateFileList.add("billissuedate");
		
		return updateFileList;
	}
	
	private List<String> getDetailUpdateFileList(){
		List<String> detailUpdateList = new ArrayList<String>(8);
		detailUpdateList.add("pay_date");
		detailUpdateList.add("agent_business_no");
		detailUpdateList.add("accthost_seqid");
		detailUpdateList.add("trans_succ_flag");
		return detailUpdateList;
	}

	@Override
	public int updatePayRequestBankNo(String bankNo, String bankName,
			String payVoucherId,String payeeAccountNo,String mode,String oriBnakName,String setModeName,String setModeCode) {
			//根据payVoucherId与明细银行名称 更新明细行号，
			String sql = "UPDATE PB_PAY_REQUEST SET PAYEE_ACCOUNT_BANK_NO = ?,PAYEE_ACCOUNT_BANK = ?,PB_SET_MODE_NAME = ?,PB_SET_MODE_CODE = ? WHERE PAY_VOUCHER_ID=? AND PAYEE_ACCOUNT_NO=? AND PAYEE_ACCOUNT_BANK = ?";
			if("批量发放".equals(mode)){
				sql = "UPDATE PB_BATCHPAY_REQUEST SET PAYEE_ACCOUNT_BANK_NO = ?,PAYEE_ACCOUNT_BANK = ?,PB_SET_MODE_NAME = ?,PB_SET_MODE_CODE = ? WHERE BATCHPAY_VOUCHER_ID=? AND PAYEE_ACCOUNT_NO=? AND PAYEE_ACCOUNT_BANK = ?";
			}
			int result = baseDao.execute(sql, new Object[]{bankNo,bankName,setModeName,setModeCode,Long.parseLong(payVoucherId),payeeAccountNo,oriBnakName});
			//更新缓存
			bankNoService.savePayBankNo(bankNo, bankName, payeeAccountNo);
			return result;
	}
	
	/**
	 * 更新单据的last_ver，完成后事务需要提交
	 * @param sc
	 * @param bill
	 * @throws Exception
	 */
	private void updateBillLastVer(final Session sc,final Billable bill) throws Exception{
		smallTrans.newTransExecute(new ISmallTransService() {
			
			@Override
			public void doExecute() throws Exception {
				
				List<String> updateFields = new ArrayList<String>();
				updateFields.add("last_ver");
				List<Billable> bills = new ArrayList<Billable>();
				bills.add(bill);
				billEngine.updateBill(sc, updateFields, bills, false);
				
			}
		});
	}
	/**
	 * 转账前，更新相关字段，达到行级锁的目的
	 * @param sc
	 * @param bill 业务对象
	 * @param field 字段名称
	 * @param newValue 新值
	 * @param oriValue 旧值
	 */
	private void lockBillForTrans(Session sc,Billable bill,String field,Object newValue,Object oriValue) throws Exception{
		List<String> updateFields = new ArrayList<String>();
		updateFields.add(field);
		List<Billable> bills = new ArrayList<Billable>();
		bills.add(bill);
		PlatformUtils.setProperty(bill, field, newValue);
		billEngine.updateBill(sc, updateFields, new Where().addLogic(new Eq(field,oriValue)), bills, false);
	}
	
	/**
	 * 
	 * @param vouchers
	 */
	private void sendVoucherByGreen(Session sc, List<PayVoucher> payVoucherList)
			throws Exception {

		String decOrgType = PbParameters
				.getStringParameter(PbParaConstant.FORWARD_ORG_TYPE);
		List<String> updateFields = new ArrayList<String>();
		AsspOperator asspOperator = new AsspOperatorAdapter();
		// 市行转发省行的时候，更新clear_flag以便可以进行退款录入
		updateFields.add("clear_flag");
		// 获得本地路由
		String srcOrgType = PbParameters
				.getStringParameter(PayConstant.ORI_ORG_TYPE);
		if (payVoucherList.get(0).getPay_amount().signum() == 1) {

			for (PayVoucher p : payVoucherList) {

				p.setClear_flag(1);
			}
			log.info("++++++++++拼装报文开始!++++++++++++");
			byte xmlByte[] = this.baseBizService.getBizXmlBytes(sc,
					payVoucherList.get(0).getAdmdiv_code(),
					payVoucherList.get(0).getVt_code(), payVoucherList);
			
			byte message[] = new byte[xmlByte.length + 1];
			System.arraycopy(xmlByte, 0, message, 1, xmlByte.length);
			message[0] = '1';

			asspOperator.requestData(payVoucherList.get(0).getAdmdiv_code(),
					srcOrgType, decOrgType, Base64.encode(message));
			
			log.info("+++++++++++市行报文已发送省行,等待回执结果+++++++++");
		} else {// 市行的退款也修改为走绿色通道
			StringBuffer msg = new StringBuffer("3");
			for (PayVoucher p : payVoucherList) {
				String attachStr =  sc.getBankcode()+sc.getBankname()+sc.getUserCode()+sc.getUserName();
				// TODO:市行转发省行
				// 1.拼装请求报文
				// "2+原单号+|+退款类型|+退款金额|+退款原因+|+区划+|+年度&2+原单号+|+退款类型|+退款金额|+退款原因+|+区划+|+年度 "
				msg.append(p.getOri_voucher_code()).append("|")
						.append(p.getRefund_type()).append("|")
						.append(String.format("%1$03.2f", p.getPay_amount()))
						.append("|").append(p.getRemark()).append("|")
						.append(p.getAdmdiv_code()).append("|")
						.append(attachStr).append("|")
						.append(p.getAgent_business_no()).append("|")
						.append(p.getYear()).append("&");
			}
			msg = msg.deleteCharAt(msg.length() - 1);

			byte[] requestMessage = Base64.encode(msg.toString()
					.getBytes("GBK"));

			// 市发送省 调用绿色通道发送
			byte[] rv = asspOperator.requestData(payVoucherList.get(0)
					.getAdmdivCode(), srcOrgType, decOrgType, requestMessage);

			if (rv == null) {
				throw new Exception("同步绿色通道未返回回执结果!");
			}

			String rvv = new String(rv, "GBK").substring(4);

			if (rv != null
					&& new String(rv, "GBK").substring(0, 4).equals("9999")) {

				throw new Exception(rvv + "");
			}
		}

	}
	
	
	
	 /**
     * 签章发送科目调整、授权支付凭证，包含额度控制
     */
	@Override
    public void signAndSendAdjustAccreditVoucher(Session sc,
			List<PayVoucher> payVoucherList, int voucherFlag) throws Exception {

		// 进行额度控制
		String payCode = PbParameters.getStringParameter(
				PbParaConstant.ACCREDIT_PAY_TYPE_CODE, payVoucherList.get(0)
						.getAdmdiv_code());
		// 主单ID数组
		long ids[] = BillUtils.getBillIds(payVoucherList);
		// 支付凭证单据类型
		long billTypeId = Parameters
				.getLongParameter(PayConstant.BILL_TYPE_PAY_VOUCHER);
		// 明细列表
		List<PayRequest> requestList = new ArrayList<PayRequest>();

		if (ListUtils.isEmpty(payVoucherList.get(0).getDetails())) {
			requestList = (List<PayRequest>) payCommonService
					.loadDetailsByBill(sc, billTypeId, ids, null);
		} else {
			for (PayVoucher p : payVoucherList) {
				requestList.addAll((List) p.getDetails());
			}
		}
		if (payVoucherList.get(0).getPay_type_code().startsWith(payCode)) {
			// 需要进行额度控制
			balanceService.payRequestsEntrance(sc, requestList, true);
		}
		// 更新支付日期、交易流水号
		Timestamp now = DateTimeUtils.nowDatetime();
		String payDate = PbUtil.getCurrDate();
		for (PayVoucher p : payVoucherList) {
			p.setPay_date(now);
			p.setPayDate(payDate);
			p.setAgent_business_no(String.valueOf(p.getPay_voucher_id()));
		}
		for (PayRequest r : requestList) {
			r.setPay_date(now);
			r.setPay_dateOfStr(payDate);
			r.setAgent_business_no(String.valueOf(r.getPay_voucher_id()));
		}
		// 更新主单
		List<String> updateFields = new ArrayList<String>();
		updateFields.add("pay_date");
		updateFields.add("payDate");
		updateFields.add("agent_business_no");

		billEngine.updateBill(sc, updateFields, payVoucherList, false);

		// 更新明细
		updateFields.remove("payDate");
		updateFields.add("pay_dateOfStr");

		billEngine.updateBill(sc, updateFields, requestList, false);

		// 接续调用签章发送逻辑
		this.signAndSendPayVoucherByNoFlow(sc, payVoucherList, voucherFlag);

	}
	
	/**
	 * hsq 2015年10月21日17:03:37
	 * 备户金额度控制pb_plan_provisions
	 * @param sc
	 * @param payVouchers
	 * @throws Exception
	 */
	private void controlBHJ(Session sc, PayVoucher voucher, int isBHJPay, int tradeType) throws Exception {
		String currentTime = DateTimeUtils.getCurrentTime("HHmmss");
		if((Integer.parseInt(currentTime) - 115900) > 0 && isBHJPay == 1 
				&& (tradeType == TradeConstant.PAY2PAYEE || tradeType == TradeConstant.PAY2PAYEECASH)) {
			//正向到收款人和现金，控制备户金
			
			log.info("厦门农行，每日12点后，支付进入备户金模式");
			//如果支付时时间大于每日11点59分00秒，则进入备户金支付模式，控制额度
			log.info("控制备户金额度开始.....");
			//支付金额
			BigDecimal amoumt = voucher.getAmount();
			//1.有足够的余额
			//2.最后支付工作日必须补录（大于0）
			//3.最后工作日下午不进行备户金支付，因此小于最后工作日才能做业务
			String sql = "update pb_plan_provisions set remain_amount=remain_amount - ?  where remain_amount - ? > 0 and enable=1 and admdiv_code = ? "
					+ "and last_work_day > ?";
			int result = baseDao.execute(sql, new Object[]{amoumt, amoumt, voucher.getAdmdiv_code(), DateTimeUtils.getCurrentTime("dd")});
			if(result <= 0) {
				log.error("备户金余额不足或者本月最后工作日字段未补录或者日期大于等于本月最后工作日");
				throw new Exception("<br/>请检查备户金剩余额度以及本月备户金最后支付日期");
			}
			log.info("控制备户金额度结束.....");
		}
	}

	

}
