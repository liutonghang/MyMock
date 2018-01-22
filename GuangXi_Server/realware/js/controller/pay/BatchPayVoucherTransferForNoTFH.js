/***
 * 批量业务凭证复核界面事件处理器--
 * @memberOf {TypeName} 
 */
Ext.define('pb.controller.pay.BatchPayVoucherTransferForNoTFH',{
		extend : 'Ext.app.Controller',
		// 数据集列表：
		// pay.PayVouchers 支付凭证
		// pay.PayeeBankNos 收款行行号
		// common.PageStatus  初始化业务界面配置
		stores : [ 'pay.BatchPayVoucherRequestsForSRCB','pay.BatchPayVouchersForSRCB','pay.FundMatchs' ],
		//对象模型 pay.PayVoucher 支付凭证
		models : [ 'pay.PayVoucher','pay.PayRequest' ],
		//当创建一个控件的时候需要在此引入
		requires : [ 'pb.view.pay.BatchPayVoucherTransferListForSRCB','pb.view.pay.BatchPayVoucherQueryForSRCB'],
		//创建后获取当前控件，应用于当前控制层
		refs : [ {
			ref : 'list',  //当前控制层引用
			selector : 'batchPayVoucherTransferListForSRCB' // 控件的别名
		}, {
			ref : 'query',
			selector : 'batchPayVoucherQueryForSRCB'
		}],
		oneSelect : true,
		//事件的定义
		init : function() {
			this.control( {
					//查询区 
					'batchPayVoucherQueryForSRCB combo[id=taskState]' : {
							//状态选中
							change : function(combo, newValue, oldValue, eOpts) {
								try {
									this.selectState(combo.valueModels[0].raw.status_code);
								} catch(e) {}
							}
					},
					
				//请款
				'batchPayVoucherTransferListForSRCB button[id=payment]' : { 
					 click : this.payment
				},
				//记账状态查询
				'batchPayVoucherTransferListForSRCB button[id=transStatusQuery]' : { 
					 click : this.queryTransStatus
				},
				
				 //查看凭证   
				'batchPayVoucherTransferListForSRCB button[id=look]' : {
						click : this.lookVoucher
				},
				
				//刷新
				'batchPayVoucherTransferListForSRCB button[id=refresh]' : {
						click : this.refreshData
				},
				//冲销
				'batchPayVoucherTransferListForSRCB button[id=writeoff]' : {
						click : this.writeoff
				},
				
				//按人发放
				'batchPayVoucherTransferListForSRCB button[id=pay]' : {
						click : this.transferRequest
				},
				
				//按单发放
				'batchPayVoucherTransferListForSRCB button[id=batchPay]' : {
						click : this.transferVoucher
				},
				
				//退回
				'batchPayVoucherTransferListForSRCB button[id=back]' : {
						click : this.transferBackRequest
				},
				//退回
				'batchPayVoucherTransferListForSRCB button[id=unsubmit]' : {
						click : this.unsubmit
				},
				//批量发放
				'batchPayVoucherTransferListForSRCB button[id=payAll]' : {
						click : this.transferAllVouchers
				},
				//人工核实
				'batchPayVoucherTransferListForSRCB button[id=manCheck]' : {
					click : this.manCheck
				}
				
				})
			},
			/////////////////////被调用的方法/////////////////////////
			/**
			 * 请款
			 */
			payment : function(){
				var me = this;
				var records = Ext.PageUtil.validSelect(Ext.getCmp(Ext.PageUtil.prefix + Ext.getCmp('taskState').getValue()));
				this.filterRecords(me,records,'pay_voucher_id','/realware/batchReqMoneyForReqs.do');
			},
			
			/**
			 * 冲销凭证
			 * @memberOf {TypeName} 
			 * @return {TypeName} 
			 */
			  writeoff : function writeoffPayVoucherForHai () {
				var me = pb.app.controllers.items[1];
				var records = Ext.PageUtil.validSelect(Ext.getCmp(Ext.PageUtil.prefix + Ext.getCmp('taskState').getValue()),1);
				if(records !=null) {
					// 凭证主键字符串
					var reqIds = [];
					var reqVers = [];
					for ( var i = 0; i < records.length; i++) {
						reqIds.push(records[i].get("pay_voucher_id"));
						reqVers.push(records[i].get("last_ver"));
					}
					//Ext.Msg.alert("提示",reqIds);
					var bill_type_id = records[0].get("bill_type_id");
					var params = {
						// 单据类型id
						billTypeId : bill_type_id,
						last_vers : Ext.encode(reqVers),
						billIds : Ext.encode(reqIds),
						 menu_id : Ext.PageUtil.getMenuId()
					};
					Ext.PageUtil.doRequestAjax(me,'/realware/writeoffOfficeVoucher.do',params);
				}
			
			},
			/**
			 * 切换状态  注：新添加的状态在库里的状态相同的就直接添加的已有的判断里面不要再添加了
			 * @param {Object} status_code  状态code
			 */
			selectState : function(status_code) {
				switch(status_code) {
				case '000' :
					//未发放(有请款状态下为000)
					Ext.StatusUtil.batchEnable('payAll,batchPay,unsubmit,writeoff');
					Ext.StatusUtil.batchDisable('pay,back,payment,manCheck');
					/**
					 * 未发放状态下，应显示行号补录按钮
					 * 此处应注意oracle、db2、sybase状态码不统一
					 * 并且000和010状态应不同时存在
					 * lfj 2016-06-07
					 */
					//是否请款
					var isReq = !Ext.getCmp('payment').hidden;
					//行号补录，有请款按钮时隐藏，放在请款状态下补录行号
					Ext.getCmp('add').setVisible(!isReq);
					//退回上岗，有请款按钮时disable
					Ext.getCmp('unsubmit').setDisabled(isReq);
					break;
				case '010' :
					//未发放(无请款状态下为010，需显示行号补录列)
					Ext.StatusUtil.batchEnable('payAll,batchPay,unsubmit');
					Ext.StatusUtil.batchDisable('pay,back,payment,manCheck,writeoff');
					Ext.getCmp('add').setVisible(true);
					break;
				case '001' :
					//发放中
					Ext.StatusUtil.batchDisable('payAll,batchPay,pay,back,payment,unsubmit,manCheck,writeoff');
					Ext.getCmp('add').setVisible(false);
					break;
				case '002' :
					//发放失败
					Ext.StatusUtil.batchEnable('pay,back,manCheck,writeoff,unsubmit');
					Ext.StatusUtil.batchDisable('payAll,batchPay,payment');
					Ext.getCmp('add').setVisible(false);
					Ext.getCmp('unsubmit').setDisabled(!Ext.getCmp('payment').hidden);
					break;
				case '003' :
					//发放成功
					Ext.StatusUtil.batchDisable('payAll,batchPay,pay,back,payment,unsubmit,manCheck,writeoff');
					Ext.getCmp('add').setVisible(false);
					break;
				case '004' : 
					//未请款
					Ext.StatusUtil.batchEnable('payAll,batchPay,back,payment,unsubmit');
					Ext.StatusUtil.batchDisable('pay,batchPay,payAll,manCheck,writeoff');
					Ext.getCmp('add').setVisible(true);
					break;
				default : 
					Ext.StatusUtil.batchDisable('payAll,batchPay,pay,back,payment,unsubmit,manCheck');
					Ext.getCmp('add').setVisible(false);
					break;
				}
			},
				
				
			/**
			 * 按人发放//
			 */
			transferRequest : function() {
				var me = this;
				// 加载明细列表
				var records = Ext.PageUtil.validSelect(Ext.getCmp('batchRequestPanelForSRCB'));	
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
				this.filterRecords(me,records,'pay_request_id','/realware/manCheckReqs.do');
			},
			
			/**
			 * 按单发放
			 */
			transferVoucher : function() {
				var me = this;
				var records = Ext.PageUtil.validSelect(Ext.getCmp(Ext.PageUtil.prefix + Ext.getCmp('taskState').getValue()));
				this.filterRecords(me,records,'pay_voucher_id','/realware/singleTransferOfficalCard.do');
			},
			
			/**
			 * 批量发放
			 */
			transferAllVouchers : function() {
				var me = this;
				var options = {};
				Ext.PageUtil.onBeforeLoad(null, me.getQuery(), me.getModel('pay.PayVoucher'), options);
				Ext.PageUtil.doRequestAjax(me,'/realware/transferAllOfficial4Reqs.do', options.params);
			},
			
			/**
			 * 退回零余额
			 */
			transferBackRequest : function() {
				var me = this;
				// 加载明细列表
				var records = Ext.PageUtil.validSelect(Ext.getCmp('batchRequestPanelForSRCB'));	//Ext.getCmp('batchRequestPanel')
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
				this.filterRecords(me,records,'pay_request_id','/realware/transferBackOfficalCard.do');
			},
			unsubmit : function(){
				
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
								textareaValue : records[0].get("return_reason") ,
								title : '退回上岗'
							});
							backvoucherwindow.on('confirmclick',function(o,textarea){
								var params = {
									returnRes : textarea,
									billIds : Ext.encode(ids),
									last_vers : Ext.encode(lastVers),
									billTypeId : bill_type_id
								};
								Ext.PageUtil.doRequestAjax(me,'/realware/unsubmitVoucherForBatch.do',params);
							});
							backvoucherwindow.show();
						}
			},
			/**
			 * 人工核实
			 */
			manCheck : function() {
				var me = this;
				// 加载明细列表
				var records = Ext.PageUtil.validSelect(Ext.getCmp('batchRequestPanelForSRCB'));
				if(Ext.isEmpty(records)) {
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
//								margin : '10 5 3 10'
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
					win.close();
					var ids = [];
					var lastVers = [];
					Ext.Array.each(records, function(model) {
						ids.push(model.get("pay_request_id"));
						lastVers.push(model.get("last_ver"));
					});
					var params ={
						billTypeId : records[0].get("bill_type_id"),
						billIds : Ext.encode(ids),
						last_vers : Ext.encode(lastVers),
						menu_id : Ext.PageUtil.getMenuId(),
						trans_flag : flag
					}
					Ext.PageUtil.doRequestAjax(me,'/realware/manCheckReqs.do', params,'',win);
					
				}
				
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
					maps.add('pay_voucher_code','凭证号');
					maps.add('pay_amount','金额');
					var store = Ext.create('Ext.data.Store', {
						model: me.getModel('pay.PayVoucher'),
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
									Ext.OCXUtil.doOCX(selected[0].get('pay_voucher_id'),selected[0].get('bill_type_id'));
							});
					Ext.OCXUtil.doOCX(records[0].get('pay_voucher_id'),records[0].get('bill_type_id'));
					lookocxwindow.show();
				}
			},

			/**
			 * 刷新
			 * @memberOf {TypeName} 
			 */
			refreshData : function() {
				this.getStore('pay.BatchPayVouchersForSRCB').loadPage(1);
				this.getStore('pay.BatchPayVoucherRequestsForSRCB').removeAll();
			},
			
			/**
			 * 公用调用方法
			 * @param {Object} me
			 * @param {Object} records
			 * @param {Object} field
			 * @param {Object} url
			 * @return {TypeName} 
			 */
			filterRecords : function(me,records,field,url) {
				if(Ext.isEmpty(records)) {
					return ;
				}
				var ids = [];
				var lastVers = [];
				var flag = false;
				Ext.Array.each(records, function(model) {
					if(model.data.trans_succ_flag==1 || model.data.trans_succ_flag==-1){
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
