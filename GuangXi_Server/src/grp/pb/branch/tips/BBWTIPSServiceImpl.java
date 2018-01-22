package grp.pb.branch.tips;
import static grp.pt.pb.util.PayConstant.BILL_TYPE_PAY_CLEAR_VOUCHER;
import grp.pb.branch.beibuwan.trans.BBWServiceImpl;
import grp.pt.bill.Billable;
import grp.pt.bill.DaoSupport;
import grp.pt.database.sql.Eq;
import grp.pt.database.sql.SqlGenerator;
import grp.pt.database.sql.Table;
import grp.pt.database.sql.Update;
import grp.pt.idgen.IdGen;
import grp.pt.pb.common.IFinService;
import grp.pt.pb.common.IPbContentService;
import grp.pt.pb.common.IRefObjService;
import grp.pt.pb.common.impl.PayCommonService;
import grp.pt.pb.exception.PbException;
import grp.pt.pb.payment.PayClearVoucher;
import grp.pt.pb.tips.ITipsDealService;
import grp.pt.pb.tips.TipsCommonUtils;
import grp.pt.pb.tips.TipsMessageDTO;
import grp.pt.pb.tips.TipsMsgHead;
import grp.pt.pb.trans.bs.OfflineServiceImpl;
import grp.pt.pb.trans.util.Context;
import grp.pt.pb.trans.util.SocketUtil;
import grp.pt.pb.util.ChangeUtil;
import grp.pt.pb.util.ExpTxtFileBillNo;
import grp.pt.pb.util.NumberUtils;
import grp.pt.pb.util.PbIdGen;
import grp.pt.pb.util.PbUtil;
import grp.pt.pb.util.PropertiesHander;
import grp.pt.pb.util.StaticApplication;
import grp.pt.util.BaseDAO;
import grp.pt.util.FtpClientUtil;
import grp.pt.util.ListUtils;
import grp.pt.util.Parameters;
import grp.pt.util.PlatformUtils;
import grp.pt.util.StringUtil;
import grp.pt.util.model.Session;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.Socket;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.apache.commons.lang.StringUtils;
import org.apache.log4j.Logger;

import com.river.common.UploadFileUtil;

/**
 * 北部湾TIPS使用TBS上传实现类(广西北部湾)
 * 
 * 版权所有：北京中科江南软件有限公司 未经本公司许可，不得任何方式复制或使用本程序任何部分 侵权者将受到法律追究
 * 
 * @author FWQ
 * @date 2015-5-25
 */
public class BBWTIPSServiceImpl implements ITipsDealService {

	private static Logger log = Logger.getLogger(BBWTIPSServiceImpl.class);

	private static Set<String> existsSeq = new HashSet<String>();

	static HashMap<String, String> bizMap = null;

	private static String localTipsPath = null;
	
	private static String remoteTipsPath = null;

	private static Context context = new Context();
	
	private static IPbContentService contentService;
	
    private static DaoSupport daoSupport = null;
	
	private static BaseDAO baseDAO = null;
	
	private static IFinService finService = null;
	
	private static IRefObjService reflectObjectService = null;
	
	private static String tipsFormatMode = null;
	
	private static String tipsUploadRemoteOrLocal = null;
	
	private static PayCommonService payCommonService = null;
	
	static {
		localTipsPath = PropertiesHander.getValue("trans", "ftp.localTipsPath");
		remoteTipsPath = UploadFileUtil.getFromPro("trans", "ftp.remoteTipsPath");
		contentService = (IPbContentService)StaticApplication.getBean("contentService");
		daoSupport = (DaoSupport)StaticApplication.getBean("bill.daosupport.daosupportimpl");
		baseDAO = StaticApplication.getBaseDAO();
		finService = (IFinService)StaticApplication.getBean("pb.common.impl.FinService");
		reflectObjectService = StaticApplication.getObjectService();
		payCommonService = (PayCommonService) StaticApplication.getBean("payCommonService");
		//GXCCB导出tips格式为tbs
		tipsFormatMode = UploadFileUtil.getFromPro("trans", "tipsFormatMode");
		tipsUploadRemoteOrLocal = UploadFileUtil.getFromPro("trans", "tipsUploadRemoteOrLocal");
	}

