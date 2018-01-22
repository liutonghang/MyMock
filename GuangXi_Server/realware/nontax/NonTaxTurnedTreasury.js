/*******************************************************************************
 * 缴款上缴国库
 * 
 * @type
 */

/*******************************************************************************
 * 引入需要使用的js文件
 */
document.write('<scr'+ 'ipt type="text/javascript" src="/realware/resources/js/recommend.js"></scr'+ 'ipt>');
document.write('<scr'+ 'ipt type="text/javascript" src="/realware/resources/js/share/operationLog.js"></scr'+ 'ipt>');
document.write('<scr'+ 'ipt type="text/javascript" src="/realware/resources/js/share/ocxVoucher.js"></scr'+ 'ipt>');
//document.write('<scr'+ 'ipt type="text/javascript" src="/realware/resources/js/share/menuBtnStatus.js"></scr'+ 'ipt>');


var gridPanel1 = null;
/**
 * 列名
 */
var fileds = ["jkd_voucher_no", "pay_amount", "payee_account_no",
		"payee_account_name", "payee_account_bank", "payee_account_bank_no",
		"pay_account_no", "pay_account_name", "pay_account_bank", "pay_date", "bill_type_id",
		"demandnote_voucher_id", "last_ver", "vt_code", "admdiv_code",
		"demandnote_voucher_code", "vou_date",
		"tra_no","task_id","signStamp_flag"];
var header = "缴库单号|demandnote_voucher_code|140,"
		+ "收款行行号|payee_account_bank_no|100,收款人账号|payee_account_no|140,收款人名称|payee_account_name|140,收款人银行|payee_account_bank|140,"
		+ "付款行行号|pay_account_bank_no|100,付款人账号|pay_account_no|140,付款人名称|pay_account_name|140,付款人银行|pay_account_bank|140,缴款金额|pay_amount|100," +
				"汇划流水号|tra_no|100";

