
/***
 * 引入需要使用的js文件
 */
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/recommend.js"></scr' + 'ipt>');

var payRefund_consistent = null;
var advanceAgent_consistent = null;
var currentValues = null;

Ext.require(["Ext.grid.*", "Ext.data.*"]);


//正向垫支户
var payAdvance = {
		xtype: 'container',
        layout: 'hbox',
        margin: '0 2 10 2',
        title :'正向垫支户',
        id : 'payAdvance',
        items : [{
        	xtype: 'fieldset',
            flex: 1,
            id : 'dirPayAdvance',
            title: '直接支付正向垫支户',
            defaultType: 'textfield', // each item will be a textfield
            layout: 'anchor',
            defaults: {
                anchor: '100%',
                hideEmptyLabel: false
            },
            items : [{
            	id : 'dirAdvanceNo',
            	fieldLabel: '账户账号'
            },{
            	id : 'dirAdvanceName',
            	fieldLabel: '账户名称'
            },{
            	id : 'dirAdvanceId',
            	fieldLabel: '账户id',
            	hidden: true
            }
            ]
        },{
            xtype: 'component',
            width: 10
        },{
        	xtype: 'fieldset',
            flex: 1,
            id : 'accrPayAdvance',
            title: '授权支付正向垫支户',
            defaultType: 'textfield', // each item will be a textfield
            layout: 'anchor',
            defaults: {
                anchor: '100%',
                hideEmptyLabel: false
            },
            items : [{
            	id : 'accrAdvanceNo',
            	fieldLabel: '账户账号'
            },{
            	id : 'accrAdvanceName',
            	fieldLabel: '账户名称'
            },{
            	id : 'accrAdvanceId',
            	fieldLabel: '账户id',
            	hidden : true
            }]
        }]
}
	
//正向划款户
var payAgent = {
		xtype: 'container',
        layout: 'hbox',
        margin: '0 2 10 2',
        title :'正向划款户',
        id : 'payAgent',
        items : [{
        	xtype: 'fieldset',
            flex: 1,
            id : 'dirPayAgent',
            title: '直接支付正向划款户',
            defaultType: 'textfield', // each item will be a textfield
            layout: 'anchor',
            defaults: {
                anchor: '100%',
                hideEmptyLabel: false
            },
            items : [{
            	id : 'dirAgentNo',
            	fieldLabel: '账户账号'
            },{
            	id : 'dirAgentName',
            	fieldLabel: '账户名称'
            },{
            	id : 'dirAgentId',
            	fieldLabel: '账户id',
            	hidden : true
            }]
        },{
            xtype: 'component',
            width: 10
        },{
        	xtype: 'fieldset',
            flex: 1,
            title: '授权支付正向划款户',
            id : 'accrPayAgent',
            defaultType: 'textfield', // each item will be a textfield
            layout: 'anchor',
            defaults: {
                anchor: '100%',
                hideEmptyLabel: false
            },
            items : [{
            	id : 'accrAgentNo',
            	fieldLabel: '账户账号'
            },{
            	id : 'accrAgentName',
            	fieldLabel: '账户名称'
            },{
            	id : 'accrAgentId',
            	fieldLabel: '账户id',
            	hidden: true
            }]
        }]
}
//退款垫支户
var refundAdvance = {
		xtype: 'container',
        layout: 'hbox',
        margin: '0 2 10 2',
        title :'退款垫支户',
        id : 'refundAdvance',
        items : [{
        	xtype: 'fieldset',
            flex: 1,
            title: '直接支付退款垫支户',
            id : 'refundPayAdvance',
            defaultType: 'textfield', // each item will be a textfield
            layout: 'anchor',
            defaults: {
                anchor: '100%',
                hideEmptyLabel: false
            },
            items : [{
            	id : 'dirRefundAdvanceNo',
            	fieldLabel: '账户账号'
            },{
            	id : 'dirRefundAdvanceName',
            	fieldLabel: '账户名称'
            },{
            	id : 'dirRefundAdvanceId',
            	fieldLabel: '账户id',
            	hidden:true
            }]
        },{
            xtype: 'component',
            width: 10
        },{
        	xtype: 'fieldset',
            flex: 1,
            title: '授权支付退款垫支户',
            id : 'refundAccrAdvance',
            defaultType: 'textfield', // each item will be a textfield
            layout: 'anchor',
            defaults: {
                anchor: '100%',
                hideEmptyLabel: false
            },
            items : [{
            	id : 'accrRefundAdvanceNo',
            	fieldLabel: '账户账号'
            },{
            	id : 'accrRefundAdvanceName',
            	fieldLabel: '账户名称'
            },{
            	id : 'accrRefundAdvanceId',
            	fieldLabel: '账户id',
            	hidden: true
            }]
        }]
}
//退款划款户
var refundAgent = {
		xtype: 'container',
        layout: 'hbox',
        margin: '0 2 10 2',
        title :'退款划款户',
        id : 'refundAgent',
        items : [{
        	xtype: 'fieldset',
            flex: 1,
            title: '直接支付退款划款户',
            id : 'refundPayAgent',
            defaultType: 'textfield', // each item will be a textfield
            layout: 'anchor',
            defaults: {
                anchor: '100%',
                hideEmptyLabel: false
            },
            items : [{
            	id : 'dirRefundAgentNo',
            	fieldLabel: '账户账号'
            },{
            	id : 'dirRefundAgentName',
            	fieldLabel: '账户名称'
            },{
            	id : 'dirRefundAgentId',
            	fieldLabel: '账户id',
            	hidden: true
            }]
        },{
            xtype: 'component',
            width: 10
        },{
        	xtype: 'fieldset',
            flex: 1,
            title: '授权支付退款划款户',
            id : 'refundAccrAgent',
            defaultType: 'textfield', // each item will be a textfield
            layout: 'anchor',
            defaults: {
                anchor: '100%',
                hideEmptyLabel: false
            },
            items : [{
            	id : 'accrRefundAgentNo',
            	fieldLabel: '账户账号'
            },{
            	id : 'accrRefundAgentName',
            	fieldLabel: '账户名称'
            },{
            	id : 'accrRefundAgentId',
            	fieldLabel: '账户id',
            	hidden: true
            }]
        }]
}

