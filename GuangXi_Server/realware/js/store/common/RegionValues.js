/***
 * 资金性质数据集合
 */
Ext.define('pb.store.common.RegionValues', {
	extend : 'Ext.data.Store',
	fields : [ 'id','code','name'],
	proxy : {
		type : 'ajax',
		url : '/realware/loadRegionValue.do',
		reader : {
			type : 'json'
		}
	},
	autoLoad : false
});