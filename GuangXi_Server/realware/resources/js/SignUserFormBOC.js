/** 
* 自助柜面- 零余额
 */
document
		.write('<scr'
				+ 'ipt type="text/javascript" src="/realware/resources/js/share/gridPanel.js"></scr'
				+ 'ipt>');
document
		.write('<scr'
				+ 'ipt type="text/javascript" src="/realware/resources/js/share/json2String.js"></scr'
				+ 'ipt>');
document
		.write('<scr'
				+ 'ipt type="text/javascript" src="/realware/resources/js/share/listView.js"></scr'
				+ 'ipt>');
document
		.write('<scr'
				+ 'ipt type="text/javascript" src="/realware/resources/js/share/menuBtnStatus.js"></scr'
				+ 'ipt>');

/**
 * 数据项
 */
var fileds = [ "sign_id", "agency_code", "user_login_code","account_code", "ukey_code", "sign_name","phone_no","user_role","paper_no","li_no","user_name","user_card_type" ];

/**
 * 列名
 */
//var header = "客户号|agency_code,操作员编码|user_no,签约账号|account_code,UKEY编码|ukey_code,用户角色|user_role,营业执照号码|li_no,单位名称|user_name,法人|loader,"
//		+ "组织机构代码|paper_no,操作员姓名|sign_name,操作员电话|sign_tel," +
//				"电话号码|phone_no,联系地址|address,电子邮箱地址|e_mail";
var header = "操作员编码|user_login_code|150,签约账号|account_code|160,UKEY编码|ukey_code|150,操作员角色|user_role|100,操作员姓名|sign_name|100,操作员电话|phone_no|150,操作员证件类型|user_card_type|180,操作员证件号|paper_no|180,单位名称|user_name,客户号|agency_code|120,营业执照号|li_no|180";
var finPanel = null;
/**
 * 本地数据源
 */
var comboEnabledStore = Ext.create('Ext.data.Store', {
	fields : ['name', 'value'],
	data : [{
				"name" : "有效",
				"value" : 1
			},{
				"name" : "已注销",
				"value" : 0
			}]
});
var roleStore = Ext.create('Ext.data.Store', {
	fields : ['name', 'value'],
	data : [{
				"name" : "经办员",
				"value" : "1"
			}, {
				"name" : "审核员",
				"value" : "2"
			}]
});
var cardStore = Ext.create('Ext.data.Store', {
	fields : ['name', 'value'],
	data : [{
				"name" : "身份证",
				"value" : "1"
			}, {
				"name" : "户口本",
				"value" : "2"
			}, {
				"name" : "军官证",
				"value" : "3"
			}, {
				"name" : "警官证",
				"value" : "4"
			}, {
				"name" : "士兵证",
				"value" : "5"
			}, {
				"name" : "文职干部证",
				"value" : "6"
			}, {
				"name" : "护照",
				"value" : "7"
			}, {
				"name" : "港澳台同胞回乡证",
				"value" : "8"
			}, {
				"name" : "其它",
				"value" : "9"
			}]
});
/**
 * 界面加载
 */
Ext.onReady(function() {
	Ext.QuickTips.init();
	if (finPanel == null) {
		finPanel = getGrid(loadUrl, header, fileds, true, true);
		finPanel.setHeight(document.documentElement.scrollHeight - 88);
		var jsonStr = [];
		finPanel.getStore().on('beforeload',function(thiz, options) {
					var jsonMap = "";
					var taskState = Ext.getCmp('taskState').getValue();
					var accountcode = Ext.getCmp('accountcode').getValue();
					var userscode = Ext.getCmp('userscode').getValue();
					
					if(taskState != 3){
						jsonStr[0] = "=";
						jsonStr[1] = taskState;
						jsonMap = jsonMap + "\"cis_valide\":" + Ext.encode(jsonStr)
								+ ",";
					} 
					if ("" != accountcode && null != accountcode) {
						jsonStr[0] = "like";
						jsonStr[1] = accountcode;
						jsonMap = jsonMap + "\"account_code\":"
								+ Ext.encode(jsonStr) + ",";
					}
					if ("" != userscode && null != userscode) {
						jsonStr[0] = "like";
						jsonStr[1] = userscode;
						jsonMap = jsonMap + "\"user_login_code\":"
								+ Ext.encode(jsonStr) + ",";
					}
					var data = "";
					if (jsonMap.length > 0) {
						data = "[{" + jsonMap.substring(0, jsonMap.length - 1)
								+ "}]";
					} else {
						data = "[{}]";
					}

					if (null == options.params || options.params == undefined) {
						options.params = [];
						options.params["jsonMap"] = data;
						options.params["filedNames"] = JSON.stringify(fileds);
					} else {
						options.params["jsonMap"] = data;
						options.params["filedNames"] = JSON.stringify(fileds);
					}

				});

	}

	Ext.create('Ext.Viewport', {
		id : 'buffetCounterButton',
		layout : 'fit',
		items : [ Ext.create('Ext.panel.Panel', {
			tbar : [ {
				id : 'buttongroup',
				xtype : 'buttongroup',
				items : [ {
					id : 'addZero',
					text : '新增',
					iconCls : 'add',
					scale : 'small',
					handler : function() {
						addBuffetCounter();
					}
				}, {
					id : 'edit',
					text : '修改',
					iconCls : 'edit',
					scale : 'small',
					handler : function() {
						editUser();
					}
				}, /*{
					id : 'editukeybutn',
					text : 'UKEY变更',
					iconCls : 'edit',
					scale : 'small',
					handler : function() {
						editUkey();
					}
				}, {
					id : 'update',
					text : '证书同步',
					iconCls : 'edit',
					scale : 'small',
					handler : function() {
						updateUkey();
					}
				}, {
					id : 'setPsw',
					text : '密码重置',
					iconCls : 'refresh',
					scale : 'small',
					handler : function() {
					resetPsw();
					}
				}, */{
					id : 'logOff',
					text : '注销',
					iconCls : 'invalid',
					scale : 'small',
					handler : function() {
						cancleBuffetCounter();
					}
				}, {
					id : 'refreshButton',
					text : '刷新',
					iconCls : 'refresh',
					scale : 'small',
					handler : function() {
						refreshData();
					}
				} ]
			} ],
			items : [ {
				title : "查询区",
				items : finPanel,
				tbar : {
					id : 'buffetCounterQuery',
					xtype : 'toolbar',
					layout : {
						type : 'table',
						columns : 4
					},
					defaults : {
						margins : '3 5 0 0'
					},
					items : [ {
						id : 'taskState',
						fieldLabel : '状态',
						xtype : 'combo',
						displayField : 'name',
						emptyText : '已生效',
						valueField : 'value',
						value : 1,
						labelWidth : 30,
						store : comboEnabledStore,
						width : 180,
						editable : false,
						listeners : {
							'select' : selectEnabledStore
						}
					}, {
						id : 'accountcode',
						fieldLabel : '单位零余额账号',
						xtype : 'textfield'
					}, {
						id : 'userscode',
						fieldLabel : '操作员编码',
						xtype : 'textfield'
					} ]
				}
			} ]
		}) ]
	});
	//操作员证件类型转换
	var col = Ext.getCmp('user_card_type');
	col.renderer = function(value,col) {
		
		var record = cardStore.findRecord('value',value);
		if(record) {
			return record.get('name');
		}
		return value;
	};
	setBtnVisible(null, Ext.getCmp("buttongroup"));
	refreshData();
});
/** 
 *  选择条件
 */
