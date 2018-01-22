/*******************************************************************************
 * 2555,2557对账
 */

/*******************************************************************************
 * 引入需要使用的js文件
 */
document.write('<scr'+ 'ipt type="text/javascript" src="/realware/resources/js/recommend.js"></scr'+ 'ipt>');
document.write('<scr'+ 'ipt type="text/javascript" src="/realware/resources/js/share/operationLog.js"></scr'+ 'ipt>');
document.write('<scr'+ 'ipt type="text/javascript" src="/realware/resources/js/share/ocxVoucher.js"></scr'+ 'ipt>');


var gridPanel = null;

var checkPanel = null;

/**
 * 列名
 */
var filed = ["check_batch_id", "pay_mode","vou_date", "pack_no","create_date", "send_date","check_date",
		"virtual_mode", "check_status", "bill_type_id","last_ver", "vt_code", "admdiv_code",
		"child_pack_num","total_count","acct_type","account_no"];
var header = "对账批次号|pack_no|200,收款渠道|pay_mode|160,账户类型|acct_type|150,账号|account_no|150,"
	    + "生成日期|create_date|150,对账结果|check_status|140,子包总数|child_pack_num|100,明细总条数|total_count|100,"
		+ "发送时间|send_date|200,对账时间|check_date|100";

var fields = ["pack_no","result_des","check_detail_id","virtual_mode","cfm_date","pay_amt","pack_no","pay_mode","check_status","agent_business_no",
              "cfm_time","pay_account_name","pay_account_no","pay_account_bank","payee_account_no","bank_code","operator","batch_no","pay_code"]

var headers = "对账批次号|pack_no|150,对账失败描述|result_des|200,收款渠道|virtual_mode|160,缴款码|pay_code|160,缴款日期|cfm_date|150,缴款时间|cfm_time|100,金额|pay_amt|100,确认交易流水号|agent_business_no|150,缴款人全称|pay_account_name|150," +
		      "缴款人账号|pay_account_no|100,缴款人开户行|pay_account_bank|150,收款人账号|payee_account_no|150,银行网点编码|bank_code|100" ;
              
              
