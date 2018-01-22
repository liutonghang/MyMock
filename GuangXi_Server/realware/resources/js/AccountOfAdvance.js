/*
 * 垫支户维护
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
var comboFundType =null;

/**
 * 数据项
 */
var fileds = ["account_name","account_no","account_type_code","bank_code","bank_name","admdiv_code","create_date","is_valid","account_id"]; 

/**
 * 列名
 */
var header = "账户名称|account_name|200,账号|account_no|170,账户类型|account_type_code|120,网点编码|bank_code|80,网点名称|bank_name|150,"
		+ "所属财政|admdiv_code|150,创建时间|create_date|100,是否有效|is_valid|60";

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
		beforeload(Ext.getCmp("accountofAdvanceQuery"), options, Ext.encode(fileds));
	});
	Ext.create('Ext.Viewport', {
		id : 'agentAccountFrame',
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
												addAdvanceAgentDialog();
											}
										}, {
											id : 'editBtn',
											text : '修改',
											iconCls : 'edit',
											scale : 'small',
											handler : function() {
												editAdvanceAgentDialog(gridPanel1);
											}
										}, {
											id : 'deleteBtn',
											text : '删除',
											iconCls : 'delete',
											scale : 'small',
											handler : function() {
												deleteAdvanceAgentDialog(gridPanel1);
											}
										}, {
											id : 'cancleBtn',
											text : '注销',
											iconCls : 'cancle',
											hidden : true,
											scale : 'small',
											handler : function() {

											}
										},{
											id : 'queryBalanceBtn',
											text : '余额查询',
											iconCls : 'log',
											scale : 'small',
											hidden:false,
											handler : function() {
												queryBalanceForm(gridPanel1);
											}
										},{
											id : 'inputBtn',
											text : '导入',
											iconCls : 'input',
											hidden : true,
											scale : 'small',
											handler : function() {

											}
										}, {
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
							id : 'accountofAdvanceQuery',
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
								editable : false,
								store : comboAdmdiv,
								value : comboAdmdiv.data.length > 0
										? comboAdmdiv.data.getAt(0).get("admdiv_code")
										: "",
								listeners : {
									'select' :  function(){
													selectAdmdiv(true);
												}
								}
							}, {
								id : 'accountNameField',
								fieldLabel : '账户名称',
								xtype : 'textfield',
								dataIndex : 'account_name',
								labelWidth : 60,
								symbol:'like'
							}, {
								id : 'accountNoField',
								fieldLabel : '账号',
								xtype : 'textfield',
								dataIndex : 'account_no',
								labelWidth : 30
							}, {
								id : 'accountTypeCode',
								xtype : 'combo',
								fieldLabel : '账户类型',
								dataIndex : 'account_type_code',
								displayField : 'accont_type_name',
								emptyText : '请选择',
								valueField : 'account_type_code',
								labelWidth : 60,
//								editable : false,
								store : comboAccountType
							}]
						}
					}]
				})]
	});
	 var is_valid = Ext.getCmp("is_valid");
	 is_valid.renderer = function(value){
	    if(value=='1'){
	    	return '有效';
	    }else{
	    	return '无效';
	    }
	 };
	 var account_type = Ext.getCmp("account_type_code");
	 account_type.renderer = function(value){
	    if(value=='21'){
	    	return '直接支付垫支户';
	    }else if(value=='22'){
	    	return '授权支付垫支户';
	    }else if(value=='210'){
	    	return '直接支付退款垫支户';
	    }else if(value=='220'){
	    	return '授权支付退款垫支户';
	    }
	 };
	 var admdiv_code = Ext.getCmp("admdiv_code");
	          admdiv_code.renderer = function(value){
	               for(var i=0;i<comboAdmdiv.data.length;i++){
	                  if(value == comboAdmdiv.data.getAt(i).get("admdiv_code")){
	                     return comboAdmdiv.data.getAt(i).get("admdiv_name");
	                  }
	               }
	          };
	selectAdmdiv(true);
});

function selectAdmdiv(refresh,id) {
	if(refresh == true){
		refreshData();
	}
}

/**
 * 零余额账户余额查询
 */
function queryBalanceForm(gridPanel){
	var accountNo = "";
	var d_recordsr = gridPanel.getSelectionModel().getSelection();
	if (d_recordsr.length == 0 || d_recordsr.length > 1) {
		Ext.Msg.alert("系统提示", "请选择一个账户！");
		return;
	}
	accountNo = d_recordsr[0].get("account_no");
	var queryBalanceByZero  = new Ext.FormPanel({
		id:'queryBalanceZeroForm',
	    labelWidth: 300,
	    frame:true,
	    bodyStyle:'padding:5px 5px 0',
	    width: 300,
	    defaults: {width: 280},
	    defaultType: 'textfield',
			items : [ 
						{
							fieldLabel : '账号',
							id :'accountNoByQuery',
							labelWidth:50,
							readOnly : true,
							value:accountNo
						},{
							fieldLabel : '余额',
							id :'balanceByAccountNo',
							readOnly : true,
							labelWidth:50
						}
					],
			buttons: [
						{
						  id:'query',
	                  	  text: '查询',
	                      handler: function() {
						  	if( Ext.isEmpty ( Ext.getCmp('accountNoByQuery').getValue() )){
								Ext.Msg.alert("系统提示", "账号不能为空！");
							}else{
								queryBalance(this.up('window'));
								Ext.getCmp("queryBalanceZeroForm").getForm().reset();
								//this.up('window').close();
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
		title : '余额查询',
		width : 300,
		height : 140,
		layout : 'fit',
		resizable : false,
		modal : true,
		items : [ queryBalanceByZero ]
	}).show();
}


function queryBalance(win){
	Ext.getCmp('query').disable(false);
	Ext.Ajax.request({
		url : 'queryBalanceByZeroAccount.do',
        method: 'POST',
		timeout:180000,  //设置为3分钟
		params : {
			accountNo : Ext.getCmp('accountNoByQuery').getValue(),
			admdivCode : Ext.getCmp('admdivCom').getValue(),
			accountTypeCode : ''
		},
		// 提交成功的回调函数
		success : function(response, options) {
			Ext.getCmp('query').enable(false);
			var json = (new Function("return " + response.responseText))();
			Ext.getCmp("balanceByAccountNo").setValue(json.amt);
		},
		// 提交失败的回调函数
		failure : function(response, options) {
			Ext.Msg.show({
					title : '失败提示',
					msg : response.responseText,
					buttons : Ext.Msg.OK,
					icon : Ext.MessageBox.ERROR
				});
		}
	});
}


function refreshData() {
	gridPanel1.getStore().load();
//	Ext.getCmp('accountNameField').setValue("");
//	Ext.getCmp('accountNoField').setValue("");
//	Ext.getCmp('accountTypeCode').setValue("");
} 