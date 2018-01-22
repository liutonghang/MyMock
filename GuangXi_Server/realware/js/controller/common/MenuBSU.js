/***
 * 菜单状态设置处理类
 * @memberOf {TypeName} 
 */
Ext.define('pb.controller.common.MenuBSU',{
					extend : 'Ext.app.Controller',
					stores : [ 'common.Menus','common.MenuParent', 'common.MenuStatus','common.MenuButton','common.MenuUIDetails'],
					models : [ 'common.MenuStatus'],
					requires : ['pb.view.common.MenuBSUList','pb.view.common.MenuStatusWindow'],
					refs : [ {
						ref : 'statusWindow',
						selector : 'menustatuswindow'
					} ],
					init : function() {
						this.control( {
							//菜单模块事件定义
							'mbsvlist combo[id=menuParent]' : {
								//选中事件
								select : function() {
									Ext.getCmp('cbxMenu').setValue(null);
									Ext.getCmp('statusCbx').setValue(null);
									//指定数据集清空
									this.getStore('common.MenuButton').removeAll();
									this.getStore('common.MenuUIDetails').removeAll();
									this.getStore('common.Menus').load();
								}
							},
							//所属菜单事件定义
							'mbsvlist combo[id=cbxMenu]' : {
								//选中事件
								select : this.onLoadStatusAndButton
							},
							//状态信息
							'mbsvlist combo[id=statusCbx]':{
								select : function(combo,records,eOpts){
									var uiStore = this.getStore('common.MenuUIDetails');  
									uiStore.removeAll();
									var ui = records[0].raw.ui;
									if(ui!=null){
										uiStore.insert(0,ui.details);
									}
								}
							},
							//行政区划
							'mbsvlist combo[id=admdivCode]':{
								select : function(o){
									var buttonStore = this.getStore('common.MenuButton'); 
									buttonStore.removeAll();
									var records = Ext.getCmp('cbxMenu').valueModels;
									if (records.length > 0) {
										var record = records[0];
										if (record.raw.buttonList.length > 0) {
											var bs = []; 
											Ext.Array.findBy(record.raw.buttonList,function(b){
												if(b.admdiv_code == o.value){
													bs.push(b);
												}
											});
											buttonStore.insert(0,bs);
										}
									}
								}
							},
							//编辑按钮
							'mbsvlist button[id=editMenuBSU]' : {
								click : this.editMenuBSU
							},
							//取消编辑按钮
							'mbsvlist button[id=noeditMenuBSU]':{
								click : this.noeditMenuBSU
							},
							//删除按钮
							'mbsvlist button[id=deleteMenuBSU]':{
								click : this.delelteMenuBSU
							},
							//保存按钮
							'mbsvlist button[id=saveMenuBSU]':{
								click : this.onSaveMenuButtonStatus
							},
							//匹配功能按钮进行设置
							'mbsvlist button[id=modulebutton]':{
								click : this.onModuleButton
							},
							//新增菜单按钮
							'mbsvlist button[id=ms_add_btn]':{
								click : this.onAddStatus
							},
							//修改菜单按钮
							'mbsvlist button[id=ms_edit_btn]':{
								click : this.onEditStatus
							},
							//删除菜单按钮
							'mbsvlist button[id=ms_del_btn]':{
								click : this.onDeleteStatus
							},
							'menustatuswindow':{
								//菜单状态设置的关闭事件
								close : function(){
									this.onLoadStatus(Ext.getCmp('cbxMenu').valueModels[0].raw.statusList);
								}
							}
						});
					},
					onLaunch : function() {
						this.getStore('common.Menus').on('beforeload',this.onMenuLoad);
						this.getStore('common.Menus').on('load',function(t, records, successful, eOpts){
							if(successful){
								Ext.Array.each(records,function(m){
									m.set('codename',m.get('code') + m.get('name'));
								});
							}
						});
					},
					onMenuLoad : function(thiz, o) {
						var menuParent = Ext.getCmp('menuParent').getValue();
						if (Ext.isEmpty(menuParent)) {
							Ext.Msg.alert("提示信息", "请先选择所属模块，再选择所属菜单！");
							return;
						}
						if (null == o.params || o.params == undefined) {
							o.params = [];
						}
						o.params["parentId"] = menuParent;
					},
					editMenuBSU : function(o) {
						if (Ext.getCmp('cbxMenu').getValue() == ''
								|| Ext.getCmp('cbxMenu').getValue() == null) {
							Ext.Msg.alert("系统提示", "请先选中菜单信息，才能进行编辑！");
							return;
						}
						this.setDisabled(true);
					},
					noeditMenuBSU : function(){
						var me = this;
						var menuId = Ext.getCmp('cbxMenu').getValue();
						this.getStore('common.Menus').load({
							 callback: function(records, operation, success) {
								if(success){
								  	Ext.Array.each(records,function(r){
										if(menuId == r.get('id')){
											me.onLoadStatusAndButton(null,[r],null);
											me.setDisabled(false);
										}
									});
								}
							 }
						});
					},
					delelteMenuBSU : function(){
						if (Ext.getCmp('cbxMenu').getValue() == ''
								|| Ext.getCmp('cbxMenu').getValue() == null) {
							Ext.Msg.alert("系统提示", "请先选中菜单信息，才能进行删除！");
							return;
						}
						var record = Ext.getCmp('cbxMenu').valueModels[0];
						var me = this;
						var myMask = new Ext.LoadMask(Ext.getBody(), {
								msg : '后台正在处理中，请稍后....',
								removeMask : true
						});
						myMask.show();
						Ext.Ajax.request({
							url : '/realware/deleteMenuButtonStatus.do',
							method : 'POST',
							params : {
								admdivCode : Ext.getCmp('admdivCode').getValue(),
								menuId : Ext.getCmp('cbxMenu').getValue()
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
								//当前菜单对应的所有按钮
								var allbtn = record.raw.buttonList;
								var newbtns = [];
								if(allbtn.length>0){
									Ext.Array.each(allbtn, function(model) {
    									if( model.admdiv_code != Ext.getCmp('admdivCode').getValue()){
											newbtns.push(model);
										}
									});
								}
								record.raw.buttonList = newbtns;
								me.onLoadStatusAndButton( Ext.getCmp('cbxMenu'), Ext.getCmp('cbxMenu').valueModels,null);
								me.setDisabled(false);
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
					},
					onModuleButton : function(){
						var menubuttonstore = this.getStore('common.MenuButton');
						menubuttonstore.removeAll();
						//获取当前选中的菜单对应的功能
						var records = Ext.getCmp('cbxMenu').valueModels;
						if (records.length > 0) {
							var moduleId = records[0].get('module_id');
							this.getStore('common.Module').load({
								params:{
									moduleId :moduleId 
								},
								callback: function(records, operation, success) {
									if(success){
										menubuttonstore.insert(0,records[0].raw.buttons);
									}
								}
							});
						}
					},
					onSaveMenuButtonStatus : function(){
						var me = this;
						var record = Ext.getCmp('cbxMenu').valueModels[0];
						var buttonstore = this.getStore('common.MenuButton');
						var bs = [];
						if(buttonstore.data.length>0){
							buttonstore.each(function(model) {
								bs.push( {
									button_id : model.get('button_id'),
									button_name : model.get('button_name'),
									visible : model.get('visible'),
									admdiv_code : Ext.getCmp('admdivCode').getValue(),
									menu_id : Ext.getCmp('cbxMenu').getValue()
								});
							});
							if(bs.length > 0){
								//buttonstore为当前区划的按钮信息，为全部区划的按钮信息record.raw.buttonList
								var admdiv_code = bs[0].admdiv_code;
								var allbtn = record.raw.buttonList;
								var newbtns = [];
								if(allbtn.length>0){
									Ext.Array.each(allbtn, function(model) {
    									if( model.admdiv_code != admdiv_code){
											newbtns.push(model);
										}
									});
								}
								record.raw.buttonList = Ext.Array.union(newbtns,bs);
							}
						}
						var admdivCode = Ext.getCmp('admdivCode').getValue();
						var status = [];
						Ext.Array.each(record.raw.statusList,function(s){
							if(s.admdiv_code==admdivCode){
								status.push(s);
							}
						});
						var myMask = new Ext.LoadMask(Ext.getBody(), {
								msg : '后台正在处理中，请稍后....',
								removeMask : true
						});
						myMask.show();
						Ext.Ajax.request({
							url : '/realware/saveMenuButtonStatus.do',
							method : 'POST',
							params : {
								buttons : Ext.encode(bs),
								statusList : Ext.encode(status),
								menuId : record.get('id'),
								admdivCode :admdivCode
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
								me.onLoadStatusAndButton(Ext.getCmp('cbxMenu'),Ext.getCmp('cbxMenu').valueModels,null);
								me.setDisabled(false);
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
				 	},
					onAddStatus : function(){
						this.getStore('common.MenuUIDetails').removeAll();
						var addwindow = Ext.create('pb.view.common.MenuStatusWindow');
						addwindow.setTitle('新增菜单状态窗口');
						addwindow.show();
					},
					onEditStatus : function(){
						if (Ext.getCmp('statusCbx').getValue() == ''
								|| Ext.getCmp('statusCbx').getValue() == null) {
							Ext.Msg.alert("系统提示", "请先选中状态信息，才能进行修改操作！");
							return;
						}
						var uidetailstore = this.getStore('common.MenuUIDetails');
						var editwindow = Ext.create('pb.view.common.MenuStatusWindow');
						editwindow.setTitle('修改菜单状态窗口');
						editwindow.setItemsValue(Ext.getCmp('statusCbx').valueModels[0]);
						Ext.ComponentQuery.query('textfield[name=module_status]',editwindow)[0].hidden = true;
						Ext.ComponentQuery.query('button[id=module_statusBtn]',editwindow)[0].hidden = true;
						editwindow.show();
					},
					onDeleteStatus: function(){
						var admdivCode = Ext.getCmp('admdivCode').getValue();
						var cbxStatus = Ext.getCmp('statusCbx');
						var cbxMenu = Ext.getCmp('cbxMenu');
						var menustore = this.getStore('common.Menus');
						if (cbxStatus.getValue() == '' || cbxStatus.getValue() == null) {
							Ext.Msg.alert("系统提示", "请先选中状态信息，才能进行删除操作！");
							return;
						}
						
						var index = menustore.indexOf(cbxMenu.valueModels[0]);
						var newStatus = [];
						var oldStatus = menustore.getAt(index).raw.statusList;
						Ext.Array.each(oldStatus,function(o){
							if(!(cbxStatus.valueModels[0].get('status_id')==o.status_id && admdivCode==o.admdiv_code)){
								newStatus.push(o);
							}
						});
						menustore.getAt(index).raw.statusList = newStatus;
						menustore.getAt(index).set('statusList',newStatus);
						this.onLoadStatus(cbxMenu.valueModels[0].raw.statusList);
					},
					onLoadStatusAndButton : function(combo, records, eOpts) {
						var buttonStore = this.getStore('common.MenuButton'); //菜单按钮
						buttonStore.removeAll();
						if(records.length==0){
							return;
						}
						var status = records[0].raw.statusList;
						var buttons = records[0].raw.buttonList;
						var admdivCode = Ext.getCmp('admdivCode').getValue();
						//按钮设置
						if (buttons.length > 0) {
							var bs = []; 
							Ext.Array.findBy(buttons,function(b){
								if(b.admdiv_code == admdivCode){
									bs.push(b);
								}
							});
							if(bs.length > 0){
								buttonStore.insert(0,bs);
							}
						}
						this.onLoadStatus(status);
					},
					onLoadStatus: function(status) {
						var statusStore = this.getStore('common.MenuStatus'); //菜单状态
						var uiStore = this.getStore('common.MenuUIDetails');  //列表视图明细
						statusStore.removeAll();
						uiStore.removeAll();
						var admdivCode = Ext.getCmp('admdivCode').getValue();
						//状态设置
						if(status.length > 0){
							var ss = []; 
							Ext.Array.findBy(status,function(s){
								if(s.admdiv_code == admdivCode){
									ss.push(s);
								}
							});
							if(ss.length > 0){
								statusStore.loadData(ss);
								var ui = ss[0].ui;
								if(ui!=null){
									uiStore.insert(0,ui.details);
								}
								Ext.getCmp('statusCbx').setValue(ss[0].status_id);
							}
						}
					},
				 	setDisabled : function(edit){
					 	if(edit){
							Ext.getCmp('menuParent').setReadOnly(true);
							Ext.getCmp('cbxMenu').setReadOnly(true);
							Ext.getCmp('admdivCode').setReadOnly(true);
							Ext.getCmp('editMenuBSU').setDisabled(true);
							Ext.getCmp('noeditMenuBSU').setDisabled(false);
							Ext.getCmp('saveMenuBSU').setDisabled(false);
							Ext.getCmp('deleteMenuBSU').setDisabled(true);
							Ext.getCmp('modulebutton').setDisabled(false);
							Ext.getCmp('ms_add_btn').setDisabled(false);
							Ext.getCmp('ms_edit_btn').setDisabled(false);
							Ext.getCmp('ms_del_btn').setDisabled(false);
							Ext.getCmp('buttonPanel').setDisabled(false);
						}else{
							Ext.getCmp('menuParent').setReadOnly(false);
							Ext.getCmp('cbxMenu').setReadOnly(false);
							Ext.getCmp('admdivCode').setReadOnly(false);
							Ext.getCmp('editMenuBSU').setDisabled(false);
							Ext.getCmp('noeditMenuBSU').setDisabled(true);
							Ext.getCmp('saveMenuBSU').setDisabled(true);
							Ext.getCmp('deleteMenuBSU').setDisabled(false);
							Ext.getCmp('modulebutton').setDisabled(true);
							Ext.getCmp('ms_add_btn').setDisabled(true);
							Ext.getCmp('ms_edit_btn').setDisabled(true);
							Ext.getCmp('ms_del_btn').setDisabled(true);
							Ext.getCmp('buttonPanel').setDisabled(true);
						}
					}
				});
