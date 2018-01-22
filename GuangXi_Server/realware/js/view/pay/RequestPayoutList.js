/***
 * 支付凭证列表视图
 * @memberOf {TypeName} 
 */
Ext.define('pb.view.pay.RequestPayoutList', {
	extend : 'pb.view.pay.PayVoucherPanel',
	alias : 'widget.requestPayoutList', //别名
	layout : 'fit',
	frame : false,
	UItitle : '支付凭证列表',
	initComponent : function() {
		this.dockedItems = [ {
				xtype : 'payVoucherQuery'
			} ];
		this.callParent(arguments);
	}
});
