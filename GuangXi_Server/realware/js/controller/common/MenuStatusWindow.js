/***
 * 状态对话框处理类
 * @memberOf {TypeName} 
 */
Ext.define('pb.controller.common.MenuStatusWindow', {
	extend : 'Ext.app.Controller',
	stores : [ 'common.MenuStatus','common.Menus','common.MenuUIDetails','common.UITemplates','common.Module'],
	models : [ 'common.UITemplate','common.Status'],
	requires : [ 'pb.view.common.MenuStatusWindow','pb.view.common.SelectWindow' ],
	refs : [ {
		ref : 'window',
		selector : 'menustatuswindow'
	},{
		ref : 'selectWindow',
		selector : 'selectwindow'
	} ],
	init : function() {
		this.control( {
			//点击打开功能状态窗口
			'menustatuswindow button[id=module_statusBtn]' : {
				click : this.openModuleStatus
			},
			//点击设置对应的列表视图模型
			'menustatuswindow button[id=viewBtn]' : {
				click : this.openUITemplates
			},
			//确定
			'menustatuswindow button[id=save]' : {
				click : this.onSaveMenuStatus
			},
			//取消
			'menustatuswindow button[id=close]' : {
				click : function(o) {
					this.getWindow().close();
				}
			}
		})
	},
	openModuleStatus : function(){
		//获取当前选中的菜单对应的功能
		var records = Ext.getCmp('cbxMenu').valueModels;
		var menustatusstore = this.getStore('common.MenuStatus');
		var statusModel = this.getModel('common.Status');
		var w = this.getWindow();
		var uistore = this.getStore('common.MenuUIDetails');
		if (records.length > 0) {
			var moduleId = records[0].get('module_id');
			this.getStore('common.Module').load({
				params:{
					moduleId :moduleId
				},
				callback: function(records, operation, success) {
					if(success){
						var statusList = records[0].raw.statusList;
						var maps = Ext.create('Ext.util.HashMap');
						maps.add('status_code','状态编码');
						maps.add('status_name','状态名称');
						maps.add('conditionStr','过滤条件');
						var store = Ext.create('Ext.data.Store', {
							model: statusModel,
							data : statusList
						});
						var selectWindow = Ext.create('pb.view.common.SelectWindow',{
							 title : '功能状态信息',
							 listStore : store,
							 colMaps : maps,
							 width : 500
						});
						selectWindow.on('saveSelectclick',function(){
							var record = this.getRawValue();
							if(record==null) return;
							else if(w.title.indexOf('新增')!=-1){
								var model = Ext.Array.findBy(menustatusstore.data.items,function(m){
									if(m.get('status_id') == record.get('status_id')){
										return record;
									}
								});
								if(model!=null && model!=undefined){
									Ext.Msg.alert("系统提示", "当前菜单对状态已存在,不能进行新增操作！");
									return;
								}
							}
							w.setItemsValue(record,uistore);
							this.close();
						});
						selectWindow.show();
					}
				}
			});
		}
		
	},
	openUITemplates : function(){
		var uistore = this.getStore('common.UITemplates');
		var store = this.getStore('common.MenuUIDetails');
		var w = this.getWindow();
		var maps = Ext.create('Ext.util.HashMap');
		maps.add('template_name','列表名称');
		maps.add('control_name','控件名称');
		var selectWindow = Ext.create('pb.view.common.SelectWindow',{
			title : '列表视图模型',
			listStore : uistore,
			colMaps : maps
		});
		selectWindow.on('saveSelectclick',function(){
			var row = this.getRawValue();
			if(row==null) return;
			w.getForm().findField('menuView').setValue(row.raw.control_name);
			w.getForm().findField('ui_name').setValue(row.raw.template_name);
			w.getForm().findField('ui_pagesize').setValue(100);
			w.getForm().findField('is_subtotal').setValue(1);
			store.removeAll();
			store.insert(0, row.raw.details);
			this.close();
		});
		selectWindow.show()
	},
	onSaveMenuStatus : function(){
		var w = this.getWindow();
		var form = w.getForm();
		var menustore = this.getStore('common.Menus');
		var cbxMenu = Ext.getCmp('cbxMenu');
		var admdivCode = Ext.getCmp('admdivCode').getValue();
		if (form.isValid()) {
			//视图
			var uidetail = this.getStore('common.MenuUIDetails');
			var detail = [];
			if(uidetail.data.length>0){
				uidetail.each(function(model) {
					detail.push(model.raw);
				});
			}
			//状态
			var menustatus = {
				menu_status_id : form.findField('menu_status_id').getValue(),
				status_id : form.findField('menu_statusId').getValue(),
				status_code : form.findField('menu_statusCode').getValue(),
				status_name : form.findField('menu_statusName').getValue(),
				admdiv_code : admdivCode,
				menu_id :cbxMenu.getValue(),
				ui : {
					view_name : form.findField('ui_name').getValue(),
					control_name : form.findField('menuView').getValue(),
					pagesize : form.findField('ui_pagesize').getValue(),
					view_alias : form.findField('ui_alias').getValue(),
					is_subtotal : form.findField('is_subtotal').getValue(),
					admdiv_code : admdivCode,
					menu_id : cbxMenu.getValue(),
					details : detail
				}
			};
			var index = menustore.indexOf(cbxMenu.valueModels[0]);
			var oldStatus = menustore.getAt(index).raw.statusList;
			var aa = [];
			if(oldStatus==null){
				aa.push(menustatus);
			}else{
				if(w.title.indexOf('修改')!=-1){
					Ext.Array.each(oldStatus,function(o){
						if(o.status_id == menustatus.status_id && o.admdiv_code==admdivCode){
							aa.push(menustatus);
						}else{
							aa.push(o);
						}
					});
				}else{
					aa = oldStatus;
					aa.push(menustatus);
				}
			}
			menustore.getAt(index).raw.statusList = aa;
			menustore.getAt(index).set('statusList',aa);
			w.close();
		}
	}
});