/***
 * 支付凭证列表视图
 * @memberOf {TypeName} 
 */
Ext.define('pb.view.pay.OfficalCardQueryList', {
	extend : 'pb.view.pay.OfficalCardPanel',
	alias : 'widget.officalCardQueryList', //别名
	layout : 'fit',
	frame : false,
	UItitle : '支付凭证列表',
	initComponent : function() {
		this.dockedItems = [{
				xtype : 'officialCardQuery' //查询区
			}];
		this.callParent(arguments);
	}
});
