/*******************************************************************************
 * 主要用于支付凭证复核转账
 * 
 * @type
 */
var gridPanel1 = null;

/***
 * 引入需要使用的js文件
 */
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/recommend.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/operationLog.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/ocxVoucher.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/backVoucher.js"></scr'+ 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/createReport.js"></scr' + 'ipt>');
	

/**
 * 数据项
 */

var fileds = [ "pay_voucher_code", "vou_date", "pay_amount",
		"payee_account_no", "payee_account_name", "payee_account_bank",
		"payee_account_bank_no", "pay_account_no", "pay_account_name",
		"pay_account_bank", "pay_date", "pay_bank_code", "pay_bank_name",
		"clear_bank_code", "clear_bank_name", "checkNo", "fund_deal_mode_code",
		"fund_deal_mode_name", "fund_type_code", "fund_type_name",
		"pay_type_code", "pay_type_name", "set_mode_code", "set_mode_name",
		"pay_summary_code", "pay_summary_name", "task_id", "pay_voucher_id",
		"bill_type_id", "last_ver", "admdiv_code", "agency_code",
		"agency_name", "exp_func_code", "exp_func_name", "pay_mgr_code","exp_eco_code","exp_eco_name",
		"pay_mgr_name","business_type" ];

/**
 * 列名
 */
var header = "凭证号|pay_voucher_code|140,凭证日期|vou_date|100,支付金额|pay_amount|100,"
		+ "付款人账号|pay_account_no,付款人名称|pay_account_name|140,付款人银行|pay_account_bank|140,"
		+ "收款人账号|payee_account_no,收款人名称|payee_account_name|140,收款人银行|payee_account_bank|140,收款行行号|payee_account_bank_no,"
		+ "支付日期|pay_date,代理银行编码|pay_bank_code,代理银行名称|pay_bank_name,清算银行编码|clear_bank_code,清算银行名称|clear_bank_name,支票号|checkNo,办理方式编码|fund_deal_mode_code,"
		+ "办理方式名称|fund_deal_mode_name,资金性质编码|fund_type_code,资金性质名称|fund_type_name,支付方式编码|pay_type_code,"
		+ "支付方式名称|pay_type_name,结算方式编码|set_mode_code,结算方式名称|set_mode_name,支付类型编码|pay_mgr_code,支付类型名称|pay_mgr_name,预算单位编码|agency_code,预算单位名称|agency_code,"
		+ "功能分类编码|exp_func_code,功能分类名称|exp_func_code,经济分类编码|exp_eco_code,经济分类名称|exp_eco_name,用途编码|pay_summary_code,用途名称|pay_summary_name";

//现金标识
var cashMark = null;
//现金支付不需主管授权的最大金额
var limitOfAmount = null;

/*******************************************************************************
 * 状态
 */
var comboStore = Ext.create('Ext.data.Store', {
				fields : ['name', 'value'],
				data : [{
							"name" : "已支取",
							"value" : "008"
						},  {
							"name" : "已退回",
							"value" : "007"
						}]
			});
