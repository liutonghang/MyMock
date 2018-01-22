/*
 * 财政零余额维护
*/

/***
 * 引入需要使用的js文件
 */
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/recommend.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/Common_Validate.js"></scr' + 'ipt>');


/**
 * 列表
 */
var gridPanel1 = null;

/**
 * 数据项
 */
var fileds = ["account_id","account_name","account_no","bank_id","bank_code","bank_name"];

/**
 * 列名
 */
var header = "账户名称|account_name|200,账号|account_no|170,网点编码|bank_code|80,网点名称|bank_name|150";
/**
 * 当前用户所属网点是否为主办网点
 */
var isHost = 'false';
/**
 * 界面加载
 */
Ext.require(["Ext.grid.*", "Ext.data.*"]);
Ext.onReady(function() {
	
	Ext.QuickTips.init();
	gridPanel1 = getGrid(loadUrl, header, fileds, true, true);
	gridPanel1.setHeight(document.documentElement.scrollHeight - 88);
	// 根据查询条件检索数据
	gridPanel1.getStore().on('beforeload', function(thiz, options) {
		beforeload(Ext.getCmp("accountOfAbisCoreQuery"), options, Ext.encode(fileds));

	});
	Ext.create('Ext.Viewport', {
		id : 'abisCoreAccountFrame',
		layout : 'fit',
		items : [Ext.create('Ext.panel.Panel', {
			tbar : [{
						id : 'buttongroup',
						xtype : 'buttongroup',
						items : [{
									id : 'addBtn',
									text : '新增',
									iconCls : 'add',
									scale : 'small',
									handler : function() {
										addAbisCoreAccountDialog();
									}
								}, {
									id : 'editBtn',
									text : '修改',
									iconCls : 'edit',
									scale : 'small',
									handler : function() {
										editAbisCoreAccountDialog(gridPanel1);
									}
								}, {
									id : 'deleteBtn',
									text : '删除',
									iconCls : 'delete',
									scale : 'small',
									handler : function() {
										deleteAbisCoreAccountDialog(gridPanel1);
									}
								},{
									id : 'refreshBtn',
									text : '刷新',
									iconCls : 'refresh',
									scale : 'small',
									handler : function() {
										refreshData();
									}
								}]
					}],
			items : [{
				title : "查询区",
				items : gridPanel1,
				tbar : {
					id : 'accountOfAbisCoreQuery',
					xtype : 'toolbar',
					bodyPadding : 8,
					layout : 'hbox',
					defaults : {
						margins : '3 5 0 0'
					},
					items : [{
						id : 'admdivCom',
						fieldLabel : '所属财政',
						xtype : 'combo',
						dataIndex : 'admdiv_code',
						displayField : 'admdiv_name',
						emptyText : '请选择',
						valueField : 'admdiv_code',
						labelWidth : 60,
						width : 160,
						editable : false,
						store : comboAdmdiv,
						value : comboAdmdiv.data.length > 0 ? comboAdmdiv.data.getAt(0).get("admdiv_code") : "",
						listeners : {
							'select' : selectAdmdiv
						}
					},{
						id : 'accountNameField',
						fieldLabel : '账户名称',
						xtype : 'textfield',
						dataIndex : 'account_name',
						labelWidth : 60
					}, {
						id : 'accountNoField',
						fieldLabel : '账号',
						xtype : 'textfield',
						dataIndex : 'account_no',
						labelWidth : 30
					}]
				}
			}]
		})]
	});
	
	selectAdmdiv();
});

function selectAdmdiv() {
	//setBtnVisible(Ext.getCmp("admdivCom").getValue(), Ext.getCmp("buttongroup"));
	refreshData();
}


function refreshData() {
	gridPanel1.getStore().loadPage(1);
}

/*
***************************ABIS内核户添加*************************************************
*/

