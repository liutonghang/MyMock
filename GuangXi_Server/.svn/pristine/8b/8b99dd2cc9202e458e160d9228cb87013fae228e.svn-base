package grp.pb.branch.trans.rcbtuxedo;

import grp.pt.idgen.IdGen;
import grp.pt.pb.exception.PbException;
import grp.pt.pb.payment.IVoucher;
import grp.pt.pb.trans.bs.BankTransServiceAdapter;
import grp.pt.pb.trans.model.TransLogDTO;
import grp.pt.pb.trans.model.TransReturnDTO;
import grp.pt.pb.trans.model.MsgResBody.SerialNo;
import grp.pt.pb.trans.util.Context;
import grp.pt.pb.util.ChangeUtil;
import grp.pt.pb.util.PbUtil;
import grp.pt.pb.util.PropertiesHander;
import grp.pt.pb.util.TradeConstant;
import grp.pt.util.DateUtil;
import grp.pt.util.PlatformUtils;
import grp.pt.util.model.Session;

import java.io.BufferedOutputStream;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import org.apache.log4j.Logger;
import org.apache.tools.ant.PropertyHelper;

import bea.jolt.JoltRemoteService;
import bea.jolt.JoltSession;
import bea.jolt.JoltSessionAttributes;
import bea.jolt.JoltTransaction;

public class GXRCBTuxedoServiceImpl extends BankTransServiceAdapter{
	
	private static Logger logger = Logger.getLogger(GXRCBTuxedoServiceImpl.class);
	
	
	/****
	 * 生成交易流水ID yyMMdd-凭证类型-7位序列
	 * @param vtCode 凭证类型
	 * @return
	 */
	String seqReq(String vtCode) {
		// 流水ID
		StringBuffer flowIdSb = new StringBuffer();
		flowIdSb.append(PbUtil.getCurrDate("yyMMdd")).append("-");
		flowIdSb.append(vtCode).append("-");
		String id = IdGen.genStrId("SEQ_TRANS_FLOW_ID");
		if( id.length()>7 ){
			id = id.substring(id.length()-7);
		}else{
			id = ChangeUtil.getFixlenStr(id, 7);
		}
		flowIdSb.append(id);
		return flowIdSb.toString();
	}
	
	/**
	 * 账号信息查询
	 * @param sc
	 * @param context
	 * @param t
	 * @return
	 * @throws Exception
	 */
	public BigDecimal queryAcctBalance(Session sc, Context context, IVoucher t) throws Exception {
		GXRCBMsgResBodyTuxedo resBody = this.doBankInterface(sc, context, t,GXTradeConstantTuxedo.ACCOUNT_INFO_QUERY);
		BigDecimal payAmount = resBody.getPayAmount();
		return payAmount;
	}
	
