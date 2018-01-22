/*******************************************************************************
 * 主要用于授权额度清算回单签章发送
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
var planClearNotePanel = null;
/**
 * 数据项
 * @type 
 */
var fileds = ["plan_clear_note_id","plan_clear_note_code","plan_amount","plan_month","print_date","print_num","deptNum",
			   "fund_type_code","fund_type_name","clear_bank_code", "clear_bank_name","pay_bank_code", "pay_bank_name","pay_bank_no",
			   "acct_date", "task_id","bill_type_id","treCode","finOrgCode"];
/**
 * 列名
 * @type 
 */
var header = "凭证号|plan_clear_note_code|140,额度金额|plan_amount|100,计划月份|plan_month|100,处理日期|acct_date,预算单位数|deptNum,"
		+ "国库主体代码|treCode,财政机关代码|finOrgCode,清算银行编码|clear_bank_code,清算银行名称|clear_bank_name,代理银行编码|pay_bank_code,代理银行名称|pay_bank_name,"
		+ "资金性质编码|fund_type_code,资金性质名称|fund_type_name,代理银行行号|pay_bank_no";

/**
 * 状态集合
 */
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

var comboMonth = Ext.create('Ext.data.Store', {
			fields : ['plan_month_d', 'plan_month_x'],
			data : [{
						"plan_month_d" : "全部",
						"plan_month_x" : ""
					},{
						"plan_month_d" : "一月",
						"plan_month_x" : "01"
					},{
						"plan_month_d" : "二月",
						"plan_month_x" : "02"
					},{
						"plan_month_d" : "三月",
						"plan_month_x" : "03"
					},{
						"plan_month_d" : "四月",
						"plan_month_x" : "04"
					},{
						"plan_month_d" : "五月",
						"plan_month_x" : "05"
					},{
						"plan_month_d" : "六月",
						"plan_month_x" : "06"
					},{
						"plan_month_d" : "七月",
						"plan_month_x" : "07"
					},{
						"plan_month_d" : "八月",
						"plan_month_x" : "08"
					},{
						"plan_month_d" : "九月",
						"plan_month_x" : "09"
					},{
						"plan_month_d" : "十月",
						"plan_month_x" : "10"
					},{
						"plan_month_d" : "十一月",
						"plan_month_x" : "11"
					},{
						"plan_month_d" : "十二月",
						"plan_month_x" : "12"
					}]
		});
Ext.onReady(function() {
	Ext.QuickTips.init();
	if (planClearNotePanel == null) {
		planClearNotePanel = getGrid(loadUrl, header, fileds, true, true);
		planClearNotePanel.setHeight(document.documentElement.scrollHeight - 95);
		// 根据查询条件检索数据
		planClearNotePanel.getStore().on('beforeload', function(thiz, options) {
			var jsonMap = "[{";
			var taskState = Ext.getCmp('taskState').getValue();
			var code = Ext.getCmp('code').getValue();
			var codeEnd = Ext.getCmp('codeEnd').getValue();
			var planMonth = Ext.getCmp('planMonth').getValue();
			var admdiv = Ext.getCmp('admdiv').getValue();
			if (admdiv == null || admdiv == "")
				return;
			if ('001' == taskState) {
				jsonMap = jsonMap + "\"send_flag\":[\"=\",0],";
			} else if('002' == taskState){
				jsonMap = jsonMap + "\"send_flag\":[\"=\",1],";
			}
			if(("" != code && null != code) && ("" != codeEnd && null != codeEnd)){
				var jsonStr = [];
				jsonStr[0] = ">=";
				jsonStr[1] = code;
				jsonMap = jsonMap + "\"plan_clear_note_code\":"+ Ext.encode(jsonStr) + ",";
				var jsonStr = [];
				jsonStr[0] = "<=";
				jsonStr[1] = codeEnd;
				jsonMap = jsonMap + "\"plan_clear_note_code\":" + Ext.encode(jsonStr) + ",";
			}
			else if ("" != code && null != code) {
				var jsonStr = [];
				jsonStr[0] = "LIKE";
				jsonStr[1] = code;
				jsonMap = jsonMap + "\"plan_clear_note_code\":"+ Ext.encode(jsonStr) + ",";
			}
			else if ("" != codeEnd && null != codeEnd) {
				var jsonStr = [];
				jsonStr[0] = "LIKE";
				jsonStr[1] = codeEnd;
				jsonMap = jsonMap + "\"plan_clear_note_code\":"+ Ext.encode(jsonStr) + ",";
			}
			if ("" != planMonth && null != planMonth) {
				var jsonStr = [];
				jsonStr[0] = "=";
				jsonStr[1] = planMonth;
				jsonMap = jsonMap + "\"plan_month\":"+ Ext.encode(jsonStr) + ",";
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
								xtype : 'buttongroup',
								items : [{
											id : 'signAndSend',
											text : '签章发送',
											iconCls : 'sign',
											scale : 'small',
											handler : function() {
												signAndSendPlanClearNote();
											}
										},{
												id : 'send',
												text : '重新发送',
												iconCls : 'sign',
												scale : 'small',
												handler : function() {
													sendPlanClearNoteAgain();
												}
										},{
											text : '查看凭证',
											iconCls : 'look',
											scale : 'small',
											handler : function() {
												lookOCX(planClearNotePanel.getSelectionModel().getSelection(),"plan_clear_note_id");
											}
										}, {
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
													dataIndex : 'task_status',
													displayField : 'name',
													emptyText : '请选择',
													valueField : 'value',
													labelWidth : 53,
													width:140,
													editable : false,
													store : comboStore,
													listeners : {
														'select' : selectState
													}
												}, {
													id : 'admdiv',
													fieldLabel : '所属财政',
													xtype : 'combo',
													dataIndex : 'admdiv',
													displayField : 'admdiv_name',
													emptyText : '请选择',
													valueField : 'admdiv_code',
													labelWidth : 53,
													editable : false,
													store : comboAdmdiv,
													listeners : {
														'select' : selectAdmdiv
													}
												}, {
													id : 'code',
													fieldLabel : '凭证号',
													xtype : 'textfield',
													labelWidth : 40,
													dataIndex : 'code'
												}, {
													id : 'codeEnd',
													fieldLabel : '至',
													xtype : 'textfield',
													labelWidth : 10,
													dataIndex : 'code'
												}, {

													id : 'planMonth',
													fieldLabel : '计划月份',
													xtype : 'combo',
													labelWidth : 53,
													value : '',
													dataIndex : 'plan_month',
													displayField : 'plan_month_d',
													emptyText : '',
													valueField : 'plan_month_x',
													labelWidth : 53,
													editable : false,
													store : comboMonth
												}],
										flex : 2
									}, planClearNotePanel]
						})]
			});
	if (comboAdmdiv.data.length > 0) {
		Ext.getCmp('admdiv').setValue(comboAdmdiv.data.getAt(0).get("admdiv_code"));
	}
	
	Ext.getCmp('taskState').setValue("001");
	selectState();
});

