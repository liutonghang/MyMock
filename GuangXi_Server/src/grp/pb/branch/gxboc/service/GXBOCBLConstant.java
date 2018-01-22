package grp.pb.branch.gxboc.service;

public class GXBOCBLConstant {
	/**
	 * 支付凭证  不处理
	 */
	public static final int BLReqOperation_NOT_DISPOSE = 0;
	/**
	 * 支付凭证 确认支付
	 */
	public static final int BLReqOperation_PAY = 1;
	/**
	 * 支付凭证 退回
	 */
	public static final int BLReqOperation_RETURN = 2;
	
	/**
	 * 接收请求成功
	 */
	public static final String BLRES_RESULT_RECEIVE_SUCC = "0";
	/**
	 * 交易成功
	 */
	public static final String BLRES_RESULT_PAY_SUCC = "1";
	/**
	 * 交易失败
	 */
	public static final String BLRES_RESULT_PAY_FAIL = "2";
	
	/**
	 * 接收失败
	 */
	public static final String BLRES_RESULT_RECEIVE_FAIL = "3";
	
	/**
	 * 交易类型  现金
	 */
	public static final String TRANS_TYPE_CASH = "9";
	/**
	 * 交易类型 信用卡
	 */
	public static final String TRANS_TYPE_OFFICIAL_CARD = "8";
	/**
	 * 交易类型 公务卡
	 */
	public static final String TRANS_TYPE_CREDIT_CARD= "7";

	/**
	 * BL凭证状态 未请款
	 */
	public static final String NOT_REQMONEY = "1";
	
	/**
	 * BL凭证状态 请款失败
	 */
	public static final String REQMONEY_FAIL = "2";
	
	/**
	 * BL凭证状态 已请款支付失败
	 */
	public static final String REQMONEY_SUCC = "3";
	/**
	 * BL凭证状态 已支付
	 */
	public static final String PAYMONEY_SUCC = "4";
	/**
	 * BL凭证状态 已撤单
	 */
	public static final String VOUCHER_BACK_SUCC = "5";
	/**
	 * BL凭证状态 已退款
	 */
	public static final String VOUCHER_REFUND_SUCC = "6";
	/**
	 * BL凭证状态 支付成功回单发送失败
	 */
	public static final String SEND_RETURN_VOUOCHER_FAIL = "7";
	/**
	 * BL凭证状态 退回失败
	 */
	public static final String VOUCHER_BACK_FAIL = "8";
	/**
	 * BL凭证状态 已请款支付未明
	 */
	public static final String PAYMONEY_NOTCONFIRM = "9";
	/**
	 * BL凭证状态 异常凭证
	 */
	public static final String VOUCHER_ABNORMAL = "A";
	
	/**
	 * 凭证类型  直接
	 */
	public static final String BL_DIRECTVOU_FLAG = "1";
	/**
	 * 凭证类型  授权
	 */
	public static final String BL_ACCREDITVOU_FLAG = "2";
	/**
	 * 凭证类型 实拨
	 */
	public static final String BL_REALPAY_FLAG = "3" ;
	
	/**
	 * 零余额到收款人(信用卡)，将信用卡过渡户作为收款人
	 */
	//public final static int PAY2PAYEEBYCREDITCARD = 70;
	
	/**
	 * 零余额到收款人（公务卡），将公务卡过渡户作为收款人
	 */
	//public final static int PAY2PAYEEBYOFFICECARD = 80;
	
	  /**
     * 信用卡
     */
    public final static String CREDITCARD = "7";
    /**
     * 公务卡
     */
    public final static String OFFICECARD = "8";
    
    /**
	 * 按日查询凭证交易状态（2003）
	 */
	public static final String GXBOC_VOUCHER_QUREY = "2003";
	
	/**
	 * 按日查询凭证交易状态回执（1003）
	 */
	public static final String GXBOC_VOUCHER_QUREY_RESP = "1003";
	/**
	
	/**
	 * 待清算退款凭证查询请求（2010）
	 */
	public static final String GXBOC_WAITCLEAR_REFUND_VOUCHER_QUERY = "2010";
	
	/**
	 * 待清算退款凭证查询请求回执（1010）
	 */
	public static final String GXBOC_WAITCLEAR_REFUND_VOUCHER_QUERY_RESP = "1010";
	
	/**
	 * 撤销退款凭证确认请求（2011）
	 */
	public static final String GXBOC_REPEAL_REFUND_VOUCHER = "2011";
	
	/**
	 * 撤销退款凭证确认回执（1011）
	 */
	public static final String GXBOC_REPEAL_REFUND_VOUCHER_RESP = "1011";
	
	/**
	 * 按零余额账号查询授权支付剩余额度列表请求（2008）
	 */
	public static final String GXBOC_VOU_ACCREDIT_ED = "2008";

	
	/**
	 * (响应报文）按零余额账号查询授权支付剩余额度列表请求回执（1008）
	 */
	public static final String GXBOC_VOU_ACCREDIT_ED_RESP = "1008";
	
	/**
	 * 确认未明  实拨支付未确认记录  
	 */
	public static final int UNKNOWN_CONFIRMED = -2;
	
	//凭证退回失败:用于记录广西中行bL的凭证状态
	public static final int VOUCHERFLAG_VALUE_BACK_FAIL = 3;
	
	/**
	 * 支付未明
	 */
	public static final int TRANS_FLAG_UNKNOWN = 2;
	
	
	
}
