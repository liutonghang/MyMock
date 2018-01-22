/*******************************************************************************
 * 授权支付凭证查询(现金)
 * 
 * @type
 */
var gridPanel1 = null;

/*******************************************************************************
 * 引入需要使用的js文件
 */
document.write('<scr'+ 'ipt type="text/javascript" src="/realware/resources/js/recommend.js"></scr'+ 'ipt>');
document.write('<scr'+ 'ipt type="text/javascript" src="/realware/resources/js/share/operationLog.js"></scr'+ 'ipt>');
document.write('<scr'+ 'ipt type="text/javascript" src="/realware/resources/js/share/ocxVoucher.js"></scr'+ 'ipt>');
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
		"pay_summary_name", "task_id", "pay_voucher_id", "bill_type_id"];

/**
 * 列名
 */
var header = "凭证号|pay_voucher_code|140,凭证日期|vou_date|100,支付金额|pay_amount|100,"
		+ "付款人账号|pay_account_no,付款人名称|pay_account_name|140,付款人银行|pay_account_bank|140,"
		+ "收款人账号|payee_account_no,收款人名称|payee_account_name|140,收款人银行|payee_account_bank|140,收款行行号|payee_account_bank_no,"
		+ "支付日期|pay_date,代理银行编码|pay_bank_code,"
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
						"name" : "未支付",
						"value" : "004"
					}, {
						"name" : "已支付",
						"value" : "008"
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
			beforeload(Ext.getCmp("cashQuery"), options, Ext.encode(fileds));
			options.params["loadCash"] = cashOfSetMode;
			options.params["vtCode"] = vtCode;
			if(!Ext.isEmpty(Ext.getCmp("clearVoucherCode_special").getValue())){
				var data = options.params["jsonMap"];
				options.params["jsonMap"] = data.substring(0, data.length - 2) + 
				",\"clearVoucherCode_special\": [\"exists\",\"(select 1 from pb_pay_request r where r.pay_voucher_id = objsrc_2742.pay_voucher_id and r.pay_clear_voucher_code = \'" + Ext.getCmp("clearVoucherCode_special").getValue() +"\')\"]}]";
		}
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
									id : 'cashQuery',
									xtype : 'toolbar',
									bodyPadding : 8,
									layout : 'column',
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
												width : 160,
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
												labelWidth : 53,
												editable : false,
												store : comboAdmdiv,
												value : comboAdmdiv.data.length > 0
														? comboAdmdiv.data.getAt(0).get("admdiv_code")
														: "",
												listeners : {
													'select' : selectAdmdiv
												}
												
										   }, /*{
												id : 'bankSetMode',
												fieldLabel : '结算方式',
												xtype : 'combo',
												dataIndex : 'pb_set_mode_code',
												displayField : 'name',
												valueField : 'code',
												emptyText : '请选择',
												labelWidth : 60,
												width : 180,
												editable: true,
												store : comboPbSetMode
											},*/ {
												id : 'payDate',
												fieldLabel : '支付日期',
												xtype : 'datefield',
												labelWidth : 60,
												width : 180,
												symbol : '=',
												format : 'Y-m-d',
												dataIndex : 'pay_date',
												data_type : 'date'
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
											}, {
												id : 'checkNo1',
												fieldLabel : '支票号',
												xtype : 'textfield',
												dataIndex : 'checkNo',
												labelWidth : 45,
												width : 140
											}, {
												id : 'clearVoucherCode_special',
												fieldLabel : '划款单号',
												xtype : 'textfield',
												labelWidth : 60,
												width : 180,
												symbol : 'exists',
												dataIndex : 'clearVoucherCode_special'
											}]
								}
							}]
						})]
			});
	if (account_type_right == "11") {
		Ext.getCmp("checkNo1").setVisible(false);
	}
	setBtnVisible(Ext.getCmp("admdiv").getValue(), Ext.getCmp("buttongroup"));
//	selectState();
});

/*******************************************************************************
 * 切换状态
 * 
 * @return
 */
function selectState() {
	refreshData();
}

function selectAdmdiv() {
	setBtnVisible(Ext.getCmp("admdiv").getValue(), null);
	refreshData();
}

/*******************************************************************************
 * 刷新
 * 
 * @return
 */
function refreshData() {
	gridPanel1.getStore().loadPage(1);
}