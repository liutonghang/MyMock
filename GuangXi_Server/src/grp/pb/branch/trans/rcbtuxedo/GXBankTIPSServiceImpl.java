package grp.pb.branch.trans.rcbtuxedo;

import grp.pt.bill.Billable;
import grp.pt.idgen.IdGen;
import grp.pt.pb.exception.PbException;
import grp.pt.pb.payment.PayClearVoucher;
import grp.pt.pb.payment.PayRequest;
import grp.pt.pb.tips.ITipsDealService;
import grp.pt.pb.tips.TipsMessageDTO;
import grp.pt.pb.trans.util.TransUtil;
import grp.pt.pb.util.PbUtil;
import grp.pt.pb.util.PropertiesHander;
import grp.pt.util.DateUtil;
import grp.pt.util.PlatformUtils;
import grp.pt.util.model.Session;

import java.io.BufferedInputStream;
import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.text.DecimalFormat;
import java.util.List;

import org.apache.log4j.Logger;


/**
 * 中行TIPS实现类
 * 
 * 版权所有：北京中科江南软件有限公司 未经本公司许可，不得任何方式复制或使用本程序任何部分 侵权者将受到法律追究
 * 
 * @author liutianlong
 * @date 2014-9-25
 */
public class GXBankTIPSServiceImpl implements ITipsDealService {

	private static Logger log = Logger.getLogger(GXBankTIPSServiceImpl.class);

	private String fileName;

	public String getFileName() {
		return fileName;
	}

	public void setFileName(String fileName) {
		this.fileName = fileName;
	}

	@Override
	public TipsMessageDTO genTipsMessage(Session sc,
			List<PayClearVoucher> list, String againFlag, Object o)
			throws Exception {
		StringBuffer sb = new StringBuffer();
		String transName = "";
		String transCode = "";
		try {
			//报文体
			sb.append("<BMSBJDM>"+this.judgeNull(list.get(0).getFinOrgCode())+"</>");
			sb.append("<BMSSBGKM>"+this.judgeNull(list.get(0).getTreCode())+"</>");			
			if("2301".equals(list.get(0).getVtCode())){
				transName = "银行办理支付－划款申请";
				sb.append("<BMSDLYHM>"+this.judgeNull(list.get(0).getPay_bank_no())+"</>");
				sb.append("<ChkVouFlg>"+1+"</>");
				//直接支付
				if("11".equals(list.get(0).getPay_type_code())){
					sb.append("<PayWay>"+0+"</>");
				}
				//授权支付
				else if("12".equals(list.get(0).getPay_type_code())){
					sb.append("<PayWay>"+1+"</>");
				}				
				sb.append("<ReceiptNo>"+this.judgeNull(list.get(0).getPay_clear_voucher_code())+"</>");
				sb.append("<CallDate>"+ this.judgeNull(DateUtil.DateToString(DateUtil.stringToDate(list.get(0).getVtDate(),"yyyyMMdd"), "yyyy-MM-dd"))+"</>");
				sb.append("<OrPayAccNo>"+this.judgeNull(list.get(0).getClear_account_no())+"</>");
				sb.append("<BMSFKRMC>"+this.judgeNull(list.get(0).getClear_account_name())+"</>");
				sb.append("<PyrAddr>"+this.judgeNull(list.get(0).getClear_account_bank_addr())+"</>");
				sb.append("<BMSSKRZH>"+this.judgeNull(list.get(0).getAgent_account_no())+"</>");
				sb.append("<BMSYSKHM>"+this.judgeNull(list.get(0).getAgent_account_name())+"</>");
				sb.append("<BMSPAYERADDR>"+this.judgeNull(list.get(0).getAgent_account_bank_address())+"</>");
				sb.append("<BMSPAYERCNAPS>"+this.judgeNull(list.get(0).getPay_bank_no())+"</>");
				sb.append("<BMSFY>"+this.judgeNull(list.get(0).getRemark())+"</>");
				transCode = "824161";
			}else if("2302".equals(list.get(0).getVtCode())){
				transName = "银行办理支付无（有）纸凭证退款请求";
				//明细
				List<PayRequest> details = (List<PayRequest>)PlatformUtils.getProperty(list.get(0), "details");
				sb.append("<InAmt>"+list.get(0).getPay_amount()+"</>");
				sb.append("<ChkVouFlg>"+1+"</>");
				if("11".equals(list.get(0).getPay_type_code())){
					sb.append("<TranKind2>"+0+"</>");
				}else if("12".equals(list.get(0).getPay_type_code())){
					sb.append("<TranKind2>"+1+"</>");
				}
				sb.append("<BMSPZRQ>"+this.judgeNull(DateUtil.DateToString(DateUtil.stringToDate(list.get(0).getVtDate(),"yyyyMMdd"), "yyyy-MM-dd"))+"</>");				
				sb.append("<BMSPZHM>"+this.judgeNull(details.get(0).getOri_trano())+"</>");
				//退款申请报文的添加凭证编码
				sb.append("<VouNo>"+this.judgeNull(details.get(0).getPay_clear_voucher_code())+"</>");
				sb.append("<TrDate>"+this.judgeNull(DateUtil.DateToString(DateUtil.stringToDate(list.get(0).getVtDate(),"yyyyMMdd"), "yyyy-MM-dd"))+"</>");
				//ReceiptNo改为原划款申请的凭证编码
				sb.append("<ReceiptNo>"+this.judgeNull(details.get(0).getOri_pay_clear_voucher_code())+"</>");
				sb.append("<CallDate>"+this.judgeNull(DateUtil.DateToString(DateUtil.stringToDate(list.get(0).getVtDate(),"yyyyMMdd"), "yyyy-MM-dd"))+"</>");
				sb.append("<OrPayAccNo>"+this.judgeNull(list.get(0).getClear_account_no())+"</>");
				sb.append("<BMSFKRMC>"+this.judgeNull(list.get(0).getClear_account_name())+"</>");
				sb.append("<BMSSKRZH>"+this.judgeNull(list.get(0).getAgent_account_no())+"</>");
				sb.append("<BMSYSKHM>"+this.judgeNull(list.get(0).getAgent_account_name())+"</>");
				sb.append("<CallType>"+this.judgeNull(list.get(0).getPay_dictate_no())+"</>");
				sb.append("<Bhnm>"+this.judgeNull(list.get(0).getPay_dictate_no())+"</>");
				//委托日期
				sb.append("<BMSBBRQ>"+this.judgeNull(DateUtil.DateToString(DateUtil.stringToDate(list.get(0).getPay_entrust_date(),"yyyyMMdd"), "yyyy-MM-dd"))+"</>");
				sb.append("<ODFICode>"+this.judgeNull(list.get(0).getPay_bank_no())+"</>");
				//交易码由824162改为824163
				transCode = "824163";
			}
			//整理期标志
			int i = list.get(0).getYear() == PbUtil.getCurrYear() ? 0 : 1;
			sb.append("<BMSYSZL>"+this.judgeNull(String.valueOf(list.get(0).getBudget_type()))+"</>");
			sb.append("<Flag10>"+i+"</>");
			sb.append("<FeeYear>"+list.get(0).getYear()+"</>");	
			DecimalFormat df = new DecimalFormat("#0.00");
			sb.append("<TranAmt>"+df.format(list.get(0).getPay_amount().abs())+"</>");
		} catch (Exception e) {
			log.error(e);
			throw new PbException(e);
		}
		TipsMessageDTO tmDTO = new TipsMessageDTO();
		//存放交易码
		tmDTO.setFielName(transCode);
		tmDTO.setMessage(this.getHead(sc,transName).toString()+sb.toString());
		return tmDTO;
	}

