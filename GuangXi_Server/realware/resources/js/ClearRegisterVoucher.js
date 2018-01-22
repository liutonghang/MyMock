/*******************************************************************************
 * 引入需要使用的js文件
 */
document
		.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/recommend.js"></scr' + 'ipt>');
document
		.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/backVoucher.js"></scr' + 'ipt>');
document
		.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/ocxVoucher.js"></scr' + 'ipt>');

/*******************************************************************************
 * 主要用于划款清算登记
 * 
 * @type
 */

// 划款信息
var fileds = [ "pay_clear_voucher_code", "pay_amount", "agent_account_no",
		"agent_account_name", "agent_bank_name", "clear_account_no",
		"clear_account_name", "clear_bank_name", "fund_type_code",
		"fund_type_name", "pay_type_code", "pay_type_name", "pay_bank_code",
		"pay_bank_name", "clear_date", "confirm_date", "bgt_type_code",
		"bgt_type_name", "task_id", "pay_clear_voucher_id", "bill_type_id",
		"last_ver", "return_reason", "vou_date", "create_date","fin_voucher_status_des" ];

var header = "凭证状态|fin_voucher_status_des|100,凭证号|pay_clear_voucher_code|130,金额|pay_amount|100,收款银行账号|agent_account_no|150,收款银行账户名称|agent_account_name|150,收款银行名称|agent_bank_name|150,"
		+ "付款银行账号|clear_account_no|150,付款银行账户名称|clear_account_name|150,付款银行名称|clear_bank_name|150,资金性质编码|fund_type_code,资金性质名称|fund_type_name,"
		+ "支付方式编码|pay_type_code,支付方式名称|pay_type_name,代理银行编码|pay_bank_code,代理银行名称|pay_bank_name,清算日期|clear_date,回单日期|confirm_date,"
		+ "预算类型编码|bgt_type_code,预算类型名称|bgt_type_name,凭证日期|vou_date,创建日期|create_date";

Ext.onReady(function() {
	// 初始化Ext.QuickTips，启用悬浮提示
		Ext.QuickTips.init();
		//引用工具类
		Ext.Loader.setPath('Ext', 'js/util');
		Ext.require(['Ext.PageUtil']);	
		// 启用自动加载
		Ext.Loader.setConfig( {
			enabled : true
		});
		clearGridPanel = getGrid("/realware/loadClearPayVoucher4ClearBank.do", header,
				fileds, true, true);
		clearGridPanel.title = "划款凭证信息";
		clearGridPanel.setHeight(document.documentElement.scrollHeight - 95);
		// 根据查询条件检索数据
		clearGridPanel.getStore().on('beforeload', function(thiz, options) {
			var admdiv = Ext.getCmp('admdiv').getValue();
			if (admdiv == null || admdiv == "")
				return false;
			beforeload(Ext.getCmp("regidsterQuery"), options, Ext.encode(fileds));
		});

		var buttonItems =  [
							{
								id : 'register',
								handler : function() {
									registerClearVoucher();
								}
							},{
								id : 'pay',
								handler : function() {
									checkTransferPayClearVoucher();
								}
							},
							{
								id : 'backRegister',
								handler : function() {
									backVoucher(returnClearVoucherUrl,
											clearGridPanel.getSelectionModel()
													.getSelection(),
											"pay_clear_voucher_id", "退回代理银行");
								}
							},
							{	
								id: 'lookOcx',
								handler : function() {
									lookOCX(clearGridPanel.getSelectionModel()
											.getSelection(),
											"pay_clear_voucher_id");
								}
							}/*,
							{
								id:'print',
								handler : function() {
									var recordsr = Ext.PageUtil.validSelect(clearGridPanel,1);
									recordsr[0].data['admdiv_code'] = Ext.getCmp('admdiv').getValue();
									var isFlow =(Ext.getCmp('taskState').getValue()=="001")?true :false;
									printVoucherAUTO(clearGridPanel.getSelectionModel().getSelection(),"pay_clear_voucher_id",isFlow,vtCode,serverPrint);
								}
							}*/,{
								id:'refresh',
								handler : function() {
									refreshData();
								}
							} ];
		
		var queryItems =  [ {
					title : "查询区",
					items : [{
						id : 'regidsterQuery',
						xtype : 'toolbar',
						bodyPadding : 6,
						layout : 'column',
						defaults : {
							margins : '10 10 10 0'
						},
						items : [ {
							id : 'taskState',
							fieldLabel : '当前状态',
							xtype : 'combo',
							displayField : 'status_name',
							dataIndex : 'task_status',
							emptyText : '请选择',
							valueField : 'status_code',
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
							editable : false,
							labelWidth : 60,
							store : comboAdmdiv
						}, {
							id : 'code',
							fieldLabel : '凭证号',
							xtype : 'textfield',
							symbol : '=',
							labelWidth : 45,
							width : 140,
							dataIndex : 'pay_clear_voucher_code '
						}, {
							id : 'createDate',
							fieldLabel : '生成日期',
							xtype : 'datefield',
							dataIndex : 'vou_date',
							format : 'Ymd',
							labelWidth : 53
						} ]
					}]
				}, clearGridPanel ];
			Ext.StatusUtil.createViewport(buttonItems, queryItems, function() {
			Ext.StatusUtil.initPage(Ext.getCmp("admdiv"), Ext.getCmp("taskState"));
			// 默认设置为未生成
			/**
			 * 本js支持带转账和不带转账，所以第一个状态不一样，从配置中取第一个状态
			 * edit by liutianlong 2016年9月26日
			 */
			var combo = Ext.getCmp('taskState');
			combo.setValue(combo.store.getAt(0).raw.status_code);
		});
});

