/****************************************************************
 * 授权支付垫支户(主办行)
 */
var userPanel = null;
var networkPanel =null;
var isHost = true;
//区划
var admdiv_code = null;
//网点信息
var records = null;
//网点编码
var bankcode = null;
//网点名字
var bankname = null;


var currentValues = null;
var advanceAgent_consistent = null;

Ext.require(["Ext.grid.*", "Ext.data.*"]);


/***
 * 引入需要使用的js文件
 */
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/recommend.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/Account_Add.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/Account_Del.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/Account_Edit.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/importFile.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/Common_Validate.js"></scr' + 'ipt>');


//document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/Common_Validate.js"></scr' + 'ipt>');
//document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/AccountSyn.js"></scr' + 'ipt>');
//var isHost = 'false';
var fileds = ["account_id", "agency_code", "bank_code", "bank_name", "bank_id", "account_no", "account_name", "account_type_code", "admdiv_code"]; 
var header = "网点编码|bank_code|100, 网点名称|bank_name|180, 垫支户帐号|account_no|100, 垫支户名称|account_name|180,账户类型|account_type_code|120 ,所属财政名称|admdiv_code|100";

/**
 * 当前用户所属网点是否为主办网点
 */
var netfileds = ["id", "code", "name"];
var netheader="网点编码|code|100,网点名称|name|180";

var comboStore2 = Ext.create('Ext.data.Store', {
			fields : ['name', 'value'],
			data : [{
						"name" : "全部网点",
						"value" : "001"
					}, {
						"name" : "指定网点",
						"value" : "002"
					}]
		});


var bankid =null; 
/*******************************************************************************
 * 界面加载
 */
