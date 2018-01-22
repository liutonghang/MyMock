/**
 * 全省国库实有资金账户维护
 */

/**
 * 列表
 */
var gridPanel1 = null;
var networkPanel = null;
var bankid = null;
var loadBankCode ;
var loadBankName ;

/*******************************************************************************
 * 引入需要使用的js文件
 */
document.write('<scr'+ 'ipt type="text/javascript" src="/realware/resources/js/recommend.js"></scr'+ 'ipt>');

var fileds = ["account_id","account_name", "account_no", "bank_code", "fund_type_code",
      		"fund_type_name", "admdiv_code", "create_date", "is_valid","bank_id"];
/**
* 列名
*/
var header = "账户名称|account_name|200,账号|account_no|170,网点编码|bank_code|80,"
      		+ "资金性质编码|fund_type_code|90,资金性质名称|fund_type_name|90,"
      		+ "所属财政|admdiv_code|150,创建时间|create_date|100,是否有效|is_valid|60";


var netfileds = [ "id", "code", "name" ];
var netheader = "网点编码|code|100,网点名称|name|180";

var comboStore2 = Ext.create('Ext.data.Store', {
	fields : [ 'name', 'value' ],
	data : [ {
		"name" : "全部网点",
		"value" : "001"
	}, {
		"name" : "指定网点",
		"value" : "002"
	} ]
});


var comboFundType = Ext.create('Ext.data.Store', {
	fields : ['id','code', 'name'],
	proxy : {					
			type : 'ajax',
			url : '/realware/loadElementValue.do',
			reader : {
				type : 'json'
			}
		},
	autoload : false
	
});

//支付方式的store
var comboPayType = Ext.create('Ext.data.Store', {
fields : ['id','code', 'name'],
proxy : {					
	type : 'ajax',
	url : '/realware/loadElementValue.do',
	reader : {
		type : 'json'
	}
},
autoload : false

});

/**
 * 界面加载
 */
