/*******************************************************************************
 * 主要用于划款凭证
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
	
//Ext.require(['*']);

Ext.apply(Ext.form.VTypes, {
      repetition: function(val, field) {     //返回true，则验证通过，否则验证失败
          if (field.repetition) {               //如果表单有使用repetition配置，repetition配置是一个JSON对象，该对象提供了一个名为targetCmpId的字段，该字段指定了需要进行比较的另一个组件ID。
              var cmp = Ext.getCmp(field.repetition.targetCmpId);   //通过targetCmpId的字段查找组件
              if (Ext.isEmpty(cmp)) {      //如果组件（表单）不存在，提示错误
                  Ext.MessageBox.show({
                      title: '错误',
                      msg: '发生异常错误，指定的组件未找到',
                      icon: Ext.Msg.ERROR,
                     buttons: Ext.Msg.OK
                 });
                 return false;
             }
             if (val == cmp.getValue()) {  //取得目标组件（表单）的值，与宿主表单的值进行比较。
                 return true;
             } else {
                 return false;
             }
         }
     },
     repetitionText: '输入的两次支付交易序号不一致！'
 });

// 划款信息
var fileds = ["pay_clear_voucher_code","voucher_status_des", "pay_amount", "agent_account_no",
		"agent_account_name", "agent_bank_name", "clear_account_no",
		"clear_account_name", "clear_bank_name", "fund_type_code",
		"fund_type_name", "pay_type_code", "pay_type_name", "pay_bank_code",
		"pay_bank_name", "clear_date", "confirm_date", "bgt_type_code",
		"bgt_type_name", "task_id", "pay_clear_voucher_id", "bill_type_id",
		"last_ver", "pay_bank_no","vt_code", "year","admdiv_code","pay_dictate_no"];

var header = "查看支付凭证|do1|130|lookPayVoucher,凭证号|pay_clear_voucher_code|130,凭证状态|voucher_status_des,金额|pay_amount|100,收款银行账号|agent_account_no|150,收款银行账户名称|agent_account_name|150,收款银行名称|agent_bank_name|150,支付交易序号|pay_dictate_no|100,"
		+ "付款银行账号|clear_account_no|150,付款银行账户名称|clear_account_name|150,付款银行名称|clear_bank_name|150,资金性质编码|fund_type_code,资金性质名称|fund_type_name,"
		+ "支付方式编码|pay_type_code,支付方式名称|pay_type_name,代理银行行号|pay_bank_no,代理银行名称|pay_bank_name,清算日期|clear_date,回单日期|confirm_date,"
		+ "预算类型编码|bgt_type_code,预算类型名称|bgt_type_name";
var clearGridPanel=null;

var comboStore = Ext.create('Ext.data.Store', {
			fields : ['name', 'value'],
			data : [{
						"name" : "未发送",
						"value" : "001"
					}, {
						"name" : "已发送",
						"value" : "002"
					}]
		});
var comboVoucherStatus = Ext.create('Ext.data.Store', {
			fields : ['name', 'value'],
			data : [{
						"name" : "全部",
						"value" : ""
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
					}, {
						"name" : "银行未发送",
						"value" : "13"
					}, {
						"name" : "已收到清算行回单",
						"value" : "12"
					}]
		});
		
Ext.onReady(function() {
	Ext.QuickTips.init();
	clearGridPanel = getGrid("/realware/loadClearPayVoucher.do", header,fileds, true, true);
	clearGridPanel.setHeight(document.documentElement.scrollHeight - 115);
	clearGridPanel.getStore().on('beforeload', function(thiz, options) {
		var admdiv = Ext.getCmp('admdiv').getValue();
		if (admdiv == null || admdiv == "")
			return;
		beforeload(Ext.getCmp("signSendClearVoucherQuery"), options, Ext.encode(fileds));
	});
	clearGridPanel.title = "划款凭证信息";
			var buttonItems = [{
						id : 'signAndSend',
						handler : function() {
							signAndSend();
						}
					},{
						id : 'send',
						handler : function() {
							sendPayClearVoucherAgain();
						}
					},{
						id : 'uncreate',
						handler : function() {
							uncreateVoucher();
						}
					}, {
						id : 'print',
						handler : function() {
							var recordsr = clearGridPanel.getSelectionModel().getSelection();
							if (recordsr.length == 0) {
								Ext.Msg.alert("系统提示", "请选择数据！");
								return;
							}
							printPageVoucherByXml(recordsr,"pay_clear_voucher_id",'pay_clear_voucher_code',recordsr[0].get("vt_code"));
						}
					},{

						id : 'look',
						handler : function() {
							lookOCX(clearGridPanel.getSelectionModel()
									.getSelection(), "pay_clear_voucher_id");
						}
					},{
						id : 'log',
						handler : function() {
							var recordsr = clearGridPanel.getSelectionModel()
									.getSelection();
							if (recordsr.length == 0) {
								Ext.Msg.alert("系统提示", "请选择数据！");
								return;
							}
							taskLog(recordsr, "pay_clear_voucher_id");
						}
					},{
						id : 'refresh',
						handler : function() {
							refreshData();
						}
					} ];
	
		var queryItems = [ {
	                    	 title : "查询区",
	                    	   id : 'signSendClearVoucherQuery',
	   						   layout : {
									type : 'table',
									columns : 4
								},
	   						   defaults : {
	   								padding : '3 3 3 3'
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
						editable : false,
						listeners : {
							'change' : selectState
						}
					}, {
						id : 'code',
						fieldLabel : '凭证号',
						xtype : 'textfield',
						symbol : '>=',
						labelWidth : 50,
						dataIndex : 'pay_clear_voucher_code'
					}, {
						id : 'codeEnd',
						fieldLabel :'至',
						xtype : 'textfield',
						labelWidth : 20,
						symbol : '<=',
						dataIndex : 'pay_clear_voucher_code'
					}, {
						id : 'admdiv',
						fieldLabel : '所属财政',
						xtype : 'combo',
						dataIndex : 'admdiv_code',
						displayField : 'admdiv_name',
						emptyText : '请选择',
						valueField : 'admdiv_code',
						labelWidth : 60,
						editable : false,
						store : comboAdmdiv
					}, {
						id : 'createDate',
						fieldLabel : '生成日期',
						xtype : 'datefield',
						dataIndex : 'create_date',
						format : 'Ymd',
						labelWidth : 60,
						symbol : '>=',
						data_type : 'date'
					}, {
						id : 'createDateEnd',
						fieldLabel : '至',
						xtype : 'datefield',
						dataIndex : 'create_date ',
						format : 'Ymd',
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
						listeners : {
							'change' : selectStatus
						}
					}]
			},clearGridPanel
			];
		 Ext.StatusUtil.createViewport(buttonItems, queryItems, function() {
				Ext.StatusUtil.initPage(Ext.getCmp("admdiv"), Ext.getCmp("taskState"));
				// 默认设置为未生成
				Ext.getCmp('taskState').setValue("001");
			});
		});

/***************************************************************************
 * 状态下拉列表框选中事件
 */
