/*******************************************************************************
 * 主要实拨打印
 * 
 * @type
 */

/***
 * 引入需要使用的js文件
 */
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/recommend.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/operationLog.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/ocxVoucher.js"></scr' + 'ipt>');


var gridPanel1 = null;

// 打印是否走工作流
var isFlow = false;
/**
 * 列名
 */
var fileds = ["realpay_voucher_code", "amount", "payee_account_no",
		"payee_account_name", "payee_account_bank","payee_account_bank_no" ,"clear_account_no",
		"clear_account_name", "clear_bank_name", "exp_func_name",
		"fund_type_code", "fund_type_name", "pay_type_code", "pay_type_name",
		"pay_summary_code", "pay_summary_name", "pay_date", "print_num",
		"print_date", "voucherflag", "task_id", "bill_type_id",
		"realpay_voucher_id", "return_reason","pb_set_mode_code","pb_set_mode_name","last_ver","admdiv_code"];
//退票原因|return_reason|150,
var header = "拨款凭证编码|realpay_voucher_code,拨款金额|amount,收款行行号|payee_account_bank_no|100,银行结算方式名称|pb_set_mode_name|140,收款人账号|payee_account_no|140,收款人名称|payee_account_name|140,收款人银行|payee_account_bank|140,付款人账号|clear_account_no|140,付款人|clear_account_name,付款人开户行|clear_bank_name|140,"
		+ "功能分类|exp_func_name,资金性质编码|fund_type_code|140,资金性质|fund_type_name|140,支付方式编码|pay_type_code|140,支付方式|pay_type_name|140,用途编码|pay_summary_code|140,用途名称|pay_summary_name|140,支付日期|pay_date|140,打印次数|print_num,"
		+ "打印日期|print_date,凭证状态|voucherflag";

var comboStore = Ext.create('Ext.data.Store', {
			fields : ['name', 'value'],
			data : [{
						"name" : "未打印",
						"value" : "001"
					}, {
						"name" : "已打印",
						"value" : "002"
					}]
		});



