/***
 * 参数维护
 */
Ext.onReady(function() {
	Ext.QuickTips.init();
	Ext.Loader.setConfig( {
		enabled : true
	});
	Ext.Loader.setPath('Ext', 'js/util');
	Ext.require(['Ext.PageUtil']);
	Ext.application( {
		name : 'pb',
		appFolder : "js",
		launch : function() {
			Ext.create('Ext.container.Viewport', {
				layout : 'fit',
				items : {
					xtype : 'parameterlist'
				}
			});
		},
		controllers : [ 'common.Parameters' ]
	});
})