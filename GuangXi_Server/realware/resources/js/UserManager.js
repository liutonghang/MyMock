/*******************************************************************************
 * 主要用于用户维护
 * 
 * @type
 */

var userPanel = null;
var networkPanel =null;

/***
 * 引入需要使用的js文件
 */
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/menuBtnStatus.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/gridPanel.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/json2String.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/impFile.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/js/model/user/UserMigrateModel.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/js/store/pay/MigrateLog.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/js/store/pay/MigrateAllLog.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/js/view/common/MigrateLogWindow.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/js/view/common/MigrateAllLogWindow.js"></scr' + 'ipt>');
	

/**
 * 数据项
 */

var fileds = ["identity_no","user_code", "user_name", "bank_code", "bank_name","bank_id",
		"telephone_number", "cellphone_number", "remark","user_id","user_type","enabled","bank_level","authorise","manager_type"];

/**
 * 列名
 */
var header = "身份证号|identity_no|150,工号|user_code|100,姓名|user_name|100,网点编码|bank_code|100,网点名称|bank_name|200,可授权|authorise|50,管理员|manager_type|50,"
		+ "电话|telephone_number|100,手机|cellphone_number|100,员工级别|user_type|80,备注|remark|180";


var netfileds = ["id", "code", "name"];
var netheader="网点编码|code|100,网点名称|name|180";
/*******************************************************************************
 * 状态
 */

var userTypeStore = Ext.create('Ext.data.Store', {
			fields : [{
						name : 'name'
					}, {
						name : 'value'
					}],
			proxy : {
						type : 'ajax',
						actionMethods : {
							read : 'POST'
						},
						url : '/realware/loadUserType.do',
						reader : {
							type : 'json'
						}
					},
			autoSync : true,
			autoLoad : true
			});
var comboStore = Ext.create('Ext.data.Store', {
			fields : ['name', 'value'],
			data : [{
						"name" : "启用",
						"value" : "1"
					}, {
						"name" : "停用",
						"value" : "2"
					}, {
						"name" : "全部",
						"value" : ""
					}]
		});
var comboStore2 = Ext.create('Ext.data.Store', {
			fields : ['name', 'value'],
			data : [{
						"name" : "全部网点",
						"value" : "001"
					}, {
						"name" : "指定网点",
						"value" : "002"
					}]
		});

/*******************************************************************************
 * 界面加载
 */
