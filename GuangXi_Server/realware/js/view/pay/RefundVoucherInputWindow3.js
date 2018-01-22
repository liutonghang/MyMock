/***
 * 退款通知书录入窗口
 * @memberOf {TypeName} 
 */
Ext.define('pb.view.pay.RefundVoucherInputWindow3', {
	extend : 'Ext.window.Window',
	alias : 'widget.refundVoucherInputWindow3', //别名
	layout : 'fit',
	modal : true,
	width : '100%',
	height : '100%',
	title : '退款通知书录入',
	resizable : false, // 不可调整大小
	draggable : false, // 不可拖拽
	query : 'PUBLIC',  //查询区布局
	initComponent : function() {
		var me = this;
		//查询区
		var queryItems = [ {
				name : 'vouNo',
				fieldLabel : '凭证号',
				xtype : 'textfield',
				labelWidth : 70,
				symbol : 'like',
				dataIndex : 'pay_voucher_code',
				style : 'margin-left:5px;'
			}, {
				name : 'amt',
				fieldLabel : '金额',
				xtype : 'numberfield',
				labelWidth : 70,
				symbol : '=',
				dataIndex : 'pay_amount',
				datatype : 1,
				style : 'margin-left:5px;'
			},
			/*{
				name : 'eAmt',
				fieldLabel : '至',
				xtype : 'numberfield',
				labelWidth : 70,
				symbol : '<=',
				dataIndex : 'pay_amount',
				datatype : 1,
				style : 'margin-left:5px;'
			},*/
			{
				name : 'payDate',
				fieldLabel : '支付日期',
				xtype : 'datefield',
				format:'Ymd',
				symbol : '=',
				datatype : 2,
				labelWidth : 70,
				data_type:'date',
				dataIndex : 'pay_date'
			}, { 
				name : 'payeeAcctNo',
				fieldLabel : '收款人帐号',
				xtype : 'textfield',
				symbol : 'like',
				dataIndex : 'payee_account_no',
				labelWidth : 70,
				style : 'margin-left:5px;'
			}, {
				name : 'payAcctNo',
				fieldLabel : '付款人帐号',
				xtype : 'textfield',
				symbol : 'like',
				dataIndex : 'pay_account_no',
				labelWidth : 70,
				style : 'margin-left:5px;'
			}, {
				layout : 'hbox',
				style : 'margin-left:5px;',
				bodyStyle : 'border-width: 0px 0px 0px 0px;',
				width:300,
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
					labelWidth : 70
				}, {
					name : 'queryBtn',
					xtype : 'button',
					iconCls : 'look',
					scale : 'small'
				} ]
			} ];
		
		Ext.applyIf(me, {
			items : [ {
				layout : 'border',
				items : [ {
					region : 'north',
					bodyPadding : 5,
					layout : {
						type : 'table',
						columns : 4
					},
					xtype : 'form',
					title : '查询条件',
					collapsible : true,
					items : queryItems
				}, {
					region : 'center',
					layout : 'anchor',
					items : [ {
						anchor : '100% 50%',
						id : 'voucherpanel',
						xtype : 'gridpanel',
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
							text : '基层预算单位编码',
							dataIndex : 'agency_code',
							width : 130
						}, {
							text : '基层预算单位名称',
							dataIndex : 'agency_name',
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
							text : '功能分类类编码',
							dataIndex : 'exp_func_code1',
							width : 130
						}, {
							text : '功能分类类名称',
							dataIndex : 'exp_func_name1',
							width : 130
						}, {
							text : '功能分类款编码',
							dataIndex : 'exp_func_code2',
							width : 130
						}, {
							text : '功能分类款名称',
							dataIndex : 'exp_func_name2',
							width : 130
						}, {
							text : '功能分类项编码',
							dataIndex : 'exp_func_code3',
							width : 130
						}, {
							text : '功能分类项名称',
							dataIndex : 'exp_func_name3',
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
							text : '经济分类类编码',
							dataIndex : 'exp_eco_code1',
							width : 130
						}, {
							text : '经济分类类名称',
							dataIndex : 'exp_eco_name1',
							width : 130
						}, {
							text : '经济分类款编码',
							dataIndex : 'exp_eco_code2',
							width : 130
						}, {
							text : '经济分类款名称',
							dataIndex : 'exp_eco_name2',
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
					title : '输入项',
					items : [ {
						xtype : 'panel',
						layout : 'hbox',
						border : 0,
						defaults : {
							labelWidth : 80,
							width : 210
						},
						items : [ {
							id : 'cbxIsBill',
							xtype : 'checkbox',
							fieldLabel : '是否按单退款',
							checked : true,
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
									}
									if(thiz.checked) {  //选中按单退款
										var vouRecords = Ext.ComponentQuery.query('gridpanel[id=voucherpanel]', me)[0].getSelectionModel().getSelection(); 
										if (vouRecords.length == 0) 
											return;

										//退款类型 2按单退款  1按明细退款
										if (vouRecords[0].get('refund_type') == 1) {
											Ext.Msg.alert('系统提示', '该凭证已按明细退过款，无法按单退款！');
											this.setValue(false);
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
							value : 0
						}, {
							id : 'refundAmt_confirm',
							xtype : 'numberfield',
							allowNegative : false, //不能为负数  
							decimalPrecision : 2, //小数精确位数
							fieldLabel : '退款金额确认',
							style : 'margin-left:5px;',
							disabled : true,
							value : 0
						}, {
							id : 'refundRemark',
							xtype : 'textfield',
							fieldLabel : '<font style=\'color:red\'>*</font>退款原因',
							style : 'margin-left:5px;'
						} ]
					},{
						xtype : 'panel',
						layout : 'hbox',
						hidden : me.query == 'HuNanABC' ? false : true,
						defaults : {
							labelWidth : 80,
							width : 210
						},
						border : 0,
						items : [ {
							name : 'cbxPayFlag',
							fieldLabel : '现转标志',
							xtype : 'combobox',
							displayField: 'name',
    						valueField: 'value',
    						value : '2',
    						store : Ext.create('Ext.data.Store', {
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
    						}),
							style : 'margin-top:5px;',
							listeners:{
								select : function(combo, records, eOpts){
									// 1现金2网点操作账户3ABIS91
									var value = combo.getValue();
									if (value == "2") {
										Ext.ComponentQuery.query('textfield[name=txtWriteOffvouNo]', me)[0].enable(false);
										Ext.ComponentQuery.query('textfield[name=txtWriteOffvouSeqNo]', me)[0].enable(false);
										Ext.ComponentQuery.query('textfield[name=txtWriteOffuserCode]', me)[0].enable(false);
									} else {
										Ext.ComponentQuery.query('textfield[name=txtWriteOffvouNo]', me)[0].disable(true);
										Ext.ComponentQuery.query('textfield[name=txtWriteOffvouSeqNo]', me)[0].disable(true);
										Ext.ComponentQuery.query('textfield[name=txtWriteOffuserCode]', me)[0].disable(true);
									}
								}
							}
    					}, { 
    						name : 'txtWriteOffvouNo',
    						xtype : 'textfield',
							fieldLabel : '核销传票号',
							style : 'margin-left:5px;margin-top:5px;'
						}, {
							name : 'txtWriteOffvouSeqNo',
							xtype : 'textfield',
							fieldLabel : '核销顺序号',
							style : 'margin-left:5px;margin-top:5px;'
						}, {
							name : 'txtWriteOffuserCode',
							xtype : 'textfield',
							fieldLabel : '核销柜员号',
							style : 'margin-left:5px;margin-top:5px;'
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
						var payFlag,writeoffVouNo,writeoffVouseqno,writeOffuserCode;
				        if(me.query=='HuNanABC'){
				            payFlag = Ext.ComponentQuery.query('combobox[name=cbxPayFlag]', me)[0].getValue();
				            writeoffVouNo = Ext.ComponentQuery.query('textfield[name=txtWriteOffvouNo]', me)[0].getValue();
				            writeoffVouseqno = Ext.ComponentQuery.query('textfield[name=txtWriteOffvouSeqNo]', me)[0].getValue();
				            writeOffuserCode = Ext.ComponentQuery.query('textfield[name=txtWriteOffuserCode]', me)[0].getValue();
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
				            		me.fireEvent('saveRefundclick', cbxInput, id,isBill==true?1:0, refundAmt,refundRemark,payType,payFlag,writeoffVouNo,writeoffVouseqno,writeOffuserCode);	
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
		Ext.ComponentQuery.query('textfield[id=refundRemark]', me)[0].setValue(null);
		Ext.getCmp('voucherpanel').getStore().removeAll();
		Ext.getCmp('requestpanel').getStore().removeAll();
	}
});
