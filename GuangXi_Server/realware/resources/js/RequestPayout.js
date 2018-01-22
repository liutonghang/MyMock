/*******************************************************************************
 * 主要用于支付凭证复核转账
 * 
 * @type
 */
var gridPanel1 = null;

/***
 * 引入需要使用的js文件
 */
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/recommend.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/operationLog.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/ocxVoucher.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/backVoucher.js"></scr' + 'ipt>');
	

/**
 * 数据项
 */
var fileds = ["pay_voucher_code", "vou_date", "pay_amount", "payee_account_no",
		"payee_account_name", "payee_account_bank", "payee_account_bank_no",
		"pay_account_no", "pay_account_name", "pay_account_bank", "pay_date",
		"pay_bank_code", "pay_bank_name", "clear_bank_code", "clear_bank_name",
		"checkNo", "fund_deal_mode_code", "fund_deal_mode_name",
		"fund_type_code", "fund_type_name", "pay_type_code", "pay_type_name",
		"set_mode_code", "set_mode_name", "pay_summary_code",
		"pay_summary_name", "task_id", "pay_voucher_id", "bill_type_id",
		"last_ver", "return_reason"];

/**
 * 列名
 */
var header = "退票原因|return_reason|150,凭证号|pay_voucher_code|140,凭证日期|vou_date|100,支付金额|pay_amount|100,收款人账号|payee_account_no,"
		+ "收款人名称|payee_account_name|140,收款人银行|payee_account_bank|140,收款行行号|payee_account_bank_no,"
		+ "付款人账号|pay_account_no,付款人名称|pay_account_name|140,付款人银行|pay_account_bank|140,支付日期|pay_date,代理银行编码|pay_bank_code,"
		+ "代理银行名称|pay_bank_name,清算银行编码|clear_bank_code,清算银行名称|clear_bank_name,支票号|checkNo,办理方式编码|fund_deal_mode_code,"
		+ "办理方式名称|fund_deal_mode_name,资金性质编码|fund_type_code,资金性质名称|fund_type_name,支付方式编码|pay_type_code,"
		+ "支付方式名称|pay_type_name,结算方式编码|set_mode_code,结算方式名称|set_mode_name,用途编码|pay_summary_code,"
		+ "用途名称|pay_summary_name";

/*******************************************************************************
 * 状态
 */
var comboStore = Ext.create('Ext.data.Store', {
			fields : ['name', 'value'],
			data : [{
						"name" : "未请款",
						"value" : "001"
					}, {
						"name" : "已请款",
						"value" : "002"
					}, {
						"name" : "请款失败",
						"value" : "003"
					}]
		});

/***
 * 银行结算方式
 * @return {TypeName} 
 */
var bankTypeStore = Ext.create('Ext.data.Store', {
				fields : ['name', 'value'],
				data : [{
							"name" : "同城同行",
							"value" : "1"
						}, {
							"name" : "同城跨行",
							"value" : "2"
						}, {
							"name" : "异地同行",
							"value" : "3"
						}, {
							"name" : "异地跨行",
							"value" : "4"
						}]
			});
/**
 * 界面加载
 */
