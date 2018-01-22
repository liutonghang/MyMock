/***
 * 支付明细数据集合
 */
Ext.define('pb.store.common.PbPayUpperLimit', {
	extend : 'Ext.data.Store',
	model : 'pb.model.common.PbPayUpperLimitDTO',
	storeId : 's_PbPayUpperLimit',
	proxy : {
		type : 'ajax',
		url : '/realware/loadPayUpperLimit.do',
		reader : {
			type : 'json',
			root : 'root',
			totalProperty: 'pageCount'
		}
	},
	autoLoad : false
});