package grp.pb.branch.gxboc.trans;

import grp.pt.idgen.IdGen;
import grp.pt.pb.common.model.BankNoDTO;
import grp.pt.pb.exception.PbException;
import grp.pt.pb.payment.IVoucher;
import grp.pt.pb.payment.PayClearVoucher;
import grp.pt.pb.payment.PayVoucher;
import grp.pt.pb.trans.bs.BankTransServiceAdapter;
import grp.pt.pb.trans.model.MsgResBody;
import grp.pt.pb.trans.model.TransLogDTO;
import grp.pt.pb.trans.model.TransResManager;
import grp.pt.pb.trans.model.TransReturnDTO;
import grp.pt.pb.trans.model.MsgResBody.SerialNo;
import grp.pt.pb.trans.util.Context;
import grp.pt.pb.trans.util.MsgConstant;
import grp.pt.pb.trans.util.ResultCache;
import grp.pt.pb.util.ChangeUtil;
import grp.pt.pb.util.PbUtil;
import grp.pt.pb.util.PropertiesHander;
import grp.pt.pb.util.TradeConstant;
import grp.pt.util.PlatformUtils;
import grp.pt.util.StringUtil;
import grp.pt.util.model.Session;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import org.apache.log4j.Logger;

/***
 * 广西中行业务实现
 * @author zq
 *
 */
public class GXBOCServiceImpl  extends BankTransServiceAdapter {	
	
	private static Logger logger = Logger.getLogger(GXBOCServiceImpl.class);
			
	/***
	 * 查询交易状态
	 */
	@Override
	public TransReturnDTO queryTrans(Session sc, Context context, IVoucher t,
			Object... objects) throws Exception {
		boolean isSaveLog = true;
		if (objects!=null && objects.length != 0 && objects[0]!=null) {
			TransLogDTO log = (TransLogDTO)objects[0];
			t.setTransId(log.getTrans_log_id());
			PlatformUtils.setProperty(t, "payDate",log.getCreate_date());
			//本地日志表记录转账成功，则直接返回
			boolean isQueryTrans = true;
			if(t instanceof PayClearVoucher && (Integer)PlatformUtils.getProperty(t, "is_samebank_clear")==0 && ((BigDecimal)PlatformUtils.getProperty(t, "pay_amount")).signum()==-1){
				isQueryTrans=false;//跨行退款清算转账交易状态查询控制必须调用核心接口，保证获取交易序号
			}
			if(log.getTrans_succ_flag() == 1 && isQueryTrans){
				return new TransReturnDTO(0, false);
			}

			//如果日志记录失败  用原来的流水再次查询交易日志 
//			else if(log.getTrans_succ_flag() == 2){
//				t.setTransId(seqReq(t.getVtCode()));
//			}
//			isSaveLog = false;

		}else{
			t.setTransId(seqReq(t.getVtCode()));
			return new TransReturnDTO(TradeConstant.RESPONSESTATUS_NOTRECEIVE, true);		
		}
		t.setUserCode(sc.getUserCode());
		MsgResBody msgResBody =  this.doBankInterface(sc, context, t,MsgConstant.QUERY_TRADESTATUS_TRACODE);
		int resStatus;
		//核心记账0：成功   1：失败   2：没收到  3：状态不确定
		if(msgResBody.getObjs()[1].toString().equals("0") ){
			resStatus = TransReturnDTO.SUCESS; 
			
			PlatformUtils.setProperty(t, "bankTransId",msgResBody.getObjs()[3].toString());
			
			String setModeLast = (String) PlatformUtils.getProperty(t, "pb_set_mode_code_last");
		
			if(!StringUtil.isEmpty(setModeLast)){
				PlatformUtils.setProperty(t, "pb_set_mode_code",setModeLast);
			}
		}else if(msgResBody.getObjs()[1].toString().equals("1")){
			resStatus = TransReturnDTO.FAILURE;
		}else if(msgResBody.getObjs()[1].toString().equals("2")){
			resStatus = TransReturnDTO.FAILURE;
		}else if(msgResBody.getObjs()[1].toString().equals("3")){
			resStatus = TransReturnDTO.UNKNOWN;
		}else{
			throw new Exception("核心返回状态："+msgResBody.getObjs()[1].toString()+"异常");
		}
		//如果查询出来的交易状态为失败  则应该生成新的流水（用于转账）,并保持交易日志
		if(resStatus == TransReturnDTO.FAILURE){
			t.setTransId(seqReq(t.getVtCode()));
		}else{  //成功和状态未明确则不需要保存交易日志   如果状态为未明确记录交易日志的话（再次查询状态则会显示为未接收）
			isSaveLog = false;
		}
		if(msgResBody.getObjs()==null || msgResBody.getObjs().length==0){
			throw new RuntimeException("查询交易记录回执信息为空！");
		}
		return new TransReturnDTO(resStatus,msgResBody.getObjs()[0].toString(),t.getTransId(),isSaveLog,msgResBody.getObjs()[2].toString(),msgResBody.getObjs()[3].toString());
	}

