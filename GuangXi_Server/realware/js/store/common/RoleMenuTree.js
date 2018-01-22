/***
 * 角色数据集合
 */
Ext.define('pb.store.common.RoleMenuTree', {
	extend : 'Ext.data.TreeStore',
	proxy : {
		type : 'ajax',
		url : '/realware/loadMenuRoleTree.do'
	},
	fields : [ 'id', 'code', 'name', 'checked', 'parent_id' ],
	root : {
		expanded : false
	},
	autoLoad : false
});