/***************************************************************************
 * 状态下拉列表框选中事件
 */
function selectState() {
	var taskState = Ext.getCmp('taskState').getValue();
	if ("001" == taskState) {
		Ext.getCmp('register').enable();
		Ext.getCmp('backRegister').enable();
		Ext.getCmp('pay').disable();
	} else if ("005" == taskState) {
		Ext.getCmp('register').disable();
		Ext.getCmp('backRegister').disable();
		Ext.getCmp('pay').disable();
	}  else if ("002" == taskState) {
		Ext.getCmp('register').disable();
		Ext.getCmp('backRegister').disable();
		Ext.getCmp('pay').enable();
	}else if("004" == taskState){
		Ext.getCmp('register').disable();
		Ext.getCmp('backRegister').disable();
		Ext.getCmp('pay').disable();
	}else{
		Ext.getCmp('register').disable();
		Ext.getCmp('backRegister').disable();
		Ext.getCmp('pay').disable();
	}
}

/***************************************************************************
 * 所属财政
 */
function selectAdmdiv() {
	refreshData();
}

/***************************************************************************
 * 刷新
 */
function refreshData() {
 	clearGridPanel.getStore().loadPage(1);
}

/***************************************************************************
 * 签章发送
 */
function registerClearVoucher() {
	var records = clearGridPanel.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请选择要发送的划款单数据！");
		return;
	}

	var reqIds = []; // 划款凭证主键字符串
	var reqVers = []; //划款凭证lastVer字符串 
	Ext.Array.each(records, function(model) {
		reqIds.push(model.get("pay_clear_voucher_id"));
		reqVers.push(model.get("last_ver"));
	});
	var bill_type_id = records[0].get("bill_type_id");
	var myMask = new Ext.LoadMask(Ext.getBody(), {
		msg : '后台正在处理中，请稍后....',
		removeMask : true
	});
	myMask.show();
	Ext.Ajax.request( {
		url : registerClearVoucherUrl,
		method : 'POST',
		timeout : 180000, // 设置为3分钟
		params : {
			billTypeId : bill_type_id,
			billIds : Ext.encode(reqIds),
			last_vers : Ext.encode(reqVers),
			menu_id :  Ext.PageUtil.getMenuId()
		},
		//提交成功的回调函数
		success : function(response, options) {
			myMask.hide();
			var msg = response.responseText;
			//session失效
		if (msg.indexOf("parent.window.location.href = 'login.do';") != -1) {
			Ext.Msg.alert('系统提示', 'session失效 请重新登陆！');
			parent.window.location.href = 'login.do';
		} else {
			Ext.Msg.show( {
				title : '成功提示',
				msg : "发送成功",
				buttons : Ext.Msg.OK,
				icon : Ext.MessageBox.INFO
			});
		}
		refreshData();
	},
	failure : function(response, options) {
		myMask.hide();
		if (response.status == -1) {
			Ext.Msg.alert("系统提示", "划款生成超时，可能存在网络异常，检查后请重试...");
		} else {
			Ext.Msg.show( {
				title : '失败提示',
				msg : response.responseText,
				buttons : Ext.Msg.OK,
				icon : Ext.MessageBox.ERROR
			});
		}
		refreshData();
	}
	});
}

