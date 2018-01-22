package grp.pb.branch.gxboc.service;

import grp.pb.branch.gxboc.trans.transUtilForGXBOCTrans;
import grp.pt.bill.Billable;
import grp.pt.pb.assp.handler.XmlConstant;
import grp.pt.pb.common.model.BankAccount;
import grp.pt.pb.payment.PayRequest;
import grp.pt.pb.payment.PayVoucher;
import grp.pt.pb.realpay.RealPayRequest;
import grp.pt.pb.realpay.RealPayVoucher;
import grp.pt.pb.trans.util.MsgConstant;
import grp.pt.pb.trans.util.TransUtil;
import grp.pt.pb.util.ChangeUtil;
import grp.pt.pb.util.PayConstant;
import grp.pt.pb.util.TradeConstant;
import grp.pt.util.exception.CommonException;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.sql.Timestamp;
import java.text.DecimalFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.List;

import org.apache.log4j.Logger;

/***
 * 回执报文体
 * 
 */
public class GXBOCBLMsgResBody extends MsgResBody {

	private static Logger logger = Logger.getLogger(GXBOCBLMsgResBody.class);
	
	private static DecimalFormat amountFormat = new DecimalFormat("0.00");
	///////////////////////////////
	/**
	 * 当前相应报文体
	 */
	private byte[] msgBody;

	public GXBOCBLMsgResBody() {
	}

	/***
	 * 解析回执报文
	 */
	@Override
	public byte[] readResMsgBody() throws Exception {
		return msgBody;
	}

	/***
	 * 
	 * @param objects
	 */
	public GXBOCBLMsgResBody(Object...objects) {
		super(objects);
		if(objects==null || objects.length==0 || objects[0]==null){
			throw new CommonException("凭证类型不能为空！"); 
		}
		this.setTranType(objects[0].toString());
		Object[] objs = new Object[objects.length - 1];
		for (int i = 1; i < objects.length; i++) {
			objs[i - 1] = objects[i];
		}
		this.setObjs(objs);
		
		//(响应报文）待确认支付凭证列表回执（1000）
		if (this.getTranType().equalsIgnoreCase(MsgConstant.GXBOC_VOU_UNCF_LOAD_RESP)) {
			try {
				this.msgBody = vouUnCfBytes();
			} catch (IOException e) {
				logger.error("拼装待确认支付凭证列表回执报文体失败,原因：" + e.getMessage());
				throw new CommonException("拼装待确认支付凭证列表回执报文体失败,原因：" + e.getMessage());
			}
		}
		//(响应报文）网点账户权限列表回执（1401）
		else if(this.getTranType().equalsIgnoreCase(MsgConstant.GXBOC_NETWORK_USER_QUERY_RESP)){
			try {
				this.msgBody = networkUserBytes();
			} catch (IOException e) {
				logger.error("拼装网点账户权限列表回执报文体失败,原因：" + e.getMessage());
				throw new CommonException("拼装网点账户权限列表回执报文体失败,原因：" + e.getMessage());
			}
		}
		//(响应报文）支付凭证确认回执（1002）
		else if(this.getTranType().equalsIgnoreCase(MsgConstant.GXBOC_VOU_SURE_BACK_RESP)){
			try {
				this.msgBody = vouAffirmReturn();
			} catch (IOException e) {
				logger.error("拼装支付凭证确认列表回执报文体失败,原因：" + e.getMessage());
				throw new CommonException("拼装支付凭证确认列表回执报文体失败,原因：" + e.getMessage());
			}
		}
		
		//(响应报文）已支付凭证明细回执（1004）
		else if(this.getTranType().equalsIgnoreCase(MsgConstant.GXBOC_VOU_QUERY_RESP)){
			try {
				this.msgBody = this.isClearPayVoucherQuery();
			} catch (IOException e) {
				logger.error("拼装历史支付凭证查询回执失败,原因：" + e.getMessage());
				throw new CommonException("拼装历史支付凭证查询回执失败,原因：" + e.getMessage());
			}
		}
		
		//（响应报文）退款通知书录入回执（1005）
		else if(this.getTranType().equalsIgnoreCase(MsgConstant.GXBOC_VOU_BACK_RESP)){
			try {
				this.msgBody = this.refundAffirmReturn();
			} catch (IOException e) {
				logger.error("拼装退款通知书录入回执,原因：" + e.getMessage());
				throw new CommonException("拼装退款通知书录入回执,原因：" + e.getMessage());
			}
		}
		
		//(响应报文）历史凭证列表回执（1009）
		else if(this.getTranType().equalsIgnoreCase(MsgConstant.GXBOC_VOU_HISTORY_BACK_RESP)){
			try {
				this.msgBody = this.historyVouQuery();
			} catch (IOException e) {
				logger.error("拼装历史支付凭证查询回执失败,原因：" + e.getMessage());
				throw new CommonException("拼装历史支付凭证查询回执失败,原因：" + e.getMessage());
			}
		}
		
		else if(this.getTranType().equalsIgnoreCase(GXBOCBLConstant.GXBOC_WAITCLEAR_REFUND_VOUCHER_QUERY_RESP)){
			try {
				this.msgBody = this.waitClearRefundVoucherQuery();
			} catch (IOException e) {
				logger.error("拼装待清算凭证确认查询回执失败,原因：" + e.getMessage());
				throw new CommonException("拼装待清算凭证确认查询回执失败,原因：" + e.getMessage());
			}
		}
		
		else if(this.getTranType().equalsIgnoreCase(GXBOCBLConstant.GXBOC_REPEAL_REFUND_VOUCHER_RESP)){
			try {
				this.msgBody = this.invalidateRefundVoucher();
			} catch (IOException e) {
				logger.error("拼装撤销退款凭证回执失败，原因：" + e.getMessage());
				throw new CommonException("拼装撤销退款凭证回执失败,原因：" + e.getMessage());
			}
		}
		//按日期查询凭证状态
		else if(this.getTranType().equalsIgnoreCase(GXBOCBLConstant.GXBOC_VOUCHER_QUREY_RESP)){
			try {
				this.msgBody = this.voucherQuery();
			} catch (IOException e) {
				logger.error("凭证状态查询失败,原因：" + e.getMessage());
				throw new CommonException("凭证状态查询失败,原因：" + e.getMessage());
			}
		}
		//按单位零余额查询授权支付额度
		else if(this.getTranType().equalsIgnoreCase(GXBOCBLConstant.GXBOC_VOU_ACCREDIT_ED_RESP)){
			try {
				this.msgBody = this.accreditPayAmtQuery();
			} catch (IOException e) {
				logger.error("授权支付额度查询失败,原因：" + e.getMessage());
				throw new CommonException("授权支付额度查询失败,原因：" + e.getMessage());
			}
		}
	}