function selectEnabledStore() {
	var taskState = Ext.getCmp("taskState").getValue();
//	var addButton = Ext.getCmp("addZero");
//	var logOff = Ext.getCmp('logOff');
//	var edit = Ext.getCmp('edit');
//	var editukey = Ext.getCmp('editukeybutn');
//	var refreshButton = Ext.getCmp('refreshButton');
	
	if ("1" == taskState) {
		Ext.getCmp('logOff').enable(false);
		Ext.getCmp('edit').enable(false);
		Ext.getCmp('editukeybutn').enable(false);
		Ext.getCmp('setPsw').enable(false);
	}else if ("0" == taskState) {
		Ext.getCmp('logOff').disable(false);
		Ext.getCmp('edit').disable(false);
		Ext.getCmp('editukeybutn').disable(false);
		Ext.getCmp('setPsw').disable(false);
	}
	
	refreshData();
}
/**
 * 刷新
 * 
 * @return
 */
function refreshData() {
	finPanel.getSelectionModel().deselectAll();
	finPanel.getStore().load();

}

/*******************************************************************************
 * 设置按钮可见
 * 
 * @param {}
 *            admdiv_code
 * @param {}
 *            buttongroup
 */
function setBtnVisible(admdiv_code, buttongroup) {
	Ext.Ajax.request({
		url : '/realware/loadPageStatus.do',
		method : 'POST',
		timeout : 10000, // 设置为10秒
		success : function(response, options) {
			var b = eval("(" + response.responseText + ')').buttonList;
			for ( var i = 0; i < b.length; i++) {
				Ext.getCmp(b[i].button_id).setVisible(
						b[i].visible == 1 ? true : false);
				Ext.getCmp(b[i].button_id).setText(b[i].button_name);
			}
		},
		failure : function() {
			Ext.Msg.alert("提示信息", "初始化按钮显示异常！");
		}
	});
	// setButton(admdiv_code,buttongroup); //以后可注释
}
/**
 * 密码重置
 */
function resetPsw(){
	var records = finPanel.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请选中一条操作员信息！");
		return;
	} 
	if (records.length > 1) {
		Ext.Msg.alert("系统提示", "重置密码只能单笔操作！");
		return;
	} 
	var userlogincode = records[0].get('user_login_code');
	var userpsw = null;
	var myMask = new Ext.LoadMask(Ext.getBody(), {
		msg : '后台正在处理中，请稍后....',
		removeMask : true
	});
	myMask.show();
	Ext.Ajax.request({
		url : '/realware/resetPsw.do',
		waitMsg : '后台正在处理中,请稍后....',
		timeout : 180000, // 设置为3分钟
		async : false,// 添加该属性即可同步,
		params : {
			userlogincode : userlogincode
		},

		// 提交成功的回调函数
		success : function(response, options) {
			myMask.hide();
			var dto = new Function("return " + response.responseText)();
			userpsw = dto.password;
			Ext.Msg.confirm('系统提示','您确定重置密码', function(e) {
				if (e == "yes") {
					savePsw(userpsw,userlogincode);
//					var methodName = "pswmethod";
//					authorize(methodName,userpsw,userlogincode);
				}
			});
		},
		// 提交失败的回调函数
		failure : function(response, options) {
			failAjax(response, myMask);
			refreshData();
		}
	});
}

/**
 * 证书同步
 */
