/***
 * 转账日志处理类
 * @memberOf {TypeName} 
 */
Ext.define('pb.controller.common.TransLog', {
	extend : 'Ext.app.Controller',
	stores : [ 'common.TransLogs'],
	models : [ 'common.TransLog'],
	requires : [ 'pb.view.common.TransLogList', 'Ext.ReportUtil'],
	refs : [ {
		ref : 'list',
		selector : 'transloglist'
	} ],
	init : function() {
		this.control( {
			'transloglist combo[id=admdivCode]':{
				select : this.refreshData
			},
			'transloglist button[id=print]':{
				click : this.printTransLog
			},
			'transloglist button[id=refresh]':{
				click : this.refreshData
			}
		})
	},
	onLaunch: function() {
		var me = this;
		me.getStore('common.TransLogs').on('beforeload',function(thiz, options) {
			Ext.PageUtil.onBeforeLoad(null, Ext.getCmp('queryPanel'), me.getModel('common.TransLog'), options);
		});
		var panel = Ext.ComponentQuery.query('viewport > panel')[0];
		Ext.PageUtil.onInitList(panel, 'common.TransLogs');
		Ext.StatusUtil.initPage(Ext.getCmp("admdivCode"), null, false);
		if(initialLoad) {
			me.getStore('common.TransLogs').load();
		}
	},
	printTransLog : function(){
		var createDate = Ext.getCmp('createDate').getValue();
		if(Ext.isEmpty(createDate)){
				Ext.Msg.alert("系统提示", "请先选择交易日期，才能进行打印操作！");
				return;
		}
		var condition = "[{\"create_date\":[\""+Ext.PageUtil.Todate(createDate,'Ymd')+"\"], \"admdiv_code\":[\"" + Ext.getCmp("admdivCode").getValue() + "\"]}]";
		Ext.ReportUtil.showPrintWindow(this,'/realware/loadReportByCode.do','/realware/loadReportData.do','PayFlowQueryForABC',condition);
	},
	refreshData : function(){
		this.getStore('common.TransLogs').loadPage(1);
	}
});
