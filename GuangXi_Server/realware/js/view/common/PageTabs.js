/***
 * 按钮设置
 * @memberOf {TypeName} 
 */
Ext.define('pb.view.common.PageTabs',{
					extend : 'Ext.tab.Panel',
					alias : 'widget.pagetabs',
					frame : true,
					items : [ {
						id : 'index-1',
						iconCls : 'home',
						title : '<span>首页</span>',
						html : '<iframe scrolling="auto" frameborder="0" width="100%" height="100%"  src="/realware/main.do"></iframe> ',
						itemId : 'home'
					} ],
					plugins : Ext.create('Ext.ux.TabCloseMenu', {
						closeTabText : '关闭当前',
						closeOthersTabsText : '关闭其他',
						closeAllTabsText : '关闭所有'
					}),
					listeners : {
						beforeremove : function(tab, panel, eOpts) {
							var frame = Ext.query("iframe", panel.getEl().dom);  
						     if(frame.length > 0 && frame[0].src) {
						    	frame = frame[0];
						        frame.contentWindow.document.write("");  
			                    frame.contentWindow.document.clear();  
			                    frame.src = "javascript:false";
						    }
						}
					}
				});
