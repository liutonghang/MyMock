/*******************************************************************************
 * 引入需要使用的js文件
 */
document.write('<scr'
				+ 'ipt type="text/javascript" src="/realware/resources/js/recommend.js"></scr'
				+ 'ipt>');
/***
 * 主要用于与人行对账管理
 * @type 
 */


/**
 * 数据项
 */
var fileds = ["pay_voucher_id","pay_voucher_code", "reconciliation_flag", "payee_account_bank_no", "pay_date", "payee_account_no",
		"pay_amount","payee_account_name", "payee_account_bank","agent_business_no",
		"pay_account_no", "pay_account_name", "pay_account_bank","pb_set_mode_name",
		"agency_name", "exp_func_name","admdiv_code", "bill_type_id", "vt_code",
		"last_ver"];

/**
 * 列名
 */
var header = "凭证号|pay_voucher_code|140,对账结果|reconciliation_flag|60,结算方式|pb_set_mode_name|60,收款行行号|payee_account_bank_no|100,转账日期|pay_date|130,"
	    + "支付金额|pay_amount|100,收款人账号|payee_account_no,"
		+ "收款人名称|payee_account_name|140,收款人银行|payee_account_bank|140,"
		+ "付款人账号|pay_account_no,付款人名称|pay_account_name|140,付款人银行|pay_account_bank|140,"
		+ "预算单位|agency_name,支出功能分类科目名称|exp_func_name";
		
//列表
var printPanel = null;
var selNos="";
var now;
/***
 * 界面初始化
 */
