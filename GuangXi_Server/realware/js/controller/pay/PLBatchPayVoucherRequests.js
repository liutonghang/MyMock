/***
 * 批量直接支付凭证事件处理器
 * @memberOf {TypeName} 
 */
Ext.define('pb.controller.pay.PLBatchPayVoucherRequests', {
	extend : 'Ext.app.Controller',
	// 数据集列表：
	// pay.PayVouchers 支付凭证
	// common.PageStatus  初始化业务界面配置
	// common.MenuStatus  菜单状态信息
	stores : [ 'pay.PLBatchPayVoucherRequests','pay.PLBatchPayVouchers'],
	//对象模型 pay.PayVoucher 支付凭证
	models : [ 'pay.BatchPayVoucher','pay.BatchPayRequest' ],
	//当创建一个控件的时候需要在此引入
	requires : [ 'pb.view.pay.BatchPayVoucherQuery','pb.view.pay.BatchPayVoucherPanel' ],
	//创建后获取当前控件，应用于当前控制层
	refs : [ {
			ref : 'query', //当前控制层引用	
			selector : 'batchPayVoucherQuery' // 控件的别名
	},{
			ref : 'batchVoucherPanel', //当前控制层引用	
			selector : 'batchPayVoucherPanel' // 控件的别名
	}],
	onLaunch: function() {
		//当前控制层
		var me = this;
		//查询区
		var queryView = me.getQuery();
		//刷新数据前事件
		me.getStore('pay.PLBatchPayVouchers').on('beforeload',function(thiz, options) {
//			if (isExistStatus) {
				//当前状态控件
				var taskState = Ext.getCmp('taskState');
				//当前状态对应的查询条件
				var condition = taskState.valueModels[0].raw.conditions;
				//查询条件拼装至后台
				Ext.PageUtil.onBeforeLoad(condition, queryView, me.getModel('pay.BatchPayVoucher'), options);
//				}
//			}else{
//				Ext.PageUtil.onBeforeLoad(null, queryView, me.getModel('pay.PayVoucher'), options);
//			}
		});
		
		me.getStore('pay.PLBatchPayVoucherRequests').on('beforeload', function(thiz, options) {
			var vouRecord = Ext.PageUtil.validSelect(Ext.getCmp(Ext.PageUtil.prefix + Ext.getCmp('taskState').getValue()));
			var data = "[{\"operation\":\"and\",\"attr_code\":\"batchpay_voucher_id\",\"relation\":\"=\",\"value\":\""+vouRecord[0].get('batchpay_voucher_id')+"\",\"datatype\":1,\"type\":0}]";
			var filedNames = [];
			Ext.Array.each(me.getModel('pay.BatchPayRequest').getFields(), function(field) {
				filedNames.push(field.name);
			});
			if (null == options.params || options.params == undefined) {
				options.params = [];
				options.params["conditionObj"] = data;
				options.params["filedNames"] =Ext.encode(filedNames);
				options.params["menu_id"] = Ext.PageUtil.getMenuId();
			} else {
				options.params["conditionObj"] = data;
				options.params["filedNames"] = Ext.encode(filedNames);
				options.params["menu_id"] = Ext.PageUtil.getMenuId();
			}
		});
		var panel = Ext.ComponentQuery.query('viewport > panel')[0];
		if (!isExistStatus) {
			if(initialLoad) {
				me.getStore('pay.PLBatchPayVouchers').load();
			}
		} else {
			/**
			 * 初始化切换列表使用的store
			 */
			window["_store"] = 'pay.PLBatchPayVouchers';
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
				var panel = Ext.getCmp("batchVoucherPanel");
				/**
				 * 根据状态值设置自定义按钮
				 */
				var _code = combo.valueModels[0].raw.status_code;
				var _comboStore = combo.getStore();
				Ext.Array.each(Ext.ComponentQuery.query("button[custom=true]"), function(btn, i) {
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
				var grid = Ext.PageUtil.initGrid(panel, config, window["_store"], true, false);
				grid.addListener("select", function(view, record, item, index, e, eOpts) {
					Ext.getCmp("batchRequestPanel").getStore().load();
				});
				grid.addListener("deselect", function(view, record, item, index, e, eOpts) {
					Ext.getCmp("batchRequestPanel").getStore().removeAll();
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
				Ext.getCmp("batchRequestPanel").cmb_status.setValue("");
				Ext.getCmp("batchRequestPanel").getStore().removeAll();
			});
			Ext.StatusUtil.initPage(Ext.getCmp("admdivCode"), null, false);
			Ext.getCmp("taskState").setValue(_menu.statusList[0].status_code);
		}
	}
});