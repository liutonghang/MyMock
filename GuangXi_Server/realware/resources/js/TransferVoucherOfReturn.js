/*******************************************************************************
 * 主要用于支付凭证复核转账,增加为待退票状态
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
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/exportExcel.js"></scr' + 'ipt>');	

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
		"pay_summary_name", "task_id", "pay_voucher_id", "bill_type_id","last_ver","return_reason","urgent_flag_name"];

/**
 * 列名
 */
var header = "加急标志|urgent_flag_name,退票原因|return_reason|150,凭证号|pay_voucher_code|140,凭证日期|vou_date|100,支付金额|pay_amount|100,收款人账号|payee_account_no,"
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
						"value" : "004"
					}, {
						"name" : "请款失败/超时",
						"value" : "005"
					}, {
						"name" : "已请款/支付超时/失败",
						"value" : "006"
					}, {
						"name" : "已支付",
						"value" : "008"
					},{
						"name" : "待退回",
						"value" : "010"
					},{
						"name" : "已退回",
						"value" : "007"
					}]
		});
var menu_id = null;
/**
 * 界面加载
 */
Ext.onReady(function() {
	Ext.QuickTips.init();
	//引用工具类
	Ext.Loader.setPath('Ext', 'js/util');
	Ext.require(['Ext.PageUtil']);	
	
	if (gridPanel1 == null) {
		gridPanel1 = getGrid(loadUrl, header, fileds, true, true);
		gridPanel1.setHeight(document.documentElement.scrollHeight - 95);
		// 根据查询条件检索数据
		gridPanel1.getStore().on('beforeload', function(thiz, options) {
			var admdiv = Ext.getCmp('admdiv').getValue();
			if (admdiv == null || admdiv == "")
				return;
			beforeload(Ext.getCmp("transferOfReturnQuery"), options, Ext.encode(fileds));
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
											id : 'outDataToExcel',
											text : '数据导出',
											iconCls : 'audit',
											scale : 'small',
											hidden:true,
											handler : function() {
												var records = gridPanel1.getSelectionModel().getSelection();
												if (records.length == 0) {
													Ext.Msg.alert("系统提示", "请选择导出的数据");
													return;
												}
												var excel = new Ext.Excel({gridId:'datagrid',sheetName:'支付凭证'});
                   								excel.extGridToExcel();

											}
										},{
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
										}, {

											id : 'official',
											text : '公务卡',
											iconCls : 'enabled',
											scale : 'small',
											handler : function() {
												updateVoucher();
											}
										}, {
											id : 'repeatMoney',
											text : '再次请款',
											iconCls : 'audit',
											scale : 'small',
											handler : function() {
												batchRepeatReqMoney();
											}
										}, {
											id : 'pay',
											text : '支付',
											iconCls : 'pay',
											scale : 'small',
											handler : function() {
												checkTransferPayVoucher();
											}
										}, {
											id : 'back',
											text : '退回财政',
											iconCls : 'back',
											scale : 'small',
											handler : function() {
												backVoucher(backUrl,gridPanel1.getSelectionModel().getSelection(),"pay_voucher_id");
											}
										},{
											id : 'manTrans',
											text : '人工支付',
											iconCls : 'pay',
											scale : 'small',
											handler : function() {
											if ( window.confirm("警告！！！您确认要人工支付吗？") ) {
												checkTransferPayVoucher(1);
											}
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
									id : 'transferOfReturnQuery',
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
											value : '004',
											editable : false,
											labelWidth : 60,
											width:160,
											listeners : {
												'select' : selectState
											}
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
											dataIndex : 'vou_date',
											labelWidth : 60,
											width:160
										}, {
											id : 'checkNo1',
											fieldLabel : '支票号',
											xtype : 'textfield',
											dataIndex : 'checkNo',
											labelWidth : 45,
											width:140
										}]
								}
							}]
				})]
	});
	if (comboAdmdiv.data.length > 0) {
		Ext.getCmp('admdiv').setValue(comboAdmdiv.data.getAt(0)
				.get("admdiv_code"));
	}
	Ext.getCmp('taskState').setValue("004");
	if (account_type_right == "11") {
		Ext.getCmp("checkNo1").setVisible(false);
	}
	setBtnVisible(Ext.getCmp("admdiv").getValue(), Ext.getCmp("buttongroup"));
	selectState();

	if(!(bank_type==105 || bank_type==103))//农行建行带加急标志
	{
		Ext.getCmp("urgent_flag_name").setVisible(false);
	}
});