Ext.onReady(function() {
  	Ext.QuickTips.init(); 
  	var  prefix='';
  	printPanel = getGrid(loadUrl, header, fileds, true, true);
	printPanel.setHeight(document.documentElement.scrollHeight - 115);
	// 根据查询条件检索数据
	printPanel.getStore().on('beforeload', function(thiz, options) {
		if (admdiv_code == null || admdiv_code == "")
			return;

		beforeload(Ext.getCmp("checkQuery"), options, Ext.encode(fileds));

	});
	
	Ext.create('Ext.Viewport', {
				id : 'payDailyCreateFrame',
				layout : 'fit',
				items : [Ext.create('Ext.panel.Panel', {
							tbar : [{
								xtype : 'buttongroup',
								items : [{
											id : 'core',
											text : '核心对账',
											iconCls : 'pay',
											scale : 'small',
											handler : function() {
									           checkData(1);
											}
										},{
											id : 'sps',
											text : '大额对账',
											iconCls : 'pay',
											scale : 'small',
											hidden : true,
											handler : function() {
									           checkData(2);
											}
										},{
											id : 'dep',
											text : '贷记卡对账',
											iconCls : 'pay',
											scale : 'small',
											hidden : true,
											handler : function() {
									           checkData(3);
											}
										},{
											id : 'tczl',
											text : '同城对账',
											iconCls : 'pay',
											scale : 'small',
											hidden : true,
											handler : function() {
									           checkData(4);
											}
										},{
											id : 'tran',
											text : '转账',
											iconCls : 'pay',
											scale : 'small',
											hidden : true,
											handler : function() {
												selNos="";
												// 当前选中的数据
												var recordsr = printPanel.getSelectionModel().getSelection();
												if (recordsr.length <=0) {
													Ext.Msg.alert("系统提示", "请至少选择一条数据！");
													return;
												}
												else{
													// 选中的凭证的id数组，要传到后台
													for (var i = 0; i < recordsr.length; i++) {
															selNos += recordsr[i].get("id");
															if (i < recordsr.length - 1)
															selNos += ",";
													}

												}
											}
										}, {
											id : 'pay',
											text : '支付',
											iconCls : 'pay',
											scale : 'small',
											hidden : true,
											handler : function() {
												checkTransferPayVoucher();
											}
										},{
											id : 'export',
											text : '导出',
											iconCls : 'pay',
											scale : 'small',
											handler : function() {
											   exportData();
											}
										},{
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
										items : printPanel,
										tbar : {
											id : 'checkQuery',
											xtype : 'toolbar',
											collapsible : true,
											bodyPadding : 8,
											layout : {
												type : 'table',
												columns : 4
											},
											defaults : {
												margins : '3 5 0 0'
											},
											items : [{
													id : 'admdiv_code',
													fieldLabel : '所属财政',
													xtype : 'combo',
													dataIndex : 'admdiv_code',
													displayField : 'admdiv_name',
													emptyText : '请选择',
													valueField : 'admdiv_code',
													labelWidth : 80,
													store : comboAdmdiv,
													editable : false,
													style : 'margin-left:5px;margin-top:5px;margin-bottom:5px;margin-right:5px;',
													listeners : {
														'select' : selectAdmdiv
													}
												},{
													id : 'vt_code',
													fieldLabel : '凭证类型',
													xtype : 'combo',
													dataIndex : 'vt_code',
													displayField : 'voucher_name',
													emptyText : '请选择',
													valueField : 'vt_code',
													labelWidth : 60,
													store : comboVoucherType,
													style : 'margin-left:5px;margin-top:5px;margin-bottom:5px;margin-right:5px;',
													editable : false,
													listeners : {
														'select' : refreshData
													}
												},{
													id : 'start_date',
													fieldLabel : '交易日期',
													xtype : 'datefield',
													dataIndex : 'pay_date',
													format : 'Ymd',
													labelWidth : 60,
													symbol : '=',
													width : 160,
													data_type:'date',
													style : 'margin-left:5px;margin-top:5px;margin-bottom:5px;margin-right:5px;',
													listeners : {
														'select' : refreshData
													}
												},{
													id : 'reconciliationflag',
													fieldLabel : '对账标识',
													xtype : 'combo',
													dataIndex : 'reconciliation_flag',
													displayField : 'reconciliation_name',
													emptyText : '请选择',
													valueField : 'reconciliation_code',
													style : 'margin-left:5px;margin-top:5px;margin-bottom:5px;margin-right:5px;',
													labelWidth : 60,
													store : reconciliationFlag,
													editable : false,
													listeners : {
														'select' : refreshData
													}
												},{
													id : 'manualTransFlag',
													fieldLabel : '是否人工转账',
													xtype : 'combo',
													dataIndex : 'manual_trans_flag',
													displayField : 'manualTrans_name',
													emptyText : '请选择',
													valueField : 'manualTrans_code',
													style : 'margin-left:5px;margin-top:5px;margin-bottom:5px;margin-right:5px;',
													labelWidth : 80,
													store : manualTransFlag,
													editable : false,
													listeners : {
														'select' : refreshData
													}
												}, {
													id : 'code',
													fieldLabel : '凭证号',
													xtype : 'textfield',
													dataIndex : 'pay_voucher_code',
													labelWidth : 60,
													symbol : '>=',
													style : 'margin-left:5px;margin-top:5px;margin-bottom:5px;margin-right:5px;'
												}, {
													id : 'codeEnd',
													fieldLabel : '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;至',
													labelWidth : 60,
													xtype : 'textfield',
													style : 'margin-left:5px;margin-top:5px;margin-bottom:5px;margin-right:5px;',
													symbol : '<=',
													dataIndex : 'pay_voucher_code'
												},{
													id : 'business_type',
													xtype : 'hiddenfield',
													symbol : '<>',
													dataIndex : 'business_type',
													value : 2
												}],
										flex : 2
									}}]
						})]
			});
			if (comboAdmdiv.data.length > 0) {
				Ext.getCmp('admdiv_code').setValue(comboAdmdiv.data.getAt(0).get("admdiv_code"));
			}
			if (comboVoucherType.data.length > 0) {
				Ext.getCmp('vt_code').setValue(comboVoucherType.data.getAt(0).get("vt_code"));
			}
			getNowDate();

});
		
		


	
	
/*******************************************************************************
 * 选择财政
 * 
 * @return
 */
function selectAdmdiv() {
	refreshData();
}

/*******************************************************************************
 * 查詢
 * 
 * @return
 */
function refreshData() {
	var admdiv_code = Ext.getCmp('admdiv_code').getValue();
	if (admdiv_code == null || admdiv_code == "")
		return;
	var start_date = Ext.getCmp('start_date').getValue();
	if(start_date == null || start_date == ""){
	   return;
	}
	printPanel.getStore().loadPage(1);	

}

/**
 * 查账
 */
function checkData(type) {
	if(printPanel.getStore().getAt(0)==null){
		Ext.Msg.alert("无相关数据，请重新选择日期。");
		return;
	}
    
	var admdiv_code = Ext.getCmp('admdiv_code').getValue();
	if (admdiv_code == null || admdiv_code == "")
		return;
	var start_date = Ext.getCmp('start_date').getValue();
	if(start_date == null || start_date == ""){
	   return;
	}
	
	start_date = Ext.util.Format.date(start_date, 'Ymd'); 
	
	var vt_code = Ext.getCmp('vt_code').getValue();
	if(vt_code == null || vt_code == ""){
	   return;
	}
	
    var myMask = new Ext.LoadMask(Ext.getBody(), {
		msg : '后台正在处理中，请稍后....',
		removeMask : true
			// 完成后移除
		});
	myMask.show();
	Ext.Ajax.request({
				method : 'POST',
				timeout : 1800000, // 设置为30分钟
				url : checkDateUrl,
				params : {
						is_onlyreq : 0,
						admdivCode : admdiv_code,
						vtCode : vt_code,
						payDate : start_date,
						trade_type : "0",
						account_flag : type
					},
				success : function(response, options) {
					succAjax(response, myMask,true);
					refreshData();
				},
				failure : function(response, options) {
					failAjax(response, myMask);
					refreshData();
				}
			});
}

function getNowDate(){
	Ext.Ajax.request({
		url : loadDateURL,
        method: 'POST',
		timeout:180000,  //设置为3分钟
		success : function(response, options) {
			now = response.responseText;
			Ext.getCmp("start_date").setValue(now);
			refreshData();	
			},
		failure : function(response, options) {
			failAjax(response, myMask);
		}
	})
}

/**
 * 确认凭证（即支付）
 * 
 */
function checkTransferPayVoucher(transSucc) {
	var records = printPanel.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请至少选中一条凭证信息");
		return;
	}
	// 凭证主键字符串
	var reqIds = [];
	var reqVers = [];
	Ext.Array.each(records,function(model){
		reqIds.push(model.get("pay_voucher_id"));
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
				url : '/realware/checkTransferPayVoucher.do',
				params : {
					// 单据类型id
					billTypeId : records[0].get("bill_type_id"),
					billIds : Ext.encode(reqIds),
					transSucc : transSucc,
					last_vers : Ext.encode(reqVers),
					accountType : accountType
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
 * 导出EXCEL
 * 
 * @return
 */
function exportData() {
	var records = printPanel.getSelectionModel().getSelection();
    if (records.length == 0) {
        Ext.Msg.alert("系统提示", "请至少选中一条凭证信息");
        return;
    }
	try {
		var xls = new ActiveXObject("Excel.Application");
	} catch (e) {
		alert("要打印该表，您必须安装Excel电子表格软件，同时浏览器须使用“ActiveX 控件”，您的浏览器须允许执行控件。 请点击【帮助】了解浏览器设置方法！");
		return "";
	}
	xls.visible = true; // 设置excel为可见
	var xlBook = xls.Workbooks.Add;
	var xlSheet = xlBook.Worksheets(1);
	xlSheet.Columns(1).NumberFormatLocal="@"; 
	xlSheet.Columns(3).NumberFormatLocal="@"; 
	xlSheet.Columns(4).NumberFormatLocal="@";
	xlSheet.Columns(5).NumberFormatLocal="@";
	xlSheet.Columns(6).NumberFormatLocal="@";
	xlSheet.Columns(9).NumberFormatLocal="@";
    var recordCount = records.length;
    var cm= printPanel.columns;
    var colCount = cm.length;
    var temp_obj = [];
    var temp_objName = [];
	var head = header.split(',');
	for (var i = 0; i < head.length; i++){
	   xlSheet.Cells(1, i+1).value = head[i].split('|')[0];
	}
	for(var i=0;i<recordCount;i++){
		for (var j = 0; j < head.length; j++){
		  xlSheet.Cells(i+2, j+1).value = records[i].get(head[j].split('|')[1]);
	    }
	}
	xlSheet.Columns.AutoFit;
	xls.ActiveWindow.Zoom = 75
	xls.UserControl = true; //很重要,不能省略,不然会出问题 意思是excel交由用户控制
	xls = null;
	xlBook = null;
	xlSheet = null;
}


/***
 * 银行结算方式
 * @return {TypeName} 
 */
var bankTypeStore = Ext.create('Ext.data.Store', {
				fields : ['name', 'value'],
//				data : [{
//							"name" : "同城同行",
//							"value" : "1"
//						}, {
//							"name" : "同城跨行",
//							"value" : "2"
//						}, {
//							"name" : "异地同行",
//							"value" : "3"
//						}, {
//							"name" : "异地跨行",
//							"value" : "4"
//						}]
				data : [{
					"name" : "其他",
					"value" : "1"
				}, {
					"name" : "同城跨行",
					"value" : "2"
				}]
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

	
