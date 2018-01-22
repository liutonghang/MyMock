/***
 * 主要用于请款单打印
 * @type 
 */

/**
 * 数据项
 */
var fileds = ["pay_voucher_code","advance_account_no","advance_account_name","pay_amount","print_num","writeoff_date","pay_account_no",
	"pay_account_name","batch_no","writeoff_voucher_id"]; // 数据项

/**
 * 列名
 */
var header = "凭证号|pay_voucher_code,垫支户账号|advance_account_no|180,垫支户名称|advance_account_name|180,金额|pay_amount|100,打印次数|print_num,"
		+ "冲销时间|writeoff_date|140,付款人账号|pay_account_no,付款人名称|pay_account_name|140,"
		+ "批次号|batch_no";


		
//列表
var printPanel = null;

/***
 * 界面初始化
 */
Ext.onReady(function() {
  	Ext.QuickTips.init(); 
  	printPanel = getGrid("/realware/loadWriteoffVoucher.do", header, fileds, true, true);
	printPanel.setHeight(document.documentElement.scrollHeight - 100);
	// 根据查询条件检索数据
	printPanel.getStore()
				.on('beforeload', function(thiz, options) {
					var panel = Ext.ComponentQuery.query("panel[title='查询区']")[0];
					beforeload(panel, options, Ext.encode(fileds));
	});
	
	var buttonItems = [{
						id:'collectPrint',
						handler : function() {
							var bill_nos=null;
							// 当前选中的数据
							var records = printPanel.getSelectionModel().getSelection();
							if (records.length <1) {
								Ext.Msg.alert("系统提示", "请至少选择一条数据！");
								return;
							}
							else{
								// 选中的凭证的id数组，要传到后台
								for (var i = 0; i < records.length; i++) {
									bill_nos=bill_nos+records[i].get("writeoff_voucher_id")+",";
								}
								bill_nos.substring(0,bill_nos.length-1);
								var admdiv_code = Ext.getCmp('admdiv').getValue();
								var data="[{\"admdiv_code\":[\""+admdiv_code+"\"]," 
											+"\"writeoff_voucher_id\":[\""+bill_nos+"\"]}]";
								WQGridPrintDialog(bill_nos,printSucURL,loadGrfURL,loadDataURL,
										reportName,
										reportName2,data,210);
							}
						}
					}, {
						id : 'refresh',
						handler : function() {
							refreshData();
						}
					}];
	var queryItems = [{
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
									displayField : 'status_name',
									dataIndex : 'task_status',
									emptyText : '请选择',
									valueField : 'status_code',
									labelWidth : 60,
									editable : false
								}, 	{
									id : 'admdiv',
									fieldLabel : '所属财政',
									xtype : 'combo',
									dataIndex : 'admdiv_code',
									displayField : 'admdiv_name',
									emptyText : '请选择',
									valueField : 'admdiv_code',
									editable : false,
									labelWidth : 60,
									store : comboAdmdiv
							   }, {
									id : 'writeoffDate',
									fieldLabel : '冲销日期',
									xtype : 'datefield',
									dataIndex : 'writeoff_date',
									format : 'Ymd',
									labelWidth : 53													
						}],
						flex : 2
					}, printPanel];
	Ext.StatusUtil.createViewport(buttonItems, queryItems, function() {
		Ext.StatusUtil.initPage(Ext.getCmp("admdiv"), Ext.getCmp("taskState"));
		// 默认设置为未生成
		Ext.getCmp('taskState').setValue("001");
	});
});
		
		
/*******************************************************************************
 * 查詢
 * 
 * @return
 */
function refreshData() {
	printPanel.getStore().loadPage(1);
}


function WQGridPrintDialog(bill_no,printSucURL,loadGrfURL,loadDataURL,reportcodeW,reportcodeQ,data,h){
	Ext.widget('window',{
		id : 'gridprint',
		title : '打印功能提示框',
		width : 280,
		height : h,
		layout : 'fit',
		resizable : false,
		modal : true,
		items :[Ext.widget('form', {
				renderTo : Ext.getBody(),
				layout : {
					type : 'absolute',
					padding : 20
				},
				resizable : false,
				modal : true,
				bodyPadding: 10,
				items:[
				{	
					xtype: 'button',
					text : '请款打印',
					height: 25,
					width: 60,
					x:50,
					y:20,
					handler : function(){
						PrintReport(loadGrfURL,loadDataURL,reportcodeQ,data);
					}
				},	
				{	
					xtype: 'button',
					text : '冲销打印',
					height: 25,
					width: 60,
					x:50,
					y:75,
					handler : function(){
						PrintReport(loadGrfURL,loadDataURL,reportcodeW,data);
					}
				},	
				{
					xtype:'button',
					text : '打印成功',
					height: 25,
					width: 60,
					x: 50,
					y:130,
					handler : function(){
						if(bill_no!='undefined'&&printSucURL!='undefined'){
							Ext.Ajax.request({
								url : printSucURL,
								waitMsg : '后台正在处理中,请稍后....',
								method : 'POST',
								timeout : 180000, // 设置为3分钟
								async : false,// 添加该属性即可同步
								params : {
									billnos : bill_no,
									menu_id :  Ext.PageUtil.getMenuId()
								},
								success : function(response, options) {
									response.responseText ="更新打印次数成功";
									succAjax(response, null);
									refreshData();
									Ext.getCmp('gridprint').close();
								},
								failure : function(response, options) {
									failAjax(response, null);
									refreshData();
								}
							});
						}
					}
				},{
					xtype: 'button',
					text : '请款预览',
					height: 25,
					width: 60,
					x:150,
					y:20,
					handler : function(){
						PreViewReport(loadGrfURL,loadDataURL,reportcodeQ,data);
					}
					
				},{
					xtype: 'button',
					text : '冲销预览',
					height: 25,
					width: 60,
					x:150,
					y:75,
					handler : function(){
						PreViewReport(loadGrfURL,loadDataURL,reportcodeW,data);
					}
					
				},{
					xtype: 'button',
					text : '取消',
					height: 25,
					width: 60,
					x:150,
					y:130,
					handler : function(){
						this.up('window').close();
					}
				}]})	
				]	
	}).show();
	
}

