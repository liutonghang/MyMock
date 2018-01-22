package grp.pb.branch.job;

import grp.pt.bill.BillEngine;
import grp.pt.bill.Billable;
import grp.pt.bill.Paging;
import grp.pt.database.sql.And;
import grp.pt.database.sql.Eq;
import grp.pt.database.sql.OrderBy;
import grp.pt.database.sql.Where;
import grp.pt.pb.assp.AsspOperator;
import grp.pt.pb.assp.AsspOperatorAdapter;
import grp.pt.pb.common.AutoJobAdapter;
import grp.pt.pb.common.IBankAccountService;
import grp.pt.pb.common.model.BankAccount;
import grp.pt.pb.trans.ex.PbTransSucceedException;
import grp.pt.pb.util.PayConstant;
import grp.pt.pb.util.PbParameters;
import grp.pt.pb.util.PbUtil;
import grp.pt.pb.util.StaticApplication;
import grp.pt.pb.util.VoucherStatus;
import grp.pt.util.BaseDAO;
import grp.pt.util.ListUtils;
import grp.pt.util.Parameters;
import grp.pt.util.PlatformUtils;
import grp.pt.util.exception.CommonException;
import grp.pt.util.model.Session;
import grp.pt.util.transation.ISmalTrans;
import grp.pt.util.transation.ISmallTransService;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import org.apache.log4j.Logger;
/**
 * 凭证状态查询任务开始
 * 
 * @author DAIGUODONG
 * 
 */
@SuppressWarnings("deprecation")
public class AutoQueryVoucherStatusJob extends AutoJobAdapter {
	
	private Logger logger = Logger.getLogger(AutoQueryVoucherStatusJob.class);


	private static BaseDAO baseDAO;

	private static ISmalTrans smallTrans;
	
	private static BillEngine billEngine;
	
	private static Map<String,String> tableMap = new HashMap<String, String>();
	
	static {
		baseDAO = (BaseDAO) StaticApplication.getBean("baseDAO");
		smallTrans = (ISmalTrans) StaticApplication.getBean("smallTranService");
		tableMap.put("pay_voucher", PayConstant.BILL_TYPE_PAY_VOUCHER);
		tableMap.put("pay_clear_voucher", PayConstant.BILL_TYPE_PAY_CLEAR_VOUCHER);
		tableMap.put("pay_account_note", PayConstant.BILL_TYPE_PAY_ACCOUNT_NOTE);
		tableMap.put("pay_daily", PayConstant.BILL_TYPE_PAY_DAILY);
		tableMap.put("refreq_voucher", PayConstant.BILL_TYPE_REFREQVOUCHER);
		tableMap.put("plan_recorded_note", PayConstant.BILL_TYPE_RECORDED_NOTE);
		tableMap.put("plan_agent_note", PayConstant.BILL_TYPE_AGENT_NOTE);
		tableMap.put("realpay_budget_voucher", PayConstant.BILL_TYPE_REALPAY_VOUCHER);
		//2015-08-26新增5106/5108两种凭证的状态查询。
		tableMap.put("plan_clear_note", PayConstant.BILL_TYPE_PLAN_CLEAR_NOTE);
		tableMap.put("pay_clear_note", PayConstant.BILL_TYPE_PAY_CLEAR_NOTE);
		billEngine = (BillEngine) StaticApplication.getBean("bill.engine.billengineimpl");
	}
	
	@Override
	public void executeJob() {
		aotuQueryVoucherStatusActions();
	}
	
	
	
