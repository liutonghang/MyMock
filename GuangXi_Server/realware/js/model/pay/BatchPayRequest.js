/***
 * 批量支付凭证明细单模型
 */
Ext.define('pb.model.pay.BatchPayRequest', {
	extend : 'Ext.data.Model',
	fields : [{
		name : 'batchpay_request_id',
		type : 'int'
	}, {
		name : 'batchpay_request_code',
		type : 'string'
	}, {
		name : 'bill_type_id',
		type : 'int'
	}, {
		name : 'biz_type_id',
		type : 'int'
	}, {
		name : 'pay_amount',
		type : 'double'
	}, {
		name : 'ori_pay_amount',
		type : 'double'
	}, {
		name : 'last_ver',
		type : 'int'
	}, {
		name : 'payee_account_no',
		type : 'string'
	}, {
		name : 'payee_account_name',
		type : 'string'
	}, {
		name : 'payee_account_bank',
		type : 'string'
	}, {
		name : 'batchpay_voucher_id',
		type : 'int'
	}, {
		name : 'batchpay_voucher_code',
		type : 'string'
	}, {
		name : 'trans_succ_flag',
		type : 'int'
	}, {
		name : 'payee_account_bank_no',
		type : 'String'
	}, {
		name : 'is_same_bank',
		type : 'String'
	}, {
		name : 'trans_res_msg',
		type : 'string'
	}, {
		name : 'pb_set_mode_name',
		type : 'string'
	}, {
		name : 'pb_set_mode_code',
		type : 'string'
	}
]
});