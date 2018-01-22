/***
 * 支付凭证只请款事件处理器
 * @memberOf {TypeName} 
 */
var pbPayUpperLimittore =null;
//自定义 数字数组 排序函数
function sortNumber(a, b){
	return a - b;
}
Ext.define('pb.controller.pay.RequestPayouts',{
		extend : 'Ext.app.Controller',
		// 数据集列表：
		// pay.PayVouchers 支付凭证
		// pay.PayeeBankNos 收款行行号
		// common.PageStatus  初始化业务界面配置
		// common.TaskLog  操作日志
		// pay.BankSetMode 银行结算方式
		stores : [ 'pay.PayVouchers','pay.BankSetMode'],
		//对象模型 pay.PayVoucher 支付凭证
		models : [ 'pay.PayVoucher' ],
		//当创建一个控件的时候需要在此引入
		requires : [ 'pb.view.pay.RequestPayoutList','pb.view.pay.PayVoucherQuery'],
		//创建后获取当前控件，应用于当前控制层
		refs : [ {
				ref : 'list',  //当前控制层引用
				selector : 'requestPayoutList' // 控件的别名
			},{
				ref : 'query', //当前控制层引用
				selector : 'payVoucherQuery' // 控件的别名
		} ],
		oneSelect : true,
		//事件的定义
		init : function() {
			pbPayUpperLimittore = this.getStore('common.PbPayUpperLimit').load();
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
					//////////////////////////按钮区///////////////////////////
					//刷新
					'requestPayoutList button[id=refresh]' : {
							click : this.refreshData
							//注 : 当该方法没有参数的时候可以直接这样写
					},
					 //请款申请
					'requestPayoutList button[id=payment]' : { 
							click : this.batchReqMoney
					 },
					 //再次请款
					 'requestPayoutList button[id=repeatMoney]' : { 
							click : this.batchRepeatReqMoney
					 },
					//请款申请(二次授权)
					'requestPayoutList button[id=payment_auth]' : { 
							click : function() {
								 this.transBeforeAuthorize('payment');
							 }
						
					 },
					 //再次请款(二次授权)
					 'requestPayoutList button[id=repeatMoney_auth]' : { 
							click : function() {
								 this.transBeforeAuthorize('repeatMoney');
							}
					 },
					 //退回上岗
					 'requestPayoutList button[id=unsubmit]' : { 
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
							}
					},
					//冲销凭证
					'requestPayoutList button[id=writeoff]' : { 
							click : this.writeoffPayVoucher
					},
					//退回财政
					'requestPayoutList button[id=back]' : { 
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
					'requestPayoutList button[id=look]' : {
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
					 	if ('001' == status_code) { //未请款
					 		Ext.StatusUtil.batchEnable("payment,payment_auth,look,log,back,refresh");
							Ext.StatusUtil.batchDisable("repeatMoney,repeatMoney_auth,writeoff");
						} else if ('002' == status_code) { //已请款
							Ext.StatusUtil.batchEnable("writeoff,look,log,refresh");
							Ext.StatusUtil.batchDisable("back,repeatMoney,repeatMoney_auth,payment,payment_auth");
						} else if ('003' == status_code) { //请款失败
							Ext.StatusUtil.batchEnable("repeatMoney,repeatMoney_auth,look,log,refresh,back");
							Ext.StatusUtil.batchDisable("payment,writeoff");
						}else if ('004' == status_code) { //请款超时(海南请款界面与支付界面分开)
							Ext.StatusUtil.batchEnable("repeatMoney,look,log,refresh");
							Ext.StatusUtil.batchDisable("payment,writeoff,payment_auth,back,writeoff");
						} else if ('005' == status_code) { //退回财政
							Ext.StatusUtil.batchEnable("look,log,refresh");
							Ext.StatusUtil.batchDisable("payment,payment_auth,back,writeoff,repeatMoney,repeatMoney_auth");
						}
					},
					/**
					 * 根据不同的状态选择不同的gridpanel
					 * @param {Object} listView
					 */
					selectGridPanel : function(listView) {
						var value = Ext.getCmp('taskState').getValue();
						for ( var i = 0; i < listView.items.length; i++) {
							var panel = listView.items.getAt(i);
							if(panel.id = value){
								//设置每个状态下每页的显示数
								panel.getStore().pageSize = panel.pageSize;
							}else{
								panel.setVisible(false);
							}
						}
					},
					/**
					 * 请款申请
					 * @memberOf {TypeName} 
					 * @return {TypeName} 
					 */
					batchReqMoney : function() {
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
							var myMask = new Ext.LoadMask(Ext.getBody(), {
								msg : '后台正在处理中，请稍后....',
								removeMask : true
							});
							myMask.show();
							Ext.Ajax.request( {
								url : '/realware/batchReqPayout.do',
								method : 'POST',
								timeout : 180000, // 设置为3分钟
								params : {
									// 单据类型id
									billTypeId : bill_type_id,
									billIds : Ext.encode(reqIds),
									last_vers : Ext.encode(reqVers),
									accountType : accountType,
									menu_id :  Ext.PageUtil.getMenuId()
								},
								success : function(response, options) {
									Ext.PageUtil.succAjax(response, myMask, me,"请款成功！");
								},
								failure : function(response, options) {
									Ext.PageUtil.failAjax(response, myMask);
								}
							});
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
							var reqVers = [];
							for ( var i = 0; i < records.length; i++) {
								reqIds.push(records[i].get("pay_voucher_id"));
								reqVers.push(records[i].get("last_ver"));
							}
							var bill_type_id = records[0].get("bill_type_id");
							var params = {
								// 单据类型id
								billTypeId : bill_type_id,
								billIds : Ext.encode(reqIds),
								last_vers : Ext.encode(reqVers),
								accountType : accountType
							};
							Ext.PageUtil.doRequestAjax(me,'/realware/batchRepeatReqPayout.do',params);
						}
					},
					
					transferByType : function(transferType) {
						if(transferType=='payment'){
						   this.batchReqMoney();
						}else if(transferType=='repeatMoney'){
						   this.batchRepeatReqMoney();
						}
					},
					
					
					/**
					 * 有授权 请款申请 和 再次请款
					 * 
					 * */
					transBeforeAuthorize : function(transType){
						var me = this;
						var parameters = this.getAuthorizeAmount();
						
						var inputUser = parameters[0];
						var payMaxAmount = parameters[1];
						var userType = parameters[2];
						
						var userType_str;
						if(userType == 1){
							userType_str='网点管理员';
						}else if(userType == 2){
							userType_str='业务人员';
						}else if(userType == 3){
							userType_str='行长';
						}
						if(inputUser == false){
							this.transferByType(transType);
						}else if(inputUser == true){
							var authorizeRemark='存在需要授权的金额，最大金额为：'+payMaxAmount;
							Ext.widget('window', {
							id : 'authorizeWindow',
								title : '授权主管复核对话框',
								width : 300,
								height : 170,
								layout : 'fit',
								resizable : true,
								draggable : true,
								modal : true,
								items : [Ext.widget('form', {
									renderTo : Ext.getBody(),
									layout : {
										padding : '10'
									},
									resizable : false,
									modal : true,
									items : [ {
												xtype: 'label',
												id: 'authorizeRemark',
												text: authorizeRemark,
												height : 20,
												width : 170,
												style:'color:red;'
											},{
												xtype: 'hiddenfield',
										        id: 'userType',
										        value: userType
											},{
												id:'userType_str',
												fieldLabel : '用户类型',
												xtype : 'textfield',
												dataIndex : 'userType',
												emptyText : userType_str,
												editable : false,
												labelWidth: 60,
												height : 20,
												width : 200
											},{
												id : 'userCode',
												fieldLabel : '&nbsp;&nbsp;&nbsp;用户名',
												xtype : 'textfield',
												labelWidth: 60,
												height : 20,
												width : 200,
												allowBlank:false,
												blankText: '用户名是必填项'
											}, {
												id : 'userPass',
												fieldLabel : '&nbsp;&nbsp;&nbsp;密&nbsp;&nbsp;&nbsp;码',
												xtype : 'textfield',
												labelWidth : 60,
												inputType: 'password',
												height : 20,
												width : 200,
												allowBlank:false,
												blankText: '密码是必填项'
											}],
									buttons : [{
										text : '确定',
										handler : function() {
												//用户级别
												var userT = Ext.getCmp('userType').getValue();
												//用户编码
												var userCode = Ext.getCmp('userCode').getValue();
												//密码
												var userPass = Ext.getCmp('userPass').getValue();
												
												
												if (userCode == "" ||  null == userCode){
													Ext.Msg.alert("系统提示", "用户名不能为空！");
													return ;
												}
												if (userPass == "" ||  null == userPass){
													Ext.Msg.alert("系统提示", "密码不能为空！");
													return ;
												}
												
												var temp = Ext.PageUtil.validSelect(Ext.getCmp(Ext.PageUtil.prefix + Ext.getCmp('taskState').getValue()));
												
												var code = "";
												for(var i = 0;i < temp.length;i++){
													code = code + temp[i].get('pay_voucher_code') + ","
												}
												
												//    授权判断 ******************
												Ext.Ajax.request({
													url : '/realware/transAuthorize.do',
													method : 'POST',
													async : false,
													params : {
														userCode :  userCode,
														userPassWord :userPass,
														userType:userT,
														optionType : "请款",
														code : code
													},
													success : function(response, options) {
														Ext.getCmp("authorizeWindow").close();
														Ext.Msg.confirm('提示','授权成功,是否确定请款?',function (opt){
															if(opt=='no') 
																return;
															else
																me.transferByType(transType);
														});
													},
													failure : function(response, options) {
														Ext.Msg.show( {
															title : '失败提示',
															msg : response.responseText,
															buttons : Ext.Msg.OK,
															icon : Ext.MessageBox.ERROR
														});
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
							Ext.PageUtil.doRequestAjax(me,'/realware/writeoffVoucherAndtask.do',params);
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
					
					getAuthorizeAmount : function(){
						
						// 页面 业务数据
						var recordes = Ext.PageUtil.validSelect(Ext.getCmp(Ext.PageUtil.prefix + Ext.getCmp('taskState').getValue()));
						if(recordes == null){
							return;
						}
						// 数据库 支付上限数据
						var items = pbPayUpperLimittore.data.items;
						
						// 数据库同行最小金额
						var inlimitAmount=0 ;
						
						//业务数据中   同行最大金额
						var payInMaxAmount=0;
						
						
						var payMaxAmount=0;
						var inputUser = false ;
						
						var userType;
						
						//1 请款时控制 	2支付时控制
						var control_point;
						
						var array_tong = new Array(3); // 同行金额数组
						
					
						control_point = items[0].data.control_point;
						
						for(var i=0;i<items.length;i++){
							array_tong[i] = items[i].data.sanebank_amount;
							
							// 同行最低控制金额
							if(inlimitAmount == 0){
								inlimitAmount = parseFloat(items[i].data.sanebank_amount);
							}else if(parseFloat(items[i].data.sanebank_amount)<inlimitAmount){
								inlimitAmount = parseFloat(items[i].data.sanebank_amount);
							}
							
						}
						array_tong.sort(sortNumber); // 排序
						
						
						// 请款 控制
						if(control_point==1 ){
							// 凭证中  最大金额
							for ( var j = 0; j < recordes.length; j++) {
								if(parseFloat(recordes[j].get("pay_amount"))>payInMaxAmount){
									payInMaxAmount =recordes[j].get("pay_amount");
								}
							}
							var payMaxAmount_t;
							// 如果 凭证中  最大金额 大于 同行最低控制金额，需要授权
							if (payInMaxAmount > inlimitAmount) {
								payMaxAmount = payInMaxAmount;  // 授权金额
								inputUser = true;// 需要授权
								
								//  取 数据库中  比  业务最大金额 高的  第一个 级别 (跳过最低控制金额)
								for(var i=1;i<array_tong.length ; i++){  
									if(parseFloat(payInMaxAmount) < parseFloat(array_tong[i])){
										payMaxAmount_t = array_tong[i];
										break;
									}	
								}
								// 查出  这一级别 的 用户类型
								for(var i=0;i<items.length;i++ ){
									if(parseFloat(payMaxAmount_t) == items[i].data.sanebank_amount){
										userType = items[i].data.user_type;
										break;
									}
								}
							}
							
							
						} 
						
						return new Array(inputUser,payMaxAmount,userType);
					}
});
