package grp.pb.branch.gxboc.callback;

import grp.pt.pb.exception.PbException;
import grp.pt.pb.payment.PayClearVoucher;
import grp.pt.pb.payment.PayRequest;
import grp.pt.pb.tips.ITipsDealService;
import grp.pt.pb.tips.TipsCommonUtils;
import grp.pt.pb.tips.TipsMessageDTO;
import grp.pt.pb.tips.TipsMsgHead;
import grp.pt.pb.util.PbIdGen;
import grp.pt.pb.util.PbUtil;
import grp.pt.pb.util.PropertiesHander;
import grp.pt.util.FtpClientUtil;
import grp.pt.util.PlatformUtils;
import grp.pt.util.StringUtil;
import grp.pt.util.model.Session;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.Enumeration;
import java.util.List;

import org.apache.commons.lang.StringUtils;
import org.apache.log4j.Logger;

/**
 * 中行TIPS实现类
 * 
 * 版权所有：北京中科江南软件有限公司 未经本公司许可，不得任何方式复制或使用本程序任何部分 侵权者将受到法律追究
 * 
 * @author liutianlong    
 * @date 2014-9-25
 */
public class BOCTIPSServiceImpl implements ITipsDealService {

	private static Logger log = Logger.getLogger(BOCTIPSServiceImpl.class); 
	
	private static String localTipsPath = null;

	private static String remoteTipsPath = null;
	static {
		localTipsPath = PropertiesHander.getValue("trans", "ftp.localTipsPath");
		remoteTipsPath = PropertiesHander.getValue("trans",
				"ftp.remoteTipsPath");
	}

