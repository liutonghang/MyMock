/***
 * 主要用于报表服务
 * @type 
 */

/***
 * 引入需要使用的js文件
 */
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/recommend.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/createReport.js"></scr' + 'ipt>');
	

/***
 * 界面初始化
 */
Ext.onReady(function() {
  	Ext.QuickTips.init(); 	
	Ext.create('Ext.Viewport', {
				id : 'printCollectVoucherFrame',
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
									      		var payDate = "";
									      		var report = "";
									      		if(reportType=="01"){
									      			payDate = Ext.getCmp("year").value+Ext.getCmp("month").getValue();
									      			report = "pbPayVoucherCollectByAgencyOfMonth";
									      		}else if(reportType=="03"){
									      			payDate = Ext.getCmp("year").value;
									      			report = "pbPayVoucherCollectByAgencyOfYear";
									      		}
												var data="[{\"payDay\":[\"'"+payDate+"'\"]," 
															+"\"admdivCode\":[\""+admdivCode+"\"]}]";
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
													dataIndex : 'admdiv_code',
													displayField : 'admdiv_name',
													emptyText : '请选择',
													valueField : 'admdiv_code',
													editable : false,
													labelWidth : 60,
													store : comboAdmdiv,
													value : comboAdmdiv.data.length > 0
																? comboAdmdiv.data.getAt(0).get("admdiv_code") : ""
											   }, {
												   	id : 'reportType',
													fieldLabel : '报表类型',
													xtype : 'combo',
													dataIndex : 'reportType',
													displayField : 'name',
													emptyText : '请选择',
													valueField : 'value',
													editable : false,
													labelWidth : 60,
													store : reportCombo,	
													value:'01',
													listeners : {
													'select' : selectReportType
												}
											   }, {
												id : 'year',
												fieldLabel : '年度',
												xtype : 'textfield',
												dataIndex : 'pay_voucher_code',
												symbol : '>=',
												labelWidth : 45,
												width : 100
											},{
													id : 'month',
													fieldLabel : '',
													xtype : 'combo',
													dataIndex : 'month',
													displayField : 'name',
													emptyText : '请选择',
													valueField : 'value',
													editable : false,
													labelWidth : 60,
													store : monthCombo	
											   } ],
										flex : 2
									}]
						})]
			});
			setBtnVisible(Ext.getCmp("admdiv").getValue(), Ext.getCmp("buttongroup"));
			getNowDate();
			selectReportType();
});
/**
 * 报表类型
 * 
 */
var reportCombo = Ext.create('Ext.data.Store', {
			fields : ['name', 'value'],
			data : [{
						"name" : "按月份",
						"value" : "01"
					}, {
						"name" : "按年份",
						"value" : "03"
					}]
		});
	
/**
 * 月份
 * 
 */
var monthCombo = Ext.create('Ext.data.Store', {
			fields : ['name', 'value'],
			data : [{
						"name" : "1月份",
						"value" : "01"
					}, {
						"name" : "2月份",
						"value" : "02"
					}, {
						"name" : "3月份",
						"value" : "03"
					}, {
						"name" : "4月份",
						"value" : "04"
					},{
						"name" : "5月份",
						"value" : "05"
					}, {
						"name" : "6月份",
						"value" : "06"
					}, {
						"name" : "7月份",
						"value" : "07"
					}, {
						"name" : "8月份",
						"value" : "08"
					},{
						"name" : "9月份",
						"value" : "09"
					}, {
						"name" : "10月份",
						"value" : "10"
					}, {
						"name" : "11月份",
						"value" : "11"
					}, {
						"name" : "12月份",
						"value" : "12"
					}]
		});



function selectReportType(){
	var reportType = Ext.getCmp("reportType").getValue();
	if(reportType =='01'){
		
		Ext.getCmp('month').setVisible(true);
	}else if(reportType =='03'){

		Ext.getCmp('month').setVisible(false);
	}
	
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
			Ext.getCmp("year").setValue(now.substring(0,4));
			Ext.getCmp("month").setValue(now.substring(5,7));
		},
		failure : function(response, options) {
			failAjax(response,myMask);

		}
	})
}
