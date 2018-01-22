/*******************************************************************************
 * 授权额度通知单打印
 * 
 * @type
 */

/***
 * 引入需要使用的js文件
 */
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/recommend.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/operationLog.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/ocxVoucher.js"></scr' + 'ipt>');
	

var gridPanel1 = null;
var isFlow = true;
/**
 * 数据项
 */
var fileds=["voucher_status","voucher_status_des","plan_agent_note_code","plan_amount","plan_month","fund_type_code","pay_bank_code","fund_type_name","pay_bank_name",
            "pay_bank_code","create_date","print_num","print_date","voucherFlag","bgt_type_code","bgt_type_name","plan_agent_note_id","bill_type_id","vou_date", "send_flag"];

/**
 * 列名
 */
var header = "凭证状态|voucher_status_des|150,额度通知单编号|plan_agent_note_code|120,金额|plan_amount,计划月份|plan_month|110,资金性质编码|fund_type_code,资金性质|fund_type_name,代理银行编码|pay_bank_code|100,"
		+ "代理银行名称|pay_bank_name|100,凭证日期|vou_date|110,打印次数|print_num,打印时间|print_date,预算类型编码|bgt_type_code,预算类型名称|bgt_type_name|110"
//		+"预算项目编码|Dep_pro_code,预算项目|Dep_pro_name,项目编码|Pro_cat_code,项目|Pro_cat_name,编制机构编码|Opt_org_code,编制机构|Opt_org_name,调整类型编码|Adjust_type_code,调整类型|Adjust_type_name,凭证状态|voucherFlag,";


/*******************************************************************************
 * 状态
 */
var voucherFlagStore = Ext.create('Ext.data.Store', {
			fields : ['name', 'value'],
			data : [{
						"name" : "全部",
						"value" : ""
					},{
						"name" : "银行未发送",
						"value" : "14"
					},{
						"name" : "银行已退回",
						"value" : "22"
					}, {
						"name" : "财政未接收",
						"value" : "6"
					}, {
						"name" : "财政接收成功",
						"value" : "7"
					}, {
						"name" : "财政接收失败",
						"value" : "8"
					}, {
						"name" : "财政签收成功",
						"value" : "9"
					}, {
						"name" : "财政签收失败",
						"value" : "10"
					}, {
						"name" : "财政已退回",
						"value" : "11"
					}]
				});

/**
 * 界面加载
 */
