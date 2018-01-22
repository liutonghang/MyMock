/***
 * 功能数据集合
 */
Ext.define('pb.store.common.Modules', {
	extend : 'Ext.data.Store',
	model:'pb.model.common.Module',
	storeId : 'm_module',
	proxy : {
		type : 'ajax',
		url : '/realware/loadModule.do',
		reader : {
			type : 'json'
		}
	},
	autoLoad : false
});