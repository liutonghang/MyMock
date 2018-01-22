package grp.pb.branch.gxboc.trans;

import java.io.UnsupportedEncodingException;
import java.text.SimpleDateFormat;
import java.util.Date;

import org.eclipse.jetty.util.log.Log;

public class transUtilForGXBOCTrans {
	public static byte[] lenBytes(int len, byte[] bytesData) {
		byte[] bytes = new byte[len];
		int cou = 0;
		while (cou < len) {
			bytes[cou] = bytesData[cou];
			cou++;
		}
		return bytes;
	}
	
	/**
	 * 将字符串前补空格转换成指定长度的字节数组
	 * 
	 * @param s
	 * @param len
	 * @return
	 */
	public static byte[] getFixlenStrBytesByAddSpaceBefore(String str ,int len){
		byte[] b = null;
		if(str==null){
			str = "";
		}
		byte[] strByte = str.getBytes();
		if(strByte.length>len){
			throw new RuntimeException("字符串["+str+"]长度："+strByte.length+"大于要转换的字节数组长度："+len);
		}
		StringBuffer sb = new StringBuffer();
		
		sb.append(str);
		
		for(int i=0;i<len-strByte.length;i++){
			sb.append(" ");
		}
		
		try {
			b =  sb.toString().getBytes("GBK");
		} catch (UnsupportedEncodingException e) {
			e.printStackTrace();
		}
		return b;
	}
	
	public static String formatDate(Date date, String formatStr) {
		try {
			if (formatStr == null || "".equalsIgnoreCase(formatStr))
				formatStr = "yyyy-MM-dd HH:mm:ss";
			SimpleDateFormat formatter = new SimpleDateFormat(formatStr);
			if (null != date) {
				return formatter.format(date);
			} else {
				return formatter.format(new Date());
			}
		} catch (Exception e) {
			e.printStackTrace();
			return "";
		}
	}
}
