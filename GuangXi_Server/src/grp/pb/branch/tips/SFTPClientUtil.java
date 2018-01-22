package grp.pb.branch.tips;

import grp.pt.pb.util.PropertiesHander;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

import org.apache.commons.net.ftp.FTPClient;
import org.apache.log4j.Logger;

import com.jcraft.jsch.ChannelSftp;
import com.jcraft.jsch.JSch;
import com.jcraft.jsch.Session;

/**
 * sftp客户端类
 * 
 * @author fwq
 * 
 */
public class SFTPClientUtil implements java.io.Serializable {

	private static final long serialVersionUID = 1L;

	private static Logger logger = Logger.getLogger(SFTPClientUtil.class);

	public static FTPClient ftpClient = new FTPClient();

	private static String hostname;

	private static int portCode;

	private static String username;

	private static String password;
	
	private static String privateKey;//密钥文件路径

	// 配置文件
	private static Properties prop = null;

	static {
		prop = PropertiesHander.getProByClassPath("trans.properties");
		hostname = prop.getProperty("ftp.serverIp");
		portCode = Integer.parseInt(prop.getProperty("ftp.serverPort"));
		username = prop.getProperty("ftp.username");
		password = prop.getProperty("ftp.pwd");
		privateKey = PropertiesHander.getValue("gxccb", "sftp.privateKey");
		
	}
	 
	 private static ChannelSftp channel = null;
	 private static Session session = null;
	 
	 public static ChannelSftp getConnect() {
	  
	  JSch jsch = new JSch(); // 创建JSch对象
	  // 按照用户�?主机ip,端口获取�?��Session对象
	  try {
	   if(privateKey != null && !"".equals(privateKey)){
		   jsch.addIdentity(privateKey);
	   }
	   session = jsch.getSession(username, hostname, portCode);
	   logger.info("Session created.");
	   if (password != null && !"".equals(password)) {
	    session.setPassword(password); // 设置密码
	   }
	   //具体config中需要配置那些内容，请参照sshd服务器的配置文件/etc/ssh/sshd_config的配�?
	   Properties config = new Properties();
	   //设置不用�?��hostKey
	   //如果设置成�?yes”，ssh就不会自动把计算机的密匙加入�?HOME/.ssh/known_hosts”文件，
	   //并且�?��计算机的密匙发生了变化，就拒绝连接�?
	   config.put("StrictHostKeyChecking", "no");
	   //UseDNS指定，sshd的是否应该看远程主机名，�?��解析主机名的远程IP地址映射到相同的IP地址�?
	   //默认值是 “yes�?此处是由于我们SFTP服务器的DNS解析有问题，则把UseDNS设置为�?no�?
	   config.put("UseDNS", "no");
	   
	   session.setConfig(config); // 为Session对象设置properties
	   session.setTimeout(300000); // 设置timeout时�?
	   logger.info("Session is not connected");
	   session.connect(); // 经由过程Session建树链接
	   logger.info("Session connected.");
	   logger.info("Opening SFTP Channel.");
	   channel = (ChannelSftp) session.openChannel("sftp"); // 打开SFTP通道
	   channel.connect(); // 建树SFTP通道的连�?
	   logger.info("Connected successfully to ftpHost = " + hostname + ",as ftpUserName = "
	     + username + ", returning: " + channel);
	  } catch (Exception e) {
	   // TODO Auto-generated catch block
	   e.printStackTrace();
	  }
	  return channel;
	 }
	 
	 public static void closeChannel() throws Exception {
	  try {
	   if (channel != null) {
	    channel.disconnect();
	   }
	   if (session != null) {
	    session.disconnect();
	   }
	   logger.info("Connection is closed");
	  } catch (Exception e) {
	   logger.error("close sftp error", e);
	   throw new Exception("close ftp error.");
	  }
	 }
	 
	 public static void uploadFile(String localFile, String newName, String remoteFoldPath) throws Exception{
	  InputStream input = null;
	  try {
		 SFTPClientUtil.getConnect();
		//新文件名去掉�?nx�?
		 String newFileName = newName.substring(0, newName.length()-3);
	     input = new FileInputStream(new File(localFile+File.separator + newFileName));
		 // 改变当前路径到指定路�?
		 channel.cd(remoteFoldPath);
		 channel.put(input, newFileName);
		 SFTPClientUtil.closeChannel();
	  } catch (Exception e) {
	     logger.error("Upload file error", e);
	     throw new Exception( "Upload file error.");
	  } finally {
		  if (input != null) {
		    try {
		      input.close();
		    } catch (IOException e) {
		      throw new Exception("Close stream error.");
		    }
		  }
	    }
	 }
	 public static void main(String[] args) throws Exception {
		 SFTPClientUtil ftpUtil = new SFTPClientUtil();
		//  ftpServerMap.put(SFTPConstants.SFTP_SERVER_HOST, "192.168.1.2");
		//  ftpServerMap.put(SFTPConstants.SFTP_SERVER_USERNAME, "root");
		//  ftpServerMap.put(SFTPConstants.SFTP_SERVER_PASSWORD, "111111");
		//  ftpServerMap.put(SFTPConstants.SFTP_SERVER_PORT, "22");
		  ChannelSftp channeltest = ftpUtil.getConnect();
		  System.out.println(channeltest.isConnected());
		  ftpUtil.uploadFile("d:/1642.txt", "1642.txt", "/data");
		  ftpUtil.closeChannel();
		  System.out.println(channeltest.isConnected());
	 }
}