var vouchType = Ext.create('Ext.data.Store', {
				fields : ['name', 'value'],
				data : [{
							"name" : "18001",
							"value" : "18001"
						},  {
							"name" : "00000",
							"value" : "00000"
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
			var admdiv = Ext.getCmp('admdiv').getValue();
			if (admdiv == null || admdiv == "")
				 return;
			beforeload(Ext.getCmp("checkCashFirstQuery"), options, Ext.encode(fileds));
			//特殊业务 1)结算方式:现金 支付类型:正常支付或限额支付
			//       2)结算方式:不等于现金 且 支付类型=正常支付  收款人为空
			//       3)结算方式:不等于现金 且 支付类型=限额支票
			options.params['loadCash']="1";
			options.params['vtCode']=vtCode;
			/**options.params['jsonMap'] = options.params['jsonMap'].substring(0, options.params['jsonMap'].length - 2) + ",\"task_state\":[\"=\",\"000\"]"
			+ ",\"business_type\":[\"=\",1]}]"; **/
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
											id : 'pay',
											text : '支取确认',
											iconCls : 'pay',
											scale : 'small',
											handler : function() {
												cashTransferPayVoucher();
											}
										}, {
											id : 'print',
											text : '打印记账凭证',
											iconCls : 'pay',
											scale : 'small',
											handler : function() {
												var records = gridPanel1.getSelectionModel().getSelection();
												if (records.length != 1) {
													Ext.Msg.alert("系统提示", "请选中一条凭证信息！");
													return;
												}
												var data="[{\"pay_voucher_code\":[\""+records[0].get("pay_voucher_code")+"\"]}]";
												GridPrintDialog('undefined','undefined',loadGrfURL
													,loadDataURL,"guimian",data,100);
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
								title : "查询区",
								items : gridPanel1,
								tbar : {
									id : 'checkCashFirstQuery',
									xtype : 'toolbar',
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
											displayField : 'name',
											emptyText : '请选择',
											valueField : 'value',
											store : comboStore,
											value : '008',
											editable : false,
											labelWidth : 53,
											width: 140,
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
												'select' : refreshData
											}
										}, {
											id : 'code',
											fieldLabel : '凭证号',
											xtype : 'textfield',
											symbol : '>=',
											labelWidth : 45,
											width : 140,
											dataIndex : 'pay_voucher_code'
										}, {
											id : 'codeEnd',
											fieldLabel : '至',
											xtype : 'textfield',
											labelWidth : 15,
											width : 120,
											symbol : '<=',
											dataIndex : 'pay_voucher_code'
										}, {
											id : 'vouDate',
											fieldLabel : '凭证日期',
											xtype : 'datefield',
											labelWidth : 60,
											width : 160,
											dataIndex : 'vou_date',
											format : 'Y-m-d'
										}, {
											id : 'checkNo1',
											fieldLabel : '支票号',
											xtype : 'textfield',
											dataIndex : 'checkNo',
											labelWidth : 45,
											width : 140
											}]
								}
							}]
						})]
	});
	if (account_type_right == "11") {
		Ext.getCmp("checkNo1").setVisible(false);
	}
	setBtnVisible(Ext.getCmp("admdiv").getValue(), Ext.getCmp("buttongroup"));
	selectState();
	Ext.Ajax.request({
			url : "/realware/queryLimitOfAmount.do",
			method : 'POST',
			params : {
				admDivCode : Ext.getCmp("admdiv").getValue()
			},
			// 提交成功的回调函数
			success : function(response) {
				limitOfAmount = response.responseText;
			}
		});
});


/***
 * 切换状态
 */
function selectState() {
	var taskState = Ext.getCmp('taskState').getValue();
	if ("008" == taskState) {
		Ext.getCmp('pay').enable(false);
		Ext.getCmp('print').enable(false);
	}else {
		Ext.getCmp('pay').disable(false);
		Ext.getCmp('print').disable(false);
	}
	refreshData();
}



/***
 * 现金支付
 * @return {TypeName} 
 */
var cashWin = null;

var objDTO = null;

/***
 * 指令类别
 * @return {TypeName} 
 */
var comboLeibei = Ext.create('Ext.data.Store', {
	fields : [ 'name', 'value' ],
	data : [ {
		"name" : "现金",
		"value" : "1"
	}, {
		"name" : "现金限额",
		"value" : "2"
	}, {
		"name" : "(收款人为空)转账",
		"value" : "3"
	}, {
		"name" : "(限额)转账",
		"value" : "4"
	} ]
});



/***
 * 实际支付情况panel
 * @return {TypeName} 
 */