var required = '<span style="color:red;font-weight:bold" data-qtip="Required">*</span>', updateWindow;
function updateUkey() {
	var me = this;
	if (!updateWindow) {
		updateWindow = Ext.widget('window', {
			id : "updateWindow",
			title : '证书状态同步',
			bodyStyle : 'overflow-x:hidden;overflow-y:hidden',
			style : {
				'text-align' : 'center'
			},
			closeAction : 'close',
			width : 420,
			height : 150,
			resizable : false,
			modal : true,
			items : Ext.widget('form', {
				id : 'editForm',
				border : false,
				width : 420,
				bodyPadding : 20,
				fieldDefaults : {
					labelAlign : 'right',
					labelWidth : 100
				},
				items : [ {
					id : 'ukeyCode',
					xtype : 'textfield',
					dataIndex : 'ukey_code',
					fieldLabel : 'UKEY编码',
					afterLabelTextTpl : required,
					width : 340,
					allowBlank : false			
				}],
				buttonAlign : 'center',
				buttons : [{
							text : '同步',
							id : 'upButton',
							handler : function() {
								if (this.up('form').getForm().isValid()) {
									var ukeycode = Ext.getCmp("ukeyCode").getValue();
									var myMask = new Ext.LoadMask(
											Ext.getBody(), {
												msg : '后台正在处理中，请稍后....',
												removeMask : true
											});
									myMask.show();
									Ext.Ajax.request({
										url : '/realware/updateUkey.do',
										waitMsg : '后台正在处理中,请稍后....',
										timeout : 180000, // 设置为3分钟
										async : false,// 添加该属性即可同步,
										// jsonData : data,
										params : {ukey_code : ukeycode},
										// 提交成功的回调函数
										success : function(response, options) {
											succAjax(response, myMask, true);
											Ext.getCmp('editForm').getForm().reset();
											Ext.getCmp("updateWindow").close();

										},
										// 提交失败的回调函数
										failure : function(response, options) {
											failAjax(response, myMask);
											refreshData();
										}
									});
								}
							}
						},{

							text : '取消',
							id : 'cancelButton',
							handler : function() {
								this.up('form').getForm().reset();
								this.up('window').close();
							}
						} ]
			})
		});
	}
	updateWindow.show();
}

/**
 * 新增 操作员
 */
var required = '<span style="color:red;font-weight:bold" data-qtip="Required">*</span>', createWindow;
function addBuffetCounter() {
	var me = this;
	if (!createWindow) {
		createWindow = Ext.widget('window', {
			id : "addWindow",
			title : '新增',
			bodyStyle : 'overflow-x:hidden;overflow-y:hidden',
			style : {
				'text-align' : 'center'
			},
			closeAction : 'close',
			width : 420,
			height : 400,
			resizable : false,
			modal : true,
			items : Ext.widget('form', {
				id : 'createForm',
				border : false,
				width : 420,
				bodyPadding : 20,
				fieldDefaults : {
					labelAlign : 'right',
					labelWidth : 100
				},
				items : [ {
					layout : 'hbox',
					style : 'margin-bottom:5px;',
					bodyStyle : 'border-width: 0px 0px 0px 0px;',
					width : 420,
					items : [ {
						id : 'accounTcodeforadd',
						dataIndex : 'account_code',
						fieldLabel : '签约账号',
						labelWidth : 100,
						width : 320,
						xtype : 'textfield',
						allowBlank : false,
						afterLabelTextTpl : required
					}, {
						id : 'queryButton',
						style : 'margin-left:5px',
						text : '查询',
						xtype : 'button',
						width : 35,
						handler: function() {
							var accountcode = Ext.getCmp("accounTcodeforadd").getValue();
							queryUser(accountcode);
						}
					} ]
				
				},{
					id : 'agencyCode',
					xtype : 'textfield',
					dataIndex : 'agency_code',
					fieldLabel : '客户号',
//					afterLabelTextTpl : required,
					width : 340,
					editable : false,
					disabled : true,
					allowBlank : false
				}, {
					id : 'lino1',
					xtype : 'textfield',
					fieldLabel : '营业执照号码',
					width : 340,
					disabled : true
				}, {
					id : 'uName',
					xtype : 'textfield',
					dataIndex : 'user_name',
					fieldLabel : '单位名称',
					width : 340,
//					readOnly:true
					disabled : true
//				},{
//					id : 'userNo',
//					xtype : 'textfield',
//					dataIndex : 'user_no',
//					fieldLabel : '操作员编码',
//					width : 340,
//					disabled : true,
//					allowBlank : false
				},{
					id : 'userNoBOC',
					xtype : 'textfield',
					dataIndex : 'user_no',
					fieldLabel : '操作员Id(中行)',
//					afterLabelTextTpl : required,
					width : 340
				}, {
					id : 'uCode',
					xtype : 'textfield',
					dataIndex : 'ukey_code',
					fieldLabel : 'UKEY编码',
					afterLabelTextTpl : required,
					width : 340
				}, {
					id : 'signName',
					xtype : 'textfield',
					dataIndex : 'sign_name',
					fieldLabel : '操作员姓名',
					afterLabelTextTpl : required,
					width : 340
				}, {
					id : 'signRole',
					xtype : 'combo',
					fieldLabel : '操作员角色',
					afterLabelTextTpl : required,
					emptyText : '请选择',
					width : 340,
					valueField : 'value',
					displayField : 'name',
					editable : false,
					store : roleStore
				}, {
					id : 'cardType',
					xtype : 'combo',
					fieldLabel : '操作员证件类型',
					afterLabelTextTpl : required,
					emptyText : '请选择',
					width : 340,
					valueField : 'value',
					displayField : 'name',
					editable : false,
					store : cardStore
				}, {
					id : 'userLiNo',
					xtype : 'textfield',
					fieldLabel : '操作员证件号',
					afterLabelTextTpl : required,
					width : 340
				}, {
					id : 'phoneNo',
					xtype : 'textfield',
					fieldLabel : '操作员电话',
					afterLabelTextTpl : required,
					width : 340
				}, {
					id : 'passWord',
					xtype : 'textfield',
					fieldLabel : '密码',
					afterLabelTextTpl : required,
					width : 340
				}],
				buttonAlign : 'center',
				buttons : [{
							text : '添加',
							id : 'addNetworkButton',
							handler : function() {
								var methodName = "addmethod";
								//单位零余额账号
								var accountcode = Ext.getCmp("accounTcodeforadd").getValue();
								//客户号
								var agencycode = Ext.getCmp("agencyCode").getValue();
								//操作员编码
//								var usercode = Ext.getCmp("userNo").getValue();
								// 中行操作员编码
								var usercode_boc = Ext.getCmp("userNoBOC").getValue();
								//UKEY编码
								var ukeycode = Ext.getCmp("uCode").getValue();
								//单位户名
								var username = Ext.getCmp("uName").getValue();
								//操作员姓名signRole
								var signName = Ext.getCmp("signName").getValue();
								//操作员角色
								var signRole = Ext.getCmp("signRole").getValue();
								//证件类型
								var cardType = Ext.getCmp("cardType").getValue();
								//证件号码
								var userLiNo = Ext.getCmp("userLiNo").getValue();
								//电话号码
								var phoneno = Ext.getCmp("phoneNo").getValue();
								//密码
								var passWord = Ext.getCmp("passWord").getValue();
								
								var lino1 = Ext.getCmp("lino1").getValue();
								
								if(accountcode == null || accountcode == ""){
									Ext.Msg.alert("系统提示", "签约账号不能为空！");
									return ;
								}
								if(agencycode == null || agencycode == ""){
									Ext.Msg.alert("系统提示", "请先查询客户信息！");
									return ;
								}
								if(ukeycode == null || ukeycode == ""){
									Ext.Msg.alert("系统提示", "UKey编码不能为空！");
									return ;
								}else if(ukeycode == null || signName == ""){
									Ext.Msg.alert("系统提示", "操作员姓名不能为空！");
									return ;
								}else if(signRole == null || signRole == ""){
									Ext.Msg.alert("系统提示", "操作员角色不能为空！");
									return ;
								}else if(cardType == null || cardType == ""){
									Ext.Msg.alert("系统提示", "操作员证件类型不能为空！");
									return ;
								}else if(userLiNo == null || userLiNo == ""){
									Ext.Msg.alert("系统提示", "操作员证件号码不能为空！");
									return ;
								}else if(phoneno == null || phoneno == ""){
									Ext.Msg.alert("系统提示", "操作员电话号码不能为空！");
									return ;
								}
								saveMsg();
//								授权
//								authorize(methodName);
							}
						}, {
							text : '打印',
							id : 'printeButton',
							handler : function() {
								button1_onclick(false);
							}
						},{

							text : '取消',
							id : 'cancelBuffetCounterButton',
							handler : function() {
								this.up('form').getForm().reset();
								this.up('window').close();
							}
						} ]
			})
		});
//		me.addEvents('queryButtonclick');
//		this.callParent(arguments);
	}
//	Ext.getCmp('phoneNo').hide(); 
	Ext.getCmp('passWord').hide(); 
	createWindow.show();
}

