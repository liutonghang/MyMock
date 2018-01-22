/***
 * 网点
 */
Ext.define('pb.store.common.Banks', {
	extend : 'Ext.data.Store',
	fields : [{
				name : 'id'
			},{
				name : 'code'
			}, {
				name : 'name'
	}],
	proxy :  {
			type : 'ajax',
			url : '/realware/loadAllNetwork2.do',
			reader : {
				type : 'json'
			}
	},
	autoLoad : true
});