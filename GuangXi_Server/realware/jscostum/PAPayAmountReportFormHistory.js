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
					},{
						"name" : "额度汇总单(预算项目)",
						"value" : "04"
					}]
		});
	
var historyYearCombo = Ext.create('Ext.data.Store', {
			fields : ['name', 'value'],
			//xcg 2016-10-18 对应的数据库用户名为生成环境用户名
			data : [{
						"name" : "2016",
						"value" : "pbank16"
					},
					{
						"name" : "2015",
						"value" : "pbank530"
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
									      		var year = Ext.getCmp("historyDbName").getRawValue();
									      		var historyDbName = Ext.getCmp("historyDbName").getValue();
									      		var report = "";
									      		if(accountNo==null || accountNo==""){
									      			Ext.Msg.alert("系统提示", "请选择零余额账号！");
									      			return ;
									      		}
									      		if(reportType=="01"){
									      			report = "paPayAmountCollectReportOfMonthHis";
									      		}else if(reportType=="04"){
									      			report = "paPayAmountCollectReportOfMonthByDPHis";
									      		}
												var data="[{\"admdivCode\":[\"'"+admdivCode+"'\"],\"accountTypeCode\":[\"12\"],\"bankCode\":[\""+belongOrgCode+"\"],\"accountNo\":[\""+accountNo+"\"],\"historyDbName\":[\""+historyDbName+"\"],\"year\":[\""+year+"\"]}]";
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
											   },
											   {
													id : 'historyDbName',
													fieldLabel : '历史年份',
													xtype : 'combo',
													displayField : 'name',
													emptyText : '请选择',
													valueField : 'value',
													editable : false,
													value: '',
													store : historyYearCombo,
													labelWidth : 60,
													width : 150
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
}
