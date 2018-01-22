/***
 * 资金性质数据集合
 */
Ext.define('pb.store.pay.AbisAccountNo', {
	extend : 'Ext.data.Store',
	fields : ['account_no', 'account_name' ],
	proxy : {
		type : 'ajax',
		url : '/realware/loadAbisAccount.do',
		reader : {
			type : 'json'
		},
		extraParams : {
			filedNames : Ext.encode(["account_no", "account_name"])
		}
	},
	autoLoad : true
});