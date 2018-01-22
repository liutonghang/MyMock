/*******************************************************************************
 * 基础要素维护
 */

/***
 * 引入需要使用的js文件
 */
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/recommend.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/exportFile.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/importEleValue.js"></scr' + 'ipt>');

var eleValueFileds = [ "id", "code", "name", "start_date", "end_date",
		"is_deleted", "parent_id" ];

var eleValueHeader = "编码|code|220,名称|name|220,启用日期|start_date|220,停用日期|end_date|220";

/*******************************************************************************
 * 加载界面
 */
Ext.require( [ 'Ext.data.*', 'Ext.grid.*', 'Ext.tree.*' ]);
Ext.onReady(function() {
	Ext.QuickTips.init();
	//定义左侧要素树
		var leftEle = Ext.create('Ext.tree.Panel', {
			id : 'leftEle',
			store : Ext.create('Ext.data.TreeStore', {
				root : {
					id : '0',
					nodeType : 'async'
				},
				proxy : {
					type : 'ajax',
					url : '/realware/initEle.do'
				},
				autoLoad : true
			}),
			hideHeaders : true,
			rootVisible : false,
			region : 'west',
			title : '要素列表',
			split : true,
			collapsible : true,
			collapsed : false,
			width : 200,
			viewConfig : {
				plugins : {
					ptype : 'treeviewdragdrop'
				}
			},
			border : 0,
			height : 500
		});
		//定义右侧数据集
		var storeEle = Ext.create('Ext.data.TreeStore', {
			fields : eleValueFileds,
			proxy : {
				actionMethods : {
					read : 'POST'
				},
				type : 'ajax',
				url : loadEleValueUrl,
				reader : 'json'
			},
			autoLoad : false,
			listeners : {
				beforeload : function( store, operation, eOpts){
					operation.params["admdivCode"] = Ext.getCmp('admdiv').getValue();
				},
				load : function(t, node, records, successful, eOpts) {
					if (!successful) {
						var records = leftEle.getSelectionModel().getSelection();
						if (records.length == 0) {
							return;
						}
						Ext.Msg.show( {
							title : '错误提示',
							msg : records[0].raw.description + '检索要素值信息失败',
							buttons : Ext.Msg.OK,
							icon : Ext.MessageBox.ERROR
						});
					}else{
						if(node.isRoot()&&!node.isExpanded())node.expand();
					}
				}
			}
		});
		// 点击左测要素事件
		leftEle.on("itemclick", function(view, record, item, index, e) {
			if (record.data.leaf == false)
				return;
			storeEle.load();
			Ext.getCmp('input').setDisabled(false);
			Ext.getCmp('delete').setDisabled(false);
			Ext.getCmp('add').setDisabled(false);
			Ext.getCmp('edit').setDisabled(false);
		});
		//右侧数据前事件
		storeEle.on('beforeload', function(thiz, options) {
			var records = leftEle.getSelectionModel().getSelection();
			var admdiv = Ext.getCmp('admdiv').getValue();
			if (records.length == 0 || admdiv=="") {
				return false;
			}
			if (null == options.params || options.params == undefined) {
				options.params = [];
			}
			options.params["filedNames"] = JSON.stringify(eleValueFileds);
			options.params["eleName"] = records[0].raw.description;
			options.params["admdivCode"] = admdiv;
		});

		//界面布局
		Ext.create('Ext.Viewport',{
							id : 'eleFrame',
							layout : 'border',
							items : [
									leftEle,
									{
										region : 'center',
										frame : true,
										layout : 'fit',
										tbar : [ {
											xtype : 'buttongroup',
											items : [
													{
														id : 'add',
														text : '新增',
														iconCls : 'add',
														scale : 'small',
														disabled : true,
														handler : function() {
															addEleValue(leftEle.getSelectionModel().getSelection());
														}
													},
													{
														id : 'edit',
														text : '修改',
														iconCls : 'edit',
														scale : 'small',
														disabled : true,
														handler : function() {
															editEleValue();
														}
													},
													{
														id : 'input',
														text : '导入',
														iconCls : 'input',
														scale : 'small',
														disabled : true,
														handler : function() {
															importFile(inputUrl,"xls",Ext.getCmp('admdiv').getValue());
														}
													},  
													{
														id : 'delete',
														text : '删除',
														iconCls : 'delete',
														scale : 'small',
														disabled : true,
														handler : function() {
															deleteEleValue();
														}
													//}, {
													//		id : 'import',
													//		text : '导出',
													//		iconCls : 'import',
													//		scale : 'small',
													//		handler : function() {
													//			exportFile(exportUrl, "xls", eleValueHeader, Ext.getCmp('treepanel'));
													//		}
													} ]
										} ],
										items : [ {
											id : 'treepanel',
											xtype : 'treepanel',
											title : '要素值列表',
											width : 500,
											height : 300,
											renderTo : Ext.getBody(),
											collapsible : true,
											rootVisible : false,
											store : storeEle,
											fields : eleValueFileds,
											listeners : {
												'containerclick' : function() {
													var record = Ext.getCmp('treepanel').getSelectionModel().getLastSelected();
													Ext.getCmp('treepanel').getSelectionModel().deselect(record);
												}
											},
											columns : [{
												xtype : 'treecolumn',
												text : '编码',
												flex : 2,
												sortable : true,
												dataIndex : 'code',
												width : 270
											}, {
												text : '名称',
												sortable : true,
												dataIndex : 'name',
												width : 270
											}, {
												text : '启用日期',
												sortable : true,
												dataIndex : 'start_date',
												renderer:function(tm){
												     return tm.substring(0,10);
												},

												width : 230
											}, {
												text : '停用日期',
												sortable : true,
												dataIndex : 'end_date',
												renderer:function(tm){
												     return tm.substring(0,10);
												},
												width : 230
											} ],
											tbar : {
												id : 'eleValueQuery',
												xtype : 'toolbar',
												bodyPadding : 8,
												layout : 'hbox',
												defaults : {
													margins : '3 5 0 0'
												},
												items : [ {
													id : 'admdiv',
													fieldLabel : '所属财政',
													xtype : 'combo',
													dataIndex : 'admdiv_code',
													displayField : 'admdiv_name',
													emptyText : '请选择',
													valueField : 'admdiv_code',
													labelWidth : 60,
													store : comboAdmdiv,
													value : comboAdmdiv.data.length > 0 ? comboAdmdiv.data
															.getAt(0)
															.get("admdiv_code")
															: "",
													listeners : {
														'select' : refreshData
													}
												} ]
											}
										} ]
									} ]
						});
	});

