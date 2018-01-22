/***
 * 查看凭证窗口
 * @memberOf {TypeName} 
 */
Ext.define('pb.view.common.LookOCXWindow', {
	extend : 'Ext.window.Window',
	alias : 'widget.lookocxwindow',
	layout : 'fit',
	width : '90%',
	height : '90%',
	modal : true,
	title : '凭证查看窗口',
	resizable : false, // 不可调整大小
	draggable : false, // 不可拖拽
	listStore : null,
	colMaps : [],
	initComponent : function() {
		var me = this;
		var columns = [];
		for ( var i = 0; i < me.colMaps.getKeys().length; i++) {
			var key = me.colMaps.getKeys()[i];
			columns.push( {
				text : me.colMaps.get(key),
				dataIndex : key
			});
		}
		Ext.applyIf(me, {
		items : [ { 
			layout : {
				type : 'border',
				padding : 5
			},
			items : [ {
				region : 'west',
				width : '20%',
				items : [ {
					xtype : 'gridpanel',
					height : 550,
					store : this.listStore,
					columns : columns
				} ]
			}, {
				region : 'center',
				html : '<OBJECT CLASSID="clsid:4FC4CDDF-84E5-437C-8527-B23F6D70866C" style="width:100%;height:100%"  ID="CTJEstampOcx" CODEBASE="../Release/CTJEstampOcx.cab#version=1,0,0,0"></OBJECT>',
				tbar : [{
							id : 'topPage',
							text : '上一联',
							scale : 'small',
							iconCls : 'top',
							handler : Ext.OCXUtil.pageUp
						}, {
							id : 'lowPage',
							text : '下一联',
							scale : 'small',
							iconCls : 'low',
							handler : Ext.OCXUtil.pageDown
						}, {
							id : 'zoomIn',
							text : '放大',
							scale : 'small',
							iconCls : 'low',
							handler : Ext.OCXUtil.zoomIn
						}, {
							id : 'zoomOut',
							text : '缩小',
							scale : 'small',
							iconCls : 'low',
							handler : Ext.OCXUtil.zoomOut
						},{
							id : 'close',
							text : '退出',
							scale : 'small',
							iconCls : 'low',
							handler : function() {
								this.up('window').close();
							}
						}]
				}]
			}]
		});
		me.callParent(arguments);
	}
});