Ext.onReady(function() {
	Ext.QuickTips.init();
	Ext.syncRequire(['js.view.common.Network']);
	if(networkPanel ==null){
		networkPanel = 	Ext.create('NetworkTree');
		networkPanel.setHeight(document.documentElement.scrollHeight - 100);
	}
	if (userPanel == null) {
		userPanel = getGrid("/realware/loadUser.do", header, fileds, true, true);
		userPanel.setHeight(document.documentElement.scrollHeight - 100);	
		userPanel.getStore().on('beforeload', function(thiz, options) {
			var panel = Ext.ComponentQuery.query("panel[title='操作员查询']")[0];
			beforeload(panel, options, Ext.encode(fileds));
			var records = networkPanel.getSelectionModel().getSelection();
			if (records && records.length > 0) {
				//var netcode = records[0].get("code");
				var netcode  = records[0].raw.code;
				var params = Ext.decode(options.params.jsonMap);
				params.push({"bank_code" : ["=", netcode]});
				options.params.jsonMap = Ext.encode(params);
			}
		});
	}
	/*
	 * 定义按钮英文名称
	 */
	var buttonItems = [{
		id : 'add',
		handler : function() {
			var netState=Ext.getCmp('netState').getValue();
			addUserDialog(netState,networkPanel);
		}
	}, {
		id : 'edit',
		handler : function() {
			var netState=Ext.getCmp('netState').getValue();
			editUserDialog(netState,userPanel);		
		}
	},{
		//注销
		id : 'cancel',
		handler : function() {
			cancelUserDialog();
		}
	},{
		//删除
		id : 'delete',
		handler : function() {
			deleteUserDialog();
		}
	},{
		//导入
		id : 'input',
		handler : function() {
			importFile(importUserUrl);
		}
	},{
		//设置管理员
		id : 'setadmin',
		handler : function() {
			setAdmin();
		}
	},{
		//设置管理员
		id : 'setadministrator',
		handler : function() {
			setadministrator();
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
		var netState=Ext.getCmp('netState').getValue();
		if ('001' == netState) {
			refreshData();
		} else {
			var records = networkPanel.getSelectionModel().getSelection();
			if (records.length < 1) {
					refreshData();
					return;
				}
			var netcode = records[0].get("code");
			refreshData(netcode);			
			}
		}
	}];
var queryItems = [                  {
                	  xtype : 'panel',
                	  layout : 'border',
                	  height : heights,
                	  items : [{
              			id :'netgird',
            			region: 'west',
            			xtype : 'panel',
            			width: 250,
            			items:[{
            				title : '网点过滤查询',
            				bodyPadding : 8,
            				layout : 'hbox',
            				defaults : {margins : '3 10 0 0'},
            				items : [{
            					id : 'netcode',
            					xtype : 'textfield',
            					dataIndex : 'netcode',
            					width: 100
            				}, {
            					id : 'netrefresh',
            					xtype : 'button',
            					iconCls : 'refresh',
            					scale : 'small',
            					handler : function() {
            						selectNet();
        						}	
            				}, {
            					id : 'netState',
            					xtype : 'combo',
            					displayField : 'name',
            					emptyText : '请选择',
            					valueField : 'value',
            					width : 85,
            					store : comboStore2,
            					value : '001',
            					editable : false,
            					listeners : {
            							'select' : selectNetState
            						}
            				}],
            				flex : 2
            			},networkPanel]
            	},{
            		region: 'center',
            		xtype : 'panel',
            		items : [{
            				title : '操作员查询',
            				bodyPadding : 8,
            				layout : 'hbox',
            				defaults : {margins : '3 10 0 0'},
            				items : [{
            							id : 'operatorCode',
            							fieldLabel : '员工编号',
            							xtype : 'textfield',
            							dataIndex : 'user_code',
            							symbol:'like',
            							labelWidth : 60
            						}, {
            							id : 'operatorName',
            							fieldLabel : '员工名称',
            							xtype : 'textfield',
            							dataIndex : 'user_name',
            							symbol:'like',
            							labelWidth : 60
            						}],
            				flex : 2
            			},userPanel]
            	}]
                  }
];
	Ext.StatusUtil.createViewport(buttonItems, queryItems, function() {
		// 默认设置为未生成
		Ext.getCmp('netState').setValue("001");

	});
	setBtnVisible(null, Ext.getCmp("buttongroup"));
	selectNetState();
	
	networkPanel.on("itemclick", function(g, rowIndex, columnIndex, e) {
		refreshData();
			});
	
	/**
	 * 员工级别在前台渲染，避免后台写死<br>
	 * add by liutianlong 2016年8月17日
	 */
	var user_type = Ext.getCmp('user_type');
	user_type.renderer = function(value){
		var record = userTypeStore.findRecord('value',value);
		if(record) {
			return record.get('name');
		}
	}
});

/*******************************************************************************
 * 网点加载
 */
