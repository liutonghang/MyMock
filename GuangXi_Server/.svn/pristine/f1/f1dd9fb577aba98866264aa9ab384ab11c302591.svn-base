package grp.pb.branch.trans;

import grp.pt.idgen.IdGen;
import grp.pt.pb.payment.IVoucher;
import grp.pt.pb.payment.TransRealAccount;
import grp.pt.pb.trans.model.MsgReqBody;
import grp.pt.pb.trans.model.TransResConfig;
import grp.pt.pb.trans.model.TransResManager;
import grp.pt.pb.util.ChangeUtil;
import grp.pt.pb.util.XmlUtils;
import grp.pt.util.PlatformUtils;
import grp.pt.util.StringUtil;
import grp.pt.util.exception.CommonException;
import grp.pt.workflow.bs.WorkflowRunService;

import java.text.SimpleDateFormat;
import java.util.Date;

import org.apache.log4j.Logger;
import org.dom4j.Document;
import org.dom4j.DocumentHelper;

public class ABC134MsgReqBody extends MsgReqBody {

	private static Logger log = Logger.getLogger(WorkflowRunService.class.getName());

	// 当前请求报文体
	private byte[] msgBody;

	@Override
	public byte[] readReqMsgBody() {
		return msgBody;
	}

	/***
	 * 无参构造方法
	 */
	public ABC134MsgReqBody() { }
	

