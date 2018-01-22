/***
 * 日志处理器
 * @memberOf {TypeName} 
 */
Ext.define('pb.controller.common.LogQuery', {
	extend : 'Ext.app.Controller',
	stores : [ 'common.LogQuerys' ],
	requires : [ 'pb.view.common.LogQueryPanel', 'pb.view.common.GridPanel' ],
	//创建后获取当前控件，应用于当前控制层
	refs : [ {
		ref : 'list', //当前控制层引用
		selector : 'logQueryPanel' // 控件的别名
	} ],
	//事件的定义
	init : function() {
		this.control( {

			////////////////////////END///////////////////////
			'logQueryPanel button[id=refresh]' : {
				click : this.refreshData
			},
			'logQueryPanel combo[id=datastatus]' : {
				change : function(thiz, newValue, oldValue, eOpts) {
					if (thiz.getValue() != 0) {
						thiz.dataIndex = 'log_sort';
					} else {
						thiz.dataIndex = undefined;
					}
					if(thiz.getValue() == 0 || thiz.getValue() == 2){
						this.getList().queryById('node_name').setVisible(true)
					}else{
						this.getList().queryById('node_name').setVisible(false)
					}
					this.refreshData();
				}
			}
		})
	},
	onLaunch : function() {
		this.getStore('common.LogQuerys').on('beforeload',function(thiz, options) {
				Ext.PageUtil.onBeforeLoad(undefined, Ext.getCmp('queryPanel'), undefined, options);
			})
		this.refreshData();
	},
	/////////////////////被调用的方法/////////////////////////

	/**
	 * 刷新
	 * @memberOf {TypeName} 
	 */
	refreshData : function() {
		this.getStore('common.LogQuerys').loadPage(1);
	}
});
