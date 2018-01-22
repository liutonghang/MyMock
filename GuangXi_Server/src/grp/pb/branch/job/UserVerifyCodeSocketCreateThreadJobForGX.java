package grp.pb.branch.job;

import grp.pt.pb.common.AutoJobAdapter;
import grp.pt.pb.common.IPbUserService;
import grp.pt.pb.common.dao.QuarzDAO;
import grp.pt.pb.common.dao.UserVerifyLoginDAO;
import grp.pt.pb.common.model.PbUser;
import grp.pt.pb.common.model.UserVerifyCodeDTO;
import grp.pt.pb.trans.model.MsgParser;
import grp.pt.pb.trans.model.MsgReqBody;
import grp.pt.pb.trans.model.MsgResBody;
import grp.pt.pb.trans.model.PBMessageForwardService;
import grp.pt.pb.trans.model.PBService;
import grp.pt.pb.trans.model.TransResConfig;
import grp.pt.pb.trans.model.TransResManager;
import grp.pt.pb.trans.util.Context;
import grp.pt.pb.trans.util.MsgConstant;
import grp.pt.pb.trans.util.SocketUtil;
import grp.pt.pb.trans.util.TransUtil;
import grp.pt.pb.util.StaticApplication;
import grp.pt.util.BeanFactoryUtil;
import grp.pt.util.transation.ISmalTrans;
import grp.pt.util.transation.ISmallTransService;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.UnsupportedEncodingException;
import java.lang.reflect.Method;
import java.net.InetAddress;
import java.net.ServerSocket;
import java.net.Socket;
import java.sql.Timestamp;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import org.apache.log4j.Logger;

import com.ccb.gx.Security;
import com.river.common.UploadFileUtil;


/**
 * 广西建行读取用户登录获取验证码使用报文加密
 * 
 * @author FWQ
 * 
 */
public class UserVerifyCodeSocketCreateThreadJobForGX extends AutoJobAdapter {

	/**
	 * 日志Logger
	 */
	private static Logger log = Logger
			.getLogger(UserVerifyCodeSocketCreateThreadJobForGX.class);

	private static byte[] msgHeadSecurity = null;

	// 服务端Socket，响应银行核心系统请求
	private static ServerSocket serverSocket = null;

	// 用户操作服务类
	private static IPbUserService userService = null;
	

	// 用户校验码操作DAO
	private static UserVerifyLoginDAO verifyLoginDAO = null;

	// 小事务处理类
	private static ISmalTrans smallTrans = null;
	//系统启动时加载服务类中所有接口，缓存在map中
	private static Map<String,Method> serviceMap = new HashMap<String,Method>();
	
	private static PBMessageForwardService pbMFService = null;
	
	private static ExecutorService pool = null;
	
	static Context context = new Context();
	/**
	 * 自动任务访问数据库DAO
	 */
	private static QuarzDAO quarzDao;

	static {
		serverSocket = SocketUtil.createServerSocket(context);
		userService = (IPbUserService) BeanFactoryUtil
				.getBean("pb.common.impl.pbUserService");
		verifyLoginDAO = (UserVerifyLoginDAO) BeanFactoryUtil
				.getBean("pb.common.UserVerifyLoginDAO");
		smallTrans = (ISmalTrans) BeanFactoryUtil.getBean("smallTranService");
		// GXCCB报文加密8位密钥（FWQ）
		msgHeadSecurity = UploadFileUtil.getFromPro("trans", "msgHeadSecurity")
				.getBytes();
		quarzDao = (QuarzDAO) StaticApplication.getBean("quarzDao");
		pool = Executors.newCachedThreadPool();
		//加载柜面服务
		loadPBService();
	}

	/**
	 * 读取socket.propertis中的userverify.serversocketport 启动
	 * socket监听，接口规范参考设计文档中的附录中的接口规范章节
	 */
	@Override
	public void executeJob() {
		while (true) {
			try {
				Socket socket = serverSocket.accept();
				invoke(socket);
			} catch (IOException e) {
				log.error(e);
			} catch (Exception e) {
				log.error(e);
			}
		}
	}

