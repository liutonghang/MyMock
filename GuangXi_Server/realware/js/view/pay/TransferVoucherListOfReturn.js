/***
 * 支付凭证列表视图
 * @memberOf {TypeName} 
 */
Ext.define('pb.view.pay.TransferVoucherListOfReturn', {
	extend : 'pb.view.pay.ResPayVoucherPanel',
	alias : 'widget.transferVoucherListOfReturn', //别名
	layout : 'fit',
	frame : false,
	UItitle : '支付凭证列表',
	initComponent : function() {
		this.dockedItems = [{
			xtype : 'payVoucherQueryOfReturn' //查询区
		}];
		this.callParent(arguments);
	}
});
