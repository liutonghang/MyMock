/***
 * 菜单对按钮、列表模型
 */
Ext.define('pb.model.common.MenuStatus', {
	extend : 'Ext.data.Model',
	fields : [ {
		name : 'status_id',
		type : 'string'
	},{
		name : 'status_code',
		type : 'string'
	},{
		name : 'status_name',
		type : 'string'
	},{
		name : 'status_order',
		type : 'string'
	},{
		name : 'menu_id',
		type : 'string'
	},{
		name : 'remark',
		type : 'string'
	},{
		name : 'conditionStr',
		type : 'string'
	},{
		name : 'admdiv_code',
		type : 'string'
	},{
		name : 'menu_status_id',
		type : 'string'
	},{
		name : 'ui',
		type : 'pb.model.common.MenuStatusUI'
	} ],
	hasMany : [ {
//		model : 'pb.model.common.MenuStatusButton',
//		name : 'buttonList'
//	}, {
		model : 'pb.model.common.Condition',
		name : 'conditions'
	} ]
});
