package grp.pt.pb.ss;

import grp.pt.bill.Paging;
import grp.pt.pb.ss.model.RelationAccount;
import grp.pt.pb.ss.model.RelationAccountDetail;
import grp.pt.pb.trans.model.RelationAccountDTO;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * 自助柜面Hessian接口（标准接口）
 * @author ZJM
 *
 */
public interface IPbssService {

	/**
	 * 用户登录认证【2008】
	 * @param reqMap
	 * @param objs
	 * @return
	 */
	List<Map<String, String>> checkLogin(Map<String, String> reqMap,Object...objs);
	
	/**
	 * 证书登陆或其他方式登陆
	 * @param reqMap
	 * @param objs
	 * @return
	 */
	public List<Map<String, String>> selfCounterLogin(Map<String, String> reqMap,Object...objs);
	
	/**
	 * 待办事项查询【2006】
	 * @param payAccountNo
	 * @param objects
	 * @return
	 */
	int[] getTodoListNum(String payAccountNo,Object...objects);
	
	/**
	 * 修改登录密码【2014】
	 * @param oldPwd
	 * @param newPwd
	 * @param objects
	 * @return
	 */
	void modifyPasswordOrCstInfo(String userLoginCode,String oldPwd,String newPwd,Object...objects);
	
	/**
	 * 支付凭证查询【2000】
	 * @param jsonMap
	 * @param payAccountNo
	 * @param vtCode
	 * @param isSameBank
	 * @param filedNames
	 * @param page
	 * @param objects
	 * @return
	 */
	Map<String, Object> loadPayVoucherList(String jsonMap,String payAccountNo,String vtCode,String isSameBank,String filedNames,Paging page,Object...objects);
	
	/**
	 * 支付凭证确认【2001】
	 * @param vouMap
	 * @param isSameBank
	 * @param userCode
	 * @param objects
	 */
	String transferPayVouchers(Map<Long, Object[]> vouMap,String isSameBank,String userCode,Object...objects);
	
	/**
	 * 支付凭证退回【2002】
	 * @param vouMap
	 * @param returnReason
	 * @param userCode
	 * @param objects
	 * @return
	 */
	void backPayVouchers(Map<Long, Long> vouMap,String returnReason,String userCode,Object...objects);
	
	
	/**
	 * 退款流水查询【2003】
	 * @param jsonMap
	 * @param payAccountNo
	 * @param filedNames
	 * @param page
	 * @param objects
	 * @return
	 */
	Map<String, Object> loadRefundSerial(String jsonMap,String payAccountNo,String filedNames,Paging page,Object...objects);
	
	/**
	 * 已支付凭证明细查询【2004】
	 * @param payVoucherId
	 * @param filedNames
	 * @param page
	 * @param objects
	 * @return
	 */
	String loadPayRequestList(long payVoucherId,String filedNames,Paging page,Object...objects);
	
	
	Map<String, Object>loadPayRequestMap(long payVoucherId,String filedNames,Paging page,Object...objects);
	/**
	 * 退款通知书录入【2005】
	 * @param refundType
	 * @param payVoucherId
	 * @param payRequestId
	 * @param payAmt
	 * @param remark
	 * @param transSerialId
	 * @param userCode
	 * @param objects
	 */
	void inputRefundVoucher(int refundType,long payVoucherId,String payVoucherCode,long payRequestId,
			BigDecimal payAmt,String remark,long transSerialId,String userCode,Object...objects);
	
	/*void inputRefundVoucher(int refundType, List<Map<String,String>> paraMap, String userCode , Object...objects);*/
	
	
	/**
	 * 退款通知书作废【2007】
	 * @param vouMap
	 * @param objects
	 */
	void invalidateRefundVoucher(Map<Long, Long> vouMap,Object...objects);
	
	
	
	/**
	 * 电子文件柜信息加载【2015】
	 * @param jsonMap   查询区条件
	 * @param payAccountNo  单位零余额账号
	 * @param filedNames   列表名
	 * @param page  分页对象
	 * @param objects  预留可变参数
	 * @return  文件柜信息Json字符串
	 */
	String loadElecVoucherList(String jsonMap,String payAccountNo,String filedNames,Paging page,Object...objects);
	
	
	Map<String, Object> loadElecVoucherMap(String jsonMap, String payAccountNo,
			String filedNames, Paging page, Object... objects);
	/**
	 * 电子文件PDF下载【2016】
	 * @param id   电子文件信息主键
	 * @param saveType   PDF文件存放类型
	 * @param fileDirectory    PDF文件存放路径
	 * @param fileName    PDF文件名
	 * @return
	 */
//	byte[] downloadElecVoucherPDF(long id,int saveType,String fileDirectory,String fileName);
	
	byte[] downloadElecVoucherPDF(String jsonMap);
	
	/**
	 * 电子文件信息标记已读【2017】
	 * @param id  电子文件信息主键
	 */
	void signElecVoucherReaded(long id);
	
	/**
	 * 查询关联账户
	 * @param jsonMap
	 * @param fieldNames
	 * @param payAccountNo
	 * @param page
	 * @param objects
	 * @return
	 */
	String loadRelateAcct(String jsonMap, String fieldNames, String payAccountNo, Paging page, Object...objects);
	
	List<RelationAccount> loadRelationAccount(String payAccountNo,Map<String, Object> paraMap,Object...objects);
	
	List<RelationAccountDetail> loadRelationAccountDetail(Map<String, Object> paraMap,Object...objects);
	
	/**
	 * 关联账户明细内容查询
	 * @param jsonMap
	 * @param fieldNames
	 * @param acctNo
	 * @param page
	 * @param objects
	 * @return
	 */
	String loadRelatedAccountDetails(String jsonMap, String fieldNames, String acctNo, Paging page, Object...objects);
	
	/**
	 * 获取UKCode
	 * @param user_login_code
	 * @return
	 */
	String getUkeyId(String user_login_code);
	
	/**
	 * 将补录的行号更新到业务表
	 * @param payVoucherIdsStr
	 * @param payeeBankNo
	 */
	void saveBankNo(String payVoucherIdsStr,String payeeBankNo);

	public void sendSmsForLogin(Map<String, String> reqConditions)throws Exception;
 
	byte[] viewElecVoucher(long id, String filename, String filedirectory);

	/**
	 * 获取单位零余额
	 * @param customer
	 * @return
	 */
	List<Map<String, String>> getZeroNo(String customer);
	
	/**
	 * 验证转账密码
	 * @param <UserSignZeroNo>
	 * @param password
	 * @return
	 */
	public int checkTransPassword(String password,String loginCode);
	
	/**
	 * 自助柜面同行转跨行
	 * @param voucher_no
	 * @param voucher_pk
	 * @return
	 */
	public int same2other(String voucher_no,String voucher_pk);

}
