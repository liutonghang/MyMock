/***
 * 
 * @memberOf {TypeName} 
 */
Ext.define('pb.view.common.PageHead',{
					extend : 'Ext.panel.Panel',
					alias : 'widget.pagehead',
					frame : true,
					html : "<table cellSpacing=0 cellPadding=0 width=100% background='/realware/resources/images/header_bg.jpg' border=0><tr><td><IMG src='/realware/resources/images/header_left.jpg' height=56 width=260 style='margin-top:-6px'></td><td></td><td align=right width=268  height=56 class='bg_td'><div id='div_' style='margin-top:25px'></div></td></tr></table>"
				});

Ext.onReady(function() {
	Ext.create('Ext.panel.Panel', {
				layout : 'hbox',
				defaults : {
					margins : '0 10 15 0'
				},
				bodyStyle : 'background:transparent;border-width: 0px 0px 0px 0px;',
				renderTo : 'div_',
				width : 240,
				items : [{
					xtype:'button',
					text : '修改密码',
					iconCls : 'role',
					hidden : loginModel == 1 ? false : true
				}, {
					id : 'chanel',
					xtype:'button',
					text : '注销',
					iconCls : 'logout',
					handler : function() {
						window.location.href = "/realware/login.do";
					}
				}, {
					xtype:'button',
					text : '下载OCX',
					iconCls : 'load',
					handler : function() {
						window.location.href = "/realware/downLoad.do?fileName="
							+ encodeURI(encodeURI('vlclient.msi'));
					}
				}]
			});

});