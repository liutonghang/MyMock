/**
 * 自助柜面 - app.js
 */
Ext.onReady(function(){
	Ext.QuickTips.init();
	Ext.Loader.setConfig( { enabled : true }); 
	Ext.Loader.setPath('Ext','js/util');
	Ext.require(['Ext.PageUtil','Ext.OCXUtil']);
	Ext.application({
		name:'pb',
		appFolder:'js',
		launch:function(){
			this.getStore('common.PageStatus').load({
				callback:function(records,operation,success){
					if(success){
						Ext.create('Ext.container.Viewport', {
							layout : 'fit',
							 items : {
								xytpe: 'userSignZeroNoButton'
							} 
						});
					}
				}
			});
		} ,
	controllers:['userSignZeroNo.UserSignZeroNo']
	
	});
});