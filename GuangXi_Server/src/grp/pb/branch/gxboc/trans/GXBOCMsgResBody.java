package grp.pb.branch.gxboc.trans;

import grp.pt.pb.trans.model.MsgResBody;
import grp.pt.pb.trans.util.MsgConstant;
import grp.pt.pb.trans.util.TransUtil;
import grp.pt.util.exception.CommonException;

import java.io.ByteArrayOutputStream;
import java.io.IOException;



/***
 * 湖南建行响应报文
 * @author zhouqi
 *
 */
public class GXBOCMsgResBody extends MsgResBody {
	
	// 当前响应报文体
	private byte[] msgBody;
	

	@Override
	public byte[] readResMsgBody() {
		return msgBody;
	}
	
	/***
	 * 无参构造方法
	 */
	public GXBOCMsgResBody() {}
	
	/***
	 * 
	 * @param objects
	 */
	public GXBOCMsgResBody(Object...objects) {
		super(objects);
		if(objects==null || objects.length==0 || objects[0]==null){
			throw new CommonException("凭证类型不能为空！"); 
		}
		// 第一个参数是转账类型
		this.setTranType(objects[0].toString());
		// 除了凭证信息，接口传的参数
		Object[] objs = new Object[objects.length - 1];
		for (int i = 1; i < objects.length; i++) {
			objs[i - 1] = objects[i];
		}
		this.setObjs(objs);
		// 转账
		if (this.getTranType().equalsIgnoreCase(MsgConstant.PAYTRANS_TRACODE)) {
			try {
				this.msgBody = transBytes();
			} catch (IOException e) {
				throw new CommonException("拼装交易状态查询响应报文体失败,原因：" + e.getMessage());
			}
		// 交易状态查询交易码
		}else if(this.getTranType().equalsIgnoreCase(MsgConstant.QUERY_TRADESTATUS_TRACODE)){
			try {
				this.msgBody = queryTransBytes();
			} catch (IOException e) {
				throw new CommonException("拼装交易状态查询响应报文体失败,原因：" + e.getMessage());
			}
		// 指定日期查询流水交易码
		}else if(this.getTranType().equalsIgnoreCase(MsgConstant.QUERY_BANKFLOW_TRACODE)){
			try {
				this.msgBody = querySerialnoBytes();
			} catch (IOException e) {
				throw new CommonException("拼装指定日期查询流水响应报文体失败,原因：" + e.getMessage());
			}
		// 用户验证码
		}else if(this.getTranType().equalsIgnoreCase(MsgConstant.QUERY_USERCODE)){
			try {
				this.msgBody = queryUserBytes();
			} catch (IOException e) {
				throw new CommonException("拼装行号查询响应报文体失败,原因：" + e.getMessage());
			}
		}else if(this.getTranType().equalsIgnoreCase(MsgConstant.QUERY_ACCTBALANCE_TRACODE)){
			try {
				this.msgBody = queryBalanceBytes();
			} catch (IOException e) {
				throw new CommonException("拼装行号查询响应报文体失败,原因：" + e.getMessage());
			}
		}
		this.setResHead(new GXBOCMsgHead(msgBody.length+ MsgConstant.RESHEADLEN, this.getTranType(), this.getObjs()[0].toString(),0, this.getObjs()[1].toString(), 0));
	}
	
	/***
	 * 获取用户验证码
	 * @return
	 * @throws IOException
	 */
	private byte[] queryUserBytes() throws IOException {
		ByteArrayOutputStream byteOut = new ByteArrayOutputStream();
		byteOut.write(TransUtil.getRegionBytes("012", "响应信息",this.getObjs()[2].toString(), 32));
		byteOut.write(TransUtil.getRegionBytes("176", "校验码", this.getObjs()[3].toString(),16));
		return byteOut.toByteArray();
	}
	
	
	/***
	 * 指定日期查询流水
	 * @return
	 * @throws IOException
	 */
	private byte[] querySerialnoBytes() throws IOException {
		ByteArrayOutputStream byteOut = new ByteArrayOutputStream();
		byteOut.write(TransUtil.getRegionBytes("012", "响应信息",this.getObjs()[2].toString(), 40));
		byteOut.write(TransUtil.getRegionBytes("299", "总成功笔数", this.getObjs()[3].toString()+"",8));
		byteOut.write(TransUtil.getRegionBytes("097", "总成功金额", this.getObjs()[4].toString()+"",18));
		byteOut.write(TransUtil.getRegionBytes("871", "文件名称", this.getObjs()[5].toString()+"",99));
		//TODO 文件存放
		return byteOut.toByteArray();
	}
	
	/***
	 * 交易状态查询
	 * @return
	 * @throws IOException
	 */
	private byte[] queryTransBytes() throws IOException {
		ByteArrayOutputStream byteOut = new ByteArrayOutputStream();
		byteOut.write(TransUtil.getRegionBytes("012", "响应信息",this.getObjs()[2].toString(), 40));
		byteOut.write(TransUtil.getRegionBytes("090", "交易结果标志", this.getObjs()[3].toString()+"",2));
		return byteOut.toByteArray();
	}
	
	/***
	 * 转账
	 * @return
	 * @throws IOException
	 */
	private byte[] transBytes() throws IOException {
		ByteArrayOutputStream byteOut = new ByteArrayOutputStream();
		byteOut.write(TransUtil.getRegionBytes("012", "响应信息",this.getObjs()[2].toString(), 40));
		byteOut.write(TransUtil.getRegionBytes("020", "核心记帐流水号", this.getObjs()[3].toString(),20));
		byteOut.write(TransUtil.getRegionBytes("058", "核心记帐日期", this.getObjs()[4].toString(),8));
		return byteOut.toByteArray();
	}
	
	private byte[] queryBalanceBytes()throws IOException {
		ByteArrayOutputStream byteOut = new ByteArrayOutputStream();
		byteOut.write(TransUtil.getRegionBytes("012", "响应信息",this.getObjs()[2].toString(), 40));
		byteOut.write(TransUtil.getRegionBytes("097", "帐户余额", this.getObjs()[3].toString(),18));
		return byteOut.toByteArray();
	}


}