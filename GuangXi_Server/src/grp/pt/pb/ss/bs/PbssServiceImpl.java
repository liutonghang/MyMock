package grp.pt.pb.ss.bs;

import grp.pt.bill.BillEngine;
import grp.pt.bill.ConditionObj;
import grp.pt.bill.ConditionPartObj;
import grp.pt.bill.Paging;
import grp.pt.bill.ReturnPage;
import grp.pt.database.DaoSupport;
import grp.pt.pb.common.BalanceService;
import grp.pt.pb.common.IBankAccountService;
import grp.pt.pb.common.IBankNoService;
import grp.pt.pb.common.dao.BankAccountDao;
import grp.pt.pb.common.impl.PayCommonService;
import grp.pt.pb.common.model.BankAccount;
import grp.pt.pb.common.model.Condition;
import grp.pt.pb.common.model.PbConditionPartObj;
import grp.pt.pb.exception.FinIsinDayException;
import grp.pt.pb.exception.PbConCurrencyException;
import grp.pt.pb.exception.PbException;
import grp.pt.pb.newuser.UserSignZeroNo;
import grp.pt.pb.payment.BatchReqMoneyVoucher;
import grp.pt.pb.payment.PayRequest;
import grp.pt.pb.payment.PayService;
import grp.pt.pb.payment.PayVoucher;
import grp.pt.pb.payment.PbElecVoucher;
import grp.pt.pb.payment.RrefundVoucherDTO;
import grp.pt.pb.sms.SmsClient;
import grp.pt.pb.ss.ICreateEvocherImageService;
import grp.pt.pb.ss.IPbssService;
import grp.pt.pb.ss.model.RelationAccount;
import grp.pt.pb.ss.model.RelationAccountDetail;
import grp.pt.pb.ss.util.PbssConditionObjUtils;
import grp.pt.pb.ss.util.SsConstant;
import grp.pt.pb.trans.ITransService;
import grp.pt.pb.trans.model.AccountTransDetailDTO;
import grp.pt.pb.trans.model.RelationAccountDTO;
import grp.pt.pb.trans.model.TransReturnDTO;
import grp.pt.pb.util.JsonMapToMapUtil;
import grp.pt.pb.util.JsonUtil;
import grp.pt.pb.util.PayConstant;
import grp.pt.pb.util.PbParaConstant;
import grp.pt.pb.util.PbParameters;
import grp.pt.pb.util.PbUtil;
import grp.pt.pb.util.SessionUtil;
import grp.pt.pb.util.StaticApplication;
import grp.pt.pb.util.TradeConstant;
import grp.pt.pb.util.ZipFileUtil;
import grp.pt.util.BaseDAO;
import grp.pt.util.BeanFactoryUtil;
import grp.pt.util.ComplexMapper;
import grp.pt.util.DatabaseUtils;
import grp.pt.util.DateTimeUtils;
import grp.pt.util.ListUtils;
import grp.pt.util.NumberUtil;
import grp.pt.util.Parameters;
import grp.pt.util.StringUtil;
import grp.pt.util.StringUtils;
import grp.pt.util.model.Session;
import grp.pt.util.transation.ISmalTrans;
import grp.pt.util.transation.ISmallTransService;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.zip.ZipOutputStream;

import net.sf.json.JSONArray;
import net.sf.json.JSONObject;

import org.apache.log4j.Logger;
import org.springframework.jdbc.core.RowMapper;

/**
 * 提供自助柜面Hession接口实现
 * @author ZJM
 *
 */
public class PbssServiceImpl implements IPbssService {
	
	private static Logger logger = Logger.getLogger(PbssServiceImpl.class);
	
	private BillEngine billEngine;
	
	private PayService payService;
	
	private PayCommonService payCommonService;
	
	private BalanceService balanceService;
	
	private IBankNoService bankNoService;
	
	private ITransService transService;
	
	private ICreateEvocherImageService createEvocherImageService;
	
	public BaseDAO baseDao;
	
	private ISmalTrans smallTrans;
	
	public Session sc = SessionUtil.getSession();
    
	static DaoSupport daosupport;
	static{
		daosupport=(DaoSupport) BeanFactoryUtil.getBean("gap.database.jdbc.daosupportimpl");
	}
	
	public BillEngine getBillEngine() {
		return billEngine;
	}

	public void setBillEngine(BillEngine billEngine) {
		this.billEngine = billEngine;
	}

	public PayService getPayService() {
		return payService;
	}

	public void setPayService(PayService payService) {
		this.payService = payService;
	}

	public PayCommonService getPayCommonService() {
		return payCommonService;
	}

	public void setPayCommonService(PayCommonService payCommonService) {
		this.payCommonService = payCommonService;
	}

	public BalanceService getBalanceService() {
		return balanceService;
	}

	public void setBalanceService(BalanceService balanceService) {
		this.balanceService = balanceService;
	}

	public IBankNoService getBankNoService() {
		return bankNoService;
	}

	public void setBankNoService(IBankNoService bankNoService) {
		this.bankNoService = bankNoService;
	}

	public ITransService getTransService() {
		return transService;
	}

	public void setTransService(ITransService transService) {
		this.transService = transService;
	}

	public BaseDAO getBaseDao() {
		return baseDao;
	}

	public void setBaseDao(BaseDAO baseDao) {
		this.baseDao = baseDao;
	}
	
	public ISmalTrans getSmallTrans() {
		return smallTrans;
	}

	public void setSmallTrans(ISmalTrans smallTrans) {
		this.smallTrans = smallTrans;
	}
	public ICreateEvocherImageService getCreateEvocherImageService() {
		return createEvocherImageService;
	}

	public void setCreateEvocherImageService(
			ICreateEvocherImageService createEvocherImageService) {
		this.createEvocherImageService = createEvocherImageService;
	}
	

	/**
	 * 用户登录认证【2008】
	 */
	@SuppressWarnings("unchecked")
	@Override
	public List<Map<String, String>> checkLogin(Map<String, String> reqMap,Object...objs) {
		String agency_code = reqMap.get("agency_code");
		String user_login_code = reqMap.get("user_login_code");
		String user_password = reqMap.get("user_password");
		String querySql =  "select * from pb_user_signzero_no where agency_code = ? and cis_valide = 1";
		List<Map<String, String>> resMapList = baseDao.queryForList(querySql, new Object[]{agency_code}, new RowMapper<Map<String, String>>() {
			@Override
			public Map<String, String> mapRow(ResultSet rs, int rowNum) throws SQLException {
				Map<String, String> map = new HashMap<String, String>();
				map.put("agency_code", rs.getString("agency_code"));
				map.put("user_name", rs.getString("user_name"));
				map.put("sign_name", rs.getString("sign_name"));
				map.put("user_login_code", rs.getString("user_login_code"));
				map.put("user_password", rs.getString("user_password"));
				map.put("ukey_code", rs.getString("ukey_code"));
				return map;
			}
		});
		if(ListUtils.isEmpty(resMapList)){
			throw new RuntimeException("未查到有效的客户操作员信息！");
		}
		
		for(Map<String, String> resMap : resMapList){
			if(user_login_code.equals(resMap.get("user_login_code"))){
				if(!user_password.equals(resMap.get("user_password"))){
					throw new RuntimeException("登录密码错误，请重新输入！");
				}
				return resMapList;
			}
		}
		
		throw new RuntimeException("客户号与操作员不一致，请检查！");

	}
	
