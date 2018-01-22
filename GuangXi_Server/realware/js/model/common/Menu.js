/***
 * 菜单对按钮、列表模型
 */
Ext.define('pb.model.common.Menu', {
	extend : 'Ext.data.Model',
	fields : [ {
		name : 'module_id',
		type : 'int'
	},{
		name : 'id',
		type : 'int'
	},{
		name : 'code',
		type : 'string'
	},{
		name : 'name',
		type : 'string'
	},{
		name : 'codename',
		type : 'string'
	} ],
	hasMany : [ {
		model : 'pb.model.common.MenuStatus',
		name : 'statusList'
	}, {
		model : 'pb.model.common.MenuButton',
		name : 'buttonList'
	} ]
});
