/***
 * 湖南中行支付凭证初审（行号补录）界面事件处理器
 * @memberOf {TypeName} 
 */
Ext.define('pb.controller.pay.BCheckVouchersHunanBOC',{
		extend : 'Ext.app.Controller',
		// 数据集列表：
		// pay.PayVouchersHunanBOC 支付凭证
		// pay.PayeeBankNos 收款行行号
		// common.TaskLog  操作日志
		// pay.BankSetMode 银行结算方式
		stores : [ 'pay.BPayVouchersHunanBOC', 'pay.PayeeBankNos','common.TaskLog','pay.BankSetMode','pay.BankBizTypes','pay.BankTypes','pay.UrgentFlag'],
		//对象模型 pay.PayVoucher 支付凭证
		models : [ 'pay.PayVoucher' ],
		//当创建一个控件的时候需要在此引入
		requires : [ 'pb.view.pay.BCheckVoucherListHunanBOC','pb.view.pay.BPayVoucherQueryHunanBOC','pb.view.pay.BankNoWindow',
				'pb.view.common.ImportFileWindow'],
		//创建后获取当前控件，应用于当前控制层
		refs : [ {
			ref : 'list',  //当前控制层引用
			selector : 'bCheckVoucherListHunanBOC' // 控件的别名
		}, {
			ref : 'query',
			selector : 'bPayVoucherQueryHunanBOC'
		}, {
			ref : 'banknoWindow',
			selector : 'banknowindow'
		} ],
		//事件的定义
		init : function() {
			this.control( {
					//查询区 
					'bPayVoucherQueryHunanBOC combo[id=taskState]' : {
							//状态选中
							change : function(combo, newValue, oldValue, eOpts) {
								try {
									this.selectState(combo.valueModels[0].raw.status_code);
								} catch(e) {}
							}
					},
					//行号补录
					'checkVoucherList button[id=l]' : { 
							click : this.hupdateVoucher
					},
					//列表区
					'bCheckVoucherListHunanBOC' : {
							//行号补录方法1（通常）
							'actioncolumn' : this.addBankno,
							//行号补录方法2 （主要用于湖南农行）
							'addBanknoHuNanABC' : this.addBanknoHuNanABC
					},
					//////////////////////////按钮区///////////////////////////
					//刷新 ok
					'bCheckVoucherListHunanBOC button[id=refresh]' : {
							click : this.refreshData
							//注 : 当该方法没有参数的时候可以直接这样写
					},
					//预至列表视图
					'bCheckVoucherListHunanBOC button[id=view1]' : {
							click : function(o) {
								var grid = Ext.getCmp(Ext.getCmp('taskState').getValue());
								Ext.PageUtil.onAddColumns(grid,this.getList().xtype);
							}
					},
					//请款申请  ok
					'bCheckVoucherListHunanBOC button[id=payment]' : { 
							click : function() {
								this.batchReqMoney(true);
							}
					},
					 //再次请款 ok
					'bCheckVoucherListHunanBOC button[id=repeatMoney]' : {
							click : this.batchRepeatReqMoney
					},
					//公务卡 ok
					'bCheckVoucherListHunanBOC button[id=official]' : { 
							click : this.updateVoucher
					},
					//冲销凭证 ok
					'bCheckVoucherListHunanBOC button[id=writeoff]' : { 
							click : this.writeoffPayVoucher
					},
					//支付 ok
					'bCheckVoucherListHunanBOC button[id=pay]' : { 
//							click : this.checkTransferPayVoucher
							click : function(){
								this.checkTransferPayVoucher(0);
							}
					},
					//退回初审   ok //和原来的比对一下
					'bCheckVoucherListHunanBOC button[id=unsubmit]' : {
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
					 //退回财政 ok
					'bCheckVoucherListHunanBOC button[id=back]' : {
							click : function() {
								/*backVoucher(backUrl,gridPanel1.getSelectionModel().getSelection(),
																"pay_voucher_id" ,"退回下一岗");*/
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
					 //人工支付   ok
					'bCheckVoucherListHunanBOC button[id=manTrans]' : {
							click : function (){
						 		if ( window.confirm("警告！！！您确认要人工支付吗？") ) {
									this.checkTransferPayVoucher(1)
						 		}
					 		}
					},
					 //查看凭证   ok
					'bCheckVoucherListHunanBOC button[id=look]' : {
							click : this.lookVoucher
					},
					//查看操作日志 ok
					'bCheckVoucherListHunanBOC button[id=log]' : { 
							click : this.lookLog
					},
					//行号导入  ok//跟原功能有点区别，原来的有个选择区划的功能 
					'bCheckVoucherListHunanBOC button[id=import]' : { 
						click : function() {
							var me = this;
							//这里是把该功能定义了一个控件调用的时候直接创建控件调用init方法show就完成了控件的显示
							var admdivCode = Ext.getCmp('admdivCode').getValue()
							var importwindow = Ext.create('pb.view.common.ImportFileWindow');
							importwindow.init("/realware/sysBankNo.do",me);
							importwindow.show();
						}
					},
					
					//数据导出 ok  //还没引用 exportExcel.js
					'bCheckVoucherListHunanBOC button[id=outDataToExcel]' : { 
							click : function() {
								var records = Ext.PageUtil.validSelect(Ext.getCmp(Ext.PageUtil.prefix + Ext.getCmp('taskState').getValue()));
								//如果不引用的话 这里不科学 chengkai 2015-2-5 17:50:34
								var excel = new Ext.Excel({gridId:'datagrid',sheetName:'支付凭证'});
   								excel.extGridToExcel();
							}
					}
				})
			},
			/**
			 * 冲销凭证
			 */
			writeoffPayVoucher : function() {
				var me = this;
				var records = Ext.PageUtil.validSelect(Ext.getCmp(Ext.PageUtil.prefix + Ext.getCmp('taskState').getValue()));
				if(records !=null) {
					
					// 凭证主键字符串
					var reqIds = [];
					var reqVers = [];
					for (var i = 0; i < records.length; i++) {
						reqIds.push(records[i].get("pay_voucher_id"));
						reqVers.push(records[i].get("last_ver"));
					}	
					var bill_type_id = records[0].get("bill_type_id");
					var params={
							billIds : Ext.encode(reqIds),
							last_vers : Ext.encode(reqVers),
							billTypeId : records[0].get('bill_type_id'),
							menu_id :  Ext.PageUtil.getMenuId()
						};
					Ext.PageUtil.doRequestAjax(me,'/realware/writeoffVoucher.do',params);
				}
			}
			,
			/***
			 * 再次请款
			 */
			batchRepeatReqMoney : function(){
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
			lookLog : function(){
				var records = Ext.PageUtil.validSelect(Ext.getCmp(Ext.PageUtil.prefix + Ext.getCmp('taskState').getValue()),1);
				// 数据项
				var logFileds = [ 'nodeName','taskUserName','taskOpinion','taskRemark', 'start_date','end_date', 'taskId' ]; 
				//数据集
				var logstore = this.getStore('common.TaskLog');
				if(records !=null){
						logstore.load( {
							params : {
								rowid : records[0].get('pay_voucher_id'),
								task_id : records[0].get('task_id'),
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
			/**
			 * 请款申请
			 */
			batchReqMoney : function() {
				var me = this;
				var records = Ext.PageUtil.validSelect(Ext.getCmp(Ext.PageUtil.prefix + Ext.getCmp('taskState').getValue()));
				// 凭证主键字符串
				var reqIds = [];
				var reqVers=[];
				if(records !=null) {
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
			
			/**
			 * 切换状态  注：新添加的状态在库里的状态相同的就直接添加的已有的判断里面不要再添加了
			 * @param {Object} status_code  状态code
			 */
			selectState : function(status_code) {
				
				var taskState = Ext.getCmp('taskState').getValue();
				if ("004" == taskState) {
					
					Ext.StatusUtil.batchEnable(",payment,unsubmit,official");
					Ext.StatusUtil.batchDisable("writeoff,repeatMoney,pay,manTrans,back");
					
					Ext.getCmp("payee_account_bank_no").setVisible(false);
				} else if ("005" == taskState) {
					Ext.StatusUtil.batchEnable(",repeatMoney");
					Ext.StatusUtil.batchDisable("payment,unsubmit,back,pay,manTrans,writeoff,official");
					
				//	Ext.getCmp("return_reason").setVisible(false);
				} else if ("006" == taskState) {
					
					Ext.StatusUtil.batchEnable(",writeoff,pay,manTrans");
					Ext.StatusUtil.batchDisable("official,payment,unsubmit,back,repeatMoney");
					
				//	Ext.getCmp("return_reason").setVisible(false);
				} else if ("008" == taskState) {
					
					Ext.StatusUtil.batchEnable("look");
					Ext.StatusUtil.batchDisable(",payment,unsubmit,pay,back,manTrans,writeoff,official,repeatMoney");
					
					//Ext.getCmp("return_reason").setVisible(false);
				} else if ("010" == taskState) {
					
					Ext.StatusUtil.batchEnable(",back,writeoff,look,official");
					Ext.StatusUtil.batchDisable("payment,unsubmit,pay,manTrans,official,repeatMoney");
					
				//	Ext.getCmp("return_reason").setVisible(true);
				//	Ext.getCmp('unsubmit').disable(false);
				//	Ext.getCmp("unsubmit").enable(false);
				} else if ("007" == taskState) {
					
					Ext.StatusUtil.batchDisable(",payment,unsubmit,back,pay,manTrans,writeoff,official,repeatMoney");
					
				//	Ext.getCmp("return_reason").setVisible(true);
				}else {
					
					Ext.StatusUtil.batchEnable(",payment,unsubmit,back,pay,manTrans,writeoff,official,repeatMoney");
					
				//	Ext.getCmp("return_reason").setVisible(false);
				}
				this.refreshData();
				
			},
			
			banknoRow : null, //行号补录操作行
			addBankno : function(grid, rowIndex, colIndex, node, e, record, rowEl) {
				var b = true;
				rowIndex1 = rowIndex;
				var bankStore = Ext.create('Ext.data.Store', {
							fields : [{
										name : 'bank_name'
									}, {
										name : 'bank_no'
									}, {
										name : "match_ratio"
									}, {
										name : "like_ratio"
									}],
							proxy : {
								extraParams : {
									acctno : record.data['payee_account_no'],
									bankname : encodeURI(record.data['payee_account_bank']),
									fields : JSON.stringify(["bank_name", "bank_no",
											"match_ratio", "like_ratio"])
								},
								type : 'ajax',
								url : '/realware/loadBanknos.do',
								reader : {
									type : 'json'
								}
							}
						});
					bankStore.load(function(records, operation, success) {
							if (!success) {
								Ext.Msg.show({
											title : '失败提示',
											msg : '行号检索失败！',
											buttons : Ext.Msg.OK,
											icon : Ext.MessageBox.ERROR
										});
								return;
							}
							Ext.Array.each(records, function(model) {
										if (model.get("match_ratio") == "1" && model.get("like_ratio") == "1") {
											grid.getStore().data.items[rowIndex1].set("payee_account_bank_no", model.get("bank_no"));
											return;
										}
									});
							if (b) {
								if (bankWin == null) {
									bankWin = Ext.create('Ext.window.Window', {
										title : '行号补录对话框',
										width : 550,
										height : 300,
										layout : 'fit',
										resizable : false,
										closeAction : 'hide',
										modal : true,
										items : [new Ext.FormPanel({
											bodyPadding : 5,
											items : [{
												layout : 'hbox',
												defaults : {
													margins : '3 10 0 0'
												},
												height : 35,
												items : [{
															id : 'ori_bankname',
															fieldLabel : '&nbsp;收款行名称',
															xtype : 'textfield',
															labelWidth : 70,
															width : 360
														}, {
															id : 'bankType',
															fieldLabel : '',
															xtype : 'combo',
															dataIndex : 'bankType',
															displayField : 'name',
															emptyText : '请选择',
															valueField : 'value',
															labelWidth : 50,
															width : 83,
															editable : false,
															store : bankTypeStore
														}, {
															text : '查询',
															xtype : 'button',
															handler : function() {
																var oribankname = Ext
																		.getCmp('ori_bankname')
																		.getValue();
																bankStore.load({
																	params : {
																		acctno : record.data['payee_account_no'],
																		bankname : encodeURI(oribankname)
																	}
																});
															}
														}]
											}, {
												xtype : 'gridpanel',
												id : 'gridBankno',
												viewConfig : {
													enableTextSelection : true
												},
												store : bankStore,
												columns : [{
															text : '银行名称',
															dataIndex : 'bank_name',
															width : '380'
														}, {
															text : '银行行号',
															dataIndex : 'bank_no',
															width : '180'
														}],
												height : 200,
												listeners : {
													'itemdblclick' : function(view, record, item,
															index, e) {
														var bankNo = record.get("bank_no");
														grid.getStore().data.items[rowIndex1].set(
																"payee_account_bank_no", bankNo);
														grid.getStore().data.items[rowIndex1].set(
																"pb_set_mode_name",
																Ext.getCmp('bankType').rawValue);
														grid.getStore().data.items[rowIndex1].set(
																"pb_set_mode_code", Ext
																		.getCmp('bankType')
																		.getValue());
														this.up('window').hide();
													}
												}
											}],
											buttons : [{
												text : '确定',
												handler : function() {
													var records = Ext.getCmp('gridBankno')
															.getSelectionModel().getSelection();
													if (records.length == 0)
														return;
													grid.getStore().data.items[rowIndex1].set(
															"payee_account_bank_no", records[0]
																	.get("bank_no"));
													// var d= Ext.getCmp('bankType');
													var getStoreData = bankTypeStore.data;
													var bankTypeName;
													for (var i = 0; i < getStoreData.length; i++) {
														var temp = getStoreData.getAt(i);
														if (temp.data.value == Ext
																.getCmp('bankType').getValue()) {
															bankTypeName = temp.data.name;
															break;
														}
													}
													grid.getStore().data.items[rowIndex1].set(
															"pb_set_mode_name", bankTypeName);
													grid.getStore().data.items[rowIndex1].set(
															"pb_set_mode_code", Ext
																	.getCmp('bankType').getValue());
													this.up('window').hide();
												}
											}, {
												text : '取消',
												handler : function() {
													this.up('form').getForm().reset();
													this.up('window').hide();
												}
											}]
										})]
									});
								} else {
									Ext.getCmp("gridBankno").getStore().removeAll();
									Ext.getCmp("gridBankno").getStore().add(bankStore.getRange());
								}
								var tempModeCode = grid.getStore().data.items[rowIndex1]
										.get("pb_set_mode_code");
					
								if (tempModeCode == null || tempModeCode == '') {
									Ext.getCmp("bankType").setValue("1");
								} else {
									Ext.getCmp("bankType").setValue(tempModeCode);
								}
					
								Ext.getCmp("ori_bankname").setValue(record
										.get("payee_account_bank"));
					
								bankWin.show();
							}
						});
			},
			
			checkVoucher : function(isReturn) {
				var me = this;
				var ajaxBool = true;
				var bankstore = Ext.getStore('pay.BankSetMode').data.items;
				var records = Ext.PageUtil.validSelect(Ext.getCmp(Ext.PageUtil.prefix + Ext.getCmp('taskState').getValue()));
				if(records !=null) {
					
					var ajaxBool = true;
					
					var reqIds = []; // 凭证主键字符串
					var reqVers = []; // 凭证lastVer字符串
					var jsonMap = "[";
					
					Ext.Array.each(records, function(model) {
						// 验证是否都已补录行号
						var payeeAcctBankno = model.get("payee_account_bank_no");
						var pbSetModeCode = model.get("pb_set_mode_code");
						if (null == payeeAcctBankno || "" == payeeAcctBankno) {
							Ext.Msg.alert("系统提示", "凭证：" + model.get("pay_voucher_code")+ "请先补录行号再进行初审操作！");
							ajaxBool = false;
						}
						reqIds.push(model.get("pay_voucher_id"));
						reqVers.push(model.get("last_ver"));
						jsonMap += "{\"id\":\"" + model.get("pay_voucher_id")+"\",\"bankNo\":\"" + payeeAcctBankno+"\",\"setModeCode\":\"" +  model.get("pb_set_mode_code") +"\",\"setModeName\":\"" + model.get("pb_set_mode_name") + "\"},";
					});
					if (ajaxBool) {
						var params =  {
								is_onlyreq : 0,
								billTypeId : records[0].get("bill_type_id"),
								billIds : Ext.encode(reqIds),
								last_vers : Ext.encode(reqVers),
								jsonMap : jsonMap.substring(0, jsonMap.length - 1)+ "]",
								isCheck : isReturn,
								menu_id :  Ext.PageUtil.getMenuId()
						};
						Ext.PageUtil.doRequestAjax(me,'/realware/checkVoucher.do',params);
					}
				}
				
			},
				
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

			/*******************************************************************************
			 * 撤销审核
			 */
			voucherUnAudit : function() {
				var me = this;
				var ajaxBool = true;
				var bankstore = Ext.getStore('pay.BankSetMode').data.items;
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
							last_vers : Ext.encode(reqVers),
							menu_id :  Ext.PageUtil.getMenuId()
					};
					Ext.PageUtil.doRequestAjax(me,'/realware/unAuditPayVoucher.do',params);
				}
				
			},

			/*******************************************************************************
			 * 刷新
			 * 
			 * @return
			 */
			refreshData : function() {
				this.getStore('pay.BPayVouchersHunanBOC').loadPage(1);
			},

			/*******************************************************************************
			 * 同步联行号，读取最新银行行号文件更新到数据库中
			 * 
			 * @return
			 */
			synBankNo : function() {
				var ajaxBool = true;
				var myMask = new Ext.LoadMask(Ext.getBody(), {
					msg : '后台正在处理中，请稍后....',
					removeMask : true
						// 完成后移除
					});
				if (ajaxBool) {
					myMask.show();
					Ext.Ajax.request({
								url : '/realware/sysBankNo.do',
								method : 'POST',
								timeout : 1800000, // 设置为3分钟
								success : function(response, options) {
									succAjax(response, myMask);
								},
								failure : function(response, options) {
									failAjax(response, myMask);
								}
							});
				}
			},
			
			importFile : function(url, type, admdiv) {
				// 如果没有传入类型，则默认为txt类型
				if (type == undefined)
					var type = 'txt';
				Ext.widget('window', {
					title : '文件导入对话框',
					id : 'uploadWindow',
					width : 350,
					height : 160,
					modal : true,
					layout : 'fit',
					resizable : false,
					items : Ext.widget('form', {
								layout : 'form',
								fileUpload : true,
								border : false,
								width : 380,
								height : 100,
								bodyStyle : 'padding:20 5 5 5',
								frame : true,
								fieldDefaults : {
									labelAlign : 'right',
									labelWidth : 80
								},
								items : [{
											//导入账户后，不停刷新，原因：id重复
											id : 'admdiv_code_import',
											name:'admdivCode',
											fieldLabel : '所属财政',
											xtype : 'combo',
											dataIndex : 'admdiv_code',
											displayField : 'admdiv_name',
											emptyText : '请选择',
											valueField : 'admdiv_code',
											labelWidth : 60,
											width : 34,
											store : comboAdmdiv,
											value : comboAdmdiv.data.length > 0
												? comboAdmdiv.data.getAt(0).get("admdiv_code")
												: "",
											editable : false,
											listeners : {
												//'select' : selectAdmdiv
												}
											}, {
											name : 'file',
											fieldLabel : '文件(.' + type + '格式)',
											xtype : 'filefield',
											id : 'uploadfilename',
											allowBlank : false,
											blankText : "请选择您要导入的.'+type+'文件",
											buttonText : '选择文件...'
										}],
								buttons : [{
									text : '导入',
									formBind : true,
									handler : function() {
										var form = this.up('form').getForm();
										if (form.isValid()) {
											if (!Ext.getCmp("uploadfilename").getValue()
													.match("." + type + "$")) {
												Ext.Msg.show({
															title : '提示',
															msg : "请选择" + type + "类型文件上传!",
															buttons : Ext.Msg.OK,
															icon : Ext.MessageBox.ERROR
														});
												return;
											};
												Ext.MessageBox.confirm('导入文件提示', '确认导入？', function(button,text){
												if(button=='yes'){
													form.submit({
														url : url,
														method : 'post',
														timeout : 18000, // 设置为3分钟
														waitTitle : '提示',
														waitMsg : '正在导入文件，请您耐心等候...',
														success : function(form, action) {
															succForm(form, action);
															Ext.getCmp("uploadWindow").close();
															refreshData();												
														},
														failure : function(form, action) {
															failForm(form, action);
														}
													});
												}
											});
											
										}
									}
								}, {
									text : '取消',
									handler : function() {
										this.up('form').getForm().reset();
										this.up('window').close();
									}
								}]
							})
				}).show();
				
			}
});
			
			
					
					