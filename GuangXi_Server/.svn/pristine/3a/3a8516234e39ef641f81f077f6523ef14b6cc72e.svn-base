package grp.pb.branch.trans.bs;

import grp.pb.branch.trans.GXCCBMsgResBody;
import grp.pt.idgen.IdGen;
import grp.pt.pb.common.model.BankNoDTO;
import grp.pt.pb.payment.IVoucher;
import grp.pt.pb.payment.PayRequest;
import grp.pt.pb.payment.PayVoucher;
import grp.pt.pb.trans.IBankTransService;
import grp.pt.pb.trans.bs.BankTransServiceAdapter;
import grp.pt.pb.trans.model.AccountTransDetailDTO;
import grp.pt.pb.trans.model.MsgResBody;
import grp.pt.pb.trans.model.MsgResBody.SerialNo;
import grp.pt.pb.trans.model.RelationAccountDTO;
import grp.pt.pb.trans.model.TransLogDTO;
import grp.pt.pb.trans.model.TransResManager;
import grp.pt.pb.trans.model.TransReturnDTO;
import grp.pt.pb.trans.util.Context;
import grp.pt.pb.trans.util.MsgConstant;
import grp.pt.pb.trans.util.ResultCache;
import grp.pt.pb.trans.util.TransPublicUtils;
import grp.pt.pb.util.ChangeUtil;
import grp.pt.pb.util.PbUtil;
import grp.pt.util.PlatformUtils;
import grp.pt.util.StringUtils;
import grp.pt.util.model.Session;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

import org.apache.log4j.Logger;

/*******************************************************************************
 * 广西建行
 * 
 * @author FWQ
 * 
 */
public class GXCCBServiceImpl extends BankTransServiceAdapter {

	private static Logger logger = Logger.getLogger(GXCCBServiceImpl.class);
	
	
	/***************************************************************************
	 * 转账 TRDEAL
	 * 
	 * 请求报文
	  		148	32	付款账号	
			143	60	付款帐户名称	
			155	10	付款机构	
			149	32	收款账号	
			144	60	收款帐户名称	
			145	60	收款帐户行名	
			086	2	交易类型	0：行内转帐  1：跨行转帐
			057	8	前置机交易日期	用于对账
			123	14	收款方支付联行号	行内转帐可以为空
			174	16	国库代码	
			111	30	支付令号	
			087	9	凭证种类	
			114	30	交易包号	授权请款、支付时必填，其余可以为空
			097	18	交易金额	
			154	60	摘要信息	
			305	10	交易渠道	I：网银   A：系统自动发起  G：柜面
		响应报文
			012	40	响应信息
			020	20	核心记帐流水号
			058	8	核心记帐日期
	 */
	@Override
	public TransReturnDTO trans(Session sc, Context context, IVoucher t)
			throws Exception {
		logger.info("*******"+sc.getUserCode()+"*******"+t.getUserCode()+"***"+sc.getBelongOrgCode()+"****");
		PlatformUtils.setProperty(t, "pay_account_code", sc.getBelongOrgCode());
		if(StringUtils.isEmpty(t.getUserCode())){
			PlatformUtils.setProperty(t, "userCode", sc.getUserCode());
		}
		MsgResBody msgResBody = this.doBankInterface(sc, context, t,MsgConstant.PAYTRANS_TRACODE);
		if(msgResBody.getObjs()==null || msgResBody.getObjs().length==0){
			throw new RuntimeException("转账回执信息为空！");
		}
		return new TransReturnDTO(msgResBody.getResHead().getReqCode(),msgResBody.getObjs()[0].toString(),t.getTransId(),msgResBody.getObjs()[1].toString());
	}

	
	
	/***************************************************************************
	 * 查询交易记录 TRSTAT
	 * 
	 * 请求报文
	 * 		087	9	原凭证种类
			120	20	原交易流水号
			148	32	原付款人账号
			149	32	原收款人账号
			097	18	原交易金额
	 * 响应报文
	 * 		012	40	响应信息	
			090	2	交易结果标志	0：成功   1：失败   2：没收到  3：状态不确定
	 * 
	 */
	@Override
	public TransReturnDTO queryTrans(Session sc, Context context, IVoucher t,Object...objects)
	throws Exception {
		boolean isSaveLog = true;
		if (objects!=null && objects.length != 0 && objects[0]!=null) {
			TransLogDTO log = (TransLogDTO)objects[0];
			t.setTransId(log.getTrans_log_id());
			//本地日志表记录转账成功，则直接返回
			if(log.getTrans_succ_flag() == 1 ){
				return new TransReturnDTO(0, false);
			}
			isSaveLog = true;
		}else{
			t.setTransId(seqReq(t.getVtCode()));
			return new TransReturnDTO(1, true);		
		}
		MsgResBody msgResBody =  this.doBankInterface(sc, context, t,MsgConstant.QUERY_TRADESTATUS_TRACODE);
		if(msgResBody.getObjs()==null || msgResBody.getObjs().length==0){
			throw new RuntimeException("查询交易记录回执信息为空！");
		}
		t.setTransId(seqReq(t.getVtCode()));
		return new TransReturnDTO(Integer.parseInt(msgResBody.getObjs()[1].toString()),msgResBody.getObjs()[0].toString(),t.getTransId(),isSaveLog);
	}



