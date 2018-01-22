/***
 * 主要用于授权额度通知单生成
 * @type 
 */

/***
 * 引入需要使用的js文件
 */
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/recommend.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/ocxVoucher.js"></scr' + 'ipt>');

//未生成
var filed001 = ["plan_agent_note_code","plan_amount","plan_month","fund_type_code",
				"fund_type_name","pay_bank_code","pay_bank_name", 
				"create_date","print_num","print_date","voucher_status_des","bgt_type_code",
				"bgt_type_name","business_type","task_id","send_flag",
				"plan_agent_note_id","bill_type_id","last_ver"]; // 数据项

var header001="额度通知单编号|plan_agent_note_code|140,金额|plan_amount|100,计划月份|plan_month|100,资金性质编码|fund_type_code,资金性质|fund_type_name," 
		+"代理银行编码|pay_bank_code,代理银行名称|pay_bank_name,制单日期|create_date|140,打印次数|print_num|140,"
		+"打印时间|print_date,凭证状态|voucher_status_des,预算类型编码|bgt_type_code|140,预算类型名称|bgt_type_name|140";
		

//已生成        
var filed002=["plan_recorded_note_code","plan_month","plan_amount","agency_code","agency_name","pay_bank_code","pay_bank_name","pay_account_bank", 
	"print_num","print_date","voucher_status","voucher_status_des","bgt_type_code","bgt_type_name","plan_recorded_note_id","bill_type_id"];

var header002="额度到账通知单|plan_recorded_note_code,计划月份|plan_month,计划金额|plan_amount,基层预算单位编码|agency_code,预算单位名称|agency_name," 
		+"开户行编码|pay_bank_code,开户行|pay_bank_name,单位零余额账户|pay_account_code,单位零余额账户名称|pay_account_name|140,单位零余额开户银行名称|pay_account_bank" 
		+",打印次数|print_num,打印时间|print_date,凭证状态|voucher_status_des,预算类型编码|bgt_type_code,预算类型名称|bgt_type_name";

/**
 * 状态
 */		
var voucherFlagStore = Ext.create('Ext.data.Store', {
			fields : ['name', 'value'],
			data : [{
						"name" : "全部",
						"value" : ""
					}, {
						"name" : "银行未发送",
						"value" : "13"
					}, {
						"name" : "财政未接收",
						"value" : "0"
					}, {
						"name" : "财政接收成功",
						"value" : "1"
					}, {
						"name" : "财政接收失败",
						"value" : "2"
					}, {
						"name" : "财政签收成功",
						"value" : "3"
					}, {
						"name" : "财政签收失败",
						"value" : "4"
					}, {
						"name" : "财政已退回",
						"value" : "5"
					},{
						"name" : "已收到财政回单",
						"value" : "12"
					}]
				});	

		
//列表
var gridPanel = null;

var j = 0; //分页

/***
 * 界面初始化
 */
