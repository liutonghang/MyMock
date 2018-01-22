/*******************************************************************************
 * 主要用于用户维护
 * 
 * @type
 */

var userPanel = null;
var networkPanel =null;
var isHost = true;


/***
 * 引入需要使用的js文件
 */
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/recommend.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/AccountSyn.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/importFile.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/Account_Del.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/Account_Edit.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/Account_Add.js"></scr' + 'ipt>');
/**
 * 数据项
 */
var fileds = ["account_id","account_name","account_no","account_type_code","bank_code","bank_name","admdiv_code","create_date","is_valid","fund_type_code","fund_type_name","bank_id"];

/**
 * 列名
 */
var header = "账户名称|account_name|200,账号|account_no|170,账户类型|account_type_code|120,网点编码|bank_code|80,网点名称|bank_name|150,"
		+ "所属财政|admdiv_code|150,创建时间|create_date|100,资金性质编码|fund_type_code|150,资金性质名称|fund_type_name|150";


/**
 * 当前用户所属网点是否为主办网点
 */
//var netfileds = ["id", "code", "name"];
//var netheader="网点编码|code|100,网点名称|name|180";
//
//var comboFundType = Ext.create('Ext.data.Store', {
//	fields : ['id','code', 'name'],
//	proxy : {					
//			type : 'ajax',
//			url : '/realware/loadElementValue.do',
//			reader : {
//				type : 'json'
//			}
//		},
//	autoload : false
//	
//});

//var comboStore2 = Ext.create('Ext.data.Store', {
//			fields : ['name', 'value'],
//			data : [{
//						"name" : "全部网点",
//						"value" : "001"
//					}, {
//						"name" : "指定网点",
//						"value" : "002"
//					}]
//		});


//var bankid =null; 
/*******************************************************************************
 * 界面加载
 */
