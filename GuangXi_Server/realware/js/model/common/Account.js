/***
 * 账户模型
 */
Ext.define('pb.model.common.Account', {
	extend : 'Ext.data.Model',
	fields : [ {
		name : 'account_name',
		type : 'string'
	}, {
		name : 'account_no',
		type : 'string'
	}, {
		name : 'agency_code',
		type : 'string'
	}, {
		name : 'agency_name',
		type : 'string'
	}, {
		name : 'account_type_code',
		type : 'string'
	}, {
		name : 'account_type_name',
		type : 'string'
	}, {
		name : 'fund_type_code',
		type : 'string'
	}, {
		name : 'fund_type_name',
		type : 'string'
	}, {
		name : 'bank_code',
		type : 'int'
	}, {
		name : 'bank_name',
		type : 'int'
	}, {
		name : 'admdiv_code',
		type : 'string'
	}, {
		name : 'create_date',
		type : 'string'
	}, {
		name : 'is_valid',
		type : 'int'
	}, {
		name : 'account_id',
		type : 'string'
	}, {
		name : 'balance',
		type : 'int'
	}]
});