Ext.onReady(function() {
	Ext.QuickTips.init();
	if (gridPanel1 == null) {
		gridPanel1 = getGrid(loadUrl, header, fileds, true, true);
		gridPanel1.setHeight(document.documentElement.scrollHeight - 88);
		// 根据查询条件检索数据
		gridPanel1.getStore().on('beforeload', function(thiz, options) {
			var admdiv = Ext.getCmp('admdiv').getValue();
			var bankSetMode = Ext.getCmp('bankSetMode').getValue();
			if (admdiv == null || admdiv == "")
				return;
			beforeload(Ext.getCmp("transferVoucherQuery"), options, Ext.encode(fileds));
			options.params['loadCash']="0";
			options.params['vtCode']=vtCode;
//			options.params['pb_set_mode_code']=bankSetMode;
		});
	}
	Ext.create('Ext.Viewport', {
				id : 'transferVoucherFrame',
				layout : 'fit',
				items : [Ext.create('Ext.panel.Panel', {
							tbar : [{
								id : 'buttongroup',
								xtype : 'buttongroup',
								items : [{
											id : 'payment',
											text : '请款申请',
											iconCls : 'audit',
											scale : 'small',
											handler : function() {
												batchReqMoney();
											}
										}, {
											id : 'unsubmit',
											text : '退回初审',
											iconCls : 'back',
											scale : 'small',
											handler : function() {
											backVoucher('/realware/unsubmitVoucher.do',gridPanel1.getSelectionModel().getSelection(),"pay_voucher_id","退回初审");
												//unsubmit();
											}
										}, {
											id : 'writeoff',
											text : '冲销凭证',
											iconCls : 'cancle',
											scale : 'small',
											handler : function() {
												writeoffPayVoucher();
											}
										},  {
											id : 'repeatMoney',
											text : '再次请款',
											iconCls : 'audit',
											scale : 'small',
											handler : function() {
												batchRepeatReqMoney();
											}
										},{
											id : 'back',
											text : '退回财政',
											iconCls : 'back',
											scale : 'small',
											handler : function() {
												backVoucher(backUrl,gridPanel1.getSelectionModel().getSelection(),"pay_voucher_id");
											}
										}, {
											id : 'look',
											text : '查看凭证',
											iconCls : 'look',
											scale : 'small',
											handler : function() {
												lookOCX(gridPanel1.getSelectionModel().getSelection(),"pay_voucher_id");
											}
										}, {
											id : 'log',
											text : '查看操作日志',
											iconCls : 'log',
											scale : 'small',
											handler : function() {
												taskLog(gridPanel1.getSelectionModel().getSelection(),"pay_voucher_id");
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
								items : gridPanel1,
								tbar : {
									id : 'transferVoucherQuery',
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
												emptyText : '请选择',
												valueField : 'value',
												store : comboStore,
												value : '001',
												editable : false,
												labelWidth : 60,
												width : 160,
												listeners : {
													'select' : selectState
												}
											},{
												id : 'bankSetMode',
												fieldLabel : '银行结算方式',
												xtype : 'combo',
												dataIndex : 'pb_set_mode_code',
												displayField : 'name',
												emptyText : '请选择',
												valueField : 'value',
												labelWidth : 80,
												width : 170,
												editable : true,
												store : bankTypeStore
												}, {
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
												dataIndex : 'pay_voucher_code'
											}, {
												id : 'codeEnd',
												fieldLabel : '至',
												xtype : 'textfield',
												labelWidth : 15,
												width : 120,
												symbol : '<=',
												dataIndex : 'pay_voucher_code'
											}, {
												id : 'vouDate',
												fieldLabel : '凭证日期',
												xtype : 'datefield',
												labelWidth : 60,
												width : 160,
												dataIndex : 'vou_date',
												format : 'Y-m-d'
											},  {
												id : 'amount',
												fieldLabel : '金额',
												xtype : 'textfield',
												labelWidth : 45,
												width : 140,
												dataIndex : 'pay_amount'
											},{
												id : 'checkNo1',
												fieldLabel : '支票号',
												xtype : 'textfield',
												dataIndex : 'checkNo',
												labelWidth : 45,
												width : 140
											} ]
								}
							}]
						})]
			});
	if (account_type_right == "11") {
		Ext.getCmp("checkNo1").setVisible(false);
	}
	setBtnVisible(Ext.getCmp("admdiv").getValue(), Ext.getCmp("buttongroup"));
	selectState();
});

/*******************************************************************************
 * 切换状态
 * 
 * @return
 */
function selectState() {
	var taskState = Ext.getCmp('taskState').getValue();
	if ("001" == taskState) {
		Ext.getCmp("return_reason").setVisible(false);
		Ext.getCmp('payment').enable(false);
		Ext.getCmp('unsubmit').enable(false);
		Ext.getCmp('back').disable(false);
//		Ext.getCmp('paySucc').disable(false);
		Ext.getCmp('writeoff').disable(false);
		Ext.getCmp("repeatMoney").disable(false);
		is_onlyreq=0;
	} else if ("002" == taskState) {
		Ext.getCmp("return_reason").setVisible(false);
		Ext.getCmp('payment').disable(false);
		Ext.getCmp('unsubmit').disable(false);
		Ext.getCmp('back').disable(false);
//		Ext.getCmp('paySucc').disable(false);
		Ext.getCmp('writeoff').enable(false);
		Ext.getCmp("repeatMoney").disable(false);
		is_onlyreq=1;
		//Ext.getCmp().value=1;
	} else if ("003" == taskState) {
		Ext.getCmp("return_reason").setVisible(false);
		Ext.getCmp('payment').disable(false);
		Ext.getCmp('unsubmit').disable(false);
		Ext.getCmp('back').disable(false);
//		Ext.getCmp('paySucc').disable(false);
		Ext.getCmp('writeoff').disable(false);
		Ext.getCmp("repeatMoney").enable(false);
		is_onlyreq=0;
	}
	refreshData();
}

function selectAdmdiv() {
	setBtnVisible(Ext.getCmp("admdiv").getValue(), null);
	refreshData();
}

/**
 * 请款申请
 */
function batchReqMoney() {
	var records = gridPanel1.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请至少选中一条凭证信息");
		return;
	}
	// 凭证主键字符串
	var reqIds = [];
	var reqVers = [];
	for (var i = 0; i < records.length; i++) {
		reqIds.push(records[i].get("pay_voucher_id"));
		reqVers.push(records[i].get("last_ver"));
	}
	var bill_type_id = records[0].get("bill_type_id");
	var myMask = new Ext.LoadMask(Ext.getBody(), {
		msg : '后台正在处理中，请稍后....',
		removeMask : true
			// 完成后移除
		});
	myMask.show();
	Ext.Ajax.request({
				url : '/realware/batchReqPayout.do',
				method : 'POST',
				timeout : 180000, // 设置为3分钟
				params : {
					// 单据类型id
					billTypeId : bill_type_id,
					billIds : Ext.encode(reqIds),
					last_vers : Ext.encode(reqVers),
					accountType : accountType
				},
				success : function(response, options) {
					succAjax(response, myMask,true,"请款成功.");
				},
				failure : function(response, options) {
					failAjax(response, myMask);
					refreshData();
				}
			});

}

