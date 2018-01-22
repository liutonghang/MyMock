

/*******************************************************************************
 * 引入需要使用的js文件
 */
document
		.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/recommend.js"></scr' + 'ipt>');
document
		.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/backVoucher.js"></scr' + 'ipt>');
document
		.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/ocxVoucher.js"></scr' + 'ipt>');

/*******************************************************************************
 * 主要用于广西农行实拨确认
 * 
 * @type
 */

var fileds = ["realpay_voucher_code", "amount", "payee_account_no",
		"payee_account_name", "payee_account_bank","payee_account_bank_no" ,"pay_account_no",
		"pay_account_name", "pay_account_bank", "exp_func_name",
		"fund_type_code", "fund_type_name", "pay_type_code", "pay_type_name",
		"pay_summary_code", "pay_summary_name", "pay_date", "print_num",
		"print_date", "voucherflag", "task_id", "bill_type_id",
		"realpay_voucher_id", "return_reason","create_date","pb_set_mode_code","pb_set_mode_name","last_ver","urgent_flag","city_code","bankbusinesstype"];
//退票原因|return_reason|150,
var header = "行号补录|do1|100|addBankno,拨款凭证编码|realpay_voucher_code,拨款金额|amount,收款行行号|payee_account_bank_no|100,银行结算方式名称|pb_set_mode_name|140,省市代码|city_code,生成日期|create_date|140,支付日期|pay_date|140,收款人账号|payee_account_no|140,收款人名称|payee_account_name|140,收款人银行|payee_account_bank|140,付款人账号|pay_account_no|140,付款人|pay_account_name,付款人开户行|pay_account_bank|140,"
		+ "资金性质编码|fund_type_code|140,资金性质|fund_type_name|140,支付方式编码|pay_type_code|140,支付方式|pay_type_name|140,用途编码|pay_summary_code|140,用途名称|pay_summary_name|140,打印次数|print_num,"
		+ "打印日期|print_date,凭证状态|voucherflag";

Ext.onReady(function() {
	// 初始化Ext.QuickTips，启用悬浮提示
		Ext.QuickTips.init();
		try {
		if(bankBusinessType != undefined){
			besType =1;
		}
		}catch(Exception){
			besType = 0;
		}
		//引用工具类
		Ext.Loader.setPath('Ext', 'js/util');
		Ext.require(['Ext.PageUtil']);	
		// 启用自动加载
		Ext.Loader.setConfig( {
			enabled : true
		});
		vouGridPanel = getGrid("/realware/loadRealPayWithBankNo.do", header,
				fileds, true, true);
		vouGridPanel.title = "实拨凭证信息";
		vouGridPanel.setHeight(document.documentElement.scrollHeight - 95);
		// 根据查询条件检索数据
		vouGridPanel.getStore().on('beforeload', function(thiz, options) {
			var admdiv = Ext.getCmp('admdiv').getValue();
			if (admdiv == null || admdiv == "")
				return false;
			beforeload(Ext.getCmp("regidsterQuery"), options, Ext.encode(fileds));
		});

		var buttonItems =  [
							{
								id : 'signsend',
								handler : function() {
									acceptRealPay();
								}
							},{
								id : 'manAffirmSucc',
								handler : function() {
									manAffirm("succ");
								}
							},
							{
								id : 'manAffirmFail',
								handler : function() {
									manAffirm("fail");
								}
							},
							{	
								id: 'afreshSend',
								handler : function() {
									afreshSend();
								}
							},{
								id:'look',
								handler : function() {
									lookOCX(gridPanel1.getSelectionModel().getSelection(),"realpay_voucher_id");
								}
							},{
								id:'log',
								handler : function() {
									taskLog(gridPanel1.getSelectionModel().getSelection(),"realpay_voucher_id");
								}
							},{
								id:'refresh',
								handler : function() {
									refreshData();
								}
							} ];
		
		var queryItems =  [ {
					title : "查询区",
					items : [{
						id : 'regidsterQuery',
						xtype : 'toolbar',
						bodyPadding : 6,
						layout : 'column',
						defaults : {
							margins : '10 10 10 0'
						},
						items : [ {
							id : 'taskState',
							fieldLabel : '当前状态',
							xtype : 'combo',
							displayField : 'status_name',
							dataIndex : 'task_status',
							emptyText : '请选择',
							valueField : 'status_code',
							labelWidth : 60,
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
							id : 'code',
							fieldLabel : '凭证号',
							xtype : 'textfield',
							symbol : '=',
							labelWidth : 45,
							width : 140,
							dataIndex : 'realpay_voucher_code'
						}, {
							id : 'vou_Date',
							fieldLabel : '凭证日期',
							xtype : 'datefield',
							dataIndex : 'vou_date',
							format : 'Y-m-d',
							labelWidth : 53
						} ]
					}]
				}, vouGridPanel ];
			Ext.StatusUtil.createViewport(buttonItems, queryItems, function() {
			Ext.StatusUtil.initPage(Ext.getCmp("admdiv"), Ext.getCmp("taskState"));
			// 默认设置为未生成
			Ext.getCmp('taskState').setValue("001");

		});
});

