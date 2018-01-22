package grp.pb.branch.service;

import grp.pt.bill.BillEngine;
import grp.pt.pb.common.IBankAccountService;
import grp.pt.pb.common.dao.BankAccountDao;
import grp.pt.pb.common.model.BankAccount;
import grp.pt.pb.exception.PbException;
import grp.pt.pb.payment.PayVoucher;
import grp.pt.pb.util.PayConstant;
import grp.pt.util.ListUtils;
import grp.pt.util.model.Session;
import grp.pt.workflow.IWorkflowRunService;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class GuangXiServiceImpl implements GuangXiService {
	/**
	 * 广西公务卡过渡户账号类型
	 */
 final public static String OFFICIAL_ACCOUNT_TYPE="44";
	/**
	 * 工作流引擎
	 */
	private IWorkflowRunService workflow = null;

	private BillEngine billEngine;

	// 账户
	private BankAccountDao bankAccountDao;

	public IWorkflowRunService getWorkflow() {
		return workflow;
	}

	public void setWorkflow(IWorkflowRunService workflow) {
		this.workflow = workflow;
	}

	public BillEngine getBillEngine() {
		return billEngine;
	}

	public void setBillEngine(BillEngine billEngine) {
		this.billEngine = billEngine;
	}

	public BankAccountDao getBankAccountDao() {
		return bankAccountDao;
	}

	public void setBankAccountDao(BankAccountDao bankAccountDao) {
		this.bankAccountDao = bankAccountDao;
	}

	/**
	 * 初审岗凭证送审
	 */
	@SuppressWarnings("unchecked")
	public void submitVoucher(Session sc, List<PayVoucher> payVoucherList,
			String auditRemark) {
		if (ListUtils.isEmpty(payVoucherList)) {
			return;
		}
		if (payVoucherList.get(0).getTask_id() == 0) {
			// 调用工作流录入
			workflow.createProcessInstance(sc, "PB_PAY_VOUCHER",
					payVoucherList, false);
		}
		// 完成送审操作
		workflow.signalProcessInstance(sc, payVoucherList,
				PayConstant.WORK_FLOW_NEXT, auditRemark);
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
		updateFields.add("pb_set_mode_code");
		updateFields.add("pb_set_mode_name");
		updateFields.add("hold9");
		updateFields.add("create_user_id");
		updateFields.add("create_user_name");
		updateFields.add("create_user_code");
		updateFields.add("city_code");
		updateFields.add("add_word");
		updateFields.add("remark");
		// 更新主单字段
		billEngine.updateBill(sc, updateFields, payVoucherList, false);
	}

	@Override
	public void saveOfficialAccount(Session sc, BankAccount account)
			throws Exception {
		checkAccount(account.getAdmdiv_code());
		bankAccountDao.insertAccount(account);
	}
    /**
     * 一个区划下只有一个过渡户
     * @param admdiv_code
     */
	private void checkAccount(String admdiv_code) {
		Map<String, Object> properties = new HashMap<String, Object>();
		properties.put("admdiv_code", admdiv_code);
		properties.put("account_type_code", OFFICIAL_ACCOUNT_TYPE);
		List<BankAccount> queryAccounts = bankAccountDao
				.queryAccounts(properties);
		if (queryAccounts.size() != 0) {
			throw new PbException("区划：" + admdiv_code + "  已存在过度账户");
		}
	}

	@Override
	public void editOfficialAccount(Session sc, BankAccount account)
			throws Exception {
		String str="account_name+account_no#account_id";
		bankAccountDao.updateAccount(account, str);
	}
}
