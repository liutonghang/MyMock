/***
 *  工作日维护
 */
Ext.onReady(function() {
	Ext.QuickTips.init();
	Ext.Loader.setConfig( {
		enabled : true,
		disableCaching: false
	});
	Ext.application( {
		name : 'pb',
		appFolder : "js",
		launch : function() {
			//默认选中当前业务年度
			var y = parseInt(Ext.Date.format(new Date(), 'Y'));
			this.getStore('common.WorkDays').load({
				scope: this,
				params : {
					year :  y
				},
    			callback: function(records, operation, success) {
					if(success){
						Ext.create('Ext.container.Viewport', {
							layout : 'fit',
							items : {
								xtype : 'workDayPanel',
								setYear : y,
								workDays : records
							}
						});
					}
    			}
			});
		},
		controllers : [ 'common.WorkDay' ]
	});
})