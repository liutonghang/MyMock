/*
 * 删除账户
*/

Ext.require(['*']);

var selIds = "";//id
var selNos = ""; //no

/*
***************************授权支付垫支户（主办行）***********************************************
*/

function delAccreditAdvanceAccountDialog(gridPanel){
	// 请求开始时，都先把selIds置空
	selIds = "";
	selNos = "";
	// 当前选中的数据
	var d_recordsr = gridPanel.getSelectionModel().getSelection();

	if (d_recordsr.length == 0) {
		Ext.Msg.alert("系统提示", "请至少选择一条数据！");
		return;
	}
	// 选中的凭证的id数组，要传到后台（可以选中多条）
	for (var i = 0; i < d_recordsr.length; i++) {
		selIds += d_recordsr[i].get("account_id");
		selNos += d_recordsr[i].get("account_name");
		if (i < d_recordsr.length - 1){
			selIds += ",";
			selNos += ",";
		}
			
	}
	//重庆三峡银行需求，优化提示信息，删除账号后面的等
	Ext.MessageBox.confirm('删除提示', '是否确定删除 '+selNos+'的账户信息？', delAccreditAdvanceAccount);
}

function delAccreditAdvanceAccount(id) {
	if (id == "yes") {
		var myMask = new Ext.LoadMask(Ext.getBody(), {
			msg : '后台正在处理中，请稍后....',
			removeMask : true
				// 完成后移除
			});
		myMask.show();
		// 提交到服务器操作
		Ext.Ajax.request({
			url : 'delAccreditAdvanceAccount.do',
			method : 'POST',
			timeout : 180000, // 设置为3分钟
			params : {
				selIds : selIds,
				selNos : selNos
			},
			// 提交成功的回调函数
			success : function(response, options) {
				succAjax(response,myMask);
				refreshData();
			},
			// 提交失败的回调函数
			failure : function(response, options) {
				failAjax(response,myMask);
				refreshData();
			}
		});
	}
}


/*
***************************单位零余额*************************************************
*/

function deleteAgencyZeroAccountDialog(gridPanel){
	// 请求开始时，都先把selIds置空
	selIds = "";
	selNos = "";
	// 当前选中的数据
	var d_recordsr = gridPanel.getSelectionModel().getSelection();

	if (d_recordsr.length == 0) {
		Ext.Msg.alert("系统提示", "请至少选择一条数据！");
		return;
	}
	// 选中的凭证的id数组，要传到后台
	for (var i = 0; i < d_recordsr.length; i++) {
		selIds += d_recordsr[i].get("account_id");
		selNos += d_recordsr[i].get("account_name");
		if (i < d_recordsr.length - 1){
			selIds += ",";
			selNos += ",";
		}
			
	}
	Ext.MessageBox.confirm('删除提示', '是否确定删除 '+selNos+'的账户信息 ？', delAgencyZeroAcount);
}

function delAgencyZeroAcount(id) {
	if (id == "yes") {
		var myMask = new Ext.LoadMask(Ext.getBody(), {
			msg : '后台正在处理中，请稍后....',
			removeMask : true
				// 完成后移除
			});
		myMask.show();
		// 提交到服务器操作
		Ext.Ajax.request({
			url : 'deleteAgencyZeroAccount.do',
			method : 'POST',
			timeout : 180000, // 设置为3分钟
			params : {
				selIds : selIds,
				selNos : selNos
			},
			// 提交成功的回调函数
			success : function(response, options) {
				succAjax(response,myMask);
				refreshData();
			},
			// 提交失败的回调函数
			failure : function(response, options) {
				failAjax(response,myMask);
				refreshData();
			}
		});
	}
}


/** ******************************************************************************** */

/*
***************************清算账户*************************************************
*/

function deleteClearAccountDialog(gridPanel){
	// 请求开始时，都先把selIds置空
	selIds = "";
	selNos = "";
	// 当前选中的数据
	var d_recordsr = gridPanel.getSelectionModel().getSelection();

	if (d_recordsr.length == 0) {
		Ext.Msg.alert("系统提示", "请至少选择一条数据！");
		return;
	}
	// 选中的凭证的id数组，要传到后台
	for (var i = 0; i < d_recordsr.length; i++) {
		selIds += d_recordsr[i].get("account_id");
		selNos += d_recordsr[i].get("account_name");
		if (i < d_recordsr.length - 1){
			selIds += ",";
			selNos += ",";
		}
			
	}

	Ext.MessageBox.confirm('删除提示', '是否确定删除 '+selNos+' 的账户信息？', delClearAcount);
}

