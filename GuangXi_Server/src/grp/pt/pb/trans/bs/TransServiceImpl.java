package grp.pt.pb.trans.bs;
import grp.pt.bill.ConditionObj;
import grp.pt.bill.Paging;
import grp.pt.bill.ReturnPage;
import grp.pt.idgen.IdGen;
import grp.pt.pb.common.IBankNoService;
import grp.pt.pb.common.IFinService;
import grp.pt.pb.common.INetworkService;
import grp.pt.pb.common.model.BankNoDTO;
import grp.pt.pb.officialcard.OfficalCardInfo;
import grp.pt.pb.payment.IVoucher;
import grp.pt.pb.payment.PayVoucher;
import grp.pt.pb.trans.IBankTransService;
import grp.pt.pb.trans.ITransService;
import grp.pt.pb.trans.ex.PbTransException;
import grp.pt.pb.trans.ex.PbTransUnKnownException;
import grp.pt.pb.trans.model.AccountTransDetailDTO;
import grp.pt.pb.trans.model.MsgResBody.SerialNo;
import grp.pt.pb.trans.model.RelationAccountDTO;
import grp.pt.pb.trans.model.TransLogDTO;
import grp.pt.pb.trans.model.TransReturnDTO;
import grp.pt.pb.trans.util.Context;
import grp.pt.pb.util.ChangeUtil;
import grp.pt.pb.util.PbParaConstant;
import grp.pt.pb.util.PbParameters;
import grp.pt.pb.util.PbUtil;
import grp.pt.pb.util.TradeConstant;
import grp.pt.util.ListUtils;
import grp.pt.util.PlatformUtils;
import grp.pt.util.StringUtil;
import grp.pt.util.exception.CommonException;
import grp.pt.util.model.Session;
import grp.pt.util.transation.ISmalTrans;
import grp.pt.util.transation.ISmallTransService;

import java.math.BigDecimal;
import java.net.SocketTimeoutException;
import java.util.List;

import org.apache.commons.lang.StringUtils;
import org.apache.log4j.Logger;

/*******************************************************************************
 * 银行接口实现类
 * 
 * @author zhouqi
 * 
 */
public class TransServiceImpl implements ITransService {
	
	private static Logger log = Logger.getLogger(TransServiceImpl.class);
	
	/**
	 *  与银行核心相关的配置
	 */
	static Context context = new Context();
	
	/**
	 * 银行核心接口个性化实现
	 */
	static IBankTransService transService;
	
	
	static{
		transService = context.newBankTransService();
	}
	
	/**
	 * 银行接口操作相关DAO
	 */
	TransDAO transDAO = null;
	/**
	 * 小事务
	 */
	ISmalTrans smallTrans = null;
	/**
	 * 财政
	 */
	IFinService finService = null;
	/**
	 * 银行网点操作接口
	 */
	INetworkService networkService = null;
	
	IBankNoService bankNoService = null;
	

	static final int CLEAR_TYPE_NO = 0;
	

