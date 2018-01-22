/*******************************************************************************
 * 主要用于退款复核
 * 
 * @type
 */

/***
 * 引入需要使用的js文件
 */
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/recommend.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/operationLog.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/ocxVoucher.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/backVoucher.js"></scr' + 'ipt>');
	

var voucherPanel = null;

/**
 * 数据项
 */
var fileds = ["pay_voucher_code", "vou_date", "pay_amount", "payee_account_no",
		"payee_account_name", "payee_account_bank", "payee_account_bank_no",
		"trans_res_msg", "pay_account_no", "pay_account_name",
		"pay_account_bank", "pay_bank_code", "pay_bank_name",
		"clear_bank_code", "clear_bank_name", "checkNo", "fund_deal_mode_code",
		"fund_deal_mode_name", "fund_type_code", "fund_type_name",
		"pay_type_code", "pay_type_name", "set_mode_code", "set_mode_name",
		"pay_summary_code", "pay_summary_name", "task_id", "pay_voucher_id",
		"bill_type_id","last_ver","ori_voucher_id","remark"];
//	"bill_type_id","last_ver","ori_voucher_id"];

/**
 * 列名
 */
var header = "凭证号|pay_voucher_code|140,凭证日期|vou_date|100,支付金额|pay_amount|100,收款人账号|payee_account_no,"
		+ "收款人名称|payee_account_name|140,收款人银行|payee_account_bank|140,收款行行号|payee_account_bank_no,交易结果信息|trans_res_msg,"
		+ "付款人账号|pay_account_no,付款人名称|pay_account_name|140,付款人银行|pay_account_bank|140,代理银行编码|pay_bank_code,"
		+ "代理银行名称|pay_bank_name,清算银行编码|clear_bank_code,清算银行名称|clear_bank_name,支票号|checkNo,办理方式编码|fund_deal_mode_code,"
		+ "办理方式名称|fund_deal_mode_name,资金性质编码|fund_type_code,资金性质名称|fund_type_name,支付方式编码|pay_type_code,"
		+ "支付方式名称|pay_type_name,结算方式编码|set_mode_code,结算方式名称|set_mode_name,用途编码|pay_summary_code,"
		+ "用途名称|pay_summary_name,退款原因|remark";

/*******************************************************************************
 * 状态
 */
