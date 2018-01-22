/***
 * 处理页面初始化操作工具类
 */
/**
 * 非mvc方式初始化页面
 */
Ext.define('Ext.StatusUtil',{
	/*mixins : {
		bindable : Ext.util.Bindable
	},*/
	statics : {
		/**
		 * 获取_menu菜单对象下所有按钮（模块按钮）
		 */
		getAllButtons : function(buttons) {
			var _arr = [];
			if(!buttons || buttons.legnth < 1) {
				return _arr;
			}
			Ext.Array.each(buttons, function(b) {
				_arr.push({
					id : b.button_id,
					text : b.button_name,
					iconCls : b.icon || '',
					scale : 'small',
					height : 20,
					hidden : b.visible !== 1,
					//原始显示隐藏状态，避免区划限制影响原始配置
					ori_hidden : b.visible !== 1,
					custom : b.custom === 1,
					status_codes : b.status_codes ? 
							b.status_codes.split("#") : [],
					enable_admdivs : b.enable_admdivs ? 
							b.enable_admdivs.split("#") : [],
					disable_admdivs : b.disable_admdivs ? 
							b.disable_admdivs.split("#") : [],
					listeners : {
						click: function() {
						   //如果为自定义按钮，处理自定义按钮事件
				           if(this.custom) {
				        	   if(!((typeof Custom)=='undefined') && Ext.isFunction(Custom[this.id])) {
				        		   var fn = Custom[this.id];
				        		   //返回true，则不阻止按钮事件继续传递
				        		   return fn.call(this, Ext.ComponentQuery.query("viewport > panel:first > gridpanel")[0]);
				        	   } else {
				        		   //Ext.Msg.alert('系统提示', '未找到按钮响应函数！');
				        		   return true;
				        	   }
				           } else {
				        	   return true;
				           }
				        }
					}
				});
			});
			return _arr;
		},
		/**
		 * 根据_menu菜单对象获取所有菜单对应模块状态
		 */
		getAllStatus : function(statusList) {
			var _arr = []; 
			if(!statusList || statusList.length < 1) {
				return _arr;
			}
			Ext.Array.each(sl, function(sl) {
				_arr.push(sl);
			});
			return _arr;
		},
		/**
		 * 非mvc方式创建viewport
		 * buttonItems {id :　'按钮标识', handler : '按钮事件处理函数'}
		 * queryItems 查询区与列表区
		 * callback 回调函数
		 */
		createViewport : function(buttonItems, queryItems, callback) {
			/**
			 * 创建视图前执行函数
			 * 用以支撑个性化按钮添加、个性化功能代码逻辑添加等操作
			 */
			beforeCreateViewport();
			initialLoad = _menu.initialload === 1;
			isExistStatus = _menu.statusList && _menu.statusList.length > 0;
			var buttons = Ext.StatusUtil.getAllButtons(_menu.buttonList);
			//使用页面中buttonItems 的事件 handler 为按钮添加事件处理
			Ext.Array.each(buttons, function(btn, i) {
				var _btn = null;
				Ext.Array.each(buttonItems, function(item, j) {
					if(item.id === btn.id) {
						_btn = item;
						return false;
					}
				});
				if(_btn) {
					//浅copy
					for(var p in _btn) {
						btn[p] = _btn[p];
					}
				}
			});
			Ext.create('Ext.Viewport', {
				layout : 'fit',
				frame : false,
				items : [
				         {
				        	 xtype : 'panel',
				        	 tbar : buttons,
				        	 frame : false,
				        	 items : queryItems
				         }]
			});
			/**
			 * 创建视图后执行函数
			 * 用以支撑个性化按钮控制逻辑、个性化功能代码逻辑等操作
			 */
			afterCreateViewport();
			if(callback && Ext.isFunction(callback)) {
				callback.call();
			}
		},
		/**
		 * 初始化非mvc页面页面
		 * admdivCombo 区划对应的combo对象，存在时初始化区划切换时刷新列表
		 * taskCombo task状态对应的combo对象，保持原有的change事件处理函数调用
		 *           注意：原task combo对象须使用change事件处理状态切换
		 *               先调用原状态切换逻辑，后调用initPage中添加的切换状态逻辑
		 * paging 是否分页， 不传默认分页
		 */
		initPage : function(admdivCombo, taskCombo, switchPanel,paging) {
			if(taskCombo) {
				//初始化是否存在状态标识
				isExistStatus = true;
				//创建状态store绑定到状态combo
				var _comboStore = Ext.create('Ext.data.Store', {
					fields : ['status_code', 'status_name'],
					data : _menu.statusList
				});
				taskCombo.bindStore(_comboStore);
				taskCombo.addListener("change", function(combo, newValue, oldValue, eOpts) {
					var panel = Ext.ComponentQuery.query('viewport > panel')[0];
					/**
					 * 根据状态值设置自定义按钮
					 */
					var _code = combo.valueModels[0].raw.status_code;
					var _comboStore = combo.getStore();
					Ext.Array.each(Ext.ComponentQuery.query("button[custom=true]", panel), function(btn, i) {
						if(btn.status_codes && !Ext.isEmpty(btn.status_codes)) {
							if(Ext.Array.contains(btn.status_codes, _code)) {
								btn.enable();
							} else {
								btn.disable();
							}
						}
					});
					/**
					 * 根据新的状态初始化列表
					 */
					var grid = null;
					if(switchPanel) {
						grid = Ext.PageUtil.selectGridPanel(_comboStore.findRecord("status_code", newValue), 
								_comboStore.findRecord("status_code", oldValue), panel, false, true, paging);
					} else {
						grid = Ext.ComponentQuery.query("viewport > panel:first > gridpanel")[0];
					}
					/**
					 * 数据刷新
					 */
					if(grid && initialLoad) {
						grid.getStore().loadPage(1);
					}
				});
			} else {
				isExistStatus = false;
			}
			if(admdivCombo) {
				admdivCombo.on("change", function(combo, newValue, oldValue, eOpts) {
					//页面初始加载时,oldValue为空，不触发数据重新加载
					//行政区划切换时，触发数据重新加载
					if(oldValue) {
						var grid = Ext.ComponentQuery.query("viewport > panel:first > gridpanel")[0];
						if(grid) {
							var _store = grid.getStore();
							_store.removeAll();
							_store.loadPage(1);
						}
					}
					admdivCombo.fireEvent('admdivchange', admdivCombo, newValue, oldValue);
				});
				admdivCombo.on("admdivchange", function(combo, newValue, oldValue, eOpts) {
					//切换区划时，启用允许启用的按钮，禁用需要禁用的按钮
					var panel = Ext.ComponentQuery.query('viewport > panel')[0];
					Ext.Array.each(Ext.ComponentQuery.query("button[status_codes][ori_hidden=false]", panel), function(btn, i) {
						var hasFlag = true;
						if(Ext.Array.contains(btn.enable_admdivs, newValue)) {
							btn.setVisible(true);
							hasFlag = false;
						}
						if(Ext.Array.contains(btn.disable_admdivs, newValue)) {
							btn.setVisible(false);
							hasFlag = false;
						}
						if(hasFlag && btn.isHidden()) {
							btn.setVisible(true);
						}
					});
				});
				if(admdivCombo.store.getCount() > 0) {
					var record = admdivCombo.store.getAt(0);
					admdivCombo.setValue(record.raw.admdiv_code);
				}
			}
		},
		/**
		 * 批量设置按钮enable
		 */
		batchEnable : function(ids) {
			if(Ext.isEmpty(ids)) {
				return ;
			}
			Ext.Array.each(ids.split(","), function(item, i) {
				var btn = Ext.getCmp(item);
				if(btn) {
					btn.enable();
				}
			});
		},
		/**
		 * 批量设置按钮disable
		 */
		batchDisable : function(ids) {
			if(Ext.isEmpty(ids)) {
				return ;
			}
			Ext.Array.each(ids.split(","), function(item, i) {
				var btn = Ext.getCmp(item);
				if(btn) {
					btn.disable();
				}
			});
		}
	}
});
/***
 * 自定义分页栏（带page list）
 * @author lfj 
 */
