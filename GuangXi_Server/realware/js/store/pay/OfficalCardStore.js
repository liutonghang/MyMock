/***
 * 公务卡数据集合
 */
Ext.define('pb.store.pay.OfficalCardStore', {
	extend : 'Ext.data.Store',
	model : 'pb.model.pay.OfficalCardModel',
	storeId : 's_OfficalCardStore',
	proxy : {
		type : 'ajax',
		actionMethods : {
			read : 'POST' //指定检索数据的提交方式
		},
		url : '/realware/officalcardquery.do',
		reader : {
			type : 'json',
			root : 'root',
			totalProperty: 'pageCount'
		}
	},
	autoLoad : false
});