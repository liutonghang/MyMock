package grp.pb.branch.gxboc.header.ss;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.sql.Timestamp;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.List;

import javax.servlet.http.HttpServletRequest;

import org.apache.log4j.Logger;
import org.eclipse.jetty.util.log.Log;

import grp.pt.bill.Paging;
import grp.pt.bill.ReturnPage;
import grp.pt.pb.common.model.BankNoDTO;
import grp.pt.pb.newuser.UserSignZeroNo;
import grp.pt.pb.payment.PayRequest;
import grp.pt.pb.payment.PayVoucher;
import grp.pt.pb.payment.RefundSerial;
import grp.pt.pb.ss.IPsfaBocPayService;
import grp.pt.pb.ss.IPsfaPayService;
import grp.pt.pb.ss.ISelfCounterService;
import grp.pt.pb.ss.bs.CTJSCServiceImpl;
import grp.pt.pb.ss.model.CTJMsgBody;
import grp.pt.pb.ss.model.CTJMsgHead;
import grp.pt.pb.ss.model.ExchangeCondition;
import grp.pt.pb.ss.model.TransReflectField;
import grp.pt.pb.ss.model.TransReflectObject;
import grp.pt.pb.ss.model.TransResultDTO;
import grp.pt.pb.ss.util.FieldMapperUtil;
import grp.pt.pb.ss.util.SsConstant;
import grp.pt.pb.trans.model.RelationAccountDTO;
import grp.pt.pb.trans.util.SocketUtil;
import grp.pt.pb.trans.util.TransUtil;
import grp.pt.pb.util.PbUtil;
import grp.pt.pb.util.PropertiesHander;
import grp.pt.util.BeanFactoryUtil;
import grp.pt.util.PlatformUtils;
import grp.pt.util.StringUtil;
import grp.pt.util.StringUtils;
import grp.pt.util.model.Session;

public class BOCSCServiceImpl implements ISelfCounterService{
	private static Logger logger = Logger.getLogger(CTJSCServiceImpl.class);

	private static IPsfaBocPayService psfaPayService = (IPsfaBocPayService) BeanFactoryUtil
			.getBean("gx.psfaBocPayService");
	//银行名称，用于区分不同银行系统
	private static String bank = PropertiesHander.getValue("trans", "TransInterface");
	
	@Override
	public byte[] doTask(InputStream in) throws Exception {
		TransResultDTO resultDto = null;
		byte[] resMsgByte = null;
		try {
			// 解析
			CTJMsgBody msgBody = this.doParser(in);
			// 调用自助柜面业务层接口
			resultDto = this.doBusiness(msgBody.getMsgHead(),msgBody.getConditions());
			// 生成成功的响应报文
			resMsgByte = this.doResponse(msgBody.getMsgHead().getTransCode(),resultDto, msgBody);
		} catch (Exception e) {
			logger.error("交易失败", e);
			resMsgByte = this.errorResponse(e.getMessage());
		}
		return resMsgByte;
	}

	/**
	 * 解析请求报文
	 * @param in
	 * @return
	 * @throws Exception
	 */
	private CTJMsgBody doParser(InputStream in) throws Exception {
		// 请求报文头字节数组
		byte[] reqMsgHead = SocketUtil.read(in,
				SsConstant.CTJ_REQ_HEAD_LEN + 8);
		// 解析通讯报文头
		CTJMsgHead reqHead = this.parsToMsgHead(reqMsgHead);
		// 请求报文体字节数组
		byte[] reqMsgBody = SocketUtil.read(in, reqHead.getMsgLen()
				- SsConstant.CTJ_REQ_HEAD_LEN);
		logger.info("请求报文："+new String(reqMsgHead,"GBK") + new String(reqMsgBody,"GBK"));
		// 根据报文头中交易码，获取字段映射配置
		TransReflectObject fieldMapper = FieldMapperUtil.loadFieldMappers(reqHead.getTransCode());
		
		// 解析请求报文体,获取请求条件
		List<ExchangeCondition> conditions = this.parsReqBody(reqMsgBody,fieldMapper.getReqReflectFields());
		//年度
		ExchangeCondition yearCon = new ExchangeCondition("year", reqHead.getYear(), "=", "1", 1);
		conditions.add(yearCon);
		//区划代码信息不传，不拼区划信息
		if(!StringUtils.isEmpty(reqHead.getAdmdiv_code())){
			//区划
			ExchangeCondition admDivCon = new ExchangeCondition("admdiv_code", reqHead.getAdmdiv_code(), "=", "0", 1);
			conditions.add(admDivCon);
		}
		// 报文对象
		CTJMsgBody reqBody = new CTJMsgBody(reqHead, conditions);
		return reqBody;
	}

