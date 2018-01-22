﻿﻿﻿/***
 * 引入需要使用的js文件
 */
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/recommend.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/operationLog.js"></scr' + 'ipt>');

var fileds = ["urgent_flag","realpay_voucher_code", "pay_amount", "payee_account_no",
		"payee_account_name", "payee_account_bank","payee_account_bank_no" ,"pay_account_no",
		"pay_account_name", "pay_account_bank", 
		"fund_type_code", "fund_type_name", "pay_type_code", "pay_type_name",
		"pay_summary_code", "pay_summary_name", "pay_date", "print_num",
		"print_date", "voucherflag", "task_id", "bill_type_id",
		"realpay_voucher_id", "return_reason","create_date","pb_set_mode_code","pb_set_mode_name","last_ver","urgent_flag",
		"ori_pay_amount","ori_payee_account_bank_no","agency_code","agency_name","exp_func_code","exp_func_name","clear_bank_code","clear_bank_name","audit_flag"];


var header = "退回原因|return_reason,拨款凭证编码|realpay_voucher_code,拨款金额|pay_amount,收款行行号|payee_account_bank_no|100,银行结算方式名称|pb_set_mode_name|140,收款人账号|payee_account_no|140,收款人名称|payee_account_name|140,收款人银行|payee_account_bank|140,付款人账号|pay_account_no|140,付款人|pay_account_name,付款人开户行|pay_account_bank|140,"
		+ "资金性质编码|fund_type_code|140,资金性质|fund_type_name|140,支付方式编码|pay_type_code|140,支付方式|pay_type_name|140,功能科目编码|exp_func_code|140,功能科目名称|exp_func_name|140,附言|pay_summary_name|140,支付日期|pay_date|140,打印次数|print_num,"
		+ "打印日期|print_date,凭证状态|voucherflag";

var gridPanel1 = null;

//银行结算方式
var comboBankSetMode = Ext.create('Ext.data.Store', {
			fields : ['name','value'],
			proxy : {					
					type : 'ajax',
					url : '/realware/loadbanksetmode.do',
					reader : {
						type : 'json'
					}
				},
			autoload : false
		});

//资金性质
var comboFundType = Ext.create('Ext.data.Store', {
			fields : ['id','code', 'name'],
			proxy : {					
					type : 'ajax',
					url : '/realware/loadElementValue.do',
					reader : {
						type : 'json'
					}
				},
			autoload : false
		});

//支付方式
var comboPayType = Ext.create('Ext.data.Store', {
	fields : ['id','code', 'name'],
	proxy : {					
			type : 'ajax',
			url : '/realware/loadElementValue.do',
			reader : {
				type : 'json'
			}
		},
	autoload : false
});

//付款账户，财政国库资金实有资金账户
var comboPayAccount = Ext.create('Ext.data.Store', {
	fields : ['account_id','account_no','account_name', 'bank_name'],
	proxy : {					
			type : 'ajax',
			url : '/realware/loadAccountValue.do',
			reader : {
				type : 'json'
			}
		},
	autoload : false
});

