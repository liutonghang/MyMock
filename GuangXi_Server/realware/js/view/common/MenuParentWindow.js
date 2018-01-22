/***
 * 菜单模块维护窗口
 * @memberOf {TypeName} 
 */
Ext.define('pb.view.common.MenuParentWindow', {
	extend : 'Ext.window.Window',
	alias : 'widget.menuparentwindow',
	layout : 'fit',
	height: 150,
    width: 400,
    modal: true,
	initComponent: function() {
		  var me = this;
		  Ext.applyIf(me, {
            items: [ {
				xtype: 'form',
                frame: true,
                bodyPadding: 10,
				items : [ {
					xtype: 'textfield',
					name : 'id',
					hidden : true
				}, {
					fieldLabel : '模块编码',
					xtype: 'textfield',
					anchor: '100%',
					name : 'code',
					labelWidth: 100,
					regex:/^([0-9]{6})$/,
					regexText:'必须是数字且长度是6位',
					allowBlank : false
				}, {
					fieldLabel : '模块名称',
					xtype: 'textfield',
					anchor: '100%',
					name : 'name',
					labelWidth: 100,
					allowBlank : false
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
