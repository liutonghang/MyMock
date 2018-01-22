package grp.pb.branch.gxboc.service;

import grp.pt.pb.exception.PbException;
import grp.pt.pb.payment.IVoucher;
import grp.pt.pb.trans.util.MsgConstant;
import grp.pt.pb.trans.util.SocketUtil;
import grp.pt.util.PlatformUtils;
import grp.pt.util.StringUtil;

import java.io.InputStream;

import org.apache.log4j.Logger;

/***
 * 报文处理类
 *
 */
public class GXBOCBLMsgParser extends MsgParser {
	
	private static Logger logger = Logger.getLogger(GXBOCBLMsgParser.class);
	
	/**
	 * 响应报文体
	 */
	MsgResBody msgResBody = null;
	@Override
	public MsgReqBody newMessage(IVoucher t, TransResManager config,
			Object... objects) throws Exception {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public MsgResBody newMessage(Object... objects) throws Exception {
		msgResBody = new GXBOCBLMsgResBody(objects);
		return msgResBody;
	}

	
	/***
	 * 解析请求报文头
	 */
	@Override
	public MsgHead parseReqHead(byte[] headBytes) throws Exception {
		int msgLen = Integer.parseInt(new String(headBytes, 0, 5).trim());
		String tradeCode = new String(headBytes, 5, 4).trim();
		String bank_no = new String(headBytes, 9, 10).trim();
		String operator = new String(headBytes, 19, 10).trim();
		String num = new String(headBytes, 29, 2).trim();
		num = StringUtil.isEmpty(num)==true?"-1":num;
		String year = new String(headBytes, 31, 4).trim();
		String admdiv_code = new String(headBytes, 35, 9).trim();
		String vt_type = new String(headBytes, 44, 1).trim();
		String set_mode = new String(headBytes, 45, 1).trim();	

		return new GXBOCBLMsgHead(msgLen, tradeCode, bank_no, operator, Integer
				.parseInt(num), year, admdiv_code, vt_type, set_mode);
	}
	
	/**
	 * @Title: parseReqContent
	 * @Description: 解析请求报文体
	 * @author: 柯伟
	 * @date: 2014-5-27 下午2:21:15
	 */
	public MsgReqBody parseReqContent(InputStream in, MsgHead reqHead)
			throws Exception {
		if(reqHead.getTradeCode().equals(MsgConstant.GXBOC_NETWORK_USER_QUERY)){
			logger.info("网点账户权限列表查询没有报文体！");
			return null;
		}
		GXBOCBLMsgReqBody reqBody = new GXBOCBLMsgReqBody();
		int msgBodyLen = reqHead.getMsgLen() - MsgConstant.GXBOC_REQHEADLEN;
		byte[] bodyBytes = SocketUtil.read(in, msgBodyLen);
		logger.info("GXBOC bodyMessage：" + new String(bodyBytes,"GBK"));
		Object[] objs = null;
		if(reqHead.getTradeCode().equalsIgnoreCase(MsgConstant.GXBOC_VOU_UNCF_LOAD)){
			//零余额账号+支付凭证号
			objs = new Object[2];
		}else if(reqHead.getTradeCode().equalsIgnoreCase(MsgConstant.GXBOC_VOU_SURE_BACK)){
			//报文体可能存在多
			int num= Integer.parseInt(PlatformUtils.getProperty(reqHead, "num").toString());
			objs = new Object[num*14];
		}else if(reqHead.getTradeCode().equalsIgnoreCase(MsgConstant.GXBOC_VOU_QUERY)){
			objs = new Object[7];
		}else if(reqHead.getTradeCode().equalsIgnoreCase(MsgConstant.GXBOC_VOU_BACK)){
			objs = new Object[6];
		}else if(reqHead.getTradeCode().equalsIgnoreCase(MsgConstant.GXBOC_VOU_HISTORY_BACK)){
			objs = new Object[6];
		}else if(reqHead.getTradeCode().equalsIgnoreCase(GXBOCBLConstant.GXBOC_VOUCHER_QUREY)){
			objs = new Object[7];
		}else if(reqHead.getTradeCode().equalsIgnoreCase(GXBOCBLConstant.GXBOC_WAITCLEAR_REFUND_VOUCHER_QUERY)){
			objs = new Object[3];
		}else if(reqHead.getTradeCode().equalsIgnoreCase(GXBOCBLConstant.GXBOC_REPEAL_REFUND_VOUCHER)){
			objs = new Object[1];
		}else if(reqHead.getTradeCode().equalsIgnoreCase(GXBOCBLConstant.GXBOC_VOU_ACCREDIT_ED)){
			objs = new Object[1];
		}else {
			throw new PbException("请求报文类型：" + reqHead.getTradeCode() + ",没有找到交易类型！");
		}
		int j = 5; // 域名和长度
		for (int i = 0; i < objs.length; i++) {
			int len = Integer.parseInt(new String(bodyBytes, j - 2, 2,"GBK").trim());
			objs[i] = new String(bodyBytes, j, len,"GBK").trim();
			j = j + len + 5;
		}
		reqBody.setObjs(objs);
		reqBody.setReqHead(reqHead);
		return reqBody;
	}
	
	/***
	 * 解析回执报文体
	 */
	@Override
	public MsgResBody parseResContent(byte[] message, TransResManager m)
			throws Exception {
		// TODO Auto-generated method stub
		return null;
	}

	/***
	 * 解析回执报文头
	 */
	@Override
	public MsgHead parseResHead(byte[] headBytes) throws Exception {
		// TODO Auto-generated method stub
		return null;
	}
}
