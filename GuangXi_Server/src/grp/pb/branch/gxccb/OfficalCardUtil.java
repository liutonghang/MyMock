package grp.pb.branch.gxccb;


import grp.pt.pb.exception.PbException;
import grp.pt.pb.util.OperateTextUtils;
import grp.pt.pb.util.PbParameters;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

import org.apache.log4j.Logger;

/**
 * 公务卡卡bin判断
 * @author TL
 *
 */
public class OfficalCardUtil {

	private static Logger log = Logger.getLogger(OfficalCardUtil.class);

	private static List<OfficalCardConfigDTO> cardDTOList = new ArrayList<OfficalCardConfigDTO>();
	private static String officalCardConfigDir = null;
	static {
		officalCardConfigDir = "OfficalCard.txt";
		OfficalCardUtil.initOfficalCardConfig();
	}
	public static void initOfficalCardConfig() {
		String filename = officalCardConfigDir;
		try {
			loadOfficalCardInfo(filename);
		} catch (IOException e) {
			String errorInfo = "公务卡配置初始化失败："+e.getMessage();
			log.error(errorInfo);
			e.printStackTrace();
			throw new PbException(errorInfo);
		}
	}
	public static void loadOfficalCardInfo(String filename) throws IOException{
		InputStream resourceAsStream = OfficalCardUtil.class.getClassLoader().getResourceAsStream(filename);
		//获取银行行号文件
		BufferedReader bufr = OperateTextUtils.getBufferedReader(resourceAsStream);
		String str;
		// 要赋值的属性名称
		String names = bufr.readLine();
		int rownum = 2;
		while ((str = bufr.readLine()) != null) {
			OfficalCardConfigDTO card= OperateTextUtils.getObject(rownum++, str, names,OfficalCardConfigDTO.class);
			cardDTOList.add(card);
		}
	}
	/**
	 * 判断卡号是否为公务卡
	 * @param card_no
	 * @return	是返回 true 
	 * 		      不是返回false
	 */
	public static boolean match(String card_no) {
		boolean isOfficalCard = false;
		for (OfficalCardConfigDTO dto : cardDTOList) {
			isOfficalCard = dto.match(card_no);
			if (isOfficalCard)
				return true;
		}
		return isOfficalCard;
	}

	public static void main(String args[]) {
		System.out.println(OfficalCardUtil.match("62831740904114611"));
		System.out.println(OfficalCardUtil.match("6283174090411461"));
	}
}
