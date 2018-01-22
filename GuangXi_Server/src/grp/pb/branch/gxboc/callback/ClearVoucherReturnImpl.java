package grp.pb.branch.gxboc.callback;

import static grp.pt.pb.util.PayConstant.BILL_TYPE_PAY_VOUCHER;
import grp.pt.bill.BillEngine;
import grp.pt.bill.Billable;
import grp.pt.database.DaoSupport;
import grp.pt.database.sql.Eq;
import grp.pt.database.sql.Field;
import grp.pt.database.sql.In;
import grp.pt.database.sql.Select;
import grp.pt.database.sql.Set;
import grp.pt.database.sql.SqlGenerator;
import grp.pt.database.sql.Table;
import grp.pt.database.sql.Update;
import grp.pt.database.sql.Where;
import grp.pt.pb.assp.AsspOperator;
import grp.pt.pb.assp.AsspOperatorAdapter;
import grp.pt.pb.assp.handler.XmlConstant;
import grp.pt.pb.common.BalanceService;
import grp.pt.pb.common.IBankAccountService;
import grp.pt.pb.common.dao.BankAccountDao;
import grp.pt.pb.common.impl.BankAccountValueSetUtil;
import grp.pt.pb.common.model.BankAccount;
import grp.pt.pb.exception.PbException;
import grp.pt.pb.job.callback.AutotaskCommonInvokerCaller;
import grp.pt.pb.job.callback.AutotaskInvokerConstant;
import grp.pt.pb.job.callback.IAutotaskInvoker;
import grp.pt.pb.payment.PayClearVoucher;
import grp.pt.pb.payment.PayRequest;
import grp.pt.pb.payment.PayVoucher;
import grp.pt.pb.util.PayConstant;
import grp.pt.pb.util.PbParaConstant;
import grp.pt.pb.util.PbParameters;
import grp.pt.pb.util.SessionUtil;
import grp.pt.pb.util.StaticApplication;
import grp.pt.pb.util.VoucherStatus;
import grp.pt.util.DateTimeUtils;
import grp.pt.util.ListUtils;
import grp.pt.util.Parameters;
import grp.pt.util.StringUtil;
import grp.pt.util.model.Session;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

import org.apache.log4j.Logger;

/**
 * 划款单回单处理类
 * @author ZJM
 *
 */
public class ClearVoucherReturnImpl extends AutotaskCommonInvokerCaller implements IAutotaskInvoker {
	
	private static Logger log = Logger.getLogger(ClearVoucherReturnImpl.class);
	
	//发送机构路由
	private static String srcOrgType = PbParameters.getStringParameter(PayConstant.ORI_ORG_TYPE);
	//接收机构
	private static String decOrgType = PbParameters.getStringParameter(PayConstant.DEST_MOF_ORG_TYPE);

	//支付方式---直接支付，人行的划款回单只可能发直接、授权，两种
	private static String payTypeCode = PbParameters.getStringParameter(PayConstant.PB_DIRECT_PAY_TYPE_CODE);
	
	private static DaoSupport daoSupport = (DaoSupport)StaticApplication.getBean("gap.database.jdbc.daosupportimpl");

	// 账户
	private BankAccountDao bankAccountDao =(BankAccountDao) StaticApplication.getBean("bankAccountDAO");

