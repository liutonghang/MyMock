/***
 * 字段映射主单
 */
Ext.define('pb.store.common.ReflectField', {
	extend: "Ext.data.Store",
	model: "pb.model.common.ReflectField",
	local : true,
	autoLoad : false
});