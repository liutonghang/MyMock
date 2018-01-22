/***
 * 菜单编辑窗口
 * @memberOf {TypeName} 
 */
Ext.define('pb.view.common.MenuEditWindow', {
	extend : 'Ext.window.Window',
	alias : 'widget.menueditwindow',
	layout : 'fit',
	height : '90%',
	width : '70%',
	modal : true,
	title : '菜单设置',
	initComponent : function() {
		var me = this;
		Ext.applyIf(me, {
			items : [ {
				title : '【配置工具】菜单项',
				xtype : 'gridpanel',
				store : new Ext.data.Store( {
					fields : [ {
						name : 'id'
					}, {
						name : 'code'
					}, {
						name : 'name'
					}, {
						name : 'parent_id'
					}, {
						name : 'parent_name'
					}, {
						name : 'module_id'
					}, {
						name : 'parameter'
					}, {
						name : 'admdiv_code'
					}, {
						name : 'remark'
					}, {
						name : 'start_date'
					}, {
						name : 'end_date'
					} , {
						name : 'initialload'
					}],
					data : [],
					proxy : 'memory'
				}),
				columns : [ {
					text : '菜单信息',
					dataIndex : 'name',
					width : 600
				} ],
				tbar : [ {
					xtype : 'buttongroup',
					items : [ {
						id : 'add_',
						text : '新增',
						iconCls : 'add',
						scale : 'small'
					}, {
						id : 'edit_',
						text : '修改',
						iconCls : 'edit',
						scale : 'small'
					}, {
						id : 'delete_',
						text : '删除',
						iconCls : 'delete',
						scale : 'small'
					}, {
						id : 'top_',
						text : '上移',
						iconCls : 'to_top',
						scale : 'small'
					}, {
						id : 'low_',
						text : '下移',
						iconCls : 'to_bottom',
						scale : 'small'
					} ]
				} ],
				buttons : [ {
					id : 'saveMenu',
					text : '确定'
				}, {
					id : 'cancelMenu',
					text : '取消'
				} ]
			} ]
		});
		me.callParent(arguments);
	}
});
