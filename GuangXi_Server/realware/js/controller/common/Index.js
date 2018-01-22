/***
 * 主页面处理类
 * @memberOf {TypeName} 
 */
Ext.define('pb.controller.common.Index', {
	extend : 'Ext.app.Controller',
	stores : [ 'common.UserMenuTree'],
	requires : [ 'pb.view.common.UserMenuTree','pb.view.common.PageTabs','pb.view.common.PageHead'],
	refs : [ {
			ref : 'tabs',
			selector : 'pagetabs'
	}],
	init : function() {
		this.control( {
				//左侧菜单点击事件
				'usermenutree':{
					itemclick: this.doMenuTree
				}
				/**
				 * 不处理菜单切换时设置session内容，请求时已传入menu_id lfj 2015-02-03
				 */
				/*,
				'pagetabs':{
					//右侧菜单选项卡切换事件
					tabchange : function(tabPanel, newCard, oldCard) {
						if(tabPanel.getActiveTab() == null ||  tabPanel.getActiveTab().id == 'index-1'){
							return;
						}
						Ext.Ajax.request({
							url : '/realware/editMenu.do',
							method : 'POST',
							params : {
								id : tabPanel.getActiveTab().id
							}
						});
					}
				}*/
		});
	},
	doMenuTree : function(view, record, item, index, e){
		var contentTabs = this.getTabs();
		if (record.data.leaf == false)
			return;
		var tab = contentTabs.getComponent(record.raw.id);
		var subMainId = 'tab-'+record.raw.id+'main';
		if (tab == undefined) {
			tab = contentTabs.add(new Ext.Panel({
				id:record.raw.id,
				title : '<span>' + record.raw.text + '</span>',
				autoScroll:true,
				border:false,
				closable:true,
				layout : 'fit',
				layoutOnTabChange:true,
				loader:{
					url : '/realware/doGo.do?description='+record.raw.description,
					autoLoad:true,
					scripts: true,
					timeout: 9000,
					params:{
						subMainId: subMainId, //传动jsp页面，是对应页面的panel的id唯一
						id : record.raw.id
					}
				},
				listeners : {
					'resize' : function(component, width, height, oldWidth, oldHeight, eOpts){
						var currentPanel = Ext.getCmp(subMainId+"-js");//通过ID取得当前页面的panel
						if(currentPanel){
							//取得引入页面的高度和宽度
							var h = contentTabs.getActiveTab().getEl().getHeight();
							var w = contentTabs.getActiveTab().getEl().getWidth();
							currentPanel.setWidth(w);
							currentPanel.setHeight(h);
						}
					}
				}
			}));
		}
		contentTabs.setActiveTab(tab);
	}
});
