package test;

import org.easymock.EasyMock;
import org.easymock.EasyMockRunner;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import static org.junit.Assert.*;

@RunWith(EasyMockRunner.class)
//本例讲述的是最基本的mock知识
public class MathApplicationTest {

	private MathApplication mathApplication;
	private CalculatorService calcService;

	@Before
	public void setUp() {
		mathApplication = new MathApplication();
		//1.//创建mock
		calcService = EasyMock.createMock(CalculatorService.class);
		mathApplication.setCalculatorService(calcService);
	}
	
	@Test
	public void test() {
		//2.设置期望
		  EasyMock.expect(calcService.add(20.0,10.0)).andReturn(30.0);
	      EasyMock.expect(calcService.subtract(20.0,10.0)).andReturn(10.0);
	      //3.激活mock
	      EasyMock.replay(calcService);	
		  //4.验证mock
	      Assert.assertEquals(mathApplication.add(20.0, 10.0),30.0,0);
	      
	}

}
