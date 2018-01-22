package grp.pb.branch.trans.rcbtuxedo;

import grp.pt.pb.util.PropertiesHander;

import java.io.IOException;
import java.util.Hashtable;

import org.apache.log4j.Logger;


import com.ibm.mq.MQC;
import com.ibm.mq.MQMessage;
import com.ibm.mq.MQQueue;
import com.ibm.mq.MQQueueManager;
import com.river.common.UploadFileUtil;

public class MQSendBase {
	
	/** 发送队列参数：发送队列|如果队列管理器被停止则返回失败 **/
	private int openOptions = MQC.MQOO_OUTPUT | MQC.MQOO_FAIL_IF_QUIESCING;
	/** 队列名 **/
	private String rqueueName = null;
	/** 消息 **/
	private String message = null;
	
	private static String PARAM_HOSTNAME = UploadFileUtil.getFromPro("mq", "mq_address");
	private static int PARAM_PORT = Integer.parseInt(UploadFileUtil.getFromPro("mq", "mq_port"));
	private static String PARAM_QMANGER = UploadFileUtil.getFromPro("mq", "mq_qmanager");
	private static String PARAM_CHANNEL = UploadFileUtil.getFromPro("mq", "mq_server_channel");
	private static int PARAM_CCSID = Integer.parseInt(UploadFileUtil.getFromPro("mq", "mq_ccsid"));
	
	private static Logger log = Logger.getLogger(MQSendBase.class);
	
	public MQSendBase(String rqueueName, String message) {
		this.rqueueName = rqueueName;
		this.message = message;
	}
	
	protected void implBizProcess(String xml) throws Exception, IOException {
		String sendQueue = UploadFileUtil.getFromPro("mq", "mq_send_queue");
		
		
		MQQueueManager qMgr = createQMGR();
		if(qMgr==null){
			log.info("创建mq失败");
		}
        MQQueue outQueue = qMgr.accessQueue(sendQueue, MQC.MQOO_OUTPUT);
        MQMessage outMessage = new MQMessage();
        outMessage.write(xml.getBytes("GBK"));
        outQueue.put(outMessage);
        outQueue.close();
        qMgr.disconnect();
	}
	
	public static MQQueueManager createQMGR() throws Exception {
		MQQueueManager qMgr = null;
		// 设置MQ的环境变量
		try {

			String PARAM_QMANGER1 = UploadFileUtil.getFromPro("mq",
					"mq_qmanager");
			Hashtable<String, Object> queueManagerProperties = new Hashtable<String, Object>();

			queueManagerProperties.put(MQC.TRANSPORT_PROPERTY,
					MQC.TRANSPORT_MQSERIES);// 客户端访问
			queueManagerProperties.put(MQC.HOST_NAME_PROPERTY, PARAM_HOSTNAME);
			queueManagerProperties.put(MQC.PORT_PROPERTY, PARAM_PORT);

			queueManagerProperties.put(MQC.CHANNEL_PROPERTY, PARAM_CHANNEL);
			queueManagerProperties.put(MQC.CCSID_PROPERTY, PARAM_CCSID);

			// qMgr = new MQQueueManager(PARAM_QMANGER, queueManagerProperties);

			qMgr = new MQQueueManager(PARAM_QMANGER, queueManagerProperties);
			return qMgr;
		} catch (Exception ex) {
			log.error(ex);
			throw new Exception(ex);
		}
	}


	
	public static void sendData(String rqueueName, String message)throws Exception {
		MQSendBase sendH = new MQSendBase(rqueueName, message);
		sendH.implBizProcess(message);
	}

}
