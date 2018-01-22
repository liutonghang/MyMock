/*******************************************************************************
 * 引入需要使用的js文件
 */
document.write('<scr'+ 'ipt type="text/javascript" src="/realware/resources/js/recommend.js"></scr'+ 'ipt>');
document.write('<scr'+ 'ipt type="text/javascript" src="/realware/resources/js/share/operationLog.js"></scr'+ 'ipt>');
document.write('<scr'+ 'ipt type="text/javascript" src="/realware/resources/js/share/ocxVoucher.js"></scr'+ 'ipt>');
document.write('<scr'+ 'ipt type="text/javascript" src="/realware/resources/js/share/backVoucher.js"></scr'+ 'ipt>');
document.write('<scr'+ 'ipt type="text/javascript" src="/realware/resources/js/share/importFile.js"></scr'+ 'ipt>');
document.write('<scr'+ 'ipt type="text/javascript" src="/realware/resources/js/share/exportExcel.js"></scr'+ 'ipt>');

/*******************************************************************************
 * 主要用于支付凭证初审，补录行号
 * 
 * @type
 */

/**
 * 数据项
 */

var fileds = ["payee_account_bank_no", "pay_voucher_code", "vou_date",
		"pay_amount", "payee_account_no", "payee_account_name",
		"payee_account_bank", "pay_account_no", "pay_account_name",
		"pay_account_bank", "pay_bank_code", "pay_bank_name",
		"clear_bank_code", "clear_bank_name", "checkNo", "fund_deal_mode_code",
		"fund_deal_mode_name", "fund_type_code", "fund_type_name",
		"pay_type_code", "pay_type_name","bgt_type_name", "set_mode_code", "set_mode_name",
		"pay_summary_code", "pay_summary_name", "task_id", "pay_voucher_id",
		"bill_type_id", "last_ver", "return_reason", "pb_set_mode_code",
		"pb_set_mode_name","audit_remark","urgent_flag"];

/**
 * 列名
 */
var header = "加急标志|urgent_flag,退票原因|return_reason|150,退回原因|audit_remark|150,收款行行号|payee_account_bank_no|100,银行结算方式名称|pb_set_mode_name|140,行号补录|do1|100|addBankno,凭证号|pay_voucher_code|140,凭证日期|vou_date|100,支付金额|pay_amount|100,收款人账号|payee_account_no,"
		+ "收款人名称|payee_account_name|140,收款人银行|payee_account_bank|140,付款人账号|pay_account_no,付款人名称|pay_account_name|140,付款人银行|pay_account_bank|140,"
		+ "用途编码|pay_summary_code,用途名称|pay_summary_name,代理银行编码|pay_bank_code,代理银行名称|pay_bank_name,清算银行编码|clear_bank_code,清算银行名称|clear_bank_name,支票号|checkNo,办理方式编码|fund_deal_mode_code,"
		+ "办理方式名称|fund_deal_mode_name,资金性质编码|fund_type_code,资金性质名称|fund_type_name,支付方式编码|pay_type_code,"
		+ "支付方式名称|pay_type_name,预算类型名称|bgt_type_name,结算方式编码|set_mode_code,结算方式名称|set_mode_name,银行结算方式编码|pb_set_mode_code,银行结算方式名称|pb_set_mode_name";

/**
 * 列表
 */
var gridPanel1 = null;

var comboStore = Ext.create('Ext.data.Store', {
			fields : ['name', 'value'],
			data : [{
						"name" : "未初审",
						"value" : "001"
					}, {
						"name" : "已初审",
						"value" : "002"
					}, {
						"name" : "被退回",
						"value" : "009"
					}, {
						"name" : "已退回",
						"value" : "007"
					}]
		});

/***
 * 银行结算方式
 * @return {TypeName} 
 */
var bankTypeStore = Ext.create('Ext.data.Store', {
				fields : ['name', 'value'],
				data : [{
							"name" : "同城同行",
							"value" : "1"
						}, {
							"name" : "同城跨行",
							"value" : "2"
						}, {
							"name" : "异地同行",
							"value" : "3"
						}, {
							"name" : "异地跨行",
							"value" : "4"
						}]
			});

/**
 * 界面加载
 */
