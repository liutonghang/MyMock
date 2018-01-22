/**
 * 零余额账户余额查询
 */
function queryBalanceForm(gridPanel){
	var accountNo = "";
	var d_recordsr = gridPanel.getSelectionModel().getSelection();
	if (d_recordsr.length == 0 || d_recordsr.length > 1) {
		Ext.Msg.alert("系统提示", "请选择一个账户！");
		return;
	}
	accountNo = d_recordsr[0].get("account_no");
	var queryBalanceByZero  = new Ext.FormPanel({
		id:'queryBalanceZeroForm',
	    labelWidth: 300,
	    frame:true,
	    bodyStyle:'padding:5px 5px 0',
	    width: 300,
	    defaults: {width: 280},
	    defaultType: 'textfield',
			items : [ 
						{
							fieldLabel : '账号',
							id :'accountNoByQuery',
							labelWidth:50,
							readOnly : true,
							value:accountNo
						},{
							fieldLabel : '余额',
							id :'balanceByAccountNo',
							readOnly : true,
							labelWidth:50
						}
					],
			buttons: [
						{
						  id:'query',
	                  	  text: '查询',
	                      handler: function() {
						  	if( Ext.isEmpty ( Ext.getCmp('accountNoByQuery').getValue() )){
								Ext.Msg.alert("系统提示", "账号不能为空！");
							}else{
								queryBalance(this.up('window'));
								Ext.getCmp("queryBalanceZeroForm").getForm().reset();
								//this.up('window').close();
							}
	                   	 }
	              	   },
					   {
	                     text: '取消',
	                     handler: function() {
	                     	this.up('window').close();
	                     }
	                   }]
		});
	var dialog=Ext.widget('window', {
		title : '余额查询',
		width : 300,
		height : 140,
		layout : 'fit',
		resizable : false,
		modal : true,
		items : [ queryBalanceByZero ]
	}).show();
}


function queryBalance(win){
//	var myMask = new Ext.LoadMask(Ext.getBody(), {
//			msg : '后台正在处理中，请稍后....',
//			removeMask : true // 完成后移除
//		});
//	myMask.show();
	Ext.getCmp('query').disable(false);
	Ext.Ajax.request({
		url : 'queryBalanceByZeroAccount.do',
        method: 'POST',
		timeout:180000,  //设置为3分钟
		params : {
			accountNo : Ext.getCmp('accountNoByQuery').getValue(),
			admdivCode : Ext.getCmp('admdivCom').getValue(),
			accountTypeCode : accountType
		},
		// 提交成功的回调函数
		success : function(response, options) {
			Ext.getCmp('query').enable(false);
			var json = (new Function("return " + response.responseText))();
			Ext.getCmp("balanceByAccountNo").setValue(json.amt);
		},
		// 提交失败的回调函数
		failure : function(response, options) {
			Ext.Msg.show({
					title : '失败提示',
					msg : response.responseText,
					buttons : Ext.Msg.OK,
					icon : Ext.MessageBox.ERROR
				});
		}
	});
}