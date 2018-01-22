/*******************************************************************************
 * 主要用于用户维护
 * 
 * @type
 */

var userPanel = null;
var networkPanel =null;
var isHost = true;


/***
 * 引入需要使用的js文件
 */
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/recommend.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/AccountSyn.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/importFile.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/Account_Del.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/Account_Edit.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/Account_Add.js"></scr' + 'ipt>');
/**
 * 数据项
 */

var fileds = ["account_id","account_name","account_no","agency_code","agency_name","bank_id","bank_code","bank_name","admdiv_code","create_date","is_valid","amount"]; 

/**
 * 列名
 */
var header = "账户名称|account_name|200,账号|account_no|170,单位编码|agency_code|120,单位名称|agency_name|120,网点编码|bank_code|120,网点名称|bank_name|200,"
	+ "所属财政|admdiv_code|150,创建时间|create_date|100,是否有效|is_valid|60,余额|amount|100";

/**
 * 当前用户所属网点是否为主办网点
 */
var netfileds = ["id", "code", "name"];
var netheader="网点编码|code|100,网点名称|name|180";

var comboStore2 = Ext.create('Ext.data.Store', {
			fields : ['name', 'value'],
			data : [{
						"name" : "全部网点",
						"value" : "001"
					}, {
						"name" : "指定网点",
						"value" : "002"
					}]
		});


var bankid =null; 
/*******************************************************************************
 * 界面加载
 */
Ext.onReady(function() {
	Ext.QuickTips.init();
	Ext.syncRequire(['js.view.common.Network']);
	if (userPanel == null) {
		userPanel = getGrid("/realware/loadZeroSponsor.do", header, fileds, true, true);
		userPanel.setHeight(document.documentElement.scrollHeight - 100);	
		userPanel.getStore().on('beforeload', function(thiz, options) {
			var panel = Ext.ComponentQuery.query("panel[title='单位零余额账户查询']")[0];
			beforeload(panel, options, Ext.encode(fileds));
			var records = networkPanel.getSelectionModel().getSelection();
			if (records && records.length > 0) {
				var netcode  = records[0].raw.code;
				var params = Ext.decode(options.params.jsonMap);
				params.push({"bank_code" : ["=", netcode]});
				options.params.jsonMap = Ext.encode(params);
				options.params.bankId  = records[0].raw.id;
			}
		
		});
	}

	if(networkPanel ==null){
		networkPanel = 	Ext.create('NetworkTree');
		networkPanel.setHeight(document.documentElement.scrollHeight - 100);
	}
	
	Ext.create('Ext.Viewport', {
				id : 'UserFrame',
				layout : 'fit',
				items : [Ext.create('Ext.panel.Panel', {	
							layout: 'border', 
							renderTo: Ext.getBody() ,
							items :[{
								region: 'north',
								height: 34,
								tbar : [{	
									id : 'buttongroup',
									xtype : 'buttongroup',
									items : [{
											id : 'add',
											text : '新增',
											iconCls : 'add',
											scale : 'small',
											handler : function() {
										        addAgencyZeroSponsorAccountDialog();
											}
										}, {
											id : 'edit',
											text : '修改',
											iconCls : 'edit',
											scale : 'small',
											handler : function() {
											   editAgencyZeroAccountDialog(userPanel);
											}
										}, {
											id : 'delete',
											text : '删除',
											iconCls : 'delete',
											scale : 'small',
											handler : function() {
											  deleteAgencyZeroAccountDialog(userPanel);
											}
										},{
											id : 'input',
											text : '导入',
											iconCls : 'import',
											scale : 'small',
											handler : function() {
											  importFile(importUrl, 'txt',  Ext.getCmp('admdivCom').getValue());
											}
										}, {
					                       id : 'queryBalanceBtn',
					                       text : '余额查询',
					                       iconCls : 'log',
					                       scale : 'small',
					                       handler : function() {
						                       queryBalanceForm(userPanel);
					                       }
										},{
											id : 'refresh',
											text : '刷新',
											iconCls : 'refresh',
											scale : 'small',
											handler : function() {
												refreshData();
											}									
									},{
										id : 'synchroBtn',
										text : '同步余额',
										iconCls : 'add',
										scale : 'small',
										handler : function() {
											synchroZeroAmount(userPanel);
										}
									}]
								}]
							},{
								id :'netgird',
								region: 'west',
								xtype : 'panel',
								width: 250,
								viewConfig : {
									enableTextSelection : true
								},
								items:[{
									title: '网点过滤查询',
									bodyPadding : 8,
									layout : 'hbox',
									defaults : {
											margins : '3 10 0 0'
									},
									items:[{
											id : 'netcode',	
											xtype : 'textfield',
											dataIndex : 'netcode',
											width: 100
										}, {
											id : 'netrefresh',
											xtype : 'button',
											iconCls : 'refresh',
											scale : 'small',
											handler : function() {
												selectNet();
											}				
										},{
												id : 'netState',
												xtype : 'combo',
												dataIndex : 'net_state',
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
										}],
									flex : 2
								},networkPanel]
							},{								
								region: 'center',
								xtype : 'panel',
								items : [{
										title : '单位零余额账户查询',
										bodyPadding : 8,
										layout : 'hbox',
										defaults : {
											margins : '3 10 0 0'
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
												}, {
													id : 'accountNameField',
													fieldLabel : '账户名称',
													xtype : 'textfield',
													dataIndex : 'account_name',
													value : '',
													labelWidth : 60
												}, {
													id : 'accountNoField',
													fieldLabel : '账号',
													xtype : 'textfield',
													dataIndex : 'account_no',
													labelWidth : 30,
													value : ''
												}
												],
										flex : 2
									}, 
										userPanel
										
									]
							}]
						})]
			});
     var admdiv_code = Ext.getCmp("admdiv_code");
	 admdiv_code.renderer = function(value){
	    for(var i=0;i<comboAdmdiv.data.length;i++){
	        if(value == comboAdmdiv.data.getAt(i).get("admdiv_code")){
	           return comboAdmdiv.data.getAt(i).get("admdiv_name");
	        }
	    }
	 };		
	setBtnVisible(null, Ext.getCmp("buttongroup"));
	selectNetState();
	
	// 凭证选中刷新明细
	networkPanel.on("cellclick", function(g, rowIndex, columnIndex, e) {
		refreshData();
	});
		
});