var centerPanel = Ext.create('Ext.panel.Panel', {
	width : 250,
	region : 'center',
	title : "实际支付情况",
	bodyPadding : 5,
	items : [{
		border : 0,
		xtype : 'form',
		defaultType : 'textfield',
		items : [ {
			id : 'payeeAcctname',
			fieldLabel : '&nbsp;收款人全称',
			name : 'payeeAcctname',
			labelWidth : 70,
			width : 230
		}, {
			id : 'payeeAcctno',
			fieldLabel : '&nbsp;收款人账号',
			name : 'payeeAcctno',
			labelWidth : 70,
			width : 230
		}, {
			id : 'payeeBankname',
			fieldLabel : '&nbsp;收款人银行',
			name : 'payeeBankname',
			labelWidth : 70,
			width : 230
		}, {
			id : 'payeeBankno',
			fieldLabel : '&nbsp;联行行号',
			name : 'payeeBankno',
			labelWidth : 70,
			width : 230
		}, {
			id : 'Amt',
			fieldLabel : '&nbsp;金额',
			name : 'Amt',
			labelWidth : 70,
			width : 230,
			data_type : 'number',
			xtype: 'numberfield',
			allowNegative: false,    //不能为负数  
          	decimalPrecision: 2    //小数精确位数
		} ]
	} ]
});

/***
 * 原支支票信息panel
 * @return {TypeName} 
 */
var westPanel = Ext.create('Ext.panel.Panel', {
	width : 250,
	region : 'west',
	title : "原支票信息",
	bodyPadding : 5,
	items : [ {
		xtype : 'form',
		border : 0,
		items : [ {
//			id : 'agencyAcct',
//			fieldLabel : '&nbsp;单位账户',
//			name : 'agencyAcct',
//			labelWidth : 70,
//			width : 230,
//			xtype : 'textfield',
//			readOnly :true
//		}, {
			id : 'agency',
			fieldLabel : '&nbsp;预算单位',
			name : 'agency',
			labelWidth : 70,
			width : 230,
			xtype : 'textfield',
			readOnly :true
		}, {
			id : 'exp_func',
			fieldLabel : '&nbsp;功能分类',
			name : 'exp_func',
			labelWidth : 70,
			width : 230,
			xtype : 'textfield',
			readOnly :true
		}, {
			id : 'exp_eco',
			fieldLabel : '&nbsp;经济分类',
			name : 'exp_eco',
			labelWidth : 70,
			width : 230,
			xtype : 'textfield',
			readOnly :true
		}, {
			id : 'payeeaname',
			fieldLabel : '&nbsp;收款人全称',
			name : 'payeeaname',
			labelWidth : 70,
			width : 230,
			xtype : 'textfield',
			readOnly :true
		}, {
			id : 'payeeano',
			fieldLabel : '&nbsp;收款人账号',
			name : 'payeeano',
			labelWidth : 70,
			width : 230,
			xtype : 'textfield',
			readOnly :true
		}, {
			id : 'payeebname',
			fieldLabel : '&nbsp;收款人银行',
			name : 'payeebname',
			labelWidth : 70,
			width : 230,
			xtype : 'textfield',
			readOnly :true
		}, {
			id : 'amt1',
			fieldLabel : '&nbsp;金额',
			name : 'amt1',
			labelWidth : 70,
			width : 230,
			readOnly :true,
			xtype: 'numberfield',
			allowNegative: false,    //不能为负数  
          	decimalPrecision: 2  //小数精确位数
		} , {
			id : 'vouchType',
			fieldLabel : '凭证类型',
			xtype : 'combo',
			dataIndex : 'task_status',
			displayField : 'name',
			emptyText : '请选择',
			valueField : 'value',
			store : vouchType,
			value : '18001',
			editable : false,
			labelWidth : 70,
			width : 230
		}, {
			id : 'vochbatchno',
			fieldLabel : '&nbsp;凭证批次',
			name : 'vochbatchno',
			labelWidth : 70,
			width : 230,
			xtype: 'textfield',
			minLength : 2,
			maxLength : 2
		}, {
			id : 'vochseqno',
			fieldLabel : '&nbsp;凭证号',
			name : 'vochseqno',
			labelWidth : 70,
			width : 230,
			xtype: 'textfield',
			maxLength : 20
		}]
	} ]
});




