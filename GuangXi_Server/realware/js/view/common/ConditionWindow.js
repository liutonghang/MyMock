/***
 * 过滤条件选择框
 * @memberOf {TypeName} 
 * @return {TypeName} 
 */
Ext.define('pb.view.common.ConditionWindow', {
	extend : 'Ext.window.Window',
	alias : 'widget.conditionwindow',
	height : 500,
	width : 700,
	layout : 'fit',
	modal: true, //模式窗口
	statusRecord : null, //当前是编辑状态的过滤条件还是新增,
	title : '过滤条件设置',
	initComponent : function() {
		var me = this;
		Ext.applyIf(me, {
			items : [ {
					xtype : 'editgrid',
					scroll : true,
					topHidden : true,
					lowHidden : true,
					store : 'common.Conditions',
					columns : [ {
						text : '条件类型',
						width : 80,
						dataIndex : 'type',
						value : 0,
						renderer : function(value) {
							if (value == 1) {
								return '自定义条件';
							}else {
								return '普通条件';
							}
						},
						field : {
							xtype : 'combo',
							allowBlank : false,
							editable : false,
							displayField : 'name',
							valueField : 'value',
							store : new Ext.data.Store( {
								fields : [ 'name', 'value' ],
								data : [ {
									'name' : '普通条件',
									'value' : 0
								}, {
									'name' : '自定义条件',
									'value' : 1
								}]
							})
						}
					}, {
						text : '操作符',
						dataIndex : 'operation',
						value : 'and',
						width : 60,
						field : {
							xtype : 'combo',
							allowBlank : true,
							blankText : '操作符为必输项',
							displayField : 'name',
							editable : false,
							valueField : 'name',
							store : new Ext.data.Store( {
								fields : [ 'name' ],
								data : [ {
									'name' : 'and'
								}, {
									'name' : 'or'
								} ]
							})
						}
					}, {
						text : '参数名',
						width : 100,
						dataIndex : 'attr_code',
						field : {
							xtype : 'textfield',
							allowBlank : true
						}
					}, {
						text : '别名',
						width : 60,
						dataIndex : 'alias',
						field : {
							xtype : 'textfield'
						}
					}, {
						text : '逻辑符',
						width : 60,
						dataIndex : 'relation',
						value : '=',
						field : {
							xtype : 'combo',
							allowBlank : true,
							blankText : '逻辑符为必输项',
							editable : false,
							displayField : 'value',
							valueField : 'value',
							store : new Ext.data.Store( {
								fields : [ 'value' ],
								data : [ {
									'value' : '='
								}, {
									'value' : '<>'
								}, {
									'value' : '>'
								}, {
									'value' : '>='
								}, {
									'value' : '<'
								}, {
									'value' : '<='
								}, {
									'value' : 'LIKE'
								}, {
									'value' : 'NOT LIKE'
								}, {
									'value' : 'IN'
								}, {
									'value' : 'NOT IN'
								} ]
							})
						}
					}, {
						text : '值类型',
						width : 60,
						dataIndex : 'datatype',
						value : 0,
						renderer : function(value) {
							if (value == 0) {
								return 'String';
							}else if(value == 1){
								return 'number';
							}else{
								return 'date';
							}
						},
						field : {
							xtype : 'combo',
							allowBlank : false,
							editable : false,
							displayField : 'name',
							valueField : 'value',
							store : new Ext.data.Store( {
								fields : [ 'name', 'value' ],
								data : [ {
									'name' : 'String',
									'value' : 0
								}, {
									'name' : 'number',
									'value' : 1
								}, {
									'name' : 'date',
									'value' : 2
								} ]
							})
						}
					}, {
						text : '参数值',
						width : 200,
						dataIndex : 'value',
						field : {
							xtype : 'textfield',
							allowBlank : false,
							blankText : '参数值为必输项'
						}
					} ], 
					buttons : [ {
						text : '确定',
						handler : function() {
							me.fireEvent('saveConditionclick',me,Ext.ComponentQuery.query('editgrid', me)[0]);
						}
					}, {
						text : '取消',
						handler : function() {
							me.close();
						}
					} ],
					dockedItems: [ {
						layout : 'vbox',
						border : 0,
						bodyStyle: 'border-width: 0px 0px 0px 0px;',
						items : [ {
                        	name : 'statusCode',
							xtype: 'textfield',
							fieldLabel : '状态编码',
							regex:/^([0-9]{3})$/,
							regexText:'必须是数字且长度是3位',
							allowBlank : false,
							blankText : '状态编码为必输项',
							labelWidth : 100,
							width : 400,
							style : 'margin-left:5px;margin-right:5px;margin-top:5px;margin-bottom:5px;',
							value : this.statusRecord!=null?this.statusRecord.get('status_code'):''
						}, {
                        	name : 'statusName',
							xtype: 'textfield',
							fieldLabel : '状态名称',
							allowBlank : false,
							blankText : '状态名称为必输项',
							labelWidth : 100,
							width : 400,
							style : 'margin-left:5px;margin-right:5px;margin-top:5px;margin-bottom:5px;',
							value : this.statusRecord!=null?this.statusRecord.get('status_name'):''
						}, {
							name : 'isEnabled',
							xtype : 'combo',
							fieldLabel : '是否启用',
							editable : false,
							labelWidth : 100,
							width : 400,
							style : 'margin-left:5px;margin-right:5px;margin-top:5px;margin-bottom:5px;',
							displayField : 'name',
							valueField : 'value',
							value : this.statusRecord!=null?this.statusRecord.get('is_enabled'):1,
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
						}]
					} ]
				} ]
		});
		//注入过滤条件保存事件至当前窗口
		me.addEvents('saveConditionclick');
		me.callParent(arguments);
	}
});