/***************************************************************************
* 状态下拉列表框选中事件
*/
function selectState() {
	var taskState = Ext.getCmp('taskState').getValue();
	if ("001" == taskState) {
		Ext.getCmp('signAndSend').enable(false);
		Ext.getCmp('send').disable(false);
	} else if ("002" == taskState) {
		Ext.getCmp('signAndSend').disable(false);
		Ext.getCmp('send').enable(false);
	}
	refreshData();
}

function selectAdmdiv() {
	refreshData();
}

function signAndSendPlanClearNote(){
	var records = planClearNotePanel.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请选择要签章发送的授权额度汇总清算单的数据！");
		return;
	}
	var ids = null;
	// 选中的凭证的id数组，要传到后台
	for (var i = 0; i < records.length; i++) {
		ids += records[i].get("plan_clear_note_id");
		if (i < records.length - 1)
			ids += ",";
	}
	var myMask = new Ext.LoadMask(Ext.getBody(), {
			msg : '后台正在处理中，请稍后....',
			removeMask : true // 完成后移除
		});
	myMask.show();
	Ext.Ajax.request({
				url : signAndSendUrl,
				waitMsg : '后台正在处理中,请稍后....',
				method : 'POST',
				timeout : 180000, //设置为3分钟
				async : false,//添加该属性即可同步,
				params : {
					planClearNoteIds : ids
				},
				success : function(response, options) {
					succAjax(response, myMask);
				},
				failure : function(response, options) {
					failAjax(response, myMask);
					refreshData();
				}
			});
}

function sendPlanClearNoteAgain(){
	var records = planClearNotePanel.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请选择要需要重新发送的数据！");
		return;
	}
	var ids = null;
	// 选中的凭证的id数组，要传到后台
	for (var i = 0; i < records.length; i++) {
		ids += records[i].get("plan_clear_note_id");
		if (i < records.length - 1)
			ids += ",";
	}
	var myMask = new Ext.LoadMask(Ext.getBody(), {
			msg : '后台正在处理中，请稍后....',
			removeMask : true // 完成后移除
		});
	myMask.show();
	Ext.Ajax.request({
				url : sendAgainUrl,
				waitMsg : '后台正在处理中,请稍后....',
				method : 'POST',
				timeout : 180000, //设置为3分钟
				async : false,//添加该属性即可同步,
				params : {
					planClearNoteIds : ids
				},
				success : function(response, options) {
					succAjax(response, myMask);
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
	planClearNotePanel.getStore().loadPage(1);
}
