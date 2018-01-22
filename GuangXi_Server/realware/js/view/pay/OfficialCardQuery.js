
/***
 * 公务卡查询区
 * @memberOf {TypeName} 
 */
/**
 * 所属财政下拉列表框
 */
var ctype = Ext.create('Ext.data.Store', {
			fields : ['card_type_name', 'card_type_code'],
			data : [ {
						"card_type_name" : "单位",
						"value" : "0"
					}, {
						"card_type_name" : "个人",
						"card_type_code" : "1"
					}]
		});
Ext.define('pb.view.pay.OfficialCardQuery', {
	extend : 'Ext.panel.Panel',
	alias : 'widget.officialCardQuery',
	title : '查询区',
	collapsible : true,
	layout : {
		type : 'table',
		columns : 4
	},
	bodyPadding : 5,
	renderTo : Ext.getBody(),
	items : [{
				id : 'taskState',   //已改
				fieldLabel : '公务卡状态',
				xtype : 'combo',
				displayField : 'status_name',
				dataIndex : 'task_status',
				valueField : 'status_code',
				emptyText : '请选择',
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
				value : comboAdmdiv.data.length > 0 ? comboAdmdiv.data.getAt(0)
						.get('admdiv_code') : '',
				style : 'margin-left:5px;margin-right:5px;'
			}, {
				id : 'unit',
				fieldLabel : '所属单位',
				xtype : 'textfield',
				dataIndex : 'checkNo',
				style : 'margin-left:5px;margin-right:5px;'
			},{

				id : 'idnumber',
				fieldLabel : '身份证号',
				xtype : 'textfield',
				dataIndex : 'checkNo',
				style : 'margin-left:5px;margin-right:5px;'
			
			},{
				id : 'cardtype',
				fieldLabel : '卡类型',
				xtype : 'combo',
				dataIndex : 'card_type',
				displayField : 'card_type_name',
				valueField : 'card_type_code',
				style : 'margin-left:5px;margin-right:5px;',
				store : ctype
			},{
				fieldLabel : '公务卡卡号',
				xtype : 'textfield',
				dataIndex : 'card_no',
				style : 'margin-left:5px;margin-right:5px;'
				
			} ],
	initComponent : function() {
		this.callParent(arguments);
	}
});
