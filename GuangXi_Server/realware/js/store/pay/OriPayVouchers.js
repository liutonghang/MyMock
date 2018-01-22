/***
 * 原支付凭证数据集合
 */
Ext.define('pb.store.pay.OriPayVouchers', {
	extend : 'Ext.data.Store',
	model : 'pb.model.pay.PayVoucher',
	storeId : 's_oripayVoucher',
	proxy : {
		type : 'ajax',
		timeout : 180000,
		actionMethods : {
			read : 'POST' //指定检索数据的提交方式
		},
		url : '/realware/loadOriPay.do',
		reader : {
			type : 'json',
			root : 'root',
			totalProperty: 'pageCount'
		}
	},
	autoLoad : false
});