/*******************************************************************************
 * 主要用于划款凭证生成
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
var fileds1 = ["admdiv_code","pay_voucher_code", "vou_date", "pay_amount",
		"payee_account_no", "payee_account_name", "payee_account_bank",  
		"payee_account_bank_no", "pay_account_no", "pay_account_name",
		"pay_account_bank", "pay_bank_code", "pay_bank_name",
		"clear_bank_code", "clear_bank_name", "checkNo", "fund_deal_mode_code",
		"fund_deal_mode_name", "fund_type_code", "fund_type_name",
		"pay_type_code", "pay_type_name", "set_mode_code", "set_mode_name",
		"pay_summary_code", "pay_summary_name", "task_id", "pay_voucher_id",
		"bill_type_id", "last_ver", "pay_bank_no","vt_code","pay_date"];


var header1 = "凭证号|pay_voucher_code|130,凭证日期|vou_date|100,支付金额|pay_amount|120,收款人账号|payee_account_no|130,"
		+ "收款人名称|payee_account_name|140,收款人银行|payee_account_bank|140,收款行行号|payee_account_bank_no,"
		+ "付款人账号|pay_account_no,付款人名称|pay_account_name|140,付款人银行|pay_account_bank|140,代理银行行号|pay_bank_no,"
		+ "代理银行名称|pay_bank_name,清算银行编码|clear_bank_code,清算银行名称|clear_bank_name,支票号|checkNo,办理方式编码|fund_deal_mode_code,"
		+ "办理方式名称|fund_deal_mode_name,资金性质编码|fund_type_code,资金性质名称|fund_type_name,支付方式编码|pay_type_code,"
		+ "支付方式名称|pay_type_name,结算方式编码|set_mode_code,结算方式名称|set_mode_name,用途编码|pay_summary_code,"
		+ "用途名称|pay_summary_name,支付日期|pay_date|140";
		
// 不能生成划款单的凭证列表面板
var errorVoucherPanel = null;

var fileds = ["admdiv_code","pay_voucher_code", "vou_date", "pay_amount", "payee_account_no",
      		"payee_account_name", "payee_account_bank", "payee_account_bank_no",
    		"pay_account_no", "pay_account_name", "pay_account_bank",
    		"pay_bank_code", "pay_bank_name", "clear_bank_code", "clear_bank_name",
    		"checkNo", "fund_deal_mode_code", "fund_deal_mode_name",
    		"fund_type_code", "fund_type_name", "pay_type_code", "pay_type_name",
    		"set_mode_code", "set_mode_name", "pay_summary_code",
    		"pay_summary_name", "task_id", "pay_voucher_id", "bill_type_id", "last_ver","vt_code","pay_date"];

var header = "凭证号|pay_voucher_code|140,凭证日期|vou_date|100,支付金额|pay_amount|120,收款人账号|payee_account_no,"
	+ "收款人名称|payee_account_name|140,收款人银行|payee_account_bank|140,收款行行号|payee_account_bank_no,"
	+ "付款人账号|pay_account_no,付款人名称|pay_account_name|140,付款人银行|pay_account_bank|140,代理银行编码|pay_bank_code,"
	+ "代理银行名称|pay_bank_name,清算银行编码|clear_bank_code,清算银行名称|clear_bank_name,支票号|checkNo,办理方式编码|fund_deal_mode_code,"
	+ "办理方式名称|fund_deal_mode_name,资金性质编码|fund_type_code,资金性质名称|fund_type_name,支付方式编码|pay_type_code,"
	+ "支付方式名称|pay_type_name,结算方式编码|set_mode_code,结算方式名称|set_mode_name,用途编码|pay_summary_code,"
	+ "用途名称|pay_summary_name,支付日期|pay_date|140";
		

// 划款凭证信息
var clearFileds = ["admdiv_code","pay_clear_voucher_code", "pay_amount", "agent_account_no",
		"agent_account_name", "agent_bank_name", "clear_account_no",
		"clear_account_name", "clear_bank_name", "fund_type_code",
		"fund_type_name", "pay_type_code", "pay_type_name", "pay_bank_no",
		"pay_bank_name", "clear_date", "confirm_date", "bgt_type_code",
		"bgt_type_name", "pay_clear_voucher_id", "bill_type_id", "task_id",
		"last_ver","vt_code","year"];

var clearHeader = "查看支付凭证|do1|130|lookPayVoucher,凭证号|pay_clear_voucher_code|130,金额|pay_amount|120,收款银行账号|agent_account_no|150,收款银行账户名称|agent_account_name|150,收款银行名称|agent_bank_name|150,"
		+ "付款银行账号|clear_account_no|150,付款银行账户名称|clear_account_name|150,付款银行名称|clear_bank_name|150,资金性质编码|fund_type_code,资金性质名称|fund_type_name,"
		+ "支付方式编码|pay_type_code,支付方式名称|pay_type_name,代理银行行号|pay_bank_no,代理银行名称|pay_bank_name,清算日期|clear_date,回单日期|confirm_date,"
		+ "预算类型编码|bgt_type_code,预算类型名称|bgt_type_name";

// 划款凭证列表面板
var clearPanel = null;

/*******************************************************************************
 * 初始化
 */
