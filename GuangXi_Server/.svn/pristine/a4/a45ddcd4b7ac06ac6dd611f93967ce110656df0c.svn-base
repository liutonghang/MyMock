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
									      		var payDate =Todate(Ext.getCmp("pay_date").getValue());
									      		var report = "";
									      		if(reportType=="01"){
									      			report = "pbPayVoucherCollectOfReqSucc";
									      		}else if(reportType=="02"){
						
									      			report = "pbPayVoucherCollectOfRefundSucc";
									      		}else if(reportType=="03"){
									      			report = "pbPayVoucherCollectOfPaySucc";
									      		}else if(reportType=="04"){
									      			report = "pbPayVoucherCollectOfPayFail";
									      		}else{
									      			report = "pbPayVoucherCollectOfRefundFail";
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
												id : 'pay_date',
												fieldLabel : '支付日期',
												xtype : 'datefield',
												dataIndex : 'pay_date',
												format : 'Y-m-d',
												labelWidth : 60,
												symbol : '=',
												width : 160,								
												data_type:'date'
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
						"name" : "支付凭证请款交易明细表",
						"value" : "01"
					}, {
						"name" : "支付凭证退款交易明细表",
						"value" : "02"
					}, {
						"name" : "支付凭证支付成功交易明细表",
						"value" : "03"
					}, {
						"name" : "支付失败交易明细表",
						"value" : "04"
					}, {
						"name" : "退款失败交易明细表",
						"value" : "05"
					}]
		});
	


function selectReportType(){

	
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
			Ext.getCmp("pay_date").setValue(now);
		},
		failure : function(response, options) {
			failAjax(response,myMask);

		}
	})
}
