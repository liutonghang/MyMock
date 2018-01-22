//加载配置可用 
Ext.Loader.setConfig({
			enabled : true
		});
//动态引用“../ux/”目录下所有Js文件类，映射到对应命名空间 
Ext.Loader.setPath('Ext.ux', '/realware/resources/ux/');
Ext.require(['Ext.tab.*', 'Ext.ux.TabCloseMenu']);

Ext.apply(Ext.form.VTypes, {
			repetition : function(val, field) { //返回true，则验证通过，否则验证失败
				if (field.repetition) { //如果表单有使用repetition配置，repetition配置是一个JSON对象，该对象提供了一个名为targetCmpId的字段，该字段指定了需要进行比较的另一个组件ID。
					var cmp = Ext.getCmp(field.repetition.targetCmpId); //通过targetCmpId的字段查找组件
					if (Ext.isEmpty(cmp)) { //如果组件（表单）不存在，提示错误
						Ext.MessageBox.show({
									title : '错误',
									msg : '发生异常错误，指定的组件未找到',
									icon : Ext.Msg.ERROR,
									buttons : Ext.Msg.OK
								});
						return false;
					}
					if (val == cmp.getValue()) { //取得目标组件（表单）的值，与宿主表单的值进行比较。
						return true;
					} else {
						return false;
					}
				}
			},
			repetitionText : '输入的两次密码不一致！'
		});

Ext.override(Ext.tip.QuickTip, {
	helperElId : 'ext-quicktips-tip-helper',
	initComponent : function() {
		var me = this;

		me.target = me.target || Ext.getDoc();
		me.targets = me.targets || {};
		me.callParent();

		// new stuff
		me.on('move', function() {
			var offset = me.hasCls('x-tip-form-invalid') ? 35 : 12, helperEl = Ext
					.fly(me.helperElId)
					|| Ext.fly(Ext.DomHelper.createDom({
								tag : 'div',
								id : me.helperElId,
								style : {
									position : 'absolute',
									left : '-1000px',
									top : '-1000px',
									'font-size' : '12px',
									'font-family' : 'tahoma, arial, verdana, sans-serif'
								}
							}, Ext.getBody()));

			if (me.html
					&& (me.html !== helperEl.getHTML() || me.getWidth() !== (helperEl.dom.clientWidth + offset))) {
				helperEl.update(me.html);
				me.setWidth(Ext.Number.constrain(helperEl.dom.clientWidth
								+ offset, me.minWidth, me.maxWidth));
			}
		}, this);
	}
});