	/**
	 * 记账
	 */
	public TransReturnDTO trans(Session sc, Context context, IVoucher t) throws Exception {
		GXRCBMsgResBodyTuxedo resBody = null;
		String pb_set_mode_code = (String) PlatformUtils.getProperty(t, "pb_set_mode_code");
		String is_same_bank = String.valueOf(PlatformUtils.getProperty(t, "is_same_bank"));
		String transCode = null;
		// 冲销
		if (t.getTrade_type() == TradeConstant.PAY2ADVANCE_WRITEOFF) {
			transCode = GXTradeConstantTuxedo.PAY2ADVANCE_WRITEOFF;
		}else if(t.getTrade_type() == TradeConstant.ADVANCE2PAY){
			transCode = GXTradeConstantTuxedo.PAY2PAYEE;
		}else if(t.getTrade_type() == TradeConstant.PAY2PAYEE){
			//同行
			if("0".equals(pb_set_mode_code) || "1".equals(is_same_bank)){
				transCode = GXTradeConstantTuxedo.PAY2PAYEE;
			}
			//跨行
			else if("1".equals(pb_set_mode_code) || "0".equals(is_same_bank)){
				transCode = GXTradeConstantTuxedo.TRANS_PAY2PAYEE;
			}
		}
		//退款
		else if(t.getTrade_type() == TradeConstant.PAY2ADVANCE_REFUND){
			transCode = GXTradeConstantTuxedo.PAY2PAYEE;
		}
		resBody = this.doBankInterface(sc, context, t, transCode);
		return new TransReturnDTO(resBody.getStatus(), resBody.getReason(), t.getTransId(),resBody.getBankTransId());		
	}

	
	/**
	 * 查询交易状态
	 */
	public TransReturnDTO queryTrans(Session sc, Context context, IVoucher t,Object... objects)
	throws Exception {
		if(t.getTrade_type() == TradeConstant.PAY2PAYEE){
			PlatformUtils.setProperty(t, "hold8", t.getTransId());
		}	
		boolean isSaveLog = true;
		GXRCBMsgResBodyTuxedo resBody=null;
		String pb_set_mode_code = (String) PlatformUtils.getProperty(t, "pb_set_mode_code");
		String is_same_bank = String.valueOf(PlatformUtils.getProperty(t, "is_same_bank"));
		String transCode = null;
		if (objects!=null && objects.length != 0 && objects[0]!=null) {
			TransLogDTO log = (TransLogDTO)objects[0];
			//本地日志表记录转账成功，则直接返回
			if(log.getTrans_succ_flag() == 1 ){
				return new TransReturnDTO(0, false);
			}
			t.setTransId(log.getTrans_log_id());
			//**临时放一下原前置日期
			PlatformUtils.setProperty(t, "vou_date", PbUtil.getCurrDate());
			isSaveLog = false;
			t.setUserCode(sc.getUserCode());
			//同行  补录结算方式
			//TODO:冲销和请款（同行）都要走 860008 接口
			// 冲销
			if (t.getTrade_type() == TradeConstant.PAY2ADVANCE_WRITEOFF) {
				transCode = GXTradeConstantTuxedo.TRANS_RESULT_QUERY;
			}else if(t.getTrade_type() == TradeConstant.ADVANCE2PAY){
				transCode = GXTradeConstantTuxedo.TRANS_RESULT_QUERY;
			}
			else if(t.getTrade_type() == TradeConstant.PAY2PAYEE){
				if("0".equals(pb_set_mode_code) || "1".equals(is_same_bank)){	
					transCode = GXTradeConstantTuxedo.TRANS_RESULT_QUERY;
			      }
			//跨行
			else if("1".equals(pb_set_mode_code) || "0".equals(is_same_bank)){			
				   transCode = GXTradeConstantTuxedo.TRANS_QUERY_RESULT;
			      }
			}
			//退款
			else if(t.getTrade_type() == TradeConstant.PAY2ADVANCE_REFUND){
				transCode = GXTradeConstantTuxedo.TRANS_RESULT_QUERY;
			}
			String date = DateUtil.DateToString(DateUtil.stringToDate(log.getCreate_date(),"yyyyMMdd"), "yyyy-MM-dd");
			resBody=this.doBankInterface(sc, context, t, transCode, date, seqReq(t.getVtCode()));
			
			//如果交易失败 再次转账不能用原交易流水必须要生成新的交易流水 且必须保持交易日志
			//成功则 不需要保持交易日志 只需要跟新交易日志就行
			if(resBody.getStatus()== 1){
				isSaveLog = true ;
				t.setTransId(seqReq(t.getVtCode()));
			}
			return new TransReturnDTO(resBody.getStatus(),resBody.getReason(),t.getTransId(),isSaveLog);
		}else{			
			t.setTransId(seqReq(t.getVtCode()));
			return new TransReturnDTO(1, true);
		}			
	}
	
	/**
	 * 指定日期查询流水 checkSerialno
	 */
	public List<SerialNo> checkSerialno(Session sc, Context context, IVoucher t,
			String queryDate) throws Exception {
		List<SerialNo> serialList = new ArrayList<SerialNo>();
		SerialNo serialNo = null;
		String date = DateUtil.DateToString(DateUtil.stringToDate(queryDate,"yyyyMMdd"), "yyyy-MM-dd");
		//同行
		GXRCBMsgResBodyTuxedo resBody = this.doBankInterface(sc, context, t, GXTradeConstantTuxedo.VOUCHER_FILE, date,seqReq(t.getVtCode()));
		//跨行
		GXRCBMsgResBodyTuxedo resBodys = this.doBankInterface(sc, context, t, GXTradeConstantTuxedo.TRANS_VOUCHER_FILE, queryDate,seqReq(t.getVtCode()));
		String localPath = PropertiesHander.getValue("trans", "ftp.localTipsPath");	
		if (resBody.getFileName() != null) {
			serialNo = getFile(resBody, localPath);
			serialList.add(serialNo);
		}
		if(resBodys.getFileName() != null){
			serialNo = getFile(resBodys, localPath);
			serialList.add(serialNo);
		}
		return serialList;
	}
	
