/*******************************************************************************
 * 主要用于财政退款退款凭证复核转账
 * 
 * @type
 */

/***
 * 引入需要使用的js文件
 */
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/recommend.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/operationLog.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/ocxVoucher.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/backVoucher.js"></scr' + 'ipt>');

	

var voucherPanel = null;

/**
 * 数据项
 */
var fileds = ["pay_voucher_code", "vou_date", "pay_amount", "payee_account_no",
		"payee_account_name", "payee_account_bank", "payee_account_bank_no",
		"trans_res_msg", "pay_account_no", "pay_account_name",
		"pay_account_bank", "pay_bank_code", "pay_bank_name",
		"clear_bank_code", "clear_bank_name", "checkNo", "fund_deal_mode_code",
		"fund_deal_mode_name", "fund_type_code", "fund_type_name",
		"pay_type_code", "pay_type_name", "set_mode_code", "set_mode_name",
		"pay_summary_code", "pay_summary_name", "task_id", "pay_voucher_id",
		"bill_type_id","last_ver"];

/**
 * 列名
 */
var header = "凭证号|pay_voucher_code|140,凭证日期|vou_date|100,退款金额|pay_amount|120,收款人账号|payee_account_no,"
		+ "收款人名称|payee_account_name|140,收款人银行|payee_account_bank|140,收款行行号|payee_account_bank_no,交易结果信息|trans_res_msg,"
		+ "付款人账号|pay_account_no,付款人名称|pay_account_name|140,付款人银行|pay_account_bank|140,代理银行编码|pay_bank_code,"
		+ "代理银行名称|pay_bank_name,清算银行编码|clear_bank_code,清算银行名称|clear_bank_name,支票号|checkNo,办理方式编码|fund_deal_mode_code,"
		+ "办理方式名称|fund_deal_mode_name,资金性质编码|fund_type_code,资金性质名称|fund_type_name,支付方式编码|pay_type_code,"
		+ "支付方式名称|pay_type_name,结算方式编码|set_mode_code,结算方式名称|set_mode_name,用途编码|pay_summary_code,"
		+ "用途名称|pay_summary_name";

/*******************************************************************************
 * 状态
 */
var comboStore = Ext.create('Ext.data.Store', {
			fields : ['name', 'value'],
			data : [{
						"name" : "未支付",
						"value" : "005"
					}, {
						"name" : "已支付",
						"value" : "006"
					}, {
						"name" : "被退回",
						"value" : "008"
					}]
		});

/*******************************************************************************
 * 界面加载
 */
var clearGridPanel=null;
Ext.onReady(function(){
	voucherPanel = getGrid(loadUrl, header, fileds, true, true);
	voucherPanel.setHeight(document.documentElement.scrollHeight - 90);
	// 根据查询条件检索数据
	voucherPanel.getStore().on('beforeload', function(thiz, options) {
	  beforeload(Ext.getCmp("RefundVoucherTransferQuery"), options, Ext.encode(fileds));
	});
	
	var buttonItems = [{
		                 id : 'checkTransfer',
		                 handler : function() {
			             checkTransferPayVoucher();
		                 }
	                   },{
	                	  id : 'checkTransferABC' ,
	                	  handler : function(){
	                	 checkTransferPayVoucherForABC('/realware/checkTransferRefPayVoucher.do','PassWord');
	                   }
	                   }, 
	                   {
		                 id : 'back',
		                 handler : function() {
			             backVoucher(backUrl,voucherPanel.getSelectionModel().getSelection(),"pay_voucher_id" ,"退回财政");
		                 }
	                    }, 
                       {
		                 id : 'look',
		                 handler : function() {
			             lookOCX(voucherPanel.getSelectionModel().getSelection(),"pay_voucher_id");
		                }
	                   }, 
	                   {
		                 id : 'log',
		                 handler : function() {
			             taskLog(voucherPanel.getSelectionModel().getSelection(),"pay_voucher_code");
		                 }
	                    }, 
	                   {
		                 id : 'refresh',
		                 handler : function() {
			              refreshData();
		                }
	                  }];
	var queryItems = [{
		               id:'RefundVoucherTransferQuery',
		               title : '查询区',
		               bodyPadding : 5,
		               layout : 'hbox',
		               defaults : {
			              margins : '3 5 0 0'
		               },
		               items:[{
							id : 'taskState',
							fieldLabel : '当前状态',
							xtype : 'combo',
							dataIndex : 'task_status',
							displayField : 'status_name',
							emptyText : '请选择',
							valueField : 'status_code',
							store : comboStore,
							labelWidth : 53,
							width:140,
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
							editable : false,
							emptyText : '请选择',
							valueField : 'admdiv_code',
							labelWidth : 53,
							width: 180,
							store : comboAdmdiv
						}, {
							id:'code',
							fieldLabel : '凭证号',
							xtype : 'textfield',
							symbol:'>=',
							width: 140,
							labelWidth : 40,
							dataIndex : 'pay_voucher_code '
						}, {
							id:'codeEnd',
							fieldLabel : '至',
							xtype : 'textfield',
							symbol:'<=',
							width: 113,
							labelWidth : 10,
							dataIndex : 'pay_voucher_code'
						}, {
							id : 'vouDate',
							fieldLabel : '凭证日期',
							xtype : 'datefield',
							dataIndex : 'vou_date',
							width: 150,
							labelWidth : 53,
							format : 'Ymd'
						 }
						]},
		               voucherPanel
		               ];
	       Ext.StatusUtil.createViewport(buttonItems, queryItems, function() {
		   Ext.StatusUtil.initPage(Ext.getCmp("admdiv"), Ext.getCmp("taskState"));
			// 默认设置为未生成
			Ext.getCmp('taskState').setValue("005");
		});
});
  /*******************************************************************************
	 * 切换状态
	 * 
	 * @return
	 */
	function selectState() {
		var taskState = Ext.getCmp('taskState').getValue();
		if ("005" == taskState) {
			Ext.getCmp('checkTransfer').enable(false);
			Ext.getCmp('back').enable(false);
		} else if ("006" == taskState) {
			Ext.getCmp('checkTransfer').disable(false);
			Ext.getCmp('back').disable(false);
		} else if ("008" == taskState) {
			Ext.getCmp('checkTransfer').disable(false);
			Ext.getCmp('back').disable(false);
		} else {
			Ext.getCmp('checkTransfer').disable(false);
			Ext.getCmp('back').disable(false);
		}
	}
	/*******************************************************************************
	 * 复核转账
	 */
	function checkTransferPayVoucher() {
		var records = voucherPanel.getSelectionModel().getSelection();
		if (records.length == 0) {
			Ext.Msg.alert("系统提示", "请至少选中一条凭证信息");
			return;
		}
		var reqIds = []; // 凭证主键字符串
		var reqVers = []; // 凭证lastVer字符串
		Ext.Array.each(records, function(model) {
					reqIds.push(model.get("pay_voucher_id"));
					reqVers.push(model.get("last_ver"));
				});
		var myMask = new Ext.LoadMask(Ext.getBody(), {
			msg : '后台正在处理中，请稍后....',
			removeMask : true
				// 完成后移除
			});
		myMask.show();
		Ext.Ajax.request({
					url : '/realware/checkTransferRefPayVoucher.do',
					method : 'POST',
					timeout : 180000, // 设置为3分钟
					params : {
						// 单据类型id
						billTypeId : records[0].get("bill_type_id"),
						billIds: Ext.encode(reqIds),
						last_vers: Ext.encode(reqVers),
						accountType : accountType,
						menu_id :  Ext.PageUtil.getMenuId()
					},
					success : function(response, options) {
						succAjax(response, myMask);
						refreshData();
					},
					failure : function(response, options) {
						failAjax(response, myMask);
						refreshData();
					}
				});
	}
