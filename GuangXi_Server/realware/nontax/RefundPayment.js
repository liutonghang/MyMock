/*******************************************************************************
 * 引入需要使用的js文件
 */
document.write('<scr'+ 'ipt type="text/javascript" src="/realware/resources/js/recommend.js"></scr'+ 'ipt>');
document.write('<scr'+ 'ipt type="text/javascript" src="/realware/resources/js/share/operationLog.js"></scr'+ 'ipt>');
document.write('<scr'+ 'ipt type="text/javascript" src="/realware/resources/js/share/ocxVoucher.js"></scr'+ 'ipt>');
document.write('<scr'+ 'ipt type="text/javascript" src="/realware/js/view/common/TextareaWindow.js"></scr'+ 'ipt>');


var gridPanel1 = null;

/**
 * 列名
 */
var fileds = ["payable_voucher_id","vou_date", "payable_voucher_code", "pay_account_type",
		"pay_account_no", "pay_account_name","pay_account_bank","vou_date",
		"pay_bank_code", "bank_trans_no", "cfm_date", "tra_no", "arr_date",
		"pay_code", "payee_account_name", "payee_account_no","payee_account_bank","pay_bank_no",
		"pay_amt", "business_type","pay_status","bill_type_id","last_ver"];
var header = "原缴款码|pay_code|200,"
		+ "原缴款人账号|payee_account_no|140,原缴款人名称|payee_account_name|140,原缴款人银行|payee_account_bank|140,"
		+"原缴款金额|pay_amt|100,"
		+ "退付批次号|payable_voucher_code|200,退付日期|vou_date,原收款账号|pay_account_no|140,原收款账户名称|pay_account_name|140,原收款账户开户行|pay_account_bank|140,"
		+ "资金到账日期|arr_date|100";


Ext.onReady(function() {
			Ext.QuickTips.init();
			gridPanel1 = getGrid(loadUrl, header, fileds, true, true);
			gridPanel1.setHeight(document.documentElement.scrollHeight - 115);
			// 根据查询条件检索数据
			gridPanel1.getStore().on('beforeload', function(thiz, options) {
				beforeload(Ext.getCmp("PayableVoucherQuery"), options, Ext.encode(fileds));
				options.params["billTypeId"] = 22;
			});
			
			var buttonItems = [{
						id : 'refundPay',
						handler : function() {
				            refundPay('/realware/nontaxRefundPay.do',true);
						}
					},{
						id : 'rgPay',
						handler : function() {
							rgPay();
						}
					}, {
						id : 'refundConfirm',
						handler : function() {
						    refundPay('/realware/nontaxRefundConfirm.do',true);
						}
					}, {

						id : 'refresh',
						handler : function() {
							refreshData();
						}
					}, {

						id : 'looklog',
						handler : function() {
						var records = gridPanel1.getSelectionModel().getSelection();
						taskLog(records,"payable_voucher_code");
						}
					}];
			var queryItems = [{
						title : '查询条件',
						id : 'PayableVoucherQuery',
						bodyPadding : 5,
						layout : {
							type : 'table',
							columns : 4
						},
						items : [{
									id : 'taskState',
									fieldLabel : '当前状态',
									xtype : 'combo',
									dataIndex : 'task_status',
									displayField : 'status_name',
									emptyText : '请选择',
									valueField : 'status_code',
									symbol : '=',
									editable : false,
									style : 'margin-left:5px;margin-right:5px;',
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
									store : comboAdmdiv,
									style : 'margin-left:5px;margin-right:5px;'
							   }, {
									id : 'batchNo',
									fieldLabel : '批次号',
									xtype : 'textfield',
									dataIndex : 'payable_voucher_code',
									symbol : '=',
									style : 'margin-left:5px;margin-right:5px;'
								}, {
									id : 'cfmDate',
									fieldLabel : '原缴款日期',
									xtype : 'datefield',
									dataIndex : 'cfm_date ',
									format : 'Ymd',
									symbol : '=',
									maxValue : new Date(),
									style : 'margin-left:5px;margin-right:5px;',
									data_type : 'string'
								}, {
									id : "refundAcct",
									fieldLabel : '退付账号',
									xtype : 'textfield',
									dataIndex : 'pay_account_no',
									symbol : 'like',
									style : 'margin-left:5px;margin-right:5px;'
								},{
									id : "refundAcctName",
									fieldLabel : '退付名称',
									xtype : 'textfield',
									symbol : 'like',
									dataIndex : 'pay_account_name',
									style : 'margin-left:5px;margin-right:5px;'									
								}]
						 	},gridPanel1];
			Ext.StatusUtil.createViewport(buttonItems, queryItems, function() {
						Ext.StatusUtil.initPage(Ext.getCmp("admdiv"), Ext
										.getCmp("taskState"));
						// 默认设置为未生成
						Ext.getCmp('taskState').setValue("000");
						Ext.getCmp('refundConfirm').disable();
					});
		});

function selectState(){
	var taskState = Ext.getCmp('taskState').getValue();
	if(taskState == "000"){
		Ext.getCmp('refundPay').enable();
		Ext.getCmp('rgPay').enable();
		Ext.getCmp('refundConfirm').disable();
	}else if(taskState == "001"){
		Ext.getCmp('refundPay').enable();
		Ext.getCmp('rgPay').enable();
		Ext.getCmp('refundConfirm').enable();
	}else if(taskState == "002"){
		Ext.getCmp('refundConfirm').enable();
		Ext.getCmp('refundPay').disable();
		Ext.getCmp('rgPay').disable();
	}else{
		Ext.getCmp('refundConfirm').disable();
		Ext.getCmp('refundPay').disable();
		Ext.getCmp('rgPay').disable();
	}
}

//转账//确认
function refundPay(doUrl,pay,agent_business_no){
	var me = this;
	var records = gridPanel1.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert('系统提示', '请至少选择一条数据！');
		return;
	}
	var ids = [];
	var vers = [];
	Ext.Array.each(records,function(model){
		ids.push(model.get("payable_voucher_id"));
		vers.push(model.get("last_ver"));
	});
	var billTypeId = records[0].get("bill_type_id");
	var params = {
			billTypeId : billTypeId,
			billIds : Ext.encode(ids),
			last_vers : Ext.encode(vers),
			pay : pay,
			agent_business_no : agent_business_no,
			menu_id : Ext.PageUtil.getMenuId()
	};
	Ext.PageUtil.doRequestAjax(me, doUrl, params);	
}

function refreshData(){
	gridPanel1.getStore().loadPage(1);
}

//人工转账
function rgPay(){
	var me = this;
	var records = gridPanel1.getSelectionModel().getSelection();
	if(records.length != 1){
		Ext.Msg.alert("提示消息","请选择一条数据！");
		return ;
	}
	var transnowindow = Ext.create('pb.view.common.TextareaWindow',{
		title : '补录人工确认支付信息【银行交易流水号】'
	});
	transnowindow.on('confirmclick',function(o, textarea) {
		me.refundPay('/realware/nontaxRefundPay.do',false,textarea);
	});
	transnowindow.show();
}