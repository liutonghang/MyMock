/** 
* 中行自助柜面- 零余额账户签约
 */
document
		.write('<scr'
				+ 'ipt type="text/javascript" src="/realware/resources/js/share/gridPanel.js"></scr'
				+ 'ipt>');
document
		.write('<scr'
				+ 'ipt type="text/javascript" src="/realware/resources/js/share/json2String.js"></scr'
				+ 'ipt>');
document
		.write('<scr'
				+ 'ipt type="text/javascript" src="/realware/resources/js/share/listView.js"></scr'
				+ 'ipt>');
document
		.write('<scr'
				+ 'ipt type="text/javascript" src="/realware/resources/js/share/menuBtnStatus.js"></scr'
				+ 'ipt>');

/**
 * 数据项
 */
var fileds = [ "customno", "accountcode","accountname","admdivcode","customname","belongorg", "isvalide","lino",
		"orgcode","loadername", "idtype","idno","signname","signcardtype","signcardno", "contact",
		"telephoneno", "email","address","createdate","editdate","deldate","defaultaccount" ];

/**
 * 列名
 */
var header = "客户号|customno,区划编码|admdivcode,签约账号|accountcode|150,账户名称|accountname,客户名称|customname,所属机构|belongorg,营业执照号码|lino," +
		"企业组织机构代码|orgcode,法人|loadername, 法人证件类型|idtype,法人证件号码|idno,经办人姓名|signname,经办人证件类型|signcardtype,经办人证件号码|signcardno," +
				"联系人|contact,电话|telephoneno,联系地址|address,电子邮箱地址|email,签约时间|createdate,更新时间|editdate,注销时间|deldate,默认账号|defaultaccount";

var finPanel = null;
var checkQuery = 0;
/**
 * 本地数据源
 */
var comboEnabledStore = Ext.create('Ext.data.Store', {
	fields : ['name', 'value'],
	data : [{
				"name" : "已签约",
				"value" : 1
			},{
				"name" : "已注销",
				"value" : 0
			}]
});
var cardStore = Ext.create('Ext.data.Store', {
	fields : ['name', 'value'],
	data : [{
				"name" : "身份证",
				"value" : "1"
			}, {
				"name" : "户口本",
				"value" : "2"
			}, {
				"name" : "军官证",
				"value" : "3"
			}, {
				"name" : "警官证",
				"value" : "4"
			}, {
				"name" : "士兵证",
				"value" : "5"
			}, {
				"name" : "文职干部证",
				"value" : "6"
			}, {
				"name" : "护照",
				"value" : "7"
			}, {
				"name" : "港澳台同胞回乡证",
				"value" : "8"
			}, {
				"name" : "其它",
				"value" : "9"
			}]
});
/**
 * 界面加载
 */
Ext.onReady(function() {
	Ext.QuickTips.init();
	if (finPanel == null) {
		finPanel = getGrid(loadUrl, header, fileds, true, true);
		finPanel.setHeight(document.documentElement.scrollHeight - 88);
		
//		var jsonStr = [];
//		jsonStr[0] = "=";
//		jsonStr[1] = '1';
//		jsonMap = jsonMap + "\"cis_valide\":" + Ext.encode(jsonStr) + ",";
		// 查询条件
		var jsonStr = [];
		finPanel.getStore().on('beforeload',function(thiz, options) {
					var jsonMap = "and 1=1";
					var taskState = Ext.getCmp('taskState').getValue();
					var accountcode = Ext.getCmp('accountcode1').getValue();
					var usersCode = Ext.getCmp('userscode').getValue();
					
					if(taskState != 3){
						jsonMap = jsonMap + " and isvalide =" + taskState ;
					} 
					if ("" != accountcode && null != accountcode) {
						jsonMap = jsonMap + " and accountcode like "+"\'"+accountcode+"\'";
					}
					if ("" != usersCode && null != usersCode) {
						jsonMap = jsonMap + " and customno like "+"\'"+usersCode+"\'";
					}

					if (null == options.params || options.params == undefined) {
						options.params = [];
						options.params["jsonMap"] = jsonMap;
						options.params["filedNames"] = JSON.stringify(fileds);
					} else {
						options.params["jsonMap"] = jsonMap;
						options.params["filedNames"] = JSON.stringify(fileds);
					}

				});
		Ext.getCmp("deldate").setVisible(false);
	}

	Ext.create('Ext.Viewport', {
		id : 'buffetCounterButton',
		layout : 'fit',
		items : [ Ext.create('Ext.panel.Panel', {
			tbar : [ {
				id : 'buttongroup',
				xtype : 'buttongroup',
				items : [ {
					id : 'addZeroNoPro',
					text : '签约',
					iconCls : 'add',
					scale : 'small',
					handler : function() {
						addZeroNoPro()
					}
				}, {
					id : 'edit',
					text : '更新',
					iconCls : 'edit',
					scale : 'small',
					handler : function() {
					editZeroNoPro()
					}
				}, {
					id : 'logoff',
					text : '注销',
					iconCls : 'invalid',
					scale : 'small',
					handler : function() {
						cancleBuffetCounter();
					}
				}, {
					id : 'refreshButton',
					text : '刷新',
					iconCls : 'refresh',
					scale : 'small',
					handler : function() {
						refreshData();
					}
				} ]
			} ],
			items : [ {
				title : "查询区",
				items : finPanel,
				tbar : {
					id : 'buffetCounterQuery',
					xtype : 'toolbar',
					layout : {
						type : 'table',
						columns : 4
					},
					defaults : {
						margins : '3 5 0 0'
					},
					items : [ {
						id : 'taskState',
						fieldLabel : '状态',
						xtype : 'combo',
						displayField : 'name',
						emptyText : '已生效',
						valueField : 'value',
						value : 1,
						labelWidth : 30,
						store : comboEnabledStore,
						width : 180,
						editable : false,
						listeners : {
							'select' : selectEnabledStore
						}
					}, {
						id : 'accountcode1',
						fieldLabel : '签约账号',
						xtype : 'textfield',
						labelWidth : 53
					}, {
						id : 'userscode',
						fieldLabel : '客户号',
						xtype : 'textfield',
						labelWidth : 40
					} ]
				}
			} ]
		}) ]
	});

	setBtnVisible(null, Ext.getCmp("buttongroup"));
	refreshData();
});
/** 
 *  选择条件
 */
