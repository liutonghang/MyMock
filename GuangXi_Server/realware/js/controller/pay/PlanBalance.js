/***
 * 额度查询处理类
 * @memberOf {TypeName} 
 */
Ext.define('pb.controller.pay.PlanBalance', {
	extend : 'Ext.app.Controller',
	stores : [ 'pay.PlanBalances'],
	models : [ 'pay.PlanBalance','pay.PlanDetail'],
	requires : [ 'pb.view.pay.PlanBalanceList'],
	refs : [ {
		ref : 'list',
		selector : 'planbalancelist'
	} ],
	init : function() {
		this.control( {
			'planbalancelist button[id=refresh]':{
				click : this.refreshData
			},
			'planbalancelist button[id=recalculation]':{
				click : this.recalculate
			},
			'planbalancelist button[id=monthlyBalance]':{
				click : this.monthlyBalance
			},
			'planbalancelist button[id=exportout]':{
				click : this.exportout
			}
			
		})
	},
	onLaunch: function() {
		var me = this;
		me.getStore('pay.PlanBalances').on('beforeload',function(thiz, options) {
			Ext.PageUtil.onBeforeLoad(null,Ext.getCmp('queryPanel'), me.getModel('pay.PlanBalance'), options);
		});
	},
	refreshData : function(){
		this.getStore('pay.PlanBalances').loadPage(1);
	},
	recalculate : function(){
		var me = this;
		var myMask = new Ext.LoadMask(Ext.getBody(), {
								msg : '后台正在处理中，请稍后....',
								removeMask : true
						});
		myMask.show();
		Ext.Ajax.request({
						url : '/realware/recalculatePlanBalance.do',
						method : 'POST',
						params : {
							admdiv_code :Ext.getCmp("admdivCode").value
							},
						timeout : 600000,//超时时间，因该操作年底操作时较为耗时，设置为10分钟 
						success : function(response, options) {
									Ext.PageUtil.succAjax(response, myMask, null,"额度重算成功！");
									me.refreshData();
								},
						failure : function(response, options) {
									Ext.PageUtil.failAjax(response, myMask);
								}
						});
	},
	//月结
	monthlyBalance : function(){
		var me = this;
		var myMask = new Ext.LoadMask(Ext.getBody(), {
								msg : '后台正在处理中，请稍后....',
								removeMask : true
						});
		myMask.show();
		Ext.Ajax.request({
						url : '/realware/monthlyBalance.do',
						method : 'POST',
						params : {
							admdiv_code :Ext.getCmp("admdivCode").value
							},
						timeout : 60000, 
						success : function(response, options) {
									Ext.PageUtil.succAjax(response, myMask, null,"额度月结成功！");
									me.refreshData();
								},
						failure : function(response, options) {
									Ext.PageUtil.failAjax(response, myMask);
								}
						});
	},
	exportout:function(){
		var me=this;
		var records =Ext.getCmp("planbalancelist-1010-locked").getSelectionModel().getSelection();
			if (records.length == 0) {
				Ext.Msg.alert("系统提示","请选择导出的数据");
				return;
			}
		var planIds=[];
		Ext.Array.each(records,function(model){
			planIds.push(model.get("plan_id"));
		});
		var ctx = "\/realware";
		window.location.href =ctx+"/exportBalanceExcel.do?" +
							"planIds="+planIds;
	}
});
