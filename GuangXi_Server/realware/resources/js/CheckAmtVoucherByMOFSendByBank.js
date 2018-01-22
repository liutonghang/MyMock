/*******************************************************************************
 * 引入需要使用的js文件
 */
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/recommend.js"></scr'+ 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/ReportUtilForCheck.js"></scr' + 'ipt>');

/*********************************************************************************
 * 主要用于与财政对账
 * @type 
 */

/**
 * 主单数据项
 */
 
var mainFields = ["admdiv_code","year","vt_code","vou_date", "voucher_check_no", "back_voucher_no","bill_type_id", 
               "voucher_check_id", "child_pack_num", "all_amt", "all_num", "begin_date", "end_date", 
               "send_flag", "check_result", "diff_num", "back_vt_code","check_result_desc","last_ver"];
/**
 * 明细单数据项
 */
var detailFields = ["str_voucher_id", "tran_detail_id", "voucher_no", "voucher_check_no", "admdiv_code", "vou_date", 
               "vt_code", "check_voucher_id", "year", "all_amt", "all_num", "begin_date", "end_date", "check_detail_id", 
               "send_flag", "check_result", "check_reason", "back_vt_code","month","sup_dep_name","exp_func_name",
               "payee_acct_no", "payee_acct_name", "payee_acct_bank_name", "pay_amt", "agency_code", "agency_name","check_result_desc",
               "cur_auth_plan_amt","cur_auth_pay_amt","cur_auth_back_amt","cur_auth_plan_amt_sum","cur_auth_pay_amt_sum","cur_auth_back_amt_sum",
               "remain_plan_amt","cur_dir_pay_amt","cur_dir_back_amt","cur_dir_pay_amt_sum","cur_dir_back_amt_sum"
               ];

/**
 * 主单列名
 */

var mainHeader = "凭证日期|vou_date|100,对账请求单号|voucher_check_no|160,对账结果|check_result_desc|100,不符笔数|diff_num|80," +
		"总金额|all_amt|120,总笔数|all_num|80,子包总数|child_pack_num|80,对账起始日期|begin_date|120,对账结束日期|end_date|120";
/**
 * 明细单列名
 */

var detailHeader = "一级预算单位|sup_dep_name|200,功能科目|exp_func_name|140,对账结果|check_result_desc|100,不符原因|check_reason|140,支付金额|pay_amt|120";
var detailHeader2514 = "基层预算单位|agency_name|200,功能科目|exp_func_name|140,对账结果|check_result_desc|100,不符原因|checkReason|140,本期直接支付金额|cur_dir_pay_amt|120," +
						"本期下达额度金额|cur_auth_plan_amt|140,本期授权支付金额|cur_auth_pay_amt|140,本期授权支付退款金额|cur_auth_back_amt|140" +
						",累计下达额度金额|cur_auth_plan_amt_sum|140,累计授权支付金额|cur_auth_pay_amt_sum|140,累计授权支付退款金额|cur_auth_back_amt_sum|140" +
						",授权额度结余金额|remain_plan_amt|140";

/**
 * 主单列表
 */
var mainPanel = null;

/**
 * 明细单列表
 */
var detailPanel = null;
		
var comboVtCode = Ext.create('Ext.data.Store', {
	fields : ['name', 'value'],
	data : [{
				"name" : "代理银行授权额度对账(2504)",
				"value" : "2504"
			}, {
				"name" : "代理银行支付明细对账(2505)",
				"value" : "2505"
			}, {
				"name" : "代理银行支付对账(2506)",
				"value" : "2506"
			}, {
				"name" : "代理银行集中支付对账请求(2514)",
				"value" : "2514"
			}]
});

var comboStore = Ext.create('Ext.data.Store', {
	fields : ['name', 'value'],
	data : [ {
				"name" : "已生成待发送",
				"value" : "002"
			}, {
				"name" : "已发送",
				"value" : "003"
			}]
});


//列表
var selNos="";
var selIds="";
var now;
/***
 * 界面初始化
 */
