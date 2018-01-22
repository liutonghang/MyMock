/*******************************************************************************
 * 缴款通知回单发送财政
 * 
 * @type
 */

/***
 * 引入需要使用的js文件
 */
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/recommend.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/operationLog.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/ocxVoucher.js"></scr' + 'ipt>');

var gridPanel1 = null;
/**
 * 列名
 */
var fileds = ["pay_amount", "payee_account_no","payee_account_name", 
		"payee_account_bank","payee_account_bank_no" ,"pay_account_no",
		"pay_account_name", "pay_account_bank", 
		"pay_date","bill_type_id","demandnote_voucher_id",
		"last_ver", "vt_code", "admdiv_code",
		"demandnote_voucher_code","task_status","vou_date","tra_no"];
var header = "缴库单号|demandnote_voucher_code|100,"+
		"收款行行号|payee_account_bank_no|100,收款人账号|payee_account_no|140,缴款金额|pay_amount|100,收款人名称|payee_account_name|140,收款人银行|payee_account_bank|140," +
		"付款人账号|pay_account_no|140,付款人名称|pay_account_name|140,付款人银行|pay_account_bank|140,汇划流水号|tra_no|140";

Ext.onReady(function() {
	Ext.QuickTips.init();
	gridPanel1 = getGrid(loadUrl, header, fileds, true, true);
	gridPanel1.setHeight(document.documentElement.scrollHeight - 140);
	// 根据查询条件检索数据
	gridPanel1.getStore().on('beforeload', function(thiz, options) {
		beforeload(Ext.getCmp("PayVoucherSendQuery"), options, Ext.encode(fileds));
	});
	var buttonItems=[
	                 {
		              id : 'signAndSing',
		              handler : function() {
			          singAndSend();
		             }
	                }, {
		              id : 'look',
		              handler : function() {
			          lookOCX(gridPanel1.getSelectionModel().getSelection(),"demandnote_voucher_id");
		            }
	                }, {
		
		            id : 'refresh',
		            handler : function() {
			        refreshData();
		           }
	              }];
	  var queryItems=[{
		          
		            title : '查询条件',
		            id:'PayVoucherSendQuery',
			        bodyPadding : 5,
			        layout : {
				     type : 'table',
				     columns : 4
			         },
			         items:[{
							id : 'taskState',
							fieldLabel : '当前状态',
							xtype : 'combo',
							dataIndex : 'task_status',
							displayField : 'status_name',
							emptyText : '请选择',
							valueField : 'status_code',
							symbol:'=',
							editable : false,
							listeners : {
								'change' : selectState
							}
						},{
							id : 'admdiv',
							fieldLabel : '所属财政',
							xtype : 'combo',
							dataIndex : 'admdiv_code',
							displayField : 'admdiv_name',
							emptyText : '请选择',
							valueField : 'admdiv_code',
							editable : false,
							store : comboAdmdiv
							//style : 'margin-left:5px;margin-right:5px;'
						},{
							id : "voucherNo",
							fieldLabel : '缴库单号',
							xtype : 'textfield',
							dataIndex : 'demandnote_voucher_code'
						},{
							fieldLabel : '凭证日期',
							xtype : 'datefield',
							dataIndex : 'vou_date',
							format : 'Ymd'
						},{
							id : 'payDate',
							fieldLabel : '交易日期',
							xtype : 'datefield',
							dataIndex : 'pay_date',
							format : 'Ymd',
							symbol:'>=',
							hidden : isRefund,
							data_type:'date'
						}, {
							id : 'payDateEnd',
							fieldLabel : '至',
							xtype : 'datefield',
							dataIndex : 'pay_date ',
							format : 'Ymd',
							symbol:'<=',
							maxValue : new Date(),
							hidden : isRefund,
							data_type:'date'
						},{
							id : "traNo",
							fieldLabel : '汇划流水号',
							xtype : 'textfield',
							dataIndex : 'tra_no'
						},{
							id : 'amount',
							fieldLabel : '&nbsp;&nbsp;金额',
							xtype : 'numberfield',
							dataIndex : 'pay_amount',
							symbol : '=',
							datatype : '1',
							fieldStyle : 'text-align: right;'  ,   //文本框里显示内容右对齐
							decimalPrecision: 2  //小数精确位数
							
						}]
	                 },{
						title : '缴库通知单信息',
						selType : 'checkboxmodel',
						selModel : {
						mode : 'multi',
							checkOnly : true
						}
					   },gridPanel1];
	    Ext.StatusUtil.createViewport(buttonItems, queryItems, function() {
			Ext.StatusUtil.initPage(Ext.getCmp("admdiv"), Ext.getCmp("taskState"));
			// 默认设置为未生成
			Ext.getCmp('taskState').setValue("001");
			if(isRefund) {
				gridPanel1.down('#pay_date').hide();
			}
	});

});
/**
 * 控制按钮状态
 ******************************************************************************
 */