	/**
	 * 服务端每读取到一个请求，启动一个相应的线程处理
	 * 
	 * @param socket
	 */
	private void invoke(final Socket socket) throws Exception {
		 pool.execute(new Thread(new Runnable() {
			public void run() {
				InputStream in = null;
				OutputStream out = null;
				//接口配置信息
				TransResManager trm = null;
				String responseMsg = "";
				try {
					in = socket.getInputStream();
					out = socket.getOutputStream();
//					int length = Integer.parseInt(new String(SocketUtil.read(in, 4)));
					//由于原接口实现方法传入输入流，因为需要先读取后判断交易类型，故在此处预先读取所有报文
//					byte[] reqByte = SocketUtil.read(in, length);
//					log.info("线程：" + Thread.currentThread().getName().toString() +  ":请求报文" + new String(reqByte,"GBK"));
					
//					String transCode = new String(reqByte,0,6).trim();
//					trm = ResultCache.getResult(transCode);
//					// 原代码处理如下交易
//					if ("QYBKNO".equals(transCode)
//							|| "CKSERL".equals(transCode)
//							|| "TRSTAT".equals(transCode)
//							|| "QYBALA".equals(transCode)
//							|| "TRDEAL".equals(transCode)
//							|| "VRPASS".equals(transCode)) {
//						//如果是此类交易，则生成原始输入流传入
//						log.info(transCode + "交易，原方式调用");
//						InputStream is = new ByteArrayInputStream(reqByte);
						oldMethod(socket, out, in);
//					} else {
//						//首先判断数据库表pb_banktran_manager中是否配置了此接口的映射信息。
//						if(ResultCache.getResult(transCode) == null) {
//							responseMsg = "未找到"+ transCode +"的配置信息。";
//							log.error("未找到"+ transCode +"此交易的配置信息,请检查pb_banktran_manager表相关配置");
//						}else{
//							byte[] resByte = null;
//							try{
//								Map<String,Object> reqMap = createParameterMap(reqByte,trm);
//								Map<String,Object> resMap = callPBService(reqMap);
//								if(resMap == null) {
//									log.error("调用柜面服务，返回map为null,请检查" +  transCode + "服务是否有返回");
//									throw new PbException("柜面返回为null,请检查柜面日志");
//								}
//								resByte = createRerurnMessage(reqMap,resMap,trm);
//							}catch(Exception e){
//								log.error("" , e);
//								//如果正常逻辑调用出错，则生成error响应报文，返回错误信息
//								resByte = createErrorReturnMessage(transCode,trm,e.getMessage());
//							}
////							log.info("响应报文：" + new String(resByte));
//							//-------------------------------------------
//							log.info("######响应明文报文：" + new String(resByte));
//							String reqMesg = new String(resByte);
//							String reqMesgNoLen = reqMesg.substring(4, reqMesg.length());
//							String reqMesgSec = new String(Security.ENCRYPT(msgHeadSecurity, reqMesgNoLen.getBytes()));
//							String reqMesgLen = new String(TransUtil.getFixlenStrBytes(reqMesgSec.length()+"", 4));
//							byte[] allReqMesg = (reqMesgLen + reqMesgSec).getBytes();
//							log.info("######响应密文报文：" + new String(allReqMesg));
//							//-------------------------------------------
//							out.write(allReqMesg);
//							out.flush();
//						}
//
//					}
				} catch (IOException e) {
					log.error("根据客户端获取流失败" + e);
				} finally {
					try {
						in.close();
						out.close();
						if (socket.isConnected())
							socket.close();
					} catch (IOException e) {
						log.error("释放socket资源异常" + e);
					}
				}
			}
		}));
	}
	
	
	/**
	 * 解析请求报文，返回对应参数的map对象<br>
	 * 报文体部分根据表pb_banktran_config表中的配置转换，报文头部分根据MsgHead类转换<br>
	 * key对应field_name字段，Value对应请求报文中的值
	 * @param  str  
	 * @return Map  
	 * @author zcl
	 * @throws Exception 
	 * @date 2015-4-16
	 */
	public Map<String,Object> createParameterMap(byte[] reqByte,TransResManager trm) throws Exception{
		Map<String,Object> map = new HashMap<String,Object>();
		//首先解析报文头部分
		map.put("tradeCode",new String(reqByte,0,6));//交易码
		map.put("operator", new String(reqByte,6,12));//操作员编号12位
		map.put("tradeTime", new String(reqByte,18,14));//交易时间14位
		map.put("tradeId", new String(reqByte,32,19));//交易流水号 19位
		map.put("isFile", new String(reqByte,51,1));//是否有文件传输 0-无，1-有
		//接下来解析报文体,首先声明一个报文体起始位置变量,报文长度52，报文体从52开始
		int beginNo = 52;
		//首先获取该tradeCode的字段映射信息(TransDao中resList存放的是请求配置字段！！！)
		List<TransResConfig> cfiList = trm.getResConfigList();
		//将cfiList转换成 以域号为key的临时tempMap中,便于查找赋值
		Map<String,TransResConfig> tempMap = new HashMap<String,TransResConfig>();
		for(TransResConfig trc : cfiList){
			tempMap.put(trc.getField_name(), trc);
		}
		//将请求报文解析到map中 ()
		//遍历数据库中字段映射配置，将每个字段存放的map中
		while(beginNo < reqByte.length){
				String code = new String(reqByte,beginNo,3);//三位域号
				int len = Integer.parseInt(new String(reqByte,beginNo+3, 2));//2位域长度
				String value = new String(reqByte,beginNo+5,len);
				/**
				 * 验证请求报文中传入字段是否超出规定长度
				 * 因pb_banktran_config表中没有是否可为空相关配置，故此处不验证
				 */
				if(tempMap.get(code) == null){
					log.error("报文解析失败，请检查报文是否与数据库字段配置对应");
					throw new Exception("报文解析失败，请检查报文格式");
				}
				if( tempMap.get(code).getField_length() < len){
					throw new Exception("域号："+code + "的值过长,最长为" + tempMap.get(code).getField_length());
				}
				map.put(tempMap.get(code).getDto_name(), value);
				beginNo = beginNo + 5 + len;
		}
		//解析报文到map完毕，返回
		return map;
	}
	
