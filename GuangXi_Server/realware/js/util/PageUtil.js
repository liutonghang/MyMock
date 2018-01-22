/***
 * 业务界面工具类
 */
Ext.define('Ext.PageUtil',{
					//静态方法: 调用说明 Ext.PageUtil.onInitPage(参数1,参数2....)
					statics : {
						prefix : "g",
						/***
						 * 根据状态集合条件多个列表视图
						 * @param {Object} o       控制层对象
						 * @param {Object} panel   原面板控件
						 * @param {Object} statusList 当前菜单对应的状态
						 * @param {Object} store 数据集
						 */
						onInitPage : function(panel, statusList, store) {
							//清除原有控件对应的gridpanel
							//panel.removeAll();
							//将数据源对象保存在window对象中，即全局变量
							window["_store"] = store;
							return false;
						},
						/**
						 * 初始化grid
						 * panel grid将要添加的面板对象
						 * m 状态下对应的ui配置信息
						 * store 数据源
						 */
						initGrid : function(panel, m, store, single, editable,paging) {
							//列表视图标题
							var ui_name = m.ui != null ? m.ui.view_name : panel.UItitle;
							//每页显示数
							var pageSize = (m.ui!=null) ? m.ui.pagesize:100;
							var _store = store;
							//如果数据源为string，查找数据源，不重新创建store，
							//避免grid与pagetoolbar存在重复绑定的现象
							if(Ext.isString(store)) {
								_store = Ext.data.StoreManager.lookup(store);
							}
							//重置store的数据，因其他列表可能会使用相同的store
							_store.loadData([]);
							var plugins = [];
							if(editable) {
								plugins.push(Ext.create('Ext.grid.plugin.CellEditing', {  //单元格编辑
     								clicksToEdit: 2
 								}));
							}
							var opts = {
									id : Ext.PageUtil.prefix + m.status_code, //主键
									title : ui_name, //标题
									frame : false,
									height : panel.getHeight(),
									width : panel.getWidth(),
									ignoreAddLockedColumn : true,
									stripeRows : false, 
									viewConfig : {
										shrinkWrap : 0,
										/**
										 * hasLoadingHeight设置为true会在chrome下造成多次刷新时列错位现象
										 * 判断浏览器类型，设置hasLoadingHeight属性
										 */
										hasLoadingHeight : Ext.isIE
									},
									lockedViewConfig : {
										frame : false,
										shrinkWrap : 0,
										hasLoadingHeight : true
									},
									columns : Ext.PageUtil.getColumns(panel,m.ui), //列
									store : _store, //数据集
									selModel: Ext.create('Ext.selection.CheckboxModel',{  //多选
										checkOnly : true,
										allowDeselect : true,
										mode : single === true ? 'SINGLE' : 'MULTI'
									}),
									features: [{
	            						ftype: 'summary'  //合计
	        						}],
	        						plugins: plugins
								};
							//是否分页,默认有分页
							if(paging==undefined || paging!=false){
								opts.bbar = Ext.PageUtil.pagingTool(_store, pageSize); //分页
								opts.pageSize = pageSize; //每页显示数
							}
							var gridpanel = new Ext.grid.Panel(opts);
							var contextmenu = new Ext.menu.Menu( {
								items : [ {
									text : '卡片展示数据窗口'
								},{
									text : '查看明细列表窗口'
								} ]
							});
							
							gridpanel.on("itemcontextmenu", function(view,record, item, index, e) {
								 //禁用浏览器的右键相应事件 
								e.preventDefault();
								contextmenu.showAt(e.getXY());
								var item_ = contextmenu.items.items;
								for ( var i = 0; i < item_.length; i++) {
									item_[i].handler = function() {
										//触发事件
										panel.fireEvent('gridpanel_rightmenu',gridpanel,record,this);
									};
								}
							});  
							panel.add(gridpanel);
							return gridpanel;
						},
						

						/***
						 * 主单+明细
						 * 根据状态集合条件多个列表视图
						 * @param {Object} o       控制层对象
						 * @param {Object} panel   原面板控件
						 * @param {Object} statusList 当前菜单对应的状态
						 * @param {Object} store 数据集
						 * @param {Object} detailStore 右侧详细列表数据集对象
						 */
						onInitBatchPage : function(o, panel, statusList, store,detailStore) {
							this.onInitBatchPage(o, panel, statusList, store,detailStore, null);
						},
						/***
						 * 根据状态集合条件多个列表视图
						 * @param {Object} o       控制层对象
						 * @param {Object} panel   原面板控件
						 * @param {Object} statusList 当前菜单对应的状态
						 * @param {Object} store 数据集
						 * @param {Object} detailStore 右侧详细列表数据集对象
						 * @param {function} callback 触发行点击事件后执行此方法 @default null
						 */
						onInitBatchPage : function(o, panel, statusList, store,detailStore, callback) {
							panel.removeAll();
							var pageBool = true;
							Ext.Array.each(statusList, function(m) {
								//列表视图标题
								var ui_name = m.ui!=null?m.ui.view_name:panel.UItitle;
								var newStore = (m.ui != null) ? (Ext.isEmpty(m.ui.store_name) ? store : m.ui.store_name) : store;
								//每页显示数
								var pageSize = 25;//(m.ui!=null)?m.ui.pagesize
								var gridpanel = new Ext.grid.Panel( {
									id : m.status_id, //主键
									title : ui_name, //标题
									stripeRows:true, 
									bbar : Ext.PageUtil.pagingTool(newStore), //分页
									columns : Ext.PageUtil.getColumns(o,panel,m.ui), //列
									selModel : Ext.create('Ext.selection.CheckboxModel',{  //多选
										checkOnly :false
									}),  
									store : newStore, //数据集
									pageSize : pageSize, //每页显示数//注意，该属性只是临时变量，并非分页的属性
									features: [{
                						ftype: 'summary'  //合计
            						}],
            						plugins: [
       	 								Ext.create('Ext.grid.plugin.CellEditing', {  //单元格编辑
            								clicksToEdit: 1
        								})
    								],
    								listeners : {
										  itemclick : function(view, record, item, index, e, eOpts) {
												detailStore.load();
												if(callback != null){
													callback(o, record.raw);
												}
											}
    								}
								});
								
								//默认设置第一个状态的每页显示数配置
								if(pageBool){
									gridpanel.getStore().pageSize = pageSize;
									pageBool = false;
								}
								panel.add(gridpanel);
							});
						},
						/***
						 * 根据状态集合构造多个列表视图
						 * @param {Object} o       控制层对象
						 * @param {Object} panel   原面板控件
						 * @param {Object} statusList 当前菜单对应的状态
						 * @param {Object} store 数据集
						 */
						onInitComplexPage : function(o, panel, statusList,store) {
							panel.removeAll();
							var pageBool = true;
							Ext.Array.each(statusList, function(m) {
								//列表视图标题
								var ui_name = m.ui!=null?m.ui.view_name:panel.UItitle;
								//每页显示数
								var pageSize = 25;
								//所用的store
								var newStore = (m.ui != null) ? (Ext.isEmpty(m.ui.store_name) ? store : m.ui.store_name) : store;
								var gridpanel = new Ext.grid.Panel( {
									id : m.status_id, //主键
									title : ui_name, //标题
									stripeRows:true, 
									bbar : Ext.PageUtil.pagingToolForSH(newStore), //分页
									columns : Ext.PageUtil.getColumns(o,panel,m.ui), //列
									selModel : Ext.create('Ext.selection.CheckboxModel',{  //多选
										checkOnly :true 
									}),  
									store : newStore, //数据集
									pageSize : pageSize, //每页显示数
									features: [{
                						ftype: 'summary'  //合计
            						}],
            						plugins: [
       	 								Ext.create('Ext.grid.plugin.CellEditing', {  //单元格编辑
            								clicksToEdit: 1
        								})
    								]
								});
								//默认设置第一个状态的每页显示数配置
								if(pageBool){
									gridpanel.getStore().pageSize = pageSize;
									pageBool = false;
								}
								panel.add(gridpanel);
							});
						},
						/***
						 * 初始化列表视图
						 * @param {Object} o  控制层对象
						 * @param {Object} panel 原面板控件
						 * @param {Object} store 数据集
						 * @memberOf {TypeName} 
						 */
						onInitList : function(panel, store) {
							//清除原有控件对应的gridpanel
							panel.removeAll();
							var me = this;
							var _store = store;
							if(Ext.isString(store)) {
								_store = Ext.data.StoreManager.lookup(store);
							}
							var gridpanel = new Ext.grid.Panel( {
								title : panel.UItitle,
								frame : false,
								bbar : me.pagingTool(_store, 100),
								columns : me.getColumns(panel, null),
								selModel : Ext.create('Ext.selection.CheckboxModel',{  //多选
									checkOnly :true 
								}), 
								store : _store,
								features : [ {
									ftype : 'summary' //合计
								} ],
								plugins : [ Ext.create(
										'Ext.grid.plugin.CellEditing', { //单元格编辑
											clicksToEdit : 1
										}) ],
								height : panel.getHeight(),
								width : panel.getWidth(),
								ignoreAddLockedColumn : true,
								stripeRows : false, 
								viewConfig : {
									shrinkWrap : 0,
									hasLoadingHeight : true
								}
							});
							panel.add(gridpanel);
							return gridpanel;
						},
						/***
						 * 列表视图加载前事件,主要作用:拼装后台需要的信息
						 * @param {Object} conditions  当前状态的条件
						 * @param {Object} queryView   查询区
						 * @param {Object} models   对象字段集合
						 * @param {Object} options  事件参数:传参
						 */
						onBeforeLoad : function(conditions, queryView, models,options) {
							var me = this;
							var data = [];
							//2、拼装查询区的条件
							if(!Ext.isEmpty(queryView)){
								for ( var i = 0; i < queryView.items.length; i++) {
									var item = queryView.items.getAt(i);
									//当前控件的值为空且dataIndex未定义且没有子项直接返回
									if (Ext.isEmpty(item.value) || Ext.isEmpty(item.dataIndex)) {
										if (Ext.isEmpty(item.items)) {
											continue;
										} else {
											for ( var j = 0; j < item.items.length; j++) {
												var it = item.items.getAt(j);
												if (Ext.isEmpty(it.value)
														|| Ext.isEmpty(it.dataIndex)) {
													continue;
												} else {
													data.push(me.getCondition(it));
												}
											}
										}
									}else{
										data.push(me.getCondition(item));
									}
								}
							}
							
							if (null == options.params || options.params == undefined) {
								options.params = {};
							}
							//3、赋值参数
							options.params["conditionObj"] = Ext.encode(data);
							
							if(models !=undefined){
								//4、数据项设置
								var filedNames = [];
								Ext.Array.each(models.getFields(), function(field) {
									filedNames.push(field.name);
								});
								options.params["filedNames"] = Ext.encode(filedNames);
							}
							var curUrl = window.location.href;
							var index = curUrl.indexOf("&id=") +4;
							var lastIndex = curUrl.indexOf("&", index);
							if(lastIndex == -1) {
								lastIndex = curUrl.length;
							}
							var id = curUrl.substring(index, lastIndex);
							options.params["menu_id"] = id; 
						},
						/***
						 * 根据项获取过滤条件对象
						 * @param {Object} item
						 * @memberOf {TypeName} 
						 * @return {TypeName} 
						 */
						getCondition : function(item) {
							var me = this;
							var v = item.value;
							//操作符 and 或 or
							var oper = item.operation || 'and';
							//逻辑符 =或<>或>或<或<=...
							var symbol = item.symbol || '=';
							//值类型 0:String, 1:number,2:date
							var valueType = item.datatype == undefined ? 0 : item.datatype;
							if (item.xtype == 'datefield' || valueType == 2) {
								v = me.Todate(v, item.format);
							}/* else if (valueType == 0) {
								v = encodeURI(encodeURI(v));
							}*/
							//前台不再传入自定义查询条件，只传入自定义查询条件内容   lfj  2015-01-30
							var model = {
								operation : oper,
								attr_code : item.dataIndex,
								relation : symbol,
								value : v,
								datatype : valueType,
								format: item.date_format
							};
							return model;
						},
						/***
						 * 日期转换
						 * @param {Object} value  原值
						 * @param {Object} format  转换格式
						 * @return {TypeName} 
						 */
						Todate : function(value, format) {
							value = value + "";
							var date = "";
							var month = new Array();
							month["Jan"] = '01';
							month["Feb"] = '02';
							month["Mar"] = '03';
							month["Apr"] = '04';
							month["May"] = '05';
							month["Jun"] = '06';
							month["Jul"] = '07';
							month["Aug"] = '08';
							month["Sep"] = '09';
							month["Oct"] = '10';
							month["Nov"] = '11';
							month["Dec"] = '12';
							var week = new Array();
							week["Mon"] = "一";
							week["Tue"] = "二";
							week["Wed"] = "三";
							week["Thu"] = "四";
							week["Fri"] = "五";
							week["Sat"] = "六";
							week["Sun"] = "日";
							str = value.split(" ");
//							date = str[3] + "";
							if(Ext.isIE6 || Ext.isIE7 || Ext.isIE8 || Ext.isIE9){
								date = str[5] + "";
							}
							else {
								date = str[3] + "";
							} 
							var day = str[2].length == 1 ? "0" + str[2]
									: str[2];
							if (format == 'Ymd') {
								date = date + month[str[1]] + day;
							} else if (format == 'Y-m-d') {
								date = date + "-" + month[str[1]] + "-" + day;
//										+ " 00:00:00";
								
							}
							return date;
						},
						/***
						 * Ajax请求操作成功后函数
						 * @param {Object} response  
						 * @param {Object} myMask   
						 * @param {Object} gridpanel 当前需刷新的列表
						 * @param {Object} message  指定显示消息
						 */
						succAjax : function(response, myMask, gridpanel,message) {
							if (!Ext.isEmpty(myMask)) {
								myMask.hide();
							}
							var msg = response.responseText;
							if (!Ext.isEmpty(message)) {
								msg = message;
							}
							//session失效
							if (msg.indexOf("parent.window.location.href = 'login.do';") != -1) {
								Ext.Msg.alert('系统提示', 'session失效 请重新登陆！');
								parent.window.location.href = 'login.do';
							} else {
								Ext.Msg.show( {
									title : '成功提示',
									msg : msg,
									buttons : Ext.Msg.OK,
									icon : Ext.MessageBox.INFO
								});
								if (!Ext.isEmpty(gridpanel)) {
									if(gridpanel.grid==undefined){
										gridpanel.refreshData();
									}else{
										gridpanel.grid.store.reload();
									}
								}
							}
						},
						/***
						 * Ajax请求操作失败后函数
						 * @param {Object} response
						 * @param {Object} myMask
						 */
						failAjax : function(response, myMask,gridpanel) {
							if (!Ext.isEmpty(myMask)) {
								myMask.hide();
							}
							if (response.status == -1) {
								Ext.Msg.alert("系统提示",
								"服务器响应超时，可能存在网络异常，检查后请重试...");
							} else {
								Ext.Msg.show( {
									title : '失败提示',
									msg : response.responseText,
									buttons : Ext.Msg.OK,
									icon : Ext.MessageBox.ERROR
								});
								if (!Ext.isEmpty(gridpanel)) {
									if(gridpanel.grid==undefined){
										gridpanel.refreshData();
									}else{
										gridpanel.grid.store.reload();
									}
								}
							}
						},
						/***
						 * 表单提交成功返回
						 * @param {} form
						 * @param {} action
						 */
						succForm : function(form, action) {
							if (action.result.mess.indexOf("parent.window.location.href = 'login.do';") != -1) {
								Ext.Msg.alert('系统提示', 'session失效 请重新登陆！');
								parent.window.location.href = 'login.do';
							} else {
								Ext.Msg.show( {
									title : '成功提示',
									msg : action.result.mess,
									buttons : Ext.Msg.OK,
									icon : Ext.MessageBox.INFO
								});
								form.reset();
							}
						},
						/***
						 * 表单提交失败返回
						 * @param {} form
						 * @param {} action
						 */
						failForm : function(form, action) {
							
							var result = Ext.JSON.decode(action.response.responseText);
							
							var msg = Ext.isEmpty(action.result) ? result.mess : action.result.mess ;
							
							Ext.Msg.show( {
								title : '失败提示',
								msg : msg,
								buttons : Ext.Msg.OK,
								icon : Ext.MessageBox.ERROR
							});
						},
						/***
						 * 返回分页下方显示的工具条
						 * @param {} store
						 * @return {}
						 */ 
						pagingTool : function (store, pageSize) {
							var pagetool = Ext.create("Ext.PageListToolbar", {
								store : store,
								frame : false,
								resizable : false,
								shrinkWrap : 1,
								pageSize : pageSize || 25,
								displayInfo : true,
								displayMsg : '显示第{0}条到{1}条记录 ，一共{2}条',
								emptyMsg : "没有记录",
								dock : 'bottom', 
								pageList : [25, 50, 100]
							});
							pagetool.child('#refresh').hide(true);
							return pagetool;
						},
						/**
						 * 返回工具条，先这样写上
						 * @param {} store
						 * 合并上海代码添加
						 */
						pagingToolForSH : function (store) {
							var pagetool = new Ext.PagingToolbar({
										store : store,
										displayInfo : true,
										displayMsg : '显示第{0}条到{1}条记录 ，一共{2}条',
										emptyMsg : "没有记录",
										dock : 'bottom'
									});
							pagetool.child('#refresh').hide(true);
							return pagetool;
						},

						/***
						 * 预至视图模板
						 * @param {Object} grid 列表视图
						 * @param {Object} xtype_ 类型
						 */
						onAddColumns : function(grid, xtype_) {
							var columns = [];
							var dataindex;
							for ( var i = 0; i < grid.columns.length; i++) {
								var col = grid.columns[i];
								var xtype = 0;
								var id;
								if (col.xtype == undefined
										&& col.field == 'textfield') {
									xtype = 3;
								} else if (col.xtype == 'rownumberer') {
									continue;
								} else if (col.xtype == 'actioncolumn') {
									xtype = 1;
								} else if (col.xtype == 'numbercolumn') {
									xtype = 2;
								}
								var dataindex_ = col.dataIndex;
								if (dataindex_ != undefined) {
									id = 'col_' + dataindex_;
								} else {
									id = col.id;
								}
								var hidden_ = col.hidden == undefined ? 1 : col.hidden == true ? 0 : 1;
								var locked_ = col.locked == undefined ? 0 : col.locked == true ? 1 : 0;
								var format_ = col.format;
								var align_ = col.align == undefined ? 'center' : col.align;
								var width_ = col.width == undefined ? 130 : col.width;
								columns.push( {
									ui_id : id,
									ui_name : col.text,
									ui_xtype : xtype,
									ui_order : i,
									is_visble : hidden_,
									dataindex : dataindex_,
									locked : locked_,
									format : format_,
									align : align_,
									ui_width : width_,
									is_null : col.allowBlank == false ? 0 : col.allowBlank==true?1:-1
								});
							}
							var myMask = new Ext.LoadMask(Ext.getBody(), {
								msg : '后台正在处理中，请稍后....',
								removeMask : true
							});
							myMask.show();
							Ext.Ajax.request( {
								url : '/realware/saveView.do',
								method : 'POST',
								params : {
									columns : Ext.encode(columns),
									control_name : xtype_,
									view_name : grid.title
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
								},
								failure : function(response, options) {
									myMask.hide();
									Ext.Msg.show( {
										msg : response.responseText,
										buttons : Ext.Msg.OK,
										icon : Ext.MessageBox.ERROR
									});
								}
							});
						},
						/***
						 * 列
						 * @param {Object} o   控制层对象
						 * @param {Object} t   指定的panel，主要作用：获取当前定义的列集合
						 * @param {Object} newUI  后台的列对象
						 * @return {TypeName} 
						 */
						getColumns : function(t, newUI) {
							var gridColumns = null;
							if (newUI == null) {
								gridColumns = t.getCols();
							} else {
								gridColumns = [];
								gridColumns.push( {
									xtype : 'rownumberer',
									width : 30,
									locked : true,
									shrinkWrap : 0
								});
								Ext.Array.each(newUI.details,function(u) {
										var col = {
											id :  u.ui_id,
											text :  u.ui_name,
											align : u.align,
											width : u.ui_width,
											shrinkWrap : 1,
											hidden : (u.is_visble == 1 ? false : true),
											locked : (u.locked == 0 ? false : true)
										};
										if(u.ui_xtype == 1){
											col.xtype = 'actioncolumn';
											col.items= [{
													iconCls : 'addbankno',
													tooltip: u.ui_name,
													handler: function (grid, rowIndex, colIndex, node, e, record, rowEl) {							
														t.fireEvent(u.action_name,grid, rowIndex, colIndex, node, e, record, rowEl);
													}
											}];
											t.addEvents(u.action_name);
										} else if (u.ui_xtype == 2) {
											col.xtype = 'numbercolumn';
											if (newUI.is_subtotal == 1) {
												col.summaryType = 'sum';
												col.summaryRenderer= function(value, summaryData, dataIndex) {
													return value=='0.00'?'': '小计:' + Ext.util.Format.number(value,'0,0.00');
												}
											}
										} else if (u.ui_xtype == 3) {
											col.field = {
												xtype : 'textfield',
												allowBlank : (u.is_null == 0 ? true : false)
											};
											//编辑列校验
											if(!Ext.isEmpty(u.regex)){
												col.field.regex=eval(u.regex);
											}
											//编辑列校验提示
											if(!Ext.isEmpty(u.regextext)){
												col.field.regexText = u.regextext;
											}
										//组合框
										} else if (u.ui_xtype == 4) {
											col.field = {
													xtype :'combo',
													store : Ext.data.StoreManager.lookup(u.store_name),
													displayField : 'name',
													valueField : 'value',
													editable : false
												};
												col.renderer = function(value,col) {
													var store = col.column.field.store;
													if(store) {
														var record = store.findRecord('value',value);
														if(record) {
															return record.get('name');
														}
													}
													return value;
												};
										} else if (u.ui_xtype == 5) {
											col.xtype = 'datecolumn';
										} else {
											col.xtype = 'gridcolumn';
										}
										if(!Ext.isEmpty(u.dataindex)){
											col.dataIndex = u.dataindex;
										}
										if(!Ext.isEmpty(u.format)){
											col.format = u.format;
										}
										gridColumns.push(col);
								});
							}
							return gridColumns;
						},
						/***
						 * 根据不同的状态选择不同的gridpanel
						 * @param {Object} status 当前状态
						 * @param {Object} lastStatus 上一个状态
						 * @param {Object} listView gridpanel 上级面板
						 * @param {Object} paging  是否分页 不传默认分页
						 */
						selectGridPanel : function(status, lastStatus, listView, single, editable, paging) {
							var hasRendered = false;
							listView.removeAll();
							if(!hasRendered) {
								return Ext.PageUtil.initGrid(listView, status.raw, window["_store"], single, editable,paging);
							}
						},
						/***
						 * 列表的选中校验
						 * @param {Object} grid
						 * @param {Object} count
						 * @return {TypeName} 
						 */
						validSelect : function(grid, count) {
							var records = grid.getSelectionModel().getSelection();
							if (records.length == 0) {
								Ext.Msg.alert('系统提示', '请至少选择一条数据！');
								return null;
							} else if (count != undefined && count == 1 && records.length > 1) {
								Ext.Msg.alert('系统提示', '只能选中一条数据！');
								return null;
							}
							return records;
						},
						/**
						 * 获得menuid
						 */
						getMenuId : function(){
							var curUrl = document.URL;
							var index = curUrl.indexOf("&id=") +4; 
							var lastIndex = curUrl.indexOf("&", index);
							if(lastIndex == -1) {
								lastIndex = curUrl.length;
							}
							var id = curUrl.substring(index, lastIndex); 
							return id;
						},
						/***
					 	 * 访问后台
					 	 * @param {Object} thiz  控制层
					 	 * @param {Object} url   路径
					 	 * @param {Object} params  参数
					 	 * @param {Object} method  提交方式
					 	 * @param {Object} window  待关闭的窗口
					 	 */
						doRequestAjax : function(thiz, url, params,method,window) {
							var curUrl = document.URL;
							var index = curUrl.indexOf("&id=") +4;
							var lastIndex = curUrl.indexOf("&", index);
							if(lastIndex == -1) {
								lastIndex = curUrl.length;
							}
							var id = curUrl.substring(index, lastIndex); 
							if(params != null){
								params["menu_id"] = id;
							}

							var me = this;
							var myMask = new Ext.LoadMask(Ext.getBody(), {
								msg : '后台正在处理中，请稍后....',
								removeMask : true
							});
							myMask.show();
							if(method==undefined){
								method = 'POST';
							}
							Ext.Ajax.request( {
								url : url,
								method : method,
								timeout : 240000, // 设置为4分钟
								params : params,
								success : function(response, options) {
									me.succAjax(response, myMask, thiz);
									if(!Ext.isEmpty(window)){
										window.close();
									}
								},
								failure : function(response, options) {
									me.failAjax(response, myMask, thiz);
								}
							});
						}
					}
				});