function selectNet(){
	
	if(Ext.isEmpty(Ext.getCmp("netcode").getValue())){
		return;
	}
	refreshNetWork();
	
	userPanel.getStore().removeAll();
	
//	if(len==0){
//		//置空用户panel
//		refreshData("####");
//		return ;
//	}
//	//默认选中第一行
//	networkPanel.getSelectionModel().select(0);
//	var records = networkPanel.getSelectionModel().getSelection();
//		if(records.length<1){
//			refreshData();
//			return;
//		}			
//		var netcode=records[0].get("code");
//		refreshData(netcode); //默認第一行后重新加載
}
/**
 * 全部，部分切换
*/
function selectNetState(){
	var netState=Ext.getCmp('netState').getValue();
	if('001'==netState){
		Ext.getCmp('netcode').disable(false);
		Ext.getCmp('netrefresh').disable(false);
		networkPanel.setDisabled(true);
		networkPanel.getSelectionModel().clearSelections();
		refreshData();
		Ext.getCmp('netcode').setValue("");
	}else{
		Ext.getCmp('netcode').enable(false);
		Ext.getCmp('netrefresh').enable(false);
		networkPanel.setDisabled(false);
		selectNet();
		
	}	
}

/*******************************************************************************
 * 刷新
 * 
 * @return
 */

function refreshData() {
	userPanel.getStore().loadPage(1);
}

//刷新网点
function refreshNetWork(){
	var jsonMap = "[{";
	var codeOrName = Ext.getCmp('netcode').getValue();

	if (!Ext.isEmpty(codeOrName)) {
		var jsonStr = [];
		jsonStr[0] = "=";
		jsonStr[1] = codeOrName;
		jsonMap = jsonMap + "\"codeOrName\":" + Ext.encode(jsonStr) + ",";
	}
	data = jsonMap + "}]";
	networkPanel.getSelectionModel().deselectAll();
	networkPanel.getStore().load({
				method : 'post',
				params : {
					start : 0,
					pageSize : 200,
					filedNames : JSON.stringify(netfileds),
					jsonMap : data
				}
			});
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
						var netState = Ext.getCmp('netState').getValue();
						if ('001' == netState) {
							refreshData();
						} else {
							var records = networkPanel.getSelectionModel()
									.getSelection();
							if (records.length < 1)
								return;
							var netcode = records[0].get("code");
							refreshData(netcode);
						}
					},
					// 提交失败的回调函数
					failure : function(response, options) {
						failAjax(response, myMask);
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
	
	cancel_code = "";
	// 当前选中的数据
	var d_recordsr = userPanel.getSelectionModel().getSelection();

	if (d_recordsr.length == 0) {
		Ext.Msg.alert("系统提示", "请至少选择一条数据！");
		return;
	}
	// 选中的凭证的id数组，要传到后台
	for (var i = 0; i < d_recordsr.length; i++) {
		if(d_recordsr[i].get("enabled") == 1){
			codes += d_recordsr[i].get("user_code");
			codes += ",";
		}
		else{
			cancel_code += d_recordsr[i].get("user_code");
			cancel_code += ",";
		}
	}
	if(codes == ""){
		Ext.Msg.alert("系统提示", "用户"+cancel_code.substring(0,cancel_code.length-1)+"已被注销！");
		return;
	}else{
		var text = '';
		if(cancel_code == ""){
			text += '是否确定注销'+codes.substring(0,codes.length-1) +'等用户？';
		}else{
			text += '用户'+cancel_code.substring(0,cancel_code.length-1)+'已被注销，同时是否确定注销'+codes.substring(0,codes.length-1) +'等用户？';
		}
		Ext.MessageBox.confirm('注销提示', text, cancelUser);
	}
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
					var netState=Ext.getCmp('netState').getValue();
					if('001'==netState){
						refreshData();
					}else{
						var records = networkPanel.getSelectionModel().getSelection();
						if(records.length<1)
							return;
						var netcode=records[0].get("code");
						refreshData(netcode);
					}
				},
				// 提交失败的回调函数
				failure : function(response, options) {
					failAjax(response, myMask);
				}
		});
	}
}


