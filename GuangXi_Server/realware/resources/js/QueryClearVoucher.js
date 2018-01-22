/*******************************************************************************
 * 主要用于划款单查询
 * 
 * @type
 */

/***
 * 引入需要使用的js文件
 */
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/recommend.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/operationLog.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/ocxVoucher.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/createReport.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/lookPayVoucher.js"></scr' + 'ipt>');
/**
 * 列表
 */
var gridPanel1 = null;

/**
 * 数据项
 */
var fileds = ["pay_clear_voucher_code", "pay_amount", "agent_account_no",
		"agent_account_name", "agent_bank_name", "clear_account_no",
		"clear_account_name", "clear_bank_name", "fund_type_code",
		"fund_type_name", "pay_type_code", "pay_type_name", "pay_bank_code",
		"pay_bank_name", "vou_date", "confirm_date", "clear_date", "print_num",
		"print_date", "bgt_type_code", "bgt_type_name",
		"bill_type_id", "pay_clear_voucher_id", "task_id","tips_pack_no","voucher_status","is_pbc","voucher_status_des","voucher_status_err"]; // 数据项

/**
 * 列名
 */
var header = "查看支付凭证|do1|130|lookPayVoucher,凭证状态|voucher_status_des|150,失败原因|voucher_status_err|200,划款凭证单编码|pay_clear_voucher_code|140,汇总清算金额|pay_amount,收款银行账号|agent_account_no,收款银行账户名称|agent_account_name,收款银行|agent_bank_name,付款账号|clear_account_no,"
		+ "付款账户名称|clear_account_name,付款银行|clear_bank_name,资金性质编码|fund_type_code,资金性质名称|fund_type_name,支付方式编码|pay_type_code,支付方式|pay_type_name,"
		+ "代理银行编码|pay_bank_code,代理银行名称|pay_bank_name,生成日期|vou_date|100,回单日期|confirm_date|100,清算日期|clear_date,打印次数|print_num,打印时间|print_date,预算类型编码|bgt_type_code,"
		+ "预算类型名称|bgt_type_name,Tips文件包号|tips_pack_no,是否人行账户|is_pbc";

		
/**
 * 界面加载
 */
