package grp.pb.branch.trans.bs;

import grp.pt.idgen.IdGen;
import grp.pt.pb.common.model.BankNoDTO;
import grp.pt.pb.exception.PbException;
import grp.pt.pb.payment.IVoucher;
import grp.pt.pb.payment.PayVoucher;
import grp.pt.pb.trans.bs.BankTransServiceAdapter;
import grp.pt.pb.trans.ex.PbTransBusinessException;
import grp.pt.pb.trans.model.ABC134MsgResBody;
import grp.pt.pb.trans.model.AccountTransDetailDTO;
import grp.pt.pb.trans.model.ABC134MsgResBody;
import grp.pt.pb.trans.model.MsgResBody;
import grp.pt.pb.trans.model.TransLogDTO;
import grp.pt.pb.trans.model.TransResManager;
import grp.pt.pb.trans.model.TransReturnDTO;
import grp.pt.pb.trans.model.MsgResBody.SerialNo;
import grp.pt.pb.trans.util.Context;
import grp.pt.pb.util.AftstcpUtil;
import grp.pt.pb.util.ChangeUtil;
import grp.pt.pb.util.ElementUtil;
import grp.pt.pb.util.PbParaConstant;
import grp.pt.pb.util.PbParameters;
import grp.pt.pb.util.PbUtil;
import grp.pt.pb.util.PropertiesHander;
import grp.pt.pb.util.TradeConstant;
import grp.pt.util.PlatformUtils;
import grp.pt.util.StringUtil;
import grp.pt.util.StringUtils;
import grp.pt.util.exception.CommonException;
import grp.pt.util.model.Session;
import grp.pt.workflow.bs.WorkflowRunService;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.zip.GZIPInputStream;

import org.apache.log4j.Logger;

import com.river.common.UploadFileUtil;

