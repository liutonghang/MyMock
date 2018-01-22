/*******************************************************************************
 * 主要用于直接支付和授权支付退款录入
 * 
 * @type
 */

/***
 * 引入需要使用的js文件
 */
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/recommend"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/operationLog.js"></scr' + 'ipt>');
	

var voucherPanel = null;

/**
 * 数据项
 */

var fields = ["pay_voucher_code", "vou_date", "pay_amount","refund_type", "payee_account_no",
		"payee_account_name", "payee_account_bank", "payee_account_bank_no",
		"pay_account_no", "pay_account_name", "pay_account_bank",
		"pay_bank_code", "pay_bank_name", "clear_bank_code", "clear_bank_name",
		"checkNo", "fund_deal_mode_code", "fund_deal_mode_name",
		"fund_type_code", "fund_type_name", "pay_type_code", "pay_type_name",
		"set_mode_code", "set_mode_name", "pay_summary_code",
		"pay_summary_name", "task_id", "pay_voucher_id", "bill_type_id"];

/**
 * 列名
 */
var header = "凭证号|pay_voucher_code|140,凭证日期|vou_date|100,支付金额|pay_amount|100,收款人账号|payee_account_no,"
		+ "收款人名称|payee_account_name|140,收款人银行|payee_account_bank|140,收款行行号|payee_account_bank_no,"
		+ "付款人账号|pay_account_no,付款人名称|pay_account_name|140,付款人银行|pay_account_bank|140,代理银行编码|pay_bank_code,"
		+ "代理银行名称|pay_bank_name,清算银行编码|clear_bank_code,清算银行名称|clear_bank_name,支票号|checkNo,办理方式编码|fund_deal_mode_code,"
		+ "办理方式名称|fund_deal_mode_name,资金性质编码|fund_type_code,资金性质名称|fund_type_name,支付方式编码|pay_type_code,"
		+ "支付方式名称|pay_type_name,结算方式编码|set_mode_code,结算方式名称|set_mode_name,用途编码|pay_summary_code,"
		+ "用途名称|pay_summary_name";

/**
 * 交易记录字段
 */
var fields1 = ["account_no","account_bank","admdiv_code","acct_balance","trans_date","remark","record_id"];
/**
 * 列名
 */
var hearder1 = "零余额账号|account_no|140,零余额账户开户行|account_bank|140,账户余额|acct_balance,交易日期|trans_date,备注|remark";

//列表
var gridPanel = null;

/*******************************************************************************
 * 状态
 */
var comboStore = Ext.create('Ext.data.Store', {
			fields : ['name', 'value'],
			data : [
			        {
			        	"name" : "待录入",
						"value" : "008"
			        },
			        {
						"name" : "待经办",
						"value" : "001"
					}, {
						"name" : "已经办",
						"value" : "002"
					}, {
						"name" : "已作废",
						"value" : "007"
					}]
		});

/*******************************************************************************
 * 界面加载
 */
