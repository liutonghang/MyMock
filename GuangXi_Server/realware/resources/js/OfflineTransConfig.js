
/*******************************************************************************
 * 初始化
 */
Ext.onReady(function() {
	//初始化Ext.QuickTips，启用悬浮提示
	Ext.QuickTips.init();

	var buttonItems = [{
						id : 'audit',
						handler : function() {
							auditCustomTransfer();
						}
					},{
						id : 'cancleBtn',
						handler : function() {
							cancleCustomTransfer();
						}
					}];
	var queryItems = [{
						id : 'queryPanel',
						title : '转账失败配置(优先)',
						frame : false,
						defaults : {
							padding : '0 3 0 3'
						},
						layout : {
							type : 'form',
							columns : 10
						},
						bodyPadding : 5,
						items : [ {
									id : 'payVoucherCodeField',
									fieldLabel : '凭证号',
									xtype : 'textarea',
									dataIndex : 'pay_voucher_code',
									height : 50,
									labelWidth : 40,
									emptyText : "可配置多个凭证号，以分号分隔"
								 }, {
									id : 'expressionField',
									fieldLabel : '表达式',
									xtype : 'textarea',
									dataIndex : 'expression',
									height : 50,
									labelWidth : 40,
									emptyText : "表达式脚本，例如：obj.getPay_voucher_id()==123"
								}],
						flex : 4
					},{
						id : 'queryPanel1',
						title : '转账超时配置(其次)',
						frame : false,
						defaults : {
							padding : '0 3 0 3'
						},
						layout : {
							type : 'form',
							columns : 5
						},
						bodyPadding : 5,
						items : [{
									id : 'payVoucherCode1Field',
									fieldLabel : '凭证号',
									xtype : 'textarea',
									dataIndex : 'account_name',
									height : 50,
									labelWidth : 40,
									emptyText : "可配置多个凭证号，以分号分隔"
								 }, {
									id : 'expression1Field',
									fieldLabel : '表达式',
									xtype : 'textarea',
									dataIndex : 'account_no',
									height : 50,
									labelWidth : 40,
									emptyText : "表达式脚本，例如：obj.getPay_voucher_id()==123"
								}],
						flex : 2
					},{
						id : 'queryPanel2',
						title : '转账不确定配置(最后)',
						frame : false,
						defaults : {
							padding : '0 3 0 3'
						},
						layout : {
							type : 'form',
							columns : 5
						},
						bodyPadding : 5,
						items : [{
									id : 'payVoucherCode2Field',
									fieldLabel : '凭证号',
									xtype : 'textarea',
									dataIndex : 'account_name',
									height : 50,
									labelWidth : 40,
									emptyText : "可配置多个凭证号，以分号分隔"
								 }, {
									id : 'expression2Field',
									fieldLabel : '表达式',
									xtype : 'textarea',
									dataIndex : 'account_no',
									height : 50,
									labelWidth : 40,
									emptyText : "表达式脚本，例如：obj.getPay_voucher_id()==123"
								}],
						flex : 2
					},{
						id : '1',
						xtype : 'textfield',
						defaults : {
							padding : '0 3 0 3'
						},
						width:1400,
						layout : 'table',
						value : "           凭证号、表达式都为空时，表示不控制转账结果；凭证号、表达式任意一个不为空时，则控制转账结果；如果三种配置包含同一条数据，按照转账失败>转账超时>转账不确定来生效",
						disabled : true
					}];
	Ext.StatusUtil.createViewport(buttonItems, queryItems, function() {
	     this.refreshData();
	});
});

/*******************************************************************************
 * 刷新
 */
function refreshData() {
   var myMask = new Ext.LoadMask(Ext.getBody(), {
		msg : '后台正在处理中，请稍后....',
		removeMask : true
			// 完成后移除
		});
         // 提交到服务器操作
	     Ext.Ajax.request({
				url : '/realware/customTransfer.do',
				method : 'POST',
				timeout : 180000, // 设置为3分钟
				// 提交成功的回调函数
				success : function(response, options) {
					var data = response.responseText;
					var	json = Ext.decode(data);
					if(json == null){
						return;
					}
					Ext.getCmp('payVoucherCodeField').setValue(json.fail_codes)
					Ext.getCmp('expressionField').setValue(json.fail_rule)
					Ext.getCmp('payVoucherCode1Field').setValue(json.timeOut_codes)
					Ext.getCmp('expression1Field').setValue(json.timeOut_rule)
					Ext.getCmp('payVoucherCode2Field').setValue(json.nuknow_codes)
					Ext.getCmp('expression2Field').setValue(json.nuknow_rule)
				},
				// 提交失败的回调函数
				failure : function(response, options) {
					failAjax(response, myMask);
				}
			});
}

function auditCustomTransfer() {
	var myMask = new Ext.LoadMask(Ext.getBody(), {
		msg : '后台正在处理中，请稍后....',
		removeMask : true
			// 完成后移除
		});
	myMask.show();
	// 提交到服务器操作
	var jsonStr = {
					fail_codes: Ext.getCmp('payVoucherCodeField').getValue(),
					fail_rule: Ext.getCmp('expressionField').getValue(),
					timeOut_codes : Ext.getCmp('payVoucherCode1Field').getValue(),
					timeOut_rule : Ext.getCmp('expression1Field').getValue(),
					nuknow_codes : Ext.getCmp('payVoucherCode2Field').getValue(),
					nuknow_rule : Ext.getCmp('expression2Field').getValue()
	}
	Ext.Ajax.request({
				url : '/realware/auditCustomTransfer.do',
				method : 'POST',
				contentType : 'application/json',
				timeout : 180000, // 设置为3分钟
				jsonData : jsonStr,
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
function cancleCustomTransfer() {
	var myMask = new Ext.LoadMask(Ext.getBody(), {
		msg : '后台正在处理中，请稍后....',
		removeMask : true
			// 完成后移除
		});
	myMask.show();
	// 提交到服务器操作
	Ext.Ajax.request({
				url : '/realware/cancleCustomTransfer.do',
				method : 'POST',
				timeout : 180000, // 设置为3分钟
				// 提交成功的回调函数
				success : function(response, options) {
					succAjax(response, myMask);
					Ext.getCmp('payVoucherCodeField').setValue("");
					Ext.getCmp('expressionField').setValue("");
					Ext.getCmp('payVoucherCode1Field').setValue("");
					Ext.getCmp('expression1Field').setValue("");
					Ext.getCmp('payVoucherCode2Field').setValue("");
					Ext.getCmp('expression2Field').setValue("");
				},
				// 提交失败的回调函数
				failure : function(response, options) {
					failAjax(response, myMask);
				}
	});
}