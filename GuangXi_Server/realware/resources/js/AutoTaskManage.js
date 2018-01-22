/*******************************************************************************
 * 退款清算挂账
 */
 //数据项
var fields = ["job_id","remark","job_enable", "job_time", "job_interval", "last_op_date","max_exe_time"];


var header = "任务名称|remark|320,启用状态|job_enable|100,触发时间[格式:秒分时日月周年]|job_time|200,间隔时间(毫秒)|job_interval|100," +
		"最近执行时间|last_op_date|150,最大超时时间(分钟)|max_exe_time|150";

/*******************************************************************************
 * 初始化
 */
Ext.onReady(function() {
	//初始化Ext.QuickTips，启用悬浮提示
	Ext.QuickTips.init();
	store = getStore("autoTask/loadTask.do", fields);
	//加载挂账信息
	column = getColModel(header, fields);
	var pagetool = getPageToolbar(store);
	
	store.on('beforeload', function(thiz, options,e) {
		var panel = Ext.ComponentQuery.query("panel[title='查询区']")[0];
		beforeload(panel, options, Ext.encode(fields));
		options.params.menu_id = Ext.PageUtil.getMenuId(); 
	});
	
	
	var buttonItems = [{
						id : 'editTask',
						handler : function() {
							editTask();
						}
					},{
						id : 'startNow',
						handler : function() {
							startNow();
						}
					},{
						id : 'stopNow',
						handler : function() {
							stopNow();
						}
					},{
						id : 'refresh',
						handler : function() {
							refreshData();
						}
					},
					//导出日志文件
					{
						id : 'exportLogFile',
						handler : function() {
							exportLogFile();
						}
					},
					//行号导入
					{
						id:'import',
						handler:function(){
						var me = this;
						//这里是把该功能定义了一个控件调用的时候直接创建控件调用init方法show就完成了控件的显示
						var importwindow = Ext.create('pb.view.common.ImportFileWindow');
						importwindow.init("/realware/sysBankNo.do",me);
						importwindow.show();
					}	
					}];
	var queryItems = [{
						id : 'queryPanel',
						title : '查询区',
						frame : false,
						defaults : {
							padding : '0 3 0 3'
						},
						layout : {
							type : 'table',
							columns : 5
						},
						bodyPadding : 5,
						items : [{
									id : 'taskState',
									fieldLabel : '任务状态',
									xtype : 'combo',
									displayField : 'status_name',
									dataIndex : 'task_status',
									emptyText : '请选择',
									valueField : 'status_code',
									labelWidth : 80,
									editable : false,
									listeners : {
										'change' : selectState
									}
								}],
						flex : 2
					}, {
						id : 'autoTaskQuery',
						xtype : 'gridpanel',
						height : document.documentElement.scrollHeight - 90,
						frame : false,
						multiSelect : true,
						ignoreAddLockedColumn : true,
						frameHeader : false,
						viewConfig : {
							shrinkWrap : 0,
							hasLoadingHeight : Ext.isIE
						},
						lockedViewConfig : {
							frame : false,
							shrinkWrap : 0,
							hasLoadingHeight : Ext.isIE
						},
						title : '任务列表',
						selType : 'checkboxmodel',
						selModel : {
							mode : 'multi',
							checkOnly : true
						},
						store : store,
						columns : column,
						loadMask : {
							msg : '数据加载中,请稍等...'
						},
						bbar : pagetool
					}];
	Ext.StatusUtil.createViewport(buttonItems, queryItems, function() {
		Ext.StatusUtil.initPage(Ext.getCmp("admdiv"), Ext.getCmp("taskState"));
		// 默认设置为全部
		Ext.getCmp('taskState').setValue("000");
	});
});

/*******************************************************************************
 * 获取数据
 * 
 * @return
 */
function _getRecords() {
	var records = Ext.ComponentQuery.query("gridpanel")[0].getSelectionModel().getSelection();
	return records;
}
/*******************************************************************************
 * 切换状态
 * 
 * @return
 */
