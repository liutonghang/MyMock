/***
 * 要素值模型
 */
Ext.define('pb.model.common.ElementValue', {
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
		name : 'parent_id',
		type : 'int'
	}, {
		name : 'admdiv_code',
		type : 'string'
	} ]
});