	private Paging genPageByHead(CTJMsgHead msgHead){
		Paging page = new Paging();
		//当前页码
		int nowPageNo = msgHead.getNow_page_code();
		//页面最大记录数
		int pageRows = msgHead.getPage_size();
		int startIndex = (nowPageNo - 1) * pageRows;
		page.setStartIndex(startIndex);
		page.setNowPage(nowPageNo);
		page.setNowPageNo(pageRows);
		page.setLoadDataCount(true);
		return page;
	}
	/**
	 * 业务处理
	 * 
	 * @param transCode
	 * @param body
	 */
	private TransResultDTO doBusiness(CTJMsgHead msgHead,
			List<ExchangeCondition> conditions) throws Exception {
		String transCode = msgHead.getTransCode();
		TransResultDTO resultDto = null;
		// 请求条件信息
		if (SsConstant.CTJ_GET_TO_BE_CONFIRMED_NUM_BOC.equals(transCode)) {
			//待办事项查询，查询未处理，并且task_id为0的数据
			ExchangeCondition newCon1 = new ExchangeCondition("task_id", 0, "=","1", 1);
			conditions.add(newCon1);
			resultDto = psfaPayService.getToBeConfirmedTransNum(conditions);
		}else if(SsConstant.CTJ_GET_WATINGTASK_BY_TRANSSTRUTS.equals(transCode)){
			resultDto = psfaPayService.ctjGetWaitingTaskbytransStatus(conditions);
		}else if (SsConstant.CTJ_LOAD_VOUCHER_BOC.equals(transCode)) {
			Paging page = genPageByHead(msgHead);
			resultDto = psfaPayService.loadPayVouchers(conditions,page);
		}else if(SsConstant.CTJ_TRANSFER_VOUCHER_BOC.equals(transCode)){
			resultDto = psfaPayService.acceptPayVoucher(conditions,msgHead.getUser_name(),false);
		}else if (SsConstant.CTJ_RETURN_VOUCHER_BOC.equals(transCode)){
			resultDto = psfaPayService.returnPayVoucher(conditions,msgHead.getUser_name(),false);
		}else if(SsConstant.CTJ_DEAL_REFUND_VOUCHER_BOC.equals(transCode)){
			resultDto = psfaPayService.dealRefundPayVoucher(conditions,msgHead.getUser_name(),false);
		}else if(SsConstant.CTJ_LOAD_TRANS_DETAIL_BOC.equals(transCode)){
			Paging page = genPageByHead(msgHead);
			resultDto = psfaPayService.loadTransLogs(conditions,page);
		}else if(SsConstant.CTJ_LOAD_DETAIL_BY_CODE_BOC.equals(transCode)){
			Paging page = genPageByHead(msgHead);
			resultDto = psfaPayService.checkLoginForDefault(conditions);
		}else if(SsConstant.CTJ_CHECK_LOGIN_DEFAULT.equals(transCode)){
			//自助柜面登录验证(标准版，2008接口)
			resultDto = psfaPayService.checkLoginForDefault(conditions);
		}else if(SsConstant.CTJ_CANCEL_REFUND_VOUCHER_BOC.equals(transCode)){
			//作废接口VT_CODE为2204
			for(ExchangeCondition ec : conditions){
				if("vt_code".equals(ec.getKey())){
					ec.setValue("2204");
				}
			}
			resultDto = psfaPayService.cancelRefundVoucher(conditions);
		}else if(SsConstant.CTJ_LOAD_USER_SIGNZERO.equals(transCode)){
			resultDto = psfaPayService.loadUserSignzero(conditions);
		}else if(SsConstant.CTJ_LOAD_USER_SIGNZERO_BOC.equals(transCode)){
			resultDto = psfaPayService.loadUserSignzeroBOC(conditions);
		}else if(SsConstant.CTJ_LOAD_AGENCY_CODE.equals(transCode)){
			resultDto = psfaPayService.loadAgencyCode(conditions);
		}else if(SsConstant.CTJ_MODIFY_PASSWORD.equals(transCode)){
			//修改登录密码
			resultDto = psfaPayService.modifyPassword(conditions);
		}else if(SsConstant.CTJ_SANXIA_VERIFY_VOUCHER.equals(transCode)){
			//初审
			resultDto = psfaPayService.verifyTrans(conditions);
		}else if(SsConstant.BOC_QUERY_PAY_ACCOUNT.equals(transCode)){//重庆中行F013接口
			resultDto=psfaPayService.queryPayAccountByClientId(conditions);
		}else if(SsConstant.CTJ_CHECK_LOGIN_SMS.equals(transCode)){//签约用户登录，短信验证
			resultDto=psfaPayService.checkLoginByLoginCodePwd(conditions);
		}else if(SsConstant.CTJ_EDIT_USER_SMS.equals(transCode)){//签约用户信息变更，短信验证
			resultDto=psfaPayService.editSignZeroUserSms(conditions);
		}else if(SsConstant.CTJ_SEND_SMS_CODE.equals(transCode)){//发送短信验证码
			resultDto=psfaPayService.sendSmsCode(conditions);
		}else if(SsConstant.BOC_QUERY_BANK_RELATION.equals(transCode)){//查行别，省，市，行号
			Paging page = genPageByHead(msgHead);
			resultDto=psfaPayService.queryBankRelation(conditions,page);
		}	else if(SsConstant.BOC_SAVE_BANKNO.equals(transCode)){//保存补录行号
			Paging page = genPageByHead(msgHead);
			resultDto=psfaPayService.saveBankNo(conditions,page);
		}else if(SsConstant.BOC_QUERY_RELATE_ACCT.equals(transCode))
		{
			Paging page = genPageByHead(msgHead);
			resultDto=psfaPayService.queryRelationAcct(conditions,page);
		}else if(SsConstant.BOC_QUERY_RELATE_ACCT_DETAIL.equals(transCode))
		{
			Paging page = genPageByHead(msgHead);
			resultDto=psfaPayService.queryAcctTradeDetails(conditions,page);
		}
		
		return resultDto;
	}