	/***
	 * 转账
	 */
	@Override
	public TransReturnDTO trans(Session sc, Context context, IVoucher t)
			throws Exception {
		// TODO 待实现
		t.setUserCode(sc.getUserCode());
		PlatformUtils.setProperty(t, "pay_account_code",sc.getBelongOrgCode());
		MsgResBody msgResBody = this.doBankInterface(sc, context, t,MsgConstant.PAYTRANS_TRACODE);
		if(msgResBody.getObjs()==null || msgResBody.getObjs().length==0){
			throw new RuntimeException("转账回执信息为空！");
		}
		PlatformUtils.setProperty(t, "bankTransId",msgResBody.getObjs()[1].toString());
		return new TransReturnDTO(msgResBody.getResHead().getReqCode(),msgResBody.getObjs()[0].toString(),t.getTransId(),msgResBody.getObjs()[1].toString(),msgResBody.getObjs()[3].toString());
	}
	
	
	@Override
	public List<SerialNo> checkSerialno(Session sc, Context context,
			IVoucher t, String queryDate) throws Exception {
		MsgResBody msgBody = doBankInterface(sc, context, t,MsgConstant.QUERY_BANKFLOW_TRACODE, queryDate);
		if (msgBody.getObjs() == null) {
			//抛出错误原因
			throw new RuntimeException("指定日期查询流水回执信息为空！");
		}
//		if( msgBody.getResHead().getReqCode() != 0 ){
//			throw new RuntimeException(msgBody.getObjs()[0].toString());
//		}
		List<SerialNo> serialList = new ArrayList<SerialNo>();
		if (msgBody.getResHead().getIsFile() == 1) {
			File file = new File(context.getFileDir(),msgBody.getObjs()[3].toString());
			BufferedReader reader = null;
			try {
				FileInputStream fis = new FileInputStream(file);
				InputStreamReader read = new InputStreamReader(fis, "GBK");
				reader = new BufferedReader(read);
				String tempStr = null;
				SerialNo dto = null;
				while ((tempStr = reader.readLine()) != null) {
					dto = new SerialNo();
					//每个域值之前都带了3位域号和2位域长度共5位
					//广西建行 三位域号 加域值

					dto.setTransId(tempStr.substring(0,20).trim());

					dto.setPayeeAcctNo(tempStr.substring(20,52).trim());

					dto.setPayAcctNo(tempStr.substring(52,84).trim());

					dto.setTransAmt(new BigDecimal(tempStr.substring(84,102).trim()));

					dto.setTransResult(Integer.parseInt(tempStr.substring(102).trim()));
					
					serialList.add(dto);
				}
				reader.close();
			} catch (IOException e) {
				e.printStackTrace();
				throw new RuntimeException("交易流水校验失败，原因："+e.getMessage());
				
			} finally {
				if (reader != null) {
					try {
						reader.close();
					} catch (IOException e1) {
					}
				}
				file.delete();
			}
		}
		return serialList;
	}

	@Override
	public BigDecimal queryAcctBalance(Session sc, Context context, IVoucher t)
			throws Exception {
		MsgResBody msgBody = doBankInterface(sc, context, t,MsgConstant.QUERY_ACCTBALANCE_TRACODE);
		if (msgBody.getObjs() == null) {
			//抛出错误原因
			throw new RuntimeException("指定帐号查询余额回执信息为空！");
		}
		return new BigDecimal(msgBody.getObjs()[1].toString());
	}

