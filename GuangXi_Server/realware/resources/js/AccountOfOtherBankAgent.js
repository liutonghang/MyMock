/*
 * 划款账户维护
*/

/***
 * 引入需要使用的js文件
 */
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/recommend.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/Account_Del.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/Common_Validate.js"></scr' + 'ipt>');


/**
 * 列表
 */
var gridPanel1 = null;

/**
 * 数据项
 */
var fileds = ["account_id","account_name","account_no","account_type_code","bank_no","bank_code",
"bank_name","admdiv_code","create_date","is_valid","org_code"]; 

/**
 * 列名
 */
var header = "账户名称|account_name|200,账号|account_no|170,机构类型|org_code|80,收款行号|bank_no|170,收款行名称|bank_name|170,网点编码|bank_code|80,"
		+ "所属财政|admdiv_code|150,创建时间|create_date|100";

/**
 * 界面加载
 */
Ext.onReady(function() {
	Ext.QuickTips.init();
	gridPanel1 = getGrid(loadUrl, header, fileds, true, true);
	gridPanel1.setHeight(document.documentElement.scrollHeight - 88);
	// 根据查询条件检索数据
	gridPanel1.getStore().on('beforeload', function(thiz, options) {
		var admdiv = Ext.getCmp('admdivCom').getValue();
		if ("" == admdiv || null == admdiv) return;
		beforeload(Ext.getCmp("accountAgentQuery"), options, Ext.encode(fileds));
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
												addAgentAccountOfOtherBankDialog();
											}
										}, {
											id : 'editBtn',
											text : '修改',
											iconCls : 'edit',
											scale : 'small',
											handler : function() {
												editAgentOfOtherBankDialog(gridPanel1);
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
										}, {
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
									id : 'accountAgentQuery',
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
											labelWidth : 55,
											editable : false,
											store : comboAdmdiv,
											value : comboAdmdiv.data.length > 0
														? comboAdmdiv.data.getAt(0).get("admdiv_code")
														: "",
											listeners : {
												'select' : selectAdmdiv
											}
										}, {
											id : 'accountNameField',
											fieldLabel : '账户名称',
											xtype : 'textfield',
											dataIndex : 'account_name',
											labelWidth : 55
										}, {
											id : 'accountNoField',
											fieldLabel : '账号',
											xtype : 'textfield',
											dataIndex : 'account_no',
											labelWidth : 30
									}, {
											id : 'accountTypeCode',
											xtype : 'hiddenfield',
											fieldLabel : '账户类型',
											dataIndex : 'account_type_code',
											value:'6'
									}]
								}
							}]
				})]
	});
	selectAdmdiv();
	 var admdiv_code = gridPanel1.down('#admdiv_code');
		 admdiv_code.renderer = function(value){
		 if(comboAdmdiv) {
			var record = comboAdmdiv.findRecord('admdiv_code',value);
			if(record) {
				return record.get('admdiv_name');
			}
		}
		return value;
      };
});

function selectAdmdiv() {
	setBtnVisible(Ext.getCmp("admdivCom").getValue(), Ext.getCmp("buttongroup"));
	refreshData();
}


function refreshData() {
	gridPanel1.getStore().load();
//	Ext.getCmp('accountNameField').setValue("");
//	Ext.getCmp('accountNoField').setValue("");
//	Ext.getCmp('accountTypeCode').setValue("");
} 



