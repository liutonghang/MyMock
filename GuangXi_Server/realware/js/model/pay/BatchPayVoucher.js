/***
 * 批量支付凭证主单模型
 */
Ext.define('pb.model.pay.BatchPayVoucher', {
	extend : 'Ext.data.Model',
	fields : [{
		name : 'batchpay_voucher_id',
		type : 'int'
	}, {
		name : 'batchpay_voucher_code',
		type : 'string'
	}, {
		name : 'pay_voucher_code',
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
		name : 'pay_account_no',
		type : 'string'
	}, {
		name : 'pay_account_name',
		type : 'string'
	}, {
		name : 'return_reason',
		type : 'string'
	}, {
		name : 'trans_res_msg',
		type : 'string'
	}, {
		name : 'last_ver',
		type : 'int'
	},{ 
		name : 'total_num',
		type : 'int'
	},{ 
		name : 'succ_num',
		type : 'int'
	},{ 
		name : 'succ_amount',
		type : 'double'
	}, {
		name : 'vou_date',
		type : 'string'
	}, {
		name : 'is_same_bank',//湖北要根据此字段进行提示，提交到主干，提交个性化是为了给现场
		type : 'string'
	}],
	hasMany : [ {
		model : 'pb.model.pay.PayVoucher',
		name : 'details'
	} ]
});
