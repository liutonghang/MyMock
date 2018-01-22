/***
 * 转账日志模型
 */
Ext.define('pb.model.common.TransLog', {
	extend : 'Ext.data.Model',
	fields : [ {
		name : 'trans_log_id',
		type : 'string'
	}, {
		name : 'trans_type',
		type : 'int'
	}, {
		name : 'trans_amount',
		type : 'double'
	}, {
		name : 'create_date',
		type : 'string'
	}, {
		name : 'voucher_no',
		type : 'string'
	}, {
		name : 'trans_succ_flag',
		type : 'int'
	}, {
		name : 'trans_res_code',
		type : 'string'
	}, {
		name : 'trans_res_msg',
		type : 'string'
	}, {
		name : 'admdiv_code',
		type : 'string'
	}, {
		name : 'vt_code',
		type : 'string'
	}, {
		name : 'pay_account_no',
		type : 'string'
	}, {
		name : 'pay_account_name',
		type : 'string'
	}, {
		name : 'payee_account_no',
		type : 'string'
	}, {
		name : 'payee_account_name',
		type : 'string'
	}, {
		name : 'user_code',
		type : 'string'
	}, {
		name : 'accthost_seqId',
		type : 'string'
	}, {
		name : 'bank_code',
		type : 'string'
	} ]
});