	/***************************************************************************
	 * 支付请款、转账
	 */
	public TransReturnDTO payTrans(Session sc, IVoucher t) throws Exception {

		// 为了解决银行的零余额账户作为划款户的问题，当账户一致的时候不转账，直接返回成功
		// 在配置界面中需要保证逆向的垫支户、划款户、财政零余额账户一致（一般只有直接支付会如此）
		// 农行现金支付时，收付款人可能会相同
		final int isTranOnSameAcct = PbParameters.getIntParameter(PbParaConstant.ISTRANS_ON_SAME_ACCT);//添加收付款人一致是否转账参数控制
		if(StringUtils.equals(t.getPayAcctNo(), t.getPayeeAcctNo())&&isTranOnSameAcct!=1){
			int tradeType = t.getTrade_type();
			if(TradeConstant.PAY2PAYEE == tradeType){
				throw new PbTransException("收付款人一致，请核查！");
			}else if(TradeConstant.PAY2PAYEECASH !=tradeType){
				return new TransReturnDTO(TransReturnDTO.SUCESS, "账户相同，交易成功！");
			}
		}
		TransReturnDTO payReturnDTO = null;
		try {
			// 1、查询本地交易记录，是否已交易
			payReturnDTO = this.queryTrans(sc, t);
			//默认保存日志
			if( payReturnDTO != null && payReturnDTO.isSaveLog() && payReturnDTO.getResStatus() != TransReturnDTO.UNKNOWN){
				// 保存交易记录【小事务处理】
				final Session session = sc;
				final IVoucher  tt = t;
				smallTrans.newTransExecute(new ISmallTransService() {
					public void doExecute() throws Exception {
						transDAO.saveTranLog(session, tt);
					}
				});
			}
			// 2、已交易过且交易失败
			if (payReturnDTO != null
					&& payReturnDTO.getResStatus() == TransReturnDTO.UNKNOWN) {
				
				throw new PbTransUnKnownException("交易状态不确定，请人工核实！");
			
			} else if (payReturnDTO == null || payReturnDTO.getResStatus() != 0) {

				PlatformUtils.setProperty(t, "pay_account_code", sc
						.getBelongOrgCode());
				
				if(t.getVtCode().equals("5201") || t.getVtCode().equals("8202")){
					if(((BigDecimal)PlatformUtils.getProperty(t, "pay_amount")).signum() == -1 ){
						throw new PbTransException("正向支付金额为负，不允许支付！");
					}
				}
				// 如果是从零余额账户转账到收款人的时候需要做收付款人是否改变的操作
				/*if (t.getTrade_type() == TradeConstant.PAY2PAYEE) {
			    	if(PbParameters.getStringParameter("pb.checkVoucher").equals("1")){
					PayVoucher payvoucher = (PayVoucher) t;
					XMLVoucherBody voucherBody = new XMLVoucherBody();
					EVoucherAnalytic ev = new EVoucherAnalytic(voucherBody);
					voucherBody = ev.receiveVoucherByNo(t.getAdmdivCode(), t
							.getVtCode(), t.getVouNo());
					Billable oriBill = ev.resolveBizHandler(voucherBody);
					// 1金额不能超
					// 2.收款人账号不能修改payee_account_no
					PayVoucher oriPay = (PayVoucher) oriBill;
					int i = payvoucher.getPay_amount().compareTo(
							oriPay.getOri_pay_amount());
					//如果支付金额小于等于原始金额
					if (i < 1) {
						//原凭证收款人账号为空时，才允许改收款人账号
						if (!StringUtil.isEmpty(oriPay.getOri_payee_account_no())) {
							if(StringUtil.isEmpty( payvoucher.getPayee_account_no() )){
								throw new PbTransException("收款账号不能为空!");
							}else if(!payvoucher.getPayee_account_no().equals(oriPay.getOri_payee_account_no())){
								throw new PbTransException("收款账号被篡改！");
							}
						}
					} else {
						throw new PbTransException("支付金额大于原始金额！");
					}

				}*/

				payReturnDTO = transService.trans(sc,context, t);
			}
		} catch (PbTransUnKnownException e) {
			if (payReturnDTO == null) {
				payReturnDTO = new TransReturnDTO();
			}
			payReturnDTO = new TransReturnDTO(TransReturnDTO.UNKNOWN, "交易状态不确定，请人工核实！",
					t.getTransId());
			throw new PbTransUnKnownException(e.getMessage());
		}catch (SocketTimeoutException e) {
			if (payReturnDTO == null) {
				payReturnDTO = new TransReturnDTO();
			}
			payReturnDTO = new TransReturnDTO(TransReturnDTO.UNKNOWN, "请求核心超时",
					t.getTransId());
			throw new SocketTimeoutException(e.getMessage());
		} catch (Exception ex) {
			if (payReturnDTO == null) {
				payReturnDTO = new TransReturnDTO();
			}
			payReturnDTO = new TransReturnDTO(TransReturnDTO.FAILURE, ex
					.getMessage(), t.getTransId());
			log.error("转账失败", ex);
			throw new PbTransException("转账失败：" + ex.getMessage());
		} finally {
			// 4、更新日志
			final Session session = sc;
			final TransReturnDTO copyReturnDTO = payReturnDTO;
			smallTrans.newTransExecute(new ISmallTransService() {
				public void doExecute() throws Exception {
					transDAO.editTranLog(session, copyReturnDTO);
				}
			});
		}
		return payReturnDTO;
	}
	
	


