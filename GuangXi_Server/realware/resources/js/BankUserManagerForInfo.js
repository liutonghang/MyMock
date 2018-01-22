/*******************************************************************************
 * 主要用于网点管理员维护用户
 * 
 * @type
 */
 
/***
 * 引入需要使用的js文件
 */
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/recommend.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/addUserOfBank.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/editUserOfBank.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/importFile.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/js/model/user/UserMigrateModel.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/js/store/pay/MigrateLog.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/js/store/pay/MigrateAllLog.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/js/view/common/MigrateLogWindow.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/js/view/common/MigrateAllLogWindow.js"></scr' + 'ipt>');

var userPanel = null;

/**
 * 数据项
 */

var fileds = ["user_code", "user_name", "bank_code", "bank_name",
		"telephone_number", "cellphone_number", "remark","user_id","user_type","identity_no","authorise","manager_type"];

/**
 * 列名
 */
var header = "身份证号|identity_no|150,工号|user_code|100,姓名|user_name|100,员工级别|user_type|80,可授权|authorise,管理员|manager_type,网点编码|bank_code|100,网点名称|bank_name|200,"
		+ "电话|telephone_number|120,手机|cellphone_number|120,备注|remark|180";

/*******************************************************************************
 * 状态
 */
var userTypeStore = Ext.create('Ext.data.Store', {
			fields : ['name', 'value'],
			data : [ {
						"name" : "业务人员",
						"value" : '2'
					}, {
						"name" : "主管",
						"value" : '1'
					}, {
						"name" : "行长",
						"value" : '3'
					} ]
		});



/*******************************************************************************
 * 界面加载
 */
Ext.onReady(function() {
	Ext.QuickTips.init();
	//Ext.syncRequire(['js.view.common.NetworkQuery']);
	if (userPanel == null) {
		userPanel = getGrid("/realware/loadUser.do", header, fileds, true, true);
		userPanel.setHeight(document.documentElement.scrollHeight - 80);	
		userPanel.getStore().on('beforeload', function(thiz, options) {
			var panel = Ext.ComponentQuery.query("panel[title='查询区']")[0];
			beforeload(panel, options, Ext.encode(fileds));
			options.params["mybank"] = true;
		});
	}
	
	/*
	 * 定义按钮英文名称
	 */
	var buttonItems = [{
		id : 'add',
		handler : function() {
			addUserDialog();
		}
	}, {
		id : 'edit',
		handler : function() {
			editUserDialog(userPanel);
		}
	}/*,{
		//注销
		id : 'cancel',
		handler : function() {
			cancelUserDialog();
		}
	}*/,{
		//删除
		id : 'delete',
		handler : function() {
			deleteUserDialog();
		}
	},{
		//设置管理员
		id : 'setadmin',
		handler : function() {
			setAdmin();
		}
	},{
		//导入
		id : 'input',
		handler : function() {
			importFile(importUserUrl);
		}
	},{
		//重置密码
		id : 'modifypwd',
		handler : function() {
			editUserPassword(userPanel);
		}
	},{
		id : 'migrateInUser',
		handler : function() {
			migrateInUser();
		}
	},{
		id : 'migrateOutUser',
		handler : function() {
			migrateOutUser(userPanel);
		}
	},{
		id : 'migrateLog',
		handler : function() {
			loadMigrateLog();
		}
	},{
		id : 'migrateRevUser',
		handler : function() {
			revMigrateLog();
		}
	},{
		//查询
		id : 'refresh',
		handler : function() {
			refreshData();			
		}
	}];
var queryItems = [{
					  title:"查询区",
                	  xtype : 'panel',
                	  layout : 'hbox',
                	  id:"queryuser",
                	  bodyPadding : 3,
                	  defaults : {
                			margins : '3 10 0 0'
                		},
                	  items : [{
									id : 'operatorCode',
									fieldLabel : '员工编号',
									xtype : 'textfield',
									dataIndex : 'user_code',
									labelWidth : 60
								}, {
									id : 'operatorName',
									fieldLabel : '员工名称',
									xtype : 'textfield',
									dataIndex : 'user_name',
									labelWidth : 60
								}]
	                  	}, userPanel];
	Ext.StatusUtil.createViewport(buttonItems, queryItems);
	refreshData();
});

/**
 * 切换状态
*/
function selectState() {
	var taskState = Ext.getCmp('taskState').getValue();
	if ("1" == taskState) {
		Ext.getCmp('edit').enable(false);
		Ext.getCmp('add').enable(false);
		Ext.getCmp('cancel').enable(false);
		Ext.getCmp('delete').enable(false);
		Ext.getCmp('refresh').enable(false);
		Ext.getCmp('modifypwd').enable(false);
	} else if ("0" == taskState) {
		Ext.getCmp('delete').enable(false);
		Ext.getCmp('refresh').enable(false);
		Ext.getCmp('edit').disable(false);
		Ext.getCmp('add').disable(false);
		Ext.getCmp('cancel').disable(false);
		Ext.getCmp('modifypwd').disable(false);
	} else {
		Ext.getCmp('edit').enable(false);
		Ext.getCmp('add').enable(false);
		Ext.getCmp('cancel').enable(false);
		Ext.getCmp('delete').enable(false);
		Ext.getCmp('refresh').enable(false);
		Ext.getCmp('modifypwd').disable(false);
	}
	refreshData();	
}


