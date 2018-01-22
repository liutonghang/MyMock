/***
 * 功能模块维护窗口
 * @memberOf {TypeName} 
 */
Ext.define('pb.view.common.ModuleParentWindow', {
	extend : 'Ext.window.Window',
	alias : 'widget.moduleparentwindow',
	layout : 'fit',
	height: 200,
    width: 400,
    modal: true,
    title: '功能模块维护窗口',
	initComponent: function() {
		  var me = this;
		  Ext.applyIf(me, {
            items: [ {
				xtype: 'form',
                frame: true,
                bodyPadding: 10,
				items : [ {
					fieldLabel : '模块编码',
					xtype: 'textfield',
					anchor: '100%',
					name : 'code',
					labelWidth: 100,
					regex:/^([0-9]{3})$/,
					regexText:'必须是数字且长度是3位',
					allowBlank : false
				}, {
					fieldLabel : '模块名称',
					xtype: 'textfield',
					anchor: '100%',
					name : 'name',
					labelWidth: 100,
					allowBlank : false
				}, {
					fieldLabel : '模块说明',
					xtype: 'textareafield',
					anchor: '100%',
					name : 'remark',
					labelWidth: 100
				} ],
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
