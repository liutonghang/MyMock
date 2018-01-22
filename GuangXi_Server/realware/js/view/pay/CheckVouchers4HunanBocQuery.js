/***
 * 查询区
 * @memberOf {TypeName} 
 */
Ext.define('pb.view.pay.CheckVouchers4HunanBocQuery', {
	extend : 'Ext.panel.Panel',
	alias : 'widget.checkVouchers4HunanBocQuery',
	title : '查询区',
	collapsible : true,
	layout : {
		type : 'table',
		columns : 4
	},
	bodyPadding : 5,
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
				dataIndex : 'pay_voucher_code',
				editable : false,
				style : 'margin-left:5px;margin-right:5px;'
			}, {
				fieldLabel : '至',
				xtype : 'textfield',
				symbol : '<=',
				dataIndex : ' pay_voucher_code',
				editable : false,
				style : 'margin-left:5px;margin-right:5px;'
			}, {
				fieldLabel : '凭证日期',
				xtype : 'datefield',
				dataIndex : 'vou_date',
				format : 'Ymd',
				style : 'margin-left:5px;margin-right:5px;'
			},{
				fieldLabel : '至',
				xtype : 'datefield',
				dataIndex : 'vou_date',
				format : 'Ymd',
				style : 'margin-left:5px;margin-right:5px;'
			},
			//新增金额字段 2015-2-5 14:54:56
			{
				id : 'amount',
				fieldLabel : '&nbsp;&nbsp;金额',
				xtype : 'numberfield',
				dataIndex : 'pay_amount',
				symbol : '>=',
				style : 'margin-left:5px;margin-right:5px;'
			},{
				id : 'amountEnd',
				fieldLabel : '&nbsp;至',
				xtype : 'numberfield',
				dataIndex : 'pay_amount',
				symbol : '<=',
				style : 'margin-left:5px;margin-right:5px;'
			},{
				id : 'psmc',
				fieldLabel : '银行结算方式',
				xtype : 'combo',
				//原始：dataIndex : 'bank_setmode_code', modify by cyq 2015/1/21
				dataIndex : 'pb_set_mode_code',
				displayField : 'name',
				valueField : 'value',
				editable : false,
				queryMode: 'local', 
				store : 'pay.BankSetMode',
				style : 'margin-left:5px;margin-right:5px;'
			}, {
				id : 'checkNo1',
				fieldLabel : '支票号',
				xtype : 'textfield',
				dataIndex : 'checkNo',
				style : 'margin-left:5px;margin-right:5px;'
			}
			],
	initComponent : function() {
		this.callParent(arguments);
	}
});
