/***
 * 账户事件处理器
 * @memberOf {TypeName} 
 */
Ext.define('pb.controller.common.Accounts',{
		extend : 'Ext.app.Controller',
		// 数据集列表：
		// pay.PayVouchers 支付凭证
		// pay.PayeeBankNos 收款行行号
		// common.PageStatus  初始化业务界面配置
		// common.TaskLog  操作日志
		// pay.BankSetMode 银行结算方式
		stores : [ 'common.Accounts','common.Banks','common.ElementValuesStore','common.AgentAccountTypes'],
		//对象模型 pay.PayVoucher 支付凭证
		models : [ 'common.Account' ],
		//当创建一个控件的时候需要在此引入
		requires : [ 'pb.view.common.AccountList','pb.view.common.AccountQuery','pb.view.common.BalTransWindow','pb.view.common.EditAccountWin','pb.view.common.ChoseBankWin'
				,'pb.view.common.ImportFileWindow'],
		//创建后获取当前控件，应用于当前控制层
		refs : [ {
			ref : 'list',  //当前控制层引用
			selector : 'accountList' // 控件的别名
		}, {
			ref : 'query',
			selector : 'accountQuery'
		}, {
			ref : 'balTransWin',
			selector : 'balTransWindow'
		}, {
			ref : 'editaccountWin',
			selector : 'editAccountWin'
		}, {
			ref : 'cBankWin',
			selector : 'choseBankWin'
		}],		
		
		bankid : '' ,
		//事件的定义
		init : function() {
				this.control( {
					//列表区
					'accountList' : {
							//初始化配置
							beforerender : this.onPageRender
					},
					//查询区 
					'accountQuery combo[id=admdivCode]' : {
							//财政切换
							select : this.onLaunch
					},
					////////////////////////END///////////////////////
					
					
					//////////////////////////按钮区///////////////////////////
					//刷新
					'accountList button[id=refresh]' : {
							click : this.refreshData
					 },
					
					//新增
					'accountList button[id=addBtn]' : {
							click : function(){
						 		var me = this;
								var window = Ext.create('pb.view.common.EditAccountWin',{
									isEdit : false
								});
//								window.setValue(account_type_code);
								window.show();
								Ext.ComponentQuery.query('button[id=accountSave]',window)[0].on('click',function(){
									var form = window.getForm();
									//表单校验
									if (form.isValid()) {
										var atc=account_type_code==31? form.findField('AccountTypeCode').getValue() : account_type_code;
										
										var ispbc=form.findField('IsPbc').getValue();
										var issamebank=form.findField('isSamebank').getValue();
										if( ispbc ==true && issamebank==true )	{
											Ext.Msg.alert("系统提示", "同行账户与人行账户不能同时选中！");
											return;
										}
										//提交
										form.submit( {
												url : '/realware/saveAccount.do',
												method : 'POST',
												timeout : 60000,
												waitTitle : '提示',
												params : {
//													bankid : bankid==undefined ? null : bankid,
													isedit : window.isEdit,
													ispbc : ispbc==true ? 1: 0,
													issamebank : issamebank==true ? 1: 0,
													accountType : atc
												},
												waitMsg : '后台正在处理中，请您耐心等候...',
												success : function(form, action) {
													Ext.PageUtil.succForm(form, action);
													me.refreshData();
													window.close();
												},
												failure : function(form, action) {
													Ext.Msg.show( {
														title : '失败提示',
														msg : action.response.responseText,
														buttons : Ext.Msg.OK,
														icon : Ext.MessageBox.ERROR
													});
												}
										});
									}
								});
								
							}						
					 },
					
					//修改
					'accountList button[id=editBtn]' : {
							click : function(){
						 		var me = this;
						 		var grid=Ext.ComponentQuery.query('gridpanel',this.getList())[0];
						 		var records = grid.getSelectionModel().getSelection();
								if(records.length!=1){
									Ext.Msg.alert("系统提示", "请选择一条数据！");
									return;
								}
								var window = Ext.create('pb.view.common.EditAccountWin',{
									isEdit : true
								});
//								window.setValue(account_type_code);
								window.setItemsValue(records[0]);
								window.show();
								Ext.ComponentQuery.query('button[id=accountSave]',window)[0].on('click',function(){
									var form = window.getForm();
									//表单校验
									if (form.isValid()) {
										var atc=account_type_code==31? form.findField('AccountTypeCode').getValue() : account_type_code;
										
										var ispbc=form.findField('IsPbc').getValue();
										var issamebank=form.findField('isSamebank').getValue();
										if( ispbc ==true && issamebank==true )	{
											Ext.Msg.alert("系统提示", "同行账户与人行账户不能同时选中！");
											return;
										}
										//提交
										form.submit( {
												url : '/realware/saveAccount.do',
												method : 'POST',
												timeout : 60000,
												waitTitle : '提示',
												params : {
//													bankid : bankid==undefined ? null : bankid,
													isedit : window.isEdit,
													ispbc : ispbc==true ? 1: 0,
													issamebank : issamebank==true ? 1: 0,
													accountType : atc,
													/**
													 * 账号在编辑窗口被设置为disabled，则无法传递值，后台查询时会查询空值(null)
													 * 造成校验不正常，传递AccountNo用于校验重复
													 * lfj 2015-09-22
													 */
													AccountNo : form.findField('AccountNo').getValue()
												},
												waitMsg : '后台正在处理中，请您耐心等候...',
												success : function(form, action) {
													Ext.Msg.alert('系统提示', '修改成功！');
													form.reset();
													me.refreshData();
													window.close();
												},
												failure : function(form, action) {
													Ext.Msg.show( {
														title : '失败提示',
														msg : action.response.responseText,
														buttons : Ext.Msg.OK,
														icon : Ext.MessageBox.ERROR
													});
												}
										});
									}
								});
								
							}			
					 },
					
					//删除
					'accountList button[id=deleteBtn]' : {
							click : function(){
						 		var me=this;
						 		var grid=Ext.ComponentQuery.query('gridpanel',this.getList())[0];
						 		var records = grid.getSelectionModel().getSelection();
								if(records.length==0){
									Ext.Msg.alert("系统提示", "必须选中，才能进行删除！");
									return;
								}
								var selIds = "";
								for (var i = 0; i < records.length; i++) {
									selIds += records[i].get("account_id");
									if (i < records.length - 1){
										selIds += ",";
									}
			
								}
								var myMask = new Ext.LoadMask(Ext.getBody(), {
									msg : '后台正在处理中，请稍后....',
									removeMask : true
								});
								Ext.Msg.confirm("系统提示","确定要删除选中的账户信息？",function(e) {
									if (e == "yes") {
										myMask.show();
										Ext.Ajax.request({
											url : '/realware/deleteAccountById.do',
											method : 'POST',
											params : {
												selIds :  selIds
											},
											timeout : 60000, 
											success : function(response, options) {
												Ext.PageUtil.succAjax(response, myMask);									
												me.refreshData();
											},
											failure : function(response, options) {
												Ext.PageUtil.succAjax(response, myMask);												
											}
										});
									}
								});
							}
					 },
					
					//导入
					'accountList button[id=inputBtn]' : {
							click : function(){
						 		var me = this;
								var importwindow = Ext.create('pb.view.common.ImportFileWindow');
								importwindow.init("/realware/",me);
								importwindow.show();
							}
					 },
					 
					 //转账
					'accountList button[id=trans]' : {						 
							click : function(){
								var me = this;	
//								console.log(me);							
								var records = Ext.PageUtil.validSelect(Ext.ComponentQuery.query('gridpanel', me.getList())[0]);
								
								var gzStroe = Ext.create('Ext.data.Store', {
									fields : [{
												account_no : 'account_no'
											}],
									proxy : {
										extraParams : {
											admdiv_code : records[0].data['admdiv_code'],
											accountType : 7,
											fields : JSON.stringify(["account_no"])
										},
										type : 'ajax',
										url : '/realware/loadAccount.do',
										reader : {
											type : 'json'
										},
									autoload : true
									}
								});
								
								var transWin = me.getBalTransWin();
								if(records.length !=1) {
									Ext.Msg.alert("系统提示", "请选择一条数据！");
									return;
								}
								if(transWin==undefined){
									//创建
									transWin = Ext.create('pb.view.BalTransWindow',{
									       zeroAccount : records[0].get('account_no')
									});
								}
								
								transWin.show();
							}
					 },
					 
					 //查询余额
					'accountList button[id=queryBalanceBtn]' : {
							click : this.queryBalance
					 },
					 
					 'editAccountWin button[id=qbank]' : {
							click : this.queryBank
					 },
					 
					 'editAccountWin combo[id=admdivCode]' : {
							//财政切换
							select : function() {
						 			Ext.getCmp("fund_type_code").getStore().removeAll();
									//指定数据集清空
//									this.getStore('common.ElementValuesStore').removeAll();
									this.getStore('common.ElementValuesStore').load();
							}
					 },
					 
					 //关闭菜单栏目
					'editAccountWin button[id=accountCancel]':{
							click : function(){
								this.getEditaccountWin().close();
							}
					 }
					 
					////////////////////////END///////////////////////
				})
			},
			/////////////////////被调用的方法/////////////////////////
			
			/**
			 * 查找网点
			 * @memberOf {TypeName} 
			 */
			queryBank : function(o,grid){
				var me = this;
				var choseBankWin = me.getCBankWin();
				if(choseBankWin==undefined){
					choseBankWin = Ext.create('pb.view.common.ChoseBankWin',{ 
						bankStore : this.getStore('common.Banks')
					});
				}
				choseBankWin.show();
				choseBankWin.on('chosebankclick',function(banksGrid){
					var records=banksGrid.getSelectionModel().getSelection();
					if (records.length < 1)
						return;
					bankid= records[0].get("id");
					var codeandname = records[0].get("code") + records[0].get("name");
					Ext.getCmp("bank_chose").setValue(codeandname);
				});
				
				choseBankWin.on('itemdblclick',function(view, record, item,	index, e){
					bankid= record.get("id");
					var codeandname = record.get("code") + record.get("name");
					Ext.getCmp("bank_chose").setValue(codeandname);
				});
			},
			
			/**
			 * 查询余额
			 * @memberOf {TypeName} 
			 */
			queryBalance : function(){
				
			},
			
			/**
			 * 刷新
			 * @memberOf {TypeName} 
			 */
			refreshData : function() {
				this.getStore('common.Accounts').loadPage(1);
			},
			
			/***
			 * 界面绘制
			 * @memberOf {TypeName} 
			 */
			
			onPageRender : function() {
				var me =this;
				var panel = Ext.ComponentQuery.query('viewport > panel')[0];
				var account = this.getStore('common.Accounts');
				var gridpanel = new Ext.grid.Panel( {
						title : panel.UItitle,
						frame : false,
						bbar : Ext.PageUtil.pagingTool(account),
						columns : panel.getCols(account_type_code),
						selModel : Ext.create('Ext.selection.CheckboxModel',{  //多选
							checkOnly :true 
						}), 
						store : account
						});
				gridpanel.getStore().pageSize = 100;
				panel.add(gridpanel);
				
				this.getList().setBtnVis(account_type_code);

			},
			
			onLaunch : function() {
				//console.log('onLauch');
				var me = this;
				
				var ftc=Ext.ComponentQuery.query('combo[id=fundTypeCode]', me.getQuery())[0];
				var admdiv=Ext.ComponentQuery.query('combo[id=admdivCode]', me.getQuery())[0].getValue();
				
				ftc.getStore().load({
					params : {
						admdiv_code :  admdiv,
						ele_code : 'FUND_TYPE'
					}
				});				
				
				var account = this.getModel('common.Account');
				var query = this.getQuery();				
				var acstore = this.getStore('common.Accounts');
				acstore.on('beforeload', function(thiz, options) {
						me.checkIsHost();
						var admdiv = Ext.getCmp('admdivCode').getValue();
						if (admdiv == null || admdiv == "")
							return;
						Ext.ComUtil.beforeload(query, options, account);
						options.params["accountType"] = account_type_code;
						options.params["menu_id"] = Ext.PageUtil.getMenuId();
					});
				//刷新数据前事件
				acstore.load();
				
			},			
			
			checkIsHost : function() {
					Ext.Ajax.request( {
						url : '/realware/isHost.do',
						method : 'GET',
						success : function(response, options) {
							isHost = response.responseText;
							//如果不是主办网点，则不提供网点过滤
//							if ('false' == isHost)
//								Ext.getCmp("agencyBank_code").hide();
						},
						failure : function() {
							Ext.Msg.alert('警告', '初始化异常，请重新加载！');
						}
					})
			}
			
});
