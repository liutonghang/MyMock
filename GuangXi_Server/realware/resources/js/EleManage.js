/*******************************************************************************
 * 要素管理
 */

/***
 * 引入需要使用的js文件
 */
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/recommend.js"></scr' + 'ipt>');


var elePanel = null;

var header = "要素编码|ele_code|250,要素名称|ele_name|250,物理表/视图|ele_source|250,编码规则|code_rule|250,最大级次|max_level|250,扩展类型|account_extend_type|250";

var fileds = ["id","ele_code","ele_name","ele_source","code_rule","class_name","max_level","account_extend_type"];




/*******************************************************************************
 * 加载界面
 */
Ext.require( [ 'Ext.data.*', 'Ext.grid.*', 'Ext.tree.*' ]);
Ext.onReady(function() {
	Ext.QuickTips.init();
	if(elePanel==null){
		elePanel = getGrid(loadUrl, header, fileds, true, false);
		elePanel.setHeight(document.documentElement.scrollHeight - 32);
		elePanel.getStore().on('beforeload', function(thiz, options) {
				if (null == options.params || options.params == undefined) {
					options.params = [];
				}
				options.params["filedNames"] = Ext.encode(fileds);
			});
	}
	Ext.create('Ext.Viewport', {
				id : 'eleManagerFrame',
				layout : 'fit',
				items : [Ext.create('Ext.panel.Panel', {
							tbar : [{
								xtype : 'buttongroup',
								items : [{
											id : 'add',
											text : '新增',
											iconCls : 'add',
											scale : 'small',
											handler : function() {
												addElement();
											}
										},{
											id : 'edit',
											text : '修改',
											iconCls : 'edit',
											scale : 'small',
											handler : function() {
												editElement();
											}
										}, {
											id : 'delete',
											text : '删除',
											iconCls : 'delete',
											scale : 'small',
											handler : function() {
												delElement();
											}
										}, {
											id : 'refresh',
											text : '刷新',
											iconCls : 'refresh',
											scale : 'small',
											handler : function() {
												refreshData();
											}
										}]
							}],
							items : [elePanel]
						})]
			});
	refreshData()
});

/***
 * 新增要素
 * @memberOf {TypeName} 
 */
function addElement() {
	Ext.widget('window',{
		id : 'addWin',
		title : '新增要素信息',
		width : 350,
		height : 270,
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
				id : 'eleCode',
				name : 'eleCode',
				fieldLabel : '要素简称',
				xtype : 'textfield',
				allowBlank : false
			},{
				id : 'eleName',
				name : 'eleName',
				fieldLabel : '要素名称',
				xtype : 'textfield',
				allowBlank : false
			},{
				id : 'eleSource',
				name : 'eleSource',
				fieldLabel : '物理表/视图',
				xtype : 'textfield',
				allowBlank : false
			},{
				id : 'codeRule',
				name : 'codeRule',
				fieldLabel : '编码规则',
				xtype : 'textfield',
				allowBlank : false
			},{
				id : 'maxLevel',
				name : 'maxLevel',
				fieldLabel : '最大级次',
				xtype : 'textfield',
				regex : /^[-]?[0-9]{1}$/,
				regexText : '只能是数字且长度为1',
				allowBlank : false
			},{
				id:'accountExtendType',
				name:'accountExtendType',
				fieldLabel : '系统维护方式',
				editable : false,
				xtype : 'combo',
				displayField : 'name',
				valueField : 'value',
				store : Ext.create('Ext.data.Store', {
							fields : ['name', 'value'],
							data : [{
									"name" : "统一",
									"value" : 1
								}, {
									"name" : "可扩展",
									"value" : 2
								}, {
									"name" : "自定义",
									"value" : 3
								}]
							})
			} ],
			buttons : [{
				text : '确定',
				handler : function() {
					var form = this.up('form').getForm();
					if (form.isValid()) {
						form.submit( {
							url : '/realware/addElement.do',
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
								Ext.Msg.alert("提示信息","保存要素信息异常!");
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
 * 修改要素
 * @memberOf {TypeName} 
 * @return {TypeName} 
 */
function editElement(){
	var records = elePanel.getSelectionModel().getSelection();
	if (records.length != 1) {
		Ext.Msg.alert("系统提示", "请选中一条要素信息！");
		return;
	}
	Ext.widget('window',{
		id : 'editWin',
		title : '修改要素信息',
		width : 350,
		height : 270,
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
				id : 'eleCode1',
				name : 'eleCode1',
				fieldLabel : '要素简称',
				xtype : 'textfield',
				value:records[0].get("ele_code"),
				readOnly : true
			},{
				id : 'eleName1',
				name : 'eleName1',
				fieldLabel : '要素名称',
				xtype : 'textfield',
				value:records[0].get("ele_name"),
				allowBlank : false
			},{
				id : 'eleSource1',
				name : 'eleSource1',
				fieldLabel : '物理表/视图',
				xtype : 'textfield',
				value:records[0].get("ele_source"),
				allowBlank : false
			},{
				id : 'codeRule1',
				name : 'codeRule1',
				fieldLabel : '编码规则',
				xtype : 'textfield',
				value:records[0].get("code_rule"),
				allowBlank : false
			},{
				id : 'maxLevel1',
				name : 'maxLevel1',
				fieldLabel : '最大级次',
				xtype : 'textfield',
				regex : /^[-]?[0-9]{1}$/,
				value:records[0].get("max_level"),
				regexText : '只能是数字且长度为1',
				allowBlank : false
			},{
				id:'accountExtendType1',
				name:'accountExtendType1',
				fieldLabel : '系统维护方式',
				value:records[0].get("account_extend_type")=="统一"?1:records[0].get("account_extend_type")=="可扩展"?2:3,
				editable : false,
				xtype : 'combo',
				displayField : 'name',
				valueField : 'value',
				store : Ext.create('Ext.data.Store', {
							fields : ['name', 'value'],
							data : [{
									"name" : "统一",
									"value" : 1
								}, {
									"name" : "可扩展",
									"value" : 2
								}, {
									"name" : "自定义",
									"value" : 3
								}]
							})
			} ],
			buttons : [{
				text : '确定',
				handler : function() {
					var form = this.up('form').getForm();
					if (form.isValid()) {
						form.submit( {
							url : '/realware/editElement.do',
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
								Ext.Msg.alert("提示信息","保存要素信息异常!");
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
}

/***
 * 删除要素
 * @return {TypeName} 
 */
function delElement(){
	var records = elePanel.getSelectionModel().getSelection();
	if (records.length ==0) {
		Ext.Msg.alert("系统提示", "请至少选中一条要素信息！");
		return;
	}
	
	var myMask = new Ext.LoadMask(Ext.getBody(), {
		msg : '后台正在处理中，请稍后....',
		removeMask : true
	});
	Ext.Msg.confirm("系统提示","确定要删除选中的要素信息？",function(e) {
		if (e == "yes") {
			var eleCodes=[];
			for ( var i = 0; i < records.length; i++) {
				eleCodes.push(records[i].get("ele_code"));
			}
			myMask.show();
			Ext.Ajax.request( {
				url : "/realware/delElement.do",
				method : 'POST',
				timeout : 180000, // 设置为3分钟
				params : {
					eleCodes : Ext.encode(eleCodes)
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
		}
	});
}


/***
 * 刷新
 */
function refreshData(){
	elePanel.getStore().loadPage(1);
}
	
