/*
 * 清算账户维护
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
 * 数据项 账户类型,账户名称,账号,网点编码,网点名称,是否有效,所属财政,资金性质,是否同行清算,机构类型
 */
var fileds = ["account_id","account_name", "account_no", "bank_code", "bank_name",
		"bank_no", "org_code", "fund_type_code", "is_samebank", "is_pbc", "admdiv_code",
		"create_date", "is_valid", "fund_type_name","pay_type_code","pay_type_name"];

/**
 * 列名
 */
var header = "账户名称|account_name|200,账号|account_no|170,网点编码|bank_code|80,"
		+ "开户行名称|bank_name|150,银行行号|bank_no|100,机构类型|org_code|70,"
		+ "资金性质编码|fund_type_code|90,资金性质名称|fund_type_name|90,支付方式编码|pay_type_code|90,支付方式名称|pay_type_name|90,是否同行账户|is_samebank|80,"
		+ "是否人行账户|is_pbc|80,所属财政名称|admdiv_code|150,创建时间|create_date|100";

/**
 * 界面加载
 */
Ext.require(["Ext.grid.*", "Ext.data.*"]);
Ext.onReady(function() {
	Ext.QuickTips.init();
	gridPanel1 = getGrid(loadUrl, header, fileds, true, true);
	gridPanel1.setHeight(document.documentElement.scrollHeight - 88);
	// 根据查询条件检索数据
	gridPanel1.getStore().on('beforeload', function(thiz, options) {
				var admdiv = Ext.getCmp('admdivCom').getValue();
				if (admdiv == null || admdiv == "")
					return;
				beforeload(Ext.getCmp("accountClearQuery"), options, Ext.encode(fileds));
				options.params["admdivCode"] = admdiv;
			});
	Ext.create('Ext.Viewport', {
		id : 'clearAccountFrame',
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
												addClearAccountDialog(gridPanel1);
											}
										}, {
											id : 'editBtn',
											text : '修改',
											iconCls : 'edit',
											scale : 'small',
											handler : function() {
												editClearAccountDialog(gridPanel1);
											}
										}, {
											id : 'deleteBtn',
											text : '删除',
											iconCls : 'delete',
											scale : 'small',
											handler : function() {
												deleteClearAccountDialog(gridPanel1);
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
									id : 'accountClearQuery',
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
											labelWidth : 60,
											width : 160,
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
											labelWidth : 60,
											width : 160
										}, {
											id : 'accountNoField',
											fieldLabel : '账号',
											xtype : 'textfield',
											dataIndex : 'account_no',
											labelWidth : 45,
											width : 140
										}, {
											id : 'bankNameField',
											fieldLabel : '开户行名称',
											xtype : 'textfield',
											dataIndex : 'bank_name',
											labelWidth : 70
										}, {
											id : 'bankNoField',
											fieldLabel : '银行行号',
											xtype : 'textfield',
											dataIndex : 'bank_no',
											labelWidth : 70
										}]
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
	//加载支付方式的要素值
	comboPayType.load({
		params : {
			admdiv_code : refresh == true? Ext.getCmp('admdivCom').getValue() : Ext.getCmp(id).getValue(),
			ele_code : 'PAY_TYPE'
		}
});
	if(refresh == true){
		refreshData();
	}	
}

/*******************************************************************************
 * 刷新方法
 */
function refreshData() {
	gridPanel1.getStore().loadPage(1);
}