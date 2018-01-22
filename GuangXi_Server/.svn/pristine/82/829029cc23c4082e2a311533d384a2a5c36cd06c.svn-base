package grp.pb.branch.beibuwan.trans.util;
import grp.pt.pb.util.PropertiesHander;
import grp.pt.util.FtpClientUtil;
import grp.pt.util.StringUtil;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.RandomAccessFile;
import java.util.Properties;
import java.util.Vector;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.commons.net.ftp.FTP;
import org.apache.commons.net.ftp.FTPClient;
import org.apache.commons.net.ftp.FTPFile;
import org.apache.commons.net.ftp.FTPReply;

import com.jcraft.jsch.ChannelSftp;
import com.jcraft.jsch.ChannelSftp.LsEntry;
import com.jcraft.jsch.Channel;
import com.jcraft.jsch.JSch;
import com.jcraft.jsch.Session;

public class FTPUtils implements java.io.Serializable{
	
	private static final long serialVersionUID = 1L;

	private static final Log logger = LogFactory.getLog(FTPUtils.class);

	public static FTPClient ftpClient = new FTPClient();

	private static String hostname;

	private static int port;

	private static String username;

	private static String password;

	private static String hostnamegwk;

	private static int portgwk;

	private static String usernamegwk;

	private static String passwordgwk;

	// 配置文件
	private static Properties prop = null;

	public static Properties getProp() {
		return prop;
	}

	public static void setProp(Properties prop) {
		FTPUtils.prop = prop;
	}

	static {
		prop = PropertiesHander.getProByClassPath("trans.properties");
		hostname = prop.getProperty("ftp.serverIp");
		port = Integer.parseInt(prop.getProperty("ftp.serverPort"));
		username = prop.getProperty("ftp.username");
		password = prop.getProperty("ftp.pwd");
		//在不修改原有tips逻辑下，修改公务卡消费明细获取，消除tips提交后，公务卡消费明细无法获取路径问题
 		hostnamegwk = prop.getProperty("ftp.serverIp");
		portgwk = Integer.parseInt(prop.getProperty("ftp.serverPort"));
		usernamegwk = prop.getProperty("ftp.username");
		passwordgwk = prop.getProperty("ftp.pwd");
	}

	public  static void setPropertys(String hostName,int port,String username,String password){
		FTPUtils.hostname = hostName;
		FTPUtils.port = port;
		FTPUtils.username = username;
		FTPUtils.password = password;
	}
	
	public String getHostname() {
		return hostname;
	}


	public int getPort() {
		return port;
	}

	
	public String getUsername() {
		return username;
	}


	public String getPassword() {
		return password;
	}


	public FTPUtils() {

	}
	
	/**
	 * ftp打开连接
	 * 
	 * @param hostname
	 *            远程服务器ip
	 * @param port
	 *            ftp服务端口
	 * @param username
	 *            名户名
	 * @param password
	 *            密码
	 * @return
	 * @throws IOException
	 */
	public static boolean connect() throws Exception {

		ftpClient.connect(hostname, port);
		ftpClient.setControlEncoding("GBK");

		if (FTPReply.isPositiveCompletion(ftpClient.getReplyCode())) {
			if (ftpClient.login(username, password)) {
				logger.info("ftp ip:" + hostname + " port:" + port + " 连接成功。");
				return true;
			} else {
				logger.error("ftp ip:" + hostname + " port:" + port
						+ " 连接失败，请检查配置文件。");
				throw new Exception("ftp ip:" + hostname + " port:" + port
						+ " 连接失败，请检查配置文件。");
			}
		}
		disconnect();
		return false;
	}
	
	/**
	 * ftp断开连接
	 * 
	 * @throws IOException
	 */
	public static void disconnect() throws Exception {
		if (ftpClient.isConnected()) {
			ftpClient.disconnect();
			logger.info("ftp连接关闭.");
		}
	}
	
