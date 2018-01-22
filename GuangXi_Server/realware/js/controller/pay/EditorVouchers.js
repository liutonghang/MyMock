/***
 * 代编授权支付凭证录入界面事件处理器
 * @memberOf {TypeName} 
 */
Ext.define('pb.controller.pay.EditorVouchers',{
		extend : 'Ext.app.Controller',
		stores : [ 'pay.PayVouchers', 'common.TaskLog','pay.BankSetMode'],
		models : [ 'pay.PayVoucher','pay.PlanDetail' ],
		requires : [ 'pb.view.pay.EditorInputVoucherList','pb.view.pay.EditorInputVoucherWindow','pb.view.pay.EditorInputVoucherWindow2'],
		refs : [ {
			ref : 'list',  
			selector : 'editorVoucherList' 
		}, {
			ref : 'query',
			selector : 'payVoucherQuery'
		}, {
			ref : 'window',
			selector : 'editorVoucherInputWindow'
		}, {ref : 'window2',
			selector : 'editorVoucherInputWindow2'
		} ],
		oneSelect : true,
		//事件的定义
		init : function() {
			this.control( {
					//查询区 
					'editorVoucherList combo[id=taskState]' : {
							//状态选中
							change : function(combo, newValue, oldValue, eOpts) {
								try {
									this.selectState(combo.valueModels[0].raw.status_code);
								} catch(e) {}
							}
					},
					//////////////////////////按钮区///////////////////////////
					//录入
					'editorVoucherList button[id=input]' : {
							click : this.inputVoucher
					},
					'editorVoucherList button[id=inputForTS]' : {
							click : this.inputVoucherForTS
					},
					'editorVoucherList button[id=requestAgain]' : {
							click : this.requestPay
					},
					//查看操作日志 
					'editorVoucherList button[id=log]' : { 
							click : this.lookLog
					},
					//刷新
					'editorVoucherList button[id=refresh]' : {
							click : this.refreshData
					},
					//预至列表视图
					'editorVoucherList button[id=view1]' : {
							click : function(o) {
								var grid = Ext.getCmp(Ext.getCmp('taskState').getValue());
								Ext.PageUtil.onAddColumns(grid,this.getList().xtype);
							}
					},
					//获取付款人信息
					'editorVoucherInputWindow button[id=queryAcctBtn]' : {
						click : function(o){
							this.queryPlanDetail(1);
						}
					},
					//请求支付，先保存入库再请求    录入窗体请求支付
					'editorVoucherInputWindow button[id=requestPayBtn]' : {
						click : function(o){
							this.saveAndRequestPay(1);
						}
						
					},
					//获取付款人信息
					'editorVoucherInputWindow2 button[id=queryAcctBtn]' : {
						click : function(o){
							this.queryPlanDetail(2);
						}
					},
					//请求支付，先保存入库再请求    录入窗体请求支付
					'editorVoucherInputWindow2 button[id=requestPayBtn]' : {
						click : function(o){
							this.saveAndRequestPay(2);
						}
					},
					/** 作废*/
					'editorVoucherList button[id=invalid]' :{
						click : this.invalid
					},
					/** 送审*/
					'editorVoucherList button[id=submit]' :{
						click : this.submit
					}
					,
					/** 送审*/
					'editorVoucherList button[id=pay]' :{
						click : this.cashPay
					}
					,
					/** 送审*/
					'editorVoucherList button[id=unsubmit]' :{
						click : this.unsubmit
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
						if ('001' == status_code) { //未反馈
							Ext.StatusUtil.batchEnable("input,requestAgain,inputForTS");
							Ext.StatusUtil.batchDisable("submit,invalid");
						} else if ('002' == status_code) { //人工质疑
							Ext.StatusUtil.batchDisable("requestAgain,input,inputForTS,submit,invalid");
						} else if ('003' == status_code) { //已送审
							Ext.StatusUtil.batchDisable("input,requestAgain,submit,invalid");
						} else if('004' == status_code){  //财政退回
							Ext.StatusUtil.batchDisable("input,requestAgain,submit,invalid");
						} else if ('005' == status_code) { //已确认未送审
							Ext.StatusUtil.batchEnable("invalid,submit");
							Ext.StatusUtil.batchDisable("input,inputForTS,requestAgain");
						}else if('007' == status_code){   //已作废
							Ext.StatusUtil.batchDisable("input,inputForTS,submit,invalid,requestAgain");
						}else if('008' == status_code){   //复核退回
							Ext.StatusUtil.batchEnable("invalid");
							Ext.StatusUtil.batchDisable("input,inputForTS,submit,requestAgain");
						}else{
							Ext.StatusUtil.batchDisable("requestAgain,input,inputForTS,submit,invalid");
						} 
						
						if('111' == status_code){
							Ext.StatusUtil.batchEnable("pay,unsubmit");
						}else{
							Ext.StatusUtil.batchDisable("pay,unsubmit");
						}
					},
					/***
					 * 录入
					 */
					inputVoucher : function(){
						Ext.create('pb.view.pay.EditorInputVoucherWindow').show();
					},
					
					inputVoucherForTS : function(){
						Ext.create('pb.view.pay.EditorInputVoucherWindow2').show();
					},
					/***
					 * 查询计划额度
					 * @memberOf {TypeName} 
					 * @return {TypeName} 
					 */
					queryPlanDetail : function(winNum){
						var w;
						if (winNum==2){
							w = this.getWindow2();
						}else{
							w = this.getWindow();
						}
						var form = Ext.ComponentQuery.query('form',w)[0];
						if(form.isValid()){
							var where ={};
						 
					 		Ext.Array.each(form.items.items,function(item){
								
					 			if(item.eleCode == 'FUND_TYPE'){
									where.fund_type_code = item.rawValue.code;
								}else if(item.eleCode == 'DEP_PRO'){
									where.dep_pro_code = item.rawValue.code;
								}
							}); 
							
							
							var pay_account_code = form.getForm().findField('pay_account_code').getValue();
							if(!Ext.isEmpty(pay_account_code)){
								where.pay_account_code=pay_account_code;		
							}
							var planDetail = this.getModel('pay.PlanDetail');
							var filedNames = [];
							Ext.Array.each(planDetail.getFields(), function(field) {
								filedNames.push(field.name);
							});
							where.admdiv_code = Ext.getCmp('admdivCode').getValue();
							form.getForm().submit({
								url: '/realware/loadPlanBalanceForHB.do',
								params : {
									whereObj : Ext.encode(where),
									filedNames : Ext.encode(filedNames),
									admdivCode:Ext.getCmp('admdivCode').getValue()
								},
								success: function(form, action) {
									var obj = action.result.root;
									if (obj == null) {
										Ext.Msg.alert('系统提示', '根据当前条件没有查询到信息！');
										return;
									}
									var p_record = new pb.model.pay.PlanDetail(Ext.decode(obj));
									p_record.set('plan_amount','');	
									var form_ = Ext.ComponentQuery.query('form',w)[1];
									form_.getForm().loadRecord(p_record);
									w.setBalance(obj);
									var treeObj = Ext.decode(obj);
									var form_a = Ext.ComponentQuery.query('form',w)[0];
									
									form_a.getForm().findField('AGENCY').setValue(treeObj.agency_code+treeObj.agency_name);
									form_a.getForm().findField('EXP_FUNC').setValue(treeObj.exp_func_code+treeObj.exp_func_name);
									form_a.getForm().findField('EXP_ECO').setValue(treeObj.exp_eco_code+treeObj.exp_eco_name);
									Ext.getCmp("exp_eco_code1").focus();
			
								},
								failure: function(form, action) {								
									Ext.PageUtil.failForm(form, action);
								}
							});
						}
					},
					/***
					 * 请求支付
					 */
					saveAndRequestPay : function (winNum){
						var me = this;
						var w;
						if (winNum==2){
							w = this.getWindow2();
						}else{
							w = this.getWindow();
						}
						var form = Ext.ComponentQuery.query('form',w)[1];
						if(form.isValid()){
							var amount = form.getForm().findField('plan_amount').getValue();
							if (amount == 0) {
								Ext.Msg.alert("系统提示", "支付金额不能为0");
								return;
							}
							var bankno = form.getForm().findField('payee_account_bank_no').getValue();							
							var pbSetModeCode ;
							var pbSetModeName;
							var payeeBankName;
							var bankstore = Ext.getStore('pay.BankSetMode').data.items;
							
							
							if(Ext.isEmpty(form.getForm().findField('modeName').getValue())){
								Ext.Msg.alert("系统提示", "转账类型必填");
								return;
							}else{
								pbSetModeCode = form.getForm().findField('modeName').getValue();
								Ext.Array.each(bankstore, function(model) {
									if(model.get('value')==pbSetModeCode){
										pbSetModeName = model.get('name');	
									}
								});
							}
							
							if (pbSetModeName.indexOf('跨行') !=-1
								&& Ext.isEmpty(bankno)) {
								Ext.Msg.alert("系统提示", "跨行转账,收款行行号不能为空！");
								return;
							}

							// 加急标识
					 		var isExpedited = form.getForm().findField('is_expedited').getRawValue();
					 		if (isExpedited =='HVPS大额支付'){
					 			isExpedited =4;
					 		}
					 		if(isExpedited =='BEPS小额支付'){
					 			isExpedited =3;
					 		}
							var params = {};
							Ext.Array.each(form.items.items, function(item,index) {
								//结算方式
								if (item.eleCode == 'SET_MODE') {
									params.set_mode_id =  item.rawValue.id;
									params.set_mode_code = item.rawValue.code;
									params.set_mode_name = item.rawValue.name;
								// 用途
								}else if(item.eleCode == 'PAY_SUMMARY'){
									if(!Ext.isEmpty(item.rawValue)){
										params.pay_summary_id =   item.rawValue.id;
										params.pay_summary_code = item.rawValue.code;
										params.pay_summary_name = item.rawValue.name;
									}
								}
							 	//收款银行名称
								if (item.eleCode == 'PAYEE_BANK') {
									var txtField = Ext.ComponentQuery.query('textfield', item.ownerCt)[index];
									params.payee_account_bank =  txtField.getRawValue() ;
									payeeBankName=txtField.getRawValue();
								}	 
							});
							// 支付类型
							var payMgr = form.getForm().findField('pay_mgr');
							if(!Ext.isEmpty(payMgr.getValue())){
								params.pay_mgr_code = payMgr.getValue();
								params.pay_mgr_name = payMgr.rawValue;
							}
							//所属区划
							params.admdiv_code = Ext.getCmp('admdivCode').getValue();
							
							//转账类型
							params.pbSetModeCode=pbSetModeCode;
							params.pbSetModeName=pbSetModeName;
							var checkNo;
							if(params.set_mode_name.indexOf("现金")!=-1){
								if(Ext.isEmpty(form.getForm().findField('payee_account_code').getValue())||Ext.isEmpty(form.getForm().findField('payee_account_name').getValue())||Ext.isEmpty(payeeBankName)){
									Ext.Msg.alert("系统提示", "收款人未填写完全");
									return;
								}else if(Ext.isEmpty(form.getForm().findField('payee_account_code1').getValue())==false&&(form.getForm().findField('payee_account_code').getValue()!=form.getForm().findField('payee_account_code1').getValue())){
									Ext.Msg.alert("系统提示", "两次输入账号不一致");
									return;
								}
								
							}
							if(params.set_mode_name=="转账支票" || params.set_mode_name=="转账" || params.set_mode_name=="电汇"){
								checkNo = form.getForm().findField('checkno').getValue();
								if(Ext.isEmpty(checkNo)){
									Ext.Msg.alert("系统提示", "转账支票票号不可为空");
									return;
								}
							}
							params.checkNo=form.getForm().findField('checkno').getValue();
							params.payeeBankNo=bankno;
							Ext.ComponentQuery.query('button[id=requestPayBtn]',w)[0].setDisabled(true);
							//计划明细
							params.planDetail = w.balance;
					
							params.exp_eco_name1 = form.getForm().findField('exp_eco_name1').getValue();
							params.exp_eco_code1 = form.getForm().findField('exp_eco_code1').getValue();
							params.exp_eco_name2 = form.getForm().findField('exp_eco_name2').getValue();
							params.exp_eco_code2 = form.getForm().findField('exp_eco_code2').getValue();
							if(form.getForm().findField('voucherType')!=undefined){
								params.voucherType =  form.getForm().findField('voucherType').getValue();
							}
							
							form.getForm().submit({
								url: '/realware/saveAndRequestPay.do',
								params : params,
								success: function(form, action) {
										Ext.Msg.show( {
											title : '系统提示',
											msg : action.result.message,
											buttons : Ext.Msg.OK,
											icon : Ext.MessageBox.INFO
										});
										w.close();
										me.refreshData();
								},
								failure: function(form, action) {
									Ext.Msg.show( {
										title : '失败提示',
										msg : action.response.responseText,
										buttons : Ext.Msg.OK,
										icon : Ext.MessageBox.ERROR
									});
									w.close();
									me.refreshData();
								}
							}
							);
						}
					},
					/***
					 * 请求支付
					 */
					requestPay : function(){
						var me = this;
						var params  ;
						var records = Ext.PageUtil.validSelect(Ext.getCmp(Ext.PageUtil.prefix + Ext.getCmp('taskState').getValue()),1);
						var reqUrl = '/realware/requestPay.do';
						
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
					 	Ext.PageUtil.doRequestAjax(me,reqUrl,params);

					},
					/***
					 * 查看操作日志
					 * @memberOf {TypeName} 
					 */
					lookLog:function(){
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
					 * 刷新
					 * @memberOf {TypeName} 
					 */
					refreshData : function() {
						this.getStore('pay.PayVouchers').loadPage(1);
					},
					
					/**作废*/
					invalid : function(){
						var me = this;
						var records = Ext.PageUtil.validSelect(Ext.getCmp(Ext.PageUtil.prefix + Ext.getCmp('taskState').getValue()),1);
						if(records !=null) {
							var backvoucherwindow = Ext.create('pb.view.common.TextareaWindow',{
								title : '作废原因',
								textareaValue:records[0].get('return_reason')
							});
							backvoucherwindow.on('confirmclick',function(o,textarea){
								var reqIds = []; // 凭证主键字符串
								var reqVers = []; // 凭证lastVer字符串
								Ext.Array.each(records, function(model) {
									reqIds.push(model.get('pay_voucher_id'));
									reqVers.push(model.get('last_ver'));
								});
								var params = {
									invalidRes : textarea,
									billTypeId : records[0].get('bill_type_id'),
									billIds : Ext.encode(reqIds),
									last_vers : Ext.encode(reqVers),
									menu_id :  Ext.PageUtil.getMenuId()
								};
							 	Ext.PageUtil.doRequestAjax(me,'/realware/invalidateNoPayment.do',params);
				            });
							backvoucherwindow.show();
						}
					}
					,
					/**
					 * 送审
					 * @param {Object} isReturn
					 * @memberOf {TypeName} 
					 * @return {TypeName} 
					 */
					submit : function() {
						var me = this;
						var records = Ext.PageUtil.validSelect(Ext.getCmp(Ext.PageUtil.prefix + Ext.getCmp('taskState').getValue()));

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
					 	Ext.PageUtil.doRequestAjax(me,'/realware/submitForHB.do',params);
					}
					,
					/**
					 * 撤销送审
					 * @param {Object} isReturn
					 * @memberOf {TypeName} 
					 * @return {TypeName} 
					 */
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
								Ext.PageUtil.doRequestAjax(me,'/realware/unsubmitVoucher.do',params);
							});
							backvoucherwindow.show();
						}
					},
					/**
					 * 转账支付
					 * @param {Object} isReturn
					 * @memberOf {TypeName} 
					 * @return {TypeName} 
					 */
					cashPay : function() {
						var me = this;
						var records = Ext.PageUtil.validSelect(Ext.getCmp(Ext.PageUtil.prefix + Ext.getCmp('taskState').getValue()));

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
					 	Ext.PageUtil.doRequestAjax(me,'/realware/cashPayForHB.do',params);
					}
					
});
