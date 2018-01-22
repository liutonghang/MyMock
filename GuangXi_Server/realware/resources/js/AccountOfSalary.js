/*
 * 工资统发户维护
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

/**
 * 数据项
 */
var fileds = ["account_id","account_name","account_no","bank_id","bank_code","bank_name","admdiv_code","create_date","is_valid"];

/**
 * 列名
 */
var header = "账户名称|account_name|200,账号|account_no|170,网点编码|bank_code|80,网点名称|bank_name|150,"
			+ "所属财政名称|admdiv_code|150,创建时间|create_date|100";
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
		beforeload(Ext.getCmp("accountOfSalaryQuery"), options, Ext.encode(fileds));
		
		checkIsHost();
	});
	Ext.create('Ext.Viewport', {
		id : 'salaryAccountFrame',
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
										addSalaryAccountDialog();
									}
								}, {
									id : 'editBtn',
									text : '修改',
									iconCls : 'edit',
									scale : 'small',
									handler : function() {
										editSalaryAccountDialog(gridPanel1);
									}
								}, {
									id : 'deleteBtn',
									text : '删除',
									iconCls : 'delete',
									scale : 'small',
									handler : function() {
										deleteSalaryAccountDialog(gridPanel1);
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
								},{
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
					id : 'accountOfSalaryQuery',
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
						value : comboAdmdiv.data.length > 0 ? comboAdmdiv.data.getAt(0).get("admdiv_code") : "",
						listeners : {
							'select' : selectAdmdiv
						}
					}, {
						id : 'accountNameField',
						fieldLabel : '账户名称',
						xtype : 'textfield',
						dataIndex : 'account_name',
						labelWidth : 60
					}, {
						id : 'accountNoField',
						fieldLabel : '账号',
						xtype : 'textfield',
						dataIndex : 'account_no',
						labelWidth : 30
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
	
	selectAdmdiv();
});

function selectAdmdiv() {
	//setBtnVisible(Ext.getCmp("admdivCom").getValue(), Ext.getCmp("buttongroup"));
	refreshData();
}


function refreshData() {
	gridPanel1.getStore().load();
}

function checkIsHost(){
	Ext.Ajax.request({
	   url: '/realware/isHost.do',
	   method:'GET',
	   success: function(response, options){
	   		isHost = response.responseText;
			//如果不是主办网点，则不提供网点过滤
			if('false' == isHost && !Ext.isEmpty(Ext.getCmp("agencyBank_code")))
				Ext.getCmp("agencyBank_code").hide();
	   },
	   failure: function(){
	   	Ext.Msg.alert('警告', '初始化异常，请重新加载！'); 
	   }
	});
}