Ext.define('pb.controller.common.RoleMenus', {
	extend : 'Ext.app.Controller',
	stores : [ 'common.RoleTree', 'common.RoleMenuTree' ],
	requires : [ 'pb.view.common.RoleMenu' ],
	refs : [ {
		ref : 'rolemenu',
		selector : 'rolemenu'
	} ],
	init : function() {
		this.control( {
			'rolemenu treepanel[id=menutree]' : {
				checkchange : function(node, checked, eOpts) {
					var me = this;
					if (me.checkEnabled) {
						node.expand();
						node.checked = checked;
						node.eachChild(function(child) {
							child.set('checked', checked);
							child.fireEvent('checkchange', child, checked);
						});
						//设置父节点勾选状态
						var parent = node.parentNode;
						if(parent) {
							if(checked === true) {
								parent.set('checked', checked);
							} else {
								var flag = true;
								parent.eachChild(function(child) {
									if(child.data.checked) {
										flag = false;
										return ;
									}
								});
								if(flag) {
									parent.set('checked', checked);
								}
							}
						}
					} else {
						node.set('checked', !checked);
					}
				}
			},
			'rolemenu treepanel[id=roletree]' : {
				itemclick : function(thiz, record, item, index, e, eOpts) {
					this.onLoadRoleMenu(record);
				}
			},
			/***
			 * 编辑
			 * @memberOf {TypeName} 
			 */
			'rolemenu button[id=edit]' : {
				click : this.editRoleMenu
			},
			/***
			 * 取消编辑
			 * @memberOf {TypeName} 
			 */
			'rolemenu button[id=noedit]' : {
				click : function() {
					this.doDisabled(false);
					//重新加载角色菜单列表
					var roleTree = Ext.ComponentQuery.query('treepanel[id=roletree]', this.getRolemenu())[0];
					var records = roleTree.getSelectionModel().getSelection();
					this.onLoadRoleMenu(records[0]);
				}
			},
			/***
			 * 保存角色菜单
			 * @memberOf {TypeName} 
			 */
			'rolemenu button[id=save]' : {
				click : function() {
					var me = this;
					var menuIds = [];
					var roleTree = Ext.ComponentQuery.query('treepanel[id=roletree]', me.getRolemenu())[0];
					var records = roleTree.getSelectionModel().getSelection();
					var rootNode = me.getStore('common.RoleMenuTree').getRootNode();
					var nodes = rootNode.childNodes;
					Ext.Array.each(nodes, function(n) {
						if (n.get('checked') == true) {
							menuIds.push(n.get('id'));
						}
						var childNodes = n.childNodes;
						if (childNodes.length > 0) {
							Ext.Array.each(childNodes, function(c) {
								if (c.get('checked') == true) {
									menuIds.push(c.get('id'));
								}
							});
						}
					});
					//后台处理
					var myMask = new Ext.LoadMask(Ext.getBody(), {
						msg : '后台正在处理中，请稍后....',
						removeMask : true
					});
					myMask.show();
					Ext.Ajax.request( {
						url : '/realware/saveRoleMenu.do',
						method : 'POST',
						params : {
							menuIds : Ext.encode(menuIds),
							role_id : records[0].get('id')
						},
						timeout : 60000,
						success : function(response, options) {
							myMask.hide();
							Ext.Msg.show( {
								title : '成功提示',
								msg : response.responseText,
								buttons : Ext.Msg.OK,
								icon : Ext.MessageBox.INFO
							});
							me.doDisabled(false);
							me.onLoadRoleMenu(records[0]);
						},
						failure : function(response, options) {
							myMask.hide();
							Ext.Msg.show( {
								title : '失败提示',
								msg : response.responseText,
								buttons : Ext.Msg.OK,
								icon : Ext.MessageBox.ERROR
							});
						}
					});
				}
			}
		});
	},
	onLaunch : function() {
		this.getStore('common.RoleMenuTree').tree.root.set('expanded', true);
	},
	/***
	 * 编辑菜单信息
	 * @memberOf {TypeName} 
	 */
	editRoleMenu : function() {
		//编辑菜单按钮不能编辑
		Ext.ComponentQuery.query('button[id=edit]', this.getRolemenu())[0].setDisabled(true);
		this.doDisabled(true);
	},
	/***
	 * 加载角色菜单信息
	 * @param {Object} record
	 * @memberOf {TypeName} 
	 */
	onLoadRoleMenu : function(record) {
		var edit = Ext.ComponentQuery.query('button[id=edit]', this.getRolemenu())[0];
		if (record.get('leaf')) {
			edit.setDisabled(false);
		} else {
			edit.setDisabled(true);
		}
		this.getStore('common.RoleMenuTree').load( {
			params : {
				role_id : record.get('id')
			}
		});
	},
	/***
	 * 是否可编辑
	 * @param {Object} disabled
	 * @memberOf {TypeName} 
	 */
	doDisabled : function(disabled){
		var me = this;
		if(disabled){
			//角色列表不能编辑
			Ext.ComponentQuery.query('treepanel[id=roletree]', me.getRolemenu())[0].setDisabled(true);
			//取消编辑菜单、保存角色菜单按钮可编辑
			Ext.ComponentQuery.query('button[id=noedit]', this.getRolemenu())[0].setDisabled(false);
			Ext.ComponentQuery.query('button[id=save]', this.getRolemenu())[0].setDisabled(false);
			//菜单信息区可编辑
			me.checkEnabled = true;
		}else{
			//角色列表可编辑
			Ext.ComponentQuery.query('treepanel[id=roletree]', me.getRolemenu())[0].setDisabled(false);
			//取消编辑菜单、保存角色菜单按钮可编辑
			Ext.ComponentQuery.query('button[id=noedit]', this.getRolemenu())[0].setDisabled(true);
			Ext.ComponentQuery.query('button[id=save]', this.getRolemenu())[0].setDisabled(true);
			//菜单信息区可编辑
			me.checkEnabled = false;
		}
	},
	checkEnabled : false //菜单信息复选框是否可编辑，默认不能编辑
});
