package Test3;

import static org.junit.Assert.*;
import grp.pb.branch.beibuwan.job.AutoQueryPbUserAndUpdate;
import grp.pb.branch.beibuwan.service.BBWSynService;
import grp.pb.branch.beibuwan.trans.BBWMsgParser;
import grp.pb.branch.beibuwan.trans.BBWServiceImpl;
import grp.pt.pb.common.model.Network;
import grp.pt.pb.common.model.PbUser;
import grp.pt.pb.exception.PbException;
import grp.pt.pb.trans.util.Context;
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
import org.easymock.Mock;
import org.easymock.TestSubject;
import org.junit.Assert;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.util.ReflectionTestUtils;

import test.CalculatorService;
import test.MathApplication;

import com.river.common.UploadFileUtil;
	
@RunWith(EasyMockRunner.class)
@ContextConfiguration({ "../app-context.xml"})
//本例mock的是发送报文和接收报文 ，当发送一个固定的报文的时候，默认返回一个报文， 来验证我们的解析是否是正确的。
//具体请参考MathApplicationTester2
public class OurClassTest2 {
	
	private Logger logger = Logger.getLogger(OurClassTest2.class);

	
	   @TestSubject
	   BBWServiceImpl bbwServiceImpl = new BBWServiceImpl();

	   @Mock
	   BBWMsgParser parser;
	   
	   @Test
	   public void testAdd() throws Exception{
		    byte[] reqByte = null;//请输入 发送报文
		   	byte[] respBtye =null;//请输入 回执报文
			EasyMock.expect(parser.doSend(EasyMock.isA(Context.class), reqByte)).andReturn(respBtye);
			 //激活mock
		     EasyMock.replay(parser);	
		   
		   
		   
	   }
	
	
	
}
