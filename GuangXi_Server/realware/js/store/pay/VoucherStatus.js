/***
 * 银行业务类型数据集
 */
Ext.define('pb.store.pay.VoucherStatus', {
	extend : 'Ext.data.Store',
	fields : [ 'name', 'value' ],
	data : [{
		"name" : "全部",
		"value" : ''
	},{
		"name" : "财政未接收",
		"value" : 0
	}, {
		"name" : "财政接收成功",
		"value" : 1
	}, {
		"name" : "财政接收失败",
		"value" : 2
	}, {
		"name" : "财政签收成功",
		"value" : 3
	}, {
		"name" : "财政签收失败",
		"value" : 4
	},{
		"name" : "财政已退回",
		"value" : 5
	}]
});