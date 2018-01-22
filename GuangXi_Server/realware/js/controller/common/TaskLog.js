/***
 * 查看操作日志控制器
 * @memberOf {TypeName} 
 */
Ext.define('pb.controller.common.TaskLog', {
	extend : 'Ext.app.Controller',
	stores : [ 'common.TaskLog'],
	models : [ 'common.TaskLog'],
	init : function() {
		this.control( {
			'button[id=log]':{
				/***
				 * 查看操作日志
				 * @memberOf {TypeName} 
				 */
				click : function() {
					var records = Ext.PageUtil.validSelect(Ext.getCmp(Ext.PageUtil.prefix + Ext.getCmp('taskState').getValue()),1);
					// 数据项
					var logFileds = [ "node_name", "user_code","taskUserName","taskOpinion","taskRemark", "start_date","end_date", "taskId" ]; 
					//数据集
					var logstore = this.getStore('common.TaskLog');
					if(records !=null){
							logstore.load( {
								params : {
									rowid : records[0].get("pay_voucher_code"),
									task_id : records[0].get("task_id"),
									filedNames : Ext.encode(logFileds)
								}
							});
							//显示列
							var maps = Ext.create('Ext.util.HashMap');
							maps.add('node_name', '菜单名称');
							maps.add('taskOpinion', '操作类型');
							maps.add('user_code', '操作用户代码');
							maps.add('taskUserName', '操作用户');
							maps.add('end_date', '审核日期');
							maps.add('taskRemark', '意见');
							//此处调用的是一个公用的selectWindow这个方法 saveHidden:true,closeHidden:true设置确定、取消按钮不显示
							Ext.create('pb.view.common.SelectWindow',{
									saveHidden : true,
									closeHidden : true,
									title : '操作日志列表信息',
									listStore : logstore,
									colMaps : maps,
									width : 600
							}).show();
					}
				}
			}
		})
	},
	onLaunch: function() {
		
	}
});