Ext.onReady(function() {
	
	var top = Ext.create('Ext.panel.Panel',{
		id : 'top',
		tbar : [{
					id : 'buttongroup',
					xtype : 'buttongroup',
					items : [{
								id : 'editBtn',
								text : '修改',
								iconCls : 'edit',
								scale : 'small',
								handler : function() {
									editAccount();
								}
							}, {
								id : 'cancleBtn',
								text : '取消',
								iconCls : 'cancle',
								scale : 'small',
								handler : function() {
									cancleAccount();
								}
							}, {
								id : 'saveBtn',
								text : '保存',
								iconCls : 'save',
								scale : 'small',
								handler : function() {
									saveAccount();	
								}
							},{
								id : 'queryBalanceBtn',
								text : '余额查询',
								iconCls : 'log',
								scale : 'small',
								hidden:false,
								handler : function() {
									queryBalanceDZH();
								}
							},{
								id : 'refreshBtn',
								text : '刷新',
								iconCls : 'refresh',
								scale : 'small',
								handler : function() {
									refreshData();
								}
							}]
				}],
		items : [{
					title : '查询条件',
					bodyPadding : 5,
					layout : 'hbox',
					defaults : {
						margins : '3 10 0 0'
					},
					items : [{
						id : 'admdivCom',
						fieldLabel : '所属财政',
						xtype : 'combo',
						dataIndex : 'admdiv_code',
						displayField : 'admdiv_name',
						emptyText : '请选择',
						valueField : 'admdiv_code',
						labelWidth : 55,
						editable : false,
						store : comboAdmdiv,
						value : comboAdmdiv.data.length > 0
														? comboAdmdiv.data.getAt(0).get("admdiv_code")
														: "",
						listeners : {
							'select' : selectAdmdiv
						}
							}]
				}]
	});
	
	
	
//创建主界面
var viewport = Ext.create('Ext.Viewport',{
		layout:'fit', 
	    items:[Ext.create('Ext.panel.Panel',{
	    	renderTo : Ext.getBody(),
	    	layout : 'anchor',
	    	frame: true,
	    	id : 'mainpanel',
	    	items : [top,{
	    				xtype: 'component',
            			width: 15
	    			},
	    			payAdvance,
	    			payAgent,
	    			refundAdvance,
	    			refundAgent]
	    })]  
	});
	setBtnVisible(Ext.getCmp("admdivCom").getValue(), Ext.getCmp("buttongroup"));
	if (comboAdmdiv.data.length > 0) {
		Ext.getCmp('admdivCom').setValue(comboAdmdiv.data.getAt(0)
				.get("admdiv_code"));
	}
	//加载数据
	refreshData();
	//设置布局
	setLayout();
	//设置不可读
	setDisable(true);
});


