/*******************************************************************************
 * 主要用于支付凭证复核转账（不用请款）
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
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/backVoucher.js"></scr' + 'ipt>');
	

/**
 * 数据项
 */
var fileds = ["pay_voucher_code", "vou_date", "pay_amount", "payee_account_no",
		"payee_account_name", "payee_account_bank", "payee_account_bank_no",
		"pay_account_no", "pay_account_name", "pay_account_bank", "pay_date",
		"pay_bank_code", "pay_bank_name", "clear_bank_code", "clear_bank_name",
		"checkNo", "fund_deal_mode_code", "fund_deal_mode_name",
		"fund_type_code", "fund_type_name", "pay_type_code", "pay_type_name",
		"set_mode_code", "set_mode_name", "pay_summary_code",
		"pay_summary_name", "task_id", "pay_voucher_id", "bill_type_id","last_ver","return_reason","pb_set_mode_name","city_code"];

/**
 * 列名
 */
var header = "退票原因|return_reason|150,凭证号|pay_voucher_code|140,凭证日期|vou_date|100,支付金额|pay_amount|100,转账方式|pb_set_mode_name|120,"
		+ "省市代码|city_code|80,收款行行号|payee_account_bank_no,收款人账号|payee_account_no,收款人名称|payee_account_name|140,收款人银行|payee_account_bank|140,"
		+ "付款人账号|pay_account_no,付款人名称|pay_account_name|140,付款人银行|pay_account_bank|140,支付日期|pay_date,代理银行编码|pay_bank_code,"
		+ "代理银行名称|pay_bank_name,清算银行编码|clear_bank_code,清算银行名称|clear_bank_name,支票号|checkNo,办理方式编码|fund_deal_mode_code,"
		+ "办理方式名称|fund_deal_mode_name,资金性质编码|fund_type_code,资金性质名称|fund_type_name,支付方式编码|pay_type_code,"
		+ "支付方式名称|pay_type_name,结算方式编码|set_mode_code,结算方式名称|set_mode_name,用途编码|pay_summary_code,"
		+ "用途名称|pay_summary_name";

/*******************************************************************************
 * 状态
 */
var comboStore = Ext.create('Ext.data.Store', {
				fields : ['name', 'value'],
				data : [{
							"name" : "未转账",
							"value" : "004"
						},  {
							"name" : "转账失败",
							"value" : "009"
						}, {
							"name" : "转账成功",
							"value" : "008"
						}, {
							"name" : "已退回",
							"value" : "007"
						}]
			});
/*******************************************************************************
 * 专项资金类别
 */
var comboSpclType =  Ext.create('Ext.data.Store', {
				fields : ['name', 'value'],
				data : [{
							"name" : "农村义务教育资金 ",
							"value" : "01"
						},  {
							"name" : "新农村合作医疗补助资金  ",
							"value" : "02"
						}, {
							"name" : "家电下乡补贴资金",
							"value" : "03"
						}, {
							"name" : "汽车摩托车下乡补贴资金",
							"value" : "04"
						},  {
							"name" : "家电以旧换新补贴资金",
							"value" : "05"
						}, {
							"name" : "普及九年义务教育化债资金",
							"value" : "06"
						}, {
							"name" : "普及九年义务教育化债资金",
							"value" : "07"
						},  {
							"name" : "养殖业保险保费补贴资金",
							"value" : "08"
						}, {
							"name" : "化解乡村其他公益性债务补贴资金",
							"value" : "09"
						}, {
							"name" : "其他类别资金",
							"value" : "xx"
						}]
			});

/*********************************************************************
 * 
 * 资金来源 
 */

var fundSrcStore = Ext.create('Ext.data.Store', {
		fields : ['name', 'value'],
		data : [{
					"name" : "中央补助资金",
					"value" : "01"
				},{
					"name" : "地方配套资金",
					"value" : "02"
				}]
		});
/*********************************************************************8
 * 转现标志 1 现金，2 网点操作账户，3 ABIS91
 * 直接支付没有现金 、而中央专项资金只有现金、和网点操作账户
 */		
var payflagStore = Ext.create('Ext.data.Store', {
		fields : ['name', 'value'],
		data : [{
					"name" : "网点操作账户",
					"value" : "2"
				},{
					"name" : "ABIS91",
					"value" : "3"
				}]
		});
/**
 * 界面加载
 */
