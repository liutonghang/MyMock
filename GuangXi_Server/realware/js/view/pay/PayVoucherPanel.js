/***
 * 支付凭证面板
 * @memberOf {TypeName} 
 */
Ext.define('pb.view.pay.PayVoucherPanel', {
	extend : 'Ext.panel.Panel',
	alias : 'widget.payPanel',
	layout: {
        type: 'vbox',
        align: 'center'
    },
    shrinkWrap : 0,
	frame : false,
	initComponent : function() {
		var buttons = Ext.StatusUtil.getAllButtons(this.config.buttonList);
		this.UItitle = this.config.name;
		this.dockedItems = [{
			xtype : 'buttongroup', //按钮区
			items : buttons
			}].concat(this.dockedItems);
		this.callParent(arguments);
	},
	getCols : function() {
		var cols = [ {
			xtype : 'rownumberer',
			width : 30,
			locked : true
		}, {
			text : '加急标志',
			dataIndex : 'urgent_flag',
			width : 130,
			hidden : true
		},{
			xtype : 'actioncolumn',
			dataIndex : 'actionBankno',
			text : '补录行号',
			items : [ {
				icon : '/realware/resources/images/add.png',
				tooltip : '补录行号'
			} ],
			width : 100,
			hidden : true
		}, {
			text : '退回原因',
			dataIndex : 'return_reason',
			width : 130,
			hidden : true
		}, {
			text : '收款行行号',
			dataIndex : 'payee_account_bank_no',
			width : 130
		}, {
			text : '附言',
			dataIndex : 'add_word',
			width : 130
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
			text : '凭证号',
			dataIndex : 'pay_voucher_code',
			width : 130
		},{
			text : '凭证状态',
			dataIndex : 'voucher_status_des',
			width : 130
		},{
			text : '凭证日期',
			dataIndex : 'vou_date',
			width : 100
		}, {
			text : '金额',
			dataIndex : 'pay_amount',
			xtype : 'numbercolumn',
			format : '0,0.00',
			align : 'right',
			width : 100,
			summaryType : 'sum',
			summaryRenderer : function(value, summaryData, dataIndex) {
				return value=='0.00'?'': '小计:' + Ext.util.Format.number(value,'0,0.00');
			}
		}, {
			text : '收款人银行',
            dataIndex : 'payee_account_bank',
            width : 160
        }, {
        	text : '原收款人银行',
            dataIndex : 'ori_payee_account_bank',
            width : 150
        }, {
			text : '收款人账号',
			dataIndex : 'payee_account_no',
			width : 150
		}, {
			text : '收款人名称',
			dataIndex : 'payee_account_name',
			width : 150
		}, {
			text : '付款人账号',
			dataIndex : 'pay_account_no',
			width : 150
		}, {
			text : '付款人名称',
			dataIndex : 'pay_account_name',
			width : 150
		}, {
			text : '付款人银行',
			dataIndex : 'pay_account_bank',
			width : 150
		}, {
			text : '代理银行编码',
			dataIndex : 'pay_bank_code',
			width : 150
		}, {
			text : '代理银行名称',
			dataIndex : 'pay_bank_name',
			width : 150
		}, {
			text : '清算银行编码',
			dataIndex : 'clear_bank_code',
			width : 150
		}, {
			text : '清算银行名称',
			dataIndex : 'clear_bank_name',
			width : 150
		}, {
			text : '支付方式编码',
			dataIndex : 'pay_type_code',
			width : 130
		}, {
			text : '支付方式名称',
			dataIndex : 'pay_type_name',
			width : 130
		}, {
			text : '结算方式编码',
			dataIndex : 'set_mode_code',
			width : 130
		}, {
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
		}, {
			text : '支付类型编码',
			dataIndex : 'pay_mgr_code',
			width : 130,
			hidden : true
		}, {
			text : '支付类型名称',
			dataIndex : 'pay_mgr_name',
			width : 130,
			hidden : true
		}, {
			text : '用途编码',
			dataIndex : 'pay_summary_code',
			width : 150
		}, {
			text : '用途名称',
			dataIndex : 'pay_summary_name',
			width : 200
		}, {
			text : '收支管理编码',
			dataIndex : 'pro_cat_code',
			width : 130
		}, {
			text : '收支管理名称',
			dataIndex : 'pro_cat_name',
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
			text : '功能分类编码',
			dataIndex : 'exp_func_code',
			width : 130
		}, {
			text : '功能分类名称',
			dataIndex : 'exp_func_name',
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
			text : '核心主机流水号',
			dataIndex : 'accthost_seqid',
			width : 130
		},{
			text : '申报完税凭证号',
			dataIndex : 'tax_bill_no',
			width : 130
		}, {
			text : '纳税人识别号',
			dataIndex : 'taxayer_id',
			width : 130
		}, {
			text : '税务征收机关代码',
			dataIndex : 'tax_org_code',
			width : 130
		},{
			text : '备注',
			dataIndex : 'remark',
			width : 130
		}, {
			text : '支票号',
			dataIndex : 'checkNo',
			width : 130
		},{
			text : '失败原因',
			dataIndex : 'trans_res_msg',
			width : 130
		},{
			text : '是否同行',
			dataIndex : 'is_same_bank',
			width : 130,
			hidden : true
		}];
		return cols;
	}
});