/***
 * 新增
 */
function addEleValue(records)
{
	var parentId=0;
//	var records = leftEle.getSelectionModel().getSelection();
	var records_right = Ext.getCmp('treepanel').getSelectionModel().getSelection();
	if(records_right.length!=0)
	{
		parentId=records_right[0].get("id");
	}
	var admivcode=Ext.getCmp('admdiv').getValue();
//	alert(records_right[0].get("id"));
	Ext.widget('window',{
		id : 'addWin',
		title : '新增基础要素信息',
		width : 350,
		height : 200,
		layout : 'fit',
		resizable : false,
		modal : true,
		items : [ new Ext.FormPanel({
			id : 'addForm',
			labelWidth : 75,
			frame : true,
			bodyStyle : 'padding:5px 5px 0',
			width : 350,
			defaults : {
				width : 300
			},
			items : [ {
				id : 'code',
				name : 'code',
				fieldLabel : '编码',
				xtype : 'textfield',
				allowBlank : false
			},{
				id : 'name',
				name : 'name',
				fieldLabel : '名称',
				xtype : 'textfield',
				allowBlank : false
			},{				
				id : 'start_date',
				name : 'start_date',
				fieldLabel : '启用日期',
				xtype : 'datefield',
				dataIndex : 'start_date',
				format : 'Y-m-d',
				value : new Date(),
				listeners : 
				{
					'select': function()
					{
						var start=Ext.getCmp('start_date').getValue();
						var end = Ext.getCmp('end_date').getValue();
						if(start>end)
						{
							Ext.Msg.alert("系统提示", "启用日期不能大于停止日期！");
						}
					}
				}
			},{
				id : 'end_date',
				name : 'end_date',
				fieldLabel : '停止日期',
				xtype : 'datefield',
				dataIndex : 'end_date',
				format : 'Y-m-d',
				minValue : '',
				value : new Date(new Date().getFullYear()+10,new Date().getMonth(),new Date().getDate()),
				listeners : 
				{
					'select': function()
					{
						var start=Ext.getCmp('start_date').getValue();
						var end = Ext.getCmp('end_date').getValue();
						if(start>end)
						{
							Ext.Msg.alert("系统提示", "启用日期不能大于停止日期！");
						}
					}
				}
			},
			{
				id : 'eleCode',
				name : 'eleCode',
				fieldLabel : '要素简称',
				xtype : 'hidden',
				value : records[0].raw.description,
				allowBlank : false
			},{
				id : 'admdivCode',
				name : 'admdivCode',
				fieldLabel : '行政区划',
				xtype : 'hidden',
				value : admivcode,
				allowBlank : false
			},{
				id : 'parent_id',
				name : 'parent_id',
				fieldLabel : '父节点',
				xtype : 'hidden',
				value : parentId,
				allowBlank : false
			}],
			buttons : [{
				text : '确定',
				handler : function() {
					var form = this.up('form').getForm();
					var start=Ext.getCmp('start_date').getValue();
						var end = Ext.getCmp('end_date').getValue();
						if(start>end)
						{
							Ext.Msg.alert("系统提示", "启用日期不能大于停止日期！");
							return;
						}
					if (form.isValid()) {
						form.submit( {
							url : '/realware/addEleValue.do',
							method : 'POST',
							timeout : 180000, // 设置为3分钟
							waitTitle : '提示',
							waitMsg : '后台正在处理中，请您耐心等候...',
							success : function(form,action) {
								succForm(form,action);
								Ext.getCmp("addWin").close();
								refreshData();
							},
							failure : function(form,action) {
								Ext.Msg.alert("提示信息","新增要素基本信息异常!");
							}
						});
				    }
			    }
			},{
				text : '取消',
				handler : function() {
						Ext.getCmp("addForm").getForm().reset();
						this.up('window').close();
				}
			} ]
		}) ]
	}).show();
}