function delClearAcount(id) {
	if(id == "yes"){
		var myMask = new Ext.LoadMask(Ext.getBody(), {
			msg : '后台正在处理中，请稍后....',
			removeMask : true
				// 完成后移除
			});
		myMask.show();
		// 提交到服务器操作
		Ext.Ajax.request({
				url : 'deleteClearAccount.do',
        		method: 'POST',
				timeout:180000,  //设置为3分钟
				params : {
					selIds : selIds,
					selNos : selNos
				},
				// 提交成功的回调函数
				success : function(response, options) {
					succAjax(response,myMask);
					refreshData();
				},
				// 提交失败的回调函数
				failure : function(response, options) {
					failAjax(response,myMask);
					refreshData();
				}
		});
	}
}


/***********************************************************************************/


/*
***************************财政零余额*************************************************
*/

function deleteAdmdivZeroAccountDialog(gridPanel){
	// 请求开始时，都先把selIds置空
	selIds = "";
	selNos = "";
	// 当前选中的数据
	var d_recordsr = gridPanel.getSelectionModel().getSelection();

	if (d_recordsr.length == 0) {
		Ext.Msg.alert("系统提示", "请至少选择一条数据！");
		return;
	}
	// 选中的凭证的id数组，要传到后台
	for (var i = 0; i < d_recordsr.length; i++) {
		selIds += d_recordsr[i].get("account_id");
		selNos += d_recordsr[i].get("account_no");
		if (i < d_recordsr.length - 1){
			selIds += ",";
			selNos += ",";
		}
			
	}
	
	Ext.MessageBox.confirm('删除提示', '是否确定删除 '+selNos+' 的账户信息？', delAdmdivZeroAcount);

}

function delAdmdivZeroAcount(id) {
	if(id == "yes"){
		var myMask = new Ext.LoadMask(Ext.getBody(), {
			msg : '后台正在处理中，请稍后....',
			removeMask : true
				// 完成后移除
			});
		myMask.show();
		// 提交到服务器操作
		Ext.Ajax.request({
				url : 'delAdmdivZeroAcount.do',
        		method: 'POST',
				timeout:180000,  //设置为3分钟
				params : {
					selIds : selIds,
					selNos : selNos
				},
				// 提交成功的回调函数
				success : function(response, options) {
					succAjax(response,myMask);
					refreshData();
				},
				// 提交失败的回调函数
				failure : function(response, options) {
					failAjax(response,myMask);
					refreshData();
				}
		});
	}
}


/***********************************************************************************/
/*
***************************工资统发账户*************************************************
*/
function deleteSalaryAccountDialog(gridPanel){
	// 请求开始时，都先把selIds置空
	selIds = "";
	selNos = "";
	// 当前选中的数据
	var d_recordsr = gridPanel.getSelectionModel().getSelection();

	if (d_recordsr.length == 0) {
		Ext.Msg.alert("系统提示", "请至少选择一条数据！");
		return;
	}
	// 选中的凭证的id数组，要传到后台
	for (var i = 0; i < d_recordsr.length; i++) {
		selIds += d_recordsr[i].get("account_id");
		selNos += d_recordsr[i].get("account_name");
		if (i < d_recordsr.length - 1){
			selIds += ",";
			selNos += ",";
		}
			
	}
	
	Ext.MessageBox.confirm('删除提示', '是否确定删除 '+selNos+' 的账户信息？', delSalaryAcount);

}

function delSalaryAcount(id) {
	if(id == "yes"){
		var myMask = new Ext.LoadMask(Ext.getBody(), {
			msg : '后台正在处理中，请稍后....',
			removeMask : true
				// 完成后移除
			});
		myMask.show();
		// 提交到服务器操作
		Ext.Ajax.request({
				url : 'delSalaryAcount.do',
        		method: 'POST',
				timeout:180000,  //设置为3分钟
				params : {
					selIds : selIds,
					selNos : selNos
				},
				// 提交成功的回调函数
				success : function(response, options) {
					succAjax(response,myMask);
					refreshData();
				},
				// 提交失败的回调函数
				failure : function(response, options) {
					failAjax(response,myMask);
					refreshData();
				}
		});
	}
}
/*****************************************************************************************/
/*
***************************垫支户/划款账户*************************************************
*/

function deleteAdvanceAgentDialog(gridPanel){
	// 请求开始时，都先把selIds置空
	selIds = "";
	selNos ="";
	// 当前选中的数据
	var d_recordsr = gridPanel.getSelectionModel().getSelection();
	if (d_recordsr.length == 0) {
		Ext.Msg.alert("系统提示", "请至少选择一条数据！");
		return;
	}
	// 选中的凭证的id数组，要传到后台
	for (var i = 0; i < d_recordsr.length; i++) {
		selIds += d_recordsr[i].get("account_id");
		selNos += d_recordsr[i].get("account_name");
		if (i < d_recordsr.length - 1){
			selIds += ",";
			selNos += ",";
		}
			
	}

	Ext.MessageBox.confirm('删除提示', '是否确定删除 '+selNos+' 的账户信息？', delAgentAcount);
}

