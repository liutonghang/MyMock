/***
 * 支付凭证数据集合 2015-2-5 15:02:51
 */
Ext.define('pb.store.pay.PayVouchersHunanBOCTransfer', {
	extend : 'Ext.data.Store',
	model : 'pb.model.pay.PayVoucher',
	storeId : 's_payVoucherHunanBOCTransfer',
	proxy : {
		type : 'ajax',
		timeout : 180000,
		actionMethods : {
			read : 'POST' //指定检索数据的提交方式
		},
		url : '/realware/loadPay.do',//这里有改
		reader : {
			type : 'json',
			root : 'root',
			totalProperty: 'pageCount'
		}
	},
	autoLoad : false
});