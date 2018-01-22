/***
 * 支付凭证列表视图
 * @memberOf {TypeName} 
 */
Ext.define('pb.view.pay.TransferVoucherList', {
	extend : 'pb.view.pay.PayVoucherPanel',
	alias : 'widget.transferVoucherList', //别名
	layout : 'fit',
	frame : false,
	UItitle : '支付凭证列表',
	initComponent : function() {
		this.dockedItems = [{
			xtype : 'payVoucherQuery' //查询区
		}];
		this.callParent(arguments);
	}
});