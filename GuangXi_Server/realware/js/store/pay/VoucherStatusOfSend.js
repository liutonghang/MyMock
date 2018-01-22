/***
 * 发送凭证状态数据集合
 */
Ext.define('pb.store.pay.VoucherStatusOfSend', {
	extend : 'Ext.data.Store',
	fields : [ 'name', 'value' ],
	data : [ {
				"name" : "全部",
				"value" : ""
			},{
				"name" : "银行未发送",
				"value" : "13"
			},{
				"name" : "对方未接收",
				"value" : "0"
			}, {
				"name" : "对方接收成功",
				"value" : "1"
			}, {
				"name" : "对方接收失败",
				"value" : "2"
			}, {
				"name" : "对方签收成功",
				"value" : "3"
			}, {
				"name" : "对方签收失败",
				"value" : "4"
			}, {
				"name" : "对方已退回",
				"value" : "5"
			},{
				"name" : "已收到对方回单",
				"value" : "12"
			} ]

});

