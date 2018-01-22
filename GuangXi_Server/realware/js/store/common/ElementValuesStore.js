/***
 * 资金性质数据集合
 */
Ext.define('pb.store.common.ElementValuesStore', {
	extend : 'Ext.data.Store',
	model : 'pb.model.common.ElementValue',
	proxy : {
		type : 'ajax',
		url : '/realware/loadElementValue.do',
		reader : {
			type : 'json'
		}
	},
	autoLoad : false
});