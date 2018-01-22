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
var fileds = [ "sign_id", "agency_code", "account_code", "ukey_code",
		"user_name", "document_type", "paper_no", "phone_no", "address",
		"e_mail", "cis_valide" ];

/**
 * 列名
 */
var header = "单位编码|agency_code,单位零余额账号|account_code,UKEY编码|ukey_code,用户名|user_name,证件类型|document_type,"
		+ "证件号码|paper_no,电话号码|phone_no,联系地址|address,电子邮箱地址|e_mail";

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
/**
 * 界面加载
 */
Ext.onReady(function() {
	Ext.QuickTips.init();
	if (finPanel == null) {
		finPanel = getGrid(loadUrl, header, fileds, true, true);
		finPanel.setHeight(document.documentElement.scrollHeight - 88);
		
//		var jsonStr = [];
//		jsonStr[0] = "=";
//		jsonStr[1] = '1';
//		jsonMap = jsonMap + "\"cis_valide\":" + Ext.encode(jsonStr) + ",";
		// 查询条件
		var jsonStr = [];
		finPanel.getStore().on('beforeload',function(thiz, options) {
					var jsonMap = "";
					var taskState = Ext.getCmp('taskState').getValue();
					var accountcode = Ext.getCmp('accountcode').getValue();
					var documenttype = Ext.getCmp('documenttype').getValue();
					var paperno = Ext.getCmp('paperno').getValue();
					
					if(taskState != 3){
						//var jsonStr = [];
						jsonStr[0] = "=";
						jsonStr[1] = taskState;
						jsonMap = jsonMap + "\"cis_valide\":" + Ext.encode(jsonStr)
								+ ",";
					} 
					if ("" != accountcode && null != accountcode) {
//						var jsonStr = [];
						jsonStr[0] = "like";
						jsonStr[1] = accountcode;
						jsonMap = jsonMap + "\"account_code\":"
								+ Ext.encode(jsonStr) + ",";
					}
					if ("" != documenttype && null != documenttype) {
						//var jsonStr = [];
						jsonStr[0] = "=";
						jsonStr[1] = documenttype;
						jsonMap = jsonMap + "\"document_type\":"
								+ Ext.encode(jsonStr) + ",";
					}
					if ("" != paperno && null != paperno) {
						//var jsonStr = [];
						jsonStr[0] = "=";
						jsonStr[1] = paperno;
						jsonMap = jsonMap + "\"paper_no\":"
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
						id : 'documenttype',
						fieldLabel : '证件类型',
						xtype : 'textfield'
					}, {
						id : 'paperno',
						fieldLabel : '证件号码',
						xtype : 'textfield'
					} ]
				}
			} ]
		}) ]
	});

	setBtnVisible(null, Ext.getCmp("buttongroup"));
	refreshData();
});
/** 
 *  选择条件
 */
