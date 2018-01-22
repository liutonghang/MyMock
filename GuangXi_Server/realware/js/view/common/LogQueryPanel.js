/***
 * 日志查询界面布局
 * @memberOf {TypeName} 
 */
Ext.define('pb.view.common.LogQueryPanel', {
	extend : 'Ext.panel.Panel',
	alias : 'widget.logQueryPanel',
	layout : 'fit',
	items : [ {
		xtype : 'pbgrid',
		title : '列表信息',
		columns : [ {
			xtype : 'rownumberer',
			width : 30,
			locked : true
		}, {
			text : '操作用户',
			dataIndex : 'taskUserName',
			width : 200
		}, {
			text : '柜员号',
			dataIndex : 'user_code',
			width : 200
		}, {
			text : '客户端ip',
			dataIndex : 'ip',
			width : 200
		}, {
			text : '操作时间',
			dataIndex : 'end_date',
			width : 200
		}, {
			text : '备注',
			dataIndex : 'taskOpinion',
			width : 250
		}, {
			id : 'node_name',
			text : '功能菜单',
			dataIndex : 'node_name',
			width : 250
		}, {
			text : '操作对象编码',
			dataIndex : 'voucher_no',
			width : 200
		} ],
		store : 'common.LogQuerys',
		pageCfg : true
	} ],
	initComponent : function() {
		this.dockedItems = [ {
			xtype : 'buttongroup',
			items : [ {
				id : 'refresh',
				text : '查询',
				iconCls : 'refresh',
				scale : 'small'
			} ]
		}, {
			id : 'queryPanel',
			layout : {
				type : 'table',
				columns : 4
			},
			bodyPadding : 5,
			title : '查询区',
			defaults : {
				style : 'margin-left:10px;margin-right:10px;'
			},
			items : [ {
				id : 'datastatus',
				fieldLabel : '日志种类',
				xtype : 'combo',
				value : 0,
				datatype : 1,
				displayField : 'name',
				valueField : 'id',
				editable : false,
				store : new Ext.data.Store( {
					fields : [ {
						name : 'id'
					}, {
						name : 'name'
					} ],
					data : [ {
						id : 0,
						name : '全部'
					}, {
						id : 2,
						name : '业务操作日志'
					}, {
						id : 3,
						name : '用户登录日志'
					}, {
						id : 4,
						name : '账户维护日志'
					}, {
						id : 5,
						name : '网点维护日志'
					}, {
						id : 6,
						name : '用户维护日志'
					}, {
						id : 7,
						name : '财政维护日志'
//					},{
//						id : 11,
//						name : '其它'
					}]
				})
			}, {
				fieldLabel : '操作日期',
				xtype : 'datefield',
				dataIndex : "to_char(end_date,'yyyy-MM-dd')",
				format : 'Y-m-d',
				symbol : '>=',
				data_type : 'date',
//				value : Ext.Date.format(new Date(), 'Y-m-d')
				value :new Date()
			}, {
				fieldLabel : '&nbsp&nbsp&nbsp&nbsp&nbsp至',
				xtype : 'datefield',
				dataIndex : "to_char(end_date,'yyyy-MM-dd')",
				format : 'Y-m-d',
				symbol : '<=',
				data_type : 'date'
			}, {
				fieldLabel : '柜员号',
				xtype : 'textfield',
				dataIndex : 'user_code'
			}, {
				fieldLabel : '操作对象编码',
				xtype : 'textfield',
				dataIndex : 'voucher_no'
			} ]
		} ];
		this.callParent(arguments);
	}
})
