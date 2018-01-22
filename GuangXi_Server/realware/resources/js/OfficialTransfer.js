
/*******************************************************************************
 * 主要用于支付凭证复核转账
 * 
 * @type
 */

/***
 * 引入需要使用的js文件
 */
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/recommend.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/operationLog.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/ocxVoucher.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/backVoucher.js"></scr' + 'ipt>');


var gridPanel1 = null;

/**
 * 数据项
 */
var fileds = ["pay_voucher_code", "vou_date", "pay_amount", "payee_account_no",
		"payee_account_name", "payee_account_bank", "payee_account_bank_no",
		"trans_res_msg", "pay_account_no", "pay_account_name",
		"pay_account_bank", "pay_date", "pay_bank_code", "pay_bank_name",
		"clear_bank_code", "clear_bank_name", "checkNo", "fund_deal_mode_code",
		"fund_deal_mode_name", "agency_code", "agency_name", "fund_type_code",
		"fund_type_name", "pay_type_code", "pay_type_name", "set_mode_code",
		"set_mode_name", "pay_summary_code", "pay_summary_name", "task_id",
		"pay_voucher_id", "bill_type_id", "last_ver", "return_reason"];

/**
 * 列名
 */
var header = "退票原因|return_reason|150,凭证号|pay_voucher_code|140,凭证日期|vou_date|100,支付金额|pay_amount|100,收款人账号|payee_account_no,"
		+ "收款人名称|payee_account_name|140,收款人银行|payee_account_bank|140,收款行行号|payee_account_bank_no,交易结果|trans_res_msg,"
		+ "付款人账号|pay_account_no,付款人名称|pay_account_name|140,付款人银行|pay_account_bank|140,支付日期|pay_date,代理银行编码|pay_bank_code,"
		+ "代理银行名称|pay_bank_name,清算银行编码|clear_bank_code,清算银行名称|clear_bank_name,支票号|checkNo,办理方式编码|fund_deal_mode_code,"
		+ "办理方式名称|fund_deal_mode_name,资金性质编码|fund_type_code,资金性质名称|fund_type_name,支付方式编码|pay_type_code,"
		+ "支付方式名称|pay_type_name,结算方式编码|set_mode_code,结算方式名称|set_mode_name,用途编码|pay_summary_code,"
		+ "用途名称|pay_summary_name,预算单位编码|agency_code,预算单位名称|agency_name";



/**
 * 界面加载
 */
