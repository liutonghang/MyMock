package test;

import org.easymock.EasyMock;
import org.easymock.EasyMockRunner;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import static org.junit.Assert.*;

@RunWith(EasyMockRunner.class)
public class MathApplicationTester3 {

	private MathApplication mathApplication;
	private CalculatorService calcService;
//不用注解的方法创建moke
	@Before
	public void setUp() {
		mathApplication = new MathApplication();
		//calcService = EasyMock.createMock(CalculatorService.class);
		calcService = EasyMock.createNiceMock(CalculatorService.class); // 表示默认全部成功
		mathApplication.setCalculatorService(calcService);
	}

	@Test
	public void testCalcService(){
	      
	      EasyMock.expect(calcService.add(20.0,10.0)).andReturn(30.0);
	   
	      EasyMock.replay(calcService);	
	    
	      Assert.assertEquals(mathApplication.add(20.0, 10.0),30.0,0);

	      Assert.assertEquals(mathApplication.subtract(20.0, 10.0),0.0,0);
	     
	      Assert.assertEquals(mathApplication.divide(20.0, 10.0),0.0,0);		
	    
	      Assert.assertEquals(mathApplication.multiply(20.0, 10.0),0.0,0);

	
	      EasyMock.verify(calcService);
	   }

}
