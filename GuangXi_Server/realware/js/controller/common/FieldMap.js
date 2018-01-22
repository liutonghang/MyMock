/**
 * 字段映射的控制器
 * @memberOf {TypeName} 
 * @return {TypeName} 
 */
Ext.define('pb.controller.common.FieldMap', {
    extend: 'Ext.app.Controller',
    stores: ['common.FieldMap', 'common.ReflectField','common.ReflectFieldDetail'],
    models: ['common.FieldMap'],
    views: ['common.FieldMapList','common.FieldWindow'],
    refs : [ {
				ref : 'FieldMapList',
				selector : 'fieldlist'
			},{
				ref : 'FieldWindow',
				selector : 'fieldwindow'
			}],
	init: function () {
		this.control({
			'fieldlist combo[id=admdivCode]' : {
					//财政切换
					change : function(combo, newValue, oldValue, eOpts) {
						var grid = Ext.ComponentQuery.query("viewport > gridpanel")[0];
						if(grid) {
							grid.getStore().reload();
						}
					}
			},

			//新增
			'fieldlist button[id=add]': {
	              click : this.addObject
	            },
			//删除
            'fieldlist button[id=delete]': {
            	click : this.deleteReflect
            },
            //修改
             'fieldlist button[id=modify]': {
            	click: this.editReflectField
             },
             //刷新
             'fieldlist button[id=refresh]': {
            	click: this.refreshData
             },
             
             //字段明细删除操作从列表移除不与数据库交互
            'fieldwindow button[id=winDel]': {
            	click : function(){
            	var grid =  Ext.ComponentQuery.query("fieldwindow tabpanel")[0].getActiveTab();
							var recond = grid.getSelectionModel().getSelection();
							if(recond.length==0){
								return;
							}
							grid.getStore().remove(recond);
						}
            },
            //新增字段明细
             'fieldwindow button[id=winAdd]': {
            	click : this.addReflectField
            }, 
            //上移操作
            'fieldwindow button[id=winTop]': {
            	click : this.onStatusTop
            },
            //下移操作
              'fieldwindow button[id=winLow]': {
            	click : this.onStatusLow
            },
            //确定按钮保存当前window所有的操作
             'fieldwindow button[id=moduleSave]': {
            	click : this.saveField
            },
            //取消按钮关闭window,取消操作
             'fieldwindow button[id=moduleClose]': {
            	click : this.closeWin
            }
 
        });
    },
		
    
    	/**
    	 * 新增reflect_object对象
    	 * @memberOf {TypeName} 
    	 */
    	addObject:function(){
			var bool = true;
			var grid = Ext.ComponentQuery.query('gridpanel')[0];
			if (grid.getStore().data.length > 0) {
					var items = grid.getStore().data.items;
					for(var i = 0;i<items.length;i++){
						if (items[i].get('reflect_name') == '' || items[i].get('reflect_name') == undefined
								|| items[i].get('reflect_code') == '' || items[i].get('reflect_code') == undefined) {
							bool = false;
							continue;
						}
					}
			}
			if(bool){
				var store = this.getStore('common.FieldMap');
				store.add( [ {
					'reflect_id':'',
					'reflect_name' : '',
					'class_name' : '',
					'biz_type_id' : '',
					'is_enabled': 0,
					'evoucher_num':'',
					'reflect_code' :'',
					'print_default_page' :0,
					'admdiv_code':Ext.getCmp('admdivCode').getValue()
				} ]);
				grid.editingPlugin.startEdit(store.data.length - 1, 0);
			}
		},
    
		/**
		 * 删除对象操作
		 * @memberOf {TypeName} 
		 * @return {TypeName} 
		 */
		deleteReflect:function(){
			var grid = Ext.ComponentQuery.query('gridpanel')[0];
			var records = grid.getSelectionModel().getSelection();
			if(records.length==0){
				Ext.Msg.alert("系统提示", "必须选中，才能进行删除！");
				return;
			}
			var ss = [];		
			ss.push(records[0].data);
			var params = {
					status : Ext.encode(ss)
			};
			Ext.Msg.confirm("系统提示","确定要删除字段映射对象及对象的字段明细吗？请确认此操作！",function(e) {
				if (e == "yes") {
					Ext.PageUtil.doRequestAjax(null ,'/realware/deleteReflectObject.do',params);
					grid.getStore().remove(records);
					}
			});
			
		},
		/**
		 * 新增明细操作
		 */
		addReflectField:function(){
			var bool = true;
				var grid =  Ext.ComponentQuery.query("fieldwindow tabpanel")[0].getActiveTab();
				if (grid.getStore().data.length > 0) {
						var items = grid.getStore().data.items;
						for(var i = 0;i<items.length;i++){
							if (items[i].get('field_yname') == '' || items[i].get('field_yname') == undefined
									|| items[i].get('dto_name') == '' || items[i].get('dto_name') == undefined) {
								bool = false;
								continue;
							}
						}
				}
				var is_bill=0;
				if(grid.title=='主单设置'){
					is_bill = 1;
				}

				if(bool){
					var store = grid.getStore();
					store.add( [ {
						'field_id':'',
						'reflect_id' : '',
						'field_yname' : '',
						'dto_name' : '',
						'field_order': 0,
						'field_length':'',
						'field_type' :'',
						'field_zname' :'',
						'default_value':null,
						'nullable':'',
						'format_value':null,
						'is_bill':is_bill
					} ]);
					grid.editingPlugin.startEdit(store.data.length - 1, 0);
				}
			},
		/**
		 * 确定按钮，保存操作
		 * @param {Object} o
		 * @memberOf {TypeName} 
		 */
	    saveField: function(o){
			var me = this;
	    	var window = o.ownerCt.ownerCt.ownerCt;
			var reflectFieldstore = this.getStore('common.ReflectField');
	    	var reflectFieldDetailstore = this.getStore('common.ReflectFieldDetail');
	    	var grid = Ext.ComponentQuery.query('gridpanel',me.getList)[0];
			var record = grid.getSelectionModel().getSelection()[0];
			var reflect_id = record.get('reflect_id');
	    	var refelctField = [];		
	    	var refelctFieldDetail = [];
				if(reflectFieldstore.data.length>0){
					reflectFieldstore.each(function(model) {
						refelctField.push(model.data);
					});
				}
				if(reflectFieldDetailstore.data.length>0){
					reflectFieldDetailstore.each(function(model) {
						refelctFieldDetail.push(model.data);
					});
				}
				var params = {
						refelctField : JSON.stringify(refelctField),
						refelctFieldDetail : JSON.stringify(refelctFieldDetail),
						reflect_id : reflect_id
				};
				Ext.PageUtil.doRequestAjax(me,'/realware/saveReflectField.do',params);			
				window.close();
	    },
    
    
    	/**
    	 * 上移
    	 * @return {TypeName} 
    	 */
    	onStatusTop: function(){
				var grid =  Ext.ComponentQuery.query("fieldwindow tabpanel")[0].getActiveTab(); 
				var records = grid.getSelectionModel().getSelection();
				if(records.length==0){
					Ext.Msg.alert("系统提示", "请先选中行再上移！");
					return;
				}
				var index = grid.getStore().indexOf(records[0]);
				if (index > 0) {
					grid.getStore().removeAt(index);
					grid.getStore().insert(index - 1, records[0]);
					grid.getView().refresh();
					grid.getSelectionModel().select(index - 1);
				}
				
				
				
				
			},
			/**
			 * 下移事件
			 * @return {TypeName} 
			 */
		    onStatusLow: function(){
						var grid =  Ext.ComponentQuery.query("fieldwindow tabpanel")[0].getActiveTab();  
						var records = grid.getSelectionModel().getSelection();
						if(records.length==0){
							Ext.Msg.alert("系统提示", "请先选中行再下移！");
							return;
						}
						var index = grid.getStore().indexOf(records[0]);
						if (index < grid.getStore().getCount() - 1) {
							grid.getStore().removeAt(index);
							grid.getStore().insert(index + 1, records);
							grid.getView().refresh();
							grid.getSelectionModel().select(index + 1);
						}
					},
		    /**
		     * 界面渲染后处理
		     * @memberOf {TypeName} 
		     */
			onLaunch : function() {
					var me = this;			
					var acstore = this.getStore('common.FieldMap');
					acstore.on('beforeload', function(thiz, options) {				
						if (null == options.params || options.params == undefined) {
							options.params = {};
						}
						var admdiv = Ext.getCmp('admdivCode').getValue();
							options.params["admdiv_code"] = admdiv;
						});
					acstore.load();
				},		
		 
		/**
		 * 修改明细操作
		 * @return {TypeName} 
		 */
	    editReflectField: function () {
			var grid = Ext.ComponentQuery.query('gridpanel')[0];
		
			var record = grid.getSelectionModel().getSelection()[0];
			if(record==undefined||record.length==0){
				Ext.Msg.alert("系统提示", "请选中一条数据进行修改操作！");
				return;
			}
			//首次增加对象的时候点击修改明细，判断是否明细列表为空
			if(record.raw.list==undefined&& record.raw.refList==undefined){
				var win = Ext.widget("fieldwindow");
	        	win.show();
	        	return;
			}else{
				//加载主单
				Ext.StoreManager.lookup('common.ReflectField').loadData(record.raw.list);
				//加载明细
				Ext.StoreManager.lookup('common.ReflectFieldDetail').loadData(record.raw.refList);
			
				var win = Ext.widget("fieldwindow");
		        win.show();
	        }
	    },
	   /**
		 * 刷新
		 * @memberOf {TypeName} 
		 */
		refreshData : function() {
			this.getStore('common.FieldMap').loadPage(1);
		},
		closeWin : function(){
			this.getFieldWindow().close();
		}
});