Ext.onReady(function() {
	
	Ext.QuickTips.init();
	store1 = getStore(loadUrl, fileds);
	column1 = getColModel(header, fileds);
	var pagetool = getPageToolbar(store1);
	store1.on('beforeload', function(thiz, options,e) {
		var panel = Ext.ComponentQuery.query("panel[title='查询区']")[0];
		beforeload(panel, options, Ext.encode(fileds));
	});
	//--------------按钮区和查询区--------------
	 var buttonItems = [{
							id : 'payment',
							handler : function() {
								batchReqMoney();
							}
						}, {
							id : 'unsubmit',
							handler : function() {
							backVoucher('/realware/unsubmitVoucher.do',gridPanel1.getSelectionModel().getSelection(),"pay_voucher_id","退回初审");
							}
						},{
							id : 'repeatMoney',
							handler : function() {
								batchRepeatReqMoney();
							}
						}, {
							id : 'writeoff',
							handler : function() {
								writeoffPayVoucher();
							}
						}, {
							id : 'import',
							handler : function() {
								importVoucher(false);
							}
						}, {
							id : 'allimport',
							handler : function() {
								importVoucher(true);
							}
						}, {
							id : 'pay',
							handler : function() {
								inputPayVoucher();
							}
						}, {
							id : 'look',
							handler : function() {
								lookOCX(gridPanel1.getSelectionModel().getSelection(),"pay_voucher_id");
							}
						}, {
							id : 'log',
							handler : function() {
								taskLog(gridPanel1.getSelectionModel().getSelection(),"pay_voucher_id");
							}
						}, {
							id : 'refresh',
							handler : function() {
								refreshData();
							}
						}];
	 var queryItems=[{
						 title : "查询区",
				    	 frame : false,
				    	 defaults : {
								padding : '0 3 0 3'
							},
						 layout : {
								type : 'table',
								columns : 4
							},
						 bodyPadding : 5,
						 items : [
								{
									id : 'taskState',
									fieldLabel : '当前状态',
									xtype : 'combo',
									displayField : 'status_name',
									dataIndex : 'task_status',
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
									id : 'code',
									fieldLabel : '凭证号',
									xtype : 'textfield',
									symbol : '>=',
									dataIndex : 'pay_voucher_code'
								}, {
									id : 'codeEnd',
									fieldLabel : '至',
									xtype : 'textfield',
									symbol : '<=',
									dataIndex : 'pay_voucher_code '
								}, {
									id : 'vouDate',
									fieldLabel : '凭证日期',
									xtype : 'datefield',
									dataIndex : 'vou_date',
									format : 'Y-m-d'
								}, {
									id : 'checkNo1',
									fieldLabel : '支票号',
									xtype : 'textfield',
									dataIndex : 'checkNo'
								}
						     ],
						 flex : 2
					},{
						id : 'OfficialTransferCreateQuery',
						xtype : 'gridpanel',
						height : document.documentElement.scrollHeight - 118,
						frame : false,
						multiSelect : true,
						viewConfig : {
							shrinkWrap : 0,
							hasLoadingHeight : true
						},
						title : '公务卡列表信息',
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
			Ext.getCmp('taskState').setValue("004");
		});
	 gridPanel1 = Ext.getCmp('OfficialTransferCreateQuery');
});

/**
 * 请款申请
 */
function batchReqMoney() {
	var records = gridPanel1.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请至少选中一条凭证信息");
		return;
	}
	// 凭证主键字符串
	var reqIds = [];
	var reqVers = [];

	for (var i = 0; i < records.length; i++) {
		reqIds.push(records[i].get("pay_voucher_id"));
		reqVers.push(records[i].get("last_ver"));
	}
	var bill_type_id = records[0].get("bill_type_id");
	var myMask = new Ext.LoadMask(Ext.getBody(), {
		msg : '后台正在处理中，请稍后....',
		removeMask : true
			// 完成后移除
		});
	myMask.show();
	Ext.Ajax.request({
				url : '/realware/batchReqMoney.do',
				method : 'POST',
				timeout : 180000, // 设置为3分钟
				params : {
					// 单据类型id
					billTypeId : bill_type_id,
					billIds : Ext.encode(reqIds),
					last_vers : Ext.encode(reqVers),
					accountType : accountType,
					menu_id : Ext.PageUtil.getMenuId()
				},
				success : function(response, options) {
					succAjax(response, myMask,true,"请款成功，请务必在【已请款】状态进行【导出】处理!");
					refreshData();
				},
				failure : function(response, options) {
					failAjax(response, myMask);
					refreshData();
				}
			});
}

/*******************************************************************************
 * 再次请款
 */
