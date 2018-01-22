/*******************************************************************************
 * 日终对账（农行）
 */
/*******************************************************************************
 * 初始化
 */
var fields = [ 'trans_date', 'admdiv_code', 'pay_type', 'flow_type',
		'pay_amount', 'trans_amount','fail_amount', 'clear_amount',
		'cash_amount' ];
var errorFields = [ 'trans_date', 'pay_voucher_id', 'pay_voucher_code',
		'pay_amount', 'admdiv_code', 'trans_amount', 'pay_account_no',
		'pay_account_name', 'bank_name', 'bill_type_id', 'last_ver' ,'status_'];
var sendFields = [ 'create_date', 'pay_voucher_id', 'pay_voucher_code',
		'pay_amount', 'admdiv_code', 'pay_account_no', 'pay_account_name',
		'bank_name', 'bill_type_id', 'last_ver' ];
var detailFields = [ 'trans_date', 'pay_voucher_id', 'pay_voucher_code',
		'pay_amount', 'admdiv_code', 'trans_amount', 'status_',
		'pay_account_no', 'pay_account_name', 'bank_name', 'bill_type_id',
		'last_ver' ];
Ext.onReady(function() {
	// 初始化Ext.QuickTips，启用悬浮提示
		Ext.QuickTips.init();
		var store = getStore('daily/checkABC.do', fields);
		store.on('beforeload', function(thiz, options, e) {
			beforeload(Ext.getCmp('queryPanel'), options, Ext.encode(fields));
		});
		var typeDict = {
			'20' : '授权支付退款',
			'21' : '授权支付',
			'10' : '直接支付退款',
			'11' : '直接支付'
		}
		var detailColumn = [ {
			xtype : 'rownumberer',
			width : 30,
			locked : true
		}, {
			text : '凭证编号',
			dataIndex : 'pay_voucher_code',
			width : 180
		}, {
			text : '网点名称',
			width : 180,
			dataIndex : 'bank_name'
		}, {
			text : '账号',
			width : 180,
			dataIndex : 'pay_account_no'
		}, {
			text : '账户',
			width : 180,
			dataIndex : 'pay_account_name'
		}, {
			xtype : 'numbercolumn',
			format : '0,0.00',
			text : '凭证金额',
			dataIndex : 'pay_amount',
			width : 180,
			align : 'right'
		} ];
		var detailStore = getStore('daily/detailABC.do', detailFields);
		detailStore.on('beforeload', function(thiz, options, e) {
			var grid = Ext.ComponentQuery.query('viewport > panel:first gridpanel')[0];
			var records = grid.getSelectionModel().getSelection();
			if (!Ext.isEmpty(records)) {
				var record = records[0];
				var tab = Ext.ComponentQuery.query('viewport > panel:first tabpanel')[0];
				var active = tab.getActiveTab();
				if (record.get('flow_type') == '0') {
					if (active.title == '已转账未签章发送') {
						return false;
					}
				}
				if (record.get('pay_type') == null || record.get('flow_type') == null) {
					Ext.Msg.alert('提示信息', '业务单据类型异常！');
					return false;
				}
				options.params = {};
				options.params.admdiv_code = record.get('admdiv_code');
				options.params.create_date = record.get('trans_date');
				options.params.pay_type = record.get('pay_type');
				options.params.flow_type = record.get('flow_type');
				options.params.type = active.symbol;
				options.params.filedNames = Ext.encode(window[active.symbol + 'Fields']);
			} else {
				return false;
			}
		});
		var detailConfig = {
			xtype : 'gridpanel',
			columnLines : true,
			frame : false,
			enableColumnHide : false,
			enableColumnMove : false,
			enableLocking : false,
			enableColumnResize : true,
			sortableColumns : false,
			syncRowHeight : false,
			viewConfig : {
				forceFit : true,
				shrinkWrap : 0,
				hasLoadingHeight : Ext.isIE
			},
			loadMask : {
				msg : '数据加载中,请稍等...'
			}
		};

		var tabs = [];
		tabs.push(Ext.apply( {
			title : '错误记录',
			itemId : 'tab_error_count',
			columns : detailColumn.concat( [ {
				xtype : 'numbercolumn',
				format : '0,0.00',
				text : '转账金额',
				dataIndex : 'trans_amount',
				width : 120,
				align : 'right'
			},{
				text : '所属类型',
				dataIndex : 'status_',
				width : 150,
				renderer : function(value) {
					if (value == 1) {
						return '柜面比核心多';
					} else if (value == 2) {
						return '核心比柜面多';
					}
				}
			} ]),
			store : detailStore,
			symbol : 'error',
			tbar : [ {
				text : '全部导出',
				iconCls : 'export',
				scale : 'small',
				handler : function() {
					exportAll();
				}
			} ]
		}, detailConfig));
		tabs.push(Ext.apply( {
			title : '已转账未签章发送',
			itemId : 'tab_send_count',
			columns : detailColumn,
			store : detailStore,
			symbol : 'send',
			buttonAlign : 'right',
			tbar : [ {
				text : '全部发送',
				iconCls : 'sign',
				scale : 'small',
				handler : function() {
					sendStamp();
				}
			} ]
		}, detailConfig));

		var items = [
				{
					id : 'queryPanel',
					region : 'north',
					frame : false,
					border : false,
					height : 40,
					defaults : {
						padding : '0 3 0 3',
    					columnWidth:.3
					},
					layout : {
						type : 'table',
						columns : 3
					},
					bodyPadding : 5,
					items : [ {
						id : 'admdiv',
						fieldLabel : '所属财政',
						xtype : 'combo',
						dataIndex : 'admdiv_code',
						displayField : 'admdiv_name',
						emptyText : '请选择',
						valueField : 'admdiv_code',
						editable : false,
						store : comboAdmdiv
					}, {
						id :'startDate',
						fieldLabel : '开始交易日期',
						xtype : 'datefield',
						dataIndex : 'trans_date',
						format : 'Y-m-d',
						symbol : '>=',
						value : new Date(),
						maxValue : new Date()
					}, {
						id :'endDate',
						fieldLabel : '终止交易日期',
						xtype : 'datefield',
						dataIndex : 'trans_date',
						format : 'Y-m-d',
						symbol : '<=',
						value : new Date(),
						maxValue : new Date()
					} ]
				},
				{
					xtype : 'gridpanel',
					columnLines : true,
					region : 'center',
					frame : false,
					enableColumnHide : false,
					enableColumnMove : false,
					enableLocking : false,
					enableColumnResize : true,
					sortableColumns : false,
					syncRowHeight : false,
					viewConfig : {
						forceFit : true,
						shrinkWrap : 0,
						hasLoadingHeight : Ext.isIE
					},
					autoScroll : true,
					store : store,
					columns : [ {
								text : '业务单据',
								dataIndex : 'pay_type',
								width : 150,
								renderer : function(val, m, r, rowIndex,colIndex, store, view) {
									if (typeDict[r.get('pay_type') + r.get('flow_type')]) {
										return typeDict[r.get('pay_type') + r.get('flow_type')];
									}
									return r.get('pay_type') + r.get('flow_type');
								}
							},{
								text : '核对状态',
								width : 150,
								align : 'center',
								renderer : function(val, m, r, rowIndex,colIndex, store, view) {
									if (r.get('trans_amount') == r.get('clear_amount')) {
											return '成功';
									} else {
										return '失败';
									}
								}
							}, {
								xtype : 'numbercolumn',
								format : '0,0.00',
								text : '总金额',
								dataIndex : 'pay_amount',
								width : 150,
								align : 'right'
							}, {
								text : '支付金额',
								columns : [ {
									text : '转账成功金额',
									xtype : 'numbercolumn',
									format : '0,0.00',
									width : 150,
									dataIndex : 'trans_amount',
									align : 'right'
								}, {
									text : '转账失败金额',
									width : 150,
									xtype : 'numbercolumn',
									dataIndex : 'fail_amount',
									format : '0,0.00',
									align : 'right'
								} ]
							}, {
								xtype : 'numbercolumn',
								format : '0,0.00',
								text : '现金',
								dataIndex : 'cash_amount',
								width : 150,
								align : 'right'
							}, {
								xtype : 'numbercolumn',
								format : '0,0.00',
								text : '已回单金额',
								dataIndex : 'clear_amount',
								width : 150,
								align : 'right'
							} ],
					loadMask : {
						msg : '数据加载中,请稍等...'
					},
					listeners : {
						selectionchange : function(thiz, selected, eOpts) {
							if (Ext.isEmpty(selected)) {
								detailStore.removeAll();
							} else {
								var tab = Ext.ComponentQuery.query('viewport > panel:first tabpanel')[0];
								var active = tab.getActiveTab();
								if (selected[0].get('flow_type') == '0') {
									if (active.title == '已转账未签章发送') {
										detailStore.removeAll();
										return;
									}
								}
								detailStore.loadPage(1);
							}
						}
					}
				},
				{
					xtype : 'tabpanel',
					split : true,
					autoScroll : true,
					region : 'south',
					height : 200,
					closable : false,
					items : tabs,
					listeners : {
						tabchange : function(tabPanel, newCard, oldCard, eOpts) {
							detailStore.loadPage(1);
						}
					}
				} ];
		Ext.StatusUtil.createViewport( [ {
			id : 'verityTranno',
			handler : function() {
				verityTranno();
			}
		}, {
			id : 'dailyCheck',
			handler : function() {
				dailyCheck();
			}
		} ], [], function() {
			var panel = Ext.ComponentQuery.query('viewport > panel:first')[0];
			var border = new Ext.layout.container.Border();
			border.owner = panel;
			panel.layout = border;
			panel.doLayout();
			panel.add(items);
			Ext.StatusUtil.initPage(Ext.getCmp('admdiv'));
		});
	});

