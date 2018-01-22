Ext.define('pb.view.common.ChoseBankWin', {
		extend : 'Ext.window.Window',
		alias : 'widget.choseBankWin',
		resizable : false,
		draggable : false,
		title : '选择网点',
		width : 400,
		height : 270,
		layout : 'fit',
		modal : true,
		bankStore : null,
		initComponent : function() {
			var me = this;
			Ext.applyIf(me, {
				items : [ {
					xtype : 'form',
					frame : true,
					bodyPadding : 5,
					layout : 'border',
					renderTo   : Ext.getBody(),
					items : [{
							region : 'north',
							xtype: 'panel',
							border: 0,
							width: 350,
							layout: 'hbox',
							bodyStyle: "background:#DFE9F6;padding:0px 0px 5px 0px",
							style : 'margin-left:5px;margin-right:5px;',
							items : [{
										id : 'bankcode',
										xtype : 'textfield',
										fieldLabel : '快速查找',
										labelWidth : 70,
										width : 280
									}, {
										text : '查询',
										xtype : 'button',
										iconCls : 'log',
										handler : function() {
											this.bankStore.load( {
												params : {
													codeorname :Ext.getCmp('bankcode').getValue()
												}
											});
										}
									}
								]
							}, {
								region : 'center',
								xtype : 'gridpanel',
								viewConfig : {
									enableTextSelection : true
									},
//								height : 200,
//								style : 'margin-left:5px;margin-right:5px;margin-bottom:5px;',
								store : this.bankStore,
								columns : [{
										text : '网点编码',
										dataIndex : 'code',
										width : '110'
								}, {
										text : '网点名称',
										dataIndex : 'name',
										width : '200'
								}],
								buttons : [{
										text : '刷新',
										hidden : true,
										handler : function() {
											this.bankStore.load( {
													params : {
														codeorname :Ext.getCmp('bankcode').getValue()
													}
											});
										}
									}, {
										text : '确定',
										handler : function() {
											me.fireEvent('chosebankclick',Ext.ComponentQuery.query('gridpanel', me)[0]);	
											me.hide();
//											var records =Ext.getCmp('gridBank').getSelectionModel().getSelection();
//											if(records.length<1)
//												return;
//											bankid= records[0].get("id");	
//											var codeandname=records[0].get("code")+" "+records[0].get("name");
//											Ext.getCmp(formId).setValue(codeandname);
//											this.up('window').close();	
										}
									},{
										text : '取消',
										handler : function() {
											this.up('window').close();
										}
								}],
								listeners : {
									'itemdblclick' : function(view, record, item,
											index, e) {
										bankid = record.get("id");	
										var codeandname=record.get("code")+" "+record.get("name");
										Ext.getCmp(formId).setValue(codeandname);
										this.up('window').close();								
									}
								}
							}]							
						}]
					});
			me.addEvents('chosebankclick');
			me.callParent(arguments);
		}
	})