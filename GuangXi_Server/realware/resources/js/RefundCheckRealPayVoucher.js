/*******************************************************************************
 * 主要用于实拨退款录入
 * 
 * @type
 */

/***
 * 引入需要使用的js文件
 */
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/recommend.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/operationLog.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/ocxVoucher.js"></scr' + 'ipt>');


var voucherPanel = null;

/**
 * 数据项
 */

var fileds = ["return_reason","realpay_voucher_code", "vou_date","pay_amount", "payee_account_no",
		"payee_account_name", "payee_account_bank","payee_account_bank_no" ,"clear_account_no",
		"clear_account_name", "clear_bank_name", "exp_func_name",
		"fund_type_code", "fund_type_name", "pay_type_code", "pay_type_name",
		"pay_summary_code", "pay_summary_name", "pay_date", "print_num",
		"print_date", "task_id", "bill_type_id",
		"realpay_voucher_id", "return_reason","pb_set_mode_code","pb_set_mode_name","last_ver","ori_code"];

/**
 * 列名
 */
var header = "拨款凭证编码|realpay_voucher_code,原拨款凭证编码|ori_code,凭证日期|vou_date|100,拨款金额|pay_amount,收款行行号|payee_account_bank_no|100,银行结算方式名称|pb_set_mode_name|140,收款人账号|payee_account_no|140,收款人名称|payee_account_name|140,收款人银行|payee_account_bank|140,付款人账号|clear_account_no|140,付款人|clear_account_name,付款人开户行|clear_bank_name|140,"
		+ "功能分类|exp_func_name,资金性质编码|fund_type_code|140,资金性质|fund_type_name|140,支付方式编码|pay_type_code|140,支付方式|pay_type_name|140,用途编码|pay_summary_code|140,用途名称|pay_summary_name|140,支付日期|pay_date|140,打印次数|print_num,"
		+ "打印日期|print_date";

var winFileds = ["return_reason"].concat(fileds);

/**
 * 列名
 */
var winHeader = "退回原因|return_reason|150," + header;

/*******************************************************************************
 * 界面加载
 */
Ext.onReady(function() {
	    Ext.QuickTips.init();
        voucherPanel = getGrid("/realware/loadRealPay.do", winHeader, winFileds, true, true);
		voucherPanel.setHeight(document.documentElement.scrollHeight - 118);
		// 根据查询条件检索数据
		voucherPanel.getStore().on('beforeload', function(thiz, options) {
			beforeload(Ext.getCmp("RefundRealPayQuery"), options, Ext.encode(winFileds));
		});
		
		var buttonItems=[{
			              id : 'edit',
			              handler : function() {
				          voucherInput();
			             }
		                }, {
			              id : 'audit',
			              handler : function() {
				          voucherAudit();
			             }
		               }, 
	             	   {
			            id : 'invalid',
			            handler : function() {
				        voucherInvalidate();
			           }
		             }, {
			
			           id : 'look',
			           handler : function() {
				     	lookOCX(voucherPanel.getSelectionModel().getSelection(),"realpay_voucher_id");
			          }
		             }, {
			
			            id : 'log',
			           handler : function() {
				      taskLog(voucherPanel.getSelectionModel().getSelection(),"realpay_voucher_code");
			         }
		             }, {
			
		            	id : 'refresh',
			            handler : function() {
				        refreshData();
			         }
		            }];
		var queryItems=[{
			          title : '查询区',
			          id:'RefundRealPayQuery',
			          bodyPadding : 5,
			          layout : {
			           type : 'table',
		               columns : 4
		              },
			           items:[
			              {
							id : 'taskState',
							fieldLabel : '当前状态',
							xtype : 'combo',
							dataIndex : 'task_status',
							displayField : 'status_name',
							emptyText : '请选择',
							valueField : 'status_code',
							style : 'margin-left:5px;margin-right:5px;',
							editable : false,
							symbol:'=',
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
							style : 'margin-left:5px;margin-right:5px;',
							store : comboAdmdiv,
							editable : false
						},
						
						 {
							id : 'code',
							fieldLabel : '凭证号',
							xtype : 'textfield',
							dataIndex : 'realpay_voucher_code',
							symbol:'>=',
							style : 'margin-left:5px;margin-right:5px;'
						}, {
							id : 'codeEnd',
							fieldLabel : '至',
							labelWidth : 20,
							xtype : 'textfield',
							style : 'margin-left:5px;margin-right:5px;',
							symbol:'<=',
							dataIndex : 'realpay_voucher_code '
								
						} ,{
							id : 'vouDate',
							fieldLabel : '凭证日期',
							xtype : 'datefield',
							dataIndex : 'vou_date',
							format : 'Ymd',
							style : 'margin-left:5px;margin-right:5px;'
						}]
			           },voucherPanel];
		     Ext.StatusUtil.createViewport(buttonItems, queryItems, function() {
		     Ext.StatusUtil.initPage(Ext.getCmp("admdiv"), Ext.getCmp("taskState"));
				// 默认设置为未生成
			 Ext.getCmp('taskState').setValue("001");
			});
});

