/*******************************************************************************
 * 主要用于划款凭证
 * 
 * @type
 */

/***
 * 引入需要使用的js文件
 */
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/recommend.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/operationLog.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/ocxVoucher.js"></scr' + 'ipt>');

// 凭证信息
var fileds1 = ["pay_voucher_code", "vou_date", "pay_amount",
		"payee_account_no", "payee_account_name", "payee_account_bank",
		"payee_account_bank_no", "pay_account_no", "pay_account_name",
		"pay_account_bank", "pay_bank_code", "pay_bank_name",
		"clear_bank_code", "clear_bank_name", "checkNo", "fund_deal_mode_code",
		"fund_deal_mode_name", "fund_type_code", "fund_type_name",
		"pay_type_code", "pay_type_name", "set_mode_code", "set_mode_name",
		"pay_summary_code", "pay_summary_name", "task_id", "pay_voucher_id",
		"bill_type_id"];

var header1 = "凭证号|pay_voucher_code|130,凭证日期|vou_date|100,支付金额|pay_amount|100,收款人账号|payee_account_no|130,"
		+ "收款人名称|payee_account_name|140,收款人银行|payee_account_bank|140,收款行行号|payee_account_bank_no,"
		+ "付款人账号|pay_account_no,付款人名称|pay_account_name|140,付款人银行|pay_account_bank|140,代理银行编码|pay_bank_code,"
		+ "代理银行名称|pay_bank_name,清算银行编码|clear_bank_code,清算银行名称|clear_bank_name,支票号|checkNo,办理方式编码|fund_deal_mode_code,"
		+ "办理方式名称|fund_deal_mode_name,资金性质编码|fund_type_code,资金性质名称|fund_type_name,支付方式编码|pay_type_code,"
		+ "支付方式名称|pay_type_name,结算方式编码|set_mode_code,结算方式名称|set_mode_name,用途编码|pay_summary_code,"
		+ "用途名称|pay_summary_name";

// 划款信息
var fileds2 = ["pay_clear_voucher_code", "pay_amount", "agent_account_no",
		"agent_account_name", "agent_bank_name", "clear_account_no",
		"clear_account_name", "clear_bank_name", "fund_type_code",
		"fund_type_name", "pay_type_code", "pay_type_name", "pay_bank_code",
		"pay_bank_name", "clear_date", "confirm_date", "bgt_type_code",
		"bgt_type_name", "pay_clear_voucher_id", "bill_type_id"];

var header2 = "查看支付凭证|do1|130|lookPayVoucher,凭证号|pay_clear_voucher_code|130,金额|pay_amount|100,收款银行账号|agent_account_no|150,收款银行账户名称|agent_account_name|150,收款银行名称|agent_bank_name|150,"
		+ "付款银行账号|clear_account_no|150,付款银行账户名称|clear_account_name|150,付款银行名称|clear_bank_name|150,资金性质编码|fund_type_code,资金性质名称|fund_type_name,"
		+ "支付方式编码|pay_type_code,支付方式名称|pay_type_name,代理银行编码|pay_bank_code,代理银行名称|pay_bank_name,清算日期|clear_date,回单日期|confirm_date,"
		+ "预算类型编码|bgt_type_code,预算类型名称|bgt_type_name";

// 凭证
var voucherPanel = null;

// 划款
var clearPanel = null;

var comboStore = Ext.create('Ext.data.Store', {
			fields : ['name', 'value'],
			data : [{
						"name" : "未签章",
						"value" : "001"
					}, {
						"name" : "已签章",
						"value" : "002"
					}]
		});

/*******************************************************************************
 * 初始化
 */