Ext.onReady(function() {
	Ext.QuickTips.init();
		if (gridPanel1 == null) {
		gridPanel1 = getGrid(loadUrl, header, fileds, true, true);
		gridPanel1.setHeight(document.documentElement.scrollHeight - 88);
		// 根据查询条件检索数据
		gridPanel1.getStore().on('beforeload', function(thiz, options) {
			var admdiv = Ext.getCmp('admdiv').getValue();
			if (admdiv == null || admdiv == "")
				return;
			beforeload(Ext.getCmp("transferVoucherNoReqQuery"), options, Ext.encode(fileds));
			options.params['loadCash']="0";
			options.params['vtCode']=vtCode;
		});
	}
	Ext.create('Ext.Viewport', {
		id : 'transferVoucherFrame',
		layout : 'fit',
		items : [Ext.create('Ext.panel.Panel', {
					tbar : [{
								id : 'buttongroup',
								xtype : 'buttongroup',
								items : [ {
											id : 'trans',
											text : '转账',
											iconCls : 'pay',
											scale : 'small',
											handler : function() {
												inputTranMsg(true,"first");
											}
										},{
											id : 'transl',
											text : '多线程转账',
											iconCls : 'pay',
											scale : 'small',
											hidden:true,
											handler : function() {
												bankTransferVoucherPool(true);
											}
										},{
											id : 'againTrans',
											text : '再次转账',
											iconCls : 'pay',
											scale : 'small',
											handler : function() {
												inputTranMsg(true,"again");
												//againBankTransferVoucher(true);
											}
										},
										{
											id : 'localTrans',
											text : '落地转账',
											iconCls : 'save',
											scale : 'small',
											handler : function() {
												inputTranMsg(false,"toGround");
											}
										},{
											id : 'unsubmit',
											text : '退回',
											iconCls : 'back',
											scale : 'small',
											handler : function() {
											backVoucher('/realware/unsubmitVoucher.do',gridPanel1.getSelectionModel().getSelection(),"pay_voucher_id","退回初审");
											}
										},{
											id : 'back',
											text : '退票',
											iconCls : 'back',
											scale : 'small',
											handler : function() {
												backVoucher(backUrlFin,gridPanel1.getSelectionModel().getSelection(),"pay_voucher_id","退回财政");
											}
										}/*, {
											id : 'checkAccInfo',
											text : '查看账户信息',
											iconCls : 'look',
											scale : 'small',
											handler : function() {
												checkPayAccountInfo();
											}
										}, {
											id : 'checkAccTransDetail',
											text : '查看交易明细',
											iconCls : 'look',
											scale : 'small',
											handler : function() {
												checkPayAccountTransDetail();
											}
										}*/,{
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
									id : 'transferVoucherNoReqQuery',
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
											value : '004',
											editable : false,
											labelWidth : 60,
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
	selectState();
});

/*******************************************************************************
 * 切换状态
 * 
 * @return
 */
function selectState() {
	var taskState = Ext.getCmp('taskState').getValue();
	if ("004" == taskState) {
		Ext.getCmp('back').enable(false);
		Ext.getCmp('trans').enable(false);
		Ext.getCmp('unsubmit').enable(false);
		Ext.getCmp('localTrans').disable(false);
		Ext.getCmp('againTrans').disable(false);
		//Ext.getCmp('cancelTrans').disable(false);
		Ext.getCmp("return_reason").setVisible(false);
	} else if ("008" == taskState) {
		Ext.getCmp('back').disable(false);
		Ext.getCmp('unsubmit').enable(false);
		Ext.getCmp('trans').disable(false);
		Ext.getCmp('localTrans').disable(false);
		Ext.getCmp('againTrans').disable(false);
		//Ext.getCmp('cancelTrans').enable(false);
		Ext.getCmp("return_reason").setVisible(false);
	} else if ("009" == taskState) {
		Ext.getCmp('back').enable(false);
		Ext.getCmp('unsubmit').enable(false);
		Ext.getCmp('trans').disable(false);
		//Ext.getCmp('cancelTrans').disable(false);
		Ext.getCmp('localTrans').enable(false);
		Ext.getCmp('againTrans').enable(false);
		Ext.getCmp("return_reason").setVisible(false);
	}else if("007" == taskState){
		Ext.getCmp('back').disable(false);
		Ext.getCmp('unsubmit').enable(false);
		Ext.getCmp('trans').disable(false);
		Ext.getCmp('localTrans').disable(false);
		Ext.getCmp('againTrans').disable(false);
		//Ext.getCmp('cancelTrans').disable(false);
		Ext.getCmp("return_reason").setVisible(true);
	} else {
		Ext.getCmp('back').disable(false);
		Ext.getCmp('unsubmit').enable(false);
		Ext.getCmp('trans').disable(false);
		Ext.getCmp('localTrans').disable(false);
		Ext.getCmp('againTrans').disable(false);
		//Ext.getCmp('cancelTrans').disable(false);
		Ext.getCmp("return_reason").setVisible(false);
	}
	refreshData();
}

function selectAdmdiv() {
	refreshData();
}
function inputTranMsg(nolocal,tranType){
	var records = gridPanel1.getSelectionModel().getSelection();
	if (records.length == 0||records.length>1) {
		Ext.Msg.alert("系统提示", "请至少选中一条凭证信息");
		return;
	}
	var inputTranMsgDialog = new Ext.FormPanel({
		id:'AagencyZeroForm',
	    labelWidth: 75,
	    frame:true,
	    bodyStyle:'padding:5px 5px 0',
	    width: 800,
	    defaults: {width: 300},
	    defaultType: 'textfield',
			items : [ {
							id : 'cashTransFlag',
							xtype : 'combobox',
							fieldLabel : '现转标志',
							labelWidth : 130,
							queryMode: 'local',
    						displayField: 'name',
    						valueField: 'value',
    						value : '2',
    						editable : false,
							store: payflagStore
						},{
							id :'cntrlSpclFundBdgtdocno',
							fieldLabel : '中央专项资金预算文号',
							labelWidth : 130
						},{
							id :'localSeprBdgtdocno',
							fieldLabel : '地方分解预算文号',
							labelWidth : 130
						},{
							id :'acctWarrntcode',
							fieldLabel : '支付令编码(电子票号)',
							labelWidth : 130
						},{
							id :'bdgtSubjcode',
							fieldLabel : '预算科目编码',
							labelWidth : 130
						},{
							id :'fundSrc',
							fieldLabel : '资金来源',
							xtype : 'combo',
							dataIndex : 'fundSrc',
							displayField : 'name',
							emptyText : '请选择',
							valueField : 'value',
							store : fundSrcStore,
							value : '01',
							editable : false,
							labelWidth : 130
						},{
							id : 'Spcltype',
						    fieldLabel : '专项资金类别',
							xtype : 'combo',
							dataIndex : 'spcltype',
							displayField : 'name',
							emptyText : '请选择',
							valueField : 'value',
							store : comboSpclType,
							value : '01',
							editable : false,
							labelWidth : 130
						},{
           					fieldLabel: '主管代码',
          					id:"txtmajorUserCode",
                            labelWidth: 130,
                            msgTarget: 'side',
                            allowBlank: false
        				},{
            				fieldLabel: '主管密码',
            				id:"txtmajorUserCodePwd",
           					//fieldWidth: 40,
            				labelWidth: 130,
            				inputType: 'password',
            				msgTarget: 'side',
           					minLength: 6,
	        				maxLength: 6,
            				allowBlank: false
       					 },{
							id :'remark',
							fieldLabel : '用途名称',
							labelWidth : 130
						}
					],
			buttons: [
						{
	                  	  text: '确定',
	                      handler: function() {
							if(tranType=="first"){
								bankTransferVoucher(nolocal,this.up('window'),records);
							}else if(tranType=="again"){
								againBankTransferVoucher(nolocal,this.up('window'),records);
							}else if(tranType =="toGround"){
								bankTransferVoucher(nolocal,this.up('window'),records);
							}
							this.up('window').close();
							//alert(Ext.getCmp('Spcltype').rawValue);
	                   	 }
	              	   },
					   {
	                     text: '取消',
	                     handler: function() {
	                     	this.up('window').close();
	                     }
	                   }]
		});
	var dialog=Ext.widget('window', {
		title : '转账',
		width : 400,
		height : 360,
		layout : 'fit',
		resizable : false,
		modal : true,
		items : [ inputTranMsgDialog ]
	}).show();
	if(specialFundsNo.indexOf(records[0].get("pay_account_no"))<0){
		Ext.getCmp('cntrlSpclFundBdgtdocno').disable(true);
		Ext.getCmp('localSeprBdgtdocno').disable(true);
		Ext.getCmp('acctWarrntcode').disable(true);
		Ext.getCmp('bdgtSubjcode').disable(true);
		Ext.getCmp('fundSrc').disable(true);
		Ext.getCmp('Spcltype').disable(true);
	}else{
		Ext.getCmp('cashTransFlag').disable(true);
	};
	if(tranType=="first"){
		var tt = Ext.getCmp('txtmajorUserCodePwd');
		Ext.getCmp('txtmajorUserCode').disable(true);
		Ext.getCmp('txtmajorUserCodePwd').disable(true);
		Ext.getCmp('remark').disable(true);
	}else if(tranType=="again"){
		Ext.getCmp('txtmajorUserCode').enable(true);
		Ext.getCmp('txtmajorUserCodePwd').enable(true);
		Ext.getCmp('remark').enable(true);
	}else if(tranType=="toGround"){
		Ext.getCmp('txtmajorUserCode').enable(true);
		Ext.getCmp('txtmajorUserCodePwd').enable(true);
	}
}
/*******************************************************************************
 * 转账
 */
function bankTransferVoucher(nolocal,win,records) {
//	var records = gridPanel1.getSelectionModel().getSelection();
//	if (records.length == 0) {
//		Ext.Msg.alert("系统提示", "请至少选中一条凭证信息");
//		return;
//	}
//	if(Ext.isEmpty(records)){
//		records = gridPanel1.getSelectionModel().getSelection();
//	}
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请至少选中一条凭证信息");
		return;
	}
	var reqIds = [];
	var reqVers = [];
	Ext.Array.each(records, function(model) {
				reqIds .push(model.get("pay_voucher_id"));
				reqVers.push(model.get("last_ver"));
			});
	var myMask = new Ext.LoadMask(Ext.getBody(), {
		msg : '后台正在处理中，请稍后....',
		removeMask : true
			// 完成后移除
		});
	if (nolocal) {
		myMask.show();
		Ext.Ajax.request({
					method : 'POST',
					timeout : 180000, // 设置为3分钟
					url : '/realware/bankTransferVoucherForGXABC.do',
					params : {
						// 单据类型id
						billTypeId : records[0].get("bill_type_id"),
						billIds : Ext.encode(reqIds),
						last_vers : Ext.encode(reqVers),
						cntrlSpclFundBdgtdocno: Ext.getCmp('cntrlSpclFundBdgtdocno').getValue(),
						localSeprBdgtdocno: Ext.getCmp('localSeprBdgtdocno').getValue(),
						acctWarrntcode: Ext.getCmp('acctWarrntcode').getValue(),
						bdgtSubjcode: Ext.getCmp('bdgtSubjcode').getValue(),
						fundSrc: Ext.getCmp('fundSrc').getValue(),
						spcltypeCode: Ext.getCmp('Spcltype').getValue(),
						spclTypeName: Ext.getCmp('Spcltype').rawValue,
						cashTransFlag: Ext.getCmp('cashTransFlag').getValue(),
						majorUserCode: Ext.getCmp('txtmajorUserCode').getValue(),
						majorUserCodePwd: Ext.getCmp("txtmajorUserCodePwd").getValue()
					},
					success : function(response, options) {
						succAjax(response, myMask,true);
					},
					failure : function(response, options) {
						failAjax(response, myMask);
						refreshData();
					}
				});
	} else {
		
		myMask.show();
		Ext.Ajax.request({
					method : 'POST',
					timeout : 180000, // 设置为3分钟
					url : '/realware/bankTransferVoucherForGXABC.do',
					params : {
						// 单据类型id
						billTypeId : records[0].get("bill_type_id"),
						billIds : Ext.encode(reqIds),
						last_vers : Ext.encode(reqVers),
						whereObj : '232',
						cntrlSpclFundBdgtdocno: Ext.getCmp('cntrlSpclFundBdgtdocno').getValue(),
						localSeprBdgtdocno: Ext.getCmp('localSeprBdgtdocno').getValue(),
						acctWarrntcode: Ext.getCmp('acctWarrntcode').getValue(),
						bdgtSubjcode: Ext.getCmp('bdgtSubjcode').getValue(),
						fundSrc: Ext.getCmp('fundSrc').getValue(),
						spcltypeCode: Ext.getCmp('Spcltype').getValue(),
						spclTypeName: Ext.getCmp('Spcltype').rawValue,
						cashTransFlag: Ext.getCmp('cashTransFlag').getValue(),
						majorUserCode: Ext.getCmp('txtmajorUserCode').getValue(),
						majorUserCodePwd: Ext.getCmp("txtmajorUserCodePwd").getValue()
					},
					success : function(response,options) {
						succAjax(response, myMask,true);
					},
					failure : function(response,
							options) {
						failAjax(response, myMask);
						refreshData();
					}
				});
	/*	Ext.widget('window', {
			id : 'backWin',
			title : '修改备注对话框',
			width : 400,
			height : 200,
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
									height : 120,
									width : 365,
									id : 'remark'
								}],
						buttons : [{
							text : '确定',
							handler : function() {
								var remark = Ext.getCmp('remark').getValue();
								if (remark.length > 40) {
									Ext.Msg.alert("系统提示", "长度不能超过40个字");
									return;
								};
								myMask.show();
								Ext.Ajax.request({
											method : 'POST',
											timeout : 180000,  设置为3分钟											url : '/realware/bankTransferVoucher.do',
											params : {
												 单据类型id												billTypeId : records[0].get("bill_type_id"),
												billIds : Ext.encode(reqIds),
												last_vers : Ext.encode(reqVers),
												remark : remark,
												whereObj : '232'
											},
											success : function(response,options) {
												succAjax(response, myMask,true);
												Ext.getCmp('backWin').close();
											},
											failure : function(response,
													options) {
												failAjax(response, myMask);
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
		}).show();*/
	}
}

/**
 * 多线程转账
 * @param {} nolocal
 */
function bankTransferVoucherPool(nolocal) {
	var records = gridPanel1.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请至少选中一条凭证信息");
		return;
	}
	var reqIds = [];
	var reqVers = [];
	Ext.Array.each(records, function(model) {
				reqIds .push(model.get("pay_voucher_id"));
				reqVers.push(model.get("last_ver"));
			});
	var myMask = new Ext.LoadMask(Ext.getBody(), {
		msg : '后台正在处理中，请稍后....',
		removeMask : true
			// 完成后移除
		});
	if (nolocal) {
		myMask.show();
		Ext.Ajax.request({
					method : 'POST',
					timeout : 600000, // 设置为10分钟
					url : '/realware/bankTransferVoucherPool.do',
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
	} else {
		
		myMask.show();
		Ext.Ajax.request({
					method : 'POST',
					timeout : 180000, // 设置为3分钟
					url : '/realware/bankTransferVoucher.do',
					params : {
						// 单据类型id
						billTypeId : records[0].get("bill_type_id"),
						billIds : Ext.encode(reqIds),
						last_vers : Ext.encode(reqVers),
						whereObj : '232'
					},
					success : function(response,options) {
						succAjax(response, myMask,true);
					},
					failure : function(response,
							options) {
						failAjax(response, myMask);
						refreshData();
					}
				});
	}
}

/*******************************************************************************
 * 再次转账
 */
function againBankTransferVoucher(nolocal,win,records) {
	var reqIds = [];
	var reqVers = [];
	Ext.Array.each(records, function(model) {
				reqIds .push(model.get("pay_voucher_id"));
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
					url : '/realware/bankTransferVoucherForGXABC.do',
					params : {
						// 单据类型id
						billTypeId : records[0].get("bill_type_id"),
						billIds : Ext.encode(reqIds),
						last_vers : Ext.encode(reqVers),
						remark : remark,
						cntrlSpclFundBdgtdocno: Ext.getCmp('cntrlSpclFundBdgtdocno').getValue(),
						localSeprBdgtdocno: Ext.getCmp('localSeprBdgtdocno').getValue(),
						acctWarrntcode: Ext.getCmp('acctWarrntcode').getValue(),
						bdgtSubjcode: Ext.getCmp('bdgtSubjcode').getValue(),
						fundSrc: Ext.getCmp('fundSrc').getValue(),
						spcltypeCode: Ext.getCmp('Spcltype').getValue(),
						spclTypeName: Ext.getCmp('Spcltype').rawValue,
						cashTransFlag: Ext.getCmp('cashTransFlag').getValue(),
						majorUserCode: Ext.getCmp('txtmajorUserCode').getValue(),
						majorUserCodePwd: Ext.getCmp("txtmajorUserCodePwd").getValue()
					},
					success : function(response, options) {
						succAjax(response, myMask,true);
					},
					failure : function(response, options) {
						failAjax(response, myMask);
						refreshData();
					}
				});

//	Ext.Array.each(records, function(model) {
//				reqIds .push(model.get("pay_voucher_id"));
//				reqVers.push(model.get("last_ver"));
//			});
//	var paySummaryName = records[0].get('pay_summary_name');
//	var myMask = new Ext.LoadMask(Ext.getBody(), {
//		msg : '后台正在处理中，请稍后....',
//		removeMask : true
//			// 完成后移除
//		});
//		 Ext.widget('window', {
//			id : 'backWin',
//			title : '修改用途名称对话框',
//			width : 400,
//			height : 200,
//			layout : 'fit',
//			resizable : false,
//			modal : true,
//			items : [Ext.widget('form', {
//						renderTo : Ext.getBody(),
//						layout : {
//							type : 'vbox',
//							padding : '10'
//						},
//						resizable : false,
//						modal : true,
//						items : [{
//									xtype : 'textareafield',
//									height : 120,
//									width : 365,
//									value : paySummaryName,
//									id : 'remark'
//								}
//						],
//						buttons : [{
//							text : '确定',
//							handler : function() {
//								var remark = Ext.getCmp('remark').getValue();
//								if (remark.length > 40) {
//									Ext.Msg.alert("系统提示", "长度不能超过40个字");
//									return;
//								};
//								this.up('window').close();
//								
//								myMask.show();
//							Ext.Ajax.request({
//					method : 'POST',
//					timeout : 180000, // 设置为3分钟
//					url : '/realware/bankTransferVoucherForGXABC.do',
//					params : {
//						// 单据类型id
//						billTypeId : records[0].get("bill_type_id"),
//						billIds : Ext.encode(reqIds),
//						last_vers : Ext.encode(reqVers),
//						remark : remark,
//						majorUserCodePwd: Ext.getCmp("txtmajorUserCodePwd").getValue()
//					},
//					success : function(response, options) {
//						succAjax(response, myMask,true);
//					},
//					failure : function(response, options) {
//						failAjax(response, myMask);
//						refreshData();
//					}
//				});
//							}
//						}, {
//							text : '取消',
//							handler : function() {
//								this.up('window').close();
//							}
//						}]
//
//					})]
//		}).show();
	}




/*******************************************************************************
 * 查看付款账户信息
 * 
 * @return
 */
function checkPayAccountInfo() {
	var records = gridPanel1.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请至少选中一条凭证信息");
		return;
	}
	var reqIds = [];
	var reqVers = [];
	Ext.Array.each(records, function(model) {
				reqIds .push(model.get("pay_voucher_id"));
				reqVers.push(model.get("last_ver"));
			});
	var myMask = new Ext.LoadMask(Ext.getBody(), {
		msg : '后台正在处理中，请稍后....',
		removeMask : true
			// 完成后移除
		});
	myMask.show();
		Ext.Ajax.request({
					url : '/realware/checkPayAccountInfo.do',
					method : 'POST',
					timeout : 180000, // 设置为3分钟
					params : {
						billTypeId : records[0].get("bill_type_id"),
						billIds : Ext.encode(reqIds),
						last_vers : Ext.encode(reqVers)
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
 * 查看付款账户交易明细信息
 * 
 * @return
 */
function checkPayAccountTransDetail() {
	var records = gridPanel1.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请至少选中一条凭证信息");
		return;
	}
	var reqIds = [];
	var reqVers = [];
	Ext.Array.each(records, function(model) {
				reqIds .push(model.get("pay_voucher_id"));
				reqVers.push(model.get("last_ver"));
			});
	var myMask = new Ext.LoadMask(Ext.getBody(), {
		msg : '后台正在处理中，请稍后....',
		removeMask : true
			// 完成后移除
		});
	myMask.show();
		Ext.Ajax.request({
					url : '/realware/checkPayAccountTransDetail.do',
					method : 'POST',
					timeout : 180000, // 设置为3分钟
					params : {
						billTypeId : records[0].get("bill_type_id"),
						billIds : Ext.encode(reqIds),
						last_vers : Ext.encode(reqVers)
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

