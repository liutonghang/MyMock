/**
 * 便于后台debug，设置超时时间
 */
Ext.Ajax.timeout = 90000;
Ext.onReady(function() {
	Ext.QuickTips.init();

	if ("undefined" == typeof hidColumns) {
		hidColumns = [];
	} else {
		hidColumns = hidColumns || [];
	}

	Ext.create('Ext.Viewport', {
		layout : 'fit',
		items : [ {
			xtype : 'panel',
			layout : 'border',
			items : [
					{
						xtype : 'buttongroup',
						region : 'north',
						items : [ {
							id : 'addBtn',
							text : '新增',
							iconCls : 'add',
							scale : 'small',
							handler : function() {
								getMainGrid().openAddWin(bank_no, hidColumns);
							}
						}, {
							id : 'editBtn',
							text : '修改',
							iconCls : 'edit',
							scale : 'small',
							hidden : false,
							handler : function() {
								var grid = getMainGrid();
								var records = grid.getSelections();
								if (!records) {
									return;
								}
								if (records.length != 1) {
									Ext.Msg.alert("系统提示", "请选择一条数据！");
									return;
								}
								grid.openEditWin(records[0], hidColumns);
							}
						}, {
							id : 'deleteBtn',
							text : '删除',
							iconCls : 'delete',
							scale : 'small',
							handler : function() {
								getMainGrid().delbankNos();
							}
						}, {
							id : 'importBtn',
							text : '导入',
							iconCls : 'import',
							hidden : false,
							scale : 'small',
							handler : function() {
								importBankNo();
							}
						}, {
							id : 'exportBtn',
							text : '导出',
							iconCls : 'export',
							hidden : false,
							scale : 'small',
							handler : function() {
								exportBankNo();
							}
						}, {
							id : 'refreshBtn',
							text : '查询',
							iconCls : 'refresh',
							scale : 'small',
							handler : function() {
								refreshData();
							}
						} ]
					},
					{
						xtype : 'panel',
						region : 'north',
						bodyPadding : 8,
						layout : {
							type : 'table',
							columns : 4
						},
						id : 'queryPanel',
						defaults : {
							padding : '3 10 0 0'
						},
						items : [ {
							fieldLabel : '行号',
							xtype : 'textfield',
							id : 'bank_no',
							dataIndex : 'bank_no',
							symbol : 'like',
							labelWidth : 30
						}, {
							fieldLabel : '银行名称',
							xtype : 'textfield',
							id : 'bank_name',
							dataIndex : 'bank_name',
							symbol : 'like',
							labelWidth : 60
						} ]
					},
					{
						region : 'center',
						id : 'gridpanel',
						xtype : 'BankNoGrid',
						hidColumns : hidColumns,
						beforeload : function(thiz, options) {
							beforeload(Ext.getCmp("queryPanel"), options, Ext
									.encode(getMainGrid().getListFields()));
						}
					} ]
		} ]
	});

});

function importBankNo() {
	var me = this;
	var importwindow = Ext.create('pb.view.common.ImportFileWindow');
	importwindow.init("/realware/importBankNo.do",me,"zip");
	importwindow.show();
}

function exportBankNo() {
	window.location.href = exportUrl;
}

function getMainGrid() {
	return Ext.getCmp("gridpanel");
}

function refreshData() {
	var grid = getMainGrid();
	grid.getStore().loadPage(1);
}