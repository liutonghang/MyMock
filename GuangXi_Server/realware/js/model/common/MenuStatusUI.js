/***
 * 菜单对视图模型
 */
Ext.define('pb.model.common.MenuStatusUI', {
	extend : 'Ext.data.Model',
	fields : [ {
		name : 'view_id',
		type : 'string'
	}, {
		name : 'view_name',
		type : 'string'
	}, {
		name : 'control_name',
		type : 'string'
	}, {
		name : 'pagesize',
		type : 'int'
	},{
		name : 'view_alias',
		type : 'string'
	}, {
		name : 'menu_status_id',
		type : 'string'
	}, {
		name : 'is_subtotal',
		type : 'int'
	} ],
	hasMany : [ {
		model : 'pb.model.common.UIDetail',
		name : 'details'
	} ]
});