Ext.onReady(function() {
	Ext.QuickTips.init();
	Ext.syncRequire(['js.view.common.Network']);
	if (userPanel == null) {
		userPanel = getGrid(loadUrl, header, fileds, true, true);
		userPanel.setHeight(document.documentElement.scrollHeight - 100);	
		userPanel.getStore().on('beforeload', function(thiz, options) {
			var panel = Ext.ComponentQuery.query("panel[title='划款户查询']")[0];
			beforeload(panel, options, Ext.encode(fileds));
//			var records = networkPanel.getSelectionModel().getSelection();
//			if (records && records.length > 0) {
//				var netcode  = records[0].raw.code;
//				var params = Ext.decode(options.params.jsonMap);
//				params.push({"bank_code" : ["=", netcode]});
//				options.params.jsonMap = Ext.encode(params);
//				options.params.bankId  = records[0].raw.id;
//			//全部网点加载
//			}else{
				var params = Ext.decode(options.params.jsonMap);
				params.push({"bank_code" : ["<>", ""]});
				options.params.jsonMap = Ext.encode(params);
//			}
		
		});
	}

//	if(networkPanel ==null){
//		networkPanel = 	Ext.create('NetworkTree');
//		networkPanel.setHeight(document.documentElement.scrollHeight - 100);
//	}
	
	Ext.create('Ext.Viewport', {
				id : 'UserFrame',
				layout : 'fit',
				items : [Ext.create('Ext.panel.Panel', {	
							layout: 'border', 
							renderTo: Ext.getBody() ,
							items :[{
								region: 'north',
								height: 34,
								tbar : [{	
									id : 'buttongroup',
									xtype : 'buttongroup',
									items : [{
											id : 'add',
											text : '新增',
											iconCls : 'add',
											scale : 'small',
											handler : function() {
											addAdvanceAgentForNet(true);
											}
										}, {
											id : 'edit',
											text : '修改',
											iconCls : 'edit',
											scale : 'small',
											handler : function() {
											editAdvanceAgentForNet(userPanel);;
											}
										}, {
											id : 'delete',
											text : '删除',
											iconCls : 'delete',
											scale : 'small',
											handler : function() {
											deleteAdvanceAgentDialog(userPanel);
											}
//										},{
//											id : 'input',
//											text : '导入',
//											iconCls : 'import',
//											scale : 'small',
//											handler : function() {
//											  importFile(importUrl, 'txt',  Ext.getCmp('admdivCom').getValue());
//											}
										},{
											id : 'refresh',
											text : '刷新',
											iconCls : 'refresh',
											scale : 'small',
											handler : function() {
												refreshData();
											}									
									}]
								}]
							}
//取消左侧网点树
//							,{
//								id :'netgird',
//								region: 'west',
//								xtype : 'panel',
//								width: 250,
//								viewConfig : {
//									enableTextSelection : true
//								}
//								,
//								items:[{
//									title: '网点过滤查询',
//									bodyPadding : 8,
//									layout : 'hbox',
//									defaults : {
//											margins : '3 10 0 0'
//									},
//									items:[{
//											id : 'netcode',	
//											xtype : 'textfield',
//											dataIndex : 'netcode',
//											width: 100
//										}, {
//											id : 'netrefresh',
//											xtype : 'button',
//											iconCls : 'refresh',
//											scale : 'small',
//											handler : function() {
//												selectNet();
//											}				
//										},{
//												id : 'netState',
//												xtype : 'combo',
//												dataIndex : 'net_state',
//												displayField : 'name',
//												emptyText : '请选择',
//												valueField : 'value',
//												width : 85,
//												store : comboStore2,
//												value : '001',
//												editable : false,
//												listeners : {
//													'select' : selectNetState
//												}
//										}],
//									flex : 2
//								},networkPanel]
								
//							}
							,{								
								region: 'center',
								xtype : 'panel',
								items : [{
										title : '划款户查询',
										bodyPadding : 8,
										layout : 'hbox',
										defaults : {
											margins : '3 10 0 0'
										},   
										items : [{
													id : 'admdivCom',
													fieldLabel : '所属财政',
													xtype : 'combo',
													displayField : 'admdiv_name',
													dataIndex :  'admdiv_code',
													emptyText : '请选择',
													valueField : 'admdiv_code',
													labelWidth : 60,
													editable : false,
													store : comboAdmdiv,
													value : comboAdmdiv.data.length > 0 ? comboAdmdiv.data
															.getAt(0).get("admdiv_code") : "",
													listeners : {
														'select' : selectAdmdiv
													}
												}, {
													id : 'accountNameField',
													fieldLabel : '账户名称',
													xtype : 'textfield',
													dataIndex : 'account_name',
													value : '',
													labelWidth : 60
												}, {
													id : 'accountNoField',
													fieldLabel : '账号',
													xtype : 'textfield',
													dataIndex : 'account_no',
													labelWidth : 30,
													value : ''
												}
												],
										flex : 2
									}, 
										userPanel
										
									]
							}]
						})]
			});
	setBtnVisible(null, Ext.getCmp("buttongroup"));
	selectNetState();
	
	var account_type = Ext.getCmp("account_type_code");
	 account_type.renderer = function(value){
	    if(value=='32'){
	    	return '授权支付划款户';
	    }else if(value=='31'){
	    	return '直接支付划款户';
	    }else if(value=='310'){
	    	return '直接支付退款划款户';
	    }else if(value=='320'){
	    	return '授权支付退款划款户';
	    }
	 };
	var admdiv_code = Ext.getCmp("admdiv_code");
	          admdiv_code.renderer = function(value){
	               for(var i=0;i<comboAdmdiv.data.length;i++){
	                  if(value == comboAdmdiv.data.getAt(i).get("admdiv_code")){
	                     return comboAdmdiv.data.getAt(i).get("admdiv_name");
	                  }
	               }
	          };
	
	// 凭证选中刷新明细
//	networkPanel.on("cellclick", function(g, rowIndex, columnIndex, e) {
//		refreshData();
//	});
		
});