	@SuppressWarnings("unchecked")
	@Override
	public TipsMessageDTO genTipsMessage(Session sc,
			List<PayClearVoucher> list, String againFlag, Object o)
			throws Exception {
		// tips报文
		StringBuffer message = new StringBuffer();
		// 文件名，如果要生成文件，则赋值
		String fileName = null;
		// tips包号
		String packNo = this.getTipsPackNo();
		// 设置报文头必要信息
		TipsMsgHead head = TipsCommonUtils.setTipsHead(list, packNo);
		
		long billTypeId = Parameters.getLongParameter(BILL_TYPE_PAY_CLEAR_VOUCHER);
		long ids[] = getPayClearVoucherIds(list);
//		String chrCode = "tbs.payclearvoucher.code";
		String chrCode = o.toString();
		message = new StringBuffer();
		message.append("**");
		List<Billable> billList = (List<Billable>) payCommonService.loadBillsWithDetails(
				sc, billTypeId, ids);
		fileName = createNewNo(sc, billList.get(0)) + ".txt";
		PbUtil.batchSetValue(list, "tips_file_name", fileName);
		
		List<String> strList = contentService.writeList(billList, chrCode);
		for(String ssList:strList){
			message.append(ssList);
		}
		
		// 构造tips对象
		TipsMessageDTO tmDTO = new TipsMessageDTO();
		tmDTO.setFielName(fileName);
		tmDTO.setMessage(message.toString());
		tmDTO.setTipsMsgHead(head);
		return tmDTO;
	}
	@Override
	public String sendTipsMessage(Session sc, List<PayClearVoucher> list,
			String againFlag, Object o) throws Exception {
		// 生成tips对象
		TipsMessageDTO tmDTO = this.genTipsMessage(sc, list, againFlag, o);

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
			returnMsg = this.upLoadTipsFile(list, tmDTO.getFielName());
			log.info("ftp提交tips返回信息："+returnMsg);
			BBWServiceImpl bbwServiceImpl = new BBWServiceImpl();
			bbwServiceImpl.sendTipsMessage(sc,list,tmDTO);
			
		} catch (Exception e) {
			log.error("提交总行服务器或提交核心报文失败", e);
			throw new PbException(e);
		}

		
		return returnMsg;
	}

	public String upLoadTipsFile(List<?> list,String fileName) throws Exception{
		String returnMsg = null;
		int upFile = -1;
		log.info("ftp的配置如下：\n提交模式:"+context.getTipSuploadMode()+""
				+"提交方式:"+tipsUploadRemoteOrLocal+"远程位置:"+remoteTipsPath+"本地位置:"+localTipsPath+""
				+"文件名称:"+fileName);
		try {
			if(context.newBankTransService() instanceof OfflineServiceImpl){
				returnMsg = "提交TIPS成功";
			}
			else if("ftp".equals(context.getTipSuploadMode())){
				//只需将tips文件生成在本地，无需提交到远程服务器，由银行手工提交

				upFile = upLoadFile(localTipsPath, remoteTipsPath,fileName);

				if(upFile == -1){
					returnMsg = "提交TIPS成功";
				}
			}
			//sftp提交模式（广西建行使用fwq）
			else if("sftp".equals(context.getTipSuploadMode())){
				//只需将tips文件生成在本地，无需提交到远程服务器，由银行手工提交
				if("local".equals(tipsUploadRemoteOrLocal)){
					upFile = -1;
				}else if("remote".equals(tipsUploadRemoteOrLocal)){
					SFTPClientUtil.uploadFile(localTipsPath, fileName, remoteTipsPath);
					upFile = -1;
				}
				if(upFile == -1){
					returnMsg = "提交TIPS成功";
				}
			}else {
				log.error("无法在trans.properties中找到tipsuploadmode，请配置...");
			}
			
		} catch (Exception e) {
			throw new PbException("上传至总行服务器失败，原因："+e.getMessage());
		}
		return returnMsg;
	}
	
	/**
	 * 获得划款凭证中的所有主键
	 * 
	 * @param list
	 * @return
	 */
	private long[] getPayClearVoucherIds(List<PayClearVoucher> list) {

		// 如果为空则直接返回
		if (ListUtils.isEmpty(list)) {
			long[] l = new long[0];
			return l;
		}

		// 如果有凭证数据则循环添加
		long[] l = new long[list.size()];
		for (int i = 0; i < list.size(); i++) {
			l[i] = list.get(i).getPay_clear_voucher_id();
		}
		return l;
	}
	
