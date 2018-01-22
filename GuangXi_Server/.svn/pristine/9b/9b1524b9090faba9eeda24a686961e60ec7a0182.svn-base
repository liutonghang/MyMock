package grp.pb.branch.gxboc.service;

import grp.pt.pb.payment.IVoucher;
import grp.pt.pb.payment.TransRealAccount;
import grp.pt.pb.trans.util.TransUtil;
import grp.pt.pb.util.XmlUtils;
import grp.pt.util.PlatformUtils;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.ArrayList;

import org.apache.log4j.Logger;
import org.dom4j.Document;
import org.dom4j.DocumentHelper;

/*******************************************************************************
 * 请求报文体(公用的)
 * 
 * @author zhouqi
 * 
 */
public abstract class MsgReqBody {
	
	private static Logger logger = Logger.getLogger(MsgReqBody.class);

	// 业务层接口,主要用于转账、交易状态查询,指定账户查询余额,行号查询
	protected IVoucher voucher;
	
	// 请求报文头
	private MsgHead reqHead;

	// 转账配置信息
	private TransResManager resManager;
	
	//转账类型
	private String tranType;

	// 属性数组
	private Object[] objs;

	/***
	 * 无参构造方法
	 */
	public MsgReqBody() { }
	
	public MsgReqBody(Object... objects) { 
		this.objs = objects;
	}

	/***
	 * 构造方法
	 * 
	 * @param t
	 * @param objects
	 */
	public MsgReqBody(IVoucher t, TransResManager resManager,Object... objects) {
		this.voucher = t;
		this.resManager = resManager;
		this.objs = objects;
	}
	

	/***************************************************************************
	 * 获取请求报文头
	 * 
	 * @return
	 */
	public byte[] readReqHead() throws IOException {
		return reqHead.readReqHead();
	}
	
	/***************************************************************************
	 * 获取请求报文体
	 * 
	 * @return
	 */
	public abstract byte[] readReqMsgBody();
	
	
	
	/***
	 * txt报文
	 * @return
	 * @throws IOException
	 */
	public byte[] readTXTReqBody() throws IOException {
		ByteArrayOutputStream byteOut = new ByteArrayOutputStream();
		for (TransResConfig t : resManager.getResConfigList()) {
			if (t.getDefaule_value() != null) {
				byteOut.write(TransUtil.getFixlenStrBytesByAddSpace(t.getDefaule_value(), t.getField_length()));
				logger.info("报文字段"+ t.getField_name()+",值：" + t.getDefaule_value());
			}else if (t.getDto_name() != null) {
				Object o1 = PlatformUtils.getProperty(voucher, t.getDto_name());
				if (specialFields().contains(t.getDto_name())) {
					TransRealAccount transAcct = (TransRealAccount) PlatformUtils.getProperty(voucher, "transRealAccount");
					Object value = PlatformUtils.getProperty(transAcct, t.getDto_name());
					byteOut.write(TransUtil.getFixlenStrBytesByAddSpace(value==null?"":value.toString(),t.getField_length()));
				} else if (t.getField_type().equalsIgnoreCase("int") || t.getField_type().equalsIgnoreCase("short")) {
					byteOut.write(TransUtil.getFixlenStrBytesByAddSpace(o1 == null ? "0": o1 + "", t.getField_length()));
				} else if (t.getField_type().equalsIgnoreCase("double")) {
					byteOut.write(TransUtil.getFixlenStrBytesByAddSpace(o1 == null ? "0.00" : o1+"", t.getField_length()));
				} else {
					byteOut.write(TransUtil.getFixlenStrBytesByAddSpace(o1 == null ? "" : o1+"", t.getField_length()));
				}
				logger.info("报文字段"+ t.getField_name()+",值：" + t.getDefaule_value());
			}else {
				byteOut.write(TransUtil.getFixlenStrBytesByAddSpace(" ", t.getField_length()));
			}
		}
		return byteOut.toByteArray();
	}
	
	/***
	 * XML报文
	 * @return
	 * @throws IOException
	 */
	public Document readXMLReqBody() throws IOException {
		Document document = DocumentHelper.createDocument();
		document.setXMLEncoding("GBK");
		for (TransResConfig t : resManager.getReqConfigList()) {
			String value = "";
			if (t.getDefaule_value()!=null && !"".equals(t.getDefaule_value())) {
				value = t.getDefaule_value();
			} else if (t.getDto_name() != null) {
				if (specialFields().contains(t.getDto_name())) {
					TransRealAccount transAcct = (TransRealAccount) PlatformUtils.getProperty(voucher, "transRealAccount");
					value = PlatformUtils.getProperty(transAcct, t
							.getDto_name()) == null ? "" : PlatformUtils
							.getProperty(transAcct, t.getDto_name()).toString();
				} else if (PlatformUtils.getProperty(voucher, t.getDto_name()) == null) {
					logger.info("配置编码为：" + resManager.getCode() + "对应的dto字段"
							+ t.getDto_name() + ",没有找到相应的值");
				} else {
					value = PlatformUtils.getProperty(voucher, t.getDto_name()).toString();
				}
			}
			XmlUtils.createXMLByXPath(document, t.getField_name(), value);
		}
		return document;
	}

	
	/***
	 * 账户特殊字段处理
	 * @return
	 */
	public ArrayList<String> specialFields(){
		ArrayList<String> array = new ArrayList<String>();
		array.add("transPayAccountNo");
		array.add("transPayAccountName");
		array.add("transPayAccountBank");
		array.add("transPayeeAccountName");
		array.add("transPayeeAccountNo");
		array.add("transPayeeAccountNo");
		array.add("transPayeeAccountBank");
		return array;
	}
	
	
	public IVoucher getVoucher() {
		return voucher;
	}

	public void setVoucher(IVoucher voucher) {
		this.voucher = voucher;
	}
	
	public MsgHead getReqHead() {
		return reqHead;
	}

	public void setReqHead(MsgHead reqHead) {
		this.reqHead = reqHead;
	}

	public TransResManager getResManager() {
		return resManager;
	}

	public void setResManager(TransResManager resManager) {
		this.resManager = resManager;
	}
	
	public String getTranType() {
		return tranType;
	}

	public void setTranType(String tranType) {
		this.tranType = tranType;
	}
	
	public Object[] getObjs() {
		return objs;
	}

	public void setObjs(Object[] objs) {
		this.objs = objs;
	}
}
