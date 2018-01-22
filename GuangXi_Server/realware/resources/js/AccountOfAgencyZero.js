/*
 * 单位零余额账户维护
*/

/***
 * 引入需要使用的js文件
 */
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/recommend.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/Account_Add.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/Account_Del.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/Account_Edit.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/AccountSyn.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/importFile.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/Account_Cancle.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/Common_Validate.js"></scr' + 'ipt>');
/**
 * 列表
 */
var gridPanel1 = null;

/**
 * 数据项
 */
var fileds = ["account_id","account_name","account_no","agency_code","agency_name","bank_id","bank_code","bank_name","admdiv_code","finance_name","finance_phone","create_date","is_valid","amount"]; 

/**
 * 列名
 */
var header = "账户名称|account_name|200,账号|account_no|170,单位编码|agency_code|120,单位名称|agency_name|120,网点编码|bank_code|120,网点名称|bank_name|200,"
		+ "所属财政|admdiv_code|150,财务人员名称|finance_name|150,财务人员电话号码|finance_phone|150,创建时间|create_date|100,余额|amount|100";
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
		var admdiv = Ext.getCmp('admdivCom').getValue();
		if ("" == admdiv || null == admdiv)
			return;
		beforeload(Ext.getCmp("accountOfAgencyZeroQuery"), options, Ext.encode(fileds));
		
		//checkIsHost();
	});
	Ext.create('Ext.Viewport', {
		id : 'agencyZeroAccountFrame',
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
									hidden : false,
									handler : function() {
										addAgencyZeroAccountDialog();
									}
								}, {
									id : 'addBtnCQBOC',
									text : '新增',
									iconCls : 'add',
									scale : 'small',
									hidden : true,
									handler : function() {
										addAgencyZeroAccountDialogCQBOC();
									}
								},{
									id : 'editBtn',
									text : '修改',
									iconCls : 'edit',
									scale : 'small',
									handler : function() {
										editAgencyZeroAccountDialog(gridPanel1);
									}
								}, {
									id : 'deleteBtn',
									text : '删除',
									iconCls : 'delete',
									scale : 'small',
									handler : function() {
										deleteAgencyZeroAccountDialog(gridPanel1);
									}
								}, {
									id : 'cancleBtn',
									text : '注销',
									iconCls : 'cancle',
									hidden : true,
									scale : 'small',
									handler : function() {
										cancleAgencyZeroAccountDialog(gridPanel1);
									}
								}, 
									{
									id : 'synBtn',
									text : '同步',
									iconCls : 'add',
									hidden : true,
									scale : 'small',
									handler : function() {
										sysFromBank();
									}
								}, {
									id : 'inputBtn',
									text : '导入',
									iconCls : 'import',
									hidden : false,
									scale : 'small',
									handler : function() {
										importFile(importUrl, 'txt',  Ext.getCmp('admdivCom').getValue());
									}
								},  {
									id : 'queryBalanceBtn',
									text : '余额查询',
									iconCls : 'log',
									scale : 'small',
									hidden:false,
									handler : function() {
											queryBalanceForm(gridPanel1);
									}
								},{
									id : 'refreshBtn',
									text : '刷新',
									iconCls : 'refresh',
									scale : 'small',
									handler : function() {
										refreshData();
									}
								},{
									id : 'synchroBtn',
									text : '同步余额',
									iconCls : 'add',
									scale : 'small',
									handler : function() {
										synchroZeroAmount(gridPanel1);
									}
								}
							]
					}],
			items : [{
				title : "查询区",
				items : gridPanel1,
				tbar : {
					id : 'accountOfAgencyZeroQuery',
					xtype : 'toolbar',
					bodyPadding : 8,
					layout : 'column',
					defaults : {
						margins : '3 5 0 0'
					},
					items : [{
						id : 'admdivCom',
						fieldLabel : '所属财政',
						xtype : 'combo',
						displayField : 'admdiv_name',
						dataIndex :  'admdiv_code',
						emptyText : '请选择',
						valueField : 'admdiv_code',
						labelWidth : 55,
						editable : false,
						store : comboAdmdiv,
						value : comboAdmdiv.data.length > 0 ? comboAdmdiv.data
								.getAt(0).get("admdiv_code") : "",
						listeners : {
							'select' : selectAdmdiv
						}
					}, {
						id : 'accountNameField',
						fieldLabel : '账户名称',
						xtype : 'textfield',
						symbol : 'like',
						dataIndex : 'account_name',
						value : '',
						labelWidth : 55
					}, {
						id : 'accountNoField',
						fieldLabel : '账号',
						xtype : 'textfield',
						dataIndex : 'account_no',
						labelWidth : 30,
						value : ''
					}, {
						id : 'agencyCodeField',
						fieldLabel : '单位编码',
						xtype : 'textfield',
						dataIndex : 'agency_code',
						labelWidth : 55,
						value : ''
					}, {
						id : 'agencyBank_code',
						fieldLabel : '网点编码',
						xtype : 'textfield',
						symbol : '=',
						dataIndex : 'bank_code',
	//					hidden : isHost=='true'?false:true,
						labelWidth : 55,
						value : ''
					},{
						id : 'agencyBank_name',
						fieldLabel : '网点名称',
						xtype : 'textfield',
						symbol : 'like',
						dataIndex : 'bank_name',
	//					hidden : isHost=='true'?false:true,
						labelWidth : 55,
						value : ''
					}]

				}
			}]
		})]
	});
	
	var admdiv_code = Ext.getCmp("admdiv_code");
	          admdiv_code.renderer = function(value){
	               for(var i=0;i<comboAdmdiv.data.length;i++){
	                  if(value == comboAdmdiv.data.getAt(i).get("admdiv_code")){
	                     return comboAdmdiv.data.getAt(i).get("admdiv_name");
	                  }
	               }
	          };

	selectAdmdiv();
	
});