	@Override
	public TransReturnDTO manTrans(Session sc, IVoucher t) throws Exception {
		TransReturnDTO payReturnDTO  = null;
		try {
		    //2015-9-11 15:14:39 sh 当配置为1时，如果trasnId非空则不重新赋值
		    int isSetTransID = PbParameters.getIntParameter(PbParaConstant.IS_SET_TRANS_ID);
		    if(isSetTransID==0){
		        t.setTransId(generateTransId(t.getVtCode()));
		    }else if(isSetTransID==1 &&StringUtil.isEmpty(t.getTransId()) ){
	            t.setTransId(generateTransId(t.getVtCode()));
		    }
			// 保存交易记录【小事务处理】
			final Session session = sc;
			final IVoucher  tt = t;
			smallTrans.newTransExecute(new ISmallTransService() {
				public void doExecute() throws Exception {
					transDAO.saveTranLog(session, tt);
				}
			});
			payReturnDTO = new TransReturnDTO(0, "人工转账", t.getTransId(), t.getBankTransId());
			// 4、更新日志
			final TransReturnDTO copyReturnDTO = payReturnDTO;
			smallTrans.newTransExecute(new ISmallTransService() {
				public void doExecute() throws Exception {
					transDAO.editTranLog(session, copyReturnDTO);
				}
			});
		} catch (Exception ex) {
			throw new PbTransException("转账失败："+ex.getMessage());
		}
		return payReturnDTO;
	}
	
	
	/***
	 * 清算转账
	 */
	public TransReturnDTO clearTrans(Session sc, IVoucher t, boolean is_samebank_clear) throws Exception {

		//根据金额判断正向还是退款
		BigDecimal amount = (BigDecimal) PlatformUtils.getProperty(t, "pay_amount"); 
		
		//正向同行清算 是否调用转账接口
		boolean paySameBankClear = PbParameters.getIntParameter("pb.pay.SameBank.clearTrans")==1?true:false;
		
		//退款同行清算是否调用转账接口
		boolean refSameBankClear = PbParameters.getIntParameter("pb.ref.SameBank.clearTrans")==1?true:false;
		//退款跨行清算是否调用转账接口
		boolean refDifBankClear = PbParameters.getIntParameter("pb.ref.DifBank.clearTrans")==1?true:false;
		
		//判断转账类型
		if(amount.signum() >= 0){ //正向清算
			PlatformUtils.setProperty(t, "trade_type",  TradeConstant.CLEARTOAGENT);
			//如果是同行清算切需要转账
			if( is_samebank_clear && paySameBankClear ){
				return payTrans(sc, t);
			}else{ //其余直接返回成功
				return new TransReturnDTO(0,"",t.getTransId());
			}
			
		}else{
			PlatformUtils.setProperty(t, "trade_type",  TradeConstant.AGENTTOCLEAR);
			
			if( is_samebank_clear && refSameBankClear ){
				return payTrans(sc, t);
			}else if( !is_samebank_clear && refDifBankClear ){
				return payTrans(sc, t);
			}else{
				return new TransReturnDTO(0,"",t.getTransId());
			}
		}
	
	}
	
	/***
	 * 查询隔日对账
	 */
	public List<SerialNo> queryHisSerialno(Session sc, IVoucher t, String queryDate) throws Exception {
		return transService.queryHisSerialno(sc, context,t,queryDate);
	}
	
