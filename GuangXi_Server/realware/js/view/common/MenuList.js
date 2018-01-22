/***
 * 菜单维护主界面
 * @memberOf {TypeName} 
 */
Ext.define('pb.view.common.MenuList', {
	extend : 'Ext.panel.Panel',
	alias : 'widget.menulist',
	frame : true,
	layout : 'fit',
	items : [ {
		scroll : true,
		border : 0,
		xtype : 'treepanel',
		rootVisible : false,
		split : true,
		columns: [{   
	        xtype: 'treecolumn',
	        text : '菜单信息',
	        dataIndex : 'codename',
	        width : 350
	    }, {
	    	text : '启用日期',
	        dataIndex : 'start_date',
	        width : 150
	    }, {
	    	text : '停用日期',
	        dataIndex : 'end_date',
	        width : 150
	      }, {
	    	text : '菜单参数',
	        dataIndex : 'parameter',
	        width : 300
	    }],
		store : 'common.MenuTree'
	} ],
	initComponent : function() {
		this.dockedItems = [ {
			xtype : 'toolbar',
			items : {
				xtype : 'buttongroup',
				items : [ {
					id : 'addMenuParent',
					text : '新增栏目',
					iconCls : 'add',
					scale : 'small'
				}, {
					id : 'editMenuParent',
					text : '修改栏目',
					iconCls : 'edit',
					scale : 'small'
				}, {
					id : 'delMenuParent',
					text : '删除栏目',
					iconCls : 'delete',
					scale : 'small'
				}, {
					id : 'editMenu',
					text : '菜单设置',
					iconCls : 'edit',
					scale : 'small'
				} ]
			}
		} ];
		this.callParent(arguments);
	}
});
