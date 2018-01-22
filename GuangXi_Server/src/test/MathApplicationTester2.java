package test;
import grp.pt.pb.exception.PbException;

import org.easymock.EasyMock;
import org.easymock.EasyMockRunner;
import org.easymock.Mock;
import org.easymock.TestSubject;
import static org.junit.Assert.*;

import org.junit.Assert;
import org.junit.Test;
import org.junit.runner.RunWith;

//使用注解的方式来进行mock测试。
@RunWith(EasyMockRunner.class)
public class MathApplicationTester2 {
	
	   @TestSubject
	   MathApplication mathApplication = new MathApplication();

	   @Mock
	   CalculatorService calcService;
	   
	   @Test
	   public void testAdd(){
	     //指示EasyMock，行为添加10和20到calcService的添加方法并作为其结果，到返回值30.00
	      EasyMock.expect(calcService.add(10.0,20.0)).andReturn(30.00).times(2);
	      //在这个时间点上，模拟简单记录的行为，但它本身不作为一个模拟对象。调用回放后，按预期工作。
	      //激活mock
	      EasyMock.replay(calcService);	
	      Assert.assertEquals(mathApplication.add2(10.0, 20.0),30.0,0);
	      Assert.assertEquals(mathApplication.add(10.0, 20.0),30.0,0);
	      
	      

	      
	   }
	  //在verify()执行的时候会检测声明函数的执行次数
	   @Test
	   public void testTime(){
		  calcService.serviceUsed();//此为声明函数
	      EasyMock.expectLastCall().times(1);//规定声明函数执行次数为1
	      EasyMock.replay(calcService);
	      calcService.serviceUsed();
	      calcService.serviceUsed();
	    //本例讲述的是verify函数，用于检测mock对象是否被使用
	      EasyMock.verify(calcService);
	      
	   }
	 //在verify()执行的时候会检测声明函数的执行次数
	   @Test
	   public void testTime2(){
		  EasyMock.expect(calcService.add(10.0,20.0)).andReturn(30.00).times(1);//此为声明函数
	     
	      EasyMock.replay(calcService);
	      //Assert.assertEquals(mathApplication.add(10.0, 20.0),30.0,0);
	      Assert.assertEquals(mathApplication.add(10.0, 20.0),30.0,0);
	      EasyMock.verify(calcService);
	      
	   }
	   
	   
	   
	   
	   //本例讲述的是异常
	   @Test(expected = RuntimeException.class)
	   public void testException(){
		   
		   EasyMock.expect(calcService.add(11.0,20.0)).andThrow(new PbException("转账失败"));
		   
		   EasyMock.replay(calcService);
		   try{
			   mathApplication.add(11.0,20.0);
		   } catch (PbException e){
			   System.out.println("捕获到了PbException");
		   } catch(Exception e){
			   System.out.println("捕获到了Exception");
		   } finally{
			   EasyMock.verify(calcService);
		   }
		    
	   }
	   
}
