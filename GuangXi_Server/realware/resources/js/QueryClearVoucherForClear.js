/*******************************************************************************
 * 主要用于划款单查询
 * 
 * @type
 */

/***
 * 引入需要使用的js文件
 */
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/recommend.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/operationLog.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/ocxVoucher.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/createReport.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/lookPayVoucher.js"></scr' + 'ipt>');

/**
 * 列表
 */
var gridPanel1 = null;

/**
 * 数据项
 */
var fileds = ["pay_clear_voucher_code", "pay_amount", "agent_account_no",
		"agent_account_name", "agent_bank_name", "clear_account_no",
		"clear_account_name", "clear_bank_name", "fund_type_code",
		"fund_type_name", "pay_type_code", "pay_type_name", "pay_bank_code",
		"pay_bank_name", "vou_date", "confirm_date", "clear_date", "print_num",
		"print_date", "bgt_type_code", "bgt_type_name", 
		"bill_type_id", "pay_clear_voucher_id", "task_id","tips_pack_no","fin_voucher_status_des","pb_voucher_status_des","pay_dictate_no"]; // 数据项

/**
 * 列名k
 */
var header = "查看支付凭证|do1|130|lookPayVoucher,代理行凭证状态|pb_voucher_status_des|150,财政凭证状态|fin_voucher_status_des|150,划款凭证单编码|pay_clear_voucher_code|140,汇总清算金额|pay_amount,收款银行账号|agent_account_no,收款银行账户名称|agent_account_name,收款银行|agent_bank_name,支付交易序号|pay_dictate_no|100," 
		+ "付款账号|clear_account_no,付款账户名称|clear_account_name,付款银行|clear_bank_name,资金性质编码|fund_type_code,资金性质名称|fund_type_name,支付方式编码|pay_type_code,支付方式|pay_type_name,"
		+ "代理银行编码|pay_bank_code,代理银行名称|pay_bank_name,凭证日期|vou_date|100,回单日期|confirm_date|100,清算日期|clear_date,打印次数|print_num,打印时间|print_date,预算类型编码|bgt_type_code,"
		+ "预算类型名称|bgt_type_name,Tips文件包号|tips_pack_no";

		
/**
 * 界面加载
 */
