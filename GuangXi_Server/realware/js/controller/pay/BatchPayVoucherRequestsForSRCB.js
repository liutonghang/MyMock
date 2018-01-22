/***
 * 批量支付凭证事件处理器（上海）
 * @memberOf {TypeName} 
 */
Ext.define('pb.controller.pay.BatchPayVoucherRequestsForSRCB', {
	extend : 'Ext.app.Controller',
	// 数据集列表：
	// pay.PayVouchers 支付凭证
	// common.PageStatus  初始化业务界面配置
	// common.MenuStatus  菜单状态信息
	stores : [ 'pay.BatchPayVoucherRequestsForSRCB','pay.BatchPayVouchersForSRCB'],
	//对象模型 pay.PayVoucher 支付凭证
	models : [ 'pay.PayVoucher','pay.PayRequest' ],
	//当创建一个控件的时候需要在此引入
	requires : [ 'pb.view.pay.BatchPayVoucherQueryForSRCB','pb.view.pay.BatchPayVoucherPanelForSRCB' ],
	//创建后获取当前控件，应用于当前控制层
	refs : [ {
			ref : 'query', //当前控制层引用	
			selector : 'batchPayVoucherQueryForSRCB' // 控件的别名
	},{
			ref : 'batchVoucherPanelForSRCB', //当前控制层引用	
			selector : 'batchPayVoucherPanelForSRCB' // 控件的别名
	}],
	onLaunch: function() {
		//当前控制层
		var me = this;
		//查询区
		var queryView = me.getQuery();
		//刷新数据前事件
		me.getStore('pay.BatchPayVouchersForSRCB').on('beforeload',function(thiz, options) {
//			if (isExistStatus) {
				//当前状态控件
				var taskState = Ext.getCmp('taskState');
				//当前状态对应的查询条件
				var condition = taskState.valueModels[0].raw.conditions;
				//查询条件拼装至后台
				Ext.PageUtil.onBeforeLoad(condition, queryView, me.getModel('pay.PayVoucher'), options);
//				}
//			}else{
//				Ext.PageUtil.onBeforeLoad(null, queryView, me.getModel('pay.PayVoucher'), options);
//			}
		});
		me.getStore('pay.BatchPayVoucherRequestsForSRCB').on('beforeload', function(thiz, options) {
			var vouRecord = Ext.PageUtil.validSelect(Ext.getCmp(Ext.PageUtil.prefix + Ext.getCmp('taskState').getValue()));
			var data = "[{\"operation\":\"and\",\"attr_code\":\"pay_voucher_id\",\"relation\":\"=\",\"value\":\""+vouRecord[0].get('pay_voucher_id')+"\",\"datatype\":1,\"type\":0}]";
			var filedNames = [];
			Ext.Array.each(me.getModel('pay.PayRequest').getFields(), function(field) {
				filedNames.push(field.name);
			});
			if (null == options.params || options.params == undefined) {
				options.params = [];
				options.params["conditionObj"] = data;
				options.params["filedNames"] =Ext.encode(filedNames);
				options.params["menu_id"] = Ext.PageUtil.getMenuId();
			} else {
				options.params["menu_id"] = Ext.PageUtil.getMenuId();
				options.params["conditionObj"] = data;
				options.params["filedNames"] = Ext.encode(filedNames);
			}
		});
		
		var panel = Ext.ComponentQuery.query('viewport > panel')[0];
		/**
		 * 初始化切换列表使用的store
		 */
		window["_store"] = 'pay.BatchPayVouchersForSRCB';
		var taskCombo = Ext.getCmp("taskState");
		//创建状态store绑定到状态combo
		var _comboStore = Ext.create('Ext.data.Store', {
			fields : ['status_code', 'status_name'],
			data : _menu.statusList
		});
		taskCombo.bindStore(_comboStore);
		/**
		 * 初始化页面
		 */
		taskCombo.addListener("change", function(combo, newValue, oldValue, eOpts) {
			var panel = Ext.getCmp("batchVoucherPanelForSRCB");
			/**
			 * 根据状态值设置自定义按钮
			 */
			var _code = combo.valueModels[0].raw.status_code;
			var _comboStore = combo.getStore();
			//edit by liutianlong 2016年3月24日 
			//需要取第一个panel，否则获取不到按钮信息，导致不能支持个性化
			var fpanel = Ext.ComponentQuery.query('viewport > panel')[0];
			Ext.Array.each(Ext.ComponentQuery.query("button[custom=true]", fpanel), function(btn, i) {
				if(btn.status_codes && !Ext.isEmpty(btn.status_codes)) {
					if(Ext.Array.contains(btn.status_codes, _code)) {
						btn.enable();
					} else {
						btn.disable();
					}
				}
			});
			/**
			 * 根据新的状态初始化列表
			 */
			panel.removeAll();
			var config = _comboStore.findRecord("status_code", newValue).raw;
			config.ui.view_name = "";
			var grid = Ext.PageUtil.initGrid(panel, _comboStore.findRecord("status_code", newValue).raw, window["_store"], true, false);
			grid.addListener("select", function(view, record, item, index, e, eOpts) {
				Ext.getCmp("batchRequestPanelForSRCB").getStore().loadPage(1);
			});
			grid.addListener("deselect", function(view, record, item, index, e, eOpts) {
				Ext.getCmp("batchRequestPanelForSRCB").getStore().removeAll();
			});
			/**
			 * 数据刷新
			 */
			if(grid && initialLoad) {
				grid.getStore().loadPage(1);
			}
			/**
			 * 状态切换时，先设置交易状态下拉内容为空，再删除主列表数据
			 */
			Ext.getCmp("batchRequestPanelForSRCB").cmb_status.setValue("");
			Ext.getCmp("batchRequestPanelForSRCB").getStore().removeAll();
		});
		Ext.StatusUtil.initPage(Ext.getCmp("admdivCode"), Ext.getCmp("taskState"), false);
		Ext.getCmp("taskState").setValue(_menu.statusList[0].status_code);
	}
});