Ext.onReady(function() {
	Ext.QuickTips.init();
	gridPanel1 = getGrid(loadUrl, header, fileds, true, true);
	gridPanel1.setHeight(document.documentElement.scrollHeight - 145);
	gridPanel1.getStore().on('beforeload', function(thiz, options) {
				var admdiv = Ext.getCmp('admdiv').getValue();
				if (admdiv == null || admdiv == "")
					return;
				/**
				 * 进行公用方法调用时，首先将对账日期设为空值，则被忽略
				 * 返回后的查询条件，再根据支付日期情况，添加支付日期
				 */
				var el = Ext.getCmp("key_date");
				var _date = el.getValue();
				el.setValue("");
				beforeload(Ext.getCmp("clearVoucherQuery"), options, Ext.encode(fileds));
				if(!Ext.isEmpty(_date)){
					el.setValue(_date);
					var key_date = el.getRawValue();
					var jsonMap = "\"vou_date \":" + Ext.encode(["like", key_date]);
					if (null == options.params || options.params == undefined) {
						options.params = [];
						options.params["jsonMap"] = "[{" + jsonMap + "}]";
						options.params["filedNames"] =JSON.stringify(fileds);
					} else {
						options.params["jsonMap"] = options.params["jsonMap"].substring(0, options.params["jsonMap"].length - 2) + "," + jsonMap + "}]";
						options.params["filedNames"] =JSON.stringify(fileds);
					}
				}

			});
	//按钮触发事件			
	var buttonItems = [{
				id : 'commitTips',
				hidden : true,
				handler : function() {
					var admdiv_code = Ext.getCmp('admdiv').getValue();
					exportTIPS(admdiv_code);
				}
			}, 
				{
				id : 'sendAgain',
				handler : function() {
					sendPayClearVoucherAgain();
				}
			}, 
				{
				id : 'print1',
				handler : function() {
					var key_date = Ext.getCmp("key_date").getRawValue();
					var admdiv_code = Ext.getCmp("admdiv").getValue();
					if(Ext.isEmpty(key_date)){
						Ext.Msg.alert("系统提示", "对账月份不能为空!");
						return;
					}
					
					var data = "[{\"key_date\":[\"" + key_date + "\"],\"admdiv_code\":[\""+ admdiv_code + "\"]}]";
					GridPrintDialog('undefined','undefined', loadGrfURL,loadDataURL,"reconciliation", data,100);
				}
			},
				{
				id : 'commitTipsAgain',
				handler : function() {												
					commitTIPS();
				}
			},{
				id : 'look',
				handler : function() {
					lookOCX(gridPanel1.getSelectionModel().getSelection(),"pay_clear_voucher_id");
				}
			}, {										
				id : 'Send',
				hidden : true,
				handler : function() {
					sendVoucher(sendCLearUrl);
				}
			},{
				id : 'log',
				handler : function() {
					taskLog(gridPanel1.getSelectionModel().getSelection(),"pay_clear_voucher_id");
				}
			}, {
				id : 'refresh',
				handler : function() {
					refreshData();
				}
	}];
			
	//查询区						
	var queryItems =  [{
			title : "查询区",
			id : 'clearVoucherQuery',
	    	 frame : false,
	    	 defaults : {
					padding : '0 3 0 3'
				},
			 layout : {
					type : 'table',
					columns : 4
				},
			 bodyPadding : 5,
		
			items : [{
				dataIndex : 'task_status',
				value : '000',
				hidden : true
			}, {
				id : 'admdiv',
				fieldLabel : '所属财政',
				xtype : 'combo',
				dataIndex : 'admdiv_code',
				displayField : 'admdiv_name',
				emptyText : '请选择',
				valueField : 'admdiv_code',
				labelWidth : 70,
				editable : false,
				store : comboAdmdiv,
				style : 'margin-bottom:0px;margin-top:5px;margin-left:5px;margin-right:5px;',
				width : 230,
				value : comboAdmdiv.data.length > 0
						? comboAdmdiv.data.getAt(0).get("admdiv_code")
						: ""
			}, {
				id : 'createDateStar',
				fieldLabel : '生成日期',
				xtype : 'datefield',
				dataIndex : "create_date",
				format : 'Ymd',
				symbol : '>=',
				labelWidth : 70,
				width : 230,
				style : 'margin-bottom:0px;margin-top:5px;margin-left:5px;margin-right:5px;',
				data_type:'date'
			},{
				id : 'createDateEnd',
				fieldLabel : '&nbsp&nbsp&nbsp&nbsp&nbsp至',
				xtype : 'datefield',
				dataIndex : "create_date ",
				format : 'Ymd',
				symbol : '<=',
				labelWidth : 70,
				width : 230,
				style : 'margin-bottom:0px;margin-top:5px;margin-left:5px;margin-right:5px;',
				maxValue : new Date(),
				data_type:'date'
			}, {
				id : 'clearDateStar',
				fieldLabel : '清算日期',
				xtype : 'datefield',
				dataIndex : 'clear_date',
				format : 'Y-m-d',
				symbol : '>=',
				labelWidth : 70,
				width : 230,
				style : 'margin-bottom:0px;margin-top:5px;margin-left:5px;margin-right:5px;',
				data_type:'date',
				data_format : 'yyyy-MM-dd'
			}, {
				id : 'clearDateEnd',
				fieldLabel : '&nbsp&nbsp&nbsp&nbsp&nbsp至',
				xtype : 'datefield',
				dataIndex : 'clear_date ',
				format : 'Y-m-d',
				symbol : '<=',
				labelWidth : 70,
				width : 230,
				style : 'margin-bottom:0px;margin-top:5px;margin-left:5px;margin-right:5px;',
				data_type:'date',
				data_format : 'yyyy-MM-dd'
			}, {
				id : 'confirmDateStar',
				fieldLabel : '回单日期',
				xtype : 'datefield',
				dataIndex : "confirm_date",
				format : 'Y-m-d',
				symbol : '>=',
				labelWidth : 70,
				width : 230,
				style : 'margin-bottom:0px;margin-top:5px;margin-left:5px;margin-right:5px;',
				data_type:'date',
				data_format : 'yyyy-MM-dd'
			}, {
				id : 'confirmDateEnd',
				fieldLabel : '&nbsp&nbsp&nbsp&nbsp&nbsp至',
				xtype : 'datefield',
				dataIndex : "confirm_date ",
				format : 'Y-m-d',
				symbol : '<=',
				labelWidth : 70,
				width : 230,
				style : 'margin-bottom:0px;margin-top:5px;margin-left:5px;margin-right:5px;',
				data_type:'date',
				data_format : 'yyyy-MM-dd'
			}, {
				id : 'code',
				fieldLabel : '划款单编号',
				xtype : 'textfield',
				dataIndex : 'pay_clear_voucher_code',
				labelWidth : 70,
				style : 'margin-bottom:0px;margin-top:5px;margin-left:5px;margin-right:5px;',
				width : 230
			}, {
				id : 'voucherState',
				fieldLabel : '凭证状态',
				xtype : 'combo',
				dataIndex : 'voucher_status',
				displayField : 'name',
				allowBlank : 'false',
				mode : 'local',
				emptyText : '请选择',
				valueField : 'value',
				labelWidth : 70,
				store : comboVoucherStatus,
				Visible : false,
				value : '',
				width : 230,
				style : 'margin-bottom:5px;margin-top:5px;margin-left:5px;margin-right:5px;',
				editable : false,
				listeners : {
					'select' : selectVoucherStore
				}
			},{
				id : 'voucherCode_special',
				fieldLabel : '支付凭证号',
				xtype : 'textfield',
				dataIndex : 'pay_voucher_code',
				labelWidth : 70,
				style : 'margin-bottom:5px;margin-top:5px;margin-left:5px;margin-right:5px;',
				width : 230
			},{
				id : 'key_date',
				fieldLabel : '对账月份',
				xtype : 'datefield',
				format : 'Ym',
				dataIndex : "vou_date",
				symbol : 'like',
				labelWidth : 70,
				style : 'margin-bottom:5px;margin-top:5px;margin-left:5px;margin-right:5px;',
				width : 180
			},{
				id : 'billType',
				fieldLabel : '单据类型',
				xtype : 'combo',
				dataIndex : 'vt_code',
				displayField : 'name',
				allowBlank : 'false',
				mode : 'local',
				emptyText : '请选择',
				valueField : 'value',
				labelWidth : 70,
				store : billTypeStore,
				Visible : false,
				value : "",
				style : 'margin-bottom:5px;margin-top:5px;margin-left:5px;margin-right:5px;',
				width : 230,
				editable : false,
				listeners : {
					'select' : selectVoucherStore
				}
			}]
	},gridPanel1];

	Ext.StatusUtil.createViewport(buttonItems, queryItems, function() {
		Ext.StatusUtil.initPage(Ext.getCmp("admdiv"));
		Ext.getCmp('sendAgain').disable(false);
	});
});
/**
 * 数据来源
 */