/***************************************************************************
 * 状态下拉列表框选中事件
 */
function selectState() {
	var taskState = Ext.getCmp('taskState').getValue();
	var store = null;
	var column = null;
	if ("001" == taskState) {
		vouGridPanel.down('#myActionColumn').show();
		Ext.getCmp('signsend').enable(false);
		Ext.getCmp('afreshSend').enable(false);
		Ext.getCmp('manAffirmSucc').disable(false);
		Ext.getCmp('manAffirmFail').disable(false);
	} else if ("002" == taskState) {
		vouGridPanel.down('#myActionColumn').hide();
		Ext.getCmp('signsend').disable(false);
		Ext.getCmp('afreshSend').disable(false);
			Ext.getCmp('manAffirmSucc').disable(false);
		Ext.getCmp('manAffirmFail').disable(false);
	}else if("004" == taskState){
		vouGridPanel.down('#myActionColumn').hide();
		Ext.getCmp('signsend').disable(false);
		Ext.getCmp('afreshSend').disable(false);
			Ext.getCmp('manAffirmSucc').disable(false);
		Ext.getCmp('manAffirmFail').disable(false);
	}else if("003" == taskState){
		Ext.getCmp('signsend').disable(false);
		Ext.getCmp('afreshSend').enable(false);
		Ext.getCmp('manAffirmSucc').enable(false);
		Ext.getCmp('manAffirmFail').enable(false);
	}
	
	refreshData();
}

/***************************************************************************
 * 所属财政
 */
function selectAdmdiv() {
	refreshData();
}

/***************************************************************************
 * 刷新
 */
function refreshData() {
 	vouGridPanel.getStore().load();
}


var bankWin = null;
var rowIndex1 = null;

var bankTypeStore = Ext.create('Ext.data.Store', {
				fields : ['name', 'value'],
				data : [{
							"name" : "同行",
							"value" : "1"
						}, {
							"name" : "跨行",
							"value" : "2"
						}]
			});

/**************************************************************************
 * 行号补录
 * @param {Object} grid
 * @param {Object} rowIndex
 * @param {Object} colIndex
 * @param {Object} node
 * @param {Object} e
 * @param {Object} record
 * @param {Object} rowEl
 * @memberOf {TypeName} 
 * @return {TypeName} 
 */