//===============================================================================================================
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
	public String upLoadTipsFile_123(TipsMsgHead head, String admdiv_code)
			throws Exception {
		// 创建套接字与服务端连接
		Socket socket = SocketUtil.createSocket(context, true);
		String resMsg = "";
		try {
			// 请求流
			ByteArrayOutputStream baops = new ByteArrayOutputStream();

			byte[] txCode = PbUtil.string2ByteFull("EVLS", 8);
			baops.write(txCode);

			// 写入交易ID8个字节,此处默认为0
			byte[] flowIdB = PbUtil.string2Byte(
					NumberUtils.getFixlenString(head.getPageno(), 8), 8);
			baops.write(flowIdB);
			// 交易码
			baops.write(PbUtil.string2ByteFull(head.getMsgno(), 7));
			// 包流水号
			baops.write(PbUtil.string2ByteFull(head.getPageno(), 9));
			// 交易日期
			baops.write(PbUtil.string2ByteFull(PbUtil.getCurrDate(), 9));
			// 国库代码
			baops.write(PbUtil.string2ByteFull(
					admdiv_code.substring(admdiv_code.length() - 4), 5));

			// 报文体
			byte[] body = baops.toByteArray();

			// 整体数据报文
			ByteArrayOutputStream fullOut = new ByteArrayOutputStream();

			// 添加版本信息
			fullOut.write("1".getBytes("GBK"));
			// 添加控制字符
			// 设置Type位为1（数据报文）
			byte[] ctrl = new byte[1];
			ctrl[0] = 4;
			ctrl[0] |= 1;
			fullOut.write(ctrl);
			// 添加报文长度（2字节）
			fullOut.write(ChangeUtil.short2byte((short) (body.length)));
			// 添加包顺序（4个字节）
			fullOut.write(ChangeUtil.int2bytes(0));

			// 写入报文体信息
			fullOut.write(body);
			log.info("#########请求报文："
					+ new String(fullOut.toByteArray(), "GBK"));
			// 发送数据
			socket.getOutputStream().write(fullOut.toByteArray());
			socket.getOutputStream().flush();

			// 读入流
			InputStream in = socket.getInputStream();
			// 读取前8个字节
			byte[] msg = SocketUtil.read(in, 8);
			// 报文体长度
			byte len[] = new byte[2];
			len[0] = msg[2];
			len[1] = msg[3];
			// 转换长度
			int msgLen = ChangeUtil.getShort(len, false);
			// 5 响应码 M0001：成功 Exxxx：失败
			// 256 响应信息
			// 读取返回值
			byte[] res = SocketUtil.read(in, msgLen);
			// 读取响应码
			String resCode = new String(res, 0, 5);
			boolean succ = resCode.equals("90000") ? true : false;
			if (!succ) {
				// 读取相应信息
				resMsg = new String(res, 5, 256);
				throw new RuntimeException(resCode + "  -" + resMsg);
			}

		} catch (Exception e) {
			log.error("上传TIPS文件失败，原因" + e.getMessage(), e);
			throw new RuntimeException(e);
		} finally {
			SocketUtil.close(socket);
		}
		return "上传TIPS成功！";
	}

	/**
	 * 报文头部分
	 * 
	 * @return
	 */
	StringBuffer getHeadXml(TipsMsgHead head) {
		// 建行对应的交易码
		String BkTxCode = "";
		if (head.getMsgno().equals("2201")) {
			BkTxCode = "TP2201";
		} else if (head.getMsgno().equals("2202")) {
			BkTxCode = "TP2202";
		}
		// 本交易的请求流水号
		String reqNo = "";
		String tips_req_no = "SEQ_REQ_TIPS_NO_105";
		PbIdGen.genSeqIfNotExists(null, tips_req_no, 000000, 999999, 1, true);
		reqNo = PbUtil.getCurrDateTime()
				+ StringUtil.leftPadCut(PbIdGen.genStrId(tips_req_no), 6, '0');

		// 报文头信息
		StringBuffer headBuffer = new StringBuffer(
				"<?xml version=\"1.0\" encoding=\"GBK\"?><CFX>");
		headBuffer.append("<HEAD>");
		headBuffer.append("<BkTxCode>").append(BkTxCode).append("</BkTxCode>");
		headBuffer.append("<BkPlatDate>").append(PbUtil.getCurrDate())
				.append("</BkPlatDate>");
		headBuffer.append("<BkPlatSeqNo>").append(reqNo)
				.append("</BkPlatSeqNo>");
		headBuffer.append("<BkOldSeq>").append(reqNo).append("</BkOldSeq>");
		// 最初发起业务的建行机构代号：黑龙江建行要求写死，“230002200,230868851”；暂时不对各省建行进行配置
		headBuffer.append("<BkBrchNo>").append("230868851")
				.append("</BkBrchNo>");
		headBuffer.append("<BkTellerNo>")
				.append(StringUtil.leftPadCut(" ", 12, ' '))
				.append("</BkTellerNo>");
		headBuffer.append("<BkPlatTime>").append(PbUtil.getCurrDate("HHmmss"))
				.append("</BkPlatTime>");
		headBuffer.append("<Reserve>").append("</Reserve>");
		headBuffer.append("</HEAD><MSG>");
		return headBuffer;
	}

	/**
	 * 获取TIPS交易流水号（8位），从序列获取
	 * 
	 * @return
	 */
	private String getTipsTraNo() {
		String abc_tips_tra_no = "SEQ_TIPS_TRA_NO_CCB";
		String cityCode = PropertiesHander.getValue("trans", "abc.city.code");
		PbIdGen.genSeqIfNotExists(null, abc_tips_tra_no, 0, 999, 1, true);
		String traNo = PbIdGen.genStrId(abc_tips_tra_no);
		return cityCode + "105" + StringUtils.leftPad(traNo, 3, '0');
	}

	/**
	 * 获取原划款凭证号
	 * 
	 * @return
	 */
	private String getOriCode() {
		String cityCode = PropertiesHander.getValue("trans", "abc.city.code");
		String abc_tips_tra_no = "SEQ_TIPS_ORICODE_CCB";
		PbIdGen.genSeqIfNotExists(null, abc_tips_tra_no, 0, 999, 1, true);
		String traNo = PbIdGen.genStrId(abc_tips_tra_no);
		return cityCode + "105" + StringUtils.leftPad(traNo, 3, '0');
	}

	/**
	 * 获取TIPS交易包号（8位）
	 * 
	 * @return
	 */
	private String getTipsPackNo() {
		// 省市代码
		String cityCode = PropertiesHander.getValue("trans", "abc.city.code");
		String pb_tips_pack_no = "SEQ_TIPS_PACK_NO_CCB";
		StringBuffer strBuffer = new StringBuffer();
		PbIdGen.genSeqIfNotExists(null, pb_tips_pack_no, 0, 999, 1, true);
		String packNo = PbIdGen.genStrId(pb_tips_pack_no);
		strBuffer.append(cityCode).append("105")
				.append(StringUtils.leftPad(packNo, 3, '0'));
		return strBuffer.toString();
	}

	/***
	 * 批量报文头
	 * 
	 * @param sc
	 * @param head
	 * @return
	 */
	StringBuffer getBatchHeadXml(TipsMsgHead head) {
		StringBuffer buffer = new StringBuffer();
		if (head.getMsgno().equals("2201")) {
			buffer.append("<BatchHead2201>");
			buffer.append("<AgentBnkCode>").append(head.getPay_bank_code())
					.append("</AgentBnkCode>").append("<FinOrgCode>")
					.append(head.getBillorg()).append("</FinOrgCode>")
					.append("<TreCode>").append(head.getTrecode())
					.append("</TreCode>").append("<EntrustDate>")
					.append(head.getEntrust_date()).append("</EntrustDate>")
					.append("<PackNo>").append(head.getPageno())
					.append("</PackNo>").append("<AllNum>")
					.append(head.getAllnum()).append("</AllNum>")
					.append("<AllAmt>").append(head.getAllamt())
					.append("</AllAmt>")
					.append("<PayoutVouType>1</PayoutVouType>")
					.append("<PayMode>").append(head.getPay_type_code())
					.append("</PayMode>");
			buffer.append("</BatchHead2201>");
		} else if (head.getMsgno().equals("2202")) {
			buffer.append("<Head2202>");
			buffer.append("<FinOrgCode>").append(head.getBillorg())
					.append("</FinOrgCode>").append("<TreCode>")
					.append(head.getTrecode()).append("</TreCode>")
					.append("<AgentBnkCode>").append(head.getPay_bank_code())
					.append("</AgentBnkCode>").append("<EntrustDate>")
					.append(head.getEntrust_date()).append("</EntrustDate>")
					.append("<PackNo>").append(head.getPageno())
					.append("</PackNo>").append("<AllNum>")
					.append(head.getAllnum()).append("</AllNum>")
					.append("<AllAmt>").append(head.getAllamt())
					.append("</AllAmt>")
					.append("<PayoutVouType>1</PayoutVouType>")
					.append("<PayMode>").append(head.getPay_type_code())
					.append("</PayMode>");
			buffer.append("</Head2202>");
		}
		return buffer;
	}

	@Override
	public String testTips(Session sc, Object o) throws Exception {
		// 创建套接字与服务端连接
		Socket socket = SocketUtil.createSocket(context, true);
		String resMsg = "";
		try {
			// 请求流
			ByteArrayOutputStream baops = new ByteArrayOutputStream();

			// txCode flowIdB为控制部分
			byte[] txCode = PbUtil.string2ByteFull("EVLS", 8);
			baops.write(txCode);

			// // 写入交易ID8个字节
			byte[] flowIdB = PbUtil.string2Byte(getTipsTraNo(), 8);
			baops.write(flowIdB);
			// // 交易码
			baops.write(PbUtil.string2ByteFull("9105", 7));
			// 包流水号
			baops.write(PbUtil.string2ByteFull("00000030", 9));
			// 交易日期
			baops.write(PbUtil.string2ByteFull("20140311", 9));
			// 国库代码
			baops.write(PbUtil.string2ByteFull(
					o.toString().substring(o.toString().length() - 4), 5));

			// 报文体
			byte[] body = baops.toByteArray();

			// 整体数据报文
			ByteArrayOutputStream fullOut = new ByteArrayOutputStream();

			// 添加版本信息
			fullOut.write("1".getBytes("GBK"));
			// 添加控制字符
			// 设置Type位为1（数据报文）
			byte[] ctrl = new byte[1];
			ctrl[0] = 4;
			ctrl[0] |= 1;
			fullOut.write(ctrl);
			// 添加报文长度（2字节）
			fullOut.write(ChangeUtil.short2byte((short) (body.length)));
			// 添加包顺序（4个字节）
			fullOut.write(ChangeUtil.int2bytes(0));

			// 写入报文体信息
			fullOut.write(body);
			log.info("#########请求报文："
					+ new String(fullOut.toByteArray(), "GBK"));
			// 发送数据
			socket.getOutputStream().write(fullOut.toByteArray());
			socket.getOutputStream().flush();

			// 读入流
			InputStream in = socket.getInputStream();
			// 读取前8个字节
			byte[] msg = SocketUtil.read(in, 8);
			// 报文体长度
			byte len[] = new byte[2];
			len[0] = msg[2];
			len[1] = msg[3];
			// 转换长度
			int msgLen = ChangeUtil.getShort(len, false);
			// 5 响应码 M0001：成功 Exxxx：失败
			// 256 响应信息
			// 读取返回值
			byte[] res = SocketUtil.read(in, msgLen);
			// 读取响应码
			String resCode = new String(res, 0, 5);
			boolean succ = resCode.equals("90000") ? true : false;
			if (!succ) {
				// 读取相应信息
				resMsg = new String(res, 5, 256);
				throw new RuntimeException(resCode + "  -" + resMsg);
			}

		} catch (Exception e) {
			log.error("Tips联通测试失败，原因" + e.getMessage(), e);
			throw new RuntimeException(e);
		} finally {
			SocketUtil.close(socket);
		}
		return null;
	}
	
	
	/**
	 * ftp上传文件方法
	 * 
	 * @param localDirectory 本地目录
	 * @param remoteDirectory ftp远程目录
	 * @param fileName 文件名
	 * @return 成功返回-1；否则失败
	 * @throws Exception 
	 */
	public static int upLoadFile(String localDirectory, String remoteDirectory,String fileName) throws Exception {
		int result = 0;
		String remote = remoteDirectory + "/" + fileName;
		String local = localDirectory + "/" + fileName;
		log.info("本地位置："+local);
		log.info("远程位置："+remote);
		try {
			
			if (FtpClientUtil.connect()) {// 连接成功
				// 上传文件
				FtpClientUtil.upload(local, remote);
				
				// 关闭连接
				FtpClientUtil.disconnect();
				result = -1;
			} else{
				log.error("ftp连接失败");
			}
			return result;
		} catch (Exception e) {
			throw new Exception(e.getMessage());
		}
		
	}
	
	public static String createNewNo(Session sc, Object obj) {
		String now = PbUtil.getCurrDate();
		String seqName = "SEQ_PB_TXT";
		try {
			createNewDdSequence(sc, seqName, 9999);
		} catch (Exception ex) {
			throw new RuntimeException(ex);
		}
		long num = IdGen.genNumId(seqName);
		num = num % 1000;
		StringBuffer sb = new StringBuffer();
		String vtCode = PlatformUtils.getProperty(obj, "vt_code").toString();
		if("12".equals(PlatformUtils.getProperty(obj, "pay_type_code").toString())){
			if("2301".equals(vtCode)){
				vtCode ="2303";
			}else if("2302".equals(vtCode)){
				vtCode ="2304";
			}
		}
		
		sb.append(now).append(StringUtils.leftPad(String.valueOf(num), 4, '0'))
		.append(getBizType(vtCode)).append("0");	
		
		return sb.toString();
	}
	public static void updateTipsFileName4ClearVoucher(Session sc, Object obj,String fileName){
		try{
			String clearVoucherCode = PlatformUtils.getProperty(obj, "pay_clear_voucher_code").toString();
			Update update = new Update().table(new Table("pb_pay_clear_voucher"));
			update.set(new Eq("tips_file_name","'"+fileName+"'"));
			String where ="where pay_clear_voucher_code ="+clearVoucherCode;
			StaticApplication.getDaoSupport().executeUpdate(SqlGenerator.generateSql(update)+where);
		}catch(Exception ex){
			throw new PbException("更新划款tips文件名失败");
		}
	}
	/**
	 * 25－直接支付凭证； 26－直接支付退回凭证； 27－授权支付凭证； 28－授权支付退回凭证； 01－直接支付额度通知单；
	 * 02－授权支付额度通知单。 03－实拨拨款单
	 * 
	 * @return
	 */
	private static String getBizType(String vtCode) {
		if (bizMap == null) {
			bizMap = new HashMap<String, String>();
			bizMap.put("2301", "25");
			bizMap.put("2302", "26");
			bizMap.put("2303", "27");
			bizMap.put("2304", "28");
			bizMap.put("5106", "02");
			bizMap.put("5108", "01");
			bizMap.put("52070", "17");
			bizMap.put("52071", "23");
		}
		return bizMap.get(vtCode);
	}
	protected static void createNewDdSequence(Session sc, String seqName,
			int maxValue) throws Exception {
		if (existsSeq.contains(seqName))
			return;
		IdGen.genSeqIfNotExists(sc, seqName, 0, maxValue, 1, false);
		existsSeq.add(seqName);
	}

}
