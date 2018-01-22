/***
 * 要素辅助录入树
 * @memberOf {TypeName} 
 * @return {TypeName} 
 */
Ext.define('pb.view.common.ElementTreeInputIsAllowBlank', {
	extend : 'Ext.panel.Panel',
	alias : 'widget.treeInputIsAllowBlank',
	layout : 'hbox',
	labelName : '文本标题',
	labelWidth : 90,
	txtWidth : 215,
	eleCode : null,
	rawValue : null,
	txtNull : false,
	width : 240,
	bodyStyle : 'border-width: 0px 0px 0px 0px;',
	initComponent : function() {
		var me = this;
		var txt = {
			xtype : 'textfield',
			fieldLabel : me.labelName,
			labelWidth : me.labelWidth,
			width : me.txtWidth,
			allowBlank : me.txtNull,
			/*regex:/^[0-9]+$/,
			regexText:'请输入有效数字',
			msgTarget:'side',*/
			listeners:{
		
				specialkey: function (field, o) {
					if (o.getKey()==Ext.EventObject.ENTER){		
						
						var eleCode =  field.ownerCt.eleCode;
						
						if (o.getKey()==Ext.EventObject.ENTER){ 
							if(eleCode == 'FUND_TYPE'){
								Ext.ComponentQuery.query("treeInputIsAllowBlank[id=DEP_PROHB] textfield")[0].focus();
							}else if (eleCode == 'DEP_PRO'){
								Ext.getCmp("pay_account_codeHB").focus();
							}else if (eleCode == 'SET_MODE'){
								if( Ext.getCmp("voucherTypeHB")!=undefined){
									Ext.getCmp("voucherTypeHB").focus();
								}else{
									Ext.ComponentQuery.query("treeInput[id=payee_account_bankHB] textfield")[0].focus();
								}
								
							}else if (eleCode == 'PAYEE_BANK'){
								
							}else if (eleCode == 'PAY_SUMMARY'){
								Ext.getCmp("trade_Type_HB").focus();
							}
                           	
                       	} 
						
					}	
           		},
							
				blur: function (field, o) {
					  
					var fieldValue  = field.getValue();
					var eleCode =  field.ownerCt.eleCode;
					var admdivCode =  Ext.getCmp('admdivCode').getValue();
					var params = {fieldValue:fieldValue,eleCode:eleCode,admdivCode:admdivCode};
					 Ext.Ajax.request({
						 url:'/realware/loadElementByValue.do', 
						 jsonData : Ext.JSON.encode(params),
						 success: function(response,o) {
							 var respTxt = Ext.JSON.decode(response.responseText);
							 if(respTxt.code ==''){
								 field.setValue(fieldValue);
								 field.ownerCt.rawValue.id = '090';
								 if(eleCode=="pay_summary"){
									 field.ownerCt.rawValue.code = '';
								 }
								 field.ownerCt.rawValue.name = fieldValue;
							 }else{
								 field.setValue(respTxt.code+respTxt.name);
								 field.ownerCt.rawValue.id = respTxt.id;
								 field.ownerCt.rawValue.code = respTxt.code;
								 field.ownerCt.rawValue.name = respTxt.name;
							 }
						 } 
					 })
                }  
				
			}
			
		};
		Ext.applyIf(me, {
			items : [ txt,{
				xtype : 'button',
				text : '...'
			} ]
		});
		me.callParent(arguments);
	}
});