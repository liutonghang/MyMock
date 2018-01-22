/*******************************************************************************
 * 主要用于直接支付清算回单签章发送
 * 
 * @type
 */
/*******************************************************************************
 * 引入需要使用的js文件
 */
document
		.write('<scr'
				+ 'ipt type="text/javascript" src="/realware/resources/js/recommend.js"></scr'
				+ 'ipt>');
document
		.write('<scr'
				+ 'ipt type="text/javascript" src="/realware/resources/js/share/operationLog.js"></scr'
				+ 'ipt>');
document
		.write('<scr'
				+ 'ipt type="text/javascript" src="/realware/resources/js/share/ocxVoucher.js"></scr'
				+ 'ipt>');
document
		.write('<scr'
				+ 'ipt type="text/javascript" src="/realware/js/view/common/TextareaWindow.js"></scr'
				+ 'ipt>');

/**
 * 列表
 */
var payClearNotePanel = null;
/**
 * 数据项
 * 
 * @type
 */
var fileds = [ "pay_clear_note_id","voucher_status", "pay_clear_note_code", "pay_amount",
		"print_date", "print_num", "payee_account_no", "payee_account_name",
		"payee_account_bank", "pay_account_no", "pay_account_name",
		"pay_account_bank", "fund_type_code", "fund_type_name",
		"pay_bank_code", "pay_bank_name", "pay_bank_no", "acct_date",
		"task_id", "bill_type_id", "treCode", "finOrgCode", "admdiv_code",
		"last_ver","vou_date","voucher_status_des","voucher_status_err","print_num","print_date" ];
/**
 * 列名
 * 
 * @type
 */
var header = "凭证号|pay_clear_note_code|120,凭证状态|voucher_status_des|80,凭证日期|vou_date|80,汇总金额|pay_amount|100,处理日期|acct_date|135,收款人账号|payee_account_no,"
		+ "收款人名称|payee_account_name|140,收款人银行|payee_account_bank|140,付款人账号|pay_account_no,付款人名称|pay_account_name|140,付款人银行|pay_account_bank|140,"
		+ "国库主体代码|treCode,财政机关代码|finOrgCode,代理银行编码|pay_bank_code,代理银行名称|pay_bank_name,打印次数|print_num,打印时间|print_date,"
		+ "资金性质编码|fund_type_code,资金性质名称|fund_type_name,代理银行行号|pay_bank_no,状态说明|voucher_status_err";
var comboVoucherStore = Ext.create('Ext.data.Store', {
	fields : ['name', 'value'],
	data : [{
				"name" : "全部",
				"value" : ""
			},{
				"name" : "未发送财政",
				"value" : "14"
			},{
				"name" : "银行已退回",
				"value" : "22"
			}, {
				"name" : "财政未接收",
				"value" : "6"
			}, {
				"name" : "财政接收成功",
				"value" : "7"
			}, {
				"name" : "财政接收失败",
				"value" : "8"
			}, {
				"name" : "财政签收成功",
				"value" : "9"
			}, {
				"name" : "财政签收失败",
				"value" : "10"
			}, {
				"name" : "财政已退回",
				"value" : "11"
			}]
		});


