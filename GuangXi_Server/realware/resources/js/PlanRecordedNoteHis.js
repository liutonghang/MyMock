/*******************************************************************************
 * 主要用于额度到账通知单打印
 * 
 * @type
 */

/***
 * 引入需要使用的js文件
 */
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/recommend.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/ocxVoucher.js"></scr' + 'ipt>');
	

/**
 * 列表
 */
var gridPanel1 = null;

// 是否走工作流
var isFlow = false;

/**
 * 数据项
 */
var fileds = ["plan_recorded_note_id","plan_recorded_note_code","plan_amount","agency_code","agency_name",
			"pay_bank_code","pay_bank_name","pay_account_no","pay_account_name","pay_account_bank","vou_date",
			"print_num","print_date","bgt_type_code","bgt_type_name","bill_type_id","task_id","vt_code","admdiv_code"];

/**
 * 列名
 */
var header  = "额度到账通知单|plan_recorded_note_code|110,计划金额|plan_amount|80,基层预算单位编码|agency_code|110,基层预算单位名称|agency_name|110,"
			+ "开户行编码|pay_bank_code|100,开户行|pay_bank_name|160,单位零余额账户|pay_account_no|100,"
			+"单位零余额账户名称|pay_account_name|120,单位零余额开户银行名称|pay_account_bank|140,凭证日期|vou_date|80,"
			+"预算类型编码|bgt_type_code|110,预算类型名称|bgt_type_name|140";

var gridPanel1=null;
/**
 * 界面加载
 */
Ext.onReady(function() {
	//------------------------------------------------------------------------------------
	Ext.QuickTips.init();
	// 引用工具类
	gridPanel1 = getGrid(loadUrl, header,fileds, true, true);
	store1 = getStore(loadUrl, fileds);
	var pagetool = getPageToolbar(store1);
	gridPanel1.setHeight(document.documentElement.scrollHeight - 88);
	gridPanel1.getStore().on('beforeload', function(thiz, options) {
		beforeload(Ext.getCmp("planRecordedNotePrintQuery"), options, Ext.encode(fileds));
	});
	gridPanel1.title = "额度到账通知单列表";
	
	//------------------------------------------------------------------------------------
	
	var buttonItems = [{
						//打印
				    	id : 'print',
						handler : function() {
							var records = gridPanel1.getSelectionModel().getSelection();
							if (records.length == 0) {
								Ext.Msg.alert("系统提示", "请至少选择一条数据！");
								return;
							}
							printVoucherAUTO(gridPanel1.getSelectionModel().getSelection(),"plan_recorded_note_id",false,records[0].get("vt_code"),printUrl,gridPanel1,'',true);
						}
				      },{
				      	id : 'refresh',
						handler : function() {
				    	  refreshData();
						}
				      }];
	var queryItems=[
	                {
	                   title : "查询区",
               	   	   id : 'planRecordedNotePrintQuery',
					   bodyPadding : 8,
					   layout : 'hbox',
					   defaults : {
						   	margins : '3 5 0 0'
					   },
					   items : [{
							id : 'agency',
							fieldLabel : '预算单位编码',
							xtype : 'textfield',
							labelWidth : 80,
							width : 190,
							dataIndex : 'agency_code'
						},{
							id : 'agency1',
							fieldLabel : '预算单位名称',
							xtype : 'textfield',
							symbol : 'like',
							labelWidth : 80,
							width : 190,
							dataIndex : 'agency_name'
						}, {
							fieldLabel : '凭证号',
							xtype : 'textfield',
							symbol : '>=',
							labelWidth : 45,
							width : 160,
							dataIndex : ' plan_recorded_note_code',
							style : 'margin-left:5px;margin-right:5px;'
						}, {
							fieldLabel : '至',
							xtype : 'textfield',
							symbol : '<=',
							labelWidth : 20,
							width : 140,
							dataIndex : 'plan_recorded_note_code',
							style : 'margin-left:5px;margin-right:5px;'
						}, {
							fieldLabel : '凭证日期',
							xtype : 'datefield',
							symbol : '>=',
							labelWidth : 60,
							width : 180,
							dataIndex : 'vou_date',
							format : 'Ymd'
						}, {
							fieldLabel : '至',
							xtype : 'datefield',
							symbol : '<=',
							labelWidth : 30,
							width : 150,
							dataIndex : ' vou_date',
							format : 'Ymd'
						}],
				flex : 2
	          }, 
	                gridPanel1];
	
	Ext.StatusUtil.createViewport(buttonItems, queryItems, function() {
		Ext.StatusUtil.initPage(Ext.getCmp("admdiv"), Ext.getCmp("taskState"));
	});
	//-----------------------------------------------------------------------------------------
});

/*******************************************************************************
 * 切换状态（初审）
 * 
 * @return
 */
function selectState() {
}

/*******************************************************************************
 * 刷新
 * 
 * @return
 */
function refreshData() {
	gridPanel1.getStore().loadPage(1);
}