/**
 * 查询用户信息并回显
 */
function queryUser(accountcode){
	if(accountcode == null || accountcode == ""){
		Ext.Msg.alert("系统提示", "单位零余额账号不能为空！");
		return;
	}
	var myMask = new Ext.LoadMask(Ext.getBody(), {
		msg : '后台正在处理中，请稍后....',
		removeMask : true
	});
	myMask.show(); 
	Ext.Ajax.request({
		url : '/realware/queryUserFromDB.do',
		method : 'POST',
		timeout : 180000, // 设置为3分钟
		params : {
			account_code : accountcode
		 },
		// 提交成功的回调函数
		success : function(response, options) {
			 var dto = new Function("return " + response.responseText)();
			 setValue(dto);
			 myMask.hide();

		},
		// 提交失败的回调函数
		failure : function(response, options) {
			failAjax(response, myMask);
			refreshData();
		}
	});
	
}
/**
 * 回显
 * @param obj
 * @return
 */
function setValue(obj) {
	Ext.getCmp("agencyCode").setValue(obj.customno1);
	Ext.getCmp("lino1").setValue(obj.lino1);
	
	Ext.getCmp("uName").setValue(obj.customname1);
//	Ext.getCmp("userNo").setValue(obj.userno);
	Ext.getCmp("passWord").setValue(obj.password);
}

/**
 * 注销
 */
function cancleBuffetCounter() {
	var records = finPanel.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请选中一条操作员信息！");
		return;
	} 
	if (records.length > 1) {
		Ext.Msg.alert("系统提示", "注销只支持单条操作！");
		return;
	} 
	var myMask = new Ext.LoadMask(Ext.getBody(), {
		msg : '后台正在处理中，请稍后....',
		removeMask : true
	});
	
	Ext.Msg.confirm('系统提示','您确定注销此信息', function(e) {
		if (e == "yes") {
			var psw = records[0].get('ukey_code');
			saveDel(psw);
//			var methodName = "delmethod";
//			authorize(methodName,psw);
		}
	});
}
//function editUserPassword(finPanel){
//	pwdWindow.show();
//}
/**
 * 修改操作员属性信息
 */
