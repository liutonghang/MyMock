/***
 * 银行类型数据集
 */
Ext.define('pb.store.pay.UserType', {
	extend : 'Ext.data.Store',
	fields : [ 'name', 'value' ],
	data : [ {
		"name" : "业务人员",
		"value" : 2
	}, {
		"name" : "主管",
		"value" : 1
	}, {
		"name" : "行长",
		"value" : 3
	} ]
});