/*******************************************************************************
 * 划款清算申请单发送财政
 * 
 * @type
 */

/***
 * 引入需要使用的js文件
 */
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/recommend.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/operationLog.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/ocxVoucher.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/lookPayVoucher.js"></scr' + 'ipt>');
	

// 划款信息
var fileds = ["pay_clear_voucher_id","pay_clear_voucher_code", "pay_amount", "agent_account_no",
		"agent_account_name", "agent_bank_name", "clear_account_no",
		"clear_account_name", "clear_bank_name", "fund_type_code",
		"fund_type_name", "pay_clear_voucher_id", "pay_type_code",
		"pay_type_name", "pay_bank_code", "pay_bank_name", "confirm_date",
		"bgt_type_code", "bgt_type_name", "bill_type_id", "task_id", "last_ver", "pay_bank_no","vt_code","year","admdiv_code","vou_date","clear_date","finclear_voucher_status_des"];

var header = "查看支付凭证|do1|130|lookPayVoucher,凭证号|pay_clear_voucher_code|150,凭证状态|finclear_voucher_status_des,金额|pay_amount|120,清算日期|clear_date|135,收款银行账号|agent_account_no|130,收款银行账户名称|agent_account_name|150,收款银行名称|agent_bank_name|150,"
		+ "付款银行账号|clear_account_no,付款银行账户名称|clear_account_name|150,付款银行名称|clear_bank_name|150,资金性质编码|fund_type_code,资金性质名称|fund_type_name,"
		+ "支付方式编码|pay_type_code,支付方式名称|pay_type_name,代理银行行号|pay_bank_no,代理银行名称|pay_bank_name|140,凭证日期|vou_date,回单日期|confirm_date,"
		+ "预算类型编码|bgt_type_code,预算类型名称|bgt_type_name";
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


