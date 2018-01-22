/*******************************************************************************
 * 单条查询财政资金跨行业务，网银可根据“核销状态”字段判断跨行落地业务的执行情况
 * @type
 */

/***
 * 引入需要使用的js文件
 */
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/recommend.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/operationLog.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/ocxVoucher.js"></scr' + 'ipt>');
	

/**
 * 数据项
 */
 
var fileds = ["payee_account_bank_no", "pay_voucher_code", "vou_date",
		"pay_amount", "payee_account_no", "payee_account_name",
		"payee_account_bank", "pay_account_no", "pay_account_name",
		"pay_account_bank", "pay_bank_code", "pay_bank_name",
		"clear_bank_code", "clear_bank_name", "checkNo", "fund_deal_mode_code",
		"fund_deal_mode_name", "fund_type_code", "fund_type_name",
		"pay_type_code", "pay_type_name", "set_mode_code", "set_mode_name",
		"pay_summary_code", "pay_summary_name", "task_id", "pay_voucher_id",
		"bill_type_id","write_off_describe","last_ver"];

/**
 * 列名
 */
var header = "凭证号|pay_voucher_code|140,核销状态|write_off_describe|100,凭证日期|vou_date|100,支付金额|pay_amount|120,收款人账号|payee_account_no,"
		+ "收款人名称|payee_account_name|140,收款人银行|payee_account_bank|140,付款人账号|pay_account_no,付款人名称|pay_account_name|140,付款人银行|pay_account_bank|140,"
		+ "代理银行编码|pay_bank_code,代理银行名称|pay_bank_name,清算银行编码|clear_bank_code,清算银行名称|clear_bank_name,支票号|checkNo,办理方式编码|fund_deal_mode_code,"
		+ "办理方式名称|fund_deal_mode_name,资金性质编码|fund_type_code,资金性质名称|fund_type_name,支付方式编码|pay_type_code,"
		+ "支付方式名称|pay_type_name,结算方式编码|set_mode_code,结算方式名称|set_mode_name,用途编码|pay_summary_code,用途名称|pay_summary_name";

/**
 * 列表
 */
var gridPanel1 = null;

var comboStore = Ext.create('Ext.data.Store', {
			fields : ['name', 'value'],
			data : [{
						"name" : "未核销",
						"value" : "001"
					},{
						"name" : "已核销",
						"value" : "002"
					}]
		});

/**
 * 界面加载
 */
