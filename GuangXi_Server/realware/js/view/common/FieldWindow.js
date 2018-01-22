/**
 * 字段映射明细窗口
 * @memberOf {TypeName} 
 */
Ext.define('pb.view.common.FieldWindow', {
	extend : 'Ext.window.Window',
	alias : 'widget.fieldwindow',
	resizable : false, 
	draggable : true, 
	layout : 'fit',
	height: document.body.clientHeight * 0.9,
  	width: document.body.clientWidth * 0.7,
	modal : true,
	title : '字段映射明细配置窗口',
	initComponent : function() {
		var me = this;
		Ext.applyIf(me, {
			items : [ {
				xtype : 'form',
				frame : false,
				renderTo : Ext.getBody(),
				border : 0,
				layout : 'fit',
				items : {
					xtype : 'tabpanel',
					bodyPadding : 10,
					items : [ {
						id : 'mbpanel',
						title : '主单设置',
						layout : 'fit',
						xtype : 'gridpanel',
						scroll : true,
						selType : 'rowmodel',
						store : 'common.ReflectField',
						plugins : Ext.create('Ext.grid.plugin.RowEditing', {
								clicksToEdit : 2,
								autoCancel : false,
						        saveBtnText:'确定',
						        cancelBtnText:'取消',
						        errorsText:'错误',
						        dirtyText:'你要确认或取消更改',
						        errorSummary : false,
						         // 添加监听事件点击保存则将数据保存到数据库中
   								listeners:{
									canceledit : function( editor, context, eOpts ) {
										var record = context.record;
										var store = context.store;
						  				var index = context.rowIdx;
						  				if(Ext.isEmpty(record.get("reflect_id"))) {
							  				store.removeAt(index);
							  			}
  									}
								}
					}),
						columns : this.getCols()
					},{
							id : 'detailpanel',
							title : '明细设置',
							layout : 'fit',
							xtype : 'gridpanel',
							scroll : true,
							selType : 'rowmodel',
							store : 'common.ReflectFieldDetail',
							plugins : Ext.create('Ext.grid.plugin.RowEditing', {
								clicksToEdit : 2,
								autoCancel : false,
						        saveBtnText:'确定',
						        cancelBtnText:'取消',
						        errorsText:'错误',
						        dirtyText:'你要确认或取消更改',
						        errorSummary : false,
						         // 添加监听事件点击保存则将数据保存到数据库中
   								listeners:{
									canceledit : function( editor, context, eOpts ) {
										var record = context.record;
						  				var store = context.store;
						  				var index = context.rowIdx;
						  				if(Ext.isEmpty(record.get("reflect_id"))) {
							  				store.removeAt(index);
							  			}
  									}
								}
						}),
						columns :  this.getCols()
				} ],
					dockedItems: [ {
							xtype: 'toolbar',
							items: [{
								 id : 'winAdd',
								 iconCls : 'add',
								 xtype: 'button',
								 text : '新增'
							},{
								 id : 'winDel',
								 xtype: 'button',
								 iconCls : 'delete',
								 text : '删除'
							},{
								 id : 'winTop',
								 iconCls : 'to_top',
								 xtype: 'button',
								 text : '上移'
							},{
								 id : 'winLow',
								 iconCls : 'to_bottom',
								 xtype: 'button',
								 text : '下移'
							} ]
						} ]
				},
				buttons : [ {
					id : 'moduleSave',
					text : '确定'
				}, {
					id : 'moduleClose',
					text : '取消'
				} ]
			} ]
		})
		me.callParent(arguments);
	},
	getForm : function() {
		return this.down('form').getForm();
	},
	
	getCols : function() {
		var cols = [{
				xtype : 'rownumberer',
				width : 30,
				locked : false
			},{
				text : '按钮主键',
				dataIndex : 'field_id',
				width : 180,
				hidden : true,
				field : {
					xtype : 'textfield',
					allowBlank : true,
					blankText : '按钮名称为必输项'
					}
					
			},{
					text : 'reflect_id',
				dataIndex : 'reflect_id',
				hidden : true,
				width : 180,
				field : {
					xtype : 'textfield',
					allowBlank : true,
					blankText : '按钮名称为必输项'
					}
			},{
					text : '报文字段名称',
				dataIndex : 'field_yname',
				width : 120,
				field : {
					xtype : 'textfield',
					allowBlank : true,
					blankText : '按钮名称为必输项'
					}
			},{
					text : '对应dto名称',
				dataIndex : 'dto_name',
				width : 120,
				field : {
					xtype : 'textfield',
					allowBlank : true,
					blankText : '按钮名称为必输项'
					}
			},{
					text : '字段顺序',
				dataIndex : 'field_order',
				width : 60,
				hidden :true,
				field : {
					xtype : 'textfield',
					allowBlank : true,
					blankText : '按钮名称为必输项'
					}
			},{
					text : '字段长度',
				dataIndex : 'field_length',
				width : 80,
				field : {
					xtype : 'textfield',
					allowBlank : true,
					blankText : '按钮名称为必输项'
					}
			},{
				text : '字段类型',
				dataIndex : 'field_type',
				width : 90,
				field : {
					xtype : 'combo',
					editable : false,
					displayField : 'name',
					valueField : 'value',
					store : new Ext.data.Store( {
						fields : [ 'name', 'value' ],
						data : [ {
							'name' : 'Ingeter',
							'value' : 'Ingeter'
						}, {
							'name' : 'NString',
							'value' : 'NString'
							},{
							'name' : 'GBString',
							'value' : 'GBString'
							},{
							'name' : 'String',
							'value' : 'String'
							},{
							'name' : 'Currency',
							'value' : 'Currency'
							},{
							'name' : 'Date',
							'value' : 'Date'
							}]
						})
					}
			},{
				text : '字段别名',
				dataIndex : 'field_zname',
				width : 120,
				field : {
					xtype : 'textfield',
					allowBlank : true,
					blankText : '按钮名称为必输项'
					}
			},{
				text : '字段默认值',
				dataIndex : 'default_value',
				width : 100,
				field : {
					xtype : 'textfield',
					allowBlank : true,
					blankText : '按钮名称为必输项'
					}
			},{
				text : '是否可为空',
				width : 70,
				dataIndex : 'nullable',
				value : 0,
				renderer : function(value) {
					if(value==1){
						return '否';
					}else{
						return '是';
					}
				},
				field : {
					xtype : 'combo',
					editable : true,
					displayField : 'name',
					valueField : 'value',
					store : new Ext.data.Store( {
						fields : [ 'name', 'value' ],
						data : [ {
							'name' : '否',
							'value' : 1
						}, {
							'name' : '是',
							'value' : 0
							} ]
						})
					}
			},{
				text : '格式化字符串',
				dataIndex : 'format_value',
				width : 120,
				field : {
					xtype : 'textfield',
					allowBlank : true,
					blankText : '按钮名称为必输项'
					}
			},{
				text : '是否主单',
				width : 70,
				enable :true,
				dataIndex : 'is_bill',
				allowBlank : true,
				renderer : function(value) {
					if(value==1){
						return '是';
					}else{
						return '否';
					}
				},
				field : {
					xtype : 'combo',
					disabled :true,
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
						}
			];
		return cols;
	}
	
});

