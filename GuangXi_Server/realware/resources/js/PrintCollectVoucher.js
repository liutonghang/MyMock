/***
 * 主要用于请款单打印
 * @type 
 */

/***
 * 引入需要使用的js文件
 */
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/recommend.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/createReport.js"></scr' + 'ipt>');
	

var filed001 = ["bill_no","pay_amt","batchreq_date","pay_account_no","pay_allnum","pay_account_bank","pay_account_name","remark","admdiv_code","vt_code","print_num","print_date","create_user_name","create_user_id","create_date"];

var header001="单号|bill_no|130,总支付金额|pay_amt|100,请款日期|batchreq_date,支付总笔数|pay_allnum,付款账号|pay_account_no|130,付款账户名称|pay_account_name|140,付款银行|pay_account_bank|140,摘要|remark,区划|admdiv_code,打印次数|print_num,打印日期|print_date,凭证类型|vt_code,创建用户|create_user_name,创建日期|create_date";


		
//列表
var printPanel = null;

/***
 * 界面初始化
 */
Ext.onReady(function() {
  	Ext.QuickTips.init(); 
  //引用工具类
	Ext.Loader.setPath('Ext', 'js/util');
	Ext.require(['Ext.PageUtil']);
  	printPanel = getGrid(loadUrl, header001, filed001, true, true);
	printPanel.setHeight(document.documentElement.scrollHeight - 95);
	// 根据查询条件检索数据
	printPanel.getStore().on('beforeload', function(thiz, options) {
				var jsonMap = "[{\"type\":[\"=\",1],";
				var taskState = Ext.getCmp('taskState').getValue();
				var admdiv = Ext.getCmp('admdiv').getValue();
				if (admdiv == null || admdiv == "")
					return;
				if ('001' == taskState) {
					var jsonStr = [];
					jsonStr[0] = "=";
					jsonStr[1] = 0;
					jsonMap = jsonMap + "\"print_num\":" + Ext.encode(jsonStr)+ ",";
				} else if ('002' == taskState) {
					var jsonStr = [];
					jsonStr[0] = ">";
					jsonStr[1] = 0;
					jsonMap = jsonMap + "\"print_num\":" + Ext.encode(jsonStr)+ ",";
				}
				var jsonStr = [];
				jsonStr[0] = "=";
				jsonStr[1] = admdiv;
				jsonMap = jsonMap + "\"admdiv_code\":" + Ext.encode(jsonStr) + ",";
				var data = jsonMap.substring(0, jsonMap.length - 1) + "}]";
				if (null == options.params || options.params == undefined) {
					options.params = [];
					options.params["jsonMap"] = data;
					options.params["filedNames"] = JSON.stringify(filed001);
				} else {
					options.params["jsonMap"] = data;
					options.params["filedNames"] = JSON.stringify(filed001);
				}
			});
	
	Ext.create('Ext.Viewport', {
				id : 'printCollectVoucherFrame',
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
											id:'collectPrint',
											text : '汇总打印',
											iconCls : 'print',
											scale : 'small',
											handler : function() {
												// 当前选中的数据
												var recordsr = printPanel.getSelectionModel().getSelection();
												if (recordsr.length <1) {
													Ext.Msg.alert("系统提示", "请选择一条数据！");
													return;
												}
												var batchreq_date=recordsr[0].get("batchreq_date");
												var admdiv_code=Ext.getCmp('admdiv').getValue();
												//var bill_no=recordsr[0].get("bill_no");
												var bill_nos="";
												for (var i = 0; i < recordsr.length; i++) {
														bill_nos=bill_nos+recordsr[i].get("bill_no")+",";
													}
												bill_nos = bill_nos.substring(0,bill_nos.length-1);
												var data="[{\"admdiv_code\":[\""+admdiv_code+"\"],"
														+"\"bill_no\":[\""+bill_nos+"\"],"
														+"\"batchreq_date\":[\""+batchreq_date+"\"]}]";
												GridPrintDialog(bill_nos,printSucURL,loadGrfURL,
														loadDataURL,"CollectPayVoucher",data,160);
											}
										}, {
											id : 'refresh',
											text : '刷新',
											iconCls : 'refresh',
											scale : 'small',
											handler : function() {
												refreshData();
											}
										}]
							}],
							items : [{
										title : '查询区',
										bodyPadding : 8,
										layout : 'hbox',
										defaults : {
											margins : '3 10 0 0'
										},
										items : [{
													id : 'taskState',
													fieldLabel : '当前状态',
													xtype : 'combo',
													dataIndex : 'task_state',
													editable : false,
													displayField : 'name',
													emptyText : '请选择',
													valueField : 'value',
													labelWidth : 60,
													store : comboStore,
													listeners : {
														'select' : selectState
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
													labelWidth : 60,
													store : comboAdmdiv,
													listeners : {
														'select' : selectAdmdiv
													}
												}],
										flex : 2
									}, printPanel]
						})]
			});
			//默认设置为未打印
			Ext.getCmp('taskState').setValue("001");
			if (comboAdmdiv.data.length > 0) {
				Ext.getCmp('admdiv').setValue(comboAdmdiv.data.getAt(0).get("admdiv_code"));
			}
			setBtnVisible(Ext.getCmp("admdiv").getValue(), Ext.getCmp("buttongroup"));
			selectState();
});
		
		

