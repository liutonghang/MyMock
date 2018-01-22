/*
 * 添加账户
*/

Ext.require(['*']);

var a_is_valid = "0";
var a_is_sameBank = "0";
var a_is_pbc = "0";

var required = '<span style="color:red;font-weight:bold" data-qtip="Required">*</span>';
var comboStore = Ext.create('Ext.data.Store', {
			fields : ['id', 'code', 'name', 'codename'],
			proxy : {
				type : 'ajax',
				url : '/realware/loadAllNetwork.do?filedNames='+Ext.encode(["id","code","name","codename"]),
				reader : {
					type : 'json'
				}
			},
			autoLoad : false
		});

/*
***************************授权垫支户(主办行)*************************************************
*/

function addAccreditAdvanceAccountDialog(){

	var addAccreditAdvanceAccountDialog = new Ext.FormPanel({
		id:'AccreditAdvanceAccountForm',
	    frame:true,
	    bodyStyle:'padding:5px 5px 0 5px',
		defaultType: 'textfield',
		items: [{
				xtype: 'panel',
				border: 0,
				width: 350,
				layout: 'hbox',
				bodyStyle: "background:#DFE9F6;padding:0px 0px 5px 0px",
				items: [{
					id: 'bank',
					xtype: 'textfield',
					fieldLabel: '所属网点',
					readOnly: 'true',
					msgTarget: 'side',
					allowBlank: false,
					value: ''
				}, {
					id: 'btn_bank_code_Agency_add',
					xtype: 'button',
					text: '查询',
					iconCls : 'log',
					handler: function(btn){
						new pb.ChooseBankWindow({
							listeners:{
								afterchoose:function(window,bankInfo){
									bankid = bankInfo.bankId;
									bankcode = bankInfo.bankcode;
									bankname = bankInfo.bankname;
									var codeandname=bankInfo.bankcode+" "+bankInfo.bankname;
									btn.up("panel").down("textfield").setValue(codeandname); 
								}
							}
						}).show()
					}
				}]
				},{
					id: 'AccreditAdvanceAccountName',
					vtype:"accountName",
					afterLabelTextTpl : required,
					allowBlank : false,
					fieldLabel: '账户名称'
				}, {
					id: 'AccreditAdvanceAccountNo',
					afterLabelTextTpl : required,
					allowBlank : false,
					vtype:"accountId",
					fieldLabel: '账号'
				}, {
					id : 'accountTypeCode',
					xtype : 'combo',
					fieldLabel : '账户类型',
					dataIndex : 'account_type_code',
					displayField : 'accont_type_name',
					emptyText : '请选择',
					valueField : 'account_type_code',
					afterLabelTextTpl : required,
					editable: false,
					allowBlank : false,
					store : comboAccountType
				},{
					id: 'AccreditAdvanceAdmdivCode',
					xtype: 'combo',
					fieldLabel: '所属财政',
					dataIndex: 'admdivCode',
					displayField: 'admdiv_name',
					afterLabelTextTpl : required,
					emptyText: '请选择',
					valueField: 'admdiv_code',
					allowBlank: false,
					editable: false,
					store: comboAdmdiv
//				}, {
//					id: 'AccreditAdvanceAgencyCode',
//					fieldLabel: '单位编码'
				}, {
					id: 'AccreditAdvanceIsValid',
					xtype: 'checkbox',
					fieldLabel: '是否有效',
					checked: true,
					hidden : true
				}],
			buttons: [
						{
	                  	  text: '确定',
	                  	  formBind:true,
	                      handler: function() {
							if (this.up('form').getForm().isValid()) { 
								if(Ext.getCmp('AccreditAdvanceIsValid').getValue() == true){
									a_is_valid = "1";
								}
								addAccreditAdvanceAccount(this.up('window'));
								Ext.getCmp("AccreditAdvanceAccountForm").getForm().reset();
								this.up('window').close();
							}
	                   	 }
	              	   },
					   {
	                     text: '取消',
	                     handler: function() {
	                     	this.up('window').close();
	                     }
	                   }]
		});
	
	var dialog=Ext.widget('window', {
		title : '添加账户',
		width : 350,
		autoHeight:true,
		layout : 'fit',
		resizable : false,
		modal : true,
		items : [ addAccreditAdvanceAccountDialog ]
	}).show();
	var records = networkPanel.getSelectionModel().getSelection();
	var netState = Ext.getCmp("netState").getValue();
	if(netState == "002" && records != null){
	   bankid = records[0].raw.id;	
	   bankcode=records[0].raw.code;
	   bankname=records[0].raw.text;
	   Ext.getCmp("bank").setValue(bankcode+" "+bankname);
	   Ext.getCmp("btn_bank_code_Agency_add").disabled=true;
	}
}

