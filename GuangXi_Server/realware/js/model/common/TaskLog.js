/***
 * 查看操作日志模型
 */
Ext.define('pb.model.common.TaskLog', {
	extend : 'Ext.data.Model',
	fields : [ {
		name : 'node_name',
		type : 'string'
	}, {
		name : 'user_code',
		type : 'string'
	}, {
		name : 'taskUserName',
		type : 'string'
	}, {
		name : 'taskOpinion',
		type : 'string'
	}, {
		name : 'taskRemark',
		type : 'string'
	}, {
		name : 'end_date',
		type : 'string'
	}, {
		name : 'taskId',
		type : 'int'
	} ]
});
