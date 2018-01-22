package grp.pb.branch.gxboc.header.ss;

import static grp.pt.pb.util.PayConstant.BILL_TYPE_PAY_VOUCHER;

import java.io.UnsupportedEncodingException;
import java.math.BigDecimal;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.apache.log4j.Logger;
import org.eclipse.jetty.util.log.Log;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;
import org.springframework.jdbc.core.RowMapper;

import grp.pt.bill.BillEngine;
import grp.pt.bill.BillType;
import grp.pt.bill.BillTypes;
import grp.pt.bill.Billable;
import grp.pt.bill.BizObjectSupport;
import grp.pt.bill.ConditionObj;
import grp.pt.bill.ConditionPartObj;
import grp.pt.bill.Paging;
import grp.pt.bill.ReturnPage;
import grp.pt.borm.model.ObjectAttrDTO;
import grp.pt.database.SQLUtil;
import grp.pt.database.sql.OrderBy;
import grp.pt.database.sql.Where;
import grp.pt.pb.common.BalanceService;
import grp.pt.pb.common.IVoucherConditionService;
import grp.pt.pb.common.impl.PayCommonService;
import grp.pt.pb.common.model.BOCBankNoDTO;
import grp.pt.pb.common.model.BankNoDTO;
import grp.pt.pb.common.model.Condition;
import grp.pt.pb.common.model.PbConditionPartObj;
import grp.pt.pb.exception.PbConCurrencyException;
import grp.pt.pb.exception.PbException;
import grp.pt.pb.newuser.UserSignZeroNo;
import grp.pt.pb.payment.BatchReqMoneyVoucher;
import grp.pt.pb.payment.PayRequest;
import grp.pt.pb.payment.PayService;
import grp.pt.pb.payment.PayVoucher;
import grp.pt.pb.payment.RefundSerial;
import grp.pt.pb.payment.RrefundVoucherDTO;
import grp.pt.pb.sms.SmsClient;
import grp.pt.pb.ss.IPsfaBocPayService;
import grp.pt.pb.ss.bs.SelfAgentBankService;
import grp.pt.pb.ss.model.ExchangeCondition;
import grp.pt.pb.ss.model.PbNetBankSign;
import grp.pt.pb.ss.model.TransResultDTO;
import grp.pt.pb.trans.ITransService;
import grp.pt.pb.trans.model.AccountTransDetailDTO;
import grp.pt.pb.trans.model.BocQueryTradeDetailsDTO;
import grp.pt.pb.trans.model.RelationAccountDTO;
import grp.pt.pb.trans.model.TransReturnDTO;
import grp.pt.pb.trans.util.Context;
import grp.pt.pb.util.BillUtils;
import grp.pt.pb.util.PayConstant;
import grp.pt.pb.util.PbParaConstant;
import grp.pt.pb.util.PbParameters;
import grp.pt.pb.util.PbUtil;
import grp.pt.pb.util.PropertiesHander;
import grp.pt.pb.util.StaticApplication;
import grp.pt.pb.util.TradeConstant;
import grp.pt.util.BaseDAO;
import grp.pt.util.ComplexMapper;
import grp.pt.util.ListUtils;
import grp.pt.util.Parameters;
import grp.pt.util.StringUtil;
import grp.pt.util.StringUtils;
import grp.pt.util.model.Session;
import grp.pt.util.transation.ISmalTrans;
import grp.pt.util.transation.ISmallTransService;
import grp.pt.workflow.IWorkflowRunService;

public class PsfaBocPayServiceImpl implements IPsfaBocPayService , SelfAgentBankService{
private static Logger logger = Logger.getLogger(PsfaBocPayServiceImpl.class);
	
	//TODO:是否需要每次掉接口时重新初始化？
	private Session session = new Session();
	private PayService payService = null;
	
	private BillEngine billEngine = null;
	
	private ISmalTrans smallTrans = null;
	
	private BaseDAO baseDao = null;
	
	private ITransService transService = null;
	
	private PayCommonService payCommonService;
	
	private BalanceService balanceService;
	
	public BalanceService getBalanceService() {
		return balanceService;
	}

	public void setBalanceService(BalanceService balanceService) {
		this.balanceService = balanceService;
	}
	
	public PayCommonService getPayCommonService() {
		return payCommonService;
	}

	public void setPayCommonService(PayCommonService payCommonService) {
		this.payCommonService = payCommonService;
	}
	
	private final String UPDATE_SELFCOUNT_FLAG_SQL = "UPDATE PB_PAY_VOUCHER SET IS_SELF_COUNTER = ?,OPERATE_USER_NAME = ? WHERE PAY_VOUCHER_CODE = ? AND ADMDIV_CODE = ?  AND YEAR = ?";

	private Session getSession(String account) throws Exception{
		Session session= new Session();
		Map no_map = baseDao.queryForOne("select bank_id,bank_code from pb_ele_account where account_no = '"+account+"'");
		//取不到网点信息，抛出异常
		if(no_map == null){
			throw new Exception("根据账号获取不到网点信息！");
		}
		session.setBelongOrgId(Long.valueOf(no_map.get("bank_id").toString()));
		session.setBelongOrgCode(no_map.get("bank_code").toString());//重庆农行加
		session.setTop_org(1);
		return session;
	}
	
	@Override
	public TransResultDTO loadPayVouchers(List<ExchangeCondition> reqConditions,Paging page)
			throws Exception {
		ConditionObj obj = new ConditionObj();
		//对请求条件进行分类
		Map<String,Object> map = this.changeToConObj(reqConditions);
		List<PayVoucher> returnVouchers =  new ArrayList<PayVoucher>();
		ConditionObj condition = (ConditionObj)map.get("sql_fields");
		//如果没有配置网银客户签约信息表pb_net_bank_sign，这里支付账号为空，不应该查询出数据 --start
		List<ConditionPartObj> conditionPartObjs = condition.getConditionPartObjs();
		String pay_account_no = null;
		String isSameBnak = "";
		String businessType = "";
		for(ConditionPartObj partOjb:conditionPartObjs){
			if("pay_account_no".equals(partOjb.getKey())){
				pay_account_no = partOjb.getValue() == null?"":partOjb.getValue().toString();
			}else if("is_same_bank".equals(partOjb.getKey())){
				isSameBnak = partOjb.getValue() == null?"":partOjb.getValue().toString();
			}else if("business_type".equals(partOjb.getKey())){
				businessType = partOjb.getValue() == null?"":partOjb.getValue().toString();
			}
		}
		
		if(StringUtil.isEmpty(pay_account_no)){
			return new TransResultDTO(0, returnVouchers);
		}
		Session session = getSession(pay_account_no);
		//如果没有配置网银客户签约信息表pb_net_bank_sign，这里支付账号为空，不应该查询出数据 --end
		ReturnPage returnPage = loadPayVoucherByObjAndPage(session, condition,page);
		List<PayVoucher> vouchers = (List<PayVoucher>)returnPage.getPageData();
		for(PayVoucher p : vouchers){
			/*处理已清算状态，因此处查处的凭证不包含明细，待530版本，可根据主单判断是否已清算
			if(p.getBusiness_type() == 1 && ((PayRequest)(p.getDetails().get(0))).getClear_date() != null){
				p.setBusiness_type(5);
			}
			*/
			//已退款凭证返回柜面的business_type值为4
			/*if(p.getPay_refund_amount().doubleValue() > 0 && p.getBusiness_type() == 1){
				p.setBusiness_type(4);
			}*/
		}
		//如果查询为跨行转账待处理状态凭证，返回前，清空收款人银行联行号。
//		if("0".equals(isSameBnak) && "0".equals(businessType)){
//			PbUtil.batchSetValue(vouchers, "payee_account_bank_no", "");	
//		}
		return new TransResultDTO(0, returnPage);
	}
	
	@Override
	public TransResultDTO acceptPayVoucher(List<ExchangeCondition> reqconitions,final String operate_user_name,boolean is_batch)
			throws Exception {
		// 获取主单单据类型ID
		long billTypeId = Parameters.getLongParameter(BILL_TYPE_PAY_VOUCHER);
		
		String resMsg = "确认成功";
		
		int status = 0;
		PayVoucher p = null;
		List<PayVoucher> vouchers = null;
		//对请求条件进行分类
		final Map<String,Object> map = this.changeToConObj(reqconitions);
		try{
			vouchers = (List<PayVoucher>) loadBillsAndDetailsByObj(new Session(),billTypeId, (ConditionObj)map.get("sql_fields"));
			if(vouchers == null){
				throw new Exception("查询不到对应的凭证信息");
			}
			p = vouchers.get(0);
			//同行转账时收款人联行号为空
			if(map.get("payee_account_bank_no") != null){//TODO 修改更新收款人行号逻辑，多条时，报文规范的传法
				String payee_account_bank_no = map.get("payee_account_bank_no").toString();
				//更新付款行联行号
				PbUtil.batchSetValue(vouchers, "payee_account_bank_no", payee_account_bank_no);
			}
			if( ListUtils.isEmpty(vouchers) ){
				throw new Exception("所选数据可能已被其他人员确认，请刷新界面！");
			}
			//黑龙江建行批量转账时，不传版本号信息
			if(map.get("last_ver") != null){
				this.checkLastver(getCodes(vouchers),new long[]{Long.valueOf(map.get("last_ver").toString())},vouchers);
			}
			Session session  = getSession(vouchers.get(0).getPay_account_no());
			if(map.get("teller") != null){ //TODO 广西中行设置虚拟柜员号 
				session.setUserCode(map.get("teller").toString());
				p.setOperate_user_name(map.get("teller").toString());
			}
			p.setIs_self_counter(1);
			setModeCode(p,session);//设置银行结算方式 (广西中行用到 )
			PbUtil.batchSetValue(p.getDetails(), "is_self_counter", 1);
			//如果是重庆三峡银行，设置支付凭证的操作员
			//根据支付凭证零余额帐号，查询用户签约信息中的虚拟柜员，用于转账
			String bank = PropertiesHander.getValue("trans", "TransInterface");
			if("SanXia".equals(bank)){//TODO 如下代码会导致凭证库发送时候，会导致原文篡改，然后发送失败
				p.setUserCode(loadUserCode(p));
			}
			if(map.get("mobilePhone")!=null){
				p.setHold2(map.get("mobilePhone").toString());
			}
			if(map.get("email")!=null){
				p.setHold3(map.get("email").toString());
			}
			if(map.get("city_code")!=null)//农行补录省市代码
			{
				p.setCity_code(map.get("city_code").toString());
			}
			p.setHold4("2");
			
			//调用柜面提供的凭证确认接口
			acceptPayVoucher(session, p);
			
		} catch (Exception e) {
			status = 1;
			resMsg = PbUtil.getAcurateLenString(e.getMessage(), 60);
			if(is_batch){
				//如果是批量转账（建行批量转账），即使转账失败，返回的失败标识也是成功，而是在凭证里交易状态赋值为5（交易失败），并且给凭证的交易失败原因赋值
				status = 0;
				if(p!=null){
					p.setBusiness_type(5);
					p.setTrans_res_msg(resMsg);
				}
			}
		}
		TransResultDTO resultDTO = new TransResultDTO(status, vouchers,resMsg);
		return resultDTO;
	}
	//广西中行 设置银行结算方式
	private void setModeCode(PayVoucher p, Session s){
		String bankCity = PbParameters.getStringParameter("pb.bankCity");
		String[] cityNames = bankCity.split("\\|");
		String payeeBankName = p.getPayee_account_bank();
		boolean flag = false;	
		//ztl 2016年9月27日19:14:58  适应中行去掉 结算方式 7 、 8 的处理方式
//	   if("7".equals(p.getSet_mode_code())){
//			Map no_map = baseDao.queryForOne("select code from gap_organize where id = (select manager_bank_id from pb_sys_admdiv  where admdiv_code = '"+p.getAdmdiv_code()+"' )");
//			s.setBelongOrgCode(no_map.get("code").toString());
//			p.setPb_set_mode_code("8");
//			p.setBank_setmode_code("8"); //公务卡
//		}else 
			if(1==p.getIs_same_bank()){
			//ztl 2016年9月27日19:14:58  适应中行去掉 结算方式 7 、 8 的处理方式
//			if(p.getPayee_account_no() != null &&p.getPayee_account_no().length() == 16 && !(p.getPayee_account_no().startsWith("9"))){ //判断是信用卡交易广西用到
//				p.setBank_setmode_code("7");  //信用卡
//				p.setPb_set_mode_code("7");
//				return;
//			}
			for(String cityName : cityNames){
				if(payeeBankName.contains(cityName)){
					flag = true;
					break;
				}
			}
			if(flag){
				p.setPb_set_mode_code("1");
				p.setBank_setmode_code("1");
				p.setBank_setmode_name("同城同行");
			}else{
				p.setPb_set_mode_code("3");
				p.setBank_setmode_code("3");
				p.setBank_setmode_name("异地同行");
			}
		}else if(0 == p.getIs_same_bank()){
			for(String cityName : cityNames){
				if(payeeBankName.contains(cityName)){
					flag = true;
					break;
				}
			}
			if(flag){
				p.setPb_set_mode_code("2");
				p.setBank_setmode_code("2");
				p.setBank_setmode_name("同城跨行");
			}else{
				p.setBank_setmode_code("4");
				p.setPb_set_mode_code("4");
				p.setBank_setmode_name("异地跨行");
			}
		}
	}
	public String loadUserCode(PayVoucher p){
		//获取零余额帐号
		String account_code = p.getPay_account_no();
		String sql = "select user_code from pb_user_signzero_no where account_code=? and cis_valide = 1";
		List list = baseDao.queryForList(sql,new Object[]{account_code});
		if(list != null && list.size() > 0){
			Map userCode = (Map)list.get(0);
			return userCode.get("user_code").toString();
		}
		return null;
	}
	