function selectState(combo, newValue, oldValue, eOpts) {
	var grid = Ext.getCmp("autoTaskQuery");
	var pager = Ext.ComponentQuery.query("pagingtoolbar")[0];
	switch(newValue) {
	case "000" :
		Ext.StatusUtil.batchEnable("editTask,startNow,stopNow");
		// 重新绑定grid
		if(oldValue) {
			Ext.suspendLayouts();
			grid.setTitle("全部");
			grid.reconfigure(store, column);
			pager.bind(store);
			Ext.resumeLayouts(true);
		}
		break;
	case "001" :
	    Ext.StatusUtil.batchEnable("stopNow");
	    Ext.StatusUtil.batchDisable("startNow,editTask");
		Ext.suspendLayouts();
		grid.setTitle("未执行");
		Ext.resumeLayouts(true);
		break;
	case "002" :
		Ext.StatusUtil.batchEnable("startNow,editTask");
		Ext.StatusUtil.batchDisable("stopNow");
		Ext.suspendLayouts();
		grid.setTitle("正在执行");
		Ext.resumeLayouts(true);
		break;
	}
}
/*******************************************************************************
 * 修改
 */
function editTask(){
	var records = _getRecords();
	
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请选中一条任务信息！");
		return ;
	} 
	if (records.length >1) {
		Ext.Msg.alert("系统提示", "任务信息操作只支持单条操作！");
		return ;
	} 
	
	//处理   启用状态
	var job_enable;
	if (records[0].get("job_enable") == '已启用') {
		job_enable = true;
		Ext.Msg.alert("系统提示", "该任务正在执行中，不能进行修改，请先停用！");
		return;
	}else {
		job_enable = false;
	}
	if(!Ext.isEmpty(records)) {
		var taskInfoWindow = Ext.create('Ext.window.Window', {
					id:'editWindows',
					title : '修改任务',
					width : 450,
					height : 220,
					layout : 'fit',
					resizable : false,
					closeAction : 'destroy',
					modal : true,
					items : [
						Ext.create('Ext.form.Panel', {
					    bodyPadding: 5,
					    url: 'autoTask/editTask.do',
					    layout: 'anchor',
					    defaults: {
					        anchor: '100%'
					    },
					
					    defaultType: 'textfield',
					    items: [{
					    	xtype: 'hiddenfield',
					    	id:'job_id1',
					        name: 'job_id',
					        value : records[0].get("job_id")
					    }, {
							id : 'remark1',
							xtype : 'textfield',
							name : 'remark',
							fieldLabel : '任务名称',
							width : 300,
							value : records[0].get("remark")
						} ,{
							id : 'job_time1',
							xtype : 'textfield',
							name : 'job_time',
							beforeSubTpl:'[格式:秒分时日月周年,字符之间用空格隔开,年可省略]',
							fieldLabel : '触发时间',
							width : 400,
							value : records[0].get("job_time")
						} ,{
							id : 'job_interval1',
							xtype : 'textfield',
							name : 'job_interval',
							allowOnlyWhitespace : false,
							fieldLabel : '间隔时间(毫秒)',
							width : 300,
							value : records[0].get("job_interval")
						} ,{
							id : 'max_exe_time1',
							xtype : 'textfield',
							name : 'max_exe_time',
							fieldLabel : '最大超时时间(分钟)',
							width : 300,
							labelWidth : 110,
							value : records[0].get("max_exe_time")
						}],
					
					    buttons: [{
					        text: '确定',
					        formBind: true, 
					        disabled: true,
					        handler: function() {
					            var form = this.up('form').getForm();
					            
			            		form.submit({
										method : 'POST',
										timeout : 6000, // 设置为秒
										waitTitle : '提示',
										waitMsg : '正在修改任务，...',
										success : function(form, action) {
											succForm(form, action);
											Ext.getCmp("editWindows").close();
											refreshData();
										},
										failure : function(form, action) {
											failForm(form, action);
											refreshData();
										}
							});
											
					        }
					    },{
					        text: '取消',
					        handler: function() {
					           Ext.getCmp("editWindows").close();
					        }
					    }]
					})
					]
				});
	  taskInfoWindow.show();
	}
}

/*******************************************************************************
 * 刷新
 */
function refreshData() {
	Ext.ComponentQuery.query("gridpanel")[0].getStore().load();
}

/*******************************************************************************
 * 启动任务
 */