function addBankno(grid, rowIndex, colIndex, node, e, record, rowEl) {
	var b = true;
	rowIndex1 = rowIndex;
	var bankStore = Ext.create('Ext.data.Store', {
				fields : [{
							name : 'bank_name'
						}, {
							name : 'bank_no'
						}, {
							name : "match_ratio"
						}, {
							name : "like_ratio"
						}],
				proxy : {
					extraParams : {
						acctno : record.data['payee_account_no'],
						bankname : encodeURI(record.data['payee_account_bank']),
						fields : JSON.stringify(["bank_name", "bank_no",
								"match_ratio", "like_ratio"])
					},
					type : 'ajax',
					url : '/realware/loadBanknos.do',
					reader : {
						type : 'json'
					}
				}
			});
	bankStore.load(function(records, operation, success) {
		if (!success) {
			Ext.Msg.show({
						title : '失败提示',
						msg : '行号检索失败！',
						buttons : Ext.Msg.OK,
						icon : Ext.MessageBox.ERROR
					});
			return;
		}
		if (b) {
			if (bankWin == null) {
				var me = this;
				bankWin = Ext.create('Ext.window.Window', {
					title : '补录信息对话框',
					width : 400,
					height : besType == 0 ? 300: 340,
					layout : 'fit',
					resizable : false,
					closeAction : 'hide',
					modal : true,
					items : [new Ext.FormPanel({
						bodyPadding : 5,
						items : [{
							id : 'bankType',
							fieldLabel : '转账方式',
							xtype : 'combo',
							dataIndex : 'bankType',
							displayField : 'name',
							valueField : 'value',
							labelWidth : 80,
							width : 320,
							editable : false,
							store : bankTypeStore,
							value : record.data['pb_set_mode_code'] == ""? "2": record.data['pb_set_mode_code'],
							listeners:{
								scope: me,
								'select': function(){
									if(Ext.getCmp("bankType").getValue() == 1 ){
										Ext.getCmp("txtcitycode").setDisabled(false);
										
									}else{
										Ext.getCmp("txtcitycode").setValue("");
										Ext.getCmp("txtcitycode").setDisabled(true);
									}
						         }
						    }
						},{
							id : 'txtcitycode',
							fieldLabel : '省市代码',
							xtype : 'textfield',
							dataIndex : 'txtcitycode',
							labelWidth : 80,
							width : 320,
							editable : true               
						}
						,{
							border : 0,
							layout : 'hbox',
							height : 35,
							defaults : {
								margins : '3 10 0 0'
							},
							items : [{
										id : 'ori_bankname',
										fieldLabel : '收款行名称',
										xtype : 'textfield',
										labelWidth : 80,
										width : 320
									}, {
										text : '查询',
										xtype : 'button',
										handler : function() {
											var oribankname = Ext.getCmp('ori_bankname').getValue();
											bankStore.load({
												params : {
													acctno : record.data['payee_account_no'],
													bankname : encodeURI(oribankname)
												}
											});
										}
									}]
						}, {
							xtype : 'gridpanel',
							id : 'gridBankno',
							viewConfig : {
								enableTextSelection : true
							},
							store : bankStore,
							columns : [{
										text : '银行名称',
										dataIndex : 'bank_name',
										width : '220'
									}, {
										text : '银行行号',
										dataIndex : 'bank_no',
										width : '180'
									}],
							height : 180,
							listeners : {
								'itemdblclick' : function(view, record, item,index, e) {
									var bankNo = record.get("bank_no");
									var bankName = record.get("bank_name");
									grid.getStore().data.items[rowIndex1].set("payee_account_bank_no", bankNo);
									grid.getStore().data.items[rowIndex1].set("payee_account_bank", bankName);
									grid.getStore().data.items[rowIndex1].set("pb_set_mode_name",Ext.getCmp('bankType').rawValue);
									grid.getStore().data.items[rowIndex1].set("pb_set_mode_code", Ext.getCmp('bankType').getValue());
									grid.getStore().data.items[rowIndex1].set("city_code", Ext.getCmp('txtcitycode').getValue());
									this.up('window').hide();
								}
							}
						}],
						buttons : [{
							text : '确定',
							handler : function() {
								var setModeCode =Ext.getCmp('bankType').getValue();
								var setModeName = Ext.getCmp('bankType').getRawValue();
								var citycodevalue = Ext.getCmp('txtcitycode').getValue();
								 
								var records = Ext.getCmp('gridBankno').getSelectionModel().getSelection();
								if(records.length>0){
									grid.getStore().data.items[rowIndex1].set("payee_account_bank_no", records[0].get("bank_no"));
									grid.getStore().data.items[rowIndex1].set("payee_account_bank", records[0].get("bank_name"));
								}
								grid.getStore().data.items[rowIndex1].set("pb_set_mode_name", setModeName);
								grid.getStore().data.items[rowIndex1].set("pb_set_mode_code", setModeCode);
								grid.getStore().data.items[rowIndex1].set("city_code",citycodevalue);
								this.up('window').hide();
								
							}
						}, {
							text : '取消',
							handler : function() {
								this.up('form').getForm().reset();
								this.up('window').hide();
							}
						}]
					})]
				});
			} else {
				Ext.getCmp("gridBankno").getStore().removeAll();
				Ext.getCmp("gridBankno").getStore().add(bankStore.getRange());
			}
			var voucherBankType = record.data['pb_set_mode_name'];
			if(voucherBankType=="同行"){
				Ext.getCmp('bankType').setValue("1");
			}else if(voucherBankType == "跨行"){
				Ext.getCmp('bankType').setValue("2");
				Ext.getCmp("txtcitycode").setValue("");
			}
			Ext.getCmp("txtcitycode").setDisabled(Ext.getCmp('bankType').getValue() == "1" ? false : true); 
			Ext.getCmp("ori_bankname").setValue(record.get("payee_account_bank"));
			
			bankWin.show();
		}
	});
}

