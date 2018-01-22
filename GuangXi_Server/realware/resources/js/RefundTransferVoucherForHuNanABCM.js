/*******************************************************************************
 * 主要用于退款复核
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
document.write('<scr'+ 'ipt type="text/javascript" src="/realware/resources/js/VoucherRelation.js"></scr'+ 'ipt>');	
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/createReport.js"></scr' + 'ipt>');


var voucherPanel = null;

/**
 * 数据项
 */
var fileds = ["pay_voucher_code", "vou_date", "pay_amount", "payee_account_no",
		"payee_account_name", "payee_account_bank", "payee_account_bank_no",
		"trans_res_msg", "pay_account_no", "pay_account_name",
		"pay_account_bank", "pay_bank_code", "pay_bank_name",
		"clear_bank_code", "clear_bank_name", "checkNo", "fund_deal_mode_code",
		"fund_deal_mode_name", "fund_type_code", "fund_type_name",
		"pay_type_code", "pay_type_name", "set_mode_code", "set_mode_name",
		"pay_summary_code", "pay_summary_name", "task_id", "pay_voucher_id",
		"bill_type_id","last_ver","cashtransflag","ori_voucher_id","refund_type"];

/**
 * 列名
 */
var header = "查看支付凭证|do1|130|lookPayVoucherByRefundVoucher,凭证号|pay_voucher_code|140,凭证日期|vou_date|100,支付金额|pay_amount|100,收款人账号|payee_account_no,"
		+ "收款人名称|payee_account_name|140,收款人银行|payee_account_bank|140,收款行行号|payee_account_bank_no,交易结果信息|trans_res_msg,"
		+ "付款人账号|pay_account_no,付款人名称|pay_account_name|140,付款人银行|pay_account_bank|140,代理银行编码|pay_bank_code,"
		+ "代理银行名称|pay_bank_name,清算银行编码|clear_bank_code,清算银行名称|clear_bank_name,支票号|checkNo,办理方式编码|fund_deal_mode_code,"
		+ "办理方式名称|fund_deal_mode_name,资金性质编码|fund_type_code,资金性质名称|fund_type_name,支付方式编码|pay_type_code,"
		+ "支付方式名称|pay_type_name,结算方式编码|set_mode_code,结算方式名称|set_mode_name,用途编码|pay_summary_code,"
		+ "用途名称|pay_summary_name";

/*******************************************************************************
 * 状态
 */

/*******************************************************************************
 * 界面加载
 */
Ext.onReady(function() {
	Ext.QuickTips.init();
	//引用工具类
	Ext.Loader.setPath('Ext', 'js/util');
	Ext.require(['Ext.PageUtil']);
	voucherPanel = getGrid(loadUrl, header, fileds, true, true);
	voucherPanel.setHeight(document.documentElement.scrollHeight - 95);
	// 根据查询条件检索数据
	voucherPanel.getStore().on('beforeload', function(thiz, options) {
		beforeload(Ext.getCmp("refundTransferQuery"), options, Ext.encode(fileds));
	});
	var buttonItems = [{
							id : 'transfer',
							handler : function() {
									transferPayVoucher();
								}
						},{
							id : 'print',
							handler : function() {
								var records = voucherPanel.getSelectionModel().getSelection();
								if (records.length != 1) {
									Ext.Msg.alert("系统提示", "请选中一条凭证信息！");
									return;
								}
								var data="[{\"pay_voucher_code\":[\""+records[0].get("pay_voucher_code")+"\"]}]";
								GridPrintDialog('undefined','undefined',"/realware/loadReportByCode.do"
									,"/realware/loadReportData.do","guimian",data,100);
							}
						},{
							id : 'back',
							handler : function() {
								backVoucher("/realware/unsubmitVoucher.do",voucherPanel.getSelectionModel().getSelection(),"pay_voucher_id","退款录入岗");
							}
						}, {
							id : 'log',
							handler : function() {
								taskLog(voucherPanel.getSelectionModel().getSelection(),"pay_voucher_id");
							}
						}, {
							id : 'refresh',
							handler : function() {
								refreshData();
							}
						}];
	var queryItems = [{
							title : '查询区',
							id : 'refundTransferQuery',
							frame : false,
							defaults : {
								padding : '0 3 0 3'
							},
							layout : {
								type : 'table',
								columns : 5
							},
							bodyPadding : 6,
						items : [{
								id : 'taskState',
								fieldLabel : '当前状态',
								xtype : 'combo',
								dataIndex : 'task_status',
								displayField : 'status_name',
								emptyText : '请选择',
								valueField : 'status_code',
								labelWidth : 60,
								width : 160,
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
								editable : false,
								emptyText : '请选择',
								valueField : 'admdiv_code',
								labelWidth : 60,
								width : 160,
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
								dataIndex : 'vou_date',
								labelWidth : 60,
								width : 160
							}],
							flex : 2
						},voucherPanel];

	Ext.StatusUtil.createViewport(buttonItems, queryItems, function() {
		Ext.StatusUtil.initPage(Ext.getCmp("admdiv"), Ext.getCmp("taskState"));
		// 默认设置为未生成
		Ext.getCmp('taskState').setValue("004");
	});
});

/*******************************************************************************
 * 切换状态
 * 
 * @return
 */
