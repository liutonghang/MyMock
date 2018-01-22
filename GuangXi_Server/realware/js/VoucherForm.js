/***
 * MVC模式下，模块公共js
 * 用以创建viewport，添加个性化控制逻辑
 * 须在jsp页面中生命
 * controllers控制器数组
 * mainView视图层属性配置
 * extraControllers 个性化控制器别名如：hunan.Custom
 */
Ext.onReady(function() {
	Ext.QuickTips.init();
	Ext.Loader.setConfig( {
		enabled : true, 
		disableCaching: false
	});
	//引用工具类
	Ext.Loader.setPath('Ext', 'js/util');
	Ext.require(['Ext.PageUtil','Ext.OCXUtil']);
	//判断视图名称是否存在（ext mvc view的别名）
	if("undefined" == typeof mainView 
			|| Ext.isEmpty(mainView) 
			|| Ext.isEmpty(mainView.xtype)) {
		Ext.Msg.alert('系统提示', '无法加载功能视图，请联系管理员！');
		return ;
	}
	//控制器别名
	if("undefined" == typeof controllers) {
		Ext.Msg.alert('系统提示', '无法加载功能控制器，请联系管理员！');
		return ;
	}
	//个性化需要增加的额外控制器
	if("undefined" != typeof extraControllers 
			&& !Ext.isEmpty(extraControllers)) {
		controllers = controllers.concat(extraControllers);
	}
	Ext.application( {
		name : 'pb',//应用的名字
		appFolder : "js",//应用的目录
		launch : function() {//当前页面加载完成执行的函数
			/**
			 * 创建视图前执行函数
			 * 用以支撑个性化按钮添加、个性化功能代码逻辑添加等操作
			 */
			beforeCreateViewport();
			//使用viewConfig进行重新构造视图层
			var viewConfig = Ext.apply({
					shrinkWrap : 0,
					config : _menu || {}
				}, mainView);
			Ext.create('Ext.container.Viewport', {
				layout : 'fit',
				items : viewConfig
			});
			/**
			 * 创建视图后执行函数
			 * 用以支撑个性化按钮控制逻辑、个性化功能代码逻辑等操作
			 */
			afterCreateViewport();
		},
		controllers : controllers
	});
})