	/**
	 * 封装上传文件方法
	 * 
	 * @param localDirectory 本地目录
	 * @param remoteDirectory ftp远程目录
	 * @param fileName 文件名
	 * @throws Exception 
	 */
	public static void upLoadFile(String localDirectory, String remoteDirectory,String fileName) throws Exception {
		
		String hostName = PropertiesHander.getValue("ShiZuiShan", "tips.ftp.serverIp");
		int port = Integer.valueOf(PropertiesHander.getValue("ShiZuiShan", "tips.ftp.serverPort"));
		String username = PropertiesHander.getValue("ShiZuiShan", "tips.ftp.username");
		String password = PropertiesHander.getValue("ShiZuiShan", "tips.ftp.pwd");
		String remotePath = PropertiesHander.getValue("ShiZuiShan", "tips.ftp.remotePath");
		
		Session session = null;
		Channel channel = null;
		JSch jsch = new JSch();
		if(port <=0){
			//连接服务器，采用默认端口
			session = jsch.getSession(username, hostName);
		}else{
			//采用指定的端口连接服务器
			session = jsch.getSession(username, hostName ,port);
		}
		//如果服务器连接不上，则抛出异常
		if (session == null) {
			throw new Exception("session is null");
		}
		
		//设置登陆主机的密码
		session.setPassword(password);//设置密码   
		//设置第一次登陆的时候提示，可选值：(ask | yes | no)
		session.setConfig("StrictHostKeyChecking", "no");
		//设置登陆超时时间   
		session.connect(60000);
			
		try {
			//创建sftp通信通道
			channel = (Channel) session.openChannel("sftp");
			channel.connect(60000);
			ChannelSftp sftp = (ChannelSftp) channel;
			//进入服务器指定的文件夹
			sftp.cd(remotePath);
			
			//列出服务器指定的文件列表
			//以下代码实现从本地上传一个文件到服务器，如果要实现下载，对换以下流就可以了
			OutputStream outstream = sftp.put(fileName);
			InputStream instream = new FileInputStream(new File(localDirectory + "/" + fileName));
			byte b[] = new byte[1024];
			int n;
		    while ((n = instream.read(b)) != -1) {
		    	outstream.write(b, 0, n);
		    }
		    outstream.flush();
		    outstream.close();
		    instream.close();
		} catch(Exception e){
			logger.error("上传文件失败",e);
		} finally {
			session.disconnect();
			channel.disconnect();
		}
	}
	
	
	/**
	 * 上传文件到FTP服务器，支持断点续传
	 * 
	 * @param local
	 *            本地文件名称，绝对路径
	 * @param remote
	 *            远程文件路径，使用/home/directory1/subdirectory/file.ext
	 * @return 上传结果
	 * @throws IOException
	 */
	public static boolean upload(String local, String remote) throws Exception {
		boolean result = true;

		// 设置PassiveMode传输
		ftpClient.enterLocalPassiveMode();
		// 设置以二进制流的方式传输
		ftpClient.setFileType(FTP.BINARY_FILE_TYPE);
		ftpClient.setControlEncoding("GBK");

		// 对远程目录的处理
		String remoteFileName = remote;
		if (remote.contains("/")) {

			// 1创建服务器远程目录结构，创建失败直接返回
			if (!CreateDirecroty(remote)) {
				return false;
			}
		}
		// 2检查远程是否存在文件
		FTPFile[] files = ftpClient.listFiles(remote);
		if (files.length == 1) {
			if (!ftpClient.deleteFile(remoteFileName)) {
				logger.info("老文件删除失败。");
				return false;
			} else {
				logger.info("老文件删除成功。");
			}
		}
		File localfile = new File(local);

		// 3上传文件
		result = uploadFile(remoteFileName, localfile, 0);
		if (!result) {
			logger.info("新文件上传失败。");
			return false;

		} else {
			logger.info("新文件上传成功。");

			// 4上传后设置文件权限
			ftpClient.sendSiteCommand("chmod 777 " + remoteFileName);
			return result;
		}

	}

