/*******************************************************************************
 * 公务卡开卡信息签章发送查询
 * 
 * @memberOf {TypeName}
 */
Ext.define('pb.view.pay.OfficialCardMakeList', {
	extend : 'pb.view.pay.OfficialCardMakePanel',
	alias : 'widget.officialCardMakeList', //别名
	layout : 'fit',
	frame : true,
	UItitle : '工资卡信息列表',
	initComponent : function() {
		this.dockedItems = [ {
			xtype : 'officialCardMakeView' //查询区
		}];
		this.callParent(arguments);
}
});
