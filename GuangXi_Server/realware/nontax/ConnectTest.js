document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/recommend.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/operationLog.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/ocxVoucher.js"></scr' + 'ipt>');

Ext.onReady(function(){
	Ext.QuickTips.init();	
	//固定的工具栏
	var toolbar = Ext.create("Ext.Toolbar",{
		border:false,
		items:[{
			id:'connectText',
			text:'联网测试',
			iconCls:'look',
			handler:function(){
				connectTest();
			}
		},{
			id:'createToken',
			text:'Token生成',
			iconCls:'add',
			handler:function(){
				createToken();
			}
		},{
			id:'exportToken',
			text:'Token导出',
			iconCls:'print',
			handler:function(){
				exportToken();
			}
		},{
			id:'sendToken',
			text:'Token发送',
			iconCls:'audit',
			handler:function(){
				sendToken();
			}
		}]
		
	});
	
	var panel1 = Ext.create('Ext.form.Panel',{
		frame:true,
		title:'基本信息',
		border:false,
		//width:580,
		height:500,
//		layout: 'anchor',
		bodyPadding:10
//		defaults: {
//		        anchor: '50%'
//		},
		
	});
	
	Ext.create('Ext.Viewport',{
		frame:false,
		items:[
			toolbar,
			{
				border:false,
				layout: 'anchor',
				defaults: {
					labelAlign:'right',
		        	anchor: '50%'
				},
				bodyPadding:10,
				items : [
				{
					id:'token',
					xtype: 'textareafield', 
        			fieldLabel: '通讯TOKEN',
        			height:100,
        			anchor: '50%'
				},{
					id:"token_text",
					xtype: 'textareafield',
					fieldLabel:"返回结果",
					height:300,
					anchor: '50%'
				},{
					xtype : 'panel',
					anchor: '30%',
					border:false,
					layout: {
					    type: 'hbox',
					    align: 'center',
					    pack: 'end'
					},
					items : [
						{
							xtype : "button",
							text : "清空结果",
							width : 60,
							handler:function(){
								Ext.getCmp('token_text').setValue("");
								Ext.getCmp('token').setValue("");
							}
					}
				]
			}
		]
			}
		]
	});
});

/**
 * 联网测试
 */
function connectTest(){
	Ext.Ajax.request({
		method : 'POST',
		timeout : 180000,
		url : '/realware/connectTest.do',
		success : function(response, options) {
			Ext.getCmp('token_text').setValue(response.responseText);
		},
		failure : function(response, options) {
			Ext.getCmp('token_text').setValue("联网测试失败");
		}
	});
}
/**
 * token生成，这个只是生成了64位的随机数，然后在加密。
 */
function createToken(){
	Ext.Ajax.request({
		method : 'POST',
		timeout : 180000,
		url : '/realware/createToken.do',
		success : function(response, options) {
			Ext.getCmp('token').setValue(response.responseText);
		},
		failure : function(response, options) {
			Ext.getCmp('token_text').setValue("token生成失败");
		}
	});
}
/**
 * token导出
 */
function exportToken(){
	var token = Ext.getCmp('token').getValue();
	Ext.Ajax.request({
		method : 'POST',
		timeout : 180000,
		url : '/realware/createTokenTxt.do',
		params : {
			token : token
		},
		success : function(response, options) {
			window.location.href = "/realware/downLoad.do?fileName="
							+ encodeURI(encodeURI('token.txt'));
			Ext.getCmp('token_text').setValue(response.responseText);
		},
		failure : function(response, options) {
			Ext.getCmp('token_text').setValue(response.responseText);
		}
	});	
		
}

/**
 * token发送
 */
function sendToken(){
	var token = Ext.getCmp("token").getValue();
	Ext.Ajax.request({
		method : 'POST',
		timeout : 180000,
		url : '/realware/sendToken.do',
		params : {
			token : token
		},
		success : function(response, options) {
			Ext.getCmp('token_text').setValue(response.responseText);
		},
		failure : function(response, options) {
			Ext.getCmp('token_text').setValue("token发送失败");
		}
	});	
}

