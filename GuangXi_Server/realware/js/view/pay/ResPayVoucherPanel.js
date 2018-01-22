/***
 * 支付凭证面板
 * @memberOf {TypeName} 
 */
Ext.define('pb.view.pay.ResPayVoucherPanel', {
	extend : 'Ext.panel.Panel',
	alias : 'widget.resPayVoucherPanel',
	layout: {
        type: 'vbox',
        align: 'center'
    },
    shrinkWrap : 0,
	frame : false,
	
	initComponent : function() {
    	
		var buttons = Ext.StatusUtil.getAllButtons(this.config.buttonList);
    	
		this.UItitle = this.config.name;
		
		this.dockedItems = [{
			xtype : 'buttongroup', //按钮区
			items : buttons
			}].concat(this.dockedItems);
		this.callParent(arguments);
	},
	getCols : function() {
		var cols = [ {
			id : 'rownumberer',
			xtype : 'rownumberer',
			width : 30,
			locked : true
		}, {
			id : 'urgent_flag',
			text : '加急标志',
			dataIndex : 'urgent_flag',
			width : 130
		},{
			id : 'return_reason',
			text : '退票原因',
			dataIndex : 'return_reason',
			width : 130
		},{
			id : 'payee_account_bank_no',
			text : '收款行行号',
			dataIndex : 'payee_account_bank_no',
			width : 130
		}, {
			id : 'pb_set_mode_name',
			text : '银行结算方式名称',
			dataIndex : 'pb_set_mode_name',
			width : 130
		}, {
			id : 'pb_set_mode_code',
			text : '银行结算方式编码',
			dataIndex : 'pb_set_mode_code',
			width : 130
		}, {
			id : 'bankbusinesstype',
			text : '银行业务',
			dataIndex : 'bankbusinesstype',
			width : 130,
			hidden : true
		}, {
			id : 'pay_voucher_code',
			text : '凭证号',
			dataIndex : 'pay_voucher_code',
			width : 130
		}, {
			id : 'vou_date',
			text : '凭证日期',
			dataIndex : 'vou_date',
			width : 100
		}, {
			id : 'pay_amount',
			text : '支付金额',
			dataIndex : 'pay_amount',
			xtype : 'numbercolumn',
			format : '0,0.00',
			align : 'right',
			width : 100
		}, {
			id : 'payee_account_no',
			text : '收款人账号',
			dataIndex : 'payee_account_no',
			width : 150
		}, {
			id : 'payee_account_name',
			text : '收款人名称',
			dataIndex : 'payee_account_name',
			width : 150
		}, {
			id : 'payee_account_bank',
			text : '收款人银行',
			dataIndex : 'payee_account_bank',
			width : 150
		}, {
			id : 'pay_account_no',
			text : '付款人账号',
			dataIndex : 'pay_account_no',
			width : 150
		}, {
			id : 'pay_date',
			text : '付款日期',
			dataIndex : 'pay_date',
			width : 150
		}, {
			id : 'pay_account_name',
			text : '付款人名称',
			dataIndex : 'pay_account_name',
			width : 150
		}, {
			id : 'pay_account_bank',
			text : '付款人银行',
			dataIndex : 'pay_account_bank',
			width : 150
		}, {
			id : 'pay_bank_code',
			text : '代理银行编码',
			dataIndex : 'pay_bank_code',
			width : 150
		}, {
			id : 'pay_bank_name',
			text : '代理银行名称',
			dataIndex : 'pay_bank_name',
			width : 150
		}, {
			id : 'clear_bank_code',
			text : '清算银行编码',
			dataIndex : 'clear_bank_code',
			width : 150
		}, {
			id : 'clear_bank_name',
			text : '清算银行名称',
			dataIndex : 'clear_bank_name',
			width : 150
		}, {
			id : 'fund_deal_mode_code',
			text : '办理方式编码',
			dataIndex : 'fund_deal_mode_code',
			width : 130
		}, {
			id : 'fund_deal_mode_name',
			text : '办理方式名称',
			dataIndex : 'fund_deal_mode_name',
			width : 130
		},{
			id : 'pay_type_code',
			text : '支付方式编码',
			dataIndex : 'pay_type_code',
			width : 130
		}, {
			id : 'pay_type_name',
			text : '支付方式名称',
			dataIndex : 'pay_type_name',
			width : 130
		}, {
			id : 'set_mode_code',
			text : '结算方式编码',
			dataIndex : 'set_mode_code',
			width : 130
		}, {
			id : 'set_mode_name',
			text : '结算方式名称',
			dataIndex : 'set_mode_name',
			width : 130
		}, {
			id : 'fund_type_code',
			text : '资金性质编码',
			dataIndex : 'fund_type_code',
			width : 130
		}, {
			id : 'fund_type_name',
			text : '资金性质名称',
			dataIndex : 'fund_type_name',
			width : 130
		}, {
			id : 'pay_summary_code',
			text : '用途编码',
			dataIndex : 'pay_summary_code',
			width : 150
		}, {
			id : 'pay_summary_name',
			text : '用途名称',
			dataIndex : 'pay_summary_name',
			width : 200
		}, {
			id : 'checkno',
			text : '支票号',
			dataIndex : 'checkno',
			width : 130
		} ];
		return cols;
	}
});