	/**
	 * @Description: 拼装响应报文体(响应报文）待确认支付凭证列表回执（1000）
	 * @author: 柯伟
	 * @date: 2014-5-28 上午10:34:32
	 */
	@SuppressWarnings({ "unchecked"})
	private byte[] vouUnCfBytes() throws IOException {
		ByteArrayOutputStream byteOut = new ByteArrayOutputStream();
		List<Billable> list = ((List<Billable>)this.getObjs()[0]);
		if(list.get(0) instanceof RealPayVoucher){
			for(RealPayVoucher p : ((List<RealPayVoucher>)this.getObjs()[0])){
				byteOut.write(TransUtil.getRegionBytes("101", "支付令号", p.getRealpay_voucher_code(), 42));
				byteOut.write(TransUtil.getRegionBytes("102", "支付凭证金额", amountFormat.format(p.getPay_amount()),18));
				byteOut.write(TransUtil.getRegionBytes("103", "凭证日期", p.getVou_date(),8));
				byteOut.write(TransUtil.getRegionBytes("104", "单位名称", p.getAgency_name(),60));
				byteOut.write(getRegionBytes4GXBOC("105", "摘要", p.getPay_summary_name(),200));
				byteOut.write(TransUtil.getRegionBytes("106", "付款人账号", p.getPay_account_no(),32));
				byteOut.write(TransUtil.getRegionBytes("107", "付款人名称", p.getPay_account_name(),60));
				byteOut.write(TransUtil.getRegionBytes("108", "收款人银行", p.getPayee_account_bank(),60));
				byteOut.write(TransUtil.getRegionBytes("109", "收款人账号", p.getPayee_account_no(),32));
				byteOut.write(TransUtil.getRegionBytes("110", "收款人全称", p.getPayee_account_name(),100));
				byteOut.write(TransUtil.getRegionBytes("111", "收款人联行号", p.getPayee_account_bank_no(),14));
				byteOut.write(TransUtil.getRegionBytes("112", "支票号", p.getCheckNo(),32));
				byteOut.write(TransUtil.getRegionBytes("113", "数据版本号", p.getBlLoadTime()+"",20));
				String batchStatuName = ""; //未请款、请款失败或超时、请款成功（支付失败）、请款成功（支付超时）
				//实拨可能存在状态： A异常凭证、4已支付、7已支付回单发送失败 、5已撤单、9支付未明  3支付失败 1未支付
				if("A".equals(p.getBl_voucher_Status())){
					batchStatuName = GXBOCBLConstant.VOUCHER_ABNORMAL;
				}else if(p.getBusiness_type() == PayConstant.Has_CONFIRMED){
					batchStatuName = GXBOCBLConstant.PAYMONEY_SUCC;
				}else if(p.getSend_flag() == -1){
					batchStatuName = GXBOCBLConstant.SEND_RETURN_VOUOCHER_FAIL;
				}else if(p.getBusiness_type() == PayConstant.HASBACK_CONFIRMED){
					batchStatuName = GXBOCBLConstant.VOUCHER_BACK_SUCC;
				}else if(p.getBusiness_type() == GXBOCBLConstant.UNKNOWN_CONFIRMED ){
					batchStatuName=GXBOCBLConstant.PAYMONEY_NOTCONFIRM;
				}else if(p.getBusiness_type() == PayConstant.Fail_CONFIRMED){
					batchStatuName=GXBOCBLConstant.REQMONEY_SUCC;
				}else {
					batchStatuName = GXBOCBLConstant.NOT_REQMONEY;
				}
				byteOut.write(TransUtil.getRegionBytes("114", "单据状态说明", batchStatuName,60));
				byteOut.write(TransUtil.getRegionBytes("115", "指令类别", "1",1));
			}
		}else{
			for(PayVoucher p : ((List<PayVoucher>)this.getObjs()[0])){
				byteOut.write(TransUtil.getRegionBytes("101", "支付令号", p.getPay_voucher_code(), 42));
				byteOut.write(TransUtil.getRegionBytes("102", "支付凭证金额", amountFormat.format(p.getPay_amount()),18));
				byteOut.write(TransUtil.getRegionBytes("103", "凭证日期", p.getVou_date(),8));
				byteOut.write(TransUtil.getRegionBytes("104", "单位名称", p.getAgency_name(),60));
				byteOut.write(getRegionBytes4GXBOC("105", "摘要", p.getPay_summary_name(),200));
				byteOut.write(TransUtil.getRegionBytes("106", "付款人账号", p.getPay_account_no(),32));
				byteOut.write(TransUtil.getRegionBytes("107", "付款人名称", p.getPay_account_name(),60));
				byteOut.write(TransUtil.getRegionBytes("108", "收款人银行", p.getPayee_account_bank(),60));
				byteOut.write(TransUtil.getRegionBytes("109", "收款人账号", p.getPayee_account_no(),32));
				byteOut.write(TransUtil.getRegionBytes("110", "收款人全称", p.getPayee_account_name(),100));
				byteOut.write(TransUtil.getRegionBytes("111", "收款人联行号", p.getPayee_account_bank_no(),14));
				byteOut.write(TransUtil.getRegionBytes("112", "支票号", p.getCheckNo(),32));
				byteOut.write(TransUtil.getRegionBytes("113", "数据版本号", p.getBlLoadTime()+"",20));
				String batchStatuName = ""; //未请款、请款失败或超时、请款成功（支付失败）、请款成功（支付超时）
				if(p.getSend_flag() == -1){
					batchStatuName=GXBOCBLConstant.SEND_RETURN_VOUOCHER_FAIL;
				}else if(p.getVoucherFlag() == GXBOCBLConstant.VOUCHERFLAG_VALUE_BACK_FAIL){
					batchStatuName=GXBOCBLConstant.VOUCHER_BACK_FAIL;
				}else if(p.getBatchreq_status()==0){
					batchStatuName=GXBOCBLConstant.NOT_REQMONEY;
				}else if(p.getBatchreq_status()==-1){
					batchStatuName=GXBOCBLConstant.REQMONEY_FAIL;
				}else if(p.getBatchreq_status()==1 && p.getBusiness_type()==0){
					//支付超时或者支付失败查询交易状态为未确认
					if(p.getTrans_succ_flag() == TradeConstant.TRANS_UNKOWN){
						batchStatuName=GXBOCBLConstant.PAYMONEY_NOTCONFIRM;
					}else{
						batchStatuName=GXBOCBLConstant.REQMONEY_SUCC;
					}
					
				}
				if("A".equals(p.getBl_voucher_Status())){
					batchStatuName = GXBOCBLConstant.VOUCHER_ABNORMAL;
				}
				byteOut.write(TransUtil.getRegionBytes("114", "单据状态说明", batchStatuName,60));
				String noType = "1"; //1：标准转账、2现金；3现金（限额）；4转账（限额）；5转账（收款人为空）
				if(p.getSet_mode_name().contains("现金") &&  p.getPay_mgr_name().contains("限额")){
					noType = "3";
				}else if(!p.getSet_mode_name().contains("现金") &&  p.getPay_mgr_name().contains("限额")){
					noType = "4";
				}else if(!p.getSet_mode_name().contains("现金") && p.getPayee_account_no()==null){
					noType = "5";
				}else if(p.getSet_mode_name().contains("现金")){
					noType = "2";
				}
				byteOut.write(TransUtil.getRegionBytes("115", "指令类别", noType,1));
			}
			
		}
		
		
		return byteOut.toByteArray();
	}
	/**
	 * 支付凭证确认回执（1002）
	 * @return
	 * @throws IOException
	 */
	private byte[] vouAffirmReturn() throws IOException{
		
		ByteArrayOutputStream byteOut = new ByteArrayOutputStream();
		if(this.getObjs().length>1){
			 if(((List<RealPayVoucher>)this.getObjs()[0]).size()==1){
		        	for(RealPayVoucher p : ((List<RealPayVoucher>)this.getObjs()[0])){
		    			byteOut.write(TransUtil.getRegionBytes("101", "支付令号",p.getVouNo(), 42));
		    			if(p.getBlReqPayOperation()==GXBOCBLConstant.BLReqOperation_RETURN){
		    				byteOut.write(TransUtil.getRegionBytes("102", "状态", p.getBusiness_type()==PayConstant.HASBACK_CONFIRMED?GXBOCBLConstant.BLRES_RESULT_PAY_SUCC:GXBOCBLConstant.BLRES_RESULT_PAY_FAIL,1));
		        			byteOut.write(TransUtil.getRegionBytes("103", "失败原因",p.getTrans_res_msg(), 60));
		    			}else if(p.getBlReqPayOperation()==GXBOCBLConstant.BLReqOperation_PAY){
		    				byteOut.write(TransUtil.getRegionBytes("102", "状态", p.getBusiness_type()==PayConstant.Has_CONFIRMED?GXBOCBLConstant.BLRES_RESULT_PAY_SUCC:GXBOCBLConstant.BLRES_RESULT_PAY_FAIL,1));
		        			byteOut.write(TransUtil.getRegionBytes("103", "失败原因",p.getTrans_res_msg(), 60));
		    			}else if(p.getBlReqPayOperation()==GXBOCBLConstant.BLReqOperation_NOT_DISPOSE){
		    				byteOut.write(TransUtil.getRegionBytes("102", "状态", GXBOCBLConstant.BLRES_RESULT_RECEIVE_SUCC,1));
		        			byteOut.write(TransUtil.getRegionBytes("103", "失败原因",p.getTrans_res_msg(), 60));
		    			}
		    			byteOut.write(TransUtil.getRegionBytes("020", "核心记帐流水号",p.getBankTransId(), 20));
		    			
		    		}
		        }else if(((List<RealPayVoucher>)this.getObjs()[0]).size()>1){
		        	for(RealPayVoucher p : ((List<RealPayVoucher>)this.getObjs()[0])){
		         		byteOut.write(TransUtil.getRegionBytes("101", "支付令号",p.getVouNo(), 42));
		        		byteOut.write(TransUtil.getRegionBytes("102", "状态", GXBOCBLConstant.BLRES_RESULT_RECEIVE_SUCC,1));
		       			byteOut.write(TransUtil.getRegionBytes("103", "失败原因",p.getTrans_res_msg(), 60));
		       			byteOut.write(TransUtil.getRegionBytes("020", "核心记帐流水号","", 20));
		    		}
		        }
		}else{
			 if(((List<PayVoucher>)this.getObjs()[0]).size()==1){
		        	for(PayVoucher p : ((List<PayVoucher>)this.getObjs()[0])){
		    			byteOut.write(TransUtil.getRegionBytes("101", "支付令号",p.getVouNo(), 42));
		    			if(p.getBlReqPayOperation()==GXBOCBLConstant.BLReqOperation_RETURN){
		    				byteOut.write(TransUtil.getRegionBytes("102", "状态", p.getBusiness_type()==PayConstant.HASBACK_CONFIRMED?GXBOCBLConstant.BLRES_RESULT_PAY_SUCC:GXBOCBLConstant.BLRES_RESULT_PAY_FAIL,1));
		        			byteOut.write(TransUtil.getRegionBytes("103", "失败原因",p.getTrans_res_msg(), 60));
		    			}else if(p.getBlReqPayOperation()==GXBOCBLConstant.BLReqOperation_PAY){
		    				byteOut.write(TransUtil.getRegionBytes("102", "状态", p.getBusiness_type()==PayConstant.Has_CONFIRMED?GXBOCBLConstant.BLRES_RESULT_PAY_SUCC:GXBOCBLConstant.BLRES_RESULT_PAY_FAIL,1));
		        			byteOut.write(TransUtil.getRegionBytes("103", "失败原因",p.getTrans_res_msg(), 60));
		    			}else if(p.getBlReqPayOperation()==GXBOCBLConstant.BLReqOperation_NOT_DISPOSE){
		    				byteOut.write(TransUtil.getRegionBytes("102", "状态", GXBOCBLConstant.BLRES_RESULT_RECEIVE_SUCC,1));
		        			byteOut.write(TransUtil.getRegionBytes("103", "失败原因",p.getTrans_res_msg(), 60));
		    			}
		    			byteOut.write(TransUtil.getRegionBytes("020", "核心记帐流水号",p.getBankTransId(), 20));
		    			
		    		}
		        }else if(((List<PayVoucher>)this.getObjs()[0]).size()>1){
		        	for(PayVoucher p : ((List<PayVoucher>)this.getObjs()[0])){
		         		byteOut.write(TransUtil.getRegionBytes("101", "支付令号",p.getVouNo(), 42));
		        		byteOut.write(TransUtil.getRegionBytes("102", "状态", GXBOCBLConstant.BLRES_RESULT_RECEIVE_SUCC,1));
		       			byteOut.write(TransUtil.getRegionBytes("103", "失败原因",p.getTrans_res_msg(), 60));
		       			byteOut.write(TransUtil.getRegionBytes("020", "核心记帐流水号","", 20));
		    		}
		        }
		}
       
        
		return byteOut.toByteArray();
		
	}
	/**
	 * 退款通知书录入请求回执(1005)
	 * @return
	 * @throws IOException
	 */
	private byte[] refundAffirmReturn() throws IOException{
		
		ByteArrayOutputStream byteOut = new ByteArrayOutputStream();
		GXBOCBLMsgReqBody reqBody = (GXBOCBLMsgReqBody) this.getObjs()[0];
		
		byteOut.write(TransUtil.getRegionBytes("101", "支付凭证单号",reqBody.getObjs()[1].toString(), 42));
		byteOut.write(TransUtil.getRegionBytes("102", "支付明细主键",reqBody.getObjs()[2].toString(),32));
		byteOut.write(TransUtil.getRegionBytes("103", "状态","0", 1));
		byteOut.write(TransUtil.getRegionBytes("102", "失败原因", "",30));
    	
		
		return byteOut.toByteArray();
		
	}
	
