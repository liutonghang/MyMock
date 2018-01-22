/***
 * 主要用于授权日报生成
 * @type 
 */

/***
 * 引入需要使用的js文件
 */
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/recommend.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/operationLog.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/ocxVoucher.js"></scr' + 'ipt>');
	
var filed001 = ["pay_voucher_code","vou_date","pay_amount","payee_account_no","payee_account_name","payee_account_bank","payee_account_bank_no",
		 "pay_account_no","pay_account_name","pay_account_bank","pay_bank_code","pay_bank_name","clear_bank_code","clear_bank_name","checkNo",
		 "fund_deal_mode_code","fund_deal_mode_name","fund_type_code","fund_type_name","pay_type_code","pay_type_name","set_mode_code",
		 "set_mode_name","pay_summary_code","pay_summary_name","task_id","pay_voucher_id","bill_type_id"]; // 数据项

var header001="凭证号|pay_voucher_code|140,凭证日期|vou_date|100,支付金额|pay_amount|100,收款人账号|payee_account_no,"
		+ "收款人名称|payee_account_name|140,收款人银行|payee_account_bank|140,收款行行号|payee_account_bank_no,"
		+ "付款人账号|pay_account_no,付款人名称|pay_account_name|140,付款人银行|pay_account_bank|140,代理银行编码|pay_bank_code,"
		+ "代理银行名称|pay_bank_name,清算银行编码|clear_bank_code,清算银行名称|clear_bank_name,支票号|checkNo,办理方式编码|fund_deal_mode_code,"
		+ "办理方式名称|fund_deal_mode_name,资金性质编码|fund_type_code,资金性质名称|fund_type_name,支付方式编码|pay_type_code,"
		+ "支付方式名称|pay_type_name,结算方式编码|set_mode_code,结算方式名称|set_mode_name,用途编码|pay_summary_code,"
		+ "用途名称|pay_summary_name";
		
//已生成        
var filed002=["pay_daily_code","pay_amount","fund_type_code","fund_type_name","pay_bank_code","pay_bank_name","create_date","print_num",
		"print_date","voucherflag","pay_daily_id","bill_type_id","task_id","voucher_status"];


var header002="汇总单号|pay_daily_code|200,金额|pay_amount|100,资金性质编码|fund_type_code|100,资金性质名称|fund_type_name|100,代理银行编码|pay_bank_code|100," 
		+"代理银行名称|pay_bank_name|200,生成日期|create_date|200,打印次数|print_num|100,打印时间|print_date,凭证状态|voucher_status";	
		

var comboVoucherStatus = Ext.create('Ext.data.Store', {
	fields : ['name', 'value'],
	data : [{
				"name" : "全部",
				"value" : ""
			}, {
				"name" : "本方未发送",
				"value" : "13"
			}, {
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
			}]
});

var refid = "pay_voucher_id";

var store1 = null; 
var column1 = null;

var store2 = null;
var column2 = null;

var code =null;

// 不能生成划款单的凭证列表面板
var errorVoucherPanel = null;

/*******************************************************************************
 * 界面初始化
 */