/***
 * 查询条件panel
 * @return {TypeName} 
 */
var northPanel = Ext.create(
				'Ext.panel.Panel',{
					region : 'north',
					height : 100,
					bodyPadding : 5,
					items : [{
								id : 'billNo',
								fieldLabel : '&nbsp;凭证号',
								xtype : 'textfield',
								labelWidth : 70,
								width : 250
							},{
								layout : 'hbox',
								defaults : {
									margins : '5 5 0 0'
								},
								border : 0,
								items : [{
											id : 'oriPayAmt',
											fieldLabel : '&nbsp;原支票金额',
											labelWidth : 70,
											width : 250,
											xtype: 'numberfield',
											allowNegative: false,  //不能为负数  
          									decimalPrecision: 2    //小数精确位数
										},{
											text : '查询',
											xtype : 'button',
											handler : function() {
												var billNo = Ext.getCmp("billNo").getValue();
												var oriPayAmt = Ext.getCmp("oriPayAmt").getValue();
												if (billNo == "" || oriPayAmt==null ||  oriPayAmt == "") {
													Ext.Msg.alert("系统提示","必须输入凭证号和金额才能进行查询操作！");
													return;
												}
												Ext.Ajax.request( {
															url : loadUrl,
															method : 'POST',
															timeout : 180000, // 设置为3分钟
															params : {
																filedNames : JSON.stringify(fileds),
																jsonMap : "[{\"pay_voucher_code\":[\"=\",\""+ billNo + "\"],\"pay_amount\":[\"=\"," + oriPayAmt + ",\"number\"],\"task_id\":[\"=\",0]}]",
																start : 0,
																page : 1,
																limit : 1
															},
															success : function(response,options) {
																var dto = new Function("return "+ response.responseText)();
																if (dto.pageCount==0) {
																	Ext.Msg.alert("系统提示","根据凭证号和金额没有查询到授权支付特殊数据！");
																	return;
																}
																objDTO = dto.root[0];
																if(objDTO.business_type==1){
																	Ext.Msg.alert("系统提示","当前凭证已支取确认！");
																	return;
																}
																setValue(objDTO);
															},
															failure : function(response,options) {
																Ext.Msg.alert("系统提示","根据凭证号和金额后台查询授权支付特殊业务失败！");
															}
														});
											}
										} ]
							}, {
								style : 'margin-top:10px;margin-buttom:10px;',
								id : 'leibei',
								fieldLabel : '&nbsp;指令类别',
								xtype : 'combo',
								dataIndex : 'value',
								displayField : 'name',
								valueField : 'value',
								labelWidth : 70,
								width : 250,
								editable : false,
								enable : true,
								readOnly : true,
								store : comboLeibei
							} ]
				});

/***
 * 支付
 * @memberOf {TypeName} 
 * @return {TypeName} 
 */