Ext.onReady(function() {
	Ext.QuickTips.init();
	gridPanel1 = getGrid(loadUrl, header, fileds, true, true);
	gridPanel1.setHeight(document.documentElement.scrollHeight - 93);
	// 根据查询条件检索数据
	gridPanel1.getStore().on('beforeload', function(thiz, options) {
		var jsonMap = "[{";
		var admdiv = Ext.getCmp('admdiv').getValue();
		var taskState = Ext.getCmp('taskState').getValue();
		var p_date_s = Ext.getCmp('payDate').getValue();
		var p_date_e = Ext.getCmp('payEnd').getValue();
		var agency = Ext.getCmp('agency').getValue();
		var exp_func_name = Ext.getCmp('exp_func_name1').getValue();
		if (admdiv == null || admdiv == "")
			return;
		if ('001' == taskState) {
					var jsonStr = [];
					jsonStr[0] = "=";
					jsonStr[1] = 0;
					jsonMap = jsonMap + "\"print_num\":"
						+ Ext.encode(jsonStr) + ",";
		} else if ('002' == taskState) {
					var jsonStr = [];
					jsonStr[0] = ">";
					jsonStr[1] = 0;
					jsonMap = jsonMap + "\"print_num\":"
						+ Ext.encode(jsonStr) + ",";
		}
		if(("" != p_date_s && null != p_date_s) && ("" != p_date_e && null != p_date_e)){
			var jsonStr = [];
			jsonStr[0] = ">=";
			jsonStr[1] = Todate(p_date_s);
			jsonMap = jsonMap + "\"pay_date\":"+ Ext.encode(jsonStr) + ",";
			var jsonStr = [];
			jsonStr[0] = "<=";
			jsonStr[1] = Todate(p_date_e);
			jsonMap = jsonMap + "\"pay_date\":" + Ext.encode(jsonStr) + ",";
		}
		else if ("" != p_date_s && null != p_date_s) {
			var jsonStr = [];
			jsonStr[0] = ">=";
			jsonStr[1] = Todate(p_date_s);
			jsonMap = jsonMap + "\"pay_date\":"+ Ext.encode(jsonStr) + ",";
		}
		else if ("" != p_date_e && null != p_date_e) {
			var jsonStr = [];
			jsonStr[0] = "<=";
			jsonStr[1] = Todate(p_date_e);
			jsonMap = jsonMap + "\"pay_date\":"+ Ext.encode(jsonStr) + ",";
		}
		if ("" != agency && null != agency) {
			var jsonStr = [];
			jsonStr[0] = "LIKE";
			jsonStr[1] = agency;
			jsonMap = jsonMap + "\"agency_name\":" + Ext.encode(jsonStr) + ",";
		}
		if ("" != admdiv && null != admdiv) {
			var jsonStr = [];
			jsonStr[0] = "=";
			jsonStr[1] = admdiv;
			// alert(admdiv);
			jsonMap = jsonMap + "\"admdiv_code\":" + Ext.encode(jsonStr) + ",";
		}
		if ("" != exp_func_name && null != exp_func_name) {
			var jsonStr = [];
			jsonStr[0] = "=";
			jsonStr[1] = exp_func_name;
			jsonMap = jsonMap + "\"exp_func_name\":" + Ext.encode(jsonStr) + ",";
		}

		var data = jsonMap.substring(0, jsonMap.length - 1) + "}]";
		if (null == options.params || options.params == undefined) {
			options.params = [];
			options.params["jsonMap"] = data;
			options.params["filedNames"] = JSON.stringify(fileds);
		} else {
			options.params["jsonMap"] = data;
			options.params["filedNames"] = JSON.stringify(fileds);
		}
	});
	Ext.create('Ext.Viewport', {
		id : 'SingAndSingRealPayFrame',
		layout : 'fit',
		items : [ Ext.create('Ext.panel.Panel', {
			tbar : [ {
				xtype : 'buttongroup',
				items : [ {
					id : 'printRealPayVoucher',
					text : '打印',
					iconCls : 'print',
					scale : 'small',
					handler : function() {
						var records = gridPanel1.getSelectionModel().getSelection();
						if (records.length == 0) {
							Ext.Msg.alert("系统提示", "请选中凭证信息！");
							return;
						}
//						var billIds = null;
//						Ext.Array.each(records, function(model) {
//								billIds = billIds+ model.get("realpay_voucher_id")+ ",";
//						});
//						var billTypeId = records[0].get("bill_type_id");
//						printVoucherDialog(billIds, isFlow, billTypeId,"realpay_voucher_id");
						printVoucherAUTO(gridPanel1.getSelectionModel().getSelection(),"realpay_voucher_id",isFlow,records[0].get("vt_code"),serverPrint);
					}
				}, {
					text : '凭证查看',
					iconCls : 'look',
					scale : 'small',
					handler : function() {
						lookVoucher(gridPanel1,'realpay_voucher_id');
					}
				}, {
					text : '查看操作日志',
					iconCls : 'log',
					scale : 'small',
					handler : function() {
//						loadTaskLog(loadTaskLogUrl, gridPanel1,"realpay_voucher_id");
						taskLog(gridPanel1.getSelectionModel().getSelection(),"realpay_voucher_id");
					}
				}, {
					text : '查询',
					iconCls : 'refresh',
					scale : 'small',
					handler : function() {
						refreshData();
					}
				} ]
			} ],
			items : [ {
				title : '查询条件',
				bodyPadding : 8,
				layout : 'column',
				defaults : {
					margins : '3 10 5 0'
				},
				height : 62,
				items : [{
					id : 'taskState',
					fieldLabel : '当前状态',
					xtype : 'combo',
					dataIndex : 'task_status',
					displayField : 'name',
					emptyText : '请选择',
					valueField : 'value',
					store : comboStore,
					labelWidth : 52,
					editable : false,
					listeners : {
						'select' : selectState
					}
				},{
					id : 'admdiv',
					fieldLabel : '所属财政',
					xtype : 'combo',
					dataIndex : 'admdiv',
					displayField : 'admdiv_name',
					emptyText : '请选择',
					valueField : 'admdiv_code',
					labelWidth : 52,
					editable : false,
					store : comboAdmdiv,
					listeners : {
						'select' : selectAdmdiv
					}
				},  {
					id : 'payDate',
					fieldLabel : '支付日期',
					xtype : 'datefield',
					dataIndex : 'pay_date',
					format : 'Y-m-d',
					labelWidth : 63
				}, {
					id : 'payEnd',
					fieldLabel : '至',
					xtype : 'datefield',
					dataIndex : 'pay_date',
					format : 'Y-m-d',
					labelWidth : 15
				}, {
					id : 'agency',
					fieldLabel : '预算单位',
					xtype : 'textfield',
					dataIndex : 'agency_name',
					labelWidth : 52,
					width : 173
				}, {
					id : 'exp_func_name1',
					fieldLabel : '功能分类',
					xtype : 'textfield',
					dataIndex : 'exp_func_name',
					labelWidth : 52,
					width : 173
				} ],
				flex : 2
			}, gridPanel1 ]
		}) ]
	});
	Ext.getCmp('taskState').setValue("001");
	if (comboAdmdiv.data.length > 0) {
		Ext.getCmp('admdiv').setValue(
				comboAdmdiv.data.getAt(0).get("admdiv_code"));
	}
	selectState();
});

/*******************************************************************************
 * 切换状态
 * 
 * @return
 */
function selectState() {
	var taskState = Ext.getCmp('taskState').getValue();
	var store = null;
	var column = null;
	if ("001" == taskState) {
		Ext.getCmp('printRealPayVoucher').enable(false);
	} else if ("002" == taskState) {
		Ext.getCmp('printRealPayVoucher').disable(false);
	}
	refreshData();

}

function refreshData() {
	gridPanel1.getStore().loadPage(1);
}

function selectAdmdiv() {
	refreshData();
}

function singAndSend(){
	var records = gridPanel1.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请选中一条凭证信息！");
		return;
	}
	var reqIds = "";  // 凭证主键字符串
	var reqVers="";   //凭证lastVer字符串
	for (var i = 0; i < records.length; i++) {
		reqIds += records[i].get("pay_voucher_id");
		reqVers +=records[i].get("last_ver");
		if (i < records.length - 1){
			reqIds += ",";
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
				url : signPayVoucherUrl,
				method : 'POST',
				timeout : 180000, // 设置为3分钟
				params : {
					billTypeId : bill_type_id,
					billIds : reqIds,
					last_vers: reqVers
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


