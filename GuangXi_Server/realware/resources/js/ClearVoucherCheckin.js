/*******************************************************************************
 * 主要用于划款凭证来账登记
 * 
 * @type
 */
 
/***
 * 引入需要使用的js文件
 */
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/recommend.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/operationLog.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/ocxVoucher.js"></scr' + 'ipt>');

// 划款信息
var fileds = ["pay_clear_voucher_code", "pay_amount", "agent_account_no",
		"agent_account_name", "agent_bank_name", "clear_account_no",
		"clear_account_name", "clear_bank_name", "fund_type_code",
		"fund_type_name", "pay_type_code", "pay_type_name", "pay_bank_code",
		"pay_bank_name", "clear_date", "confirm_date", "bgt_type_code",
		"bgt_type_name", "task_id", "pay_clear_voucher_id", "bill_type_id",
		"last_ver"];

var header = "凭证号|pay_clear_voucher_code|130,金额|pay_amount|100,收款银行账号|agent_account_no|150,收款银行账户名称|agent_account_name|150,收款银行名称|agent_bank_name|150,"
		+ "付款银行账号|clear_account_no|150,付款银行账户名称|clear_account_name|150,付款银行名称|clear_bank_name|150,资金性质编码|fund_type_code,资金性质名称|fund_type_name,"
		+ "支付方式编码|pay_type_code,支付方式名称|pay_type_name,代理银行编码|pay_bank_code,代理银行名称|pay_bank_name,清算日期|clear_date,回单日期|confirm_date,"
		+ "预算类型编码|bgt_type_code,预算类型名称|bgt_type_name";

var comboStore = Ext.create('Ext.data.Store', {
			fields : ['name', 'value'],
			data : [{
						"name" : "未登记",
						"value" : "001"
					}, {
						"name" : "已登记",
						"value" : "002"
					}]
		});
		