var required = '<span style="color:red;font-weight:bold" data-qtip="Required">*</span>',editUserWindow;
function editUser(){
	var me = this;
	var records = finPanel.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请选中一条操作员信息！");
		return;
	} 
	if (records.length >1) {
		Ext.Msg.alert("系统提示", "操作员信息更新只支持单条操作！");
		return;
	} 
	var accountcode = records[0].get('accountcode');	
	if (!editUserWindow) {
		editUserWindow = Ext.widget('window', {
			id : "editUserWindow",
			title : '修改',
			bodyStyle : 'overflow-x:hidden;overflow-y:hidden',
			style : {
				'text-align' : 'center'
			},
			closeAction : 'close',
			width : 420,
			height : 280,
			resizable : false,
			modal : true,
			items : Ext.widget('form', {
				id : 'updateForm',
				border : false,
				width : 420,
				bodyPadding : 10,
				fieldDefaults : {
					labelAlign : 'right',
					labelWidth : 110
				},
				items : [ {
//					id : 'userlogincode2',
//					fieldLabel : '操作员编码',
//					width : 340,
//					xtype : 'textfield',
//					disabled : true
//				} ,{
					id : 'signId',
					xtype : 'textfield',
					dataIndex : 'sign_id',
					hidden : true,
					width : 340,
					disabled : true
				},{
					id : 'zeroaccountcode2',
					fieldLabel : '签约账号',
					width : 340,
					xtype : 'textfield',
					disabled : true
//					readOnly:true
				} ,{
					id : 'usercodeBOC',
					xtype : 'textfield',
					fieldLabel : '操作员Id(中行)',
//					afterLabelTextTpl : required,
//					disabled : true,
					width : 340
				} ,{
					id : 'signName2',
					xtype : 'textfield',
					fieldLabel : '操作员姓名',
					afterLabelTextTpl : required,
					width : 340
				} ,{
					id : 'cardType2',
					xtype : 'combo',
					fieldLabel : '操作员证件类型',
					afterLabelTextTpl : required,
					emptyText : '请选择',
					width : 340,
					valueField : 'value',
					editable : false,
					displayField : 'name',
					store : cardStore
				} ,{
					id : 'liNo2',
					xtype : 'textfield',
					fieldLabel : '操作员证件',
					afterLabelTextTpl : required,
					width : 340
				} ,{
					id : 'signPhone2',
					xtype : 'textfield',
					fieldLabel : '操作员电话',
					afterLabelTextTpl : required,
					width : 340
				} ,{
					id : 'signRole2',
					xtype : 'combo',
					fieldLabel : '操作员角色',
					afterLabelTextTpl : required,
					emptyText : '请选择',
					width : 340,
					valueField : 'value',
					editable : false,
					displayField : 'name',
					store : roleStore
				}],
				buttonAlign : 'center',
				buttons : [{
							text : '修改',
							id : 'addNetworkButton2',
							handler : function() {
								//操作员编码
//								var userlogincode = Ext.getCmp("userlogincode2").getValue();
								//单位零余额账号
								var accountcode = Ext.getCmp("zeroaccountcode2").getValue();
								//操作员姓名
								var username = Ext.getCmp("signName2").getValue();
								//操作员证件类型
								var cardType = Ext.getCmp("cardType2").getValue();
								//操作员证件
								var liNo = Ext.getCmp("liNo2").getValue();
								//联系电话
								var signPhone = Ext.getCmp("signPhone2").getValue();
								//角色
								var userRole = Ext.getCmp("signRole2").getValue();
								if(username == "" || username == null){
									Ext.Msg.alert("系统提示", "操作员姓名不能为空");
									return;
								}if(cardType == "" || cardType == null){
									Ext.Msg.alert("系统提示", "操作员证件类型不能为空");
									return;
								}if(liNo == "" || liNo == null){
									Ext.Msg.alert("系统提示", "操作员证件不能为空");
									return;
								}if(signPhone == "" || signPhone == null){
									Ext.Msg.alert("系统提示", "操作员电话不能为空");
									return;
								}if(userRole == "" || userRole == null){
									Ext.Msg.alert("系统提示", "操作员角色不能为空");
									return;
								}
								
								if(!(Ext.getCmp("updateForm").isValid())){
									Ext.Msg.alert("系统提示","录入格式有误,请先查证!");
									return;
								}
								saveForEdit();
//					 			var methodName = "eidtmethod";
//								authorize(methodName);
//								if (this.up('form').getForm().isValid()) {}
							}
						}, {

							text : '取消',
							id : 'canceleditButton',
							handler : function() {
								this.up('form').getForm().reset();
								this.up('window').close();
							}
						} ]
			})
		});
	}
//	Ext.getCmp("userlogincode2").setValue(records[0].get('user_login_code'));
	Ext.getCmp("zeroaccountcode2").setValue(records[0].get('account_code'));
	Ext.getCmp("signName2").setValue(records[0].get('sign_name'));
	Ext.getCmp("liNo2").setValue(records[0].get('paper_no'));
	Ext.getCmp("signPhone2").setValue(records[0].get('phone_no'));
	Ext.getCmp("signRole2").setValue(records[0].get('user_role'));
	Ext.getCmp("signId").setValue(records[0].get('sign_id'));
	Ext.getCmp("usercodeBOC").setValue(records[0].get('user_login_code'));

	Ext.getCmp("cardType2").setValue(records[0].get('user_card_type'));
	editUserWindow.show();
}

/***************************************************************************************************
 * uKEY变更
 */
