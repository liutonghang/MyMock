/*******************************************************************************
 * 退款清算挂账
 */
 //数据项
var fields = ["account_id","agency_name", "account_name", "account_no", "amount"];


var header = "财政/预算单位|agency_name|200,零余额账户名称|account_name|200,零余额账号|account_no|200,账号余额|amount|150";

var infoFields = ["id","agency_name","account_name","account_no", "susacc_name", "susacc_no","suspend_operator","sus_date","rev_date","revoke_operator","trans_amount"];
var infoHeader =	"财政/预算单位|agency_name|100,零余额账户名称|account_name|100,零余额账号|account_no|100,挂账账户名称|susacc_name|100," +
					"挂账账号|susacc_no|100,挂账日期|sus_date|100,撤销挂账日期|rev_date|100," +
					"挂账人|suspend_operator|100,撤销挂账人|revoke_operator|100,金额|trans_amount|100";

/*******************************************************************************
 * 初始化
 */
var pagetool = null;
Ext.onReady(function() {
	//初始化Ext.QuickTips，启用悬浮提示
	Ext.QuickTips.init();
	
	store = getStore("loadAccount.do", fields);
	//加载挂账信息
	infoStore = getStore("suspend/loadSuspendInfo.do",infoFields);
	
	column = getColModel(header, fields);
	infoColumn = getColModel(infoHeader,infoFields);
	pagetool = getPageToolbar(store);
	
	infoStore.on('beforeload', function(thiz, options,e) {
		var panel = Ext.ComponentQuery.query("panel[title='查询区']")[0];
		beforeload(panel, options, Ext.encode(infoFields));
	});
	store.on('beforeload', function(thiz, options,e) {
		var panel = Ext.ComponentQuery.query("panel[title='查询区']")[0];
		var _fields = ["account_type_code"].concat(fields);
		beforeload(panel, options, Ext.encode(_fields));
		var params = Ext.decode(options.params.jsonMap);
		params.push({"account_type_code":["in","('11', '12')", "number"]});
		options.params.jsonMap = Ext.encode(params);
	});
	
	
	var buttonItems = [{
						id : 'queryBalance',
						handler : function() {
							queryBalance();
						}
					},{
						id : 'suspendCredit',
						handler : function() {
							suspendCredit();
						}
					}, {
						id : 'suspendCreditAll',
						handler : function() {
							suspendCreditAll();
						}
					},{
						id : 'revokeCredit',
						handler : function() {
							revokeCredit();
						}
					}, {
						id : 'revokeCreditAll',
						handler : function() {
							revokeCreditAll();
						}
					}, {
						id : 'setSuspendAccount',
						handler : function() {
							setSuspendAccount();
						}
					}, {
						id : 'refresh',
						handler : function() {
							refreshData();
						}
					}];
	var queryItems = [{
						id : 'queryPanel',
						title : '查询区',
						frame : false,
						defaults : {
							padding : '0 3 0 3'
						},
						layout : {
							type : 'table',
							columns : 5
						},
						bodyPadding : 5,
						items : [{
									id : 'taskState',
									fieldLabel : '数据状态',
									xtype : 'combo',
									displayField : 'status_name',
									dataIndex : 'task_status',
									emptyText : '请选择',
									valueField : 'status_code',
									labelWidth : 80,
									editable : false,
									listeners : {
										'change' : selectState
									}
								}, {
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
									id : 'suspend_date',
									fieldLabel : '挂账日期',
									xtype : 'datefield',
									dataIndex : 'sus_date ',
									format : 'Ymd',
									labelWidth : 60,
									width : 160,
									symbol:'='
								}, {
									id : 'revoke_date',
									fieldLabel : '撤销日期',
									xtype : 'datefield',
									dataIndex : 'rev_date ',
									format : 'Ymd',
									labelWidth : 60,
									width : 160,
									symbol:'='
								}, {
									id : 'pay_account_no',
									fieldLabel : '零余额账号',
									xtype : 'textfield',
									dataIndex : 'account_no ',
									labelWidth : 80,
									width : 250,
									symbol:'='
								}],
						flex : 2
					}, {
						id : 'suspendCreditQuery',
						xtype : 'gridpanel',
						height : document.documentElement.scrollHeight - 90,
						frame : false,
						multiSelect : true,
						ignoreAddLockedColumn : true,
						frameHeader : false,
						viewConfig : {
							shrinkWrap : 0,
							hasLoadingHeight : Ext.isIE
						},
						lockedViewConfig : {
							frame : false,
							shrinkWrap : 0,
							hasLoadingHeight : Ext.isIE
						},
						title : '账户列表',
						selType : 'checkboxmodel',
						selModel : {
							mode : 'multi',
							checkOnly : true
						},
						features: [{
	                		ftype: 'summary'
	            		}],
						store : store,
						columns : column,
						loadMask : {
							msg : '数据加载中,请稍等...'
						},
						bbar : pagetool
					}];
	Ext.StatusUtil.createViewport(buttonItems, queryItems, function() {
		Ext.StatusUtil.initPage(Ext.getCmp("admdiv"), Ext.getCmp("taskState"));
		// 默认设置为未生成
		Ext.getCmp('taskState').setValue("000");
	});
});

