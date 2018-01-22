/***
 * 功能编辑窗口处理类
 * @memberOf {TypeName} 
 */
Ext.define('pb.controller.common.ModuleWindow',{
			extend : 'Ext.app.Controller',
			stores : [ 'common.ModuleTree', 'common.Buttons','common.Status','common.Conditions','common.ModuleUIDetails','common.UITemplates'],
			requires : [ 'pb.view.common.ModuleParentWindow','pb.view.common.ModuleWindow','pb.view.common.SelectWindow','pb.view.common.ConditionWindow','pb.view.common.UIWindow'],
			refs : [ {
				ref : 'moduleList',
				selector : 'modulelist'
			}, {
				ref : 'parentwindow',
				selector : 'moduleparentwindow'
			}, {
				ref : 'modulewindow',
				selector : 'modulewindow'
			}, {
				ref : 'uiwindow',
				selector : 'uiwindow'
			}, {
				ref : 'selectWindow',
				selector : 'selectwindow'
			}, {
				ref : 'conditionWindow',
				selector : 'conditionwindow'
			} ],
			init : function() {
				this.control( {
					//模块窗口下的确定事件
					'moduleparentwindow button[id=parentSave]' : {
						click : this.saveModule
					},
					//模块窗口下的关闭事件
					'moduleparentwindow button[id=parentClose]' : {
						click : function() {
							this.getParentwindow().close();
						}
					},
					//功能编辑窗口的按钮新增事件
					'modulewindow button[id=btnAdd]':{
						click : function(){
							var bool = true;
							var grid = Ext.ComponentQuery.query('gridpanel',this.getModulewindow())[0];
							if (grid.getStore().data.length > 0) {
									var items = grid.getStore().data.items;
									for(var i = 0;i<items.length;i++){
										if (items[i].get('button_id') == '' || items[i].get('button_id') == undefined
												|| items[i].get('button_name') == '' || items[i].get('button_name') == undefined) {
											bool = false;
											continue;
										}
									}
							}
							if(bool){
								var store = this.getStore('common.Buttons');
								store.add( [ {
									'button_id' : '',
									'button_name' : '',
									'visible' : 0
								} ]);
								grid.editingPlugin.startEdit(store.data.length - 1, 0);
							}
						}
					},
					//功能编辑窗口的按钮删除事件
					'modulewindow button[id=btnDel]':{
						click : function(){
							var grid = Ext.ComponentQuery.query('gridpanel',this.getModulewindow())[0];
							var recond = grid.getSelectionModel().getSelection();
							if(recond.length==0){
								return;
							}
							grid.getStore().remove(recond);
						}
					},
					//模块窗口下的关闭事件
					'button[id=btnTop]' : {
						click : function() {
							var grid = Ext.getCmp("mbpanel");
							var records = grid.getSelectionModel().getSelection();
							if(records.length == 0) {
								return ;
							}
							var rowIndex = grid.getStore().indexOf(records[0]);
							if(rowIndex == 0) { 
			                    return; 
			                } 
			                grid.getStore().removeAt(rowIndex);  
			                grid.getStore().insert(rowIndex - 1, records[0]);  
			                grid.getSelectionModel().select(rowIndex - 1);  
			                grid.getView().refresh();
						}
					},
					//模块窗口下的关闭事件
					'button[id=btnLow]' : {
						click : function() {
							var grid = Ext.getCmp("mbpanel");
							var records = grid.getSelectionModel().getSelection();
							if(records.length == 0) {
								return ;
							}
							var rowIndex = grid.getStore().indexOf(records[0]);
							if(rowIndex < grid.getStore().getCount() - 1){ 
			                    grid.getStore().removeAt(rowIndex);  
			                    grid.getStore().insert(rowIndex + 1, records[0]);  
			                    grid.getSelectionModel().select(rowIndex + 1);  
			                    grid.getView().refresh();        
			                }
						}
					},
					'modulewindow combo[name=parent_id]':{
						change : function(o){
							Ext.ComponentQuery.query('textfield[name=parentCode1]',this.getModulewindow())[0].setValue(o.getValue());
						}
					},
					//功能编辑窗口的状态设置中gridpanel中操作事件【设置列表视图】
					'modulewindow gridpanel[id=statuspanel]':{
                		itemuibuttonclick : this.onStatusUI
					},
					//功能编辑窗口的保存事件
					'modulewindow button[id=moduleSave]' : {
						click : this.saveModule
					},
					//功能编辑窗口的关闭事件
					'modulewindow button[id=moduleClose]' : {
						click : function() {
							this.getModulewindow().close();
							this.getModuleList().setValue(null,this.getStore('common.Status'));
							this.getStore('common.ModuleTree').load();
						}
					},
					//功能编辑窗口的状态新增事件
					'modulewindow button[id=statusAdd]':{
						click : function(){
							this.getStore('common.Conditions').removeAll();
							Ext.create('pb.view.common.ConditionWindow').show();
						}
					},
					//功能编辑窗口的状态修改事件
					'modulewindow button[id=statusEdit]':{
						click : this.onStatusEdit
					},
					//功能编辑窗口的状态删除事件
					'modulewindow button[id=statusDel]':{
						click : this.onStatusDelete
					},
					//功能编辑窗口的状态上移事件
					'modulewindow button[id=statusTop]':{
						click : this.onStatusTop
					},
					//功能编辑窗口的状态下移事件
					'modulewindow button[id=statusLow]':{
						click : this.onStatusLow
					},
					//点击设置对应的列表视图模型弹出列表设置窗口
					'uiwindow button[id=viewBtn]' : {
						click : this.openUITemplates
					},
					//列表设置窗口的保存按钮事件
					'uiwindow button[id=saveUIBtn_]':{
						click : this.onSaveUI
					},
					//列表设置窗口的关闭按钮事件
					'uiwindow button[id=closeUIBtn_]':{
						click : function(){
							this.getUiwindow().close();
						}
					},
					//过滤条件【确定】按钮
					'conditionwindow':{
						saveConditionclick : this.saveCondition
					},
					//功能列表视图选择窗口的【确定】按钮
					'selectwindow':{
						saveSelectclick : this.saveSelect
					}
				});
			},
			saveModule : function(o) {
				var list = this.getModuleList();
				var window = o.ownerCt.ownerCt.ownerCt;
				var storeTree = this.getStore('common.ModuleTree');
				var buttonstore = this.getStore('common.Buttons');
				var statusstore = this.getStore('common.Status');
				var bs = [];
				var ss = [];
				if(buttonstore.data.length>0){
					buttonstore.each(function(model) {
						bs.push(model.data);
					});
				}
				if(statusstore.data.length>0){
					statusstore.each(function(model) {
						if(model.get('ui')==undefined ||model.get('ui')==''){
							ss.push({
								status_id :  model.get('status_id'),
								status_code : model.get('status_code'),
								status_name : model.get('status_name'),
								condition :  model.get('conditionStr'),
								conditions : model.raw.conditions,
								is_enabled :  model.get('is_enabled')
							});
						}else{
							var s = model.data;
							s.condition = model.raw.conditionStr
							s.conditions=model.raw.conditions;
							ss.push(s);
						}
					});
				}
				var form = window.getForm();
				if (form.isValid()) {
					form.submit( {
						url : '/realware/saveModule.do',
						method : 'POST',
						timeout : 60000,
						waitTitle : '提示',
						params : {
							buttons : Ext.encode(bs),
							status : Ext.encode(ss)
						},
						waitMsg : '后台正在处理中，请您耐心等候...',
						success : function(form, action) {
							Ext.Msg.show( {
								title : '成功提示',
								msg : action.result.mess,
								buttons : Ext.Msg.OK,
								icon : Ext.MessageBox.INFO
							});
							form.reset();
							window.close();
							list.setValue(null,statusstore);
							storeTree.load();
						},
						failure : function(form, action) {
							Ext.Msg.show( {
								title : '失败提示',
								msg : action.result.mess,
								buttons : Ext.Msg.OK,
								icon : Ext.MessageBox.ERROR
							});
						}
					});
				}
			},
			onStatusEdit : function(){
				var grid = Ext.ComponentQuery.query('gridpanel[id=statuspanel]',this.getModulewindow())[0]; 
				var records = grid.getSelectionModel().getSelection();
				if(records.length==0){
					Ext.Msg.alert('系统提示', '请选择一条再进行修改操作！');
					return;
				}
				var store = this.getStore('common.Conditions');
				store.removeAll();
				store.insert(0, records[0].raw.conditions);
				Ext.create('pb.view.common.ConditionWindow',{ statusRecord: records[0]}).show();
			},
			onStatusDelete: function(){
				var grid = Ext.ComponentQuery.query('gridpanel[id=statuspanel]',this.getModulewindow())[0]; 
				var records = grid.getSelectionModel().getSelection();
				if(records.length==0){
					Ext.Msg.alert('系统提示', '请选择一条再进行删除操作！');
					return;
				}
				var index = grid.getStore().indexOf(records[0]);
				grid.getStore().removeAt(index);
			},
			onStatusTop: function(){
				var grid = Ext.ComponentQuery.query('gridpanel[id=statuspanel]',this.getModulewindow())[0]; 
				var records = grid.getSelectionModel().getSelection();
				if(records.length==0){
					Ext.Msg.alert("系统提示", "请先选中行再上移！");
					return;
				}
				var index = grid.getStore().indexOf(records[0]);
				if (index > 0) {
					grid.getStore().removeAt(index);
					grid.getStore().insert(index - 1, records[0]);
					grid.getSelectionModel().select(index - 1);
				}
			},
			onStatusLow: function(){
				var grid = Ext.ComponentQuery.query('gridpanel[id=statuspanel]',this.getModulewindow())[0]; 
				var records = grid.getSelectionModel().getSelection();
				if(records.length==0){
					Ext.Msg.alert("系统提示", "请先选中行再下移！");
					return;
				}
				var index = grid.getStore().indexOf(records[0]);
				if (index < grid.getStore().getCount() - 1) {
					grid.getStore().removeAt(index);
					grid.getStore().insert(index + 1, records);
					grid.getSelectionModel().select(index + 1);
				}
			},
			onStatusUI : function(record){
				var uiwindow = Ext.create('pb.view.common.UIWindow',{ statuRecord :record });
				var grid = Ext.ComponentQuery.query('editgrid',uiwindow)[0];
				grid.getStore().removeAll();
				if(record.get('ui')!=null && record.get('ui')!=''){
					grid.getStore().insert(0,record.get('ui').details);
				}
				uiwindow.show();
			},
			openUITemplates : function(){
				var maps = Ext.create('Ext.util.HashMap');
				maps.add('template_name','列表名称');
				maps.add('control_name','控件名称');
				var store = this.getStore('common.UITemplates');
				var selectwindow = Ext.create('pb.view.common.SelectWindow',{
					listStore : store,
					colMaps : maps,
					title : '列表视图模型'
				}).show();
			},
			onSaveUI : function(){
				var w = this.getUiwindow();
				var statusstore = this.getStore('common.Status');
				var uidetailstore = this.getStore('common.ModuleUIDetails');
				var record = w.statuRecord;
				var form = w.getForm();
				var index = statusstore.indexOf(record);
				statusstore.removeAt(index);
				var uidetails = [];
				uidetailstore.each(function(u){
					uidetails.push(u.data);
				});
				record.set('ui',{
					view_name : form.findField('ui_name').getValue(),
					control_name: form.findField('moduleView').getValue(),
					view_alias : form.findField('ui_alias').getValue(),
					is_subtotal: form.findField('is_subtotal').getValue(),
					pagesize : form.findField('ui_pagesize').getValue(),
					details : uidetails
				});
				record.raw.ui = {
					view_name : form.findField('ui_name').getValue(),
					control_name: form.findField('moduleView').getValue(),
					view_alias : form.findField('ui_alias').getValue(),
					is_subtotal: form.findField('is_subtotal').getValue(),
					pagesize : form.findField('ui_pagesize').getValue(),
					details : uidetails
				};
				statusstore.insert(index,record);
				uidetailstore.removeAll();
				form.reset();
				w.close();
			},
			saveCondition : function(o,grid){
				var statusstore = this.getStore('common.Status');
				var statusCode = Ext.ComponentQuery.query('textfield[name=statusCode]',o)[0];
				var statusName = Ext.ComponentQuery.query('textfield[name=statusName]',o)[0];
				var isEnabled = Ext.ComponentQuery.query('combo[name=isEnabled]', o)[0];
				if(Ext.isEmpty(statusCode.getValue()) || Ext.isEmpty(statusName.getValue())){
					Ext.Msg.alert('系统提示', '状态编码和状态名称不能为空！');
					return;
				}
				//过滤条件集合
				var c = [];
				var condition_ = [];
				var data = grid.getStore().data;
				if(data.length>0) {
					Ext.Array.each(data.items, function(model) {
						var alias = '';
						if (model.get('alias') != '' && model.get('alias') != undefined) {
							alias = model.get('alias') + '.';
						}
						if(model.get('type') == 1) {
							condition_.push(model.get('value'));
						} else {
							condition_.push(model.get('operation')
								+ alias + ' ' + model.get('attr_code')
								+ model.get('relation')
								+ model.get('value'));
						}
						c.push({
							operation :  model.get('operation'),
							alias : model.get('alias'),
							relation : model.get('relation'),
							attr_code : model.get('attr_code'),
							value : model.get('value'),
							datatype : model.get('datatype'),
							status_id : model.get('status_id'),
							status_cid : model.get('status_cid'),
							type : model.get('type')
						});
					});
					this.getStore('common.Conditions').removeAll();
				}
				if (condition_.length == 0) {
					Ext.Msg.alert('系统提示', '当前状态:' + statusCode.getValue() + statusName.getValue() + '，过滤条件不能为空!');
					return;
				}
				if(o.statusRecord!=null){	
					//修改
					var index = statusstore.indexOf(o.statusRecord);
					statusstore.removeAt(index);
					var record = o.statusRecord;
					record.raw.status_code = statusCode.getValue();
					record.raw.status_name = statusName.getValue();
					record.raw.is_enabled =  isEnabled.getValue();
					record.raw.conditionStr = condition_.join(";");
					record.raw.conditions = c;
					record.set('conditionStr', condition_.join(";"));
					record.set('conditions',c);
					record.set('status_code',statusCode.getValue());
					record.set('status_name',statusName.getValue());
					record.set('is_enabled',isEnabled.getValue());
					statusstore.insert(index, record);
					grid.getSelectionModel().select(index);
				}else{
					var num_ = statusstore.findBy(function(s){
						if(statusCode.getValue() == s.get('status_code')){
							return 1;
						}
					});
					if(num_ != -1){
						Ext.Msg.alert('系统提示', '状态编码:' + statusCode.getValue()+ "已存在,不能新增！");
						return;
					}
					//新增
					statusstore.insert(statusstore.data.length,[{
						status_code : statusCode.getValue(),
						status_name : statusName.getValue(),
						is_enabled :  isEnabled.getValue(),
						conditionStr : condition_.join(";"),
						conditions : c
					}]);
					grid.getSelectionModel().select(statusstore.data.length);
				}
				statusCode.setValue(null);
				statusName.setValue(null);
				o.close();
			},
			saveSelect :function(o){
				var u_ = this.getUiwindow();
				var row = o.getRawValue();
				if (row != null) {
					Ext.ComponentQuery.query('textfield[name=moduleView]',u_)[0].setValue(row.raw.control_name);
					Ext.ComponentQuery.query('textfield[name=ui_name]',u_)[0].setValue(row.raw.template_name);
					var store = this.getStore('common.ModuleUIDetails');
					store.removeAll();
					store.insert(0, row.raw.details);
					o.close();
				}
			}
		});
