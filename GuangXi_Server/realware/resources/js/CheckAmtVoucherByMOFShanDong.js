/*******************************************************************************
 * 引入需要使用的js文件
 */
document
		.write('<scr'
				+ 'ipt type="text/javascript" src="/realware/resources/js/recommend.js"></scr'
				+ 'ipt>');

/*********************************************************************************
 * 主要用于与人行对账
 * @type 
 */


var filed = ["id","voucher_no","evoucher_type", "mof_allNum", "mof_allAmt", "receive_allNum",
		"receive_allAmt", "pay_allNum", "pay_allAmt",
		"return_allNum", "return_allAmt","notAffirm_allNum","notAffirm_allAmt","num_isSame"];
var header="凭证类型|evoucher_type|130,凭证编号|voucher_no|150,笔数|mof_allNum|50,合计金额|mof_allAmt|100,笔数|receive_allNum|50,合计金额|receive_allAmt|100,支付笔数|pay_allNum|80,"
		+"支付金额|pay_allAmt|100,退回笔数|return_allNum|80,退回金额|return_allAmt|100,未确认笔数|notAffirm_allNum|100,未确认金额|notAffirm_allAmt|100,状态|num_isSame";
var groupHeader="0|1,1|1,2|2|对方数据,4|2|本方数据,6|6|本方办理,12|1";


var filed2 = ["id","voucher_no","evoucher_type", "mof_allNum", "mof_allAmt", "receive_allNum",
		"receive_allAmt", "num_isSame","notSameReason"];
var header2="凭证类型|evoucher_type|130,凭证编号|voucher_no|150,笔数|mof_allNum|50,合计金额|mof_allAmt|100,笔数|receive_allNum|50,合计金额|receive_allAmt|100,状态|num_isSame,原因|notSameReason";
var groupHeader="0|1,1|1,2|2|对方数据,4|2|本方数据,6|1,7|1";


var filed1 = ["xcheck_result","fund_type_code","fund_type_name","bgt_type_code","bgt_type_name","sup_dep_code","sup_dep_name","agency_code","agency_name",
	       "exp_func_code","exp_func_name","pro_cat_code","pro_cat_name","agency_bank_name","agency_bank_name","set_month",
	       "plan_amt","xcheck_reason"];
var header1 = "对账结果|xcheck_result|130,资金性质编码|fund_type_code|130,资金性质名称|fund_type_name|130,预算类型编码|bgt_type_code|130,预算类型名称|bgt_type_name|130,一级预算单位编码|sup_dep_code|130,一级预算单位名称|sup_dep_name|160,"
           +"基层预算单位编码|agency_code|130,基层预算单位名称|agency_name|160,支出功能分类科目编码|exp_func_code|130,支出功能分类科目名称|exp_func_name|160,收支管理编码|pro_cat_code|130,收支管理名称|pro_cat_name|160,"
           +"零余额账号|agency_bank_name|130,零余额账号名称|agency_bank_name|160,计划月份|set_month|130,计划金额|plan_amt|130,对账不符原因|xcheck_reason|300";

var comboVtCode = Ext.create('Ext.data.Store', {
	fields : ['name', 'value'],
	data : [{
				"name" : "授权额度对账",
				"value" : "5105"
			}, {
				"name" : "支付凭证对账",
				"value" : "5201"
			}]
});

var comboVoutype = Ext.create('Ext.data.Store', {
	fields : ['name', 'value'],
	data : [{
				"name" : "授权额度对账单",
				"value" : "5105"
			}, {
				"name" : "支付凭证对账单",
				"value" : "5201"
			}, {
				"name" : "清算凭证对账单",
				"value" : "2301"
			}]
});


//列表
var printPanel = null;
var voucherPanel = null;
var selNos="";
var now;
/***
 * 界面初始化
 */
