/*******************************************************************************
 * 主要用于划款凭证
 * 
 * @type
 */

/*******************************************************************************
 * 引入需要使用的js文件
 */
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/recommend.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/operationLog.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/ocxVoucher.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/lookPayVoucher.js"></scr' + 'ipt>');
	

// 划款信息
var fileds = ["pay_clear_voucher_code", "pay_amount", "agent_account_no",
		"agent_account_name", "agent_bank_name", "clear_account_no",
		"clear_account_name", "clear_bank_name", "fund_type_code",
		"fund_type_name", "pay_type_code", "pay_type_name", "pay_bank_no",
		"pay_bank_name", "clear_date", "confirm_date", "bgt_type_code",
		"bgt_type_name", "task_id", "pay_clear_voucher_id", "bill_type_id",
		"last_ver","admdiv_code","vt_code", "year","voucher_status_des"];


var header = "查看支付凭证|do1|130|lookPayVoucher,凭证号|pay_clear_voucher_code|130,凭证状态|voucher_status_des|100,金额|pay_amount|100,收款银行账号|agent_account_no|150,收款银行账户名称|agent_account_name|150,收款银行名称|agent_bank_name|150,"
		+ "付款银行账号|clear_account_no|150,付款银行账户名称|clear_account_name|150,付款银行名称|clear_bank_name|150,资金性质编码|fund_type_code,资金性质名称|fund_type_name,"
		+ "支付方式编码|pay_type_code,支付方式名称|pay_type_name,代理银行行号|pay_bank_no,代理银行名称|pay_bank_name,清算日期|clear_date,回单日期|confirm_date,"
		+ "预算类型编码|bgt_type_code,预算类型名称|bgt_type_name";

var clearGridPanel=null;


var comboVoucherStatus = Ext.create('Ext.data.Store', {
			fields : ['name', 'value'],
			data : [{
						"name" : "全部",
						"value" : ""
					}, {
						"name" : "银行未发送",
						"value" : "13"
					}, {
						"name" : "清算行未接收",
						"value" : "0"
					}, {
						"name" : "清算行接收成功",
						"value" : "1"
					}, {
						"name" : "清算行接收失败",
						"value" : "2"
					}, {
						"name" : "清算行签收成功",
						"value" : "3"
					}, {
						"name" : "清算行签收失败",
						"value" : "4"
					}, {
						"name" : "清算行已退回",
						"value" : "5"
					},{
						"name" : "已收到清算行回单",
						"value" : "12"
					}]
});		


