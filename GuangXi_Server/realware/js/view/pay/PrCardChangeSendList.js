/*******************************************************************************
 * 卡变更明细信息查询
 * 
 * @memberOf {TypeName}
 */
Ext.define('pb.view.pay.PrCardChangeSendList', {
	extend : 'pb.view.pay.PrCardChangeSendPanel',
	alias : 'widget.prCardChangeSendList', //别名
	layout : 'fit',
	frame : true,
	UItitle : '工资卡信息列表',
	initComponent : function() {
		this.dockedItems = [ {
				xtype : 'prCardChangeSendView' //查询区
			} ];
		this.callParent(arguments);
	}
});