function selectEnabledStore() {
	var taskState = Ext.getCmp("taskState").getValue();

	if ("1" == taskState  ) {
		Ext.getCmp('logoff').enable(false);
		Ext.getCmp('edit').enable(false);
		Ext.getCmp("deldate").setVisible(false);
		Ext.getCmp("defaultaccount").setVisible(true);
	} 
	if ("0" == taskState) {
		Ext.getCmp('logoff').disable(false);
		Ext.getCmp('edit').disable(false);
		Ext.getCmp("deldate").setVisible(true);
		Ext.getCmp("defaultaccount").setVisible(false);
	}	
	refreshData();
}
/**
 * 刷新
 * 
 * @return
 */
function refreshData() {
	finPanel.getSelectionModel().deselectAll();
	finPanel.getStore().load();

}

/*******************************************************************************
 * 设置按钮可见
 * 
 * @param {}
 *            admdiv_code
 * @param {}
 *            buttongroup
 */
function setBtnVisible(admdiv_code, buttongroup) {
	Ext.Ajax.request({
		url : '/realware/loadPageStatus.do',
		method : 'POST',
		timeout : 10000, // 设置为10秒
		success : function(response, options) {
			var b = eval("(" + response.responseText + ')').buttonList;
			for ( var i = 0; i < b.length; i++) {
				Ext.getCmp(b[i].button_id).setVisible(
						b[i].visible == 1 ? true : false);
				Ext.getCmp(b[i].button_id).setText(b[i].button_name);
			}
		},
		failure : function() {
			Ext.Msg.alert("提示信息", "初始化按钮显示异常！");
		}
	});
	// setButton(admdiv_code,buttongroup); //以后可注释
}

/**
 * 添加零余额账户信息
 * @return
 */