Ext.onReady(function() {
  	Ext.QuickTips.init(); 
  //引用工具类
	Ext.Loader.setPath('Ext', 'js/util');
  	var  prefix='';
  	mainPanel = getGrid(loadMainUrl, mainHeader, mainFields, true, true,prefix);
  	mainPanel.setHeight(document.documentElement.scrollHeight - 100);
	// 根据查询条件检索数据
  	mainPanel.getStore().on('beforeload', function(thiz, options) {
		beforeload(Ext.getCmp("checkQuery"), options, Ext.encode(mainFields));
	});

  	var buttonItems = [{
						id : 'create',
						handler : function() {
							createVoucher();
						}
					}, {
						id : 'send',
						handler : function(){
							signSend();
						}
					}, {
						id : 'rSend',
						handler : function(){
							signSend();
						}
					},{
						id : 'del',
						handler : function() {
							selNos="";
							selIds="";
							// 当前选中的数据
							var recordsr = mainPanel.getSelectionModel().getSelection();
							if (recordsr.length <=0) {
								Ext.Msg.alert("系统提示", "请至少选择一条数据！");
								return;
							}
							else{
								// 选中的凭证的id数组，要传到后台
								for (var i = 0; i < recordsr.length; i++) {
										selNos += recordsr[i].get("voucher_check_no");
										if (i < recordsr.length - 1)
										selNos += ",";
										selIds += recordsr[i].get("voucher_check_id");
										if (i < recordsr.length - 1)
										selIds += ",";
										
								}
								Ext.MessageBox.confirm('', '是否确定删除单号为'+selNos+'等数据？', deleteBatchVoucher);
							}
						}
					},{
						id : 'showDetails',
						handler : function(){
							showDetails();
						}
					},{
						id : 'refresh',
						handler : function() {
							refreshData();
						}
					},{
						id : 'exportXML',
						handler : function() {
							exportXML();
						}
					}];
  	var queryItems = [{
					id : 'checkQuery',
					title : '查询区',
					bodyPadding : 8,
					frame : false,
					layout : 'hbox',
					defaults : {
						margins : '3 5 0 0'
					},
					items : [{
								id : 'voucherType',
								fieldLabel : '对账凭证',
								xtype : 'combo',
								dataIndex : 'vt_code',
								displayField : 'name',
								emptyText : '请选择',
								valueField : 'value',
								labelWidth : 60,
								width : 280,
								editable : false,
								store : comboVtCode,
								value : '2504'
							},{
							id : 'admdiv',
							fieldLabel : '所属财政',
							xtype : 'combo',
							dataIndex : 'admdiv_code',
							displayField : 'admdiv_name',
							emptyText : '请选择',
							valueField : 'admdiv_code',
							labelWidth : 60,
							store : comboAdmdiv,
							editable : false
						},{
							id : 'taskState',
							fieldLabel : '凭证状态',
							xtype : 'combo',
							displayField : 'status_name',
							emptyText : '请选择',
							valueField : 'status_code',
							editable : false,
							labelWidth : 70,
							queryMode : 'local',
							listeners : {
								'change' : selectState
							},
							dataIndex : 'task_status'
						},{
							id : 'voucherDate',
							fieldLabel : '凭证日期',
							xtype : 'datefield',
							dataIndex : 'vou_date',
							symbol : '=',
							format : 'Ymd',
							width : 200,
							value : new Date(),
							labelWidth : 70,
							listeners : {
								'change' : refreshData
							}
						}],
						flex : 2
				}, mainPanel];
  	Ext.StatusUtil.createViewport(buttonItems, queryItems, function() {
		Ext.StatusUtil.initPage(Ext.getCmp("admdiv"), Ext.getCmp("taskState"));
		// 默认设置为未生成
		Ext.getCmp('taskState').setValue("002");
	});
});
		
/*******************************************************************************
 * 查看凭证
 * 
 * @return
 */		
function showDetails(){
	var record = mainPanel.getSelectionModel().getSelection();
	if (record.length != 1) {
		Ext.Msg.alert("系统提示", "请至少选择一条数据！");
		return;
	}
	GridPrintDialog('/realware/loadReportByCodeForCheck.do','/realware/loadReportDataForCheck.do',record[0].get('vt_code'), record[0].get('voucher_check_id'));
}

	
	
/*******************************************************************************
 * 选择财政
 * 
 * @return
 */
function selectAdmdiv() {
	refreshData();
}

/*******************************************************************************
 * 查詢
 * 
 * @return
 */
