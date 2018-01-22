package grp.pb.branch.callback;

import java.util.List;

import org.apache.log4j.Logger;

import grp.pb.branch.gxccb.OfficalCardUtil;
import grp.pb.branch.service.GuangXiServiceImpl;
import grp.pt.bill.Billable;
import grp.pt.pb.common.IBankAccountService;
import grp.pt.pb.common.model.BankAccount;
import grp.pt.pb.job.callback.impl.AccreditVoucherImpl;
import grp.pt.pb.payment.PayVoucher;
import grp.pt.pb.util.StaticApplication;
import grp.pt.util.StringUtil;

/**
 * 广西建行使用
 *
 */
public class GuangXiAccreditVoucherImpl extends AccreditVoucherImpl {
	private static Logger log = Logger.getLogger(GuangXiAccreditVoucherImpl.class);

	private static IBankAccountService bankAccountService;
	static{
		bankAccountService =StaticApplication.getBankAccountService();
	}
	@Override
	public int beforeSave(List<Billable> lists, int voucherFlag)
			throws Exception {
		int save = super.beforeSave(lists, voucherFlag);
		if (voucherFlag == 0) {
			for (Billable bill : lists) {
				PayVoucher payVoucher = (PayVoucher) bill;
			
					if(StringUtil.isEmpty(payVoucher.getPayee_account_no())){
						continue;
					}
					if(!OfficalCardUtil.match(payVoucher.getPayee_account_no())){
						continue;
					}
					BankAccount account = getaccount(payVoucher);
					if(null!=account){
						log.info("区划 ： "+payVoucher.getAdmdiv_code()+"，公务卡业务补录过渡户 ："+account.getAccount_name());
						payVoucher.setPayee_account_no(account.getAccount_no());
						payVoucher.setPayee_account_name(account.getAccount_name());
					}
				}
			}
		return save;
	}
    private BankAccount  getaccount(PayVoucher payVoucher){
		List<BankAccount> accounts = bankAccountService.loadAccountByAccountType(GuangXiServiceImpl.OFFICIAL_ACCOUNT_TYPE);
        if(accounts.size()==0){
        	return null;
        }
		for (BankAccount acc : accounts) {
			if(acc.getAdmdiv_code().equals(payVoucher.getAdmdiv_code())){
				return acc;
			}
		}
		return null;
    	
    }
}
