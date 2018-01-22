/**
 * 主管授权
 * succHandler 授权成功后，要调用的function
 */

function authorizeWin(optionType,code,succHandler){
	
	var form = Ext.create('Ext.form.Panel', {
		layout : 'absolute',
		defaultType : 'textfield',
		border : false,
		bodyStyle : "background:#DFE9F6",
		items : [ {
			fieldLabel : '主管编码',
			id : "majorUserCode",
			fieldWidth : 40,
			labelWidth : 60,
			msgTarget : 'side',
			allowBlank : false,
			x : 5,
			y : 5,
			anchor : '-5' // anchor width by percentage
		}, {
			fieldLabel : '主管密码',
			id : "majorUserCodePwd",
			fieldWidth : 40,
			labelWidth : 60,
			inputType : 'password',
			msgTarget : 'side',
			minLength : 6,
			//maxLength : 6,
			allowBlank : false,
			x : 5,
			y : 35,
			anchor : '-5'
		} ],
		dockedItems : [ {
			xtype : 'toolbar',
			dock : 'bottom',
			ui : 'footer',
			layout : {
				pack : "end"
			},
			items : [ {
				text : "确认",
				width : 80,
				disabled : true,
				formBind : true,
				handler : function(){

					if (form.isValid()) {
						var params = {};
						params.userCode = Ext.getCmp("majorUserCode").getValue();
						params.userPassWord = Ext.getCmp("majorUserCodePwd").getValue();
						params.userType = 1;
						params.menu_id = Ext.PageUtil.getMenuId();
						
						params.optionType = optionType;
						params.code = code;
						
						var myMask = new Ext.LoadMask(Ext.getBody(), {
							msg : '后台正在处理，请稍后...',
							removeMask : true
						});
						myMask.show();
						Ext.Ajax.request({
							method : 'POST',
							timeout : 180000,
							url : '/realware/transAuthorize.do',
							params : params,
							success : function(response, options) {
								myMask.hide();
								if (!Ext.isEmpty(win)) {
									form.close();
									win.close();
								}
								//授权成功后，进行后续的业务逻辑
								if(succHandler && Ext.isFunction(succHandler)) {
									succHandler.call();
								}
								
							},
							failure : function(response, options) {
								if (!Ext.isEmpty(myMask)) {
									myMask.hide();
								}
								Ext.Msg.show({
									title : "失败提示",
									msg : response.responseText,
									buttons : Ext.Msg.OK,
									icon : Ext.MessageBox.ERROR
								});
							}
						});
					}

				}
			}, {
				text : "取消",
				width : 80,
				handler : function() {
					Ext.ComponentQuery.query('form', win)[0].getForm().reset();
					win.close();
				}
			} ]
		} ]

	});
	var win = Ext.create('Ext.window.Window', {
		title : '主管授权',
		width : 300,
		height : 130,
		layout : 'fit',
		plain : true,
		resizable : false,
		items : form
	});
	win.show();
	
}