Ext.onReady(function() {
	Ext.QuickTips.init();
	//引用工具类
	Ext.Loader.setPath('Ext', 'js/util');
	Ext.require(['Ext.PageUtil']);	
	if (gridPanel1 == null) {
		gridPanel1 = getGrid(loadVoucherWithBankNoUrl, header, fileds, true,
				true);
		gridPanel1.setHeight(document.documentElement.scrollHeight - 88);
		// 根据查询条件检索数据
		gridPanel1.getStore().on('beforeload', function(thiz, options) {
					var admdiv = Ext.getCmp('admdiv').getValue();
					if (admdiv == null || admdiv == "")
						return;
					beforeload(Ext.getCmp("checkQuery"), options, Ext.encode(fileds));
					options.params["loadCash"] = "0";
					options.params["vtCode"] = vtCode;
				});
	}
	Ext.create('Ext.Viewport', {
				id : 'checkVoucherFrame',
				layout : 'fit',
				items : [Ext.create('Ext.panel.Panel', {
							tbar : [{
								id : 'buttongroup',
								xtype : 'buttongroup',
								items : [{
											id : 'audit',
											text : '初审',
											iconCls : 'audit',
											scale : 'small',
											handler : function() {
												checkVoucher(true);
											}
										}, {
											id : 'official',
											text : '公务卡',
											iconCls : 'enabled',
											scale : 'small',
											handler : function() {
												updateVoucher();
											}
										}, {
											id : 'submit',
											text : '送审',
											iconCls : 'audit',
											scale : 'small',
											handler : function() {
												checkVoucher(false);
											}
										}, {
											id : 'back',
											text : '退回财政',
											iconCls : 'back',
											scale : 'small',
											handler : function() {
												backVoucher(backUrl,gridPanel1.getSelectionModel().getSelection(),
																"pay_voucher_id" ,"退回财政");
											}
										}, {
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
											id : 'import',
											text : '行号导入',
											iconCls : 'import',
											scale : 'small',
											fileUpload : true,
											handler : function() {
												importFile("/realware/sysBankNo.do");
											}
										}, {
											id : 'outDataToExcel',
											text : '数据导出',
											iconCls : 'export',
											scale : 'small',
											hidden : true,
											handler : function() {
												var records = gridPanel1.getSelectionModel().getSelection();
												if (records.length == 0) {
													Ext.Msg.alert("系统提示","请选择导出的数据");
													return;
												}
												var excel = new Ext.Excel({gridId : 'datagrid',sheetName : '支付凭证'});
												excel.extGridToExcel();

											}
										}, {
											id : 'refresh',
											text : '刷新',
											iconCls : 'refresh',
											scale : 'small',
											handler : function() {
												refreshData();
											}
//										},{
//											id : 'saveView',
//											text : '保存视图配置',
//											iconCls : 'save',
//											scale : 'small',
//											handler : function() {
//												saveListView(gridPanel1);
//											}
										}]
							}],
							items : [{
								title : "查询区",
								items : gridPanel1,
								tbar : {
									id : 'checkQuery',
									xtype : 'toolbar',
									bodyPadding : 6,
									layout : 'column',
									defaults : {
										margins : '10 10 10 0'
									},
									items : [{
												id : 'taskState',
												fieldLabel : '当前状态',
												xtype : 'combo',
												dataIndex : 'task_status',
												displayField : 'name',
												emptyText : '请选择',
												valueField : 'value',
												labelWidth : 60,
												width : 160,
												value : '001',
												editable : false,
												store : comboStore,
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
												labelWidth : 60,
												width : 160,
												editable : false,
												store : comboAdmdiv,
												value : comboAdmdiv.data.length > 0
														? comboAdmdiv.data
																.getAt(0)
																.get("admdiv_code")
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
											},{
												id : 'bankSetMode',
												fieldLabel : '银行结算方式',
												xtype : 'combo',
												dataIndex : 'pb_set_mode_code',
												displayField : 'name',
												valueField : 'value',
												labelWidth : 80,
												width : 170,
												editable : true,
												store : bankTypeStore
											}, {
												id : 'checkNo1',
												fieldLabel : '支票号',
												xtype : 'textfield',
												dataIndex : 'checkNo',
												labelWidth : 60,
												width : 160
											}]
								}
							}]
						})]
			});
	if (comboAdmdiv.data.length > 0) {
		Ext.getCmp('admdiv').setValue(comboAdmdiv.data.getAt(0).get("admdiv_code"));
	}
	if (account_type_right == "11") {
		Ext.getCmp("checkNo1").setVisible(false);
	}
	setBtnVisible(Ext.getCmp("admdiv").getValue(), Ext.getCmp("buttongroup"));
	var b = Ext.getCmp('payee_account_bank_no');
	var m = new Ext.form.field.Text();
	b.setEditor(m);
	selectState();
	if(!(bank_type==105 || bank_type==103))//农行建行带加急标志
	{
		Ext.getCmp("urgent_flag").setVisible(false);
	}
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
							name : 'bank_name'
						}, {
							name : 'bank_no'
						}, {
							name : "match_ratio"
						}, {
							name : "like_ratio"
						}],
				proxy : {
					extraParams : {
						acctno : record.data['payee_account_no'],
						bankname : encodeURI(record.data['payee_account_bank']),
						fields : JSON.stringify(["bank_name", "bank_no",
								"match_ratio", "like_ratio"])
					},
					type : 'ajax',
					url : '/realware/loadBanknos.do',
					reader : {
						type : 'json'
					}
				}
			});
	bankStore.load(function(records, operation, success) {
		if (!success) {
			Ext.Msg.show({
						title : '失败提示',
						msg : '行号检索失败！',
						buttons : Ext.Msg.OK,
						icon : Ext.MessageBox.ERROR
					});
			return;
		}
		Ext.Array.each(records, function(model) {
					if (model.get("match_ratio") == "1" && model.get("like_ratio") == "1") {
						grid.getStore().data.items[rowIndex1].set("payee_account_bank_no", model.get("bank_no"));
						var smc=grid.getStore().data.items[rowIndex1].get("pb_set_mode_code");
						if(!Ext.isEmpty(smc)){
							b = false;
						}						
						return;
					}
				});
		if (b) {
			if (bankWin == null) {
				bankWin = Ext.create('Ext.window.Window', {
					title : '行号补录对话框',
					width : 550,
					height : 300,
					layout : 'fit',
					resizable : false,
					closeAction : 'hide',
					modal : true,
					items : [new Ext.FormPanel({
						bodyPadding : 5,
						items : [{
							layout : 'hbox',
							defaults : {
								margins : '3 10 0 0'
							},
							height : 35,
							items : [{
										id : 'ori_bankname',
										fieldLabel : '&nbsp;收款行名称',
										xtype : 'textfield',
										labelWidth : 70,
										width : 360
									}, {
										id : 'bankType',
										fieldLabel : '',
										xtype : 'combo',
										dataIndex : 'bankType',
										displayField : 'name',
										emptyText : '请选择',
										valueField : 'value',
										labelWidth : 50,
										width : 83,
										editable : false,
										store : bankTypeStore
									}, {
										text : '查询',
										xtype : 'button',
										handler : function() {
											var oribankname = Ext
													.getCmp('ori_bankname')
													.getValue();
											bankStore.load({
												params : {
													acctno : record.data['payee_account_no'],
													bankname : encodeURI(oribankname)
												},callback: function(records, operation, success) {
													if(success && records.length>0){
														Ext.getCmp("gridBankno").getSelectionModel().select(0);
													}
												}
											});
										}
									}]
						}, {
							xtype : 'gridpanel',
							id : 'gridBankno',
							viewConfig : {
								enableTextSelection : true
							},
							store : bankStore,
							columns : [{
										text : '银行名称',
										dataIndex : 'bank_name',
										width : '380'
									}, {
										text : '银行行号',
										dataIndex : 'bank_no',
										width : '180'
									}],
							height : 200,
							listeners : {
								'itemdblclick' : function(view, record, item,index, e) {
									var bankNo = record.get("bank_no");
									grid.getStore().data.items[rowIndex1].set("payee_account_bank_no", bankNo);
									grid.getStore().data.items[rowIndex1].set("pb_set_mode_name",Ext.getCmp('bankType').rawValue);
									grid.getStore().data.items[rowIndex1].set("pb_set_mode_code", Ext.getCmp('bankType').getValue());
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
								grid.getStore().data.items[rowIndex1].set("payee_account_bank_no", records[0].get("bank_no"));
								var getStoreData = bankTypeStore.data;
								var bankTypeName;
								for (var i = 0; i < getStoreData.length; i++) {
									var temp = getStoreData.getAt(i);
									if (temp.data.value == Ext.getCmp('bankType').getValue()) {
										bankTypeName = temp.data.name;
										break;
									}
								}
								grid.getStore().data.items[rowIndex1].set("pb_set_mode_name", bankTypeName);
								grid.getStore().data.items[rowIndex1].set("pb_set_mode_code", Ext.getCmp('bankType').getValue());
								this.up('window').hide();
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
			} else {
				Ext.getCmp("gridBankno").getStore().removeAll();
				Ext.getCmp("gridBankno").getStore().add(bankStore.getRange());
			}
			var tempModeCode = grid.getStore().data.items[rowIndex1].get("pb_set_mode_code");

			if (tempModeCode == null || tempModeCode == '') {
				Ext.getCmp("bankType").setValue("1");
			} else {
				Ext.getCmp("bankType").setValue(tempModeCode);
			}

			Ext.getCmp("ori_bankname").setValue(record
					.get("payee_account_bank"));
			if(bankStore.data.length>0){
				Ext.getCmp("gridBankno").getSelectionModel().select(0);
			}
			bankWin.show();
		}
	});
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
		Ext.getCmp("return_reason").setVisible(false);
		Ext.getCmp("audit_remark").setVisible(false);
		Ext.getCmp('audit').enable(false);
		Ext.getCmp('submit').disable(false);
		Ext.getCmp('back').enable(false);
		Ext.getCmp("official").enable(false);
		Ext.getCmp("bankSetMode").setValue("");
		Ext.getCmp("bankSetMode").disable(false);
	} else if ("002" == taskState) {
		gridPanel1.down('#myActionColumn').hide();
		Ext.getCmp('audit').disable(false);
		Ext.getCmp('submit').disable(false);
		Ext.getCmp('back').disable(false);
		Ext.getCmp("official").disable(false);
		Ext.getCmp("return_reason").setVisible(false);
		Ext.getCmp("audit_remark").setVisible(false);
		Ext.getCmp("bankSetMode").enable(true);
	} else if ("007" == taskState) {
		gridPanel1.down('#myActionColumn').hide();
		Ext.getCmp('audit').disable(false);
		Ext.getCmp('submit').disable(false);
		Ext.getCmp('back').disable(false);
		Ext.getCmp("official").disable(false);
		Ext.getCmp("return_reason").setVisible(true);
		Ext.getCmp("audit_remark").setVisible(false);
		Ext.getCmp("bankSetMode").enable(true);
	} else {
		gridPanel1.down('#myActionColumn').show();
		Ext.getCmp('audit').disable(false);
		Ext.getCmp('submit').enable(false);
		Ext.getCmp('back').enable(false);
		Ext.getCmp("official").disable(false);
		Ext.getCmp("return_reason").setVisible(false);
		Ext.getCmp("audit_remark").setVisible(true);
		Ext.getCmp("bankSetMode").enable(true);
	}
	refreshData();
}

function selectAdmdiv() {
	setBtnVisible(Ext.getCmp("admdiv").getValue(), null);
	refreshData();
}

/**
 * 初审
 * 
 * @param {Object}
 *            isReturn
 * @return {TypeName}
 */
function checkVoucher(isReturn) {
	var url;
	if(isReturn){
		url="/realware/checkVoucher.do";
	}else{
		url="/realware/submitPayVoucher.do";
	}
	var records = gridPanel1.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请选中一条凭证信息！");
		return;
	}
	var ajaxBool = true;
	var bankNos = "";  //收款行行号
	var reqIds = []; // 凭证主键字符串
	var reqVers = []; // 凭证lastVer字符串
	var bankTypeCode="";   //代理银行结算方式编码
	var bankTypeName="";   //代理银行结算方式名称
	var urgent_flag="";   //加急标志
	var urgent_flag_name="";   //加急标志名称
	var jsonMap = "[";

	Ext.Array.each(records, function(model) {
				// 验证是否都已补录行号
				var payeeAcctBankno = model.get("payee_account_bank_no");
				var pbSetModeCode = model.get("pb_set_mode_code");
//				if (null == payeeAcctBankno || "" == payeeAcctBankno || null==pbSetModeCode || pbSetModeCode=="") {
//					Ext.Msg.alert("系统提示", "凭证：" + model.get("pay_voucher_code")+ "请先补录行号和结算方式再进行初审操作！");
//					ajaxBool = false;
//				}
				if (null == payeeAcctBankno || "" == payeeAcctBankno) {
					Ext.Msg.alert("系统提示", "凭证：" + model.get("pay_voucher_code")+ "请先补录行号再进行初审操作！");
					ajaxBool = false;
			}
				bankNos += model.get("payee_account_bank_no");
				bankTypeCode += model.get("pb_set_mode_code");
				bankTypeName += model.get("pb_set_mode_name");
				urgent_flag += model.get("urgent_flag");
				urgent_flag_name += model.get("urgent_flag")==0?"-1":records[i].get("urgent_flag")==1?"加急":"普通";
				reqIds.push(model.get("pay_voucher_id"));
				reqVers.push(model.get("last_ver"));
				jsonMap += "{\"id\":\"" + model.get("pay_voucher_id")+"\",\"bankNo\":\"" + payeeAcctBankno+"\",\"setModeCode\":\"" +  model.get("pb_set_mode_code") +"\",\"setModeName\":\"" + model.get("pb_set_mode_name") + "\"},";
			});

	var myMask = new Ext.LoadMask(Ext.getBody(), {
		msg : '后台正在处理中，请稍后....',
		removeMask : true
			// 完成后移除
		});
	if (ajaxBool) {
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
						jsonMap : jsonMap.substring(0, jsonMap.length - 1)+ "]",
						isCheck : isReturn,
						bankTypeCode:bankTypeCode,
						bankTypeName:bankTypeName,
						urgent_flag : urgent_flag,
						urgent_flag_name : urgent_flag_name,
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

function savePayBankNo(model){
	var data =model.data;
	Ext.Ajax.request({
					url : '/realware/savePayBankNo.do',
					method : 'POST',
					timeout : 180000, // 设置为3分钟
					jsonData : data,
					success : function(response, options) {
//						refreshData();						
					},
					failure : function(response, options) {
						Ext.Msg.show({
							title : '失败提示',
							msg : response.responseText,
							buttons : Ext.Msg.OK,
							icon : Ext.MessageBox.ERROR
						});
//						refreshData();
					}
	});
}
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
					objMap : "[{\"is_onlyreq\":1}]",
					remark : '普通支付转公务卡',
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
/*******************************************************************************
 * 送审
 */
function submit(){
	var records = gridPanel1.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请选中凭证信息！");
		return;
	} 
	// 凭证主键字符串
	var ids = "";
	var reqVers="";
	for (var i = 0; i < records.length; i++) {
		ids += records[i].get("pay_voucher_id");
		reqVers +=records[i].get("last_ver");
		if (i < records.length - 1){
			ids += ",";
			reqVers += ",";			
		}
			
	}
	var bill_type_id = records[0].get("bill_type_id");
	var myMask = new Ext.LoadMask(Ext.getBody(), {
		msg : '后台正在处理中，请稍后....',
		removeMask : true // 完成后移除
	});
	myMask.show();
	Ext.Ajax.request({
				url : '/realware/submitPayVoucher.do',
				method : 'POST',
				timeout : 180000, // 设置为3分钟
				params : {
					ids       :  ids,
					last_vers :  reqVers,
					billTypeId:  bill_type_id,
					menu_id :  Ext.PageUtil.getMenuId()
				},
				success : function(response, options) {
					succMethod(response, options,myMask);
					refreshData();
				},
				failure : function(response, options) {
					failMethod(response, options,myMask);
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
 * 刷新
 * 
 * @return
 */
function refreshData() {

//	var a = gridPanel1.getStore().getProxy();
//
//	var taskState = Ext.getCmp('taskState').getValue();
//	// 如果是未送审
//	if ('001' == taskState) {
//		a.url = "/realware/loadPayVoucherWithBankNo.do";
//	} else {
//		a.url = "/realware/loadPayVoucher.do";
//	}

	gridPanel1.getStore().load();
	//loadListView(Ext.getCmp('taskState').getValue(),gridPanel1);
	
}

/*******************************************************************************
 * 同步联行号，读取最新银行行号文件更新到数据库中
 * 
 * @return
 */
function synBankNo() {
	var ajaxBool = true;
	var myMask = new Ext.LoadMask(Ext.getBody(), {
		msg : '后台正在处理中，请稍后....',
		removeMask : true
			// 完成后移除
		});
	if (ajaxBool) {
		myMask.show();
		Ext.Ajax.request({
					url : '/realware/sysBankNo.do',
					method : 'POST',
					timeout : 1800000, // 设置为3分钟
					success : function(response, options) {
						succAjax(response, myMask);
					},
					failure : function(response, options) {
						failAjax(response, myMask);
					}
				});
	}
}
