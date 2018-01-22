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
               "voucher_check_id", "child_pack_num", "all_amt", "all_num","downNum", "begin_date", "end_date", 
               "send_flag", "check_result", "diff_num", "back_vt_code","check_result_desc","last_ver"];
/**
 * 明细单数据项
 */
var detailFields = ["str_voucher_id", "tran_detail_id", "voucher_no", "voucherCheckNo", "admdiv_code", "vou_date", 
               "vt_code", "check_voucher_id", "year", "all_amt", "all_num", "begin_date", "end_date", "check_detail_id", 
               "send_flag", "check_result", "check_reason", "back_vt_code","month","sup_dep_name","exp_func_name",
               "payee_acct_no", "payee_acct_name", "payee_acct_bank_name", "payAmt", "agency_code", "agency_name","check_result_desc"];

/**
 * 主单列名
 */

var mainHeader = "凭证日期|vou_date|100,对账请求单号|voucher_check_no|160,对账结果|check_result_desc|100,不符笔数|diff_num|80," +
		"总金额|all_amt|120,总笔数|all_num|80,子包总数|child_pack_num|80,已下载包数|downNum|80,对账起始日期|begin_date|120,对账结束日期|end_date|120";
/**
 * 明细单列名
 */

var detailHeader = "对账单号|voucherCheckNo|100,基层预算单位|agency_name|200,功能科目|exp_func_name|140,对账结果|check_result_desc|100,不符原因|check_reason|140,支付金额|payAmt|120";

/**
 * 主单列表
 */
var mainPanel = null;

/**
 * 明细单列表
 */
var detailPanel = null;

var comboStore = Ext.create('Ext.data.Store', {
	fields : ['name', 'value'],
	data : [{
				"name" : "待对账",
				"value" : "000"
			},{
				"name" : "已对账",
				"value" : "001"
			}]
});

var comboVtCode = Ext.create('Ext.data.Store', {
	fields : ['name', 'value'],
	data : [{
				"name" : "授权额度对账请求(5501)",
				"value" : "5501"
			}, {
				"name" : "支付明细对账请求(5502)",
				"value" : "5502"
			}, {
				"name" : "支付凭证对账请求(5503)",
				"value" : "5503"
			}]
});


var comboStoreResult = Ext.create('Ext.data.Store', {
fields : ['id', 'name'],
data : [{
		"name" : "全部",
		"id" : ""
	}, {
		"name" : "相符",
		"id" : "0"
	}, {
		"name" : "不符",
		"id" : "1"
	}]
});

