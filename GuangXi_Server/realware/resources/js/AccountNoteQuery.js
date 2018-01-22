/*
 * 入账通知单查询
 */
 
/***
 * 引入需要使用的js文件
 */
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/recommend.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/operationLog.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/ocxVoucher.js"></scr' + 'ipt>');


/**
 * 列表
 */
var gridPanel1 = null;

/**
 * 数据项
 */

var fileds = ["pay_account_note_code", "pay_amount", "agency_code",
		"agency_name", "pay_bank_code", "pay_bank_name", "vou_date",
		"print_num", "print_date", "remark", "task_id", "bill_type_id",
		"pay_account_note_id", "voucher_status","vt_code","voucher_status_err"];
/**
 * 列名
 */
var header = "凭证状态|voucher_status|100,入账通知单编码|pay_account_note_code|140,支付金额|pay_amount|100,基层预算单位编码|agency_code|140,基层预算单位名称|agency_name|140,"
		+ "代理银行编码|pay_bank_code|140,代理银行名称|pay_bank_name|140,凭证日期|vou_date|140,打印次数|print_num|140,打印时间|print_date|140,备注|remark|140,凭证状态描述|voucher_status_err|200";

var comboVoucherStatus = Ext.create('Ext.data.Store', {
			fields : ['name', 'value'],
			data : [{
						"name" : "全部",
						"value" : ""
					}, {
						"name" : "银行未发送",
						"value" : "13"
					}, {
						"name" : "财政未接收",
						"value" : "0"
					}, {
						"name" : "财政接收成功",
						"value" : "1"
					}, {
						"name" : "财政接收失败",
						"value" : "2"
					}, {
						"name" : "财政签收成功",
						"value" : "3"
					}, {
						"name" : "财政签收失败",
						"value" : "4"
					}, {
						"name" : "财政已退回",
						"value" : "5"
					},{
						"name" : "已收到财政回单",
						"value" : "12"
					}]		
});


/**
 * 界面加载
 */