	/**
	 * 保存入库之前调用，设置汇款回单登记日期
	 */
	public int beforeSave(List<Billable> lists,int voucherFlag) throws Exception {
		
		this.setRequisiteInfo(voucherFlag, lists);
		
		if(voucherFlag == XmlConstant.VOUCHERFLAG_VALUE_RETURN){
			this.affordValueToConfirmDate(lists);
			return AutotaskInvokerConstant.NO_SVAE;
		}
		//作为清算行的时候，会收到发送单
		else if(voucherFlag == XmlConstant.VOUCHERFLAG_VALUE_SEND){
			//TODO:校验收、付款人
			for ( Billable b: lists){
				String clearAccNo = (String) b.getProperty("clear_account_no");//清算账号
				String clearAccName = (String) b.getProperty("clear_account_name");//清算账户名称
				String clearAccBank = (String) b.getProperty("clear_bank_name");//清算行名称
				
				String agentAccNO = (String) b.getProperty("agent_account_no");//他行申请划款户
				String agentAccName = (String) b.getProperty("agent_account_name");//他行申请划款户
				String agentAccBank = (String) b.getProperty("agent_bank_name");//他行申请划款户银行
				
				String fundTypeCode = (String) b.getProperty("fund_type_code");//资金性质
				String admdivCode = (String) b.getProperty("admdiv_code");//区划代码
				//本行维护的他行申请划款户(如果划款账户与资金性质无关，资金性质传null)
				BankAccount otherBank = null;
				//本行维护的对应的清算户(如果清算账户与资金性质无关，资金性质传null)
				BankAccount clearBank = null;
				//TODO:比较户名、bank
				try {
					
					//本行维护的他行申请划款户(如果划款账户与资金性质无关，资金性质传null)
					otherBank = bankAccountDao.queryAccountByAccountNo(IBankAccountService.TYPE_OTHERBANK_AGENT_ACCOUNT, agentAccNO, null);
					
				} catch (Exception e) {
					log.error(e.getMessage());
				}
				try {
					//本行维护的对应的清算户(如果清算账户与资金性质无关，资金性质传null)
					clearBank = bankAccountDao.queryAccountByAccountNo(IBankAccountService.TYPE_MOF_REALFUND_ACCOUNT, clearAccNo, null);
				} catch (Exception e) {
					log.error(e.getMessage());
				}
				//由于财政维护的是旧的清算户信息，中行维护的是新的，所以预算外的清算不进行清算户校验   xcg 2015-11-18
				if(!"911".equals(fundTypeCode) && !"91".equals(fundTypeCode) && !"9".equals(fundTypeCode) ){
					if (null==clearBank){
						throw new RuntimeException("不存在账号为【"+clearAccNo+"】的清算户");
					}else{
						if(!clearBank.getBank_name().equals(clearAccBank)){
							throw new RuntimeException("清算行名称与【"+clearAccBank+"】不一致");
						}else if (!clearBank.getAccount_name().equals(clearAccName)){
							throw new RuntimeException("清算账户名称与【"+clearAccName+"】不一致");
						}else if(StringUtil.isNotEmpty(clearBank.getFund_type_code())){
							if(!clearBank.getFund_type_code().equals(fundTypeCode)){
								throw new RuntimeException("清算账户资金性质与【"+fundTypeCode+"】不一致");
							}
						}
					}
				}
				if(null==otherBank){
					throw new RuntimeException("不存在账号为【"+agentAccNO+"】的他行申请划款户");
				}else{
					if(!otherBank.getBank_name().equals(agentAccBank)){
						throw new RuntimeException("他行申请行名称【"+agentAccBank+"】不一致");
					}else if (!otherBank.getAccount_name().equals(agentAccName)){
						throw new RuntimeException("他行申请划款户账户名称【"+agentAccName+"】不一致");
					}else if(StringUtil.isNotEmpty(otherBank.getFund_type_code())){
						if(!otherBank.getFund_type_code().equals(fundTypeCode)){
							throw new RuntimeException("他行申请划款户资金性质与【"+fundTypeCode+"】不一致");
						}
					}
				}
			}
		}
		
		return AutotaskInvokerConstant.SAVE;
	}