//列表
var selNos="";
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
  	mainPanel.setHeight(document.documentElement.scrollHeight - 95);
	// 根据查询条件检索数据
  	mainPanel.getStore().on('beforeload', function(thiz, options) {
		beforeload(Ext.getCmp("checkQuery"), options, Ext.encode(mainFields));
	});
  	
  	var buttonItems = [{
						id : 'check',
						handler : function(){
							check();
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
							createVoucher();
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
								width : 240,
								editable : false,
								store : comboVtCode,
								value : '5501'
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
		Ext.getCmp('taskState').setValue("000");
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

//	var record = mainPanel.getSelectionModel().getSelection();
//	if (record.length != 1) {
//		Ext.Msg.alert("系统提示", "请至少选择一条数据！");
//		return;
//	}
//	
//	detailPanel = getGrid(loadListUrl, detailHeader, detailFields, false, true,"v_");
//	detailPanel.getStore().on('beforeload', function(thiz, options) {
////		var conditions = "[{\"operation\":\"and\",\"attr_code\":\"check_voucher_id\",\"relation\":\"=\",\"value\":\""+record.get('check_voucher_id')+"\",\"datatype\":0,\"type\":0}]";
//					
//		if (null == options.params || options.params == undefined) {
//			options.params = [];
//		}
//		var data = "";
//		var jsonMap = "[{";
//		var jsonStr = [];
//		jsonStr[0] = "=";
//		jsonStr[1] = record[0].get('voucher_check_id');
//		jsonMap = jsonMap + "\"voucher_check_id\":" + Ext.encode(jsonStr);
//		data = jsonMap + "}]";
//		options.params["fieldNames"] = Ext.encode(detailFields);
//		options.params["jsonMap"] = data;
//	});
//	detailPanel.getStore().load({
//				method : 'post',
//				params : {
//					start : 0,
//					pageSize : 200,
//					limit : 25
//				}
//			});
//	Ext.widget('window', {
//				id : 'voucherWindow',
//				title : '支付凭证信息',
//				width : 700,
//				height : 400,
//				layout : 'fit',
//				resizable : false,
//				modal : true,
//				items : [detailPanel]
//			}).show();
}

/*******************************************************************************
 * 查詢
 * 
 * @return
 */
function refreshData() {
	mainPanel.getStore().loadPage(1);
}

function check(){
	// 当前选中的数据
	var records = mainPanel.getSelectionModel().getSelection();
	
	var ids = [];
	var lastVers = [];
	var checkflag = true;
	var notCheckRes = "";
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请至少选择一条数据！");
		return;
	}else{
		Ext.Array.each(records, function(model) {
			ids.push(model.get("voucher_check_id"));
			lastVers.push(model.get("last_ver"));
			
			if(model.get("child_pack_num")!=model.get("downNum")){
				checkflag = false;
				notCheckRes = "对账包号【"+model.get("voucher_check_no")+"】未下载完成";
				return false;
			}
			
		});
	}
	if(checkflag==false){
		Ext.Msg.alert("系统提示", notCheckRes);
		return;
	}
	
	
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
		url : 'checkAmtVoucher.do',
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

function createVoucher(){
	var myMask = new Ext.LoadMask(Ext.getBody(), {
			msg : '后台正在处理中，请稍后....',
			removeMask : true // 完成后移除
	});
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
					value : '5501',
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
							: ""
				},{
				id : 'vouStartDate',
				fieldLabel : '起始日期',
				xtype : 'datefield',
				dataIndex : 'start_date',
				format : 'Y-m-d',
				labelWidth : 85
			},{
				id : 'vouEndDate',
				fieldLabel : '截止日期',
				xtype : 'datefield',
				dataIndex : 'end_date',
				format : 'Y-m-d',
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
						myMask.show();
						Ext.Ajax.request({
							url : '/realware/createXMLFrom.do',
							method : 'POST',
							timeout : 180000, // 设置为3分钟
							params : {
								vtCode : Ext.getCmp('voucherType2').getValue(),
							    vouStartDate : Todate(Ext.getCmp('vouStartDate').getValue()),
								vouEndDate : Todate(Ext.getCmp('vouEndDate').getValue()),
								admdivCode: Ext.getCmp("admdiv1").getValue()
							},
							success : function(response, options) {
								succAjax(response, myMask);
								refreshData();
								Ext.getCmp("createForm2").getForm().reset();
								Ext.getCmp("createWindow2").close();
								var fileName = encodeURI(encodeURI(response.responseText));
								window.location.href = 'downloadFile.do?fileName='+fileName;
								Ext.Msg.hide();
								
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
					myMask.hide();
					this.up('window').close();
				}

			}]
		})
	}).show();
}

/*******************************************************************************
 * 切换状态（补录）
 * 
 * @return
 */
function selectState() {
	var taskState = Ext.getCmp('taskState').getValue();
	if ("000" == taskState) {//待对账
		Ext.getCmp('check').setDisabled(false);
		Ext.getCmp('showDetails').setDisabled(true);
	}else if("001" == taskState){//已经对账
		Ext.getCmp('check').setDisabled(true);
		Ext.getCmp('showDetails').setDisabled(false);
	}
	//refreshData();
}


function selectVtTypeState() {
	var taskState = Ext.getCmp('voucherType').getValue();
	Ext.getCmp('vouStartDate').setVisible(true);
	Ext.getCmp('vouEndDate').setVisible(true);
}