	/**
	 * 查询凭证状态
	 * 回单状态,比如支付凭证回单
     * 14本方未发送、6对方未接收、7对方接收成功、8对方接收失败、9对方签收成功、10对方签收失败、11对方已退回
     * 发送单状态，比如划款单
     * 13本方未发送、0对方未接收、1对方接收成功、2对方接收失败、3对方签收成功、4对方签收失败、5对方已退回、12、已收到对方回单
     * 回单、发送单 状态标志位不一样
	 */
	public synchronized void aotuQueryVoucherStatusActions() {
		Session sc = new Session();
		for(Map.Entry<String, String> table : tableMap.entrySet()){
			//查询并更新划款单的状态
			if("pay_clear_voucher".equals(table.getKey())){
				//代理行发清算行
				this.queryAndUpdate2ClearVoucher1(sc, table.getKey(),IBankAccountService.TYPE_CLEAR_ACCOUNT);
				//清算行发代理行
				this.queryAndUpdate2ClearVoucher2(sc, table.getKey());
				//清算行发给财政
				this.queryAndUpdate2ClearVoucher3(sc, table.getKey());
			}else{
				this.queryAndUpdate(sc, table.getKey());
			}
		}
	}
	
	
	/**
	 * @param map 查询条件
	 * @param query_flag 结束查询标识
	 * @param account_type_code 账户类型
	 */
	public void queryAndUpdate2ClearVoucher1(final Session session,final String tableName,final String account_type_code){
		//此时查询的只是跨行的
		try {
			final AsspOperator asspOperator = new AsspOperatorAdapter();
			smallTrans.newTransExecute(new ISmallTransService() {								
				@SuppressWarnings("unchecked")
				public void doExecute() throws Exception {
					
					Map<String,Map<String,Object[]>> mapObj = new HashMap<String,Map<String,Object[]>>();
					List<Billable> billList = null;
					Paging page = new Paging();
					// 添加查询条件
					String[] fileds = {tableName+"_id","admdiv_code","year","vt_code","agent_account_no","clear_account_no",tableName+"_code","last_ver","voucher_status"};
					List<String> fieldNames = Arrays.asList(fileds);
					// 实例化Where条件，添加逻辑条件
					Where where = new Where().addLogic(new Eq("1","1"));
					// 实例化连接查询条件
					And and1 = new And().addLogics(new Eq("voucher_query_flag","0"));
					And and2 = new And().addLogics(new Eq("send_flag","1"));
					And and3 = new And().addLogics(new Eq("inner_flag","1"));
					where.add(and1);
					where.add(and2);
					where.add(and3);
					OrderBy order = new OrderBy();
					// 定义分页开始位置和页码索引
					int start = 0,index = 1;
					//拼装更新SQL
					String updateSql = "update pb_"+tableName+" set voucher_query_flag = ?, voucher_status=?,voucher_status_des=?,voucher_status_err=?";
					updateSql += " where "+tableName+"_code=? and admdiv_code =? and year =? and vt_code = ?" ;
					String[] para = {"voucher_query_flag","voucher_status","voucher_status_des","voucher_status_err",tableName+"_code","admdiv_code","year","vt_code"}; 
					List tempList = new ArrayList();
					do{
						long billTypeId = Parameters.getLongParameter(tableMap.get(tableName));
						page.setStartIndex(start);
						page.setNowPage(index);
						page.setNowPageNo(500);
						billList =(List<Billable>)billEngine.loadBillByBillType(session, billTypeId, fieldNames, where, order, page);
						if(ListUtils.isEmpty(billList)) {
							break;
						}
						getMapObject(mapObj,billList, asspOperator);
						tempList.addAll(billList);
						start = page.getNowPage()*page.getNowPageNo(); 
						index ++;
					}while(billList.size() == 500);
					if(tempList.size() > 0) {
						baseDAO.batchExecute(updateSql, para, tempList);
					}
		}});
		}catch( PbTransSucceedException e1 ){
			logger.error("",e1);
		}catch (Exception e) {
			logger.error("",e);							
		} 
	}
	