Ext.onReady(function() {
  	Ext.QuickTips.init(); 
  	var  prefix='';	

	printPanel = getGrid(loadUrl, header2, filed2, true, true,prefix,groupHeader);
  	printPanel.setHeight(document.documentElement.scrollHeight - 95);	
	Ext.create('Ext.Viewport', {
				id : 'payDailyCreateFrame',
				layout : 'fit',
				items : [Ext.create('Ext.panel.Panel', {
							tbar : [{
								xtype : 'buttongroup',
								items : [{
									
											id : 'create',
											text : '生成',
											iconCls : 'audit',
											scale : 'small',
											handler : function() {
												createVoucher();
											}
										},{
											text : '重新发送',
											iconCls : 'audit',
											scale : 'small',
											handler : function() {
												sendAgain();
											}
										},{
											text : '刷新',
											iconCls : 'refresh',
											scale : 'small',
											handler : function() {
												refreshData();
											}
										},{
											id : 'look',
											text : '查看凭证',
											iconCls : 'look',
											scale : 'small',
											handler : function() {
												selNos="";
												// 当前选中的数据
												var recordsr = printPanel.getSelectionModel().getSelection();
												if (recordsr.length !=1) {
													Ext.Msg.alert("系统提示", "请选择一条数据！");
													return;
												}else{
													
													lookVoucherDetails(recordsr);
												}
											}
										}]
							}],
							items : [{
										title : '查询区',
										items : printPanel,
										tbar : {
											id : 'checkQuery',
											xtype : 'toolbar',
											bodyPadding : 8,
											layout : 'hbox',
											defaults : {
												margins : '3 5 0 0'
											},
											items : [{
													id : 'admdiv',
													fieldLabel : '所属财政',
													xtype : 'combo',
													dataIndex : 'admdiv',
													displayField : 'admdiv_name',
													emptyText : '请选择',
													valueField : 'admdiv_code',
													labelWidth : 60,
													store : comboAdmdiv,
													editable : false,
													listeners : {
														'select' : selectAdmdiv
													}
												},{
													id : 'vouType',
													fieldLabel : '对账凭证',
													xtype : 'combo',
													dataIndex : 'vou_type',
													displayField : 'name',
													emptyText : '请选择',
													valueField : 'value',
													labelWidth : 60,
													width : 180,
													value : '5105',
													editable : false,
													store : comboVoutype,
													listeners : {
														'select' : selectState
													}
												},{
													id : 'voucherDate',
													fieldLabel : '凭证日期',
													xtype : 'datefield',
													dataIndex : 'batchreq_date',
													format : 'Y-m-d',
													labelWidth : 60,
													listeners : {
														'select' : refreshData
													}
												}],
										flex : 3
									}}]
						})]
			});
			if (comboAdmdiv.data.length > 0) {
				Ext.getCmp('admdiv').setValue(comboAdmdiv.data.getAt(0).get("admdiv_code"));
			}
			getNowDate();

});
		
		


	
	
/*******************************************************************************
 * 选择财政
 * 
 * @return
 */
function selectAdmdiv() {
	refreshData();
}


/*******************************************************************************
 * 选择对账类型
 * 
 * @return
 */
function selectState() {
	refreshData();
}


function selectVtCodeState() {

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
	
	var vtCode = Ext.getCmp('vouType').getValue();
	
	printPanel.getStore().load({
			method : 'post',
			params : {
				filedNames : JSON.stringify(filed2),
				admdivCode:admdiv,
				vouDate:vouDate,
				vtCode:vtCode
			}
	});	
}

function lookVoucherDetails(recordsr) {
	var voucher_no="";
    voucherPanel = getGrid(loadDetailUrl, header1, filed1, false, true);
	voucherPanel.getStore().load({
		method : 'post',
		params : {
			start : 0,
			pageSize : 200,
			filedNames :  JSON.stringify(filed1),
			voucher_no : recordsr[0].get("voucher_no")
		}
	});
	Ext.widget('window', {
		id : 'detailWindow',
		title : '对账明细信息',
		width : 700,
		height : 400,
		layout : 'fit',
		resizable : false,
		modal : true,
		items : [voucherPanel]
	}).show();
}