	@Override
	public String sendTipsMessage(Session sc, List<PayClearVoucher> list,
			String againFlag, Object o) throws Exception {
		String returnMsg = "";
		StringBuffer sb = new StringBuffer();
		try {
			//生成文件并上传文件
			this.createFile(sc, list);
			//调用tudexo服务发送报文
			TipsMessageDTO tmDTO = genTipsMessage(sc, list, againFlag, o);
			String message = tmDTO.getMessage();
			sb.append(new String(TransUtil.getFixlenStrBytes(String.valueOf(message.getBytes("GBK").length), 8))).append(tmDTO.getFielName())
					.append("RQ").append(0).append(
							TransUtil.getFixlenStrBytesByFlex("", 32, " "))
					.append(TransUtil.getRightByAddSpace(tmDTO.getFielName(),8)).append(4).append(message);
			String appAddress = PropertiesHander.getValue("gxtuxedo", "preaddress");
			GXRCBMsgParserTuxedo tuxedo = new GXRCBMsgParserTuxedo();
			//交易码
			String transCode =  tmDTO.getFielName();
			log.info("发送报文："+sb.toString());
			String resBody = tuxedo.doTuxedo(sb.toString(),transCode,appAddress);
			//解析回执报文
			String resCode = tuxedo.getvalue(resBody, "RspCode");
			if("000000".equals(resCode)){
				returnMsg = "tips发送成功！";
			}else{
				throw new PbException(tuxedo.getvalue(resBody, "RspMsg"));
			}
		} catch (Exception e) {
			log.error(e);
			throw new PbException(e);
		}
		return returnMsg;
	}

	@Override
	public String testTips(Session sc, Object o) throws Exception {
		// TODO Auto-generated method stub
		return null;
	}

