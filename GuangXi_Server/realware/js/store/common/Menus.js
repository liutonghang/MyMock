/***
 * 菜单数据集合
 */
Ext.define('pb.store.common.Menus', {
	extend : 'Ext.data.Store',
	model : 'pb.model.common.Menu',
	storeId : 'm_menu',
	proxy : {
		type : 'ajax',
		url : '/realware/loadMenu.do',
		//改之前的url
		//url : '/realware/loadMenudeploying.do',
		reader : {
			type : 'json'
		}
	},
	autoLoad : false
});