	@Override
	public TipsMessageDTO genTipsMessage(Session sc,
			List<PayClearVoucher> list, String againFlag, Object o)
			throws Exception {
		//ztl 2016年10月11日9:12:19 ztlprint
		 java.net.URL xmlpath = this.getClass().getClassLoader().getResource("");
		 
		 log.info("--ztlprint--进入函数："+Thread.currentThread().getStackTrace()[0].getMethodName());
		 log.info("--ztlprint--执行路径："+xmlpath.getPath() );
		 log.info("--ztlprint--赋值前：");
		 log.info("--ztlprint--vou_date："+list.get(0).getVou_date() );
		 log.info("--ztlprint--Ori_clear_voucher_date："+list.get(0).getOrivou_date() );
		 log.info("--ztlprint--OriVouDate："+list.get(0).getOrivou_date() );
		 log.info("--ztlprint--PayEntrustDate："+list.get(0).getVou_date() );
		 log.info("--ztlprint--OriEntrustDate："+list.get(0).getOrivou_date() );
		
		// tips报文
		StringBuffer message = new StringBuffer();
		// 文件名，如果要生成文件，则赋值
		String fileName = null;
		// tips包号
		String packNo = this.getTipsPackNo();
		// 设置报文头必要信息
		TipsMsgHead head = TipsCommonUtils.setTipsHead(list, packNo);
		// tips流水号
		String tips_tra_no = this.getTipsTraNo();
		// 原划款凭证编号
		String ori_clear_code = this.getOriCode();
		//xcg 2016-8-25 15:44:34 生成的tips报文中原划款凭证号不对
		String vou_date_temp = list.get(0).getVou_date();
		log.info("--ztlprint--清算退款凭证vou_date值："+vou_date_temp );
		for(PayClearVoucher clearVoucher : list){
		List<PayRequest> details = (List)PlatformUtils.getProperty(clearVoucher, "details");
			if(clearVoucher.getVt_code().equals("2302")){
				for(PayRequest request : details){
					ori_clear_code = request.getOri_pay_clear_voucher_code();
					log.info("--ztlprint--明细中id的值："+request.getPay_request_id() );
					log.info("--ztlprint--明细中ori_clear_voucher_date的值："+request.getOri_clear_voucher_date());
					if(!StringUtil.isEmpty(request.getOri_clear_voucher_date())){
						ori_clear_code = request.getOri_pay_clear_voucher_code();
						clearVoucher.setVou_date(request.getOri_clear_voucher_date());
						break;
					}
				}
			}
		}
		 log.info("--ztlprint--赋值后：");
		 log.info("--ztlprint--vou_date："+list.get(0).getVou_date() );
		 log.info("--ztlprint--Ori_clear_voucher_date："+list.get(0).getOrivou_date() );
		 log.info("--ztlprint--OriVouDate："+list.get(0).getOrivou_date() );
		 log.info("--ztlprint--PayEntrustDate："+list.get(0).getVou_date() );
		 log.info("--ztlprint--OriEntrustDate："+list.get(0).getOrivou_date() );
		
		// 拼装报文头信息
		message.append(this.getHeadXml(head));
		// 拼装批量头信息
		message.append(TipsCommonUtils.genTipsBatchHeadXml(head));
		// 拼装业务报文
		message.append(TipsCommonUtils.genTipsBodyXML(sc, list,
				head.getMsgno(), packNo, tips_tra_no, ori_clear_code)
				+ "</MSG></CFX>");
		//ztl 2016年10月11日17:11:23 凭证日期和代理日期赋值
		if(list.get(0).getVt_code().equals("2302")){
			int vouDateStratIndex = message.toString().indexOf("<VouDate>");
			int vouDateEndIndex = message.toString().indexOf("</VouDate>");
			int PayEntrustDateStratIndex = message.toString().indexOf("<PayEntrustDate>");
			int PayEntrustDateEndIndex = message.toString().indexOf("</PayEntrustDate>");

			
			message.replace(vouDateStratIndex+"<VouDate>".length(), vouDateEndIndex, vou_date_temp);
			message.replace(PayEntrustDateStratIndex+"<PayEntrustDate>".length(),PayEntrustDateEndIndex,vou_date_temp);
			
		}
		 log.info("--ztlprint--报文内容：");
		 log.info(message.toString().replaceAll("><", ">"+System.getProperty("line.separator")+"<"));
		 
		 
		// 7、生成文件名
		fileName = this
				.createTipsFileName(packNo, head.getMsgno(), list.get(0));
		// 构造tips对象
		TipsMessageDTO tmDTO = new TipsMessageDTO();
		tmDTO.setFielName(fileName);
		// 报文添加回车换行符
		tmDTO.setMessage(message.toString().replaceAll("><", ">"+System.getProperty("line.separator")+"<"));
		tmDTO.setTipsMsgHead(head);
		return tmDTO;
	}     
	@Override
	public String sendTipsMessage(Session sc, List<PayClearVoucher> list,
			String againFlag, Object o) throws Exception {
		//ztl 2016年10月11日9:12:19 ztlprint
		 java.net.URL xmlpath = this.getClass().getClassLoader().getResource("");
		 
		 log.info("--ztlprint--进入函数："+Thread.currentThread().getStackTrace()[0].getMethodName());
		 log.info("--ztlprint--执行路径："+xmlpath.getPath() );
		 log.info("--ztlprint--vou_date："+list.get(0).getVou_date() );
		 log.info("--ztlprint--Ori_clear_voucher_date："+list.get(0).getOrivou_date() );
		 log.info("--ztlprint--OriVouDate："+list.get(0).getOrivou_date() );
		 log.info("--ztlprint--PayEntrustDate："+list.get(0).getVou_date() );
		 log.info("--ztlprint--OriEntrustDate："+list.get(0).getOrivou_date() );
		
		// 生成tips对象
		TipsMessageDTO tmDTO = this.genTipsMessage(sc, list, againFlag, null);

		File dectionary = new File(localTipsPath);
		if (!dectionary.exists()) {
			dectionary.mkdirs();
		}
		String filePath = localTipsPath + File.separator + tmDTO.getFielName();
		File messageFile = new File(filePath);
		if (messageFile.exists()) {
			throw new PbException("文件【" + filePath + "】已经存在！");
		}
		FileOutputStream fos = null;
		try {
			messageFile.createNewFile();
			fos = new FileOutputStream(messageFile, false);
			fos.write(tmDTO.getMessage().getBytes("GBK"));
		} catch (IOException e) {
			throw new PbException("写入文件失败！", e);
		} finally {
			try {
				fos.close();
			} catch (IOException e) {
				throw new PbException("关闭文件失败！", e);
			}
		}
		log.info("文件" + filePath + "生成成功，开始提交总行服务器！");
		String returnMsg = null;
		try {
			returnMsg = this.upLoadTipsFile(tmDTO.getFielName());
		} catch (Exception e) {
			log.error("提交总行服务器失败", e);
			throw new PbException(e);
		}
		return returnMsg;
	}

	/**
	 * 上传文件至报表服务器
	 * 
	 * @param sc
	 * @param list
	 * @param fileName
	 * @param head
	 * @param admdiv
	 * @return
	 * @throws Exception
	 */
	public String upLoadTipsFile(String fileName) throws Exception {
		String returnMsg = null;
		int upFile = -1;
		try {
			upFile = FtpClientUtil.upLoadFile(localTipsPath, remoteTipsPath,
					fileName);
			if (upFile == -1) {
				returnMsg = "提交TIPS成功";
			}
		} catch (Exception e) {
			throw new PbException("上传至总行服务器失败，原因：" + e.getMessage());
		}
		return returnMsg;
	}

	/**
	 * 报文头部分
	 * 
	 * @return
	 */
	StringBuffer getHeadXml(TipsMsgHead head) {
		StringBuffer headBuffer = new StringBuffer(
				"<?xml version=\"1.0\" encoding=\"GBK\"?><CFX>");
		headBuffer.append("<HEAD>");
		headBuffer.append("<MsgNo>").append(head.getMsgno()).append("</MsgNo>");
		headBuffer.append("<NodeCode>").append(PbUtil.getCurrDateTime())
				.append("</NodeCode>");
		headBuffer.append("</HEAD><MSG>");
		return headBuffer;
	}

