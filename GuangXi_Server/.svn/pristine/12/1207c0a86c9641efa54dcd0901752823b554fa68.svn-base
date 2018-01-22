package grp.pb.branch.gxboc.service;

import grp.pt.bill.ConditionObj;
import grp.pt.bill.ConditionPartObj;
import grp.pt.bill.OrderObj;
import grp.pt.database.sql.SimpleQuery;
import grp.pt.pb.common.IBankAccountService;
import grp.pt.pb.common.IBankNoService;
import grp.pt.pb.common.model.Condition;
import grp.pt.pb.common.model.PbConditionPartObj;
import grp.pt.pb.realpay.RealPayRequest;
import grp.pt.pb.realpay.RealPayService;
import grp.pt.pb.realpay.RealPayVoucher;
import grp.pt.pb.trans.util.Context;
import grp.pt.pb.util.PayConstant;
import grp.pt.pb.util.PbUtil;
import grp.pt.pb.util.StaticApplication;
import grp.pt.pb.util.VtConstant;
import grp.pt.util.BaseDAO;
import grp.pt.util.DateTimeUtils;
import grp.pt.util.ListUtils;
import grp.pt.util.StringUtil;
import grp.pt.util.model.Session;
import grp.pt.util.transation.ISmalTrans;
import grp.pt.util.transation.ISmallTransService;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import org.apache.log4j.Logger;

import com.river.common.UploadFileUtil;

public class GXBOCBLRealPayServiceImpl {
	
	private static Logger log = Logger.getLogger(GXBOCBLRealPayServiceImpl.class);
	
	//private static String updateToLoad = "update pb_pay_voucher set blloadtime = ? ";
	
	private static String loadAccount = "select * from pb_ele_account where account_type_code = ? and admdiv_Code = ? and account_no = ?";
	
	private static String updateToNotDownload = "update PB_REALPAY_BUDGET_VOUCHER set BLLoadTime = -1 ";
	
	private static String updateToLoad = "update PB_REALPAY_BUDGET_VOUCHER set blloadtime = ? ";
	
	private  static RealPayService realPayService;
	
	private   BaseDAO baseDao;
	
	private   IBankNoService bankNoService;
	
	private  TransForGXBOCServiceImpl transServiceForGXBOC;
	
	
	public TransForGXBOCServiceImpl getTransServiceForGXBOC() {
		return transServiceForGXBOC;
	}

	public void setTransServiceForGXBOC(
			TransForGXBOCServiceImpl transServiceForGXBOC) {
		this.transServiceForGXBOC = transServiceForGXBOC;
	}

	private ISmalTrans smallTrans;
	
	public ISmalTrans getSmallTrans() {
		return smallTrans;
	}

	public void setSmallTrans(ISmalTrans smallTrans) {
		this.smallTrans = smallTrans;
	}

	static{
		if(realPayService == null){
			realPayService = (RealPayService) StaticApplication.getBean("pt.pb.realpay.RealPayServiceImpl");
		}
	}

