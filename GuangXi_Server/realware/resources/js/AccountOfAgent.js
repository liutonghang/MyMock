/*
 * 划款账户维护
*/

/***
 * 引入需要使用的js文件
 */
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/recommend.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/Account_Add.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/Account_Del.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/Account_Edit.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/Common_Validate.js"></scr' + 'ipt>');


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
 */
var fileds = ["account_id","account_name","account_no","account_type_code","bank_code","bank_name","admdiv_code","create_date","is_valid","fund_type_code","fund_type_name"];

/**
 * 列名
 */
var header = "账户名称|account_name|200,账号|account_no|170,账户类型|account_type_code|120,网点编码|bank_code|80,网点名称|bank_name|150,"
		+ "所属财政|admdiv_code|150,创建时间|create_date|100,资金性质编码|fund_type_code|150,资金性质名称|fund_type_name|150";


/**
 * 界面加载
 */
Ext.onReady(function() {
	Ext.QuickTips.init();
	gridPanel1 = getGrid(loadUrl, header, fileds, true, true);
	gridPanel1.setHeight(document.documentElement.scrollHeight - 88);
	// 根据查询条件检索数据
	gridPanel1.getStore().on('beforeload', function(thiz, options) {
		var admdiv = Ext.getCmp('admdivCom').getValue();		
		if ("" == admdiv || null == admdiv) return;		
		beforeload(Ext.getCmp("accountAgentQuery"), options, Ext.encode(fileds));			
	});
	Ext.create('Ext.Viewport', {
		id : 'agentAccountFrame',
		layout : 'fit',
		items : [Ext.create('Ext.panel.Panel', {
					tbar : [{
							    id : 'buttongroup',
								xtype : 'buttongroup',
								items : [{
											id : 'addBtn',
											text : '新增',
											iconCls : 'add',
											scale : 'small',
											handler : function() {
												addAdvanceAgentDialog(true);
											}
										}, {
											id : 'editBtn',
											text : '修改',
											iconCls : 'edit',
											scale : 'small',
											handler : function() {
												editAdvanceAgentDialog(gridPanel1,true);
											}
										}, {
											id : 'deleteBtn',
											text : '删除',
											iconCls : 'delete',
											scale : 'small',
											handler : function() {
												deleteAdvanceAgentDialog(gridPanel1);
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
								title : "查询区",
								items : gridPanel1,
								tbar : {
									id : 'accountAgentQuery',
									xtype : 'toolbar',
									bodyPadding : 8,
									layout : 'hbox',
									defaults : {
										margins : '3 5 0 0'
									},
									items : [{
											id : 'admdivCom',
											fieldLabel : '所属财政',
											xtype : 'combo',
											dataIndex : 'admdiv_code',
											displayField : 'admdiv_name',
											emptyText : '请选择',
											valueField : 'admdiv_code',
											labelWidth : 55,
											editable : false,
											store : comboAdmdiv,
											value : comboAdmdiv.data.length > 0
														? comboAdmdiv.data.getAt(0).get("admdiv_code")
														: "",
											listeners : {
												'select' : function(){
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
									}
//划款账户去掉资金性质,账户类型查询条件
//									, {
//											id : 'fundTypeCode',
//											xtype : 'combo',
//											fieldLabel : '资金性质',
//											dataIndex : 'fund_type_code',
//											displayField : 'name',
//											emptyText : '请选择',
//											valueField : 'code',
//											labelWidth : 55,
//											queryMode : 'local',
//											//editable : false,
//											store : comboFundType
//									}, {
//											id : 'accountTypeCode',
//											xtype : 'combo',
//											fieldLabel : '账户类型',
//											dataIndex : 'account_type_code',
//											displayField : 'accont_type_name',
//											emptyText : '请选择',
//											valueField : 'account_type_code',
//											labelWidth : 55,
//											//editable : false,
//											store : comboAccountType
//									}
									]
								}
							}]
				})]
	});
	
	var admdiv_code = Ext.getCmp("admdiv_code");
	          admdiv_code.renderer = function(value){
	               for(var i=0;i<comboAdmdiv.data.length;i++){
	                  if(value == comboAdmdiv.data.getAt(i).get("admdiv_code")){
	                     return comboAdmdiv.data.getAt(i).get("admdiv_name");
	                  }
	               }
	          };
	
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
	selectAdmdiv(true);
});

function selectAdmdiv(refresh,id) {
	setBtnVisible(Ext.getCmp("admdivCom").getValue(), Ext.getCmp("buttongroup"));	
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


function refreshData() {	
	gridPanel1.getStore().load();
//	Ext.getCmp('accountNameField').setValue("");
//	Ext.getCmp('accountNoField').setValue("");
//	Ext.getCmp('accountTypeCode').setValue("");
} 