/*******************************************************************************
 * 切换状态
 * 
 * @return
 */
function _getRecords() {
	var records = Ext.ComponentQuery.query("gridpanel")[0].getSelectionModel().getSelection();
	return records;
}
/*******************************************************************************
 * 切换状态
 * 
 * @return
 */
function selectState(combo, newValue, oldValue, eOpts) {
//	debugger;
	var grid = Ext.getCmp("suspendCreditQuery");
	switch(newValue) {
	case "000" :
		Ext.StatusUtil.batchEnable("queryBalance,suspendCredit,setSuspendAccount,suspendCreditAll");
		Ext.StatusUtil.batchDisable("revokeCredit,revokeCreditAll");
		Ext.getCmp("suspend_date").setDisabled(true).setValue(null);
		Ext.getCmp("revoke_date").setDisabled(true).setValue(null);
		// 重新绑定grid
		if(oldValue) {
			Ext.suspendLayouts();
			grid.setTitle("零余额账户列表");
			grid.reconfigure(store, column);
			pagetool.bind(store);
			Ext.resumeLayouts(true);
		}
		break;
	case "001" :
		Ext.StatusUtil.batchEnable("revokeCredit,revokeCreditAll");
		Ext.StatusUtil.batchDisable("queryBalance,suspendCredit,suspendCreditAll,setSuspendAccount");
		Ext.getCmp("suspend_date").setDisabled(false);
		Ext.getCmp("revoke_date").setDisabled(true).setValue(null);
		Ext.suspendLayouts();
		grid.setTitle("已挂账信息列表");
		grid.reconfigure(infoStore, infoColumn);
		pagetool.bind(infoStore);
		Ext.resumeLayouts(true);
		break;
	case "002" :
		Ext.StatusUtil.batchDisable("queryBalance,suspendCredit,revokeCredit,suspendCreditAll,setSuspendAccount,revokeCreditAll");
		Ext.getCmp("suspend_date").setDisabled(false);
		Ext.getCmp("revoke_date").setDisabled(false);
		Ext.suspendLayouts();
		grid.setTitle("已撤销挂账信息列表");
		grid.reconfigure(infoStore, infoColumn);
		pagetool.bind(infoStore);
		Ext.resumeLayouts(true);
		
		break;
	}
}

/*******************************************************************************
 * 刷新
 */
function refreshData() {
	Ext.ComponentQuery.query("gridpanel")[0].getStore().loadPage(1);
}

/*******************************************************************************
 * 设置挂账户
 */
