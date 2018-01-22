/***
 * 资金性质数据集合
 */
Ext.define('pb.store.common.ElementTreeValues', {
	extend : 'Ext.data.TreeStore',
	fields : [ 'id', 'code', 'name' ],
	proxy : {
		type : 'ajax',
		url : '/realware/loadEleValue.do',
		reader : {
			type : 'json'
		}
	},
	autoLoad : false
});