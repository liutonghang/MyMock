/**
 * 授权支付公务卡/直接支付工资批量业务初审
 * @return {TypeName} 
 */
/*******************************************************************************
 * 引入需要使用的js文件
 */
document.write('<scr'+ 'ipt type="text/javascript" src="/realware/resources/js/recommend.js"></scr'+ 'ipt>');
document.write('<scr'+ 'ipt type="text/javascript" src="/realware/resources/js/share/operationLog.js"></scr'+ 'ipt>');
document.write('<scr'+ 'ipt type="text/javascript" src="/realware/resources/js/share/ocxVoucher.js"></scr'+ 'ipt>');
document.write('<scr'+ 'ipt type="text/javascript" src="/realware/resources/js/share/backVoucher.js"></scr'+ 'ipt>');
document.write('<scr'+ 'ipt type="text/javascript" src="/realware/resources/js/share/exportExcel.js"></scr'+ 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="resources/js/lookPayRequest.js"></scr' + 'ipt>');

/*******************************************************************************
 * 
 * @type
 */

/**
 * 数据项
 */

var fileds = ["pay_voucher_code", "vou_date",
		"pay_amount", "payee_account_no", "payee_account_name",
		"payee_account_bank", "pay_account_no", "pay_account_name",
		"pay_account_bank", "pay_bank_code", "pay_bank_name",
		"sup_dep_code", "sup_dep_name", "agency_code","agency_name",
		"clear_bank_code", "clear_bank_name", "checkNo", "fund_deal_mode_code",
		"fund_deal_mode_name", "fund_type_code", "fund_type_name",
		"pay_type_code", "pay_type_name", "set_mode_code", "set_mode_name",
		"pay_summary_code", "pay_summary_name", "task_id", "pay_voucher_id",
		"bill_type_id", "last_ver", "return_reason","audit_remark"];

/**
 * 列名
 */
var header = "查看明细|do1|70|lookPayRequest,退回原因|return_reason|150,退回原因|audit_remark|150," 
			+"凭证号|pay_voucher_code|140,凭证日期|vou_date|100,支付金额|pay_amount|120,"
			+"收款人账号|payee_account_no|140,收款人名称|payee_account_name|140,收款人银行|payee_account_bank|160," 
			+"付款人账号|pay_account_no|140,付款人名称|pay_account_name|140,付款人银行|pay_account_bank|160,"
			+"一级预算单位编码|sup_dep_code|120,一级预算单位名称|sup_dep_name|140,基层预算单位编码|agency_code|120,基层预算单位名称|agency_name|140,"
			+"用途名称|pay_summary_name|150,代理银行编码|pay_bank_code|120,代理银行名称|pay_bank_name|160,清算银行编码|clear_bank_code|100,清算银行名称|clear_bank_name|140," 
			+"支付方式编码|pay_type_code|80,支付方式名称|pay_type_name|120,资金性质编码|fund_type_code|80,资金性质名称|fund_type_name|120," 
			+"结算方式编码|set_mode_code|80,结算方式名称|set_mode_name|100,结算号|checkNo|120,"
			+ "办理方式编码|fund_deal_mode_code|120,办理方式名称|fund_deal_mode_name|120";

/**
 * 列表
 */
var gridPanel1 = null;


// 支付明细列表面板
var reqPanel = null;

// 明细信息
var reqFileds = ["pay_request_code", "pay_amount","payee_account_no", "payee_account_name", "payee_account_bank",
				"payee_account_bank_no"];

var reqHeader = "明细编码|pay_request_code|100,支付金额|pay_amount|100,收款人账号|payee_account_no|140,"
			+ "收款人名称|payee_account_name|120,收款人银行|payee_account_bank|160,收款行行号|payee_account_bank_no|100";

/**
 * 界面加载
 */
Ext.onReady(function() {
	Ext.QuickTips.init();
	gridPanel1 = getGrid(loadVoucherUrl, header, fileds, true,true);
	gridPanel1.setHeight(document.documentElement.scrollHeight - 112);
	// 根据查询条件检索数据
	gridPanel1.getStore().on('beforeload', function(thiz, options) {
				var admdiv = Ext.getCmp('admdiv').getValue();
				if (admdiv == null || admdiv == "")
					return;
				beforeload(Ext.getCmp("checkQuery"), options, Ext.encode(fileds));
			});
	
	var buttonItems = [{
						id : 'audit',
						handler : function() {
							checkVoucher(true);
						}
					}, {
						id : 'submit',
						handler : function() {
							checkVoucher(false);
						}
					}, {
						id : 'unsubmit',
						handler : function() {
							unAuditPayVoucher();
						}
					}, {
						id : 'back',
						handler : function() {
							backVoucher(backMofUrl,gridPanel1.getSelectionModel().getSelection(),
											"pay_voucher_id","退回财政");
						}
					}, {
						id : 'look',
						handler : function() {
							lookOCX(gridPanel1.getSelectionModel().getSelection(),"pay_voucher_id");
						}
					}, {
						id : 'log',
						handler : function() {
							taskLog(gridPanel1.getSelectionModel().getSelection(),"pay_voucher_code");
						}
					}, {
						id : 'outDataToExcel',
						handler : function() {
							var records = gridPanel1
									.getSelectionModel()
									.getSelection();
							if (records.length == 0) {
								Ext.Msg.alert("系统提示",
										"请选择导出的数据");
								return;
							}
							var excel = new Ext.Excel({
										gridId : 'datagrid',
										sheetName : '支付凭证'
									});
							excel.extGridToExcel();
				
						}
					}, {
						id : 'refresh',
						handler : function() {
							refreshData();
						}
					}];
	
	var queryItems = [{
						title : '查询区',
						id : "checkQuery",
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
							emptyText : '请选择',
							valueField : 'admdiv_code',
							labelWidth : 60,
							width : 180,
							editable : false,
							store : comboAdmdiv
						}, {
							id : 'code',
							fieldLabel : '凭证号',
							xtype : 'textfield',
							symbol : '>=',
							labelWidth : 60,
							width : 180,
							dataIndex : 'pay_voucher_code'
						}, {
							id : 'codeEnd',
							fieldLabel : '至',
							xtype : 'textfield',
							labelWidth : 20,
							width : 140,
							symbol : '<=',
							dataIndex : 'pay_voucher_code '
						}, {
				
							id : 'vouDate',
							fieldLabel : '凭证日期',
							xtype : 'datefield',
							labelWidth : 60,
							width : 160,
							dataIndex : 'vou_date',
							format : 'Ymd'
						}, {
							id : 'checkNo1',
							fieldLabel : '结算号',
							xtype : 'textfield',
							dataIndex : 'checkNo',
							hidden : true,
							labelWidth : 50,
							width : 170
						}]
					}, gridPanel1];

	Ext.StatusUtil.createViewport(buttonItems, queryItems, function() {
		Ext.StatusUtil.initPage(Ext.getCmp("admdiv"), Ext.getCmp("taskState"));
		// 默认设置为未生成
		Ext.getCmp('taskState').setValue("001");
	});
});