function setSuspendAccount() {
	var admdiv = Ext.getCmp("admdiv").getValue();
	Ext.Ajax.request({
		url : 'suspend/querySuspendedInfo.do',
		method : 'POST',
		params : {admdiv_code : admdiv},
		success : function(response, options) {
			var form = new Ext.FormPanel({
				buttonAlign: 'left',
			    region : 'center',
			    bodyPadding: 5,
			    width: 350,
			    waitMsgTarget: true,
			    // The form will submit an AJAX request to this URL when submitted
			    url: 'editInnerHangingAccount.do',
			    // Fields will be arranged vertically, stretched to full width
			    layout: 'form',
			    // The fields
			    defaultType: 'textfield',
			    items: [{
			    	name: 'account_id',
					fieldLabel: 'id',
					hidden : true
			    }, {
			    	name: 'is_valid',
					fieldLabel: 'valid',
					value : 1,
					hidden : true
			    }, {
			    	name: 'bankid',
					fieldLabel: 'bankid',
					value : _bank_id,
					hidden : true
			    }, {
			    	allowBlank : false,
			    	name: 'account_name',
					fieldLabel: '账户名称'
			    }, {
			    	allowBlank : false,
			    	name: 'account_no',
					fieldLabel: '账号'
			    }, {
			    	xtype: 'combo',
					fieldLabel: '所属财政',
					name: 'admdiv_code',
					displayField: 'admdiv_name',
					emptyText: '请选择',
					valueField: 'admdiv_code',
					allowBlank: false,
					editable: false,
					store: comboAdmdiv,
					value : Ext.getCmp("admdiv").getValue(),
					hidden :true
			    }],
			    // Reset and Submit buttons
			    buttons: [{
			        text: '删除',
			        disabled : true,
			        handler: function() {
			        	 Ext.Msg.show({
						     title:'确认',
						     msg: '是否删除挂账户!',
						     buttons: Ext.Msg.OKCANCEL,
						     icon: Ext.Msg.QUESTION,
						     fn : function(buttonId, text) {
						    	 if(buttonId == 'ok') {
						    		 Ext.Ajax.request({
						            		url : "deleteAccountById.do",
						            		method : 'POST',
						            		params : {
						            			menu_id :  Ext.PageUtil.getMenuId(),
						            			selIds : form.getForm().getFieldValues().account_id
						            		},
						            		success : function(response, options) {
						            			form.getForm().setValues({
						            				account_id : null,
						            				account_name : null,
						            				account_no : null
						            			});
						            			form.getForm().clearInvalid();
						            			Ext.ComponentQuery.query("button[text='删除']")[0].setDisabled(true);
						            		},
						                    failure: function(response, options) {
						                        Ext.Msg.alert('删除失败', response.responseText);
						                    }
						            	});
						    	 }
						     }
						});
			        	
			        }
			    }, {
			        text: '保存',
			        style : 'margin-left:130px',//离左边一个按钮的距离多加130px
			        formBind: true, //only enabled once the form is valid
			        handler: function() {
			      	
			        	var me = this;
			            var form = me.up('form').getForm();
			            if (form.isValid()) {
			            	var url = "editInnerHangingAccount.do";
			            	var account_id = form.getFieldValues().account_id;
			            	if(Ext.isEmpty(account_id)) {
			            		url = "addInnerHangingAccount.do";
				   			}
			            	Ext.Ajax.request({
			            		url : url,
			            		method : 'POST',
			            		params : form.getFieldValues(),
			            		success : function(response, options) {
			            			Ext.Msg.alert('系统提示', '保存成功！');
			            			me.up('window').close();
			            		},
			                    failure: function(response, options) {
			                        Ext.Msg.alert('保存失败!', response.responseText);
			                    }
			            	});
			            }
			        }
			    }, {
			        text: '取消',
			        handler: function() {
			            this.up('window').close();
			        }
			    }]
			});
			Ext.Ajax.request({
				url : '/realware/loadInnerHangingAccount.do',
				method : 'POST',
				async : false,
				params : {
					menu_id :  Ext.PageUtil.getMenuId(),
					start : 0,
		        	page : 1,
		        	limit : 1,
		        	filedNames : Ext.encode(["account_id", "account_name", "account_no"]),
		            jsonMap : Ext.encode([{"admdiv_code" : ["=", Ext.getCmp("admdiv").getValue()]}])
				},
				success : function(response, options) {
					 var data = Ext.decode(response.responseText);
					 if(data.pageCount > 0) {
						 form.getForm().setValues(data.root[0]);
						 Ext.ComponentQuery.query("button[text='删除']")[0].setDisabled(false);
					 }
				}
			});
			Ext.widget('window', {
				title: '账户信息',
				width : 400,
				height : 130,
				layout : 'border',
				resizable : false,
				closeAction : 'destroy',
				modal : true,
				items : [form]
			}).show();
		},
		failure: function(response, options) {
             Ext.Msg.alert('错误提示', "请先撤销挂账，再维护挂账户！");
        }
	});	
}