//切换财政时回显网点信息
function selectAdmdiv(refresh,str) {
	setBtnVisible(Ext.getCmp("admdivCom").getValue(), Ext.getCmp("buttongroup"));
	if(!refresh){
		//新增账户
		if('AclearAdmdivCode' == str ){
			var index = comboAdmdiv.find('admdiv_code',Ext.getCmp('AagentAdmdivCode').getValue());
			
			Ext.getCmp("AagencyZeroAccountBankCode").setValue(comboAdmdiv.getAt(index).get('manager_bank_code')+' '+comboAdmdiv.getAt(index).get('manager_bank_name'));
			bankid = comboAdmdiv.getAt(index).get('manager_bank_id');
		}//修改账户
		else if('EagentAdmdivCode' == str){
			var index = comboAdmdiv.find('admdiv_code',Ext.getCmp('EagentAdmdivCode').getValue());
			
			Ext.getCmp("EagencyZeroAccountBankCode").setValue(comboAdmdiv.getAt(index).get('manager_bank_code')+' '+comboAdmdiv.getAt(index).get('manager_bank_name'));
			bankid = comboAdmdiv.getAt(index).get('manager_bank_id');
		}
	}
	//主界面切换财政,刷新
	else{
		refreshData();
	}
	

}

/*******************************************************************************
 * 网点加载
 */
function selectNet(){	
	refresh1();
}
/**
 * 全部，部分切换
*/
function selectNetState(){
//	networkPanel.getSelectionModel().deselectAll();
//	var netState=Ext.getCmp('netState').getValue();
//	if('001'==netState){
//		Ext.getCmp('netcode').disable(false);
//		Ext.getCmp('netrefresh').disable(false);
//		networkPanel.setDisabled(true);
//		Ext.getCmp('netcode').setValue("");
//	}else{
//		Ext.getCmp('netcode').enable(false);
//		Ext.getCmp('netrefresh').enable(false);
//		networkPanel.setDisabled(false);
//		var childNodes = networkPanel.getRootNode().childNodes;
//		if(!Ext.isEmpty(childNodes)) {
//			var model = networkPanel.getSelectionModel();
//			model.select(childNodes[0], true);
//			networkPanel.fireEvent("itemclick", networkPanel, childNodes[0]);
//		}
//	}
	refreshData();
}



/*******************************************************************************
 * 刷新
 * 
 * @return
 */

function refreshData() {
	comboFundType.load({
		params : {
			admdiv_code : Ext.getCmp('admdivCom').getValue(),
			ele_code : 'FUND_TYPE'
		}
	});
	userPanel.getStore().loadPage(1);
}

function addAdvanceAgentForNet(isAgent){
	var addAgencyZeroAccountDialog = new Ext.FormPanel({
		id:'AagencyZeroForm',
	    frame:true,
	    bodyStyle:'padding:5px 5px 0 5px',
		defaultType: 'textfield',
		items: [
			
//				{
//					id: 'AagentAdmdivCode',
//					xtype: 'combo',
//					fieldLabel: '所属财政',
//					dataIndex: 'admdivCode',
//					displayField: 'admdiv_name',
//					emptyText: '请选择',
//					valueField: 'admdiv_code',
//					allowBlank: false,
//					editable: false,
//					store: comboAdmdiv
//				},
				{
					id :'AagentAdmdivCode',
					xtype : 'combo',
					fieldLabel : '所属财政',
					dataIndex : 'admdivCode',
					displayField: 'admdiv_code_name',
					emptyText: '请选择',
					valueField: 'admdiv_code',
					allowBlank : false,
					editable :false,
					store: comboAdmdiv,
					afterLabelTextTpl : required,
					listeners : {
						'select' : function(){
							selectAdmdiv(false,'AclearAdmdivCode');
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
						id: 'AagencyZeroAccountBankCode',
						xtype: 'textfield',
						fieldLabel: '所属网点',
						readOnly: 'true',
						msgTarget: 'side',
						afterLabelTextTpl : required,
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
										var codeandname=bankInfo.bankcode+" "+bankInfo.bankname;
										btn.up("panel").down("textfield").setValue(codeandname); 
									}
								}
							}).show()
						}
					}]
				},
				
				{
					id: 'AagentAccountName',
					fieldLabel: '账户名称',
					vtype:"accountName",
					afterLabelTextTpl : required,
					allowBlank : false
				}, {
					id: 'AagentAccountNo',
					fieldLabel: '账号',
					afterLabelTextTpl : required,
					vtype:"accountId",
					allowBlank : false
				}, {
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
				}
