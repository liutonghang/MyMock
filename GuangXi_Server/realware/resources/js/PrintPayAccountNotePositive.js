/*******************************************************************************
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
var isFlow = true;

/**
 * 数据项
 */
var fileds = ["pay_account_note_code","pay_amount","agency_code","agency_name","pay_bank_code","pay_bank_name","vou_date","print_num","voucherflag","remark","pay_account_note_id","bill_type_id","task_id","admdiv_code","vt_code"];

/**
 * 列名
 */
var header = "入账通知单编码|pay_account_note_code|140,支付金额|pay_amount|100,基层预算单位编码|agency_code|140,基层预算单位名称|agency_name|140,"
		+ "代理银行编码|pay_bank_code|140,代理银行名称|pay_bank_name|140,凭证日期|vou_date|140,打印次数|print_num|140,凭证状态|voucherflag|140,备注|remark|140";

		

/**
 * 界面加载
 */
Ext.onReady(function() {
	// 初始化Ext.QuickTips，启用悬浮提示
	Ext.QuickTips.init(); 
	//引用工具类
	Ext.Loader.setPath('Ext', 'js/util');
	Ext.require(['Ext.PageUtil']);
	
	//store1 = getStore(loadUrl, fileds);
	column1 = getColModel(header, fileds);
	
	store1 = getStore(loadPayAccountNoteUrl, fileds);
	var pagetool = getPageToolbar(store1);
	store1.on('beforeload', function(thiz, options,e) {
		var panel = Ext.ComponentQuery.query("panel[title='查询区']")[0];
		beforeload(panel, options, Ext.encode(fileds));
	});
	
	var buttonItems = [
	                   {
						id : 'print',
						handler : function() {
	                	   gridPanel1 = Ext.getCmp("printPayAccountNoteFrame");
							var recordsr = gridPanel1.getSelectionModel().getSelection();
							if (recordsr.length == 0) {
								Ext.Msg.alert("系统提示", "请选择数据！");
								return;
							}
							printVoucherAUTO(gridPanel1.getSelectionModel().getSelection(),"pay_account_note_id",isFlow,recordsr[0].get("vt_code"),serverPrint);
						}
					},{
						id : 'look',
						handler : function(){
							gridPanel1 =  Ext.getCmp("printPayAccountNoteFrame");
							lookOCX(gridPanel1.getSelectionModel().getSelection(),"pay_account_note_id");
						}
					},{
						id : 'log',
						handler : function() {
							gridPanel1 =  Ext.getCmp("printPayAccountNoteFrame");
							taskLog(gridPanel1.getSelectionModel().getSelection(),"pay_account_note_id");
						}
					},{
						id : 'refresh',
						handler : function() {
							refreshData();
						}
                 }];
		var queryItems = [{
			title : '查询区',
			bodyPadding : 5,
			layout : {
				type : 'table',
				columns : 3
			},
			items : [{
						id : 'taskState',
						fieldLabel : '当前状态',
						xtype : 'combo',
						dataIndex : 'task_status',
						displayField : 'status_name',
						emptyText : '请选择',
						valueField : 'status_code',
						editable : false,
						style : 'margin-bottom:5px;margin-top:5px;margin-left:5px;margin-right:5px;',
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
						store : comboAdmdiv
					}, {
						id : 'code',
						//将凭证号改为和列'入账通知单编码'对应
						fieldLabel : '入账通知单编码',
						xtype : 'textfield',
						dataIndex : 'code',
						style : 'margin-bottom:5px;margin-top:5px;margin-left:5px;margin-right:5px;'
					}, {
						id : 'vouDate',
						fieldLabel : '凭证日期',
						xtype : 'datefield',
						dataIndex : 'vou_date',
						format : 'Y-m-d',
						style : 'margin-bottom:5px;margin-top:5px;margin-left:5px;margin-right:5px;'
					}, {
						id : 'agency',
						fieldLabel : '预算单位编码',
						xtype : 'textfield',
						dataIndex : 'agency_code',
						style : 'margin-bottom:5px;margin-top:5px;margin-left:5px;margin-right:5px;'
					},{
						id : 'agency1',
						fieldLabel : '预算单位名称',
						xtype : 'textfield',
						dataIndex : 'agency_name',
						style : 'margin-bottom:5px;margin-top:5px;margin-left:5px;margin-right:5px;'
					}
				],
			flex : 2
		}, {
			id : 'printPayAccountNoteFrame',
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
			store : store1,
			columns : column1,
			loadMask : {
				msg : '数据加载中,请稍等...'
			},
			bbar : pagetool
		}];
		Ext.StatusUtil.createViewport(buttonItems, queryItems, function() {
			Ext.StatusUtil.initPage(Ext.getCmp("admdiv"), Ext.getCmp("taskState"));
			// 默认设置为未生成
			Ext.getCmp('taskState').setValue("001");
			Ext.getCmp("printPayAccountNoteFrame").setHeight(document.documentElement.scrollHeight - 130)
		});
	//------------------------------------------------
});

function selectAccountNoteType(){
	refreshData();
}

/***************************************************************************
 * 切换状态（打印）
 * 
 * @return
 */
function selectState() {
	var taskState = Ext.getCmp('taskState').getValue();
	if ("001" == taskState) {
		isFlow = false;
	} else {
		isFlow = false;
	}
	refreshData();
}
function selectAdmdiv() {
	setBtnVisible(Ext.getCmp("admdiv").getValue(),null);
	refreshData();
}

/***************************************************************************
 * 刷新
 *
 * @return
 */
function refreshData() {

	Ext.getCmp("printPayAccountNoteFrame").getStore().loadPage(1);
}
