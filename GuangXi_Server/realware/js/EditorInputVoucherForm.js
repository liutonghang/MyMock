/***
 * 代编支付凭证录入界面布局
 */
Ext.onReady(function() {
	Ext.QuickTips.init();
	Ext.Loader.setConfig( {
		enabled : true
	});
	//引用工具类
	Ext.Loader.setPath('Ext', 'js/util');
	Ext.require(['Ext.PageUtil','Ext.OCXUtil'/*,'Ext.NumberFieldOver'*/]);
	Ext.application( {
		name : 'pb',//应用的名字
		appFolder : "js",//应用的目录
		launch : function() {//当前页面加载完成执行的函数
			Ext.create('Ext.container.Viewport', {
				layout : 'fit',
				items : {
					xtype : 'editorVoucherList',
					shrinkWrap : 0,
					config : _menu || {}
				}
			});
		},
		controllers : [ 'pay.PayVouchers','pay.EditorVouchers','common.ElementTreeInput' ]
	});
})