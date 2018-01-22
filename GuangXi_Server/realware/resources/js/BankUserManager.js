/*******************************************************************************
 * 主要用于网点用户角色维护
 * 
 * @type
 */


/***
 * 引入需要使用的js文件
 */
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/recommend.js"></scr' + 'ipt>');

var rolePanel = null;
var networkPanel = null;

/**
 * 数据项
 */
var fileds = ["user_code", "user_name", "user_role", "userRoleOp_id", "roleIds"];

/**
 * 列名
 */
var header = "员工号|user_code|140,姓名|user_name|140,角色授权|user_role|550";

var netfileds = ["id", "code", "name"];
var netheader = "网点编码|code|100,网点名称|name|180";

/*******************************************************************************
 * 界面加载
 */
Ext.onReady(function() {
	Ext.QuickTips.init();
	if (rolePanel == null) {
		rolePanel = getGrid(loadUrl, header, fileds, true, false);
		rolePanel.setHeight(document.documentElement.scrollHeight - 35);
		// 根据查询条件检索数据
		rolePanel.getStore().on('beforeload', function(thiz, options) {
					if (null == options.params || options.params == undefined) {
						options.params = [];
					}
					options.params["filedNames"] = JSON.stringify(fileds);
				});
	}
	if (networkPanel == null) {
		networkPanel = getGrid("/realware/loadAllNetwork1.do", netheader,
				netfileds, false, true);
		networkPanel.setHeight(document.documentElement.scrollHeight - 75);
		networkPanel.getStore().on('beforeload', function(thiz, options) {
					if (null == options.params || options.params == undefined) {
						options.params = [];
					}
					options.params["filedNames"] = JSON.stringify(netfileds);
				});

	}

	Ext.create('Ext.Viewport', {
		id : 'UserFrame',
		layout : 'fit',
		items : [Ext.create('Ext.panel.Panel', {
			layout : 'border',
			renderTo : Ext.getBody(),
			items : [{
						id : 'netgird',
						region : 'west',
						xtype : 'panel',
						width : 250,
						viewConfig : {
							enableTextSelection : true
						},
						items : [{
									title : '网点过滤查询',
									bodyPadding : 4,
									layout : 'hbox',
									defaults : {
										margins : '3 10 0 0'
									},
									items : [{
												id : 'netcode',
												fieldLabel : '网点编码',
												xtype : 'textfield',
												dataIndex : 'netcode',
												labelWidth : 53,
												width : 180
											}, {
												id : 'netrefresh',
												xtype : 'button',
												iconCls : 'refresh',
												scale : 'small',
												handler : function() {
													selectNet();
												}
											}],
									flex : 2
								}, networkPanel],
						listenners : {
							load : function() {
								networkPanel.getSelectionModel().selectRow(0);
							}
						}

					}, {
						region : 'center',
						xtype : 'panel',
						items : [{
									title : '柜员角色信息',
									bodyPadding : 0,
									layout : 'hbox',
									defaults : {
										margins : '3 10 0 0'
									},
									flex : 2
								}, {
									region : 'north',
									height : 34,
									tbar : [{
										id : 'buttongroup',
										xtype : 'buttongroup',
										items : [{
													id : 'add',
													text : '保存',
													iconCls : 'audit',
													scale : 'small',
													handler : function() {
														saveData();
													}
												}, {
													id : 'edit',
													text : '刷新',
													iconCls : 'refresh',
													scale : 'small',
													handler : function() {
														var records = networkPanel
																.getSelectionModel()
																.getSelection();
														if (records !== null
																&& records.length > 0) {
															var bankcode = records[0]
																	.get("id");
															refreshData(bankcode);
														} else {
															refreshData();
														}

													}
												}]
									}]
								}, rolePanel]
					}]
		})]
	});
	selectNetState();

	// 凭证选中刷新明细
	networkPanel.on("cellclick", function(g, rowIndex, columnIndex, e) {
				var records = g.getSelectionModel().getSelection();
				var bankcode = records[0].get("id");
				refreshData(bankcode);
			});
});

/*******************************************************************************
 * 网点加载
 */
function selectNet() {
	refresh1();
}
/**
 * 全部，部分切换
 */
function selectNetState() {
	selectNet();
}
/**
 * 切换状态
 */
function selectState() {
	rolePanel.getStore().load();
}

/*******************************************************************************
 * 刷新
 * 
 * @return
 */

function refreshData(bankId) {
	if (bankId == null) {
		Ext.Msg.alert("系统提示", "请选择相应的网点！");
		return;
	}
	rolePanel.getStore().load({
				method : 'post',
				params : {
					start : 0,
					pageSize : 200,
					filedNames : JSON.stringify(fileds),
					bankId : bankId
				}
			});
}

// 刷新网点
function refresh1() {
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

/**
 * 保存数据
 */
function saveData() {
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
}