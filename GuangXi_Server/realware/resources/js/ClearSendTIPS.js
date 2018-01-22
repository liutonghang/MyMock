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
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/lookPayVoucher.js"></scr' + 'ipt>');

// 列表
var listPanel = null;

// 划款信息
var fileds = ["pay_clear_voucher_id","pay_clear_voucher_code", "voucher_status_des", "pay_amount", "agent_account_no",
		"agent_account_name", "agent_bank_name", "clear_account_no",
		"clear_account_name", "clear_bank_name", "fund_type_code",
		"fund_type_name", "pay_type_code", "pay_type_name", "pay_bank_no",
		"pay_bank_name", "clear_date", "confirm_date", "bgt_type_code",
		"bgt_type_name", "task_id","pay_clear_voucher_id", "bill_type_id","pay_entrust_date",
		"last_ver","tips_pack_no","voucher_status_err","tips_file_name","pay_dictate_no","year","vt_code","admdiv_code","vou_date"];
//导出TBS|href1|130|exportTBS,
var header = "查看支付凭证|do1|130|lookPayVoucher,凭证号|pay_clear_voucher_code|130,凭证状态|voucher_status_des|100,Tips文件名|tips_file_name|150,Tips文件包号|tips_pack_no|80,金额|pay_amount|120,退款交易序列号|pay_dictate_no|120,收款银行账号|agent_account_no|150,收款银行账户名称|agent_account_name|150,收款银行名称|agent_bank_name|150,"

		+ "付款银行账号|clear_account_no|150,付款银行账户名称|clear_account_name|150,付款银行名称|clear_bank_name|150,资金性质编码|fund_type_code,资金性质名称|fund_type_name,"
		+ "支付方式编码|pay_type_code,支付方式名称|pay_type_name,代理银行行号|pay_bank_no,代理银行名称|pay_bank_name,清算日期|clear_date,回单日期|confirm_date,"
		+ "预算类型编码|bgt_type_code,预算类型名称|bgt_type_name,错误原因|voucher_status_err";
var payMsgNoComboStore = Ext.create('Ext.data.Store', {
			fields : ['name', 'value'],
			data : [{
						"name" : "103",
						"value" : "103"
					}, {
						"name" : "100",
						"value" : "100"
					}, {
						"name" : "111",
						"value" : "111"
					}]
		});

var comboVoucherStatus = Ext.create('Ext.data.Store', {
			fields : ['name', 'value'],
			data : [{
				"name" : "全部",
				"value" : ""
			}, {
				"name" : "未发送清算行",
				"value" : "13"
			}, {
				"name" : "清算行未接收",
				"value" : "0"
			}, {
				"name" : "清算行接收成功",
				"value" : "1"
			}, {
				"name" : "清算行接收失败",
				"value" : "2"
			}, {
				"name" : "清算行签收成功",
				"value" : "3"
			}, {
				"name" : "清算行签收失败",
				"value" : "4"
			}, {
				"name" : "清算行已退回",
				"value" : "5"
			},{
				"name" : "已收到清算行回单",
				"value" : "12"
			}]
});		

