package grp.pb.branch.trans.rcbtuxedo;


import java.io.InputStream;
import org.apache.log4j.Logger;
import cn.com.jit.assp.dsign.DSign;

import com.river.common.UploadFileUtil;

public class SignServerUtil {
	private static Logger _logger =  Logger.getLogger(SignServerUtil.class);;
    private static String DN = null;
    private DSign dSign;

    static {
    	    String strPropFile=UploadFileUtil.getFromPro("mq", "keyPath");
         	String _DN=UploadFileUtil.getFromPro("mq", "DN");
         	try {
				SignServerUtil.init(strPropFile,  _DN);
			} catch (Exception e) {
				_logger.error("初始化数字签名系统错误");
			}
	}
    
    private static void init(String strPropFile, String _DN)
        throws Exception
    {
        init(strPropFile);
        setDN(_DN);
    }

    public static void setDN(String _DN)
    {
        DN = _DN;
    }

    public static void init(String strPropFile)
        throws Exception
    {
        try
        {
            if(!DSign.init(strPropFile))
                throw new Exception("初始化数字签名系统错误！错误原因：DSign.init() 返回错误");
        }

        catch(Exception ex)
        {
            _logger.error("初始化数字签名系统错误！", ex);
            throw new Exception(ex);
        }
    }

    public SignServerUtil()
    {
    	
        dSign = new DSign();
       
    }

    public boolean VerifyDetachSign(String sign, String data)
        throws Exception
    {
        try
        {
            if(sign == null || sign.length() == 0)
                throw new Exception("签名数据为空");
            if(data == null || data.length() == 0)
                throw new Exception("需验证签名的数据为空");
            long lReturn = dSign.verifyDetachedSign(sign.getBytes(), data.getBytes());
            if(lReturn != 0L)
            {
                String msg = "验证签名出错，错误代码:" + lReturn + ";错误原因:" + dSign.getErrorMessage();
                _logger.info(msg + ";原数据:'" + data + "'签名:'" + sign + "'");
                return false;
            } else
            {
            	String str = dSign.getCertInfo("VS", 0, "");
                _logger.info( "VS=" + str );
                return true;
            }
        }
        catch(Exception ex)
        {
            _logger.error("验证签名出错！", ex);
            throw new Exception("验证签名出错！错误原因：" + ex.getMessage());
        }
    }

    public String VerifyDetachSign(String sign, InputStream is)
        throws Exception
    {
        try
        {
            if(sign == null || sign.length() == 0)
                throw new Exception("签名数据为空");
            if(is == null)
                throw new Exception("需验证签名的数据为空");
            long lReturn = dSign.verifyDetachedSign(sign.getBytes(), is);
            if(lReturn != 0L)
            {
                String msg = "验证签名出错，错误代码：" + lReturn + "； 错误原因：" + dSign.getErrorMessage();
                _logger.info(msg);
                throw new Exception(msg);
            } else
            {
                String str = dSign.getCertInfo("VS", 0, "");
                return str;
            }
        }
        catch(Exception ex)
        {
            _logger.error("验证签名出错！", ex);
            throw new Exception("验证签名出错！错误原因：" + ex.getMessage());
        }
    }

    public String DetachSign(String xml)
        throws Exception
    {
        try
        {
        	 int iEnd = xml.lastIndexOf("</CFX>");
             if (iEnd < 0) {
                 StringBuffer msg = new StringBuffer();
                 msg.append("查找报文体错误,End:").append(iEnd);
                 _logger.error(msg.toString());
                 throw new Exception(msg.toString());
             }
             String data = xml.substring(0, iEnd + 6);
             _logger.info("需要签名的数据:"+data);
            String sign = dSign.detachSign(DN, data.getBytes( "GBK"));
            if(sign == null || sign.length() == 0){
            	throw new Exception("签名数据失败");
            }
            _logger.info("返回的签数据:"+sign);
            return sign;
        }
        catch(Throwable ex)
        {
            _logger.error("签名出错!", ex);
            throw new Exception("签名出错!"+ex);
        }
    }

    public String DetachSign(byte data[])
        throws Exception
    {
        try
        {
            String sign = dSign.detachSign(DN, data);
            return sign;
        }
        catch(Throwable ex)
        {
            _logger.error("签名出错！", ex);
            throw new Exception("签名出错！错误原因：" + ex.getMessage());
        }
    }

    public String DetachSign(InputStream is)
        throws Exception
    {
        try
        {
            String sign = dSign.detachSign(DN, is);
            return sign;
        }
        catch(Throwable ex)
        {
            _logger.error("签名出错！", ex);
            throw new Exception("签名出错！错误原因：" + ex.getMessage());
        }
    }

    public String GetVerifyDetachSignInfo()
        throws Exception
    {
        try
        {
            StringBuffer sb = new StringBuffer();
            sb.append("证书信息：");
            sb.append("\n     证书主题：").append(dSign.getCertInfo("VS", 0, ""));
            sb.append("\n       版本号：").append(dSign.getCertInfo("VS", 3, ""));
            sb.append("\n       序列号：").append(dSign.getCertInfo("VS", 2, ""));
            sb.append("\n 有效起始日期：").append(dSign.getCertInfo("VS", 5, ""));
            sb.append("\n 有效终止日期：").append(dSign.getCertInfo("VS", 6, ""));
            sb.append("\n   颁发者主题：").append(dSign.getCertInfo("VS", 1, ""));
            sb.append("\n     电子邮件：").append(dSign.getCertInfo("VS", 4, ""));
            return sb.toString();
        }
        catch(Throwable ex)
        {
            _logger.info("获取签名证书信息出错!", ex);
            throw new Exception("获取签名证书信息出错，错误原因：" + ex.getMessage());
        }
    }
}
                                                                        