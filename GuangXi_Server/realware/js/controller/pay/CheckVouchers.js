/***
 * 支付凭证初审（行号补录）界面事件处理器
 * @memberOf {TypeName} 
 */
Ext.define('pb.controller.pay.CheckVouchers',{
		extend : 'Ext.app.Controller',
		// 数据集列表：
		// pay.PayVouchers 支付凭证
		// pay.PayeeBankNos 收款行行号
		// pay.BankSetMode 银行结算方式
		stores : [ 'pay.PayVouchers', 'pay.PayeeBankNos','pay.BankSetMode','pay.BankBizTypes','pay.BankTypes','pay.UrgentFlag',"pay.BankSetMode","pay.AbcCityCodes"],
		//对象模型 pay.PayVoucher 支付凭证
		models : [ 'pay.PayVoucher' ],
		//当创建一个控件的时候需要在此引入
		requires : [ 'pb.view.pay.CheckVoucherList','pb.view.pay.PayVoucherQuery','pb.view.pay.BankNoWindow',
				'pb.view.common.ImportFileWindow'],
		//创建后获取当前控件，应用于当前控制层
		refs : [ {
			ref : 'list',  //当前控制层引用
			selector : 'checkVoucherList' // 控件的别名
		}, {
			ref : 'query',
			selector : 'payVoucherQuery'
		}, {
			ref : 'banknoWindow',
			selector : 'banknowindow'
		} ],
		onLaunch: function(){
			//当前控制层
			/*var me = this;
			me.getStore('pay.BankSetMode').on('beforeload',function(thiz, options) {
			options.params = [];
			options.params["admdivCode"] = Ext.getCmp('admdivCode').getValue();
			});*/
		},	
		//事件的定义
		init : function() {
			this.control( {
					//查询区 
					'payVoucherQuery combo[id=taskState]' : {
							//状态选中
							change : function(combo, newValue, oldValue, eOpts) {
								try {
									this.selectState(combo.valueModels[0].raw.status_code);
								} catch(e) {}
							}
					},
		
					//列表区
					'checkVoucherList' : {
							//行号补录方法1（通常）
							'addBankno' : this.addBankno,
							//行号补录方法2 （主要用于湖南农行）
							'addBanknoHuNanABC' : this.addBanknoHuNanABC,
							//行号补录方法3（安徽）
							'addBanknoForAnHui' : this.addBanknoForAnHui,
							//行号补录方法4(广西)
							'addBanknoGuangXiCCB':this.addBanknoGuangXiCCB
					},
					//////////////////////////按钮区///////////////////////////
					//刷新
					'checkVoucherList button[id=refresh]' : {
							click : this.refreshData
							//注 : 当该方法没有参数的时候可以直接这样写
					},
					//预至列表视图
					'checkVoucherList button[id=view1]' : {
							click : function(o) {
								var grid = Ext.getCmp(Ext.getCmp('taskState').getValue());
								Ext.PageUtil.onAddColumns(grid,this.getList().xtype);
							}
					},
					//初审
					'checkVoucherList button[id=audit]' : { 
							click : function() {
								this.checkVoucher(true);
							}
					},
					//初审(湖南个性化)
					'checkVoucherList button[id=haudit]' : { 
							click : function() {
								this.hcheckVoucher(true);
							}
					},
					//公务卡
					'checkVoucherList button[id=official]' : { 
							click : this.updateVoucher
					},
					
					//公务卡(湖南农行个性化)
					'checkVoucherList button[id=hofficial]' : { 
							click : this.hupdateVoucher
					},
					//送审
					'checkVoucherList button[id=submit]' : {
							click : function() {
								this.checkVoucher(false);
							}
					 },
					 //送审
					'checkVoucherList button[id=hsubmit]' : {
							click : function() {
								this.hcheckVoucher(false);
							}
					 },
					//行号导入   
					'checkVoucherList button[id=import]' : { 
							click : function() {
								var me = this;
								//这里是把该功能定义了一个控件调用的时候直接创建控件调用init方法show就完成了控件的显示
								var admdivCode = Ext.getCmp('admdivCode').getValue();
								var importwindow = Ext.create('pb.view.common.ImportFileWindow');
								importwindow.init("/realware/sysBankNo.do",me);
								importwindow.show();
							}
					},
					//退回财政
					'checkVoucherList button[id=back]' : { 
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
										textareaValue : records[0].get("return_reason") ,
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
					//退回财政(湖南个性化)
					'checkVoucherList button[id=hback]' : { 
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
										Ext.PageUtil.doRequestAjax(me,'/realware/returnVoucher.do',params);
									});
									backvoucherwindow.show();
								}
							}
					},
					 //查看凭证   
					'checkVoucherList button[id=look]' : {
							click : this.lookVoucher
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
					},
					
					banknoRow : null, //行号补录操作行
					/**
					 * 行号补录
					 * @param {Object} grid   当前的gridpanel
					 * @param {Object} rowIndex   行索引
					 * @param {Object} colIndex   列索引
					 * @param {Object} node        节点
					 * @param {Object} e     
					 * @param {Object} record      选中的记录
					 * @param {Object} rowEl
					 * @memberOf {TypeName} 
					 * @return {TypeName} 
					 */
					addBanknoGuangXiCCB : function(grid, rowIndex, colIndex, node, e,record, rowEl) {
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
								var bankBizTypes = bankWin.getForm().findField('bankbizType');
								bankWin.curRow.set({
										 'payee_account_bank_no' : rs[0].get('bank_no'), 
										 'payee_account_bank' : rs[0].get('bank_name'),
										 'add_word' : bankWin.getForm().findField('bankRemarkFieldLable').getValue(),
										 'bankbusinesstype' : bankBizTypes.getValue(),
										 'pb_set_mode_name' : bankSetMode.rawValue, 
										 'pb_set_mode_code' : bankSetMode.getValue()
										});
								bankWin.hide();
							});
							
						}
						bankWin.curRow = record;
						bankWin.payeeAccountNo = bankWin.curRow.get('payee_account_no');