Ext.onReady(function() {
	Ext.QuickTips.init();
	if (gridPanel1 == null) {
		gridPanel1 = getGrid(loadUrl, header, fileds, true, true);
		gridPanel1.setHeight(document.documentElement.scrollHeight - 95);
		// 根据查询条件检索数据
		gridPanel1.getStore().on('beforeload', function(thiz, options) {
			var jsonMap = "[{\"account_type_right\":[\"=\","
					+ account_type_right + "],\"vt_code\":[\"=\",\"" + vtCode
					+ "\"],";
//			jsonMap = jsonMap + "\"payee_account_bank_no\":[\"<>\",\"103\"],";
			jsonMap = jsonMap + "\"fapabc\":[\"=\",\"1\"],";
			var taskState = Ext.getCmp('taskState').getValue();
			var code = Ext.getCmp('code').getValue();
			var codeEnd = Ext.getCmp('codeEnd').getValue();
			var vouDate = Ext.getCmp('vouDate').getValue();
			var checkNo = Ext.getCmp('checkNo1').getValue();
			var admdiv = Ext.getCmp('admdiv').getValue();
			if (admdiv == null || admdiv == "")
				return;
//			if ('001' == taskState) {
//				jsonMap = jsonMap + "\"batchreq_status\":[\"=\",0],";
//			}
			if ('001' == taskState) {
				jsonMap = jsonMap + "\"write_off_status\":[\"<>\",3],";
			}else if('002' == taskState){
				jsonMap = jsonMap + "\"write_off_status\":[\"=\",3],";
			}
			if(("" != code && null != code) && ("" != codeEnd && null != codeEnd)){
				var jsonStr = [];
				jsonStr[0] = ">=";
				jsonStr[1] = code;
				jsonMap = jsonMap + "\"pay_voucher_code\":"+ Ext.encode(jsonStr) + ",";
				var jsonStr = [];
				jsonStr[0] = "<=";
				jsonStr[1] = codeEnd;
				jsonMap = jsonMap + "\"pay_voucher_code\":" + Ext.encode(jsonStr) + ",";
			}
			else if ("" != code && null != code) {
				var jsonStr = [];
				jsonStr[0] = "LIKE";
				jsonStr[1] = code;
				jsonMap = jsonMap + "\"pay_voucher_code\":"+ Ext.encode(jsonStr) + ",";
			}
			else if ("" != codeEnd && null != codeEnd) {
				var jsonStr = [];
				jsonStr[0] = "LIKE";
				jsonStr[1] = codeEnd;
				jsonMap = jsonMap + "\"pay_voucher_code\":"+ Ext.encode(jsonStr) + ",";
			}
			if ("" != vouDate && null != vouDate) {
				var jsonStr = [];
				jsonStr[0] = "=";
				jsonStr[1] = Todate(vouDate);
				jsonMap = jsonMap + "\"vou_date\":" + Ext.encode(jsonStr) + ",";
			}
			if ("" != checkNo && null != checkNo) {
				var jsonStr = [];
				jsonStr[0] = "LIKE";
				jsonStr[1] = checkNo;
				jsonMap = jsonMap + "\"checkNo\":" + Ext.encode(jsonStr) + ",";
			}
			var jsonStr = [];
			jsonStr[0] = "=";
			jsonStr[1] = admdiv;
			jsonMap = jsonMap + "\"admdiv_code\":" + Ext.encode(jsonStr) + ",";
			var data = jsonMap.substring(0, jsonMap.length - 1) + "}]";
			if (null == options.params || options.params == undefined) {
				options.params = [];
				options.params["jsonMap"] = data;
				options.params["filedNames"] = JSON.stringify(fileds);
			} else {
				options.params["jsonMap"] = data;
				options.params["filedNames"] = JSON.stringify(fileds);
			}
		});
	}
	Ext.create('Ext.Viewport', {
				id : 'checkVoucherFrame',
				layout : 'fit',
				items : [Ext.create('Ext.panel.Panel', {
							tbar : [{
								id : 'buttongroup',
								xtype : 'buttongroup',
								items : [{
											id : 'query',
											text : '核销查询',
											iconCls : 'pay',
											scale : 'small',
											handler : function() {
												queryDifTrans();
											}
										},{
											id : 'print',
											text : '打印',
											iconCls : 'print',
											scale : 'small',
											handler : function() {
												printVoucher(gridPanel1.getSelectionModel().getSelection(),"pay_voucher_id",false);
											}
										},{
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
										title : '查询区',
										bodyPadding : 5,
										layout : 'hbox',
										defaults : {
											margins : '3 5 0 0'
										},
										items : [{
													id : 'taskState',
													fieldLabel : '当前状态',
													xtype : 'combo',
													dataIndex : 'task_state',
													displayField : 'name',
													emptyText : '请选择',
													valueField : 'value',
													labelWidth : 53,
													width: 140,
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
													labelWidth : 53,
													width: 180,
													editable : false,
													store : comboAdmdiv,
													listeners : {
														'select' : selectAdmdiv
													}
												}, {
													id : 'code',
													fieldLabel : '凭证号',
													xtype : 'textfield',
													labelWidth : 42,
													width: 140,
													dataIndex : 'code'
												}, {
													id : 'codeEnd',
													fieldLabel : '至',
													xtype : 'textfield',
													width: 113,
													labelWidth : 15,
													dataIndex : 'code'
												}, {

													id : 'vouDate',
													fieldLabel : '凭证日期',
													xtype : 'datefield',
													width: 150,
													labelWidth : 53,
													format : 'Y-m-d',
													dataIndex : 'vou_date'
												}, {
													id : 'checkNo1',
													fieldLabel : '支票号',
													xtype : 'textfield',
													dataIndex : 'checkNo1',
													labelWidth : 42
												}],
										flex : 2
									}, gridPanel1]
						})]
			});
	if (comboAdmdiv.data.length > 0) {
		Ext.getCmp('admdiv').setValue(comboAdmdiv.data.getAt(0).get("admdiv_code"));
	}
	if (account_type_right == "11") {
		Ext.getCmp("checkNo1").setVisible(false);
	}
	Ext.getCmp('taskState').setValue("001");
	setBtnVisible(Ext.getCmp("admdiv").getValue(), Ext.getCmp("buttongroup"));
	//selectState();
});


/*******************************************************************************
 * 切换状态（初审）
 * 
 * @return
 */
function selectState() {
	var taskState = Ext.getCmp('taskState').getValue();
	if ("001" == taskState) {
		Ext.getCmp('query').enable(false);
	} else if ("002" == taskState) {
		Ext.getCmp('query').disable(false);
	}
	refreshData();
}

function selectAdmdiv() {
	setBtnVisible(Ext.getCmp("admdiv").getValue(),null);
	refreshData();
}

/**
 * 查询跨行交易是否处于核销状态
 * @return
 */
function queryDifTrans(){
	var records = gridPanel1.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请选中凭证信息！");
		return;
	} else {
		var billIds = null;
		Ext.Array.each(records, function(model) {
					billIds = billIds + model.get("pay_voucher_id") + ",";
				});
		var myMask = new Ext.LoadMask(Ext.getBody(), {
			msg : '后台正在处理中，请稍后....',
			removeMask : true // 完成后移除
		});
		myMask.show();
		Ext.Ajax.request({
					url : queryUrl,
					method : 'POST',
					timeout : 180000, // 设置为3分钟
					params : {
						billIds : billIds.substring(0, billIds.length - 1)
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

}

/*******************************************************************************
 * 刷新
 * 
 * @return
 */
function refreshData() {
	gridPanel1.getStore().loadPage(1);
}
