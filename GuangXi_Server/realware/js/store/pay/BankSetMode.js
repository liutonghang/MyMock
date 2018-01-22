/***
 * 银行结算方式数据集
 */
Ext.define('pb.store.pay.BankSetMode', {
	extend : 'Ext.data.Store',
	fields : [{
		name : 'name'
	}, {
		name : 'value'
	}],
	proxy : {
		type : 'ajax',
		actionMethods : {
			read : 'POST'
		},
		url : '/realware/loadbanksetmode.do',
		reader : {
			type : 'json'
		}
	},
	autoSync : true,
	autoLoad : true
});