/*******************************************************************************
 * 刷新
 * 
 * @return
 */

function refreshData() {
	userPanel.getStore().loadPage(1);
}

/**
 * 刪除用戶
 * @param {Object} gridPanel
 * @return {TypeName} 
 */
function deleteUserDialog(){
	// 请求开始时，都先把selIds置空
	codes = "";
	// 当前选中的数据
	var d_recordsr = userPanel.getSelectionModel().getSelection();

	if (d_recordsr.length == 0) {
		Ext.Msg.alert("系统提示", "请至少选择一条数据！");
		return;
	}
	// 选中的凭证的id数组，要传到后台
	for (var i = 0; i < d_recordsr.length; i++) {
		codes += d_recordsr[i].get("user_code");
		if (i < d_recordsr.length - 1){
			codes += ",";
		}
			
	}
	
	Ext.MessageBox.confirm('删除提示', '是否确定删除'+codes +'等用户？', delUser);
}


function delUser(id) {
	if (id == "yes") {
		var myMask = new Ext.LoadMask(Ext.getBody(), {
			msg : '后台正在处理中，请稍后....',
			removeMask : true
				// 完成后移除
			});
		myMask.show();
		// 提交到服务器操作
		Ext.Ajax.request({
					url : 'deleteUser.do',
					method : 'POST',
					timeout : 180000, // 设置为3分钟
					params : {
						codes : codes
					},
					// 提交成功的回调函数
					success : function(response, options) {
						succAjax(response, myMask);
						refreshData();
					},
					// 提交失败的回调函数
					failure : function(response, options) {
						failAjax(response, myMask);
						refreshData();
					}
				});
	}
}

/**
 * 注销用戶
 * @param {Object} gridPanel
 * @return {TypeName} 
 */
function cancelUserDialog(){
	// 请求开始时，都先把selIds置空
	codes = "";
	// 当前选中的数据
	var d_recordsr = userPanel.getSelectionModel().getSelection();

	if (d_recordsr.length == 0) {
		Ext.Msg.alert("系统提示", "请至少选择一条数据！");
		return;
	}
	// 选中的凭证的id数组，要传到后台
	for (var i = 0; i < d_recordsr.length; i++) {
		codes += d_recordsr[i].get("user_code");
		if (i < d_recordsr.length - 1)
			codes += ",";
	}
	
	Ext.MessageBox.confirm('注销提示', '是否确定注销'+codes +'等用户？', cancelUser);
}


function cancelUser(id) {
	if(id == "yes"){
		var myMask = new Ext.LoadMask(Ext.getBody(), {
			msg : '后台正在处理中，请稍后....',
			removeMask : true // 完成后移除
		});
		myMask.show();
		// 提交到服务器操作
		Ext.Ajax.request({
				url : 'cancelUser.do',
        		method: 'POST',
				timeout:180000,  //设置为3分钟
				params : {
					codes: codes 
				},
				// 提交成功的回调函数
				success : function(response, options) {
					succAjax(response, myMask);
					refreshData();
				},
				// 提交失败的回调函数
				failure : function(response, options) {
					failAjax(response, myMask);
					refreshData();
				}
		});
	}
}

var adminWindow = null;

/*******************************************************************************
 * 设置管理员
 */
function setAdmin() {
	var records = userPanel.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请至少选择一条操作员信息！");
		return;
	}
	var myMask = new Ext.LoadMask(Ext.getBody(), {
		msg : '后台正在处理中，请稍后....',
		removeMask : true
			// 完成后移除
		});
	// myMask.show();
	if (adminWindow == null) {
		adminWindow = Ext.widget('window', {
			title : '设置管理员',
			width : 320,
			height : 120,
			layout : 'fit',
			resizable : false,
			closeAction : 'hide',
			modal : true,
			items : [new Ext.FormPanel({
				bodyPadding : 20,
				items : [{
							id : 'isAdmin',
							fieldLabel : '是否管理员',
							xtype : 'combo',
							labelWidth : 90,
							editable : false,
							displayField : 'name',
							valueField : 'value',
							store : Ext.create('Ext.data.Store', {
										fields : ['name', 'value'],
										data : [{
													"name" : "否",
													"value" : "0"

												}, {
													"name" : "是",
													"value" : "1"
												}]
									})
						}],
				buttons : [{
					text : '确定',
					handler : function() {
						var userIds = "";
						Ext.Array.each(records, function(model) {
									userIds += model.get("user_id") + ",";
								});
						myMask.show();
						Ext.Ajax.request({
							url : 'setAdminUser.do',
							method : 'POST',
							timeout : 180000, // 设置为3分钟
							params : {
								userIds : userIds.substring(0, userIds.length
												- 1),
								userType : Ext.getCmp("isAdmin").getValue()
							},
							// 提交成功的回调函数
							success : function(response, options) {
								succAjax(response, myMask);			
								refreshData();
							},
							// 提交失败的回调函数
							failure : function(response, options) {
								failAjax(response, myMask);
								refreshData();
							}
						});
						this.up('form').getForm().reset();
						this.up('window').hide();
					}
				}, {
					text : '取消',
					handler : function() {
						this.up('form').getForm().reset();
						this.up('window').hide();
					}
				}]
			})]
		});
	}
	//默认设置为管理员
	Ext.getCmp("isAdmin").setValue("1");
	adminWindow.show();
}

