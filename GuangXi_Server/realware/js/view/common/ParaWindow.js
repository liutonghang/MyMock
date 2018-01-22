Ext.define('pb.view.common.ParaWindow', {
	extend : 'Ext.window.Window',
	alias : 'widget.parawindow',
	resizable : true,
	draggable : true,
	layout : 'fit',
	width : 400,
	height : 240,
	modal : true,
	isPublic : 1,
	title : '修改参数窗口',
	initComponent : function() {
		var me = this;
		Ext.applyIf(me, {
			items : [ {
				xtype : 'form',
				frame: true,
                bodyPadding: 10,
				items : [ {
					name : 'is_public',
					fieldLabel : '是否公有',
					xtype : 'textfield',
					anchor: '100%',
					labelWidth: 100,
					hidden : true
				},{
					id : 'nullAble',
					fieldLabel : '可为空',
					xtype : 'combo',
					emptyText : '请选择',
					dataIndex : 'nullable',
					name : 'nullable',
					datatype : 1,
					displayField : 'name',
					valueField : 'value',
					editable : false,
					hidden : true,
					store : Ext.create('Ext.data.Store',{
						fields :['name','value'],
						data :[ {
							name  : '可为空',
							value : 1
						}, {
							name : '不可为空',
							value: 0
						} ]
					})
				}, {
					name : 'admdiv_code',
					fieldLabel : '区划',
					xtype : 'textfield',
					anchor: '100%',
					labelWidth: 100,
					hidden : true
				}, {
					name : 'para_id',
					fieldLabel : '参数主键',
					xtype : 'textfield',
					anchor: '100%',
					labelWidth: 100,
					hidden : true
				}, {
					name : 'para_key',
					fieldLabel : '参数编号',
					xtype : 'textfield',
					anchor: '100%',
					labelWidth: 100,
					readOnly : true
				}, {
					name : 'para_name',
					fieldLabel : '参数名称',
					xtype : 'textfield',
					anchor: '100%',
					labelWidth: 100,
					readOnly : true
				}, {
					name : 'para_value',
					fieldLabel : '私有参数值',
					xtype : 'textfield',
					anchor: '100%',
					labelWidth: 100,
					hidden : me.isPublic==0?false:true,
					allowBlank : me.isPublic==0&&me.nullable==0?false:true,
					allowOnlyWhitespace : me.isPublic==0&&me.nullable==0?false:true
				}, {
					name : 'default_value',
					fieldLabel : '参数值',
					xtype : 'textfield',
					anchor: '100%',
					labelWidth: 100,
					hidden : me.isPublic==1?false:true,
					allowBlank : me.isPublic==1&&me.nullable==0?false:true,//是共用参数，并且不可为空时，设置属性为false
					allowOnlyWhitespace : me.isPublic==1&&me.nullable==0?false:true
				}, {
					name : 'para_remark',
					fieldLabel : '备注',
					xtype : 'textareafield',
					anchor: '100%',
					labelWidth: 100
				} ],
				buttons : [ {
					id : 'paraSave',
					text : '确定'
				}, {
					text : '取消',
					handler : function() {
						this.up('window').close();
					}
				} ]
			} ]
		});
		me.callParent(arguments);
	},
	getForm : function() {
		return this.down('form').getForm();
	},
	setRecord : function(record) {
		this.getForm().loadRecord(record);
	}
});