	/**
	 * 自助柜面登陆
	 * @param reqMap
	 * @param objs
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public List<Map<String, String>> selfCounterLogin(Map<String, String> reqMap,Object...objs) {
		
		String querySql =  "select * from pb_user_signzero_no where cis_valide = 1"; 
		
		if(null==reqMap||reqMap.isEmpty()) return null;
		Object[] valueObjs=new Object[reqMap.entrySet().size()];
		int i=0;
		//获取需要查询的字段及值
		for(Entry<String,String> entry : reqMap.entrySet()){
			if(StringUtil.isNotEmpty(entry.getKey())){
				querySql+=" and "+entry.getKey()+" = ? " ;
				valueObjs[i++]=entry.getValue();
			}
		}
		//如果reqMap中存在空的键值对,需要去掉
		if(i<reqMap.entrySet().size()){
			Object[] objs1=new Object[i];
			for (int m=0;m<i;m++){
				objs1[m]=valueObjs[m];
			}
			valueObjs=objs1;
		}
		
		List<Map<String, String>> resMapList = baseDao.queryForList(querySql,valueObjs, new RowMapper<Map<String, String>>() {
			@Override
			public Map<String, String> mapRow(ResultSet rs, int rowNum) throws SQLException {
				Map<String, String> map = new HashMap<String, String>();
				map.put("agency_code", rs.getString("agency_code"));
				map.put("user_name", rs.getString("user_name"));
				map.put("sign_name", rs.getString("sign_name"));
				map.put("user_login_code", rs.getString("user_login_code"));
				map.put("user_password", rs.getString("user_password"));
				map.put("ukey_code", rs.getString("ukey_code"));
				return map;
			}
		});
		

		
		if(ListUtils.isEmpty(resMapList)){
			throw new RuntimeException("未查到有效的客户操作员信息！");
		}
		
		return resMapList;

	}

	/**
	 * 待办事项查询【2006】
	 */
	@Override
	public int[] getTodoListNum(String payAccountNo, Object... objects) {
		String transSql = "select * from pb_pay_voucher v where v.pay_account_no = ? and v.vt_code = '8202' and v.year = ?" +
				" and v.task_id = 0 and v.is_accept = 0 and v.business_type = 0 and v.import_flag = 0 and v.is_same_bank = ?" +
				" and v.set_mode_name not like '%现金%' and v.payee_account_no is not null and v.pay_mgr_name like '%正常支付%'" ;
		//添加自定义查询条件
		//根据零余额账户，获取区划信息
		BankAccountDao bankDao = (BankAccountDao)StaticApplication.getBean("bankAccountDAO");
		BankAccount account = bankDao.queryAccountByAccountNo(IBankAccountService.TYPE_AGENCY_ZERO_ACCOUNT, 
				payAccountNo, null);
		if(account == null){
			throw new PbException("不存在账号为【"+payAccountNo+"】的单位零余额！");
		}
		String ss_special_sql = PbParameters.getParameterValue(PbParaConstant.SS_SPECIAL_CONDITION, account.getAdmdiv_code());
		if(StringUtil.isNotEmpty(ss_special_sql))
		{
			transSql = transSql+" "+ss_special_sql;
		}
		//同行转账待处理笔数
		int sameBankNum = baseDao.getCount(transSql, new Object[]{payAccountNo,PbUtil.getCurrYear(),1});
		//跨行转账待处理笔数
		int otherBankNum = baseDao.getCount(transSql, new Object[]{payAccountNo,PbUtil.getCurrYear(),0});
		
		//退款业务待处理笔数
		String refundSql = "select * from PB_TRANS_SERIAL  where PAYEE_ACCOUNT_NO = ? and refund_status = 1" +
				" and PAY_ACCOUNT_NO NOT IN (select account_no from pb_ele_account where account_type_code = '21')";
		int refundNum = baseDao.getCount(refundSql,new Object[]{payAccountNo});
		return new int[]{sameBankNum,otherBankNum,refundNum};
	}

	/**
	 * 修改登录密码【2014】
	 */
	@Override
	public void modifyPasswordOrCstInfo(final String userLoginCode,final String oldInfo, final String newInfo,Object... objects) {
		String isModifyPwd = (String) objects[0];
		String sql = "select user_password,agency_code from pb_user_signzero_no  where user_login_code = ? and cis_valide = 1";
		String modifysql =""; 
		if ("1".equals(isModifyPwd)) { //修改密码
			String pwd = (String) baseDao.queryForOne(sql, new Object[]{userLoginCode}, new RowMapper<String>() {
				@Override
				public String mapRow(ResultSet rs, int arg1) throws SQLException {
					return rs.getString(1);
				}
			});
			if(StringUtil.isEmpty(pwd)){
				throw new RuntimeException("未查询到该用户签约信息！");
			}
			
			if(!oldInfo.equals(pwd)){
				throw new RuntimeException("您输入的原始密码不正确");
			}
			modifysql = "update pb_user_signzero_no set user_password = ? where user_login_code = ? and cis_valide = 1";
			final String modPwdSql = modifysql;
			try {
				smallTrans.newTransExecute(new ISmallTransService() {
					@Override
					public void doExecute() throws Exception {
						baseDao.execute(modPwdSql, new Object[]{newInfo,userLoginCode});
					}
					
				});
			} catch (Exception e) {
				throw new RuntimeException("更新密码失败:失败原因"+e.getMessage());
			}
		}else { //修改客户信息
			String agencyCode = (String) baseDao.queryForOne(sql, new Object[]{userLoginCode}, new RowMapper<String>() {
				@Override
				public String mapRow(ResultSet rs, int arg1) throws SQLException {
					return rs.getString(2);
				}
			});
			if(StringUtil.isEmpty(agencyCode)){
				throw new RuntimeException("未查询到该用户签约信息！");
			}
			
			if(!oldInfo.equals(agencyCode)){
				throw new RuntimeException("您输入的原客户识别号不正确");
			}
			final String  modCstuserSql = "update pb_user_signzero_no set agency_code = ? where agency_code = ?";
			final String modCstSql = "update pb_user_zerono_property set CUSTOMNO = ? where CUSTOMNO = ?";
			try {
				smallTrans.newTransExecute(new ISmallTransService() {
					@Override
					public void doExecute() throws Exception {
						baseDao.execute(modCstSql, new Object[]{newInfo, oldInfo});
						baseDao.execute(modCstuserSql, new Object[]{newInfo, oldInfo});
					}
					
				});
			} catch (Exception e) {
				throw new RuntimeException("更新客户信息失败:失败原因"+e.getMessage());
			}
		
		}
	}

	/**
	 * 支付凭证查询【2000】
	 * @throws Exception 
	 */
	@Override
	public Map<String, Object> loadPayVoucherList(String jsonMap, String payAccountNo,String vtCode,
			String isSameBank, String filedNames,
			Paging page, Object... objects) {
		Session sc = new Session();
		try {
			//查询区条件
			ConditionObj conditionObj = PbssConditionObjUtils.getConditionObj(jsonMap);
			
			//单位零余额账账号
			ConditionPartObj accountNoObj = new ConditionPartObj(ConditionObj.AND, false, 
						"pay_account_no", ConditionObj.EQUAL, payAccountNo, false, false, "");
			accountNoObj.setDataType(0);
			conditionObj.addConditionPartObj(accountNoObj);	
			
			if(StringUtil.isNotEmpty(isSameBank)){
				//是否同行
				ConditionPartObj sameBankObj = new ConditionPartObj(ConditionObj.AND, false, 
						"is_same_bank", ConditionObj.EQUAL, isSameBank, false, false, "");
				sameBankObj.setDataType(1);
				conditionObj.addConditionPartObj(sameBankObj);	
			}
			
			//凭证类型
			ConditionPartObj partObj = new ConditionPartObj(ConditionObj.AND, false, 
					"vt_code", ConditionObj.EQUAL, vtCode, false, false, "");
			partObj.setDataType(0);
			conditionObj.addConditionPartObj(partObj);
			
			//年度
			ConditionPartObj yearObj = new ConditionPartObj(ConditionObj.AND, false, 
					"year", ConditionObj.EQUAL, PbUtil.getCurrYear(), false, false, "");
			yearObj.setDataType(0);
			conditionObj.addConditionPartObj(yearObj);
			
			//自助柜面不查询现金业务
			String cashSql = " and (objsrc_2742.set_mode_name not like '%现金%' and objsrc_2742.payee_account_no is not null and objsrc_2742.pay_mgr_name like '%正常支付%')";
			Condition pbcon = new Condition();
			pbcon.setSpecial_condition(cashSql);
			PbConditionPartObj pcpo = new PbConditionPartObj(pbcon);
			conditionObj.addConditionPartObj(pcpo);
			
			//不能查询出导入的凭证
			ConditionPartObj notImtObj = new ConditionPartObj
					(ConditionObj.AND, false, "import_flag", ConditionObj.EQUAL, 0, false, false, "");
			conditionObj.addConditionPartObj(notImtObj);
			
			//添加自定义查询条件
			//根据零余额账户，获取区划信息
			BankAccountDao bankDao = (BankAccountDao)StaticApplication.getBean("bankAccountDAO");
			BankAccount account = bankDao.queryAccountByAccountNo(IBankAccountService.TYPE_AGENCY_ZERO_ACCOUNT, 
					payAccountNo, null);
			if(account == null){
				throw new PbException("不存在账号为【"+payAccountNo+"】的单位零余额！");
			}
			String ss_special_sql = PbParameters.getParameterValue(PbParaConstant.SS_SPECIAL_CONDITION, account.getAdmdiv_code());
			if(StringUtil.isNotEmpty(ss_special_sql))
			{
				Condition special = new Condition();
				//默认前补空格，避免报错
				special.setSpecial_condition(" "+ss_special_sql);
				PbConditionPartObj specialPart = new PbConditionPartObj(special);
				conditionObj.addConditionPartObj(specialPart);
			}
			
			String[] fields = JsonUtil.getStringArray4Json(filedNames);
			List<String> filedNameList = Arrays.asList(fields);
			
			ReturnPage returnPage = payService.loadPayVouchers(sc, filedNameList,conditionObj, page);
			
			String jsonArray = JsonUtil.getListViewPaging(returnPage, filedNameList);
			String jonStr = jsonArray.toString();
			
			//回执Map
			Map<String, Object> resMap = new HashMap<String, Object>();
			resMap.put("data", jonStr);  //数据Json字符串
			resMap.put("dataCount", returnPage.getDataCount());  //总条数
			resMap.put("pageCount", returnPage.getPageCount());  //总页数
			
			return resMap;
		} catch (Exception e) {
			e.printStackTrace();
		}
		return null;
	}


