function sysFromBank(){
	var myMask = new Ext.LoadMask(Ext.getBody(), {
			msg : '后台正在处理中，请稍后....',
			removeMask : true // 完成后移除
		});
	myMask.show();
	// 提交到服务器操作
	Ext.Ajax.request({
		url : synUrl,
        method: 'POST',
		timeout:180000,  //设置为3分钟
		params : {
		},
		// 提交成功的回调函数
		success : function(response, options) {
			succAjax(response, myMask,true);
		},
		// 提交失败的回调函数
		failure : function(response, options) {
			failAjax(response, myMask);
		}
	});
}