

/***
 * 引入需要使用的js文件
 */
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/recommend.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/operationLog.js"></scr' + 'ipt>');


/***
 * 状态
 */
var comboStore = Ext.create('Ext.data.Store', {
			fields : ['name', 'value'],
			data : [{
						"name" : "已生成",
						"value" : "001"
					}, {
						"name" : "已发送",
						"value" : "002"
					}]
		});


// 划款凭证信息
var clearFileds = ["pay_clear_voucher_code", "pay_amount", "agent_account_no",
		"agent_account_name", "agent_bank_name", "clear_account_no",
		"clear_account_name", "clear_bank_name", "fund_type_code",
		"fund_type_name", "pay_type_code", "pay_type_name", "pay_bank_code",
		"pay_bank_name", "clear_date", "confirm_date", "bgt_type_code",
		"bgt_type_name", "pay_clear_voucher_id", "bill_type_id", "task_id",
		"last_ver"];

var clearHeader = "查看支付凭证|do1|130|lookPayVoucher,凭证号|pay_clear_voucher_code|130,金额|pay_amount|100,收款银行账号|agent_account_no|150,收款银行账户名称|agent_account_name|150,收款银行名称|agent_bank_name|150,"
		+ "付款银行账号|clear_account_no|150,付款银行账户名称|clear_account_name|150,付款银行名称|clear_bank_name|150,资金性质编码|fund_type_code,资金性质名称|fund_type_name,"
		+ "支付方式编码|pay_type_code,支付方式名称|pay_type_name,代理银行编码|pay_bank_code,代理银行名称|pay_bank_name,清算日期|clear_date,回单日期|confirm_date,"
		+ "预算类型编码|bgt_type_code,预算类型名称|bgt_type_name";

var clearPanel = null;
		

/***
 * 初始化界面
 */
