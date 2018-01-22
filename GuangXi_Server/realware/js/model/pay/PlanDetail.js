/***
 * 计划明细模型
 */
Ext.define('pb.model.pay.PlanDetail', {
	extend : 'Ext.data.Model',
	fields : [ {
		name : 'plan_detail_id',
		type : 'int'
	}, {
		name : 'plan_detail_code',
		type : 'string'
	}, {
		name : 'plan_recorded_note_id',
		type : 'int'
	}, {
		name : 'plan_recorded_note_code',
		type : 'String'
	}, {
		name : 'plan_agent_note_id',
		type : 'int'
	}, {
		name : 'plan_agent_note_code',
		type : 'String'
	}, {
		name : 'ori_plan_agent_note_id',
		type : 'string'
	},{
		name : 'budget_id',
		type : 'int'
	},{
		name : 'plan_id',
		type : 'int'
	},{
		name : 'plan_amount',
		type : 'double'
	},{
		name : 'plan_advice_amount',
		type : 'double'
	},{
		name : 'input_amount',
		type : 'double'
	},{
		name : 'admdiv_code',
		type : 'string'
	},{
		name : 'plan_replied_amount',
		type : 'double'
	},{
		name : 'plan_month',
		type : 'int'
	},{
		name : 'mon_flag',
		type : 'int'
	},{
		name : 'mon_id',
		type : 'int'
	},{
		name : 'acctprop',
		type : 'String'
	},{
		name : 'plan_clear_note_id',
		type : 'int'
	},{
		name : 'seqno',
		type : 'int'
	},{
		name : 'vou_idplan_agent_note',
		type : 'String'
	}, {
		name : 'bgt_type_id',
		type : 'int'
	}, {
		name : 'bgt_type_code',
		type : 'string'
	}, {
		name : 'bgt_type_name',
		type : 'string'
	}, {
		name : 'fund_type_id',
		type : 'int'
	}, {
		name : 'fund_type_code',
		type : 'string'
	}, {
		name : 'fund_type_name',
		type : 'string'
	}, {
		name : 'pay_bank_code',
		type : 'string'
	}, {
		name : 'pay_account_code',
		type : 'string'
	}, {
		name : 'pay_account_name',
		type : 'string'
	}, {
		name : 'pay_account_bank',
		type : 'string'
	}, {
		name : 'str_voucher_id',
		type : 'string'
	}, {
		name : 'pay_type_id',
		type : 'int'
	}, {
		name : 'pay_type_code',
		type : 'string'
	}, {
		name : 'pay_type_name',
		type : 'string'
	}, {
		name : 'agency_id',
		type : 'int'
	}, {
		name : 'agency_code',
		type : 'string'
	}, {
		name : 'agency_name',
		type : 'string'
	}, {
		name : 'sup_dep_id',
		type : 'int'
	}, {
		name : 'sup_dep_code',
		type : 'string'
	}, {
		name : 'sup_dep_name',
		type : 'string'
	}, {
		name : 'exp_func_id',
		type : 'int'
	}, {
		name : 'exp_func_code',
		type : 'string'
	}, {
		name : 'exp_func_name',
		type : 'string'
	}, {
		name : 'exp_func_code1',
		type : 'string'
	}, {
		name : 'exp_func_name1',
		type : 'string'
	}, {
		name : 'exp_func_code2',
		type : 'string'
	}, {
		name : 'exp_func_name2',
		type : 'string'
	}, {
		name : 'exp_func_code3',
		type : 'string'
	}, {
		name : 'exp_func_name3',
		type : 'string'
	}, {
		name : 'exp_eco_code',
		type : 'string'
	}, {
		name : 'exp_eco_name',
		type : 'string'
	}, {
		name : 'exp_eco_code1',
		type : 'string'
	}, {
		name : 'exp_eco_name1',
		type : 'string'
	}, {
		name : 'exp_eco_code2',
		type : 'string'
	}, {
		name : 'exp_eco_name2',
		type : 'string'
	}, {
		name : 'pro_cat_code',
		type : 'string'
	}, {
		name : 'pro_cat_name',
		type : 'string'
	}, {
		name : 'dep_pro_id',
		type : 'int'
	}, {
		name : 'dep_pro_code',
		type : 'string'
	}, {
		name : 'dep_pro_name',
		type : 'string'
	}, {
		name : 'remark',
		type : 'string'
	}, {
		name : 'hold1',
		type : 'string'
	}, {
		name : 'hold2',
		type : 'string'
	} ]
});
