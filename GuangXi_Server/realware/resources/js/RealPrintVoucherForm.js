/*
 *  实拨拨款单查询
*/

/***
 * 引入需要使用的js文件
 */
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/recommend.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/operationLog.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/ocxVoucher.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/js/store/pay/BankSetMode.js"></scr' + 'ipt>');

/**
 * 列表
 */
var gridPanel1 = null;
// 是否走工作流
var isFlow = false;
/**
 * 数据项
 */

var fileds=["realpay_voucher_code","pay_amount","payee_account_no","payee_account_name",
	"payee_account_bank","pay_account_no","pay_account_name","pay_account_bank",
	"exp_func_name","fund_type_code","fund_type_name","pay_type_code","pay_type_name",
	"pay_summary_code","pay_summary_name","pay_date","print_num","print_date","voucher_flag"
	,"task_id","bill_type_id","realpay_voucher_id","voucher_status","voucher_status_des","vou_date", 
	"admdiv_code", "vt_code", "year"];
/**
 * 列名
 */

var header="凭证状态|voucher_status_des|140,拨款凭证编码|realpay_voucher_code|140,凭证日期|vou_date,拨款金额|pay_amount|100,收款人账号|payee_account_no|140,收款人名称|payee_account_name|140,"
	+"收款人银行|payee_account_bank|140,付款人账号|pay_account_no|140,付款人|pay_account_name|140,付款人开户银行|pay_account_bank|140,"
	+"资金性质编码|fund_type_code|140,资金性质|fund_type_name|140,支付方式编码|pay_type_name|140,支付方式|pay_type_name|140," 
	+"用途编码|pay_summary_code|140,用途名称|pay_summary_name|140,支付日期|pay_date|140,打印次数|print_num|140,打印日期|print_date|140";

var bankMode = Ext.create('Ext.data.Store', {
	fields : [{
		name : 'name'
	}, {
		name : 'value'
	}],
	proxy : {
		type : 'ajax',
		async : false,
		actionMethods : {
			read : 'POST'
		},
		url : 'loadbanksetmode.do',
		reader : {
			type : 'json'
		}
	},
    autoLoad : true
}); 


/**
 * 界面加载
 */
Ext.onReady(function() {
	Ext.QuickTips.init();
	Ext.Loader.setPath('Ext', 'js/util');
	Ext.require(['Ext.PageUtil']);
	gridPanel1 = getGrid(loadUrl, header, fileds, true, true);
	gridPanel1.setHeight(document.documentElement.scrollHeight - 88);
	gridPanel1.getStore().on('beforeload', function(thiz, options) {
		beforeload(Ext.getCmp("queryPanel"), options, Ext.encode(fileds));
	});
	var buttonItems=[{
		id : 'print',
		handler : function() {
						//var gridPanel = Ext.getCmp(Ext.PageUtil.prefix + Ext.getCmp('taskState').getValue());
						var records = gridPanel1.getSelectionModel().getSelection();
						if (records.length == 0) {
								Ext.Msg.alert('系统提示','请至少选择一条数据！');
								return;
						}
						printVoucherAUTO(records,"realpay_voucher_id",false,records[0].get("vt_code"),'/realware/printVoucherForDB.do',gridPanel1);
					}
	},{
		id : 'look',
		handler : function() {
			lookOCX(gridPanel1.getSelectionModel().getSelection(),"realpay_voucher_id");
		}
	}, {
		id : 'log',
		handler : function() {
			taskLog(gridPanel1.getSelectionModel().getSelection(),"realpay_voucher_code");
		}
	}, {
		
		id : 'refresh',
		handler : function() {
			refreshData();
		}
	}];
	
	
	var queryItems = [{
						title : '查询区',
						bodyPadding : 8,
						id : 'queryPanel',
						layout : {
						type : 'table',
						columns : 4
						},
						defaults : {
							margins : '3 10 0 0'
						},
						items : [{
									id : 'taskState',
									fieldLabel : '当前状态',
									xtype : 'combo',
									displayField : 'status_name',
									dataIndex : 'task_status',
									emptyText : '请选择',
									valueField : 'status_code',
									editable : false,
									queryMode: 'local', 
									style : 'margin-left:5px;margin-right:5px;'
								},{
									id : 'admdivCode',
									fieldLabel : '所属财政',
									xtype : 'combo',
									dataIndex : 'admdiv_code',
									displayField : 'admdiv_name',
									emptyText : '请选择',
									valueField : 'admdiv_code',
									editable : false,
									store : comboAdmdiv,
									style : 'margin-left:5px;margin-right:5px;'
								}, {
									id:'voucherStar',
									fieldLabel : '凭证号',
									xtype : 'textfield',
									symbol : '>=',
									dataIndex : 'realpay_voucher_code',
									style : 'margin-left:5px;margin-right:5px;'
								}, {
									id:'voucherEnd',
									xtype : 'textfield',
									fieldLabel : '至',
									xtype : 'textfield',
									symbol : '<=',
									dataIndex : 'realpay_voucher_code ',
									style : 'margin-left:5px;margin-right:5px;'
								},{
									fieldLabel : '凭证日期',
									xtype : 'datefield',
									dataIndex : 'vou_date',
									format : 'Ymd',
									style : 'margin-left:5px;margin-right:5px;'
								},{
									fieldLabel : '银行结算方式',
									xtype : 'combo',
									dataIndex : 'pb_set_mode_code',
									displayField : 'name',
									valueField : 'value',
									queryMode: 'local', 
									store : bankMode,
									style : 'margin-left:5px;margin-right:5px;'
								},{
									id : 'amount',
									fieldLabel : '&nbsp;&nbsp;金额',
									xtype : 'numberfield',
									dataIndex : 'pay_amount',
									symbol : '=',
									datatype : '1',
									style : 'margin-left:5px;margin-right:5px;',
									fieldStyle : 'text-align: right;'  ,   //文本框里显示内容右对齐
									decimalPrecision: 2  //小数精确位数
									
								}],
						flex : 2
					}, gridPanel1];
	    Ext.StatusUtil.createViewport(buttonItems, queryItems, function() {
	    	Ext.StatusUtil.initPage(Ext.getCmp("admdivCode"), Ext.getCmp("taskState"));
	    	Ext.getCmp('taskState').setValue("011");
	    });
});
  //查询
  function refreshData() {
	gridPanel1.getStore().loadPage(1);
}
  
 
