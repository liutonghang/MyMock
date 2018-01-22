/*
 * **************************财政零余额*************************************************
 * 添加账户
 */
function addAdmdivZeroAccountDialog() {
	var records = networkPanel.getSelectionModel().getSelection();
	var addAdmdivZeroAccountDialog = new Ext.FormPanel(
			{
				id : 'AadmdivZeroForm',
				frame : true,
				bodyStyle : 'padding:5px 5px 0 5px',
				defaultType : 'textfield',
				items : [
						{
							xtype : 'panel',
							border : 0,
							width : 350,
							layout : 'hbox',
							bodyStyle : "background:#DFE9F6;padding:0px 0px 5px 0px",
							items : [
									{
										id : 'AadmdivZeroAccountBankCode',
										xtype : 'textfield',
										fieldLabel : '所属网点',
										readOnly : 'true',
										msgTarget : 'side',
										allowBlank : false,
										value : ''
									},
									{
										id : 'btn_bank_code_Admdiv_add',
										xtype : 'button',
										text : '查询',
										iconCls : 'log',
										handler : function(btn) {
											new pb.ChooseBankWindow(
													{
														listeners : {
															afterchoose : function(
																	window,
																	bankInfo) {
																bankid = bankInfo.bankId;
																var codeandname = bankInfo.bankcode
																		+ " "
																		+ bankInfo.bankname;
																btn
																		.up(
																				"panel")
																		.down(
																				"textfield")
																		.setValue(
																				codeandname);
															}
														}
													}).show()
										}
									} ]
						}, {
							id : 'AadmdivZeroAccountName',
							fieldLabel : '账户名称',
							vtype : "accountName",
							allowBlank : false
						}, {
							id : 'AadmdivZeroAccountNo',
							fieldLabel : '账号',
							vtype : "accountId",
							allowBlank : false
						}, {
							id : 'AadmdivZeroFinanceName',
							fieldLabel : '财务人员名称',
							vtype : "accountName",
							allowBlank : true
						}, {
							id : 'AadmdivZeroFinancePhone',
							fieldLabel : '财务人员电话号码',
							vtype : "commonPhone",
							allowBlank : true
						}, {
							id : 'AadmdivZeroAdmdivCode',
							xtype : 'combo',
							fieldLabel : '所属财政',
							dataIndex : 'admdivCode',
							displayField : 'admdiv_name',
							emptyText : '请选择',
							valueField : 'admdiv_code',
							allowBlank : false,
							editable : false,
							store : comboAdmdiv
						}, {
							id : 'AadmdivZeroIsValid',
							xtype : 'checkbox',
							fieldLabel : '是否有效',
							checked : true,
							hidden : true,
							getValue : function() {
								var v = 0;
								// 选中checkbox
							if (this.checked) {
								v = 1;
							}
							return v;
						}
						} ],
				buttons : [
						{
							text : '确定',
							handler : function() {
								if (this.up('form').getForm().isValid()) {
									a_is_valid = Ext.getCmp(
											'AadmdivZeroIsValid').getValue();
									// AccountProvince_add.js
									addAdmdivZeroAccount(this.up('window'));
									Ext.getCmp("AadmdivZeroForm").getForm()
											.reset();
									this.up('window').close();
								}
							}
						}, {
							text : '取消',
							handler : function() {
								this.up('window').close();
							}
						} ]
			});
	var dialog = Ext.widget('window', {
		title : '添加账户',
		width : 350,
		autoHeight : true,
		layout : 'fit',
		resizable : false,
		modal : true,
		items : [ addAdmdivZeroAccountDialog ]
	}).show();

	var netState = Ext.getCmp("netState").getValue();
	if (netState == "002" && records != null) {
		bankid = records[0].raw.id;
		var bankcode = records[0].raw.code;
		var bankname = records[0].raw.text;
		Ext.getCmp("AadmdivZeroAccountBankCode").setValue(
				bankcode + " " + bankname);
		Ext.getCmp("btn_bank_code_Admdiv_add").disabled = true;
	}
}

function addAdmdivZeroAccount(win) {
	var myMask = new Ext.LoadMask(Ext.getBody(), {
		msg : '后台正在处理中，请稍后....',
		removeMask : true
	// 完成后移除
			});
	myMask.show();
	// 提交到服务器操作
	Ext.Ajax.request( {
		url : 'addProvinceAdmdivZeroAccount.do',
		method : 'POST',
		timeout : 180000, // 设置为3分钟
		params : {
			account_name : Ext.getCmp('AadmdivZeroAccountName').getValue(),
			account_no : Ext.getCmp('AadmdivZeroAccountNo').getValue(),
			finance_name : Ext.getCmp('AadmdivZeroFinanceName').getValue(),
			finance_phone : Ext.getCmp('AadmdivZeroFinancePhone').getValue(),
			is_valid : a_is_valid,
			admdiv_code : Ext.getCmp('AadmdivZeroAdmdivCode').getValue(),
			bankid : bankid
		},
		// 提交成功的回调函数
		success : function(response, options) {
			succAjax(response, myMask);
			refreshData();
		},
		// 提交失败的回调函数
		failure : function(response, options) {
			failAjax(response, myMask);
			refreshData();
		}
	});
}