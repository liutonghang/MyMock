/*******************************************************************************
 * 引入需要使用的js文件
 */
document
		.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/recommend.js"></scr' + 'ipt>');
document
		.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/ocxVoucher.js"></scr' + 'ipt>');

document
		.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/backVoucher.js"></scr' + 'ipt>');
/*******************************************************************************
 * 主要用于划款清算退款登记凭证
 * 
 * @type
 */

// 划款信息
var fileds = [ "pay_clear_voucher_code", "pay_amount", "agent_account_no",
		"agent_account_name", "agent_bank_name", "clear_account_no",
		"clear_account_name", "clear_bank_name", "fund_type_code",
		"fund_type_name", "pay_type_code", "pay_type_name", "pay_bank_no",
		"pay_bank_name", "clear_date", "confirm_date", "bgt_type_code",
		"bgt_type_name", "task_id", "pay_clear_voucher_id", "bill_type_id",
		"last_ver", "return_reason","vou_date","create_date","pay_dictate_no"];

var header = "退回原因|return_reason|130,凭证号|pay_clear_voucher_code|180,金额|pay_amount|100,收款银行账号|agent_account_no|150,收款银行账户名称|agent_account_name|150,收款银行名称|agent_bank_name|150,支付交易序号|pay_dictate_no|100,"
		+ "付款银行账号|clear_account_no|150,付款银行账户名称|clear_account_name|150,付款银行名称|clear_bank_name|150,资金性质编码|fund_type_code,资金性质名称|fund_type_name,"
		+ "支付方式编码|pay_type_code,支付方式名称|pay_type_name,代理银行行号|pay_bank_no,代理银行名称|pay_bank_name,清算日期|clear_date,回单日期|confirm_date,"
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
		clearGridPanel = getGrid(loadUrl, header, fileds, true, true);
		clearGridPanel.setHeight(document.documentElement.scrollHeight - 85);
		clearGridPanel.title = "划款退款凭证信息";
		// 根据查询条件检索数据
		clearGridPanel.getStore().on('beforeload', function(thiz, options) {
			var admdiv = Ext.getCmp('admdiv').getValue();
			if (admdiv == null || admdiv == "")
				return; 
			beforeload(Ext.getCmp("regidsterRefundQuery"), options, Ext.encode(fileds));
		});
		var buttonItems =  [
							{
								id : 'register',
								handler : function() {
									registerClearVoucher();
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
								id:'lookOcx',
								handler : function() {
									lookOCX(clearGridPanel.getSelectionModel()
											.getSelection(),
											"pay_clear_voucher_id");
								}
							}, {
								id:'refresh',
								handler : function() {
									refreshData();
								}
							} ];
			var queryItems =   [{
				id : 'regidsterRefundQuery',
				title : '查询区',
				bodyPadding : 5,
				layout : 'hbox',
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
					labelWidth : 60,
					width : 160,
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
					symbol : '=',
					dataIndex : 'pay_clear_voucher_code ',
					labelWidth : 42
				}, {
					id : 'createDate',
					fieldLabel : '生成日期',
					xtype : 'datefield',
					dataIndex : 'create_date',
					format : 'Y-m-d',
					data_type:'date',
					symbol : '=',
					labelWidth : 53,
					data_format:'yyyy-MM-dd',
					maxValue : new Date()
				} ]
				}, clearGridPanel ];
			Ext.StatusUtil.createViewport(buttonItems, queryItems, function() {
				Ext.StatusUtil.initPage(Ext.getCmp("admdiv"), Ext.getCmp("taskState"));
				// 默认设置为未生成
				Ext.getCmp('taskState').setValue("000");
			});
	});

/***************************************************************************
 * 状态下拉列表框选中事件
 */
function selectState() {
	var taskState = Ext.getCmp('taskState').getValue();
	if ("000" == taskState) {
		Ext.getCmp('register').enable(false);
		Ext.getCmp('backRegister').enable(false);
		Ext.getCmp("return_reason").setVisible(false);
	} else if ("001" == taskState) {
		Ext.getCmp('register').disable(false);
		Ext.getCmp('backRegister').disable(false);
		Ext.getCmp("return_reason").setVisible(false);
	} else {
		Ext.getCmp('register').disable(false);
		Ext.getCmp('backRegister').disable(false);
		Ext.getCmp("return_reason").setVisible(true);
	}
}

/***************************************************************************
 * 刷新
 */
function refreshData() {
	clearGridPanel.getStore().loadPage(1);
}

/***************************************************************************
 * 退款单登记
 */
function registerClearVoucher() {
	var records = clearGridPanel.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请选择要登记的划款单数据！");
		return;
	}
	var bill_type_id = records[0].get("bill_type_id");
	var reqIds = []; // 划款凭证主键字符串
	var reqVers = []; //划款凭证lastVer字符串 
	Ext.Array.each(records, function(model) {
		reqIds.push(model.get("pay_clear_voucher_id"));
		reqVers.push(model.get("last_ver"));
	});
	var myMask = new Ext.LoadMask(Ext.getBody(), {
		msg : '后台正在处理中，请稍后....',
		removeMask : true
	// 完成后移除
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
			succAjax(response, myMask);
			refreshData();
		},
		// 提交失败的回调函数
		failure : function(response, options) {
			failAjax(response, myMask);
			refreshData();
		}
	});
}