/**
 * 退款清算转账
 * 
 */
function checkTransferPayClearVoucher(transSucc) {
	var records = clearGridPanel.getSelectionModel().getSelection();
	if (records.length != 1) {
		Ext.Msg.alert("系统提示", "请选中一条凭证信息");
		return;
	}
	// 凭证主键字符串
	var reqIds = [];
	var reqVers = [];
	Ext.Array.each(records,function(model){
		reqIds.push(model.get("pay_clear_voucher_id"));
		reqVers.push(model.get("last_ver"));
	});
	var myMask = new Ext.LoadMask(Ext.getBody(), {
		msg : '后台正在处理中，请稍后....',
		removeMask : true
			// 完成后移除
		});
	myMask.show();
	Ext.Ajax.request({
				method : 'POST',
				timeout : 180000, // 设置为3分钟
				url : '/realware/checkTransferPayClearVoucher.do',
				params : {
					// 单据类型id
					billTypeId : records[0].get("bill_type_id"),
					billIds : Ext.encode(reqIds),
					last_vers : Ext.encode(reqVers),
					tradeType:0
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

/**
 * 退款清算转账(河南农行)
 * 
 */
//var Custom = function() {
//	return {
//		/**
//		 * audit为按钮id标识
//		 * grid 模块中的列表
//		 * 说明：函数中this对应指向当前按钮 
//		 */
//		pay : function(grid) {
//				var records = clearGridPanel.getSelectionModel().getSelection();
//	if (records.length != 1) {
//		Ext.Msg.alert("系统提示", "请选中一条凭证信息");
//		return;
//	}
//	// 凭证主键字符串
//	var reqIds = [];
//	var reqVers = [];
//	Ext.Array.each(records,function(model){
//		reqIds.push(model.get("pay_clear_voucher_id"));
//		reqVers.push(model.get("last_ver"));
//	});
//	var myMask = new Ext.LoadMask(Ext.getBody(), {
//		msg : '后台正在处理中，请稍后....',
//		removeMask : true
//			// 完成后移除
//		});
//	myMask.show();
//	Ext.Ajax.request({
//				method : 'POST',
//				timeout : 180000, // 设置为3分钟
//				url : '/realware/checkTransferPayClearVoucher.do',
//				params : {
//					// 单据类型id
//					billTypeId : records[0].get("bill_type_id"),
//					billIds : Ext.encode(reqIds),
//					last_vers : Ext.encode(reqVers),
//					tradeType:0
//				},
//				success : function(response, options) {
//					succAjax(response, myMask,true);
//				},
//				failure : function(response, options) {
//					failAjax(response, myMask);
//					refreshData();
//				}
//			});
//				return true;
//			}
//		};
//}();