Ext.onReady(function() {
	Ext.QuickTips.init();
	gridPanel1 = getGrid(loadUrl, header, fileds, true, true);
	gridPanel1.setHeight(document.documentElement.scrollHeight - 145);
	gridPanel1.getStore().on('beforeload', function(thiz, options) {
				var admdiv = Ext.getCmp('admdiv').getValue();
				if (admdiv == null || admdiv == "")
					return;
				/**
				 * 进行公用方法调用时，首先将对账日期设为空值，则被忽略
				 * 返回后的查询条件，再根据支付日期情况，添加支付日期
				 */
				var el = Ext.getCmp("key_date");
				var _date = el.getValue();
				el.setValue("");
				beforeload(Ext.getCmp("clearVoucherQuery"), options, Ext.encode(fileds));
				if(!Ext.isEmpty(_date)){
					el.setValue(_date);
					var key_date = el.getRawValue();
					/**
					 * 此处需要注意vou_date前边的空格，区分vou_date多查询字段
					 * 否则，会造成凭证日期字段重复，造成后台无法解析多字段情况
					 * lfj 2015-12-08
					 */
					var jsonMap = "\" vou_date\":" + Ext.encode(["like", key_date]);
					if (null == options.params || options.params == undefined) {
						options.params = [];
						options.params["jsonMap"] = "[{" + jsonMap + "}]";
						options.params["filedNames"] =JSON.stringify(fileds);
					} else {
						options.params["jsonMap"] = options.params["jsonMap"].substring(0, options.params["jsonMap"].length - 2) + "," + jsonMap + "}]";
						options.params["filedNames"] =JSON.stringify(fileds);
					}
				}
				
				Ext.getCmp("pb_voucher_status_des").renderer = function(value){
					if(null != value){
						value = value.replace("对方", "代理行");
						value = value.replace("本方", "清算行");
						    if(value=="未发送"){
						    		value = "清算行未发送";
						    }								
					}
					return value;
				};
				
				Ext.getCmp("fin_voucher_status_des").renderer = function(value){
					if(null != value){
						value = value.replace("对方", "财政");
						value = value.replace("本方", "清算行");
						    if(value=="未发送"){
						    		value = "未发送到财政";
						    }								
					}
					return value;
				};

			});
	//按钮触发事件			
	var buttonItems = [{				
				id : 'sendAgain',
				handler : function() {
					sendPayClearVoucherAgain();
				}
			},{				
				id : 'sendAgain1',
				handler : function() {
					sendPayClearVoucherAgain1();
				}
			},{
				id : 'print1',
				handler : function() {
					var key_date = Ext.getCmp("key_date").getRawValue();
					var admdiv_code = Ext.getCmp("admdiv").getValue();
					if(Ext.isEmpty(key_date)){
						Ext.Msg.alert("系统提示", "对账月份不能为空!");
						return;
					}
					
					var data = "[{\"key_date\":[\"" + key_date + "\"],\"admdiv_code\":[\""+ admdiv_code + "\"]}]";
					GridPrintDialog('undefined','undefined', loadGrfURL,loadDataURL,"reconciliation", data,100);
				}
			},{
				id : 'look',
				handler : function() {
					lookOCX(gridPanel1.getSelectionModel().getSelection(),"pay_clear_voucher_id");
				}
			}, {										
				id : 'Send',
				hidden : true,
				handler : function() {
					sendVoucher(sendCLearUrl);
				}
			}/**
			  * 划款单查询【清算行】
			  * 查询操作日志目前仅能显示划款单生成，而该操作不在清算行功能中
			  * 故此删除
			  * lfj 2015-10-19
			  */
			/*,{
				id : 'log',
				handler : function() {
					taskLog(gridPanel1.getSelectionModel().getSelection(),"pay_clear_voucher_id");
				}
			}*/, {
				id : 'refresh',
				handler : function() {
					refreshData();
				}
	}];
			
	//查询区						
	var queryItems =  [{
			title : "查询区",
			id : 'clearVoucherQuery',
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
				dataIndex : 'task_status',
				value : '000',
				hidden : true
			}, {
				id : 'admdiv',
				fieldLabel : '所属财政',
				xtype : 'combo',
				dataIndex : 'admdiv_code',
				displayField : 'admdiv_name',
				emptyText : '请选择',
				valueField : 'admdiv_code',
				labelWidth : 70,
				editable : false,
				store : comboAdmdiv,
				width : 230,
				value : comboAdmdiv.data.length > 0
						? comboAdmdiv.data.getAt(0).get("admdiv_code")
						: ""
			}, {
				id : 'createDateStar',
				fieldLabel : '凭证日期',
				xtype : 'datefield',
				dataIndex : "vou_date",
				format : 'Ymd',
				symbol : '>=',
				labelWidth : 70,
				width : 230
			}, {
				id : 'createDateEnd',
				fieldLabel : '&nbsp&nbsp&nbsp&nbsp&nbsp至',
				xtype : 'datefield',
				dataIndex : "vou_date ",
				format : 'Ymd',
				symbol : '<=',
				labelWidth : 70,
				width : 230,
				maxValue : new Date()
			}, {
				id : 'clearDateStar',
				fieldLabel : '清算日期',
				xtype : 'datefield',
				dataIndex : 'clear_date',
				format : 'Y-m-d',
				symbol : '>=',
				labelWidth : 70,
				width : 230,
				data_type:'date',
				data_format : 'yyyy-MM-dd'
			}, {
				id : 'clearDateEnd',
				fieldLabel : '&nbsp&nbsp&nbsp&nbsp&nbsp至',
				xtype : 'datefield',
				dataIndex : 'clear_date ',
				format : 'Y-m-d',
				symbol : '<=',
				labelWidth : 70,
				width : 230,
				data_type:'date',
				data_format : 'yyyy-MM-dd'
			}, {
				id : 'code',
				fieldLabel : '划款单编号',
				xtype : 'textfield',
				dataIndex : 'pay_clear_voucher_code',
				labelWidth : 70,
				width : 230
			}, 
			{
				id : 'voucherState',
				fieldLabel : '凭证状态',
				xtype : 'combo',
				dataIndex : 'pb_voucher_status',
				displayField : 'name',
				allowBlank : 'false',
				mode : 'local',
				emptyText : '请选择',
				valueField : 'value',
				labelWidth : 70,
				store : comboVoucherStatus2,
				Visible : false,
				value : '',
				width : 230,
				editable : false,
				listeners : {
					'select' : selectVoucherStore
				}
			},{
				id : 'voucherCode_special',
				fieldLabel : '支付凭证号',
				xtype : 'textfield',
				dataIndex : 'pay_voucher_code',
				labelWidth : 70,
				width : 230
			},{
				id : 'key_date',
				fieldLabel : '对账月份',
				xtype : 'datefield',
				format : 'Ym',
				dataIndex : "vou_date",
				symbol : 'like',
				labelWidth : 70,
				width : 180
			}, 
			{				
				id : 'admdivState',
				fieldLabel : '财政状态',
				xtype : 'combo',
				dataIndex : 'fin_voucher_status',
				displayField : 'name',
				allowBlank : 'false',
				mode : 'local',
				emptyText : '请选择',
				valueField : 'value',
				labelWidth : 70,
				store : finComboVoucherStatus,
				Visible : false,
				value : '',
				width : 230,
				editable : false,
				listeners : {
					'select' : selectVoucherStore1
				}
			}]
	},gridPanel1];

	Ext.StatusUtil.createViewport(buttonItems, queryItems, function() {
		Ext.StatusUtil.initPage(Ext.getCmp("admdiv"));
		Ext.getCmp('sendAgain').disable(false);
		Ext.getCmp('sendAgain1').disable(false);
	});
});
/**
 * 清算回单数状态据源
 */
