/**
 * 全省清算账户维护
 */

/**
 * 列表
 */
var gridPanel1 = null;
var networkPanel = null;
var bankid = null;
var loadBankCode ;
var loadBankName ;

/*******************************************************************************
 * 引入需要使用的js文件
 */
document
		.write('<scr'
				+ 'ipt type="text/javascript" src="/realware/resources/js/recommend.js"></scr'
				+ 'ipt>');

/**
 * 数据项
 */
var fileds = [ "account_id", "account_name", "account_no", "bank_code",
		"bank_name", "bank_no", "org_code", "fund_type_code", "is_samebank",
		"is_pbc", "admdiv_code", "create_date", "is_valid", "fund_type_name",
		"pay_type_code", "pay_type_name" ,"bank_id"];
/**
 * 列名
 */
var header = "账户名称|account_name|200,账号|account_no|170,网点编码|bank_code|80,"
		+ "开户行名称|bank_name|150,银行行号|bank_no|100,机构类型|org_code|70,"
		+ "资金性质编码|fund_type_code|90,资金性质名称|fund_type_name|90,支付方式编码|pay_type_code|90,支付方式名称|pay_type_name|90,是否同行账户|is_samebank|80,"
		+ "是否人行账户|is_pbc|80,所属财政|admdiv_code|150,创建时间|create_date|100,是否有效|is_valid|60";

var netfileds = [ "id", "code", "name" ];
var netheader = "网点编码|code|100,网点名称|name|180";
var required = '<span style="color:red;font-weight:bold" data-qtip="Required">*</span>';


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

//支付方式的store
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

/**
 * 界面加载
 */
Ext.require([ "Ext.grid.*", "Ext.data.*" ]);
Ext.onReady(function() {
			Ext.QuickTips.init();
			gridPanel1 = getGrid('/realware/loadClearAccount.do', header,
					fileds, true, true);
			gridPanel1.setHeight(document.documentElement.scrollHeight - 100);
			gridPanel1.getStore().on('beforeload', function(thiz, options) {
				if (null == options.params || options.params == undefined) {
					options.params = [];
				}
				options.params["filedNames"] = JSON.stringify(fileds);
				var admdiv = Ext.getCmp('admdivCom').getValue();
				options.params["admdivCode"] = admdiv;
				options.params["menu_id"] = Ext.PageUtil.getMenuId();
			});

			var buttonItems = [
					{
						id : 'addBtn',
						handler : function() {
							addClear();
						}
					},
					{
						id : 'editBtn',
						handler : function() {
							editClear();
						}
					},
					{
						id : 'deleteBtn',
						handler : function() {
							deleteClearAccountDialog(gridPanel1);
						}
					},
					{
						id : 'refreshBtn',
						handler : function() {
							refreshData();
						}
					} ];

			var queryItems = [ {
				xtype : 'panel',
				layout : 'border',
				height : heights,
				items : [{
							region : 'center',
							xtype : 'panel',
							items : [
									{
										title : '查询条件',
										bodyPadding : 8,
										layout : 'hbox',
										defaults : {
											margins : '3 10 0 0'
										},
										items : [
												{
													id : 'admdivCom',
													fieldLabel : '所属财政',
													xtype : 'combo',
													displayField : 'admdiv_name',
													emptyText : '请选择',
													valueField : 'admdiv_code',
													labelWidth : 55,
													editable : false,
													store : comboAdmdiv,
													value : comboAdmdiv.data.length > 0 ? comboAdmdiv.data
															.getAt(0)
															.get("admdiv_code")
															: '',
													listeners : {
														'select' : selectAdmdiv
													}
												}, {
													id : 'accountNameField',
													fieldLabel : '账户名称',
													xtype : 'textfield',
													dataIndex : 'account_name',
													labelWidth : 55
												}, {
													id : 'accountNoField',
													fieldLabel : '账号',
													xtype : 'textfield',
													dataIndex : 'account_no',
													labelWidth : 30
												} ],
										flex : 2
									}, gridPanel1 ]
						} ]
			} ];
			
			var admdiv_code = Ext.getCmp("admdiv_code");
	          admdiv_code.renderer = function(value){
	               for(var i=0;i<comboAdmdiv.data.length;i++){
	                  if(value == comboAdmdiv.data.getAt(i).get("admdiv_code")){
	                     return comboAdmdiv.data.getAt(i).get("admdiv_name");
	                  }
	               }
	          };	

			Ext.StatusUtil.createViewport(buttonItems, queryItems, function() {
				Ext.StatusUtil.initPage(Ext.getCmp('admdivCom'));
			});
			selectAdmdiv(true);
		});