function selectState() {
	var taskState = Ext.getCmp('taskState').getValue();
	Ext.getCmp('voucherStatus').setValue("");
	if ("001" == taskState) {
		Ext.StatusUtil.batchEnable("signAndSend,log,print");
		Ext.StatusUtil.batchDisable("voucherStatus,look");
	} else if ("002" == taskState) {
		Ext.StatusUtil.batchEnable("look,log,voucherStatus");
		Ext.StatusUtil.batchDisable("signAndSend,print");
	}
	
	Ext.StatusUtil.batchDisable("uncreate");
	Ext.StatusUtil.batchDisable("send");
}

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


/***************************************************************************
 * 所属财政
 */
function selectAdmdiv() {
	setBtnVisible(Ext.getCmp("admdiv").getValue(), null);
	refreshData();
}

/***************************************************************************
 * 刷新
 */
function refreshData() {
	clearGridPanel.getStore().loadPage(1);
}
/***************************************************************************
 * 
 * 录入交易支付序号 
 */
function inputPayDictateNo(){
	 var win = Ext.widget('window', {
		title : '录入交易支付序号',
		id : 'uploadWindow',
		width : 400,
		frame : false,
		height : 150,
		modal : true,
		layout : 'fit',
		resizable : false,
		draggable : true,
		items : Ext.widget('form', {
					border : true,
//					width : 490,
//					height : 130,
					bodyStyle : 'padding:5 5 5 5',
					frame : false,
					fieldDefaults : {
						labelAlign : 'right'
//						labelWidth : 120
					},
					items : [{
								fieldLabel : '支付交易序号(不能超过8位数字)',
								xtype : 'textfield',
								id : 'tranNo',
								maxLength : 8,
								regex:/^\d+$/,
								labelWidth: 200,
								allowBlank : false
							},
							{
								fieldLabel : '重复录入支付交易序号',
								xtype : 'textfield',
								id : 'tranNoConfirm',
								maxLength : 8,
								regex:/^\d+$/,
								labelWidth: 200,
								allowBlank : false,
					      		vtype: 'repetition',  //指定repetition验证类型
	                        	repetition: { targetCmpId: 'tranNo' }  //配置repetition验证，提供目标组件（表单）ID
					    	},{
								//新加"委托日期"
								fieldLabel : '委托日期',
								xtype : 'datefield',
								id : 'payEntrustDate',
								dataIndex : 'clear_date',
								format : 'Y-m-d',
								labelWidth : 200,
								allowBlank : false,
								data_type:'string'
							}
							],
					buttons : [{
						text : '确认',
						formBind : true,
						handler : function() {
							signAndSendClearVoucherOfRefund(Ext.getCmp('tranNo').value,Ext.getCmp('payEntrustDate').value);
							this.up('form').getForm().reset();
							this.up('window').close();
						}
					}, {
						text : '取消',
						handler : function() {
							this.up('form').getForm().reset();
							this.up('window').close();
						}
					}]
				})
	});
	Ext.Ajax.request({
		url : '/realware/getsysdate.do',
		method : 'POST',
		timeout : 180000, 
		success : function(response, options) {
			Ext.getCmp("payEntrustDate").setValue(response.responseText)
		},
		failure : function(response, options) {
		}
	});
    win.show();
	
}

