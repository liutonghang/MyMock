/***
 * 页面状态的数据集合
 */
Ext.define('pb.store.common.PageStatus', {
	extend : 'Ext.data.Store',
	model : 'pb.model.common.Menu',
	storeId : 's_pageStatus',
	proxy : {
		type : 'ajax',
		url : '/realware/loadPageStatus.do',
		reader : {
			type : 'json'
		}
	},
	autoLoad : false
});