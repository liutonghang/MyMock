/***
 * 湖南中行支付凭证初审（行号补录）界面事件处理器
 * @memberOf {TypeName} 
 */
Ext.define('pb.controller.pay.CheckVouchersHunanBOC',{
		extend : 'Ext.app.Controller',
		// 数据集列表：
		// pay.PayVouchersHunanBOC 支付凭证
		// pay.PayeeBankNos 收款行行号
		// common.TaskLog  操作日志
		// pay.BankSetMode 银行结算方式
		stores : [ 'pay.PayVouchersHunanBOC', 'pay.PayeeBankNos','common.TaskLog','pay.BankSetMode','pay.BankBizTypes','pay.BankTypes','pay.UrgentFlag'],
		//对象模型 pay.PayVoucher 支付凭证
		models : [ 'pay.PayVoucher' ],
		//当创建一个控件的时候需要在此引入
		requires : [ 'pb.view.pay.CheckVoucherListHunanBOC','pb.view.pay.PayVoucherQueryHunanBOC','pb.view.pay.BankNoWindow',
				'pb.view.common.ImportFileWindow'],
		//创建后获取当前控件，应用于当前控制层
		refs : [ {
			ref : 'list',  //当前控制层引用
			selector : 'checkVoucherListHunanBOC' // 控件的别名
		}, {
			ref : 'query',
			selector : 'payVoucherQueryHunanBOC'
		}, {
			ref : 'banknoWindow',
			selector : 'banknowindow'
		},{
			ref : 'importFileWindow',
			selector : 'importFileWindow'
		} ],
		
		//事件的定义
		init : function() {
			this.control( {
					//查询区 
					'payVoucherQueryHunanBOC combo[id=taskState]' : {
							//状态选中
							change : function(combo, newValue, oldValue, eOpts) {
								try {
									this.selectState(combo.valueModels[0].raw.status_code);
									
								} catch(e) {}
							}
					},
					//列表区
					'checkVoucherListHunanBOC' : {
							//行号补录方法1（通常）
							'addBankno' : this.addBankno,
							//行号补录方法2 （主要用于湖南农行）
							'addBanknoHuNanABC' : this.addBanknoHuNanABC
					},
					//////////////////////////按钮区///////////////////////////
					//刷新
					'checkVoucherListHunanBOC button[id=refresh]' : {
							click : this.refreshData
					},
					//预至列表视图
					'checkVoucherListHunanBOC button[id=view1]' : {
							click : function(o) {
								var grid = Ext.getCmp(Ext.getCmp('taskState').getValue());
								Ext.PageUtil.onAddColumns(grid,this.getList().xtype);
							}
					},
					//初审
					'checkVoucherListHunanBOC button[id=audit]' : { 
							click : function() {
								this.checkVoucher(true);
							}
					},
					//公务卡
					'checkVoucherListHunanBOC button[id=official]' : { 
							click : this.updateVoucher
					},
					//送审
					'checkVoucherListHunanBOC button[id=submit]' : {
							click : function() {
								this.checkVoucher(false);
							}
					 },
					 //退回财政
					'checkVoucherListHunanBOC button[id=back]' : {
							click : function() {
							var me = this;
							//这里是把该功能定义了一个控件调用的时候直接创建控件调用init方法show就完成了控件的显示
							var records = Ext.PageUtil.validSelect(Ext.getCmp(Ext.PageUtil.prefix + Ext.getCmp('taskState').getValue()));
							this.backVoucher(backUrl,records,"pay_voucher_id" ,"退回下一岗");
							}
					 },
					 //查看凭证   
					'checkVoucherListHunanBOC button[id=look]' : {
							click : this.lookVoucher
					},
					//查看操作日志 
					'checkVoucherListHunanBOC button[id=log]' : { 
							click : this.lookLog
					},
					//行号导入 
					'checkVoucherListHunanBOC button[id=import]' : { 
							click : function() {
							var me = this;
							//这里是把该功能定义了一个控件调用的时候直接创建控件调用init方法show就完成了控件的显示
							var admdivCode = Ext.getCmp('admdivCode').getValue();
							var importwindow = Ext.create('pb.view.common.ImportFileWindow');
							importwindow.init("/realware/sysBankNo.do",me);
							importwindow.show();
						}
					},
					//数据导出
					'checkVoucherListHunanBOC button[id=outDataToExcel]' : { 
							click : function() {
							    var me = this;
								//这里是把该功能定义了一个控件调用的时候直接创建控件调用init方法show就完成了控件的显示
								var records = Ext.PageUtil.validSelect(Ext.getCmp(Ext.PageUtil.prefix + Ext.getCmp('taskState').getValue()));
								if (records.length == 0) {
									Ext.Msg.alert("系统提示","请选择导出的数据");
									return;
								}
								//如果不引用的话 这里不科学  2015-2-5 17:50:34
								//var excel = new Ext.Excel({gridId : 'datagrid',sheetName : '支付凭证'});
								//excel.extGridToExcel();
							}
					}
				})
			},
					
			/**
			 * 切换状态  注：新添加的状态在库里的状态相同的就直接添加的已有的判断里面不要再添加了
			 * @param {Object} status_code  状态code
			 */
			selectState : function(status_code) {
				if ('000' == status_code) { //未初审
					Ext.StatusUtil.batchEnable("audit,back,official");
					Ext.StatusUtil.batchDisable("submit");
					//湖南农行个性化按钮
					Ext.StatusUtil.batchEnable("haudit,hback,hofficial");
					Ext.StatusUtil.batchDisable("hsubmit");
				} else if ('001' == status_code) { //已初审
					Ext.StatusUtil.batchDisable("audit,back,official,submit");
					//湖南个性化按钮
					Ext.StatusUtil.batchDisable("haudit,hback,hofficial,hsubmit");
				} else if ('002' == status_code) { //被退回
					Ext.StatusUtil.batchEnable("submit,back,official");
					Ext.StatusUtil.batchDisable("audit");
					//湖南个性化按钮
					Ext.StatusUtil.batchEnable("hsubmit,hback,hofficial");
					Ext.StatusUtil.batchDisable("haudit");
				} else if ('003' == status_code) { //已退回
					//正常情况下初审界面的已退回
					Ext.StatusUtil.batchDisable("audit,submit,back,official");
					//HuNanABC 在已退回的状态下显示的按钮
					Ext.StatusUtil.batchDisable("haudit,hsubmit,hback,hofficial");
				}
			//	this.refreshData();
			},
			
			banknoRow : null, //行号补录操作行
			addBankno : function(grid, rowIndex, colIndex, node, e, record, rowEl) {
				var me = this;
				var bankWin = me.getBanknoWindow();
				if(!bankWin) {
					var banknoStore = this.getStore('pay.PayeeBankNos');
					bankWin = Ext.create('pb.view.pay.BankNoWindow',{
								banknoStore : banknoStore
					});
					//补录行号确定按钮触发
					bankWin.on('bankNoclick', function(grid){
						var rs = grid.getSelectionModel().getSelection();
						if (rs.length == 0){
							return;
						}
						var bankSetMode = bankWin.getForm().findField('banksetMode');
						bankWin.curRow.set({
								 'payee_account_bank_no' : rs[0].get('bank_no'), 
								 'pb_set_mode_name' : bankSetMode.rawValue, 
								 'pb_set_mode_code' : bankSetMode.getValue()
								});
						bankWin.hide();
					});
					
				}
				bankWin.curRow = record;
				bankWin.payeeAccountNo = bankWin.curRow.get('payee_account_no');
				//判断结算方式、查询记录如果没做操作默认选中第一个选项
				var tempModeCode = bankWin.curRow.get('pb_set_mode_code');
				var form = bankWin.getForm();
				var field = form.findField('banksetMode');
				if (tempModeCode == null || tempModeCode == '') {
					field.setValue('1');
				} else {
					field.setValue(tempModeCode);
				}
				form.findField('ori_bankname').setValue(bankWin.curRow.get('payee_account_bank'));
				var button = Ext.ComponentQuery.query('button[text="查询"]', bankWin)[0];
				//显示窗口
				bankWin.show();
				//此处使用handler.call，否则由于scope的不同，无法触发“查询”的handler事件，如fireEvent
				button.handler.call(button);
			},
			
			/**
			 * 初审
			 * @param {Object} isReturn
			 * @memberOf {TypeName} 
			 * @return {TypeName} 
			 */
			checkVoucher : function(isReturn) {
				var me = this;
				var ajaxBool = true;
				var bankstore = Ext.getStore('pay.BankSetMode').data.items;
				var records = Ext.PageUtil.validSelect(Ext.getCmp(Ext.PageUtil.prefix + Ext.getCmp('taskState').getValue()));
				if(records !=null) {
					var reqIds = []; // 凭证主键字符串
					var reqVers = []; // 凭证lastVer字符串
					var jsonMap = '[';
					Ext.Array.each(records, function(model) {
						// 验证是否都已补录行号
						var payeeAcctBankno = model.get('payee_account_bank_no');
						var pbSetModeCode = model.get('pb_set_mode_code');
						var pbSetModeName = null;
						Ext.Array.each(bankstore, function(model) {
							if(model.get('value')==pbSetModeCode){
								pbSetModeName = model.get('name');
							}
						});
						if (null == payeeAcctBankno || '' == payeeAcctBankno) {
							Ext.Msg.alert('系统提示', '凭证：'+ model.get('pay_voucher_code') + '请先补录行号再进行初审操作！');
							ajaxBool = false;
						}

						reqIds.push(model.get('pay_voucher_id'));
						reqVers.push(model.get('last_ver'));
						jsonMap += '{\'id\':\''
								+ model.get('pay_voucher_id')
								+ '\',\'bankNo\':\'' + payeeAcctBankno
								+ '\',\'setModeCode\':\''
								+ model.get('pb_set_mode_code')
								+ '\',\'setModeName\':\''
								+ pbSetModeName
								+ '\'},';
					});
					if (ajaxBool) {
						var params = {
							is_onlyreq : 0,
							billTypeId : records[0].get('bill_type_id'),
							billIds : Ext.encode(reqIds),
							last_vers : Ext.encode(reqVers),
							jsonMap : jsonMap.substring(0,jsonMap.length - 1) + ']',
							isCheck : isReturn,
							menu_id :  Ext.PageUtil.getMenuId()
						};
						Ext.PageUtil.doRequestAjax(me,'/realware/checkVoucher.do',params);
					}
				}
			},
				
			/**
			 * 公务卡
			 * @memberOf {TypeName} 
			 * @return {TypeName} 
			 */
			updateVoucher : function() {
				var me = this;
				var records = Ext.PageUtil.validSelect(Ext.getCmp(Ext.PageUtil.prefix + Ext.getCmp('taskState').getValue()));
				if(records !=null) {
					var reqIds = []; // 凭证主键字符串
					var reqVers = []; // 凭证lastVer字符串
					var jsonMap = '[';
					Ext.Array.each(records, function(model) {
						reqIds.push(model.get('pay_voucher_id'));
						reqVers.push(model.get('last_ver'));
						jsonMap += '{\'id\':\''
							+ model.get('pay_voucher_id')
							+ '\',\'bankNo\':\''
							+ model.get('payee_account_bank_no')
							+ '\',\'is_onlyreq\':\'' + 1 + '\'},';
					});
					var params={
						billIds : Ext.encode(reqIds),
						last_vers : Ext.encode(reqVers),
						billTypeId : records[0].get('bill_type_id'),
						task_id : '0',
						remark : '普通支付转公务卡',
						jsonMap : jsonMap.substring(0,jsonMap.length - 1) + ']'
					};
					Ext.PageUtil.doRequestAjax(me,'/realware/updatePayVoucher.do',params);
				}
			},

			/*******************************************************************************
			 * 撤销审核
			 */
			voucherUnAudit : function() {
				var me = this;
				//这里是把该功能定义了一个控件调用的时候直接创建控件调用init方法show就完成了控件的显示
				var records = Ext.PageUtil.validSelect(Ext.getCmp(Ext.PageUtil.prefix + Ext.getCmp('taskState').getValue()));
				if (records.length == 0) {
					Ext.Msg.alert("系统提示", "请选中凭证信息！");
					return;
				}
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
				var myMask = new Ext.LoadMask(Ext.getBody(), {
						msg : '后台正在处理中，请稍后....',
						removeMask : true // 完成后移除
				});
				myMask.show();
				Ext.Ajax.request({
						url : '/realware/unAuditPayVoucher.do',
						method : 'POST',
						timeout : 180000, // 设置为3分钟
						params : params,
						//提交成功的回调函数
						success : function(response, options) {
							succAjax(response, myMask);
							refreshData();				
						},
						// 提交失败的回调函数
						failure : function(response, options) {
							failAjax(response, myMask);
							refreshData();
						}
					});
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
			/*******************************************************************************
			 * 刷新
			 * 
			 * @return
			 */
			refreshData : function() {
				this.getStore('pay.PayVouchersHunanBOC').loadPage(1);
				//this.getStore('pay.PayVouchers').load();
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
			backVoucher : function(backUrl,records, idName,opereteName) {

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
						title : '退回下一岗'
					});
					backvoucherwindow.on('confirmclick',function(o,textarea){
						var params = {
							returnRes : textarea,
							billIds : Ext.encode(ids),
							last_vers : Ext.encode(lastVers),
							billTypeId : bill_type_id
						};
						Ext.PageUtil.doRequestAjax(me,backUrl,params);
					});
					backvoucherwindow.show();
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
			
			
					
					