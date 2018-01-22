package test;
/*教程   http://www.yiibai.com/easymock/easymock_junit_integration.html
 * 在本章中，我们将集成JUnit和EasyMock在一起。
 * 我们使用计算器服务的例子。目的是创建一个数学应用，
 * 它使用CalculatorService做加，减，除运算操作。
 * 我们将使用EasyMock来模拟虚拟实现CalculatorService。*/


//创建一个接口CalculatorService，其目的是提供各种计算相关的功能。
public interface CalculatorService {
	public double add(double input1, double input2);

	public double subtract(double input1, double input2);

	public double multiply(double input1, double input2);

	public double divide(double input1, double input2);
	
	 public void serviceUsed();
}