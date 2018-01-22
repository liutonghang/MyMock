/***
 * 批量直接支付凭证事件处理器（公共）
 * @memberOf {TypeName} 
 */
Ext.define('pb.controller.pay.PLBatchPayVouchers', {
	extend : 'Ext.app.Controller',
	// 数据集列表：
	// pay.PayVouchers 支付凭证
	// common.PageStatus  初始化业务界面配置
	// common.MenuStatus  菜单状态信息
	stores : [ 'pay.PLBatchPayVouchers', 'common.PageStatus', 'common.MenuStatus' ],
	//对象模型 pay.PayVoucher 支付凭证
	models : [ 'pay.PayVoucher' ],
	//当创建一个控件的时候需要在此引入
	requires : [ 'pb.view.pay.BatchPayVoucherQuery' ],
	//创建后获取当前控件，应用于当前控制层
	refs : [ {
			ref : 'query', //当前控制层引用	
			selector : 'batchPayVoucherQuery' // 控件的别名
	} ],
	//初始化
	init : function() {
		//事件的定义
		this.control( {
			//界面
			'viewport':{
					//绘制
					render : this.onPageRender
			},
			//查询区【所属财政】
			'payVoucherQuery combo[id=admdivCode]' : {
				//选中
				select : this.onPageRender
			}
		})
	},
	isExistStatus : true, //是否有状态
	onLaunch: function() {
		//当前控制层
		var me = this;
		//刷新数据前事件
		me.getStore('pay.PLBatchPayVouchers').on('beforeload',function(thiz, options) {
			//查询区
			var queryView = null;
			if(me.getQuery()==undefined){
				queryView = Ext.ComponentQuery.query('panel[id=queryPanel]',Ext.ComponentQuery.query('viewport > panel')[0])[0]; 
			}else{
				queryView = me.getQuery();
			}
			if (me.isExistStatus) {
				//当前状态控件
				var taskState = Ext.getCmp('taskState');
				//当前状态对应的查询条件
				var condition = taskState.valueModels[0].raw.conditions;
				//查询条件拼装至后台
				Ext.PageUtil.onBeforeLoad(condition,queryView, me.getModel('pay.PayVoucher'), options);
				//根据状态判断是否去加载缓存中的收款行行号,当为初审的时候去加载否则不加载
				if(taskState.lastSelection[0].get('status_code') == '000'){
					options.params["isLoadBankNo"] = true;
				}else{
					options.params["isLoadBankNo"] = false;
				}
			}else{
				Ext.PageUtil.onBeforeLoad(null,queryView, me.getModel('pay.PayVoucher'), options);
			}
		});
		if (!me.isExistStatus) {
			me.getStore('pay.PLBatchPayVouchers').load();
		}
	},
	/////////////////////被调用的方法/////////////////////////
	/***
	 * 界面绘制
	 * @memberOf {TypeName} 
	 */
	onPageRender : function() {
		//是否有状态配置信息
		var initStatus = true;
		var panel = Ext.ComponentQuery.query('viewport > panel')[0];
		var pageStore = this.getStore('common.PageStatus');
		//加载当前菜单的配置信息
		if (pageStore.getCount() > 0) {
			//1、获取当前页面的状态集合和按钮集合
			var statusList = pageStore.getAt(0).raw.statusList;
			var btnList = pageStore.getAt(0).raw.buttonList;
			var admdivCode = Ext.getCmp('admdivCode').getValue();
			//2、按钮区划过滤并设置
			if (btnList.length > 0) {
				var buttons = [];
				Ext.Array.findBy(btnList, function(b) {
					if (b.admdiv_code == admdivCode) {
						buttons.push(b);
					}
				});
				Ext.Array.findBy(buttons, function(b) {
					Ext.getCmp(b.button_id).setVisible(b.visible == 1 ? true : false);
					Ext.getCmp(b.button_id).setText(b.button_name);
				});
			}
			//3、状态区划过滤并设置
			if (statusList.length > 0) {
				var status = [];
				Ext.Array.findBy(statusList, function(s) {
					if (s.admdiv_code == admdivCode) {
						status.push(s);
					}
				});
				this.getStore('common.MenuStatus').loadData(status);
				//列表视图设置
				Ext.PageUtil.onInitPage(this, panel, status, 'pay.PLBatchPayVouchers');
				//默认选中第一个状态
				var state = Ext.ComponentQuery.query('combo[id=taskState]',panel)[0];
				state.setValue(status[0].status_id);
				//手动触发当前状态的选中事件
				var records = [];
				records.push(this.getStore('common.MenuStatus').getAt(0));
				state.fireEvent('select', state, records);
			} else {
				initStatus = false;
			}
		} else {
			initStatus = false;
		}
		if (!initStatus) {
			//列表视图设置
			Ext.PageUtil.onInitList(this, panel,'pay.PLBatchPayVouchers');
			this.isExistStatus = false;
		}
	}
});