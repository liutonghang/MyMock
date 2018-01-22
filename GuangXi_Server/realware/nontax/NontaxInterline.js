/*******************************************************************************
 * 行间划转
 
 */

/*******************************************************************************
 * 引入需要使用的js文件
 */
document.write('<scr'+ 'ipt type="text/javascript" src="/realware/resources/js/recommend.js"></scr'+ 'ipt>');
document.write('<scr'+ 'ipt type="text/javascript" src="/realware/resources/js/share/operationLog.js"></scr'+ 'ipt>');
document.write('<scr'+ 'ipt type="text/javascript" src="/realware/resources/js/share/ocxVoucher.js"></scr'+ 'ipt>');
document.write('<scr'+ 'ipt type="text/javascript" src="/realware/js/view/common/TextareaWindow.js"></scr'+ 'ipt>');


var gridPanel1 = null;

var	voucherPanel = null;

/**
 * 2613
 */
var fields = ["interline_voucher_id", "pay_date", "pay_account_no","bill_type_id",
		"pay_account_name", "payee_account_no","payee_account_name","last_ver",
		"payee_account_bank", "pay_flag", "send_flag","interline_voucher_code","pay_amt","pack_no"];
var header = "查看凭证明细|do1|130|lookPayableVoucher,"
	    + "批次号|pack_no|220,付款人账号|pay_account_no|140,付款人名称|pay_account_name|140,"
		+ "收款人账号|payee_account_no|140,收款人名称|payee_account_name|140,金额|pay_amt|100,"
		+ "转账日期|pay_date|140";

//5603
var fields1 = ["payable_voucher_id", "pay_code", "payee_account_no",
         		"payee_account_name", "payee_account_bank",
         		"pay_account_no", "pay_account_name", "pay_account_bank", "pay_date", "bill_type_id",
         		"last_ver", "vt_code", "admdiv_code","interline_flag","pay_amt"];
var header1 = "缴款码|pay_code|100,"
         	    + "付款人账号|pay_account_no|140,付款人名称|pay_account_name|140,付款人银行|pay_account_bank|140,缴款金额|pay_amt|100,"
         		+ "收款人账号|payee_account_no|140,收款人名称|payee_account_name|140,收款人银行|payee_account_bank|140"; 


Ext.onReady(function() {
	Ext.QuickTips.init();;
	//2613
	store2 = getStore(loadUrl, fields);
	column2 = getColModel(header, fields);
	var pagetool = getPageToolbar(store2);
	store2.on('beforeload', function(thiz, options,e) {
		var panel = Ext.ComponentQuery.query("panel[title='查询区']")[0];
		beforeload(panel, options, Ext.encode(fields));
		options.params["billTypeId"] = 2613;
	});
	
var buttonItems = [{
				id : 'nontaxPay',
				handler : function() {
				      nontaxDo("/realware/nontaxInterlinePay.do",0);
				}
			}, {
				id : 'nontaxManPay',
				handler : function() {
		              nontaxManPay("/realware/nontaxInterlinePay.do",1);
				}
			},{
				id : 'nontaxSend',
				handler : function() {
				      nontaxDo("/realware/nontaxInterlineSend.do");
				}
			}, {

				id : 'refresh',
				handler : function() {
					refreshData();
				}
			}];
	var queryItems = [{
				title : '查询区',
				id : 'PayableVoucherQuery',
				bodyPadding : 2,
				layout : {
					type : 'table',
					columns : 4
				},
				items : [{
							id : 'taskState',
							fieldLabel : '当前状态',
							xtype : 'combo',
							dataIndex : 'task_status',
							displayField : 'status_name',
							emptyText : '请选择',
							valueField : 'status_code',
							symbol : '=',
							editable : false,
							style : 'margin-left:5px;margin-right:5px;',
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
							editable : false,
							store : comboAdmdiv,
							style : 'margin-left:5px;margin-right:5px;'
					   }, {
							id : 'payDate',
							fieldLabel : '转账日期',
							xtype : 'datefield',
							dataIndex : 'pay_date',
							format : 'Ymd',
							symbol : '=',
							style : 'margin-left:5px;margin-right:5px;'
						}, {
							id : 'payeeNo',
							fieldLabel : '收款账号',
							xtype : 'textfield',
							dataIndex : 'payee_account_no'
						}]
				 	},{
				 		id : 'interlinePanel',
						title : '支付凭证列表',
						xtype : 'gridpanel',
						selType : 'checkboxmodel',
						height : document.documentElement.scrollHeight - 80,
						selModel : {
							mode : 'multi',
							checkOnly : true
						},
						features: [{
	                		ftype: 'summary'
	            		}],
						store : store2,
						columns : column2,
						loadMask : {
							msg : '数据加载中,请稍等...'
						},
						bbar : pagetool
					}];
	Ext.StatusUtil.createViewport(buttonItems, queryItems, function() {
				Ext.StatusUtil.initPage(Ext.getCmp("admdiv"), Ext
								.getCmp("taskState"));
				// 默认设置为未生成
				Ext.getCmp('taskState').setValue("001");
			});
});