Ext.onReady(function() {
	Ext.QuickTips.init();
	gridPanel1 = getGrid(loadUrl, header, fileds, true, true);
	gridPanel1.setHeight(document.documentElement.scrollHeight - 124);
	// 根据查询条件检索数据
	gridPanel1.getStore().on('beforeload', function(thiz, options) {
		beforeload(Ext.getCmp("accountNoteQuery"), options, Ext.encode(fileds));
	});
	
	//按钮触发事件
	var buttonItems = [{
			id : 'againSend',
			handler : function() {
				var voucherStatus = Ext.getCmp('voucherStatus').getValue();
				if("2" == voucherStatus || "0" == voucherStatus){
					sendVoucher(sendAccountNoteUrl);
				}else {
					sendVoucher(sendAgainUrl);
				}
			}
		}, {
			id : 'look',
			handler : function() {
				lookOCX(gridPanel1.getSelectionModel().getSelection(),"pay_account_note_id");
			}
		}, {
			id : 'log',
			handler : function() {
				taskLog(gridPanel1.getSelectionModel().getSelection(),"pay_account_note_id");
			}
		}, {
			id : 'refresh',
			handler : function() {
				refreshData();
			}
		}];
	
	//查询区
	var queryItems = [{
		title : "查询区",
		frame : false,
		id : 'accountNoteQuery',
		bodyPadding : 8,
		layout : {
			type : 'table',
			columns : 3
		},
		items : [{
					id : 'voucherStatus',
					fieldLabel : '凭证状态',
					xtype : 'combo',
					dataIndex : 'voucher_status',
					displayField : 'name',
					emptyText : '请选择',
					valueField : 'value',
					store : comboVoucherStatus,
					style : 'margin-bottom:5px;margin-top:5px;margin-left:5px;margin-right:5px;',
					editable : false,
					value : "",
					listeners : {
						change : function(combo, newValue, oldValue, eOpts) {
						try {
							selectFlagState(combo.valueModels[0].raw.value,combo, newValue, oldValue, eOpts);
						} catch(e) {}
						}
					}
				}, {
					id : 'admdiv',
					fieldLabel : '所属财政',
					xtype : 'combo',
					dataIndex : 'admdiv_code',
					displayField : 'admdiv_name',
					emptyText : '请选择',
					valueField : 'admdiv_code',
					editable : false,
					store : comboAdmdiv,
					style : 'margin-bottom:5px;margin-top:5px;margin-left:5px;margin-right:5px;'
				}, {
					id : 'vou_date1',
					fieldLabel : '凭证日期',
					xtype : 'datefield',
					format : 'Ymd',
					dataIndex : 'vou_date',
					style : 'margin-bottom:5px;margin-top:5px;margin-left:5px;margin-right:5px;'
				}, {
					id : 'agency',
					fieldLabel : '预算单位编码',
					xtype : 'textfield',
					dataIndex : 'agency_code',
					style : 'margin-bottom:5px;margin-top:5px;margin-left:5px;margin-right:5px;'
				},{
					id : 'agency1',
					fieldLabel : '预算单位名称',
					xtype : 'textfield',
					dataIndex : 'agency_name',
					style : 'margin-bottom:5px;margin-top:5px;margin-left:5px;margin-right:5px;'
				},{
					id : 'accountType',
					fieldLabel : '凭证类型',
					xtype : 'combo',
					dataIndex : 'task_status',
					displayField : 'status_name',
					emptyText : '请选择',
					valueField : 'status_code',
					editable : false,
					style : 'margin-bottom:5px;margin-top:5px;margin-left:5px;margin-right:5px;',
					value : ""
				}]
			
		},gridPanel1];
	Ext.StatusUtil.createViewport(buttonItems, queryItems, function() {
		Ext.StatusUtil.initPage(Ext.getCmp("admdiv"), Ext.getCmp("accountType"));
		Ext.StatusUtil.batchDisable("againSend");
	});
	Ext.getCmp("voucher_status").renderer = function(value){
		if(null != value){
			value = value.replace("对方", "财政");
			value = value.replace("本方", "银行");
			    if(value=="未发送"){
			    		value = "未发送到财政";
			    }								
		}
		return value;
	};
});

/*******************************************************************************
 * 切换状态
 * 
 * @return
 */
function selectFlagState(status_code,combo, newValue, oldValue, eOpts) {
	Ext.StatusUtil.batchEnable("look");
	
	if(status_code=='2'||status_code=='4'||status_code=='0'||status_code=='5'){
		Ext.StatusUtil.batchEnable("againSend");
	}else{
		Ext.StatusUtil.batchDisable("againSend");
	}
	if(status_code=='14'){
		Ext.StatusUtil.batchDisable("look");
	}
	if(oldValue != undefined || initialLoad) {
		refreshData();
	}
}


function selectAdmdiv() {
	setBtnVisible(Ext.getCmp("admdiv").getValue(), null);
	refreshData();
}

function refreshData() {
		gridPanel1.getStore().loadPage(1);
}

/*******************************************************************************
 * 签章发送
 */
function sendVoucher(url) {
	// alert(url);
	var records = gridPanel1.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请选中一条凭证信息！");
		return;
	}
	var reqIds = [];
	
	Ext.Array.each(records,function(model){
			reqIds.push(model.get("pay_account_note_id"));
	});
	
	var bill_type_id = records[0].get("bill_type_id");
	var myMask = new Ext.LoadMask(Ext.getBody(), {
		msg : '后台正在处理中，请稍后....',
		removeMask : true
			// 完成后移除
		});
	myMask.show();
	Ext.Ajax.request({
				url : url,
				method : 'POST',
				timeout : 180000, // 设置为3分钟
				params : {
					billTypeId : bill_type_id,
					billIds : Ext.encode(reqIds)
				},
				success : function(response, options) {
					succAjax(response, myMask,true);
				},
				failure : function(response, options) {
					failAjax(response, myMask);
					refreshData();
				}
			});
}