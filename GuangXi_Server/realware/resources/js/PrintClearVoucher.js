/*******************************************************************************
 * 主要用于划款凭证
 * 
 * @type
 */

/***
 * 引入需要使用的js文件
 */
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/recommend.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/operationLog.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/importFile.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/ocxVoucher.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/createReport.js"></scr' + 'ipt>');
	

// 划款信息
var fileds = ["pay_clear_voucher_code", "pay_amount", "agent_account_no",
		"agent_account_name", "agent_bank_name", "clear_account_no",
		"clear_account_name", "clear_bank_name","print_num", "fund_type_code",
		"fund_type_name", "pay_clear_voucher_id", "pay_type_code",
		"pay_type_name", "pay_bank_no", "pay_bank_name", "clear_date",
		"confirm_date", "bgt_type_code", "bgt_type_name",
		"pay_clear_voucher_id", "year", "bill_type_id","task_id","vt_code","admdiv_code","vou_date","print_date"];

var header = "凭证号|pay_clear_voucher_code|130,金额|pay_amount|120,收款银行账号|agent_account_no|130,收款银行账户名称|agent_account_name|150,收款银行名称|agent_bank_name|150,"
		+ "付款银行账号|clear_account_no,付款银行账户名称|clear_account_name|150,付款银行名称|clear_bank_name|140,凭证日期|vou_date|150,打印次数|print_num|80,打印时间|print_date|150,资金性质编码|fund_type_code,资金性质名称|fund_type_name,"
		+ "支付方式编码|pay_type_code,支付方式名称|pay_type_name,代理银行行号|pay_bank_no,代理银行名称|pay_bank_name,清算日期|clear_date,回单日期|confirm_date,"
		+ "预算类型编码|bgt_type_code,预算类型名称|bgt_type_name";