Ext.onReady(function() {
  
	Ext.QuickTips.init();
	// 引用工具类
	Ext.Loader.setPath('Ext', 'js/util');
	Ext.require(['Ext.PageUtil']);
	store1 = getStore(loadBudgetNoteUrl, filed001);
	column1 = getColModel(header001, filed001);
	store2 = getStore(loadPlanRecordedNoteUrl, filed002);
	column2 = getColModel(header002, filed002);
	var pagetool = getPageToolbar(store1);
	store1.on('beforeload', function(thiz, options,e) {
		var panel = Ext.ComponentQuery.query("panel[title='查询区']")[0];
		beforeload(panel, options, Ext.encode(filed001));
		Ext.getCmp("voucher_status_des").renderer = function(value){
			if(null != value){
				value = value.replace("对方", "财政");
				value = value.replace("本方", "银行");
				    if(value=="未发送"){
				    		value = "未发送到财政";
				    }								
			}
			return value;
		};
	});
	store2.on('beforeload', function(thiz, options,e) {
		var panel = Ext.ComponentQuery.query("panel[title='查询区']")[0];
		beforeload(panel, options, Ext.encode(filed002));
		Ext.getCmp("voucher_status_des").renderer = function(value){
			if(null != value){
				value = value.replace("对方", "财政");
				value = value.replace("本方", "银行");
				    if(value=="未发送"){
				    		value = "未发送到财政";
				    }								
			}
			return value;
		};
	});
	//------------------------------------------------------------

  	//-------------------------------------------------------------
  	//按钮区开始
  	 var buttonItems = [
	                    {
	                    	//签章发送
	                    	id : 'send',
							handler : function() {
	                    		sendPlanAgentNote();
							}
  	                    },
  	                    {
  	                    	//重新发送
  	                    	id : 'again',
							handler : function() {
								//lfj 2015-09-18 已废弃，查询数据库无重新发送按钮
  	                    		sendPlanAgentNoteagain();
  	                    	}
  	                    }, 
  	                    {
  	                    	//撤销生成
  	                    	id : 'uncreate',
							handler : function() {
								unCreatePlanRecordedNotes();
  	                    	}
  	                    },
  	                    {
  	                    	//查看凭证
  	                    	id : 'look',
							handler : function() {
  	                    		lookvoucher(gridPanel);
							}
  	                    },
  	                    {
  	                    	//刷新
  	                    	id : 'refresh',
							handler : function() {
  	                    		refreshData();
							}
  	                    }, {
  	                    	id : 'recordAccount',
							handler : function() {
  	                    		recordAccount();
							}
  	                    }];
  	 //按钮区结束
  	 //查询区
  	 var queryItems=[
  	                 {
  	                	title : "查询区",
  	                	frame : false,
						defaults : {
							padding : '0 3 0 3'
						},
						layout : {
							type : 'table',
							columns : 4
						},
						bodyPadding : 5, 
						items : [
						         {
						        	id : 'taskState',
									fieldLabel : '当前状态',
									xtype : 'combo',
									dataIndex : 'task_status',
									displayField : 'status_name',
									emptyText : '请选择',
									valueField : 'status_code',
									editable : false,
									listeners : {
										'change' : selectState
									}
						         },{
						        	id : 'admdiv',
									fieldLabel : '所属财政',
									xtype : 'combo',
									dataIndex : 'admdiv_code',
									displayField : 'admdiv_name',
									emptyText : '请选择',
									valueField : 'admdiv_code',
									editable : false,
									store : comboAdmdiv 
						         },{
										id : 'voucherState',
										fieldLabel : '凭证状态',
										xtype : 'combo',
										dataIndex : 'voucher_status',
										displayField : 'name',
										emptyText : '请选择',
										valueField : 'value',
										store : voucherFlagStore,
										editable : false,
										style : 'margin-bottom:5px;margin-top:5px;margin-left:5px;margin-right:5px;',
										listeners : {
											'change' : selectVoucherStore
										}
									},{
						        	id : 'agency1',
									fieldLabel : '预算单位名称',
									xtype : 'textfield',
									dataIndex : 'agency_name'
						         }
						         ],
						    flex : 2
  	                 }, {
						id : 'planRecordedNoteCreateQuery',
						xtype : 'gridpanel',
						height : document.documentElement.scrollHeight - 90,
						frame : false,
						multiSelect : true,
						viewConfig : {
							shrinkWrap : 0
						},
						title : '未生成额度到账通知单列表信息',
						selType : 'checkboxmodel',
						selModel : {
							mode : 'multi',
							checkOnly : true
						},
						store : store1,
						columns : column1,
						loadMask : {
							msg : '数据加载中,请稍等...'
						},
						bbar : pagetool
					}
  	                ];
  	 //查询区结束
  	 //初始化页面开始
  	 Ext.StatusUtil.createViewport(buttonItems, queryItems, function() {
 		Ext.StatusUtil.initPage(Ext.getCmp("admdiv"), Ext.getCmp("taskState"));
 		// 默认设置为未生成
 		Ext.getCmp('taskState').setValue("001");
 	});
  	 //初始化页面结束
  	gridPanel=Ext.getCmp("planRecordedNoteCreateQuery");
});
	
/*******************************************************************************
 * 切换状态
 * 
 * @return
 */
function selectVoucherStore(combo, newValue, oldValue, eOpts){
	var voucherState = Ext.getCmp('voucherState').getValue();
	if(voucherState== '4'||voucherState== '5'){
		Ext.StatusUtil.batchEnable("uncreate");
	}else{
		Ext.StatusUtil.batchDisable("uncreate");
	}
	if(oldValue != undefined || initialLoad) {
		refreshData();
	}
}
/*******************************************************************************
 * 
 * 切换状态
 * 
 * @return
 */