function addAbisCoreAccountDialog(){

	var addAbisCoreAccountDialog = new Ext.FormPanel({
		id:'AabisCoreForm',  
	    labelWidth: 75,
	    frame:true,
	    bodyStyle:'padding:5px 5px 0',
	    width: 350,
	    defaults: {width: 300},
	    defaultType: 'textfield',
			items : [ {
					xtype: 'panel',
					border: 0,
					width: 350,
					layout: 'hbox',
					bodyStyle: "background:#DFE9F6;padding:0px 0px 5px 0px",
					hidden:isHost=='true'?false:true//,
					/*items: [{
						id: 'AadmdivZeroAccountBankCode',
						xtype: 'textfield',
						fieldLabel: '所属网点',
						readOnly: 'true',
						msgTarget: 'side',
						allowBlank: false,
						value: ''
					}, {
						id: 'btn_bank_code_Admdiv_add',
						xtype: 'button',
						text: '查询',
						iconCls : 'log',
						handler: function(){
							choseBank('AadmdivZeroAccountBankCode');
						}
						}]*/
					},{
							id: 'AabisCoreAdmdivCode',
							xtype: 'combo',
							fieldLabel: '所属财政',
							dataIndex: 'admdivCode',
							displayField: 'admdiv_name',
							emptyText: '请选择',
							valueField: 'admdiv_code',
							allowBlank: false,
							editable: false,
							value : comboAdmdiv.data.length > 0 ? comboAdmdiv.data.getAt(0).get("admdiv_code") : "",
							store: comboAdmdiv
						},{
							fieldLabel : '账户名称',
							id :'AabisCoreAccountName',
							vtype:"accountName",
							allowBlank : false
						},{
							fieldLabel : '账号',
							id :'AabisCoreAccountNo',
							vtype:"accountId",
							allowBlank : false
						}
					],
			buttons: [
						{
	                  	  text: '确定',
	                      handler: function() {
							if(this.up("form").getForm().isValid()){ 
								addAbisCoreAccount(this.up('window'));
								Ext.getCmp('AabisCoreForm').getForm().reset();
								this.up('window').close();
							}
	                   	 }
	              	   },
					   {
	                     text: '取消',
	                     handler: function() {
	                     	this.up('window').close();
	                     }
	                   }]
		});
	
	var dialog=Ext.widget('window', {
		title : '添加账户',
		width : 350,
		autoHeight:true,
		layout : 'fit',
		resizable : false,
		modal : true,
		items : [ addAbisCoreAccountDialog ]
	}).show();
}

function addAbisCoreAccount(win){
	var myMask = new Ext.LoadMask(Ext.getBody(), {
			msg : '后台正在处理中，请稍后....',
			removeMask : true // 完成后移除
		});
	myMask.show();
	// 提交到服务器操作
	Ext.Ajax.request({
		url : 'addAbisCoreAccount.do',  
        method: 'POST',
		timeout:180000,  //设置为3分钟
		params : {
			account_name : Ext.getCmp('AabisCoreAccountName').getValue(), 
			account_no : Ext.getCmp('AabisCoreAccountNo').getValue(),
			admdivCode : Ext.getCmp('AabisCoreAdmdivCode').getValue()
		},
		// 提交成功的回调函数
		success : function(response, options) {
			succAjax(response,myMask);
			refreshData();
		},
		// 提交失败的回调函数
		failure : function(response, options) {
			failAjax(response,myMask);
			refreshData();
		}
	});
}




/****************************ABIS内核户修改*************************************************/

