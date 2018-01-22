/*******************************************************************************
 * 非税财政账户信息变更
 */

/***
 * 引入需要使用的js文件
 */
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/recommend.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/operationLog.js"></scr' + 'ipt>');

var gridPanel1 = null;
var detailPanel = null;
var win = null;
/**
 * 列名
 */
var fields = ["batch_no","pack_no","vou_date","child_pack_num","total_count","succeed_count","fail_count","send_date","bill_type_id","last_ver"
              ,"is_change","send_flag","account_voucher_id","cur_count"];
var header = "批次号|batch_no|200,包流水号|pack_no|150,日期|vou_date|100,总笔数|total_count|100,子包总数|child_pack_num|100" +
		     ",本次发送笔数|cur_count|100,成功笔数|succeed_count|100,失败笔数|fail_count|100,发送日期|send_date|150";

/**
 * 明细
 */
var fieldss = ["acct_type","acct_no","acct_name","bank_no","bank_name","bank_code","is_the_bank","start_date","stop_date",
               "information","change_flag","bill_type_id","last_ver"];
var header1 = "账号|acct_no|120,账户名称|acct_name|150,账户类型|acct_type|120,银行代码|bank_code|100,开户行行号|bank_no|150," +
		      "开户行名称|bank_name|150,启用日期|start_date|120,停用日期|stop_date|120,错误信息|information|150,更新状态|change_flag|100";

