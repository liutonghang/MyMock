/*******************************************************************************
 * 非税银行流水
 */

/***
 * 引入需要使用的js文件
 */
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/recommend.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/operationLog.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/ocxVoucher.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/impFile.js"></scr' + 'ipt>');

var gridPanel1 = null;
/**
 * 列名
 */
var fileds = ["tra_no","pay_account_name", "pay_account_no","pay_account_bank", 
		"payee_account_name","payee_account_no","payee_account_bank",
		"trans_date", "create_date","create_user_code","create_user_name","money_type",
		"is_interceive_flag","is_match","pay_amount","income_amount","account_amount","pay_summary_name"];
var header = "银行流水号|tra_no|100,付款人账号|pay_account_no|150,付款人名称|pay_account_name|150,付款人银行|pay_account_bank|200," +
		"收款人账号|payee_account_no|150,收款人名称|payee_account_name|150,收款人银行|payee_account_bank|200,摘要|pay_summary_name|200,创建日期|create_date|100," +
		"贷方发生额|pay_amount|100,借方发生额|income_amount|100,余额|account_amount|100,钞汇鉴别|money_type|100,"+
		"交易日期|trans_date|100,柜员号|create_user_code|100,柜员名称|create_user_name|100";

//是否匹配缴款书状态
var comboMatch = Ext.create("Ext.data.Store", {
		fields : [ "name", "value" ],
		data : [{
			"name" : "未匹配",
			"value" : 0
		},{
			"name" : "已匹配",
			"value" : 1
		}]

}); 

//是否生成2615
var comboInter = Ext.create("Ext.data.Store", {
		fields : [ "inter_name", "inter_value" ],
		data : [{
			"inter_name" : "未生成",
			"inter_value" : 0
		},{
			"inter_name" : "已生成",
			"inter_value" : 1
		}]

});
Ext.onReady(function() {
	Ext.QuickTips.init();
	gridPanel1 = getGrid(loadUrl, header, fileds, true, true);
	gridPanel1.setHeight(document.documentElement.scrollHeight - 115);
	// 根据查询条件检索数据
	gridPanel1.getStore().on('beforeload', function(thiz, options) {
		beforeload(Ext.getCmp("NontaxBankStatement"), options, Ext.encode(fileds));
		options.params["billTypeId"] = 11022;
	});
	var buttonItems = [
				{
					id : 'import',
					handler : function() {
					    importFile("/realware/nontaxSaveStatements.do");
					}
				}, {

					id : 'refresh',
					handler : function() {
						refreshData();
					}
				} ];
	  var queryItems=[{
		          
		            title : '查询条件',
		            id:'NontaxBankStatement',
			        bodyPadding : 5,
			        layout : {
				     type : 'table',
				     columns : 4
			         },
			        defaults : {
					 margins : '3 10 0 0',
					 padding : '0 3 0 3'
					},
			         items:[{
			        	    id : 'isMatch',
							fieldLabel : '缴款状态',
							xtype : 'combo',
							dataIndex : 'is_match',
							displayField : 'name',
							emptyText : '请选择',
							valueField : 'value',
							editable : false,
							value : 0,
							store : comboMatch,
							listeners : {
								'change' : select
							}
			         },{
			        	    id : 'isInterlineRev',
							fieldLabel : '生成到账资金',
							xtype : 'combo',
							dataIndex : 'is_interceive_flag',
							displayField : 'inter_name',
							emptyText : '请选择',
							valueField : 'inter_value',
							editable : false,
							value : 0,
							store : comboInter,
							listeners : {
								'change' : select
							}
			         },{
							id : 'admdiv',
							fieldLabel : '所属财政',
							xtype : 'combo',
							dataIndex : 'admdiv_code',
							displayField : 'admdiv_name',
							emptyText : '请选择',
							valueField : 'admdiv_code',
							editable : false,
							store : comboAdmdiv
						},{
							id : "traNo",
							fieldLabel : '银行流水号',
							xtype : 'textfield',
							dataIndex : 'tra_no'
						},{
							fieldLabel : '交易日期',
							xtype : 'datefield',
							dataIndex : 'trans_date',
							format : 'Ymd'
						},{
							id : 'payAcct',
							fieldLabel : '付款人账号',
							xtype : 'textfield',
							dataIndex : 'pay_account_no'
						}, {
							id : 'payeeAcct',
							fieldLabel : '收款人账号',
							xtype : 'textfield',
							dataIndex : 'payee_account_no '
						},{
							id : 'amount',
							fieldLabel : '贷方发生额',
							xtype : 'numberfield',
							dataIndex : 'pay_amount',
							symbol : '=',
							datatype : '1',
							fieldStyle : 'text-align: right;'  ,   //文本框里显示内容右对齐
							decimalPrecision: 2  //小数精确位数							
						}]
	                 },gridPanel1];
	    Ext.StatusUtil.createViewport(buttonItems, queryItems, function() {
			Ext.StatusUtil.initPage(Ext.getCmp("admdiv"), "");
	});
	    refreshData();
});


function refreshData() {
	gridPanel1.getStore().loadPage(1);
}


function select(){
	 refreshData();
}
