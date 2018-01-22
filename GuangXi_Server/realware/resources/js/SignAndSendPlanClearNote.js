/*******************************************************************************
 * 主要用于授权支付清算回单签章发送
 * 
 * @type
 */
/*******************************************************************************
 * 引入需要使用的js文件
 */
document.write('<scr'
				+ 'ipt type="text/javascript" src="/realware/resources/js/recommend.js"></scr'
				+ 'ipt>');
document.write('<scr'
				+ 'ipt type="text/javascript" src="/realware/resources/js/share/operationLog.js"></scr'
				+ 'ipt>');
document.write('<scr'
				+ 'ipt type="text/javascript" src="/realware/resources/js/share/ocxVoucher.js"></scr'
				+ 'ipt>');
document.write('<scr'
						+ 'ipt type="text/javascript" src="/realware/js/view/common/TextareaWindow.js"></scr'
						+ 'ipt>');


/**
 * 列表
 */
var payClearNotePanel = null;
/**
 * 数据项
 * 
 * @type
 */
var fileds = [ "plan_clear_note_id", "plan_clear_note_code", "plan_amount",
		"vou_date", "plan_month", "fund_type_name", "fund_type_code",
		"clear_bank_code", "clear_bank_name", "pay_bank_code", "pay_bank_name",
		 "last_ver", "send_flag",
		"admdiv_code", "bill_type_id","acct_date" ];
/**
 * 列名
 * 
 * @type
 */
var header = "额度清算单编号|plan_clear_note_code|120,金额|plan_amount,计划月份|plan_month|110,凭证日期|vou_date,处理日期|acct_date,资金性质编码|fund_type_code,资金性质|fund_type_name,代理银行编码|pay_bank_code|100,"
		+ "代理银行名称|pay_bank_name|130,预算类型编码|bgt_type_code,预算类型名称|bgt_type_name|110"

Ext.onReady(function() {
	Ext.QuickTips.init();
	// 引用工具类
	Ext.Loader.setPath('Ext', 'js/util');
	Ext.require([ 'Ext.PageUtil' ]);
	payClearNotePanel = getGrid(loadUrl, header, fileds, true, true);
	payClearNotePanel
			.setHeight(document.documentElement.scrollHeight - 88);
	// 根据查询条件检索数据
	payClearNotePanel.getStore().on(
			'beforeload',
			function(thiz, options) {
				var admdiv = Ext.getCmp('admdiv').getValue();
				if (admdiv == null || admdiv == "")
					return;
				
				beforeload(Ext.getCmp("regidsterQuery"), options, Ext.encode(fileds));
			});
	var buttonItems = [
			{
				id : 'signAndSend',
				handler : function() {
					signAndSendPlanClearNote();
				}
			},
			{
				id : 'send',
				handler : function() {
					sendPlanClearNoteAgain();
				}
			},
			{
				id : 'lookOcx',
				handler : function() {
					lookOCX(payClearNotePanel.getSelectionModel()
							.getSelection(), "plan_clear_note_id");
				}
			}, {
				id : 'refresh',
				handler : function() {
					refreshData();
				}
			} , {
				id:'back',
				handler : function() {
					back();
				}
			}];
	var queryItems = [{
						id : 'regidsterQuery',
						title : '查询区',
						bodyPadding : 6,
						layout : 'column',
						defaults : {
							padding : '0 5 0 5'
						},
						items : [ {
							id : 'taskState',
							fieldLabel : '当前状态',
							xtype : 'combo',
							dataIndex : 'task_status',
							displayField : 'status_name',
							emptyText : '请选择',
							valueField : 'status_code',
							labelWidth : 53,
							width : 140,
							editable : false,
							listeners : {
								'change' : selectState
							}
						}, {
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
						}, {
							id : 'code',
							fieldLabel : '凭证号',
							xtype : 'textfield',
							labelWidth : 45,
							symbol : '>=',
							dataIndex : 'plan_clear_note_code '
						}, {
							id : 'codeEnd',
							fieldLabel : '至',
							xtype : 'textfield',
							symbol : '<=',
							labelWidth : 10,
							dataIndex : 'plan_clear_note_code'
						} , {   
                            id : 'vouDate',
                            fieldLabel : '凭证日期',
                            xtype : 'datefield',
                            labelWidth : 60,
                            format : 'Ymd',
                            dataIndex : 'vou_date'
                        }]
					}, payClearNotePanel ];

	Ext.StatusUtil.createViewport(buttonItems, queryItems, function() {
		Ext.StatusUtil.initPage(Ext.getCmp("admdiv"), Ext
				.getCmp("taskState"));
		// 默认设置为未生成
		Ext.getCmp('taskState').setValue("001");
		
	});
});