	/**
	 * 设置划款单回单登记日期
	 * @param lists
	 */
	private void affordValueToConfirmDate(List<Billable> lists) {
		Timestamp nowTime = DateTimeUtils.nowDatetime();
		BillEngine engine = StaticApplication.getBillEngine();
		try {
			String admdivCode = lists.get(0).getAdmdiv_code();
			//直接支付的pay_type_code
			String directPay = PbParameters.getStringParameter("pb.directpaytypecode", admdivCode);
			// 划款单
			In inCodes = new In(new Field("pay_clear_voucher_code"));
			for (Billable bill : lists) {
				inCodes.addValue(bill.getCode());
			}
			Select select = new Select().from(new Table("pb_pay_clear_voucher"));
			Where where = new Where();
			where.addLogic(inCodes);
			where.add(new Eq("and",null,"admdiv_code", "'" + admdivCode + "'"));
			select.where(where);
			//加载本地数据库中已经存在的划款单
			List<PayClearVoucher> payClearList = daoSupport.query(SqlGenerator.generateSql(select),PayClearVoucher.class);
			
			if(ListUtils.isEmpty(payClearList)){
				throw new Exception("未找到划款单号为【"+lists.get(0).getCode()+"】的划款凭证！");
			}
			
			long voucherBillTypeId = Parameters.getLongParameter(PayConstant.BILL_TYPE_PAY_VOUCHER);
			long requestBillTypeId = Parameters.getLongParameter(PayConstant.BILL_TYPE_PAY_REQUEST);
			Session sc = SessionUtil.getSession();
			
			//划款单主键
			In clearIds = new In(new Field("pay_clear_voucher_id"));
			//支付凭证主键
			In vouIds = new In(new Field("pay_voucher_id"));
			
			for (PayClearVoucher p : payClearList) {
				//设置划款单的回单信息及标识
				p.setClear_date(nowTime);
				p.setConfirm_date(nowTime);
				p.setIn_clear_flag("0");//zhaoyong  2014-11-05  设置行内清算标识
				clearIds.addValue(p.getId());
				//当划款回单需要转发财政时，会造成voucher_status状态不为12（对方已回单）
				//所以，当接收到回单时，设置对方已回单，即voucher_status=12, voucher_query_flag = 1
				//不再继续查询凭证状态  lfj 2015-04-24
				p.setVoucher_status("12");
				//设置凭证状态
				p.setVoucher_status_des(VoucherStatus.getVoucherStatusDes(12));
				p.setVoucher_query_flag(1);
			}
			//start 更新划款单
			List<String> updateFields = new ArrayList<String>();
			updateFields.add("clear_date");
			updateFields.add("confirm_date");
			updateFields.add("in_clear_flag");//zhaoyong  2014-11-05  设置行内清算标识
			updateFields.add("voucher_status");
			updateFields.add("voucher_status_des");
			updateFields.add("voucher_query_flag");
			engine.updateBill(sc, updateFields, payClearList, false);
			//end
			
			//start 更新支付凭证
			//加载根据划款单加载支付凭证
			Where idWhere = new Where().addLogic(clearIds);
			boolean is_load_request = false;
			List<PayVoucher> payVouchers = (List<PayVoucher>) engine.loadBillByBillTypeWithoutRight
					(sc, voucherBillTypeId, null, idWhere, null, null);
			for(PayVoucher p : payVouchers){
				//金额小于0的时候，才去加载
				if(p.getAmount().signum() == -1 && !p.getPay_type_code().startsWith(directPay)){
					vouIds.addValue(p.getId());
					is_load_request = true;
				}
				p.setClear_flag(1);
			}
			updateFields.clear();
			updateFields.add("clear_flag");
			engine.updateBill(sc, updateFields, payVouchers, false);
			//end
			
			for(PayClearVoucher p : payClearList){
				log.info("+++++++++++++++++Is_samebank_clear:"+p.getIs_samebank_clear());
				if(0 == p.getIs_samebank_clear()){
					log.info("+++++++++++++++++is_load_request:"+is_load_request);
					if(is_load_request){
						Where reqWhere = new Where().addLogic(vouIds);
						List<PayRequest> balanceReqs = (List<PayRequest>)engine.loadBillByBillTypeWithoutRight
						(sc, requestBillTypeId, null, reqWhere, null, null);
						//调用额度处理
						this.recoveryBalance(sc, balanceReqs);
					}
				}
			}
			//处理支付明细,即恢复额度
//			if(is_load_request){
//				Where reqWhere = new Where().addLogic(vouIds);
//				List<PayRequest> balanceReqs = (List<PayRequest>)engine.loadBillByBillTypeWithoutRight
//						(sc, requestBillTypeId, null, reqWhere, null, null);
//				//调用额度处理
//				this.recoveryBalance(sc, balanceReqs);
//				//end
//			}
			
			log.info("划款的回单处理成功！");
		} catch (Exception e) {
			log.error("接收的划款回单处理异常！", e);
			throw new PbException("接收的划款回单处理异常！,原因："+e.getMessage());
		}
	}
	
	
	/**
	 * 收到授权支付的退款划款回单时，恢复额度
	 * @param requests
	 * @throws Exception 
	 */
	private void recoveryBalance(Session sc , List<PayRequest> requests) throws Exception{
		if(ListUtils.isEmpty(requests)){
			return ;
		}
		BalanceService balanceService =  (BalanceService) StaticApplication.
				getBean("pay.core.impl.balanceserviceimpl");
		balanceService.payRequestsEntrance(sc, requests, false);
		log.info("收到退款划款回单后，授权额度恢复成功！");
	}