	/**
	 * 生成响应报文
	 * 
	 * @param transCode
	 * @param resultDto
	 * @return
	 * @throws Exception
	 */
	private byte[] doResponse(String transCode, TransResultDTO resultDto,
			CTJMsgBody msgReqBody) throws Exception {
		// 回执报文-全部
		ByteArrayOutputStream allStream = new ByteArrayOutputStream();
		// 报文体部分
		ByteArrayOutputStream bodyStream = new ByteArrayOutputStream();

		// 根据报文头中交易码，获取字段映射配置
		TransReflectObject fieldMapper = FieldMapperUtil
				.loadFieldMappers(transCode);
		// 响应报文配置
		List<TransReflectField> resReflectFields = fieldMapper
				.getResReflectFields();
		//非分页查询，返回条数统计
		int dataSize = 0;
		// 当前页总金额
		BigDecimal voucher_sum_amt = BigDecimal.ZERO;
		String resp_code = "";
		if (resultDto.getResStatus() == 0) {
			resp_code = SsConstant.CTJ_SUCCUSS_CODE;
		} else {
			resp_code = SsConstant.CTJ_FAILURE_CODE;
		}
		ReturnPage page = resultDto.getPageData();
		List<PayVoucher> payVoucherList = resultDto.getVouchers();
		//交易流水查询返回信息拼的是AccountTransDetailDTO，指定凭证号查询明细返回信息拼的是PayRequest，其他拼的是payVoucher
		if(SsConstant.CTJ_LOAD_TRANS_DETAIL_BOC.equals(transCode)){
			List<RefundSerial> refundSerials = (List<RefundSerial>)page.getPageData();
			// 拼装当前页
			for (RefundSerial refundSerial:refundSerials) {
				voucher_sum_amt = voucher_sum_amt.add(refundSerial.getPay_amount());
				//组装返回报文体
				writeByteArrayOutStream(bodyStream,resReflectFields, refundSerial);
			}
		}else if(SsConstant.CTJ_LOAD_DETAIL_BY_CODE_BOC.equals(transCode)){
			//指定凭证号查询其明细
			List<PayRequest> payRequests = (List<PayRequest>)page.getPageData();
			for (PayRequest payRequest:payRequests) {
				voucher_sum_amt = voucher_sum_amt.add(payRequest.getPay_amount());
				//组装返回报文体
				writeByteArrayOutStream(bodyStream,resReflectFields, payRequest);
			}	
		}else if(SsConstant.CTJ_GET_TO_BE_CONFIRMED_NUM_BOC.equals(transCode)){
			//待办事项查询，一条返回数据
			dataSize = 1;
			//组装返回报文体
			writeByteArrayOutStream(bodyStream,resReflectFields, resultDto);
		}else if(SsConstant.CTJ_GET_WATINGTASK_BY_TRANSSTRUTS.equals(transCode)){
			//待办事项查询，一条返回数据
			dataSize = 1;
			//组装返回报文体
			writeByteArrayOutStream(bodyStream,resReflectFields, resultDto);
		}else if(SsConstant.CTJ_LOAD_USER_SIGNZERO.equals(transCode) || SsConstant.CTJ_CHECK_LOGIN_DEFAULT.equals(transCode)||SsConstant.CTJ_LOAD_USER_SIGNZERO_BOC.equals(transCode)){
			if(resp_code == SsConstant.CTJ_FAILURE_CODE){
				throw new Exception(resultDto.getResMsg());
			}
			List<UserSignZeroNo> userSignzero = (List<UserSignZeroNo>)resultDto.getUserSignzeroList();
			dataSize = userSignzero.size();
			for(UserSignZeroNo usz : userSignzero){
				writeByteArrayOutStream(bodyStream,resReflectFields, usz);
			}
		}else if(SsConstant.CTJ_LOAD_AGENCY_CODE.equals(transCode)){
			//String agencyCode = resultDto.getAgencyCode();
			writeByteArrayOutStream(bodyStream,resReflectFields,resultDto);
			//获取单位编码，只返回一条数据
			dataSize = 1;
		}else if(SsConstant.CTJ_MODIFY_PASSWORD.equals(transCode)){
			writeByteArrayOutStream(bodyStream,resReflectFields,resultDto);
		}else if(SsConstant.CTJ_HLJLJ_GET_CERT_DN_SN.equals(transCode)){
			if(resp_code == SsConstant.CTJ_FAILURE_CODE){
				throw new Exception(resultDto.getResMsg());
			}
			//获取dn信息，一条返回数据
			dataSize = 1;
			writeByteArrayOutStream(bodyStream,resReflectFields, resultDto);
		}else if(SsConstant.CTJ_HLJLJ_GET_SIGN_ACCOUNT.equals(transCode)){
			if(resp_code == SsConstant.CTJ_FAILURE_CODE){
				throw new Exception(resultDto.getResMsg());
			}
			List<String> accList = (List<String>)resultDto.getAccounts();
			dataSize = accList.size();
			for(String acc : accList){
				ByteArrayOutputStream baos = new ByteArrayOutputStream();
				for (TransReflectField f : resReflectFields) {
					// 域值
					String value = acc;
					// 域号
					baos.write(f.getField_name().getBytes());
					// 域长度（最长为99位，如果超过99位，截取前99位）
					if(value.getBytes().length > 99){
					    value = PbUtil.getAcurateLenString(value,99);
					}
					// 域长度
					baos.write(TransUtil.getFixlenStrBytes(value.getBytes().length+"", 2));
					// 域值
					baos.write(value.getBytes());
				}
				bodyStream.write(baos.toByteArray());
			}
		}else if(SsConstant.BOC_QUERY_PAY_ACCOUNT.equals(transCode)){//重庆中行F013接口
			if(resp_code == SsConstant.CTJ_FAILURE_CODE){
				throw new Exception(resultDto.getResMsg());
			}
			List<UserSignZeroNo> accList = (List<UserSignZeroNo>) resultDto.getUserSignzeroList();
			
			dataSize=accList.size();
			
			for (UserSignZeroNo str : accList) {
			 
				writeByteArrayOutStream(bodyStream,resReflectFields,str);
			}
		}else if(SsConstant.CTJ_CHECK_LOGIN_SMS.equals(transCode)){//2009 短信验证版，签约用户登录
			if(resp_code == SsConstant.CTJ_FAILURE_CODE){
				throw new Exception(resultDto.getResMsg());
			}
			List<UserSignZeroNo> userSignzero = (List<UserSignZeroNo>)resultDto.getUserSignzeroList();
			dataSize = userSignzero.size();
			for(UserSignZeroNo usz : userSignzero){
				writeByteArrayOutStream(bodyStream,resReflectFields, usz);
			}
		}else if(SsConstant.CTJ_EDIT_USER_SMS.equals(transCode)){//2010签约用户信息变更，短信验证版
			//TODO:
		}else if(SsConstant.CTJ_SEND_SMS_CODE.equals(transCode)){//2011发送短信验证码
			//TODO:
		}else if(SsConstant.CTJ_VERIFY_SMS_CODE.equals(transCode)){//2012短信验证码验证
			//TODO:
		}else if(SsConstant.BOC_QUERY_BANK_RELATION.equals(transCode)){//中行自助柜面省市代码查询
			List<BankNoDTO> bankNoList= (List<BankNoDTO>) resultDto.getList();
			dataSize = bankNoList.size();
			for(BankNoDTO bankNo : bankNoList){
				writeByteArrayOutStream(bodyStream,resReflectFields, bankNo);
			}
		}else if(SsConstant.BOC_QUERY_RELATE_ACCT_DETAIL.equals(transCode)){
			List<RefundSerial> serialList=(List<RefundSerial>) resultDto.getList();
			dataSize = serialList.size();
			for(RefundSerial serial : serialList){
				writeByteArrayOutStream(bodyStream,resReflectFields, serial);
			}
		}else if(SsConstant.BOC_QUERY_RELATE_ACCT.equals(transCode)){
			List<RelationAccountDTO>  relationAccts=(List<RelationAccountDTO>) resultDto.getList();
			dataSize = relationAccts.size();
			for(RelationAccountDTO relateAcct : relationAccts){
				writeByteArrayOutStream(bodyStream,resReflectFields, relateAcct);
			}
		}else if(SsConstant.BOC_SAVE_BANKNO.equals(transCode)){
		}else{
			List<PayVoucher> vouchers = null;
			if(page != null){
				vouchers = (List<PayVoucher>)page.getPageData();
			}else{
				vouchers = payVoucherList;
				dataSize = vouchers.size();
			} 
			// 拼装当前页
			for (PayVoucher p:vouchers) {
				voucher_sum_amt = voucher_sum_amt.add(p.getPay_amount());
				//组装返回报文体
				writeByteArrayOutStream(bodyStream,resReflectFields, p);
			}
		}
		int msgLen = bodyStream.toByteArray().length + SsConstant.CTJ_RES_HEAD_LEN;
		if(msgLen + 8 > 99999999){
			throw new Exception("根据条件查询返回凭证数量过多，请增加筛选条件！");
		}
		CTJMsgHead resHead = null;
		if(page == null){
			resHead = new CTJMsgHead(msgLen, resp_code, 1,
					1, voucher_sum_amt, msgReqBody.getMsgHead().getNow_page_code(),
					dataSize, resultDto.getResMsg());
		}else{
		    resHead = new CTJMsgHead(msgLen, resp_code, page.getPageCount(),
				page.getDataCount(), voucher_sum_amt, msgReqBody.getMsgHead().getNow_page_code(),
				page.getPageData().size(), resultDto.getResMsg());
		}
		allStream.write(resHead.readReqHead());
		allStream.write(bodyStream.toByteArray());
		return allStream.toByteArray();
	}
    
