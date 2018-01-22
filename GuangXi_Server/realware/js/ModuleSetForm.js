/***
 * 功能维护布局
 */
Ext.onReady(function() {
	Ext.QuickTips.init();
	Ext.Loader.setConfig( {
		enabled : true
	});
	Ext.application( {
		name : 'pb',//应用的名字
		appFolder : "js",//应用的目录
		launch : function() {//当前页面加载完成执行的函数
			Ext.create('Ext.container.Viewport', { 
						layout : 'fit',
						items : {
							xtype : 'tabpanel',
							items : [ {
								title : '模块功能管理',
								xtype : 'modulelist'
							}, {
								title : '列表视图模型',
								xtype : 'uilist'
							} ]
						}
					});
		},
		//引用了列表视图模型,选择框,功能,功能窗口,状态过滤条件窗口处理类
		controllers : [ 'common.UITemplate','common.Module','common.ModuleWindow']
	});
})