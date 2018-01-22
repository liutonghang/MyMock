package grp.pb.branch.gxboc.job;

import static grp.pt.pb.util.PayConstant.BILL_TYPE_REFUND_SERIAL;

import java.io.BufferedReader;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.UnsupportedEncodingException;
import java.math.BigDecimal;
import java.net.Socket;
import java.net.SocketTimeoutException;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

import org.apache.log4j.Logger;
import org.springframework.jdbc.core.RowMapper;

import grp.pt.bill.BillEngine;
import grp.pt.bill.BillType;
import grp.pt.bill.BillTypes;
import grp.pt.idgen.IdGen;
import grp.pt.pb.common.AutoJobAdapter;
import grp.pt.pb.common.model.BankAccount;
import grp.pt.pb.exception.PbException;
import grp.pt.pb.payment.RefundSerial;
import grp.pt.pb.trans.util.Context;
import grp.pt.pb.trans.util.SocketUtil;
import grp.pt.pb.util.PbUtil;
import grp.pt.pb.util.PropertiesHander;
import grp.pt.pb.util.SessionUtil;
import grp.pt.pb.util.StaticApplication;
import grp.pt.util.BaseDAO;
import grp.pt.util.ComplexMapper;
import grp.pt.util.Parameters;

public class BOCAutoImportTransSerialTaskJob extends AutoJobAdapter{
	private Logger logger = Logger.getLogger(BOCAutoImportTransSerialTaskJob.class);

	private static boolean interrupt = false;
	private static BaseDAO baseDao = StaticApplication.getBaseDAO();
	private static BillEngine billEngine;
	private static Random random = new Random(100);
	private Context context = new Context();
	//零余额帐号列表
	private static List<BankAccount> payeeAccountNoList;
	static {
		billEngine = (BillEngine) StaticApplication.getBean("bill.engine.billengineimpl");
	}
	//本地ftp路径
	String localTipsPath = PropertiesHander.getValue("trans", "ftp.localTipsPath");
	//流水文件在本地默认保留天数，可在配置文件中配置
	private static int daycount = 100;
	
	@Override
	public void executeJob(){
		//每次执行自动任务都需重新加载零余额帐号
		getPeeAccountNoList();
		//首先删除之前下载的流水文件(天数在配置文件中配置daycount,默认100天)
		deleteOldFile(daycount);
		//对所有的零余额账号循环操作
		for(int i=0;i<payeeAccountNoList.size();i++){
			String account_no = payeeAccountNoList.get(i).getAccount_no();
			logger.info("开始导入" + account_no + "账户流水信息");
//			transService.queryPayDetail(sc,admdiv_code,clearDate,vt_code);	准备支持两种方式 1按照我们提供的格式做，2按照银行提供的接口做
			if (!interrupt) {
				//	根据零余额帐号生成请求报文
				byte[] reqMsg = createReqMessage(account_no);
				//发送报文，获取核心响应信息
				byte[] resMsg = getReturnMessage(reqMsg);
				logger.info("######回执报文：" + new String(resMsg));
				Map<String,String> result = changeToResult(resMsg);
				if("true".equals(result.get("isSuccess"))){
					//如果留水记录数为0 ，则跳出循环，不进行后续操作
					int countNum = Integer.parseInt(result.get("countNum"));
					if(countNum == 0){
						logger.info("账户" + account_no + "无交易流水");
						continue;
					}else{
						//流水数量不为0，则通过FTP从核心下载流水文件，并保存到本地数据库
						autoQueryVoucherStatusActions(result.get("fileName"),payeeAccountNoList.get(i).getAdmdiv_code());
					}
				}else{
					logger.error("失败的账号：" + account_no);
					continue;
				}
			}
		}
	}
	