/**
 * 切换财政,读取pb_parameter参数,调整界面;
 * 默认全部显示，每家银行只可能有移除操作
 */
function setLayout(){
	var myMask = new Ext.LoadMask(Ext.getBody(), {
		msg : '后台正在处理中，请稍后....',
		removeMask : true // 完成后移除
	});
	myMask.show();
	// 提交到服务器操作
    Ext.Ajax.request({
    	url : loadPbParameterUrl,
		//method : 'POST',
		timeout : 180000,  //设置为3分钟
        // 提交成功的回调函数
        success : function(response, options){
        	myMask.hide();
			//后台传到前台的参数
			var obj = new Function("return" + response.responseText)();
		 	payRefund_consistent = obj.payRefund_consistent;
			advanceAgent_consistent = obj.advanceAgent_consistent;
			//正逆向一致时，移除逆向
			if(payRefund_consistent == "1"){
				removeItem('refundAdvance');
				removeItem('refundAgent');
				Ext.getCmp('dirPayAdvance').setTitle('直接支付垫支户');
				Ext.getCmp('accrPayAdvance').setTitle('授权支付垫支户');
			}
			//垫支户、划款户一致时，移除划款户
			if(advanceAgent_consistent == "1"){
				removeItem('payAgent');
				removeItem('refundAgent');
			}
			else if(advanceAgent_consistent == "0"&&payRefund_consistent == "1"){
				Ext.getCmp('dirPayAgent').setTitle('直接支付划款户');
				Ext.getCmp('accrPayAgent').setTitle('授权支付划款户');
			}
			//重新布局
			Ext.getCmp('mainpanel').doLayout();
        },
        // 提交失败的回调函数
        failure: function(response, options){
        	failAjax(response, myMask);
        }
    });
}
/**
 * 移除子项方法
 * @param {} itemId
 */
function removeItem(itemId){
	try{
		var isToRemove = Ext.getCmp(itemId);
		if(isToRemove){
			//移除该项
			Ext.getCmp('mainpanel').remove(isToRemove);
		}
//		//重新布局
//		Ext.getCmp('mainpanel').doLayout();
	}catch(e){
		alert(e.name + " " + e.message);
	}
}
/**
 * 添加子项
 * @param {} itemId
 */
function addItem(itemId){
	try{
		var isToAdd = Ext.getCmp(itemId);
		if(isToAdd){
			//添加到主面板
			Ext.getCmp('mainpanel').add(isToAdd);
		}
	}catch(e){
		alert(e.name + " " + e.message);
	}
}
/**
 * 刷新数据
 */
