/*
 * 注销账户
*/

Ext.require(['*']);

var selIds = "";//id
var selNos = ""; //no

/*
***************************单位零余额*************************************************
*/

function cancleAgencyZeroAccountDialog(gridPanel){
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
	Ext.MessageBox.confirm('注销提示', '是否确定注销 '+selNos+' 等账号？', canAgencyZeroAcount);
}

function canAgencyZeroAcount(id) {
	if (id == "yes") {
		var myMask = new Ext.LoadMask(Ext.getBody(), {
			msg : '后台正在处理中，请稍后....',
			removeMask : true
				// 完成后移除
			});
		myMask.show();
		// 提交到服务器操作
		Ext.Ajax.request({
			url : 'cancleAgencyZeroAccount.do',
			method : 'POST',
			timeout : 180000, // 设置为3分钟
			params : {
				selIds : selIds,
				selNos : selNos,
				account_type_code:account_type_code
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



