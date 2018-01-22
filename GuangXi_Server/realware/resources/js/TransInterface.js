/***
 * 接口联调工具开发
 */
Ext.onReady(function() {
	Ext.QuickTips.init();
	var buttonItems = [{
						    id : 'transfer',
							handler : function() {
								transfer();
							    }
						},{
							id : 'clear',
							handler : function() {
								clear();
							}
						}];
	var queryItems = [{
						id : 'queryPanel',
						title : '请求信息',
						frame : false,
						layout : {
							type : 'form'
						},
						items : [ {
									id : 'payVoucherCodeField',
									xtype : 'panel',
									height : 55,
									labelWidth : 10,
									items : [{
										id : 'payVoucherCode',
										fieldLabel : '支付凭证号',
										xtype : 'textfield'
									},{
										id : 'trans',
										xtype : 'button',
										text : '生成转账报文',
										listeners:{
									        click:function(){
									           trans(0);
									       }}
									},{
										id : 'queryTrans',
										xtype : 'button',
										text : '生成查询交易状态报文',
										listeners:{
									        click:function(){
										        trans(1);
									       }}
									},{
										id : 'checkSerialno',
										xtype : 'button',
										text : '生成对账报文',
										listeners:{
									        click:function(){
										         trans(2);
									       }}
									},{
										id : 'queryAcctBalance',
										xtype : 'button',
										text : '生成查询余额报文',
										listeners:{
									        click:function(){
										          trans(3);
									       }}
									}
									]								
								 }]
					},{
						id : 'queryPanel1',
						title : '请求报文',
						frame : false,
						layout : {
							type : 'form'
						},
						items : [{
									id : 'payVoucherCode1Field',
									xtype : 'textarea',
									height : 190,
									labelWidth : 40
								 }]
					},{
						id : 'queryPanel2',
						title : '响应报文',
						frame : false,
						layout : {
							type : 'form'
						},
						items : [{
									id : 'payVoucherCode2Field',
									height : 190,
									xtype : 'textarea',
									labelWidth : 40
								 }]
					}];
	
	Ext.StatusUtil.createViewport(buttonItems, queryItems, function() {

	});
});

/***
 * 生成转账报文
 */
function trans(type) {
   var payVoucherCode = Ext.getCmp('payVoucherCode').getValue();
   if(Ext.isEmpty(payVoucherCode)){
	   Ext.MessageBox.alert('提示','请输入支付凭证号！');
	   return null;
   }
   var myMask = new Ext.LoadMask(Ext.getBody(), {
		msg : '后台正在处理中，请稍后....',
		removeMask : true
			// 完成后移除
		});
         myMask.show();
         // 提交到服务器操作
	     Ext.Ajax.request({
				url : '/realware/trans.do',
				method : 'POST',
				timeout : 180000, // 设置为3分钟
				params : {
	    	              payVoucherCode : Ext.getCmp('payVoucherCode').getValue(),
	    	              type : type
	            },
				// 提交成功的回调函数
				success : function(response, options) {
	            	myMask.hide();
					Ext.getCmp('payVoucherCode1Field').setValue(response.responseText);
				},
				// 提交失败的回调函数
				failure : function(response, options) {
					failAjax(response, myMask);
				}
			});
}

//调用按钮
function transfer(){
	      var payVoucherCode = Ext.getCmp('payVoucherCode1Field').getValue();
	      if(payVoucherCode == null || Ext.isEmpty(payVoucherCode)){
	    	  Ext.MessageBox.alert('提示','请求报文为空！');
	    	  return null;
	      }
		  var myMask = new Ext.LoadMask(Ext.getBody(), {
			      msg : '后台正在处理中，请稍后....',
			      removeMask : true
			   });
	      myMask.show();
         // 提交到服务器操作
	     Ext.Ajax.request({
				url : '/realware/transfer.do',
				method : 'POST',
				timeout : 180000, // 设置为3分钟
				params : {
	    	              reqMsg : Ext.getCmp('payVoucherCode1Field').getValue()
	            },
				// 提交成功的回调函数
				success : function(response, options) {
	            	myMask.hide();
					Ext.getCmp('payVoucherCode2Field').setValue(response.responseText);
				},
				// 提交失败的回调函数
				failure : function(response, options) {
					failAjax(response, myMask);
				}
			});
}


//清除按钮
function clear(){
	Ext.getCmp('payVoucherCode').setValue("");
	Ext.getCmp('payVoucherCode1Field').setValue("");
	Ext.getCmp('payVoucherCode2Field').setValue("");
}