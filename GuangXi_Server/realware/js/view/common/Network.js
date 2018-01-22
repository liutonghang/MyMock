Ext.define('NetworkTree', {
	alias : 'widget.NetworkTree',
	extend : 'Ext.tree.Panel',
	requires : ['Ext.tree.*', 'Ext.data.*'],
	rootVisible : false,
	useArrows : true,
	isLoadAll : false,
	initComponent : function() {
		Ext.apply(this, {
			store : new Ext.data.TreeStore({
						proxy : {
							actionMethods : {
								read : 'POST' // 指定检索数据的提交方式
							},
							type : 'ajax',
							url : '/realware/loadNetWork.do',
							extraParams : {
								isLoadAll : this.isLoadAll
							}
						},
						autoLoad : false,
						folderSort : true,

						sorters : [{
									property : 'code',
									direction : 'ASC'
								}],
						/**
						 * treestore加载完成后的事件监听函数,网点维护将网点改为网点编码+网点名称的形式
						 */
						listeners : {
							'load' : function(store, node, records, sucess, eop) {
								node.cascadeBy(function(node) {
                					if(node.isRoot()) return ;
                					node.set('text', node.raw.code +" "+ node.raw.text);
                					node.commit();
								});
							}
						}

					})

		});
		this.callParent();
		this.addListener("containerclick", function(thiz, e, eOpts) {
					thiz.getSelectionModel().deselectAll();
				});
	}

});