function selectAdmdiv() {
	//setBtnVisible(Ext.getCmp("admdivCom").getValue(), Ext.getCmp("buttongroup"));
	refreshData();
}


function refreshData() {
	gridPanel1.getStore().load();
}


function checkIsHost(){
	Ext.Ajax.request({
	   url: 'isHost.do',
	   method:'GET',
	   success: function(response, options){
	   		isHost = response.responseText;
			//如果不是主办网点，则不提供网点过滤
			if('false' == isHost)
				Ext.getCmp("agencyBank_code").hide();
	   },
	   failure: function(){
	   	Ext.Msg.alert('警告', '初始化异常，请重新加载！'); 
	   }
	});
}

/**
 * 同步零余额金额
 */
function synchroZeroAmount(gridPanel1){
	var d_recordsr = gridPanel1.getSelectionModel().getSelection();

	if (d_recordsr.length == 0) {
		Ext.Msg.alert("系统提示", "请至少选择一条数据！");
		return;
	}
	var ids = "";
	// 选中的凭证的id数组，要传到后台
	for (var i = 0; i < d_recordsr.length; i++) {
		ids += d_recordsr[i].get("account_id");
		if (i < d_recordsr.length - 1){
			ids += ",";
		}
	}
	var myMask = new Ext.LoadMask(Ext.getBody(), {
			msg : '后台正在处理中，请稍后....',
			removeMask : true // 完成后移除
		});
	myMask.show();
	Ext.Ajax.request({
		url : 'synchroZeroAmount.do',
        method: 'POST',
		timeout:180000,  //设置为3分钟
		params : {
			selIds : ids,
			admdivCode : Ext.getCmp('admdivCom').getValue()
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

function addAgencyZeroAccountDialogCQBOC(){

	var addAgencyZeroAccountDialog = new Ext.FormPanel({
		id:'AagencyZeroForm',
	    frame:true,
	    bodyStyle:'padding:5px 5px 0 5px',
		defaultType: 'textfield',
		items: [{
				xtype: 'panel',
				border: 0,
				width: 350,
				layout: 'hbox',
				bodyStyle: "background:#DFE9F6;padding:0px 0px 5px 0px",
				items: [{
					id: 'AagencyZeroAccountNo',
					fieldLabel: '账号',
					//modify by cyq 2015/1/6  增加账号长度验证
					vtype:"accountId",
					width: 256,
					xtype: 'textfield',
					allowBlank : false
				},{
					id: 'btn_Agency_add',
					xtype: 'button',
					text: '查询',
					iconCls : 'log',
					handler: function(){
					var accountcode = Ext.getCmp("AagencyZeroAccountNo").getValue();
//					   queryAccount(accountcode,'/realware/queryUserByZeroAccountcode.do');
					queryAccount(accountcode,'/realware/checkZeroAccountcode.do');
					}
				}]
				}, {
					id: 'AagencyZeroAccountName',
					fieldLabel: '账户名称',
					vtype:"accountName",
					allowBlank : false
					
				},  {
					id: 'AagencyZeroAdmdivCode',
					xtype: 'combo',
					fieldLabel: '所属财政',
					dataIndex: 'admdivCode',
					displayField: 'admdiv_name',
					emptyText: '请选择',
					valueField: 'admdiv_code',
					allowBlank: false,
					editable: false,
					store: comboAdmdiv
				}, {
					id: 'AagencyZeroAgencyCode',
					fieldLabel: '单位编码',
					vtype:"commonId",
					allowBlank : false
						
				},  {
					id: 'AagencyZeroAgencyName',
					allowBlank: false,
					fieldLabel: '单位名称',
					vtype:"commonName",
					allowBlank : false
				}, {
					id: 'AagencyZeroIsValid',
					xtype: 'checkbox',
					fieldLabel: '是否有效',
					checked: true
				}],
			buttons: [
						{
	                  	  text: '确定',
	                      handler: function() {
	                    	if (this.up('form').getForm().isValid()) { 
								if(Ext.getCmp('AagencyZeroIsValid').getValue() == true){
									a_is_valid = "1";
								}
								addAgencyZeroAccountCQBOC(this.up('window'));
								Ext.getCmp("AagencyZeroForm").getForm().reset();
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
		items : [ addAgencyZeroAccountDialog ]
	}).show();
	
	/**
	 * 查询账户信息
	 */
	function queryAccount(accountcode,url){
		if(accountcode == null || accountcode == ""){
			Ext.Msg.alert("系统提示", "查询账号为空！");
			return;
		}
		var myMask = new Ext.LoadMask(Ext.getBody(), {
			msg : '后台正在处理中，请稍后....',
			removeMask : true
		});
		myMask.show(); 
		Ext.Ajax.request({
			url : url,
			method : 'POST',
			timeout : 180000, // 设置为3分钟
			params : {
				account_code : accountcode
			 },
			// 提交成功的回调函数
			success : function(response, options) {
				 checkQuery = 1;
				 myMask.hide();
				 var json = (new Function("return " + response.responseText +";"))();
//				 Ext.getCmp("accountname1").setValue(json.acct_name);
				 Ext.getCmp("AagencyZeroAccountName").setValue(json.custom_name);
//				 Ext.Msg.alert('系统提示', response.responseText);
			},
			// 提交失败的回调函数
			failure : function(response, options) {
				checkQuery = 0;
				 myMask.hide();
				 Ext.Msg.alert('系统提示', response.responseText);
			}
		});
		
	}
	/**
	 * 新增单位零余额账号
	 * @param win
	 * @return
	 */
	function addAgencyZeroAccountCQBOC(win){
		var myMask = new Ext.LoadMask(Ext.getBody(), {
				msg : '后台正在处理中，请稍后....',
				removeMask : true // 完成后移除
			});
		myMask.show();
		// 提交到服务器操作
		Ext.Ajax.request({
			url : 'addZeroAccountCQBOC.do',
	        method: 'POST',
			timeout:180000,  //设置为3分钟
			params : {
				account_name : Ext.getCmp('AagencyZeroAccountName').getValue(), 
				account_no : Ext.getCmp('AagencyZeroAccountNo').getValue(),
				is_valid : a_is_valid,
				admdiv_code : Ext.getCmp('AagencyZeroAdmdivCode').getValue(),
				agency_code : Ext.getCmp('AagencyZeroAgencyCode').getValue(),
				agency_name : Ext.getCmp('AagencyZeroAgencyName').getValue(),
				bankid : bankid,
				account_type_code: '12'
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
