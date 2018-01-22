package grp.pb.branch.tips;

import grp.pt.StaticApplicationContext;
import grp.pt.pb.common.model.BanknetzDTO;
import grp.pt.pb.exception.PbException;
import grp.pt.pb.payment.PayClearVoucher;
import grp.pt.pb.payment.PayRequest;
import grp.pt.pb.tips.ITipsDealService;
import grp.pt.pb.tips.TipsCommonUtils;
import grp.pt.pb.tips.TipsMessageDTO;
import grp.pt.pb.tips.TipsMsgHead;
import grp.pt.pb.trans.ex.PbTransBusinessException;
import grp.pt.pb.util.PbIdGen;
import grp.pt.pb.util.PropertiesHander;
import grp.pt.pb.util.StaticApplication;
import grp.pt.util.ListUtils;
import grp.pt.util.PlatformUtils;
import grp.pt.util.StringUtil;
import grp.pt.util.model.Session;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;

import org.apache.commons.lang.StringUtils;
import org.apache.log4j.Logger;

import com.river.common.BatchUtil;

/**
 * 
 * 版权所有：北京中科江南软件有限公司 未经本公司许可，不得任何方式复制或使用本程序任务部分 侵权者将受到法律追究
 * 
 * @author liutianlong
 * @date 2014-9-25
 */
public class ABCTIPSServiceImpl implements ITipsDealService {

	private static Logger log = Logger.getLogger(ABCTIPSServiceImpl.class);

	private static String localTipsPath = null;
	static {
		localTipsPath = PropertiesHander.getValue("trans", "ftp.localTipsPath");
	}

	@Override
	public TipsMessageDTO genTipsMessage(Session sc,
			List<PayClearVoucher> list, String againFlag, Object o)
			throws Exception {
		// tips报文
		StringBuffer message = new StringBuffer();
		// 文件名，如果要生成文件，则赋值
		String fileName = null;
		// 设置报文头必要信息
		TipsMsgHead head = TipsCommonUtils.setTipsHead(list, null);
		// tips包号
		String packNo = this.getTipsPackNo(sc, head);
		// 单独设置tips包号
		head.setPageno(packNo);
		// tips流水号
		String tips_tra_no = this.getTipsTraNo();
		// 原划款凭证编号
		String ori_clear_code = this.getOriCode();
		// 拼装报文头信息
		message.append(this.getHeadXml());
		// 拼装批量头信息
		message.append(TipsCommonUtils.genTipsBatchHeadXml(head));
		// 拼装业务报文
		message.append(this.genTipsBodyXML(sc, list,
				head.getMsgno(),packNo, tips_tra_no, ori_clear_code) + "</MSG></CFX>");
		// 7、生成文件名
		fileName = this.createTipsFileName(packNo, head.getMsgno());
		// 构造tips对象
		TipsMessageDTO tmDTO = new TipsMessageDTO();
		tmDTO.setFielName(fileName);
		tmDTO.setMessage(message.toString());
		tmDTO.setTipsMsgHead(head);
		return tmDTO;
	}
	
