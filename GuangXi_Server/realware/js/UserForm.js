/***
 * app.js
 */
Ext.onReady(function() {
	Ext.QuickTips.init();
	Ext.Loader.setConfig( {
		enabled : true
	});
	Ext.Loader.setPath('Ext', 'js/util');
	Ext.require(['Ext.PageUtil','Ext.OCXUtil']);
	Ext.application( {
		name : 'pb',//应用的名字
		appFolder : "js",//应用的目录
		controllers : [ 'user.UserController' ],
		launch : function() {//当前页面加载完成执行的函数
			this.getStore('common.PageStatus').load({
				 callback: function(records, operation, success) {
					if(success){
						Ext.create('Ext.container.Viewport', {
							layout : 'fit',
							items : {
//								xtype : 'userGrid'
									xtype : 'userButton'
							}
						});
					}
				 }
			});
		}
	});
});