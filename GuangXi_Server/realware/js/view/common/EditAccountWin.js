Ext.define('pb.view.common.EditAccountWin', {
	extend : 'Ext.window.Window',
	alias : 'widget.editAccountWin',
	resizable : false,
	draggable : false,
	layout : 'fit',
	width : 350,
    defaults: {width: 300},
	modal : true,
	title : '编辑账户窗口',
	isEdit : null,
	initComponent : function() {
		var me = this;
		Ext.applyIf(me, {
			items : [ {
					xtype : 'form',
					frame: true,
	                bodyPadding: 15,
					items : [
//						{
//						xtype: 'panel',
//						border: 0,
//						width: 350,
//						layout: 'hbox',
//						bodyStyle: "background:#DFE9F6;padding:0px 0px 5px 0px",
//						items: [{
//							id : 'bank_chose_id',
//							hidden : true,
//							xtype: 'textfield'
//						},{
//							id : 'bank_chose',
//							xtype: 'textfield',
//							fieldLabel: '所属网点',
//							readOnly: 'true',
//							msgTarget: 'side',
//							allowBlank: false,
//							value: ''
//						}, {
//							id : 'qbank',
//							xtype: 'button',
//							text: '查询',
//							iconCls : 'log'
//						}]
//				},
				{
					name : 'AccountName',
					fieldLabel : '账户名称',
					xtype : 'textfield',
					anchor: '100%',
					allowBlank : false,
					labelWidth: 100
				}, {
					name : 'AccountNo',
					fieldLabel : '账号',
					vtype:"accountId",
					//设置账号的长度
					maxLength : 20,
					xtype : 'textfield',
					anchor: '100%',
					//readOnly : this.isEdit,
					disabled : this.isEdit,
					allowBlank : false,
					labelWidth: 100
				}, {
					name : 'ZeroAgencyCode',
					fieldLabel : '单位编码',
					xtype : 'textfield',
					anchor: '100%',
					hidden : Ext.ComUtil.getACVis(account_type_code),
					allowBlank : Ext.ComUtil.getACVis(account_type_code),
					labelWidth: 100
				},  {
					name : 'ZeroAgencyName',
					fieldLabel : '单位名称',
					xtype : 'textfield',
					hidden : Ext.ComUtil.getACVis(account_type_code),
					allowBlank : Ext.ComUtil.getACVis(account_type_code),
					anchor: '100%',
					labelWidth: 100
				}, {
					name : 'ClearBankNo',
					fieldLabel : '银行行号',
					xtype : 'textfield',
					hidden :  account_type_code==4? false: true,
					allowBlank :  account_type_code==4? false: true,
					anchor: '100%',
					labelWidth: 100
				},{
					name : 'ClearBankName',
					fieldLabel : '银行名称',
					xtype : 'textfield',
					hidden :  account_type_code==4? false: true,
					allowBlank :  account_type_code==4? false: true,
					anchor: '100%',
					labelWidth: 100
				},{
					id : 'admdiv_code',
					fieldLabel : '所属财政',
					name : 'admdiv_code',
					xtype : 'combo',
					dataIndex : 'admdiv_code',
					displayField : 'admdiv_name',
					emptyText : '请选择',
					valueField : 'admdiv_code',
					editable : false,
					store : comboAdmdiv,
					labelWidth: 100,
					allowBlank : false,
					value : ''
				}, 
				{
					id : 'fund_type_code',
					name : 'FundTypeCode',
					xtype : 'combo',
					fieldLabel : '资金性质',
					dataIndex : 'fund_type_code',
					displayField : 'name',
					emptyText : '请选择',
					valueField : 'code',
					labelWidth : 100,
					queryMode : 'local',
					editable : false,
					hidden : Ext.ComUtil.getFTCVis(account_type_code),
					allowBlank : Ext.ComUtil.getFTCVis(account_type_code),
					store : 'common.ElementValuesStore'
				},
				{
					id :'accounttypecode',
					name :'AccountTypeCode',
					xtype : 'combo',
					fieldLabel : '账户类型',
					labelWidth : 100,
					dataIndex : 'account_type_code',
					displayField: 'accont_type_name',
					emptyText: '请选择',
					valueField: 'account_type_code',
					hidden : Ext.ComUtil.getATCVis(account_type_code),
					allowBlank : Ext.ComUtil.getATCVis(account_type_code),
					editable :false,
					store: 'common.AgentAccountTypes'
				},
				{
					name : 'OrgCode',
					fieldLabel : '机构类型',
					xtype : 'textfield',
					hidden :  account_type_code==4? false: true,
					allowBlank :  account_type_code==4? false: true,
					anchor: '100%',
					labelWidth: 100
				},{
					name : 'IsPbc',
					fieldLabel : '是否人行账户',
					xtype : 'checkbox',
					hidden :  account_type_code==4? false: true,
					allowBlank :  account_type_code==4? false: true,
					anchor: '100%',
					labelWidth: 100
				},{
					name : 'isSamebank',
					fieldLabel : '是否同行账户',
					xtype : 'checkbox',
					hidden :  account_type_code==4? false: true,
					allowBlank :  account_type_code==4? false: true,
					anchor: '100%',
					labelWidth: 100
				},{
					name : 'account_id',
					xtype : 'textfield',
					hidden : true,
					anchor: '100%'
				}],
				buttons : [ {
					id : 'accountSave',
					text : '确定'
				}, {
					id : 'accountCancel',
					text : '取消'
				} ]
			} ]
		})
		me.callParent(arguments);
	},
	getForm : function() {
		return this.down('form').getForm();
	},
	setRecord : function(record) {
		this.getForm().loadRecord(record);
	},
	setItemsValue : function(record){
		var form = this.getForm();
		form.findField('admdiv_code').setValue(record.get('admdiv_code'));
		form.findField('AccountName').setValue(record.get('account_name'));
		form.findField('AccountNo').setValue(record.get('account_no'));
		form.findField('ZeroAgencyCode').setValue(record.get('agency_code'));
		form.findField('ZeroAgencyName').setValue(record.get('agency_name'));
		form.findField('account_id').setValue(record.get('account_id'));
		form.findField('ClearBankNo').setValue(record.get('bank_no'));
		form.findField('ClearBankName').setValue(record.get('bank_name'));
		form.findField('FundTypeCode').setValue(record.get('fund_type_code'));
		form.findField('AccountTypeCode').setValue(record.get('account_type_code'));
		form.findField('OrgCode').setValue(record.get('org_code'));
		form.findField('IsPbc').setValue("是"==record.get('is_pbc') ? true : false);
		form.findField('isSamebank').setValue("是"==record.get('is_samebank') ? true : false);
	}
});
