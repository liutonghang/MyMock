package grp.pb.branch.callback;

import grp.pt.bill.Billable;
import grp.pt.pb.common.IBankAccountService;
import grp.pt.pb.common.model.BankAccount;
import grp.pt.pb.job.callback.AutotaskCommonInvokerCaller;
import grp.pt.pb.job.callback.AutotaskInvokerConstant;
import grp.pt.pb.job.callback.IAutotaskInvoker;
import grp.pt.pb.plan.BudgetNoteService;
import grp.pt.pb.plan.PlanDetail;
import grp.pt.pb.plan.PlanDetailService;
import grp.pt.pb.util.PbParameters;
import grp.pt.pb.util.PbUtil;
import grp.pt.pb.util.SessionUtil;
import grp.pt.pb.util.StaticApplication;
import grp.pt.util.PlatformUtils;
import grp.pt.util.StringUtil;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;

import org.apache.commons.beanutils.PropertyUtils;
import org.apache.log4j.Logger;

/**
 * 授权额度通知单处理类
 * @author ZJM
 *
 */
public class PlanAgentNoteImpl extends AutotaskCommonInvokerCaller implements IAutotaskInvoker {
	
	private static Logger log = Logger.getLogger(PlanAgentNoteImpl.class);
	
	/**
	 * 计划明细处理接口，用于根据计划明细生成计划额度
	 */
	private static PlanDetailService planDetailService; 
	
	/**
	 * 授权额度通知单管理类，用于生成额度到账通知单
	 */
	private static BudgetNoteService budgetNoteService;
	
	/**
	 * 银行账号处理
	 */
	private static IBankAccountService bankAccoutService;
	
	private static Object wait = new Object();
	
	static{
		if(planDetailService==null)
			planDetailService = StaticApplication.getPlanDetailService();
		if(budgetNoteService==null)
			budgetNoteService = StaticApplication.getBudgetNoteService();
		//引入银行账号处理类
		if(bankAccoutService==null)
			bankAccoutService = StaticApplication.getBankAccountService();
	}

	/**
	 * 接收到授权额度通知单保存之前，生成计划额度
	 */
	@SuppressWarnings("unchecked")
	public int beforeSave(List<Billable> lists,int voucherFlag) throws Exception {
		try{
		this.setRequisiteInfo(voucherFlag, lists);
		
		for(int i = 0; i < lists.size(); i++)
		{	
			Billable bill = lists.get(i);
			//设置额度到账通知单的处理日期
			PlatformUtils.setProperty(bill, "acct_date", new SimpleDateFormat("yyyyMMdd").format(new Date()));
			//获取授权额度通知单明细
			List<PlanDetail> planDetails = (List<PlanDetail>) PropertyUtils.getProperty(bill, "details");
			//0604报文规范，授权额度通知单明细没有计划月份，将主单的赋值到明细单
			int planMonth = (Integer) PlatformUtils.getProperty(bill, "plan_month");
			String fundTypeCode=(String)PlatformUtils.getProperty(bill, "fund_type_code");
			String fundTypeName=(String)PlatformUtils.getProperty(bill, "fund_type_name");
			//将收款银行编码、名称添加到明细中  zhaoyong 根据北京开发提供支持更改
			String payBankCode=(String)PlatformUtils.getProperty(bill, "pay_bank_code");
			String payBankName=(String)PlatformUtils.getProperty(bill, "pay_bank_name");
			
			//根据财政要求 2104回单中BgtTypeCode,BgtTypeName不能为空，所以将主单的赋值到明细单 xcg 2015-11-11
			String bgtTypeCode=(String)PlatformUtils.getProperty(bill, "bgt_type_code");
			String bgtTypeName=(String)PlatformUtils.getProperty(bill, "bgt_type_name");
			Long bgtTypeId=(Long) PlatformUtils.getProperty(bill, "bgt_type_id");
			log.info("++++++++++++++++获取到的bgtTypeCode:"+bgtTypeCode+"+++++bgtTypeName:"+bgtTypeName+"+++++bgtTypeId:"+bgtTypeId);
			
			for(PlanDetail detail:planDetails){
				detail.setPlan_month(planMonth);
				detail.setFund_type_code(fundTypeCode);
				detail.setFund_type_name(fundTypeName);
				detail.setPay_bank_code(payBankCode);
				detail.setPay_bank_name(payBankName);
				
				//xcg 2015-11-11
				detail.setBgt_type_code(bgtTypeCode);
				detail.setBgt_type_name(bgtTypeName);
				detail.setBgt_type_id(bgtTypeId);
				
				//设置单位零余额账号
				if(StringUtil.isTrimEmpty(detail.getOri_pay_account_no())){
					String agencyCode = detail.getAgency_code();
					BankAccount ba;
					//捕获处理异常
					try {
						ba = bankAccoutService.getAccountByAgencyCode(
								agencyCode, bill.getAdmdiv_code());
						if( ba !=null ){
							detail.setPay_account_no(ba.getAccount_no());
							detail.setPay_account_name(ba.getAccount_name());
							detail.setPay_account_bank(ba.getBank_name());
						}
					} catch (Exception e) {
						e.printStackTrace();
					}
				}else{
					detail.setPay_account_no(detail.getOri_pay_account_no());
					detail.setPay_account_name(detail.getOri_pay_account_name());
					detail.setPay_account_bank(detail.getOri_pay_account_bank());
				}
				
			}
			//主单id
			long billId =  bill.getId();
			//设置计划明细中主单id   
			//TODO 字段映射已经将明细中主单id和code赋值 ？？？
			PbUtil.batchSetValue(planDetails, "plan_agent_note_id", new Long(billId));
		}
		}catch(Exception e){
			e.printStackTrace();
		}
		return AutotaskInvokerConstant.SAVE;
	}
	/**
	 * 授权额度通知单入库并签收成功之后，生成额度到账通知单和回单
	 */
	public  void afterConfirmSucc(List<Billable> lists,int voucherFlag) throws Exception {
		try{
		synchronized(wait){
			log.info("单个进程额度控制开始");
			long[] ids = new long[lists.size()];
			for(int i = 0; i < lists.size(); i++)
			{	
				Billable bill = lists.get( i );
				long billId =  bill.getId();
				ids[i] = billId;
			}
			//生成额度到账通知单以及回单 第三个参数控制是否发送回单 0不发送;1发送 此处为1
			try{
			budgetNoteService.createPlanRecordedNotes(SessionUtil.getSession(), ids,1);
			}catch(Exception e){
				e.printStackTrace();
			}
		}
		}catch(Exception e){
			e.printStackTrace();
		}
	}

	public void afterSave(List<Billable> lists,
			int voucherFlag) throws Exception {}

	public void autoSendAccountNoteAfterClearVoucherConfirm(
			List<Billable> list, int voucherFlag) throws Exception {
		
	}

	public void autoSendPayDailyAfterClearVoucherConfirm(
			List<Billable> list, int voucherFlag) throws Exception {
		
	}

}