	//2查询更新清算行发往代理行的划款单的状态
	public void queryAndUpdate2ClearVoucher2(final Session session,final String tableName){
		try {
			final AsspOperator asspOperator = new AsspOperatorAdapter();
			smallTrans.newTransExecute(new ISmallTransService() {								
				@SuppressWarnings("unchecked")
				public void doExecute() throws Exception {
					
					Map<String,Map<String,Object[]>> mapObj = new HashMap<String,Map<String,Object[]>>();
					List<Billable> billList = null;
					Paging page = new Paging();
					// 添加查询条件
					String[] fileds = {tableName+"_id","admdiv_code","vt_code","year",tableName+"_code","last_ver","pb_voucher_status","agent_account_no","voucher_query_flag"};
					List<String> fieldNames = Arrays.asList(fileds);
					// 实例化Where条件，添加逻辑条件
					Where where = new Where().addLogic(new Eq("inner_flag","0"));
					// 实例化连接查询条件
					And and1 = new And().addLogics(new Eq("clear_send_flag","1"));
					where.add(and1);
					And and2 = new And().addLogics(new Eq("voucher_query_flag","0"));
					where.add(and2);
					// 实例化排序条件
					OrderBy order = new OrderBy();
					// 定义分页开始位置和页码索引
					int start = 0,index = 1;
					//拼装查询SQL
					//拼装更新SQL
					String updateSql = "update pb_"+tableName+" set pb_voucher_status=?,pb_voucher_status_des=?,pb_voucher_status_err=? ,voucher_query_flag=? ";
					updateSql += " where "+tableName+"_code=? and admdiv_code =? and year =? and vt_code = ?" ;
					String[] para = {"pb_voucher_status","pb_voucher_status_des","pb_voucher_status_err","voucher_query_flag",tableName+"_code","admdiv_code","year","vt_code"}; 
					// 该状态可以终止查询，需要更新查询标识
					List tempList = new ArrayList();
					do{
						long billTypeId = Parameters.getLongParameter(tableMap.get(tableName));
						page.setStartIndex(start);
						page.setNowPage(index);
						page.setNowPageNo(500);
						billList =(List<Billable>)billEngine.loadBillByBillType(session, billTypeId, fieldNames, where, order, page);
						if(ListUtils.isEmpty(billList)) {
							break;
						}
						getMapObject2OrgCode(mapObj, billList, asspOperator, IBankAccountService.TYPE_OTHERBANK_AGENT_ACCOUNT);
						tempList.addAll(billList);
						start = page.getNowPage()*page.getNowPageNo(); 
						index ++;
					}while(billList.size() == 500);
					if(tempList.size() > 0) {
						baseDAO.batchExecute(updateSql,para,tempList);
					}
		}});
		}catch( PbTransSucceedException e1 ){
			logger.error("",e1);
		}catch (Exception e) {
			logger.error("",e);							
		}
	}
	
	//3查询更新清算行发往财政的划款单的状态
	public void queryAndUpdate2ClearVoucher3(final Session session,final String tableName){
		try {
			final AsspOperator asspOperator = new AsspOperatorAdapter();
			Map<String,Map<String,Object[]>> mapObj = new HashMap<String,Map<String,Object[]>>();
			List<Billable> billList = null;
			Paging page = new Paging();
			// 添加查询条件
			String[] fileds = {tableName+"_id","admdiv_code","vt_code","year",tableName+"_code","last_ver","voucher_status","agent_account_no","fin_voucher_query_flag","fin_voucher_status"};
			List<String> fieldNames = Arrays.asList(fileds);
			// 实例化Where条件，添加逻辑条件
			Where where = new Where().addLogic(new Eq("clear_send_flag","1"));
			/**
			 * 同行清算时，inner_flag为1，但需要查询财政状态
			 * lfj 2015-10-09
			 */
			//.addLogic(new Eq("inner_flag","0"));
			// 实例化连接查询条件
			And and2 = new And().addLogics(new Eq("fin_voucher_query_flag","0"));
			where.add(and2);
			// 实例化排序条件
			OrderBy order = new OrderBy();
			// 定义分页开始位置和页码索引
			int start = 0,index = 1;
			//拼装查询SQL
			//拼装更新SQL
			final StringBuffer updateSql = new StringBuffer();
			updateSql.append("update pb_"+tableName+" set fin_voucher_status=?,fin_voucher_status_des=?,fin_voucher_status_err=? , fin_voucher_query_flag=? ");
			updateSql.append(" where "+tableName+"_code=? and admdiv_code =? and year =? and vt_code = ?") ;
			final String[] para = {"fin_voucher_status", "fin_voucher_status_des", "fin_voucher_status_err","fin_voucher_query_flag",tableName+"_code","admdiv_code","year","vt_code"}; 
			// 该状态可以终止查询，需要更新查询标识
			final List<Billable> tempList = new ArrayList<Billable>();
			do{
				long billTypeId = Parameters.getLongParameter(tableMap.get(tableName));
				page.setStartIndex(start);
				page.setNowPage(index);
				page.setNowPageNo(500);
				billList =(List<Billable>)billEngine.loadBillByBillType(session, billTypeId, fieldNames, where, order, page);
				if(ListUtils.isEmpty(billList)) {
					break;
				}
				getMapObject2decOrgType(mapObj,billList, asspOperator);
				tempList.addAll(billList);
				start = page.getNowPage()*page.getNowPageNo(); 
				index ++;
			}while(billList.size() == 500);
			if(tempList.size() > 0) {
				smallTrans.newTransExecute(new ISmallTransService() {								
					public void doExecute() throws Exception {
						baseDAO.batchExecute(updateSql.toString(),para,tempList);
					}});
			}
		}catch (Exception e) {
			logger.error("",e);							
		}
	}
	
