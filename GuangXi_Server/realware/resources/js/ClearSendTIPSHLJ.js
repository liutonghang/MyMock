/**
 * 正向划款凭证发送TIPS
 * @return {TypeName} 
 */

/***
 * 引入需要使用的js文件
 */
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/recommend.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/operationLog.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/ocxVoucher.js"></scr' + 'ipt>');

// 列表
var listPanel = null;

// 划款信息
var fileds = ["pay_clear_voucher_code", "voucher_status_des", "pay_amount", "agent_account_no",
		"agent_account_name", "agent_bank_name", "clear_account_no",
		"clear_account_name", "clear_bank_name", "fund_type_code",
		"fund_type_name", "pay_type_code", "pay_type_name", "pay_bank_code",
		"pay_bank_name", "clear_date", "confirm_date", "bgt_type_code",
		"bgt_type_name", "task_id", "pay_clear_voucher_id", "bill_type_id",
		"last_ver","tips_pack_no","voucher_status_err","tips_file_name","payDictateNo","urgent_flag","urgent_flag_name"];
//导出TBS|href1|130|exportTBS,
var header = "凭证号|pay_clear_voucher_code|130,凭证状态|voucher_status_des|100,Tips文件名|tips_file_name|150,退款交易序列号|payDictateNo|120,金额|pay_amount|120,收款银行账号|agent_account_no|150,收款银行账户名称|agent_account_name|150,收款银行名称|agent_bank_name|150,"
		+ "付款银行账号|clear_account_no|150,付款银行账户名称|clear_account_name|150,付款银行名称|clear_bank_name|150,资金性质编码|fund_type_code,资金性质名称|fund_type_name,"
		+ "支付方式编码|pay_type_code,支付方式名称|pay_type_name,代理银行编码|pay_bank_code,代理银行名称|pay_bank_name,清算日期|clear_date,回单日期|confirm_date,"
		+ "预算类型编码|bgt_type_code,预算类型名称|bgt_type_name,Tips文件包号|tips_pack_no|80,错误原因|voucher_status_err";

// 状态
var comboStore = Ext.create('Ext.data.Store', {
			fields : ['name', 'value'],
			data : [ {
						"name" : "未发送",
						"value" : "003"
					}, {
						"name" : "已发送",
						"value" : "004"
					},{
						"name" : "已提交",
						"value" : "001"
					}]
		});

//var payMsgNoComboStore = Ext.create('Ext.data.Store', {
//			fields : ['name', 'value'],
//			data : [{
//						"name" : "103",
//						"value" : "103"
//					}, {
//						"name" : "100",
//						"value" : "100"
//					}]
//		});

var comboVoucherStatus = Ext.create('Ext.data.Store', {
			fields : ['name', 'value'],
			data : [{
						"name" : "全部",
						"value" : ""
					}, {
						"name" : "本方未发送",
						"value" : "13"
					}, {
						"name" : "对方未接收",
						"value" : "0"
					}, {
						"name" : "对方接收成功",
						"value" : "1"
					}, {
						"name" : "对方接收失败",
						"value" : "2"
					}, {
						"name" : "对方签收成功",
						"value" : "3"
					}, {
						"name" : "对方签收失败",
						"value" : "4"
					}, {
						"name" : "对方已退回",
						"value" : "5"
					},{
						"name" : "已收到对方回单",
						"value" : "12"
					}]
});		

