/*******************************************************************************
 * 主要用于授权支付托收
 * 
 * @type
 */

/***
 * 引入需要使用的js文件
 */
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/recommend.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/operationLog.js"></scr' + 'ipt>');
document.write('<scr'+ 'ipt type="text/javascript" src="/realware/resources/js/share/ocxVoucher.js"></scr'+ 'ipt>');
	

var voucherPanel = null;

/**
 * 数据项
 */

var fileds = ["admdiv_code", "year","vt_code", "create_date","trans_serial_no","trans_date",
		"ori_pay_voucher_code","trans_serial_id", "payee_account_no", "payee_account_name", 
		"payee_account_bank","pay_account_no", "pay_account_name", "pay_account_bank", 
		"income_amount","pay_summary_name","refund_remark", "is_match","refund_status","remark","last_ver","task_id"];

/**
 * 列名
 */
var header = " 原支付凭证号|ori_pay_voucher_code|140,退款流水号|trans_serial_no|140,退款金额|income_amount|100,收款人账号|payee_account_no,收款人名称|payee_account_name|140,"
			+ "收款人银行|payee_account_bank|140,付款人账号|pay_account_no,付款人名称|pay_account_name|140,付款人银行|pay_account_bank|140,退款日期|trans_date," 
			+"申请日期|create_date|140,退款原因|refund_remark,用途名称|pay_summary_name,备注|remark,匹配状态|is_match,退款状态|refund_status";

/*******************************************************************************
 * 匹配状态
 */
var comboStore = Ext.create('Ext.data.Store', {
			fields : ['name', 'value'],
			data : [{
				      "name" : "全部",
				      "value" : ''
			        },{
						"name" : "未匹配",
						"value" : 1
					}, {
						"name" : "已匹配",
						"value" : 2
					}]
		});

/*******************************************************************************
 * 退款状态
 */
var comboStore1 = Ext.create('Ext.data.Store', {
			fields : ['name', 'value'],
			data : [{
				       "name" : "全部",
				       "value" : ''
			        },{
						"name" : "待处理",
						"value" : 1
					}, {
						"name" : "已提交",
						"value" : 2
					}]
		});

/*******************************************************************************
 * 界面加载
 */
Ext.onReady(function() {
	Ext.QuickTips.init();
	//引用工具类
	Ext.Loader.setPath('Ext', 'js/util');
	Ext.require(['Ext.PageUtil']);
	if (voucherPanel == null) {
		voucherPanel = getGrid(loadUrl, header, fileds, true, true);
		voucherPanel.setHeight(document.documentElement.scrollHeight - 95);
		// 根据查询条件检索数据
		voucherPanel.getStore().on('beforeload', function(thiz, options) {
			beforeload(Ext.getCmp("refundCheckQuery"), options, Ext.encode(fileds));
		});
	}
	
	//按钮区
	var buttonItems = [{
				id : 'input',
				handler : function() {
					voucherInput();
				}
			}, {
				id : 'delete',
				handler : function() {
					Ext.Msg.confirm("系统提示","是否要删除选中的凭证？",function(e) {
						if (e == "yes") {
							voucherInvalidate();
						}
					});
				}
			}, {
				id :'update',
				handler : function() {
				    voucherUpdate(voucherPanel);
				}
			}, {
				id : 'refresh',
				handler : function() {
					refreshData();
				}
			}];
	//查询区
	var queryItems = [{
				id : 'refundCheckQuery',
				title : "查询区",
				bodyPadding : 8,
				layout : 'hbox',
				defaults : {
					margins : '3 5 0 0'
				},
				items : [{
			         id : 'taskState',
			         fieldLabel : '匹配状态',
			         xtype : 'combo',
			         dataIndex : 'is_match',
			         displayField : 'name',
			         emptyText : '请选择',
			         valueField : 'value',
			         labelWidth : 60,
			         width : 160,
			         store : comboStore,
			         value : '',
			         editable : false,
			         listeners : {
							'select' : selectState
						}
		           }, {
						id : 'taskState1',
						fieldLabel : '退款状态',
						xtype : 'combo',
						dataIndex : 'refund_status',
						displayField : 'name',
						emptyText : '请选择',
						valueField : 'value',
						labelWidth : 60,
						width : 160,
						store : comboStore1,
						value : '',
						editable : false,
						listeners : {
							'select' : selectState
						}
					}, {
						id : 'admdivCom',
						fieldLabel : '所属财政',
						xtype : 'combo',
						dataIndex : 'admdiv_code',
						displayField : 'admdiv_name',
						emptyText : '请选择',
						valueField : 'admdiv_code',
						labelWidth : 60,
						width : 200,
						store : comboAdmdiv,
						editable : false
					}, {
						id : 'vouDate',
						fieldLabel : '申请日期',
						xtype : 'datefield',
						dataIndex : 'create_date',
						format : 'Y-m-d',
						labelWidth : 60,
						data_type : 'date',
						data_format : 'yyyy-MM-dd',
						width : 160
					}
				]}, voucherPanel];
	
	Ext.StatusUtil.createViewport(buttonItems, queryItems, function() {
		Ext.StatusUtil.initPage(Ext.getCmp("admdivCom"), null);
	});	
});