var comboVoucherStatus2 = Ext.create('Ext.data.Store',{
	fields : ['name', 'value'],
	data : [{
				"name" : "全部",
				"value" : ""
			}, {
				"name" : "清算行未发送",
				"value" : "14"
			}, {
				"name" : "代理行未接收",
				"value" : "6"
			}, {
				"name" : "代理行接收成功",
				"value" : "7"
			}, {
				"name" : "代理行接收失败",
				"value" : "8"
			}, {
				"name" : "代理行签收成功",
				"value" : "9"
			}, {
				"name" : "代理行签收失败",
				"value" : "10"
			}, {
				"name" : "已退回代理行",
				"value" : "22"
			}]	
});

/**
 * 财政发送单状态数据源
 */
var finComboVoucherStatus = Ext.create('Ext.data.Store', {
	fields : ['name', 'value'],
	data : [{
				"name" : "全部",
				"value" : ""
			}, {
				"name" : "清算行未发送",
				"value" : "13"
			},  {
				"name" : "清算行已发送",
				"value" : "20"
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
			}]	
});


/**
 * 选择条件
 */
function selectAdmdiv() {
	setBtnVisible(Ext.getCmp("admdiv").getValue(), null);
	refreshData();
}
/**
 * 说明：划款单查询页面只有在"对方接收失败"的时候才会调用重新发送接口，
 *     而对于"对方签收失败"和"对方已退回"不会在这个菜单里处理，所以
 *     在这两个状态将"划款单重新发送"设置为不可用
 * @return
 */
