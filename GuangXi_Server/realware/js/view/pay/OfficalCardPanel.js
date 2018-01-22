/***
 * 支付凭证面板
 * @memberOf {TypeName} 
 */
Ext.define('pb.view.pay.OfficalCardPanel', {
	extend : 'Ext.panel.Panel',
	alias : 'widget.officalCardPanel',
	layout: {
        type: 'vbox',
        align: 'center'
    },
    shrinkWrap : 0,
	frame : false,
	initComponent : function() {
		var buttons = Ext.StatusUtil.getAllButtons(this.config.buttonList);
		this.UItitle = this.config.name;
		this.dockedItems = [{
			xtype : 'buttongroup', //按钮区
			items : buttons
			}].concat(this.dockedItems);
		this.callParent(arguments);
	},
	getCols : function() {
		var cols = [{
     		xtype : 'rownumberer',
			width : 30,
			locked : true
     	},
     	{
     		text : '持卡人姓名',
			dataIndex : 'card_holder',
			width : 130
     	},
     	{
     		text : '身份证号',
			dataIndex : 'card_holder_no',
			width : 130
     	},
     	 {
			text : '卡类型',
			dataIndex : 'card_type',
			width : 100
		}, {
			text : '卡状态',
			dataIndex : 'card_status',
			width : 130
		}];
		return cols;
	}
});
