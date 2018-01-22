/***
 * 功能数据集合
 */
Ext.define('pb.store.common.Module', {
	extend : 'Ext.data.Store',
	model:'pb.model.common.Module',
	storeId : 'm_module',
	proxy : {
		type : 'ajax',
		url : '/realware/getModulebyId.do',
		reader : {
			type : 'json'
		}
	},
	autoLoad : false
});