Ext.onReady(function() {
	Ext.QuickTips.init(); 
	//引用工具类
	Ext.Loader.setPath('Ext', 'js/util');
	Ext.require(['Ext.PageUtil']);
  	if(gridPanel==null){
  		gridPanel = getGrid(loadRecordUrl,hearder1,fields1,true,true);
  		gridPanel.setHeight(document.documentElement.scrollHeight - 95);
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
										voucherInput();
									}
								}, {
									id : 'audit',
									text : '退款经办',
									iconCls : 'audit',
									scale : 'small',
									handler : function() {
										voucherAudit();
									}
								}, {
									id : 'unaudit',
									text : '经办撤销',
									iconCls : 'unaudit',
									scale : 'small',
									handler : function() {
										voucherUnAudit();
									}
								}, {
									id : 'invalid',
									text : '作废',
									iconCls : 'delete',
									scale : 'small',
									handler : function() {
										voucherInvalidate();
									}
								}, {
									id : 'log',
									text : '查看操作日志',
									iconCls : 'log',
									scale : 'small',
									handler : function() {
										taskLog(voucherPanel.getSelectionModel().getSelection(),"pay_voucher_id");
									}
								}, {
									id:'refresh',
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
								bodyPadding : 8,
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
											labelWidth : 40
										}, {
											id : 'codeEnd',
											fieldLabel : '至',
											xtype : 'textfield',
											labelWidth : 10,
											dataIndex : 'code'
										}, {
											id : 'vouDate',
											fieldLabel : '凭证日期',
											xtype : 'datefield',
											dataIndex : 'vou_date',
											format : 'Y-m-d',
											labelWidth : 53,
											width:160
										}, {
											id : 'checkNo1',
											fieldLabel : '支票号',
											xtype : 'textfield',
											dataIndex : 'checkNo1',
											labelWidth : 40,
											width:140
										}],
								flex : 2
							}, voucherPanel]
				})]
	});
	if (comboAdmdiv.data.length > 0) {
		Ext.getCmp('admdiv').setValue(comboAdmdiv.data.getAt(0).get("admdiv_code"));
	}
	if (account_type_right == "11") {
		Ext.getCmp("checkNo1").setVisible(false);
	}
	setBtnVisible(Ext.getCmp("admdiv").getValue(), Ext.getCmp("buttongroup"));
	Ext.getCmp('taskState').setValue("001");
	selectState();
});

/*******************************************************************************
 * 切换状态
 * 
 * @return
 */
function selectState() {
	var taskState = Ext.getCmp('taskState').getValue();
	var store = null;
	var column = null;
	if ("001" == taskState) {
		store = getStore(loadUrl, fields1);
		column = getColModel(header, fileds);
		Ext.getCmp('edit').disable(false);
		Ext.getCmp('audit').disable(false);
		Ext.getCmp('invalid').disable(false);
		Ext.getCmp('unaudit').enable(false);
	} else if ("002" == taskState) {
		store = getStore(loadUrl, fields1);
		column = getColModel(header, fileds);
		Ext.getCmp('edit').disable(false);
		Ext.getCmp('audit').disable(false);
		Ext.getCmp('invalid').disable(false);
		Ext.getCmp('unaudit').disable(false);
	} else {
		store = getStore(loadUrl, fields1);
		column = getColModel(header, fileds);
		Ext.getCmp('edit').disable(false);
		Ext.getCmp('audit').disable(false);
		Ext.getCmp('invalid').disable(false);
		Ext.getCmp('unaudit').disable(false);
	}
	//重新绑定grid
	gridPanel.reconfigure(store, column);
	//重新绑定分页工具栏
	gridPanel.getDockedItems()[1].bind(store);
	//刷新
	gridPanel.getView().refresh(true);
	refreshData();
}

function selectAdmdiv() {
	setBtnVisible(Ext.getCmp("admdiv").getValue(), null);
	refreshData();
}


/*******************************************************************************
 * 退款录入
 */

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

/*******************************************************************************
 * 录入
 */
