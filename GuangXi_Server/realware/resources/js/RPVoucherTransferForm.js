﻿﻿﻿/***
 * 引入需要使用的js文件
 */
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/recommend.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/operationLog.js"></scr' + 'ipt>');

var fileds = ["urgent_flag","realpay_voucher_code", "pay_amount", "payee_account_no",
		"payee_account_name", "payee_account_bank","payee_account_bank_no" ,"pay_account_no",
		"pay_account_name", "pay_account_bank", 
		"fund_type_code", "fund_type_name", "pay_type_code", "pay_type_name",
		"pay_summary_code", "pay_summary_name", "pay_date", "print_num",
		"print_date", "voucherflag", "task_id", "bill_type_id",
		"realpay_voucher_id", "return_reason","create_date","pb_set_mode_code","pb_set_mode_name","last_ver","urgent_flag",
		"ori_pay_amount","ori_payee_account_bank_no","agency_code","agency_name","exp_func_code","exp_func_name","clear_bank_code","clear_bank_name", "vt_code", "admdiv_code", "year"];


var header = "退回原因|return_reason,拨款凭证编码|realpay_voucher_code,拨款金额|pay_amount,收款行行号|payee_account_bank_no|100,银行结算方式名称|pb_set_mode_name|140,收款人账号|payee_account_no|140,收款人名称|payee_account_name|140,收款人银行|payee_account_bank|140,付款人账号|pay_account_no|140,付款人|pay_account_name,付款人开户行|pay_account_bank|140,"
		+ "资金性质编码|fund_type_code|140,资金性质|fund_type_name|140,支付方式编码|pay_type_code|140,支付方式|pay_type_name|140,功能科目编码|exp_func_code|140,功能科目名称|exp_func_name|140,附言|pay_summary_name|140,支付日期|pay_date|140,打印次数|print_num,"
		+ "打印日期|print_date,凭证状态|voucherflag";

var gridPanel1 = null;

Ext.onReady(function() {
	Ext.QuickTips.init();
	gridPanel1 = getGrid(loadUrl, header, fileds, true, true);
	gridPanel1.setHeight(document.documentElement.scrollHeight - 85);
	gridPanel1.getStore().on('beforeload', function(thiz, options) {
		beforeload(Ext.getCmp("rpVoucherQuery"), options, Ext.encode(fileds));
	});
	var buttonItems=[{
		         id : 'transfer',
		         handler : function() {
			    	 transferRealPay();
		       	 	}
	            },{
		         id : 'return',
		         handler : function() {
			    	 returnRealPayToFirst();
		       	 	}
	            },{
		         id : 'print',
		         handler : function() {
		        	var records = gridPanel1.getSelectionModel()
						.getSelection();
					if (records.length == 0) {
						Ext.Msg.alert("系统提示", "请选中凭证信息！");
						return;
					}
					printPageVoucherByXml(records,"realpay_voucher_id","realpay_voucher_code",records[0].get("vt_code"));
	            }
	            },{
		         id : 'log',
		         handler : function() {
			     	 taskLog(gridPanel1.getSelectionModel().getSelection(),"realpay_voucher_code");
		       		}
	           }, {
		        id : 'refresh',
		        handler : function() {
			   		 refreshData();
		      		}
	        	}, {
	        	id : 'realPayForLD',
	        	handler : function() {
			   		 transForLD();
		      		}
	        	}];
	   var queryItems=[{
		     title:'查询区',
		     id : 'rpVoucherQuery',
			 bodyPadding : 5,
			 layout : 'column',
			 defaults : {
				margins : '5 10 10 0'
			},
		   items:[{
				id : 'taskState',
				fieldLabel : '当前状态',
				xtype : 'combo',
				dataIndex : 'task_status',
				displayField : 'status_name',
				emptyText : '请选择',
				valueField : 'status_code',
				labelWidth : 60,
				width : 240,
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
				labelWidth : 60,
				width : 240,
				editable : false,
				store : comboAdmdiv,
				listeners : {
					'select' : function(){
						selectAdmdiv(true);
					}
				}
	              
			}]	
	   },gridPanel1];
	   
	    Ext.StatusUtil.createViewport(buttonItems, queryItems, function() {
			Ext.StatusUtil.initPage(Ext.getCmp("admdiv"), Ext.getCmp("taskState"));
			// 默认设置为未生成
			Ext.getCmp('taskState').setValue("001");
		});
	    
});	   



/*******************************************************************************
 * 切换状态
 * 
 * @return
 */
