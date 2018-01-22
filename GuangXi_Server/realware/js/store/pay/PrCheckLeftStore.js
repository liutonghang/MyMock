/***
 * 卡信息发送主单数据集合
 */
Ext.define('pb.store.pay.PrCheckLeftStore', {
	extend : 'Ext.data.Store',
	model : 'pb.model.pay.PrCheckLeftModel',
	proxy : {
		type : 'ajax',
		actionMethods : {
			read : 'POST' //指定检索数据的提交方式
		},
		url : '/realware/loadPrCheckLeftInfo.do',
		reader : {
			type : 'json',
			root : 'root',
			totalProperty: 'pageCount'
		}
	},
	autoLoad : false
});