//凭证状态
var combo = Ext.create("Ext.data.Store", {
		fields : [ "name", "value" ],
		data : [{
			"name" : "全部",
			"value" : ""
		},{
			"name" : "未对账",
			"value" : 0
		},{
			"name" : "对账成功",
			"value" : 1
		},{
			"name" : "对账失败",
			"value" : 2
		}]

});
Ext.onReady(function() {
	 		if(vt_code == '2557'){
//	 			filed.push("virtual_type");
//	 			filed.push("account_no");
	 			Ext.Array.remove(filed,"pay_mode"); 
	 		}else if(vt_code == '2555'){
	 			Ext.Array.remove(filed,"acct_type"); 
	 			Ext.Array.remove(filed,"account_no"); 
	 		}
			Ext.QuickTips.init();
			gridPanel = getGrid(url, header, filed, true, true);
			gridPanel.setHeight(document.documentElement.scrollHeight - 115);
			// 根据查询条件检索数据
			gridPanel.getStore().on('beforeload', function(thiz, options) {
				beforeload(Ext.getCmp("CheckQuery"), options, Ext.encode(filed));
				options.params["billTypeId"] = 5553;
			});
			
			var buttonItems = [{
						id : 'create',
						handler : function() {
				            create(vt_code);
						}
					}, {
						id : 'send',
						handler : function() {
						      send();
						}
					},{
						id : 'look',
						handler : function(){
						      look();
					    }
					},{
						id : 'cancel',
						handler : function(){
							cancel();
						}
					}, {

						id : 'refresh',
						handler : function() {
							refreshData();
						}
					}];
			var queryItems = [{
						title : '查询条件',
						id : 'CheckQuery',
						bodyPadding : 5,
						layout : {
							type : 'table',
							columns : 4
						},
						items : [{
									id : 'taskState',
									fieldLabel : '当前状态',
									xtype : 'combo',
									dataIndex : 'task_status',
									displayField : 'status_name',
									emptyText : '请选择',
									valueField : 'status_code',
									symbol : '=',
									editable : false,
									style : 'margin-left:5px;margin-right:5px;',
									listeners : {
										'change' : selectState
									}
								},{
									id : 'admdiv',
									fieldLabel : '所属财政',
									xtype : 'combo',
									dataIndex : 'admdiv_code',
									displayField : 'admdiv_name',
									emptyText : '请选择',
									valueField : 'admdiv_code',
									editable : false,
									store : comboAdmdiv,
									style : 'margin-left:5px;margin-right:5px;'
							   },{
									id : 'result',
									fieldLabel : '对账结果',
									xtype : 'combo',
									dataIndex : 'check_status',
									displayField : 'name',
									emptyText : '请选择',
									valueField : 'value',
									value : "",
									editable : false,
									store : combo,
									listeners : {
										'change' : selectResult
									}
							   },{}, {
									id : 'confirmDate',
									fieldLabel : '生成日期',
									xtype : 'datefield',
									dataIndex : 'create_date',
									format : 'Ymd',
									symbol : '>=',
									style : 'margin-left:5px;margin-right:5px;',
									data_type : 'date'
							   }, {
									id : 'confirmDatee',
									fieldLabel : '至',
									xtype : 'datefield',
									dataIndex : 'create_date ',
									format : 'Ymd',
									symbol : '<=',
									style : 'margin-left:5px;margin-right:5px;',
									data_type : 'date'
							   }, {
									id : 'vtCode',
									fieldLabel : '编码',
									xtype : 'textfield',
									dataIndex : 'vt_code',
									value : vt_code,
									hidden : true
							   }]
						 	},gridPanel];
			Ext.StatusUtil.createViewport(buttonItems, queryItems, function() {
						Ext.StatusUtil.initPage(Ext.getCmp("admdiv"),Ext.getCmp("taskState"));
					});
			 Ext.getCmp("taskState").setValue("000");
			 Ext.getCmp("check_status").renderer = function(value){
					if(null != value){
						    if(value == 0){
						    	value = "未对账";
						    }else if(value == 1){
						    	value = "对账成功";
						    }else if(value == 2){
						    	value = "对账失败";
						    }else if(value == 3){
						    	value = "已作废";
						    }							
					}
					return value;
				};
			
				if(vt_code == '2555'){
					Ext.getCmp("pay_mode").renderer = function(value){
						if(null != value){
							if("1" == value){
								value = "查缴模式";
							}else if("11" == value){
								value = "柜台缴款";
						    }else if("12" == value){
						    	value = "自助终端";
						    }else if("13" == value){
						    	value = "网上缴款";
						    }else if("2" == value){
						    	value = "推送模式";
						    }else if("21" == value){
						    	value = "POS刷卡";
						    }else if("22" == value){
						    	value = "网上支付";
						    }else if("3" == value){
						    	value = "划缴模式";
						    }else if("4" == value){
						    	value = "虚拟账号模式";
						    }else if("9" == value){
						    	value = "其他";
						    }							
						}
						return value;
					};
				}else if(vt_code == '2557'){
					Ext.getCmp("acct_type").renderer = function(value){
						if(null != value){
							if("1" == value){
								value = "财政专户";
							}else if("2" == value){
								value = "汇缴专户";
						    }else if("3" == value){
						    	value = "科目";
						    }						
						}
						return value;
					};
				}
		});
/**
 * 控制按钮状态
 * *****************************************************************************
 */
function selectState() {
	var taskState = Ext.getCmp('taskState').getValue();
	if("000" == taskState){
		Ext.getCmp('create').enable();
		Ext.getCmp('send').enable();
		Ext.getCmp('look').disable();
		Ext.getCmp('result').disable();		
	}else if("001" == taskState){
		Ext.getCmp('result').enable();
		Ext.getCmp('send').disable();
		Ext.getCmp('create').disable();
		Ext.getCmp('look').enable();		
	}else if("002" == taskState){
		Ext.getCmp('create').disable();
		Ext.getCmp('send').disable();
		Ext.getCmp('look').disable();
		Ext.getCmp('result').disable();
	}
	Ext.getCmp('cancel').disable();
}

function selectResult(){
	var result = Ext.getCmp('result').getValue();
	var status = Ext.getCmp('taskState').getValue();
	if(Ext.isEmpty(result) || result == 1){
		Ext.getCmp('cancel').disable();
		Ext.getCmp('send').disable();
	}else{
		Ext.getCmp('cancel').enable();
		Ext.getCmp('send').enable();
	}	
//	if(status == 001 && (result == 1 || result ==2)){
//		Ext.getCmp('send').enable();
//	}else{
//		Ext.getCmp('send').disable();
//	}
	refreshData();
}

function refreshData() {
	gridPanel.getStore().loadPage(1);
}

