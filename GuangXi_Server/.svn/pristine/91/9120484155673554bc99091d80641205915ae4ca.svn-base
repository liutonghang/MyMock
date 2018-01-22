/***
 * 主要用于报表服务
 */
/***
 * 引入需要使用的js文件
 */
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/recommend.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/createReport.js"></scr' + 'ipt>');

/**
 * 报表类型
 */
var reportCombo = Ext.create('Ext.data.Store', {
			fields : ['name', 'value'],
			data : [{
						"name" : "额度汇总单(功能分类)",
						"value" : "01"
					}, {
						"name" : "额度明细单(功能分类)",
						"value" : "02"
					},{
						"name" : "额度注销通知书",
						"value" : "03"
					},{
						"name" : "额度汇总单(预算项目)",
						"value" : "04"
					}, {
						"name" : "额度明细单(预算项目)",
						"value" : "05"
					}]
		});
	
/**
 * 月份
 */
var monthCombo = Ext.create('Ext.data.Store', {
			fields : ['name', 'value'],
			data : [{
						"name" : "01",
						"value" : "01"
					}, {
						"name" : "02",
						"value" : "02"
					}, {
						"name" : "03",
						"value" : "03"
					}, {
						"name" : "04",
						"value" : "04"
					},{
						"name" : "05",
						"value" : "05"
					}, {
						"name" : "06",
						"value" : "06"
					}, {
						"name" : "07",
						"value" : "07"
					}, {
						"name" : "08",
						"value" : "08"
					},{
						"name" : "09",
						"value" : "09"
					}, {
						"name" : "10",
						"value" : "10"
					}, {
						"name" : "11",
						"value" : "11"
					}, {
						"name" : "12",
						"value" : "12"
					}]
		});

/**
 * 零余额账号下拉框
 */
var agencyZeroAccCombo = Ext.create('Ext.data.Store', {
	fields : ['account_no','account_name'],
	data : []
});

function getAgencyZeroAccCombo(){
	var comboAccountNo = Ext.getCmp("accountNo");
	if(agencyZeroAccCombo.data.length>0){
		return;
	}
	var myMask = new Ext.LoadMask(Ext.getBody(), {
							msg : '后台正在处理中，请稍后....',
							removeMask : true
						});
						myMask.show();
	Ext.Ajax.request({
		url : loadComBoAgencyZeroAccURL,
        method: 'POST',
		timeout:180000,  //设置为3分钟
		params : {
			admdiv_code : Ext.getCmp("admdiv").getValue()
		},
		success : function(response, options) {
			myMask.hide();
			var result = Ext.decode(response.responseText);
			comboAccountNo.store.removeAll();
			for (var i = 0; i < result.length; i++) {
				comboAccountNo.store.insert(i,[{'account_no':result[i].account_no,'account_name':result[i].account_no+'-'+result[i].account_name}]);
			}
		},
		failure : function(response, options) {
			failAjax(response,myMask);
		}
	})
}

/***
 * 界面初始化
 */
Ext.onReady(function() {
  	Ext.QuickTips.init(); 	
	Ext.create('Ext.Viewport', {
				id : 'paPayAmountReportFrame',
				layout : 'fit',
				items : [Ext.create('Ext.panel.Panel', {
							tbar : [{
								id : 'buttongroup',
								xtype : 'buttongroup',
								items : [ {
											id : 'printReport',
											text : '报表打印',
											iconCls : 'print',
											scale : 'small',
											handler : function() {
												var reportType = Ext.getCmp("reportType").getValue();
									      		var admdivCode = Ext.getCmp("admdiv").getValue();
									      		var accountNo = Ext.getCmp("accountNo").getValue();
									      		var year = Ext.getCmp("year").getValue();
									      		var month = Ext.getCmp("month").getValue();
									      		var report = "";
									      		if(accountNo==null || accountNo==""){
									      			Ext.Msg.alert("系统提示", "请选择零余额账号！");
									      			return ;
									      		}
									      		if(reportType=="01"){
									      			report = "paPayAmountCollectReportOfMonth";
									      		}else if(reportType=="02"){
									      			report = "paPayAmountDetailReportOfMonth";
									      		}else if(reportType=="03"){
									      			report = "paPayAmountCancelReportOfYear";
									      		}else if(reportType=="04"){
									      			report = "paPayAmountCollectReportOfMonthByDP";
									      		}else if(reportType=="05"){
									      			report = "paPayAmountDetailReportOfMonthByDP";
									      		}
												var data="[{\"admdivCode\":[\"'"+admdivCode+"'\"],\"accountTypeCode\":[\"12\"],\"bankCode\":[\""+belongOrgCode+"\"],\"accountNo\":[\""+accountNo+"\"],\"year\":[\""+year+"\"],\"month\":[\""+month+"\"]}]";
												GridPrintDialog('undefined','undefined',loadGrfURL,loadDataURL,report,data,100);
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
													id : 'admdiv',
													fieldLabel : '所属财政',
													xtype : 'combo',
													displayField : 'admdiv_name',
													emptyText : '请选择',
													valueField : 'admdiv_code',
													editable : false,
													labelWidth : 60,
													width : 220,
													store : comboAdmdiv,
													value : comboAdmdiv.data.length > 0 ? comboAdmdiv.data.getAt(0).get("admdiv_code") : ""
											   }, {
												   	id : 'accountNo',
													fieldLabel : '零余账号',
													xtype : 'combo',
													displayField : 'account_name',
													emptyText : '请选择',
													valueField : 'account_no',
													editable : false,
													labelWidth : 60,
													width : 320,
													store : agencyZeroAccCombo,
													listeners : {
														'select' : getAgencyZeroAccCombo
													}
											   }, {
												   	id : 'reportType',
													fieldLabel : '报表类型',
													xtype : 'combo',
													displayField : 'name',
													emptyText : '请选择',
													valueField : 'value',
													editable : false,
													labelWidth : 60,
													width : 220,
													store : reportCombo,	
													value:'01',
													listeners : {
														'select' : selectReportType
													}
											   }, {
													id : 'year',
													fieldLabel : '年度',
													xtype : 'textfield',
													format : 'yyyy',
													value: new Date().getFullYear(),
//													minLength: 4,
//													maxLength: 4,
													labelWidth : 35,
													width : 90
											   }, {
													id : 'month',
													fieldLabel : '月份',
													xtype : 'combo',
													format : 'm月',
													displayField : 'name',
													emptyText : '请选择',
													valueField : 'value',
													editable : false,
													value: new Date().getMonth()+1,
													store : monthCombo,
													labelWidth : 35,
													width : 90
											   }],
										flex : 2
									}]
						})]
			});
			selectReportType();
			var comboAccountNo = Ext.getCmp("accountNo");
			comboAccountNo.on("focus", getAgencyZeroAccCombo);
});

function selectReportType(){
	var reportType = Ext.getCmp("reportType").getValue();
	if(reportType =='01'){
		Ext.getCmp('month').setVisible(true);
	}else if(reportType =='02'){
		Ext.getCmp('month').setVisible(true);
	}else if(reportType =='03'){
		Ext.getCmp('month').setVisible(false);
	}else if(reportType =='04'){
		Ext.getCmp('month').setVisible(true);
	}else if(reportType =='05'){
		Ext.getCmp('month').setVisible(true);
	}
}
