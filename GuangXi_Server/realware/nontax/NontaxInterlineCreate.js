/*******************************************************************************
 * 行间划转
 
 */

/*******************************************************************************
 * 引入需要使用的js文件
 */
document.write('<scr'+ 'ipt type="text/javascript" src="/realware/resources/js/recommend.js"></scr'+ 'ipt>');
document.write('<scr'+ 'ipt type="text/javascript" src="/realware/resources/js/share/operationLog.js"></scr'+ 'ipt>');
document.write('<scr'+ 'ipt type="text/javascript" src="/realware/resources/js/share/ocxVoucher.js"></scr'+ 'ipt>');

var gridPanel11 = null;

var	voucherPanel1 = null;

/**
 * 2613
 */
var fieldss = ["interline_voucher_id", "pay_date", "pay_account_no","bill_type_id",
		"pay_account_name", "payee_account_no","payee_account_name","last_ver",
		"payee_account_bank", "pay_flag", "send_flag","interline_voucher_code","pay_amt","create_date","pack_no"];
var headers = "批次号|pack_no|220,付款人账号|pay_account_no|140,付款人名称|pay_account_name|140,"
		+ "收款人账号|payee_account_no|140,收款人名称|payee_account_name|140,金额|pay_amt|140,"
		+ "转账日期|pay_date|140,生成日期|create_date|140";


/**
 * 5603
 */
var fieldss1 = ["payable_voucher_id", "pay_code", "payee_account_no",
      		"payee_account_name", "payee_account_bank",
      		"pay_account_no", "pay_account_name", "pay_account_bank", "pay_date", "bill_type_id",
      		"last_ver", "vt_code", "admdiv_code","interline_flag","pay_amt","cfm_date"];
var headers1 = "缴款码|pay_code|100,"
      	    + "付款人账号|pay_account_no|140,付款人名称|pay_account_name|140,付款人银行|pay_account_bank|140,缴款金额|pay_amt|100,"
      		+ "收款人账号|payee_account_no|140,收款人名称|payee_account_name|140,收款人银行|payee_account_bank|140,缴款日期|cfm_date|140"; 


Ext.onReady(function() {
	Ext.QuickTips.init();
	//5603
	stores1 = getStore(loadUrl, fieldss1);
	columns1 = getColModel(headers1, fieldss1);
	//2613
	stores2 = getStore(loadUrl, fieldss);
	columns2 = getColModel(headers, fieldss);
	var pagetool = getPageToolbar(stores1);
	stores1.on('beforeload', function(thiz, options,e) {
		var panel = Ext.ComponentQuery.query("panel[title='查询区']")[0];
		beforeload(panel, options, Ext.encode(fieldss1));
		options.params["billTypeId"] = 22;
	});
	stores2.on('beforeload', function(thiz, options,e) {
		var panel = Ext.ComponentQuery.query("panel[title='查询区']")[0];
		beforeload(panel, options, Ext.encode(fieldss));
		options.params["billTypeId"] = 2613;
	});
	
var buttonItems = [{
				id : 'nontaxCreate',
				handler : function() {
	                  nontaxCreate();
				}
			},{
				id : 'unCreate',
				handler : function() {
					unCreateInterlineVoucher();
				}
			},{

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
							id : 'taskStates',
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
								'change' : selectStates
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
							id : 'cfm_dateb',
							fieldLabel : '缴款确认日期',
							xtype : 'datefield',
							dataIndex : 'cfm_date',
							format : 'Ymd',
							symbol : '=',
							style : 'margin-left:5px;margin-right:5px;'
						}, {
							id : 'inVouDate',
							fieldLabel : '生成日期',
							xtype : 'datefield',
							dataIndex : 'vou_date',
							format : 'Ymd',
							symbol : '=',
							style : 'margin-left:5px;margin-right:5px;'
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
						store : stores1,
						columns : columns1,
						loadMask : {
							msg : '数据加载中,请稍等...'
						},
						bbar : pagetool
					}];
	Ext.StatusUtil.createViewport(buttonItems, queryItems, function() {
				Ext.StatusUtil.initPage(Ext.getCmp("admdiv"), Ext
								.getCmp("taskStates"));
				// 默认设置为未生成
				Ext.getCmp('taskStates').setValue("000");
			});
});

function selectStates(combo, newValue, oldValue, eOpts){
	var taskState = Ext.getCmp("taskStates").getValue();
	var grid = Ext.getCmp("interlinePanel");
	var pager = Ext.ComponentQuery.query("pagingtoolbar")[0];
	if(newValue == '000'){
		Ext.getCmp('nontaxCreate').enable();		
		Ext.suspendLayouts();
	    grid.setTitle("缴款通知书信息");
		grid.reconfigure(stores1, columns1);
		// 重新绑定分页工具栏
		pager.bind(stores1);
	    Ext.resumeLayouts(true);
	    Ext.StatusUtil.batchEnable("nontaxCreate");
	    Ext.StatusUtil.batchDisable("unCreate");
	    Ext.getCmp("inVouDate").setValue("").disable();
	    Ext.getCmp("cfm_dateb").setValue("").enable();
	}else {
		if(newValue == '001'){
			Ext.StatusUtil.batchDisable("nontaxCreate");
			Ext.StatusUtil.batchEnable("unCreate");
			 Ext.getCmp("inVouDate").setValue("").enable();
			Ext.getCmp("cfm_dateb").setValue("").disable();
		}
		Ext.suspendLayouts();
	    grid.setTitle("行间划转凭证信息");
		grid.reconfigure(stores2, columns2);
		// 重新绑定分页工具栏
		pager.bind(stores2);
	    Ext.resumeLayouts(true);
	}
}

//生成
function nontaxCreate(){
	var status = Ext.getCmp("taskStates").getValue();
	var admdiv_code = Ext.getCmp("admdiv").getValue();
	if(Ext.isEmpty(admdiv_code)) {
		Ext.Msg.alert("系统提示", "所属财政为空不能进行操作！");
		return ;
	}
	if(Ext.isEmpty(status)) {
		Ext.Msg.alert("系统提示", "请选择未生成状态！");
		return ;
	}
	var interlineConds = {
			task_status : ["=",""+status],
			admdiv_code : ["=",""+admdiv_code]
	}
	var myMask = new Ext.LoadMask(Ext.getBody(), {
		msg : '后台正在处理中，请稍后....',
		removeMask : true
		});
	myMask.show();
	Ext.Ajax.request({
				url : '/realware/nontaxInterlineCreate.do',
				method : 'POST',
				timeout : 180000, // 设置为3分钟
				params : {
					jsonMap : JSON.stringify([interlineConds]),
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

//刷新
function refreshData(){
	Ext.getCmp("interlinePanel").getStore().loadPage(1);
}


//撤销生成
function unCreateInterlineVoucher(){
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
				url : 'unCreateInterlineVoucher.do',
				method : 'POST',
				timeout : 180000, // 设置为3分钟
				params : {
		            billTypeId : records[0].get("bill_type_id"),
		            billIds : Ext.encode(billIds),
		            last_vers : Ext.encode(last_vers),
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