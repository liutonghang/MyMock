/*******************************************************************************
 * 主要实拨签章发送
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
var fileds = ["realpay_voucher_code", "pay_amount", "payee_account_no","payee_account_name", 
		"payee_account_bank","payee_account_bank_no" ,"clear_account_no",
		"clear_account_name", "clear_bank_name", 
		"exp_func_name","fund_type_code", "fund_type_name", "pay_type_code", "pay_type_name",
		"pay_summary_code", "pay_summary_name", "pay_date", "print_num","print_date", "voucherflag", 
		"task_id", "bill_type_id","realpay_voucher_id", "return_reason","pb_set_mode_code","pb_set_mode_name","last_ver","ori_pay_amount","vou_date","create_date","ori_code"];
//退票原因|return_reason|150,
var header = "拨款凭证编码|realpay_voucher_code,原拨款凭证编码|ori_code,拨款金额|pay_amount,收款行行号|payee_account_bank_no|100,银行结算方式名称|pb_set_mode_name|140,收款人账号|payee_account_no|140,收款人名称|payee_account_name|140,收款人银行|payee_account_bank|140,付款人账号|clear_account_no|140,付款人|clear_account_name,付款人开户行|clear_bank_name|140,"
		+ "功能分类|exp_func_name,资金性质编码|fund_type_code|140,资金性质|fund_type_name|140,支付方式编码|pay_type_code|140,支付方式|pay_type_name|140,用途编码|pay_summary_code|140,用途名称|pay_summary_name|140,支付日期|pay_date|140,打印次数|print_num,"
		+ "打印日期|print_date,凭证状态|voucherflag";
Ext.onReady(function() {
	Ext.QuickTips.init();
	gridPanel1 = getGrid(loadUrl, header, fileds, true, true);
	gridPanel1.setHeight(document.documentElement.scrollHeight - 90);
	// 根据查询条件检索数据
	gridPanel1.getStore().on('beforeload', function(thiz, options) {
		beforeload(Ext.getCmp("signSendRealPayVoucherQuery"), options, Ext.encode(fileds));
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
		          
		            title : '查询条件',
		            id:'signSendRealPayVoucherQuery',
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
							style : 'margin-left:5px;margin-right:5px;',
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
							store : comboAdmdiv,
							style : 'margin-left:5px;margin-right:5px;'
						},{
							id : 'vouDate',
							fieldLabel : '凭证日期',
							xtype : 'datefield',
							dataIndex : 'create_date',
							format : 'Y-m-d',
							symbol : '>=',
						//	labelWidth : 60,
							//width : 180,
							data_type:'date',
							data_format:'yyyy-MM-dd'
						}, {
							id : 'vouDateEnd',
							fieldLabel : '至',
							xtype : 'datefield',
							dataIndex : 'create_date ',
							format : 'Y-m-d',
							symbol : '<=',
							//labelWidth : 60,
							//width : 240,
							data_type:'date',
							data_format:'yyyy-MM-dd'
						}]
	                 },gridPanel1];
	    Ext.StatusUtil.createViewport(buttonItems, queryItems, function() {
			Ext.StatusUtil.initPage(Ext.getCmp("admdiv"), Ext.getCmp("taskState"));
			// 默认设置为未生成
			Ext.getCmp('taskState').setValue("001");
		});
	      
	    var set_mode = Ext.getCmp("pb_set_mode_name");
	    set_mode.renderer = function(value,col,rec){
	    	value = rec.get("pb_set_mode_code");
	    	if (value == 1) {
	    		return '同城同行';
	    	}else if (value == 2){
	    		return '同城跨行';
	    	}
	    	else if (value == 3){
	    		return '异地同行';
	    	}else if (value == 4){
	    		return '异地跨行';
	    	}
	    };
	    
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
		if (Ext.getCmp("vouDate").getValue() != null) {
			Ext.getCmp("vouDate").setValue(null)
		}
		if (Ext.getCmp("vouDateEnd").getValue() != null) {
			Ext.getCmp("vouDateEnd").setValue(null)
		}
		Ext.StatusUtil.batchDisable("look");
		Ext.StatusUtil.batchEnable("signAndSing");
	} else if ("002" == taskState) {
		//alert(Ext.getCmp("payDate").getValue())
		if (Ext.getCmp("vouDate").getValue() != null) {
			Ext.getCmp("vouDate").setValue(null)
		}
		if (Ext.getCmp("vouDateEnd").getValue() != null) {
			Ext.getCmp("vouDateEnd").setValue(null)
		}
		Ext.StatusUtil.batchDisable("signAndSing");
		Ext.StatusUtil.batchEnable("look");
	}
}

function refreshData() {
	gridPanel1.getStore().loadPage(1);
}


function singAndSend(){
	var records = gridPanel1.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请选中一条凭证信息！");
		return;
	}
	var reqIds = [];  // 凭证主键字符串
	var reqVers= [];   //凭证lastVer字符串
	for (var i = 0; i < records.length; i++) {
		reqIds. push(records[i].get("realpay_voucher_id"));
		reqVers.push(records[i].get("last_ver"));
	}
	var bill_type_id = records[0].get("bill_type_id");
	var myMask = new Ext.LoadMask(Ext.getBody(), {
			msg : '后台正在处理中，请稍后....',
			removeMask : true // 完成后移除
		});
	myMask.show();
	Ext.Ajax.request({
				url : signAndSendRealPayVoucherUrl,
				method : 'POST',
				timeout : 180000, // 设置为3分钟
				params : {
					billTypeId : bill_type_id,
					billIds : Ext.encode(reqIds),
					last_vers: Ext.encode(reqVers),
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


