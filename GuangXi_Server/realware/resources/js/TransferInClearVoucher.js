/*******************************************************************************
 * 授权支付内部清算，包含转账失败状态
 * 
 * @type
 */
var gridPanel = null; 

/***
 * 引入需要使用的js文件
 */
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/recommend.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/operationLog.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/importFile.js"></scr' + 'ipt>');
document.write('<scr'+ 'ipt type="text/javascript" src="/realware/resources/js/share/exportExcel.js"></scr'+ 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/ocxVoucher.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/createReport.js"></scr' + 'ipt>');

/**
 * 数据项
 */
var fileds = ["pay_in_clear_voucher_id", "pay_in_clear_voucher_code", "vou_date","clear_amount", "clear_date",
		"payee_bank_code", "payee_account_no","payee_account_name", "payee_account_bank",
		"pay_account_no", "pay_account_name","pay_account_bank", 
		"clear_bank_org_code", "clear_bank_no", "clear_bank_name",
		"create_date", "admdiv_code", "year","bill_type_id","last_ver"];

/**
 * 列名
 */
var header = "凭证号|pay_in_clear_voucher_code|140,凭证日期|create_date|100,清算金额|clear_amount|120,"
		+ "收款行账号|payee_account_no|130,收款行账户名称|payee_account_name|160," 
				/*"收款行编码|payee_bank_code|70,收款行名称|payee_account_bank|160,"*/
		+ "付款行账号|pay_account_no|130,付款行账户名称|pay_account_name|160," 
				/*"付款行名称|pay_account_bank|160,清算行名称|clear_bank_name|160,清算行行号|clear_bank_no|100,清算行机构编码|clear_bank_org_code|100,"*/
		+ "财政编码|admdiv_code|80,年度|year|60";
		
// 划款信息
var fileds0 = ["pay_clear_voucher_id","pay_clear_voucher_code", "pay_amount", "agent_account_no",
		"agent_account_name", "agent_bank_name", "clear_account_no",
		"clear_account_name", "clear_bank_name", "fund_type_code",
		"fund_type_name", "pay_type_code", "pay_type_name", "pay_bank_no",
		"pay_bank_name", "clear_date", "confirm_date", "bgt_type_code",
		"bgt_type_name", "task_id", "pay_clear_voucher_id", "bill_type_id",
		"last_ver"];

var header0 = "凭证号|pay_clear_voucher_code|130,金额|pay_amount|100,收款银行账号|agent_account_no|150,收款银行账户名称|agent_account_name|150,收款银行名称|agent_bank_name|150,"
		+ "付款银行账号|clear_account_no|150,付款银行账户名称|clear_account_name|150,付款银行名称|clear_bank_name|150,资金性质编码|fund_type_code,资金性质名称|fund_type_name,"
		+ "支付方式编码|pay_type_code,支付方式名称|pay_type_name,代理银行行号|pay_bank_no,代理银行名称|pay_bank_name,清算日期|clear_date,回单日期|confirm_date,"
		+ "预算类型编码|bgt_type_code,预算类型名称|bgt_type_name";

/**
 * 界面加载
 */
Ext.onReady(function() {
	Ext.QuickTips.init();
	//引用工具类
	store1 = getStore("/realware/loadClearPayVoucher.do", fileds0);
	column1 = getColModel(header0, fileds0);
	store2 = getStore("/realware/loadPayInClearVoucher.do", fileds);
	column2 = getColModel(header, fileds);
	var pagetool = getPageToolbar(store1);
	store1.on('beforeload', function(thiz, options,e) {
		var panel = Ext.ComponentQuery.query("panel[title='查询区']")[0];
		beforeload(panel, options, Ext.encode(fileds0));
	});
	store2.on('beforeload', function(thiz, options,e) {
		var panel = Ext.ComponentQuery.query("panel[title='查询区']")[0];
		beforeload(panel, options, Ext.encode(fileds));
	});
	var buttonItems = [{ id : 'create',
						handler : function() {
						  checkCreateclearVoucher();
						}
					}, {
						id : 'clear',
						
						handler : function() {
						   checkTransferPayInclearVoucher();
						}
					}, {
						id : 'clearSucc',
						
						handler : function() {
						  checkTransferPayInClearVoucherSucc();
						}
					}, {
						id : 'export',
						
						handler : function() {
						downloadViewData();
						}
					}, {
						id : 'refresh',
						
						handler : function() {
							refreshData();
						}
					}];
	
		var queryItems=[{     
			              title : '查询区',
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
								store : comboAdmdiv,
								listeners : {
									'select' : selectAdmdiv
								}
							}],               
							flex : 2
	   					}, {
	   						id : 'inClearQuery',
	   						xtype : 'gridpanel',
	   						height : document.documentElement.scrollHeight - 92,
	   						frame : false,
	   						multiSelect : true,
	   						viewConfig : {
	   							shrinkWrap : 0
	   							//hasLoadingHeight : true
	   						},
	   						title : '未生成划款凭证列表信息',
	   						selType : 'checkboxmodel',
	   						selModel : {
	   							mode : 'multi',
	   							checkOnly : true
	   						},
	   						features: [{
	   				    		ftype: 'summary'
	   						}],
	   						store : store1,
	   						columns : column1,
	   						loadMask : {
	   							msg : '数据加载中,请稍等...'
	   						},
	   						bbar : pagetool
	   					}];
		Ext.StatusUtil.createViewport(buttonItems, queryItems, function() {
			Ext.StatusUtil.initPage(Ext.getCmp("admdiv"), Ext.getCmp("taskState"));
			// 默认设置为未生成
			Ext.getCmp('taskState').setValue("001");
		});
});