	/**
	 * 组装返回报文体
	 * @param bodyStream
	 * @param resReflectFields
	 * @param p
	 * @throws ParseException
	 * @throws IOException
	 */
	private void writeByteArrayOutStream(ByteArrayOutputStream bodyStream,List<TransReflectField> resReflectFields, Object p)
			throws ParseException, IOException {
		ByteArrayOutputStream baos = new ByteArrayOutputStream();
		for (TransReflectField f : resReflectFields) {
			// 域值
			String value = StringUtil.isNotEmpty(f.getDefault_value() == null? null: f.getDefault_value().trim()) ? f
					.getDefault_value() : PlatformUtils.getProperty(p,
							f.getDto_name()) == null ? ""
					: PlatformUtils.getProperty(p, f.getDto_name())
							.toString();
			//时间戳类型转换为“yyyy-MM-dd HH:mm:ss”格式
			if(PlatformUtils.getProperty(p, f.getDto_name()) instanceof Timestamp){
				SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
				value = format.format(format.parse(value));
			}
			// 域号
			baos.write(f.getField_name().getBytes("GBK"));
			// 域长度（最长为99位，如果超过99位，截取前99位）
			if(value.getBytes("GBK").length > 99){
			    value = PbUtil.getAcurateLenString(value,99);
			}
			// 域长度
			baos.write(TransUtil.getFixlenStrBytes(value.getBytes("GBK").length+"", 2));
			// 域值
			baos.write(value.getBytes("GBK"));
		}
		bodyStream.write(baos.toByteArray());
	}

