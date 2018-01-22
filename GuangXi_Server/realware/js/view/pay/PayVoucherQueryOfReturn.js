/***
 * 查询区
 * @memberOf {TypeName} 
 */
Ext.define('pb.view.pay.PayVoucherQueryOfReturn', {
	extend : 'Ext.panel.Panel',
	alias : 'widget.payVoucherQueryOfReturn',
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
				style : 'margin-left:5px;margin-right:5px;'
			}, {
				fieldLabel : '至',
				xtype : 'textfield',
				symbol : '<=',
				dataIndex : ' pay_voucher_code',
				labelWidth : 40,
				style : 'margin-left:5px;margin-right:5px;'
			}, {
				fieldLabel : '凭证日期',
				xtype : 'datefield',
				dataIndex : 'vou_date',
				format : 'Ymd',
				style : 'margin-left:5px;margin-right:5px;'
			}
			],
	initComponent : function() {
		this.callParent(arguments);
	}
});