var comboStore = Ext.create('Ext.data.Store', {
			fields : ['name', 'value'],
			data : [{
						"name" : "未复核",
						"value" : "004"
					}, {
						"name" : "已复核",
						"value" : "008"
					},  {
						"name" : "已退回",
						"value" : "003"
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
			var admdiv = Ext.getCmp('admdiv').getValue();
			if (admdiv == null || admdiv == "")
				return;
			beforeload(Ext.getCmp("refundTransferQuery"), options, Ext.encode(fileds));
		});
	}
	Ext.create('Ext.Viewport', {
				id : 'reCheckVoucherFrame',
				layout : 'fit',
				items : [Ext.create('Ext.panel.Panel', {
							tbar : [{
								id : 'buttongroup',
								xtype : 'buttongroup',
								items : [{
											id : 'checkTransfer',
											text : '复核转账',
											iconCls : 'edit',
											scale : 'small',
											handler : function() {
												checkTransferPayVoucher();
											}
										}, {
										//此转账接口主要用于湖南农行
											id : 'transfer',
											text : '复核转账',
											iconCls : 'edit',
											scale : 'small',
											hidden: true,
											handler : function() {
												transferPayVoucher();
											}
										},
//										{
//											id : 'delete',
//											text : '作废',
//											iconCls : 'delete',
//											scale : 'small',
//											handler : function() {
//												voucherInvalidate();
//											}
//										},
										{
											id : 'back',
											text : '退回',
											iconCls : 'back',
											scale : 'small',
											handler : function() {
												backVoucher(backUrl,voucherPanel.getSelectionModel().getSelection(),"pay_voucher_id","退回录入岗");
											}
										},/* {
											id : 'invalid',
											text : '查看凭证',
											iconCls : 'look',
											scale : 'small',
											handler : function() {
												lookOCX(voucherPanel.getSelectionModel().getSelection(),"pay_voucher_id");
											}
										}, */{
											id : 'log',
											text : '查看操作日志',
											iconCls : 'log',
											scale : 'small',
											handler : function() {
												taskLog(voucherPanel.getSelectionModel().getSelection(),"pay_voucher_id");
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
								items : voucherPanel,
								tbar : {
									id : 'refundTransferQuery',
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
												labelWidth : 60,
												width : 160,
												editable : false,
												listeners : {
													'select' : selectState
												}
											}, {
												id : 'admdiv',
												fieldLabel : '所属财政',
												xtype : 'combo',
												dataIndex : 'admdiv_code',
												displayField : 'admdiv_name',
												editable : false,
												emptyText : '请选择',
												valueField : 'admdiv_code',
												labelWidth : 60,
												width : 160,
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
												width : 160
											}, {
												id : 'checkNo1',
												fieldLabel : '支票号',
												xtype : 'textfield',
												dataIndex : 'checkNo',
												labelWidth : 45,
												width : 140
											}]
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
	if ("004" == taskState) {
		Ext.getCmp('transfer').enable(false);
		Ext.getCmp('checkTransfer').enable(false);
		Ext.getCmp("back").enable(false);
//		Ext.getCmp('delete').enable(false);
	} else if ("008" == taskState) {
		Ext.getCmp('transfer').disable(false);
		Ext.getCmp('checkTransfer').disable(false);
		Ext.getCmp("back").disable(false);
//		Ext.getCmp('delete').disable(false);
	} else if ("007" == taskState) {
		Ext.getCmp('transfer').disable(false);
		Ext.getCmp('checkTransfer').disable(false);
		Ext.getCmp("back").disable(false);
//		Ext.getCmp('delete').disable(false);
	} else {
		Ext.getCmp('transfer').disable(false);
		Ext.getCmp('checkTransfer').disable(false);
		Ext.getCmp("back").disable(false);
		Ext.getCmp('delete').disable(false);
	}
	refreshData();
}

function selectAdmdiv() {
	setBtnVisible(Ext.getCmp("admdiv").getValue(), null);
	refreshData();
}

/*******************************************************************************
 * 复核转账
 */
function checkTransferPayVoucher() {
	var records = voucherPanel.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请至少选中一条凭证信息");
		return;
	}
	// 凭证主键字符串
	var reqIds = [];
	var reqVers=[];
	Ext.Array.each(records,function(model){
		reqIds.push(model.get("pay_voucher_id"));
		reqVers.push(model.get("last_ver"));
	});
	var myMask = new Ext.LoadMask(Ext.getBody(), {
			msg : '后台正在处理中，请稍后....',
			removeMask : true // 完成后移除
		});
	myMask.show();
	Ext.Ajax.request({
				url : '/realware/checkTransferPayVoucher.do',
				method : 'POST',
				timeout : 180000, // 设置为3分钟
				params : {
					// 单据类型id
					billTypeId : records[0].get("bill_type_id"),
					billIds : Ext.encode(reqIds),
					last_vers: Ext.encode(reqVers),
					accountType:accountType,
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

/****
 * 转账
 */
function transferPayVoucher() {
	var records = voucherPanel.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请至少选中一条凭证信息");
		return;
	}
	// 凭证主键字符串
	var reqIds = [];
	var reqVers = [];
	var transType = [];
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
				url : '/realware/bankTransferVoucher.do',
				params : {
					// 单据类型id
					billTypeId : records[0].get("bill_type_id"),
					billIds : Ext.encode(reqIds),
					last_vers : Ext.encode(reqVers),
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
 * 作废
 */
function voucherInvalidate() {
	var records = voucherPanel.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请选中凭证信息！");
		return;
	}
	var reqIds = []; // 凭证主键字符串
	var reqVers = []; // 凭证lastVer字符串
	Ext.Array.each(records, function(model) {
		reqIds.push(model.get('pay_voucher_id'));
		reqVers.push(model.get('last_ver'));
	});
	var params = {
		billTypeId : records[0].get('bill_type_id'),
		billIds : Ext.encode(reqIds),
		last_vers : Ext.encode(reqVers),
		menu_id :  Ext.PageUtil.getMenuId()
	};
	var myMask = new Ext.LoadMask(Ext.getBody(), {
			msg : '后台正在处理中，请稍后....',
			removeMask : true // 完成后移除
	});
	myMask.show();
	Ext.Ajax.request({
			url : '/realware/invalidateRefundVoucher.do',
			method : 'POST',
			timeout : 180000, // 设置为3分钟
			params : params,
			//提交成功的回调函数
			success : function(response, options) {
				succMethod(response, options,myMask);
				refreshData();				
			},
			// 提交失败的回调函数
			failure : function(response, options) {
				failMethod(response, options,myMask);
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
	voucherPanel.getStore().loadPage(1);
}