	/**
	 * 将调用柜面业务方法返回的map，转换为响应报文字节数组。<br>
	 * 报文字段映射根据pb_banktran_config表中获取，is_request字段为0的为响应<br>
	 * 此处应注意字段顺序，根据field_order来拼装 
	 * @param resMap
	 * @param trm
	 * @return byte[]  
	 * @author zcl
	 * @date 2015-4-20
	 */
	public byte[] createRerurnMessage(Map<String,Object> reqMap,Map<String,Object> resMap ,TransResManager trm){
		//返回报文
		byte[] resByte = null;
		//拼装报文头
		StringBuffer sb = new StringBuffer();
		//报文总长度，不包含自己
		String length = "";
		sb.append(reqMap.get("tradeCode"));//6位交易码,从请求map中获取
		sb.append(reqMap.get("tradeId"));//19位交易流水号，将外部系统传入的返回
		sb.append(resMap.get("resCode"));//6位柜面响应代码
		sb.append(reqMap.get("isFile"));//是否有文件传输
		//首先将字段映射配置信息转换成map，便于生成报文时使用
		List<TransResConfig> list = trm.getReqConfigList();
		Map<Integer,TransResConfig> tempMap = new HashMap<Integer,TransResConfig>();
		for(TransResConfig trc : list){
			tempMap.put(trc.getField_order(), trc);
		}

		for(int i=1;i< tempMap.size()+1; i++){
			TransResConfig trc = tempMap.get(i);
			if(trc == null) log.error(trm.getCode() + "接口未找到field_order为"+ i + "的配置信息");
			//获取域号
			String dtoName = trc.getDto_name();
			String value = "";
			String len = "00";
			if(resMap.get(dtoName) == null){
				log.debug("在柜面服务返回数据中查找" + dtoName + "的值，发现为null");
			}else{
				value = resMap.get(dtoName).toString();
				//如果返回字段超出最大长度的话，截取最大长度位
				if(value.getBytes().length > trc.getField_length()){
					if(trc.getField_length() > 99){
						log.error("字段长度不能超过99位");
						return null;
					}
					log.info(dtoName + "字段长度过长，截取前" + value + "位");
					value = value.substring(0,trc.getField_length()/2);
				}
				if(value.length() > 9){
					len = value.length()+"";
				}else{
					len = "0" + value.length();
				}
			}
			sb.append(trc.getField_name());
			sb.append(len);
			sb.append(value);
		}
		try {
			byte[] message = sb.toString().getBytes("GBK");
			length  = message.length + "";
			if(length.length()< 4){
				if(length.length() == 3) length = " " + length;
				else if(length.length() == 2) length = "  " + length;
			}
			resByte = (length + sb.toString()).getBytes("GBK");
		} catch (UnsupportedEncodingException e) {
			log.error("",e);
			e.printStackTrace();
		}
		return resByte;
	}
	
