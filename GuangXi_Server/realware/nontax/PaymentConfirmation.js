/*******************************************************************************
 * 查缴模式
 * @baotong
 */

/*******************************************************************************
 * 引入需要使用的js文件
 */
document.write('<scr'+ 'ipt type="text/javascript" src="/realware/resources/js/recommend.js"></scr'+ 'ipt>');
document.write('<scr'+ 'ipt type="text/javascript" src="/realware/resources/js/share/operationLog.js"></scr'+ 'ipt>');
document.write('<scr'+ 'ipt type="text/javascript" src="/realware/resources/js/share/ocxVoucher.js"></scr'+ 'ipt>');
document.write('<scr'+ 'ipt type="text/javascript" src="/realware/nontax/PayableConfirmWindow.js"></scr'+ 'ipt>');


var gridPanel1 = null;

/**
 * 列名
 */
var fileds = ["payable_voucher_id", "pay_code", "payee_account_no",
		"payee_account_name", "payee_account_bank","cfm_date","payable_voucher_code",
		"pay_account_no", "pay_account_name", "pay_account_bank", "pay_date", "bill_type_id",
		"last_ver", "vt_code", "admdiv_code","interline_flag","pay_amt",
		"man_business_type", "business_type","pay_status","is_inter_bank","cfm_date","bank_trans_no"];
var header = "缴款码|pay_code|200,"
	    + "缴款人账号|pay_account_no|200,缴款人名称|pay_account_name|140,缴款人银行|pay_account_bank|140,缴款金额|pay_amt|150,"
		+ "收款人账号|payee_account_no|160,收款人名称|payee_account_name|180,收款人银行|payee_account_bank|180,"
		+ "缴款状态|business_type|100,是否跨行|is_inter_bank|100,确认日期|cfm_date|100,确认流水号|bank_trans_no|150";



var fileds1 = ["tra_no","trans_date","trans_time","pay_amount","income_amount","pay_account_no","pay_account_name","payee_account_name","pay_summary_name","payee_account_no"];
var header1 = "流水号|tra_no|100,流水日期|trans_date|100,流水时间|trans_time|100,缴款金额|income_amount|100,缴款人账号|pay_account_no|100," +
		      "缴款人名称|pay_account_name|100,收款人账号|payee_account_no|160,收款人名称|payee_account_name|100,附言|pay_summary_name|100";

//凭证状态
var comboVoucherStatus = Ext.create("Ext.data.Store", {
		fields : [ "name", "value" ],
		data : [ {
			"name" : "全部",
			"value" : ""
		},{
			"name" : "银行未发送",
			"value" : "13"
		}]

});
Ext.onReady(function() {
			Ext.QuickTips.init();
			gridPanel1 = getGrid(loadUrl, header, fileds, true, true);
			gridPanel1.setHeight(document.documentElement.scrollHeight - 140);
			// 根据查询条件检索数据
			gridPanel1.getStore().on('beforeload', function(thiz, options) {
				beforeload(Ext.getCmp("PayableVoucherQuery"), options, Ext.encode(fileds));
				options.params["billTypeId"] = 22;
			});
			
			var buttonItems = [{
						id : 'query',
						handler : function() {
							query();
						}
					}, {
						id : 'confirm',
						handler : function() {
							confirm();
						}
					}, {

						id : 'refresh',
						handler : function() {
							refreshData();
						}
					}, {

						id : 'looklog',
						handler : function() {
						var records = gridPanel1.getSelectionModel().getSelection();
						taskLog(records,"payable_voucher_code");
						}
					}, {

						id : 'deleteBtn',
						handler : function() {
							var records = gridPanel1.getSelectionModel().getSelection();
							if (records.length == 0) {
								Ext.Msg.alert('系统提示', '请选择一条数据！');
								return;
							}
							Ext.MessageBox.confirm('删除提示', '是否确定删除缴款号为<strong> ' + 
									records[0].get('pay_code') +' </strong>等凭证？', function(c) {
								if (c == "yes") {
									deleteVoucher(records);
								}
							});
						}
					}];
			var queryItems = [{
						title : '查询条件',
						id : 'PayableVoucherQuery',
						bodyPadding : 5,
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
									id : 'cfm_dateb',
									fieldLabel : '确认日期',
									xtype : 'datefield',
									dataIndex : 'cfm_date',
									format : 'Ymd',
									symbol : '>=',
									style : 'margin-left:5px;margin-right:5px;'
								}, {
									id : 'cfm_datee',
									fieldLabel : '至',
									xtype : 'datefield',
									dataIndex : 'cfm_date ',
									format : 'Ymd',
									symbol : '<=',
									maxValue : new Date(),
									style : 'margin-left:5px;margin-right:5px;'
								}, {
									id : "payCode",
									fieldLabel : '缴款码',
									xtype : 'textfield',
									dataIndex : 'pay_code',
									style : 'margin-left:5px;margin-right:5px;'
								},{
									id : "payAcctNo",
									fieldLabel : '缴款人账号',
									xtype : 'textfield',
									dataIndex : 'pay_account_no',
									style : 'margin-left:5px;margin-right:5px;'
								},{
									id : "payAcctName",
									fieldLabel : '缴款人名称',
									xtype : 'textfield',
									dataIndex : 'pay_account_name',
									style : 'margin-left:5px;margin-right:5px;'
								}]
						 	},{
								title : '支付凭证列表',
								selType : 'checkboxmodel',
								selModel : {
									mode : 'multi',
									checkOnly : true
							}
					},gridPanel1];
			Ext.StatusUtil.createViewport(buttonItems, queryItems, function() {
						Ext.StatusUtil.initPage(Ext.getCmp("admdiv"), Ext
										.getCmp("taskState"));
						// 默认设置为未生成
						Ext.getCmp('taskState').setValue("001");
					});
			 Ext.getCmp("is_inter_bank").renderer = function(value){
					if(null != value){
						    if(value=="0"){
						    		value = "本行";
						    }else if(value=="1"){
						    	value = "跨行";
						    }							
					}
					return value;
				};
				 Ext.getCmp("business_type").renderer = function(value){
						if(null != value){
							    if(value=="0"){
							    		value = "未缴款";
							    }else if(value=="1"){
							    	value = "已缴款";
							    }							
						}
						return value;
					};
		});
