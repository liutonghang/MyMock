/***
 * 功能模块维护窗口
 * @memberOf {TypeName} 
 */
Ext.define('pb.view.pay.OffiMadeWindow', {
	extend : 'Ext.window.Window',
	alias : 'widget.offiMadeWindow',
	layout : 'fit',
	height: 200,
    width: 400,
    modal: true,
    title: '卡号维护窗口',
	initComponent: function() {
		  var me = this;
		  Ext.applyIf(me, {
            items: [ {
				xtype: 'form',
                frame: true,
                bodyPadding: 30,
				items : [{
					id:'card_no',
					fieldLabel : '卡号',
					xtype: 'textfield',
					anchor: '100%',
					name : 'name',
//					regex:/^(628)[0-9]{13}$/,
//					regexText:'必须是数字且以628开头且长度为16位 .',
					labelWidth: 100,
					allowBlank : false
				}, {
					id:'affirm_card_no',
					fieldLabel : '确认卡号',
					xtype: 'textfield',
					anchor: '100%',
					name : 'name',
//					regex:/^(628)[0-9]{13}$/,
//					regexText:'必须是数字且以628开头且长度为16位 .',
					labelWidth: 100,
					allowBlank : false
				}, {
					id:'card_made_date',
					fieldLabel : '制卡日期',
					xtype: 'datefield',
					anchor: '100%',
					name : 'name',
					labelWidth: 100,
					allowBlank : false
				}],
				buttons : [ {
					id : 'parentSave',
					text : '确定'
				}, {
					id : 'parentClose',
					text : '取消'
				} ]
			} ]
		})
		me.callParent(arguments);
	},
	getForm : function() {
		return this.down('form').getForm();
	}
});
