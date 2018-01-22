/***
 * 授权支付特殊指令列表视图
 * @memberOf {TypeName} 
 */
Ext.define('pb.view.pay.ConfirmCashVoucherList', {
	extend : 'pb.view.pay.PayVoucherPanel', // 继承支付凭证面板
	alias : 'widget.cashVoucherList', //别名
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