	/**
	 * 历史凭证查询回执报文体（1009）
	 * @return
	 * @throws IOException
	 */
	private byte[] historyVouQuery() throws IOException{
		ByteArrayOutputStream byteOut = new ByteArrayOutputStream();
		if(GXBOCBLConstant.BL_REALPAY_FLAG.equals(this.getObjs()[1].toString())){
			for(RealPayVoucher p : ((List<RealPayVoucher>)this.getObjs()[0])){
	    		byteOut.write(TransUtil.getRegionBytes("101", "支付令号",p.getVouNo(), 42));
	    		byteOut.write(TransUtil.getRegionBytes("102", "支付凭证金额",amountFormat.format(p.getPay_amount()),18));
	    		byteOut.write(TransUtil.getRegionBytes("103", "凭证日期",p.getVou_date(), 60));
	    		byteOut.write(TransUtil.getRegionBytes("104", "单位名称",p.getAgency_name(), 60));
	    		byteOut.write(TransUtil.getRegionBytes("105", "付款账号",p.getPay_account_no(), 60));
	    		byteOut.write(TransUtil.getRegionBytes("106", "付款人全称",p.getPay_account_name(), 60));
	    		byteOut.write(getRegionBytes4GXBOC("107", "摘要",p.getPaySummaryName(), 200));
	    		byteOut.write(TransUtil.getRegionBytes("108", "收款人银行",p.getPayee_account_name(), 60));
	    		byteOut.write(TransUtil.getRegionBytes("109", "收款人账号",p.getPayee_account_no(), 60));
	    		byteOut.write(TransUtil.getRegionBytes("110", "收款人全称",p.getPayee_account_bank(), 100));
	    		byteOut.write(TransUtil.getRegionBytes("111", "收款人联行号",p.getPayee_account_bank_no(), 60));
	    	}
		}else{
			for(PayVoucher p : ((List<PayVoucher>)this.getObjs()[0])){
	    		byteOut.write(TransUtil.getRegionBytes("101", "支付令号",p.getVouNo(), 42));
	    		byteOut.write(TransUtil.getRegionBytes("102", "支付凭证金额",amountFormat.format(p.getPay_amount()),18));
	    		byteOut.write(TransUtil.getRegionBytes("103", "凭证日期",p.getVou_date(), 60));
	    		byteOut.write(TransUtil.getRegionBytes("104", "单位名称",p.getAgency_name(), 60));
	    		byteOut.write(TransUtil.getRegionBytes("105", "付款账号",p.getPay_account_no(), 60));
	    		byteOut.write(TransUtil.getRegionBytes("106", "付款人全称",p.getPay_account_name(), 60));
	    		byteOut.write(getRegionBytes4GXBOC("107", "摘要",p.getPaySummaryName(), 200));
	    		byteOut.write(TransUtil.getRegionBytes("108", "收款人银行",p.getPayee_account_name(), 60));
	    		byteOut.write(TransUtil.getRegionBytes("109", "收款人账号",p.getPayee_account_no(), 60));
	    		byteOut.write(TransUtil.getRegionBytes("110", "收款人全称",p.getPayee_account_bank(), 100));
	    		byteOut.write(TransUtil.getRegionBytes("111", "收款人联行号",p.getPayee_account_bank_no(), 60));
	    	}
		}
        
		return byteOut.toByteArray();

		
	}
	/**
	 * 按日期查询凭证回执（1003）
	 * @return
	 * @throws IOException
	 */
	private byte[] voucherQuery() throws IOException{
		
		ByteArrayOutputStream byteOut = new ByteArrayOutputStream();
		if(this.getObjs()[2].toString().equals(GXBOCBLConstant.BL_REALPAY_FLAG)){
			for(RealPayVoucher p : ((List<RealPayVoucher>)this.getObjs()[0])){
				  String vouStatus = this.getObjs()[1].toString();
//				  101	42	凭证号
//				  102	60	付款单位名称
//				  103	60	收款单位名称
//				  104	17	金额
//				  105	2	凭证类型
//				  106	1	指令类别
//				  107	2	凭证状态
				  byteOut.write(TransUtil.getRegionBytes("101", "账号",p.getRealpay_voucher_code(), 42));
				  byteOut.write(TransUtil.getRegionBytes("101", "付款账户",p.getPay_account_no(), 42));
				  byteOut.write(TransUtil.getRegionBytes("102", "付款单位名称",p.getPay_account_name(), 60));
				  byteOut.write(TransUtil.getRegionBytes("103", "收款单位名称",p.getPayee_account_name(), 100));
				  byteOut.write(TransUtil.getRegionBytes("104", "金额",amountFormat.format(p.getPay_amount()), 17));
				  byteOut.write(TransUtil.getRegionBytes("105", "凭证类型","", 2)); 
				  byteOut.write(TransUtil.getRegionBytes("106", "指令类别","1", 1));
				  if(vouStatus.equals("0")){
					  	if("A".equals(p.getBl_voucher_Status())){
						  vouStatus = GXBOCBLConstant.VOUCHER_ABNORMAL;
						}else if(p.getBusiness_type() == PayConstant.Has_CONFIRMED){
							
							if(p.getRefund_amount().compareTo(new BigDecimal(0))==0){
								vouStatus = GXBOCBLConstant.PAYMONEY_SUCC;
							}else{
								vouStatus = GXBOCBLConstant.VOUCHER_REFUND_SUCC;
							}
							
							
						}else if(p.getSend_flag() == -1){
							vouStatus = GXBOCBLConstant.SEND_RETURN_VOUOCHER_FAIL;
						}else if(p.getBusiness_type() == PayConstant.HASBACK_CONFIRMED){
							vouStatus = GXBOCBLConstant.VOUCHER_BACK_SUCC;
						}else if(p.getBusiness_type() == GXBOCBLConstant.UNKNOWN_CONFIRMED ){
							vouStatus=GXBOCBLConstant.PAYMONEY_NOTCONFIRM;
						}else if(p.getBusiness_type() == PayConstant.Fail_CONFIRMED){
							vouStatus=GXBOCBLConstant.REQMONEY_SUCC;
						}else {
							vouStatus = GXBOCBLConstant.NOT_REQMONEY;
						}
				  }
				  byteOut.write(TransUtil.getRegionBytes("107", "凭证状态",vouStatus, 2));
				  byteOut.write(TransUtil.getRegionBytes("108", "收款人账号",p.payee_account_no, 32));
				 

			  }
		}else{
			for(PayVoucher p : ((List<PayVoucher>)this.getObjs()[0])){
				  String vouStatus = this.getObjs()[1].toString();
//				  101	42	凭证号
//				  102	60	付款单位名称
//				  103	60	收款单位名称
//				  104	17	金额
//				  105	2	凭证类型
//				  106	1	指令类别
//				  107	2	凭证状态
				  byteOut.write(TransUtil.getRegionBytes("101", "账号",p.getPay_voucher_code(), 42));
				  byteOut.write(TransUtil.getRegionBytes("101", "付款账户",p.getPay_account_no(), 42));
				  byteOut.write(TransUtil.getRegionBytes("102", "付款单位名称",p.getPay_account_name(), 60));
				  byteOut.write(TransUtil.getRegionBytes("103", "收款单位名称",p.getPayee_account_name(), 100));
				  byteOut.write(TransUtil.getRegionBytes("104", "金额",amountFormat.format(p.getPay_amount()), 17));
				  byteOut.write(TransUtil.getRegionBytes("105", "凭证类型","", 2));
				  String noType = "1"; //1：标准转账、2现金；3现金（限额）；4转账（限额）；5转账（收款人为空）
				  if(p.getSet_mode_name().contains("现金") &&  p.getPay_mgr_name().contains("限额")){
					noType = "3";
				  }else if(!p.getSet_mode_name().contains("现金") &&  p.getPay_mgr_name().contains("限额")){
					noType = "4";
				  }else if(!p.getSet_mode_name().contains("现金") && p.getPayee_account_no()==null){
					noType = "5";
				  }else if(p.getSet_mode_name().contains("现金")){
					noType = "2";
				  }
				  byteOut.write(TransUtil.getRegionBytes("106", "指令类别",noType, 1));
				  if(vouStatus.equals("0")){

					  if(p.getBusiness_type()==2){
						  vouStatus = GXBOCBLConstant.VOUCHER_BACK_SUCC;
					  }else if(p.getBusiness_type()==1){
						 
						  List<Billable> detailList = p.getDetails();
						  
						  List<PayRequest> reqList = new ArrayList<PayRequest>();
							
						  for (Billable bill : detailList) {
								reqList.add((PayRequest) bill);
						  }
						  vouStatus = GXBOCBLConstant.PAYMONEY_SUCC;
						  for(PayRequest detail:reqList){
							  if(!detail.getPay_refund_amount().toString().equals("0")){
								  vouStatus = GXBOCBLConstant.VOUCHER_REFUND_SUCC;
								  break;
							  }
						  } 
					  }else if(p.getVoucherFlag() == GXBOCBLConstant.VOUCHERFLAG_VALUE_BACK_FAIL){
						  vouStatus = GXBOCBLConstant.VOUCHER_BACK_FAIL;
					  }else if(p.getSend_flag() == -1){
						  vouStatus = GXBOCBLConstant.SEND_RETURN_VOUOCHER_FAIL;
					  }else if(p.getBatchreq_status()==0){
							vouStatus = GXBOCBLConstant.NOT_REQMONEY;
					  }else if(p.getBatchreq_status()==-1){
							vouStatus = GXBOCBLConstant.REQMONEY_FAIL;
					  }else if(p.getBatchreq_status()==1 && p.getBusiness_type()==0){
						  if(p.getTrans_succ_flag() == TradeConstant.TRANS_UNKOWN){
							  vouStatus = GXBOCBLConstant.PAYMONEY_NOTCONFIRM;
						  }else{
							  vouStatus = GXBOCBLConstant.REQMONEY_SUCC;
						  }
						 
					  }
					  
				  }
				  byteOut.write(TransUtil.getRegionBytes("107", "凭证状态",vouStatus, 2));
				  byteOut.write(TransUtil.getRegionBytes("108", "收款人账号",p.payee_account_no, 32));
				  

			  }
		}
	
		return byteOut.toByteArray();
	}
	/**
	 * @Description: 拼装响应报文体(响应报文）待确认支付凭证列表回执（1000）
	 * @author: 柯伟
	 * @date: 2014-5-28 上午10:34:32
	 */
	@SuppressWarnings({ "unchecked"})
	private byte[] networkUserBytes() throws IOException {
		ByteArrayOutputStream byteOut = new ByteArrayOutputStream();
		for(BankAccount m : ((List<BankAccount>)this.getObjs()[0])){
			byteOut.write(TransUtil.getRegionBytes("101", "账号",m.getAccount_no(), 42));
			byteOut.write(TransUtil.getRegionBytes("102", "账号名称", m.getAccount_name(),60));
		}
		return byteOut.toByteArray();
	}
	private byte[] isClearPayVoucherQuery() throws IOException {
		ByteArrayOutputStream byteOut = new ByteArrayOutputStream();
		if(this.getObjs()[1].toString().equals(GXBOCBLConstant.BL_REALPAY_FLAG)){
	        for(RealPayVoucher p : ((List<RealPayVoucher>)this.getObjs()[0])){
				List<Billable> detailList = p.getDetails();
				List<RealPayRequest> reqList = new ArrayList<RealPayRequest>();
				for (Billable bill : detailList) {
					reqList.add((RealPayRequest) bill);
				}
				if(reqList.size()!=0){
					for(RealPayRequest payRequest : reqList){
						byteOut.write(TransUtil.getRegionBytes("102", "支付凭证明细主键",payRequest.getRealpay_request_id()+"", 32));
			    		byteOut.write(TransUtil.getRegionBytes("103", "收款人账号",payRequest.getPayee_account_no(),32));
			    		byteOut.write(TransUtil.getRegionBytes("104", "收款人名称",payRequest.getPayee_account_name(), 100));
			    		byteOut.write(TransUtil.getRegionBytes("105", "收款人银行",payRequest.getPayee_account_bank(), 60));
			    		byteOut.write(TransUtil.getRegionBytes("106", "付款人账号",p.getPay_account_no(), 32));
			    		byteOut.write(TransUtil.getRegionBytes("107", "付款人名称",p.getPay_account_name(), 60));
			    		byteOut.write(TransUtil.getRegionBytes("108", "付款人银行",p.getPay_account_bank(), 60));
			    		byteOut.write(TransUtil.getRegionBytes("109", "支付金额",amountFormat.format(payRequest.getPay_amount()), 17));
			    		byteOut.write(TransUtil.getRegionBytes("110", "支付日期",transUtilForGXBOCTrans.formatDate(payRequest.getPay_date(), "yyyyMMdd"), 8));
			    		byteOut.write(getRegionBytes4GXBOC("111", "摘要名称",p.getPaySummaryName(), 200));
			    		
			    		byteOut.write(TransUtil.getRegionBytes("121", "预算类型名称",payRequest.getBgt_type_name(), 60));
			    		byteOut.write(TransUtil.getRegionBytes("122", "收支管理名称",payRequest.getPro_cat_name(), 60));
			    		byteOut.write(TransUtil.getRegionBytes("123", "预算单位编码",payRequest.getAgency_code(), 42));
			    		byteOut.write(TransUtil.getRegionBytes("124", "预算单位名称",payRequest.getAgency_name(), 60));
			    		byteOut.write(TransUtil.getRegionBytes("125", "功能分类编码",payRequest.getExp_func_code(), 42));
			    		byteOut.write(TransUtil.getRegionBytes("126", "功能分类名称",payRequest.getExp_func_name(), 60));
			    		byteOut.write(TransUtil.getRegionBytes("127", "经济分类名称",payRequest.getExp_eco_name(), 60));
			    		byteOut.write(TransUtil.getRegionBytes("128", "项目名称",payRequest.getDep_pro_name(), 200));	
			    		byteOut.write(TransUtil.getRegionBytes("129", "末笔成功退款时间",getBlRefundTime(p.getBlRefundTime()), 60));
			    		byteOut.write(TransUtil.getRegionBytes("130", "已退金额","", 17));	
					}
				}else {
					byteOut.write(TransUtil.getRegionBytes("102", "支付凭证明细主键","", 32));
		    		byteOut.write(TransUtil.getRegionBytes("103", "收款人账号",p.getPayee_account_no(),32));
		    		byteOut.write(TransUtil.getRegionBytes("104", "收款人名称",p.getPayee_account_name(), 100));
		    		byteOut.write(TransUtil.getRegionBytes("105", "收款人银行",p.getPayee_account_bank(), 60));
		    		byteOut.write(TransUtil.getRegionBytes("106", "付款人账号",p.getPay_account_no(), 32));
		    		byteOut.write(TransUtil.getRegionBytes("107", "付款人名称",p.getPay_account_name(), 60));
		    		byteOut.write(TransUtil.getRegionBytes("108", "付款人银行",p.getPay_account_bank(), 60));
		    		byteOut.write(TransUtil.getRegionBytes("109", "支付金额",amountFormat.format(p.getPay_amount()), 17));
		    		byteOut.write(TransUtil.getRegionBytes("110", "支付日期",transUtilForGXBOCTrans.formatDate(p.getPay_date(), "yyyyMMdd"), 8));
		    		byteOut.write(getRegionBytes4GXBOC("111", "摘要名称",p.getPaySummaryName(), 200));
		    		
		    		byteOut.write(TransUtil.getRegionBytes("121", "预算类型名称",p.getBgt_type_name(), 60));
		    		byteOut.write(TransUtil.getRegionBytes("122", "收支管理名称",p.getPro_cat_name(), 60));
		    		byteOut.write(TransUtil.getRegionBytes("123", "预算单位编码",p.getAgency_name(), 42));
		    		byteOut.write(TransUtil.getRegionBytes("124", "预算单位名称",p.getAgency_code(), 60));
		    		byteOut.write(TransUtil.getRegionBytes("125", "功能分类编码",p.getExp_func_code(), 42));
		    		byteOut.write(TransUtil.getRegionBytes("126", "功能分类名称",p.getExp_func_name(), 60));
		    		byteOut.write(TransUtil.getRegionBytes("127", "经济分类名称",p.getExp_eco_name(), 60));
		    		byteOut.write(TransUtil.getRegionBytes("128", "项目名称",p.getDep_pro_name(), 200));
		    		byteOut.write(TransUtil.getRegionBytes("128", "末笔成功退款时间",getBlRefundTime(p.getBlRefundTime()), 60));	
		    		byteOut.write(TransUtil.getRegionBytes("130", "已退金额","", 17));
				}
				
	    		
	    	}
		}else{
	        for(PayVoucher p : ((List<PayVoucher>)this.getObjs()[0])){
				List<Billable> detailList = p.getDetails();
				List<PayRequest> reqList = new ArrayList<PayRequest>();
				for (Billable bill : detailList) {
					reqList.add((PayRequest) bill);
				}
				if(reqList.size()!=0){
					for(PayRequest payRequest : reqList){
						byteOut.write(TransUtil.getRegionBytes("102", "支付凭证明细主键",payRequest.getPay_request_id()+"", 32));
			    		byteOut.write(TransUtil.getRegionBytes("103", "收款人账号",payRequest.getPayee_account_no(),32));
			    		byteOut.write(TransUtil.getRegionBytes("104", "收款人名称",payRequest.getPayee_account_name(), 100));
			    		byteOut.write(TransUtil.getRegionBytes("105", "收款人银行",payRequest.getPayee_account_bank(), 60));
			    		byteOut.write(TransUtil.getRegionBytes("106", "付款人账号",p.getPay_account_no(), 32));
			    		byteOut.write(TransUtil.getRegionBytes("107", "付款人名称",p.getPay_account_name(), 60));
			    		byteOut.write(TransUtil.getRegionBytes("108", "付款人银行",p.getPay_account_bank(), 60));
			    		byteOut.write(TransUtil.getRegionBytes("109", "支付金额",amountFormat.format(payRequest.getPay_amount()), 17));
			    		byteOut.write(TransUtil.getRegionBytes("110", "支付日期",transUtilForGXBOCTrans.formatDate(payRequest.getPay_date(), "yyyyMMdd"), 8));
			    		byteOut.write(getRegionBytes4GXBOC("111", "摘要名称",p.getPaySummaryName(), 200));
			    		
			    		byteOut.write(TransUtil.getRegionBytes("121", "预算类型名称",payRequest.getBgt_type_name(), 60));
			    		byteOut.write(TransUtil.getRegionBytes("122", "收支管理名称",payRequest.getPro_cat_name(), 60));
			    		byteOut.write(TransUtil.getRegionBytes("123", "预算单位编码",payRequest.getAgency_code(), 42));
			    		byteOut.write(TransUtil.getRegionBytes("124", "预算单位名称",payRequest.getAgency_name(), 60));
			    		byteOut.write(TransUtil.getRegionBytes("125", "功能分类编码",payRequest.getExp_func_code(), 42));
			    		byteOut.write(TransUtil.getRegionBytes("126", "功能分类名称",payRequest.getExp_func_name(), 60));
			    		byteOut.write(TransUtil.getRegionBytes("127", "经济分类名称",payRequest.getExp_eco_name(), 60));
			    		byteOut.write(TransUtil.getRegionBytes("128", "项目名称",payRequest.getDep_pro_name(), 200));	
			    		byteOut.write(TransUtil.getRegionBytes("129", "末笔成功退款时间",getBlRefundTime(payRequest.getBlRefundTime()), 60));
			    		byteOut.write(TransUtil.getRegionBytes("130", "已退金额",amountFormat.format(payRequest.getPay_refund_amount()), 17));	
					}
				}else {
					byteOut.write(TransUtil.getRegionBytes("102", "支付凭证明细主键","", 32));
		    		byteOut.write(TransUtil.getRegionBytes("103", "收款人账号",p.getPayee_account_no(),32));
		    		byteOut.write(TransUtil.getRegionBytes("104", "收款人名称",p.getPayee_account_name(), 100));
		    		byteOut.write(TransUtil.getRegionBytes("105", "收款人银行",p.getPayee_account_bank(), 60));
		    		byteOut.write(TransUtil.getRegionBytes("106", "付款人账号",p.getPay_account_no(), 32));
		    		byteOut.write(TransUtil.getRegionBytes("107", "付款人名称",p.getPay_account_name(), 60));
		    		byteOut.write(TransUtil.getRegionBytes("108", "付款人银行",p.getPay_account_bank(), 60));
		    		byteOut.write(TransUtil.getRegionBytes("109", "支付金额",amountFormat.format(p.getPay_amount()), 17));
		    		byteOut.write(TransUtil.getRegionBytes("110", "支付日期",transUtilForGXBOCTrans.formatDate(p.getPay_date(), "yyyyMMdd"), 8));
		    		byteOut.write(getRegionBytes4GXBOC("111", "摘要名称",p.getPaySummaryName(), 200));
		    		
		    		byteOut.write(TransUtil.getRegionBytes("121", "预算类型名称",p.getBgt_type_name(), 60));
		    		byteOut.write(TransUtil.getRegionBytes("122", "收支管理名称",p.getPro_cat_name(), 60));
		    		byteOut.write(TransUtil.getRegionBytes("123", "预算单位编码",p.getAgency_code(), 42));
		    		byteOut.write(TransUtil.getRegionBytes("124", "预算单位名称",p.getAgency_name(), 60));
		    		byteOut.write(TransUtil.getRegionBytes("125", "功能分类编码",p.getExp_func_code(), 42));
		    		byteOut.write(TransUtil.getRegionBytes("126", "功能分类名称",p.getExp_func_name(), 60));
		    		byteOut.write(TransUtil.getRegionBytes("127", "经济分类名称",p.getExp_eco_name(), 60));
		    		byteOut.write(TransUtil.getRegionBytes("128", "项目名称",p.getDep_pro_name(), 200));
		    		byteOut.write(TransUtil.getRegionBytes("128", "末笔成功退款时间",getBlRefundTime(p.getBlRefundTime()), 60));	
		    		byteOut.write(TransUtil.getRegionBytes("130", "已退金额","", 17));
				}
	    		
	    	}
		}

		return byteOut.toByteArray();
	}
	public String getBlRefundTime(Timestamp refundTime){
		if(refundTime ==null){
			return "";
		}else {
			String hours = refundTime.getHours()+"";
			if(hours.length()==1){
				hours = "0"+hours;
			}
			String time =  transUtilForGXBOCTrans.formatDate(refundTime, "yyyyMMddhhmmss");
		    time  = time.substring(0, 8)+hours+time.substring(10, 14);
			return time;
		}
	}
	/**
	 * 待清算退款凭证查询
	 * 报文体组成
	101	42	退款凭证号	
	102	18	支付凭证金额	无小数位时，金额不带小数
	例如：100或2501.36
	103	8	凭证日期	例如：20140402
	104	60	单位名称	
	105	32	付款账号	
	106	60	付款人全称	
	107	60	摘要	
	108	60	收款人银行	
	109	32	收款人账号	
	110	60	收款人全称	
	111	14	收款人联行号	
	112	42	原支付令号	
	 * @return
	 * @throws IOException
	 */
	private byte[] waitClearRefundVoucherQuery() throws IOException{
		ByteArrayOutputStream byteOut = new ByteArrayOutputStream();
		if(this.getObjs()[2].toString().equals(GXBOCBLConstant.BL_REALPAY_FLAG)){
			for(RealPayVoucher p : ((List<RealPayVoucher>)this.getObjs()[0])){
	        	
	        	byteOut.write(TransUtil.getRegionBytes("101", "退款凭证号",p.getRealpay_voucher_code(), 42));
	        	byteOut.write(TransUtil.getRegionBytes("102", "支付凭证金额",amountFormat.format(p.getPay_amount()), 18));
	        	byteOut.write(TransUtil.getRegionBytes("103", "凭证日期",p.getVou_date(), 8));
	        	byteOut.write(TransUtil.getRegionBytes("104", "单位名称",p.getAgency_name(), 60));
	        	byteOut.write(TransUtil.getRegionBytes("105", "付款账号",p.getPay_account_no(), 32));
	        	byteOut.write(TransUtil.getRegionBytes("106", "付款人全称",p.getPay_account_name(), 60));
	        	byteOut.write(getRegionBytes4GXBOC("107", "摘要",p.getPaySummaryName(), 200));
	        	byteOut.write(TransUtil.getRegionBytes("108", "收款人银行",p.getPayee_account_bank(), 60));
	        	byteOut.write(TransUtil.getRegionBytes("109", "收款人账号",p.getPayee_account_no(), 32));
	        	byteOut.write(TransUtil.getRegionBytes("110", "收款人全称",p.getPayee_account_name(), 100));
	        	byteOut.write(TransUtil.getRegionBytes("111", "收款人联行号",p.getPayee_account_bank_no(), 14));
	        	byteOut.write(TransUtil.getRegionBytes("112", "原支付令号",this.getObjs()[1].toString(), 42));
	        	
	    		
	    	}
		}else{
			for(PayVoucher p : ((List<PayVoucher>)this.getObjs()[0])){
	        	
	        	byteOut.write(TransUtil.getRegionBytes("101", "退款凭证号",p.getPay_voucher_code(), 42));
	        	byteOut.write(TransUtil.getRegionBytes("102", "支付凭证金额",amountFormat.format(p.getPay_amount()), 18));
	        	byteOut.write(TransUtil.getRegionBytes("103", "凭证日期",p.getVou_date(), 8));
	        	byteOut.write(TransUtil.getRegionBytes("104", "单位名称",p.getAgency_name(), 60));
	        	byteOut.write(TransUtil.getRegionBytes("105", "付款账号",p.getPay_account_no(), 32));
	        	byteOut.write(TransUtil.getRegionBytes("106", "付款人全称",p.getPay_account_name(), 60));
	        	byteOut.write(getRegionBytes4GXBOC("107", "摘要",p.getPaySummaryName(), 200));
	        	byteOut.write(TransUtil.getRegionBytes("108", "收款人银行",p.getPayee_account_bank(), 60));
	        	byteOut.write(TransUtil.getRegionBytes("109", "收款人账号",p.getPayee_account_no(), 32));
	        	byteOut.write(TransUtil.getRegionBytes("110", "收款人全称",p.getPayee_account_name(), 100));
	        	byteOut.write(TransUtil.getRegionBytes("111", "收款人联行号",p.getPayee_account_bank_no(), 14));
	        	byteOut.write(TransUtil.getRegionBytes("112", "原支付令号",this.getObjs()[1].toString(), 42));
	        	
	    		
	    	}
		}
        
		return byteOut.toByteArray();
	}
	/**
	 * 撤销退款凭证回执

        	101	42	支付令号	
        	102	1	状态	0、交易成功1、交易失败
        	103	60	失败原因	
        	
	 * @return
	 * @throws IOException
	 */
	private byte[] invalidateRefundVoucher() throws IOException{
		
		ByteArrayOutputStream byteOut = new ByteArrayOutputStream();
		
		if(this.getObjs()[1].toString().equals(GXBOCBLConstant.BL_REALPAY_FLAG)){
			RealPayVoucher tempVou = (RealPayVoucher) this.getObjs()[0];

	        byteOut.write(TransUtil.getRegionBytes("101", "支付令号",tempVou.getRealpay_voucher_code(), 42));
	        byteOut.write(TransUtil.getRegionBytes("102", "状态","0", 18));
	        byteOut.write(TransUtil.getRegionBytes("103", "失败原因	","", 8));
		}else{
			PayVoucher tempVou = (PayVoucher) this.getObjs()[0];

	        byteOut.write(TransUtil.getRegionBytes("101", "支付令号",tempVou.getPay_voucher_code(), 42));
	        byteOut.write(TransUtil.getRegionBytes("102", "状态","0", 18));
	        byteOut.write(TransUtil.getRegionBytes("103", "失败原因	","", 8));
		}
		
    

		return byteOut.toByteArray();
	}
	