function refreshData(){
	var admdiv = Ext.getCmp('admdivCom').getValue();
	if (admdiv == null || admdiv == "")
		return;
	var myMask = new Ext.LoadMask(Ext.getBody(), {
		msg : '后台正在处理中，请稍后....',
		removeMask : true // 完成后移除
	});
	myMask.show();
	// 提交到服务器操作
    Ext.Ajax.request({
    	url : loadDataUrl,
		//method : 'POST',
		timeout : 180000,  //设置为3分钟
        params: {
			admdiv_code : admdiv
        },
        // 提交成功的回调函数
        success : function(response, options){
        	myMask.hide();
			//后台传到前台的参数
			var obj = new Function("return" + response.responseText)();
			if(obj!=undefined){
				setValues(obj);
			}else if(Ext.isEmpty(obj)){
				if(!Ext.isEmpty(Ext.getCmp('dirRefundAdvanceNo'))){
						Ext.getCmp('dirRefundAdvanceNo').setValue("");
				}if(!Ext.isEmpty(Ext.getCmp('dirRefundAdvanceName'))){
						Ext.getCmp('dirRefundAdvanceName').setValue("");
				}if(!Ext.isEmpty(Ext.getCmp('accrRefundAdvanceNo'))){
						Ext.getCmp('accrRefundAdvanceNo').setValue("");
				}if(!Ext.isEmpty(Ext.getCmp('accrRefundAdvanceName'))){
						Ext.getCmp('accrRefundAdvanceName').setValue("");
				}if(!Ext.isEmpty(Ext.getCmp('dirRefundAgentNo'))){
						Ext.getCmp('dirRefundAgentNo').setValue("");
				}if(!Ext.isEmpty(Ext.getCmp('dirRefundAgentName'))){
						Ext.getCmp('dirRefundAgentName').setValue("");
				}if(!Ext.isEmpty(Ext.getCmp('accrRefundAgentNo'))){
						Ext.getCmp('accrRefundAgentNo').setValue("");
				}if(!Ext.isEmpty(Ext.getCmp('accrRefundAgentName'))){
						Ext.getCmp('accrRefundAgentName').setValue("");
				}if(!Ext.isEmpty(Ext.getCmp('dirAdvanceNo'))){
						Ext.getCmp('dirAdvanceNo').setValue("");
				}if(!Ext.isEmpty(Ext.getCmp('dirAdvanceName'))){
						Ext.getCmp('dirAdvanceName').setValue("");
				}if(!Ext.isEmpty(Ext.getCmp('accrAdvanceNo'))){
						Ext.getCmp('accrAdvanceNo').setValue("");
				}if(!Ext.isEmpty(Ext.getCmp('accrAdvanceName'))){
						Ext.getCmp('accrAdvanceName').setValue("");
				}if(!Ext.isEmpty(Ext.getCmp('dirAgentNo'))){
						Ext.getCmp('dirAgentNo').setValue("");
				}if(!Ext.isEmpty(Ext.getCmp('dirAgentName'))){
						Ext.getCmp('dirAgentName').setValue("");
				}if(!Ext.isEmpty(Ext.getCmp('accrAgentNo'))){
						Ext.getCmp('accrAgentNo').setValue("");
				}if(!Ext.isEmpty(Ext.getCmp('accrAgentName'))){
						Ext.getCmp('accrAgentName').setValue("");
				}}

        },
        // 提交失败的回调函数
        failure: function(response, options){
        	myMask.hide();
            Ext.Msg.alert("系统提示", "加载账户失败原因：" + response.responseText);
        }
    });
}
/**
 * 切换财政
 */
function selectAdmdiv(){
	resetPanel();
	refreshData();
}
function resetPanel(){
	Ext.getCmp('dirAdvanceId').setValue("");
	Ext.getCmp('dirAdvanceNo').setValue("");
	Ext.getCmp('dirAdvanceName').setValue("");
	Ext.getCmp('accrAdvanceId').setValue("");
	Ext.getCmp('accrAdvanceNo').setValue("");
	Ext.getCmp('accrAdvanceName').setValue("");
	//清空id
	if(payRefund_consistent == "0" && advanceAgent_consistent == "1"){		
		Ext.getCmp('dirRefundAdvanceId').setValue("");
		Ext.getCmp('dirRefundAdvanceNo').setValue("");
		Ext.getCmp('dirRefundAdvanceName').setValue("");
		Ext.getCmp('accrRefundAdvanceId').setValue("");
		Ext.getCmp('accrRefundAdvanceNo').setValue("");
		Ext.getCmp('accrRefundAdvanceName').setValue("");
	}
	if(advanceAgent_consistent == "0" && payRefund_consistent == "1"){
		Ext.getCmp('dirAgentId').setValue("");
		Ext.getCmp('dirAgentNo').setValue("");
		Ext.getCmp('dirAgentName').setValue("");
		Ext.getCmp('accrAgentId').setValue("");		
		Ext.getCmp('accrAgentNo').setValue("");		
		Ext.getCmp('accrAgentName').setValue("");		
	}
	if(advanceAgent_consistent == "0" && payRefund_consistent == "0"){
		Ext.getCmp('dirRefundAgentId').setValue("");
		Ext.getCmp('dirRefundAgentNo').setValue("");
		Ext.getCmp('dirRefundAgentName').setValue("");
		Ext.getCmp('accrRefundAgentId').setValue("");
		Ext.getCmp('accrRefundAgentNo').setValue("");
		Ext.getCmp('accrRefundAgentName').setValue("");
	}	
}
/**
 * 给文本框赋值
 */
