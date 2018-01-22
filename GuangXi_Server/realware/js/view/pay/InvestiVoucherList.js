/***
 * 支付凭证列表视图
 * @memberOf {TypeName} 
 */
Ext.define('pb.view.pay.InvestiVoucherList', {
	extend : 'pb.view.pay.PayVoucherPanel',
	alias : 'widget.investiVoucherList', //别名
	layout : 'fit',
	frame : true,
	UItitle : '支付凭证列表',
	initComponent : function() {
		this.dockedItems = [ {
				xtype : 'payVoucherQuery2' //查询区
			} ];
		this.callParent(arguments);
	}
});
