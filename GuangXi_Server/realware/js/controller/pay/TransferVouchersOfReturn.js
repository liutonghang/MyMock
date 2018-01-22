/***
 * 支付凭证请款复核转账界面事件处理器（湖南中行）
 * @memberOf {TypeName} 
 */
Ext.define('pb.controller.pay.TransferVouchersOfReturn',{
		extend : 'Ext.app.Controller',
		// 数据集列表：
		// pay.PayVouchers 支付凭证
		// common.TaskLog  操作日志
		// pay.BankSetMode 银行结算方式
		stores : [ 'pay.PayVouchersHunanBOCTransfer','pay.PayeeBankNos','common.TaskLog','pay.BankSetMode','pay.BankBizTypes','pay.BankTypes','pay.UrgentFlag'],
		//对象模型 pay.PayVoucher 支付凭证
		models : [ 'pay.PayVoucher' ],
		//当创建一个控件的时候需要在此引入
		requires : [ 'pb.view.pay.TransferVoucherListOfReturn','pb.view.pay.PayVoucherQueryOfReturn','pb.view.pay.BankNoWindow',
				'pb.view.common.ImportFileWindow'],
		//创建后获取当前控件，应用于当前控制层
		refs : [ {
			ref : 'list',  //当前控制层引用
			selector : 'transferVoucherListOfReturn' // 控件的别名
		}, {
			ref : 'query',
			selector : 'payVoucherQueryOfReturn'
		}],
		//事件的定义
		init : function() {
			this.control( {
					//查询区 
					'payVoucherQueryOfReturn combo[id=taskState]' : {
						//状态选中
						change : function(combo, newValue, oldValue, eOpts) {
							try {
								this.selectState(combo.valueModels[0].raw.status_code);
							} catch(e) {}
						}
					},
					//////////////////////////按钮区///////////////////////////
					//请款申请
					'transferVoucherListOfReturn button[id=payment]' : {
//						click : this.batchReqMoney
						click : function() {
						       this.batchReqMoney('payment');
					        }
					},
					//退回初审
					'transferVoucherListOfReturn button[id=unsubmit]' : { 
						click : function() {
								// this.backVoucher(false);
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
										title : '退回初审'
									});
									backvoucherwindow.on('confirmclick',function(o,textarea){
										var params = {
											returnRes : textarea,
											billIds : Ext.encode(ids),
											last_vers : Ext.encode(lastVers),
											billTypeId : bill_type_id
										};
										//注：退回财政，根据不同业务需求，配置不同的路径
										Ext.PageUtil.doRequestAjax(me,'/realware/unsubmitVoucher.do',params);
									});
									backvoucherwindow.show();
								}
							}
					},
					//冲销凭证
					'transferVoucherListOfReturn button[id=writeoff]' : { 
							click : this.writeoffPayVoucher
					},
					 //公务卡
					'transferVoucherListOfReturn button[id=official]' : { 
							click : this.updateVoucher
					 },
					 //再次请款
					 'transferVoucherListOfReturn button[id=repeatMoney]' : { 
							click : this.batchRepeatReqMoney
					 },
					 //支付
					'transferVoucherListOfReturn button[id=pay]' : { 
							click : function(){
								this.checkTransferPayVoucher(0);
							}
					},
					  //退回财政
					'transferVoucherListOfReturn button[id=back]' : { 
							click : function() {
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
										Ext.PageUtil.doRequestAjax(me,'/realware/returnVoucher.do',params);
									});
									backvoucherwindow.show();
								}
							}
					},
					//人工支付
					'transferVoucherListOfReturn button[id=manTrans]' : { 
						click : function() {
							if(window.confirm("警告！！！您确认要人工支付吗？")){
								this.checkTransferPayVoucher(1);
							}
						}
					},
					//查看凭证
					'transferVoucherListOfReturn button[id=look]' : {
						click : this.lookVoucher
					},
					//查看操作日志
					'transferVoucherListOfReturn button[id=log]' : { 
						click : this.lookLog
					},
					//刷新
					'transferVoucherListOfReturn button[id=refresh]' : { 
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
				var taskState = Ext.getCmp('taskState').getValue();
				if ("004" == taskState) {
					Ext.StatusUtil.batchDisable("back,official,pay,manTrans,writeoff,repeatMoney");
					Ext.StatusUtil.batchEnable("payment,unsubmit");
					Ext.getCmp("payee_account_bank_no").setVisible(false);
				} else if ("005" == taskState) {
					Ext.StatusUtil.batchDisable("payment,unsubmit,back,pay,manTrans,writeoff,official");
					Ext.StatusUtil.batchEnable("repeatMoney");
				} else if ("006" == taskState) {
					Ext.StatusUtil.batchDisable("payment,unsubmit,back,repeatMoney");
					Ext.StatusUtil.batchEnable("pay,manTrans,writeoff,official");
				} else if ("008" == taskState) {
					Ext.StatusUtil.batchDisable("payment,unsubmit,pay,back,manTrans,writeoff,official,repeatMoney");
				} else if ("010" == taskState) {
					Ext.StatusUtil.batchDisable("payment,unsubmit,pay,manTrans,official,repeatMoney");
					Ext.StatusUtil.batchEnable("back,writeoff,official,writeoff");
				} else if ("007" == taskState) {
					Ext.StatusUtil.batchDisable("payment,unsubmit,back,pay,manTrans,writeoff,official,repeatMoney");
				}else {
					Ext.StatusUtil.batchDisable("payment,unsubmit,back,pay,manTrans,writeoff,official,repeatMoney");
				}
//				this.refreshData();
			},
			/**
			 * 公务卡
			 * @memberOf {TypeName} 
			 * @return {TypeName} 
			 */
			selectAdmdiv : function() {
				setBtnVisible(Ext.getCmp("admdiv").getValue(), null);
				refreshData();
			},
			
			batchReqMoney : function() {
				var me = this;
				var records = Ext.PageUtil.validSelect(Ext.getCmp(Ext.PageUtil.prefix + Ext.getCmp('taskState').getValue()));
				if (records.length == 0) {
					Ext.Msg.alert("系统提示", "请至少选中一条凭证信息");
					return;
				}
				if(records !=null) {
					var reqIds = [];
					var reqVers = [];
					for (var i = 0; i < records.length; i++) {
						reqIds.push(records[i].get("pay_voucher_id"));
						reqVers.push(records[i].get("last_ver"));
					}
					var bill_type_id = records[0].get("bill_type_id");
					var params = {
							billTypeId : bill_type_id,
							billIds : Ext.encode(reqIds),
							last_vers: Ext.encode(reqVers),
							accountType :accountType,
							menu_id :  Ext.PageUtil.getMenuId()
					}
					Ext.PageUtil.doRequestAjax(me,'/realware/batchReqMoney.do',params);
				}
			},
			
			//退回			
			unsubmit : function() {
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
						title : '退回初审'
					});
					backvoucherwindow.on('confirmclick',function(o,textarea){
						var params = {
							returnRes : textarea,
							billIds : Ext.encode(ids),
							last_vers : Ext.encode(lastVers),
							billTypeId : bill_type_id
						};
						//注：退回财政，根据不同业务需求，配置不同的路径
						Ext.PageUtil.doRequestAjax(me,'/realware/unsubmitVoucher.do',params);
					});
					backvoucherwindow.show();
				}
			},
			/**
			 * 再次请款
			 * @memberOf {TypeName} 
			 * @return {TypeName} 
			 */
			batchRepeatReqMoney : function() {
				var me = this;
				var records = Ext.PageUtil.validSelect(Ext.getCmp(Ext.PageUtil.prefix + Ext.getCmp('taskState').getValue()));
				if(records !=null) {
					// 凭证主键字符串
					var reqIds = [];
					var reqVers=[];
					for (var i = 0; i < records.length; i++) {
						reqIds.push(records[i].get("pay_voucher_id"));
						reqVers.push(records[i].get("last_ver"));
					}
					var bill_type_id = records[0].get("bill_type_id");
					var params = {
							// 单据类型id
							billTypeId : bill_type_id,
							billIds : Ext.encode(reqIds),
							last_vers: Ext.encode(reqVers),
							accountType :accountType,
							menu_id :  Ext.PageUtil.getMenuId()
						};
					Ext.PageUtil.doRequestAjax(me,'/realware/batchRepeatReqMoney.do',params);
				}
			},
			/**
			 * @memberOf {TypeName} 
			 * @return {TypeName} 
			 */
			updateVoucher : function() {
				var me = this;
				var records = Ext.PageUtil.validSelect(Ext.getCmp(Ext.PageUtil.prefix + Ext.getCmp('taskState').getValue()));;
				var ids = null;
				if(records !=null) {
					Ext.Array.each(records, function(model) {
								ids = ids + model.get("pay_voucher_id") + ",";
							});
					
					var params={
							ids : ids.substring(0, ids.length - 1),
							objMap : '[{\'is_onlyreq\':1}]',
							remark : '普通支付转公务卡'
						};
					Ext.PageUtil.doRequestAjax(me,'/realware/updatePayVoucher.do', params);
				}
			},
			
			/**
			 * 冲销凭证
			 * @memberOf {TypeName} 
			 * @return {TypeName} 
			 */
			writeoffPayVoucher : function() {
				var me = this;
				var records = Ext.PageUtil.validSelect(Ext.getCmp(Ext.PageUtil.prefix + Ext.getCmp('taskState').getValue()));
				if(records !=null) {
					// 凭证主键字符串
					var reqIds = [];
					var reqVers = [];
					for ( var i = 0; i < records.length; i++) {
						reqIds.push(records[i].get("pay_voucher_id"));
						reqVers.push(records[i].get("last_ver"));
					}
					var bill_type_id = records[0].get("bill_type_id");
					var params = {
						// 单据类型id
						billTypeId : bill_type_id,
						last_vers : Ext.encode(reqVers),
						billIds : Ext.encode(reqIds)
					};
					Ext.PageUtil.doRequestAjax(me,'/realware/writeoffVoucher.do',params);
				}
			},
					
			/***
			 * 查看凭证
			 * @memberOf {TypeName} 
			 */
			lookVoucher : function(){
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
					

			/***
			 * 查看操作日志
			 * @memberOf {TypeName} 
			 */
			lookLog:function(){
				var records =  Ext.PageUtil.validSelect(Ext.getCmp(Ext.PageUtil.prefix + Ext.getCmp('taskState').getValue()),1);
				// 数据项
				var logFileds = [ "nodeName","taskUserName","taskOpinion","taskRemark", "start_date","end_date", "taskId" ]; 
				//数据集
				var logstore = this.getStore('common.TaskLog');
				if(records !=null){
						logstore.load( {
							params : {
								rowid : records[0].get("pay_voucher_id"),
								task_id : records[0].get("task_id"),
								filedNames : Ext.encode(logFileds)
							}
						});
						//显示列
						var maps = Ext.create('Ext.util.HashMap');
						maps.add('nodeName', '岗位名称');
						maps.add('taskOpinion', '操作类型');
						maps.add('taskUserName', '操作用户');
						maps.add('end_date', '审核日期');
						maps.add('taskRemark', '意见');
						//此处调用的是一个公用的selectWindow这个方法 saveHidden:true,closeHidden:true设置确定、取消按钮不显示
						Ext.create('pb.view.common.SelectWindow',{
								saveHidden : true,
								closeHidden : true,
								title : '操作日志列表信息',
								listStore : logstore,
								colMaps : maps
						}).show();
				}
			},
			/**
			 * 刷新
			 * @memberOf {TypeName} 
			 */
			refreshData : function() {
				this.getStore('pay.PayVouchersHunanBOCTransfer').loadPage(1);
			},
					
			//再次转账，需要修改备注
			againBankTransferVoucher : function(){
				var me = this;
				var records =  Ext.PageUtil.validSelect(Ext.getCmp(Ext.PageUtil.prefix + Ext.getCmp('taskState').getValue()),1);
				var reqIds = [];
				var reqVers = [];
				Ext.Array.each(records, function(model) {
					reqIds .push(model.get("pay_voucher_id"));
					reqVers.push(model.get("last_ver"));
				});
				var paySummaryName = records[0].get('pay_summary_name');
				var localtranswindow = Ext.create('pb.view.common.TextareaWindow',{
						title : '修改备注',
						textareaValue : paySummaryName
					});
				localtranswindow.on('confirmclick',function(o,textarea){
					var params = {
						billTypeId : records[0].get("bill_type_id"),
						billIds : Ext.encode(reqIds),
						last_vers : Ext.encode(reqVers),
						remark : textarea
					};
					Ext.PageUtil.doRequestAjax(me,'/realware/bankTransferVoucher.do',params);
				});
				localtranswindow.show();
			},
					
					/**
					 * 确认凭证（即支付）
					 *
					 */
					checkTransferPayVoucher : function(transSucc){
						var me = this;
						var records = Ext.PageUtil.validSelect(Ext.getCmp(Ext.PageUtil.prefix + Ext.getCmp('taskState').getValue()));
						var reqIds = [];
						var reqVers = [];
						if(records !=null) {
							Ext.Array.each(records, function(model) {
								reqIds.push(model.get("pay_voucher_id"));
								reqVers.push(model.get("last_ver"));
							});
							
							var params = {
									// 单据类型id
									billTypeId : records[0].get("bill_type_id"),
									billIds : Ext.encode(reqIds),
									last_vers : Ext.encode(reqVers),
									is_onlyreq : 0,
									transSucc : transSucc, 
									accountType : accountType,
									menu_id :  Ext.PageUtil.getMenuId()
							};
							Ext.PageUtil.doRequestAjax(me,'/realware/checkTransferPayVoucher.do',params);
						}
					},
					
					backVoucher : function(backUrl,records, idName,opereteName) {
						if (records.length == 0) {
							parent.Ext.Msg.alert('系统提示', '请至少选择一条数据！');
							return;
						}
						if(opereteName==undefined){
							opereteName = "退回财政";
						}
						var ids = [];
						var lastVers = [];
						Ext.Array.each(records,function(model) {
									ids.push(model.get(idName));
									lastVers.push(model.get("last_ver"));
								});
						var bill_type_id = records[0].get("bill_type_id");
						Ext.widget('window', {
							id : 'backWin',
							title : opereteName+'原因',
							width : 380,
							height : 150,
							layout : 'fit',
							resizable : false,
							modal : true,
							items : [Ext.widget('form', {
										renderTo : Ext.getBody(),
										layout : {
											type : 'hbox',
											padding : '10'
										},
										resizable : false,
										modal : true,
										items : [{
													xtype : 'textareafield',
													height : 70,
													width : 345,
													id : 'beaText'
												}],
										buttons : [{
											text : '确定',
											handler : function() {
												// 退票/退回原因
												var backRes = Ext.getCmp('beaText').getValue();
												if (backRes == ""){
													Ext.Msg.alert("系统提示", opereteName+"原因不能为空！");
													return ;
												};
												if (backRes.length > 40) {
													Ext.Msg.alert("系统提示", opereteName+"原因长度不能超过40个字！");
													return;
												};
												
												var myMask = new Ext.LoadMask('backWin', {
														msg : '后台正在处理中，请稍后....',
														removeMask : true   // 完成后移除
														});
					
												myMask.show();
												// 提交到服务器操作
													Ext.Ajax.request({
																url : backUrl,
																method : 'POST',
																timeout : 180000, // 设置为3分钟
																params : {
																	returnRes : backRes,
																	billIds : Ext.encode(ids),
																	last_vers : Ext.encode(lastVers),
																	billTypeId : bill_type_id
																},
																// 提交成功的回调函数
																success : function(response,options) {
																	succAjax(response,myMask);
																	Ext.getCmp('backWin').close();
																	refreshData();
																},
																// 提交失败的回调函数
																failure : function(response,options) {
																	failAjax(response,myMask);
																}
															});
												}
										}, {
											text : '取消',
											handler : function() {
												this.up('window').close();
											}
										}]
					
									})]
						}).show();
					}
});
