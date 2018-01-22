/***
 * 支付凭证请款复核转账界面事件处理器
 * @memberOf {TypeName} 
 */
 //将查询区更改为PayVoucherQuery2，stores中增加ForwardStatus modify by cyq 2015/1/7
Ext.define('pb.controller.pay.ForwardVouchers',{
		extend : 'Ext.app.Controller',
		// 数据集列表：
		// pay.PayVouchers 支付凭证
		// pay.PayeeBankNos 收款行行号
		// common.PageStatus  初始化业务界面配置
		// common.TaskLog  操作日志
		// pay.BankSetMode 银行结算方式
		
		stores : [ 'pay.PayVouchers','common.TaskLog','pay.BankSetMode','pay.ForwardStatus','pay.VoucherStatusOfSend'],
		//对象模型 pay.PayVoucher 支付凭证
		models : [ 'pay.PayVoucher' ],
		//当创建一个控件的时候需要在此引入
		requires : [ 'pb.view.pay.InvestiVoucherList','pb.view.pay.PayVoucherQuery2'],
		//创建后获取当前控件，应用于当前控制层
		refs : [ {
			ref : 'list',  //当前控制层引用
			selector : 'forwardVoucherList' // 控件的别名
		}, {
			ref : 'query',
			selector : 'payVoucherQuery2'
		}],
		oneSelect : true,
		//事件的定义
		init : function() {
			this.control( {
					//查询区 
					'payVoucherQuery2 combo[id=taskState]' : {
							//状态选中
							change : function(combo, newValue, oldValue, eOpts) {
								try {
									this.selectState(combo.valueModels[0].raw.status_code);
								} catch(e) {}
							}
					},
					//转账状态下拉框选中事件  modify by cyq 2015/1/8
					'payVoucherQuery2 combo[id=forward_static]' : {
							//状态选中
							select : function(combo, records, eOpts) {
								if(this.oneSelect){
									this.oneSelect = false;
								}
								//只有在未转账状态下，才能转发
								 if(Ext.getCmp('forward_static').getValue()=='2'){
							      Ext.getCmp('back').setDisabled(false);
							      Ext.getCmp('forward').setDisabled(true);
							      Ext.getCmp('accountrecord').setDisabled(true);
					    	   }else{
							      Ext.getCmp('back').setDisabled(true);
							      Ext.getCmp('forward').setDisabled(true);
							      Ext.getCmp('accountrecord').setDisabled(true);
					    	   }
								//刷新，默认当前为第一页
								this.getStore('pay.PayVouchers').loadPage(1);
							}
					},
					'payVoucherQuery2 combo[id=voucher_status]' : {
							//状态选中
							select : function(combo, records, eOpts) {
								if(this.oneSelect){
									this.oneSelect = false;
								}
								var voucher_status=Ext.getCmp('voucher_status').getValue();
								if(voucher_status=='3'){ //签收成功
							     	Ext.getCmp('forward_static').setDisabled(false);
							     	Ext.getCmp('forward_static').setValue('0');
							     	Ext.getCmp('forward').setDisabled(true);
							     	Ext.getCmp('back').setDisabled(true);
							     	Ext.getCmp('forwardagain').setDisabled(true);
					    	   }else if(voucher_status=='5'){ //对方已退回
							     	Ext.getCmp('forward_static').setDisabled(true);
							     	Ext.getCmp('forward_static').setValue('');
							     	Ext.getCmp('back').setDisabled(true);
							     	Ext.getCmp('forward').setDisabled(true);
							     	Ext.getCmp('forwardagain').setDisabled(true);
					    	   }else if(voucher_status=='2'){//接收失败
							     	Ext.getCmp('forward_static').setDisabled(true);
							     	Ext.getCmp('forward_static').setValue('');
							     	Ext.getCmp('forward').setDisabled(true);
							     	Ext.getCmp('forwardagain').setDisabled(false);
							     	Ext.getCmp('back').setDisabled(true);
					    	   }else if(voucher_status=='4'){//签收失败
							     	Ext.getCmp('forward_static').setDisabled(true);
							     	Ext.getCmp('forward_static').setValue('');
							     	Ext.getCmp('forward').setDisabled(true);
							     	Ext.getCmp('forwardagain').setDisabled(false);
							     	Ext.getCmp('back').setDisabled(true);
					    	   }else{//其他状态
					    		   Ext.getCmp('forward_static').setDisabled(true);
							     	Ext.getCmp('forward_static').setValue('');
							     	Ext.getCmp('forward').setDisabled(true);
							     	Ext.getCmp('forwardagain').setDisabled(true);
							     	Ext.getCmp('back').setDisabled(true);
					    	   }
								//刷新，默认当前为第一页
								this.getStore('pay.PayVouchers').loadPage(1);
							}
					},
					//////////////////////////按钮区///////////////////////////
					//刷新
					'investiVoucherList button[id=refresh]' : {
							click : this.refreshData
							//注 : 当该方法没有参数的时候可以直接这样写
					},
					  //账户补录
					'investiVoucherList button[id=accountrecord]' : { 
							click : function() {
								this.accountRecord();
							}
				    },
					  //转发
					 'investiVoucherList button[id=forward]' : { 
							click : function() {
								var me = this;
								var records = Ext.PageUtil.validSelect(Ext.ComponentQuery.query("container > gridpanel")[0]);
								if(records !=null) {
									var ids = [];
									var lastVers = [];
									var bill_type_id = records[0].get("bill_type_id");
									Ext.Array.each(records,function(model) {
										ids.push(model.get('pay_voucher_id'));
										lastVers.push(model.get("last_ver"));
									});
									var params = {
											billIds : Ext.encode(ids),
											last_vers : Ext.encode(lastVers),
											billTypeId : bill_type_id,
											menu_id :  Ext.PageUtil.getMenuId()
										};
									Ext.PageUtil.doRequestAjax(me,'/realware/sendForwardVoucher.do',params);
								}
							}
					 },
					 //再次转发
					 'investiVoucherList button[id=forwardagain]' : { 
							click : function() {
								var me = this;
								var records = Ext.PageUtil.validSelect(Ext.ComponentQuery.query("container > gridpanel")[0]);
								if(records !=null) {
									var ids = [];
									var lastVers = [];
									var bill_type_id = records[0].get("bill_type_id");
									Ext.Array.each(records,function(model) {
										ids.push(model.get('pay_voucher_id'));
										lastVers.push(model.get("last_ver"));
									});
									var params = {
											billIds : Ext.encode(ids),
											last_vers : Ext.encode(lastVers),
											billTypeId : bill_type_id,
											menu_id :  Ext.PageUtil.getMenuId()
										};
									Ext.PageUtil.doRequestAjax(me,'/realware/sendForwardVoucherAgain.do',params);
								}
							}
					 },
					//退回财政
					'investiVoucherList button[id=back]' : { 
							click : function() {
								var me = this;
								var records = Ext.PageUtil.validSelect(Ext.ComponentQuery.query("container > gridpanel")[0]);
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
										Ext.PageUtil.doRequestAjax(me,'/realware/returnVoucherNoWf.do',params);
									});
									backvoucherwindow.show();
								}
							}
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
					      //正常情况下初审界面的已退回
					      Ext.getCmp('back').setDisabled(false);
					      Ext.getCmp('forward').setDisabled(false);
					      Ext.getCmp('forwardagain').setDisabled(true);
					      Ext.getCmp('voucher_status').setValue();
					      Ext.getCmp('accountrecord').setDisabled(false);
					      //将转账状态设置为不可用，值设为空  modify by cyq 2015/1/7
					      Ext.getCmp('forward_static').setDisabled(true);
					      Ext.getCmp('voucher_status').setDisabled(true);
					      Ext.getCmp('forward_static').setValue();
				       } else if ('002' == status_code) { //已退回
					      Ext.getCmp('back').setDisabled(true);
					      Ext.getCmp('forward').setDisabled(true);
					      Ext.getCmp('forwardagain').setDisabled(true);
					      Ext.getCmp('voucher_status').setValue();
					      Ext.getCmp('accountrecord').setDisabled(true);
					      //将转账状态设置为不可用，值设为空  modify by cyq 2015/1/7
					      Ext.getCmp('forward_static').setDisabled(true);
					      Ext.getCmp('voucher_status').setDisabled(true);
					      Ext.getCmp('forward_static').setValue();
				       } else if ('003' == status_code) { //已转发
				    	   //modify  by  cyq 2015/1/7
				    	   Ext.getCmp('forward_static').setDisabled(true);
				    	   Ext.getCmp('voucher_status').setDisabled(false);
				    	   Ext.getCmp('forwardagain').setDisabled(true);
				    	   //设置默认值
				    	   Ext.getCmp('voucher_status').setValue('');
				    	   Ext.getCmp('back').setDisabled(true);
						   Ext.getCmp('forward').setDisabled(true);
						   Ext.getCmp('accountrecord').setDisabled(true);
				       } 
						//刷新，默认当前为第一页
						//this.getStore('pay.PayVouchers').loadPage(1);
					},
					/***
					 * 账户补录
					 */
					accountRecord : function(){
						var me = this;
						var records = Ext.PageUtil.validSelect(Ext.ComponentQuery.query("container > gridpanel")[0]);
						if(records==null)
							return;
						var bankStore = Ext.create('Ext.data.Store', {
							fields : [{
										name : 'id'
									},{
										name : 'code'
									}, {
										name : 'name'
									}],
							proxy : {
								type : 'ajax',
								url : '/realware/loadAllNetwork2.do',
								reader : {
									type : 'json'
								}
							},
							autoLoad : true
						});
						
						Ext.widget('window', {
								title : '网点列表',
								width : 400,
								height : 310,
								layout : 'fit',
								resizable : false,
								modal : true,
								items : [ new Ext.FormPanel({
								id:'Form',
								bodyPadding : 5,
								items : [ {
									layout : 'hbox',
									defaults : {
										margins : '3 10 0 0'
									},
									height : 35,
									items : [{
											id : 'bankcode',
											xtype : 'textfield',
											fieldLabel : '快速查找',
											labelWidth: 70,
											width : 250
											}, {
												text : '查询',
												xtype : 'button',
												handler : function() {
													bankStore.load( {
														params : {
															codeorname : encodeURI(Ext.getCmp('bankcode').getValue())
														}
													});
												    
												}
											}
											]
									},{
											xtype : 'gridpanel',
											id : 'gridBank',
											viewConfig : {
												enableTextSelection : true
												},
											height : 200,
											store : bankStore,
											columns : [{
																text : '网点编码',
																dataIndex : 'code',
																width : '191'
															}, {
																text : '网点名称',
																dataIndex : 'name',
																width : '191.3'
											}],
											listeners : {
												'itemdblclick' : function(view, record, item,
														index, e) {
													bankid = record.get("id");	
													var codeandname=record.get("code")+" "+record.get("name");
													Ext.getCmp('adduser_bank_code').setValue(codeandname);
													this.up('window').close();								
												}
											}
										}],
										buttons : [{
											text : '刷新',
											handler : function() {
												bankStore.load( {
													params : {
													   codeorname :encodeURI(Ext.getCmp('bankcode').getValue())
												    }
												});
											}
										}, {
											text : '确定',
											handler : function() {
												var record =Ext.getCmp('gridBank').getSelectionModel().getSelection();
												if(record.length<1)
													return;
												var myMask = new Ext.LoadMask(Ext.getBody(), {
													msg : '后台正在处理中，请稍后....',
													removeMask : true
												});
												myMask.show();
											    Ext.Ajax.request({
													url : 'addAgencyZeroAccount.do',
											        method: 'POST',
													timeout:180000,  //设置为3分钟
													params : {
														account_name : records[0].get('pay_account_name'), 
														account_no : records[0].get('pay_account_no'),
														is_valid : 1,
														admdiv_code : records[0].get('admdiv_code'),
														agency_code : records[0].get('agency_code'),
														bankid : record[0].get("id")
													},
													// 提交成功的回调函数
													success : function(response, options) {
														Ext.PageUtil.succAjax(response, myMask);
													},
													// 提交失败的回调函数
													failure : function(response, options) {
														Ext.PageUtil.failAjax(response, myMask);
													}
												});
												this.up('window').close();	
											}
										},{
											text : '取消',
											handler : function() {
												this.up('window').close();
											}
										}]
							}) ]
							}).show();	

					},
					/**
					 * 刷新
					 * @memberOf {TypeName} 
					 */
					refreshData : function() {
						this.getStore('pay.PayVouchers').loadPage(1);
					},
					onLaunch: function() {
						this.getStore('pay.PayVouchers').on('load',function(thiz, records, successful, eOpts) {
							if(successful){
								Ext.Array.each(records,function(m){
									if(m.get('voucher_status_des').indexOf('财政') < 0){
										return;									
									}
									m.set('voucher_status_des',m.get('voucher_status'));
								});
							}
						})
					}
});