function voucherInput() {
	if (inputWin == null) {
		// 定义凭证列表
		gridOrivoucher = getGrid("/realware/loadPayVoucher.do", header,fileds, false, true);
		// 定义明细列表
		gridOriRequest = getGrid("/realware/loadPayRequest.do",headerOriRequest, filedsOriRequest, false, true);
		gridOrivoucher.setHeight(150);
		gridOriRequest.setHeight(150);
		gridOrivoucher.setTitle("退款凭证");
		
		//凭证选中，刷新明细
		gridOrivoucher.on("cellclick", function(g, rowIndex, columnIndex, e) {
					var vouRecords = g.getSelectionModel().getSelection();
					//选中的凭证
					var selectVou = vouRecords[0];
					//凭证的退款类型
					var refundType = selectVou.get("refund_type");
					//该凭证没有按明细退过款
					if(refundType!=1){
						//设置退款金额录入框的值为凭证支付金额
						Ext.getCmp("isBill").setValue(true);
						Ext.getCmp('oriAmt').setValue(selectVou.get("pay_amount"));
					}else{  //该凭证按明细退过款
						Ext.getCmp('oriAmt').setValue("");
						Ext.getCmp("isBill").setValue(false);
					}
					Ext.getCmp('refundReason').setValue("");
					//刷新明细
					refleshRequest(gridOriRequest,selectVou.get("pay_voucher_id"));
				});
		
		//明细选中，给退款金额录入框赋值
		gridOriRequest.on("cellclick", function(g, rowIndex, columnIndex, e) {
					var reqRecords = g.getSelectionModel().getSelection();
					//选中的明细
					var selectReq = reqRecords[0];
					//设置退款金额录入框的值为支付明细的支付金额-已退金额
					var payAmt = selectReq.get("pay_amount");
					var refAmt = selectReq.get("pay_refund_amount");
					Ext.getCmp('oriAmt').setValue(payAmt-refAmt);
				});

		// 弹出窗口
		inputWin = Ext.create('Ext.window.Window', {
			id:'refundCheckWindow',
			title : '支付凭证退款录入',
			x : 100,
			y : 10,
			width : 900,
			height : 501,
			layout : 'fit',
			resizable : false,
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
							items : [{
										id : 'startDate',
										fieldLabel : '起止时间',
										labelWidth: 60,
										xtype : 'datefield',
										format : 'Y-m-d',
										width : 180
									}, {
										id : 'endDate',
										fieldLabel : '&nbsp;&nbsp;至',
										labelWidth: 20,
										xtype : 'datefield',
										format : 'Y-m-d',
										width : 140
									}, {
										id : 'payeeAcctNo',
										fieldLabel : '&nbsp;&nbsp;&nbsp;&nbsp;收款人帐号',
										labelWidth: 80,
										xtype : 'textfield',
										width : 240
									}, {
										id : 'summaryName',
										fieldLabel : '&nbsp;&nbsp;&nbsp;&nbsp;资金用途',
										labelWidth: 70,
										xtype : 'textfield',
										width : 230
									}, {
										id : 'aAmount',
										fieldLabel : '金额范围',
										labelWidth: 60,
										xtype : 'numberfield',
										width : 180
									}, {
										id : 'eAmount',
										fieldLabel : '&nbsp;&nbsp;至',
										labelWidth: 20,
										xtype : 'numberfield',
										width : 140
									}, {
										id : 'payAcctNo',
										fieldLabel : '&nbsp;&nbsp;&nbsp;&nbsp;付款人帐号',
										labelWidth: 80,
										xtype : 'textfield',
										width : 240
									}, {
										id : 'voucherNo',
										fieldLabel : '&nbsp;&nbsp;&nbsp;&nbsp;凭  证  号',
										labelWidth: 70,
										xtype : 'textfield',
										width : 230
									}, {
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
								items : [ {
											id : 'isBill',
											xtype : 'checkbox',
											fieldLabel : '&nbsp;&nbsp;是否按单退款',
											labelWidth : 90,
											checked : true,
											listeners : {
												'change' : function() {
														if (Ext.getCmp("isBill").checked) {  //选中按单退款
														//判断当前选中的凭证是否已按明细退过款
														var vouRecords = gridOrivoucher.getSelectionModel().getSelection();
														if(vouRecords.length==0){
															//Ext.Msg.alert("系统提示", "请选中要按单退款的凭证！");
															Ext.getCmp("oriAmt").disable(true);
															return ;
														}
														//退款类型 2按单退款  1按明细退款
														var refundType = vouRecords[0].get("refund_type");
														//退过弹出提示，按单退设置为非选 
														if(refundType==1){
															Ext.Msg.alert("系统提示", "该凭证已按明细退过款，无法按单退款！");
															Ext.getCmp("isBill").setValue(false);
															return false;
														}
														//将退款金额框设为不可读
														Ext.getCmp("oriAmt").disable(true);
													}else{  //选择按明细退款，将金额框设为可更改
														Ext.getCmp("oriAmt").enable(false);
													}
												}
											}
										},{
											id : 'oriAmt',
											xtype: 'numberfield',
											allowNegative: false,  //不能为负数  
          									decimalPrecision: 2,   //小数精确位数
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
				buttons : [{
					text : '确定',
					handler : function() {
						var  from1 =  this.up('form');
						//是否按单退款
						var isBillRef = Ext.getCmp('isBill').value == true ? 1 : 0;
						//退款原因
						var refReasonStr = Ext.getCmp('refundReason').getValue();
						//退款金额
						var refAmountStr = Ext.getCmp('oriAmt').getValue();
						
						//支付凭证id或支付明细id
						var payId = null;
						var records = null;
						if (isBillRef == 1) {  //按单退款
							records = gridOrivoucher.getSelectionModel().getSelection();
							if(records.length==0){
								Ext.Msg.alert("系统提示", "请选中要按单退款的凭证！");
								return ;
							}
							//支付凭证id
							payId = records[0].get("pay_voucher_id");

						} else {  //按明细退款
							records = gridOriRequest.getSelectionModel().getSelection();
							if (records.length == 0) {
								Ext.Msg.alert("系统提示", "请选中要按明细退款的明细数据！");
								return;
							} 
							//支付明细id
							payId = records[0].get("pay_request_id");
						}
						var myMask = new Ext.LoadMask(Ext.getBody(), {
							msg : '后台正在处理中，请稍后....',
							removeMask : true // 完成后移除
						});
						myMask.show();
						//请求后台服务
						Ext.Ajax.request({
							url : '/realware/bankSaveRefundVoucher.do',
							method : 'POST',
							timeout : 180000, 
							params : {
								payId : payId,
								isBillRef : isBillRef,
								refReason : refReasonStr,
								refAmount : refAmountStr,
								payType : payType,
								menu_id :  Ext.PageUtil.getMenuId()
							},
							success : function(response, options) {
								response.responseText="支付退款生成成功";
								succAjax(response, myMask);
								Ext.getCmp("form1").getForm().reset();
								Ext.getCmp('refundCheckWindow').hide();
								refreshData();
							},
							failure : function(response, options) {
								failAjax(response, myMask);
								refreshData();
							}
						});
					}
				}, {
					text : '取消',
					handler : function() {
						this.up('form').getForm().reset();
						this.up('window').hide();				
					}
				}]
			})]
		});
		
	}else{
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
	//将退款金额框设为不可读
	inputWin.on("show", function() {
		//refleshQuery(gridOrivoucher);
		Ext.getCmp("oriAmt").disable(true);
	});		
	inputWin.show();
}

/*******************************************************************************
 * 送审
 */
function voucherAudit() {
	var records = voucherPanel.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请选中凭证信息！");
		return;
	} else {
		var reqIds = []; // 凭证主键字符串
		var reqVers = []; // 凭证lastVer字符串
		Ext.Array.each(records, function(model) {
				reqIds.push(model.get("pay_voucher_id"));
				reqVers.push(model.get("last_ver"));
			});
		var myMask = new Ext.LoadMask(Ext.getBody(), {
						msg : '后台正在处理中，请稍后....',
						removeMask : true // 完成后移除
		});
		myMask.show();
		Ext.Ajax.request({
					url : '/realware/checkVoucher.do',
					method : 'POST',
					timeout : 180000, // 设置为3分钟
					params : {
						is_onlyreq : 0,
						billTypeId : records[0].get("bill_type_id"),
						billIds : Ext.encode(reqIds),
						last_vers : Ext.encode(reqVers),
						isCheck : false,
						menu_id :  Ext.PageUtil.getMenuId()
					},
					success : function(response, options) {
						response.responseText="送审成功";
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
 * 撤销送审
 */
function voucherUnAudit() {
	var records = voucherPanel.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请选中凭证信息！");
		return;
	} 
	var reqIds = []; // 凭证主键字符串
	var reqVers = []; // 凭证lastVer字符串
	Ext.Array.each(records, function(model) {
		reqIds.push(model.get('pay_voucher_id'));
		reqVers.push(model.get('last_ver'));
	});
	var params = {
		billTypeId : records[0].get('bill_type_id'),
		billIds : Ext.encode(reqIds),
		last_vers : Ext.encode(reqVers),
		menu_id :  Ext.PageUtil.getMenuId()
	};
	var myMask = new Ext.LoadMask(Ext.getBody(), {
			msg : '后台正在处理中，请稍后....',
			removeMask : true // 完成后移除
	});
	myMask.show();
	Ext.Ajax.request({
			url : '/realware/unAuditPayVoucher.do',
			method : 'POST',
			timeout : 180000, // 设置为3分钟
			params : params,
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
 * 作废
 */
function voucherInvalidate() {
	var records = voucherPanel.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请选中凭证信息！");
		return;
	}
	var reqIds = []; // 凭证主键字符串
	var reqVers = []; // 凭证lastVer字符串
	Ext.Array.each(records, function(model) {
		reqIds.push(model.get('pay_voucher_id'));
		reqVers.push(model.get('last_ver'));
	});
	var params = {
		billTypeId : records[0].get('bill_type_id'),
		billIds : Ext.encode(reqIds),
		last_vers : Ext.encode(reqVers),
		menu_id :  Ext.PageUtil.getMenuId()
	};
	var myMask = new Ext.LoadMask(Ext.getBody(), {
			msg : '后台正在处理中，请稍后....',
			removeMask : true // 完成后移除
	});
	myMask.show();
	Ext.Ajax.request({
			url : '/realware/invalidateRefundVoucher.do',
			method : 'POST',
			timeout : 180000, // 设置为3分钟
			params : params,
			//提交成功的回调函数
			success : function(response, options) {
				succMethod(response, options,myMask);
				refreshData();				
			},
			// 提交失败的回调函数
			failure : function(response, options) {
				failMethod(response, options,myMask);
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
	var fileds = null;
	var jsonMap = "[{";
	var taskState = Ext.getCmp('taskState').getValue();			
	var admdiv = Ext.getCmp('admdiv').getValue();
	if (admdiv == null || admdiv == "")
		return;
	if ('008' == taskState ) {
		fields = fields1;
	}
	else{
		fields = fields;
	}
	var jsonStr = [];
	jsonStr[0] = "=";
	jsonStr[1] = admdiv;
	jsonMap = jsonMap + "\"admdiv_code\":" + Ext.encode(jsonStr) + ",";
	var data = jsonMap.substring(0, jsonMap.length - 1) + "}]";
	
	//alert(fields);
	gridPanel.getStore().load({
				method : 'post',
				params : {
					start : 0,
					pageSize : 200,
					filedNames : JSON.stringify(fileds),
					jsonMap : data
				}
			});
}

/*******************************************************************************
 * 退款查询
 */
function refleshQuery(g) {
	//请款退款金额和退款原因
	Ext.getCmp('oriAmt').setValue("");
	Ext.getCmp('refundReason').setValue("");
	var jsonMap = "[{\"clear_date\":[\"exists\",\"(select 1 from pb_pay_request r where r.pay_voucher_id=objsrc_2742.pay_voucher_id and r.pay_amount>nvl(r.pay_refund_amount,0)) and objsrc_2742.pay_date is not null\"],\"vt_code\":[\"=\",\""
			+ vtCode + "\"],";
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
					jsonMap : data
				}
			});

}

function refleshRequest(g, pay_voucher_id) {
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