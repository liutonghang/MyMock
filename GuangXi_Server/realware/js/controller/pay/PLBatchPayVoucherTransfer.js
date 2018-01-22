/***
 * 批量直接支付业务凭证复核界面事件处理器
 * @memberOf {TypeName} 
 */
Ext.define('pb.controller.pay.PLBatchPayVoucherTransfer',{
	extend : 'Ext.app.Controller',
	// 数据集列表：
	// pay.PayVouchers 支付凭证
	// pay.PayeeBankNos 收款行行号
	// common.PageStatus  初始化业务界面配置
	stores : [ 'pay.PLBatchPayVoucherRequests','pay.PLBatchPayVouchers','pay.FundMatchs' ],
	//对象模型 pay.PayVoucher 支付凭证
	models : [ 'pay.BatchPayVoucher','pay.BatchPayRequest' ],
	//当创建一个控件的时候需要在此引入
	requires : [ 'pb.view.pay.PLBatchPayVoucherTransferList','pb.view.pay.BatchPayVoucherQuery'],
	//创建后获取当前控件，应用于当前控制层
	refs : [ {
		ref : 'list',  //当前控制层引用
		selector : 'PLbatchPayVoucherTransferList' // 控件的别名
	}, {
		ref : 'query',
		selector : 'batchPayVoucherQuery'
	}],
	oneSelect : true,
	//事件的定义
	init : function() {
		this.control( {
			//查询区 
			'batchPayVoucherQuery combo[id=taskState]' : {
				//状态选中
				change : function(combo, newValue, oldValue, eOpts) {
					try {
						this.selectState(combo.valueModels[0].raw.status_code);
					} catch(e) {}
				}
			},

			//记账状态查询
			'PLbatchPayVoucherTransferList button[id=transStatusQuery]' : { 
				click : this.queryTransStatus
			},

			//查看凭证   
			'PLbatchPayVoucherTransferList button[id=look]' : {
				click : this.lookVoucher
			},

			//刷新
			'PLbatchPayVoucherTransferList button[id=refresh]' : {
				click : this.refreshData
			},

			//按人发放
			'PLbatchPayVoucherTransferList button[id=pay]' : {
				click : this.transferRequest
			},

			//按单发放
			'PLbatchPayVoucherTransferList button[id=batchPay]' : {
				click : this.transferVoucher
			},

			//批量发放
			'PLbatchPayVoucherTransferList button[id=payAll]' : {
				click : this.transferAllVouchers
			},

			//退回零余额
			'PLbatchPayVoucherTransferList button[id=back]' : {
				click : this.transferBackRequest
			},

			//退回财政
			'PLbatchPayVoucherTransferList button[id=backcz]' : {
				click : this.backCz
			},

			//签章发送
			'PLbatchPayVoucherTransferList button[id=receipt]' : {
				click : this.receiptVoucher
			},

			//人工核实
			'PLbatchPayVoucherTransferList button[id=manCheck]' : {
				click : this.manCheck
			}

		})
	},
	/////////////////////被调用的方法/////////////////////////

	/**
	 * 切换状态  注：新添加的状态在库里的状态相同的就直接添加的已有的判断里面不要再添加了
	 * @param {Object} status_code  状态code
	 */
	selectState : function(status_code) {
		switch(status_code) {
		case '000' :
			//未发放
			Ext.StatusUtil.batchEnable('payAll,batchPay');
			Ext.StatusUtil.batchDisable('receipt,pay,back,backcz,manCheck');
			Ext.getCmp('add').setVisible(true);
			break;
		case '001' :
			//发放中
			Ext.StatusUtil.batchDisable('payAll,batchPay,pay,receipt,back,backcz,manCheck');
			Ext.getCmp('add').setVisible(false);
			break;
		case '002' :
			//发放失败
			Ext.StatusUtil.batchEnable('pay,back,backcz,manCheck');
			Ext.StatusUtil.batchDisable('payAll,batchPay,receipt');
			Ext.getCmp('add').setVisible(false);
			break;
		case '003' :
			//发放成功
			Ext.StatusUtil.batchEnable('receipt');
			Ext.StatusUtil.batchDisable('payAll,batchPay,pay,back,backcz,manCheck');
			Ext.getCmp('add').setVisible(false);
			break;
		case '004' :
			//已发送
			Ext.StatusUtil.batchDisable('payAll,batchPay,pay,receipt,back,backcz,manCheck');
			Ext.getCmp('add').setVisible(false);
			break;
		case '005' :
			//无效数据
			Ext.StatusUtil.batchEnable('backcz');
			Ext.StatusUtil.batchDisable('payAll,batchPay,pay,receipt,back,manCheck');
			Ext.getCmp('add').setVisible(false);
			break;
		default : 
			Ext.StatusUtil.batchDisable('payAll,batchPay,pay,receipt,back,backcz,manCheck');
		Ext.getCmp('add').setVisible(false);
		break;
		}
	},

	/**
	 * 人工核实
	 */
	manCheck : function() {
		var me = this;
		// 加载明细列表
//		var records = Ext.PageUtil.validSelect(Ext.getCmp('batchRequestPanel'))
		var records = Ext.getCmp('batchRequestPanel').getSelectionModel().getSelection();
		if(Ext.isEmpty(records)) {
			Ext.Msg.alert('系统提示','请选择未确认的数据！');
			return ;
		}
		//TODO:判断明细的状态
		for(var i = 0;i<records.length;i++){
			if(records[i].get('trans_succ_flag') != 3){
				Ext.Msg.alert('系统提示','请选择未确认的数据！');
				return;
			}
		}


		var win = Ext.widget('window', {
			id : 'manWin',
			title : '人工核实窗口',
			width : 270,
			layout : 'fit',
			resizable : false,
			modal : true,
			layout : {
				type : 'hbox',
				padding : '10'
//					margin : '10 5 3 10'
			},
			items : [
			         {
			        	 xtype : 'button',
			        	 width : 70,
			        	 text : '确定成功',
			        	 style : 'margin-left:5px;margin-right:5px;',
			        	 handler : function() {
			        		 Ext.MessageBox.confirm('人工核实提示', '确定是支付成功吗？', function(btn){
			        			 me.comfirmCheck(btn,records,1,win,me);
			        		 });
			        	 }
			         }, {
			        	 xtype : 'button',
			        	 width : 70,
			        	 text : '确定失败',
			        	 style : 'margin-left:5px;margin-right:5px;',
			        	 handler : function() {
			        		 Ext.MessageBox.confirm('人工核实提示', '确定是支付失败吗？', function(btn){
			        			 me.comfirmCheck(btn,records,2,win,me);
			        		 });
			        	 }
			         }, {
			        	 xtype : 'button',
			        	 width : 70,
			        	 text : '取消',
			        	 style : 'margin-left:5px;margin-right:5px;',
			        	 handler : function() {
			        		 this.up('window').close();
			        	 }
			         } ]
		});
		win.show();				
	},

	comfirmCheck : function(id,records,flag,win,me){
		if(id == 'yes'){
//			debugger;
			var ids = [];
			var lastVers = [];
			Ext.Array.each(records, function(model) {
				ids.push(model.get("batchpay_request_id"));
				lastVers.push(model.get("last_ver"));
			});
			var params ={
					billTypeId : records[0].get("bill_type_id"),
					billIds : Ext.encode(ids),
					last_vers : Ext.encode(lastVers),
					menu_id : Ext.PageUtil.getMenuId(),
					trans_flag : flag
			}
			Ext.PageUtil.doRequestAjax(me,'/realware/manCheckBatReqs.do', params,'',win);
		}

	},

	/**
	 * 按人发放
	 */
	transferRequest : function() {
		var me = this;
		// 加载明细列表
//		var records = Ext.PageUtil.validSelect(Ext.getCmp('batchRequestPanel'));

		//add by liutianlong 20150511
		//此次需提示请至少选择一条明细
		var records = Ext.getCmp('batchRequestPanel').getSelectionModel().getSelection();
		if (Ext.isEmpty(records)) {
			Ext.Msg.alert('系统提示', '请至少选择一条明细数据！');
			return;
		} else {
			var flag = false;
			Ext.Array.each(records, function(model) {
				/**
				 * BUG #12402 【工资/公务卡复核转账、批量直接/授权支付】应限制“未确认”的数据不可按人发放、或退回财政零余额.
				 * 明细进行按人发放或退回零余额时，只能选择交易失败的明细数据
				 * lfj 2015-12-30
				 */
				if(model.get("trans_succ_flag") != 2){
					flag = true;
					return false;
				}
			});
			if(flag) {
				Ext.Msg.alert('系统提示', '请选择交易失败的明细数据！');
				return ;
			}
		}
		//end
		this.filterRecords(me,records,'batchpay_request_id','/realware/transferPLRequest.do');
	},

	/**
	 * 按单发放
	 */
	transferVoucher : function() {
		var me = this;
		var records = Ext.PageUtil.validSelect(Ext.getCmp(Ext.PageUtil.prefix + Ext.getCmp('taskState').getValue()));
		this.filterRecords(me,records,'batchpay_voucher_id','/realware/transferPLVoucher.do');
	},
	/**
	 * 批量发放
	 */
	transferAllVouchers : function() {
		var me = this;
		var options = {};
		Ext.PageUtil.onBeforeLoad(null, me.getQuery(), me.getModel('pay.BatchPayVoucher'), options);
		Ext.PageUtil.doRequestAjax(me,'/realware/transferAllPL.do', options.params);
	},

	/**
	 * 退回零余额
	 */
	transferBackRequest : function() {
		var me = this;

		//add by liutianlong 20150511
		//此次需提示请至少选择一条明细
		var records = Ext.getCmp('batchRequestPanel').getSelectionModel().getSelection();
		if (Ext.isEmpty(records)) {
			Ext.Msg.alert('系统提示', '请至少选择一条明细数据！');
			return;
		} else {
			var flag = false;
			Ext.Array.each(records, function(model) {
				/**
				 * BUG #12402 【工资/公务卡复核转账、批量直接/授权支付】应限制“未确认”的数据不可按人发放、或退回财政零余额.
				 * 明细进行按人发放或退回零余额时，只能选择交易失败的明细数据
				 * lfj 2015-12-30
				 */
				if(model.get("trans_succ_flag") != 2){
					flag = true;
					return false;
				}
			});
			if(flag) {
				Ext.Msg.alert('系统提示', '请选择交易失败的明细数据！');
				return ;
			}
		}
		//end
		this.filterRecords(me,records,'batchpay_request_id','/realware/transferBackPLRequest.do');
	},

	/**
	 * 退回财政
	 */
	backCz : function() {
		var me = this;
		var records = Ext.PageUtil.validSelect(Ext.getCmp(Ext.PageUtil.prefix + Ext.getCmp('taskState').getValue()));
		if(records !=null) {
			var trans_res_msg = records[0].get('trans_res_msg');
			if(!Ext.isEmpty(trans_res_msg) && trans_res_msg.indexOf('超过')==-1){
				Ext.Msg.alert('系统提示', '请选择没有交易成功记录的数据！');
				return;
			}
			
			var ids = [];
			var lastVers = [];
			Ext.Array.each(records,function(model) {
				ids.push(model.get('batchpay_voucher_id'));
				lastVers.push(model.get("last_ver"));
			});
			var bill_type_id = records[0].get("bill_type_id");
			var backvoucherwindow = Ext.create('pb.view.common.TextareaWindow',{
				textareaValue : records[0].get("return_reason") ,
				title : '退回财政'
			});
			backvoucherwindow.on('confirmclick',function(o,textarea){
				var params = {
						returnRes : textarea,
						billIds : Ext.encode(ids),
						last_vers : Ext.encode(lastVers),
						billTypeId : bill_type_id,
						menu_id : Ext.PageUtil.getMenuId()
				};
				//注：退回财政，根据不同业务需求，配置不同的路径
				Ext.PageUtil.doRequestAjax(me,'/realware/backCz.do',params);
			});
			backvoucherwindow.show();
		}
	},

	/**
	 * 签章发送(5210回单)
	 */
	receiptVoucher : function() {
		var me = this;
		var records = Ext.PageUtil.validSelect(Ext.getCmp(Ext.PageUtil.prefix + Ext.getCmp('taskState').getValue()));
		this.filterRecords(me,records,'batchpay_voucher_id','/realware/receipt.do');
	},

	/***
	 * 查看凭证
	 * @memberOf {TypeName} 
	 */
	lookVoucher:function(){
		var me = this;
		var records = Ext.PageUtil.validSelect(Ext.getCmp(Ext.PageUtil.prefix + Ext.getCmp('taskState').getValue()));
		if(records !=null) {
			var maps = Ext.create('Ext.util.HashMap');
			maps.add('batchpay_voucher_code','凭证号');
			maps.add('ori_pay_amount','金额');
			var store = Ext.create('Ext.data.Store', {
				model: me.getModel('pay.BatchPayVoucher'),
				data : records
			});
			var lookocxwindow = Ext.create('pb.view.common.LookOCXWindow',{
				colMaps : maps,
				listStore : store,
				width : me.getList().getWidth()-30,
				height : me.getList().getHeight()-30
			});
			//加入左边点击凭证号触发显示凭证的事件（控件在创建后-在显示之前加入该事件）
			Ext.ComponentQuery.query('gridpanel', lookocxwindow)[0].on(
					'selectionchange',function(view,selected, e) {
						Ext.OCXUtil.doOCX(selected[0].get('batchpay_voucher_id'),selected[0].get('bill_type_id'));
					});
			Ext.OCXUtil.doOCX(records[0].get('batchpay_voucher_id'),records[0].get('bill_type_id'));
			lookocxwindow.show();
		}
	},

	/**
	 * 刷新
	 * @memberOf {TypeName} 
	 */
	refreshData : function() {
		this.getStore('pay.PLBatchPayVouchers').removeAll();
		this.getStore('pay.PLBatchPayVouchers').loadPage(1);
		this.getStore('pay.PLBatchPayVoucherRequests').removeAll();
	},

	filterRecords : function(me,records,field,url) {
		if(Ext.isEmpty(records)) {
			return ;
		}
		var ids = []; // 凭证主键字符串
		var lastVers = []; // 凭证lastVer字符串
		var flag = false;
		Ext.Array.each(records, function(model) {
			if(model.get("trans_succ_flag")==1 || model.get("trans_succ_flag")==-1){
				flag = true;
			}
			ids.push(model.get(field));
			lastVers.push(model.get("last_ver"));
		});
		var params ={
				billTypeId : records[0].get("bill_type_id"),
				billIds : Ext.encode(ids),
				last_vers : Ext.encode(lastVers),
				menu_id : Ext.PageUtil.getMenuId()
		}
		if(flag){
			Ext.Msg.alert('系统提示', '请选择交易失败的记录！');
			return;
		}else{
			Ext.PageUtil.doRequestAjax(me,url, params);
		}
	}
});