Ext.onReady(function() {
//	Ext.QuickTips.init();
//	//检索网点信息
//	Ext.syncRequire(['js.view.common.Network']);
//	if(userPanel ==null){
//		userPanel = getGrid(loadPayAdvance, header, fields, true, true);
//		userPanel.setHeight(document.documentElement.scrollHeight - 100);
//		// 根据查询条件检索数据
//		networkPanel.getStore().on('beforeload', function(thiz, options) {
//			if (null == options.params || options.params == undefined) {
//				options.params = [];
//			}
//			options.params["fieldNames"] = JSON.stringify(fields);
//		//	beforeload(Ext.getCmp('accountSearch'), options, Ext.encode(fields));
//		});
//		
//	}
	
	Ext.QuickTips.init();
	//检索网点信息
	Ext.syncRequire(['js.view.common.Network']);
	if (userPanel == null) {
		userPanel = getGrid("/realware/loadAccreditAdvanceAccount.do", header, fileds, true, true);
		userPanel.setHeight(document.documentElement.scrollHeight - 100);	
		userPanel.getStore().on('beforeload', function(thiz, options) {
			var panel = Ext.ComponentQuery.query("panel[title='垫支户查询']")[0];
			beforeload(panel, options, Ext.encode(fileds));
			var records = networkPanel.getSelectionModel().getSelection();
			if (records && records.length > 0) {
				var netcode  = records[0].raw.code;
				var params = Ext.decode(options.params.jsonMap);
				params.push({"bank_code" : ["=", netcode]});
				options.params.jsonMap = Ext.encode(params);
				options.params.bankId  = records[0].raw.id;
			}
		
		});
	}
	
	if(networkPanel ==null){
		networkPanel = 	Ext.create('NetworkTree');
		networkPanel.setHeight(document.documentElement.scrollHeight - 100);
	}
	
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
											id : 'addBtn',
											text : '新增',
											iconCls : 'add',
											scale : 'small',
											handler : function() {
												addAccreditAdvanceAccountDialog();
											}
										},{
											id : 'editBtn',
											text : '修改',
											iconCls : 'edit',
											scale : 'small',
											handler : function() {
												editAccreditAdvanceAccountDialog(userPanel);
											}
										}, {
											id : 'deleteBtn',
											text : '删除',
											iconCls : 'delete',
											scale : 'small',
											handler : function() {
												delAccreditAdvanceAccountDialog(userPanel);
											}
										}, {
											id : 'inputBtn',
											text : '导入',
											iconCls : 'input',
											scale : 'small',
											handler : function() {
												importFile(importUrl, 'txt',  Ext.getCmp('admdivCom').getValue());
												var form = Ext.getCmp("uploadWindow").down("form");
												form.add({
													xtype : 'combo',
													fieldLabel : '账户类型',
													name : 'account_type_code',
													dataIndex : 'account_type_code',
													displayField : 'accont_type_name',
													emptyText : '请选择',
													valueField : 'account_type_code',
													allowBlank : false,
													store : comboAccountType
												});
											}
										},{
											id : 'refreshBtn',
											text : '刷新',
											iconCls : 'refresh',
											scale : 'small',
											handler : function() {
												refreshData();
											}								
										}]
								   }]
				           },{
								id :'netgird',
								region: 'west',
								xtype : 'panel',
								width: 250,
								viewConfig : {
									enableTextSelection : true
								},
								items:[{
									title: '网点过滤查询',
									bodyPadding : 8,
									layout : 'hbox',
									defaults : {
											margins : '3 10 0 0'
									},
									items:[{
											id : 'netcode',	
											xtype : 'textfield',
											dataIndex : 'netcode',
											width: 100
										}, {
											id : 'netrefresh',
											xtype : 'button',
											iconCls : 'refresh',
											scale : 'small',
											handler : function() {
												selectNet();
											}				
										},{
												id : 'netState',
												xtype : 'combo',
												dataIndex : 'net_state',
												displayField : 'name',
												emptyText : '请选择',
												valueField : 'value',
												width : 85,
												store : comboStore2,
												value : '001',
												editable : false,
												listeners : {
													'select' : selectNetState
												}
										}],
									flex : 2
								},networkPanel]
							},{
								region: 'center',
								xtype : 'panel',
								items : [{
								      title : "垫支户查询",
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
												dataIndex : 'admdiv_code',
												emptyText : '请选择',
												valueField : 'admdiv_code',
												labelWidth : 70,
												editable : false,
												store : comboAdmdiv,
												value : comboAdmdiv.data.length > 0
														? comboAdmdiv.data.getAt(0).get("admdiv_code"): "",
												listeners : {
													'select' : selectAdmdiv
												}
											}, {
												id : 'bankCode1',
												fieldLabel : '网点编码',
												xtype : 'textfield',
												dataIndex : 'bank_code',
												value : '',
												labelWidth : 70
											}, {
												id : 'accountNo',
												fieldLabel : '垫支户帐号',
												xtype : 'textfield',
												value : '',
												dataIndex : 'account_no',
												labelWidth : 70
											}
//											, {
//												id : 'searchBtn',
//												xtype : 'button',
//												text : '查询',
//												iconCls : 'refresh',
//												dataIndex : 'search',
//												scale : 'small',
//												handler : function() {
//													// 根据条件加载--授权支付垫支户
//													refreshData();
//												}
//											}
											],
										flex : 2
									},
									userPanel
									]
								}]
							})]
				});
		 selectNetState();
		 var account_type = Ext.getCmp("account_type_code");
		 account_type.renderer = function(value){
		    if(value=='21'){
		    	return '直接支付垫支户';
		    }else if(value=='22'){
		    	return '授权支付垫支户';
		    }else if(value=='210'){
		    	return '直接支付退款垫支户';
		    }else if(value=='220'){
		    	return '授权支付退款垫支户';
		    }
		 };
		 
		 var admdiv_code = userPanel.down('#admdiv_code');
		 admdiv_code.renderer = function(value){
		 if(comboAdmdiv) {
			var record = comboAdmdiv.findRecord('admdiv_code',value);
			if(record) {
				return record.get('admdiv_name');
			}
		}
		return value;
      };
	// 凭证选中刷新明细
	networkPanel.on("cellclick", function(g, rowIndex, columnIndex, e) {
		refreshData();
	});
});


/**************************************下面是定义的方法*****************************************/
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
	networkPanel.getSelectionModel().deselectAll();
	var netState=Ext.getCmp('netState').getValue();
	if('001'==netState){
		Ext.getCmp('netcode').disable(false);
		Ext.getCmp('netrefresh').disable(false);
		networkPanel.setDisabled(true);
		Ext.getCmp('netcode').setValue("");
	}else{
		Ext.getCmp('netcode').enable(false);
		Ext.getCmp('netrefresh').enable(false);
		networkPanel.setDisabled(false);
		var childNodes = networkPanel.getRootNode().childNodes;
		if(!Ext.isEmpty(childNodes)) {
			var model = networkPanel.getSelectionModel();
			model.select(childNodes[0], true);
			networkPanel.fireEvent("itemclick", networkPanel, childNodes[0]);
		}
	}
	refreshData();
}
/**
 * 刷新数据
 */
function refreshData(){
	userPanel.getStore().loadPage(1);
}

/**
 * 切换财政,更新下面的垫支户信息
 */
function selectAdmdiv() {
	setBtnVisible(Ext.getCmp("admdivCom").getValue(), Ext.getCmp("buttongroup"));

	refreshData();
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