//查看凭证明细
function lookPayableVoucher(grid, rowIndex, colIndex, node, e, record, rowEl) {
	var record = grid.getStore().getAt(rowIndex).data;
	voucherPanel = getGrid("/realware/loadPaybleByInterId.do", header1, fields1, false, true,"v_");
	voucherPanel.getStore().on('beforeload', function(thiz, options) {
		options.params = [];
		options.params["filedNames"] = JSON.stringify(fields1);
		options.params["id"] = record.interline_voucher_id;
		options.params["menu_id"] = Ext.PageUtil.getMenuId();
	});
	voucherPanel.getStore().load({
				method : 'post',
				params : {
					start : 0,
					pageSize : 200,
					limit : 25
				}
			});
	Ext.widget('window', {
				id : 'voucherWindow',
				title : '明细凭证信息',
				width : 700,
				height : 400,
				layout : 'fit',
				resizable : false,
				modal : true,
				items : [voucherPanel]
			}).show();
}

//状态选择
function selectState(combo, newValue, oldValue, eOpts){
	var taskState = Ext.getCmp("taskState").getValue();
    if(taskState == "001"){
        //bug:18709
    	if(Ext.getCmp("taskState").rawValue == "未转账"){
    		Ext.getCmp('payDate').setValue("").disable();
    	}else if(Ext.getCmp("taskState").rawValue == "未发送"){
    		Ext.getCmp('payDate').setValue("").enable();
    	}
    	Ext.StatusUtil.batchEnable("nontaxPay,nontaxManPay,nontaxSend");   	
    }else if(taskState == "002"){
    	Ext.StatusUtil.batchDisable("nontaxPay,nontaxManPay,nontaxSend");
    	Ext.getCmp('payDate').setValue("").enable();
    }
}

//转账//发送
function nontaxDo(doUrl,pay_type,bankTransNo){
	var records = Ext.getCmp("interlinePanel").getSelectionModel().getSelection();
	if(records == null || records.length == 0){
		Ext.Msg.alert("提示消息","至少选择一条数据！");
		return ;
	}
	var billIds = [];
	var last_vers = [];
	Ext.Array.each(records,function(model){
		billIds.push(model.get("interline_voucher_id"));
		last_vers.push(model.get("last_ver"));
	});
	var myMask = new Ext.LoadMask(Ext.getBody(), {
		msg : '后台正在处理中，请稍后....',
		removeMask : true
		});
	myMask.show();
	Ext.Ajax.request({
				url : doUrl,
				method : 'POST',
				timeout : 180000, // 设置为3分钟
				params : {
		            billTypeId : records[0].get("bill_type_id"),
		            billIds : Ext.encode(billIds),
		            last_vers : Ext.encode(last_vers),
		            pay_type : pay_type,
		            bankTransNo : bankTransNo,
		            menu_id : Ext.PageUtil.getMenuId()
				},
				success : function(response, options) {
					Ext.PageUtil.succAjax(response, myMask);
					refreshData();
				},
				failure : function(response, options) {
					Ext.PageUtil.failAjax(response, myMask);
					refreshData();
				}
			});
}

//人工转账
function nontaxManPay(doUrl,pay_type){
	var me = this;
	var records = Ext.getCmp("interlinePanel").getSelectionModel().getSelection();
	if(records.length != 1){
		Ext.Msg.alert("提示消息","请选择一条数据！");
		return ;
	}
	var transnowindow = Ext.create('pb.view.common.TextareaWindow',{
		title : '补录人工确认支付信息【银行交易流水号】'
	});
	transnowindow.on('confirmclick',function(o, textarea) {
		me.nontaxDo(doUrl,pay_type,textarea);
	});
	transnowindow.show();
}
//刷新
function refreshData(){
	Ext.getCmp("interlinePanel").getStore().loadPage(1);
}
