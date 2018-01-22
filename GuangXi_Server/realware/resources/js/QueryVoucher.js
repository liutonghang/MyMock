/*******************************************************************************
 * 主要用于支付凭证查询
 * 
 * @type
 */
 

/***
 * 引入需要使用的js文件
 */
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/recommend.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/operationLog.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/ocxVoucher.js"></scr' + 'ipt>');

/**
 * 列表
 */
var gridPanel1 = null;

/**
 * 数据项
 */
var fileds = ["pay_voucher_code", "vou_date", "pay_amount", "pay_date",
		"payee_account_no", "payee_account_name", "payee_account_bank",
		"payee_account_bank_no", "pay_account_no", "pay_account_name",
		"pay_account_bank", "pay_bank_code", "pay_bank_name",
		"clear_bank_code", "clear_bank_name", "checkNo", "fund_deal_mode_code",
		"fund_deal_mode_name", "fund_type_code", "fund_type_name",
		"pay_type_code", "pay_type_name", "set_mode_code", "set_mode_name",
		"pay_summary_name", "task_id", "pay_voucher_id", "bill_type_id",
		"voucher_status","last_ver","ori_pay_voucher_code","ori_pay_amount","remark"]; // 数据项

/**
 * 列名
 */
var header = "凭证状态|voucher_status|120,凭证号|pay_voucher_code|140,凭证日期|vou_date|100,支付金额|pay_amount|100,收款人账号|payee_account_no|140,支付日期|pay_date|80"
		+ "收款人名称|payee_account_name|140,收款人银行|payee_account_bank|140,收款行行号|payee_account_bank_no,付款人账号|pay_account_no,付款人名称|pay_account_name|140,付款人银行|pay_account_bank|140,"
		+ "代理银行编码|pay_bank_code,代理银行名称|pay_bank_name,清算银行编码|clear_bank_code,清算银行名称|clear_bank_name,"
		+ "资金性质编码|fund_type_code,资金性质名称|fund_type_name,支付方式编码|pay_type_code,支付方式名称|pay_type_name,结算方式编码|set_mode_code,"
		+ "结算方式名称|set_mode_name,用途名称|pay_summary_name,支票号|checkNo,办理方式编码|fund_deal_mode_code,办理方式名称|fund_deal_mode_name,原凭证号|ori_pay_voucher_code,原金额|ori_pay_amount,退款原因|remark";

var comboVoucherStatus = Ext.create('Ext.data.Store', {
			fields : ['name', 'value'],
			data : [{
						"name" : "全部",
						"value" : ""
					},{
						"name" : "本方未发送",
						"value" : "14"
					}, {
						"name" : "对方未接收",
						"value" : "6"
					}, {
						"name" : "对方接收成功",
						"value" : "7"
					}, {
						"name" : "对方接收失败",
						"value" : "8"
					}, {
						"name" : "对方签收成功",
						"value" : "9"
					}, {
						"name" : "对方签收失败",
						"value" : "10"
					}, {
						"name" : "对方已退回",
						"value" : "11"
					}]
		});
		
var manual_trans_flag = Ext.create('Ext.data.Store', {
	fields : ['name', 'value'],
	data : [{
				"name" : "全部",
				"value" : ""
			},{
				"name" : "正常支付",
				"value" : "0"
			},{
				"name" : "人工支付",
				"value" : "1"
			}]
});

		
/**
 * 界面加载
 */

