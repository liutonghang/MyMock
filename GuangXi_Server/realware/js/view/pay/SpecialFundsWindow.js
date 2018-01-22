/**
 * 专项资金
 * @return {TypeName} 
 */
Ext.define('pb.view.pay.SpecialFundsWindow', {
	extend : 'Ext.window.Window',
	alias : 'widget.specialfundswindow',
	layout : 'fit',
	FundSrcStore1 : 'pay.FundSrcStore',
	ComboSpclTypeStore : 'pay.ComboSpclType',
	modal : true,
	width : 380,
	height : 220,
	resizable : false,
	initComponent : function() {
		var me = this;
		Ext.applyIf(me, {
			items : [ {
				xtype: 'form',
                frame: true,
                bodyPadding: 5,
                items : [ {
					id :'cntrlSpclFundBdgtdocno',
//					name:'cntrlSpclFundBdgtdocno',
					fieldLabel : '中央专项资金预算文号',
					labelWidth : 130,
					xtype : 'textfield'
				},{
					id :'localSeprBdgtdocno',
//					name : 'localSeprBdgtdocno',
					fieldLabel : '地方分解预算文号',
					labelWidth : 130,
					xtype : 'textfield'
				}
//				,{
//						id :'acctWarrntcode',
//						fieldLabel : '支付令编码(电子票号)',
//						labelWidth : 130
//				}
//				,{
//					id :'bdgtSubjcode',
//					name : 'bdgtSubjcode',
//					fieldLabel : '预算科目编码',
//					labelWidth : 130
//				}
				,{
					id :'fundSrc',
//					name:'fundSrc',
					fieldLabel : '资金来源',
					xtype : 'combo',
					dataIndex : 'fundSrc',
					displayField : 'name',
					emptyText : '请选择',
					valueField : 'value',
					store : this.FundSrcStore1,
					value : '01',
					editable : false,
					labelWidth : 130
				},{
					id : 'Spcltype',
					fieldLabel : '专项资金类别',
					xtype : 'combo',
					dataIndex : 'spcltype',
					displayField : 'name',
					emptyText : '请选择',
					valueField : 'value',
					store : this.ComboSpclTypeStore,
					value : '01',
					editable : false,
					labelWidth : 130
				},{
					id :'remark',
//					name : 'remark',
					xtype : 'textfield',
					fieldLabel : '备注',
					labelWidth : 130
				}],
				buttons: [{
					text : '确定',
					handler : function() {
						var form = this.up('form').getForm();
						if (form.isValid()) {
							me.fireEvent('confirmclick',me);
                			me.close();
						}
					}
				}
				,{
			    	text: '取消',
			        handler: function() {
						this.up('form').getForm().reset();	
						this.up('window').close();
			         }
			     }]
			}]
		});
		me.addEvents('confirmclick');
		me.callParent(arguments);
	},
	getForm : function() {
		return this.down('form').getForm();
	}
});