Ext.onReady(function() {
	Ext.QuickTips.init();
	if (listPanel == null) {
		listPanel = getGrid(loadClearUrl, header, fileds, true, true);
		listPanel.setHeight(document.documentElement.scrollHeight - 95);
		listPanel.title = "划款凭证列表信息";

		// 根据查询条件检索数据
		listPanel.getStore().on('beforeload', function(thiz, options) {
			var jsonMap = "[{";
			var admdiv = Ext.getCmp('admdiv').getValue();
			if (admdiv == null || admdiv == "")
				return;
			beforeload(Ext.getCmp("checkQuery"), options, Ext
									.encode(fileds));
		});

	}
	Ext.create('Ext.Viewport', {
				id : 'clearSendTIPS',
				layout : 'fit',
				items : [Ext.create('Ext.panel.Panel', {
							tbar : [{
								id : 'buttongroup',
								xtype : 'buttongroup',
								items : [ {
											id : 'sendEVoucher',
											text : '发送人行',
											iconCls : 'again',
											scale : 'small',
											handler : function() {
												signAndSendClearVoucher();
											}
										},{
											id : 'commitTips',
											text : '提交TIPS',
											iconCls : 'export',
											scale : 'small',
											handler : function() {
												var admdiv_code = Ext.getCmp('admdiv').getValue();
												commitTIPS(admdiv_code);
											}
										},{
											id : 'uncreate',
											text : '撤销生成',
											iconCls : 'unaudit',
											scale : 'small',
											handler : function() {
												uncreateVoucher();
											}
										},{
											id : 'look',
											text : '查看凭证',
											iconCls : 'look',
											scale : 'small',
											handler : function() {
												lookOCX(listPanel.getSelectionModel().getSelection(),"pay_clear_voucher_id");
											}
										}, {
											id : 'log',
											text : '查看操作日志',
											iconCls : 'log',
											scale : 'small',
											handler : function() {
												taskLog(listPanel.getSelectionModel().getSelection(),"pay_clear_voucher_id");
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
								items : listPanel,
								tbar : {
									id : 'checkQuery',
									xtype : 'toolbar',
									bodyPadding : 5,
									layout : 'hbox',
									defaults : {
										margins : '3 10 0 0'
									},
										items : [{
													id : 'taskState',
													fieldLabel : '当前状态',
													xtype : 'combo',
													dataIndex : 'task_status',
													displayField : 'name',
													emptyText : '请选择',
													valueField : 'value',
													labelWidth : 53,
													width : 150,
													editable : false,
													store : comboStore,
													value : '003',
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
													width : 180,
													editable : false,
													store : comboAdmdiv,
													value : comboAdmdiv.data.length > 0
														? comboAdmdiv.data.getAt(0).get("admdiv_code")
														: "",
													listeners : {
														'select' : selectAdmdiv
													}
												}, {
													id : 'startcreateDate',
													fieldLabel : '生成日期',
													xtype : 'datefield',
													dataIndex : 'create_date',
													format : 'Ymd',
													width: 160,
													labelWidth : 60,
													symbol:'>=',
													data_type:'date'
												},{
													id : 'endcreateDate',
													fieldLabel : '至',
													xtype : 'datefield',
													dataIndex : 'create_date ',
													format : 'Ymd',
													width: 115,
													labelWidth : 15,
													symbol:'<=',
													maxValue : new Date(),
													data_type:'date'
												},{
													id : 'voucherStatus',
													fieldLabel : '凭证状态',
													xtype : 'combo',
													dataIndex : 'voucher_status',
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
												}]
								}
							}]
						})]
			});
	setBtnVisible(Ext.getCmp("admdiv").getValue(), Ext.getCmp("buttongroup"));
	Ext.getCmp('uncreate').setVisible(false);
	selectState();
});

function selectAdmdiv() {
	setBtnVisible(Ext.getCmp("admdiv").getValue(), null);
	refreshData();
}

function selectState() { 
	var taskState = Ext.getCmp('taskState').getValue();
	if ("001" == taskState) {   //导出tips
		Ext.getCmp('commitTips').disable(false);
//		listPanel.down('#hrefColumn').show();
		//Ext.getCmp('exportTBS').enable(false);
		Ext.getCmp('voucherStatus').setVisible(true);
		Ext.getCmp('sendEVoucher').disable(false);
		Ext.getCmp('look').disable(false);
		Ext.getCmp('uncreate').setVisible(false);
		Ext.getCmp("tips_pack_no").setVisible(false);
		Ext.getCmp("tips_file_name").setVisible(false);
//		if(isInput!=undefined&&isInput==true){
//			Ext.getCmp("payDictateNo").setVisible(true);
//		}else{
//			Ext.getCmp("payDictateNo").setVisible(false);
//		}
		Ext.getCmp("voucher_status_des").setVisible(true);
		Ext.getCmp("voucher_status_err").setVisible(true);
		var  statuId = Ext.getCmp('voucherStatus').getValue();
		if(statuId == "5" || statuId == "4"){
			Ext.getCmp('uncreate').setVisible(true);
			Ext.getCmp('uncreate').enable(false);
		}else{
			Ext.getCmp('uncreate').setVisible(true);
			Ext.getCmp('uncreate').disable(false);
		}
	} else if("003" == taskState){   //未发送
		Ext.getCmp('commitTips').disable(false);
//		listPanel.down('#hrefColumn').hide();
		//Ext.getCmp('exportTBS').disable(false);
		Ext.getCmp('voucherStatus').setVisible(false);
		Ext.getCmp('sendEVoucher').enable(false);
		Ext.getCmp('look').disable(false);
		Ext.getCmp('uncreate').setVisible(false);
		Ext.getCmp("tips_pack_no").setVisible(true);
		Ext.getCmp("tips_file_name").setVisible(false);
		Ext.getCmp("payDictateNo").setVisible(false);
		Ext.getCmp("voucher_status_des").setVisible(true);
		Ext.getCmp("voucher_status_err").setVisible(true);
	} else if ("002" == taskState) {
		Ext.getCmp('commitTips').disable(false);
		Ext.getCmp('voucherStatus').setVisible(true);
		Ext.getCmp('sendEVoucher').disable(false);
		Ext.getCmp('look').enable(false);
		Ext.getCmp('uncreate').setVisible(false);
		Ext.getCmp("tips_pack_no").setVisible(true);
		Ext.getCmp("tips_file_name").setVisible(true);
		Ext.getCmp("payDictateNo").setVisible(false);
		Ext.getCmp("voucher_status_des").setVisible(true);
		Ext.getCmp("voucher_status_err").setVisible(true);
	}else{ 
		selectStatus(); 
		Ext.getCmp('commitTips').enable(false);
		Ext.getCmp('voucherStatus').setVisible(true);
		Ext.getCmp('sendEVoucher').disable(false);
		Ext.getCmp('look').enable(false);
		Ext.getCmp("tips_pack_no").setVisible(true);
		Ext.getCmp("tips_file_name").setVisible(true);
//		if(isInput!=undefined&&isInput==true){
//			Ext.getCmp("payDictateNo").setVisible(true);
//		}else{
//			Ext.getCmp("payDictateNo").setVisible(false);
//		}
		Ext.getCmp("voucher_status_des").setVisible(true);
		Ext.getCmp("voucher_status_err").setVisible(true);
	}
	refreshData();
}

function selectStatus(){
	var  statuId = Ext.getCmp('voucherStatus').getValue();
	if(statuId == "5" || statuId == "4"){
		Ext.getCmp('uncreate').setVisible(true);
		Ext.getCmp('uncreate').enable(false);
	}else{
		Ext.getCmp('uncreate').setVisible(true);
		Ext.getCmp('uncreate').disable(false);
	}
	refreshData();
}

function commitTIPS(admdiv_code) {
	var records = listPanel.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请选中凭证信息！");
		return;
	}
	if (records.length >1) {
		Ext.Msg.alert("系统提示", "请选中一条凭证信息！");
		return;
	}
	var billIds = null;
	Ext.Array.each(records, function(model) {
				billIds = billIds + model.get("pay_clear_voucher_id") + ",";
			});
	var pay_amount = records[0].get("pay_amount");
	if( pay_amount != undefined && pay_amount < 0 ){
		Ext.widget('window', {
			id : 'payFlow',
			title : '支付交易序号',
			width : 380,
			height : 110,
			layout : 'fit',
			resizable : true,
			draggable : true,
			modal : true,
			items : [Ext.widget('form', {
				renderTo : Ext.getBody(),
				layout : {
					type : 'hbox',
					padding : '10'
				},
				resizable : false,
				modal : true,
				items : [{
							id : 'payDictateNo1',
							fieldLabel : '交易序号',
							xtype : 'textfield',
							labelWidth: 60,
							height : 25,
							width : 200
						}
//						, {
//							id : 'payMsgNo',
//							fieldLabel : '&nbsp;&nbsp;报文编号',
//							xtype : 'combo',
//							dataIndex : 'paymsg_no',
//							displayField : 'name',
//							emptyText : '请选择',
//							valueField : 'value',
//							labelWidth : 60,
//							width : 130,
//							editable : false,
//							store : payMsgNoComboStore
//						}
				],
				buttons : [{
					text : '确定',
					handler : function() {
							//支付交易序号
							var payDictateNo = Ext.getCmp('payDictateNo1').getValue();
							//支付报文编号
							//var payMsgNo = Ext.getCmp('payMsgNo').getValue();
							if (payDictateNo == ""){
								Ext.Msg.alert("系统提示", "支付交易序号不能為空！");
								return ;
							}
							if(payDictateNo.length != 8){
								Ext.Msg.alert("系统提示", "长度为8个字节");
								return;
							};
//							if (payMsgNo == "" ||  null == payMsgNo){
//								Ext.Msg.alert("系统提示", "报文编码不能为空！");
//								return ;
//							}
							var myMask = new Ext.LoadMask('payFlow', {
								msg : '后台正在处理中，请稍后....',
								removeMask : true
									// 完成后移除
								});						
							myMask.show();
							// 提交到服务器操作
							Ext.Ajax.request({
										url : '/realware/clearSendTIPS.do',
										method : 'POST',
										timeout : 180000, // 设置为3分钟
										params : {
											payDictateNo : payDictateNo,
											//payMsgNo : payMsgNo,
											billIds : billIds,
											chr_code : "tbs.payclearvoucher.code",
											admdiv_code : admdiv_code
										},
										// 提交成功的回调函数
										success : function(response, options) {
											succAjax(response, myMask);
											Ext.getCmp('payFlow').close();
											refreshData();
										},
										// 提交失败的回调函数
										failure : function(response, options) {
											failAjax(response, myMask);
											refreshData();
										}
									});
					}
				}, {
					text : '取消',
					handler : function() {
						this.up('window').close();
						myMask.hide();
					}
				}]

			})]
		}).show();
	}
	else{
		var myMask1 = new Ext.LoadMask(Ext.getBody(), {
			msg : '后台正在处理中，请稍后....',
			removeMask : true
				// 完成后移除
			});
		myMask1.show();
		Ext.Ajax.request({
			url : '/realware/clearSendTIPS.do',
			method : 'POST',
			timeout : 180000, // 设置为3分钟
			params : {
				billIds : billIds,
				payDictateNo:records[0].get('payDictateNo'),
				chr_code : "tbs.payclearvoucher.code",
				admdiv_code : admdiv_code
			},
			success : function(response, options) {
				succAjax(response,myMask1);
				refreshData();
			},
			failure : function(response, options) {
				failAjax(response, myMask1);
				refreshData();
			}
		});
	}

}





/***
 * 导出TBS
 */
function exportTBS(grid, rowIndex, colIndex, node, e, record, rowEl) {
	window.location.href = "/realware/exportTBS.do?id="+ record.get("pay_clear_voucher_id")+ "&chr_code=tbs.payclearvoucher.code&billTypeId="	+ record.get('bill_type_id');
	for(var i =0;i<5;i++){
		setTimeout (function(){
				refreshData(); }, 1000 * 2);
	}
}

/*******************************************************************************
 * 签章发送
 */

function signAndSendClearVoucher() {
	var records = listPanel.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请选择要签章划款单的数据！");
		return;
	}
	var reqIds = [];
	var reqVers = [];
	Ext.Array.each(records, function(model) {
				reqIds.push(model.get("pay_clear_voucher_id"));
				reqVers.push(model.get("last_ver"));
			});
	var urgent_flag="";   //加急标志
	var urgent_flag_name="";   //加急标志名称		
	for (var i = 0; i < records.length; i++) {
			urgent_flag +=records[i].get("urgent_flag");
			urgent_flag_name += records[i].get("urgent_flag")==-1?"-1":records[i].get("urgent_flag")==3?"加急":"普通";
			if (i < records.length - 1){
//				reqIds += ",";
//				reqVers += ",";			
				urgent_flag += ",";	
				urgent_flag_name += ",";
			}
	}		
	var bill_type_id = records[0].get("bill_type_id");
	var myMask = new Ext.LoadMask(Ext.getBody(), {
		msg : '后台正在处理中，请稍后....',
		removeMask : true
			// 完成后移除
		});
	myMask.show();
	Ext.Ajax.request({
				url : '/realware/signAndSendClearVoucher.do',
				method : 'POST',
				timeout : 180000, // 设置为3分钟
				params : {
					billTypeId : bill_type_id,
					billIds :Ext.encode(reqIds),
					last_vers : Ext.encode(reqVers),
					urgent_flag : urgent_flag,
					urgent_flag_name : urgent_flag_name
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

/*******************************************************************************
 * 撤销生成
 */
function uncreateVoucher() {
	var records = listPanel.getSelectionModel().getSelection();
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
					billIds :Ext.encode(reqIds),
					last_vers : Ext.encode(reqVers),
					isBack : true
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

function refreshData() {
	listPanel.getStore().loadPage(1);
}
