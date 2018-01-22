/***
 * 角色菜单管理
 */
Ext.onReady(function() {
	Ext.QuickTips.init();
	Ext.Loader.setConfig( {
		enabled : true
	});
	Ext.application( {
		name : 'pb',
		appFolder : "js",
		launch : function() {
			Ext.create('Ext.container.Viewport', {
				layout : 'fit',
				items : {
					xtype : 'rolemenu'
				}
			});
		},
		controllers : [ 'common.RoleMenus' ]
	});
})