Ext.onReady(function() {
	// 初始化Ext.QuickTips，启用悬浮提示
	Ext.QuickTips.init(); 
	//引用工具类
	Ext.Loader.setPath('Ext', 'js/util');
	Ext.require(['Ext.PageUtil']);
	store = getStore("/realware/loadClearPayVoucher.do", fileds);
	column = getColModel(header, fileds);
	var pagetool = getPageToolbar(store);
	store.on('beforeload', function(thiz, options,e) {
		var panel = Ext.ComponentQuery.query("panel[title='查询区']")[0];
		beforeload(panel, options, Ext.encode(fileds));
	});
	var buttonItems = [{
		id : 'print',
		handler : function() {
			var records = Ext.getCmp("clearVoucherCreateQuery").getSelectionModel().getSelection();
			if (records.length == 0) {
				Ext.Msg.alert("系统提示", "请选择数据！");
				return;
			}
//			printPageVoucherByXml(records,"pay_voucher_id","pay_voucher_code",records[0].get("vt_code"));
			
//			var bill_no=records[0].get("pay_clear_voucher_id");
//			var data="[{\"pay_clear_voucher_id\":[\""+bill_no+"\"]}]";
			printVoucherAUTO(records,"pay_clear_voucher_id",false,records[0].get("vt_code"),serverPrint,Ext.getCmp("clearVoucherCreateQuery"));
		}
	},{
		//打印划款汇总清单
		id : 'printTabs',
		handler : function() {
			var records = Ext.getCmp("clearVoucherCreateQuery").getSelectionModel().getSelection();
			if (records.length == 0) {
				Ext.Msg.alert("系统提示", "请选择数据！");
				return;
			}
				var bill_no=records[0].get("pay_clear_voucher_id");
				var data="[{\"pay_clear_voucher_id\":[\""+bill_no+"\"]}]";
								
				GridPrintDialog('undefined','undefined',loadGrfURL,loadDataURL,"CollectClearVoucher",data,100);
		}
	},{
		//打印退款汇总清单
		id : 'printRefTabs',
		handler : function() {
			var records = Ext.getCmp("clearVoucherCreateQuery").getSelectionModel().getSelection();
			if (records.length == 0) {
				Ext.Msg.alert("系统提示", "请选择数据！");
				return;
			}
				var bill_no=records[0].get("pay_clear_voucher_id");
				var data="[{\"pay_clear_voucher_id\":[\""+bill_no+"\"]}]";
								
				GridPrintDialog('undefined','undefined',loadGrfURL,loadDataURL,"CollectRefClearVoucher",data,100);
		}
	},{
		//打印划款清单
		id : 'printTab',
		handler : function() {
			var records = Ext.getCmp("clearVoucherCreateQuery").getSelectionModel().getSelection();
			if (records.length == 0) {
				Ext.Msg.alert("系统提示", "请选择数据！");
				return;
			}
				var bill_no=records[0].get("pay_clear_voucher_id");
				var data="[{\"pay_clear_voucher_id\":[\""+bill_no+"\"]}]";
								
				GridPrintDialog('undefined','undefined',loadGrfURL,loadDataURL,"DetailClearVoucher",data,100);
		}
	},{
		//打印退款清单
		id : 'printRefTab',
		handler : function() {
			var records = Ext.getCmp("clearVoucherCreateQuery").getSelectionModel().getSelection();
			if (records.length == 0) {
				Ext.Msg.alert("系统提示", "请选择数据！");
				return;
			}
				var bill_no=records[0].get("pay_clear_voucher_id");
				var data="[{\"pay_clear_voucher_id\":[\""+bill_no+"\"]}]";
								
				GridPrintDialog('undefined','undefined',loadGrfURL,loadDataURL,"DetailRefClearVoucher",data,100);
		}
	},{
		//打印直接支付日报表
		id : 'printRep',
		handler : function() {
			var records = Ext.getCmp("clearVoucherCreateQuery").getSelectionModel().getSelection();
			if (records.length == 0) {
				Ext.Msg.alert("系统提示", "请选择数据！");
				return;
			}
				var bill_no=records[0].get("pay_clear_voucher_id");
				var data="[{\"pay_clear_voucher_id\":[\""+bill_no+"\"]}]";
								
				GridPrintDialog('undefined','undefined',loadGrfURL,loadDataURL,"PayClearDailyReport",data,100);
		}
	},{
		//打印授权支付日报表
		id : 'printPlanRep',
		handler : function() {
			var records = Ext.getCmp("clearVoucherCreateQuery").getSelectionModel().getSelection();
			if (records.length == 0) {
				Ext.Msg.alert("系统提示", "请选择数据！");
				return;
			}
				var bill_no=records[0].get("pay_clear_voucher_id");
				var data="[{\"pay_clear_voucher_id\":[\""+bill_no+"\"]}]";
								
				GridPrintDialog('undefined','undefined',loadGrfURL,loadDataURL,"PlanClearDailyReport",data,100);
		}
	},{
		//查看凭证
		id : 'look',
		handler : function() {
			var records = Ext.getCmp("clearVoucherCreateQuery").getSelectionModel().getSelection();
			if (records.length == 0) {
				Ext.Msg.alert("系统提示", "请选择数据！");
				return;
			}			
				lookOCX(records,"pay_clear_voucher_id");
		}

	},{
		//查看日志
		id : 'log',
		handler : function() {								
			taskLog(Ext.getCmp("clearVoucherCreateQuery").getSelectionModel().getSelection(),"pay_clear_voucher_id");
		}
	//刷新
	}, {
		id : 'refresh',
		handler : function() {
			refreshData();
		}
	}];
var queryItems = [{
		title : '查询区',
		bodyPadding : 5,
		frame : false,
		layout : 'hbox',
		defaults : {
			margins : '3 10 0 0',
        	padding : '0 3 0 3'
		},
		layout : {
			type : 'table',
			columns : 5
		},
		items : [{
					id : 'taskState',
					fieldLabel : '当前状态',
					xtype : 'combo',
					displayField : 'status_name',
					dataIndex : 'task_status',
					emptyText : '请选择',
					valueField : 'status_code',
					labelWidth : 60,
					editable : false
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
					id : 'code',
					fieldLabel : '凭证号',
					xtype : 'textfield',
					symbol : '>=',
					labelWidth : 45,
					width : 140,
					dataIndex : 'pay_clear_voucher_code '
				}, {
					id : 'codeEnd',
					fieldLabel : '至',
					xtype : 'textfield',
					labelWidth : 15,
					width : 120,
					symbol : '<=',
					dataIndex : 'pay_clear_voucher_code'
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
		selType : 'checkboxmodel',
		height : document.documentElement.scrollHeight- 95,
		frame : false,
		enableKeyNav : true,
		multiSelect : true,
		title : '凭证列表信息',
		selModel : {
			mode : 'multi',
			checkOnly : true
		},
		features: [{
    		ftype: 'summary'
		}],
		store : store,
		columns : column,
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
 * 所属财政
 */
function selectAdmdiv() {
	setBtnVisible(Ext.getCmp("admdiv").getValue(),null);
	refreshData();
}

/*******************************************************************************
 * 刷新
 */
//function refreshData() {
//	clearGridPanel.getStore().load();
//}
function refreshData() {
	Ext.getCmp("clearVoucherCreateQuery").getStore().loadPage(1);
}
