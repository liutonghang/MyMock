/***
 * 签章配置界面
 */

/***
 * 引入需要使用的js文件
 */
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/recommend.js"></scr' + 'ipt>');

var signPanel = null;

var fileds = [ "stamp_no","stamp_name","stamp_id", "match_script", "biz_type_id",
		"biz_type_code", "biz_type_name", "admdiv_code","biz_type_stamp_id"];

var header = "凭证类型|biz_type_code|70,签章位置|stamp_no|120,印章名称|stamp_name|120,印章ID|stamp_id|250,过滤脚本|match_script|300";

/**
 * 界面加载
 */
Ext.onReady(function() {
	signPanel = getGrid(loadUrl, header, fileds, true, true);
	signPanel.setHeight(document.documentElement.scrollHeight - 88);
	signPanel.getStore().on('beforeload', function(thiz, options) {
		if (null == options.params || options.params == undefined) {
			options.params = [];
		}
		var bizTree = Ext.getCmp("leftBizType").getSelectionModel().getSelection();
		if(null != bizTree && bizTree.length> 0){
			options.params["bizTypeId"] = bizTree[0].get("id");
		}
		options.params["admdiv_code"] = Ext.getCmp("admdivCom").getValue();
		options.params["filedNames"] = Ext.encode(fileds);
	});
	var bizTree= Ext.create('Ext.tree.Panel', {
			title : '业务类型',
			id : 'leftBizType',
			store : Ext.create('Ext.data.TreeStore', {
				root : {
					id : '0',
					nodeType : 'async'
				},
				proxy : {
					type : 'ajax',
					url : '/realware/initBizType.do'
				},
				autoLoad : true
			}),
			hideHeaders : true,
			rootVisible : false,
			region : 'west',
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
	Ext.create('Ext.Viewport', {
		layout : 'border',
		items : [ bizTree, {
			region : 'center',
			tbar : [{
				id : 'buttongroup',
						xtype : 'buttongroup',
						items : [{
									id : 'addBtn',
									text : '新增',
									iconCls : 'add',
									scale : 'small',
									handler : function() {
										addSignConfig();
										Ext.getCmp("addBtn").setDisabled(true);
									}
								}, {
									id : 'delBtn',
									text : '删除',
									iconCls : 'delete',
									scale : 'small',
									handler : function() {
										delSignConfig();
									}
								},{
									id : 'refreshBtn',
									text : '刷新',
									iconCls : 'refresh',
									scale : 'small',
									handler : function() {
										refreshData();
									}
								}]
			}],
			items : [ {
				title : "查询区",
				items :signPanel,
				tbar : {
					id : 'signConfigQuery',
					xtype : 'toolbar',
					bodyPadding : 8,
					layout : 'hbox',
					defaults : {
						margins : '3 5 0 0'
					},
					items : [{
						id : 'admdivCom',
						fieldLabel : '所属财政',
						xtype : 'combo',
						dataIndex : 'admdiv_code',
						displayField : 'admdiv_name',
						emptyText : '请选择',
						valueField : 'admdiv_code',
						labelWidth : 60,
						width : 160,
						editable : false,
						store : comboAdmdiv,
						value : comboAdmdiv.data.length > 0 ? comboAdmdiv.data.getAt(0).get("admdiv_code") : "",
						listeners : {
							'select' : refresh
						}
					}]
				}
			} ]
		} ]
	});
	Ext.getCmp("leftBizType").getStore().on('beforeload', function(thiz, options) {
		if (null == options.params || options.params == undefined) {
			options.params = [];
		}
		var admdiv0="";
		if(Ext.getCmp("admdivCom").getValue()!=undefined) admdiv0=Ext.getCmp("admdivCom").getValue();
		options.params["admdiv_code"] = admdiv0;
	});
	Ext.getCmp('leftBizType').on("itemclick",function(view, record, item, index, e) {
		refreshData();
		Ext.getCmp('addBtn').enable(false);
		Ext.getCmp('delBtn').enable(false);
		Ext.getCmp('refreshBtn').enable(false);
	});
	Ext.getCmp('addBtn').disable(false);
	Ext.getCmp('delBtn').disable(false);
	Ext.getCmp('refreshBtn').disable(false);
	refreshData();
});

function refresh()
{
	var treePanel=Ext.getCmp("leftBizType");
	treePanel.getStore().load();
	refreshData();
}

/***
 * 新增
 */
function addSignConfig() {
	var bizTree = Ext.getCmp("leftBizType").getSelectionModel().getSelection();
	Ext.Ajax.request( {
				url : '/realware/loadStampInfo.do',
				method : 'POST',
				timeout : 10000, // 设置为10秒
				params : {
					admdiv_code : Ext.getCmp("admdivCom").getValue(),
					bizTypeId : bizTree[0].get("id"),
					bizTypeCode:bizTree[0].raw.description
				},
				success : function(response, options) {
					var b = (new Function("return " + response.responseText))();
					var	stampnoStore = Ext.create('Ext.data.Store', {
							fields : [ 'name', 'value' ],
							data : b[1]
						});
					var	stampidStore = Ext.create('Ext.data.Store', {
							fields : [ 'name', 'value' ],
							data : b[0]
						});
					Ext.widget('window',{
										id : 'addWin',
										title : '新增签章配置信息',
										width : 350,
										height : 220,
										layout : 'fit',
										resizable : false,
										modal : true,
										items : [ new Ext.FormPanel(
												{
													id : 'addSignConfigForm',
													labelWidth : 75,
													frame : true,
													bodyStyle : 'padding:5px 5px 0',
													width : 350,
													defaults : {
														width : 300
													},
													items : [
															{
																id : 'stampNo',
																name : 'stampNo',
																fieldLabel : '签章位置',
																xtype : 'combo',
																editable : false,
																displayField : 'name',
																valueField : 'value',
																store : stampnoStore,
																allowBlank : false

															},
															{
																id : 'stampId',
																name : 'stampId',
																fieldLabel : '印章id',
																xtype : 'combo',
																editable : false,
																displayField : 'name',
																valueField : 'value',
																store : stampidStore,
																allowBlank : false
															},
															{
																id : 'matchScript',
																name : 'matchScript',
																fieldLabel : '过滤条件',
																xtype : 'textareafield',
																height : 60
															} ],
													buttons : [
															{
																text : '确定',
																handler : function() {
																	var form = this.up('form').getForm();
																	if (form.isValid()) {
																		form.submit( {
																					url : '/realware/addSignConfig.do',
																					method : 'POST',
																					params: {
																						admdivCode:Ext.getCmp("admdivCom").getValue(),
																						bizTypeId:bizTree[0].get("id"),
																						bizTypeCode:bizTree[0].raw.description
																					},
																					timeout : 180000, // 设置为3分钟
																					waitTitle : '提示',
																					waitMsg : '后台正在处理中，请您耐心等候...',
																					success : function(form,action) {
																						succForm(form, action);
																						Ext.getCmp("addWin").close();
																						Ext.getCmp("addBtn").setDisabled(false);
																						refreshData();
																					},
																					failure : function(form,action) {
																						Ext.Msg.alert("提示信息", "保存签章配置信息异常!");
																						Ext.getCmp("addBtn").setDisabled(false);
																					}
																				});
																	}
																}
															},
															{
																text : '取消',
																handler : function() {
																	Ext.getCmp("addSignConfigForm").getForm().reset();
																	this.up('window').close();
																	Ext.getCmp("addBtn").setDisabled(false);
																}
															} ]
												}) ]
									}).show();
					     
					     Ext.getCmp("addWin").on("close",function(){
						    Ext.getCmp("addBtn").setDisabled(false);
					     });
				},
				failure : function(response, options) {
					 Ext.getCmp("addBtn").setDisabled(false);
					 var reqst=response.status;        // 根据返回的状态码值判断是否超时
				     if(reqst==0){                  // 超时的状态码为 0
					    Ext.Msg.alert("提示信息","发送超时,可能存在网络异常,检查后请重试...");
				     }else{
						Ext.Msg.alert("提示信息", response.responseText);
				     }
				}
			});
}

/***
 * 删除
 * @return {TypeName} 
 */
function delSignConfig() {
	var records = signPanel.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请至少选中一条签章凭证信息！");
		return;
	}
	var myMask = new Ext.LoadMask(Ext.getBody(), {
		msg : '后台正在处理中，请稍后....',
		removeMask : true
	});
	Ext.Msg.confirm("系统提示","确定要删除选中的签章配置信息？",function(e) {
		if (e == "yes") {
			var ids=[];
			for ( var i = 0; i < records.length; i++) {
				ids.push(records[i].get("biz_type_stamp_id"));
			}
			myMask.show();
			Ext.Ajax.request( {
				url : "/realware/delSignConfig.do",
				method : 'POST',
				timeout : 180000, // 设置为3分钟
				params : {
					ids : Ext.encode(ids)
				},
				success : function(response, options) {
					succAjax(response, myMask, true);
				},
				failure : function(response, options) {
					failAjax(response, myMask);
					refreshData();
				}
			});
		}
	});
}



/***************************************************************************
 * 刷新
 */
function refreshData() {
	signPanel.getStore().load();
}