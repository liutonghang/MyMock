/***
 * 参数维护
 */
Ext.define('pb.model.common.Parameter', {
	extend : 'Ext.data.Model',
	fields : [ {
		name : 'para_id',
		type : 'string'
	}, {
		name : 'para_key',
		type : 'string'
	}, {
		name : 'para_name',
		type : 'string'
	}, {
		name : 'default_value',
		type : 'string'
	}, {
		name : 'para_value',
		type : 'string'
	}, {
		name : 'para_remark',
		type : 'string'
	}, {
		name : 'is_public',
		type : 'int'
	}, {
		name : 'nullable',
		type : 'int'
	}, {
		name : 'admdiv_code',
		type : 'string'
	}, {
		name : 'parent_id',
		type : 'int'
	} ]
});
