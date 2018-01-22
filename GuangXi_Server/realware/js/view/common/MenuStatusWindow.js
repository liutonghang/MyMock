/***
 * 菜单编辑窗口
 * @memberOf {TypeName} 
 * @return {TypeName} 
 */
Ext.define('pb.view.common.MenuStatusWindow', {
	extend : 'Ext.window.Window',
	alias : 'widget.menustatuswindow',
	requires: ['pb.view.common.EditGridPanel'],
	height : 480,
	width : 750,
	x : 100,
	y : 5,
	layout : 'fit',
	modal : true,
	initComponent : function() {
		var me = this;
		Ext.applyIf(me, {
			items : [ {
				xtype : 'form',
				frame : true,
				renderTo : Ext.getBody(),
				layout : 'border',
				items : [{
							region : 'north',
							layout : {
								type : 'table',
								columns : 3
							},
							defaults : {
								style : 'margin-left:5px;margin-top:5px;',
								labelWidth : 80,
								width : 230
							},
							items : [ {
								name : 'menu_statusId',
								xtype : 'textfield',
								fieldLabel : '状态主键',
								hidden :true
							}, {
								name : 'menu_status_id',
								xtype : 'textfield',
								fieldLabel : '菜单状态主键',
								hidden :true
							}, {
								name : 'menu_statusCode',
								xtype : 'textfield',
								fieldLabel : '状态编码',
								allowBlank : false,
								readOnly : true
							}, {
								name : 'menu_statusName',
								xtype : 'textfield',
								fieldLabel : '状态名称',
								allowBlank : false
							}, {
								anchor : '100%',
								layout : 'hbox',
								bodyStyle : 'border-width: 0px 0px 0px 0px;',
								items : [ {
									name : 'module_status',
									xtype : 'textfield',
									readOnly : true,
									fieldLabel : '功能状态',
									labelWidth : 80,
									width : 205
								}, {
									id : 'module_statusBtn',
									xtype : 'button',
									text : '...'
								} ]
							}, {
								layout : 'hbox',
								bodyStyle : 'border-width: 0px 0px 0px 0px;',
								items : [ {
									id : 'menuView',
									name : 'menuView',
									xtype : 'textfield',
									fieldLabel : '列表视图模型',
									readOnly : true,
									allowBlank : false,
									labelWidth : 80,
									width : 205
								}, {
									id : 'viewBtn',
									xtype : 'button',
									text : '...'
								} ]
							}, {
								name : 'ui_name',
								xtype : 'textfield',
								fieldLabel : '视图名称',
								allowBlank : false
							}, {
								name : 'ui_pagesize',
								xtype : 'numberfield',
								fieldLabel : '页总条数',
								value : 100,
								maxValue : 300,
								minValue : 1,
								allowBlank : false
							}, {
								name : 'ui_alias',
								xtype : 'textfield',
								fieldLabel : '列表别名',
								allowBlank : false
							}, {
								name : 'is_subtotal',
								xtype : 'combo',
								fieldLabel : '是否小计',
								allowBlank : false,
								displayField : 'name',
								editable : false,
								valueField : 'value',
								store : new Ext.data.Store( {
									fields : [ 'name', 'value' ],
									data : [ {
										'name' : '是',
										'value' : 1
									}, {
										'name' : '否',
										'value' : 0
									} ]
								}),
								renderer : function(value) {
									if (value == 1) {
										return '是';
									} else {
										return '否';
									}
								}
							} ]
						},{
							region : 'center',
							xtype : 'editgrid',
							title : '列表信息',
							addHidden : true,
							store : 'common.MenuUIDetails',
							columns : [ {
								dataIndex : 'dataindex',
								text : '数据源',
								width : 130
							}, {
								dataIndex : 'ui_name',
								text : '列名',
								width : 130,
								field : 'textfield',
								allowBlank : false
							}, {
								text : '列宽',
								dataIndex : 'ui_width',
								field : 'numberfield',
								allowBlank : false,
								width : 80
							}, {
								text : '是否锁定',
								dataIndex : 'locked',
								width : 80,
								field : {
									xtype : 'combo',
									allowBlank : false,
									displayField : 'name',
									editable : false,
									valueField : 'value',
									store : new Ext.data.Store( {
										fields : [ 'name', 'value' ],
										data : [ {
											'name' : '是',
											'value' : 1
										}, {
											'name' : '否',
											'value' : 0
										} ]
									})
								}
							}, {
								text : '值格式',
								dataIndex : 'format',
								width : 130,
								field : 'textfield'
							}, {
								text : '值样式',
								dataIndex : 'align',
								width : 130,
								field : 'textfield'
							}, {
								dataIndex : 'is_visble',
								width : 80,
								text : '是否可见',
								renderer : function(value) {
									if (value == 1) {
										return '是';
									} else {
										return '否';
									}
								},
								field :{
									xtype: 'combo',								
									allowBlank : false,
									blankText : '是否可见为必选项',
									editable : false,
									displayField : 'name',
									valueField : 'value',
									store : new Ext.data.Store( {
										fields : [ 'name', 'value' ],
										data : [ {
											'name' : '是',
											'value' : 1
										}, {
											'name' : '否',
											'value' : 0
										} ]
									})
								}
							}, {
								dataIndex : 'is_null',
								width : 80,
								text : '是否为空',
								renderer : function(value) {
									if (value == 1) {
										return '是';
									} else {
										return '否';
									}
								},
								field : 'combo',
								allowBlank : false,
								blankText : '是否可见为必选项',
								editable : false,
								displayField : 'name',
								valueField : 'value',
								store : new Ext.data.Store( {
									fields : [ 'name', 'value' ],
									data : [ {
										'name' : '是',
										'value' : 1
									}, {
										'name' : '否',
										'value' : 0
									} ]
								})
							}, {
								text : '编辑列校验',
								dataIndex : 'regex',
								field : 'textfield',
								width : 130
							}, {
								text : '编辑列校验提示',
								dataIndex : 'regextext',
								field : 'textfield',
								width : 130
							} ]
						} ]
			} ],
			buttons : [ {
				id : 'save',
				text : '确定'
			}, {
				id : 'close',
				text : '取消'
			} ]
		});
		me.callParent(arguments);
	},
	getForm : function() {
		return this.down('form').getForm();
	},
	setItemsValue : function(menustatus,uistore){
		var form = this.getForm();
		form.findField('menu_status_id').setValue(menustatus.get('menu_status_id'));
		form.findField('menu_statusId').setValue(menustatus.get('status_id'));
		form.findField('menu_statusCode').setValue(menustatus.get('status_code'));
		form.findField('menu_statusName').setValue(menustatus.get('status_name'));
		form.findField('module_status').setValue(menustatus.get('status_code')+ '' + menustatus.get('status_name'));
		var ui = menustatus.get('ui');
		if(uistore!=undefined){
			uistore.removeAll();
		}
		if(ui!=null){
			form.findField('menuView').setValue(ui.control_name);
			form.findField('ui_name').setValue(ui.view_name);
			form.findField('ui_pagesize').setValue(ui.pagesize);
			form.findField('ui_alias').setValue(ui.view_alias);
			form.findField('is_subtotal').setValue(ui.is_subtotal);
			if(uistore!=undefined){
				uistore.insert(0,ui.details);
			}
		}
	}
});