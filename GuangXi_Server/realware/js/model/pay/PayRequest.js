/***
 * 支付明细模型
 */
Ext.define('pb.model.pay.PayRequest', {
	extend : 'Ext.data.Model',
	fields : [
	{
		name : 'bill_type_id',
		type : 'int'
	}, {
		name : 'last_ver',
		type : 'string'
	}, {
		name : 'agency_code',
		type : 'string'
	}, {
		name : 'agency_name',
		type : 'string'
	}, {
		name : 'pay_request_id',
		type : 'int'
	}, { 
		name : 'pay_request_code',
		type : 'string'
	}, { 
		name : 'pay_voucher_id',
		type : 'int'
	}, { 
		name : 'is_same_bank',
		type : 'int'
	}, { 
		name : 'pay_voucher_code',
		type : 'string'
	}, {
		name : 'pay_amount',
		type : 'double'
	}, {
		name : 'pay_refund_amount',
		type : 'double'
	}, {
		name : 'pay_type_code',
		type : 'string'
	}, {
		name : 'pay_type_name',
		type : 'string'
	}, {
		name : 'bgt_type_code',
		type : 'string'
	}, {
		name : 'bgt_type_name',
		type : 'string'
	}, {
		name : 'pay_kind_code',
		type : 'string'
	}, {
		name : 'pay_kind_name',
		type : 'string'
	}, {
		name : 'exp_func_code',
		type : 'string'
	}, {
		name : 'exp_func_name',
		type : 'string'
	}, {
		name : 'exp_func_code1',
		type : 'string'
	}, {
		name : 'exp_func_name1',
		type : 'string'
	}, {
		name : 'exp_func_code2',
		type : 'string'
	}, {
		name : 'exp_func_name2',
		type : 'string'
	}, {
		name : 'exp_func_code3',
		type : 'string'
	}, {
		name : 'exp_func_name3',
		type : 'string'
	}, {
		name : 'exp_eco_code',
		type : 'string'
	}, {
		name : 'exp_eco_name',
		type : 'string'
	}, {
		name : 'exp_eco_code1',
		type : 'string'
	}, {
		name : 'exp_eco_name1',
		type : 'string'
	}, {
		name : 'exp_eco_code2',
		type : 'string'
	}, {
		name : 'exp_eco_name2',
		type : 'string'
	}, {
		name : 'pro_cat_code',
		type : 'string'
	}, {
		name : 'pro_cat_name',
		type : 'string'
	}, {
		name : 'clear_date',
		type : 'date'
	} , {
		name : 'payee_account_no',
		type : 'string'
	} , {
		name : 'payee_account_bank_no',
		type : 'string'
	} ,{
		name : 'payee_account_name',
		type : 'string'
	} , {
		name : 'payee_account_bank',
		type : 'string'
	} , {
		name : 'trans_succ_flag',
		type : 'int'
	}, {
		name : 'trans_res_msg',
		type : 'string'
	}, {
		name : 'agent_business_no',
		type : 'string'
	} , {
		name : 'remark',
		type : 'string'
	} , {
		name : 'dep_pro_code',
		type : 'string'
	} , {
		name : 'dep_pro_name',
		type : 'string'
	} , {
		name : 'hold1',
		type : 'string'
	} , {
		name : 'hold2',
		type : 'string'
	} , {
		name : 'hold3',
		type : 'string'
	} , {
		name : 'hold4',
		type : 'string'
	} , {
		name : 'pb_set_mode_name',
		type : 'string'
	} , {
		name : 'pb_set_mode_code',
		type : 'string'
	} , {
		name : 'pay_date',
		type : 'string'
	} , {
		name : 'fund_type_code',
		type : 'string'
	} , {
		name : 'fund_type_name',
		type : 'string'
	} , {
		name : 'ori_payee_account_no',
		type : 'string'
	} , {
		name : 'ori_payee_account_bank_no',
		type : 'string'
	} ,{
		name : 'ori_payee_account_name',
		type : 'string'
	} , {
		name : 'ori_payee_account_bank',
		type : 'string'
	}  ]
});