var required = '<span style="color:red;font-weight:bold" data-qtip="Required">*</span>',editUkeyWindow;
function editUkey(){
	var me = this;
	var records = finPanel.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请选中一条操作员信息！");
		return;
	} 
	if (records.length >1) {
		Ext.Msg.alert("系统提示", "操作员UKEY变更只支持单条操作！");
		return;
	} 
	var accountcode = records[0].get('accountcode');	
	if (!editUkeyWindow) {
		editUkeyWindow = Ext.widget('window', {
			id : "editukWindow",
			title : 'UKey变更',
			bodyStyle : 'overflow-x:hidden;overflow-y:hidden',
			style : {
				'text-align' : 'center'
			},
			closeAction : 'close',
			width : 420,
			height : 245,
			resizable : false,
			modal : true,
			items : Ext.widget('form', {
				id : 'updateukForm',
				border : false,
				width : 420,
				bodyPadding : 10,
				fieldDefaults : {
					labelAlign : 'right',
					labelWidth : 110
				},
				items : [ {
					id : 'userlogincode1',
					fieldLabel : '操作员编码',
					width : 340,
					xtype : 'textfield',
//					afterLabelTextTpl : required,
					disabled : true
				} ,{
					id : 'username1',
					fieldLabel : '单位名称',
					width : 340,
					xtype : 'textfield',
//					afterLabelTextTpl : required,
					disabled : true
				
				} ,{
					id : 'lino3',
					xtype : 'textfield',
					fieldLabel : '营业执照号',
					width : 340,
//					afterLabelTextTpl : required,
					disabled : true
				} ,{
					id : 'ukeycode1',
					fieldLabel : '原UKEY编码',
					width : 340,
					xtype : 'textfield',
//					afterLabelTextTpl : required,
					disabled : true
				} ,{
					id : 'newukeycode',
					fieldLabel : '新UKEY编码',
					width : 340,
					xtype : 'textfield',
					afterLabelTextTpl : required
				}],
				buttonAlign : 'center',
				buttons : [{
							text : '确定',
							id : 'editukButton2',
							handler : function() {
								var methodName = "ukeymethod";
								var ukeycode = Ext.getCmp("newukeycode").getValue();
								if(ukeycode == "" || ukeycode == null){
									Ext.Msg.alert("系统提示", "新UKEY编码不能为空");
									return;
								}
								if(ukeycode.length != 16){
									Ext.Msg.alert("系统提示", "新UKEY编码必须为16位");
									return;
								}
								authorize(methodName);
							}
						}, {

							text : '取消',
							id : 'canceleditukButton',
							handler : function() {
								this.up('form').getForm().reset();
								this.up('window').close();
							}
						} ]
			})
		});
	}
	Ext.getCmp("userlogincode1").setValue(records[0].get('user_login_code'));
	Ext.getCmp("username1").setValue(records[0].get('user_name'));
	Ext.getCmp("lino3").setValue(records[0].get('li_no'));
	Ext.getCmp("ukeycode1").setValue(records[0].get('ukey_code'));
	editUkeyWindow.show();
}
function button1_onclick(print) {
	var uucode = Ext.getCmp("userNo").getValue();
	var uupsw = Ext.getCmp("passWord").getValue();
	if(uucode == null || uucode == ""){
		Ext.Msg.alert("系统提示", "签约信息不能为空");
		return;
	}
	var frame = window.printifame;
	var odoc = frame.document;
	odoc.getElementById("aa").innerHTML = uucode;
	odoc.getElementById("bb").innerHTML = uupsw;
	frame.window.focus();
	frame.window.print();
	if(print){
		Ext.getCmp('createForm').getForm()
		.reset();
		Ext.getCmp("addWindow").close();
	}
	
}
/*******************************
 * 授权
 * @return
 */
