package grp.pb.branch.gxboc.job;

import grp.pt.database.DaoSupport;
import grp.pt.pb.common.AutoJobAdapter;
import grp.pt.pb.common.IFinService;
import grp.pt.pb.common.model.AdmdivDTO;
import grp.pt.pb.util.SessionUtil;
import grp.pt.pb.util.StaticApplication;
import grp.pt.util.ListUtils;
import grp.pt.util.model.Session;
import grp.pt.util.transation.ISmalTrans;
import grp.pt.util.transation.ISmallTransService;

import java.util.List;

import org.apache.log4j.Logger;

/**
 * 自动发送入账通知书
 * 
 * @author DAIGUODONG
 * 
 */
public class AutoSendAccountNoteServiceJob extends AutoJobAdapter {
	
	private Logger logger = Logger.getLogger(AutoSendAccountNoteServiceJob.class);

	private static boolean interrupt = false;

	private static DaoSupport daoSupport = (DaoSupport)StaticApplication.getBean("gap.database.jdbc.daosupportimpl");

	private static ISmalTrans smallTrans;
	
	private static int count = 0;
	
	//定义一个执行完该任务的标志
	public static boolean flag = false;
	
	//private static Map<String, Class<?>> tableMap = new HashMap<String, Class<?>>();

	static {
		
		smallTrans = (ISmalTrans) StaticApplication.getBean("smallTranService");
	}

	@Override
	public void executeJob() {

		aotuQueryVoucherStatusActions();
	}
	
	
	public void aotuQueryVoucherStatusActions() {
		
		try {
			
			IFinService finService = StaticApplication.getFinService();
			Session sc = SessionUtil.getTopUserSession().get(0);
			List<AdmdivDTO> admList = finService.loadAllAdmdiv();
			for(AdmdivDTO adm : admList){
				
				logger.info(adm.getAdmdiv_code() + "　开始发送入账通知书 !");
				
				autoSendAccountNote(sc,adm.getAdmdiv_code());
				
				logger.info(adm.getAdmdiv_code() + "　发送入账通知书结束 !");
			}
			
		} catch (Exception e) {
			logger.error(e);
		}
	}
	
	private void create(Session sc,String vt_code,String admdiv_code) throws Exception{
		
		String account_note_sql = "SELECT pay_voucher_id FROM PB_PAY_VOUCHER where pay_account_note_id = 0 and send_flag = 1 and vt_code = '"+vt_code+"' and admdiv_code = '"+admdiv_code+"'";
		
		List<Long> voucherIds = daoSupport.queryForLongs(account_note_sql);
		
		if(ListUtils.isEmpty(voucherIds)){
			return;
		}
		
		long [] ids = new long[voucherIds.size()];
		for(int i = 0;i<voucherIds.size();i++){
			ids[i] = voucherIds.get(i);
		}
		
		StaticApplication.getPayService().createAccountNote(sc, ids);
	}
	
	public void autoSendAccountNote(final Session sc,final String admdiv_code){
		
		//正向2205
		try {
			smallTrans.newTransExecute(new ISmallTransService() {
				public void doExecute() throws Exception {
					create(sc, "5201", admdiv_code);
				}
			});
		} catch (Exception e) {
			logger.error(e.getMessage(), e);
		}
		
		//逆向2205
		try {
			smallTrans.newTransExecute(new ISmallTransService() {
				public void doExecute() throws Exception {
					create(sc, "2203", admdiv_code);
				}
			});
		} catch (Exception e) {
			logger.error(e.getMessage(), e);
		}
	}

}
