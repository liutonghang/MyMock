/*******************************************************************************
 * 主要用于安徽农行行号补录缓存
 * 
 * @type
 */
 
/***
 * 引入需要使用的js文件
 */
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/recommend.js"></scr' + 'ipt>');
document.write('<scr'+ 'ipt type="text/javascript" src="/realware/js/util/PageUtil.js"></scr'+ 'ipt>');

var bankNoPanel = null;
/**
 * 结算方式
 */
var comboBankSetMode = Ext.create('Ext.data.Store', {
			fields : ['name', 'value'],
			proxy : {					
					type : 'ajax',
					url : '/realware/loadbanksetmode.do',
					reader : {
						type : 'json'
					}
				},
			autoload : false
		});
/**
 * 数据项
 */

var fileds = ["payee_account_no", "payee_account_bank_no","pb_set_mode_name","city_code","payee_account_bank"];

/**
 * 列名
 */
var header = "收款人账号|payee_account_no|180,银行行号|payee_account_bank_no|110,银行名称|payee_account_bank|200,转账方式|pb_set_mode_name|100,省市代码|city_code";

/*******************************************************************************
 * 界面加载
 */
 Ext.onReady(function() {
			Ext.QuickTips.init();
			if (bankNoPanel == null) {
				bankNoPanel = getGrid("loadBankNoCaches.do", header, fileds,true, true);
				bankNoPanel.setHeight(document.documentElement.scrollHeight - 100);
				bankNoPanel.getStore().on('beforeload', function(thiz, options){
					if (null == options.params || options.params == undefined) {
						options.params = [];
					}
					options.params["filedNames"] = JSON.stringify(fileds);
				});
			}
			Ext.create('Ext.Viewport', {
				id : 'BankNOFrame',
				layout : 'fit',
				items : [ Ext.create('Ext.panel.Panel', {
					tbar : [ {
						xtype : 'buttongroup',
						items : [
								{
									id : 'edit',
									text : '编辑',
									iconCls : 'edit',
									scale : 'small',
									hidden:true,
									handler : function() {
										editBankNoCacheDialog(bankNoPanel);
									}
								}, {
									id : 'delete',
									text : '删除',
									iconCls : 'delete',
									scale : 'small',
									handler : function() {
										deleteBankNoCacheDialog();
									}
								}, {
									id : 'refresh',
									text : '查询异常数据',
									iconCls : 'refresh',
									scale : 'small',
									handler : function() {
										refreshData();
									}
								}, {
									id : 'refresh',
									text : '查询',
									iconCls : 'refresh',
									scale : 'small',
									handler : function() {
										refreshData();
									}
								} ]
					} ],
					items : [ {
						title : '缓存查询区',
						bodyPadding : 8,
						layout : 'hbox',
						defaults : {
							margins : '3 10 0 0'
						},
						items : [ {
							id : 'operatorPayee_account_no',
							fieldLabel : '收款人账号',
							xtype : 'textfield',
							dataIndex : 'payee_account_no',
							style : 'margin-left:5px;margin-right:5px;'
						}, {
							id : 'operatorBankPayee_account_bank_no',
							fieldLabel : '补录行号',
							xtype : 'textfield',
							dataIndex : 'payee_account_bank_no',
							hidden:true,
							style : 'margin-left:5px;margin-right:5px;'
						} , {
							fieldLabel : '银行结算方式',
							xtype : 'combo',
							dataIndex : 'pb_set_mode_code',
							displayField : 'name',
							valueField : 'value',
				//			editable : false,
							queryMode: 'local', 
							hidden:true,
							store : comboBankSetMode,
							style : 'margin-left:5px;margin-right:5px;'
						}, {
							id : 'operatorCity_code',
							fieldLabel : '省市代码',
							xtype : 'textfield',
							dataIndex : 'city_code',
							hidden:true,
							style : 'margin-left:5px;margin-right:5px;'
						}
						],
						flex : 2
					}, bankNoPanel ]
				}) ]
			});
			comboBankSetMode.load({
					params : {
						admdiv_code : comboAdmdiv.data.getAt(0).get("admdiv_code")
					}
	        });
			//refreshData();	
		});
