/***
 * 账户维护
 */
Ext.onReady(function() {
	Ext.QuickTips.init();
	Ext.Loader.setConfig( {
		enabled : true,
		disableCaching: false
	});
	Ext.Loader.setPath('Ext', 'js/util');
	Ext.require(['Ext.ComUtil','Ext.PageUtil']); //,'Ext.ComUtil'
	Ext.application( {
		name : 'pb',
		appFolder : "js",
		launch : function() {
			Ext.create('Ext.container.Viewport', {
				layout : 'fit',
				items : {
					xtype : 'accountList',
					shrinkWrap : 0
				}
			});
		},
		controllers : [ 'common.Accounts' ]
	});
})