	/**
	 * 支付凭证确认【2001】
	 */
	@Override
	public String transferPayVouchers(Map<Long, Object[]> vouMap,
			String isSameBank, String userCode, Object... objects) {
		Session sc = new Session();
		// 获取主单单据类型ID
		long billTypeId = Parameters.getLongParameter(PayConstant.BILL_TYPE_PAY_VOUCHER);

		//凭证ID数组
		long[] ids = new long[vouMap.size()];
		//凭证版本号数组
		long[] lastVers = new long[vouMap.size()];
		int i = 0;
		for(Map.Entry<Long, Object[]> entry : vouMap.entrySet()){
			ids[i] = entry.getKey();
			Object[] obj = entry.getValue();
			lastVers[i] = (Long)obj[0];
			i++;
		}
		
		//凭证列表
		List<PayVoucher> payVoucherList = (List<PayVoucher>) billEngine.loadBillByIds(sc, billTypeId, NumberUtil.toObjectList(ids));
		if(ListUtils.isEmpty(payVoucherList)){
			throw new PbConCurrencyException("未检索到操作的凭证！");
		}
		PbUtil.checkLastver(ids,lastVers, payVoucherList);
		// 明细列表
		List<PayRequest> requestList = (List<PayRequest>) payCommonService.loadDetailsByBill(sc, billTypeId, ids, null);
		// 将明细设置到对应的凭证中
		PbUtil.setBillDetails(payVoucherList, requestList, "pay_voucher_id");
		
		//跨行，更新行号
		if(isSameBank.equals("0")){
			for(PayVoucher voucher : payVoucherList){
				Object obj[] = vouMap.get(voucher.getPay_voucher_id());
				voucher.setPayee_account_bank_no((String)obj[1]);
			}
		}

		Map no_map = baseDao.queryForOne("select bank_id,bank_code from pb_ele_account where account_no = '"+payVoucherList.get(0).getPay_account_no()+"'");
		if(no_map == null){
			throw new RuntimeException("根据账号获取不到网点信息！");
		}
		
		sc.setBelongOrgId(Long.valueOf(no_map.get("bank_id").toString()));
		sc.setBelongOrgCode(no_map.get("bank_code").toString());//重庆农行加
		sc.setTop_org(1);
		//虚拟柜员号可以从网点取,放到个性化转账前个性化处理，以防有不一样的需求。
		if(null!=objects&&objects.length>0&&null!=objects[0]){
			sc.setUserCode((String) objects[0]);
		}
	

		
		JSONArray array = new JSONArray();
		JSONObject newObject = new JSONObject();
		for(PayVoucher payVoucher : payVoucherList){
			payVoucher.setIs_self_counter(1);
			payVoucher.setOperate_user_name(userCode);
			payVoucher.setIs_same_bank(Integer.parseInt(isSameBank));
			try {
				acceptPayVoucher(sc, payVoucher);
			} catch (Exception e) {
				e.printStackTrace();
				JSONObject object = new JSONObject();
				object.put("pay_voucher_id", payVoucher.getPay_voucher_id());
				object.put("error_msg", e.getMessage()/*PbUtil.getAcurateLenString(e.getMessage(), 60)*/);				
				object.put("pay_voucher_code", payVoucher.getPay_voucher_code());
				object.put("payee_account_name", payVoucher.getPayee_account_name());
				object.put("pay_amount", payVoucher.getPay_amount());
				object.put("payee_account_no", payVoucher.getPayee_account_no());
				object.put("tran_status", payVoucher.getBusiness_type());
				array.add(object);
			}
		}
		if(array.size() != 0){
			newObject.put("root", array);
			return newObject.toString();
		}
		return null;
	}
	