//凭证状态
var comboVoucherStatus = Ext.create("Ext.data.Store", {
		fields : [ "name", "value" ],
		data : [ {
			"name" : "全部",
			"value" : ""
		},{
			"name" : "银行未发送",
			"value" : "13"
		},{
			"name" : "对方未接收",
			"value" : "0"
		}, {
			"name" : "对方接收成功",
			"value" : "1"
		}, {
			"name" : "对方接收失败",
			"value" : "2"
		}, {
			"name" : "对方签收成功",
			"value" : "3"
		}, {
			"name" : "对方签收失败",
			"value" : "4"
		}, {
			"name" : "对方已退回",
			"value" : "5"
		},{
			"name" : "已收到对方回单",
			"value" : "12"
		} ]

});
Ext.onReady(function() {
			Ext.QuickTips.init();
			gridPanel1 = getGrid(loadUrl, header, fileds, true, true);
			gridPanel1.setHeight(document.documentElement.scrollHeight - 170);
			// 根据查询条件检索数据
			gridPanel1.getStore().on('beforeload', function(thiz, options) {
				beforeload(Ext.getCmp("PayVoucherSendQuery"), options, Ext
								.encode(fileds));
			});
			
			var buttonItems = [{
						id : 'accountrecord',
						handler : function() {
							accountrecord();
						}
					}, {
						id : 'pay',
						handler : function() {
							transferPay();
						}
					}, {
						id : 'artificialtransfer',
						handler : function() {
							artificialtransfer();
						}
					}, {
						id : 'send',
						handler : function() {
							sendVoucher();
						}
					}, {
						id : 'cancleStamp',
						handler : function() {
						      cancelStamp();
						}
					},{
			              id : 'back',
			              handler : function() {
			            	  back("return2fin.do");
			             }
		            },{
						id : 'lookVoucher',
						handler : function() {
							lookOCX(gridPanel1.getSelectionModel()
											.getSelection(),
									"demandnote_voucher_id");
						}
					}, {
						id : 'log',
						handler : function() {
							taskLog(gridPanel1.getSelectionModel()
											.getSelection(),
									"demandnote_voucher_code");
						}
					}, {

						id : 'refresh',
						handler : function() {
							refreshData();
						}
					}];
			var queryItems = [{

						title : '查询条件',
						id : 'PayVoucherSendQuery',
						bodyPadding : 5,
						layout : {
							type : 'table',
							columns : 4
						},
						items : [{
									id : 'taskState',
									fieldLabel : '当前状态',
									xtype : 'combo',
									dataIndex : 'task_status',
									displayField : 'status_name',
									emptyText : '请选择',
									valueField : 'status_code',
									symbol : '=',
									editable : false,
									style : 'margin-left:5px;margin-right:5px;',
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
									store : comboAdmdiv,
									style : 'margin-left:5px;margin-right:5px;'
							}	, {
									id : "voucherNo",
									fieldLabel : '缴库单号',
									xtype : 'textfield',
									dataIndex : 'demandnote_voucher_code',
									style : 'margin-left:5px;margin-right:5px;'
							}	, {
									fieldLabel : '凭证日期',
									xtype : 'datefield',
									dataIndex : 'vou_date',
									format : 'Ymd',
									style : 'margin-left:5px;margin-right:5px;'
							}	, {
									id : 'payDate',
									fieldLabel : '交易日期',
									xtype : 'datefield',
									dataIndex : 'pay_date',
									format : 'Ymd',
									symbol : '>=',
									hidden : isRefund,
									style : 'margin-left:5px;margin-right:5px;',
									data_type : 'date'
								}, {
									id : 'payDateEnd',
									fieldLabel : '至',
									xtype : 'datefield',
									dataIndex : 'pay_date ',
									format : 'Ymd',
									symbol : '<=',
									maxValue : new Date(),
									hidden : isRefund,
									style : 'margin-left:5px;margin-right:5px;',
									data_type : 'date'
								}, {
									id : "traNo",
									fieldLabel : '汇划流水号',
									xtype : 'textfield',
									dataIndex : 'tra_no',
									style : 'margin-left:5px;margin-right:5px;'
								},{
									id : 'amount',
									fieldLabel : '&nbsp;&nbsp;金额',
									xtype : 'numberfield',
									dataIndex : 'pay_amount',
									symbol : '=',
									datatype : '1',
									style : 'margin-left:5px;margin-right:5px;',
									fieldStyle : 'text-align: right;', // 文本框里显示内容右对齐
									decimalPrecision : 2  // 小数精确位数										
								},{
									id : 'voucherStatus',
									fieldLabel : '凭证状态',
									xtype : 'combo',
									dataIndex : 'voucher_status',
									displayField : 'name',
									emptyText : '请选择',
									valueField : 'value',
									editable : false,
									store : comboVoucherStatus,
									style : 'margin-left:5px;margin-right:5px;',
									value : "",
									listeners : {
										'change' : selectStatus
									}
								}]
						 	},{
								title : '缴库通知单信息',
								selType : 'checkboxmodel',
								selModel : {
									mode : 'multi',
									checkOnly : true
							}
					},gridPanel1];
			Ext.StatusUtil.createViewport(buttonItems, queryItems, function() {
						Ext.StatusUtil.initPage(Ext.getCmp("admdiv"), Ext
										.getCmp("taskState"));
						// 默认设置为未生成
						Ext.getCmp('taskState').setValue("001");
						if (isRefund) {
							gridPanel1.down('#pay_date').hide();
						}
					});

		});
/**
 * 控制按钮状态
 * *****************************************************************************
 */
function selectState() {
	Ext.getCmp('voucherStatus').setValue("");
	var taskState = Ext.getCmp('taskState').getValue();
	if ("001" == taskState) {
		Ext.getCmp('send').disable();
		Ext.getCmp('cancleStamp').disable();
		Ext.getCmp('artificialtransfer').enable();
		Ext.getCmp('pay').enable();
		Ext.getCmp('accountrecord').enable();
		Ext.getCmp('voucherStatus').disable();
		Ext.getCmp('back').enable();
	} else if ("002" == taskState) {
		Ext.getCmp('accountrecord').disable();
		Ext.getCmp('pay').disable();
		Ext.getCmp('artificialtransfer').disable();
		Ext.getCmp('send').enable();
		Ext.getCmp('cancleStamp').enable();
		Ext.getCmp('voucherStatus').disable();
		Ext.getCmp('back').disable();
	} else if ("003" == taskState) {
		Ext.getCmp('send').disable();	
		Ext.getCmp('voucherStatus').enable();
		Ext.getCmp('cancleStamp').disable();
		Ext.getCmp('artificialtransfer').disable();
		Ext.getCmp('pay').disable();
		Ext.getCmp('accountrecord').disable();
		Ext.getCmp('back').disable();
	} else if ("004" == taskState) {
		Ext.getCmp('send').disable();	
		Ext.getCmp('voucherStatus').disable();
		Ext.getCmp('cancleStamp').disable();
		Ext.getCmp('artificialtransfer').disable();
		Ext.getCmp('pay').disable();
		Ext.getCmp('accountrecord').disable();
		Ext.getCmp('back').disable();
	}
}

