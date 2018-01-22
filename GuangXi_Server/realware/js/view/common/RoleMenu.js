
Ext.define('pb.view.common.RoleMenu', {
	extend : 'Ext.panel.Panel',
	alias : 'widget.rolemenu',
	frame : true,
	layout : 'border',
	border : 0,
	items : [ {
		region : 'west',
		id : 'roletree',
		xtype : 'treepanel',
		rootVisible : false,
		split : true,
		collapsed : false,
		width : 300,
		title : '角色列表',
		store : 'common.RoleTree'
	}, {
		region : 'center',
		id : 'menutree',
		xtype : 'treepanel',
		rootVisible : false,
		store : 'common.RoleMenuTree',
		columns: [ {  
			xtype: 'treecolumn',
	        text : '菜单信息',
	        dataIndex : 'name',
	        width : 600
	    } ]
	} ],
	initComponent : function() {
		this.dockedItems = [ {
			xtype : 'toolbar',
			items : {
				xtype : 'buttongroup',
				items : [ {
					id : 'edit',
					text : '编辑菜单',
					iconCls : 'edit',
					disabled : true,
					scale : 'small'
				}, {
					id : 'noedit',
					text : '取消编辑菜单',
					iconCls : 'cancle',
					disabled : true,
					scale : 'small'
				}, {
					id : 'save',
					text : '保存角色菜单',
					iconCls : 'save',
					disabled : true,
					scale : 'small'
				} ]
			}
		} ];
		this.callParent(arguments);
	}
});