var required = '<span style="color:red;font-weight:bold" data-qtip="Required">*</span>',addZeroProWindow;
function addZeroNoPro(){
	var me = this;
	if (!addZeroProWindow) {
		addZeroProWindow = Ext.widget('window', {
			id : "addWindow",
			title : '中行客户签约',
			bodyStyle : 'overflow-x:hidden',
			style : {
				'text-align' : 'left'
			},
			closeAction : 'close',
			width : 800,
			height : 360,
			autoScroll:true,
			resizable : false,
			modal : true,
			items : Ext.widget('form', {
				id : 'addForm',
				border : false,
				width : 800,
				height : 320,
				bodyPadding : 10,
				fieldDefaults : {
					labelAlign : 'right',
					labelWidth : 110
				},
				items : [ {
					layout : 'hbox',
					style : 'margin-bottom:3px;',
					bodyStyle : 'border-width: 0px 0px 0px 0px;',
					width : 600,
					
					items : [ {
						id : 'zeroaccountcode1',
						dataIndex : 'account_code',
						fieldLabel : '签约账号',
						allowOnlyWhitespace : false,
						labelWidth : 110,
						width : 301,
						xtype : 'textfield',
						afterLabelTextTpl : required,
						allowBlank: false
					}, {
						id : 'queryButton1',
						style : 'margin-left:5px',
						text : '查询',
						xtype : 'button',
						width : 35,
						handler: function() {
						var accountcode = Ext.getCmp("zeroaccountcode1").getValue();
						   queryAccount(accountcode,'/realware/queryUserByZeroAccountcode.do');
						}
					}, {
						id : 'defaultaccount1',
						xtype : 'checkbox',
						dataIndex : 'default_account',
						fieldLabel : '默认账号',
						checked: true,
						inputValue: '1'
					} ]
				
				}, {
					layout : 'hbox',
					width : 700,
					style : 'margin-bottom:3px;',
					bodyStyle : 'border-width: 0px 0px 0px 0px;',
					items : [{
						id : 'accountname1',
						xtype : 'textfield',
						dataIndex : 'account_name',
						allowOnlyWhitespace : false,
						fieldLabel : '账户名称',
						width : 340
					} ,{
						id : 'admdivcode1',
						xtype : 'textfield',
						dataIndex : 'admdiv_code',
						allowOnlyWhitespace : false,
						fieldLabel : '区划编码',
						width : 340
					} ]
				
				}, {
					layout : 'hbox',
					width : 700,
					style : 'margin-bottom:3px;',
					bodyStyle : 'border-width: 0px 0px 0px 0px;',
					items : [{
						id : 'zeroagencyCode1',
						xtype : 'textfield',
						dataIndex : 'agency_code',
						allowOnlyWhitespace : false,
						fieldLabel : '客户号',
						afterLabelTextTpl : required,
						width : 340,
					    allowBlank: false
					} ,{
						id : 'customName1',
						xtype : 'textfield',
						dataIndex : 'user_name',
						allowOnlyWhitespace : false,
						fieldLabel : '客户名称',
						width : 340
					} ]
				
				}, {
					layout : 'hbox',
					width : 700,
					style : 'margin-bottom:3px;',
					bodyStyle : 'border-width: 0px 0px 0px 0px;',
					items : [{
						id : 'liNo1',
						xtype : 'textfield',
						dataIndex : 'li_no',
						fieldLabel : '营业执照/事业单位法人证件号码',
						labelWidth : 234,
						allowOnlyWhitespace : false,
						afterLabelTextTpl : required,
						width : 680
					} ]
				
				}, {
					layout : 'hbox',
					width : 700,
					style : 'margin-bottom:3px;',
					bodyStyle : 'border-width: 0px 0px 0px 0px;',
					items : [{
						id : 'accounttypecode1',
						xtype : 'textfield',
						dataIndex : 'account_type_code',
						allowOnlyWhitespace : false,
						fieldLabel : '组织机构代码',
						afterLabelTextTpl : required,
						width : 340
					} ,{
						id : 'blongOrg1',
						xtype : 'textfield',
						dataIndex : 'blong_org',
						allowOnlyWhitespace : false,
						fieldLabel : '所属机构',
						width : 340
					}  ]
				
				} ,{
					layout : 'hbox',
					width : 700,
					style : 'margin-bottom:3px;',
					bodyStyle : 'border-width: 0px 0px 0px 0px;',
					items : [{
						id : 'loadName1',
						xtype : 'textfield',
						dataIndex : 'loader',
						fieldLabel : '法人代表名称',
						width : 340,
						afterLabelTextTpl : required,
						allowOnlyWhitespace : false,
						allowBlank: false
					},{
						id : 'signName1',
						xtype : 'textfield',
						dataIndex : 'sign_Name1',
						fieldLabel : '经办人姓名',
						allowOnlyWhitespace : false,
						width : 340,
						afterLabelTextTpl : required,
						 allowBlank: false
					}  ]
				
				} ,{
					layout : 'hbox',
					width : 700,
					style : 'margin-bottom:3px;',
					bodyStyle : 'border-width: 0px 0px 0px 0px;',
					items : [{
						id : 'loadIdType1',
						xtype : 'combo',
						emptyText : '请选择',
						fieldLabel : '法人证件类型',
						width : 340,
						afterLabelTextTpl : required,
						valueField : 'value',
						displayField : 'name',
						allowOnlyWhitespace : false,
						editable : false,
						store : cardStore,
						allowBlank: false
					},{
						id : 'signCardType1',
						xtype : 'combo',
						emptyText : '请选择',
						fieldLabel : '经办人证件类型',
						width : 340,
						afterLabelTextTpl : required,
						valueField : 'value',
						displayField : 'name',
						allowOnlyWhitespace : false,
						editable : false,
						store : cardStore,
						allowBlank: false
					}]
				
				} ,{
					layout : 'hbox',
					width : 700,
					style : 'margin-bottom:3px;',
					bodyStyle : 'border-width: 0px 0px 0px 0px;',
					items : [{
						id : 'loadIdNo1',
						xtype : 'textfield',
						dataIndex : 'id_no',
						fieldLabel : '法人证件号码',
						afterLabelTextTpl : required,
						allowOnlyWhitespace : false,
						width : 340,
						allowBlank: false
					} ,{
						id : 'signCardNo1',
						xtype : 'textfield',
						dataIndex : 'signCardNo',
						fieldLabel : '经办人证件号码',
						width : 340,
						allowOnlyWhitespace : false,
						afterLabelTextTpl : required,
						allowBlank: false
					} ]
				
				} ,{
					layout : 'hbox',
					width : 700,
					style : 'margin-bottom:3px;',
					bodyStyle : 'border-width: 0px 0px 0px 0px;',
					items : [{
						id : 'contact1',
						xtype : 'textfield',
						dataIndex : 'contact',
						allowOnlyWhitespace : false,
						fieldLabel : '联系人姓名',
						width : 340
					} ,{
						id : 'telephoneNo1',
						xtype : 'textfield',
						dataIndex : 'telephone_no',
						allowOnlyWhitespace : false,
						fieldLabel : '联系人电话',
						width : 340
					} ]
				
				} ,{
					layout : 'hbox',
					width : 700,
					style : 'margin-bottom:3px;',
					bodyStyle : 'border-width: 0px 0px 0px 0px;',
					items : [{
						id : 'email1',
						xtype : 'textfield',
						dataIndex : 'e_mail',
						fieldLabel : '联系人邮箱',
						allowOnlyWhitespace : false,
						width : 340,
						vtype: 'email'
					} ,{
						id : 'address1',
						xtype : 'textfield',
						dataIndex : 'address',
						fieldLabel : '联系人地址',
						allowOnlyWhitespace : false,
						width : 340
					} ]
				
				}],
				buttonAlign : 'center',
				buttons : [{
							text : '添加',
							id : 'addNetworkButton1',
							handler : function() {
								if(this.up('form').getForm().isValid()){
								//保存
								saveMsg();
								}
							}
						}, {

							text : '取消',
							id : 'cancelBuffetCounterButton',
							handler : function() {
								this.up('form').getForm().reset();
								this.up('window').close();
							}
						} ]
			})
		});
	}
	addZeroProWindow.show();
}
/**
 * 更新账号属性信息
 */