function startNow() {
	var records = _getRecords();
	
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请选中一条任务信息！");
		return ;
	} 
	if (records.length >1) {
		Ext.Msg.alert("系统提示", "任务信息操作只支持单条操作！");
		return ;
	} 
	if (records[0].get("job_enable") == '已启用') {
		Ext.Msg.alert("系统提示", "该任务正在执行中，不能进行启动，请先停用！");
		return;
	}
	if(!Ext.isEmpty(records)) {
		Ext.Ajax.request({
			url : 'autoTask/startNow.do',
			method : 'POST',
			params : {
				job_id : records[0].get("job_id")
			},
			success : function(response, options) {
				Ext.Msg.alert('正确提示', response.responseText);
			    refreshData();
			},
		    failure: function(response, options) {
	           Ext.Msg.alert('错误提示', response.responseText);
	           refreshData();
	        }
		});
	}
	
}

/*******************************************************************************
 * 停止任务
 */
function stopNow() {
	var records = _getRecords();
	
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请选中一条任务信息！");
		return ;
	} 
	if (records.length >1) {
		Ext.Msg.alert("系统提示", "任务信息操作只支持单条操作！");
		return ;
	} 
	if (records[0].get("job_enable") == '未启用') {
		Ext.Msg.alert("系统提示", "该任务未启用，不能进行停用操作！");
		return;
	}
	if(!Ext.isEmpty(records)) {
		Ext.Msg.show({
		     title:'确认',
		     msg: '确定要停用自动任务' 
		    	 + '[' + records[0].get("remark") + ']吗？',
		     buttons: Ext.Msg.OKCANCEL,
		     icon: Ext.Msg.QUESTION,
		     fn : function(buttonId, text) {
		    	 if(buttonId == 'ok') {
		    			Ext.Ajax.request({
		    				url : 'autoTask/stopNow.do',
		    				method : 'POST',
		    				params : {
		    					job_id : records[0].get("job_id")
		    				},
		    				success : function(response, options) {
		    					Ext.Msg.alert('正确提示', response.responseText);
		    				    refreshData();
		    				},
		    			    failure: function(response, options) {
		    		           Ext.Msg.alert('错误提示', response.responseText);
		    		           refreshData();
		    		        }
		    			});
		    	 }
		     }
		});
	
	}else {
		 Ext.Msg.alert('系统提示', '没有对应的任务需要停用！');
	 }
}	 

/*******************************************************************************
 * 导出日志
 */
function exportLogFile(){
	var exportLogWindow = Ext.create('Ext.window.Window', {
					id:'exportLogWindow',
					title : '请选择日志日期',
					width : 250,
					height : 100,
					layout : 'fit',
					resizable : false,
					modal : true,
					closeAction : 'destroy',
					model : true,
					items : [
						Ext.create('Ext.form.Panel', {
					    bodyPadding: 5,
					    layout: 'anchor',
					    defaults: {
					        anchor: '100%'
					    },
					    defaultType: 'textfield',
					    items: [{
					    	xtype: 'datefield',
					    	fieldLabel : '日志日期',
					    	labelWidth : 60,
							width : 160,
							anchor: '100%',
					    	id:'logdate',
					        name: 'logdate',
					        format : 'Y-m-d',
					        value: new Date(),
					        maxValue : new Date(),
					        allowBlank : false
					    }],
					    buttons : [{
								text : '确定',
								handler : function() {
										if(Ext.isEmpty(Ext.getCmp('logdate').getValue())){
											Ext.Msg.alert('系统提示','日志日期不能为空！');
											return;
										}
										Ext.Ajax.request({
											url : 'LogFileIsExists.do',
											method : 'POST',
											params : {
												logdate : Ext.util.Format.date(Ext.getCmp('logdate').getValue(), 'Y-m-d')
											},
											success : function(response, options) {
											    Ext.getCmp("exportLogWindow").close();
											    var fileName = response.responseText;
											    window.location.href = '/realware/exportLogFile.do?fileName='+ fileName;
											},
										    failure: function(response, options) {
									           Ext.Msg.alert('错误提示', response.responseText);
									    //       Ext.getCmp("exportLogWindow").close();
									        }
										});
		    	 					}
							},{
					       	   text: '取消',
					           handler: function() {
					           Ext.getCmp("exportLogWindow").close();
					        }
					    }]
					})
					]
				});
	  exportLogWindow.show();
}