function selectStatus(){
	var voucherStatus = Ext.getCmp('voucherStatus').getValue();
	if("4" == voucherStatus || "5" == voucherStatus){
		Ext.StatusUtil.batchEnable("back,cancleStamp,send");
	}else{
		Ext.StatusUtil.batchDisable("back,cancleStamp,send");
	}
	refreshData();
}

function refreshData() {
	gridPanel1.getStore().loadPage(1);
}

/**
 * 转账
 */
function transferPay() {
	var me = this;
	var records = gridPanel1.getSelectionModel().getSelection();
	if (records == null || records.length == 0) {
		Ext.Msg.alert("系统提示", "请先选择一条数据！");
		return;
	}
	
	var reqIds = [];
	var reqVers = [];
	
	Ext.Array.each(records, function(model) {
				reqIds.push(model.get("demandnote_voucher_id"));
				reqVers.push(model.get("last_ver"));
			});
	var bill_type_id = records[0].get("bill_type_id");
	var params = {
		billTypeId : bill_type_id,
		billIds : Ext.encode(reqIds),
		last_vers : Ext.encode(reqVers)
	};
	Ext.PageUtil.doRequestAjax(me, '/realware/noTaxPay.do', params);
}


/**
 * 人工转账
 */
function artificialtransfer() {
	var me = this;
	var gridPanel = Ext.getCmp(Ext.PageUtil.prefix
			+ Ext.getCmp('taskState').getValue());
	var records = gridPanel1.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert('系统提示', '请至少选择一条数据！');
		return;
	}
	if (records.length > 1) {
		Ext.Msg.alert('系统提示', '只能选中一条数据！');
		return;
	}
	var window = Ext.create('Ext.window.Window', {
		title : '补录汇划流水',
		width : 320,
		height : 150,
		layout : 'fit',
		modal:true,
		items : [{
			xtype : 'form',
			layout : 'absolute',
			defaultType : 'textfield',
			border : false,
			bodyStyle : "background:#DFE9F6",
			items : [{
						fieldLabel : '汇划流水号',
						id : "agentBusinessNo",
						msgTarget : 'side',
						maxLength : 50,
						allowBlank : false,
						x : 5,
						y : 5,
						anchor : '-5'
					},{
                         fieldLabel : '请再次输入',
                         id : "agentBusinessNo2",
                         msgTarget : 'side',
                         maxLength : 50,
                         allowBlank : false,
                         x : 5,
                         y : 35,
                         anchor : '-5' 
                             }
					],
			dockedItems : [{
				xtype : 'toolbar',
				dock : 'bottom',
				ui : 'footer',
				layout : {
					pack : "end"
				},
				items : [{
					text : '确定',
					width : 80,
					disabled : true,
					formBind : true,
					handler : function() {
						var form = this.up('form').getForm();
						if(Ext.getCmp("agentBusinessNo").getValue() != Ext.getCmp("agentBusinessNo2").getValue()){
							Ext.Msg.alert("系统提示", "两次输入流水号不一致，请重新输入！");
							return;
						}
						//补录流水号
							var reqIds = [];
							var reqVers = [];
							var tra_no =Ext.getCmp("agentBusinessNo").getValue();
							Ext.Array.each(records, function(model) {
										reqIds.push(model.get("demandnote_voucher_id"));
										reqVers.push(model.get("last_ver"));
									});
							var bill_type_id = records[0].get("bill_type_id");
							var myMask = new Ext.LoadMask(Ext.getBody(), {
								msg : '后台正在处理，请稍后...',
								removeMask : true
							});
							myMask.show();
							Ext.Ajax.request({
										method : 'POST',
										timeout : 180000,
										url : '/realware/notaxArtificialPay.do',
										params : {
											billIds : Ext.encode(reqIds),
											last_vers : Ext.encode(reqVers),
											billTypeId : bill_type_id,
											tra_no : tra_no
										},
										success : function(response, options) {
											myMask.hide();
											if (!Ext.isEmpty(window)) {
												window.close();
											}
											Ext.Msg.show({
												title : "成功提示",
												msg : response.responseText,
												buttons : Ext.Msg.OK
												});
											refreshData();
										},
										failure : function(response, options) {
											if (!Ext.isEmpty(myMask)) {
												myMask.hide();
											}
											Ext.Msg.show({
														title : "失败提示",
														msg : response.responseText,
														buttons : Ext.Msg.OK,
														icon : Ext.MessageBox.ERROR
													});
										}
									});
					}
				}, {
					text : "取消",
					width : 80,
					handler : function() {
						Ext.ComponentQuery.query('form', window)[0].getForm()
								.reset();
						window.close();
					}
				}]
			}]
		}]
	});
	window.show();

}