/*******************************************************************************
 * 切换状态
 * 
 * @return
 */
function selectState() {
	var taskState = Ext.getCmp('taskState').getValue();
	if ("001" == taskState) {
		Ext.StatusUtil.batchEnable("edit,audit,invalid");
		Ext.getCmp("return_reason").setVisible(false);
	} else if ("002" == taskState) {
		Ext.StatusUtil.batchDisable("edit,audit,invalid");
		Ext.getCmp("return_reason").setVisible(false);
	} else if ("007" == taskState) {
		Ext.StatusUtil.batchDisable("edit,audit,invalid");
		Ext.getCmp("return_reason").setVisible(false);
	} else {
		Ext.StatusUtil.batchEnable("edit,audit,invalid");
		Ext.StatusUtil.batchDisable("invalid");
		Ext.getCmp("return_reason").setVisible(true);
	}
}



/*******************************************************************************
 * 退款录入
 */

var inputWin = null;

var gridOrivoucher = null;

/*******************************************************************************
 * 录入
 */
function voucherInput(){
	// 弹出窗口
	if(!inputWin) {
		var h = document.documentElement.scrollHeight-10;
		// 定义凭证列表
		gridOrivoucher = getGrid("/realware/loadRealPayForInput.do", header,fileds, false, true,"top_");
		gridOrivoucher.setHeight(h*0.6);
		gridOrivoucher.setTitle("原拨款凭证");
		gridOrivoucher.getStore().on('beforeload', function(thiz, options) {
			var children = Ext.getCmp("RefundOriRealPayQuery").items.items;
			var flag = true;
			for(var i = 0; i < children.length ; i++) {
				var item = children[i];
				if(item.xtype === 'button') {
					continue;
				}
				if(!item.isHidden() && !Ext.isEmpty(item.getValue())) {
					flag = false;
					break;
				}
			}
			if(flag) {
				Ext.Msg.alert("提示信息", "请至少录入一个查询条件！");
				return false;
			}
			beforeload(Ext.getCmp("RefundOriRealPayQuery"), options, Ext.encode(fileds));
		});
		inputWin = Ext.create('Ext.window.Window', {
			id:'refundCheckWindow',
			title : '支付凭证退款录入',
			x : 100,
			y : 10,
			frame : false,
			width : 900,
			height : h*0.955,
			layout : 'fit',
			resizable : false, // 不可调整大小
			draggable : false, // 不可拖拽
			closeAction : 'hide',
			modal : true,
			items : [Ext.widget('form', {
				id:'form1',
				autoScroll: false,
				items : [{
							frame : false,
							title : '查询条件',
							id:'RefundOriRealPayQuery',
							bodyPadding : 8,
							layout : 'column',
							fieldDefaults : {
								labelAlign : 'right',
								anchor : '100%'
							},
							defaults : {
								padding:'2 5 8 5'
							},
							height : h * 0.18,
							items : [ 
							      
							      { 
						           dataIndex:'business_type',
						           xtype : 'hidden',
						           symbol:'=',
						           value:1,
						           data_type:'number',
						           hidden:true	 
						          },
						          {
						        	 dataIndex:'amount',
						        	 xtype : 'hidden',
						        	 symbol:'>',
						        	 data_type:'number',
						        	 value:0,
						        	 hidden:true
						          },
						          {
						        	 dataIndex:'send_flag',
						        	 xtype : 'hidden',
						        	 symbol:'=',
						        	 value:1,
						        	 data_type:'number',
						        	 hidden:true
						          },
						          {
						        	    id : 'admdivInput',
						        	    xtype : 'hidden',
										dataIndex : 'admdiv_code',
                                        symbol:'=',
										hidden:true
						          },
							      {
									 id : 'startDate',
									 fieldLabel : '起止时间',
									 dataIndex:'create_date',
									 labelWidth: 60,
									 xtype : 'datefield',
									 format : 'Ymd',
									 symbol:'>=',
									 maxValue : new Date(),
									 data_type:'date',
									 width : 180
									}, 
								   {
									 id : 'endDate',
									 fieldLabel : '至',
									 dataIndex:'create_date ',
									 labelWidth: 20,
									 xtype : 'datefield',
									 format : 'Ymd',
									 symbol:'<=',
									 data_type:'date',
									 maxValue : new Date(),
									 width : 140
									}, 
									{
									 id : 'payeeAcctNo',
									 fieldLabel : '收款人帐号',
									 dataIndex:'payee_account_no',
									 labelWidth: 80,
									 xtype : 'textfield',
									 symbol:'like',
									 width : 210
									}, 
									{
									 id : 'summaryName',
									 fieldLabel : '资金用途',
									 labelWidth: 70,
									 dataIndex:'pay_summary_name',
									 xtype : 'textfield',
									 symbol:'like',
									 width : 210
									}, 
									{
									 id : 'aAmount',
									 fieldLabel : '金额范围',
									 labelWidth: 60,
									 dataIndex:'pay_amount',
									 xtype : 'numberfield',
									 data_type : 'number',
									 symbol:'>=',
									 width : 180
									}, 
									{
									 id : 'eAmount',
									 fieldLabel : '至',
									 labelWidth: 20,
									 dataIndex:'pay_amount ',
									 xtype : 'numberfield',
									 data_type : 'number',
									 symbol:'<=',
									 width : 140
									}, 
									{
									 id : 'payAcctNo',
									 fieldLabel : '付款人帐号',
									 labelWidth: 80,
									 dataIndex:'pay_account_no',
									 xtype : 'textfield',
									 symbol:'like',
									 width : 210
									}, 
									{
									 id : 'voucherNo',
									 fieldLabel : '凭  证  号',
									 labelWidth: 70,
									 dataIndex:'realpay_voucher_code',
									 xtype : 'textfield',
									 symbol:'like',
									 width : 210
									}, 
									{
									    xtype : 'button',
									    height: 25,
										width: 60,
										text : '查询',
										handler : function() {
											refreshQuery(gridOrivoucher);
										}
									}]
						}, gridOrivoucher,{
							xtype : 'panel',
							bbar : {
								dock : 'fit',
								items : [{
											id : 'refundReason',
											xtype : 'textfield',
											fieldLabel : '退款原因',
											labelWidth: 60,
											width : 250
										}]
							}
						}],
				buttons : [{
					text : '确定',
					handler : function() {
						var  from1 =  this.up('form');
						//退款原因
						var refReasonStr = Ext.getCmp('refundReason').getValue();
						
						//实拨凭证id
						var payId = null;
						var records = null;
						records = gridOrivoucher.getSelectionModel().getSelection();
						if(records.length==0){
							Ext.Msg.alert("系统提示", "请选中要退款的凭证！");
							return ;
						}
						if(Ext.isEmpty(refReasonStr)){
							Ext.Msg.alert('系统提示','退款原因不能为空!');
							return ;
						}
						//实拨凭证id
						payId = records[0].get("realpay_voucher_id");				

						var myMask = new Ext.LoadMask(Ext.getBody(), {
							msg : '后台正在处理中，请稍后....',
							removeMask : true // 完成后移除
						});
						myMask.show();
						//请求后台服务
						Ext.Ajax.request({
							url : '/realware/bankSaveRefundRealPayVoucher.do',
							method : 'POST',
							timeout : 180000, 
							params : {
								payId : payId,
								refReason : refReasonStr,
								menu_id :  Ext.PageUtil.getMenuId()
							},
							success : function(response, options) {
								myMask.hide();
								Ext.Msg.alert("系统提示", "支付退款生成成功！");
								Ext.getCmp("form1").getForm().reset();
								Ext.getCmp('refundCheckWindow').hide();	
								refreshData();
							},
							failure : function(response, options) {
								myMask.hide();
								Ext.Msg.alert("系统提示",   response.responseText);
							}
						});
					}
				}, {
					text : '取消',
					handler : function() {
					    Ext.getCmp("startDate").setValue("");
					    Ext.getCmp("endDate").setValue("");
					    Ext.getCmp("payeeAcctNo").setValue("");
					    Ext.getCmp("summaryName").setValue("");
					    Ext.getCmp("aAmount").setValue("");
					    Ext.getCmp("eAmount").setValue("");
					    Ext.getCmp("payAcctNo").setValue("");
					    Ext.getCmp("voucherNo").setValue("");
						Ext.getCmp('refundCheckWindow').hide();	
						refreshData();
					}
				}]
			})]
		});
	}else{
		gridOrivoucher.getStore().removeAll();
	}
	Ext.getCmp("admdivInput").setValue(Ext.getCmp('admdiv').getValue());
	inputWin.show();
	
}