var store = Ext.create('Ext.data.Store', {
	fields : ['name', 'value'],
	data : [{
				"name" : "否",
				"value" : "0"

			}, {
				"name" : "是",
				"value" : "1"
			}]
});

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
	var formPanel = new Ext.FormPanel({
		id : 'isAdminForm',
		frame:true,
	    bodyStyle:'padding:5px 5px 0 5px',
	    defaultType : 'combo',
		items : [{
			id : 'isAdmin',
			fieldLabel : '是否管理员',
			labelWidth : 90,
			editable : false,
			displayField : 'name',
			valueField : 'value',
			value : '1',
			store : store
		}],
		buttons : [{
			text : '确定',
			handler : function(){
				var userIds = "";
				Ext.Array.each(records, function(model) {
							userIds += model.get("user_id")+",";
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
						userIds = "";
						var netState = Ext.getCmp('netState')
								.getValue();
						if ('001' == netState) {
							refreshData();
						} else {
							var records = networkPanel
									.getSelectionModel().getSelection();
							if (records.length < 1)
								return;
							var netcode = records[0].get("code");
							refreshData(netcode);
						};
					},
					failure : function(response, options){
						failAjax(response, myMask);
					}
				});
				this.up('form').getForm().reset();
				this.up('window').close();
			}
		},{
			text : '取消',
			handler : function(){
				this.up('form').getForm().reset();
				this.up('window').close();
			}
		}]
	});
	var adminWindow = Ext.widget('window', {
			title : '设置管理员',
			width : 320,
			height : 120,
			layout : 'fit',
			resizable : false,
			modal : true,
			items : [formPanel]													
		}).show();
}

/**
 * 按照级次设置管理员
 * 判断所选网点的级次，级次=2时，不允许指定
 * @return
 */
function setadministrator(){
	var records = userPanel.getSelectionModel().getSelection();
	if (records.length != 1) {
		Ext.Msg.alert("系统提示", "请选择一条操作员信息！");
		return;
	}
	var myMask = new Ext.LoadMask(Ext.getBody(), {
		msg : '后台正在处理中，请稍后....',
		removeMask : true
			// 完成后移除
		});
	// myMask.show();
	//判断级次-----------------------------------------------------------------------------
		Ext.Ajax.request({
			url : ' estimateLevelnum.do',
			method : 'POST',
			timeout : 180000, // 设置为3分钟
			params : {
				userId : records[0].get("user_id"),
				userCode :  records[0].get("user_code")
			},
			// 提交成功的回调函数
			success : function(response, options) {
					if('1' == response.responseText){ //表示当前
						setAdmin();
					}else{  //如果级次为2
						Ext.Msg.alert("系统提示", "权限不够，不能为指定该用户为管理员！");
					}
				},
			
			failure : function(response, options){
				failAjax(response, myMask);
			}
		});
	//判断级次------------------------------------------------------------------------------
	
	
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
					isParent : true,
					flag: true
				}
	});
	//查询按钮单击事件
	Ext.ComponentQuery.query('button[name=queryBtn]', netWorkTree)[0].on('click',function(){
			//刷新原凭证信息
			Ext.getCmp('migratePanel').getStore().load({
				params : {
					isParent : true,
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
			isParent : true
		}
	});
	//查询按钮单击事件
	Ext.ComponentQuery.query('button[name=queryBtn]', logsWindow)[0].on('click',function(){
			//刷新原凭证信息
			Ext.getCmp('migratePanels').getStore().load({
				params : {
					isParent : true,
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
			isParent : true,
			flag: false
		}
	});
	//查询按钮单击事件
	Ext.ComponentQuery.query('button[name=queryBtn]', netWorkLogs)[0].on('click',function(){
			//刷新原凭证信息
//			Ext.getCmp('migratePanel').getStore().load({
//				params : {
//					flag : true,
//					isParent : false,
//					bankCode : Ext.getCmp("bankCode").getValue()
//				}
//			});
			Ext.getCmp('migratePanel').getStore().load({
				params : {
					isParent : true,
					flag: false,
					bankCode : Ext.getCmp("bankCode").getValue(),
					userCode : Ext.getCmp("userCode").getValue(),
					identityNo : Ext.getCmp("identityNo").getValue()
				}
			});
	});
		
	netWorkLogs.show();
}