	/**
	 * 当正常逻辑处理发生异常时，通过此方法生成响应信息。
	 * @param  reqMap
	 * @param  trm
	 * @return byte[]  
	 * @author zcl
	 * @date 2015-4-21
	 */
	public byte[] createErrorReturnMessage(String transCode ,TransResManager trm,String errorMessage){
		Map<String,Object> resMap = new HashMap<String,Object>();
		resMap.put("errorMsg", errorMessage);
		//返回报文
		byte[] resByte = null;
		//拼装报文头
		StringBuffer sb = new StringBuffer();
		//报文总长度，不包含自己
		String length = "";
		sb.append(transCode);//6位交易码
		sb.append("0000000000000000000");//19位交易流水号,错误响应，不需要流水号
		sb.append("999999");//6位柜面响应代码,
		sb.append("0");//是否有文件传输
		//首先将字段映射配置信息转换成map，便于生成报文时使用
		List<TransResConfig> list = trm.getReqConfigList();
		Map<Integer,TransResConfig> tempMap = new HashMap<Integer,TransResConfig>();
		for(TransResConfig trc : list){
			tempMap.put(trc.getField_order(), trc);
		}

		for(int i=1;i< tempMap.size()+1; i++){
			TransResConfig trc = tempMap.get(i);
			if(trc == null) log.error(trm.getCode() + "接口未找到field_order为"+ i + "的配置信息");
			//获取域号
			String dtoName = trc.getDto_name();
			String value = "";
			String len = "00";
			if(resMap.get(dtoName) == null){
				log.info("在柜面服务返回数据中查找" + dtoName + "的值，发现为null");
			}else{
				value = resMap.get(dtoName).toString();
				//如果返回字段超出最大长度的话，截取最大长度位
				if(value.getBytes().length > trc.getField_length()){
					if(trc.getField_length() > 99){
						log.error("字段长度不能超过99位");
						return null;
					}
					log.info(dtoName + "字段长度过长，截取前" + value + "位");
					value = value.substring(0,trc.getField_length());
				}
				if(value.length() > 9){
					len = value.length()+"";
				}else{
					len = "0" + value.length();
				}
			}
			sb.append(trc.getField_name());
			sb.append(len);
			sb.append(value);
		}
		try {
			byte[] message = sb.toString().getBytes("GBK");
			length  = message.length + "";
			if(length.length()< 4){
				if(length.length() == 3) length = " " + length;
				else if(length.length() == 2) length = "  " + length;
			}
			resByte = (length + sb.toString()).getBytes("GBK");
		} catch (UnsupportedEncodingException e) {
			log.error("",e);
			e.printStackTrace();
		}
		return resByte;
	}
	
	
	/**
	 * 调用pbMFService服务，传入请求参数Map,返回响应信息Map
	 * @param reqmap
	 * @param    
	 * @return Map<String,Object>  
	 * @throws 
	 * @author zcl
	 * @date 2015-4-17
	 */
	public Map<String,Object> callPBService(Map<String,Object> reqmap){
		String tradeCode = reqmap.get("tradeCode").toString().trim();
		try {
			Map<String,Object> map = (Map<String,Object>) serviceMap.get(tradeCode).invoke(pbMFService, reqmap);
			return map;
		} catch (Exception e) {
			log.error("调用" + tradeCode +"失败,",e);
		}
		return null;
	}
	
	/**
	 * 系统启动时，加载所有接口服务
	 * @author zcl
	 * @date 2015-4-17
	 */
	public static void loadPBService(){
		try {
			Class<?> clazz = Class.forName("grp.pt.pb.trans.model.PBMessageForwardService");
			pbMFService = (PBMessageForwardService) clazz.newInstance();
			Method[] mArr = clazz.getMethods();
			for(Method m : mArr){
				PBService service = (PBService)m.getAnnotation(PBService.class);
				if(service != null){
					serviceMap.put(service.transCode(), m);
					log.info("扫描类grp.pt.pb.trans.model.PBMessageForwardService，发现柜面接口服务："  + service.transCode());
				}
			}
		} catch (ClassNotFoundException e) {
			log.error("柜面接口服务启动失败,加载grp.pt.pb.trans.model.PBMessageForwardService出错",e);
		} catch (InstantiationException e) {
			log.error("柜面接口服务启动失败,实例化PBMessageForwardService对象失败",e);
		} catch (IllegalAccessException e) {
			log.error("柜面接口服务启动失败,实例化PBMessageForwardService对象失败",e);
		}
	}
	
