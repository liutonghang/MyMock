/***
 * 功能主界面处理类
 * @memberOf {TypeName} 
 */
Ext.define('pb.controller.common.Module',{
			extend : 'Ext.app.Controller',
			stores : [ 'common.ModuleTree','common.Buttons','common.Status'],
			requires : [ 'pb.view.common.ModuleList','pb.view.common.ModuleParentWindow','pb.view.common.ModuleWindow' ],
			refs : [ {
				//功能主界面
				ref : 'moduleList',
				selector : 'modulelist'
			}, {
				//功能模块编辑窗口
				ref : 'parentwindow',
				selector : 'moduleparentwindow'
			}, {
				//功能编辑窗口
				ref : 'modulewindow',
				selector : 'modulewindow'
			} ],
			init : function() {
				this.control( {
					//功能左则树的双击事件
					'modulelist > treepanel':{
						itemclick : function(view, record, item, index, e){
							this.getModuleList().setValue(record, this.getStore('common.Status'));
						}
					},
					//新增功能模型
					'modulelist button[id=addModuleParent]' : {
						click : this.addModuleParent
					},
					//新增功能
					'modulelist button[id=addModule]' : {
						click : this.addModule
					},
					//删除功能
					'modulelist button[id=deleteModule]':{
						click : this.delModule
					},
					//修改功能
					'modulelist button[id=editModule]':{
						click : this.editModule
					},
					//复制功能
					'modulelist button[id=copyModule]':{
						click : this.copyModule
					},
					//刷新功能
					'modulelist button[id=refreshModule]':{
						click : this.refreshModule
					}
				});
			},
			onLaunch : function() {
				//功能模块加载前事件（加载全部的父节点）
				this.getStore('common.Modules').on('beforeload',function(store, operation, eOpts){
					operation.params = [];
					operation.params['nodeId'] = 0;
				});
				//功能模块加载事件
				this.getStore('common.Modules').on('load',function(t, records, successful, eOpts){
					if(successful){
						Ext.Array.each(records,function(m){
							m.set('codename',m.get('code') + m.get('name'));
						});
					}
				});
			},
			addModuleParent : function() {
				//打开功能模块定义新增窗口
				Ext.create('pb.view.common.ModuleParentWindow').show();
			},
			addModule : function() {
				this.getStore('common.Buttons').removeAll();
				this.getStore('common.Status').removeAll();
				Ext.create('pb.view.common.ModuleWindow').show();
			},
			delModule : function(o){
				var treeStore = this.getStore('common.ModuleTree');
				var statusstore = this.getStore('common.Status');
				var list = this.getModuleList();
				var items = Ext.ComponentQuery.query('treepanel',list);
				var records  = items[0].getSelectionModel().getSelection();
				if(records.length==0){
					Ext.Msg.alert("系统提示", "必须选中左侧的功能信息，才能进行删除！");
					return;
				}else if(records[0].get('leaf')==false && records[0].childNodes.length>0){
					Ext.Msg.alert("系统提示", "功能模块下有子节点不能进行删除操作！");
					return;
				}
				var myMask = new Ext.LoadMask(Ext.getBody(), {
					msg : '后台正在处理中，请稍后....',
					removeMask : true
				});
				Ext.Msg.confirm("系统提示","确定要删除选中的功能信息？",function(e) {
					if (e == "yes") {
						myMask.show();
						Ext.Ajax.request({
							url : '/realware/delModule.do',
							method : 'POST',
							params : {
								moduleId : records[0].get('id'),
								jspName : records[0].raw.description
							},
							timeout : 60000, 
							success : function(response, options) {
								myMask.hide();
								Ext.Msg.show({
									title : '成功提示',
									msg : response.responseText,
									buttons : Ext.Msg.OK,
									icon : Ext.MessageBox.INFO
								});
								list.setValue(null,statusstore);
								treeStore.load();
							},
							failure : function(response, options) {
								myMask.hide();
								Ext.Msg.show({
									title : '失败提示',
									msg : response.responseText,
									buttons : Ext.Msg.OK,
									icon : Ext.MessageBox.ERROR
								});
							}
						});
					}
				});
			},
			editModule : function(){
				var treeStore = this.getStore('common.ModuleTree');
				var tree = Ext.ComponentQuery.query('treepanel',this.getModuleList())[0];
				var records  = tree.getSelectionModel().getSelection();
				if(records.length==0 || records[0].get('leaf')==false){
					Ext.Msg.alert("系统提示", "必须选中左侧的功能信息，才能进行修改！");
					return;
				}
				var record = treeStore.getNodeById(records[0].get('id'));
				var buttonstore = this.getStore('common.Buttons');
				var status = this.getStore('common.Status');
				var window = Ext.create('pb.view.common.ModuleWindow');
				window.setValue(record,buttonstore,status,'edit');
				window.show(null,function(o){
					Ext.ComponentQuery.query('textfield[name=code]',o)[0].setReadOnly(true);
					Ext.ComponentQuery.query('combo[name=parent_id]',o)[0].setVisible(false); 
				});
			},
			copyModule : function(){
				var treeStore = this.getStore('common.ModuleTree');
				var items = Ext.ComponentQuery.query('treepanel',this.getModuleList());
				var records  = items[0].getSelectionModel().getSelection();
				if(records.length==0 || records[0].get('leaf')==false){
					Ext.Msg.alert("系统提示", "必须选中左侧的功能信息，才能进行修改！");
					return;
				}
				var record = treeStore.getNodeById(records[0].get('id'));
				var buttonstore = this.getStore('common.Buttons');
				var status = this.getStore('common.Status');
				var window = Ext.create('pb.view.common.ModuleWindow');
				window.setValue(record,buttonstore,status,'copy');
				window.show(null,function(o){
					Ext.ComponentQuery.query('textfield[name=code]',o)[0].setValue(null);
					Ext.ComponentQuery.query('textfield[name=id]',o)[0].setValue(null);
				});
			},
			refreshModule : function() {
				this.getModuleList().setValue(null,this.getStore('common.Status'));
				this.getStore('common.ModuleTree').load();
			}
		});
