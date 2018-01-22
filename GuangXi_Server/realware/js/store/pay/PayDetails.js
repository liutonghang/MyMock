/***
 * 支付明细数据集合
 */
Ext.define('pb.store.pay.PayDetails', {
	extend : 'Ext.data.Store',
	model : 'pb.model.pay.PayRequest',
	proxy : {
		type : 'ajax',
		url : '/realware/loadPayRequestByVoucher.do',
		reader : {
			type : 'json',
			root : 'root',
			totalProperty: 'pageCount'
		}
	},
	autoLoad : false
});