function selectAdmdiv() {
	setBtnVisible(Ext.getCmp("admdivCom").getValue(), Ext.getCmp("buttongroup"));

	refreshData();

}

/*******************************************************************************
 * 网点加载
 */
function selectNet(){	
	refresh1();
}
/**
 * 全部，部分切换
*/
function selectNetState(){
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
 * 刷新
 * 
 * @return
 */

function refreshData() {
	userPanel.getStore().loadPage(1);
}

function addAgencyZeroSponsorAccountDialog(){
	var addAgencyZeroAccountDialog = new Ext.FormPanel({
		id:'AagencyZeroForm',
	    frame:true,
	    bodyStyle:'padding:5px 5px 0 5px',
		defaultType: 'textfield',
		items: [{
				xtype: 'panel',
				border: 0,
				width: 350,
				layout: 'hbox',
				bodyStyle: "background:#DFE9F6;padding:0px 0px 5px 0px",
				items: [{
					id: 'AagencyZeroAccountBankCode',
					xtype: 'textfield',
					fieldLabel: '所属网点',
					readOnly: 'true',
					msgTarget: 'side',
					allowBlank: false,
					afterLabelTextTpl : required,
					value: ''
				}, {
					id: 'btn_bank_code_Agency_add',
					xtype: 'button',
					text: '查询',
					iconCls : 'log',
					handler: function(btn){
						new pb.ChooseBankWindow({
							listeners:{
								afterchoose:function(window,bankInfo){
									bankid = bankInfo.bankId; 
									var codeandname=bankInfo.bankcode+" "+bankInfo.bankname;
									btn.up("panel").down("textfield").setValue(codeandname); 
								}
							}
						}).show()
					}
				}]
				}, {
					id: 'AagencyZeroAccountName',
					fieldLabel: '账户名称',
					vtype:"accountName",
					afterLabelTextTpl : required,
					allowBlank : false
				}, {
					id: 'AagencyZeroAccountNo',
					fieldLabel: '账号',
					vtype:"accountId",
					afterLabelTextTpl : required,
					allowBlank : false
				}, {
					id: 'AagencyZeroAdmdivCode',
					xtype: 'combo',
					fieldLabel: '所属财政',
					dataIndex: 'admdivCode',
					displayField: 'admdiv_name',
					emptyText: '请选择',
					valueField: 'admdiv_code',
					allowBlank: false,
					editable: false,
					afterLabelTextTpl : required,
					store: comboAdmdiv
				}, {
					id: 'AagencyZeroAgencyCode',
					fieldLabel: '单位编码',
					afterLabelTextTpl : required,
					allowBlank : false
				}, {
					id: 'AagencyZeroAgencyName',
					fieldLabel: '单位名称',
					afterLabelTextTpl : required,
					allowBlank : false
				},  {
					id: 'AagencyZeroFinanceName',
					fieldLabel: '财务人员名称',
					vtype:"commonName",
					allowBlank : true
				},  {
					id: 'AagencyZeroFinancePhone',
					fieldLabel: '财务人员电话号码',
					vtype:"commonPhone",
					allowBlank : true
				},{
					id: 'AagencyZeroIsValid',
					xtype: 'checkbox',
					fieldLabel: '是否有效',
					hidden : true,
					checked: true,
					getValue: function() {
			            var v = 0;
			              if (this.checked) {
			                v = 1;
			              }
			            return v;
			        }
				}],
			buttons: [
						{
	                  	  text: '确定',
	                      handler: function() {
						  	if (this.up('form').getForm().isValid()) { 
								a_is_valid = Ext.getCmp('AagencyZeroIsValid').getValue();
								addAgencyZeroAccount(this.up('window'));
								Ext.getCmp("AagencyZeroForm").getForm().reset();
								this.up('window').close();
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
		title : '添加账户',
		width : 350,
		autoHeight:true,
		layout : 'fit',
		resizable : false,
		modal : true,
		items : [ addAgencyZeroAccountDialog ]
	}).show();
	var records = networkPanel.getSelectionModel().getSelection();
	var netState = Ext.getCmp("netState").getValue();
	if(netState == "002" && records != null){
	   bankid = records[0].raw.id;	
	   var bankcode=records[0].raw.code;
	   var bankname=records[0].raw.text;
	   Ext.getCmp("AagencyZeroAccountBankCode").setValue(bankcode+" "+bankname);
	   Ext.getCmp("btn_bank_code_Agency_add").disabled=true;
	}
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

/**
 * 同步零余额金额
 */
function synchroZeroAmount(gridPanel1){
	var d_recordsr = gridPanel1.getSelectionModel().getSelection();

	if (d_recordsr.length == 0) {
		Ext.Msg.alert("系统提示", "请至少选择一条数据！");
		return;
	}
	var ids = "";
	// 选中的凭证的id数组，要传到后台
	for (var i = 0; i < d_recordsr.length; i++) {
		ids += d_recordsr[i].get("account_id");
		if (i < d_recordsr.length - 1){
			ids += ",";
		}
	}
	var myMask = new Ext.LoadMask(Ext.getBody(), {
			msg : '后台正在处理中，请稍后....',
			removeMask : true // 完成后移除
		});
	myMask.show();
	Ext.Ajax.request({
		url : 'synchroZeroAmount.do',
        method: 'POST',
		timeout:180000,  //设置为3分钟
		params : {
			selIds : ids,
			admdivCode : Ext.getCmp('admdivCom').getValue()
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


