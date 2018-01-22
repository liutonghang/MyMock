/***
 * 菜单编辑窗口
 * @memberOf {TypeName} 
 */
Ext.define('pb.view.common.MenuWindow', {
	extend : 'Ext.window.Window',
	alias : 'widget.menuwindow',
	layout : 'fit',
	height : 400,
	width : 400,
	modal : true,
	title : '菜单编辑窗口',
	initComponent : function() {
		var me = this;
		Ext.applyIf(me, {
			items : [ {
				xtype : 'form',
				frame : true,
				bodyPadding: 10,
				items : [{
					xtype: 'textfield',
					name : 'parent_id',
					hidden : true
				}, {
					fieldLabel : '所属栏目',
					xtype: 'textfield',
					anchor: '90%',
					name : 'parent_name',
					labelWidth: 100,
					readOnly : true
				}, {
					fieldLabel : '编码类型',
					xtype : 'combo',
					name :'codetype',
					anchor: '90%',
					allowBlank : false,
					displayField : 'name',
					editable : false,
					hidden : true,
					valueField : 'value',
					value : 1,
					store : new Ext.data.Store( {
					fields : [ 'name', 'value' ],
						data : [ {
							'name' : '统一',
							'value' : 1
						}, {
							'name' : '个性化',
							'value' : 0
						} ]
					}),
					listeners: {
						//编码类型为:个性化所属财政必选,否不启用
						select : function(o){
							var admdiv = o.ownerCt.getForm().findField('admdivCode');
							if(o.value==0){
								admdiv.setDisabled(false);
								admdiv.setValue('无');
							}else{
								admdiv.setDisabled(true);
							}
						}
					}
				}, {
					fieldLabel : '所属财政',
					xtype : 'combo',
					name : 'admdivCode',
					anchor: '90%',
					displayField : 'admdiv_name',
					emptyText : '无',
					valueField : 'admdiv_code',
					editable : false,
					hidden : true,
					disabled : true,
					store : comboAdmdiv
				}, {
					xtype: 'textfield',
					name : 'id',
					hidden : true
				}, {
					xtype: 'textfield',
					name : 'code',
					hidden : true
				}, {
					fieldLabel : '菜单名称',
					xtype: 'textfield',
					anchor: '90%',
					name : 'name',
					labelWidth: 100,
					allowBlank : false
				}, {
					anchor : '90%',
					layout : 'hbox',
					style : 'margin-top:5px;margin-bottom:5px;',
					bodyStyle: 'background-color:#dfe8f6; border-width: 0px 0px 0px 0px;',
					items : [ {
						name : 'moduleId',
						xtype : 'textfield',
						hidden : true
					}, {
						name : 'menu_module',
						xtype : 'textfield',
						readOnly : true,
						fieldLabel : '功能',
						labelWidth : 100,
						width : 297,
						allowBlank : false
					}, {
						id : 'menu_moduleBtn',
						xtype : 'button',
						text : '...'
					} ]
				}, {
					fieldLabel : '菜单参数',
					xtype : 'textareafield',
					anchor: '90%',
					name : 'parameter',
					labelWidth: 100
//				}, {
//					fieldLabel : '启用日期',
//					xtype: 'datefield',
//					anchor: '90%',
//					name : 'start_date',
//					format : 'Y-m-d',
//					labelWidth: 100
//				}, {
//					fieldLabel : '停用日期',
//					xtype: 'datefield',
//					anchor: '90%',
//					name : 'end_date',
//					format : 'Y-m-d',
//					labelWidth: 100
				}, {
					fieldLabel : '备注',
					xtype: 'textareafield',
					anchor: '90%',
					name : 'remark',
					labelWidth: 100
				}, {
					fieldLabel : '默认是否加载',
					xtype: 'combo',
					anchor: '90%',
					name : 'initialload',
					displayField : 'name',
//					emptyText : '请选择',
					valueField : 'value',
					value : 1,	// 默认加载
					store : Ext.create('Ext.data.Store', {
						fields : ['name', 'value'],
						data : [{
									"name" : "加载",
									"value" : 1
								}, {
									"name" : "不加载",
									"value" : 0
								}]
					}),
					labelWidth: 100
				}],
				buttons : [ {
					id : 'menuSave',
					text : '确定'
				}, {
					id : 'menuClose',
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
