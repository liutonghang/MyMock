/*******************************************************************************
 * 缴库通知单查询
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
var fileds = ["voucher_status","jkd_voucher_no", "pay_amount", "payee_account_no","payee_account_name", 
		"payee_account_bank","payee_account_bank_no" ,"pay_account_no",
		"pay_account_name", "pay_account_bank", 
		"pay_date","bill_type_id","demandnote_voucher_id",
		"last_ver", "vt_code", "admdiv_code",
		"demandnote_voucher_code","task_status","vou_date","tra_no","voucher_status_err","fin_voucher_status","fin_voucher_status_err"];
var header ="人行凭证状态|voucher_status|120,财政凭证状态|fin_voucher_status|120,缴库单号|demandnote_voucher_code|150,"+
		"收款行行号|payee_account_bank_no|100,缴款金额|pay_amount|100,收款人账号|payee_account_no|140,收款人名称|payee_account_name|140,收款人银行|payee_account_bank|140," +
		"付款人账号|pay_account_no|140,付款人名称|pay_account_name|140,付款人银行|pay_account_bank|140,人行状态错误信息|voucher_status_err|200,财政状态错误信息|fin_voucher_status_err|200,汇划流水号|tra_no|140";


var finVoucherStatus = Ext.create('Ext.data.Store', {
	fields : ['name', 'value'],
	data : [{
				"name" : "全部",
				"value" : ""
			}, {
				"name" : "未发送到财政",
				"value" : "13"
			},{
				"name" : "财政未接收",
				"value" : "6"
			}, {
				"name" : "财政接收成功",
				"value" : "7"
			}, {
				"name" : "财政接收失败",
				"value" : "8"
			}, {
				"name" : "财政签收成功",
				"value" : "9"
			}, {
				"name" : "财政签收失败",
				"value" : "10"
			}, {
				"name" : "财政已退回",
				"value" : "11"
			}, {
				"name" : "已退回财政",
				"value" : "22"
			}]	
});

/*******************************************************************************
 * 状态
 */

Ext.onReady(function() {
	Ext.QuickTips.init();
	gridPanel1 = getGrid(loadUrl, header, fileds, true, true);
	gridPanel1.setHeight(document.documentElement.scrollHeight - 170);
	// 根据查询条件检索数据
	gridPanel1.getStore().on('beforeload', function(thiz, options) {
		beforeload(Ext.getCmp("PayVoucherSendQuery"), options, Ext.encode(fileds));
	});

	var buttonItems=[
	                 {
		              id : 'send',
		              handler : function() {
							var voucherStatus = Ext.getCmp('voucherStatus').getValue();
							if("2" == voucherStatus || "0" == voucherStatus  ){
								sendVoucher('/realware/sendDemandNoteAgain.do',1);
							}
						}
	                },{
			              id : 'send2fin',
			              handler : function() {
								var finVoucherStatus = Ext.getCmp('finvoucherStatus').getValue();
								if( "6" == finVoucherStatus || "8" == finVoucherStatus ){
									sendVoucher('/realware/sendDemandNoteAgain.do',2);
								}
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
							id : 'voucherStatus',
							fieldLabel : '人行凭证状态',
							xtype : 'combo',
							dataIndex : 'voucher_status',
							displayField : 'name',
							emptyText : '请选择',
							valueField : 'value',
							store : comboVoucherStatus,
							editable : false,
							listeners : {
									'change' : selectState
								}
						},{
							id : 'finvoucherStatus',
							fieldLabel : '财政凭证状态',
							xtype : 'combo',
							dataIndex : 'fin_voucher_status',
							displayField : 'name',
							emptyText : '请选择',
							valueField : 'value',
							store : finVoucherStatus,
							editable : false,
							listeners : {
									'change' : selectFinState
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
							data_type:'date'
						}, {
							id : 'payDateEnd',
							fieldLabel : '至',
							xtype : 'datefield',
							dataIndex : 'pay_date ',
							format : 'Ymd',
							symbol:'<=',
							maxValue : new Date(),
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
			Ext.StatusUtil.initPage(Ext.getCmp("admdiv"));
			// 默认设置为未生成
			Ext.getCmp('voucherStatus').setValue("");
			Ext.getCmp('finvoucherStatus').setValue("");
	});
	    Ext.getCmp("voucher_status").renderer = function(value){
			if(null != value){
				    if(value=="0"){
				    		value = "人行未接收";
				    }else if(value=="1"){
				    	value = "人行接收成功";
				    }else if(value=="2"){
				    	value = "人行接收失败";
				    }else if(value=="3"){
				    	value = "人行签收成功";
				    }else if(value=="4"){
				    	value = "人行签收失败";
				    }else if(value=="5"){
				    	value = "人行已退回";
				    }else if(value=="12"){
				    	value = "已收到人行回单";
				    }else if(value=="14"){
				    	value = "银行未发送";
				    }								
			}
			return value;
		};
		
		Ext.getCmp("fin_voucher_status").renderer = function(value){
			if(null != value){
				    if(value=="13"){
				    		value = "未发送到财政";
				    }else  if(value=="6"){
				    		value = "财政未接收";
				    }else if(value=="7"){
				    	value = "财政接收成功";
				    }else if(value=="8"){
				    	value = "财政接收失败";
				    }else if(value=="9"){
				    	value = "财政签收成功";
				    }else if(value=="10"){
				    	value = "财政签收失败";
				    }else if(value=="11"){
				    	value = "财政已退回";
				    }else if(value=="22"){
				    	value = "已退回财政";
				    }							
			}
			return value;
		};
});
/**
 * 控制按钮状态
 ******************************************************************************
 */
function selectState() {
	var voucherStatus = Ext.getCmp('voucherStatus').getValue();
	if("2" == voucherStatus || "0" == voucherStatus ){
		Ext.getCmp('send').enable();
	}
	else {
		Ext.getCmp('send').disable();
	}
}

function selectFinState() {
	var finVoucherStatus = Ext.getCmp('finvoucherStatus').getValue();
	if( "6" == finVoucherStatus || "8" == finVoucherStatus ){
		Ext.getCmp('send2fin').enable();
	}
	else {
		Ext.getCmp('send2fin').disable();
	}
	
	refreshData();
}


function refreshData() {
	gridPanel1.getStore().loadPage(1);
}

/*******************************************************************************
 * 	重新发送
 */
function sendVoucher(url,type) {
	var voucherStatus = Ext.getCmp('voucherStatus').getValue();
	var records = gridPanel1.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请选中一条信息！");
		return;
	}
	var reqIds = [];
	var reqVers = [];
	Ext.Array.each(records,function(model){
			reqIds.push(model.get("demandnote_voucher_id"));
			reqVers.push(model.get("last_ver"));
	});
	
	var bill_type_id =  records[0].get("bill_type_id");
	
	var myMask = new Ext.LoadMask(Ext.getBody(), {
			msg : '后台正在处理中，请稍后....',
			removeMask : true // 完成后移除
		});
	myMask.show();
	Ext.Ajax.request({
				url : url,
				method : 'POST',
				timeout : 180000, // 设置为3分钟
				params : {
					billTypeId : bill_type_id,
					billIds : Ext.encode(reqIds),
					last_vers : Ext.encode(reqVers),
					type : type,
					menu_id :  Ext.PageUtil.getMenuId()
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

