/*******************************************************************************
 * 主要用于直接支付和授权支付退款申请录入
 * 
 * @type
 */

/***
 * 引入需要使用的js文件
 */
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/recommend.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/operationLog.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/ocxVoucher.js"></scr' + 'ipt>');	

var voucherPanel = null;

/**
 * 数据项
 */

var refReqFileds = ["refreq_voucher_code", "voucher_status_des", "vou_date", "pay_amount","pay_refund_amount","refund_type", "payee_account_no",
		"payee_account_name", "payee_account_bank","pay_account_no", "pay_account_name", "pay_account_bank",
		"pay_bank_code", "pay_bank_name", "fund_type_code", "fund_type_name", "pay_type_code", "pay_type_name",
		"refreq_voucher_id", "bill_type_id","task_id","last_ver","voucher_status_err"];


/**
 * 列名
 */
var refReqHeader = "凭证号|refreq_voucher_code|230,凭证状态|voucher_status_des|100,支付金额|pay_amount|120,收款人名称|payee_account_name|140,收款人账号|payee_account_no,"
		+ "收款人银行|payee_account_bank|140,付款人名称|pay_account_name|140,付款人账号|pay_account_no,付款人银行|pay_account_bank|140,"
		+ "代理银行编码|pay_bank_code,代理银行名称|pay_bank_name,凭证日期|vou_date|100,资金性质编码|fund_type_code,"
		+ "资金性质名称|fund_type_name,支付方式编码|pay_type_code,支付方式名称|pay_type_name,错误原因|voucher_status_err";

/*******************************************************************************
 * 状态
 */
var comboStore = Ext.create('Ext.data.Store', {
			fields : ['name', 'value'],
			data : [{
						"name" : "未发送",
						"value" : "0"
					}, {
						"name" : "已发送",
						"value" : "1"
					}, {
						"name" : "已作废",
						"value" : "2"
					}]
		});

/*******************************************************************************
 * 界面加载
 */