function refreshData() {
	
	var admdiv = Ext.getCmp('admdiv').getValue();
	if (admdiv == null || admdiv == "")
		return;
	var voucherDate = Ext.getCmp('voucherDate').getValue();
	var vouDate;
	if(voucherDate==null){
		vouDate="";
	}else{
		vouDate=Todate(voucherDate);
	}
	mainPanel.getStore().load({
			method : 'post',
			params : {
				filedNames : JSON.stringify(mainFields),
				admdivCode:admdiv,
				vouDate:vouDate				
			}
	});	
}

/***
 * 生成
 */
function createVoucher(){

	Ext.widget('window', {
		id : 'createWindow2',
		title : '生成',
		width : 280,
		height : 220,
		layout : 'fit',
		resizable : true,
		modal : true,
		items : Ext.widget('form', {
			id : 'createForm2',
			layout : {
				type : 'vbox',
				align : 'stretch'
			},
			border : false,
			bodyPadding : 5,
			items : [{
					id : 'voucherType2',
					fieldLabel : '对账凭证',
					xtype : 'combo',
					dataIndex : 'voucher_type',
					displayField : 'name',
					emptyText : '请选择',
					valueField : 'value',
					labelWidth : 60,
					width : 160,
					editable : false,
					store : comboVtCode,
					value : '2504',
					listeners : {
						'select' : selectVtTypeState
					}
				}, {
					id : 'admdiv1',
					fieldLabel : '所属财政',
					xtype : 'combo',
					dataIndex : 'admdiv_code',
					displayField : 'admdiv_name',
					emptyText : '请选择',
					valueField : 'admdiv_code',
					labelWidth : 60,
					width : 160,
					editable : false,
					store : comboAdmdiv,
					value : comboAdmdiv.data.length > 0
							? comboAdmdiv.data
									.getAt(0)
									.get("admdiv_code")
							: "",
					listeners : {
						'select' : selectAdmdiv
					}
				},{
				id : 'vouStartDate',
				fieldLabel : '起始日期',
				xtype : 'datefield',
				dataIndex : 'start_date',
				format : 'Ymd',
				value : new Date(),
				labelWidth : 85
			},{
				id : 'vouEndDate',
				fieldLabel : '截止日期',
				xtype : 'datefield',
				dataIndex : 'end_date',
				format : 'Ymd',
				value : new Date(),
				labelWidth : 85
			}],
			buttons : [{
				text : '确定',
				handler : function() {
					if (this.up('form').getForm().isValid()) {
						var vouDate = null;
						var vouStartDate = null;
						var vouEndDate = null;
							if(( Ext.getCmp('vouStartDate').getValue() == null || Ext.getCmp('vouStartDate').getValue() == "")){
							Ext.Msg.alert("系统提示", "请填写起始日期！");
							return;
							}
							if(( Ext.getCmp('vouEndDate').getValue() == null || Ext.getCmp('vouEndDate').getValue() == "")){
							Ext.Msg.alert("系统提示", "请填写截止日期！");
							return;
							}
							if(Ext.getCmp('vouStartDate').getValue()>Ext.getCmp('vouEndDate').getValue()){
							Ext.Msg.alert("系统提示", "起始日期应小于截止日期！");
							return;
							}
					   var myMask = new Ext.LoadMask(this.up('window'), {
                            msg : '后台正在处理中，请稍后....',
                            removeMask : true // 完成后移除
                        });
						myMask.show();
						Ext.Ajax.request({
							url : '/realware/createCheckVoucher.do',
							method : 'POST',
							timeout : 180000, // 设置为3分钟
							params : {
								vtCode : Ext.getCmp('voucherType2').getValue(),
							    vouStartDate : Ext.getCmp('vouStartDate').getRawValue(),
								vouEndDate : Ext.getCmp('vouEndDate').getRawValue(),
								admdivCode: Ext.getCmp("admdiv1").getValue()
							},
							success : function(response, options) {
								succAjax(response, myMask);
								refreshData();
								Ext.getCmp("createForm2").getForm().reset();
								Ext.getCmp("createWindow2").close();
							},
							failure : function(response, options) {
								failAjax(response, myMask);
								refreshData();
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
		})
	}).show();
	selectVtTypeState();
}
function deleteBatchVoucher(id) {
	if(id == "yes"){
		var myMask = new Ext.LoadMask(Ext.getBody(), {
			msg : '后台正在处理中，请稍后....',
			removeMask : true // 完成后移除
		});
		myMask.show();
		// 提交到服务器操作
		Ext.Ajax.request({
				url : deleteURL,
        		method: 'POST',
				timeout:180000,  //设置为3分钟
				params : {
					ids : selIds
				},
				// 提交成功的回调函数
				success : function(response, options) {
					response.responseText = '删除成功！';
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
}
/*******************************************************************************
 * 切换状态（补录）
 * 
 * @return
 */
function selectState() {
	
	var taskState = Ext.getCmp('taskState').getValue();
   
	if("002" == taskState){//未发送
		Ext.getCmp('create').setDisabled(false);
		Ext.getCmp('send').setDisabled(false);
		Ext.getCmp('rSend').setDisabled(true);
		Ext.getCmp('del').setDisabled(false);
		Ext.getCmp('showDetails').setDisabled(true);
	}else if("003" == taskState){//已发送
		Ext.getCmp('create').setDisabled(true);
		Ext.getCmp('send').setDisabled(true);
		Ext.getCmp('rSend').setDisabled(false);
		Ext.getCmp('del').setDisabled(true);
		Ext.getCmp('showDetails').setDisabled(false);
	}
}

function selectVtTypeState() {
	var taskState = Ext.getCmp('voucherType').getValue();
	Ext.getCmp('vouStartDate').setVisible(true);
	Ext.getCmp('vouEndDate').setVisible(true);
}

function exportXML(){
	var records = mainPanel.getSelectionModel().getSelection();

	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请至少选择一条数据！");
		return;
	}
	var ids = [];
	var lastVers = [];
	var flag = false;
	Ext.Array.each(records, function(model) {
		ids.push(model.get("voucher_check_id"));
		lastVers.push(model.get("last_ver"));
	});
	var params ={
		billTypeId : records[0].get("bill_type_id"),
		billIds : Ext.encode(ids),
		last_vers : Ext.encode(lastVers),
		menu_id : Ext.PageUtil.getMenuId()
	};
	var myMask = new Ext.LoadMask(Ext.getBody(), {
		msg : '后台正在处理中，请稍后....',
		removeMask : true
			// 完成后移除
		});
	myMask.show();
	// 提交到服务器操作
	Ext.Ajax.request({
		url : 'createXML.do',
		method : 'POST',
		timeout : 180000, // 设置为3分钟
		params : params,
		// 提交成功的回调函数
		success : function(response, options) { 
		succAjax(response, myMask);	
		var fileName = response.responseText;	
			var fileName = encodeURI(encodeURI(fileName));
			window.location.href = 'downloadFile.do?fileName='+fileName;
			Ext.Msg.hide();
			
		},
		// 提交失败的回调函数
		failure : function(response, options) {
			failAjax(response,myMask);
			refreshData();
		}
	});
}


function signSend(){
	// 当前选中的数据
	var records = mainPanel.getSelectionModel().getSelection();

	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请至少选择一条数据！");
		return;
	}
	var ids = [];
	var lastVers = [];
	var flag = false;
	Ext.Array.each(records, function(model) {
		ids.push(model.get("voucher_check_id"));
		lastVers.push(model.get("last_ver"));
	});
	var params ={
		billTypeId : records[0].get("bill_type_id"),
		billIds : Ext.encode(ids),
		last_vers : Ext.encode(lastVers),
		menu_id : Ext.PageUtil.getMenuId()
	};
	var myMask = new Ext.LoadMask(Ext.getBody(), {
		msg : '后台正在处理中，请稍后....',
		removeMask : true
			// 完成后移除
		});
	myMask.show();
	// 提交到服务器操作
	Ext.Ajax.request({
		url : 'signSendCheck.do',
		method : 'POST',
		timeout : 180000, // 设置为3分钟
		params : params,
		// 提交成功的回调函数
		success : function(response, options) {
			succAjax(response,myMask);
			refreshData();
		},
		// 提交失败的回调函数
		failure : function(response, options) {
			failAjax(response,myMask);
			refreshData();
		}
	});
}