//				,{
//					xtype : 'checkbox',
//					fieldLabel : '是否有效',
//					id :'AagentIsValid',
//					checked : true,
//					getValue: function() {
//			            var v = 0;
//			              if (this.checked) {
//			                v = 1;
//			              }
//			            return v;
//			        }
//				}
				],
			buttons: [
						{
	                  	  text: '确定',
	                      handler: function() {
						  	if (this.up('form').getForm().isValid()) { 
//								a_is_valid = Ext.getCmp('AagentIsValid').getValue();
								addAgentAccount(this.up('window'));
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
//	var records = networkPanel.getSelectionModel().getSelection();
//	var netState = Ext.getCmp("netState").getValue();
//	if(netState == "002" && records != null){
//	   bankid = records[0].raw.id;	
//	   var bankcode=records[0].raw.code;
//	   var bankname=records[0].raw.text;
//	   Ext.getCmp("AagencyZeroAccountBankCode").setValue(bankcode+" "+bankname);
//	   Ext.getCmp("btn_bank_code_Agency_add").disabled=true;
//	}
}
	
//修改账户
function editAdvanceAgentForNet(gridPanel) {

	// 当前选中的数据
	var e_recordsr = gridPanel.getSelectionModel().getSelection();
	if (e_recordsr.length != 1) {
		Ext.Msg.alert("系统提示", "请选择一条数据！");
		return;
	}
	var accountId = e_recordsr[0].get("account_id");
	
	//账户类型回显
	var actTypeCode = e_recordsr[0].get("account_type_code");
	
	var editBankAccountDialog = new Ext.FormPanel({
		id : 'EagentForm',
		labelWidth : 75,
		frame : true,
		bodyStyle : 'padding:5px 5px 0',
		width : 350,
		defaults : {
			width : 300
		},
		defaultType : 'textfield',
		items : [
				{
					xtype : 'combo',
					fieldLabel : '所属财政',
					id : 'EagentAdmdivCode',
					displayField : 'admdiv_name',
					emptyText : '请选择',
					valueField : 'admdiv_code',
					allowBlank : false,
					afterLabelTextTpl : required,
					editable : false,
					store : comboAdmdiv,
					listeners : {
							'select' : function(){
								selectAdmdiv(false,'EagentAdmdivCode');
							}
					}
				},{
					xtype: 'panel',
					border: 0,
					width: 350,
					layout: 'hbox',
					bodyStyle: "background:#DFE9F6;padding:0px 0px 5px 0px",
					items: [{
						id: 'EagencyZeroAccountBankCode',
						xtype: 'textfield',
						fieldLabel: '所属网点',
						readOnly: 'true',
						msgTarget: 'side',
						afterLabelTextTpl : required,
						allowBlank: false,
						value: ''
					}, {
						id: 'btn_bank_code_Agency_edit',
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
									}
								}
							}).show()
						}
					}]
				},{
					fieldLabel : '账户名称',
					id : 'EagentAccountName',
					vtype:"accountName",
					allowBlank : false,
					afterLabelTextTpl : required,
					value : e_recordsr[0].get("account_name")
				}, {
					fieldLabel : '账号',
					id : 'EagentAccountNo',
					disabled : false,
					afterLabelTextTpl : required,
					value : e_recordsr[0].get("account_no")
				},  {
					id : 'EagentfundTypeCode',
					xtype : 'combo',
					fieldLabel : '资金性质',
					dataIndex : 'code',
					displayField : 'name',
					emptyText : '请选择',
					valueField : 'code',
					hidden : false,
					queryMode : 'local',
					editable : true,
					store : comboFundType
				},{
					id : 'EagentAccountTypeCode',
					xtype : 'combo',
					fieldLabel : '账户类型',
					afterLabelTextTpl : required,
					dataIndex : 'account_type_code',
					displayField : 'accont_type_name',
					emptyText : '请选择',
					valueField : 'account_type_code',
					editable : false,
					queryMode : 'local',
					value:actTypeCode,
					store : comboAccountType
				}],
		buttons : [{
					text : '确定',
					formBind:true,
					handler : function() {
						if(this.up("form").getForm().isValid()){ 
							editAgentAccountforNet(this.up('window'), e_recordsr);
							Ext.getCmp('EagentForm').getForm().reset();
							this.up('window').close();
						}
					}
				}, {
					text : '取消',
					handler : function() {
						this.up('window').close();
					}
				}]
	});

	Ext.getCmp('EagentAdmdivCode').setValue(e_recordsr[0].get("admdiv_code"));
	Ext.getCmp('EagentfundTypeCode').setValue(e_recordsr[0].get("fund_type_code"));
	Ext.getCmp('EagencyZeroAccountBankCode').setValue(e_recordsr[0].get("bank_code") + " " + e_recordsr[0].get("bank_name"));
	bankid=e_recordsr[0].get("bank_id");
	var win1 = Ext.widget('window', {
				title : '修改账户',
				width : 350,
				height : 250,
				layout : 'fit',
				resizable : false,
				modal : true,
				items : [editBankAccountDialog]
			}).show();
}

