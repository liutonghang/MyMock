/*
 * 修改账户
 */

Ext.require(['*']);



var e_is_valid = "0";
var e_is_sameBank = "0";
var e_is_pbc = "0";
var accountId ="";

/**************************授权支付垫支户(主办行)************************************/

function editAccreditAdvanceAccountDialog(gridPanel) {
	// 当前选中的数据
	var e_recordsr = gridPanel.getSelectionModel().getSelection();
	if (e_recordsr.length != 1) {
		Ext.Msg.alert("系统提示", "请选择一条数据！");
		return;
	}
	accountId =  e_recordsr[0].get("account_id");
	var actTypeCode = e_recordsr[0].get("account_type_code");
	//设置bankId为原来的值
	bankid = e_recordsr[0].get("bank_id");

	var editBankAccountDialog = new Ext.FormPanel({
		id : 'editAccreditAdvanceAccountForm',
		frame:true,
	    bodyStyle:'padding:5px 5px 0 5px',
		defaultType: 'textfield',
		items : [{
				xtype: 'panel',
				border: 0,
				width: 350,
				layout: 'hbox',
				bodyStyle: "background:#DFE9F6;padding:0px 0px 5px 0px",
				hidden:isHost='true',
				items: [
				        {
			        id: 'bank_code_form',
					name: 'bank_code',
					xtype: 'textfield',
					fieldLabel: '所属网点',
					readOnly: 'true',
					msgTarget: 'side',
					allowBlank: false
				}/*, {
					name: 'btn_bank_code_Agency_edit',
					xtype: 'button',
					text: '查询'	,
					handler: function(){
						choseBank('bank_code_form');
					}
				}*/]
				}
				,		
		         {
					fieldLabel : '账户名称',
					name : 'account_name',
					allowBlank : false,
					afterLabelTextTpl : required
				}
		         ,{
					fieldLabel : '账号',
					name : 'account_no',
					allowBlank : false,
					afterLabelTextTpl : required
				}
				, {
					xtype : 'combo',
					fieldLabel : '所属财政',
					name : 'admdiv_code',
					displayField : 'admdiv_name',
					emptyText : '请选择',
					valueField : 'admdiv_code',
					allowBlank : false,
					editable : false,
					afterLabelTextTpl : required,
					store : comboAdmdiv
				},,{
					id : 'EagentAccountTypeCode',
					xtype : 'combo',
					fieldLabel : '账户类型',
					dataIndex : 'account_type_code',
					displayField : 'accont_type_name',
					emptyText : '请选择',
					valueField : 'account_type_code',
					editable : false,
					afterLabelTextTpl : required,
					queryMode : 'local',
					value:actTypeCode,
					store : comboAccountType
				}
				],
		buttons : [
		   {
			text : '确定',
			formBind:true,
			handler : function() {
				editAccreditAdvanceAccount(this.up('window'));
				Ext.getCmp('editAccreditAdvanceAccountForm').getForm().reset();
				this.up('window').close();
			}
		}, 
		{
			text : '取消',
			handler : function() {
				this.up('form').getForm().reset();
				this.up('window').close();
			}
		}
		]
	});
	
	
	editBankAccountDialog.getForm().loadRecord(e_recordsr[0]);
	
	var win1 = Ext.widget('window', {
				title : '修改账户',
				width : 400,
				autoHeight:true,
				layout : 'fit',
				resizable : false,
				modal : true,
				items : [editBankAccountDialog]
			}).show();
}

function editAccreditAdvanceAccount(win) {
	var myMask = new Ext.LoadMask(Ext.getBody(), {
		msg : '后台正在处理中，请稍后....',
		removeMask : true
			// 完成后移除
		});
	myMask.show();
	// 提交到服务器操作
	Ext.Ajax.request({
				url : 'editAccreditAdvanceAccount.do',
				method : 'POST',
				timeout : 180000, // 设置为3分钟
				form : "editform",
				timeout : 3000,
				params : {
					account_name : Ext.getCmp('editAccreditAdvanceAccountForm').getForm().findField('account_name').getValue(),
					account_no : Ext.getCmp('editAccreditAdvanceAccountForm').getForm().findField('account_no').getValue(),
					account_id : accountId,
					bankid : bankid,
					account_type_code : Ext.getCmp('EagentAccountTypeCode').getValue(),
					/*is_valid : Ext.getCmp('editAccreditAdvanceAccountForm').getForm().findField('is_valid').getValue(),*/
					admdiv_code : Ext.getCmp('editAccreditAdvanceAccountForm').getForm().findField('admdiv_code').getValue()/*,
					agency_code : Ext.getCmp('editAccreditAdvanceAccountForm').getForm().findField('agency_code').getValue()*/
				},
				// 提交成功的回调函数
				success : function(response, options) {
					succAjax(response,myMask,true);
				},
				// 提交失败的回调函数
				failure : function(response, options) {
					failAjax(response,myMask);
					refreshData();
				}
			});
}


/*
 * **************************单位零余额*************************************************
 */
/** ******************************************************************************** */