/***
 * 修改
 */

function editEleValue()
{
	var records = Ext.getCmp('treepanel').getSelectionModel().getSelection();
	var records_left=Ext.getCmp('leftEle').getSelectionModel().getSelection();
//	alert(records[0].get("start_date"));
	if (records.length != 1) {
		Ext.Msg.alert("系统提示", "请选中一条要素信息！");
		return;
	}
	Ext.widget('window',{
		id : 'editWin',
		title : '修改要素基本信息',
		width : 350,
		height : 200,
		layout : 'fit',
		resizable : false,
		modal : true,
		items : [ new Ext.FormPanel({
			id : 'editForm',
			labelWidth : 75,
			frame : true,
			bodyStyle : 'padding:5px 5px 0',
			width : 350,
			defaults : {
				width : 300
			},
			items : [ {
				id : 'code',
				name : 'code',
				fieldLabel : '编码',
				xtype : 'textfield',
				value:records[0].raw.code,
				readOnly : true
				
			},{
				id : 'name',
				name : 'name',
				fieldLabel : '名称',
				xtype : 'textfield',
				value:records[0].get("name"),
				allowBlank : false
			},{
				id : 'start_date',
				name : 'start_date',
				fieldLabel : '启用日期',
				xtype : 'datefield',
				value: records[0].get("start_date")==null?null: records[0].get("start_date").substring(0,10),
				format : 'Y-m-d',
				allowBlank : false,
				listeners : 
				{
					'select': function()
					{
						var start=Ext.getCmp('start_date').getValue();
						var end = Ext.getCmp('end_date').getValue();
						if(start>end)
						{
							Ext.Msg.alert("系统提示", "启用日期不能大于停止日期！");
						}
					}
				}
			},{
				id : 'end_date',
				name : 'end_date',
				fieldLabel : '停用日期',
				xtype : 'datefield',
				value: records[0].get("start_date")==null?null:records[0].get("end_date").substring(0,10),
				format : 'Y-m-d',
				allowBlank : false,
				listeners : 
				{
					'select': function()
					{
						var start=Ext.getCmp('start_date').getValue();
						var end = Ext.getCmp('end_date').getValue();
						if(start>end)
						{
							Ext.Msg.alert("系统提示", "启用日期不能大于停止日期！");
						}
					}
				}
			},/*{
				id : 'is_leaf',
				name : 'is_leaf', 
				fieldLabel : '是否叶子节点',
				xtype : 'checkbox',
				checked : false
			},*/
			{
				id : 'eleCode',
				name : 'eleCode',
				fieldLabel : '要素简称',
				xtype : 'hidden',
				value : records_left[0].raw.description,
				allowBlank : false
			},{
				id : 'admdivCode',
				name : 'admdivCode',
				fieldLabel : '行政区划',
				xtype : 'hidden',
				value : Ext.getCmp('admdiv').getValue(),
				allowBlank : false
			},{
				id : 'parent_id',
				name : 'parent_id',
				fieldLabel : '父节点',
				xtype : 'hidden',
				value : records[0].get("parent_id"),
				allowBlank : false
			} ],
			buttons : [{
				text : '确定',
				handler : function() {
					var start=Ext.getCmp('start_date').getValue();
						var end = Ext.getCmp('end_date').getValue();
						if(start>end)
						{
							Ext.Msg.alert("系统提示", "启用日期不能大于停止日期！");
							return;
						}
					var form = this.up('form').getForm();
					if (form.isValid()) {
						form.submit( {
							url : '/realware/editEleValue.do',
							method : 'POST',
							timeout : 180000, // 设置为3分钟
							waitTitle : '提示',
							waitMsg : '后台正在处理中，请您耐心等候...',
							success : function(form,action) {
								succForm(form,action);
								Ext.getCmp("editWin").close();
								refreshData();
							},
							failure : function(form,action) {
								Ext.Msg.alert("提示信息","修改要素基本信息异常!");
							}
						});
				    }
			    }
			},{
				text : '取消',
				handler : function() {
						Ext.getCmp("editForm").getForm().reset();
						this.up('window').close();
				}
			} ]
		}) ]
	}).show();
	Ext.getCmp('code').addClass("x-item-disabled");
}