	public void afterSave(List<Billable> lists,int voucherFlag) throws Exception {
		
	}

	/**
	 * 签收成功之后调用：划款回单转发财政
	 */
	public void afterConfirmSucc(List<Billable> lists,int voucherFlag) throws Exception {
		//如果是发送单直接返回
		if( voucherFlag == 0 || voucherFlag == 2){
			return;
		}
		Session sc = SessionUtil.getSession();
		AsspOperator asspOperator = new AsspOperatorAdapter();
		for(Billable bill:lists){
			PayClearVoucher clearVoucher = (PayClearVoucher)bill;
			try {
				//划款回单转发财政
				if(PbParameters.getIntParameter( PayConstant.CLEARVOUCHER_FORWARD_MOF,clearVoucher.getAdmdiv_code())==1){
					asspOperator.sendVoucherFullSigns(clearVoucher.getAdmdiv_code(), clearVoucher.getYear(),
							srcOrgType, decOrgType,  clearVoucher.getVt_code(), 
							new String[]{ clearVoucher.getPay_clear_voucher_code() });
				}
				//退款划款回单后发送退款通知书
				if(clearVoucher.getPay_amount().signum()<0){
					if(PbParameters.getIntParameter(PayConstant.AUTO_SEND_REFUND_VOUCHER) == 1){
						Select select1 = new Select().from(new Table("pb_pay_voucher"));
						Where where1 = new Where();
						where1.addLogic(new Eq("pay_clear_voucher_code","'" + clearVoucher.getPay_clear_voucher_code()+ "'"));
						where1.add(new Eq("and",null,"admdiv_code", "'" +  clearVoucher.getAdmdiv_code() + "'"));
						where1.add(new Eq("and",null,"year",  clearVoucher.getYear()));
						select1.where(where1);
						//根据pay_clear_voucher_code查询到该划款单对应的支付凭证
						List<PayVoucher> payVoucherList = StaticApplication.getDaoSupport().query(SqlGenerator.generateSql(select1), PayVoucher.class);
						StaticApplication.getPayService().signAndSendPayVoucherByNoFlow(sc, payVoucherList, voucherFlag);
					}
				
				}
				
				
				
			} catch (Exception e) {
				e.printStackTrace();
				throw new PbException("接收的划款回单处理异常！");
			}
		}
	}