Ext.onReady(function() {
	Ext.QuickTips.init();
	gridPanel1 = getGrid(loadUrl, header, fileds, true, true);
	gridPanel1.setHeight(document.documentElement.scrollHeight - 85);
	gridPanel1.getStore().on('beforeload', function(thiz, options) {
		beforeload(Ext.getCmp("rpVoucherQuery"), options, Ext.encode(fileds));
	});
	var buttonItems=[{
		         id : 'input',
		         handler : function() {
			    	 inputRealPay();
		       	 	}
	            },{
		         id : 'update',
		         handler : function() {
			    	 updateRealPay();
		       	 	}
	            },{
		         id : 'audit',
		         handler : function() {
			    	 auditRealPay();
		       	 	}
	            },{
		         id : 'delete',
		         handler : function() {
			    	 deleteRealPay();
		       	 	}
	            },{
		         id : 'signsend',
		         handler : function() {
			     	  acceptRealPay();
		        	}
	            },{
		         id : 'log',
		         handler : function() {
			     	 taskLog(gridPanel1.getSelectionModel().getSelection(),"realpay_voucher_code");
		       		}
	           }, {
		        id : 'refresh',
		        handler : function() {
			   		 refreshData();
		      		}
	        	}];
	   var queryItems=[{
		     title:'查询区',
		     id : 'rpVoucherQuery',
			 bodyPadding : 5,
			 layout : 'column',
			 defaults : {
				margins : '5 10 10 0'
			},
		   items:[{
				id : 'taskState',
				fieldLabel : '当前状态',
				xtype : 'combo',
				dataIndex : 'task_status',
				displayField : 'status_name',
				emptyText : '请选择',
				valueField : 'status_code',
				labelWidth : 60,
				width : 240,
				editable : false,
				listeners : {
					'change' : selectState
				}
			}, {
				id : 'admdivCom',
				fieldLabel : '所属财政',
				xtype : 'combo',
				dataIndex : 'admdiv_code',
				displayField : 'admdiv_name',
				emptyText : '请选择',
				valueField : 'admdiv_code',
				labelWidth : 60,
				width : 240,
				editable : false,
				store : comboAdmdiv,
				listeners : {
					'change' : function(){
						selectAdmdiv(true);
					}
				}
	              
			}]	
	   },gridPanel1];
	   
	    Ext.StatusUtil.createViewport(buttonItems, queryItems, function() {
	        var b = Ext.getCmp('payee_account_bank_no');
	        var m = new Ext.form.field.Text({
	        regex:/^\d{1,12}$/,
	        regexText:'该域不能超过12位'
	        });
	        b.setEditor(m);
	        
	      //添加监听事件判断编辑行是否可编辑
	     	gridPanel1.addListener("beforeedit", function(combo, newValue, oldValue, eOpts) {
				var taskState = Ext.getCmp('taskState').getValue();
				if(taskState!='001'){
					return false;
				}
				return true;
			});
	        Ext.StatusUtil.initPage(Ext.getCmp("admdivCom"), Ext.getCmp("taskState"));
			// 默认设置为未生成
			Ext.getCmp('taskState').setValue("001");
});	   
});

function selectAdmdiv(refresh,id) {
	var admdiv = Ext.getCmp('admdivCom').getValue();		
	if ("" == admdiv || null == admdiv) return;		
	comboFundType.load({
		params : {
			admdiv_code : refresh == true? Ext.getCmp('admdivCom').getValue() : Ext.getCmp(id).getValue(),
			ele_code : 'FUND_TYPE'
		}
	});
	comboPayType.load({
		params : {
			admdiv_code : refresh == true? Ext.getCmp('admdivCom').getValue() : Ext.getCmp(id).getValue(),
			ele_code : 'PAY_TYPE'
		}
	});
	comboPayAccount.load({
		params : {
			admdiv_code : refresh == true? Ext.getCmp('admdivCom').getValue() : Ext.getCmp(id).getValue(),
			account_type : 5
		}
	});
	comboBankSetMode.load({});
}

/*******************************************************************************
 * 切换状态
 * 
 * @return
 */
function selectState() {
	var taskState = Ext.getCmp('taskState').getValue();
	var store = null;
	var column = null;
	if ("001" == taskState) {
		Ext.StatusUtil.batchEnable("input,update,audit,delete");
		gridPanel1.down("#return_reason").hide();
	} else if ("002" == taskState) {
		Ext.StatusUtil.batchDisable("input,update,audit,delete");
		gridPanel1.down("#return_reason").hide();
	}else if("003" == taskState){
		Ext.StatusUtil.batchEnable("update,audit,delete");
		Ext.StatusUtil.batchDisable("input");
		gridPanel1.down("#return_reason").show();
	}
}

function refreshData() {
	var a = gridPanel1.getStore().getProxy();
	var taskState = Ext.getCmp('taskState').getValue();
	//如果是未送审 
	if( '001' == taskState ){
		a.url = "/realware/loadRealPayWithBankNo.do";
	}else{
		a.url = "/realware/loadRealPay.do";
	}
	gridPanel1.getStore().loadPage(1);
}



