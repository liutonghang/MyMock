/*******************************************************************************
 * 主要用于日报查询
 * 
 * @type
 */
 
 /***
 * 引入需要使用的js文件
 */
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/recommend.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/operationLog.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/ocxVoucher.js"></scr' + 'ipt>');
 
var dailyPanel = null;

/**
 * 数据项
 */

var fileds=["pay_daily_code","pay_amount","fund_type_code","fund_type_name","pay_bank_code",
	"pay_bank_name","create_date","print_num","print_date","task_id","bill_type_id","pay_daily_id","voucher_status","pay_type_code","pay_type_name","voucher_status_des","vou_date","vt_code"];

/**
 * 列名
 */
var header = "凭证状态|voucher_status_des|100,汇总单号|pay_daily_code|100,凭证日期|vou_date|100,金额|pay_amount,资金性质编码|fund_type_code|110,资金性质名称|fund_type_name|110,支付方式编码|pay_type_code,支付方式名称|pay_type_name,代理银行编码|pay_bank_code|100,"
		+ "代理银行名称|pay_bank_name|100,生成日期|create_date,打印次数|print_num,打印时间|print_date,凭证状态|voucherflag";

/*******************************************************************************
 * 状态
 */
var comboVoucherStatus = Ext.create('Ext.data.Store', {
			fields : ['name', 'value'],
			data : [{
						"name" : "全部",
						"value" : ""
					}, {
						"name" : "未发送到财政",
						"value" : "13"
					},{
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

var comboStore = Ext.create('Ext.data.Store', {
			fields : ['name', 'value'],
			data : [{
						"name" : "发送单",
						"value" : "0"
					}, {
						"name" : "回单",
						"value" : "1"
					}, {
						"name" : "退回单",
						"value" : "2"
					}]
		});

/**
 * 界面加载
 */
Ext.onReady(function() {
	Ext.QuickTips.init();
	//引用工具类
	Ext.Loader.setPath('Ext', 'js/util');
	Ext.require(['Ext.PageUtil']);
	dailyPanel = getGrid(loadUrl, header, fileds, true, true);
	dailyPanel.setHeight(document.documentElement.scrollHeight - 118);
	// 根据查询条件检索数据
	dailyPanel.getStore().on('beforeload', function(thiz, options) {
		if (admdiv == null || admdiv == "")
			return false;
		var panel = Ext.ComponentQuery.query("panel[title='查询区']")[0];
		beforeload(panel, options, Ext.encode(fileds));
	});
	
	//按钮触发事件
	var buttonItems =  [{
						//发送
						id : 'againSend',
						handler : function() {
							var voucherStatus = Ext.getCmp('voucherStatus').getValue();
							if("2" == voucherStatus || "0" == voucherStatus){
								sendVoucher(sendDailyUrl);
							}
							if("4" == voucherStatus || "5" == voucherStatus){
								sendVoucher("/realware/sendVoucherAgain.do");
							}
						}
					},{
						id : 'look',
						handler : function() {
							lookOCX(dailyPanel.getSelectionModel().getSelection(),"pay_daily_id");
						}
					}, {
						id : 'log',
						handler : function() {
							taskLog(dailyPanel.getSelectionModel().getSelection(),"pay_daily_id");
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
	    	defaults : {
					padding : '0 3 0 3'
				},
			layout : {
					type : 'table',
					columns : 4
				},
			bodyPadding : 5,
				items : [{
						id : 'voucherStatus',
						fieldLabel : '凭证状态',
						xtype : 'combo',
						dataIndex : 'voucher_status',
						displayField : 'name',
						emptyText : '请选择',
						valueField : 'value',
						store : comboVoucherStatus,
						editable : false,
						labelWidth : 60,
						width : 240,
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
						labelWidth : 60,
						width : 180,
						editable : false,
						store : comboAdmdiv
					}, {
						id : 'vou_dateStart',
						fieldLabel : '凭证日期',
						xtype : 'datefield',
						dataIndex : 'vou_date',
						format : 'Ymd',
						symbol : '>=',
						value : Ext.Date.format(new Date(), 'Ymd'),
						labelWidth : 70,
						width : 230
					}, {
						id : 'vou_dateEnd',
						fieldLabel : '&nbsp&nbsp&nbsp&nbsp&nbsp至',
						xtype : 'datefield',
						dataIndex : 'vou_date ',
						format : 'Ymd',
						symbol : '<=',
						labelWidth : 70,
						width : 230
					},
					{
						id : 'pay_daily_code1',
						fieldLabel : '汇总单号',
						xtype : 'textfield',
						dataIndex : 'pay_daily_code',
						labelWidth : 60,
						width : 300
					}]
		},dailyPanel];
							
	Ext.StatusUtil.createViewport(buttonItems, queryItems, function() {
		Ext.StatusUtil.initPage(Ext.getCmp("admdiv"));
		Ext.getCmp("voucherStatus").setValue("");
	});
	
});

/*******************************************************************************
 * 切换状态
 * 
 * @return
 */
function selectState() {
	var voucherStatus = Ext.getCmp('voucherStatus').getValue();
		if("2"==voucherStatus||"4"==voucherStatus||"0"==voucherStatus || "5"==voucherStatus){
			Ext.getCmp('againSend').enable(false);
		}else{
			Ext.getCmp('againSend').disable(false);
		}
//	if(initialLoad) {
		refreshData();
//	}
}


/*******************************************************************************
 * 刷新
 * 
 * @return
 */
function refreshData() {
	dailyPanel.getStore().loadPage(1);
}


/*******************************************************************************
 * 	签章发送、发送
 */
function sendVoucher(url) {
	var voucherStatus = Ext.getCmp('voucherStatus').getValue();
	var records = dailyPanel.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请选中一条凭证信息！");
		return;
	}
	var reqIds = [];
	
	Ext.Array.each(records,function(model){
			reqIds.push(model.get("pay_daily_id"));
	});
	
	var bill_type_id =  records[0].get("bill_type_id");
	
	var myMask = new Ext.LoadMask(Ext.getBody(), {
			msg : '后台正在处理中，请稍后....',
			removeMask : true // 完成后移除
		});
	myMask.show();
	Ext.Ajax.request({
				url : url,
				method : 'POST',
				timeout : 180000, // 设置为3分钟
				params : {
					billTypeId : bill_type_id,
					billIds : Ext.encode(reqIds),
					menu_id :  Ext.PageUtil.getMenuId()
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