public class ABC134ServiceImpl extends BankTransServiceAdapter {
	
//	private static Logger logger = Logger.getLogger(HuNanABCServiceImpl.class);
	private static Logger logger = Logger.getLogger(WorkflowRunService.class.getName());
	
	
	/***
	 * 转账
	 */
	public TransReturnDTO trans(Session sc, Context context, IVoucher t)
			throws Exception {
		
		logger.info("转账交易开始！***************");
		// 基层预算单位
		String agencyName = (String) PlatformUtils.getProperty(t, "agency_name");
		// 用途
		// 送往银行核心的用途名称为：凭证号 基层预算单位 用途 最大70字节
		// 如果是直接支付需要是凭证号+预算单位+摘要，这样收款人才知道付款单位，中间空格隔开，末尾如： 益阳市工商局朝阳分局付，表示  XX预算为付款
		//String paySummaryName = t.getVouNo() + " "+agencyName + "付 "+t.getPaySummaryName() ;
//		byte[] summaryBytes = paySummaryName.getBytes();
//		String ss = summaryBytes.length > 70 ? new String(summaryBytes, 0, 70): new String(summaryBytes);
//		String paySummaryName = PbUtil.getAcurateLenString(t.getVouNo() + " "+agencyName + "付 "+t.getPaySummaryName(), 60) ;
		//purpose 改为paySummaryName+voucherNo+agencyName 		xcg 2015-9-23 10:31:34
		String paySummaryName = PbUtil.getAcurateLenString(t.getPaySummaryName() +" "+ t.getVouNo() + " "+agencyName + "付 ", 60) ;
		PlatformUtils.setProperty(t, "pay_summary_name", paySummaryName);
//		t.setTellerCode( sc.getTellerCode());
		String cityCode = UploadFileUtil.getFromPro("trans", "abc.city.code");
		//柜员号和终端号送9位，不足前面补省市代码和000,电子渠道可以不用送
		if(!StringUtil.isEmpty(sc.getTellerCode())&&sc.getTellerCode().length()==4){//最好规定柜员输入的终端号和维护的柜员号为4位，免得麻烦
			t.setTellerCode(cityCode+"000"+sc.getTellerCode());
		}else{
			t.setTellerCode(sc.getTellerCode());
		}
		if(!StringUtil.isEmpty(sc.getUserCode())&&sc.getUserCode().length()==4){
			t.setUserCode(cityCode+"000"+sc.getUserCode());
		}else{
			t.setUserCode(sc.getUserCode());
		}
		
		//TODO 判断是电子渠道还是柜面渠道  transChannel
		//TODO 判断农行标识  fapAbc
		//TODO 判断收款人账户类型   recvAcctType
		//交易渠道  0：电子渠道    1：柜面渠道    2：ABIS91
			
		// 结算方式
		String setModeCode = PlatformUtils.getProperty(t, "set_mode_code").toString();
		// 现转标志 1-现金 2-网点操作账户 3-ABIS91
		// int cashTransFlag = setModeCode.equals("1")?1:2;
		// edit by daliang 现金判断从参数表中获得,写的不太好，接口中不应该出现服务代码,以后再想想吧
		// 获得现金编码
		// String cashCode =PbParameters.getStringParameter(PbParaConstant.CASH,
		// t.getAdmdivCode());
		String cashCode = ElementUtil.getEleValue(PbParaConstant.CASH, "现金",t.getAdmdivCode());
		// 默认电子渠道
		int transChannel = TradeConstant.EBANK_CHANNEL;
		// 获得转账金额
		BigDecimal payAmount = (BigDecimal) PlatformUtils.getProperty(t,"pay_amount");
	
		//如果是现金或者是退款数据则为柜面其余为电子渠道
		if( setModeCode.equals(cashCode) || payAmount.signum()<0 ){
			transChannel = TradeConstant.MANUAL_CHANNEL;
		}
		//广西农行转账走柜面渠道
//		if("GX".equals(PbParameters.getStringParameter("pb.province.ShortName"))){
//			transChannel = TradeConstant.MANUAL_CHANNEL;
//		}
		PayVoucher payvoucher=(PayVoucher)t;
		if(payvoucher.getTransChannel()>0)//转账支票走柜面渠道
		{
			transChannel=payvoucher.getTransChannel();
		}
		else
		{
			PlatformUtils.setProperty(t, "transChannel", transChannel);
		}	
	
		//它行的走91
		String bankNo = t.getPayeeAcctBankNo() ;
			
		//0同行 1其他行
		String strFapAbc = t.getChangeType() ;
		strFapAbc = "1".equals(strFapAbc)?"0":"1";
		PlatformUtils.setProperty(t, "fapAbc", strFapAbc);
		if("232".equals(PlatformUtils.getProperty(t, "whereObj"))){ //落地转账
			PlatformUtils.setProperty(t, "fapAbc", "1");
			PlatformUtils.setProperty(t, "payee_account_bank_no", null);
		}
		else if(  "0".equals(strFapAbc) && payAmount.signum() > 0){//如果是农行
			//设置账户类型
			
			setType(t);
		}
		//电子渠道：0   柜面渠道：1
		if (transChannel == TradeConstant.EBANK_CHANNEL) { // 电子渠道
			// 电子渠道，现转标志为2
			PlatformUtils.setProperty(t, "cashTransFlag", "2");

			// reqId 柜面渠道：1100+终端号 电子渠道：00000000
			PlatformUtils.setProperty(t, "transReqId", "00000000");
			PlatformUtils.setProperty(t, "runtimeFlag", 0);
			// 电子渠道柜员号和终端号为空
			PlatformUtils.setProperty(t, "userCode", "");
			PlatformUtils.setProperty(t, "tellerCode", "");
			// 结算方式 电子渠道：08-网银
			PlatformUtils.setProperty(t, "settleType", "08");
			PlatformUtils.setProperty(t, "voucherType", "00000");
			// 节点号 edit by daliang,参考报文中为00024
			PlatformUtils.setProperty(t, "nodeno", "XXXXX");
			// 支取方式
			PlatformUtils.setProperty(t, "drawType", "000");
			
			MsgResBody msgResBody = this.doBankInterface(sc, context, t, false,
					super.setLocalWhereObj("7836"),"FAP1.3.4");
			return new TransReturnDTO(msgResBody.getResStatus(),
					msgResBody.getResMsg(), t.getTransId(),msgResBody.getBankTransId());
		} else if (transChannel == TradeConstant.MANUAL_CHANNEL) { // 柜面渠道
			// 柜面渠道柜员号和终端号从session中获取
			//TODO:密码登陆时，无tellerCode，先写死一个
			if(StringUtils.isEmpty(sc.getTellerCode())){
//				sc.setTellerCode("1b73");
				sc.setTellerCode("06aa");
				
			}
			
			String tellerCode=sc.getTellerCode();
			tellerCode = tellerCode.substring(tellerCode.length()-4,tellerCode.length());
			PlatformUtils.setProperty(t, "transReqId","1100" + tellerCode);
			//reqid规则 共八位 
			//edit by daiguodong 2015/8/6 atii/reqid节点 总行测试环境正确的为11+2位省市代码+终端号后四位
			PlatformUtils.setProperty(t, "ebank_reqId", "11" + 
					UploadFileUtil.getFromPro("trans", "abc.city.code")+ tellerCode );
//			PlatformUtils.setProperty(t, "userCode", sc.getUserCode());
//			PlatformUtils.setProperty(t, "tellerCode", sc.getTellerCode());
			String majorUserCode=PlatformUtils.getProperty(t, "majorUserCode").toString();
			if(!StringUtil.isEmpty(majorUserCode)&&majorUserCode.length()==4){//FAP1,3,4必须是9位不然会报找不到柜员号错				
				PlatformUtils.setProperty(t, "majorUserCode", cityCode+"000"+majorUserCode);
			}
			
			PlatformUtils.setProperty(t, "runtimeFlag", 1);
			// 结算方式 除了07和09 其他均为凭证上结算方式加"0"，暂时全部取凭证上结算方式
			// 柜面渠道：01-现金支票、02-转帐支票、03-电汇、04-信汇(同城)、05-信汇（异地）、06-委托收款、 07-预留1
			// 、08-网银、09-公务卡
			// 如果是现金则为01
			if (setModeCode.equals(cashCode)) {
				PlatformUtils.setProperty(t, "settleType", "01");
				PlatformUtils.setProperty(t, "cashTransFlag", 1);
				PlatformUtils.setProperty(t, "pay_voucher_code", PlatformUtils.getProperty(t, "cash_no"));
				
			} else {// 其他则都为 03电汇
				PlatformUtils.setProperty(t, "settleType", "03");
				PlatformUtils.setProperty(t, "voucherType", "00000");
			}

			// 柜面渠道，收入人账户类型为空
			PlatformUtils.setProperty(t, "recvAcctType", "");
			//TODO:先写成“7836”,还有可能是“7809”
			//先获取一次是 7836，还是7809
			String fun = "";
			if(payAmount.signum()<0 ){
				fun = "7809";
				String cashTransFlag = "";
				if(PlatformUtils.getProperty(t, "cashTransFlag") != null){
					cashTransFlag = String.valueOf(PlatformUtils.getProperty(t, "cashTransFlag"));
				}
				//7809,现在标识为4和5时，走电子渠道
				if("4".equals(cashTransFlag) || "5".equals(cashTransFlag)){
					PlatformUtils.setProperty(t, "transChannel", TradeConstant.EBANK_CHANNEL);
				}
			}else {
				fun = "7836";
			}
			TransResManager resMsg = evalWhereObj(t, false,super.setLocalWhereObj(fun),"FAP1.3.4");
			PlatformUtils.setProperty(t, "funcCode", resMsg.getCode().substring(0,4));
			ABC134MsgResBody resBody = (ABC134MsgResBody) this.doBankInterface(sc, context, t, true,super.setLocalWhereObj("78ab"),"FAP1.3.4");
		
			
			if (resBody.getResStatus() == 0) {
				int cashTransFlag = (Integer) PlatformUtils.getProperty(t,"cashTransFlag");
				// 节点号
				PlatformUtils.setProperty(t, "nodeno", resBody.getNodeno());
				// 支取方式
				PlatformUtils.setProperty(t, "drawType", resBody.getDrawType());
				
				//合约名称
				PlatformUtils.setProperty(t, "contrname", resBody.getContrname());
				logger.info("78ab查询账号的合约信息返回成功,节点号为："+PlatformUtils.getProperty(t, "nodeno"));
				// 退票 现金
				if (resMsg.getCode().equals("7809")) {
					if (cashTransFlag == 1) {
						// 现金退票时收款人户名设置为付款人户名
						String payAccName = (String) PlatformUtils.getProperty(
								t, "pay_account_name");
						PlatformUtils.setProperty(t, "payee_account_name",
								payAccName);
						PlatformUtils.setProperty(t, "payee_account_bank", "");
						PlatformUtils.setProperty(t, "payee_account_no", "");
						PlatformUtils.setProperty(t, "settleType", "01");
						PlatformUtils.setProperty(t, "writeoffVouNo", "");
						PlatformUtils.setProperty(t, "writeoffVouSeqNo", "");
						PlatformUtils.setProperty(t, "writeoffTlId", "");
					}
				}

				MsgResBody msgResBody = this.doBankInterface(sc, context, t,false, super.setLocalWhereObj(resMsg.getCode()),"FAP1.3.4");
				if(msgResBody.getResStatus() == 0){
					PlatformUtils.setProperty(t, "cash_no", PlatformUtils.getProperty(msgResBody, "cash_no"));
				}
				return new TransReturnDTO(msgResBody.getResStatus(),
						msgResBody.getResMsg(), t.getTransId(),msgResBody.getBankTransId());
			} else {
				logger.error("交易失败，原因："+resBody.getResMsg());
				throw new PbTransBusinessException(resBody.getResMsg());
			}
		}
		logger.info("转账交易结束！***************");
		return null;
	}
	