function acceptRealPay() {
	var records = vouGridPanel.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请选中一条凭证信息！");
		return;
	}
	var bill_type_id="";
	bill_type_id=records[0].get("bill_type_id");
	
	var ajaxBool = true;
	
	var bankNos = "";  //收款行行号
	var reqIds = [];  // 凭证主键字符串
	var reqVers=[];   //凭证lastVer字符串
	var bankTypeCode="";   //代理银行结算方式编码
	var bankTypeName="";   //代理银行结算方式名称
	var urgent_flag="";   //加急标志
	var urgent_flag_name="";   //加急标志名称
	var cityCode = "";
	var pbBusinessType = "";
	for ( var i = 0; i < records.length; i++) {		
		//验证是否都已补录行号
		var payeeAcctBankno = records[i].get("payee_account_bank_no");
		var tempCode = records[i].get("pb_set_mode_code");
		bankNos += records[i].get("payee_account_bank_no");
		reqIds.push(records[i].get("realpay_voucher_id"));
		reqVers.push(records[i].get("last_ver"));
		bankTypeCode += records[i].get("pb_set_mode_code");
		bankTypeName += records[i].get("pb_set_mode_name");
		urgent_flag += records[i].get("urgent_flag");
		var payeeAcctBankName = records[i].get("payee_account_bank");
		var tempcityCode = records[i].get("city_code");
		var payeeAcctNo = records[i].get("payee_account_no");
		cityCode += records[i].get("city_code");

		urgent_flag_name += records[i].get("urgent_flag")==0?"-1":records[i].get("urgent_flag")==1?"加急":"普通";
		if (i < records.length - 1){
			bankNos += ",";	
			bankTypeCode += ",";
			bankTypeName += ",";
			urgent_flag += ",";
			urgent_flag_name += ",";
			cityCode += ",";
		}

		if(payeeAcctBankName.indexOf("农行") >= 0 || payeeAcctBankName.indexOf("农业银行") >= 0){
		
				if(payeeAcctNo.length == 15){
					if (Ext.isEmpty(tempcityCode) || tempcityCode.replace(/\s+/g,"")=="") {
							Ext.Msg.alert("系统提示", "凭证：" +  records[i].get("realpay_voucher_code")+ "为农行15位收款人账号，请先补录省市代码！");
							ajaxBool = false;
							return;
					}
				}else if(!Ext.isEmpty(tempcityCode)&&tempcityCode.replace(/\s+/g,"")!=""){
			
					Ext.Msg.alert("系统提示", "凭证：" +  records[i].get("realpay_voucher_code")+ "不为农行15位收款人账号，请不要补录省市代码！");
					ajaxBool = false;
					return;
					
				}
		}else if(Ext.isEmpty(payeeAcctBankno) || payeeAcctBankno.replace(/\s+/g,"")==""){
				Ext.Msg.alert("系统提示", "凭证：" + records[i].get("realpay_voucher_code")+ "请先补录行号再进行确认操作！");
				ajaxBool = false;
				return ;
		}else if(payeeAcctBankno.length != 12){
				Ext.Msg.alert("系统提示", "凭证：" + records[i].get("realpay_voucher_code")+ "行号必须为12位！");
				ajaxBool = false;
				return ;
		}
	}
	if(ajaxBool){
		var myMask = new Ext.LoadMask(Ext.getBody(), {
				msg : '后台正在处理中，请稍后....',
				removeMask : true // 完成后移除
			});
		myMask.show();
		Ext.Ajax.request( {
			url : '/realware/acceptRealPay.do',
			method : 'POST',
			timeout : 180000, // 设置为3分钟
			params : {
				bankNos : bankNos,
				billTypeId : bill_type_id,
				billIds : Ext.encode(reqIds),
				last_vers: Ext.encode(reqVers),
				bankTypeCode:bankTypeCode,
				bankTypeName:bankTypeName,
				urgent_flag : urgent_flag,
				urgent_flag_name : urgent_flag_name,
				city_code :cityCode
			},
			success : function(response, options) {
				succAjax(response, myMask,true);				
			},
			failure : function(response, options) {
				failAjax(response, myMask);
				refreshData();
			}
		});
	}
}



