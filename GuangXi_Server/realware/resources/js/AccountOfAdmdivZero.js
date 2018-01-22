/*
 * 财政零余额维护
*/

/***
 * 引入需要使用的js文件
 */
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/recommend.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/Account_Add.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/Account_Del.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/Account_Edit.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/Common_Validate.js"></scr' + 'ipt>');


/**
 * 列表
 */
var gridPanel1 = null;

/**
 * 数据项
 */
var fileds = ["account_id","account_name","account_no","bank_id","bank_code","bank_name","admdiv_code","create_date","is_valid"];

/**
 * 列名
 */
var header = "账户名称|account_name|200,账号|account_no|170,网点编码|bank_code|80,网点名称|bank_name|150,"
			+ "所属财政编码|admdiv_code|150,创建时间|create_date|100";
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
		beforeload(Ext.getCmp("accountOfAdmdivZeroQuery"), options, Ext.encode(fileds));
		
		checkIsHost();
	});
	Ext.create('Ext.Viewport', {
		id : 'admidvZeroAccountFrame',
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
										addAdmdivZeroAccountDialog();
									}
								},{
									id : 'addBtnCQBOC',
									text : '新增',
									iconCls : 'add',
									scale : 'small',
									hidden : true,
									handler : function() {
										addAdmdivZeroAccountDialogCQBOC();
									}
								}, {
									id : 'editBtn',
									text : '修改',
									iconCls : 'edit',
									scale : 'small',
									handler : function() {
										editAdmdivZeroAccountDialog(gridPanel1);
									}
								}, {
									id : 'deleteBtn',
									text : '删除',
									iconCls : 'delete',
									scale : 'small',
									handler : function() {
										deleteAdmdivZeroAccountDialog(gridPanel1);
									}
								}, {
									id : 'cancleBtn',
									text : '注销',
									iconCls : 'cancle',
									hidden : true,
									scale : 'small',
									handler : function() {

									}
								}, {
									id : 'inputBtn',
									text : '导入',
									iconCls : 'input',
									hidden : true,
									scale : 'small',
									handler : function() {

									}
								}, {
									id : 'queryBalanceBtn',
									text : '余额查询',
									iconCls : 'log',
									hidden:false,
									scale : 'small',
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
								}]
					}],
			items : [{
				title : "查询区",
				items : gridPanel1,
				tbar : {
					id : 'accountOfAdmdivZeroQuery',
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
					}, {
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
					}/*, {//仅能看到自己网点的账户
						id : 'agencyBank_code',
						fieldLabel : '所属网点',
						xtype : 'textfield',
						dataIndex : 'bank_code',
//						hidden : isHost=='true'?false:true,
						labelWidth : 55,
						value : ''
					}*/]
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
	gridPanel1.getStore().load();
}

function checkIsHost(){
	Ext.Ajax.request({
	   url: '/realware/isHost.do',
	   method:'GET',
	   success: function(response, options){
	   		isHost = response.responseText;
			//如果不是主办网点，则不提供网点过滤
			if('false' == isHost) {
				if(Ext.getCmp("agencyBank_code")) {
					Ext.getCmp("agencyBank_code").hide();
				}
			}
	   },
	   failure: function(){
	   	Ext.Msg.alert('警告', '初始化异常，请重新加载！'); 
	   }
	});
}


function addAdmdivZeroAccountDialogCQBOC(){

	var addAdmdivZeroAccountDialog = new Ext.FormPanel({
		id:'AadmdivZeroForm',
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
				items: [{
					id: 'AadmdivZeroAccountNo',
					fieldLabel: '账号',
					vtype:"accountId",
					width: 256,
					xtype: 'textfield',
					allowBlank : false
				},{
					id: 'btn_query_Account',
					xtype: 'button',
					text: '查询',
					iconCls : 'log',
					handler: function(){
					var accountcode = Ext.getCmp("AadmdivZeroAccountNo").getValue();
//					   queryAccount(accountcode,'/realware/queryUserByZeroAccountcode.do');
					queryAccount(accountcode,'/realware/checkZeroAccountcode.do');
					}
				}]
					},{
							fieldLabel : '账户名称',
							id :'AadmdivZeroAccountName',
							vtype:"accountName",
							allowBlank : false
						},{
							id :'AadmdivZeroAdmdivCode',
							xtype : 'combo',
							fieldLabel : '所属财政',
							dataIndex : 'admdivCode',
							displayField: 'admdiv_name',
							emptyText: '请选择',
							valueField: 'admdiv_code',
							allowBlank : false,
							editable :false,							
							store: comboAdmdiv
						},{
							xtype : 'checkbox',
							fieldLabel : '是否有效',
							id :'AadmdivZeroIsValid',
							checked : true,
							hidden : true
						}
					],
			buttons: [
						{
	                  	  text: '确定',
	                      handler: function() {
							if(this.up("form").getForm().isValid()){ 
								if(Ext.getCmp('AadmdivZeroIsValid').getValue() == true){
									a_is_valid = "1";
								}
								addAdmidvZeroAccountCQBOC(this.up('window'));
								Ext.getCmp('AadmdivZeroForm').getForm().reset();
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
		items : [ addAdmdivZeroAccountDialog ]
	}).show();
}

/**
 * 新增财政零余额账号
 * @param win
 * @return
 */
function addAdmidvZeroAccountCQBOC(win){
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
			account_name : Ext.getCmp('AadmdivZeroAccountName').getValue(), 
			account_no : Ext.getCmp('AadmdivZeroAccountNo').getValue(),
			admdiv_code : Ext.getCmp('AadmdivZeroAdmdivCode').getValue(),
			bankid : bankid,
			is_valid : a_is_valid,
			account_type_code :'11'
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
//			 Ext.getCmp("accountname1").setValue(json.acct_name);
			 Ext.getCmp("AadmdivZeroAccountName").setValue(json.custom_name);
//			 Ext.Msg.alert('系统提示', response.responseText);
		},
		// 提交失败的回调函数
		failure : function(response, options) {
			checkQuery = 0;
			 myMask.hide();
			 Ext.Msg.alert('系统提示', response.responseText);
		}
	});
	
}
