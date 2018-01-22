
/**
 * 缴款确认二级界面
 */

Ext.define('PayableConfirmWindow', {
	extend : 'Ext.window.Window',
	alias : 'widget.payableConfirmWindow', //别名
	modal : true,
	title : '缴款确认',
	data : null,
	serialPanel : null,
	initComponent : function() {
		var me = this;
		Ext.applyIf(me, {
			items : [{
				   id : 'statementQuery',
			       xtype : 'form',
			       defaults : {
						margin : "5 5 5 5",
						labelWidth : 70,
						width : 210
					},
					layout : {
						type : 'table',
						columns : 4
					},
			       items : [{
							id : "payAcct",
							fieldLabel : '缴款账号',
							dataIndex : 'pay_account_no',
							xtype : 'textfield'
						},{
							id : "payName",
							fieldLabel : '缴款人名称',
							dataIndex : 'pay_account_name',
							symbol : 'like',
							xtype : 'textfield'
			            },{
			            	id : "transDate",
			            	fieldLabel : '流水日期',
			            	xtype : 'datefield',
			            	format : 'Ymd',
			            	dataIndex : 'trans_date',
			            	value : new Date(),
			            	data_type : 'string'
			            },{
				    	   	dataIndex : 'is_match',
				    	   	hidden: true,
							value : 0,
							data_type:'number'
				       },{
				    	    id : 'idAdmdivCode',
				    	   	dataIndex : 'admdiv_code',
				    	   	hidden: true,
				    	   	xtype : 'textfield',
							value : me.data[0].get('admdiv_code')
				       },{
				    	    id : 'incomeAmount',
				    	   	dataIndex : 'income_amount',
				    	   	hidden: true,
				    	   	xtype : 'numberfield',
				    	   	decimalPrecision: 2,
				    	   	data_type:'number',
							value : me.data[0].get('pay_amt')
				       }, {
							text : '查询',
							xtype : 'button',
							width : 80,
							handler: function() {
			            		me.serialPanel.getStore().loadPage(1);
							}
						}]						
				    },serialPanel],
			buttons : [{
				text : '确定',
				handler : function() {
					var record = me.serialPanel.getSelectionModel().getSelection();
					if (record.length != 1){
						Ext.MessageBox.alert("提示消息","请选择一条数据！");
						return;
					}
					/**
					 * 将遮挡层，放在二级界面上，避免请求发到后台后，还可以操作二级界面
					 * edit by liutianlong 2017年6月23日
					 */
					var myMask = new Ext.LoadMask(me, {
						msg : '后台正在处理中，请稍后....',
						removeMask : true   // 完成后移除
						});
				    myMask.show();
					var reqIds = [];
					var reqVers = [];
					
					Ext.Array.each(me.data, function(model) {
								reqIds.push(model.get("payable_voucher_id"));
								reqVers.push(model.get("last_ver"));
							});
				    Ext.Ajax.request({
						url : '/realware/nontaxConfirm.do',
						method : 'POST',
						dataType: "json",
						timeout : 180000, // 设置为3分钟
						params : {
				    	    bankTransNo : record[0].get('tra_no'),
				    	    billIds : Ext.encode(reqIds),
							last_vers : Ext.encode(reqVers),
							billTypeId : me.data[0].get('bill_type_id'),
							flag : 0,
							menu_id : Ext.PageUtil.getMenuId()
						},
						// 提交成功的回调函数
						success : function(response,options) {
							if(!Ext.isEmpty(response.responseText)) {
							    Ext.MessageBox.alert("提示消息",response.responseText);
							}
							myMask.hide();
							me.close();
							refreshData();
						},failure : function(response, options) {
							Ext.Msg.alert("系统提示", "查询失败，原因：" + response.responseText);
							myMask.hide();
						}		
				    }); 
				}
			},{
				text : '人工确认',
				handler : function(){
					rgConfirm(me.data,me);
			}
			},{
				text : '取消',
				handler : function() {
					this.up('window').close();
				}
			}]
		});
		me.callParent(arguments);
	}
});


//人工确认
function rgConfirm(records,win){
	Ext.widget('window', {
		id : 'confirmWin',
		title : '人工确认窗口',
		width : 520,
		height : 130,
		layout : 'fit',
		resizable : false,
		modal : true,
		items : [Ext.widget('form', {
					renderTo : Ext.getBody(),
					layout : {
						type : 'table',
						columns : 2
					},
					resizable : false,
					modal : true,
					items : [{
						        id : 'bankTransNo',
						        fieldLabel : '交易流水号',
						        xtype : 'textfield',
						        labelWidth : 80,
						        margin : '5 5 5 5',
						        allowBlank : false
							},{
								id : 'realPayAcct',
								fieldLabel : '缴款人账号',
								xtype : 'textfield',
								labelWidth : 80,
								margin : '5 5 5 5',
								allowBlank : false,
								value : records[0].get('pay_account_no')
							},{
								id : 'realPayAcctName',
								fieldLabel : '缴款人名称',
								xtype : 'textfield',
								labelWidth : 80,
								margin : '5 5 5 5',
								allowBlank : false,
								value : records[0].get('pay_account_name')
							},{
								id : 'realPayAcctBank',
								fieldLabel : '缴款人开户行',
								xtype : 'textfield',
								labelWidth : 80,
								margin : '5 5 5 5',
								allowBlank : false,
								value : records[0].get('pay_account_bank')
							}],
					buttons : [{
						text : '确定',
						handler : function() {
						    var form = this.up("form");
							if (form.isValid()) {
								var bankTransNo = Ext.getCmp('bankTransNo').getValue();
								var realPayAcct = Ext.getCmp('realPayAcct').getValue();
								var realPayAcctName = Ext.getCmp('realPayAcctName').getValue();
								var realPayAcctBank = Ext.getCmp('realPayAcctBank').getValue();
								var myMask = new Ext.LoadMask('confirmWin', {
										msg : '后台正在处理中，请稍后....',
										removeMask : true   // 完成后移除
										});
								myMask.show();
								var reqIds = [];
								var reqVers = [];
								
								Ext.Array.each(records, function(model) {
											reqIds.push(model.get("payable_voucher_id"));
											reqVers.push(model.get("last_ver"));
										});
								// 提交到服务器操作
								Ext.Ajax.request( {
								url : "/realware/nontaxConfirm.do",
								waitMsg : '后台正在处理中,请稍后....',
								method : 'POST',
								timeout : 180000, // 设置为3分钟
								params : {
									bankTransNo : bankTransNo,
									realPayAcct : realPayAcct,
									realPayAcctName : realPayAcctName,
									realPayAcctBank : realPayAcctBank,
									billIds : Ext.encode(reqIds),
									last_vers : Ext.encode(reqVers),
									billTypeId : records[0].get('bill_type_id'),
									flag : 1,
									menu_id : Ext.PageUtil.getMenuId()
								},
								success : function(response, options) {
									myMask.hide();
									Ext.Msg.alert("系统提示", response.responseText);
									Ext.getCmp('confirmWin').close();
									win.close();
									refreshData();
								},
								failure : function(response, options) {
									myMask.hide();
									Ext.Msg.alert("系统提示", response.responseText);
									Ext.getCmp('confirmWin').close();
//									Ext.getCmp('windows').close();
//									refreshData();
								}
							   });
							}							
						}
					}, {
						text : '取消',
						handler : function() {
							this.up('window').close();
						}
					}]
				})]
	}).show();
}