package grp.pb.branch.gxboc.job;


import grp.pt.pb.common.AutoJobAdapter;
import grp.pt.pb.util.PbUtil;
import grp.pt.pb.util.PropertiesHander;
import grp.pt.util.BeanFactoryUtil;
import grp.pt.util.FtpClientUtil;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.UnsupportedEncodingException;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;

import org.apache.log4j.Logger;
import org.springframework.jdbc.core.BatchPreparedStatementSetter;
import org.springframework.jdbc.core.JdbcTemplate;

/**
 * 行号导入定时任务开始
 * 
 * @author DAIGUODONG
 * 
 */
public class BOCAutoImportBankNoTaskJob extends AutoJobAdapter {


	private static Logger logger = Logger.getLogger(BOCAutoImportBankNoTaskJob.class);

	

	// 配置文件
	private static Properties prop = null;
	private  static JdbcTemplate jt;
	private static FtpClientUtil fcu = new FtpClientUtil();
	private static String localFilePath = "";
	private static String FBName = "";
	private static String dbUserPW;
	private static String dbIddr;
	private static String dbSchema;
	private static String dbUserName;
	static {
		jt =(JdbcTemplate)BeanFactoryUtil.getBean("jdbcTemplate");
		prop = PropertiesHander.getProByClassPath("trans.properties");
		
		FBName = prop.getProperty("BFNAME");
		localFilePath = prop.getProperty("localBFPath");
		dbUserPW= prop.getProperty("dbUserPW");
		dbUserName = prop.getProperty("dbUserName");
		dbIddr = prop.getProperty("dbIddr");
		dbSchema = prop.getProperty("dbSchema");
	}



	
	@Override
	public void executeJob() {
		logger.info("行号自动导入开始！时间："+PbUtil.getCurrLocalDateTime());
	/*	try {
			dFlag = fcu.downFile(localFilePath, remoteFilePath, fileName);
			if(!dFlag){
				logger.error("----行号文件下载失败----");
				return;
			}
		} catch (Exception e) {
			logger.error("----行号文件下载失败---- : "+e.getMessage() );
			e.printStackTrace();
		}
	*/	boolean impFlag = false;
		impFlag = importData(FBName);
		if(!impFlag){
			logger.error("----行号文件导入失败---");
			return;
		}
//		updateBankNo();  
		updateBankNoGX();
		logger.info("行号自动导入结束！时间："+PbUtil.getCurrLocalDateTime());
	}


	private void updateBankNo() {
		jt.execute("delete from pb_bank_no");
		jt.execute("insert into pb_bank_no(id,bank_no,bank_name,city_code,bank_type) select '1' id,cbkcde,cbklnm,citcde,bkccde from ibps_rctcbk");
		jt.execute("delete from  ibps_rctcbk");
	}
	private void updateBankNoGX() {
		jt.execute("delete from pb_bank_no");
		jt.execute("insert into pb_bank_no(id,bank_no,bank_name,city_code,bank_type) select '1' ,trim(CBKCDE),trim(CBKLNM), trim(CITCDE),trim(BKCCDE)	from pb_bank_no_tmp");
	}


	private boolean impFileData(String fileName) {
		try{
			String impStr = "imp " + dbUserName + "/" + dbUserPW + "@" + dbIddr + "/" + dbSchema +
					" file="+localFilePath+"/"+fileName+" ignore=y full=y";
//			String impStr = "sqlldr userid = " + dbUserName + "/" + dbUserPW + "@" + dbIddr + "/" + dbSchema +
//			" control="+localFilePath+"/input.ctl log="+localFilePath+"/input.log data="+localFilePath+"/"+fileName;
			Process p = Runtime.getRuntime().exec(new String[]{"cmd.exe","/C",impStr});
			final InputStream ins = p.getInputStream();
			new Thread(new Runnable() {
				@Override
				public void run() {
					BufferedReader br = new  BufferedReader(new InputStreamReader(ins));
					String line = null;
					try {
						while((line = br.readLine())!=null){
							logger.info("R_  imp logger : " + line);
						}
						logger.info("R_ imp logger output over");
					} catch (Exception e) {
						e.printStackTrace();
					}
				}
			}).start();
			InputStream errIs = p.getErrorStream();
			BufferedReader errbr = new  BufferedReader(new InputStreamReader(errIs));
			String errline = null;
				while((errline = errbr.readLine())!=null){
					logger.info("E_ imp logger : "+ errline);
				}
			int exitValue = p.waitFor();
			logger.info("IMP COMMAND EXEC RETURN VALUE : "+ exitValue);
			if(exitValue == 0 || exitValue == 2){
				return true;
			}else{ 
				return false;
			}
		} catch (Exception e) {
			logger.error("IMP *.dmp file failure reason is :" + e.getMessage());
			e.printStackTrace();
			return false;
		} 
	}
	
	public boolean importData(String fileName){
		File f = new File(localFilePath+System.getProperty("file.separator")+ fileName);
		if(!f.exists()){
			return false;
		}
		try {
			BufferedReader br = new  BufferedReader(new  InputStreamReader(new FileInputStream(f), "GBK"));
				String line = null;
			    List<String> l = new ArrayList<String>();
				while((line = br.readLine()) != null){
					l.add(line);
					if(l.size() >= 2000){
						batchInsetData(l);
						l.clear();
					}
				}
				if(l.size() > 0){
					batchInsetData(l);
				}
		} catch (Exception e) {
			logger.error("数据批量导入错误", e);
			jt.execute("truncate table pb_bank_no_tmp");
			return false;
		} 
		return true;
	}
	private void batchInsetData(final List<String> l){
		jt.batchUpdate("insert into pb_bank_no_tmp values(?,?,?,?)", new BatchPreparedStatementSetter() {
			@Override
			public void setValues(PreparedStatement ps, int i) throws SQLException {
					String s = l.get(i);
					String[] ss = s.split("\\|");
					if(ss.length<11){
						return;
					}
					ps.setString(1, ss[0].trim());
					ps.setString(2, ss[1].trim());
					ps.setString(3, ss[4].trim());
					ps.setString(4, ss[11].trim());
			}
			@Override
			public int getBatchSize() {
				return l.size();
			}
		});
	}
	
}