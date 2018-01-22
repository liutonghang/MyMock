/*******************************************************************************
 * 日终对账
 */
/*******************************************************************************
 * 初始化
 */
var fields = ["create_date", "admdiv_code", "pay_type", "flow_type", "pay_amount", 
              "req_amount", "trans_amount", "clear_amount", "cash_amount", "fail_amount"];
var reqFields = ["create_date", "pay_voucher_id", "pay_voucher_code", "pay_amount",
              "admdiv_code", "req_amount", "req_count", "pay_account_no", "pay_account_name", 
              "bank_name","bill_type_id", "last_ver"];
var transFields = ["create_date", "pay_voucher_id", "pay_voucher_code", "pay_amount",
                    "admdiv_code", "trans_amount", "pay_account_no", "pay_account_name", 
                    "bank_name", "bill_type_id", "last_ver"];
var sendFields = ["create_date", "pay_voucher_id", "pay_voucher_code", "pay_amount",
                    "admdiv_code", "pay_account_no", "pay_account_name", "bank_name",
                    "bill_type_id", "last_ver"];
var detailFields = ["create_date", "pay_voucher_id", "pay_voucher_code", "pay_amount",
                  "admdiv_code", "req_amount", "trans_amount", "req_count", "pay_account_no", 
                  "pay_account_name", "bank_name", "bill_type_id", "last_ver"];
