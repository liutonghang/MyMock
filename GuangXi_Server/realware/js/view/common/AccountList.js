/***
 * 支付凭证列表视图
 * @memberOf {TypeName} 
 */
Ext.define('pb.view.common.AccountList', {
	extend : 'Ext.panel.Panel',
	alias : 'widget.accountList', //别名
	layout : 'fit',
	frame : true,
	UItitle : '账户列表',
	initComponent : function() {
		this.dockedItems = [ {
			xtype : 'buttongroup', //按钮区
			items:[{
				id : 'addBtn',
				text : '新增',
				iconCls : 'add',
				scale : 'small'
			},{
				id :'editBtn',
				text : '修改',
				iconCls : 'edit',
				scale : 'small'
			},{
				id : 'deleteBtn',
				text : '删除',
				iconCls : 'delete',
				scale : 'small'
			},{
				id : 'inputBtn',
				text : '导入',
				iconCls : 'import',
				hidden : true,
				scale : 'small'
			},{
				id : 'trans',
				text : '挂账',
				iconCls : 'pay',
				hidden : true,
				scale : 'small'
			},{
				id : 'queryBalanceBtn',
				text : '余额查询',
				iconCls : 'log',
				hidden : true,
				scale : 'small'
			}, {
				id : 'refresh',
				text : '刷新',
				iconCls : 'refresh',
				scale : 'small'
			}]	
			}, {
				xtype : 'accountQuery' //查询区
			}
		];
		this.callParent(arguments);
	},

	getCols : function(account_type_code) {
		var cols = [{
				xtype : 'rownumberer',
				width : 30,
				locked : true
		}, {
//			id :'account_name',
			text:'账户名称',
			dataIndex:'account_name',
			name:'account_name',
			width : 130
		}, {
//			id :'account_no',
			text : '账号',
			dataIndex : 'account_no',
			width : 130
		}, {
//			id :'agency_code',
			text:'单位编码',
			dataIndex:'agency_code',
			hidden : Ext.ComUtil.getACVis(account_type_code),
			width : 130
		},{
			text:'单位名称',
			dataIndex:'agency_name',
			hidden : Ext.ComUtil.getACVis(account_type_code),
			width : 130
		},{
//			id :'account_type_code',
			text:'账户类型',
			dataIndex:'account_type_code',
			hidden : Ext.ComUtil.getATCVis(account_type_code),
			width : 130
		},{
//			id :'bank_code',
			text:'网点编码',
			dataIndex:'bank_code',
			width : 130,
			hidden:true
		}, {
//			id :'bank_name',
			text:'网点名称',
			dataIndex:'bank_name',
			width : 130,
			hidden:true
		}, {
//			id :'admdiv_code',
			text : '所属财政',
			dataIndex : 'admdiv_code',
			width : 130,
			renderer : function(value) {
			if(comboAdmdiv) {
				var record = comboAdmdiv.findRecord('admdiv_code',value);
				if(record) {
					return record.get('admdiv_name');
				}
			}
			return value;
			}
		}, {
//			id :'balance',
			text : '账户余额',
			dataIndex : 'balance',
			hidden : account_type_code==12? false: true,
			width : 150
		},  {
//			id :'fund_type_code',
			text : '资金性质编码',
			dataIndex : 'fund_type_code',
			hidden : Ext.ComUtil.getFTCVis(account_type_code),
			width : 150
		},  {
//			id :'fund_type_name',
			text : '资金姓名名称',
			dataIndex : 'fund_type_name',
			hidden : Ext.ComUtil.getFTCVis(account_type_code),
			width : 150
		},  {
//			id :'bank_no',
			text : '清算行行号',
			dataIndex : 'bank_no',
			hidden : account_type_code==4? false: true,
			width : 150
		},  {
//			id :'bank_name',
			text : '清算行名称',
			dataIndex : 'bank_name',
			hidden : account_type_code==4? false: true,
			width : 150
		},  {
//			id :'org_code',
			text : '机构类型',
			dataIndex : 'org_code',
			hidden : account_type_code==4? false: true,
			width : 150
		}, {
//			id :'is_pbc',
			text : '是否人行账户',
			dataIndex : 'is_pbc',
			hidden : account_type_code==4? false: true,
			width : 150
		}, {
//			id :'is_samebank',
			text : '是否同行账户',
			dataIndex : 'is_samebank',
			hidden : account_type_code==4? false: true,
			width : 150
		},{
			text : '创建时间',
			dataIndex : 'create_date',
			width : 100
		}];
		return cols;
	},
	
	
	setBtnVis : function(account_type_code){
		if(account_type_code == 120){
//			Ext.getCmp('inputBtn').setVisible(true);
//			Ext.getCmp('queryBalanceBtn').setVisible(true);
//			Ext.getCmp('trans').setVisible(true);			
		}else if(account_type_code == 12){
			Ext.getCmp('inputBtn').setVisible(true);
			Ext.getCmp('queryBalanceBtn').setVisible(true);
			Ext.getCmp('trans').setVisible(true);			
		}
	}
});
