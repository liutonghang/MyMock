/*******************************************************************************
 * 主要用于支付凭证初审，补录行号
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

var fileds = ["payee_account_bank_no", "pay_voucher_code", "vou_date",
		"pay_amount", "payee_account_no", "payee_account_name",
		"payee_account_bank", "pay_account_no", "pay_account_name",
		"pay_account_bank", "pay_bank_code", "pay_bank_name",
		"clear_bank_code", "clear_bank_name", "checkNo", "fund_deal_mode_code",
		"fund_deal_mode_name", "fund_type_code", "fund_type_name",
		"pay_type_code", "pay_type_name", "set_mode_code", "set_mode_name",
		"pay_summary_code", "pay_summary_name", "task_id", "pay_voucher_id",
		"bill_type_id", "last_ver", "return_reason","pb_set_mode_code","pb_set_mode_name"];

/**
 * 列名
 */
var header = "退票原因|return_reason|150,收款行行号|payee_account_bank_no,行号补录|do1|100|addBankno,凭证号|pay_voucher_code|140,凭证日期|vou_date|100,支付金额|pay_amount|100,收款人账号|payee_account_no,"
		+ "收款人名称|payee_account_name|140,收款人银行|payee_account_bank|140,付款人账号|pay_account_no,付款人名称|pay_account_name|140,付款人银行|pay_account_bank|140,"
		+ "代理银行编码|pay_bank_code,代理银行名称|pay_bank_name,清算银行编码|clear_bank_code,清算银行名称|clear_bank_name,支票号|checkNo,办理方式编码|fund_deal_mode_code,"
		+ "办理方式名称|fund_deal_mode_name,资金性质编码|fund_type_code,资金性质名称|fund_type_name,支付方式编码|pay_type_code,"
		+ "支付方式名称|pay_type_name,结算方式编码|set_mode_code,结算方式名称|set_mode_name,用途编码|pay_summary_code,用途名称|pay_summary_name";

/**
 * 列表
 */
var gridPanel1 = null;

/**
 * 界面加载
 */
Ext.onReady(function() {
	//-----------------------------------------------
	Ext.QuickTips.init();
	// 引用工具类
	gridPanel1 = getGrid(loadUrl, header,fileds, true, true);
	gridPanel1.setHeight(document.documentElement.scrollHeight - 95);
	gridPanel1.getStore().on('beforeload', function(thiz, options,e) {
		var admdiv = Ext.getCmp('admdiv').getValue();
		if (admdiv == null || admdiv == "")
			return;
		beforeload(Ext.getCmp("OfficialCheckCreateQuery"), options, Ext.encode(fileds));
	});
	//--------------按钮区和查询区--------------
	gridPanel1.title = '公务卡初审';
	 var buttonItems = [
	                    {
							id : 'audit',
							handler : function() {
								checkVoucher(true);
							}
						}, {
							id : 'unofficial',
							handler : function() {
								updateVoucher();
							}
						},{
							id : 'submit',
							handler : function() {
									checkVoucher(false);
								}
						}, {
							id:'look',
							handler : function() {
								lookOCX(gridPanel1.getSelectionModel().getSelection(),"pay_voucher_id");
							}
						}, {
							id:'log',
							handler : function() {
								taskLog(gridPanel1.getSelectionModel().getSelection(),"pay_voucher_id");
							}
						}, {
							id:'refresh',
							handler : function() {
								refreshData();
							}
						}
						];
	 
	 var queryItems=[
	                 {
	                   title : "查询区",
                	   id : 'OfficialCheckCreateQuery',
					   frame : false,
					   bodyPadding : 8,
					   layout : 'hbox',
					   defaults : {
						margins : '3 5 0 0'
					   },
					   items : [
					         {
					        	id : 'taskState',
								fieldLabel : '当前状态',
								xtype : 'combo',
								displayField : 'status_name',
								dataIndex : 'task_status',
								emptyText : '请选择',
								labelWidth : 60,
								width : 160,
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
								labelWidth : 60,
								width : 160,
								emptyText : '请选择',
								valueField : 'admdiv_code',
								editable : false,
								store : comboAdmdiv
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
								dataIndex : 'pay_voucher_code '
							}, {

								id : 'vouDate',
								fieldLabel : '凭证日期',
								xtype : 'datefield',
								labelWidth : 60,
								width : 160,
								format : 'Y-m-d',
								dataIndex : 'vou_date'
							}, {
								id : 'checkNo1',
								fieldLabel : '支票号',
								xtype : 'textfield',
								dataIndex : 'checkNo',
								labelWidth : 45,
								width : 140
							}
					         ]} , gridPanel1];
	 //画页面
	 Ext.StatusUtil.createViewport(buttonItems, queryItems, function() {
			Ext.StatusUtil.initPage(Ext.getCmp("admdiv"), Ext.getCmp("taskState"));
			// 默认设置为未生成
			Ext.getCmp('taskState').setValue("001");
		});
	//-------------------------------------------------

	
	});

