/***
 * 菜单按钮、状态列表视图设置
 * @memberOf {TypeName} 
 */
Ext.define('pb.view.common.MenuBSUList',{
					extend : 'Ext.panel.Panel',
					alias : 'widget.mbsvlist', //别名
					frame : true,
					layout : 'border',
					items : [ {
						region : 'center',
						id : 'viewPanel',
						xtype : 'gridpanel',
						title : '列表信息',
						columns : [ {
							xtype : 'rownumberer',
							width : 30,
							locked : true
						}, {
							text : '列主键',
							dataIndex : 'ui_id',
							width : 180
						}, {
							text : '列名',
							dataIndex : 'ui_name',
							width : 150
						}, {
							text : '列类型',
							dataIndex : 'ui_xtype',
							width : 130,
							renderer : function(value) {
								if (value == 1) {
									return '操作列';
								} else if (value == 2) {
									return '数字列';
								} else if (value == 3) {
									return '编辑列';
								} else if (value == 4) {
									return '组合列';
								} else if (value == 5) {
									return '日期列';
								} else {
									return '普通列';
								}
							}
						}, {
							text : '数据源',
							dataIndex : 'dataindex',
							width : 150
						}, {
							text : '列宽',
							dataIndex : 'ui_width',
							width : 100
						}, {
							text : '是否可见',
							dataIndex : 'is_visble',
							width : 100,
							renderer : function(value) {
								if (value == 1) {
									return '是';
								} else {
									return '否';
								}
							}
						}, {
							text : '是否锁定',
							dataIndex : 'locked',
							width : 100,
							renderer : function(value) {
								if (value == 1) {
									return '是';
								} else {
									return '否';
								}
							}
						}, {
							text : '值格式',
							dataIndex : 'format',
							width : 130
						}, {
							text : '值样式',
							dataIndex : 'align',
							width : 130
						}, {
							text : '编辑列是否可为空',
							dataIndex : 'is_null',
							width : 130,
							renderer : function(value) {
								if (value == 1) {
									return '是';
								} else {
									return '不';
								}
							}
						}, {
							text : '组合列数据源',
							dataIndex : 'store_name',
							width : 130
						}, {
							text : '操作列函数名',
							dataIndex : 'action_name',
							width : 130
						}, {
							text : '数字列是否小计',
							dataIndex : 'is_subtotal',
							width : 100,
							renderer : function(value) {
								if (value == 1) {
									return '是';
								} else {
									return '不';
								}
							}
						}, {
							text : '编辑列校验',
							dataIndex : 'regex',
							width : 130
						}, {
							text : '编辑列校验提示',
							dataIndex : 'regextext',
							width : 130
						} ],
						store : 'common.MenuUIDetails',
						tbar : [{
							id : 'statusCbx',
							fieldLabel : '状态信息',
							xtype : 'combo',
							displayField : 'status_name',
							emptyText : '请选择',
							valueField : 'status_id',
							editable : false,
							store : 'common.MenuStatus',
							queryMode: 'local', 
							style : 'margin-left:5px;margin-right:5px;margin-top:5px;margin-bottom:5px',
							labelWidth : 80,
							width : 230
						},{
							id : 'ms_add_btn',
							xtype : 'button',	
							text :'新增',
							disabled : true,
							border: 1,
							style: {
    							borderColor: '#d3d3d3',
    							borderStyle: 'solid'
							}
						},{
							id : 'ms_edit_btn',
							xtype : 'button',	
							text :'修改',
							disabled : true,
							border: 1,
							style: {
    							borderColor: '#d3d3d3',
    							borderStyle: 'solid'
							}
						},{
							id : 'ms_del_btn',
							xtype : 'button',	
							text :'删除',
							disabled : true,
							border: 1,
							style: {
    							borderColor: '#d3d3d3',
    							borderStyle: 'solid'
							}
						}]
					}, {
						region : 'west',
						collapsible : true,
						collapsed : false,
						width : 230,
						id : 'buttonPanel',
						xtype : 'gridpanel',
						disabled : true,
						plugins : Ext.create('Ext.grid.plugin.RowEditing', {
							clicksToEdit : 2,
							saveBtnText: '保存',
            				cancelBtnText: '移除',
            				errorsText: '错误',
							cancelEdit: function(grid){
								var me = this;
                				if (me.editing) {
                    				me.getEditor().cancelEdit();
                    				var record = me.context.record; 
                    				var grid = me.context.grid;
                    				var items = grid.getSelectionModel().getSelection();
                    				Ext.each(items, function(item) {
                    					grid.getStore().remove(item);
                    				})
								}
                			}
						}),
						title : '按钮信息',
						columns : [ {
							text : '按钮名称',
							dataIndex : 'button_name',
							xtype : 'gridcolumn',
							width : 160,
							field : {
								xtype : 'textfield'
							}
						},{
							text : '是否可见',
							xtype : 'gridcolumn',
							dataIndex : 'visible',
							width : 70,
							field : {
								xtype : 'combo',
								allowBlank : false,
								displayField : 'name',
								editable : false,
								valueField : 'value',
								store : new Ext.data.Store( {
									fields : [ 'name','value' ],
									data : [ {
										'name' : '是',
										'value' : 1
									}, {
										'name' : '否',
										'value' : 0
									} ]
								})
							},
							renderer : function(value) {
								if (value == 1) {
									return '是';
								}else{
									return '否';
								}
							}
						} ],
						store : 'common.MenuButton',
						tbar : [{
							id : 'modulebutton',
							xtype : 'button',
							disabled : true,
							text :'匹配功能按钮信息',
							border: 1,
							style: {
    							borderColor: '#d3d3d3',
    							borderStyle: 'solid'
							}
						} ]
					} ],
					initComponent : function() {
						this.dockedItems = [
								{
									xtype : 'toolbar',
									items : {
										xtype : 'buttongroup',
										items : [ {
											id : 'editMenuBSU',
											text : '编辑',
											iconCls : 'edit',
											scale : 'small'
										}, {
											id : 'noeditMenuBSU',
											text : '取消编辑',
											iconCls : 'cancle',
											scale : 'small',
											disabled : true
										}, {
											id : 'saveMenuBSU',
											text : '保存',
											iconCls : 'save',
											scale : 'small',
											disabled : true
										}, {
											id : 'deleteMenuBSU',
											text : '删除',
											iconCls : 'delete',
											scale : 'small'
										} ]
									}
								},{
									xtype : 'panel',
									title : '查询区',
									collapsible : true,
									layout : {
										type : 'table',
										columns : 4
									},
									defaults : {
										bodyStyle : 'padding:5px',
										labelWidth : 80
									},
									frame : true,
									items : [{
												id : 'menuParent',
												fieldLabel : '所属模块',
												xtype : 'combo',
												displayField : 'name',
												valueField : 'id',
												store : 'common.MenuParent',
												labelWidth : 80,
												width : 270,
												editable : false,
												style : 'margin-left:5px;margin-right:5px;margin-top:5px;'
											},{
												id : 'cbxMenu',
												fieldLabel : '所属菜单',
												xtype : 'combo',
												displayField : 'codename',
												valueField : 'id',
												store : 'common.Menus',
												labelWidth : 80,
												width : 360,
												editable : false,
												style : 'margin-left:5px;margin-right:5px;margin-top:5px;'
											},{
												id : 'admdivCode',
												fieldLabel : '所属财政',
												xtype : 'combo',
												dataIndex : 'admdiv_code',
												displayField : 'admdiv_name',
												emptyText : '无',
												valueField : 'admdiv_code',
												editable : false,
												store : comboAdmdiv,
												value : comboAdmdiv.data.length > 0 ? comboAdmdiv.data.getAt(0).get('admdiv_code') : '',
												style : 'margin-left:5px;margin-right:5px;margin-top:5px;margin-bottom:5px',
												labelWidth : 80,
												width : 210
											
											} ]
								} ];
						this.callParent(arguments);
					}
				});