/*******************************************************************************
 * 余额查询
 */
function queryBalance() {
	var records = _getRecords();
	if (records.length == 0) {
		Ext.Msg.alert('系统提示', '请至少选择一条数据！');
		return ;
	}
	if(!Ext.isEmpty(records)) {
		Ext.each(records, function(record) {
			var item = record.raw;
			Ext.Ajax.request({
				url : 'queryBalanceByZeroAccount.do',
				method : 'POST',
				params : {
					menu_id :  Ext.PageUtil.getMenuId(),
					accountNo : item.account_no,
					admdivCode : Ext.getCmp("admdiv").getValue(),
					accountTypeCode : item.account_type_code
				},
				success : function(response, options) {
					var data = Ext.decode(response.responseText);
					record.set({amount : data.amt});
//					record.commit();
				}
			});
		});
	}
}

/*******************************************************************************
 * 挂账
 */
function suspendCredit() {
	var records = _getRecords();
	if (records.length == 0) {
		Ext.Msg.alert('系统提示', '请至少选择一条数据！');
		return ;
	}
	if(!Ext.isEmpty(records)) {
		var flag = false;
		Ext.each(records, function(record) {
			//使用修改后的数据
			if(record.data.amount == 0) {
				flag = true;
				return false;
			}
		});
		if(flag) {
			Ext.Msg.alert('系统提示', '账号余额为零不能执行挂账操作！');
			return ;
		}
		Ext.Ajax.request({
			url : '/realware/loadInnerHangingAccount.do',
			method : 'POST',
			params : {
				menu_id :  Ext.PageUtil.getMenuId(),
				start : 0,
	        	page : 1,
	        	limit : 1,
	        	filedNames : Ext.encode(["account_id", "account_name", "account_no", "account_type_code"]),
	            jsonMap : Ext.encode([{"admdiv_code" : ["=", Ext.getCmp("admdiv").getValue()]}])
			},
			success : function(response, options) {
				 var data = Ext.decode(response.responseText);
				 if(data.pageCount > 0) {
					 var payeeAccountInfo = data.root[0];
					 Ext.Msg.show({
					     title:'确认',
					     msg: '是否将零余额资金转入账号：' 
					    	 + payeeAccountInfo.account_name 
					    	 + '[' + payeeAccountInfo.account_no + ']？',
					     buttons: Ext.Msg.OKCANCEL,
					     icon: Ext.Msg.QUESTION,
					     fn : function(buttonId, text) {
					    	 if(buttonId == 'ok') {
					    		 _suspendCredit(payeeAccountInfo, records);
					    	 }
					     }
					});
				 } else {
					 Ext.Msg.alert('系统提示', '无法找到挂账账号信息，请先设置挂账账号后再执行挂账操作！');
				 }
			},
            failure: function(response, options) {
                Ext.Msg.alert('获取挂账账户异常', response.responseText);
            }
		});
	}
}

