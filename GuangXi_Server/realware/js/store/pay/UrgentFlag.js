/***
 * 加急标志数据集
 */
Ext.define('pb.store.pay.UrgentFlag', {
	extend : 'Ext.data.Store',
	fields : [ 'name', 'value' ],
	data : [ {
		"name" : "",
		"value" : 0
	},{
		"name" : "加急",
		"value" : 1
	},{
		"name" : "普通",
		"value" : 3
	} ]
});