	/**
	 * 查询凭证库状态并更新
	 * 
	 * @param tableName
	 * @param voucher_code
	 * @param bills
	 */
	@SuppressWarnings("unchecked")
	public void queryAndUpdate(final Session session,final String tableName){
		try {
			final AsspOperator asspOperator = new AsspOperatorAdapter();
			Map<String,Map<String,Object[]>> mapObj = new HashMap<String,Map<String,Object[]>>();
			List<Billable> billList = null;
			Paging page = new Paging();
			// 添加查询条件
			List<String> fieldNames = new ArrayList<String>();
			fieldNames.add("admdiv_code");
			fieldNames.add("vt_code");
			fieldNames.add("last_ver");
			fieldNames.add("voucher_status");
			fieldNames.add("year");
			if(tableName.equals("realpay_budget_voucher")){
				fieldNames.add("realpay_voucher_id");
				fieldNames.add("realpay_voucher_code");
			}else{
				fieldNames.add(tableName+"_id");
				fieldNames.add(tableName+"_code");
			}
			// 实例化Where条件，添加逻辑条件
			Where where = new Where().addLogic(new Eq("voucher_query_flag","0"));
			// 实例化连接查询条件
			And and = new And().addLogics(new Eq("send_flag","1"));
			//如果是导入的支付凭证则不更新状态
			if("pay_voucher".equals(tableName)){
				and.addLogics(new Eq("and import_flag","0"));
			}
			where.add(and);
			// 实例化排序条件
			OrderBy order = new OrderBy();
			// 定义分页开始位置和页码索引
			int start = 0,index = 1;
			//组装更新SQL
			String codeName = null;
			if(tableName.equals("realpay_budget_voucher")){
				codeName = "realpay_voucher_code";
			}else{
				codeName = tableName + "_code";
			}
			final StringBuffer updateSql = new StringBuffer();
			updateSql.append("update pb_"+tableName+" set ");
			updateSql.append("voucher_query_flag=?,voucher_status=?,voucher_status_des=?,voucher_status_err=?");
			updateSql.append(" where ");
			updateSql.append(codeName);
			updateSql.append("=? and vt_code = ? and year = ? and admdiv_code = ?");
			int size = 500;
			final String[] para = {"voucher_query_flag","voucher_status","voucher_status_des","voucher_status_err",codeName,"vt_code","year","admdiv_code"};
			final List<Billable> tempList = new ArrayList<Billable>();
			do{
				long billTypeId = Parameters.getLongParameter(tableMap.get(tableName));
				page.setStartIndex(start);
				page.setNowPage(index);
				page.setNowPageNo(500);
				page.setLoadDataCount(true);
				billList =(List<Billable>)billEngine.loadBillByBillType(session, billTypeId, fieldNames, where, order, page);
				size = billList.size();
				if(ListUtils.isEmpty(billList)) {
					break;
				}
				getMapObject(mapObj,billList, asspOperator);
				start = page.getNowPage()*page.getNowPageNo(); 
				index ++;
				//更新数据库状态
				tempList.addAll(billList);
			}while(size == 500);
			if(tempList.size() > 0) {
				smallTrans.newTransExecute(new ISmallTransService() {								
					public void doExecute() throws Exception {
						//批量更新
						int count = tempList.size();
						int start = 0;
						do{
							if(count-start < 200){
								baseDAO.batchExecute(updateSql.toString(), para, tempList.subList(start, count));
								start += count;
							}else{
								baseDAO.batchExecute(updateSql.toString(), para, tempList.subList(start, start+200));
								start += 200;
							}
						}while(count-start > 0);
					}
				});
			}
		}catch (Exception e) {
			logger.error("",e);							
		} 
	}
	
