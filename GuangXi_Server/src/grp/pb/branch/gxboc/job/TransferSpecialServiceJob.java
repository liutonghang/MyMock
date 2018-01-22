package grp.pb.branch.gxboc.job;

import grp.pb.branch.gxboc.service.GXBOCBLConstant;
import grp.pb.branch.gxboc.service.GXBOCBLMsgHead;
import grp.pb.branch.gxboc.service.GXBOCBLMsgParser;
import grp.pb.branch.gxboc.service.GXBOCBLMsgReqBody;
import grp.pb.branch.gxboc.service.GXBOCBLMsgResBody;
import grp.pb.branch.gxboc.service.GXBOCBLRealPayServiceImpl;
import grp.pb.branch.gxboc.service.GXBOCBLServiceImpl;
import grp.pb.branch.gxboc.service.MsgHead;
import grp.pb.branch.gxboc.service.MsgResBody;
import grp.pt.bill.Billable;
import grp.pt.bill.ConditionObj;
import grp.pt.bill.ConditionPartObj;
import grp.pt.database.sql.SimpleQuery;
import grp.pt.pb.common.AutoJobAdapter;
import grp.pt.pb.common.model.BankAccount;
import grp.pt.pb.exception.PbException;
import grp.pt.pb.payment.PayService;
import grp.pt.pb.payment.PayVoucher;
import grp.pt.pb.realpay.RealPayVoucher;
import grp.pt.pb.trans.util.Context;
import grp.pt.pb.trans.util.MsgConstant;
import grp.pt.pb.trans.util.SocketUtil;
import grp.pt.pb.util.PbUtil;
import grp.pt.pb.util.SessionUtil;
import grp.pt.pb.util.StaticApplication;
import grp.pt.pb.util.VtConstant;
import grp.pt.util.BaseDAO;
import grp.pt.util.BeanFactoryUtil;
import grp.pt.util.DateTimeUtils;
import grp.pt.util.NumberUtil;
import grp.pt.util.StringUtil;
import grp.pt.util.model.Session;
import grp.pt.util.transation.ISmalTrans;
import grp.pt.util.transation.ISmallTransService;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.math.BigDecimal;
import java.net.ServerSocket;
import java.net.Socket;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collection;
import java.util.List;

import org.apache.log4j.Logger;

import com.river.common.UploadFileUtil;

/****
 * 转账特殊接口服务
 * @author 
 * 描述
 * 接收银行核心2000待处理凭证请求报文并解析，拼装000待确认支付凭证报文并发送银行核心
 * 接收银行核心2002支付凭证确认报文并解析，拼装002支付凭证确认回执报文并发送银行核心
 *
 */
public class TransferSpecialServiceJob extends AutoJobAdapter {
  
 private Logger logger = Logger.getLogger(TransferSpecialServiceJob.class);
  
  @SuppressWarnings("unused")
  private static boolean interrupt = false;
  
  private static BaseDAO baseDao;
  
  static Context context = new Context();
  
  private static String  updatePayVouIsLoad = "update pb_pay_voucher set BLLoadTime=? , Payuser_Code = ? ";
  
  private static String  updateRealPayVouIsLoad = "update pb_realpay_budget_voucher set BLLoadTime=? , Payuser_Code = ? ";
  
//  public Session sc = null;
  
  private static PayService payService;
  
  
  private static  GXBOCBLRealPayServiceImpl realPayBlService;
  
 

// 定义服务端ocket服务
  private static ServerSocket serverSocket = null;
  
  private static int MAX_PAGE_SIZE = 0;
  
  private static int MAX_QUREY_VOU_SIZE = 70;
  //现金操作标识
  //private static String CASHFLAG = "9"; 
  
  static{
	  

	  if(realPayBlService == null){
		  realPayBlService = (GXBOCBLRealPayServiceImpl) BeanFactoryUtil.getBean("pb.trans.bs.GXBOCBLRealPayServiceImpl");
	  }
	  if(baseDao==null){
		  baseDao = StaticApplication.getBaseDAO();
	  }
	  if(payService==null){
		  payService = StaticApplication.getPayService();
		 // transService =  (ITransService) PlatformUtils.getProperty(payService, "transService");
	  }
	  if(MAX_PAGE_SIZE == 0){
		  MAX_PAGE_SIZE = Integer.parseInt(UploadFileUtil.getFromPro("gxbocbl", "BL.PageSize"));
	  }
	  
  }

  @Override
  public void executeJob() {
  	  initCurrSession();
  	  new Thread(new SocketListener()).start();
  	
  }
  
  /**
   * 启动ocket监听
   * @author 柯伟
   */
  class SocketListener implements Runnable {
    public void run() {
      try {
        logger.info("-------读取pecial监听端口 + context.getSpecialPort()");
        serverSocket = new ServerSocket(context.getSpecialPort());
        while (true) {
          final Socket socket = serverSocket.accept();
          logger.info("-------监听到请求 + context.getSpecialPort()");
          invoke(socket);
        }
      } catch (IOException ex) {
        ex.printStackTrace();
      } catch (Exception ex) {
        ex.printStackTrace();
      }
    }
    
