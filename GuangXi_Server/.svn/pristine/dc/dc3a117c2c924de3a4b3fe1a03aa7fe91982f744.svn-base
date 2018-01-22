package grp.pt.pb.util;

import grp.pt.database.sql.Eq;
import grp.pt.database.sql.SqlGenerator;
import grp.pt.database.sql.Table;
import grp.pt.database.sql.Update;
import grp.pt.idgen.IdGen;
import grp.pt.pb.exception.PbException;
import grp.pt.util.PlatformUtils;
import grp.pt.util.model.Session;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.apache.commons.lang.StringUtils;

/**
 * YYYYMMDDXXXXTTM 总15位 YYYYmmdd 日期8位 XXXX 批次号（当天）唯一标示 TT 业务类型 2位 M 调整期标志位 默认为0
 * 
 * @author zhouqi
 * 
 * @param <T>
 */
public class ExpTxtFileBillNo {

	private static Set<String> existsSeq = new HashSet<String>();

	static HashMap<String, String> bizMap = null;

	public static String createNewNo(Session sc, Object obj) {
		String now = new SimpleDateFormat("yyyyMMdd").format(new Date());
		String seqName = "SEQ_PB_TXT";
		try {
			createNewDdSequence(sc, seqName, 9999);
		} catch (Exception ex) {
			throw new RuntimeException(ex);
		}
		long num = IdGen.genNumId(seqName);
		num = num % 1000;
		StringBuffer sb = new StringBuffer();
		String vtCode = PlatformUtils.getProperty(obj, "vt_code").toString();
		if("12".equals(PlatformUtils.getProperty(obj, "pay_type_code").toString())){
			if("2301".equals(vtCode)){
				vtCode ="2303";
			}else if("2302".equals(vtCode)){
				vtCode ="2304";
			}
		}
		if(null == PbParameters.getStringParameter("pb.append8911")){
			sb.append(now).append(StringUtils.leftPad(String.valueOf(num), 4, '0'))
			.append(getBizType(vtCode)).append("0").append("8911");	
		}
		else{
			sb.append(now).append(StringUtils.leftPad(String.valueOf(num), 4, '0'))
			.append(getBizType(vtCode)).append("0").append(PbParameters.getStringParameter("pb.append8911",PlatformUtils.getProperty(obj, "admdiv_code").toString()));
		}
		return sb.toString();
	}
	public static void updateTipsFileName4ClearVoucher(Session sc, Object obj,String fileName){
		try{
			String clearVoucherCode = PlatformUtils.getProperty(obj, "pay_clear_voucher_code").toString();
			Update update = new Update().table(new Table("pb_pay_clear_voucher"));
			update.set(new Eq("tips_file_name","'"+fileName+"'"));
			String where ="where pay_clear_voucher_code ="+clearVoucherCode;
			StaticApplication.getDaoSupport().executeUpdate(SqlGenerator.generateSql(update)+where);
		}catch(Exception ex){
			throw new PbException("更新划款tips文件名失败");
		}
	}
	protected static void createNewDdSequence(Session sc, String seqName,
			int maxValue) throws Exception {
		if (existsSeq.contains(seqName))
			return;
		IdGen.genSeqIfNotExists(sc, seqName, 0, maxValue, 1, false);
		existsSeq.add(seqName);
	}

	/**
	 * 25－直接支付凭证； 26－直接支付退回凭证； 27－授权支付凭证； 28－授权支付退回凭证； 01－直接支付额度通知单；
	 * 02－授权支付额度通知单。 03－实拨拨款单
	 * 
	 * @return
	 */
	private static String getBizType(String vtCode) {
		if (bizMap == null) {
			bizMap = new HashMap<String, String>();
			bizMap.put("2301", "25");
			bizMap.put("2302", "26");
			bizMap.put("2303", "27");
			bizMap.put("2304", "28");
			bizMap.put("5106", "02");
			bizMap.put("5108", "01");
			bizMap.put("52070", "17");
			bizMap.put("52071", "23");
		}
		return bizMap.get(vtCode);
	}
}