/**
 * 发送人行
 */
function sendVoucher() {
	var records = gridPanel1.getSelectionModel().getSelection();
	if (records.length == 0 || records == null) {
		Ext.Msg.alert("系统提示", "请选中一条回单信息！");
		return;
	}
	var reqIds = []; // 凭证主键字符串
	var reqVers = []; // 凭证lastVer字符串
    var codes = "";	
	for ( var i = 0; i < records.length; i++) {
		if( records[i].get("signStamp_flag") == 1 ){
			codes = codes + records[i].get("demandnote_voucher_code") + ",";
		}
		reqIds.push(records[i].get("demandnote_voucher_id"));
		reqVers.push(records[i].get("last_ver"));
	}	
	if( codes != ""){
		Ext.Msg.alert("系统提示", "单号为：" + codes.substring(0,codes.length - 1) + "的凭证需要先撤销签章！");
		return;
	}
	var bill_type_id = records[0].get("bill_type_id");
	var myMask = new Ext.LoadMask(Ext.getBody(), {
		msg : '后台正在处理中，请稍后....',
		removeMask : true
		});
	myMask.show();
	Ext.Ajax.request({
				url : '/realware/noTaxSendVoucher.do',
				method : 'POST',
				timeout : 180000, // 设置为3分钟
				params : {
					billTypeId : bill_type_id,
					billIds : Ext.encode(reqIds),
					last_vers : Ext.encode(reqVers),
					menu_id : Ext.PageUtil.getMenuId()
				},
				success : function(response, options) {
					succAjax(response, myMask, true);
				},
				failure : function(response, options) {
					failAjax(response, myMask);
					refreshData();
				}
			});
}

/**
 * 补录账号
 */
function accountrecord() {
	
	var records = gridPanel1.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请选中一条信息！");
		return;
	}
	if (records.length >1) {
		Ext.Msg.alert("系统提示", "只能选中一条信息！");
		return;
	}
	
	var fileds = ["account_no", "account_name","bank_name","bank_no"];
    var header = "账号|account_no|160,账户名称|account_name|160,开户行|bank_name|160";
	var grid = getGrid("/realware/noTaxQueryAccount.do", header,fileds, false, true,"ca");
	grid.setHeight(210);
	grid.title = "列表区";
	
	grid.getStore().on('beforeload', function(thiz, options) {
		beforeload(Ext.getCmp("Query"), options, Ext.encode(fileds));
	});
		
	 //判断收款人名称是否为空

	 if( !Ext.isEmpty(records[0].get("payee_account_name")) ){
		 Ext.Msg.alert("系统提示", "请选择账户为空的数据！");
	 	return
	 }
	 //如果为空，补录收款账户
	 var window1 = Ext.widget('window',{
                 title : '账户信息查询框',
           		 width : 520,
           		 resizable : false,
           		 autoHeight:true,
           		 modal:true,
           		 items : [ {
           			 		title : "查询区",
           			 		id : 'Query',
           			 		bodyPadding : 3,
           			 		layout:	'hbox',
           			 		defaults : {
           			 			margins : '3 10 0 0'
						   },    	   						       	   						   
						items : [ {
						fieldLabel : '账号',
						xtype : 'textfield',
						id : 'account_no',
						dataIndex : 'account_no',
						labelWidth : 60,
						symbol : 'like'
					 },{
					 	fieldLabel:'账户名称',
					 	xtype:'textfield',
					 	id:'account_name',
					 	labelWidth : 60,
					 	symbol:'like'
					 }, {
				 		text : '查询',
						xtype : 'button',
						handler : function(){
							grid.getStore().load();
						}	
					}
					]},grid],
					 buttons : [{
		 					text : '确定',
		 					handler : function() {
		 						var records2 = grid.getSelectionModel().getSelection();
		 						if (records2.length == 0 || records2.length>1) {
		 							Ext.Msg.alert("系统提示", "请选择一条数据！");
		 							return ;
		 						}
		 						 
							records[0].set("payee_account_no",records2[0].get("account_no"));
							records[0].set("payee_account_name",records2[0].get("account_name"));
							records[0].set("payee_account_bank",records2[0].get("bank_name"));
							records[0].set("payee_account_bank_no",records2[0].get("bank_no"));
							
							var data = records[0].data;
							delete data.pay_date;
							var myMask = new Ext.LoadMask(window1, {
									msg : '后台正在处理中，请稍后....',
									removeMask : true   // 完成后移除
									});
							myMask.show();
							Ext.Ajax.request( {
										method : 'POST',
										timeout : 180000,
										url : 'noTaxAddAccount1.do',
										jsonData : Ext.JSON.encode(data),
										success : function(response, options) {
											myMask.hide();
											if (!Ext.isEmpty(window1)) {
												window1.close();
											}
											
											Ext.Msg.show({
												title : "成功提示",
												msg : response.responseText,
												buttons : Ext.Msg.OK
												});
											refreshData();
										},
										failure : function(response, options) {
											if (!Ext.isEmpty(myMask)) {
												myMask.hide();
											}
											Ext.Msg.show({
														title : "失败提示",
														msg : response.responseText,
														buttons : Ext.Msg.OK,
														icon : Ext.MessageBox.ERROR
											});
										}
									});
		 					}
		 				}, {
		 					text : '取消',
		 					handler : function() {
		 						this.up('window').close();
		 					}
		 				}]
  				  		        
				 
	 }).show();	 
	 grid.getStore().load();  //在点击查询按钮之前，已经加载出数据
}