	@Override
	public List<BankNoDTO> queryBankNo(Session sc, Context context,
			String payeeAcctNo, String payeeAcctBankName) throws Exception {
		List<BankNoDTO> bankNoList = new ArrayList<BankNoDTO>();
		MsgResBody msgResBody = this.doBankInterface(sc, context, null, MsgConstant.QUERY_BANKNOLIST_TRACODE,payeeAcctNo,payeeAcctBankName);
		if(msgResBody.getObjs()==null || msgResBody.getObjs().length==0){
			throw new RuntimeException("行号查询回执信息为空！");
		}
		//文件路径
		File file = new File(context.getFileDir(),msgResBody.getObjs()[3].toString());
		BufferedReader reader = null;
		try {
			FileInputStream fis = new FileInputStream(file);
			InputStreamReader read = new InputStreamReader(fis, "GBK");
			reader = new BufferedReader(read);
			String tempStr = null;
			BankNoDTO dto = null;
			while ((tempStr = reader.readLine()) != null) {
				
				//项目用的是utf-8编码，所以字符串转换成字节默认的是以utf-8编码的形式
				//一个汉字转换成字节的长度将是3
				//这样银行行名读取就补为乱码
				byte [] tempByte = tempStr.getBytes();
				dto = new BankNoDTO();
				//每个域值之前都带了3位域号和2位域长度共5位
				//行号12位
				System.out.println("行号：" + new String(tempByte, 0, 12));
				dto.setBank_no(new String(tempByte, 0, 12).trim());
				System.out.println("行名：" + new String(tempByte, 12,60));
				dto.setBank_name(new String(tempByte,12, 60).trim());
				//匹配度
				System.out.println("匹配度：" + new String(tempByte, 72,7));
				dto.setMatch_ratio(Double.valueOf(new String(tempByte,72,7).trim()));
				//相似度
				System.out.println("相似度：" + new String(tempByte, 79,7));
				dto.setLike_ratio(Double.valueOf(new String(tempByte,79,7).trim()));
				bankNoList.add(dto);
				if(bankNoList.size()==20){
					break;
				}
			}
			reader.close();
		} catch (IOException e) {
			e.printStackTrace();
		} finally {
			if (reader != null) {
				try {
					reader.close();
				} catch (IOException e1) {
				}
			}
			file.delete();
		}

		return bankNoList;
	}

	@Override
	public List<PayVoucher> queryPayDetail(Session sc, Context context,
			String admdivCode, String queryDate, String vtCode)
			throws Exception {
		throw new PbException("此接口暂无实现！");
	}

	@Override
	public String queryPayeeAcctNameInBank(Session sc, Context context,
			IVoucher t) throws Exception {
		throw new PbException("此接口暂无实现！");
	}
	/****
	 * 生成交易流水ID yyMMdd-凭证类型-7位序列
	 * @param vtCode 凭证类型
	 * @return
	 */
	String seqReq(String vtCode) {
		// 流水ID
		StringBuffer flowIdSb = new StringBuffer();
		flowIdSb.append(PbUtil.getCurrDate("yyMMdd")).append("-");
		flowIdSb.append(vtCode).append("-");
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
	 * 调银行接口
	 * 
	 * @param sc
	 * @param context
	 * @param t
	 * @param transCode
	 * @param objects
	 * @return
	 * @throws Exception
	 */
	MsgResBody doBankInterface(Session sc, Context context, IVoucher t,Object... objects) throws Exception {
		
		Integer transCGA =  (Integer)PlatformUtils.getProperty(t, "is_self_counter");
		if( transCGA == 1){
			String userCode = PropertiesHander.getValue("gxbocbl", "virtual.user.code");
			if(StringUtil.isNotBlank(userCode)){
				sc.setUserCode(userCode);
			}
		}
		TransResManager resManager = ResultCache.getResult(objects[0].toString());
		if(resManager==null){
			throw new Exception("根据转账类型和行政区划获取转账配置信息失败，请检查配置！");
		}
		return super.doBankInterface(sc, context, t, resManager, objects);
	}



	

}