Ext.onReady(function() {
	Ext.QuickTips.init();
	if (listPanel == null) {
		listPanel = getGrid(loadClearUrl, header, fileds, true, true);
		listPanel.setHeight(document.documentElement.scrollHeight - 85);
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
	var buttonItems = [{
											id : 'commitTips',
											handler : function() {
												var admdiv_code = Ext.getCmp('admdiv').getValue();
												commitTIPS(admdiv_code,false,false);
											}
										},{
											id : 'commitTipsNotNo',
											handler : function() {
												var admdiv_code = Ext.getCmp('admdiv').getValue();
												commitTIPS(admdiv_code,true,false);
											}
										},{
											id : 'commitTIPSAndLoad',
											handler : function() {
												var admdiv_code = Ext.getCmp('admdiv').getValue();
												commitTIPS(admdiv_code,false,true);
											}
										},{
											id : 'pay',
											handler : function() {
												checkTransferPayClearVoucher();
											}
										}, {
											id : 'sendEVoucher',
											handler : function() {
												signAndSendClearVoucher();
											}
										},{
											id : 'uncreate',
											handler : function() {
												uncreateVoucher();
											}
										},{
											id : 'look',
											handler : function() {
												lookOCX(listPanel.getSelectionModel().getSelection(),"pay_clear_voucher_id");
											}
										}, {
											id : 'print',
											handler : function() {
												var records = listPanel.getSelectionModel().getSelection();
												if (records.length == 0) {
													Ext.Msg.alert("系统提示", "请选择数据！");
													return;
												}
												var task_state = Ext.getCmp('taskState').value;
												if(task_state=='004'){
													printVoucherAUTO(records,"pay_clear_voucher_id",false,records[0].get("vt_code"),"/realware/printClearVoucherForDB.do");
												}else{
													printPageVoucherByXml(records,"pay_clear_voucher_id","pay_clear_voucher_code",records[0].get("vt_code"));
												}
											}
										
										},{
											id : 'log',
											handler : function() {
												taskLog(listPanel.getSelectionModel().getSelection(),"pay_clear_voucher_id");
											}
										}, {
											id : 'refresh',
											handler : function() {
												refreshData();
											}
										}];
	var queryItems = [ {
					title : "查询区",
					id : 'checkQuery',
					frame : false,
					bodyPadding : 5,
					layout : 'column',//查询区显示不全
					defaults : {
						margins : '3 10 0 0'
					},
					items : [
							{
								id : 'taskState',
								fieldLabel : '当前状态',
								xtype : 'combo',
								dataIndex : 'task_status',
								displayField : 'status_name',
								emptyText : '请选择',
								valueField : 'status_code',
								labelWidth : 53,
								width : 150,
								editable : false,
								listeners : {
									'change' : selectState
								}
							},
							{
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
								id : 'startcreateDate',
								fieldLabel : '生成日期',
								xtype : 'datefield',
								dataIndex : 'create_date ',
								format : 'Ymd',
								width : 160,
								maxValue : new Date(),
								labelWidth : 60,
								symbol : '>=',
								data_type : 'date'
							}, {
								id : 'endcreateDate',
								fieldLabel : '至',
								xtype : 'datefield',
								dataIndex : 'create_date',
								format : 'Ymd',
								width : 115,
								labelWidth : 15,
								symbol : '<=',
								maxValue : new Date(),
								data_type : 'date'
							}, {
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
							} ]
				}, listPanel];
	Ext.StatusUtil.createViewport(buttonItems, queryItems, function() {
		var taskState = Ext.getCmp("taskState");
		Ext.StatusUtil.initPage(Ext.getCmp("admdiv"), taskState);
		 //默认设置为未生成	
		taskState.setValue(taskState.getStore().getAt(0).get("status_code"));
	});
});

function selectState() {
	var taskState = Ext.getCmp('taskState').getValue();
	if ("005" == taskState) {
		Ext.StatusUtil.batchEnable("pay,print");
		Ext.StatusUtil.batchDisable("commitTips,sendEVoucher,look,commitTipsNotNo");
		Ext.getCmp('voucherStatus').setVisible(false);
		Ext.getCmp('uncreate').setVisible(false);
		Ext.getCmp("tips_pack_no").setVisible(false);
		Ext.getCmp("tips_file_name").setVisible(false);
		if(isInput!=undefined&&isInput==true){
			Ext.getCmp("pay_dictate_no").setVisible(true);
		}else{
			Ext.getCmp("pay_dictate_no").setVisible(false);
		}
		Ext.getCmp("voucher_status_des").setVisible(false);
		Ext.getCmp("voucher_status_err").setVisible(false);
		Ext.getCmp('voucherStatus').setValue("");
	} else if ("001" == taskState) {
		Ext.StatusUtil.batchEnable("commitTips,commitTipsNotNo,print");
		Ext.StatusUtil.batchDisable("sendEVoucher,look,pay");
		Ext.getCmp('voucherStatus').setVisible(false);
		Ext.getCmp('uncreate').setVisible(false);
		Ext.getCmp("tips_pack_no").setVisible(false);
		Ext.getCmp("tips_file_name").setVisible(false);
		if(isInput!=undefined&&isInput==true){
			Ext.getCmp("pay_dictate_no").setVisible(true);
		}else{
			Ext.getCmp("pay_dictate_no").setVisible(false);
		}
		Ext.getCmp("voucher_status_des").setVisible(false);
		Ext.getCmp("voucher_status_err").setVisible(false);
		Ext.getCmp('voucherStatus').setValue("");
		if(payMount!=undefined&&payMount==true){
			Ext.getCmp("pay_dictate_no").setVisible(false);
		}else{
			Ext.getCmp("pay_dictate_no").setVisible(true);
		}
	} else if("003" == taskState){
		Ext.StatusUtil.batchEnable("look");
		Ext.StatusUtil.batchDisable("commitTips,sendEVoucher,pay,commitTipsNotNo,print");
		Ext.getCmp('voucherStatus').setVisible(true);
		Ext.getCmp('uncreate').setVisible(true);
		Ext.getCmp('uncreate').disable(false);
		Ext.getCmp("tips_pack_no").setVisible(true);
		Ext.getCmp("tips_file_name").setVisible(false);
		Ext.getCmp("pay_dictate_no").setVisible(false);
		Ext.getCmp("voucher_status_des").setVisible(true);
		Ext.getCmp("voucher_status_err").setVisible(true);
		Ext.getCmp('voucherStatus').setValue("");
		
	} else if("004" == taskState){
		Ext.StatusUtil.batchEnable("sendEVoucher");
		Ext.StatusUtil.batchDisable("commitTips,pay,look,commitTipsNotNo,print");
		Ext.getCmp('voucherStatus').setVisible(false);
		Ext.getCmp('uncreate').setVisible(false);
		Ext.getCmp("tips_pack_no").setVisible(true);
		Ext.getCmp("tips_file_name").setVisible(true);
		if(isInput!=undefined&&isInput==true){
			Ext.getCmp("pay_dictate_no").setVisible(true);
		}else{
			Ext.getCmp("pay_dictate_no").setVisible(false);
		}
		Ext.getCmp("voucher_status_des").setVisible(true);
		Ext.getCmp("voucher_status_err").setVisible(true);
		if(payMount!=undefined&&payMount==true){
			Ext.getCmp("pay_dictate_no").setVisible(false);
		}else{
			Ext.getCmp("pay_dictate_no").setVisible(true);
		}
	} else if ("002" == taskState) {
		Ext.StatusUtil.batchEnable("sendEVoucher,look,sendEVoucher");
		Ext.StatusUtil.batchDisable("commitTips,sendEVoucher,pay");
		Ext.getCmp('voucherStatus').setVisible(true);
		Ext.getCmp('uncreate').setVisible(false);
		Ext.getCmp("tips_pack_no").setVisible(true);
		Ext.getCmp("tips_file_name").setVisible(true);
		Ext.getCmp("pay_dictate_no").setVisible(false);
		Ext.getCmp("voucher_status_des").setVisible(true);
		Ext.getCmp("voucher_status_err").setVisible(true);
		Ext.getCmp('voucherStatus').setValue("");
	}else{
		selectStatus(); 
		Ext.StatusUtil.batchEnable("sendEVoucher,look");
		Ext.StatusUtil.batchDisable("commitTips,pay,commitTipsNotNo");
		Ext.getCmp('voucherStatus').setVisible(true);
		Ext.getCmp('look').enable(false);
		Ext.getCmp("tips_pack_no").setVisible(true);
		Ext.getCmp("tips_file_name").setVisible(true);
		if(isInput!=undefined&&isInput==true){
			Ext.getCmp("pay_dictate_no").setVisible(true);
		}else{
			Ext.getCmp("pay_dictate_no").setVisible(false);
		}
		Ext.getCmp("voucher_status_des").setVisible(true);
		Ext.getCmp("voucher_status_err").setVisible(true);
	}
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

function commitTIPS(admdiv_code,hidden,load) {
	var records = listPanel.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请选择凭证信息！");
		return;
	}
	if (records.length != 1) {
		Ext.Msg.alert("系统提示", "只能选择一条凭证信息！");
		return;
	}
	var billIds = null;
	Ext.Array.each(records, function(model) {
				billIds = billIds + model.get("pay_clear_voucher_id") + ",";
			});
	isInput = true;
	if ( hidden == true ) {
		isInput = false;
	}
	var pay_amount = records[0].get('pay_amount');
	if( pay_amount < 0 && isInput == true ){
		var win = Ext.widget('window', {
			id : 'payFlow',
			title : '支付交易序号',
			width : 260,
			height : 180,
			layout : 'fit',
			resizable : true,
			draggable : true,
			modal : true,
			items : [Ext.widget('form', {
				renderTo : Ext.getBody(),
				layout : {
					type : 'vbox',
					padding : '10'
				},
				resizable : false,
				modal : true,
				items : [
				         {
							id : 'payDictateNo1',
							fieldLabel : '交易序号',
							xtype : 'textfield',
							labelWidth: 60,
							height : 25,
							width : 200,
							hidden:hidden	// 不再录入，转账时已经落地
						},{
							//新加"委托日期"
							id : 'delegateDate',
							fieldLabel : '委托日期',
							xtype : 'datefield',
							dataIndex : 'clear_date',
							format : 'Y-m-d',
							width: 170,
							labelWidth : 60,
							hidden: hidden, // 不再录入，转账时已经落地
							data_type:'string'
							
						}],
				buttons : [{
					text : '确定',
					handler : function() {
							//支付交易序号
							var payDictateNo = Ext.getCmp('payDictateNo1').getValue();
						
							//获取委托日期
							var delegateDate = Ext.getCmp('delegateDate').getValue();

							if (payDictateNo == ""&&hidden==false){
								Ext.Msg.alert("系统提示", "支付交易序号不能为空！");
								return ;
							}
							if(payDictateNo.length > 8&&hidden == false){
								Ext.Msg.alert("系统提示", "支付交易序号长度不能超过8位！");
								return;
							};
							if( /^([0-9]+)$/.test(payDictateNo)==false && hidden == false){
								Ext.Msg.alert("系统提示", "支付交易序号只能输入数字");
								return;
							};
							if (delegateDate == "" ||  null == delegateDate){
								Ext.Msg.alert("系统提示", "委托日期不能为空！");
								return ;
							};
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
											billIds : billIds,
											delegateDate : Ext.util.Format.date(delegateDate,'Ymd'),
											chr_code : "tbs.payclearvoucher.code",
											admdiv_code : admdiv_code
										},
										// 提交成功的回调函数
										success : function(response, options) {
											succAjax(response, myMask);
											Ext.getCmp('payFlow').close();
											var fileName = response.responseText;
											refreshData();
											if(load){
												window.location.href = '/realware/downTipsFile.do?fileName='+fileName;
											};
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
//						myMask.hide();
					}
				}]

			})]
		});
		Ext.Ajax.request({
		url : '/realware/getsysdate.do',
		method : 'POST',
		timeout : 180000, 
		success : function(response, options) {
			Ext.getCmp("delegateDate").setValue(response.responseText)
		},
		failure : function(response, options) {
		}
		});
		win.show();
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
				chr_code : "tbs.payclearvoucher.code",
				admdiv_code : admdiv_code
			},
			success : function(response, options) {
				succAjax(response, myMask1);
				//Ext.getCmp('payFlow').close();
				var fileName = response.responseText;
				refreshData();
				if(load){
					window.location.href = '/realware/downTipsFile.do?fileName='+fileName;
				};
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
					last_vers : Ext.encode(reqVers)
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


/**
 * 退款清算转账
 * 
 */
function checkTransferPayClearVoucher(transSucc) {
	var records = listPanel.getSelectionModel().getSelection();
	//edit by hmy 避免没有数据点按钮报js错误
	if (records.length == 0) { 
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
					tradeType:1
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
function refreshData() {
	listPanel.getStore().loadPage(1);
}