function cashTransferPayVoucher() {
	if (cashMark == null) {
		Ext.Ajax.request( {
			url : '/realware/loadEleByName.do',
			method : 'POST',
			timeout : 180000, // 设置为3分钟
			params : {
				eleName : 'SET_MODE',
				eleValue : '现金',
				admdivCode : Ext.getCmp('admdiv').getValue()
			},
			success : function(response, options) {
				cashMark =  response.responseText;
			},
			failure : function(response,options) {
				Ext.Msg.alert("系统提示","获取现金标识失败！");
			}
		});
	}
	if (cashWin == null) {
		var h = document.documentElement.scrollHeight-5;
		cashWin = Ext.create('Ext.window.Window', {
			id : 'payVoucherCash',
			title : '授权支付特殊业务',
			width : 510,
			height : h,
			layout : 'border',
			resizable : false,
			closeAction : 'hide',
			modal : true,
			items : [ northPanel, westPanel, centerPanel,
					Ext.create('Ext.panel.Panel', {
						region : 'south',
						border : 0,
						bbar : [ '->', {
							xtype : 'buttongroup',
							items : [ {
								id : 'back',
								text : '作废退回',
								scale : 'small',
								handler : function() {
									if(objDTO==null || objDTO==""){
										Ext.Msg.alert("系统提示","必须输入凭证号和金额查询到数据才能进行此操作！");
										return;
									}
									var ids=[];
									var lastVers = [];
									ids.push(objDTO.pay_voucher_id);
									lastVers.push(objDTO.last_ver);
									Ext.widget('window', {
										id : 'backWin',
										title : '凭证退回财政原因',
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
											items : [{
												xtype : 'textareafield',
												height : 70,
												width : 345,
												id : 'beaText'
										}],
										buttons : [{
											text : '确定',
											handler : function() {
												// 退票/退回原因
												var backRes = Ext.getCmp('beaText').getValue();
												if (backRes == ""){
													Ext.Msg.alert("系统提示", opereteName+"原因不能为空！");
													return ;
												};
												if (backRes.length > 40) {
													Ext.Msg.alert("系统提示", opereteName+"原因长度不能超过40个字！");
													return;
												};
												var myMask = new Ext.LoadMask('backWin', {
														msg : '后台正在处理中，请稍后....',
														removeMask : true   // 完成后移除
												});
												myMask.show();
												// 提交到服务器操作
												Ext.Ajax.request({
														url : backUrl,
														method : 'POST',
														timeout : 180000, // 设置为3分钟
														params : {
															returnRes : backRes,
															billTypeId : objDTO.bill_type_id,
															billIds : Ext.encode(ids),
															last_vers : Ext.encode(lastVers)
														},
														// 提交成功的回调函数
														success : function(response,options) {
															succAjax(response,myMask);
															Ext.getCmp('backWin').close();
															setValue();
															cashWin.hide();
															refreshData();
														},
														// 提交失败的回调函数
														failure : function(response,options) {
															failAjax(response,myMask);
															Ext.getCmp('backWin').close();
															setValue();
															cashWin.hide();
														}
													});
												}
										}, {
											text : '取消',
											handler : function() {
												this.up('window').close();
												setValue();
												cashWin.hide();
											}
										}]
										})]
									}).show()
								}
							}, {
								id : 'qingkuan',
								text : '请款确认',
								scale : 'small',
								hidden: true,
								handler : function() {
									if(objDTO==null || objDTO==""){
										Ext.Msg.alert("系统提示","必须输入凭证号和金额查询到数据才能进行此操作！");
										return;
									}
									if(check()){
										transVoucher(1);
										cashWin.hide();
									}
								}
							}, {
								id : 'payConfrim',
								text : '支付确认',
								scale : 'small',
								handler : function() {
									if(objDTO==null || objDTO==""){
										Ext.Msg.alert("系统提示","必须输入凭证号和金额查询到数据才能进行此操作！");
										return;
									}
									if(check()){
										transVoucher(4);
										cashWin.hide();
									}
								}
							}, {
								id : 'rengongCfrim',
								text : '人工确认支付',
								scale : 'small',
								hidden : true,
								handler : function() {
									if(objDTO==null || objDTO==""){
										Ext.Msg.alert("系统提示","必须输入凭证号和金额查询到数据才能进行此操作！");
										return;
									}
									if(check()){
										Ext.widget('window', {
											width : 350,
											height : 100,
											title : '补录人工确认支付信息',
											items : [ Ext.widget('form', {
												renderTo : Ext.getBody(),
												resizable : false,
												modal : true,
												bodyPadding : 5,
												items : [ {
													fieldLabel : '&nbsp;银行交易流水号',
													xtype : 'textfield',
													id :'bankTransNo'
												}],
												buttons : [ {
													text : '确定',
													handler : function() {
														var bankTransNo = Ext.getCmp("bankTransNo").getValue();
														if(bankTransNo==""){
															Ext.Msg.alert("系统提示","请输入银行交易流水号！");
															return;
														}
														transVoucher(3,bankTransNo);
														cashWin.hide();
														this.up('window').close();
													}
												}, {
													text : '取消',
													handler : function() {
														this.up('window').close();
													}
												} ]
											}) ]
										}).show();
									}
								}
							}, {
								id : 'close',
								text : '取消',
								scale : 'small',
								handler : function() {
									setValue();
									cashWin.hide();
								}
							} ]
						} ]
					}) ]
		});
	}
	cashWin.show();
}


