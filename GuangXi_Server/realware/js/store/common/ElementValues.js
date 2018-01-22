/***
 * 资金性质数据集合
 */
Ext.define('pb.store.common.ElementValues', {
	extend : 'Ext.data.Store',
	fields : [ 'id', 'code', 'name' ],
	proxy : {
		type : 'ajax',
		url : '/realware/loadElementValue.do',
		reader : {
			type : 'json'
		}
	},
	autoLoad : false
});