function editAbisCoreAccountDialog(gridPanel) {

	// 当前选中的数据
	var e_recordsr = gridPanel.getSelectionModel().getSelection();
	if (e_recordsr.length != 1) {
		Ext.Msg.alert("系统提示", "请选择一条数据！");
		return;
	}
	accountId = e_recordsr[0].get("account_id");
	//设置网点信息
	bankid = e_recordsr[0].get("bank_id");
	
	var editBankAccountDialog = new Ext.FormPanel({
		id : 'EabisCoreForm',
		labelWidth : 75,
		frame : true,
		bodyStyle : 'padding:5px 5px 0',
		width : 350,
		defaults : {
			width : 300
		},
		defaultType : 'textfield',
		items : [{
				xtype: 'panel',
				border: 0,
				width: 350,
				layout: 'hbox',
				bodyStyle: "background:#DFE9F6;padding:0px 0px 5px 0px",
				hidden:isHost=='true'?false:true,
				items: [{
					id: 'EabisCoreAbisCode',
					xtype: 'textfield',
					fieldLabel: '所属网点',
//					readOnly: 'true',
					disabled : true,
					msgTarget: 'side',
					allowBlank: false,
					value: e_recordsr[0].get("bank_code")
				}]
				},{
					fieldLabel : '账户名称',
					id : 'EabisCoreAccountName',
					value : e_recordsr[0].get("account_name"),
					vtype:"accountName",
					allowBlank : false
				}, {
					fieldLabel : '账号',
					id : 'EabisCoreAccountNo',
					disabled : true,
					value : e_recordsr[0].get("account_no")
				}],
		buttons : [{
			text : '确定',
			handler : function() {
				if(this.up("form").getForm().isValid()){
					editAbisCoreAccount(this.up('window'));
					Ext.getCmp('EabisCoreForm').getForm().reset();
					this.up('window').close();
				}
			}
		}, {
			text : '取消',
			handler : function() {
				this.up('window').close();
			}
		}]
	});

	var win1 = Ext.widget('window', {
				title : '修改账户',
				width : 350,
				autoHeight:true,
				layout : 'fit',
				resizable : false,
				modal : true,
				items : [editBankAccountDialog]
			}).show();
}

function editAbisCoreAccount(win) {
	var myMask = new Ext.LoadMask(Ext.getBody(), {
			msg : '后台正在处理中，请稍后....',
			removeMask : true // 完成后移除
		});
	myMask.show();
	// 提交到服务器操作
	Ext.Ajax.request({
				url : 'editAbisCoreAccount.do',
        		method: 'POST',
				timeout:180000,  //设置为3分钟
				params : {
					account_name : Ext.getCmp('EabisCoreAccountName').getValue(),
					account_id :accountId,
					account_no : Ext.getCmp('EabisCoreAccountNo').getValue(),
					bankid : bankid

				},
				// 提交成功的回调函数
				success : function(response, options) {
					succAjax(response, myMask,true);
					refreshData();
				},
				// 提交失败的回调函数
				failure : function(response, options) {
					failAjax(response, myMask);
					refreshData();
				}
			});
}

/******************************************* 删除ABIS内核户*********************************************************/
function deleteAbisCoreAccountDialog(gridPanel){
	// 请求开始时，都先把selIds置空
	selIds = "";
	selNos = "";
	// 当前选中的数据
	var d_recordsr = gridPanel.getSelectionModel().getSelection();

	if (d_recordsr.length == 0) {
		Ext.Msg.alert("系统提示", "请至少选择一条数据！");
		return;
	}
	// 选中的凭证的id数组，要传到后台
	for (var i = 0; i < d_recordsr.length; i++) {
		selIds += d_recordsr[i].get("account_id");
		selNos += d_recordsr[i].get("account_no");
		if (i < d_recordsr.length - 1){
			selIds += ",";
			selNos += ",";
		}
			
	}
	
	Ext.MessageBox.confirm('删除提示', '是否确定删除 '+selNos+' 等账号？', delAbisCoreAcount);
}

/*
 * **************************ABIS内核户删除*************************************************
 */

function delAbisCoreAcount(id) {
	if(id == "yes"){
		var myMask = new Ext.LoadMask(Ext.getBody(), {
			msg : '后台正在处理中，请稍后....',
			removeMask : true
				// 完成后移除
			});
		myMask.show();
		// 提交到服务器操作
		Ext.Ajax.request({
				url : 'delAbisCoreAccount.do',
        		method: 'POST',
				timeout:180000,  //设置为3分钟
				params : {
					selIds : selIds,
					selNos : selNos
				},
				// 提交成功的回调函数
				success : function(response, options) {
					succAjax(response,myMask);
					refreshData();
				},
				// 提交失败的回调函数
				failure : function(response, options) {
					failAjax(response,myMask);
					refreshData();
				}
		});
	}
}

/** ******************************************************************************** */