	/***************************************************************************
	 * 行号查询 QYBKNO
	 * 
	 * 请求报文 
	  		148	32	收款人账号
			145	60	收款人开户行名称
	 * 响应报文
			012	40	响应信息
			149	32	收款人账号
			146	60	收款人开户行名称
			871	99	文件名称
	 */
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

	
	/***************************************************************************
	 * 指定帐号查询余额 QYBALA
	 * 
	 * 请求报文
	 * 		148	32	账号
	 * 响应报文
	 * 		012	40	响应信息
			097	18	帐户余额
	 */
	@Override
	public BigDecimal queryAcctBalance(Session sc, Context context, IVoucher t)
			throws Exception {
		GXCCBMsgResBody msgBody = (GXCCBMsgResBody)doBankInterface(sc, context, t,MsgConstant.QUERY_ACCTBALANCE_TRACODE);
		if (msgBody.getObjs() == null) {
			//抛出错误原因
			throw new RuntimeException("指定帐号查询余额回执信息为空！");
		}
		return new BigDecimal(msgBody.getObjs()[1].toString());
	}

	
	
	/***************************************************************************
	 * 指定日期查询流水 checkSerialno
	 * 
	 * 请求报文
	  		057	8	查询日期
			174	16	国库代码
			087	9	凭证种类
	 * 响应报文
	  		012	40	响应信息
			299	8	总成功笔数
			097	18	总成功金额
			871	99	文件名称
	 */
	@Override
	public List<SerialNo> checkSerialno(Session sc, Context context, IVoucher t,
			String queryDate) throws Exception {
		MsgResBody msgBody = doBankInterface(sc, context, t,MsgConstant.QUERY_BANKFLOW_TRACODE, queryDate);
		if (msgBody.getObjs() == null) {
			//抛出错误原因
			throw new RuntimeException("指定日期查询流水回执信息为空！");
		}
		if( msgBody.getResHead().getReqCode() != 0 ){
			throw new RuntimeException(msgBody.getObjs()[0].toString());
		}
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
					System.out.println("交易流水号：" + tempStr.substring(0,20));
					dto.setTransId(tempStr.substring(0,20).trim());
					System.out.println("收款账号：" + tempStr.substring(20,52));
					dto.setPayeeAcctNo(tempStr.substring(20,52).trim());
					System.out.println("付款账号：" + tempStr.substring(52,84));
					dto.setPayAcctNo(tempStr.substring(52,84).trim());
					System.out.println("金额：" + tempStr.substring(84,102));
					dto.setTransAmt(new BigDecimal(tempStr.substring(84,102).trim()));
					System.out.println("结果：" + tempStr.substring(102));
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
		TransResManager resManager = ResultCache.getResult(objects[0] + "");
		if(resManager==null){
			throw new Exception("根据转账类型和行政区划获取转账配置信息失败，请检查配置！");
		}
		//处理自助柜面虚拟柜员号
		int isSelfCounter = Integer.parseInt(String.valueOf(PlatformUtils.getProperty(t,"is_self_counter")));
		if(isSelfCounter == 1){
			int max = 50;
			int min = 1;
			String code = null;
			String str = "450000602K";
			Random random = new Random();
			int s = random.nextInt(max)%(max-min+1)+min;
			if(s < 10){
				code = "0"+String.valueOf(s);
			}else{
				code = String.valueOf(s);
			}
			String userCodeNoSb = str + code;
			t.setUserCode(userCodeNoSb);//450000602K01 - K50
		}
		return super.doBankInterface(sc, context, t, resManager, objects);
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



	@Override
	public List<PayVoucher> queryPayDetail(Session sc, Context context,
			String admdivCode, String queryDate, String vtCode)
			throws Exception {
		// TODO Auto-generated method stub
		return null;
	}



	public String queryPayeeAcctNameInBank(Session sc,Context context, String payeeAcctNo)
			throws Exception {
		// TODO Auto-generated method stub
		return null;
	}



	@Override
	public String queryPayeeAcctNameInBank(Session sc, Context context,
			IVoucher t) throws Exception {
		// TODO Auto-generated method stub
		return null;
	}



	@Override
	public String reqTransDetail(Session sc, Context context, IVoucher t)
			throws Exception {
		// TODO Auto-generated method stub
		return null;
	}



	@Override
	public boolean loginValidate(Session sc, Context context, String verifyCode)
			throws Exception {
		// TODO Auto-generated method stub
		return false;
	}



	@Override
	public List<AccountTransDetailDTO> queryAccountTransDetail(Session sc,
			Context context, String account_no, String start_date,
			String end_date, String user_id, String func_code) throws Exception {
		// TODO Auto-generated method stub
		return null;
	}



	@Override
	public List<SerialNo> queryHisSerialno(Session sc, Context context,
			IVoucher t, String queryDate) throws Exception {
		// TODO Auto-generated method stub
		return null;
	}



	@Override
	public MsgResBody batchTrans(Session sc, Context context,
			List<PayVoucher> payVoucherList) throws Exception {
		// TODO Auto-generated method stub
		return null;
	}



	@Override
	public RelationAccountDTO queryAcctCredentials(Session sc, Context context,
			Object... paras) throws Exception {
		// TODO Auto-generated method stub
		return null;
	}



	@Override
	public List<?> queryAcctInfo(Session sc, Context context, Object... paras)
			throws Exception {
		// TODO Auto-generated method stub
		return null;
	}



	@Override
	public MsgResBody queryDifTrans(Session sc, Context context, Object o,
			String queryDate) throws Exception {
		// TODO Auto-generated method stub
		return null;
	}



	@Override
	public MsgResBody sendSalaryNoteInfo(Session sc, Context context,
			PayRequest request) throws Exception {
		// TODO Auto-generated method stub
		return null;
	}



	@Override
	public List<?> querySerial(Session sc, Context context, Object... paras)
			throws Exception {
		// TODO Auto-generated method stub
		return null;
	}
	


	
}
