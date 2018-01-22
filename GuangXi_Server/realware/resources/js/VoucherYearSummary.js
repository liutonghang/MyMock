/*******************************************************************************
 * 主要用于支付凭证年结处理
 */
 
/***
 * 引入需要使用的js文件
 */
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/recommend.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/operationLog.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/importFile.js"></scr' + 'ipt>');
//在生成划款单之后就可以打印划款单(主要用于2302)
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/ocxVoucher.js"></scr' + 'ipt>');

// 支付凭证列表面板
var voucherPanel = null;

// 凭证信息
var fileds = ["admdiv_code","pay_voucher_code", "vou_date", "pay_amount",
		"payee_account_no", "payee_account_name", "payee_account_bank",  
		"payee_account_bank_no", "pay_account_no", "pay_account_name",
		"pay_account_bank", "pay_bank_code", "pay_bank_name",
		"clear_bank_code", "clear_bank_name", "checkNo", "fund_deal_mode_code",
		"fund_deal_mode_name", "fund_type_code", "fund_type_name",
		"pay_type_code", "pay_type_name", "set_mode_code", "set_mode_name",
		"pay_summary_code", "pay_summary_name", "task_id", "pay_voucher_id",
		"bill_type_id", "last_ver", "pay_bank_no","vt_code","pay_date"];


var header = "凭证号|pay_voucher_code|130,凭证日期|vou_date|100,支付金额|pay_amount|120,收款人账号|payee_account_no|130,"
		+ "收款人名称|payee_account_name|140,收款人银行|payee_account_bank|140,收款行行号|payee_account_bank_no,"
		+ "付款人账号|pay_account_no,付款人名称|pay_account_name|140,付款人银行|pay_account_bank|140,代理银行行号|pay_bank_no,"
		+ "代理银行名称|pay_bank_name,清算银行编码|clear_bank_code,清算银行名称|clear_bank_name,支票号|checkNo,办理方式编码|fund_deal_mode_code,"
		+ "办理方式名称|fund_deal_mode_name,资金性质编码|fund_type_code,资金性质名称|fund_type_name,支付方式编码|pay_type_code,"
		+ "支付方式名称|pay_type_name,结算方式编码|set_mode_code,结算方式名称|set_mode_name,用途编码|pay_summary_code,"
		+ "用途名称|pay_summary_name,支付日期|pay_date|140";
		


/*******************************************************************************
 * 初始化
 */
Ext.onReady(function() {
	// 初始化Ext.QuickTips，启用悬浮提示
	Ext.QuickTips.init();
	voucherPanel = getGrid("/realware/loadPayVoucherss.do", header, fileds, true, true);
	voucherPanel.setHeight(document.documentElement.scrollHeight - 85);
	voucherPanel.title = "凭证列表信息";
	voucherPanel.getStore().on('beforeload', function(thiz, options,e) {
		var panel = Ext.getCmp("VoucherSummaryQuery");
		beforeload(panel, options, Ext.encode(fileds));
	});
	var buttonItems = [{
						id : 'send',
						handler : function() {
							sendVoucher();
						}
					}, {
						id : 'writeoff',
						handler : function() {
							writeoffPayVoucher();
						}
					}, {
						id : 'back',
						handler : function() {
							back();
						}
					}, {
						id : 'look',
						handler : function() {
							lookOCX(voucherPanel.getSelectionModel().getSelection(),"pay_voucher_id");
						}
					},{
						id : 'refresh',
						handler : function() {
							refreshData();
						}
					}];
	var queryItems = [{
						title : '查询区',
						id : 'VoucherSummaryQuery',
						frame : false,
						defaults : {
							padding : '0 3 0 3'
						},
						layout : 'hbox',
						bodyPadding : 5,
						items : [{
									id : 'taskState',
									fieldLabel : '当前状态',
									xtype : 'combo',
									displayField : 'status_name',
									dataIndex : 'task_status',
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
									editable : false,
									labelWidth : 60,
									store : comboAdmdiv
								}, {
									id : 'code',
									fieldLabel : '凭证号',
									xtype : 'textfield',
									symbol : '>=',
									labelWidth : 45,
									width : 160,
									dataIndex : 'pay_voucher_code '
								}, {
									id : 'codeEnd',
									fieldLabel : '至',
									xtype : 'textfield',
									labelWidth : 45,
									width : 160,
									symbol : '<=',
									dataIndex : 'pay_voucher_code'
								}, {
									id : 'vouDate',
									fieldLabel : '凭证日期',
									xtype : 'datefield',
									labelWidth : 60,
									width : 160,
									dataIndex : 'vou_date',
									format : 'Ymd'
								}],
						flex : 2
					}, voucherPanel];
	Ext.StatusUtil.createViewport(buttonItems, queryItems, function() {
		Ext.StatusUtil.initPage(Ext.getCmp("admdiv"), Ext.getCmp("taskState"));
		Ext.getCmp('taskState').setValue("001");
	});
});

/*******************************************************************************
 * 切换状态
 * 
 * @return
 */
function selectState(combo, newValue, oldValue, eOpts) {
	var replaceIndex = function(target, src, dst) {
		var dataIndex = Ext.getCmp(target).dataIndex;
		Ext.getCmp(target).dataIndex = dataIndex.replace(src, dst);
	};
//	sss
	if ("001" == newValue) {   //已转账未发送
		Ext.StatusUtil.batchEnable("send,look,refresh");
		Ext.StatusUtil.batchDisable("writeoff,back");
	} else if ("002" == newValue) {    // 已发送未划款
		Ext.StatusUtil.batchEnable("look,refresh");
		Ext.StatusUtil.batchDisable("writeoff,back,send");
	} else if ("003" == newValue) {    //已请款未转账
		Ext.StatusUtil.batchEnable("writeoff,look,refresh");
		Ext.StatusUtil.batchDisable("back,send");
	} else if ("004" == newValue) {    //未处理
		Ext.StatusUtil.batchEnable("back,look,refresh");
		Ext.StatusUtil.batchDisable("writeoff,send");
	} else if ("005" == newValue) {    //已退回
		Ext.StatusUtil.batchEnable("look,refresh");
		Ext.StatusUtil.batchDisable("back,send,writeoff");
	} 
}

