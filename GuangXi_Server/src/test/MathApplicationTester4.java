package test;

import org.easymock.EasyMock;
import org.easymock.EasyMockRunner;
import org.easymock.EasyMockSupport;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import static org.junit.Assert.*;

//使用了EasyMock的测试辅助类
@RunWith(EasyMockRunner.class)
public class MathApplicationTester4 extends EasyMockSupport {
	private MathApplication mathApplication1;
	private MathApplication mathApplication2;

	private CalculatorService calcService1;
	private CalculatorService calcService2;

	@Before
	public void setUp(){
	   mathApplication1 = new MathApplication();
	   mathApplication2 = new MathApplication();
	   calcService1 = createNiceMock(CalculatorService.class);
	   calcService2 = createNiceMock(CalculatorService.class);
	   mathApplication1.setCalculatorService(calcService1);
	   mathApplication2.setCalculatorService(calcService2);
	}
	
	@Test
	public void testString(){
		String pay_dictate_no = "1234567890";
		pay_dictate_no = pay_dictate_no.substring(pay_dictate_no.length()-8, pay_dictate_no.length());
		System.out.println(pay_dictate_no);
		
		
	}
	
	@Test
	public void testCalcService(){
	   replayAll();//模拟对象全部激活
	   Assert.assertEquals(mathApplication1.add(20.0, 10.0),0.0,0);
	   Assert.assertEquals(mathApplication1.subtract(20.0, 10.0),0.0,0);
	   Assert.assertEquals(mathApplication1.divide(20.0, 10.0),0.0,0);		
	   Assert.assertEquals(mathApplication1.multiply(20.0, 10.0),0.0,0);
	
	   Assert.assertEquals(mathApplication2.add(20.0, 10.0),0.0,0);
	   Assert.assertEquals(mathApplication2.subtract(20.0, 10.0),0.0,0);
	   Assert.assertEquals(mathApplication2.divide(20.0, 10.0),0.0,0);		
	   Assert.assertEquals(mathApplication2.multiply(20.0, 10.0),0.0,0);
	
	   verifyAll();// 验证所有模拟操作于一个批次。
	}
}