Ext.onReady(function() {
			// 初始化Ext.QuickTips，启用悬浮提示
			Ext.QuickTips.init();
			clearPanel = getGrid(loadClearUrl, header2, fileds2, true, true);
			clearPanel.title = "划款凭证列表信息";
			// 设置高度
			clearPanel.setHeight(document.documentElement.scrollHeight - 88);
			// 根据查询条件检索数据
			clearPanel.getStore().on('beforeload', function(thiz, options) {
				var admdiv = Ext.getCmp('admdiv').getValue();
				if (admdiv == null || admdiv == "")
					return;
				beforeload(Ext.getCmp("clearQuery"), options, Ext.encode(fileds2));
				var jsonMap = options.params["jsonMap"];
				options.params["jsonMap"] = jsonMap.substring(0, jsonMap.length- 2) + ",\"task_state\": [\"=\",\"002\"]}]";
			});
			Ext.create('Ext.Viewport', {
						id : 'createAndSendClearFrame',
						layout : 'fit',
						items : [Ext.create('Ext.panel.Panel', {
									tbar : [{
										id : 'buttongroup',
										xtype : 'buttongroup',
										items : [{
											id : 'check',
											text : '对账',
											iconCls : 'audit',
											scale : 'small',
											handler : function() {
												var admdiv_code = Ext
														.getCmp('admdiv')
														.getValue();
												checkVoucherAmt(admdiv_code);
											}
										}, {
											id : 'create',
											text : '生成',
											iconCls : 'audit',
											scale : 'small',
											handler : function() {
												var admdiv_code = Ext
														.getCmp('admdiv')
														.getValue();
												createVoucher(admdiv_code);
											}
										}, {
											id : 'uncreate',
											text : '撤销生成',
											iconCls : 'unaudit',
											scale : 'small',
											handler : function() {
												uncreateVoucher();
											}
										}, {
											id : 'look',
											text : '查看凭证',
											iconCls : 'look',
											scale : 'small',
											handler : function() {
												lookOCX(clearPanel.getSelectionModel().getSelection(),"pay_clear_voucher_id");
											}
										}, {
											id : 'log',
											text : '查看操作日志',
											iconCls : 'log',
											scale : 'small',
											handler : function() {
												taskLog(clearPanel.getSelectionModel().getSelection(),"pay_clear_voucher_id");
											}
										}, {
											id : 'refresh',
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
										items : clearPanel,
										tbar : {
											id : 'clearQuery',
											xtype : 'toolbar',
											bodyPadding : 8,
											layout : 'hbox',
											defaults : {
												margins : '3 5 0 0'
											},
											items : [{
												id : 'admdiv',
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
												value : comboAdmdiv.data.length > 0
														? comboAdmdiv.data
																.getAt(0)
																.get("admdiv_code")
														: "",
												listeners : {
													'select' : selectAdmdiv
												}
											}, {
												id : 'code',
												fieldLabel : '凭证号',
												xtype : 'textfield',
												symbol : '>=',
												labelWidth : 45,
												width : 140,
												dataIndex : 'pay_clear_voucher_code'
											}, {
												id : 'codeEnd',
												fieldLabel : '至',
												xtype : 'textfield',
												labelWidth : 15,
												width : 120,
												symbol : '<=',
												dataIndex : 'pay_clear_voucher_code'
											}, {
												id : 'createDate',
												fieldLabel : '生成日期',
												xtype : 'datefield',
												dataIndex : 'create_date',
												format : 'Ymd',
												labelWidth : 60,
												maxValue : new Date(),
												width : 160
											}]
										}
									}]
								})]
					});
			setBtnVisible(Ext.getCmp("admdiv").getValue(), Ext.getCmp("buttongroup"));
			selectState();
		});

function selectState() {
	refreshData();
}

/*******************************************************************************
 * 所属财政
 */
function selectAdmdiv() {
	setBtnVisible(Ext.getCmp("admdiv").getValue(), null);
	refreshData();
}

//是否进行第二次判断
var sec = true;
/*******************************************************************************
 * 对账
 */
function checkVoucherAmt(admdiv_code) {
	var records = null;
	var myMask = new Ext.LoadMask(Ext.getBody(), {
		msg : '对账中，请稍后....',
		removeMask : true
			// 完成后移除
		});
	myMask.show();
	var jsonStr = [];
	jsonStr[0] = "=";
	jsonStr[1] = "001";
	Ext.Ajax.request({
		url : loadPayUrl,
		method : 'POST',
		timeout : 180000, // 设置为3分钟
		params : {
			jsonMap : "[{\"task_state\":" + Ext.encode(jsonStr)
					+ ",\"admdiv_code\":[\"=\",\"" + admdiv_code + "\"]}]",
			filedNames : JSON.stringify(fileds1)
		},
		success : function(response, options) {
			var json = (new Function("return " + response.responseText))();
			myMask.hide();
			Ext.widget('window', {
				id : 'checkWindow',
				width : 350,
				height : 190,
				layout : 'fit',
				resizable : true,
				modal : true,
				items : Ext.widget('form', {
					id : 'checkForm1',
					layout : {
						type : 'vbox',
						align : 'stretch'
					},
					border : false,
					bodyPadding : 5,
					items : [{
								id : 'oamt',
								fieldLabel : '待对账金额',
								xtype : 'textfield',
								labelWidth : 85,
								disabled : false
							}, {
								id : 'damt',
								fieldLabel : '支付总金额',
								xtype : 'textfield',
								labelWidth : 85,
								disabled : true
							}, {
								id : 'remark',
								fieldLabel : '备注',
								xtype : 'textareafield',
								labelWidth : 85,
								disabled : false
							}],
					buttons : [{
						text : '确定',
						handler : function() {
							if (this.up('form').getForm().isValid()) {
								var dt = Ext.getCmp("damt").getValue();
								var ot = Ext.getCmp("oamt").getValue();
								if ("" == dt || null == dt) {
									Ext.Msg.alert("系统提示", "请输入待对账金额！");
								}
								var remark = Ext.getCmp("remark").getValue();
								if (sec) {
									var suc = dt == ot ? true : false;
									if (s) {
										Ext.Msg.alert("系统提示", "对账成功！");
									} else {
										Ext.Msg.confirm("系统提示", "是否录入原因请示主管？",
												function(e) {
													if (e == "yes") {
														sec = false;
														return;
													}
												});
									}
								}
								if (!sec && ("" == remark || null == remark)) {
									Ext.Msg.alert("系统提示", "对账不成功，需录入备注！");
								}
								myMask.show();
								// 记录对账日志
								Ext.Ajax.request({
									url : '/realware/checkVoucherAmt.do',
									method : 'POST',
									timeout : 180000, // 设置为3分钟
									async : false,// 添加该属性即可同步,
									params : {
										damount : dt,
										oamount : ot,
										Remark : remark
									},
									success : function(response, options) {
										myMask.hide();
										refreshData();
										Ext.getCmp("checkForm1").getForm().reset();
										Ext.getCmp("checkWindow").close();
									},
									failure : function(response, options) {
										failAjax(response, myMask);
										refreshData();
									}
								});
							}
						}
					}, {
						text : '取消',
						handler : function() {
							this.up('window').close();
						}
					}]
				})
			}).show();
			Ext.getCmp("damt").setValue(json.amt);
			records = json.root;
		},
		failure : function(response, options) {
			failAjax(response, myMask);
		}
	});

}

/*******************************************************************************
 * 查看支付凭证
 * 
 * @param {}
 *            grid
 * @param {}
 *            rowIndex
 * @param {}
 *            colIndex
 * @param {}
 *            node
 * @param {}
 *            e
 * @param {}
 *            record
 * @param {}
 *            rowEl
 */
function lookPayVoucher(grid, rowIndex, colIndex, node, e, record, rowEl) {
	var record = grid.getStore().getAt(rowIndex).data;
	voucherPanel = getGrid(loadUrl, header1, fileds1, false, true);
	voucherPanel.getStore().load({
				method : 'post',
				params : {
					start : 0,
					pageSize : 200,
					filedNames : JSON.stringify(fileds1),
					id : record.pay_clear_voucher_id
				}
			});
	Ext.widget('window', {
				id : 'voucherWindow',
				title : '支付凭证信息',
				width : 700,
				height : 400,
				layout : 'fit',
				resizable : false,
				modal : true,
				items : [voucherPanel]
			}).show();
}

/*******************************************************************************
 * 生成
 */
function createVoucher(admdiv_code) {
	var records = null;
	var jsonStr = [];
	jsonStr[0] = "=";
	jsonStr[1] = "001";
	var myMask = new Ext.LoadMask(Ext.getBody(), {
		msg : '对账中，请稍后....',
		removeMask : true
			// 完成后移除
		});
	myMask.show();
	Ext.Ajax.request({
		url : loadPayUrl,
		waitMsg : '后台正在处理中,请稍后....',
		method : 'POST',
		timeout : 180000, // 设置为3分钟
		async : false,// 添加该属性即可同步,
		params : {
			jsonMap : "[{\"task_state\":" + Ext.encode(jsonStr)
					+ ",\"admdiv_code\":[\"=\",\"" + admdiv_code + "\"]}]",
			filedNames : JSON.stringify(fileds1)
		},
		success : function(response, options) {
			myMask.hide();
			var json = (new Function("return " + response.responseText))();
			Ext.widget('window', {
				id : 'createWindow1',
				title : '生成划款凭证',
				width : 350,
				height : 120,
				layout : 'fit',
				resizable : true,
				modal : true,
				items : Ext.widget('form', {
					id : 'createForm1',
					layout : {
						type : 'vbox',
						align : 'stretch'
					},
					border : false,
					bodyPadding : 5,
					items : [{
								id : 'num',
								fieldLabel : '总笔数',
								xtype : 'textfield',
								labelWidth : 85,
								disabled : true
							}, {
								id : 'amt',
								fieldLabel : '总金额',
								xtype : 'textfield',
								labelWidth : 85,
								disabled : true
							}],
					buttons : [{
						text : '确定',
						handler : function() {
							if (this.up('form').getForm().isValid()) {
								if (records == null || records.length == 0) {
									Ext.Msg.alert("系统提示","当前没有需要生成划款单的支付凭证信息！");
									return;
								}
								var selids = [];
								// 选中的凭证的id数组，要传到后台
								for (var i = 0; i < records.length; i++) {
									selids.push(records[i].pay_voucher_id);
								}
								myMask.show();
								Ext.Ajax.request({
									url : '/realware/createClearVoucher.do',
									waitMsg : '后台正在处理中,请稍后....',
									method : 'POST',
									timeout : 180000, // 设置为3分钟
									async : false,// 添加该属性即可同步,
									params : {
										ids : Ext.decode(selids)
									},
									success : function(response, options) {
										myMask.hide();
										Ext.Msg.alert("系统提示", "划款生成成功！");
										refreshData();
										Ext.getCmp("createForm1").getForm().reset();
										Ext.getCmp("createWindow1").close();
									},
									failure : function(response, options) {
										failAjax(response, myMask);
										refreshData();
									}
								});
							}
						}
					}, {
						text : '取消',
						handler : function() {
							this.up('window').close();
						}
					}]
				})
			}).show();
			Ext.getCmp("amt").setValue(json.amt);
			Ext.getCmp("num").setValue(json.num);
			records = json.root;
		},
		failure : function(response, options) {
			failAjax(response, myMask);
		}
	});

}

/*******************************************************************************
 * 撤销生成
 */
function uncreateVoucher() {
	var selIds = null;
	var records = clearPanel.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请选择要需要撤销生成的划款单！");
		return;
	}
	var selIds = [];
	Ext.Array.each(records, function(model) {
				selIds.push(model.get("pay_clear_voucher_id"));
			});
	var myMask = new Ext.LoadMask(Ext.getBody(), {
		msg : '对账中，请稍后....',
		removeMask : true
			// 完成后移除
		});
	myMask.show();
	Ext.Ajax.request({
				url : '/realware/unCreateClearVoucher.do',
				waitMsg : '后台正在处理中,请稍后....',
				method : 'POST',
				params : {
					ids : Ext.encode(selIds)
				},
				success : function(response, options) {
					succAjax(response, myMask);
					refreshData();
				},
				failure : function(response, options) {
					failAjax(response, myMask);
					refreshData();
				}
			});
}

/*******************************************************************************
 * 签章发送
 */
function signAndSendClearVoucher() {
	var records = clearGridPanel.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请选择要签章划款单的数据！");
		return;
	}
	var ids = [];
	Ext.Array.each(records,function(model){
			ids.push(model.get("pay_clear_voucher_id"));
	});
	var myMask = new Ext.LoadMask(Ext.getBody(), {
		msg : '对账中，请稍后....',
		removeMask : true
			// 完成后移除
		});
	myMask.show();
	Ext.Ajax.request({
				url : '/realware/signAndSendClearVoucher.do',
				waitMsg : '后台正在处理中,请稍后....',
				method : 'POST',
				timeout : 180000, // 设置为3分钟
				async : false,// 添加该属性即可同步,
				params : {
					clearVoucherIds : Ext.encode(ids)
				},
				success : function(response, options) {
					succAjax(response, myMask);
					refreshData();
				},
				failure : function(response, options) {
					failAjax(response, myMask);
					refreshData();
				}
			});
}
/*******************************************************************************
 * 刷新
 */
function refreshData() {
	clearPanel.getStore().loadPage(1);
}
