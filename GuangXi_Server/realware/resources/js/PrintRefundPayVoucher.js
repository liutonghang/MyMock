/***
 * 退款凭证打印
 * @type 
 */

/***
 * 引入需要使用的js文件
 */
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/recommend.js"></scr' + 'ipt>');
	

/**
 * 数据项
 */
//var fileds = ["pay_voucher_code","vou_date,pay_amount","pay_date","payee_account_no","payee_account_name","payee_account_bank","payee_account_bank_no"
//		,"pay_account_no","pay_account_name","pay_account_bank","pay_bank_code","pay_bank_name","clear_bank_code","clear_bank_name","checkNo","fund_deal_mode_code"
//		,"fund_deal_mode_name","fund_type_code","fund_type_name","pay_type_code","pay_type_name","set_mode_code","set_mode_name","pay_summary_code","pay_summary_name","task_id","pay_voucher_id","bill_type_id"]; 
var fileds = ["pay_voucher_code","vou_date","pay_amount","pay_account_no","pay_account_name","pay_account_bank","advance_account_no","advance_account_name","advance_account_bank"
		,"pay_summary_code","pay_summary_name","pay_voucher_id"]; 

/**
 * 列名
 */
//var header = "收款行行号|payee_account_bank_no,凭证号|pay_voucher_code|140,凭证日期|vou_date|100,支付金额|pay_amount|100,收款人账号|payee_account_no,"
//		+ "收款人名称|payee_account_name|140,收款人银行|payee_account_bank|140,付款人账号|pay_account_no,付款人名称|pay_account_name|140,付款人银行|pay_account_bank|140,"
//		+ "代理银行编码|pay_bank_code,代理银行名称|pay_bank_name,清算银行编码|clear_bank_code,清算银行名称|clear_bank_name,结算号|checkNo,办理方式编码|fund_deal_mode_code,"
//		+ "办理方式名称|fund_deal_mode_name,资金性质编码|fund_type_code,资金性质名称|fund_type_name,支付方式编码|pay_type_code,"
//		+ "支付方式名称|pay_type_name,结算方式编码|set_mode_code,结算方式名称|set_mode_name,用途编码|pay_summary_code,用途名称|pay_summary_name";
var header = "凭证号|pay_voucher_code|140,凭证日期|vou_date|100,金额|pay_amount|100,"
		+ "付款人账号|pay_account_no,付款人名称|pay_account_name|140,付款人银行|pay_account_bank|140,收款人账号|advance_account_no,收款人名称|advance_account_name|140,收款人银行|advance_account_bank|140,"
		+ "用途编码|pay_summary_code,用途名称|pay_summary_name";


		
//列表
var printPanel = null;
var isFlow = false;

/***
 * 界面初始化
 */