Ext.onReady(function() {
	Ext.QuickTips.init();
	if (voucherPanel == null) {
		voucherPanel = getGrid(loadUrl, refReqHeader, refReqFileds, true, true);
		voucherPanel.setHeight(document.documentElement.scrollHeight - 95);
		// 根据查询条件检索数据
		voucherPanel.getStore().on('beforeload', function(thiz, options) {
			var jsonMap = "[{\"vt_code\":[\"=\",\""+refReqVtcode + "\"]," +
						"\"pay_type_code\":[\"=\",\""+payTypeCode + "\"],";
			var sendFlag = Ext.getCmp('sendFlag').getValue();
			var code = Ext.getCmp('code').getValue();
			var codeEnd = Ext.getCmp('codeEnd').getValue();
			var vouDate = Ext.getCmp('vouDate').getValue();
			var admdiv = Ext.getCmp('admdiv').getValue();
			if (admdiv == null || admdiv == "")
				return;
			if ("" != sendFlag && null != sendFlag) {
				var jsonStr = [];
				jsonStr[0] = "=";
				jsonStr[1] = sendFlag  - 0;
				jsonMap = jsonMap + "\"send_flag\":" + Ext.encode(jsonStr)
						+ ",";
			}
			if(("" != code && null != code) && ("" != codeEnd && null != codeEnd)){
				var jsonStr = [];
				jsonStr[0] = ">=";
				jsonStr[1] = code;
				jsonMap = jsonMap + "\"refreq_voucher_code\":"+ Ext.encode(jsonStr) + ",";
				var jsonStr = [];
				jsonStr[0] = "<=";
				jsonStr[1] = codeEnd;
				jsonMap = jsonMap + "\"refreq_voucher_code\":" + Ext.encode(jsonStr) + ",";
			}
			else if ("" != code && null != code) {
				var jsonStr = [];
				jsonStr[0] = "LIKE";
				jsonStr[1] = code;
				jsonMap = jsonMap + "\"refreq_voucher_code\":"+ Ext.encode(jsonStr) + ",";
			}
			else if ("" != codeEnd && null != codeEnd) {
				var jsonStr = [];
				jsonStr[0] = "LIKE";
				jsonStr[1] = codeEnd;
				jsonMap = jsonMap + "\"refreq_voucher_code\":"+ Ext.encode(jsonStr) + ",";
			}
			if ("" != vouDate && null != vouDate) {
				var jsonStr = [];
				jsonStr[0] = "=";
				jsonStr[1] = Todate(vouDate);
				jsonMap = jsonMap + "\"vou_date\":" + Ext.encode(jsonStr) + ",";
			}
			var jsonStr = [];
			jsonStr[0] = "=";
			jsonStr[1] = admdiv;
			jsonMap = jsonMap + "\"admdiv_code\":" + Ext.encode(jsonStr) + ",";
			var data = jsonMap.substring(0, jsonMap.length - 1) + "}]";
			if (null == options.params || options.params == undefined) {
				options.params = [];
				options.params["jsonMap"] = data;
				options.params["filedNames"] =JSON.stringify(refReqFileds);
			} else {
				options.params["jsonMap"] = data;
				options.params["filedNames"] =JSON.stringify(refReqFileds);
			}
		});
	}
	Ext.create('Ext.Viewport', {
				id : 'reInputVoucherFrame',
				layout : 'fit',
				items : [Ext.create('Ext.panel.Panel', {
							tbar : [{
								id : 'buttongroup',
								xtype : 'buttongroup',
								items : [{
											id : 'edit',
											text : '录入',
											iconCls : 'edit',
											scale : 'small',
											handler : function() {
												refReqInput();
											}
										}, {
											id : 'signsend',
											text : '签章发送',
											iconCls : 'sign',
											scale : 'small',
											handler : function() {
												sendVoucher();
											}
										}, {
											id : 'invalid',
											text : '作废',
											iconCls : 'delete',
											scale : 'small',
											handler : function() {
												voucherInvalidate();
											}
										},{
											id : 'print',
											text : '打印',
											iconCls : 'print',
											scale : 'small',
											handler : function() {
												printVoucher(voucherPanel.getSelectionModel().getSelection(),"refreq_voucher_id",false);
											}
										},{
											id : 'look',
											text : '查看凭证',
											iconCls : 'look',
											scale : 'small',
											handler : function() {
												lookOCX(
														voucherPanel.getSelectionModel().getSelection(),"refreq_voucher_id");
											}
										},{
											id : 'log',
											text : '查看操作日志',
											iconCls : 'log',
											scale : 'small',
											handler : function() {
												taskLog(voucherPanel.getSelectionModel().getSelection(),"refreq_voucher_id");
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
													id : 'sendFlag',
													fieldLabel : '当前状态',
													xtype : 'combo',
													dataIndex : 'send_flag',
													displayField : 'name',
													emptyText : '请选择',
													valueField : 'value',
													labelWidth : 53,
													width:140,
													store : comboStore,
													editable : false,
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
													store : comboAdmdiv,
													editable : false,
													listeners : {
														'select' : selectAdmdiv
													}
												}, {
													id : 'code',
													fieldLabel : '凭证号',
													xtype : 'textfield',
													dataIndex : 'code',
													width: 140,
													labelWidth : 42
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
													dataIndex : 'vou_date',
													format : 'Y-m-d',
													width: 150,
													labelWidth : 53
												}],
										flex : 2
									}, voucherPanel]
						})]
			});
	if (comboAdmdiv.data.length > 0) {
		Ext.getCmp('admdiv').setValue(comboAdmdiv.data.getAt(0).get("admdiv_code"));
	}
	setBtnVisible(Ext.getCmp("admdiv").getValue(), Ext.getCmp("buttongroup"));
	Ext.getCmp('sendFlag').setValue("0");
	selectState();
});

/*******************************************************************************
 * 切换状态
 * 
 * @return
 */
function selectState() {
	var sendFlag = Ext.getCmp('sendFlag').getValue();
	if ("0" == sendFlag) {
		Ext.getCmp('edit').enable(false);
		Ext.getCmp('signsend').enable(false);
		Ext.getCmp('invalid').enable(false);
		Ext.getCmp('print').disable(false);
		Ext.getCmp('look').disable(false);
	} else if ("1" == sendFlag) {
		Ext.getCmp('edit').disable(false);
		Ext.getCmp('signsend').disable(false);
		Ext.getCmp('invalid').disable(false);
		Ext.getCmp('print').enable(false);
		Ext.getCmp('look').enable(false);
	} else if ("2" == sendFlag) {
		Ext.getCmp('edit').disable(false);
		Ext.getCmp('signsend').disable(false);
		Ext.getCmp('invalid').disable(false);
		Ext.getCmp('print').disable(false);
		Ext.getCmp('look').disable(false);
	} else {
		Ext.getCmp('edit').disable(false);
		Ext.getCmp('signsend').disable(false);
		Ext.getCmp('invalid').disable(false);
		Ext.getCmp('print').disable(false);
		Ext.getCmp('look').disable(false);
	}
	refreshData();
}

function selectAdmdiv() {
	setBtnVisible(Ext.getCmp("admdiv").getValue(), null);
	refreshData();
}


/*******************************************************************************
 * 退款录入
 */

/**
 * 数据项
 */

var fileds = ["pay_voucher_code", "vou_date", "pay_amount","pay_refund_amount","refund_type", "payee_account_no",
		"payee_account_name", "payee_account_bank", "payee_account_bank_no",
		"pay_account_no", "pay_account_name", "pay_account_bank",
		"pay_bank_code", "pay_bank_name", "clear_bank_code", "clear_bank_name",
		"checkNo", "fund_deal_mode_code", "fund_deal_mode_name",
		"fund_type_code", "fund_type_name", "pay_type_code", "pay_type_name",
		"set_mode_code", "set_mode_name", "pay_summary_code",
		"pay_summary_name", "task_id", "pay_voucher_id", "bill_type_id","last_ver"];

/**
 * 列名
 */
var header = "凭证号|pay_voucher_code|140,凭证日期|vou_date|100,支付金额|pay_amount|100,已退金额|pay_refund_amount|100,收款人账号|payee_account_no,"
		+ "收款人名称|payee_account_name|140,收款人银行|payee_account_bank|140,收款行行号|payee_account_bank_no,"
		+ "付款人账号|pay_account_no,付款人名称|pay_account_name|140,付款人银行|pay_account_bank|140,代理银行编码|pay_bank_code,"
		+ "代理银行名称|pay_bank_name,清算银行编码|clear_bank_code,清算银行名称|clear_bank_name,支票号|checkNo,办理方式编码|fund_deal_mode_code,"
		+ "办理方式名称|fund_deal_mode_name,资金性质编码|fund_type_code,资金性质名称|fund_type_name,支付方式编码|pay_type_code,"
		+ "支付方式名称|pay_type_name,结算方式编码|set_mode_code,结算方式名称|set_mode_name,用途编码|pay_summary_code,"
		+ "用途名称|pay_summary_name";


var filedsOriRequest = ["pay_request_code", "pay_amount", "pay_refund_amount","bgt_type_code",
		"bgt_type_name", "fund_type_code", "fund_type_name", "mof_dep_code",
		"mof_dep_name", "pay_kind_code", "pay_kind_name", "sup_dep_code",
		"sup_dep_name", "agency_code", "agency_name", "exp_func_code",
		"exp_func_name", "exp_func_code1", "exp_func_name1", "exp_func_code2",
		"exp_func_name2", "exp_func_code3", "exp_func_name3", "exp_eco_code",
		"exp_eco_name", "exp_eco_code1", "exp_eco_name1", "exp_eco_code2",
		"exp_eco_name2", "pro_cat_code", "pro_cat_name", "dep_pro_code",
		"dep_pro_name", "remark", "pay_request_id"];

var headerOriRequest = "支付明细编号|pay_request_code,支付金额|pay_amount,已退金额|pay_refund_amount,预算类型编码|bgt_type_code,预算类型名称|bgt_type_name,资金性质编码|fund_type_code,资金性质名称|fund_type_name,业务处室编码|mof_dep_code,业务处室名称|mof_dep_name,支出类型编码|pay_kind_code,支出类型名称|pay_kind_name,一级预算单位编码|sup_dep_code,"
		+ "一级预算单位名称|sup_dep_name,基层预算单位编码|agency_code,基层预算单位名称|agency_name,功能分类编码|exp_func_code,功能分类名称|exp_func_name,功能分类类编码|exp_func_code1,功能分类类名称|exp_func_name1,功能分类款编码|exp_func_code2,功能分类款名称|exp_func_name2,功能分类项编码|exp_func_code3,功能分类项名称|exp_func_name3,"
		+ "经济分类编码|exp_eco_code,经济分类名称|exp_eco_name,经济分类类编码|exp_eco_code1,经济分类类名称|exp_eco_name1,经济分类款编码|exp_eco_code2,经济分类款名称|exp_eco_name2,收支管理编码|pro_cat_code,收支管理名称|pro_cat_name,预算项目编码|dep_pro_code,预算项目名称|dep_pro_name,备注|remark";

var inputWin = null;

var gridOrivoucher = null;

var gridOriRequest = null;

var isOK = false;

/*******************************************************************************
 * 退款申请录入
 */
function refReqInput() {
	if (inputWin == null) {
		var parentH = document.documentElement.scrollHeight;
		var parentW = document.documentElement.scrollWidth;
		
		//录入界面高度
		var childH = parentH*0.96;
		//录入界面宽度
		var childW = parentW*0.94;
		
		// 定义凭证列表
		gridOrivoucher = getGrid("/realware/loadPayVoucher.do", header,fileds, false, true,'top_');
		// 定义明细列表
		gridOriRequest = getGrid("/realware/loadPayRequest.do",headerOriRequest, filedsOriRequest, false, true,'bottom_');
		
		gridOrivoucher.setHeight(childH * 0.30);
		gridOriRequest.setHeight(childH * 0.30);
		gridOrivoucher.setTitle("退款凭证");

		
		//凭证选中，刷新明细
		gridOrivoucher.on("itemclick",function(g, record, item, index, e, eOpts ){
					var vouRecords = g.getSelectionModel().getSelection();
					//选中的凭证
					var selectVou = vouRecords[0];
					//凭证支付金额
					var payAmt = selectVou.get("pay_amount");
					//凭证已退金额
					var refAmt = selectVou.get("pay_refund_amount");
					//退款录入金额
					Ext.getCmp('inputAmt').setValue(payAmt-refAmt);
					Ext.getCmp('refundReason').setValue("");
					//刷新明细
					refleshRequest(gridOriRequest,selectVou.get("pay_voucher_id"));
				});
		

		// 弹出窗口
		inputWin = Ext.create('Ext.window.Window', {
			id:'refundCheckWindow',
			title : '退款申请录入界面',
			x : parentW*0.03,
			y : parentH*0.02,
			width : childW,
			//height : childH,
			layout : 'fit',
			resizable : true, // 不可调整大小
			draggable : true, // 不可拖拽
			closeAction : 'hide',
			modal : true,
			items : [Ext.widget('form', {
				id:'form1',
				items : [{
							title : '查询条件',
							bodyPadding : 8,
							layout : 'column',
							fieldDefaults : {
								labelAlign : 'right',
								anchor : '100%'
							},
							defaults : {
								margins : '5 40 0 0'
							},
							//height : childH * 0.17,
							items : [{
										id : 'voucherNo',
										fieldLabel : '凭  证  号',
										labelWidth: childW*0.07,
										xtype : 'textfield',
										width : childW*0.26
									},{
										id : 'aAmount',
										fieldLabel : '&nbsp;金额范围',
										labelWidth: childW*0.08,
										xtype : 'numberfield',
										width : childW*0.21
									}, {
										id : 'eAmount',
										fieldLabel : '&nbsp;至',
										labelWidth: childW*0.03,
										xtype : 'numberfield',
										width : childW*0.16
									},{
										id : 'payAcctNo',
										fieldLabel : '&nbsp;零余额帐号',
										labelWidth: childW*0.09,
										xtype : 'textfield',
										width : childW*0.26
									},  {
										id : 'summaryName',
										fieldLabel : '资金用途',
										labelWidth: childW*0.07,
										xtype : 'textfield',
										width : childW*0.26
									},{
										id : 'startDate',
										fieldLabel : '&nbsp;起止时间',
										labelWidth: childW*0.08,
										xtype : 'datefield',
										format : 'Y-m-d',
										width : childW*0.21
									}, {
										id : 'endDate',
										fieldLabel : '&nbsp;至',
										labelWidth: childW*0.03,
										xtype : 'datefield',
										format : 'Y-m-d',
										width : childW*0.16
									},{
										id : 'payeeAcctNo',
										fieldLabel : '&nbsp;收款人帐号',
										labelWidth: childW*0.09,
										xtype : 'textfield',
										width : childW*0.26
									},{
										xtype : 'button',
										text : '&nbsp;查询&nbsp;',
										handler : function() {
											refleshQuery(gridOrivoucher);
											refleshRequest(gridOriRequest, 0);
										}
									}]
						}, gridOrivoucher, {
							xtype : 'panel',
							title : '退款明细',
							items : [gridOriRequest],
							bbar : {
								dock : 'bottom',
								//height : childH * 0.05,
								items : [ {
											id : 'inputAmt',
											xtype : 'textfield',
											fieldLabel : '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;退款金额',
											labelWidth: 80,
											width : 170
										}, {
											id : 'refundReason',
											xtype : 'textfield',
											fieldLabel : '&nbsp;&nbsp;退款原因',
											labelWidth: 60,
											width : 250
										}]
							}
						}],
				buttons : [
					{
					text : '确定',
					height : childH*0.04,
					handler : function() {
						//选中要退款的原支付凭证
						var records  = gridOrivoucher.getSelectionModel().getSelection();
						if(records.length==0){
							Ext.Msg.alert("系统提示", "请选中要按单退款的凭证！");
							return ;
						}
						//退款金额
						var refAmountStr = Ext.getCmp('inputAmt').getValue();
						//退款原因
						var refReasonStr = Ext.getCmp('refundReason').getValue();
						
						if(""==refAmountStr||null==refAmountStr){
							Ext.Msg.alert("系统提示", "退款金额不能为空！");
							return ;
						}
							
						if(""==refReasonStr||null==refReasonStr){
							Ext.Msg.alert("系统提示", "请输入退款原因！");
							return ;
						}
						var reqIds = [];
						var reqVers =[];
						Ext.Array.each(records,function(model){
//								reqIds = model.get("pay_voucher_id");
//								reqVers =model.get("last_ver");
								reqIds.push(model.get("pay_voucher_id"));
								reqVers.push(model.get("last_ver"));
						});
						var myMask = new Ext.LoadMask(Ext.getBody(), {
							msg : '后台正在处理中，请稍后....',
							removeMask : true // 完成后移除
						});
						myMask.show();
						Ext.Ajax.request({
							url : '/realware/bankSaveRefundRequest.do',
							method : 'POST',
							timeout : 180000, 
							params : {
								payType : payType,
								refAmount : refAmountStr,
								refReason : refReasonStr,
								billTypeId : records[0].get("bill_type_id"),
								billIds : Ext.encode(reqIds),
								last_vers: Ext.encode(reqVers)
							},
							success : function(response, options) {
								myMask.hide();
								isOK = true;
								Ext.Msg.alert("系统提示", "退款申请录入成功！");
								refreshData();
								refleshQuery(gridOrivoucher);
								Ext.getCmp("refundCheckWindow").close();
								isOK = false;
							},
							failure : function(response, options) {
								failAjax(response, myMask);
								refreshData();
							}
						});
					}
				}, {
					text : '取消',
					height : childH*0.04,
					handler : function() {
						this.up('form').getForm().reset();
						this.up('window').hide();
					}
				}]
			})]
		});
		
	}
	else{
		gridOrivoucher.getStore().load({
				params : {
					start : 0,
					pageSize : 0
				}
			});
		gridOriRequest.getStore().load({
				params : {
					start : 0,
					pageSize : 0
				}
			});
	}	
	inputWin.show();
}

/*******************************************************************************
 * 申请单签章发送财政
 */
function sendVoucher() {
	var records = voucherPanel.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请选中凭证信息！");
		return;
	}
	var reqIds = []; // 凭证主键字符串
	var reqVers = []; // 凭证lastVer字符串
	Ext.Array.each(records,function(model){
			reqIds.push(model.get("refreq_voucher_id"));
			reqVers.push(model.get("last_ver"));
	});
	var bill_type_id = records[0].get("bill_type_id");
	var myMask = new Ext.LoadMask(Ext.getBody(), {
			msg : '后台正在处理中，请稍后....',
			removeMask : true // 完成后移除
		});
	myMask.show();
	Ext.Ajax.request({
				url : signRefReqUrl,
				method : 'POST',
				timeout : 180000, // 设置为3分钟
				params : {
					billTypeId : bill_type_id,
					billIds : Ext.encode(reqIds),
					last_vers: Ext.encode(reqVers)
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
 * 作废退款申请
 */
function voucherInvalidate() {
		var records = voucherPanel.getSelectionModel().getSelection();
		if (records.length == 0) {
			Ext.Msg.alert("系统提示", "请选中凭证信息！");
			return;
		}
		var reqIds = []; // 凭证主键字符串
		var reqVers = []; // 凭证lastVer字符串
		Ext.Array.each(records,function(model){
				reqIds.push(model.get("refreq_voucher_id"));
				reqVers.push(model.get("last_ver"));
		});
		var bill_type_id = records[0].get("bill_type_id");
		var myMask = new Ext.LoadMask(Ext.getBody(), {
				msg : '后台正在处理中，请稍后....',
				removeMask : true // 完成后移除
			});
		myMask.show();
		Ext.Ajax.request({
				url : '/realware/invalidateRefundRequest.do',
				method : 'POST',
				timeout : 180000, // 设置为3分钟
				params : {
					billTypeId : bill_type_id,
					billIds : Ext.encode(reqIds),
					last_vers: Ext.encode(reqVers),
					payType : payType
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



/*******************************************************************************
 * 刷新
 * 
 * @return
 */
function refreshData() {
	voucherPanel.getStore().loadPage(1);
}

/*******************************************************************************
 * 退款查询
 */
function refleshQuery(g) {
	//请款退款金额和退款原因
	Ext.getCmp('inputAmt').setValue("");
	Ext.getCmp('refundReason').setValue("");
	var jsonMap = "[{\"clear_date\":[\"exists\",\"(select 1 from pb_pay_request r ,pb_pay_clear_voucher c "
                       				+ " where r.pay_voucher_id = objsrc_2742.pay_voucher_id"
                         			+ " and r.pay_amount > r.pay_refund_amount " 
                         			+ " and r.pay_clear_voucher_id = c.pay_clear_voucher_id "
                                    + " and c.clear_date is not null )"
                      				+ " and objsrc_2742.pay_amount>objsrc_2742.pay_refund_amount and objsrc_2742.pay_date is not null\"]," 
                      				+ "\"vt_code\":[\"=\",\""+vtCode + "\"]," 
                      				+ "\"account_type_right\":[\"=\"," + account_type_right + "]," 
                      				+ "\"admdiv_code\":[\"=\",\"" + Ext.getCmp('admdiv').getValue()+"\"],";
	var startDate = Ext.getCmp('startDate').getValue();
	var endDate = Ext.getCmp('endDate').getValue();
	var payeeAcctNo = Ext.getCmp('payeeAcctNo').getValue();
	var summaryName = Ext.getCmp('summaryName').getValue();
	var aAmount = Ext.getCmp('aAmount').getValue();
	var eAmount = Ext.getCmp('eAmount').getValue();
	var payAcctNo = Ext.getCmp('payAcctNo').getValue();
	var voucherNo = Ext.getCmp('voucherNo').getValue();
	if (("" == startDate || null == startDate)
			&& ("" == endDate || null == endDate)
			&& ("" == payeeAcctNo || null == payeeAcctNo)
			&& ("" == summaryName || null == summaryName)
			&& ("" == aAmount || null == aAmount)
			&& ("" == eAmount || null == eAmount)
			&& ("" == payAcctNo || null == payAcctNo)
			&& ("" == voucherNo || null == voucherNo)) {
		Ext.Msg.alert("系统提示", "至少输入一个有效的查询条件！");
		return;
	}
	if ("" != startDate && null != startDate) {
		var jsonStr = [];
		jsonStr[0] = ">=";
		jsonStr[1] = Todate(startDate);
		jsonMap = jsonMap + "\"vou_date\":"
				+ Ext.encode(jsonStr) + ",";
	}
	if ("" != endDate && null != endDate) {
		var jsonStr = [];
		jsonStr[0] = "<=";
		jsonStr[1] = Todate(endDate);
		jsonMap = jsonMap + "\"vou_date\":"
				+ Ext.encode(jsonStr) + ",";
	}
	if ("" != payeeAcctNo && null != payeeAcctNo) {
		var jsonStr = [];
		jsonStr[0] = "LIKE";
		jsonStr[1] = payeeAcctNo;
		jsonMap = jsonMap + "\"payee_account_no\":" + Ext.encode(jsonStr) + ",";
	}
	if ("" != summaryName && null != summaryName) {
		var jsonStr = [];
		jsonStr[0] = "LIKE";
		jsonStr[1] = summaryName;
		jsonMap = jsonMap + "\"pay_summary_name\":" + Ext.encode(jsonStr) + ",";
	}
	if ("" != aAmount && null != aAmount) {
		var jsonStr = [];
		jsonStr[0] = ">=";
		jsonStr[1] = aAmount;
		jsonMap = jsonMap + "\"pay_amount\":" + Ext.encode(jsonStr) + ",";
	}
	if ("" != eAmount && null != eAmount) {
		var jsonStr = [];
		jsonStr[0] = "<=";
		jsonStr[1] = eAmount;
		jsonMap = jsonMap + "\"pay_amount\":" + Ext.encode(jsonStr) + ",";
	}
	if ("" != payAcctNo && null != payAcctNo) {
		var jsonStr = [];
		jsonStr[0] = "LIKE";
		jsonStr[1] = payAcctNo;
		jsonMap = jsonMap + "\"pay_account_no\":" + Ext.encode(jsonStr) + ",";
	}
	if ("" != voucherNo && null != voucherNo) {
		var jsonStr = [];
		jsonStr[0] = "LIKE";
		jsonStr[1] = voucherNo;
		jsonMap = jsonMap + "\"pay_voucher_code\":" + Ext.encode(jsonStr) + ",";
	}
	var data = jsonMap.substring(0, jsonMap.length - 1) + "}]";
	g.getStore().load({
				method : 'post',
				params : {
					start : 0,
					pageSize : 200,
					filedNames : JSON.stringify(fileds),
					jsonMap : data,
					vtCode : vtCode
				}
			});

}

function refleshRequest(g, pay_voucher_id) {
	if(pay_voucher_id==0){
		return;
	}
	var pay = [];
	pay[0] = "=";
	pay[1] = pay_voucher_id;
	var data = "[{\"pay_voucher_id\":" + Ext.encode(pay) + "}]";
	g.getStore().load({
				method : 'post',
				params : {
					start : 0,
					pageSize : 200,
					filedNames : JSON.stringify(filedsOriRequest),
					jsonMap : data
				}
			});
}