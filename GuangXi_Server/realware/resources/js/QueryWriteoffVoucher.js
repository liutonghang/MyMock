/*******************************************************************************
 * 主要用于支付凭证查询
 * 
 * @type
 */

/**
 * 列表
 */
var gridPanel1 = null;

/**
 * 数据项
 */
var fileds = ["pay_voucher_code","advance_account_no","advance_account_name","pay_amount","print_num","writeoff_date","pay_account_no",
	"pay_account_name","batch_no"];
/**
 * 列名
 */
var header = "凭证号|pay_voucher_code,垫支户账号|advance_account_no,垫支户名称|advance_account_name|140,金额|pay_amount|100,打印次数|print_num,"
		+ "冲销时间|writeoff_date|140,付款人账号|pay_account_no,付款人名称|pay_account_name|140,"
		+ "批次号|batch_no";

/**
 * 界面加载
 */

Ext.onReady(function() {
	Ext.QuickTips.init();
	gridPanel1 = getGrid("/realware/loadWriteoffVoucher.do", header, fileds, true, true);
	gridPanel1.getStore().on('beforeload', function(thiz, options,e) {
		var panel = Ext.ComponentQuery.query("panel[title='查询区']")[0];
		beforeload(panel, options, Ext.encode(fileds));
	});
	var buttonItems = [{
		id : 'refresh',
		handler : function() {
			refreshData();
		}
	}];
	var queryItems = [{
		title : '查询区',
		bodyPadding : 5,
		layout : 'hbox',
		defaults : {
			margins : '3 10 0 0'
		},
		items : [ {
					id : 'admdiv',
					fieldLabel : '所属财政',
					xtype : 'combo',
					dataIndex : 'admdiv_code',
					displayField : 'admdiv_name',
					emptyText : '请选择',
					valueField : 'admdiv_code',
					labelWidth : 53,
					editable :false,
					store : comboAdmdiv,
					listeners : {
						'select' : selectAdmdiv
					}
				},  {
					id : 'writeoff_date1',
					fieldLabel : '冲销日期',
					xtype : 'datefield',
					dataIndex : 'writeoff_date',
					format : 'Ymd',
					labelWidth : 53
				}],
		flex : 2
	}, gridPanel1];
	gridPanel1.setHeight(document.documentElement.scrollHeight - 100);
	Ext.StatusUtil.createViewport(buttonItems, queryItems, function() {
		Ext.StatusUtil.initPage(Ext.getCmp("admdiv"), null);
	});
});


function selectAdmdiv() {
	refreshData();
}


/***************************************************************************
 * 刷新
 * 
 * @return
 */
function refreshData() {
	gridPanel1.getStore().loadPage(1);
}