function selectAdmdiv(refresh,funcName) {
	
	var admdiv = Ext.getCmp('admdivCom').getValue();		
	if ("" == admdiv || null == admdiv) return;		
	comboFundType.load({
					params : {
						admdiv_code : Ext.getCmp('admdivCom').getValue(),
						ele_code : 'FUND_TYPE'
					}
	});
	//加载支付方式的要素值
	comboPayType.load({
		params : {
			admdiv_code : Ext.getCmp('admdivCom').getValue(),
			ele_code : 'PAY_TYPE'
		}
	});
	//加载主办行并回显
	if(!refresh){
		if(funcName == 'AclearAdmdivCode'){
			var index = comboAdmdiv.find('admdiv_code',Ext.getCmp('AclearAdmdivCode').getValue());
			
			Ext.getCmp("adduser_bank_code").setValue(comboAdmdiv.getAt(index).get('manager_bank_code')+' '+comboAdmdiv.getAt(index).get('manager_bank_name'));
			bankid = comboAdmdiv.getAt(index).get('manager_bank_id');
		}else if(funcName == 'EClearAdmdivCode'){
			var index = comboAdmdiv.find('admdiv_code',Ext.getCmp('EClearAdmdivCode').getValue());
			
			Ext.getCmp("edituser_bank_code").setValue(comboAdmdiv.getAt(index).get('manager_bank_code')+' '+comboAdmdiv.getAt(index).get('manager_bank_name'));
			bankid = comboAdmdiv.getAt(index).get('manager_bank_id');
		}
	}
	if(refresh){
		refreshData();
	}
	
}
/*******************************************************************************
 * 网点加载
 */
function selectNet() {
	networkPanel.getStore().load({
		method : 'post',
		params : {
			start : 0,
			pageSize : 200,
			filedNames : JSON.stringify(netfileds),
			codeorname : Ext.getCmp('netcode').getValue()
		},
		callback: function(records, operation, success) {
	       if(records.length > 0){
	    	   var netcode = records[0].get("code");
	    		refreshData(netcode);
	       }
	    }
	});
}

function refreshData(bankcode) {
	var jsonMap = "[{";
	var accountname = Ext.getCmp('accountNameField').getValue();
	var accountno = Ext.getCmp('accountNoField').getValue();
	var admdiv = Ext.getCmp('admdivCom').getValue();
	if ("" == admdiv || null == admdiv)
		return;
	if ("" != accountname && null != accountname) {
		var jsonStr = [];
		jsonStr[0] = "LIKE";
		jsonStr[1] = accountname;
		jsonMap = jsonMap + "\"account_name\":" + Ext.encode(jsonStr) + ",";
	}
	if ("" != accountno && null != accountno) {
		var jsonStr = [];
		jsonStr[0] = "LIKE";
		jsonStr[1] = accountno;
		jsonMap = jsonMap + "\"account_no\":" + Ext.encode(jsonStr) + ",";
	}


	var str = [];
	str[0] = "<>";
	str[1] = "";
	jsonMap = jsonMap + "\"bank_code\":" + Ext.encode(str) + ",";
	
	var jsonStr = [];
	jsonStr[0] = "=";
	jsonStr[1] = admdiv;
	jsonMap = jsonMap + "\"admdiv_code\":" + Ext.encode(jsonStr) + ",";
	data = jsonMap.substring(0, jsonMap.length - 1) + "}]";

	gridPanel1.getStore().load({
		method : 'post',
		params : {
			start : 0,
			pageSize : 200,
			filedNames : JSON.stringify(fileds),
			jsonMap : data
		}
	});
}