Ext.onReady(function() {
	// 初始化Ext.QuickTips，启用悬浮提示
	Ext.QuickTips.init();
	//引用工具类
	Ext.Loader.setPath('Ext', 'js/util');
	Ext.require(['Ext.PageUtil']);
	clearGridPanel = getGrid("/realware/loadClearPayVoucher.do", header,fileds, true, true);
	clearGridPanel.setHeight(document.documentElement.scrollHeight - 95);
	clearGridPanel.title = "划款凭证信息";
	// 根据查询条件检索数据
	clearGridPanel.getStore().on('beforeload', function(thiz, options) {
		var jsonMap = "[{\"specialsql\":[\"\",\" AND (clear_date is not null)\"],";
		var admdiv = Ext.getCmp('admdiv').getValue();
		if (admdiv == null || admdiv == "")
			return;
		var taskState = Ext.getCmp('taskState').getValue();
		var jsonStr = [];
		jsonStr[0] = "=";
		jsonStr[1] = taskState;
		jsonMap = jsonMap + "\"task_state\":" + Ext.encode(jsonStr) + ",";

		// 凭证号
		var code = Ext.getCmp("code").getValue();
		// 清算日期
		var clearDate = Ext.getCmp("clearDate").getValue();

		if (code != null && code != "") {
			var jsonStr = [];
			jsonStr[0] = "LIKE";
			jsonStr[1] = code;
			var name = "pay_clear_voucher_code";
			jsonMap = jsonMap + "\"" + name + "\":" + Ext.encode(jsonStr) + ",";
		}
		if (clearDate != null && clearDate != "") {
			var jsonStr = [];
			jsonStr[0] = "=";
			jsonStr[1] = Todate(createDate);
			jsonMap = jsonMap + "\"clear_date\":" + Ext.encode(jsonStr) + ",";
		}
		var jsonStr1 = [];
		jsonStr1[0] = "=";
		jsonStr1[1] = admdiv;
		jsonMap = jsonMap + "\"admdiv_code\":" + Ext.encode(jsonStr1) + ",";

		var data = jsonMap.substring(0, jsonMap.length - 1) + "}]";
		if (null == options.params || options.params == undefined) {
			options.params = [];
		}
		options.params["jsonMap"] = data;
		options.params["filedNames"] = Ext.encode(fileds);
	});
	
	Ext.create('Ext.Viewport', {
		id : 'ClearVoucherCheckinFrame',
		layout : 'fit',
		items : [Ext.create('Ext.panel.Panel', {
			tbar : [{
				id : 'buttongroup',
				xtype : 'buttongroup',
				items : [{
							id : 'checkin',
							text : '登记',
							iconCls : 'sign',
							scale : 'small',
							handler : function() {
								checkinClearVoucher();
							}
						}, {
							id : 'look',
							text : '查看凭证',
							iconCls : 'look',
							scale : 'small',
							handler : function() {
								lookOCX(clearGridPanel.getSelectionModel().getSelection(),"pay_clear_voucher_id");
							}
						}, {
							id : 'log',
							text : '查看操作日志',
							iconCls : 'log',
							scale : 'small',
							handler : function() {
								taskLog(clearGridPanel.getSelectionModel().getSelection(),"pay_clear_voucher_id");
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
							margins : '3 10 0 0'
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
									editable : false,
									store : comboStore,
									value : '001',
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
								}, {
									id : 'code',
									fieldLabel : '凭证号',
									xtype : 'textfield',
									dataIndex : 'code',
									labelWidth : 42
								}, {
									id : 'clearDate',
									fieldLabel : '清算日期',
									xtype : 'datefield',
									dataIndex : 'clear_date',
									format : 'Y-m-d',
									labelWidth : 53
								}],
						flex : 2
					}, clearGridPanel]
		})]
	});
	setBtnVisible(Ext.getCmp("admdiv").getValue(), Ext.getCmp("buttongroup"));
	selectState();
});

/***************************************************************************
 * 状态下拉列表框选中事件
 */
function selectState() {
	var taskState = Ext.getCmp('taskState').getValue();
	if ("001" == taskState) {
		Ext.getCmp('checkin').enable(false);
	} else if ("002" == taskState) {
		Ext.getCmp('checkin').disable(false);
	}
	refreshData();
}

/***************************************************************************
 * 所属财政
 */
function selectAdmdiv() {
	setBtnVisible(Ext.getCmp("admdiv").getValue(),null);
	refreshData();
}

/***************************************************************************
 * 刷新
 */
function refreshData() {
	clearGridPanel.getStore().loadPage(1);
}

/***************************************************************************
 *登记
 */
function checkinClearVoucher() {
	var records = clearGridPanel.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请选择要签章划款单的数据！");
		return;
	}

	var reqIds = []; // 划款凭证主键字符串
	var reqVers = []; //划款凭证lastVer字符串
	for (var i = 0; i < records.length; i++) {
		reqIds.push(records[i].get("pay_clear_voucher_id"));
		reqVers.push(records[i].get("last_ver"));
//		reqIds += records[i].get("pay_clear_voucher_id");
//		reqVers += records[i].get("last_ver");
//		if (i < records.length - 1) {
//			reqIds += ",";
//			reqVers += ",";
//		}
	}
	var bill_type_id = records[0].get("bill_type_id");

	var myMask = new Ext.LoadMask(Ext.getBody(), {
		msg : '后台正在处理中，请稍后....',
		removeMask : true
			// 完成后移除
		});
	myMask.show();
	Ext.Ajax.request({
				url : '/realware/checkinClearVoucher.do',
				method : 'POST',
				timeout : 180000, // 设置为3分钟
				params : {
					billTypeId : bill_type_id,
					billIds : Ext.encode(reqIds),
					last_vers : Ext.encode(reqVers),
					menu_id :  Ext.PageUtil.getMenuId()
				},
				//提交成功的回调函数
				success : function(response, options) {
					succAjax(response, myMask);
					refreshData();
				},
				// 提交失败的回调函数
				failure : function(response, options) {
					failAjax(response, myMask);
					refreshData();
				}
			});
}
