/***
 * 支付凭证事件处理器（公共）
 * @memberOf {TypeName} 
 */
Ext.define('pb.controller.pay.PayVouchers', {
	extend : 'Ext.app.Controller',
	// 数据集列表：
	// pay.PayVouchers 支付凭证
	stores : [ 'pay.PayVouchers','pay.PayDetails'],
	//对象模型 pay.PayVoucher 支付凭证
	models : [ 'pay.PayVoucher','pay.PayRequest' ],
	//当创建一个控件的时候需要在此引入
	requires : [ 'pb.view.pay.PayVoucherQuery'],
	//创建后获取当前控件，应用于当前控制层
	refs : [ {
			ref : 'query', //当前控制层引用
			selector : 'payVoucherQuery' // 控件的别名
	} ],
	onLaunch: function() {
		//当前控制层
		var me = this;
		//刷新数据前事件
		var queryView = Ext.ComponentQuery.query("panel[title='查询区']")[0];
		me.getStore('pay.PayVouchers').on('beforeload',function(thiz, options) {
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
					//加载pay.BankSetMode,解决初审数据中银行结算方式显示不正确的问题
					var bankModeStore = me.getStore('pay.BankSetMode');
					if(bankModeStore){
						bankModeStore.on('beforeload',function(thiz, options) {
							options.params = [];
							options.params["admdivCode"] = Ext.getCmp('admdivCode').getValue();
						});
						bankModeStore.load();
					}
				}else{
					options.params["isLoadBankNo"] = false;
				}
			}else{
				Ext.PageUtil.onBeforeLoad(null, queryView, me.getModel('pay.PayVoucher'), options);
			}			
		});
		var panel = Ext.ComponentQuery.query('viewport > panel')[0];
		if (!isExistStatus) {
			Ext.PageUtil.onInitList(panel, 'pay.PayVouchers');
			if(initialLoad) {
				me.getStore('pay.PayVouchers').load();
			}
		} else {
			/**
			 * 初始化切换列表使用的store
			 */
			Ext.PageUtil.onInitPage(panel, _menu.statusList, 'pay.PayVouchers');
			/**
			 * 初始化页面
			 */
			Ext.StatusUtil.initPage(Ext.getCmp("admdivCode"), Ext.getCmp("taskState"), true);
			Ext.getCmp("taskState").setValue(_menu.statusList[0].status_code);
		}
		/***** 右击添加凭证查看和明细查看 *****/
		panel.addEvents('gridpanel_rightmenu'); //添加右击事件
		panel.on('gridpanel_rightmenu', function(gridpanel, record,thiz_) {
			if(thiz_.text=='卡片展示数据窗口'){
				Ext.create('pb.view.common.SingleDetailWindow',{  
						title : '查看凭证详细信息',
						selectObj : record,
						selectItems : gridpanel.columns
				}).show();
			}else if(thiz_.text=='查看明细列表窗口'){
				var dataStore = me.getStore('pay.PayDetails');
				var window = Ext.create('pb.view.pay.PayRequestListWindow',{
					dataStore : dataStore
				});
				var cols = window.items.items[0].columns;
				var filedNames = [];
				Ext.Array.each(cols,function(col){
					if(!Ext.isEmpty(col.dataIndex)){
						filedNames.push(col.dataIndex);
					}
				});
				dataStore.on('beforeload',function(t, options) {
					options.params = {};
					options.params["admdivCode"] = record.get('admdiv_code');
					options.params["id"] = record.get('pay_voucher_id');
					options.params["vt_code"] = record.get('vt_code');
					options.params["filedNames"] = Ext.encode(filedNames);
				});
				dataStore.load({
					callback: function(records, operation, success) {
						if (success && records.length > 0) {
//								window.itemDoubleclick = function(grid, record){
//									Ext.create('pb.view.common.SingleDetailWindow',{
//											title:'查看明细详细信息',
//											selectObj : record,
//											selectItems :cols
//									}).show();
//								}
								window.show();
						}else{
							Ext.Msg.alert('系统提示', '当前主单没有明细数据！');
							return;
						}
					}
				});
			}
		});
		/**end **/
	}	
});