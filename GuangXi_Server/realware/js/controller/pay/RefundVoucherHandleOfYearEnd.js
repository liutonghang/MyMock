/***
 * 财政【直接】和【授权】支付退款通知书录入界面事件处理器
 * @memberOf {TypeName} 
 */
Ext.define('pb.controller.pay.RefundVoucherHandleOfYearEnd', {
	extend : 'Ext.app.Controller',
	stores : ['pay.BankSetMode'],
	requires : [ 'pb.view.pay.RefundVoucherTransferList', 'Ext.ReportUtil'],
	refs : [ {
		ref : 'list',  //当前控制层引用
		selector : 'refundVoucherTransferList' // 控件的别名
	} ],
	authWindow : null,
	//事件的定义
	init : function() {
		this.control( {
			//查询区 
				'payVoucherQuery combo[id=taskState]' : {
					//状态选中
					change :  function(combo, newValue, oldValue, eOpts) {
								try {
									this.selectState(combo.valueModels[0].raw.status_code);
								} catch(e) {}
					}
				},
			//按钮区
				'refundVoucherTransferList button[id=send]':{
					click : this.sendVoucher
				},
				'refundVoucherTransferList button[id=back]':{
					click : this.backVoucher
				},
				'refundVoucherTransferList button[id=invalid]':{
					click : this.invalidVoucher
				},
				'refundVoucherTransferList button[id=refresh]':{
					click : this.refreshData
				}
			////////////////////////END///////////////////////
			})
	},
	/////////////////////被调用的方法/////////////////////////

	/**
	 * 切换状态  注：新添加的状态在库里的状态相同的就直接添加的已有的判断里面不要再添加了
	 * @param {Object} status_code  状态code
	 */
	selectState : function(status_code) {
		if ('001' == status_code) { //未处理
			Ext.StatusUtil.batchEnable("invalid");
			Ext.StatusUtil.batchDisable("send");
			Ext.getCmp('back').setVisible(false);
		} else if ('002' == status_code) { //未转账
			Ext.getCmp('back').setVisible(true);
			Ext.StatusUtil.batchEnable("back,invalid");
			Ext.StatusUtil.batchDisable("send");
		} else if ('003' == status_code) { //已转账未划款
			Ext.getCmp('back').setVisible(false);
			Ext.StatusUtil.batchDisable("back,invalid,send");
		} else if ('004' == status_code) { //已发送未划款
			Ext.StatusUtil.batchDisable("back,send,invalid");
			Ext.getCmp('back').setVisible(false);
		} else if ('005' == status_code) { //已作废
			Ext.getCmp('back').setVisible(false);
			Ext.StatusUtil.batchDisable("back,send,invalid");
		} else if ('006' == status_code) { //已转账未发送
			Ext.StatusUtil.batchDisable("back,invalid");
			Ext.StatusUtil.batchEnable("send");
		}
		//刷新，默认当前为第一页
		//this.getStore('pay.PayVouchers').loadPage(1);
	},
	
	/**
	 * 发送
	 */
	sendVoucher : function(isFlow,url) {
		var me = this;
		var records = Ext.PageUtil.validSelect(Ext.getCmp(Ext.PageUtil.prefix + Ext.getCmp('taskState').getValue()));
		if(records !=null) {
			var ids = []; // 凭证主键字符串
			var lastVers = []; // 凭证lastVer字符串
			Ext.Array.each(records, function(model) {
				ids.push(model.get("pay_voucher_id"));
				lastVers.push(model.get("last_ver"));
			});
			var params = {
				billTypeId : records[0].get("bill_type_id"),
				billIds : Ext.encode(ids),
				last_vers : Ext.encode(lastVers),
				isFlow : false
			};
			Ext.PageUtil.doRequestAjax(me,"/realware/signAndSendPayVoucher.do",params);
		} 
	},
	
	
	/***
	 * 作废
	 * @memberOf {TypeName} 
	 */
	invalidVoucher : function() {
		var me = this;
		var records = Ext.PageUtil.validSelect(Ext.getCmp(Ext.PageUtil.prefix + Ext.getCmp('taskState').getValue()));
		if(records !=null) {
			var reqIds = []; // 凭证主键字符串
			var reqVers = []; // 凭证lastVer字符串
			Ext.Array.each(records, function(model) {
				reqIds.push(model.get('pay_voucher_id'));
				reqVers.push(model.get('last_ver'));
			});
			var params = {
				billTypeId : records[0].get('bill_type_id'),
				billIds : Ext.encode(reqIds),
				last_vers : Ext.encode(reqVers)
			};
			Ext.PageUtil.doRequestAjax(me,'/realware/invalidateRefundVoucherNoWorkflow.do',params);
		}
	},
	/***
	 * 退回财政
	 * @memberOf {TypeName} 
	 */
	backVoucher : function(){
			var me = this;
			var records = Ext.PageUtil.validSelect(Ext.getCmp(Ext.PageUtil.prefix + Ext.getCmp('taskState').getValue()));
			if(records !=null) {
				var ids = [];
				var lastVers = [];
				Ext.Array.each(records,function(model) {
					ids.push(model.get('pay_voucher_id'));
					lastVers.push(model.get("last_ver"));
				});
				var bill_type_id = records[0].get("bill_type_id");
				var backvoucherwindow = Ext.create('pb.view.common.TextareaWindow',{
					textareaValue : '年结退回处理',
					title : '退回财政'
				});
				backvoucherwindow.on('confirmclick',function(o,textarea){
					var params = {
						returnRes : textarea,
						billIds : Ext.encode(ids),
						last_vers : Ext.encode(lastVers),
						billTypeId : bill_type_id
					};
					//注：退回财政，根据不同业务需求，配置不同的路径
					Ext.PageUtil.doRequestAjax(me,'/realware/returnVoucherNoWf.do',params);
				});
				backvoucherwindow.show();
			}
							
	},
	/***
	 * 刷新
	 * @memberOf {TypeName} 
	 */
	refreshData : function(){
		this.getStore('pay.PayVouchers').loadPage(1);
	}
});
