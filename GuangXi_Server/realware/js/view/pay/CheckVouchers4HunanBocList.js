/***
 * 支付凭证列表视图
 * @memberOf {TypeName} 
 */
Ext.define('pb.view.pay.CheckVouchers4HunanBocList', {
	extend : 'pb.view.pay.CheckVouchers4HunanBOCPanel',
	alias : 'widget.checkVouchers4HunanBocList', //别名
	layout : 'fit',
	frame : false,
	UItitle : '支付凭证列表',
	initComponent : function() {
		this.dockedItems = [{
				xtype : 'checkVouchers4HunanBocQuery' //查询区
			}];
		this.callParent(arguments);
	}
});
