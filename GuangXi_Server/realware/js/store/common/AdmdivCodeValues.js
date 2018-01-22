/***
 * 财政数据集合
 */
Ext.define('pb.store.common.AdmdivCodeValues', {
	extend : 'Ext.data.Store',
	fields : [ 'name', 'code' ],
	proxy : {
		type : 'ajax',
		url : '/realware/loadAdmdivCodeValue.do',
		reader : {
			type : 'json'
		}
	},
	autoLoad : false
});