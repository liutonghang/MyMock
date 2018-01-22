/***
 * 原支付凭证数据集合
 */
Ext.define('pb.store.pay.RefundOriVouchers', {
	extend : 'Ext.data.Store',
	model : 'pb.model.pay.PayVoucher',
	storeId : 's_refundpayVoucher',
	proxy : {
		type : 'ajax',
		timeout : 180000,
		actionMethods : {
			read : 'POST' //指定检索数据的提交方式
		},
		url : '/realware/loadRefundOriPay.do',
		reader : {
			type : 'json',
			root : 'root',
			totalProperty: 'pageCount'
		}
	},
	autoLoad : false
});