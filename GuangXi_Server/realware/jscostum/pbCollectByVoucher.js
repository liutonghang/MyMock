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
									      			report = "pbCollectByVoucherOfMonth";
									      		}else if(reportType=="02"){
									      			var quarter = Ext.getCmp("quarter").getValue();
									      			if(quarter=="01"){
									      				payDate = Ext.getCmp("year").value+"01,"+Ext.getCmp("year").value+"02,"+Ext.getCmp("year").value+"03";
									      			}else if(quarter=="02"){
									      				payDate = Ext.getCmp("year").value+"04,"+Ext.getCmp("year").value+"05,"+Ext.getCmp("year").value+"06";
									      			}else if(quarter=="03"){
									      				payDate = Ext.getCmp("year").value+"07,"+Ext.getCmp("year").value+"08,"+Ext.getCmp("year").value+"09";
									      			}else if(quarter=="04"){
									      				payDate = Ext.getCmp("year").value+"10,"+Ext.getCmp("year").value+"11,"+Ext.getCmp("year").value+"12";
									      			}else{
									      				Ext.Msg.alert("系统提示", "请选择季度！");
									      				return ;
									      			}
									      			report = "pbCollectByVoucherOfQuarter";
									      		}else if(reportType=="03"){
									      			payDate = Ext.getCmp("year").value;
									      			report = "pbCollectByVoucherOfYear";
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
													id : 'quarter',
													fieldLabel : '',
													xtype : 'combo',
													dataIndex : 'quarter',
													displayField : 'name',
													emptyText : '请选择',
													valueField : 'value',
													editable : false,
													labelWidth : 60,
													store : quarterCombo	
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
						"name" : "按季度",
						"value" : "02"
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
/**
 * 季度
 */
var quarterCombo = Ext.create('Ext.data.Store', {
			fields : ['name', 'value'],
			data : [{
						"name" : "第一季度",
						"value" : "01"
					}, {
						"name" : "第二季度",
						"value" : "02"
					}, {
						"name" : "第三季度",
						"value" : "03"
					}, {
						"name" : "第四季度",
						"value" : "04"
					}]
		});


function selectReportType(){
	var reportType = Ext.getCmp("reportType").getValue();
	if(reportType =='01'){
		Ext.getCmp('quarter').setVisible(false);
		Ext.getCmp('month').setVisible(true);
	}else if(reportType =='02'){
		Ext.getCmp('quarter').setVisible(true);
		Ext.getCmp('month').setVisible(false);
	}else if(reportType =='03'){
		Ext.getCmp('quarter').setVisible(false);
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
			var month = now.substring(5,7);
			if(month =='01'||month =='02'||month =='03'){
				Ext.getCmp("quarter").setValue('01')
			}else if(month =='04'||month =='05'||month =='06'){
				Ext.getCmp("quarter").setValue('02')
			}else if(month =='07'||month =='08'||month =='09'){
				Ext.getCmp("quarter").setValue('03')
			}else if(month =='10'||month =='11'||month =='12'){
				Ext.getCmp("quarter").setValue('04')
			}
		},
		failure : function(response, options) {
			failAjax(response,myMask);

		}
	})
}