var required = '<span style="color:red;font-weight:bold" data-qtip="Required">*</span>',editZeroProWindow;
function editZeroNoPro(){
	var me = this;
	var records = finPanel.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请选中一条网点信息！");
		return;
	} 
	if (records.length >1) {
		Ext.Msg.alert("系统提示", "网点信息更新只支持单条操作！");
		return;
	} 
	var accountcode = records[0].get('accountcode');
	var customno = records[0].get('customno');
	if (!editZeroProWindow) {
		editZeroProWindow = Ext.widget('window', {
			id : "editWindow",
			title : '更新',
			bodyStyle : 'overflow-x:hidden;overflow-y:hidden',
			style : {
				'text-align' : 'left'
			},
			closeAction : 'close',
			width : 800,
			height : 360,
			resizable : false,
			autoScroll:true,
			modal : true,
			items : Ext.widget('form', {
				id : 'updateForm',
				border : false,
				width : 800,
				height : 320,
				bodyPadding : 10,
				fieldDefaults : {
					labelAlign : 'right',
					labelWidth : 110
				},
				items : [ {
					layout : 'hbox',
					style : 'margin-bottom:3px;',
					bodyStyle : 'border-width: 0px 0px 0px 0px;',
					width : 600,
					
					items : [ {
						id : 'zeroaccountcode2',
						fieldLabel : '签约账号',
						width : 340,
						xtype : 'textfield',
						disabled:true
					} , {
							id : 'defaultaccount2',
							xtype : 'checkbox',
							dataIndex : 'default_account',
							fieldLabel : '默认账号',
							checked: true,
							inputValue: '1'
						}]
				
				}, {
					layout : 'hbox',
					width : 700,
					style : 'margin-bottom:3px;',
					bodyStyle : 'border-width: 0px 0px 0px 0px;',
					items : [ {
						id : 'accountname2',
						xtype : 'textfield',
						dataIndex : 'account_name',
						allowOnlyWhitespace : false,
						fieldLabel : '账户名称',
						width : 340,
						disabled:true
					} ,{
						id : 'admdivcode2',
						xtype : 'textfield',
						dataIndex : 'admdiv_code',
						allowOnlyWhitespace : false,
						fieldLabel : '区划编码',
						width : 340
					} ]
				
				}, {
					layout : 'hbox',
					width : 700,
					style : 'margin-bottom:3px;',
					bodyStyle : 'border-width: 0px 0px 0px 0px;',
					items : [{
						id : 'zeroagencyCode2',
						xtype : 'textfield',
						dataIndex : 'agency_code',
						fieldLabel : '客户号',
						afterLabelTextTpl : required,
						width : 340,
						allowBlank: false
					} ,{
						id : 'customName2',
						xtype : 'textfield',
						dataIndex : 'user_name',
						fieldLabel : '客户名称',
						allowOnlyWhitespace : false,
						width : 340
					} ]
				
				}, {
					layout : 'hbox',
					width : 700,
					style : 'margin-bottom:3px;',
					bodyStyle : 'border-width: 0px 0px 0px 0px;',
					items : [{
						id : 'blongOrg2',
						xtype : 'textfield',
						dataIndex : 'blong_org',
						allowOnlyWhitespace : false,
						fieldLabel : '所属机构',
						width : 340
					} ,{
						id : 'liNo2',
						xtype : 'textfield',
						dataIndex : 'li_no',
						allowOnlyWhitespace : false,
						fieldLabel : '营业执照号码',
						width : 340
					} ]
				
				} ,{
					layout : 'hbox',
					width : 700,
					style : 'margin-bottom:3px;',
					bodyStyle : 'border-width: 0px 0px 0px 0px;',
					items : [{
						id : 'accounttypecode2',
						xtype : 'textfield',
						allowOnlyWhitespace : false,
						dataIndex : 'account_type_code',
						fieldLabel : '企业组织机构代码',
						width : 340
					} ,{
						id : 'loadName2',
						xtype : 'textfield',
						dataIndex : 'loader',
						afterLabelTextTpl : required,
						fieldLabel : '法人代表名称',
						allowOnlyWhitespace : false,
						allowBlank: false,
						width : 340
					} ]
				
				} ,{
					layout : 'hbox',
					width : 700,
					style : 'margin-bottom:3px;',
					bodyStyle : 'border-width: 0px 0px 0px 0px;',
					items : [{
						id : 'loadIdType2',
						xtype : 'combo',
						emptyText : '请选择',
						fieldLabel : '法人证件类型',
						width : 340,
						afterLabelTextTpl : required,
						valueField : 'value',
						displayField : 'name',
						allowOnlyWhitespace : false,
						editable : false,
						store : cardStore,
						allowBlank: false
					},{
						id : 'loadIdNo2',
						xtype : 'textfield',
						dataIndex : 'id_no',
						fieldLabel : '法人证件号码',
						afterLabelTextTpl : required,
						allowOnlyWhitespace : false,
						allowBlank: false,
						width : 340
					} ]
				
				} ,{
					layout : 'hbox',
					width : 700,
					style : 'margin-bottom:3px;',
					bodyStyle : 'border-width: 0px 0px 0px 0px;',
					items : [{
						id : 'signName2',
						xtype : 'textfield',
						dataIndex : 'sign_Name1',
						allowOnlyWhitespace : false,
						fieldLabel : '经办人姓名',
						width : 340,
						allowBlank: false,
						afterLabelTextTpl : required
					} ,{
						id : 'signCardType2',
						xtype : 'combo',
						emptyText : '请选择',
						fieldLabel : '经办人证件类型',
						width : 340,
						afterLabelTextTpl : required,
						valueField : 'value',
						displayField : 'name',
						allowOnlyWhitespace : false,
						editable : false,
						allowBlank: false,
						store : cardStore
					}  ]
				
				} ,{
					layout : 'hbox',
					width : 700,
					style : 'margin-bottom:3px;',
					bodyStyle : 'border-width: 0px 0px 0px 0px;',
					items : [{
						id : 'signCardNo2',
						xtype : 'textfield',
						dataIndex : 'signCardNo',
						fieldLabel : '经办人证件号码',
						width : 340,
						allowBlank: false,
						allowOnlyWhitespace : false,
						afterLabelTextTpl : required
					} ,{
						id : 'contact2',
						xtype : 'textfield',
						dataIndex : 'contact',
						allowOnlyWhitespace : false,
						fieldLabel : '联系人姓名',
						width : 340
					} ]
				
				} ,{
					layout : 'hbox',
					width : 700,
					style : 'margin-bottom:3px;',
					bodyStyle : 'border-width: 0px 0px 0px 0px;',
					items : [{
						id : 'telephoneNo2',
						xtype : 'textfield',
						dataIndex : 'telephone_no',
						allowOnlyWhitespace : false,
						fieldLabel : '联系人电话',
						width : 340
					},{
						id : 'email2',
						xtype : 'textfield',
						dataIndex : 'e_mail',
						fieldLabel : '联系人邮箱',
						allowOnlyWhitespace : false,
						vtype: 'email',
						width : 340
					}]
				
				} ,{
					layout : 'hbox',
					width : 700,
					style : 'margin-bottom:3px;',
					bodyStyle : 'border-width: 0px 0px 0px 0px;',
					items : [{
						id : 'address2',
						xtype : 'textfield',
						dataIndex : 'address',
						allowOnlyWhitespace : false,
						fieldLabel : '联系人地址',
						width : 340
					} ]
				
				}],
				buttonAlign : 'center',
				buttons : [{
							text : '更新',
							id : 'addNetworkButton2',
							handler : function() {
								if (this.up('form').getForm().isValid()) {
									//客户号
									var agencycode = trim(Ext.getCmp("zeroagencyCode2").getValue());
									//单位零余额账号
									var accountcode = Ext.getCmp("zeroaccountcode2").getValue();
									//账户名称
									var accountname = Ext.getCmp("accountname2").getValue();
									//是否是默认支持账号
									var defaultaccount;
									if (Ext.getCmp("defaultaccount2").getValue()=="1") {
										defaultaccount = 1;
									}else{
										defaultaccount = 0;
									}
									//用户名
									var username = Ext.getCmp("customName2").getValue();
									//区划编码
									var admdivcode = Ext.getCmp("admdivcode2").getValue();
									
									//所属机构blongOrg
									var blongOrg = Ext.getCmp("blongOrg2").getValue();
									//营业执照号码
									var liNo = Ext.getCmp("liNo2").getValue();
									//企业机构代码accounttypecode
									var accountTypeCode = Ext.getCmp("accounttypecode2").getValue();
									//法人名称loadName
									var loadName = trim(Ext.getCmp("loadName2").getValue());
									//法人证件类型loadIdType
									var loadIdType = Ext.getCmp("loadIdType2").getValue();
									//法人证件号码loadIdNo
									var loadIdNo = trim(Ext.getCmp("loadIdNo2").getValue());									
									//经办人人姓名
									var signName = trim(Ext.getCmp("signName2").getValue());
									//联系人contact
									var contact = Ext.getCmp("contact2").getValue();
									//电话号码
									var phoneno = Ext.getCmp("telephoneNo2").getValue();
									//地址
									var address = Ext.getCmp("address2").getValue();
									//邮箱
									var email = trim(Ext.getCmp("email2").getValue());
									//经办人证件类型
									var signCardType = Ext.getCmp("signCardType2").getValue();
									//经办人证件号码
									var signCardNo = trim(Ext.getCmp("signCardNo2").getValue());
									//非空校验
									if(agencycode == null || agencycode == ""){
										Ext.Msg.alert("系统提示", "客户号不能为空，请先查询签约账号信息！");
										return;
									}
									var myMask = new Ext.LoadMask(
											Ext.getBody(), {

												msg : '后台正在处理中，请稍后....',
												removeMask : true
											});
									myMask.show();
									Ext.Ajax.request({
										url : '/realware/updateSignProByZeroNo.do',
										waitMsg : '后台正在处理中,请稍后....',
										timeout : 180000, // 设置为3分钟
										async : false,// 添加该属性即可同步,
										// jsonData : data,
										params : {
											signcardtype : signCardType,
											signcardno : signCardNo,
											defaultaccount : defaultaccount,
											customno : agencycode,
											accountname : accountname,
											admdivcode : admdivcode,
											address : address,
											email : email,
											telephoneno : phoneno,
											contact : contact,
											signname : signName,
											idno : loadIdNo,
											idtype : loadIdType,
											loadername : loadName,
											orgcode : accountTypeCode,
											lino : liNo,
											belongorg : blongOrg,
											customname : username,
											accountcode : accountcode
										},

										// 提交成功的回调函数
										success : function(response, options) {
											succAjax(response, myMask, true);
											Ext.getCmp('updateForm').getForm()
													.reset();
											Ext.getCmp("editWindow").close();

										},
										// 提交失败的回调函数
										failure : function(response, options) {
											failAjax(response, myMask);
											refreshData();
										}
									});
								}
							}
						}, {

							text : '取消',
							id : 'canceleditButton',
							handler : function() {
								this.up('form').getForm().reset();
								this.up('window').close();
							}
						} ]
			})
		});
	}
	queryUser(accountcode,customno,1,'/realware/querySignByCustomAndZeroAccount.do')
	editZeroProWindow.show();
}
/**
 * 查询账户信息
 */