function requestMigrateOut(myMask,userRecodes,outBankCode){
	var ids = [];
	var brk = null;
	Ext.Array.each(userRecodes, function(model) {
		if(outBankCode == model.get('bank_code')){
			brk = true;
			return false;
		}
		ids.push(model.get('user_id'));
	});
	if(brk){
		Ext.Msg.alert("系统提示","迁入网点不能与原网点相同！");
		return;
	}
	myMask.show();
	Ext.Ajax.request({
		url : 'migrateOutUser.do',
		method : 'POST',
		timeout : 180000, // 设置为3分钟
		params : {
			userId : Ext.encode(ids),
			outBankCode : outBankCode
		},
		// 提交成功的回调函数
		success : function(response, options) {
			succAjax(response, myMask);			
			refreshData();
		},
		// 提交失败的回调函数
		failure : function(response, options) {
			failAjax(response, myMask);
			refreshData();
		}
	});
}
function migrateOutUser(userPanel) {
	var records = userPanel.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请至少选择一条操作员信息！");
		return;
	}
	var myMask = new Ext.LoadMask(Ext.getBody(), {
		msg : '后台正在处理中，请稍后....',
		removeMask : true
			// 完成后移除
		});
	
	var netWorkTree = Ext.create('js.view.common.NetworkQuery');
	var networkTreeClick = Ext.getCmp("loadnetworkTree");
	var selectNetWorkBtn = Ext.getCmp("selectNetWork");
	networkTreeClick.on("itemdblclick", function(view, record, item,index, e) {
			var outBankCode = record.raw.code;
			this.up('window').close();
			requestMigrateOut(myMask,records,outBankCode)
		});
	
	selectNetWorkBtn.on('click', function() {
		var netRecords =Ext.getCmp('loadnetworkTree').getSelectionModel().getSelection();
		if(records.length<1)
			return;
		var outBankCode = netRecords[0].raw.code;
		this.up('window').close();	
		requestMigrateOut(myMask,records,outBankCode)			
		
	});
	netWorkTree.show();
}

function migrateInUser() {
	var netWorkTree = Ext.create('pb.view.pay.MigrateLogWindow',{
		title : "迁入用户",
		bankLable : "迁出网点",
		flag : true
	});
	
	Ext.getCmp('migratePanel').getStore().load({
		params : {
					isParent : false,
					flag: true
				}
	});
	//查询按钮单击事件
	Ext.ComponentQuery.query('button[name=queryBtn]', netWorkTree)[0].on('click',function(){
			//刷新原凭证信息
			Ext.getCmp('migratePanel').getStore().load({
				params : {
					isParent : false,
					flag : true,
					bankCode : Ext.getCmp("bankCode").getValue(),
					userCode : Ext.getCmp("userCode").getValue(),
					identityNo : Ext.getCmp("identityNo").getValue()
				}
			});
	});
		
	netWorkTree.show();
}

//迁入迁出日志
function loadMigrateLog() {
	var logsWindow = Ext.create('pb.view.pay.MigrateAllLogWindow',{
		title : "迁入迁出日志"
	});
	//刷新原凭证信息
	Ext.getCmp('migratePanels').getStore().load({
		params : {
			isParent : false
		}
	});
	//查询按钮单击事件
	Ext.ComponentQuery.query('button[name=queryBtn]', logsWindow)[0].on('click',function(){
			//刷新原凭证信息
			Ext.getCmp('migratePanels').getStore().load({
				params : {
					isParent : false,
					userCode : Ext.getCmp("user_code2").getValue(),
					identityNo : Ext.getCmp("identity_no2").getValue()
				}
			});
	});
		
	logsWindow.show();
}

//撤销迁出
function revMigrateLog() {
	var netWorkLogs = Ext.create('pb.view.pay.MigrateLogWindow',{
		flag : false,
		bankLable : "迁入网点",
		title : "撤销迁出"
	});
	Ext.getCmp('migratePanel').getStore().load({
		params : {
			isParent : false,
			flag: false
		}
	});
	//查询按钮单击事件
	Ext.ComponentQuery.query('button[name=queryBtn]', netWorkLogs)[0].on('click',function(){
			//刷新原凭证信息
			Ext.getCmp('migratePanel').getStore().load({
				params : {
					flag : false,
					isParent : false,
					bankCode : Ext.getCmp("bankCode").getValue(),
					userCode : Ext.getCmp("userCode").getValue(),
					identityNo : Ext.getCmp("identityNo").getValue()
				}
			});
	});
		
	netWorkLogs.show();
}
