/*******************************************************************************
 * 主要用于授权支付托收
 * 
 * @type
 */

/***
 * 引入需要使用的js文件
 */
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/recommend.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/operationLog.js"></scr' + 'ipt>');
document.write('<scr'+ 'ipt type="text/javascript" src="/realware/resources/js/share/ocxVoucher.js"></scr'+ 'ipt>');
document.write('<scr'+ 'ipt type="text/javascript" src="/realware/resources/js/Common_Validate.js"></scr'+ 'ipt>');




/**
 * 数据项
 */

var fileds = ["admdiv_code", "year","vt_code", "create_date",
		"pay_collection_code","pay_collection_id", "agency_code", "agency_name",
		"payee_account_no", "payee_account_name", "payee_account_bank",
		"pay_account_no", "pay_account_name", "pay_account_bank", "pay_amount",
		"pay_summary_name", "send_flag","remark","last_ver","task_id","coll_type_code","coll_type_name","bill_type_id","biz_type_id"];

/**
 * 列名
 */
var header = " 凭证号|pay_collection_code|140,支付金额|pay_amount|100,收款人账号|payee_account_no,收款人名称|payee_account_name|140,"
			+ "收款人银行|payee_account_bank|140,付款人账号|pay_account_no,付款人名称|pay_account_name|140,付款人银行|pay_account_bank|140," 
			+"托收类型|coll_type_name|100,申请日期|create_date|140,基层预算单位编码|agency_code,基层预算单位名称|agency_name,用途名称|pay_summary_name,备注|remark";

var voucherPanel = null;

var comboCollType = Ext.create('Ext.data.Store', {
			fields : ['id','code', 'name'],
			proxy : {					
					type : 'ajax',
					url : '/realware/loadElementValue.do',
					actionMethods : {
						read : 'POST'
					},
					reader : {
						type : 'json'
					}
				},
			autoload : false
			
		});

/*******************************************************************************
 * 界面加载
 */
Ext.onReady(function() {
	Ext.QuickTips.init();
	voucherPanel = getGrid("loadPayCollections.do", header, fileds, true, true);
	voucherPanel.setHeight(document.documentElement.scrollHeight - 90);
		// 根据查询条件检索数据
	voucherPanel.getStore().on('beforeload', function(thiz, options) {
			beforeload(Ext.getCmp("refundCheckQuery"), options, Ext.encode(fileds));
	});
	
	voucherPanel.title = "托收申请信息";
	 var buttonItems = [{
							id : 'input',
						handler : function() {
							voucherInput();
						}
					}, {
						id : 'signsend',
						handler : function() {
							voucherSend(true);
						}
					}, {
						id : 'send',
						handler : function() {
							voucherSend(false);
						}
					}, {
						id : 'delete',
						handler : function() {
							var records = voucherPanel.getSelectionModel().getSelection();
							if (records.length == 0) {
								Ext.Msg.alert("系统提示", "请选中要删除的托收信息！");
								return;
							}else{
								Ext.Msg.confirm("系统提示","是否要删除选中的凭证？",function(e) {
									if (e == "yes") {
										voucherInvalidate();
									}
								});	
							}
						}
					}, {
						id :'look',
						handler : function() {
							lookOCX(voucherPanel.getSelectionModel().getSelection(),"pay_collection_id");
						}
					}, {
						id : 'log',
						handler : function() {
							var records = voucherPanel.getSelectionModel().getSelection();
							taskLog(records,"pay_collection_id");
						}
					}, {
						id : 'refresh',
						handler : function() {
							refreshData();
						}
					}];
				
     var queryItems=[{
				    	title : "查询区",
				    	id : 'refundCheckQuery',
				    	bodyPadding : 8,
				    	layout : 'hbox',
				    	defaults : {
				    		margins : '3 5 0 0'
				    	},
				    	items : [{
									id : 'taskState',
									fieldLabel : '当前状态',
									xtype : 'combo',
									dataIndex : 'task_status',
									displayField : 'status_name',
									emptyText : '请选择',
									valueField : 'status_code',
									labelWidth : 60,
									width : 160,
									editable : false,
									listeners : {
										'change' : selectState
									}
								}, {
									id : 'admdivCode',
									fieldLabel : '所属财政',
									xtype : 'combo',
									dataIndex : 'admdiv_code',
									displayField : 'admdiv_name',
									emptyText : '请选择',
									valueField : 'admdiv_code',
									labelWidth : 60,
									width : 160,
									store : comboAdmdiv,
									editable : false,
									listeners : {
										'change' : selectAdmdiv
									}
								}, {
									id : 'code',
									fieldLabel : '凭证号',
									xtype : 'textfield',
									symbol : '>=',
									labelWidth : 45,
									width : 140,
									dataIndex : 'pay_collection_code '
								}, {
									id : 'codeEnd', 
									fieldLabel : '至',
									xtype : 'textfield',
									labelWidth : 15,
									width : 120,
									symbol : '<=',
									dataIndex : 'pay_collection_code'
								}, {
//									id : 'vouDate',
//									fieldLabel : '申请日期',
//									xtype : 'datefield',
//									dataIndex : 'create_date',
//									format : 'Ymd',
//									labelWidth : 60,
//									width : 180,
//									symbol:'=',
//									data_type:'date'
										
									id : 'vouDate',
									fieldLabel : '申请日期',
									xtype : 'datefield',
									dataIndex : 'create_date',
									format : 'Y-m-d',
									labelWidth : 60,
									width : 160,
									symbol : '=',
									data_type:'date',
									data_format:'yyyy-MM-dd',
									maxValue : new Date()
								}]
     }, voucherPanel ];
    Ext.StatusUtil.createViewport(buttonItems, queryItems, function() {
		Ext.StatusUtil.initPage(Ext.getCmp("admdivCode"), Ext.getCmp("taskState"));
		Ext.getCmp('taskState').setValue("001");
    });
});