function queryAccount(accountcode,url){
	if(accountcode == null || accountcode == ""){
		Ext.Msg.alert("系统提示", "查询为空为空！");
		return;
	}
	var myMask = new Ext.LoadMask(Ext.getBody(), {
		msg : '后台正在处理中，请稍后....',
		removeMask : true
	});
	myMask.show(); 
	Ext.Ajax.request({
		url : url,
		method : 'POST',
		timeout : 180000, // 设置为3分钟
		params : {
			account_code : accountcode
		 },
		// 提交成功的回调函数
		success : function(response, options) {
		     checkQuery = 1;
			 myMask.hide();
			 Ext.Msg.alert('系统提示', response.responseText);
		},
		// 提交失败的回调函数
		failure : function(response, options) {
		     checkQuery = 0;
			 myMask.hide();
			 Ext.Msg.alert('系统提示', response.responseText);
		}
	});
	
}
/**
 * 查询用户信息并回显
 */
function queryUser(accountcode,customno,update,url){
	if(accountcode == null || accountcode == ""){
		Ext.Msg.alert("系统提示", "查询数据为空！");
		return;
	}
	var myMask = new Ext.LoadMask(Ext.getBody(), {
		msg : '后台正在处理中，请稍后....',
		removeMask : true
	});
	myMask.show(); 
	Ext.Ajax.request({
		url : url,
		method : 'POST',
		timeout : 180000, // 设置为3分钟
//		contentType : "application/json",
		params : {
//			 "ukey_code" : records[0].get('ukey_code')	
			account_code : accountcode,
			customno : customno
		 },
		// 提交成功的回调函数
		success : function(response, options) {
//			 var dto = Ext.decode(response.responseText);
			 var dto = new Function("return " + response.responseText)();
			 if(update == 1){
				 setValueForUpdate(dto);
			 }
			 /*
			 else{
				 setValue(dto);
			 }*/
			 myMask.hide();
		},
		// 提交失败的回调函数
		failure : function(response, options) {
			failAjax(response, myMask);
			refreshData();
		}
	});
	
}
/**
 * 更新回显
 */
