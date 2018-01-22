/***
 * 批量直接支付业务凭证明细数据集合
 */
Ext.define('pb.store.pay.PLBatchPayVoucherRequests', {
	extend : 'Ext.data.Store',
	model : 'pb.model.pay.BatchPayRequest',
	storeId : 's_payVoucher',
	proxy : {
		type : 'ajax',
		actionMethods : {
			read : 'POST' //指定检索数据的提交方式
		},
		url : '/realware/loadPLBatchPayVoucherRequest.do',
		reader : {
			type : 'json',
			root : 'root',
			totalProperty: 'pageCount'
		}
	},
	autoLoad : false
});