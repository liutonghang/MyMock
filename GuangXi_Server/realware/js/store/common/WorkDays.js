/***
 * 
 */
Ext.define('pb.store.common.WorkDays', {
	extend : 'Ext.data.Store',
	model : 'pb.model.common.WorkDay',
	proxy : {
		type : 'ajax',
		timeout : 180000,
		actionMethods : {
			read : 'POST' //指定检索数据的提交方式
		},
		url : '/realware/loadWorkDays.do',
		reader : {
			type : 'json'
		}
	},
	autoLoad : false
});