function selectState(combo, taskState, oldValue, eOpts) {
	var grid = Ext.getCmp("planRecordedNoteCreateQuery");
	var pager = Ext.ComponentQuery.query("pagingtoolbar")[0];
	
	
	if ("001" == taskState) {
		Ext.StatusUtil.batchEnable("back,send,recordAccount,refresh,look");
		Ext.StatusUtil.batchDisable("again");
		// 重新绑定grid
		if(oldValue) {
			grid.setTitle("未生成额度到账通知单列表信息");
			grid.reconfigure(store1, column1);
			// 重新绑定分页工具栏
			pager.bind(store1);
		}
		Ext.get("agency1").setVisible(false);
		Ext.getCmp('voucherState').setValue("");
		Ext.get("voucherState").setVisible(false);
		
		
	} else if ("002" == taskState) {
		
		Ext.StatusUtil.batchEnable("again,refresh,look");
		Ext.StatusUtil.batchDisable("back,send,recordAccount");
		grid.setTitle("已生成额度到账通知单列表信息");
		grid.reconfigure(store2, column2);
		// 重新绑定分页工具栏
		pager.bind(store2);
		Ext.get("agency1").setVisible(true);
		Ext.getCmp('voucherState').setValue("");
		Ext.get("voucherState").setVisible(true);
	}
	
}

/********************************************
 * 发送
 * @return {TypeName} 
 */

function sendPlanAgentNote() {
	var records = gridPanel.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请选中一条凭证信息！");
		return;
	}
	var billIds = [];
	Ext.Array.each(records, function(model) {
		billIds.push(model.get("plan_agent_note_id"));
	});
	var myMask = new Ext.LoadMask(Ext.getBody(), {
		msg : '后台正在处理中，请稍后....',
		removeMask : true
	// 完成后移除
			});
	myMask.show();
	Ext.Ajax.request( {
		url : '/realware/createPlanRecordedNote.do',
		method : 'POST',
		timeout : 180000, // 设置为3分钟
		params : {
			billIds : Ext.encode(billIds),
			menu_id :  Ext.PageUtil.getMenuId()
		},
		success : function(response, options) {
			succAjax(response, myMask);
			//myMask.hide();
			refreshData();
		},
		failure : function(response, options) {
			failAjax(response, myMask);
			//myMask.hide();
			refreshData();
		}
	});

}
/*******************************************************************************
* 撤销生成
* @uncreate
*/
//TODO
function unCreatePlanRecordedNotes(){
	var records = gridPanel.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请选中一条凭证信息！");
		return;
	}
	var reqIds = "";
	for (var i = 0; i < records.length; i++) {
		reqIds += records[i].get("plan_recorded_note_id");
		if (i < records.length - 1)
			reqIds += ",";
	}
	var myMask = new Ext.LoadMask(Ext.getBody(), {
		msg : '后台正在处理中，请稍后....',
		removeMask : true
	// 完成后移除
		});
	myMask.show();
	Ext.Ajax.request({
		url : '/realware/unCreatePlanRecordedNotes.do',
		method : 'POST',
		timeout : 180000, // 设置为3分钟
		params : {
			billIds : reqIds
		},
		success : function(response, options) {
			succAjax(response, myMask,true);
		},
		failure : function(response, options) {
			failAjax(response, myMask);
			refreshData();
		}
	});

}

/********************************************
 * 重新发送
 * @return {TypeName} 
 */
function sendPlanAgentNoteagain(){
	var records = gridPanel.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请选中一条凭证信息！");
		return;
	}
	else {
		var billIds = null;
		Ext.Array.each(records, function(model) {
					billIds = billIds + model.get("plan_recorded_note_id") + ",";
				});
		var billTypeId=null;
		var billTypeId = records[0].get("bill_type_id");
		var myMask = new Ext.LoadMask(Ext.getBody(), {
			msg : '后台正在处理中，请稍后....',
			removeMask : true
				// 完成后移除
			});
		myMask.show();
		Ext.Ajax.request({
					url : '/realware/sendAsspVoucher.do',
        			method: 'POST',
					timeout:180000,  //设置为3分钟
					params : {
						billIds : billIds.substring(0, billIds.length - 1),
						billTypeId:billTypeId,
						menu_id :  Ext.PageUtil.getMenuId()
					},
					success : function(response, options) {
						succAjax(response, myMask);
						refreshData();
					},
					failure : function(response, options) {
						failAjax(response, myMask);
						refreshData();
					}
				});
	}
}
/*********************************************************************************
 * 查看凭证
 * 
 */