	/**
	 * 设置收款人账户类型
	 * @param o
	 */
	public void setType(IVoucher t){
		//获得收款人账号
		
		String payee_account_no =t.getPayeeAcctNo();
		if(StringUtils.isEmpty(payee_account_no))
			return;
		//获得省市代码
		String city_code = (String)PlatformUtils.getProperty(t, "city_code");
		String cityCode = UploadFileUtil.getFromPro("trans", "abc.city.code");
		//如果收款人行号带“-”,中英文都要替换
		payee_account_no = payee_account_no.replaceAll("-", ""); 
		payee_account_no = payee_account_no.replaceAll("-", "");
		
		boolean isABC = false;
		if(t.getPayee_account_bank()!=null && (t.getPayee_account_bank().indexOf("农行")>-1 || t.getPayee_account_bank().indexOf("农业银行")>-1)){
			isABC = true;
		}
		
		//收款人账号长度
		int length = payee_account_no.getBytes().length; 

		if(length == 15 && isABC){
			PlatformUtils.setProperty(t, "payee_account_no", city_code + payee_account_no );
			payee_account_no = city_code + payee_account_no;
		}
		
		length = payee_account_no.length();
		if(length == 17){
			//省市代码有可能为空
			if(payee_account_no.startsWith(cityCode)){
				city_code = cityCode;
			}
			if(payee_account_no.substring(6, 10).equals("0104")){
				//设置为对公账户
				PlatformUtils.setProperty(t, "recvAcctType", "0");
			}
			//17位 7到10位为 0110或0046,
			else if(("0110".equals(payee_account_no.substring(6, 10)) || "0046".equals(payee_account_no.substring(6, 10))) && cityCode.equals(city_code)){//
				//存折
				PlatformUtils.setProperty(t, "fapAbc", "0");
				PlatformUtils.setProperty(t, "recvAcctType", "1");
				
				//如果是内核户:17位 7到10位为 0110或0046
			}else if("0101".equals( payee_account_no.substring(6, 10))&& cityCode.equals(city_code) ){ 
				//如果是同省存折则默认借记卡
				PlatformUtils.setProperty(t, "fapAbc", "0");
				PlatformUtils.setProperty(t, "recvAcctType", "3");
				PlatformUtils.setProperty(t, "abis_account_no", "94=" + payee_account_no);
			}
			else {
				PlatformUtils.setProperty(t, "fapAbc", "1");
				PlatformUtils.setProperty(t, "payee_account_bank_no", null);
			}
		}
		else if( length == 16 ){
			if(payee_account_no.startsWith("622830") || payee_account_no.startsWith("622820") 
					|| payee_account_no.startsWith("53591")){
				PlatformUtils.setProperty(t, "recvAcctType", "2");
			}
			else {
				PlatformUtils.setProperty(t, "fapAbc", "1");
				PlatformUtils.setProperty(t, "payee_account_bank_no", null);
			}
			
		}else if(length == 19){
			PlatformUtils.setProperty(t, "recvAcctType", "1");
		}
		else{
			PlatformUtils.setProperty(t, "fapAbc", "1");
			PlatformUtils.setProperty(t, "payee_account_bank_no", null);
		}
		PlatformUtils.setProperty(t, "payee_account_no", payee_account_no );
	}
	

