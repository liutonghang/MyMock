/***
 * 功能树数据集合
 */
Ext.define('pb.store.common.ModuleTree', {
	extend : 'Ext.data.TreeStore',
	model : 'pb.model.common.Module',
	proxy : {
		actionMethods : {
			read : 'POST' //指定检索数据的提交方式
		},
		type : 'ajax',
		url : '/realware/loadModuleTree.do'
	},
	autoLoad : true
});