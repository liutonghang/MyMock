/***
 * 字段映射对象store
 */
Ext.define('pb.store.common.FieldMap', {
	extend: "Ext.data.Store",
	model: "pb.model.common.FieldMap",
    proxy : {
		type : 'ajax',
		url : '/realware/loadRefelctObject.do',
		reader : {
			type : 'json',
			root : 'root'
		}
	},
	autoLoad : false
});