/***
 * 银行业务类型数据集
 */
Ext.define('pb.store.common.AgentAccountTypes', {
	extend : 'Ext.data.Store',
	fields : [ 'account_type_code', 'accont_type_name'],
	data : [  {
		"account_type_code" : "31",
		"accont_type_name" : "直接支付划款户"
	}, {
		"account_type_code" : "32",
		"accont_type_name" : "授权支付划款户"
	}, {
		"account_type_code" : "310",
		"accont_type_name" : "直接支付退款划款户"
	}, {
		"account_type_code" : "320",
		"accont_type_name" : "授权支付退款划款户"
	} ]
});