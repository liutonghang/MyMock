/*******************************************************************************
 * 
 * 入账通知书查询打印JS
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
var header = "入账通知单编码|pay_account_note_code|180,支付金额|pay_amount|100,基层预算单位编码|agency_code|120,基层预算单位名称|agency_name|140,"
		+ "代理银行编码|pay_bank_code|90,代理银行名称|pay_bank_name|140,凭证日期|vou_date|80,凭证状态|voucherflag|140,备注|remark|140";

		

/**
 * 界面加载
 */
Ext.onReady(function() {
	// 初始化Ext.QuickTips，启用悬浮提示
	Ext.QuickTips.init(); 
	//引用工具类
	Ext.Loader.setPath('Ext', 'js/util');
	Ext.require(['Ext.PageUtil']);
	
	column1 = getColModel(header, fileds);
	
	var store1 = getStore(loadPayAccountNoteHisUrl, fileds);
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
							printVoucherAUTO(gridPanel1.getSelectionModel().getSelection(),"pay_account_note_id",false,recordsr[0].get("vt_code"),serverPrint,gridPanel1,'',true);
						}
					},{
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
				dataIndex : ' pay_account_note_code',
				style : 'margin-left:5px;margin-right:5px;'
			}, {
				fieldLabel : '至',
				xtype : 'textfield',
				symbol : '<=',
				labelWidth : 20,
				width : 140,
				dataIndex : 'pay_account_note_code',
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
			Ext.getCmp("printPayAccountNoteFrame").setHeight(document.documentElement.scrollHeight - 90);
		});
	//------------------------------------------------
});


/***************************************************************************
 * 刷新
 *
 * @return
 */
function refreshData() {
	Ext.getCmp("printPayAccountNoteFrame").getStore().loadPage(1);
}