Ext.require([ "Ext.grid.*", "Ext.data.*" ]);
Ext.onReady(function() {
			Ext.QuickTips.init();
			Ext.syncRequire(['js.view.common.Network']);
	if (gridPanel1 == null) {
		gridPanel1 = getGrid("/realware/loadAdmdivRealFundAccount.do", header, fileds, true, true);
		gridPanel1.setHeight(document.documentElement.scrollHeight - 100);	
		gridPanel1.getStore().on('beforeload', function(thiz, options) {
			var panel = Ext.ComponentQuery.query("panel[title='查询条件']")[0];
			beforeload(panel, options, Ext.encode(fileds));
			var records = networkPanel.getSelectionModel().getSelection();
			if (records && records.length > 0) {
				var netcode  = records[0].raw.code;
				var params = Ext.decode(options.params.jsonMap);
				params.push({"bank_code" : ["=", netcode]});
				options.params.jsonMap = Ext.encode(params);
				options.params.bankId  = records[0].raw.id;
			}
			options.params.admdivCode  = Ext.getCmp('admdivCom').getValue();
		
		});
	}
	
	if(networkPanel ==null){
		networkPanel = 	Ext.create('NetworkTree');
		networkPanel.setHeight(document.documentElement.scrollHeight - 100);
	}
	
			var buttonItems = [
					{
						id : 'addBtn',
						handler : function() {
							addReal();
						}
					},
					{
						id : 'editBtn',
						handler : function() {
							editReal();
						}
					},
					{
						id : 'deleteBtn',
						handler : function() {
							deleteRealFundAccountDialog(gridPanel1);
						}
					},
					{
						id : 'refreshBtn',
						handler : function() {
							var netState = Ext.getCmp('netState').getValue();
							if ('001' == netState) {
								refreshData();
							} else {
								var records = networkPanel.getSelectionModel().getSelection();
								if (records.length < 1) {
									refreshData();
									return;
								}
								var netcode = records[0].get("code");
								refreshData(netcode);
							}
						}
					} ];

			var queryItems = [ {
				xtype : 'panel',
				layout : 'border',
				height : heights,
				items : [
						{
							id : 'netgird',
							region : 'west',
							xtype : 'panel',
							width : 250,
							items : [ {
								title : '网点过滤查询',
								bodyPadding : 8,
								layout : 'hbox',
								defaults : {
									margins : '3 10 0 0'
								},
								items : [ {
									id : 'netcode',
									xtype : 'textfield',
									dataIndex : 'netcode',
									width : 100
								}, {
									id : 'netrefresh',
									xtype : 'button',
									iconCls : 'refresh',
									scale : 'small',
									handler : function() {
										selectNet();
									}
								}, {
									id : 'netState',
									xtype : 'combo',
									dataIndex:'net_state',
									displayField : 'name',
									emptyText : '请选择',
									valueField : 'value',
									width : 85,
									store : comboStore2,
									value : '001',
									editable : false,
									listeners : {
										'select' : selectNetState
									}
								} ],
								flex : 2
							}, networkPanel ]
						},
						{
							region : 'center',
							xtype : 'panel',
							items : [
									{
										title : '查询条件',
										bodyPadding : 8,
										layout : 'hbox',
										defaults : {
											margins : '3 10 0 0'
										},
										items : [
												{
													id : 'admdivCom',
													fieldLabel : '所属财政',
													xtype : 'combo',
													dataIndex:'admdiv_code',
													displayField : 'admdiv_name',
													emptyText : '请选择',
													valueField : 'admdiv_code',
													labelWidth : 55,
													editable : false,
													store : comboAdmdiv,
													value : comboAdmdiv.data.length > 0 ? comboAdmdiv.data
															.getAt(0)
															.get("admdiv_code")
															: '',
													listeners : {
														'select' : selectAdmdiv
													}
												}, {
													id : 'accountNameField',
													fieldLabel : '账户名称',
													xtype : 'textfield',
													dataIndex : 'account_name',
													labelWidth : 55
												}, {
													id : 'accountNoField',
													fieldLabel : '账号',
													xtype : 'textfield',
													dataIndex : 'account_no',
													labelWidth : 30
												} ],
										flex : 2
									}, gridPanel1 ]
						} ]
			} ];
			
			  var admdiv_code = Ext.getCmp("admdiv_code");
	          admdiv_code.renderer = function(value){
	               for(var i=0;i<comboAdmdiv.data.length;i++){
	                  if(value == comboAdmdiv.data.getAt(i).get("admdiv_code")){
	                     return comboAdmdiv.data.getAt(i).get("admdiv_name");
	                  }
	               }
	          };		

			Ext.StatusUtil.createViewport(buttonItems, queryItems, function() {
				Ext.StatusUtil.initPage(Ext.getCmp('admdivCom'));
			});
			//页面加载时 页面'全部网点 001' 
            Ext.getCmp('netcode').disable(false);
		    Ext.getCmp('netrefresh').disable(false);
			networkPanel.setDisabled(true);
			selectAdmdiv(true);
			// 凭证选中刷新明细
			networkPanel.on("cellclick", function(g, rowIndex, columnIndex, e) {
				var records = g.getSelectionModel().getSelection();
				var bankcode = records[0].get("code");
				refreshData(bankcode);
			});
		});

function selectAdmdiv(refresh) {
	
	var admdiv = Ext.getCmp('admdivCom').getValue();		
	if ("" == admdiv || null == admdiv) return;		
	comboFundType.load({
					params : {
						admdiv_code : Ext.getCmp('admdivCom').getValue(),
						ele_code : 'FUND_TYPE'
					}
	});
	//加载支付方式的要素值
	comboPayType.load({
		params : {
			admdiv_code : Ext.getCmp('admdivCom').getValue(),
			ele_code : 'PAY_TYPE'
		}
	});
	if(refresh){
		refreshData();
	}
	
}
/**
 * 全部，部分切换
 */
function selectNetState() {
	networkPanel.getSelectionModel().deselectAll();
	var netState=Ext.getCmp('netState').getValue();
	if('001'==netState){
		Ext.getCmp('netcode').disable(false);
		Ext.getCmp('netrefresh').disable(false);
		networkPanel.setDisabled(true);
		Ext.getCmp('netcode').setValue("");
	}else{
		Ext.getCmp('netcode').enable(false);
		Ext.getCmp('netrefresh').enable(false);
		networkPanel.setDisabled(false);
		var childNodes = networkPanel.getRootNode().childNodes;
		if(!Ext.isEmpty(childNodes)) {
			var model = networkPanel.getSelectionModel();
			model.select(childNodes[0], true);
			networkPanel.fireEvent("itemclick", networkPanel, childNodes[0]);
		}
	}
	refreshData();
}
/*******************************************************************************
 * 网点加载
 */