function selectState() {
	var taskState = Ext.getCmp('taskState').getValue();
	if ("002" == taskState) {
		Ext.getCmp('signAndSing').enable();
	} else if("003" == taskState){
		Ext.getCmp('signAndSing').disable();
	}else {
		Ext.getCmp('signAndSing').disable();
	}
}



function refreshData() {
	gridPanel1.getStore().loadPage(1);
}

function singAndSend() {
	var records = gridPanel1.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请选中一条回单信息！");
		return;
	}
	var reqIds = []; // 凭证主键字符串
	var reqVers = []; //凭证lastVer字符串
	Ext.Array.each(records, function(model) {
		reqIds.push(model.get("demandnote_voucher_id"));
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
		url : signAndSendUrl,
		method : 'POST',
		timeout : 180000, // 设置为3分钟
		params : {
			billTypeId : bill_type_id,
			billIds : Ext.encode(reqIds),
			last_vers : Ext.encode(reqVers),
			menu_id : Ext.PageUtil.getMenuId()
		},
		success : function(response, options) {
			succAjax(response, myMask, true);
		},
		failure : function(response, options) {
			failAjax(response, myMask);
			refreshData();
		}
	});
	}

function back(returnUrl) {
	var records = gridPanel1.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请选中一条信息！");
		return;
	}
	var ids = [];
	var lastVers = [];
	var bill_type_id = records[0].get("bill_type_id");
	for ( var i = 0; i < records.length; i++) {
		ids.push(records[i].get("demandnote_voucher_id"));
		lastVers.push(records[i].get("last_ver"));
	}
	Ext.widget('window', {
		id : 'backWin',
		title : '退回财政原因',
		width : 380,
		height : 150,
		layout : 'fit',
		resizable : false,
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
								xtype : 'textareafield',
								height : 70,
								width : 345,
								id : 'return_reason'
							}],
					buttons : [{
						text : '确定',
						handler : function() {
							// 退票/退回原因
							var return_reason = Ext.getCmp('return_reason').getValue();
							if (return_reason == ""){
								Ext.Msg.alert("系统提示", "退回财政原因不能为空！");
								return ;
							};
							if (return_reason.length > 40) {
								Ext.Msg.alert("系统提示", "退回财政原因长度不能超过40个字！");
								return;
							};
							
							var myMask = new Ext.LoadMask('backWin', {
									msg : '后台正在处理中，请稍后....',
									removeMask : true   // 完成后移除
									});
							myMask.show();
							
							// 提交到服务器操作
							Ext.Ajax.request( {
							url : returnUrl,
							waitMsg : '后台正在处理中,请稍后....',
							method : 'POST',
							timeout : 180000, // 设置为3分钟
							params : {
								billIds : Ext.encode(ids),
								last_vers : Ext.encode(lastVers),
								billTypeId : bill_type_id,
								menu_id :  Ext.PageUtil.getMenuId(),
								return_reason:return_reason
							},
							success : function(response, options) {
								Ext.Msg.alert("系统提示", "退回成功！");
								Ext.getCmp('backWin').close();
								refreshData();
							},
							failure : function(response, options) {
								Ext.Msg.alert("系统提示", "退回失败，原因：" + response.responseText);
								Ext.getCmp('backWin').close();
								refreshData();
							}
						});
							}
					}, {
						text : '取消',
						handler : function() {
							this.up('window').close();
						}
					}]
				})]
	}).show();
	
	
}
