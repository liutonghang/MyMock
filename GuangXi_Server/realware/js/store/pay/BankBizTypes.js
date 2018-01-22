/***
 * 银行业务类型数据集

 */
Ext.define('pb.store.pay.BankBizTypes', {
	extend : 'Ext.data.Store',
	fields : [ 'name', 'value' ],
	data : [ {
		"name" : "对公",
		"value" : "0"
	},{
		"name" : "对私",
		"value" : "1"
	}]
});