/** 
* 自助柜面- 零余额账户签约
 */
document.write('<script type="text/javascript" src="/realware/resources/js/share/gridPanel.js"></script>');
document.write('<script type="text/javascript" src="/realware/resources/js/share/json2String.js"></script>');
document.write('<script type="text/javascript" src="/realware/resources/js/share/listView.js"></script>');
document.write('<script type="text/javascript" src="/realware/resources/js/share/menuBtnStatus.js"></script>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/impFile.js"></scr' + 'ipt>');

/**
 * 数据项
 */
var fileds = [ "admdiv_code", "dep_pro_code", "dep_pro_name","dep_id", "account_no","account_name","cust_id"];

/**
 * 列名
 */
var header = "财政编码|admdiv_code,预算单位编码|dep_pro_code|150,预算单位名称|dep_pro_name,机构号|dep_id,单位账号|account_no,账户名称|account_name,B2B客户号|cust_id";

var finPanel = null;
/**
 * 本地数据源
 */
var comboEnabledStore = Ext.create('Ext.data.Store', {
	fields : ['name', 'value'],
	data : [{
				"name" : "已签约",
				"value" : 1
			},{
				"name" : "已作废",
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
		// 查询条件
		var jsonStr = [];
		finPanel.getStore().on('beforeload',function(thiz, options) {
					var jsonMap = "and 1=1";
					var admdivCode =  Ext.getCmp('admdiv').getValue();
					var taskState = Ext.getCmp('taskState').getValue();
					var accountcode = Ext.getCmp('accountcode1').getValue();
					var usersCode = Ext.getCmp('userscode').getValue();
					options.params = [];
					options.params["admdivCode"] = admdivCode;
					options.params["taskState"] = taskState;
					options.params["accountcode"] = accountcode;
					options.params["usersCode"] = usersCode;
					options.params["filedNames"] = JSON.stringify(fileds);
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
					id : 'addZeroNoPro',
					text : '添加',
					iconCls : 'add',
					scale : 'small',
					handler : function() {
						addZeroNoPro();
					}
				}, {
					id : 'edit',
					text : '修改',
					iconCls : 'edit',
					scale : 'small',
					handler : function() {
						editZeroNoPro();
					}
				},{
					id : 'delete',
					text : '删除',
					iconCls : 'invalid',
					scale : 'small',
					handler : function() {
						removeZeroNoPro();
					}
				},{
					id : 'logoff',
					text : '作废',
					iconCls : 'invalid',
					scale : 'small',
					handler : function() {
						invalidOrEnable(0);
					}
				},{
					id : 'logon',
					text : '启用',
					iconCls : 'edit',
					scale : 'small',
					handler : function() {
						invalidOrEnable(1);
					}
				},{
					id : 'import',
					text : '导入',
					iconCls : 'import',
					scale : 'small',
					handler : function() {
						importFile("/realware/importZeroNoProForCCB.do","xlsx");
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
					items : [{
						id : 'admdiv',
						fieldLabel : '所属财政',
						xtype : 'combo',
						dataIndex : 'admdiv_code',
						displayField : 'admdiv_name',
						emptyText : '请选择',
						valueField : 'admdiv_code',
						labelWidth : 53,
						editable : false,
						store : comboAdmdiv,
						value : comboAdmdiv.data.length > 0
									? comboAdmdiv.data.getAt(0).get("admdiv_code")
									: "",
						listeners : {
							'select' : selectAdmdiv
						}
					},{
						id : 'taskState',
						fieldLabel : '状态',
						xtype : 'combo',
						displayField : 'name',
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
						id : 'accountcode1',
						fieldLabel : '单位零余额账号',
						xtype : 'textfield'
					}, {
						id : 'userscode',
						fieldLabel : '客户号',
						xtype : 'textfield'
					} ]
				}
			} ]
		}) ]
	});

	selectEnabledStore();
});
/** 
 *  选择条件
 */
