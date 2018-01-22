/*******************************************************************************
 * 公务卡签章发送查询区配置
 * 
 */
Ext.define('pb.view.pay.PrCardChangeSendView', {
	extend : 'Ext.panel.Panel',
	alias : 'widget.prCardChangeSendView',
	title : '查询区',
	layout : {
		type : 'table',
		columns : 4
	},
	bodyPadding : 5,
	items : [{
				id : 'taskState',
				fieldLabel : '凭证状态',
				xtype : 'combo',
				displayField : 'status_name',
				emptyText : '请选择',
				dataIndex : 'task_status',
				valueField : 'status_code',
				editable : false,
				labelWidth : 70,
				queryMode : 'local',
				style : 'margin-left:5px;margin-right:5px;',
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
			}, {
				id : 'agency_code',
				fieldLabel : '单位代码',
				xtype : 'textfield',
				symbol : '=',
				labelWidth : 70,
				dataIndex : 'agency_code',
				style : 'margin-left:5px;margin-right:5px;'
			}, {
				id : 'card_holder_no',
				fieldLabel : '身份证号',
				xtype : 'textfield',
				symbol : '=',
				labelWidth : 70,
				dataIndex : 'card_holder_no',
				style : 'margin-left:5px;margin-right:5px;'
			}]
});
	
