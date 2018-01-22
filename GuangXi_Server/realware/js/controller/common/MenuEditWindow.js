/***
 * 菜单设置处理类
 * @memberOf {TypeName} 
 */
Ext.define('pb.controller.common.MenuEditWindow', {
	extend : 'Ext.app.Controller',
	store : [ 'common.MenuTree','common.ModuleTree', 'common.Module' ],
	requires : [ 'pb.view.common.MenuEditWindow','pb.view.common.MenuWindow' ],
	refs : [ {
		ref : 'menueditWindow',
		selector : 'menueditwindow'
	},{
		ref : 'menuWindow',
		selector : 'menuwindow'
	} ],
	init : function() {
		this.control( {
			//保存菜单
			'menueditwindow button[id=saveMenu]':{
				click : this.saveMenu
			},
			//取消编辑
			'menueditwindow button[id=cancelMenu]':{
				click : this.cancelMenu
			},
			//新增
			'menueditwindow button[id=add_]':{
				click : this.onAddMenu
			},
			//修改
			'menueditwindow button[id=edit_]':{
				click : this.onEditMenu
			},
			//删除
			'menueditwindow button[id=delete_]':{
				click : this.onDelMenu
			},
			//上移
			'menueditwindow button[id=top_]':{
				click : this.onTopMenu
			},
			//下移
			'menueditwindow button[id=low_]':{
				click : this.onLowMenu
			},
			//全部功能列表
			'menuwindow button[id=menu_moduleBtn]':{
				click : function(){
					//获取菜单编辑框中name=moduleId文本框
					var txtModuleId = Ext.ComponentQuery.query('textfield[name=moduleId]',this.getMenuWindow())[0];
					var txtMenuModule = Ext.ComponentQuery.query('textfield[name=menu_module]',this.getMenuWindow())[0];
					var treestore = this.getStore('common.ModuleTree');
					var maps = Ext.create('Ext.util.HashMap');
					maps.add('code','编码');
					maps.add('name','名称');
					//弹出功能列表选择框
					var w = Ext.create('pb.view.common.SelectWindow',{
						panelType : 1,  //控件类型
						title : '功能列表', //标题
						listStore : treestore, //数据集
						colMaps : maps,
						y : 270 //y坐标
					});
					//定义确定按钮的事件
					w.on('saveSelectclick',function(){
						var record = this.getRawValue();
						if(record.get('leaf')==false){
							return;
						}
						txtModuleId.setValue(record.raw.id);
						txtMenuModule.setValue(record.raw.codename);
						this.close();
					});
					w.show();
				}
			},
			//保存菜单
			'menuwindow button[id=menuSave]':{
				click : function(){
					//获取菜单编辑窗口
				    var w = this.getMenuWindow();
				    //获取菜单主界面类型gridpanel控件
					var grid = Ext.ComponentQuery.query('gridpanel',this.getMenueditWindow())[0];
					//获取菜单编辑窗口中的表单
					var form = w.getForm();
					//定义集合
					var record = [];
					//表单校验
					if (form.isValid()) {
						//赋值
						record.push({
							parent_id : form.findField('parent_id').getValue(),
							parent_name : form.findField('parent_name').getValue(),
							module_id : form.findField('moduleId').getValue(),
							parameter : form.findField('parameter').getValue(),
//							start_date : form.findField('start_date').getValue(),
//							end_date: form.findField('end_date').getValue(),
							name : form.findField('name').getValue(),
							code : form.findField('code').getValue(),
							id : form.findField('id').getValue(),
//							admdivCode : form.findField('admdivCode').getValue(),// 菜单中不记录区划信息
							remark : form.findField('remark').getValue(),
							initialload : form.findField('initialload').getValue()
						});
						//判断菜单编辑窗口的标题
						if(w.title.indexOf('新增')!=-1){
							//获取gridpanel数据集的长度
							var index = grid.getStore().data.length;
							//指定下标新增行
							grid.getStore().insert(index,record);
							//根据索引指定列表选中行
							grid.getSelectionModel().select(index);
						}else{
							//获取当前gridpanel的选中行
							var records = grid.getSelectionModel().getSelection();
							//获取当前gridpanel的选中行的下标
							var index = grid.getStore().indexOf(records[0]);
							//指定行删除数据集中某项
							grid.getStore().removeAt(index);
							//指定下标新增行
							grid.getStore().insert(index, record);
							//根据索引指定列表选中行
							grid.getSelectionModel().select(index);
						}
						//关闭菜单编辑窗口
						w.close();
					}
				}
			},
			//关闭菜单编辑框
			'menuwindow button[id=menuClose]':{
				click : function(){
					this.getMenuWindow().close();
				}
			}
		})
	},
	//取消编辑
	cancelMenu :  function(){
		this.getMenueditWindow().close();
		this.getStore('common.MenuTree').load();
	},
	//保存菜单
	saveMenu : function(){
		var w = this.getMenueditWindow();
		var menutreeStore = this.getStore('common.MenuTree');
		var menus = [];
		var grid = Ext.ComponentQuery.query('gridpanel',w)[0];
		grid.getStore().each(function(record){
			menus.push({
				id : record.get('id'),
				code : record.get('code'),
				name : record.get('name'),
				parent_id : record.get('parent_id'),
				module_id : record.get('module_id'),
				parameter : record.get('parameter'),
				admdiv_code :record.get('admdiv_code'),
				initialload : record.get('initialload'),
				remark : record.get('remark')
//				start_date : record.get('start_date'),
//				end_date: record.get('end_date')
			});
		});
		var myMask = new Ext.LoadMask(Ext.getBody(), {
			msg : '后台正在处理中，请稍后....',
			removeMask : true
		});
		myMask.show();
		Ext.Ajax.request({
			url : '/realware/saveMenus.do',
			method : 'POST',
			params : {
				menus : Ext.encode(menus),
				parentId : w.parentId
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
				w.close();
				menutreeStore.load();
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
	//新增菜单
	onAddMenu : function(){
		var editWin = this.getMenueditWindow();
		var w = Ext.create('pb.view.common.MenuWindow');
		w.setTitle('新增菜单窗口');
		w.getForm().findField('parent_id').setValue(editWin.parentId);
		w.getForm().findField('parent_name').setValue(editWin.parentName);
		w.show();
	},
	//修改菜单
	onEditMenu : function(){
		var grid = Ext.ComponentQuery.query('gridpanel',this.getMenueditWindow())[0];
		var records = grid.getSelectionModel().getSelection();
		if(records.length==0){
			Ext.Msg.alert("系统提示", "请先选中行再进行修改操作！");
			return;
		}
		var w = Ext.create('pb.view.common.MenuWindow');
		w.setTitle('修改菜单窗口');
		this.getStore('common.Module').load({
			params:{
				moduleId :records[0].get('module_id')
			},
			callback: function(r, operation, success) {
				if(success){
					w.getForm().findField('parent_id').setValue(records[0].get('parent_id'));
					w.getForm().findField('parent_name').setValue(records[0].get('parent_name'));
					w.getForm().findField('id').setValue(records[0].get('id'));
					w.getForm().findField('code').setValue(records[0].get('code'));
					w.getForm().findField('name').setValue(records[0].get('name'));
					w.getForm().findField('moduleId').setValue(records[0].get('module_id'));
					w.getForm().findField('menu_module').setValue(r[0].get('code')+'' + r[0].get('name'));
					w.getForm().findField('parameter').setValue(records[0].get('parameter'));
					w.getForm().findField('remark').setValue(records[0].get('remark'));
					w.getForm().findField('initialload').setValue(records[0].get('initialload'));
//					w.getForm().findField('start_date').setValue(records[0].get('start_date'));
//					w.getForm().findField('end_date').setValue(records[0].get('end_date'));
					w.show();
				}
			}
		});
		
	},
	//删除菜单
	onDelMenu : function(){
		var grid = Ext.ComponentQuery.query('gridpanel',this.getMenueditWindow())[0];
		var records = grid.getSelectionModel().getSelection();
		if(records.length==0){
			Ext.Msg.alert("系统提示", "请先选中行再进行删除操作！");
			return;
		}
		grid.getStore().remove(records);
		grid.getSelectionModel().select(0);
	},
	//上移菜单
	onTopMenu : function(){
		var grid = Ext.ComponentQuery.query('gridpanel',this.getMenueditWindow())[0];
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
	//下移菜单
	onLowMenu : function(){
		var grid = Ext.ComponentQuery.query('gridpanel',this.getMenueditWindow())[0];
		var records = grid.getSelectionModel().getSelection();
		if(records.length==0){
			Ext.Msg.alert("系统提示", "请先选中行再下移！");
			return;
		}
		var index = grid.getStore().indexOf(records[0]);
		if (index < grid.getStore().getCount() - 1) {
			grid.getStore().removeAt(index);
			grid.getStore().insert(index + 1, records[0]);
			grid.getSelectionModel().select(index + 1);
		} 
	}
});
