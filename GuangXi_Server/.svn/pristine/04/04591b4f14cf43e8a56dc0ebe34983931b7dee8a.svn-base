var Custom = function(){
	
	return {
			modifypwd : function(grid){
				var e_recordsr = userPanel.getSelectionModel().getSelection();
				if (e_recordsr.length != 1) {
					Ext.Msg.alert("系统提示", "请选择一条数据！");
					return;
				}
				var myMask = new Ext.LoadMask(Ext.getBody(), {
					msg : '后台正在处理中，请稍后....',
					removeMask : true
					});
				myMask.show();
				Ext.Ajax.request({
							url : '/realware/gxbocResetPassword.do',
							method : 'POST',
							timeout : 180000, // 设置为3分钟
							params : {
								userid : e_recordsr[0].get('user_id')
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
				return false;
	        }
	}
	
}();
