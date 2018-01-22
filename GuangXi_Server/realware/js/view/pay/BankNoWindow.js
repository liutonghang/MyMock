/**
 * 行号补录窗口
 * @return {TypeName} 
 */
Ext.define('pb.view.pay.BankNoWindow', {
	extend : 'Ext.window.Window',
	alias : 'widget.banknowindow',
	title : '行号补录',
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
	CityCodes        :'pay.AbcCityCodes',//省市代码
	hiddenBankSetMode : false,  //是否隐藏银行结算方式
	hiddenCityCode: true, //是否隐藏省市代码
	hiddenBankBizType: true, //是否隐藏银行业务类型
	hiddenFuzzy : true,//是否隐藏模糊查询
	bankBizTypes : 'pay.BankBizTypes',
	initComponent : function() {
		var me = this;
		Ext.applyIf(me, {
			items : [ {
				xtype : 'form',
				frame : true,
				bodyPadding : 3,
				layout : 'border',
				items:[ {
					region : 'north',
					defaults : {
						margin : "5 5 5 5"
					},
					items : [ {
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
							hidden : this.hiddenBankSetMode
						}, (this.hiddenCityCode ? null : {
							anchor: '100%',
							name : 'cityCode',
							fieldLabel : '省市代码',
							xtype : 'combo',
							labelWidth : 90,
							width : 350,
							editable : true,
							emptyText : '请选择',
							forceSelection: true,// 用户必须点击选择不能随意输入  
                            typeAhead: true,// 自动提示并补充列出相似的选项  
                            msgTarget:'side',
                            selectOnFocus : true,
							displayField : 'name',
                            valueField : 'value',
							store : this.CityCodes,
							queryMode: 'local',
							hidden : this.hiddenCityCode
						}), {
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
							hidden : this.hiddenBankBizType
						}, {
							layout : 'hbox',
							bodyStyle : 'border-width: 0px 0px 0px 0px;',
							items : [ {
								name : 'ori_bankname',
								fieldLabel : '收款行名称',
								xtype : 'textfield',
								labelWidth : 90,
								width : 500
							}, {
						 		text : '查询',
								xtype : 'button',
								handler : function() {
									var oribankname = me.getForm().findField('ori_bankname').getValue();
									var banksetmode = me.getForm().findField('banksetMode').getValue();
									 if(oribankname.replace(/^\s+|\s+$/).length<=0){
                                        Ext.Msg.alert("系统提示", "请输入查询信息");
                                        return;
                                    }
									var grid = Ext.ComponentQuery.query('gridpanel', me)[0];
									grid.getStore().proxy.url ='/realware/loadBanknos.do';
									grid.getStore().load({
										params : {
											acctno : me.payeeAccountNo,
											bankname : encodeURI(encodeURI(oribankname)),
											banksetmode : banksetmode,
											fields : Ext.encode(["bank_name", "bank_no"])
										},
										callback: function(records, operation, success) {											
											if(success && !Ext.isEmpty(operation.response.responseText) && records.length>0){
												grid.getSelectionModel().select(0);
											}else{
												grid.getSelectionModel().deselectAll();
											}
										}
									});
								}
							} ]
						}, {
							layout : 'hbox',
							bodyStyle : 'border-width: 0px 0px 0px 0px;',
                            hidden : this.hiddenFuzzy,
							items : [ {
								name : 'fuzzyNames',
								fieldLabel : '模糊查询字段',
								xtype : 'textfield',
								emptyText : '输入行名关键字 以空格分割',
								labelWidth : 90,
								width : 500
							}, {
						 		text : '模糊查询',
								xtype : 'button',
								handler : function(){
		                            var fuzzyNames = me.getForm().findField('fuzzyNames').getValue();
		                            if(fuzzyNames.replace(/^\s+|\s+$/).length<=0){
		                                Ext.Msg.alert("系统提示", "请输入模糊查询信息");
		                                return;
		                            }
		                            var banksetmode = me.getForm().findField('banksetMode').getValue();
		                            var grid = Ext.ComponentQuery.query('gridpanel', me)[0];
		                            var gridStore = grid.getStore();
		                            gridStore.proxy.url ='/realware/loadBanknosByFuzzyModel.do';
		                            gridStore.load({
		                                params: {
		                                    bankname: encodeURI(encodeURI(fuzzyNames)),
		                                    banksetmode: banksetmode,
		                                    fields: Ext.encode(["bank_name", "bank_no"])
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
							width : 460,
							maxLength : 60,
							editable : true
					} ]
				}, { 
					region : 'center',
					xtype : 'gridpanel',
            		enableColumnMove: false, //禁止拖放列
					enableColumnResize: true,  //禁止改变列的宽度
					store : this.banknoStore,
					onStoreLoad : function(thiz, records, successful, eOpts) {
						if (successful && !Ext.isEmpty(records)) {
                            this.getSelectionModel().select(0);
                        }
					},
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
							if(this.up('form').getForm().isValid()){
								me.fireEvent('bankNoclick',Ext.ComponentQuery.query('gridpanel', me)[0]);	
								me.hide();
							}
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
	},
	listeners : {
		beforeshow : function( thiz, eOpts ) {
			thiz.getForm().findField('fuzzyNames').setValue("");
		}
	}
});
