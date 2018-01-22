/**
 * 便于后台debug，设置超时时间
 */
Ext.Ajax.timeout=90000;
Ext.onReady(function() {
	Ext.QuickTips.init();
	if("undefined" == typeof accountTypes) {
		accountTypes = [];
	} else {
		accountTypes = accountTypes || [];
	}
	
	Ext.QuickTips.init();
	if("undefined" == typeof hidColumns) {
		hidColumns = [];
	} else {
		hidColumns = hidColumns || [];
	}
	
	if("undefined" == typeof accountTypeDict) {
		accountTypeDict = false;
	}	
	Ext.create('Ext.Viewport', {
		layout : 'fit',
		items : [{
			xtype : 'panel',
			layout : 'border',
			items : [{
				xtype : 'buttongroup',
				region : 'north',
				items : [{
					id : 'addBtn',
					text : '新增',
					iconCls : 'add',
					scale : 'small',
					handler : function() {
						
						getMainGrid().openAddWin(accountTypes[0], hidColumns);
					}
				}, {
					id : 'editBtn',
					text : '修改',
					iconCls : 'edit',
					scale : 'small',
					handler : function() {
						var grid = getMainGrid();
						var records = grid.getSelections();
						if (!records) {
							return;
						}
						if(records.length != 1){
							Ext.Msg.alert("系统提示","请选择一条数据！");
							return;
						}
						grid.openEditWin(records[0].get("account_id"), hidColumns);
					}
				}, {
					id : 'deleteBtn',
					text : '删除',
					iconCls : 'delete',
					scale : 'small',
					handler : function() {
						getMainGrid().delAccounts();
					}
				}, {
					id : 'queryBalanceBtn',
					text : '余额查询',
					iconCls : 'log',
					hidden:false,
					scale : 'small',
					handler : function() {
						queryBalanceForm(getMainGrid());
					}
				},{
					id : 'refreshBtn',
					text : '刷新',
					iconCls : 'refresh',
					scale : 'small',
					handler : function() {
						refreshData();
					}
				}]
			}, {
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
				items : [{
						id : 'admdivCom',
						fieldLabel : '所属财政',
						xtype : 'combo',
						dataIndex : 'admdiv_code',
						displayField : 'admdiv_name',
						emptyText : '请选择',
						valueField : 'admdiv_code',
						labelWidth : 60,
						width : 200,
						editable : false,
						store : comboAdmdiv,
						listeners : {
							'change' : function() {
								getMainGrid().getStore().load();
							}
						}
					}, {
						fieldLabel : '账户名称',
						xtype : 'textfield',
						dataIndex : 'account_name',
						symbol : 'like',
						labelWidth : 60
					}, {
						fieldLabel : '账号',
						xtype : 'textfield',
						dataIndex : 'account_no',
						symbol : 'like',
						labelWidth : 30
					}]
			},{
				region : 'center',
				id : 'gridpanel',
				xtype : 'AccountGrid',
				hidColumns : hidColumns,
				accountTypes : accountTypeDict,
				admdivs : comboAdmdiv,
				beforeload : function(thiz, options) {
					var admdiv = Ext.getCmp('admdivCom').getValue();
					if ("" == admdiv || null == admdiv)
						return;
					beforeload(Ext.getCmp("queryPanel"), options, Ext.encode(getMainGrid().getListFields()));
					var jsonMap = Ext.decode(options.params["jsonMap"]);
					jsonMap.push({account_type_code : ["in", "('" + accountTypes.join("','") + "')", "number"]});
					options.params["jsonMap"] = Ext.encode(jsonMap);
				}
			}]
		}]
	});
	if(comboAdmdiv.count() > 0) {
		Ext.getCmp("admdivCom").setValue(comboAdmdiv.getAt(0).get("admdiv_code"))
	}
});

function getMainGrid() {
	return Ext.getCmp("gridpanel");
}

function refreshData() {
	var grid = getMainGrid();
	grid.getStore().loadPage(1);
}