Ext.onReady(function() {
	Ext.QuickTips.init();
	Ext.Loader.setPath('Ext', 'js/util');
	Ext.require(['Ext.PageUtil']);

		gridPanel1 = getGrid(loadUrl, header, fileds, true, true);
		gridPanel1.setHeight(document.documentElement.scrollHeight - 118);
		/**
		 * 设置单选模式，避免在5105 未发送状态下，包含未向凭证库发送过和已发送但凭证库为未发送状态
		 * lfj 2015-11-27
		 */
		gridPanel1.getSelectionModel().setSelectionMode('SINGLE');
		
		// 根据查询条件检索数据
		gridPanel1.getStore().on('beforeload', function(thiz, options) {
			var panel = Ext.ComponentQuery.query("panel[title='查询区']")[0];
			beforeload(panel, options, Ext.encode(fileds)); 
	});

	var buttonItems = [
           	{ 	id : 'look',
           		handler : function() {
           			//新增pay_amount属性并将plan_amoount属性值 设置给pay_amount
                    var records = gridPanel1.getSelectionModel().getSelection();
                      if(records.length > 0){
                        for(var i = 0 ; i<records.length;i++){
                          records[i].data.pay_amount = records[i].data.plan_amount;
                        }
                      }
                    lookOCX(records,"plan_agent_note_id");
	            }
           	}, {
           		id : 'refresh',
           		handler : function() {
           			refreshData();
           		}
           	},{
           		id : 'againSend',
           		handler : function() {
           			sendVoucher();
           		}
           	}];

   var queryItems=[{
			   	title : "查询区",
			   	//items : gridPanel1,
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
					id : 'admdiv',
						fieldLabel : '所属财政',
						xtype : 'combo',
						dataIndex : 'admdiv_code',
						displayField : 'admdiv_name',
						emptyText : '请选择',
						valueField : 'admdiv_code',
						style : 'margin-bottom:5px;margin-top:5px;margin-left:5px;margin-right:5px;',
						editable : false,
						store : comboAdmdiv
					},{
						id : 'voucherflag',
						fieldLabel : '凭证状态',
						xtype : 'combo',
						dataIndex : 'voucher_status',
						displayField : 'name',
						emptyText : '请选择',
						valueField : 'value',
						store : voucherFlagStore,
						editable : false,
						style : 'margin-bottom:5px;margin-top:5px;margin-left:5px;margin-right:5px;',
						listeners : {
							change : function(combo, newValue, oldValue, eOpts) {
							try {
								selectFlagState(combo.valueModels[0].raw.value,combo, newValue, oldValue, eOpts);
							} catch(e) {}
							}
						}
											
						},{
							id : 'vouDate',
							fieldLabel : '凭证日期',
							xtype : 'datefield',
							format : 'Ymd',
							dataIndex : 'vou_date',
							style : 'margin-bottom:5px;margin-top:5px;margin-left:5px;margin-right:5px;'
						}, {
							id : 'agency',
							fieldLabel : '资金性质编码',
							xtype : 'textfield',
							dataIndex : 'fund_type_code',
							symbol : 'like',
							style : 'margin-bottom:5px;margin-top:5px;margin-left:5px;margin-right:5px;'
						},{
							id : 'agency1',
							fieldLabel : '资金性质名称',
							xtype : 'textfield',
							dataIndex : 'fund_type_name',
							symbol : 'like',
							style : 'margin-bottom:5px;margin-top:5px;margin-left:5px;margin-right:5px;'
						}]
	               	
       },gridPanel1];
       
       Ext.StatusUtil.createViewport(buttonItems, queryItems, function() {
    	   	Ext.StatusUtil.initPage(Ext.getCmp("admdiv"));
    	   	Ext.getCmp('voucherflag').setValue("");
    		
       });
       Ext.getCmp("voucher_status_des").renderer = function(value){
			if(null != value){
				value = value.replace("对方", "财政");
				value = value.replace("本方", "银行");
				    if(value=="未发送"){
				    		value = "银行未发送";
				    }								
			}
			return value;
		};
});

/*******************************************************************************
 * 切换状态
 * 
 * @return
 */
function selectFlagState(status_code,combo, newValue, oldValue, eOpts) {
	if(status_code=='14'||status_code=='8'||status_code=='10'||status_code=='11'||status_code=='6'){
		Ext.StatusUtil.batchEnable("againSend");
	}else{
		Ext.StatusUtil.batchDisable("againSend");
	}
	if(oldValue != undefined || initialLoad) {
		refreshData();
	}
}

function selectAdmdiv() {
	setBtnVisible(Ext.getCmp("admdiv").getValue(), null);
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
/*******************************************************************************
 * 发送
 */
function sendVoucher() {
	var me = this;
	var records = gridPanel1.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert('系统提示', '请至少选择一条数据！');
		return;
		}
	if(records !=null) {
		var ids = []; // 凭证主键字符串
		var lastVers = []; // 凭证lastVer字符串
		Ext.Array.each(records, function(model) {
				ids.push(model.get("plan_agent_note_id"));
				lastVers.push(model.get("last_ver"));
		});
		var params = {
			billTypeId : records[0].get("bill_type_id"),
			billIds : Ext.encode(ids),
			last_vers : Ext.encode(lastVers)
		};
		var voucherflag = Ext.getCmp('voucherflag').getValue();
		
		if(voucherflag=='14'||voucherflag=='8'||voucherflag=='6'){//如果是【本方未发送】和【对方接受失败】，直接发送
			if(records[0].get("send_flag") == 1) {
				//如果以发送，再次通知mq发送消息给凭证库
				Ext.PageUtil.doRequestAjax(me,'sendVoucher.do',params);
			} else {
				//未发送过，直接发送凭证
				Ext.PageUtil.doRequestAjax(me,'/realware/signAndSendPlanAgentNoteReturn.do',params);
			}
		} else { //如果是【对方签收失败】和【对方已退回】，作废在发送
			Ext.PageUtil.doRequestAjax(me,'/realware/sendVoucherAgain.do',params);
		}
	}
}