	/**
	 * 生成vt_code和凭证状态map
	 * @param list
	 * @param asspOperator
	 * @return
	 */
	public void getMapObject(Map<String,Map<String,Object[]>> map,List<Billable> list,AsspOperator asspOperator){
		// 按年度、区划、vt_code分组后的结果
		Map<String,List<Billable>> groupVoucher = new HashMap<String, List<Billable>>();
		
		for(Billable bill : list){
			String year_admdiv_vtCode = bill.getYear()+"_"+bill.getAdmdiv_code()+"_"+PlatformUtils.getProperty(bill, "vt_code");
			List<Billable> groupList = groupVoucher.get(year_admdiv_vtCode);
			if( ListUtils.isEmpty(groupList)){
				groupList = new ArrayList<Billable>();
				groupList.add(bill);
				groupVoucher.put(year_admdiv_vtCode, groupList);
			}else{
				groupList.add(bill);
			}
		}
		
		for(Map.Entry<String, List<Billable>> entry : groupVoucher.entrySet()){
			String year_admdiv_vtCode = entry.getKey();
			List<Billable> bills = entry.getValue();
			
			String key[] = year_admdiv_vtCode.split("_");
			// 凭证号数组
			String[] voucherNos = PbUtil.getBillNos(bills);
			Map<String, Object[]> mapObj = asspOperator.asspBatchQueryAllVoucherStatus(key[1], Integer.parseInt(key[0]), key[2], voucherNos);
			if(null==mapObj){
				continue;
			}
			for(Iterator<Billable> it = bills.iterator(); it.hasNext();){
				Billable bill = it.next();
				Object[] obj = mapObj.get(bill.getCode());
				if(obj == null){
//					logger.error("凭证"+bill.getCode() + "状态查询失败,凭证库中可能没有该条凭证，请确认");
					continue;
				}
				int voucher_status = Integer.parseInt((String) obj[0]);
				//如果凭证库状态与本地一致，不需要更新
				String local_voucher_status = (String)PlatformUtils.getProperty(bill, "voucher_status");
				if(obj[0].equals(local_voucher_status)){
					list.remove(bill);
					continue;
				}
				PlatformUtils.setProperty(bill, "voucher_status", voucher_status + "");
				PlatformUtils.setProperty(bill, "voucher_status_err", obj[1]);
				PlatformUtils.setProperty(bill, "voucher_status_des", VoucherStatus.getVoucherStatusDes(voucher_status));
				//如果是划款单
				if("2301".equals(key[2]) || "2302".equals(key[2])){
					if(couldEndQuery1(voucher_status)){
						// 该状态可以终止查询，需要更新查询标识
						PlatformUtils.setProperty(bill, "voucher_query_flag", 1);
					}
				}else{
					if(couldEndQuery(voucher_status)){
						// 该状态可以终止查询，需要更新查询标识
						PlatformUtils.setProperty(bill, "voucher_query_flag", 1);
					}
				}
			}
		}
 	}
	
