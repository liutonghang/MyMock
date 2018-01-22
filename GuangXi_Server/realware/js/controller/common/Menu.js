/***
 * 菜单主界面处理类
 * @memberOf {TypeName} 
 */
Ext.define('pb.controller.common.Menu', {
	extend : 'Ext.app.Controller',
	stores : [ 'common.MenuTree'],
	requires : [ 'pb.view.common.MenuList','pb.view.common.MenuParentWindow'],
	refs : [ {
		ref : 'menuList',
		selector : 'menulist'
	},{
		ref : 'menuparentWindow',
		selector : 'menuparentwindow'
	} ],
	init : function() {
		this.control( {
			//新增栏目
			'menulist button[id=addMenuParent]':{
				click: this.addMenuParent
			},
			//修改栏目
			'menulist button[id=editMenuParent]':{
				click: this.editMenuParent
			},
			//删除栏目
			'menulist button[id=delMenuParent]':{
				click: this.delMenuParent
			},
			//设置菜单
			'menulist button[id=editMenu]':{
				click : this.editMenu
			},
			//保存菜单栏目
			'menuparentwindow button[id=parentSave]':{
				click : this.saveMenuGroup
			},
			//关闭菜单栏目
			'menuparentwindow button[id=parentClose]':{
				click : function(){
					this.getMenuparentWindow().close();
				}
			}
		})
	},
	//新增菜单栏目
	addMenuParent : function(){
		//创建菜单栏目窗口
		var w = Ext.create('pb.view.common.MenuParentWindow');
		//设置菜单栏目的标题
		w.setTitle('新增菜单栏目');
		w.show();
	},
	//修改菜单栏目
	editMenuParent : function(){
		var tree = Ext.ComponentQuery.query('treepanel',this.getMenuList())[0];
		var records = tree.getSelectionModel().getSelection();
		if(records.length==0){
			return;
		}
		var w = Ext.create('pb.view.common.MenuParentWindow');
		w.setTitle('修改菜单栏目');
		//指定菜单栏目中控件赋值后再显示窗口
		Ext.ComponentQuery.query('textfield[name=code]',w)[0].setDisabled(true);
		Ext.ComponentQuery.query('textfield[name=id]',w)[0].setValue(records[0].raw.id);
		Ext.ComponentQuery.query('textfield[name=code]',w)[0].setValue(records[0].raw.code);
		Ext.ComponentQuery.query('textfield[name=name]',w)[0].setValue(records[0].raw.name);
		w.show();
	},
	//删除菜单栏目
	delMenuParent : function(){
		//获取菜单树的数据集
		var menutreestore = this.getStore('common.MenuTree');
		//获取菜单主界面中类型为treepanel的控件
		var tree = Ext.ComponentQuery.query('treepanel',this.getMenuList())[0];
		//获取当前选中行
		var records = tree.getSelectionModel().getSelection();
		//判断是否选中行
		if(records.length==0){
			return;
		//判断选中节点是否有子节点
		}else if(records[0].childNodes.length>0){
			Ext.Msg.alert("系统提示", "菜单栏目下还有菜单，不能进行删除操作！");
			return;
		}
		//加载框定义
		var myMask = new Ext.LoadMask(Ext.getBody(), {
					msg : '后台正在处理中，请稍后....',
					removeMask : true
				});
		//再次提示是否删除
		Ext.Msg.confirm("系统提示","确定要删除选中的菜单栏目？",function(e) {
				//点击"确定"按钮
				if (e == "yes") {
					//显示加载框
					myMask.show();
					//远程处理
					Ext.Ajax.request({
						url : '/realware/delMenuGroup.do',
						method : 'POST',
						params : {
							menuId : records[0].get('id')
						},
						timeout : 60000, 
						success : function(response, options) {
							//隐藏加载框
							myMask.hide();
							//成功提示
							Ext.Msg.show({
								title : '成功提示',
								msg : response.responseText,
								buttons : Ext.Msg.OK,
								icon : Ext.MessageBox.INFO
							});
							//刷新菜单树数据集
							menutreestore.load();
						},
						failure : function(response, options) {
							//隐藏加载框
							myMask.hide();
							//失败提示
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
	//保存菜单栏目
	saveMenuGroup : function(){
		//获取菜单树的数据集
		var menutreestore = this.getStore('common.MenuTree');
		//获取菜单栏目窗口
		var w = this.getMenuparentWindow();
		//获取菜单栏目窗口的表单
		var form = w.getForm();
		//表单校验
		if (form.isValid()) {
			//提交
			form.submit( {
					url : '/realware/saveMenuGroup.do',
					method : 'POST',
					timeout : 60000,
					waitTitle : '提示',
					waitMsg : '后台正在处理中，请您耐心等候...',
					success : function(form, action) {
						Ext.Msg.show( {
							title : '成功提示',
							msg : action.result.mess,
							buttons : Ext.Msg.OK,
							icon : Ext.MessageBox.INFO
						});
						//重置表单
						form.reset();
						//关闭菜单栏目
						w.close();
						//刷新菜单树数据集
						menutreestore.load();
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
	//编辑菜单
	editMenu : function(){
		var me = this;
		var tree = Ext.ComponentQuery.query('treepanel',this.getMenuList())[0];
		var records = tree.getSelectionModel().getSelection();
		if(records.length==0){
			return;
		}
		if(records[0].get('leaf') == false){
			var w = Ext.create('pb.view.common.MenuEditWindow',{
				title : '菜单设置【所属栏目:' + records[0].get('code') + ' ' + records[0].get('name') +'】',
				parentId :  records[0].get('id'),
				parentName : records[0].get('name'),
				width : 450,
				height : me.getMenuList().getHeight()-30
			});
			var grid = Ext.ComponentQuery.query('gridpanel',w)[0];
			grid.getStore().removeAll();
			var data = [];
			Ext.Array.each(records[0].childNodes, function(model) {
					data.push( {
						id : model.get('id'),
						code : model.get('code'),
						name : model.get('name'),
						parent_id : records[0].get('id'),
						parent_name : records[0].get('name'),
						module_id : model.get('module_id'),
						parameter : model.get('parameter'),
						initialload : model.get('initialload')
//						start_date : model.get('start_date'),
//						end_date : model.get('end_date')
					});
			});
			grid.getStore().insert(0,data);
			w.show();
		}
	}
});
