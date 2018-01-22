Ext.define('pb.controller.common.ElementTreeInput', {
	extend : 'Ext.app.Controller',
	stores : [ 'common.ElementTreeValues' ],
	requires : [ 'pb.view.common.ElementTreeInput','pb.view.common.SelectWindow','pb.view.pay.EditorInputVoucherWindow','pb.view.pay.PayeeBankWindow'],
	refs : [ {
		ref : 'input',
		selector : 'treeInput'
	} ,{
		ref:'payeeBanknoWindow',
		selector:'payeeBankWindow'
	},{
		ref:'formWindow',
		selector:'editorVoucherInputWindow'
	} ],
	init : function() {
		this.control( {
			'treeInput > button':{
				click : function(o){
					var me = this;
					var eleCode = o.ownerCt.eleCode;
					var treeStore;
					if(eleCode == 'PAYEE_BANK'){
						var bankNoGrid;
						treeStore = this.getStore('pay.PayeeBankNos'); 
						var bankWin = me.getPayeeBanknoWindow();
						var fromWin = me.getFormWindow();
						treeStore.on('afterload',function(){
							if(bankWin==undefined){
								bankWin = Ext.create('pb.view.pay.PayeeBankWindow',{
											banknoStore : treeStore
								});
								bankNoGrid = Ext.ComponentQuery.query('gridpanel', bankWin)[0];
								bankNoGrid.on('itemdblclick',function(view,record,item,index, e) {
									var bankNo = record.get('bank_no');
									var bankName = record.get('bank_name');
									bankWin.getForm().findField('payee_account_bank_no').setValue(bankNo);
									bankWin.hide();
								});
							}else {
								bankNoGrid = Ext.ComponentQuery.query('gridpanel', bankWin)[0];
								bankNoGrid.on('itemdblclick',function(view,record,item,index, e) {
									var bankNo = record.get('bank_no');
									var bankName = record.get('bank_name');
									bankWin.getForm().findField('payee_account_bank_no').setValue(bankNo);
									bankWin.hide();
								});
								bankNoGrid.getStore().removeAll();
							}
							bankWin.on('bankNoclick',function(bankNoGrid){
								var records = bankNoGrid.getSelectionModel().getSelection();
								var bankNo = records[0].get('bank_no');
								var bankName =  records[0].get('bank_name');
								var txtField = Ext.ComponentQuery.query('textfield', o.ownerCt)[0];
								txtField.setValue(bankName);
								var window = Ext.ComponentQuery.query('form',me.getFormWindow())[1];
								Ext.Array.each(window.items.items,function(items,index){
									if (items.id == 'payee_account_bank_no') {
										var txtField = Ext.ComponentQuery.query('textfield', items.ownerCt)[index];
									 	txtField.setValue(bankNo);
									}
								});
								bankWin.hide();
							});
							bankWin.show();
						});
						me.afterLoadBankNoStore(treeStore);
					}else{
					  treeStore = this.getStore('common.ElementTreeValues');
					  treeStore.on('beforeload',function(thiz, options) {
						if (null == options.params || options.params == undefined) {
							options.params = [];
						}
						options.params["admdivCode"] = Ext.getCmp('admdivCode').getValue();
						options.params["eleName"] = eleCode;
					});
					var maps = Ext.create('Ext.util.HashMap');
					maps.add('code', '编码');
					maps.add('name', '名称');
			 	 	treeStore.load({
						 callback: function(records, operation, success) {
							if(success){
								var w = Ext.create('pb.view.common.SelectWindow', {
									panelType : 1,
								  	listStore :treeStore,  
									colMaps : maps,
									y : 220,
									x : 320 
								});
							   w.on('saveSelectclick', function() {
									var record = this.getRawValue();
									var txtField = Ext.ComponentQuery.query('textfield', o.ownerCt)[0];
									txtField.setValue(record.raw.code + record.raw.name);
									o.ownerCt.rawValue = {
										id : record.raw.id,
										code : record.raw.code,
										name : record.raw.name
									};
									this.close();
								}); 
								w.show();
							}else{
								Ext.Msg.alert('系统提示', '获取要素：'+ o.ownerCt.eleCode +',异常！');
							}
						 }
					}); 
				}
					}
			},
			'treeInputIsAllowBlank > button':{
				click : function(o){
					var me = this;
					var eleCode = o.ownerCt.eleCode;
					var treeStore  = this.getStore('common.ElementTreeValues');
						treeStore.on('beforeload',function(thiz, options) {
							if (null == options.params || options.params == undefined) {
								options.params = [];
							}
							options.params["admdivCode"] = Ext.getCmp('admdivCode').getValue();
							options.params["eleName"] = eleCode;
						});
						var maps = Ext.create('Ext.util.HashMap');
						maps.add('code', '编码');
						maps.add('name', '名称');
						treeStore.load({
							 callback: function(records, operation, success) {
								if(success){
									var w = Ext.create('pb.view.common.SelectWindow', {
										panelType : 1,
										listStore :treeStore,
										colMaps : maps,
										y : 220,
										x : 320
									});
									w.on('saveSelectclick', function() {
										var record = this.getRawValue();
										var txtField = Ext.ComponentQuery.query('textfield', o.ownerCt)[0];
										txtField.setValue(record.raw.code + record.raw.name);
										o.ownerCt.rawValue = {
											id : record.raw.id,
											code : record.raw.code,
											name : record.raw.name
										};
										this.close();
									});
									w.show();
								}else{
									Ext.Msg.alert('系统提示', '获取要素：'+ o.ownerCt.eleCode +',异常！');
								}
							 }
						});
					}
			},
			
			'treeInputIsAllowBlank > textfield': {
				 
				change : function(o,newValue,oldValue) {
					
				    newValue = newValue.replace(/(^\s*)|(\s*$)/g , '');
					var txtField = Ext.ComponentQuery.query('textfield', o.ownerCt)[0] ;
					txtField.setValue(newValue);
					if(/.*[\u4e00-\u9fa5]+.*$/.test(newValue)) {
						var index = newValue.replace(/[^a-zA-Z\u4E00-\u9FFF ]+/g, '');
						newValue = newValue.substr(0,newValue.indexOf(index));
					};
					o.ownerCt.rawValue = {
							code : newValue
					}
				}
			},
			'treeInput > textfield': {
				specialkey: function (field, o) {

								if (o.getKey()==Ext.EventObject.ENTER){ 

									Ext.getCmp("checknoHB").focus();
                   			 	}  								
							}
				 
			
			}
			
		});
		
		
		
		
	},
	afterLoadBankNoStore : function(banknoStore) {
		banknoStore.fireEvent('afterload');

	}

});