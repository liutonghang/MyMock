/*******************************************************************************
 * 用户角色授权JS
 * 
 * @type
 */
Ext.require(["Ext.grid.*"]);

/***
 * 引入需要使用的js文件
 */
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/recommend.js"></scr' + 'ipt>');
	

var rolePanel = null;

/**
 * 数据项
 */
var fileds = ["user_code", "user_name", "user_role", "userRoleOp_id","roleIds"];

/**
 * 列名
 */
var header = "员工号|user_code|140,姓名|user_name|140,角色授权|user_role|1000";

Ext.onReady(function() {
			Ext.QuickTips.init();
			if (rolePanel == null) {
				rolePanel = getGrid(loadUrl, header, fileds, true, false);
				rolePanel.setHeight(document.documentElement.scrollHeight - 35);
				// 根据查询条件检索数据
				rolePanel.getStore().on('beforeload', function(thiz, options) {
							if (null == options.params
									|| options.params == undefined) {
								options.params = [];
								options.params["filedNames"] = JSON
										.stringify(fileds);
							} else {
								options.params["filedNames"] = JSON
										.stringify(fileds);
							}
						});
			}
			Ext.create('Ext.Viewport', {
						id : 'roleFrame',
						layout : 'fit',
						items : [Ext.create('Ext.panel.Panel', {
									items : [rolePanel],
									tbar : [{
												id : 'buttongroup',
												xtype : 'buttongroup',
												items : [{
															id : 'audit',
															text : '保存',
															iconCls : 'audit',
															scale : 'small',
															handler : function() {
																saveData();
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
											}]
								})]
					});
			//setBtnVisible(null, Ext.getCmp("buttongroup"));
			// 刷新加载数据
			refreshData();
		});

/**
 * 刷新数据
 */
function refreshData() {
	rolePanel.getStore().loadPage(1);
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