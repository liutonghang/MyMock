/***
 * 可编辑的列表视图 包含按钮【新增】【删除】【上移】【下移】可设置是否可见
 * @param {Object} grid
 * @memberOf {TypeName} 
 */
Ext.define('pb.view.common.EditGridPanel', {
	extend : 'Ext.grid.Panel',
	alias : 'widget.editgrid',
	layout : 'fit',
	plugins : Ext.create('Ext.grid.plugin.RowEditing', {
		clicksToEdit : 2,
		saveBtnText : '保存',
		cancelBtnText : '取消',
		errorsText : '错误',
		cancelEdit : function(grid) {
			var me = this;
			if (me.editing) {
				me.getEditor().cancelEdit();
			}
		}
	}),
	addHidden : false,
	delHidden : false,
	topHidden : false,
	lowHidden : false,
	selType : 'rowmodel',
	initComponent : function() {
		var me = this;
		me.tbar = [ {
			xtype : 'buttongroup',
			items : [ {
				text : '新增',
				hidden : this.addHidden,
				handler : function() {
					var grid = this.up('grid');
					grid.getStore().add( {});
					grid.editingPlugin.startEdit(grid.getStore().data.length - 1, 0);
				}
			}, {
				name : 'del',
				text : '删除',
				hidden : this.delHidden,
				handler : function() {
					var grid = this.up('grid');
					var records = grid.getSelectionModel().getSelection();
					if (records.length == 0) {
						Ext.Msg.alert("系统提示", "请先选中行再删除！");
						return;
					}
					grid.getStore().remove(records);
				}
			}, {
				name : 'top',
				text : '上移',
				hidden : this.topHidden,
				handler : function() {
					var grid = this.up('grid');
					var records = grid.getSelectionModel().getSelection();
					if (records.length == 0) {
						Ext.Msg.alert("系统提示", "请先选中行再上移！");
						return;
					}
					var index = grid.getStore().indexOf(records[0]);
					if (index > 0) {
						grid.getStore().removeAt(index);
						grid.getStore().insert(index - 1, records[0]);
						grid.getSelectionModel().select(index - 1);
					}
				}
			}, {
				name : 'low',
				text : '下移',
				hidden : this.lowHidden,
				handler : function() {
					var grid = this.up('grid');
					var store = grid.getStore();
					var records = grid.getSelectionModel().getSelection();
					if (records.length == 0) {
						Ext.Msg.alert("系统提示", "请先选中行再进行下移！");
						return;
					}
					var index = store.indexOf(records[0]);
					if (index < store.getCount() - 1) {
						store.removeAt(index);
						store.insert(index + 1, records);
						grid.getSelectionModel().select(index + 1);
					}
				}
			} ]
		} ];
		me.callParent(arguments);
	}
});