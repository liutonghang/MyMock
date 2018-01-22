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
											id : 'print',
											text : '打印',
											iconCls : 'print',
											scale : 'small',
											handler : function() {
									            var	reportcode=Ext.getCmp('reportCode').getValue();
												var admdiv_code=Ext.getCmp('admdiv').getValue();
												var data="[{\"admdiv_code\":[\""+admdiv_code+"\"],\"print_num\":[\"1\"]}]";  //\"writeoff_date\":\""+writeoffDate+"\",
												PrintReport(loadGrfURL,loadDataURL,reportcode,data);												
											}
										},{
											id : 'refresh',
											text : '预览',
											iconCls : 'refresh',
											scale : 'small',
											handler : function() {
												var reportcode=Ext.getCmp('reportCode').getValue();
												var admdiv_code=Ext.getCmp('admdiv').getValue();
												var data="[{\"admdiv_code\":[\""+admdiv_code+"\"],\"print_num\":[\"1\"]}]";  //\"writeoff_date\":\""+writeoffDate+"\",
												PreViewReport(loadGrfURL,loadDataURL,reportcode,data);
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
													id : 'reportCode',
													fieldLabel : '报表名称',
													xtype : 'combo',
													dataIndex : 'reportCode',
													displayField : 'name',
													emptyText : '请选择',
													valueField : 'value',
													value : 'chongxiao',
													editable : false,
													labelWidth : 60,
													store : comboReport	
											   } ],
										flex : 2
									}]
						})]
			});
			setBtnVisible(Ext.getCmp("admdiv").getValue(), Ext.getCmp("buttongroup"));
});

/**
 * 报表名称
 * 
 */
var comboReport = Ext.create('Ext.data.Store', {
			fields : ['name', 'value'],
			data : [{
						"name" : "冲销凭证",
						"value" : "chongxiao"
					}, {
						"name" : "请款单",
						"value" : "BatchReqVoucher"
					}, {
						"name" : "支付凭证汇总",
						"value" : "CollectPayVoucher"
					}, {
						"name" : "交易流水汇总",
						"value" : "PayFlowQuery"
					}]
		});
	

