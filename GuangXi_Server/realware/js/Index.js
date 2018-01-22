/***
 * 主页面
 */
Ext.onReady(function() {
	Ext.QuickTips.init();
	Ext.Loader.setConfig( {
		enabled : true
	});
	Ext.Loader.setPath('Ext.ux', 'resources/ux/');
	Ext.require(['Ext.tab.*', 'Ext.ux.TabCloseMenu']);
	Ext.application( {
		name : 'pb',//应用的名字
		appFolder : "js",//应用的目录
		launch : function() {//当前页面加载完成执行的函数
			Ext.create('Ext.container.Viewport', {
				layout : 'border',
				items : [ {
					region : 'north',
					xtype : 'pagehead'
				}, {
					region : 'center',
					xtype : 'pagetabs'
				}, {
					region : 'west',
					xtype : 'usermenutree'
				} ]
			});
		},
		controllers : [ 'common.Index' ]
	});
})