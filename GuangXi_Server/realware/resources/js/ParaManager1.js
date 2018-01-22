/*******************************************************************************
 * 主要用于参数维护
 * 
 * @type
 */

/***
 * 引入需要使用的js文件
 */
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/recommend.js"></scr' + 'ipt>');
var path="";


/**
 * 列表
 */
var gridPanel1 = null;

	var treestore = Ext.create('Ext.data.TreeStore', {
		proxy:{
			type:'ajax',
			url:'/realware/loadPara.do',
			reader:'json',
			autoLoad:false
		},
		fields: ['para_id','para_key', 'para_name','para_value','default_value','para_remark','parent_id']
	});
	
	var tree = Ext.create('Ext.tree.Panel', {
		id : 'treepanel',
//	    title: 'TreeGrid（多列树示例）',
	    rootVisible:false,
	    collapsible: false,
	    fields: ['para_key', 'para_name','para_value','default_value','para_remark'],   
	    columns: [{   
	        xtype: 'treecolumn',//树状表格列   
	        text: '参数编码',   
	        dataIndex: 'para_key',   
	        width: 180,   
	        sortable: true  
	    }, {   
	        text: '参数名称',   
	        dataIndex: 'para_name',   
	        width:180,
	        flex: 1,   
	        sortable: true  
	    },  {   
	    	itemId : 'para_value',
	        text: '参数值',   
	        dataIndex: 'para_value',   
	        width:320,
	        flex: 1,   
	        sortable: true  
	    }, 	{   
	    	itemId : 'default_value',
	        text: '参数值',   
	        dataIndex: 'default_value',   
	        width:320,
	        flex: 1,   
	        sortable: true  
	    }, 	{   
	        text: '备注说明',   
	        dataIndex: 'para_remark',   
	        width:300,
	        flex: 1,   
	        sortable: true  
	    }
	    ],
	    store:treestore  
}); 


/**
 * 列名
 */
var header = "参数编码|para_key|180,参数名称|para_name|180,参数值|para_value|320,参数值|default_value|320,备注说明|para_remark|300";

var comboStore=Ext.create('Ext.data.Store',{
	fields :['name','value'],
	data :[{
		name  : "公用",
		value : "1"
	},{
		name : "私有",
		value: "0"
	}]
});

/**
 * 界面加载
 */
Ext.onReady(function() {
	Ext.QuickTips.init();	
//	gridPanel1 = getGrid("/realware/loadPara.do", header, fileds, true, false);	
	tree.setHeight(document.documentElement.scrollHeight - 88);
	Ext.create('Ext.Viewport', {
				id : 'ParaManagerFrame',
				layout : 'fit',
				items : [Ext.create('Ext.panel.Panel', {
							tbar : [{
								id : 'buttongroup',
								xtype : 'buttongroup',
								items : [{
											id : 'edit',
											text : '修改',
											iconCls : 'edit',
											scale : 'small',
											handler : function() {
												var state=Ext.getCmp('state').getValue();
												var admdiv=null;
												if(state==0){
													admdiv=Ext.getCmp('admdiv').getValue();
												}
												editDialog(state,admdiv);
											}
										}, {
											text : '刷新',
											iconCls : 'refresh',
											scale : 'small',
											handler : function() {
												refreshData();
											}
										}, {
											text : '同步',
											iconCls : 'add',
											scale : 'small',
											handler : function() {
												synchronise();
											}
										}]
							}],
							items : [{
										title : '查询区',										
										tbar : {
											xtype : 'toolbar',
											bodyPadding : 8,
											layout : 'hbox',
											defaults : {
												margins : '3 5 0 0'
											},
											items :[ {
													id : 'state',
													fieldLabel : '状态',
													xtype : 'combo',
													dataIndex : 'state',
													displayField : 'name',
													emptyText : '请选择',
													valueField : 'value',
													labelWidth : 53,
													editable :false,
													store : comboStore,
													listeners : {
														'select' : selectState
													}
												}, {
													id : 'admdiv',
													fieldLabel : '所属财政',
													xtype : 'combo',
													dataIndex : 'admdiv_code',
													displayField : 'admdiv_name',
													emptyText : '请选择',
													valueField : 'admdiv_code',
													labelWidth : 60,
													store : comboAdmdiv,
													value : comboAdmdiv.data.length > 0
														? comboAdmdiv.data
																.getAt(0)
																.get("admdiv_code")
														: "",
													listeners : {
														'select' : selectAdmdiv
													}
												}
												]
										}
									},tree]
//									,
//								items :[
//									Ext.widget('form', {
//										id:'form1',
//										autoScroll: true,
//										items : [tree]
//										})
//									]
						})]
			});
	Ext.getCmp('state').setValue("1");
	setBtnVisible(Ext.getCmp("admdiv").getValue(), Ext.getCmp("buttongroup"));
	selectState();
	
	treestore.on('expand',function( p, eOpts){
		path="";
	});

});


