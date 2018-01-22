﻿﻿﻿﻿﻿﻿﻿/**
 * 列名
 */

/***
 * 引入需要使用的js文件
 */
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/recommend.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/operationLog.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/ocxVoucher.js"></scr' + 'ipt>');



var fileds = ["urgent_flag","realpay_voucher_code", "pay_amount", "payee_account_no",
		"payee_account_name", "payee_account_bank","payee_account_bank_no" ,"pay_account_no",
		"pay_account_name", "pay_account_bank", 
		"fund_type_code", "fund_type_name", "pay_type_code", "pay_type_name",
		"pay_summary_code", "pay_summary_name", "pay_date", "print_num",
		"print_date", "voucherflag", "task_id", "bill_type_id",
		"realpay_voucher_id", "return_reason","create_date","pb_set_mode_code","pb_set_mode_name","last_ver","urgent_flag"];

var header = "退票原因|return_reason|150,行号补录|do1|100|addBankno,拨款凭证编码|realpay_voucher_code,拨款金额|pay_amount,收款行行号|payee_account_bank_no|100,银行结算方式名称|pb_set_mode_code|140,收款人账号|payee_account_no|140,收款人名称|payee_account_name|140,收款人银行|payee_account_bank|140,付款人账号|pay_account_no|140,付款人|pay_account_name,付款人开户行|pay_account_bank|140,"
		+ "资金性质编码|fund_type_code|140,资金性质|fund_type_name|140,支付方式编码|pay_type_code|140,支付方式|pay_type_name|140,用途编码|pay_summary_code|140,用途名称|pay_summary_name|140,支付日期|pay_date|140,打印次数|print_num,"
		+ "打印日期|print_date,凭证状态|voucherflag";

var gridPanel1 = null;

var bankMode = Ext.create('Ext.data.Store', {
	fields : [{
		name : 'name'
	}, {
		name : 'value'
	}],
	proxy : {
		type : 'ajax',
		async : false,
		actionMethods : {
			read : 'POST'
		},
		url : 'loadbanksetmode.do',
		reader : {
			type : 'json'
		}
	},
    autoLoad : true
});


Ext.onReady(function() {
	Ext.QuickTips.init();
	bankMode.load();
	gridPanel1 = getGrid(loadUrl, header, fileds, true, true);
	gridPanel1.setHeight(document.documentElement.scrollHeight - 85);
	// 根据查询条件检索数据
	gridPanel1.getStore().on('beforeload', function(thiz, options) {
		beforeload(Ext.getCmp("rpVoucherQuery"), options, Ext.encode(fileds));
	});
	var buttonItems=[{
			         	id : 'signsend',
			         	handler : function() {
			         		acceptRealPay();
			         	}
	            }, {
	            	id : 'afreshSend',
	            	handler : function() {
	            		afreshSend("returnRealPay.do");
	            	}
	           }, {
	            	id : 'returnSignSend',
	            	handler : function() {
	            		afreshSend("returnRealPaySignSend.do");
	            	}
	           }, {
		        id : 'look',
		        handler : function() {
			    lookOCX(gridPanel1.getSelectionModel().getSelection(),"realpay_voucher_id");
		      }
	         }, {
		         id : 'log',
		         handler : function() {
			     taskLog(gridPanel1.getSelectionModel().getSelection(),"realpay_voucher_code");
		       }
	         }, {
		        id : 'refresh',
		        handler : function() {
			    refreshData();
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
				store : comboAdmdiv
			}, {
				id : 'payDate',
				fieldLabel : '支付日期',
				xtype : 'datefield',
				dataIndex : 'pay_date',
				format : 'Y-m-d',
				symbol : '>=',
				labelWidth : 60,
				width : 240,
				data_type:'date',
				data_format:'yyyy-MM-dd'
			}, {
				id : 'payDateEnd',
				fieldLabel : '至',
				xtype : 'datefield',
				dataIndex : 'pay_date ',
				format : 'Y-m-d',
				symbol : '<=',
				labelWidth : 60,
				width : 240,
				data_type:'date',
				data_format:'yyyy-MM-dd'
			}]	
	   },gridPanel1];
	   
	    Ext.StatusUtil.createViewport(buttonItems, queryItems, function() {
	    	var b = gridPanel1.down('#payee_account_bank_no');
	        var m = new Ext.form.field.Text({
	         regex:/^\d{1,12}$/,
	         regexText:'该域不能超过12位'
	         });
	         b.setEditor(m);
	        
	        var set_mode = gridPanel1.down('#pb_set_mode_code');
	     	var ecombo = Ext.create('Ext.form.ComboBox', {
	     	    store: bankMode,
	     	    queryMode: 'local',
	     	    displayField: 'name',
	     	    valueField: 'value'
	     	});
	     	set_mode.renderer = function(value,col){
	     		var store = col.column.field.store;
	    		if(store) {
	    			var record = store.findRecord('value',value);
	    			if(record) {
	    				return record.get('name');
	    			}
	    		}
	    		return value;
	         };
	     	set_mode.setEditor(ecombo);
	     	//添加监听事件判断编辑行是否可编辑
	     	gridPanel1.addListener("beforeedit", function(combo, newValue, oldValue, eOpts) {
				var taskState = Ext.getCmp('taskState').getValue();
				if(taskState!='001'){
					return false;
				}
				return true;
			});
			Ext.StatusUtil.initPage(Ext.getCmp("admdiv"), Ext.getCmp("taskState"));
			// 默认设置为未生成
			Ext.getCmp('taskState').setValue("001");
		});
	   
});	   