	/**
	 * XML报文体公用拼装方法
	 * @param sc 当前session
	 * @param list 划款凭证列表
	 * @param msgCode 报文编号
	 * @param tips_tra_no tips流水号  按照自己规则生成
	 * @param ori_clear_code 原凭证号，按照自己规则生成
	 * @return 报文体部分
	 * @throws Exception 
	 */
	private String genTipsBodyXML(Session sc,List<PayClearVoucher> list,String msgCode,String tips_pack_no,
			String tips_tra_no,String ori_clear_code) throws Exception{
		
		if(ListUtils.isEmpty(list)){
			throw new Exception("划款凭证列表不能为空！");
		}
		
		if(StringUtil.isEmpty(msgCode)){
			throw new Exception("tips报文编号不能为空！");
		}
		
		if(StringUtil.isEmpty(tips_pack_no)){
			throw new Exception("tips包序号不能为空！");
		}
		
		if(StringUtil.isEmpty(tips_tra_no)){
			throw new Exception("tips流水号不可为空！");
		}
		
		StringBuffer bodyXML = new StringBuffer();
		
		for(PayClearVoucher clearVoucher : list){
			//获取划款支付明细    //xcg 2015-8-12
			List<PayRequest> details = (List<PayRequest>) PlatformUtils.getProperty(clearVoucher, "details");
			clearVoucher.setTips_tra_no(tips_tra_no);
			clearVoucher.setTips_pack_no(tips_pack_no);
			if(clearVoucher.getVt_code().equals("2302")){
				if(StringUtil.isEmpty(tips_tra_no)){
					throw new Exception("2302，原划款凭证号不可为空！");
				}
				clearVoucher.setOri_trano(tips_tra_no);
//				clearVoucher.setOri_code(ori_clear_code);
//				clearVoucher.setOrivou_date(clearVoucher.getVou_date());
				//与老版本获取原划款凭证号保持一致      //xcg   2015-8-12
//				log.info("划款凭证编码：" + clearVoucher.getPay_clear_voucher_code());
//				log.info("划款日期：" + clearVoucher.getClear_date());
//				log.info("划款日期明细：" + details.get(0).getClear_date());
//				log.info("原划款凭证号："+ clearVoucher.getOri_pay_clear_voucher_code());
				String clearDate = "";
				String sql = "select clear_date from PB_PAY_CLEAR_VOUCHER where pay_clear_voucher_code ='"+details.get(0).getOri_pay_clear_voucher_code()+"'";
				clearDate = StaticApplicationContext.getDaoSupport().queryForString(sql);
				if(StringUtil.isTrimEmpty(clearDate)){
					log.info("划款日期为空！！！");
				}else{
					PlatformUtils.setProperty(clearVoucher, "orivou_date", clearDate == null ? "" : clearDate.toString().substring(0, 10).replace("-", ""));
				}
				PlatformUtils.setProperty(clearVoucher, "ori_code", details.get(0).getOri_pay_clear_voucher_code());
				
			}
			bodyXML.append(StaticApplication.getObjectService().getTipsXml(sc, clearVoucher, msgCode));
		}
		return bodyXML.toString();
	}

