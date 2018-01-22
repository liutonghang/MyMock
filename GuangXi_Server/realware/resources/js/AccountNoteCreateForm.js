/*******************************************************************************
 * 入账通知单
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
 * 数据项
 */
//未生成
var vouFileds = ["pay_voucher_code", "payee_account_name",
		"payee_account_bank", "payee_account_no", "pay_account_name",
		"pay_account_no", "pay_amount", "vou_date", "fund_type_code",
		"fund_type_name", "set_mode_code", "set_mode_name", "pay_bank_code",
		"pay_bank_name", "clear_bank_code", "clear_bank_name",
		"pay_summary_code", "pay_summary_name", "payee_account_bank_no",
		"pb_set_mode_code", "voucher_status", "voucher_status_des","agent_business_no",
		"mof_dep_name", "exp_func_name", "print_num", 
		"pay_type_code", "pay_type_name", "exp_eco_name", "task_id",
		"bill_type_id", "pay_voucher_id"];

var vouHeader = "支付凭证号|pay_voucher_code|140,收款人全称|payee_account_name|140,收款人开户行|payee_account_bank|140,收款人账号|payee_account_no|140,付款人全称|pay_account_name|140,付款人账号|pay_account_no|140,支付金额|pay_amount|140,凭证日期|vou_date|140,"
		+ "资金性质编码|fund_type_code|140,资金性质名称|fund_type_name|140,结算方式编码|set_mode_code|140,结算方式名称|set_mode_name|140,"
		+ "代理银行编码|pay_bank_code|140,代理银行名称|pay_bank_name|140,清算银行编码|clear_bank_code|140,清算银行名称|clear_bank_name|140,用途编码|pay_summary_code|140,用途名称|pay_summary_name|140,"
		+ "收款人开发行号|payee_account_bank_no|140,银行结算方式|pb_set_mode_code|140,凭证状态|voucher_status_des|140,交易结果信息|agent_business_no|140,业务处室|mof_dep_name|140,功能分类|exp_func_name|140,"
		+ "支付方式编码|pay_type_code|140,支付方式名称|pay_type_name|140,经济分类|exp_eco_name|140";

//已生成    
var acctnoteFileds = ["pay_account_note_code", "pay_amount", "agency_code",
		"agency_name", "pay_bank_code", "pay_bank_name", "vou_date",
		"print_num", "voucher_status", "voucher_status_des", "remark", "bill_type_id",
		"pay_account_note_id", "task_id"];

var acctnoteHeader = "入账通知单编码|pay_account_note_code|140,支付金额|pay_amount|100,基层预算单位编码|agency_code|140,基层预算单位名称|agency_name|140,"
		+ "代理银行编码|pay_bank_code|140,代理银行名称|pay_bank_name|140,凭证日期|vou_date|140,凭证状态|voucher_status_des|140,备注|remark|140";

 
var comboVoucherStatus = Ext.create('Ext.data.Store', {
			fields : ['name', 'value'],
			data : [{
						"name" : "全部",
						"value" : ""
					}, {
						"name" : "银行未发送",
						"value" : "13"
					}, {
						"name" : "财政未接收",
						"value" : "0"
					}, {
						"name" : "财政接收成功",
						"value" : "1"
					}, {
						"name" : "财政接收失败",
						"value" : "2"
					}, {
						"name" : "财政签收成功",
						"value" : "3"
					}, {
						"name" : "财政签收失败",
						"value" : "4"
					}, {
						"name" : "财政已退回",
						"value" : "5"
					},{
						"name" : "已收到财政回单",
						"value" : "12"
					}]
});

var store1 = null; 
var store2 = null;