function addClear(){
	var addClearAccountDialog = new Ext.FormPanel({
		id:'AclearForm',
	    labelWidth: 75,
	    frame:true,
	    bodyStyle:'padding:5px 5px 0',
	    width: 350,
	    defaults: {width: 300},
	    defaultType: 'textfield',
			items : [ {
				id :'AclearAdmdivCode',
				xtype : 'combo',
				fieldLabel : '所属财政',
				dataIndex : 'admdivCode',
				displayField: 'admdiv_code_name',
				emptyText: '请选择',
				valueField: 'admdiv_code',
				editable :false,
				store: comboAdmdiv,
				afterLabelTextTpl : required,
				listeners : {
						'select' : function(){
							selectAdmdiv(false,'AclearAdmdivCode');
						}
				}
				
			},{
				xtype :'panel',
				border:0,
				width:350,
				layout: 'hbox', 
				bodyStyle: "background:#DFE9F6",
				defaults : {
					margins : '3 0 5 0'
				},
				items:[{
							id : 'adduser_bank_code',
							xtype : 'textfield',
							fieldLabel : '所属网点',
							emptyText:'请点击【查询】选择',
							readOnly: 'true',
							labelWidth: 100,
							msgTarget: 'side',
							allowBlank: false,
							afterLabelTextTpl : required,
							value : (!Ext.isEmpty(loadBankCode,false))?loadBankCode+' '+loadBankName:''
						},
						{
							id : 'btn_bank_code',
							xtype : 'button',
							text : '查询',
							handler : function() {
								choseBank1();						
							}											
						}]	
						},
						{
							id :'AclearAccountName',
							vtype:"accountName",
							allowBlank : false,
							afterLabelTextTpl : required,
							fieldLabel : '账户名称'
						},{
							id :'AclearAccountNo',
							vtype:"accountId",
							afterLabelTextTpl : required,
							allowBlank : false,
							fieldLabel : '账号'
						},{
							id :'AclearBankName',
							fieldLabel : '开户行名称',
							afterLabelTextTpl : required,
							allowBlank : false,
							regex:/^([\w\d\u4e00-\u9fa5]{1,60})$/,
							regexText :'银行名称只能是数字字母和汉字，长度不超过60'
						},{
							id :'AclearBankNo',
							fieldLabel : '银行行号',
							afterLabelTextTpl : required,
							allowBlank : false,
							regex:/^\d+$/,
							regexText : '收款行号只能是数字'
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
	                    	if( Ext.isEmpty(Ext.getCmp('adduser_bank_code').getValue())){
									Ext.Msg.alert("系统提示", "所属网点不能为空！");
							} else if( Ext.isEmpty(Ext.getCmp('AclearAccountName').getValue())){
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
									a_is_valid = "1";
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
										bank_id : bankid,
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
										Ext.getCmp('AclearForm').getForm().reset();
										dialog.close();
										refreshData();
									},
									// 提交失败的回调函数
									failure : function(response, options) {
										failAjax(response,myMask);
									}
								});
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
		height : 410,
		layout : 'fit',
		resizable : false,
		modal : true,
		items : [ addClearAccountDialog ]
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
							    loadNetWorkByNetMsg('loadnetworkTree','bankcode') ;
							}
						}

						]
				}, {
					title : '网点信息',
					id : 'loadnetworkTree',
					width : 376,
					xtype : 'NetworkTree',
					listeners : {
						'itemdblclick' : function(view, record, item,
								index, e) {
							bankid = record.raw.id;
							loadBankCode = record.raw.code;
							loadBankName = record.raw.text;
							loadBankLevel = record.raw.level; 
							var codeandname=loadBankCode+" "+loadBankName;
							Ext.getCmp('adduser_bank_code').setValue(codeandname);
							this.up('window').close();								
						}
					}
				}
				],
				buttons : [{
					text : '确定',
					handler : function() {
						var records =Ext.getCmp('loadnetworkTree').getSelectionModel().getSelection();
						if(records.length<1)
							return;
						bankid= records[0].raw.id;
						loadBankCode = records[0].raw.code;
						loadBankName = records[0].raw.text;
						loadBankLevel = records[0].raw.level; 
						var codeandname=records[0].raw.code+" "+records[0].raw.text;
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
function editClear() {
	
	// 当前选中的数据
	var e_recordsr = gridPanel1.getSelectionModel().getSelection();
	if (e_recordsr.length != 1) {
		Ext.Msg.alert("系统提示", "请选择一条数据！");
		return;
	}
	accountId = e_recordsr[0].get("account_id");
	var mis_samebank_b = false;
	if ("是" == e_recordsr[0].get("is_samebank")) {
		mis_samebank_b = true;
	}
	var mis_valid_b = false;
	if ("有效" == e_recordsr[0].get("is_valid")) {
		mis_valid_b = true;
	}
	var mis_pbc_b = false;
	if ("是" == e_recordsr[0].get("is_pbc")) {
		mis_pbc_b = true;
	}
//	loadBankCode = e_recordsr[0].get("bank_code");
//	var index = comboAdmdiv.find('manager_bank_code',loadBankCode);
//	loadBankName  = comboAdmdiv.getAt(index).get('manager_bank_name');
	var fundType = false;
	var editBankAccountDialog = new Ext.FormPanel({
		id : 'EClearForm',
		labelWidth : 75,
		frame : true,
		bodyStyle : 'padding:5px 5px 0',
		width : 350,
		defaults : {
			width : 300
		},
		defaultType : 'textfield',
		items : [{
					id : 'EClearAdmdivCode',
					xtype : 'combo',
					fieldLabel : '所属财政',
					displayField : 'admdiv_code_name',
					emptyText : '请选择',
					valueField : 'admdiv_code',
					editable : false,
					store : comboAdmdiv,
					afterLabelTextTpl : required,
					listeners : {
							'select' : function(){
								selectAdmdiv(false,'EClearAdmdivCode');
							}
					}
				},
				{
					xtype: 'panel',
					border: 0,
					width: 350,
					layout: 'hbox',
					bodyStyle: "background:#DFE9F6;padding:0px 0px 5px 0px",
					items: [{
						id: 'edituser_bank_code',
						xtype: 'textfield',
						fieldLabel: '所属网点',
						readOnly: 'true',
						msgTarget: 'side',
						afterLabelTextTpl : required,
						allowBlank: false,
						value: ''
					}, {
						id: 'btn_bank_code',
						xtype: 'button',
						text: '查询',
						iconCls : 'log',
						handler: function(btn){
							new pb.ChooseBankWindow({
								listeners:{
									afterchoose:function(window,bankInfo){
										bankid = bankInfo.bankId; 
										var codeandname=bankInfo.bankcode+" "+bankInfo.bankname;
										btn.up("panel").down("textfield").setValue(codeandname); 
										Ext.getCmp('EClearBankName').setValue(bankInfo.bankname);
									}
								}
							}).show()
						}
					}]
				}
//				{
//					xtype :'panel',
//					border:0,
//					width:350,
//					layout: 'hbox', 
//					bodyStyle: "background:#DFE9F6",
//					defaults : {
//						margins : '3 0 5 0'
//					},
//					items:[{
//						id : 'edituser_bank_code',
//						xtype : 'textfield',
//						fieldLabel : '所属网点',
//						emptyText:'请点击【查询】选择',
//						readOnly: 'true',
//						labelWidth: 100,
//						msgTarget: 'side',
//						allowBlank: false,
//						afterLabelTextTpl : required,
//						value : (!Ext.isEmpty(loadBankCode,false))?loadBankCode+" "+loadBankName:''
//					}, {
//						id : 'btn_bank_code',
//						xtype : 'button',
//						text : '查询',
//						handler : function() {
//							choseBank1();						
//						}											
//					}]	
//				}
				,{
					id : 'EClearAccountName',
					fieldLabel : '账户名称',
					vtype:"accountName",
					allowBlank : false,
					afterLabelTextTpl : required,
					value : e_recordsr[0].get("account_name")
				}, {
					id : 'EClearAccountNo',
					fieldLabel : '账号',
					afterLabelTextTpl : required,
					value : e_recordsr[0].get("account_no")
				},{
					id : 'EClearBankName',
					fieldLabel : '开户行名称',
					value : e_recordsr[0].get("bank_name"),
					allowBlank : false,
					afterLabelTextTpl : required,
					regex:/^([\w\d\u4e00-\u9fa5]{1,60})$/,
					regexText :'银行名称只能是数字字母和汉字，长度不超过60'
				}, {
					id : 'EClearBankNo',
					fieldLabel : '银行行号',
					value : e_recordsr[0].get("bank_no"),
					allowBlank : false,
					afterLabelTextTpl : required,
					regex:/^\d+$/,
					regexText : '收款行号只能是数字'
				}, {
					id : 'EClearFundTypeCode',
					xtype : 'combo',
					fieldLabel : '资金性质',
					displayField : 'name',
					emptyText : '请选择',
					valueField : 'code',
					afterLabelTextTpl : required,
					queryMode : 'local',
					store : comboFundType
				}, {
					id :'AclearPayTypeCode',
					xtype : 'combo',
					fieldLabel : '支付方式',
					displayField: 'name',
					emptyText: '请选择',
					valueField: 'code',
					afterLabelTextTpl : required,
					queryMode : 'local',
					store: comboPayType
				},{
					id : 'EClearOrgCode',
					fieldLabel : '机构类型',
					value : e_recordsr[0].get("org_code"),
					afterLabelTextTpl : required,
					regex:/^\d+$/,
					regexText : '机构类型只能是数字'
				}, {
					id : 'EClearIsSameBank',
					xtype : 'checkbox',
					fieldLabel : '是否同行账户',
					checked : mis_samebank_b
				}, {
					id : 'EClearIsPbc',
					xtype : 'checkbox',
					fieldLabel : '是否人行账户',
					checked : mis_pbc_b
				}],
		buttons : [{
					formBind : true,
					text : '确定',
					handler : function() {
						if (Ext.getCmp('EClearAccountName').getValue() == "") {
							Ext.Msg.alert("系统提示", "账户名称不能为空！");
						} else if (Ext.getCmp('EClearAccountNo').getValue() == "") {
							Ext.Msg.alert("系统提示", "账号不能为空！");
						} else if (Ext.getCmp('edituser_bank_code').getValue() == "") {
							Ext.Msg.alert("系统提示", "所属网点不能为空！");
						} else if (Ext.getCmp('EClearBankName').getValue() == "") {
							Ext.Msg.alert("系统提示", "银行名称不能为空！");
						} else if (Ext.getCmp('EClearAdmdivCode').getValue() == "") {
							Ext.Msg.alert("系统提示", "所属财政不能为空！");
						} else if( !Ext.isEmpty (Ext.getCmp('AclearPayTypeCode').getValue()) 
								&& Ext.isEmpty (Ext.getCmp('EClearFundTypeCode').getValue())){
							Ext.Msg.alert("系统提示", "已选取支付方式，则资金性质不能为空！");
						}
						else if (Ext.getCmp('EClearOrgCode').getValue() == "") { 
							Ext.Msg.alert("系统提示", "机构类型不能为空！");
						} else if( (Ext.getCmp('EClearIsSameBank').getValue() == Ext.getCmp('EClearIsPbc').getValue()) && (Ext.getCmp('EClearIsPbc').getValue() =="1") ) {
								Ext.Msg.alert("系统提示", "同行账户与人行账户不能同时选中！");
						} else {
//							var index = comboAdmdiv.find('manager_bank_code',Ext.getCmp('edituser_bank_code').getValue().split(" ")[0]);
//							bankId  = comboAdmdiv.getAt(index).get('manager_bank_id');
							bankId = bankid;
								e_is_valid = "1";
							if (Ext.getCmp('EClearIsSameBank').getValue() == true) {
								e_is_sameBank = "1";
							}else{
								e_is_sameBank = "0";
							} 
							
							if (Ext.getCmp('EClearIsPbc').getValue() == true) {
								e_is_pbc = "1";
							}else{
								e_is_pbc = "0";
							} 
							
							if (Ext.getCmp('EClearBankNo').getValue() == "") {
								Ext.Msg.alert("系统提示", "跨行清算银行行号不能为空！");
								return;
							}
							
							var myMask = new Ext.LoadMask(Ext.getBody(), {
								msg : '后台正在处理中，请稍后....',
								removeMask : true
									// 完成后移除
								});
							myMask.show();
							// 提交到服务器操作
							Ext.Ajax.request({
										url : 'editClearAccount.do', 
						        		method: 'POST',
										timeout:180000,  //设置为3分钟
										params : {
											bank_id : bankId,
											account_name : Ext.getCmp('EClearAccountName').getValue(),
											account_no : Ext.getCmp('EClearAccountNo').getValue(),
											account_id : accountId,
											bank_name : Ext.getCmp('EClearBankName').getValue(),
											bank_no : Ext.getCmp('EClearBankNo').getValue(),
											admdiv_code : Ext.getCmp('EClearAdmdivCode').getValue(),
											fund_type_code : Ext.getCmp('EClearFundTypeCode')
													.getValue(),
											pay_type_code : Ext.getCmp('AclearPayTypeCode').getValue(),
											org_code : Ext.getCmp('EClearOrgCode').getValue(),
											is_valid : e_is_valid,
											is_samebank : e_is_sameBank,
											is_pbc : e_is_pbc
										},
										// 提交成功的回调函数
										success : function(response, options) {
											succAjax(response, myMask);
											Ext.getCmp('EClearForm').getForm().reset();
											win1.close();
											refreshData();
										},
										// 提交失败的回调函数
										failure : function(response, options) {
											failAjax(response, myMask);
										}
									});
						}
					}
				}, {
					text : '取消',
					handler : function() {
						this.up('window').close();
					}
				}]
	});

	Ext.getCmp('EClearAdmdivCode').setValue(e_recordsr[0].get("admdiv_code"));
	Ext.getCmp('EClearFundTypeCode').setValue(e_recordsr[0].get("fund_type_code"));
	Ext.getCmp('AclearPayTypeCode').setValue(e_recordsr[0].get("pay_type_code"));
	Ext.getCmp('edituser_bank_code').setValue(e_recordsr[0].get("bank_code") );
	bankid=e_recordsr[0].get("bank_id");
	var win1 = Ext.widget('window', {
				title : '修改账户',
				width : 350,
				height : 400,
				layout : 'fit',
				resizable : false,
				modal : true,
				items : [editBankAccountDialog]
			}).show();
}