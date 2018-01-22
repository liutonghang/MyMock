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
									      		var admdivCode = Ext.getCmp("admdiv").getValue();
									      		var payDate = Ext.getCmp("year").getValue();
									      		if(Ext.isEmpty(payDate)){
									      			Ext.Msg.alert("系统提示", "请输入年度");
													return ;
									      		}
												var data="[{\"payDay\":[\"'"+payDate+"'\"]," 
															+"\"admdivCode\":[\""+admdivCode+"\"]}]";
												GridPrintDialog('undefined','undefined',loadGrfURL,loadDataURL,"pbPayVoucherCollectByAdmdiv",data,100);
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
											   }, 
												  {
												id : 'year',
												fieldLabel : '年度',
												xtype : 'textfield',
												dataIndex : 'pay_voucher_code',
												symbol : '>=',
												labelWidth : 45,
												width : 100
											}],
										flex : 2
									}]
						})]
			});
			setBtnVisible(Ext.getCmp("admdiv").getValue(), Ext.getCmp("buttongroup"));

});


