/***
 * 功能编辑窗口
 * @memberOf {TypeName} 
 */
Ext.define('pb.view.common.ModuleWindow', {
	extend : 'Ext.window.Window',
	alias : 'widget.modulewindow',
	resizable : false, 
	draggable : false, 
	layout : 'fit',
	height : 500,
	width : 800,
	modal : true,
	title : '功能编辑窗口',
	initComponent : function() {
		var me = this;
		Ext.applyIf(me, {
			items : [ {
				xtype : 'form',
				frame : true,
				renderTo   : Ext.getBody(),
				border : 0,
				layout : 'fit',
				items : {
					xtype : 'tabpanel',
					bodyPadding : 3,
					items : [ {
						title : '基本信息',
						border : 0,
						defaults : {
							labelWidth : 80,
							width : 420,
							style : 'margin-left:10px;margin-right:5px;margin-top:10px;'
						},
						items :[{
							fieldLabel : '所属模块',
							xtype : 'combo',
							anchor : '100%',
							name : 'parent_id',
							allowBlank : false,
							editable : false,
							displayField : 'codename',
							valueField : 'id',
							store :'common.Modules'
						}, {
							anchor : '100%',
							layout : {
								type : 'table',
								columns : 2
							},
                        	bodyStyle: 'border-width: 0px 0px 0px 0px;',
                        	items : [ {
                        		name :'parentCode1',
								xtype: 'textfield',
								fieldLabel : '功能编码',
								readOnly : true,
								labelWidth : 80,
								width : 265,
								style : 'margin-right:5px;'
							}, {
								name : 'code',
								allowBlank : false,
								xtype: 'textfield',
								regex:/^([0-9]*)$/,
								regexText:'必须是数字'
							} ]
						}, {
							fieldLabel : 'JSP名称',
							anchor : '100%',
							name : 'class_name',
							allowBlank : false,
							xtype : 'textfield'
						}, {
							fieldLabel : '功能名称',
							anchor : '100%',
							name : 'name',
							allowBlank : false,
							xtype : 'textfield'
						}, {
							fieldLabel : '功能权限',
							anchor : '100%',
							name : 'dll_path',
							allowBlank : false,
							xtype : 'combo',
							editable : false,
							displayField : 'name',
							valueField : 'value',
							value : '3',
							store : new Ext.data.Store( {
								fields : [ 'name', 'value' ],
								data : [{
		    						'name' : '无',
		    						'value' : ''
		    					}, {
									'name' : '1-辅办网点',
									'value' : '1'
								}, {
									'name' : '2-主办网点',
									'value' : '2'
								}, {
									'name' : '3-无（配置功能）',
									'value' : '3'
								}, {
									'name' : '4-主办行办理网点',
									'value' : '4'
								}, {
									'name' : '5-财政零余额',
									'value' : '5'
								} , {
									'name' : '6-专户',
									'value' : '6'
								} , {
									'name' : '7-划款户',
									'value' : '7'
								} , {
									'name' : '10-自助柜面收入流水使用',
									'value' : '10'
								},  {
									'name' : '41-主办行可以查看直接支付的数据',
									'value' : '41'
								},  {
									'name' : '20-非税财政专户',
									'value' : '20'
								}]
							})
						}, {
							fieldLabel : '个性化脚本',
							anchor : '100%',
							name : 'ref_js',
							allowBlank : true,
							xtype : 'textfield'
						}, {
							fieldLabel : '功能说明',
							xtype : 'textareafield',
							anchor : '100%',
							name : 'remark'
						},{
							name : 'do', //当前操作 'add','edit','copy'
							xtype : 'textfield',
							hidden : true,
							value : 'add'
						},{
							name : 'id', 
							xtype : 'textfield',
							hidden : true
						} ] 
					},{
						id : 'mbpanel',
						title : '功能按钮',
						layout : 'fit',
						xtype : 'gridpanel',
						scroll : true,
						selType : 'rowmodel',
						store : 'common.Buttons',
						plugins : Ext.create('Ext.grid.plugin.RowEditing', {
										clicksToEdit : 2,
										saveBtnText: '保存',
            							cancelBtnText: '取消',
            							errorsText: '错误',
										cancelEdit: function(grid){
												var me = this;
                								if (me.editing) {
                    								me.getEditor().cancelEdit();
                    								var record = me.context.record; 
                    								var grid = me.context.grid;
                    								var items = grid.getSelectionModel().getSelection();
                    								Ext.each(items, function(item) {
                    									if(Ext.isEmpty(item.get("button_id")) 
                    											&& Ext.isEmpty(item.raw["button_id"])) {
                    										grid.getStore().remove(item);
                    									}
                    								});
												}
                						}
						}),
						columns : [ {
								text : '按钮主键',
								dataIndex : 'button_id',
								width : 180,
								field : {
									xtype : 'textfield',
									allowBlank : false,
									blankText : '按钮主键为必输项'
								}
						},{
								text : '按钮名称',
								dataIndex : 'button_name',
								width : 180,
								field : {
									xtype : 'textfield',
									allowBlank : false,
									blankText : '按钮名称为必输项'
								}
						},{
								text : '是否可见',
								width : 80,
								dataIndex : 'visible',
								allowBlank : false,
								value : 0,
								renderer : function(value) {
									if(value==1){
										return '是';
									}else{
										return '否';
									}
								},
								field : {
									xtype : 'combo',
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
							text : '是否个性化',
							width : 80,
							dataIndex : 'custom',
							allowBlank : false,
							value : 0,
							renderer : function(value) {
								if(value==1) {
									return '是';
								} else {
									return '否';
								}
							},
							field : {
								xtype : 'combo',
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
						text : '按钮图标',
						dataIndex : 'icon',
						width : 80,
						field : {
							xtype : 'textfield'
						}
					}, {
						text : '个性化按钮状态<br />(#分隔)',
						dataIndex : 'status_codes',
						align : 'center',
						width : 120,
						field : {
							xtype : 'textfield'
						}
					}, {
						text : '启用区划<br />(#分隔)',
						dataIndex : 'enable_admdivs',
						align : 'center',
						width : 120,
						field : {
							xtype : 'textfield'
						}
					}, {
						text : '禁用区划<br />(#分隔)',
						dataIndex : 'disable_admdivs',
						align : 'center',
						width : 120,
						field : {
							xtype : 'textfield'
						}
					} ],
						dockedItems: [ {
							 xtype: 'toolbar',
							 items: [{
								  id : 'btnAdd',
								  xtype: 'button',
								  text : '新增',
								  iconCls : 'add'
								},{
								  id : 'btnDel',
								  xtype: 'button',
								  text : '删除',
								  iconCls : 'delete'
							 },{
								 id : 'btnTop',
								 xtype: 'button',
								 text : '上移',
								 iconCls : 'to_top'
							},{
								 id : 'btnLow',
								 xtype: 'button',
								 text : '下移',
								 iconCls : 'to_bottom'
							} ]
						} ]
					},{
						title : '状态设置',
						layout : 'fit',
						items :{
							id : 'statuspanel',
							xtype : 'gridpanel',
							scroll : true,
							selType : 'rowmodel',
							store : 'common.Status',
							columns : [ {
								width : 120,
								text :'操作',
								renderer: function (value, metaData, record, rowIndex, colIndex, store, view) { 
									var h3 = "javascript:onStatusUI(" +rowIndex +"," + colIndex + ");";
									return '<a href='+h3+'>设置列表视图</a>';
								}
							},{
								text : '状态编码',
								dataIndex : 'status_code',
								width : 80
							},{
								text : '状态名称',
								dataIndex : 'status_name',
								width : 120
							},{
								text : '是否启用',
								dataIndex : 'is_enabled',
								width : 80,
								renderer : function(value) {
									if(value==1){
										return '是';
									}else{
										return '否';
									}
								}
							},{
								text : '过滤条件',
								dataIndex : 'conditionStr',
								width : 300
							} ]
						},
						dockedItems: [ {
							xtype: 'toolbar',
							items: [{
								 id : 'statusAdd',
								 xtype: 'button',
								 text : '新增',
								 iconCls : 'add'
							},{
								 id : 'statusEdit',
								 xtype: 'button',
								 text : '修改',
								 iconCls : 'edit'
							},{
								 id : 'statusDel',
								 xtype: 'button',
								 text : '删除',
								 iconCls : 'delete'
							},{
								 id : 'statusTop',
								 xtype: 'button',
								 text : '上移',
								 iconCls : 'to_top'
							},{
								 id : 'statusLow',
								 xtype: 'button',
								 text : '下移',
								 iconCls : 'to_bottom'
							} ]
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
		this.addEvents('itemuibuttonclick');
		me.callParent(arguments);
	},
	getForm : function() {
		return this.down('form').getForm();
	},
	setValue : function(record,buttonstore,Status,cdo){
		var form = this.getForm();
		form.findField('class_name').setValue(record.raw.class_name);  
		form.findField('parent_id').setValue(record.raw.parent_id);  
		form.findField('parentCode1').setValue(record.raw.parent_id);  
		form.findField('code').setValue(record.raw.code.substring(3));  
		form.findField('dll_path').setValue(record.raw.dll_path);  
		form.findField('id').setValue(record.raw.id);  
		form.findField('name').setValue(record.raw.name);  
		form.findField('remark').setValue(record.raw.remark);  
		form.findField('ref_js').setValue(record.raw.ref_js); 
		form.findField('do').setValue(cdo);  
		buttonstore.removeAll();
		Status.removeAll();
		buttonstore.insert(0, record.raw.buttons);
		Status.insert(0, record.raw.statusList);
	}
});

//设置列表视图
function onStatusUI(rowIndex, colIndex) {
	var record = Ext.getCmp('statuspanel').getStore().getAt(rowIndex);
	Ext.getCmp('statuspanel').fireEvent('itemuibuttonclick', record);
}
