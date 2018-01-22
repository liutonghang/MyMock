/***
 * 批量业务凭证明细数据集合
 */
Ext.define('pb.store.pay.BatchPayVoucherRequestsForSRCB', {
	extend : 'Ext.data.Store',
	model : 'pb.model.pay.PayRequest',
	storeId : 's_payVoucherForSRCB',
	proxy : {
		type : 'ajax',
		actionMethods : {
			read : 'POST' //指定检索数据的提交方式
		},
		url : '/realware/loadBatchPayVoucherRequestForSRCB.do',
		reader : {
			type : 'json',
			root : 'root',
			totalProperty: 'pageCount'
		}
	},
	autoLoad : false
});