Ext.onReady(function() {
	Ext.QuickTips.init();
	gridPanel1 = getGrid(loadUrl, header, fileds, true, true);
	gridPanel1.setHeight(document.documentElement.scrollHeight - 88);
	// 根据查询条件检索数据
	gridPanel1.getStore().on('beforeload', function(thiz, options) {
		if (admdiv == null || admdiv == "")
			return;
		beforeload(Ext.getCmp("payVoucherQuery"), options, Ext.encode(fileds));
//		options.params["loadCash"] = "0";
		options.params["vtCode"] = vtCode;
		if(!Ext.isEmpty(Ext.getCmp("clearVoucherCode_special").getValue())){
			var data = options.params["jsonMap"];
			options.params["jsonMap"] = data.substring(0, data.length - 2) + 
			",\"clearVoucherCode_special\": [\"exists\",\"(select 1 from pb_pay_request r where r.pay_voucher_id = objsrc_2742.pay_voucher_id and r.pay_clear_voucher_code = \'" + Ext.getCmp("clearVoucherCode_special").getValue() +"\')\"]}]";
		}
		options.params["jsonMap"] = options.params["jsonMap"].substring(0, options.params["jsonMap"].length - 2) + 
		",\"is_valid\":[\"=\",1]}]";
	});
	Ext.create('Ext.Viewport', {
				id : 'QueryVoucherFrame',
				layout : 'fit',
				items : [Ext.create('Ext.panel.Panel', {
							tbar : [{
								id : 'buttongroup',
								xtype : 'buttongroup',
								items : [{
											id : 'againSend',
											text : '发送',
											iconCls : 'audit',
											scale : 'small',
											handler : function() {
												sendVoucher(sendPayVoucherUrl);
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
											text : '查询',
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
									id : 'payVoucherQuery',
									collapsible : true,
									layout : {
										type : 'table',
										columns : 4
									},
									items : [{
												id : 'voucherStatus',
												fieldLabel : '凭证状态',
												xtype : 'combo',
												dataIndex : 'voucher_status',
												value : '6',
												displayField : 'name',
												emptyText : '请选择',
												valueField : 'value',
												store : comboVoucherStatus,
												editable : false,
												style : 'margin-left:5px;margin-top:5px;margin-bottom:5px;margin-right:5px;',
												listeners : {
													'select' : selectState
												}
											},{
												id : 'manual_trans_flag',
												fieldLabel : '支付方式',
												xtype : 'combo',
												dataIndex : 'manual_trans_flag',
													value : '',
												displayField : 'name',
												emptyText : '请选择',
												valueField : 'value',
												store : manual_trans_flag,
												editable : false,
												listeners : {
													'select' : selectTransFlag
												}
											}, {
												id : 'admdiv',
												fieldLabel : '所属财政',
												xtype : 'combo',
												dataIndex : 'admdiv_code',
												displayField : 'admdiv_name',
												emptyText : '请选择',
												valueField : 'admdiv_code',
												style : 'margin-left:5px;margin-top:5px;margin-bottom:5px;margin-right:5px;',
												editable : false,
												store : comboAdmdiv,
												value : comboAdmdiv.data.length > 0
														? comboAdmdiv.data.getAt(0).get("admdiv_code")
														: "",
												listeners : {
													'select' : selectAdmdiv
												}
											}, {
												id : 'bankSetMode',
												fieldLabel : '结算方式',
												xtype : 'combo',
												dataIndex : 'pb_set_mode_code',
												displayField : 'name',
												valueField : 'code',
												emptyText : '请选择',
												style : 'margin-left:5px;margin-top:5px;margin-bottom:5px;margin-right:5px;',
												editable: true,
												store : comboPbSetMode
											},{
												id : 'pay_acct_no',
												fieldLabel : '付款人账号',
												xtype : 'textfield',
												dataIndex : 'pay_account_no',
												symbol : 'like',
												style : 'margin-left:5px;margin-top:5px;margin-bottom:5px;margin-right:5px;'
											},{
												id : 'payee_acct_no',
												fieldLabel : '收款人账号',
												xtype : 'textfield',
												dataIndex : 'payee_account_no',
												symbol : 'like',
												style : 'margin-left:5px;margin-top:5px;margin-bottom:5px;margin-right:5px;'
											},{
												id : 'amount',
												fieldLabel : '&nbsp;&nbsp;金额',
												xtype : 'numberfield',
												dataIndex : 'pay_amount',
												symbol : '=',
												data_type : 'number',
												fieldStyle : 'text-align: right;'  ,   //文本框里显示内容右对齐
												decimalPrecision: 2,  //小数精确位数
												style : 'margin-left:5px;margin-top:5px;margin-bottom:5px;margin-right:5px;'
												
												/*listeners: {
													 change: function(){
												      var aa=Ext.getCmp("amount").getValue()

													 Ext.util.Format.number(aa, '0.00'); 
													 }
												}
                                                 */
												
											}, {
												id : 'payDate',
												fieldLabel : '支付日期',
												xtype : 'datefield',
												style : 'margin-left:5px;margin-top:5px;margin-bottom:5px;margin-right:5px;',
												symbol : '=',
												format : 'Y-m-d',
												dataIndex : 'pay_date',
												data_type : 'date'
											},{
												id : 'vouDate',
												fieldLabel : '凭证日期',
												xtype : 'datefield',
												dataIndex : 'vou_date',
												format : 'Y-m-d',
												style : 'margin-left:5px;margin-top:5px;margin-bottom:5px;margin-right:5px;'
											}, {
												id : 'code',
												fieldLabel : '凭证号',
												xtype : 'textfield',
												dataIndex : 'pay_voucher_code',
												symbol : '>=',
												style : 'margin-left:5px;margin-top:5px;margin-bottom:5px;margin-right:5px;'
											}, {
												id : 'codeEnd',
												fieldLabel : '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;至',
												xtype : 'textfield',
												style : 'margin-left:5px;margin-top:5px;margin-bottom:5px;margin-right:5px;',
												symbol : '<=',
												dataIndex : 'pay_voucher_code'
											}, {
												id : 'clearVoucherCode_special',
												fieldLabel : '划款单号',
												xtype : 'textfield',
												style : 'margin-left:5px;margin-top:5px;margin-bottom:5px;margin-right:5px;',
												symbol : 'exists',
												dataIndex : 'clearVoucherCode_special'
											}]
								}
							}]
						})]
			});
	setBtnVisible(Ext.getCmp("admdiv").getValue(), Ext.getCmp("buttongroup"));
//	selectState();
});

/*******************************************************************************
 * 切换状态
 * 
 * @return
 */
function selectState() {
	var voucherStatus = Ext.getCmp('voucherStatus').getValue();
	if ("6" == voucherStatus || "8" == voucherStatus) {
		Ext.getCmp('againSend').enable(false);
	} else {
		Ext.getCmp('againSend').disable(false);
	}
	Ext.getCmp('voucherStatus').symbol = '=';
	if("0" == voucherStatus){
		Ext.getCmp('voucherStatus').symbol = '>';
	}
	refreshData();
}
/*******************************************************************************
 * 切换状态
 * 
 * @return
 */
function selectTransFlag() {
	refreshData();
}
function selectAdmdiv() {
	setBtnVisible(Ext.getCmp("admdiv").getValue(),null);
		refreshData();
	
}

/*******************************************************************************
 * 签章发送
 */
function sendVoucher(url) {
	var records = gridPanel1.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请选中一条凭证信息！");
		return;
	}
	
	var reqIds = [];
	var reqVers = [];
	Ext.Array.each(records,function(model){
			reqIds.push(model.get("pay_voucher_id"));
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
				url : url,
				method : 'POST',
				timeout : 180000, // 设置为3分钟
				params : {
					billTypeId : bill_type_id,
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
/*******************************************************************************
 * 刷新
 * 
 * @return
 */
function refreshData() {
	gridPanel1.getStore().loadPage(1);
}