function setValueForUpdate(obj){
	//客户号
	Ext.getCmp("zeroagencyCode2").setValue(obj.customno);
	//单位零余额账号
	 Ext.getCmp("zeroaccountcode2").setValue(obj.accountcode);
	//账户名称
	Ext.getCmp("accountname2").setValue(obj.accountname);
	//是否是默认支持账号
	Ext.getCmp("defaultaccount2").setValue(obj.defaultaccount);
	//用户名
	Ext.getCmp("customName2").setValue(obj.customname);
	//区划编码
	Ext.getCmp("admdivcode2").setValue(obj.admdivcode);
	
	//所属机构blongOrg
	Ext.getCmp("blongOrg2").setValue(obj.belongorg);
	//营业执照号码
	Ext.getCmp("liNo2").setValue(obj.lino);
	//企业机构代码accounttypecode
	Ext.getCmp("accounttypecode2").setValue(obj.orgcode);
	//法人名称loadName
	Ext.getCmp("loadName2").setValue(obj.loadername);
	//法人证件类型loadIdType
	Ext.getCmp("loadIdType2").setValue(obj.idtype);
	//法人证件号码loadIdNo
	Ext.getCmp("loadIdNo2").setValue(obj.idno);									
	//签约人姓名
	Ext.getCmp("signName2").setValue(obj.signname);
	//联系人contact
	Ext.getCmp("contact2").setValue(obj.contact);
	//电话号码
	Ext.getCmp("telephoneNo2").setValue(obj.telephoneno);
	//地址
	Ext.getCmp("address2").setValue(obj.address);
	//邮箱
	Ext.getCmp("email2").setValue(obj.email);
	//经办人证件类型
	Ext.getCmp("signCardType2").setValue(obj.signcardtype);
	//经办人证件号码
	Ext.getCmp("signCardNo2").setValue(obj.signcardno);
}
/**
 * 回显
 * @param obj
 * @return
 */
