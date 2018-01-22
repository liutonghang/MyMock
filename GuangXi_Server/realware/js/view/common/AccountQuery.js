/***
 * 查询区
 * @memberOf {TypeName} 
 */
Ext.define('pb.view.common.AccountQuery', {
	extend : 'Ext.panel.Panel',
	alias : 'widget.accountQuery',
	title : '查询区',
	collapsible : true,
	layout : {
		type : 'table',
		columns : 6
	},
	defaults : {
		bodyStyle : 'padding:3px',
		labelWidth : 60
	},
	frame : true,
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
			}, {
				fieldLabel : '账户名称',
				xtype : 'textfield',
				symbol : 'like',
				dataIndex : 'account_name',				
				style : 'margin-left:5px;margin-right:5px;'
			}, {
				fieldLabel : '账号',
				xtype : 'textfield',
				dataIndex : 'account_no',
				symbol : 'like',
				labelWidth : 35,
				style : 'margin-left:5px;margin-right:5px;'
			},{
				id : 'agencycode',
				fieldLabel : '单位编码',
				xtype : 'textfield',
				dataIndex : 'agency_code',
				hidden : account_type_code==12? false: true,
				style : 'margin-left:5px;margin-right:5px;'
			}, {
				id : 'fundTypeCode',
				xtype : 'combo',
				fieldLabel : '资金性质',
				dataIndex : 'fund_type_code',
				displayField : 'name',
				emptyText : '请选择',
				valueField : 'code',
				labelWidth : 55,
				queryMode : 'local',
				//editable : false,
				hidden : Ext.ComUtil.getFTCVis(account_type_code),
				store : 'common.ElementValuesStore',
				style : 'margin-left:5px;margin-right:5px;'
			},{
				id :'AccountTypeCode',
				name :'account_type_code',
				xtype : 'combo',
				fieldLabel : '账户类型',
				dataIndex : 'account_type_code',
				displayField: 'accont_type_name',
				emptyText: '请选择',
				valueField: 'account_type_code',
				hidden : Ext.ComUtil.getATCVis(account_type_code),
				allowBlank : Ext.ComUtil.getATCVis(account_type_code),
				editable :false,
				store: 'common.AgentAccountTypes'
			},{
				id : 'bankCode',
				fieldLabel : '所属网点',
				xtype : 'textfield',
				dataIndex : 'bank_code',
				hidden : account_type_code==12? false: true,
				symbol : 'like',
				style : 'margin-left:5px;margin-right:5px;'
			}],
	initComponent : function() {
		this.callParent(arguments);
	},
	
	setBtnVis : function(account_type_code){
		if(account_type_code == 120){
			Ext.getCmp('bankCode').setVisible(false);
//			Ext.getCmp('fundTypeCode').setVisible(false);
//			Ext.getCmp('agencycode').setVisible(false);			
		}
	}
})
