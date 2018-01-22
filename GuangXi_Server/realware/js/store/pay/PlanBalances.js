/***
 * 计划额度
 */
Ext.define('pb.store.pay.PlanBalances', {
	extend : 'Ext.data.Store',
	model : 'pb.model.pay.PlanBalance',
	proxy : {
		type : 'ajax',
		url : '/realware/loadPlanBalance.do',
		actionMethods : {
			read : 'POST'
		},
		reader : {
			type : 'json',
			root : 'root',
			totalProperty: 'pageCount'
		}
	},
	autoLoad : false
});