/*******************************************************************************
 * 主要用于额度到账通知单查询
 * 
 * @type
 */

/***
 * 引入需要使用的js文件
 */
document.write('<scr' + 'ipt type="text/javascript" src="/realware/js/util/PageUtil.js"></scr' + 'ipt>');
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
			"pay_bank_code","pay_bank_name","pay_account_code","pay_account_name","pay_account_bank",
			"print_num","print_date","voucherflag","bgt_type_code","bgt_type_name","bill_type_id","vou_date","voucher_status_des"];

/**
 * 列名
 */
var header  = "凭证状态|voucher_status_des,额度到账通知单|plan_recorded_note_code|110,计划月份|plan_month|70,计划金额|plan_amount|80,凭证日期|vou_date,基层预算单位编码|agency_code|110,"
			+"基层预算单位名称|agency_name|110,开户行编码|pay_bank_code|70,开户行|pay_bank_name|60,单位零余额账户|pay_account_code|90,"
			+"单位零余额账户名称|pay_account_name|120,单位零余额开户银行名称|pay_account_bank|140,打印次数|print_num|70,打印时间|print_date,"
			+"预算类型编码|bgt_type_code,预算类型名称|bgt_type_name";



/**
 * 界面加载
 */
Ext.onReady(function() {
	Ext.QuickTips.init();
	if (gridPanel1==null) {
		gridPanel1 = getGrid(loadUrl, header, fileds, true, true);
//		 根据查询条件检索数据
		gridPanel1.setHeight(document.documentElement.scrollHeight - 118);
		gridPanel1.getStore().on('beforeload', function(thiz, options) {
			var panel = Ext.ComponentQuery.query("panel[title='查询区']")[0];
			beforeload(panel, options, Ext.encode(fileds));
		});
	}
	var buttonItems = [{
					id : 'look',
					handler : function() {
		                  //新增pay_amount属性并将plan_amoount属性值 设置给pay_amount
	                    var records = gridPanel1.getSelectionModel().getSelection();
	                      if(records.length > 0){
	                        for(var i = 0 ; i<records.length;i++){
	                          records[i].data.pay_amount = records[i].data.plan_amount;
	                        }
	                      }
	                    lookOCX(records,"plan_recorded_note_id");
					}
				}, {
					id : 'refresh',
					handler : function() {
						selectData();
					}
				},{
				      	id : 'againSend',
						handler : function() {
				    	  sendVoucher();
						}
				      }];
	var queryItems = [{
						title : '查询区',
						frame : false,
						defaults : {
							padding : '0 3 0 3'
						},
						layout : {
							type : 'table',
							columns : 4
						},
						bodyPadding : 5,
						items : [{
									id : 'admdiv',
									fieldLabel : '所属财政',
									xtype : 'combo',
									dataIndex : 'admdiv_code',
									displayField : 'admdiv_name',
									emptyText : '请选择',
									valueField : 'admdiv_code',
									editable : false,
									store : comboAdmdiv,
									style : 'margin-bottom:5px;margin-top:5px;margin-left:5px;margin-right:5px;'
								},
								{
										id : 'vouDate',
										fieldLabel : '凭证日期',
										xtype : 'datefield',
										dataIndex : 'vou_date',
										format : 'Y-m-d',
										style : 'margin-bottom:5px;margin-top:5px;margin-left:5px;margin-right:5px;'
									}, {
										id : 'agency',
										fieldLabel : '预算单位编码',
										symbol:'LIKE',
										xtype : 'textfield',
										dataIndex : 'agency_code',
										style : 'margin-bottom:5px;margin-top:5px;margin-left:5px;margin-right:5px;'
									},{
										id : 'agency1',
										fieldLabel : '预算单位名称',
										xtype : 'textfield',
										symbol:'LIKE',
										dataIndex : 'agency_name',
										style : 'margin-bottom:5px;margin-top:5px;margin-left:5px;margin-right:5px;'
									}],
					flex : 2
					}, gridPanel1]
		
		Ext.StatusUtil.createViewport(buttonItems, queryItems, function() {
		Ext.StatusUtil.initPage(Ext.getCmp("admdiv"), null);
		// 默认设置为未生成
		Ext.getCmp('voucherState').setValue("");
		Ext.StatusUtil.batchDisable("againSend");
	});
});


function selectAdmdiv() {
	refreshData();
}


/*******************************************************************************
 * 刷新
 * 
 * @return
 */
function refreshData() {
	gridPanel1.getStore().load();
}

function selectData(){
	var me = this;
	var jsonMap1 = '[';
	var admdiv_code = Ext.getCmp('admdiv').getValue();
	var voucher_status = Ext.getCmp('voucherState').getValue();
	var vou_date = Ext.getCmp('vouDate').getValue();
	var agency_code = Ext.getCmp('agency').getValue();
	var agency_name = Ext.getCmp('agency1').getValue();
//	var records = Ext.PageUtil.validSelect(Ext.getCmp(Ext.PageUtil.prefix + Ext.getCmp('taskState').getValue()));
	var records = gridPanel1.getSelectionModel().getSelection();
	if(records !=null){
		Ext.Array.each(records, function(model) {
			jsonMap1 += '{\'admdiv_code\':\''
							+ admdiv_code
							+ '\',\'voucher_status\':\'' + voucher_status
							+ '\',\'add_word\':\'' + model.get('add_word')
							+ '\',\'vou_date\':\''+ vou_date
							+ '\',\'agency_code\':\''+ agency_code
							+ '\',\'agency_name\':\''+ agency_name
							+ '\'},';
		});
		jsonMap1 = jsonMap1.substring(0,jsonMap1.length - 1) + ']';
		Ext.PageUtil.doRequestAjax(me,'/realware/loadRecordedNotesTest.do',jsonMap1);
	}
}
