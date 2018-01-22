/***
 * 支付凭证数据集合 2015-2-5 15:02:51
 */
Ext.define('pb.store.pay.BPayVouchersHunanBOC', {
	extend : 'Ext.data.Store',
	model : 'pb.model.pay.APayVoucher',
	storeId : 's_payVoucher',
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