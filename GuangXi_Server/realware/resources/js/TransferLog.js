/*******************************************************************************
 * 主要用于转账日志查询
 * 
 * @type
 */
 

/***
 * 引入需要使用的js文件
 */
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/recommend.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/createReport.js"></scr' + 'ipt>');

/**
 * 列表
 */

/**
 * 数据项
 */
var fileds = ["trans_log_id", "voucher_no", "user_code",
"trans_amount", "trans_res_msg", "create_date","accthost_seqId","pay_account_no","trans_succ_flag"]; // 数据项

/**
 * 列名
 */
var header = "凭证号|voucher_no|80,付款人账号|pay_account_no|130,交易金额|trans_amount|100,交易结果|trans_succ_flag|80, 交易日期|create_date|80,柜员号|user_code|80, " +
		"核心日志号|accthost_seqId|100, 交易返回消息|trans_res_msg,交易流水号|trans_log_id|140";

		
var trans_result_store = Ext.create('Ext.data.Store', {
				fields : ['name', 'value'],
				data : [{
							"name" : "全部",
							"value" : ""
						
						},{
							"name" : "交易成功",
							"value" : "1"
						}, {
							"name" : "交易失败",
							"value" : "2"
						}]
			});

/**
 * 界面加载
 */

Ext.onReady(function() {
	Ext.QuickTips.init();
	gridPanel1 = getGrid(loadUrl, header, fileds, true, true);
	gridPanel1.setHeight(document.documentElement.scrollHeight - 115);
	// 根据查询条件检索数据
	gridPanel1.getStore().on('beforeload', function(thiz, options) {
		if (admdiv == null || admdiv == "")
			return;

		beforeload(Ext.getCmp("transLogQuery"), options, Ext.encode(fileds));

	});
	Ext.create('Ext.Viewport', {
				id : 'QueryVoucherFrame',
				layout : 'fit',
				items : [Ext.create('Ext.panel.Panel', {
							tbar : [{
								id : 'buttongroup',
								xtype : 'buttongroup',
								items : [ {
							text : '清单打印',
							iconCls : 'print',
							scale : 'small',
							id : 'print',
							handler : function() {
								// 当前选中的数据
								var create_date = Ext.getCmp("createdate").getValue();
								if ("" == create_date || null == create_date) {
									Ext.Msg.alert("系统提示", "请选择交易日期！");
									return;
								}
								var data="[{\"create_date\":[\""+Todate(create_date)+"\"]}]";
												
								GridPrintDialog('undefined','undefined',loadGrfURL
														,loadDataURL,"PayFlowQueryForABC",data,100);	
							}
						},{
											id : 'refresh',
											text : '查询',
											iconCls : 'refresh',
											scale : 'small',
											handler : function() {
												refreshData();
											}
										}]
							}],
							items : [{
								title : "查询区",
								items : gridPanel1,
								tbar : {
									id : 'transLogQuery',
									xtype : 'toolbar',
									bodyPadding : 6,
									height : 55,
									layout : 'column',
									defaults : {
										margins : '10 20 10 10'
									},
									items : [{
												id : 'admdiv',
												fieldLabel : '所属财政',
												xtype : 'combo',
												dataIndex : 'admdiv_code',
												displayField : 'admdiv_name',
												emptyText : '请选择',
												valueField : 'admdiv_code',
												labelWidth : 60,
												width : 230,
												editable : false,
												store : comboAdmdiv,
												value : comboAdmdiv.data.length > 0
														? comboAdmdiv.data.getAt(0).get("admdiv_code")
														: "",
												listeners : {
													'select' : selectAdmdiv
												}
											},{
												
												id : 'trans_result',
												fieldLabel : '交易结果',
												xtype : 'combo',
												dataIndex : 'trans_succ_flag',
												displayField : 'name',
												emptyText : '请选择',
												valueField : 'value',
												labelWidth : 60,
												width : 230,
												editable : false,
												store : trans_result_store,
												data_type : 'number',
												listeners : {
													'select' : selectTransResult
												}
											
											},{
												id : 'accthostSeqId',
												fieldLabel : '核心日志号',
												xtype : 'textfield',
												dataIndex : 'accthost_seqId',
												symbol : '=',
												labelWidth : 60,
												width : 180
											},{
												id : 'transLogId',
												fieldLabel : '交易流水号',
												xtype : 'textfield',
												dataIndex : 'trans_log_id',
												symbol : '=',
												labelWidth : 60,
												width : 180
											}, {
												id : 'createdate',
												fieldLabel : '交易日期',
												xtype : 'datefield',
												dataIndex : 'create_date',
												labelWidth : 60,
												width : 160,
												symbol : '=',
												format : 'Y-m-d',
												value : Ext.Date.format(new Date(), 'Y-m-d')
											}, {
												id : 'code',
												fieldLabel : '&nbsp;&nbsp;&nbsp;凭证号',
												xtype : 'textfield',
												dataIndex : 'voucher_no',
												symbol : '>=',
												labelWidth : 60,
												width : 230
											}, {
												id : 'codeEnd',
												fieldLabel : '&nbsp;&nbsp;&nbsp&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp至',
												xtype : 'textfield',
												labelWidth : 60,
												width : 230,
												symbol : '<=',
												dataIndex : 'voucher_no'
											}]
								}
							}]
						})]
			});
//	setBtnVisible(Ext.getCmp("admdiv").getValue(), Ext.getCmp("buttongroup"));
	refreshData();
});



function selectAdmdiv() {
//	setBtnVisible(Ext.getCmp("admdiv").getValue(),null);
	refreshData();
}
function selectTransResult() {
//	setBtnVisible(Ext.getCmp("admdiv").getValue(),null);
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
