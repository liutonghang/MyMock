/***
 * 卡信息回复明细数据集合
 */
Ext.define('pb.store.pay.PrSendRightStore', {
	extend : 'Ext.data.Store',
	model : 'pb.model.pay.PrSendRightModel',
	proxy : {
		type : 'ajax',
		actionMethods : {
			read : 'POST' //指定检索数据的提交方式
		},
		url : '/realware/loadPrSendRightInfo.do',
		reader : {
			type : 'json',
			root : 'root',
			totalProperty: 'pageCount'
		}
	},
	autoLoad : false
});