	/**
	 * 原【读取用户登录获取验证码】功能代码.<br>
	 * 由于此自动任务需处理所有柜面作为服务端的接口，故暂时抽出此方法。待以后修改
	 * @param socket
	 * @param out
	 * @param in   
	 * @return void   
	 * @author zcl
	 * @date 2015-4-16
	 */
	public void oldMethod(Socket socket, OutputStream out, InputStream in) {
		try {

			log.debug("--读取用户登录获取验证码请求报文信息开始！*******************************");
			// 读取请求报文头
			MsgParser msgParse = context.newMessageParser();
			MsgReqBody reqBody = msgParse.parseReqContent(in);
			log.debug("--读取用户登录获取验证码请求报文信息结束！*******************************");

			// 校验码
			String verifyCodeStr = "";
			// 响应信息
			String responseMsg = "";

			// 用户登录获取验证码
			// 查询用户
			PbUser user = userService.loadPbUser(reqBody.getObjs()[0]
					.toString());
			String responseCode = null;
			// 请求的用户编码的用户存在，生成校验码
			if (user != null) {
				final UserVerifyCodeDTO verifyCodeDTO = new UserVerifyCodeDTO();
				// 请求用户编码
				verifyCodeDTO.setUser_code(reqBody.getObjs()[0].toString());

				// 获取请求主机IP
				InetAddress address = socket.getInetAddress();
				String reqIp = address.getHostAddress();
				verifyCodeDTO.setRequest_ip(reqIp);

				// 生成校验码
				Random random = new Random();
				for (int i = 0; i < 6; i++) {
					verifyCodeStr += random.nextInt(9);
				}
				verifyCodeDTO.setVerify_code(verifyCodeStr);
				// 设置请求时间，和截止时间，有效时间为30分钟
				long ctm = System.currentTimeMillis();
				verifyCodeDTO.setRequest_time(new Timestamp(ctm));
				verifyCodeDTO.setEnd_time(new Timestamp(ctm + 30 * 60 * 1000));

				try {
					smallTrans.newTransExecute(new ISmallTransService() {

						public void doExecute() throws Exception {
							// 保存校验码
							verifyLoginDAO.insertVerifyCode(verifyCodeDTO);
						}
					});
				} catch (Exception e1) {
					responseCode = "000001";
					responseMsg = "验证码保存异常！";
					log.error("验证码保存异常！");
				}
			} else {
				responseCode = "000001";
				responseMsg = "请求的操作员不存在";
			}
			// 响应报文头

			if (verifyCodeStr == null || "".equals(verifyCodeStr)) {
				responseCode = "000001";
				responseMsg = "请求的操作员不存在！";
			} else {
				responseCode = "000000";
				responseMsg = "获取成功！";
			}

			// MsgResBody resBody = msgParse.newMessage(responseCode,
			// verifyCodeStr, null,
			// null, responseCode, MsgConstant.QUERY_USERCODE,
			// reqBody.getReqHead().getTradeId());
			// System.out.println(reqBody.getReqHead().getTradeId());
			MsgResBody resBody = msgParse.newMessage(
					MsgConstant.QUERY_USERCODE, reqBody.getReqHead()
							.getTradeId(), responseCode, responseMsg,
					verifyCodeStr);
			ByteArrayOutputStream resOut = new ByteArrayOutputStream();
			resOut.write(resBody.readResHead());
			resOut.write(resBody.readResMsgBody());
			log.info("返回码：" + responseCode);
			log.info("返回信息：" + responseMsg);
			log.info("验证码：" + verifyCodeStr);
			/*
			 * 广西建行验证码报文加密 add FWQ
			 */
			if ("GXCCB".equals(context.getTransName())) {
				log.info("######响应明文报文：" + new String(resOut.toByteArray()));
				String reqMesg = new String(resOut.toByteArray());
				String reqMesgNoLen = reqMesg.substring(4, reqMesg.length());
				String reqMesgSec = new String(Security.ENCRYPT(
						msgHeadSecurity, reqMesgNoLen.getBytes()));
				String reqMesgLen = new String(TransUtil.getFixlenStrBytes(
						reqMesgSec.length() + "", 4));
				byte[] allResMesg = (reqMesgLen + reqMesgSec).getBytes();
				log.info("######响应密文报文：" + new String(allResMesg));
				out.write(allResMesg);
			} else {
				out.write(resOut.toByteArray());
			}
			out.flush();

		} catch (IOException e) {
			e.printStackTrace();
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
}