	/**
	 * 查询发往财政的状态
	 * @param map
	 * @param list
	 * @param asspOperator
	 * @return
	 * @throws Exception 
	 */
	public Map<String,Map<String,Object[]>> getMapObject2decOrgType(Map<String,Map<String,Object[]>> map,List<Billable> list,AsspOperator asspOperator) throws Exception{
		

		// 按年度、区划、vt_code分组后的结果
		Map<String,List<Billable>> groupVoucher = new HashMap<String, List<Billable>>();
		String mofDecOrgType = PbParameters.getStringParameter(PayConstant.DEST_MOF_ORG_TYPE);
		for(Billable bill : list){
			String year_admdiv_vtCode = bill.getYear()+"_"+bill.getAdmdiv_code()+"_"+PlatformUtils.getProperty(bill, "vt_code");
			List<Billable> groupList = groupVoucher.get(year_admdiv_vtCode);
			if( ListUtils.isEmpty(groupList)){
				groupList = new ArrayList<Billable>();
				groupList.add(bill);
				groupVoucher.put(year_admdiv_vtCode, groupList);
			}else{
				groupList.add(bill);
			}
		}
		
		for(Map.Entry<String, List<Billable>> entry : groupVoucher.entrySet()){
			String year_admdiv_vtCode = entry.getKey();
			List<Billable> bills = entry.getValue();
			
			String key[] = year_admdiv_vtCode.split("_");
			// 凭证号数组
			String[] voucherNos = PbUtil.getBillNos(bills);
			Map<String, Object[]> mapObj = asspOperator.asspQueryVoucherStatusByOrgType(key[1], key[2],Integer.parseInt(key[0]), voucherNos,mofDecOrgType);
			if(null==mapObj){
				continue;
			}
			for(Iterator<Billable> it = bills.iterator(); it.hasNext();){
				Billable bill = it.next();
				Object[] obj = mapObj.get(bill.getCode());
				if(obj == null){
//					logger.error("凭证"+bill.getCode() + "状态查询失败,凭证库中可能没有该条凭证，请确认");
					continue;
				}
				int voucher_status = Integer.parseInt((String) obj[0]);
				//如果凭证库状态与本地一致，不需要更新
				String local_fin__voucher_status = (String)PlatformUtils.getProperty(bill, "fin_voucher_status");
				if(obj[0].equals(local_fin__voucher_status)){
					list.remove(bill);
					continue;
				}
				PlatformUtils.setProperty(bill, "fin_voucher_status", voucher_status);
				PlatformUtils.setProperty(bill, "fin_voucher_status_err", obj[1]);
				PlatformUtils.setProperty(bill, "fin_voucher_status_des", VoucherStatus.getVoucherStatusDes(voucher_status));
				if(couldStop4ClearAndFin(voucher_status)){
					// 该状态可以终止查询，需要更新查询标识
					PlatformUtils.setProperty(bill, "fin_voucher_query_flag", 1);
				}
			}
		}
		return map;
 	}
	
