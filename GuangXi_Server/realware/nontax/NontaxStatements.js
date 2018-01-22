/**
 * 行间划转及清分资金到账报文
 */

/*******************************************************************************
 * 引入需要使用的js文件
 */
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/recommend.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/operationLog.js"></scr' + 'ipt>');
// 在生成划款单之后就可以打印划款单(主要用于2302)

// 资金流水列表面板
var statementPanel = null;

// 凭证信息
var fileds1 = [ "trans_id", "currency_type", "money_type", "pay_account_name",
		"pay_account_no", "pay_account_bank", "payee_account_name",
		"payee_account_no", "payee_account_bank", "pay_account_no",
		"pay_account_name", "trans_date", "pay_summary_name", "remark",
		"bill_type_id", "tra_no", "account_amount",
		"pay_summary_name","last_ver","income_amount"];

var header1 = "币种|currency_type|100,钞汇鉴别|money_type|100,付款账户名称|pay_account_name|120,付款账号|pay_account_no|130,"
		+ "付款人银行|pay_account_bank|140,收款账户名称|payee_account_name|140,收款账号|payee_account_no,"
		+ "收款人银行|payee_account_bank,收入金额|income_amount|100,交易日期|trans_date|140,摘要信息|pay_summary_name|140,备注|remark|100,"
		+ "银行流水号|tra_no";

// 没有确认的流水
var linePanel = null;

var fileds = [ "interline_receive_id", "interline_receive_code", "cf_date",
		"cf_time", "batch_no", "agent_business_no", "acct_type",
		"payee_account_no", "payee_account_name", "payee_account_bank",
		"pay_account_no", "pay_account_name", "pay_account_bank", 
		"add_word", "memo","bill_type_id","last_ver","amt"];

var header = "单号|interline_receive_code|200,到账日期|cf_date|100,批次号|batch_no|120,资金流水号|agent_business_no,"
		+ "收款人名称|payee_account_name|140,收款人银行|payee_account_bank|140,收款账号|payee_account_no|150,"
		+ "付款人账号|pay_account_no|150,付款人名称|pay_account_name|140,付款人银行|pay_account_bank|140,"
		+ "金额|amt|100,附言|add_word|150,备注|memo|150";

/*******************************************************************************
 * 初始化
 */