Ext.define('Ext.PageListToolbar',{
	extend : 'Ext.toolbar.Paging',
	alias : 'widget.PageListToolbar',
	getPagingItems : function() {
		var pagingItems = this.callParent(arguments);
		this.pageSize = this.pageSize || 25;
		this.pageList = this.pageList || [25, 50, 100];
		if(!Ext.Array.contains(this.pageList, this.pageSize)) {
			this.pageList.push(this.pageSize);
			this.pageList = Ext.Array.sort(this.pageList, function(a, b){
				return a - b;
			});
		}
		var pageListData = Ext.Array.map(this.pageList, function(item, index) {
			return ["" + item, item];
		});
		var me = this;
		var item = {
			xtype : 'combo',
			mode: 'local',
			frame : false,
	        displayField: 'text',  
	        valueField: 'value',  
	        editable: false,  
	        allowBlank: false,  
	        triggerAction: 'all',  
	        width: 50,
	        value : this.pageSize,
	        store : new Ext.data.SimpleStore({  
	            fields: ['text', 'value'],  
	            data:   pageListData
	        }),
	        listeners: {
	            change: function(thiz, newValue, oldValue, eOpts) {
	            	var _store = me.store;
	            	if(_store) {
	            		_store.pageSize = newValue;
	            		_store.loadPage(1);
	            	}
	            }
	        }
		};
		//设置store默认pageSize值
		this.getStore().pageSize = this.pageSize;
		return [item].concat(pagingItems);
	}
});
/**
 * 创建viewport前函数
 * 自定义时可覆盖该函数
 * 空函数
 * @author lfj 
 */
function beforeCreateViewport() {
//	console.log("创建Viewport前操作");
}
/**
 * 创建viewport执行完成后函数
 * 自定义时可覆盖该函数
 * 空函数
 * @author lfj 
 */
function afterCreateViewport() {
//	console.log("创建Viewport后操作");
}
/**
 * store 异常处理函数
 */
function storeExceptionHandler(reader, response, error, eOpts) {
	var b = true;
	if (response.status != 500 && error.error != undefined) {
		if (error.error.indexOf!=undefined && error.error.indexOf("parent.window.location.href") != -1) {
				Ext.Msg.alert('系统提示', 'session失效 请重新登陆！');
				parent.window.location.href = "/realware/login.do";
				b = false;
		}
	}
	if (response.responseText != "" && b) {
		Ext.Msg.show({
			title : '错误提示',
			msg : response.responseText,
			buttons : Ext.Msg.OK,
			icon : Ext.MessageBox.ERROR
		});
	}
}