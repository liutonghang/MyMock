/****************************************************************
 * 用户角色授权
 */

/***
 * 引入需要使用的js文件
 */
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/recommend.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/menuBtnStatus.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/gridPanel.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/json2String.js"></scr' + 'ipt>');

Ext.require(["Ext.grid.*", "Ext.data.*"]);
var networkPanel =null;

var rolePanel = null;

//网点信息
var records = null;
//网点编码
var bankCode = null;
//网点名字
var bankname = null;
//标志位
var flag =0;

var bankId = "";

/**
 * 数据项
 */
var fileds = ["user_code", "user_name", "user_role", "userRoleOp_id","roleIds"];

/**
 * 列名
 */
var header = "员工号|user_code|130,姓名|user_name|130,角色授权|user_role|2000";

/**
 * 当前用户所属网点是否为主办网点
 */
var isHost = 'false';

var netfileds = ["id", "code", "name"];
var netheader="网点编码|code|100,网点名称|name|180";

var comboStore = Ext.create('Ext.data.Store', {
			fields : ['name', 'value'],
			data : [{
						"name" : "全部网点",
						"value" : "001"
					}, {
						"name" : "指定网点",
						"value" : "002"
					}]
		});

/*******************************************************************************
 * 界面加载
 */
var isModifyState = false;
var onRoleColClick=function(){
	if(!isModifyState){
		Ext.Msg.alert("提示","请先点击修改按钮")
	}
	return isModifyState;
}

Ext.onReady(function() {
	Ext.QuickTips.init();
	Ext.syncRequire(['js.view.common.Network']);
	if(networkPanel ==null){
		networkPanel = 	Ext.create('NetworkTree');
		networkPanel.setHeight(document.documentElement.scrollHeight - 100);
	}
	if (rolePanel == null) {
	
		rolePanel = getGrid(loadUrl, header, fileds, true, true);
		
//		rolePanel.title = '角色授权';
		rolePanel.columns[3].renderer=function(value){
			return "<span onClick='return onRoleColClick()'>"+value+"</span>";
		};
		rolePanel.setHeight(document.documentElement.scrollHeight - 75);
		// 根据查询条件检索数据
		rolePanel.getStore().on('beforeload', function(thiz, options) {
			var panel = Ext.ComponentQuery.query("panel[title='角色授权']")[0];
			beforeload(panel, options, Ext.encode(fileds));
			var records = networkPanel.getSelectionModel().getSelection();
			if (records && records.length > 0) {
				var netcode  = records[0].raw.code;
				var params = Ext.decode(options.params.jsonMap);
				params.push({"bank_code" : ["=", netcode]});
				options.params.jsonMap = Ext.encode(params);
				options.params.bankId  = records[0].raw.id;
				options.params.bankCode  = records[0].raw.code;
			}
		});
	}
	
	/**
	 * 按钮区
	 */
	var buttonItems = [{
		id : 'authorityBtn',
		handler : function() {
			openAuthorization();
		}
	},{
		id:'editBtn',
		
		handler:function(){
			editUserInfo();
		}
	},{
		id:'uneditBtn',
		disabled:true,
		handler:function(){
			noEditUserInfo();
		}
	},{
		id : 'saveBtn',
		disabled:true,
		handler : function(){
			saveUserInfo();
				}
	},{
		id : 'refreshBtn',
		handler : function() {
			refreshData();
		}		
	}];
	
	var queryItems = [{
                	  xtype : 'panel',
                	  layout : 'border',
                	  height : heights,
                	  items : [{
            			id :'netgird',
						title: '网点过滤查询',
						region: 'west',
						xtype : 'panel',
						collapsible : true,
						width: 250,
						viewConfig : {
							enableTextSelection : true
						},
            			items:[{
            				bodyPadding : 8,
            				layout : 'hbox',
            				viewConfig : {
								enableTextSelection : true
								},
            				defaults : {margins : '3 10 0 0'},
            				items : [{
            					id : 'netcode',
            					xtype : 'textfield',
            					dataIndex : 'netcode',
            					width: 100
            				}, {
            					id : 'netrefresh',
            					xtype : 'button',
            					iconCls : 'refresh',
            					scale : 'small',
            					handler : function() {
            						selectNet();
        						}	
            				}, {
            					id : 'netState',
            					xtype : 'combo',
            					displayField : 'name',
            					emptyText : '请选择',
            					valueField : 'value',
            					width : 85,
            					store : comboStore,
            					value : '001',
            					editable : false,
            					listeners : {
            							'select' : selectNetState
            						}
            				}],
            				flex : 2
            			},networkPanel]
            	},{
					region: 'center',
					xtype : 'panel',
					items : [{
							title : '角色授权',
							//bodyPadding : 8,
							layout : 'hbox',
							defaults : {
								margins : '3 10 0 0'
							}
						},rolePanel]
            	}]
                  
		}];
	Ext.StatusUtil.createViewport(buttonItems, queryItems, function() {
		// 默认设置为全部
		Ext.getCmp('netState').setValue("001");
	});
	
	setBtnVisible(null, Ext.getCmp("buttongroup"));
	selectNetState();
	// 选中网点刷新右侧panel
	networkPanel.on("itemclick", function(g, rowIndex, columnIndex, e) {
		refreshData();
	});
	
	
});