//function setValue(obj) {
//	Ext.getCmp("zeroagencyCode1").setValue(obj.agency_code);
//	Ext.getCmp("customName1").setValue(obj.user_name);
//	Ext.getCmp("blongOrg1").setValue(obj.blong_org);
//	Ext.getCmp("liNo1").setValue(obj.li_no);
//	Ext.getCmp("accounttypecode1").setValue(obj.account_type_code);
//	Ext.getCmp("loadName1").setValue(obj.loader);
//	Ext.getCmp("loadIdType1").setValue(obj.id_type);
//	Ext.getCmp("loadIdNo1").setValue(obj.id_no);
//	Ext.getCmp("contact1").setValue(obj.contact);
//	Ext.getCmp("telephoneNo1").setValue(obj.telephone_no);
//	Ext.getCmp("address1").setValue(obj.address);
//	Ext.getCmp("email1").setValue(obj.e_mail);
//}

/**
 * 注销
 */
function cancleBuffetCounter() {
	var records = finPanel.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请选中一条网点信息！");
		return;
	} 
	var myMask = new Ext.LoadMask(Ext.getBody(), {
		msg : '后台正在处理中，请稍后....',
		removeMask : true
	});
	
	Ext.Msg.confirm('系统提示','您确定注销此信息', function(e) {
		if (e == "yes") {
			
			var accountcode = records[0].get('accountcode');
			saveDel(accountcode);
		}
	});
}