//是否同行支付单选框
var isSameBankRadio = new Ext.form.RadioGroup({
	id : 'isSameBankRadio',
	fieldLabel: '是否同行',
	items: [{
	    name: 'sameBank',
	    inputValue: '0',
	    boxLabel: '是',
	    checked: true
	}, {
	    name: 'sameBank',
	    inputValue: '1',
	    boxLabel: '否'
	}]
});

/**
 * 付款人账户选择事件，给付款人账号、名称、银行赋值
 */
function selectPayAccount() {
	var payAccountId = Ext.getCmp('payAccount').getValue();
	for(var i =0;i<comboPayAccount.getCount();i++){
		var payAccount = comboPayAccount.getAt(i);
		if(payAccountId == payAccount.get('account_id')){
			Ext.getCmp('payAccountNo').setValue(payAccount.get('account_no'));
			Ext.getCmp('payAccountName').setValue(payAccount.get('account_name'));
			Ext.getCmp('payAccountBank').setValue(payAccount.get('bank_name'));
			break;
		}
	}
}

var required = '<span style="color:red;font-weight:bold" data-qtip="Required">*</span>';
var inputFlag = true;
//退款单信息录入窗体
var  inputWindow =null;	
function initWindow(){
	if (inputWindow == null) {
		inputWindow = new Ext.Window({
					title : '拨款单信息录入',
					width : 600,
					height : 380,
					plain : true,
					layout : 'fit',
					closeAction : 'hide',
					items : [
							{
								id : 'realPayForm',
								xtype : 'form',
								defaultType : 'textfield',
								defaults : {
									padding : '0 3 0 3'
								},
								bodyPadding : '3 3 3 3',
								layout : {
									type : 'table',
									columns : 2
								},
								items : [{
									  id: 'voucherNo',
									  name: 'realpay_voucher_code',
									  allowBlank: false,
									  fieldLabel: '拨款单号',
									  afterLabelTextTpl: required,
									  regex: /^([\w\d\u4e00-\u9fa5]{1,42})$/,
									  regexText: '单号只能是数字字母和汉字，长度不超过42'
									},{
									  id: 'payAmt',
									  name: 'ori_pay_amount',
									  xtype: 'numberfield',
									  allowBlank: false,
									  allowNegative: false,
									  maxValue : 10000000000,
									  maxText:"该项最大金额为100亿元",
									  decimalPrecision: 2,// 不能为负数，小数精确位数
									  afterLabelTextTpl: required,//*必填标志
									  fieldLabel: '拨款金额'
									},{
									  id: 'payAccount',
									  xtype: 'combo',
									  fieldLabel: '付款人账户',
									  displayField: 'account_name',
									  emptyText: '请选择',
									  valueField: 'account_id',
									  queryMode: 'local',
									  editable: false,
									  afterLabelTextTpl: required,
									  store: comboPayAccount,
									  listeners: {
									    'change': selectPayAccount
									  }
									},
									{
									  id: 'bankSetMode',
									  xtype: 'combo',
									  fieldLabel: '银行结算方式',
									  displayField: 'name',
									  emptyText: '请选择',
									  valueField: 'value',
									  queryMode: 'local',
									  editable: false,
//									  value: '1',
									  afterLabelTextTpl: required,
									  store: comboBankSetMode
									},{
									  id: 'payAccountNo',
									  name: 'pay_account_no',
									  allowBlank: false,
									  readOnly: true,
									  afterLabelTextTpl: required,
									  fieldLabel: '付款人账号'
									},{
									  id: 'payType',
									  xtype: 'combo',
									  fieldLabel: '支付方式',
									  displayField: 'name',
									  emptyText: '请选择',
									  valueField: 'code',
									  queryMode: 'local',
									  editable: false,
//									  value: '9',
									  afterLabelTextTpl: required,
									  store: comboPayType
									},{
									  id: 'payAccountName',
									  name: 'pay_account_name',
									  allowBlank: false,
									  readOnly: true,
									  afterLabelTextTpl: required,
									  fieldLabel: '付款人名称'
									},{
									  id: 'fundType',
									  xtype: 'combo',
									  fieldLabel: '资金性质',
									  displayField: 'name',
									  emptyText: '请选择',
									  valueField: 'code',
									  queryMode: 'local',
									  editable: false,
//									  value: '2',
									  afterLabelTextTpl: required,
									  store: comboFundType
									}, {
									  id: 'payAccountBank',
									  name: 'pay_account_bank',
									  allowBlank: false,
									  readOnly: true,
									  afterLabelTextTpl: required,
									  fieldLabel: '付款人银行'
									}, {
									  id: 'agencyCode',
									  name: 'agency_code',
									  //allowBlank: false,
									  fieldLabel: '预算单位编码',
									  regex: /^([\w\d\u4e00-\u9fa5]{1,42})$/,
									  regexText: '预算单位编码只能是数字字母，长度不超过42'
									}, {
									  id: 'payeeAccountNo',
									  name: 'payee_account_no',
									  allowBlank: false,
									  fieldLabel: '收款人账号',
									  afterLabelTextTpl: required,
									  regex: /^([\w\d\u4e00-\u9fa5]{1,42})$/,
									  regexText: '收款人账号只能是数字，长度不超过42'
									}, {
									  id: 'agencyName',
									  name: 'agency_name',
									  //allowBlank: false,
									  fieldLabel: '预算单位名称',
									  regex: /^([\w\d\u4e00-\u9fa5]{1,60})$/,
									  regexText: '预算单位名称只能是数字字母和汉字，长度不超过60'
									},{
									  id: 'payeeAccountName',
									  name: 'payee_account_name',
									  allowBlank: false,
									  fieldLabel: '收款人名称',
									  afterLabelTextTpl: required,
									  regex: /^([\w\d\u4e00-\u9fa5]{1,120})$/,
									  regexText: '收款人名称只能是数字字母和汉字，长度不超过120'
									},{
									  id: 'expFuncCode',
									  name: 'exp_func_code',
									  allowBlank: false,
									  fieldLabel: '功能科目编码',
									  afterLabelTextTpl: required,
									  regex: /^([\w\d\u4e00-\u9fa5]{1,42})$/,
									  regexText: '功能科目编码只能是数字字母，长度不超过42'
									},{
									  id: 'payeeAccountBank',
									  name: 'payee_account_bank',
									  allowBlank: false,
									  fieldLabel: '收款人银行',
									  afterLabelTextTpl: required,
									  regex: /^([\w\d\u4e00-\u9fa5]{1,60})$/,
									  regexText: '银行名称只能是数字字母和汉字，长度不超过60'
									},{
									  id: 'expFuncName',
									  name: 'exp_func_name',
									  allowBlank: false,
									  fieldLabel: '功能科目名称',	
									  afterLabelTextTpl: required,
									  regex: /^([\w\d\u4e00-\u9fa5]{1,60})$/,
									  regexText: '功能科目名称只能是数字字母和汉字，长度不超过60'
									},{
									  id: 'payeeAccountBankNo',
									  name: 'ori_payee_account_bank_no',
									  //allowBlank: false,
									  fieldLabel: '收款人行号',
									  regex: /^\d{1,12}$/,
									  regexText: '收款行号只能是数字,长度不能超过12位'
									},{
									  id: 'clearBankCode',
									  name: 'clear_bank_code',
									  allowBlank: false,
									  fieldLabel: '人民银行编码',
									  afterLabelTextTpl: required,
									  regex: /^([\w\d\u4e00-\u9fa5]{1,42})$/,
									  regexText: '人民银行编码只能是数字字母，长度不超过42'
									},{
									  xtype: 'panel',
									  layout: 'hbox',
									  baseCls: 'x-plain',
									  items: [
									    isSameBankRadio,
									    {
									      xtype: 'button',
									      text: '行号查询',
									      style: 'margin-left:130px;',
									      width: 70,
									      handler: function(){
									        var payeeAccountBank=Ext.getCmp("payeeAccountBank").getValue();
									        if(Ext.isEmpty(payeeAccountBank)){
									          Ext.Msg.alert("系统提示",
									          "请输入收款人银行名称！");return;
									        }
									        addBankNo();
									      }
									    }
									  ]
									}, {
										  id: 'clearBankName',
										  name: 'clear_bank_name',
										  allowBlank: false,
										  fieldLabel: '人民银行名称',
										  afterLabelTextTpl: required,
										  regex: /^([\w\d\u4e00-\u9fa5]{1,60})$/,
										  regexText: '人民银行名称只能是数字字母和汉字，长度不超过60'
										}, {
											id : 'addWord',
											fieldLabel : '附言',
											colspan : 2,
											width : 520,
										    regex: /^([\w\d\u4e00-\u9fa5]{1,30})$/,
									        regexText: '附言只能是数字字母和汉字，汉字长度不超过30'
										}, {
										  id: 'voucherId',
										  name: 'realpay_voucher_id',
										  xtype: 'hiddenfield'
										},
										{
										  id: 'lastVer',
										  name: 'last_ver',
										  xtype: 'hiddenfield'
										},
										{
										  id: 'auditFlag',
										  name: 'audit_flag',
										  xtype: 'hiddenfield'
										}]
							}
					         ],
					buttons : [ {
						formBind : true,
						text : '确定',
						handler : function() {
							if(!Ext.getCmp('realPayForm').getForm().isValid()) return;						
							var admdivCode = Ext.getCmp("admdivCom").getValue();
	
							var voucherId = inputFlag==true?0:Ext.getCmp("voucherId").getValue();
							var lastVer = inputFlag==true?0:Ext.getCmp("lastVer").getValue();
							var auditFlag = inputFlag==true?0:Ext.getCmp("auditFlag").getValue();
							
							var voucherNo = Ext.getCmp("voucherNo").getValue();
							if(Ext.isEmpty(voucherNo)){
								Ext.Msg.alert("系统提示", "拨款单号不能为空！");
								return;
							}
							var payAccountNo = Ext.getCmp("payAccountNo").getValue();
							if(Ext.isEmpty(payAccountNo)){
								Ext.Msg.alert("系统提示", "付款人账户不能为空！");
								return;
							}
							var payAccountName = Ext.getCmp("payAccountName").getValue();
							var payAccountBank = Ext.getCmp("payAccountBank").getValue();
							var payeeAccountNo = Ext.getCmp("payeeAccountNo").getValue();
							if(Ext.isEmpty(payeeAccountNo)){
								Ext.Msg.alert("系统提示", "收款人账号不能为空！");
								return;
							}
							var payeeAccountName = Ext.getCmp("payeeAccountName").getValue();
							if(Ext.isEmpty(payeeAccountName)){
								Ext.Msg.alert("系统提示", "收款人名称不能为空！");
								return;
							}
							var payeeAccountBank = Ext.getCmp("payeeAccountBank").getValue();
							if(Ext.isEmpty(payeeAccountBank)){
								Ext.Msg.alert("系统提示", "收款人银行不能为空！");
								return;
							}
							var payeeAccountBankNo = Ext.getCmp("payeeAccountBankNo").getValue();
							var sameBank = Ext.getCmp('isSameBankRadio').getChecked()[0].inputValue;
							if(Ext.isEmpty(payeeAccountBankNo) && sameBank=='1'){
								Ext.Msg.alert("系统提示", "跨行支付，收款行行号不能为空！");
								return ;
							}
							
							var payAmt = Ext.getCmp("payAmt").getValue();
							if (payAmt <= 0.00) {
								Ext.Msg.alert('系统提示','拨款金额必须大于0!');
								return;
							}
							
							var bankSetModeCode = Ext.getCmp("bankSetMode").getValue();
							var bankSetModeName = Ext.getCmp("bankSetMode").getRawValue();
							if(Ext.isEmpty(bankSetModeCode)){
								Ext.Msg.alert("系统提示", "银行结算方式不能为空！");
								return;
							}
							
							var payTypeCode = Ext.getCmp("payType").getValue();
							var payTypeName = Ext.getCmp("payType").getRawValue();
							if(Ext.isEmpty(payTypeCode)){
								Ext.Msg.alert("系统提示", "支付方式不能为空！");
								return;
							}
							var fundTypeCode = Ext.getCmp("fundType").getValue();
							var fundTypeName = Ext.getCmp("fundType").getRawValue();
							if(Ext.isEmpty(fundTypeCode)){
								Ext.Msg.alert("系统提示", "资金性质不能为空！");
								return;
							}
							var agencyCode = Ext.getCmp("agencyCode").getValue();
							var agencyName = Ext.getCmp("agencyName").getValue();
							var expFuncCode = Ext.getCmp("expFuncCode").getValue();
							if(Ext.isEmpty(expFuncCode)){
								Ext.Msg.alert("系统提示", "功能科目编码不能为空！");
								return;
							}
							var expFuncName = Ext.getCmp("expFuncName").getValue();
							if(Ext.isEmpty(expFuncName)){
								Ext.Msg.alert("系统提示", "功能科目名称不能为空！");
								return;
							}
							var clearBankCode = Ext.getCmp("clearBankCode").getValue();
							if(Ext.isEmpty(clearBankCode)){
								Ext.Msg.alert("系统提示", "人民银行编码不能为空！");
								return;
							}
							var clearBankName = Ext.getCmp("clearBankName").getValue();
							if(Ext.isEmpty(clearBankName)){
								Ext.Msg.alert("系统提示", "人民银行名称不能为空！");
								return;
							}
							var paySummaryName = Ext.getCmp("addWord").getValue();
							
							var data = "{\"id\":\"" + voucherId 
										+ "\",\"last_ver\":\""+ lastVer 
										+ "\",\"audit_flag\":\""+ auditFlag 
										+ "\",\"code\":\""+ voucherNo 
										+ "\",\"admdiv_code\":\""+ admdivCode 
										+ "\",\"pay_account_no\":\""+ payAccountNo 
										+ "\",\"pay_account_name\":\"" + payAccountName
										+ "\",\"pay_account_bank\":\"" + payAccountBank
										+ "\",\"payee_account_no\":\"" + payeeAccountNo
										+ "\",\"payee_account_name\":\"" + payeeAccountName
										+ "\",\"payee_account_bank\":\"" + payeeAccountBank
										+ "\",\"ori_payee_account_bank_no\":\"" + (payeeAccountBankNo||null)
										+ "\",\"ori_pay_amount\":\"" + payAmt
										+ "\",\"pb_set_mode_code\":\"" + bankSetModeCode
										+ "\",\"pb_set_mode_name\":\"" + bankSetModeName
										+ "\",\"pay_type_code\":\"" + payTypeCode
										+ "\",\"pay_type_name\":\"" + payTypeName
										+ "\",\"fund_type_code\":\"" + fundTypeCode
										+ "\",\"fund_type_name\":\"" + fundTypeName
										+ "\",\"agency_code\":\"" + (agencyCode||null)
										+ "\",\"agency_name\":\"" + (agencyName||null)
										+ "\",\"exp_func_code\":\"" + expFuncCode
										+ "\",\"exp_func_name\":\"" + expFuncName
										+ "\",\"clear_bank_code\":\"" + clearBankCode
										+ "\",\"clear_bank_name\":\"" + clearBankName
										+ "\",\"pay_summary_name\":\"" + (paySummaryName||null)+ "\"}";
							
							var url = null;
							if(inputFlag){
								url = '/realware/addRealPayVoucher.do';
							}else{
								url = '/realware/updateRealPayVoucher.do';
							}
							var myMask = new Ext.LoadMask(Ext.getBody(), {
									msg : '后台正在处理中，请稍后....',
									removeMask : true // 完成后移除
								});
							myMask.show();
							// 提交到服务器操作
							Ext.Ajax.request({
								url : url,
						        method : 'POST',
								timeout : 180000,
								jsonData : data,
								// 提交成功的回调函数
								success : function(response, options) {
									succAjax(response,myMask);
									refreshData();
								},
								// 提交失败的回调函数
								failure : function(response, options) {
									failAjax(response,myMask);
									refreshData();
								}
							});
							this.up('window').close();
						}
					}, {
						text : '取消',
						handler : function() {
							this.up('window').close();
						}
					} ]
				});  
	}
}