/*******************************************************************************
 * 切换状态
 * 
 * @return
 */
function selectState(combo, newValue, oldValue, eOpts) {
	var grid = Ext.getCmp("inClearQuery");
	var pager = Ext.ComponentQuery.query("pagingtoolbar")[0];
	if ("001" == newValue) {   //未生成
		Ext.StatusUtil.batchEnable("create");
		Ext.StatusUtil.batchDisable("clear,clearSucc,export");
		// 重新绑定grid
		if(oldValue) {
			grid.setTitle("未生成划款凭证列表信息");
			grid.reconfigure(store1, column1);
			// 重新绑定分页工具栏
			pager.bind(store1);
		}
	} else if ("002" == newValue) {    //未结算
		Ext.StatusUtil.batchEnable("clear,clearSucc,export");
		Ext.StatusUtil.batchDisable("create");
		// 重新绑定grid
		if(oldValue) {
			grid.setTitle("未结算凭证列表信息");
			grid.reconfigure(store2, column2);
			// 重新绑定分页工具栏
			pager.bind(store2);
		}
	} else if ("003" == newValue) {    //已结算
		Ext.StatusUtil.batchEnable("export");
		Ext.StatusUtil.batchDisable("create,clear,clearSucc");
		if(oldValue) {
			grid.setTitle("已结算凭证列表信息");
			grid.reconfigure(store2, column2);
			// 重新绑定分页工具栏
			pager.bind(store2);
		}
	} 
}

function selectAdmdiv() {
	refreshData();
}

/**
 * 清算转账方法
 *
 */
function checkTransferPayInclearVoucherMethod(transSucc,userCode,userPass) {
    var records = Ext.getCmp("inClearQuery").getSelectionModel().getSelection();
    if (records.length == 0) {
        Ext.Msg.alert("系统提示", "请至少选中一条凭证信息");
        return;
    }
    var reqIds = [];
    var reqVers=[];
    Ext.Array.each(records,function(model){
    	 reqIds.push(model.get("pay_in_clear_voucher_id"));
    	 reqVers.push(model.get("last_ver"));
    });
    var myMask = new Ext.LoadMask(Ext.getBody(), {
		msg : '后台正在处理中，请稍后....',
		removeMask : true // 完成后移除
	});
    myMask.show();
    Ext.Ajax.request({
        method: 'POST',
		timeout:180000,  //设置为3分钟
        url: '/realware/checkTransferPayInclearVoucher.do',
        params: {
            // 单据类型id
            billTypeId: records[0].get("bill_type_id"),
            billIds: Ext.encode(reqIds),
            transSucc : transSucc,
            userCode : userCode,
			userPass : userPass,
            last_vers: Ext.encode(reqVers),
            menu_id :  Ext.PageUtil.getMenuId()
        },
        success : function(response, options) {
			succAjax(response, myMask,true);				
		},
		failure : function(response, options) {
			failAjax(response, myMask,true);
			refreshData();
		}
    });
}

/**
 * 生成划款单方法
 *
 */