	public void autoQueryVoucherStatusActions(String fileName,String admdivCode) {
		try {
			logger.info("流水表自动导入开始！时间："+PbUtil.getCurrLocalDateTime());
			long billTypeId = Parameters.getLongParameter(BILL_TYPE_REFUND_SERIAL);
			BillType billType = BillTypes.getInstance().getBillTypeById(billTypeId);
			File file = new File(localTipsPath,fileName);
			if (!file.exists()) {
				logger.info("交易流水文件" + fileName + "未找到");
				throw new RuntimeException("交易流水文件未找到!");
			}
			List<RefundSerial> refunds = new ArrayList<RefundSerial>();
			BufferedReader reader = null;
			try {
				FileInputStream fis = new FileInputStream(file);
				InputStreamReader read = new InputStreamReader(fis, "GBK");
				reader = new BufferedReader(read);
				String tempStr = null;
				RefundSerial refund = null;
				//按行读取明细文件中的明细信息
				while ((tempStr = reader.readLine()) != null) {
					tempStr += "0";
					String[] tempSerial = tempStr.split("\\|");
					refund = new RefundSerial();
					refund.setTrans_serial_id(IdGen.getInstance(1).genNumIds("SEQ_TRANS_SERIAL", 1).get(0));
					refund.setCurrency_type(tempSerial[0]);//币种
					refund.setMoney_type(tempSerial[1]);//钞汇鉴别
					refund.setPay_amount(new BigDecimal(tempSerial[2]));//支出金额
					//如果是退款，将退款金额变为负数
					Double incomeAmount = Double.parseDouble(tempSerial[3]);
					refund.setIncome_amount(new BigDecimal(incomeAmount));
					//收入金额
					refund.setAccount_balance(new BigDecimal(tempSerial[4]));//余额
					refund.setPay_account_name(tempSerial[5]);//付款账号名称
		  			refund.setPay_account_no(tempSerial[6]);//付款帐号
					refund.setPayee_account_name(tempSerial[7]);//收款帐号名称
					refund.setPayee_account_no(tempSerial[8]);//收款帐号
					refund.setTrans_date(tempSerial[9]);//交易日期
					refund.setTrans_serial_no(tempSerial[10]);//交易流水号
					refund.setPay_summary_name(tempSerial[11]);
					refund.setRemark(tempSerial[12]);
					refund.setAdmdiv_code(admdivCode);
					refund.setRefund_status(1);
					refund.setBiz_type_id(billType.getBizTypes().get(0).getBizTypeId());
					refund.setBill_type_id(billTypeId);
					refunds.add(refund);
					logger.info("导入流水号" + refund.getTrans_serial_no());
				}
				reader.close();
			} catch (IOException e) {
				e.printStackTrace();
				throw new RuntimeException("读取客户流水文件失败，原因："+e.getMessage());
			} finally {
				if (reader != null) {
					try {
						reader.close();
					} catch (IOException e1) {
					}
				}
			}
			try {
				billEngine.saveBills(SessionUtil.getSession(), refunds);
			} catch (Exception e) {
				logger.error("自助柜面退款流水保存异常", e);
				throw new PbException("自助柜面退款流水保存异常：" + e.getMessage());
			}
		} catch (Exception e) {
			logger.info("保存流水出错");
			e.printStackTrace();
		}
		logger.info("流水表自动导入结束！时间："+PbUtil.getCurrLocalDateTime());
	}
	
	/**
	 * 
     * 此方法描述的是：  加载所有零余额帐号
     * @author: 
     * @version: 2014-11-10 下午04:59:54
	 */
	public static void getPeeAccountNoList(){
		//查询零余额帐号 ，account_type_code=12,BankAccount
		String sql = "select * from pb_ele_account where account_type_code=12 and is_valid=1 ";
		payeeAccountNoList =  baseDao.queryForList(sql,new ComplexMapper(BankAccount.class));
	}
	
	/**
	 * 
     * 此方法描述的是： 拼装请求报文
     * @author: 
     * @version: 2014-11-10 下午05:00:45
	 */
	public byte[] createReqMessage(String accountNo){
		//拼装报文体
		String msgBody = "148" + accountNo.length() + accountNo + "05708" + PbUtil.getCurrDate();
		//拼装报文头
		//QTRSAL为该接口交易码
		StringBuffer msgHead = new StringBuffer("QTRSAL");
		//12位操作员名号
		msgHead.append("       admin");
		//14位交易时间
		msgHead.append(new SimpleDateFormat("yyyyMMddhhmmss").format(new Date()));
		//19位流水号,12位日期 零余额帐号后4位加3位随机码
		msgHead.append(new SimpleDateFormat("yyMMddhhmmss").format(new Date())  + accountNo.substring(accountNo.length()-4, accountNo.length()) + getRandom());
		//是否有文件传输，0无，1有
		msgHead.append("0");
		try {
			byte[] reqMsg = (getLength(msgHead.toString(),msgBody) + msgHead.toString() + msgBody).getBytes("GBK");
			return reqMsg;
		} catch (UnsupportedEncodingException e) {
			logger.error("请求报文转换字节数组失败",e);
		}
		return null;
	}
	