/*******************************************************************************
 * 切换状态
 * 
 * @return
 */
function selectState() {
	var taskState = Ext.getCmp('taskState').getValue();
	if ("004" == taskState) {
		Ext.getCmp("return_reason").setVisible(false);
		Ext.getCmp('payment').enable(false);
		Ext.getCmp('unsubmit').enable(false);
		Ext.getCmp('back').disable(false);
		Ext.getCmp('pay').disable(false);
		Ext.getCmp('manTrans').disable(false);
		Ext.getCmp('writeoff').disable(false);
		Ext.getCmp('official').disable(false);
		Ext.getCmp("repeatMoney").disable(false);
//		Ext.getCmp('signsend').disable(false);
	} else if ("005" == taskState) {
		Ext.getCmp("return_reason").setVisible(false);
		Ext.getCmp('payment').disable(false);		
		Ext.getCmp('unsubmit').disable(false);		
		Ext.getCmp('back').disable(false);
		Ext.getCmp('pay').disable(false);
		Ext.getCmp('manTrans').disable(false);
		Ext.getCmp('writeoff').disable(false);
		Ext.getCmp('official').disable(false);
		Ext.getCmp("repeatMoney").enable(false);
//		Ext.getCmp('signsend').disable(false);
	} else if ("006" == taskState) {
		Ext.getCmp("return_reason").setVisible(false);
		Ext.getCmp('payment').disable(false);
		Ext.getCmp('unsubmit').disable(false);
		Ext.getCmp('back').disable(false);
		Ext.getCmp('pay').enable(false);
		Ext.getCmp('manTrans').enable(false);
		Ext.getCmp('writeoff').enable(false);
		Ext.getCmp('official').enable(false);
		Ext.getCmp("repeatMoney").disable(false);
//		Ext.getCmp('signsend').disable(false);
	} else if ("008" == taskState) {
		Ext.getCmp("return_reason").setVisible(false);
		Ext.getCmp('payment').disable(false);
		Ext.getCmp('unsubmit').disable(false);
		Ext.getCmp('back').disable(false);
		Ext.getCmp('pay').disable(false);
		Ext.getCmp('manTrans').disable(false);
		Ext.getCmp('writeoff').disable(false);
		Ext.getCmp('official').disable(false);
		Ext.getCmp("repeatMoney").disable(false);
//		Ext.getCmp('signsend').enable(false);
	} else if ("010" == taskState) {
		Ext.getCmp("return_reason").setVisible(true);
		Ext.getCmp('payment').disable(false);
		Ext.getCmp('unsubmit').disable(false);
		Ext.getCmp('back').enable(false);
		Ext.getCmp('pay').disable(false);
		Ext.getCmp('writeoff').disable(false);
		Ext.getCmp('official').disable(false);
		Ext.getCmp('manTrans').disable(false);
		Ext.getCmp("repeatMoney").disable(false);
		Ext.getCmp("unsubmit").enable(false);
	} else if ("007" == taskState) {
		Ext.getCmp("return_reason").setVisible(true);
		Ext.getCmp('payment').disable(false);
		Ext.getCmp('unsubmit').disable(false);
		Ext.getCmp('back').disable(false);
		Ext.getCmp('pay').disable(false);
		Ext.getCmp('manTrans').disable(false);
		Ext.getCmp('writeoff').disable(false);
		Ext.getCmp('official').disable(false);
		Ext.getCmp("repeatMoney").disable(false);
//		Ext.getCmp('signsend').enable(false);
	}else {
		Ext.getCmp("return_reason").setVisible(false);
		Ext.getCmp('payment').disable(false);
		Ext.getCmp('unsubmit').disable(false);
		Ext.getCmp('back').disable(false);
		Ext.getCmp('pay').disable(false);
		Ext.getCmp('manTrans').disable(false);
		Ext.getCmp('writeoff').disable(false);
		Ext.getCmp('official').disable(false);
		Ext.getCmp("repeatMoney").disable(false);
//		Ext.getCmp('signsend').disable(false);
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
	var reqVers=[];
	for (var i = 0; i < records.length; i++) {
		reqIds.push(records[i].get("pay_voucher_id"));
		reqVers.push(records[i].get("last_ver"));
	}
	var bill_type_id = records[0].get("bill_type_id");
	var myMask = new Ext.LoadMask(Ext.getBody(), {
			msg : '后台正在处理中，请稍后....',
			removeMask : true // 完成后移除
		});
	myMask.show();
	Ext.Ajax.request({
				url : '/realware/batchReqMoney.do',
				method : 'POST',
				timeout : 180000, // 设置为3分钟
				params : {
					// 单据类型id
					billTypeId : bill_type_id,
					billIds : Ext.encode(reqIds),
					last_vers: Ext.encode(reqVers),
					accountType :accountType,
					menu_id :  Ext.PageUtil.getMenuId()
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
					billTypeId : bill_type_id,
					menu_id :  Ext.PageUtil.getMenuId()
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
 * 再次请款
 */
function batchRepeatReqMoney(){
	var records = gridPanel1.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请至少选中一条凭证信息");
		return;
	}
	// 凭证主键字符串
	var reqIds = [];
	var reqVers=[];
	for (var i = 0; i < records.length; i++) {
		reqIds.push(records[i].get("pay_voucher_id"));
		reqVers.push(records[i].get("last_ver"));
	}
	var bill_type_id = records[0].get("bill_type_id");
	var myMask = new Ext.LoadMask(Ext.getBody(), {
			msg : '后台正在处理中，请稍后....',
			removeMask : true // 完成后移除
		});
	myMask.show();
	Ext.Ajax.request({
				url : '/realware/batchRepeatReqMoney.do',
				method : 'POST',
				timeout : 180000, // 设置为3分钟
				params : {
					// 单据类型id
					billTypeId : bill_type_id,
					billIds : Ext.encode(reqIds),
					last_vers: Ext.encode(reqVers),
					accountType :accountType,
					menu_id :  Ext.PageUtil.getMenuId()
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
	var ids = null;
	Ext.Array.each(records, function(model) {
				ids = ids + model.get("pay_voucher_id")+",";
			});
	var myMask = new Ext.LoadMask(Ext.getBody(), {
			msg : '后台正在处理中，请稍后....',
			removeMask : true // 完成后移除
		});
	myMask.show();
	Ext.Ajax.request({
				url : '/realware/updatePayVoucher.do',
				method : 'POST',
				timeout : 180000, // 设置为3分钟
				params : {
					ids : ids.substring(0,ids.length-1),
					objMap : "[{\"is_onlyreq\":1}]",
					isflow : 1,
					remark :'普通支付转公务卡',
					menu_id :  Ext.PageUtil.getMenuId()
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
			removeMask : true // 完成后移除
		});
	myMask.show();
	Ext.Ajax.request({
				url : '/realware/writeoffVoucher.do',
				method : 'POST',
				timeout : 180000, // 设置为3分钟
				params : {
					// 单据类型id
					billTypeId : bill_type_id,
					last_vers: Ext.encode(reqVers),
					billIds : Ext.encode(reqIds),
					menu_id :  Ext.PageUtil.getMenuId()
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
 * 确认凭证（即支付）
 *
 */
function checkTransferPayVoucher(transSucc) {
	var records = gridPanel1.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请至少选中一条凭证信息");
		return;
	}
	var reqIds = [];
	var reqVers = [];
	Ext.Array.each(records, function(model) {
				reqIds.push(model.get("pay_voucher_id"));
				reqVers.push(model.get("last_ver"));
			});
	var myMask = new Ext.LoadMask(Ext.getBody(), {
		msg : '后台正在处理中，请稍后....',
		removeMask : true
			// 完成后移除
		});
	myMask.show();
	Ext.Ajax.request({
				method : 'POST',
				timeout : 180000, // 设置为3分钟
				url : '/realware/checkTransferPayVoucher.do',
				params : {
					// 单据类型id
					billTypeId : records[0].get("bill_type_id"),
					billIds : Ext.encode(reqIds),
					last_vers : Ext.encode(reqVers),
					is_onlyreq : 0,
					transSucc : transSucc, 
					accountType : accountType,
					menu_id :  Ext.PageUtil.getMenuId()
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
	gridPanel1.getStore().loadPage(1);
}
