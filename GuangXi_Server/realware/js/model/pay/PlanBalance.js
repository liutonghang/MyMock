/***
 * 计划额度模型
 */
Ext.define('pb.model.pay.PlanBalance', {
	extend : 'Ext.data.Model',
	fields : [ {
		name : 'plan_id',
		type : 'int'
	}, {
		name : 'budget_id',
		type : 'string'
	}, {
		name : 'plan_amount',
		type : 'double'
	}, {
		name : 'add_pay_amount',
		type : 'double'
	}, {
		name : 'balance_amount',
		type : 'double'
	},{
		name : 'accept_pay_amount',
		type : 'double'
	}, {
		name : 'clear_pay_amount',
		type : 'double'
	}, {
		name : 'agency_code',
		type : 'string'
	},{
		name : 'agency_name',
		type : 'string'
	},{
		name : 'exp_func_name',
		type : 'string'
	},{
		name : 'exp_func_code',
		type : 'string'
	},{
		name : 'fund_type_code',
		type : 'string'
	},{
		name : 'fund_type_name',
		type : 'string'
	},{
		name : 'pay_type_name',
		type : 'string'
	},{
		name : 'pay_type_code',
		type : 'string'
	},{
		name : 'admdiv_code',
		type : 'string'
	},{
		name : 'ele_str',
		type : 'string'
	},{
		name : 'year',
		type : 'int'
	},{
		name : 'plan_month1_amount',
		type : 'double'
	},{
		name : 'plan_month2_amount',
		type : 'double'
	},{
		name : 'plan_month3_amount',
		type : 'double'
	},{
		name : 'plan_month4_amount',
		type : 'double'
	},{
		name : 'plan_month5_amount',
		type : 'double'
	},{
		name : 'plan_month6_amount',
		type : 'double'
	},{
		name : 'plan_month7_amount',
		type : 'double'
	},{
		name : 'plan_month8_amount',
		type : 'double'
	},{
		name : 'plan_month9_amount',
		type : 'double'
	},{
		name : 'plan_month10_amount',
		type : 'double'
	},{
		name : 'plan_month11_amount',
		type : 'double'
	},{
		name : 'plan_month12_amount',
		type : 'double'
	}]
});
