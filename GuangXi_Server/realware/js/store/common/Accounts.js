/***
 * 账户
 */
Ext.define('pb.store.common.Accounts', {
	extend : 'Ext.data.Store',
	model : 'pb.model.common.Account',
	proxy : {
		type : 'ajax',
		url : '/realware/loadAccount.do',
		reader : {
			type : 'json',
			root : 'root',
			totalProperty: 'pageCount'
		}
	},
	autoLoad : false
});