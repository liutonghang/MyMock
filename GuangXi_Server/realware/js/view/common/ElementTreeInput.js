/***
 * 要素辅助录入树
 * @memberOf {TypeName} 
 * @return {TypeName} 
 */
Ext.define('pb.view.common.ElementTreeInput', {
	extend : 'Ext.panel.Panel',
	alias : 'widget.treeInput',
	layout : 'hbox',
	labelName : '文本标题',
	labelWidth : 90,
	txtWidth : 215,
	eleCode : null,
	rawValue : null,
	txtNull : true,
	width : 240,
	bodyStyle : 'border-width: 0px 0px 0px 0px;',
	initComponent : function() {
		var me = this;
		var txt = {
			xtype : 'textfield',
			readOnly : false,
			fieldLabel : me.labelName,
			labelWidth : me.labelWidth,
			width : me.txtWidth,
			allowBlank : me.txtNull
		};
		Ext.applyIf(me, {
			items : [ txt,{
				xtype : 'button',
				text : '...'
			} ]
		});
		me.callParent(arguments);
	}
});