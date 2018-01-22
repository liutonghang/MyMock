/*
 * 清算账户维护
 */
 
/***
 * 引入需要使用的js文件
 */
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/recommend.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/Account_Add.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/Account_Del.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/Common_Validate.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/rcb_js/RcbOcxUtil.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/rcb_js/printImageUntil.js"></scr' + 'ipt>');


/**
 * 列表
 */
var gridPanel1 = null;


/**
 * 数据项 账户类型,账户名称,账号,网点编码,网点名称,是否有效,所属财政,资金性质,是否同行清算,机构类型
 */
var fileds = ["account_id","account_name", "account_no", "bank_code", "bank_name",
		"bank_no",  "admdiv_code",
		"create_date"];

/**
 * 列名
 */
var header = "账户名称|account_name|200,账号|account_no|170,网点代码|bank_code|80,"
		+ "开户行名称|bank_name|150,银行行号|bank_no|100,"
		+ "所属财政名称|admdiv_code|150,创建时间|create_date|100";

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
				if (admdiv == null || admdiv == "")
					return;
				beforeload(Ext.getCmp("accountClearQuery"), options, Ext.encode(fileds));
				options.params["admdivCode"] = admdiv;
			});
	Ext.create('Ext.Viewport', {
		id : 'clearAccountFrame',
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
												addClearAccountDialogRcb(gridPanel1);
											}
										}, {
											id : 'editBtn',
											text : '修改',
											iconCls : 'edit',
											scale : 'small',
											handler : function() {
												editClearAccountDialog(gridPanel1);
											}
										}, {
											id : 'deleteBtn',
											text : '删除',
											iconCls : 'delete',
											scale : 'small',
											handler : function() {
												delAccreditAdvanceAccountDialog(gridPanel1);
											}
										
										}, {
											id : 'refreshBtn',
											text : '查询',
											iconCls : 'refresh',
											scale : 'small',
											handler : function() {
												refreshData();
											}
										}
										]
							}],
					items : [{
								title : "查询区",
								items : gridPanel1,
								tbar : {
									id : 'accountClearQuery',
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
											width : 200,
											editable : false,
											store : comboAdmdiv,
											value : comboAdmdiv.data.length > 0
														? comboAdmdiv.data.getAt(0).get("admdiv_code")
														: "",
										},  {
											id : 'accountNoField',
											fieldLabel : '账号',
											xtype : 'textfield',
											dataIndex : 'account_no',
											labelWidth : 45,
											width : 200
										},{
											id : 'accountNameField',
											fieldLabel : '账户名称',
											xtype : 'textfield',
											dataIndex : 'account_name',
											labelWidth : 60,
											symbol : 'like',
											width :200
										},  {
											id : 'accountTypeField',
											fieldLabel : '账号',
											xtype : 'textfield',
											dataIndex : 'ACCOUNT_TYPE_CODE',
											labelWidth : 45,
											hidden : true,
											value : '44',
											width : 200
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
	  		refreshData();	
});



/**
 * 校验账户
 */
function commonValidate(win){
	var myMask = new Ext.LoadMask(Ext.getBody(), {
			msg : '后台正在处理中，请稍后....',
			removeMask : true // 完成后移除
		});
	myMask.show();
	var clearAccountType=Ext.getCmp('clearAccountType').getValue();
	if (clearAccountType!=1){
		if (!Ext.isEmpty(myMask)) {
			myMask.hide();
		}
		invokeocx(function(){
			addClearAccount2(win);
		});

		refreshData();	
		return;
	}
	var params={
		accountName : Ext.getCmp('AclearAccountName').getValue(), 
		accountNo : Ext.getCmp('AclearAccountNo').getValue(),
		accountType : accountType
	};
	// 提交到服务器操作
	Ext.Ajax.request({
		url : '/realware/commonValidateBeforeAdd.do',
        method: 'POST',
		timeout:180000,  //设置为3分钟
		params : params,
		// 提交成功的回调函数
		success : function(response, options) {
			if (!Ext.isEmpty(myMask)) {
				myMask.hide();
			}
			invokeocx(function(){
				addClearAccount2(win);
			});

			refreshData();	
		},
		// 提交失败的回调函数
		failure : function(response, options) {
			if (!Ext.isEmpty(myMask)) {
				myMask.hide();
			}
			Ext.Msg.alert('提示', "操作失败，请联系管理员！");
			refreshData();
		}
	});

}

function selectAccountType(id){
	
	var accountTypeValue=Ext.getCmp(id).getValue();
	//同行账号
	if(accountTypeValue==1){
		Ext.getCmp("AclearBankNo").setDisabled(true);
		Ext.getCmp("AclearAccountName").setValue("");
		Ext.getCmp("btn_clear_add").setDisabled(false);
		Ext.getCmp("AclearAccountName").setReadOnly(true);
	}else if(accountTypeValue==2) {
		Ext.getCmp("AclearBankNo").setDisabled(false);
		Ext.getCmp("AclearAccountName").setValue("");
		Ext.getCmp("btn_clear_add").setDisabled(false);
		Ext.getCmp("AclearAccountName").setReadOnly(true);
	}else if(accountTypeValue==0){
		Ext.getCmp("AclearBankNo").setDisabled(false);
		Ext.getCmp("AclearAccountName").setValue("");
		Ext.getCmp("btn_clear_add").setDisabled(true);
		Ext.getCmp("AclearAccountName").setReadOnly(false);
	}
	
};
/*
***************************清算账户*************************************************
*/
function addClearAccountDialogRcb(grid){
	var addClearAccountDialog = new Ext.FormPanel({
		id:'AclearForm',
	    labelWidth: 75,
	    frame:true,
	    bodyStyle:'padding:5px 5px 0',
	    width: 350,
	    defaults: {width: 300},
	    defaultType: 'textfield',
			items : [{
				id: 'AccreditAdvanceAccountName',
				vtype:"accountName",
				afterLabelTextTpl : required,
				allowBlank : false,
				fieldLabel: '账户名称'
			}, {
				id: 'AccreditAdvanceAccountNo',
				afterLabelTextTpl : required,
				allowBlank : false,
				vtype:"accountId",
				fieldLabel: '账号'
			},{
				id: 'AccreditAdvanceAdmdivCode',
				xtype: 'combo',
				fieldLabel: '所属财政',
				dataIndex: 'admdivCode',
				displayField: 'admdiv_name',
				afterLabelTextTpl : required,
				emptyText: '请选择',
				valueField: 'admdiv_code',
				allowBlank: false,
				editable: false,
				store: comboAdmdiv
			},{
				id: 'AccreditAdvanceIsValid',
				xtype: 'checkbox',
				fieldLabel: '是否有效',
				checked: true,
				hidden : true
			}],
			buttons: [
						{
						  formBind : true,
	                  	  text: '确定',
	                      handler: function() {
	                    	  var myMask = new Ext.LoadMask(Ext.getBody(), {
	                  			msg : '后台正在处理中，请稍后....',
	                  			removeMask : true // 完成后移除
	                  		});
	                  	    myMask.show();
	                    	  Ext.Ajax.request({
	                  			url : "GXaddOfficial.do",
	                  			method : 'POST',
	                  			timeout : 180000, // 设置为3分钟
	                  			params : {
	                  				accountNo :  Ext.getCmp('AccreditAdvanceAccountNo').getValue(),
	                  				accountType:'44',
	                  				accountName :Ext.getCmp('AccreditAdvanceAccountName').getValue(),
	                  				admdiv_code : Ext.getCmp('AccreditAdvanceAdmdivCode').getValue()
	                  			 },
	                  			success : function(response, options) {
	                  				succAjax(response,myMask);
	                  				refreshData();
	                  			},
	                  			failure : function(response, options) {
	                  				failAjax(response, myMask);
	                  				refreshData();
	                  			}
	                  		});
      						this.up('window').close();

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
		height : 150,
		layout : 'fit',
		resizable : false,
		modal : true,
		items : [ addClearAccountDialog ]
	}).show();
}

/**
 * 查询账户信息
 */
function queryAccount(accountNo,url){
		if(accountNo == null || accountNo == ""){
			Ext.Msg.alert("系统提示", "请输入查询账号！");
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
				accountNo : accountNo,
				accountType:accountType
			 },
			success : function(response, options) {
				myMask.hide();
				Ext.getCmp("AclearAccountName").setValue(response.responseText);
			},
			failure : function(response, options) {
				failAjax(response, myMask);
				refreshData();
			}
		});
}
/*******************************************************************************
 * 刷新方法
 */
function refreshData() {
	gridPanel1.getStore().loadPage(1);
}

function deleteClearAccountDialog(gridPanel){
	// 请求开始时，都先把selIds置空
	var selIds = "";
	var selNos ="";
	// 当前选中的数据
	var d_recordsr = gridPanel.getSelectionModel().getSelection();
	if (!d_recordsr.length == 1) {
		Ext.Msg.alert("系统提示", "请选择一条数据！");
		return;
	}
	// 选中的凭证的id数组，要传到后台
	for (var i = 0; i < d_recordsr.length; i++) {
		selIds += d_recordsr[i].get("account_id");
		selNos += d_recordsr[i].get("account_name");
		if (i < d_recordsr.length - 1){
			selIds += ",";
			selNos += ",";
		}
			
	}

	Ext.MessageBox.confirm('删除提示', '是否确定删除 '+selNos+' 的账户信息？', function(id){
		if(id == "yes"){
			delAgentAcount(selIds,selNos,d_recordsr);
		}
	});
}

function delAgentAcount(selIds,selNos,d_recordsr) {
	
		var myMask = new Ext.LoadMask(Ext.getBody(), {
			msg : '后台正在处理中，请稍后....',
			removeMask : true
				// 完成后移除
			});
		myMask.show();
		// 提交到服务器操作
		Ext.Ajax.request({
				url : 'deleteClearAccount.do',
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
					Ext.MessageBox.confirm('提示', '删除成功，是否打印账户信息？', function(id){
						if(id == "yes"){
							InitprintWindow(d_recordsr[0].get("account_no"),0,4);
						}
					});
				},
				// 提交失败的回调函数
				failure : function(response, options) {
					failAjax(response,myMask);
					refreshData();
					
				}
		});
	
}


function editClearAccountDialog(gridPanel) {

	// 当前选中的数据
	var e_recordsr = gridPanel.getSelectionModel().getSelection();
	if (e_recordsr.length != 1) {
		Ext.Msg.alert("系统提示", "请选择一条数据！");
		return;
	}
	
	var editBankAccountDialog = new Ext.FormPanel({
		id:'AclearForm',
	    labelWidth: 75,
	    frame:true,
	    bodyStyle:'padding:5px 5px 0',
	    width: 350,
	    defaults: {width: 300},
	    defaultType: 'textfield',
			items: [{
				id: 'EadmdivZeroAdmdivBankCode',
				xtype: 'textfield',
				fieldLabel: '所属网点',
				readOnly: 'true',
				disabled : true,
				msgTarget: 'side',
				allowBlank: false,
				hidden :true,
				value: e_recordsr[0].get("bank_code")
			/*, {
				id: 'btn_bank_code_Admdiv_edit',
				xtype: 'button',
				text: '查询',
				handler: function(){
					choseBank('EadmdivZeroAdmdivBankCode');
				}
			}*/
			},{
				fieldLabel : '账户名称',
				id : 'EadmdivZeroAccountName',
				value : e_recordsr[0].get("account_name"),
				xtype: 'textfield',
				allowBlank : false
			}, {
				xtype: 'textfield',
				fieldLabel : '账号',
				id : 'EadmdivZeroAccountNo',
				value : e_recordsr[0].get("account_no")
			}, {
				xtype: 'textfield',
				fieldLabel : '所属财政',
				id : 'EadmdivZeroAdmdivCode',
				value :getadmdivName( e_recordsr[0].get("admdiv_code")),
				disabled : true,
				readOnly: 'true'

			}, {
				fieldLabel : '是否有效',
				xtype: 'textfield',
				id : 'accountId',
				value : e_recordsr[0].get("account_id"),
				hidden :true
			}
			],
			buttons : [{
				text : '确定',
				handler : function() {
					if(this.up("form").getForm().isValid()){
						
						editAdmdivZeroAccount(this.up('window'));
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
function editAdmdivZeroAccount(win) {
	var myMask = new Ext.LoadMask(Ext.getBody(), {
			msg : '后台正在处理中，请稍后....',
			removeMask : true // 完成后移除
		});
	myMask.show();
	// 提交到服务器操作
	Ext.Ajax.request({
				url : 'GXeditofficialAccount.do',
        		method: 'POST',
				timeout:180000,  //设置为3分钟
				params : {
					account_name : Ext.getCmp('EadmdivZeroAccountName').getValue(),
					account_id :Ext.getCmp('accountId').getValue(),
					account_no : Ext.getCmp('EadmdivZeroAccountNo').getValue(),
					admdiv_code : Ext.getCmp('EadmdivZeroAdmdivCode')
							.getValue()
				},
				// 提交成功的回调函数
				success : function(response, options) {
					debugger;
					succAjax(response, myMask);
					refreshData();
				},
				// 提交失败的回调函数
				failure : function(response, options) {
					debugger;
					failAjax(response, myMask);
					refreshData();
				}
			});
}

function getadmdivName(value){
     for(var i=0;i<comboAdmdiv.data.length;i++){
        if(value == comboAdmdiv.data.getAt(i).get("admdiv_code")){
           return comboAdmdiv.data.getAt(i).get("admdiv_name");
        }
     }
};