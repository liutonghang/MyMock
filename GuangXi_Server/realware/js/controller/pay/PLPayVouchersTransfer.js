/***
 * 支付凭证事件处理器（公共） chengkai 2015-2-11 09:34:10
 * @memberOf {TypeName} 
 */
Ext.define('pb.controller.pay.PLPayVouchersTransfer', {
	extend : 'Ext.app.Controller',
	// 数据集列表：
	// pay.PayVouchers 支付凭证
	stores : [ 'pay.PayVouchersHunanBOCTransfer'],
	//对象模型 pay.PayVoucher 支付凭证
	models : [ 'pay.PayVoucher' ],
	//当创建一个控件的时候需要在此引入
	requires : [ 'pb.view.pay.PayVoucherQueryOfReturn' ],
	//创建后获取当前控件，应用于当前控制层
	refs : [ {
			ref : 'query', //当前控制层引用
			selector : 'payVoucherQueryOfReturn' // 控件的别名
	} ],
	onLaunch: function() {
		//当前控制层
		var me = this;
		//刷新数据前事件
		var queryView = me.getQuery();
		me.getStore('pay.PayVouchersHunanBOCTransfer').on('beforeload',function(thiz, options) {
			//查询区
			if (isExistStatus) {
				//当前状态控件
				var taskState = Ext.getCmp('taskState');
				//当前状态对应的查询条件
				var condition = taskState.valueModels[0].raw.conditions;
				//查询条件拼装至后台
				Ext.PageUtil.onBeforeLoad(condition, queryView, me.getModel('pay.PayVoucher'), options);
				
				//根据状态判断是否去加载缓存中的收款行行号,当为初审的时候去加载否则不加载
				if(taskState.lastSelection[0].get('status_code') == '000'){
					options.params["isLoadBankNo"] = true;
				}else{
					options.params["isLoadBankNo"] = false;
				}
			}else{
				Ext.PageUtil.onBeforeLoad(null, queryView, me.getModel('pay.PayVoucher'), options);
			}
		});
		var panel = Ext.ComponentQuery.query('viewport > panel')[0];
		if (!isExistStatus) {
			Ext.PageUtil.onInitList(panel, 'pay.PayVouchersHunanBOCTransfer');
			if(initialLoad) {
				me.getStore('pay.PayVouchersHunanBOCTransfer').load();
			}
		} else {
			/**
			 * 初始化切换列表使用的store
			 */
			Ext.PageUtil.onInitPage(panel, _menu.statusList, 'pay.PayVouchersHunanBOCTransfer');
			/**
			 * 初始化页面
			 */
			Ext.StatusUtil.initPage(Ext.getCmp("admdivCode"), Ext.getCmp("taskState"), true);
			Ext.getCmp("taskState").setValue(_menu.statusList[0].status_code);
		}
	} 
});