/**
 * 录入实拨拨款单
 */
function inputRealPay(){
	inputFlag = true;
	initWindow();
	var realPayForm = Ext.getCmp('realPayForm').getForm();
	realPayForm.reset();
	Ext.getCmp('addWord').setValue('');
	Ext.getCmp('voucherNo').setDisabled(false);
    inputWindow.show();  
}

/**
 * 修改实拨拨款单
 */
function updateRealPay(){
	var records = gridPanel1.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请选中一条凭证信息！");
		return;
	} else if (records.length > 1) {
		Ext.Msg.alert("系统提示", "每次只能修改一条凭证信息");
		return;
	}
	
	inputFlag = false;
  	initWindow();

  	Ext.getCmp('realPayForm').getForm().loadRecord(records[0]);
  	Ext.getCmp('payAccount').setValue(records[0].get('pay_account_name'));
  	Ext.getCmp('bankSetMode').setValue(records[0].get('pb_set_mode_name'));
  	Ext.getCmp('payType').setValue(records[0].get('pay_type_code'));
  	Ext.getCmp('fundType').setValue(records[0].get('fund_type_code'));
  	Ext.getCmp('addWord').setValue(records[0].get('pay_summary_name'));
  	Ext.getCmp('voucherNo').setDisabled(true);
  	
    inputWindow.show(); 
    
}

