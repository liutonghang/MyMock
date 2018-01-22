/***
 * 支付凭证列表视图
 * @memberOf {TypeName} 
 */
Ext.define('pb.view.pay.BCheckVoucherListHunanBOC', {
	extend : 'pb.view.pay.ResPayVoucherPanel',
	alias : 'widget.bCheckVoucherListHunanBOC', //别名
	layout : 'fit',
	frame : false,
	UItitle : '支付凭证列表',
	initComponent : function() {
		
		this.dockedItems = [{
				xtype : 'bPayVoucherQueryHunanBOC' //查询区
			}];
		this.callParent(arguments);
	}
});
