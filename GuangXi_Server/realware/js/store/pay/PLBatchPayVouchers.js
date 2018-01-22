/***
 * 批量直接支付业务凭证主单数据集合
 */
Ext.define('pb.store.pay.PLBatchPayVouchers', {
	extend : 'Ext.data.Store',
	model : 'pb.model.pay.BatchPayVoucher',
	storeId : 'ss_payVoucher',
	proxy : {
		type : 'ajax',
		actionMethods : {
			read : 'POST' //指定检索数据的提交方式
		},
		url : '/realware/loadPLBatchPayVoucher.do',
		reader : {
			type : 'json',
			root : 'root',
			totalProperty: 'pageCount'
		}
	},
	autoLoad : false
});