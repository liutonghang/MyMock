/**
 * 挂账窗口
 * @return {TypeName} 
 */
Ext.define('pb.view.common.BalTransWindow', {
	extend : 'Ext.window.Window',
	alias : 'widget.balTransWindow',
	title : '挂账界面',
	width : 350,
	layout : 'fit',
	resizable : false,
	modal : true,
	closeAction : 'hide',
	zeroAccount : null,
	initComponent : function() {
		var me = this;
		Ext.applyIf(me, {
			items : [ {
				xtype : 'form',
				frame : true,
				bodyPadding : 5,
				renderTo   : Ext.getBody(),
				items:[{
						fieldLabel : '零余额账户',
						xtype : 'textfield',
						name : 'zero_account',
						editable : false,
						value : me.zeroAccount,
						style : 'margin-left:5px;margin-right:5px;'
					},{
						xtype: 'panel',
						border: 0,
						width: 300,
						layout: 'hbox',
						bodyStyle: "background:#DFE9F6;padding:0px 0px 5px 0px",
						items: [{
							xtype: 'textfield',
							name : 'gzAccount',
							fieldLabel: '挂账户',
							readOnly: 'true',
							msgTarget: 'side',
							allowBlank: false,
							style : 'margin-left:5px;margin-right:5px;',
							value: ''
						}, {
							xtype: 'button',
							text: '查询',
							iconCls : 'log',
							handler: function(){
								choseBank();
							}
						}]
				}],
				buttons : [ {
						text : '确定',
						handler : function() {
							var zeroAccount = me.getForm().findField('zero_account').getValue();
							var gzAccount = me.getForm().findField('gzAccount').getValue();
							var params={
								zeroAccount : zeroAccount,
								gzAccount   : gzAccount
							};
							Ext.PageUtil.doRequestAjax(me,'/realware/guazhang.do', params);
							me.hide();
						}
					}, {
						text : '取消',
						handler : function() {
							this.up('form').getForm().reset();
							this.up('window').hide();
						}
					} ]
			} ]
		});
		me.callParent(arguments);
	},
	getForm : function() {
		return this.down('form').getForm();
	}
});