function selectState() { 
	var state=Ext.getCmp('state').getValue();
	if(state=="1"){
		Ext.getCmp('admdiv').hide();
		Ext.getCmp('treepanel').down('#para_value').hide();
		Ext.getCmp('treepanel').down('#default_value').show();
	}
	else{
		Ext.getCmp('admdiv').show();
		Ext.getCmp('treepanel').down('#default_value').hide();
		Ext.getCmp('treepanel').down('#para_value').show();
	}	
	refreshData();
}
function selectAdmdiv(){
	setBtnVisible(Ext.getCmp("admdiv").getValue(), null);
	refreshData();
}

/**
 * 数据项
 */
var fileds = ["para_key","para_name","para_value","default_value","para_remark","para_id","parent_id"]; // 数据项


/***************************************************************************
 * 刷新
 * 
 * @return
 */
function refreshData() {
	var admdiv=null;
	var state = Ext.getCmp('state').getValue();
	if(state=="0"){
		admdiv=Ext.getCmp('admdiv').getValue();
	}	
	treestore.load( {
		method : 'post',
		params : {
			filedNames : JSON.stringify(fileds),
			is_public :state,
			admdiv :admdiv
		},
		callback: function () {   
			if(!Ext.isEmpty(path)){
				Ext.getCmp('treepanel').expandPath(path, 'id');   
			}        	     	     	
    	} 
	});
}

/**
 * 同步
 * *
**/
function synchronise(){
	var myMask = new Ext.LoadMask(Ext.getBody(), {
		msg : '后台正在处理中，请稍后....',
		removeMask : true // 完成后移除
	});
	myMask.show();
	Ext.Ajax.request( {
		url : '/realware/synchronise.do',
		method : 'POST',
		timeout : 180000, // 设置为3分钟
		// 提交成功的回调函数
		success : function(response, options) {
			succAjax(response, myMask) ;
		},
		// 提交失败的回调函数
		failure : function(response, options) {
			failAjax(response, myMask) ;
		}
	});
}

/***
*  修改 
*
*/
var editWin=null;
function editDialog(state,admdiv){
	var e_recordsr = Ext.getCmp('treepanel').getSelectionModel().getSelection();
	if (e_recordsr.length != 1) {
		Ext.Msg.alert("系统提示", "请选择一条数据！");
		return;
	}
	if(e_recordsr[0].get("parent_id")==0){
		Ext.Msg.alert("系统提示", "目录行不允许修改！");
		return;
	}
//	var node=Ext.getCmp('treepanel').getView().getNode(e_recordsr);
//	var path=node[0].getPath();
	path=e_recordsr[0].getPath("id");
	if(editWin==null){
		editForm =new Ext.FormPanel({
			id:'editForm',	    
		    frame:true,
		   	bodyStyle  : 'padding:5px 5px 0',
		    width: 350,
		    defaults: {width: 300},
	    	defaultType: 'textfield',
		    items :[
		    	{
		    		id : 'para_key',
					fieldLabel : '参数编号',
					value : e_recordsr[0].get("para_key"),
					readOnly: true
		    	},{
		    		id : 'para_name',
					fieldLabel : '参数名称',
					value : e_recordsr[0].get("para_name"),
					readOnly: true
		    	},{
		    		id : 'value',
					fieldLabel : '参数值',
					value : state==0?e_recordsr[0].get("para_value"): e_recordsr[0].get("default_value")
		    	},{
		    		id : 'remark',
					fieldLabel : '备注',
					value : e_recordsr[0].get("para_remark"),
					readOnly: true
		    	}
		    	],
		    buttons : [ {
				text : '确定',
				handler : function() {
					if (Ext.getCmp('para_key').getValue() == "") {
						Ext.Msg.alert("系统提示", "参数编号不能为空！");
					} else if (Ext.getCmp('para_name').getValue() == "") {
						Ext.Msg.alert("系统提示", "参数名称不能为空！");
					} else {							
						editPara(state,admdiv,e_recordsr[0].get("para_id"),Ext.getCmp('value').getValue() ,path);	
						Ext.getCmp("editForm").getForm().reset();
						this.up('window').close();						
					}
					
				}
			}, {
				text : '取消',
				handler : function() {
					this.up('window').close();
				}
			} ]
		    	
		});
		
		
		var editWin=Ext.widget('window', {
			title : '修改参数',
			width : 350,
			height : 200,
			layout : 'fit',
			resizable : false,
			modal : true,
			items : [ editForm ]
		}).show();
	}
}

function editPara(state,admdiv,id,value,path){
	var myMask = new Ext.LoadMask(Ext.getBody(), {
		msg : '后台正在处理中，请稍后....',
		removeMask : true // 完成后移除
	});
	myMask.show();
	Ext.Ajax.request( {
		url : '/realware/editPara.do',
		method : 'POST',
		timeout : 180000, // 设置为3分钟
		params : {
			para_id : id,
			value :value,
			is_public : state,
			admdiv : admdiv
		},
		// 提交成功的回调函数
		success : function(response, options) {
			succAjax(response, myMask) ;
			refreshData();  
		},
		// 提交失败的回调函数
		failure : function(response, options) {
			failAjax(response, myMask) ;
			refreshData();
		}
	});
}
