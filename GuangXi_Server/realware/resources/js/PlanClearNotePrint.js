/*******************************************************************************
 * 授权额度通知单打印
 * 
 * @type
 */

/***
 * 引入需要使用的js文件
 */
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/recommend.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/operationLog.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/ocxVoucher.js"></scr' + 'ipt>');


var gridPanel1 = null;
var isFlow = true;

/**
 * 数据项
 * @type 
 */
var fileds = ["plan_clear_note_id","plan_clear_note_code","plan_amount","plan_month","print_date","print_num","deptNum",
			   "fund_type_code","fund_type_name","clear_bank_code", "clear_bank_name","pay_type_code", "pay_type_name","pay_bank_no",
			   "acct_date", "task_id","bill_type_id","treCode","finOrgCode","admdiv_code","vt_code","vou_date","print_num","print_date"];
/**
 * 列名
 * @type 
 */
var header = "凭证号|plan_clear_note_code|140,额度金额|plan_amount|100,计划月份|plan_month|100,凭证日期|vou_date,处理日期|acct_date,预算单位数|deptNum,"
		+ "国库主体代码|treCode,财政机关代码|finOrgCode,清算银行编码|clear_bank_code,清算银行名称|clear_bank_name,代理银行编码|pay_bank_code,代理银行名称|pay_bank_name,"
		+ "资金性质编码|fund_type_code,资金性质名称|fund_type_name,代理银行行号|pay_bank_no,打印次数|print_num|80,打印时间|print_date|120";

/**
 * 界面加载
 */
Ext.onReady(function() {
	Ext.QuickTips.init();	
	Ext.Loader.setPath('Ext', 'js/util');
	Ext.require(['Ext.PageUtil']);
	gridPanel1 = getGrid(loadUrl, header, fileds, true, true);
	gridPanel1.setHeight(document.documentElement.scrollHeight - 95);
	// 根据查询条件检索数据
	gridPanel1.getStore().on('beforeload', function(thiz, options) {
		var admdiv = Ext.getCmp('admdiv').getValue();
		if (admdiv == null || admdiv == "")return;
		beforeload(Ext.getCmp("printQuery"), options, Ext.encode(fileds));   	 	   	 
	});
	
	var buttonItems = [
		               	{ 	id : 'print',
		               		handler : function() {
								printVoucherAUTO(gridPanel1.getSelectionModel().getSelection(),"plan_clear_note_id",
										false,'',printUrl,gridPanel1);
		               		}
		               	}, {
		               		id : 'look',
		               		handler : function() {
		               			var idName="plan_clear_note_id";
								lookOCX(gridPanel1.getSelectionModel().getSelection(),idName);
		               		}
		               	},  {
		               		id : 'refresh',
		               		handler : function() {
		               			refreshData();
		               		}
		               	}];

   var queryItems=[{
       	id : 'printQuery',
    	title : "查询区",
       	bodyPadding : 8,
       	layout : 'hbox',
       	defaults : {
       	margins : '3 5 0 0'
       	},
       	items : [{
       		id : 'taskState',
       		fieldLabel : '当前状态',
       		xtype : 'combo',
       		dataIndex : 'task_status',
       		displayField : 'status_name',
       		emptyText : '请选择',
       		valueField : 'status_code',
       		labelWidth : 60,
       		editable : false,
       		listeners : {
       			'change' : selectState
       		}
       	},{
			id : 'admdiv',
			fieldLabel : '所属财政',
			xtype : 'combo',
			dataIndex : 'admdiv_code',
			displayField : 'admdiv_name',
			emptyText : '请选择',
			valueField : 'admdiv_code',
			labelWidth : 53,
			editable : false,
			store : comboAdmdiv
		},{
			id : 'code',
			fieldLabel : '凭证号',
			xtype : 'textfield',
			labelWidth : 45,
			dataIndex : 'plan_clear_note_code ',
			symbol : '>='
		},{
			id : 'codeEnd',
			fieldLabel : '至',
			xtype : 'textfield',
			labelWidth : 10,
			dataIndex : 'plan_clear_note_code',
			symbol : '<='
		}, {   
            id : 'vouDate',
            fieldLabel : '凭证日期',
            xtype : 'datefield',
            labelWidth : 60,
            format : 'Ymd',
            dataIndex : 'vou_date'
        }]
       	}, gridPanel1];
   Ext.StatusUtil.createViewport(buttonItems, queryItems, function() {
	   	Ext.StatusUtil.initPage(Ext.getCmp("admdiv"), Ext.getCmp("taskState"));
	   	Ext.getCmp('taskState').setValue("001");
   });
});

/*******************************************************************************
 * 状态下拉列表框选中事件
 */
function selectState() {
	isFlow = false;
}


/*******************************************************************************
 * 刷新
 * 
 * @return
 */
function refreshData() {
	gridPanel1.getStore().loadPage(1);
}
