/***
 * 代编支付凭证录入
 * @memberOf {TypeName} 
 */
Ext.define('pb.view.pay.EditorInputVoucherList', {
	extend : 'pb.view.pay.PayVoucherPanel',
	alias : 'widget.editorVoucherList',
	layout : 'fit',
	frame : true,
	UItitle : '授权支付凭证列表',
	initComponent : function() {
		this.dockedItems = [{
				xtype : 'payVoucherQuery' //查询区
			}];
		this.callParent(arguments);
	}
});