	//核心接口
	public GXRCBMsgResBodyTuxedo doBankInterface(Session sc, Context context, IVoucher t,Object...objects) throws Exception {
		GXRCBMsgResBodyTuxedo resBody = null;
		GXRCBMsgParserTuxedo parser=new GXRCBMsgParserTuxedo();
		try {
			resBody=parser.doSocket(sc, context, t, objects);
		} catch (Exception e) {
			logger.error("调用失败",e);
			throw new PbException(e.getMessage());
		}	
		return resBody;
	}
	
	
	/**
	 * TODO (开发完成，待测试) 
	 * 从核心获取文件
	 * 
	 * @param remoteFilePath
	 *            远程文件地址
	 * @param localPath
	 *            本地文件地址
	 * @throws Exception
	 */
	private String getCoreFile(String fileName, String localPath) throws Exception {

		JoltSession session = null;
		JoltRemoteService joltService = null;
		JoltTransaction joltTran = null;
		JoltSessionAttributes attr = null;
		File localFile = null;
		String tuxservice = "ftpsrv";		
		try {
			// 本地目标文件夹
			String filePath = localPath + fileName;
			localFile = new File(filePath);
			if (!localFile.getParentFile().exists()) {
				localFile.getParentFile().mkdirs();
			}
			String userName = PropertiesHander.getValue("gxtuxedo", "userName");
//			String userPassword = PropertiesHander.getValue("gxtuxedo", "userPassword");
//			String appPassword = PropertiesHander.getValue("gxtuxedo", "appPassword");
			String userRole = PropertiesHander.getValue("gxtuxedo", "userRole");
			String appAddress = PropertiesHander.getValue("gxtuxedo", "appaddress");
			// 设置链接属性
			attr = new JoltSessionAttributes();
			attr.setString(JoltSessionAttributes.APPADDRESS, "//"+appAddress);
			// TIMEOUT时间
			int timeout = Integer.parseInt(PropertiesHander.getValue("gxtuxedo", "timeout"));
			attr.setInt("IDLETIMEOUT", timeout);
			// 建立链接
			session = new JoltSession(attr, userName, userRole, null, null);
			joltTran = new JoltTransaction(timeout, session);
			joltService = new JoltRemoteService(tuxservice, session);

			// 设置发送消息
			joltService.setString("FTPFLAG", "2");
			joltService.setInt("FTPBLOCKID", 1);
			joltService.setInt("FTPBLOCKSIZE", 4096);
			joltService.setString("FTPFILENAME", fileName);
			joltService.call(null);
			// 获取文件信息
			int iFileSize = joltService.getIntDef("FTPFILESIZE", 0);
			int iFileBlockSize = joltService.getIntDef("FTPBLOCKSIZE", 0);
			int blkNum = (iFileSize - 1) / iFileBlockSize + 1;

			// 写入文件
			byte[] buffer = new byte[iFileBlockSize];
			BufferedOutputStream out = null;
			try {
				// 读取并写入第一个块
				out = new BufferedOutputStream(new FileOutputStream(filePath));
				buffer = joltService.getBytesItemDef("FTPFILEDATA", 0, null);
				out.write(buffer);
				// 读取并写入后面的块
				for (int i = 2; i <= blkNum; i++) {
					joltService.setInt("FTPBLOCKID", i);
					joltService.setInt("FTPBLOCKSIZE", 4096);
					joltService.call(null);
					buffer = joltService.getBytesItemDef("FTPFILEDATA", 0, null);
					out.write(buffer);
				}
				out.flush();
			} catch (Exception e) {
				throw e;
			} finally {
				if (out != null) {
					out.close();
				}
			}
			// 返回文件路径
			return filePath;
		} catch (Exception e) {
			if (joltTran != null) {
				joltTran.rollback();
			}
			throw e;
		} finally {
			if (joltService != null) {
				joltService.clear();
			}
			if (joltTran != null) {
				joltTran.commit();
			}
			if (session != null) {
				session.endSession();
			}
		}

	}
	
	
	/**
	 * 从核心获取文件
	 * @param resBody
	 * @param localPath
	 * @return
	 * @throws Exception
	 */
	private SerialNo getFile(GXRCBMsgResBodyTuxedo resBody,String localPath) throws Exception{
	    String fileName = getCoreFile(resBody.getFileName(), localPath);
		File file = new File(fileName);
		BufferedReader reader = null;
		SerialNo dto = null;
		try {
			FileInputStream fis = new FileInputStream(file);
			InputStreamReader read = new InputStreamReader(fis, "GBK");
			reader = new BufferedReader(read);
			String line = null;
			while ((line = reader.readLine()) != null) {
				String[] tempStr = line.split("\\|");
				dto = new SerialNo();
				// 前置流水
				dto.setTransId(tempStr[0]);
				// 金额
				dto.setTransAmt(new BigDecimal(tempStr[2]));
				// 状态 默认成功
				dto.setTransResult(0);
			}
			reader.close();
		} catch (Exception e) {
			e.printStackTrace();
			throw new RuntimeException("交易流水校验失败，原因：" + e.getMessage());
		} finally {
			if (reader != null) {
				try {
					reader.close();
				} catch (IOException e1) {
				}
			}
			file.delete();
	}
		return dto;
}
	
	/**
	 * 转换格式8859_1
	 * @param msg
	 * @return
	 */
	public static final String toISO8859(String msg) {
	    try {
	      byte[] b = msg.getBytes("GB2312");
	      String convert = new String(b, "8859_1");
	      return convert; } catch (Exception e) {
	    }
	    return new String("Convert failed!");
	  }
}
