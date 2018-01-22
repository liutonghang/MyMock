/***
 * 视图模型（功能维护界面应用）
 * @memberOf {TypeName} 
 */
Ext.define('pb.view.common.UITemplateList', {
	extend : 'Ext.panel.Panel',
	alias : 'widget.uilist',
	layout : 'border',
	frame : true,
	items : [ {
		region : 'west',
		id : 'templatepanel',
		xtype : 'gridpanel',
		title : '视图模型',
		selType : 'rowmodel',
		split : true,
		collapsible : true,
		collapsed : false,
		width : 230,
		columns : [ {
			text : '列表名称',
			dataIndex : 'template_name',
			width : 130
		}, {
			text : '控件名称',
			dataIndex : 'control_name',
			width : 150
		} ],
		store : 'common.UITemplates'
	}, {
		region : 'center',
		xtype : 'gridpanel',
		title : '明细列表',
		columns : [ {
			xtype : 'rownumberer',
			width : 30,
			locked : true
		}, {
			text : '列主键',
			dataIndex : 'ui_id',
			width : 180
		}, {
			text : '列名',
			dataIndex : 'ui_name',
			width : 150
		}, {
			text : '列类型',
			dataIndex : 'ui_xtype',
			width : 130,
			renderer : function(value) {
				if(value==1){
					return '操作列';
				}else if(value==2){
					return '数字列';
				}else if(value==3){
					return '编辑列';
				}else if(value==4){
					return '组合列';
				}else if(value==5){
					return '日期列';
				}else{
					return '普通列';
				}
			}
		}, {
			text : '数据源',
			dataIndex : 'dataindex',
			width : 150
		}, {
			text : '列宽',
			dataIndex : 'ui_width',
			width : 100
		}, {
			text : '是否可见',
			dataIndex : 'is_visble',
			width : 100,
			renderer : function(value) {
				if(value==1){
					return '不';
				}else{
					return '是';
				}
			}
		}, {
			text : '是否锁定',
			dataIndex : 'locked',
			width : 100,
			renderer : function(value) {
				if(value==1){
					return '是';
				}else{
					return '否';
				}
			}
		}, {
			text : '值格式',
			dataIndex : 'format',
			width : 130
		}, {
			text : '值样式',
			dataIndex : 'align',
			width : 130
		}, {
			text : '编辑列是否可为空',
			dataIndex : 'is_null',
			width : 100,
			renderer : function(value) {
				if(value==1){
					return '是';
				}else{
					return '不';
				}
			}
		}, {
			text : '组合列数据源',
			dataIndex : 'store_name',
			width : 130
		}, {
			text : '操作列函数名',
			dataIndex : 'action_name',
			width : 130
		}, {
			text : '编辑列校验',
			dataIndex : 'regex',
			width : 130
		}, {
			text : '编辑列校验提示',
			dataIndex : 'regextext',
			width : 130
		} ],
		selType : 'rowmodel',
		store : 'common.UITemplateDetails'
	} ],
	initComponent : function() {
		this.dockedItems = [ {
			xtype : 'toolbar',
			items : {
				xtype : 'buttongroup',
				items : [ {
					id : 'deleteUI',
					text : '删除',
					iconCls : 'delete',
					scale : 'small',
					hidden : true
				}, {
					id : 'refreshUI',
					text : '刷新',
					iconCls : 'refresh',
					scale : 'small'
				} ]
			}
		} ];
		this.callParent(arguments);
	}
});
