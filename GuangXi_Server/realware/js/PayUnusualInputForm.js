/***
 * 支付异常信息通知书录入界面布局
 */
Ext.onReady(function() {
	Ext.QuickTips.init();
	Ext.Loader.setConfig( {
		enabled : true,
		disableCaching: false
	});
	Ext.Loader.setPath('Ext', 'js/util');
	Ext.require(['Ext.PageUtil','Ext.OCXUtil']);
	Ext.application( {
		name : 'pb',//应用的名字
		appFolder : "js",//应用的目录
		launch : function() {//当前页面加载完成执行的函数
			Ext.create('Ext.container.Viewport', {
				layout : 'fit',
				items : {
					xtype : 'refundVoucherInputList',
					shrinkWrap : 0,
					config : _menu || {}
				}
			});
		},
		controllers : [ 'pay.PayVouchers','pay.PayUnusualInputForm' ]
	});
})