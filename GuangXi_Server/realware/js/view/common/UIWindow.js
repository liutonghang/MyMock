/***
 * 列表视图设置框
 * @memberOf {TypeName} 
 * @return {TypeName} 
 */
Ext.define('pb.view.common.UIWindow', {
	extend : 'Ext.window.Window',
	alias : 'widget.uiwindow',
	requires: ['pb.view.common.EditGridPanel'],
	height : 500,
	width : 500,
	layout : 'fit',
	modal: true,
	title : '列表视图设置',
	statuRecord : {},
	initComponent : function() {
		var me = this;
		var ui = this.statuRecord.get('ui');
		Ext.applyIf(me, {
			items : {
					xtype : 'form',
					layout : 'border',
					items : [{
						region : 'north',
						defaults : {
							labelWidth : 80,
							width : 320,
							style : 'margin-left:5px;margin-right:5px;margin-top:5px;margin-bottom:5px;'
						},
						items :[ {
							layout : 'hbox',
							style : 'margin-left:5px;margin-top:5px;margin-bottom:5px;',
							bodyStyle : 'border-width: 0px 0px 0px 0px;',
							items : [ {
								id : 'moduleView',
								name : 'moduleView',
								xtype : 'textfield',
								fieldLabel : '列表视图模型',
								readOnly : true,
								allowBlank : false,
								labelWidth : 80,
								width : 295,
								value : ui!=null?ui.control_name:null
							}, {
								id : 'viewBtn',
								xtype : 'button',
								text : '...'
							} ]
						}, {
							name : 'ui_name',
							xtype : 'textfield',
							fieldLabel : '视图名称',
							allowBlank : false,
							value : ui!=null?ui.view_name:null
						}, {
							name : 'ui_alias',
							xtype : 'textfield',
							fieldLabel : '视图别名',
							allowBlank : false,
							value : ui!=null?ui.view_alias:null
						}, {
							name : 'ui_pagesize',
							xtype : 'numberfield',
							fieldLabel : '页总条数',
							value : ui!=null?ui.pagesize:100,
							maxValue : 300,
							minValue : 1,
							allowBlank : false
						}, {
							name : 'is_subtotal',
							xtype : 'combo',
							fieldLabel : '是否小计',
							allowBlank : false,
							displayField : 'name',
							editable : false,
							value : ui!=null?ui.is_subtotal:1,
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
						addHidden : true,
						store : 'common.ModuleUIDetails',
						columns : [ {
							dataIndex : 'dataindex',
							text : '数据源',
							width : 130
						}, {
							dataIndex : 'ui_xtype',
							text : '列类型',
							width : 130,
							renderer : function(value) {
								if(value==1){
									return '操作列';
								}else if(value==2){
									return '数字列';
								}else if(value==3){
									return '编辑列';
								}else if(value==4){
									return '组合框';
								}else if(value==5){
									return '日期列';
								}else{
									return '普通列';
								}
							},
							field : { 
								xtype: 'combo',
								allowBlank : false,
								blankText : '列类型为必选项',
								editable : false,
								displayField : 'name',
								valueField : 'value',
								store : new Ext.data.Store( {
									fields : [ 'name', 'value' ],
									data : [ {
										'name' : '操作列',
										'value' : 1
									}, {
										'name' : '数字列',
										'value' : 2
									}, {
										'name' : '编辑列',
										'value' : 3
									}, {
										'name' : '组合框',
										'value' : 4
									}, {
										'name' : '日期列',
										'value' : 5
									}, {
										'name' : '普通列',
										'value' : 0
									} ]
								})
							}
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
							field : { 
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
							text : '是否锁定',
							dataIndex : 'locked',
							width : 80,
							renderer : function(value) {
								if (value == 1) {
									return '是';
								} else {
									return '否';
								}
							},
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
							field : {
								xtype : 'combo',
								allowBlank : false,
								displayField : 'name',
								editable : false,
								valueField : 'name',
								store : new Ext.data.Store( {
									fields : [ 'name'],
									data : [ {
										'name' : 'center'
									}, {
										'name' : 'left'
									}, {
										'name' : 'right'
									} ]
								})
							}
						}, {
							dataIndex : 'is_null',
							width : 130,
							text : '编辑列是否可为空',
							renderer : function(value) {
								if(value==1){
									return '是';
								}else if(value==0){
									return '不';
								}else{
									return '';
								}
							},
							field :{ 
								xtype :'combo',
								editable : false,
								displayField : 'name',
								valueField : 'value',
								store : new Ext.data.Store( {
									fields : [ 'name', 'value' ],
									data : [ {
										'name' : '',
										'value' : -1
									}, {
										'name' : '是',
										'value' : 1
									}, {
										'name' : '否',
										'value' : 0
									} ]
								})
							}
						}, {
							dataIndex : 'action_name',
							text : '操作方法',
							width : 130,
							field : 'textfield'
						}, {
							dataIndex : 'store_name',
							text : '组合列数据集',
							width : 130,
							field : 'textfield'
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
					} ],
					buttons : [ {
						id : 'saveUIBtn_',
						text : '确定'
					}, {
                        id : 'closeUIBtn_',
						text : '取消'
					} ]
				} 
		});
		me.callParent(arguments);
	},
	getForm : function() {
		return this.down('form').getForm();
	}
});