//生成
function create(vt_code){
	Ext.widget('window', {
		title : '对账日期',
		width : 250,
//		id : 'windows',
		height : 115,
		resizable : false,
		closeAction : 'destory',
		modal:true,
		items : [Ext.widget('form', {
			renderTo : Ext.getBody(),
			bodyStyle:'padding:10px 5px 0 5px',
			resizable : false,
			modal : true,
			items : [{
				        name : 'createDate',
				        xtype : 'datefield',
						width : 220,
						format : "Ymd",
						value : new Date(),
						allowBlank : false
					}],	     
		buttons : [{
			text : '确定',
			handler : function() {
				var form = this.up('form');
				var win =  this.up('window');
				form.submit({
					url : '/realware/nontaxCheckVoucher.do',
					waitTitle : '提示',
					params : {
						 menu_id : Ext.PageUtil.getMenuId(),
					     admdivCode : Ext.getCmp('admdiv').getValue(),
					     vtCode : vt_code
					},
					waitMsg : '后台正在处理中，请您耐心等候...',
					params : {
					     menu_id : Ext.PageUtil.getMenuId(),
					     admdivCode : Ext.getCmp('admdiv').getValue(),
					     vtCode : vt_code
				    },
					success : function(form, action) {
			    	    Ext.PageUtil.succForm(form, action);
			    	    win.close();
						refreshData();
					},
					failure : function(form, action) {
						 Ext.PageUtil.failForm(form, action)
					}
				});
			}
		},{
			text : '取消',
			handler : function() {
				this.up('window').close();
			}
		 }]
	  })]
	}).show();
}

//发送
function send(){
    var records = gridPanel.getSelectionModel().getSelection();
    if(records.length != 1){
    	Ext.MessageBox.alert("提示消息","请选择一条数据！");
    	return;
    }
	var myMask = new Ext.LoadMask(Ext.getBody(), {
		msg : '后台正在处理中，请稍后....',
		removeMask : true
		});
	myMask.show();
    Ext.Ajax.request({
		url : '/realware/nontaxSendVoucher.do',
		method : 'POST',
		dataType: "json",
		timeout : 180000, // 设置为3分钟
		params : {
    	        id : records[0].get("check_batch_id"),
				menu_id :  Ext.PageUtil.getMenuId()
		},
		// 提交成功的回调函数
		success : function(response,options) {
			if(!Ext.isEmpty(response.responseText)) {
			    Ext.MessageBox.alert("提示消息",response.responseText);
			}
			myMask.hide();
			refreshData();
		},failure : function(response, options) {
			Ext.Msg.alert("系统提示", "发送失败，原因：" + response.responseText);
			myMask.hide();
			refreshData();
		}		
    });
}

//查询
function look(){
	var records = gridPanel.getSelectionModel().getSelection();
	if(records.length != 1){
		Ext.MessageBox.alert("提示消息","请选择一条数据！");
		return;
	}
	if(vt_code == 2557 ){
		headers = "对账批次号|pack_no|150,对账失败描述|result_des|200,缴款码|pay_code|160,批次号|batch_no,金额|pay_amt|100," +
				"资金流水号|agent_business_no|150";	
			
	}
	
	checkPanel = getGrid("/realware/queryDiscrepancies.do", headers, fields, false, true,"vou_");
	checkPanel.getStore().on('beforeload', function(thiz, options) {
		options.params = [];
		options.params["filedNames"] = JSON.stringify(fields);
		options.params["check_batch_id"] = records[0].get("check_batch_id");
		options.params["menu_id"] = Ext.PageUtil.getMenuId();
	});
	checkPanel.getStore().load({
				method : 'post',
				params : {
					start : 0,
					pageSize : 200,
					limit : 25
				}
			});
	Ext.widget('window', {
				id : 'checkWindow',
				title : '不符明细凭证信息',
				width : 700,
				height : 400,
				layout : 'fit',
				resizable : false,
				modal : true,
				items : [checkPanel]
			}).show();
}

//作废
function cancel(){
	var records = gridPanel.getSelectionModel().getSelection();
	if(records.length != 1){
		Ext.MessageBox.alert("提示消息","请选择一条数据！");
		return;
	}
	if(records[0].get("check_status") == 1){
		Ext.MessageBox.alert("提示消息","对账成功的数据不能进行作废操作！");
		return;
	}
	
	Ext.MessageBox.confirm('作废提示', '是否确定作废选中的数据？', function(id){
		if(id == 'yes'){
			var myMask = new Ext.LoadMask(Ext.getBody(), {
				msg : '后台正在处理中，请稍后....',
				removeMask : true
				});
			myMask.show();
		    Ext.Ajax.request({
				url : '/realware/nontaxCancel.do',
				method : 'POST',
				dataType: "json",
				timeout : 180000, // 设置为3分钟
				params : {
		    	        id : records[0].get("check_batch_id"),
						menu_id : Ext.PageUtil.getMenuId(),
						vt_code : vt_code
				},
				// 提交成功的回调函数
				success : function(response,options) {
					if(!Ext.isEmpty(response.responseText)) {
					    Ext.MessageBox.alert("提示消息",response.responseText);
					}
					myMask.hide();
					refreshData();
				},failure : function(response, options) {
					Ext.Msg.alert("系统提示", "作废失败，原因：" + response.responseText);
					myMask.hide();
					refreshData();
				}		
		    });
		}
		
	});
	
	
}