function signAndSend(){
		var records = clearGridPanel.getSelectionModel().getSelection();
		if (records.length == 0) {
			Ext.Msg.alert("系统提示", "请选择一笔数据！");
			return;
		}else if(records.length>0){
			var vt_code = records[0].get("vt_code");
			if(vt_code == '2301'){
				signAndSendClearVoucher();
			}else{
				if(records.length>1){
					Ext.Msg.alert("系统提示", "请选择一笔数据！");
					return;
				}else{
					inputPayDictateNo();
				}
			}
		}
		
}
/***************************************************************************
 * 签章发送
 */
function signAndSendClearVoucher() {
	var records = clearGridPanel.getSelectionModel().getSelection();
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
				url : '/realware/signAndSendClearVoucher.do',
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
					succAjax(response, myMask,true);
				},
				// 提交失败的回调函数
				failure : function(response, options) {
					failAjax(response, myMask);
					refreshData();
				}
			});
}
/*************************************************************************8
 * 
 *  退款清算时要录入交易支付序号
 */
function signAndSendClearVoucherOfRefund(payDictateNo,payEntrustDate) {
	var records = clearGridPanel.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请选择要签章划款单的数据！");
		return;
	}
	//去掉固定长度限制 BUG #9394 
//	if(payDictateNo.length!=8){
//		Ext.Msg.alert("系统提示", "支付交易序号为8位请重新输入(位数不够前补0)！");
//		return;
//	}
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
				url : '/realware/signAndSendClearVoucher.do',
				method : 'POST',
				timeout : 180000, // 设置为3分钟
				params : {
					billTypeId : bill_type_id,
					billIds : Ext.encode(reqIds),
					last_vers : Ext.encode(reqVers),
					payDictateNo:payDictateNo,
					payEntrustDate:Ext.util.Format.date(payEntrustDate,'Ymd'),
					menu_id :  Ext.PageUtil.getMenuId()
				},
				//提交成功的回调函数
				success : function(response, options) {
					succAjax(response, myMask,true);
				},
				// 提交失败的回调函数
				failure : function(response, options) {
					failAjax(response, myMask);
					refreshData();
				}
			});
}

/***************************************************************************
 * 重新发送
 */
function sendPayClearVoucherAgain() {
	var records = clearGridPanel.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请选择要需要重新发送的划款单！");
		return;
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
				url : '/realware/sendPayClearVoucherAgain.do',
				method : 'POST',
				timeout : 180000, //设置为3分钟
				params : {
					ids : ids,
					menu_id :  Ext.PageUtil.getMenuId()
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
 * 撤销生成
 */
function uncreateVoucher() {
	var records = clearGridPanel.getSelectionModel().getSelection();
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