package Test2;

import static org.junit.Assert.*;

import org.easymock.EasyMock;
import org.junit.Test;
import org.springframework.test.util.ReflectionTestUtils;

public class OurClassTest {

    @Test
    public void testOurClass() {
      
       OurClass classUnderTest = new OurClass();
       assertTrue("fun should return 0", classUnderTest.fun() == 0);
      
       OtherClass other = new OtherClass() {
           public int fun() {
              return 1;
           }
       };
       // 调用此函数将我们自己生成的一个对象注入到classUnderTest对象中，注意，即使该对象是
       // private类型的也没有问题。
       ReflectionTestUtils.setField(classUnderTest, "other", other);
       assertTrue("fun should return 1", classUnderTest.fun() == 1);
      
       // 创建Mock对象
       OtherClass other2 = EasyMock.createMock(OtherClass.class);
       // 设定 Mock 对象的预期行为和输出
       EasyMock.expect(other2.fun()).andReturn(2).times(1);
       // 录制Mock对象的行为
       EasyMock.replay(other2);
       // 调用 Mock 对象方法进行单元测试
       ReflectionTestUtils.setField(classUnderTest, "other", other2);
       assertTrue("fun should return 2", classUnderTest.fun() == 2);
       // 对 Mock 对象的行为进行验证
       EasyMock.verify(other2);
    }

}