/*******************************************************************************
 * 退回
 */
function unsubmit() {
	var records = gridPanel1.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请选中凭证信息！");
		return;
	}
	var ids = [];
	var reqVers = [];
	Ext.Array.each(records, function(model) {
		ids.push(model.get("pay_voucher_id"));
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
				url : '/realware/unsubmitVoucher.do',
				method : 'POST',
				timeout : 180000, // 设置为3分钟
				params : {
					billIds : Ext.encode(ids),
					last_vers : Ext.encode(reqVers),
					billTypeId : bill_type_id
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

/*******************************************************************************
 * 再次请款
 */
function batchRepeatReqMoney() {
	var records = gridPanel1.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请至少选中一条凭证信息");
		return;
	}
	// 凭证主键字符串
	var reqIds = [];
	var reqVers = [];
	for (var i = 0; i < records.length; i++) {
		reqIds.push(records[i].get("pay_voucher_id"));
		reqVers.push(records[i].get("last_ver"));
	}
	var bill_type_id = records[0].get("bill_type_id");
	var myMask = new Ext.LoadMask(Ext.getBody(), {
		msg : '后台正在处理中，请稍后....',
		removeMask : true
			// 完成后移除
		});
	myMask.show();
	Ext.Ajax.request({
				url : '/realware/batchRepeatReqPayout.do',
				method : 'POST',
				timeout : 180000, // 设置为3分钟
				params : {
					// 单据类型id
					billTypeId : bill_type_id,
					billIds : Ext.encode(reqIds),
					last_vers : Ext.encode(reqVers),
					accountType : accountType
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

function updateVoucher() {
	var records = gridPanel1.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请选中一条凭证信息！");
		return;
	}
	var reqIds = []; // 凭证主键字符串
	var reqVers = []; // 凭证lastVer字符串
	var jsonMap = "[";
	Ext.Array.each(records, function(model) {
				reqIds.push(model.get("pay_voucher_id"));
				reqVers.push(model.get("last_ver"));
				jsonMap += "{\"id\":\"" + model.get("pay_voucher_id")+"\",\"bankNo\":\"" + model.get("payee_account_bank_no")+"\",\"is_onlyreq\":\"" +  1 +"\"},";
			});
	var myMask = new Ext.LoadMask(Ext.getBody(), {
		msg : '后台正在处理中，请稍后....',
		removeMask : true
			// 完成后移除
		});
	myMask.show();
	Ext.Ajax.request({
				url : '/realware/updatePayVoucher.do',
				method : 'POST',
				timeout : 180000, // 设置为3分钟
				params : {
					billIds : Ext.encode(reqIds),
					last_vers : Ext.encode(reqVers),
					billTypeId : records[0].get("bill_type_id"),
					remark : '普通支付转公务卡',
					isflow : 1,
					jsonMap : jsonMap.substring(0, jsonMap.length - 1)+ "]"
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

/**
 * 冲销凭证
 */
function writeoffPayVoucher() {
	var records = gridPanel1.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请至少选中一条凭证信息");
		return;
	}
	// 凭证主键字符串
	var reqIds = [];
	var reqVers = [];
	for (var i = 0; i < records.length; i++) {
		reqIds.push(records[i].get("pay_voucher_id"));
		reqVers.push(records[i].get("last_ver"));
	}
	var bill_type_id = records[0].get("bill_type_id");
	var myMask = new Ext.LoadMask(Ext.getBody(), {
		msg : '后台正在处理中，请稍后....',
		removeMask : true
			// 完成后移除
		});
	myMask.show();
	Ext.Ajax.request({
				url : '/realware/writeoffVoucher.do',
				method : 'POST',
				timeout : 180000, // 设置为3分钟
				params : {
					// 单据类型id
					billTypeId : bill_type_id,
					last_vers : Ext.encode(reqVers),
					billIds : Ext.encode(reqIds)
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


/*******************************************************************************
 * 刷新
 * 
 * @return
 */
function refreshData() {
	//验证输入金额
	if(!Ext.isEmpty(Ext.getCmp("amount").getValue())){
		var reg = /^(([1-9]{1}\d*)|([0]{1}))(\.(\d){1,2})?$/;
		
		var r = Ext.getCmp("amount").getValue().match(reg);

		if(r==null){
				Ext.Msg.alert("系统提示", "请录入正确的金额格式（如：0.00）！");
				return;
		}
	}
	gridPanel1.getStore().loadPage(1);
}