/*****************************************************************************
 * 农行复核转账
 */	
  function checkTransferPayVoucherForABC(url,businessType){
	  var records = voucherPanel.getSelectionModel().getSelection();
		if (records.length == 0) {
			Ext.Msg.alert("系统提示", "请至少选中一条凭证信息");
			return;
		}
		var reqIds = []; // 凭证主键字符串
		var reqVers = []; // 凭证lastVer字符串
		Ext.Array.each(records, function(model) {
					reqIds.push(model.get("pay_voucher_id"));
					reqVers.push(model.get("last_ver"));
				});
       if(businessType =='PassWord'){
			 var authForm = new Ext.FormPanel({
				id : 'authForm',
				bodyStyle:'padding:5px 5px 0 5px',
				items : [{
					id : 'majorUserCodee',
					fieldLabel : '主管代码',
					name : "majorUserCode",
					xtype : 'textfield',
					allowBlank : false
				}, {
					id : 'majorUserCodePwdd',
					fieldLabel : '主管密码',
					name : 'majorUserCodePwd',
					inputType : 'password',
					xtype : 'textfield',
					minLength : 6,
					maxLength : 6,
					allowBlank : false
				}],
				buttons : [{
					id : 'btnOK',
					text : '确定',
					handler : function(){
						var form = this.up('form').getForm();
						if(form.isValid()){
							var myMask = new Ext.LoadMask(Ext.getBody(), {
								msg : '后台正在处理中，请稍后....',
								removeMask : true
									// 完成后移除
								});
							myMask.show();
							Ext.Ajax.request({
								url : url,
								method : 'POST',
								timeout : 180000, // 设置为3分钟
								params : {
									// 单据类型id
									billTypeId : records[0].get("bill_type_id"),
									billIds: Ext.encode(reqIds),
									last_vers: Ext.encode(reqVers),
									menu_id :  Ext.PageUtil.getMenuId(),
									majorUserCode : form.findField('majorUserCode').getValue(),
							        majorUserCodePwd : form.findField('majorUserCodePwd').getValue()
								},
								success : function(response, options) {
									succAjax(response, myMask);
									refreshData();
								},
								failure : function(response, options) {
									failAjax(response, myMask);
									refreshData();
								}
							});
							this.up('form').getForm().reset();
							this.up('window').close();
						}
					}
				},{
					id : 'btnCanel',
					text : "取消",
					handler : function(){
						this.up('form').getForm().reset();
						this.up('window').close();
					}
				}]
			});
			 authWindow = Ext.widget('window', {
				title : '主管授权',
				width : 300,
				autoHeight:true,
				layout : 'fit',
				resizable : false,
				modal : true,
				items : [ authForm ]
			}).show();
		}
  }	
/*******************************************************************************
	 * 刷新
	 * 
	 * @return
	 */
	function refreshData() {
		voucherPanel.getStore().loadPage(1);
	}	
