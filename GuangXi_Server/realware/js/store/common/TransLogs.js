/***
 * 转账日志
 */
Ext.define('pb.store.common.TransLogs', {
	extend : 'Ext.data.Store',
	model : 'pb.model.common.TransLog',
	proxy : {
		type : 'ajax',
		url : '/realware/loadTransLog.do',
		reader : {
			type : 'json',
			root : 'root',
			totalProperty: 'pageCount'
		}
	},
	autoLoad : false
});