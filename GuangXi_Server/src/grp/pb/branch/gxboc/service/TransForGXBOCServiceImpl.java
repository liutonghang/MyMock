package grp.pb.branch.gxboc.service;

import static grp.pt.pb.util.PayConstant.BILL_TYPE_PAY_REQUEST;
import static grp.pt.pb.util.PayConstant.BILL_TYPE_PAY_VOUCHER;
import static grp.pt.pb.util.PayConstant.BILL_TYPE_REALPAY_REQUEST;
import static grp.pt.pb.util.PayConstant.BILL_TYPE_REALPAY_VOUCHER;
import static grp.pt.pb.util.PayConstant.WORK_FLOW_DISCARD;
import static grp.pt.pb.util.PayConstant.WORK_FLOW_UNDO;
import grp.pt.bill.BillEngine;
import grp.pt.bill.BillType;
import grp.pt.bill.BillTypes;
import grp.pt.bill.Billable;
import grp.pt.bill.ConditionObj;
import grp.pt.bill.ConditionPartObj;
import grp.pt.borm.model.ObjectDTO;
import grp.pt.database.ObjectUtil;
import grp.pt.database.SQLUtil;
import grp.pt.database.sql.Eq;
import grp.pt.database.sql.Field;
import grp.pt.database.sql.In;
import grp.pt.database.sql.OrderBy;
import grp.pt.database.sql.SimpleQuery;
import grp.pt.database.sql.Where;
import grp.pt.pb.assp.handler.XmlConstant;
import grp.pt.pb.common.BalanceService;
import grp.pt.pb.common.IBaseBizService;
import grp.pt.pb.common.IVoucherConditionService;
import grp.pt.pb.common.model.PbConditionPartObj;
import grp.pt.pb.payment.IVoucher;
import grp.pt.pb.payment.PayRequest;
import grp.pt.pb.payment.PayVoucher;
import grp.pt.pb.payment.action.PayRequestSaveAction;
import grp.pt.pb.realpay.RealPayRequest;
import grp.pt.pb.realpay.RealPayVoucher;
import grp.pt.pb.trans.IBankTransService;
import grp.pt.pb.trans.ITransService;
import grp.pt.pb.trans.bs.TransDAO;
import grp.pt.pb.trans.model.TransLogDTO;
import grp.pt.pb.trans.model.TransReturnDTO;
import grp.pt.pb.trans.util.Context;
import grp.pt.pb.util.PayConstant;
import grp.pt.pb.util.PbParaConstant;
import grp.pt.pb.util.PbParameters;
import grp.pt.pb.util.PbUtil;
import grp.pt.pb.util.TradeConstant;
import grp.pt.util.ListUtils;
import grp.pt.util.NumberUtil;
import grp.pt.util.Parameters;
import grp.pt.util.exception.CommonException;
import grp.pt.util.model.Session;
import grp.pt.util.transation.ISmalTrans;
import grp.pt.util.transation.ISmallTransService;
import grp.pt.workflow.IWorkflowRunService;

import java.lang.reflect.InvocationTargetException;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.log4j.Logger;

public class TransForGXBOCServiceImpl {
	
	private static Logger log = Logger.getLogger(TransForGXBOCServiceImpl.class);
	
	/**
	 *  与银行核心相关的配置
	 */
	static Context context = new Context();
	
	/**
	 * 银行核心接口个性化实现
	 */
	static IBankTransService transService;
	
	/**
	 * 单据引擎组件
	 */
	protected BillEngine billEngine = null;
	public BillEngine getBillEngine() {
		return billEngine;
	}


	public void setBillEngine(BillEngine billEngine) {
		this.billEngine = billEngine;
	}

	/**
	 * 银行接口
	 */
	private ITransService bankTransService;
	public ITransService getBankTransService() {
		return bankTransService;
	}


	public void setBankTransService(ITransService bankTransService) {
		this.bankTransService = bankTransService;
	}
	
	/**
	 * 额度修改组件
	 */
	private BalanceService balanceService = null;
	
	
	
