/***
 * 支付凭证请款复核转账界面事件处理器
 * @memberOf {TypeName} 
 */
var pbPayUpperLimittore =null;
// 自定义 数字数组 排序函数
function sortNumber(a, b){
	return a - b;
}

Ext.define('pb.controller.pay.TransferVouchers',{
		extend : 'Ext.app.Controller',
		// 数据集列表：
		// pay.PayVouchers 支付凭证
		// pay.PayeeBankNos 收款行行号
		// common.PageStatus  初始化业务界面配置
		// pay.BankSetMode 银行结算方式
		stores : [ 'pay.PayVouchers','pay.BankSetMode','pay.ComboSpclType','pay.FundSrcStore','common.PbPayUpperLimit','pay.UserType'],

		//对象模型 pay.PayVoucher 支付凭证
		models : [ 'pay.PayVoucher' ],
		//当创建一个控件的时候需要在此引入
		requires : [ 'pb.view.pay.TransferVoucherList','pb.view.pay.PayVoucherQuery','pb.view.pay.ChequePayForABCWindow','Ext.ReportUtil'],
		//创建后获取当前控件，应用于当前控制层
		refs : [ {
			ref : 'list',  //当前控制层引用
			selector : 'transferVoucherList' // 控件的别名
		}, {
			ref : 'query',
			selector : 'payVoucherQuery'
		}, {
			ref : 'window',
			selector : 'ChequePayForABCWindow'
		} ],
		limitOfAmount : null,
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
					'transferVoucherList button[id=refresh]' : {
							click : this.refreshData
							//注 : 当该方法没有参数的时候可以直接这样写
					},
					//公务卡
					'transferVoucherList button[id=official]' : { 
							click : this.updateVoucher
					},
					
					//公务卡(湖南农行个性化)
					'transferVoucherList button[id=hofficial]' : { 
							click : this.hupdateVoucher
					},
					 //请款申请
					'transferVoucherList button[id=payment]' : { 
							click : function() {
								this.transNoAuthorize('payment');
					        }
					 },
					 //再次请款
					 'transferVoucherList button[id=repeatMoney]' : { 
						 	click : function() {
						       this.transNoAuthorize('repeatMoney');
					        }
							//click : this.batchRepeatReqMoney
					 },
					 //支付
					'transferVoucherList button[id=pay]' : { 
							click : function() {
								 this.transNoAuthorize('pay');
								//this.checkTransferPayVoucher(0);
							}
					 },
					 //请款申请(需要二次授权)
					 'transferVoucherList button[id=payment_auth]' : { 
						 click : function() {
							 this.transBeforeAuthorize('payment');
						 }
					 },
					 //再次请款(需要二次授权)
					 'transferVoucherList button[id=repeatMoney_auth]' : { 
						 click : function() {
							 this.transBeforeAuthorize('repeatMoney');
						 }
					 },
					 // 支付(需要二次授权)
					 'transferVoucherList button[id=pay_auth]' : { 
						 click : function() {
							 this.transBeforeAuthorize('pay');
						 }
					 },
					  //转账
					'transferVoucherList button[id=trans]' : { 
							click : function() {
								this.bankTransferVoucher(true);
							}
					 },
					  //落地转账
					'transferVoucherList button[id=localTrans]' : { 
							click : function() {
								this.bankTransferVoucher(false);
							}
					 },
					 //挂账
					/*'transferVoucherList button[id=hungaccount]' : {
							click : this.checkHungUpAcoount
					 },*/
					 //退回上岗
					 'transferVoucherList button[id=unsubmit]' : { 
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
										title : '退回上岗'
									});
									backvoucherwindow.on('confirmclick',function(o,textarea){
										var params = {
											returnRes : textarea,
											billIds : Ext.encode(ids),
											last_vers : Ext.encode(lastVers),
											billTypeId : bill_type_id
										};
										Ext.PageUtil.doRequestAjax(me,'/realware/unsubmitVoucher.do',params,'POST',backvoucherwindow);
									});
									backvoucherwindow.show();
								}
							}
					},
					//冲销凭证
					'transferVoucherList button[id=writeoff]' : { 
							click : this.writeoffPayVoucher
					},
					//退回财政
					'transferVoucherList button[id=back]' : { 
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
					//退回财政(湖南个性化)
					'transferVoucherList button[id=hback]' : { 
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
					'transferVoucherList button[id=look]' : {
							click : this.lookVoucher
					},
					//人工转账
					'transferVoucherList button[id=artificialtransfer]' : { 
							click : this.Artificialtransfer
					},
					//主管授权-人工转账
					'transferVoucherList button[id=sqArtificialtransfer]' : { 
							click : this.SQArtificialtransfer
					},
					//多线程转账
					'transferVoucherList button[id=transl]' : { 
							click : this.bankTransferVoucherPool
					},
					//再次转账，需要修改备注
					'transferVoucherList button[id=againTrans]' : { 
							click : this.againBankTransferVoucher
					},
					//支票支付
					'transferVoucherList button[id=transferVerify]' : { 
						click : function(){
							
							var me = this;
							Ext.Ajax.request({
								url : '/realware/queryLimitOfAmount.do',
								method : 'POST',
								params : {
									admDivCode : Ext.getCmp('admdivCode').getValue()
								},
								// 提交成功的回调函数
								success : function(response) {
									
									var object = Ext.decode(response.responseText);
									
									me.limitOfAmount = object.limitOfAmount;
									
									if(Ext.isEmpty(me.limitOfAmount)){
										Ext.Msg.alert('系统提示', '未配置当前区划对应的取现额度！');
										return ;
									}
									var records = Ext.PageUtil.validSelect(Ext.getCmp(Ext.PageUtil.prefix + Ext.getCmp('taskState').getValue()));
									if(records !=null) {
										
										   if( me.getWindow() == null){
											   Ext.create('pb.view.pay.ChequePayForABCWindow',{
						                       }); 
										   }
					                       if(me.getWindow().setValue(records)){
					                    	   me.getWindow().show();
					                       }
									}
								}
							});
							
						}
					},
					//支票支付
					'ChequePayForABCWindow button[id=payConfrim]' : { 
							click : function(){
								var me = this;
								var params = this.getWindow().isValid();
								if(params.enable){
									me.chequePay(params);
								}
								
							}
					}
					
					////////////////////////END///////////////////////
				});
			},
			/////////////////////被调用的方法/////////////////////////
					
			/**
			 * 切换状态  注：新添加的状态在库里的状态相同的就直接添加的已有的判断里面不要再添加了
			 * @param {Object} status_code  状态code
			 */
			selectState : function(status_code) {
				if ('003' == status_code) { //已退回
					//正常情况下初审界面的已退回
					Ext.StatusUtil.batchEnable("look,refresh");
					Ext.StatusUtil.batchDisable("hback,unsubmit,sqArtificialtransfer,artificialtransfer,official," +
					"pay,pay_auth,againTrans,transl,trans,payment,payment_auth,back,pay,pay_auth,writeoff," +
					"official,repeatMoney,repeatMoney_auth,hungaccount,localTrans");
				} else if ('004' == status_code) { //未请款
					Ext.StatusUtil.batchEnable("payment,payment_auth,unsubmit");
					Ext.StatusUtil.batchDisable("back,pay,pay_auth,writeoff,official,repeatMoney,repeatMoney_auth," +
					"hungaccount,artificialtransfer,sqArtificialtransfer,transl,againTrans");
				} else if ('005' == status_code) { //请款失败/超时
					Ext.StatusUtil.batchEnable("unsubmit,repeatMoney,repeatMoney_auth");
					Ext.StatusUtil.batchDisable("payment,payment_auth,back,pay,pay_auth,writeoff,official,hungaccount," +
					"artificialtransfer,sqArtificialtransfer,transl,againTrans");
				} else if ('006' == status_code) { //已请款/支付超时/失败
					Ext.StatusUtil.batchEnable("pay,pay_auth,writeoff,official,hungaccount,artificialtransfer,sqArtificialtransfer");
					Ext.StatusUtil.batchDisable("payment,payment_auth,unsubmit,back,repeatMoney,repeatMoney_auth," +
					"transl,againTrans");
				} else if ('007' == status_code) { //已退回
					Ext.StatusUtil.batchDisable("trans,transferVerify,againTrans,unsubmit,pay,payment,payment_auth," +
					"back,pay_auth,writeoff,official,repeatMoney,repeatMoney_auth,hungaccount,artificialtransfer," +
					"sqArtificialtransfer,transl");
				} else if ('008' == status_code) { //已支付
					Ext.StatusUtil.batchDisable("payment,payment_auth,unsubmit,back,pay,pay_auth,writeoff,official," +
					"repeatMoney,repeatMoney_auth,hungaccount,artificialtransfer,sqArtificialtransfer,transl,againTrans");
				} else if('013' == status_code){  //未转账
					Ext.StatusUtil.batchEnable("pay,pay_auth,unsubmit,back,official,look,sqArtificialtransfer," +
					"artificialtransfer,transl,transferVerify,trans,hback,unsubmit,");
					Ext.StatusUtil.batchDisable("againTrans,localTrans");
				} else if('014' == status_code){ //转账成功
					Ext.StatusUtil.batchEnable("look,refresh");
					Ext.StatusUtil.batchDisable("hback,unsubmit,sqArtificialtransfer,artificialtransfer,official," +
					"pay,pay_auth,transl,againTrans,transferVerify,trans,localTrans");
				} else if('015' == status_code){//转账失败
					Ext.StatusUtil.batchEnable("pay,pay_auth,unsubmit,back,look,sqArtificialtransfer,artificialtransfer," +
					"againTrans,transferVerify,localTrans,hback");
					Ext.StatusUtil.batchDisable("official,transl,trans");
				}else if ('016' == status_code) { //未支付
					Ext.StatusUtil.batchEnable("back,pay,pay_auth,unsubmit,artificialtransfer,sqArtificialtransfer");
				} else if ('017' == status_code) { //已支付
					Ext.StatusUtil.batchDisable("back,pay,pay_auth,unsubmit,artificialtransfer,sqArtificialtransfer");
				} else if ('018' == status_code) {//已退回初审
					Ext.StatusUtil.batchDisable("back,pay,pay_auth,unsubmit,artificialtransfer,sqArtificialtransfer");
				}else if('019' == status_code) { //已退回财政
					Ext.StatusUtil.batchDisable("back,pay,unsubmit,sqArtificialtransfer,artificialtransfer");
				} else if('021' == status_code){//海南转账超时（请款与超时分开界面）
					Ext.StatusUtil.batchEnable("pay,unsubmit,look,sqArtificialtransfer,artificialtransfer,transl," +
					"againTrans,localTrans,hback");
					Ext.StatusUtil.batchDisable("official,pay,back,transl,trans");
				}else if('001' == status_code){
					Ext.StatusUtil.batchDisable("writeoff");
				}else if('000' == status_code){
					Ext.StatusUtil.batchEnable("writeoff");
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
							var jsonMap = "[";
							Ext.Array.each(records, function(model) {
								reqIds.push(model.get("pay_voucher_id"));
								reqVers.push(model.get("last_ver"));
								jsonMap += "{\"id\":\""
									+ model.get("pay_voucher_id")
									+ "\",\"bankNo\":\""
									+ model.get("payee_account_bank_no")
									+ "\",\"is_onlyreq\":\"" + 1 + "\"},";
							});
							var params={
								billIds : Ext.encode(reqIds),
								last_vers : Ext.encode(reqVers),
								billTypeId : records[0].get("bill_type_id"),
								task_id : '0',
								isflow : 1,
								remark : '普通支付转公务卡',
								jsonMap : jsonMap.substring(0,jsonMap.length - 1) + "]"
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
								ids = ids + model.get("pay_voucher_id") + ",";
							});
							var params={
								ids : ids.substring(0, ids.length - 1),
								objMap : "[{\"is_onlyreq\":1}]",
								remark : '普通支付转公务卡'
							};
							Ext.PageUtil.doRequestAjax(me,'/realware/updatePayVoucher.do',params);
						}
					},
					getAuthorizeAmount:function(transType){
						
						// 页面 业务数据
						var recordes = Ext.PageUtil.validSelect(Ext.getCmp(Ext.PageUtil.prefix + Ext.getCmp('taskState').getValue()));
						if(recordes == null){
							return;
						}
						// 数据库 支付上限数据
						var items = pbPayUpperLimittore.data.items;
						// 数据库同行最小金额
						var inlimitAmount=0 ;
						// 数据库跨行最小金额
						var outlimitAmount=0;
						//业务数据中   同行最大金额
						var payInMaxAmount=0;
						//业务数据中  跨行最大金额
						var payOutMaxAmount=0;
						
						var payMaxAmount=0;
						var inputUser = false ;
						
						var userType;
						
						var array_tong = new Array(3); // 同行金额数组
						var array_kua = new Array(3);  // 跨行金额数组
						
					
						
						for(var i=0;i<items.length;i++){
							array_tong[i] = items[i].data.sanebank_amount;
							array_kua[i] = items[i].data.commonpay_amount;
							
							// 同行最低控制金额
							if(inlimitAmount == 0){
								inlimitAmount = parseFloat(items[i].data.sanebank_amount);
							}else if(parseFloat(items[i].data.sanebank_amount)<inlimitAmount){
								inlimitAmount = parseFloat(items[i].data.sanebank_amount);
							}
							// 跨行最低控制金额	
							if(outlimitAmount == 0){
								outlimitAmount = parseFloat(items[i].data.commonpay_amount);
							}else if(parseFloat(items[i].data.commonpay_amount)<outlimitAmount){
								outlimitAmount = parseFloat(items[i].data.commonpay_amount);
							}
							
						}
						array_tong.sort(sortNumber); // 排序
						array_kua.sort(sortNumber);
						
						
						// 请款 
						if(transType == 'payment'||transType == 'repeatMoney'){
							// 取 业务 请款凭证中  最大金额
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
							
							
						// 支付 
						} else if(transType == 'pay'){
							
							// 业务数据中   同行 最大金额 和 跨行 最大金额
							for ( var j = 0; j < recordes.length; j++) {
								if(parseFloat(recordes[j].get("pay_amount"))>payInMaxAmount
										&&recordes[j].get("is_same_bank")=='1'){
									payInMaxAmount =recordes[j].get("pay_amount");
								}
								if(parseFloat(recordes[j].get("pay_amount"))>payOutMaxAmount
										&&recordes[j].get("is_same_bank")=='0'){
									payOutMaxAmount =recordes[j].get("pay_amount");
								}
								
							}
							
							var payMaxAmount_tong; //  临时变量
							var payMaxAmount_kua; 
							
							// 同行金额 大于 跨行金额
						    if(parseFloat(payInMaxAmount) > parseFloat(payOutMaxAmount)){
						    	// 业务数据中   同行 最大金额 和  数据库同行最小金额  比较，如果前者大， 则需要授权
								if(parseFloat(payInMaxAmount) > parseFloat(inlimitAmount)){
									payMaxAmount = payInMaxAmount;  // 授权金额
									inputUser = true; // 需要授权
									for(var i=1;i<array_tong.length ; i++){  
										if(payInMaxAmount < array_tong[i]){
											payMaxAmount_tong = array_tong[i];
											break;
										}	
									}
									
									// 查出  这一级别 的 用户类型
									for(var i=0;i<items.length;i++ ){
										if(payMaxAmount_tong == items[i].data.sanebank_amount){
											userType = items[i].data.user_type;
											break;
										}
									}
									
									
								}
						    	
						    // 跨行金额 大于	同行金额
						    }else{
						    	// 业务数据中  跨行 最大金额  和  数据库跨行最小金额  比较，如果前者大， 则需要授权
								if(parseFloat(payOutMaxAmount)>parseFloat(outlimitAmount)){
									payMaxAmount = payOutMaxAmount; // 授权金额
									inputUser = true; // 需要授权
									
									for(var i=1;i<array_kua.length ; i++){  
										if(payOutMaxAmount < array_kua[i] ){
											payMaxAmount_kua = array_kua[i];
											break;
										}	
									}
									// 查出  这一级别 的 用户类型
									for(var i=0;i<items.length;i++ ){
										if(payMaxAmount_kua ==items[i].data.commonpay_amount){
											userType = items[i].data.user_type;
											break;
										}
									}
									
								}
						    }
							
							
						}
						
						return new Array(inputUser,payMaxAmount,userType);
					},
					// 无授权请款 和 支付
					transNoAuthorize: function(transType){
						this.transferByType(transType);
					},
					// 有授权 请款 和 支付
					transBeforeAuthorize : function(transType) {
						var me = this;
						
						var parameters = this.getAuthorizeAmount(transType);
						var inputUser = parameters[0];
						var payMaxAmount = parameters[1];
						var userType = parameters[2];
						var comboUserType = null;
						if(userType == 1){
							comboUserType = Ext.create('Ext.data.Store', {
							fields : ['name', 'value'],
							data : [{
										"name" : "主管",
										"value" : 1
									}, {
										"name" : "行长",
										"value" : 3
									}]
							});
						}else if(userType == 2){
							comboUserType = Ext.create('Ext.data.Store', {
							fields : ['name', 'value'],
							data : [{
										"name" : "主管",
										"value" : 1
									}, {
										"name" : "业务人员",
										"value" : 2
									}, {
										"name" : "行长",
										"value" : 3
									}]
							});
						}else if(userType == 3){
							comboUserType = Ext.create('Ext.data.Store', {
							fields : ['name', 'value'],
							data : [ {
										"name" : "行长",
										"value" : 3
									}]
							});
						}
						
						if(inputUser == false){
							this.transferByType(transType);
						}else if(inputUser == true){
							if(userType == null){
								Ext.Msg.alert("系统提示", "金额"+ payMaxAmount + "超出行长可授权范围。");
								return ;
							}
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
												id:'userType',
												fieldLabel : '用户类型',
												displayField : 'name',
												valueField : 'value',
												xtype : 'combo',
												value : '',
												store : comboUserType,
												labelWidth: 60,
												height : 20,
												width : 200,
												listeners : {
													'afterrender' : function(){
														this.setValue(userType);
													}
												}
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
												if(Ext.isEmpty(userT)){
													Ext.Msg.alert("系统提示", "请选择用户类型！");
													return ;
												}
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
												
												var optionType = "";
												if(transferType=='payment'){
													optionType = "请款";
												}else if(transferType=='repeatMoney'){
													optionType = "再次请款";
												}else if(transferType=='pay'){
													optionType = "支付";
												}
												
												//    授权判断 ******************
												Ext.Ajax.request({
													url : '/realware/transAuthorize.do',
													method : 'POST',
													timeout : 1800000, // 设置为3分钟
													async : false,
													params : {
														userCode :  userCode,
														userPassWord :userPass,
														userType:userT,
														code : code,
														optionType : optionType
													},
													success : function(response, options) {
														if(response.responseText == '授权成功'){
															Ext.getCmp("authorizeWindow").close();
															Ext.Msg.confirm('提示','授权成功,是否确定转账?',function (opt){
																if(opt=='no') 
																	return;
																else
//																	me.SavaAccreditLog();
																	me.transferByType(transType);
															});
														}else{
															Ext.Msg.alert('系统提示', 'session失效 请重新登陆！');
															parent.window.location.href = 'login.do';
														}										
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
					
					transferByType : function(transferType) {
						if(transferType=='payment'){
						   this.batchReqMoney();
						}else if(transferType=='repeatMoney'){
						   this.batchRepeatReqMoney();
						}else if(transferType=='pay'){
							this.checkTransferPayVoucher(0);
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
							var params = {
								// 单据类型id
								billTypeId : bill_type_id,
								billIds : Ext.encode(reqIds),
								last_vers : Ext.encode(reqVers),
								accountType : accountType
							};
							Ext.PageUtil.doRequestAjax(me,'/realware/batchReqMoney.do',params);
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
							Ext.PageUtil.doRequestAjax(me,'/realware/batchRepeatReqMoney.do',params);
						}
					},
					/**
					 * 支付
					 * @param {Object} transSucc
					 * @memberOf {TypeName} 
					 * @return {TypeName} 
					 */
					checkTransferPayVoucher : function(transSucc) {
						var me = this;
						var records = Ext.PageUtil.validSelect(Ext.getCmp(Ext.PageUtil.prefix + Ext.getCmp('taskState').getValue()));
						if(records !=null) {
							// 凭证主键字符串
							var reqIds = [];
							var reqVers = [];
							Ext.Array.each(records, function(model) {
								reqIds.push(model.get("pay_voucher_id"));
								reqVers.push(model.get("last_ver"));
							});
							var params = {
								// 单据类型id
								billTypeId : records[0].get("bill_type_id"),
								billIds : Ext.encode(reqIds),
								transSucc : transSucc,
								last_vers : Ext.encode(reqVers)
							};
							Ext.PageUtil.doRequestAjax(me,'/realware/checkTransferPayVoucher.do',params);
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
					
					/**
					 * 人工转账
					 * @memberOf {TypeName} 
					 * @return {TypeName} 
					 */
				 Artificialtransfer : function () {
						var me = this;
						var records = Ext.PageUtil.validSelect(Ext.getCmp(Ext.PageUtil.prefix + Ext.getCmp('taskState').getValue()));
						if(records !=null) {
							// 凭证主键字符串
							var reqIds = [];
							var reqVers = [];
							Ext.Array.each(records, function(model) {
								reqIds.push(model.get("pay_voucher_id"));
								reqVers.push(model.get("last_ver"));
							});
							var params = {
								billTypeId: records[0].get("bill_type_id"),
								billIds : Ext.encode(reqIds),
								last_vers : Ext.encode(reqVers),
								accountType : accountType
							};
							Ext.PageUtil.doRequestAjax(me,'/realware/artificialtransfer.do',params);
						}
					},
					
				/**
				 * 授权转账时，保存授权日志
				 * @memberOf {TypeName} 
				 * @return {TypeName} 
				 * @author wenmignlei
				 */
				 SavaAccreditLog : function () {
						var me = this;
						var records = Ext.PageUtil.validSelect(Ext.getCmp(Ext.PageUtil.prefix + Ext.getCmp('taskState').getValue()));
						if(records !=null) {
							// 凭证主键字符串
							var reqIds = [];
							var reqVers = [];
							Ext.Array.each(records, function(model) {
								reqIds.push(model.get("pay_voucher_id"));
								reqVers.push(model.get("last_ver"));
							});
							var params = {
								billTypeId: records[0].get("bill_type_id"),
								billIds : Ext.encode(reqIds),
								last_vers : Ext.encode(reqVers),
								accountType : accountType
							};
							Ext.Ajax.request( {
								url : '/realware/savaaccreditlog.do',
								method : 'POST',
								timeout : 240000, // 设置为4分钟
								params : params,
								success : function(response, options) {
									//me.succAjax(response, myMask, thiz);
									if(!Ext.isEmpty(window)){
										window.close();
									}
								},
								failure : function(response, options) {
									if (!Ext.isEmpty(myMask)) {
										myMask.hide();
									}
									Ext.Msg.show({
										title:"失败提示",
										msg:response.responseText,
										buttons:Ext.Msg.OK,
										icon:Ext.MessageBox.ERROR
									});
								}
							});
						//	Ext.PageUtil.doRequestAjax(me,'/realware/savaaccreditlog.do',params);
						}
					},
				/**
				 * 人工转账：需要主管授权时用
				 * @memberOf {TypeName} 
				 * @return {TypeName} 
				 */
				SQArtificialtransfer : function () {
						var me = this;
						var records = Ext.PageUtil.validSelect(Ext.getCmp(Ext.PageUtil.prefix + Ext.getCmp('taskState').getValue()));
						if(records !=null) {
							 var form = Ext.create('Ext.form.Panel', {
                             layout : 'absolute',
                             defaultType : 'textfield',
                             border : false,
                             bodyStyle : "background:#DFE9F6",
                             items : [{
                                 fieldLabel : '主管编码',
                                 id : "majorUserCode",
                                 fieldWidth : 40,
                                 labelWidth : 60,
                                 msgTarget : 'side',
                                 allowBlank : false,
                                 x : 5,
                                 y : 5,
                                 anchor : '-5' // anchor width by percentage
                             }, {
                                 fieldLabel : '主管密码',
                                 id : "majorUserCodePwd",
                                 fieldWidth : 40,
                                 labelWidth : 60,
                                 inputType : 'password',
                                 msgTarget : 'side',
                                 minLength : 6,
                                 //maxLength : 6,
                                 allowBlank : false,
                                 x : 5,
                                 y : 35,
                                 anchor : '-5' 
                             }],
                             dockedItems : [{
                                 xtype : 'toolbar',
                                 dock : 'bottom',
                                 ui : 'footer',
                                 layout : {
                                     pack : "end"
                                 },
                                 items : [{
                                     text : "确认",
                                     width : 80,
                                     disabled : true,
                                     formBind : true,
                                     handler : confirm,
                                     scope : me
                                 }, {
                                     text : "取消",
                                     width : 80,
                                     handler : function(){
                                     	Ext.ComponentQuery.query('form',win)[0].getForm().reset();
									    win.close();
                                     },
                                     scope : me
                                 }]
                             }]

                         });
                         var win = Ext.create('Ext.window.Window', {
                             title : '主管授权',
                             width : 300,
                             height : 130,
                             layout : 'fit',
                             plain : true,
                             resizable : false,
                             items : form
                         });
						win.show();	
						}
						//—*****************************		
						function confirm(){
								if(form.isValid()){
									var params = {};
									params.userCode=Ext.getCmp("majorUserCode").getValue();
									params.userPassWord=Ext.getCmp("majorUserCodePwd").getValue();
									params.userType = 1;
									params.menu_id=Ext.PageUtil.getMenuId();
									
									params.optionType = "人工转账";
									var code = "";
									for(var i = 0;i < records.length;i++){
										code = code + records[i].get('pay_voucher_code') + ","
									}
									params.code = code;
									
									var myMask=new Ext.LoadMask(Ext.getBody(),{
										msg:'后台正在处理，请稍后...',
										removeMask:true
									});
									myMask.show();
									Ext.Ajax.request( {
										method : 'POST',
										timeout : 180000,
										url : '/realware/transAuthorize.do',
										params : params,
										success : function(response, options) {
											myMask.hide();
											if(!Ext.isEmpty(win)){
												form.close();
                                  				 win.close();
											}
//											//授权成功之后保存授权日志
//											me.SavaAccreditLog();
											//直接调用之前的代码
											me.Artificialtransfer();
										},
										failure : function(response, options) {
											if (!Ext.isEmpty(myMask)) {
												myMask.hide();
											}
											Ext.Msg.show({
												title:"失败提示",
												msg:response.responseText,
												buttons:Ext.Msg.OK,
												icon:Ext.MessageBox.ERROR
											});
										}
											});
								}
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
					 * 转账 true  | 落地转账，不需要修改备注 false
					 * @param {Object} nolocal
					 * @memberOf {TypeName} 
					 */
					bankTransferVoucher : function (nolocal) {
						var me = this;
						var records =  Ext.PageUtil.validSelect(Ext.getCmp(Ext.PageUtil.prefix + Ext.getCmp('taskState').getValue()));
						var reqIds = [];
						var reqVers = [];
						Ext.Array.each(records, function(model) {
							reqIds .push(model.get("pay_voucher_id"));
							reqVers.push(model.get("last_ver"));
						 });
						if(nolocal) {														
							//专项资金
							if(specialFundsNo.indexOf(records[0].get("pay_account_no"))>=0)
							{
								var specialfundswindow =Ext.create('pb.view.pay.SpecialFundsWindow',{
									title : '专项资金'
								});
								Ext.getCmp('remark').setValue(records[0].get('pay_summary_name'));
								specialfundswindow.on('confirmclick',function(o)
										{
											var params = {
												billTypeId : records[0].get("bill_type_id"),
												billIds : Ext.encode(reqIds),
												last_vers : Ext.encode(reqVers),
												cntrlSpclFundBdgtdocno : Ext.getCmp("cntrlSpclFundBdgtdocno").value,
												localSeprBdgtdocno : Ext.getCmp("localSeprBdgtdocno").value,
												fundSrc : Ext.getCmp("fundSrc").value,
												spcltypeCode :Ext.getCmp("Spcltype").getValue(),
												spclTypeName: Ext.getCmp("Spcltype").rawValue,
												remark : Ext.getCmp("remark").value
											};
											Ext.PageUtil.doRequestAjax(me,'/realware/bankTransferVoucher.do',params);
										});
								specialfundswindow.show();
							}
							else
							{
								var params = {
									// 单据类型id
									billTypeId : records[0].get("bill_type_id"),
									billIds : Ext.encode(reqIds),
									last_vers : Ext.encode(reqVers)
								};
								Ext.PageUtil.doRequestAjax(me,'/realware/bankTransferVoucher.do',params);
							}
						} else {
							var params = {
									billTypeId : records[0].get("bill_type_id"),
									billIds : Ext.encode(reqIds),
									last_vers : Ext.encode(reqVers),
									whereObj : '232'
								};
								Ext.PageUtil.doRequestAjax(me,'/realware/bankTransferVoucher.do',params);
						}
					},
					/**
					 * 刷新
					 * @memberOf {TypeName} 
					 */
					refreshData : function() {
						this.getStore('pay.PayVouchers').loadPage(1);
					},
					/**
 					* 多线程转账
 					* @param {} nolocal
 					*/
 					bankTransferVoucherPool : function() {
						var me = this;
						var records =  Ext.PageUtil.validSelect(Ext.getCmp(Ext.PageUtil.prefix + Ext.getCmp('taskState').getValue()));
						var reqIds = [];
						var reqVers = [];
						Ext.Array.each(records, function(model) {
							reqIds.push(model.get("pay_voucher_id"));
							reqVers.push(model.get("last_ver"));
						});
						var myMask = new Ext.LoadMask(Ext.getBody(), {
							msg : '后台正在处理中，请稍后....',
							removeMask : true
							// 完成后移除
						});
						var params = {
									// 单据类型id
									billTypeId : records[0].get("bill_type_id"),
									billIds : Ext.encode(reqIds),
									last_vers : Ext.encode(reqVers)
								}
						Ext.PageUtil.doRequestAjax(me,'/realware/bankTransferVoucherPool.do',params);
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
						//如果是中央专项资金转账失败，再次转账专项资金需要重新补录
						if(specialFundsNo.indexOf(records[0].get("pay_account_no"))>=0)
						{
							var specialfundswindow =Ext.create('pb.view.pay.SpecialFundsWindow',{
								title : '专项资金'
							});
							Ext.getCmp('remark').setValue(records[0].get('pay_summary_name'));
							specialfundswindow.on('confirmclick',function(o)
									{
										var params = {
											billTypeId : records[0].get("bill_type_id"),
											billIds : Ext.encode(reqIds),
											last_vers : Ext.encode(reqVers),
											cntrlSpclFundBdgtdocno : Ext.getCmp("cntrlSpclFundBdgtdocno").value,
											localSeprBdgtdocno : Ext.getCmp("localSeprBdgtdocno").value,
											fundSrc : Ext.getCmp("fundSrc").value,
											spcltypeCode :Ext.getCmp("Spcltype").getValue(),
											spclTypeName: Ext.getCmp("Spcltype").rawValue,
											remark : Ext.getCmp("remark").value
										};
										Ext.PageUtil.doRequestAjax(me,'/realware/bankTransferVoucher.do',params);
									});
							specialfundswindow.show();
						}
						else{
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
						}
					},
					//核销转账
					chequePay : function(params){
					    var me = this;
					    me.getWindow().close();
					    if (params.sumAmount < me.limitOfAmount) {
                            Ext.PageUtil.doRequestAjax(me,'/realware/transferAndVerifyForABC.do',params);
                        } else {
                               var form = Ext.create('Ext.form.Panel', {
                                   layout : 'absolute',
                                   defaultType : 'textfield',
                                   border : false,
                                   bodyStyle : "background:#DFE9F6",
                                   items : [{
                                       fieldLabel : '主管代码',
                                       id : "majorUserCode",
                                       fieldWidth : 40,
                                       labelWidth : 60,
                                       msgTarget : 'side',
                                       allowBlank : false,
                                       x : 5,
                                       y : 5,
                                       anchor : '-5' // anchor width by percentage
                                   }, {
                                       fieldLabel : '主管密码',
                                       id : "majorUserCodePwd",
                                       fieldWidth : 40,
                                       labelWidth : 60,
                                       inputType : 'password',
                                       msgTarget : 'side',
                                       minLength : 6,
                                       maxLength : 6,
                                       allowBlank : false,
                                       x : 5,
                                       y : 35,
                                       anchor : '-5' // anchor width by percentage
                                   }],
                                   dockedItems : [{
                                       xtype : 'toolbar',
                                       dock : 'bottom',
                                       ui : 'footer',
                                       layout : {
                                           pack : "end"
                                       },
                                       items : [{
                                           text : "确认",
                                           width : 80,
                                           disabled : true,
                                           formBind : true,
                                           handler : onConfirm,
                                           scope : me
                                       }, {
                                           text : "取消",
                                           width : 80,
                                           handler : onCancel,
                                           scope : me
                                       }]
                                   }]

                               });
                               var win = Ext.create('Ext.window.Window', {
                                   autoShow : true,
                                   title : '主管授权',
                                   width : 300,
                                   height : 130,
                                   layout : 'fit',
                                   plain : true,
                                   resizable : false,
                                   items : form
                               });
                               function onCancel() {
                            	   Ext.getCmp("majorUserCode").setValue('');
                            	   Ext.getCmp("majorUserCodePwd").setValue('');
                                   form.close();
                                   win.close();
                               }
                               function onConfirm(){
                            	   	if(form.isValid()){
                            	   			params.majorUserCode = Ext.getCmp("majorUserCode").getValue();
                            	   			params.majorUserCodePwd = Ext.getCmp('majorUserCodePwd').getValue();
                            	   			Ext.PageUtil.doRequestAjax(me,'/realware/transferAndVerifyForABC.do',params,null,win);
                            	   	}
                               }
                           }
						}
					
});
