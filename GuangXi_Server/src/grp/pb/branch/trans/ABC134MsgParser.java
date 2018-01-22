package grp.pb.branch.trans;

import grp.pt.pb.payment.IVoucher;
import grp.pt.pb.trans.model.ABC134MsgHead;
import grp.pt.pb.trans.model.ABC134MsgResBody;
import grp.pt.pb.trans.model.MsgHead;
import grp.pt.pb.trans.model.MsgParser;
import grp.pt.pb.trans.model.MsgReqBody;
import grp.pt.pb.trans.model.MsgResBody;
import grp.pt.pb.trans.model.TransResConfig;
import grp.pt.pb.trans.model.TransResManager;
import grp.pt.pb.trans.util.CTGTool;
import grp.pt.pb.trans.util.Context;
import grp.pt.pb.util.Base64;
import grp.pt.pb.util.PbUtil;
import grp.pt.pb.util.TradeConstant;
import grp.pt.pb.util.XmlUtils;
import grp.pt.util.PlatformUtils;
import grp.pt.util.StringUtil;
import grp.pt.util.exception.CommonException;
import grp.pt.workflow.bs.WorkflowRunService;

import java.io.ByteArrayOutputStream;
import java.util.List;

import org.apache.log4j.Logger;
import org.dom4j.Document;
import org.dom4j.DocumentHelper;
import org.dom4j.Element;

public class ABC134MsgParser  extends MsgParser {
	
	private static Logger logger = Logger.getLogger(WorkflowRunService.class.getName());
	
	/***
	 * 拼装请求报文
	 */
	public MsgReqBody newMessage(IVoucher t,TransResManager resManager,Object ...objects) throws Exception {
		
		return new ABC134MsgReqBody(t, resManager,objects);
	}


	@Override
	public MsgResBody newMessage(Object... objects) throws Exception {
	
		return new ABC134MsgResBody(objects);
	}
	

	/***
	 * 解析上送报文
	 */
	@Override
	public MsgHead parseReqHead(byte[] headBytes) throws Exception {
		throw new Exception("暂未实现！");
	}
	
	
	