function selectState() {
	var taskState = Ext.getCmp('taskState').getValue();
	if ("004" == taskState) {
		Ext.StatusUtil.batchEnable("transfer,back");
		Ext.StatusUtil.batchDisable("print");
	} else if ("008" == taskState) {
		Ext.StatusUtil.batchEnable("print");
		Ext.StatusUtil.batchDisable("transfer,back");
	} else if ("007" == taskState) {
		Ext.StatusUtil.batchDisable("transfer,back,print");
	} else if("009" == taskState) {
		Ext.StatusUtil.batchEnable("transfer,back");
		Ext.StatusUtil.batchDisable("print");
	}
	refreshData();
}


/*******************************************************************************
 * 复核转账
 */
function checkTransferPayVoucher() {
	var records = voucherPanel.getSelectionModel().getSelection();
	if (records.length != 1) {
		Ext.Msg.alert("系统提示", "只能选中一条凭证信息");
		return;
	}
	// 凭证主键字符串
	var reqIds = [];
	var reqVers=[];
	Ext.Array.each(records,function(model){
		reqIds.push(model.get("pay_voucher_id"));
		reqVers.push(model.get("last_ver"));
	});
	var myMask = new Ext.LoadMask(Ext.getBody(), {
			msg : '后台正在处理中，请稍后....',
			removeMask : true // 完成后移除
		});
	myMask.show();
	Ext.Ajax.request({
				url : '/realware/bankTransferVoucher.do',
				method : 'POST',
				timeout : 180000, // 设置为3分钟
				params : {
					// 单据类型id
					billTypeId : records[0].get("bill_type_id"),
					billIds : Ext.encode(reqIds),
					last_vers: Ext.encode(reqVers)
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

/****
 * 转账
 */
var pay_voucher_code = null;
function transferPayVoucher() {
	var records = voucherPanel.getSelectionModel().getSelection();
	if (records.length != 1) {
		Ext.Msg.alert("系统提示", "只能选中一条凭证信息");
		return;
	}
	var me = this;
	pay_voucher_code = records[0].get("pay_voucher_code");
	var form = Ext.create('Ext.form.Panel', {
        layout: 'absolute',
        defaultType: 'textfield',
        border: false,
        bodyStyle: "background:#DFE9F6",
        items: [
        	{
            fieldLabel: '主管代码',
            id:"txtmajorUserCode",
            fieldWidth: 40,
            labelWidth: 70,
            msgTarget: 'side',
            allowBlank: false,
            x: 5,
            y: 5,
            anchor: '-5'  // anchor width by percentage
        }, {
            fieldLabel: '主管密码',
            id:"txtmajorUserCodePwd",
            fieldWidth: 40,
            labelWidth: 70,
            inputType: 'password',
            msgTarget: 'side',
            minLength: 6,
	        maxLength: 6,
            allowBlank: false,
            x: 5,
            y: 35,
            anchor: '-5'  // anchor width by percentage
        }],
        dockedItems: [{
                xtype: 'toolbar', dock: 'bottom', ui: 'footer', layout: { pack: "end" },
                items: [
                    { text: "确认", width: 80, disabled: true, formBind: true, handler: onConfirm, scope: me },
                    { text: "取消", width: 80, handler: onCancel, scope: me }
                ]
            }]

    });
	var win = Ext.create('Ext.window.Window', {
        autoShow: true,
        title: '主管授权',
        width: 300,
        height: 120,
        layout: 'fit',
        plain:true,
        items: form
     });	
	function onConfirm(){
		// 凭证主键字符串
        var reqIds = [];
		var reqVers = [];
		var transType = [];
		Ext.Array.each(records, function(model) {
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
			timeout : 180000, //
			url : '/realware/bankTransferVoucher.do',
			params : {
				// 单据类型id
				billTypeId : records[0].get("bill_type_id"),
				billIds : Ext.encode(reqIds),
				last_vers : Ext.encode(reqVers),
				majorUserCode: Ext.getCmp('txtmajorUserCode').getValue(),
				majorUserCodePwd: Ext.getCmp("txtmajorUserCodePwd").getValue(),
				menu_id :  Ext.PageUtil.getMenuId()
			},
			success : function(response, options) {
//				succAjax(response, myMask,true);
				myMask.hide();
				var msg = response.responseText;
				win.close();
				refreshData();
				Ext.MessageBox.confirm('打印提示', msg+'，请打印记账凭证', print_voucher);
			},
			failure : function(response, options) {
				failAjax(response, myMask);
				win.close();
				refreshData();
			}
		});
	}
	function onCancel(){
		win.close();
	}
}

function print_voucher(id) {
	if (id == "yes") {
		var data="[{\"pay_voucher_code\":[\""+pay_voucher_code+"\"]}]";
		GridPrintDialog('undefined','undefined','/realware/loadReportByCode.do','/realware/loadReportData.do',"guimian",data,100);
	}

}
	
/*******************************************************************************
 * 作废
 */
function voucherInvalidate() {
	var records = voucherPanel.getSelectionModel().getSelection();
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
			url : '/realware/invalidateRefundVoucher.do',
			method : 'POST',
			timeout : 180000, // 设置为3分钟
			params : params,
			//提交成功的回调函数
			success : function(response, options) {
				succMethod(response, options,myMask);
				refreshData();				
			},
			// 提交失败的回调函数
			failure : function(response, options) {
				failMethod(response, options,myMask);
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
	voucherPanel.getStore().loadPage(1);
}
