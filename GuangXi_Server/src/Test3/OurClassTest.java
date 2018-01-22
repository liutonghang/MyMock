package Test3;

import static org.junit.Assert.*;
import grp.pb.branch.beibuwan.job.AutoQueryPbUserAndUpdate;
import grp.pb.branch.beibuwan.service.BBWSynService;
import grp.pb.branch.beibuwan.trans.BBWServiceImpl;
import grp.pt.pb.common.model.Network;
import grp.pt.pb.common.model.PbUser;
import grp.pt.pb.exception.PbException;
import grp.pt.pb.util.PbUtil;
import grp.pt.pb.util.PropertiesHander;
import grp.pt.pb.util.StaticApplication;
import grp.pt.util.FtpClientUtil;
import grp.pt.util.model.Session;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


import org.apache.commons.io.IOUtils;
import org.apache.log4j.Logger;
import org.easymock.EasyMock;
import org.easymock.EasyMockRunner;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.util.ReflectionTestUtils;

import test.CalculatorService;

import com.river.common.UploadFileUtil;
	
@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration({ "../app-context.xml"})
//本例是mock的真正使用类， 先使用TR07来获取，然后在ftp下载， 由于ftp下载是静态方法不能被mock，所以只能模拟到这里了
public class OurClassTest {
	
	private Logger logger = Logger.getLogger(OurClassTest.class);

	
	private static FtpClientUtil ftp;
	private static String remotePath = null;
	private static String localPath = null;
	private static BBWServiceImpl bbwService = null;
	private static BBWSynService bbwSynService = null;
	
	static {
		localPath = PropertiesHander.getValue("trans", "ftp.localTipsPath");
		remotePath = UploadFileUtil.getFromPro("trans", "ftp.remoteTipsPath");
	}

    @Test
    public void testOurClass() {

		init();
		logger.info("更新柜员和网点自动任务开始！时间："+PbUtil.getCurrLocalDateTime());
		List<String> fileNames = new ArrayList<String>();
		//创建mock开始
		BBWServiceImpl bbwService_mock = (BBWServiceImpl) EasyMock.createMock(BBWServiceImpl.class);
		List<String> fileNames_mock = new ArrayList<String>();
		fileNames_mock.add("TE20180110.txt");
		fileNames_mock.add("BR20180110.txt");
		try {
			EasyMock.expect(bbwService_mock.getPbUserAndNetworkFileName(EasyMock.isA(Session.class))).andReturn(fileNames_mock);
		} catch (Exception e1) {
			logger.error("创建mock失败");
		}
		EasyMock.replay(bbwService_mock);	

		try {
			fileNames = bbwService_mock.getPbUserAndNetworkFileName(new Session());
		} catch (Exception e) {
			logger.error("调用接口TR07更新柜员接口失败",e);
			return;
		}
		logger.info("mock接口TR07成功");
		
		List<String> realFileNames = getRealFileName(fileNames);
		
		String pbUserFileName  = realFileNames.get(0); //更新柜员的文件名
		String networkFileName = realFileNames.get(1); //更新网点的文件名
		

		boolean downFlag = false;
		boolean downFlag2 = false;
		
		try {
			
			updatePbUserAndNetWork(pbUserFileName, networkFileName);
			logger.info("柜员和网店更新完成！");
			
		} catch (Exception e) {
			logger.error("柜员和网点更新失败。",e);
		}
	
    }
	/**
	 * 接口获得的文件名是以.txt结尾的，ftp下载的文件没有后缀名
	 * 
	 * @author lth
	 * 
	 */
	private List<String> getRealFileName(List<String> fileNames) {
		List<String> realFileNames = new ArrayList<String>();
		for(String fileName : fileNames){
			if(fileName.endsWith(".txt")){
				fileName = fileName.substring(0, fileName.length()-4);
			}
			realFileNames.add(fileName);
		}
		return realFileNames;
		
	}
	
	/**
	 * 解析网点、柜员的文件，查询本地数据并更新数据库
	 * 
	 * @author lth
	 * 
	 */
	private void updatePbUserAndNetWork(String pbUserFileName, String networkFileName) throws Exception {
		
		File pbUserFile = new File(localPath,pbUserFileName);//更新柜员的文件
		File networkFile = new File(localPath,networkFileName);//更新网店的文件
		//解析文件
		List<PbUser> pbUserMap = readPbUSerFile(pbUserFile);
		List<Network> netWorkMap = readNetworkFile(networkFile);
		logger.info("ooookkkk");
		bbwSynService.synPbUserAndNetwork(pbUserMap, netWorkMap);
		
	}
	
	public List<PbUser> readPbUSerFile(File file){
		logger.info("+++开始读取文件++"+file.getName());
		Map<String,PbUser> pbUserMap = new HashMap<String, PbUser>();//key: 柜员编码 , value ：PbUser
		BufferedReader reader = null;
		FileInputStream in = null;
		InputStreamReader isReader = null;
		try {
			
			in = new FileInputStream(file);
			isReader = new InputStreamReader(in,"gbk");
			reader = new BufferedReader(isReader);
			String line = null;
			PbUser dto = null;
			
			while ((line = reader.readLine()) != null) {
				String[] l = line.split("\\|");
				String userCode = l[0].trim();
				dto = new PbUser();
				pbUserMap.put(userCode, dto);
				dto.setUser_code(l[0].trim());//柜员编码
				dto.setUser_name(l[1].trim());//柜员名称
				dto.setBank_code(l[2].trim());//网点编码
				dto.setTellercode(l[3].trim());//柜员的等级保存在机构号中
	
			}
			
			logger.info("+++读取文件结束！++");

		}catch (Exception e) {
			throw new PbException("读取"+file.getName()+"文件异常！");
		}finally{
			//关闭流
			IOUtils.closeQuietly(reader);
			IOUtils.closeQuietly(isReader);
			IOUtils.closeQuietly(in);
		}
		
		return new ArrayList<PbUser>(pbUserMap.values());
	}
	
	private List<Network> readNetworkFile(File file2) {
		logger.info("+++开始读取文件++"+file2.getName());
		Map<String,Network> netWorkMap = new HashMap<String, Network>();
		BufferedReader reader = null;
		FileInputStream in = null;
		InputStreamReader isReader = null;
		try {
			
			in = new FileInputStream(file2);
			isReader = new InputStreamReader(in,"gbk");
			reader = new BufferedReader(isReader);
			String line = null;
			Network dto = null;
			
			while ((line = reader.readLine()) != null) {	
				String[] l = line.split("\\|");
				String bankCode = l[0].trim();
				if(!bankCode.matches("^[0-9]*$")){
					continue;
				}
				dto = new Network();
				netWorkMap.put(bankCode, dto);
				dto.setCode(l[0].trim());//网点编码
				dto.setName(l[1].trim());//网点名称

			}

			logger.info("+++读取文件结束！++");
		}catch (Exception e) {
			throw new PbException("读取"+file2.getName()+"文件异常！");
		}finally{
				//关闭流
				IOUtils.closeQuietly(reader);
				IOUtils.closeQuietly(isReader);
				IOUtils.closeQuietly(in);
		}
		return new ArrayList<Network>(netWorkMap.values());

	}
	private void init() {
		if (ftp == null) {
			ftp = new FtpClientUtil();
		}
		if(bbwService == null){
			bbwService = new BBWServiceImpl();
		}
		if(bbwSynService == null){
			bbwSynService = (BBWSynService) StaticApplication.getBean("bbwSynService");
		}
	}

}
