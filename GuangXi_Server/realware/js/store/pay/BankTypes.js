/***
 * 银行类型数据集
 */
Ext.define('pb.store.pay.BankTypes', {
	extend : 'Ext.data.Store',
	fields : [ 'name', 'value' ],
	data : [ {
		"name" : "同行",
		"value" : "1"
	}, {
		"name" : "跨行",
		"value" : "2"
	} ]
});