	/**
	 * 上传文件到服务器,新上传和断点续传
	 * 
	 * @param remoteFile
	 *            远程文件名，在上传之前已经将服务器工作目录做了改变
	 * @param localFile
	 *            本地文件File句柄，绝对路径
	 * @param processStep
	 *            需要显示的处理进度步进值
	 * @return
	 * @throws IOException
	 */
	public static boolean uploadFile(String remoteFile, File localFile,
			long remoteSize) throws Exception {

		// 显示进度的上传
		// long step = localFile.length() / 1024;
		// long process = 0;
		// long localreadbytes = 0L;
		RandomAccessFile raf = new RandomAccessFile(localFile, "r");
		OutputStream out = ftpClient.appendFileStream(new String(remoteFile
				.getBytes("GBK"), "iso-8859-1"));
		//add by liutianlong 2015-06-04
		//哈尔滨银行ftp服务器不支持appendFileStream模式
		if( out == null ){
			out = ftpClient.storeFileStream(new String(remoteFile
				.getBytes("GBK"), "iso-8859-1"));
		}
		//end add
		// 断点续传没用上
		if (remoteSize > 0) {
			ftpClient.setRestartOffset(remoteSize);
			// process = remoteSize /step;
			raf.seek(remoteSize);
			// localreadbytes = remoteSize;
		}
		byte[] bytes = new byte[1024];
		int c;
		while ((c = raf.read(bytes)) != -1) {
			out.write(bytes, 0, c);
			// localreadbytes+=c;
			// if(localreadbytes / step != process){
			// process = localreadbytes / step;
			// logger.info("上传进度:" + process);
			//
			// }
		}
		out.flush();
		raf.close();
		out.close();

		return ftpClient.completePendingCommand();
	}
	/**
     * Description: 从SFTP服务器下载文件
     * @param localPath 下载后保存到本地的路径
     * @param remotePath FTP服务器上的相对路径
     * @param fileName 要下载的文件名
     * @return
	 * @throws Exception 
     */
    public static boolean downFile(String localPath,String remotePath, String fileName) throws Exception {
		boolean result = false;
		logger.info("下载对账文件"+ remotePath + "/" + fileName);
		Session session = null;
		Channel channel = null;
		ChannelSftp sftp = null;
		JSch jsch = new JSch();
		if(port <=0){
			//连接服务器，采用默认端口
			session = jsch.getSession(usernamegwk, hostnamegwk);
		}else{
			//采用指定的端口连接服务器
			session = jsch.getSession(usernamegwk, hostnamegwk ,portgwk);
		}
		//如果服务器连接不上，则抛出异常
		if (session == null) {
			throw new Exception("连接SFTP服务器失败,IP:"+hostnamegwk + "PORT:" + portgwk);
		}
		//设置登陆主机的密码
		session.setPassword(passwordgwk);//设置密码   
		//设置第一次登陆的时候提示，可选值：(ask | yes | no)
		session.setConfig("StrictHostKeyChecking", "no");
		//设置登陆超时时间   
		session.connect(600000);
		OutputStream output = null;
		File file = null;
		try {
			//创建sftp通信通道
			channel = (Channel) session.openChannel("sftp");
			channel.connect(60000);
			sftp = (ChannelSftp) channel;
			//判断ftp服务器上此目录是否存在
			String realpath = sftp.realpath(remotePath);
			
			if(StringUtil.isEmpty(realpath)){
				logger.info("ftp服务器不存在此路径:" + remotePath);
				sftp.mkdir(remotePath);
			}
			//判断sftp服务器上是否存在文件
			Vector content = sftp.ls(remotePath);   
		    if(content.isEmpty()) {  
		    	logger.info("所配置的路径里不存在文件:"+fileName);
		    	throw new RuntimeException("所配置的路径里不存在文件:"+fileName);
		    }  
			//进入服务器指定的文件夹
			sftp.cd(remotePath);
			logger.info("当前路径:" + sftp.pwd());
			String localFile = localPath+"/"+ fileName;
			logger.info("本地文件" + localFile);
			file = new File(localFile);
		    if (!file.exists()) {
		      logger.info("本地文件不存在，生成文件开始" );
		      file.createNewFile();
		      logger.info("本地文件不存在，生成文件结束" );
		      if (!file.exists()) {
		    	  logger.info("生成文件失败" );
		      }
		    }
		    output = new FileOutputStream(file);
		    sftp.get(fileName, output);
		    result = true;
		} catch (Exception e){
			if(output != null){
				output.close();
			}
			
			if(file != null && file.exists()){
				file.delete();
			}
			logger.error("下载对账文件失败",e);
		}finally {
			if (session!= null && session.isConnected()){
				session.disconnect();
			}
			if (sftp!= null && sftp.isConnected()){
				sftp.quit();
				sftp.disconnect();
			}
			if (channel!= null && channel.isConnected()){
				channel.disconnect();
			}
			
			
			if(output != null){
				output.close();
			}
		}
		return result;
	} 
    
    /**
	 * 递归创建远程服务器目录。 登陆用户拥有的目录权限。
	 * 
	 * @param path
	 *            远程服务器文件绝对路径: /bea/test/日志.txt
	 * @param ftpClient
	 *            FTPClient对象
	 * @return 目录创建是否成功
	 * @throws IOException
	 */
	public static boolean CreateDirecroty(String path) throws Exception {
		boolean result = true;

		// 截取完整目录路径
		String directory = path.substring(0, path.lastIndexOf("/") + 1);
		if (!directory.startsWith("/")) {
			directory += "/" + directory;
		}

		if (!directory.equalsIgnoreCase("/")
				&& !ftpClient.changeWorkingDirectory(new String(directory
						.getBytes("GBK"), "iso-8859-1"))) {
			// 如果远程目录不存在，则递归创建远程服务器目录
			int start = 1;
			int end = 0;

			end = directory.indexOf("/", start);

			while (true) {
				// 分级次创建目录,从第一级开始。
				String subDirectory = new String(path.substring(0, end)
						.getBytes("GBK"), "iso-8859-1");
				logger.info("创建目录： " + subDirectory);

				if (!ftpClient.changeWorkingDirectory(subDirectory)) {

					if (ftpClient.makeDirectory(subDirectory)) {
						ftpClient.changeWorkingDirectory(subDirectory);

						logger.info("创建目录成功.");

					} else {
						logger.info("创建目录失败.");
						result = false;
					}
				}

				start = end + 1;
				end = directory.indexOf("/", start);

				// 检查所有目录是否创建完毕
				if (end <= start) {
					break;
				}
			}
		}

		return result;

	}
	public static void main(String[] args) {
		FTPUtils myFtp = new FTPUtils();
		//上传
//		try {
//			myFtp.connect();
//			// myFtp.CreateDirecroty("/bea/1111/aa.txt");
//			myFtp.upload("c:\\20121210.txt", "/bea/aa/11111.txt");
//			myFtp.disconnect();
//		} catch (Exception e) {
//			logger.info("连接FTP出错：" + e.getMessage());
//		}
		//下载
		try {
			boolean flag = downFile("/upload", "1.png", "D:/download");
			System.out.println(flag);
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
}