	/**
	 * 
     * 此方法描述的是：  生成一个3位的随机数
     * @author: 
     * @version: 2014-11-11 上午11:11:15
	 */
	public static String getRandom(){
		int num = random.nextInt(999);
		if(num <100){
			return getRandom();
		}
		return num+"";
	}
	/**
	 * 
     * 此方法描述的是：  返回传入参数字符串的总长度，不到4位前面补零
     * @author: 
     * @version: 2014-11-11 上午11:16:48
	 * @throws UnsupportedEncodingException 
	 */
	public static String getLength(String ... strs){
		int length = 0;
		for(String str : strs){
			try {
				length += str.getBytes("GBK").length;
			} catch (UnsupportedEncodingException e) {
				e.printStackTrace();
			}
		}
		String templength1 = length+"";
		int templength2 = templength1.length();
		if(templength2 < 4){
			while(templength2 < 4){
				templength1 = "0" + templength1;
				templength2 = templength1.length();
			}
		}
		return templength1;
	}
	/**
	 * 向核心发送报文，并返回响应报文
	 */
	public byte[] getReturnMessage(byte[] req1){
		// 创建套接字与服务端连接
		Socket socket = null;
		try {
			// 创建套接字链接
			socket = SocketUtil.createSocket(context, true);
			logger.info("######请求报文：" + new String(req1));
			// 将报文字节流输出到套接字输出流发送
			socket.getOutputStream().write(req1);
			socket.getOutputStream().flush();
			// 读取回执报文
			InputStream in = socket.getInputStream();
			// 读取响应报文
			ByteArrayOutputStream baos = new ByteArrayOutputStream();
			byte[] msgLenBytes = new byte[4];
			
			int cou = in.read( msgLenBytes );
			if(cou != 4 ){
				throw new RuntimeException("报文长度必须大于4");
			}
			baos.write(msgLenBytes);
			int msgLen = Integer.parseInt( new String(msgLenBytes));
			byte[] msgBody = SocketUtil.read(socket.getInputStream(),msgLen);
			baos.write(msgBody);
			return baos.toByteArray();
		} catch (SocketTimeoutException ex) {
			logger.error("读取响应报文超时",ex);
		} catch (Exception e) {
			logger.error("####", e);
		} finally {
			SocketUtil.close(socket);
		}
		return null;
	}
	/**
	 * 
     * 此方法描述的是：判断交易是否成功  
     * @author: 
     * @version: 2014-11-11 下午02:17:22
	 */
	public  Map<String,String>changeToResult(byte[] resMsg){
		Map<String,String> result = new HashMap<String,String>();
		String msg = new String(resMsg);
		logger.info("响应报文为" + msg);
		String code = msg.substring(29, 35);
		if("000000".equals(code)){
			result.put("isSuccess", "true");
			String bodystr = msg.substring(36);
			System.out.println("截取到的body:" + bodystr);
			if("229".equals(bodystr.substring(0,3))){
				//229 该帐号流水记录数
				int length = Integer.parseInt(bodystr.substring(3,5));
				result.put("countNum", bodystr.substring(5,5+length));
				System.out.println("记录条数为： " + bodystr.substring(5,5+length));
				bodystr = bodystr.substring(5+length);
			}
			if("871".equals(bodystr.substring(0,3))){
				int length = Integer.parseInt(bodystr.substring(3,5));
				result.put("fileName", bodystr.substring(5,5+length));
				System.out.println("文件名为" + result.get("fileName"));
			}
		}else{
			logger.error("根据零余额帐号获取流水失败，响应码" + code);
			result.put("isSuccess","false");
		}
		return result;
	}
	
	/**
	 * 
     * 此方法描述的是：  删除旧流水文件
     * @author: 
     * @version: 2014-11-14 下午04:17:43
	 */
	public boolean deleteOldFile(int num){
		String fileName = localTipsPath + "/" + getOldDate(num);
		logger.info("原始文件夹名" + fileName);
		if(delAllFile(fileName)){
			logger.info(fileName + "原始流水文件删除成功");
		}else{
			logger.error(fileName + "原始流水文件删除失败，请手动删除");
		}
		return false;
	}
	
	/**
	 * 
     * 此方法描述的是：  删除给定文件，或给定目录及目录下的所有文件
     * @author: 
     * @version: 2014-11-14 下午04:53:00
	 */
	public static boolean delAllFile(String FileName){
		File file = new File(FileName);
		if(file.exists()){
			if(file.isFile()){
				return file.delete();
			}else if(file.isDirectory()){
				String[] list = file.list();
				if(list.length <= 0){
					return file.delete();
				}else{
					for(String str : list){
						delAllFile(FileName + "/" +str);
					}
					return file.delete();
				}
			}
		}
		return false;
	}
	/**
	 * 
     * 此方法描述的是：  获取以当前日期往前num天的日期(YYYYMMDD)
     * @author: 
     * @version: 2014-11-14 下午03:58:15
	 */
	public static String getOldDate(int num){
		long currDate = new Date().getTime();
		Calendar calendar = Calendar.getInstance();
		calendar.setTime(new Date(currDate - (1000L*86400*num)));
		int month = calendar.get(Calendar.MONTH) + 1;
		int day = calendar.get(Calendar.DAY_OF_MONTH);
		return  "" + calendar.get(Calendar.YEAR) + (month<10 ? ("0" + month): month) +  (day < 10 ? ("0" + day): day);
	}
}