/**
 * 状态下拉表框
 * 
 */
var comboStore = Ext.create('Ext.data.Store', {
			fields : ['name', 'value'],
			data : [{
						"name" : "未打印",
						"value" : "001"
					}, {
						"name" : "已打印",
						"value" : "002"
					}]
		});
	
	
/*******************************************************************************
 * 切换状态
 * 
 * @return
 */
function selectState() {
	var taskState = Ext.getCmp('taskState').getValue();
	if ("001" == taskState) {
		Ext.getCmp('create').enable(false);
	} else if ("002" == taskState) {
		Ext.getCmp('create').disable(false);
	}
	refreshData();
}

function selectAdmdiv() {
	setBtnVisible(Ext.getCmp("admdiv").getValue(), null);
	refreshData();
}

/*******************************************************************************
 * 查詢
 * 
 * @return
 */
function refreshData() {
	printPanel.getStore().loadPage(1);
}

/***
 * 生成
 */
function createVoucher(){
	var myMask = new Ext.LoadMask(Ext.getBody(), {
			msg : '后台正在处理中，请稍后....',
			removeMask : true // 完成后移除
		});
	myMask.show();
	Ext.Ajax.request({
		url : '/realware/loadIsDayEndFlag.do',
        method: 'POST',
		timeout:180000,  //设置为3分钟
		success : function(response, options) {
			myMask.hide();
			now = response.responseText;
			Ext.widget('window', {
				id : 'createWindow2',
				title : '生成',
				width : 400,
				height : 180,
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
						id : 'batchreqDate',
						fieldLabel : '请款日期',
						xtype : 'datefield',
						dataIndex : 'batchreqDate',
						format : 'Y-m-d',
						labelWidth : 85
					}, {
						id : 'remark1',
						fieldLabel : '摘要',
						xtype : 'textareafield',
						labelWidth : 85,
						height:80
					}],
					buttons : [{
						text : '确定',
						handler : function() {
							if (this.up('form').getForm().isValid()) {
								var batchreqDate = Ext.getCmp('batchreqDate').getValue();
								if (batchreqDate == null || batchreqDate == ""){
									Ext.Msg.alert("系统提示", "必须根据请款日期生成！");
									return;
								}
								myMask.show();
								Ext.Ajax.request({
									url : '/realware/saveBatchreqVoucher.do',
									method : 'POST',
									timeout : 180000, // 设置为3分钟
									params : {
										batchreq_date : batchreqDate,
										remark: Ext.getCmp("remark1").getValue(),
										isCollect:1,
										vtCode:vtCode,
										menu_id :  Ext.PageUtil.getMenuId()
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
			Ext.getCmp("batchreqDate").setValue(now);
		},
		failure : function(response, options) {
			failAjax(response, myMask);
		}
	});
	
}
