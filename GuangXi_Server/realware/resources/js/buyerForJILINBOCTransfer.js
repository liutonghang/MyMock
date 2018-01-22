/**
 * @author 柯伟
 * @todo 挂账
 */
/***
 * 引入需要使用的js文件
 */
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/recommend.js"></scr' + 'ipt>');
/**
 * 列表
 */
var gridPanel1 = null;

/**
 * 数据项
 */
var fileds = ["pay_charge_voucher_id","pay_charge_voucher_code","pay_account_code","agency_code","payee_account_no","bank_code","writeoff_flag","trade_type","pay_amount","agent_business_no","admdiv_code"]; 

/**
 * 列名
 */
var header = "凭证号|pay_charge_voucher_code|150,付款账号|pay_account_code|150,收款账号|payee_account_no|150,交易金额|pay_amount|60,交易名称|trade_type|150,交易状态|writeoff_flag|150,所属财政编码|admdiv_code|80|";
/**
 * 当前用户所属网点是否为主办网点
 */
var isHost = 'false';
/*******************************************************************************
 * 状态
 */
var comboStore = Ext.create('Ext.data.Store', {
			fields : ['name', 'value'],
			data : [{
						"name" : "未挂账",
						"value" : "35"
					}, {
						"name" : "已挂账",
						"value" : "36"
					}]
		});
/**
 * 界面加载
 */
Ext.require(["Ext.grid.*", "Ext.data.*"]);
Ext.onReady(function() {
	Ext.QuickTips.init();
	gridPanel1 = getGrid(loadUrl, header, fileds, true, true);
	gridPanel1.setHeight(document.documentElement.scrollHeight - 88);
	// 根据查询条件检索数据
	gridPanel1.getStore().on('beforeload', function(thiz, options) {
		var admdiv = Ext.getCmp('admdivCom').getValue();
		if ("" == admdiv || null == admdiv)
			return;
		beforeload(Ext.getCmp("chargeVoucherQuery"), options, Ext.encode(fileds));
		
		checkIsHost();
	});
	Ext.create('Ext.Viewport', {
		id : 'chargeVoucherFrame',
		layout : 'fit',
		items : [Ext.create('Ext.panel.Panel', {
			tbar : [{
						id : 'buttongroup',
						xtype : 'buttongroup',
						items : [{
									id : 'saveBtn',
									text : '生成挂账凭证',
									iconCls : 'audit',
									scale : 'small',
									handler : function() {
										createChargeVoucher();
									}
								},{
									id : 'zeroToBGLBtn',
									text : '挂账',
									iconCls : 'cancle',
									scale : 'small',
									handler : function() {
										chargeVoucher();
									}
								},{
									id : 'BGLTozeroBtn',
									text : '撤销挂账',
									iconCls : 'pay',
									scale : 'small',
									handler : function() {
										chargeVoucher();
									}
								},{
									id : 'deleteBtn',
									text : '删除',
									iconCls : 'delete',
									scale : 'small',
									handler : function() {
										deleteCharVoucher(gridPanel1);
									}
								},{
									id : 'refreshBtn',
									text : '刷新',
									iconCls : 'refresh',
									scale : 'small',
									handler : function() {
										refreshData();
									}
								}
								]
					}],
			items : [{
				title : "查询区",
				items : gridPanel1,
				tbar : {
					id : 'chargeVoucherQuery',
					xtype : 'toolbar',
					bodyPadding : 8,
					layout : 'hbox',
					defaults : {
						margins : '3 5 0 0'
					},
					items : [{
						id : 'admdivCom',
						fieldLabel : '所属财政',
						xtype : 'combo',
						displayField : 'admdiv_name',
						dataIndex :  'admdiv_code',
						emptyText : '请选择',
						valueField : 'admdiv_code',
						labelWidth : 60,
						editable : false,
						store : comboAdmdiv,
						value : comboAdmdiv.data.length > 0 ? comboAdmdiv.data
								.getAt(0).get("admdiv_code") : "",
						listeners : {
							'select' : selectAdmdiv
						}
					},{
						id : 'taskState',
						fieldLabel : '当前状态',
						xtype : 'combo',
						dataIndex : 'task_status',
						displayField : 'name',
						emptyText : '请选择',
						valueField : 'value',
						store : comboStore,
						value : '35',
						editable : false,
						labelWidth : 60,
						width : 160,
						listeners : {
							'select' : selectState
						}
					},{
						id : 'accountNameField',
						fieldLabel : '账户名称',
						xtype : 'textfield',
						dataIndex : 'account_name',
						value : '',
						labelWidth : 55
					}, {
						id : 'accountNoField',
						fieldLabel : '账号',
						xtype : 'textfield',
						dataIndex : 'account_no',
						labelWidth : 30,
						value : ''
					}, {
						id : 'agencyCodeField',
						fieldLabel : '单位编码',
						xtype : 'textfield',
						dataIndex : 'agency_code',
						labelWidth : 55,
						value : ''
					}, {
						id : 'agencyBank_code',
						fieldLabel : '所属网点',
						xtype : 'textfield',
						dataIndex : 'bank_code',
						hidden : isHost=='true'?false:true,
						labelWidth : 55,
						value : ''
					}]
				}
			}]
		})]
	});
	selectState();
	selectAdmdiv();
	
});
/*******************************************************************************
 * 切换状态
 * 
 * @return
 */
