/***
 * 支付凭证列表视图
 * @memberOf {TypeName} 
 */
Ext.define('pb.view.pay.CheckVoucherListHunanBOC', {
	extend : 'pb.view.pay.PayVoucherPanelHunanBOC',
	alias : 'widget.checkVoucherListHunanBOC', //别名
	layout : 'fit',
	frame : false,
	UItitle : '支付凭证列表',
	initComponent : function() {
		this.dockedItems = [{
				xtype : 'payVoucherQueryHunanBOC' //查询区
			}];
		this.callParent(arguments);
	}
});