//						//判断银行业务类型、查询记录如果没做操作默认选中第一个选项
						var tempBankType = bankWin.curRow.get('bankbusinesstype');
						var form = bankWin.getForm();
						var field = form.findField('bankbizType');
						if (tempBankType == null || tempBankType == '') {
							field.setValue('0');
						} else {
							field.setValue(tempBankType);
						}
						//判断结算方式、查询记录如果没做操作默认选中第一个选项
						var tempModeCode = bankWin.curRow.get('pb_set_mode_code');
						var form = bankWin.getForm();
						var field = form.findField('banksetMode');
						if (tempModeCode == null || tempModeCode == '') {
							field.setValue('1');
						} else {
							field.setValue(tempModeCode);
						}
						form.findField('ori_bankname').setValue(bankWin.curRow.get('ori_payee_account_bank'));
						form.findField('bankRemarkFieldLable').setValue(bankWin.curRow.get('bankRemarkFieldLable'));
						var button = Ext.ComponentQuery.query('button[text="查询"]', bankWin)[0];
						//显示窗口
						bankWin.show();
						//此处使用handler.call，否则由于scope的不同，无法触发“查询”的handler事件，如fireEvent
						button.handler.call(button);
					},
					/**
					 * 行号补录
					 * @param {Object} grid   当前的gridpanel
					 * @param {Object} rowIndex   行索引
					 * @param {Object} colIndex   列索引
					 * @param {Object} node        节点
					 * @param {Object} e     
					 * @param {Object} record      选中的记录
					 * @param {Object} rowEl
					 * @memberOf {TypeName} 
					 * @return {TypeName} 
					 */
					addBanknoForAnHui : function(grid, rowIndex, colIndex, node, e,record, rowEl) {
						var me = this;
						var add_word = record.get('add_word');
                        if (Ext.isEmpty(add_word)) {
                            if (record.get('vt_code') == '5201') {
                                var agency_name = record.get('agency_name');
                                var pay_summary_name = record.get('pay_summary_name');
                                add_word = agency_name + " " + pay_summary_name;
                            }
                            else {
                                var pay_summary_name = record.get('pay_summary_name');
                                add_word = pay_summary_name;
                            }
                        }
						var bankWin = me.getBanknoWindow();
						if(!bankWin) {
							//数据源
							var banknoStore = this.getStore('pay.PayeeBankNos');
							banknoStore.proxy.url ='/realware/anhuiHSBVoucher/loadBanknos.do';
							bankWin = Ext.create('pb.view.pay.BankNoWindow',{
										banknoStore : banknoStore,
										hiddenFuzzy:false
							});
							//设置附言长度为30
							bankWin.getForm().findField('bankRemarkFieldLable').maxLength=30;
							//补录行号确定按钮触发
							bankWin.on('bankNoclick', function(grid){
								var rs = grid.getSelectionModel().getSelection();
								if (rs.length == 0){
									return;
								}
								if(bankWin.getForm().isValid()){
									var bankSetMode = bankWin.getForm().findField('banksetMode');
									bankWin.curRow.set({
									 'payee_account_bank_no' : rs[0].get('bank_no'), 
									 'payee_account_bank' : rs[0].get('bank_name'),
									 'add_word' : bankWin.getForm().findField('bankRemarkFieldLable').getValue(), 			 
									 'pb_set_mode_name' : bankSetMode.rawValue, 
									 'pb_set_mode_code' : bankSetMode.getValue()
									});
									bankWin.hide();
								}
								
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
						form.findField('ori_bankname').setValue(bankWin.curRow.get('ori_payee_account_bank'));
						form.findField('bankRemarkFieldLable').setValue(add_word);
						//查询按钮
						var button = Ext.ComponentQuery.query('button[text="查询"]', bankWin)[0];
						//重新绑定handler
						button.handler = function(){
							var oribankname = form.findField('ori_bankname').getValue();
							var banksetmode = form.findField('banksetMode').getValue();
							var grid = Ext.ComponentQuery.query('gridpanel', bankWin)[0];
							var gridStore = grid.getStore();
							gridStore.proxy.url ='/realware/anhuiHSBVoucher/loadBanknos.do';
							gridStore.load({
								params: {
									bankname: encodeURI(encodeURI(oribankname)),
									banksetmode: banksetmode,
									fields: Ext.encode(["bank_name", "bank_no"])
								},
								callback: function(records, operation, success){
									if (success && records.length > 0) {
										grid.getSelectionModel().select(0);
									}
								}
							});
						}
						//模糊查询按钮
						var fuzzyButton = Ext.ComponentQuery.query('button[text="模糊查询"]', bankWin)[0];
						//重新绑定handler
						fuzzyButton.handler = function(){
							var fuzzyNames = form.findField('fuzzyNames').getValue();
							if(fuzzyNames.replace(/^\s+|\s+$/).length<=0){
								Ext.Msg.alert("系统提示", "请输入查询信息");
       							return;
							}
							var banksetmode = form.findField('banksetMode').getValue();
							var grid = Ext.ComponentQuery.query('gridpanel', bankWin)[0];
							var gridStore = grid.getStore();
							gridStore.proxy.url ='/realware/anhuiHSBVoucher/loadBanknosByFuzzyModel.do';
							gridStore.load({
								params: {
									bankname: encodeURI(encodeURI(fuzzyNames)),
									banksetmode: banksetmode,
									fields: Ext.encode(["bank_name", "bank_no"])
								},
								callback: function(records, operation, success){
									if (success && records.length > 0) {
										grid.getSelectionModel().select(0);
									}
								}
							});
						}
						//显示窗口
						bankWin.show();
						//此处使用handler.call，否则由于scope的不同，无法触发“查询”的handler事件，如fireEvent
						button.handler.call(button);
					},
					/**
					 * 行号补录
					 * @param {Object} grid   当前的gridpanel
					 * @param {Object} rowIndex   行索引
					 * @param {Object} colIndex   列索引
					 * @param {Object} node        节点
					 * @param {Object} e     
					 * @param {Object} record      选中的记录
					 * @param {Object} rowEl
					 * @memberOf {TypeName} 
					 * @return {TypeName} 
					 */
					addBankno : function(grid, rowIndex, colIndex, node, e,record, rowEl) {
						var me = this;
						var bankWin = me.getBanknoWindow();
						if(!bankWin) {
							var banknoStore = this.getStore('pay.PayeeBankNos');
							bankWin = Ext.create('pb.view.pay.BankNoWindow',{
										banknoStore : banknoStore,
										hiddenFuzzy:false //启用模糊查询
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
										 'payee_account_bank' : rs[0].get('bank_name'),
										 'add_word' : bankWin.getForm().findField('bankRemarkFieldLable').getValue(), 
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
						form.findField('ori_bankname').setValue(bankWin.curRow.get('ori_payee_account_bank'));
						form.findField('bankRemarkFieldLable').setValue(bankWin.curRow.get('bankRemarkFieldLable'));
						var button = Ext.ComponentQuery.query('button[text="查询"]', bankWin)[0];
						//显示窗口
						bankWin.show();
						//此处使用handler.call，否则由于scope的不同，无法触发“查询”的handler事件，如fireEvent
						button.handler.call(button);
					},
					/**
					 * 行号补录
					 * @param {Object} grid   当前的gridpanel
					 * @param {Object} rowIndex   行索引
					 * @param {Object} colIndex   列索引
					 * @param {Object} node        节点
					 * @param {Object} e     
					 * @param {Object} record      选中的记录
					 * @param {Object} rowEl
					 * @memberOf {TypeName} 
					 * @return {TypeName} 
					 */
					addBanknoHuNanABC: function(grid, rowIndex, colIndex, node, e,record, rowEl) {
						var me = this;
						var bankWin = me.getBanknoWindow();
						if(!bankWin) {
							var banknoStore = this.getStore('pay.PayeeBankNos');
							bankWin = Ext.create('pb.view.pay.BankNoWindow',{
									payeeAccountNo : record.get('payee_account_no'),
									banknoStore : banknoStore,
									bankSetModeFieldLabel : '转账方式',
									bankSetModeStore : 'pay.BankTypes',
									hiddenFuzzy:false,//启用模糊查询
									hiddenCityCode : false
							});
							
							//补录行号确定按钮触发
							bankWin.on('bankNoclick', function(grid){
								var rs = grid.getSelectionModel().getSelection();
								if (rs.length == 0){
									return;
								}
								var form = bankWin.getForm();
								var bankSetMode = form.findField('banksetMode');
								var cityCode = form.findField('cityCode').getValue();
								bankWin.curRow.set({
										 'payee_account_bank_no' : rs[0].get('bank_no'), 
										 'payee_account_bank' : rs[0].get('bank_name'), 
										 'pb_set_mode_name' : bankSetMode.rawValue, 
										 'pb_set_mode_code' : bankSetMode.getValue(),
										 'add_word' : bankWin.getForm().findField('bankRemarkFieldLable').getValue(), 
										 'city_code' : cityCode
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
						if (tempModeCode == null || tempModeCode == '' || tempModeCode=='同行' || tempModeCode=='1') {
							field.setValue('1');
						} else {
							field.setValue(tempModeCode);
						}
						form.findField('ori_bankname').setValue(bankWin.curRow.get('ori_payee_account_bank'));
						form.findField('cityCode').setValue(record.get('city_code'));
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
								var payeeAcctBank = model.get('payee_account_bank');
								var pbSetModeCode = model.get('pb_set_mode_code');

								var pbSetModeName = null;
								Ext.Array.each(bankstore, function(model) {
									if(model.get('value')==pbSetModeCode){
										pbSetModeName = model.get('name');	
									}
								});
								
								//初审时，银行业务类型
								var pbBusinessTypeValue = model.get('bankbusinesstype');
								
								//验证银行结算方式是否补录
								if(null==pbSetModeCode||''==pbSetModeCode)
								{
									Ext.Msg.alert('系统提示', '凭证：'+ model.get('pay_voucher_code') + '请先补录银行结算方式再进行初审操作！');
									ajaxBool = false;
								}
								if (null == payeeAcctBankno || '' == payeeAcctBankno) {
									Ext.Msg.alert('系统提示', '凭证：'+ model.get('pay_voucher_code') + '请先补录行号再进行初审操作！');
									ajaxBool = false;
								}

								reqIds.push(model.get('pay_voucher_id'));
								reqVers.push(model.get('last_ver'));
								jsonMap += '{\'id\':\''
										+ model.get('pay_voucher_id')
										+ '\',\'bankNo\':\'' + payeeAcctBankno
										+ '\',\'bankName\':\'' + payeeAcctBank
										+ '\',\'add_word\':\'' + model.get('add_word')
										+ '\',\'setModeCode\':\''+ model.get('pb_set_mode_code')
										+ '\',\'setModeName\':\''+ pbSetModeName
										+ '\',\'bankbusinesstype\':\''+ pbBusinessTypeValue
										+ '\'},';
							});
							if (ajaxBool) {
								var params = {
									is_onlyreq : 0,
									billTypeId : records[0].get('bill_type_id'),
									billIds : Ext.encode(reqIds),
									last_vers : Ext.encode(reqVers),
									jsonMap : jsonMap.substring(0,jsonMap.length - 1) + ']',
									isCheck : isReturn
								};
								Ext.PageUtil.doRequestAjax(me,'/realware/checkVoucher.do',params);
							}
						}
					},
					/**
					 * 初审（湖南农行个性化）
					 * @param {Object} isReturn
					 * @memberOf {TypeName} 
					 * @return {TypeName} 
					 */
					hcheckVoucher : function(isReturn) {
						var me = this;
						var ajaxBool = true;
						var bankstore = Ext.getStore('pay.BankSetMode').data.items;
						var records = Ext.PageUtil.validSelect(Ext.getCmp(Ext.PageUtil.prefix + Ext.getCmp('taskState').getValue()));
						var bankBussinessTypeStore = this.getStore('pay.BankBizTypes');
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
							var payeeAcctBankName = model.get('ori_payee_account_bank');
							var payeeAcctNo = model.get('payee_account_no');
							var cityCode = model.get('city_code');
							var pbBusinessTypeValue = model.get('bankbusinesstype');
							if (null == payeeAcctBankno || '' == payeeAcctBankno) {
								Ext.Msg.alert('系统提示', '凭证：' + model.get('pay_voucher_code')+ '请先补录行号再进行初审操作！');
								ajaxBool = false;
							}
							//2015-9-10 11:48:51 sh 当不为15位农行账号时,省市代码置null
							var cityCodeTemp = "";
							if(payeeAcctBankName.indexOf('农行') >= 0 || payeeAcctBankName.indexOf('农业银行') >= 0){
								if(payeeAcctNo.length == 15){
									if ( Ext.isEmpty(cityCode)) {
											Ext.Msg.alert('系统提示', '凭证：' +  model.get('pay_voucher_code')+ '为农行15位收款人账号，请先补录省市代码！');
											ajaxBool = false;
											return false;
									}else{
										cityCodeTemp = cityCode;
									}
								}
//								else if(! Ext.isEmpty(cityCode)&&cityCode != ' '){
//									Ext.Msg.alert('系统提示', '凭证：' +  model.get('pay_voucher_code')+ '不为农行15位收款人账号，请不要补录省市代码！');
//									ajaxBool = false;
//									return;
//								}
							}/*else if(payeeAcctBankno.length != 12){
								Ext.Msg.alert('系统提示', '凭证：' + model.get('pay_voucher_code')+ '行号必须为12位！');
								ajaxBool = false;
							}*/
							reqIds.push(model.get('pay_voucher_id'));
							reqVers.push(model.get('last_ver'));
							jsonMap += '{\'id\':\'' + model.get('pay_voucher_id') 
										+ '\',\'bankNo\':\'' + payeeAcctBankno
										+ '\',\'bankName\':\'' + model.get('payee_account_bank') 
										+'\',\'setModeCode\':\'' +  model.get('pb_set_mode_code') 
										+'\',\'add_word\':\'' + model.get('add_word')
										+'\',\'setModeName\':\'' + pbSetModeName 
										+ '\',\'city_code\':\'' + cityCodeTemp
										+ '\'},';
						});
							if (ajaxBool) {
								var params = {
									is_onlyreq : 0,
									billTypeId : records[0].get('bill_type_id'),
									billIds : Ext.encode(reqIds),
									last_vers : Ext.encode(reqVers),
									jsonMap : jsonMap.substring(0,jsonMap.length - 1) + ']',
									isCheck : isReturn
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
							/**
					 * 公务卡(湖南农行个性化)
					 * @memberOf {TypeName} 
					 * @return {TypeName} 
					 */
					hupdateVoucher : function() {
						var me = this;
						var records = Ext.PageUtil.validSelect(Ext.getCmp(Ext.PageUtil.prefix + Ext.getCmp('taskState').getValue()));
						var ids = null;	
						if(records !=null) {
							Ext.Array.each(records, function(model) {
								ids = ids + model.get('pay_voucher_id') + ',';
							});
							var params={
								ids : ids.substring(0, ids.length - 1),
								objMap : '[{\'is_onlyreq\':1}]',
								remark : '普通支付转公务卡'
							};
							Ext.PageUtil.doRequestAjax(me,'/realware/updatePayVoucher.do', params);
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
						this.getStore('pay.PayVouchers').loadPage(1);
					},	
					/***
					 * 
					 * @param {Object} banknoStore 收款行行号数据集
					 * @param {Object} selectRow  操作选中行
					 * @return {TypeName} 
					 */
					afterLoadBankNoStore : function(banknoStore,selectRow) {
						var me = this;
						 //是否显示行号补录窗口,返回值
						var b = true;
						//收款行行号数据集条件afterload事件
						banknoStore.addEvents('afterload');
						
						banknoStore.load( {
								params : {
									acctno : selectRow.get('payee_account_no'),
									bankname : encodeURI(encodeURI(selectRow.get('payee_account_bank'))),
									fields : Ext.encode([ 'bank_name','bank_no', 'match_ratio','like_ratio' ])
								},
								callback : function(records, operation,success) {
									if (!success) {
										Ext.Msg.show( {
											title : '失败提示',
											msg : '行号检索失败！',
											buttons : Ext.Msg.OK,
											icon : Ext.MessageBox.ERROR
										});
										return;
									}
									//匹配度
//									Ext.Array.each(records,function(model) {
//											if (model.get('match_ratio') == "1" && model.get("like_ratio") == "1") {
//													selectRow.set("payee_account_bank_no",model.get("bank_no"));
//													var smc = selectRow.get("pb_set_mode_code");
//													if (!Ext.isEmpty(smc)) {
//														b = false;
//													}
//													return;
//											}
//									});
//									if(b){
										//触发收款行行号加载后事件
										banknoStore.fireEvent('afterload');
//									}
								}
						});
					}
});