/**
 * 行号查询录入
 * @return {TypeName} 
 */
var bankWin = null;
function addBankNo(){
	if(bankWin==null) {
		var bankNoStore = Ext.create('pb.store.pay.PayeeBankNos',{});
		var bankWin = Ext.create('pb.view.pay.BankNoWindowRealPay',{
					bankNoStore : bankNoStore
		});
		//补录行号确定按钮触发
		bankWin.on('bankNoclick', function(grid){
			var rs = grid.getSelectionModel().getSelection();
			if (rs.length == 0){
				return;
			}
			Ext.getCmp('payeeAccountBank').setValue(rs[0].get('bank_name'));
			Ext.getCmp('payeeAccountBankNo').setValue(rs[0].get('bank_no'));
			bankWin.hide();
		});
	}
	bankWin.payeeAccountNo = Ext.getCmp("payeeAccountNo").getValue();
	var form = bankWin.getForm();
	form.findField('ori_bankname').setValue(Ext.getCmp("payeeAccountBank").getValue());
	var button = Ext.ComponentQuery.query('button[text="查询"]', bankWin)[0];
	bankWin.show();
	button.handler.call(button);
}


/**
 * 送审实拨拨款单
 * @memberOf {TypeName} 
 * @return {TypeName} 
 */
function auditRealPay(){
	var me = this;
	var records = gridPanel1.getSelectionModel().getSelection();
	if( records== null || records.length == 0){
		Ext.Msg.alert("系统提示","请先选择一条数据！");
		return ;
	}
	var reqIds = [];
	var reqVers = [];
	Ext.Array.each(records, function(model) {
				reqIds.push(model.get("realpay_voucher_id"));
				reqVers.push(model.get("last_ver"));
			});
	var bill_type_id = records[0].get("bill_type_id");
	var params = {
			billTypeId : bill_type_id,
			billIds : Ext.encode(reqIds),
			last_vers : Ext.encode(reqVers)
		};
	Ext.PageUtil.doRequestAjax(me,'/realware/auditRealPayVoucher.do',params);
}

/**
 * 删除实拨拨款单
 * @memberOf {TypeName} 
 * @return {TypeName} 
 */
function deleteRealPay(){
	Ext.Msg.confirm("系统提示","确认要删除选中的实拨拨款单信息？",function(e) {
		if (e == "yes") {
			var me = this;
			var records = gridPanel1.getSelectionModel().getSelection();
			if( records== null || records.length == 0){
				Ext.Msg.alert("系统提示","请先选择一条数据！");
				return ;
			}
			var reqIds = [];
			var reqVers = [];
			Ext.Array.each(records, function(model) {
						reqIds.push(model.get("realpay_voucher_id"));
						reqVers.push(model.get("last_ver"));
					});
			var bill_type_id = records[0].get("bill_type_id");
			var params = {
					billTypeId : bill_type_id,
					billIds : Ext.encode(reqIds),
					last_vers : Ext.encode(reqVers)
				};
			Ext.PageUtil.doRequestAjax(me,'/realware/deleteRealPayVoucher.do',params);
		}
	});
}