Ext.onReady(function() {
	Ext.QuickTips.init();
	store1 = getStore("/realware/loadPayVoucherForDaily.do", filed001);
	column1 = getColModel(header001, filed001);
	store2 = getStore("/realware/loadPayDaily.do", filed002);
	column2 = getColModel(header002, filed002);
	var pagetool = getPageToolbar(store1);
	pagetool.child('#refresh').hide(true);
	
	store1.on('beforeload', function(thiz, options,e) {
		var panel = Ext.ComponentQuery.query("panel[title='查询区']")[0];
		beforeload(panel, options, Ext.encode(filed001));
		options.params["admdiv"] = Ext.getCmp('admdiv').getValue();
	});
	store2.on('beforeload', function(thiz, options,e) {
		var panel = Ext.ComponentQuery.query("panel[title='查询区']")[0];
		beforeload(panel, options, Ext.encode(filed002));
	});
	var buttonItems = [{
				id : 'audit',
				handler : function() {
					var admdiv_code = Ext.getCmp('admdiv').getValue();
					createPayDaily(admdiv_code, 'loadPayVouchersForCreateDaily.do', 'createPayDailyNoSend.do');
				}
			},{
				id : 'sendAllByClearVoucher',
				handler : function() {
					//按照划款单生成日报(吉林专用)
					var admdiv_code = Ext.getCmp('admdiv').getValue();
					createPayDaily(admdiv_code, 'loadPayVouchersForClearVouDaily.do', 'createPayDailyByClearVoucher.do');
				}
			},{
				id : 'unCreate',
				handler : function() {
					unCreatePayDailyByClearVoucher();
				}
			},{
				id : 'send',
				handler : function() {
					sendPayDaily();
				}
			},{
				id : 'again',
				handler : function() {
					sendPayDailyagain();
				}
			},{
				id : 'lookVoucher',
				handler : function() {
				var id = Ext.getCmp('taskState').getValue()=="001"?"pay_voucher_id":"pay_daily_id";
				lookOCX(Ext.getCmp("dailyPanel").getSelectionModel().getSelection(),id);
				}
			}, {
				id : 'looklog',
				handler : function() {
				var id = Ext.getCmp('taskState').getValue()=="001"?"pay_voucher_id":"pay_daily_id";
				taskLog(Ext.getCmp("dailyPanel").getSelectionModel().getSelection(),id);
				}
			}, {
				id : 'refresh',
				handler : function() {
					refreshData();
				}
			}];
	var queryItems = [{
				title : '查询区',
				bodyPadding : 8,
				layout : 'column',
				defaults : {
					margins : '3 10 0 0'
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
							editable : false,
							labelWidth : 60,
							store : comboAdmdiv
						}, /*
						{
							id : 'agency_name',
							fieldLabel : '预算单位编码',
							xtype : 'textfield',
							dataIndex : 'agency_name',
							labelWidth : 80
						}, */{
							id : 'code1',
							fieldLabel : '凭证号',
							xtype : 'textfield',
							dataIndex : 'pay_voucher_code',
							labelWidth : 49
						},{
							id : 'code2',
							fieldLabel : '日报号',
							xtype : 'textfield',
							dataIndex : 'pay_daily_code',
							labelWidth : 49
						},/*{
							id : 'exp_func_name',
							fieldLabel : '功能分类',
							xtype : 'textfield',
							dataIndex : 'exp_func_name',
							labelWidth : 60
						},*/{
							id : 'voucherStatus',
							fieldLabel : '凭证状态',
							labelWidth : 60,
							xtype : 'combo',
							dataIndex : 'voucher_status',
							value : "",
							displayField : 'name',
							emptyText : '请选择',
							valueField : 'value',
							store : comboVoucherStatus,
							editable : false,
							listeners : {
								'select' : selectStatus
							}
						}],
				flex : 2
			}, {
				id : 'dailyPanel',
				xtype : 'gridpanel',
				selType : 'checkboxmodel',
				height : document.documentElement.scrollHeight- 90,
				enableKeyNav : true,
				multiSelect : true,
				title : '未生成列表信息',
				selModel : {
					mode : 'multi',
					checkOnly : true
				},
				store : store1,
				columns : column1,
				loadMask : {
					msg : '数据加载中,请稍等...'
				},
				bbar : pagetool
			}];
			Ext.StatusUtil.createViewport(buttonItems, queryItems, function() {
				Ext.StatusUtil.initPage(Ext.getCmp("admdiv"), Ext.getCmp("taskState"));
				// 默认设置为未生成
				Ext.getCmp('taskState').setValue("001");
			});
});
	


	
	
/*******************************************************************************
 * 切换状态
 * 
 * @return
 */
function selectState(combo, taskState, oldValue, eOpts) {
	var grid = Ext.getCmp("dailyPanel");
	var pager = Ext.ComponentQuery.query("pagingtoolbar")[0];
	//未生成
	if ("001" == taskState) {
		refid = "pay_voucher_id";
		Ext.StatusUtil.batchEnable("audit,lookVoucher,sendAllByClearVoucher,refresh,looklog");
		Ext.StatusUtil.batchDisable("send,unCreate,again");
		Ext.getCmp('code1').setVisible(true);
		Ext.getCmp('code2').setVisible(false);
		//Ext.getCmp('exp_func_name').setVisible(true);
		Ext.getCmp('voucherStatus').setVisible(false);
		//Ext.getCmp('exp_func_name').setValue("");
		Ext.getCmp('code1').setValue("");
		Ext.getCmp('code2').setValue("");
		// 重新绑定grid
		if(oldValue) {
			grid.setTitle("未生成列表信息");
			grid.reconfigure(store1, column1);
			// 重新绑定分页工具栏
			pager.bind(store1);
		}
	} else if ("002" == taskState) {
		refid = "pay_daily_id";
		Ext.StatusUtil.batchEnable("send,unCreate,looklog,refresh");
		Ext.StatusUtil.batchDisable("audit,sendAllByClearVoucher,again,lookVoucher");
		Ext.getCmp('code2').setVisible(true);
		Ext.getCmp('code1').setVisible(false);
		//Ext.getCmp('exp_func_name').setVisible(false);
		Ext.getCmp('voucherStatus').setVisible(false);
		//Ext.getCmp('exp_func_name').setValue("");
		Ext.getCmp('code2').setValue("");
		Ext.getCmp('code1').setValue("");
		grid.setTitle("已生成未发送日报列表信息");
		grid.reconfigure(store2, column2);
		pager.bind(store2);
	}
	else if ("003" == taskState) {
		refid = "pay_daily_id";
		Ext.StatusUtil.batchEnable("lookVoucher,looklog,refresh");
		Ext.StatusUtil.batchDisable("audit,unCreate,sendAllByClearVoucher,send,again");
		Ext.getCmp('code2').setVisible(true);
		Ext.getCmp('code1').setVisible(false);
		Ext.getCmp('voucherStatus').setVisible(true);
		//Ext.getCmp('exp_func_name').setVisible(true);
		//Ext.getCmp('exp_func_name').setValue("");
		Ext.getCmp('code2').setValue("");
		Ext.getCmp('code1').setValue("");
		grid.setTitle("已发送日报列表信息");
		grid.reconfigure(store2, column2);
		pager.bind(store2);
	}
}