Ext.onReady(function() {
	// 初始化Ext.QuickTips，启用悬浮提示
	Ext.QuickTips.init();
	var store = getStore("daily/check.do", fields);
	store.on("beforeload", function(thiz, options,e) {
		beforeload(Ext.getCmp("queryPanel"), options, Ext.encode(fields));
	});
	var typeDict = {
			"20" : "授权支付退款",
			"21" : "授权支付",
			"10" : "直接支付退款",
			"11" : "直接支付"
	}
	var detailColumn = [
	    	            {xtype : 'rownumberer', width:30, locked : true},
	    				{ text : '凭证编号', dataIndex : 'pay_voucher_code', width : 120 },
	    				{ text : '网点名称', width : 180, dataIndex : 'bank_name'},
	    				{ text : '账号', width : 100, dataIndex : 'pay_account_no'},
	    				{ text : '账户', width : 150, dataIndex : 'pay_account_name'},
	    				{ 
	    					xtype: 'numbercolumn', 
	    					format:'0,0.00',
	    					text : '凭证金额', 
	    					dataIndex : 'pay_amount', 
	    					width : 120, 
	    					align : 'right'
	        		    }
	    			];
	var detailStore = getStore("daily/detail.do", detailFields);
	detailStore.on("beforeload", function(thiz, options,e) {
		var grid = Ext.ComponentQuery.query("viewport > panel:first gridpanel")[0];
		var records = grid.getSelectionModel().getSelection();
		if(!Ext.isEmpty(records)) {
			var record = records[0];
			var tab = Ext.ComponentQuery.query("viewport > panel:first tabpanel")[0];
			var active = tab.getActiveTab();
			if(record.get("flow_type") == "0") {
				if(active.title == "重复请款" 
					|| active.title == "转账未发送") {
					return false;
				}
			}
			
			if(record.get("pay_type") == null 
					|| record.get("flow_type") == null) {
				Ext.Msg.alert("提示信息", "业务单据类型异常！");
				return false;
			}
			options.params = {};
			options.params.admdiv_code = record.get("admdiv_code");
			options.params.create_date = record.get("create_date");
			options.params.pay_type = record.get("pay_type");
			options.params.flow_type = record.get("flow_type");
			options.params.type = active.symbol;
			options.params.filedNames = Ext.encode(window[active.symbol + "Fields"]);
		} else {
			return false;
		}
	});
	var detailConfig = {
			xtype : 'gridpanel',
			columnLines: true,
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
	tabs.push(Ext.apply({title : '重复支付',
		itemId : 'tab_trans_count', columns : detailColumn.concat([{ 
			xtype: 'numbercolumn', 
			format:'0,0.00',
			text : '转账金额', 
			dataIndex : 'trans_amount', 
			width : 120, 
			align : 'right'
	    }]),
	    store : detailStore,
	    symbol : "trans"
    }, detailConfig));
	if(hasReq) {
		tabs.push(Ext.apply({title : '重复请款',
    		itemId : 'tab_req_count', columns : detailColumn.concat([{ 
				xtype: 'numbercolumn', 
				format:'0,0.00',
				text : '请款金额', 
				dataIndex : 'req_amount', 
				width : 120, 
				align : 'right'
		    }]),
		    store : detailStore,
		    symbol : "req"
		}, detailConfig));
	}
	tabs.push(Ext.apply({title : '转账未发送',
        		itemId : 'tab_send_count', columns : detailColumn,
    		    store : detailStore,
    		    symbol : "send",
    		    buttonAlign : 'right',
    		    tbar : [{
    		    	text : '全部发送', 
    		    	iconCls : 'sign',
					scale : 'small',
					handler : function() {
						sendStamp();
					}	
    		    	}]
        		}, detailConfig));
	
	var items = [{
		id : 'queryPanel',
		region : 'north',
		frame : false,
		border : false,
		height : 40,
		defaults : {
			padding : '0 3 0 3'
		},
		layout : {
			type : 'table',
			columns : 2
		},
		bodyPadding : 5,
		items : [{
					id : 'admdiv',
					fieldLabel : '所属财政',
					xtype : 'combo',
					dataIndex : 'admdiv_code',
					displayField : 'admdiv_name',
					emptyText : '请选择',
					valueField : 'admdiv_code',
					editable : false,
					labelWidth : 60,
					store : comboAdmdiv
				}, {
					fieldLabel : '交易日期',
					xtype : 'datefield',
					dataIndex : 'create_date ',
					format : 'Ymd',
					labelWidth : 60,
					width : 160,
					symbol:'=',
					value : new Date(), 
					maxValue : new Date()
				}]
		}, {
			xtype : 'gridpanel',
			columnLines: true,
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
			store : store,
			columns : [
				{ 
					text : '业务单据',
					dataIndex : 'pay_type',
					width : 80,
					renderer : function(val, m, r, rowIndex, colIndex, store, view) {
	        		  if(typeDict[r.get("pay_type") + r.get("flow_type")]) {
	        			  return typeDict[r.get("pay_type") + r.get("flow_type")];
	        		  }
	        		  return r.get("pay_type") + r.get("flow_type");
					}
				},
				{ text : '核对状态', width : 120, align : 'center',
					renderer : function(val, m, r, rowIndex, colIndex, store, view) {
						  var tags = [];
						  if(hasReq && r.get("flow_type") == 1) {
							  //正向请款
							  if(r.get("req_amount") == r.get("clear_amount")) {
								  return "成功";
							  } else {
								  return "失败";
							  }
						  } else {
							  if(r.get("trans_amount") == r.get("clear_amount")){
								  return "成功";
							  } else {
								  return "失败";
							  }
						  }
					}
				},
				{ 
					xtype: 'numbercolumn', 
					format:'0,0.00',
					text : '总金额', 
					dataIndex : 'pay_amount', 
					width : 120, 
					align : 'right'
    		    },
				{ xtype: 'numbercolumn', 
					format:'0,0.00',
					hidden : !hasReq,
					text : '请款金额', dataIndex : 'req_amount', width : 150, align : 'right'},
				{ text : '支付金额',
					columns : [
					           { 
					        	   text : '转账成功金额',
					        	   xtype: 'numbercolumn', 
					        	   format:'0,0.00',
					        	   width : 100, 
					        	   dataIndex : 'trans_amount', 
					        	   align : 'right'
					           },
							   { 
					        	   text : '转账失败金额', 
					        	   width : 100,
					        	   xtype: 'numbercolumn', 
					        	   dataIndex : 'fail_amount', 
					        	   format:'0,0.00',
					        	   align : 'right'
					           }
					]
				},
				{ xtype: 'numbercolumn', 
					format:'0,0.00',text : '现金', dataIndex : 'cash_amount', width : 120, align : 'right'},
				{ xtype: 'numbercolumn', 
						format:'0,0.00',text : '已回单金额', dataIndex : 'clear_amount', width : 120, align : 'right'}
			],
			loadMask : {
				msg : '数据加载中,请稍等...'
			},
			listeners : {
				selectionchange : function( thiz, selected, eOpts ) {
					if(Ext.isEmpty(selected)) {
						detailStore.removeAll();
					} else {
						var tab = Ext.ComponentQuery.query("viewport > panel:first tabpanel")[0];
						var active = tab.getActiveTab();
						if(selected[0].get("flow_type") == "0") {
							if(active.title == "重复请款" 
								|| active.title == "转账未发送") {
								detailStore.removeAll();
								return ;
							}
						}
						detailStore.loadPage(1);
					}
				}
			}
		}, {
			xtype : 'tabpanel',
			region : 'south',
			height : 200,
			closable : false,
			items : tabs,
			listeners : {
				tabchange : function( tabPanel, newCard, oldCard, eOpts ) {
					detailStore.loadPage(1);
				}
			}
		}];
	Ext.StatusUtil.createViewport([{
		id : 'dailyCheck',
		handler : function() {
			dailyCheck();
		}
	}], [], function() {
		var panel = Ext.ComponentQuery.query("viewport > panel:first")[0];
		var border = new Ext.layout.container.Border();
		border.owner = panel;
		panel.layout = border;
		panel.doLayout();
		panel.add(items);
		Ext.StatusUtil.initPage(Ext.getCmp("admdiv"));
	});
});

function dailyCheck() {
	var grid = Ext.ComponentQuery.query("viewport > panel:first gridpanel")[0];
	grid.getStore().loadPage(1);
}

function sendStamp() {
	var url = 'signAndSendPayVoucher.do';
	var grid = Ext.ComponentQuery.query("[itemId=tab_send_count]")[0];
	var store = grid.getStore();
	if(store.getCount() > 0) {
		var ids = []; // 凭证主键字符串
		var lastVers = []; // 凭证lastVer字符串
		var len = store.getCount();
		for(var i = 0; i < len ; i++) {
			var model = store.getAt(i);
			ids.push(model.get("pay_voucher_id"));
			lastVers.push(model.get("last_ver"));
		}
		
		var params = {
			billTypeId : store.getAt(0).get("bill_type_id"),
			billIds : Ext.encode(ids),
			last_vers : Ext.encode(lastVers)
		};
		Ext.PageUtil.doRequestAjax({refreshData : function() {
			grid.getStore().reload();
		}}, url, params);
	}
}


