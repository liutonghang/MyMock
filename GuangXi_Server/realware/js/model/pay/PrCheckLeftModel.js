/***
 * 公务卡信息模型
 */
Ext.define('pb.model.pay.PrCheckLeftModel', {
	extend : 'Ext.data.Model',
	fields : [ { 
		name : 'card_info_id',
		type : 'int'
	},{ 
		name : 'admdiv_code',
		type : 'string'
	},{ 
		name : 'business_type',
		type : 'int'
	}, { 
		name : 'card_bank_code',
		type : 'string'
	}, { 
		name : 'card_bank_name',
		type : 'string'
	}, {
		name : 'card_type',
		type : 'string'
	}, {
		name : 'card_info_code',
		type : 'String'
	},{ 
		name : 'remark',
		type : 'string'
	}, { 
		name : 'year',
		type : 'string'
	}, {
		name : 'tran_flag',
		type : 'int'
	} , {
		name : 'vou_date',
		type : 'string'
	}, { 
		name : 'str_voucher_no',
		type : 'string'
	}, {
		name : 'vt_code',
		type : 'string'
	}, {
		name : 'sal_kind',
		type : 'int'
	}]
});