function dailyCheck() {
	var grid = Ext.ComponentQuery.query('viewport > panel:first gridpanel')[0];
	grid.getStore().loadPage(1);
}

//根据当前界面选择的区划和交易日期查询交易流水号
function verityTranno() {
	var startDate = Ext.PageUtil.Todate(Ext.getCmp('startDate').getValue(),'Ymd');
	var endDate =  Ext.PageUtil.Todate(Ext.getCmp('endDate').getValue(),'Ymd');
	if(Ext.isEmpty(startDate) || Ext.isEmpty(endDate) ){
		Ext.Msg.alert('系统提示','请选择开始交易日期和终止交易日期');
		return;
	}
	var myMask = new Ext.LoadMask(Ext.getBody(), {
		msg : '后台正在处理中，请稍后....',
		removeMask : true 
	});
	myMask.show();
	Ext.Ajax.request({
			url : 'daily/verityTrannoABC.do',
			waitMsg : '后台正在处理中,请稍后....',
			method : 'POST',
			timeout : 180 * 1000, // 设置为3分钟
			params : {
				admdiv_code :Ext.getCmp('admdiv').getValue(),
				begin_date : startDate,
				end_date: endDate
			},
			success : function(response, options) {
				succAjax(response, myMask);
			},
			failure : function(response, options) {
				failAjax(response, myMask);
			}
	});
}