function getNowDate(){
	var myMask = new Ext.LoadMask(Ext.getBody(), {
							msg : '后台正在处理中，请稍后....',
								removeMask : true
								// 完成后移除
						});
						myMask.show();
	Ext.Ajax.request({
		url : '/realware/loadIsDayEndFlag.do',
        method: 'POST',
		timeout:180000,  //设置为3分钟
		success : function(response, options) {
		myMask.hide();
			now = response.responseText;
			Ext.getCmp("voucherDate").setValue(now);
			refreshData();
			},
		failure : function(response, options) {
			failAjax(response,myMask);
			refreshData();
		}
	})
}

/***
 * 生成
 */
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
					id : 'voucherType',
					fieldLabel : '对账凭证',
					xtype : 'combo',
					dataIndex : 'voucher_type',
					displayField : 'name',
					emptyText : '请选择',
					valueField : 'value',
					labelWidth : 60,
					width : 160,
					value : '5105',
					editable : false,
					store : comboVtCode,
					listeners : {
						'select' : selectVtCodeState
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
							//这里的URL改成山东的了 chengkai 2015-6-18 11:28:41
							url : '/realware/checkPayVoucherShanDong.do',
							method : 'POST',
							timeout : 180000, // 设置为3分钟
							params : {
								vtCode : Ext.getCmp('voucherType').getValue(),
							    vouStartDate : Todate(Ext.getCmp('vouStartDate').getValue()),
								vouEndDate : Todate(Ext.getCmp('vouEndDate').getValue()),
								admdivCode: Ext.getCmp("admdiv").getValue()
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
					myMask.hide();
					this.up('window').close();
				}

			}]
		})
	}).show();
	selectVtCodeState();	
}

/**
 * 重新发送 chengkai 2015-6-23 11:38:45
 */
function sendAgain(){
	var myMask = new Ext.LoadMask(Ext.getBody(), {
			msg : '后台正在处理中，请稍后....',
			removeMask : true // 完成后移除
		});
		Ext.widget('window', {
			id : 'createWindow3',
			title : '重新发送',
			width : 280,
			height : 220,
			layout : 'fit',
			resizable : true,
			modal : true,
			items : Ext.widget('form', {
				id : 'createForm3',
				layout : {
					type : 'vbox',
					align : 'stretch'
				},
				border : false,
				bodyPadding : 5,
				items : [{
					xtype : 'radiogroup',
					id : 'checkResult',
					fieldLabel:'人工核对',
					hideLabels:false,
					layout:'hbox',
					defaults:{
						flex:1
					},
					items:[
						{boxLabel:'核对无误',name:'checkResult',inputValue:'1',checked:true},
						{boxLabel:'核对错误',name:'checkResult',inputValue:'2'}
					]
				}],
			buttons : [{
				text : '确定',
				handler : function() {
					if (this.up('form').getForm().isValid()) {
						var recordsr = printPanel.getSelectionModel().getSelection();
						if (recordsr.length !=1) {
							Ext.Msg.alert("系统提示", "每次请选择一条数据！");
							return;
						}
						var re = recordsr[0].get("voucher_no");
						myMask.show();
						Ext.Ajax.request({
							//这里的URL改成山东的了 chengkai 2015-6-18 11:28:41
							url : '/realware/checkVoucherSendAgain.do',
							method : 'POST',
							timeout : 180000, // 设置为3分钟
							params : {
								checkVoucherID : re,
							    checkResult : Ext.getCmp('checkResult').getChecked()[0].inputValue,
								admdivCode: Ext.getCmp("admdiv").getValue()
							},
							success : function(response, options) {
								succAjax(response, myMask);
								refreshData();
								Ext.getCmp("createForm3").getForm().reset();
								Ext.getCmp("createWindow3").close();
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
	selectVtCodeState();	
}
