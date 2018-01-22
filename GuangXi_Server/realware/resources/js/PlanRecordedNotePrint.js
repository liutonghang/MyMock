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
var fileds = ["plan_recorded_note_id","plan_recorded_note_code","plan_month","plan_amount","agency_code","agency_name",
			"pay_bank_code","pay_bank_name","pay_account_no","pay_account_name","pay_account_bank",
			"print_num","print_date","bgt_type_code","bgt_type_name","bill_type_id","task_id","vt_code","admdiv_code"];

/**
 * 列名
 */
var header  = "额度到账通知单|plan_recorded_note_code|110,计划月份|plan_month|70,计划金额|plan_amount|80,基层预算单位编码|agency_code|110,"
			+"基层预算单位名称|agency_name|110,开户行编码|pay_bank_code|100,开户行|pay_bank_name|160,单位零余额账户|pay_account_no|100,"
			+"单位零余额账户名称|pay_account_name|120,单位零余额开户银行名称|pay_account_bank|140,打印次数|print_num|70,打印时间|print_date,"
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
	store1 = getStore("loadRecordedNotes.do", fileds);
	var pagetool = getPageToolbar(store1);
	gridPanel1.setHeight(document.documentElement.scrollHeight - 88);
	gridPanel1.getStore().on('beforeload', function(thiz, options) {
		var admdiv = Ext.getCmp('admdiv').getValue();
		if (admdiv == null || admdiv == "")
			return false;
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
							printVoucherAUTO(gridPanel1.getSelectionModel().getSelection(),"plan_recorded_note_id",false,records[0].get("vt_code"),printUrl,gridPanel1);
						}
				      },
				      {
				      	id : 'look',
						handler : function() {
				    	  var records = gridPanel1.getSelectionModel().getSelection();
				    	  if (records.length == 0) {
								Ext.Msg.alert("系统提示", "请至少选择一条数据！");
								return;
							}
				    	  lookOCX(gridPanel1.getSelectionModel().getSelection(),"plan_recorded_note_id");
				      	}
				      },
				      {
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
									id : 'taskState',
									fieldLabel : '当前状态',
									xtype : 'combo',
									displayField : 'status_name',
									dataIndex : 'task_status',
									emptyText : '请选择',
									valueField : 'status_code',
									editable : false,
									labelWidth : 60,
									listeners : {
										'change' : selectState
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
									store : comboAdmdiv
								},{
									id : 'agency_name4',
									fieldLabel : '预算单位名称',
									xtype : 'textfield',
									symbol : 'like',
									labelWidth : 80,
									width : 190,
									dataIndex : 'agency_name'
								},{
									id : 'agency_code4',
									fieldLabel : '预算单位编码',
									xtype : 'textfield',
									labelWidth : 80,
									width : 190,
									dataIndex : 'agency_code'
								}, {
									id : 'code',
									fieldLabel : '凭证号',
									xtype : 'textfield',
									labelWidth : 45,
									width : 160,
									dataIndex : 'plan_recorded_note_code',
									symbol : '>='
								}, {
									id : 'codeEnd',
									fieldLabel : '至',
									xtype : 'textfield',
									symbol : '<=',
									labelWidth : 20,
									width : 140,
									dataIndex : 'plan_recorded_note_code '
								},{
									id : 'voucherState',
									fieldLabel : '凭证状态',
									xtype : 'combo',
									dataIndex : 'voucherflag',
									displayField : 'name',
									emptyText : '请选择',
									valueField : 'value',
									labelWidth : 60,
									hidden : true,
									editable : false,
									listeners : {
										//'select' : selectVoucherStore
									}
								}],
								flex : 2
	                }, gridPanel1];
	Ext.StatusUtil.createViewport(buttonItems, queryItems, function() {
		Ext.StatusUtil.initPage(Ext.getCmp("admdiv"), Ext.getCmp("taskState"));
		// 默认设置为未生成
		Ext.getCmp('taskState').setValue("001");
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