	/**
	 * 根据路由查询状态
	 * @param map
	 * @param list
	 * @param asspOperator
	 * @param account_type_code 账户类型 用于查询账户路由
	 * @return
	 * @throws Exception 
	 */
	public Map<String,Map<String,Object[]>> getMapObject2OrgCode(Map<String,Map<String,Object[]>> map,List<Billable> list,AsspOperator asspOperator,String account_type_code) throws Exception {
		// 按区划、年度分组后的结果
		Map<String,List<Billable>> groupVoucher = groupbillsByAdmdivAndYearAndAccountNO(list,account_type_code);
		for(final Map.Entry<String,List<Billable>> entry : groupVoucher.entrySet()){
			// 得到区划、年度
			String[] admdivCode_year = entry.getKey().split("_");
			String admdivCode = admdivCode_year[0];
			int year = Integer.parseInt(admdivCode_year[1]);
			String vt_code = admdivCode_year[2];
			String account_no = admdivCode_year[3];
				//根据账号获取路由地址
				BankAccount bankAccout = StaticApplication.getBankAccountService().getAccountByAccountNo(account_type_code, account_no, null);
				if(bankAccout==null){
					throw new CommonException("","账号"+account_no+"没有对应的账户");
				}
				String org = bankAccout.getOrg_code();
				List<Billable> bills = entry.getValue();
				// 凭证号数组
				String[] voucherNos = PbUtil.getBillNos(bills);
				// 调用凭证库接口     Map<凭证号,[0]状态标志[1]错误原因>
				Map<String, Object[]> mapObj = asspOperator.asspQueryVoucherStatusByOrgType(admdivCode,vt_code,year,voucherNos,org);
				if(null==mapObj){
					continue;
				}
				//此处为减少数据库交互次数，对mapObj中数据处理，如果状态与本地一致则移除。
				for(Iterator<Billable> it = bills.iterator(); it.hasNext();){
					Billable bill = it.next();
					Object[] obj = mapObj.get(bill.getCode());
					if(obj == null){
//						logger.error("凭证"+bill.getCode() + "状态查询失败,凭证库中可能没有该条凭证，请确认");
						continue;
					}
					int voucher_status = Integer.parseInt((String) obj[0]);
					//如果凭证库状态与本地一致，不需要更新
					String local_voucher_status = (String)PlatformUtils.getProperty(bill, "pb_voucher_status");
					if(obj[0].equals(local_voucher_status)){
						list.remove(bill);
						continue;
					}
					PlatformUtils.setProperty(bill, "pb_voucher_status", voucher_status + "");
					PlatformUtils.setProperty(bill, "pb_voucher_status_err", obj[1]);
					PlatformUtils.setProperty(bill, "pb_voucher_status_des", VoucherStatus.getVoucherStatusDes(voucher_status));
					if(couldStop4ClearAndFin(voucher_status)){
						// 该状态可以终止查询，需要更新查询标识
						PlatformUtils.setProperty(bill, "voucher_query_flag", 1);
					}
				}
			}
		return map;
 	}
	
	/**
	 * 判断该状态是否可以终止查询，如果状态走到最后，就不再去查询
	 * “对方签收成功”不是凭证终止状态，对方可能进行退回操作
	 * @param voucher_status
	 * @return
	 */
	private boolean couldEndQuery(int voucher_status){
		boolean end = false;
		if(VoucherStatus.S_VOCHER_M_RECEIVE_Y.equals(voucher_status) // 发送单状态：已收到对方回单
				||VoucherStatus.S_VOCHER_Y_RETURNED.equals(voucher_status) //发送单状态：对方已退回
				|| VoucherStatus.S_VOCHER_Y_SIGN_RECEIVE_FAILURE.equals(voucher_status) //发送单状态：对方签收失败
				|| VoucherStatus.S_VOCHER_Y_SIGN_RECEIVE_SUC.equals(voucher_status)
				|| VoucherStatus.R_VOCHER_Y_RETURNED.equals(voucher_status)  //回单状态：对方已退回
				|| VoucherStatus.R_VOCHER_Y_SIGN_RECEIVE_FAILURE.equals(voucher_status)  //回单状态：对方签收失败
				|| VoucherStatus.R_VOCHER_Y_SIGN_RECEIVE_SUC.equals(voucher_status)   //回单状态：对方签收成功
				)
			{
				end = true;
			}
		return end;
	}
	
	private boolean couldStop4ClearAndFin(int voucher_status){
		boolean end = false;
		if(VoucherStatus.S_VOCHER_Y_RETURNED.equals(voucher_status) //发送单状态：对方已退回
				|| VoucherStatus.S_VOCHER_Y_SIGN_RECEIVE_FAILURE.equals(voucher_status) //发送单状态：对方签收失败
				|| VoucherStatus.S_VOCHER_Y_SIGN_RECEIVE_SUC.equals(voucher_status)
				)
			{
				end = true;
			}
		return end;
	}
		/**
	 * 代理行划款发送清算行使用
	 * @param voucher_status
	 * @return
	 */
	private boolean couldEndQuery1(int voucher_status){
		boolean end = false;
		if(VoucherStatus.S_VOCHER_M_RECEIVE_Y.equals(voucher_status) // 发送单状态：已收到对方回单
				||VoucherStatus.S_VOCHER_Y_RETURNED.equals(voucher_status) //发送单状态：对方已退回
				|| VoucherStatus.S_VOCHER_Y_SIGN_RECEIVE_FAILURE.equals(voucher_status) //发送单状态：对方签收失败
				)
			{
				end = true;
			}
		return end;
	}
	