/*******************************************************************************
 * 切换状态
 * 
 * @return
 */

function selectState() {
	var taskState = Ext.getCmp('taskState').getValue();
	if (0 == taskState) {
		Ext.getCmp('input').enable(false);
		Ext.getCmp('delete').enable(false);
	} else if (1 == taskState) {
		Ext.getCmp('input').disable(false);
		Ext.getCmp('delete').disable(false);
	}
	refreshData();
}

/*******************************************************************************
 * 录入
 */
function voucherInput() {
	Ext.Ajax.request({
		url : '/realware/loadAgencyZeros.do',
		method : 'POST',
		timeout : 180000, // 设置为3分钟
		params : {
		     admdiv_code:Ext.getCmp("admdivCom").getValue(),
		     menu_id :  Ext.PageUtil.getMenuId()
		},
		// 提交成功的回调函数
		success : function(response, options) {
			var agencyZero =  Ext.create('Ext.data.Store', {
				fields : ['account_no', 'account_name', 'bank_name'],
				data : response
			  });
			Ext.widget('window', {
				title : '自助柜面退款流水录入',
				width : 370,
				height :450,
				layout : 'fit',
				resizable : false,
				modal : true,
				items : Ext.widget('form', {
					bodyStyle : 'padding:5px 5px 0',
					defaults : {
						width : 300,
						labelWidth : 120
					},
					defaultType : 'textfield',
					items : [ {
						fieldLabel : '退款流水号',
						name : 'trans_serial_no',
						allowBlank : false
					}, {
						fieldLabel : '对方账号',
						name : 'pay_account_no',
						allowBlank : false
					}, {
						fieldLabel : '对方名称',
						name : 'pay_account_name',
						allowBlank : false
					}, {
						fieldLabel : '对方银行',
						name : 'pay_account_bank',
						allowBlank : false
					}, {
						fieldLabel : '零余额帐号',
						name : 'payee_account_no',
						id : 'payeeaccountno',
						allowBlank : false,
						xtype : 'combo',
						dataIndex : 'account_no',
						displayField: 'account_no',
						emptyText: '请选择',
						valueField: 'account_no',
						editable :false,
						store: agencyZero,
						listeners : {
								'select' : function(){
						            var index = agencyZero.find('account_no',Ext.getCmp('payeeaccountno').getValue());   

						            Ext.getCmp('payeeaccountname').setValue(agencyZero.getAt(index).get('account_name')); 
						            
						            Ext.getCmp('payeeaccountbank').setValue(agencyZero.getAt(index).get('bank_name')); 
								}
						}
					}, {	
						fieldLabel : '零余额帐号名称',
						name : 'payee_account_name',
						id : 'payeeaccountname',
						allowBlank : false,
						readOnly : true
					}, {
						fieldLabel : '零余额银行',
						name : 'payee_account_bank',
						id : 'payeeaccountbank',
						allowBlank : false,
						readOnly : true
					}, {
						fieldLabel : '退款金额',
						name : 'income_amount',
						xtype : 'numberfield',
						minValue : 0,
						allowBlank : false
					}, {
						fieldLabel : '退款日期',
						name : 'trans_date',
						xtype : 'datefield',
						format : 'Ymd',
						allowBlank : false
					}, {
						fieldLabel : '退款原因',
						name : 'refund_remark',
						allowBlank : false
					}, {
						fieldLabel : '用途名称',
						name : 'pay_summary_name'
					}, {
						name : 'remark',
						fieldLabel : '备注',
						width : '300',
						xtype : 'textareafield',
						anchor : '100%'
				} ],
				buttons : [{
							text : '确定',
							handler : function() {
							var form = this.up('form').getForm();
							var window = this.up('window');
							if (form.isValid()) {
								form.submit({
											url : '/realware/addRefundVoucher.do',
											method : 'POST',
											timeout : 180000, // 设置为3分钟
											waitTitle : '提示',
											waitMsg : '后台正在处理中，请您耐心等候...',
											params: {
												admdiv_code:Ext.getCmp("admdivCom").getValue()
											},
											success : function(form, action) {
												succForm(form, action);
												window.close();
												refreshData();
											},
											failure : function(form, action) {
												failForm(form, action);
											}
								});
							}}
						}, {
							text : '取消',
							handler : function() {
								this.up('window').close();
							}
						} ]
				})
			}).show();
		},
		// 提交失败的回调函数
		failure : function(response, options) {
			if (response.status == -1) {
				Ext.Msg.alert("系统提示", "托收录入超时，可能存在网络异常，检查后请重试...");
			} else {
				Ext.Msg.show({
						title : '失败提示',
						msg : response.responseText,
						buttons : Ext.Msg.OK,
						icon : Ext.MessageBox.ERROR
						});
				}
			}
	});
}