Ext.onReady(function() {
			Ext.QuickTips.init();
			// 引用工具类
			Ext.Loader.setPath('Ext', 'js/util');
			Ext.require([ 'Ext.PageUtil' ]);
			if (payClearNotePanel == null) {
				payClearNotePanel = getGrid(loadUrl, header, fileds, true, true);
				payClearNotePanel
						.setHeight(document.documentElement.scrollHeight - 110);
				// 根据查询条件检索数据
				payClearNotePanel.getStore().on(
						'beforeload',
						function(thiz, options) {
							var admdiv = Ext.getCmp('admdiv').getValue();
							if (admdiv == null || admdiv == "")
								return;
							var panel = Ext.ComponentQuery.query("panel[title='查询区']")[0];
							beforeload(panel, options,
									Ext.encode(fileds));
						});
				payClearNotePanel.title = "直接支付汇总清算额度通知单列表";
			}
			var buttonItems = [
					{
						id : 'send',
						disabled:true,
						handler : function() {
							sendPlanClearNoteAgain();
						}
					},
					{
						id : 'lookOcx',
						handler : function() {
							lookOCX(payClearNotePanel.getSelectionModel()
									.getSelection(), "pay_clear_note_id");
						}
					}, {
						id : 'refresh',
						handler : function() {
							refreshData();
						}
					} ];
			var queryItems = [ {
					title : '查询区',
					bodyPadding : 5,
//					layout : 'hbox',
					defaults : {
						margins : '3 3 3 3'
					},
					frame : false,
					layout : {
						type : 'table',
						columns : 4
					},
					items : [ {
						id:"voucher_statusCombo",
						fieldLabel : '凭证状态',
						xtype : 'combo',
						dataIndex : 'voucher_status',
						displayField : 'name',
						emptyText : '请选择',
						valueField : 'value',
						labelWidth : 60,
						value:"",
						editable : false,
						width : 230,
						style : 'margin-bottom:0px;margin-top:5px;margin-left:5px;margin-right:5px;',
						store:comboVoucherStore,
						listeners:{
							change:selectFlagState
						}
					}, {
						id : 'admdiv',
						fieldLabel : '所属财政',
						xtype : 'combo',
						dataIndex : 'admdiv_code',
						displayField : 'admdiv_name',
						emptyText : '请选择',
						valueField : 'admdiv_code',
						labelWidth : 60,
						editable : false,
						width : 230,
						style : 'margin-bottom:0px;margin-top:5px;margin-left:5px;margin-right:5px;',
						store : comboAdmdiv
					}, {
						id : 'vouDateStart',
						fieldLabel : '凭证日期',
						xtype : 'datefield',
						symbol : '>=',
						labelWidth : 60,
						format : 'Ymd',
						width : 230,
						style : 'margin-bottom:0px;margin-top:5px;margin-left:5px;margin-right:5px;',
						dataIndex : 'vou_date'
					}, {
						id : 'vouDateEnd',
						fieldLabel : '至',
						xtype : 'datefield',
						symbol : '<=',
						labelWidth : 60,
						format : 'Ymd',
						width : 230,
						style : 'margin-bottom:0px;margin-top:5px;margin-left:5px;margin-right:5px;',
						dataIndex : 'vou_date '
					} , {
						id : 'codeStart',
						fieldLabel : '凭证号',
						xtype : 'textfield',
						symbol : '>=',
						labelWidth : 60,
						width : 230,
						style : 'margin-bottom:0px;margin-top:5px;margin-left:5px;margin-right:5px;',
						dataIndex : 'pay_clear_note_code'
					}, {
						id : 'codeEnd',
						fieldLabel : '至',
						xtype : 'textfield',
						symbol : '<=',
						labelWidth : 60,
						width : 230,
						style : 'margin-bottom:0px;margin-top:5px;margin-left:5px;margin-right:5px;',
						dataIndex : 'pay_clear_note_code '
					}]
			}, payClearNotePanel ];

			Ext.StatusUtil.createViewport(buttonItems, queryItems, function() {
				Ext.StatusUtil.initPage(Ext.getCmp("admdiv"), Ext
						.getCmp("taskState"));
			});
			 Ext.getCmp("voucher_status_des").renderer = function(value){
					if(null != value){
						value = value.replace("对方", "财政");
						value = value.replace("本方", "银行");
						    if(value=="未发送"){
						    		value = "未发送到财政";
						    }								
					}
					return value;
				};
		});

/*******************************************************************************
 * 状态下拉列表框选中事件
 */
function selectFlagState(status_code,combo, newValue, oldValue, eOpts) {
	Ext.StatusUtil.batchEnable("lookOcx");
	if(combo == '8' || combo == '10' || combo== '11'|| combo== '6'){
		Ext.StatusUtil.batchEnable("send");
	}else{
		Ext.StatusUtil.batchDisable("send");
	}
	if(combo =='14'){
		Ext.StatusUtil.batchDisable("lookOcx");
	}
	if(oldValue != undefined || initialLoad) {
		refreshData();
	}
}

function selectAdmdiv() {
	refreshData();
}

function sendPlanClearNoteAgain() {
	var me = this;
	var records = payClearNotePanel.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert('系统提示', '请至少选择一条数据！');
		return;
		}
	if(records !=null) {
		var ids = []; // 凭证主键字符串
		var lastVers = []; // 凭证lastVer字符串
		Ext.Array.each(records, function(model) {
				ids.push(model.get("pay_clear_note_id"));
				lastVers.push(model.get("last_ver"));
		});
		var params = {
			billTypeId : records[0].get("bill_type_id"),
			billIds : Ext.encode(ids),
			last_vers : Ext.encode(lastVers),
			menu_id : Ext.PageUtil.getMenuId()
		};
		var voucherflag = Ext.getCmp('voucher_statusCombo').getValue();
		if(voucherflag=='14'||voucherflag=='8'||voucherflag=='6'){//如果是【本方未发送】和【对方接受失败】，直接发送
				Ext.PageUtil.doRequestAjax(me,'/realware/sendVoucher.do',params);
		}else{ //如果是【对方签收失败】和【对方已退回】，作废在发送
				Ext.PageUtil.doRequestAjax(me,'/realware/sendVoucherAgain.do',params);
		}
	}
}

/*******************************************************************************
 * 刷新
 * 
 * @return
 */
function refreshData() {
	payClearNotePanel.getStore().loadPage(1);
}