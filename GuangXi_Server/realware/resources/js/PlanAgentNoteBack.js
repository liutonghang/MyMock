/*******************************************************************************
 * 授权额度通知单回单查询
 * 
 * @type
 */

/***
 * 引入需要使用的js文件
 */
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/recommend.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/ocxVoucher.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/backVoucher.js"></scr' + 'ipt>');	

var gridPanel1 = null;

/**
 * 数据项
 */
var fileds=["plan_agent_note_code","plan_amount","plan_month","fund_type_code","pay_bank_code","fund_type_name","pay_bank_name",
            "pay_bank_code","create_date","print_num","print_date","voucherFlag","bgt_type_code","bgt_type_name","task_id",
            "plan_agent_note_id","bill_type_id","send_flag", "audit_remark", "last_ver"];

/**
 * 列名
 */
var header = "退回原因|audit_remark|140,额度通知单编号|plan_agent_note_code|120,金额|plan_amount,计划月份|plan_month|110,资金性质编码|fund_type_code,资金性质|fund_type_name,代理银行编码|pay_bank_code|100,"
		+ "代理银行名称|pay_bank_name|100,制单日期|create_date|110,打印次数|print_num,打印时间|print_date,预算类型编码|bgt_type_code,预算类型名称|bgt_type_name|110";

var gridPanel1 = null;

/**
 * 界面加载
 */
Ext.onReady(function() {
	Ext.QuickTips.init();
	gridPanel1 = getGrid("/realware/loadBudgetNote.do", header, fileds, true, true);
	gridPanel1.setHeight(document.documentElement.scrollHeight - 88);
	gridPanel1.getStore().on('beforeload', function(thiz, options) {
		var admdivCode = Ext.getCmp('admdiv').getValue();
		if(Ext.isEmpty(admdivCode)){
			return false;
		}
		beforeload(Ext.getCmp("planQuery"), options, Ext.encode(fileds));
	});
	 
	gridPanel1.title = "额度通知单信息";
					var	 buttonItems = [{
											id : 'signsend',
											text : '签章发送',
											iconCls : 'sign',
											scale : 'small',
											handler : function() {
												sendVoucher();
											}
										},
				  	                    {
				  	                    	//退回
				  	                    	id : 'back',
											handler : function() {
				  	                    		backvoucher();
											}
				  	                    },{
								         	id : 'look',
											text : '查看凭证',
											iconCls : 'look',
											scale : 'small',
											handler : function() {
												lookOCX(gridPanel1.getSelectionModel().getSelection(),"plan_agent_note_id");
											}
										}, {
											id : 'refresh',
											text : '刷新',
											iconCls : 'refresh',
											scale : 'small',
											handler : function() {
												refreshData();
											}
										}];
				var	queryItems = [{
								title : '查询区',
								id : 'planQuery',
								bodyPadding : 5,
								layout : 'hbox',
								defaults : {
									margins : '3 10 0 0'
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
									//		store : comboStore,
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
			                     },gridPanel1
								
							];
			   Ext.StatusUtil.createViewport(buttonItems, queryItems, function() {
			      Ext.StatusUtil.initPage(Ext.getCmp("admdiv"), Ext.getCmp("taskState"));
			      Ext.getCmp('taskState').setValue("001");
			   });
	
});

/*******************************************************************************
 * 状态下拉列表框选中事件
 */
function selectState() {
	var taskState = Ext.getCmp('taskState').getValue();
	if ("001" == taskState) {
		Ext.StatusUtil.batchEnable("signsend,back");
		gridPanel1.down('#audit_remark').hide();
	} else if ("002" == taskState) {
		Ext.StatusUtil.batchDisable("signsend,back");
		gridPanel1.down('#audit_remark').hide();
	}else if("003"==taskState){
		Ext.StatusUtil.batchDisable("signsend,back");
		gridPanel1.down('#audit_remark').show();
	}
}

/**
 * 签章发送
 * @return
 */
function sendVoucher() {
	var records = gridPanel1.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请选中一条凭证信息！");
		return;
	}
	var ids = []; // 凭证主键字符串
	var lastVers = []; // 凭证lastVer字符串
	Ext.Array.each(records, function(model) {
			ids.push(model.get("plan_agent_note_id"));
			lastVers.push(model.get("last_ver"));
	});
	
	var myMask = new Ext.LoadMask(Ext.getBody(), {
		msg : '后台正在处理中，请稍后....',
		removeMask : true // 完成后移除
	});
	myMask.show();
	
	Ext.Ajax.request({
				url : signPlanAgentNoteUrl,
				waitMsg : '后台正在处理中,请稍后....',
				method : 'POST',
				timeout : 30000, // 设置为3分钟
				params : {
					billTypeId : records[0].get("bill_type_id"),
					billIds : Ext.encode(ids),
					last_vers : Ext.encode(lastVers)
				},
				success : function(response, options) {
					succAjax(response, myMask);
					refreshData();
				},
				failure : function(response, options) {
					failAjax(response, myMask);
					refreshData();
				}
			});
}


/*******************************************************************************
 * 刷新
 * 
 * @return
 */
function refreshData() {
	gridPanel1.getStore().loadPage(1);
}
/*******************************************************************************
 * 退回
 * 
 * @return
 */
function backvoucher(){
	var records = gridPanel1.getSelectionModel().getSelection();
	var flag = false;
	Ext.Array.each(records, function(model) {
		if(model.get('send_flag')==1){
			flag = true;
		}
	});
	if(flag){
		Ext.Msg.alert("系统提示", "选中记录中包含已经回单财政的数据不能再进行退回财政操作！");
		return;
	};
	backVoucher(backUrl,records,"plan_agent_note_id");
	
}