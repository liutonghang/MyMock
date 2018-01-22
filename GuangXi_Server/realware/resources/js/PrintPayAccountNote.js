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
var fileds = ["pay_account_note_code","pay_amount","agency_code","agency_name","pay_bank_code","pay_bank_name","vou_date","print_num","voucher_status", "voucher_status_des","remark","pay_account_note_id","bill_type_id","task_id","admdiv_code","vt_code","print_date"];

/**
 * 列名
 */
var header = "入账通知单编码|pay_account_note_code|180,支付金额|pay_amount|100,基层预算单位编码|agency_code|120,基层预算单位名称|agency_name|140,"
		+ "代理银行编码|pay_bank_code|90,代理银行名称|pay_bank_name|140,凭证日期|vou_date|80,打印次数|print_num|80,打印时间|print_date|130,凭证状态|voucher_status_des|140,备注|remark|140";


var comboVoucherStatus = Ext.create('Ext.data.Store', {
	fields : ['name', 'value'],
	data : [{
				"name" : "全部",
				"value" : ""
			}, {
				"name" : "本方未发送",
				"value" : "13"
			}, {
				"name" : "对方未接收",
				"value" : "0"
			}, {
				"name" : "对方接收成功",
				"value" : "1"
			}, {
				"name" : "对方接收失败",
				"value" : "2"
			}, {
				"name" : "对方签收成功",
				"value" : "3"
			}, {
				"name" : "对方签收失败",
				"value" : "4"
			}, {
				"name" : "对方已退回",
				"value" : "5"
			},{
				"name" : "已收到对方回单",
				"value" : "12"
			}]
});	

/**
 * 界面加载
 */
Ext.onReady(function() {
	// 初始化Ext.QuickTips，启用悬浮提示
	Ext.QuickTips.init(); 
	//引用工具类
	Ext.Loader.setPath('Ext', 'js/util');
	Ext.require(['Ext.PageUtil']);
	
//	store1 = getStore(loadUrl, fileds);
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
							printVoucherAUTO(gridPanel1.getSelectionModel().getSelection(),"pay_account_note_id",false,recordsr[0].get("vt_code"),serverPrint,gridPanel1);
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
			defaults : {
				margin : '5 5 5 5'
			},
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
						dataIndex : 'pay_account_note_code'
					}, {
						id : 'vouDate',
						fieldLabel : '凭证日期',
						xtype : 'datefield',
						dataIndex : 'vou_date',
						format : 'Ymd'
					}, {
						id : 'agency',
						fieldLabel : '预算单位编码',
						xtype : 'textfield',
						dataIndex : 'agency_code'
					},{
						id : 'agency1',
						fieldLabel : '预算单位名称',
						xtype : 'textfield',
						dataIndex : 'agency_name'
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
			features: [{
        		ftype: 'summary'
    		}],
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

/***************************************************************************
 * 切换状态（打印）
 * 
 * @return
 */
function selectState() {
}

/***************************************************************************
 * 刷新
 *
 * @return
 */
function refreshData() {
	Ext.getCmp("printPayAccountNoteFrame").getStore().loadPage(1);
}