Ext.onReady(function() {
	Ext.QuickTips.init();
	//引用工具类
	Ext.Loader.setPath('Ext', 'js/util');	
	Ext.require(['Ext.PageUtil']);
	var loadUrl ="loadClearPayVoucher.do";
	store1 = getStore(loadUrl, fileds);
	column1 = getColModel(header, fileds);
	Ext.each(column1, function(item) {
		if(item.dataIndex == 'finclear_voucher_status_des') {
			item.renderer = function(value){
				if(null != value){
					value = value.replace("对方", "财政");
					value = value.replace("本方", "银行");
					value = value.replace("清算行", "财政");
				    if(value=="未发送"){
			    		value = "未发送到财政";
				    }								
				}
				return value;
			};
			return false;
		}
	});
	var pagetool = getPageToolbar(store1);
	
	store1.on('beforeload', function(thiz, options,e) {
		var admdiv = Ext.getCmp('admdiv').getValue();
//		if (admdiv == null || admdiv == "")
//			return;
		var panel = Ext.ComponentQuery.query("panel[title='查询区']")[0];
		beforeload(panel, options, Ext.encode(fileds));
	});

	var buttonItems = [{
			id : 'sendFin',
			handler : function() {
				sendPayClearVoucherToFin();
			}
		}, {
			id : 'send',
			handler : function() {
				sendVoucher();
			}
		}, {
			id : 'uncreate',
			
			handler : function() {
				uncreateVoucher();
			}
		}, {
			id : 'look',
			handler : function() {
				var records = Ext.getCmp("signAndSendFindClearVoucher").getSelectionModel().getSelection();
				//验证 大于等于零，小于等于99999999.99 的数字
				var r =  /^([1-9][\d]{0,7}|0)(\.[\d]{1,2})?$/;
				if (records.length > 0) {
					if(r.test(records[0].get("pay_amount"))){
						lookOCX(Ext.getCmp("signAndSendFindClearVoucher").getSelectionModel().getSelection(),"pay_clear_voucher_id", '2351');
					}else{
						lookOCX(Ext.getCmp("signAndSendFindClearVoucher").getSelectionModel().getSelection(),"pay_clear_voucher_id", '2352');
					}
				}
			}
		}, {
			id : 'print',
			handler : function() {
					var recordsr = Ext.getCmp("signAndSendFindClearVoucher").getSelectionModel().getSelection();
				if (recordsr.length == 0) {
					Ext.Msg.alert("系统提示", "请选择数据！");
					return;
				}
				printPageVoucherByXml(recordsr,"pay_clear_voucher_id",'pay_clear_voucher_code',recordsr[0].get("vt_code"));
			}
		
		},{
			id : 'log',
			handler : function() {
				taskLog(Ext.getCmp("signAndSendFindClearVoucher").getSelectionModel().getSelection(),"pay_clear_voucher_id");
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
		frame : false,
		layout : 'hbox',
		defaults : {
			margins : '3 10 0 0'
		},
		items : [{
				id : 'taskState',
				fieldLabel : '当前状态',
				xtype : 'combo',
				dataIndex : 'task_status',
				displayField : 'status_name',
				emptyText : '请选择',
				valueField : 'status_code',
				width : 140,
				labelWidth : 60,
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
			labelWidth : 60,
			width : 200,
			editable : false,
			store : comboAdmdiv
		}, {
			id : 'start_confirmDate',
			fieldLabel : '生成日期',
			xtype : 'datefield',
			symbol : '>',
			dataIndex : "create_date",
			format : 'Ymd',
			labelWidth : 60,
			data_type:'date'
		}, {
			id : 'end_confirmDate',
			fieldLabel : '至',
			xtype : 'datefield',
			symbol : '<=',
			dataIndex : "create_date ",
			format : 'Ymd',
			labelWidth : 15,
			maxValue : new Date(),
			data_type:'date'
		} ,{
			id : 'voucherStatus',
			fieldLabel : '凭证状态',
			xtype : 'combo',
			dataIndex : 'finclear_voucher_status',
			value : "",
			displayField : 'name',
			emptyText : '请选择',
			valueField : 'value',
			store : comboVoucherStatus,
			editable : false,
			labelWidth : 60,
			width : 180,
			listeners : {
				'select' : selectStatus
			}
		}],
		flex : 2
	}, {
		id : 'signAndSendFindClearVoucher',
		xtype : 'gridpanel',
		selType : 'checkboxmodel',
		height : document.documentElement.scrollHeight- 95,
		frame : false,
		enableKeyNav : true,
		multiSelect : true,
		title : '凭证列表信息',
		selModel : {
			mode : 'multi',
			checkOnly : true
		},
		features: [{
    		ftype: 'summary'
		}],
		store : store1,
		columns : column1,
		loadMask : {
			msg : '数据加载中,请稍等...'
		},
		bbar : pagetool
	}];

	Ext.StatusUtil.createViewport(buttonItems, queryItems, function() {
		Ext.StatusUtil.initPage(Ext.getCmp("admdiv"), Ext.getCmp("taskState"));
		Ext.getCmp('taskState').setValue("001");
	});
});

function selectStatus(){
	var  statuId = Ext.getCmp('voucherStatus').getValue();
	if(statuId == "5" || statuId == "4"){
		Ext.StatusUtil.batchEnable('uncreate');	
	}else{
		Ext.StatusUtil.batchDisable('uncreate');	
	}
	if(statuId == "2"){
		Ext.StatusUtil.batchEnable('send');	
	}else{
		Ext.StatusUtil.batchDisable('send');	
	}
	refreshData();
}
/*******************************************************************************
 * 状态下拉列表框选中事件
 */
function selectState() {
	var taskState = Ext.getCmp('taskState').getValue();
	if ("001" == taskState) {
		Ext.getCmp('sendFin').enable(false);
		Ext.StatusUtil.batchDisable("uncreate,send,look");
		Ext.getCmp('voucherStatus').setVisible(false);
		Ext.getCmp('voucherStatus').setValue("");
	} else if ("002" == taskState) {
		Ext.getCmp('look').enable(false);
		Ext.StatusUtil.batchDisable("uncreate,send,sendFin");
		Ext.getCmp('voucherStatus').setVisible(true);
	}
}

/*******************************************************************************
 * 所属财政
 */
function selectAdmdiv() {
	setBtnVisible(Ext.getCmp("admdiv").getValue(), null);
	refreshData();
}

/*******************************************************************************
 * 刷新
 */
function refreshData() {
	Ext.getCmp("signAndSendFindClearVoucher").getStore().loadPage(1);
}

/*******************************************************************************
 * 签章发送
 */
function sendPayClearVoucherToFin() {

	var records = Ext.getCmp("signAndSendFindClearVoucher").getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请选择要签章划款单的数据！");
		return;
	}
	var reqIds = [];
	var reqVers = [];
	Ext.Array.each(records,function(model){
			reqIds.push(model.get("pay_clear_voucher_id"));
			reqVers.push(model.get("last_ver"));
	});
	var bill_type_id = records[0].get("bill_type_id");
	var myMask = new Ext.LoadMask(Ext.getBody(), {
		msg : '后台正在处理中，请稍后....',
		removeMask : true
			// 完成后移除
		});
	myMask.show();
	Ext.Ajax.request({
				url : '/realware/sendPayClearVoucherToFin.do',
				method : 'POST',
				timeout : 180000, // 设置为3分钟
				params : {
					billTypeId : bill_type_id,
					billIds : Ext.encode(reqIds),
					last_vers : Ext.encode(reqVers),
					menu_id :  Ext.PageUtil.getMenuId()
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

/*******************************************************************************
 * 重新发送
 */
function sendVoucher() {

	var records = Ext.getCmp("signAndSendFindClearVoucher").getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请选择要需要重新发送的划款单！");
		return;
	}
	var bill_type_id = records[0].get("bill_type_id");
	var pay_amount = records[0].get("pay_amount");
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
				url : '/realware/sendVouchervByVtCode.do',
				method : 'POST',
				timeout : 60000, // 设置为3分钟
				params : {
					billTypeId : bill_type_id,
					billIds : ids,
					pay_Amount : pay_amount,
					menu_id :  Ext.PageUtil.getMenuId()
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
/*******************************************************************************
 * 撤销生成
 */
function uncreateVoucher() {
	//var records = clearGridPanel.getSelectionModel().getSelection();
	var records = Ext.getCmp("signAndSendFindClearVoucher").getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请选择要需要撤销生成的划款单！");
		return;
	}
	var myMask = new Ext.LoadMask(Ext.getBody(), {
				msg : '后台正在处理中，请稍后....',
				removeMask : true
			});
	var reqIds = [];
	var reqVers = [];
	Ext.Array.each(records, function(model) {
				reqIds.push(model.get("pay_clear_voucher_id"));
				reqVers.push(model.get("last_ver"));
			});
	myMask.show();
	Ext.Ajax.request({
				url : '/realware/unCreateClearVoucher.do',
				method : 'POST',
				timeout : 180000,
				params : {
					billTypeId : records[0].get("bill_type_id"),
					billIds : Ext.encode(reqIds),
					last_vers : Ext.encode(reqVers),
					isBack : true,
					menu_id :  Ext.PageUtil.getMenuId()
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