Ext.onReady(function() {
	Ext.QuickTips.init();
	gridPanel1 = getGrid(loadUrl, header, fields, true, true);
	gridPanel1.setHeight(document.documentElement.scrollHeight - 91);
	// 根据查询条件检索数据
	gridPanel1.getStore().on('beforeload', function(thiz, options) {
		beforeload(Ext.getCmp("NontaxAcctChange"), options, Ext.encode(fields));
		options.params["billTypeId"] = 952;
	});
	var buttonItems = [
				{
					id : 'synAcct',
					handler : function() {
					   synAcct(1);
					}
				},  {
					id : 'synAgain',
					handler : function(){
						 synAcct(0);
					}
				},{
					id : 'cfmAcct',
					handler : function(){
					   cfmAcct();
				    }
				}, {
					id : 'refresh',
					handler : function() {
						refreshData();
					}
				} ];
	  var queryItems=[{		          
		            title : '查询条件',
		            id:'NontaxAcctChange',
			        bodyPadding : 5,
			        layout : {
				     type : 'table',
				     columns : 4
			         },
			        defaults : {
					 margins : '5 5 5 5',
					 padding : '0 3 0 3'
					},
			         items:[{
			        	    id : 'taskStates',
							fieldLabel : '当前状态',
							xtype : 'combo',
							dataIndex : 'task_status',
							displayField : 'status_name',
							emptyText : '请选择',
							valueField : 'status_code',
							editable : false,
							symbol : '=',
							listeners : {
								'change' : selectStates
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
							store : comboAdmdiv
						},{
							id : "batchNo",
							fieldLabel : '批次号',
							xtype : 'textfield',
							dataIndex : 'batch_no'
						},{
							fieldLabel : '日期',
							xtype : 'datefield',
							dataIndex : 'vou_date',
							format : 'Ymd',
							value : new Date(),
							dataType : 'string'
						}]
	                 },gridPanel1];
	    Ext.StatusUtil.createViewport(buttonItems, queryItems, function() {
			Ext.StatusUtil.initPage(Ext.getCmp("admdiv"), Ext
					.getCmp("taskStates"));
	});
	    // 默认设置为未生成
		Ext.getCmp('taskStates').setValue("000");
});

//刷新
function refreshData() {
	gridPanel1.getStore().loadPage(1);
}

//状态
function selectStates(){
	 var taskState = Ext.getCmp('taskStates').getValue();
	 if(taskState == "000"){
		 Ext.getCmp('synAcct').enable();
		 Ext.getCmp('cfmAcct').disable();
		 Ext.getCmp('synAgain').disable();
	 }else if(taskState == "001"){
		 Ext.getCmp('synAcct').disable();
		 Ext.getCmp('synAgain').enable();
		 Ext.getCmp('cfmAcct').enable();
	 }else if(taskState == "002"){
		 Ext.getCmp('synAcct').disable();
		 Ext.getCmp('cfmAcct').disable();
		 Ext.getCmp('synAgain').disable();
	 }
}

//同步账户信息
function synAcct(is_delete){
	 var records = gridPanel1.getSelectionModel().getSelection();
     if(records.length != 1){
    	 Ext.MessageBox.alert("提示消息","请选择一条数据！");
    	 return;
     }
     if(detailPanel == null ){
    	 detailPanel = getGrid("/realware/nontaxAcctDetailById.do", header1, fieldss, true, true);
    	 detailPanel.setHeight(308);   	
     }
     detailPanel.getStore().on('beforeload', function(thiz, options) {
	        beforeload(Ext.getCmp("statementQuery"), options, Ext.encode(fieldss)); 
			options.params["filedNames"] = JSON.stringify(fieldss);
			options.params["account_voucher_id"] = records[0].get("account_voucher_id");
 		    options.params["menu_id"] = Ext.PageUtil.getMenuId();
		});
	 if(win == null){
	     var win = Ext.create('Ext.window.Window', {
				title : '账户信息',
				width : 770,
				height : 400,
				resizable : false,
				closeAction : 'destory',
				modal:true,
				items : [{
					   id : 'statementQuery',
				       region : 'north',
				       xtype : 'form',
				       defaults : {
							margin : "5 5 5 5",
							labelWidth : 70,
							width : 210
						},
						layout : {
							type : 'table',
							columns : 4
						},
				       items : [{
								id : "acctNo",
								fieldLabel : '账号',
								dataIndex : 'acct_no',
								xtype : 'textfield'
							},{
								id : "acctName",
								fieldLabel : '账户名称',
								dataIndex : 'acct_name',
								symbol : 'like',
								xtype : 'textfield'
				            },{
				            	id : "bankNo",
								fieldLabel : '开户行行号',
								dataIndex : 'bank_no',
								symbol : 'like',
								xtype : 'textfield'
					       }, {
								id : 'queryButton',
								text : '查询',
								xtype : 'button',
								width : 80,
								handler: function() {
					    	       detailPanel.getStore().reload();
								}
							}]						
					    },detailPanel],
				buttons : [{
					text : '确定',
					handler : function() {
						var myMask = new Ext.LoadMask(Ext.getBody(), {
							msg : '后台正在处理中，请稍后....',
							removeMask : true   // 完成后移除
							});
					    myMask.show();
						var reqIds = [];
						var reqVers = [];					
						Ext.Array.each(records, function(model) {
								reqIds.push(model.get("account_voucher_id"));
								reqVers.push(model.get("last_ver"));
								});
					    Ext.Ajax.request({
							url : '/realware/nontaxAcctChange.do',
							method : 'POST',
							dataType: "json",
							timeout : 180000, // 设置为3分钟
							params : {
					    	    admdivCode : Ext.getCmp("admdiv").getValue(),
					    	    billTypeId : records[0].get("bill_type_id"),
					    	    billIds : Ext.encode(reqIds),
					    	    last_vers : Ext.encode(reqVers),
					    	    is_delete : is_delete,
					    	    menu_id : Ext.PageUtil.getMenuId()
							},
							// 提交成功的回调函数
							success : function(response,options) {
								if(!Ext.isEmpty(response.responseText)) {
								    Ext.MessageBox.alert("提示消息",response.responseText);
								}
								myMask.hide();
								win.down("form").getForm().reset();
								win.close();								
								refreshData();
							},failure : function(response, options) {							
								Ext.Msg.alert("系统提示", "查询失败，原因：" + response.responseText);
								myMask.hide();
								win.down("form").getForm().reset();
								win.close();								
								refreshData();
							}		
					    }); 
					}
				},{
					text : '取消',
					handler : function() {
					    win.down("form").getForm().reset();
					    win.close();
					}
				}]
			});	 
	     detailPanel.getStore().loadPage(1);
	 }	
	 Ext.getCmp("change_flag").renderer = function(value){
			if(null != value){
				if(value == 0){
				    value = "未同步";
				 }else if(value == 1){
				    value = "同步成功";
				 }else if(value == 2){
					value = "同步失败";
				 }
			}
	     return value;		
	 };	
     win.show();
}

//发送2952
function cfmAcct(){
	 var me = this;
	 var records = gridPanel1.getSelectionModel().getSelection();
	 if(records.length == 0){
		 Ext.MessageBox.alert("提示消息","请至少选择一条数据！");
	 }
	 var billIds = [];
	 var reqVers = [];
	 Ext.Array.each(records,function(model){
		 billIds.push(model.get("account_voucher_id"));
		 reqVers.push(model.get("last_ver"));
	 });
	 var params = {
			    billTypeId : records[0].get("bill_type_id"),
	    	    billIds : Ext.encode(billIds),
	    	    last_vers : Ext.encode(reqVers),
	    	    menu_id : Ext.PageUtil.getMenuId()
	 };
	 Ext.PageUtil.doRequestAjax(me, '/realware/nontaxAcctSend.do', params);	 
}