function selectNet() {
   refresh1();	
}

//刷新网点
function refresh1(){
	var jsonMap = "[{";
	var codeOrName = Ext.getCmp('netcode').getValue();

	if (!Ext.isEmpty(codeOrName)) {
		var jsonStr = [];
		jsonStr[0] = "=";
		jsonStr[1] = codeOrName;
		jsonMap = jsonMap + "\"codeOrName\":" + Ext.encode(jsonStr) + ",";
	}
	data = jsonMap + "}]";
	networkPanel.getSelectionModel().deselectAll();
	networkPanel.getStore().load({
				method : 'post',
				params : {
					start : 0,
					pageSize : 200,
					filedNames : JSON.stringify(netfileds),
					jsonMap : data
				}
			});
}

function refreshData(bankcode) {
	var jsonMap = "[{";
	var accountname = Ext.getCmp('accountNameField').getValue();
	var accountno = Ext.getCmp('accountNoField').getValue();
	var admdiv = Ext.getCmp('admdivCom').getValue();
	if ("" == admdiv || null == admdiv)
		return;
	if ("" != accountname && null != accountname) {
		var jsonStr = [];
		jsonStr[0] = "LIKE";
		jsonStr[1] = accountname;
		jsonMap = jsonMap + "\"account_name\":" + Ext.encode(jsonStr) + ",";
	}
	if ("" != accountno && null != accountno) {
		var jsonStr = [];
		jsonStr[0] = "LIKE";
		jsonStr[1] = accountno;
		jsonMap = jsonMap + "\"account_no\":" + Ext.encode(jsonStr) + ",";
	}

	if (null != bankcode && "" != bankcode) {
		var str = [];
		str[0] = "=";
		str[1] = bankcode;
		jsonMap = jsonMap + "\"bank_code\":" + Ext.encode(str) + ",";
	}else{
		var str = [];
		str[0] = "<>";
		str[1] = "";
		jsonMap = jsonMap + "\"bank_code\":" + Ext.encode(str) + ",";
	}
	var jsonStr = [];
	jsonStr[0] = "=";
	jsonStr[1] = admdiv;
	jsonMap = jsonMap + "\"admdiv_code\":" + Ext.encode(jsonStr) + ",";
	data = jsonMap.substring(0, jsonMap.length - 1) + "}]";

	gridPanel1.getStore().load({
		method : 'post',
		params : {
			start : 0,
			pageSize : 200,
			filedNames : JSON.stringify(fileds),
			jsonMap : data
		}
	});
}