Ext.onReady(function() {
  	Ext.QuickTips.init(); 
  	printPanel = getGrid(loadUrl, header, fileds, true, true);
	printPanel.setHeight(document.documentElement.scrollHeight - 100);
	// 根据查询条件检索数据
	printPanel.getStore().on('beforeload', function(thiz, options) {
				var date=Todate(new Date());
				var jsoMap;
				//jsonMap = "[{\"specialsql\":[\"\",\"((batchreq_date ='"+date+"' and business_type = 2) or pay_date > to_date( '"+date+"' ,'yyyymmdd') and vt_code='2203')\"],";
				//var jsonMap1 = "[{\"specialsql\":[\"\",\"((batchreq_date ='"+date+"' and business_type = 2) or pay_date > to_date( '"+date+"' ,'yyyymmdd') and vt_code='2203')\"],";
				var payDate = Ext.getCmp('payDate').getValue();
				if ("" != payDate && null != payDate) {

//				jsonStr[0] = ">=";
//				jsonStr[1] = Todate(payDate);
//				jsonMap = jsonMap + "\"to_char(create_date,'yyyyMMdd')\":"
//				+ Ext.encode(jsonStr) + ",";
				var pay_date=Todate(payDate);	
				jsonMap = "[{\"specialsql\":[\"\",\" and ((batchreq_date ='"+date+"' and business_type = 2) or to_char(pay_date ,'yyyymmdd') = '"+pay_date+"'and vt_code='2203')\"],";
			}else{
				//jsonMap = "[{\"specialsql\":[\"\",\"((batchreq_date ='"+date+"' and business_type = 2) and vt_code='2203')\"],";
				Ext.Msg.alert("系统提示", "请选择退款日期！");
				return;

			}
				var taskState = Ext.getCmp('taskState').getValue();
				var admdiv = Ext.getCmp('admdiv').getValue();
				if (admdiv == null || admdiv == "")
					return;
				if ('001' == taskState) {
					var jsonStr = [];
					jsonStr[0] = "=";
					jsonStr[1] = 0;
					jsonMap = jsonMap + "\"print_num\":" + Ext.encode(jsonStr)+ ",";
				} else if ('002' == taskState) {
					var jsonStr = [];
					jsonStr[0] = ">";
					jsonStr[1] = 0;
					jsonMap = jsonMap + "\"print_num\":" + Ext.encode(jsonStr)+ ",";
				}
				var jsonStr = [];
				jsonStr[0] = "=";
				jsonStr[1] = admdiv;
				jsonMap = jsonMap + "\"admdiv_code\":" + Ext.encode(jsonStr) + ",";
//				jsonStr[0] = "in";
//				jsonStr[1] = "(\'2203\',\'2204\')";
//				jsonStr[0] = "=";
//				jsonStr[1] = vt_code;
//				jsonMap = jsonMap + "\"vt_code\":" + Ext.encode(jsonStr) + ",";
//				jsonStr[0] = "=";
//				jsonStr[1] = Todate(new Date());
//				jsonMap = jsonMap + "\"batchreq_date\":" + Ext.encode(jsonStr) + ",";
//				jsonStr[0] = ">";
//				//jsonStr[1] = "1";
//				jsonStr[1] = "(\'20130828\',\'yyyymmdd\')";
//				jsonMap = jsonMap + "\"pay_date\":" + Ext.encode(jsonStr) + ",";
				
				var data = jsonMap.substring(0, jsonMap.length - 1) + "}]";
				if (null == options.params || options.params == undefined) {
					options.params = [];
					options.params["jsonMap"] = data;
					options.params["filedNames"] = JSON.stringify(fileds);
				} else {
					options.params["jsonMap"] = data;
					options.params["filedNames"] = JSON.stringify(fileds);
				}
			});
	
	Ext.create('Ext.Viewport', {
				id : 'printCollectVoucherFrame',
				layout : 'fit',
				items : [Ext.create('Ext.panel.Panel', {
							tbar : [{
								id : 'buttongroup',
								xtype : 'buttongroup',
								items : [{
											id:'collectPrint',
											text : '打印',
											iconCls : 'print',
											scale : 'small',
											handler : function() {
												// 当前选中的数据
												var recordsr = printPanel.getSelectionModel().getSelection();
												if (recordsr.length ==0) {
													Ext.Msg.alert("系统提示", "请选择一条数据！");
													return;
												}
												var bill_no="";
												
												for(var i=0;i<recordsr.length;i++){
													bill_no=bill_no+recordsr[i].get("pay_voucher_id")+",";
												}
												var billTypeId = records[0].get("bill_type_id");
												printVoucherDialog(bill_no, isFlow, billTypeId,"pay_voucher_id");
											}
										}, {
											id : 'refresh',
											text : '刷新',
											iconCls : 'refresh',
											scale : 'small',
											handler : function() {
												refreshData();
											}
										}]
							}],
							items : [{
										title : '查询区',
										bodyPadding : 8,
										layout : 'hbox',
										defaults : {
											margins : '3 10 0 0'
										},
										items : [{
													id : 'taskState',
													fieldLabel : '当前状态',
													xtype : 'combo',
													dataIndex : 'task_state',
													editable : false,
													displayField : 'name',
													emptyText : '请选择',
													valueField : 'value',
													labelWidth : 60,
													store : comboStore,
													listeners : {
														'select' : selectState
													}
												}, 	{
													id : 'admdiv',
													fieldLabel : '所属财政',
													xtype : 'combo',
													dataIndex : 'admdiv_code',
													displayField : 'admdiv_name',
													emptyText : '请选择',
													valueField : 'admdiv_code',
													editable : false,
													labelWidth : 60,
													store : comboAdmdiv,
													listeners : {
														'select' : selectAdmdiv
												}		
											   }, {
													id : 'payDate',
													fieldLabel : '退款日期',
													xtype : 'datefield',
													dataIndex : 'pay_date',
													format : 'Y-m-d',
													labelWidth : 53,
													listeners : {
														'select' : selectPayDate
												}	
										}],
										flex : 2
									}, printPanel]
						})]
			});
			//默认设置为未打印
			Ext.getCmp('taskState').setValue("001");
			if (comboAdmdiv.data.length > 0) {
				Ext.getCmp('admdiv').setValue(comboAdmdiv.data.getAt(0).get("admdiv_code"));
			}
			setBtnVisible(Ext.getCmp("admdiv").getValue(), Ext.getCmp("buttongroup"));
			var day=new Date();
			Ext.getCmp('payDate').setValue(day);
			selectState();
});
		
		

/**
 * 状态下拉表框
 * 
 */
var comboStore = Ext.create('Ext.data.Store', {
			fields : ['name', 'value'],
			data : [{
						"name" : "未打印",
						"value" : "001"
					}, {
						"name" : "已打印",
						"value" : "002"
					}]
		});
	
	
/*******************************************************************************
 * 切换状态
 * 
 * @return
 */
function selectState() {
	var taskState = Ext.getCmp('taskState').getValue();
	if ("001" == taskState) {
		isFlow = true;
	} else if ("002" == taskState) {
		isFlow = false;
	}
	refreshData();
}

function selectAdmdiv() {
	setBtnVisible(Ext.getCmp("admdiv").getValue(),null);
	refreshData();
}

function selectPayDate() {
	refreshData();
}
/*******************************************************************************
 * 查詢
 * 
 * @return
 */
function refreshData() {
	printPanel.getStore().loadPage(1);
}