/****
 * 校验
 * @return {TypeName} 
 */
function check() {
	var leibei = Ext.getCmp("leibei").getValue();
	var oriPayAmt = Ext.getCmp("oriPayAmt").getValue();
	var Amt = Ext.getCmp("Amt").getValue();
	//现金（限额） 金额可编辑
	if(leibei =="1"){
		Ext.getCmp("Amt").setValue(oriPayAmt);
	}else{
		if (oriPayAmt < Amt || Amt == 0 ||  Amt == null) {
			Ext.Msg.alert("系统提示", "金额不能大于原始金额且不能为0");
			return false;
		}
	}
	if (leibei == "3" || leibei == "4") {
		var payeeAcctname = Ext.getCmp("payeeAcctname").getValue();
		var payeeAcctno = Ext.getCmp("payeeAcctno").getValue();
		var payeeBankname = Ext.getCmp("payeeBankname").getValue();
		var payeeBankno = Ext.getCmp("payeeBankno").getValue();
		if(payeeAcctname=="" || payeeAcctno=="" || payeeBankname=="" || payeeBankno==""){
			Ext.Msg.alert("系统提示", "请补录收款行信息！");
			return false;
		}
	}
	
	return true;
}

/**
 * 
 * @param {Object} obj
 */


function setValue(obj) {
	if (obj == undefined) {
		Ext.getCmp("payeeAcctname").setValue("");
		Ext.getCmp("payeeAcctno").setValue("");
		Ext.getCmp("payeeBankname").setValue("");
		Ext.getCmp("payeeBankno").setValue("");
		Ext.getCmp("Amt").setValue("");
		Ext.getCmp("agency").setValue("");
		Ext.getCmp("exp_func").setValue("");
		Ext.getCmp("exp_eco").setValue("");
		Ext.getCmp("payeeaname").setValue("");
		Ext.getCmp("payeeano").setValue("");
		Ext.getCmp("payeebname").setValue("");
		Ext.getCmp("amt1").setValue("");
		Ext.getCmp("billNo").setValue("");
		Ext.getCmp("oriPayAmt").setValue("");
		Ext.getCmp("leibei").setValue("");
		objDTO = null;
	} else {
		//结算方式编码1 现金  支付类型编码 1正常支付  2限额支付
		//第一种情况：结算方式=现金支票 且 支付类型=1正常支付
		if (obj.set_mode_code == cashMark && obj.pay_mgr_code == "1") {
			Ext.getCmp("payeeAcctname").setDisabled(true);
			Ext.getCmp("payeeAcctno").setDisabled(true);
			Ext.getCmp("payeeBankname").setDisabled(true);
			Ext.getCmp("payeeBankno").setDisabled(true);
			Ext.getCmp("Amt").setDisabled(true);
			Ext.getCmp('leibei').setValue("1");
		//第二种情况：结算方式=现金支票 且 支付类型=2限额支票
		} else if (obj.set_mode_code == cashMark && obj.pay_mgr_code == "2") {
			Ext.getCmp("payeeAcctname").setDisabled(true);
			Ext.getCmp("payeeAcctno").setDisabled(true);
			Ext.getCmp("payeeBankname").setDisabled(true);
			Ext.getCmp("payeeBankno").setDisabled(true);
			Ext.getCmp("Amt").setDisabled(false);
			Ext.getCmp('leibei').setValue("2");
		//第三种情况：结算方式 不等于现金 且 支付类型=1正常支付
		} else if (obj.set_mode_code != cashMark  && obj.pay_mgr_code == 1
				&& (obj.payee_account_no == null || obj.payee_account_no == "")) {
			Ext.getCmp("payeeAcctname").setDisabled(false);
			Ext.getCmp("payeeAcctno").setDisabled(false);
			Ext.getCmp("payeeBankname").setDisabled(false);
			Ext.getCmp("payeeBankno").setDisabled(false);
			Ext.getCmp("Amt").setDisabled(false);
			Ext.getCmp('leibei').setValue("3");
		//第四种情况：结算方式 不等于现金 且 支付类型=2限额支票
		} else if (obj.set_mode_code != cashMark  && obj.pay_mgr_code == 2) {
			Ext.getCmp("payeeAcctname").setDisabled(false);
			Ext.getCmp("payeeAcctno").setDisabled(false);
			Ext.getCmp("payeeBankname").setDisabled(false);
			Ext.getCmp("payeeBankno").setDisabled(false);
			Ext.getCmp("Amt").setDisabled(false);
			Ext.getCmp('leibei').setValue("4");
		} else {
			Ext.Msg.alert("系统提示", "当前查询到的数据不属于授权支付特殊业务！");
			return;
		}
		//初始化值
		Ext.getCmp("agency").setValue(obj.agency_code + obj.agency_name);
		Ext.getCmp("exp_func").setValue(obj.exp_func_code + obj.exp_func_name);
		Ext.getCmp("exp_eco").setValue(obj.exp_eco_code + obj.exp_eco_name);
		Ext.getCmp("payeeaname").setValue(obj.payee_account_name);
		Ext.getCmp("payeeano").setValue(obj.payee_account_no);
		Ext.getCmp("payeebname").setValue(obj.payee_account_bank);
		Ext.getCmp("amt1").setValue(obj.pay_amount);
	}
}

