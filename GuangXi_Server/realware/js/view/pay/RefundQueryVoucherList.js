/*******************************************************************************
 * 退款支付凭证查询
 * 
 * @memberOf {TypeName}
 */
Ext.define('pb.view.pay.RefundQueryVoucherList',{
	extend : 'pb.view.pay.QueryVoucherList',
	alias : 'widget.refundQueryVoucherList',
	getCols : function() {
		var cols = this.callParent(arguments);
		cols = Ext.Array.insert(cols, 4, [{
			text : '原凭证号',
			dataIndex : 'ori_payvoucher_code',
			width : 130
		}] ); 
		return cols;
	}
});
