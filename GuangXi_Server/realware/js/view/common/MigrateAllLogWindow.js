var newStores = Ext.create('pb.store.pay.MigrateAllLog');
/***
 * 迁入、撤销迁出、日志查询窗口
 * @memberOf {TypeName} 
 */
Ext.define('pb.view.pay.MigrateAllLogWindow', {
	extend : 'Ext.window.Window',
	alias : 'widget.MigrateAllLogWindow', //别名
	layout : 'fit',
	modal : true,
	width : 960,
	height : 400,
	title : null,
	autoScroll: true,
//	resizable : false, // 不可调整大小
//	draggable : false, // 不可拖拽
	query : 'PUBLIC',  //查询区布局
	initComponent : function() {
		var me = this;
		//常用查询区
		var queryItems = [
			{
				layout : 'hbox',
				style : 'margin-left:5px;',
				bodyStyle : 'border-width: 0px 0px 0px 0px;',
//				width:460,
				items : [
				    {
				    id : 'inBankCode',
					fieldLabel : "迁入网点",
					xtype : 'textfield',
					labelWidth : 60,
					style : 'margin-left:5px;'
				}, {
				    id : 'outBankCode',
					fieldLabel : "迁出网点",
					xtype : 'textfield',
					labelWidth : 60,
					style : 'margin-left:5px;'
				},{
				    id : 'user_code2',
					fieldLabel : "用户编码",
					xtype : 'textfield',
					labelWidth : 60,
					style : 'margin-left:5px;'
				},{
				    id : 'identity_no2',
					fieldLabel : "身份证号",
					xtype : 'textfield',
					labelWidth : 55,
					style : 'margin-left:5px;'
				},{
					name : 'queryBtn',
					xtype : 'button',
					iconCls : 'look',
					scale : 'small'
				}]
			} ];
		Ext.applyIf(me, {
			items : [ {
				layout : 'border',
				frame : false,
				border : false,
				items : [ {
					region : 'north',
					bodyPadding : 5,
					frame : false,
					border : false,
//					layout : {
//						type : 'table',
//						columns : 4
//					},
					xtype : 'form',
					title : '查询条件',
					collapsible : true,
					items : queryItems
				}, {
					region : 'center',
					layout : 'anchor',
					frame : false,
					border : false,
					items : [ {
						anchor : '100% 100%',
						id : 'migratePanels',
						xtype : 'gridpanel',
						frame : false,
						border : false,
						title : '迁入迁出信息列表',
						store : newStores,
						columns : [
							{
							text : '用户编码',
							dataIndex : 'user_code',
							width : 100
						},{
							text : '身份证号',
							dataIndex : 'identity_no',
							width : 100
						}, {
							text : '迁出日期',
							dataIndex : 'out_date',
							width : 150
						}, {
							text : '迁出网点',
							dataIndex : 'out_bank_code',
							width : 100
						}, {
							text : '迁出操作人',
							dataIndex : 'out_user_code',
							width : 100
						}, {
							text : '迁出状态',
							dataIndex : 'migrate_flag',
							width : 100,
							renderer : function(value){
								if(value == 0){
									return '已迁出';
								}else if(value == 1){
									return '已迁入';
								}else if(value == 2){
									return '已撤销';
								}
							}
						}, {
							text : '迁入日期',
							dataIndex : 'in_date',
							width : 150
						}, {
							text : '迁入操作人',
							dataIndex : 'in_user_code',
							width : 100
						}, {
							text : '迁入网点',
							dataIndex : 'in_bank_code',
							width : 100
						}
						],bbar : Ext.PageUtil.pagingTool(newStores)
					}]
				}],
				buttons : [ {
					text : '取消',
					handler : function() {
						me.close();
					}
				} ]
			} ]
		});
		me.callParent(arguments);
	}
	
});