	private byte[] accreditPayAmtQuery() throws IOException {
		ByteArrayOutputStream byteOut = new ByteArrayOutputStream();
		for(PayVoucher p: ((List<PayVoucher>)this.getObjs()[0])){
			byteOut.write(TransUtil.getRegionBytes("101", "预算单位编码",p.getAgency_code(), 42));
			byteOut.write(TransUtil.getRegionBytes("102", "预算单位名称",p.getAgency_name(), 60));
			byteOut.write(TransUtil.getRegionBytes("103", "功能分类科目编码",p.getExp_func_code(), 42));
			byteOut.write(TransUtil.getRegionBytes("104", "功能分类科目名称",p.getExp_func_name(), 60));
			byteOut.write(TransUtil.getRegionBytes("105", "资金性质编码",p.getFund_type_code(), 10));
			byteOut.write(TransUtil.getRegionBytes("106", "资金性质名称",p.getFund_type_name(), 60));
			byteOut.write(TransUtil.getRegionBytes("107", "预算项目编码",p.getDep_pro_code(), 42));
			byteOut.write(TransUtil.getRegionBytes("108", "预算项目名称",p.getDep_pro_name(), 60));
			byteOut.write(TransUtil.getRegionBytes("109", "当前剩余额度",amountFormat.format(p.getPay_amount()), 18));
		}
		return byteOut.toByteArray();
	}
	/**
	 * 获取某一域的字节数组
	 * 
	 * @param regionNo
	 *            域号
	 * @param value
	 *            域值
	 * @param regionLen
	 *            域限定长度
	 * @return 域字节数组
	 * @throws IOException
	 */
	public static byte[] getRegionBytes4GXBOC(String regionNo, String regionDes,
			String value, int regionLen) throws IOException {
		if (value == null) {
			value = "";
		}
		// 保存字节流
		ByteArrayOutputStream regionOut = new ByteArrayOutputStream();

		// 3位域号字节
		byte[] regionNoBytes = ChangeUtil.stringToBytes(regionNo, 3);
		regionOut.write(regionNoBytes);
		// 域值字节
		byte[] regionDataBytes = value.getBytes("GBK");
		// 域值长度
		int len = regionDataBytes.length;
		// 域值得长度大于限定的长度
		if (len > regionLen) {
			throw new RuntimeException(regionDes + "【" + regionNo + "】的域值:"
					+ value + ",长度：" + len + " 大于该域限定长度：" + regionLen);
		}
		byte[] regionLenBytes = getFixlenStrBytes4GXBOC(len + "", 3);
		regionOut.write(regionLenBytes);
		regionOut.write(regionDataBytes);
		return regionOut.toByteArray();
	}
	/**
	 * 将字符串前补0转换成指定长度的字节数组
	 * 
	 * @param s
	 * @param len
	 * @return
	 */
	public static byte[] getFixlenStrBytes4GXBOC(String str ,int len){
		if(str==null){
			str = "";
		}
		byte[] strByte = str.getBytes();
		if(strByte.length>len){
			throw new RuntimeException("字符串["+str+"]长度："+strByte.length+"大于要转换的字节数组长度："+len);
		}
		StringBuffer sb = new StringBuffer();
		for(int i=0;i<len-strByte.length;i++){
			sb.append('0');
		}
		sb.append(str);
		return sb.toString().getBytes();
	}
}