function selectState() {
	var taskState = Ext.getCmp('taskState').getValue();
	var store = null;
	var column = null;
	if ("001" == taskState) {
		Ext.StatusUtil.batchEnable("transfer,return");
		gridPanel1.down("#return_reason").hide();
	} else if ("002" == taskState) {
		Ext.StatusUtil.batchDisable("transfer,return,realPayForLD");
		gridPanel1.down("#return_reason").hide();
	}else if("003" == taskState){
		Ext.StatusUtil.batchDisable("transfer,return,realPayForLD");
		gridPanel1.down("#return_reason").show();
	}
}

function refreshData() {
	gridPanel1.getStore().loadPage(1);
}

/**
 * 转账支付
 * @memberOf {TypeName} 
 * @return {TypeName} 
 */
function transferRealPay(){
	var me = this;
	var records = gridPanel1.getSelectionModel().getSelection();
	if( records== null || records.length == 0){
		Ext.Msg.alert("系统提示","请先选择一条数据！");
		return ;
	}
	var reqIds = [];
	var reqVers = [];
	Ext.Array.each(records, function(model) {
				reqIds.push(model.get("realpay_voucher_id"));
				reqVers.push(model.get("last_ver"));
			});
	var bill_type_id = records[0].get("bill_type_id");
	var params = {
			billTypeId : bill_type_id,
			billIds : Ext.encode(reqIds),
			last_vers : Ext.encode(reqVers)
		};
	Ext.PageUtil.doRequestAjax(me,'/realware/transferRealPayVoucher.do',params);
}


/**
 * 退回上一岗
 * @memberOf {TypeName} 
 * @return {TypeName} 
 */
function returnRealPayToFirst(){
	var me = this;
	var records = gridPanel1.getSelectionModel().getSelection();
	if( records== null || records.length == 0){
		Ext.Msg.alert("系统提示","请先选择一条数据！");
		return ;
	}
	backVoucher("returnRealPayToFirst.do", records, "realpay_voucher_id", "退回上岗");
}

//落地转账
function transForLD(){

		var records = gridPanel1.getSelectionModel().getSelection();
		if (records.length == 0) {
			Ext.Msg.alert("系统提示", "请选中一条凭证信息！");
			return;
		}
		var bill_type_id="";
		bill_type_id=records[0].get("bill_type_id");
		
		var ajaxBool = true;
		var bankNos = "";  //收款行行号
		var reqIds = [];  // 凭证主键字符串
		var reqVers=[];   //凭证lastVer字符串
		var bankTypeCode="";   //代理银行结算方式编码
		var bankTypeName="";   //代理银行结算方式名称
		var urgent_flag="";   //加急标志
		var urgent_flag_name="";   //加急标志名称
		for ( var i = 0; i < records.length; i++) {		
			//验证是否都已补录行号
			var payeeAcctBankno = records[i].get("payee_account_bank_no");
			var tempCode = records[i].get("pb_set_mode_code");
			if (Ext.isEmpty( payeeAcctBankno)  || Ext.isEmpty( tempCode) 
					|| Ext.isEmpty(bankMode.findRecord('value', tempCode))) {
				Ext.Msg.alert("系统提示", "凭证："+ records[i].get("realpay_voucher_code")+ ",请先补录行号及银行结算方式再进行确认操作！");
				ajaxBool = false;
				return ;
			}
			bankNos += records[i].get("payee_account_bank_no");
			reqIds.push(records[i].get("realpay_voucher_id"));
			reqVers.push(records[i].get("last_ver"));
			var btcode = records[i].get("pb_set_mode_code");
			bankTypeCode += btcode;
			//每次都去store去取防止值错误
			var btname = bankMode.findRecord('value',btcode).get('name');
			bankTypeName += btname;
			urgent_flag += records[i].get("urgent_flag");
			urgent_flag_name += records[i].get("urgent_flag")==0?"-1":records[i].get("urgent_flag")==1?"加急":"普通";
			if (i < records.length - 1){
				bankNos += ",";
				bankTypeCode += ",";
				bankTypeName += ",";
				urgent_flag += ",";
				urgent_flag_name += ",";
			}
		}
		var myMask = new Ext.LoadMask(Ext.getBody(), {
			msg : '后台正在处理中，请稍后....',
			removeMask : true
		});
		myMask.show();
		Ext.Ajax.request( {
			url : '/realware/acceptRealPayForLD.do',
			waitMsg : '后台正在处理中,请稍后....',
			method : 'POST',
			timeout : 180000, // 设置为3分钟
			params : {
				bankNos : bankNos,
				billTypeId : bill_type_id,
				billIds : Ext.encode(reqIds),
				last_vers: Ext.encode(reqVers),
				bankTypeCode:bankTypeCode,
				bankTypeName:bankTypeName,
				urgent_flag : urgent_flag,
				urgent_flag_name : urgent_flag_name,
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