	private byte[] errorResponse(String errorMsg) {
		if(errorMsg == null){
			errorMsg = "交易返回信息为空，请检查柜面日志";
		}
		ByteArrayOutputStream errorStream = new ByteArrayOutputStream();
		CTJMsgHead resHead = new CTJMsgHead(SsConstant.CTJ_RES_HEAD_LEN,
				SsConstant.CTJ_FAILURE_CODE, 0, 0, BigDecimal.ZERO, 0, 0,
				errorMsg);
		try {
			errorStream.write(resHead.readReqHead());
		} catch (IOException e) {
			logger.error("", e);
		}
		return errorStream.toByteArray();
	}

	/**
	 * 解析报文头
	 * 
	 * @param headBytes
	 * @return
	 */
	private CTJMsgHead parsToMsgHead(byte[] headBytes) {
		// 8位报文长度
		int msgLen = Integer.valueOf(new String(headBytes, 0, 8).trim());
		// 4位交易码
		String trans_code = new String(headBytes, 8, 4);
		// 60位操作员姓名
		String user_name = new String(headBytes, 12, 60).trim();
		// 3位页面最大记录数
		int page_size = StringUtil.isEmpty(new String(headBytes, 72, 3).trim()) ? 1 : Integer.valueOf(new String(headBytes, 72, 3).trim());
		// 2位当前页数
		int now_page_code = StringUtil.isEmpty(new String(headBytes, 75, 2).trim()) ? 1 : Integer.valueOf(new String(headBytes, 75, 2).trim());
		// 4位年度
		int year = Integer.valueOf(new String(headBytes, 77, 4));
		// 9位区划
		String admdiv_code = new String(headBytes, 81, 9).trim();
		// 1位凭证类型
		String pay_type = new String(headBytes, 90, 1);
		CTJMsgHead reqHead = new CTJMsgHead(msgLen, trans_code, 
				user_name, page_size,now_page_code, year, admdiv_code, pay_type);
		return reqHead;
	}

