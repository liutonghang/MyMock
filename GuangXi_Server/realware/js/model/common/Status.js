/***
 * 状态模型
 */
Ext.define('pb.model.common.Status', {
	extend : 'Ext.data.Model',
	fields : [ {
		name : 'status_id',
		type : 'string'
	}, {
		name : 'status_code',
		type : 'string'
	}, {
		name : 'status_name',
		type : 'string'
	},{
		name : 'status_order',
		type : 'string'
	}, {
		name : 'remark',
		type : 'string'
	}, {
		name : 'conditionStr',
		type : 'string'
	}, {
		name :'jsp_name',
		type : 'string'
	}, {
		name :'is_enabled',
		type : 'int'
	}, {
		name : 'ui',
		type : 'pb.model.common.ModuleStatusUI'
	} ],
	hasMany : [ {
		model : 'pb.model.common.Condition',
		name : 'conditions'
	} ]
});