	@Override
	public TransResultDTO returnPayVoucher(List<ExchangeCondition> reqconitions,final String operate_user_name,boolean is_batch)
			throws Exception {
		final Session session = new Session();
		String resMsg = "退回成功";
		int status = 0;
		List<PayVoucher> vouchers = null;
		try {
			ConditionObj obj = new ConditionObj();
			long billTypeId = Parameters.getLongParameter(PayConstant.BILL_TYPE_PAY_VOUCHER);
			//对请求条件进行分类
			final Map<String,Object> map = this.changeToConObj(reqconitions);
			vouchers = (List<PayVoucher>) loadBillsAndDetailsByObj(session,
					billTypeId, (ConditionObj) map.get("sql_fields"));
			if(vouchers == null){
				throw new Exception("查询不到对应的凭证信息");
			}
			final PayVoucher p = vouchers.get(0);
			//根据账号获取网点信息 //TODO 改为单条处理，或者按账号分批处理，需确定银行接口是否支持，农行可能会有问题（city_code谁来补充）
            Map no_map = baseDao.queryForOne("select bank_id,bank_code from pb_ele_account where account_no = '"+vouchers.get(0).getPay_account_no()+"'");
            //取不到网点信息，抛出异常
            if(no_map == null){
                throw new Exception("根据账号获取不到网点信息！");
            }
            session.setBelongOrgId(Long.valueOf(no_map.get("bank_id").toString()));
            session.setBelongOrgCode(no_map.get("bank_code").toString());//重庆农行加
			session.setCurrMenuId(-1);
			session.setTop_org(1);
			//从条件中获取退回原因，如果配置表中退回原因不能为空，校验退回原因不能为空
			int isReturnReasonNotNull=PbParameters.getIntParameter("pb.canReturnReasonNull");
			if(isReturnReasonNotNull == 1 && map.get("return_reason") == null){
				throw new Exception("退回原因不能为空");
			}
			//advance.acct.bank ,0-不根据网点过滤；1-根据网点过滤；2-没有垫支户,如果不是没有垫支户，就都进行请款操作
			final int has_advance = PbParameters.getIntParameter("advance.acct.bank");
			p.setIs_self_counter(1);//主单附上自助柜面hsq 2015年11月6日19:40:18
			PbUtil.batchSetValue(p.getDetails(), "is_self_counter", 1);
			p.setUserCode(operate_user_name);
			final List<PayVoucher> toReturnVouchers = new ArrayList<PayVoucher>();
			toReturnVouchers.add(p);
				smallTrans.newTransExecute(new ISmallTransService() {
				@Override
				public void doExecute() throws Exception {
					//直接进行支付查证
					//支付的交易类型
					p.setTrade_type(0);
					TransReturnDTO queryPayTrans = transService.queryTrans(session, p);
					int  payStatus;
					if(queryPayTrans == null){
						payStatus = TradeConstant.RESPONSESTATUS_NOTCONFIRM;
					}else{
						payStatus = queryPayTrans.getResStatus();
					}
					// 交易状态为成功和不确定transReturn2态不能退票
					if (TradeConstant.RESPONSESTATUS_SUCCESS == payStatus
							|| TradeConstant.RESPONSESTATUS_NOTCONFIRM == payStatus || TransReturnDTO.UNKNOWN == payStatus) {
						throw new Exception(p.getPay_voucher_code()+" 已支付成功或支付状态不确定，不允许退回！");
					}else{
						//支付是失败的状态
						//如果有垫支户，也可以不查询请款状态，以为核心中支付过且支付失败了，请款基本上是成功的
						if(has_advance != 2){
							
							//查询核心中请款交易是否成功
							//请款的交易类型
							p.setTrade_type(1);
							//查询逻辑进行修改，先查询转账在查询请款，如果已经转账，提示必须转账
							//如果仅仅是请款成功，则需要进行冲销
							TransReturnDTO queryReqStatus = transService.queryTrans(session, p);
							int  reqStatus;
							if(queryReqStatus == null){
								reqStatus = TradeConstant.RESPONSESTATUS_NOTCONFIRM;
							}else{
								reqStatus = queryReqStatus.getResStatus();
							}
							//请款成功
							if(reqStatus == TradeConstant.RESPONSESTATUS_SUCCESS){
								String error = payService.writeoffVoucher(session, toReturnVouchers);
                                if (StringUtil.isNotEmpty(error)) {
                                    throw new Exception(error);
                                }
							}
							
						}
					}
					returnPayVoucherNoWf(session, toReturnVouchers, map.get("return_reason")== null?"":map.get("return_reason").toString());
					try {
						//更新由自助柜面处理标识，操作人姓名信息
						baseDao.execute(UPDATE_SELFCOUNT_FLAG_SQL, new Object[] { 1, operate_user_name, p.getPay_voucher_code(),p.getAdmdiv_code(), p.getYear() });
					} catch (Exception e) {
						logger.error("凭证退回时，更新由自助柜面处理标识，操作人姓名信息出错");
					}
				}
			});
		} catch (Exception e) {
			status = 1;
			resMsg = PbUtil.getAcurateLenString(e.getMessage(), 60);
			if(is_batch){
				//如果是批量退回（建行批量退回），即使退回失败，返回的失败标识也是成功，而是在凭证里交易状态赋值为5（交易失败），并且给凭证的交易失败原因赋值
				status = 0;
				if(vouchers!=null && vouchers.size() > 0){
					vouchers.get(0).setBusiness_type(5);
					vouchers.get(0).setTrans_res_msg(resMsg);
				}
			}
		}
		TransResultDTO resultDTO = new TransResultDTO(status, vouchers,resMsg);
		return resultDTO;
	}