Ext.onReady(function() {
	// 初始化Ext.QuickTips，启用悬浮提示
	Ext.QuickTips.init();
	store1 = getStore("loadPayVoucherss.do", fileds);
	column1 = getColModel(header, fileds);
	store2 = getStore("loadClearPayVoucher.do", clearFileds);
	column2 = getColModel(clearHeader, clearFileds);
	var pagetool = getPageToolbar(store1);
	store1.on('beforeload', function(thiz, options,e) {
		var panel = Ext.ComponentQuery.query("panel[title='查询区']")[0];
		beforeload(panel, options, Ext.encode(fileds));
	});
	store2.on('beforeload', function(thiz, options,e) {
		var panel = Ext.ComponentQuery.query("panel[title='查询区']")[0];
		beforeload(panel, options, Ext.encode(clearFileds));
	});
	var buttonItems = [{
						id : 'import',
						handler : function() {
							importVoucher();
						}
					}, {
						id : 'createByGroup',
						handler : function() {
							var admdiv_code = Ext.getCmp('admdiv').getValue();
							createVoucher('createClearVoucher.do',admdiv_code, 1);
						}
					}, {
						id : 'createRequest',
						handler : function() {
							var admdiv_code = Ext.getCmp('admdiv').getValue();
							clearRequest(admdiv_code);
						}
					}, {
						id : 'create',
						handler : function() {
							var admdiv_code = Ext.getCmp('admdiv').getValue();
							createVoucher('createClearVoucher.do',admdiv_code);
						}
					},{
						id : 'eliminate',
						handler : function() {
							eliminateVoucher();
						}
					}, {
						id : 'uneliminate',
						handler : function() {
							uneliminateVoucher();
						}
					}, 
					{
						id : 'delete',
						handler : function() {
							deleteClearVoucher();
						}
					}, 
					{
						id : 'uncreate',
						handler : function() {
							uncreateVoucher();
						}
					}, {
						id : 'print',
						handler : function() {
							var records = Ext.getCmp("clearVoucherCreateQuery").getSelectionModel().getSelection();
							if (records.length == 0) {
								Ext.Msg.alert("系统提示", "请选择数据！");
								return;
							}
							var taskState = Ext.getCmp('taskState').getValue();
							if("003" == taskState){
								printPageVoucherByXml(records,"pay_clear_voucher_id","pay_clear_voucher_code",records[0].get("vt_code"));
							}else{
								printPageVoucherByXml(records,"pay_voucher_id","pay_voucher_code",records[0].get("vt_code"));
							}	
						}
					},{
				
						id : 'log',
						handler : function() {
							var taskState = Ext.getCmp('taskState').getValue();
							var idName="";
							if("003" == taskState){
								idName="pay_clear_voucher_id";
							}else{
								idName="pay_voucher_id";
							}										
							taskLog(Ext.getCmp("clearVoucherCreateQuery").getSelectionModel().getSelection(),idName);
						}
					}, 
					{
						id: 'setPayTime',
						handler: function(){
							setPayTimeDialog();
						}
						
					},
					{
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
							columns : 4
						},
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
									id : 'startcreateDate',
									fieldLabel : '生成日期',
									xtype : 'datefield',
									dataIndex : 'create_date ',
									format : 'Ymd',
									labelWidth : 60,
									width : 160,
									symbol:'>=',
									data_type:'date',
									disabled : true
								},{
									id : 'endcreateDate',
									fieldLabel : '至',
									xtype : 'datefield',
									dataIndex : 'create_date',
									format : 'Ymd',
									labelWidth : 15,
									width : 115,
									symbol:'<=',
									maxValue : new Date(),
									data_type:'date',
									disabled : true
								}, {
									id : 'code',
									fieldLabel : '凭证号',
									xtype : 'textfield',
									symbol : '>=',
									labelWidth : 60,
									width : 200,
									dataIndex : 'pay_voucher_code '
								}, {
									id : 'codeEnd',
									fieldLabel : '至',
									xtype : 'textfield',
									labelWidth : 60,
									width : 200,
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
					}, {
						id : 'clearVoucherCreateQuery',
						xtype : 'gridpanel',
						height : document.documentElement.scrollHeight - 118,
						frame : false,
						multiSelect : true,
						ignoreAddLockedColumn : true,
						frameHeader : false,
						viewConfig : {
							/**
							 * hasLoadingHeight设置为true会在chrome下造成多次刷新时列错位现象
							 * 判断浏览器类型，设置hasLoadingHeight属性
							 */
							shrinkWrap : 0,
							hasLoadingHeight : Ext.isIE
						},
						lockedViewConfig : {
							frame : false,
							shrinkWrap : 0,
							hasLoadingHeight : Ext.isIE
						},
						title : '未生成划款凭证列表信息',
						selType : 'checkboxmodel',
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
function selectState(combo, newValue, oldValue, eOpts) {
	var replaceIndex = function(target, src, dst) {
		var dataIndex = Ext.getCmp(target).dataIndex;
		Ext.getCmp(target).dataIndex = dataIndex.replace(src, dst);
	};
	var grid = Ext.getCmp("clearVoucherCreateQuery");
	var pager = Ext.ComponentQuery.query("pagingtoolbar")[0];
	if ("001" == newValue) {   //未生成
		Ext.StatusUtil.batchEnable("createRequest,createByGroup,create,eliminate,import,log,delete");
		Ext.StatusUtil.batchDisable("uneliminate,uncreate,print");
		// 重新绑定grid
		if(oldValue) {
			Ext.suspendLayouts();
			grid.setTitle("未生成划款凭证列表信息");
			if(oldValue != '002') {
				grid.reconfigure(store1, column1);
				// 重新绑定分页工具栏
				pager.bind(store1);
			}
			Ext.resumeLayouts(true);
			Ext.getCmp("startcreateDate").setValue("").disable();
			Ext.getCmp("endcreateDate").setValue("").disable();
		}
		replaceIndex("code", "pay_clear_voucher_code", "pay_voucher_code");
		replaceIndex("codeEnd", "pay_clear_voucher_code", "pay_voucher_code");
	} else if ("002" == newValue) {    //已剔除
		Ext.StatusUtil.batchEnable("uneliminate,log,delete");
		Ext.StatusUtil.batchDisable("createRequest,createByGroup,create,eliminate,import,uncreate,print");
		Ext.suspendLayouts();
		grid.setTitle("已剔除划款凭证列表信息");
		if(oldValue != '001') {
			grid.reconfigure(store1, column1);
			// 重新绑定分页工具栏
			pager.bind(store1);
		}
		Ext.resumeLayouts(true);
		replaceIndex("code", "pay_clear_voucher_code", "pay_voucher_code");
		replaceIndex("codeEnd", "pay_clear_voucher_code", "pay_voucher_code");
		Ext.getCmp("startcreateDate").setValue("").disable();
		Ext.getCmp("endcreateDate").setValue("").disable();
	} else if ("003" == newValue) {    //已生成
		Ext.StatusUtil.batchEnable("import,log,print,uncreate");
		Ext.StatusUtil.batchDisable("createRequest,createByGroup,create,eliminate,import,uneliminate,delete");
		Ext.suspendLayouts();
		// 重新绑定grid
		grid.setTitle("已生成划款凭证列表信息");
		grid.reconfigure(store2, column2);
		// 重新绑定分页工具栏
		pager.bind(store2);
		Ext.resumeLayouts(true);
		replaceIndex("code", "pay_voucher_code", "pay_clear_voucher_code");
		replaceIndex("codeEnd", "pay_voucher_code", "pay_clear_voucher_code");
		Ext.getCmp("startcreateDate").enable().setValue("");
		Ext.getCmp("endcreateDate").enable().setValue("");
	} 
}

/*******************************************************************************
 * 刷新
 */
function refreshData() {
	Ext.getCmp("clearVoucherCreateQuery").getStore().loadPage(1);
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

/*******************************************************************************
 * 生成划款凭证
 */
function createVoucher(URL,admdiv_code, isGroup) {
	var records = Ext.getCmp("clearVoucherCreateQuery").getSelectionModel().getSelection();
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
	var clearVoucherConds = {
			task_status : ["=", "" + status],
			admdiv_code : ["=", "" + admdiv_code]
		};
	Ext.Ajax.request({
		url : "queryClearData.do",
		method : 'POST',
		params : {
			jsonMap : JSON.stringify([clearVoucherConds]),
			menu_id :  Ext.PageUtil.getMenuId()
		},
		success : function(response, options) {
			myMask.hide();
			var json = (new Function("return " + response.responseText))();
			Ext.widget('window', {
				id : 'createWindow1',
				title : '生成划款凭证',
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
						id:'createClearVoucherOK',
						text : '确定',
						handler : function() {
							if (this.up('form').getForm().isValid()) {
								if (Ext.getCmp("num").getValue() == 0 ||
										Ext.getCmp("num").getValue() == "") {
									Ext.Msg.alert("系统提示","当前没有需要生成划款单的支付凭证信息！");
									return;
								}
								Ext.getCmp('createClearVoucherOK').disable(false);
								myMask.show();
								var isTask = Ext.ComponentQuery.query("button[id=createRequest]{isVisible(true)}").length;
								Ext.Ajax.request({
									url : URL,
									timeout : 600000, // 设置为10分钟
									method : 'POST',
									params : {
										jsonMap : JSON.stringify([clearVoucherConds]),
										menu_id :  Ext.PageUtil.getMenuId(),
										isTask : isTask,
										isGroup : isGroup || 0
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
										if (reqst == "-1" || response.timedout == true) {// 超时的状况码为 -1
											Ext.Msg
													.alert("系统提示",
															"划款生成超时，可能存在网络异常，检查后请重试...");
										} else if (getText.indexOf("无法清算") != -1) {
											var voucherNoStrs = getText.split("|");
											var voucherNoStr = voucherNoStrs[1];
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
												Ext.Msg.buttonText.ok = "确定";
												if (id == "ok") {
													lookErrorVoucher(voucherNoStr);
												}
											}
										} else {
											Ext.Msg.alert("系统提示",
													response.responseText);
										}
									}
								});
								Ext.getCmp('createClearVoucherOK').disable(false);
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
			Ext.getCmp("amt").setValue(json.AMT);
			Ext.getCmp("num").setValue(json.NUM);
		},
		failure : function(response, options) {
			myMask.hide();
			var reqst = response.status;
			if (reqst == "-1") {// 超时的状况码为 -1
				Ext.Msg.alert("系统提示", "划款生成超时，可能存在网络异常，检查后请重试...");
			} else {
				Ext.Msg.alert("系统提示", "划款生成失败，原因：" + response.responseText
								+ "！");
			}
		}

	});

}

/**
 * 剔除划款凭证
 * @return
 */
function eliminateVoucher() {
    var records = Ext.getCmp("clearVoucherCreateQuery").getSelectionModel().getSelection();
    if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请选择待处理的数据！");
		return;
	}
	var reqIds = [];
	var reqVers = [];
	Ext.Array.each(records,function(model){
			reqIds.push(model.get("pay_voucher_id"));
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
				url : 'eliminateVoucher.do',
				method : 'POST',
				timeout : 180000, // 设置为3分钟
				params : {
					billTypeId : bill_type_id,
					billIds : Ext.encode(reqIds),
					last_vers : Ext.encode(reqVers),
					menu_id :  Ext.PageUtil.getMenuId()
				},
				//提交成功的回调函数
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

/**
 * 撤消剔除划款凭证
 * @return
 */
function uneliminateVoucher() {
    var records = Ext.getCmp("clearVoucherCreateQuery").getSelectionModel().getSelection();
    if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请选择待处理的数据！");
		return;
	}
	var reqIds = [];
	var reqVers = [];
	Ext.Array.each(records,function(model){
			reqIds.push(model.get("pay_voucher_id"));
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
				url : 'uneliminateVoucher.do',
				method : 'POST',
				timeout : 180000, // 设置为3分钟
				params : {
					billTypeId : bill_type_id,
					billIds : Ext.encode(reqIds),
					last_vers : Ext.encode(reqVers),
					menu_id :  Ext.PageUtil.getMenuId()
				},
				//提交成功的回调函数
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

/**
 * 剔除生成失败的划款凭证
 * @return
 */
function eliminateVoucher2(voucherNo) {
    var records = errorVoucherPanel.getSelectionModel().getSelection();
    if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请选择待处理的数据！","确定");
		return;
	}
    if(voucherNo.length != 0&&voucherNo.indexOf(records)){
    	voucherNo.replace(records,"")
    }
	var reqIds = [];
	var reqVers = [];
	Ext.Array.each(records,function(model){
			reqIds.push(model.get("pay_voucher_id"));
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
				url : 'eliminateVoucher.do',
				method : 'POST',
				timeout : 180000, // 设置为3分钟
				params : {
					billTypeId : bill_type_id,
					billIds : Ext.encode(reqIds),
					last_vers : Ext.encode(reqVers),
					menu_id :  Ext.PageUtil.getMenuId()
				},
				//提交成功的回调函数
				success : function(response, options) {
					succAjax(response, myMask,true);
					getErrorPayVoucher(voucherNo);
//					errorVoucherPanel.getStore().load();
				},
				// 提交失败的回调函数
				failure : function(response, options) {
					failAjax(response, myMask);
					refreshData();
				}
			});
}
/**
 * (黑龙江特殊需求)删除授权导入的(正逆向划款)凭证(主单及明细)注：授权导入的数据字段vou_date该字段为空正常的数据时不为空的
 */
function deleteClearVoucher(){
	var records = Ext.getCmp("clearVoucherCreateQuery").getSelectionModel().getSelection();
    if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请选择要删除的授权数据！");
		return;
	}
	var reqIds = [];
	var reqVers = [];
	var flag = false;
	Ext.Array.each(records, function(model) {
				reqIds.push(model.get("pay_voucher_id"));
				reqVers.push(model.get("last_ver"));
				vouch_date = model.get("vou_date");
				if((model.get("vt_code")!="8202")&&(model.get("vt_code")!="2204") || !Ext.isEmpty(vouch_date))   {
					flag = true;
				}
				// 
			});
	if(flag){
		Ext.Msg.alert("系统提示", "您删除的数据中包含不是授权8202或2204导入的数据请检查！");
		return;
	}
	var myMask = new Ext.LoadMask(Ext.getBody(), {
		msg : '后台正在处理中，请稍后....',
		removeMask : true
		});
	myMask.show();
	Ext.Ajax.request({
				url : '/realware/delClearVoucher.do',
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
 * 导入支付凭证
 */
function importVoucher(){
	Ext.widget('window', {
				id : 'queryWindow',
				title : '导入支付凭证',
				width : 280,
				height : 100,
				layout : 'fit',
				resizable : true,
				modal : true,
				items :Ext.widget('form', {
					id : 'queryForm',
					layout : {
						type : 'vbox',
						align : 'stretch'
					},
					border : false,
					bodyPadding : 5,
					items : [{
							id : 'clearDate',
							fieldLabel : '清算日期',
							xtype : 'datefield',
							dataIndex : 'create_date',
							format : 'Y-m-d',
							showToday: false,
							value:new Date(),
							labelWidth : 66
					}],
					buttons : [{
						id : 'dr',
						text : '导入',
						scale : 'small',
						handler : function() {
							var admdivCode = Ext.getCmp('admdiv').getValue();
							if(Ext.isEmpty(admdivCode)) {
								Ext.Msg.alert("系统提示", "请选择财政再进行导入！");
								return ;
							}
							var date=Ext.getCmp("clearDate").getValue();
							if(Ext.isEmpty(date)){
								Ext.Msg.alert("系统提示", "请选择清算日期！");
								return ;
							}
							importVoucherOfDate(admdivCode, Todate(date));
						}
					}, {
						text : '取消',
						handler : function() {
							this.up('window').close();
						}
					}]
				})
	}).show();
} 

function importVoucherOfDate(admdivCode, date) {
	var myMask = new Ext.LoadMask(Ext.getBody(), {
			msg : '后台正在处理中，请稍后....',
			removeMask : true // 完成后移除
	});
	myMask.show();
	Ext.getCmp("dr").setDisabled(true);
	Ext.Ajax.request({
		url : 'importVoucherOfDate.do',
        method: 'POST',
		timeout:600000,  //设置为3分钟
        params : {
			vt_code : _vtCode,
			clearDate : date,
			flowType : flowType,
			admdiv : admdivCode,
			menu_id :  Ext.PageUtil.getMenuId()
		},
		success : function(response, options) {
			succAjax(response, myMask);
			Ext.getCmp("dr").setDisabled(true);
			Ext.getCmp("queryWindow").close();
			refreshData()
		},
		failure : function(response, options) {
			failAjax(response, myMask);
			Ext.getCmp("dr").setDisabled(false);
			//Ext.getCmp("queryWindow").close();
			refreshData()
		}
	});
}

/*******************************************************************************
 * 撤销生成
 */
function uncreateVoucher() {
	var records = Ext.getCmp("clearVoucherCreateQuery").getSelectionModel().getSelection();
    if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请选择要签章划款单的数据！");
		return;
	}
	var reqIds = [];
	var reqVers = [];
	Ext.Array.each(records, function(model) {
				reqIds.push(model.get("pay_clear_voucher_id"));
				reqVers.push(model.get("last_ver"));
			});
	var myMask = new Ext.LoadMask(Ext.getBody(), {
		msg : '后台正在处理中，请稍后....',
		removeMask : true
		});
	myMask.show();
	Ext.Ajax.request({
				url : 'unCreateClearVoucher.do',
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
 * 查看不能生成的凭证
 */
function lookErrorVoucher(voucherNo) {
	errorVoucherPanel = getGrid("loadPayVoucher.do", header, fileds, true, true,"error");
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
		        	 id : 'eli',
						text : '剔除',
						handler : function() {
							eliminateVoucher2(voucherNo);
						}
					},{
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
					filedNames : JSON.stringify(fileds),
					jsonMap : data,
					menu_id : Ext.PageUtil.getMenuId()
				}
			});
}

/*******************************************************************************
 * 申请划款，向TULIP请求划款清单文件
 * chengkai 2014-11-24 11:40:15
 * @param admdiv_code
 * @return
 */
function clearRequest(admdiv_code){
	var myMask = new Ext.LoadMask(Ext.getBody(), {
					msg : '后台正在处理中，请稍后....',
					removeMask : true // 完成后移除
	});
	myMask.show();
	var status = Ext.getCmp("taskState").getValue();
	var clearVoucherConds = {
			task_status : ["=", "" + status],
			admdiv_code : ["=", "" + admdiv_code]
		};
	// 提交到服务器操作
	Ext.Ajax.request({
				url : "clearRequest.do",
		    	method: 'POST',
				timeout:180000,  //设置为3分钟
				params : {
					jsonMap : JSON.stringify([clearVoucherConds]),
					menu_id :  Ext.PageUtil.getMenuId()
				},
				// 提交成功的回调函数
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


//回显时间
function InitTime(){
	var start_ = new Date(); 
	var end_ = new Date();
	var array=new Array(3);
	Ext.Ajax.request({
	    url: '/realware/loadAdmdivByCode.do',
	    params : {
			admdiv_code : Ext.getCmp('admdiv').getValue() //  财政编码
		},
		success : function(response, options) {
			var obj = new Function('return' + response.responseText)();// 解析json数据
			
			var startStr = obj.start_time;
			array = startStr.split(':');
			start_.setHours(array[0],array[1],array[2]);
			Ext.getCmp('startTime').setValue(start_);
			
			var endStr = obj.end_time;
			array = endStr.split(':');
			end_.setHours(array[0],array[1],array[2]);
			Ext.getCmp('endTime').setValue(end_);
			
		}
	   
	});
	
}


// 支付时间设置
var dialog;
function setPayTimeDialog(){
	var setPayTimeDialog = new Ext.FormPanel({
		id:'PayTimeForm',
	    frame:true,
	    bodyStyle:'padding:5px 5px 0 5px',
		items: [{
				xtype: 'panel',
				border: 0,
				width: 350,
				layout: 'hbox',
				bodyStyle: "background:#DFE9F6;padding:0px 0px 5px 0px"
				
				}, 
				
				new Ext.form.TimeField({
					id : 'startTime',
					format : 'G:i:s',
					increment : 60,
					fieldLabel : '日始时间',
					allowBlank : false
				}), new Ext.form.TimeField({
					id : 'endTime',
					format : 'G:i:s',
					increment : 60,
					fieldLabel : '日终时间',
					allowBlank : false
				})
				
				
				],
			buttons: [
			            {   text:'终止转账',
			            	handler:function(){
			            		stopTransferDialog();	
			            	}
			            },
			            '->',
						{
						  id: 'submit',	
	                  	  text: '确定',
	                      handler: function() {
	                    	if (this.up('form').getForm().isValid()) { 
	                    		setPayTime(this.up('window'));
								Ext.getCmp("PayTimeForm").getForm().reset();
								this.up('window').close();
							}
	                   	 }
	              	   },
					   {
	                     text: '取消',
	                     handler: function() {
	                     	this.up('window').close();
	                     }
	                   }]
		});
	InitTime(); //回显时间
	dialog=Ext.widget('window', {
		title : '设置支付时间',
		id:'PayTimeSet',
		width : 350,
		autoHeight:true,	
		layout : 'fit',
		resizable : false,
		modal : true,
		items : [ setPayTimeDialog ]
	}).show();
}
// 终止转账
function stopTransferDialog(){
	Ext.Msg.confirm('系统提示','确定要终止转账吗？',
		      function(btn){
		        	if(btn=='yes'){
			        	var myMask = new Ext.LoadMask(Ext.getBody(), {
			        		msg : '后台正在处理中，请稍后....',
			        		removeMask : true // 完成后移除
			        		
			        	});
			        	
			        	myMask.show();
			        	// 提交到服务器操作
			        	Ext.Ajax.request({
			        		url : '/realware/editTimeOfAdmdiv.do',
			        		method: 'POST',
			        		timeout:180000,  //设置为3分钟
			        		params : {
			        			admdiv_code : Ext.getCmp('admdiv').getValue() //  财政编码
			        		},
			        		// 提交成功的回调函数
			        		success : function(response, options) {
			        			succAjax(response,myMask);
			        			refreshData(); 
			        		},
			        		// 提交失败的回调函数
			        		failure : function(response, options) {	
			        			failAjax(response,myMask);
			        			refreshData();
			        		}
			        	});
		        	}
//		        	Ext.getCmp('PayTimeSet').close();
		        	dialog.close();
		        }
		 ) ;

}
	
	
// 修改日始时间 和 日终时间 	
function setPayTime(win){
	var myMask = new Ext.LoadMask(Ext.getBody(), {
		msg : '后台正在处理中，请稍后....',
		removeMask : true // 完成后移除
	});
	myMask.show();
	// 提交到服务器操作
	Ext.Ajax.request({
		url : '/realware/editTimeOfAdmdiv.do',
		method: 'POST',
		timeout:180000,  //设置为3分钟
		params : {
			admdiv_code : Ext.getCmp('admdiv').getValue(), //  财政编码
			startTime : Ext.getCmp('startTime').getValue(), // 日始时间
			endTime : Ext.getCmp('endTime').getValue()// 日终时间
			
		},
		// 提交成功的回调函数
		success : function(response, options) {
			succAjax(response,myMask);
			refreshData();
		},
		// 提交失败的回调函数
		failure : function(response, options) {
			failAjax(response,myMask);
			refreshData();
		}
	});
}	