function addAccreditAdvanceAccount(win){
	var myMask = new Ext.LoadMask(Ext.getBody(), {
			msg : '后台正在处理中，请稍后....',
			removeMask : true // 完成后移除
		});
	myMask.show();
	
//	var bank_id = Ext.getCmp("bank").getValue();
//	var bank = Ext.getCmp("bank").rawValue;
//	var bank_code = bank.substring(0,bank.indexOf("_"));
//	var bank_name = bank.substring(bank.indexOf("_")+1);
	// 提交到服务器操作
	Ext.Ajax.request({
		url : 'addAccreditAdvanceAccount.do',
        method: 'POST',
		timeout:180000,  //设置为3分钟
		params : {
			account_name : Ext.getCmp('AccreditAdvanceAccountName').getValue(), 
			account_no : Ext.getCmp('AccreditAdvanceAccountNo').getValue(),
			is_valid : a_is_valid,
			admdiv_code : Ext.getCmp('AccreditAdvanceAdmdivCode').getValue(),
//			agency_code : Ext.getCmp('AccreditAdvanceAgencyCode').getValue(),
			bankid : bankid,
			bankCode : bankcode,
			bankName : bankname,
			account_type_code : Ext.getCmp("accountTypeCode").getValue()
		},
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
}

/*

/*
***************************单位零余额*************************************************
*/

function addAgencyZeroAccountDialog(){

	var addAgencyZeroAccountDialog = new Ext.FormPanel({
		id:'AagencyZeroForm',
	    frame:true,
	    bodyStyle:'padding:5px 5px 0 5px',
		defaultType: 'textfield',
		items: [{
				xtype: 'panel',
				border: 0,
				width: 350,
				layout: 'hbox',
				bodyStyle: "background:#DFE9F6;padding:0px 0px 5px 0px",
				hidden:isHost=='true'?false:true//,
				/*items: [{
					id: 'AagencyZeroAccountBankCode',
					xtype: 'textfield',
					fieldLabel: '所属网点',
					readOnly: 'true',
					msgTarget: 'side',
					allowBlank: false,
					value: ''
				}, {
					id: 'btn_bank_code_Agency_add',
					xtype: 'button',
					text: '查询',
					iconCls : 'log',
					handler: function(){
						choseBank('AagencyZeroAccountBankCode');
					}
				}]*/
				}, {
					id: 'AagencyZeroAccountName',
					fieldLabel: '账户名称',
					vtype:"accountName",
					afterLabelTextTpl : required,
					allowBlank : false
					
				}, {
					id: 'AagencyZeroAccountNo',
					fieldLabel: '账号',
					//modify by cyq 2015/1/6  增加账号长度验证
					vtype:"accountId",
					afterLabelTextTpl : required,
					allowBlank : false
				}, {
					id: 'AagencyZeroAdmdivCode',
					xtype: 'combo',
					fieldLabel: '所属财政',
					dataIndex: 'admdivCode',
					displayField: 'admdiv_name',
					emptyText: '请选择',
					valueField: 'admdiv_code',
					allowBlank: false,
					editable: false,
					afterLabelTextTpl : required,
					store: comboAdmdiv
				}, {
					id: 'AagencyZeroAgencyCode',
					fieldLabel: '单位编码',
					vtype:"commonId",
					afterLabelTextTpl : required,
					allowBlank : false
						
				},  {
					id: 'AagencyZeroAgencyName',
					allowBlank: false,
					fieldLabel: '单位名称',
					vtype:"commonName",
					afterLabelTextTpl : required,
					allowBlank : false
				},  {
					id: 'AagencyZeroFinanceName',
					fieldLabel: '财务人员名称',
					vtype:"commonName",
					allowBlank : true
				},  {
					id: 'AagencyZeroFinancePhone',
					fieldLabel: '财务人员电话号码',
					vtype:"commonPhone",
					allowBlank : true
				}, {
					id: 'AagencyZeroIsValid',
					xtype: 'checkbox',
					fieldLabel: '是否有效',
					checked: true,
					hidden : true
				}],
			buttons: [
						{
	                  	  text: '确定',
	                      handler: function() {
	                    	if (this.up('form').getForm().isValid()) { 
								if(Ext.getCmp('AagencyZeroIsValid').getValue() == true){
									a_is_valid = "1";
								}
								addAgencyZeroAccount(this.up('window'));
								Ext.getCmp("AagencyZeroForm").getForm().reset();
								this.up('window').close();
							}
	                   	 }
	              	   },
					   {
	                     text: '取消',
	                     handler: function() {
	                     	this.up('window').close();
	                     }
	                   }]
		});
	
	var dialog=Ext.widget('window', {
		title : '添加账户',
		width : 350,
		autoHeight:true,
		layout : 'fit',
		resizable : false,
		modal : true,
		items : [ addAgencyZeroAccountDialog ]
	}).show();
}


/**
 * 全省零余额维护添加(黑龙江特殊需求)
 * @returns
 */

function addAgencyZeroAccountOfProvinceDialog(netState,panel){
	var e_recordsr = networkPanel.getSelectionModel().getSelection();
	if (e_recordsr.length == 1) {
		var bankcode=e_recordsr[0].get("code");
		var bankname=e_recordsr[0].get("name");
		bankid = e_recordsr[0].get("id");
	}
	var addAgencyZeroAccountDialog = new Ext.FormPanel({
		id:'AccountOfAgencyZeroOfProvinceForm',
	    labelWidth: 75,
	    frame:true,
	    bodyStyle:'padding:5px 5px 0',
	    width: 350,
	    defaults: {width: 300},
	    defaultType: 'textfield',
			items : [ 
						{
							xtype: 'panel',
							border: 0,
							width: 350,
							layout: 'hbox',
							bodyStyle: "background:#DFE9F6;padding:0px 0px 5px 0px",
							//hidden:isHost=='true'?false:true//,
							items:[{
										id : 'adduser_bank_code',
										xtype : 'textfield',
										fieldLabel : '所属网点',
										//readOnly: 'true',
										labelWidth: 100,
										value : (!Ext.isEmpty(bankcode,false))?bankcode+' '+bankname:''
									},
									{
										id : 'btn_bank_code',
										xtype: 'button',
										text: '查询',
										iconCls : 'log',
										handler : function() {
											choseBank1();						
										}											
									}]	
						},{
							id :'AagencyZeroAccountName',
							fieldLabel : '账户名称'
						},{
							id :'AagencyZeroAccountNo',
							fieldLabel : '账号'
						},{
							id :'AagencyZeroAdmdivCode',
							xtype : 'combo',
							fieldLabel : '所属财政',
							dataIndex : 'admdivCode',
							displayField: 'admdiv_name',
							emptyText: '请选择',
							valueField: 'admdiv_code',
							allowBlank : false,
							editable :false,
							store: comboAdmdiv
						},{
							id :'AagencyZeroAgencyCode',
							fieldLabel : '单位编码'
						},{
							id :'AagencyZeroAgencyName',
							fieldLabel : '单位名称',
							allowBlank : false
						},{
							id :'AagencyZeroFinanceName',
							fieldLabel : '财务人员名称'
						},{
							id :'AagencyZeroFinancePhone',
							fieldLabel : '财务人员电话号码'
						},{
							id :'AagencyZeroIsValid',
							xtype : 'checkbox',
							fieldLabel : '是否有效',
							checked : true,
							hidden : true
						}
					],
			buttons: [
						{
	                  	  text: '确定',
	                      handler: function() {
						  	if( Ext.isEmpty( Ext.getCmp('AagencyZeroAccountName').getValue() )){
								Ext.Msg.alert("系统提示", "账户名称不能为空！");
							}else if( Ext.isEmpty( Ext.getCmp('AagencyZeroAccountNo').getValue() ) ){
								Ext.Msg.alert("系统提示", "账号不能为空！");
							}else if( Ext.isEmpty( Ext.getCmp('AagencyZeroAdmdivCode').getValue() ) ){
								Ext.Msg.alert("系统提示", "所属财政不能为空！");
							}else if( Ext.isEmpty( Ext.getCmp('AagencyZeroAgencyCode').getValue() ) ){
								Ext.Msg.alert("系统提示", "单位编码不能为空！");
							}else{
								if(Ext.getCmp('AagencyZeroIsValid').getValue() == true){
									a_is_valid = "1";
								}
								addAgencyZeroAccount(this.up('window'));
								Ext.getCmp("AccountOfAgencyZeroOfProvinceForm").getForm().reset();
								this.up('window').close();
							}
	                   	 }
	              	   },
					   {
	                     text: '取消',
	                     handler: function() {
	                     	this.up('window').close();
	                     }
	                   }]
		});
	
	var dialog=Ext.widget('window', {
		title : '添加账户',
		width : 350,
		height : 240,
		layout : 'fit',
		resizable : false,
		modal : true,
		items : [ addAgencyZeroAccountDialog ]
	}).show();
}





function addAgencyZeroAccount(win){
	var myMask = new Ext.LoadMask(Ext.getBody(), {
			msg : '后台正在处理中，请稍后....',
			removeMask : true // 完成后移除
		});
	myMask.show();
	// 提交到服务器操作
	Ext.Ajax.request({
		url : 'addAgencyZeroAccount.do',
        method: 'POST',
		timeout:180000,  //设置为3分钟
		params : {
			account_name : Ext.getCmp('AagencyZeroAccountName').getValue(), 
			account_no : Ext.getCmp('AagencyZeroAccountNo').getValue(),
			is_valid : a_is_valid,
			admdiv_code : Ext.getCmp('AagencyZeroAdmdivCode').getValue(),
			agency_code : Ext.getCmp('AagencyZeroAgencyCode').getValue(),
			agency_name : Ext.getCmp('AagencyZeroAgencyName').getValue(),
			finance_name : Ext.getCmp('AagencyZeroFinanceName').getValue(),
			finance_phone : Ext.getCmp('AagencyZeroFinancePhone').getValue(),
			bankid : bankid
		},
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
}

/** ******************************************************************************** */

/*
***************************清算账户*************************************************
*/

function addClearAccountDialog(grid){
	var addClearAccountDialog = new Ext.FormPanel({
		id:'AclearForm',
	    labelWidth: 75,
	    frame:true,
	    bodyStyle:'padding:5px 5px 0',
	    width: 350,
	    defaults: {width: 300},
	    defaultType: 'textfield',
			items : [ 
						{
							id :'AclearAccountName',
							vtype:"accountName",
							allowBlank : false,
							fieldLabel : '账户名称'
						},{
							id :'AclearAccountNo',
							vtype:"accountId",
							allowBlank : false,
							fieldLabel : '账号'
						},{
							id :'AclearBankName',
							fieldLabel : '开户行名称',
							allowBlank : false,
							regex:/^([\w\d\u4e00-\u9fa5]{1,60})$/,
							regexText :'银行名称只能是数字字母和汉字，长度不超过60'
						},{
							id :'AclearBankNo',
							fieldLabel : '银行行号',
							allowBlank : false,
							regex:/^\d+$/,
							regexText : '收款行号只能是数字'
						},{
							id :'AclearAdmdivCode',
							xtype : 'combo',
							fieldLabel : '所属财政',
							dataIndex : 'admdivCode',
							displayField: 'admdiv_name',
							emptyText: '请选择',
							valueField: 'admdiv_code',
							editable :false,
							store: comboAdmdiv,
							listeners : {
									'select' : function(){
										selectAdmdiv(false,'AclearAdmdivCode');
									}
							}
							
						},{
							id :'AclearFundTypeCode',
							xtype : 'combo',
							fieldLabel : '资金性质',
							dataIndex : 'fundTypeCode',
							displayField: 'name',
							emptyText: '请选择',
							valueField: 'code',
							queryMode : 'local',
							store: comboFundType
						},{
							id :'AclearPayTypeCode',
							xtype : 'combo',
							fieldLabel : '支付方式',
							displayField: 'name',
							emptyText: '请选择',
							valueField: 'code',
							queryMode : 'local',
							store: comboPayType
						},{
							id :'AclearOrgCode',
							fieldLabel : '机构类型',
							regex:/^\d+$/,
							regexText : '机构类型只能是数字'
						},{
							id :'AclearIsSameBank',
							xtype : 'checkbox',
							fieldLabel : '是否同行账户',
							checked : false
//						},{
//							id :'AclearIsValid',
//							xtype : 'checkbox',
//							fieldLabel : '是否有效',
//							checked : true,
//							hidden : true
						},{
							id :'AclearIsPbc',
							xtype : 'checkbox',
							fieldLabel : '是否人行账户',
							checked : false
						}
					],
			buttons: [
						{
						  formBind : true,
	                  	  text: '确定',
	                      handler: function() {
	                    	
						  	if( Ext.isEmpty(Ext.getCmp('AclearAccountName').getValue())){
								Ext.Msg.alert("系统提示", "账户名称不能为空！");
							}else if( Ext.isEmpty(Ext.getCmp('AclearAccountNo').getValue() ) ){
								Ext.Msg.alert("系统提示", "账号不能为空！");
							}else if( Ext.isEmpty( Ext.getCmp('AclearBankName').getValue() ) ){
								Ext.Msg.alert("系统提示", "银行名称不能为空！");
							}else if( Ext.isEmpty (Ext.getCmp('AclearAdmdivCode').getValue()) ){
								Ext.Msg.alert("系统提示", "所属财政不能为空！");
							}else if( !Ext.isEmpty (Ext.getCmp('AclearPayTypeCode').getValue()) 
									&& Ext.isEmpty (Ext.getCmp('AclearFundTypeCode').getValue())){
								Ext.Msg.alert("系统提示", "已选取支付方式，则资金性质不能为空！");
							}
							else if( Ext.isEmpty (Ext.getCmp('AclearOrgCode').getValue() ) ){
								Ext.Msg.alert("系统提示", "机构类型不能为空！");
							}else if( (Ext.getCmp('AclearIsSameBank').getValue() == Ext.getCmp('AclearIsPbc').getValue()) && (Ext.getCmp('AclearIsSameBank').getValue() == "1") ) {
								Ext.Msg.alert("系统提示", "同行账户与人行账户不能同时选中！");
							}else{
								var data = grid.getStore().data.items;
								
								if(data.length == 1 && Ext.isEmpty(data[0].get('fund_type_code'))){
									Ext.Msg.alert("系统提示", "已存在与资金性质无关的账户，请重新配置！");
									return ;
								}
								
								for( var i = 0 ; i < data.length ; i++){
									
									if(Ext.isEmpty(Ext.getCmp('AclearFundTypeCode').value)){
										if(data[i].get('admdiv_code') == Ext.getCmp('AclearAdmdivCode').value 
												&& !Ext.isEmpty(data[i].get('fund_type_code'))){
											Ext.Msg.alert("系统提示", "已存在与资金性质有关的账户，请重新配置！");
											return;
										}
									}else{
										//支付方式为空时
										if(Ext.isEmpty(Ext.getCmp('AclearPayTypeCode').value)){
											if(data[i].get('admdiv_code') == Ext.getCmp('AclearAdmdivCode').value 
													&& data[i].get('fund_type_code') == Ext.getCmp('AclearFundTypeCode').value){
												Ext.Msg.alert("系统提示", "该资金性质下已存在清算账户，请重新配置！");
												return;
											}
											
										}else{
											if(data[i].get('admdiv_code') == Ext.getCmp('AclearAdmdivCode').value 
													&& data[i].get('fund_type_code') == Ext.getCmp('AclearFundTypeCode').value
													&& Ext.isEmpty(data[i].get('pay_type_code'))){
												Ext.Msg.alert("系统提示", "该资金性质下已存在与支付方式无关的账户，请重新配置！");
												return;
											}
											else if(data[i].get('admdiv_code') == Ext.getCmp('AclearAdmdivCode').value 
													&& data[i].get('fund_type_code') == Ext.getCmp('AclearFundTypeCode').value
													&& data[i].get('pay_type_code') == Ext.getCmp('AclearPayTypeCode').value)
											{
												Ext.Msg.alert("系统提示", "同一资金性质、支付方式只能有一个清算账户！");
												return;
											}
										}
									}
								}
								
//								if(Ext.getCmp('AclearIsValid').getValue() == true){
									a_is_valid = "1";
//								}
								if(Ext.getCmp('AclearIsSameBank').getValue() == true){
									a_is_sameBank = "1";
								}else{
									a_is_sameBank = "0";
								}
								if (Ext.getCmp('AclearIsPbc').getValue() == true ) {
									a_is_pbc = "1";
								} else {
									a_is_pbc = "0";
								}
								
								if(Ext.getCmp('AclearBankNo').getValue()==""){
									Ext.Msg.alert("系统提示", "跨行清算银行行号不能为空！");
									return;
								}
								addClearAccount(this.up('window'));
								Ext.getCmp('AclearForm').getForm().reset();
								this.up('window').close();
							}
	                   	 }
	              	   },
					   {
	                     text: '取消',
	                     handler: function() {
	                     	this.up('window').close();
	                     }
	                   }]
		});
	
	var dialog=Ext.widget('window', {
		title : '添加账户',
		width : 350,
		height : 380,
		layout : 'fit',
		resizable : false,
		modal : true,
		items : [ addClearAccountDialog ]
	}).show();
}

function addClearAccount(win){
	var myMask = new Ext.LoadMask(Ext.getBody(), {
			msg : '后台正在处理中，请稍后....',
			removeMask : true // 完成后移除
		});
	myMask.show();
	// 提交到服务器操作
	Ext.Ajax.request({
		url : 'addClearAccount.do',
        method: 'POST',
		timeout:180000,  //设置为3分钟
		params : {
			account_name : Ext.getCmp('AclearAccountName').getValue(), 
			account_no : Ext.getCmp('AclearAccountNo').getValue(),
			bank_name : Ext.getCmp('AclearBankName').getValue(), 
			bank_no : Ext.getCmp('AclearBankNo').getValue(),
			admdiv_code : Ext.getCmp('AclearAdmdivCode').getValue(),
			fund_type_code : Ext.getCmp('AclearFundTypeCode').getValue(),
			pay_type_code : Ext.getCmp('AclearPayTypeCode').getValue(),
			org_code : Ext.getCmp('AclearOrgCode').getValue(),
			is_valid : a_is_valid,
			is_samebank : a_is_sameBank,
			is_pbc : a_is_pbc
		},
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
}


/** ******************************************************************************** */


/*
***************************财政零余额*************************************************
*/

function addAdmdivZeroAccountDialog(){

	var addAdmdivZeroAccountDialog = new Ext.FormPanel({
		id:'AadmdivZeroForm',
	    labelWidth: 75,
	    frame:true,
	    bodyStyle:'padding:5px 5px 0',
	    width: 350,
	    defaults: {width: 300},
	    defaultType: 'textfield',
			items : [ {
					xtype: 'panel',
					border: 0,
					width: 350,
					layout: 'hbox',
					bodyStyle: "background:#DFE9F6;padding:0px 0px 5px 0px",
					hidden:isHost=='true'?false:true//,
					/*items: [{
						id: 'AadmdivZeroAccountBankCode',
						xtype: 'textfield',
						fieldLabel: '所属网点',
						readOnly: 'true',
						msgTarget: 'side',
						allowBlank: false,
						value: ''
					}, {
						id: 'btn_bank_code_Admdiv_add',
						xtype: 'button',
						text: '查询',
						iconCls : 'log',
						handler: function(){
							choseBank('AadmdivZeroAccountBankCode');
						}
						}]*/
					},{
							fieldLabel : '账户名称',
							id :'AadmdivZeroAccountName',
							vtype:"accountName",
							allowBlank : false
						},{
							fieldLabel : '账号',
							id :'AadmdivZeroAccountNo',
							vtype:"accountId",
							allowBlank : false
						},{
							id :'AadmdivZeroAdmdivCode',
							xtype : 'combo',
							fieldLabel : '所属财政',
							dataIndex : 'admdivCode',
							displayField: 'admdiv_name',
							emptyText: '请选择',
							valueField: 'admdiv_code',
							allowBlank : false,
							editable :false,							
							store: comboAdmdiv
						},{
							xtype : 'checkbox',
							fieldLabel : '是否有效',
							id :'AadmdivZeroIsValid',
							checked : true,
							hidden : true
						}
					],
			buttons: [
						{
	                  	  text: '确定',
	                      handler: function() {
							if(this.up("form").getForm().isValid()){ 
								if(Ext.getCmp('AadmdivZeroIsValid').getValue() == true){
									a_is_valid = "1";
								}
								addAdmidvZeroAccount(this.up('window'));
								Ext.getCmp('AadmdivZeroForm').getForm().reset();
								this.up('window').close();
							}
	                   	 }
	              	   },
					   {
	                     text: '取消',
	                     handler: function() {
	                     	this.up('window').close();
	                     }
	                   }]
		});
	
	var dialog=Ext.widget('window', {
		title : '添加账户',
		width : 350,
		autoHeight:true,
		layout : 'fit',
		resizable : false,
		modal : true,
		items : [ addAdmdivZeroAccountDialog ]
	}).show();
}

function addAdmidvZeroAccount(win){
	var myMask = new Ext.LoadMask(Ext.getBody(), {
			msg : '后台正在处理中，请稍后....',
			removeMask : true // 完成后移除
		});
	myMask.show();
	// 提交到服务器操作
	Ext.Ajax.request({
		url : 'addAdmdivZeroAccount.do',  
        method: 'POST',
		timeout:180000,  //设置为3分钟
		params : {
			account_name : Ext.getCmp('AadmdivZeroAccountName').getValue(), 
			account_no : Ext.getCmp('AadmdivZeroAccountNo').getValue(),
			admdiv_code : Ext.getCmp('AadmdivZeroAdmdivCode').getValue(),
			bankid : bankid,
			is_valid : a_is_valid
		},
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
}

/** ******************************************************************************** */

/*
***************************工资统发户账户*************************************************
*/
function addSalaryAccountDialog(){

	var addSalaryAccountDialog = new Ext.FormPanel({
		id:'AsalaryAccountForm',
	    labelWidth: 75,
	    frame:true,
	    bodyStyle:'padding:5px 5px 0',
	    width: 350,
	    defaults: {width: 300},
	    defaultType: 'textfield',
			items : [ {
					xtype: 'panel',
					border: 0,
					width: 350,
					layout: 'hbox',
					bodyStyle: "background:#DFE9F6;padding:0px 0px 5px 0px",
					hidden:isHost=='true'?false:true//,
					/*items: [{
						id: 'AadmdivZeroAccountBankCode',
						xtype: 'textfield',
						fieldLabel: '所属网点',
						readOnly: 'true',
						msgTarget: 'side',
						allowBlank: false,
						value: ''
					}, {
						id: 'btn_bank_code_Admdiv_add',
						xtype: 'button',
						text: '查询',
						iconCls : 'log',
						handler: function(){
							choseBank('AadmdivZeroAccountBankCode');
						}
						}]*/
					},{
							fieldLabel : '账户名称',
							allowBlank:false,
							vtype:"accountName",
							id :'AsalaryAccountName'
						},{
							fieldLabel : '账号',
							allowBlank:false,
							vtype:"accountId",
							id :'AsalaryAccountNo'
						},{
							id :'AsalaryAdmdivCode',
							xtype : 'combo',
							fieldLabel : '所属财政',
							dataIndex : 'admdivCode',
							displayField: 'admdiv_name',
							emptyText: '请选择',
							valueField: 'admdiv_code',
							allowBlank : false,
							editable :false,							
							store: comboAdmdiv
						},{
							xtype : 'checkbox',
							fieldLabel : '是否有效',
							id :'AsalaryIsValid',
							checked : true,
							hidden : true
						}
					],
			buttons: [
						{
	                  	  text: '确定',
	                      handler: function() {
	                    	  if(this.up("form").getForm().isValid()){
								if(Ext.getCmp('AsalaryIsValid').getValue() == true){
									a_is_valid = "1";
								}
								addSalaryAccount(this.up('window'));
								Ext.getCmp('AsalaryAccountForm').getForm().reset();
								this.up('window').close();
							}
	                   	 }
	              	   },
					   {
	                     text: '取消',
	                     handler: function() {
	                     	this.up('window').close();
	                     }
	                   }]
		});
	
	var dialog=Ext.widget('window', {
		title : '添加账户',
		width : 350,
		autoHeight:true,
		layout : 'fit',
		resizable : false,
		modal : true,
		items : [ addSalaryAccountDialog ]
	}).show();
}

function addSalaryAccount(win){
	var myMask = new Ext.LoadMask(Ext.getBody(), {
			msg : '后台正在处理中，请稍后....',
			removeMask : true // 完成后移除
		});
	myMask.show();
	// 提交到服务器操作
	Ext.Ajax.request({
		url : 'addSalaryAccount.do',  
        method: 'POST',
		timeout:180000,  //设置为3分钟
		params : {
			account_name : Ext.getCmp('AsalaryAccountName').getValue(), 
			account_no : Ext.getCmp('AsalaryAccountNo').getValue(),
			admdiv_code : Ext.getCmp('AsalaryAdmdivCode').getValue(),
			bankid : bankid,
			is_valid : a_is_valid
		},
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
}
/** ******************************************************************************** */
/*
***************************垫支户/划款账户*************************************************
*/

function addAdvanceAgentDialog(isAgent){

	var addAgentAccountDialog = new Ext.FormPanel({
		id:'AagentForm',
	    labelWidth: 75,
	    frame:true,
	    bodyStyle:'padding:5px 5px 0',
	    width: 350,
	    defaults: {width: 300},
	    defaultType: 'textfield',
			items : [ 
						{
							fieldLabel : '账户名称',
							id :'AagentAccountName',
							allowBlank : false,
							afterLabelTextTpl : required,
							vtype:"accountName"
						},{
							fieldLabel : '账号',
							vtype:"accountId",
							afterLabelTextTpl : required,
							allowBlank : false,
							id :'AagentAccountNo'
						},{
							id :'AagentAdmdivCode',
							xtype : 'combo',
							fieldLabel : '所属财政',
							dataIndex : 'admdivCode',
							displayField: 'admdiv_name',
							emptyText: '请选择',
							valueField: 'admdiv_code',
							afterLabelTextTpl : required,
							allowBlank : false,
							editable :false,
							store: comboAdmdiv,
							listeners : {
									'select' : function(){
													selectAdmdiv(false,'AagentAdmdivCode');
												}
							}
						},{
							id : 'AagentfundTypeCode',
							xtype : 'combo',
							fieldLabel : '资金性质',
							dataIndex : 'code',
							displayField : 'name',
							emptyText : '请选择',
							valueField : 'code',
							hidden : isAgent==true?false:true,
							editable : false,
							queryMode : 'local',
							store : comboFundType, 
							allowBlank :true
						},{
							id :'AagentAccountTypeCode',
							xtype : 'combo',
							fieldLabel : '账户类型',
							afterLabelTextTpl : required,
							dataIndex : 'AagentAccountTypeCode',
							displayField: 'accont_type_name',
							emptyText: '请选择',
							valueField: 'account_type_code',
							editable :false,
							store: comboAccountType,
							allowBlank : false
						},{
							xtype : 'checkbox',
							fieldLabel : '是否有效',
							id :'AagentIsValid',
							checked : true,
							hidden : true
						}
					],
			buttons: [
						{
	                  	  text: '确定',
	                  	  formBind:true,
	                      handler: function() {
						  	if(this.up("form").getForm().isValid()){
								if(Ext.getCmp('AagentIsValid').getValue() == true){
									a_is_valid = "1";
								}
								addAgentAccount(this.up('window'));
								Ext.getCmp('AagentForm').getForm().reset();
								this.up('window').close();
							}
	                   	 }
	              	   },
					   {
	                     text: '取消',
	                     handler: function() {
	                     	this.up('window').close();
	                     }
	                   }]
		});
	
	var dialog=Ext.widget('window', {
		title : '添加账户',
		width : 350,
		height : 250,
		layout : 'fit',
		resizable : false,
		modal : true,
		items : [ addAgentAccountDialog ]
	}).show();
}

function addAgentAccount(win) {
	var myMask = new Ext.LoadMask(Ext.getBody(), {
			msg : '后台正在处理中，请稍后....',
			removeMask : true // 完成后移除
		});
	myMask.show();
	// 提交到服务器操作
	Ext.Ajax.request({
		url : 'addAdvanceAgent.do',
		method : 'POST',
		timeout : 180000, // 设置为3分钟
		params : {
			account_name : Ext.getCmp('AagentAccountName').getValue(),
			account_no : Ext.getCmp('AagentAccountNo').getValue(),
			admdiv_code : Ext.getCmp('AagentAdmdivCode').getValue(),
			account_type_code : Ext.getCmp('AagentAccountTypeCode').getValue(),
			fund_type_code : Ext.getCmp('AagentfundTypeCode').getValue(),
			bankid : bankid,
			is_valid : a_is_valid
		},
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
}

/** ******************************************************************************** */



/*
***************************财政国库资金实有资金账户*************************************************
*/

function addRealFundAccountDialog(){
	
	var addRealFundAccountDialog = new Ext.FormPanel({
		id:'ArealFundForm',
	    labelWidth: 75,
	    frame:true,
	    bodyStyle:'padding:5px 5px 0',
	    width: 350,
	    defaults: {width: 300},
	    defaultType: 'textfield',
			items : [ 
						{
							id :'ArealFundAccountName',
							fieldLabel : '账户名称',
							vtype:"accountName",
							allowBlank : false
							
						},{
							id :'ArealFundAccountNo',
							fieldLabel : '账号',
							vtype:"accountId",
							allowBlank : false
						},{
							id :'ArealFundAdmdivCode',
							xtype : 'combo',
							fieldLabel : '所属财政',
							dataIndex : 'admdivCode',
							displayField: 'admdiv_name',
							emptyText: '请选择',
							valueField: 'admdiv_code',
							editable :true,
							allowBlank : false,
							store: comboAdmdiv,
							listeners : {
									'select' : function(){
													selectAdmdiv(false,'ArealFundAdmdivCode');
												}
							}
						},{
							id :'ArealFundFundTypeCode',
							xtype : 'combo',
							fieldLabel : '资金性质',
							dataIndex : 'fundTypeCode',
							displayField: 'name',
							emptyText: '请选择',
							editable : true,
							valueField: 'code',
							queryMode : 'local',
							store: comboFundType,
							
							allowBlank : true // 资金性质允许为空
						},{
							id :'ArealFundIsValid',
							xtype : 'checkbox',
							fieldLabel : '是否有效',
							checked : true,
							hidden : true
						}
					],
			buttons: [
						{
						  formBind : true,
	                  	  text: '确定',
	                  	  id:'confirmBtn',
	                      handler: function() {
							
//	                    	  var data = gridPanel1.getStore().data.items;
//							if(Ext.isEmpty(Ext.getCmp('ArealFundFundTypeCode').value)){
//								if(data.length > 0){
//									if(data.length == 1 && Ext.isEmpty(data[0].get('fund_type_code'))){
//										// 不为0,不能添加
//										Ext.Msg.alert("系统提示", "已存在与资金性质无关的账户，请重新配置！");
//										return;
//									}
//									else{
//										Ext.Msg.alert("系统提示", "已存在与资金性质有关的账户，请重新配置！");
//										return;
//									}
//									
//								}
//							}else{
//								if(data.length > 0){
//									for( var i = 0 ; i < data.length ; i++){
//										 页面存在 资金性质为空 记录，不可以添加
//										if(Ext.isEmpty(data[i].get('fund_type_code'))){
//											Ext.Msg.alert("系统提示", "已存在与资金性质无关账户 ，请重新配置！");
//											return;
//										// 页面不存在 资金性质为空 记录，可以添加
//									}
//										else{
//											// 资金性质 重复，可以添加
//											if(data[i].get('fund_type_code') == Ext.getCmp('ArealFundFundTypeCode').value){
//												Ext.Msg.alert("系统提示", "一个资金性质 只能维护一个 账户，请重新配置！");
//												return;
//											}
//										}
//									
//									}
//								}
//							}
							
							if(Ext.getCmp('ArealFundIsValid').getValue() == true){
								a_is_valid = "1";
							}
							addRealFundAccount(this.up('window'));
							Ext.getCmp('ArealFundForm').getForm().reset();
							this.up('window').close();
							    
	                   	 }
	              	   },
					   {
	                     text: '取消',
	                     handler: function() {
	                     	this.up('window').close();
	                     }
	                   }]
		});
	
	var dialog=Ext.widget('window', {
		title : '添加账户',
		width : 350,
		height : 230,
		layout : 'fit',
		resizable : false,
		modal : true,
		items : [ addRealFundAccountDialog ]
	}).show();
}

function addRealFundAccount(win){
	var myMask = new Ext.LoadMask(Ext.getBody(), {
			msg : '后台正在处理中，请稍后....',
			removeMask : true // 完成后移除
		});
	myMask.show();
	// 提交到服务器操作
	Ext.Ajax.request({
		url : 'addRealFundAccount.do',
        method: 'POST',
		timeout:180000,  //设置为3分钟
		params : {
			account_name : Ext.getCmp('ArealFundAccountName').getValue(), 
			account_no : Ext.getCmp('ArealFundAccountNo').getValue(),
			admdiv_code : Ext.getCmp('ArealFundAdmdivCode').getValue(),
			fund_type_code : Ext.getCmp('ArealFundFundTypeCode').getValue(),
			is_valid : a_is_valid
		},
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
}


/** ******************************************************************************** */



/** ******************************************************************************** */
/*
***************************划款收款账户*************************************************
*/

function addAgentPayeeAccountDialog(){
	
	var addAgentPayeeAccountDialog = new Ext.FormPanel({
		id:'AgentPayeeForm',
	    labelWidth: 75,
	    frame:true,
	    bodyStyle:'padding:5px 5px 0',
	    width: 350,
	    defaults: {width: 300},
	    defaultType: 'textfield',
			items : [ 
						{
							id :'AgentPayeeAccountName',
							fieldLabel : '账户名称'
						},{
							id :'AgentPayeeAccountNo',
							fieldLabel : '账号'
						},{
							id :'AgentPayeeBankName',
							fieldLabel : '银行名称'
						},{
							id :'AgentPayeeBankNo',
							fieldLabel : '银行行号'
						},{
							id :'AgentPayeeAdmdivCode',
							xtype : 'combo',
							fieldLabel : '所属财政',
							dataIndex : 'admdivCode',
							displayField: 'admdiv_name',
							emptyText: '请选择',
							valueField: 'admdiv_code',
							editable :false,
							store: comboAdmdiv,
							listeners : {
									'select' : function(){
											selectAdmdiv(false,'AgentPayeeAdmdivCode');
									}
							}
						},{
							id :'AgentPayeeFundTypeCode',
							xtype : 'combo',
							fieldLabel : '资金性质',
							dataIndex : 'fundTypeCode',
							displayField: 'name',
							emptyText: '请选择',
							valueField: 'code',
							editable :false,
							queryMode : 'local',
							store: comboFundType
						},{
							id :'AgentPayeeOrgCode',
							fieldLabel : '机构类型'
						},{
							id :'AgentPayeeIsValid',
							xtype : 'checkbox',
							fieldLabel : '是否有效',
							checked : true,
							hidden : true
						}
					],
			buttons: [
						{
	                  	  text: '确定',
	                      handler: function() {
						  	if( Ext.isEmpty( Ext.getCmp('AgentPayeeAccountName').getValue()) ){
								Ext.Msg.alert("系统提示", "账户名称不能为空！");
							}else if( Ext.isEmpty( Ext.getCmp('AgentPayeeAccountNo').getValue())){
								Ext.Msg.alert("系统提示", "账号不能为空！");
							}else if( Ext.isEmpty( Ext.getCmp('AgentPayeeAdmdivCode').getValue() ) ){
								Ext.Msg.alert("系统提示", "所属财政不能为空！");
							}else if( Ext.isEmpty( Ext.getCmp('AgentPayeeFundTypeCode').getValue() ) ){
								Ext.Msg.alert("系统提示", "资金性质不能为空！");
							}else if( Ext.isEmpty( Ext.getCmp('AgentPayeeOrgCode').getValue() ) ){
								Ext.Msg.alert("系统提示", "机构类型不能为空！");
							}else if( Ext.isEmpty( Ext.getCmp('AgentPayeeBankName').getValue() ) ){
								Ext.Msg.alert("系统提示", "银行名称不能为空！");
							}else if( Ext.isEmpty( Ext.getCmp('AgentPayeeBankNo').getValue() ) ){
								Ext.Msg.alert("系统提示", "银行行号不能为空！");
							}else{
								if(Ext.getCmp('AgentPayeeIsValid').getValue() == true){
									a_is_valid = "1";
								}
								addAgentPayeeAccount(this.up('window'));
								Ext.getCmp('AgentPayeeForm').getForm().reset();
								this.up('window').close();
							}
	                   	 }
	              	   },
					   {
	                     text: '取消',
	                     handler: function() {
	                     	this.up('window').close();
	                     }
	                   }]
		});
	
	var dialog=Ext.widget('window', {
		title : '添加账户',
		width : 350,
		height : 300,
		layout : 'fit',
		resizable : false,
		modal : true,
		items : [ addAgentPayeeAccountDialog ]
	}).show();
}

function addAgentPayeeAccount(win){
	var myMask = new Ext.LoadMask(Ext.getBody(), {
			msg : '后台正在处理中，请稍后....',
			removeMask : true // 完成后移除
		});
	myMask.show();
	// 提交到服务器操作
	Ext.Ajax.request({
		url : 'addAgentPayeeAccount.do',
        method: 'POST',
		timeout:180000,  //设置为3分钟
		params : {
			account_name : Ext.getCmp('AgentPayeeAccountName').getValue(), 
			account_no : Ext.getCmp('AgentPayeeAccountNo').getValue(),
			admdiv_code : Ext.getCmp('AgentPayeeAdmdivCode').getValue(),
			fund_type_code : Ext.getCmp('AgentPayeeFundTypeCode').getValue(),
			org_code : Ext.getCmp('AgentPayeeOrgCode').getValue(),
			bank_no:Ext.getCmp('AgentPayeeBankNo').getValue(),
			bank_name:Ext.getCmp('AgentPayeeBankName').getValue(),
			is_valid : a_is_valid
		},
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
}


//网点信息
var bankid=null;
var jsonArray = [];
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

function choseBank(formId){   
	Ext.widget('window', {
		title : '选择网点',
		width : 400,
		height : 310,
		layout : 'fit',
		resizable : false,
		modal : true,
		items : [ new Ext.FormPanel({
		id:'Form',
		bodyPadding : 5,
		items : [{
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
										codeorname :Ext.getCmp('bankcode').getValue()
									}
								});
							}
						},{
							text : '下一個',
							xtype : 'button',
							handler : function() {
								
							}
						}
						]
				}, {
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
										width : '110'
									}, {
										text : '网点名称',
										dataIndex : 'name',
										width : '200'
					}],
					listeners : {
						'itemdblclick' : function(view, record, item,
								index, e) {
							bankid = record.get("id");	
							var codeandname=record.get("code")+" "+record.get("name");
							Ext.getCmp(formId).setValue(codeandname);
							this.up('window').close();								
						}
					}
				}],
				buttons : [{
					text : '刷新',
					handler : function() {
						bankStore.load( {
								params : {
									codeorname :Ext.getCmp('bankcode').getValue()
								}
						});
					}
				}, {
					text : '确定',
					handler : function() {
						var records =Ext.getCmp('gridBank').getSelectionModel().getSelection();
						if(records.length<1)
							return;
						bankid= records[0].get("id");	
						var codeandname=records[0].get("code")+" "+records[0].get("name");
						Ext.getCmp(formId).setValue(codeandname);
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
}
function choseBank1(){
	Ext.widget('window', {
		title : '快速选择',
		width : 400,
		height : 310,
		layout : 'fit',
		resizable : false,
		modal : true,
		items : [ new Ext.FormPanel({
		id:'Form',
		bodyPadding : 5,
		items : [{
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
										codeorname :Ext.getCmp('bankcode').getValue()
									}
								});
							    
							}
						},{
							text : '下一個',
							xtype : 'button',
							handler : function() {
								
							}
						}
						]
				}, {
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
										width : '210'
									}, {
										text : '网点名称',
										dataIndex : 'name',
										width : '200'
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
									codeorname :Ext.getCmp('bankcode').getValue()
								}
						});
					}
				}, {
					text : '确定',
					handler : function() {
						var records =Ext.getCmp('gridBank').getSelectionModel().getSelection();
						if(records.length<1)
							return;
						bankid= records[0].get("id");	
						var codeandname=records[0].get("code")+" "+records[0].get("name");
						Ext.getCmp('adduser_bank_code').setValue(codeandname);
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
}


/** ******************************************************************************** */
/*
 * 内部挂账账户
 */

/**
 * 
 */
function addInnerHangingAccountDialog(gridPanel){
	
	var addInnerHangingAccountDialog = new Ext.FormPanel({
		id:'InnerHanging',
	    frame:true,
	    bodyStyle:'padding:5px 5px 0 5px',
		defaultType: 'textfield',
			items : [/*{
							id: 'InnerHangingAccountBankCode',
							xtype: 'textfield',
							fieldLabel: '所属网点',
							readOnly: 'true',
							msgTarget: 'side',
							allowBlank: false,
							value: ''
						}, {
							id: 'btn_bank_code_Agency_add',
							xtype: 'button',
							text: '查询',
							width: 80,
							iconCls : 'log',
							handler: function(){
								choseBank('InnerHangingAccountBankCode');
							}
						},*/
						{
							xtype: 'panel',
							border: 0,
							width: 350,
							layout: 'hbox',
							bodyStyle: "background:#DFE9F6;padding:0px 0px 5px 0px",
							hidden:isHost=='true'?false:true,
							items: [{
								id: 'InnerHangingAccountBankCode',
								xtype: 'textfield',
								fieldLabel: '所属网点',
								readOnly: 'true',
								msgTarget: 'side',
								allowBlank: false,
								value: ''
							}, {
								id: 'btn_bank_code_Agency_add',
								xtype: 'button',
								text: '查询',
								iconCls : 'log',
								handler: function(){
									choseBank('InnerHangingAccountBankCode');
								}
							}]
						},
						{
							id :'AgentPayeeAccountName',
							fieldLabel : '账户名称'
						},{
							id :'AgentPayeeAccountNo',
							fieldLabel : '账号'
						},{
							id :'AgentPayeeAdmdivCode',
							xtype : 'combo',
							fieldLabel : '所属财政',
							dataIndex : 'admdivCode',
							displayField: 'admdiv_name',
							emptyText: '请选择',
							valueField: 'admdiv_code',
							editable :false,
							store: comboAdmdiv
						},{
							id :'AgentPayeeIsValid',
							xtype : 'checkbox',
							fieldLabel : '是否有效',
							checked : true,
							hidden : true
						}
					],
			buttons: [
						{
	                  	  text: '确定',
	                      handler: function() {
	                      	
							var index = gridPanel.getStore().findBy(function(record,id){
								var a = Ext.getCmp("InnerHangingAccountBankCode").getValue();
								var b = record.get("bank_code");
								if(a.indexOf(b) != -1) {
									return true;
								}
								return false;
							});
	                      	
	                      	if( Ext.isEmpty( Ext.getCmp('InnerHangingAccountBankCode').getValue()) && isHost=='true' ){
								Ext.Msg.alert("系统提示", "所属网点不能为空！");
							}else if( Ext.isEmpty( Ext.getCmp('AgentPayeeAccountName').getValue()) ){
								Ext.Msg.alert("系统提示", "账户名称不能为空！");
							}else if( Ext.isEmpty( Ext.getCmp('AgentPayeeAccountNo').getValue())){
								Ext.Msg.alert("系统提示", "账号不能为空！");
							}else if( Ext.isEmpty( Ext.getCmp('AgentPayeeAdmdivCode').getValue() ) ){
								Ext.Msg.alert("系统提示", "所属财政不能为空！");
							}
							//一个网点只能有一个内部挂账账户
							else if (index == true) {
								Ext.Msg.alert("系统提示", "该网点已有挂账户，至多维护一个！");
							}
							
							else{
								if(Ext.getCmp('AgentPayeeIsValid').getValue() == true){
									a_is_valid = "1";
								}
								addInnerHangingAccount(this.up('window'));
								Ext.getCmp('InnerHanging').getForm().reset();
								this.up('window').close();
							}
	                   	 }
	              	   },
					   {
	                     text: '取消',
	                     handler: function() {
	                     	this.up('window').close();
	                     }
	                   }]
		});
	
	var dialog=Ext.widget('window', {
		title : '添加账户',
		width : 350,
		layout : 'fit',
		resizable : false,
		modal : true,
		items : [ addInnerHangingAccountDialog ]
	}).show();
}

function addInnerHangingAccount(win){
	var myMask = new Ext.LoadMask(Ext.getBody(), {
			msg : '后台正在处理中，请稍后....',
			removeMask : true // 完成后移除
		});
	myMask.show();
	// 提交到服务器操作
	Ext.Ajax.request({
		url : 'addInnerHangingAccount.do',
        method: 'POST',
		timeout:180000,  //设置为3分钟
		params : {
			account_name : Ext.getCmp('AgentPayeeAccountName').getValue(), 
			account_no : Ext.getCmp('AgentPayeeAccountNo').getValue(),
			admdiv_code : Ext.getCmp('AgentPayeeAdmdivCode').getValue(),
			bankid : bankid,
//			isHost : isHost,
			is_valid : a_is_valid
		},
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
}

/** ******************************************************************************** */