function checkCreateclearVoucherMethod(transSucc,userCode,userPass) {
    var records = Ext.getCmp("inClearQuery").getSelectionModel().getSelection();
    if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请选择要签章划款单的数据！");
		return;
	}
	var reqIds = [];
	var reqVers = [];
	Ext.Array.each(records,function(model){
			reqIds.push(model.get("pay_clear_voucher_id"));
			reqVers.push(model.get("last_ver"));
	});
	var bill_type_id = records[0].get("bill_type_id");
	var myMask = new Ext.LoadMask(Ext.getBody(), {
		msg : '后台正在处理中，请稍后....',
		removeMask : true
			// 完成后移除
		});
	myMask.show();
	Ext.Ajax.request({
				url : '/realware/createInClearByClearVoucher.do',
				method : 'POST',
				timeout : 180000, // 设置为3分钟
				params : {
					billTypeId : bill_type_id,
					billIds : Ext.encode(reqIds),
					last_vers : Ext.encode(reqVers),
					menu_id :  Ext.PageUtil.getMenuId()
				},
				//提交成功的回调函数
				success : function(response, options) {
					succAjax(response, myMask,true);
				},
				// 提交失败的回调函数
				failure : function(response, options) {
					failAjax(response, myMask);
					refreshData();
				}
			});
}

/*******************************************************************************
 * 生成划款单
 */
function checkCreateclearVoucher(){
   var taskState = Ext.getCmp('taskState').getValue();
   if(taskState == "001"){
      checkCreateclearVoucherMethod();
   }
}

/*******************************************************************************
 * 清算转账
 */
function checkTransferPayInclearVoucher() {
	var taskState = Ext.getCmp('taskState').getValue();
	if ("002" == taskState||"003" == taskState){  //在支付失败和支付超时状态，点击支付按钮，进行确认转账提示
		Ext.MessageBox.confirm('重新支付提示', '确认重新进行清算？', function(button,text){
			if(button=="yes"){
				checkTransferPayInclearVoucherMethod();
			}
		});
	}else{
		checkTransferPayInclearVoucherMethod();
	}
}


/*******************************************************************************
 * 手工清算
 */
function checkTransferPayInClearVoucherSucc(){
	var passOrVerify = "";
	if(loginMode==1){
		passOrVerify = "密码";
	}else if(loginMode==2){
		passOrVerify = "验证码";
	}
	/*Ext.widget('window', {
		id : 'payFlow',
			title : '经办人复核对话框',
			width : 380,
			height : 110,
			layout : 'fit',
			resizable : true,
			draggable : true,
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
							id : 'userCode',
							fieldLabel : '经办人',
							xtype : 'textfield',
							labelWidth: 40,
							height : 20,
							width : 150
						}, {
							id : 'userPass',
							fieldLabel : '&nbsp;&nbsp;&nbsp;'+passOrVerify,
							xtype : 'textfield',
							labelWidth : 40,
							height : 20,
							width : 150
						}],
				buttons : [{
					text : '确定',
					handler : function() {
							//用户编码
							var userCode = Ext.getCmp('userCode').getValue();
							//密码
							var userPass = Ext.getCmp('userPass').getValue();
							if (userCode == "" ||  null == userCode){
								Ext.Msg.alert("系统提示", "经办人不能为空！");
								return ;
							}
							if (userPass == "" ||  null == userPass){
								Ext.Msg.alert("系统提示", passOrVerify+"不能为空！");
								return ;
							}
							checkTransferPayInclearVoucherMethod(1,userCode,userPass);
							this.up('window').close();
					}
				}, {
					text : '取消',
					handler : function() {
						this.up('window').close();
					}
				}]

			})]
		}).show();*/
	checkTransferPayInclearVoucherMethod(1,null,null);
}

/*******************************************************************************
 * 刷新
 * 
 * @return
 */
function refreshData() {
	Ext.getCmp("inClearQuery").getStore().loadPage(1);
}

/*******************************************************************************
 * 导出EXCEL
 * 
 * @return
 */
