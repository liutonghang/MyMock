/***
 * 菜单树数据集合
 */
Ext.define('pb.store.common.MenuTree', {
	extend : 'Ext.data.TreeStore',
	proxy : {
		type : 'ajax',
		url : '/realware/loadMenuTree.do'
	},
	fields : [ 'id', 'code', 'name', 'parent_id','codename','module_id','parameter','start_date','end_date','initialload'],
	autoLoad : false
});