Ext.onReady(function() {
	// 初始化Ext.QuickTips，启用悬浮提示
		Ext.QuickTips.init();
		store1 = getStore("nontaxLoadVoucher.do", fileds1);
		column1 = getColModel(header1, fileds1);
		store2 = getStore("nontaxLoadVoucher.do", fileds);
		column2 = getColModel(header, fileds);
		var pagetool = getPageToolbar(store1);
		store1.on('beforeload', function(thiz, options, e) {
			var panel = Ext.ComponentQuery.query("panel[title='查询区']")[0];
			beforeload(panel, options, Ext.encode(fileds1));
			options.params["billTypeId"] = 11022;
		});
		store2.on('beforeload', function(thiz, options, e) {
			var panel = Ext.ComponentQuery.query("panel[title='查询区']")[0];
			beforeload(panel, options, Ext.encode(fileds));
			options.params["billTypeId"] = 2615;
		});
		
		var buttonItems = [ {
			id : 'confirm',
			handler : function() {
				comfirm();
			}
		}, {
			id : 'ref',
			handler : function() {
				refreshData();
			}
		},

		];
		var queryItems = [ {
			title : '查询区',
			bodyPadding : 5,
			frame : false,
			layout : 'hbox',
			defaults : {
				padding : '3 3 3 3'
			},
			layout : {
				type : 'table',
				columns : 4
			},
			items : [ {
				id : 'taskState',
				fieldLabel : '当前状态',
				xtype : 'combo',
				displayField : 'status_name',
				dataIndex : 'task_status',
				emptyText : '请选择',
				valueField : 'status_code',
				labelWidth : 100,
				editable : false,
				listeners : {
					'change' : selectState
				}
			}, {
				id : 'admdiv',
				fieldLabel : '所属财政',
				xtype : 'combo',
				labelWidth : 100,
				dataIndex : 'admdiv_code',
				displayField : 'admdiv_name',
				emptyText : '请选择',
				valueField : 'admdiv_code',
				editable : false,
				store : comboAdmdiv
		   },{
				id : 'payee_account_nogg',
				fieldLabel : '收款人账号',
				xtype : 'textfield',
				symbol : 'like',
				labelWidth : 100,
				dataIndex : 'payee_account_no '
			}, {
				id : 'payee_account_namegg',
				fieldLabel : '收款人名称',
				xtype : 'textfield',
				symbol : 'like',
				labelWidth : 100,
				dataIndex : 'payee_account_name'
			}, {
				id : 'vouDate',
				fieldLabel : '交易日期',
				xtype : 'datefield',
				labelWidth : 100,
				dataIndex : 'trans_date',
				format : 'Ymd'
			} ],
			flex : 2
		}, {
			id : 'clearVoucherCreateQuery',
			xtype : 'gridpanel',
			height : document.documentElement.scrollHeight - 120,
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
			title : '未确认财政专户缴款流水',
			selType : 'checkboxmodel',
			selModel : {
				mode : 'multi',
				checkOnly : true
			},
			features : [ {
				ftype : 'summary'
			} ],
			store : store1,
			columns : column1,
			loadMask : {
				msg : '数据加载中,请稍等...'
			},
			bbar : pagetool
		} ];
		Ext.StatusUtil.createViewport(buttonItems, queryItems, function() {
			Ext.StatusUtil.initPage(Ext.getCmp("admdiv"), Ext
					.getCmp("taskState"));
			// 默认设置为未生成
				Ext.getCmp('taskState').setValue("000");
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
	if (000 == newValue) { // 未生成
		Ext.StatusUtil.batchEnable("confirm");
		if(oldValue){
			replaceIndex("vouDate", "cf_date", "trans_date");
		}
		
		// 重新绑定grid
		Ext.suspendLayouts();
		grid.setTitle("未确认非税缴款专户流水");
		grid.reconfigure(store1, column1);
		// 重新绑定分页工具栏
		pager.bind(store1);
		Ext.resumeLayouts(true);
		Ext.getCmp("payee_account_nogg").setValue("");
		Ext.getCmp("payee_account_namegg").setValue("");

	} else if (001 == newValue) { // 已生成
		replaceIndex("vouDate", "trans_date", "cf_date");
		Ext.StatusUtil.batchDisable("confirm");
		Ext.suspendLayouts();
		// 重新绑定grid
		grid.setTitle("已确认非税缴款专户流水");
		grid.reconfigure(store2, column2);
		// 重新绑定分页工具栏
		pager.bind(store2);
		Ext.resumeLayouts(true);
		Ext.getCmp("payee_account_nogg").enable().setValue("");
		Ext.getCmp("payee_account_namegg").enable().setValue("");
	}
}

/*******************************************************************************
 * 刷新
 */
function refreshData() {
	Ext.getCmp("clearVoucherCreateQuery").getStore().loadPage(1);
}

function comfirm() {
	var records = Ext.getCmp("clearVoucherCreateQuery").getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请至少选择一条数据！");
		return;
	}
	var ids = [];
	var reqVers = [];
	Ext.Array.each(records,function(model) {
			ids.push(model.get("trans_id"));
			reqVers.push(model.get("last_ver"));
		});
	
	var myMask = new Ext.LoadMask(Ext.getBody(), {
		msg : '后台正在处理中，请稍后....',
		removeMask : true
	});
	myMask.show();
	Ext.Ajax.request( {
		url : '/realware/nontaxConfirmStatements.do',
		method : 'POST',
		timeout : 180000,
		params : {
		    billTypeId : records[0].get("bill_type_id"),
			billIds : Ext.encode(ids),
			last_vers : Ext.encode(reqVers),
			menu_id : Ext.PageUtil.getMenuId()
		},
		success : function(response, options) {
			succAjax(response, myMask, true);
			refreshData();
		},
		failure : function(response, options) {
			failAjax(response, myMask);
			refreshData();
		}

	});

}