/**
 * 控制按钮状态
 * *****************************************************************************
 */
function selectState() {
	var taskState = Ext.getCmp('taskState').getValue();
	if ("001" == taskState) {
		Ext.getCmp('cfm_dateb').setValue("").disable();
		Ext.getCmp('cfm_datee').setValue("").disable();
		Ext.getCmp('query').enable();
		Ext.getCmp('confirm').enable();
		Ext.getCmp('deleteBtn').enable();
	} else if ("002" == taskState) {
		Ext.getCmp('cfm_dateb').setValue("").enable();
		Ext.getCmp('cfm_datee').setValue("").enable();
		Ext.getCmp('query').disable();
		Ext.getCmp('confirm').disable();
		Ext.getCmp('deleteBtn').disable();
	} 
	/**
	 * 不需要再写刷新，Ext.StatusUtil.initPage中已添加了刷新
	 */
//	refreshData();
}

function refreshData() {
	gridPanel1.getStore().loadPage(1);
}

var win = null;
var serialPanel = null;
/**
 * 缴款确认
 */
function confirm() {
	var me = this;
	var records = gridPanel1.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert('系统提示', '请选择一条数据！');
		return;
	}
	if (records.length > 1) {
		Ext.Msg.alert('系统提示', '只能选中一条数据！');
		return;
	}
	if( serialPanel == null ){
		serialPanel = getGrid("/realware/nontaxLoadStatements.do", header1, fileds1, true, true,"statement");
	    serialPanel.setHeight(303);
	    serialPanel.getStore().on('beforeload', function(thiz, options) {
			beforeload(Ext.getCmp("statementQuery"), options, Ext.encode(fileds1));
			options.params["billTypeId"] = 11022;
//			//添加日期的降序排序
//			var sort = options.sorters;
//			var date_desc = {direction:'DESC',property:'trans_time'};
//			sort.push(date_desc);
//			options.sorters = sort;
		});
	};
	if( win == null ){
		win = Ext.create('PayableConfirmWindow', {
			id : 'confirmWindow2612',
			width : 770,
			height : 400,
			closeAction : 'hide',
			serialPanel:serialPanel,
			data:records
		});
	}
	win.data = records;
	//修改：查询条件根据所选而改变
//	Ext.getCmp('incomeAmount').value = records[0].get('pay_amt');
	
	/**
	 * 表单先重置一下，在对面的内容赋值，否则查询时，还是会按照上次选中的记录进行查询
	 */
	Ext.getCmp('statementQuery').getForm().reset();
	
	/**
	 * 指定控件的xtype后，就可以使用setvalue，保证lastValue和value一致
	 */
	Ext.getCmp('incomeAmount').setValue(records[0].get('pay_amt'));
	Ext.getCmp('idAdmdivCode').setValue(Ext.getCmp('admdiv').getValue());
	
	win.show();
	
    
	serialPanel.getStore().loadPage(1);
}


//查询
function query(){
	Ext.widget('window', {
		id : 'queryWin',
		title : '缴款码',
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
						        name : 'payCode',
						        xtype : 'textfield',
								width : 200,
								allowBlank : false
							},{
						        name : 'admdivCode',
						        xtype : 'hiddenfield',
								value : Ext.getCmp('admdiv').getValue()
							}],
					buttons : [{
						text : '确定',
						handler : function() {
						    var form = this.up("form");
						    if(form.isValid()){
						    	form.submit( {
									url : '/realware/nontaxQueryPayCode.do',
									method : 'POST',
									timeout : 60000,
									waitTitle : '提示',
									waitMsg : '后台正在处理中，请您耐心等候...',
									success : function(form, action) {
							    	    Ext.PageUtil.succForm(form, action);
							    	    Ext.getCmp('queryWin').close();
										refreshData();
									},
									failure : function(form, action) {
										 Ext.PageUtil.failForm(form, action)
									}
							    });
						    }					    
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



//删除非税可支付凭证
function deleteVoucher(records){
	var ids = [];
	Ext.Array.each(records,function(model) {
				ids.push(model.get("payable_voucher_id"));
			});

	Ext.Ajax.request({
			url : "/realware/removePayableById.do",
			method : 'POST',
			params : {
			    billIds : Ext.encode(ids),
				billTypeId : records[0].get("bill_type_id"),
				menu_id : Ext.PageUtil.getMenuId()
			},
			success : function(response, options) {
				Ext.Msg.alert('提示消息', response.responseText);
				gridPanel1.getStore().reload();
			},
			failure : function(response, options) {
				Ext.Msg.alert('提示消息',response.responseText); 
			}
	 });
}