/**********************************************************
 * 修改
 */
function voucherUpdate(gridPanel) {
	// 当前选中的数据
	var e_recordsr = gridPanel.getSelectionModel().getSelection();
	if (e_recordsr.length != 1) {
		Ext.Msg.alert("系统提示", "请选择一条数据！");
		return;
	}
	accountId =  e_recordsr[0].get("trans_serial_id");


	Ext.Ajax.request({
		url : '/realware/loadAgencyZeros.do',
		method : 'POST',
		timeout : 180000, // 设置为3分钟
		params : {
		     admdiv_code:Ext.getCmp("admdivCom").getValue(),
		     menu_id :  Ext.PageUtil.getMenuId()
		},
		// 提交成功的回调函数
		success : function(response, options) {
			var agencyZero =  Ext.create('Ext.data.Store', {
				fields : ['account_no', 'account_name', 'bank_name'],
				data : response
			  });
			
			
			var editBankAccountDialog = new Ext.FormPanel({
				id : 'EagencyZeroForm',
				frame:true,
			    bodyStyle:'background:#FFFFFF;padding:0px 0px 0 0px',
				defaultType: 'textfield',
				items : [ {
					fieldLabel : '退款流水号',
					name : 'trans_serial_id',
					hidden : true
				},{
					fieldLabel : '退款流水号',
					name : 'trans_serial_no',
					allowBlank : false
				},{
					fieldLabel : '收款人账号',
					name : 'payee_account_no',
					allowBlank : false
				}, {
					fieldLabel : '收款人银行',
					name : 'payee_account_bank',
					allowBlank : false
				}, {
					fieldLabel : '收款人名称',
					name : 'payee_account_name',
					allowBlank : false
				}, {
					fieldLabel : '付款人账号',
					name : 'pay_account_no',
					id : 'payaccountno',
					allowBlank : false,
					xtype : 'combo',
					dataIndex : 'account_no',
					displayField: 'account_no',
					emptyText: '请选择',
					valueField: 'account_no',
					editable :false,
					store: agencyZero,
					listeners : {
							'select' : function(){
					            var index = agencyZero.find('account_no',Ext.getCmp('payaccountno').getValue());   

					            Ext.getCmp('payaccountname').setValue(agencyZero.getAt(index).get('account_name')); 
					            
					            Ext.getCmp('payaccountbank').setValue(agencyZero.getAt(index).get('bank_name')); 
							}
					}
				}, {	
					fieldLabel : '付款人名称',
					name : 'pay_account_name',
					id : 'payaccountname',
					allowBlank : false,
					readOnly : true
				}, {
					fieldLabel : '付款人银行',
					name : 'pay_account_bank',
					id : 'payaccountbank',
					allowBlank : false,
					readOnly : true
				}, {
					fieldLabel : '退款金额',
					name : 'income_amount',
					xtype : 'numberfield',
					minValue : 0,
					allowBlank : false
				}, {
					fieldLabel : '退款日期',
					name : 'trans_date',
					xtype : 'datefield',
					format : 'Ymd',
					allowBlank : false
				}, {
					fieldLabel : '退款原因',
					name : 'refund_remark',
					allowBlank : false
				}, {
					fieldLabel : '用途名称',
					name : 'pay_summary_name'
				}, {
					name : 'remark',
					fieldLabel : '备注',
					width : '300',
					xtype : 'textareafield',
					anchor : '100%'
			}
						
						],
				buttons : [
				   {
					text : '确定',
					handler : function() {
//						if (Ext.getCmp('EagencyZeroForm').getForm().findField('trans_serial_no').getValue() == "") {
//							Ext.Msg.alert("系统提示", "退款流水号不能为空！");
//						} else if (Ext.getCmp('EagencyZeroForm').getForm().findField('payee_account_no').getValue() == "") {
//							Ext.Msg.alert("系统提示", "收款人账号不能为空！");
//						} else if (Ext.getCmp('EagencyZeroForm').getForm().findField('payee_account_name').getValue() == "") {
//							Ext.Msg.alert("系统提示", "收款人名称不能为空！");
//						} else if (Ext.getCmp('EagencyZeroForm').getForm().findField('payee_account_bank').getValue() == "") {
//							Ext.Msg.alert("系统提示", "收款人银行不能为空！");
//						} else {
						if(Ext.getCmp('EagencyZeroForm').getForm().isValid()){
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
			
			editBankAccountDialog.getForm().loadRecord(e_recordsr[0]);
			
			var win1 = Ext.widget('window', {
						title : '修改自助柜面退款流水',
						width : 370,
						height :450,
						layout : 'fit',
						resizable : false,
						modal : true,
						items : [editBankAccountDialog]
					}).show();
		},
		// 提交失败的回调函数
		failure : function(response, options) {
			if (response.status == -1) {
				Ext.Msg.alert("系统提示", "托收录入超时，可能存在网络异常，检查后请重试...");
			} else {
				Ext.Msg.show({
						title : '失败提示',
						msg : response.responseText,
						buttons : Ext.Msg.OK,
						icon : Ext.MessageBox.ERROR
						});
				}
			}
	});
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
				url : 'editRefundVoucher.do',
				method : 'POST',
				timeout : 180000, // 设置为3分钟
				form : "editform",
				timeout : 3000,
				params : {
		            trans_serial_id : Ext.getCmp('EagencyZeroForm').getForm().findField('trans_serial_id').getValue(),
		            trans_serial_no : Ext.getCmp('EagencyZeroForm').getForm().findField('trans_serial_no').getValue(),
		            payee_account_no : Ext.getCmp('EagencyZeroForm').getForm().findField('payee_account_no').getValue(),
		            payee_account_name : Ext.getCmp('EagencyZeroForm').getForm().findField('payee_account_name').getValue(),

		            payee_account_bank : Ext.getCmp('EagencyZeroForm').getForm().findField('payee_account_bank').getValue(),
		            pay_account_no : Ext.getCmp('EagencyZeroForm').getForm().findField('pay_account_no').getValue(),
		            pay_account_name : Ext.getCmp('EagencyZeroForm').getForm().findField('pay_account_name').getValue(),
		            pay_account_bank : Ext.getCmp('EagencyZeroForm').getForm().findField('pay_account_bank').getValue(),
		            
		            income_amount : Ext.getCmp('EagencyZeroForm').getForm().findField('income_amount').getValue(),
		            trans_date : Ext.getCmp('EagencyZeroForm').getForm().findField('trans_date').getValue(),
		            refund_remark : Ext.getCmp('EagencyZeroForm').getForm().findField('refund_remark').getValue(),
		            pay_summary_name : Ext.getCmp('EagencyZeroForm').getForm().findField('pay_summary_name').getValue(),
		            remark : Ext.getCmp('EagencyZeroForm').getForm().findField('remark').getValue(),
		            
		            menu_id :  Ext.PageUtil.getMenuId()
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

/*******************************************************************************
 * 删除
 */
function voucherInvalidate() {
	var records = voucherPanel.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请选中凭证信息！");
		return;
	} else {
		var reqIds = []; // 凭证主键字符串
		Ext.Array.each(records, function(model) {
				reqIds.push(model.get("trans_serial_id"));
			});
		var myMask = new Ext.LoadMask(Ext.getBody(), {
						msg : '后台正在处理中，请稍后....',
						removeMask : true // 完成后移除
		});
		myMask.show();
		Ext.Ajax.request({
				url : '/realware/delRefundSerial.do',
				method : 'POST',
				timeout : 180000, // 设置为3分钟
				params : {
					billIds : Ext.encode(reqIds),
					menu_id :  Ext.PageUtil.getMenuId()
				},
				//提交成功的回调函数
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

}


/*******************************************************************************
 * 刷新
 * 
 * @return
 */
function refreshData() {
	voucherPanel.getStore().loadPage(1);
}