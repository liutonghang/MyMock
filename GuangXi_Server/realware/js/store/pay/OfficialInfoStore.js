/***
 * 划款凭证数据集合
 */
Ext.define('pb.store.pay.OfficialInfoStore', {
	extend : 'Ext.data.Store',
	model : 'pb.model.pay.OfficialInfoModel',
	storeId : 's_officialInfo',
	proxy : {
		type : 'ajax',
		actionMethods : {
			read : 'POST' //指定检索数据的提交方式
		},
		url : '/realware/loadOfficialInfo.do',
		reader : {
			type : 'json',
			root : 'root',
			totalProperty: 'pageCount'
		}
	},
	autoLoad : false
});