function downloadViewData() {
	var records = Ext.getCmp("inClearQuery").getSelectionModel().getSelection();
    if (records.length == 0) {
        Ext.Msg.alert("系统提示", "请至少选中一条凭证信息");
        return;
    }
	try {
		var xls = new ActiveXObject("Excel.Application");
	} catch (e) {
		alert("要打印该表，您必须安装Excel电子表格软件，同时浏览器须使用“ActiveX 控件”，您的浏览器须允许执行控件。 请点击【帮助】了解浏览器设置方法！");
		return "";
	}
	xls.visible = true; // 设置excel为可见
	var xlBook = xls.Workbooks.Add;
	var xlSheet = xlBook.Worksheets(1);
	xlSheet.Columns(1).NumberFormatLocal="@"; 
	xlSheet.Columns(3).NumberFormatLocal="@"; 
	xlSheet.Columns(5).NumberFormatLocal="@"; 
    xlSheet.Columns(9).NumberFormatLocal="@"; 
    var grid = Ext.getCmp("inClearQuery");  
    var store = grid.getSelectionModel().getSelection();
    var recordCount = store.length;
    var cm= grid.columns;
    var colCount = cm.length;
    var temp_obj = [];
    var temp_objName = [];
	var head = header.split(',');
	for (var i = 0; i < head.length; i++){
	   xlSheet.Cells(1, i+1).value = head[i].split('|')[0];
	}
	var records = grid.getSelectionModel().getSelection();
	for(var i=0;i<recordCount;i++){
		for (var j = 0; j < head.length; j++){
		  xlSheet.Cells(i+2, j+1).value = records[i].get(head[j].split('|')[1]);
	    }
	}
	xlSheet.Columns.AutoFit;
	xls.ActiveWindow.Zoom = 75
	xls.UserControl = true; //很重要,不能省略,不然会出问题 意思是excel交由用户控制
	xls = null;
	xlBook = null;
	xlSheet = null;
	//changeInClearVoucherState();
}

//清算单导出更改清算单状态
function changeInClearVoucherState(transSucc,userCode,userPass) {
    var records = Ext.getCmp("inClearQuery").getSelectionModel().getSelection();
    if (records.length == 0) {
        Ext.Msg.alert("系统提示", "请至少选中一条凭证信息");
        return;
    }
    var reqIds = [];
    var reqVers=[];
    Ext.Array.each(records,function(model){
    	 reqIds.push(model.get("pay_in_clear_voucher_id"));
    	 reqVers.push(model.get("last_ver"));
    });
    var myMask = new Ext.LoadMask(Ext.getBody(), {
		msg : '后台正在处理中，请稍后....',
		removeMask : true // 完成后移除
	});
    myMask.show();
    Ext.Ajax.request({
        method: 'POST',
		timeout:180000,  //设置为3分钟
        url: '/realware/changeInClearVoucherState.do',
        params: {
            // 单据类型id
            billTypeId: records[0].get("bill_type_id"),
            billIds: Ext.encode(reqIds),
            transSucc : transSucc,
            userCode : userCode,
			userPass : userPass,
            last_vers: Ext.encode(reqVers),
        	menu_id :  Ext.PageUtil.getMenuId()
        },
        success : function(response, options) {
			succAjax(response, myMask,true);
		},
		failure : function(response, options) {
			failAjax(response, myMask,true);
		}
    });
}

/**
 * 撤销划款单方法
 *
 */
function revokeCreateclearVoucher(transSucc,userCode,userPass) {
    var records = Ext.getCmp("inClearQuery").getSelectionModel().getSelection();
    if (records.length == 0) {
        Ext.Msg.alert("系统提示", "请至少选中一条凭证信息");
        return;
    }
    var reqIds = [];
    var reqVers=[];
    Ext.Array.each(records,function(model){
    	 reqIds.push(model.get("pay_in_clear_voucher_id"));
    	 reqVers.push(model.get("last_ver"));
    });
    var myMask = new Ext.LoadMask(Ext.getBody(), {
		msg : '后台正在处理中，请稍后....',
		removeMask : true // 完成后移除
	});
    myMask.show();
    Ext.Ajax.request({
        method: 'POST',
		timeout:180000,  //设置为3分钟
        url: '/realware/revokeCreateclearVoucher.do',
        params: {
            // 单据类型id
            billTypeId: records[0].get("bill_type_id"),
            billIds: Ext.encode(reqIds),
            transSucc : transSucc,
            userCode : userCode,
			userPass : userPass,
            last_vers: Ext.encode(reqVers),
        	menu_id :  Ext.PageUtil.getMenuId()
        },
        success : function(response, options) {
			succAjax(response, myMask,true);
		},
		failure : function(response, options) {
			failAjax(response, myMask,true);
		}
    });
}