	/***
	 * 查询交易状态
	 * @param sc
	 * @param o
	 * @return
	 * @throws Exception
	 */
	public TransReturnDTO queryTrans(Session sc, IVoucher t) throws Exception {
		
		List<TransLogDTO> tranList = transDAO.loadTransLogByVouNo(sc, t
				.getVouNo(), t.getTrade_type(), t.getAdmdivCode(), t
				.getVtCode(),t.getYear());
		//如果本次交易为冲销，并且日志表中存在冲销的记录，需要获取最近一次的请款的日志记录：请款在前，则立即执行冲销；冲销在前，则需要去银行核心查正。
		if (!ListUtils.isEmpty(tranList)
				&& t.getTrade_type() == TradeConstant.PAY2ADVANCE_WRITEOFF) {
			String batchNO = (String) PlatformUtils.getProperty(t,
					"pay_voucher_code");
			List<TransLogDTO> tranLists = transDAO.loadTransLogByVouNo(sc,
					batchNO, TradeConstant.ADVANCE2PAY, t.getAdmdivCode(), t
							.getVtCode(),t.getYear());
			int result = tranList.get(0).getCreate_time().compareTo(
					tranLists.get(0).getCreate_time());
			if (result < 0) {
				tranList = null;
			}
		} 
		//如果本次交易为请款，并且日志表中存在请款的记录，需要获取最近一次的请款冲销的日志记录：冲销在前，则立即执行请款；请款在前，则需要去银行核心查正。
		else if (!ListUtils.isEmpty(tranList)&& t.getTrade_type() == TradeConstant.ADVANCE2PAY) {
			String batchNO = (String) PlatformUtils.getProperty(t,
					"pay_voucher_code");
			List<TransLogDTO> tranLists = transDAO.loadTransLogByVouNo(sc,
					batchNO, TradeConstant.PAY2ADVANCE_WRITEOFF, t.getAdmdivCode(), t.getVtCode(),t.getYear());
			
			if(ListUtils.isNotEmpty(tranLists) && 1 == tranLists.get(0).getTrans_succ_flag()){
				int result = tranList.get(0).getCreate_time().compareTo(
						tranLists.get(0).getCreate_time());
				// 如果请款时间小于冲销时间，则不需要调用查证接口
				//xcg 2016-10-17 19:40:51 冲销失败后，进行支付，出现重复请款问题
				if (result < 0 ) {
					tranList = null;
				}
			}
		}
		TransReturnDTO returnDTO = transService.queryTrans(sc, context, t,
				tranList == null ? null : tranList.size() == 0 ? null
						: tranList.get(0));
		return returnDTO;
	}
	
	@Override
	public ReturnPage queryTransLog(Session sc, ConditionObj obj, Paging page) throws Exception {
		return transDAO.queryTransLog(sc, obj, page);
	}
	

	public List<SerialNo> checkSerialno(Session sc, IVoucher t, String queryDate)
			throws Exception {
		t.setUserCode(sc.getUserCode());
		return transService.checkSerialno(sc, context, t, queryDate);
	}

	/***
	 * 根据账户查询余额
	 * @throws Exception 
	 */
	public BigDecimal queryAcctBalance(Session sc, IVoucher t) throws Exception{
		t.setUserCode(sc.getUserCode());
		t.setTransId(seqReq("5201"));
		return transService.queryAcctBalance(sc, context, t);
	}

	/****
	 * 生成交易流水ID yyMMdd-凭证类型-7位序列
	 * 
	 * @param vtCode
	 *            凭证类型
	 * @return
	 */
	String seqReq(String vtCode) {
		// 流水ID
		StringBuffer flowIdSb = new StringBuffer();
		flowIdSb.append(PbUtil.getCurrDate("yyMMdd")).append("-");
		flowIdSb.append(vtCode).append("-");
		String id = IdGen.genStrId("SEQ_TRANS_FLOW_ID");
		if (id.length() > 7) {
			id = id.substring(id.length() - 7);
		} else {
			id = ChangeUtil.getFixlenStr(id, 7);
		}
		flowIdSb.append(id);
		return flowIdSb.toString();
	}

	/***
	 * 查询待清算授权支付凭证信息
	 */
	public List<PayVoucher> queryPayDetail(Session sc, String admdivCode,
			String queryDate, String vtCode) throws Exception {
		return transService.queryPayDetail(sc, context, admdivCode, queryDate, vtCode);
	}

