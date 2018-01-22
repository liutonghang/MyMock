/*******************************************************************************
 * 非税账户查询
 */

/***
 * 引入需要使用的js文件
 */
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/recommend.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/operationLog.js"></scr' + 'ipt>');

var gridPanel1 = null;
/**
 * 列名
 */
var fields = ["account_no","account_name","bank_no","bank_name"];
var header = "账号|account_no|200,账户名称|account_name|200,开户行行号|bank_no|200,开户行名称|bank_name|200";

Ext.onReady(function() {
	Ext.QuickTips.init();
	gridPanel1 = getGrid(loadUrl, header, fields, true, true);
	gridPanel1.setHeight(document.documentElement.scrollHeight - 91);
	// 根据查询条件检索数据
	gridPanel1.getStore().on('beforeload', function(thiz, options) {
		beforeload(Ext.getCmp("NontaxAcctQuery"), options, Ext.encode(fields));
		options.params["accountTypeCode"] = acctTypeCode;
	});
	var buttonItems = [{
						id : 'refresh',
						handler : function() {
							refreshData();
						}
				     }];
	  var queryItems=[{		          
		            title : '查询条件',
		            id:'NontaxAcctQuery',
			        bodyPadding : 5,
			        layout : {
				     type : 'table',
				     columns : 4
			         },
			        defaults : {
					 margins : '5 5 5 5',
					 padding : '0 3 0 3'
					},
			         items:[{
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
							id : "acctNo",
							fieldLabel : '账号',
							xtype : 'textfield',
							dataIndex : 'account_no'
						},{
							dataIndex : 'account_type_code',
							value : acctTypeCode,
							hidden : true
						}]
	                 },gridPanel1];
	    Ext.StatusUtil.createViewport(buttonItems, queryItems, function() {
			Ext.StatusUtil.initPage(Ext.getCmp("admdiv"), "");
			
	});
	    refreshData();
});

//刷新
function refreshData() {
	gridPanel1.getStore().loadPage(1);
}
