/***
 * 功能按钮数据集合
 */
Ext.define('pb.store.common.TaskLog', {
	extend : 'Ext.data.Store',
	fields : [ {
		name : 'node_name'
	}, {
		name : 'user_code'
	}, {
		name : 'taskUserName'
	}, {
		name : 'taskOpinion'
	}, {
		name : 'taskRemark'
	}, {
		name : 'end_date'
	}, {
		name : 'taskId'
	} ],
	proxy : {
		type : 'ajax',
		timeout : 180000,
		actionMethods : {
			read : 'POST' //指定检索数据的提交方式
		},
		url : '/realware/loadTaskLog.do',
		reader : {
			type : 'json'
		}
	},
	autoLoad : false
});