/***
 * 菜单对状态数据集合
 */
Ext.define('pb.store.common.MenuButton', {
	extend : 'Ext.data.Store',
	model : 'pb.model.common.MenuButton',
	proxy : 'memory' 
});
