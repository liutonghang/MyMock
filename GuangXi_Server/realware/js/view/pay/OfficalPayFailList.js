/*******************************************************************************
 * 公务卡开户行退票列表视图
 * 
 * @memberOf {TypeName}
 */
Ext.define('pb.view.pay.OfficalPayFailList', {
	extend : 'Ext.panel.Panel',
	alias : 'widget.officalPayFailList',
	layout : 'border',
	minHeight : 300,
	frame : true,
	renderTo : Ext.getBody(),
	items : [ {// 上方凭证列表
				region : 'north',
				layout : 'fit',
				id : 'officalPayFailLeftPanel',
				height : 300,
				xtype : 'officalPayFailLeftPanel',
				title : '凭证列表',
				collapsible : true,
				store : 'pay.PayVouchers'
			}, {// 下方明细单列表
						region : 'center',
						layout : 'fit',
						id : 'officalPayFailRightPanel',
						xtype : 'gridpanel',
						title : '明细列表',
						columns : [{
									xtype : 'rownumberer',
									width : 30,
									locked : true
								}, {
									text : '明细id',
									dataIndex : 'pay_request_id',
									width : 100,
									hidden : true
								}, {
									text : '退款金额',
									dataIndex : 'pay_amount',
									xtype : 'numbercolumn',
									renderer : Ext.util.Format.numberRenderer('0,0.00'),
									align : 'right',
									width : 100
								}, {
									text : '退款原因',
									dataIndex : 'add_word',
									width : 150
								}, {
									text : '付款人账号',
									dataIndex : 'pay_account_no',
									width : 150
								}, {
									text : '付款人名称',
									dataIndex : 'pay_account_name',
									width : 100
								}, {
									text : '付款人银行',
									dataIndex : 'pay_account_bank',
									width : 100
								}, {
									text : '收款人账号',
									dataIndex : 'payee_account_no',
									width : 150
								}, {
									text : '收款人名称',
									dataIndex : 'payee_account_name',
									width : 150
								}, {
									text : '收款人银行',
									dataIndex : 'payee_account_bank',
									width : 150
								}],
						pageSize : 25,
						selModel : Ext.create('Ext.selection.CheckboxModel', { // 多选
							checkOnly : true
						}),
						bbar : Ext.PageUtil.pagingTool(new Ext.create('pb.store.pay.PayRequests')), 
						store : 'pay.PayRequests'
					}],
	initComponent : function() {
		this.dockedItems = [ {
			xtype : 'buttongroup', // 按钮区
			items : [ {
						id : 'create',
						text : '退款生成',
						iconCls : 'edit',
						scale : 'small',
						hidden : true
					}, {
						id : 'firTransfer',
						text : '转零余额',
						iconCls : 'audit',
						scale : 'small',
						hidden : true
					}, {
						id : 'secTransfer',
						text : '退款归集',
						iconCls : 'audit',
						scale : 'small',
						hidden : true
					}, {
						id : 'signSend',
						text : '签章发送',
						iconCls : 'enabled',
						scale : 'small',
						hidden : true
					}, {
						id : 'resend',
						text : '重新发送',
						iconCls : 'enabled',
						scale : 'small',
						hidden : true
					}, {
						id : 'refresh',
						text : '查询',
						iconCls : 'refresh',
						scale : 'small',
						hidden : true
					}]
		}, {
			// 查询区
				xtype : queryViewAliasName
			} ];
		this.callParent(arguments);
	}
});