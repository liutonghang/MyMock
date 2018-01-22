Ext.Loader.setPath({
			'Ext.ux' : '/realware/resources/ux/',
			'Ext.app' : '/realware/resources/ux/classes/'
		});
Ext.require(['Ext.Viewport', 'Ext.data.JsonStore', 'Ext.tip.QuickTipManager',
		'Ext.tab.Panel', 'Ext.ux.GroupTabPanel', 'Ext.grid.*',
		'Ext.app.PortalColumn', 'Ext.app.PortalDropZone', 'Ext.app.Portlet',
		'Ext.app.GridPortlet', 'Ext.app.PortalPanel', 'Ext.app.ChartPortlet']);

Ext.onReady(function() {
	Ext.tip.QuickTipManager.init();

	Ext.create('Ext.Viewport', {
		layout : 'fit',
		items : [{
			xtype : 'grouptabpanel',
			activeGroup : 0,
			items : [{
				items : [{
				/**			title : '待定',
							iconCls : 'x-icon-tickets',
							style : 'padding: 10px;',
							border : false,
							layout : 'fit',
							items : [{

							}]
						}, {**/
							xtype : 'portalpanel',
							title : '脱机版模拟银行接口',
							border : false,
							items : [{
								flex : 1,
								items : [{
									title : '请款',
									html : '<div class="portlet-content" id="div_1" style="height:100"></div>'
								}, {

									title : '转账',
									html : '<div class="portlet-content" id="div_2" style="height:140"></div>'
								}, {
									title : '指定日期查询流水',
									html : '<div class="portlet-content" id="div_3"  style="height:170"></div>'
								}]
							}]
						}]
			}]
		}]
	});

	Ext.create('Ext.panel.Panel', {
		renderTo : 'div_1',
		border : false,
		items : {
			xtype : 'form',
			id : 'form-panel1',
			labelWidth : 150,
			height : 75,
			bodyStyle : 'padding:10px',
			layout : 'hbox',
			defaults : {
				margins : '3 30 0 0',
				width : 330
			},
			items : [{
						id : 'reponseCode',
						xtype : 'radiogroup',
						fieldLabel : '状态设置<font style="color:red">批量</font>',
						vertical : true,
						columns : 3,
						items : [{
									boxLabel : '成功',
									name : 'rb1',
									inputValue : '0',
									checked : true
								}, {
									boxLabel : '失败',
									name : 'rb1',
									inputValue : '1'
								}, {
									boxLabel : '超时',
									name : 'rb1',
									inputValue : '2'
								}]
					}],
			buttons : [{
						text : '确定',
						formBind: true, 
						disabled: true,
						handler : function() {
							var form = this.up('form').getForm();
							if (form.isValid()) {
								form.submit({
											url : "/realware/reqPayOutAction.do",
										    method : 'POST',
											timeout : 18000, // 设置为3分钟
											waitTitle : '提示',
											waitMsg : '正在处理中，请您耐心等候...',
											success: function(form, action) {
												succForm(form, action);
											},
											failure: function(form, action) {
												failForm(form, action);
											}
										});
							}
						}
					}, {
						text : '清空',
						handler : function() {
							this.up('form').getForm().reset();
						}
					}]
		}

	});

	Ext.create('Ext.panel.Panel', {
		renderTo : 'div_2',
		border : false,
		items : {
			xtype : 'form',
			id : 'form-panel2',
			labelWidth : 300,
			height : 115,
			bodyStyle : 'padding:10px',
			layout : 'vbox',
			defaults : {
				margins : '3 30 0 0',
				width : 500
			},
			items : [{
						xtype : 'textfield',
						fieldLabel : '指定<font style="color:red">失败</font>的凭证号',
						name : 'failVouNo',
						emptyText :"多项凭证号设置“,”逗号隔开"
					}, {
						xtype : 'textfield',
						fieldLabel : '指定<font style="color:red">超时</font>的凭证号',
						name : 'timeoutVouNo',
						emptyText:"多项凭证号设置“,”逗号隔开"
					}],
			buttons : [{
						text : '确定',
						handler : function() {
							var form = this.up('form').getForm();
							if (form.isValid()) {
								form.submit({
											url : "/realware/transAction.do",
											method : 'POST',
											timeout : 18000, // 设置为3分钟
											waitTitle : '提示',
											waitMsg : '正在处理中，请您耐心等候...',
											success : function(form, action) {
												Ext.Msg.show({
															title : '成功提示',
															msg : action.result.mess,
															buttons : Ext.Msg.OK,
															icon : Ext.MessageBox.INFO
														});
											},
											failure : function(form, action) {
												Ext.Msg.show({
															title : '失败提示',
															msg : action.response.responseText,
															buttons : Ext.Msg.OK,
															icon : Ext.MessageBox.ERROR
														});
											}
										});
							}
						}
					}, {
						text : '清空',
						handler : function() {
							this.up('form').getForm().reset();
						}
					}]
		}

	});
	
			
	Ext.create('Ext.panel.Panel', {
		renderTo : 'div_3',
		border : false,
		items : {
			xtype : 'form',
			id : 'form-panel3',
			labelWidth : 380,
			bodyStyle : 'padding:10px',
			layout : 'vbox',
			defaults : {
				margins : '3 30 0 0',
				width : 500
			},
			items : [{
						xtype : 'datefield',
						fieldLabel : '当前日期',
						name : 'queryDate',
						format : 'Y-m-d',
						editable : false,
						value:new Date()
					}, {
						xtype : 'textfield',
						fieldLabel : '指定<font style="color:red">失败</font>的凭证号',
						name : 'failVouNo2',
						id:'failVouNo2',
						emptyText : "多项凭证号设置“,”逗号隔开"
					}, {
						xtype : 'textfield',
						fieldLabel : '指定<font style="color:red">成功</font>的凭证号',
						name : 'successVouNo2',
						id:'successVouNo2',
						emptyText : "多项凭证号设置“,”逗号隔开"
					}],
			buttons : [{
						text : '确定',
						handler : function() {
							var form = this.up('form').getForm();
							if (form.isValid()) {
								var fail = Ext.getCmp("failVouNo2").getValue().split(",");
								var success = Ext.getCmp("successVouNo2").getValue().split(",");
								var arr3=[];
  								for(var s in fail){
    								for(var x in success){
       									 if(fail[s]==success[x]){
            									arr3.push(fail[s]);
       									 }
    								}
 								}
 								if(arr3.length>0){
 									Ext.Msg.alert("系统提示", "凭证号【"+arr3+"】不能同时设置失败和成功状态！");
 									return;
 								}
								form.submit({
											url : "/realware/checkSerialno.do",
											method : 'POST',
											timeout : 18000, // 设置为3分钟
											waitTitle : '提示',
											waitMsg : '正在处理中，请您耐心等候...',
											success : function(form, action) {
												Ext.Msg.show({
															title : '成功提示',
															msg : action.result.mess,
															buttons : Ext.Msg.OK,
															icon : Ext.MessageBox.INFO
														});
											},
											failure : function(form, action) {
												Ext.Msg.show({
															title : '失败提示',
															msg :  action.response.responseText,
															buttons : Ext.Msg.OK,
															icon : Ext.MessageBox.ERROR
														});
											}
										});
							}
						}
					}, {
						text : '清空',
						handler : function() {
							this.up('form').getForm().reset();
						}
					}]
		}

	});

});