var comboVoucherStatus = Ext.create('Ext.data.Store', {
			fields : ['name', 'value'],
			data : [{
						"name" : "全部",
						"value" : ""
					}, {
						"name" : "银行未发送",
						"value" : "13"
					}, {
						"name" : "清算行未接收",
						"value" : "0"
					}, {
						"name" : "清算行接收成功",
						"value" : "1"
					}, {
						"name" : "清算行接收失败",
						"value" : "2"
					}, {
						"name" : "清算行签收成功",
						"value" : "3"
					}, {
						"name" : "清算行签收失败",
						"value" : "4"
					}, {
						"name" : "清算行已退回",
						"value" : "5"
					},{
						"name" : "已收到清算行回单",
						"value" : "12"
					}]	
		});

var billTypeStore = Ext.create('Ext.data.Store',{
	fields : ['name','value'],
	data : [{
				"name" : "全部",
				"value" : ""
			},{
				"name" : "划款凭证",
				"value" : "2301" 
			}, {
				"name" : "退款凭证",
				"value" : "2302"
			}]
});


/**
 * 选择条件
 */
function selectAdmdiv() {
	setBtnVisible(Ext.getCmp("admdiv").getValue(), null);
	refreshData();
}
/**
 * 说明：划款单查询页面只有在"对方接收失败"的时候才会调用重新发送接口，
 *     而对于"对方签收失败"和"对方已退回"不会在这个菜单里处理，所以
 *     在这两个状态将"划款单重新发送"设置为不可用
 * @return
 */
