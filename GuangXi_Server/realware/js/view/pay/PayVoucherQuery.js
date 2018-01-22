/***
 * 查询区
 * @memberOf {TypeName} 
 */
Ext.define('pb.view.pay.PayVoucherQuery', {
	extend : 'Ext.panel.Panel',
	alias : 'widget.payVoucherQuery',
	title : '查询区',
//	collapsible : true,
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
				style : 'margin-left:5px;margin-right:5px;'
			}, {
				fieldLabel : '至',
				xtype : 'textfield',
				symbol : '<=',
				dataIndex : ' pay_voucher_code',
				labelWidth : 40,
				style : 'margin-left:5px;margin-right:5px;'
			}, (this.hiddenVoucherStatus === false?
				{
				id : 'voucherStatus',
				fieldLabel : '凭证状态',
				xtype : 'combo',
				dataIndex : 'voucher_status',
				displayField : 'name',
				emptyText : '请选择',
				valueField : 'value',
				editable : false,
				store : 'pay.VoucherStatus',
				style : 'margin-left:5px;margin-right:5px;'
				}:null)
			,{
				fieldLabel : '凭证日期',
				xtype : 'datefield',
				dataIndex : 'vou_date',
			//	value : Ext.Date.format(new Date(), 'Ymd'),
				format : 'Ymd',
				style : 'margin-left:5px;margin-right:5px;'
			},{
				fieldLabel : '银行结算方式',
				xtype : 'combo',
				dataIndex : 'pb_set_mode_code',
				displayField : 'name',
				valueField : 'value',
	//			editable : false,
				queryMode: 'local', 
				store : 'pay.BankSetMode',
				style : 'margin-left:5px;margin-right:5px;'
			},{
				id : "zpno",
				fieldLabel : '支票号',
				xtype : 'textfield',
				dataIndex : 'checkNo',
				style : 'margin-left:5px;margin-right:5px;'
			},{
				id : 'amount',
				fieldLabel : '&nbsp;&nbsp;金额',
				xtype : 'numberfield',
				dataIndex : 'pay_amount',
				symbol : '=',
				datatype : '1',
				labelWidth : 40,
				style : 'margin-left:5px;margin-right:5px;',
				fieldStyle : 'text-align: right;'  ,   //文本框里显示内容右对齐
				decimalPrecision: 2  //小数精确位数
				
			}
			],
	initComponent : function() {
		this.callParent(arguments);
	}
});
