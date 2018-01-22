/** 
* 自助柜面-短信签约用户维护
 */
document.write('<script type="text/javascript" src="/realware/resources/js/share/gridPanel.js"></script>');
document.write('<script type="text/javascript" src="/realware/resources/js/share/json2String.js"></script>');
document.write('<script type="text/javascript" src="/realware/resources/js/share/listView.js"></script>');
document.write('<script type="text/javascript" src="/realware/resources/js/share/menuBtnStatus.js"></script>');

/**
 * 数据项
 */
var fileds = [ "sign_id", "agency_code", "user_login_code","account_code", "ukey_code", "sign_name","phone_no","user_role","paper_no","li_no","user_name","user_card_type" ];

/**
 * 列名
 */
var header = "操作员编码|user_login_code|150,签约账号|account_code|160,操作员姓名|sign_name|100,操作员电话|phone_no|150,操作员证件类型|user_card_type|180,操作员证件号|paper_no|180,单位名称|user_name,客户号|agency_code|120,营业执照号|li_no|180";
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
				}, {
					id : 'setPsw',
					text : '重置密码',
					iconCls : 'refresh',
					scale : 'small',
					handler : function() {
					resetPsw();
					}
				}, {
					id : 'secondSend',
					text : '重发短信',
					iconCls : 'refresh',
					scale : 'small',
					handler : function() {
						secondSend();
					}
				}, {
					id : 'logOff',
					text : '注销',
					iconCls : 'invalid',
					scale : 'small',
					handler : function() {
						cancelSignMessage();
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
	if ("1" == taskState) {
		Ext.getCmp('logOff').enable(false);
		Ext.getCmp('edit').enable(false);
		Ext.getCmp('setPsw').enable(false);
		Ext.getCmp('secondSend').enable(false);
	}else if ("0" == taskState) {
		Ext.getCmp('logOff').disable(false);
		Ext.getCmp('edit').disable(false);
		Ext.getCmp('setPsw').disable(false);
		Ext.getCmp('secondSend').disable(false);
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
					var agencycode = records[0].get('agency_code');
					var accountcode = records[0].get('account_code');
					var phoneno = records[0].get('phone_no');
					savePsw(userpsw,userlogincode);
					sendUserMessage(agencycode,accountcode,userlogincode,phoneno,userpsw);
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
			height : 380,
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
						afterLabelTextTpl : required,
						regex:/^[0-9a-zA-Z]{0,32}$/,
					    regexText:"账号输入格式错误,请输入数字,字母最大长度32.",
					    msgTarget:"side"
					}, {
						id : 'queryButton',
						style : 'margin-left:5px',
						text : '查询',
						xtype : 'button',
						width : 35,
						handler: function() {
							var accountcode = Ext.getCmp("accounTcodeforadd").getValue();
							if(/^[0-9a-zA-Z]{0,32}$/.test(accountcode)){
								queryUser(accountcode);
							}else{
								Ext.Msg.alert("系统提示","签约账户只允许输入字母和数字,最大长度32");
							}
							
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
				},{
					id : 'userNo',
					xtype : 'textfield',
					dataIndex : 'user_no',
					fieldLabel : '操作员编码',
					width : 340,
					disabled : true,
					allowBlank : false
				}/*, {
					id : 'uCode',
					xtype : 'textfield',
					dataIndex : 'ukey_code',
					fieldLabel : 'UKEY编码',
					afterLabelTextTpl : required,
					width : 340
				}*/, {
					id : 'signName',
					xtype : 'textfield',
					dataIndex : 'sign_name',
					fieldLabel : '操作员姓名',
					afterLabelTextTpl : required,
					width : 340,
					regex:/^([\u4e00-\u9fa5\.]){0,30}$/,
					regexText:"只能输入中文，点，长度最大为30.",
					msgTarget:"side"
					
				}/*, {
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
				}*/, {
					id : 'cardType',
					xtype : 'combo',
					fieldLabel : '操作员证件类型',
					afterLabelTextTpl : required,
					emptyText : '请选择',
					width : 340,
					valueField : 'value',
					displayField : 'name',
					editable : false,
					store : cardStore,
					listeners :{select : function(combo, record,index){ 
						var val = record[0].get("value");
						var o = Ext.getCmp("userLiNo");
						if(val==1){
							o.regex = /^(\d{15}$|^\d{18}$|^\d{17}(\d|X|x))$/;
							o.regexText="证件格式错误,长度不能超过18位";
						}else{
							o.regex = /^([\u4e00-\u9fa5a-zA-Z0-9_-]){0,30}$/;
							o.regexText="证件格式错误,不能包含特殊字符,长度不超过30";
						}
						o.focus();
					}}
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
					width : 340,
					regex : /^1[3,5,8,7]\d{9}$/,
					regexText: "只能录入手机号码，由11位数字组成",
					msgTarget:"side"

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
								var usercode = Ext.getCmp("userNo").getValue();
								//UKEY编码
							//	var ukeycode = Ext.getCmp("uCode").getValue();
								//单位户名
								var username = Ext.getCmp("uName").getValue();
								//操作员姓名signRole
								var signName = Ext.getCmp("signName").getValue();
								//操作员角色
							//	var signRole = Ext.getCmp("signRole").getValue();
								//证件类型
								var cardType = Ext.getCmp("cardType").getValue();
								//证件号码
								var userLiNo = Ext.getCmp("userLiNo").getValue();
								//电话号码
								var phoneno = Ext.getCmp("phoneNo").getValue();
								var lino1 = Ext.getCmp("lino1").getValue();
								
								if(accountcode == null || accountcode == ""){
									Ext.Msg.alert("系统提示", "签约账号不能为空！");
									return ;
								}
								if(agencycode == null || agencycode == ""){
									Ext.Msg.alert("系统提示", "请先查询客户信息！");
									return ;
								}
								/*if(ukeycode == null || ukeycode == ""){
									Ext.Msg.alert("系统提示", "UKey编码不能为空！");
									return ;
								}else*/ if(signName == null || signName == ""){
									Ext.Msg.alert("系统提示", "操作员姓名不能为空！");
									return ;
								}/*else if(signRole == null || signRole == ""){
									Ext.Msg.alert("系统提示", "操作员角色不能为空！");
									return ;
								}*/else if(cardType == null || cardType == ""){
									Ext.Msg.alert("系统提示", "操作员证件类型不能为空！");
									return ;
								}else if(userLiNo == null || userLiNo == ""){
									Ext.Msg.alert("系统提示", "操作员证件号码不能为空！");
									return ;
								}else if(phoneno == null || phoneno == ""){
									Ext.Msg.alert("系统提示", "操作员电话号码不能为空！");
									return ;
								}
								
								if(!(Ext.getCmp("createForm").isValid())){
									Ext.Msg.alert("系统提示", "录入格式有误，请先查证！");
									return ;
								}
								
								
								saveMsg(accountcode, agencycode, usercode, username, signName, cardType, userLiNo, phoneno, lino1);
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
	Ext.getCmp("userNo").setValue(obj.userno);
	Ext.getCmp("passWord").setValue(obj.password);
}
/**
 * 重发短信
 */
function secondSend() {
	var records = finPanel.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请选中一条操作员信息！");
		return;
	} 
	if (records.length > 1) {
		Ext.Msg.alert("系统提示", "重发短信只支持单条操作！");
		return;
	} 
	var myMask = new Ext.LoadMask(Ext.getBody(), {
		msg : '后台正在处理中，请稍后....',
		removeMask : true
	});
	
//	Ext.Msg.confirm('系统提示','您确定注销此信息', function(e) {
//		if (e == "yes") {
			var sign_id = records[0].get('sign_id');
			myMask.show();
			Ext.Ajax.request( {
				url : "/realware/secondSendMessage.do",
				method : 'POST',
				timeout : 180000, // 设置为3分钟
				params : {
					sign_id : sign_id
				},
				success : function(response, options) {
					succAjax(response, myMask, true);
				},
				failure : function(response, options) {
					failAjax(response, myMask);
					refreshData();
				}
			});
//		}
//	});
}
/**
 * 注销
 */
function cancelSignMessage() {
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
			var sign_id = records[0].get('sign_id');
			myMask.show();
			Ext.Ajax.request( {
				url : "/realware/cancelSignMessage.do",
				method : 'POST',
				timeout : 180000, // 设置为3分钟
				params : {
					sign_id : sign_id
				},
				success : function(response, options) {
					succAjax(response, myMask, true);
				},
				failure : function(response, options) {
					failAjax(response, myMask);
					refreshData();
				}
			});
		}
	});
}

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
					id : 'userlogincode2',
					fieldLabel : '操作员编码',
					width : 340,
					xtype : 'textfield',
					disabled : true
				} ,{
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
					id : 'signName2',
					xtype : 'textfield',
					fieldLabel : '操作员姓名',
					afterLabelTextTpl : required,
					width : 340,
					regex:/^([\u4e00-\u9fa5\.]){0,30}$/,
					regexText:"只能输入中文，点，长度最大为30.",
					msgTarget:"side"
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
					store : cardStore,
					listeners :{select : function(combo, record,index){ 
						var val = record[0].get("value");
						var o = Ext.getCmp("liNo2");
						if(val==1){
							o.regex = /^(\d{15}$|^\d{18}$|^\d{17}(\d|X|x))$/;
							o.regexText="证件格式错误,长度不能超过18位";
						}else{
							o.regex = /^([\u4e00-\u9fa5a-zA-Z0-9_-]){0,30}$/;
							o.regexText="证件格式错误,不能包含特殊字符,长度不超过30";
						}
						o.focus();
					}}
					
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
					width : 340,
					regex : /^1[3,5,8,7]\d{9}$/,
					regexText: "只能录入手机号码，由11位数字组成",
					msgTarget:"side"
				}/* ,{
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
				}*/],
				buttonAlign : 'center',
				buttons : [{
							text : '修改',
							id : 'addNetworkButton2',
							handler : function() {
								//操作员编码
								var userlogincode = Ext.getCmp("userlogincode2").getValue();
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
								//var userRole = Ext.getCmp("signRole2").getValue();
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
								}/*if(userRole == "" || userRole == null){
									Ext.Msg.alert("系统提示", "操作员角色不能为空");
									return;
								}*/
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
	Ext.getCmp("userlogincode2").setValue(records[0].get('user_login_code'));
	Ext.getCmp("zeroaccountcode2").setValue(records[0].get('account_code'));
	Ext.getCmp("signName2").setValue(records[0].get('sign_name'));
	Ext.getCmp("liNo2").setValue(records[0].get('paper_no'));
	Ext.getCmp("signPhone2").setValue(records[0].get('phone_no'));
//	Ext.getCmp("signRole2").setValue(records[0].get('user_role'));
	Ext.getCmp("signId").setValue(records[0].get('sign_id'));

	Ext.getCmp("cardType2").setValue(records[0].get('user_card_type'));
	editUserWindow.show();
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

function saveMsg(accountcode, agencycode, usercode, username, signName, cardType, userLiNo, phoneno, lino1){

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
		account_code : accountcode,
			agency_code : agencycode,
			user_code : usercode,
			user_name : username,
			signName : signName,
			cardType : cardType,
			userLiNo : userLiNo,
			phoneno : phoneno,
			lino1 : lino1
		},

		// 提交成功的回调函数
		success : function(response, options) {
			myMask.hide();
			sendUserMessage(agencycode,accountcode,usercode,phoneno,passWord);
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

	//操作员编码
	var userlogincode = Ext.getCmp("userlogincode2").getValue();
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
//	var userRole = Ext.getCmp("signRole2").getValue();
	// Id
	var signId = Ext.getCmp("signId").getValue();
//	if(userRole == "经办员"){
//		userRole = 1;
//	}else if(userRole == "审核员"){
//		userRole = 2;
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
			userlogincode : userlogincode,
			user_name : username,
			userLiNo : liNo,
			signPhone:signPhone,
		//	userRole : userRole,
			cardType:cardType
			
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
/**
 * 发送短信
 * @param agencycode
 * @param accountcode
 * @param usercode
 * @param phoneno
 * @param passWord
 */
function sendUserMessage(agencycode,accountcode,usercode,phoneno,passWord){
	var myMask = new Ext.LoadMask(Ext.getBody(), {
		msg : '后台正在处理中，请稍后....',
		removeMask : true
	});
	 myMask.show(); 
		Ext.Ajax.request({
			url : '/realware/sendUserMessage.do',
			method : 'POST',
			timeout : 180000, // 设置为3分钟
			 contentType : "application/json",
			 params : {
				agency_code : agencycode,
				account_code : accountcode,
				user_code : usercode,
				phoneno : phoneno,
				passWord : passWord
			 },
			// 提交成功的回调函数
			success : function(response, options) {
				myMask.hide();
				refreshData();
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
				});
				
			},
			// 提交失败的回调函数
			failure : function(response, options) {
				failAjax(response, myMask);
				refreshData();
			}
		});

}

//add by tian yanqing 检测给定字段值（包含中文长度）是否超出最大长度
function checkName(obj,len){
	var value = obj.value;
	var zw=value.match(/[^x00-xff]/g);
	if(""==value){
		return ;
	}
	var zwlen = zw==null?0:zw.length;
	var valLen = value.length+zwlen;
	if(valLen>len){
		obj.regex=/^([.]){0,len}$/;
		obj.regexText="输入的内容超过最大长度，最大长度为："+len+"，注：汉字长度为2";
	}else{
		obj.regex=/^([\u4e00-\u9fa5\.]){0,30}$/;
		obj.regexText="只能输入中文，点，长度最大为"+len+".";
	}
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
	});
	
}
