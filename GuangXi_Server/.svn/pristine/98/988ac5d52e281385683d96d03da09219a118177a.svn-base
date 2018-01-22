/**
 * 支付凭证查询、现金查询菜单
 * 去掉了一些没用的列
 */
function afterCreateViewport(){
	var ViewPanel = Ext.ComponentQuery.query("viewport > panel:first")[0];
	ViewPanel.getCols = function() {
		var cols = [ {
			xtype : 'rownumberer',
			width : 30,
			locked : true
		}, {
			text : '凭证状态',
			dataIndex : 'voucher_status_des',
			width : 130
		}, {
			text : '清算状态',
			dataIndex : 'clear_flag',
			width : 130,
			renderer : function(value){
				if(value == 0){
					return '未清算';
				}
				else if(value == 1){
					return '已清算';
				}
				
			}
		}, {
			text : '凭证号',
			dataIndex : 'pay_voucher_code',
			width : 130
		}, {
			text : '凭证日期',
			dataIndex : 'vou_date',
			width : 100
		},{
			text : '支付日期',
			dataIndex : 'pay_date',
			width : 100
		},{
			text : '退款日期',
			dataIndex : 'pay_refund_date',
			width : 100
		},{
			text : '金额',
			dataIndex : 'pay_amount',
			xtype : 'numbercolumn',
			format : '0,0.00',
			align : 'right',
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
		}, {
			text : '收款行行号',
			dataIndex : 'payee_account_bank_no',
			width : 130
		}, {
			text : '付款人账号',
			dataIndex : 'pay_account_no',
			width : 150
		}, {
			text : '付款人名称',
			dataIndex : 'pay_account_name',
			width : 150
		}, {
			text : '银行结算方式名称',
			dataIndex : 'pb_set_mode_name',
			width : 130
		}, {
			text : '省市代码',
			dataIndex : 'city_code',
			width : 130,
			hidden : true
		}, {
			text : '银行业务',
			dataIndex : 'bankbusinesstype',
			width : 130,
			hidden : true
		}, {
			text : '付款人银行',
			dataIndex : 'pay_account_bank',
			width : 150
		},
		{
			text : '支付方式名称',
			dataIndex : 'pay_type_name',
			width : 130
		},  
		{
			text : '结算方式名称',
			dataIndex : 'set_mode_name',
			width : 130
		}, {
			text : '资金性质编码',
			dataIndex : 'fund_type_code',
			width : 130
		}, {
			text : '资金性质名称',
			dataIndex : 'fund_type_name',
			width : 130
		}, 
		{
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
			text : '预算项目编码',
			dataIndex : 'dep_pro_code',
			width : 130
		}, {
			text : '预算项目名称',
			dataIndex : 'dep_pro_name',
			width : 130
		},{
			text : '功能科目编码',
			dataIndex : 'exp_func_code',
			width : 130
		},{
			text : '支票号',
			dataIndex : 'checkno',
			width : 130
		} ];
		return cols;
	};
}