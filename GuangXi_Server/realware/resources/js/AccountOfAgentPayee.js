/*
 * 财政国库资金实有资金账户维护
*/

/***
 * 引入需要使用的js文件
 */
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/recommend.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/Account_Add.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/Account_Del.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/Account_Edit.js"></scr' + 'ipt>');

/**
 * 列表
 */
var gridPanel1 = null;
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

/**
 * 数据项
 * 账户类型,账户名称,账号,网点编码,网点名称,是否有效,所属财政,资金性质,是否同行清算,机构类型
 */
var fileds = ["account_id","account_name","account_no","bank_code","fund_type_code","fund_type_name","org_code","bank_name","bank_no","admdiv_code","create_date","is_valid"];

/**
 * 列名
 */
var header = "账户名称|account_name|150,账号|account_no|150,网点编码|bank_code|80,银行名称|bank_name|150,银行行号|bank_no|150,"
			+ "机构类型|org_code|90,资金性质编码|fund_type_code|90,资金性质名称|fund_type_name|90,"
			+"所属财政编码|admdiv_code|150,创建时间|create_date|100,是否有效|is_valid|60";

/**
 * 界面加载
 */
Ext.require(["Ext.grid.*", "Ext.data.*"]);
Ext.onReady(function() {
	Ext.QuickTips.init();
	gridPanel1 = getGrid(loadUrl, header, fileds, true, true);

	Ext.create('Ext.Viewport', {
		id : 'clearAccountFrame',
		layout : 'fit',
		items : [Ext.create('Ext.panel.Panel', {
					tbar : [{
								xtype : 'buttongroup',
								items : [{
											id : 'addBtn',
											text : '新增',
											iconCls : 'add',
											scale : 'small',
											handler : function() {
												addAgentPayeeAccountDialog();
											}
										}, {
											id : 'editBtn',
											text : '修改',
											iconCls : 'edit',
											scale : 'small',
											handler : function() {
												editAgentPayeeAccountDialog(gridPanel1);
											}
										}, {
											id : 'deleteBtn',
											text : '删除',
											iconCls : 'delete',
											scale : 'small',
											handler : function() {
												deleteAgentPayeeAccountDialog(gridPanel1);
											}
										}, {
											id : 'cancleBtn',
											text : '注销',
											iconCls : 'cancle',
											hidden : true,
											scale : 'small',
											handler : function() {

											}
										}, {
											id : 'inputBtn',
											text : '导入',
											iconCls : 'input',
											hidden : true,
											scale : 'small',
											handler : function() {

											}
										}, {
											id : 'refreshBtn',
											text : '刷新',
											iconCls : 'refresh',
											scale : 'small',
											handler : function() {
												refreshData();
											}
										}]
							}],
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
											dataIndex : 'admdiv',
											displayField : 'admdiv_name',
											emptyText : '请选择',
											valueField : 'admdiv_code',
											labelWidth : 55,
											editable : false,
											store : comboAdmdiv,
											listeners : {
												'select' :  function(){
													selectAdmdiv(true);
												}
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
										}],
								flex : 2
							}, gridPanel1]
				})]
	});
	if (comboAdmdiv.data.length > 0) {
		Ext.getCmp('admdivCom').setValue(comboAdmdiv.data.getAt(0).get("admdiv_code"));
	}
	gridPanel1.setHeight(document.documentElement.scrollHeight - 95);
	// 根据查询条件检索数据
	gridPanel1.getStore().on('beforeload', function(thiz, options) {
		var jsonMap = "[{";
		var accountname = Ext.getCmp('accountNameField').getValue();
		var accountno = Ext.getCmp('accountNoField').getValue();
		var admdiv = Ext.getCmp('admdivCom').getValue();
		var count = 0;
		if ("" == admdiv || null == admdiv) return;
		if ("" != accountname && null != accountname) {
			var jsonStr = [];
			jsonStr[0] = "LIKE";
			jsonStr[1] = accountname;
			jsonMap = jsonMap + "\"account_name\":" + Ext.encode(jsonStr) + ",";
			count++;
		}
		if ("" != accountno && null != accountno) {
			var jsonStr = [];
			jsonStr[0] = "LIKE";
			jsonStr[1] = accountno;
			jsonMap = jsonMap + "\"account_no\":" + Ext.encode(jsonStr) + ",";
			count++;
		}
		if ("" != admdiv && null != admdiv) {
			var jsonStr = [];
			jsonStr[0] = "=";
			jsonStr[1] = admdiv;
			jsonMap = jsonMap + "\"admdiv_code\":" + Ext.encode(jsonStr) + ",";
			count++;
		}
		var data = "";
		if (count > 0) {
			data = jsonMap.substring(0, jsonMap.length - 1) + "}]";
		} else {
			data = jsonMap + "}]";
		}
		if (null == options.params || options.params == undefined) {
			options.params = [];
			options.params["jsonMap"] = data;
			options.params["filedNames"] = JSON.stringify(fileds);
			options.params["admdivCode"] = admdiv;
		} else {
			options.params["jsonMap"] = data;
			options.params["filedNames"] = JSON.stringify(fileds);
			options.params["admdivCode"] = admdiv;
		}
	});
	selectAdmdiv(true);
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
	if(refresh == true){
		refreshData();
	}	
}

/***
 * 刷新方法
 */
function refreshData() {
	gridPanel1.getStore().load();
	Ext.getCmp('accountNameField').setValue("");
	Ext.getCmp('accountNoField').setValue("");
}