function selectState() {
	var taskState = Ext.getCmp('taskState').getValue();
	if ("35" == taskState) {
		Ext.getCmp("saveBtn").enable();
		Ext.getCmp("zeroToBGLBtn").enable();
		Ext.getCmp('BGLTozeroBtn').disable();
	} else if ("36" == taskState) {
		Ext.getCmp("saveBtn").disable();
		Ext.getCmp("zeroToBGLBtn").disable();
		Ext.getCmp('BGLTozeroBtn').enable();
	}
	refreshData();
}
function selectAdmdiv() {
	setBtnVisible(Ext.getCmp("admdivCom").getValue(), Ext.getCmp("buttongroup"));
	refreshData();
}


function refreshData() {
	checkIsHost();
//	gridPanel1.getStore().load();
	var taskState = Ext.getCmp('taskState').getValue();
	gridPanel1.getStore().load({
			method : 'post',
			params : {
				start : 0,
				limit : 20000,
				filedNames : JSON.stringify(fileds),
				trade_type : taskState
			}
		});	
}


function checkIsHost(){
	Ext.Ajax.request({
	   url: 'isHost.do',
	   method:'GET',
	   success: function(response, options){
	   		isHost = response.responseText;
			//如果不是主办网点，则不提供网点过滤
			if('false' == isHost)
				Ext.getCmp("agencyBank_code").hide();
	   },
	   failure: function(){
	   	Ext.Msg.alert('警告', '初始化异常，请重新加载！'); 
	   }
	});
}
/**
 * 挂账
 */
