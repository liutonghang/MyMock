/***
 * 操作日志
 * @type 
 */

var logPanel = null;

var logFileds = ["node_name","user_code", "taskUserName", "taskOpinion", "taskRemark",
		"start_date", "end_date", "taskId"]; // 数据项

function taskLog(records,idName) {
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请选中一条凭证信息！");
		return;
	}
	if (records.length > 1) {
		Ext.Msg.alert("系统提示", "每次只能查看一条凭证的操作日志信息！");
		return;
	}
	// 列表
	var gridStore = Ext.create('Ext.data.Store', {
				fields : [{
							name : 'node_name'
						}, {
							name : 'user_code'
						},{
							name : 'taskUserName'
						}, {
							name : 'taskOpinion'
						}, {
							name : 'taskRemark'
						}, {
							name : 'end_date'
						}, {
							name : 'taskId'
						}],
				proxy : {
					extraParams : {
						rowid : records[0].get(idName),
						task_id : records[0].get("task_id"),
						filedNames : Ext.encode(logFileds)
					},
					actionMethods : {
						read : 'POST' //指定检索数据的提交方式
					},
					type : 'ajax',
					url : '/realware/loadTaskLog.do',
					reader : {
						type : 'json'
					}
				},
				autoLoad : true
			});
	parent.Ext.create('Ext.Window', {
				title : '任务日志跟踪窗口',
				plain : true,
				closable : true,
				resizable : true,
				layout : 'fit',
				frame : true,
				modal : true,
				width : 680,
				height : 500,
				items : [{
							xtype : 'gridpanel',
							columns : [{
										text : '菜单名称',
										dataIndex : 'node_name',
										width : 150
									}, {
										text : '操作类型',
										dataIndex : 'taskOpinion',
										width : 150
									}, {
										text : '操作用户代码',
										dataIndex : 'user_code',
										width : 150
									},{
										text : '操作用户',
										dataIndex : 'taskUserName',
										width : 150
									}, {
										text : '审核日期',
										dataIndex : 'end_date',
										width : 150
									}, {
										text : '意见',
										dataIndex : 'taskRemark',
										width : 150

									}],
							store : gridStore
						}]
			}).show();
}