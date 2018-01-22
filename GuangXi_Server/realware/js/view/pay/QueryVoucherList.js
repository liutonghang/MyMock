/***
 * 支付凭证查询
 * @memberOf {TypeName} 
 */
Ext.define('pb.view.pay.QueryVoucherList',{
					extend : 'pb.view.pay.PayVoucherPanel',
					alias : 'widget.queryVoucherList',
					layout : 'fit',
					frame : false,
					UItitle : '支付凭证列表',
					hiddenstate : true,//当前状态是否可见
					hiddenvoustatus : false, //凭证状态是否可见
					hiddensendbutton : false, //发送按钮是否可见
					valuename : '',
					initComponent : function() {
						this.dockedItems = [
								{
									id : 'payVoucherQuery',
									title : '查询区',
									collapsible : true,
									layout : {
										type : 'table',
										columns : 4
									},
									defaults: { 
    									style : 'margin-left:5px;margin-right:5px;'
									},
									bodyPadding : 5,
									items : [ {
												id : 'taskState',
												fieldLabel : '当前状态',
												xtype : 'combo',
												displayField : 'status_name',
												emptyText : '请选择',
												dataIndex : 'task_status',
												valueField : 'status_code',
												editable : false,
												queryMode: 'local', 
												hidden : this.hiddenstate,
												value : this.valuename
											},{
												id : 'admdivCode',
												fieldLabel : '所属财政',
												xtype : 'combo',
												dataIndex : 'admdiv_code',
												displayField : 'admdiv_name',
												emptyText : '请选择',
												valueField : 'admdiv_code',
												editable : false,
												store : comboAdmdiv
											}, (this.hiddenstateCash ===  false ? {
												id : 'taskStateCash',
												fieldLabel : '凭证状态',
												xtype : 'combo',
												displayField : 'status_name_cash',
												emptyText : '请选择',
												valueField : 'status_code_cash',
												dataIndex : 'voucher_status',
												editable : false,
												queryMode: 'local', 
												store : menuStatusCash,
												hidden : this.hiddenstateCash,
												value : this.valuenameCash
											} : null),{
												fieldLabel : '凭证号',
												xtype : 'textfield',
												symbol : '>=',
												dataIndex : 'pay_voucher_code'
											},{
												fieldLabel : '至',
												xtype : 'textfield',
												symbol : '<=',
												dataIndex : ' pay_voucher_code'
											},{
												id : 'txtPayAcctNo',
												fieldLabel : '付款人账号',
												xtype : 'textfield',
												dataIndex : 'pay_account_no',
												symbol : 'like'
											},{
												id : 'txtPayeeAcctNo',
												fieldLabel : '收款人账号',
												xtype : 'textfield',
												dataIndex : 'payee_account_no',
												symbol : 'like'
											},{
												fieldLabel : '凭证日期',
												xtype : 'datefield',
												dataIndex : 'vou_date',
												format : 'Ymd'
											},{
												id : 'amount',
												fieldLabel : '&nbsp;&nbsp;金额',
												xtype : 'numberfield',
												dataIndex : 'pay_amount',
												symbol : '=',
												datatype : 1,
												fieldStyle : 'text-align: right;'  ,   //文本框里显示内容右对齐
												decimalPrecision: 2  //小数精确位数
												
											},{
												id : 'payDate',
												fieldLabel : '支付日期',
												xtype : 'datefield',
												symbol : '=',
												format : 'Y-m-d',
												dataIndex : 'pay_date',
												data_type:'date',
												datatype : 2,
												date_format:'yyyy-MM-dd'
											},{
												id : 'exp_func_code',
												fieldLabel : '功能科目编码',
												xtype : 'textfield',
												dataIndex : 'exp_func_code',
												symbol : '='
											},{
												id : 'pay_clear_voucher_code',
												fieldLabel : '划款单号',
												xtype : 'textfield',
												dataIndex : 'pay_clear_voucher_code',
												symbol : '='
											},{
												id : 'is_self_counter',
												fieldLabel : '业务标识',
												xtype : 'combo',
												dataIndex : 'is_self_counter',
												displayField : 'name',
												emptyText : '请选择',
												valueField : 'code',
												editable : false,
												datatype : 1,
												store : comboBisType
											}]
								} ];
						this.callParent(arguments);
					},
					getCols : function() {
						var cols = [ {
							xtype : 'rownumberer',
							width : 30,
							locked : true
						}, {
							text : '凭证状态',
							dataIndex : 'voucher_status_des',
							width : 130,
							renderer : function(value){
								if(null != value){
									value = value.replace("对方", "财政");
									value = value.replace("本方", "银行");
									    if(value=="未发送"){
									    		value = "未发送到财政";
									    }								
								}
								return value;
							}
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
							width : 100,
							summaryType : 'sum',
							summaryRenderer : function(value, summaryData, dataIndex) {
								return value=='0.00'?'': '小计:' + Ext.util.Format.number(value,'0,0.00');
							}
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
							dataIndex : 'ori_payee_account_bank',
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
							width : 130
						}, {
							text : '支付类型名称',
							dataIndex : 'pay_mgr_name',
							width : 130
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
							dataIndex : 'checkNo',
							width : 130
						} ];
						return cols;
					}
				});
var comboBisType = Ext.create('Ext.data.Store', {
							fields : ['name', 'code'],
							data : [{
										"name" : "柜面",
										"code" : 0
									}, {
										"name" : "自助柜面",
										"code" : 1
									}]
							});
