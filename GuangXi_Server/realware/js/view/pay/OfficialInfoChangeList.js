/***
 * 公务卡变更信息按钮区
 * @memberOf {TypeName} 
 */
Ext.define('pb.view.pay.OfficialInfoChangeList', {
	extend : 'pb.view.pay.OfficialInfoChangePanel',
	alias : 'widget.officialInfoChangeList', //别名
	layout : 'fit',
	frame : true,
	UItitle : '公务卡信息列表',
	initComponent : function() {
		this.dockedItems = [ {
			xtype : 'officialInfoChangeView' //查询区
			} ];
		this.callParent(arguments);
	}
});