function selectEnabledStore() {
	var taskState = Ext.getCmp("taskState").getValue();

	if ("1" == taskState  ) {
		Ext.getCmp('logoff').setVisible(true);
		Ext.getCmp('edit').setVisible(true);
		Ext.getCmp('addZeroNoPro').setVisible(true);
		//Ext.getCmp('logon').setVisible(false);
	} 
	if ("0" == taskState) {
		Ext.getCmp('logoff').setVisible(false);
		Ext.getCmp('edit').setVisible(false);
		Ext.getCmp('addZeroNoPro').setVisible(false);
		//Ext.getCmp('logon').setVisible(true);
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

function selectAdmdiv() {
	refreshData();
}

/**
 * 添加零余额账户信息
 * @return
 */
var addZeroProWindow = null;
function addZeroNoPro(){
	var me = this;
	if (!addZeroProWindow) {
		addZeroProWindow = Ext.widget('window', {
			id : "addWindow",
			title : '签约',
			bodyStyle : 'overflow-x:hidden',
			style : {
				'text-align' : 'center'
			},
			closeAction : 'close',
			width : 400,
			height : 150,
			autoScroll:true,
			resizable : false,
			modal : true,
			items : Ext.widget('form', {
				id : 'addForm',
				border : false,
				bodyPadding : 10,
				fieldDefaults : {
					labelAlign : 'right',
					labelWidth : 110
				},
				items : [{
					id : 'accountNo',
					xtype : 'textfield',
					dataIndex : 'account_no',
					fieldLabel : '单位账号',
					allowBlank: false,
					width : 340
				} ,{
					id : 'custId',
					xtype : 'textfield',
					dataIndex : 'cust_id',
					fieldLabel : 'B2B客户号',
					allowBlank: false,
					width : 340
				} ],
				buttonAlign : 'center',
				buttons : [{
							text : '添加',
							id : 'addNetworkButton1',
							handler : function() {
								if(this.up('form').getForm().isValid()){
								//保存
									saveMsg();
									this.up('window').close();
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
	addZeroProWindow.show();
}

/**
 * 删除签约帐号
 */
function removeZeroNoPro(){
	var records = finPanel.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请至少选中一条网点信息！");
		return;
	}
		Ext.Msg.confirm('系统提示','是否永久删除，不可恢复', function(e) {
		if (e == "yes") {
					var jsonMap = '[';
					Ext.Array.each(records, function(model) {
						// 验证是否都已补录行号
						var account_no = model.get('account_no');
						var cust_id = model.get('cust_id');
						jsonMap += '{\'account_no\':\''
								+ account_no
								+ '\',\'cust_id\':\'' + cust_id
								+ '\'},';
					});
					var myMask = new Ext.LoadMask(
						Ext.getBody(), {
				
							msg : '后台正在处理中，请稍后....',
							removeMask : true
						});
					myMask.show();
						Ext.Ajax.request({
					url : '/realware/removeZeronoproForCCB.do',
					waitMsg : '后台正在处理中,请稍后....',
					timeout : 180000, // 设置为3分钟
					async : false,// 添加该属性即可同步,
					// jsonData : data,
					params : {
						jsonMap : jsonMap.substring(0,jsonMap.length - 1) + ']'
					},

					// 提交成功的回调函数
					success : function(response, options) {
						succAjax(response, myMask, true);
						refreshData();
					},
					// 提交失败的回调函数
						failure : function(response, options) {
							failAjax(response, myMask);
							
						}
					});
		}
	});

}
/**
 * 更新账号属性信息
 */
var editZeroProWindow = null;
function editZeroNoPro(){
	var me = this;
	var records = finPanel.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请选中一条网点信息！");
		return;
	} 
	if (records.length >1) {
		Ext.Msg.alert("系统提示", "网点信息更新只支持单条操作！");
		return;
	} 
	if (!editZeroProWindow) {
		editZeroProWindow = Ext.widget('window', {
			id : "editWindow",
			title : '更新',
			bodyStyle : 'overflow-x:hidden;overflow-y:hidden',
			style : {
				'text-align' : 'center'
			},
			oriAccountNo: '',
			oriCustId : '',
			closeAction : 'close',
			width : 420,
			height : 280,
			resizable : false,
			modal : true,
				items : Ext.widget('form', {
				id : 'updateForm',
				border : false,
				bodyPadding : 10,
				fieldDefaults : {
					labelAlign : 'right',
					labelWidth : 110
				},
				items : [{
					id : 'admdivCode2',
					xtype : 'textfield',
					dataIndex : 'admdiv_code',
					fieldLabel : '财政编码',
					disabled : true,
					allowBlank: false,
					width : 340
				} ,{
					id : 'depProCode2',
					xtype : 'textfield',
					dataIndex : 'dep_pro_code',
					fieldLabel : '预算单位编码',
					allowBlank: false,
					width : 340
				} ,{
					id : 'depProName2',
					xtype : 'textfield',
					dataIndex : 'dep_pro_name',
					fieldLabel : '预算单位名称',
					allowBlank: true,
					width : 340
				} ,{
					id : 'depId2',
					xtype : 'textfield',
					dataIndex : 'dep_id',
					fieldLabel : '机构号',
					width : 340
				} ,{
					id : 'accountNo2',
					xtype : 'textfield',
					dataIndex : 'account_no',
					fieldLabel : '单位账号',
					allowBlank: false,
					width : 340
				} ,{
					id : 'accountName2',
					xtype : 'textfield',
					dataIndex : 'account_name',
					fieldLabel : '账户名称',
					allowBlank: false,
					width : 340
				} ,{
					id : 'custId2',
					xtype : 'textfield',
					dataIndex : 'cust_id',
					fieldLabel : 'B2B客户号',
					allowBlank: false,
					width : 340
				} ],
				buttonAlign : 'center',
				buttons : [{
							text : '更新',
							id : 'updateNetworkButton',
							handler : function() {
								if (this.up('form').getForm().isValid()) {
									var myMask = new Ext.LoadMask(
											Ext.getBody(), {
												msg : '后台正在处理中，请稍后....',
												removeMask : true
											});
									myMask.show();
									Ext.Ajax.request({
										url : '/realware/editZeronoproForCCB.do',
										waitMsg : '后台正在处理中,请稍后....',
										timeout : 180000, // 设置为3分钟
										async : false,// 添加该属性即可同步,
										params : {
											oriAccountNo: editZeroProWindow.oriAccountNo,
											oriCustId : editZeroProWindow.oriCustId,
											admdivCode : Ext.getCmp("admdivCode2").getValue(),
											depProCode : Ext.getCmp("depProCode2").getValue(),
											depProName : Ext.getCmp("depProName2").getValue(),
											depId : Ext.getCmp("depId2").getValue(),
											accountNo : Ext.getCmp("accountNo2").getValue(),
											accountName : Ext.getCmp("accountName2").getValue(),
											custId : Ext.getCmp("custId2").getValue()
										},

										// 提交成功的回调函数
										success : function(response, options) {
											succAjax(response, myMask, true);
											Ext.getCmp('editWindow').close();

										},
										// 提交失败的回调函数
										failure : function(response, options) {
											failAjax(response, myMask);
											this.up('window').close();
											refreshData();
										}
									});
								}
							}
						}, {

							text : '取消',
							id : 'canceleditButton',
							handler : function() {
//								this.up('form').getForm().reset();
								this.up('window').close();
							}
						} ]
			})
		});
	}
	Ext.getCmp("admdivCode2").setValue(records[0].get('admdiv_code'));
	Ext.getCmp("depProCode2").setValue(records[0].get('dep_pro_code'));
	Ext.getCmp("depProName2").setValue(records[0].get('dep_pro_name'));
	Ext.getCmp("depId2").setValue(records[0].get('dep_id'));
	Ext.getCmp("accountNo2").setValue(records[0].get('account_no'));
	Ext.getCmp("accountName2").setValue(records[0].get('account_name'));
	Ext.getCmp("custId2").setValue(records[0].get('cust_id'));
	editZeroProWindow.oriAccountNo = records[0].get('account_no');
	editZeroProWindow.oriCustId = records[0].get('cust_id');
	editZeroProWindow.show();
}


/**
 * 更改状态
 * 作废0
 * 启用1
 */
function invalidOrEnable(status){
	var records = finPanel.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请选中一条网点信息！");
		return;
	} 
	var jsonMap = '[';
		Ext.Array.each(records, function(model) {
			// 验证是否都已补录行号
			var account_no = model.get('account_no');
			var cust_id = model.get('cust_id');
			jsonMap += '{\'account_no\':\''
					+ account_no
					+ '\',\'cust_id\':\'' + cust_id
					+ '\'},';
		});
		var myMask = new Ext.LoadMask(
			Ext.getBody(), {
				msg : '后台正在处理中，请稍后....',
				removeMask : true
			});
		myMask.show();
			Ext.Ajax.request({
		url : '/realware/invalidZeronoproForCCB.do',
		waitMsg : '后台正在处理中,请稍后....',
		timeout : 180000, // 设置为3分钟
		async : false,// 添加该属性即可同步,
		params : {
			jsonMap : jsonMap.substring(0,jsonMap.length - 1) + ']',
			status : status

		},
		// 提交成功的回调函数
		success : function(response, options) {
			succAjax(response, myMask, true);
			refreshData();
		},
		// 提交失败的回调函数
			failure : function(response, options) {
				failAjax(response, myMask);
				
			}
		});
	
}

function saveMsg(){

	//财政编码
	var admdivCode = Ext.getCmp("admdiv").getValue();
	//单位账号
	var accountNo = Ext.getCmp("accountNo").getValue();
	//客户号
	var custId = Ext.getCmp("custId").getValue();
	
	var myMask = new Ext.LoadMask(
			Ext.getBody(), {

				msg : '后台正在处理中，请稍后....',
				removeMask : true
			});
	myMask.show();
	Ext.Ajax.request({
		url : '/realware/addzeronoproForCCB.do',
		waitMsg : '后台正在处理中,请稍后....',
		timeout : 180000, // 设置为3分钟
		async : false,// 添加该属性即可同步,
		// jsonData : data,
		params : {
			admdivCode : admdivCode,
			accountNo : accountNo,
			custId : custId
		},

		// 提交成功的回调函数
		success : function(response, options) {
			succAjax(response, myMask, true);
			Ext.getCmp('addForm').getForm()
					.reset();
		},
		// 提交失败的回调函数
		failure : function(response, options) {
			failAjax(response, myMask);
			refreshData();
		}
	});

}