function setValues(obj) {
	for ( var i = 0 ;i <obj.length; i++){
		var o = obj[i];	
		if(payRefund_consistent == "0"){
			//直接支付退款垫支户
			if(o.account_type_code == "210"){
				Ext.getCmp('dirRefundAdvanceNo').setValue(o.account_no);
				Ext.getCmp('dirRefundAdvanceName').setValue(o.account_name);
				Ext.getCmp('dirRefundAdvanceId').setValue(o.account_id);
			}
			//授权支付退款垫支户
			else if(o.account_type_code == "220"){
				Ext.getCmp('accrRefundAdvanceNo').setValue(o.account_no);
				Ext.getCmp('accrRefundAdvanceName').setValue(o.account_name);
				Ext.getCmp('accrRefundAdvanceId').setValue(o.account_id);
			}
			if(advanceAgent_consistent == '0'){
				//直接支付退款划款户
				if(o.account_type_code == "310"){
					Ext.getCmp('dirRefundAgentNo').setValue(o.account_no);
					Ext.getCmp('dirRefundAgentName').setValue(o.account_name);
					Ext.getCmp('dirRefundAgentId').setValue(o.account_id);
				}
				//授权支付退款垫支户
				else if(o.account_type_code == "320"){
					Ext.getCmp('accrRefundAgentNo').setValue(o.account_no);
					Ext.getCmp('accrRefundAgentName').setValue(o.account_name);
					Ext.getCmp('accrRefundAgentId').setValue(o.account_id);
				}
			}
		}
		//直接支付垫支户
		if(o.account_type_code == "21"){
			Ext.getCmp('dirAdvanceNo').setValue(o.account_no);
			Ext.getCmp('dirAdvanceName').setValue(o.account_name);
			Ext.getCmp('dirAdvanceId').setValue(o.account_id);
		}
		//授权支付垫支户
		else if(o.account_type_code == "22"){
			Ext.getCmp('accrAdvanceNo').setValue(o.account_no);
			Ext.getCmp('accrAdvanceName').setValue(o.account_name);
			Ext.getCmp('accrAdvanceId').setValue(o.account_id);
		}
		
		if(advanceAgent_consistent == '0'){
			//直接支付划款户
			if(o.account_type_code == "31"){
				Ext.getCmp('dirAgentNo').setValue(o.account_no);
				Ext.getCmp('dirAgentName').setValue(o.account_name);
				Ext.getCmp('dirAgentId').setValue(o.account_id);
			}
			//授权支付划款户
			else if(o.account_type_code == "32"){
				Ext.getCmp('accrAgentNo').setValue(o.account_no);
				Ext.getCmp('accrAgentName').setValue(o.account_name);
				Ext.getCmp('accrAgentId').setValue(o.account_id);
			}
		}
		
		
		
	}
}
//获取文本框的值
function getValues(){
	var values = "[";
	var tempNo = null;
	var tempName = null;
	//直接支付垫支户
	values += "{\"account_type_code\":\"21\",\"account_no\":\""+Ext.getCmp('dirAdvanceNo').getValue()
		   +"\",\"account_name\":\""+Ext.getCmp('dirAdvanceName').getValue()+"\",\"account_id\":\""+Ext.getCmp('dirAdvanceId').getValue()+"\"},";
	//授权支付垫支户
	values += "{\"account_type_code\":\"22\",\"account_no\":\""+Ext.getCmp('accrAdvanceNo').getValue()
	   +"\",\"account_name\":\""+Ext.getCmp('accrAdvanceName').getValue()+"\",\"account_id\":\""+Ext.getCmp('accrAdvanceId').getValue()+"\"},";
	if(payRefund_consistent == "0"){
		//直接支付退款垫支户
		values += "{\"account_type_code\":\"210\",\"account_no\":\""+Ext.getCmp('dirRefundAdvanceNo').getValue()
	 	  +"\",\"account_name\":\""+Ext.getCmp('dirRefundAdvanceName').getValue()+"\",\"account_id\":\""+Ext.getCmp('dirRefundAdvanceId').getValue()+"\"},";
		//授权支付退款垫支户
		values += "{\"account_type_code\":\"220\",\"account_no\":\""+Ext.getCmp('accrRefundAdvanceNo').getValue()
	  	 +"\",\"account_name\":\""+Ext.getCmp('accrRefundAdvanceName').getValue()+"\",\"account_id\":\""+Ext.getCmp('accrRefundAdvanceId').getValue()+"\"},";
	  	 if(advanceAgent_consistent == "0"){
	  	 	//直接支付退款划款户
			values += "{\"account_type_code\":\"310\",\"account_no\":\""+Ext.getCmp('dirRefundAgentNo').getValue()
	  		 +"\",\"account_name\":\""+Ext.getCmp('dirRefundAgentName').getValue()+"\",\"account_id\":\""+Ext.getCmp('dirRefundAgentId').getValue()+"\"},";
			//授权支付退款划款户
			values += "{\"account_type_code\":\"320\",\"account_no\":\""+Ext.getCmp('accrRefundAgentNo').getValue()
	 		  +"\",\"account_name\":\""+Ext.getCmp('accrRefundAgentName').getValue()+"\",\"account_id\":\""+Ext.getCmp('accrRefundAgentId').getValue()+"\"},";
	  	 }
	}
	if(advanceAgent_consistent == "0"){
		//直接支付划款户
		values += "{\"account_type_code\":\"31\",\"account_no\":\""+Ext.getCmp('dirAgentNo').getValue()
	 	  +"\",\"account_name\":\""+Ext.getCmp('dirAgentName').getValue()+"\",\"account_id\":\""+Ext.getCmp('dirAgentId').getValue()+"\"},";
		//授权支付划款户
		values += "{\"account_type_code\":\"32\",\"account_no\":\""+Ext.getCmp('accrAgentNo').getValue()
	  	 +"\",\"account_name\":\""+Ext.getCmp('accrAgentName').getValue()+"\",\"account_id\":\""+Ext.getCmp('accrAgentId').getValue()+"\"},";
	}
	
	
	
	
	values = values.substring(0, values.length-1)+"]";
	return values;
}
/**
 * 设置是否可读属性
 */
