/*******************************************************************************
 * 主要用于直接支付和授权支付退款录入
 * 
 * @type
 */

/***
 * 引入需要使用的js文件
 */
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/recommend.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/operationLog.js"></scr' + 'ipt>');
document.write('<scr'+ 'ipt type="text/javascript" src="/realware/resources/js/share/ocxVoucher.js"></scr'+ 'ipt>');
document.write('<scr'+ 'ipt type="text/javascript" src="/realware/resources/js/VoucherRelation.js"></scr'+ 'ipt>');	

var voucherPanel = null;

/**
 * 数据项
 */

var fileds = ["pay_voucher_code", "vou_date", "pay_amount","refund_type", "payee_account_no",
		"payee_account_name", "payee_account_bank", "payee_account_bank_no",
		"pay_account_no", "pay_account_name", "pay_account_bank",
		"pay_bank_code", "pay_bank_name", "clear_bank_code", "clear_bank_name",
		"checkNo", "fund_deal_mode_code", "fund_deal_mode_name",
		"fund_type_code", "fund_type_name", "pay_type_code", "pay_type_name",
		"set_mode_code", "set_mode_name", "pay_summary_code",
		"pay_summary_name", "task_id", "pay_voucher_id", "bill_type_id","last_ver","remark","ori_voucher_id","ori_pay_amount","ori_pay_voucher_code","ori_voucher_id","refund_type"];

/**
 * 列名
 */
var header = "查看支付凭证|do1|130|lookPayVoucherByRefundVoucher,凭证号|pay_voucher_code|140,凭证日期|vou_date|100,支付金额|pay_amount|100,收款人账号|payee_account_no,"
		+ "收款人名称|payee_account_name|140,收款人银行|payee_account_bank|140,收款行行号|payee_account_bank_no,"
		+ "付款人账号|pay_account_no,付款人名称|pay_account_name|140,付款人银行|pay_account_bank|140,代理银行编码|pay_bank_code,"
		+ "代理银行名称|pay_bank_name,清算银行编码|clear_bank_code,清算银行名称|clear_bank_name,支票号|checkNo,办理方式编码|fund_deal_mode_code,"
		+ "办理方式名称|fund_deal_mode_name,资金性质编码|fund_type_code,资金性质名称|fund_type_name,支付方式编码|pay_type_code,"
		+ "支付方式名称|pay_type_name,结算方式编码|set_mode_code,结算方式名称|set_mode_name,用途编码|pay_summary_code,"
		+ "用途名称|pay_summary_name,备注|remark";
var header2 = "凭证号|pay_voucher_code|140,凭证日期|vou_date|100,支付金额|pay_amount|100,收款人账号|payee_account_no,"
		+ "收款人名称|payee_account_name|140,收款人银行|payee_account_bank|140,收款行行号|payee_account_bank_no,"
		+ "付款人账号|pay_account_no,付款人名称|pay_account_name|140,付款人银行|pay_account_bank|140,代理银行编码|pay_bank_code,"
		+ "代理银行名称|pay_bank_name,清算银行编码|clear_bank_code,清算银行名称|clear_bank_name,支票号|checkNo,办理方式编码|fund_deal_mode_code,"
		+ "办理方式名称|fund_deal_mode_name,资金性质编码|fund_type_code,资金性质名称|fund_type_name,支付方式编码|pay_type_code,"
		+ "支付方式名称|pay_type_name,结算方式编码|set_mode_code,结算方式名称|set_mode_name,用途编码|pay_summary_code,"
		+ "用途名称|pay_summary_name,备注|remark";

/*******************************************************************************
 * 状态
 */
var comboStore = Ext.create('Ext.data.Store', {
			fields : ['name', 'value'],
			data : [{
						"name" : "未送审",
						"value" : "001"
					}, {
						"name" : "已送审",
						"value" : "002"
					}, {
						"name" : "已作废",
						"value" : "007"
					}, {
						"name" : "被退回",
						"value" : "004"
					}]
		});
		
/**
 * 转现标志 1 现金，2 网点操作账户，3 ABIS91
 */		
		var payflagStore = Ext.create('Ext.data.Store', {
			fields : ['name', 'value'],
			data : [{
						"name" : "网点操作账户",
						"value" : "2"
					},{
						"name" : "现金",
						"value" : "1"
					},  {
						"name" : "ABIS91",
						"value" : "3"
					}]
		});
		
		var comboFundType = Ext.create('Ext.data.Store', {
			fields : ['code', 'name'],
			proxy : {					
					type : 'ajax',
					url : '/realware/loadElementValue.do',
					reader : {
						type : 'json'
					}
				},
			autoload : false
			
		});
	
