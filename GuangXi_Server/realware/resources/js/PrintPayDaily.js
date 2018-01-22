/*******************************************************************************
 * 主要用于日報打印
 * 
 * @type
 */

/***
 * 引入需要使用的js文件
 */
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/recommend.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/operationLog.js"></scr' + 'ipt>');
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
/**
 * 列名
 */
var fileds=["pay_daily_code","pay_amount","fund_type_code","fund_type_name","pay_bank_code","pay_type_name","pay_bank_code","pay_bank_name","create_date","print_num",
		"print_date","pay_daily_id","bill_type_id","task_id","admdiv_code","vt_code","vou_date"];
var header="汇总单号|pay_daily_code,金额|pay_amount,资金性质编码|fund_type_code,资金性质名称|fund_type_name,支付方式编码|pay_type_code,支付方式名称|pay_type_name,代理银行编码|pay_bank_code," 
		+"代理银行名称|pay_bank_name|140,凭证日期|vou_date,生成日期|create_date,打印次数|print_num,打印时间|print_date";	

/**
 * 界面加载
 */
Ext.onReady(function() {
	Ext.QuickTips.init();
	Ext.Loader.setPath('Ext', 'js/util');
	Ext.require(['Ext.PageUtil']);
	store1 = getStore(loadUrl, fileds);
	column1 = getColModel(header, fileds);
	var pagetool = getPageToolbar(store1);
	store1.on('beforeload', function(thiz, options,e) {
		var panel = Ext.ComponentQuery.query("panel[title='查询区']")[0];
		beforeload(panel, options, Ext.encode(fileds));
	});
	var buttonItems =[
                {
	              id : 'print',
	              handler : function() {
                  gridPanel1 = Ext.getCmp("printPayDailyFrame");
		          var recordsr = gridPanel1.getSelectionModel().getSelection();
		          if (recordsr.length == 0) {
			         Ext.Msg.alert("系统提示", "请选择数据！");
			         return;
		          }
		         printVoucherAUTO(gridPanel1.getSelectionModel().getSelection(),"pay_daily_id",false,recordsr[0].get("vt_code"),serverPrint,gridPanel1);	
	            }
               },{
	             id : 'look',
	
	            handler : function() {
            	 gridPanel1 = Ext.getCmp("printPayDailyFrame");
		        lookOCX(gridPanel1.getSelectionModel().getSelection(),"pay_daily_id");
	           }
              }, {
	             id : 'log',
	
	             handler : function() {
            	  
            	  gridPanel1 = Ext.getCmp("printPayDailyFrame");
		         taskLog(gridPanel1.getSelectionModel().getSelection(),"pay_daily_id");
	             }
              },{
	           id : 'refresh',
	
	         handler : function() {
		        refreshData();
	           }
            }
	      ];
	 
	   var queryItems=[
	                   {
		                title : '查询区',
			            bodyPadding : 5,
			            layout : 'column',
			            defaults : {
			            	margins : '3 10 0 0',
			            	padding : '0 3 0 3'
			            },
			            layout : {
							type : 'table',
							columns : 4
						},
			            items : [{
							id : 'taskState',
							fieldLabel : '当前状态',
							xtype : 'combo',
							dataIndex : 'task_status',
							displayField : 'status_name',
							emptyText : '请选择',
							valueField : 'status_code',
							labelWidth : 53,
							editable : false,
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
							labelWidth : 53,
							editable : false,
							store : comboAdmdiv
						}, {
							id : 'code',
							//名称凭证号改为与列'汇总单号'相一致
							fieldLabel : '汇总单号',
							xtype : 'textfield',
							dataIndex : 'pay_daily_code',
							labelWidth : 60//42
						}, {
							id : 'vouDate',
							labelWidth : 60,
							 fieldLabel : '凭证日期',
							 xtype : 'datefield',
							 format : 'Ymd',
							 dataIndex : 'vou_date'
						}],
						flex : 2},
						
						{   id : 'printPayDailyFrame',
							xtype : 'gridpanel',
							selType : 'checkboxmodel',
							height : document.documentElement.scrollHeight- 95,
							frame : false,
							enableKeyNav : true,
							multiSelect : true,
							title : '凭证列表信息',
							selModel : {
								mode : 'multi',
								checkOnly : true
							},
							features: [{
			            		ftype: 'summary'
			        		}],
							store : store1,
							columns : column1,
							loadMask : {
								msg : '数据加载中,请稍等...'
							},
							 bbar:pagetool
	                   }];
	   
	   Ext.StatusUtil.createViewport(buttonItems, queryItems, function() {
			Ext.StatusUtil.initPage(Ext.getCmp("admdiv"), Ext.getCmp("taskState"));
			// 默认设置为未生成
			Ext.getCmp('taskState').setValue("001");
			Ext.getCmp("printPayDailyFrame").setHeight(document.documentElement.scrollHeight - 86)
		});
     });  


	             
	                    
           
function print(){
	gridPanel1=Ext.getCmp("printPayDailyFrame");
	printVoucherAUTO(gridPanel1.getSelectionModel().getSelection(),"pay_daily_id",isFlow,"2206",serverPrint);
}
/***************************************************************************
 * 切换状态（打印）
 * 
 * @return
 */
function selectState(){	
}

/***************************************************************************
	 * 刷新
	 *
	 * @return
	 */
function refreshData(){
	
	Ext.getCmp("printPayDailyFrame").getStore().loadPage(1);
}
		