package grp.pb.branch.gxboc.service;

import grp.pt.pb.trans.util.MsgConstant;
import grp.pt.pb.trans.util.TransUtil;
import grp.pt.util.exception.CommonException;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

import org.apache.log4j.Logger;

/***
 * 
 * 请求报文体
 *
 */
public class GXBOCBLMsgReqBody extends MsgReqBody {
	
	private static Logger logger = Logger.getLogger(GXBOCBLMsgReqBody.class);
	
	// 当前请求报文体
	private byte[] msgBody;

	@Override
	public byte[] readReqMsgBody() {
		return msgBody;
	}
	
	
	/***
	 * 无参构造方法
	 */
	public GXBOCBLMsgReqBody() {
	}

	public GXBOCBLMsgReqBody(Object...objects) {
		super(objects);
		if(objects==null || objects.length==0 || objects[0]==null){
			throw new CommonException("报文类型不能为空！"); 
		}
		// 第一个参数是转账类型
		this.setTranType(objects[0].toString());
		// 除了凭证信息，接口传的参数
		Object[] objs = new Object[objects.length - 1];
		for (int i = 1; i < objects.length; i++) {
			objs[i - 1] = objects[i];
		}
		// 2000
		if (this.getTranType().equalsIgnoreCase(MsgConstant.GXBOC_VOU_UNCF_LOAD)) {
			try {
				this.msgBody = readRefReqMsgBody();
			} catch (IOException e) {
				throw new CommonException("拼装待确认支付凭证列表下载请求报文体失败,原因：" + e.getMessage()); 
			}
		}
		this.setReqHead(new GXBOCBLMsgHead(msgBody.length + MsgConstant.GXBOC_REQHEADLEN,objects[0]+"","","",0,"2014","430000","1","1"));
	}


	/**
	 * @Description: TODO(拼装请求报文体)
	 * @return: byte[]
	 * @author: 柯伟
	 * @date: 2014-5-30 下午5:07:55
	 */
	public byte[] readRefReqMsgBody()  throws IOException{
		ByteArrayOutputStream byteOut = new ByteArrayOutputStream();
		byteOut.write(TransUtil.getRegionBytes("204","零余额账号",this.getObjs()[1].toString(), 32));
		byteOut.write(TransUtil.getRegionBytes("205","支付凭证号",this.getObjs().length>2?this.getObjs()[2].toString():"", 42));
		return byteOut.toByteArray();
	}
	
}
