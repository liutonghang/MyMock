//凭证信息
var fileds1 = ["admdiv_code","pay_voucher_code", "vou_date", "pay_amount",
		"payee_account_no", "payee_account_name", "payee_account_bank",  
		"payee_account_bank_no", "pay_account_no", "pay_account_name",
		"pay_account_bank", "pay_bank_code", "pay_bank_name",
		"clear_bank_code", "clear_bank_name", "checkNo", "fund_deal_mode_code",
		"fund_deal_mode_name", "fund_type_code", "fund_type_name",
		"pay_type_code", "pay_type_name", "set_mode_code", "set_mode_name",
		"pay_summary_code", "pay_summary_name", "task_id", "pay_voucher_id",
		"bill_type_id", "last_ver", "pay_bank_no","vt_code","pay_date"];


var header1 = "凭证号|pay_voucher_code|130,凭证日期|vou_date|100,支付金额|pay_amount|120,收款人账号|payee_account_no|130,"
		+ "收款人名称|payee_account_name|140,收款人银行|payee_account_bank|140,收款行行号|payee_account_bank_no,"
		+ "付款人账号|pay_account_no,付款人名称|pay_account_name|140,付款人银行|pay_account_bank|140,代理银行行号|pay_bank_no,"
		+ "代理银行名称|pay_bank_name,清算银行编码|clear_bank_code,清算银行名称|clear_bank_name,支票号|checkNo,办理方式编码|fund_deal_mode_code,"
		+ "办理方式名称|fund_deal_mode_name,资金性质编码|fund_type_code,资金性质名称|fund_type_name,支付方式编码|pay_type_code,"
		+ "支付方式名称|pay_type_name,结算方式编码|set_mode_code,结算方式名称|set_mode_name,用途编码|pay_summary_code,"
		+ "用途名称|pay_summary_name,支付日期|pay_date|140";

function lookPayVoucher(grid, rowIndex, colIndex, node, e, record, rowEl) {
	var record = grid.getStore().getAt(rowIndex).data;
	voucherPanel = getGrid("getPayVoucherByClearId.do", header1, fileds1, false, true,"v_");
	voucherPanel.getStore().on('beforeload', function(thiz, options) {
		options.params = [];
		options.params["filedNames"] = JSON.stringify(fileds1);
		options.params["id"] = record.pay_clear_voucher_id;
	});
	voucherPanel.getStore().load({
				method : 'post',
				params : {
					start : 0,
					pageSize : 200,
					limit : 25
				}
			});
	Ext.widget('window', {
				id : 'voucherWindow',
				title : '支付凭证信息',
				width : 700,
				height : 400,
				layout : 'fit',
				resizable : false,
				modal : true,
				items : [voucherPanel]
			}).show();
}