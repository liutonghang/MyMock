/*******************************************************************************
 * 主要用支付凭证签章发送
 * 
 * @type
 */

/***
 * 引入需要使用的js文件
 */
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/recommend.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/operationLog.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/ocxVoucher.js"></scr' + 'ipt>');
	

var gridPanel1 = null;

/**
 * 数据项
 */
var fileds = ["pay_voucher_code", "voucher_status_des", "vou_date", "pay_amount","agent_business_no", "payee_account_no",
		"payee_account_name", "payee_account_bank", "payee_account_bank_no",
		"pay_account_no", "pay_account_name", "pay_account_bank",
		"pay_bank_code", "pay_bank_name", "clear_bank_code", "clear_bank_name",
		"checkNo", "fund_deal_mode_code", "fund_deal_mode_name",
		"fund_type_code", "fund_type_name", "pay_type_code", "pay_type_name",
		"set_mode_code", "set_mode_name", "pay_summary_code",
		"pay_summary_name", "task_id", "pay_voucher_id", "bill_type_id","last_ver","voucher_status_err","ori_voucher_id"];

/**
 * 列名
 */
var header = "凭证号|pay_voucher_code|140,凭证状态|voucher_status_des|100,凭证日期|vou_date|100,支付金额|pay_amount|120,交易流水|agent_business_no|150,收款人账号|payee_account_no,"
		+ "收款人名称|payee_account_name|140,收款人银行|payee_account_bank|140,收款行行号|payee_account_bank_no,"
		+ "付款人账号|pay_account_no,付款人名称|pay_account_name|140,付款人银行|pay_account_bank|140,代理银行编码|pay_bank_code,"
		+ "代理银行名称|pay_bank_name,清算银行编码|clear_bank_code,清算银行名称|clear_bank_name,支票号|checkNo,办理方式编码|fund_deal_mode_code,"
		+ "办理方式名称|fund_deal_mode_name,资金性质编码|fund_type_code,资金性质名称|fund_type_name,支付方式编码|pay_type_code,"
		+ "支付方式名称|pay_type_name,结算方式编码|set_mode_code,结算方式名称|set_mode_name,用途编码|pay_summary_code,"
		+ "用途名称|pay_summary_name,错误原因|voucher_status_err";