Ext.onReady(function() {
	Ext.QuickTips.init();
	//加载支付凭证的store
	store1 = getStore(loadUrl, vouFileds);
	//加载入账通知书的store
	store2 = getStore(loadPayAccountNoteUrl, acctnoteFileds);
	column1 = getColModel(vouHeader, vouFileds);
	column2 = getColModel(acctnoteHeader, acctnoteFileds);
	var pagetool = getPageToolbar(store1);
	store1.on('beforeload', function(thiz, options,e) {
		var panel = Ext.ComponentQuery.query("panel[title='查询区']")[0];
		beforeload(panel, options, Ext.encode(vouFileds));
		options.params["admdiv"] = Ext.getCmp('admdiv').getValue();
		Ext.getCmp("voucher_status_des").renderer = function(value){
			if(null != value){
				value = value.replace("对方", "财政");
				value = value.replace("本方", "银行");
				    if(value=="未发送"){
				    		value = "未发送到财政";
				    }								
			}
			return value;
		};
	});
	store2.on('beforeload', function(thiz, options,e) {
		var panel = Ext.ComponentQuery.query("panel[title='查询区']")[0];
		beforeload(panel, options, Ext.encode(acctnoteFileds));
		Ext.getCmp("voucher_status_des").renderer = function(value){
			if(null != value){
				value = value.replace("对方", "财政");
				value = value.replace("本方", "银行");
				    if(value=="未发送"){
				    		value = "未发送到财政";
				    }								
			}
			return value;
		};
	});
	
	var buttonItems = [{
			
			id : 'create',		// 生成
			handler : function() {
				createNote();
			}
		},{
			id : 'createAll',	// 全部生成
			handler : function() {
				var admdiv = Ext.getCmp('admdiv').getValue();
				createAllNote(admdiv);
			}
		},{
			id : 'send',		// 签章发送
			handler : function() {
				sendPayAccountNote();
			}
		},{
			id : 'signsend',	// 生成并签章发送
			handler : function() {
				createPayAccountNote();
			}
		},  {
			id : 'uncreate',	// 撤销生成
			handler : function() {
				unCreatePayAccountNote();
			}
		
		}, {
			id : 'lookVoucher',
			handler : function() {
				var taskState = Ext.getCmp('taskState').getValue();
					if(taskState=='001'){
						lookOCX(Ext.getCmp("accountNoteCreateQuery").getSelectionModel().getSelection(),"pay_voucher_id");
					}else if(taskState == '002'){
						lookOCX(Ext.getCmp("accountNoteCreateQuery").getSelectionModel().getSelection(),"pay_account_note_id");
					}else if(taskState == '003'){
						lookOCX(Ext.getCmp("accountNoteCreateQuery").getSelectionModel().getSelection(),"pay_account_note_id");
					}
			}
		}, {
			id : 'log',
			handler : function() {
				var records = Ext.getCmp("accountNoteCreateQuery").getSelectionModel().getSelection();
				var id = records.length == 0 ? "pay_voucher_id" : (records[0].get("pay_voucher_id") == undefined ? "pay_account_note_id": "pay_voucher_id");
				taskLog(records,id);
			}
		}, {
			id : 'refresh',
			handler : function() {
				refreshData();
			}
		}];
		
	var queryItems = [{
						title : '查询区',
						frame : false,
						defaults : {
							padding : '0 3 0 3'
						},
						layout : {
							type : 'table',
							columns : 3
						},
						bodyPadding : 5,
						items : [{
									id : 'taskState',
									fieldLabel : '当前状态',
									xtype : 'combo',
									dataIndex : 'task_status',
									displayField : 'status_name',
									emptyText : '请选择',
									valueField : 'status_code',
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
									store : comboAdmdiv
								}, {
									id : 'vouDate',
									fieldLabel : '凭证日期',
									xtype : 'datefield',
									dataIndex : 'vou_date',
									format : 'Ymd'
								}, {
									id : 'agency',
									fieldLabel : '预算单位编码',
									xtype : 'textfield',
									dataIndex : 'agency_code'
								},{
									id : 'agency1',
									fieldLabel : '预算单位名称',
									xtype : 'textfield',
									dataIndex : 'agency_name'
								},{
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
									listeners : {
										'select' : selectStatus
									}
								}]
						},{
							id : 'accountNoteCreateQuery',
							xtype : 'gridpanel',
							selType : 'checkboxmodel',
							height : document.documentElement.scrollHeight- 110,
							frame : false,
							viewConfig : {
								shrinkWrap : 0
							},
							enableKeyNav : true,
							multiSelect : true,
							title : '未生成入账通知单列表信息',
							selModel : {
								mode : 'multi',
								checkOnly : true
							},
							features: [{
		                		ftype: 'summary'
		            		}],
							store : store1,
							columns : column1,
							loadMask : {
								msg : '数据加载中,请稍等...'
							},
							bbar : pagetool
					}
				];
	
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
	var grid = Ext.getCmp("accountNoteCreateQuery");
	var pager = Ext.ComponentQuery.query("pagingtoolbar")[0];
	
	if ("001" == taskState) {   //未生成
		Ext.StatusUtil.batchEnable("create,createAll,signsend,lookVoucher,log,refresh");
		Ext.StatusUtil.batchDisable("send,uncreate,voucherStatus");
		// 重新绑定grid
		if(oldValue) {
			grid.setTitle("未生成入账通知单列表信息");
			grid.reconfigure(store1, column1);
			// 重新绑定分页工具栏
			pager.bind(store1);
		}
		var combo = Ext.getCmp('voucherStatus');
		combo.setValue("");
		combo.getEl().hide(false);
	} else if ("002" == taskState) {    //已生成
		
		Ext.StatusUtil.batchEnable("send,log,refresh,uncreate");
		Ext.StatusUtil.batchDisable("create,createAll,voucherStatus,signsend,lookVoucher");
		grid.setTitle("已生成入账通知单列表信息");
		grid.reconfigure(store2, column2);
		// 重新绑定分页工具栏
		pager.bind(store2);
		var combo = Ext.getCmp('voucherStatus');
		combo.setValue("");
		combo.getEl().hide(false);
	} else if ("003" == taskState) {    //已发送
		
		Ext.StatusUtil.batchEnable("lookVoucher,log,refresh,voucherStatus");
		Ext.StatusUtil.batchDisable("create,createAll,signsend,send,uncreate");
		// 重新绑定grid
		grid.setTitle("已发送入账通知单列表信息");
		grid.reconfigure(store2, column2);
		// 重新绑定分页工具栏
		pager.bind(store2);
		var combo = Ext.getCmp('voucherStatus');
		combo.setValue("");
		combo.getEl().show(true);
	} 
	//refreshData();
}

/**
 * 公用方法
 */
function accountNoteFunc(URL) {
	var records = Ext.getCmp("accountNoteCreateQuery").getSelectionModel().getSelection();	//gridPanel1.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请选中一条凭证信息！");
		return;
	}
	var reqIds = "";
	var reqNoteIds = "";
	for (var i = 0; i < records.length; i++) {
		reqIds += records[i].get("pay_voucher_id");
		reqNoteIds += records[i].get("pay_account_note_id");
		if (i < records.length - 1) {
			reqIds += ",";
			reqNoteIds += ",";
		}
	}
	
	
	var myMask = new Ext.LoadMask(Ext.getBody(), {
		msg : '后台正在处理中，请稍后....',
		removeMask : true
			// 完成后移除
		});
	myMask.show();
	Ext.Ajax.request({
				url : URL,
				method : 'POST',
				timeout : 180000, // 设置为3分钟
				params : {
					billIds : reqIds,
					billNoteIds : reqNoteIds
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
 * 生成
 */
function createNote() {
	accountNoteFunc('createNote.do');
}

/**
 * 撤销生成
 */
function unCreatePayAccountNote() {
	accountNoteFunc('unCreateNote.do');
}

/**
 * 签章发送
 */
function sendPayAccountNote() {
	
	var records = Ext.getCmp("accountNoteCreateQuery").getSelectionModel().getSelection();	//gridPanel1.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请选中一条凭证信息！");
		return;
	}
	var reqIds = "";
	for (var i = 0; i < records.length; i++) {
		reqIds += records[i].get("pay_account_note_id");
		if (i < records.length - 1)
			reqIds += ",";
	}
	var myMask = new Ext.LoadMask(Ext.getBody(), {
		msg : '后台正在处理中，请稍后....',
		removeMask : true
			// 完成后移除
		});
	myMask.show();
	Ext.Ajax.request({
				url : 'signAndSendAccountNoteOrDaily.do',
				method : 'POST',
				timeout : 180000, // 设置为3分钟
				params : {
					billIds : reqIds,
					billTypeId : records[0].get("bill_type_id")
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
 * 生成并签章发送
 */
function createPayAccountNote() {
	accountNoteFunc('createAccountNote.do');
}

/**
 * 全部生成
 */
function createAllNote(admdiv) {
	var status = Ext.getCmp("taskState").getValue();
	if(Ext.isEmpty(status)) {
		Ext.Msg.alert("系统提示", "请选择未生成状态！");
		return ;
	}
	if (admdiv == null || admdiv == "")
		return false;
	var jsonMap = {
			task_status : ["=", "" + status],
			admdiv_code : ["=", "" + admdiv]
		};
	var myMask = new Ext.LoadMask(Ext.getBody(), {
			msg : '后台正在处理中，请稍后....',
			removeMask : true
				// 完成后移除
			});
		myMask.show();
		Ext.Ajax.request({
			url : '/realware/loadPayVouchers2Note.do',
			method : 'POST',
			timeout : 600000, // 设置为10分钟
			params : {
				jsonMap : JSON.stringify([jsonMap]),
				admdiv_code : admdiv,
				filedNames : JSON.stringify(vouFileds),
				menu_id :  Ext.PageUtil.getMenuId()
			},
			success : function(response, options) {
				myMask.hide();
				var json = (new Function("return " + response.responseText))();
				Ext.widget('window', {
					id : 'createWindow1',
					title : '生成入账通知单',
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
							id:'createNoteOK',
							text : '确定',
							handler : function() {
								if (this.up('form').getForm().isValid()) {
									if (records == null || records.length == 0) {
										Ext.Msg.alert("系统提示","当前没有需要生成入账通知单的支付凭证信息！");
										return;
									}
									Ext.getCmp('createNoteOK').disable(false);
									var reqIds = [];
									var reqVers = [];
									for(var i =0; i <records.length;i++){
											reqIds.push(records[i].pay_voucher_id);
											reqVers.push(records[i].last_ver);
									}
									myMask.show();
									Ext.Ajax.request({
										url : '/realware/createAllNote.do',
										method : 'POST',
										timeout : 180000, // 设置为3分钟
										params : {
											jsonMap : JSON.stringify([jsonMap]),
											admdiv_code : admdiv,
											filedNames : JSON.stringify(vouFileds),
											menu_id : Ext.PageUtil.getMenuId()
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
											refreshData();
											myMask.hide();
											Ext.getCmp("createWindow1").close();
											var reqst = response.status;
											var getText = response.responseText;
											if (reqst == "-1") {// 超时的状况码为 -1
												Ext.Msg
														.alert("系统提示",
																"入账通知单成超时，可能存在网络异常，检查后请重试...");
											} else if (getText.indexOf("无法清算") != -1) {
												var voucherNoStr = getText
														.substring(20,
																getText.length - 11);
												var msg = getText;
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
									Ext.getCmp('createNoteOK').disable(false);
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
					Ext.Msg.alert("系统提示", "入账通知单生成超时，可能存在网络异常，检查后请重试...");
				} else {
					Ext.Msg.alert("系统提示", "入账通知单生成失败，原因：" + response.responseText
									+ "！");
				}
			}

		});
}

function refreshData() {
	Ext.getCmp("accountNoteCreateQuery").getStore().loadPage(1);
}

function selectStatus(){
	var  statuId = Ext.getCmp('voucherStatus').getValue();
	if(statuId == "5" || statuId == "4"){
		Ext.StatusUtil.batchEnable('uncreate');	
	}else{
		Ext.StatusUtil.batchDisable('uncreate');	
	}
	refreshData();
}