/***
 * 菜单维护布局
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
							xtype : 'tabpanel',
							items : [ {
								title : '基本信息',
								xtype : 'menulist'
							}, {
								title : '设置',
								xtype : 'mbsvlist',
								hidden : true
							} ]
						}
			});
		},
		controllers : [ 'common.Menu','common.MenuEditWindow','common.MenuBSU','common.MenuStatusWindow']
	});
})