/**
 *  按钮 
 */
Ext.define('pb.view.user.UserButton', {
	extend:'Ext.panel.Panel',
//	extend:'pb.view.user.UserGrid',
	alias : 'widget.userButton',
	layout : 'fit',
	frame : true,
	UItitle : '自助柜面-按钮',
	initComponent : function() {
		this.dockedItems = [ {
			xtype : 'buttongroup',
			items : [ {
				id : 'addZero',
				text : '新增' ,
		 		scale : 'small'
			// hidden : true
			}, {
				id : 'effButton',
				text : '生效',
				scale : 'small'
			// hidden : true
			}, {
				id : 'logOff',
				text : '注销',
				scale : 'small' 
			}, {
				id : 'resetPass',
				text : '重置密码',
				scale : 'small' 
			}, {
				id : 'printButton',
				text : '打印',
				scale : 'small' 
			}, {
				id : 'refreshButton',
				text : '刷新' 
			} ]
		}, {
			xtype: 'userQuery'
		},{
			xtype : 'userGrid'
		} ];
		this.callParent(arguments);
	}

});