/***
 * 全部删除---没有用到
 */
/*function deleteAllEleValue() {
	var records = Ext.getCmp('leftEle').getSelectionModel().getSelection();
	var myMask = new Ext.LoadMask(Ext.getBody(), {
		msg : '后台正在处理中，请稍后....',
		removeMask : true
	});
	myMask.show();
	Ext.Ajax.request( {
		url : "/realware/deleteEleValue.do",
		method : 'POST',
		timeout : 180000, // 设置为3分钟
		params : {
			eleCode : records[0].raw.description,
			admdivCode : Ext.getCmp('admdiv').getValue()
		},
		success : function(response, options) {
			succAjax(response, myMask, true);
			refreshData();
		},
		failure : function(response, options) {
			failAjax(response, myMask);
			refreshData();
		}
	});
}*/


/******************************
 * 删除一个
 */
var eleCode="";
var eleId="";
function deleteEleValue(){
	eleCode="";
	eleId="";
	var rec = Ext.getCmp('leftEle').getSelectionModel().getSelection();
	var records = Ext.getCmp('treepanel').getSelectionModel().getSelection();
	if(records.length==0){
		Ext.Msg.alert("系统提示", "请至少选择一条数据！");
		return;
	}
	eleCode = rec[0].raw.description;
	eleId = records[0].get("id");
	//var eleId=[];
	/*for ( var i = 0; i < records.length; i++) {
		eleId.push(records[i].get("code"));
	}*/
	Ext.MessageBox.confirm('删除提示', '是否确定删除要素  '+records[0].get("name")+' ？', deleteEle);
	
	
}

function deleteEle(id) {
	if (id == "yes") {
		var myMask = new Ext.LoadMask(Ext.getBody(), {
			msg : '后台正在处理中，请稍后....',
			removeMask : true
		});
		myMask.show();
		Ext.Ajax.request( {
			url : "/realware/deleteEleValue.do",
			method : 'POST',
			timeout : 180000, // 设置为3分钟
			params : {
				eleCode : eleCode,
				admdivCode : Ext.getCmp('admdiv').getValue(),
				eleId : eleId
			},
			success : function(response, options) {
				succAjax(response, myMask, true);
				//refreshData();
			},
			failure : function(response, options) {
				failAjax(response, myMask);
				//refreshData();
			}
		});
	}
}

function refreshData() {
	Ext.getCmp("treepanel").getStore().load();
	Ext.getCmp('treepanel').getSelectionModel().deselectAll(true);
}