/*******************************************************************************
 * 公务卡查询区
 * 
 */
Ext.define('pb.view.pay.OfficialInfoQueryView', {
	extend : 'Ext.panel.Panel',
	alias : 'widget.officialInfoQueryView',
	title : '查询区',
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
				emptyText : '请选择',
				dataIndex : 'task_status',
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
				id:'agency_code',
				fieldLabel : '单位编码',
				xtype : 'textfield',
				symbol : '=',
				labelWidth : 90,
				dataIndex : 'agency_code',
				style : 'margin-left:5px;margin-right:5px;'
			}, {
				id:'card_holder_no',
				fieldLabel : '身份证号码',
				xtype : 'textfield',
				symbol : '=',
				labelWidth : 90,
				dataIndex : 'card_holder_no',
				style : 'margin-left:5px;margin-right:5px;'
			}]
});
