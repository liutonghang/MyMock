/***
 * 菜单树数据集合
 */
Ext.define('pb.store.common.UserMenuTree', {
	extend : 'Ext.data.TreeStore',
	root : {
		id : '0',
		nodeType : 'async'
	},
	proxy : {
		type : 'ajax',
		url : '/realware/initmenu.do'
	},
	autoLoad : true
});