/******************************************
 * 日报生成公共方法
 * @param admdiv_code
 * @return
 */
function createPayDaily(admdiv_code, loadUrl, doUrl) {

	var records = Ext.getCmp("dailyPanel").getSelectionModel().getSelection();
	var status = Ext.getCmp("taskState").getValue();
	if(Ext.isEmpty(admdiv_code)) {
		Ext.Msg.alert("系统提示", "所属财政为空不能进行操作！");
		return ;
	}
	if(Ext.isEmpty(status)) {
		Ext.Msg.alert("系统提示", "请选择未生成状态！");
		return ;
	}
	var myMask = new Ext.LoadMask(Ext.getBody(), {
		msg : '后台正在处理中，请稍后....',
		removeMask : true
		});
	myMask.show();
	var dailyVoucherConds = {
			task_status : ["=", "" + status],
			admdiv_code : ["=", "" + admdiv_code]
		};
	Ext.Ajax.request({
		url : loadUrl,
		method : 'POST',
		timeout : 600000, // 设置为10分钟
		params : {
			jsonMap : JSON.stringify([dailyVoucherConds]),
			admdiv_code : admdiv_code,
			filedNames : JSON.stringify(filed001),
			menu_id :  Ext.PageUtil.getMenuId()
		},
		success : function(response, options) {
			myMask.hide();
			var json = (new Function("return " + response.responseText))();
			Ext.widget('window', {
				id : 'createWindow1',
				title : '生成日报',
				width : 350,
				height : 120,
				layout : 'fit',
				resizable : true,
				modal : true,
				items : Ext.widget('form', {
					id : 'createForm1',
					layout : {
						type : 'vbox',
						align : 'stretch'
					},
					border : false,
					bodyPadding : 5,
					items : [{
								id : 'num',
								fieldLabel : '总笔数',
								xtype : 'textfield',
								labelWidth : 85,
								readOnly : true
							}, {
								id : 'amt',
								fieldLabel : '总金额',
								xtype : 'textfield',
								labelWidth : 85,
								readOnly : true
							}],
					buttons : [{
						id:'createPayDailyOK',
						text : '确定',
						handler : function() {
							if (this.up('form').getForm().isValid()) {
								if (records == null || records.length == 0) {
									Ext.Msg.alert("系统提示","当前没有需要生日报的支付凭证信息！");
									return;
								}
								Ext.getCmp('createPayDailyOK').disable(false);
								var reqIds = [];
								var reqVers = [];
								for(var i =0; i <records.length;i++){
										reqIds.push(records[i].pay_voucher_id);
										reqVers.push(records[i].last_ver);
								}
								myMask.show();
								//var isTask = Ext.ComponentQuery.query("button[id=createRequest]{isVisible(true)}").length;
								Ext.Ajax.request({
									url : doUrl,
									method : 'POST',
									timeout : 180000, // 设置为3分钟
									params : {
										billTypeId : records[0].bill_type_id,
										billIds : Ext.encode(reqIds),
										billIds2 : Ext.encode(json.billIds),	//从后台拿到的billIds(已生成划款单的),用于按划款单生成
										last_vers : Ext.encode(reqVers),
										menu_id :  Ext.PageUtil.getMenuId()
										//isTask : isTask
									},
									success : function(response, options) {
										myMask.hide();
										Ext.Msg.buttonText.ok = "确认";
										Ext.Msg.show({
													title : '成功提示',
													msg : "生成成功！",
													buttons : Ext.Msg.OK,
													icon : Ext.MessageBox.INFO
												});
										refreshData();
										Ext.getCmp("createForm1").getForm()
												.reset();
										Ext.getCmp("createWindow1").close();
									},
									failure : function(response, options) {
										myMask.hide();
										Ext.getCmp("createWindow1").close();
										var reqst = response.status;
										var getText = response.responseText;
										if (reqst == "-1") {// 超时的状况码为 -1
											Ext.Msg
													.alert("系统提示",
															"日报生成超时，可能存在网络异常，检查后请重试...");
										} else if (getText.indexOf("财政未签收成功") != -1) {
											var voucherNoStrs = getText.split("|");
											var voucherNoStr = voucherNoStrs[1].substring(0,voucherNoStrs[1].length-1);
											var msg = voucherNoStrs[0];
											Ext.Msg.buttonText.ok = "查看凭证信息";
											Ext.Msg.show({
												title : '失败提示',
												msg : msg,
												buttons : Ext.MessageBox.OKCANCEL,
												fn : look,
												icon : Ext.MessageBox.ERROR
											});
											function look(id) {
												if (id == "ok") {
													Ext.Msg.buttonText.ok = "确定";
													lookErrorVoucher(voucherNoStr);
												}
											}
										} else {
											Ext.Msg.alert("系统提示",
													response.responseText);
										}
									}
								});
								Ext.getCmp('createPayDailyOK').disable(false);
							}
						}
					}, {
						text : '取消',
						handler : function() {
							myMask.hide();
							this.up('window').close();
						}

					}]
				})
			}).show();
			Ext.getCmp("amt").setValue(json.amt);
			Ext.getCmp("num").setValue(json.num);
			records = json.root;
		},
		failure : function(response, options) {
			myMask.hide();
			var reqst = response.status;
			if (reqst == "-1") {// 超时的状况码为 -1
				Ext.Msg.alert("系统提示", "日报生成超时，可能存在网络异常，检查后请重试...");
			} else {
				Ext.Msg.alert("系统提示", "日报生成失败，原因：" + response.responseText
								+ "！");
			}
		}

	});


}
/*******************************************************************************
 * 签章发送
 */