/*******************************************************************************
 * 状态下拉列表框选中事件
 */
function selectState() {
	var taskState = Ext.getCmp('taskState').getValue();
	if ("001" == taskState) {
		Ext.StatusUtil.batchEnable("signAndSend,back");
		Ext.StatusUtil.batchDisable("send");
	} else if ("002" == taskState) {
		Ext.StatusUtil.batchEnable("send");
		Ext.StatusUtil.batchDisable("signAndSend,back");
	}else{
		Ext.StatusUtil.batchEnable("");
		Ext.StatusUtil.batchDisable("send,signAndSend,back");
	}
	
}

function selectAdmdiv() {
	refreshData();
}

function signAndSendPlanClearNote() {
	var records = payClearNotePanel.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请至少选择一条数据！");
		return;
	}
	var ids = null;
	// 选中的凭证的id数组，要传到后台
	for ( var i = 0; i < records.length; i++) {
		ids += records[i].get("plan_clear_note_id");
		if (i < records.length - 1)
			ids += ",";
	}
	Ext.Ajax.request({
		url : signAndSendUrl,
		waitMsg : '后台正在处理中,请稍后....',
		method : 'POST',
		timeout : 180000, // 设置为3分钟
		async : false,// 添加该属性即可同步,
		params : {
			planClearNoteIds : ids,
			menu_id : Ext.PageUtil.getMenuId()
		},
		success : function(response, options) {
			Ext.Msg.alert("系统提示", "授权汇总清算单签章发送成功！");
			refreshData();
		},
		failure : function(response, options) {
			Ext.Msg.alert("系统提示", response.responseText);
		}
	});
}

function sendPlanClearNoteAgain() {
	var records = payClearNotePanel.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请选择要需要重新发送的数据！");
		return;
	}
	var ids = null;
	// 选中的凭证的id数组，要传到后台
	for ( var i = 0; i < records.length; i++) {
		ids += records[i].get("plan_clear_note_id");
		if (i < records.length - 1)
			ids += ",";
	}
	Ext.Ajax.request({
		url : sendAgainUrl,
		waitMsg : '后台正在处理中,请稍后....',
		method : 'POST',
		timeout : 180000, // 设置为3分钟
		async : false,// 添加该属性即可同步,
		params : {
			planClearNoteIds : ids,
			menu_id : Ext.PageUtil.getMenuId()
		},
		success : function(response, options) {
			Ext.Msg.alert("系统提示", "重新发送成功！");
			refreshData();
		},
		failure : function(response, options) {
			Ext.Msg.alert("系统提示", response.responseText);
		}
	});
}

//退回财政
function back(){
	var me = this;
	var records = payClearNotePanel.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请选择一条的数据！");
		return;
	}
	var ids=[];
	var lastVers =[];
	Ext.Array.each(records,function(model) {
		ids.push(model.get('plan_clear_note_id'));
		lastVers.push(model.get("last_ver"));
	});
	var bill_type_id = records[0].get("bill_type_id");
	var backvoucherwindow = Ext.create('pb.view.common.TextareaWindow',{
		textareaValue : records[0].get("return_reason") ,
		title : '退回财政'
	});
	backvoucherwindow.on('confirmclick',function(o,textarea){
		var params = {
			returnRes : textarea,
			billIds : Ext.encode(ids),
			last_vers : Ext.encode(lastVers),
			billTypeId : bill_type_id
		};
		Ext.PageUtil.doRequestAjax(me,'/realware/backPlanClearNote.do',params);
	});
	backvoucherwindow.show();
}
/*******************************************************************************
 * 刷新
 * 
 * @return
 */
function refreshData() {
	payClearNotePanel.getStore().loadPage(1);
}
