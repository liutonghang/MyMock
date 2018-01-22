/***
 * 汇划编号数据集
 */
Ext.define('pb.store.pay.GiroNos', {
	extend : 'Ext.data.Store',
	fields : [{
		name : 'pay_entrust_date'
	}, {
		name : 'pay_dictate_no'
	}, {
		name : "pay_msg_no"
	}],
	proxy : {
		type : 'ajax',
		url : '/realware/loadGiroNo.do',
		reader : {
			type : 'json'
		}
	},
	autoSync : true,
	autoLoad : false
});