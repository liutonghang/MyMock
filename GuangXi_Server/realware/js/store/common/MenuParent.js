/***
 * 菜单组数据集合
 */
Ext.define('pb.store.common.MenuParent', {
	extend : 'Ext.data.Store',
	fields : [ {
		name : 'id'
	}, {
		name : 'name'
	} ],
	proxy : {
		type : 'ajax',
		url : '/realware/menuParent.do',
		reader : {
			type : 'json'
		}
	},
	autoLoad : true
});