	/**
	 * 按区划编码、凭证类型编码进行分组
	 * 分组原因：调用凭证库批量查询凭证状态接口
	 * 分组规则：先按区划分组，再按凭证类型分组
	 * @param bills
	 * @return Map<String,Map<String,List<Billable>>>  String---区划；Map<String,List<Billable>> 按凭证类型分组结果
	 */
	public Map<String,Map<String,List<Billable>>> groupbills(List<? extends Billable> bills){
		// 要返回的分组
		Map<String,Map<String,List<Billable>>> group = new HashMap<String,Map<String,List<Billable>>>();
		// 根据区划进行分组，第一次分组
		Map<String, List<Billable>> groupByadmdivCode = new HashMap<String, List<Billable>>();

		for(Billable bill : bills){
			String admdiv_code = (String)PlatformUtils.getProperty(bill, "admdiv_code");
			List<Billable> groupBill = groupByadmdivCode.get(admdiv_code);
			if(groupBill==null){
				List<Billable> billList = new ArrayList<Billable>();
				billList.add(bill);
				groupByadmdivCode.put(admdiv_code, billList);
			}else{
				groupBill.add(bill);
			}
		}
		//第二次分组，将第一次分组分解，用vt_code进行第二次分组
		for(Map.Entry<String, List<Billable>> entryByAdmdivCode : groupByadmdivCode.entrySet()){
			//第一次分组的键值
			String admdiv_code = entryByAdmdivCode.getKey();
			//第一次分组后的凭证列表
			List<Billable> billByAdm = entryByAdmdivCode.getValue();
			// 根据vt_code进行分组
			Map<String, List<Billable>> groupByVtCode = new HashMap<String, List<Billable>>();
			
			for(Billable bill : billByAdm){
				//mapByVtCode  最终分组的Value
				Map<String,List<Billable>> mapByVtCode = group.get(admdiv_code);
				String vt_code = (String)PlatformUtils.getProperty(bill, "vt_code");
				if(mapByVtCode == null || mapByVtCode.size() == 0){
					List<Billable> billList = new ArrayList<Billable>();
					billList.add(bill);
					groupByVtCode.put(vt_code, billList);
					group.put(admdiv_code, groupByVtCode);
				}
				else{
					List<Billable>  groupBill = mapByVtCode.get(vt_code);
					if(groupBill == null){
						List<Billable> billList = new ArrayList<Billable>();
						billList.add(bill);
						groupByVtCode.put(vt_code, billList);
					}else{
						groupBill.add(bill);
					}
				}
			}
		}
		return group;
	}
	
	/**
	 * 按照区划、年度分组
	 * 返回形式Map<admdiv_year_account_no,list>
	 * @param type 判断是清算户还是划款户
	 */
	public Map<String,List<Billable>> groupbillsByAdmdivAndYearAndAccountNO(List<? extends Billable> bills,String type){
		// 要返回的分组
		Map<String,List<Billable>> group = new HashMap<String,List<Billable>>();
		String property=null;
		if(type==IBankAccountService.TYPE_CLEAR_ACCOUNT){
			property = "clear_account_no";
		}else{
			property = "agent_account_no";
		}
		for(Billable bill : bills){
			//区划
			String admdiv_code = (String)PlatformUtils.getProperty(bill, "admdiv_code");
			//年度
			int year = (Integer)PlatformUtils.getProperty(bill, "year");
			String vt_code = (String)PlatformUtils.getProperty(bill,"vt_code");
			//清算账号或者是划款账号
			String account_no = (String)PlatformUtils.getProperty(bill,property);
			List<Billable> groupBill = group.get(admdiv_code+"_"+year+"_"+vt_code+"_"+account_no);
			if(groupBill==null){
				List<Billable> billList = new ArrayList<Billable>();
				billList.add(bill);
				group.put(admdiv_code+"_"+year+"_"+vt_code+"_"+account_no, billList);
			}else{
				groupBill.add(bill);
			}
		}
		return group;
	}
}
