/***
 * 支付明细数据集合
 */
Ext.define('pb.store.pay.PayRequests', {
	extend : 'Ext.data.Store',
	model : 'pb.model.pay.PayRequest',
	storeId : 's_payRequest',
	proxy : {
		type : 'ajax',
		url : '/realware/loadPayRequest.do',
		reader : {
			type : 'json',
			root : 'root',
			totalProperty: 'pageCount'
		}
	},
	autoLoad : false
});