	/***************************************************************************
	 * 根据收款人账号和开户行名查询行号
	 */
	public List<BankNoDTO> queryBankNo(Session sc, String payeeAcctNo,
			String payeeAcctBankName) throws Exception {
		try {
			//通过参数配置获取  行号查询模式  1:从代理行系统查询； 2：银行接口查询
			int queryModel=PbParameters.getIntParameter("queryModel");
			//通过本系统查询行号
			if(queryModel==1){
				return bankNoService.queryBankNoByUs(sc, payeeAcctNo, payeeAcctBankName);
			}else{  //调用银行核心系统获取行号
				return transService.queryBankNo(sc, context, payeeAcctNo,
						payeeAcctBankName);
			}
			
		} catch (Exception ex) {
			log.info("行号检索失败！",ex);
			throw new CommonException(ex.getMessage(), ex);
		}
	}
	
	
	@Override
	public String queryPayeeAcctNameInBank(Session sc, IVoucher t)
			throws Exception {
		return transService.queryPayeeAcctNameInBank(sc, context, t);
	}

	@Override
	public String reqTransDetail(Session sc, IVoucher t) throws Exception {

		return transService.reqTransDetail(sc, context, t);
	}
//	/***************************************************************************
//	 * 查询交易日志<判断该凭证是否已交易，已交易则取已存在的流水ID调查询接口>
//	 * 
//	 * @param sc
//	 * @param support
//	 * @return
//	 */
//	MsgResBody existsTrans(Session sc, Object o) throws Exception {
//		String vouNo = (String) PlatformUtils.getProperty(o, "code");
//		String admdivCode = (String) PlatformUtils.getProperty(o,"admdiv_code");
//		//交易类型
//		final int tradeType = (Integer) PlatformUtils.getProperty(o,"trade_type");
//		MsgResBody transResult =null;
//		boolean isLog = true;
//		try {
//			// 查询该凭证的交易日志
//			List<TransLogDTO> tranList = transDAO.loadTransLogByVouNo(sc,vouNo, tradeType, admdivCode);
//			//交易流水号暂时去最大版本的，农行需要用原交易流水号去查日志
//			if (!ListUtils.isEmpty(tranList)) {
//				PlatformUtils.setProperty(o, "agent_business_no",tranList.get(0).getTrans_log_id());
//				for( TransLogDTO tldto : tranList ){
//					//如果交易成功过则直接返回
//					if( tldto.getTrans_succ_flag() == 1 ){
//						return transService.setMsgResBody(0, 0);
//					}
//				}
//				//湖南建行和交行
//				if(context.newTranId){	
//					PlatformUtils.setProperty(o, "agent_business_no", seqReq());
//					transResult = transService.queryTrans(sc, context, o);
//					log.info("ReqCode:" +transResult.getResHead().getReqCode());
//					if( transResult.getResHead().getReqCode() == 0 ){
//						return transResult;
//					}
//				// 黑龙江不需要保存交易日志，交易流水号取agent_business_no
//				}else{
//					//如果是黑龙江则赋值原有的交易流水id
//					String flowId = tranList.get(0).getTrans_log_id();
//					// 生成交易流水号
//					PlatformUtils.setProperty(o, "agent_business_no", flowId);
//					PlatformUtils.setProperty(o, "payAgain", new Boolean(true));
//					isLog = false;
//				}
//			}
//			if(isLog){
//				if (PbParameters.getStringParameter("pb.cleartrans") != null) {
//					PlatformUtils.setProperty(o, "agent_business_no", seqReq());
//				} else {
//					// 生成交易流水号
//					PlatformUtils.setProperty(o, "agent_business_no",generateTransId(PlatformUtils.getProperty(o,"vt_code")));
//				}
//				// 保存交易记录【小事务处理】
//				final Session session = sc;
//				final Object  obj = o;
//				smallTrans.newTransExecute(new ISmallTransService() {
//					public void doExecute() throws Exception {
//						transDAO.saveTranLog(session, obj, tradeType);
//					}
//				});
//			}
//		} catch (Exception ex) {
//			log.error("凭证号：" + vouNo + "，查正失败，原因："+ex.getMessage());
//			throw new PbException("查询凭证号：" + vouNo + "的交易状态失败,原因："+ex.getMessage());
//		}
//		return transResult;
//	}
	
	
	/****
	 * 生成交易流水ID yyMMdd-凭证类型-7位序列
	 * 
	 * @param vtCode
	 *            凭证类型
	 * @return
	 */
	String generateTransId(Object vtCode) {
		// 流水ID
		StringBuffer flowIdSb = new StringBuffer();
		flowIdSb.append(PbUtil.getCurrDate("yyMMdd")).append("-");
		flowIdSb.append(vtCode).append("-");
		String id = IdGen.genStrId("SEQ_TRANS_FLOW_ID");
		if (id.length() > 7) {
			id = id.substring(id.length() - 7);
		} else {
			id = ChangeUtil.getFixlenStr(id, 7);
		}
		flowIdSb.append(id);
		return flowIdSb.toString();
	}
	
	

//	/****
//	 * 生成请求端的流水号 18000 + 日期6位 ＋ 9位序列
//	 * @param vtCode 凭证类型
//	 * @return
//	 */
//	String seqReq() {
//		// 流水ID
//		StringBuffer str = new StringBuffer();
//		str.append("18000" +  new SimpleDateFormat("yyMMdd").format(new Date()));
//		String id = IdGen.genStrId("SEQ_TRANS_LOG_ID");
//		if (id.length() > 9) {
//			id = id.substring(id.length() - 9);
//		} else {
//			id = ChangeUtil.getFixlenStr(id, 9);
//		}
//		 str.append(id);
//		return str.toString();
//	}

	
	public TransDAO getTransDAO() {
		return transDAO;
	}

