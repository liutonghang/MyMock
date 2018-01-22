/**
 * 行号补录窗口
 * @return {TypeName} 
 */
Ext.define('gxabc.BankNoWindow', {
	extend : 'Ext.window.Window',
	alias : 'widget.banknowindow',
	title : '行号补录对话框',
	width : 600,
	height : 360,
	layout : 'fit',
	resizable : false,
	modal : true,
	closeAction : 'hide',
	banknoStore : null, //收款行行号数据集
	payeeAccountNo : null, //收款行账号
	bankSetModeFieldLabel : '银行结算方式',  //银行结算方式命名 
	bankSetModeStore : 'pay.BankSetMode', //银行结算方式数据集
	bankBusinessTypeFieldLabel : '收款人账户类型',  //收款人账户类型命名 
	bankBusinessTypeStore : null, //收款人账户类型
	hiddenBankSetMode : false,  //是否隐藏银行结算方式
	hiddenBankBusinessType : false,  //是否隐藏收款人账户类型
	hiddenCityCode: true, //是否隐藏省市代码
	hiddenBankBizType: true, //是否隐藏银行业务类型
	bankBizTypes : 'pay.BankBizTypes',
	initComponent : function() {
		var me = this;
		Ext.applyIf(me, {
			items : [ {
				xtype : 'form',
				frame : true,
				bodyPadding : 5,
				layout : 'border',
				renderTo   : Ext.getBody(),
				items:[ {
					region : 'north',
					items : [ {
							id : 'banksetModeId',
							anchor: '100%',
							name : 'banksetMode',
							fieldLabel : this.bankSetModeFieldLabel,
							xtype : 'combo',
							displayField : 'name',
							valueField : 'value',
							editable : false,
							emptyText : '请选择',
							store : this.bankSetModeStore,
							labelWidth : 90,
							width : 500,
							style : 'margin-left:5px;margin-right:5px;margin-top:5px;margin-bottom:5px;',
							hidden : this.hiddenBankSetMode
						}, {
							anchor: '100%',
							name : 'cityCode',
							fieldLabel : '省市代码',
							xtype : 'textfield',
							labelWidth : 90,
							width : 350,
							editable : true,
							style : 'margin-left:5px;margin-right:5px;margin-top:5px;margin-bottom:5px;',
							hidden : this.hiddenCityCode
						}, {
							id : 'bankBusinessType',
							anchor: '100%',
							name : 'bankBusinessType',
							fieldLabel : this.bankBusinessTypeFieldLabel,
							xtype : 'combo',
							displayField : 'name',
							valueField : 'value',
							editable : false,
							emptyText : '请选择',
							store : this.bankBusinessTypeStore,
							labelWidth : 90,
							width : 500,
							style : 'margin-left:5px;margin-right:5px;margin-top:5px;margin-bottom:5px;',
							hidden : this.hiddenBankBusinessType
						},{
							anchor: '100%',
							name : 'bankbizType',
							fieldLabel : '银行业务',
							xtype : 'combo',
							displayField : 'name',
							valueField : 'value',
							editable : false,
							labelWidth : 90,
							width : 350,
							store : this.bankBizTypes,
							queryMode: 'local',
							style : 'margin-left:5px;margin-right:5px;margin-top:5px;margin-bottom:5px;',
							hidden : this.hiddenBankBizType
						}, {
							layout : 'hbox',
							bodyStyle : 'border-width: 0px 0px 0px 0px;',
							style : 'margin-left:5px;margin-right:5px;margin-top:5px;margin-bottom:5px;',
							items : [ {
								id : 'ori_bankid',
								name : 'ori_bankname',
								fieldLabel : '收款行名称',
								xtype : 'textfield',
								labelWidth : 90,
								width : 500
							}, {
								id : 'selectName',
								name : 'selectname',
						 		text : '查询',
								xtype : 'button',
								handler : function() {
									var oribankname = me.getForm().findField('ori_bankname').getValue();	
									var grid = Ext.ComponentQuery.query('gridpanel', me)[0];
									grid.getStore().load({
										params : {
											acctno : me.payeeAccountNo,
											bankname : encodeURI(encodeURI(oribankname)),
											fields : Ext.encode(["bank_name", "bank_no","match_ratio", "like_ratio"])
										},
										callback: function(records, operation, success) {											
											if(success && records.length>0){
												grid.getSelectionModel().select(0);
											}
										}
									});
								}
							} ]
						}, {
							anchor: '100%',
							name : 'bankRemarkFieldLable',
							fieldLabel : '附言',
							xtype : 'textfield',
							valueField : 'value',
							labelWidth : 90,
							width : 350,
							maxLength : 60,
							editable : true,
							style : 'margin-left:5px;margin-right:5px;margin-top:5px;margin-bottom:5px;'
					} ]
				}, { 
					region : 'center',
					xtype : 'gridpanel',
            		enableColumnMove: false, //禁止拖放列
					enableColumnResize: false,  //禁止改变列的宽度
					store : this.banknoStore,
					columns : [{
						text : '银行名称',
						dataIndex : 'bank_name',
						width : 300
					}, {
						text : '银行行号',
						dataIndex : 'bank_no',
						width : 300
					}],
					buttons : [ {
						text : '确定',
						handler : function() {
							me.fireEvent('bankNoclick',Ext.ComponentQuery.query('gridpanel', me)[0]);	
							this.up('form').getForm().reset();
							me.close();
						}
					}, {
						text : '取消',
						handler : function() {
							this.up('form').getForm().reset();
							this.up('window').close();
						}
					} ]
				} ]
			} ]
		});
		me.addEvents('bankNoclick');
		me.callParent(arguments);
	},
	getForm : function() {
		return this.down('form').getForm();
	}
});