	@Override
	public TransReturnDTO queryTrans(Session sc, Context context, IVoucher t,
			Object... objects) throws Exception {	
		boolean isSave = true;
		if (objects != null && objects.length != 0 && objects[0] != null) {
			TransLogDTO log = (TransLogDTO)objects[0];
			//取最近一次的交易流水id
			t.setTransId(log.getTrans_log_id());
			PlatformUtils.setProperty(t, "vou_date", log.getCreate_date());
			//本地日志表记录转账成功，则直接返回
			if(log.getTrans_succ_flag() == 1 ){
				return new TransReturnDTO(0, false);//返回成功
			}
			isSave = false;
		}else{
			t.setTransId(this.seqReq(t.getVtCode()));
			return new TransReturnDTO(1,true); //未交易过，需要保存交易日志
		}
		String cityCode = UploadFileUtil.getFromPro("trans", "abc.city.code");
		//柜面渠道，柜员号和终端号送9位，不足前面补省市代码和000
		if(!StringUtil.isEmpty(sc.getTellerCode())&&sc.getTellerCode().length()==4){//最好规定柜员输入的终端号和维护的柜员号为4位，免得麻烦
			t.setTellerCode(cityCode+"000"+sc.getTellerCode());
		}else{
			t.setTellerCode(sc.getTellerCode());
		}
		if(!StringUtil.isEmpty(sc.getUserCode())&&sc.getUserCode().length()==4){
			t.setUserCode(cityCode+"000"+sc.getUserCode());
		}else{
			t.setUserCode(sc.getUserCode());
		}
		
		
//		// 电子渠道 报文中需要的字段
//		int transChannel = (Integer) PlatformUtils.getProperty(t,
//				"transChannel");
//		if (transChannel == 0) {
//			PlatformUtils.setProperty(t, "transReqId", "00000000");
//			PlatformUtils.setProperty(t, "nodeNo", "XXXXX");
//		}
		PlatformUtils.setProperty(t, "transReqId", "00000000");
		PlatformUtils.setProperty(t, "nodeNo", "XXXXX");
		logger.info("78ab查询账号的合约信息开始！");
		//设置要查询合约的节点号
		PlatformUtils.setProperty(t, "funcCode", "78am");
	
		ABC134MsgResBody msgResBody_node = (ABC134MsgResBody) this.doBankInterface(sc, context, t, true, super.setLocalWhereObj("78ab"),"FAP1.3.4");
		if(msgResBody_node.getResStatus() != 0 ){
			logger.error("78ab查询账号的合约信息返回失败！");
			throw new CommonException("78ab查询账号的合约信息返回失败，原因："+msgResBody_node.getResMsg());
		}
		// 节点号
		PlatformUtils.setProperty(t, "nodeno", msgResBody_node.getNodeno());
	
		ABC134MsgResBody msgResBody =(ABC134MsgResBody) this.doBankInterface(sc, context, t, true,super.setLocalWhereObj("78am"),"FAP1.3.4");
		if(msgResBody.getResponseStatus() != TradeConstant.RESPONSESTATUS_SUCCESS){
			t.setTransId(this.seqReq(t.getVtCode()));
			isSave = true;
		}
		return new TransReturnDTO(msgResBody.getResponseStatus(), msgResBody.getResMsg(), t.getTransId(),isSave);
	}
	
