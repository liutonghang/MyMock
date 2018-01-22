/***
 * 卡信息回复主单数据集合
 */
Ext.define('pb.store.pay.PrSendLeftStore', {
	extend : 'Ext.data.Store',
	model : 'pb.model.pay.PrSendLeftModel',
	proxy : {
		type : 'ajax',
		actionMethods : {
			read : 'POST' //指定检索数据的提交方式
		},
		url : '/realware/loadPrSendLeftInfo.do',
		reader : {
			type : 'json',
			root : 'root',
			totalProperty: 'pageCount'
		}
	},
	autoLoad : false
});