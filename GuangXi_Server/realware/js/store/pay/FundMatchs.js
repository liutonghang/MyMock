/***
 * 银行类型数据集
 */
Ext.define('pb.store.pay.FundMatchs', {
	extend : 'Ext.data.Store',
	fields : [ 'name', 'value' ],
	data : [ {
		"name" : "未匹配",
		"value" : 0
	}, {
		"name" : "匹配失败",
		"value" : -1
	}, {
		"name" : "匹配成功",
		"value" : 1
	} ]
});