function setDisable(isDisable){
	
	Ext.getCmp("dirAdvanceNo").disable(isDisable);
	Ext.getCmp("dirAdvanceName").disable(isDisable);
	Ext.getCmp("accrAdvanceNo").disable(isDisable);
	Ext.getCmp("accrAdvanceName").disable(isDisable);
	if(payRefund_consistent == null || payRefund_consistent == "0"){
		Ext.getCmp("dirRefundAdvanceNo").disable(isDisable);
		Ext.getCmp("dirRefundAdvanceName").disable(isDisable);
		Ext.getCmp("accrRefundAdvanceNo").disable(isDisable);
		Ext.getCmp("accrRefundAdvanceName").disable(isDisable);
		if(advanceAgent_consistent == null || advanceAgent_consistent == "0"){
			Ext.getCmp("dirRefundAgentNo").disable(isDisable);
			Ext.getCmp("dirRefundAgentName").disable(isDisable);
			Ext.getCmp("accrRefundAgentNo").disable(isDisable);
			Ext.getCmp("accrRefundAgentName").disable(isDisable);
		}
	}
	if(advanceAgent_consistent == null || advanceAgent_consistent == "0"){
		Ext.getCmp("dirAgentNo").disable(isDisable);
		Ext.getCmp("dirAgentName").disable(isDisable);
		Ext.getCmp("accrAgentNo").disable(isDisable);
		Ext.getCmp("accrAgentName").disable(isDisable);
	}
	Ext.getCmp("editBtn").enable(false);
	Ext.getCmp("cancleBtn").disable(false);
	Ext.getCmp("saveBtn").disable(false);


}
/**
 * 修改事件
 */
function editAccount(){
	currentValues = getValues();
	//设置可读
	Ext.getCmp("dirAdvanceNo").enable(false);
	Ext.getCmp("dirAdvanceName").enable(false);
	Ext.getCmp("accrAdvanceNo").enable(false);
	Ext.getCmp("accrAdvanceName").enable(false);
	if(payRefund_consistent == "0"){
		Ext.getCmp("dirRefundAdvanceNo").enable(false);
		Ext.getCmp("dirRefundAdvanceName").enable(false);
		Ext.getCmp("accrRefundAdvanceNo").enable(false);
		Ext.getCmp("accrRefundAdvanceName").enable(false);
		if(advanceAgent_consistent == "0"){
			Ext.getCmp("dirRefundAgentNo").enable(false);
			Ext.getCmp("dirRefundAgentName").enable(false);
			Ext.getCmp("accrRefundAgentNo").enable(false);
			Ext.getCmp("accrRefundAgentName").enable(false);
		}
	}
	if(advanceAgent_consistent == "0"){
		Ext.getCmp("dirAgentNo").enable(false);
		Ext.getCmp("dirAgentName").enable(false);
		Ext.getCmp("accrAgentNo").enable(false);
		Ext.getCmp("accrAgentName").enable(false);
	}
	
	
	Ext.getCmp("editBtn").disable(false);
	Ext.getCmp("cancleBtn").enable(false);
	Ext.getCmp("saveBtn").enable(false);


}
/**
 * 取消事件
 */