function addAgentAccountOfOtherBankDialog(){

	var addAgentAccountDialog = new Ext.FormPanel({
		id:'AagentForm',
	    labelWidth: 75,
	    frame:true,
	    bodyStyle:'padding:5px 5px 0',
	    width: 350,
	    defaults: {width: 300},
	    defaultType: 'textfield',
			items : [ 
						{
							fieldLabel : '账户名称',
							id :'AagentAccountName',
							vtype:"accountName",
							allowBlank : false
						},{
							fieldLabel : '账号',
							id :'AagentAccountNo',
							vtype:"accountId",
							allowBlank : false
						},{
							id :'AagentAdmdivCode',
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
							id :'AagentAccountTypeCode',
							xtype : 'hidden',
							dataIndex : 'accountTypeCode',
							valueField: 'account_type_code',
							value : '6'							
						},{
							id :'AclearOrgCode',
							dataIndex : 'org_code',
							fieldLabel : '机构类型',
							regex:/^\d+$/,
							allowBlank : false
						},{
							xtype : 'checkbox',
							fieldLabel : '是否有效',
							id :'AagentIsValid',
							inputValue:"1",
							checked : true,
							hidden : true
						}
					],
			buttons: [
						{
	                  	  text: '确定',
	                  	  formBind : true,
	                      handler: function() {
						  	if( Ext.isEmpty ( Ext.getCmp('AagentAccountName').getValue() ) ){
								Ext.Msg.alert("系统提示", "账户名称不能为空！");
							}else if( Ext.isEmpty ( Ext.getCmp('AagentAccountNo').getValue() ) ){
								Ext.Msg.alert("系统提示", "账号不能为空！");
							}else if( Ext.isEmpty( Ext.getCmp('AagentAdmdivCode').getValue() ) ){
								Ext.Msg.alert("系统提示", "所属财政不能为空！");
							}else if( Ext.isEmpty( Ext.getCmp('AagentAccountTypeCode').getValue() ) ){
								Ext.Msg.alert("系统提示", "账户类型不能为空！");
							}else if(Ext.isEmpty( Ext.getCmp('AagentBankNo').getValue())){
								Ext.Msg.alert("系统提示", "收款行号不能为空！");
							}else{					
								addAgentOfOtherBankAccount(this.up('window'));
								Ext.getCmp('AagentForm').getForm().reset();
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
//		height : 250,
		layout : 'fit',
		resizable : false,
		modal : true,
		items : [ addAgentAccountDialog ]
	}).show();
}


function addAgentOfOtherBankAccount(win) {
	var myMask = new Ext.LoadMask(Ext.getBody(), {
			msg : '后台正在处理中，请稍后....',
			removeMask : true // 完成后移除
		});
	myMask.show();
	

	// 提交到服务器操作
	Ext.Ajax.request({
		url : 'addAdvanceAgent.do',
		method : 'POST',
		timeout : 180000, // 设置为3分钟
		params : {
			account_name : Ext.getCmp('AagentAccountName').getValue(),
			account_no : Ext.getCmp('AagentAccountNo').getValue(),
			bank_no : Ext.getCmp('AagentBankNo').getValue(),
			admdiv_code : Ext.getCmp('AagentAdmdivCode').getValue(),
			account_type_code : Ext.getCmp('AagentAccountTypeCode').getValue(),
			org_code:  Ext.getCmp('AclearOrgCode').getValue(),  
			bank_name: Ext.getCmp('AagentBankName').getValue(),  
			is_valid : Ext.getCmp('AagentIsValid').getValue() == true?"1":"0"
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



function addAgentAccountOfOtherBankDialog(){

	var addAgentAccountDialog = new Ext.FormPanel({
		id:'AagentForm',
	    labelWidth: 75,
	    frame:true,
	    bodyStyle:'padding:5px 5px 0',
	    width: 350,
	    defaults: {width: 300},
	    defaultType: 'textfield',
			items : [ 
						{
							fieldLabel : '账户名称',
							id :'AagentAccountName',
							vtype:"accountName",
							allowBlank : false
						},{
							fieldLabel : '账号',
							id :'AagentAccountNo',
							vtype:"accountId",
							allowBlank : false
						},{
							fieldLabel : '收款行号',
							id :'AagentBankNo',
							regex:/^\d+$/,
							regexText : '收款行号只能是数字',
							allowBlank : false
						},{
							fieldLabel : '收款行名称',
							id :'AagentBankName',
							regex:/^([\w\d\u4e00-\u9fa5]{1,60})$/,
							regexText :'收款行名称只能是数字字母和汉字，长度不超过60',
							allowBlank : false
						},{
							id :'AagentAdmdivCode',
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
							id :'AagentAccountTypeCode',
							xtype : 'hidden',
							dataIndex : 'accountTypeCode',
							valueField: 'account_type_code',
							value : '6'							
						},{
							id :'AclearOrgCode',
							dataIndex : 'org_code',
							fieldLabel : '机构类型',
							regex:/^\d+$/,
							regexText : '机构类型只能是数字',
							allowBlank : false
						},{
							xtype : 'checkbox',
							fieldLabel : '是否有效',
							id :'AagentIsValid',
							inputValue:"1",
							checked : true,
							hidden : true
						}
					],
			buttons: [
						{
	                  	  text: '确定',
	                  	  formBind : true,
	                      handler: function() {
						  	if( Ext.isEmpty ( Ext.getCmp('AagentAccountName').getValue() ) ){
								Ext.Msg.alert("系统提示", "账户名称不能为空！");
							}else if( Ext.isEmpty ( Ext.getCmp('AagentAccountNo').getValue() ) ){
								Ext.Msg.alert("系统提示", "账号不能为空！");
							}else if( Ext.isEmpty ( Ext.getCmp('AagentBankName').getValue() ) ){
								Ext.Msg.alert("系统提示", "收款行名称不能为空！");
							}else if( Ext.isEmpty( Ext.getCmp('AagentAdmdivCode').getValue() ) ){
								Ext.Msg.alert("系统提示", "所属财政不能为空！");
							}else if( Ext.isEmpty( Ext.getCmp('AagentAccountTypeCode').getValue() ) ){
								Ext.Msg.alert("系统提示", "账户类型不能为空！");
							}else{					
								addAgentOfOtherBankAccount(this.up('window'));
								Ext.getCmp('AagentForm').getForm().reset();
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
//		height : 250,
		layout : 'fit',
		resizable : false,
		modal : true,
		items : [ addAgentAccountDialog ]
	}).show();
}


function editAgentOfOtherBankDialog(gridPanel) {

	// 当前选中的数据
	var e_recordsr = gridPanel.getSelectionModel().getSelection();
	if (e_recordsr.length != 1) {
		Ext.Msg.alert("系统提示", "请选择一条数据！");
		return;
	}
	var accountId = e_recordsr[0].get("account_id");
	var mis_valid_b = false;
	if ("有效" == e_recordsr[0].get("is_valid")) {
		mis_valid_b = true;
	}

	var editBankAccountDialog = new Ext.FormPanel({
		id : 'EagentForm',
		labelWidth : 75,
		frame : true,
		bodyStyle : 'padding:5px 5px 0',
		width : 350,
		defaults : {
			width : 300
		},
		defaultType : 'textfield',
		items : [ {
					id : 'AagentAccountId',
					xtype : 'hidden',
					dataIndex : 'account_id',
					vtype:"accountId",
					value : e_recordsr[0].get("account_id")
				},{
					fieldLabel : '账户名称',
					id : 'EagentAccountName',
					vtype:"accountName",
					value : e_recordsr[0].get("account_name")
				}, {
					fieldLabel : '账号',
					id : 'EagentAccountNo',
					
//					disabled : true,
					value : e_recordsr[0].get("account_no")
				},{
					fieldLabel : '收款行号',
					id :'AagentBankNo1',
					regex:/^\d+$/,
					regexText : '收款行号只能是数字',
					value : e_recordsr[0].get("bank_no")
				}, {
					fieldLabel : '收款行名称',
					id :'bankName',
					regex:/^([\w\d\u4e00-\u9fa5]{1,60})$/,
					regexText :'收款行名称只能是数字字母和汉字，长度不超过60',
					value : e_recordsr[0].get("bank_name")
				},{
					xtype : 'combo',
					fieldLabel : '所属财政',
					id : 'EagentAdmdivCode',
					displayField : 'admdiv_name',
					emptyText : '请选择',
					valueField : 'admdiv_code',
					allowBlank : false,
					editable : false,
					store : comboAdmdiv
				}, {
					id : 'AagentAccountTypeCode',
					xtype : 'hidden',
					dataIndex : 'accountTypeCode',
					valueField : 'account_type_code',
					value : '6'
				}, {
					id : 'AclearOrgCode',
					dataIndex : 'org_code',
					fieldLabel : '机构类型',
					value : e_recordsr[0].get("org_code"),
					regex:/^\d+$/,
					regexText : '机构类型只能是数字',
					allowBlank : false
				}, {
					xtype : 'checkbox',
					fieldLabel : '是否有效',
					id : 'EagentIsValid',
					checked : mis_valid_b,
					hidden : true
				}],
		buttons : [{
					text : '确定',
					formBind : true,
					handler : function() {
						if (Ext.getCmp('EagentAccountName').getValue() == "") {
							Ext.Msg.alert("系统提示", "账户名称不能为空！");
						} else if (Ext.getCmp('EagentAdmdivCode').getValue() == "") {
							Ext.Msg.alert("系统提示", "所属财政不能为空！");
						} else if(Ext.getCmp('AagentBankNo1').getValue() == ""){
							Ext.Msg.alert("系统提示", "收款行号不能为空！");
						}else if(Ext.getCmp('bankName').getValue() == ""){
							Ext.Msg.alert("系统提示", "收款行名称不能为空！");
						} else {
							if (Ext.getCmp('EagentIsValid').getValue() == true) {
								e_is_valid = "1";
							}
							editAgentAccount(this.up('window'), e_recordsr);
							Ext.getCmp('EagentForm').getForm().reset();
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

	Ext.getCmp('EagentAdmdivCode').setValue(e_recordsr[0].get("admdiv_code"));
//	Ext.getCmp('EagentAccountTypeCode').setValue(e_recordsr[0]
//			.get("account_type_code"));

	var win1 = Ext.widget('window', {
				title : '修改账户',
				width : 350,
				height : 250,
				layout : 'fit',
				resizable : false,
				modal : true,
				items : [editBankAccountDialog]
			}).show();
}



function editAgentAccount(win, e_record) {
	var myMask = new Ext.LoadMask(Ext.getBody(), {
			msg : '后台正在处理中，请稍后....',
			removeMask : true // 完成后移除
		});
	myMask.show();
	// 提交到服务器操作
	Ext.Ajax.request({
				url : 'editAdvanceAgent.do',
        		method: 'POST',
				timeout:180000,  //设置为3分钟
				params : {
					account_id : Ext.getCmp('AagentAccountId').getValue(),
					account_name : Ext.getCmp('EagentAccountName').getValue(),
					account_no : Ext.getCmp('EagentAccountNo').getValue(),
					admdiv_code : Ext.getCmp('EagentAdmdivCode').getValue(),
					bank_no : Ext.getCmp('AagentBankNo1').getValue(),
					bank_name : Ext.getCmp('bankName').getValue(),
					account_type_code :'6',
					org_code: Ext.getCmp('AclearOrgCode').getValue(),
					is_valid : Ext.getCmp('EagentIsValid').getValue() == true?"1":"0"
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

/*
function deleteAdvanceAgentDialog(gridPanel){
	// 请求开始时，都先把selIds置空
	selIds = "";
	// 当前选中的数据
	var d_recordsr = gridPanel.getSelectionModel().getSelection();
	if (d_recordsr.length == 0) {
		Ext.Msg.alert("系统提示", "请至少选择一条数据！");
		return;
	}
	// 选中的凭证的id数组，要传到后台
	for (var i = 0; i < d_recordsr.length; i++) {
		selIds += d_recordsr[i].get("account_no");
		if (i < d_recordsr.length - 1)
			selIds += ",";
	}
	
	Ext.MessageBox.confirm('删除提示', '是否确定删除'+selIds+'等账号？', delAgentAcount);
}

function delAgentAcount(id) {
	
	if(id == "yes"){
		var myMask = new Ext.LoadMask(Ext.getBody(), {
			msg : '后台正在处理中，请稍后....',
			removeMask : true
				// 完成后移除
			});
		myMask.show();
		// 提交到服务器操作
		Ext.Ajax.request({
				url : 'delAdvanceAgent.do',
        		method: 'POST',
				timeout:180000,  //设置为3分钟
				params : {
					selIds : selIds
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
*/
