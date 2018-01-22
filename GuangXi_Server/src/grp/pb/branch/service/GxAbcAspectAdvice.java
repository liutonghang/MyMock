//package grp.pb.branch.shizuishan.web;
package grp.pb.branch.service;

import java.util.ArrayList;
import java.util.List;


import grp.pt.bill.BillEngine;
import grp.pt.bill.Billable;

import grp.pt.common.model.Account;
import grp.pt.database.DaoSupport;
import grp.pt.pb.ss.bs.PsfaPayServiceImpl;
import grp.pt.pb.ss.model.ExchangeCondition;
import grp.pt.util.BaseDAO;
import grp.pt.util.ComplexMapper;
import grp.pt.util.StringUtil;

import org.apache.log4j.Logger;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.ProceedingJoinPoint;

public class GxAbcAspectAdvice {
	private static Logger logger = Logger.getLogger(GxAbcAspectAdvice.class);
	private BillEngine billEngine;
	private BaseDAO baseDao;
	
	public BillEngine getBillEngine() {
		return billEngine;
	}

	public void setBillEngine(BillEngine billEngine) {
		this.billEngine = billEngine;
	}
	
	public BaseDAO getBaseDao() {
		return baseDao;
	}

	public void setBaseDao(BaseDAO baseDao) {
		this.baseDao = baseDao;
	}
	
	
	@SuppressWarnings("unchecked")
	public Object doPutConditionBefore(JoinPoint jp) throws Throwable {

		Object[] args = jp.getArgs();
		
		
		List<ExchangeCondition> reqConditions = new ArrayList<ExchangeCondition>();
		ExchangeCondition newCon = new ExchangeCondition("pay_account_no", "01123213233333333", "=", "0", 1);
		reqConditions.add(newCon);
		
		if(args[0]!=null){
			List<Object> templst = (List<Object>)args[0];
			    if(templst.get(0) instanceof ExchangeCondition){
					List<ExchangeCondition> conditionList=(List<ExchangeCondition>) args[0];
					String pay_account_no = "";
				    for(ExchangeCondition condition : conditionList){
				    	if("pay_account_no".equals(condition.getKey())){
							pay_account_no = condition.getValue() == null ? "" : condition.getValue().toString();
							
						}else
							continue;
				    	
				    	if(!StringUtil.isEmpty(pay_account_no)){
				    		//查询柜面系统维护的单位零余额账户	
	                    if (pay_account_no.length()!=17)
	                    	 logger.error(pay_account_no+"账户长度不是17位，不符合财政下发格式账号");   
	                    
	                 List<Account> accountList = baseDao.queryForList("select * from pb_ele_account where account_type_code ='12'",new ComplexMapper(Account.class));                    				   
	                  
	                 for(Account account : accountList){
				   		
					    		if (pay_account_no.equals(account.getAccount_no()) ){
					    			
					    			    break;
					    			
					    		}else if(account.getAccount_no().length() ==15){				    	
					    			if ( pay_account_no.substring(2).equals(account.getAccount_no()) ){
					    				condition.setValue(account.getAccount_no());
					    	
					    				break;				    			 
					    			}				    			                                 				    			
					    			
					    		}else if (account.getAccount_no().length() ==18){
						    		if ( pay_account_no.substring(2).equals( account.getAccount_no().substring(3)) ){
						    			condition.setValue(account.getAccount_no());
						    			logger.info(pay_account_no+"账户18位，格式账号"); 
						    			break;				    			 
						    		 }	
						    		
					    		}else
		                        	 logger.error(pay_account_no+"账户在pb_ele_account账户表中配置错误或未配置");  				    		 			
				    		}
				   
				    	}
				    	
				    }
				    args[0]=conditionList;
				    
			    }
			}
	
	return args[0];

		
		
	}

}