function editAgencyZeroAccountDialog(gridPanel) {
	// 当前选中的数据
	var e_recordsr = gridPanel.getSelectionModel().getSelection();
	if (e_recordsr.length != 1) {
		Ext.Msg.alert("系统提示", "请选择一条数据！");
		return;
	}
	accountId =  e_recordsr[0].get("account_id");

	//设置bankId为原来的值
	bankid = e_recordsr[0].get("bank_id");
	var mis_valid_b = false;
	if ("有效" == e_recordsr[0].get("is_valid")) {
		mis_valid_b = true;
	}

	var editBankAccountDialog = new Ext.FormPanel({
		id : 'EagencyZeroForm',
		frame:true,
	    bodyStyle:'padding:5px 5px 0 5px',
		defaultType: 'textfield',
		items : [{
				xtype: 'panel',
				border: 0,
				width: 350,
				layout: 'hbox',
				bodyStyle: "background:#DFE9F6;padding:0px 0px 5px 0px",
				hidden:isHost=='true'?false:true,
				items: [
				        {
			        id: 'bank_code_form',
					name: 'bank_code',
					xtype: 'textfield',
					fieldLabel: '所属网点',
					readOnly: 'true',
					msgTarget: 'side',
					afterLabelTextTpl : required,
					allowBlank: false
				}/*, {
					name: 'btn_bank_code_Agency_edit',
					xtype: 'button',
					text: '查询'	,
					handler: function(){
						choseBank('bank_code_form');
					}
				}*/]
				}
				,		
		         {
					fieldLabel : '账户名称',
					name : 'account_name',
					vtype:"accountName",
					afterLabelTextTpl : required,
					allowBlank : false
				}
		         ,{
					fieldLabel : '账号',
					name : 'account_no',
//					disabled : true,
					vtype:"accountId",
					afterLabelTextTpl : required,
					allowBlank : false
				}
				, {
					xtype : 'combo',
					fieldLabel : '所属财政',
					name : 'admdiv_code',
					displayField : 'admdiv_name',
					emptyText : '请选择',
					valueField : 'admdiv_code',
					allowBlank : false,
					editable : false,
					afterLabelTextTpl : required,
					store : comboAdmdiv
				}
				, {
					fieldLabel : '单位编码',
					name : 'agency_code',
					vtype:"commonId",
					afterLabelTextTpl : required,
					allowBlank : false
				},{
					fieldLabel : '单位名称',
					allowBlank : false,
					name : 'agency_name',
					vtype:"commonName",
					afterLabelTextTpl : required,
					allowBlank : false
				},  {
					id: 'AagencyZeroFinanceName',
					fieldLabel: '财务人员名称',
					name : 'finance_name',
					vtype:"commonName",
					allowBlank : true
				},  {
					id: 'AagencyZeroFinancePhone',
					fieldLabel: '财务人员电话号码',
					name : 'finance_phone',
					vtype:"commonPhone",
					allowBlank : true
				},{
                	id:    'AgencyZeroIsValid',
					xtype : 'checkbox',
					fieldLabel : '是否有效',
					name : 'agency_zero_is_Valid',
					checked : mis_valid_b,
					getValue: function() {
						var v = 0;
			            if (this.checked) {
			                v = 1;
			              }
			            return v;
			        },
			        hidden : true
				}
				
				],
		buttons : [
		   {
			text : '确定',
			handler : function() {
				if(this.up("form").getForm().isValid()){
					if(Ext.getCmp('AgencyZeroIsValid').getValue()==true){
						e_is_valid = "1";
					}else{
						e_is_valid = "0";
					}
					editAgencyZeroAccount(this.up('window'));
					Ext.getCmp('EagencyZeroForm').getForm().reset();
					this.up('window').close();

				}
			}
		}, 
		{
			text : '取消',
			handler : function() {
				this.up('form').getForm().reset();
				this.up('window').close();
			}
		}
		]
	});
	//Ext.getCmp('EagencyZeroAdmdivCode').setValue(e_recordsr[0].get("admdiv_code"));
	
	editBankAccountDialog.getForm().loadRecord(e_recordsr[0]);
	
	var win1 = Ext.widget('window', {
				title : '修改账户',
				width : 400,
				autoHeight:true,
				layout : 'fit',
				resizable : false,
				modal : true,
				items : [editBankAccountDialog]
			}).show();
}

function editAgencyZeroAccount(win) {
	var myMask = new Ext.LoadMask(Ext.getBody(), {
		msg : '后台正在处理中，请稍后....',
		removeMask : true
			// 完成后移除
		});
	myMask.show();
	// 提交到服务器操作
	Ext.Ajax.request({
				url : 'editAgencyZeroAccount.do',
				method : 'POST',
				timeout : 180000, // 设置为3分钟
				form : "editform",
				timeout : 3000,
				params : {
					account_name : Ext.getCmp('EagencyZeroForm').getForm().findField('account_name').getValue(),
					account_no : Ext.getCmp('EagencyZeroForm').getForm().findField('account_no').getValue(),
					account_id : accountId,
					bankid : bankid,
					/**
					 * is_valid字段隐藏，后台逻辑中没有使用
					 * lfj 2016-01-14
					 */
//					is_valid : Ext.getCmp('EagencyZeroForm').getForm().findField('is_valid1').getValue(),
					is_valid : 1,
					admdiv_code : Ext.getCmp('EagencyZeroForm').getForm().findField('admdiv_code').getValue(),
					agency_name : Ext.getCmp('EagencyZeroForm').getForm().findField('agency_name').getValue(),
					agency_code : Ext.getCmp('EagencyZeroForm').getForm().findField('agency_code').getValue(),
					finance_name : Ext.getCmp('EagencyZeroForm').getForm().findField('finance_name').getValue(),
					finance_phone : Ext.getCmp('EagencyZeroForm').getForm().findField('finance_phone').getValue()
	},
				// 提交成功的回调函数
				success : function(response, options) {
					succAjax(response,myMask,true);
					refreshData();
				},
				// 提交失败的回调函数
				failure : function(response, options) {
					failAjax(response,myMask);
					refreshData();
				}
			});
}

/** ******************************************************************************** */

/*
 * **************************清算账户*************************************************
 */