	public BalanceService getBalanceService() {
		return balanceService;
	}


	public void setBalanceService(BalanceService balanceService) {
		this.balanceService = balanceService;
	}

	/**
	 * 基础业务类
	 */
	private IBaseBizService baseBizService;
	
	public IBaseBizService getBaseBizService() {
		return baseBizService;
	}


	public void setBaseBizService(IBaseBizService baseBizService) {
		this.baseBizService = baseBizService;
	}


	public TransDAO getTransDAO() {
		return transDAO;
	}


	public void setTransDAO(TransDAO transDAO) {
		this.transDAO = transDAO;
	}

	/**
	 * 银行接口操作相关DAO
	 */
	TransDAO transDAO = null;
	
	
	/**
	 * 工作流引擎
	 */
	private IWorkflowRunService workflow = null;
	
	
	public IWorkflowRunService getWorkflow() {
		return workflow;
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

	private ISmalTrans smallTrans;

	static{
		transService = context.newBankTransService();
	}
	
	/**
	 * 加载凭证的过滤条件服务类
	 */
	private IVoucherConditionService conditionService;
	
	
	
	public IVoucherConditionService getConditionService() {
		return conditionService;
	}


	public void setConditionService(IVoucherConditionService conditionService) {
		this.conditionService = conditionService;
	}


	public TransReturnDTO queryTransNotSaveLog(Session sc, IVoucher t) throws Exception {

    	List<TransLogDTO> tranList = null;
		TransReturnDTO returnDTO = null;

			tranList = transDAO.loadTransLogByVouNo(sc,t.getVouNo(),t.getTrade_type(), t.getAdmdivCode(),t.getVtCode(),t.getYear());
				
			returnDTO = transService.queryTrans(sc, context, t, tranList == null ? null
						: tranList.size() == 0 ? null : tranList.get(0));
		
		return returnDTO;
    }
	
	
	/**
	 * 退票(如果已请款 则需先退款)
	 * 
	 * @param sc
	 * @param ids
	 * @param operRemark
	 * @throws NoSuchMethodException
	 * @throws InvocationTargetException
	 * @throws IllegalAccessException
	 */
	@SuppressWarnings("unchecked")
	public void returnPayVoucherByTrans(final Session sc,
			List<PayVoucher> payVoucherList, final String operRemark) {
		// 主单ID数组
		long ids[] = getPayVoucherIds(payVoucherList);
		// 获取支付凭证单据类型
		long billTypeId = Parameters
				.getLongParameter( BILL_TYPE_PAY_VOUCHER);
		// 明细列表
		List<PayRequest> requestList = (List<PayRequest>) this
				.loadDetailsByBill(sc, billTypeId, ids);
		// 将明细设置到对应的凭证中
		PbUtil.setBillDetails(payVoucherList, requestList, "pay_voucher_id");
		
/*		// 调用工作流录入，复审岗退票，不需录入工作流
		if (!(requestList.get(0).getTask_id() > 0)) {
			workflow.createProcessInstance(sc, "PB_PAY_REQUEST", requestList,
				false);
		}
		// 完成退回操作
		workflow.signalProcessInstance(sc, requestList, WORK_FLOW_DISCARD,
				"凭证退票");

		// 将明细单中task_id设置到主单
		for (PayVoucher voucher : payVoucherList) {
			voucher.setTask_id(voucher.getDetails().get(0).getTask_id());
		}
*/		
		StringBuffer vouCodeStr = new StringBuffer();
		for (final PayVoucher payVoucher : payVoucherList) {
			try {
				smallTrans.newTransExecute(new ISmallTransService() {
					public void doExecute() throws Exception {
						//未请款：直接退回财政
						//请款失败：查询请款状态，如果失败(不处理)、成功（退款、退回财政）
						//请款成功: 查询支付状态，失败（退款），成功（不退款、不退回财政）
						if(payVoucher.getBusiness_type()==2){
							throw new Exception("该凭证已退回");
						}
						if(payVoucher.getBatchreq_status()==0){
							
						}else if(payVoucher.getBatchreq_status()==-1){
							payVoucher.setTrade_type(TradeConstant.ADVANCE2PAY);
							
							String tempVouCode = payVoucher.getPay_voucher_code();
							
							payVoucher.setPay_voucher_code(payVoucher.getBatch_no());
							
							TransReturnDTO transReturn = queryTransNotSaveLog(sc, payVoucher);
							
							payVoucher.setPay_voucher_code(tempVouCode);
							
							int i = transReturn.getResStatus();
					        //交易状态
							// 成功(转账、退票)
							// 不明确（不予退票）
							// 失败（退票）						
							if (TradeConstant.RESPONSESTATUS_SUCCESS == i) {
								payVoucher.setTrade_type(TradeConstant.PAY2ADVANCE_WRITEOFF);
//								------------------------------------------
//								saveWriteoffVoucher(payVoucher);
								
								List<PayRequest> requests = new ArrayList<PayRequest>();
								for( Billable bill : payVoucher.getDetails()){
									PayRequest r = (PayRequest)bill;
									r.setPay_amount(r.getPay_amount().negate());
									requests.add(r);
								}
								//进行额度控制，即恢复额度
								String directPay = PbParameters.getStringParameter(PbParaConstant.DIRECTPAY_PAY_TYPE_CODE, payVoucher.getAdmdiv_code());
								if( !payVoucher.getPay_type_code().startsWith(directPay)){
									balanceService.payRequestsEntrance(sc, requests , false);
								}
//								------------------------------------------
								
								bankTransService.payTrans(sc, payVoucher);
								//设置为未请款状态
								payVoucher.setBatchreq_status(0);
							}else if(TradeConstant.RESPONSESTATUS_NOTCONFIRM == i){
								throw new CommonException("", "凭证："
										+ payVoucher.getCode()
										+ "交易状态不确定，无法退回！");
							}
						}else if(payVoucher.getBatchreq_status()==1 && payVoucher.getBusiness_type()==0){
							payVoucher.setTrade_type(TradeConstant.PAY2PAYEE);
							TransReturnDTO transReturn = queryTransNotSaveLog(sc, payVoucher);
							int i = transReturn.getResStatus();
					        //交易状态
							// 成功/不明确（不允许退票）
							// 失败（转账、退票）
							if (TradeConstant.RESPONSESTATUS_SUCCESS == i) {
								throw new Exception( "凭证："
										+ payVoucher.getCode()
										+ "交易成功，无法退回！");
								
							}else if(TradeConstant.RESPONSESTATUS_NOTCONFIRM == i){
								throw new Exception( "凭证："
										+ payVoucher.getCode()
										+ "交易不确认，无法退回！");
							}else{
								payVoucher.setTrade_type(TradeConstant.PAY2ADVANCE_WRITEOFF);
//								------------------------------------------
//								saveWriteoffVoucher(payVoucher);
								
								List<PayRequest> requests = new ArrayList<PayRequest>();
								for( Billable bill : payVoucher.getDetails()){
									PayRequest r = (PayRequest)bill;
									r.setPay_amount(r.getPay_amount().negate()); 
									requests.add(r);
								}
								//进行额度控制，即恢复额度
								String directPay = PbParameters.getStringParameter(PbParaConstant.DIRECTPAY_PAY_TYPE_CODE, payVoucher.getAdmdiv_code());
								if( !payVoucher.getPay_type_code().startsWith(directPay)){
									balanceService.payRequestsEntrance(sc, requests , false);
								}
//								------------------------------------------
		
								bankTransService.payTrans(sc, payVoucher);
								//设置为未请款状态
								payVoucher.setBatchreq_status(0);
							}
						}else if(payVoucher.getBusiness_type()==1){
							throw new Exception( "凭证："
									+ payVoucher.getCode()
									+ "交易成功，无法退回！");
						}


						payVoucher.setReturn_reason(operRemark);
						List<PayVoucher> tempList = new ArrayList<PayVoucher>();
						tempList.add(payVoucher);
						if ("1".equals(PbParameters
								.getStringParameter("pb.returnVoucherModel"))
								||PbParameters
								.getStringParameter("pb.returnVoucherModel") == null) {
							// 设置voucherFlag为退回
							PbUtil.batchSetValue(tempList, "voucherFlag",
									XmlConstant.VOUCHERFLAG_VALUE_BACK);
//							try {
								baseBizService.returnback2EVoucher(sc, tempList,
										new String[] { payVoucher
												.getReturn_reason() });
//							}catch(Exception e){
								//更新该凭证的交易返回结果
//								payVoucher.setVoucherFlag(XmlConstant.VOUCHERFLAG_VALUE_BACK_FAIL);
//								throw new  Exception(e.getMessage());
//							}
							
						} else if ("0".equals(PbParameters
								.getStringParameter("pb.returnVoucherModel"))) {
							String decOrgType = PbParameters
									.getStringParameter(PayConstant.DEST_MOF_ORG_TYPE);
							PbUtil.batchSetValue(tempList, "voucherFlag",
									XmlConstant.VOUCHERFLAG_VALUE_RETURN);
							PbUtil.batchSetValue(tempList, "XPayAmt",
									NumberUtil.BIG_DECIMAL_ZERO);
							PbUtil.batchSetValue(payVoucher.getDetails(),
									"XPayAmt", NumberUtil.BIG_DECIMAL_ZERO);
							baseBizService.signAndSend4EVoucher(sc, decOrgType,
									XmlConstant.VOUCHERFLAG_VALUE_RETURN,
									tempList);
						}
					}
				});
			} catch (Exception e) {
				e.printStackTrace();
				log.error(e.getMessage());	
				payVoucher.setVoucherFlag(GXBOCBLConstant.VOUCHERFLAG_VALUE_BACK_FAIL);
				updateBLReturnReqVoucher(sc, payVoucher);
				vouCodeStr.append(e.getMessage());
			}
		}
		if (vouCodeStr.length() != 0) {
			throw new CommonException("", vouCodeStr.toString());
		}
		PbUtil.batchSetValue(payVoucherList, "return_reason", operRemark);
		PbUtil.batchSetValue(payVoucherList, "business_type", PayConstant.HASBACK_CONFIRMED);
		PbUtil.batchSetValue(payVoucherList, "payUser_Code", sc.getUserCode());
		List<String> updateFields = new ArrayList<String>();
		updateFields.add("task_id");
		updateFields.add("return_reason");
		updateFields.add("business_type");
		updateFields.add("payUser_Code");
		updateFields.add("voucherFlag");
		updateFields.add("last_ver");
		
		billEngine.updateBill(sc, updateFields, payVoucherList, false);

	}
	
	/**
	 * 获得凭证中的所有主键
	 * 
	 * @param list
	 * @return
	 */
	private long[] getPayVoucherIds(List<PayVoucher> list) {

		// 如果为空则直接返回
		if (ListUtils.isEmpty(list)) {
			long[] l = new long[0];
			return l;
		}

		// 如果有凭证数据则循环添加
		long[] l = new long[list.size()];
		for (int i = 0; i < list.size(); i++) {
			l[i] = list.get(i).getPay_voucher_id();
		}
		return l;
	}
	
	
	/**
	 * BL退回请求失败跟新的字段
	 * @param sc
	 * @param payVoucher
	 */
    private void updateBLReturnReqVoucher(final Session sc, final PayVoucher payVoucher){
    	try {
			smallTrans.newTransExecute(new ISmallTransService() {
				public void doExecute() throws Exception {
					List<String> updateFileList = new ArrayList<String>();
					updateFileList.add("trans_res_msg");
					updateFileList.add("batchreq_status");
					updateFileList.add("agent_business_no");
					updateFileList.add("voucherFlag");
					List<PayVoucher> pvList = new ArrayList<PayVoucher>();
					pvList.add(payVoucher);
					billEngine.updateBill(sc, updateFileList, pvList, false);
				}
			});
		} catch (Exception e) {
			e.printStackTrace();
			log.error("更新退票信息失败"+e.getMessage());
		}
    	
    }
    
    
    @SuppressWarnings("unchecked")
	public void invalidateRefundVoucherByBL(Session sc, List<PayVoucher> vouchers,
			int payType ,boolean isPay ) throws Exception {

		// 如果没有需要登记的数据则直接返回
		if (ListUtils.isEmpty(vouchers)) {
			return;
		}
		// 主单ID数组
		long ids[] = getPayVoucherIds(vouchers);
		// 支付凭证单据类型
		long billTypeId = Parameters
				.getLongParameter( BILL_TYPE_PAY_VOUCHER);
		// 明细列表
		List<PayRequest> refundReqs = (List<PayRequest>) this
				.loadDetailsByBill(sc, billTypeId, ids);
		// 将明细设置到对应的凭证中
		PbUtil.setBillDetails(vouchers, refundReqs, "pay_voucher_id");

		long detailTypeId = Parameters.getLongParameter(
				BILL_TYPE_PAY_REQUEST);

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
		
		//自助柜面作废退款凭证，不走工作流
/*		if(sc.getCurrMenuId() != -1){
			workflow.signalProcessInstance(sc, vouchers, WORK_FLOW_DISCARD, "作废"); // 工作流作废明细
		}
*/		List<String> updateFields = new ArrayList<String>();
		updateFields.add("task_id");
		updateFields.add("is_valid");
		updateFields.add("last_ver");
		for (PayVoucher vou : vouchers) {
			vou.setBusiness_type(0);
		}
		updateFields.add("business_type");//更新支付状态为未支付，划款退款生成时不包含该已撤销的凭证
		billEngine.updateBill(sc, updateFields, vouchers, false);
		billEngine.updateBill(sc, updateFields, refundReqs, false);
		updateFields.add("pay_refund_amount");
		//更新原主单信息
		List<String> updateOriVoucherField = new ArrayList<String>();
		updateOriVoucherField.add("pay_refund_amount");
		updateOriVoucherField.add("refund_type");
		billEngine.updateBill(sc,updateOriVoucherField, ori_vouchers, false);
		billEngine.updateBill(sc, updateFields, ori_Reqs, false);
	}
    
    /**
	 * 加载主单对应的明细
	 * @param sc
	 * @param billTypeId
	 * @param ids
	 * @param page
	 * @return
	 */
	public List<?> loadDetailsByBill(Session sc, long billTypeId, long[] ids) {
		if(ids == null || ids.length < 1)
			return null;
		//主单单据类型
		BillType billType = BillTypes.getInstance().getBillTypeById(billTypeId);
		//主单对象
		ObjectDTO objectDTO = billType.getObjDto();
		//获取主单对象的主键名称
		String pkName = ObjectUtil.getIdPrimaryField(objectDTO).getField_name();
		//提取主单主键
		In in = new In(new Field(pkName));
		for(long id : ids){
			in.addValue(id);
		}
		Where where = new Where();
		where.addLogic(new Eq("1", "1"));
		where.and(in);
		//获取所有明细
		return this.billEngine.loadBillByBillType(sc, billType.getDetailTypeId(), null, where, null,null);
	}
	
	public List<PayRequest> loadPayReqsByObj(Session sc, ConditionObj obj) {
		long billTypeId = Parameters
				.getLongParameter(BILL_TYPE_PAY_REQUEST);
		addVoucherCondition(sc, obj, billTypeId);
		Where where = new Where();
		SQLUtil.addCondition(where, obj);
		OrderBy order = SQLUtil.convertOrder(obj);
		return (List<PayRequest>) billEngine.loadBillByBillType(sc, billTypeId,
				new ArrayList<String>(), where, order, null);
	}
	
	
	public List<RealPayVoucher> loadRealPayVoucherByObj(Session sc,
			ConditionObj obj) {
		long billTypeId = Parameters.getLongParameter(BILL_TYPE_REALPAY_VOUCHER);
		addVoucherCondition(sc, obj, billTypeId);
		Where where = new Where();
		SQLUtil.addCondition(where, obj);
		OrderBy order = SQLUtil.convertOrder(obj);
		return (List<RealPayVoucher>) billEngine.loadBillByBillType(sc, billTypeId,
				new ArrayList<String>(), where, order, null);
	}
	
	/**
	 * 添加凭证过滤条件
	 * 
	 * @param sc
	 * @param obj
	 * @param billTypeId
	 */
	private void addVoucherCondition(Session sc, ConditionObj obj,
			long billTypeId) {
		PbConditionPartObj pbCondition = (PbConditionPartObj) conditionService
				.getConditionPartobj(sc);
		long objId = pbCondition.getCondition().getObj_id();

		BillType billType = BillTypes.getInstance().getBillTypeById(billTypeId);

		if (billType.getObjId() != objId) {
			return;
		}
		if (pbCondition != null) {
			obj.addConditionPartObj(pbCondition);
		}
	}
	
	@SuppressWarnings({ "unchecked", "deprecation" })
	
	public List<RealPayRequest> loadRealPayRequestByObj(Session sc,
			ConditionObj obj) {
		
		long billTypeId = Parameters.getLongParameter( BILL_TYPE_REALPAY_REQUEST);
		
		addVoucherCondition(sc, obj, billTypeId);
		
		Where where = new Where();
		
		SQLUtil.addCondition(where, obj);
		
		OrderBy order = SQLUtil.convertOrder(obj);
		
		return (List<RealPayRequest>) billEngine.loadBillByBillType(sc, billTypeId,
		
		new ArrayList<String>(), where, order, null);
	} 
	
	public void invalidRefundRealPayVoucher(Session sc,
			List<RealPayVoucher> realPayVoucherList) {
		// 如果没有需要登记的数据则直接返回
		if (ListUtils.isEmpty(realPayVoucherList)) {
			return;
		}
		// 查询单据信息
		long billTypeId = Parameters.getLongParameter(BILL_TYPE_REALPAY_VOUCHER);


		//主单ID数组
		long ids[] =getRealPayVoucherIds(realPayVoucherList);
		//查询对应的明细信息
		List<RealPayRequest> rprList = (List<RealPayRequest>)loadDetailsByBill(sc, billTypeId, ids);
		//设置单据和明细的关联关系
		PbUtil.setBillDetails(realPayVoucherList, rprList, "realpay_voucher_id");	

		
		List<RealPayVoucher> oriRealpayList = new ArrayList<RealPayVoucher>();
		
		for (RealPayVoucher temp :realPayVoucherList){
			ConditionObj conditionObj = new ConditionObj();
			conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"realpay_voucher_code",SimpleQuery.EQUAL,temp.getOri_code(),false,false,""));
			oriRealpayList.add(this.loadRealPayVoucherByObj(sc, conditionObj).get(0));
		}
		
//		workflow.signalProcessInstance(sc, rprList, WORK_FLOW_DISCARD, "作废"); // 工作流作废明细
		
		List<String> updateFields = new ArrayList<String>();
		updateFields.add("task_id");
		updateFields.add("is_valid");
		updateFields.add("last_ver");
		PbUtil.batchSetValue(realPayVoucherList, "is_valid", 0);
		billEngine.updateBill(sc, updateFields, realPayVoucherList, false);
		billEngine.updateBill(sc, updateFields, rprList, false);
		updateFields = new ArrayList<String>();
		updateFields.add("refund_amount");
		PbUtil.batchSetValue(oriRealpayList, "refund_amount", 0);
		billEngine.updateBill(sc, updateFields, oriRealpayList, false);
		
	}
	
	
	public long[] getRealPayVoucherIds( List<RealPayVoucher> list ){
		
		//如果为空则直接返回
		if( ListUtils.isEmpty(list) ){
			long[] l = new long[0];
			return l;
		}
		
		//如果有凭证数据则循环添加
		long[] l = new long[list.size()];
		for( int i = 0; i < list.size(); i++ ){
			l[i] = list.get(i).getRealpay_voucher_id();
		}
		return l;
	}
	

	
}
