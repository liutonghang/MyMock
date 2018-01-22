/*******************************************************************************
 * 主要用于退款历史凭证的导入
 * 
 * @type
 */

/***
 * 引入需要使用的js文件
 */
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/recommend.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/operationLog.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/importFile.js"></scr' + 'ipt>');


var voucherPanel = null;

/**
 * 数据项
 */

var fileds = ["pay_voucher_code", "vou_date", "pay_amount","refund_type", "payee_account_no",
		"payee_account_name", "payee_account_bank", "payee_account_bank_no",
		"pay_account_no", "pay_account_name", "pay_account_bank",
		"pay_bank_code", "pay_bank_name", "clear_bank_code", "clear_bank_name",
		"checkNo", "fund_deal_mode_code", "fund_deal_mode_name",
		"fund_type_code", "fund_type_name", "pay_type_code", "pay_type_name",
		"set_mode_code", "set_mode_name", "pay_summary_code",
		"pay_summary_name", "task_id", "pay_voucher_id", "bill_type_id","last_ver","remark","ori_voucher_id","pay_refund_amount"];

/**
 * 列名
 */
var header = "凭证号|pay_voucher_code|140,凭证日期|vou_date|100,支付金额|pay_amount|100,收款人账号|payee_account_no,"
		+ "收款人名称|payee_account_name|140,收款人银行|payee_account_bank|140,收款行行号|payee_account_bank_no,"
		+ "付款人账号|pay_account_no,付款人名称|pay_account_name|140,付款人银行|pay_account_bank|140,代理银行编码|pay_bank_code,"
		+ "代理银行名称|pay_bank_name,清算银行编码|clear_bank_code,清算银行名称|clear_bank_name,支票号|checkNo,办理方式编码|fund_deal_mode_code,"
		+ "办理方式名称|fund_deal_mode_name,资金性质编码|fund_type_code,资金性质名称|fund_type_name,支付方式编码|pay_type_code,"
		+ "支付方式名称|pay_type_name,结算方式编码|set_mode_code,结算方式名称|set_mode_name,用途编码|pay_summary_code,"
		+ "用途名称|pay_summary_name,备注|remark";

/*******************************************************************************
 * 界面加载
 */
Ext.onReady(function() {
	Ext.QuickTips.init();
	// 引用工具类
	Ext.Loader.setPath('Ext', 'js/util');
	Ext.require(['Ext.PageUtil']);
	if (voucherPanel == null) {
		voucherPanel = getGrid(loadUrl, header, fileds, true, true);
		voucherPanel.setHeight(document.documentElement.scrollHeight - 95);
		// 根据查询条件检索数据
		voucherPanel.getStore().on('beforeload', function(thiz, options) {
			beforeload(Ext.getCmp("refundCheckQuery"), options, Ext.encode(fileds));
		});
	}

	voucherPanel.title = "退款历史凭证";

	var buttonItems = [					{ 
											id : 'import',
											handler : function() {
												importFile('/realware/importRefundHisVoucher.do','xls', Ext.getCmp('admdiv').getValue());
											}
										}, {
											id : 'delete',
											handler : function() {
												deleteRefundHisVoucher();
											}
										}, {
											id : 'refresh',
											handler : function() {
												refreshData();
											}
										}];



		var queryItems = [ {
			title : "查询区",
			id : 'refundCheckQuery',
			bodyPadding : 8,
			layout : 'hbox',
			defaults : {
				margins : '3 5 0 0'
			},
			items : [
					{
						id : 'admdiv',
						fieldLabel : '所属财政',
						xtype : 'combo',
						dataIndex : 'admdiv_code',
						displayField : 'admdiv_name',
						emptyText : '请选择',
						valueField : 'admdiv_code',
						labelWidth : 60,
						width : 160,
						store : comboAdmdiv,
						value : comboAdmdiv.data.length > 0 ? comboAdmdiv.data
								.getAt(0).get("admdiv_code") : "",
						editable : false,
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
						dataIndex : ' pay_voucher_code'
					}, {
						id : 'vouDate',
						fieldLabel : '凭证日期',
						xtype : 'datefield',
						dataIndex : 'vou_date',
						format : 'Ymd',
						labelWidth : 60,
						width : 160
					}, {
						id : 'checkNo1',
						fieldLabel : '支票号',
						xtype : 'textfield',
						dataIndex : 'checkNo',
						labelWidth : 40,
						width : 140
					} ]
		},voucherPanel ];

 Ext.StatusUtil.createViewport(buttonItems, queryItems, function() {
		Ext.StatusUtil.initPage(Ext.getCmp("admdiv"), Ext.getCmp("buttongroup"));
	});
});



function selectAdmdiv() {
	setBtnVisible(Ext.getCmp("admdiv").getValue(), null);
	refreshData();
}
/*******************************************************************************
 * 删除退款历史凭证
 */
var billIds1 = [];
var reqVers1=[];
var bill_type_id1="";
function deleteRefundHisVoucher(){
	 billIds1 = [];
	 reqVers1=[];
	 bill_type_id1="";
	var records = voucherPanel.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请选中一条凭证信息！");
		return;
	}
	// 选中的凭证的id数组，要传到后台
	for (var i = 0; i < records.length; i++) {
		
		if(records[i].get("pay_refund_amount") && records[i].get("pay_refund_amount")>0){
			Ext.Msg.alert("系统提示", "凭证号"+records[i].get("pay_voucher_code")+"已录入退款通知书，不可被删除！");
			return;
		}
		
		billIds1.push(records[i].get("pay_voucher_id"));
		reqVers1.push(records[i].get("last_ver"));
	}
	bill_type_id1 = records[0].get("bill_type_id");
	Ext.MessageBox.confirm('删除提示', '是否确定删除'+billIds1+'等账号？', delVoucher);
}
function delVoucher(id) {
	if (id == "yes") {
		var myMask = new Ext.LoadMask(Ext.getBody(), {
			msg : '后台正在处理中，请稍后....',
			removeMask : true
		// 完成后移除
				});
		myMask.show();
		Ext.Ajax.request( {
			url : '/realware/delRefundHisVoucher.do',
			method : 'POST',
			timeout : 180000, //设置为3分钟
			params : {
				billIds : Ext.encode(billIds1),
				billTypeId : bill_type_id1,
				last_vers :Ext.encode( reqVers1)
			},
			success : function(response, options) {
				succAjax(response, myMask,true);
				refreshData()
			},
			failure : function(response, options) {
				failAjax(response, myMask);
				refreshData()
			}
		});
	}
}

/*******************************************************************************
 * 刷新
 * 
 * @return
 */
function refreshData() {
	voucherPanel.getStore().loadPage(1);
}