	/****
	 * 生成交易流水ID yyMMdd-凭证类型-7位序列
	 * @param vtCode 凭证类型
	 * @return
	 */
	String seqReq(String vtCode) {
		// 流水ID
		String provinceShortName = PbParameters.getStringParameter("pb.province.Shortname");
		StringBuffer flowIdSb = new StringBuffer(provinceShortName);
		flowIdSb.append(PbUtil.getCurrDate("yyMMdd"));
		flowIdSb.append(vtCode);
		String id = IdGen.genStrId("SEQ_TRANS_FLOW_ID");
		if( id.length()>7 ){
			id = id.substring(id.length()-7);
		}else{
			id = ChangeUtil.getFixlenStr(id, 7);
		}
		flowIdSb.append(id);
		return flowIdSb.toString();
	}
	
	/***
	 * 核心接口调用
	 * @param sc
	 * @param context
	 * @param t
	 * @param isQuery
	 * @param objects
	 * @return
	 * @throws Exception
	 */
	public MsgResBody doBankInterface(Session sc, Context context,
			IVoucher t, boolean isQuery, Object... objects) throws Exception {
		//TODO:写在这里不太好，省市代码、网点编码
		PlatformUtils.setProperty(t, "city_code", UploadFileUtil.getFromPro("trans", "abc.city.code"));
		//设置网点
		PlatformUtils.setProperty(t, "pay_account_code", sc.getBelongOrgCode());
		logger.info("++++++++++++++++调银行核心前payee_account_bank_no的值："+t.getPayee_account_bank_no());
		
		
		/**
		 * 还原 付款人账号
		 * edit by liutianlong 2017年2月14日
		 */
		String tempNo = (String) PlatformUtils.getProperty(t, "pay_account_no");
		checkPayAccountNo(t);
		TransResManager resManager = super.evalWhereObj(t, isQuery, objects);
		MsgResBody resBody = super.doBankInterface(sc, context, t, resManager);
		PlatformUtils.setProperty(t, "pay_account_no", tempNo);
		return resBody;
	}
	