function authorize(methodName,psw,logincode){
	var methodName = methodName;
	var returnValue=0;//0表示授权失败，1表示授权成功
	if (psw != null){
		var psw = psw;
	}
	if (logincode != null){
		var logincode = logincode;
	}
	var proInfo = null;
			var me = this;
			var form = Ext.create('Ext.form.Panel', {
						layout : 'absolute',
						defaultType : 'textfield',
						border : false,
						bodyStyle : "background:#DFE9F6",
						items : [{
									fieldLabel : '授权柜员',
									id : "majorUserCode",
									fieldWidth : 40,
									labelWidth : 60,
									msgTarget : 'side',
									allowBlank : false,
									onBlur : onBlurS1,
									x : 5,
									y : 5,
									anchor : '-5' // anchor width by percentage
								}, {
									fieldLabel : '柜员密码',
									id : "txtmajorUserCodePwd",
									fieldWidth : 40,
									labelWidth : 60,
									inputType : 'password',
									msgTarget : 'side',
									minLength : 6,
									maxLength : 6,
									allowBlank : false,
									x : 5,
									y : 35,
									anchor : '-5' // anchor width by percentage
								}],
						dockedItems : [{
									xtype : 'toolbar',
									dock : 'bottom',
									ui : 'footer',
									layout : {
										pack : "end"
									},
									items : [{
												text : "确认",
												width : 80,
												handler : onConfirm,
												scope : me
											}, {
												text : "取消",
												width : 80,
												handler : onCancel,
												scope : me
											}]
								}]
	
					});
			var win = Ext.create('Ext.window.Window', {
						autoShow : true,
						title : '授权',
						width : 300,
						height : 130,
						layout : 'fit',
						plain : true,
						resizable : false,
						items : form
					});
			function onCancel() {
				win.close();
				returnValue=0;
			}
			function onConfirm() {				
				var myMask = new Ext.LoadMask(Ext.getBody(), {
							msg : '后台正在处理中，请稍后....',
							removeMask : true
						});
				myMask.show();
				Ext.Ajax.request({
							url : "/realware/checkUserByPasswordOrFinger.do",
							method : 'POST',
							timeout : 180000, // 设置为3分钟
							params : {
								majorUserCode: Ext.getCmp('majorUserCode').getValue(),
								majorUserCodePwd: Ext.getCmp("txtmajorUserCodePwd").getValue(),
								proInfo : proInfo
							},
							success : function(response, options) {
								returnValue=1;
								myMask.hide();
								win.close();
								if(methodName == "addmethod"){
									saveMsg();
								}else if(methodName == "eidtmethod"){
									saveForEdit();
								}else if(methodName == "ukeymethod"){
									saveForUkey();
								}else if(methodName == "pswmethod"){
									savePsw(psw,logincode);
								}else if(methodName == "delmethod"){
									saveDel(psw);
								}
							},
							failure : function(response, options) {
								failAjax(response, myMask);
								win.close();
								refreshData();
								returnValue=0;
							}
						});
				return returnValue;
			}
			function onBlurS1()
			{
				var myMask = new Ext.LoadMask(Ext.getBody(), {
					msg : '后台正在处理中，请稍后....',
					removeMask : true
				});
				myMask.show();
				Ext.getCmp('txtmajorUserCodePwd').hidden=true;
				Ext.Ajax.request({
					url : "/realware/checkUserByPasswordOrFinger.do",
					method : 'POST',
					timeout : 180000, // 设置为3分钟
					params : {
						majorUserCode: Ext.getCmp('majorUserCode').getValue(),
						onlyCharge : 1,//强制主管授权
						confirmUser:1//1是，0否
					},
					success : function(response, options) {		
						myMask.hide();
						userRole=response.responseText;
						if(userRole.indexOf("0")>-1)
						{
							Ext.getCmp('txtmajorUserCodePwd').disable(true);
							if(userRole!=null&&userRole.indexOf("0")>-1)
							{
								proInfo = fpDevObj.GetFeature(3);
						    	if(proInfo.length<=10)
						    	{
						    		returnValue=0;
						    		Ext.Msg.alert("系统提示", "获取指纹信息失败");
						    		return;
						    	}
							}		
						}
						else
						{
							Ext.getCmp('txtmajorUserCodePwd').enable(false);
						}
						returnValue=1;
					},
					failure : function(response, options) {
						failAjax(response, myMask);
						returnValue=0;
					}
				});
			}
	return returnValue;
}
function saveMsg(){
	//单位零余额账号
	var accountcode = Ext.getCmp("accounTcodeforadd").getValue();
	//客户号
	var agencycode = Ext.getCmp("agencyCode").getValue();
//	//操作员编码
//	var usercode = Ext.getCmp("userNo").getValue();
	// 中行操作员编码
	var usercode_boc = Ext.getCmp("userNoBOC").getValue();
	//UKEY编码
	var ukeycode = Ext.getCmp("uCode").getValue();
	//单位户名
	var username = Ext.getCmp("uName").getValue();
	//操作员姓名signRole
	var signName = Ext.getCmp("signName").getValue();
	//操作员角色
	var signRole = Ext.getCmp("signRole").getValue();
	//证件类型
	var cardType = Ext.getCmp("cardType").getValue();
	//证件号码
	var userLiNo = Ext.getCmp("userLiNo").getValue();
	//电话号码
	var phoneno = Ext.getCmp("phoneNo").getValue();
	//密码
	var passWord = Ext.getCmp("passWord").getValue();
	
	var lino1 = Ext.getCmp("lino1").getValue();
	
	if(ukeycode == null || ukeycode == ""){
		Ext.Msg.alert("系统提示", "UKey编码不能为空！");
		return ;
	}else if(ukeycode == null || signName == ""){
		Ext.Msg.alert("系统提示", "操作员姓名不能为空！");
		return ;
	}else if(signRole == null || signRole == ""){
		Ext.Msg.alert("系统提示", "操作员角色不能为空！");
		return ;
	}else if(cardType == null || cardType == ""){
		Ext.Msg.alert("系统提示", "操作员证件类型不能为空！");
		return ;
	}else if(userLiNo == null || userLiNo == ""){
		Ext.Msg.alert("系统提示", "操作员证件号码不能为空！");
		return ;
	}else if(phoneno == null || phoneno == ""){
		Ext.Msg.alert("系统提示", "操作员电话号码不能为空！");
		return ;
	}
	
//	if ( usercode_boc != null ) {
//		usercode = usercode_boc;
//	}

	var myMask = new Ext.LoadMask(
			Ext.getBody(), {

				msg : '后台正在处理中，请稍后....',
				removeMask : true
			});
	myMask.show();
	Ext.Ajax.request({
		url : '/realware/addusers.do',
		waitMsg : '后台正在处理中,请稍后....',
		timeout : 180000, // 设置为3分钟
		async : false,// 添加该属性即可同步,
		// jsonData : data,
		params : {
			agency_code : agencycode,
			account_code : accountcode,
			user_code : usercode_boc,
			ukey_code : ukeycode,
			user_name : username,
			signName : signName,
			signRole : signRole,
			userLiNo : userLiNo,
			phoneno : phoneno,
			lino1 : lino1,
			cardType : cardType,
			passWord : passWord
		},

		// 提交成功的回调函数
		success : function(response, options) {
//			Ext.PageUtil.succAjax(response, myMask);
			myMask.hide();
			Ext.Msg.show( {
				title : '成功提示',
				msg : "操作员添加成功",
				buttons : Ext.Msg.OK,
				icon : Ext.MessageBox.INFO
			});
			refreshData();
			Ext.getCmp('createForm').getForm()
					.reset();
			Ext.getCmp("addWindow").close();

		},
		// 提交失败的回调函数
		failure : function(response, options) {
			failAjax(response, myMask);
			refreshData();
		}
	});

}
function saveForEdit(){

//	//操作员编码
//	var userlogincode = Ext.getCmp("userlogincode2").getValue();
	//单位零余额账号
	var accountcode = Ext.getCmp("zeroaccountcode2").getValue();
	// 中行操作员Id
	var usercode_boc = Ext.getCmp("usercodeBOC").getValue();
	//操作员姓名
	var username = Ext.getCmp("signName2").getValue();
	//操作员证件类型
	var cardType = Ext.getCmp("cardType2").getValue();
	//操作员证件
	var liNo = Ext.getCmp("liNo2").getValue();
	//联系电话
	var signPhone = Ext.getCmp("signPhone2").getValue();
	//角色
	var userRole = Ext.getCmp("signRole2").getValue();
	// Id
	var signId = Ext.getCmp("signId").getValue();
	if(userRole == "经办员"){
		userRole = 1;
	}else if(userRole == "审核员"){
		userRole = 2;
	}
//	if (usercode_boc != null ) {
//		userlogincode = usercode_boc;
//	}
	var myMask = new Ext.LoadMask(
			Ext.getBody(), {

				msg : '后台正在处理中，请稍后....',
				removeMask : true
			});
	myMask.show();
	Ext.Ajax.request({
		url : '/realware/updateUser.do',
		waitMsg : '后台正在处理中,请稍后....',
		timeout : 180000, // 设置为3分钟
		async : false,// 添加该属性即可同步,
		// jsonData : data,
		params : {
			sign_id : signId,
			userlogincode : usercode_boc,
			user_name : username,
			userLiNo : liNo,
			signPhone:signPhone,
			cardType:cardType,
			userRole : userRole
		},

		// 提交成功的回调函数
		success : function(response, options) {
			succAjax(response, myMask, true);
			Ext.getCmp('updateForm').getForm()
					.reset();
			Ext.getCmp("editUserWindow").close();

		},
		// 提交失败的回调函数
		failure : function(response, options) {
			failAjax(response, myMask);
			refreshData();
		}
	});

}
function saveForUkey(){

	//操作员编码
	var userlogincode = Ext.getCmp("userlogincode1").getValue();
	//单位名称
	var username = Ext.getCmp("username1").getValue();
	//原uKey编码
	var oldukeycode = Ext.getCmp("ukeycode1").getValue();
	//新ukey
	var ukeycode = Ext.getCmp("newukeycode").getValue();
	if(ukeycode == "" || ukeycode == null){
		Ext.Msg.alert("系统提示", "新UKEY编码不能为空");
		return;
	}
	//营业执照号
	var lino = Ext.getCmp("lino3").getValue();
	var myMask = new Ext.LoadMask(
			Ext.getBody(), {

				msg : '后台正在处理中，请稍后....',
				removeMask : true
			});
	myMask.show();
	Ext.Ajax.request({
		url : '/realware/editukey.do',
		waitMsg : '后台正在处理中,请稍后....',
		timeout : 180000, // 设置为3分钟
		async : false,// 添加该属性即可同步,
		// jsonData : data,
		params : {
			userlogincode : userlogincode,
			user_name : username,
			oldukeycode : oldukeycode,
			ukeycode : ukeycode,
			lino : lino
		},

		// 提交成功的回调函数
		success : function(response, options) {
			succAjax(response, myMask, true);
			Ext.getCmp('updateukForm').getForm()
					.reset();
			Ext.getCmp("editukWindow").close();

		},
		// 提交失败的回调函数
		failure : function(response, options) {
			failAjax(response, myMask);
			refreshData();
		}
	});

}

