var newStore = Ext.create('pb.store.pay.MigrateLog');
/***
 * 迁入、撤销迁出、日志查询窗口
 * @memberOf {TypeName} 
 */
Ext.define('pb.view.pay.MigrateLogWindow', {
	flag : null,
	bankLable : null,
	extend : 'Ext.window.Window',
	alias : 'widget.MigrateLogWindow', //别名
	layout : 'fit',
	modal : true,
	width : 950,
	height : 400,
	title : null,
	autoScroll: true,
//	resizable : false, // 不可调整大小
//	draggable : false, // 不可拖拽
	initComponent : function() {
		var me = this;
		//常用查询区
		var queryItems = [
			{
				layout : 'hbox',
				style : 'margin-left:5px;',
				bodyStyle : 'border-width: 0px 0px 0px 0px;',
				width:700,
				items : [
				    {
				    id : 'bankCode',
					fieldLabel : this.bankLable,
					xtype : 'textfield',
					labelWidth : 60,
//					symbol : '=',
					style : 'margin-left:5px;'
				},{
				    id : 'userCode',
					fieldLabel : '用户编码',
					xtype : 'textfield',
					labelWidth : 60,
//					symbol : '=',
					style : 'margin-left:5px;'
				},{
				    id : 'identityNo',
					fieldLabel : '身份证号',
					xtype : 'textfield',
					labelWidth : 55,
//					symbol : '=',
					style : 'margin-left:5px;'
				},{
					name : 'queryBtn',
					xtype : 'button',
					iconCls : 'look',
					scale : 'small'
				},{
				    id : 'flag',
					xtype : 'textfield',
					hidden : true,
					labelWidth : 60,
					value : this.flag,
					style : 'margin-left:5px;'
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
					layout : {
						type : 'table',
						columns : 4
					},
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
						id : 'migratePanel',
						xtype : 'gridpanel',
						frame : false,
						border : false,
						title : '迁入迁出信息列表',
						store : newStore,
						columns : [
						  {
							text : '用户编码',
							dataIndex : 'user_code',
							width : 100
						}, {
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
						],bbar : Ext.PageUtil.pagingTool(newStore)
					}]
				}],
				buttons : [ {
					text : this.title,
					handler : function() {
						var migratePanel = Ext.getCmp('migratePanel');
						var rs = migratePanel.getSelectionModel().getSelection();
						if (rs.length == 0) {
							Ext.Msg.alert("系统提示", "请至少选择一条日志信息！");
							return;
						}
						var inMask = new Ext.LoadMask(Ext.getBody(), {
							msg : '后台正在处理中，请稍后....',
							removeMask : true
								// 完成后移除
							});
						inMask.show();
						Ext.Ajax.request({
									url : 'migrateInUser.do',
									method : 'POST',
									timeout : 180000, // 设置为3分钟
									params : {
										log_id : rs[0].get('log_id'),
										flag : Ext.getCmp("flag").getValue()
									},
									// 提交成功的回调函数
									success : function(response, options) {
										succAjax(response, inMask);
											Ext.getCmp('migratePanel').getStore().load({
											params : {
												isParent : true,
												flag: false
											}
										});
									},
									// 提交失败的回调函数
									failure : function(response, options) {
										failAjax(response, inMask);
										this.up('window').close();
										refreshData();
									}
								});
					}
				}, {
					text : '取消',
					handler : function() {
						me.close();
						refreshData();
					}
				} ]
			} ]
		});
		me.callParent(arguments);
	}
	
});
