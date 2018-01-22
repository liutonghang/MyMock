/***
 * 引入需要使用的js文件
 */
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/recommend.js"></scr' + 'ipt>');

/**
 * 列表
 */
var gridPanel1 = null;

/**
 * 数据项
 */
var fileds = ["id","custom_no","acct_no","relate_accno","relate_acc_name","open_unit_name","account_status","account_type","currency","balance_amount"]; 

/**
 * 列名
 */
var header = "客户号|custom_no|200,零余额账号|acct_no|170,关联账号|relate_accno|120,关联账号户名|relate_acc_name|120,开户单位|open_unit_name|120,账户状态|account_status|200,"
		+ "账户类型|account_type|150,货币类型|currency|100,余额|balance_amount|100";


/**
 * 界面加载
 */
Ext.require(["Ext.grid.*", "Ext.data.*"]);
Ext.onReady(function() {
	Ext.QuickTips.init();
	gridPanel1 = getGrid(loadUrl, header, fileds, true, true);
	gridPanel1.setHeight(document.documentElement.scrollHeight - 88);
	
	Ext.create('Ext.Viewport', {
		id : 'RelationAccountFrame',
		layout : 'fit',
		items : [{
			xtype : 'panel',
			layout : 'fit',
			tbar : [{
				id : 'addBtn',
				text : '新增',
				iconCls : 'add',
				scale : 'small',
				handler : function() {
					addRelationAccountDialog();
				}
			}, {
				id : 'deleteBtn',
				text : '删除',
				iconCls : 'delete',
				scale : 'small',
				handler : function() {
					deleteRelationAccountDialog(gridPanel1);
				}	
			}, {
				id : 'refreshBtn',
				text : '刷新',
				iconCls : 'refresh',
				scale : 'small',
				handler : function() {
					refreshData();
				}
			}],
			items: gridPanel1
		}]
	});
	
	refreshData();
});

function refreshData() {
	gridPanel1.getStore().load();
}

function addRelationAccountDialog(){
	var addRelationAccountDialog = new Ext.FormPanel({
		id:'RelationAccountForm',
	    frame:true,
	    bodyStyle:'padding:5px 5px 0 5px',
		defaultType: 'textfield',
		items: [{
				xtype: 'panel',
				border: 0,
				width: 350,
				layout: 'hbox',
				bodyStyle: "background:#DFE9F6;padding:0px 0px 5px 0px"
				
				}, {
					id: 'AagencyZeroAccountNo',
					fieldLabel: '单位零余额账号',
					xtype: 'combo',
					dataIndex: 'account_no',
					displayField: 'account_name',
					emptyText: '请选择',
					valueField: 'account_no',
					value : comboAagencyZero.data.length > 0 ? comboAagencyZero.data
							.getAt(0).get("account_no") : "",
					editable: false,
					allowBlank : false,
					store:comboAagencyZero
				}, {
					id: 'RelationAccountNo',
					fieldLabel: '关联账号',
					xtype : 'textfield',
					allowBlank : false
				}],
			buttons: [
						{
	                  	  text: '确定',
	                      handler: function() {
	                    	if (this.up('form').getForm().isValid()) { 
								addRelationAccount(this.up('window'));
								Ext.getCmp("RelationAccountForm").getForm().reset();
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
		title : '添加关联账户',
		width : 350,
		autoHeight:true,
		layout : 'fit',
		resizable : false,
		modal : true,
		items : [ addRelationAccountDialog ]
	}).show();
}

function deleteRelationAccountDialog(gridPanel){
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
	//relate_accno|120,关联账号户名|relate_acc_name
	for (var i = 0; i < d_recordsr.length; i++) {
		selIds += d_recordsr[i].get("id");
		selNos += d_recordsr[i].get("relate_accno");
		if (i < d_recordsr.length - 1){
			selIds += ",";
			selNos += ",";
		}
			
	}
	Ext.MessageBox.confirm('删除提示', '是否确定删除 '+selNos+' 等账号？', delRelationAcount);
}

function delRelationAcount(id) {
	if (id == "yes") {
		var myMask = new Ext.LoadMask(Ext.getBody(), {
			msg : '后台正在处理中，请稍后....',
			removeMask : true
				// 完成后移除
			});
		myMask.show();
		// 提交到服务器操作
		Ext.Ajax.request({
			url : '/realware/delRelationAccount.do',
			method : 'POST',
			timeout : 180000, // 设置为3分钟
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

//加载 本网点 下的单位零余额账户
var comboAagencyZero =  Ext.create('Ext.data.Store', {
	model: 'BankAccount',
	fields : ['account_no', 'account_name'],
	autoLoad:true,
	anync: true,
	proxy:{
		type: 'ajax',
		url: '/realware/loadBudgetAccountOfBank.do',
		reader:{
			type: 'json',
			root: 'bankAccounts'
		}
	}
	
});

Ext.define('BankAccount',{
	extend: 'Ext.data.Model',
	field:[
	    {name: 'account_no', type:'string'},
	    {name: 'account_name',type:'string'}
	]
});

function addRelationAccount(win){
	
	var myMask = new Ext.LoadMask(Ext.getBody(), {
			msg : '后台正在处理中，请稍后....',
			removeMask : true // 完成后移除
		});
	myMask.show();
	// 提交到服务器操作
	Ext.Ajax.request({
		url : '/realware/addRelationAccount.do',
		method: 'POST',
		timeout:180000,  //设置为3分钟
		params : {
			acc_no : Ext.getCmp('AagencyZeroAccountNo').getValue(), //  零余额账号啊
			relate_accno : Ext.getCmp('RelationAccountNo').getValue() // 关联账号
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
