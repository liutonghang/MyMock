/*******************************************************************************
 * 转账日志查询
 */
Ext .define( 'pb.view.common.TransLogList', {
					extend : 'pb.view.pay.PayVoucherPanel',
					alias : 'widget.transloglist',
					layout : 'fit',
					UiTitle : '转账日志列表',
					frame : false,
					initComponent : function() {
						this.dockedItems = [{
									id : 'queryPanel',
									layout : {
										type : 'table',
										columns : 4
									},
									bodyPadding : 5,
									items : [ {
												id : 'admdivCode',
												fieldLabel : '所属财政',
												xtype : 'combo',
												dataIndex : 'admdiv_code',
												displayField : 'admdiv_name',
												emptyText : '请选择',
												valueField : 'admdiv_code',
												editable : false,
												store : comboAdmdiv,
												style : 'margin-left:5px;margin-right:5px;'
											}, {
												fieldLabel : '凭证号',
												xtype : 'textfield',
												symbol : '>=',
												dataIndex : 'voucher_no',
												style : 'margin-left:5px;margin-right:5px;'
											}, {
												fieldLabel : '至',
												xtype : 'textfield',
												symbol : '<=',
												dataIndex : ' voucher_no',
												style : 'margin-left:5px;margin-right:5px;'
											}, {
												fieldLabel : '交易结果',
												xtype : 'combo',
												dataIndex : 'trans_succ_flag',
												displayField : 'name',
												valueField : 'value',
												emptyText : '请选择',
												editable : false,
												value : '',
												style : 'margin-left:5px;margin-right:5px;',
												store : Ext.create('Ext.data.Store',{
																	fields : ['name','value' ],
																	data : [{
																				'name' : '全部',
																				'value' : ''
																			},{
																				'name' : '交易成功',
																				'value' : '1'
																			},{
																				'name' : '交易失败',
																				'value' : '2'
																			} ]
																}),
												listeners : {
													'select' : function() {
														Ext.getStore('common.TransLogs').load();
													}
												},
																
												datatype : 1,
												style : 'margin-left:5px;margin-right:5px;'
											},{
												fieldLabel : '柜员号',
												xtype : 'textfield',
												dataIndex : 'user_code',
												style : 'margin-left:5px;margin-right:5px;'
											},{
												fieldLabel : '付款人账号',
												xtype : 'textfield',
												dataIndex : 'pay_account_no',
												style : 'margin-left:5px;margin-right:5px;'
											},{
												fieldLabel : '核心日志号',
												xtype : 'textfield',
												dataIndex : 'accthost_seqId',
												style : 'margin-left:5px;margin-right:5px;'
											},{
												fieldLabel : '交易流水号',
												xtype : 'textfield',
												dataIndex : 'trans_log_id',
												style : 'margin-left:5px;margin-right:5px;'
											},{
												id : 'createDate',
												fieldLabel : '交易日期',
												xtype : 'datefield',
												dataIndex : 'create_date',
												format : 'Ymd',
												value : Ext.Date.format(new Date(), 'Ymd'),
												style : 'margin-left:5px;margin-right:5px;'
											} ]
								}];
						this.callParent(arguments);
					},
					getCols : function() {
						return [{
							text : '凭证号',
							dataIndex : 'voucher_no',
							width : 150
						}, {
							text : '付款人账号',
							dataIndex : 'pay_account_no',
							width : 150
						}, {
							text : '付款人名称',
							dataIndex : 'pay_account_name',
							width : 150
						}, {
							text : '收款人账号',
							dataIndex : 'payee_account_no',
							width : 150
						}, {
							text : '收款人名称',
							dataIndex : 'payee_account_name',
							width : 150
						}, {
							text : '交易金额',
							dataIndex : 'trans_amount',
							xtype : 'numbercolumn',
							format : '0,0.00',
							align : 'right',
							width : 100,
							summaryType : 'sum',
							summaryRenderer : function(value, summaryData, dataIndex) {
								return value=='0.00'?'': '小计:' + Ext.util.Format.number(value,'0,0.00');
							}
						}, {
							text : '交易结果',
							dataIndex : 'trans_succ_flag',
							width : 150,
							renderer : function(value) {
							 	if (value == '1') {
									return '交易成功';
								} else if (value == '2') {
									return '交易失败';
								} else {
									return '不确定';
								}
							}
						}, {
							text : '交易日期',
							dataIndex : 'create_date',
							width : 150
						}, {
							text : '柜员号',
							dataIndex : 'user_code',
							width : 150
						}, {
							text : '交易流水号',
							dataIndex : 'trans_log_id',
							width : 150
						}, {
							text : '核心日志号',
							dataIndex : 'accthost_seqId',
							width : 150
						}, {
							text : '交易返回消息',
							dataIndex : 'trans_res_msg',
							width : 150
						}, {
							text : '所属网点',
							dataIndex: 'bank_code',
							width : 150
						}];
					}
				});