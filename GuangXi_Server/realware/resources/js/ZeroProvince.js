/**
 * 主要用于省行维护所有的财政账户
 * 
 */

var userPanel = null;
var networkPanel =null;


/***
 * 引入需要使用的js文件
 */
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/recommend.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/AccountSyn.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/Account_Del.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/AccountProvince_Edit.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/AccountProvince_Add.js"></scr' + 'ipt>');
/**
 * 数据项
 */

var fileds = ["account_name","account_no","admdiv_code","account_type_code","is_valid","finance_name","finance_phone","create_date","account_id","bank_id","bank_name","agency_name","agency_code"]; 

/**
 * 列名
 */
var header = "账户名称|account_name|200,账号|account_no|170,财务人员名称|finance_name|150,财务人员电话号码|finance_phone|150,所属财政|admdiv_code|150,创建时间|create_date|100";

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
/***
 * 界面加载
 */
Ext.onReady(function() {
	Ext.QuickTips.init();
	Ext.syncRequire(['js.view.common.Network']);
	if (userPanel == null) {
		userPanel = getGrid("/realware/loadProvinceAdmdivZeroAccount.do", header, fileds, true, true);
		userPanel.setHeight(document.documentElement.scrollHeight - 100);	
		userPanel.getStore().on('beforeload', function(thiz, options) {
		    
			var panel = Ext.ComponentQuery.query("panel[title='财政零余额账户查询']")[0];
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
									 //编组按钮
									xtype : 'buttongroup', 
									items : [{
											id : 'add',
											text : '新增',
											iconCls : 'add',
											scale : 'small',
											handler : function() {
										       addAdmdivZeroAccountDialog();
											}
										}, {
											id : 'edit',
											text : '修改',
											iconCls : 'edit',
											scale : 'small',
											handler : function() {
											   editAdmdivZeroAccountDialog(userPanel);
											}
										}, {
											id : 'delete',
											text : '删除',
											iconCls : 'delete',
											scale : 'small',
											handler : function() {
											deleteAdmdivZeroAccountDialog(userPanel);
											}
										}, {
					                       id : 'queryBalanceBtn',
					                       text : '余额查询',
					                       iconCls : 'log',
					                       scale : 'small',
					                       handler : function() {
						                       queryBalanceForm(userPanel);
					                       }
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
										title : '财政零余额账户查询',
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
	
	// 凭证选中刷新明细
	networkPanel.on("cellclick", function(g, rowIndex, columnIndex, e) {
		refreshData();
	});
	 var admdiv_code = Ext.getCmp("admdiv_code");
	 admdiv_code.renderer = function(value){
	    for(var i=0;i<comboAdmdiv.data.length;i++){
	        if(value == comboAdmdiv.data.getAt(i).get("admdiv_code")){
	           return comboAdmdiv.data.getAt(i).get("admdiv_name");
	        }
	    }
	 };		
});

function selectAdmdiv() {
	setBtnVisible(Ext.getCmp("admdivCom").getValue(), Ext.getCmp("buttongroup"));
	refreshData();
}

/***
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



/***
 * 刷新
 * 
 * @return
 */

function refreshData() {
	userPanel.getStore().loadPage(1);
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


