/***
 * 选择框（通用）  两种显示方法:gridpanel和treepanel,按钮【确定】【取消】可设置是否可见
 * @memberOf {TypeName} 
 */
Ext.define('pb.view.common.SelectWindow', {
	extend : 'Ext.window.Window',
	alias : 'widget.selectwindow',
	layout : 'fit',
	modal : true,
	saveHidden : false,
	closeHidden : false,
	width : 400,  
	height : 250,
	x : 400,  //显示X坐标
	y : 140,  //显示Y坐标
	listStore : null, //列表的数据集
	panelType : 0,    //列表类型 0 gridpanel 1 treepanel
	colMaps : null,   //列定义 Ext.util.HashMap类型
	parentWindow : null, //父窗口
	initComponent : function() {
		var me = this;
		var xtype = this.panelType == 0 ?'gridpanel':'treepanel';
		var columns = [];
		if (this.colMaps != null) {
			var colWidth = this.width/this.colMaps.getCount();
			for ( var i = 0; i < this.colMaps.getKeys().length; i++) {
				var key = this.colMaps.getKeys()[i];
				if (this.panelType == 0) {
					columns.push( {
						text : this.colMaps.get(key),
						dataIndex : key,
						width : colWidth
					});
					panel = {
						xtype : xtype,
						scroll : true,
						selType : 'rowmodel',
						store : this.listStore,
						columns : columns,
						buttons : [ {
							text : '确定',
							hidden : this.saveHidden,
							handler : function() {
								me.fireEvent('saveSelectclick',me,Ext.ComponentQuery.query(xtype, me)[0]);
							}
						}, {
							text : '取消',
							hidden : this.closeHidden,
							handler : function() {
								me.close();
							}
						} ]
					};
				}else{
					var column = {
						text : this.colMaps.get(key),
						dataIndex : key,
						width : colWidth
					};
					if(i==0){
						column.xtype = 'treecolumn';
					}
					columns.push(column);
				}
			}
		}
		if(this.panelType == 1){
			panel = {
				xtype : xtype,
				renderTo: Ext.getBody(),
				rootVisible : false,
				store : this.listStore,
				bodyPadding : 5,
				tbar : [ {
					id : 'queryText',
					xtype : 'textfield',
					fieldLabel : '输入条件',
					labelWidth: 70,
					width : this.width - 70
				}, '-', {
					id : 'queryBtn',
					xtype : 'button',
					text : '查询',
					handler : function() {
						var text = Ext.getCmp('queryText').value;
						if(text==null || text==''){
							Ext.Msg.alert("系统提示", "请输入查询条件！");
							return;
						}
						panel.store.load( {
							params : {
								txt : text
							}
						});
					}
				} ],
				buttons : [ {
					text : '确定',
					hidden : this.saveHidden,
					handler : function() {
						me.fireEvent('saveSelectclick',me,Ext.ComponentQuery.query(xtype, me)[0]);
					}
				}, {
					text : '取消',
					hidden : this.closeHidden,
					handler : function() {
						me.close();
					}
				} ]
			};
			if(columns.length>0){
				panel.columns = columns;
			}
		}
		Ext.applyIf(me, {
			items : [ panel ]
		});
		//注入选择框确定事件至当前窗口
		me.addEvents('saveSelectclick');
		me.callParent(arguments);
	},
	//获取选中行方法定义
	getRawValue : function() {
		var records = this.items.items[0].getSelectionModel().getSelection();
		if (records.length > 0) {
			return records[0];
		}
		return null;
	}
});