function authorition(){
	var data = "";
	var userIds = "";
	var roleUsers = rolePanel.getStore().data;
	if (roleUsers.length == 0) {
		Ext.Msg.alert("系统提示", "当前无需授权的数据！");
		return;
	}
	var myMask = new Ext.LoadMask(Ext.getBody(), {
		msg : '后台正在处理中，请稍后....',
		removeMask : true
			// 完成后移除
		});
	var eless = "";
	for (var k = 0; k < roleUsers.length; k++) {
		var userCode = roleUsers.items[k].get("user_code");
		var userRoleOp_id = roleUsers.items[k].get("userRoleOp_id");
		eless = document.getElementsByName(userCode);
		for (var i = 0; i < eless.length; i++) {
			if (eless[i].checked) {
				data += userRoleOp_id + "|" + eless[i].value + ",";
			}
		}
		userIds += userRoleOp_id + ",";
	}
	myMask.show();
	Ext.Ajax.request({
				url : '/realware/allAuthorition.do',
				waitMsg : '后台正在处理中,请稍后....',
				method : 'POST',
				timeout : 180000, // 设置为3分钟
				async : false,// 添加该属性即可同步,
				params : {
					data : data,
					userIds : userIds
				},
				// 提交成功的回调函数
				success : function(response, options) {
					succAjax(response, myMask);
				},
				// 提交失败的回调函数
				failure : function(response, options) {
					failAjax(response, myMask);
				}
			});
};



/**
 * 全部授权
 */
function openAuthorization(){	
	var allAuthority = new Ext.FormPanel({
		id:'authorition',
	    frame:true,
	    bodyStyle:'padding:5px 5px 0 5px',
		defaultType: 'checkbox',
		items : [{
			id : 'netHandle',
			fieldLabel : '辅助网点经办',
			checked : true
		},{
			id : 'netAudit',
			fieldLabel : '辅助网点审核',
			checked : true
		}],
		buttons : [{
			text : '确定',
			handler : function(){
				if(!Ext.getCmp('netHandle').checked){
					Ext.Msg.alert('系统提示','请选中辅助网点经办选项');
				}else if(!Ext.getCmp('netAudit').checked){
					Ext.Msg.alert('系统提示','请选中辅助网点审核选项');
				}else{
					authorition();
					this.up('window').close();
					refreshData();
				}
			}
		},{
			text : '取消',
			handler : function(){
				this.up('window').close();
			}
		}]
	});
	var dialog=Ext.widget('window', {
		title : '全部授权',
		width : 260,
		autoHeight:true,
		layout : 'fit',
		resizable : false,
		modal: true,
		defaultType : 'checkbox',
		items : [allAuthority]
	}).show();
}

/**
 * 修改用户信息
 */
function editUserInfo(){
	
	
	Ext.getCmp('uneditBtn').setDisabled(false);
	Ext.getCmp('saveBtn').setDisabled(false);
	networkPanel.setDisabled(true);
	//Ext.getCmp('saveBtn').enable(false);
	isModifyState = true;
	Ext.getCmp('editBtn').setDisabled(true);
	//var netState=Ext.getCmp('netState').getValue();
	//selectNetState();
}
/**
 * 取消修改用户信息
 */