function savePsw(psw,logincode){
	var myMask = new Ext.LoadMask(Ext.getBody(), {
		msg : '后台正在处理中，请稍后....',
		removeMask : true
	});
	var userpsw = psw;
	var userlogincode = logincode;
	 myMask.show(); 
		Ext.Ajax.request({
			url : '/realware/updatePsw.do',
			method : 'POST',
			timeout : 180000, // 设置为3分钟
			 contentType : "application/json",
			 params : {
				userpsw : userpsw,
				userlogincode : userlogincode
			 },
			// 提交成功的回调函数
			success : function(response, options) {
				succAjax(response, myMask, true);
				Ext.Msg.confirm('系统提示','密码更新成功，请放入密码封打印', function(e) {
					if (e == "yes") {
						var frame = window.printifame;
						var odoc = frame.document;
						odoc.getElementById("aa").innerHTML = userlogincode;
						odoc.getElementById("bb").innerHTML = userpsw;
						frame.window.focus();
						frame.window.print();
						printAgain(userlogincode,userpsw);
					}
				})
				
			},
			// 提交失败的回调函数
			failure : function(response, options) {
				failAjax(response, myMask);
				refreshData();
			}
		});

}
function printAgain(userlogincode,userpsw){
	Ext.Msg.confirm('系统提示','是否重新打印密码！', function(e) {
		if (e == "yes") {
			var frame = window.printifame;
			var odoc = frame.document;
			odoc.getElementById("aa").innerHTML = userlogincode;
			odoc.getElementById("bb").innerHTML = userpsw;
			frame.window.focus();
			frame.window.print();
			printAgain(userlogincode,userpsw);
		}
	})
	
}
function saveDel(ukeycode){
	var myMask = new Ext.LoadMask(Ext.getBody(), {
		msg : '后台正在处理中，请稍后....',
		removeMask : true
	});
	 myMask.show(); 
		Ext.Ajax.request({
			url : '/realware/updateAutoSignAccount.do',
			method : 'POST',
			timeout : 180000, // 设置为3分钟
			 contentType : "application/json",
			 params : {
				 "ukey_code" : ukeycode,
				 "tableName":'PB_USER_SIGNZERO_NO'
			 },
			// 提交成功的回调函数
			success : function(response, options) {
				succAjax(response, myMask, true);
			},
			// 提交失败的回调函数
			failure : function(response, options) {
				failAjax(response, myMask);
				refreshData();
			}
		});

}