/*******************************************************************************
 * 切换状态（初审）
 * 
 * @return
 */
function selectState() {
	var taskState = Ext.getCmp('taskState').getValue();
	if ("001" == taskState) {   //未初审
		Ext.getCmp('audit').enable(false);
		Ext.getCmp('submit').disable(false);
		Ext.getCmp('unsubmit').disable(false);
		Ext.getCmp('back').enable(false);
		Ext.getCmp("return_reason").setVisible(false);
		Ext.getCmp("audit_remark").setVisible(false);
	} else if ("002" == taskState) {   //已初审
		Ext.getCmp('audit').disable(false);
		Ext.getCmp('submit').disable(false);
		Ext.getCmp('unsubmit').enable(false);
		Ext.getCmp('back').disable(false);
		Ext.getCmp("return_reason").setVisible(false);
		Ext.getCmp("audit_remark").setVisible(false);
	} else if ("007" == taskState) {    //已退票
		Ext.getCmp('audit').disable(false);
		Ext.getCmp('submit').disable(false);
		Ext.getCmp('unsubmit').disable(false);
		Ext.getCmp('back').disable(false);
		Ext.getCmp("return_reason").setVisible(true);
		Ext.getCmp("audit_remark").setVisible(false);
	} else {        //被退回
		Ext.getCmp('audit').disable(false);
		Ext.getCmp('submit').enable(false);
		Ext.getCmp('unsubmit').disable(false);
		Ext.getCmp('back').enable(false);
		Ext.getCmp("return_reason").setVisible(false);
		Ext.getCmp("audit_remark").setVisible(true);
	}
}

/**
 * 初审
 * 
 * @param {Object}
 *            isReturn
 * @return {TypeName}
 */
function checkVoucher(isReturn) {
	var records = gridPanel1.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请选中一条凭证信息！");
		return;
	}
	var reqIds = []; // 凭证主键字符串
	var reqVers = []; // 凭证lastVer字符串
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
		url : '/realware/checkVoucherNoBankNO.do',
		method : 'POST',
		timeout : 180000, // 设置为3分钟
		params : {
			billTypeId : records[0].get("bill_type_id"),
			billIds : Ext.encode(reqIds),
			last_vers : Ext.encode(reqVers),
			isCheck : isReturn,
		    menu_id : Ext.PageUtil.getMenuId()
		},
		success : function(response, options) {
			succAjax(response, myMask,true);
		},
		failure : function(response, options) {
			failAjax(response, myMask,true);
		}
	});
}

/*******************************************************************************
 * 撤销审核
 */
function unAuditPayVoucher() {
	var records = gridPanel1.getSelectionModel().getSelection();
    if (records.length == 0) {
        Ext.Msg.alert("系统提示", "请至少选中一条凭证信息");
        return;
    }
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
				url : '/realware/unAuditPayVoucher.do',
				waitMsg : '后台正在处理中,请稍后....',
				method : 'POST',
				timeout : 180000, // 设置为3分钟
				async : false,// 添加该属性即可同步
				params : {
					billTypeId: records[0].get("bill_type_id"),
		            billIds: Ext.encode(reqIds),
		            last_vers: Ext.encode(reqVers),
		            menu_id : Ext.PageUtil.getMenuId()
				},
				success : function(response, options) {
					succAjax(response, myMask,true);
				},
				failure : function(response, options) {
					failAjax(response, myMask,true);
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