function noEditUserInfo(){
	Ext.getCmp('editBtn').setDisabled(false);
	networkPanel.setDisabled(false);
	Ext.getCmp('saveBtn').setDisabled(true);
	Ext.getCmp('uneditBtn').setDisabled(true);
//	Ext.getCmp('saveBtn').enable(false);
	isModifyState = false;
	refreshData();
}
/**
 * 保存用户信息
 */
function saveUserInfo(){
	var data = "";
	var userIds = "";
	var roleUsers = rolePanel.getStore().data;
	if (roleUsers.length == 0) {
		Ext.Msg.alert("系统提示", "当前无需保存的数据！");
		return;
	}
	var myMask = new Ext.LoadMask(Ext.getBody(), {
		msg : '后台正在处理中，请稍后....',
		removeMask : true
			// 完成后移除
		});
	var eless = "";
//	Console.log("aadfdb");
	for (var k = 0; k < roleUsers.length; k++) {
		var userCode = roleUsers.items[k].get("user_code");
		var userRoleOp_id = roleUsers.items[k].get("userRoleOp_id");
		eless = document.getElementsByName(userCode);
		for (var i = 0; i < eless.length; i++) {
			if (eless[i].checked) {
				data += userRoleOp_id + "|" + eless[i].value + ",";
			}
		}
		userIds += userRoleOp_id + ",";
	}
	myMask.show();
	Ext.Ajax.request({
				url : '/realware/saveUserRole.do',
				waitMsg : '后台正在处理中,请稍后....',
				method : 'POST',
				timeout : 180000, // 设置为3分钟
				async : false,// 添加该属性即可同步,
				params : {
					data : data,
					userIds : userIds,
					bankId : bankId
				},
				// 提交成功的回调函数
				success : function(response, options) {
					isModifyState = false;
					succAjax(response, myMask);
				},
				// 提交失败的回调函数
				failure : function(response, options) {
					failAjax(response, myMask);
				}
			});
	Ext.getCmp('saveBtn').disable(false);
	Ext.getCmp('uneditBtn').setDisabled(true);
	Ext.getCmp('editBtn').setDisabled(false);
	networkPanel.setDisabled(false);
}

/**
 * 刷新数据
 */
function refreshData() {
	rolePanel.getStore().loadPage(1);
}


/**
 * 网点加载
 */
function selectNet(){
	if(Ext.isEmpty(Ext.getCmp("netcode").getValue())){
		return;
	}
	refreshNetWork();
	
	rolePanel.getStore().removeAll();
	
}

//刷新网点
function refreshNetWork(){
	var jsonMap = "[{";
	var codeOrName = Ext.getCmp('netcode').getValue();

	if (!Ext.isEmpty(codeOrName)) {
		var jsonStr = [];
		jsonStr[0] = "=";
		jsonStr[1] = codeOrName;
		jsonMap = jsonMap + "\"codeOrName\":" + Ext.encode(jsonStr) + ",";
	}
	data = jsonMap + "}]";
	networkPanel.getSelectionModel().deselectAll();
	networkPanel.getStore().load({
				method : 'post',
				params : {
					start : 0,
					pageSize : 200,
					filedNames : JSON.stringify(netfileds),
					jsonMap : data
				}
			});
}

/**
 * 网点过滤查询中，输入网点编码进行网点切换
 */
/**
 * 全部，部分切换
*/
function selectNetState(){
	var netState=Ext.getCmp('netState').getValue();
	if('001'==netState){
		Ext.getCmp('netcode').disable(false);
		Ext.getCmp('netrefresh').disable(false);
		networkPanel.setDisabled(true);
		networkPanel.getSelectionModel().clearSelections();
		refreshData();
		Ext.getCmp('netcode').setValue("");
	}else{
		Ext.getCmp('netcode').enable(false);
		Ext.getCmp('netrefresh').enable(false);
		networkPanel.setDisabled(false);
		selectNet();
		
	}	
}


function selectState(){
		Ext.getCmp('saveBtn').disable(false);
}

/**
 * 刷新网点
 */
function refresh1(){
	networkPanel.getStore().load({
				method : 'post',
				params : {
					start : 0,
					pageSize : 200,
					filedNames : JSON.stringify(netfileds),
					codeorname : Ext.getCmp('netcode').getValue()
				}
			});
}




