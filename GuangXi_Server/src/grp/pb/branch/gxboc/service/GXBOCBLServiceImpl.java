package grp.pb.branch.gxboc.service;

import static grp.pt.pb.util.PayConstant.BILL_TYPE_PAY_VOUCHER;
import grp.pt.bill.ConditionObj;
import grp.pt.bill.ConditionPartObj;
import grp.pt.bill.OrderObj;
import grp.pt.database.sql.SimpleQuery;
import grp.pt.pb.assp.handler.XmlConstant;
import grp.pt.pb.common.BalanceService;
import grp.pt.pb.common.IBankAccountService;
import grp.pt.pb.common.IBankNoService;
import grp.pt.pb.common.impl.PayCommonService;
import grp.pt.pb.common.model.BankAccount;
import grp.pt.pb.exception.PbException;
import grp.pt.pb.payment.PayRequest;
import grp.pt.pb.payment.PayService;
import grp.pt.pb.payment.PayVoucher;
import grp.pt.pb.payment.RrefundVoucherDTO;
import grp.pt.pb.plan.PlanBalance;
import grp.pt.pb.realpay.RealPayService;
import grp.pt.pb.trans.model.TransReturnDTO;
import grp.pt.pb.trans.util.Context;
import grp.pt.pb.trans.util.TransUtil;
import grp.pt.pb.util.PbUtil;
import grp.pt.pb.util.StaticApplication;
import grp.pt.pb.util.TradeConstant;
import grp.pt.pb.util.VtConstant;
import grp.pt.util.BaseDAO;
import grp.pt.util.ComplexMapper;
import grp.pt.util.DateTimeUtils;
import grp.pt.util.Parameters;
import grp.pt.util.StringUtil;
import grp.pt.util.model.Session;
import grp.pt.util.transation.ISmalTrans;
import grp.pt.util.transation.ISmallReturnService;
import grp.pt.util.transation.ISmallTransService;

import java.math.BigDecimal;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.Map;

import org.apache.log4j.Logger;

import com.river.common.UploadFileUtil;

@SuppressWarnings({ "deprecation", "unused" })
public class GXBOCBLServiceImpl {
	
	//private static String updateToLoad = "update pb_pay_voucher set blloadtime = 0 where pay_voucher_id =?";
	private static String updateToLoad = "update pb_pay_voucher set blloadtime = ? ";
	
	private static String loadAccount = "select * from pb_ele_account where account_type_code = ? and admdiv_Code = ? and account_no = ?";
	
	
	private static TransForGXBOCServiceImpl transService;
	private static PayService payService;
	private static TransForGXBOCServiceImpl payServiceForGXBOC;
	private static BaseDAO baseDao;
	private static RealPayService realPayService;
	private static IBankAccountService acctService;
	private static Logger log = Logger.getLogger(GXBOCBLServiceImpl.class);
	private static String updateToNotDownload = "update pb_pay_voucher set BLLoadTime = -1 ";
	