function sendPayDaily(){
	var records = Ext.getCmp("dailyPanel").getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请选中一条凭证信息！");
		return;
	}
	else {
		var billIds = null;
		Ext.Array.each(records, function(model) {
					billIds = billIds + model.get("pay_daily_id") + ",";
				});
		var billTypeId=null;
		var billTypeId = records[0].get("bill_type_id");
		var myMask = new Ext.LoadMask(Ext.getBody(), {
			msg : '后台正在处理中，请稍后....',
			removeMask : true
				// 完成后移除
			});
		myMask.show();
		Ext.Ajax.request({
					url : '/realware/signAndSendAccountNoteOrDaily.do',
					method : 'POST',
					timeout : 180000, // 设置为3分钟
					params : {
						billIds : billIds.substring(0, billIds.length - 1),
						billTypeId : billTypeId,
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
}
/*******************************************************************************
 * 重新发送
 */
function sendPayDailyagain(){
	var records = Ext.getCmp("dailyPanel").getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请选中一条凭证信息！");
		return;
	}
	else {
		var billIds = null;
		Ext.Array.each(records, function(model) {
					billIds = billIds + model.get("pay_daily_id") + ",";
				});
		var billTypeId=null;
		var billTypeId = records[0].get("bill_type_id");
		var myMask = new Ext.LoadMask(Ext.getBody(), {
			msg : '后台正在处理中，请稍后....',
			removeMask : true
				// 完成后移除
			});
		myMask.show();
		Ext.Ajax.request({
					url : '/realware/sendAsspVoucher.do',
					method : 'POST',
					timeout : 180000, // 设置为3分钟
					params : {
						billIds : billIds.substring(0, billIds.length - 1),
						billTypeId : billTypeId,
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
}
/********************************************
 * 生成(ByClearVoucher)
 * @return {TypeName} 
 */
//function sendPayDailyByClearVoucher(){	
//
//	var admdiv = Ext.getCmp('admdiv').getValue();
//	if (admdiv == null || admdiv == "")
//				return;
////	var jsonMap="[{";
////	//\"task_state\":[\"=\",001],\"admdiv_code\":[\"=\","+admdiv+"]}]";
////	var taskState = Ext.getCmp('taskState').getValue();
////	var jsonStr = [];
////	jsonStr[0] = "=";
////	jsonStr[1] = taskState;
////	jsonMap = jsonMap + "\"task_state\":" + Ext.encode(jsonStr)
////						+ ",";
////	jsonStr[1] = admdiv;
////	jsonMap = jsonMap + "\"admdiv_code\":" + Ext.encode(jsonStr) + "}]";
//	var myMask = new Ext.LoadMask(Ext.getBody(), {
//			msg : '后台正在处理中，请稍后....',
//			removeMask : true
//				// 完成后移除
//			});
//	myMask.show();
//	var voucherConds = {
//			send_flag : ["=", 1],
//			admdiv_code : ["=", "" + admdiv]
//		};
//		Ext.Ajax.request({
//			url : '/realware/createPayDailyByClearVoucher.do',
//			method : 'POST',
//			timeout : 180000, // 设置为3分钟
//			params : {
//				jsonMap : JSON.stringify([voucherConds]),
//				menu_id :  Ext.PageUtil.getMenuId()
//			},
//			success : function(response, options) {
//				succAjax(response, myMask);
//				refreshData();
//			},
//			failure : function(response, options) {
//				failAjax(response, myMask);
//				refreshData();
//			}
//		});
//	
//}
/*
 * 撤销生成日报
 */
function unCreatePayDailyByClearVoucher(){
	var records = Ext.getCmp("dailyPanel").getSelectionModel().getSelection();
    if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请选择要撤销生成的日报数据！");
		return;
	}
	var reqIds = [];
	var reqVers = [];
	Ext.Array.each(records, function(model) {
				reqIds.push(model.get("pay_daily_id"));
				reqVers.push(model.get("last_ver"));
			});
	var myMask = new Ext.LoadMask(Ext.getBody(), {
		msg : '后台正在处理中，请稍后....',
		removeMask : true
		});
	myMask.show();
	Ext.Ajax.request({
				url : '/realware/unCreatePayDailyByClearVoucher.do',
				method : 'POST',
				timeout : 180000, 
				params : {
					billTypeId : records[0].get("bill_type_id"),
					billIds : Ext.encode(reqIds),
					last_vers : Ext.encode(reqVers),
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



/*******************************************************************************
 * 查詢
 * 
 * @return
 */
function refreshData() {
	Ext.getCmp("dailyPanel").getStore().load();
}

function selectStatus(){
	// 已发送
	if ( Ext.getCmp('taskState').getValue() == '003' ) {
		Ext.getCmp('voucherStatus').bindStore(comboVoucherStatus);
		var  statuId = Ext.getCmp('voucherStatus').getValue();
		if(statuId == "5" || statuId == "4"){
			Ext.StatusUtil.batchEnable('unCreate');	
		}else{
			Ext.StatusUtil.batchDisable('unCreate');	
		}
		if(statuId=="2")
		{
			Ext.StatusUtil.batchEnable('again');	
		}else{
			Ext.StatusUtil.batchDisable('again');	
		}
		
	}
	refreshData();
	
}


/*******************************************************************************
 * 查看不能生成的凭证
 */
function lookErrorVoucher(voucherNo) {
	errorVoucherPanel = getGrid("loadPayVoucher.do", header001, filed001, true, true,"error");
	getErrorPayVoucher(voucherNo);
	var winLog = Ext.create('Ext.Window', {
				title : '凭证信息',
				plain : true,
				closable : true,
				resizable : false,
				layout : 'fit',
				frame : true,
				modal : true,
				width : 750,
				height : 500,
				resizable : false,
				modal : true,
				items : [errorVoucherPanel],
				buttons : [{
							text : '取消',
							handler : function() {
								this.up('window').close();
							}
					}
		         ]
			}).show();
}
/*******************************************************************************
 * 获取不能生成的凭证信息
 */
function getErrorPayVoucher(payVoucherNo) {
	var payVoucherNos = payVoucherNo.split(",");
	var status = Ext.getCmp("taskState").getValue();
	var admdiv_code = Ext.getCmp('admdiv').getValue();
	var data = "[{\"pay_voucher_code\":[\"in\",\"('" + payVoucherNos[0];
	for (var i = 1; i < payVoucherNos.length; i++) {
		data = data + "','" + payVoucherNos[i];
	}
	var data = data + "')\", \"number\"],\"task_status\":[\"=\",\""+status+"\"],\"admdiv_code\":[\"=\",\""+admdiv_code+"\"]}]";
	errorVoucherPanel.getStore().load({
				method : 'post',
				params : {
					start : 0,
					pageSize : 200,
					filedNames : JSON.stringify(filed001),
					jsonMap : data
				}
			});
}