function selectEnabledStore() {
	var taskState = Ext.getCmp("taskState").getValue();
	var addButton = Ext.getCmp("addZero");
	var logOff = Ext.getCmp('logOff');
	var refreshButton = Ext.getCmp('refreshButton');
	
	if ("0" == taskState  ) {
		 addButton.show();
		 logOff.show();
	} 
	if ("1" == taskState) {
		addButton.show();
		logOff.show();
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
 * 新增 账户
 */
var required = '<span style="color:red;font-weight:bold" data-qtip="Required">*</span>', createWindow;
function addBuffetCounter() {
	if (!createWindow) {
		createWindow = Ext.widget('window', {
			id : "addWindow",
			title : '新增',
			bodyStyle : 'overflow-x:hidden;overflow-y:hidden',
			style : {
				'text-align' : 'center'
			},
			closeAction : 'hide',
			width : 320,
			height : 380,
			resizable : false,
			modal : true,
			items : Ext.widget('form', {
				id : 'createForm',
				border : false,
				width : 320,
				bodyPadding : 20,
				fieldDefaults : {
					labelAlign : 'right',
					labelWidth : 100
				},
				items : [ {
					id : 'agencyCode',
					xtype : 'textfield',
					dataIndex : 'agency_code',
					fieldLabel : '单位编码',
					afterLabelTextTpl : required,
					allowBlank : false
				}, {
					id : 'accounTcode',
					xtype : 'textfield',
					dataIndex : 'account_code',
					fieldLabel : '单位零余额账号',
					afterLabelTextTpl : required,
					allowBlank : false
				}, {
					id : 'uCode',
					xtype : 'textfield',
					dataIndex : 'ukey_code',
					fieldLabel : 'UKEY编码',
					afterLabelTextTpl : required,
					allowBlank : false
				}, {
					id : 'uName',
					xtype : 'textfield',
					dataIndex : 'user_name',
					fieldLabel : '用户名',
					afterLabelTextTpl : required,
					allowBlank : false
				}, {
					id : 'dType',
					xtype : 'textfield',
					dataIndex : 'document_type',
					fieldLabel : '证件类型',
					afterLabelTextTpl : required,
					allowBlank : false
				}, {
					id : 'pNo',
					xtype : 'textfield',
					dataIndex : 'account_type_code',
					fieldLabel : '证件号码',
					afterLabelTextTpl : required,
					allowBlank : false
				}, {
					id : 'phoneNo',
					xtype : 'textfield',
					fieldLabel : '电话号码',
					allowBlank : true
				}, {
					id : 'address',
					xtype : 'textfield',
					fieldLabel : '联系地址',
					allowBlank : true
				}, {
					id : 'eMail',
					xtype : 'textfield',
					fieldLabel : '电子邮箱地址',
					allowBlank : true
				} ],
				buttonAlign : 'center',
				buttons : [
						{
							text : '添加',
							id : 'addNetworkButton',
							handler : function() {
								if (this.up('form').getForm().isValid()) {
									var agencycode = Ext.getCmp("agencyCode")
											.getValue();
									var accountcode = Ext.getCmp("accounTcode")
											.getValue();
									var ukeycode = Ext.getCmp("uCode")
											.getValue();
									var username = Ext.getCmp("uName")
											.getValue();
									var document = Ext.getCmp("dType")
											.getValue();
									var paperno = Ext.getCmp("pNo").getValue();
									var phoneno = Ext.getCmp("phoneNo")
											.getValue();
									var address = Ext.getCmp("address")
											.getValue();
									var email = Ext.getCmp("eMail").getValue();

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
											ukey_code : ukeycode,
											user_name : username,
											document_type : document,
											paper_no : paperno,
											phone_no : phoneno,
											address : address,
											e_mail : email
										},

										// 提交成功的回调函数
										success : function(response, options) {
											succAjax(response, myMask, true);
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
							}
						}, {

							text : '取消',
							id : 'cancelBuffetCounterButton',
							handler : function() {
								this.up('form').getForm().reset();
								this.up('window').close();
							}
						} ]
			})
		});
	}
	createWindow.show();
}

/**
 * 注销
 */
function cancleBuffetCounter() {
	var records = finPanel.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请选中一条网点信息！");
		return;
	} 
	var myMask = new Ext.LoadMask(Ext.getBody(), {
		msg : '后台正在处理中，请稍后....',
		removeMask : true
	});
	
	Ext.Msg.confirm('系统提示','您确定注销此信息', function(e) {
		if (e == "yes") {
			 myMask.show(); 
			 var jsonArray = [];
				if (!Ext.isEmpty(records[0].get('ukey_code'))) { jsonArray.push(records[0].get('ukey_code')); }
				Ext.Ajax.request({
					url : '/realware/updateAutoSignAccount.do',
					method : 'POST',
					timeout : 180000, // 设置为3分钟
					 contentType : "application/json",
					 params : {
						 "ukey_code" : records[0].get('ukey_code')			 
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
	});
}
function editUserPassword(finPanel){
	pwdWindow.show();
}
