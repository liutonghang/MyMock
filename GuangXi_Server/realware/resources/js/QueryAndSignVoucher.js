/*******************************************************************************
 * 
 */

/*******************************************************************************
 * 初始化
 */
Ext
		.onReady(function() {
			// 初始化Ext.QuickTips，启用悬浮提示
			Ext.QuickTips.init();
			// 选择器状态
			operStatus = '';

			var year = new Date().getFullYear();

			var yearStore = Ext.create('Ext.data.Store', {
				fields : [ 'name', 'value' ],
				data : [ {
					"name" : year - 1,
					"value" : year - 1
				}, {
					"name" : year,
					"value" : year
				}, {
					"name" : year + 1,
					"value" : year + 1
				} ]
			});

			Ext
					.create(
							'Ext.Viewport',
							{
								id : 'abisCoreAccountFrame',
								title : "手动查询、签收凭证",
								layout : 'fit',

								items : [ Ext
										.create(
												'Ext.panel.Panel',
												{
													title : '手动查询、签收凭证',
													layout : 'border',
													items : [
															{
																title : '执行结果',
																width : "100%",
																height : "30%",
																region : 'south',
																xtype : 'panel',
																split : true,
																margins : '0 5 5 5',
																layout : 'fit',
																items : [

																{
																	id : 'result',
																	xtype : 'textareafield'
																}

																],
																bbar : [ {
																	id : 'clear_result',
																	text : '清空',
																	scale : 'small',
																	padding : '10 10 10 10',
																	handler : function() {
																		clear(1);
																	}
																} ]
															},
															{
																title : '操作类型',
																width : "30%",
																height : "70%",
																region : 'west',
																xtype : 'panel',
																margins : '5 0 0 5',
																id : 'westper',
																width : 200,
																collapsible : true,
																layout : {
																	type : 'table',
																	columns : 1
																},
																bodyStyle : "padding-left:15%",
																items : [
																		{

																			id : 'queryVoucherStatus',
																			text : '查询凭证状态',
																			scale : 'small',
																			xtype : 'button',
																			rowspan : 1,
																			height : 30,
																			width : 100,
																			handler : function() {
																				selectStatus('queryVoucherStatus');
																			}
																		},
																		{
																			id : 'signVoucher',
																			text : '签收凭证',
																			rowspan : 2,
																			xtype : 'button',
																			height : 30,
																			width : 100,
																			scale : 'small',
																			handler : function() {
																				selectStatus('signVoucher');
																			}
																		} ]

															},
															{
																title : '凭证信息',
																width : "70%",
																height : "70%",
																region : 'center',
																xtype : 'panel',
																id : 'centerp',
																layout : {
																	type : 'table',
																	columns : 2
																},
																defaults : {
																	padding : '30 20 20 20'
																},
																items : [

																		{
																			id : 'admdiv_code',
																			fieldLabel : '区划',
																			xtype : 'combo',
																			dataIndex : 'admdiv_code',
																			rowspan : 1,
																			colspan : 1,
																			// allowBlank:false,
																			blankText : "区划为必输项",
																			labelWidth : 65,
																			width : 240,

																			displayField : 'admdiv_name',
																			valueField : 'admdiv_code',
																			editable : false,
																			store : comboAdmdiv,
																			value : comboAdmdiv
																					.getCount() > 0 ? comboAdmdiv
																					.getAt(0)
																					: ""

																		},
																		{
																			id : 'year',
																			fieldLabel : '年度',
																			xtype : 'combo',
																			rowspan : 2,
																			// allowBlank:false,
																			blankText : "年度为必输项",
																			colspan : 1,
																			value : year,
																			labelWidth : 65,
																			width : 240,
																			store : yearStore,
																			displayField : 'value',
																			valueField : 'name',
																			editable : true,
																			store : yearStore

																		},
																		{
																			id : 'vt_code',
																			fieldLabel : '凭证类型',
																			xtype : 'textfield',
																			dataIndex : 'vt_code',
																			rowspan : 2,
																			colspan : 1,
																			// allowBlank:false,
																			blankText : "凭证类型必输项",
																			labelWidth : 65,
																			width : 240
																		},
																		{
																			id : 'voucher_no',
																			fieldLabel : '凭证号',
																			xtype : 'textfield',
																			dataIndex : 'voucher_no',
																			rowspan : 2,
																			// allowBlank:false,
																			blankText : "凭证号为必输项",
																			colspan : 2,
																			labelWidth : 65,
																			width : 240
																		}, ],

																bbar : [ {
																	id : 'buttongroup1',
																	xtype : 'buttongroup',
																	items : [
																			{
																				id : 'sign',
																				text : '调用',
																				scale : 'small',
																				padding : '10 10 10 10',
																				handler : function() {
																					if (isValid()) {
																						sign();
																					}
																				}
																			},
																			{
																				id : 'clear',
																				text : '清空',
																				scale : 'small',
																				padding : '10 10 10 10',
																				handler : function() {
																					clear(2);
																				}
																			} ]
																} ]

															} ],
													renderTo : Ext.getBody()
												}) ]

							});
			
			Ext.getCmp("centerp").setDisabled(true);

			//选择操作类型
			function selectStatus(id) {
				operStatus = id;
				Ext.getCmp("centerp").setDisabled(false);
				if ("queryVoucherStatus" == operStatus) {
					Ext.getCmp("centerp").setTitle("查询凭证状态信息");
				} else if ("signVoucher" == operStatus) {
					Ext.getCmp("centerp").setTitle("签收凭证信息");
				}

			}
			;

			//执行
			function sign() {
				if (operStatus == null || '' == operStatus) {
					Ext.Msg.alert("系统提示", "请先在左侧选择操作类型!");
					return;
				}
				
				var admdiv_code = Ext.getCmp("admdiv_code").getValue();
				var year = Ext.getCmp("year").getValue();
				var vt_code = Ext.getCmp("vt_code").getValue();
				var voucher_no = Ext.getCmp("voucher_no").getValue();
				var myMask = new Ext.LoadMask(Ext.getBody(), {
					msg : '后台正在处理中，请稍后....',
					removeMask : true
						// 完成后移除
					});
				myMask.show();
				Ext.Ajax.request({
					url : 'operVoucher.do',
					method : 'POST',
					params : {
						opervt : operStatus,
						admdiv_code : admdiv_code,
						year : year,
						vt_code : vt_code,
						voucher_no : voucher_no
					},
					success : function(response, options) {
						Ext.Msg.alert('系统提示', "请查看执行结果！");
						Ext.getCmp("result").setValue(response.responseText);
						myMask.hide();
					},
					failure : function(response, options) {
						Ext.Msg.alert('系统提示', "请查看执行结果！");
						Ext.getCmp("result").setValue(response.responseText);
						myMask.hide();
					}
				});
			}
			;
			//清空
			function clear(vt) {
				if (2 == vt) {
					Ext.getCmp("admdiv_code").setValue('');
					Ext.getCmp("year").setValue('');
					Ext.getCmp("vt_code").setValue('');
					Ext.getCmp("voucher_no").setValue('');
				} else if (1 == vt) {
					Ext.getCmp("result").setValue('');
				}

			}
			;

			function isValid() {
				var admdiv_code = Ext.getCmp("admdiv_code").getValue();
				var year = Ext.getCmp("year").getValue();
				var vt_code = Ext.getCmp("vt_code").getValue();
				var voucher_no = Ext.getCmp("voucher_no").getValue();
				if (Ext.isEmpty(admdiv_code) || Ext.isEmpty(year)
						|| Ext.isEmpty(vt_code) || Ext.isEmpty(voucher_no)) {
					Ext.Msg.alert('系统提示', "请完善凭证信息！");
					return false;
				}
				return true;
			}
		});