	/**
	 * 获取TIPS交易流水号（8位），从序列获取
	 * 
	 * @return
	 */
	private String getTipsTraNo() {
		String abc_tips_tra_no = "SEQ_TIPS_TRA_NO_BOC";
		String cityCode = PropertiesHander.getValue("trans", "abc.city.code");
		PbIdGen.genSeqIfNotExists(null, abc_tips_tra_no, 0, 999, 1, true);
		String traNo = PbIdGen.genStrId(abc_tips_tra_no);
		return cityCode + "104" + StringUtils.leftPad(traNo, 3, '0');
	}

	/**
	 * 获取原划款凭证号
	 * 
	 * @return
	 */
	private String getOriCode() {
		String cityCode = PropertiesHander.getValue("trans", "abc.city.code");
		String abc_tips_tra_no = "SEQ_TIPS_ORICODE_BOC";
		PbIdGen.genSeqIfNotExists(null, abc_tips_tra_no, 0, 999, 1, true);
		String traNo = PbIdGen.genStrId(abc_tips_tra_no);
		return cityCode + "104" + StringUtils.leftPad(traNo, 3, '0');
	}

	/**
	 * 获取TIPS交易包号（8位）
	 * 当天内不可重复
	 * @return
	 */
	private String getTipsPackNo() {
		//省市代码
		String cityCode = PropertiesHander.getValue("trans", "abc.city.code");
		String pb_tips_pack_no = "SEQ_TIPS_PACK_NO_BOC";
		StringBuffer strBuffer = new StringBuffer();
		PbIdGen.genSeqIfNotExists(null, pb_tips_pack_no, 0, 999, 1, true);
		String packNo = PbIdGen.genStrId(pb_tips_pack_no);
		strBuffer.append(cityCode).append("104").append(StringUtils.leftPad(packNo, 3, '0'));
		return strBuffer.toString();
	}

	/***
	 * 批量报文头
	 * 
	 * @param sc
	 * @param headDTO
	 * @return
	 */
	StringBuffer getBatchHeadXml(TipsMsgHead headDTO) {
		StringBuffer buffer = new StringBuffer();
		if (headDTO.getMsgno().equals("2201")) {
			buffer.append("<BatchHead2201>");
			buffer.append("<AgentBnkCode>").append(headDTO.getPay_bank_code())
					.append("</AgentBnkCode>").append("<FinOrgCode>")
					.append(headDTO.getBillorg()).append("</FinOrgCode>")
					.append("<TreCode>").append(headDTO.getTrecode())
					.append("</TreCode>").append("<EntrustDate>")
					.append(headDTO.getEntrust_date()).append("</EntrustDate>")
					.append("<PackNo>").append(headDTO.getPageno())
					.append("</PackNo>").append("<AllNum>")
					.append(headDTO.getAllnum()).append("</AllNum>")
					.append("<AllAmt>").append(headDTO.getAllamt())
					.append("</AllAmt>")
					.append("<PayoutVouType>1</PayoutVouType>")
					.append("<PayMode>").append(headDTO.getPay_type_code())
					.append("</PayMode>");
			buffer.append("</BatchHead2201>");
		} else if (headDTO.getMsgno().equals("2202")) {
			buffer.append("<Head2202>");
			buffer.append("<FinOrgCode>").append(headDTO.getBillorg())
					.append("</FinOrgCode>").append("<TreCode>")
					.append(headDTO.getTrecode()).append("</TreCode>")
					.append("<AgentBnkCode>")
					.append(headDTO.getPay_bank_code())
					.append("</AgentBnkCode>").append("<EntrustDate>")
					.append(headDTO.getEntrust_date()).append("</EntrustDate>")
					.append("<PackNo>").append(headDTO.getPageno())
					.append("</PackNo>").append("<AllNum>")
					.append(headDTO.getAllnum()).append("</AllNum>")
					.append("<AllAmt>").append(headDTO.getAllamt())
					.append("</AllAmt>")
					.append("<PayoutVouType>1</PayoutVouType>")
					.append("<PayMode>").append(headDTO.getPay_type_code())
					.append("</PayMode>");
			buffer.append("</Head2202>");
		}
		return buffer;
	}

	/**
	 * 中行 区划+"_"+代理银行行号+"_"+报文类型+八位日期+"_"+后四位包号
	 * 
	 * @param packNo
	 *            包号
	 * @param msgCode
	 *            报文编号
	 * @param clearVoucher
	 *            划款凭证
	 * @return
	 */
	private String createTipsFileName(String packNo, String msgCode,
			PayClearVoucher clearVoucher) {
		// 中行的守护进程有个bug，只要文件一上传就会解析，导致xml解析不成功，故先命名为“.xml.nx”,等全部上传完毕后，再改名字
		StringBuffer fileName = new StringBuffer();
		fileName.append(clearVoucher.getFinOrgCode()).append("_")
				.append(clearVoucher.getPay_bank_no()).append("_")
				.append(msgCode).append(PbUtil.getCurrDate()).append("_")
				.append(packNo.substring(4, 8)).append(".xml.nx");
		return fileName.toString();
	}

	@Override
	public String testTips(Session sc, Object o) throws Exception {
		// TODO Auto-generated method stub
		return null;
	}
}