/*******************************************************************************
 * 行号补录
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
var rowIndex1 = null;

var bankWin = null;

function addBankno(grid, rowIndex, colIndex, node, e, record, rowEl) {
	var b = true;
	rowIndex1 = rowIndex;
	var bankStore = Ext.create('Ext.data.Store', {
				fields : [{
							name : 'bankname'
						}, {
							name : 'bankno'
						}],
				proxy : {
					type : 'ajax',
					url : '/realware/loadOfficialBankNo.do',
					reader : {
						type : 'json'
					}
				},
				autoLoad : true
			});
	if (bankWin == null) {
		bankWin = Ext.create('Ext.window.Window', {
			title : '行号补录对话框',
			width : 380,
			height : 300,
			layout : 'fit',
			resizable : false,
			closeAction : 'hide',
			modal : true,
			items : [new Ext.FormPanel({
				border : 0,
				bodyPadding : 0,
				items : [{
					xtype : 'gridpanel',
					id : 'gridBankno',
					viewConfig : {
						enableTextSelection : true
					},
					store : bankStore,
					columns : [{
								text : '银行行号',
								dataIndex : 'bankno',
								width : '190',
								align : 'center'

							}, {
								text : '银行名称',
								dataIndex : 'bankname',
								width : '190',
								align : 'center'
							}],
					height : 240,
					listeners : {
						'itemdblclick' : function(view, record, item, index, e) {
							var bankNo = record.get("bankno");
							grid.getStore().data.items[rowIndex1].set(
									"payee_account_bank_no", bankNo);
							this.up('window').hide();
						}
					}
				}],
				buttons : [{
					text : '确定',
					handler : function() {
						var records = Ext.getCmp('gridBankno')
								.getSelectionModel().getSelection();
						if (records.length == 0)
							return;
						grid.getStore().data.items[rowIndex1].set(
								"payee_account_bank_no", records[0]
										.get("bankno"));
						this.up('window').hide();
					}
				}, {
					text : '取消',
					handler : function() {
						this.up('window').hide();
					}
				}]
			})]
		});
	}
	Ext.getCmp("gridBankno").getSelectionModel().select(0);
	bankWin.show();
}

/*******************************************************************************
 * 切换状态（初审）
 * 
 * @return
 */
function selectState() {
	var taskState = Ext.getCmp('taskState').getValue();
	if ("001" == taskState) {
		gridPanel1.down('#myActionColumn').show();
		Ext.StatusUtil.batchEnable("audit,unofficial");
		Ext.StatusUtil.batchDisable("submit");
	} else if ("002" == taskState) {
		gridPanel1.down('#myActionColumn').hide();
		Ext.StatusUtil.batchDisable("submit,audit,unofficial");
	}else if ("009" == taskState) {
		gridPanel1.down('#myActionColumn').hide();
		Ext.StatusUtil.batchEnable("submit,unofficial");
		Ext.StatusUtil.batchDisable("audit");
	}
	else {
		gridPanel1.down('#myActionColumn').hide();
		Ext.StatusUtil.batchDisable("audit,unofficial,submit");
	}
}

/*******************************************************************************
 * 初审
 * 
 * @return
 */
function checkVoucher(isReturn) {
	var records = gridPanel1.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请选中一条凭证信息！");
		return;
	}
	var ajaxBool = true;
	var jsonMap = "[";
	var reqIds = []; 
	var reqVers = [];
	var bankTypeCode="";   //代理银行结算方式编码
	var bankTypeName="";   //代理银行结算方式名称
	Ext.Array.each(records, function(model) {
				var payeeAcctBankno = model.get("payee_account_bank_no");
				if (null == payeeAcctBankno || "" == payeeAcctBankno) {
					Ext.Msg.alert("系统提示", "凭证号：" + model.get("pay_voucher_code") + ",请先补录行号再进行初审操作！");
					ajaxBool = false;
				}
				jsonMap += "{\"id\":\"" + model.get("pay_voucher_id")+"\",\"bankNo\":\"" + payeeAcctBankno+"\",\"setModeCode\":\"" +  model.get("pb_set_mode_code") +"\",\"setModeName\":\"" + model.get("pb_set_mode_name") + "\"},";
				reqIds.push(model.get("pay_voucher_id"));
				reqVers.push(model.get("last_ver"));
				//默认设置
				bankTypeCode += 1+",";
				bankTypeName += "同城同行"+",";
			});
	if (ajaxBool) {
		var myMask = new Ext.LoadMask(Ext.getBody(), {
			msg : '后台正在处理中，请稍后....',
			removeMask : true
				// 完成后移除
			});
		myMask.show();
		Ext.Ajax.request({
					url : '/realware/checkVoucher.do',
					method : 'POST',
					timeout : 180000, // 设置为3分钟
					params : {
						is_onlyreq : 1,
						jsonMap : jsonMap.substring(0, jsonMap.length - 1)+ "]",
						billTypeId :  records[0].get("bill_type_id"),
						billIds : Ext.encode(reqIds),
						last_vers : Ext.encode(reqVers),
						bankTypeCode:bankTypeCode.substring(0,bankTypeCode.length-1),
						bankTypeName:bankTypeName.substring(0,bankTypeName.length-1),
						task_id : '0',
						isCheck : true,
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
}

function updateVoucher() {
	var records = gridPanel1.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请选中一条凭证信息！");
		return;
	}
	var reqIds = []; // 凭证主键字符串
	var reqVers = []; // 凭证lastVer字符串
	var jsonMap = "[";
	Ext.Array.each(records, function(model) {
				reqIds.push(model.get("pay_voucher_id"));
				reqVers.push(model.get("last_ver"));
				jsonMap += "{\"id\":\"" + model.get("pay_voucher_id")+"\",\"bankNo\":\"" + model.get("payee_account_bank_no")+"\",\"is_onlyreq\":\"" +  0 +"\"},";
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
					billIds : Ext.encode(reqIds),
					last_vers : Ext.encode(reqVers),
					billTypeId : records[0].get("bill_type_id"),
					task_id : '0',
					remark : '公务卡转普通支付',
					jsonMap : jsonMap.substring(0, jsonMap.length - 1)+ "]",
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
 * 撤销审核
 */
function voucherUnAudit() {
	var records = gridPanel1.getSelectionModel().getSelection();
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
		menu_id : Ext.PageUtil.getMenuId()
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
 * 刷新
 * 
 * @return
 */
function refreshData() {
	gridPanel1.getStore().loadPage(1);
}
