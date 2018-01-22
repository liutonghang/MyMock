/*******************************************************************************
 * 授权额度通知单打印
 * 
 * @type
 */

/*******************************************************************************
 * 引入需要使用的js文件
 */
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/recommend.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/operationLog.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/ocxVoucher.js"></scr' + 'ipt>');
	


/**
 * 数据项
 */


var fileds=["plan_agent_note_code","plan_amount","plan_month","fund_type_code","pay_bank_code","fund_type_name","pay_bank_name","admdiv_code",
            "pay_bank_code","create_date","print_num","print_date","voucherFlag","bgt_type_code","bgt_type_name","task_id","plan_agent_note_id","bill_type_id","vt_code"];

/**
 * 列名
 */
var header = "额度通知单编号|plan_agent_note_code|120,金额|plan_amount,计划月份|plan_month|110,资金性质编码|fund_type_code,资金性质|fund_type_name,代理银行编码|pay_bank_code|100,"
		+ "代理银行名称|pay_bank_name|100,制单日期|create_date|110,打印次数|print_num,打印时间|print_date,预算类型编码|bgt_type_code,预算类型名称|bgt_type_name|110";


/*******************************************************************************
 * 状态
 */
 var voucherFlagStore = Ext.create('Ext.data.Store', {
 fields : ['name', 'value'],
 data : [{
 "name" : "发送单",
 "value" : 0
 }, {
 "name" : "回单",
 "value" : 1
 }, {
 "name" : "退回单",
 "value" : 2
 }]
 });

var gridPanel1=null;

/**
 * 界面加载
 */
Ext.onReady(function() {
	Ext.QuickTips.init();
	Ext.Loader.setPath('Ext', 'js/util');
	Ext.require(['Ext.PageUtil']);
	gridPanel1 = getGrid("/realware/loadBudgetNote.do", header,fileds, true, true);
	gridPanel1.setHeight(document.documentElement.scrollHeight - 88);
     gridPanel1.getStore().on('beforeload', function(thiz, options) {
			beforeload(Ext.getCmp("PlanAgentQuery"), options, Ext.encode(fileds));
     });
     gridPanel1.title="额度通知单信息";
            var buttonItems=[{
				            	id : 'print',
								handler : function() {
									var records = gridPanel1.getSelectionModel().getSelection();
									if (records.length == 0) {
										Ext.Msg.alert("系统提示", "请至少选择一条数据！");
										return;
									}
									printVoucherAUTO(gridPanel1.getSelectionModel().getSelection(),"plan_agent_note_id",false,records[0].get("vt_code"),printUrl,gridPanel1);
									
								}
            				},{
				            	id : 'look',
								handler : function() {
									lookOCX(gridPanel1.getSelectionModel().getSelection(),"plan_agent_note_id");
								}
            				},{
				            	id : 'refresh',
								handler : function() {
									refreshData();
								}
            				}];
		  var  queryItems=[{
   	                         title : "查询区",
					    	 id : 'PlanAgentQuery',
					    	 bodyPadding : 8,
					    	 layout : 'hbox',
					    	 defaults : {
					    		 margins : '3 5 0 0'
					         },
							items : [ 
							          {
										id : 'taskState',
										fieldLabel : '当前状态',
										xtype : 'combo',
										dataIndex : 'task_status',
										displayField : 'status_name',
										emptyText : '请选择',
										valueField : 'status_code',
										labelWidth : 53,
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
									}]
		                     },gridPanel1];
			   Ext.StatusUtil.createViewport(buttonItems, queryItems, function() {
		      Ext.StatusUtil.initPage(Ext.getCmp("admdiv"), Ext.getCmp("taskState"));
		      // 默认设置为未打印
		      Ext.getCmp('taskState').setValue("001");
//		      Ext.getCmp('voucherflag1').setValue(0);
			   });
});

/*******************************************************************************
 * 切换状态
 * 
 * @return
 */
function selectFlagState() {
	refreshData();
}



/*******************************************************************************
 * 状态下拉列表框选中事件
 */
function selectState() {
	var taskState = Ext.getCmp('taskState').getValue();
	if ("001" == taskState) {
		Ext.StatusUtil.batchEnable("print,look,refresh");
		
	} else if ("002" == taskState) {
		Ext.StatusUtil.batchEnable("print,look,refresh");
	}
}

/*******************************************************************************
 * 刷新
 * 
 * @return
 */
function refreshData() {
	gridPanel1.getStore().loadPage(1);
}
