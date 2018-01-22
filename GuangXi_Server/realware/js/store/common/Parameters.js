/***
 * 参数维护数据集合
 */
Ext.define('pb.store.common.Parameters', {
	extend : 'Ext.data.TreeStore',
	model : 'pb.model.common.Parameter',
	root : {
		expanded : false  //不自动加载设置
	},
	proxy : {
		type : 'ajax',
		url : '/realware/loadPara.do'
	},
	autoLoad : false
});