function delAgentAcount(id) {
	if(id == "yes"){
		var myMask = new Ext.LoadMask(Ext.getBody(), {
			msg : '后台正在处理中，请稍后....',
			removeMask : true
				// 完成后移除
			});
		myMask.show();
		// 提交到服务器操作
		Ext.Ajax.request({
				url : 'delAdvanceAgent.do',
        		method: 'POST',
				timeout:180000,  //设置为3分钟
				params : {
					selIds : selIds,
					selNos : selNos
				},
				// 提交成功的回调函数
				success : function(response, options) {
					succAjax(response,myMask);
					refreshData();
				},
				// 提交失败的回调函数
				failure : function(response, options) {
					failAjax(response,myMask);
					refreshData();
				}
		});
	}
}


/***********************************************************************************/




/*
***************************财政国库资金实有资金账户*************************************************
*/

function deleteRealFundAccountDialog(gridPanel){
	// 请求开始时，都先把selIds置空
	selIds = "";
	selNos ="";
	// 当前选中的数据
	var d_recordsr = gridPanel.getSelectionModel().getSelection();

	if (d_recordsr.length == 0) {
		Ext.Msg.alert("系统提示", "请至少选择一条数据！");
		return;
	}
	// 选中的凭证的id数组，要传到后台

	for (var i = 0; i < d_recordsr.length; i++) {
		selIds += d_recordsr[i].get("account_id");
		selNos += d_recordsr[i].get("account_name");
		if (i < d_recordsr.length - 1){
			selIds += ",";
			selNos += ",";
		}
			
	}

	Ext.MessageBox.confirm('删除提示', '是否确定删除 '+selNos+' 的账户信息？', delRealFundAcount);
}

function delRealFundAcount(id) {
	if(id == "yes"){
		var myMask = new Ext.LoadMask(Ext.getBody(), {
			msg : '后台正在处理中，请稍后....',
			removeMask : true
				// 完成后移除
			});
		myMask.show();
		// 提交到服务器操作
		Ext.Ajax.request({
				url : 'deleteRealFundAccount.do',
        		method: 'POST',
				timeout:180000,  //设置为3分钟
				params : {
					selIds : selIds,
					selNos : selNos
				},
				// 提交成功的回调函数
				success : function(response, options) {
					succAjax(response,myMask);
					refreshData();
				},
				// 提交失败的回调函数
				failure : function(response, options) {
					failAjax(response,myMask);
					refreshData();
				}
		});
	}
}


/***********************************************************************************/

/***********************************************************************************/




/*
***************************划款收款账户维护*************************************************
*/

function deleteAgentPayeeAccountDialog(gridPanel){
	// 请求开始时，都先把selIds置空
	selIds = "";
	selNos ="";
	// 当前选中的数据
	var d_recordsr = gridPanel.getSelectionModel().getSelection();

	if (d_recordsr.length == 0) {
		Ext.Msg.alert("系统提示", "请至少选择一条数据！");
		return;
	}
	// 选中的凭证的id数组，要传到后台
	for (var i = 0; i < d_recordsr.length; i++) {
		selIds += d_recordsr[i].get("account_id");
		selNos += d_recordsr[i].get("account_name");
		if (i < d_recordsr.length - 1){
			selIds += ",";
			selNos += ",";
		}
			
	}
	
	Ext.MessageBox.confirm('删除提示', '是否确定删除 '+selNos+' 的账户信息？', delPayeeAgentAcount);
}

function delPayeeAgentAcount(id) {
	if(id == "yes"){
		var myMask = new Ext.LoadMask(Ext.getBody(), {
			msg : '后台正在处理中，请稍后....',
			removeMask : true
				// 完成后移除
			});
		myMask.show();
		// 提交到服务器操作
		Ext.Ajax.request({
				url : 'deleteAgentPayeeAccount.do',
        		method: 'POST',
				timeout:180000,  //设置为3分钟
				params : {
					selIds : selIds,
					selNos : selNos
				},
				// 提交成功的回调函数
				success : function(response, options) {
					succAjax(response,myMask);
					refreshData();
				},
				// 提交失败的回调函数
				failure : function(response, options) {
					failAjax(response,myMask);
					refreshData();
				}
		});
	}
}


