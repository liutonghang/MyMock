/*
 * 单位零余额账户维护
*/

/***
 * 引入需要使用的js文件
 */
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/recommend.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/Account_Add.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/Account_Del.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/Account_Edit.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/AccountSyn.js"></scr' + 'ipt>');
/**
 * 列表
 */
var gridPanel1 = null;

/**
 * 数据项
 */
var fileds = ["account_id","account_name","account_no","agency_code","bank_id","bank_code","bank_name","admdiv_code","create_date","is_valid"]; 

/**
 * 列名
 */
var header = "账户名称|account_name|200,账号|account_no|170,网点编码|bank_code|120,网点名称|bank_name|200,"
		+ "所属财政编码|admdiv_code|150,创建时间|create_date|100,是否有效|is_valid|60";
/**
 * 当前用户所属网点是否为主办网点
 */
var isHost = 'false';
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
		beforeload(Ext.getCmp("accountOfInnerHangingQuery"), options, Ext.encode(fileds));
		
		checkIsHost();
	});
	Ext.create('Ext.Viewport', {
		id : 'InnerHangingAccountFrame',
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
										addInnerHangingAccountDialog(gridPanel1);
									}
								}, {
									id : 'editBtn',
									text : '修改',
									iconCls : 'edit',
									scale : 'small',
									handler : function() {
										editInnerHangingAccountDialog(gridPanel1);
									}
								}, {
									id : 'deleteBtn',
									text : '删除',
									iconCls : 'delete',
									scale : 'small',
									handler : function() {
										deleteAgencyZeroAccountDialog(gridPanel1);
									}
								}, {
									id : 'cancleBtn',
									text : '注销',
									iconCls : 'cancle',
									hidden : true,
									scale : 'small',
									handler : function() {

									}
								}, 
									{
									id : 'synBtn',
									text : '同步',
									iconCls : 'add',
									hidden : true,
									scale : 'small',
									handler : function() {
										sysFromBank();
									}
								}, {
									id : 'queryBalanceBtn',
									text : '余额查询',
									iconCls : 'log',
									scale : 'small',
									hidden:false,
									handler : function() {
											queryBalanceForm(gridPanel1,"001001");
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
					id : 'accountOfInnerHangingQuery',
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
					}, {
						id : 'agencyCodeField',
						fieldLabel : '单位编码',
						xtype : 'textfield',
						dataIndex : 'agency_code',
						labelWidth : 55,
						value : ''
					}, {
						id : 'agencyBank_code',
						fieldLabel : '所属网点',
						xtype : 'textfield',
						dataIndex : 'bank_code',
//						hidden : isHost=='true'?false:true,
						labelWidth : 55,
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
}


function checkIsHost(){
	Ext.Ajax.request({
	   url: 'isHost.do',
	   method:'GET',
	   success: function(response, options){
	   		isHost = response.responseText;
			//如果不是主办网点，则不提供网点过滤
			if('false' == isHost)
				Ext.getCmp("agencyBank_code").hide();
	   },
	   failure: function(){
	   	Ext.Msg.alert('警告', '初始化异常，请重新加载！'); 
	   }
	});
}