	@Override
	public String sendTipsMessage(Session sc, List<PayClearVoucher> list,
			String againFlag, Object o) throws Exception {
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
			returnMsg = this.upLoadTipsFile((String) PlatformUtils.getProperty(
					list.get(0), "tips_pack_no"), tmDTO.getFielName());
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
	public String upLoadTipsFile(String tips_pack_no, String fileName)
			throws Exception {
		String returnMsg = null;
		int upFile = -1;
		try {
			upFile = BatchUtil.j2cDLLFileUpLoadByLinux(1, "aptifile",
					localTipsPath + "/" + fileName);
			if (upFile == -1) {
				returnMsg = "提交TIPS成功，包流水号为：" + tips_pack_no;
			} else {
				throw new PbException("上传至总行服务器异常，异常码【" + upFile + "】");
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
	StringBuffer getHeadXml() {
		StringBuffer headBuffer = new StringBuffer(
				"<?xml version=\"1.0\" encoding=\"GBK\"?><CFX>");
		headBuffer.append("<MSG>");
		return headBuffer;
	}

	/**
	 * 获取TIPS交易流水号（8位），从序列获取
	 * 
	 * @return
	 */
	private String getTipsTraNo() {
		String abc_tips_tra_no = "SEQ_TIPS_TRA_NO_ABC";
		String cityCode = PropertiesHander.getValue("trans", "abc.city.code");
		PbIdGen.genSeqIfNotExists(null, abc_tips_tra_no, 0, 999, 1, true);
		String traNo = PbIdGen.genStrId(abc_tips_tra_no);
		return cityCode + "103" + StringUtils.leftPad(traNo, 3, '0');
	}

	/**
	 * 获取原划款凭证号
	 * 
	 * @return
	 */
	private String getOriCode() {
		String abc_tips_tra_no = "SEQ_TIPS_ORICODE_ABC";
		String cityCode = PropertiesHander.getValue("trans", "abc.city.code");
		PbIdGen.genSeqIfNotExists(null, abc_tips_tra_no, 0, 999, 1, true);
		String traNo = PbIdGen.genStrId(abc_tips_tra_no);
		return cityCode + "104" + StringUtils.leftPad(traNo, 3, '0');
	}

	/**
	 * 获取TIPS交易包号（8位）
	 * 宁夏：（包括4位网点编号+1位业务类型（1表示直接支付，2表示授权支付）+1位划退款标志（0表示划款，1表示退款）+2位批次号编码）
	 * 海南：8位序列号，从1000000开始
	 * 
	 * @return
	 */
	private String getTipsPackNo(Session sc, TipsMsgHead head) {
		String flex = PropertiesHander.getValue("trans", "abc.city.code");
		String pb_tips_pack_no = "SEQ_TIPS_PACK_NO_ABC" + flex;
		StringBuffer strBuffer = new StringBuffer();
		if ("29".equals(flex)) {
			BanknetzDTO banknetz = StaticApplication.getNetworkService()
					.getBanknetzDTOByBankId(sc.getBelongOrgId());
			if (banknetz == null) {
				throw new PbTransBusinessException("", "未能根据用户找到ID为："
						+ sc.getBelongOrgId() + "的网点！");
			}
			strBuffer.append(banknetz.getBank_code().substring(0, 4));
			strBuffer.append(head.getPay_type_code().equals("0") ? 1 : 2);
			strBuffer.append(head.getMsgno().equals("2201") ? 0 : 1);
			PbIdGen.genSeqIfNotExists(sc, pb_tips_pack_no, 0, 99, 1, true);
			String packNo = PbIdGen.genStrId(pb_tips_pack_no);
			strBuffer.append(StringUtils.leftPad(packNo, 2, '0'));
			strBuffer.append(StringUtils.leftPad(packNo, 2, '0'));
		} else if ("21".equals(flex) || "24".equals(flex)) { // 云南农行省市代码为24
																// zhaoyong
																// 2014-06-07
			PbIdGen.genSeqIfNotExists(sc, pb_tips_pack_no, 10000000, 99999999,
					1, true);
			String packNo = PbIdGen.genStrId(pb_tips_pack_no);
			strBuffer.append(StringUtils.leftPad(packNo, 8, '0'));
		} else {
			//省市代码
			String cityCode = PropertiesHander.getValue("trans", "abc.city.code");
			String tips_pack_no = "SEQ_TIPS_PACK_NO_ABC";
			PbIdGen.genSeqIfNotExists(null, tips_pack_no, 0, 999, 1, true);
			String packNo = PbIdGen.genStrId(tips_pack_no);
			strBuffer.append(cityCode).append("103").append(StringUtils.leftPad(packNo, 3, '0'));
			return strBuffer.toString();
		}
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
	 * 生成文件名 农行 TI+区域编码+月日+交易报号+A/B
	 * 
	 * @param packNo
	 *            包序号
	 * @param msgCode
	 *            报文编号
	 * @return
	 */
	private String createTipsFileName(String packNo, String msgCode) {
		// TIPS区域编码
		String areaCode = PropertiesHander.getValue("trans", "abc.city.code");
		StringBuffer fileName = new StringBuffer();
		fileName.append("TI").append(areaCode)
				.append(new SimpleDateFormat("MMdd").format(new Date()))
				.append(packNo).append(msgCode.equals("2201") ? "A" : "B");
		return fileName.toString();
	}

	@Override
	public String testTips(Session sc, Object o) throws Exception {
		// TODO Auto-generated method stub
		return null;
	}
}