/*******************************************************************************
 * 刷新
 */
function refreshData() {
	voucherPanel.getStore().loadPage(1);
}

/*******************************************************************************
 * 查看支付凭证
 * 
 * @param {}
 *            grid
 * @param {}
 *            rowIndex
 * @param {}
 *            colIndex
 * @param {}
 *            node
 * @param {}
 *            e
 * @param {}
 *            record
 * @param {}
 *            rowEl
 */

function lookPayVoucher(grid, rowIndex, colIndex, node, e, record, rowEl) {
	var record = grid.getStore().getAt(rowIndex).data;
	voucherPanel = getGrid("getPayVoucherByClearId.do", header1, fileds1, false, true,"v_");
	voucherPanel.getStore().on('beforeload', function(thiz, options) {
		options.params = [];
		options.params["filedNames"] = JSON.stringify(fileds1);
		options.params["id"] = record.pay_clear_voucher_id;
	});
	voucherPanel.getStore().load({
				method : 'post',
				params : {
					start : 0,
					pageSize : 200,
					limit : 25
				}
			});
	Ext.widget('window', {
				id : 'voucherWindow',
				title : '支付凭证信息',
				width : 700,
				height : 400,
				layout : 'fit',
				resizable : false,
				modal : true,
				items : [voucherPanel]
			}).show();
}

/************************************************************************************
 * 签章发送
 */
function sendVoucher() {
	var me = this;
	var records = voucherPanel.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请选择待处理的数据！");
		return;
	}
	if (records != null) {
		var ids = []; // 凭证主键字符串
		var lastVers = []; // 凭证lastVer字符串
		Ext.Array.each(records, function(model) {
					ids.push(model.get("pay_voucher_id"));
					lastVers.push(model.get("last_ver"));
				});
		var params = {
			billTypeId : records[0].get("bill_type_id"),
			billIds : Ext.encode(ids),
			last_vers : Ext.encode(lastVers),
			isFlow : false
		};
		Ext.PageUtil.doRequestAjax(me, '/realware/signAndSendPayVoucher.do', params);
	}
}


function writeoffPayVoucher() {
	var me = this;
	var records = voucherPanel.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请选择待处理的数据！");
		return;
	}
	if (records != null) {
		// 凭证主键字符串
		var reqIds = [];
		var reqVers = [];
		for (var i = 0; i < records.length; i++) {
			reqIds.push(records[i].get("pay_voucher_id"));
			reqVers.push(records[i].get("last_ver"));
		}
		var bill_type_id = records[0].get("bill_type_id");
		var params = {
			// 单据类型id
			billTypeId : bill_type_id,
			last_vers : Ext.encode(reqVers),
			billIds : Ext.encode(reqIds)
		};
		Ext.PageUtil.doRequestAjax(me, '/realware/writeoffVoucher.do', params);
	}
}

function back() {
	var records = voucherPanel.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请选中一条凭证信息！");
		return;
	}
	var ids = [];
	var lastVers = [];
	Ext.Array.each(records, function(model) {
				ids.push(model.get('pay_voucher_id'));
				lastVers.push(model.get("last_ver"));
	});
	var bill_type_id = records[0].get("bill_type_id");	
	Ext.widget('window', {
		id : 'backWin',
		title : '退回财政原因',
		width : 380,
		height : 150,
		layout : 'fit',
		resizable : false,
		modal : true,
		items : [Ext.widget('form', {
					renderTo : Ext.getBody(),
					layout : {
						type : 'hbox',
						padding : '10'
					},
					resizable : false,
					modal : true,
					items : [{
								xtype : 'textareafield',
								height : 70,
								width : 345,
								id : 'textarea',
								value : '凭证年结处理'
							}],
					buttons : [{
						text : '确定',
						handler : function() {
							// 退票/退回原因
							var textarea = Ext.getCmp('textarea').getValue();
							if (textarea == ""){
								Ext.Msg.alert("系统提示", "退回财政原因不能为空！");
								return ;
							};
							if (textarea.length > 40) {
								Ext.Msg.alert("系统提示", "退回财政原因长度不能超过40个字！");
								return;
							};
							
							var myMask = new Ext.LoadMask('backWin', {
									msg : '后台正在处理中，请稍后....',
									removeMask : true   // 完成后移除
									});
							myMask.show();
							
							// 提交到服务器操作
							Ext.Ajax.request( {
							url : '/realware/returnVoucherNoWf.do',
							waitMsg : '后台正在处理中,请稍后....',
							method : 'POST',
							timeout : 180000, // 设置为3分钟
							params : {
									isYearSummary:'1',
									billTypeId : bill_type_id,
									returnRes : textarea,
									billIds : Ext.encode(ids),
									last_vers : Ext.encode(lastVers)
							},
							success : function(response, options) {
								Ext.Msg.alert("系统提示", "退回成功！");
								Ext.getCmp('backWin').close();
								refreshData();
							},
							failure : function(response, options) {
								Ext.Msg.alert("系统提示", "退回失败，原因：" + response.responseText);
								Ext.getCmp('backWin').close();
								refreshData();
							}
						});
							}
					}, {
						text : '取消',
						handler : function() {
							this.up('window').close();
						}
					}]
				})]
	}).show();
	
	
}


