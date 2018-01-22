/***
 * 视图模型数据集合（功能维护界面应用）
 */
Ext.define('pb.store.common.UITemplates', {
	extend : 'Ext.data.Store',
	model : 'pb.model.common.UITemplate',
	storeId : 't_ui',
	proxy : {
		type : 'ajax',
		url : '/realware/loadUIs.do',
		reader : {
			type : 'json'
		}
	},
	autoLoad : true
});