	/**
	 * 解析请求报文体，返回交易条件列表
	 * 
	 * @param bodyBytes
	 * @param reqConfigList
	 * @return
	 */
	private List<ExchangeCondition> parsReqBody(byte[] bodyBytes,
			List<TransReflectField> reqConfigList) throws Exception {
		List<ExchangeCondition> conditions = new ArrayList<ExchangeCondition>();
//		System.out.println("报文："+ new String(bodyBytes));
		//自助柜面只查询授权支付业务
		ExchangeCondition newCon2 = new ExchangeCondition("vt_code", "8202", "=","0", 1);
		int i = 5;
		for (TransReflectField field : reqConfigList) {
			// 域号
			String code = new String(bodyBytes, i - 5, 3);
			if (!code.equals(field.getField_name())) {
				throw new RuntimeException("请求报文格式错：请检查域号："
						+ field.getField_name());
			}
			// 域长度
			int len = Integer.valueOf(new String(bodyBytes, i - 2, 2));
//			String value = new String(bodyBytes, i, len).trim();
			//ztl 2016年9月19日9:37:52  字符集
			String value = new String(bodyBytes, i, len,"GBK").trim();
			if("payee_account_bank_name".equals(field.getDto_name())){
				logger.info("----收款行账户开户行名称转换前为：-----"+ new String(bodyBytes, i, len).trim());
				logger.info("----收款行账户开户行名称转换后为：-----"+ value);
			}
			//非空检查
			if(field.getNullable() == 0 && StringUtil.isEmpty(value)){
				throw new RuntimeException("请求报文格式错：域值为空,请检查域号："
						+ field.getField_name());
			}
			if(field.getField_length()<value.getBytes().length){
				throw new RuntimeException("请求报文格式错：域值超长,请检查域号："
						+ field.getField_name());
			}
			// 一些条件可以直接用于sql，一些条件需要做转换，此处暂时统一处理
			if (StringUtil.isNotEmpty(value)) {
				
				if("business_type".equals(field.getDto_name())){//条件为查询状态
					//已清算，退款时查询原支付凭证使用
					 if("3".equals(value)){
						ExchangeCondition con = new ExchangeCondition("business_type", 1, "=","1", 1);
						//清算日期不能为空的条件
//						ExchangeCondition newCon1 = new ExchangeCondition("special", 
//								"(select 1 from pb_pay_request r where r.pay_voucher_id=objsrc_2742.pay_voucher_id and r.pay_amount>r.pay_refund_amount and r.clear_date is not null )", 
//								"exists","0", 1);
						//2015-05-13 查询原支付凭证时根据主单支付金额与清算状态查询 --by zcl
						ExchangeCondition newCon1 = new ExchangeCondition("clear_flag", 1, "=","1", 1);
						ExchangeCondition newCon3 = new ExchangeCondition("pay_amount", "pay_refund_amount", ">","1", 1);
						conditions.add(con);
						conditions.add(newCon1);
						conditions.add(newCon3);
					}
					//已退款
					else if("4".equals(value)){
						//已支付的金额为负的记录是已退款的记录
						ExchangeCondition newCon1 = new ExchangeCondition("pay_refund_amount", 0, ">","1", 1);
						conditions.add(newCon1);
					} 
					//退款凭证（退款办理，已提交）
					else if("5".equals(value)){
						//已支付的金额为负的记录是已退款的记录
						ExchangeCondition newCon1 = new ExchangeCondition("pay_amount", 0, "<","1", 1);
						//查询退款通知书加入判断条件是否有效IS_VALID，1为有效
						ExchangeCondition newCon3 = new ExchangeCondition("is_valid", 1, "=","1", 1);
						//2204授权支付退款通知书
						newCon2.setValue("2204");
						conditions.add(newCon1);
						conditions.add(newCon3);
					}
					else if("7".equals(value)){
						ExchangeCondition newCon3 = new ExchangeCondition("special", 
								"(business_type = -1 or batchreq_status = -1)", 
								"","0", 1);
						conditions.add(newCon3);
					}
					 //查询 待处理，正常，退回，失败的凭证
					else if("9".equals(value)){
/*						ExchangeCondition newCon1 = new ExchangeCondition("task_id", 0, "=","1", 1);
						conditions.add(newCon1);
*/						ExchangeCondition newCon3 = new ExchangeCondition("special", 
								"(business_type in (-1,1,2,0))", 
								"","0", 1);
						conditions.add(newCon3);
					}
					 //查询待处理凭证 加入条件task_id=0 ，加入未请款状态
					else if("0".equals(value)){
						ExchangeCondition newCon1 = new ExchangeCondition("task_id", 0, "=","1", 1);
						conditions.add(newCon1);
						ExchangeCondition newCon3 = new ExchangeCondition("special", 
								" business_type in (-1,0) ", 
								"","0", 1);
						conditions.add(newCon3);
					}else if ("1".equals(value) && "SanXia".equals(bank)){
						//重庆已转账send_flag = 1
						ExchangeCondition newCon1 = new ExchangeCondition("send_flag", 1, "=","1", 1);
						conditions.add(newCon1);
						ExchangeCondition con = new ExchangeCondition(field.getDto_name(), value, field.getField_oprater(),
								field.getField_type(), field.getIs_sql_field());
						conditions.add(con);
					}else if("8".equals(value)  && "SanXia".equals(bank)){
						//三峡银行待审核
						ExchangeCondition newCon1 = new ExchangeCondition("send_flag", 0, "=","1", 1);
						conditions.add(newCon1);
						ExchangeCondition newCon3 = new ExchangeCondition("special", 
								"(business_type='8' or business_type='1')", 
								"","0", 1);
						conditions.add(newCon3);
					}else {
						ExchangeCondition con = new ExchangeCondition(field.getDto_name(), value, field.getField_oprater(),
								field.getField_type(), field.getIs_sql_field());
						conditions.add(con);
					}
				}else{
					ExchangeCondition con = new ExchangeCondition(field.getDto_name(), value, field.getField_oprater(),
							field.getField_type(), field.getIs_sql_field());
					conditions.add(con);
				}
			}
			i += 5 + len;
		}
		conditions.add(newCon2);
		return conditions;
	}
}
