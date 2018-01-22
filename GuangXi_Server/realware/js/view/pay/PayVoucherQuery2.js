/***
 * 查询区
 * @memberOf {TypeName} 
 */
Ext.define('pb.view.pay.PayVoucherQuery2', {
	extend : 'Ext.panel.Panel',
	alias : 'widget.payVoucherQuery2',
	title : '查询区',
	collapsible : true,
	layout : {
		type : 'table',
		columns : 5
	},
	bodyPadding : 5,
	renderTo : Ext.getBody(),
	items : [{
				id : 'taskState',
				fieldLabel : '当前状态',
				xtype : 'combo',
				displayField : 'status_name',
				dataIndex : 'task_status',
				emptyText : '请选择',
				valueField : 'status_code',
				editable : false,
				queryMode: 'local', 
				style : 'margin-left:5px;margin-right:5px;'
			},{
				id:'voucher_status',
				fieldLabel : '凭证状态',
				xtype : 'combo',
				dataIndex : 'voucher_status',
				displayField : 'name',
				valueField : 'value',
				hidden :'true',
				editable : false,
				queryMode: 'local', 
				style : 'margin-left:5px;margin-right:5px;',
				store : 'pay.VoucherStatusOfSend'
			}, {
				fieldLabel : '凭证号',
				xtype : 'textfield',
				symbol : '>=',
				dataIndex : 'pay_voucher_code',
				labelWidth : 40,
				style : 'margin-left:5px;margin-right:5px;'
			}, {
				fieldLabel : '至',
				xtype : 'textfield',
				symbol : '<=',
				dataIndex : ' pay_voucher_code',
				labelWidth : 20,
				style : 'margin-left:5px;margin-right:5px;'
			},{
				id:'forward_static',
				fieldLabel : '转账状态',
				xtype : 'combo',
				dataIndex : 'business_type',
				datatype : 1,
				displayField : 'name',
				valueField : 'value',
				editable : false,
				queryMode: 'local', 
				style : 'margin-left:5px;margin-right:5px;',
				store : 'pay.ForwardStatus'
			}, {
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
			},{
				fieldLabel : '凭证日期',
				xtype : 'datefield',
				dataIndex : 'vou_date',
				format : 'Ymd',
				style : 'margin-left:5px;margin-right:5px;'
			},
			{
			fieldLabel : '银行结算方式',
			xtype : 'combo',
			dataIndex : 'bank_setmode_code',
			displayField : 'name',
			valueField : 'value',
//			editable : false,
			hidden :'true',
			queryMode: 'local', 
			store : 'pay.BankSetMode',
			style : 'margin-left:5px;margin-right:5px;'
		},
			{
				fieldLabel : '支票号',
				hidden :'true',
				xtype : 'textfield',
				dataIndex : 'checkNo',
				style : 'margin-left:5px;margin-right:5px;'
			}
			],
	initComponent : function() {
		this.callParent(arguments);
	}
});