	//付款人账号是15位前面加省市代码，18位去“-”
	private void checkPayAccountNo(IVoucher t) {

		String payAcctNo = (String)PlatformUtils.getProperty(t, "pay_account_no");
		logger.info("调用方法进行：付款人账号是15位前面加省市代码，18位去“-”");
		logger.info((new StringBuilder("++++++++++++++++++")).append(payAcctNo).append("+++++++++++++++++++++").toString());
		if(payAcctNo==null){
			return;			
		}
		if(payAcctNo.length()==15){
			payAcctNo = UploadFileUtil.getFromPro("trans", "abc.city.code")+payAcctNo;
			PlatformUtils.setProperty(t, "pay_account_no", payAcctNo);
		}else if(payAcctNo.length()==18){
			payAcctNo = payAcctNo.replaceAll("-", "");
			PlatformUtils.setProperty(t, "pay_account_no", payAcctNo);
		}		
	}

	@Override
	public BigDecimal queryAcctBalance(Session sc, Context context, IVoucher t)
			throws Exception {
		// TODO Auto-generated method stub
		return null;
	}


	@Override
	public List<BankNoDTO> queryBankNo(Session sc, Context context,
			String payeeAcctNo, String payeeAcctBankName) throws Exception {
		// TODO Auto-generated method stub
		return null;
	}


