/***
 * 退款通知书录入窗口
 * @memberOf {TypeName} 
 */
Ext.define('pb.view.pay.RefundVoucherInputWindow', {
	extend : 'Ext.window.Window',
	alias : 'widget.refundVoucherInputWindow', //别名
	layout : 'fit',
	modal : true,
	width : '100%',
	height : '100%',
	title : '退款通知书录入',
	buttonName : null,
	query : 'PUBLIC',  //查询区布局
	initComponent : function() {
		var me = this;
		var abisStore = null;
		var cashFlagStore = Ext.create('Ext.data.Store', {
			fields : ['name', 'value'],
			data : [ {
				'name' : '网点操作账户',
				'value' : '2'
			}, {
				'name' : '现金',
				'value' : '1'
			}, {
				'name' : 'ABIS91',
				'value' : '3'
			} ]
		});
		if(me.buttonName == '录入134'){
			abisStore = Ext.getStore('pay.AbisAccountNo');
			cashFlagStore = Ext.create('Ext.data.Store', {
				fields : ['name', 'value'],
				data : [ {
					'name' : '网点操作账户',
					'value' : '2'
				}, {
					'name' : '现金',
					'value' : '1'
				}, {
					'name' : 'ABIS 内核户',
					'value' : '4'
				}, {
					'name' : '零余额',
					'value' : '5'
				} ]
			});
		}
		//常用查询区
		var queryItems = [];
		if (me.query != 'HuNanABC') {
			queryItems = [ {
				name : 'vouNo',
				fieldLabel : '凭证号',
				xtype : 'textfield',
				//modify by cyq  2014/12/24  symbol属性值由'LiKE'改为'like'
				symbol : 'like',
				dataIndex : 'pay_voucher_code'
			}, {
				name : 'startDate',
				fieldLabel : '起止时间',
				xtype : 'datefield',
				format:'Ymd',
				symbol : '>=',
				//原始：dataIndex : 'create_date',modify by cyq 2015/1/21
				dataIndex : 'pay_date',
				datatype : 2
			}, {
				name : 'endDate',
				fieldLabel : '至',
				xtype : 'datefield',
				format:'Ymd',
				symbol : '<=',
				//原始：dataIndex : 'create_date',modify by cyq 2015/1/21
				dataIndex : 'pay_date',
				datatype : 2
			}, {
				name : 'payeeAcctNo',
				fieldLabel : '收款帐号',
				xtype : 'textfield',
				symbol : 'like',
				dataIndex : 'payee_account_no'
			}, {
				name : 'summaryName',
				fieldLabel : '资金用途',
				symbol : 'like',
				dataIndex : 'pay_summary_name',
				xtype : 'textfield'
			}, {
				name : 'sAmt',
				fieldLabel : '金额范围',
				xtype : 'numberfield',
				symbol : '>=',
				dataIndex : 'pay_amount',
				datatype : 1
			}, {
				name : 'eAmt',
				fieldLabel : '至',
				xtype : 'numberfield',
				symbol : '<=',
				dataIndex : 'pay_amount',
				datatype : 1
			},{
				layout : 'hbox',
				bodyStyle : 'border-width: 0px 0px 0px 0px;',
				anchor : '100% 100%',
				items : [{
					name : 'payAcctNo',
					fieldLabel : '付款帐号',
					xtype : 'textfield',
					symbol : 'like',
					dataIndex : 'pay_account_no',
					width : '75%'
				},{
					name : 'queryBtn',
					xtype : 'button',
					iconCls : 'look',
					text : '查询',
					scale : 'small'
				} ]
			} ];
		}else{
			queryItems = [ {
				name : 'vouNo',
				fieldLabel : '凭证号',
				xtype : 'textfield',
				symbol : 'like',//LIKE
				dataIndex : 'pay_voucher_code'
			},{
				name : 'amt',
				fieldLabel : '金额范围',
				xtype : 'numberfield',
				symbol : '>=',
				dataIndex : 'pay_amount',
				datatype : 1
			},{
				name : 'eAmt',
				fieldLabel : '至',
				xtype : 'numberfield',
				symbol : '<=',
				dataIndex : 'pay_amount',
				datatype : 1
			},{
				name : 'payDate',
				fieldLabel : '支付日期',
				xtype : 'datefield',
				format:'Ymd',
				symbol : '=',
				datatype : 2,
				data_type:'date',
				dataIndex : 'pay_date'
			}, { 
				name : 'payeeAcctNo',
				fieldLabel : '收款帐号',
				xtype : 'textfield',
				symbol : 'like',
				dataIndex : 'payee_account_no'
			},{
				name : 'payAcctNo',
				fieldLabel : '付款帐号',
				xtype : 'textfield',
				symbol : 'like',
				dataIndex : 'pay_account_no'
			},{
				layout : 'hbox',
				bodyStyle : 'border-width: 0px 0px 0px 0px;',
				anchor : '100% 100%',
				items : [ {
					name : 'FundType',
					fieldLabel : '资金性质',
					symbol : 'like',
					dataIndex : 'fund_type_code',
					xtype : 'combo',
					displayField: 'name',
					valueField: 'code',
					editable :false,
					store: 'common.ElementValues',
					width : '75%'
				}, {
					name : 'queryBtn',
					xtype : 'button',
					text : '查询',
					iconCls : 'look',
					scale : 'small'
				} ]
			} ];
		}
		Ext.applyIf(me, {
			items : [ {
				layout : 'border',
				border : false,
				items : [ {
					region : 'north',
					bodyPadding : 5,
					border : false,
					xtype : 'form',
					title : '查询条件',
					collapsible : true,
					layout:'column',  
					defaults: { 
    					style : 'margin-left:5px;margin-right:5px;margin-top:5px;margin-bottom:5px;',
    					columnWidth : 0.25
					},
					items : queryItems
				},{
					region : 'center',
					border : false,
					layout : 'anchor',
					items : [ {
						anchor : '100% 50%',
						id : 'voucherpanel',
						xtype : 'gridpanel',
						border : false,
						title : '支付凭证列表',
						store : 'pay.OriPayVouchers',
						columns : [ {
							xtype :'actiontextcolumn',
							text : '操作列',
							dataIndex : 'actionVoucher',
							items : [ {
								tooltip : '查看凭证',
								handler: function (grid, rowIndex, colIndex, node, e, record, rowEl) {
									me.fireEvent('queryOldVoucherclick', record);	
								}
							} ]
						}, {
							text : '凭证号',
							dataIndex : 'pay_voucher_code',
							width : 130
						}, {
							text : '凭证日期',
							dataIndex : 'vou_date',
							width : 100
						}, {
							text : '金额',
							dataIndex : 'pay_amount',
							xtype : 'numbercolumn',
							format : '0,0.00',
							align : 'right',
							width : 100
						}, {
							text : '收款人账号',
							dataIndex : 'payee_account_no',
							width : 150
						}, {
							text : '收款人名称',
							dataIndex : 'payee_account_name',
							width : 150
						}, {
							text : '收款人银行',
							dataIndex : 'payee_account_bank',
							width : 150
						}, {
                            text : '原收款人银行',
                            dataIndex : 'ori_payee_account_bank',
							width : 150
						}, {
							text : '收款行行号',
							dataIndex : 'payee_account_bank_no',
							width : 130
						}, {
							text : '付款人账号',
							dataIndex : 'pay_account_no',
							width : 150
						}, {
							text : '付款人名称',
							dataIndex : 'pay_account_name',
							width : 150
						}, {
							text : '付款人银行',
							dataIndex : 'pay_account_bank',
							width : 150
						}, {
							text : '代理银行编码',
							dataIndex : 'pay_bank_code',
							width : 150
						}, {
							text : '代理银行名称',
							dataIndex : 'pay_bank_name',
							width : 150
						}, {
							text : '清算银行编码',
							dataIndex : 'clear_bank_code',
							width : 150
						}, {
							text : '清算银行名称',
							dataIndex : 'clear_bank_name',
							width : 150
						}, {
							text : '资金性质编码',
							dataIndex : 'fund_type_code',
							width : 130
						}, {
							text : '资金性质名称',
							dataIndex : 'fund_type_name',
							width : 130
						}, {
							text : '基层预算单位编码',
							dataIndex : 'agency_code',
							width : 130
						}, {
							text : '基层预算单位名称',
							dataIndex : 'agency_name',
							width : 130
						}, {
							text : '支付日期',
							dataIndex : 'pay_date',
							width : 130
						}, {
							text : '用途编码',
							dataIndex : 'pay_summary_code',
							width : 150
						}, {
							text : '用途名称',
							dataIndex : 'pay_summary_name',
							width : 200
						} ],
						bbar : Ext.PageUtil.pagingTool('pay.OriPayVouchers')
					}, {
						xtype : 'gridpanel',
						id : 'requestpanel',
						frame : false,
						border : false,
						anchor : '100% 50%',
						title : '支付明细列表',
						//将支付明细列表默认设为不可用
						disabled : true,
						store : 'pay.PayRequests',
						columns : [ {
							text : '明细编号',
							dataIndex : 'pay_request_code',
							width : 130
						}, {
							text : '金额',
							dataIndex : 'pay_amount',
							xtype : 'numbercolumn',
							format : '0,0.00',
							align : 'right',
							width : 100
						}, {
							text : '已退金额',
							dataIndex : 'pay_refund_amount',
							xtype : 'numbercolumn',
							format : '0,0.00',
							align : 'right',
							width : 100
						}, {
							text : '收款人账号',
							dataIndex : 'payee_account_no',
							width : 150
						}, {
							text : '收款人名称',
							dataIndex : 'payee_account_name',
							width : 150
						}, {
							text : '收款人银行',
							dataIndex : 'payee_account_bank',
							width : 150
						}, {
							text : '收款行行号',
							dataIndex : 'payee_account_bank_no',
							width : 130
						},{
							text : '转账状态',
							dataIndex : 'trans_succ_flag',
							width : 130,
							renderer : function(value){
								if(value == 1){
									return "转账成功";
								}else if(value == 2){
									return "转账失败";
								}else if(value == 3){
									return "不确定";
								}else{
									return "";
								}
							}
						},{
							text : '基层预算单位编码',
							dataIndex : 'agency_code',
							width : 130
						}, {
							text : '基层预算单位名称',
							dataIndex : 'agency_name',
							width : 130
						}, {
							text : '预算类型编码',
							dataIndex : 'bgt_type_code',
							width : 130
						}, {
							text : '预算类型名称',
							dataIndex : 'bgt_type_name',
							width : 130
						}, {
							text : '支出类型编码',
							dataIndex : 'pay_kind_code',
							width : 130
						}, {
							text : '支出类型名称',
							dataIndex : 'pay_kind_name',
							width : 130
						}, {
							text : '功能分类编码',
							dataIndex : 'exp_func_code',
							width : 130
						}, {
							text : '功能分类名称',
							dataIndex : 'exp_func_name',
							width : 130
						}, {
							text : '经济分类编码',
							dataIndex : 'exp_eco_code',
							width : 130
						}, {
							text : '经济分类名称',
							dataIndex : 'exp_eco_name',
							width : 130
						}, {
							text : '收支管理编码',
							dataIndex : 'pro_cat_code',
							width : 130
						}, {
							text : '收支管理名称',
							dataIndex : 'pro_cat_name',
							width : 130
						} ],
						bbar : Ext.PageUtil.pagingTool('pay.PayRequests')
					} ]
				}, {
					region : 'south',
					bodyPadding : 5,
					frame : false,
					border : false,
//					title : '输入项',
					items : [ {
						xtype : 'panel',
						layout : 'hbox',
						frame : false,
						border : false,
						border : 0,
						anchor : '100% 100%',
						items : [ {
							id : 'cbxIsBill',
							xtype : 'checkbox',
							fieldLabel : '是否按单退款',
							checked : true,
							width : '20%',
							listeners: {
								change : function(thiz, newValue, oldValue, eOpts) {
									if(thiz.checked){
										//将退款金额框设为不可读
										//增加代码使支付明细列表和退款金额框的状态设为相同，因为他们都按是否按单退款来分
										Ext.getCmp('refundAmt').setDisabled(true);
										Ext.getCmp('refundAmt_confirm').setDisabled(true);
										Ext.getCmp('requestpanel').setDisabled(true);
									}else{
										Ext.getCmp('refundAmt').setDisabled(false);
										Ext.getCmp('refundAmt_confirm').setDisabled(false);
										Ext.getCmp('requestpanel').setDisabled(false);
										Ext.ComponentQuery.query('gridpanel[id=requestpanel]', me)[0].
											getSelectionModel().deselectAll();
									}
									if(thiz.checked) {  //选中按单退款
										var vouRecords = Ext.ComponentQuery.query('gridpanel[id=voucherpanel]', me)[0].getSelectionModel().getSelection(); 
										if (vouRecords.length == 0) 
											return;

										//退款类型 2按单退款  1按明细退款
										if (vouRecords[0].get('refund_type') == 1) {
											Ext.Msg.alert('系统提示', '该凭证已按明细退过款，无法按单退款！');
											this.setValue(false);
										}else{
											//add by liutianlong 2015-02-03
											Ext.getCmp('refundAmt').setValue(vouRecords[0].get('pay_amount').toFixed(2));
											//+++++++++
											Ext.getCmp('refundAmt_confirm').setValue(vouRecords[0].get('pay_amount').toFixed(2));
											//end
										}
									}
								}
							}
						}, {
							id : 'refundAmt',
							xtype : 'numberfield',
							allowNegative : false, //不能为负数  
							decimalPrecision : 2, //小数精确位数
							fieldLabel : '退款金额<=',
							style : 'margin-left:5px;',
							disabled : true,
							width : '20%',
							value : 0
						}, {
							id : 'refundAmt_confirm',
							xtype : 'numberfield',
							allowNegative : false, //不能为负数  
							decimalPrecision : 2, //小数精确位数
							fieldLabel : '退款金额确认',
							style : 'margin-left:5px;',
							disabled : true,
							width : '20%',
							value : 0
						}, {
							id : 'refundRemark',
							xtype : 'textfield',
							width : '30%',
							fieldLabel : '<font style=\'color:red\'>*</font>退款原因',
							style : 'margin-left:5px;'
						} ]
					},{
						xtype : 'panel',
						layout : 'hbox',
						hidden : me.query == 'HuNanABC' ? false : true,
						anchor : '100% 100%',
						border : 0,
						items : [ {
							name : 'cbxPayFlag',
							fieldLabel : '现转标志',
							xtype : 'combobox',
							displayField: 'name',
    						valueField: 'value',
    						value : '2',
    						store : cashFlagStore,
    						width : '20%',
							style : 'margin-top:5px;',
							listeners:{
								select : function(combo, records, eOpts){
									// 1现金2网点操作账户3ABIS91
									var value = combo.getValue();
									if (value == "2") {
										Ext.ComponentQuery.query('textfield[name=txtWriteOffvouNo]', me)[0].setVisible(true);
										Ext.ComponentQuery.query('textfield[name=txtWriteOffvouSeqNo]', me)[0].setVisible(true);
										Ext.ComponentQuery.query('textfield[name=txtWriteOffuserCode]', me)[0].setVisible(true);
									} else {
										Ext.ComponentQuery.query('textfield[name=txtWriteOffvouNo]', me)[0].setVisible(false);
										Ext.ComponentQuery.query('textfield[name=txtWriteOffvouSeqNo]', me)[0].setVisible(false);
										Ext.ComponentQuery.query('textfield[name=txtWriteOffuserCode]', me)[0].setVisible(false);
									}
									
									if(value == "4"){
										Ext.ComponentQuery.query('combobox[name=txtAbisAccountNo]', me)[0].setVisible(true);
									} else {
										Ext.ComponentQuery.query('combobox[name=txtAbisAccountNo]', me)[0].setVisible(false);
									}
								}
							}
    					}, { 
    						name : 'txtWriteOffvouNo',
    						xtype : 'textfield',
							fieldLabel : '核销传票号',
							width : '20%',
							style : 'margin-left:5px;margin-top:5px;'
						}, {
							name : 'txtWriteOffvouSeqNo',
							xtype : 'textfield',
							fieldLabel : '核销顺序号',
							width : '20%',
							style : 'margin-left:5px;margin-top:5px;'
						}, {
							name : 'txtWriteOffuserCode',
							xtype : 'textfield',
							fieldLabel : '核销柜员号',
							width : '20%',
							style : 'margin-left:5px;margin-top:5px;'
						},{
							name : 'txtAbisAccountNo',
							fieldLabel : '本网点账户',
							xtype : 'combobox',
							style : 'margin-left:5px;margin-top:5px;',
							displayField: 'account_name',
    						valueField: 'account_no',
    						value : (abisStore && abisStore.data.length > 0)
									? abisStore.data
									.getAt(0)
									.get("account_no")
									: "",
    						hidden : true,
    						store : abisStore,
    						width : '20%'
						} ]
					} ]
				} ],
				buttons : [ {
					id : 'cbxInput',
					xtype : 'checkbox',
					fieldLabel : '连续录入',
					labelWidth : 70,
					checked : true
				}, '->', {
					text : '确定',
					handler : function() {
						//主键
						var id = 0;
						//支付类型 直接支付：0 授权支付：1
					//	var payType = 0;
						//是否连续录入
						var cbxInput = Ext.ComponentQuery.query('checkbox[id=cbxInput]', me)[0].getValue();
						//退款原因
						var refundRemark = Ext.ComponentQuery.query('textfield[id=refundRemark]', me)[0].getValue();
						//是否按单退款
						var isBill =Ext.ComponentQuery.query('checkbox[id=cbxIsBill]', me)[0].getValue();
						//凭证选中的数据
						var recordVous = Ext.ComponentQuery.query('gridpanel[id=voucherpanel]', me)[0].getSelectionModel().getSelection(); 
						 //按单退款
						if(isBill){
							if(recordVous.length==0){
								Ext.Msg.alert('系统提示', '请选中要按单退款的支付凭证！');
								return;
							}
							//退款类型 2按单退款  1按明细退款
							if (recordVous[0].get('refund_type') == 1) {
									Ext.Msg.alert('系统提示', '该凭证已按明细退过款，无法按单退款！');
									Ext.getCmp('cbxIsBill').setValue(false);
									return ;
								}
							id = recordVous[0].get('pay_voucher_id');
					//		payType = recordVous[0].get('pay_type_name').indexOf('直接') != -1 ? 0 : 1;
						}else{
							var records = Ext.ComponentQuery.query('gridpanel[id=requestpanel]', me)[0].getSelectionModel().getSelection(); 
							if (records.length == 0) {
								Ext.Msg.alert('系统提示', '请选中要按明细退款的明细数据!');
								return;
							} 
							id = records[0].get('pay_request_id');
						//	payType = records[0].get('pay_type_name').indexOf('直接') != -1 ? 0 : 1;
						}
						//退款金额
						var refundAmt = Ext.ComponentQuery.query('numberfield[id=refundAmt]', me)[0].getValue();
						if (refundAmt <= 0.00) {
							Ext.Msg.alert('系统提示','退款金额必须大于0!');
							return;
						}
						var refundAmt_confirm = Ext.ComponentQuery.query('numberfield[id=refundAmt_confirm]', me)[0].getValue();
						if (refundAmt_confirm != refundAmt ) {
							Ext.Msg.alert('系统提示','退款确认金额须与退款金额一致!');
							return;
						}
				        if(Ext.isEmpty(refundRemark)){
							Ext.Msg.alert('系统提示','退款原因不能为空!');
							return ;
						}
				        //湖南农行特殊字段定义
						var payFlag,writeoffVouNo,writeoffVouseqno,writeOffuserCode,abisNo;
				        if(me.query=='HuNanABC'){
				            payFlag = Ext.ComponentQuery.query('combobox[name=cbxPayFlag]', me)[0].getValue();
				            writeoffVouNo = Ext.ComponentQuery.query('textfield[name=txtWriteOffvouNo]', me)[0].getValue();
				            writeoffVouseqno = Ext.ComponentQuery.query('textfield[name=txtWriteOffvouSeqNo]', me)[0].getValue();
				            writeOffuserCode = Ext.ComponentQuery.query('textfield[name=txtWriteOffuserCode]', me)[0].getValue();
				            abisNo = Ext.ComponentQuery.query('combobox[name=txtAbisAccountNo]', me)[0].getValue();
				            if(payFlag=='2'){
				            	if(Ext.isEmpty(writeoffVouNo)){
									Ext.Msg.alert("系统提示", "请录入传票号！");
									return;
								}
								if(Ext.isEmpty(writeoffVouseqno)){
									Ext.Msg.alert("系统提示", "请录入顺序号！");
									return;
								}
							}
				            if(payFlag == '4'){
				            	if(Ext.isEmpty(abisNo)){
									Ext.Msg.alert("系统提示", "请录入ABIS内核户！");
									return;
								}
				            }
				            
				        }
						//退款确认框
						Ext.MessageBox.show({
							title: '退款生成确认',
				            msg: '原凭证号:' + recordVous[0].get('pay_voucher_code')+',实际退款金额:' + refundAmt,
				            icon:Ext.MessageBox.QUESTION,
				            buttons: Ext.MessageBox.YESNO,
				            buttonText:{ 
				                yes: "确定", 
				                no: "取消" 
				            },
				            fn: function(btn){
				            	if(btn == 'yes'){
				            		me.fireEvent('saveRefundclick', cbxInput, id,isBill==true?1:0, refundAmt,refundRemark,payType,payFlag,writeoffVouNo,writeoffVouseqno,writeOffuserCode,abisNo);	
				            	}
				            }
						});
					}
				}, {
					text : '取消',
					handler : function() {
						me.close();
					}
				} ]
			} ]
		});
		me.addEvents('saveRefundclick','queryOldVoucherclick');
		me.callParent(arguments);
	},
	/***
	 * 清除全部输入项
	 * @memberOf {TypeName} 
	 */
	clearItems : function() {
		var me = this;
		//清除查询条件输入的值
		Ext.ComponentQuery.query('form', me)[0].getForm().reset();
		Ext.getCmp('cbxIsBill').check = true;
		Ext.ComponentQuery.query('numberfield[id=refundAmt]', me)[0].setValue(0.00);
		Ext.ComponentQuery.query('numberfield[id=refundAmt_confirm]', me)[0].setValue(0.00);
		Ext.ComponentQuery.query('textfield[id=refundRemark]', me)[0].setValue(null);
		if(me.query=='HuNanABC'){
            payFlag = Ext.ComponentQuery.query('combobox[name=cbxPayFlag]', me)[0].getValue();
            writeoffVouNo = Ext.ComponentQuery.query('textfield[name=txtWriteOffvouNo]', me)[0].setValue(null);
            writeoffVouseqno = Ext.ComponentQuery.query('textfield[name=txtWriteOffvouSeqNo]', me)[0].setValue(null);
            writeOffuserCode = Ext.ComponentQuery.query('textfield[name=txtWriteOffuserCode]', me)[0].setValue(null);
		}
		Ext.getCmp('voucherpanel').getStore().removeAll();
		Ext.getCmp('requestpanel').getStore().removeAll();
	}
});
