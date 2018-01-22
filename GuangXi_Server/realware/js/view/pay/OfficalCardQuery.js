/***
 * 公务卡查询区
 * @memberOf {TypeName} 
 */
Ext.define('pb.view.pay.OfficalCardQuer', {
	extend : 'Ext.panel.Panel',
	alias : 'widget.officalCardQuer',
	title : '查询区',
	collapsible : true,
	layout : {
		type : 'table',
		columns : 4
	},
	bodyPadding : 5,
	renderTo : Ext.getBody(),
	items : [{
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
			},{
				id : 'cardState',   //已改
				fieldLabel : '公务卡状态',
				xtype : 'combo',
				displayField : 'status_name',  //改
				emptyText : '请选择',
				valueField : 'status_id',   //改
				editable : false,
				queryMode: 'local', 
				style : 'margin-left:5px;margin-right:5px;',
				store : 'common.MenuStatus'
			},{
				id : 'cardType',   //已改
				fieldLabel : '公务卡类型',  //已改
				xtype : 'combo',
				displayField : 'status_name',  //改
				emptyText : '请选择',
				valueField : 'status_id',   //改
				editable : false,
				queryMode: 'local', 
				style : 'margin-left:5px;margin-right:5px;',
				store : 'common.MenuStatus'
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
			
			} ],
	initComponent : function() {
		this.callParent(arguments);
	}
});