function sendStamp() {
	var url = 'signAndSendPayVoucher.do';
	var grid = Ext.ComponentQuery.query('[itemId=tab_send_count]')[0];
	var store = grid.getStore();
	if (store.getCount() > 0) {
		var ids = []; // 凭证主键字符串
		var lastVers = []; // 凭证lastVer字符串
		var len = store.getCount();
		for ( var i = 0; i < len; i++) {
			var model = store.getAt(i);
			ids.push(model.get('pay_voucher_id'));
			lastVers.push(model.get('last_ver'));
		}

		var params = {
			billTypeId : store.getAt(0).get('bill_type_id'),
			billIds : Ext.encode(ids),
			last_vers : Ext.encode(lastVers)
		};
		Ext.PageUtil.doRequestAjax( {
			refreshData : function() {
				grid.getStore().reload();
			}
		}, url, params);
	}
}
function exportAll(){
	var grid = Ext.ComponentQuery.query('[itemId=tab_error_count]')[0];
	 try{  
		   var oXL = new ActiveXObject("Excel.Application");  
		   var oWB = oXL.Workbooks.Add();   
		   var oSheet = oWB.ActiveSheet;     
		   var store = grid.getStore();
		   var recordCount = store.getCount();
		   var cm = grid.columns;
		   var colCount = cm.length;
		   var temp_obj = [];
		   var temp_objName = [];
		   if(recordCount==0){
			   Ext.Msg.alert('提示','列表中没有数据导出！');  
			   return;
		   }
	       for(var i = 1; i < colCount;i++){  
	             temp_obj.push(cm[i].dataIndex);
	             temp_objName.push(i);
	       }  
	       for(var i = 1; i <= temp_obj.length;i++){  
	             oSheet.Cells(1,i).value = cm[temp_objName[i-1]].text;
	       }  
	       for(var i = 1 ; i <= recordCount; i++){  
	             for(var j = 1; j<= temp_obj.length; j++){  
	                    oSheet.Cells(i+1,j).value = store.getAt(i-1).get(temp_obj[j-1]);
	    				if(temp_obj[j-1].indexOf("no") > 0){
	    					 oSheet.Cells(i+1,j).NumberFormatLocal = '000000';
	    				}else if(temp_obj[j-1].indexOf("amt") > 0 || temp_obj[j-1].indexOf("amount") > 0){
	    					 oSheet.Cells(i+1,j).NumberFormatLocal = '#,##0.00;-#,##0.00';
	    				}
	            }  
	        }  
	        if(this.sheetName){  
	             oSheet.Name = '日终对账（错误记录）';  
	        }
	        oXL.UserControl = true;  
	        oXL.Visible = true;       
       }catch(e){  
            if(Ext){ 
                oXL = null;
                oWB = null;   
                oSheet = null;  
                Ext.Msg.show({  
                      title:'提示',  
                      msg:'请设置IE的菜单\'工具\'->Internet选项->安全->自定义级别->\'对未标记为可安全执行脚本ActiveX控件初始化并执行脚本\'->选择[启用]&nbsp;&nbsp;就可以生成Excel',  
                      buttons:Ext.Msg.OK,  
                      icon:Ext.Msg.INFO  
               });  
            }else{  
                  alert('不支持ExtJs框架');  
                  return;  
             }  
     }  
}