function lookvoucher(gridPanel){
	var taskState = Ext.getCmp('taskState').getValue();	
	var idName = null;
	//如果是未生成或者是已退回，则传递plan_agent_note_id
	if('001' == taskState||'007' == taskState||'003' == taskState)
		idName = "plan_agent_note_id";
	else if ('002' == taskState)
		idName = 'plan_recorded_note_id';
	lookOCX(gridPanel.getSelectionModel().getSelection(),idName);
}
/*******************************************************************************
 * 查询
 * 
 * @return
 */
function refreshData() {
	Ext.getCmp("planRecordedNoteCreateQuery").getStore().loadPage(1);
}
	/**
	 * 补录账号方法
	 * @return
	 */
		function recordAccount(){
			var records = Ext.PageUtil.validSelect(Ext.getCmp("planRecordedNoteCreateQuery"),1);
			if(records == null){
				return;
			}
			Ext.Ajax.request({
				url : '/realware/loadAgencyZeros.do',
				method : 'POST',
				timeout : 180000, // 设置为3分钟
				params : {
				     admdiv_code:Ext.getCmp("admdiv").getValue(),
				     menu_id :  Ext.PageUtil.getMenuId()
				},
				// 提交成功的回调函数
				success : function(response, options) {
					var agencyZero =  Ext.create('Ext.data.Store', {
						fields : ['account_no', 'account_name', 'bank_name'],
						data : response
					  });
					Ext.widget('window', {
						title : '补录账号',
						width : 370,
						height :200,
						layout : 'fit',
						resizable : false,
						modal : true,
						items : Ext.widget('form', {
							bodyStyle : 'padding:20px 20px 5px',
							defaults : {
								width : 320,
								labelWidth : 140
							},
							defaultType : 'textfield',
							items : [ {
								fieldLabel : '单位零余额账号',
								name : 'pay_account_no',
								id : 'payaccountno',
								allowBlank : false,
								xtype : 'combo',
								dataIndex : 'account_no',
								displayField: 'account_no',
								emptyText: '请选择',
								valueField: 'account_no',
								editable :false,
								store: agencyZero,
								listeners : {
										'change' : function(){
								            var index = agencyZero.find('account_no',Ext.getCmp('payaccountno').getValue());   

								            Ext.getCmp('payaccountname').setValue(agencyZero.getAt(index).get('account_name')); 
								            
								            Ext.getCmp('payaccountbank').setValue(agencyZero.getAt(index).get('bank_name')); 
										}
								}
							}, {	
								fieldLabel : '单位零余额账号名称',
								name : 'pay_account_name',
								id : 'payaccountname',
								allowBlank : false,
								readOnly : true
							}, {
								fieldLabel : '单位零余额账号所属银行',
								name : 'pay_account_bank',
								id : 'payaccountbank',
								allowBlank : false,
								readOnly : true
							}],
						buttons : [{
									text : '确定',
									handler : function() {
									var form = this.up('form').getForm();
									var window = this.up('window');
									var reqIds = []; // 凭证主键字符串
									Ext.Array.each(records, function(model) {
										reqIds.push(model.get('plan_agent_note_id'));
									});
									
									var myMask = new Ext.LoadMask(Ext.getBody(), {
										msg : '后台正在处理中，请稍后....',
										removeMask : true
													});
									myMask.show();
									if (form.isValid()) {
									//	form.submit({
										Ext.Ajax.request({
													url : '/realware/recordAccount.do',
													method : 'POST',
													timeout : 180000, // 设置为3分钟
													params: {
														accountNo:Ext.getCmp("payaccountno").getValue(),
														accountNmae:Ext.getCmp("payaccountname").getValue(),
														accountBank:Ext.getCmp("payaccountbank").getValue(),
														billIds : Ext.encode(reqIds)
													},
												//	success : function(form,action) {
													success : function(response, options) {
														Ext.PageUtil.succAjax(response, myMask, null,"补录账号成功！");
														window.close();
														refreshData();
													},
													failure : function(response, options) {
														failAjax(response, myMask);
														myMask.hide();
														window.close();
													}
										});
									}}
								}, {
									text : '取消',
									handler : function() {
										this.up('window').close();
									}
								} ]
						})
					}).show();
				},
				// 提交失败的回调函数
				failure : function(response, options) {
					if (response.status == -1) {
						Ext.Msg.alert("系统提示", "加载账户信息超时，可能存在网络异常，检查后请重试...");
					} else {
						Ext.Msg.show({
								title : '失败提示',
								msg : response.responseText,
								buttons : Ext.Msg.OK,
								icon : Ext.MessageBox.ERROR
								});
						}
					}
			});
		}