function selectVoucherStore() {
	var voucherStatus = Ext.getCmp('voucherState').getValue();
	if ("8" == voucherStatus || "10" == voucherStatus || "11" == voucherStatus|| "6" == voucherStatus) {
		Ext.getCmp('look').disable(false);
		Ext.getCmp('sendAgain').enable(true);
	} else {
		Ext.getCmp('look').enable(false);
		Ext.getCmp('sendAgain').disable(false);
	}
	refreshData();
}
/**
 * 控制重新发送财政按钮
 */
function selectVoucherStore1() {
	var voucherStatus = Ext.getCmp('admdivState').getValue();
	if ("0" == voucherStatus || "2" == voucherStatus || "4" == voucherStatus) {
		Ext.getCmp('sendAgain1').enable();
	}else{
		Ext.getCmp('sendAgain1').disable();
	}
	refreshData();
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
 * 	签章发送、发送
 */
function sendVoucher(url) {
	var records = gridPanel1.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请选中一条凭证信息！");
		return;
	}
	var reqIds = "";
	for (var i = 0; i < records.length; i++) {
		reqIds += records[i].get("pay_clear_voucher_id");
		if (i < records.length - 1)
			reqIds += ",";
	}
	var bill_type_id=records[0].get("bill_type_id");
	var myMask = new Ext.LoadMask(Ext.getBody(), {
			msg : '后台正在处理中，请稍后....',
			removeMask : true // 完成后移除
		});
}

/*******************************************************************************
 * 	划款单重新发送代理行
 */
function sendPayClearVoucherAgain() {
	var voucherStatus = Ext.getCmp('voucherState').getValue();
	var requrl = '/realware/sendPayClearVoucherAgain.do';
	var records = gridPanel1.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请选择需要重新发送的划款单！");
		return;
	}
	if('10' == voucherStatus || '11' == voucherStatus){
		requrl = '/realware/sendPayClearVoucherAgainAfterDiscard.do';
	}
	
	var ids = null;
	
	// 选中的凭证的id数组，要传到后台
	for (var i = 0; i < records.length; i++) {
		ids += records[i].get("pay_clear_voucher_id");
		if (i < records.length - 1)
			ids += ",";
	}
	var myMask = new Ext.LoadMask(Ext.getBody(), {
		msg : '后台正在处理中，请稍后....',
		removeMask : true
			// 完成后移除
		});
	myMask.show();
	Ext.Ajax.request({
				url : requrl,
				method : 'POST',
				timeout : 180000, //设置为3分钟
				menu_id : Ext.PageUtil.getMenuId(),
				params : {
					ids : ids,
					voucherFlag : 1
				},
				success : function(response, options) {
					succAjax(response, myMask,true);
				},failure : function(response, options) {
					failAjax(response, myMask);
					refreshData();
				}
			});
}

/*******************************************************************************
 * 	划款单重新发送财政
 */
function sendPayClearVoucherAgain1() {
	var voucherStatus = Ext.getCmp('admdivState').getValue();
	var records = gridPanel1.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请选择需要重新发送的划款单！");
		return;
	}
	 if('0'== voucherStatus || '2'== voucherStatus){
		requrl = '/realware/sendAsspVoucher1.do';
	}else if('4' == voucherStatus){
		requrl = '/realware/sendAsspVoucherAgain1.do';
	}
	var ids = [];
	Ext.Array.each(records,function(model) {
		ids.push(model.get('pay_clear_voucher_id'));
	});
	var myMask = new Ext.LoadMask(Ext.getBody(), {
		msg : '后台正在处理中，请稍后....',
		removeMask : true
			// 完成后移除
		});
	myMask.show();
	Ext.Ajax.request({
				url : requrl,
				method : 'POST',
				timeout : 180000, //设置为3分钟
				menu_id : Ext.PageUtil.getMenuId(),
				params : {
					billIds : Ext.encode(ids),
					billTypeId : records[0].get('bill_type_id')
				},
				success : function(response, options) {
					succAjax(response, myMask,true);
				},failure : function(response, options) {
					failAjax(response, myMask);
					refreshData();
				}
			});
}