Ext.onReady(function() {
	Ext.QuickTips.init();
	clearGridPanel = getGrid("/realware/loadClearPayVoucher.do", header,fileds, true, true);
	clearGridPanel.setHeight(document.documentElement.scrollHeight - 88);
	clearGridPanel.getStore().on('beforeload', function(thiz, options) {
		beforeload(Ext.getCmp("signSendClearVoucherQuery"), options, Ext.encode(fileds));
	});
	 clearGridPanel.title = "划款凭证信息";
	           var buttonItems = [{ 	id : 'signAndSend',
											
											handler : function() {
											signAndSendClearVoucher();
											}
										},{ id : 'signAndSendHenan',
										
											handler : function() {
												signAndSendClearVoucherHenan();
											}
										}, {
											id : 'send',
											
											handler : function() {
												sendPayClearVoucherAgain();
											}
										}, {
											id : 'uncreate',
											
											handler : function() {
												uncreateVoucher();
											}
										}, {
											id : 'look',
											
											handler : function() {
												lookOCX(clearGridPanel.getSelectionModel().getSelection(),"pay_clear_voucher_id");
											}
										}, {
											id : 'print',
											
											handler : function() {
													var recordsr = clearGridPanel.getSelectionModel().getSelection();
												if (recordsr.length == 0) {
													Ext.Msg.alert("系统提示", "请选择数据！");
													return;
												}
												printPageVoucherByXml(recordsr,"pay_clear_voucher_id",'pay_clear_voucher_code',recordsr[0].get("vt_code"));
											}
										
										}, {
											id : 'pay',
											handler : function() {
												checkTransferPayClearVoucher();
											}
										}, /*{
											id : 'log',
											
											handler : function() {
											//该模块不应显示操作日志 lfj 2015-10-20
												taskLog(
														clearGridPanel
																.getSelectionModel()
																.getSelection(),
														"pay_clear_voucher_id");
											}
										},*/ {
											id : 'refresh',
											
											handler : function() {
												refreshData();
											}
										}];
	
	       var queryItems=[
	                       {
	                    	 title : "查询区",
	                    	   id : 'signSendClearVoucherQuery',
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
								displayField : 'status_name',
								emptyText : '请选择',
								valueField : 'status_code',
								labelWidth : 60,
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
								labelWidth : 60,
								width : 160,
								editable : false,
								store : comboAdmdiv
							}, {
								id : 'createDate',
								fieldLabel : '生成日期',
								xtype : 'datefield',
								dataIndex : 'create_date',
								format : 'Ymd',
								labelWidth : 60,
								symbol : '>=',
								data_type:'date'
							},{
								id : 'createDateEnd',
								fieldLabel : '至',
								xtype : 'datefield',
								dataIndex : 'create_date ',
								format : 'Ymd',
								labelWidth : 15,
								symbol : '<=',
								maxValue : new Date(),
								data_type:'date'
							}, {
								id : 'voucherStatus',
								fieldLabel : '凭证状态',
								xtype : 'combo',
								dataIndex : 'voucher_status',
								value : "",
								displayField : 'name',
								emptyText : '请选择',
								valueField : 'value',
								store : comboVoucherStatus,
								editable : false,
								labelWidth : 60,
								width : 180,
								listeners : {
									'select' : selectStatus
								}
							}]
	                       }, clearGridPanel
	                    ];
	    Ext.StatusUtil.createViewport(buttonItems, queryItems, function() {
	    	var taskState = Ext.getCmp("taskState");
			Ext.StatusUtil.initPage(Ext.getCmp("admdiv"), taskState);
			// 默认设置为未生成
			taskState.setValue(taskState.getStore().getAt(0).get("status_code"));
		});
});
	

/*******************************************************************************
 * 状态下拉列表框选中事件
 */
function selectState() {
	var taskState = Ext.getCmp('taskState').getValue();
	if ("009" == taskState) {
		Ext.StatusUtil.batchEnable("signAndSend,log,print,signAndSendHenan");
		Ext.StatusUtil.batchDisable("send,voucherStatus,pay,uncreate,look");
		Ext.getCmp('voucherStatus').setVisible(false);
		Ext.getCmp("voucher_status_des").setVisible(false);
	} else if ("010" == taskState) {
		Ext.StatusUtil.batchEnable("voucherStatus,pay,log,look");
		Ext.StatusUtil.batchDisable("pay,uncreate,signAndSend,print,signAndSendHenan,send");
		Ext.getCmp('voucherStatus').setVisible(true);
		Ext.getCmp("voucher_status_des").setVisible(true);
	}  else if ("005" == taskState) {
		Ext.StatusUtil.batchEnable("pay,log,print");
		Ext.StatusUtil.batchDisable("look,voucherStatus,signAndSend,send,voucherStatus,uncreate,signAndSendHenan");
		Ext.getCmp('voucherStatus').setVisible(false);
		Ext.getCmp("voucher_status_des").setVisible(true);
	}
	Ext.getCmp('voucherStatus').setValue("");
}

function selectStatus(){
	var  statuId = Ext.getCmp('voucherStatus').getValue();
	if(statuId == "5" || statuId == "4"){
		Ext.StatusUtil.batchEnable('uncreate');	
	}else{
		Ext.StatusUtil.batchDisable('uncreate');	
	}
	if(statuId == "2"){
		Ext.StatusUtil.batchEnable('send');	
	}else{
		Ext.StatusUtil.batchDisable('send');	
	}
	refreshData();
}

/*******************************************************************************
 * 刷新
 */
function refreshData() {
	clearGridPanel.getStore().loadPage(1);
}

/*******************************************************************************
 * 签章发送
 */
