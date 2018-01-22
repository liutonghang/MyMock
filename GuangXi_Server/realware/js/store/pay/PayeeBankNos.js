/***
 * 收款行行号数据集
 */
Ext.define('pb.store.pay.PayeeBankNos', {
	extend : 'Ext.data.Store',
	fields : [{
		name : 'bank_name'
	}, {
		name : 'bank_no'
	}, {
		name : "match_ratio"
	}, {
		name : "like_ratio"
	}],
	proxy : {
		actionMethods : {
			read : 'POST'
		},
		type : 'ajax',
		url : '/realware/loadBanknos.do',
		reader : {
			type : 'json'
		}
	},
	autoSync : true,
	autoLoad : false
});