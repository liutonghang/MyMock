package grp.pb.branch.service;

import grp.pt.pb.common.model.BankAccount;
import grp.pt.pb.payment.PayVoucher;
import grp.pt.util.model.Session;

import java.util.List;

public interface GuangXiService {
	
	public void submitVoucher(Session sc, List<PayVoucher> payVoucherList,
			String auditRemark);
	/**
	 * 保存公务卡过渡户
	 * @param sc
	 * @param payVoucherList
	 * @param auditRemark
	 */
	public void saveOfficialAccount(Session sc, BankAccount account)throws Exception;
	
	/**
	 * 修改公务卡过渡户
	 * @param sc
	 * @param payVoucherList
	 * @param auditRemark
	 */
	public void editOfficialAccount(Session sc, BankAccount account)throws Exception;
}
