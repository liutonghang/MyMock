/***
 * 公务卡模型
 */
Ext.define('pb.model.pay.OfficalCardModel', {
	extend : 'Ext.data.Model',
	fields : [ {
		name : 'card_holder',  //持卡人姓名
		type : 'String'
	}, {
		name : 'card_holder_no',  // 持卡人身份证号
		type : 'string'
	}, {
		name : 'card_type',  //卡类型
		type : 'string'
	}, {
		name : 'card_status', //卡状态
		type : 'string'
	},{
		name : 'card_bank_name', //卡状态
		type : 'string'
	},{
		name : 'card_holder_rank', //卡状态
		type : 'string'
	},{
		name : 'card_no', //卡状态
		type : 'string'
	},{
		name : 'agency_name', //卡状态
		type : 'string'
	}]
});