	private static IBankNoService bankNoService;
	static{
		
		  if(baseDao==null){
			  baseDao = StaticApplication.getBaseDAO();
		  }
		  if(payService==null){
			  payService = StaticApplication.getPayService();
		  }
		  if(transService==null){
			  transService = (TransForGXBOCServiceImpl) StaticApplication.getBean("transForGXBOCServiceImpl");
			  payServiceForGXBOC =transService;
		  }
		  if(realPayService == null){
			  realPayService = StaticApplication.getRealPayService();
		  }
		  
		  if(acctService == null){	  
			  acctService = StaticApplication.getBankAccountService();
		  }
		  
		  if(bankNoService == null){
			  bankNoService = (IBankNoService) StaticApplication.getBean("pb.common.impl.BankNoService");
		  }
	}
	/**
	 * 网点账户权限列表查询（2401）
	 * @param sc
	 * @param reqHead
	 * @param reqBody
	 * @return
	 * @throws Exception
	 */
	@SuppressWarnings("unchecked")
	public List<BankAccount> netWorkUserQuery(Session sc,GXBOCBLMsgHead reqHead,GXBOCBLMsgReqBody reqBody) throws Exception{
		String accountType = null;
		//凭证类型（1=直接支付；2=授权支付3实拨） 
		//发过来的报文头中该值可以为空  查询所有类型的账户
		if("1".equals(reqHead.getVt_type())){
			accountType = IBankAccountService.TYPE_MOF_ZERO_ACCOUNT;
		}else if("2".equals(reqHead.getVt_type())){
			accountType = IBankAccountService.TYPE_AGENCY_ZERO_ACCOUNT;
		}else if("3".equals(reqHead.getVt_type())){
			accountType = IBankAccountService.TYPE_MOF_REALFUND_ACCOUNT;
		}else if(StringUtil.isEmpty(reqHead.getVt_type())){
			accountType = IBankAccountService.TYPE_MOF_ZERO_ACCOUNT+","+IBankAccountService.TYPE_AGENCY_ZERO_ACCOUNT+","+ IBankAccountService.TYPE_MOF_REALFUND_ACCOUNT;
		}else{
			throw new Exception("不支持该类型账户的查询:"+reqHead.getVt_type());
		}
		
		//return acctService.loadAccounts(reqHead.getAdmdiv_code(), reqHead.getBank_no(), accountType);
		
		//String load_hasPayData_account = "select * from pb_ele_account where bank_code =? and admdiv_Code = ? and account_type_code in ("+accountType+") and account_no in (select pay_account_no from pb_pay_voucher where business_type = 0  and vt_code in("+VtConstant.DIRECT_VT_CODE+","+VtConstant.ACCREDIT_VT_CODE+"))";
		
		
		String load_hasPayData_account = "select * from pb_ele_account where bank_code =? and admdiv_Code = ? "
			+" and account_type_code in ("+accountType+")"
			+" and ( account_no in "
			+" (select pay_account_no from pb_pay_voucher "
			//xcg 2016-9-26 11:57:29  没有待支付凭证，BL查询零余额账户剩余额度(没有替换测试环境)
			+" where business_type in (0,1) " 
			+" and vt_code in("+VtConstant.DIRECT_VT_CODE+","+VtConstant.ACCREDIT_VT_CODE+"))"
			+" or account_no in (select pay_account_no from pb_realpay_budget_voucher where business_type in(0,-1) and vt_Code ="+VtConstant.APPLY_REALPAY_VT_CODE+" ))";
		
		
		return baseDao.queryForList(load_hasPayData_account, new Object[]{reqHead.getBank_no(),reqHead.getAdmdiv_code() }, new ComplexMapper(BankAccount.class));
	}
	/**
	 * 待确认支付凭证列表下载请求（2000）
	 * @param sc
	 * @param reqHead
	 * @param reqBody
	 * @throws Exception 
	 */
	public List<PayVoucher> loadUncfVou(Session sc,GXBOCBLMsgHead reqHead,GXBOCBLMsgReqBody reqBody,Context context) throws Exception{
		
		ConditionObj conditionObj = new ConditionObj();
		
		String vt_code = "";
		String account_type ;
		if(GXBOCBLConstant.BL_DIRECTVOU_FLAG.equals(reqHead.getVt_type())){
			vt_code = VtConstant.DIRECT_VT_CODE;
			
			account_type = IBankAccountService.TYPE_MOF_ZERO_ACCOUNT;
			
		}else if(GXBOCBLConstant.BL_ACCREDITVOU_FLAG.equals(reqHead.getVt_type())){
			vt_code = VtConstant.ACCREDIT_VT_CODE;
			account_type = IBankAccountService.TYPE_AGENCY_ZERO_ACCOUNT;
		}else if(GXBOCBLConstant.BL_REALPAY_FLAG.equals(reqHead.getVt_type())){
			throw new Exception("此功能暂未实现");
		}else{
			throw new Exception("不支持该类型的功能"+reqHead.getVt_type());
		}
		conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"ADMDIV_CODE",SimpleQuery.EQUAL,reqHead.getAdmdiv_code(),false,false,""));	
		conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"VT_CODE",SimpleQuery.EQUAL,vt_code,false,false,""));
		//BUSINESS_TYPE 0支付支付、1支付成功 2退回
		conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"BUSINESS_TYPE",SimpleQuery.EQUAL,0,false,false,""));
		conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"YEAR",SimpleQuery.EQUAL,reqHead.getYear(),false,false,""));
		conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"PAY_ACCOUNT_NO",SimpleQuery.EQUAL,reqBody.getObjs()[0],false,false,""));
		System.out.println("当前时间轴:"+DateTimeUtils.getLastVer());
		//conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"( BLLoadTime",SimpleQuery.LESS,DateTimeUtils.getLastVer()-context.getBlDataOutTime()+" or Payuser_Code=1) ",false,false,""));
		
		conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,true," BLLoadTime",SimpleQuery.LESS,DateTimeUtils.getLastVer()-context.getBlDataOutTime(),false,false,""));
		
		conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.OR,false," Payuser_Code",SimpleQuery.EQUAL,reqHead.getOperator(),true,false,""));
		conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false," BLLoadTime",SimpleQuery.NOT_EQUAL,-1,false,false,""));
		
		//批量查询只查询标准转账的数据
		if (reqBody.getObjs()[1]!=null && !"".equals(reqBody.getObjs()[1])) {
			conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"PAY_VOUCHER_CODE",SimpleQuery.EQUAL,reqBody.getObjs()[1].toString(),false,false,""));
		}else{
			conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"SET_MODE_NAME",SimpleQuery.NOT_LIKE,"%现金%",false,false,""));
			conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"PAY_MGR_NAME",SimpleQuery.NOT_LIKE,"%限额%",false,false,""));
			conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"PAYEE_ACCOUNT_NO",SimpleQuery.NOT_EQUAL,"",false,false,""));
		}
		
		OrderObj orderObj=new OrderObj();
		
		orderObj.setFieldName("pay_voucher_code");
		orderObj.setSortMode(true);
		conditionObj.addOrderByKey(orderObj);
		
		orderObj=new OrderObj();
		orderObj.setFieldName("vou_date");
		orderObj.setSortMode(true);
		conditionObj.addOrderByKey(orderObj);
		
		List<PayVoucher> vouList = payService.loadPayVoucherByObj(sc,conditionObj); 
		
		bankNoService.setPayBankNo(vouList);
		
		int i = baseDao.execute(loadAccount, new Object[]{account_type,reqHead.getAdmdiv_code(),reqBody.getObjs()[0]});
		
		if(i==0){
			PbUtil.batchSetValue(vouList, "bl_voucher_Status",
					"A");
		}
		return vouList;
	}
	/**
	 * 支付凭证确认（或退票）请求2002
	 * @param sc
	 * @param voulist
	 * @throws Exception
	 */
	/**
	 * @param sc
	 * @param voulist
	 * @throws Exception
	 */
	public void payAffirm(Session sc,List<PayVoucher> voulist) throws Exception{
		StringBuffer errMsg = new StringBuffer();
		bankNoService.savePayBankNo(voulist);
		try{
			updateToNotDownLoad(voulist);
		for(PayVoucher tempVou:voulist){
			
			 try{
				 List<PayVoucher> tempVouList= new ArrayList<PayVoucher>();
				 
				 tempVouList.add(tempVou);
				if(tempVou.getBlReqPayOperation()==GXBOCBLConstant.BLReqOperation_NOT_DISPOSE){
					
					//this.setPayVoucherToLoad(tempVou);
					
				}else if(tempVou.getBlReqPayOperation()==GXBOCBLConstant.BLReqOperation_PAY){
					
					
					 String account_type =tempVou.getVt_code().equals(VtConstant.DIRECT_VT_CODE)
	 			 	    ?IBankAccountService.TYPE_MOF_ZERO_ACCOUNT:IBankAccountService.TYPE_AGENCY_ZERO_ACCOUNT;
	 			     
					 String tempVoucherCode =  tempVou.getPay_voucher_code();
					 String tempSummaryName = tempVou.getPay_summary_name();
	 			     //未考虑现金支付的情况 只做请款操作
	 			     //0未请款  1请款失败或超时 2请款成功(支付失败)
	 			     String exceptionMsg="";
	 			     
	 			     tempVou.setTrade_type(TradeConstant.PAY2ADVANCE_WRITEOFF);
					 
	 			     TransReturnDTO transReturn =transService.queryTransNotSaveLog(sc, tempVou);
					 //如果发生过撤单操作且发送退款操作 即使未退回成功  不可以发生再次支付操作 否则 对转账控制麻烦
	 			     if(tempVou.getBusiness_type()==XmlConstant.VOUCHERFLAG_VALUE_BACK){
	 			    	 exceptionMsg = "已撤单、无法支付";
	 			     }else if(transReturn.getResStatus()!=TradeConstant.RESPONSESTATUS_NOTRECEIVE){
						
						 exceptionMsg = "已发过撤单操作的数据 不可再次支付";
					 
						 
					 }
//	 			     else if(tempVou.getPb_set_mode_code().equals(GXBOCBLConstant.TRANS_TYPE_OFFICIAL_CARD)){
//						 exceptionMsg = "公务卡暂时未处理";
//					 }
//					 else if(tempVou.getPb_set_mode_code().equals(GXBOCBLConstant.TRANS_TYPE_CREDIT_CARD)){
//						 exceptionMsg = "信用卡暂时未处理";
//					 }
					 else if(tempVou.getPb_set_mode_code().equals(GXBOCBLConstant.TRANS_TYPE_CASH)) {   //现金交易
						 if(tempVou.getBusiness_type() ==1 ){
							 exceptionMsg = "此现金凭证已支付";
						 }else if(tempVou.getVoucherFlag()==GXBOCBLConstant.VOUCHERFLAG_VALUE_BACK_FAIL){
							 exceptionMsg = "已发生过撤单操作、不可再次支付";
						 }
					 }else if(tempVou.getBatchreq_status()==0){
						 
						 exceptionMsg = payService.batchReqMoney(sc, tempVouList, account_type);
						 // xcg
						 if(!StringUtil.isEmpty(exceptionMsg) && tempVou.getBatchreq_status()==-1){
							 List<String> updateFileList = new ArrayList<String>();
							 updateFileList.add("blloadtime");
							 tempVou.setBlLoadTime(0);
							 transService.getBillEngine().updateBill(sc, updateFileList, tempVouList, false);
						 }
	 			    
					 }else if(tempVou.getBatchreq_status()==-1){
						
						 exceptionMsg = payService.batchRepeatReqMoney(sc ,tempVouList, account_type);
	 			 
					 }else if(tempVou.getBatchreq_status()==1 && tempVou.getBusiness_type()==1 &&tempVou.getSend_flag()==1){
	 					
						 exceptionMsg  = "该笔已支付成功";
					 
					 }	 
	 			     //转账以后对相关字段进行恢复处理				 
					 tempVou.setPay_voucher_code(tempVoucherCode);
					 tempVou.setTrade_type(0);
					 tempVou.setPay_summary_name(tempSummaryName);
					 tempVou.setBank_setmode_code(tempVou.getPb_set_mode_code());
					//xcg 2015-11-23 21:21:12  tempVouList中的bank_setmode_name不对
					 if("1".equals(tempVou.getPb_set_mode_code())){
						 tempVou.setBank_setmode_name("同城同行");
					 }else if("2".equals(tempVou.getPb_set_mode_code())){
						 tempVou.setBank_setmode_name("同城跨行");
					 }else if("3".equals(tempVou.getPb_set_mode_code())){
						 tempVou.setBank_setmode_name("异地同行");
					 }else if("4".equals(tempVou.getPb_set_mode_code())){
						 tempVou.setBank_setmode_name("异地跨行");
					 }else if("7".equals(tempVou.getPb_set_mode_code())){
						 tempVou.setBank_setmode_name("信用卡");
					 }else if("8".equals(tempVou.getPb_set_mode_code())){
						 tempVou.setBank_setmode_name("公务卡");
					 }else if("9".equals(tempVou.getPb_set_mode_code())){
						 tempVou.setBank_setmode_name("现金");
					 }
					 tempVou.setOperate_user_name(tempVou.getPayUser_code());
					 if(StringUtil.isEmpty(exceptionMsg)){
				    	 try{
				    		 /**
				    		  * 现金支付时，需要扣减额度，且跟转账放在同一个事物中
				    		  * 2016年8月3日
				    		  */
				    		 ISmalTrans smalTrans =  (ISmalTrans) StaticApplication.getBean("smallTranService");
				    		 final PayVoucher pp = tempVou;
				    		 final Session scc = sc;
				    		 final List<PayVoucher> plist = tempVouList;
				    		 smalTrans.newTransExecute(new ISmallTransService() {
								
								@Override
								public void doExecute() throws Exception {
									
									if(pp.getPb_set_mode_code().equals(GXBOCBLConstant.TRANS_TYPE_CASH)){
										Session session = new Session();
										PayCommonService payCommonService = (PayCommonService) StaticApplication.getBean("payCommonService");
										BalanceService balanceService = (BalanceService) StaticApplication.getBean("pay.core.impl.balanceserviceimpl");
										List<PayRequest> requestList = (List<PayRequest>) payCommonService
												.loadDetailsByBill(session,17,new long[] { pp.getPay_voucher_id() },null);
										balanceService.payRequestsEntrance(session,
												requestList, false);
						    		}
									
									/**
						    		  * 调用不走工作流的方法
						    		  * edit by liutianlong 2016年7月30日
						    		  */
						    		 payService.acceptCommonSignPayVoucherNotFlow(scc, plist, 0, true);
//						    		 payService.acceptCommonSignPayVoucher(sc, tempVouList, 0);
						    		 List<String> updateFileList = new ArrayList<String>();
						    		 updateFileList.add("pb_set_mode_code");
						    		 updateFileList.add("operate_user_name");
						    		 transService.getBillEngine().updateBill(scc, updateFileList, plist, false);
								}
							});
				    		 
				    	 }catch(Exception e){
				    		exceptionMsg = e.getMessage();
				    	 }
				     }
					 
					 if(!StringUtil.isEmpty(exceptionMsg)){
						 throw new Exception(exceptionMsg);
					 }
				}else if(tempVou.getBlReqPayOperation()==GXBOCBLConstant.BLReqOperation_RETURN){
						if(tempVou.getBusiness_type()  == GXBOCBLConstant.VOUCHERFLAG_VALUE_BACK_FAIL){
							throw new Exception("支付成功、无法撤单");
						}else if(tempVou.getBusiness_type() == XmlConstant.VOUCHERFLAG_VALUE_BACK){
							throw new  Exception("此凭证已撤单");
						}else{
							tempVou.setOperate_user_name(tempVou.getPayUser_code());
							transService.returnPayVoucherByTrans(sc, tempVouList, "");
				    		List<String> updateFileList = new ArrayList<String>();
				    		updateFileList.add("operate_user_name");
				    		transService.getBillEngine().updateBill(sc, updateFileList, tempVouList, false);
						}
						
				
				}else{
					throw new Exception("不支持此操作");
				}
			 }catch(Exception e){
				 log.error("凭证号："+tempVou.getPay_voucher_code()+"处理异常"+e.getMessage());
				 errMsg = errMsg.append(e.getMessage());
			 }finally{
				 
			 }
			 
		}
		}catch(Exception e){
			
		}finally{
			updateToDownLoad(voulist);
		}
		if(!StringUtil.isEmpty(errMsg.toString())&&voulist.size()==1){
			throw new Exception(errMsg.toString());
		}
	}
	
	/**
	 * 正在进行批量处理的数据设置为不可下载状态
	 * @param vouList
	 */
	public void updateToNotDownLoad(List<PayVoucher> vouList){
		
		StringBuffer where=new StringBuffer();
		
		where.append("where pay_voucher_id in (");
		
		for(PayVoucher tempVoucher:vouList){
			where.append(tempVoucher.getId()+","); 
		}
		
		String selectWhere = where.toString();
		
		selectWhere = selectWhere.substring(0, selectWhere.length()-1)+")";
		
		baseDao.execute(updateToNotDownload+selectWhere);
	
	}
	/**
	 * 将批量数据处理完成以后的数据设置为可下载状态
	 * @param vouList
	 */
	public void updateToDownLoad(List<PayVoucher> vouList){
		
		StringBuffer notDispose = new  StringBuffer();
		
		StringBuffer disposeIds = new StringBuffer();
		
		String where = "where pay_voucher_id in (";
		
		disposeIds.append(where);
		
		notDispose.append(where);
		
		Long loadTime = 0L;
		for(PayVoucher tempVou:vouList){
			if(tempVou.getBlReqPayOperation()!=GXBOCBLConstant.BLReqOperation_NOT_DISPOSE){
			
				disposeIds.append(tempVou.getId()+","); 
				
				loadTime = tempVou.getBlLoadTime();
				
			}else{
				notDispose.append(tempVou.getPay_voucher_id()+",");
			}
		}
		
		String toLoad = disposeIds.toString();
		
		String toLoad2 = notDispose.toString();
		try {
			if(!where.equals(toLoad)){
				toLoad = toLoad.substring(0, toLoad.length()-1)+")";
				baseDao.execute(updateToLoad+toLoad,new Object[]{loadTime});
			}
		}catch(Exception e){
			
		}
		
		try {
			if(!where.equals(toLoad2)){
				toLoad2 = toLoad2.substring(0, toLoad2.length()-1)+")";
				baseDao.execute(updateToLoad+toLoad2,new Object[]{0});
			}
		}catch(Exception e){
			
		}
	
	
	}
	/**
	 * 已清算历史凭证查询（2009）
	 * @param sc
	 * @param reqHead
	 * @param reqBody
	 * @return
	 * @throws Exception
	 */
	public List<PayVoucher> clearPayVoucherQuery(Session sc,GXBOCBLMsgHead reqHead,GXBOCBLMsgReqBody reqBody) throws Exception{
		
		String vouNo = reqBody.getObjs()[0].toString();
    	
		String summaryName = reqBody.getObjs()[1].toString();
    	
		BigDecimal PayAmount = new BigDecimal(reqBody.getObjs()[2].toString());
    	
		String vouDate = reqBody.getObjs()[3].toString();
    	
		String payeeAccountBank = reqBody.getObjs()[4].toString();
    	
		String payeeAccountNo = reqBody.getObjs()[5].toString();
    	 //1直接支付、2授权支付、3实拨
        String vt_Code ;
   	    
        if(GXBOCBLConstant.BL_DIRECTVOU_FLAG.equals(reqHead.getVt_type())){
   		  vt_Code = VtConstant.DIRECT_VT_CODE;  
   	    }else if(GXBOCBLConstant.BL_ACCREDITVOU_FLAG.equals(reqHead.getVt_type())){
   		  vt_Code = VtConstant.ACCREDIT_VT_CODE;
   	    }else if(GXBOCBLConstant.BL_REALPAY_FLAG.equals(reqHead.getVt_type())){
   		  throw new Exception("暂时未实现该凭证类型功能"+reqHead.getVt_type());
   	    }else{
   		  throw new Exception("不支持该凭证类型"+reqHead.getVt_type());
   	    }
   	    String admdiv_Code = reqHead.getAdmdiv_code();
   	    String year = reqHead.getYear();
    	ConditionObj conditionObj = new ConditionObj();
    	if(!StringUtil.isEmpty(vouNo)){
      	    conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"pay_voucher_code",SimpleQuery.EQUAL,vouNo,false,false,""));
    	}
        if(!StringUtil.isEmpty(summaryName)){
        	 conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"pay_summary_name",SimpleQuery.EQUAL,summaryName,false,false,""));
        }
        if(!StringUtil.isEmpty(vouDate)){
    	    conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"vou_date",SimpleQuery.EQUAL,vouDate,false,false,""));
        }
        if(!StringUtil.isEmpty(payeeAccountBank)){              	  
      	    conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"payee_account_bank",SimpleQuery.EQUAL,payeeAccountBank,false,false,""));
        }
        if(!StringUtil.isEmpty(payeeAccountNo)){
      	    conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"payee_account_no",SimpleQuery.EQUAL,payeeAccountNo,false,false,""));
        }
        if(!StringUtil.isEmpty(year)){
      	    conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"year",SimpleQuery.EQUAL,year,false,false,""));	
        }
  	    conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"pay_amount",SimpleQuery.EQUAL,PayAmount,false,false,""));
  	    conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"vt_code",SimpleQuery.EQUAL,vt_Code,false,false,""));
  	    conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"admdiv_code",SimpleQuery.EQUAL,admdiv_Code,false,false,""));
  	    conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"clear_flag",SimpleQuery.EQUAL,"1",false,false,""));
