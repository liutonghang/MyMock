/*** **
 * 以卡片的形式查看数据
 */
Ext.define('pb.view.common.SingleDetailWindow',{
	title : '数据查看卡片窗口',
	extend : 'Ext.window.Window',
	layout : 'vbox',
	title : '凭证详细信息',
	width : 700,
	height : 560,
	modal : true,
	constructor : function(cfg) {
		var me = this;
		cfg = cfg || {};
		var payformPanel = new Ext.FormPanel( {
			autoScroll : true,
			width : 700,
			title : '重要信息',
			layout : {
				type : 'table',
				columns : 2
			},
			bodyPadding : 5,
			items : [{
							fieldLabel : '付款人帐号',
							labelWidth : 130,
							name : 'pay_account_no',
							xtype : 'displayfield',
							labelStyle : 'font-weight:bold',
							fieldStyle : 'font-weight:bold;color:red',
							style : 'margin-right:40px;'
					},{
						fieldLabel : '收款人帐号',
						labelWidth : 130,
						name : 'payee_account_no',
						xtype : 'displayfield',
						labelStyle : 'font-weight:bold',
						fieldStyle : 'font-weight:bold;color:red',
						style : 'margin-right:40px;'
					},{
						fieldLabel : '付款人名称',
							labelWidth : 130,
							name : 'pay_account_name',
							xtype : 'displayfield',
							labelStyle : 'font-weight:bold',
							fieldStyle : 'font-weight:bold;color:red',
							style : 'margin-right:40px;'
					},{
						fieldLabel : '收款人名称',
							labelWidth : 130,
							name : 'payee_account_name',
							xtype : 'displayfield',
							labelStyle : 'font-weight:bold',
							fieldStyle : 'font-weight:bold;color:red',
							style : 'margin-right:40px;'
					},{
						fieldLabel : '付款人银行',
							labelWidth : 130,
							name : 'pay_account_bank',
							xtype : 'displayfield',
							labelStyle : 'font-weight:bold',
							fieldStyle : 'font-weight:bold;color:red',
							style : 'margin-right:40px;'
					},{
						fieldLabel : '收款人银行',
							labelWidth : 130,
							name : 'payee_account_bank',
							xtype : 'displayfield',
							labelStyle : 'font-weight:bold',
							fieldStyle : 'font-weight:bold;color:red',
							style : 'margin-right:40px;'
					},{
						fieldLabel : '金额',
							labelWidth : 130,
							name : 'pay_amount',
							xtype : 'displayfield',
							labelStyle : 'font-weight:bold',
							fieldStyle : 'font-weight:bold;color:red',
							style : 'margin-right:40px;'
					},{
						fieldLabel : '收款人行号',
							labelWidth : 130,
							name : 'payee_account_bank_no',
							xtype : 'displayfield',
							labelStyle : 'font-weight:bold',
							fieldStyle : 'font-weight:bold;color:red',
							style : 'margin-right:40px;'
					},{
						fieldLabel : '摘要',
							labelWidth : 130,
							name : 'pay_summary_name',
							xtype : 'displayfield',
							labelStyle : 'font-weight:bold',
							fieldStyle : 'font-weight:bold;color:red',
							style : 'margin-right:40px;'
					},{
						fieldLabel : '附言',
						labelWidth : 130,
						name : 'add_word',
						xtype : 'displayfield',
						labelStyle : 'font-weight:bold',
						fieldStyle : 'font-weight:bold;color:red',
						style : 'margin-right:40px;'
					}
					]
		});	
		var formPanel = new Ext.FormPanel( {
			autoScroll : true,
			width : 700,
			title : '其他信息',
			layout : {
				type : 'table',
				columns : 2
			},
			bodyPadding : 5,
			items : [{
						fieldLabel : '凭证号',
						labelWidth : 130,
						name : 'pay_voucher_code',
						xtype : 'displayfield',
						labelStyle : 'font-weight:bold',
						fieldStyle : 'font-weight:bold;color:blue',
						style : 'margin-right:40px;'
				},{
						fieldLabel : '凭证日期',
						labelWidth : 130,
						name : 'vou_date',
						xtype : 'displayfield',
						labelStyle : 'font-weight:bold',
						fieldStyle : 'font-weight:bold;color:blue',
						style : 'margin-right:40px;'
				},{
						fieldLabel : '代理银行编码',
						labelWidth : 130,
						name : 'pay_bank_code',
						xtype : 'displayfield',
						labelStyle : 'font-weight:bold',
						fieldStyle : 'font-weight:bold;color:blue',
						style : 'margin-right:40px;'
				},{
						fieldLabel : '代理银行名称',
						labelWidth : 130,
						name : 'pay_bank_name',
						xtype : 'displayfield',
						labelStyle : 'font-weight:bold',
						fieldStyle : 'font-weight:bold;color:blue',
						style : 'margin-right:40px;'
				},{
						fieldLabel : '清算银行编码',
						labelWidth : 130,
						name : 'clear_bank_code',
						xtype : 'displayfield',
						labelStyle : 'font-weight:bold',
						fieldStyle : 'font-weight:bold;color:blue',
						style : 'margin-right:40px;'
				},{
						fieldLabel : '清算银行名称',
						labelWidth : 130,
						name : 'clear_bank_name',
						xtype : 'displayfield',
						labelStyle : 'font-weight:bold',
						fieldStyle : 'font-weight:bold;color:blue',
						style : 'margin-right:40px;'
				},{
						fieldLabel : '支付方式编码',
						labelWidth : 130,
						name : 'pay_type_code',
						xtype : 'displayfield',
						labelStyle : 'font-weight:bold',
						fieldStyle : 'font-weight:bold;color:blue',
						style : 'margin-right:40px;'
				},{
						fieldLabel : '支付方式名称',
						labelWidth : 130,
						name : 'pay_type_name',
						xtype : 'displayfield',
						labelStyle : 'font-weight:bold',
						fieldStyle : 'font-weight:bold;color:blue',
						style : 'margin-right:40px;'
				},{
						fieldLabel : '结算方式编码',
						labelWidth : 130,
						name : 'set_mode_code',
						xtype : 'displayfield',
						labelStyle : 'font-weight:bold',
						fieldStyle : 'font-weight:bold;color:blue',
						style : 'margin-right:40px;'
				},{
						fieldLabel : '结算方式名称',
						labelWidth : 130,
						name : 'set_mode_name',
						xtype : 'displayfield',
						labelStyle : 'font-weight:bold',
						fieldStyle : 'font-weight:bold;color:blue',
						style : 'margin-right:40px;'
				},{
						fieldLabel : '资金性质编码',
						labelWidth : 130,
						name : 'fund_type_code',
						xtype : 'displayfield',
						labelStyle : 'font-weight:bold',
						fieldStyle : 'font-weight:bold;color:blue',
						style : 'margin-right:40px;'
				},{
						fieldLabel : '资金性质名称',
						labelWidth : 130,
						name : 'fund_type_name',
						xtype : 'displayfield',
						labelStyle : 'font-weight:bold',
						fieldStyle : 'font-weight:bold;color:blue',
						style : 'margin-right:40px;'
				},{
						fieldLabel : '收支管理编码',
						labelWidth : 130,
						name : 'pro_cat_code',
						xtype : 'displayfield',
						labelStyle : 'font-weight:bold',
						fieldStyle : 'font-weight:bold;color:blue',
						style : 'margin-right:40px;'
				},{
						fieldLabel : '收支管理名称',
						labelWidth : 130,
						name : 'pro_cat_name',
						xtype : 'displayfield',
						labelStyle : 'font-weight:bold',
						fieldStyle : 'font-weight:bold;color:blue',
						style : 'margin-right:40px;'
				},{
						fieldLabel : '一级预算单位编码',
						labelWidth : 130,
						name : 'sup_dep_code',
						xtype : 'displayfield',
						labelStyle : 'font-weight:bold',
						fieldStyle : 'font-weight:bold;color:blue',
						style : 'margin-right:40px;'
				},{
						fieldLabel : '一级预算单位名称',
						labelWidth : 130,
						name : 'sup_dep_name',
						xtype : 'displayfield',
						labelStyle : 'font-weight:bold',
						fieldStyle : 'font-weight:bold;color:blue',
						style : 'margin-right:40px;'
				},{
						fieldLabel : '基层预算单位编码',
						labelWidth : 130,
						name : 'agency_code',
						xtype : 'displayfield',
						labelStyle : 'font-weight:bold',
						fieldStyle : 'font-weight:bold;color:blue',
						style : 'margin-right:40px;'
				},{
						fieldLabel : '基层预算单位名称',
						labelWidth : 130,
						name : 'agency_name',
						xtype : 'displayfield',
						labelStyle : 'font-weight:bold',
						fieldStyle : 'font-weight:bold;color:blue',
						style : 'margin-right:40px;'
				},{
						fieldLabel : '预算项目编码',
						labelWidth : 130,
						name : 'dep_pro_code',
						xtype : 'displayfield',
						labelStyle : 'font-weight:bold',
						fieldStyle : 'font-weight:bold;color:blue',
						style : 'margin-right:40px;'
				},{
						fieldLabel : '预算项目名称',
						labelWidth : 130,
						name : 'dep_pro_name',
						xtype : 'displayfield',
						labelStyle : 'font-weight:bold',
						fieldStyle : 'font-weight:bold;color:blue',
						style : 'margin-right:40px;'
				},{
						fieldLabel : '支票号',
						labelWidth : 130,
						name : 'checkNo',
						xtype : 'displayfield',
						labelStyle : 'font-weight:bold',
						fieldStyle : 'font-weight:bold;color:blue',
						style : 'margin-right:40px;'
				},{
						fieldLabel : '银行结算方式名称',
						labelWidth : 130,
						name : 'pb_set_mode_name',
						xtype : 'displayfield',
						labelStyle : 'font-weight:bold',
						fieldStyle : 'font-weight:bold;color:blue',
						style : 'margin-right:40px;'
				}]
		});
		Ext.applyIf(me, {
			items : [ payformPanel,formPanel]
		});
		payformPanel.getForm().loadRecord(cfg.selectObj);
		formPanel.getForm().loadRecord(cfg.selectObj);
		this.createBtns();
		this.callParent(arguments);
	},
	createBtns : function() {
		var me = this;
		this.bbar = [ '->', {
			text : '退出',
			iconCls : 'close',
			handler : function() {
				me.close();
			}
		} ];
	}
})