function editClearAccountDialog(gridPanel) {

	// 当前选中的数据
	var e_recordsr = gridPanel.getSelectionModel().getSelection();
	if (e_recordsr.length != 1) {
		Ext.Msg.alert("系统提示", "请选择一条数据！");
		return;
	}
	accountId = e_recordsr[0].get("account_id");
	var mis_samebank_b = false;
	if ("是" == e_recordsr[0].get("is_samebank")) {
		mis_samebank_b = true;
	}
	var mis_valid_b = false;
	if ("有效" == e_recordsr[0].get("is_valid")) {
		mis_valid_b = true;
	}
	var mis_pbc_b = false;
	if ("是" == e_recordsr[0].get("is_pbc")) {
		mis_pbc_b = true;
	}
	var fundType = false;
	var editBankAccountDialog = new Ext.FormPanel({
		id : 'EClearForm',
		labelWidth : 75,
		frame : true,
		bodyStyle : 'padding:5px 5px 0',
		width : 350,
		defaults : {
			width : 300
		},
		defaultType : 'textfield',
		items : [{
					id : 'EClearAccountName',
					fieldLabel : '账户名称',
					vtype:"accountName",
					allowBlank : false,
					value : e_recordsr[0].get("account_name")
				}, {
					id : 'EClearAccountNo',
					fieldLabel : '账号',
					disabled : false,
					value : e_recordsr[0].get("account_no")
				},{
					id : 'EClearBankName',
					fieldLabel : '开户行名称',
					value : e_recordsr[0].get("bank_name"),
					allowBlank : false,
							regex:/^([\w\d\u4e00-\u9fa5]{1,60})$/,
							regexText :'银行名称只能是数字字母和汉字，长度不超过60'
				}, {
					id : 'EClearBankNo',
					fieldLabel : '银行行号',
					value : e_recordsr[0].get("bank_no"),
					allowBlank : false,
							regex:/^\d+$/,
							regexText : '收款行号只能是数字'
				}, {
					id : 'EClearAdmdivCode',
					xtype : 'combo',
					fieldLabel : '所属财政',
					displayField : 'admdiv_name',
					emptyText : '请选择',
					valueField : 'admdiv_code',
					editable : false,
					store : comboAdmdiv,
					listeners : {
							'select' : function(){
								selectAdmdiv(false,'EClearAdmdivCode');
							}
					}
				}, {
					id : 'EClearFundTypeCode',
					xtype : 'combo',
					fieldLabel : '资金性质',
					displayField : 'name',
					emptyText : '请选择',
					valueField : 'code',
					queryMode : 'local',
					store : comboFundType
				}, {
					id :'AclearPayTypeCode',
					xtype : 'combo',
					fieldLabel : '支付方式',
					displayField: 'name',
					emptyText: '请选择',
					valueField: 'code',
					queryMode : 'local',
					store: comboPayType
				},{
					id : 'EClearOrgCode',
					fieldLabel : '机构类型',
					value : e_recordsr[0].get("org_code"),
					regex:/^\d+$/,
							regexText : '机构类型只能是数字'
				}, {
					id : 'EClearIsSameBank',
					xtype : 'checkbox',
					fieldLabel : '是否同行账户',
					checked : mis_samebank_b
				}, {
					id : 'EClearIsValid',
					xtype : 'checkbox',
					hidden:true,
					fieldLabel : '是否有效',
					checked : mis_valid_b
				}, {
					id : 'EClearIsPbc',
					xtype : 'checkbox',
					fieldLabel : '是否人行账户',
					checked : mis_pbc_b
				}],
		buttons : [{
					formBind : true,
					text : '确定',
					handler : function() {
						if (Ext.getCmp('EClearAccountName').getValue() == "") {
							Ext.Msg.alert("系统提示", "账户名称不能为空！");
						} else if (Ext.getCmp('EClearAccountNo').getValue() == "") {
							Ext.Msg.alert("系统提示", "账号不能为空！");
						} else if (Ext.getCmp('EClearBankName').getValue() == "") {
							Ext.Msg.alert("系统提示", "银行名称不能为空！");
						} else if (Ext.getCmp('EClearAdmdivCode').getValue() == "") {
							Ext.Msg.alert("系统提示", "所属财政不能为空！");
						} else if( !Ext.isEmpty (Ext.getCmp('AclearPayTypeCode').getValue()) 
								&& Ext.isEmpty (Ext.getCmp('EClearFundTypeCode').getValue())){
							Ext.Msg.alert("系统提示", "已选取支付方式，则资金性质不能为空！");
						}
						else if (Ext.getCmp('EClearOrgCode').getValue() == "") { 
							Ext.Msg.alert("系统提示", "机构类型不能为空！");
						} else if( (Ext.getCmp('EClearIsSameBank').getValue() == Ext.getCmp('EClearIsPbc').getValue()) && (Ext.getCmp('EClearIsPbc').getValue() =="1") ) {
								Ext.Msg.alert("系统提示", "同行账户与人行账户不能同时选中！");
						} else {
							var data = gridPanel.getStore().data.items;
							
							for( var i = 0 ; i < data.length ; i++){
								//与其他账户进行比较
								if( accountId != data[i].get('account_id') )
								{
									if(Ext.isEmpty(Ext.getCmp('EClearFundTypeCode').value)){
										if(data[i].get('admdiv_code') == Ext.getCmp('EClearAdmdivCode').value 
												&& !Ext.isEmpty(data[i].get('fund_type_code'))){
											Ext.Msg.alert("系统提示", "已存在与资金性质有关的账户，请重新配置！");
											return;
										}
									}else{
										//支付方式为空时
										if(Ext.isEmpty(Ext.getCmp('AclearPayTypeCode').value)){
											if(data[i].get('admdiv_code') == Ext.getCmp('EClearAdmdivCode').value 
													&& Ext.isEmpty(data[i].get('pay_type_code'))
													&& data[i].get('fund_type_code') == Ext.getCmp('EClearFundTypeCode').value){
												Ext.Msg.alert("系统提示", "该资金性质下已存在与支付方式无关的账户，请重新配置！");
												return;
											}
//											else if(data[i].get('admdiv_code') == Ext.getCmp('EClearAdmdivCode').value 
//													&& data[i].get('fund_type_code') == Ext.getCmp('EClearFundTypeCode').value
//													&& !Ext.isEmpty(data[i].get('pay_type_code'))){
//												Ext.Msg.alert("系统提示", "该资金性质下已存在与支付方式有关的账户，请重新配置！");
//												return;
//											}
										}else{
											if(data[i].get('admdiv_code') == Ext.getCmp('EClearAdmdivCode').value 
													&& data[i].get('fund_type_code') == Ext.getCmp('EClearFundTypeCode').value
													&& Ext.isEmpty(data[i].get('pay_type_code'))){
												Ext.Msg.alert("系统提示", "该资金性质下已存在与支付方式无关的账户，请重新配置！");
												return;
											}
											else if(data[i].get('admdiv_code') == Ext.getCmp('EClearAdmdivCode').value 
													&& data[i].get('fund_type_code') == Ext.getCmp('EClearFundTypeCode').value
													&& data[i].get('pay_type_code') == Ext.getCmp('AclearPayTypeCode').value)
											{
												Ext.Msg.alert("系统提示", "同一资金性质、支付方式只能有一个清算账户！");
												return;
											}
										}
									}
								}
							}
							
							if (Ext.getCmp('EClearIsValid').getValue() == true) {
								e_is_valid = "1";
							}else{
								e_is_valid = "0";
							}
							
							
							if (Ext.getCmp('EClearIsSameBank').getValue() == true) {
								e_is_sameBank = "1";
							}else{
								e_is_sameBank = "0";
							} 
							
							if (Ext.getCmp('EClearIsPbc').getValue() == true) {
								e_is_pbc = "1";
							}else{
								e_is_pbc = "0";
							} 
							
							if (Ext.getCmp('EClearBankNo').getValue() == "") {
								Ext.Msg.alert("系统提示", "跨行清算银行行号不能为空！");
								return;
							}
							editClearAccount(this.up('window'));
							Ext.getCmp('EClearForm').getForm().reset();
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

	Ext.getCmp('EClearAdmdivCode').setValue(e_recordsr[0].get("admdiv_code"));
	Ext.getCmp('EClearFundTypeCode').setValue(e_recordsr[0]
			.get("fund_type_code"));
	Ext.getCmp('AclearPayTypeCode').setValue(e_recordsr[0]
	.get("pay_type_code"));

	var win1 = Ext.widget('window', {
				title : '修改账户',
				width : 350,
				height : 380,
				layout : 'fit',
				resizable : false,
				modal : true,
				items : [editBankAccountDialog]
			}).show();
}

function editClearAccount(win) {
	var myMask = new Ext.LoadMask(Ext.getBody(), {
		msg : '后台正在处理中，请稍后....',
		removeMask : true
			// 完成后移除
		});
	myMask.show();
	// 提交到服务器操作
	Ext.Ajax.request({
				url : 'editClearAccount.do', 
        		method: 'POST',
				timeout:180000,  //设置为3分钟
				params : {
					account_name : Ext.getCmp('EClearAccountName').getValue(),
					account_no : Ext.getCmp('EClearAccountNo').getValue(),
					account_id : accountId,
					bank_name : Ext.getCmp('EClearBankName').getValue(),
					bank_no : Ext.getCmp('EClearBankNo').getValue(),
					admdiv_code : Ext.getCmp('EClearAdmdivCode').getValue(),
					fund_type_code : Ext.getCmp('EClearFundTypeCode')
							.getValue(),
					pay_type_code : Ext.getCmp('AclearPayTypeCode').getValue(),
					org_code : Ext.getCmp('EClearOrgCode').getValue(),
					is_valid : e_is_valid,
					is_samebank : e_is_sameBank,
					is_pbc : e_is_pbc
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

/** ******************************************************************************** */

/*
 * **************************财政零余额*************************************************
 */

function editAdmdivZeroAccountDialog(gridPanel) {

	// 当前选中的数据
	var e_recordsr = gridPanel.getSelectionModel().getSelection();
	if (e_recordsr.length != 1) {
		Ext.Msg.alert("系统提示", "请选择一条数据！");
		return;
	}
	accountId = e_recordsr[0].get("account_id");
	var mis_valid_b = false;
	if ("有效" == e_recordsr[0].get("is_valid")) {
		mis_valid_b = true;
	}
	//设置网点信息
	bankid = e_recordsr[0].get("bank_id");
	
	var editBankAccountDialog = new Ext.FormPanel({
		id : 'EadmdivZeroForm',
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
					id: 'EadmdivZeroAdmdivBankCode',
					xtype: 'textfield',
					fieldLabel: '所属网点',
//					readOnly: 'true',
					disabled : true,
					msgTarget: 'side',
					allowBlank: false,
					value: e_recordsr[0].get("bank_code")
				}/*, {
					id: 'btn_bank_code_Admdiv_edit',
					xtype: 'button',
					text: '查询',
					handler: function(){
						choseBank('EadmdivZeroAdmdivBankCode');
					}
				}*/]
				},{
					fieldLabel : '账户名称',
					id : 'EadmdivZeroAccountName',
					value : e_recordsr[0].get("account_name"),
					vtype:"accountName",
					allowBlank : false
				}, {
					fieldLabel : '账号',
					id : 'EadmdivZeroAccountNo',
					disabled : true,
					value : e_recordsr[0].get("account_no")
				}, {
					xtype : 'combo',
					fieldLabel : '所属财政',
					id : 'EadmdivZeroAdmdivCode',
					displayField : 'admdiv_name',
					emptyText : '请选择',
					valueField : 'admdiv_code',
					allowBlank : false,
					editable : false,
					store : comboAdmdiv
				}, {
					xtype : 'checkbox',
					fieldLabel : '是否有效',
					id : 'EadmdivZeroIsValid',
					checked : mis_valid_b
				}],
		buttons : [{
			text : '确定',
			handler : function() {
				if(this.up("form").getForm().isValid()){
					if (Ext.getCmp('EadmdivZeroIsValid').getValue() == true) {
						e_is_valid = "1";
					}else{
						e_is_valid = "0";
					}
					editAdmdivZeroAccount(this.up('window'));
					Ext.getCmp('EadmdivZeroForm').getForm().reset();
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

	Ext.getCmp('EadmdivZeroAdmdivCode').setValue(e_recordsr[0]
			.get("admdiv_code"));

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
				url : 'editAdmdivZeroAccount.do',
        		method: 'POST',
				timeout:180000,  //设置为3分钟
				params : {
					account_name : Ext.getCmp('EadmdivZeroAccountName').getValue(),
					account_id :accountId,
					account_no : Ext.getCmp('EadmdivZeroAccountNo').getValue(),
					admdiv_code : Ext.getCmp('EadmdivZeroAdmdivCode')
							.getValue(),
					bankid : bankid,
					is_valid : e_is_valid

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

/** ******************************************************************************** */
/*
 * **************************工资统发账户*************************************************
 */
function editSalaryAccountDialog(gridPanel) {

	// 当前选中的数据
	var e_recordsr = gridPanel.getSelectionModel().getSelection();
	if (e_recordsr.length != 1) {
		Ext.Msg.alert("系统提示", "请选择一条数据！");
		return;
	}
	accountId = e_recordsr[0].get("account_id");
	var mis_valid_b = false;
	if ("有效" == e_recordsr[0].get("is_valid")) {
		mis_valid_b = true;
	}
	//设置网点信息
	bankid = e_recordsr[0].get("bank_id");
	
	var editBankAccountDialog = new Ext.FormPanel({
		id : 'ESalaryForm',
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
				items: [/*{
					id: 'ESalaryAccountBankCode',
					xtype: 'textfield',
					fieldLabel: '所属网点',
					readOnly: 'true',
					msgTarget: 'side',
					allowBlank: false,
					value: e_recordsr[0].get("bank_code")
				}/*, {
					id: 'btn_bank_code_Admdiv_edit',
					xtype: 'button',
					text: '查询',
					handler: function(){
						choseBank('EadmdivZeroAdmdivBankCode');
					}
				}*/]
				},{
					fieldLabel : '账户名称',
					id : 'ESalaryAccountName',
					allowBlank:false,
					vtype:"accountName", 
					value : e_recordsr[0].get("account_name")
				}, {
					fieldLabel : '账号',
					id : 'ESalaryAccountNo',
					disabled : false,
					value : e_recordsr[0].get("account_no")
				}, {
					xtype : 'combo',
					fieldLabel : '所属财政',
					id : 'ESalaryAccountAdmdivCode',
					displayField : 'admdiv_name',
					emptyText : '请选择',
					valueField : 'admdiv_code',
					allowBlank : false,
					editable : false,
					store : comboAdmdiv
				}, {
					xtype : 'checkbox',
					fieldLabel : '是否有效',
					id : 'ESalaryAccountIsValid',
					checked : mis_valid_b
				}],
		buttons : [{
			text : '确定',
			handler : function() {
				if(this.up("form").getForm().isValid()){
					if (Ext.getCmp('ESalaryAccountIsValid').getValue() == true) {
						e_is_valid = "1";
					}else{
						e_is_valid = "0";
					}
					editSalaryAccount(this.up('window'));
					Ext.getCmp('ESalaryForm').getForm().reset();
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

	Ext.getCmp('ESalaryAccountAdmdivCode').setValue(e_recordsr[0]
			.get("admdiv_code"));

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

function editSalaryAccount(win) {
	var myMask = new Ext.LoadMask(Ext.getBody(), {
			msg : '后台正在处理中，请稍后....',
			removeMask : true // 完成后移除
		});
	myMask.show();
	// 提交到服务器操作
	Ext.Ajax.request({
				url : 'editSalaryAccount.do',
        		method: 'POST',
				timeout:180000,  //设置为3分钟
				params : {
					account_name : Ext.getCmp('ESalaryAccountName').getValue(),
					account_id :accountId,
					account_no : Ext.getCmp('ESalaryAccountNo').getValue(),
					admdiv_code : Ext.getCmp('ESalaryAccountAdmdivCode')
							.getValue(),
					bankid : bankid,
					is_valid : e_is_valid

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
/****************************************************************************************/
/*
 * **************************垫支户/划款账户*************************************************
 */

function editAdvanceAgentDialog(gridPanel,isAgent) {

	// 当前选中的数据
	var e_recordsr = gridPanel.getSelectionModel().getSelection();
	if (e_recordsr.length != 1) {
		Ext.Msg.alert("系统提示", "请选择一条数据！");
		return;
	}
	var accountId = e_recordsr[0].get("account_id");
	
	//账户类型回显
	var actTypeCode = e_recordsr[0].get("account_type_code");
	
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
		items : [{
					fieldLabel : '账户名称',
					id : 'EagentAccountName',
					vtype:"accountName",
					allowBlank : false,
					afterLabelTextTpl : required,
					value : e_recordsr[0].get("account_name")
				}, {
					fieldLabel : '账号',
					id : 'EagentAccountNo',
					disabled : false,
					afterLabelTextTpl : required,
					value : e_recordsr[0].get("account_no")
				}, {
					xtype : 'combo',
					fieldLabel : '所属财政',
					id : 'EagentAdmdivCode',
					displayField : 'admdiv_name',
					emptyText : '请选择',
					valueField : 'admdiv_code',
					allowBlank : false,
					afterLabelTextTpl : required,
					editable : false,
					store : comboAdmdiv,
					listeners : {
							'select' : function(){
								selectAdmdiv(false,'EagentAdmdivCode');
							}
					}
				}, {
					id : 'EagentfundTypeCode',
					xtype : 'combo',
					fieldLabel : '资金性质',
					dataIndex : 'code',
					displayField : 'name',
					emptyText : '请选择',
					valueField : 'code',
					hidden : isAgent==true?false:true,
					queryMode : 'local',
					editable : true,
					store : comboFundType
				},{
					id : 'EagentAccountTypeCode',
					xtype : 'combo',
					fieldLabel : '账户类型',
					afterLabelTextTpl : required,
					dataIndex : 'account_type_code',
					displayField : 'accont_type_name',
					emptyText : '请选择',
					valueField : 'account_type_code',
					editable : false,
					queryMode : 'local',
					value:actTypeCode,
					store : comboAccountType
				}],
		buttons : [{
					text : '确定',
					formBind:true,
					handler : function() {
						if(this.up("form").getForm().isValid()){ 
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
	Ext.getCmp('EagentfundTypeCode').setValue(e_recordsr[0].get("fund_type_code"));
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
					account_id : e_record[0].get("account_id"),
					account_name : Ext.getCmp('EagentAccountName').getValue(),
					account_no : Ext.getCmp('EagentAccountNo').getValue(),
					admdiv_code : Ext.getCmp('EagentAdmdivCode').getValue(),
					account_type_code : Ext.getCmp('EagentAccountTypeCode').getValue(),
					fund_type_code : Ext.getCmp('EagentfundTypeCode').getValue(),
					is_valid : 1
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

/***********************************************************************************/



/*
 * **************************财政国库资金实有资金账户*************************************************
 */

function editRealFundAccountDialog(gridPanel) {

	// 当前选中的数据
	var e_recordsr = gridPanel.getSelectionModel().getSelection();
	if (e_recordsr.length != 1) {
		Ext.Msg.alert("系统提示", "请选择一条数据！");
		return;
	}
	accountId = e_recordsr[0].get("account_id");
	var mis_valid_b = false;
	if ("有效" == e_recordsr[0].get("is_valid")) {
		mis_valid_b = true;
	}

	var editBankAccountDialog = new Ext.FormPanel({
		id : 'ErealFundForm',
		labelWidth : 75,
		frame : true,
		bodyStyle : 'padding:5px 5px 0',
		width : 350,
		defaults : {
			width : 300
		},
		defaultType : 'textfield',
		items : [{
					id : 'ErealFundAccountName',
					fieldLabel : '账户名称',
					value : e_recordsr[0].get("account_name"),
					vtype:"accountName",
					allowBlank : false
				}, {
					id : 'ErealFundAccountNo',
					fieldLabel : '账号',
					disabled : false,
					value : e_recordsr[0].get("account_no"),
					vtype:"accountId",
					allowBlank : false
				}, {
					id : 'ErealFundAdmdivCode',
					xtype : 'combo',
					fieldLabel : '所属财政',
					displayField : 'admdiv_name',
					emptyText : '请选择',
					valueField : 'admdiv_code',
					editable : true,
					allowBlank : false,
					store : comboAdmdiv,
					listeners : {
							'select' : function(){
								selectAdmdiv(false,'ErealFundAdmdivCode');
							}
					}    
				}, {
					id : 'ErealFundFundTypeCode',
					xtype : 'combo',
					fieldLabel : '资金性质',
					displayField : 'name',
					emptyText : '请选择',
					valueField : 'code',
					editable : true,
					queryMode : 'local',
					store : comboFundType
				},  {
					id : 'ErealFundIsValid',
					xtype : 'checkbox',
					fieldLabel : '是否有效',
					checked : mis_valid_b
				}],
		buttons : [{
					formBind : true,
					text : '确定',
					handler : function() {
//						var data = gridPanel1.getStore().data.items;
						// 当前 数据表格  选中行号
//						var currentIndex = (gridPanel1.getSelectionModel().getSelection( ))[0].index;
							
						// 只有一条记录，无需判断
//						if(data.length>1){
//							// 遍历
//							for( var i = 0 ; i < data.length ; i++){
//								//当 资金性质    为空,不可以
//								if(Ext.isEmpty(Ext.getCmp('ErealFundFundTypeCode').value)){
//									Ext.Msg.alert("系统提示", "已存在与资金性质无关账户，请重新配置！");
//									return;
//								}
//								else{
//									 // 不和自身比较 
//									if(currentIndex != i){
//										if(data[i].get('fund_type_code') == Ext.getCmp('ErealFundFundTypeCode').value){
//											Ext.Msg.alert("系统提示", "一个资金性质 只能维护一个 账户，请重新配置！");
//											return;
//										}
//									}
//									
//								}
//							}
//						}	
							if (Ext.getCmp('ErealFundIsValid').getValue() == true) {
								e_is_valid = "1";
							}else{
								e_is_valid = "0";
							}
							editRealFundAccount(this.up('window'),e_recordsr);
							Ext.getCmp('ErealFundForm').getForm().reset();
							this.up('window').close();
						
						
					}
				}, {
					text : '取消',
					handler : function() {
						this.up('window').close();
					}
				}]
	});

	Ext.getCmp('ErealFundAdmdivCode').setValue(e_recordsr[0].get("admdiv_code"));
	Ext.getCmp('ErealFundFundTypeCode').setValue(e_recordsr[0].get("fund_type_code"));
	var win1 = Ext.widget('window', {
				title : '修改账户',
				width : 350,
				height : 230,
				layout : 'fit',
				resizable : false,
				modal : true,
				items : [editBankAccountDialog]
			}).show();
}

function editRealFundAccount(win,e_record) {
	var myMask = new Ext.LoadMask(Ext.getBody(), {
		msg : '后台正在处理中，请稍后....',
		removeMask : true
			// 完成后移除
		});
	myMask.show();
	// 提交到服务器操作
	Ext.Ajax.request({
				url : 'editRealFundAccount.do', 
        		method: 'POST',
				timeout:180000,  //设置为3分钟
				params : {
					account_id : e_record[0].get("account_id"),
					account_name:Ext.getCmp('ErealFundAccountName').getValue(),
					account_no : Ext.getCmp('ErealFundAccountNo').getValue(),
					admdiv_code : Ext.getCmp('ErealFundAdmdivCode').getValue(),
					fund_type_code : Ext.getCmp('ErealFundFundTypeCode').getValue(),
					//orgCode:Ext.getCmp('EAgentPayeeOrgCode').getValue(),
					is_valid : Ext.getCmp('ErealFundIsValid').getValue()==true?1:0
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

function editAgentPayeeAccount(win,e_record) {
	var myMask = new Ext.LoadMask(Ext.getBody(), {
		msg : '后台正在处理中，请稍后....',
		removeMask : true
			// 完成后移除
		});
	myMask.show();
	// 提交到服务器操作
	Ext.Ajax.request({
				url : 'editAgentPayeeAccount.do', 
        		method: 'POST',
				timeout:180000,  //设置为3分钟
				params : {
					account_id : e_record[0].get("account_id"),
					account_name:Ext.getCmp('EAgentPayeeAccountName').getValue(),
					account_no : Ext.getCmp('EAgentPayeeBankNo').getValue(),
					admdiv_code : Ext.getCmp('EAgentPayeeAdmdivCode').getValue(),
					fund_type_code : Ext.getCmp('EAgentPayeeFundTypeCode').getValue(),
					orgCode:Ext.getCmp('EAgentPayeeOrgCode').getValue(),
					bank_name:Ext.getCmp('EAgentPayeeBankName').getValue(),
					is_valid : e_is_valid
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
/***********************************************************************************/

/*
 * *************************划款收款账户维护*************************************************
 */

function editAgentPayeeAccountDialog(gridPanel) {

	// 当前选中的数据
	var e_recordsr = gridPanel.getSelectionModel().getSelection();
	if (e_recordsr.length != 1) {
		Ext.Msg.alert("系统提示", "请选择一条数据！");
		return;
	}
	accountId = e_recordsr[0].get("account_id");
	var mis_valid_b = false;
	if ("有效" == e_recordsr[0].get("is_valid")) {
		mis_valid_b = true;
	}

	var editAgentPayeeAccountDialog = new Ext.FormPanel({
		id : 'EAgentPayeeForm',
		labelWidth : 75,
		frame : true,
		bodyStyle : 'padding:5px 5px 0',
		width : 350,
		defaults : {
			width : 300
		},
		defaultType : 'textfield',
		items : [{
					id : 'EAgentPayeeAccountName',
					fieldLabel : '账户名称',
					value : e_recordsr[0].get("account_name")
				}, {
					id : 'EAgentPayeeAccountNo',
					fieldLabel : '账号',
					disabled : false,
					value : e_recordsr[0].get("account_no")
				},{
					id :'EAgentPayeeBankName',
					fieldLabel : '银行名称',
					value : e_recordsr[0].get("bank_name")	
				},{
					id :'EAgentPayeeBankNo',
					fieldLabel : '银行行号',
					value : e_recordsr[0].get("bank_no")
				}, {
					id : 'EAgentPayeeAdmdivCode',
					xtype : 'combo',
					fieldLabel : '所属财政',
					displayField : 'admdiv_name',
					emptyText : '请选择',
					valueField : 'admdiv_code',
					editable : false,
					store : comboAdmdiv,
					listeners : {
							'select' : function(){
								selectAdmdiv(false,'EAgentPayeeAdmdivCode');
							}
					}
				}, {
					id : 'EAgentPayeeFundTypeCode',
					xtype : 'combo',
					fieldLabel : '资金性质',
					displayField : 'name',
					emptyText : '请选择',
					valueField : 'code',
					editable : false,
					queryMode : 'local',
					store : comboFundType
				}, {
					id : 'EAgentPayeeOrgCode',
					fieldLabel : '机构类型',
					value : e_recordsr[0].get("org_code")
				},  {
					id : 'EAgentPayeeIsValid',
					xtype : 'checkbox',
					fieldLabel : '是否有效',
					checked : mis_valid_b
				}],
		buttons : [{
					text : '确定',
					handler : function() {
						if (Ext.getCmp('EAgentPayeeAccountName').getValue() == "") {
							Ext.Msg.alert("系统提示", "账户名称不能为空！");
						} else if (Ext.getCmp('EAgentPayeeAccountNo').getValue() == "") {
							Ext.Msg.alert("系统提示", "账号不能为空！");
						} else if (Ext.getCmp('EAgentPayeeAdmdivCode').getValue() == "") {
							Ext.Msg.alert("系统提示", "所属财政不能为空！");
						} else if (Ext.getCmp('EAgentPayeeBankName').getValue() == "") {
							Ext.Msg.alert("系统提示", "银行名称不能为空！");
						}else if (Ext.getCmp('EAgentPayeeBankNo').getValue() == "") {
							Ext.Msg.alert("系统提示", "银行行号不能为空！");
						}else {
							if (Ext.getCmp('EAgentPayeeIsValid').getValue() == true) {
								e_is_valid = "1";
							}else{
								e_is_valid = "0";
							}
							editAgentPayeeAccount(this.up('window'),e_recordsr);
							Ext.getCmp('EAgentPayeeForm').getForm().reset();
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

	Ext.getCmp('EAgentPayeeAdmdivCode').setValue(e_recordsr[0].get("admdiv_code"));
	Ext.getCmp('EAgentPayeeFundTypeCode').setValue(e_recordsr[0].get("fund_type_code"));

	var win1 = Ext.widget('window', {
				title : '修改账户',
				width : 350,
				height : 300,
				layout : 'fit',
				resizable : false,
				modal : true,
				items : [editAgentPayeeAccountDialog]
			}).show();
}


/** ******************************************************************************** */

/** ******************************************************************************** */
/*
 * 内部挂账账户
 */

function editInnerHangingAccountDialog(gridPanel) {
	
	// 当前选中的数据
	var e_recordsr = gridPanel.getSelectionModel().getSelection();
	if (e_recordsr.length != 1) {
		Ext.Msg.alert("系统提示", "请选择一条数据！");
		return;
	}
	accountId =  e_recordsr[0].get("account_id");
	var mis_valid_b = false;
	if ("有效" == e_recordsr[0].get("is_valid")) {
		mis_valid_b = true;
	}
	//设置bankId为原来的值
	bankid = e_recordsr[0].get("bank_id");

	var editInnerHangingAccountDialog = new Ext.FormPanel({
		id : 'EagencyZeroForm',
		labelWidth : 75,
		frame : true,
		bodyStyle:'padding:5px 5px 0 5px',
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
					id: 'EagencyZeroAccountBankCode',
					xtype: 'textfield',
					fieldLabel: '所属网点',
					readOnly: 'true',
					msgTarget: 'side',
					allowBlank: false,
					value: e_recordsr[0].get("bank_code")
				}, {
					id: 'btn_bank_code_Agency_edit',
					xtype: 'button',
					text: '查询',
					handler: function(){
						choseBank('EagencyZeroAccountBankCode');
					}
				}]
				},{
					fieldLabel : '账户名称',
					id : 'EagencyZeroAccountName',
					value : e_recordsr[0].get("account_name")
				},{
					fieldLabel : '账号',
					id : 'EagencyZeroAccountNo',
					disabled : true,
					value : e_recordsr[0].get("account_no")
				}, {
					xtype : 'combo',
					fieldLabel : '所属财政',
					id : 'EagencyZeroAdmdivCode',
					displayField : 'admdiv_name',
					emptyText : '请选择',
					valueField : 'admdiv_code',
					allowBlank : false,
					editable : false,
					store : comboAdmdiv
				}, {
					xtype : 'checkbox',
					fieldLabel : '是否有效',
					id : 'EagencyZeroIsValid',
					checked : mis_valid_b
				}],
		buttons : [{
			text : '确定',
			handler : function() {
				var index = gridPanel.getStore().findBy(function(record,id){
					var a = Ext.getCmp("EagencyZeroAccountBankCode").getValue();
					var b = record.get("bank_code");
					if(a.indexOf(b) != -1) {
						return true;
					}
					return false;
				});
				if (Ext.getCmp('EagencyZeroAccountName').getValue() == "") {
					Ext.Msg.alert("系统提示", "账户名称不能为空！");
				} else if (Ext.getCmp('EagencyZeroAccountNo').getValue() == "") {
					Ext.Msg.alert("系统提示", "账号不能为空！");
				} else if (Ext.getCmp('EagencyZeroAdmdivCode').getValue() == "") {
					Ext.Msg.alert("系统提示", "所属财政不能为空！");
				} 
				//一个网点只能有一个内部挂账账户
				else if (index == true) {
					Ext.Msg.alert("系统提示", "该网点已有挂账户，至多维护一个！");
				} 
				else {
					if (Ext.getCmp('EagencyZeroIsValid').getValue() == true) {
						e_is_valid = "1";
					}else{
						e_is_valid = "0";
					}
					editInnerHangingAccount(this.up('window'));
					Ext.getCmp('EagencyZeroForm').getForm().reset();
					this.up('window').close();

				}
			}
		}, {
			text : '取消',
			handler : function() {
				this.up('form').getForm().reset();
				this.up('window').close();
			}
		}]
	});
	Ext.getCmp('EagencyZeroAdmdivCode').setValue(e_recordsr[0]
			.get("admdiv_code"));

	var win1 = Ext.widget('window', {
				title : '修改账户',
				width : 400,
				autoHeight:true,
				layout : 'fit',
				resizable : false,
				modal : true,
				items : [editInnerHangingAccountDialog]
			}).show();
}

function editInnerHangingAccount(win) {
	var myMask = new Ext.LoadMask(Ext.getBody(), {
		msg : '后台正在处理中，请稍后....',
		removeMask : true
			// 完成后移除
		});
	myMask.show();
	// 提交到服务器操作
	Ext.Ajax.request({
				url : 'editInnerHangingAccount.do',//
				method : 'POST',
				timeout : 180000, // 设置为3分钟
				form : "editform",
				timeout : 3000,
				params : {
					account_name : Ext.getCmp('EagencyZeroAccountName').getValue(),
					account_no : Ext.getCmp('EagencyZeroAccountNo').getValue(),
					account_id : accountId,
					bankid : bankid,
					is_valid : e_is_valid,
					admdiv_code : Ext.getCmp('EagencyZeroAdmdivCode').getValue()
				},
				// 提交成功的回调函数
				success : function(response, options) {
					succAjax(response,myMask,true);
				},
				// 提交失败的回调函数
				failure : function(response, options) {
					failAjax(response,myMask);
					refreshData();
				}
			});
}


/** ******************************************************************************** */

