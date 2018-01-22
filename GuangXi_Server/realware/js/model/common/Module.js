/***
 * 功能模型
 */
Ext.define('pb.model.common.Module', {
	extend : 'Ext.data.Model',
	fields : [ {
		name : 'id',
		type : 'int'
	}, {
		name : 'code',
		type : 'string'
	}, {
		name : 'name',
		type : 'string'
	}, {
		name : 'jsp_name',
		type : 'string'
	}, {
		name : 'codename',
		type : 'string'
	}, {
		name : 'remark',
		type : 'string'
	}, {
		name : 'last_ver',
		type : 'int'
	}, {
		name :'ref_js',
		type : 'string'
	} ],
	hasMany : [ {
		model : 'pb.model.common.Button',
		name : 'buttons'
	}, {
		model : 'pb.model.common.Status',
		name : 'statusList'
	} ]
});