/*  	    ConditionPartObj condtionObjPart = new ConditionPartObj(
				"and", true, " ", "exists",
				"(select 1 from pb_pay_request r where r.pay_voucher_id=objsrc_2742.pay_voucher_id and r.clear_date is not null ) and objsrc_2742.pay_date is not null", true, false, "");
		// 设置类型为数字
		condtionObjPart.setDataType(1);
		conditionObj.addConditionPartObj(condtionObjPart);
*/  	    
		return payService.loadPayVoucherByObj(sc,conditionObj);
	}
	
	/**
	 * 指定凭证号查询（主单、明细）2004
	 * @param sc
	 * @param reqHead
	 * @param reqBody
	 * @return
	 * @throws Exception
	 */
	public List<PayVoucher> clearPayVoucherQueryByVouNo(Session sc,GXBOCBLMsgHead reqHead,GXBOCBLMsgReqBody reqBody) throws Exception{
		
        String vouNo = reqBody.getObjs()[0].toString();
        
        String isGetRequest = reqBody.getObjs()[1].toString();
        //预算单位
        String agency = reqBody.getObjs()[3].toString();
        //功能分类
        String ExpFunc = reqBody.getObjs()[4].toString();
        //经济分类
        String ExpEco = reqBody.getObjs()[5].toString();
        //预算项目
        String  DepPro = reqBody.getObjs()[6].toString();
               
        String vt_Code ;
        String refund_code;
   	    if("1".equals(reqHead.getVt_type())){
   		   vt_Code = VtConstant.DIRECT_VT_CODE; 
   		   refund_code = VtConstant.DIRECT_REFUND_VT_CODE;
   	    }else if("2".equals(reqHead.getVt_type())){
   		   vt_Code = VtConstant.ACCREDIT_VT_CODE;
   		   refund_code = VtConstant.ACCREDIT_EFUND_VT_CODE;
   	    }else if("3".equals(reqHead.getVt_type())){
   		   throw new Exception("暂时未实现该凭证类型功能"+reqHead.getVt_type());
   	    }else{
   		   throw new Exception("不支持该凭证类型"+reqHead.getVt_type());
   	    }
   	    
   	    ConditionObj conditionObj = new ConditionObj();
   	    
        conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"vt_code",SimpleQuery.EQUAL,vt_Code,false,false,""));
        conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"admdiv_code",SimpleQuery.EQUAL,reqHead.getAdmdiv_code(),false,false,""));
        conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"year",SimpleQuery.EQUAL,reqHead.getYear(),false,false,""));
        conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"pay_voucher_code ",SimpleQuery.EQUAL,vouNo,false,false,""));
        conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"clear_flag ",SimpleQuery.EQUAL,"1",false,false,""));
        ConditionPartObj condtionObjPart = new ConditionPartObj(
					"and", true, " ", "exists",
					"(select 1 from pb_pay_request r where r.pay_voucher_id=objsrc_2742.pay_voucher_id  and r.pay_amount > r.pay_refund_amount) and objsrc_2742.pay_date is not null", true, false, "");
			// 设置类型为数字
		condtionObjPart.setDataType(1);
		conditionObj.addConditionPartObj(condtionObjPart);
 	    
		List<PayVoucher> dbPayVoucherList = payService.loadPayVoucherByObj(sc,conditionObj);
 	    
		if(dbPayVoucherList.size()==0){
 	    	throw new Exception("未查询到支付凭证或已退票");
 	    }else if(dbPayVoucherList.size()>1){
 	    	throw new Exception("查询到多笔支付凭证");
 	    }else {  		 
 	    }
 	  
 	    if("0".equals(isGetRequest)){
 	    	
 	    	conditionObj = new ConditionObj();
 			
 	    	conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"ADMDIV_CODE",SimpleQuery.EQUAL,reqHead.getAdmdiv_code(),false,false,""));			
 			conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"VT_CODE",SimpleQuery.EQUAL,refund_code,false,false,""));
 			conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"ori_voucher_id",SimpleQuery.EQUAL,dbPayVoucherList.get(0).getPay_voucher_id(),false,false,""));
 			conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"BUSINESS_TYPE",SimpleQuery.EQUAL,1,false,false,""));
 			conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"is_valid",SimpleQuery.EQUAL,1,false,false,""));
 			
 			List<PayVoucher> dbReundPayVoucherList = payService.loadPayVoucherByObj(sc,conditionObj); 
 			
 			if(dbReundPayVoucherList.size() == 0){
 				
 			}else{
 				dbPayVoucherList.get(0).setBlRefundTime(dbReundPayVoucherList.get(0).getPay_date());
 			}
 	    
 	    }else if("1".equals(isGetRequest)){
     	  
 	    	conditionObj = new ConditionObj();
     	    conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"pay_voucher_id ",SimpleQuery.EQUAL,dbPayVoucherList.get(0).getPay_voucher_id(),false,false,""));
     	    StringBuffer where = new StringBuffer();
     	 
     	    if(!StringUtil.isEmpty(agency)){
     	    	where.append(" and (r.agency_name like '%"+agency+"%' or r.agency_code like '%"+agency+"%') ");
     	    }
     	    if(!StringUtil.isEmpty(ExpFunc)){
     	    	where.append(" and (r.exp_func_name like '%"+ExpFunc+"%' or r.exp_func_code like '%"+ExpFunc+"%') ");
     	    }
     	    if(!StringUtil.isEmpty(ExpEco)){
     	    	where.append(" and (r.exp_eco_name like '%"+ExpEco+"%' or r.exp_eco_code like '%"+ExpEco+"%') ");
     	    }
     	    if(!StringUtil.isEmpty(DepPro)){
     	    	where.append(" and (r.dep_pro_name like '%"+DepPro+"%' or r.dep_pro_code like '%"+DepPro+"%') ");
     	    }
     	    if(!StringUtil.isEmpty(where.toString())){
     	    	ConditionPartObj condtionObjPartRequest = new ConditionPartObj(
     	    				"and", true, " ", "exists",
     	    				"(select 1 from pb_pay_request r where r.pay_request_id = objsrc_2621.pay_request_id "+where.toString()+")", true, false, "");
				// 设置类型为数字
     	    	condtionObjPartRequest.setDataType(1);
     	    	conditionObj.addConditionPartObj(condtionObjPartRequest);
     	    }
     	    List<PayRequest> dbPayRequestList = payServiceForGXBOC.loadPayReqsByObj(sc,conditionObj);
     	    
     	    if(dbPayRequestList.size()==0){
     	    	throw new Exception("未查询到明细、请核对查询条件");
     	    }
     	    //查询末笔成功退款时间
     		StringBuffer oriVouId = new StringBuffer();
    		
    		for(PayRequest tempRequest : dbPayRequestList){
    			oriVouId.append(tempRequest.getPay_request_id()+",");
    		}
    		
    		conditionObj = new ConditionObj();
    		
    		conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"ADMDIV_CODE",SimpleQuery.EQUAL,reqHead.getAdmdiv_code(),false,false,""));
    		conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"BUSINESS_TYPE",SimpleQuery.EQUAL,1,false,false,""));
    		conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"VT_CODE",SimpleQuery.EQUAL,refund_code,false,false,""));
    		conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"ori_voucher_id",SimpleQuery.IN,"("+oriVouId.toString().substring(0,oriVouId.toString().length()-1)+")",false,false,""));
    		conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"is_valid",SimpleQuery.EQUAL,1,false,false,""));
    		
    		List<PayVoucher> dbReundPayVoucherList = payService.loadPayVoucherByObj(sc,conditionObj); 
     	    
    		for(PayRequest tempReq : dbPayRequestList){
    			for(PayVoucher refundVou :dbReundPayVoucherList){
    				if(refundVou.getOri_voucher_id()== tempReq.getPay_request_id()){
    					if(tempReq.getBlRefundTime() == null){
    						tempReq.setBlRefundTime(refundVou.getPay_date());
    					}else if (refundVou.getPay_date().compareTo(tempReq.getBlRefundTime())>0){
    						tempReq.setBlRefundTime(refundVou.getPay_date());
    					}
    				}
    			}
    		}
     	    PbUtil.setBillDetails(dbPayVoucherList, dbPayRequestList, "pay_voucher_id");  	
     	  
 	    }else{
 	    	throw new Exception("获取明细标识失败");
 	    }
 	    
 	    return  dbPayVoucherList;
	}
	/**
	 * 退款通知书录入（包含转账）2005
	 * @param sc
	 * @param reqHead
	 * @param reqBody
	 * @return
	 * @throws Exception
	 */
	@SuppressWarnings("unchecked")
	public List<PayVoucher> inputRefundVoucherAndPay(Session sc,GXBOCBLMsgHead reqHead,GXBOCBLMsgReqBody reqBody) throws Exception{
		//退款方式0全额退款、1部分退款
		String refundType =  reqBody.getObjs()[0].toString();
    	//凭证号
    	String payVoucherCode = reqBody.getObjs()[1].toString();
    	//退款原因
    	String refReason = reqBody.getObjs()[4].toString();
    	
    	BigDecimal refAmt = new BigDecimal(reqBody.getObjs()[3].toString());
    	
    	//支付方式 0直接 1授权
    	int payType;
    	//true按单退 false按明细退
    	boolean isBillRef;
    	//按单退 指的是主单的id 按明细退指的是明细的id
    	Long payId;
    	//退款通知书类型  直接的2203  授权的2204
    	String refundVtCode = "";
    	
  	    sc.setBelongOrgCode(reqHead.getBank_no().toString());
  	    
	    sc.setUserCode(reqHead.getOperator());
    	
	    if("0".equals(refundType)){
	    	
    		isBillRef = true;
            
        	String vt_Code ;
       	    
        	if("1".equals(reqHead.getVt_type())){
       	    	
       		   vt_Code = VtConstant.DIRECT_VT_CODE;
       		   payType = 0;
       		   refundVtCode = VtConstant.DIRECT_REFUND_VT_CODE;
       		   sc.setCurrMenuId(Integer.parseInt(UploadFileUtil.getFromPro("gxbocbl", "BL.PLRefundCheckVoucherMenuId")));
       		   
       	    }else if("2".equals(reqHead.getVt_type())){
       	      
       		   vt_Code = VtConstant.ACCREDIT_VT_CODE;
       		   payType = 1;
       		   refundVtCode = VtConstant.ACCREDIT_EFUND_VT_CODE;
       		   sc.setCurrMenuId(Integer.parseInt(UploadFileUtil.getFromPro("gxbocbl", "BL.PARefundCheckVoucherMenuId")));
       		   
       	    }else if("3".equals(reqHead.getVt_type())){
       		   
       	    	throw new Exception("暂时未实现该凭证类型功能"+reqHead.getVt_type());
       	    
       	    }else{
       		   
       	    	throw new Exception("不支持该凭证类型"+reqHead.getVt_type());
       	    }
        	
        	ConditionObj conditionObj = new ConditionObj();
        	
            conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"vt_code",SimpleQuery.EQUAL,vt_Code,false,false,""));
            conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"admdiv_code",SimpleQuery.EQUAL,reqHead.getAdmdiv_code(),false,false,""));
            conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"year",SimpleQuery.EQUAL,reqHead.getYear(),false,false,""));
            conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"pay_voucher_code ",SimpleQuery.EQUAL,payVoucherCode,false,false,""));
            
            List<PayVoucher> dbPayVoucherList = payService.loadPayVoucherByObj(sc,conditionObj);
          
      	    if(dbPayVoucherList.size()==0){
    		   throw new Exception("未查询到支付凭证或已退票");
    	    }else if(dbPayVoucherList.size()>1){
    		   throw new Exception("查询到多笔支付凭证");
    	    }else {  
    	    	payId = dbPayVoucherList.get(0).getPay_voucher_id();
    	    }
      	    //BL全额退款对金额不控制、需我们这边校验金额是否一致
            if( refAmt.compareTo(dbPayVoucherList.get(0).getPay_amount())!=0){
        	   throw new Exception("全额退款金额与原凭证金额不匹配");
            }
            
    	}else if("1".equals(refundType)){
    		
    		isBillRef = false;
    		payId = Long.parseLong(reqBody.getObjs()[2].toString());
    		if("1".equals(reqHead.getVt_type())){
    			
    			payType = 0;
    			sc.setCurrMenuId(Integer.parseInt(UploadFileUtil.getFromPro("gxbocbl", "BL.PLRefundCheckVoucherMenuId")));
    			refundVtCode = VtConstant.DIRECT_REFUND_VT_CODE;
        	
    		}else if("2".equals(reqHead.getVt_type())){
        		
    			payType = 1; 
        		sc.setCurrMenuId(Integer.parseInt(UploadFileUtil.getFromPro("gxbocbl", "BL.PARefundCheckVoucherMenuId")));
        		refundVtCode = VtConstant.ACCREDIT_EFUND_VT_CODE;
        	
    		}else if("3".equals(reqHead.getVt_type())){
        		throw new Exception("暂时未实现该凭证类型功能"+reqHead.getVt_type());
        	}else{
        		throw new Exception("不支持该凭证类型"+reqHead.getVt_type());
            }
    		
    	}else{
    		throw new Exception("不支持该退款类型："+refundType);
    	}	
	    //查找是否已发生退款
    	ConditionObj conditionObj = new ConditionObj();
        conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"vt_code",SimpleQuery.EQUAL,refundVtCode,false,false,""));
        conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"admdiv_code",SimpleQuery.EQUAL,reqHead.getAdmdiv_code(),false,false,""));
        conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"year",SimpleQuery.EQUAL,reqHead.getYear(),false,false,""));
        conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"ori_voucher_id",SimpleQuery.EQUAL,payId,false,false,""));
        conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"pay_amount",SimpleQuery.EQUAL,refAmt.negate(),false,false,""));
        conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"vou_date",SimpleQuery.EQUAL,DateTimeUtils.TransLogDateTime(),false,false,""));
        conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"is_valid",SimpleQuery.EQUAL,1,false,false,""));
        
        List<PayVoucher> dbReundPayVoucherList = payService.loadPayVoucherByObj(sc,conditionObj);
        if(dbReundPayVoucherList.size()==1){
        	
        	if(dbReundPayVoucherList.get(0).getBusiness_type()==1){
  					throw new Exception("该笔当天已发生过相同金额的退款、且退票成功");
			}
        	
        }else if(dbReundPayVoucherList.size()>1){
        	
        	throw new Exception("该明细当天查询到多笔退款金额的数据");
        
        }else{ 
        	
        	ISmalTrans smalTrans =  (ISmalTrans) StaticApplication.getBean("smallTranService");
            
            try {
            	
            	 final RrefundVoucherDTO rvDto = new RrefundVoucherDTO();
            	 final Session scc = sc;
    		     rvDto.setPayId(payId);
    			 rvDto.setBillRef(isBillRef);
    			 rvDto.setPayType(payType);
    			 rvDto.setRefAmount(refAmt);
    			 rvDto.setRefReason(refReason);
    			 
    			 dbReundPayVoucherList = (List<PayVoucher>) smalTrans.newReturnExecute(new ISmallReturnService() {
         			
         			@Override
         			public Object doExecute() throws Exception {
         				
         				/**
         				 * 生成退款凭证即可，不用走工作流
         				 * edit by liutianlong 2016年7月31日
         				 */
         				PayVoucher refundVoucher = payService.createRefundVoucher(scc, rvDto);
         				List<PayVoucher> rlist = new ArrayList<PayVoucher>();
         				rlist.add(refundVoucher);
         				StaticApplication.getBillEngine().saveBill(scc, refundVoucher);
         				PayCommonService commonService = (PayCommonService) StaticApplication.getBean("payCommonService");
         				commonService.setBillId4Details(rlist);
         				// 保存新明细
         				StaticApplication.getBillEngine().saveBills(scc, refundVoucher.getDetails());
//         				dbReundPayVoucherList  = payService.inputRefundVoucher(sc,rvDto);
         		        
         		        //BL端操作时间超过营业时间后,把生成的退款凭证作废掉,并且不进行退款转账  xcg 2015-12-3
         		        SimpleDateFormat sdf = new SimpleDateFormat("HH");
         				int tempTime = Integer.parseInt(sdf.format(DateTimeUtils.nowDatetime()));
         				int endTime = Integer.parseInt(UploadFileUtil.getFromPro("gxbocbl", "BL.EndOfBusinessTime"));
         				log.info("+++++++++++++++++++++柜面服务器当前时间为:"+tempTime+"+++++++业务日终时间为:"+endTime);
//         				if(tempTime>endTime){
//         					/**
//         					 * 抛出异常，事务回滚，不需要调用作废
//         					 * 
//         					 * 注意：：： 事物不会回滚！！ 2016年8月3日
//         					 * 
//         					 * edit by liutianlong 2016年7月31日
//         					 */
////         					payService.invalidateRefundVoucher(sc, dbReundPayVoucherList, 1);
//         					throw new Exception("超过营业时间,请在营业时间内进行退款操作!");
//         				}	
         				return rlist;
         			}
         		});
            } catch (Exception e) {
    			log.error("退款失败", e);
    			throw new Exception(e);
    		}
        }
		 /**
		* 转账不走工作流
		* edit by liutianlong 2016年7月31日
		*/

		try{
			payService.acceptCommonSignPayVoucherNotFlow(sc, dbReundPayVoucherList, 0, true);
        }catch(Exception e){
        	/**
        	 * 转账失败后，作废退款凭证
        	 * add by liutianlong 2016-8-31 
        	 */
        	ISmalTrans smalTrans1 = (ISmalTrans) StaticApplication.getBean("smallTranService");
        	final Session scc1 = sc;
        	final List<PayVoucher> list = dbReundPayVoucherList;
        	smalTrans1.newTransExecute(new ISmallTransService() {
				
				@Override
				public void doExecute() throws Exception {
					payService.invalidateRefundVoucher(scc1, list, 0);
//						payServiceForGXBOC.invalidateRefundVoucherByBL(scc1, list, payType, true);
					
				}
			});
        	throw new PbException(e);
        }
       return dbReundPayVoucherList;
        
	}
	/**
	 * 根据付款人账户 、原支付凭证号、退款凭证录入日期查询待清算退款凭证
	 * @param sc
	 * @param reqHead
	 * @param reqBody
	 * @throws Exception 
	 */
	public List<PayVoucher> waitClearRefundVoucherQuery(Session sc,GXBOCBLMsgHead reqHead,GXBOCBLMsgReqBody reqBody) throws Exception{
		
		String payAccountNo =  reqBody.getObjs()[0].toString();
		
		String vouNo =  reqBody.getObjs()[1].toString();
		
		String reFundInputDate = reqBody.getObjs()[2].toString();
		
		String vt_code ;
		
		String refund_code ;
		
		if("1".equals(reqHead.getVt_type())){
			vt_code = VtConstant.DIRECT_VT_CODE;
			refund_code = VtConstant.DIRECT_REFUND_VT_CODE;
			sc.setCurrMenuId(200102);
		}else if("2".equals(reqHead.getVt_type())){
			vt_code = VtConstant.ACCREDIT_VT_CODE;
			refund_code = VtConstant.ACCREDIT_EFUND_VT_CODE;
		}else if("3".equals(reqHead.getVt_type())){
			throw new Exception("此功能暂时未实现");
			//vt_code = VtConstant.ACCREDIT_VT_CODE;
			//refund_code = VtConstant.APPLY_REALREFUND_VT_CODE;
		}else{
			throw new Exception("不支持该类型数据操作"+reqHead.getVt_type());
		}
		
		ConditionObj conditionObj = new ConditionObj();
		
		conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"YEAR",SimpleQuery.EQUAL,reqHead.getYear(),false,false,""));
		conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"ADMDIV_CODE",SimpleQuery.EQUAL,reqHead.getAdmdiv_code(),false,false,""));
		conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"VT_CODE",SimpleQuery.EQUAL,vt_code,false,false,""));
		conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"PAY_VOUCHER_CODE",SimpleQuery.EQUAL,vouNo,false,false,""));
		List<PayVoucher> dbPayVoucherList = payService.loadPayVoucherByObj(sc,conditionObj); 
		
		if(dbPayVoucherList.size()==0){
			throw new Exception("未查询到原支付凭证");
		}else if(dbPayVoucherList.size()>1){
			throw new Exception("查询到多笔原支付凭证、请联系管理员");
		}
		
		conditionObj = new ConditionObj();
		
		conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"pay_voucher_id",SimpleQuery.EQUAL,dbPayVoucherList.get(0).getPay_voucher_id(),false,false,""));
		
		List<PayRequest> dbPayRequest = payServiceForGXBOC.loadPayReqsByObj(sc, conditionObj);
		
		StringBuffer oriVouId = new StringBuffer();
		oriVouId.append(dbPayVoucherList.get(0).getPay_voucher_id());
		for(PayRequest tempRequest : dbPayRequest){
			oriVouId.append(","+tempRequest.getPay_request_id());
		}
		conditionObj = new ConditionObj();
		conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"vou_date",SimpleQuery.EQUAL,reFundInputDate,false,false,""));
		conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"ADMDIV_CODE",SimpleQuery.EQUAL,reqHead.getAdmdiv_code(),false,false,""));
		
		conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"VT_CODE",SimpleQuery.EQUAL,refund_code,false,false,""));
		conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"ori_voucher_id",SimpleQuery.IN,"("+oriVouId.toString()+")",false,false,""));
		conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"is_valid",SimpleQuery.EQUAL,1,false,false,""));
		List<PayVoucher> dbReundPayVoucherList = payService.loadPayVoucherByObj(sc,conditionObj); 
		if(dbReundPayVoucherList.size()==0){
			throw  new Exception("未查到相关退款凭证、请核实查询条件");
		}
		
		return dbReundPayVoucherList;
		
	}
	/**
	 * 根据网点、柜员、日期、凭证状态、页码查询凭证
	 * @param sc
	 * @param reqHead
	 * @param reqBody
	 * @throws Exception 
	 */
	public List<PayVoucher> voucherQuery(Session sc,GXBOCBLMsgHead reqHead,GXBOCBLMsgReqBody reqBody) throws Exception{
		
		String bankCode = reqBody.getObjs()[0].toString();
		
		String userCode = reqBody.getObjs()[1].toString();
		
		String vou_date = reqBody.getObjs()[2].toString();
		
		String accountNo = reqBody.getObjs()[5].toString();
		
		String vouNo = reqBody.getObjs()[6].toString();
		
		//待查凭证状状态:
		//0全部，1未支付，2已支付3已退款，4已退回财政
		
//		0全部，
//		1未请款，
//		2请款失败
//		3已请款支付失败（需退回财政或退回经办修改），
//		4已支付
//		5已退回财政
//		6已退款
		String VouStatus = reqBody.getObjs()[3].toString();
		
		int selectPageNo =  Integer.parseInt(reqBody.getObjs()[4].toString());
		
		//List<Billable>  billList = new ArrayList<Billable>();
		String vt_code;
		String account_type ;
		if("1".equals(reqHead.getVt_type())){
			vt_code = VtConstant.DIRECT_VT_CODE;
			account_type = IBankAccountService.TYPE_MOF_ZERO_ACCOUNT;
		}else if("2".equals(reqHead.getVt_type())){
			vt_code = VtConstant.ACCREDIT_VT_CODE;
			account_type  = IBankAccountService.TYPE_AGENCY_ZERO_ACCOUNT;
		}else if("3".equals(reqHead.getVt_type())){
			//vt_code = VtConstant.APPLY_REFUND_VT_CODE;
			throw new Exception("暂时未实现改功能");
		}else{
			throw new Exception("不支持此凭证类型的操作:"+reqHead.getVt_type());
		}
		ConditionObj conditionObj = new ConditionObj();
        conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"vt_code",SimpleQuery.EQUAL,vt_code,false,false,""));
        conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"admdiv_code",SimpleQuery.EQUAL,reqHead.getAdmdiv_code(),false,false,""));
        conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"year",SimpleQuery.EQUAL,reqHead.getYear(),false,false,""));
        conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"vou_date",SimpleQuery.EQUAL,vou_date,false,false,""));
        String accountNos ;
        if(!GXBOCBLConstant.VOUCHER_ABNORMAL.equals(VouStatus)){
        	accountNos = " (select account_no from pb_ele_account where (bank_code = "+bankCode+" and account_type_code = "+account_type+" and admdiv_code = "+reqHead.getAdmdiv_code()+" ) )";
            
            conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"pay_account_no",SimpleQuery.IN,accountNos,false,false,""));
        
        }else if (GXBOCBLConstant.VOUCHER_ABNORMAL.equals(VouStatus)){
        	//accountNos = " (select pay_account_n from pb_ele_account where account_type_code = "+account_type+" and admdiv_Code = "+reqHead.getAdmdiv_code()+") ";
        	//conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"pay_account_no",SimpleQuery.NOT_IN,accountNos,false,false,""));
        	ConditionPartObj condtionObjPartRequest = new ConditionPartObj(
    				"and", true, " ", "",
    				"pay_account_no not in (select account_no from pb_ele_ACCOUNT WHERE ADMDIV_CODE = '"+reqHead.getAdmdiv_code()+"'  AND ACCOUNT_TYPE_CODE = '"+account_type+"' )", true, false, "");
	// 设置类型为数字
    	condtionObjPartRequest.setDataType(1);
    	conditionObj.addConditionPartObj(condtionObjPartRequest);
        }

        if(!StringUtil.isEmpty(userCode)){
        	conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"payUser_Code",SimpleQuery.EQUAL,userCode,false,false,""));
        }
        if(!StringUtil.isEmpty(accountNo)){
        	conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"pay_account_no",SimpleQuery.EQUAL,accountNo,false,false,""));
        }
        
        if(!StringUtil.isEmpty(vouNo)){
        	conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"pay_voucher_code",SimpleQuery.EQUAL,vouNo,false,false,""));
        }
        if("0".equals(VouStatus)){
        	
        
        }else if(GXBOCBLConstant.VOUCHER_BACK_FAIL.equals(VouStatus)){
        	
        	conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"voucherflag",SimpleQuery.EQUAL,GXBOCBLConstant.VOUCHERFLAG_VALUE_BACK_FAIL,false,false,""));

        }else if(GXBOCBLConstant.SEND_RETURN_VOUOCHER_FAIL.equals(VouStatus)){
        	
        	conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"send_flag",SimpleQuery.EQUAL,-1,false,false,""));
        
        }else if(GXBOCBLConstant.NOT_REQMONEY.equals(VouStatus)){
        	
        	conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"batchreq_status",SimpleQuery.EQUAL,0,false,false,""));
        	conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"business_type",SimpleQuery.EQUAL,0,false,false,""));
        	conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"send_flag",SimpleQuery.EQUAL,0,false,false,""));
       
        }else if(GXBOCBLConstant.REQMONEY_FAIL.equals(VouStatus)){
        
        	conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"batchreq_status",SimpleQuery.EQUAL,-1,false,false,""));

        }else if(GXBOCBLConstant.REQMONEY_SUCC.equals(VouStatus)){
        	
        	conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"batchreq_status",SimpleQuery.EQUAL,1,false,false,""));
        	conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"business_type",SimpleQuery.EQUAL,0,false,false,""));
        	conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"trans_succ_flag",SimpleQuery.EQUAL,0,false,false,""));
        
        }else if (GXBOCBLConstant.PAYMONEY_NOTCONFIRM.equals(VouStatus)){
        	
        	conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"batchreq_status",SimpleQuery.EQUAL,1,false,false,""));
        	conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"business_type",SimpleQuery.EQUAL,0,false,false,""));
        	conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"trans_succ_flag",SimpleQuery.EQUAL,2,false,false,""));
        
        }else if(GXBOCBLConstant.PAYMONEY_SUCC.equals(VouStatus)){
        	conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"BUSINESS_TYPE",SimpleQuery.EQUAL,1,false,false,""));
        	ConditionPartObj condtionObjPartRequest = new ConditionPartObj(
	    				"and", true, " ", "exists",
	    				"(select 1 from pb_pay_request r where r.pay_voucher_id = objsrc_2742.pay_voucher_id group by r.pay_voucher_id having sum(pay_refund_amount)=0 )", true, false, "");
		// 设置类型为数字
	    	condtionObjPartRequest.setDataType(1);
	    	conditionObj.addConditionPartObj(condtionObjPartRequest);
        }else if(GXBOCBLConstant.VOUCHER_REFUND_SUCC.equals(VouStatus)){
        	//conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"BUSINESS_TYPE",SimpleQuery.EQUAL,0,false,false,""));
        	ConditionPartObj condtionObjPartRequest = new ConditionPartObj(
			"and", true, " ", "exists",
			"(select 1 from pb_pay_request r where r.pay_voucher_id = objsrc_2742.pay_voucher_id and r.pay_refund_amount > 0 )", true, false, "");
        	// 设置类型为数字
        	condtionObjPartRequest.setDataType(1);
        	conditionObj.addConditionPartObj(condtionObjPartRequest);
        }else if(GXBOCBLConstant.VOUCHER_BACK_SUCC.equals(VouStatus)){
        	conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"BUSINESS_TYPE",SimpleQuery.EQUAL,2,false,false,""));
        }else if(GXBOCBLConstant.VOUCHER_ABNORMAL.equals(VouStatus)){
        	
        }else{
        	throw new Exception ("不支持该凭证状态查询"+VouStatus);
        }
        
        OrderObj orderObj=new OrderObj();
		orderObj.setFieldName("pay_voucher_code");
		orderObj.setSortMode(true);
		conditionObj.addOrderByKey(orderObj);
		
        List<PayVoucher> dbPayVoucherList = payService.loadPayVoucherByObj(sc,conditionObj);
        if("0".equals(VouStatus)){
        	if(dbPayVoucherList.size()>0){
        		long[] ids = new long[dbPayVoucherList.size()];
        		for(int i = 0;i<dbPayVoucherList.size();i++){
        			if(dbPayVoucherList.get(i).getBusiness_type()==1){
        				ids[i]=dbPayVoucherList.get(i).getPay_voucher_id();
        			}
        			
        		}
        		long billTypeId = Parameters.getLongParameter( BILL_TYPE_PAY_VOUCHER);
        		List<PayRequest> requests = (List<PayRequest>) payServiceForGXBOC.loadDetailsByBill(sc, billTypeId, ids);
        		PbUtil.setBillDetails(dbPayVoucherList, requests, "pay_voucher_id");
        	}
        }
       // billList.addAll(dbPayVoucherList);
		return dbPayVoucherList;
	}
	/**
	 * 撤销退款凭证
	 * @param sc
	 * @param reqHead
	 * @param reqBody
	 * @throws Exception
	 */
	public List<PayVoucher> invalidRefundVoucher(Session sc,GXBOCBLMsgHead reqHead,GXBOCBLMsgReqBody reqBody) throws Exception{
		
		String vouNo = reqBody.getObjs()[0].toString();
        
		String vt_code;
        
		String refund_code;
        int payType ;
        
        sc.setBelongOrgCode(reqHead.getBank_no().toString());
  	    
	    sc.setUserCode(reqHead.getOperator());
	    
		if("1".equals(reqHead.getVt_type())){
			vt_code = VtConstant.DIRECT_VT_CODE;
			refund_code = VtConstant.DIRECT_REFUND_VT_CODE;
			payType = 0; 
			sc.setCurrMenuId(Integer.parseInt(UploadFileUtil.getFromPro("gxbocbl", "BL.PLRefundCheckVoucherMenuId")));
		}else if("2".equals(reqHead.getVt_type())){
			vt_code = VtConstant.ACCREDIT_VT_CODE;
			refund_code = VtConstant.ACCREDIT_EFUND_VT_CODE;
			payType = 1; 
			sc.setCurrMenuId(Integer.parseInt(UploadFileUtil.getFromPro("gxbocbl", "BL.PARefundCheckVoucherMenuId")));
		}else if("3".equals(reqHead.getVt_type())){
			throw new Exception("此功能暂时未实现");
			//vt_code = VtConstant.ACCREDIT_VT_CODE;
			//refund_code = VtConstant.APPLY_REALREFUND_VT_CODE;
		}else{
			throw new Exception("不支持该类型数据操作"+reqHead.getVt_type());
		}
        
		ConditionObj conditionObj = new ConditionObj();
        
        conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"pay_voucher_code",SimpleQuery.EQUAL,vouNo,false,false,""));
        conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"vt_code",SimpleQuery.EQUAL,refund_code,false,false,""));
        conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"admdiv_code",SimpleQuery.EQUAL,reqHead.getAdmdiv_code(),false,false,""));
        
        List<PayVoucher> dbRefundPayVoucherList = payService.loadPayVoucherByObj(sc,conditionObj);
		
        if(dbRefundPayVoucherList.size()==0){
        	throw new Exception("未查询到退款凭证");
        }else if(dbRefundPayVoucherList.size()>1){
        	throw new Exception("查询到多笔退款凭证、请联系管理员处理");
        }else{
        	
        }
        
        conditionObj = new ConditionObj();
		
		conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"pay_voucher_id",SimpleQuery.EQUAL,dbRefundPayVoucherList.get(0).getPay_voucher_id(),false,false,""));
		
		List<PayRequest> dbRefundPayRequest = payServiceForGXBOC.loadPayReqsByObj(sc, conditionObj);
		
		
		/**
		 * 临时修改，退款作废，调用的请款操作，不能扣减额度，将明细金额修改为0
		 * 2016年8月3日
		 */
		for(PayRequest r : dbRefundPayRequest){
			r.setPay_amount(BigDecimal.ZERO);
		}
		
		//设置主单、明细单的关联关系
		PbUtil.setBillDetails(dbRefundPayVoucherList, dbRefundPayRequest, "pay_voucher_id");
		
		if(dbRefundPayRequest.get(0).getPay_clear_voucher_id()!=0){
			throw new  Exception("已生成退款划款单、不可做撤销");
		}else{
			//throw new Exception("暂时未实现撤销功能");
		}
		String account_type =vt_code.equals(VtConstant.DIRECT_VT_CODE)
	 	    ?IBankAccountService.TYPE_MOF_ZERO_ACCOUNT:IBankAccountService.TYPE_AGENCY_ZERO_ACCOUNT;
		
		//1.已撤销  2.未撤销 3.已退款 撤销失败 4.未退款 未撤销 5.未退款 撤销失败 
		//1.已撤销  2.撤销失败  3未撤销
		//已请款、未请款
	
		String errorMsg = "";
		boolean isPay =false ;
		if( dbRefundPayVoucherList.get(0).getIs_valid()==0){
			
			throw new Exception ("已撤销成功");
		
		}else if(dbRefundPayVoucherList.get(0).getBatchreq_status()  == -1){
			
			errorMsg = payService.batchRepeatReqMoney(sc, dbRefundPayVoucherList, account_type);
			isPay =true;
		
		}else if(dbRefundPayVoucherList.get(0).getBusiness_type() == 1 && dbRefundPayVoucherList.get(0).getBatchreq_status()==0){
			
			errorMsg = payService.batchReqMoney(sc, dbRefundPayVoucherList, account_type);
			isPay = true;
		
		}else if(dbRefundPayVoucherList.get(0).getBatchreq_status()==1){
			
			isPay = true;
			
		}else if(dbRefundPayVoucherList.get(0).getBusiness_type() == 0 && dbRefundPayVoucherList.get(0).getBatchreq_status()==0){
			
			dbRefundPayVoucherList.get(0).setTrade_type(TradeConstant.PAY2ADVANCE_REFUND);
			
			TransReturnDTO transReturn = transService.queryTransNotSaveLog(sc, dbRefundPayVoucherList.get(0));
				
			if(transReturn.getResStatus() == TradeConstant.RESPONSESTATUS_SUCCESS){
				
				errorMsg = payService.batchReqMoney(sc, dbRefundPayVoucherList, account_type);
			
			}else if(transReturn.getResStatus() == TradeConstant.RESPONSESTATUS_NOTCONFIRM){
				
				throw new  Exception("退款交易结果不确认 、不可做撤销操作！");
			
			}else if(transReturn.getResStatus() == TradeConstant.RESPONSESTATUS_NOTRECEIVE||transReturn.getResStatus() == TradeConstant.RESPONSESTATUS_FAIL){
				
			}
			isPay = false;
		}
		if(!StringUtil.isEmpty(errorMsg)){
			throw new  Exception(errorMsg);
		}
		transService.invalidateRefundVoucherByBL(sc, dbRefundPayVoucherList, payType,isPay);
		
		return dbRefundPayVoucherList;
	
		
		
	}
	public void setPayVoucherToLoad(PayVoucher payVoucher){	
              baseDao.execute(updateToLoad, new Object[]{payVoucher.getPay_voucher_id()});
	}
	
	public String getVt_Code(String vt_type){
		return null;
	}
	
	/**
	 * 授权支付额度查询
	 * @author ruanzx
	 * @date 20141210
	 */
	private static final String queryRemainAmtQuerySQL = "SELECT AGENCY_CODE,AGENCY_NAME,EXP_FUNC_CODE,EXP_FUNC_NAME,FUND_TYPE_CODE,FUND_TYPE_NAME,DEP_PRO_CODE,DEP_PRO_NAME, SUM(AMOUNT) PAY_AMOUNT FROM "+
			"(SELECT AGENCY_CODE,AGENCY_NAME,EXP_FUNC_CODE,EXP_FUNC_NAME,FUND_TYPE_CODE,FUND_TYPE_NAME,DEP_PRO_CODE,DEP_PRO_NAME, PLAN_AMOUNT AMOUNT FROM PB_PLAN_DETAIL WHERE YEAR=#year# AND PLAN_MONTH<=TO_NUMBER(TO_CHAR(SYSDATE,'MM')) "+
			"UNION ALL SELECT AGENCY_CODE,AGENCY_NAME,EXP_FUNC_CODE,EXP_FUNC_NAME,FUND_TYPE_CODE,FUND_TYPE_NAME,DEP_PRO_CODE,DEP_PRO_NAME,-PAY_AMOUNT AMOUNT FROM PB_PAY_VOUCHER  WHERE YEAR=#year# AND PAY_AMOUNT>0 AND PAY_DATE IS NOT NULL "+
			"UNION ALL SELECT AGENCY_CODE,AGENCY_NAME,EXP_FUNC_CODE,EXP_FUNC_NAME,FUND_TYPE_CODE,FUND_TYPE_NAME,DEP_PRO_CODE,DEP_PRO_NAME,-PAY_AMOUNT AMOUNT FROM PB_PAY_VOUCHER  WHERE YEAR=#year# AND PAY_AMOUNT<0 AND EXISTS(SELECT 1 FROM PB_PAY_REQUEST WHERE PB_PAY_REQUEST.PAY_VOUCHER_ID=PB_PAY_VOUCHER.PAY_VOUCHER_ID AND PB_PAY_REQUEST.CLEAR_DATE IS NOT NULL)) "+
			"WHERE AGENCY_CODE IN (SELECT AGENCY_CODE FROM PB_ELE_ACCOUNT WHERE ACCOUNT_NO=#pay_account_no#) GROUP BY AGENCY_CODE,AGENCY_NAME,EXP_FUNC_CODE,EXP_FUNC_NAME,FUND_TYPE_CODE,FUND_TYPE_NAME,DEP_PRO_CODE,DEP_PRO_NAME ORDER BY AGENCY_CODE,EXP_FUNC_CODE,FUND_TYPE_CODE,DEP_PRO_CODE";
	private static final String queryPlanPlance = "select agency_code,       agency_name,       exp_func_code,       exp_func_name,       dep_pro_code,       dep_pro_name,       fund_type_code,       fund_type_name, ( plan_amount - add_pay_amount ) pamount  from pb_plan_balance b where b.pay_account_no = ?   and b.year = ?  ";
	public List<PayVoucher> queryAccreditPayAmtByZEROAccountNO(Session sc,
			GXBOCBLMsgHead reqHead, GXBOCBLMsgReqBody reqBody) {
		Integer year = Calendar.getInstance().get(Calendar.YEAR);
		String account_no = reqBody.getObjs()[0].toString();
		List<Map> list = baseDao.queryForList(queryPlanPlance, new Object[]{account_no,year});
		//List<PayVoucher> listPayVoucher = payService.loadPayVouchersBySQL(queryRemainAmtQuerySQL, payVoucher);
		//return listPayVoucher;
		List<PayVoucher> lp = new ArrayList<PayVoucher>();
		for (Map map : list) {
			PayVoucher  p = new PayVoucher();
			p.setAgency_code(map.get("agency_code")== null?"":map.get("agency_code")+"");
			p.setAgency_name(map.get("agency_name")== null?"":map.get("agency_name")+"");
			p.setExp_func_code(map.get("exp_func_code")== null?"":map.get("exp_func_code")+"");
			p.setExp_func_name(map.get("exp_func_name")== null?"":map.get("exp_func_name")+"");
			p.setFund_type_code(map.get("fund_type_code")== null?"":map.get("fund_type_code")+"");
			p.setFund_type_name(map.get("fund_type_name")== null?"":map.get("fund_type_name")+"");
			p.setDep_pro_code(map.get("dep_pro_code")== null?"":map.get("dep_pro_code")+"");
			p.setDep_pro_name(map.get("dep_pro_name")== null?"":map.get("dep_pro_name")+"");
			p.setPay_amount((BigDecimal)map.get("pamount"));
			lp.add(p);
		}
		return lp;
	}
}