function saveMsg(){

	//客户号
	var agencycode = trim(Ext.getCmp("zeroagencyCode1").getValue());
	//单位零余额账号
	var accountcode = trim(Ext.getCmp("zeroaccountcode1").getValue());
	//账户名称
	var accountname = Ext.getCmp("accountname1").getValue();
	//是否是默认支持账号
	var defaultaccount;
	if (Ext.getCmp("defaultaccount1").getValue()=="1") {
		defaultaccount = 1;
	}else{
		defaultaccount = 0;
	}
	//用户名
	var username = Ext.getCmp("customName1").getValue();
	//区划编码
	var admdivcode = trim(Ext.getCmp("admdivcode1").getValue());
	
	//所属机构blongOrg
	var blongOrg = Ext.getCmp("blongOrg1").getValue();
	//客户本地状态customStatus
	var customStatus = 0;
	//营业执照号码
	var liNo = Ext.getCmp("liNo1").getValue();
	//企业机构代码accounttypecode
	var accountTypeCode = Ext.getCmp("accounttypecode1").getValue();
	//法人名称loadName
	var loadName = Ext.getCmp("loadName1").getValue();
	//法人证件类型loadIdType
	var loadIdType = Ext.getCmp("loadIdType1").getValue();
	//法人证件号码loadIdNo
	var loadIdNo = Ext.getCmp("loadIdNo1").getValue();									
	//签约人姓名
	var signName = Ext.getCmp("signName1").getValue();
	//联系人contact
	var contact = Ext.getCmp("contact1").getValue();
	//电话号码
	var phoneno = Ext.getCmp("telephoneNo1").getValue();
	//地址
	var address = Ext.getCmp("address1").getValue();
	//邮箱
	var email = Ext.getCmp("email1").getValue();
	//经办人证件类型
	var signCardType = Ext.getCmp("signCardType1").getValue();
	//经办人证件号码
	var signCardNo = Ext.getCmp("signCardNo1").getValue();
	//非空校验
	if(accountcode == null || accountcode == ""){
		Ext.Msg.alert("系统提示", "签约账号不能为空！");
		return;
	}else if(!checkQuery){
		Ext.Msg.alert("系统提示", "请先查询签约账号信息！");
		return;
	}
	var myMask = new Ext.LoadMask(
			Ext.getBody(), {

				msg : '后台正在处理中，请稍后....',
				removeMask : true
			});
	myMask.show();
	Ext.Ajax.request({
		url : '/realware/addBocZeroNoPro.do',
		waitMsg : '后台正在处理中,请稍后....',
		timeout : 180000, // 设置为3分钟
		async : false,// 添加该属性即可同步,
		// jsonData : data,
		params : {
			signcardtype : signCardType,
			signcardno : signCardNo,
			defaultaccount : defaultaccount,
			customno : agencycode,
			accountname : accountname,
			admdivcode : admdivcode,
			address : address,
			email : email,
			telephoneno : phoneno,
			contact : contact,
			signname : signName,
			idno : loadIdNo,
			idtype : loadIdType,
			loadername : loadName,
			orgcode : accountTypeCode,
			lino : liNo,
			belongorg : blongOrg,
			customname : username,
			accountcode : accountcode,
			ctmstatus : customStatus
		},

		// 提交成功的回调函数
		success : function(response, options) {
			succAjax(response, myMask, true);
			Ext.getCmp('addForm').getForm()
					.reset();
			Ext.getCmp("addWindow").close();

		},
		// 提交失败的回调函数
		failure : function(response, options) {
			failAjax(response, myMask);
			refreshData();
		}
	});

}

function saveDel(accountcode){
	var myMask = new Ext.LoadMask(Ext.getBody(), {
		msg : '后台正在处理中，请稍后....',
		removeMask : true
	});
	 myMask.show(); 
	 var jsonArray = [];
		Ext.Ajax.request({
			url : '/realware/updateBocAutoSignAccount.do',
			method : 'POST',
			timeout : 180000, // 设置为3分钟
			 contentType : "application/json",
			 params : {
				 accountcode : accountcode
			 },
			// 提交成功的回调函数
			success : function(response, options) {
				succAjax(response, myMask, true);
			},
			// 提交失败的回调函数
			failure : function(response, options) {
				failAjax(response, myMask);
				refreshData();
			}
		});
}
/**
* 去掉字符串前后的空格
* @param {String} 字符串
* @return {String} 去除空格后的字符串
*/
function trim(param) {
    var vRet = '';
    if ((vRet = param) == '') { return vRet; }
    while (true) {
        if (vRet.indexOf (' ') == 0) {
                vRet = vRet.substring(1, parseInt(vRet.length));
        } else if ((parseInt(vRet.length) != 0) && (vRet.lastIndexOf (' ') == parseInt(vRet.length) - 1)) {
                vRet = vRet.substring(0, parseInt(vRet.length) - 1);
        } else {
                return vRet;
        }
    }
}
