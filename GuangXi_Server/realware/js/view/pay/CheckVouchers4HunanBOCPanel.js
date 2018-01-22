/***
 * 支付凭证面板
 * @memberOf {TypeName} 
 */
Ext.define('pb.view.pay.CheckVouchers4HunanBOCPanel', {
	extend : 'Ext.panel.Panel',
	alias : 'widget.CheckVouchers4HunanBOCPanel',
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
			xtype : 'rownumberer',
			width : 30,
			locked : true
		}, {
			id : 'actionBankno',
			xtype : 'actioncolumn',
			dataIndex : 'actionBankno',
			text : '补录行号',
			items : [ {
				icon : '/realware/resources/images/add.png',
				tooltip : '补录行号'
			} ],
			width : 100,
			hidden : true
		}, {
			text : '退票原因',
			dataIndex : 'return_reason',
			width : 130,
			hidden : true
		},{
			text : '退回原因',
			dataIndex : 'audit_remark',
			width : 130,
			hidden : false
		}, {
			text : '收款行行号',
			dataIndex : 'payee_account_bank_no',
			width : 130
		}, {
			text : '银行结算方式名称',
			dataIndex : 'pb_set_mode_name',
			width : 130
		}, {
			text : '银行结算方式编码',
			dataIndex : 'pb_set_mode_code',
			width : 130,
			hidden : true
		}, {
			text : '凭证号',
			dataIndex : 'pay_voucher_code',
			width : 130
		}, {
			text : '凭证日期',
			dataIndex : 'vou_date',
			width : 100
		}, {
			text : '金额',
			dataIndex : 'pay_amount',
			xtype : 'numbercolumn',
			format : '0,0.00',
			align : 'right',
			width : 100
		}, {
			text : '收款人账号',
			dataIndex : 'payee_account_no',
			width : 150
		}, {
			text : '收款人名称',
			dataIndex : 'payee_account_name',
			width : 150
		}, {
			text : '收款人银行',
			dataIndex : 'payee_account_bank',
			width : 150
		}, {
			text : '付款人账号',
			dataIndex : 'pay_account_no',
			width : 150
		}, {
			text : '付款人名称',
			dataIndex : 'pay_account_name',
			width : 150
		}, {
			text : '付款人银行',
			dataIndex : 'pay_account_bank',
			width : 150
		}, {
			text : '代理银行编码',
			dataIndex : 'pay_bank_code',
			width : 150
		}, {
			text : '代理银行名称',
			dataIndex : 'pay_bank_name',
			width : 150
		}, {
			text : '清算银行编码',
			dataIndex : 'clear_bank_code',
			width : 150
		}, {
			text : '清算银行名称',
			dataIndex : 'clear_bank_name',
			width : 150
		}, {
			text : '支付方式编码',
			dataIndex : 'pay_type_code',
			width : 130
		}, {
			text : '支付方式名称',
			dataIndex : 'pay_type_name',
			width : 130
		}, {
			text : '结算方式编码',
			dataIndex : 'set_mode_code',
			width : 130
		}, {
			text : '结算方式名称',
			dataIndex : 'set_mode_name',
			width : 130
		}, {
			text : '用途编码',
			dataIndex : 'pay_summary_code',
			width : 150
		}, {
			text : '用途名称',
			dataIndex : 'pay_summary_name',
			width : 200
		},{
			text : '支票号',
			dataIndex : 'checkno',
			width : 130
		} ];
		return cols;
	}
});