/*******************************************************************************
 * 界面加载
 */
Ext.onReady(function() {
	Ext.QuickTips.init();
	//引用工具类
	Ext.Loader.setPath('Ext', 'js/util');
	Ext.require(['Ext.PageUtil']);
	if (voucherPanel == null) {
		voucherPanel = getGrid(loadUrl, header, fileds, true, true);
		voucherPanel.setHeight(document.documentElement.scrollHeight - 95);
		// 根据查询条件检索数据
		voucherPanel.getStore().on('beforeload', function(thiz, options) {
			var admdiv = Ext.getCmp('admdiv').getValue();
			if (admdiv == null || admdiv == "")
				return;
			beforeload(Ext.getCmp("refundCheckQuery"), options, Ext.encode(fileds));
		});
	}
	Ext.create('Ext.Viewport', {
				id : 'reInputVoucherFrame',
				layout : 'fit',
				items : [Ext.create('Ext.panel.Panel', {
							tbar : [{
								id : 'buttongroup',
								xtype : 'buttongroup',
								items : [{
											id : 'edit',
											text : '录入',
											iconCls : 'edit',
											scale : 'small',
											handler : function() {
												voucherInput();
											}
										}, {
											id : 'audit',
											text : '送审',
											iconCls : 'audit',
											scale : 'small',
											handler : function() {
												voucherAudit();
											}
										}, {
											id : 'unaudit',
											text : '撤销送审',
											iconCls : 'unaudit',
											scale : 'small',
											handler : function() {
												voucherUnAudit();
											}
										}, {
											id : 'invalid',
											text : '作废',
											iconCls : 'delete',
											scale : 'small',
											handler : function() {
												Ext.Msg.confirm("系统提示","是否要作废选中的凭证？",function(e) {
													if (e == "yes") {
														voucherInvalidate();
													}
												});
												//voucherInvalidate();
											}
										}, {
											id : 'look',
											text : '查看原凭证',
											iconCls : 'look',
											scale : 'small',
											handler : function() {
												var records = voucherPanel.getSelectionModel().getSelection();
												if (records.length == 0) {
													Ext.Msg.alert('系统提示', '请至少选择一条数据！');
													return;
												}
												Ext.Ajax.request({
														url : loadUrl,
														method : 'POST',
														timeout : 180000, // 设置为3分钟
														params : {
															filedNames :  Ext.encode(fileds),
															vt_code : records[0].get("vt_code"),
															jsonMap : "[{\"pay_voucher_id\":[\"=\"," + records[0].get("ori_voucher_id") + "]}]",
															start : 0,
															page : 1,
															limit : 1
														},
														// 提交成功的回调函数
														success : function(response, options) {
															//后台返回的是arraylist存的对象
															var dto = Ext.decode(response.responseText).root[0];
															var list =[];
															//定义map
															var map = getMap();
															map.put("pay_voucher_id",dto.pay_voucher_id);
															map.put("pay_voucher_code",dto.pay_voucher_code);
															map.put("pay_amount",dto.pay_amount);
															map.put("bill_type_id",dto.bill_type_id);
															map.put("last_ver",dto.last_ver);
															list.push(map);
															//调OCX显示凭证
															lookOCX(list,"pay_voucher_id");
														},
														failure : function(response, options) {
															Ext.Msg.alert('系统提示', '查看原凭证失败！');
														}
												});
											}
										},{
											id : 'log',
											text : '查看操作日志',
											iconCls : 'log',
											scale : 'small',
											handler : function() {
												taskLog(voucherPanel.getSelectionModel().getSelection(),"pay_voucher_id");
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
								title : "查询区",
								items : voucherPanel,
								tbar : {
									id : 'refundCheckQuery',
									xtype : 'toolbar',
									bodyPadding : 8,
									layout : 'hbox',
									defaults : {
										margins : '3 5 0 0'
									},
									items : [{
													id : 'taskState',
													fieldLabel : '当前状态',
													xtype : 'combo',
													dataIndex : 'task_state',
													displayField : 'name',
													emptyText : '请选择',
													valueField : 'value',
													labelWidth : 60,
													width : 160,
													store : comboStore,
													value:'001',
													editable : false,
													listeners : {
														'select' : selectState
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
													width : 160,
													store : comboAdmdiv,
													value : comboAdmdiv.data.length > 0
														? comboAdmdiv.data.getAt(0).get("admdiv_code")
														: "",
													editable : false,
												listeners : {
														'select' : selectAdmdiv
													}
											
												}, {
													id : 'code',
													fieldLabel : '凭证号',
													xtype : 'textfield',
													symbol : '>=',
													labelWidth : 45,
													width : 140,
													dataIndex : 'pay_voucher_code'
												}, {
													id : 'codeEnd',
													fieldLabel : '至',
													xtype : 'textfield',
													labelWidth : 15,
													width : 120,
													symbol : '<=',
													dataIndex : 'pay_voucher_code'
												}, {
													id : 'vouDate',
													fieldLabel : '凭证日期',
													xtype : 'datefield',
													dataIndex : 'vou_date',
													format : 'Y-m-d',
													labelWidth : 60,
													width : 160
												}, {
													id : 'checkNo1',
													fieldLabel : '支票号',
													xtype : 'textfield',
													dataIndex : 'checkNo',
													labelWidth : 40,
													width:140
											}]
								}
							}]
						})]
			});
	if (account_type_right == "11") {
		Ext.getCmp("checkNo1").setVisible(false);
	}
	setBtnVisible(Ext.getCmp("admdiv").getValue(), Ext.getCmp("buttongroup"));
	selectState();
});

/*******************************************************************************
 * 切换状态
 * 
 * @return
 */
function selectState() {
	var taskState = Ext.getCmp('taskState').getValue();
	if ("001" == taskState) {
		Ext.getCmp('edit').enable(false);
		Ext.getCmp('audit').enable(false);
		Ext.getCmp('invalid').enable(false);
		Ext.getCmp('unaudit').disable(false);
		//Ext.getCmp("return_reason").setVisible(false);
	} else if ("002" == taskState) {
		Ext.getCmp('edit').disable(false);
		Ext.getCmp('audit').disable(false);
		Ext.getCmp('invalid').disable(false);
		Ext.getCmp('unaudit').enable(false);
		//Ext.getCmp("return_reason").setVisible(false);
	} else if ("007" == taskState) {
		Ext.getCmp('edit').disable(false);
		Ext.getCmp('audit').disable(false);
		Ext.getCmp('invalid').disable(false);
		Ext.getCmp('unaudit').disable(false);
		//Ext.getCmp("return_reason").setVisible(false);
	} else {
		Ext.getCmp('edit').disable(false);
		Ext.getCmp('audit').enable(false);
		Ext.getCmp('invalid').enable(false);
		Ext.getCmp('unaudit').disable(false);
		//Ext.getCmp("return_reason").setVisible(true);
	}
	refreshData();
}




function selectAdmdiv() {
	setBtnVisible(Ext.getCmp("admdiv").getValue(), null);
	if ("" == admdiv || null == admdiv) return;	
	
	refreshData();
}


/*******************************************************************************
 * 退款录入
 */

var filedsOriRequest = ["pay_request_code", "pay_amount", "pay_refund_amount","bgt_type_code",
		"bgt_type_name", "fund_type_code", "fund_type_name", "mof_dep_code",
		"mof_dep_name", "pay_kind_code", "pay_kind_name", "sup_dep_code",
		"sup_dep_name", "agency_code", "agency_name", "exp_func_code",
		"exp_func_name", "exp_func_code1", "exp_func_name1", "exp_func_code2",
		"exp_func_name2", "exp_func_code3", "exp_func_name3", "exp_eco_code",
		"exp_eco_name", "exp_eco_code1", "exp_eco_name1", "exp_eco_code2",
		"exp_eco_name2", "pro_cat_code", "pro_cat_name", "dep_pro_code",
		"dep_pro_name", "remark", "pay_request_id"];

var headerOriRequest = "支付明细编号|pay_request_code,支付金额|pay_amount,已退金额|pay_refund_amount,预算类型编码|bgt_type_code,预算类型名称|bgt_type_name,资金性质编码|fund_type_code,资金性质名称|fund_type_name,业务处室编码|mof_dep_code,业务处室名称|mof_dep_name,支出类型编码|pay_kind_code,支出类型名称|pay_kind_name,一级预算单位编码|sup_dep_code,"
		+ "一级预算单位名称|sup_dep_name,基层预算单位编码|agency_code,基层预算单位名称|agency_name,功能分类编码|exp_func_code,功能分类名称|exp_func_name,功能分类类编码|exp_func_code1,功能分类类名称|exp_func_name1,功能分类款编码|exp_func_code2,功能分类款名称|exp_func_name2,功能分类项编码|exp_func_code3,功能分类项名称|exp_func_name3,"
		+ "经济分类编码|exp_eco_code,经济分类名称|exp_eco_name,经济分类类编码|exp_eco_code1,经济分类类名称|exp_eco_name1,经济分类款编码|exp_eco_code2,经济分类款名称|exp_eco_name2,收支管理编码|pro_cat_code,收支管理名称|pro_cat_name,预算项目编码|dep_pro_code,预算项目名称|dep_pro_name,备注|remark";

var inputWin = null;

var gridOrivoucher = null;

var gridOriRequest = null;

var isOK = false;

/*******************************************************************************
 * 录入
 */
function voucherInput() {
	comboFundType.load({
					params : {
						admdiv_code : Ext.getCmp('admdiv').getValue(),
						ele_code : 'FUND_TYPE'
					}
		});
	if (inputWin == null) {
		var h = document.documentElement.scrollHeight-5;
		// 定义凭证列表
		gridOrivoucher = getGrid("/realware/loadPayVoucher.do", header2,fileds, false, true,"top_");
		// 定义明细列表
		gridOriRequest = getGrid("/realware/loadPayRequest.do",headerOriRequest, filedsOriRequest, false, true,'bottm_');
		
		
		
		gridOrivoucher.setHeight(h * 0.3);
		gridOriRequest.setHeight(h * 0.3);
		gridOrivoucher.setTitle("退款凭证");
		gridOriRequest.setTitle("退款明细");
		//凭证选中，刷新明细
		gridOrivoucher.on("itemclick",function(g, record, item, index, e, eOpts ){
					var vouRecords = g.getSelectionModel().getSelection();
					//选中的凭证
					var selectVou = vouRecords[0];
					//凭证的退款类型 2按单退款  1按明细退款
					var refundType = selectVou.get("refund_type");
					//该凭证没有按明细退过款
					if(refundType!=1){
						//设置退款金额录入框的值为凭证支付金额
						Ext.getCmp("isBill").setValue(true);
						Ext.getCmp('oriAmt').setValue(selectVou.get("pay_amount"));
					}else{  //该凭证按明细退过款
						Ext.getCmp('oriAmt').setValue("");
						Ext.getCmp("isBill").setValue(false);
					}
					Ext.getCmp('refundReason').setValue("");
					//刷新明细
					refleshRequest(gridOriRequest,selectVou.get("pay_voucher_id"));
				});
	
		//明细选中，给退款金额录入框赋值
		gridOriRequest.on("itemclick", function(g, record, item, index, e, eOpts ){
					var reqRecords = g.getSelectionModel().getSelection();
					//选中的明细
					var selectReq = reqRecords[0];
					//设置退款金额录入框的值为支付明细的支付金额-已退金额
					var payAmt = selectReq.get("pay_amount");
					var refAmt = selectReq.get("pay_refund_amount");
					var oriamt=payAmt-refAmt;
					Ext.getCmp('oriAmt').setValue(oriamt.toFixed(2));
				});
	
		
		
		// 弹出窗口
		inputWin = Ext.create('Ext.window.Window', {
			id:'refundCheckWindow',
			title : '支付凭证退款录入',
			x : 100,
			y : 10,
			width : 900,
			height : h,
			layout : 'fit',
			resizable : false, // 不可调整大小
			draggable : false, // 不可拖拽
			closeAction : 'hide',
			modal : true,
			items : [Ext.widget('form', {
				id:'form1',
				autoScroll: true,
				items : [{
							
							title : '查询条件',
							bodyPadding : 5,
							layout : 'column',
							fieldDefaults : {
								labelAlign : 'right',
								anchor : '100%'
							},
							defaults : {
								margins : '5 40 0 0'
							},
							//height : h * 0.17,
							items : [{
										id : 'voucherNo',
										fieldLabel : '&nbsp;&nbsp;&nbsp;&nbsp;凭  证  号',
										labelWidth: 80,
										xtype : 'textfield',
										width : 230
									},{
										id : 'aAmount',
										fieldLabel : '&nbsp;&nbsp;&nbsp;&nbsp;支付金额',
										labelWidth: 80,
										xtype : 'numberfield',
										allowNegative: false,  //不能为负数  
          								decimalPrecision: 2,   //小数精确位数
										width : 230
									},{
										id : 'pay_date',
										fieldLabel : '&nbsp;&nbsp;&nbsp;&nbsp;支付日期',
										xtype : 'datefield',
										format : 'Y-m-d',
										labelWidth : 80,
										width : 230,
										data_type:'date'
									},{
										id : 'payeeAcctNo',
										fieldLabel : '&nbsp;&nbsp;&nbsp;&nbsp;收款人帐号',
										labelWidth: 80,
										xtype : 'textfield',
										width : 230
									},{
										id : 'payAcctNo',
										fieldLabel : '&nbsp;&nbsp;&nbsp;&nbsp;付款人帐号',
										labelWidth: 80,
										xtype : 'textfield',
										width : 230
									},{
										id :'fundTypeCode',
										xtype : 'combo',
										fieldLabel : '&nbsp;&nbsp;&nbsp;&nbsp;资金性质',
										displayField: 'name',
										emptyText: '请选择',
										valueField: 'code',
										editable :false,
										queryMode : 'local',
										width : 230,
										labelWidth: 80,
										store: comboFundType
									},{
										xtype : 'button',
										text : '&nbsp;查询&nbsp;',
										id:'queryVoucherData',
										handler : function() {
											refleshQuery(gridOrivoucher);
											refleshRequest(gridOriRequest, 0);
										}
									}]
						}, gridOrivoucher,gridOriRequest, 
							
						{
							xtype : 'panel',
							layout: 'form',
							items : [
								{ 
								layout: "column", 
								items:[{
											id : 'isBill',
											xtype : 'checkbox',
											fieldLabel : '&nbsp;&nbsp;是否按单退款',
											labelWidth : 90,
											checked : true,
											listeners : {
												'change' : function() {
														if (Ext.getCmp("isBill").checked) {  //选中按单退款
														//判断当前选中的凭证是否已按明细退过款
														var vouRecords = gridOrivoucher.getSelectionModel().getSelection();
														if(vouRecords.length==0){
															//Ext.Msg.alert("系统提示", "请选中要按单退款的凭证！");
															Ext.getCmp("oriAmt").disable(true);
															return ;
														}
														//退款类型
														var refundType = vouRecords[0].get("refund_type");
														//退过弹出提示，按单退设置为非选
														if (refundType == 1 && isOK == false) {
															Ext.Msg.alert("系统提示", "该凭证已按明细退过款，无法按单退款！");
															Ext.getCmp("isBill").setValue(false);
															return false;
														}else{
															Ext.getCmp('oriAmt').setValue(vouRecords[0].get("pay_amount").toFixed(2));
														}
														//将退款金额框设为不可读
														Ext.getCmp("oriAmt").disable(true);
													}else{  //选择按明细退款，将金额框设为可更改
														Ext.getCmp("oriAmt").enable(false);
													}
												}
											}
										},
										{
											id : 'oriAmt',
											xtype: 'numberfield',
											allowNegative: false,  //不能为负数  
          									decimalPrecision: 2,   //小数精确位数
											fieldLabel : '&nbsp;&nbsp;退款金额<=',
											labelWidth: 80,
											width : 170
										}, {
											id : 'refundReason',
											xtype : 'textfield',
											fieldLabel : '&nbsp;&nbsp;退款原因',
											labelWidth: 60,
											allowBlank:false,
											width : 250
										}] 
							},{
							 
								layout: "column", 
								items:[{
											id : 'cmbpayflag',
											xtype : 'combobox',
											fieldLabel : '现转标志',
											labelAlign : "right",
											labelWidth : 60,
											width:170,
											queryMode: 'local',
    										displayField: 'name',
    										valueField: 'value',
											store: payflagStore,
											
											listeners:{
												"select":function(){
													//1现金2网点操作账户3ABIS91
													var value = Ext.getCmp("cmbpayflag").getValue();
													
													//如果是网点过渡户
													if(value == "2"){
														Ext.getCmp('txtwriteoffvouno').enable(false);
														Ext.getCmp('txtwriteoffvouseqno').enable(false);
														Ext.getCmp('txtwriteoffuserCode').enable(false);
														
													}else{
														Ext.getCmp('txtwriteoffvouno').disable(true);
														Ext.getCmp('txtwriteoffvouseqno').disable(true);
														Ext.getCmp('txtwriteoffuserCode').disable(true);
													}				
												}
											}
										},
										{
											id : 'txtwriteoffvouno',
											xtype : 'textfield',
											fieldLabel : '&nbsp;&nbsp;核销传票号',
											labelWidth: 80,
											width : 180
										}, {
											id : 'txtwriteoffvouseqno',
											xtype : 'textfield',
											fieldLabel : '&nbsp;&nbsp;核销顺序号',
											labelWidth: 80,
											width : 180
										},{
											id : 'txtwriteoffuserCode',
											xtype : 'textfield',
											fieldLabel : '&nbsp;&nbsp;核销柜员号',
											labelWidth: 80,
											width : 180
										}] 
							
							}],
							bbar : {
								dock : 'bottom',
								items : []
							}
						}],
				buttons : [{
					text : '确定',
					id:'refundAffirm',
					handler : function() {
						//是否按单退款
						var isBillRef = Ext.getCmp('isBill').value == true ? 1 : 0;
						var records = gridOrivoucher.getSelectionModel().getSelection();
						var recordsReq = null;
						if(isBillRef ==1 &&  records.length == 0){
							Ext.Msg.alert("系统提示", "请选中要按单退款的凭证！");
							return ;
						}else if(isBillRef == 0 ){
							recordsReq = gridOriRequest.getSelectionModel().getSelection();
							if (recordsReq.length == 0) {
								Ext.Msg.alert("系统提示", "请选中要按明细退款的明细数据！");
								return;
							}
						}
						//按明细退款时，肯定也选择了主单，所以此处voucherNo不可能为空
						var voucherNo = records[0].get("pay_voucher_code");
						var payAmount =Ext.getCmp('oriAmt').getValue();
						var message = '当前退款凭证号:' + voucherNo + ',金额:' + payAmount;
						Ext.MessageBox.show({
							title: '是否退款',
				            msg: message,
				            icon:Ext.MessageBox.QUESTION,
				            buttons: Ext.MessageBox.YESNO,
				            buttonText:{ 
				                yes: "确定", 
				                no: "取消" 
				            },
				            fn: function(btn){
				            	if(btn == 'yes'){
				            		//var  from1 =  this.up('form');
									
									//退款原因
									var refReasonStr = Ext.getCmp('refundReason').getValue();
									//退款金额
									var refAmountStr = Ext.getCmp('oriAmt').getValue();
									//转现标志
									var cashTransFlag =  Ext.getCmp('cmbpayflag').getValue();
									//核销传票号
									var writeoffVouNo = Ext.getCmp('txtwriteoffvouno').getValue(); 
									//核销顺序号
									var writeoffvouseqno = Ext.getCmp('txtwriteoffvouseqno').getValue(); 
									
									var txtwriteoffuserCode = Ext.getCmp('txtwriteoffuserCode').getValue(); 
									
									//支付凭证id或支付明细id
									var payId = null;
									if (isBillRef == 1) {  //按单退款
										//支付凭证id
										payId = records[0].get("pay_voucher_id");
			
									} else {  //按明细退款
										//支付明细id
										payId = recordsReq[0].get("pay_request_id");
										if (refAmountStr == "") {
											Ext.Msg.alert("系统提示","请录入金额（格式：0.00）！");
											return;
										} 
//										else {
//											var reg = /^(([1-9]{1}\d*)|([0]{1}))(\.(\d){1,2})?$/;
//											var r = refAmountStr.match(reg);
//											if (r == null) {
//												Ext.Msg.alert("系统提示","请录入正确的金额格式（如：0.00）！");
//												return;
//											}
//										}
									}
									if( refReasonStr == null || refReasonStr == ""){
										Ext.Msg.alert("系统提示", "请录入退款原因！");
										return;
									}
									if(cashTransFlag == 2){
										if(writeoffVouNo == null || writeoffVouNo == ""){
											Ext.Msg.alert("系统提示", "请录入传票号！");
											return;
										}
										if(writeoffvouseqno == null || writeoffvouseqno == ""){
											Ext.Msg.alert("系统提示", "请录入顺序号！");
											return;
										}
									}
									var myMask = new Ext.LoadMask(Ext.getBody(), {
										msg : '后台正在处理中，请稍后....',
										removeMask : true // 完成后移除
									});
									myMask.show();
									//请求后台服务
									Ext.Ajax.request({
										url : '/realware/bankSaveRefundVoucher.do',
										method : 'POST',
										timeout : 180000, 
										params : {
											payId : payId,
											isBillRef : isBillRef,
											refReason : refReasonStr,
											refAmount : refAmountStr,
											payType : payType,
											cashTransFlag:cashTransFlag,
											writeoffVouNo:writeoffVouNo, //传票号
											writeoffvouseqno:writeoffvouseqno,  //顺序号
											txtwriteoffuserCode:txtwriteoffuserCode,
											menu_id :  Ext.PageUtil.getMenuId()
										},
										success : function(response, options) {
											response.responseText="支付退款生成成功";
											succAjax(response, myMask);
											isOK = true;
											Ext.getCmp("form1").getForm().reset();
											Ext.getCmp('refundCheckWindow').hide();	
											refreshData();
											isOK = false;
										},
										failure : function(response, options) {
											failAjax(response, myMask);
											refreshData();
										}
									});
				            	}
				            }
				        });
						
					}
				}, {
					text : '取消',
					id:'refundCancel',
					handler : function() {
						isOK = true;
						Ext.getCmp("form1").getForm().reset();
						isOK = false;
						Ext.getCmp('refundCheckWindow').hide();	
						refreshData();
					}
				}]
			})]
		});
		
	}
	else{
		gridOrivoucher.getStore().load({
				params : {
					start : 0,
					pageSize : 0
				}
			});
		gridOriRequest.getStore().load({
				params : {
					start : 0,
					pageSize : 0
				}
			});
	}
	
	Ext.getCmp("cmbpayflag").setValue(payflagStore.getAt(0).get('value'));
	Ext.getCmp('txtwriteoffvouno').enable(false);
	Ext.getCmp('txtwriteoffvouseqno').enable(false);
	Ext.getCmp('txtwriteoffuserCode').enable(false);
	
	//将退款金额框设为不可读
	inputWin.on("show", function() {
		Ext.getCmp("oriAmt").disable(true);
	});
	//Ext.getCmp("isBill").disable(true);
	inputWin.show();
}

/*******************************************************************************
 * 送审
 */
function voucherAudit() {
	var records = voucherPanel.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请选中凭证信息！");
		return;
	} else {
		var reqIds = []; // 凭证主键字符串
		var reqVers = []; // 凭证lastVer字符串
		Ext.Array.each(records, function(model) {
				reqIds.push(model.get("pay_voucher_id"));
				reqVers.push(model.get("last_ver"));
			});
		var myMask = new Ext.LoadMask(Ext.getBody(), {
						msg : '后台正在处理中，请稍后....',
						removeMask : true // 完成后移除
		});
		myMask.show();
		Ext.Ajax.request({
					url : '/realware/checkVoucher.do',
					method : 'POST',
					timeout : 180000, // 设置为3分钟
					params : {
						is_onlyreq : 0,
						billTypeId : records[0].get("bill_type_id"),
						billIds : Ext.encode(reqIds),
						last_vers : Ext.encode(reqVers),
						isCheck : false,
						menu_id :  Ext.PageUtil.getMenuId()
					},
					// 提交成功的回调函数
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
}

/*******************************************************************************
 * 撤销送审
 */
function voucherUnAudit() {
	var records = voucherPanel.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请选中凭证信息！");
		return;
	}
	var reqIds = []; // 凭证主键字符串
	var reqVers = []; // 凭证lastVer字符串
	Ext.Array.each(records, function(model) {
		reqIds.push(model.get('pay_voucher_id'));
		reqVers.push(model.get('last_ver'));
	});
	var params = {
		billTypeId : records[0].get('bill_type_id'),
		billIds : Ext.encode(reqIds),
		last_vers : Ext.encode(reqVers),
		menu_id :  Ext.PageUtil.getMenuId()
	};
	var myMask = new Ext.LoadMask(Ext.getBody(), {
			msg : '后台正在处理中，请稍后....',
			removeMask : true // 完成后移除
	});
	myMask.show();
	Ext.Ajax.request({
			url : '/realware/unAuditPayVoucher.do',
			method : 'POST',
			timeout : 180000, // 设置为3分钟
			params : params,
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

/*******************************************************************************
 * 作废
 */
function voucherInvalidate() {
	var records = voucherPanel.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请选中凭证信息！");
		return;
	}
	var reqIds = []; // 凭证主键字符串
	var reqVers = []; // 凭证lastVer字符串
	Ext.Array.each(records, function(model) {
		reqIds.push(model.get('pay_voucher_id'));
		reqVers.push(model.get('last_ver'));
	});
	var params = {
		billTypeId : records[0].get('bill_type_id'),
		billIds : Ext.encode(reqIds),
		last_vers : Ext.encode(reqVers),
		menu_id :  Ext.PageUtil.getMenuId()
	};
	var myMask = new Ext.LoadMask(Ext.getBody(), {
			msg : '后台正在处理中，请稍后....',
			removeMask : true // 完成后移除
	});
	myMask.show();
	Ext.Ajax.request({
			url : '/realware/invalidateRefundVoucher.do',
			method : 'POST',
			timeout : 180000, // 设置为3分钟
			params : params,
			//提交成功的回调函数
			success : function(response, options) {
				succMethod(response, options,myMask);
				refreshData();				
			},
			// 提交失败的回调函数
			failure : function(response, options) {
				failMethod(response, options,myMask);
				refreshData();				
			}
		});

}


/*******************************************************************************
 * 刷新
 * 
 * @return
 */
function refreshData() {
	voucherPanel.getStore().loadPage(1);
}

/*******************************************************************************
 * 退款查询
 */
function refleshQuery(g) {
	//请款退款金额和退款原因
	Ext.getCmp('oriAmt').setValue("");
	Ext.getCmp('refundReason').setValue("");
	var jsonMap = "[{\"clear_date\":[\"exists\",\"(select 1 from pb_pay_request r where r.pay_voucher_id=objsrc_2742.pay_voucher_id and r.clear_date is not null and r.pay_amount>r.pay_refund_amount ) and objsrc_2742.pay_date is not null\"],\"vt_code\":[\"=\",\""
			+ vt_Code + "\"],\"account_type_right\":[\"=\"," + account_type_right + "],\"admdiv_code\":[\"=\",\"" + Ext.getCmp('admdiv').getValue()+"\"],";
	var pay_date = Ext.getCmp('pay_date').getValue();
	var payeeAcctNo = Ext.getCmp('payeeAcctNo').getValue();
	var fundTypeCode = Ext.getCmp('fundTypeCode').getValue();
	var aAmount = Ext.getCmp('aAmount').getValue();
	var payAcctNo = Ext.getCmp('payAcctNo').getValue();
	var voucherNo = Ext.getCmp('voucherNo').getValue();
	if (("" == pay_date || null == pay_date)
			|| ("" == payeeAcctNo || null == payeeAcctNo)
			|| ("" == fundTypeCode || null == fundTypeCode)
			|| ("" == aAmount || null == aAmount)
			|| ("" == payAcctNo || null == payAcctNo)
			|| ("" == voucherNo || null == voucherNo)) {
		Ext.Msg.alert("系统提示", "请输入全部查询条件！");
		return;
	}
	if ("" != pay_date && null != pay_date) {
		jsonMap = jsonMap + "\"pay_date\":[\"=\",\"" +  Todate(pay_date)
					+ "\",\"date\",\"yyyyMMdd\"],";
	}
	if ("" != payeeAcctNo && null != payeeAcctNo) {
		var jsonStr = [];
		jsonStr[0] = "=";
		jsonStr[1] = payeeAcctNo;
		jsonMap = jsonMap + "\"payee_account_no\":" + Ext.encode(jsonStr) + ",";
	}
	if ("" != fundTypeCode && null != fundTypeCode) {
		var jsonStr = [];
		jsonStr[0] = "=";
		jsonStr[1] = fundTypeCode;
		jsonMap = jsonMap + "\"fund_type_code\":" + Ext.encode(jsonStr) + ",";
	}
	if ("" != aAmount && null != aAmount) {
		jsonMap = jsonMap + "\"pay_amount\":[\"=\",\"" +  aAmount
					+ "\",\"number\"],";
	}
	if ("" != payAcctNo && null != payAcctNo) {
		var jsonStr = [];
		jsonStr[0] = "=";
		jsonStr[1] = payAcctNo;
		jsonMap = jsonMap + "\"pay_account_no\":" + Ext.encode(jsonStr) + ",";
	}
	if ("" != voucherNo && null != voucherNo) {
		var jsonStr = [];
		jsonStr[0] = "=";
		jsonStr[1] = voucherNo;
		jsonMap = jsonMap + "\"pay_voucher_code\":" + Ext.encode(jsonStr) + ",";
	}
	var data = jsonMap.substring(0, jsonMap.length - 1) + "}]";
	g.getStore().load({
				method : 'post',
				params : {
					start : 0,
					pageSize : 200,
					filedNames : JSON.stringify(fileds),
					jsonMap : data,
					vtCode : vt_Code
				}
			});

}

function refleshRequest(g, pay_voucher_id) {
	if(pay_voucher_id==0){
		return;
	}
	var pay = [];
	pay[0] = "=";
	pay[1] = pay_voucher_id;
	var data = "[{\"pay_voucher_id\":" + Ext.encode(pay) + "}]";
	g.getStore().load({
				method : 'post',
				params : {
					start : 0,
					pageSize : 200,
					filedNames : JSON.stringify(filedsOriRequest),
					jsonMap : data
				}
			});
}
