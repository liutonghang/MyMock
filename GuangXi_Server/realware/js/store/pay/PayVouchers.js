/***
 * 支付凭证数据集合
 */
Ext.define('pb.store.pay.PayVouchers', {
	extend : 'Ext.data.Store',
	model : 'pb.model.pay.PayVoucher',
	storeId : 's_payVoucher',
	proxy : {
		type : 'ajax',
		timeout : 180000,
		actionMethods : {
			read : 'POST' //指定检索数据的提交方式
		},
		url : '/realware/loadPay.do',
		reader : {
			type : 'json',
			root : 'root',
			idProperty: 'key',
			totalProperty: 'pageCount'
		},
		listeners : {
			exception : function(reader, response, error, eOpts) {
				storeExceptionHandler(reader, response, error, eOpts);
			}
		}
	},
	autoLoad : false
});