	public void acceptPayVoucher(Session sc, PayVoucher voucher)throws Exception {
		// advance.acct.bank ,0-不根据网点过滤；1-根据网点过滤；2-没有垫支户,如果是0和1，就进行请款操作
		final int has_advance = PbParameters
				.getIntParameter("advance.acct.bank");
		final Session session = sc;
		final List<PayVoucher> payVoucherList = new ArrayList<PayVoucher>();
		payVoucherList.add(voucher);
		// 需要请款
		if (has_advance != 2) {
			logger.info("自助柜面【" + voucher.getCode() + "】请款开始。。。");
			// 请款
			try {
				smallTrans.newTransExecute(new ISmallTransService() {
					@Override
					public void doExecute() throws Exception {
						String s = reqMoney(session, payVoucherList);
						if (StringUtil.isNotEmpty(s)) {
							throw new Exception(s);
						}
					}
				});
			} catch (FinIsinDayException e1) {
				/**
				 * 自助柜面在超过财政时间受理凭证的问题
				 * lfj 2016-04-15
				 */
				logger.info("当前时间超出财政办公时间，该凭证已被柜面系统受理！");
				if(!notInDayHandler(sc, voucher)) {
					throw e1;
				}
			} catch (Exception e) {
				logger.error("凭证确认失败，原因请款流程失败，原因：", e);
				throw new Exception(e.getMessage());
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
					List<String> updateFields = new ArrayList<String>();
					updateFields.add("is_self_counter");
					updateFields.add("operate_user_name");
					updateFields.add("payee_account_bank_no");
					updateFields.add("is_same_bank");
					billEngine.updateBill(session, updateFields,
							payVoucherList, false);
					//跨行的数据支付成功之后保存行号到缓存  add by cyq  2016.10.09
					if(0 == payVoucherList.get(0).getIs_same_bank()){
						//转账成功后保存行号
						bankNoService.savePayBankNo(payVoucherList);
					}
				}
			});
			logger.info("自助柜面【" + voucher.getCode() + "】支付结束。。。");
		} catch (FinIsinDayException e1) {
			/**
			 * 不带请款操作，受理时间超时时，根据参数IS_ACCEPT_NOT_IN_DAY判断
			 * lfj 2016-04-15
			 */
			logger.info("当前时间超出财政办公时间，该凭证已被柜面系统受理！");
			if(has_advance == 2) {
				/**
				 * 若不请款，直接转账（不存在垫支户）
				 */
				if(!notInDayHandler(sc, voucher)) {
					throw e1;
				}
			} else {
				/**
				 * 若请款（存在垫支户），已请款，而转账在受理范围外
				 * 强制标记为受理
				 */
				notInDayHandler(sc, voucher, true);
			}
		} catch (Exception e) {
			payVoucherList.get(0).setBusiness_type(-1); //支付失败 更新交易类型为 -1 自助柜面更新
			final List<String> updateFields = new ArrayList<String>();
			payVoucherList.get(0).setIs_self_counter(1);//设置改凭证为自助柜面操作
			updateFields.add("is_self_counter");
			updateFields.add("business_type");
			smallTrans.newTransExecute(new ISmallTransService() {
				@Override
				public void doExecute() throws Exception {
					billEngine.updateBill(session, updateFields,payVoucherList, false);
				}
			});
			logger.error("凭证确认失败，原因转账流程失败，原因：", e);
			throw new Exception(e.getMessage());//edit by lix 2015.7.10 去掉前台显示的XXX.XXX.Exception
		}
		// add by liutianlong 20150506
		// acceptCommonSignPayVoucherNotFlow方法中包含了是否自动签章发送的逻辑，
		// 所以此处判断一下，避免重复发送
		int isSend = PbParameters
				.getIntParameter(PbParaConstant.IS_SEND_PAYVOUCHER);
		if (payVoucherList.get(0).getBusiness_type() == 1 && isSend != 1) {
			try {
				logger.info("自助柜面【" + voucher.getCode() + "】回单开始。。。");
				smallTrans.newTransExecute(new ISmallTransService() {
					@Override
					public void doExecute() throws Exception {
						payService.signAndSendPayVoucherByNoFlow(session, payVoucherList,
								1);
					}
				});
				logger.info("自助柜面【" + voucher.getCode() + "】回单结束。。。");
			} catch (Exception e) {
				logger.error("转账后回单流程失败，原因：", e);
			}
		}
	}

	private final String UPDATE_SELFCOUNT_FLAG_SQL = "UPDATE PB_PAY_VOUCHER SET IS_SELF_COUNTER = ?,OPERATE_USER_NAME = ? WHERE PAY_VOUCHER_CODE = ? AND ADMDIV_CODE = ?  AND YEAR = ?";

	/**
	 * 支付凭证退回【2002】
	 */
	@Override
	public void backPayVouchers(Map<Long, Long> vouMap, final String returnReason,
			final String userCode, Object... objects) {
		final Session sc = new Session();
		// 获取主单单据类型ID
		long billTypeId = Parameters.getLongParameter(PayConstant.BILL_TYPE_PAY_VOUCHER);

		//凭证ID数组
		long[] ids = new long[vouMap.size()];
		//凭证版本号数组
		long[] lastVers = new long[vouMap.size()];
		int i = 0;
		for(Map.Entry<Long, Long> entry : vouMap.entrySet()){
			ids[i] = entry.getKey();
			lastVers[i] = entry.getValue();
			i++;
		}
		
		//凭证列表
		List<PayVoucher> payVoucherList = (List<PayVoucher>) billEngine.loadBillByIds(sc, billTypeId, NumberUtil.toObjectList(ids));
		if(ListUtils.isEmpty(payVoucherList)){
			throw new PbConCurrencyException("未检索到操作的凭证！");
		}
		PbUtil.checkLastver(ids,lastVers, payVoucherList);
		// 明细列表
		List<PayRequest> requestList = (List<PayRequest>) payCommonService.loadDetailsByBill(sc, billTypeId, ids, null);
		// 将明细设置到对应的凭证中
		PbUtil.setBillDetails(payVoucherList, requestList, "pay_voucher_id");
		
		
		sc.setCurrMenuId(-1);
		sc.setTop_org(1);
		sc.setUserCode((String) objects[0]);
		
		//从条件中获取退回原因，如果配置表中退回原因不能为空，校验退回原因不能为空
		int isReturnReasonNotNull = PbParameters.getIntParameter("pb.canReturnReasonNull");
		if(isReturnReasonNotNull == 1 && StringUtil.isEmpty(returnReason)){
			throw new RuntimeException("退回原因不能为空");
		}
		
		//advance.acct.bank ,0-不根据网点过滤；1-根据网点过滤；2-没有垫支户,如果不是没有垫支户，就都进行请款操作
		final int has_advance = PbParameters.getIntParameter("advance.acct.bank");
		//退回异常原因，及对应的凭证号
		final StringBuffer errorBuffer = new StringBuffer();
		for(final PayVoucher payVoucher : payVoucherList){
			try {
				smallTrans.newTransExecute(new ISmallTransService() {
					@Override
					public void doExecute() throws Exception {
						List<PayVoucher> vouList = new ArrayList<PayVoucher>();
						vouList.add(payVoucher);
						//直接进行支付查证
						//支付的交易类型
						payVoucher.setTrade_type(0);
						TransReturnDTO queryPayTrans = transService.queryTrans(sc, payVoucher);
						int  payStatus;
						if(queryPayTrans == null){
							payStatus = TradeConstant.RESPONSESTATUS_NOTCONFIRM;
						}else{
							payStatus = queryPayTrans.getResStatus();
						}
						// 交易状态为成功和不确定transReturn2态不能退票
						if (TradeConstant.RESPONSESTATUS_SUCCESS == payStatus
								|| TradeConstant.RESPONSESTATUS_NOTCONFIRM == payStatus || TransReturnDTO.UNKNOWN == payStatus) {
							throw new Exception(payVoucher.getPay_voucher_code()+" 已支付成功或支付状态不确定，不允许退回！");
						}else{
							//支付是失败的状态
							//如果有垫支户，也可以不查询请款状态，以为核心中支付过且支付失败了，请款基本上是成功的
							if(has_advance != 2){
//								//查询核心中请款交易是否成功
//								//请款的交易类型
//								payVoucher.setTrade_type(1);
//								//查询逻辑进行修改，先查询转账在查询请款，如果已经转账，提示必须转账
//								//如果仅仅是请款成功，则需要进行冲销
//								TransReturnDTO queryReqStatus = transService.queryTrans(sc, payVoucher);
//								int  reqStatus;
//								if(queryReqStatus == null){
//									reqStatus = TradeConstant.RESPONSESTATUS_NOTCONFIRM;
//								}else{
//									reqStatus = queryReqStatus.getResStatus();
//								}
//								//请款成功
//                                if(reqStatus == TradeConstant.RESPONSESTATUS_SUCCESS){
								/**
								 * edit by liutianlong 2016年6月17日
								 * 广西建行：第一次退回财政，冲销失败，进行第二次退回财政时，再在去查请款的交易状态，导致查询不到，
								 * queryTrans查询逻辑对于柜面没有问题，对于自助柜面需要判断最近的一次冲销是不是成功。
								 * 为了便于修改，直接使用Batchreq_status做判断。
								 */
								if(payVoucher.getBatchreq_status() == BatchReqMoneyVoucher.STATUS_SUCCESS){
                                    String error = payService.writeoffVoucher(sc, vouList);
                                    if (StringUtil.isNotEmpty(error)) {
                                        throw new Exception(error);
                                    }
                                }
							}
						}
						payService.returnPayVoucherNoWf(sc, vouList, returnReason==null?"":returnReason, 0);
						try {
							//更新由自助柜面处理标识，操作人姓名信息
							baseDao.execute(UPDATE_SELFCOUNT_FLAG_SQL, new Object[] { 1, userCode, payVoucher.getPay_voucher_code(),payVoucher.getAdmdiv_code(), payVoucher.getYear() });
						} catch (Exception e) {
							logger.error("凭证退回时，更新由自助柜面处理标识，操作人姓名信息出错");
						}
					}
				});
			} catch (Exception e) {
				logger.error("", e);
				errorBuffer.append("【"+payVoucher.getPay_voucher_code()+"】:"+e.getMessage()).append(",");
			}
		}
		if( errorBuffer != null && errorBuffer.length() != 0 ){
			throw new RuntimeException(errorBuffer.toString().substring(0, errorBuffer.length()-1));
		}
		
	}

	/**
	 * 退款流水查询【2003】
	 */
	@Override
	public Map<String, Object> loadRefundSerial(String jsonMap, String payAccountNo,
			String filedNames, Paging page, Object... objects) {
		try {
			//查询区条件
			ConditionObj conditionObj = PbssConditionObjUtils.getConditionObj(jsonMap);
			
			//单位零余额账账号
			ConditionPartObj accountNoObj = new ConditionPartObj(ConditionObj.AND, false, 
						"payee_account_no", ConditionObj.EQUAL, payAccountNo, false, false, "");
			accountNoObj.setDataType(0);
			conditionObj.addConditionPartObj(accountNoObj);	
			
			
			//过滤出收款帐号是零余额，并且付款帐号不是垫支户的账户
			ConditionPartObj accountNoObj1 = new ConditionPartObj(ConditionObj.AND, false, 
						"pay_account_no", "not in", "(select account_no from pb_ele_account where account_type_code = '21')", false, false, "");
			accountNoObj1.setDataType(1);
			conditionObj.addConditionPartObj(accountNoObj1);	
						
			
			String[] fields = JsonUtil.getStringArray4Json(filedNames);
			List<String> filedNameList = Arrays.asList(fields);
			
			long billTypeId = Parameters.getLongParameter(PayConstant.BILL_TYPE_REFUND_SERIAL);
			ReturnPage returnPage = payCommonService.loadPageDataByBillType(sc,filedNameList,conditionObj,page,billTypeId);
			
			
			String jsonArray = JsonUtil.getListViewPaging(returnPage, filedNameList);
			String jonStr = jsonArray.toString();
			
			//回执Map
			Map<String, Object> resMap = new HashMap<String, Object>();
			resMap.put("data", jonStr);  //数据Json字符串
			resMap.put("dataCount", returnPage.getDataCount());  //总条数
			resMap.put("pageCount", returnPage.getPageCount());  //总页数
			
			return resMap;
			
		} catch (Exception e) {
			e.printStackTrace();
		}
		return null;
	}

	/**
	 * 已支付凭证明细查询【2004】
	 */
	@Override
	public String loadPayRequestList(long payVoucherId, String filedNames,
			Paging page, Object... objects) {
		try {
			//查询区条件
			ConditionObj conditionObj = new ConditionObj();
			
			ConditionPartObj voucherIdObj = new ConditionPartObj(ConditionObj.AND, false, 
						"pay_voucher_id", ConditionObj.EQUAL, payVoucherId, false, false, "");
			voucherIdObj.setDataType(0);
			conditionObj.addConditionPartObj(voucherIdObj);	
			
			
			String[] fields = JsonUtil.getStringArray4Json(filedNames);
			List<String> filedNameList = Arrays.asList(fields);
			
			long billTypeId = Parameters.getLongParameter(PayConstant.BILL_TYPE_PAY_REQUEST);
			ReturnPage returnPage = payCommonService.loadPageDataByBillType(sc,new ArrayList<String>(),conditionObj,page,billTypeId);
			
			String jsonArray = JsonUtil.getListViewPaging(returnPage, filedNameList);
			
			
			String jonStr = jsonArray.toString();
			return jonStr;
		} catch (Exception e) {
			e.printStackTrace();
		}
		return null;
	}

	/**
	 * 已支付凭证明细查询【2004】
	 */
	@Override
	public Map<String, Object>loadPayRequestMap(long payVoucherId, String filedNames,
			Paging page, Object... objects) {
		try {
			//查询区条件
			ConditionObj conditionObj = new ConditionObj();
			
			ConditionPartObj voucherIdObj = new ConditionPartObj(ConditionObj.AND, false, 
						"pay_voucher_id", ConditionObj.EQUAL, payVoucherId, false, false, "");
			voucherIdObj.setDataType(0);
			conditionObj.addConditionPartObj(voucherIdObj);	
			
			
			String[] fields = JsonUtil.getStringArray4Json(filedNames);
			List<String> filedNameList = Arrays.asList(fields);
			
			long billTypeId = Parameters.getLongParameter(PayConstant.BILL_TYPE_PAY_REQUEST);
			ReturnPage returnPage = payCommonService.loadPageDataByBillType(sc,new ArrayList<String>(),conditionObj,page,billTypeId);
			
			String jsonArray = JsonUtil.getListViewPaging(returnPage, filedNameList);
			
			
			String jonStr = jsonArray.toString();
			//回执Map
			Map<String, Object> resMap = new HashMap<String, Object>();
			resMap.put("data", jonStr);  //数据Json字符串
			resMap.put("dataCount", returnPage.getDataCount());  //总条数
			resMap.put("pageCount", returnPage.getPageCount());  //总页数
			
			return resMap;
//			return jonStr;
		} catch (Exception e) {
			e.printStackTrace();
		}
		return null;
	}
	/**
	 * 退款通知书录入【2005】
	 */
	@Override
	public void inputRefundVoucher(int refundType,long payVoucherId,final String payVoucherCode,long payRequestId,
			BigDecimal payAmt,String remark,final long transSerialId,final String userCode,final Object...objects) {
		final Session sc = new Session();
//		sc.setCurrMenuId(-1);
		sc.setCurrMenuId(200202);
		sc.setBusiYear(PbUtil.getCurrYear());
		sc.setTop_org(1);
		try {
			//构造退款对象
			final RrefundVoucherDTO rvDto = new RrefundVoucherDTO();
			//0:全单退款 1：明细退款
			rvDto.setBillRef(refundType==0?true:false);
			//全单退款，payId取pay_voucher_id,否则取pay_request_id
			if(rvDto.isBillRef()){
				rvDto.setPayId(payVoucherId);
			}else{
				rvDto.setPayId(payRequestId);
			}
			java.text.DecimalFormat df=new java.text.DecimalFormat("0.00"); 
			BigDecimal npayAmt=new BigDecimal(df.format(payAmt));
			rvDto.setRefReason(remark);
			rvDto.setRefAmount(npayAmt);
			rvDto.setIs_self_counter(1);
			//生成授权支付退款通知书
			rvDto.setPayType(1);
			smallTrans.newTransExecute(new ISmallTransService(){
				@Override
				public void doExecute() throws Exception {
					//生成退款通知书
					final List<PayVoucher> vouchers = payService.inputRefundVoucher(sc, rvDto);
					//更新流水表退款状态为“已提交”（1：待处理 2：已提交），根据退款流水号更新退款通知书号
					int j = baseDao.execute("update pb_trans_serial set refund_status = ? ,ori_pay_voucher_code = ?, refund_pay_voucher_code = ? where trans_serial_id = ? and refund_status = ?", new Object[] {2,payVoucherCode,vouchers.get(0).getPay_voucher_code(), transSerialId, Integer.parseInt(objects[0].toString())});
					if(j == 0){
						throw new RuntimeException("更新状态失败");
					}
					//更新由自助柜面处理标识，操作人姓名信息
					int i = baseDao.execute(UPDATE_SELFCOUNT_FLAG_SQL, new Object[]{1,userCode,vouchers.get(0).getPay_voucher_code(),vouchers.get(0).getAdmdiv_code(),vouchers.get(0).getYear()});
					if(i == 0){
						throw new RuntimeException("更新状态失败");
					}
				}
				
			});
		} catch (Exception e) {
			logger.error("退款通知书生成失败，原因：", e);
			throw new RuntimeException(e.getMessage());
		}
	}
	

	/*@Override
	public void inputRefundVoucher(int refundType, List<Map<String,String>> paraMap, String userCode ,
				 Object...objects){
		sc.setCurrMenuId(200202);
		sc.setBusiYear(PbUtil.getCurrYear());
		sc.setTop_org(1);
		//成功笔数
		int succNum = 0;
		for(Map<String, String> map : paraMap){
			//原凭证ID
			long payVoucherId = Long.parseLong(map.get("sou_vouch_pk"));
//			//原凭证号
//			String payVoucherCode = map.get("sou_vouch_no");
			//原凭证明细ID
			long payRequestId = Long.parseLong(map.get("sou_request_pk"));
			//退款原因
			String remark = map.get("refund_reason");
			//退款金额
			BigDecimal payAmt = new BigDecimal(map.get("refund_amount"));
			//退款流水
			String transSerialId = map.get("trans_serial_no");
			Map<String,Object> returnMap = new HashMap<String,Object>();
			try {
				//构造退款对象
				RrefundVoucherDTO rvDto = new RrefundVoucherDTO();
				//0:全单退款 1：明细退款
				rvDto.setBillRef(refundType==0?true:false);
				//全单退款，payId取pay_voucher_id,否则取pay_request_id
				if(rvDto.isBillRef()){
					rvDto.setPayId(payVoucherId);
				}else{
					rvDto.setPayId(payRequestId);
				}
				rvDto.setRefReason(remark);
				rvDto.setRefAmount(payAmt);
				rvDto.setIs_self_counter(2);
				//生成授权支付退款通知书
				rvDto.setPayType(1);
				//生成退款通知书
				List<PayVoucher> vouchers = payService.inputRefundVoucher(sc, rvDto);
				//送审退款通知书
				payService.auditPayVoucher(sc, vouchers);
				//更新由自助柜面处理标识，操作人姓名信息
				baseDao.execute(UPDATE_SELFCOUNT_FLAG_SQL, new Object[]{1,userCode,vouchers.get(0).getPay_voucher_code(),vouchers.get(0).getAdmdiv_code(),vouchers.get(0).getYear()});
				//更新流水表退款状态为“已提交”（1：待处理 2：已提交），根据退款流水号更新退款通知书号
				baseDao.execute("update pb_trans_serial set refund_status = ? ,refund_pay_voucher_code = ? where trans_serial_id = ?", new Object[] {2,vouchers.get(0).getPay_voucher_code(),transSerialId});
				
				succNum ++ ;
				returnMap.put("tran_status", "退款成功");
			} catch (Exception e) {
				logger.error("退款通知书生成失败，原因：", e);
				returnMap.put("fail_reason", e.getMessage());				
				returnMap.put("tran_status", "退款失败");			
			}
//			resList.add(returnMap);
		}
//		return succNum;
	}*/

	/**
	 * 退款通知书作废【2007】
	 */
	@Override
	public void invalidateRefundVoucher(Map<Long, Long> vouMap, Object... objects) {
		// 获取主单单据类型ID
		long billTypeId = Parameters.getLongParameter(PayConstant.BILL_TYPE_PAY_VOUCHER);

		//凭证ID数组
		long[] ids = new long[vouMap.size()];
		//凭证版本号数组
		long[] lastVers = new long[vouMap.size()];
		int i = 0;
		for(Map.Entry<Long, Long> entry : vouMap.entrySet()){
			ids[i] = entry.getKey();
			lastVers[i] = entry.getValue();
			i++;
		}
		
		//凭证列表
		final List<PayVoucher> payVoucherList = (List<PayVoucher>) billEngine.loadBillByIds(sc, billTypeId, NumberUtil.toObjectList(ids));
		if(ListUtils.isEmpty(payVoucherList)){
			throw new PbConCurrencyException("未检索到操作的凭证！");
		}
		PbUtil.checkLastver(ids,lastVers, payVoucherList);
		
//		// 明细列表
//		List<PayRequest> requestList = (List<PayRequest>) payCommonService.loadDetailsByBill(sc, billTypeId, ids, null);
//		// 将明细设置到对应的凭证中
//		PbUtil.setBillDetails(payVoucherList, requestList, "pay_voucher_id");
		
		final StringBuffer vouCodeStr = new StringBuffer();
		for(PayVoucher payVoucher : payVoucherList){
			if(payVoucher.getBusiness_type()==1){
				throw new RuntimeException("已经退款，无法作废退款申请！");
			}
			vouCodeStr.append(payVoucher.getPay_voucher_code()+",");
		}
		
		sc.setCurrMenuId(-1);
		sc.setTop_org(1);
		try {
			smallTrans.newTransExecute(new ISmallTransService() {
				@Override
				public void doExecute() throws Exception {
					payService.invalidateRefundVoucher(sc, payVoucherList, 2);
					baseDao.execute("update pb_trans_serial set refund_status = ? ,refund_pay_voucher_code = '',ori_pay_voucher_code='' where refund_pay_voucher_code in (?)", new Object[] {1,vouCodeStr.substring(0, vouCodeStr.length()-1)});
				}
				
			});
		} catch (Exception e) {
			throw new RuntimeException("更新密码失败:失败原因"+e.getMessage());
		}
		
		
	}

	/**
	 * 电子文件柜信息查询【2015】
	 */
	@Override
	public String loadElecVoucherList(String jsonMap, String payAccountNo,
			String filedNames, Paging page, Object... objects) {
//查询区条件
		try {
			//jsonMap转换为map
			Map<String, Object> map = JsonMapToMapUtil.changToMap(jsonMap);
			//文件类型（凭证类型）
			String vt_code=map.get("vt_code")==null?"":map.get("vt_code").toString();
			//起始日期
			String startDate=map.get("startDate")==null?"":map.get("startDate").toString();
			//结束日期
			String endDate=map.get("endDate")==null?"":map.get("endDate").toString();
			//是否已读
			String is_read=map.get("is_read")==null?"":map.get("is_read").toString();
			List<PbElecVoucher> list=null;
			/*StringBuffer sql=new StringBuffer(" select * from ( select  a.*,ROWNUM as rn from (select id,case vt_code when '5105'then '授权额度到账通知单'"
                    +" when '8202' then '授权凭证回单'end as vt_code,file_name,vou_date, case vt_code when '8202'then '授权支付'||remark||'元已支付'"
                    +" when '5105' then remark||'元已到账'end as remark ,is_read,save_type,file_directory " 
                    +" from  PB_ELEC_VOUCHER  where 1=1  and pay_account_no='"+payAccountNo+"'");
			*/		
			//统计数据sql
			StringBuffer countSql= new StringBuffer("select count(*) from  PB_ELEC_VOUCHER where 1=1 and pay_account_no='"+payAccountNo+"'");
			if(!StringUtils.isEmpty(startDate)){
				countSql.append("and vou_date >='"+startDate+"'");	
			}
			if(!StringUtils.isEmpty(endDate)){
				countSql.append("and vou_date <='"+endDate+"'");
			}
			if(!StringUtils.isEmpty(vt_code)){
				countSql.append("and vt_code='"+vt_code+"'");
			}
			if(!StringUtils.isEmpty(is_read)){
				countSql.append("and is_read='"+is_read+"'");
			}
			String sql=getSqlByPage(vt_code,startDate,endDate,is_read,payAccountNo,page);
		   // sql.append(") a ) tableAlias where tableAlias.rn>"+page.getStartIndex()+"and tableAlias.rn<="+(page.getStartIndex()+page.getNowPageNo()));
		    logger.info(sql);
		    logger.info(countSql.toString());
		    page.setDataCount(daosupport.queryForInt(countSql.toString()));
		    if(DatabaseUtils.SYSBASE_DB == DatabaseUtils.findLocalDB()){
	            list =daosupport.query(sql, PbElecVoucher.class,page.getNowPageNo(), page.getNowPage());
	        } else {
	            list = daosupport.query(sql,PbElecVoucher.class);
	        }
			String[] fields = JsonUtil.getStringArray4Json(filedNames);
			List<String> filedNameList = Arrays.asList(fields);
			ReturnPage returnPage = new  ReturnPage(list,page);
			String jsonArray = JsonUtil.getListViewPaging(returnPage, filedNameList);
			String jonStr = jsonArray.toString();
			return jonStr;	
		} catch (Exception e) {
			e.printStackTrace();
		}
	    	return null;      
	}
	@Override
	public Map<String, Object> loadElecVoucherMap(String jsonMap, String payAccountNo,
			String filedNames, Paging page, Object... objects) {
		
		//查询去条件
		try {
			//jsonMap转换为map
//			Map<String, Object> map = JsonMapToMapUtil.changToMap(jsonMap);
			Object[] objectArray4Json = JsonUtil.getObjectArray4Json(jsonMap);
			Map map4Json = JsonUtil.getMap4Json(((JSONObject)objectArray4Json[0]).toString());
			Map<String, Object> map = map4Json;
			//文件类型（凭证类型）
			String vt_code=map.get("vt_code")==null?"":((JSONArray)map.get("vt_code")).get(1).toString();
			//起始日期
			String startDate=map.get("startDate")==null?"":((JSONArray)map.get("startDate")).get(1).toString();
			//结束日期
			String endDate=map.get("endDate")==null?"":((JSONArray)map.get("endDate")).get(1).toString();
			//是否已读
			String is_read=map.get("is_read")==null?"":((JSONArray)map.get("is_read")).get(1).toString();
			List<PbElecVoucher> list=null;
			//业务数据sql
//			StringBuffer sql=new StringBuffer(" select * from ( select  a.*,ROWNUM as rn from (select id,case vt_code when '5105'then '授权额度到账通知单'"
//                    +" when '8202' then '授权凭证回单'end as vt_code,file_name,vou_date, case vt_code when '8202'then '授权支付'||remark||'元已支付'"
//                    +" when '5105' then remark||'元已到账'end as remark ,is_read,save_type,file_directory ,pay_voucher_code,year" 
//                    +" from  pb_elec_voucher  where 1=1  and pay_account_no='"+payAccountNo+"'");
			StringBuffer sql=new StringBuffer("select id,case vt_code when '5105'then '授权额度到账通知单'"
                    +" when '8202' then '授权凭证回单'end as vt_code,file_name,vou_date, case vt_code when '8202'then '授权支付'||remark||'元已支付'"
                    +" when '5105' then remark||'元已到账'end as remark ,is_read,save_type,file_directory ,pay_voucher_code,year" 
                    +" from  pb_elec_voucher  where 1=1  and pay_account_no='"+payAccountNo+"'");
			//统计数据sql
			StringBuffer countSql= new StringBuffer("select count(*) from  pb_elec_voucher where 1=1 and pay_account_no='"+payAccountNo+"'");
			if(!StringUtils.isEmpty(startDate)){
				countSql.append("and vou_date >='"+startDate+"'");
				sql.append("and vou_date >='"+startDate+"'");	
			}
			if(!StringUtils.isEmpty(endDate)){
				countSql.append("and vou_date <='"+endDate+"'");
				sql.append("and vou_date <='"+endDate+"'");
			}
			if(!StringUtils.isEmpty(vt_code)){
				countSql.append("and vt_code='"+vt_code+"'");
				sql.append("and vt_code='"+vt_code+"'");
			}
			if(!StringUtils.isEmpty(is_read)){
				countSql.append("and is_read='"+is_read+"'");
				sql.append("and is_read='"+is_read+"'");
			}
			String querySql = getSqlByPage(sql.toString(),page);
		  //  sql.append(") a ) tableAlias where tableAlias.rn>"+((page.getNowPage()-1)*(page.getNowPageNo()))+"and tableAlias.rn<="+((page.getNowPage()*page.getNowPageNo())));
		    logger.info(querySql);
		    logger.info(countSql);
		    
		    page.setDataCount(daosupport.queryForInt(countSql.toString()));
		    if(DatabaseUtils.SYSBASE_DB == DatabaseUtils.findLocalDB()){
	            list =daosupport.query(querySql, PbElecVoucher.class,page.getNowPageNo(), page.getNowPage());
	        } else {
	            list = daosupport.query(querySql,PbElecVoucher.class);
	        }
		//    list=daosupport.query(sql.toString(), PbElecVoucher.class);
			String[] fields = JsonUtil.getStringArray4Json(filedNames);
			List<String> filedNameList = Arrays.asList(fields);
			ReturnPage returnPage = new  ReturnPage(list,page);
			String jsonArray = JsonUtil.getListViewPaging(returnPage, filedNameList);
			String jonStr = jsonArray.toString();
			
			//回执Map
			Map<String, Object> resMap = new HashMap<String, Object>();
			resMap.put("data", jonStr);  //数据Json字符串
			resMap.put("dataCount", returnPage.getDataCount());  //总条数
			resMap.put("pageCount", returnPage.getPageCount());  //总页数
			
			return resMap;
		} catch (Exception e) {
			e.printStackTrace();
		}
	    	return null;      
	}
	/**
	 * 拼装sql
	 * @param sql
	 * @param page
	 * @return
	 */
	private String getSqlByPage(String sql, Paging page){
		int startIndex = (page.getNowPage() - 1) * page.getNowPageNo();
		int endIndex = page.getNowPage() * page.getNowPageNo();
		StringBuffer buffer = new StringBuffer();
		if(DatabaseUtils.SYSBASE_DB == DatabaseUtils.findLocalDB()) {
			buffer.append(sql);
		} else if(DatabaseUtils.ORACLE_DB == DatabaseUtils.findLocalDB()){
			buffer.append("select b.* from (select p.*,rownum as Sqlpageid from (").append(sql).append(" ) p where rownum<=" + endIndex + ")"
				+ " b where b.Sqlpageid>" + startIndex);
		}else if(DatabaseUtils.DB2_DB == DatabaseUtils.findLocalDB()){
			buffer.append("select * from (select p.*,rownumber() over() as rowid from (").append(sql).append(" ) p )"
					+ " tableAlias where tableAlias.rowid>" + startIndex+" and tableAlias.rowid<="+endIndex);
		}else{
			int limitCount = endIndex - startIndex;
			buffer.append(sql+" limit "+limitCount).append(" offset "+page.getStartIndex());;
		}
		sql = buffer.toString();
		return sql;
	}