Ext.onReady(function() {
	Ext.QuickTips.init();
	clearPanel = getGrid(loadClearUrl, clearHeader, clearFileds, true, true);
	clearPanel.title = "划款凭证列表信息";
	clearPanel.setHeight(document.documentElement.scrollHeight - 88);
	clearPanel.getStore().on('beforeload', function(thiz, options) {
		beforeload(Ext.getCmp("clearVoucherQuery"), options, Ext.encode(clearFileds));
	});
	Ext.create('Ext.Viewport', {
				id : 'clearVoucherFrame',
				layout : 'fit',
				items : [Ext.create('Ext.panel.Panel', {
							tbar : [{
								id : 'buttongroup',
								xtype : 'buttongroup',
								items : [{
									id : 'create',
									text : '生成',
									iconCls : 'audit',
									scale : 'small',
									handler : function() {
										createVoucher();
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
									id : 'signsend',
									text : '签章发送',
									iconCls : 'sign',
									scale : 'small',
									handler : function() {
										signAndSendClearVoucher();
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
									id : 'clearVoucherQuery',
									xtype : 'toolbar',
									bodyPadding : 8,
									layout : 'hbox',
									defaults : {
										margins : '3 5 0 0'
									},
									items : [{
										id : 'taskState',
										fieldLabel : '当前状态',
										xtype : 'combo',
										dataIndex : 'task_status',
										displayField : 'name',
										value : '001',
										emptyText : '请选择',
										valueField : 'value',
										labelWidth : 60,
										editable : false,
										store : comboStore,
										listeners : {
											'select' : selectState
										}
									},{
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
												? comboAdmdiv.data.getAt(0).get("admdiv_code")
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
										width : 160,
										data_type : 'date'
									}]
								}
							}]
						})]
			});
	setBtnVisible(Ext.getCmp("admdiv").getValue(), Ext.getCmp("buttongroup"));
	selectState();
	
});

function selectState(){
	var taskState =  Ext.getCmp('taskState').getValue();
	if(taskState=='001'){
		Ext.getCmp('create').enable(false);
		Ext.getCmp('uncreate').enable(false);
		Ext.getCmp('signsend').enable(false);
	}else{
		Ext.getCmp('create').disable(false);
		Ext.getCmp('uncreate').disable(false);
		Ext.getCmp('signsend').disable(false);
	}
	refreshData();
}


// 支付凭证列表面板
var vouPanel = null;

// 凭证信息
var vouFileds = ["pay_voucher_code", "vou_date", "pay_amount",
		"payee_account_no", "payee_account_name", "payee_account_bank",
		"payee_account_bank_no", "pay_account_no", "pay_account_name",
		"pay_account_bank", "pay_bank_code", "pay_bank_name",
		"clear_bank_code", "clear_bank_name", "checkNo", "fund_deal_mode_code",
		"fund_deal_mode_name", "fund_type_code", "fund_type_name",
		"pay_type_code", "pay_type_name", "set_mode_code", "set_mode_name",
		"pay_summary_code", "pay_summary_name", "task_id", "pay_voucher_id",
		"bill_type_id", "last_ver"];

var vouHeader = "凭证号|pay_voucher_code|130,凭证日期|vou_date|100,支付金额|pay_amount|100,收款人账号|payee_account_no|130,"
		+ "收款人名称|payee_account_name|140,收款人银行|payee_account_bank|140,收款行行号|payee_account_bank_no,"
		+ "付款人账号|pay_account_no,付款人名称|pay_account_name|140,付款人银行|pay_account_bank|140,代理银行编码|pay_bank_code,"
		+ "代理银行名称|pay_bank_name,清算银行编码|clear_bank_code,清算银行名称|clear_bank_name,支票号|checkNo,办理方式编码|fund_deal_mode_code,"
		+ "办理方式名称|fund_deal_mode_name,资金性质编码|fund_type_code,资金性质名称|fund_type_name,支付方式编码|pay_type_code,"
		+ "支付方式名称|pay_type_name,结算方式编码|set_mode_code,结算方式名称|set_mode_name,用途编码|pay_summary_code,"
		+ "用途名称|pay_summary_name";

/***
 * 查看凭证
 * @param {} grid
 * @param {} rowIndex
 * @param {} colIndex
 * @param {} node
 * @param {} e
 * @param {} record
 * @param {} rowEl
 */
function lookPayVoucher(grid, rowIndex, colIndex, node, e, record, rowEl) {
	var record = grid.getStore().getAt(rowIndex).data;
	vouPanel = getGrid(loadUrl, vouHeader, vouFileds, false, true,"v_");
	vouPanel.getStore().load({
				method : 'post',
				params : {
					start : 0,
					pageSize : 200,
					filedNames : Ext.encode(vouFileds),
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
				items : [vouPanel]
			}).show();
}


/****
 * 生成
 */
function createVoucher(){
	var records = null;
	var jsonStr = [];
	jsonStr[0] = "=";
	jsonStr[1] = "001|004";
	var myMask = new Ext.LoadMask(Ext.getBody(), {
		msg : '后台正在处理中，请稍后....',
		removeMask : true
			// 完成后移除
		});
	myMask.show();
	Ext.Ajax.request({
		url : loadPayUrl,
		method : 'POST',
		timeout : 180000, // 设置为3分钟
		params : {
			jsonMap : "[{\"task_state\":" + Ext.encode(jsonStr) + ",\"admdiv_code\":[\"=\",\"" + Ext.getCmp('admdiv').getValue() + "\"]}]",
			filedNames : JSON.stringify(vouFileds)
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
								readOnly : true
							}, {
								id : 'amt',
								fieldLabel : '总金额',
								xtype : 'textfield',
								labelWidth : 85,
								readOnly : true
							}],
					buttons : [{
						id:'createClearVoucherOK',
						text : '确定',
						handler : function() {
							if (this.up('form').getForm().isValid()) {
								if (records == null || records.length == 0) {
									Ext.Msg.alert("系统提示","当前没有需要生成划款单的支付凭证信息！");
									return;
								}
								Ext.getCmp('createClearVoucherOK').disable(false);
								var reqIds = [];
								var reqVers = [];
								for(var i =0; i <records.length;i++){
										reqIds.push(records[i].pay_voucher_id);
										reqVers.push(records[i].last_ver);
								}
								myMask.show();
								Ext.Ajax.request({
									url : '/realware/createClearVoucher.do',
									method : 'POST',
									timeout : 180000, // 设置为3分钟
									params : {
										billTypeId : records[0].bill_type_id,
										billIds : Ext.encode(reqIds),
										last_vers : Ext.encode(reqVers)
									},
									success : function(response, options) {
										myMask.hide();
										Ext.Msg.buttonText.ok = "确认";
										Ext.Msg.show({
													title : '成功提示',
													msg : "生成成功！",
													buttons : Ext.Msg.OK,
													icon : Ext.MessageBox.INFO
												});
										refreshData();
										Ext.getCmp("createForm1").getForm().reset();
										Ext.getCmp("createWindow1").close();
									},
									failure : function(response, options) {
										myMask.hide();
										var reqst = response.status;
										var getText = response.responseText;
										if (reqst == "-1") {// 超时的状况码为 -1
											Ext.Msg.alert("系统提示","划款生成超时，可能存在网络异常，检查后请重试...");
										} else if (getText.indexOf("无法清算") != -1) {
											var voucherNoStr = getText.substring(20,getText.length - 11);
											var msg = getText;
											Ext.Msg.buttonText.ok = "查看凭证信息";
											Ext.Msg.show({
												title : '失败提示',
												msg : msg,
												buttons : Ext.MessageBox.OKCANCEL,
												fn : look,
												icon : Ext.MessageBox.ERROR
											});
											function look(id) {
												if (id == "ok") {
													lookErrorVoucher(voucherNoStr);
												}
											}
										} else {
											Ext.Msg.alert("系统提示",response.responseText);
										}
									}
								});
								Ext.getCmp('createClearVoucherOK').disable(false);
							}
						}
					}, {
						text : '取消',
						handler : function() {
							myMask.hide();
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
			refreshData();
		}

	});
}


// 不能生成划款单的凭证列表面板
var errorVoucherPanel = null;

var noFileds = ["pay_voucher_code", "vou_date", "pay_amount", "payee_account_no",
		"payee_account_name", "payee_account_bank", "payee_account_bank_no",
		"pay_account_no", "pay_account_name", "trans_res_msg"];

var noHeader = "凭证号|pay_voucher_code|130,凭证日期|vou_date|100,支付金额|pay_amount|100,收款人账号|payee_account_no|130,"
		+ "收款人名称|payee_account_name|140,收款人银行|payee_account_bank|140,收款行行号|payee_account_bank_no,"
		+ "付款人账号|pay_account_no,付款人名称|pay_account_name|140,付款人银行|pay_account_bank|140,交易信息|trans_res_msg|140";

/*******************************************************************************
 * 查看不能生成的凭证
 */
function lookErrorVoucher(voucherNo) {
	errorVoucherPanel = getGrid(loadPayUrl2, noHeader, noFileds, true, true);
	getErrorPayVoucher(voucherNo);
	var winLog = Ext.create('Ext.Window', {
				title : '凭证信息',
				plain : true,
				closable : true,
				resizable : false,
				layout : 'fit',
				frame : true,
				modal : true,
				width : 750,
				height : 500,
				resizable : false,
				modal : true,
				items : [errorVoucherPanel]
			}).show();
}
/*******************************************************************************
 * 获取不能生成的凭证信息
 */
function getErrorPayVoucher(payVoucherNo) {
	var payVoucherNos = payVoucherNo.split(",");
	var data = "[{\"pay_voucher_code\":[\"in\",\"('" + payVoucherNos[0];
	for (var i = 1; i < payVoucherNos.length; i++) {
		data = data + "','" + payVoucherNos[i];
	}
	var data = data + "')\"]}]";
	errorVoucherPanel.getStore().load({
				method : 'post',
				params : {
					start : 0,
					pageSize : 200,
					filedNames : Ext.encode(noFileds),
					jsonMap : data
				}
			});
}



/***
 * 撤销生成
 */
function uncreateVoucher() {
	var records = clearPanel.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请选择要需要撤销生成的划款单！");
		return;
	}
	var reqIds = [];
	var reqVers = [];
	Ext.Array.each(records, function(model) {
				reqIds.push(model.get("pay_clear_voucher_id"));
				reqVers.push(model.get("last_ver"));
			});
	var myMask = new Ext.LoadMask(Ext.getBody(), {
				msg : '后台正在处理中，请稍后....',
				removeMask : true
			});
	myMask.show();
	Ext.Ajax.request({
				url : '/realware/unCreateClearVoucher.do',
				method : 'POST',
				timeout : 180000,
				params : {
					billTypeId : records[0].get("bill_type_id"),
					billIds : Ext.encode(reqIds),
					last_vers : Ext.encode(reqVers)
				},
				success : function(response, options) {
					succAjax(response, myMask,true);
				},
				failure : function(response, options) {
					failAjax(response, myMask);
					refreshData();
				}
			});
}


/***
 * 签章发送
 */
function signAndSendClearVoucher() {
	var records = clearPanel.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请选择要签章划款单的数据！");
		return;
	}
	var reqIds = [];
	var reqVers = [];
	Ext.Array.each(records,function(model){
			reqIds.push(model.get("pay_clear_voucher_id"));
			reqVers.push(model.get("last_ver"));
	});
	var bill_type_id = records[0].get("bill_type_id");
	var myMask = new Ext.LoadMask(Ext.getBody(), {
		msg : '后台正在处理中，请稍后....',
		removeMask : true
			// 完成后移除
		});
	myMask.show();
	Ext.Ajax.request({
				url : '/realware/signAndSendClearVoucher.do',
				method : 'POST',
				timeout : 180000, // 设置为3分钟
				params : {
					billTypeId : bill_type_id,
					billIds : Ext.encode(reqIds),
					last_vers : Ext.encode(reqVers),
					isFlow : false
				},
				//提交成功的回调函数
				success : function(response, options) {
					succAjax(response, myMask,true);
				},
				// 提交失败的回调函数
				failure : function(response, options) {
					failAjax(response, myMask);
					refreshData();
				}
			});
}


function selectAdmdiv() {
	setBtnVisible(Ext.getCmp("admdiv").getValue(),null);
	refreshData();
}

function refreshData() {
	clearPanel.getStore().loadPage(1);
}