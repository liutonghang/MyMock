/***
 * 财政【直接】和 【授权】退款通知书 录入
 * @memberOf {TypeName} 
 */
Ext.define('pb.view.pay.RefundVoucherInputList', {
	extend : 'pb.view.pay.PayVoucherPanel',
	alias : 'widget.refundVoucherInputList', //别名
	requires: ['pb.view.common.ActionTextColumn'],
	layout : 'fit',
	frame : false,
	UItitle : '退款通知书列表',
	initComponent : function() {
		this.dockedItems = [{
				xtype : 'payVoucherQuery' //查询区
			}].concat(this.dockedItems);
		this.callParent(arguments);
	},
	getCols : function() {
		var cols = [ {
			xtype : 'rownumberer',
			width : 30,
			locked : true
		}, {
			text : '凭证号',
			dataIndex : 'pay_voucher_code',
			width : 130
		}, {
			text : '凭证日期',
			dataIndex : 'vou_date',
			width : 100
		}, {
			text : '退款金额',
			dataIndex :'pay_amount',
			xtype : 'numbercolumn',
			format : '0,0.00',
			align : 'right',
			width : 100,
			summaryType : 'sum',
			summaryRenderer : function(value, summaryData, dataIndex) {
				return value=='0.00'?'': '小计:' + Ext.util.Format.number(value,'0,0.00');
			}
		}, {
			text : '退款类型',
			dataIndex : 'refund_type',
			width : 130,
			renderer : function(value) {
				if(value==1){
					return '按明细退款';
				}else if(value==2){
					return '按单退款';
				}else{
					return '';
				}
			}
		}, {
			text : '代理银行编码',
			dataIndex : 'pay_bank_code',
			width : 150
		}, {
			text : '代理银行名称',
			dataIndex : 'pay_bank_name',
			width : 150
		}, {
			text : '原凭证号',
			dataIndex : 'ori_payvoucher_code',
			width : 130
		}, {
			text : '原收款人账号',
			dataIndex : 'payee_account_no',
			width : 150
		}, {
			text : '原收款人名称',
			dataIndex : 'payee_account_name',
			width : 150
		}, {
			text : '原收款人银行',
			dataIndex : 'ori_payee_account_bank',
			width : 150
		}, {
			text : '原收款行行号',
			dataIndex : 'payee_account_bank_no',
			width : 150
		}, {
			text : '原付款人账号',
			dataIndex : 'pay_account_no',
			width : 150
		}, {
			text : '原付款人名称',
			dataIndex : 'pay_account_name',
			width : 150
		}, {
			text : '原付款人银行',
			dataIndex : 'pay_account_bank',
			width : 150
		}, {
			text : '银行交易流水号',
			dataIndex : 'agent_business_no',
			width : 130
		}, {
			text : '基层预算单位编码',
			dataIndex : 'agency_code',
			width : 130
		}, {
			text : '基层预算单位名称',
			dataIndex : 'agency_name',
			width : 130
		}, {
			text : '实际退款日期',
			dataIndex : 'pay_date',
			width : 130
		}, {
			text : '备注',
			dataIndex : 'remark',
			width : 130
		}, {
			text : '预留字段1',
			dataIndex : 'hold1',
			width : 130
		}, {
			text : '预留字段2',
			dataIndex : 'hold2',
			width : 130
		}, {
			text : '预留字段3',
			dataIndex : 'hold3',
			width : 130
		}, {
			text : '预留字段4',
			dataIndex : 'hold4',
			width : 130
		} ];
		return cols;
	}
});