function manAffirm(affirm){
	var records = vouGridPanel.getSelectionModel().getSelection();
	if (records.length == 0||records.length>1) {
			Ext.Msg.alert("系统提示", "请选中一条凭证信息");
			return;
	}

		var reqIds = [];
		var reqVers = [];
		Ext.Array.each(records, function(model) {
				reqIds .push(model.get("realpay_voucher_id"));
				reqVers.push(model.get("last_ver"));
		});
		
		var myMask = new Ext.LoadMask(Ext.getBody(), {
			msg : '后台正在处理中，请稍后....',
			removeMask : true
				// 完成后移除
			});
		myMask.show();
		Ext.Ajax.request({
					method : 'POST',
					timeout : 180000, // 设置为3分钟
					url : '/realware/queryTranByRealPay.do',
					params : {
						// 单据类型id
						billTypeId : records[0].get("bill_type_id"),
						billIds : Ext.encode(reqIds),
						last_vers : Ext.encode(reqVers),
						queryResult:affirm
					},
					success : function(response, options) {
						myMask.hide();
						var msg = response.responseText;
						if (msg.indexOf("parent.window.location.href = 'login.do';") != -1) {
							Ext.Msg.alert('系统提示', 'session失效 请重新登陆！');
							parent.window.location.href = 'login.do';
						} else {
							if(affirm == "succ"){
								
								acceptRealPay();
							}else{
								popupTransMsgBox();
							}
								
						}

					},
					failure : function(response, options) {
						failAjax(response, myMask);
					}
				});
	
}	


function popupTransMsgBox(){
	Ext.widget('window',{
		id : 'tranMsgBOX',
		title : '转账信息提示框',
		width : 120,
		height : 100,
		layout : 'fit',
		resizable : false,
		modal : true,
		items :[Ext.widget('form', {
				renderTo : Ext.getBody(),
				layout : {
					type : 'absolute',
					padding : 20
				},
				resizable : false,
				modal : true,
				bodyPadding: 10,
				items:[
				{	
					xtype: 'button',
					text : '再次确认',
					height: 25,
					width: 60,
					x:20,
					y:20,
					handler : function(){
						acceptRealPay();
						Ext.getCmp('tranMsgBOX').close();
					}
				}]})	
				]	
	}).show();
}


/**
 * 实拔退回财政增加退回原因输入
 * Modify by ruanzx 20141201
 */
function afreshSend() {	
	var records = vouGridPanel.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请选中一条凭证信息！");
		return;
	}
	var reqIds = "";

	for ( var i = 0; i < records.length; i++) {
		reqIds += records[i].get("realpay_voucher_id");
		if (i < records.length - 1)
			reqIds += ",";
	}

	Ext.widget('window', {
		id : 'backWin',
		title : '退回财政原因',
		width : 380,
		height : 150,
		layout : 'fit',
		resizable : false,
		modal : true,
		items : [Ext.widget('form', {
					renderTo : Ext.getBody(),
					layout : {
						type : 'hbox',
						padding : '10'
					},
					resizable : false,
					modal : true,
					items : [{
								xtype : 'textareafield',
								height : 70,
								width : 345,
								id : 'operRemark'
							}],
					buttons : [{
						text : '确定',
						handler : function() {
							// 退票/退回原因
							var operRemark = Ext.getCmp('operRemark').getValue();
							if (operRemark == ""){
								Ext.Msg.alert("系统提示", "退回财政原因不能为空！");
								return ;
							};
							if (operRemark.length > 40) {
								Ext.Msg.alert("系统提示", "退回财政原因长度不能超过40个字！");
								return;
							};
							
							var myMask = new Ext.LoadMask('backWin', {
									msg : '后台正在处理中，请稍后....',
									removeMask : true   // 完成后移除
									});
							myMask.show();
							
							// 提交到服务器操作
							Ext.Ajax.request({
										url : '/realware/returnRealPay.do',
										method : 'POST',
										timeout : 180000, // 设置为3分钟
										params : {
											billIds : reqIds,
											operRemark : operRemark
										},
										// 提交成功的回调函数
										success : function(response,options) {
											succAjax(response,myMask);
											Ext.getCmp('backWin').close();
											refreshData();
										},
										// 提交失败的回调函数
										failure : function(response,options) {
											failAjax(response,myMask);
										}
									});
							}
					}, {
						text : '取消',
						handler : function() {
							this.up('window').close();
						}
					}]
				})]
	}).show();
}