//获得分页sql
	private String getSqlByPage(String vt_code,String startDate,String endDate,String is_read,String payAccountNo,Paging page){
		StringBuffer sql=new StringBuffer("select id,case vt_code when '2104'then '授权额度到账通知单'"
                +" when '8202' then '授权凭证回单'end as vt_code,file_name,vou_date, case vt_code when '8202'then '授权支付'||remark||'元已支付'"
                +" when '2104' then remark||'元已到账'end as remark ,is_read,save_type,file_directory,vou_date" 
                +" from  PB_ELEC_VOUCHER  where 1=1  and pay_account_no='"+payAccountNo+"'");
		if(!StringUtils.isEmpty(startDate)){
			sql.append("and vou_date >='"+startDate+"'");	
		}
		if(!StringUtils.isEmpty(endDate)){
			sql.append("and vou_date <='"+endDate+"'");
		}
		if(!StringUtils.isEmpty(vt_code)){
			sql.append("and vt_code='"+vt_code+"'");
		}
		if(!StringUtils.isEmpty(is_read)){
			sql.append("and is_read='"+is_read+"'");
		}
		int startIndex = (page.getNowPage() - 1) * page.getNowPageNo();
		int endIndex = page.getNowPage() * page.getNowPageNo();
		StringBuffer buffer=new StringBuffer();
		if(DatabaseUtils.SYSBASE_DB == DatabaseUtils.findLocalDB()) {
			return sql.toString();
		}else if(DatabaseUtils.ORACLE_DB == DatabaseUtils.findLocalDB()){
			buffer.append("select b.* from (select p.*,rownum as Sqlpageid from (").append(sql).append(" ) p where rownum<=" + endIndex + ")"
				+ " b where b.Sqlpageid>" + startIndex);
			return buffer.toString();
		}else if(DatabaseUtils.DB2_DB == DatabaseUtils.findLocalDB()){
			buffer.append("select * from (select p.*,rownumber() over() as rowid from (").append(sql).append(" ) p )"
					+ " tableAlias where tableAlias.rowid>" + startIndex+" and tableAlias.rowid<="+endIndex);
			return buffer.toString();
		}else{
			int limitCount = endIndex - startIndex;
			buffer.append(sql+" limit "+limitCount).append(" offset "+page.getStartIndex());;
			return buffer.toString();
		}
	}
	/**
	 * 电子文件PDF下载 【2016】
	 */
	 /*
	@Override
	public byte[] downloadElecVoucherPDF(long id, int saveType,String fileDirectory, String fileName) {
		ByteArrayOutputStream  allOutputStream = new ByteArrayOutputStream();
		byte[] dbyte=null;
		//需要下载的文件
		File file=new File(fileDirectory+File.separator+fileName);
		if(!file.exists()){
		    throw new PbException("文件不存在");
		}else{
		    long fileSize=file.length();
		    if(fileSize>Integer.MAX_VALUE){
		        logger.info("文件内容太大");
		        return null;
		    }
		    FileInputStream fis;
			dbyte=new byte[(int)fileSize];
			try {
				fis=new FileInputStream(file);
				while(fis.read(dbyte)!=-1){
					allOutputStream.write(dbyte);
				}
			} catch (Exception e) {
				e.printStackTrace();
			}   
		}
		return allOutputStream.toByteArray();
	}*/
	
	/**
	 * 标记已读 【2017】
	 */
	@Override
	public void signElecVoucherReaded(long id) {
		String sql="update PB_ELEC_VOUCHER set is_read=1 where id='"+id+"'";
		baseDao.execute(sql);
	}
    /**
     * 电子文件PDF下载 支持批量下载 【2016】;
     * @author hmy
     * 压缩文件工具类 zip格式 zipFile
     */
	@Override 
	public byte[] downloadElecVoucherPDF(String jsonMap) {
		ByteArrayOutputStream allOutputStream=new ByteArrayOutputStream();
		JSONArray jsonArray=JSONArray.fromObject(jsonMap);
		byte[] dbyte=null;
		if(jsonArray.size()==1){
			JSONObject jsonObject=jsonArray.getJSONObject(0);	
			String fileName=jsonObject.get("file_name").toString();
			String fileDirectory=jsonObject.get("file_directory").toString();
			File file=new File(fileDirectory+File.separator+fileName);
			try {
				long fileSize=file.length();
				dbyte=new byte[(int)fileSize];
				FileInputStream fis=new FileInputStream(file);
				while(fis.read(dbyte)!=-1){
					allOutputStream.write(dbyte);
				}
				return allOutputStream.toByteArray();
			  } catch (Exception e) {
				e.printStackTrace();
			}
    	}else{
    		File zipFile=new File("C:/zipFile.zip");
    		ZipOutputStream zout=null;
    		FileOutputStream fios=null;
    		FileInputStream fis=null;
    		try {
    			if(!zipFile.exists()){
    	    		   zipFile.createNewFile();
    	    		}
    	    		List<File> files=new ArrayList<File>();
    	    		for(int i=0;i<jsonArray.size();i++){
    	    			String fileName=jsonArray.getJSONObject(i).get("file_name").toString();
    	    			String fileDirectory=jsonArray.getJSONObject(i).get("file_directory").toString();
    	    			File file1=new File(fileDirectory+File.separator+fileName);
    	    			files.add(file1);
    	    		}
    	    	fios= new FileOutputStream(zipFile);
    	    	zout=new ZipOutputStream(fios);
	    		ZipFileUtil.zipFile(files, zout);
	    		fis=new FileInputStream(zipFile);
	    		long fileSize=zipFile.length();
				dbyte=new byte[(int)fileSize];
				while(fis.read(dbyte)!=-1){
					allOutputStream.write(dbyte);
			    }
				zout.close();
				fios.close();
				fis.close();
				return allOutputStream.toByteArray();
			} catch (Exception e) {
				e.printStackTrace();
		    }finally{
		    	//文件读取完毕,临时文件删除
				zipFile.delete();	
	      }
	    }
		return dbyte;
	}
	
	/**
	 * 电子文件查看
	 */
	@Override
	public byte[] viewElecVoucher(long id, String filename,
			String filedirectory) {
		ByteArrayOutputStream byteOS = new ByteArrayOutputStream();
		File file=new File(filedirectory+filename);
		boolean flag  =true;
        if (!file.exists()) {
    		 flag = createEvocherImageService.createSingleEvocher(id);
		}
		if (!flag) {throw new RuntimeException("生成文件失败");}
		if (!file.exists()) {throw new RuntimeException("文件未找到");}
		FileInputStream is = null;
		try {
			byte[] bytes = new byte[1024*1024];
			 is = new FileInputStream(file);
			while((is.read(bytes))!=-1){
				byteOS.write(bytes);
			}
			is.close();
		} catch (Exception e) {
			e.printStackTrace();
		}finally{
			if (is!=null) {
				try {
					is.close();
				} catch (IOException e) {
					e.printStackTrace();
				}
			}
		}
		return byteOS.toByteArray();
	}
	
	/**
	 * 查询关联账户
	 */
	@Override   
	public String loadRelateAcct(String jsonMap, String fieldNames,
			String payAccountNo, Paging page, Object... objects) {
		Session sc = new Session();
		try {
			// conditionObj作为过滤条件
			ConditionObj conditionObj = PbssConditionObjUtils.getConditionObj(jsonMap);
			// 调用银行核心
			List<RelationAccountDTO> relateActts=(List<RelationAccountDTO>) transService.queryAcctInfo(sc, payAccountNo, conditionObj);
			String[] fields = JsonUtil.getStringArray4Json(fieldNames);
			List<String> filedNameList = Arrays.asList(fields);
			
			ReturnPage returnPage = new ReturnPage(relateActts, page);
			
			String jsonArray = JsonUtil.getListViewPaging(returnPage, filedNameList);
			String jonStr = jsonArray.toString();
			return jonStr;
		} catch (Exception e) {
			e.printStackTrace();
		}
		return null;
	}
	
	/**
	 * 关联账户明细查询
	 */
	@Override
	public String loadRelatedAccountDetails(String jsonMap, String fieldNames,
			String acctNo, Paging page, Object... objects) {
		Session sc = new Session();
		try {
			// conditionObj作为过滤条件
			ConditionObj conditionObj = PbssConditionObjUtils.getConditionObj(jsonMap);
			// 调用银行核心
			List<AccountTransDetailDTO> relateActts=(List<AccountTransDetailDTO>) transService.querySerial(sc, objects);
			String[] fields = JsonUtil.getStringArray4Json(fieldNames);
			List<String> filedNameList = Arrays.asList(fields);
			
			ReturnPage returnPage = new ReturnPage(relateActts, page);
			
			String jsonArray = JsonUtil.getListViewPaging(returnPage, filedNameList);
			String jonStr = jsonArray.toString();
			return jonStr;
		} catch (Exception e) {
			e.printStackTrace();
		}
		return null;
	}
	
	

	@SuppressWarnings("unchecked")
	@Override
	public List<RelationAccount> loadRelationAccount(String payAccountNo,
			Map<String, Object> paraMap, Object... objects) {
		Session sc = new Session();
		try {
			return (List<RelationAccount>) transService.queryAcctInfo(sc, payAccountNo,paraMap, objects);
		} catch (Exception e) {
			e.printStackTrace();
		}
		return null;
	}

	@SuppressWarnings("unchecked")
	@Override
	public List<RelationAccountDetail> loadRelationAccountDetail(
			 Map<String, Object> paraMap,
			Object... objects) {
		Session sc = new Session();
		try {
			return (List<RelationAccountDetail>) transService.querySerial(sc, paraMap, objects);
		} catch (Exception e) {
			e.printStackTrace();
		}
		return null;
	}

	@Override
	public String getUkeyId(String userLoginCode) {
		
		String agency_code = userLoginCode;
		String querySql =  "select UKEY_CODE from pb_user_signzero_no where user_login_code = ? and cis_valide = 1";
		List<UserSignZeroNo> userSignZeroNos = baseDao.queryForList(querySql, new Object[]{agency_code}, new RowMapper<UserSignZeroNo>() {

			@Override
			public UserSignZeroNo mapRow(ResultSet arg0, int arg1)
					throws SQLException {
				UserSignZeroNo userSignZeroNo = new UserSignZeroNo();
				userSignZeroNo.setUkey_code(arg0.getString("ukey_code"));
				return userSignZeroNo;
			}
			
		});
		if (userSignZeroNos.size() == 0) {
			throw new RuntimeException("请到银行柜台办理签约业务！");
		}
		if (userSignZeroNos.size() > 1) {
			throw new RuntimeException("请到银行柜台确认该UKey的有效性！");
		}
		
		if (userSignZeroNos.size() == 1) {
			if (StringUtil.isTrimEmpty(userSignZeroNos.get(0).getUkey_code())) {
				throw new RuntimeException("请到银行柜台办理签约业务！");
			}else {
				return userSignZeroNos.get(0).getUkey_code();
				
			}
		}
		
		throw new RuntimeException("请到银行柜台办理签约业务！");
	}
	
	

	/**
	 * 将补录的行号更新到业务表
	 */
	@Override
	public void saveBankNo(String payVoucherIdsStr, String payeeBankNo) {
		String sql = "update pb_pay_voucher set payee_account_bank_no = "+payeeBankNo +" where "
			+ "pay_voucher_id in (" + payVoucherIdsStr +")";
		baseDao.execute(sql);
	}

	@Override
	public void sendSmsForLogin(Map<String, String> reqConditions)
			throws Exception {
		String loginCode = reqConditions.get("userLoginCode");
		String agencyCode = reqConditions.get("agencyCode");
		String verifyCode = reqConditions.get("smsCode");
		List<UserSignZeroNo> customerSignList = baseDao.queryForList("select * from pb_user_signzero_no where agency_code = ? and user_login_code = ? and cis_valide = 1",
				new Object[] { agencyCode, loginCode },new ComplexMapper(UserSignZeroNo.class));
		if(ListUtils.isEmpty(customerSignList)){
			throw new RuntimeException("用户【"+loginCode+"】不存在！");
		}
		UserSignZeroNo userSignZeroNo = customerSignList.get(0);
		//发送短信
		String content = String.format("【柜面系统】 %1$s，您的自助柜面系统短信验证码:%2$s,请勿转发!",userSignZeroNo.getUser_login_code(),verifyCode);
		SmsClient.sendMessage(userSignZeroNo.getPhone_no(), content);  
		
	}
	
	private boolean notInDayHandler(Session sc,PayVoucher voucher) {
		int isAcceptNotInDay = PbParameters.getIntParameter(SsConstant.IS_ACCEPT_NOT_IN_DAY);
		return notInDayHandler(sc, voucher, isAcceptNotInDay == 1);
	}
	
	private boolean notInDayHandler(Session sc,PayVoucher voucher, boolean isAcceptNotInDay) {
		if(isAcceptNotInDay) {
			voucher.setIs_accept(1);//设置支付是否受理为  -1已受理
			voucher.setIs_self_counter(1);
			List<String> updateFields = new ArrayList<String>();
			updateFields.add("is_accept");
			updateFields.add("is_self_counter");
			List<PayVoucher> array = new ArrayList(1);
			array.add(voucher);
			billEngine.updateBill(sc, updateFields, array, false);
			return true;
		}
		return false;
	}

	@SuppressWarnings("unchecked")
	@Override
	public List<Map<String, String>> getZeroNo(String customer) {
		 String queryAccount =  "select * from pb_user_zerono_property where customno = ? and isvalide = 1";
		 final BankAccountDao  bankDao = (BankAccountDao)StaticApplication.getBean("bankAccountDAO");
		 List<Map<String, String>> resMapList = baseDao.queryForList(queryAccount, new Object[]{customer}, new RowMapper<Map<String, String>>() {
				@Override
				public Map<String, String> mapRow(ResultSet rs, int rowNum) throws SQLException {
					Map<String, String> map = new HashMap<String, String>();
					map.put("account_code", rs.getString("accountcode"));
					BankAccount account = bankDao.queryAccountByAccountNo(IBankAccountService.TYPE_AGENCY_ZERO_ACCOUNT, rs.getString("accountcode"), null);
					map.put("account_name", account.getAccount_name());
					return map;
				}
			});
		 return resMapList;
	}
	
	/**
	 * 自助柜面请款
	 * @param sc
	 * @param payVoucherList
	 * @return
	 * @throws Exception
	 */
	private String reqMoney(Session sc, List<PayVoucher> payVoucherList)
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

	
	@Override
	public int checkTransPassword(String password,String loginCode) {		
		String sql = "select * from pb_user_signzero_no where user_login_code=?";
		List<UserSignZeroNo> list = baseDao.queryForList(sql, new String[]{loginCode}, new ComplexMapper(UserSignZeroNo.class));		
		//密码
		String userPsw = list.get(0).getUser_password();
		//交易失败次数
		int num = list.get(0).getLogin_fail_num();		
		SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd"); 
		//登录成功日期
        String date = null;
        if(null!=list.get(0).getLast_login_date()) date=sdf.format(list.get(0).getLast_login_date());
        //当前日期
        String nowTime =DateTimeUtils.getCurrentTime("yyyy-MM-dd");
        //如果失败次数为5，直接返回不校验
        if(num == 5&&date.compareTo(nowTime) == 0){
        	return num;
        }
        else{
		//密码不一致
		if(!(userPsw.equals(password))){
			//错误次数+1
			num ++;			
			//如果次数等于5并且操作日期是当天
			if(num > 5 && date.compareTo(nowTime) == 0){
			  return num;
			}	
			//小于5时更新错误次数
			baseDao.execute("update pb_user_signzero_no set login_fail_num = login_fail_num+1,last_login_date= to_date('"+nowTime+"','yyyy-MM-dd') where user_login_code='"+loginCode+"'");
		}
		//如果密码一致
		else if(userPsw.equals(password) && num!=0){
			num = 0;
			baseDao.execute("update pb_user_signzero_no set login_fail_num =0 where user_login_code='"+loginCode+"'");
		}	
      }
		return num;
	}

	@Override
	public int same2other(String pay_voucher_code, String pay_voucher_id) {
		return baseDao.execute("update pb_pay_voucher set is_same_bank=0 where pay_voucher_id = "+pay_voucher_id);		
	}
	
}

