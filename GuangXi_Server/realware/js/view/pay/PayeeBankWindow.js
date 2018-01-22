/**
 * 行号搜索
 * @return {TypeName} 
 */
Ext.define('pb.view.pay.PayeeBankWindow', {
	extend : 'Ext.window.Window',
	alias : 'widget.payeeBankWindow',
	title : '行号搜索对话框',
	width : 500,
	height : 360,
	layout : 'fit',
	resizable : false,
	modal : true,
	closeAction : 'hide',
	banknoStore : null, //收款行行号数据集
	payeeAccountNo : null, //收款行账号
	bankSetModeFieldLabel : '银行结算方式',  //银行结算方式命名 
	hiddenBankSetMode : false,  //是否隐藏银行结算方式
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
					items : [{
							layout : 'hbox',
							bodyStyle : 'border-width: 0px 0px 0px 0px;',
							style : 'margin-left:5px;margin-right:5px;margin-top:5px;margin-bottom:5px;',
							items : [ {
								name : 'ori_bankname',
								fieldLabel : '收款行名称',
								xtype : 'textfield',
								labelWidth : 90,
								width : 320
							}, {
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
												if(records[0].get('bank_no')==''){
													grid.getStore().removeAll();
													grid.getStore().add({
														  bank_name:oribankname,
														  bank_no:''
													});
												} 
												grid.getSelectionModel().select(0);
											}
										}
									});
								}
							} ]
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
						width : 250
					}, {
						text : '银行行号',
						dataIndex : 'bank_no',
						width : 250
					}],
					buttons : [ {
						text : '确定',
						handler : function() {
							me.fireEvent('bankNoclick',Ext.ComponentQuery.query('gridpanel', me)[0]);	
							me.hide();
						}
					}, {
						text : '取消',
						handler : function() {
							this.up('form').getForm().reset();
							this.up('window').hide();
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