    private void invoke(final Socket socket) throws Exception {
      // 服务端每读取到一个请求，启动一个相应的线程处理
      new Thread(new Runnable() {
        @SuppressWarnings("deprecation")
		public void run() {
        	InputStream in = null;
        	OutputStream out = null;
        	MsgResBody resBody = null;
        	//响应报文头
        	MsgHead resHead = null;
        	try {
        		in = socket.getInputStream();
        		out = socket.getOutputStream();
        		final Session sc = new Session();
        		// 读取请求报文头
        		GXBOCBLMsgParser msgParse = new GXBOCBLMsgParser();
        		
        		byte[] headBytes = SocketUtil.read(in,MsgConstant.GXBOC_REQHEADLEN + 5);
        		
        		logger.info("###读取通讯报文头"+ new String(headBytes,"GBK"));
        		
        		final GXBOCBLMsgHead reqHead = (GXBOCBLMsgHead) msgParse.parseReqHead(headBytes);
        		final GXBOCBLMsgReqBody reqBody = (GXBOCBLMsgReqBody) msgParse.parseReqContent(in,reqHead);
        		sc.setBelongOrgCode(reqHead.getBank_no().toString());
        		sc.setUserCode(reqHead.getOperator());
        		Calendar calendar = Calendar.getInstance();
        		int stYear = calendar.get(Calendar.YEAR);
        		sc.setBusiYear(stYear);
        		
        		int total =  1; //总页码数
        		int num = 1 ; //总笔数
        		int now_page =  1; //当前页码
        		int page_size = MAX_PAGE_SIZE; //页码明细数
            
        	final	GXBOCBLServiceImpl blService = new GXBOCBLServiceImpl();
        		
        		//网点账户权限列表查询，交易码为2401
        		if(reqHead.getTradeCode().equalsIgnoreCase(MsgConstant.GXBOC_NETWORK_USER_QUERY)){
            	
        			List<BankAccount> acctList = blService.netWorkUserQuery(sc, reqHead, reqBody);
              
        			if(acctList.size()==0){
        				throw new Exception("当前网点未查询到可操作的账户");
        			}
        			
        			num = acctList.size(); //总笔数
          
        			resBody = msgParse.newMessage(MsgConstant.GXBOC_NETWORK_USER_QUERY_RESP,acctList);
        			byte [] bodyBytes = resBody.readResMsgBody();
        			resHead = new GXBOCBLMsgHead(bodyBytes.length + GXBOCBLMsgHead.MSGHEADLENGTH, "0000",total, num, now_page, num, "");
        			resBody.setResHead(resHead);
        			ByteArrayOutputStream byteOut = new ByteArrayOutputStream();
	                logger.info("(2401)响应报文头"+new String(resBody.readResHead(),"GBK"));
	                byteOut.write(resBody.readResHead());
	                logger.info("(2401)响应报文体"+new String(resBody.readResMsgBody(),"GBK"));
	                byteOut.write(resBody.readResMsgBody());

	                out.write(byteOut.toByteArray());
	                out.flush();  
        		}
        		
        		//查询当前确认支付的凭证列表，交易码为2000
        		else if (reqHead.getTradeCode().equalsIgnoreCase(MsgConstant.GXBOC_VOU_UNCF_LOAD)) {
//         
        			List<Billable> list = new ArrayList<Billable>();
        			String voucher_id ;
        			String updateSql ;
        			if(GXBOCBLConstant.BL_REALPAY_FLAG.equals(reqHead.getVt_type())){
        				
        				list.addAll(realPayBlService.loadNotDisposeRealPayVou(sc, reqHead, reqBody, context));
        				voucher_id = "realpay_voucher_id";
        				updateSql = updateRealPayVouIsLoad;
        			
        			}else{
        				
        				list.addAll(blService.loadUncfVou(sc, reqHead, reqBody, context));
        				voucher_id = "pay_voucher_id";
        				updateSql = updatePayVouIsLoad;
        			}		
        			//List<PayVoucher> list = blService.loadUncfVou(sc, reqHead, reqBody, context); 

        			num = list.size(); //总笔数
        			if(num==0){
        				throw new Exception("未查询到凭证或凭证锁定未解除");  
        			} else if(num < MAX_PAGE_SIZE) {
        				total = 1;
        			} else if (num % MAX_PAGE_SIZE != 0) {
        				total = num / MAX_PAGE_SIZE + 1;
        			} else {
        				total = num / MAX_PAGE_SIZE;
        			}

        			page_size = list.size()>MAX_PAGE_SIZE?page_size: list.size();
        			
        			List<Billable> vouList = list.subList(0, page_size);
        			
        			StringBuffer where=new StringBuffer();
        			
        			long blDownLoadTime = DateTimeUtils.getLastVer();
        			
        			System.out.println("下载时间轴"+blDownLoadTime);
        			//跟新数据下载时间
        			if(vouList.size()!=0){
        				where.append("where "+voucher_id +" in (");
        				for(Billable tempVoucher:vouList){
        					where.append(tempVoucher.getId()+","); 
        				}
        				String selectWhere = where.toString();
        				selectWhere = selectWhere.substring(0, selectWhere.length()-1)+")";
        				baseDao.execute(updateSql+selectWhere, new Object[]{blDownLoadTime,reqHead.getOperator()});
        			}  
        			
        			PbUtil.batchSetValue(vouList,"blLoadTime",blDownLoadTime);
        			
        			resBody = msgParse.newMessage(MsgConstant.GXBOC_VOU_UNCF_LOAD_RESP,vouList);
        			
        			byte [] bodyBytes = resBody.readResMsgBody();
        			
        			resHead = new GXBOCBLMsgHead(bodyBytes.length + GXBOCBLMsgHead.MSGHEADLENGTH, "0000",total, num, now_page, page_size, "");
        			
        			resBody.setResHead(resHead);
        			ByteArrayOutputStream byteOut = new ByteArrayOutputStream();
        			byteOut.write(resBody.readResHead());
        			byteOut.write(resBody.readResMsgBody());
               
        			logger.info("(1000)响应报文：" + byteOut.toString("GBK"));
        			out.write(byteOut.toByteArray());
        			out.flush();
        		}
        		
          
        		//支付凭证确认（或退回）请求（2002）
        		else if(reqHead.getTradeCode().equalsIgnoreCase(MsgConstant.GXBOC_VOU_SURE_BACK)){
            	
        			List<Billable> blVoucherList = new ArrayList<Billable>();
        			
        			List<Billable> dbVoucherList = new ArrayList<Billable>();
            	 
        			blVoucherList = getBLVoucherList(reqHead,reqBody);
            	 
        			dbVoucherList = getDBVoucherList(sc,reqHead,reqBody);
        			if(GXBOCBLConstant.BL_REALPAY_FLAG.equals(reqHead.getVt_type())){
        				List<RealPayVoucher> blRealPayVoucherList = new ArrayList<RealPayVoucher>();
        				blRealPayVoucherList.addAll((Collection<? extends RealPayVoucher>) blVoucherList);
        				
        				List<RealPayVoucher> dbRealPayVoucherList = new ArrayList<RealPayVoucher>();
        				dbRealPayVoucherList.addAll((Collection<? extends RealPayVoucher>) dbVoucherList);
        				
        				if(checkRealPayVoucher(blRealPayVoucherList,dbRealPayVoucherList)){
        					if(dbRealPayVoucherList.size()==1){

            					try{
            						realPayBlService.disposeRealPayVou(sc,dbRealPayVoucherList);
            					}catch(Exception e){
            						throw new Exception(e.getMessage());
            					}
            					resBody = msgParse.newMessage(MsgConstant.GXBOC_VOU_SURE_BACK_RESP,dbRealPayVoucherList,GXBOCBLConstant.BL_REALPAY_FLAG);
            					byte [] bodyBytes = resBody.readResMsgBody();

            						resHead = new GXBOCBLMsgHead(bodyBytes.length + GXBOCBLMsgHead.MSGHEADLENGTH, "0000",1, 1, 1, 1, "");

            					resBody.setResHead(resHead);
            					ByteArrayOutputStream byteOut = new ByteArrayOutputStream();
            					logger.info("(2002)响应报文头"+new String(resBody.readResHead(),"GBK"));
            					byteOut.write(resBody.readResHead());
            					logger.info("(2002)响应报文体"+new String(resBody.readResMsgBody(),"GBK"));
            					byteOut.write(resBody.readResMsgBody());
            					out.write(byteOut.toByteArray());
            					out.flush();
            				}else if(dbRealPayVoucherList.size()>1){
                			 //如果说报文头里的笔数与报文体里面的笔数对应不上、则提示接收失败
                			 //返回的报文头里的标志位也是失败的
                			 //对接收的数据不进行处理 抛弃
            					resBody = msgParse.newMessage(MsgConstant.GXBOC_VOU_UNCF_LOAD_RESP,dbRealPayVoucherList,GXBOCBLConstant.BL_REALPAY_FLAG);
           				     	byte [] bodyBytes = resBody.readResMsgBody();
           				     	resHead = new GXBOCBLMsgHead(bodyBytes.length + GXBOCBLMsgHead.MSGHEADLENGTH, "0000",1, 1, 1, 1, "");
           				     	resBody.setResHead(resHead);
           				     	ByteArrayOutputStream byteOut = new ByteArrayOutputStream();
           				     	logger.info("响应报文头"+new String(resBody.readResHead(),"GBK"));
           				     	byteOut.write(resBody.readResHead());
           				     	logger.info("响应报文体"+new String(resBody.readResMsgBody(),"GBK"));
           				     	byteOut.write(resBody.readResMsgBody());
           				     	logger.info("响应报文：" + byteOut.toString());
           				     	out.write(byteOut.toByteArray());
           				     	out.flush();
           				     	try{
           				     		realPayBlService.disposeRealPayVou(sc,dbRealPayVoucherList);
           				     	}catch(Exception e){
           				     		logger.info("批量操作失败..."+e.getMessage());
           				     	}
                		 }
        				}
        				
        			}else{
        				
        				List<PayVoucher> blPayVoucherList = new ArrayList<PayVoucher>();
        				blPayVoucherList.addAll((Collection<? extends PayVoucher>) blVoucherList);
        				
        				List<PayVoucher> dbPayVoucherList = new ArrayList<PayVoucher>();
        				dbPayVoucherList.addAll((Collection<? extends PayVoucher>) dbVoucherList);
        				
        				if(checkPayVoucher(blPayVoucherList,dbPayVoucherList)){
            				if(dbPayVoucherList.size()==1){
            					try{
            							blService.payAffirm(sc, dbPayVoucherList);
            					}catch(Exception e){
            						throw new Exception(e.getMessage());
            					}
            					resBody = msgParse.newMessage(MsgConstant.GXBOC_VOU_SURE_BACK_RESP,dbPayVoucherList);
            					byte [] bodyBytes = resBody.readResMsgBody();

            						resHead = new GXBOCBLMsgHead(bodyBytes.length + GXBOCBLMsgHead.MSGHEADLENGTH, "0000",1, 1, 1, 1, "");

            					resBody.setResHead(resHead);
            					ByteArrayOutputStream byteOut = new ByteArrayOutputStream();
            					logger.info("(2002)响应报文头"+new String(resBody.readResHead(),"GBK"));
            					byteOut.write(resBody.readResHead());
            					logger.info("(2002)响应报文体"+new String(resBody.readResMsgBody(),"GBK"));
            					byteOut.write(resBody.readResMsgBody());
            					out.write(byteOut.toByteArray());
            					out.flush();
            				}else if(dbPayVoucherList.size()>1){
                			 //如果说报文头里的笔数与报文体里面的笔数对应不上、则提示接收失败
                			 //返回的报文头里的标志位也是失败的
                			 //对接收的数据不进行处理 抛弃
            					resBody = msgParse.newMessage(MsgConstant.GXBOC_VOU_UNCF_LOAD_RESP,dbPayVoucherList);
           				     	byte [] bodyBytes = resBody.readResMsgBody();
           				     	resHead = new GXBOCBLMsgHead(bodyBytes.length + GXBOCBLMsgHead.MSGHEADLENGTH, "0000",1, 1, 1, 1, "");
           				     	resBody.setResHead(resHead);
           				     	ByteArrayOutputStream byteOut = new ByteArrayOutputStream();
           				     	logger.info("响应报文头"+new String(resBody.readResHead(),"GBK"));
           				     	byteOut.write(resBody.readResHead());
           				     	logger.info("响应报文体"+new String(resBody.readResMsgBody(),"GBK"));
           				     	byteOut.write(resBody.readResMsgBody());
           				     	logger.info("响应报文：" + byteOut.toString());
           				     	out.write(byteOut.toByteArray());
           				     	out.flush();
           				     	try{
           				     		blService.payAffirm(sc, dbPayVoucherList);
           				     	}catch(Exception e){
           				     		logger.info("批量操作失败..."+e.getMessage());
           				     	}
                		 }
                	 }
        			}
        			
        			//数据校验通过
        			
            }
            //指定凭证号查询请求（2004）
            else if(reqHead.getTradeCode().equalsIgnoreCase(MsgConstant.GXBOC_VOU_QUERY)){
            	
            	int pageNo = Integer.parseInt(reqBody.getObjs()[2].toString());
            	
            	
            	
            	if(GXBOCBLConstant.BL_REALPAY_FLAG.equals(reqHead.getVt_type())){
            		
            		List<RealPayVoucher> dbRealpayVouList = realPayBlService.queryRealPayVoucherByVouNo(sc, reqHead, reqBody);
            		
            		if(dbRealpayVouList.get(0).getDetails().size()==0){
                		
                		num = 1;
                		total = 1;
                		page_size = 1;
                	
                	}else{
                		num = dbRealpayVouList.get(0).getDetails().size(); //总笔数
                		if (num < MAX_PAGE_SIZE) {
                			total = 1;
                			page_size = num;
                		} else if (num % MAX_PAGE_SIZE != 0) {
                			total = num / MAX_PAGE_SIZE + 1;
                		} else {
                			total = num / MAX_PAGE_SIZE;
                		}
                		if(pageNo>=total){
                			page_size = num - MAX_PAGE_SIZE*(total-1);
                			now_page = total;
                		}else {
                			now_page = pageNo;
                		}
                		
                		List<Billable> dbtempPayRequestList = dbRealpayVouList.get(0).getDetails().subList((now_page-1)*MAX_PAGE_SIZE, (now_page-1)*MAX_PAGE_SIZE+page_size);
              	  		
                		PbUtil.setBillDetails(dbRealpayVouList, dbtempPayRequestList, "pay_voucher_id");
                	}
                 
                	resBody = msgParse.newMessage(MsgConstant.GXBOC_VOU_QUERY_RESP,dbRealpayVouList,reqHead.getVt_type());
                	
            	}else{
            		List<PayVoucher> dbPayVoucherList = blService.clearPayVoucherQueryByVouNo(sc, reqHead, reqBody);
            		
            		if(dbPayVoucherList.get(0).getDetails().size()==0){
                		
                		num = 1;
                		total = 1;
                		page_size = 1;
                	
                	}else{
                		num = dbPayVoucherList.get(0).getDetails().size(); //总笔数
                		if (num < MAX_PAGE_SIZE) {
                			total = 1;
                			page_size = num;
                		} else if (num % MAX_PAGE_SIZE != 0) {
                			total = num / MAX_PAGE_SIZE + 1;
                		} else {
                			total = num / MAX_PAGE_SIZE;
                		}
                		if(pageNo>=total){
                			page_size = num - MAX_PAGE_SIZE*(total-1);
                			now_page = total;
                		}else {
                			now_page = pageNo;
                		}
                		
                		List<Billable> dbtempPayRequestList = dbPayVoucherList.get(0).getDetails().subList((now_page-1)*MAX_PAGE_SIZE, (now_page-1)*MAX_PAGE_SIZE+page_size);
              	  		
                		PbUtil.setBillDetails(dbPayVoucherList, dbtempPayRequestList, "pay_voucher_id");
                	}
                 
                	resBody = msgParse.newMessage(MsgConstant.GXBOC_VOU_QUERY_RESP,dbPayVoucherList,reqHead.getVt_type());
      				
      
            	}
            	
            
            	
            	
            	byte [] bodyBytes = resBody.readResMsgBody();
            	
            	resHead = new GXBOCBLMsgHead(bodyBytes.length + GXBOCBLMsgHead.MSGHEADLENGTH, "0000",total, num, now_page, page_size, "");

			    resBody.setResHead(resHead);
			    ByteArrayOutputStream byteOut = new ByteArrayOutputStream();
			    logger.info("(2004)响应报文头"+new String(resBody.readResHead(),"GBK"));
			    byteOut.write(resBody.readResHead());
			    logger.info("(2004)响应报文体"+new String(resBody.readResMsgBody(),"GBK"));
			    byteOut.write(resBody.readResMsgBody());
			    out.write(byteOut.toByteArray());
			    out.flush();             	  
         	  
            }
            //退款通知书录入请求（2005）
            else if(reqHead.getTradeCode().equalsIgnoreCase(MsgConstant.GXBOC_VOU_BACK)){
            	
            	
            	if(GXBOCBLConstant.BL_REALPAY_FLAG.equals(reqHead.getVt_type())){
            		realPayBlService.inputRefundRealPayVoucher(sc, reqHead, reqBody);
            	}else{
            		blService.inputRefundVoucherAndPay(sc, reqHead, reqBody);
            		
            		//启用事务，临时这样修改,所有使用GXBOCBLServiceImpl类的都存在事务问题
            		//edit by liutianlong 2016年3月31日	xcg
//            		ISmalTrans smalTrans = (ISmalTrans) StaticApplication.getBean("smallTranService");
//            		
//            		smalTrans.newTransExecute(new ISmallTransService() {
//						@Override
//						public void doExecute() throws Exception {
//							blService.inputRefundVoucherAndPay(sc, reqHead, reqBody);
//						}
//					});
            	}
            	//List<PayVoucher> dbReundPayVoucherList =        	
    			
            	resBody = msgParse.newMessage(MsgConstant.GXBOC_VOU_BACK_RESP,reqBody);
                
            	byte [] bodyBytes = resBody.readResMsgBody();
  	            
            	resHead = new GXBOCBLMsgHead(bodyBytes.length + GXBOCBLMsgHead.MSGHEADLENGTH, "0000",total, num, now_page, 1, "");
  			    
            	resBody.setResHead(resHead);
  			    
            	ByteArrayOutputStream byteOut = new ByteArrayOutputStream();
  			    
            	logger.info("(1005)响应报文头"+new String(resBody.readResHead(),"GBK"));
  			    
            	byteOut.write(resBody.readResHead());
  			    
  			    logger.info("(1005)响应报文体"+new String(resBody.readResMsgBody(),"GBK"));
  			    
  			    byteOut.write(resBody.readResMsgBody());
  			 
  			    out.write(byteOut.toByteArray());
  			    
  			    out.flush();
            	
            }
            //历史凭证查询请求（2009）
            else if(reqHead.getTradeCode().equalsIgnoreCase(MsgConstant.GXBOC_VOU_HISTORY_BACK)){
            	List<Billable> vouList = new ArrayList<Billable>();
            	if(GXBOCBLConstant.BL_REALPAY_FLAG.equals(reqHead.getVt_type())){
            		vouList.addAll(realPayBlService.querySendBackRealVoucher(sc, reqHead, reqBody));
            	}else {
            		vouList.addAll(blService.clearPayVoucherQuery(sc, reqHead, reqBody));
            	}
          	    
          	  
          	    resBody = msgParse.newMessage(MsgConstant.GXBOC_VOU_HISTORY_BACK_RESP,vouList,reqHead.getVt_type());
			    
          	    byte [] bodyBytes = resBody.readResMsgBody();
			    
          	    if(vouList.size()==0){
			    	resHead = new GXBOCBLMsgHead(GXBOCBLMsgHead.MSGHEADLENGTH, "0001",1, 1, 1, 1, "未查询到历史凭证、请核对查询信息");
	          	}else if(vouList.size()>MAX_PAGE_SIZE){
	          		resHead = new GXBOCBLMsgHead(GXBOCBLMsgHead.MSGHEADLENGTH, "0001",1, 1, 1, 1, "查询历史数据量过大");
	          	}else {
	          		resHead = new GXBOCBLMsgHead(bodyBytes.length + GXBOCBLMsgHead.MSGHEADLENGTH, "0000",1, vouList.size(), 1, vouList.size(), "");
	          	}
			    resBody.setResHead(resHead);
			   
			    ByteArrayOutputStream byteOut = new ByteArrayOutputStream();
			    logger.info("(1009)响应报文头"+new String(resBody.readResHead(),"GBK"));
			    byteOut.write(resBody.readResHead());
			    logger.info("(1009)响应报文体"+new String(resBody.readResMsgBody(),"GBK"));
			    byteOut.write(resBody.readResMsgBody());
			    out.write(byteOut.toByteArray());
			    out.flush();
            	
          }
          //按日期查询凭证状态
          else if(reqHead.getTradeCode().equalsIgnoreCase(GXBOCBLConstant.GXBOC_VOUCHER_QUREY)){
        	 
        	  List<Billable> voulist = new ArrayList<Billable>();
        	  
        	  if(GXBOCBLConstant.BL_REALPAY_FLAG.equals(reqHead.getVt_type())){
        		  voulist.addAll(realPayBlService.realvoucherQuery(sc, reqHead, reqBody));
        	  }else {
        		  voulist.addAll(blService.voucherQuery(sc, reqHead, reqBody));
        	  }
        	  
        	  int queryPageNo = Integer.parseInt(reqBody.getObjs()[4].toString());
        	  num = voulist.size(); //总笔数

        	  if(num==0){
  					throw new Exception("未查询到凭证或凭证锁定未解除");  
        	  } else if(num < MAX_QUREY_VOU_SIZE) {
  					total = 1;
  			  } else if (num % MAX_QUREY_VOU_SIZE != 0) {
  				  	total = num / MAX_QUREY_VOU_SIZE + 1;
  			  } else {
  				  	total = num / MAX_QUREY_VOU_SIZE;
  			  }

        	  if(total<=queryPageNo){
        		  now_page = total;
        		  page_size = num - (total-1)*MAX_QUREY_VOU_SIZE;
        	  }else{
        		  now_page = queryPageNo;
        		  page_size = MAX_QUREY_VOU_SIZE;
        	  }
        	  
  			  List<Billable> vouList = voulist.subList((now_page-1)*MAX_QUREY_VOU_SIZE, (now_page-1)*MAX_QUREY_VOU_SIZE+page_size);
  			  
  			  resBody = msgParse.newMessage(GXBOCBLConstant.GXBOC_VOUCHER_QUREY_RESP,vouList,reqBody.getObjs()[3].toString(),reqHead.getVt_type());
			    
         	  byte [] bodyBytes = resBody.readResMsgBody();
			    
         	  BigDecimal totalAmt =  BigDecimal.ZERO;
	          
	          for (Billable vou:voulist){
	        	  totalAmt = totalAmt.add(vou.getAmount()); 
	          }
	          
	          resHead = new GXBOCBLMsgHead(bodyBytes.length + GXBOCBLMsgHead.MSGHEADLENGTH, "0000",total, num, now_page, page_size, "",totalAmt);
	          
	          resBody.setResHead(resHead);
	          
			  ByteArrayOutputStream byteOut = new ByteArrayOutputStream();
			  logger.info("(1003)响应报文头"+new String(resBody.readResHead(),"GBK"));
			  byteOut.write(resBody.readResHead());
			  logger.info("(1003)响应报文体"+new String(resBody.readResMsgBody(),"GBK"));
			  byteOut.write(resBody.readResMsgBody());
			  out.write(byteOut.toByteArray());
			  out.flush();
        	  
          }
        		//退款撤销
          else if(reqHead.getTradeCode().equalsIgnoreCase(GXBOCBLConstant.GXBOC_WAITCLEAR_REFUND_VOUCHER_QUERY)){
        	  
        	  List<Billable> dbPayVoucherList = new ArrayList<Billable>();
        	  
         	  if(GXBOCBLConstant.BL_REALPAY_FLAG.equals(reqHead.getVt_type())){
         		 dbPayVoucherList.addAll(realPayBlService.loadRefundRealPayVoucher(sc, reqHead, reqBody));
        	  }else{
        		  dbPayVoucherList.addAll(blService.waitClearRefundVoucherQuery(sc, reqHead, reqBody));
        	  }
        	
        	  
        	  if(dbPayVoucherList.size()>MAX_PAGE_SIZE){
        		  throw  new Exception("查询数据量过大、查询到退款总笔数为："+dbPayVoucherList.size());
        	  }

        	  resBody = msgParse.newMessage(GXBOCBLConstant.GXBOC_WAITCLEAR_REFUND_VOUCHER_QUERY_RESP,dbPayVoucherList,reqBody.getObjs()[1].toString(),reqHead.getVt_type());
			    
          	  byte [] bodyBytes = resBody.readResMsgBody();
			    
	          resHead = new GXBOCBLMsgHead(bodyBytes.length + GXBOCBLMsgHead.MSGHEADLENGTH, "0000",1, dbPayVoucherList.size(), 1, dbPayVoucherList.size(), "");

			  resBody.setResHead(resHead);
			   
			  ByteArrayOutputStream byteOut = new ByteArrayOutputStream();
			  logger.info("(1010)响应报文头"+new String(resBody.readResHead(),"GBK"));
			  byteOut.write(resBody.readResHead());
			  logger.info("(1010)响应报文体"+new String(resBody.readResMsgBody(),"GBK"));
			  byteOut.write(resBody.readResMsgBody());
			  out.write(byteOut.toByteArray());
			  out.flush();     	  
        	  
          }
          //根据退款凭证号撤销退款凭证请求（如果已转账则需做一次请款）		
          else if(reqHead.getTradeCode().equalsIgnoreCase(GXBOCBLConstant.GXBOC_REPEAL_REFUND_VOUCHER)){
        	  
        	  List<Billable> dbPayVoucherList = new ArrayList<Billable>();
        	  
         	  if(GXBOCBLConstant.BL_REALPAY_FLAG.equals(reqHead.getVt_type())){
         		 dbPayVoucherList.addAll(realPayBlService.invalidRefundRealPayVoucher(sc, reqHead, reqBody));
        	  }else{
        		  dbPayVoucherList.addAll( blService.invalidRefundVoucher(sc, reqHead, reqBody));
        	  }
         	  
    
        	  
        	  resBody = msgParse.newMessage(GXBOCBLConstant.GXBOC_REPEAL_REFUND_VOUCHER_RESP,dbPayVoucherList.get(0),reqHead.getVt_type());
			    
          	  byte [] bodyBytes = resBody.readResMsgBody();
			    
	          resHead = new GXBOCBLMsgHead(bodyBytes.length + GXBOCBLMsgHead.MSGHEADLENGTH, "0000",1, dbPayVoucherList.size(), 1, dbPayVoucherList.size(), "");

			  resBody.setResHead(resHead);
			   
			  ByteArrayOutputStream byteOut = new ByteArrayOutputStream();
			  logger.info("(1010)响应报文头"+new String(resBody.readResHead(),"GBK"));
			  byteOut.write(resBody.readResHead());
			  logger.info("(1010)响应报文体"+new String(resBody.readResMsgBody(),"GBK"));
			  byteOut.write(resBody.readResMsgBody());
			  out.write(byteOut.toByteArray());
			  out.flush();    
          }else if(reqHead.getTradeCode().equalsIgnoreCase(GXBOCBLConstant.GXBOC_VOU_ACCREDIT_ED)){
        	  List<PayVoucher> remainamtVoucherList = blService.queryAccreditPayAmtByZEROAccountNO(sc, reqHead, reqBody);
        	  resBody = msgParse.newMessage(GXBOCBLConstant.GXBOC_VOU_ACCREDIT_ED_RESP,remainamtVoucherList);
        	  
        	  byte [] bodyBytes = resBody.readResMsgBody();			    
	          resHead = new GXBOCBLMsgHead(bodyBytes.length + GXBOCBLMsgHead.MSGHEADLENGTH, "0000",1, remainamtVoucherList.size(), 1, remainamtVoucherList.size(), "");
			  resBody.setResHead(resHead);
			   
			  ByteArrayOutputStream byteOut = new ByteArrayOutputStream();
			  logger.info("(1008)响应报文头"+new String(resBody.readResHead(),"GBK"));
			  byteOut.write(resBody.readResHead());
			  logger.info("(1008)响应报文体"+new String(resBody.readResMsgBody(),"GBK"));
			  byteOut.write(resBody.readResMsgBody());
			  out.write(byteOut.toByteArray());
			  out.flush();
          }
           
        } catch (IOException e) {
            throw new PbException("创建文件失败，请检查trans.properties属性文件中值", e);
        } catch (Exception e) {
        	resBody = new GXBOCBLMsgResBody();
        	String errorMsg ;
        	if(StringUtil.isEmpty(e.getMessage())){
        		errorMsg="";
        	}else{
        		errorMsg = e.getMessage().trim();
        	}
        	resHead = new GXBOCBLMsgHead(GXBOCBLMsgHead.MSGHEADLENGTH, "0001",1, 1, 1, 1, errorMsg);
        	resBody.setResHead(resHead);
			ByteArrayOutputStream byteOut = new ByteArrayOutputStream();
			try {
				logger.info("响应报文头"+new String(resBody.readResHead(),"GBK"));
				byteOut.write(resBody.readResHead());
				out.write(byteOut.toByteArray());
				out.flush();
			 } catch (Exception e2) {
				e2.printStackTrace();
			 }
             e.printStackTrace();
        } finally {
            logger.info("=========close开始" );
            SocketUtil.close(socket);
            logger.info("========close结束" );
        }
          
          logger.info("=========发送报文结束" );
        }
      }).start();
    }
  }
  public List<PayVoucher> getBLPayVoucherList(GXBOCBLMsgHead reqHead,GXBOCBLMsgReqBody reqBody){
	  List<PayVoucher> BLPayVoucherList = new ArrayList<PayVoucher>();
	  for(int i=0;i<reqHead.getNum();i++){
		  PayVoucher tempVoucher = new PayVoucher();
		  tempVoucher.setPay_voucher_code(reqBody.getObjs()[i*14+0].toString());
		  tempVoucher.setPay_amount(new BigDecimal(StringUtil.isEmpty(reqBody.getObjs()[i*14+2].toString())?"0":reqBody.getObjs()[i*14+2].toString()));
		  //tempVoucher.set(new BigDecimal(reqBody.getObjs()[i*14+2].toString()));
		  tempVoucher.setPay_date(PbUtil.getTimestamp(reqBody.getObjs()[i*14+3].toString(), null));
		  tempVoucher.setPay_summary_name(reqBody.getObjs()[i*14+4].toString());
		  tempVoucher.setPay_account_no(reqBody.getObjs()[i*14+5].toString());
		  tempVoucher.setPay_account_name(reqBody.getObjs()[i*14+6].toString());
		  //tempVoucher.setBlReqChangeType(reqBody.getObjs()[i*14+7].toString());
		  tempVoucher.setPb_set_mode_code(reqBody.getObjs()[i*14+7].toString());
		  tempVoucher.setPayee_account_bank(reqBody.getObjs()[i*14+8].toString());
		  tempVoucher.setPayee_account_no(reqBody.getObjs()[i*14+9].toString());
		  tempVoucher.setPayee_account_name(reqBody.getObjs()[i*14+10].toString());
		  tempVoucher.setPayee_account_bank_no(reqBody.getObjs()[i*14+11].toString());
		  tempVoucher.setBlLoadTime(Long.parseLong(reqBody.getObjs()[i*14+12].toString()));
		  tempVoucher.setBlReqPayOperation(Integer.parseInt(reqBody.getObjs()[i*14+13].toString()));
		  BLPayVoucherList.add(tempVoucher);
	  }
	  return BLPayVoucherList;
  }
/*  @SuppressWarnings("deprecation")
  public List<PayVoucher> getDBPayVoucherList(GXBOCBLMsgHead reqHead,GXBOCBLMsgReqBody reqBody) throws Exception{
	  String vt_Code = "" ;
	  //String account_type="" ;
	  sc.setBelongOrgCode(reqHead.getBank_no().toString());
	  sc.setUserCode(reqHead.getOperator());
	  //1直接支付、2授权支付、3实拨
	  if(GXBOCBLConstant.BL_DIRECTVOU_FLAG.equals(reqHead.getVt_type())){
		  vt_Code = VtConstant.DIRECT_VT_CODE;
		  //account_type = IBankAccountService.TYPE_MOF_ZERO_ACCOUNT;
		  sc.setCurrMenuId(Integer.parseInt(UploadFileUtil.getFromPro("gxbocbl", "BL.PLTransferVoucherMenuId")));
		  
	  }else if(GXBOCBLConstant.BL_ACCREDITVOU_FLAG.equals(reqHead.getVt_type())){
		  vt_Code = VtConstant.ACCREDIT_VT_CODE;
		  //account_type = IBankAccountService.TYPE_AGENCY_ZERO_ACCOUNT;
		  sc.setCurrMenuId(Integer.parseInt(UploadFileUtil.getFromPro("gxbocbl", "BL.PATransferVoucherMenuId")));
	  }else if(GXBOCBLConstant.BL_REALPAY_FLAG.equals(reqHead.getVt_type())){
		  throw new Exception("暂时未实现该凭证类型功能"+reqHead.getVt_type());
	  }else{
		  throw new Exception("不支持该凭证类型"+reqHead.getVt_type());
	  }
	  String selectVouNoS="";
	  if(reqHead.getNum()==1){
		  selectVouNoS=selectVouNoS+"'"+reqBody.getObjs()[0].toString()+"'";
	  }else if(reqHead.getNum()>1){
		  for (int i=0;i<reqHead.getNum();i++){
			  selectVouNoS=selectVouNoS+"'"+reqBody.getObjs()[i*14+0].toString()+"',";
		  }
		  selectVouNoS = selectVouNoS.substring(0,selectVouNoS.length()-1);
	  }
	  //根据年度、区划、凭证类型、凭证号加载凭证
	  ConditionObj conditionObj = new ConditionObj();
	  conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"YEAR",SimpleQuery.EQUAL,reqHead.getYear(),false,false,""));
	  conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"ADMDIV_CODE",SimpleQuery.EQUAL,reqHead.getAdmdiv_code(),false,false,""));
	
	  conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"VT_CODE",SimpleQuery.EQUAL,vt_Code,false,false,""));
	  conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"PAY_VOUCHER_CODE",SimpleQuery.IN,"("+selectVouNoS+")",false,false,""));
	  List<PayVoucher> dbPayVoucherList = payService.loadPayVoucherByObj(sc,conditionObj); 
	  return dbPayVoucherList;
  }
*/  
  public List<Billable> getBLVoucherList(GXBOCBLMsgHead reqHead,GXBOCBLMsgReqBody reqBody){
	  List<Billable> BLVoucherList = new ArrayList<Billable>();
	  if(GXBOCBLConstant.BL_REALPAY_FLAG.equals(reqHead.getVt_type())){
		  for(int i=0;i<reqHead.getNum();i++){
			  RealPayVoucher tempVoucher = new RealPayVoucher();
			  tempVoucher.setRealpay_voucher_code(reqBody.getObjs()[i*14+0].toString());
			  tempVoucher.setPay_amount(new BigDecimal(StringUtil.isEmpty(reqBody.getObjs()[i*14+2].toString())?"0":reqBody.getObjs()[i*14+2].toString()));
			  tempVoucher.setPay_date(PbUtil.getTimestamp(reqBody.getObjs()[i*14+3].toString(), null));
			  tempVoucher.setPay_summary_name(reqBody.getObjs()[i*14+4].toString());
			  tempVoucher.setPay_account_no(reqBody.getObjs()[i*14+5].toString());
			  tempVoucher.setPay_account_name(reqBody.getObjs()[i*14+6].toString());
			  tempVoucher.setPb_set_mode_code(reqBody.getObjs()[i*14+7].toString());
			  tempVoucher.setPayee_account_bank(reqBody.getObjs()[i*14+8].toString());
			  tempVoucher.setPayee_account_no(reqBody.getObjs()[i*14+9].toString());
			  tempVoucher.setPayee_account_name(reqBody.getObjs()[i*14+10].toString());
			  tempVoucher.setPayee_account_bank_no(reqBody.getObjs()[i*14+11].toString());
			  tempVoucher.setBlLoadTime(Long.parseLong(reqBody.getObjs()[i*14+12].toString()));
			  tempVoucher.setBlReqPayOperation(Integer.parseInt(reqBody.getObjs()[i*14+13].toString()));
			  BLVoucherList.add(tempVoucher);
		  }
	  }else{
		  for(int i=0;i<reqHead.getNum();i++){
			  PayVoucher tempVoucher = new PayVoucher();
			  tempVoucher.setPay_voucher_code(reqBody.getObjs()[i*14+0].toString());
			  tempVoucher.setPay_amount(new BigDecimal(StringUtil.isEmpty(reqBody.getObjs()[i*14+2].toString())?"0":reqBody.getObjs()[i*14+2].toString()));
			  tempVoucher.setPay_date(PbUtil.getTimestamp(reqBody.getObjs()[i*14+3].toString(), null));
			  tempVoucher.setPay_summary_name(reqBody.getObjs()[i*14+4].toString());
			  tempVoucher.setPay_account_no(reqBody.getObjs()[i*14+5].toString());
			  tempVoucher.setPay_account_name(reqBody.getObjs()[i*14+6].toString());
			  tempVoucher.setPb_set_mode_code(reqBody.getObjs()[i*14+7].toString());
			  tempVoucher.setPayee_account_bank(reqBody.getObjs()[i*14+8].toString());
			  tempVoucher.setPayee_account_no(reqBody.getObjs()[i*14+9].toString());
			  tempVoucher.setPayee_account_name(reqBody.getObjs()[i*14+10].toString());
			  tempVoucher.setPayee_account_bank_no(reqBody.getObjs()[i*14+11].toString());
			  tempVoucher.setBlLoadTime(Long.parseLong(reqBody.getObjs()[i*14+12].toString()));
			  tempVoucher.setBlReqPayOperation(Integer.parseInt(reqBody.getObjs()[i*14+13].toString()));
			  BLVoucherList.add(tempVoucher);
		  }
	  }
	  
	  return BLVoucherList;
  }
  @SuppressWarnings("deprecation")
  public List<Billable> getDBVoucherList(Session sc,GXBOCBLMsgHead reqHead,GXBOCBLMsgReqBody reqBody) throws Exception{
	  String vt_Code = "" ;
	  sc.setBelongOrgCode(reqHead.getBank_no().toString());
	  sc.setUserCode(reqHead.getOperator());
	  //1直接支付、2授权支付、3实拨
	  if(GXBOCBLConstant.BL_DIRECTVOU_FLAG.equals(reqHead.getVt_type())){
		  vt_Code = VtConstant.DIRECT_VT_CODE;
		  sc.setCurrMenuId(Integer.parseInt(UploadFileUtil.getFromPro("gxbocbl", "BL.PLTransferVoucherMenuId")));
	  }else if(GXBOCBLConstant.BL_ACCREDITVOU_FLAG.equals(reqHead.getVt_type())){
		  vt_Code = VtConstant.ACCREDIT_VT_CODE;
		  sc.setCurrMenuId(Integer.parseInt(UploadFileUtil.getFromPro("gxbocbl", "BL.PATransferVoucherMenuId")));
	  }else if(GXBOCBLConstant.BL_REALPAY_FLAG.equals(reqHead.getVt_type())){
		  vt_Code = VtConstant.APPLY_REALPAY_VT_CODE;
		  sc.setCurrMenuId(Integer.parseInt(UploadFileUtil.getFromPro("gxbocbl", "BL.RPVoucherAckownFormMenuId")));
	  }else{
		  throw new Exception("不支持该凭证类型"+reqHead.getVt_type());
	  }
	  String selectVouNoS="";
	  if(reqHead.getNum()==1){
		  selectVouNoS=selectVouNoS+"'"+reqBody.getObjs()[0].toString()+"'";
	  }else if(reqHead.getNum()>1){
		  for (int i=0;i<reqHead.getNum();i++){
			  selectVouNoS=selectVouNoS+"'"+reqBody.getObjs()[i*14+0].toString()+"',";
		  }
		  selectVouNoS = selectVouNoS.substring(0,selectVouNoS.length()-1);
	  }
	  //根据年度、区划、凭证类型、凭证号加载凭证
	  ConditionObj conditionObj = new ConditionObj();
	  List<Billable> vouList = new ArrayList<Billable>();
	  conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"YEAR",SimpleQuery.EQUAL,reqHead.getYear(),false,false,""));
	  conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"ADMDIV_CODE",SimpleQuery.EQUAL,reqHead.getAdmdiv_code(),false,false,""));	
	  conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"VT_CODE",SimpleQuery.EQUAL,vt_Code,false,false,""));
	  
	  if(GXBOCBLConstant.BL_REALPAY_FLAG.equals(reqHead.getVt_type())){
		  
		  conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"REALPAY_VOUCHER_CODE",SimpleQuery.IN,"("+selectVouNoS+")",false,false,""));
		  vouList.addAll(realPayBlService.loadRealPayVoucherByObj(sc, conditionObj));
		 
		  
	  }else{
		  
		  conditionObj.addConditionPartObj(new ConditionPartObj(SimpleQuery.AND,false,"PAY_VOUCHER_CODE",SimpleQuery.IN,"("+selectVouNoS+")",false,false,""));
	      vouList.addAll(payService.loadPayVoucherByObj(sc,conditionObj));
	  }
	 
	  return vouList;
	
  }
  /**
   * 校验数据
   * @param BLPayVoucherList
   * @param DBPayVoucherList
   * @return
 * @throws Exception 
   */
  public boolean checkPayVoucher(List<PayVoucher> blPayVoucherList,List<PayVoucher> dbPayVoucherList) throws Exception{
	  
	  if(blPayVoucherList.size()!=dbPayVoucherList.size()){
		  throw new Exception("请求的支付凭证与数据库中的支付凭证数不匹配");
	  }
	  long nowTime = DateTimeUtils.getLastVer();
	  if(blPayVoucherList.size()==1){
		  
		  if(blPayVoucherList.get(0).getPay_voucher_code().equals(dbPayVoucherList.get(0).getPay_voucher_code())){
			  if(blPayVoucherList.get(0).getBlLoadTime()!=dbPayVoucherList.get(0).getBlLoadTime()){
				  throw new Exception("凭证号："+blPayVoucherList.get(0).getPay_voucher_code()+"数据版本号不一致");
			  }else if(nowTime-blPayVoucherList.get(0).getBlLoadTime()>context.getBlDataOutTime()){
				  throw new Exception("数据操作超出有效时间"+context.getBlDataOutTime()/60000+"分钟");
			  }
			  //dbPayVoucherList.get(0).setBlReqChangeType(blPayVoucherList.get(0).getBlReqChangeType());
			  dbPayVoucherList.get(0).setPb_set_mode_code(blPayVoucherList.get(0).getPb_set_mode_code());
			  dbPayVoucherList.get(0).setBlReqPayOperation(blPayVoucherList.get(0).getBlReqPayOperation());
			  
			  if(blPayVoucherList.get(0).getPay_amount().subtract(dbPayVoucherList.get(0).getPay_amount()).compareTo(NumberUtil.BIG_DECIMAL_ZERO)>0){
				  throw new Exception("实际支付金额不能大于可支付金额");
			  }
			  dbPayVoucherList.get(0).setPay_amount(blPayVoucherList.get(0).getPay_amount());
			  dbPayVoucherList.get(0).setPayee_account_bank_no(blPayVoucherList.get(0).getPayee_account_bank_no());
			  dbPayVoucherList.get(0).setPayee_account_name(blPayVoucherList.get(0).getPayee_account_name());
			  dbPayVoucherList.get(0).setPayee_account_no(blPayVoucherList.get(0).getPayee_account_no());
			  dbPayVoucherList.get(0).setPayee_account_bank(blPayVoucherList.get(0).getPayee_account_bank());
		  }else{
			  throw new Exception("该凭证在后台未查询到");
		  }
	  }else{
		  //多笔支付一定是标准转账（只需记录转账类型、收款人行号、操作类型即可）
		  for(PayVoucher tempBLVou:blPayVoucherList){
			  
			  boolean check =false;
			  
			  for(PayVoucher tempDbVou:dbPayVoucherList){
		  
				  if(tempBLVou.getVouNo().equals(tempDbVou.getVouNo())){
					  if(tempBLVou.getBlLoadTime()!=tempDbVou.getBlLoadTime()){
						  throw new Exception("凭证号:"+tempBLVou.getVouNo()+"数据版本号不一致");
					  }else if(nowTime-tempBLVou.getBlLoadTime()>context.getBlDataOutTime()){
						  throw new Exception("数据操作超出有效时间"+context.getBlDataOutTime()/60000+"分钟");
					  }
					  check =true;
					  tempDbVou.setPayee_account_bank_no(tempBLVou.getPayee_account_bank_no());
					  //tempDbVou.setBlReqChangeType(tempBLVou.getBlReqChangeType());
					  tempDbVou.setPb_set_mode_code(tempBLVou.getPb_set_mode_code());
					  tempDbVou.setBlReqPayOperation(tempBLVou.getBlReqPayOperation());
					  continue;
				  }
				  
			  }
			  
			  if(check==false){
				  throw new Exception("后台未查到到可操作的凭证号:"+tempBLVou.getVouNo());
			  }
		  }
	  }
	  
	  
	  return true;
  }
  
 public boolean checkRealPayVoucher(List<RealPayVoucher> blPayVoucherList,List<RealPayVoucher> dbPayVoucherList) throws Exception{
	  
	  if(blPayVoucherList.size()!=dbPayVoucherList.size()){
		  throw new Exception("请求的支付凭证与数据库中的支付凭证数不匹配");
	  }
	  
	  long nowTime = DateTimeUtils.getLastVer();
	  
	  if(blPayVoucherList.size()==1){
		  
		  if(blPayVoucherList.get(0).getRealpay_voucher_code().equals(dbPayVoucherList.get(0).getRealpay_voucher_code())){
			  
			  if(blPayVoucherList.get(0).getBlLoadTime()!=dbPayVoucherList.get(0).getBlLoadTime()){
				  throw new Exception("凭证号："+blPayVoucherList.get(0).getRealpay_voucher_code()+"数据版本号不一致");
			  }else if(nowTime-blPayVoucherList.get(0).getBlLoadTime()>context.getBlDataOutTime()){
				  throw new Exception("数据操作超出有效时间"+context.getBlDataOutTime()/60000+"分钟");
			  }
			  dbPayVoucherList.get(0).setPb_set_mode_code(blPayVoucherList.get(0).getPb_set_mode_code());
			  dbPayVoucherList.get(0).setBlReqPayOperation(blPayVoucherList.get(0).getBlReqPayOperation());
			  dbPayVoucherList.get(0).setPayee_account_bank_no((blPayVoucherList.get(0).getPayee_account_bank_no()));
		  
		  }else{
			  throw new Exception("该凭证在后台未查询到");
		  }
		  
	  }else{
		  //多笔支付一定是标准转账（只需记录转账类型、收款人行号、操作类型即可）
		  for(RealPayVoucher tempBLVou:blPayVoucherList){
			  
			  boolean check =false;
			  
			  for(RealPayVoucher tempDbVou:dbPayVoucherList){
		  
				  if(tempBLVou.getVouNo().equals(tempDbVou.getVouNo())){
					  if(tempBLVou.getBlLoadTime()!=tempDbVou.getBlLoadTime()){
						  throw new Exception("凭证号:"+tempBLVou.getVouNo()+"数据版本号不一致");
					  }else if(nowTime-tempBLVou.getBlLoadTime()>context.getBlDataOutTime()){
						  throw new Exception("数据操作超出有效时间"+context.getBlDataOutTime()/60000+"分钟");
					  }
					  check =true;
					  tempDbVou.setPayee_account_bank_no(tempBLVou.getPayee_account_bank_no());
					  tempDbVou.setPb_set_mode_code(tempBLVou.getPb_set_mode_code());
					  tempDbVou.setBlReqPayOperation(tempBLVou.getBlReqPayOperation());
					  continue;
				  } 
			  }
			  
			  if(check==false){
				  throw new Exception("后台未查到到可操作的凭证号:"+tempBLVou.getVouNo());
			  }
		  }
	  }
	  
	  
	  return true;
  }
  
  public void payProcess(List<PayVoucher> payVoucherList){
	  
	  if(payVoucherList.size()==1){
		  
	  }else if(payVoucherList.size()>1) {
		  
	  }
  
  }
  
  
  /***************************************************************************
   * 初始化会话信息
   */
  public void initCurrSession() {
    
	List<Session> scList = SessionUtil.getTopUserSession();
    
	if (scList == null || scList.size() == 0) {
		
		logger.error("初始化会话信息失败，请先配置网点信息！");
		throw new PbException("初始化会话信息失败，请先配置网点信息");
    
	}
    
//	sc = scList.get(0);
  
  }

  
}