	/***
	 * 解析回执报文
	 * @param msgBytes
	 * @param m
	 * @return
	 * @throws Exception
	 */
   public MsgResBody parseResContent(byte[] msgBytes,TransResManager m) throws Exception{
    	if(m.getField_type().equals("xml")){
    		return parseXML(msgBytes,m);
    	}
    	return null;
	}
   
   
   /***
    * 发送并处理回执信息
    */
	@Override
	public byte[] sendMessage(TransResManager m, Context context, IVoucher t,Object...objects)
			throws Exception {
		byte[] msgBytes = null;
		try {
			if(m==null){
				throw new  Exception("转账配置信息为空,无法往下执行!");
			}
			// 1、拼装报文
			MsgReqBody msgBody = this.newMessage(t, m);
			ByteArrayOutputStream byteOut = new ByteArrayOutputStream();
			if(m.getField_type().equals("xml")){
				ByteArrayOutputStream message = new ByteArrayOutputStream();
					int transChannel = (Integer) PlatformUtils.getProperty(t, "transChannel");
					//电子渠道
					if( transChannel == TradeConstant.EBANK_CHANNEL){
						message.write("1000000".getBytes());
						message.write(m.getCode().replace("_QUERY", "").trim().getBytes());
						message.write("        1101114388                                                    ".getBytes());
					}//柜面渠道   xml报文前添加"00"
					else if(transChannel == TradeConstant.MANUAL_CHANNEL ){
						message.write("00".getBytes());
					}
				message.write(msgBody.readReqMsgBody());
				logger.info("上送完整报文：【"+new String(message.toString())+"】");
				byteOut.write(message.toByteArray());
			}else{
				throw new Exception("报文类型：" + m.getField_type() + "未实现！");
			}
			// 2、调核心
			logger.info("核心接口调用开始，时间："+PbUtil.getCurrLocalDateTime());
			if(context.getTransferType().equalsIgnoreCase("CICS")){
				//CICS方式调用
				msgBytes = CTGTool.communicateWithCicsParam(byteOut.toByteArray());
			}
			else {
				throw new Exception(context.getTransferType() + "调用方法未实现！");
			}
			if(msgBytes==null){
				throw new CommonException("返回异常！");
			}
			if(context.getTransferType().equalsIgnoreCase("CICS")){
				if(Integer.valueOf(PlatformUtils.getProperty(t, "transChannel").toString()) == TradeConstant.EBANK_CHANNEL){
					return new String(msgBytes).substring(85).getBytes();
				}else{//柜面渠道
					return msgBytes;
				}
				
			}else{
				String[] returnMsg = new String(msgBytes).split(",");
				byte [] message = null;
				if(returnMsg[0].equals("0")){
					message = Base64.decode(returnMsg[1].getBytes());
					logger.info("核心接口调用成功，返回报文长度：" + message.length + " ,返回报文:\n"+ new String(message));
				}else{
					logger.info("核心接口调用失败！");
					throw new CommonException("调银行核心接口失敗，返回消息：" + new String(Base64.decode(returnMsg[1].getBytes())));
				}
				logger.info("核心接口调用结束，时间：" + PbUtil.getCurrLocalDateTime());
				return message;
			}
			
		}catch(Exception ex){
			throw new Exception(ex.getMessage());
		}
	}
   
   
   /***
    * 解析xml
    * @param msgBytes
    * @param m
    * @return
    * @throws Exception
    */
   MsgResBody parseXML(byte[] msgBytes,TransResManager m) throws Exception{
    	logger.info("解析回执XML报文开始......"+new String(msgBytes));
    	MsgResBody msgResBody = new ABC134MsgResBody();
    	MsgHead msgHead = new ABC134MsgHead();
    	//TODO:对回执报文特殊处理
    	
		Document document=DocumentHelper.parseText((new String(msgBytes)).trim().replaceAll("94帐号", "JS帐号").replaceAll("94帐号省市代码", "JS帐号省市代码"));
		Element root=document.getRootElement();
		List<Element> list=root.selectNodes("descendant::*");
		List<TransResConfig> configList = m.getResConfigList();
		
		String returnMsg = "";
		
		for(int i=0;i<list.size();i++){
			Element e=list.get(i);
			if (XmlUtils.hasChildElement(e)) {
				for (TransResConfig c : configList) {
					if(e.getName().equals(c.getField_name())){
						logger.info(e.getName() + ":" + e.getText());
						if(c.getDto_name()!=null){
							try{
								//对返回码做特殊处理，否则会取默认值“0"，导致交易总会成功
								if(c.getDto_name().equals("respcode") && e.getText().equals("0000")){//交易成功
									PlatformUtils.setProperty(msgResBody, "resStatus" ,  0);
								}else if(c.getDto_name().equals("respcode") && !e.getText().equals("0000")){
									PlatformUtils.setProperty(msgResBody, "resStatus" ,  1);
								}else{
									PlatformUtils.setProperty(msgResBody, c.getDto_name() ,  e.getText());
								}
							}catch(Exception ex){
								PlatformUtils.setProperty(msgHead, e.getName() ,  e.getText());
							}
						}
						break;
					}
				}
				//xcg 2015-8-28 16:24:38
				if(e.getName().equals("respcode") && !e.getText().equals("0000")){
					returnMsg = e.getText()+","+returnMsg;
				}
				if(e.getName().equals("返回信息")){
					returnMsg = returnMsg+e.getText();
				}
				if(e.getName().equals("respmsg") && !StringUtil.isEmpty(e.getText())){
					returnMsg = e.getText()+","+returnMsg;
				}
			}
		}
		msgResBody.setResMsg(returnMsg);
		msgResBody.setResHead(msgHead);
		return msgResBody;
    }


@Override
public MsgHead parseResHead(byte[] headBytes) throws Exception {
	// TODO Auto-generated method stub
	return null;
}
}