var comboStore = Ext.create('Ext.data.Store', {
			fields : ['name', 'value'],
			data : [{
						"name" : "未发送",
						"value" : "001"
					}, {
						"name" : "已发送",
						"value" : "002"
					}]
		});

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
		gridPanel1.setHeight(document.documentElement.scrollHeight - 100);
		// 根据查询条件检索数据
		gridPanel1.getStore().on('beforeload', function(thiz, options) {
			var jsonMap = "[{\"account_type_right\":[\"=\","+ account_type_right + "],";
			var taskState = Ext.getCmp('taskState').getValue();
			var code = Ext.getCmp('code').getValue();
			var codeEnd = Ext.getCmp('codeEnd').getValue();
			var vouDate = Ext.getCmp('vouDate').getValue();
			var checkNo = Ext.getCmp('checkNo1').getValue();
			var admdiv = Ext.getCmp('admdiv').getValue();
			if (admdiv == null || admdiv == "")
				return;
			if ("001" == taskState) {
				var jsonStr = [];
				jsonStr[0] = "=";
				jsonStr[1] = "001";
				jsonMap = jsonMap + "\"task_state\":" + Ext.encode(jsonStr)
						+ ",\"send_flag\":[\"=\",0],";
			} else if ("002" == taskState) {
				var jsonStr = [];
				jsonStr[0] = "=";
				jsonStr[1] = "002";
				jsonMap = jsonMap + "\"task_state\":" + Ext.encode(jsonStr)
						+ ",\"send_flag\":[\"=\",1],";
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
				id : 'transferVoucherFrame',
				layout : 'fit',
				items : [Ext.create('Ext.panel.Panel', {
							tbar : [{
								id : 'buttongroup',
								xtype : 'buttongroup',
								items : [{
											id : 'signsend',
											text : '签章发送',
											iconCls : 'sign',
											scale : 'small',
											handler : function() {
												sendVoucher(true);
											}
										},{
											id : 'back',
											text : '退回上岗',
											iconCls : 'back',
											scale : 'small',
											handler : function() {
												backVoucher();
											}
										}, {
											id : 'afreshSend',
											text : '重新发送',
											iconCls : 'audit',
											scale : 'small',
											handler : function() {
												sendVoucher(false);
											}
										}, {
											id : 'look',
											text : '查看凭证',
											iconCls : 'look',
											scale : 'small',
											handler : function() {
												lookOCX(gridPanel1.getSelectionModel().getSelection(),"pay_voucher_id");
											}
										},{
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
													store : comboStore,
													editable : false,
													labelWidth : 53,
													width:140,
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
													dataIndex : 'code',
													width: 140,
													labelWidth : 49
												}, {
													id : 'codeEnd',
													fieldLabel : '至',
													xtype : 'textfield',
													width: 113,
													labelWidth : 13,
													dataIndex : 'code'
												}, {
													id : 'vouDate',
													fieldLabel : '凭证日期',
													xtype : 'datefield',
													dataIndex : 'vou_date',
													format : 'Y-m-d',
													width: 150,
													labelWidth : 53
												}, {
													id : 'checkNo1',
													fieldLabel : '支票号',
													xtype : 'textfield',
													dataIndex : 'checkNo1',
													labelWidth : 49,
													width:140
												}]
									}, gridPanel1]
						})]
			});

	if (comboAdmdiv.data.length > 0) {
		Ext.getCmp('admdiv').setValue(comboAdmdiv.data.getAt(0)
				.get("admdiv_code"));
	}
	if (account_type_right == "11") {
		Ext.getCmp("checkNo1").setVisible(false);
	}
	Ext.getCmp('taskState').setValue("001");
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
		Ext.getCmp("voucher_status_des").setVisible(false);
		Ext.getCmp('signsend').enable(false);
		Ext.getCmp('look').disable(false);
		Ext.getCmp('afreshSend').disable(false);
		Ext.getCmp('back').enable(false);
	} else if ("002" == taskState) {
		Ext.getCmp("voucher_status_des").setVisible(true);
		Ext.getCmp('signsend').disable(false);
		Ext.getCmp('look').enable(false);
		Ext.getCmp('afreshSend').enable(false);
		Ext.getCmp('back').disable(false);
	}
	refreshData();
}

function selectAdmdiv() {
	setBtnVisible(Ext.getCmp("admdiv").getValue(), null);
	Ext.getCmp('taskState').setValue("001");
	refreshData();
}

/*******************************************************************************
 * 发送凭证
 */
function sendVoucher(isFlow) {
	var records = gridPanel1.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请选中一条凭证信息！");
		return;
	}
	var ids = []; // 凭证主键字符串
	var lastVers = []; // 凭证lastVer字符串
	Ext.Array.each(records,function(model){
			ids.push(model.get("pay_voucher_id"));
			lastVers.push(model.get("last_ver"));
	});
	var myMask = new Ext.LoadMask(Ext.getBody(), {
			msg : '后台正在处理中，请稍后....',
			removeMask : true // 完成后移除
		});
	myMask.show();
	Ext.Ajax.request({
				url : signPayVoucherUrl,
				method : 'POST',
				timeout : 180000, // 设置为3分钟
				params : {
					billTypeId :  records[0].get("bill_type_id"),
					billIds : Ext.encode(ids),
					last_vers: Ext.encode(lastVers),
					isFlow : isFlow,
					menu_id :  Ext.PageUtil.getMenuId()
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
 * 
 * @return
 */
function refreshData() {
	gridPanel1.getStore().loadPage(1);
}


/********************************************************************
 * 退回上岗 河北先发送财政签收成功以后再转账
 */
function backVoucher() {
	var records = gridPanel1.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请选中一条凭证信息！");
		return;
	}
	var ids = []; // 凭证主键字符串
	var lastVers = []; // 凭证lastVer字符串
	Ext.Array.each(records,function(model){
			ids.push(model.get("pay_voucher_id"));
			lastVers.push(model.get("last_ver"));
	});
	var myMask = new Ext.LoadMask(Ext.getBody(), {
			msg : '后台正在处理中，请稍后....',
			removeMask : true // 完成后移除
		});
	myMask.show();
	Ext.Ajax.request({
				url : '/realware/returnVoucher.do',
				method : 'POST',
				timeout : 180000, // 设置为3分钟
				params : {
					billTypeId :  records[0].get("bill_type_id"),
					billIds : Ext.encode(ids),
					last_vers: Ext.encode(lastVers)
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