function editBankNoCacheDialog(bankNoPanel) {
	// 当前选中的数据
	var e_recordsr = bankNoPanel.getSelectionModel().getSelection();
	if (e_recordsr.length != 1) {
		Ext.Msg.alert("系统提示", "请选择一条数据！");
		return;
	}
	var fundType = false;
	var editBankNoCacheDialog = new Ext.FormPanel({
		id : 'ECacheForm',
		labelWidth : 75,
		frame : true,
		bodyStyle : 'padding:5px 5px 0',
		width : 350,
		defaults : {
			width : 300
		},
		defaultType : 'textfield',
		items : [{
					id : 'ECachePayeeAccountNo',
					fieldLabel : '收款人行号',
					allowBlank : false,
					readOnly: 'true',
					value : e_recordsr[0].get("payee_account_no")
				},{
					id : 'ECachePayeeAccountBankNo',
					fieldLabel : '行号补录',
					value : e_recordsr[0].get("payee_account_bank_no"),
					allowBlank : false,
							regex:/^([0-9]{12})$/,
							regexText :'补录行号不能超过12位'
				}, {
					id : 'ECacheBankSetMode',
					xtype : 'combo',
					fieldLabel : '结算方式',
					displayField : 'name',
					emptyText : '请选择',
					valueField : 'value',
					queryMode : 'local',
					store : comboBankSetMode
				}, {
					id :'ECacheCityCode',
					xtype : 'combo',
					fieldLabel : '省市代码',
					displayField: 'name',
					emptyText: '请选择',
					valueField: 'value',
					queryMode : 'local',
					store: comboCityCode
				}],
		buttons : [{
					formBind : true,
					text : '确定',
					handler : function() {
						if (Ext.getCmp('ECachePayeeAccountBankNo').getValue() == "") {
							Ext.Msg.alert("系统提示", "补录行号不能为空！");
						} else if (Ext.getCmp('ECacheBankSetMode').getValue() == "") {
							Ext.Msg.alert("系统提示", "结算方式不能为空！");
						} else {
							editCacheAccount(this.up('window'));
							Ext.getCmp('ECacheForm').getForm().reset();
							this.up('window').close();
						}
					}
				}, {
					text : '取消',
					handler : function() {
						this.up('window').close();
					}
				}]
	});
	Ext.getCmp('ECacheBankSetMode').setValue(e_recordsr[0]
			.get("pb_set_mode_name"));
	Ext.getCmp('ECacheCityCode').setValue(e_recordsr[0]
	        .get("city_code"));

	var win1 = Ext.widget('window', {
				title : '修改账户',
				width : 350,
				height :200,
				layout : 'fit',
				resizable : false,
				modal : true,
				items : [editBankNoCacheDialog]
			}).show();
}
function editCacheAccount(win) {
	var myMask = new Ext.LoadMask(Ext.getBody(), {
		msg : '后台正在处理中，请稍后....',
		removeMask : true
			// 完成后移除
		});
	myMask.show();
	var pb_set_mode_name = Ext.getCmp('ECacheBankSetMode').rawValue;
	var pb_set_mode_code = Ext.getCmp('ECacheBankSetMode').getValue();
	// 提交到服务器操作
	Ext.Ajax.request({
				url : 'editCacheAccount.do', 
        		method: 'POST',
				timeout:180000,  //设置为3分钟
				params : {
					payee_account_no : Ext.getCmp('ECachePayeeAccountNo').getValue(),
					payee_account_bank_no : Ext.getCmp('ECachePayeeAccountBankNo').getValue(),
					pb_set_mode_code : pb_set_mode_code,
					pb_set_mode_name : pb_set_mode_name,
					city_code : Ext.getCmp('ECacheCityCode').getValue()
				},
				// 提交成功的回调函数
				success : function(response, options) {
					succAjax(response, myMask,true);
					refreshData();
				},
				// 提交失败的回调函数
				failure : function(response, options) {
					failAjax(response, myMask);
					refreshData();
				}
			});
}
/*******************************************************************************
 * 刷新
 * 
 * @return
 */

function refreshData() {
	var jsonMap = "[{";
	var payee_account_no = Ext.getCmp('operatorPayee_account_no').getValue();
	if(Ext.isEmpty(payee_account_no)){
		Ext.Msg.alert("系统提示", "请输入收款人账号");
        return;
	}else  {
		var jsonStr = [];
		jsonStr[0] = "=";
		jsonStr[1] = payee_account_no;
		jsonMap = jsonMap + "\"payee_account_no\":" + Ext.encode(jsonStr) + ",";
        var data = jsonMap.substring(0, jsonMap.length - 1) + "}]";
		bankNoPanel.getStore().load( {
            method : 'post',
            params : {
                start : 0,
                pageSize : 200,
                menu_id : Ext.PageUtil.getMenuId(),
                filedNames : JSON.stringify(fileds),
                jsonMap : data
            }
        });
	}

}
function deleteBankNoCacheDialog(){
	// 请求开始时，都先把selIds置空
	payee_account_nos = "";
	// 当前选中的数据
	var d_recordsr = bankNoPanel.getSelectionModel().getSelection();

	if (d_recordsr.length == 0) {
		Ext.Msg.alert("系统提示", "请至少选择一条数据！");
		return;
	}else if(d_recordsr.length >1) {
		Ext.Msg.alert("系统提示", "每次仅能选择一条数据！");
		return;
	}
	// 选中的凭证的id数组，要传到后台
	for (var i = 0; i < d_recordsr.length; i++) {
		payee_account_nos += d_recordsr[i].get("payee_account_no");
		if (i < d_recordsr.length - 1){
			payee_account_nos += ",";
		}
			
	}
	Ext.MessageBox.confirm('删除提示', '是否确定删除'+payee_account_nos +'等收款人行号补录信息？', delBankNoCache);
}

function delBankNoCache(id) {
	if (id == "yes") {
		var myMask = new Ext.LoadMask(Ext.getBody(), {
			msg : '后台正在处理中，请稍后....',
			removeMask : true
				// 完成后移除
			});
		myMask.show();
		// 提交到服务器操作
		Ext.Ajax.request({
					url : 'deleteBankNoCache.do',
					method : 'POST',
					timeout : 180000, // 设置为3分钟
					params : {
						payee_account_nos : payee_account_nos
					},
					// 提交成功的回调函数
					success : function(response, options) {
						succAjax(response, myMask);
						refreshData();
					},
					// 提交失败的回调函数
					failure : function(response, options) {
						failAjax(response, myMask);
						refreshData();
					}
				});
	}
}
