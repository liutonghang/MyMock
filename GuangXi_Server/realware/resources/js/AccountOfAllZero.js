/*
 * 单位零余额账户维护
*/

/***
 * 引入需要使用的js文件
 */
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/recommend.js"></scr' + 'ipt>');

/**
 * 列表
 */
var gridPanel1 = null;

/**
 * 数据项
 */
var fileds = ["account_id","account_name","account_no","agency_code","bank_code","bank_name","admdiv_code","create_date","is_valid"]; 

/**
 * 列名
 */
var header = "账户名称|account_name|200,账号|account_no|170,网点编码|bank_code|120,网点名称|bank_name|200,"
		+ "所属财政编码|admdiv_code|150,创建时间|create_date|100,是否有效|is_valid|60";


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
		if ("" == admdiv || null == admdiv)
			return;
		beforeload(Ext.getCmp("accountOfAgencyZeroQuery"), options, Ext.encode(fileds));
	});
	Ext.create('Ext.Viewport', {
		id : 'agencyZeroAccountFrame',
		layout : 'fit',
		items : [Ext.create('Ext.panel.Panel', {
			tbar : [{
						id : 'buttongroup',
						xtype : 'buttongroup',
						items : [
									{
									id : 'queryBalanceBtn',
									text : '余额查询',
									iconCls : 'log',
									scale : 'small',
									hidden:false,
									handler : function() {
											queryBalanceForm(gridPanel1);
									}
								}
									,{
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
					id : 'accountOfAgencyZeroQuery',
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
						labelWidth : 55
					}, {
						id : 'accountNoField',
						fieldLabel : '账号',
						xtype : 'textfield',
						dataIndex : 'account_no',
						labelWidth : 30,
						value : ''
					}]
				}
			}]
		})]
	});
	selectAdmdiv();
});

function selectAdmdiv() {
	setBtnVisible(Ext.getCmp("admdivCom").getValue(), Ext.getCmp("buttongroup"));
	refreshData();
}


function refreshData() {
	gridPanel1.getStore().load();
	Ext.getCmp('accountNameField').setValue("");
	Ext.getCmp('accountNoField').setValue("");
	Ext.getCmp('agencyCodeField').setValue("");
}