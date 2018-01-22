Ext.define('pb.view.common.ParameterList',{
		extend : 'Ext.panel.Panel',
		alias : 'widget.parameterlist',
		frame : true,
		layout : 'fit',
		items : [ {
				scroll : true,
				border : 0,
				xtype : 'treepanel',
				title : '系统参数列表',
				rootVisible : false,
				columns : [ {
					xtype : 'treecolumn',//树状表格列   
					text : '参数编码',
					dataIndex : 'para_key',
					width : 180
				}, {
					text : '参数名称',
					dataIndex : 'para_name',
					width : 180
				}, {
					itemId : 'para_value',
					text : '参数值',
					dataIndex : 'para_value',
					width : 320
				}, {
					itemId : 'default_value',
					text : '参数值',
					dataIndex : 'default_value',
					width : 320
				}, {
					text : '备注说明',
					dataIndex : 'para_remark',
					width : 300
				} ],
				store : 'common.Parameters'
		} ],
		initComponent : function() {
			this.dockedItems = [{
					xtype : 'toolbar',
					items : {
						xtype : 'buttongroup',
						items : [ {
							id : 'paraEdit',
							text : '修改',
							iconCls : 'edit',
							scale : 'small'
						}, {
							id : 'paraSync',
							text : '同步',
							iconCls : 'add',
							scale : 'small'
						}, {
							id : 'paraRefresh',
							text : '刷新',
							iconCls : 'refresh',
							scale : 'small'
						} ]
					}
			}, {
				name : 'queryView',
				title : '查询区',
				collapsible : true,
				layout : {
					type : 'table',
					columns : 4
				},
				defaults : {
					bodyStyle : 'padding:5px',
					labelWidth : 60
				},
				items : [ {
					id : 'isPublic',
					fieldLabel : '参数类型',
					xtype : 'combo',
					emptyText : '请选择',
					dataIndex : 'is_public',
					datatype : 1,
					displayField : 'name',
					valueField : 'value',
					editable : false,
					style : 'margin-left:10px;margin-right:10px;margin-bottom:10px;margin-top:10px;',
					value : 1,
					store : Ext.create('Ext.data.Store',{
						fields :['name','value'],
						data :[ {
							name  : '公用',
							value : 1
						}, {
							name : '私有',
							value: 0
						} ]
					})
				}, {
					id : 'admdivCode',
					fieldLabel : '所属财政',
					xtype : 'combo',
					emptyText : '请选择',
					displayField : 'admdiv_name',
					valueField : 'admdiv_code',
					editable : false,
					style : 'margin-left:10px;margin-right:10px;margin-bottom:10px;margin-top:10px;',
					store : comboAdmdiv,
					value : comboAdmdiv.data.length > 0 ? comboAdmdiv.data.getAt(0).get('admdiv_code'): ''
				} ]
			} ];
			this.callParent(arguments);
		}
});
