/***
 * 参数维护
 */
Ext.define('pb.model.common.PbPayUpperLimitDTO', {
	extend : 'Ext.data.Model',
	fields : [ {
		name : 'upperlimit_control_type',
		type : 'int'
	}, {
		name : 'control_point',
		type : 'string'
	}, {
		name : 'pay_upperlimit_id',
		type : 'int'
	}, {
		name : 'bank_id',
		type : 'int'
	}, {
		name : 'user_type',
		type : 'int'
	}, {
		name : 'commonpay_amount',
		type : 'double'
	}, {
		name : 'cashpay_amount',
		type : 'double'
	}, {
		name : 'sanebank_amount',
		type : 'double'
	}, {
		name : 'set_mode_code',
		type : 'int'
	}]
});
