/***
 * 批量业务凭证主单数据集合（上海）
 */
Ext.define('pb.store.pay.BatchPayVouchersForSRCB', {
	extend : 'Ext.data.Store',
	model : 'pb.model.pay.PayVoucher',
	storeId : 'ss_payVoucherForSRCB',
	proxy : {
		type : 'ajax',
		actionMethods : {
			read : 'POST' //指定检索数据的提交方式
		},
		url : '/realware/loadBatchPayVoucherForSRCB.do',
		reader : {
			type : 'json',
			root : 'root',
			totalProperty: 'pageCount'
		}
	},
	autoLoad : false
});