	/***
	 * 
	 * @param t
	 * @param resManager
	 * @param objects
	 */
	public ABC134MsgReqBody(IVoucher t,TransResManager resManager,Object ...objects) {
		//设置转账报文适配对象
		this.setResManager(resManager);
		this.setVoucher(t);
		try {
			if (resManager.getField_type().equals("txt")) {
				this.msgBody = super.readTXTReqBody();
				// 当前请求日期
				String now = new SimpleDateFormat("yyyyMMddhhmmss").format(new Date());
				String transId = PlatformUtils.getProperty(t,"agent_business_no").toString();
			} else if (resManager.getField_type().equals("xml")) {

				Document document = DocumentHelper.createDocument();
				String now = new SimpleDateFormat("yyyyMMdd HHmmss").format(new Date());
				XmlUtils.createXMLByXPath(document, "/ap/MsgType", "01");
				XmlUtils.createXMLByXPath(document, "/ap/ReqDate", now.substring(0, 8));
				XmlUtils.createXMLByXPath(document, "/ap/ReqTime", now.substring(8).trim());
				XmlUtils.createXMLByXPath(document, "/ap/TransCode", resManager.getCode().substring(0,4));
				XmlUtils.createXMLByXPath(document, "/ap/ReqId", PlatformUtils.getProperty(t, "transReqId").toString());
				XmlUtils.createXMLByXPath(document, "/ap/ReqSeqNo",getReqSeqNo(PlatformUtils.getProperty(t, "city_code").toString()));
				document.setXMLEncoding("GBK");
				for (TransResConfig g : resManager.getReqConfigList()) {
					String value = "";
					if (!StringUtil.isEmpty(g.getDefaule_value())&&!" ".equals(g.getDefaule_value())) {
						value = g.getDefaule_value();
					} else if (g.getDto_name() != null) {
						if (specialFields().contains(g.getDto_name())) {
							TransRealAccount transAcct = (TransRealAccount) PlatformUtils.getProperty(voucher, "transRealAccount");
							value = PlatformUtils.getProperty(transAcct, g.getDto_name()) == null ? "" : PlatformUtils
									.getProperty(transAcct, g.getDto_name()).toString();
						} else if (PlatformUtils.getProperty(voucher, g.getDto_name()) == null) {
							log.info("配置编码为：" + resManager.getCode() + "对应的dto字段"
									+ g.getDto_name() + ",没有找到相应的值");
						} else {
							value = PlatformUtils.getProperty(voucher, g.getDto_name()).toString();
						}
					}
					XmlUtils.createXMLByXPath(document, g.getField_name(), value.trim());
				}
				
				this.msgBody = document.getRootElement().asXML().getBytes();
			}
			log.info(resManager.getField_type() + "message:" + new String(msgBody));
		} catch (Exception e) {
			throw new CommonException(e);
		}
	}
	
	
	/**
	 * 生成请求交易流水号
	 * 根据交易类型的不同，流水号也不同
	 * @param transType
	 * @return
	 */
	private String getReqSeqNo(String cityCode){
		StringBuffer reqSeqNoSb = new StringBuffer();
		reqSeqNoSb.append(cityCode);
		String id = IdGen.genStrId("SEQ_TRANS_LOG_ID");
		if( id.length()>10 ){
			id = id.substring(id.length()-10);
		}else{
			id = ChangeUtil.getFixlenStr(id, 10);
		}
		reqSeqNoSb.append(id);
		return reqSeqNoSb.toString();
	}

	

//	public HuNanABCMsgReqBody(Object o,String userCode,String tellerCode,TransResManager resMsg) {
//		try {
//			this.msgBody = getMessageBytes(o, userCode,tellerCode,resMsg);
//		} catch (Exception e) {
//			throw new CommonException(e);
//		}
//	}
//
//	
//	public byte[] getMessageBytes(Object o,String userCode,String tellerCode,TransResManager resMsg) throws Exception {
//		ByteArrayOutputStream byteOut = new ByteArrayOutputStream();
//		List<TransResConfig> reqConfigList = resMsg.getReqConfigList();
//		// 账户的特殊处理
//		ArrayList<String> array = getAcct();
//		if (resMsg.getField_type().equals("txt")) {
//			for (TransResConfig t : reqConfigList) {
//				if (t.getDefaule_value() != null) {
//					byteOut.write(MessageUtil.getFixlenStrBytesByAddSpace(t.getDefaule_value(), t.getField_length()));
//				}else if (t.getDto_name() != null) {
//					Object o1 = PlatformUtils.getProperty(o, t.getDto_name());
//					if (array.contains(t.getDto_name())) {
//						TransRealAccount transAcct = (TransRealAccount) PlatformUtils.getProperty(o, "transRealAccount");
//						Object value = PlatformUtils.getProperty(transAcct, t.getDto_name());
//						byteOut.write(MessageUtil.getFixlenStrBytesByAddSpace(value==null?"":value.toString(),t.getField_length()));
//					} else if (t.getField_type().equalsIgnoreCase("int") || t.getField_type().equalsIgnoreCase("short")) {
//						byteOut.write(MessageUtil.getFixlenStrBytesByAddSpace(o1 == null ? "0": o1 + "", t.getField_length()));
//					} else if (t.getField_type().equalsIgnoreCase("double")) {
//						byteOut.write(MessageUtil.getFixlenStrBytesByAddSpace(o1 == null ? "0.00" : o1+"", t.getField_length()));
//					} else {
//						byteOut.write(MessageUtil.getFixlenStrBytesByAddSpace(o1 == null ? "" : o1+"", t.getField_length()));
//					}
//				}else {
//					byteOut.write(MessageUtil.getFixlenStrBytesByAddSpace(" ", t.getField_length()));
//				}
//			}
//			// 当前请求日期
//			String now = new SimpleDateFormat("yyyyMMddhhmmss").format(new Date());
//			String transId = PlatformUtils.getProperty(o,"agent_business_no").toString();
//			this.setReqHead(new HuNanABCMsgHead(new CTIAReqHead(userCode,tellerCode,resMsg.getCode().replace("_QUERY", "").trim(), transId, now.substring(0, 8), now.substring(8), "", "")));
//			log.info("txt message:" + new String(byteOut.toByteArray()));
//			return byteOut.toByteArray();
//		} else if (resMsg.getField_type().equals("xml")) {
//			Document document = DocumentHelper.createDocument();
//			document.setXMLEncoding("GBK");
//			String now = new SimpleDateFormat("yyyyMMdd HHmmss").format(new Date());
//			XmlUtils.createXMLByXPath(document, "/ap/MsgType", "01");
//			XmlUtils.createXMLByXPath(document, "/ap/ReqDate", now.substring(0, 8));
//			XmlUtils.createXMLByXPath(document, "/ap/ReqTime", now.substring(8).trim());
//			XmlUtils.createXMLByXPath(document, "/ap/ReqType", "01");
//			XmlUtils.createXMLByXPath(document, "/ap/ReqId", "01000000");
//			XmlUtils.createXMLByXPath(document, "/ap/ReqSeqNo", getReqSeqNo());
//			for (TransResConfig t : reqConfigList) {
//				String value = "";
//				if(StringUtil.isNotEmpty(t.getDefaule_value())){
//					value = t.getDefaule_value();
//				}else if(t.getDto_name()!=null){
//					if (array.contains(t.getDto_name())) {
//						TransRealAccount transAcct = (TransRealAccount) PlatformUtils.getProperty(o, "transRealAccount");
//						value = PlatformUtils.getProperty(transAcct, t.getDto_name()) == null?"" : PlatformUtils.getProperty(transAcct, t.getDto_name()).toString();
//					}else if(PlatformUtils.getProperty(o, t.getDto_name())==null){
//						log.info("配置编码为：" + resMsg.getCode()+"对应的dto字段" + t.getDto_name()+",没有找到相应的值");
//					}else{
//						value = PlatformUtils.getProperty(o, t.getDto_name()).toString();
//					}
//				}
//				XmlUtils.createXMLByXPath(document, t.getField_name(),value);
//			}
//			log.info("xml message:" + document.getRootElement().asXML());
//			return document.getRootElement().asXML().getBytes();
//		}
//		return null;
//	}
	
//	/**
//	 * 生成请求交易流水号
//	 * 根据交易类型的不同，流水号也不同
//	 * @param transType
//	 * @return
//	 */
//	private String getReqSeqNo(){
//		StringBuffer reqSeqNoSb = new StringBuffer();
//		reqSeqNoSb.append("18");
//		String id = IdGen.genStrId("SEQ_TRANS_LOG_ID");
//		if( id.length()>10 ){
//			id = id.substring(id.length()-10);
//		}else{
//			id = ChangeUtil.getFixlenStr(id, 10);
//		}
//		reqSeqNoSb.append(id);
//		return reqSeqNoSb.toString();
//	}



//	public ArrayList<String> getAcct() {
//		ArrayList<String> array = new ArrayList<String>();
//		array.add("transPayAccountNo");
//		array.add("transPayAccountName");
//		array.add("transPayAccountBank");
//		array.add("transPayeeAccountName");
//		array.add("transPayeeAccountNo");
//		array.add("transPayeeAccountNo");
//		array.add("transPayeeAccountBank");
//		return array;
//	}
	


}