function chargeVoucher() {
	var taskState = Ext.getCmp('taskState').getValue();
	if(isHost=='true'){
		if(taskState==35){
			Ext.Msg
			.alert("系统提示",
			"挂账失败，主办行无权挂账，请联系分网点");
		}else{
			Ext.Msg
			.alert("系统提示",
			"撤销挂账失败，主办行无权撤销挂账，请联系分网点");
		}
		return;
	}
	var myMask = new Ext.LoadMask(Ext.getBody(), {
		msg : '后台正在处理中，请稍后....',
		removeMask : true
			// 完成后移除
		});
	myMask.show();
	Ext.Ajax.request({
				url : '/realware/chargeVoucher.do',
				method : 'POST',
				timeout : 180000, // 设置为3分钟
				params : {
					trade_type : taskState,
					admdiv_code: Ext.getCmp('admdivCom').getValue()
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
/*******************************************************************************
 * 生成挂账凭证
 */
function createChargeVoucher() {
	if(isHost=='true'){
		Ext.Msg
		.alert("系统提示",
				"挂账生成失败，主办行无权生成挂账凭证，请联系分网点");
		return;
	}
	var myMask = new Ext.LoadMask(Ext.getBody(), {
		msg : '后台正在处理中，请稍后....',
		removeMask : true
			// 完成后移除
		});
	myMask.show();
	Ext.Ajax.request({
		url : '/realware/createChargeVoucher.do',
		method : 'POST',
		timeout : 180000, // 设置为3分钟
		params : {
			admdiv_code : Ext.getCmp('admdivCom').getValue()
		},
		success : function(response, options) {
			myMask.hide();
			Ext.Msg.buttonText.ok = "确认";
			Ext.Msg.show({
						title : '成功提示',
						msg : "生成成功！",
						buttons : Ext.Msg.OK,
						icon : Ext.MessageBox.INFO
					});
			refreshData();
		},
		failure : function(response, options) {
			myMask.hide();
			var reqst = response.status;
			var getText = response.responseText;
			if (reqst == "-1") {// 超时的状况码为 -1
				Ext.Msg
						.alert("系统提示",
								"挂账生成超时，可能存在网络异常，检查后请重试...");
			} else if (getText.indexOf("无法清算") != -1) {
				var voucherNoStr = getText
						.substring(20,
								getText.length - 11);
				var msg = getText;
				Ext.Msg.buttonText.ok = "查看凭证信息";
				Ext.Msg.show({
					title : '失败提示',
					msg : msg,
					buttons : Ext.MessageBox.OKCANCEL,
					fn : look,
					icon : Ext.MessageBox.ERROR
				});
				function look(id) {
					if (id == "ok") {
						lookErrorVoucher(voucherNoStr);
					}
				}
			} else {
				Ext.Msg.alert("系统提示",
						response.responseText);
			}
		}
	});

}
/**
 * 删除挂账凭证
 */

function deleteCharVoucher(gridPanel){
	if(isHost=='true'){
		Ext.Msg
		.alert("系统提示",
				"删除挂账失败，主办行无权删除挂账凭证，请联系分网点");
		return;
	}
	// 请求开始时，都先把selIds置空
	selIds = "";
	selNos = "";
	// 当前选中的数据
	var d_recordsr = gridPanel.getSelectionModel().getSelection();

	if (d_recordsr.length == 0) {
		Ext.Msg.alert("系统提示", "请至少选择一条数据！");
		return;
	}
	// 选中的凭证的id数组，要传到后台
	for (var i = 0; i < d_recordsr.length; i++) {
		selIds += d_recordsr[i].get("pay_charge_voucher_id");
		selNos += d_recordsr[i].get("pay_charge_voucher_code");
		if (i < d_recordsr.length - 1){
			selIds += ",";
			selNos += ",";
		}
	}
	Ext.MessageBox.confirm('删除提示', '是否确定删除 '+selNos+' 等挂账凭证？', delChargeVoucherSure);
}

function delChargeVoucherSure(id) {
	if (id == "yes") {
		var myMask = new Ext.LoadMask(Ext.getBody(), {
			msg : '后台正在处理中，请稍后....',
			removeMask : true
				// 完成后移除
			});
		myMask.show();
		// 提交到服务器操作
		Ext.Ajax.request({
			url : 'deleteChargeVoucher.do',
			method : 'POST',
			timeout : 180000, // 设置为3分钟
			params : {
				selIds : selIds,
				selNos : selNos
			},
			// 提交成功的回调函数
			success : function(response, options) {
				succAjax(response,myMask);
				refreshData();
			},
			// 提交失败的回调函数
			failure : function(response, options) {
				failAjax(response,myMask);
				refreshData();
			}
		});
	}
}