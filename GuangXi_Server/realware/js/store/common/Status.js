/***
 * 状态数据集合
 */
Ext.define('pb.store.common.Status', {
	extend : 'Ext.data.Store',
	model : 'pb.model.common.Status',
	storeId : 's_status',
	proxy : {
		type : 'ajax',
		url : '/realware/loadStatus.do',
		reader : {
			type : 'json'
		}
	},
	autoLoad : false
});