function editAgentAccountforNet(win, e_record) {
	var myMask = new Ext.LoadMask(Ext.getBody(), {
			msg : '后台正在处理中，请稍后....',
			removeMask : true // 完成后移除
		});
	myMask.show();
	// 提交到服务器操作
	Ext.Ajax.request({
				url : 'editAdvanceAgent.do',
        		method: 'POST',
				timeout:180000,  //设置为3分钟
				params : {
					account_id : e_record[0].get("account_id"),
					account_name : Ext.getCmp('EagentAccountName').getValue(),
					account_no : Ext.getCmp('EagentAccountNo').getValue(),
					admdiv_code : Ext.getCmp('EagentAdmdivCode').getValue(),
					account_type_code : Ext.getCmp('EagentAccountTypeCode').getValue(),
					fund_type_code : Ext.getCmp('EagentfundTypeCode').getValue(),
					bankid : bankid,
					is_valid : 1
				},
				// 提交成功的回调函数
				success : function(response, options) {
					succAjax(response, myMask,true);
					refreshData();
				},
				// 提交失败的回调函数
				failure : function(response, options) {
					failAjax(response, myMask);
					refreshData();
				}
			});
}

//刷新网点
function refresh1(){
	var jsonMap = "[{";
	var codeOrName = Ext.getCmp('netcode').getValue();

	if (!Ext.isEmpty(codeOrName)) {
		var jsonStr = [];
		jsonStr[0] = "=";
		jsonStr[1] = codeOrName;
		jsonMap = jsonMap + "\"codeOrName\":" + Ext.encode(jsonStr) + ",";
	}
	data = jsonMap + "}]";
	networkPanel.getSelectionModel().deselectAll();
	networkPanel.getStore().load({
				method : 'post',
				params : {
					start : 0,
					pageSize : 200,
					filedNames : JSON.stringify(netfileds),
					jsonMap : data
				}
			});
}