function cancleAccount() {
	if(currentValues == null || currentValues == "")
		return ;
	var values = new Function("return" + currentValues)();
	//点取消时，恢复原值
	setValues(values);
	//设置不可读
	setDisable(true);
	//重新设置currentValues的值
	currentValues =null;
}

/**
 * 保存事件
 */
function saveAccount() {
	//要保存的数据
	var accountToSave = getValues();
	var admdiv = Ext.getCmp('admdivCom').getValue();
	if (admdiv == null || admdiv == "")
		return;
	var myMask = new Ext.LoadMask(Ext.getBody(), {
		msg : '后台正在处理中，请稍后....',
		removeMask : true // 完成后移除
	});
	myMask.show();
	// 提交到服务器操作
    Ext.Ajax.request({
    	url : saveDataUrl,
		method : 'POST',
		timeout : 180000,  //设置为3分钟
        params: {
			admdiv_code : admdiv,
			accountToSave : accountToSave
        },
        // 提交成功的回调函数
        success : function(response, options){
        	myMask.hide();
			Ext.Msg.show({
								title : '成功提示',
								msg : '保存成功！',
								buttons : Ext.Msg.OK,
								icon : Ext.MessageBox.INFO
							});
						
			//设置不可读
			setDisable(true);
			refreshData();
        },
        // 提交失败的回调函数
        failure: function(response, options){
					myMask.hide();
					var reqst = response.status;
					if (reqst == "-1") {// 超时的状况码为 -1
							Ext.Msg.alert("系统提示", "初审超时，可能存在网络异常，检查后请重试...");
					} else {
							//var msg = (new Function("return " + response.responseText))();
							Ext.Msg.show({
								title : '失败提示',
								msg : response.responseText,
								buttons : Ext.Msg.OK,
								icon : Ext.MessageBox.ERROR
							});
						}
					}
    });
}
/**
 * 垫支户余额查询
 */
function queryBalanceDZH(){
	var dirAdvanceNo = Ext.getCmp('dirAdvanceNo').getValue();
	var accrAdvanceNo = Ext.getCmp('accrAdvanceNo').getValue();
	var accountNo = null;
	if (dirAdvanceNo == null && accrAdvanceNo == null) {
		Ext.Msg.alert("系统提示", "请维护垫支户！");
		return;
	}else if(dirAdvanceNo != null){
		accountNo = dirAdvanceNo;
	}else{
		accountNo = accrAdvanceNo;
	}
	var queryBalanceByZero  = new Ext.FormPanel({
		id:'queryBalanceZeroForm',
	    labelWidth: 300,
	    frame:true,
	    bodyStyle:'padding:5px 5px 0',
	    width: 300,
	    defaults: {width: 280},
	    defaultType: 'textfield',
			items : [ 
						{
							fieldLabel : '账号',
							id :'accountNoByQuery',
							labelWidth:50,
							readOnly : true,
							value:dirAdvanceNo
						},{
							fieldLabel : '余额',
							id :'balanceByAccountNo',
							readOnly : true,
							labelWidth:50
						}
					],
			buttons: [
						{
						  id:'query',
	                  	  text: '查询',
	                      handler: function() {
						  	if( Ext.isEmpty ( Ext.getCmp('accountNoByQuery').getValue() )){
								Ext.Msg.alert("系统提示", "账号不能为空！");
							}else{
								queryBalance(this.up('window'));
								Ext.getCmp("queryBalanceZeroForm").getForm().reset();
								//this.up('window').close();
							}
	                   	 }
	              	   },
					   {
	                     text: '取消',
	                     handler: function() {
	                     	this.up('window').close();
	                     }
	                   }]
		});
	var dialog=Ext.widget('window', {
		title : '余额查询',
		width : 300,
		height : 140,
		layout : 'fit',
		resizable : false,
		modal : true,
		items : [ queryBalanceByZero ]
	}).show();
}