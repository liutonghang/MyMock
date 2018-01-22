Ext.define('pb.view.pay.PayRequestListWindow', {
	extend : 'Ext.Window',
	layout : 'fit',
	title : '明细查看',
	width : 780,
	height : 400,
	modal : true,
	resizable : false,
	constructor : function(cfg) {
		var me = this;
		cfg = cfg || {};
		var gridpanel = Ext.create('pb.view.common.GridPanel', {
			columns : [ {
				xtype : 'rownumberer',
				width : 30,
				locked : true
			}, {
				text : '明细编号',
				dataIndex : 'pay_request_code',
				width : 130
			}, {
				text : '收款人账号',
				dataIndex : 'payee_account_no',
				width : 130
			}, {
				text : '收款人名称',
				dataIndex : 'payee_account_name',
				width : 130
			}, {
				text : '收款人银行',
				dataIndex : 'payee_account_bank',
				width : 130
			}, {
				text : '支付金额',
				dataIndex : 'pay_amount',
				width : 130,
				xtype : 'numbercolumn',
				format : '0,0.00',
				align : 'right'
			}, {
				text : '备注',
				dataIndex : 'remark',
				width : 130
			}, {
				text : '实际支付日期',
				dataIndex : 'pay_date',
				width : 130
			}, {
				text : '银行交易流水号',
				dataIndex : 'agent_business_no',
				width : 130
			}, {
				text : '资金性质编码',
				dataIndex : 'fund_type_code',
				width : 130
			}, {
				text : '资金性质名称',
				dataIndex : 'fund_type_name',
				width : 130
			}, {
				text : '预算类型编码',
				dataIndex : 'bgt_type_code',
				width : 130
			}, {
				text : '预算类型名称',
				dataIndex : 'bgt_type_name',
				width : 130
			}, {
				text : '支出类型编码',
				dataIndex : 'pay_kind_code',
				width : 130
			}, {
				text : '支出类型名称',
				dataIndex : 'pay_kind_name',
				width : 130
			}, {
				text : '一级预算单位编码',
				dataIndex : 'sup_dep_code',
				width : 130
			}, {
				text : '一级预算单位名称',
				dataIndex : 'sup_dep_name',
				width : 130
			}, {
				text : '基层预算单位编码',
				dataIndex : 'agency_code',
				width : 130
			}, {
				text : '基层预算单位名称',
				dataIndex : 'agency_name',
				width : 130
			}, {
				text : '功能科目编码',
				dataIndex : 'exp_func_code',
				width : 130
			}, {
				text : '功能科目名称',
				dataIndex : 'exp_func_name',
				width : 130
			}, {
				text : '经济分类编码',
				dataIndex : 'exp_eco_code',
				width : 130
			}, {
				text : '经济分类名称',
				dataIndex : 'exp_eco_name',
				width : 130
			}, {
				text : '预算项目编码',
				dataIndex : 'dep_pro_code',
				width : 130
			}, {
				text : '预算项目名称',
				dataIndex : 'dep_pro_name',
				width : 130
			}, {
				text : '预留字段1',
				dataIndex : 'hold1',
				width : 130
			}, {
				text : '预留字段2',
				dataIndex : 'hold2',
				width : 130
			}, {
				text : '预留字段3',
				dataIndex : 'hold3',
				width : 130
			}, {
				text : '预留字段4',
				dataIndex : 'hold4',
				width : 130
			} ],
			store : cfg.dataStore,
			pageCfg : true
		});
		me.items = [ gridpanel ];
		gridpanel.on('itemclick',function(thiz, record, item, index, e, eOpts) {
					me.itemDoubleclick(thiz, record);
				});
		this.createBtns();
		this.callParent(arguments);
	},
	createBtns : function() {
		var me = this;
		this.bbar = [ '->', {
			text : '退出',
			iconCls : 'close',
			handler : function() {
				me.close();
			}
		} ];
	},
	itemDoubleclick : function(grid, record) {
	}
});
