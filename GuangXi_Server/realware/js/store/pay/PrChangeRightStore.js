/***
 * 工资变更明细数据
 */
Ext.define('pb.store.pay.PrChangeRightStore', {
	extend : 'Ext.data.Store',
	model : 'pb.model.pay.PrChangeRightModel',
	proxy : {
		type : 'ajax',
		actionMethods : {
			read : 'POST' //指定检索数据的提交方式
		},
		url : '/realware/loadRealInfo.do',
		reader : {
			type : 'json',
			root : 'root',
			idProperty: 'key',
			totalProperty: 'pageCount'
		}
	},
	autoLoad : false
});