function signAndSendClearVoucher() {
	var records = clearGridPanel.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请选择要签章划款单的数据！");
		return;
	}
	var reqIds = [];
	var reqVers = [];
	Ext.Array.each(records,function(model){
			reqIds.push(model.get("pay_clear_voucher_id"));
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
				url : '/realware/signAndSendClearVoucher.do',
				method : 'POST',
				timeout : 180000, // 设置为3分钟
				params : {
					billTypeId : bill_type_id,
					billIds : Ext.encode(reqIds),
					last_vers : Ext.encode(reqVers),
					menu_id :  Ext.PageUtil.getMenuId()
				},
				// 提交成功的回调函数
				success : function(response, options) {
					succAjax(response, myMask,true);
				},
				// 提交失败的回调函数
				failure : function(response, options) {
					failAjax(response, myMask);
					refreshData();
				}
			});
}
/*******************************************************************************
 * 签章发送
 */
function signAndSendClearVoucherHenan() {
	var records = clearGridPanel.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请选择要签章划款单的数据！");
		return;
	}
	var reqIds = [];
	var reqVers = [];
	Ext.Array.each(records,function(model){
			reqIds.push(model.get("pay_clear_voucher_id"));
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
				url : '/realware/signAndSendClearVoucherHenan.do',
				method : 'POST',
				timeout : 180000, // 设置为3分钟
				params : {
					billTypeId : bill_type_id,
					billIds : Ext.encode(reqIds),
					last_vers : Ext.encode(reqVers),
					menu_id :  Ext.PageUtil.getMenuId()
				},
				// 提交成功的回调函数
				success : function(response, options) {
					succAjax(response, myMask,true);
				},
				// 提交失败的回调函数
				failure : function(response, options) {
					failAjax(response, myMask);
					refreshData();
				}
			});
}

/*******************************************************************************
 * 重新发送
 */
function sendPayClearVoucherAgain() {
	var records = clearGridPanel.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请选择要需要重新发送的划款单！");
		return;
	}
	var ids = null;
	// 选中的凭证的id数组，要传到后台
	for (var i = 0; i < records.length; i++) {
		ids += records[i].get("pay_clear_voucher_id");
		if (i < records.length - 1)
			ids += ",";
	}
	var myMask = new Ext.LoadMask(Ext.getBody(), {
		msg : '后台正在处理中，请稍后....',
		removeMask : true
			// 完成后移除
		});
	myMask.show();
	Ext.Ajax.request({
				url : '/realware/sendPayClearVoucherAgain.do',
				method : 'POST',
				timeout : 180000, // 设置为3分钟
				params : {
					ids : ids,
					menu_id :  Ext.PageUtil.getMenuId()
				},
				success : function(response, options) {
					succAjax(response, myMask,true);
				},failure : function(response, options) {
					failAjax(response, myMask);
					refreshData();
				}
			});
}

/*******************************************************************************
 * 撤销生成
 */
function uncreateVoucher() {
	var records = clearGridPanel.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请选择要需要撤销生成的划款单！");
		return;
	}
	var myMask = new Ext.LoadMask(Ext.getBody(), {
				msg : '后台正在处理中，请稍后....',
				removeMask : true
			});
	var reqIds = [];
	var reqVers = [];
	Ext.Array.each(records, function(model) {
				reqIds.push(model.get("pay_clear_voucher_id"));
				reqVers.push(model.get("last_ver"));
			});
	myMask.show();
	Ext.Ajax.request({
				url : '/realware/unCreateClearVoucher.do',
				method : 'POST',
				timeout : 180000,
				params : {
					billTypeId : records[0].get("bill_type_id"),
					billIds : Ext.encode(reqIds),
					last_vers : Ext.encode(reqVers),
					isBack : true,
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
 * 退款清算转账
 * 
 */
function checkTransferPayClearVoucher(transSucc) {
	var records = clearGridPanel.getSelectionModel().getSelection();
	if (records.length != 1) {
		Ext.Msg.alert("系统提示", "请选中一条凭证信息");
		return;
	}
	// 凭证主键字符串
	var reqIds = [];
	var reqVers = [];
	Ext.Array.each(records,function(model){
		reqIds.push(model.get("pay_clear_voucher_id"));
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
				url : '/realware/checkTransferPayClearVoucher.do',
				params : {
					// 单据类型id
					billTypeId : records[0].get("bill_type_id"),
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