/***
 * 过滤条件模型
 */
Ext.define('pb.model.common.Condition', {
	extend : 'Ext.data.Model',
	fields : [ {
		name : 'status_cid',
		type : 'string'
	}, {
		name : 'status_id',
		type : 'string'
	}, {
		name : 'operation',
		type : 'string'
	}, {
		name : 'attr_code',
		type : 'string'
	}, {
		name : 'relation',
		type : 'string'
	}, {
		name : 'value',
		type : 'string'
	}, {
		name : 'alial',
		type : 'string'
	}, {
		name : 'datatype',
		type : 'int'
	}, {
		name : 'type',
		type : 'int'
	} ],
	belongsTo : "pb.model.common.Status"
});
