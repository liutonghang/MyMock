/***
 * 角色数据集合
 */
Ext.define('pb.store.common.RoleTree', {
	extend : 'Ext.data.TreeStore',
	root : {
		id : '0',
		nodeType : 'async'
	},
	proxy : {
		type : 'ajax',
		url : '/realware/loadRoleTree.do'
	},
	autoLoad : true
});