//撤销签章
function cancelStamp(){
	var me = this;
	var records = gridPanel1.getSelectionModel().getSelection();
	if (records == null || records.length == 0) {
		Ext.Msg.alert("系统提示", "请先选择一条数据！");
		return;
	}
	var reqIds = [];
	var reqVers = [];
	/**
	 * #BUG:18201
	 * 已发送下，可以撤销签章
	 */
	var codes = "";
	for(var i = 0; i < records.length; i++){
		if(records[i].get("signStamp_flag") != 1){
			codes = codes + records[i].get("demandnote_voucher_code") + ",";
		}
		reqIds.push(records[i].get("demandnote_voucher_id"));
		reqVers.push(records[i].get("last_ver"));
	}	
	if( codes != ""){
		Ext.Msg.alert("系统提示", "单号为：" + codes.substring(0,codes.length - 1) + "的凭证尚未签章，无法撤销!");
		return;
	}
	var bill_type_id = records[0].get("bill_type_id");
	var params = {
		billTypeId : bill_type_id,
		billIds : Ext.encode(reqIds),
		last_vers : Ext.encode(reqVers)
	};
	Ext.PageUtil.doRequestAjax(me, '/realware/cancelStamp.do', params);	
}


function back(returnUrl) {
	var records = gridPanel1.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请选中一条信息！");
		return;
	}
	var ids = [];
	var lastVers = [];
	var bill_type_id = records[0].get("bill_type_id");
	
	var codes = "";
	
	for ( var i = 0; i < records.length; i++) {
		if( records[i].get("signStamp_flag") == 1 ){
			codes = codes + records[i].get("demandnote_voucher_code") + ",";
		}
		ids.push(records[i].get("demandnote_voucher_id"));
		lastVers.push(records[i].get("last_ver"));
	}
	
	if( codes != ""){
		Ext.Msg.alert("系统提示", "单号为：" + codes.substring(0,codes.length - 1) + "的凭证需要先撤销签章！");
		return;
	}
	
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
								id : 'return_reason'
							}],
					buttons : [{
						text : '确定',
						handler : function() {
							// 退票/退回原因
							var return_reason = Ext.getCmp('return_reason').getValue();
							if (return_reason == ""){
								Ext.Msg.alert("系统提示", "退回财政原因不能为空！");
								return ;
							};
							if (return_reason.length > 40) {
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
							url : returnUrl,
							waitMsg : '后台正在处理中,请稍后....',
							method : 'POST',
							timeout : 180000, // 设置为3分钟
							params : {
								billIds : Ext.encode(ids),
								last_vers : Ext.encode(lastVers),
								billTypeId : bill_type_id,
								menu_id :  Ext.PageUtil.getMenuId(),
								return_reason:return_reason
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
