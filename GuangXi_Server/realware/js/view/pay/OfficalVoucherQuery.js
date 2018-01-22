/***
 * 查询区
 * @memberOf {TypeName} 
 */

//------------------------------------------------------------------------------
var ctype = Ext.create('Ext.data.Store', {
			fields : ['name', 'value'],
			data : [{
						"name" : "正常",
						"value" : "1"
					}, {
						"name" : "已注销",
						"value" : "2"
					}]
		});


var cstus = Ext.create('Ext.data.Store', {
			fields : ['name', 'value'],
			data : [ {
						"name" : "单位",
						"value" : "0"
					}, {
						"name" : "个人",
						"value" : "1"
					}]
		});


//------------------------------------------------------------------------------

Ext.define('pb.view.pay.OfficalVoucherQuery', {
	extend : 'Ext.panel.Panel',
	alias : 'widget.officalVoucherQuery',
	title : '查询区',
	collapsible : true,
	layout : {
		type : 'table',
		columns : 4
	},
	bodyPadding : 5,
	renderTo : Ext.getBody(),
	items : [{
				id : 'taskState',
				fieldLabel : '卡状态',
				xtype : 'combo',
				displayField : 'card_status',
				emptyText : '请选择',
				valueField : 'card_status',
				editable : false,
				queryMode: 'local', 
				style : 'margin-left:5px;margin-right:5px;',
				store : cstus
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
				
				fieldLabel : '所属单位',
				xtype : 'textfield',
				//symbol : '>=',
				dataIndex : 'pay_voucher_code',
				style : 'margin-left:5px;margin-right:5px;'
			},
			{
			fieldLabel : '身份证号',
			xtype : 'combo',
			dataIndex : 'card_holder_no',
			/*displayField : 'name',
			valueField : 'value',*/
//			editable : false,
			//queryMode: 'local', 
			dataIndex : 'card_hold_no' ,
			style : 'margin-left:5px;margin-right:5px;'
		},
			{
				fieldLabel : '卡类型',
				xtype : 'textfield',
				dataIndex : 'card_type',
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
