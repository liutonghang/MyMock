/***
 * 日志查询数据集合
 */
Ext.define('pb.store.common.LogQuerys', {
	extend : 'Ext.data.Store',
	fields : [ {
		name : 'taskUserName'
	}, {
		name : 'node_name'
	}, {
		name : 'end_date'
	}, {
		name : 'ip'
	}, {
		name : 'taskOpinion'
	}, {
		name : 'user_code'
	}, {
		name : 'taskUserName'
	}, {
		name : 'voucher_no'
	}, {
		name : 'log_sort'
	} ],
	proxy : {
		type : 'ajax',
		timeout : 180000,
		actionMethods : {
			read : 'POST' //指定检索数据的提交方式
		},
		url : '/realware/loadLogs.do',
		reader : {
			type : 'json',
			root : 'pageData',
			idProperty: 'id',
			totalProperty: 'dataCount'
		}
	},
	autoLoad : false
});