function addReal(){
	
	var netState = Ext.getCmp('netState').getValue();
	if('002'==netState){
		var e_recordsr = networkPanel.getSelectionModel().getSelection();
		if (e_recordsr.length == 1) {
			loadBankCode=e_recordsr[0].raw.code;
			loadBankName=e_recordsr[0].raw.text;
			bankid = e_recordsr[0].get("id");
		}		
	}else{
		loadBankCode=null;
		loadBankName=null;
	}

	var addClearAccountDialog = new Ext.FormPanel({
		id:'ARealForm',
	    labelWidth: 75,
	    frame:true,
	    bodyStyle:'padding:5px 5px 0',
	    width: 350,
	    defaults: {width: 300},
	    defaultType: 'textfield',
			items : [ {
				xtype :'panel',
				border:0,
				bodyPadding : 5,
				width:350,
				layout: 'hbox', 
				bodyStyle: "background:#DFE9F6",
				defaults : {
					margins : '3 0 0 0'
				},
				items:[{
							id : 'adduser_bank_code',
							xtype : 'textfield',
							fieldLabel : '所属网点',
							emptyText:'请点击【查询】选择',
							readOnly: 'true',
							labelWidth: 100,
							msgTarget: 'side',
							allowBlank: false,
							value : (!Ext.isEmpty(loadBankCode,false))?loadBankCode+' '+loadBankName:''
						},
						{
							id : 'btn_bank_code',
							xtype : 'button',
							text : '查询',
							handler : function() {
								choseBank1();						
							}											
						}]	
						},{
							id :'ArealFundAccountName',
							fieldLabel : '账户名称',
							vtype:"accountName",
							allowBlank : false
							
						},{
							id :'ArealFundAccountNo',
							fieldLabel : '账号',
							vtype:"accountId",
							allowBlank : false
						},{
							id :'ArealFundAdmdivCode',
							xtype : 'combo',
							fieldLabel : '所属财政',
							dataIndex : 'admdivCode',
							displayField: 'admdiv_name',
							emptyText: '请选择',
							valueField: 'admdiv_code',
							editable :true,
							allowBlank : false,
							store: comboAdmdiv,
							listeners : {
									'select' : function(){
													selectAdmdiv(false);
												}
							}
						},{
							id :'ArealFundFundTypeCode',
							xtype : 'combo',
							fieldLabel : '资金性质',
							dataIndex : 'fundTypeCode',
							displayField: 'name',
							emptyText: '请选择',
							editable : true,
							valueField: 'code',
							queryMode : 'local',
							store: comboFundType,
							allowBlank : true // 资金性质允许为空
						}
					],
			buttons: [
						{
						  formBind : true,
	                  	  text: '确定',
	                      handler: function() {
	                    		var myMask = new Ext.LoadMask(Ext.getBody(), {
	                    				msg : '后台正在处理中，请稍后....',
	                    				removeMask : true // 完成后移除
	                    			});
	                    		myMask.show();
	                    		// 提交到服务器操作
	                    		Ext.Ajax.request({
	                    			url : 'addRealFundAccount.do',
	                    	        method: 'POST',
	                    			timeout:180000,  //设置为3分钟
	                    			params : {
	                    				bank_id : bankid,
	                    				account_name : Ext.getCmp('ArealFundAccountName').getValue(), 
	                    				account_no : Ext.getCmp('ArealFundAccountNo').getValue(),
	                    				admdiv_code : Ext.getCmp('ArealFundAdmdivCode').getValue(),
	                    				fund_type_code : Ext.getCmp('ArealFundFundTypeCode').getValue()
	                    			},
	                    			// 提交成功的回调函数
	                    			success : function(response, options) {
	                    				succAjax(response,myMask);
	                    				Ext.getCmp('ARealForm').getForm().reset();
										dialog.close();
										if('002'==netState){
											refreshData(loadBankCode);
										}else{
											refreshData();
										}
	                    			},
	                    			// 提交失败的回调函数
	                    			failure : function(response, options) {
	                    				failAjax(response,myMask);
	                    			}
	                    		});

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
		title : '添加账户',
		width : 350,
		height : 250,
		layout : 'fit',
		resizable : false,
		modal : true,
		items : [ addClearAccountDialog ]
	}).show();

}

function choseBank1(){
	Ext.widget('window', {
		title : '快速选择',
		width : 400,
		height : 310,
		layout : 'fit',
		resizable : false,
		modal : true,
		items : [ new Ext.FormPanel({
		id:'Form',
		bodyPadding : 5,
		items : [{
				layout : 'hbox',
				defaults : {
					margins : '3 10 0 0'
				},
				height : 35,
				items : [{
						id : 'bankcode',
						xtype : 'textfield',
						fieldLabel : '快速查找',
						labelWidth: 70,
						width : 250
						}, {
							text : '查询',
							xtype : 'button',
							handler : function() {
							    loadNetWorkByNetMsg('loadnetworkTree','bankcode') ;
							}
						}

						]
				}, {
					title : '网点信息',
					id : 'loadnetworkTree',
					width : 376,
					xtype : 'NetworkTree',
					listeners : {
						'itemdblclick' : function(view, record, item,
								index, e) {
							bankid = record.raw.id;
							loadBankCode = record.raw.code;
							loadBankName = record.raw.text;
							loadBankLevel = record.raw.level; 
							var codeandname=loadBankCode+" "+loadBankName;
							Ext.getCmp('adduser_bank_code').setValue(codeandname);
							this.up('window').close();								
						}
					}
				}
				],
				buttons : [{
					text : '确定',
					handler : function() {
						var records =Ext.getCmp('loadnetworkTree').getSelectionModel().getSelection();
						if(records.length<1)
							return;
						bankid= records[0].raw.id;
						loadBankCode = records[0].raw.code;
						loadBankName = records[0].raw.text;
						loadBankLevel = records[0].raw.level; 
						var codeandname=records[0].raw.code+" "+records[0].raw.text;
						Ext.getCmp('adduser_bank_code').setValue(codeandname);
						this.up('window').close();	
					}
				},{
					text : '取消',
					handler : function() {
						this.up('window').close();
					}
				}]
	}) ]
	}).show();
}
function editReal() {
	
	var netState = Ext.getCmp('netState').getValue();
	if('002'==netState){
		var e_recordsr = networkPanel.getSelectionModel().getSelection();
		if (e_recordsr.length == 1) {
			loadBankCode=e_recordsr[0].raw.code;
			loadBankName=e_recordsr[0].raw.name;
			bankid = e_recordsr[0].get("id");
		}		
	}
	
	// 当前选中的数据
	var e_recordsr = gridPanel1.getSelectionModel().getSelection();
	if (e_recordsr.length != 1) {
		Ext.Msg.alert("系统提示", "请选择一条数据！");
		return;
	}
	accountId = e_recordsr[0].get("account_id");

	var editBankAccountDialog = new Ext.FormPanel({
		id : 'ErealFundForm',
		labelWidth : 75,
		frame : true,
		bodyStyle : 'padding:5px 5px 0',
		width : 350,
		defaults : {
			width : 300
		},
		defaultType : 'textfield',
		items : [{
					id : 'ErealFundAccountName',
					fieldLabel : '账户名称',
					value : e_recordsr[0].get("account_name"),
					vtype:"accountName",
					allowBlank : false
				}, {
					id : 'ErealFundAccountNo',
					fieldLabel : '账号',
					value : e_recordsr[0].get("account_no"),
					vtype:"accountId",
					allowBlank : false
				}, {
					id : 'ErealFundAdmdivCode',
					xtype : 'combo',
					fieldLabel : '所属财政',
					displayField : 'admdiv_name',
					emptyText : '请选择',
					valueField : 'admdiv_code',
					editable : true,
					allowBlank : false,
					store : comboAdmdiv,
					listeners : {
							'select' : function(){
								selectAdmdiv(false,'ErealFundAdmdivCode');
							}
					}
				}, {
					id : 'ErealFundFundTypeCode',
					xtype : 'combo',
					fieldLabel : '资金性质',
					displayField : 'name',
					emptyText : '请选择',
					valueField : 'code',
					editable : true,
					queryMode : 'local',
					store : comboFundType
				}],
		buttons : [{
					formBind : true,
					text : '确定',
					handler : function() {
							
							var myMask = new Ext.LoadMask(Ext.getBody(), {
								msg : '后台正在处理中，请稍后....',
								removeMask : true
									// 完成后移除
								});
							myMask.show();
							// 提交到服务器操作
							Ext.Ajax.request({
										url : 'editRealFundAccount.do', 
						        		method: 'POST',
										timeout:180000,  //设置为3分钟
										params : {
											bank_id : e_recordsr[0].get("bank_id"),
											account_id : e_recordsr[0].get("account_id"),
											account_name:Ext.getCmp('ErealFundAccountName').getValue(),
											account_no : Ext.getCmp('ErealFundAccountNo').getValue(),
											admdiv_code : Ext.getCmp('ErealFundAdmdivCode').getValue(),
											fund_type_code : Ext.getCmp('ErealFundFundTypeCode').getValue()
										},
										// 提交成功的回调函数
										success : function(response, options) {
											succAjax(response, myMask,true);
											Ext.getCmp('ErealFundForm').getForm().reset();
											win1.close();
											if('002'==netState){
												refreshData(loadBankCode);
											}else{
												refreshData();
											}
										},
										// 提交失败的回调函数
										failure : function(response, options) {
											failAjax(response, myMask);
										}
									});

							
							
						
						
					}
				}, {
					text : '取消',
					handler : function() {
						this.up('window').close();
					}
				}]
	});

	Ext.getCmp('ErealFundAdmdivCode').setValue(e_recordsr[0].get("admdiv_code"));
	Ext.getCmp('ErealFundFundTypeCode').setValue(e_recordsr[0].get("fund_type_code"));
	var win1 = Ext.widget('window', {
				title : '修改账户',
				width : 350,
				height : 230,
				layout : 'fit',
				resizable : false,
				modal : true,
				items : [editBankAccountDialog]
			}).show();

}