	/**
	 * 生成文件并上传
	 * @param sc
	 * @param list
	 */
    private void createFile(Session sc,List<PayClearVoucher> list){   	
		FileOutputStream fos = null;
		BufferedWriter bw = null;
		//路径
		String filePath = PropertiesHander.getValue("gxtuxedo", "filePath");
		String shellPath = PropertiesHander.getValue("gxtuxedo", "shellPath");
		//生成文件
		File path = new File(filePath);
		if(!path.exists()){
			path.mkdirs();
		}
		String payType = "";
		if("11".equals(list.get(0).getPay_type_code())){
			payType = "0";
		}else if("12".equals(list.get(0).getPay_type_code())){
			payType = "1";
		}		
		fileName = "ZKJN_"+PbUtil.getCurrDate()+"_"+payType+"_"+list.get(0).getPay_clear_voucher_code()+".txt";
		File file = new File(filePath+File.separator+fileName);
		if(file.exists()){
			file.delete();
		}	
		try {			
			file.createNewFile();
			fos = new FileOutputStream(file);	
			String str = this.getFileString(list);
			bw = new BufferedWriter(new OutputStreamWriter(fos));
			bw.write(str);
			DecimalFormat df = new DecimalFormat("#0.00");
			//获取明细
			for(Billable billable : list.get(0).getDetails()){
				StringBuffer sb = new StringBuffer();
				bw.newLine();
				PayRequest pv = (PayRequest) billable;
				sb.append(this.judgeNull(pv.getAgency_code()) + ",").append(
						this.judgeNull(pv.getExp_func_code()) + ",").append(
						this.judgeNull(pv.getExp_eco_code()) + ","+ ",")
						//明细金额改为第二行第5个参数，退款申请金额取绝对值
						.append(df.format(pv.getPay_amount().abs()) + ",");
				bw.write(sb.toString());
			}			
		} catch (Exception e) {
			throw new PbException("写入文件失败，原因：",e);
		}finally {
			try {
				bw.close();
				fos.close();
			} catch (IOException e) {
				throw new PbException("关闭文件失败！", e);
			}
		}
		log.info("文件" + file + "生成成功，开始上传服务器！");		
		this.uploadFile(shellPath);
    }
	
    /**
     * 拼装文件内容
     * @param list
     * @return
     */
    private String getFileString(List<PayClearVoucher> list){
    	StringBuffer sb = new StringBuffer();
    	DecimalFormat df = new DecimalFormat("#0.00");
    	//拼装文件内容
		sb.append(this.judgeNull(list.get(0).getTreCode()) + ",").append(",").append(
				list.get(0).getClear_account_no() + ",").append(",,").append(
				this.judgeNull(list.get(0).getPay_bank_no()) + ",").append(",,,").append(
				this.judgeNull(list.get(0).getFund_type_code()) + ",").append(
				df.format(list.get(0).getPay_amount().abs()) + ",").append(
				list.get(0).getYear() == PbUtil.getCurrYear() ? "0" : "1").append(","+","+
				list.get(0).getPay_clear_voucher_code() + ",").append(
				list.get(0).getVtDate());
		return sb.toString();
    }
    
    /**
     * 上传到服务器
     * @param localPath
     * @param fileName
     */
    private void uploadFile(String localPath){
    	Runtime rt = Runtime.getRuntime();
    	Process process = null;
    	StringBuffer cmd = new StringBuffer();
    	try {
    		cmd.append("sh ");
    		cmd.append(localPath+File.separator+"NXtips-sftp.sh "+fileName);
    		log.info(cmd.toString());
			process = rt.exec(cmd.toString());			
		} catch (Exception e) {
			throw new PbException("上传文件失败，原因：",e);
		}
		try {
			BufferedInputStream in = new BufferedInputStream(process.getInputStream());  
			BufferedReader inBr = new BufferedReader(new InputStreamReader(in));  
			String lineStr;  
			String lineTemp="";
            while ((lineStr = inBr.readLine()) != null) { 
            	lineTemp += lineStr;
            }   
            log.info("执行结果：/n"+lineTemp);           
		} catch (Exception e) {
			log.error("",e);
		}finally{
			process.destroy();
		}
    }
    
    /**
     * 2301,2302公共报文头
     * @param sc
     * @param fileName
     * @return
     */
    private StringBuffer getHead(Session sc,String transName){
    	IdGen.genSeqIfNotExists(sc, "TIPS_SEQ", 1, 99999999, 1, true);
    	long seq = IdGen.genNumId("TIPS_SEQ");
    	StringBuffer sb = new StringBuffer();
    	//终端号
    	sb.append("<TermId>"+"realwareteller"+"</>");
    	//终端流水号
    	sb.append("<TermSeq>"+TransUtil.getFixlenStrBytesByFlex(String.valueOf(seq), 8, "0")+"</>");
    	//交易名称
    	sb.append("<TranName>"+transName+"</>");
    	//机构码
    	sb.append("<Brc>"+sc.getBankcode()+"</>");
    	//交易机构名称
    	sb.append("<BrcName0>"+sc.getBankname()+"</>");
    	//交易柜员
    	sb.append("<Teller>"+sc.getUserCode()+"</>");
    	//柜员名称
    	sb.append("<TellerName>"+sc.getUserName()+"</>");
    	//交易来源
    	sb.append("<ChannelId>"+GXTradeConstantTuxedo.CHANNELID+"</>");
    	//文件标识
    	sb.append("<FileFlag>"+1+"</>");
    	//文件名
    	sb.append("<FileName>"+fileName+"</>");    	
    	return sb;
    }
    
    /**
     * 判断是否为空
     * @param str
     * @return
     */
    private String judgeNull(String str){
    	if(str == null || "".equals(str)){
    		return "";
    	}
    	return str;
    }
}