	public void setTransDAO(TransDAO transDAO) {
		this.transDAO = transDAO;
	}

	public ISmalTrans getSmallTrans() {
		return smallTrans;
	}

	public void setSmallTrans(ISmalTrans smallTrans) {
		this.smallTrans = smallTrans;
	}

	public INetworkService getNetworkService() {
		return networkService;
	}

	public void setNetworkService(INetworkService networkService) {
		this.networkService = networkService;
	}
	
	public IFinService getFinService() {
		return finService;
	}

	public void setFinService(IFinService finService) {
		this.finService = finService;
	}
	
	public IBankNoService getBankNoService() {
		return bankNoService;
	}

	public void setBankNoService(IBankNoService bankNoService) {
		this.bankNoService = bankNoService;
	}

	@Override
	public boolean loginValidate(Session sc, String verifyCode)
			throws Exception {
		return transService.loginValidate(sc, context, verifyCode);
	}

	@Override
	public List<AccountTransDetailDTO> queryAccountTransDetail(Session sc,
			String account_no, String start_date, String end_date, String user_id, String func_code)
			throws Exception {
		return transService.queryAccountTransDetail(sc, context, account_no, start_date, end_date, user_id, func_code);
	}
	
	public List<?> queryAcctInfo(Session sc, Object... paras)throws Exception
	{
		return transService.queryAcctInfo(sc, context, paras);
	}




	@Override
	public RelationAccountDTO queryAcctCredentials(Session sc, 
			Object... paras) throws Exception {
		// TODO Auto-generated method stub
		return transService.queryAcctCredentials(sc, context, paras);
	}
	
	public List<?> querySerial(Session sc,Object... paras)throws Exception{
		return transService.querySerial(sc, context, paras);
	}




	@Override
	public void updateTransLog(final Session sc, final TransReturnDTO transReturnDTO)
			throws Exception {
		smallTrans.newTransExecute(new ISmallTransService() {
			
			@Override
			public void doExecute() throws Exception {
				transDAO.editTranLog(sc, transReturnDTO);
			}
		});
		
	}




	@Override
	public TransReturnDTO checkOfficialCard(Session sc, OfficalCardInfo card)
			throws Exception {
		return transService.checkOfficialCard(sc, context, card);
	}
}