function selectVoucherStore() {
		var voucherStatus = Ext.getCmp('voucherState').getValue();
		if ("2" == voucherStatus|| "0" == voucherStatus || "4" == voucherStatus || "5" == voucherStatus 
				|| "14" == voucherStatus || "8" == voucherStatus || "10" == voucherStatus ) {
			Ext.getCmp('look').disable(false);
			Ext.getCmp('sendAgain').enable(true);
			
		} else {
			Ext.getCmp('look').enable(false);
			Ext.getCmp('sendAgain').disable(false);
		}
		if("2"==voucherStatus||"4"==voucherStatus||"5"==voucherStatus||""==voucherStatus){
			Ext.getCmp("voucher_status_err").setVisible(true);
		}else{
			Ext.getCmp("voucher_status_err").setVisible(false);
		}
	refreshData();
}
/*******************************************************************************
 * 刷新
 * 
 * @return
 */
function refreshData() {
	gridPanel1.getStore().loadPage(1);
}


function commitTIPS(admdiv_code) {
//	bank_type == 103
	var admdiv_code = Ext.getCmp('admdiv').getValue();
	var records = gridPanel1.getSelectionModel().getSelection();
	var is_pbc;
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请选中凭证信息！");
		return;
	}
	var billIds = null;
	Ext.Array.each(records, function(model) {
				billIds = billIds + model.get("pay_clear_voucher_id") + ",";
				is_pbc = model.get("is_pbc");
			});
	if(records.length>1){
		alert("请操作一条数据进行提交tips");
		return;
	}
	//判断是否人行发送
	if (is_pbc!=1) {
		alert("请操作人行发送的数据");
		return;
	}
	var pay_amount = records[0].get('pay_amount');
	//金额为负，需输入支付交易序号
	if(pay_amount < 0){
		Ext.widget('window', {
			id : 'payFlow',
			title : '支付交易序号',
			width : 250,
			height : 120,
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
							xtype : 'textfield',
							height : 40,
							width : 215,
							id : 'flow'
						}],
				buttons : [{
					text : '确定',
					handler : function() {
						if (Ext.getCmp('flow').getValue() == "")
							Ext.Msg.alert("系统提示", "支付交易序号不能為空！");
						else {
							var myMask = new Ext.LoadMask('payFlow', {
								msg : '后台正在处理中，请稍后....',
								removeMask : true
									// 完成后移除
								});						
							var returnRes=Ext.getCmp('flow').getValue();
							if(returnRes.length!=8){
								alert("支付交易序号需为8位");
								return;
							}
							myMask.show();
							// 提交到服务器操作
							Ext.Ajax.request({
										url : '/realware/clearSendTIPS.do',
										method : 'POST',
										timeout : 180000, // 设置为3分钟
										params : {
											payDictateNo : Ext.getCmp('flow').getValue(),
											billIds : billIds,
											chr_code : "tbs.payclearvoucher.code",
											admdiv_code : admdiv_code
										},
										// 提交成功的回调函数
										success : function(response, options) {
											succAjax(response, myMask,true);
											Ext.getCmp('payFlow').close();
											refreshData();
										},
										// 提交失败的回调函数
										failure : function(response, options) {
											failAjax(response, myMask);
											Ext.getCmp('payFlow').close();
										}
									});
						}
					}
				}, {
					text : '取消',
					handler : function() {
						this.up('window').close();
						myMask.hide();
					}
				}]

			})]
		}).show();
	}
	else{
		var myMask1 = new Ext.LoadMask(Ext.getBody(), {
			msg : '后台正在处理中，请稍后....',
			removeMask : true
				// 完成后移除
			});
		myMask1.show();
		Ext.Ajax.request({
			url : '/realware/clearSendTIPS.do',
			method : 'POST',
			timeout : 180000, // 设置为3分钟
			params : {
				againFlag:"yes",
				billIds : billIds,
				chr_code : "tbs.payclearvoucher.code",
				admdiv_code : admdiv_code
			},
			success : function(response, options) {
				succAjax(response, myMask1,true);
				refreshData();
			},
			failure : function(response, options) {
				failAjax(response, myMask1);
			}
		});
	}

}

