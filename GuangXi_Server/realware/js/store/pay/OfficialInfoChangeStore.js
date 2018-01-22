/***
 * 卡数据变更集合
 */
Ext.define('pb.store.pay.OfficialInfoChangeStore', {
	extend : 'Ext.data.Store',
	model : 'pb.model.pay.OfficialInfoChangeModel',
	storeId : 's_officialChangeInfo',
	proxy : {
		type : 'ajax',
		actionMethods : {
			read : 'POST' //指定检索数据的提交方式
		},
		url : '/realware/loadCardChangeInfo.do',
		reader : {
			type : 'json',
			root : 'root',
			totalProperty: 'pageCount'
		}
	},
	autoLoad : false
});