	@Override
	public TransResultDTO dealRefundPayVoucher(List<ExchangeCondition> reqconitions,String operate_user_name,boolean is_batch)
			throws Exception {
		String resMsg = "退款成功";
		int status = 0;
		Session session = new Session();
		session.setCurrMenuId(-1);
		session.setBusiYear(PbUtil.getCurrYear());
		session.setTop_org(1);
		List<PayVoucher> vouchers = null;
		try {
			Map<String,Object> map = this.changeToConObj(reqconitions);
			//退款交易流水号
			String trans_serial_id = map.get("trans_serial_id").toString();
			//1、录入
			//构造退款对象
			RrefundVoucherDTO rvDto = new RrefundVoucherDTO();
			//0:全单退款 1：明细退款
			rvDto.setBillRef(map.get("refund_type").equals("0")?true:false);
			//全单退款，payId取pay_voucher_id,否则取pay_request_id
			if(rvDto.isBillRef() == true){
				rvDto.setPayId(Long.valueOf(map.get("pay_voucher_id").toString()));
			}else{
				rvDto.setPayId(Long.valueOf(map.get("pay_request_id").toString()));
			}
			rvDto.setRefReason(map.get("remark").toString());
			rvDto.setRefAmount(new BigDecimal(map.get("pay_amount").toString()));
			rvDto.setIs_self_counter(2);
			//生成授权支付退款通知书
			rvDto.setPayType(1);
			//生成退款通知书
			vouchers = payService.inputRefundVoucher(session, rvDto);
			//送审退款通知书
			payService.auditPayVoucher(session, vouchers);
			//更新由自助柜面处理标识，操作人姓名信息
			baseDao.execute(UPDATE_SELFCOUNT_FLAG_SQL, new Object[]{1,operate_user_name,vouchers.get(0).getPay_voucher_code(),vouchers.get(0).getAdmdiv_code(),vouchers.get(0).getYear()});
			//更新流水表退款状态为“已提交”（1：待处理 2：已提交），根据退款流水号更新退款通知书号
			baseDao.execute("update pb_trans_serial set refund_status = ? ,refund_pay_voucher_code = ? where trans_serial_id = ?", new Object[] {2,vouchers.get(0).getPay_voucher_code(),trans_serial_id});
		} catch (Exception e) {
			logger.error("录入退款通知书失败，原因：", e);
			status = 1;
			resMsg = PbUtil.getAcurateLenString(e.getMessage(), 60);
			//如果不是批量退款，有异常抛异常
			if(!is_batch){
				throw new Exception(resMsg);
			}
		}
		TransResultDTO resultDTO = new TransResultDTO(status, vouchers,resMsg);
		return resultDTO;
	}
	/**
	 * 用于中行自助柜面的退款
	 * @param sc
	 * @param payVoucherList
	 */
	public void auditRefPayVoucher(Session sc, List<PayVoucher> payVoucherList) {
		// 如果没有需要登记的数据则直接返回
		if (ListUtils.isEmpty(payVoucherList)) {
			return;
		}
		
		IWorkflowRunService workflow =(IWorkflowRunService) StaticApplication.getBean("gap.workflowRunService");

		// 调用工作流录入，仅仅做一步工作流录入，送审在柜面中做
		workflow.createProcessInstance(sc, "PB_PAY_VOUCHER", payVoucherList, false);

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
	@Override
	public TransResultDTO dealRefundNeedMatch(List<ExchangeCondition> reqconitions,boolean is_batch)
			throws Exception {
		String resMsg = "退款成功";
		int status = 0;
		Session session = new Session();
		session.setCurrMenuId(-1);
		session.setTop_org(1);
		List<PayVoucher> vouchers = null;
		try {
			Map<String,Object> map = this.changeToConObj(reqconitions);
			//1、录入
			//构造退款对象
			RrefundVoucherDTO rvDto = new RrefundVoucherDTO();
			rvDto.setPayId(Long.valueOf(map.get("pay_voucher_id").toString()));
			rvDto.setBillRef(map.get("refund_type")==null?true:false);
			rvDto.setRefReason(map.get("remark").toString());
			rvDto.setRefAmount(new BigDecimal(map.get("pay_amount").toString()));
			rvDto.setIs_self_counter(2);
			//生成退款通知书
			vouchers = payService.inputRefundVoucher(session, rvDto);
			//送审退款通知书
			payService.auditPayVoucher(session, vouchers);
			for(PayVoucher payVoucher:vouchers){
				Map TRANS_DATE =  baseDao.queryForOne("SELECT TRANS_DATE FROM PB_TRANS_SERIAL WHERE ORI_PAY_VOUCHER_CODE='"+payVoucher.getOri_pay_voucher_code()+"'");
                payVoucher.setPay_date(PbUtil.getTimestamp(TRANS_DATE.get("TRANS_DATE").toString(),"yyyyMMdd"));
			}
			baseDao.execute(UPDATE_SELFCOUNT_FLAG_SQL, new Object[]{1,vouchers.get(0).getPay_voucher_code(),vouchers.get(0).getAdmdiv_code(),vouchers.get(0).getYear()});
			baseDao.execute("UPDATE PB_TRANS_SERIAL SET REFUND_STATUS = 2 WHERE TRANS_SERIAL_NO='"+map.get("trans_serial_no").toString()+"'");
		} catch (Exception e) {
			logger.error("录入退款通知书失败，原因：", e);
			status = 1;
			resMsg = PbUtil.getAcurateLenString(e.getMessage(), 60);
			//如果不是批量退款，有异常抛异常
			if(!is_batch){
				throw new Exception(resMsg);
			}
		}
		TransResultDTO resultDTO = new TransResultDTO(status, vouchers,resMsg);
		return resultDTO;
	}

	@Override
	public TransResultDTO loadTransLogs(List<ExchangeCondition> reqconitions,Paging page)
			throws Exception {
		Session session = new Session();
		String resMsg = "交易流水查询成功";
		//添加请求过滤条件，只保留退款流水
		//过滤出收款帐号是零余额，并且付款帐号不是垫支户的账户
		ExchangeCondition newCon1 = new ExchangeCondition("pay_account_no", 
				"(select account_no from pb_ele_account where account_type_code = '21')", 
				"not in","1", 1);
		reqconitions.add(newCon1);
		//对请求条件进行分类
		Map<String,Object> map = this.changeToConObj(reqconitions);
		ConditionObj conditionObj = (ConditionObj)map.get("sql_fields");
		List<ConditionPartObj> conditionList = conditionObj.getConditionPartObjs();
		List<ConditionPartObj> conditionlist = new ArrayList<ConditionPartObj>();
		for(ConditionPartObj condition : conditionList){
			//字段过滤，这些字段不作为查询条件查询
			if(null == condition.getKey() || "vt_code".equals(condition.getKey()) || "year".equals(condition.getKey())){
			}else{
				conditionlist.add(condition);
			}
		}
		conditionList.clear();
		conditionList.addAll(conditionlist);
		ReturnPage returnPage = loadRefundSerialByObj(session, conditionObj,page);
		return new TransResultDTO(0, returnPage);
	}
	
	@Override
	public TransResultDTO refundMatch(List<ExchangeCondition> reqconitions) throws Exception{
		Session session = new Session();
		String resMsg = "退款凭证匹配成功";
		//对请求条件进行分类
		Map<String,Object> map = this.changeToConObj(reqconitions);
		ConditionObj conditionObj = (ConditionObj)map.get("sql_fields");
		//TODO:此请求时多种类型的请求
		ReturnPage returnPage = loadRefundSerialByObj(session, conditionObj , null);
		List<RefundSerial> refundSerial =  (List<RefundSerial>) returnPage.getPageData();
		for(RefundSerial refundserial:refundSerial){
			refundserial.setOri_pay_voucher_code(map.get("pay_voucher_code").toString());
			Map map_pay_voucher =  baseDao.queryForOne("SELECT PAY_VOUCHER_ID,PAY_AMOUNT FROM PB_PAY_VOUCHER WHERE  PAY_VOUCHER_CODE='"+map.get("pay_voucher_code").toString()+"'");
		    Map no_map = baseDao.queryForOne("SELECT SUM(PAY_REFUND_AMOUNT) PAY_REFUND_AMOUNT FROM PB_PAY_REQUEST WHERE PAY_VOUCHER_ID =  '"+map_pay_voucher.get("PAY_VOUCHER_ID")+"'");
		    BigDecimal account_balance = new BigDecimal(map_pay_voucher.get("PAY_AMOUNT").toString()).subtract(new BigDecimal(no_map.get("PAY_REFUND_AMOUNT").toString()));
		    if(refundserial.getAccount_balance().compareTo(account_balance)==1){
		    	refundserial.setIs_match(1);
		    }else{
			    refundserial.setIs_match(2);
			    payService.editRefundVoucher(session, refundserial);
		    }
		}
		TransResultDTO resultDTO = new TransResultDTO(0, resMsg);
		resultDTO.setRefundSerial(refundSerial);
		return resultDTO;
	}
	
	public TransResultDTO loadDetailByCode(List<ExchangeCondition> reqConditions,Paging page){
		String resMsg = "已支付凭证明细查询成功";
		//对请求条件进行分类
		Map<String,Object> map = this.changeToConObj(reqConditions);
		ConditionObj conditionObj = (ConditionObj)map.get("sql_fields");
		List<ConditionPartObj> conditionList = conditionObj.getConditionPartObjs();
		List<ConditionPartObj> conditionlist = new ArrayList<ConditionPartObj>();
		for(ConditionPartObj condition : conditionList){
			//字段过滤，这些字段不作为查询条件查询
			if(null != condition.getKey() && !"vt_code".equals(condition.getKey()) && !"year".equals(condition.getKey())){
				conditionlist.add(condition);
			}
		}
		conditionList.clear();
		conditionList.addAll(conditionlist);
		ReturnPage returnPage = loadDetailsByCode(session, conditionObj,page);
		return new TransResultDTO(0, returnPage);
	};
	/**
	 * 根据请求报文中的条件转换为我们的查询条件
	 * @param conditions
	 * @return
	 */
	@SuppressWarnings("deprecation")
	private ConditionObj getConObj(List<ExchangeCondition> conditions){
		ConditionObj obj = new ConditionObj();
		for(ExchangeCondition exCon : conditions){
			//此处只认为是普通条件，例如：=，>,<等
			if(exCon.getIs_sql_field() == 1 && !StringUtils.isEmpty(exCon.getValue().toString())){
				obj.addConditionPartObj(new ConditionPartObj(ConditionObj.AND,
						false, exCon.getKey(), exCon.getRelation(), exCon.getValue(),
						false, false, ""));
			}
		}
		return obj;
	}
	
	private Map<String, Object> changeToConObj(List<ExchangeCondition> conditions){
		Map<String,Object> map = new HashMap<String, Object>();
		ConditionObj obj = new ConditionObj();
		for(ExchangeCondition exCon : conditions){
			if("special".equals(exCon.getKey())){
				String sql = " and " + exCon.getRelation() + " " + exCon.getValue();
				Condition pbcon = new Condition();
				pbcon.setSpecial_condition(sql);
				PbConditionPartObj pcpo = new PbConditionPartObj(pbcon);
				obj.addConditionPartObj(pcpo);
			}else if(exCon.getIs_sql_field() == 1 && !StringUtils.isEmpty(exCon.getValue().toString())){
		    	ConditionPartObj conObj = new ConditionPartObj(ConditionObj.AND,
						false, exCon.getKey(), exCon.getRelation(), exCon.getValue(),
						false, false, "");
		    	conObj.setDataType(exCon.getData_type() == null ? 0 : Integer.valueOf(exCon.getData_type()));
				obj.addConditionPartObj(conObj);
			}else if(exCon.getIs_sql_field() == 0 && !StringUtils.isEmpty(exCon.getValue().toString())){
				map.put(exCon.getKey(), exCon.getValue());
			}
		}
		//自助柜面不查询现金业务
		String cashSql = " and ((objsrc_2742.set_mode_name not like '%现付%' and objsrc_2742.set_mode_name not like '%现金%') and objsrc_2742.payee_account_no is not null and objsrc_2742.pay_mgr_name like '%正常支付%')";
		Condition pbcon = new Condition();
		pbcon.setSpecial_condition(cashSql);
		PbConditionPartObj pcpo = new PbConditionPartObj(pbcon);
		obj.addConditionPartObj(pcpo);
		map.put("sql_fields", obj);
		return map;
	}
	
	/**
	 * 设置task_id为0
	 * 有异常时
	 * @param vouchers
	 */
	public void setTaskIdToZero(List<PayVoucher> vouchers){
		List<String> updateFields = new ArrayList<String>(1);
		updateFields.add("task_id");
		for(PayVoucher p : vouchers){
			p.setTask_id(0);
			PbUtil.batchSetValue(p.getDetails(), "task_id", 0);
			billEngine.updateBill(session, updateFields, p.getDetails(), false);
		}
		billEngine.updateBill(session, updateFields, vouchers, false);
	}
	
	@Override
	public TransResultDTO loadOriPayVoucher(
			List<ExchangeCondition> reqConditions) throws Exception {
		// TODO Auto-generated method stub
		ConditionObj obj = new ConditionObj();
		//对请求条件进行分类
		Map<String,Object> map = this.changeToConObj(reqConditions);
		//TODO:此请求时多种类型的请求
		List<PayVoucher> vouchers = payService.loadPayVoucherByObj(session, (ConditionObj)map.get("sql_fields"));
		for(PayVoucher payVoucher:vouchers){
	        Map no_map = baseDao.queryForOne("SELECT SUM(PAY_REFUND_AMOUNT) PAY_REFUND_AMOUNT FROM PB_PAY_REQUEST WHERE PAY_VOUCHER_ID =  '"+payVoucher.getPay_voucher_id()+"'");
	        BigDecimal account_balance = payVoucher.getPay_amount().subtract(new BigDecimal(no_map.get("PAY_REFUND_AMOUNT").toString()));
	        payVoucher.setHold1(account_balance.toString());
		}
		TransResultDTO resultDTO = new TransResultDTO(0, vouchers);
		return resultDTO;
	}
	
	public void checkLastver(String codes[],long lastvers[],List<PayVoucher> billList ){
		Map<String,String> map = new HashMap<String,String>();
		for( int i = 0; i <codes.length; i++ ){
			map.put(codes[i], String.valueOf(lastvers[i]));
		}
		for( PayVoucher bill : billList ){
			String code = bill.getCode();
			String oriLastver = map.get(code);
			String newLastver = String.valueOf(bill.getLast_ver());
			if( !oriLastver.equals( newLastver ) ){
				throw new PbConCurrencyException("数据已经被其他用户修改，请刷新数据再试！");
			}
		}
	}
	
	/**
	 * 获取单号
	 * @param vouchers
	 * @return
	 */
	public String[] getCodes(List<PayVoucher> vouchers){
		String[] codes = new String[vouchers.size()];
		for(int i = 0 ; i < vouchers.size() ; i++ ){
			codes[i] = vouchers.get(0).getPay_voucher_code();
		}
		return codes;
	}
	
	public long[] getLastVers(List<PayVoucher> vouchers){
		long[] lastVers = new long[vouchers.size()];
		for(int i = 0 ; i < vouchers.size() ; i++ ){
			lastVers[i] = vouchers.get(0).getLast_ver();
		}
		return lastVers;
	}
	
	@Override
	public TransResultDTO getToBeConfirmedTransNum(List<ExchangeCondition> reqConditions) throws Exception {
		ConditionObj obj = new ConditionObj();
		//待办事项查询只查询待处理的业务
		ExchangeCondition newCon = new ExchangeCondition("business_type", 0, "=","1", 1);
		ExchangeCondition newCon1 = new ExchangeCondition("batchreq_status", 0, "=","1", 1);
		reqConditions.add(newCon);
		reqConditions.add(newCon1);
		//对请求条件进行分类
		Map<String,Object> map = this.changeToConObj(reqConditions);
		List<PayVoucher> returnVouchers =  new ArrayList<PayVoucher>();
		ConditionObj condition = (ConditionObj)map.get("sql_fields");
		//如果没有配置网银客户签约信息表pb_net_bank_sign，这里支付账号为空，不应该查询出数据 --start
		List<ConditionPartObj> conditionPartObjs = condition.getConditionPartObjs();
		String pay_account_no = null;
		for(ConditionPartObj partOjb:conditionPartObjs){
			if("pay_account_no".equals(partOjb.getKey())){
				pay_account_no = partOjb.getValue() == null?"":partOjb.getValue().toString();
				break;
			}
		}
		if(StringUtil.isEmpty(pay_account_no)){
			return new TransResultDTO(0, returnVouchers);
		}
		//如果没有配置网银客户签约信息表pb_net_bank_sign，这里支付账号为空，不应该查询出数据 --end
		ConditionPartObj part1 = new ConditionPartObj(ConditionObj.AND, false, "is_same_bank", ConditionObj.EQUAL,1, false, false, "");
		condition.addConditionPartObj(part1);
		int peer_count = getPayVoucherNumByObj(session, condition);
		
		condition.removeSQLObj(part1);
		ConditionPartObj part2 = new ConditionPartObj(ConditionObj.AND, false, "is_same_bank", ConditionObj.EQUAL,0, false, false, "");
		condition.addConditionPartObj(part2);
		int int_count = getPayVoucherNumByObj(session, condition);
		String queryRefundsql = "select * from PB_TRANS_SERIAL  where PAYEE_ACCOUNT_NO = ? and refund_status = 1 and PAY_ACCOUNT_NO NOT IN (select account_no from pb_ele_account where account_type_code = '21')";
		int refund_count = baseDao.getCount(queryRefundsql,new Object[]{pay_account_no});
		return new TransResultDTO(0, peer_count,int_count,refund_count);
	}
	/**
	 * 待办事项查询（带状态）
	 */
	public TransResultDTO ctjGetWaitingTaskbytransStatus(List<ExchangeCondition> reqConditions) throws Exception{
		ConditionObj obj = new ConditionObj();
		//待办事项查询只查询待处理的业务
	//	ExchangeCondition newCon = new ExchangeCondition("business_type", 0, "=","1", 1);
	//	reqConditions.add(newCon);
		//对请求条件进行分类
		Map<String,Object> map = this.changeToConObj(reqConditions);
		List<PayVoucher> returnVouchers =  new ArrayList<PayVoucher>();
		ConditionObj condition = (ConditionObj)map.get("sql_fields");
		//如果没有配置网银客户签约信息表pb_net_bank_sign，这里支付账号为空，不应该查询出数据 --start
		List<ConditionPartObj> conditionPartObjs = condition.getConditionPartObjs();
		String pay_account_no = null;
		for(ConditionPartObj partOjb:conditionPartObjs){
			if("pay_account_no".equals(partOjb.getKey())){
				pay_account_no = partOjb.getValue() == null?"":partOjb.getValue().toString();
				break;
			}
		}
		if(StringUtil.isEmpty(pay_account_no)){
			return new TransResultDTO(0, returnVouchers);
		}
		//如果没有配置网银客户签约信息表pb_net_bank_sign，这里支付账号为空，不应该查询出数据 --end
		ConditionPartObj part1 = new ConditionPartObj(ConditionObj.AND, false, "is_same_bank", ConditionObj.EQUAL,1, false, false, "");
		ConditionPartObj taskIdPart = new ConditionPartObj(ConditionObj.AND, false, "task_id", ConditionObj.EQUAL,0, false, false, "");
		condition.addConditionPartObj(taskIdPart);
		condition.addConditionPartObj(part1);
		int peer_count = getPayVoucherNumByObj(session, condition);
		
		condition.removeSQLObj(part1);
		ConditionPartObj part2 = new ConditionPartObj(ConditionObj.AND, false, "is_same_bank", ConditionObj.EQUAL,0, false, false, "");
		condition.addConditionPartObj(part2);
		int int_count = getPayVoucherNumByObj(session, condition);
		String queryRefundsql = "select * from PB_TRANS_SERIAL  where PAYEE_ACCOUNT_NO = ? and refund_status = 1 and PAY_ACCOUNT_NO NOT IN (select account_no from pb_ele_account where account_type_code = '21')";
		int refund_count = baseDao.getCount(queryRefundsql,new Object[]{pay_account_no});
		return new TransResultDTO(0, peer_count,int_count,refund_count);
	};

	public PayService getPayService() {
		return payService;
	}

	public void setPayService(PayService payService) {
		this.payService = payService;
	}

	public ISmalTrans getSmallTrans() {
		return smallTrans;
	}

	public void setSmallTrans(ISmalTrans smallTrans) {
		this.smallTrans = smallTrans;
	}

	public BaseDAO getBaseDao() {
		return baseDao;
	}

	public void setBaseDao(BaseDAO baseDao) {
		this.baseDao = baseDao;
	}

	public BillEngine getBillEngine() {
		return billEngine;
	}

	public void setBillEngine(BillEngine billEngine) {
		this.billEngine = billEngine;
	}

	public ITransService getTransService() {
		return transService;
	}

	public void setTransService(ITransService transService) {
		this.transService = transService;
	}
	@Override
	public TransResultDTO queryAccountTransDetail(List<ExchangeCondition> reqConditions) throws Exception {
		String resMsg = "客户账户明细查询成功";
		int status = 0;
		List<AccountTransDetailDTO> transDetails = null;
		List<AccountTransDetailDTO> newList = new ArrayList<AccountTransDetailDTO>();
		List<AccountTransDetailDTO> returnList = new ArrayList<AccountTransDetailDTO>();
		try {
			//操作员代码
			String user_id = null;
			//付款人账号
			String account_no = null;
			//分中心机构码:功能编码(共9位，5 位地区号＋4 位功能号)，这里取后四位
			String func_code = null;
			//交易起始日期
			String start_date = null;
			//交易终止日期
			String end_date = null;
			//起始金额
			String start_amount = null;
			//终止金额
			String end_amount = null;
			//对方户名（付款人名称）
			String pay_account_name = null;
			for(ExchangeCondition exCon : reqConditions){
				String key = exCon.getKey();
				Object value = exCon.getValue();
				String relation = exCon.getRelation();
				if("user_id".equals(key)){
					user_id = value == null ? "" : value.toString();
				}else if("pay_account_no".equals(key)){
					account_no = value == null ? "" : value.toString();
				}else if("func_code".equals(key)){
					func_code = value == null ? "" : value.toString().substring(5);
				}else if("trans_date".equals(key) && ">=".equals(relation)){
					//起始日期没有传的话，默认当前日期
					start_date = value == null ? "" : value.toString();
				}else if("trans_date".equals(key) && "<=".equals(relation)){
					//终止日期没有传的话，默认当前日期
					end_date = value == null ? "" : value.toString();
				}else if("pay_amount".equals(key) && ">=".equals(relation)){
					start_amount = value == null ? "" : value.toString();
				}else if("pay_amount".equals(key) && "<=".equals(relation)){
					end_amount = value == null ? "" : value.toString();
				}else if("pay_account_name".equals(key)){
					pay_account_name = value == null ? "" : value.toString();
				}
			}
			//起始日期和终止日期没有传的话，默认当前日期
			if(StringUtils.isEmpty(start_date)){
				start_date = PbUtil.getCurrDate();
			}
			if(StringUtils.isEmpty(end_date)){
				end_date = PbUtil.getCurrDate();
			}
			transDetails = transService.queryAccountTransDetail(session, account_no,start_date,end_date,user_id,func_code);
			for(AccountTransDetailDTO t : transDetails){
				//最后对页面部分查询要素进行内存过滤
				//TODO “开户单位”,“用途”没有匹配，返回信息里没有用途和开户单位信息
				boolean pay_amount_flag = true;
				boolean pay_account_name_flag = true;
				//对方户名（付款人名称）
				if(!StringUtils.isEmpty(pay_account_name)){
					if(t.getPay_account_name() != null && !t.getPay_account_name().contains(pay_account_name)){
						pay_account_name_flag = false;
					}
				}
				//金额
				if(!StringUtils.isEmpty(start_amount)){
					BigDecimal startAmount = new BigDecimal(start_amount);
					//借方和贷方金额比起始金额小，不符合条件
					if(t.getPay_amount().compareTo(startAmount) < 0 && t.getIncome_amount().compareTo(startAmount) < 0){
						pay_amount_flag = false;
					}
				}
				if(!StringUtils.isEmpty(end_amount)){
					BigDecimal endAmount = new BigDecimal(end_amount);
					//借方和贷方金额比终止金额大，不符合条件
					if(t.getPay_amount().compareTo(endAmount) > 0  && t.getIncome_amount().compareTo(endAmount) > 0){
						pay_amount_flag = false;
					}
				}
				if(pay_amount_flag && pay_account_name_flag){
					returnList.add(t);
				}
			}
		} catch (Exception e) {
			logger.error("客户账户明细查询失败，原因：", e);
			status = 1;
			resMsg = PbUtil.getAcurateLenString(e.getMessage(), 60);
		}
		return new TransResultDTO(status,resMsg,returnList);
	}

	@Override
	public TransResultDTO queryAccountInfo(List<ExchangeCondition> reqConditions) throws Exception {
		String resMsg = "客户信息查询成功";
		int status = 0;
		List<PbNetBankSign> netBankSigns = null;
		//网银客户号信息
		String cust_id = "";
		for(ExchangeCondition exCon : reqConditions){
			if("cust_id".equals(exCon.getKey())){
				cust_id = exCon.getValue() == null ? "" : exCon.getValue().toString();
			}
		}
		StringBuffer queryBuffer = new StringBuffer();
		queryBuffer.append("select * from pb_net_bank_sign where 1 = 1");
		if(!StringUtils.isEmpty(cust_id)){
			queryBuffer.append(" and cust_id = '" + cust_id + "'");
		}
		try {
			netBankSigns = baseDao.queryForList(queryBuffer.toString(),new ComplexMapper(PbNetBankSign.class));
		} catch (Exception e) {
			logger.error("客户信息查询失败，原因：", e);
			status = 1;
			resMsg = PbUtil.getAcurateLenString(e.getMessage(), 60);
		}
		return new TransResultDTO(netBankSigns,status,resMsg);
	}

	@Override
	public TransResultDTO queryLinkedAccount(List<ExchangeCondition> reqConditions) throws Exception {
		String resMsg = "关联账号查询成功";
		int status = 0;
		List<PbNetBankSign> accounts = null;
		//最终返回的账户信息
		List<PbNetBankSign> returnAccounts = new ArrayList<PbNetBankSign>();
		//网银客户号信息
		String cust_id = "";
		String user_id = "";
		//关联账号
		String account_no = null;
		//户名
		String account_name = null;
		//开户单位
		String dep_pro_name = null;
		//起始金额
		String begin_amount = null;
		//终止金额
		String end_amount = null;
		//分中心机构码:功能编码(共9位，5 位地区号＋4 位功能号)，这里取后四位
		String func_code = null;
		for(ExchangeCondition exCon : reqConditions){
			String key = exCon.getKey();
			Object value = exCon.getValue();
			String relation = exCon.getRelation();
			if("cust_id".equals(key)){
				cust_id = value == null ? "" : value.toString();
			}else if("account_no".equals(key)){
				account_no = value == null ? "" : value.toString();
			}else if("account_name".equals(key)){
				account_name = value == null ? "" : value.toString();
			}else if("dep_pro_name".equals(key)){
				dep_pro_name = value == null ? "" : value.toString();
			}else if("account_balance".equals(key) && ">=".equals(relation)){
				begin_amount = value == null ? "" : value.toString();
			}else if("account_balance".equals(key) && "<=".equals(relation)){
				end_amount = value == null ? "" : value.toString();
			}else if("user_id".equals(key)){
				user_id = value == null ? "" : value.toString();
			}else if("func_code".equals(key)){
				func_code = value == null ? "" : value.toString().substring(5);
			}
		}
		//查询sql
		StringBuffer queryBuffer = new StringBuffer();
		queryBuffer.append("select * from pb_net_bank_sign where 1 = 1");
		if(!StringUtils.isEmpty(cust_id)){
			queryBuffer.append(" and cust_id = '" + cust_id + "'");
		}
		if(!StringUtils.isEmpty(account_no)){
			queryBuffer.append(" and account_no = '" + account_no + "'");
		}
		if(!StringUtils.isEmpty(account_name)){
			queryBuffer.append(" and account_name like '%" + account_name + "%'");
		}
		if(!StringUtils.isEmpty(dep_pro_name)){
			queryBuffer.append(" and dep_pro_name like '%" + dep_pro_name + "%'");
		}
		try {
			accounts = baseDao.queryForList(queryBuffer.toString(),new ComplexMapper(PbNetBankSign.class));
			PayVoucher voucher = new PayVoucher();
			//操作员号代码
			session.setUserId(Long.valueOf(user_id));
			//分中心机构码
			voucher.setFuncCode(func_code);
			BigDecimal beginAmount = StringUtils.isEmpty(begin_amount)?null:new BigDecimal(begin_amount);
			BigDecimal endAmount = StringUtils.isEmpty(end_amount)?null:new BigDecimal(end_amount);
			for(PbNetBankSign account : accounts){
				String sql = "select u.code from gap_user u,pb_ele_account t where t.account_no = '"+account.getAccount_no()+"' and u.belong_org = t.bank_id and rownum = 1";
				Map userCode = baseDao.queryForOne(sql);
				session.setUserCode(userCode.get("code").toString());
				voucher.setPay_account_no(account.getAccount_no());
				voucher.setAdmdiv_code(account.getAdmdiv_code());
				voucher.setPay_account_code("12");
				BigDecimal acctBalance = transService.queryAcctBalance(session,voucher);
				account.setAccount_balance(acctBalance);
				//如果起始金额比查出来的余额大，或者终止金额比查出来的余额小，不返回此条账户信息
				if((beginAmount!=null && beginAmount.compareTo(acctBalance)>0) || (endAmount!=null && endAmount.compareTo(acctBalance)<0)){
					continue;
				}
				returnAccounts.add(account);
			}
		} catch (Exception e) {
			logger.error("关联账号查询失败，原因：", e);
			status = 1;
			resMsg = PbUtil.getAcurateLenString(e.getMessage(), 60);
		}
		return new TransResultDTO(returnAccounts,status,resMsg);
	}

	@Override
	public TransResultDTO cancelRefundVoucher(List<ExchangeCondition> reqconitions) throws Exception {
		String pay_voucher_code = null;
		session.setCurrMenuId(-1);
		session.setTop_org(1);
		for(ExchangeCondition exCon : reqconitions){
			String key = exCon.getKey();
			Object value = exCon.getValue();
			if("pay_voucher_code".equals(key)){
				pay_voucher_code = value == null ? "" : value.toString();
			}
		}	
		List<PayVoucher> vouchers = null;
		// 获取主单单据类型ID
		long billTypeId = Parameters.getLongParameter(BILL_TYPE_PAY_VOUCHER);
		String resMsg = "退款申请作废成功";
		int status = 0;
		//对请求条件进行分类
		Map<String,Object> map = this.changeToConObj(reqconitions);
		try {
			vouchers = (List<PayVoucher>) loadBillsAndDetailsByObj(session, billTypeId,
					(ConditionObj) map.get("sql_fields"));
			this.checkLastver(getCodes(vouchers),new long[]{Long.valueOf(map.get("last_ver").toString())},vouchers);
			//已经退款，无法取消退款申请
			if (vouchers.get(0).getBusiness_type() == 1) {
				throw new Exception("已经退款，无法作废退款申请！");
			} else {
				//删除退款凭证
				payService.invalidateRefundVoucher(session,vouchers,1);
				//更新流水表退款状态为“待处理”（1：待处理 2：已提交）,删除退款凭证单号
				baseDao.execute("update pb_trans_serial set refund_status = ? ,refund_pay_voucher_code = ? where refund_pay_voucher_code = ?", new Object[] {1,"",pay_voucher_code});
			}
		} catch (Exception e) {
			resMsg = e.getMessage();
			status = 1;
			throw new Exception(resMsg);
		}
		TransResultDTO resultDTO = new TransResultDTO(status, vouchers,resMsg);
		return resultDTO;	
	}
	
	/**
	 * 
	     * 此方法描述的是：  根据证书参考号，返回账户的签约信息
	     * @author: 张春蕾 
	     * @version: 2014-11-25 上午10:28:45
	 */
	@Override
	public TransResultDTO loadUserSignzero(List<ExchangeCondition> reqConditions){
		Map<String,Object> map = this.changeToConObj(reqConditions);
		String cert_ref_no = map.get("cert_ref_no").toString();
		String password = map.get("user_password").toString();
		String userLoginCode = map.get("user_login_code").toString();
		String sql = "select * from pb_user_signzero_no where cert_ref_no = ? and cis_valide = 1";
		RowMapper r = new RowMapper(){ public Object mapRow(ResultSet rs,
				             int rowNum) throws SQLException { UserSignZeroNo usz = new UserSignZeroNo();
				             usz.setAccount_code(rs.getString("account_code"));
				             usz.setUser_name(rs.getString("user_name"));
				             usz.setSign_name(rs.getString("sign_name"));
				             usz.setUser_login_code(rs.getString("user_login_code"));
				             usz.setUser_password(rs.getString("user_password"));
				             usz.setUser_role(Long.parseLong(rs.getString("user_role")));
				             return usz;} 
					};
		List<UserSignZeroNo> userSignzeroList = (List<UserSignZeroNo>)baseDao.queryForList(sql,new Object[]{cert_ref_no},r);
		if(userSignzeroList.size() > 0){
			UserSignZeroNo uszn = userSignzeroList.get(0);
			if(userLoginCode == uszn.getUser_login_code() || userLoginCode.equals(uszn.getUser_login_code())){
				if(password == uszn.getUser_password() || password.equals(uszn.getUser_password())){
					TransResultDTO resultDao = new TransResultDTO(0,"");
					resultDao.setUserSignzeroList(userSignzeroList);
					return resultDao;
				}else{
					return new TransResultDTO(1,"您输入的密码错误");
				}
			}else{
				return new TransResultDTO(1,"用户编码与Ueky信息不符");
			}
		}else{
			return new TransResultDTO(1,"该用户下未查询到可用签约账户");
		}
	}
	/**短信验证版
	 * 自助柜面通过用户名、密码登录验证
	 */
	public TransResultDTO checkLoginByLoginCodePwd(List<ExchangeCondition> reqConditions) throws Exception {
		Map<String,Object> map = this.changeToConObj(reqConditions);
		String userLoginCode = map.get("userLoginCode").toString();
		String userPassword = map.get("userPassword").toString();
		String querySql =  "select * from pb_user_signzero_no where user_login_code = ? and cis_valide = 1";
		RowMapper rm = new RowMapper(){ 
			public Object mapRow(ResultSet rs,int rowNum) throws SQLException { 
				UserSignZeroNo usz = new UserSignZeroNo();
				usz.setSign_id(rs.getLong("sign_id"));
	            usz.setAccount_code(rs.getString("account_code"));
	            usz.setAgency_code(rs.getString("agency_code"));
	            usz.setUser_name(rs.getString("user_name"));
	            usz.setUser_login_code(rs.getString("user_login_code"));
	            usz.setUser_password(rs.getString("user_password"));
	            usz.setLast_login_date(rs.getTimestamp("last_login_date"));
	            usz.setLogin_fail_num(rs.getInt("login_fail_num"));
	            usz.setLast_login_succ_date(rs.getTimestamp("last_login_succ_date"));
	            usz.setIs_edit_pwd(rs.getInt("is_edit_pwd")); 
	            return usz;
	         } 
		};
		List<UserSignZeroNo> userSignzeroList = (List<UserSignZeroNo>)baseDao.queryForList(querySql,new Object[]{userLoginCode},rm);
		if(userSignzeroList.size() > 0){
			UserSignZeroNo uszn = userSignzeroList.get(0);
			//验证当天密码错误次数超过3次，不能登录
			long signId = uszn.getSign_id();
			int loginFailNum = uszn.getLogin_fail_num();
			Timestamp lastLoginDate = uszn.getLast_login_date();
			Timestamp lastLoginSuccDate = uszn.getLast_login_succ_date();
			Date d = new Date();
			if(loginFailNum >=3){
				if(lastLoginDate.getDate()==d.getDate()&&lastLoginDate.getMonth()==d.getMonth()&&lastLoginDate.getYear()==d.getYear()){
					//TODO:保存登录失败时间
					return new TransResultDTO(1,"今天密码错误次数达到3次，账户已锁定，请明天登录");
				}else{
					baseDao.execute("update pb_user_signzero_no set login_fail_num=?,last_login_date=? where sign_id=? ", new Object[]{0,new Timestamp(System.currentTimeMillis()),signId});
					loginFailNum =0; 
				}
			}
			//验证密码是否通过
			if(!userPassword.equals(uszn.getUser_password())){
				//保存登录失败时间，和登录次数
				baseDao.execute("update pb_user_signzero_no set login_fail_num=?,last_login_date=? where sign_id=? ", new Object[]{loginFailNum+1,new Timestamp(System.currentTimeMillis()),signId});
				return new TransResultDTO(1,"登录密码错误，请重新输入");
			}
			//验证通过返回签约信息
			//TODO:保存登录成功时间
			TransResultDTO resultDao = new TransResultDTO(0,"");
			resultDao.setUserSignzeroList(userSignzeroList);
			return resultDao;
		}else{
			return new TransResultDTO(1,"登录失败，未查到有效的操作员代码");
		}
	}
			
	/**
	 * 自助柜面登陆验证
	 */
	@Override
	public TransResultDTO checkLoginForDefault(
			List<ExchangeCondition> reqConditions) throws Exception {
		Map<String,Object> map = this.changeToConObj(reqConditions);
		String agency_code = map.get("agency_code").toString();
		String userLoginCode = map.get("userLoginCode").toString();
		String userPassword = map.get("userPassword").toString();
		String querySql =  "select * from pb_user_signzero_no where user_login_code = ? and cis_valide = 1";
		RowMapper rm = new RowMapper(){ public Object mapRow(ResultSet rs,
	             int rowNum) throws SQLException { UserSignZeroNo usz = new UserSignZeroNo();
	             usz.setAccount_code(rs.getString("account_code"));
	             usz.setAgency_code(rs.getString("agency_code"));
	             usz.setUser_name(rs.getString("user_name"));
	             usz.setUser_name(rs.getString("sign_name"));
	             usz.setUser_login_code(rs.getString("user_login_code"));
	             usz.setUser_password(rs.getString("user_password"));
	             return usz;} 
		};
		List<UserSignZeroNo> userSignzeroList = (List<UserSignZeroNo>)baseDao.queryForList(querySql,new Object[]{userLoginCode},rm);
		if(userSignzeroList.size() > 0){
			UserSignZeroNo uszn = userSignzeroList.get(0);
			//验证密码是否通过
			if(!userPassword.equals(uszn.getUser_password())){
				return new TransResultDTO(1,"登录密码错误，请重新输入");
			}
			//验证客户号是否一致
			if(!agency_code.equals(uszn.getAgency_code())){
				return new TransResultDTO(1,"客户号与操作员不一致，请检查");
			}
			//验证通过返回签约信息
			TransResultDTO resultDao = new TransResultDTO(0,"");
			resultDao.setUserSignzeroList(userSignzeroList);
			return resultDao;
		}else{
			return new TransResultDTO(1,"登录失败，未查到有效的操作员代码");
		}
	}
	/**
	 * 初审
	 */
	public TransResultDTO verifyTrans(List<ExchangeCondition> reqconitions){
		Map<String,Object> map = this.changeToConObj(reqconitions);
		String sql1 = "update pb_pay_voucher set business_type=8 , is_self_counter = 1 where pay_voucher_code= ? and last_ver = ?";
		String sql2 = "update pb_pay_voucher set payee_account_bank_no = ? , business_type=8 , is_self_counter = 1  where pay_voucher_code= ? and last_ver = ?";
		String payVoucherCode = map.get("pay_voucher_code").toString();
		//数据库版本号
		String lastVer = map.get("last_ver").toString();
		String isSameBank = map.get("is_same_bank").toString();
		String payeeAccountBankNo = map.get("payee_account_bank_no").toString();
		int resultNum = 0;
		//如果为跨行初审，则补录行号
		if("1" == isSameBank || "1".equals(isSameBank)){
			resultNum = baseDao.execute(sql1, new Object[]{payVoucherCode,lastVer});
		}else if("0" == isSameBank || "0".equals(isSameBank)){
			resultNum = baseDao.execute(sql2, new Object[]{payeeAccountBankNo,payVoucherCode,lastVer});
		}
		if(resultNum < 1){
			return new TransResultDTO(1,"数据已被其他用户修改");
		}
		//返回已更新的凭证
		ConditionObj conditionObj = new ConditionObj();
		List<ConditionPartObj> conditionList = conditionObj.getConditionPartObjs();
		ConditionPartObj refund_status = new ConditionPartObj(ConditionObj.AND,
				false, "pay_voucher_code", "=", payVoucherCode,false, false, "");
		conditionList.add(refund_status);
		List<PayVoucher> vouchers = payService.loadPayVoucherByObj(session, conditionObj);
		return new TransResultDTO(0,vouchers);
	}
	
	/**
	 * 获取单位编码
	 */
	public TransResultDTO loadAgencyCode(List<ExchangeCondition> reqconitions){
		Map<String,Object> map = this.changeToConObj(reqconitions);
		String cert_ref_no = map.get("cert_ref_no").toString();
		String sql = "select AGENCY_CODE,USER_LOGIN_CODE from pb_user_signzero_no where cert_ref_no = ? and cis_valide = 1";
		List<Map> agencyCodeList = baseDao.queryForList(sql,new Object[]{cert_ref_no});
		if(agencyCodeList.size() <= 0){
			return new TransResultDTO(1,"该证书未查到签约有效签约用户");
		}else{
			TransResultDTO resultDto = new TransResultDTO(0,"");
			resultDto.setAgency_code(agencyCodeList.get(0).get("agency_code").toString());
			resultDto.setUser_login_code(agencyCodeList.get(0).get("user_login_code").toString());
			return resultDto;
		}
	};
	
	/**
	 * 修改密码
	 */
	public TransResultDTO modifyPassword(List<ExchangeCondition> reqconitions){
		Map<String,Object> map = this.changeToConObj(reqconitions);
		String cert_ref_no = map.get("cert_ref_no").toString();
		String userPassword = map.get("userPassword").toString();
		String newPassword = map.get("newPassword").toString();
		String sql = "select user_password from pb_user_signzero_no  where cert_ref_no = ? and cis_valide = 1";
		String modifysql = "update pb_user_signzero_no set user_password = ? where cert_ref_no = ? and cis_valide = 1";
		List<Map> agencyCodeList = baseDao.queryForList(sql,new Object[]{cert_ref_no});
		if(agencyCodeList.size() <= 0){
			return new TransResultDTO(1,"该证书未查到签约有效签约用户");
		}else{
			if(userPassword.equals(agencyCodeList.get(0).get("user_password").toString())){
				baseDao.execute(modifysql, new Object[]{newPassword,cert_ref_no});
				return new TransResultDTO(0,"修改成功");
			}else{
				return new TransResultDTO(1,"您输入的原始密码不正确");
			}
		}
	};
	
	/**
	 * @todo 如果失败需要进行冲销
	 */
	@Override
	public TransResultDTO acceptPayVoucherFailToWriteoff(
			List<ExchangeCondition> reqconitions, String operate_user_name,
			boolean b) {
		// 获取主单单据类型ID
		long billTypeId = Parameters.getLongParameter(BILL_TYPE_PAY_VOUCHER);
		
		String resMsg = "确认成功";
		
		int status = 0;
		PayVoucher p = null;
		List<PayVoucher> vouchers = null;
		String payee_account_no = null;
		String payee_account_name = null;
		String payee_account_bank = null;
		//对请求条件进行分类
		final Map<String,Object> map = this.changeToConObj(reqconitions);
		try{
			vouchers = (List<PayVoucher>) loadBillsAndDetailsByObj(session,billTypeId, (ConditionObj)map.get("sql_fields"));
			if(vouchers == null){
				throw new Exception("查询不到对应的凭证信息");
			}
			p = vouchers.get(0);
			//同行转账时收款人联行号为空
			if(map.get("payee_account_bank_no") != null){//TODO 修改更新收款人行号逻辑，多条时，报文规范的传法
				String payee_account_bank_no = map.get("payee_account_bank_no").toString();
				//更新付款行联行号
				PbUtil.batchSetValue(vouchers, "payee_account_bank_no", payee_account_bank_no);
			}
			if( ListUtils.isEmpty(vouchers) ){
				throw new Exception("所选数据可能已被其他人员确认，请刷新界面！");
			}
			//黑龙江建行批量转账时，不传版本号信息
			if(map.get("last_ver") != null){
				this.checkLastver(getCodes(vouchers),new long[]{Long.valueOf(map.get("last_ver").toString())},vouchers);
			}
		
			//根据账号获取网点信息 //TODO 改为单挑处理，或者按账号分批处理，需确定银行接口是否支持，农行可能会有问题（city_code谁来补充）
			Map no_map = baseDao.queryForOne("select bank_id,bank_code from pb_ele_account where account_no = '"+vouchers.get(0).getPay_account_no()+"'");
			//取不到网点信息，抛出异常
			if(no_map == null){
				throw new Exception("根据账号获取不到网点信息！");
			}
			session.setBelongOrgId(Long.valueOf(no_map.get("bank_id").toString()));
			session.setBelongOrgCode(no_map.get("bank_code").toString());//重庆农行加
			session.setTop_org(1);
			if(map.get("teller") != null){ //TODO 广西中行设置虚拟柜员号 
				session.setUserCode(map.get("teller").toString());
			}
			
			if(p.getPayee_account_no() != null&&p.getPayee_account_no().length() == 16 && !(p.getPayee_account_no().charAt(0) == 9)){ //判断是公务卡交易广西用到
				p.setBank_setmode_code("8");
			}
			
			PbUtil.batchSetValue(p.getDetails(), "is_self_counter", 1);
			//如果是重庆三峡银行，设置支付凭证的操作员
			//根据支付凭证零余额帐号，查询用户签约信息中的虚拟柜员，用于转账
			String bank = PropertiesHander.getValue("trans", "TransInterface");
			if("SanXia".equals(bank)){//TODO 如下代码会导致凭证库发送时候，会导致原文篡改，然后发送失败
				p.setUserCode(loadUserCode(p));
			}
			if(map.get("mobilePhone")!=null){
				p.setHold2(map.get("mobilePhone").toString());
			}
			if(map.get("email")!=null){ 
				p.setHold3(map.get("email").toString());
			}
			p.setHold4("2");
			payee_account_no = p.getPayee_account_no();
			payee_account_name = p.getPayee_account_name();
			payee_account_bank = p.getPayee_account_bank();
			//调用柜面提供的凭证确认接口
			acceptPayVoucherForSelfCounterFailToWriteoff(session, p);
			
		} catch (Exception e) {
			status = 1;
			resMsg = PbUtil.getAcurateLenString(e.getMessage(), 60);
			//如果是批量转账（建行批量转账），即使转账失败，返回的失败标识也是成功，而是在凭证里交易状态赋值为5（交易失败），并且给凭证的交易失败原因赋值
			if(p!=null){
				//交易失败
				p.setTrans_succ_flag(2);
				p.setTrans_res_msg(resMsg);
				p.setReturn_reason(resMsg);
				p.setPayee_account_no(payee_account_no);
				p.setPayee_account_name(payee_account_name);
				p.setPayee_account_bank(payee_account_bank);
			}
		}
		TransResultDTO resultDTO = new TransResultDTO(status,vouchers,resMsg);
		return resultDTO;
	}
	/**
	 * @todo 建行自助柜面查询不同状态下的凭证的数量
	 * 主要用于建行分页
	 * @author 柯伟
	 */
	@Override
	public TransResultDTO getDifferentTypeTransNum(
			List<ExchangeCondition> reqConditions) {
		ConditionObj obj = new ConditionObj();
		String business_type = null;
		for(ExchangeCondition exCon : reqConditions){
			if("business_type".equals(exCon.getKey())){
				business_type = exCon.getValue() == null?"":exCon.getValue().toString();
				break;
			}
		}
		if(StringUtil.isEmpty(business_type)){
			ExchangeCondition newCon = new ExchangeCondition("business_type", 0, "=","1", 1);
			reqConditions.add(newCon);
		}
		Map<String,Object> map = this.changeToConObj(reqConditions);
		List<PayVoucher> returnVouchers =  new ArrayList<PayVoucher>();
		ConditionObj condition = (ConditionObj)map.get("sql_fields");
		List<ConditionPartObj> conditionPartObjs = condition.getConditionPartObjs();
		String pay_account_no = null;
		for(ConditionPartObj partOjb:conditionPartObjs){
			if("pay_account_no".equals(partOjb.getKey())){
				pay_account_no = partOjb.getValue() == null?"":partOjb.getValue().toString();
				break;
			}
		}
		if(StringUtil.isEmpty(pay_account_no)){
			return new TransResultDTO(0, returnVouchers);
		}
		int peer_count = getPayVoucherNumByObj(session, condition);
		int int_count = getPayVoucherNumByObj(session, condition);
		String queryRefundsql = "select * from PB_TRANS_SERIAL  where PAYEE_ACCOUNT_NO = ? and refund_status = 1 and PAY_ACCOUNT_NO NOT IN (select account_no from pb_ele_account where account_type_code = '21')";
		int refund_count = baseDao.getCount(queryRefundsql,new Object[]{pay_account_no});
		return new TransResultDTO(0, peer_count,int_count,refund_count);
	}

  /**
   * 重庆中行根据客户号查询该客户号下的所有支付账号
 * @param <serSignZeroNo>
   */
	@Override
	public  TransResultDTO queryPayAccountByClientId(
			List<ExchangeCondition> reqConditions) {
		
		Map<String,Object> map = this.changeToConObj(reqConditions);
		//获取客户号
		String client_id= map.get("agency_code") == null?"":map.get("agency_code").toString();
		
		String sql = "select * from pb_user_zerono_property where customno=? and  isvalide  = 1";
		
		List<UserSignZeroNo> accList = (List<UserSignZeroNo>) baseDao.queryForList(sql, new Object[] {client_id},
			new RowMapper() {
				public Object mapRow(ResultSet rs, int rowNum)
						throws SQLException {
                    UserSignZeroNo usz=new UserSignZeroNo();
					
					usz.setAccount_code(rs.getString("accountcode"));
					
					usz.setAccount_name(rs.getString("accountname"));
					
					return usz;

				}
			});
		if(accList.size() <= 0){
			return new TransResultDTO(1,"该客户号无可用签约账户信息!");
		}else{
			TransResultDTO resultDao = new TransResultDTO(0);
			resultDao.setUserSignzeroList(accList);
			return resultDao;
		}
	}
	/**
	 * 中行自助柜面查询客户签约信息并返回默认零余额账户
	 * @author zbh
	 * */
	@Override
	public TransResultDTO loadUserSignzeroBOC(List<ExchangeCondition> conditions) {
		Map<String,Object> map = this.changeToConObj(conditions);
		String cst_no = map.get("cst_no").toString();
//		String user_no = map.get("user_no").toString();
		String querySql =  "select a.customname  custname," + " "+
							       "a.signname   sign_name," + " "+
							       "a.accountcode accountcode," + " "+
							       "c.account_name accountname," + " "+
							       "c.admdiv_code   admdiv_code" + " "+
							       "from pb_user_zerono_property a, pb_ele_account c "+
							  "where a.accountcode = c.account_no "+
							 "and a.customno = ?" + " "+
//去掉默认支付账户功能		   "and a.defaultaccount = '1'" + " "+   
							   "and a.isvalide = '1'" ;		
		RowMapper rm = new RowMapper(){ public Object mapRow(ResultSet rs,
	             int rowNum) throws SQLException { UserSignZeroNo usz = new UserSignZeroNo();
	             	usz.setAccount_name(rs.getString("accountname"));
	             	usz.setUser_name(rs.getString("custname"));
	             	usz.setSign_name(rs.getString("sign_name"));
	             	usz.setAccount_code(rs.getString("accountcode"));
	             	usz.setUser_role(1);
	             	usz.setAdmdiv_code(rs.getString("admdiv_code"));
	             return usz;} 
		};
		List<UserSignZeroNo> userSignzeroList = (List<UserSignZeroNo>)baseDao.queryForList(querySql,new Object[]{cst_no},rm);
		if(userSignzeroList.size() > 0){
			UserSignZeroNo uszn = userSignzeroList.get(0);
			TransResultDTO resultDao = new TransResultDTO(0,"");
			resultDao.setUserSignzeroList(userSignzeroList);
			return resultDao;
		}else{
			return new TransResultDTO(1,"用户未签约");
		}
	}
	/**短信验证版
	 * 签约用户信息修改
	 * @param reqConditions
	 * @return
	 * @throws Exception
	 */
	@Override
	public TransResultDTO editSignZeroUserSms(List<ExchangeCondition> reqConditions) throws Exception {
		Map<String,Object> map = this.changeToConObj(reqConditions);
		String signId= (String)map.get("signId");
		String userLoginCode = (String)map.get("userLoginCode");
		String userPassword = (String)map.get("userPassword");
		//验证用户名是否重复
		Object tempObj = baseDao.queryForOne("select 1 from PB_USER_SIGNZERO_NO where user_login_code= ? and sign_id !=? ",new Object[]{userLoginCode,signId});
		if(tempObj!=null){
			throw new RuntimeException("该用户代码已存在，请重新输入"); 
		}
		//修改用户信息
		baseDao.execute("update pb_user_signzero_no set user_login_code=?,user_password=?,is_edit_pwd=?,login_fail_num=?  where sign_id=? ", new Object[]{userLoginCode,userPassword,0,0,signId});
		return new TransResultDTO(0,"修改用户信息成功");
	}

	/**
	 * 发送短信验证码
	 * @param reqConditions
	 * @return
	 * @throws Exception
	 */
	@Override
	public TransResultDTO sendSmsCode(List<ExchangeCondition> reqConditions)
			throws Exception {
		Map<String, Object> map = this.changeToConObj(reqConditions);
		String signId = (String) map.get("signId");
		String verifyCode = (String) map.get("smsCode");
		UserSignZeroNo dto = (UserSignZeroNo) baseDao.queryForOneObject("select * from pb_user_signzero_no where sign_id = ?",
				new Object[] { signId },new ComplexMapper(UserSignZeroNo.class));
		//发送短信
		String content = String.format("【柜面系统】 %1$s，验证码:%2$s,打死都不能告诉别人",dto.getUser_login_code(),verifyCode);
		SmsClient.sendMessage(dto.getPhone_no(), content);
		return new TransResultDTO(0, "发送短信成功");
	}
	/**
	 * 跨行转账，与行号相关查询
	 * @param reqConditions
	 * @param page
	 * @return
	 */
	public TransResultDTO queryBankRelation(List<ExchangeCondition> reqConditions,Paging page)
	{
		Map<String, Object> map = this.changeToConObj(reqConditions);
		List<BankNoDTO> bankRelations=null;
		String sql="";
		Object parameters[]=new Object[]{};
	
		//query_kind 1查行别，2查省份，3查城市代码，4查行号
		if("1".equals(map.get("query_kind"))){
			sql="select * from pb_bank_kind ";
		}
		if("2".equals(map.get("query_kind"))){
			sql="select code,name from pb_city_code where leavel_code='0' order by name asc";
		}
		if("3".equals(map.get("query_kind"))){
			sql="select code,name from pb_city_code where parent_code=? order by name asc";
			parameters=new Object[] {map.get("query_para")};
		}
		if("4".equals(map.get("query_kind"))){
			sql="select bank_no,bank_name from pb_bank_no where 1=1 ";
			if(map.get("bank_type")!=null&&!"".equals(map.get("bank_type")))
			{
				sql=sql+" and bank_type= '"+map.get("bank_type")+"' ";
				
			}
			if(map.get("city_code")!=null&&!"".equals(map.get("city_code")))
			{
				sql=sql+" and city_code= '"+map.get("city_code")+"'";
			}else if(map.get("province_code")!=null&&!"".equals(map.get("province_code")))
			{
				sql=sql+" and city_code in (select code from pb_city_code where parent_code = '"+map.get("province_code")+"' )";
			}
			if(map.get("payee_account_bank_name")!=null&&!"".equals(map.get("payee_account_bank_name")))
			{
				try {
					sql=sql+" and bank_name like '%"+map.get("payee_account_bank_name")+"%'";
				} catch (Exception e) {
					e.printStackTrace();
				}
			}
			if(map.get("bank_no")!=null&&!"".equals(map.get("bank_no")))
			{
				sql=sql+" and bank_no = '"+map.get("bank_no")+"'";
			}
			int totalRows = baseDao.getCount(sql, parameters);
			page.setDataCount(totalRows);
			int startIndex=page.getStartIndex();
			int endIndex=0;
			if(startIndex>0)
			{
				endIndex=startIndex+page.getNowPageNo();
			}
			else
			{
				startIndex=(page.getNowPage()-1)*page.getNowPageNo();
				endIndex=page.getNowPage()*page.getNowPageNo();
			}
			StringBuffer sb = new StringBuffer();
			sb.append("select * from ( select rownum as r, tab.*  from ( ").append(
					sql).append(" ) tab ) row_ where row_.r > ").append(
					page.getStartIndex()).append(" and row_.r <= ").append(endIndex);
			bankRelations = baseDao.queryForList(sb.toString(), parameters,
					new ComplexMapper(BOCBankNoDTO.class));
		}else{
			page.setNowPageNo(1);
			bankRelations = baseDao.queryForList(sql, parameters,
					new ComplexMapper(BOCBankNoDTO.class));
		}
		TransResultDTO transResult=new TransResultDTO(0);
		transResult.setPageData(new  ReturnPage(bankRelations, page));
		transResult.setList(bankRelations);
		return transResult;
	}
	
	/**
	 * 关联账户交易明细查询
	 * @param reqConditions
	 * @param page
	 * @return
	 * @throws Exception 
	 */
	public TransResultDTO queryAcctTradeDetails(List<ExchangeCondition> reqConditions,Paging page) throws Exception
	{
		TransResultDTO transResult=new TransResultDTO(0);
		Map<String, Object> map = this.changeToConObj(reqConditions);
		BocQueryTradeDetailsDTO queryDto=new BocQueryTradeDetailsDTO();
		queryDto.setAcct_no(trimNull(map.get("relate_accno")));
		queryDto.setAcct_name(trimNull(map.get("acc_name")));
		queryDto.setOpen_unit_name(trimNull(map.get("open_unit_name")));
		queryDto.setUser_summary(trimNull(map.get("user_summary")));
		queryDto.setTrade_begin_date(trimNull(map.get("start_date")));
		queryDto.setTrade_end_date(trimNull(map.get("end_date")));
		queryDto.setMax_amount(trimNull(map.get("max_amount")));
		queryDto.setMin_amount(trimNull(map.get("min_amount")));
		//翻页等银行回复
//		queryDto.setPage_flag1("0");
//		queryDto.setPage_flag2("0");
//		queryDto.setPage_flag3("0");
//		queryDto.setPage_flag4("0");
//		queryDto.setPage_flag5("0");
		List list=transService.querySerial(session, queryDto);
		transResult.setList(list);
		return transResult;
	}
	/**
	 * 将null Object对象转换为空字符串
	 * @param object
	 * @return
	 */
	public String trimNull(Object object)
	{
		return object==null?" ":object.toString();
	}
	/**
	 * 查询关联账户信息
	 * @param reqConditions
	 * @param page
	 * @return
	 * @throws Exception 
	 */
	public TransResultDTO queryRelationAcct(List<ExchangeCondition> reqConditions,Paging page) throws Exception
	{
		TransResultDTO transResult=new TransResultDTO(0);
		Map<String, Object> map = this.changeToConObj(reqConditions);
		BigDecimal min_amount=map.get("min_amount")==null?new BigDecimal(0):(BigDecimal) map.get("min_amount");
		BigDecimal max_amount=map.get("max_amount")==null?new BigDecimal(-1):(BigDecimal) map.get("max_amount");
		Object paras[]=null;
		/**
		 * 1.先查关联账户表查出零余额下挂的关联账户
		 * 2.根据关联账户调接口查询账户信息
		 * 3.更新关联账户表相应账户的余额
		 * 4.按查询条件过滤金额范围，并返回符合条件的账号信息
		 */
		String sql="select * from pb_relation_acct where 1=1 and acct_no= '"+map.get("pay_account_no")+"'";
		if(map.get("relate_accno")!=null&&!"".equals(map.get("relate_accno")))
		{
			sql=sql+" and relate_accno='"+map.get("relate_accno")+"' ";
		}
		if(map.get("relate_acc_name")!=null&&!"".equals(map.get("relate_acc_name")))
		{
			sql+=" and relate_acc_name='"+map.get("relate_acc_name")+"'";
		}
		if(map.get("open_unit_name")!=null&&!"".equals(map.get("open_unit_name")))
		{
			sql+=" and open_unit_name='"+map.get("open_unit_name")+"'";
		}
		List<RelationAccountDTO> accts=baseDao.queryForList(sql, new ComplexMapper(RelationAccountDTO.class));
		Session session = getSession(String.valueOf(map.get("pay_account_no")));
		if(max_amount.doubleValue()>0||min_amount.doubleValue()>0){
			for(RelationAccountDTO acctDto : accts)
			{
				//根据账号查询余额，返回只有一条数据，取list.get(0)
				List<RelationAccountDTO> relateActts=(List<RelationAccountDTO>) transService.queryAcctInfo(session,acctDto.getRelate_accno(),null,null);
				acctDto=relateActts.get(0);
				String updateSql="update pb_relation_acct set balance_amount= "+acctDto.getBalance_amount()+" where acct_no= '"+map.get("pay_account_no")+"'" +
						" and relate_accno='"+acctDto.getRelate_accno()+"'";
				baseDao.execute(updateSql);
				BigDecimal balance_amount=acctDto.getBalance_amount();
//				if(max_amount.doubleValue()>0&&max_amount.compareTo(balance_amount)>=0&&min_amount.compareTo(balance_amount)<=0){
//					
//				}else if(max_amount.doubleValue()<=0&&min_amount.compareTo(balance_amount)<=0){//大于最小值
//					
//				}else{
//					accts.remove(acctDto);
//				}
//				
				if((max_amount.doubleValue()>0&&max_amount.compareTo(balance_amount)<0)||(min_amount.compareTo(balance_amount)>0)){
					accts.remove(acctDto);
				}
			}
		}
//		transService.queryAcctInfo(session,relate_accno,null,null);
		transResult.setList(accts);
		return transResult;
	}

	@Override
	public TransResultDTO saveBankNo(List<ExchangeCondition> reqConditions,
			Paging page) {
		Map<String, Object> map = this.changeToConObj(reqConditions);
		String vou_pk = (String)map.get("pay_voucher_id");
		String payee_bank_no = (String)map.get("payee_account_bank_no");
		String sql = "update pb_pay_voucher set payee_account_bank_no = "+payee_bank_no +" where "
				+ "pay_voucher_id in ( " + vou_pk + ")";
		baseDao.execute(sql);
		TransResultDTO transResult=new TransResultDTO(0);
		return transResult;
	}

	@Override
	public int getPayVoucherNumByObj(Session sc, ConditionObj obj) {
		long billTypeId = Parameters.getLongParameter(PayConstant.BILL_TYPE_PAY_VOUCHER);
		Where where = new Where();
		SQLUtil.addCondition(where, obj);
		OrderBy order = SQLUtil.convertOrder(obj);
		Object[] objs = new Object[2];
		return billEngine.loadBillCountByBillType(sc, billTypeId,where);
	}
	public void acceptPayVoucher(Session sc, PayVoucher voucher)
			throws Exception {
		// advance.acct.bank ,0-不根据网点过滤；1-根据网点过滤；2-没有垫支户,如果是0和1，就进行请款操作
		final int has_advance = PbParameters
				.getIntParameter("advance.acct.bank");
		final Session session = sc;
		final List<PayVoucher> payVoucherList = new ArrayList<PayVoucher>();
		// 实际操作员
		final String actual_user_code = voucher.getPayUser_code();
		payVoucherList.add(voucher);
		// 需要请款
		if (has_advance != 2) {
			logger.info("自助柜面【" + voucher.getCode() + "】请款开始。。。");
			// 请款
			try {
				String s = reqMoney(session, payVoucherList);
				if (StringUtil.isNotEmpty(s)) {
					throw new Exception(s);
				}
			} catch (Exception e) {
				logger.error("凭证确认失败，原因请款流程失败，原因：", e);
				throw new Exception(e);
			}
			logger.info("自助柜面【" + voucher.getCode() + "】请款结束。。。");
		}
		// 支付
		try {
			logger.info("自助柜面【" + voucher.getCode() + "】支付开始。。。");
			smallTrans.newTransExecute(new ISmallTransService() {
				@Override
				public void doExecute() throws Exception {
					// 无请款转账进行额度控制
					if (has_advance == 2) {
						long payVoucherBTid = Parameters
								.getLongParameter(PayConstant.BILL_TYPE_PAY_VOUCHER);
						for (PayVoucher p : payVoucherList) {
							List<PayRequest> requestList = (List<PayRequest>) payCommonService
									.loadDetailsByBill(
											session,
											payVoucherBTid,
											new long[] { p.getPay_voucher_id() },
											null);
							balanceService.payRequestsEntrance(session,
									requestList, false);
						}
					}
					String bankType = PbParameters
							.getStringParameter(PbParaConstant.BANK_TYPE);
					payService.acceptCommonSignPayVoucherNotFlow(session,
							payVoucherList, 0, true);
					// 设置回真正的操作员（而不是虚拟柜员）
					payVoucherList.get(0).setPayUser_code(actual_user_code);
					List<String> updateFields = new ArrayList<String>();
					payVoucherList.get(0).setIs_self_counter(1);//设置改凭证为自助柜面操作
					updateFields.add("is_self_counter");
					updateFields.add("operate_user_name");
					updateFields.add("payee_account_bank_no");
					updateFields.add("payUser_code");
					updateFields.add("pb_set_mode_code"); //更新交易类型信用卡查询使用
					billEngine.updateBill(session, updateFields,
							payVoucherList, false);
				}
			});
			logger.info("自助柜面【" + voucher.getCode() + "】支付结束。。。");
		} catch (Exception e) {
			logger.error("凭证确认失败，原因转账流程失败，原因：", e);
			throw new Exception(e);
		}
		// add by liutianlong 20150506
		// acceptCommonSignPayVoucherNotFlow方法中包含了是否自动签章发送的逻辑，
		// 所以此处判断一下，避免重复发送
		int isSend = PbParameters
				.getIntParameter(PbParaConstant.IS_SEND_PAYVOUCHER);
		if (isSend != 1) {
			try {
				logger.info("自助柜面【" + voucher.getCode() + "】回单开始。。。");
				smallTrans.newTransExecute(new ISmallTransService() {
					@Override
					public void doExecute() throws Exception {
						signAndSendPayVoucherByNoFlow(session, payVoucherList,
								1);
					}
				});
				logger.info("自助柜面【" + voucher.getCode() + "】回单结束。。。");
			} catch (Exception e) {
				logger.error("转账后回单流程失败，原因：", e);
			}
		}

	}

	@Override
	public ReturnPage loadRefundSerialByObj(Session sc, ConditionObj obj,
			Paging page) {
		long billTypeId = Parameters.getLongParameter(PayConstant.BILL_TYPE_REFUND_SERIAL);
		return payCommonService.loadPageDataByBillType(sc,new ArrayList<String>(),obj,page,billTypeId);
	}

	@Override
	public ReturnPage loadDetailsByCode(Session sc, ConditionObj obj,
			Paging page) {
		long billTypeId = Parameters.getLongParameter(PayConstant.BILL_TYPE_PAY_REQUEST);
		return payCommonService.loadPageDataByBillType(sc,new ArrayList<String>(),obj,page,billTypeId);
	}

	@Override
	public void acceptPayVoucherForSelfCounterFailToWriteoff(Session session,
			PayVoucher p) throws Exception {
		// TODO Auto-generated method stub
		
	}

	@Override
	public void signAndSendPayVoucherByNoFlow(Session sc,
			List<PayVoucher> payVoucherList, int voucherFlag) throws Exception {
		payService.signAndSendPayVoucherByNoFlow(sc, payVoucherList,
				voucherFlag);
	}

	@Override
	public String reqMoney(Session sc, List<PayVoucher> payVoucherList)
			throws Exception {
		/**
		 * 请款前，查询请款交易状态
		 * 自助柜面“支付”为请款+转账，当请款成功，转账失败后，
		 * 不判断是否已请款会存在重复扣减额度问题，
		 * 柜面中不存在（因其在页面中进行请款和再次请款操作，请款状态行级锁作为保证）
		 * lfj 2016-04-28
		 */
		PayVoucher voucher = payVoucherList.get(0);
		/**
		 * 设置trade_type，在此前调用的代码未设置，会影响queryTrans中的判断逻辑
		 */
		voucher.setTrade_type(TradeConstant.ADVANCE2PAY);
		TransReturnDTO isReqMoney = transService.queryTrans(sc, voucher);
		if(isReqMoney.getResStatus() != 0) {
			return payService.reqMoney(sc, payVoucherList);
		} else {
			return null;
		}

	}

	public String writeoffVoucher(Session session,
			List<PayVoucher> payVoucherList) throws Exception {
		return payService.writeoffVoucher(session, payVoucherList);
	}

	public void returnPayVoucherNoWf(final Session sc,
			List<PayVoucher> payVoucherList, final String operRemark) {
		payService.returnPayVoucherNoWf(sc, payVoucherList, operRemark,0);
	}

	public List<PayVoucher> inputRefundVoucher(Session sc,
			RrefundVoucherDTO rvDto) throws Exception {
		return payService.inputRefundVoucher(sc, rvDto);
	}

	@Override
	public void auditPayVoucher(Session sc, List<PayVoucher> payVoucherList) {
		payService.auditPayVoucher(sc, payVoucherList);
	}

	@Override
	public void editRefundVoucher(Session sc, RefundSerial refund)
			throws PbException {
		payService.editRefundVoucher(sc, refund);
	}

	@Override
	public List<PayVoucher> loadPayVoucherByObj(Session sc, ConditionObj obj) {
		return payService.loadPayVoucherByObj(sc, obj);
	}

	@Override
	public void invalidateRefundVoucher(Session sc,
			List<PayVoucher> payVoucherList, int payType) {
		payService.invalidateRefundVoucher(sc, payVoucherList, payType);
	}
	
	/**********************************************************/
	/*******************柜面对自助柜面开放的接口***********************/
	/*******************@author lfj****************************/
	/**********************************************************/
	/**
	 * 加载凭证列表 不带file的可以删除 可用loadPayVouchers代替
	 */
	public ReturnPage loadPayVoucherByObjAndPage(Session sc, ConditionObj obj,Paging page) {
		long billTypeId = Parameters.getLongParameter(PayConstant.BILL_TYPE_PAY_VOUCHER);
		return payCommonService.loadPageDataByBillType(sc,new ArrayList<String>(),obj,page,billTypeId);
	}
	
	public List<?> loadBillsAndDetailsByObj(Session sc, long billTypeId,
			ConditionObj obj) {
		Where where = new Where();
		SQLUtil.addCondition(where, obj);
		OrderBy order = SQLUtil.convertOrder(obj);
		List<Billable> bills = (List<Billable>) billEngine.loadBillByBillType(sc,
				billTypeId, null, where, order, null);
		// 主单主键
		List<ObjectAttrDTO> attList = ((BizObjectSupport) bills.get(0))
				.getBillType().getObjDto().getPrimaryField();
		String primarykey = attList.get(0).getAttr_code();
		// 主单id数组
		long ids[] = BillUtils.getBillIds(bills);
		// 主单的所有明细
		List<Billable> detailList = (List<Billable>) payCommonService.loadDetailsByBill(sc,
				billTypeId, ids, null);
		// 把单和明细建立关联
		PbUtil.setBillDetails(bills, detailList, primarykey.toLowerCase());
		return bills;
	}
	
}
