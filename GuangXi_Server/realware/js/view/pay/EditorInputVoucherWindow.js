/***
 * 代编授权支付凭证录入窗口
 * @memberOf {TypeName} 
 */
Ext.define('pb.view.pay.EditorInputVoucherWindow', {
	extend : 'Ext.window.Window',
	alias : 'widget.editorVoucherInputWindow',			
	requires : [ 'pb.view.common.ElementTreeInput','pb.view.common.ElementTreeInputIsAllowBlank' ],
	layout : 'fit',
	modal : true,
	title : '授权支付基本信息录入',
	resizable : false,
	draggable : false,
	width : 600,
	height : 510,
	initComponent : function() {
		var me = this;
		Ext.applyIf(me, {
			items : [ {
				layout : 'border',
				items : [ {
					region : 'north',
					bodyPadding : 5,
					xtype : 'form',
					layout: {
        				type: 'table',
        				columns: 2
    				},
    				defaults : {
						labelWidth : 90,
						style : 'margin-left:5px;margin-bottom:5px;margin-right:5px;'
					},
					title : '查询条件',
					collapsible : true,
					items : [ {
						id:'FUND_TYPEHB',
						xtype : 'treeInputIsAllowBlank',
						labelName : '<font color=red>*</font>资金性质',
						eleCode : 'FUND_TYPE',
						listeners:{
							specialkey: function (field, o) {
								if (o.getKey()==Ext.EventObject.ENTER){     
                           				Ext.ComponentQuery.query("treeInputIsAllowBlank[id=DEP_PROHB] textfield")[0].focus();
                       			 }  
								
							}
						}
					}, 
					 {
						id:'DEP_PROHB',
						xtype : 'treeInputIsAllowBlank',
						labelName : '<font color=red>*</font>预算项目',
						eleCode : 'DEP_PRO',
						listeners:{
							specialkey: function (field, o) {
								if (o.getKey()==Ext.EventObject.ENTER){     
                           				Ext.getCmp("pay_account_codeHB").focus();
                       			 }  
								
							}
						}
					}, 
					{
						id:'pay_account_codeHB',
						name : 'pay_account_code',
						xtype : 'textfield',
						fieldLabel : '<font color=red>*</font>付款人账号',
						width : 240,
						allowBlank:false,
						listeners:{
							specialkey: function (field, o) {
								if (o.getKey()==Ext.EventObject.ENTER){ 
									var tempController = pb.app.getController('pay.EditorVouchers');
									tempController.queryPlanDetail(1);
                       			 }  
								
							}
						}
					} ,  
					{
						name:'AGENCY',
						xtype : 'textfield',
						fieldLabel : '预算单位',
						readOnly : true,
        				width : 240
					}, {
						name:'EXP_FUNC',
						xtype : 'textfield',
						fieldLabel : '功能分类',
						width : 240,
						readOnly : true
					}, {
						name:'EXP_ECO',
						xtype : 'textfield',
						fieldLabel : '经济分类',
						readOnly : true,
						width : 240
					}, {
						id : 'queryAcctBtn',
						xtype : 'button',
						text : '获取付款人信息'
					} ]
				}, {
					region : 'center',
					xtype : 'form',
					title : '编辑区',
					bodyPadding : 5,
					layout: {
        				type: 'table',
        				columns: 2
    				},
    				defaults : {
						labelWidth : 90,
						width : 240,
						style : 'margin-left:5px;margin-bottom:5px;margin-right:35px;'
					},
					items : [
					       {			
					    	id:'exp_eco_code1',
     				        name : 'exp_eco_code1',
							xtype : 'textfield',
							fieldLabel : '经济分类编码1',
//							fieldLabel : '<font color=red>*</font>经济分类编码1',
//							allowBlank : false,
							regex:/^\d{1,42}$/,
							regexText:'请输入有效编码',
							msgTarget:'side', 
							listeners: {
								specialkey: function (field, o) {
									if (o.getKey()==Ext.EventObject.ENTER){     
                           				Ext.getCmp("exp_eco_name1").focus();
                       			 	}  								
								},
					  			blur: function (field, value,o) {
					  			    var eco_code1 = field.getRawValue().replace(/(^\s*)|(\s*$)/g , '');
					  				if(!(/.*[a-zA-Z\u4e00-\u9fa5]+.*$/.test(eco_code1))){
					  					var admdivCode =  Ext.getCmp('admdivCode').getValue();
										var params = {fieldValue:eco_code1,eleCode:'EXP_ECO',admdivCode:admdivCode};
					  					Ext.Ajax.request({
											 url:'/realware/loadElementByValue.do', 
											 jsonData : Ext.JSON.encode(params),
											 success: function(response,o) {
												 var respTxt = Ext.JSON.decode(response.responseText);
												 if(null != respTxt.name && undefined!= respTxt.name&&""!=respTxt.name){
													 Ext.getCmp('exp_eco_name1').setValue(respTxt.name);
												 }
											 } 
										 })
					  				}
		                        }
							}
						} ,{
							id :'exp_eco_name1',
							name : 'exp_eco_name1',
							xtype : 'textfield',
							fieldLabel : '经济分类名称1',
//							allowBlank : false,
							regex:/^[\S]{1,60}$/, 
							listeners: {
								specialkey: function (field, o) {
									if (o.getKey()==Ext.EventObject.ENTER){   
										
                           				Ext.getCmp("exp_eco_code2").focus();
                       			 	}  								
								}
							}
						},{
							id:'exp_eco_code2',
							name : 'exp_eco_code2',
							xtype : 'textfield',
							fieldLabel : '经济分类编码2',
//							allowBlank : false,
							regexText:'请输入有效编码',
							msgTarget:'side', 
							regex:/^\d{1,42}$/,
							listeners: {
								specialkey: function (field, o) {
									if (o.getKey()==Ext.EventObject.ENTER){     
                           				Ext.getCmp("exp_eco_name2").focus();
                       			 	}  								
								},
					  			blur: function (field, value,o) {
					  				var eco_code1 = Ext.getCmp('exp_eco_code1').getValue().replace(/(^\s*)|(\s*$)/g , '');
					  				if(!(/.*[a-zA-Z\u4e00-\u9fa5]+.*$/.test(eco_code1)) && ''!= eco_code1){
					  					 	var eco_code2 = field.getRawValue().replace(/(^\s*)|(\s*$)/g , '');
							  				if(!(/.*[a-zA-Z\u4e00-\u9fa5]+.*$/.test(eco_code2))){
							  					eco_code1 = eco_code1+eco_code2;
							  					var admdivCode =  Ext.getCmp('admdivCode').getValue();
												var params = {fieldValue:eco_code1,eleCode:'EXP_ECO',admdivCode:admdivCode};
							  					Ext.Ajax.request({
													 url:'/realware/loadElementByValue.do', 
													 jsonData : Ext.JSON.encode(params),
													 success: function(response,o) {
														 var respTxt = Ext.JSON.decode(response.responseText);
														 if(null != respTxt.name && undefined!= respTxt.name&&""!=respTxt.name){
															 Ext.getCmp('exp_eco_name2').setValue(respTxt.name);
														 }
													 } 
												 })
							  				}
					  				}
		                        }
							}
						},{
							id:'exp_eco_name2',
							name : 'exp_eco_name2',
							xtype : 'textfield',
							fieldLabel : '经济分类名称2',
//							allowBlank : false,
							regex:/^[\S]{1,60}$/, 
							listeners: {
								specialkey: function (field, o) {
									if (o.getKey()==Ext.EventObject.ENTER){     
                           				Ext.getCmp("payee_account_nameHB").focus();
                       			 	}  								
								}
							}
						},         
					          
					 {
						name : 'pay_account_name',
						xtype : 'textfield',
						fieldLabel : '付款人全称',
						readOnly : true,
						allowBlank : false
					}, {
						id:'payee_account_nameHB',
						name : 'payee_account_name',
						xtype : 'textfield',
						fieldLabel : '<font color=red>*</font>收款人全称',
						allowBlank : true, 
						listeners: {
							specialkey: function (field, o) {
								if (o.getKey()==Ext.EventObject.ENTER){     
                       				Ext.getCmp("payee_account_No1").focus();
                   			 	}  								
							}
						}
					}, {
						name : 'pay_account_code',
						xtype : 'textfield',
						fieldLabel : '付款人账号',
						readOnly : true,
						allowBlank : false
					}, {
						id:'payee_account_No1',
						name : 'payee_account_code',
						xtype : 'textfield',
						fieldLabel : '<font color=red>*</font>收款人账号1',
						allowBlank : true,
						regex:/^[0-9a-zA-Z-]+$/, 
						listeners: {
							specialkey: function (field, o) {
								if (o.getKey()==Ext.EventObject.ENTER){     
                       				Ext.getCmp("payee_account_No2").focus();
                   			 	}  								
							},
							blur: function (field, o) {
								var accountNo = field.getValue();
								
	
								if(!Ext.isEmpty(accountNo)){
									Ext.Ajax.request({
									url : '/realware/queryAccountName.do',
									method : 'POST',
									timeout : 180000,
									params : {
										accountNo : accountNo,
										menu_id :  Ext.PageUtil.getMenuId()
									},
									success : function(response, options) {
										 Ext.getCmp('payee_account_nameHB').setValue(response.responseText);
									},	
									failure : function(response, options) {
									}
								});
								}
							}
						}
					}, {
						name : 'pay_account_bank',
						xtype : 'textfield',
						fieldLabel : '付款人开户行',
						readOnly : true,
						allowBlank : false
					}, {
						id:'payee_account_No2',
						name : 'payee_account_code1',
						xtype : 'textfield',
						fieldLabel : '<font color=red>*</font>收款人账号2',
						allowBlank : true,
						regex:/^[0-9a-zA-Z-]+$/, 
						listeners: {
							specialkey: function (field, o) {
								if (o.getKey()==Ext.EventObject.ENTER){     
                       				Ext.ComponentQuery.query("treeInputIsAllowBlank[id=set_modeHB] textfield")[0].focus();
                   			 	}  								
							}
						}
					},   {
						id:'set_modeHB',
						name : 'set_mode',
						labelName : '<font color=red>*</font>结算方式',
						xtype : 'treeInputIsAllowBlank',
						eleCode : 'SET_MODE'
					}, {
						id:'payee_account_bankHB',
						name : 'payee_account_bank',
						xtype:'treeInput',
						eleCode:'PAYEE_BANK',
						labelName :'<font color=red>*</font>收款人开户行'
//						listeners: {
//							specialkey: function (field, o) {
//
//								if (o.getKey()==Ext.EventObject.ENTER){ 
//
//									Ext.getCmp("checknoHB").focus();
//                   			 	}  								
//							}
//						}
					}, {
						id:'checknoHB',
						name : 'checkno',
						xtype : 'textfield',
						fieldLabel : '支票号(结算号)',
						listeners:{
							specialkey: function (field, o) {
								if (o.getKey()==Ext.EventObject.ENTER){     
                           				Ext.getCmp("payee_account_bank_no").focus();
                       			 }  
								
							}
						}
					}, {
						id:'payee_account_bank_no',
    					name : 'payee_account_bank_no',
						xtype : 'textfield',
						fieldLabel : '收款行行号',
						enableKeyEvents : true,
						listeners:{
							specialkey: function (field, o) {
								if (o.getKey()==Ext.EventObject.ENTER){     
                           				Ext.getCmp("plan_amount").focus();
                       			 }  
								
							},
							blur: function (field, o) {
								var bankNo = field.getValue();
								var item = Ext.getCmp("payee_account_bankHB").items.get(0);
	
								if(!Ext.isEmpty(bankNo)&&Ext.isEmpty(item.rawValue)){
									Ext.Ajax.request({
									url : '/realware/loadBankNameByNo.do',
									method : 'POST',
									timeout : 180000,
									params : {
										bankNo : field.getValue(),
										menu_id :  Ext.PageUtil.getMenuId()
									},
									success : function(response, options) {
										Ext.getCmp("payee_account_bankHB").items.get(0).setValue(response.responseText);
									},	
									failure : function(response, options) {
									}
								});
								}
								
							}
					
							
							
						}
					}, {
						id:'plan_amount',
						name : 'plan_amount',
						fieldLabel : '<font color=red>*</font>支付金额',
						xtype : 'textfield', 
						allowBlank : false,
						regex:/^[0-9]|[,]+(.[0-9]{2})?$/,
						enableKeyEvents : true,
				  		listeners: {
							specialkey: function (field, o) {
								if (o.getKey()==Ext.EventObject.ENTER){     
                           				Ext.getCmp("is_expedited").focus();
                       			 }  
								
							},
				  			blur: function (field, value) {
	                            value =  field.getRawValue();
	                            field.setValue(Ext.util.Format.number(value, '0,0.00'));
	                            if(value>50000){
					  				  Ext.getCmp('is_expedited').setRawValue('HVPS大额支付');
					  			}else{
					  				  Ext.getCmp('is_expedited').setRawValue('BEPS小额支付');
					  			}
	                        }  
	                    } 
					}, {
						id :'is_expedited',
						name:'is_expedited',
						fieldLabel:'渠道类型',
						xtype:'combobox',
						displayField:'name',
						valueField:'value',
						editable:false,
						value:'3',
						store:Ext.create('Ext.data.Store',{
							fields:['name','value'],
							data:[
							      {
							    	'name':'HVPS大额支付',
	    							'value' :'4'
	    						  },
							      {
	    						    'name':'BEPS小额支付',
	    						    'value' :'3'
	    					      }
							]
						}),
						listeners: {
							specialkey: function (field, o) {
								if (o.getKey()==Ext.EventObject.ENTER){     
                           				Ext.ComponentQuery.query("treeInputIsAllowBlank[id=pay_summary] textfield")[0].focus();
                       			 }  
								
							},
				  			blur: function (field, value) {
				  			   if(Ext.getCmp('plan_amount').getValue()>50000){
				  				  Ext.getCmp('is_expedited').setRawValue('HVPS大额支付');
				  			   } 
	                        }  
	                    } 
						
						
					} , {
						id:'pay_summary',
						name : 'pay_summary',
						xtype : 'treeInputIsAllowBlank',
						labelName : '支付用途',
						eleCode : 'PAY_SUMMARY'
					},  {
						id:'trade_Type_HB',
						name : 'modeName',
						fieldLabel : '转账类型',
						xtype : 'combobox',
						displayField: 'name',
    					valueField: 'value',
    					editable : false,
    					store : 'pay.BankSetMode',
//    					value : '同行转账',
//    					store : Ext.create('Ext.data.Store', {
//    							fields : ['name', 'value'],
//    							data : [ {
//    								'name' : '同行转账'
//    							} , {
//    								'name' : '跨行转账'
//    							} ]
//    					}),
						listeners: {
							specialkey: function (field, o) {
								if (o.getKey()==Ext.EventObject.ENTER){     
                           				Ext.getCmp("pay_mgrHB").focus();
                       			 }  
								
							}
					}
    				}, {
    					id:'pay_mgrHB',
						name : 'pay_mgr',
						fieldLabel : '支付类型',
						xtype : 'combobox',
						displayField: 'name',
    					valueField: 'code',
    					value : '1',
    					editable : false,
    					store : Ext.create('Ext.data.Store', {
    							fields : ['code', 'name'],
    							data : [ {
    								'code' : '1',
    								'name' : '正常支付'
    							},{
    								'code' : '2',
    								'name' : '限额支票'
    							} ]
    					}),
						listeners: {
							specialkey: function (field, o) {
								if (o.getKey()==Ext.EventObject.ENTER){     
                           				Ext.getCmp("remarkHB").focus();
                       			 }  
								
							}
    				}
					} ,{
						id:'remarkHB',
						name : 'remark',
						xtype : 'textfield',
						fieldLabel : '备注',
						listeners: {
							specialkey: function (field, o) {
								if (o.getKey()==Ext.EventObject.ENTER){ 
											if(Ext.getCmp("requestPayBtn").disabled==false){
												var tempController = pb.app.getController('pay.EditorVouchers');
												tempController.saveAndRequestPay();
											}
                           					
                       			 }  
								
							}
    				}
					} ]
				} ],
				buttons : [ {
					id : 'requestPayBtn',
					text : '请求支付'
				},/* {
					id : 'payBtn',
					text : '支付确认',
					disabled : true
				},*/ {
					text : '取消',
					handler : function() {
						me.close();
					}
				} ]
			} ]
		});
		me.callParent(arguments);
	},
	//计划额度
	balance : null,
	setBalance:function(balance){
		this.balance = balance;
	}
	
});


