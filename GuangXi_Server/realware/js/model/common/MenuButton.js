/***
 * 菜单对按钮、列表模型
 */
Ext.define('pb.model.common.MenuButton', {
	extend : 'Ext.data.Model',
	fields : [ {
		name : 'button_id',
		type : 'string'
	},{
		name : 'button_name',
		type : 'string'
	},{
		name : 'admdiv_code',
		type : 'string'
	},{
		name : 'visible',
		type : 'int'
	},{
		name : 'remark',
		type : 'string'
	},{
		name : 'menu_id',
		type : 'int'
	}, {
		name : 'custom',
		type : 'int'
	}, {
		name : 'icon',
		type : 'string'
	}, {
		name : 'status_codes',
		type : 'string'
	}, {
		name : 'enable_admdivs',
		type : 'string'
	}, {
		name : 'disable_admdivs',
		type : 'string'
	} ]
});