/***
 * 转账
 * @param {Object} transType  1请款  2转账 3人工
 * @param {Object} bankTransNo  银行交易流水号
 * 暂时修改为:主管密码授权
 */
var pay_voucher_code = null;
function transVoucher(transType, bankTransNo) {
	pay_voucher_code = Ext.getCmp("billNo").getValue();
	// 实际支付金额
	var payAmount = Ext.getCmp("Amt").getValue();
	if (payAmount >= limitOfAmount) {
		var me = this;
		var form = Ext.create('Ext.form.Panel', {
					layout : 'absolute',
					defaultType : 'textfield',
					border : false,
					bodyStyle : "background:#DFE9F6",
					items : [{
								fieldLabel : '主管代码',
								id : "majorUserCode",
								fieldWidth : 40,
								labelWidth : 60,
								msgTarget : 'side',
								allowBlank : false,
								x : 5,
								y : 5,
								anchor : '-5' // anchor width by percentage
							}, {
								fieldLabel : '主管密码',
								id : "txtmajorUserCodePwd",
								fieldWidth : 40,
								labelWidth : 60,
								inputType : 'password',
								msgTarget : 'side',
								minLength : 6,
								maxLength : 6,
								allowBlank : false,
								x : 5,
								y : 35,
								anchor : '-5' // anchor width by percentage
							}],
					dockedItems : [{
								xtype : 'toolbar',
								dock : 'bottom',
								ui : 'footer',
								layout : {
									pack : "end"
								},
								items : [{
											text : "确认",
											width : 80,
											disabled : true,
											formBind : true,
											handler : onConfirm,
											scope : me
										}, {
											text : "取消",
											width : 80,
											handler : onCancel,
											scope : me
										}]
							}]

				});
		var win = Ext.create('Ext.window.Window', {
					autoShow : true,
					title : '主管授权',
					width : 300,
					height : 130,
					layout : 'fit',
					plain : true,
					resizable : false,
					items : form
				});
		function onCancel() {
			setValue();
			win.close();
		}
		function onConfirm() {
			var myMask = new Ext.LoadMask(Ext.getBody(), {
						msg : '后台正在处理中，请稍后....',
						removeMask : true
					});
			myMask.show();
			var ids = [];
			var reqVers = [];
			var bill_type_id = objDTO.bill_type_id;
			ids.push(objDTO.pay_voucher_id);
			reqVers.push(objDTO.last_ver);

			Ext.Ajax.request({
						url : "/realware/cashTransPayVoucher.do?type="+ transType,
						method : 'GET',
						timeout : 180000, // 设置为3分钟
						params : {
							// 单据类型id
							billTypeId : bill_type_id,
							billIds : Ext.encode(ids),
							last_vers : Ext.encode(reqVers),
							bankTransNo : bankTransNo,
							amt : Ext.getCmp("Amt").getValue(),
							payeeAcctname : Ext.getCmp("payeeAcctname")
									.getValue(),
							payeeAcctno : Ext.getCmp("payeeAcctno").getValue(),
							payeeBankname : Ext.getCmp("payeeBankname")
									.getValue(),
							payeeBankno : Ext.getCmp("payeeBankno").getValue(),
							majorUserCode: Ext.getCmp('majorUserCode').getValue(),
							majorUserCodePwd: Ext.getCmp("txtmajorUserCodePwd").getValue(),
							vochType : Ext.getCmp("vouchType").getValue(),
							vochBatchNo : Ext.getCmp("vochbatchno").getValue(),
							vochSeqNo : Ext.getCmp("vochseqno").getValue()
						},
						success : function(response, options) {
//							succAjax(response, myMask, true);
							myMask.hide();
							var msg = response.responseText;
							setValue();
							win.close();
							refreshData();
							Ext.MessageBox.confirm('打印提示', msg+'，请打印记账凭证', print_voucher);
						},
						failure : function(response, options) {
							failAjax(response, myMask);
							setValue();
							win.close();
							refreshData();
						}
					});
		}
	} else {
		var myMask = new Ext.LoadMask(Ext.getBody(), {
					msg : '后台正在处理中，请稍后....',
					removeMask : true
				});
		myMask.show();
		var ids = [];
		var reqVers = [];
		var bill_type_id = objDTO.bill_type_id;
		ids.push(objDTO.pay_voucher_id);
		reqVers.push(objDTO.last_ver);
		Ext.Ajax.request({
					url : "/realware/cashTransPayVoucher.do?type=" + transType,
					method : 'GET',
					timeout : 180000, // 设置为3分钟
					params : {
						// 单据类型id
						billTypeId : bill_type_id,
						billIds : Ext.encode(ids),
						last_vers : Ext.encode(reqVers),
						bankTransNo : bankTransNo,
						amt : Ext.getCmp("Amt").getValue(),
						payeeAcctname : Ext.getCmp("payeeAcctname").getValue(),
						payeeAcctno : Ext.getCmp("payeeAcctno").getValue(),
						payeeBankname : Ext.getCmp("payeeBankname").getValue(),
						payeeBankno : Ext.getCmp("payeeBankno").getValue()
					},
					success : function(response, options) {
						myMask.hide();
						var msg = response.responseText;
						setValue();
//						win.close();
						refreshData();
						Ext.MessageBox.confirm('打印提示', msg+'，请打印记账凭证', print_voucher);
					},
					failure : function(response, options) {
						failAjax(response, myMask);
						refreshData();
					}
				});
	}
}

function print_voucher(id) {
	if (id == "yes") {
		var data="[{\"pay_voucher_code\":[\""+pay_voucher_code+"\"]}]";
		GridPrintDialog('undefined','undefined',loadGrfURL
								,loadDataURL,"guimian",data,100);
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
