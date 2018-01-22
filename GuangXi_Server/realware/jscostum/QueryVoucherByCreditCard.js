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
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/createReport.js"></scr' + 'ipt>');

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
		"voucher_status","last_ver"]; // 数据项

/**
 * 列名
 */
var header = "凭证状态|voucher_status|120,凭证号|pay_voucher_code|140,凭证日期|vou_date|100,支付金额|pay_amount|100,收款人账号|payee_account_no|140,"
		+ "收款人名称|payee_account_name|140,收款人银行|payee_account_bank|140,收款行行号|payee_account_bank_no,付款人账号|pay_account_no,付款人名称|pay_account_name|140,付款人银行|pay_account_bank|140,"
		+ "代理银行编码|pay_bank_code,代理银行名称|pay_bank_name,清算银行编码|clear_bank_code,清算银行名称|clear_bank_name,"
		+ "资金性质编码|fund_type_code,资金性质名称|fund_type_name,支付方式编码|pay_type_code,支付方式名称|pay_type_name,结算方式编码|set_mode_code,"
		+ "结算方式名称|set_mode_name,用途名称|pay_summary_name,结算号|checkNo,办理方式编码|fund_deal_mode_code,办理方式名称|fund_deal_mode_name";

var comboStore = Ext.create('Ext.data.Store', {
			fields : ['name', 'value'],
			data : [{
						"name" : "直接支付",
						"value" : "5201"
					}, {
						"name" : "授权支付",
						"value" : "8202"
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
		var jsonMap = options.params["jsonMap"];
		var tempJsonMap = jsonMap.substring(0, jsonMap.length- 2);
		tempJsonMap =tempJsonMap+ ",\"business_type\": [\"=\",\"1\"]"
								+",\"send_flag \": [\"=\",\"1\"]"
								+",\"pb_set_mode_code \": [\"=\",\"7\"]"
								+",\"payee_account_no \": [\"like\",\"%9991\"]"
								+"}]"
		options.params["jsonMap"]=tempJsonMap;

	});
	Ext.create('Ext.Viewport', {
				id : 'QueryVoucherFrame',
				layout : 'fit',
				items : [Ext.create('Ext.panel.Panel', {
							tbar : [{
								id : 'buttongroup',
								xtype : 'buttongroup',
								items : [{
							text : '信用卡清单打印',
							iconCls : 'print',
							scale : 'small',
							id : 'VoucherByCreditCardPrint',
							handler : function() {
								// 当前选中的数据
								//var recordsr = clearGridPanel.getSelectionModel().getSelection();
								
								var admdivCode = Ext.getCmp("admdiv").getValue();
								if(Ext.isEmpty(Ext.getCmp("pay_date").getValue() )){
									Ext.Msg.alert("系统提示", "请选择支付日期！");
									return;
								}
								var payDate =Todate(Ext.getCmp("pay_date").getValue());
								var data="[{\"pbSetModeCode\":[\""+pbSetModeCode+"\"]," 
															+"\"payDay\":[\"'"+payDate+"'\"]," 
															//+"\"admdivCode\":[\""+admdivCode+"\"],"
															+"\"belongOrgId\":[\""+belongOrgId+"\"],"
															+"\"admdivCode\":[\""+admdivCode+"\"]}]";
								GridPrintDialog('undefined','undefined',loadGrfURL
														,loadDataURL,"payVoucherByCreditCard",data,100);	
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
									xtype : 'toolbar',
									bodyPadding : 5,
									layout : 'hbox',
									defaults : {
										margins : '5 10 0 0'
									},
									items : [{
												id : 'vt_code',
												fieldLabel : '凭证类型',
												xtype : 'combo',
												dataIndex : 'vt_code',
												displayField : 'name',
												emptyText : '请选择',
												valueField : 'value',
												labelWidth : 60,
												width : 160,
												value : '8202',
												editable : false,
												store : comboStore,
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
												width : 180,
												editable : false,
												store : comboAdmdiv,
												value : comboAdmdiv.data.length > 0
														? comboAdmdiv.data.getAt(0).get("admdiv_code")
														: "",
												listeners : {
													'select' : selectAdmdiv
												}
											}, {
												id : 'pay_date',
												fieldLabel : '支付日期',
												xtype : 'datefield',
												dataIndex : 'pay_date',
												format : 'Ymd',
												labelWidth : 60,
												symbol : '=',
												width : 160,								
												data_type:'date'
											}, {
												id : 'code',
												fieldLabel : '凭证号',
												xtype : 'textfield',
												dataIndex : 'pay_voucher_code',
												symbol : '>=',
												labelWidth : 45,
												width : 160
											}, {
												id : 'codeEnd',
												fieldLabel : '至',
												xtype : 'textfield',
												labelWidth : 15,
												width : 140,
												symbol : '<=',
												dataIndex : 'pay_voucher_code'
											}]
								}
							}]
						})]
			});
	setBtnVisible(Ext.getCmp("admdiv").getValue(), Ext.getCmp("buttongroup"));
	getNowDate();
});

/*******************************************************************************
 * 切换状态
 * 
 * @return
 */
function selectState() {
	var taskState = Ext.getCmp('vt_code').getValue();
	if(taskState=="5201"){
		account_type_right="11";
	}else{
		account_type_right ="12";
	}
	refreshData();
}

function selectAdmdiv() {
	setBtnVisible(Ext.getCmp("admdiv").getValue(),null);
	refreshData();
}

function getNowDate(){
var myMask = new Ext.LoadMask(Ext.getBody(), {
							msg : '后台正在处理中，请稍后....',
								removeMask : true
								// 完成后移除
						});
						myMask.show();
	Ext.Ajax.request({
		url : '/realware/loadIsDayEndFlag.do',
        method: 'POST',
		timeout:180000,  //设置为3分钟
		success : function(response, options) {
		myMask.hide();
			now = response.responseText;
			Ext.getCmp("pay_date").setValue(now);
			//refreshData();
			},
		failure : function(response, options) {
			failAjax(response,myMask);
			//refreshData();
		}
	});
}
/*******************************************************************************
 * 刷新
 * 
 * @return
 */
function refreshData() {
	gridPanel1.getStore().load();
}