	/**
	 * 加载未处理的实拨凭证
	 * @param sc
	 * @param reqHead
	 * @param reqBody
	 * @param context
	 * @return
	 * @throws Exception
	 */
	@SuppressWarnings("deprecation")
	public List<RealPayVoucher> loadNotDisposeRealPayVou(Session sc,GXBOCBLMsgHead reqHead,GXBOCBLMsgReqBody reqBody,Context context) throws Exception{
		
		ConditionObj conditionObj = new ConditionObj();
		//根据区划、年度、凭证类型、未处理凭证、付款人账户
		conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"ADMDIV_CODE",SimpleQuery.EQUAL,reqHead.getAdmdiv_code(),false,false,""));	
		conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"VT_CODE",SimpleQuery.EQUAL,VtConstant.APPLY_REALPAY_VT_CODE,false,false,""));
		conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"BUSINESS_TYPE",SimpleQuery.NOT_EQUAL,1,false,false,""));
		conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"BUSINESS_TYPE",SimpleQuery.NOT_EQUAL,2,false,false,""));
		conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"YEAR",SimpleQuery.EQUAL,reqHead.getYear(),false,false,""));
		conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"PAY_ACCOUNT_NO",SimpleQuery.EQUAL,reqBody.getObjs()[0],false,false,""));
		//对数据进行时间轴限制  被下载过的数据 要过了时间轴才能再次下载
		conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,true," BLLoadTime",SimpleQuery.LESS,DateTimeUtils.getLastVer()-context.getBlDataOutTime(),false,false,""));
		//同一个柜员不受时间轴限制
		conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.OR,false," Payuser_Code",SimpleQuery.EQUAL,reqHead.getOperator(),true,false,""));
		//正在进行处理中的数据
		conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false," BLLoadTime",SimpleQuery.NOT_EQUAL,-1,false,false,""));
		//按单笔查询
		if(reqBody.getObjs()[1]!=null && !"".equals(reqBody.getObjs()[1])){
			conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false," realPay_voucher_Code",SimpleQuery.EQUAL,reqBody.getObjs()[1].toString(),false,false,""));
		}
		//按凭证号和日期排序
		OrderObj orderObj=new OrderObj();
		
		orderObj.setFieldName("realPay_voucher_code");
		orderObj.setSortMode(true);
		conditionObj.addOrderByKey(orderObj);
		
		orderObj=new OrderObj();
		orderObj.setFieldName("vou_date");
		orderObj.setSortMode(true);
		conditionObj.addOrderByKey(orderObj);
		
		List<RealPayVoucher> realVouList = transServiceForGXBOC.loadRealPayVoucherByObj(sc,conditionObj); 
		
		bankNoService.setRealPayBankNo(realVouList);
		
		int i = baseDao.execute(loadAccount, new Object[]{IBankAccountService.TYPE_MOF_REALFUND_ACCOUNT,reqHead.getAdmdiv_code(),reqBody.getObjs()[0]});
		
		if(i==0){
			PbUtil.batchSetValue(realVouList, "bl_voucher_Status",
					"A");
		}
		return realVouList;
		
	}
	
	/**
	 * 处理实拨凭证：不处理、支付、撤单
	 * @param sc
	 * @param voulist
	 * @throws Exception
	 */
	public void disposeRealPayVou( Session sc,List<RealPayVoucher> voulist) throws Exception{

		bankNoService.saveRealPayBankNo(voulist);
		
		String errorMsg = new String();
		
		try{
			updateToNotDownLoad(voulist);
			
			List<RealPayVoucher> payVouList = new ArrayList<RealPayVoucher>();
			List<RealPayVoucher> returnVouList = new ArrayList<RealPayVoucher>();
			List<RealPayVoucher> notDisposeList = new ArrayList<RealPayVoucher>();
			
			
			for( RealPayVoucher tempVou:voulist){
				if(tempVou.getBlReqPayOperation() == GXBOCBLConstant.BLReqOperation_NOT_DISPOSE){
					notDisposeList.add(tempVou);
				}else if(tempVou.getBlReqPayOperation() == GXBOCBLConstant.BLReqOperation_PAY){
					if(PayConstant.HASBACK_CONFIRMED == tempVou.getBusiness_type()){
						errorMsg = "已撤单、无法支付"; 
					}else if(tempVou.getPb_set_mode_code().equals(GXBOCBLConstant.TRANS_TYPE_OFFICIAL_CARD)){
						errorMsg = "公务卡暂时未处理";
					}else if(tempVou.getPb_set_mode_code().equals(GXBOCBLConstant.TRANS_TYPE_CREDIT_CARD)){
						 errorMsg = "信用卡暂时未处理";
					}else{
						payVouList.add(tempVou);
					}
					
				}else if(tempVou.getBlReqPayOperation() == GXBOCBLConstant.BLReqOperation_RETURN){
					if(PayConstant.Has_CONFIRMED == tempVou.getBusiness_type()){
						errorMsg = "已支付、无法撤单";
					}else if(PayConstant.HASBACK_CONFIRMED == tempVou.getBusiness_type()){
						errorMsg = "此凭证已撤单撤单";
					}else{
						returnVouList.add(tempVou);
					}
					
				}
			}
			
			try{
				if(payVouList.size()>0){
					realPayService.acceptRealPayVoucher4Sign(sc, payVouList);
					//TODO 签章发送
					realPayService.singAndSendRealPayVoucher(sc, payVouList);
				}
			}catch(Exception e){
				errorMsg = e.getMessage(); 	
			}
			
			
			if(returnVouList.size()>0){
				try{
					long ids[] =this.getRealPayVoucherIds(returnVouList);
					realPayService.returnRealPayVoucher4Sign(sc, ids, "");
				}catch(Exception e){
					errorMsg = e.getMessage(); 
				}
			}
				
				

		}catch (Exception e){
			
		}finally{
			updateToDownLoad(voulist);
		}
		
		if(voulist.size()==1 && !StringUtil.isEmpty(errorMsg)){
			throw new  Exception(errorMsg);
		}

	}
	
	/**
	 * 根据网点、柜员、日期、凭证状态、页码查询凭证
	 * @param sc
	 * @param reqHead
	 * @param reqBody
	 * @throws Exception 
	 */
	@SuppressWarnings("deprecation")
	public List<RealPayVoucher> realvoucherQuery(Session sc,GXBOCBLMsgHead reqHead,GXBOCBLMsgReqBody reqBody) throws Exception{
		
		String bankCode = reqBody.getObjs()[0].toString();
		
		String userCode = reqBody.getObjs()[1].toString();
		
		String vou_date = reqBody.getObjs()[2].toString();
		
		String accountNo = reqBody.getObjs()[5].toString();
		
		String vouNo = reqBody.getObjs()[6].toString();

		
//		0全部，
//		1未请款，
//		2请款失败
//		3已请款支付失败，
//		4已支付
//		5已退回财政
//		6已退款
//		7 支付成功回单发送失败
//		8 退回失败
//		9已请款支付未明
//		A 异常凭证

		String VouStatus = reqBody.getObjs()[3].toString();
		
		int selectPageNo =  Integer.parseInt(reqBody.getObjs()[4].toString());
		
		String vt_code =  VtConstant.APPLY_REALPAY_VT_CODE;
		
		String account_type = IBankAccountService.TYPE_MOF_REALFUND_ACCOUNT ;
	
		   List<RealPayVoucher> dbPayVoucherList = new ArrayList<RealPayVoucher>();
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
        	conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"realpay_voucher_code",SimpleQuery.EQUAL,vouNo,false,false,""));
        }
        if("0".equals(VouStatus)){
        	
        
        }else if(GXBOCBLConstant.VOUCHER_BACK_FAIL.equals(VouStatus)){
        	return dbPayVoucherList;
        	//conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"voucherflag",SimpleQuery.EQUAL,XmlConstant.VOUCHERFLAG_VALUE_BACK_FAIL,false,false,""));

        }else if(GXBOCBLConstant.SEND_RETURN_VOUOCHER_FAIL.equals(VouStatus)){
        	
        	conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"send_flag",SimpleQuery.EQUAL,-1,false,false,""));
        
        }else if(GXBOCBLConstant.NOT_REQMONEY.equals(VouStatus)){
        	
        	conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"business_type",SimpleQuery.EQUAL,PayConstant.NO_CONFIRMED,false,false,""));
       
        }else if(GXBOCBLConstant.REQMONEY_FAIL.equals(VouStatus)){
        	return dbPayVoucherList;
        	//conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"business_type",SimpleQuery.EQUAL,-1,false,false,""));

        }else if(GXBOCBLConstant.REQMONEY_SUCC.equals(VouStatus)){
        	
        	conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"business_type",SimpleQuery.EQUAL,PayConstant.Fail_CONFIRMED,false,false,""));
        	
        	conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"send_flag",SimpleQuery.EQUAL,0,false,false,""));
        	
        }else if (GXBOCBLConstant.PAYMONEY_NOTCONFIRM.equals(VouStatus)){
        	
        	conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"business_type",SimpleQuery.EQUAL,GXBOCBLConstant.UNKNOWN_CONFIRMED,false,false,""));

        }else if(GXBOCBLConstant.PAYMONEY_SUCC.equals(VouStatus)){
        	conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"BUSINESS_TYPE",SimpleQuery.EQUAL,PayConstant.Has_CONFIRMED,false,false,""));
        	conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"refund_amount",SimpleQuery.EQUAL,0,false,false,""));
        }else if(GXBOCBLConstant.VOUCHER_REFUND_SUCC.equals(VouStatus)){
        	conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"BUSINESS_TYPE",SimpleQuery.EQUAL,PayConstant.Has_CONFIRMED,false,false,""));
        	conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"refund_amount",SimpleQuery.GREATER,0,false,false,""));
        }else if(GXBOCBLConstant.VOUCHER_BACK_SUCC.equals(VouStatus)){
        	conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"BUSINESS_TYPE",SimpleQuery.EQUAL,PayConstant.HASBACK_CONFIRMED,false,false,""));
        	
        }else if(GXBOCBLConstant.VOUCHER_ABNORMAL.equals(VouStatus)){
        	
        }else{
        	throw new Exception ("不支持该凭证状态查询"+VouStatus);
        }
        
        OrderObj orderObj=new OrderObj();
		orderObj.setFieldName("realpay_voucher_code");
		orderObj.setSortMode(true);
		conditionObj.addOrderByKey(orderObj);
		
		dbPayVoucherList= transServiceForGXBOC.loadRealPayVoucherByObj(sc,conditionObj);
  
		return dbPayVoucherList;
	}
	/**
	 * 根据凭证号、金额、日期、摘要、收款人银行、收款人账户查询已发回单的实拨凭证
	 * @param sc
	 * @param reqHead
	 * @param reqBody
	 * @return
	 * @throws Exception
	 */
	@SuppressWarnings("deprecation")
	public List<RealPayVoucher> querySendBackRealVoucher(Session sc,GXBOCBLMsgHead reqHead,GXBOCBLMsgReqBody reqBody) throws Exception{
		
		
		String vouNo = reqBody.getObjs()[0].toString();
    	
		String summaryName = reqBody.getObjs()[1].toString();
    	
		BigDecimal PayAmount = new BigDecimal(reqBody.getObjs()[2].toString());
    	
		String vouDate = reqBody.getObjs()[3].toString();
    	
		String payeeAccountBank = reqBody.getObjs()[4].toString();
    	
		String payeeAccountNo = reqBody.getObjs()[5].toString();
    	 //1直接支付、2授权支付、3实拨
        String vt_Code ;
   	    
        if(GXBOCBLConstant.BL_REALPAY_FLAG.equals(reqHead.getVt_type())){
   		  vt_Code =  VtConstant.APPLY_REALPAY_VT_CODE;
   	    }else{
   		  throw new Exception("不支持该凭证类型"+reqHead.getVt_type());
   	    }
   	    String admdiv_Code = reqHead.getAdmdiv_code();
   	    String year = reqHead.getYear();
    	ConditionObj conditionObj = new ConditionObj();
    	if(!StringUtil.isEmpty(vouNo)){
      	    conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"realpay_voucher_code",SimpleQuery.EQUAL,vouNo,false,false,""));
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
  	    conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"send_flag",SimpleQuery.EQUAL,1,false,false,""));
  	    
		return transServiceForGXBOC.loadRealPayVoucherByObj(sc,conditionObj);
	}
	
	/**
	 * 实拨凭证查询 退款录入
	 * @param sc
	 * @param reqHead
	 * @param reqBody
	 * @return
	 * @throws Exception
	 */
	@SuppressWarnings({ "deprecation", "deprecation", "deprecation" })
	public List<RealPayVoucher> queryRealPayVoucherByVouNo(Session sc,GXBOCBLMsgHead reqHead,GXBOCBLMsgReqBody reqBody) throws Exception{
		
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
   	  
   	   if(GXBOCBLConstant.BL_REALPAY_FLAG.equals(reqHead.getVt_type())){
   		   vt_Code = VtConstant.APPLY_REALPAY_VT_CODE;
   		   refund_code = VtConstant.APPLY_REALREFUND_VT_CODE;
   	    }else{
   		   throw new Exception("不支持该凭证类型"+reqHead.getVt_type());
   	    }
   	    
   	    ConditionObj conditionObj = new ConditionObj();
   	    
        conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"vt_code",SimpleQuery.EQUAL,vt_Code,false,false,""));
        conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"admdiv_code",SimpleQuery.EQUAL,reqHead.getAdmdiv_code(),false,false,""));
        conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"year",SimpleQuery.EQUAL,reqHead.getYear(),false,false,""));
        conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"realpay_voucher_code ",SimpleQuery.EQUAL,vouNo,false,false,""));
        conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"BUSINESS_TYPE",SimpleQuery.EQUAL,PayConstant.Has_CONFIRMED,false,false,""));
        conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"send_flag",SimpleQuery.EQUAL,1,false,false,""));

		Condition con = new Condition();
		con.setSpecial_condition(" and exists(select 1 from pb_realpay_budget_request r where (r.pay_refund_amount is null or r.pay_refund_amount = 0) and r.realpay_voucher_id  = objsrc_6815.realpay_voucher_id ) ");
		conditionObj.addConditionPartObj((ConditionPartObj)(new PbConditionPartObj(con)));
		List<RealPayVoucher> dbPayVoucherList = transServiceForGXBOC.loadRealPayVoucherByObj(sc,conditionObj);
		if(dbPayVoucherList.size()==0){
 	    	throw new Exception("未查询到支付凭证或已退票或已退款");
 	    }else if(dbPayVoucherList.size()>1){
 	    	throw new Exception("查询到多笔支付凭证");
 	    }else {  		 
 	    }
 	  
		//实拨退款录入的时间
 	    conditionObj = new ConditionObj();
 			
 	    conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"ADMDIV_CODE",SimpleQuery.EQUAL,reqHead.getAdmdiv_code(),false,false,""));			
 		conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"VT_CODE",SimpleQuery.EQUAL,refund_code,false,false,""));
 		conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"old_voucher_id",SimpleQuery.EQUAL,dbPayVoucherList.get(0).getRealpay_voucher_id(),false,false,""));
 		conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"is_valid",SimpleQuery.EQUAL,1,false,false,""));
 			
 		List<RealPayVoucher> dbReundPayVoucherList = transServiceForGXBOC.loadRealPayVoucherByObj(sc,conditionObj); 
 			
 		if(dbReundPayVoucherList.size() == 0){
 				
 		}else{
 				dbPayVoucherList.get(0).setBlRefundTime(dbReundPayVoucherList.get(0).getCreate_date());
 		}
 	    
 	    if("1".equals(isGetRequest)){
     	  
 	    	conditionObj = new ConditionObj();
     	    
 	    	conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"realpay_voucher_id ",SimpleQuery.EQUAL,dbPayVoucherList.get(0).getRealpay_voucher_id(),false,false,""));
     	    
 	    	if(!StringUtil.isEmpty(agency)){
 	    		conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,true,"agency_name ",SimpleQuery.EQUAL,agency,false,false,""));
 	 	    	conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.OR,false,"agency_code ",SimpleQuery.EQUAL,agency,true,false,""));
     	    }
     	    if(!StringUtil.isEmpty(ExpFunc)){
     	    	conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,true,"exp_func_name ",SimpleQuery.EQUAL,ExpFunc,false,false,""));
     	    	conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.OR,false,"exp_func_code ",SimpleQuery.EQUAL,ExpFunc,true,false,""));
     	    }
     	    if(!StringUtil.isEmpty(ExpEco)){
     	    	conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,true,"exp_eco_name ",SimpleQuery.EQUAL,ExpEco,false,false,""));
     	    	conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.OR,false,"exp_eco_code ",SimpleQuery.EQUAL,ExpEco,true,false,""));
     	    }
     	    if(!StringUtil.isEmpty(DepPro)){
     	    	conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,true,"dep_pro_name ",SimpleQuery.EQUAL,DepPro,false,false,""));
     	    	conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.OR,false,"dep_pro_code ",SimpleQuery.EQUAL,DepPro,true,false,""));
     	    	
     	    }
 	    	

     	    List<RealPayRequest> dbPayRequestList = transServiceForGXBOC.loadRealPayRequestByObj(sc,conditionObj);
     	    
     	    if(dbPayRequestList.size()==0){
     	    	throw new Exception("未查询到明细、请核对查询条件");
     	    }
     	 
     	    PbUtil.setBillDetails(dbPayVoucherList, dbPayRequestList, "realpay_voucher_id");  	
     	  
 	    } else if("0".equals(isGetRequest)){
 	    	
 	    }else{
 	    	throw new Exception("不支持此明细标识查询:"+isGetRequest);
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
	@SuppressWarnings("deprecation")
	public void inputRefundRealPayVoucher(final Session sc,GXBOCBLMsgHead reqHead,GXBOCBLMsgReqBody reqBody) throws Exception{
		//退款方式0全额退款、1部分退款
		String refundType =  reqBody.getObjs()[0].toString();
		
		if(!"0".equals(refundType)){
			throw new Exception("实拨只支持全部退款录入");
		}
    	//凭证号
    	String payVoucherCode = reqBody.getObjs()[1].toString();
    	//退款原因
    	final String refReason = reqBody.getObjs()[4].toString();
    	
    	BigDecimal refAmt = new BigDecimal(reqBody.getObjs()[3].toString());
    	
  	    sc.setBelongOrgCode(reqHead.getBank_no().toString());
  	    
	    sc.setUserCode(reqHead.getOperator());
	   
    	String  vt_Code ;
    	String refund_Code;
	    if(GXBOCBLConstant.BL_REALPAY_FLAG.equals(reqHead.getVt_type())){
	   		vt_Code = VtConstant.APPLY_REALPAY_VT_CODE;
	   		refund_Code = VtConstant.APPLY_REALREFUND_VT_CODE;
	   		sc.setCurrMenuId(Integer.parseInt(UploadFileUtil.getFromPro("gxbocbl", "BL.RefundInputRealPayVoucherFormMenuId")));
	   	}else{
	   		throw new Exception("不支持该凭证类型"+reqHead.getVt_type());
	   	}
	    
	    ConditionObj conditionObj = new ConditionObj();
   	    
        conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"vt_code",SimpleQuery.EQUAL,vt_Code,false,false,""));
        conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"admdiv_code",SimpleQuery.EQUAL,reqHead.getAdmdiv_code(),false,false,""));
        conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"year",SimpleQuery.EQUAL,reqHead.getYear(),false,false,""));
        conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"realpay_voucher_code ",SimpleQuery.EQUAL,payVoucherCode,false,false,""));
        conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"BUSINESS_TYPE",SimpleQuery.EQUAL,PayConstant.Has_CONFIRMED,false,false,""));
        conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"send_flag",SimpleQuery.EQUAL,1,false,false,""));
		
        List<RealPayVoucher> dbPayVoucherList = transServiceForGXBOC.loadRealPayVoucherByObj(sc,conditionObj);
   
        if(dbPayVoucherList.size()==1){
        	if(dbPayVoucherList.get(0).getPay_amount().compareTo(refAmt)!=0){
        		throw new Exception("录入退款金额与总金额不同");
        	}
     	    conditionObj = new ConditionObj();
 			
     	    conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"ADMDIV_CODE",SimpleQuery.EQUAL,reqHead.getAdmdiv_code(),false,false,""));			
     		conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"VT_CODE",SimpleQuery.EQUAL,refund_Code,false,false,""));
     		conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"old_voucher_id",SimpleQuery.EQUAL,dbPayVoucherList.get(0).getRealpay_voucher_id(),false,false,""));
     		conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"is_valid",SimpleQuery.EQUAL,1,false,false,""));
     			
     		List<RealPayVoucher> dbReundPayVoucherList = transServiceForGXBOC.loadRealPayVoucherByObj(sc,conditionObj); 
     		
     		if(dbReundPayVoucherList.size()>0){
     			throw new Exception("此实拨凭证已退款录入");
     		}
    		final List<RealPayVoucher> fdb = dbPayVoucherList;
     		smallTrans.newTransExecute(new ISmallTransService() {
     			public void doExecute() throws Exception {
     				realPayService.inputRefundVoucher(sc, fdb.get(0).getRealpay_voucher_id(), refReason);
				}});
     		
     		conditionObj = new ConditionObj();
     		conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"ori_code",SimpleQuery.EQUAL,fdb.get(0).getRealpay_voucher_code(),false,false,""));
     		List<RealPayVoucher> dbReundPayVouchers = transServiceForGXBOC.loadRealPayVoucherByObj(sc,conditionObj); 
     		realPayService.singAndSendRealPayVoucher(sc,dbReundPayVouchers); //签章发送3208
        }else {
        	throw new Exception("查询原凭证异常");
        }
		
	}
	
	/**
	 * 根据付款人账户 、原支付凭证号、退款凭证录入日期查询退款实拨凭证
	 * @param sc
	 * @param reqHead
	 * @param reqBody
	 * @throws Exception 
	 */
	public List<RealPayVoucher> loadRefundRealPayVoucher(Session sc,GXBOCBLMsgHead reqHead,GXBOCBLMsgReqBody reqBody) throws Exception{
		
		String payAccountNo =  reqBody.getObjs()[0].toString();
		
		String vouNo =  reqBody.getObjs()[1].toString();
		
		String reFundInputDate = reqBody.getObjs()[2].toString();
		
		String vt_code ;
		
		String refund_code ;
		
		if(GXBOCBLConstant.BL_REALPAY_FLAG.equals(reqHead.getVt_type())){
			vt_code = VtConstant.APPLY_REALPAY_VT_CODE;
			refund_code = VtConstant.APPLY_REALREFUND_VT_CODE;
		}else{
			throw new Exception("不支持该类型数据操作"+reqHead.getVt_type());
		}
		
		ConditionObj conditionObj = new ConditionObj();
		
		conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"YEAR",SimpleQuery.EQUAL,reqHead.getYear(),false,false,""));
		conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"ADMDIV_CODE",SimpleQuery.EQUAL,reqHead.getAdmdiv_code(),false,false,""));
		conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"VT_CODE",SimpleQuery.EQUAL,vt_code,false,false,""));
		conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"REALPAY_VOUCHER_CODE",SimpleQuery.EQUAL,vouNo,false,false,""));
		List<RealPayVoucher> dbPayVoucherList = transServiceForGXBOC.loadRealPayVoucherByObj(sc,conditionObj); 
		
		if(dbPayVoucherList.size()==0){
			throw new Exception("未查询到原支付凭证");
		}else if(dbPayVoucherList.size()>1){
			throw new Exception("查询到多笔原支付凭证、请联系管理员");
		}
		
	
		conditionObj = new ConditionObj();
		conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"vou_date",SimpleQuery.EQUAL,reFundInputDate,false,false,""));
		conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"ADMDIV_CODE",SimpleQuery.EQUAL,reqHead.getAdmdiv_code(),false,false,""));
		
		conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"VT_CODE",SimpleQuery.EQUAL,refund_code,false,false,""));
		conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"old_voucher_id",SimpleQuery.EQUAL,dbPayVoucherList.get(0).getRealpay_voucher_id(),false,false,""));
		conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"is_valid",SimpleQuery.EQUAL,1,false,false,""));
		List<RealPayVoucher> dbReundPayVoucherList = transServiceForGXBOC.loadRealPayVoucherByObj(sc,conditionObj); 
		
		if(dbReundPayVoucherList.size()==0){
			throw  new Exception("未查到相关退款凭证、请核实查询条件");
		}
		
		return dbReundPayVoucherList;
		
	}
	
	
	/**
	 * 作废退款实拨凭证
	 * @param sc
	 * @param reqHead
	 * @param reqBody
	 * @throws Exception
	 */
	public List<RealPayVoucher> invalidRefundRealPayVoucher(Session sc,GXBOCBLMsgHead reqHead,GXBOCBLMsgReqBody reqBody) throws Exception{
		
		String vouNo = reqBody.getObjs()[0].toString();
        
		String vt_code;
        
		String refund_code;
        int payType ;
        
        sc.setBelongOrgCode(reqHead.getBank_no().toString());
  	    
	    sc.setUserCode(reqHead.getOperator());
	    
	    if(GXBOCBLConstant.BL_REALPAY_FLAG.equals(reqHead.getVt_type())){
			vt_code = VtConstant.APPLY_REALPAY_VT_CODE;
			refund_code = VtConstant.APPLY_REALREFUND_VT_CODE;
			sc.setCurrMenuId(Integer.parseInt(UploadFileUtil.getFromPro("gxbocbl", "BL.RefundInputRealPayVoucherFormMenuId")));
		}else{
			throw new Exception("不支持该类型数据操作"+reqHead.getVt_type());
		}
        
		ConditionObj conditionObj = new ConditionObj();
        
        conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"realpay_voucher_code",SimpleQuery.EQUAL,vouNo,false,false,""));
        conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"vt_code",SimpleQuery.EQUAL,refund_code,false,false,""));
        conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"year",SimpleQuery.EQUAL,reqHead.getYear(),false,false,""));
        conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"admdiv_code",SimpleQuery.EQUAL,reqHead.getAdmdiv_code(),false,false,""));
        
        List<RealPayVoucher> dbRefundPayVoucherList = transServiceForGXBOC.loadRealPayVoucherByObj(sc,conditionObj);
		
        if(dbRefundPayVoucherList.size()==0){
        	throw new Exception("未查询到退款凭证");
        }else if(dbRefundPayVoucherList.size()>1){
        	throw new Exception("查询到多笔退款凭证、请联系管理员处理");
        }
        
		if( dbRefundPayVoucherList.get(0).getIs_valid()==0){
			
			throw new Exception ("已撤销成功");
		
		}else if(dbRefundPayVoucherList.get(0).getSend_flag() == 1){
			throw new Exception("此退款实拨凭证已发送财政、无法撤单");
		}
		
		transServiceForGXBOC.invalidRefundRealPayVoucher(sc, dbRefundPayVoucherList);
		
		return dbRefundPayVoucherList;
	
		
		
	}
	
	
	/**
	 * 正在进行批量处理的数据设置为不可下载状态
	 * @param vouList
	 * @throws Exception 
	 */
	 public void updateToNotDownLoad(final List<RealPayVoucher> vouList) throws Exception{
		
		 smallTrans.newTransExecute(new ISmallTransService() {
				public void doExecute() throws Exception {
					StringBuffer where=new StringBuffer();
					
					where.append("where realpay_voucher_id in (");
					
					for(RealPayVoucher tempVoucher:vouList){
						where.append(tempVoucher.getId()+","); 
					}
					
					String selectWhere = where.toString();
					
					selectWhere = selectWhere.substring(0, selectWhere.length()-1)+")";
					
					baseDao.execute(updateToNotDownload+selectWhere);
				}
			});
	
	}
	/**
	 * 将批量数据处理完成以后的数据设置为可下载状态
	 * @param vouList
	 * @throws Exception 
	 */
	public void updateToDownLoad(final List<RealPayVoucher> vouList) throws Exception{
		
		 smallTrans.newTransExecute(new ISmallTransService() {
				public void doExecute() throws Exception {
					StringBuffer notDispose = new  StringBuffer();
					
					StringBuffer disposeIds = new StringBuffer();
					
					String where = "where realpay_voucher_id in (";
					
					disposeIds.append(where);
					
					notDispose.append(where);
					
					Long loadTime = 0L;
					for(RealPayVoucher tempVou:vouList){
						if(tempVou.getBlReqPayOperation()!=GXBOCBLConstant.BLReqOperation_NOT_DISPOSE){
									
							disposeIds.append(tempVou.getId()+","); 

							loadTime = tempVou.getBlLoadTime();
							
						}else{
							
							notDispose.append(tempVou.getId()+","); 
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
						log.error(e);
					}
					
					try {
						if(!where.equals(toLoad2)){
							toLoad2 = toLoad2.substring(0, toLoad2.length()-1)+")";
							baseDao.execute(updateToLoad+toLoad2,new Object[]{0});
						}
					}catch(Exception e){
						log.error(e);
					}
				}
			});
		 
		 
		
		
	
	
	}
	public long[] getRealPayVoucherIds( List<RealPayVoucher> list ){
		
		//如果为空则直接返回
		if( ListUtils.isEmpty(list) ){
			long[] l = new long[0];
			return l;
		}
		
		//如果有凭证数据则循环添加
		long[] l = new long[list.size()];
		for( int i = 0; i < list.size(); i++ ){
			l[i] = list.get(i).getRealpay_voucher_id();
		}
		return l;
	}
	
    public List<RealPayVoucher> loadRealPayVoucherByObj(Session sc,ConditionObj obj){
    	return transServiceForGXBOC.loadRealPayVoucherByObj(sc,obj);
    }
	public RealPayService getRealPayService() {
		return realPayService;
	}

	public void setRealPayService(RealPayService realPayService) {
		this.realPayService = realPayService;
	}

	public BaseDAO getBaseDao() {
		return baseDao;
	}

	public void setBaseDao(BaseDAO baseDao) {
		this.baseDao = baseDao;
	}
	
	public IBankNoService getBankNoService() {
		return bankNoService;
	}

	public void setBankNoService(IBankNoService bankNoService) {
		this.bankNoService = bankNoService;
	}
	
	


}