function _suspendCredit(payeeAccountInfo, records) {
	var infoWin = Ext.widget('window', {
		title: '操作信息',
		width : 400,
		height : 300,
		layout : 'border',
		resizable : false,
		closeAction : 'destroy',
		records : records,
		hasCompleted : 0, 
		listeners : {
			beforeclose : function( panel, eOpts ){
				if(this.hasCompleted == this.records.length) {
					return true;
				} else {
					return false;
				}
			}
		},
		modal : true,
		addInfo : function(succ, info) {
			this.hasCompleted++;
			//添加执行信息
			Ext.getCmp("msgPanel").body
			.createChild({tag : 'div', html : info})
			.setStyle('color', succ ? 'green' : 'red');
		},
		items : [
		         {
		        	 id : 'msgPanel',
		        	 region : 'center',
		        	 layout : 'hbox',
		        	 autoScroll: true, 
		        	 bodyPadding : 5,
		        	 html : ''
		         }]
	}).show();
	 Ext.each(records, function(record) {
			var item = record.raw;
			Ext.Ajax.request({
				url : 'suspend/credit.do',
				method : 'POST',
				params : {
					menu_id :  Ext.PageUtil.getMenuId(),
					admdivCode : Ext.getCmp("admdiv").getValue(),
					agencyName : item.agency_name,
					payAccountId : item.account_id,
					payAccountNo : item.account_no,
					payAccountName : item.account_name,
					payAccountTypeCode : item.account_type_code,
					payeeAccountNo : payeeAccountInfo.account_no,
					payeeAccountName : payeeAccountInfo.account_name,
					payeeAccountTypeCode : payeeAccountInfo.account_type_code
				},
				success : function(response, options) {
					infoWin.addInfo(true, "【账号:"+item.account_no + "】挂账成功！");
					refreshData();
				},
	            failure: function(response, options) {
	            	infoWin.addInfo(false, "【账号:"+item.account_no + "】挂账异常！"+response.responseText);
	            	refreshData();
	            }
			});
		});
}

/*******************************************************************************
 * 全部挂账
 */
function suspendCreditAll() {
		Ext.Ajax.request({
			url : '/realware/loadInnerHangingAccount.do',
			method : 'POST',
			params : {
				menu_id :  Ext.PageUtil.getMenuId(),
				start : 0,
	        	page : 1,
	        	limit : 1,
	        	filedNames : Ext.encode(["account_id", "account_name", "account_no", "account_type_code"]),
	            jsonMap : Ext.encode([{"admdiv_code" : ["=", Ext.getCmp("admdiv").getValue()]}])
			},
			success : function(response, options) {
				 var data = Ext.decode(response.responseText);
				 if(data.pageCount > 0) {
					 var payeeAccountInfo = data.root[0];
					 Ext.Msg.show({
					     title:'确认',
					     msg: '是否将零余额资金转入账号：' 
					    	 + payeeAccountInfo.account_name 
					    	 + '[' + payeeAccountInfo.account_no + ']？',
					     buttons: Ext.Msg.OKCANCEL,
					     icon: Ext.Msg.QUESTION,
					     fn : function(buttonId, text) {
					    	 if(buttonId == 'ok') {
					    		 _suspendCreditAll(payeeAccountInfo);
					    	 }
					     }
					});
				 } else {
					 Ext.Msg.alert('系统提示', '无法找到挂账账号信息，请先设置挂账账号后再执行挂账操作！');
				 }
			},
            failure: function(response, options) {
                Ext.Msg.alert('获取挂账账户异常', response.responseText);
            }
		});
}

function _suspendCreditAll(payeeAccountInfo){
	var infoWinAll = Ext.widget('window', {
		title: '操作信息',
		width : 400,
		height : 300,
		autoScroll: true, 
		modal : true,
		html : ''
	});

		Ext.Ajax.request({
			url : 'suspend/suspendCreditAll.do',
			method : 'POST',
			params : {
				menu_id :  Ext.PageUtil.getMenuId(),
				admdivCode : Ext.getCmp("admdiv").getValue(),
				payeeAccountNo : payeeAccountInfo.account_no,
				payeeAccountName : payeeAccountInfo.account_name,
				payeeAccountTypeCode : payeeAccountInfo.account_type_code
			},
			success : function(response, options) {
				infoWinAll.update(response.responseText);
				refreshData();
			},
	        failure: function(response, options) {
	        	infoWinAll.update(response.responseText);
	        	refreshData();
	        }
		});
	infoWinAll.show();
}