function batchRepeatReqMoney() {
	var records = gridPanel1.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请至少选中一条凭证信息");
		return;
	}
	// 凭证主键字符串
	var reqIds = [];
	var reqVers = [];

	for (var i = 0; i < records.length; i++) {
		reqIds.push(records[i].get("pay_voucher_id"));
		reqVers.push(records[i].get("last_ver"));
	}
	var bill_type_id = records[0].get("bill_type_id");
	var myMask = new Ext.LoadMask(Ext.getBody(), {
		msg : '后台正在处理中，请稍后....',
		removeMask : true
			// 完成后移除
		});
	myMask.show();
	Ext.Ajax.request({
				url : '/realware/batchRepeatReqMoney.do',
				method : 'POST',
				timeout : 180000, // 设置为3分钟
				params : {
					// 单据类型id
					billTypeId : bill_type_id,
					billIds : Ext.encode(reqIds),
					last_vers : Ext.encode(reqVers),
					is_onlyreq : 1,
					accountType : accountType,
					menu_id : Ext.PageUtil.getMenuId()
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
 * 公务卡转普通支付
 */
function updateVoucher() {
	var records = gridPanel1.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请选中一条凭证信息！");
		return;
	}
	var ids = null;
	Ext.Array.each(records, function(model) {
				ids = ids + model.get("pay_voucher_id") + ",";
			});
	var myMask = new Ext.LoadMask(Ext.getBody(), {
		msg : '后台正在处理中，请稍后....',
		removeMask : true
			// 完成后移除
		});
	myMask.show();
	Ext.Ajax.request({
				url : '/realware/updatePayVoucher.do',
				method : 'POST',
				timeout : 180000, // 设置为3分钟
				params : {
					ids : ids.substring(0, ids.length - 1),
					objMap : "[{\"is_onlyreq\":0}]",
					isflow : 1,
					remark : '公务卡转普通支付',
					menu_id : Ext.PageUtil.getMenuId()
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
 * 切换状态
 * 
 * @return
 */
function selectState() {
	var taskState = Ext.getCmp('taskState').getValue();
	if ("004" == taskState) {
		Ext.StatusUtil.batchEnable("payment,unsubmit");
		Ext.StatusUtil.batchDisable("pay,import,allimport,repeatMoney,writeoff");
	} else if ("005" == taskState) {
		Ext.StatusUtil.batchEnable("import,allimport,writeoff");
		Ext.StatusUtil.batchDisable("payment,pay,repeatMoney,repeatMoney,unsubmit");
	} else if ("006" == taskState) {
		Ext.StatusUtil.batchEnable("pay,import");
		Ext.StatusUtil.batchDisable("payment,allimport,repeatMoney,writeoff,unsubmit");
	} else if ("008" == taskState) {
		Ext.StatusUtil.batchDisable("payment,pay,import,allimport,repeatMoney,writeoff,unsubmit");
	} else if ("009" == taskState) {
		Ext.StatusUtil.batchEnable("repeatMoney,unsubmit");
		Ext.StatusUtil.batchDisable("payment,pay,import,allimport,writeoff");
	} else {
		Ext.StatusUtil.batchDisable("payment,pay,import,allimport,repeatMoney,writeoff,unsubmit");
	}
}

/*******************************************************************************
 * 导出
 */
function importVoucher(all) {
	var ids = null;
	var jsonArray = [];
	var myMask = new Ext.LoadMask(Ext.getBody(), {
		msg : '后台正在处理中，请稍后....',
		removeMask : true
			// 完成后移除
		});
	if (all) {
		myMask.show();
		Ext.Ajax.request({
			url : '/realware/loadPayVoucher.do',
			method : 'POST',
			timeout : 180000, // 设置为3分钟
			params : {
				filedNames : JSON.stringify(fileds),
				jsonMap : "[{\"account_type_right\":[\"=\",\"" + account_type_right + "\"],\"admdiv_code\":[\"=\",\"" + Ext.getCmp("admdiv").getValue() + "\"],\"business_type\":[\"=\",0],\"is_onlyreq\":[\"=\",1],\"task_state\":[\"=\",\"001\"],\"batchreq_status\":[\"=\",1],\"is_import\":[\"=\",0]}]",
				start : 0,
				page : 1,
				limit : 100000,
				menu_id : Ext.PageUtil.getMenuId()
			},
			success : function(response, options) {
				myMask.hide();
				var records = (new Function("return" + response.responseText))().root;
				if (records.length == 0) {
					Ext.Msg.alert("系统提示", "没有可导出的数据！");
					return;
				}
				Ext.Array.each(records, function(model) {
						jsonArray.push("01|" + model.pay_account_no + "|"
								+ model.pay_account_name + "|"
								+ model.payee_account_no + "|"
								+ model.payee_account_name + "|"
								+ model.payee_account_bank_no + "|"
								+ model.payee_account_bank + "|"
								+ model.pay_amount + "|"
								+ model.pay_summary_name + "|0703|"
								+ model.pay_voucher_code);
						ids = ids + model.pay_voucher_id + ",";
				});
				editVoucher(jsonArray, ids,records,records[0].bill_type_id);
			}
		});
	} else {
		var _records = gridPanel1.getSelectionModel().getSelection();
		if (_records.length == 0) {
			Ext.Msg.alert("系统提示", "请选中一条凭证信息！");
			return;
		}
		var records = [];
		Ext.Array.each(_records, function(model) {
			records.push(model.raw);
		});
		Ext.Array.each(records, function(model) {
				jsonArray.push("01|" + model.pay_account_no + "|"
						+ model.pay_account_name + "|"
						+ model.payee_account_no + "|"
						+ model.payee_account_name + "|"
						+ model.payee_account_bank_no + "|"
						+ model.payee_account_bank + "|"
						+ model.pay_amount + "|"
						+ model.pay_summary_name + "|0703|"
						+ model.pay_voucher_code);
				ids = ids + model.pay_voucher_id + ",";
		});
		editVoucher(jsonArray, ids,records,records[0].bill_type_id);
	}

}
/**
 * 
 * @param jsonArray
 * @param ids
 * @param records
 * @param billTypeId
 * @param inputFlag  是否需要导入标志，不需要导入，则置转账标志；需要导入，则不在这里置
 * @return
 */
function editVoucher(jsonArray, ids,records,billTypeId) {
	var taskState = Ext.getCmp('taskState').getValue();
	if(taskState != "005") {
		hiddenForm("/realware/importPayVoucher.do", {jsonArray : jsonArray});
	} else {
		var reqIds = [];
		var reqVers = [];
		var jsonMap = [];
		for (var i = 0; i < records.length; i++) {
			reqIds.push(records[i].pay_voucher_id);
			reqVers.push(records[i].last_ver);
			jsonMap.push({
				id : "" + records[i].pay_voucher_id, 
				bankNo : "" + records[i].payee_account_bank_no, 
				is_onlyreq : "1",
				is_import : "1",
				business_type : "1"
			});
		}
		Ext.Ajax.request({
			url : '/realware/updatePayVoucher.do',
			waitMsg : '后台正在处理中,请稍后....',
			method : 'POST',
			timeout : 180000, // 设置为3分钟
			async : true,// 添加该属性即可同步,
			params : {
				billTypeId : billTypeId,
				billIds :  JSON.stringify(reqIds),
				last_vers : JSON.stringify(reqVers),
				isflow : "1", 
				jsonMap : JSON.stringify(jsonMap),
				menu_id : Ext.PageUtil.getMenuId(),
				controleDays : "1",
				//是否更新支付日期
				isUpdatePayDate : "1"
			},
			success : function(response, options) {
				if(response.status == 200) {
					hiddenForm("/realware/importPayVoucher.do", {jsonArray : jsonArray});
				} else {
					Ext.Msg.alert("系统提示", response.responseText);
				}
				refreshData();
			},
			failure : function(response, options) {
				Ext.Msg.alert("系统提示", response.responseText);
				refreshData();
			}
		});
	}
	
}

function unimportVoucher() {
	var records = gridPanel1.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请选中一条凭证信息！");
		return;
	}
	var ids = null;
	Ext.Array.each(records, function(model) {
				ids = ids + model.get("pay_voucher_id") + ",";
			});
	var myMask = new Ext.LoadMask(Ext.getBody(), {
		msg : '后台正在处理中，请稍后....',
		removeMask : true
			// 完成后移除
		});
	myMask.show();
	Ext.Ajax.request({
				url : '/realware/updatePayVoucher.do',
				method : 'POST',
				timeout : 180000, // 设置为3分钟
				params : {
					ids : ids.substring(0, ids.length - 1),
					objMap : "[{\"is_import\":0},{\"trans_res_msg\":null}]",
					menu_id : Ext.PageUtil.getMenuId()
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

/**
 * 导入，完成支付
 */
function inputPayVoucher() {
	Ext.widget('window', {
		title : '导入对话框',
		id : 'uploadWindow',
		width : 380,
		height : 100,
		modal : true,
		layout : 'fit',
		resizable : false,
		items : Ext.widget('form', {
			layout : 'form',
			fileUpload : true,
			items : [{
						name : 'file',
						fieldLabel : '文件(.txt格式)',
						xtype : 'filefield',
						id : 'uploadfilename',
						allowBlank : false,
						blankText : "请选择您要导入的.txt文件",
						buttonText : '选择文件...'
					}],
			buttons : [{
				text : '导入',
				formBind : true,
				handler : function() {
					var form = this.up('form').getForm();
					if (form.isValid()) {
						if (!Ext.getCmp("uploadfilename").getValue()
								.match(".txt$")) {
							Ext.Msg.show({
										title : '提示',
										msg : "请选择.txt文件上传!",
										buttons : Ext.Msg.OK,
										icon : Ext.MessageBox.ERROR
									});
							return;
						};
						form.submit({
									url : '/realware/inputPayVoucher.do',
									method : 'POST',
									timeout : 180000, // 设置为3分钟
									waitTitle : '提示',
									waitMsg : '正在导入文件，请您耐心等候...',
									success : function(form, action) {
										succForm(form, action);
										Ext.getCmp("uploadWindow").close();
										refreshData();
									},
									failure : function(form, action) {
										failForm(form, action);
									}
								});
					}
				}
			}, {
				text : '取消',
				handler : function() {
					this.up('form').getForm().reset();
					this.up('window').close();
				}
			}]
		})
	}).show();
}

/**
 * 冲销凭证
 */
function writeoffPayVoucher() {
	var records = gridPanel1.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请至少选中一条凭证信息");
		return;
	}
	// 凭证主键字符串
	var reqIds = [];
	var reqVers = [];
	for (var i = 0; i < records.length; i++) {
		reqIds.push(records[i].get("pay_voucher_id"));
		reqVers.push(records[i].get("last_ver"));
	}
	var bill_type_id = records[0].get("bill_type_id");
	var myMask = new Ext.LoadMask(Ext.getBody(), {
		msg : '后台正在处理中，请稍后....',
		removeMask : true
			// 完成后移除
		});
	myMask.show();
	Ext.Ajax.request({
				url : '/realware/writeoffVoucher.do',
				method : 'POST',
				timeout : 180000, // 设置为3分钟
				params : {
					// 单据类型id
					billTypeId : bill_type_id,
					last_vers : Ext.encode(reqVers),
					billIds : Ext.encode(reqIds),
					menu_id : Ext.PageUtil.getMenuId()
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

function hiddenForm(url, fields){
    var body = Ext.getBody(),
    frame = body.createChild({
        tag:'iframe',
        cls:'x-hidden',
        id:'hiddenform-iframe',
        name:'hiddenform-iframe'
    }),
    form = body.createChild({
        tag:'form',
        cls:'x-hidden',
        id:'hiddenform-form',
        action: url,
        method : 'post',
        target : Ext.isIE ? 'hiddenform-iframe' : '_blank'
    });
    
    for(var el in fields) {
    	var _el = form.createChild({
            tag:'input',
            type:'text',
            cls:'x-hidden',
            id: 'hiddenform-' + el,
            name: el
        });
    	document.getElementById("hiddenform-" + el).value = Ext.encode(fields[el]);
    }

    form.dom.submit();
    form.remove();
    frame.remove();
}