/*******************************************************************************
 * 切换状态
 * 
 * @return
 */

function selectState(combo, taskState, oldValue, eOpts) {
	if ("001"== taskState) {
		Ext.StatusUtil.batchEnable("input,delete,signsend,log,refresh");
		Ext.StatusUtil.batchDisable("look,send");
	} else if ("002" == taskState) {
		Ext.StatusUtil.batchEnable("send,look,log,refresh");
		Ext.StatusUtil.batchDisable("input,delete,signsend");
	}
}

function selectAdmdiv(combo, newValue, oldValue, eOpts) {
	comboCollType.load({
					params : {
						admdiv_code :  newValue,
						ele_code : 'COLL_TYPE'
					}
	});
}


/*******************************************************************************
 * 录入
 */
function voucherInput() {
	Ext.Ajax.request({
		url : '/realware/loadAgencyZeros.do',
		method : 'POST',
		timeout : 180000, // 设置为3分钟
		params : {
		     admdiv_code:Ext.getCmp("admdivCode").getValue(),
		     menu_id :  Ext.PageUtil.getMenuId()
		},
		// 提交成功的回调函数
		success : function(response, options) {
			var agencyZero =  Ext.create('Ext.data.Store', {
				fields : ['account_no', 'account_name', 'bank_name','agency_code','agency_name','account_no#account_name'],
				data : response
			  });		
			if(agencyZero!=null && agencyZero !=undefined){
				Ext.widget('window', {
				title : '授权支付托收录入',
				width : 370,
				height :430,
				layout : 'fit',
				resizable : false,
				modal : true,
				items : Ext.widget('form', {
					bodyStyle : 'padding:5px 5px 0',
					defaults : {
						width : 300,
						labelWidth : 120
					},
					defaultType : 'textfield',
					items : [ {
						fieldLabel : '付款人账号',
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
								'select' : function(){
						            var index = agencyZero.find('account_no',Ext.getCmp('payaccountno').getValue()); 

						            Ext.getCmp('payaccountname').setValue(agencyZero.getAt(index).get('account_name')); 						            
						            Ext.getCmp('payaccountbank').setValue(agencyZero.getAt(index).get('bank_name')); 
						            Ext.getCmp('agency_code1').setValue(agencyZero.getAt(index).get('agency_code')); 
						            Ext.getCmp('agency_name1').setValue(agencyZero.getAt(index).get('agency_name')); 
								}
						}
					},{	
						fieldLabel : '付款人名称',
						name : 'pay_account_name',
						id : 'payaccountname',
						allowBlank : false,
						readOnly : true
					}, {
						fieldLabel : '付款人银行',
						name : 'pay_account_bank',
						id : 'payaccountbank',
						allowBlank : false,
						readOnly : true
					}, ,{
						fieldLabel : '基层预算单位编码',
						name : 'agency_code',
						id : 'agency_code1',
						allowBlank : false
					}, {
						fieldLabel : '基层预算单位名称',
						allowBlank : false,
						name : 'agency_name',
						id : 'agency_name1'
					},
					{
						id :'collCode',
						name : 'coll_type_code',
						xtype : 'combo',
						fieldLabel : '托收类型',
						displayField: 'name',
						emptyText: '请选择',
						valueField: 'code',
						allowBlank : false,
						editable :false,
						queryMode : 'local',
						store: comboCollType
					}, {
						fieldLabel : '收款人账号',
					    xtype: 'textfield',
						name : 'payee_account_no',
						vtype:"accountId",
						allowBlank : false
					}, {
						fieldLabel : '收款人名称',
						name : 'payee_account_name',
						allowBlank : false
					}, {
						fieldLabel : '收款人银行',
						name : 'payee_account_bank',
						allowBlank : false
					}, {
						fieldLabel : '支付金额',
						name : 'pay_amount',
						xtype : 'numberfield',
						minValue : 0,
						maxLength : 16,
						allowNegative: false,  //不能为负数  
          				decimalPrecision: 2,   //小数精确位数
						allowBlank : false
					}, {
						fieldLabel : '用途名称',
						name : 'pay_summary_name',
						allowBlank : false
					}, {
						name : 'remark',
						fieldLabel : '备注',
						width : '300',
						xtype : 'textareafield',
						anchor : '100%'
				} ],
				buttons : [{
							text : '确定',
							handler : function() {
							var form = this.up('form').getForm();
							var window = this.up('window');
							if (form.isValid()) {
								form.submit({
											url : '/realware/addPayCollection.do',
											method : 'POST',
											timeout : 180000, // 设置为3分钟
											waitTitle : '提示',
											waitMsg : '后台正在处理中，请您耐心等候...',
											params: {
												admdiv_code : Ext.getCmp("admdivCode").getValue()
											},
											success : function(form, action) {
												succForm(form, action);
												window.close();
												refreshData();
											},
											failure : function(form, action) {
												failForm(form, action);
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
			}
		},
		// 提交失败的回调函数
		failure : function(response, options) {
			if (response.status == -1) {
				Ext.Msg.alert("系统提示", "托收录入超时，可能存在网络异常，检查后请重试...");
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


/**
 * 签章发送
 */
function voucherSend(isbool) {
	var records = voucherPanel.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请选中托收信息！");
		return;
	} else {
		var reqIds = []; // 凭证主键字符串
		var reqVers = []; // 凭证lastVer字符串
		Ext.Array.each(records, function(model) {
				reqIds.push(model.get("pay_collection_id"));
			});
		var myMask = new Ext.LoadMask(Ext.getBody(), {
						msg : '后台正在处理中，请稍后....',
						removeMask : true // 完成后移除
		});
		myMask.show();
		Ext.Ajax.request({
					url : '/realware/sendPayCollection.do',
					method : 'POST',
					timeout : 180000, // 设置为3分钟
					params : {
						billIds : Ext.encode(reqIds),
						isFlow : isbool,
						menu_id :  Ext.PageUtil.getMenuId()
					},
					// 提交成功的回调函数
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
	}
}


/*******************************************************************************
 * 删除
 */
function voucherInvalidate() {
	var records = voucherPanel.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请选中凭证信息！");
		return;
	} else {
		var reqIds = []; // 凭证主键字符串
		Ext.Array.each(records, function(model) {
				reqIds.push(model.get("pay_collection_id"));
			});
		var myMask = new Ext.LoadMask(Ext.getBody(), {
						msg : '后台正在处理中，请稍后....',
						removeMask : true // 完成后移除
		});
		myMask.show();
		Ext.Ajax.request({
				url : '/realware/delPayCollection.do',
				method : 'POST',
				timeout : 180000, // 设置为3分钟
				params : {
					billIds : Ext.encode(reqIds),
					menu_id :  Ext.PageUtil.getMenuId()
				},
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
	}

}


/*******************************************************************************
 * 刷新
 * 
 * @return
 */
function refreshData() {
	voucherPanel.getStore().loadPage(1);
}