/*******************************************************************************
 * 送审
 */
function voucherAudit() {
	var records = voucherPanel.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请选中凭证信息！");
		return;
	} else {
		var jsonArray = [];
		Ext.Array.each(records, function(model) {
				jsonArray.push(model.data);
			});
		
		var myMask = new Ext.LoadMask(Ext.getBody(), {
						msg : '后台正在处理中，请稍后....',
						removeMask : true // 完成后移除
		});
		myMask.show();
		var data = Ext.encode(jsonArray);
		Ext.Ajax.request({
					url : '/realware/submitRefundrealpayVoucher.do',
					method : 'POST',
					timeout : 180000, // 设置为3分钟
					jsonData : data,
					// 提交成功的回调函数
					success : function(response, options) {
						Ext.PageUtil.succAjax(response, myMask, null,"");
						refreshData();				
					},
					// 提交失败的回调函数
					failure : function(response, options) {
						failAjax(response,myMask);
						refreshData();				
					}
				});
	}
}

/*******************************************************************************
 * 作废
 */
function voucherInvalidate() {
	var records = voucherPanel.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请选中凭证信息！");
		return;
	}
	var reqIds = []; // 凭证主键字符串
	var reqVers = []; // 凭证lastVer字符串
	Ext.Array.each(records, function(model) {
		reqIds.push(model.get('realpay_voucher_id'));
		reqVers.push(model.get('last_ver'));
	});
	var params = {
		billTypeId : records[0].get('bill_type_id'),
		billIds : Ext.encode(reqIds),
		last_vers : Ext.encode(reqVers),
		menu_id :  Ext.PageUtil.getMenuId()
	};
	var myMask = new Ext.LoadMask(Ext.getBody(), {
			msg : '后台正在处理中，请稍后....',
			removeMask : true // 完成后移除
	});
	myMask.show();
	Ext.Ajax.request({
			url : '/realware/invalidateRealPayVoucher.do',
			method : 'POST',
			timeout : 180000, // 设置为3分钟
			params : params,
			//提交成功的回调函数
			success : function(response, options) {
				succAjax(response, myMask);
				refreshData();				
			},
			// 提交失败的回调函数
			failure : function(response, options) {
				failAjax(response,myMask);
				refreshData();				
			}
		});
}


/*******************************************************************************
 * 刷新
 * 
 * @return
 */
function refreshData() {
	voucherPanel.getStore().loadPage(1);
}

/*******************************************************************************
 * 退款查询
 */
function refreshQuery(g){
	Ext.getCmp("refundReason").setValue("");
	g.getStore().load();
}