	@Override
	public List<PayVoucher> queryPayDetail(Session sc, Context context,
			String admdivCode, String queryDate, String vtCode)
			throws Exception {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public List<SerialNo> checkSerialno(Session sc, Context context,
			IVoucher t, String queryDate)  throws Exception{
		PlatformUtils.setProperty(t, "transReqId", "00000000");
		
		String taskIdAry = (String) PlatformUtils.getProperty(t, "taskid");
		List<SerialNo> serialList = new ArrayList<SerialNo>();
		for (String tempTaskId : taskIdAry.split(",")) {

			PlatformUtils.setProperty(t, "taskid",
					tempTaskId.replaceFirst("specialNo", ""));

			ABC134MsgResBody msgResBody = (ABC134MsgResBody) this
					.doBankInterface(sc, context, t, true, "78fn", "FAP1.3.4");
			// 78fn交易是否成功
			if (msgResBody.getResStatus() != 0) {
				logger.error("78fn获取对账报表文件失败！");
				throw new CommonException("78fn获取对账报表文件失败，原因："
						+ msgResBody.getResMsg());
			}
			if (msgResBody.getFiniflag() != 1) {
				logger.error("78fn获取对账报表文件失败，原因:78fm任务"
						+ msgResBody.getFiniflagStr());
				throw new CommonException("78fn获取对账报表文件失败，原因:"
						+ msgResBody.getResltstr());
			} else if (StringUtils.isEmpty(msgResBody.getTaskresltB())) {
				logger.error("78fn获取对账报表文件失败，原因:报表文件名称为空！");
				throw new CommonException("78fn获取对账报表文件失败，原因:返回报表文件名称为空！");
			}

			// 从报表服务器上取文件
			// 从报表服务器上取文件
			String fileName = null;
			// 获取操作系统名称
			String osName = System.getProperty("os.name").toLowerCase();
			if (osName.contains("windows")) {
				fileName = PropertiesHander.getValue("trans", "aftstcp.localPath")+"\\"+msgResBody.getTaskresltB().trim();
				AftstcpUtil.aftstcpOnWindows(3, null, fileName);
			} else if (osName.contains("linux")) {
				fileName = PropertiesHander.getValue("trans","aftstcp.localPath")+ "/"+ msgResBody.getTaskresltB().trim();
				int suc = AftstcpUtil.aftstcpOnLinux(3, "abisfile", fileName);
				if (suc != 0 && suc != -1) {
					throw new PbException("下载流水对账文件失败，异常码【" + suc + "】");
				}
			} else {
				throw new PbException("下载流水对账文件失败，获取操作系统名称失败");
			}

			// List<SerialNo> serialList = new ArrayList<SerialNo>();
			BufferedReader reader = null;
			try {
				// 解析文件
				// 中央专项资金的域值：金额位于第26位，流水号位于第49位、交易状态位于47、收款人账号为于第17位
				// 一般资金的域值：金额位于第29位，流水号位于第40位、交易状态位于39、收款人账号为于第20位
				File file = new File(fileName);
				GZIPInputStream in = new GZIPInputStream(new FileInputStream(
						file));
				InputStreamReader isr = new InputStreamReader(in, "gbk");
				reader = new BufferedReader(isr);
				String line = null;
				SerialNo dto = null;
				while ((line = reader.readLine()) != null) {
					dto = new SerialNo();
					String[] l = line.split("\\|!");
					if (tempTaskId.contains("specialNo")) {
						dto.setTransId(l[48].trim());
						dto.setPayeeAcctNo(l[18].trim());
						dto.setTransAmt(new BigDecimal(l[25].trim()));
						dto.setTransResult(Integer.parseInt(l[46].trim()
								.equals("2") ? "0" : "1"));
						serialList.add(dto);
					} else {
						dto.setTransId(l[39].trim());
						dto.setPayeeAcctNo(l[19].trim());
						// dto.setPayAcctNo(l[0].trim());
						dto.setTransAmt(new BigDecimal(l[28].trim()));
						dto.setTransResult(Integer.parseInt(l[38].trim()
								.equals("2") ? "0" : "1"));
						serialList.add(dto);
					}
				}
			} catch (Exception e) {
				throw new CommonException(e);

			} finally {
				if (reader != null) {
					reader.close();
				}
			}
		}
		return serialList;
	
	}

	@Override
	public String queryPayeeAcctNameInBank(Session sc, Context context,IVoucher t)
			throws Exception {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public String reqTransDetail(Session sc,Context context, IVoucher t) throws Exception {
		//1.先查合约
		PlatformUtils.setProperty(t, "funcCode", "7836");
		PlatformUtils.setProperty(t, "transReqId", "00000000");
		ABC134MsgResBody msgResBody_node = (ABC134MsgResBody) this.doBankInterface(sc, context, t, true, "78ab","FAP1.3.4");
		if(msgResBody_node.getResStatus() != 0 ){
			logger.error("78ab查询账号的合约信息返回失败！");
			throw new CommonException("78ab查询账号的合约信息返回失败，原因："+msgResBody_node.getResMsg());
		}
		// 按节点号，把账号设置为空
		PlatformUtils.setProperty(t, "nodeno", msgResBody_node.getNodeno());
		PlatformUtils.setProperty(t, "pay_account_no", "");
		ABC134MsgResBody msgResBody =(ABC134MsgResBody) this.doBankInterface(sc, context, t, true, "78fm","FAP1.3.4");
		if(msgResBody.getResStatus() != 0 ){
			logger.error("78fm申请对账报表文件失败！");
			throw new CommonException("78fm申请对账报表文件失败，原因："+msgResBody.getResMsg());
		}
		return msgResBody.getTaskid();
	}

	@Override
	public boolean loginValidate(Session sc, Context context, String verifyCode)
			throws Exception {
		// TODO Auto-generated method stub
		return false;
	}

	/* (non-Javadoc)
	 * @see grp.pt.pb.trans.IBankTransService#queryAccountTransDetail(grp.pt.util.model.Session, grp.pt.pb.trans.util.Context, java.lang.String, java.lang.String, java.lang.String)
	 */
	@Override
	public List<AccountTransDetailDTO> queryAccountTransDetail(Session sc,
			Context context, String account_no, String start_date,
			String end_date, String user_id, String func_code) throws Exception {
		// TODO Auto-generated method stub
		return null;
	}

}