	/**
	 * 接收到划款回单自动发送入账通知书
	 */
	public void autoSendAccountNoteAfterClearVoucherConfirm(List<Billable> list, int voucherFlag) throws Exception {
		//如果是发送单直接返回
		if( voucherFlag == 0 || voucherFlag == 2){
			return;
		}
		//TODO 凭证自动接收时不会传入Session，不应使用Sesion
		Session sc = SessionUtil.getSession();
		for(Billable bill:list){
			PayClearVoucher clearVoucher = (PayClearVoucher)bill;
			//后台发送入账通知书
			if(PbParameters.getIntParameter(PayConstant.AUTO_SEND_ACCOUNT_NOTE) == 1){
				try {
					//查出与划款凭证关联的支付凭证信息
					StringBuffer account_note_sql = new StringBuffer();
					account_note_sql.append( "select p.pay_voucher_id from pb_pay_voucher p,pb_pay_request r,pb_pay_clear_voucher c "
											  +"where c.pay_clear_voucher_id=r.pay_clear_voucher_id and p.pay_voucher_id=r.pay_voucher_id"
											  +" and c.pay_clear_voucher_code = '" + clearVoucher.getPay_clear_voucher_code() + "'");
	
					//工作流条件，进一步保证数据准确性
					if(clearVoucher.getPay_amount().signum()>0){
						sc.setCurrMenuId(200402);
					}
					else{
						sc.setCurrMenuId(200902);
					}
					account_note_sql.append(" and (exists (select 1  from GAP_WF_TASK t_ where 1 = 1 and exists (select 1 from gap_wf_node m_ where t_.proc_id = m_.proc_id")
                                    .append(" and t_.node_id = m_.node_id and m_.menu_id = "+sc.getCurrMenuId()+")") 
                                    .append(" and t_.task_id = p.task_id")
                                    .append(" and t_.task_state in (2, 4)))");
					
					List<Long> voucherIds = daoSupport.queryForLongs(account_note_sql.toString());
					long [] ids = new long[voucherIds.size()];
					for(int i = 0;i<voucherIds.size();i++){
						ids[i] = voucherIds.get(i);
					}
					StaticApplication.getPayService().createAccountNote(sc, ids);
				} catch (Exception e) {
					log.error("后台生成入账通知书异常", e);
					throw new PbException("后台生成入账通知书异常");
				}
			}
		}
	}

	/**
	 * 接收到划款回单后自动发送支付日报
	 */
	public void autoSendPayDailyAfterClearVoucherConfirm(List<Billable> list, int voucherFlag) throws Exception {
		//如果是发送单直接返回
		if( voucherFlag == 0 || voucherFlag == 2){
			return;
		}
		Session sc = SessionUtil.getSession();
		for(Billable bill:list){
			PayClearVoucher clearVoucher = (PayClearVoucher)bill;
			//后台发送支付日报
			if(PbParameters.getIntParameter(PayConstant.AUTO_SEND_DAILY) == 1){

				try {
					//查出与划款凭证关联的支付凭证信息
					StringBuffer pay_daily_sql = new StringBuffer();
					pay_daily_sql.append( "select p.pay_voucher_id from pb_pay_voucher p,pb_pay_request r,pb_pay_clear_voucher c "
											  +"where c.pay_clear_voucher_id=r.pay_clear_voucher_id and p.pay_voucher_id=r.pay_voucher_id"
											  +" and c.pay_clear_voucher_code = '" + clearVoucher.getPay_clear_voucher_code() + "'");
					//工作流条件，进一步保证数据准确性
					if(clearVoucher.getPay_amount().signum()>0){
						//直接
						if(clearVoucher.getPay_type_code().substring(1, 2).equals(payTypeCode)){
							sc.setCurrMenuId(203003);
						}else{//授权
							sc.setCurrMenuId(205107);
						}
					}
					else{
						//直接
						if(clearVoucher.getPay_type_code().substring(1, 2).equals(payTypeCode)){
							sc.setCurrMenuId(202105);
						}else{//授权
							
						}
					}
					pay_daily_sql.append(" and (exists (select 1  from GAP_WF_TASK t_ where 1 = 1 and exists (select 1 from gap_wf_node m_ where t_.proc_id = m_.proc_id")
							     .append(" and t_.node_id = m_.node_id and m_.menu_id = "+sc.getCurrMenuId()+")") 
							     .append(" and t_.task_id = p.task_id")
							     .append(" and t_.task_state in (2, 4)))");
					List<Long> voucherIds = daoSupport.queryForLongs(pay_daily_sql.toString());
					long [] ids = new long[voucherIds.size()];
					for(int i = 0;i<voucherIds.size();i++){
						ids[i] = voucherIds.get(i);
					}
					StaticApplication.getPayService().createPayDaily(sc, ids);
				} catch (Exception e) {
					log.error("后台生成日报异常！", e);
					throw new PbException("后台生成日报异常！");
				}
			
			}
		}
	}
}