Ext.onReady(function() {
	Ext.QuickTips.init();
	Ext.state.Manager.setProvider(Ext.create('Ext.state.CookieProvider'));
	var currentItem;

	//首页
	var contentTabs = Ext.create('Ext.tab.Panel', {
		id : 'contentTabs',
		width : 400,
		height : 400,
		region : 'center',
		frame : true,
		layout : 'fit',
		items : [{
			id : 'index-1',
			iconCls : 'home',
			title : '<span>首页</span>',
			html : '<iframe scrolling="auto" frameborder="0" width="100%" height="100%"  src="/realware/main.do"></iframe> ',
			itemId : 'home'
		}],
		plugins : Ext.create('Ext.ux.TabCloseMenu', {
					closeTabText : '关闭当前',
					closeOthersTabsText : '关闭其他',
					closeAllTabsText : '关闭所有'
				}),
		listeners : {
			beforeremove : function(tab, panel, eOpts) {
				 var frame = Ext.query("iframe", panel.getEl().dom);  
			     if(frame.length > 0 && frame[0].src) {
			    	frame = frame[0];
			        frame.contentWindow.document.write("");  
			        frame.contentWindow.document.clear(); 
	                frame.src = "javascript:false";
			    }
			}
		}
	});
	//左侧菜单树
	var leftMenu = Ext.create('Ext.tree.Panel', {
				store : Ext.create('Ext.data.TreeStore', {
							root : {
								id : '0',
								nodeType : 'async'
							},
							proxy : {
								type : 'ajax',
								url : '/realware/initmenu.do'
							},
							autoLoad : true
						}),
				hideHeaders : true,
				rootVisible : false,
				region : 'west',
				id : 'west-panel',
				title : '系统功能导航',
				split : true,
				collapsible : true,
				collapsed : false,
				width : 200,
				viewConfig : {
					plugins : {
						ptype : 'treeviewdragdrop'
					}
				},
				border : 0,
				height : 500
			});
			
	// 点击左菜单事件
	leftMenu.on("itemclick", function(view, record, item, index, e) {
		if (record.data.leaf == false)
			return;
		var n = contentTabs.getComponent(record.raw.id);
		if (n == undefined) {
			contentTabs.add({
				id : record.raw.id,
				title : record.raw.text ,
				iconCls : record.raw.text.iconCls,
				html : '<iframe scrolling=auto frameborder=0 width=100% height=100%  src=/realware/doGo.do?description='
						+ record.raw.description
						+ '&id='
						+ record.raw.id
						+ '></iframe>',
				border : false,
				closable : true
			});
		}
		var tab = Ext.getCmp(record.raw.id);
		tab.show();
		contentTabs.setActiveTab(record.raw.id);
	});
	/**
	 * 不处理菜单切换时设置session内容，请求时已传入menu_id lfj 2015-02-03
	 */
	/*// 菜单切换事件
	contentTabs.on('tabchange', function(tabPanel, newCard, oldCard) {
				if (tabPanel.getActiveTab() != null
						&& tabPanel.getActiveTab().id != 'index-1') {
					Ext.Ajax.request({
								url : '/realware/editMenu.do',
								method : 'POST',
								params : {
									id : tabPanel.getActiveTab().id
								}
							});
				}
			});*/

	/**this.bottomPanel = Ext.create('Ext.panel.Panel', {
		region : 'south',
		height : 25,
		border : 0,
		bbar : ['->', {
			xtype : 'combo',
			editable : false,
			labelAlign : 'right',
			emptyText : '更换皮肤',
			store : [['/realware/resources/css/ext-all.css', 'Default'],
					['/realware/resources/css/ext-all-neptune.css', 'Neptune']],
			queryMode : 'local',
			emptyText : '更换皮肤',
			value : '/realware/resources/css/ext-all.css',// 先用默认的
			listeners : {
				'select' : function(combo, record, index) {
					var value = combo.getValue();
					Ext.util.CSS.swapStyleSheet('theme', value);

				}
			}
		}]
	});**/

	// 页面布局显示
	var viewport = Ext.create('Ext.Viewport', {
		id : 'mainFrame',
		layout : 'border',
		items : [Ext.create('Ext.panel.Panel', {
			region : 'north',
			split : true,
			html : "<table cellSpacing=0 cellPadding=0 width=100% background='/realware/resources/images/header_bg.jpg' border=0><tr><td><IMG src='/realware/resources/images/header_left.jpg' height=56 width=260  style='margin-top:-8px'></td><td></td><td align=right width=268  height=56 class='bg_td'><div id='div_' style='margin-top:25px'></div></td></tr></table>"
		}), contentTabs, leftMenu]
	});
	//帮助手册
	var loadHelpBtn = Ext.create('Ext.Button', {
				text : '帮助手册',
				iconCls : 'load',
				handler : function() {	
					window.location.href = "/realware/downLoad.do?fileName="
							+ encodeURI(encodeURI('help.doc'));
				}
			});
	//下载OCX
	var loadOcxBtn = Ext.create('Ext.Button', {
				text : '下载OCX',
				iconCls : 'load',
				handler : function() {
					window.location.href = "/realware/downLoad.do?fileName="
							+ encodeURI(encodeURI('vlclient.zip'));
				}
			});

	// 注销
	var logoutBtn = Ext.create('Ext.Button', {
				text : '注销',
				iconCls : 'logout',
				handler : function() {
					window.location.href = "/realware/login.do";
				}
			});
	// 修改密码
	var editPassBtn = Ext.create('Ext.Button', {
				text : '修改密码',
				iconCls : 'role',
				hidden : (loginModel == 1 || loginModel == 5 || loginModel == 6) ? false : true,
				handler : function() {
					editPass();
				}
			});

	Ext.create('Ext.panel.Panel', {
				layout : 'hbox',
				defaults : {
					margins : '0 10 15 0'
				},
				bodyStyle : 'background:transparent;border-width: 0px 0px 0px 0px;',
				renderTo : 'div_',
				width : 340,
				items : [editPassBtn, logoutBtn,loadOcxBtn,loadHelpBtn]
			});

	/***
	 * 修改密码
	 */
	function editPass() {
		Ext.create('Ext.window.Window', {
			id : 'pwdWindow',
			title : '密码修改',
			width : 340,
			height : 170,
			layout : 'fit',
			resizable : false,
			modal : true,
			items : [Ext.create('Ext.form.Panel', {
				bodyPadding : 10,
				url : '/realware/modifyPassword.do',
				defaultType : 'textfield',
				items : [{
							id : 'oldpassword',
							fieldLabel : '当前密码',
							name : 'oldpassword',
							labelWidth : 90,
							width : 280,
							allowBlank : false,
							inputType : 'password'
						}, {
							id : 'newpassword',
							fieldLabel : '新密码',
							name : 'newpassword',
							labelWidth : 90,
							width : 280,
							allowBlank : false,
							inputType : 'password'

						}, {
							id : 'confirmpassword',
							fieldLabel : '确认新密码',
							name : 'confirmpassword',
							labelWidth : 90,
							width : 280,
							allowBlank : false,
							inputType : 'password',
							vtype : 'repetition',
							repetition : {
								targetCmpId : 'newpassword'
							}
						}],

				buttons : [{
					text : '确定',
					formBind : true,
					disabled : true,
					handler : function() {
						var form = this.up('form').getForm();
						if(Ext.getCmp("oldpassword").getValue() == Ext.getCmp("newpassword").getValue()){
							Ext.Msg.alert("温馨提示", "新旧密码相同，请重新输入！");
							return;
						}
						form.submit({
									method : 'POST',
									timeout : 6000, // 设置为秒
									waitTitle : '提示',
									waitMsg : '正在修改密码,请稍等...',
									success : function(form, action) {
										Ext.Msg.show({
													title : '成功提示',
													msg : action.result.mess,
													buttons : Ext.Msg.OK,
													icon : Ext.MessageBox.INFO
												});

										Ext.getCmp("pwdWindow").close();
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
				}, {
					text : '取消',
					handler : function() {
						this.up('form').getForm().reset();
						this.up('window').close();
					}
				}]
			})]
		}).show();
	}
	
	
	/**
	 * 是否强制修改密码
	 * 
	 * @param {Object}
	 *            isReturn
	 * @return {TypeName}
	 */
	function isnupdatepass() {
		var myMask = new Ext.LoadMask(Ext.getBody(), {
			msg : '后台正在处理中，请稍后....',
			removeMask : true
		});
		myMask.show();
		Ext.Ajax.request( {
			url : '/realware/isnUpdatePass.do',
			method : 'POST',
			//timeout : 50000, // 设置为3分钟
			success : function(response, options) {
				myMask.hide();
				if(response.responseText!=-3){
					var titleName ;
					var cancelShow=true;
					if(response.responseText==-2){
						titleName="首次登陆，请修改密码！";
					}else if(response.responseText==-1){
						titleName="密码过期，请修改密码！";
					}else {
						titleName="密码"+"<font color='red'>"+response.responseText+"天</font>后过期，是否修改！";
						cancelShow = false;
					}
					Ext.create('Ext.window.Window', {
						id : 'pwdWindow',
						title : titleName,
						width : 340,
						height : 170,
						layout : 'fit',
						resizable : true,
						closable:false,
						modal : true,
						items : [Ext.create('Ext.form.Panel', {
							bodyPadding : 10,
							url : '/realware/modifyPassword.do',
							defaultType : 'textfield',
							items : [{
										id : 'oldpassword',
										fieldLabel : '当前密码',
										name : 'oldpassword',
										labelWidth : 90,
										width : 280,
										allowBlank : false,
										inputType : 'password'
									}, {
										id : 'newpassword',
										fieldLabel : '新密码',
										name : 'newpassword',
										labelWidth : 90,
										width : 280,
										allowBlank : false,
										inputType : 'password'

									}, {
										id : 'confirmpassword',
										fieldLabel : '确认新密码',
										name : 'confirmpassword',
										labelWidth : 90,
										width : 280,
										allowBlank : false,
										inputType : 'password',
										vtype : 'repetition',
										repetition : {
											targetCmpId : 'newpassword'
										}
									}],

							buttons : [{
								text : '确定',
								formBind : true,
								disabled : true,
								handler : function() {
									if(Ext.getCmp("oldpassword").getValue() == Ext.getCmp("newpassword").getValue()){
										Ext.Msg.alert("温馨提示", "新旧密码相同，请重新输入！");
										return;
									}
									var form = this.up('form').getForm();
									form.submit({
												method : 'POST',
												timeout : 6000, // 设置为秒
												waitTitle : '提示',
												waitMsg : '正在修改密码,请稍等...',
												success : function(form, action) {
													Ext.Msg.show({
																title : '成功提示',
																msg : action.result.mess,
																buttons : Ext.Msg.OK,
																icon : Ext.MessageBox.INFO
															});

													Ext.getCmp("pwdWindow").close();
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
							},{
								text : '取消',
								disabled : cancelShow,
								handler : function() {
									Ext.getCmp("pwdWindow").close();
								}
							}]
						})]
					}).show();
				}

			},
			failure : function(response, options) {
				failAjax(response, myMask);
			}
		});
	}
	isnupdatepass();
	

});
