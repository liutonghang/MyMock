/***
 * 视图模型明细（功能维护界面应用）
 */
Ext.define('pb.model.common.UITemplateDetail', {
	extend : 'Ext.data.Model',
	fields : [ {
		name : 'ui_id',
		type : 'string'
	}, {
		name : 'ui_name',
		type : 'string'
	}, {
		name : 'ui_xtype',
		type : 'int'
	}, {
		name : 'ui_width',
		type : 'int'
	}, {
		name : 'ui_order',
		type : 'int'
	}, {
		name : 'is_visble',
		type : 'int'
	}, {
		name : 'dataindex',
		type : 'string'
	}, {
		name : 'locked',
		type : 'int'
	}, {
		name : 'format',
		type : 'string'
	}, {
		name : 'align',
		type : 'string'
	}, {
		name : 'is_null',
		type : 'int'
	}, {
		name : 'store_name',
		type : 'string'
	}, {
		name : 'action_name',
		type : 'string'
	}, {
		name : 'template_id',
		type : 'string'
	}, {
		name : 'regex',
		type : 'string'
	}, {
		name : 'regextext',
		type : 'string'
	} ],
	belongsTo : "pb.model.common.UITemplate"
});
