/***
 * 批量支付凭证面板
 * @memberOf {TypeName} 
 */
Ext.define('pb.view.pay.BatchPayVoucherPanelForSRCB', {
	extend : 'Ext.panel.Panel',
	alias : 'widget.batchPayPanelForSRCB',
	frame : false,
	getCols : function() {
		var cols = [ {
			xtype : 'rownumberer',
			width : 30,
			locked : true
		},  {
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
			width : 100,
			summaryType : 'sum',
			summaryRenderer : function(value, summaryData, dataIndex) {
				return value=='0.00'?'': '小计:' + Ext.util.Format.number(value,'0,0.00');
			}
		},  {
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
			text : '支付方式编码',
			dataIndex : 'pay_type_code',
			width : 130
		}, {
			text : '支付方式名称',
			dataIndex : 'pay_type_name',
			width : 130
		}, {
			text : '资金性质编码',
			dataIndex : 'fund_type_code',
			width : 130
		}, {
			text : '资金性质名称',
			dataIndex : 'fund_type_name',
			width : 130
		}, {
			text : '基层预算单位编码',
			dataIndex : 'agency_code',
			width : 130
		}, {
			text : '基层预算单位名称',
			dataIndex : 'agency_name',
			width : 130
		}];
		return cols;
	}
});