/*******************************************************************************
 * 撤销挂账
 */
function revokeCredit() {
	var records = _getRecords();
	if (records.length == 0) {
		Ext.Msg.alert('系统提示', '请至少选择一条数据！');
		return ;
	}
	 Ext.Msg.show({
	     title:'确认撤销',
	     msg: '确定要撤销挂账吗？',
	     buttons: Ext.Msg.OKCANCEL,
	     icon: Ext.Msg.QUESTION,
	     fn : function(buttonId, text) {
	    	 if(buttonId == 'ok') {
	    		 if(!Ext.isEmpty(records)) {
    				var infoWin = Ext.widget('window', {
    					title: '操作信息',
    					width : 400,
    					height : 300,
    					layout : 'border',
    					resizable : false,
    					closeAction : 'destroy',
    					records : records,
    					modal : true,
    					addInfo : function(succ, info) {
    						//添加执行信息
    						Ext.getCmp("msgPanel").body
    						.createChild({tag : 'div', html : info})
    						.setStyle('color', succ ? 'green' : 'red');
    					},
    					items : [
    					         {
    					        	 id : 'msgPanel',
    					        	 region : 'center',
    					        	 layout : 'hbox',
    					        	 autoScroll: true, 
    					        	 bodyPadding : 5,
    					        	 html : ''
    					         }]
    				}).show();
    				 Ext.each(records, function(record) {
    					var item = record.raw;
    					Ext.Ajax.request({
    						url : 'suspend/revokeCredit.do',
    						method : 'POST',
    						params : {
    							menu_id :  Ext.PageUtil.getMenuId(),
    							admdivCode : Ext.getCmp("admdiv").getValue(),
    							agencyName : item.agency_name,
    							payAccountId : item.account_id,
    							payAccountNo : item.account_no,
    							payAccountName : item.account_name,
    							payeeAccountNo : item.susacc_no,
    							payeeAccountName : item.susacc_name,
    							id : item.id   //挂账记录
    						},
    						success : function(response, options) {
    							infoWin.addInfo(true, "【账号:"+item.account_no + "】撤销挂账成功！");
    							refreshData();
    						},
    			            failure: function(response, options) {
    			            	infoWin.addInfo(false, "【账号:"+item.account_no + "】撤销挂账异常！"+response.responseText);
    			            	refreshData();
    			            }
    					});
    				});
    			}
	    	 }
	     }
	});
	
}

/*******************************************************************************
 * 全部撤销挂账
 */
function revokeCreditAll(){
	var admdiv = Ext.getCmp("admdiv").getValue();
	var infoWinAll = Ext.widget('window', {
		title: '操作信息',
		width : 400,
		height : 300,
		autoScroll: true, 
		modal : true,
		html : ''
	});
	 Ext.Msg.show({
	     title:'确认撤销',
	     msg: '确定要全部撤销挂账吗？',
	     buttons: Ext.Msg.OKCANCEL,
	     icon: Ext.Msg.QUESTION,
	     fn : function(buttonId, text) {
	    	 if(buttonId == 'ok') {
	    		 Ext.Ajax.request({
	    				url : 'suspend/revokeCreditAll.do',
	    				method : 'POST',
	    				params : {
			    					menu_id :  Ext.PageUtil.getMenuId(),
			    					admdiv_code : admdiv
	    					},
	    				success : function(response, options) {
	    					infoWinAll.update(response.responseText);
	    					refreshData();
	    				},
	    				failure: function(response, options) {
	    					infoWinAll.update(response.responseText);
	    					refreshData();
	    				}
	    		});
	    		infoWinAll.show(); 
	    	 }
	     }
	});
	 
}