/**
 * 导出tips到本地保存
 * @returns
 */
function exportTIPS() {
	var admdiv_code = Ext.getCmp('admdiv').getValue();
	var records = gridPanel1.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请选中凭证信息！");
		return;
	}
	var billIds = [];
	Ext.Array.each(records, function(model) {
				billIds.push(model.get("pay_clear_voucher_id"));
			});
	var params = {
		billIds : billIds,
		admdiv_code : admdiv_code
	};
	if (records[0].get("pay_amount") < 0) {
		Ext.widget('window', {
			id : 'payFlow',
			title : '支付交易序号',
			width : 250,
			height : 120,
			layout : 'fit',
			resizable : false,
			modal : true,
			items : [{
				xtype : 'form',
				layout : {
					type : 'hbox',
					padding : '10'
				},
				resizable : false,
				modal : true,
				items : [],
				buttons : [{
					text : '确定',
					handler : function() {
						if (Ext.getCmp('flow').getValue() == ""){
							Ext.Msg.alert("系统提示", "支付交易序号不能為空！");
						} else {		
							var returnRes=Ext.getCmp('flow').getValue();
							if(returnRes.length>8){
								Ext.Msg.alert("系统提示", "长度不能超过8个字节");
								return;
							};
							params.payDictateNo = returnRes;
							Ext.getCmp('payFlow').close();
							exportTIPS(params);
						}
					}
				}, {
					text : '取消',
					handler : function() {
						this.up('window').close();
					}
				}]
			}]
		}).show();
	} else{
		params.againFlag="yes";
		exportTIPS(params);
	}
}

function exportTIPS(params){
	if (!Ext.fly('downForm')) {
			var downForm = document.createElement('form');
			downForm.id = 'downForm';
			downForm.name = 'downForm';
			downForm.className = 'x-hidden';
			downForm.action = '/realware/exportTIPS.do';
			downForm.method = 'post';
			var data = document.createElement('input');  
			data.type = 'hidden';// 隐藏域
			data.name = 'params';// form表单参数
			data.value = Ext.encode(params);// form表单值
			downForm.appendChild(data); 
			document.body.appendChild(downForm);
		}
		Ext.fly('downForm').dom.submit({
			 success: function(form, action) {
			 	Ext.Msg.alert("系统提示","abc");
			 },
			 callback: function(s){
				Ext.Msg.alert("系统提示","callback");
			}
		});
		if (Ext.fly('downForm')) {
			document.body.removeChild(downForm);
		}
}

/*******************************************************************************
 * 	签章发送、发送
 */
function sendVoucher(url) {
//	alert(url);
	var records = gridPanel1.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请选中一条凭证信息！");
		return;
	}
	var reqIds = "";
	for (var i = 0; i < records.length; i++) {
		reqIds += records[i].get("pay_clear_voucher_id");
		if (i < records.length - 1)
			reqIds += ",";
	}
	var bill_type_id=records[0].get("bill_type_id");
	var myMask = new Ext.LoadMask(Ext.getBody(), {
			msg : '后台正在处理中，请稍后....',
			removeMask : true // 完成后移除
		});
}

/*******************************************************************************
 * 	划款单重新发送
 */
function sendPayClearVoucherAgain() {
	var records = gridPanel1.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请选择需要重新发送的划款单！");
		return;
	}
	var ids = null;
	// 选中的凭证的id数组，要传到后台
	for (var i = 0; i < records.length; i++) {
		ids += records[i].get("pay_clear_voucher_id");
		if (i < records.length - 1)
			ids += ",";
	}
	var myMask = new Ext.LoadMask(Ext.getBody(), {
		msg : '后台正在处理中，请稍后....',
		removeMask : true
			// 完成后移除
		});
	myMask.show();
	Ext.Ajax.request({
				url : '/realware/sendPayClearVoucherAgain.do',
				method : 'POST',
				timeout : 180000, //设置为3分钟
				params : {
					ids : ids
				},
				success : function(response, options) {
					succAjax(response, myMask,true);
				},failure : function(response, options) {
					failAjax(response, myMask);
					refreshData();
				}
			});
}

