package test;
//创建一个Java类来表示MathApplication.
public class MathApplication {
	private CalculatorService calcService;
	
	private CalculatorService calcService2;

	public double add2(double input1, double input2) {
		return calcService2.add(input1, input2);
	}

	public void setCalculatorService(CalculatorService calcService) {
		this.calcService = calcService;
	}

	public double add(double input1, double input2) {
		return calcService.add(input1, input2);
	}

	public double subtract(double input1, double input2) {
		return calcService.subtract(input1, input2);
	}

	public double multiply(double input1, double input2) {
		return calcService.multiply(input1, input2);
	}

	public double divide(double input1, double input2) {
		return calcService.divide(input1, input2);
	}
}