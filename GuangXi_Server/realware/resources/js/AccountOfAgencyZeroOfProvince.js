/**
 * 全省单位零余额维护(黑龙江特殊需求)
 */

/**
 * 列表
 */
var gridPanel1 = null;
var networkPanel =null;


/***
 * 引入需要使用的js文件
 */
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/recommend.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/Account_Add.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/Account_Del.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/Account_Edit.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/AccountSyn.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/importFile.js"></scr' + 'ipt>');



/**
 * 数据项
 */
var fileds = ["account_id","account_name","account_no","agency_code","bank_code","bank_name","admdiv_code","create_date","is_valid","bank_id"]; 

/**
 * 当前用户所属网点是否为主办网点
 */
var isHost = 'false';

/**
 * 列名
 */
var header = "账户名称|account_name|200,账号|account_no|170,单位编码|agency_code|120,网点编码|bank_code|120,网点名称|bank_name|200,"
		+ "所属财政编码|admdiv_code|150,创建时间|create_date|100,是否有效|is_valid|60";


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
/**
 * 界面加载
 */
Ext.require(["Ext.grid.*", "Ext.data.*"]);
Ext.onReady(function() {
	Ext.QuickTips.init();
	gridPanel1 = getGrid(loadUrl, header, fileds, true, true);
	gridPanel1.getStore().on('beforeload', function(thiz, options) {
		if (null == options.params || options.params == undefined) {
			options.params = [];
		}
		options.params["filedNames"] = JSON.stringify(fileds);
	});

	if(networkPanel ==null){
		networkPanel = getGrid("/realware/loadAllNetwork1.do", netheader,netfileds, false, true);
		networkPanel.setHeight(document.documentElement.scrollHeight - 100);
		networkPanel.getStore().on('beforeload', function(thiz, options) {
			if (null == options.params || options.params == undefined) {
				options.params = [];
			}
			options.params["filedNames"] = JSON.stringify(netfileds);
		});
		
	}
	
	Ext.create('Ext.Viewport', {
				id : 'agencyZeroAccountFrame',
				layout : 'fit',
				items : [Ext.create('Ext.panel.Panel', {
							layout: 'border', 
							renderTo: Ext.getBody() ,
							items :[{
								region: 'north',
								height: 34,
								tbar : [{
								xtype : 'buttongroup',
									items : [{
												id : 'addBtn',
												text : '新增',
												iconCls : 'add',
												scale : 'small',
												handler : function() {
													var netState=Ext.getCmp('netState').getValue();
													addAgencyZeroAccountOfProvinceDialog(netState,networkPanel);
													
												}
											}, {
												id : 'editBtn',
												text : '修改',
												iconCls : 'edit',
												scale : 'small',
												handler : function() {													
													editAgencyZeroAccountDialog(gridPanel1);
												}
											}, {
												id:'deleteBtn',
												text : '删除',
												iconCls : 'delete',
												scale : 'small',
												handler : function() {
													deleteAgencyZeroAccountDialog(gridPanel1);
												}
											}, {
												id:'cancleBtn',
												text : '注销',
												iconCls : 'cancle',
												hidden : true,
												scale : 'small',
												handler : function() {
													
												}
											}, {
												id : 'synBtn',
												text : '同步',
												iconCls : 'add',
												scale : 'small',										
												handler : function() {
													sysFromBank();
												}
											},{
												id:'inputBtn',
												text : '导入',
												iconCls : 'input',
												hidden : true,
												scale : 'small',
												handler : function() {
													
												}
											}, {
												id : 'queryBalanceBtn',
												text : '余额查询',
												iconCls : 'log',
												scale : 'small',
												hidden:false,
												handler : function() {
													queryBalanceForm(gridPanel1);
												}
											}, {
												id:'refreshBtn',
												text : '刷新',
												iconCls : 'refresh',
												scale : 'small',
												handler : function() {
													var netState=Ext.getCmp('netState').getValue();
													if ('001' == netState) {
														refreshData();
													} else {
														var records = networkPanel.getSelectionModel().getSelection();
														if (records.length < 1) {
															refreshData();
															return;
														}
														var netcode = records[0].get("code");
														refreshData(netcode);			
													}
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
										},{
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
													editable : false,
													listeners : {
														'select' : selectNetState
													}
										}],
									flex : 2
								},networkPanel],
								listenners : {
									load:function(){
										networkPanel.getSelectionModel().selectRow(0);
									}
								}
							},{
								region: 'center',
								xtype : 'panel',
								items : [{
											title : '查询条件',
											bodyPadding : 5,
											layout : 'hbox',
											defaults : {
												margins : '3 10 0 0'
											},
											items : [{
														id : 'admdivCom',
														fieldLabel : '所属财政',
														xtype : 'combo',
														displayField : 'admdiv_name',
														emptyText : '请选择',
														valueField : 'admdiv_code',
														labelWidth : 55,
														editable :false,
														store : comboAdmdiv,
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
													}, {
														id : 'agencyCodeField',
														fieldLabel : '单位编码',
														xtype : 'textfield',
														dataIndex : 'agency_code',
														labelWidth : 55
													}
													],
											flex : 2
										}, gridPanel1]
							}]						
						})]
			});
	if (comboAdmdiv.data.length > 0) {
		Ext.getCmp('admdivCom').setValue(comboAdmdiv.data.getAt(0).get("admdiv_code"));
	}
	gridPanel1.setHeight(document.documentElement.scrollHeight - 95);	
	
	Ext.getCmp('netState').setValue("001");	
	selectNetState();
	selectAdmdiv();
	
	// 凭证选中刷新明细
	networkPanel.on("cellclick", function(g, rowIndex, columnIndex, e) {
				var records = g.getSelectionModel().getSelection();
				var bankcode=records[0].get("code");
				refreshData(bankcode);
			});
});

function selectAdmdiv() {
	refreshData();
}
/**
 * 全部，部分切换
*/
function selectNetState(){
	var netState=Ext.getCmp('netState').getValue();
	if('001'==netState){
		Ext.getCmp('netcode').disable(false);
		Ext.getCmp('netrefresh').disable(false);
		networkPanel.setDisabled(true);
		//Ext.getCmp('netgird').setDisabled(true);
		//networkPanel.collapse(Ext.Component.DIRECTION_LEFT,true);
		refreshData();
		Ext.getCmp('netcode').setValue("");
		
	}else{
		Ext.getCmp('netcode').enable(false);
		Ext.getCmp('netrefresh').enable(false);
		networkPanel.setDisabled(false);
		//Ext.getCmp('netgird').setDisabled(false);
		//networkPanel.collapse(Ext.Component.DIRECTION_LEFT,false);
		selectNet();
		
	}	
}
/*******************************************************************************
 * 网点加载
 */
function selectNet(){
	refresh1();
	var len=networkPanel.getStore().data.length;
	if(len==0){
		//置空用户panel
		refreshData("####");
		return ;
	}
	//默认选中第一行
	networkPanel.getSelectionModel().select(0);
	var records = networkPanel.getSelectionModel().getSelection();
		if(records.length<1){
			refreshData();
			return;
		}			
		var netcode=records[0].get("code");
		refreshData(netcode); //默認第一行后重新加載
}
//刷新网点
function refresh1(){
	networkPanel.getStore().load({
				method : 'post',
				params : {
					start : 0,
					pageSize : 200,
					filedNames : JSON.stringify(netfileds),
					codeorname : Ext.getCmp('netcode').getValue()
				}
			});
}
function refreshData(bankcode) {
	var jsonMap = "[{";
	var accountname = Ext.getCmp('accountNameField').getValue();
	var accountno = Ext.getCmp('accountNoField').getValue();
	var admdiv = Ext.getCmp('admdivCom').getValue();
	var agencyCode = Ext.getCmp('agencyCodeField').getValue();
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
	if ("" != agencyCode && null != agencyCode) {
		var jsonStr = [];
		jsonStr[0] = "=";
		jsonStr[1] = agencyCode;
		jsonMap = jsonMap + "\"agency_code\":" + Ext.encode(jsonStr) + ",";
	}
	if(null!=bankcode && ""!=bankcode){
		var str = [];
		str[0] = "=";
		str[1] = bankcode;
		jsonMap = jsonMap +"\"bank_code\":" + Ext.encode(str) +  ",";
	}
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