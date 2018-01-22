/***
 * 菜单树
 * @memberOf {TypeName} 
 */
Ext.define('pb.view.common.UserMenuTree', {
	extend : 'Ext.tree.Panel',
	alias : 'widget.usermenutree',
	frame : true,
	store : 'common.UserMenuTree',
	hideHeaders : true,
	rootVisible : false,
	title : '系统菜单导航',
	split : true,
	collapsible : true,
	collapsed : false,
	width : 200,
	border : 0,
	viewConfig : {
		plugins : {
			ptype : 'treeviewdragdrop'
		}
	},
	initComponent : function() {
		this.callParent(arguments);
	}
});
