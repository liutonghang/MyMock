/*******************************************************************************
 * 支付凭证打印
 * 
 * @type
 */

/***
 * 引入需要使用的js文件
 */
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/recommend.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/operationLog.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/ocxVoucher.js"></scr' + 'ipt>');
	

// 是否走工作流
var isFlow = false;

/**
 * 数据项
 */
var fileds = ["pay_voucher_code", "vou_date", "pay_amount", "payee_account_no",
		"payee_account_name", "payee_account_bank", "payee_account_bank_no",
		"pay_account_no", "pay_account_name", "pay_account_bank",
		"pay_bank_code", "pay_bank_name", "clear_bank_code", "clear_bank_name",
		"checkNo", "fund_deal_mode_code", "fund_deal_mode_name",
		"fund_type_code", "fund_type_name", "pay_type_code", "pay_type_name",
		"set_mode_code", "set_mode_name", "pay_summary_code",
		"pay_summary_name", "task_id", "pay_voucher_id", "bill_type_id"];

/**
 * 列名
 */
var header = "凭证号|pay_voucher_code|140,凭证日期|vou_date|100,支付金额|pay_amount|120,收款人账号|payee_account_no,"
		+ "收款人名称|payee_account_name|140,收款人银行|payee_account_bank|140,收款行行号|payee_account_bank_no,"
		+ "付款人账号|pay_account_no,付款人名称|pay_account_name|140,付款人银行|pay_account_bank|140,代理银行编码|pay_bank_code,"
		+ "代理银行名称|pay_bank_name,清算银行编码|clear_bank_code,清算银行名称|clear_bank_name,支票号|checkNo,办理方式编码|fund_deal_mode_code,"
		+ "办理方式名称|fund_deal_mode_name,资金性质编码|fund_type_code,资金性质名称|fund_type_name,支付方式编码|pay_type_code,"
		+ "支付方式名称|pay_type_name,结算方式编码|set_mode_code,结算方式名称|set_mode_name,用途编码|pay_summary_code,"
		+ "用途名称|pay_summary_name";

/**
 * 界面加载
 */
Ext.onReady(function() {
	Ext.QuickTips.init();
	store1 = getStore(loadUrl, fileds);
	column1 = getColModel(header, fileds);
	var pagetool = getPageToolbar(store1);
	store1.on('beforeload', function(thiz, options,e) {
		var panel = Ext.ComponentQuery.query("panel[title='查询区']")[0];
		// 按凭证号区间查询时对查询条件进行特殊处理
		if (!Ext.isEmpty(Ext.getCmp("code").value) && !Ext.isEmpty(Ext.getCmp("codeEnd").value)) {
			Ext.getCmp("code").symbol = ">=";
			Ext.getCmp("codeEnd").symbol = "<=";
		} else if (!Ext.isEmpty(Ext.getCmp("code").value)) {
			Ext.getCmp("code").symbol = "LIKE";
		} else if (!Ext.isEmpty(Ext.getCmp("codeEnd").value)) {
			Ext.getCmp("codeEnd").symbol = "LIKE";
		}
		beforeload(panel, options, Ext.encode(fileds));
	});
	var buttonItems = [{
						id : 'print',
						handler : function() {
							var records = Ext.getCmp("PrintPayVoucherQuery").getSelectionModel().getSelection();
							if (records.length == 0) {
								Ext.Msg.alert("系统提示", "请选择数据！");
								return;
							}
							printVoucher(Ext.getCmp("PrintPayVoucherQuery").getSelectionModel().getSelection(),"pay_voucher_id",isFlow);
						}
					}, {
						id : 'look',
						handler : function() {
							lookOCX(Ext.getCmp("PrintPayVoucherQuery").getSelectionModel().getSelection(),"pay_voucher_id");
						}
					}, {
						id : 'log',
						handler : function() {
							taskLog(Ext.getCmp("PrintPayVoucherQuery").getSelectionModel().getSelection(),"pay_voucher_id");
						}
					}, {
						id : 'refresh',
						handler : function() {
							refreshData();
						}
					}];
	var queryItems = [{
						title : '查询区',
						bodyPadding : 5,
						frame : false,
						layout : 'hbox',
						defaults : {
							margins : '3 10 0 0'
						},
						items : [{
									id : 'taskState',
									fieldLabel : '当前状态',
									xtype : 'combo',
									displayField : 'status_name',
									dataIndex : 'task_status',
									emptyText : '请选择',
									valueField : 'status_code',
									labelWidth : 53,
									editable : false,
									listeners : {
										'change' : selectState
									}
								}, {
									id : 'admdiv',
									fieldLabel : '所属财政',
									xtype : 'combo',
									dataIndex : 'admdiv_code',
									displayField : 'admdiv_name',
									emptyText : '请选择',
									valueField : 'admdiv_code',
									labelWidth : 53,
									width: 180,
									editable : false,
									store : comboAdmdiv
								}, {
									id : 'code',
									fieldLabel : '凭证号',
									xtype : 'textfield',
									dataIndex : 'pay_voucher_code',
									width: 140,
									labelWidth : 42
								}, {
									id : 'codeEnd',
									fieldLabel : '至',
									xtype : 'textfield',
									width: 113,
									labelWidth : 15,
									dataIndex : 'pay_voucher_code '
								}, {
									id : 'vouDate',
									fieldLabel : '凭证日期',
									xtype : 'datefield',
									dataIndex : 'vou_date',
									format : 'Y-m-d',
									symbol : '=',
									width : 150,
									labelWidth : 53
								}, {
									id : 'checkNo1',
									fieldLabel : '支票号',
									xtype : 'textfield',
									dataIndex : 'checkNo1',
									symbol : 'LIKE',
									width : 140,
									labelWidth : 42
								}],
						flex : 2
					}, {
						id : 'PrintPayVoucherQuery',
						xtype : 'gridpanel',
						selType : 'checkboxmodel',
						height : document.documentElement.scrollHeight- 95,
						frame : false,
						enableKeyNav : true,
						multiSelect : true,
						title : '凭证列表信息',
						selModel : {
							mode : 'multi',
							checkOnly : true
						},
						store : store1,
						columns : column1,
						loadMask : {
							msg : '数据加载中,请稍等...'
						},
						bbar : pagetool
					}];
	Ext.StatusUtil.createViewport(buttonItems, queryItems, function() {
		Ext.StatusUtil.initPage(Ext.getCmp("admdiv"), Ext.getCmp("taskState"));
		// 默认设置为未打印
		Ext.getCmp('taskState').setValue("001");
	});
	if (account_type_right == "11") {
		Ext.getCmp("checkNo1").setVisible(false);
	}
});

/*******************************************************************************
 * 切换状态（初审）
 * 
 * @return
 */
function selectState() {
	var taskState = Ext.getCmp('taskState').getValue();
	if ("001" == taskState) {
//		Ext.getCmp('print').enable(false);
		isFlow = true;
	} else {
//		Ext.getCmp('print').disable(true);
		isFlow = false;
	}
}


/*******************************************************************************
 * 刷新
 * 
 * @return
 */
function refreshData() {
	Ext.getCmp("PrintPayVoucherQuery").getStore().loadPage(1);
}
