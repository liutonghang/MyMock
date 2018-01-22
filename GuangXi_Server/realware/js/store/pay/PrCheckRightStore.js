/***
 * 工资登记信息右侧数据
 */
Ext.define('pb.store.pay.PrCheckRightStore', {
	extend : 'Ext.data.Store',
	model : 'pb.model.pay.PrCheckRightModel',
	proxy : {
		type : 'ajax',
		actionMethods : {
			read : 'POST' //指定检索数据的提交方式
		},
		url : '/realware/loadPrCheckRightInfo.do',
		reader : {
			type : 'json',
			root : 'root',
			totalProperty: 'pageCount'
		}
	},
	autoLoad : false
});