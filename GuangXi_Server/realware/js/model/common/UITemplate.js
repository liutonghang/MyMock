/***
 * 视图模型（功能维护界面应用）
 */
Ext.define('pb.model.common.UITemplate', {
	extend : 'Ext.data.Model',
	fields : [ {
		name : 'template_id',
		type : 'string'
	}, {
		name : 'template_name',
		type : 'string'
	}, {
		name : 'control_name',
		type : 'string'
	}, {
		name : 'is_subtotal',
		type : 'int'
	} ],
	hasMany : [ {
		model : 'pb.model.common.UITemplateDetail',
		name : 'details'
	} ]
});