function arr_del(d){
    return fileds.slice(0,d-1).concat(fileds.slice(d));
}

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
		gridPanel1.down('#myActionColumn').show();
		gridPanel1.down('#return_reason').hide();
		Ext.getCmp('payDate').setValue('');
		Ext.getCmp('payDateEnd').setValue('');
		gridPanel1.down('#pay_date').hide();
		Ext.StatusUtil.batchEnable("signsend,afreshSend,returnSignSend");
		Ext.StatusUtil.batchDisable("payDate,payDateEnd");
	} else if ("002" == taskState) {
		gridPanel1.down('#myActionColumn').hide();
		gridPanel1.down('#return_reason').hide();
		gridPanel1.down('#pay_date').show();
		Ext.StatusUtil.batchDisable("signsend,afreshSend,returnSignSend");
		Ext.StatusUtil.batchEnable("payDate,payDateEnd");
	}else if("007" == taskState){
		gridPanel1.down('#myActionColumn').hide();
		gridPanel1.down('#return_reason').show();
		Ext.getCmp('payDate').setValue('');
		Ext.getCmp('payDateEnd').setValue('');
		gridPanel1.down('#pay_date').hide();
		Ext.StatusUtil.batchDisable("signsend,afreshSend,payDate,payDateEnd,returnSignSend");
	}
	
}

function refreshData() {
	var a = gridPanel1.getStore().getProxy();
	
	var taskState = Ext.getCmp('taskState').getValue();
	//如果是未送审 
	if( '001' == taskState ){
		a.url = "/realware/loadRealPayWithBankNo.do";
	}else{
		a.url = "/realware/loadRealPay.do";
	}
	gridPanel1.getStore().loadPage(1);
}
function acceptRealPay() {
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
		url : '/realware/acceptRealPay.do',
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
function afreshSend(returnUrl) {
	var records = gridPanel1.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请选中一条凭证信息！");
		return;
	}
	var ids = [];
	var lastVers = [];
	var bill_type_id = records[0].get("bill_type_id");
	for ( var i = 0; i < records.length; i++) {
		ids.push(records[i].get("realpay_voucher_id"));
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
								id : 'operRemark'
							}],
					buttons : [{
						text : '确定',
						handler : function() {
							// 退票/退回原因
							var operRemark = Ext.getCmp('operRemark').getValue();
							if (operRemark == ""){
								Ext.Msg.alert("系统提示", "退回财政原因不能为空！");
								return ;
							};
							if (operRemark.length > 40) {
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
								operRemark:operRemark
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



