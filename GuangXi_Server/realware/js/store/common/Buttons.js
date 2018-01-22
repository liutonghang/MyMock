/***
 * 功能按钮数据集合
 */
Ext.define('pb.store.common.Buttons', {
	extend : 'Ext.data.Store',
	model : 'pb.model.common.Button',
	storeId : 's_button',
	proxy : 'memory' ,
	autoLoad : false
});