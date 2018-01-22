/***
 * 凭证状态数据集合
 */
Ext.define('pb.store.pay.GYPayVoucherStatus', {
	extend : 'Ext.data.Store',
	fields : [ 'name', 'value' ],
	data : [ {
		'name' : '未支付',
		'value' : '0'
	}, {
		'name' : '已支付',
		'value' : '1'
	}, {
		'name' : '已退回',
		'value' : '2'
	}, {
		'name' : '支付失败',
		'value' : '-1'
	} ]

});