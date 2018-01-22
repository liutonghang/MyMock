/**
 * 自助柜面- 零余额账户签约标准版
 */
document.write('<script type="text/javascript" src="/realware/resources/js/share/gridPanel.js"></script>');
document.write('<script type="text/javascript" src="/realware/resources/js/share/json2String.js"></script>');
document.write('<script type="text/javascript" src="/realware/resources/js/share/listView.js"></script>');
document.write('<script type="text/javascript" src="/realware/resources/js/share/menuBtnStatus.js"></script>');

/**
 * 数据项
 */
var fileds = [ "signid","customno", "accountcode", "customname","belongorg", "isvalide","lino",
		"orgcode","loadername", "idtype","idno","signtel", "signname","signcardtype","signcardno", "contact",
		"telephoneno", "email","address","createdate","editdate","deldate","bankcode" ];

/**
 * 列名
 */

var header = "客户号|customno,签约账号|accountcode|150,客户名称|customname,开户行|bankcode,所属机构|belongorg,客户状态|isvalide,营业执照号码|lino," +
"企业组织机构代码|orgcode,法人|loadername, 法人证件类型|idtype,法人证件号码|idno,经办人姓名|signname,经办人电话|signtel,经办人证件类型|signcardtype,经办人证件号码|signcardno," +
		"联系人|contact,电话|telephoneno,联系地址|address,签约时间|createdate,更新时间|editdate,注销时间|deldate";

var finPanel = null;
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
						addZeroNoPro1();
					}
				}, {
					id : 'edit',
					text : '更新',
					iconCls : 'edit',
					scale : 'small',
					handler : function() {
					editZeroNoPro();
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
						fieldLabel : '单位零余额账号',
						xtype : 'textfield'
					}, {
						id : 'userscode',
						fieldLabel : '客户号',
						xtype : 'textfield'
					} ]
				}
			} ]
		}) ]
	});
	//操作员证件类型转换
	var col = Ext.getCmp('idtype');
	col.renderer = function(value,col) {
		
		var record = cardStore.findRecord('value',value);
		if(record) {
			return record.get('name');
		}
		return value;
	};
	setBtnVisible(null, Ext.getCmp("buttongroup"));
	refreshData();
});
/**
 * 选择条件
 */
function selectEnabledStore() {
	var taskState = Ext.getCmp("taskState").getValue();

	if ("1" == taskState  ) {
		Ext.getCmp('logoff').enable(false);
		Ext.getCmp('edit').enable(false);
		Ext.getCmp("deldate").setVisible(false);
	} 
	if ("0" == taskState) {
		Ext.getCmp('logoff').disable(false);
		Ext.getCmp('edit').disable(false);
		Ext.getCmp("deldate").setVisible(true);
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
var required = '<span style="color:red;font-weight:bold" data-qtip="Required">*</span>',addZeroProWindow;
function addZeroNoPro1(){
			var me = this;
	if (!addZeroProWindow) {
		addZeroProWindow = Ext.widget('window', {
			id : "addWindow",
			title : '签约窗口',
			style : {
				'text-align' : 'left'
			},
			closeAction : 'close',
			width : 630,
			height :480,
			autoScroll:true,
			layout: 'border',
			resizable : false,
			    items: [{
					        title: '单位账号信息',
					        id : 'accountForm',
					        style : {
								'text-align' : 'left'
							},
					        region: 'north',     
					        xtype: 'form',
					        layout : {
								type : 'table',
								columns : 2
							},
					        bodyPadding : '5 0 0 0',
					        height: 90,
					        
					        items : [ {
										id : 'zeroaccountcode',
										dataIndex : 'account_code',
										fieldLabel : '单位零余额账号:',
										allowBlank : false,
										xtype : 'textfield',
										labelAlign : 'right',
										afterLabelTextTpl : required,
										regex: /^[0-9a-zA-Z]{0,32}$/,
										regexText:"账号输入格式错误,请输入数字,字母最大长度32."
									  },{
										id : 'queryButton1',
										text : '查询',
										xtype : 'button',
										style : 'margin-left:15px;margin-right:5px;',
										handler: function() {
										var accountcode = Ext.getCmp("zeroaccountcode").getValue();
												if(/^[0-9a-zA-Z]{0,32}$/.test(accountcode)){
													queryAccountInfo(accountcode,0);
												}else{
													Ext.Msg.alert("系统提示","单位零余额账户只允许输入字母和数字");
													return;
												}
												
											
											}
									  },{
										id : 'agencyName',
										xtype : 'textfield',
										dataIndex : 'account_name',
										labelAlign : 'right',
										fieldLabel : '账户名称',
										afterLabelTextTpl : required,
										disabled : true
									  },{
										id : 'bankName',
										xtype : 'textfield',
										labelAlign : 'right',
										dataIndex : 'bank_code',
										fieldLabel : '开户行',
										afterLabelTextTpl : required,
										disabled : true
									  }
									]
    					},{
       
					        title: '客户信息',
					        id : 'customerForm',
					        style : {
								'text-align' : 'left'
							},
					        region:'west',
					        xtype: 'form',
					        margins: '0 0 0 0',
					        width: 300,
					        layout:'form',
					        items:[ {
					        		   id : 'zeroagencyCode',
									   xtype : 'textfield',
									   dataIndex : 'agency_code',
									   fieldLabel : '客户号:',
									   labelAlign : "right",
									   allowBlank : false,
									   width : 280,
									   labelWidth : 90,
									   afterLabelTextTpl : required,
									   regex:/^([a-zA-Z0-9_-]){0,20}$/,
									   regexText:"只能输入字母，数字，下划线，横线，长度最大为20."
					                },{
					        		   id : 'customName1',
									   xtype : 'textfield',
									   dataIndex : 'user_name',
									   fieldLabel : '客户名称:',
									   labelAlign : "right",
									   allowBlank : false,
									   width : 280,
									   labelWidth : 90,
									   afterLabelTextTpl : required,
									   regex:/^([\u4e00-\u9fa5\.]){0,50}$/,
									   regexText:"只能输入中文，点，长度最大为50."
//									   listeners :{
//										   blur:function(){
//											   var o = Ext.getCmp("customName1");
//											   checkName(o,30)
//										   }
//									   }
					                }, {
					        		   id : 'blongOrg1',
									   xtype : 'textfield',
									   dataIndex : 'blong_org',
									   fieldLabel : '所属机构:',
									   labelAlign : "right",
									   allowBlank : false,
									   width : 280,
									   labelWidth : 90,
									   afterLabelTextTpl : required,
									   regex:/^([\u4e00-\u9fa5a-zA-Z0-9_-])*$/,
									   regexText:"只能输入中文，字母，数字，下划线."
					                },{
					        		   id : 'liNo1',
									   xtype : 'textfield',
									   dataIndex : 'li_no',
									   fieldLabel : '营业执照号码:',
									   allowBlank : false,
									   labelAlign : "right",
									   width : 280,
									   labelWidth : 90,
									   afterLabelTextTpl : required,
									   regex:/^([a-zA-Z0-9]){0,42}$/,
									   regexText:"只能输入字母和数字，最大长度不超过42，字母区分大小写"
					                },{
					        		   id : 'accounttypecode',
									   xtype : 'textfield',
									   dataIndex : 'account_type_code',
									   fieldLabel : '组织机构代码:',
									   allowBlank : false,
									   labelAlign : "right",
									   width : 280,
									   labelWidth : 90,
									   afterLabelTextTpl : required,
									   regex:/^([a-zA-Z0-9]){0,42}$/,
									   regexText:"只能输入字母和数字，最大长度不超过42，字母区分大小写"
					                },{
					        		   id : 'loadName1',
									   xtype : 'textfield',
									   dataIndex : 'loader',
									   fieldLabel : '法人代表名称:',
									   allowBlank : false,
									   labelAlign : "right",
									   width : 280,
									   labelWidth : 90,
									   afterLabelTextTpl : required,
									   regex:/^([\u4e00-\u9fa5\.]){0,30}$/,
									   regexText:"只能输入中文，点，长度最大为30."
					                },{
										id : 'loadIdType',
										xtype : 'combo',
										emptyText : '请选择',
										fieldLabel : '法人证件类型',
										afterLabelTextTpl : required,
										valueField : 'value',
										displayField : 'name',
										editable : false,
										store : cardStore,
										width : 280,
										abelWidth : 90,
										labelAlign : "right",
										listeners :{
					                		select : function(combo, record,index){ 
												var val = record[0].get("value");
												var o = Ext.getCmp("loadIdNo");
												if(val==1){
													o.regex = /^(\d{15}$|^\d{18}$|^\d{17}(\d|X|x))$/;
													o.regexText="证件格式错误,长度不能超过18位";
												}else{
													o.regex = /^([\u4e00-\u9fa5a-zA-Z0-9_-]){0,30}$/;
													o.regex = /^[^\u4e00-\u9fa5]{0,}$/;
													o.regexText="证件格式错误,不能包含特殊字符,长度不超过30";
												}
												o.focus();
										}}
								  } ,{
					        		   id : 'loadIdNo',
									   xtype : 'textfield',
									   dataIndex : 'id_no',
									   fieldLabel : '法人证件号码:',
									   labelAlign : "right",
									   width : 280,
									   labelWidth : 90,
									   afterLabelTextTpl : required
					                },{
					        		   id : 'contact1',
									   xtype : 'textfield',
									   dataIndex : 'contact',
									   fieldLabel : '联系人:',
									   labelAlign : "right",
									   width : 280,
									   labelWidth : 90,
									   afterLabelTextTpl : required,
									   regex:/^([\u4e00-\u9fa5\.]){0,30}$/,
									   regexText:"只能输入中文，点，长度最大为30."
					                },{
					        		   id : 'telephoneNo',
									   xtype : 'textfield',
									   dataIndex : 'telephoneNo',
									   fieldLabel : '联系人电话:',
									   labelAlign : "right",
									   width : 280,
									   labelWidth : 90,
									   afterLabelTextTpl : required,
									   regex: /^1[3,5,8,7]\d{9}$/,
									   regexText:"只能录入手机号码，由11位数字组成"
					                }, {
					        		   id : 'address',
									   xtype : 'textfield',
									   dataIndex : 'address',
									   labelAlign : "right",
									   fieldLabel : '联系人地址:',
									   width : 280,
									   labelWidth : 90,
									   afterLabelTextTpl : required,
									   regex:/^([\u4e00-\u9fa5a-zA-Z0-9_-])*$/,
									   regexText:"只能输入中文，字母，数字，下划线."
					                }
					        ]
                         },{
					        title: '经办信息',
					        id : 'transactorForm',
					        style : {
								'text-align' : 'left'
							},
					        region: 'center',     
					        xtype: 'form',
					        margins: '0 0 0 0',
					        layout:'form',
					        items:[{
										id : 'signName1',
										xtype : 'textfield',
										dataIndex : 'sign_Name1',
										fieldLabel : '经办人姓名',
										labelAlign : "right",
										width : 280,
										abelWidth : 90,
										afterLabelTextTpl : required,
										regex:/^([\u4e00-\u9fa5\.]){0,30}$/,
										regexText:"只能输入中文，点，长度最大为30."
				                   },{
										id : 'signPhone1',
										xtype : 'textfield',
										dataIndex : 'sign_Phone1',
										fieldLabel : '经办人电话',
										labelAlign : "right",
										width : 280,
										abelWidth : 90,
										afterLabelTextTpl : required,
										regex: /^1[3,5,8,7]\d{9}$/,
										regexText:"只能录入手机号码，由11位数字组成"
								  } ,{
										id : 'signCardType',
										xtype : 'combo',
										emptyText : '请选择',
										fieldLabel : '经办人证件类型',
										afterLabelTextTpl : required,
										valueField : 'value',
										displayField : 'name',
										editable : false,
										store : cardStore,
										width : 280,
										abelWidth : 90,
										labelAlign : "right",
										listeners :{select : function(combo, record,index){ 
											var val = record[0].get("value");
											var o = Ext.getCmp("signCardNo");
											if(val==1){
												o.regex = /^(\d{15}$|^\d{18}$|^\d{17}(\d|X|x))$/;
												o.regexText="证件格式错误,长度不能超过18位";
											}else{
												o.regex = /^([\u4e00-\u9fa5a-zA-Z0-9_-]){0,30}$/;
												o.regex = /^[^\u4e00-\u9fa5]{0,}$/;
												o.regexText="证件格式错误,不能包含特殊字符,长度不超过30";
											}
											o.focus();
										}}
								  } ,{
										id : 'signCardNo',
										xtype : 'textfield',
										dataIndex : 'signCardNo',
										fieldLabel : '经办人证件号码',
										labelAlign : "right",
										width : 280,
										abelWidth : 90,
										afterLabelTextTpl : required
				                 } 
					             ]
                       },{
    						region: 'south',     
					        xtype: 'buttongroup',
					        style : {
								'text-align' : 'center'
							},
							
					        items : [ {
							text : '确定',
							xtype : 'button',
							margin : "0 0 0 250",
							id : 'addNetworkButton1',
							handler : function() {
								// 单位零余额账号
								var zeroaccountcode = Ext.getCmp("zeroaccountcode").getValue();
								// 账户名称
								var agencyName = Ext.getCmp("agencyName").getValue();
								// 开户行
								var bankName = Ext.getCmp("bankName").getValue();
								// 客户号
								var zeroagencyCode = Ext.getCmp("zeroagencyCode").getValue();
								// 客户名称
								var customName1 = Ext.getCmp("customName1").getValue();
								// 所属机构
								var blongOrg1 = Ext.getCmp("blongOrg1").getValue();
								// 营业执照号码
								var liNo1 = Ext.getCmp("liNo1").getValue();
								// 企业组织机构代码
								var accounttypecode = Ext.getCmp("accounttypecode").getValue();
								// 法人代表名称
								var loadName1 = Ext.getCmp("loadName1").getValue();
								// 法人证件类型
								var loadIdType = Ext.getCmp("loadIdType").getValue();
								// 法人证件号码
								var loadIdNo = Ext.getCmp("loadIdNo").getValue();
								// 联系人
								var contact = Ext.getCmp("contact1").getValue();
								// 联系人电话
								var telephoneNo = Ext.getCmp("telephoneNo").getValue();
								// 联系人地址
								var address = Ext.getCmp("address").getValue();
								// 经办人姓名
								var username = Ext.getCmp("signName1").getValue();
								// 经办人电话
								var signPhone1 = Ext.getCmp("signPhone1").getValue();
								// 经办人证件类型
								var signCardType = Ext.getCmp("signCardType").getValue();
								// 经办人证件号码
								var signCardNo = Ext.getCmp("signCardNo").getValue();
			
								if(zeroaccountcode == "" || zeroaccountcode == null){
									Ext.Msg.alert("系统提示", "单位零余额账号不能为空");
									return;
								}if((agencyName == "" || agencyName == null)&&(bankName == "" || bankName == null)){
									Ext.Msg.alert("系统提示", "请先查询该账户");
									return;
								}if(zeroagencyCode == "" || zeroagencyCode == null){
									Ext.Msg.alert("系统提示","客户号不能为空");
									return;
								}if(customName1 == "" || customName1 == null){
									Ext.Msg.alert("系统提示","客户名称不能为空");
									return
								}if(blongOrg1 == "" || blongOrg1 == null){
									Ext.Msg.alert("系统提示","所属机构不能为空");
									return;
								}if(liNo1 == "" || liNo1 == null){
									Ext.Msg.alert("系统提示","营业执照号码不能为空");
									return;
								}if(accounttypecode == "" || accounttypecode == null){
									Ext.Msg.alert("系统提示","企业组织机构代码不能为空");
									return;
								}if(loadName1 == "" || loadName1 == null){
									Ext.Msg.alert("系统提示","法人代表名称不能为空");
									return;
								}if(loadIdType == "" || loadIdType == null){
									Ext.Msg.alert("系统提示","法人证件类型不能为空");
									return;
								}if(loadIdNo == "" || loadIdNo == null){
									Ext.Msg.alert("系统提示","法人证件号码不能为空");
									return;
								}if(contact == "" || contact == null){
									Ext.Msg.alert("系统提示","联系人不能为空");
									return;
								}if(telephoneNo == "" || telephoneNo == null){
									Ext.Msg.alert("系统提示","联系人电话不能为空");
									return;
								}if(address == "" || address == null){
									Ext.Msg.alert("系统提示","联系人地址不能为空");
									return;
								}if(username == "" || username == null){
									Ext.Msg.alert("系统提示", "经办人姓名不能为空");
									return;
								}if(signPhone1 == "" || signPhone1 == null){
									Ext.Msg.alert("系统提示", "经办人电话不能为空");
									return;
								}if(signCardType == "" || signCardType == null){
									Ext.Msg.alert("系统提示", "经办人证件类型不能为空");
									return;
								}if(signCardNo == "" || signCardNo == null){
									Ext.Msg.alert("系统提示", "经办人证件号码不能为空");
									return;
								}		
								if(!Ext.getCmp("customerForm").isValid()||!Ext.getCmp("accountForm").isValid()||!Ext.getCmp("transactorForm")){
									Ext.Msg.alert("系统提示", "录入信息有误，请先查正！");
									return ;
								}
								// 保存
								saveMsg();
							}
						}, {

							text : '取消',
							xtype : 'button',
							id : 'cancelBuffetCounterButton',
							handler : function() {
								Ext.getCmp("accountForm").getForm().reset();
								Ext.getCmp("customerForm").getForm().reset();
					            Ext.getCmp("transactorForm").getForm().reset();
							    addZeroProWindow.hide();
							    Ext.getCmp("addWindow").close();
							}
						}]
    }]

			});
		}
	Ext.getCmp("accountForm").getForm().reset();
	Ext.getCmp("customerForm").getForm().reset();
    Ext.getCmp("transactorForm").getForm().reset();
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
	if (!editZeroProWindow) {
		editZeroProWindow = Ext.widget('window', {
			id : "editWindow",
			title : '更新',
			style : {
				'text-align' : 'left'
			},
			closeAction : 'close',
			width : 600,
			height :480,
			autoScroll:true,
			layout: 'border',
			resizable : false,
			    items: [
			            {
					        title: '单位账号信息',
					        id : 'updateAccountForm',
					        style : {
								'text-align' : 'left'
							},
					        region: 'north',     
					        xtype: 'form',
					        layout : {
								type : 'table',
								columns : 2
							},
					        bodyPadding : '5 0 0 0',
					        height: 80,
					        
					        items : [ {
										id : 'zeroaccountcode2',
										name : 'accountcode',
										fieldLabel : '单位零余额账号:',
										allowBlank : false,
										xtype : 'textfield',
										labelAlign : 'right',
										afterLabelTextTpl : required,
										disabled : true
									  },{
										id : 'agencyName2',
										xtype : 'textfield',
										name : 'customname',
										labelAlign : 'right',
										fieldLabel : '账户名称',
										afterLabelTextTpl : required,
										disabled : true,
										hidden : true
									  },{
										id : 'bankName2',
										xtype : 'textfield',
										labelAlign : 'right',
										name : 'bankcode',
										fieldLabel : '开户行',
										afterLabelTextTpl : required,
										disabled : true
									  },{
										id : 'sign_id',
										xtype : 'textfield',
										labelAlign : 'right',
										name : 'signid',
										hidden : true
										  }
									]
    					},{
					        title: '客户信息',
					        id : 'updateCustomerForm',
					        style : {
								'text-align' : 'left'
							},
					        region:'west',
					        xtype: 'form',
					        margins: '0 0 0 0',
					        width: 290,

					        items:[ {
					        		   id : 'zeroagencyCode2',
									   xtype : 'textfield',
									   name : 'customno',
									   fieldLabel : '客户号:',
									   labelAlign : "right",
									   allowBlank : false,
									   width : 280,
									   labelWidth : 90,
									   afterLabelTextTpl : required,
									   regex:/^([a-zA-Z0-9_-]){0,20}$/,
									   regexText:"只能输入字母，数字，下划线，横线，长度最大为20."
					                },
					                {
					        		   id : 'customName2',
									   xtype : 'textfield',
									   name : 'customname',
									   fieldLabel : '客户名称:',
									   labelAlign : "right",
									   allowBlank : false,
									   width : 280,
									   labelWidth : 90,
									   afterLabelTextTpl : required,
									   regex:/^([\u4e00-\u9fa5\.]){0,50}$/,
									   regexText:"只能输入中文，点，长度最大为50."
					                },
					                {
					        		   id : 'blongOrg2',
									   xtype : 'textfield',
									   name : 'belongorg',
									   fieldLabel : '所属机构:',
									   labelAlign : "right",
									   allowBlank : false,
									   width : 280,
									   labelWidth : 90,
									   afterLabelTextTpl : required,
									   regex:/^([\u4e00-\u9fa5a-zA-Z0-9_-])*$/,
									   regexText:"只能输入中文，字母，数字，下划线."
					                },
					                {
					        		   id : 'liNo2',
									   xtype : 'textfield',
									   name : 'lino',
									   fieldLabel : '营业执照号码:',
									   labelAlign : "right",
									   allowBlank : false,
									   width : 280,
									   labelWidth : 90,
									   afterLabelTextTpl : required,
									   regex:/^([a-zA-Z0-9]){0,42}$/,
									   regexText:"只能输入字母和数字，最大长度不超过42，字母区分大小写"
					                },
					                {
					        		   id : 'accounttypecode2',
									   xtype : 'textfield',
									   name : 'orgcode',
									   fieldLabel : '组织机构代码:',
									   labelAlign : "right",
									   allowBlank : false,
									   width : 280,
									   labelWidth : 90,
									   afterLabelTextTpl : required,
									   regex:/^([a-zA-Z0-9]){0,42}$/,
									   regexText:"只能输入字母和数字，最大长度不超过42，字母区分大小写"
					                },
					                {
					        		   id : 'loadName2',
									   xtype : 'textfield',
									   name : 'loadername',
									   fieldLabel : '法人代表名称:',
									   labelAlign : "right",
									   allowBlank : false,
									   width : 280,
									   labelWidth : 90,
									   afterLabelTextTpl : required,
									   regex:/^([\u4e00-\u9fa5\.]){0,30}$/,
									   regexText:"只能输入中文，点，长度最大为30."
// disabled : true
					                },{
										id : 'loadIdType2',
										xtype : 'combo',
										emptyText : '请选择',
										fieldLabel : '法人证件类型',
										name : 'idtype',
										afterLabelTextTpl : required,
										valueField : 'value',
										displayField : 'name',
										editable : false,
										store : cardStore,
										width : 280,
										abelWidth : 90,
										labelAlign : "right",
										listeners :{select : function(combo, record,index){ 
											var val = record[0].get("value");
											var o = Ext.getCmp("loadIdNo2");
											if(val==1){
												o.regex = /^(\d{15}$|^\d{18}$|^\d{17}(\d|X|x))$/;	          
												o.regexText="证件格式错误,长度不能超过18位";
											}else{
												o.regex = /^([\u4e00-\u9fa5a-zA-Z0-9_-]){0,30}$/;
												o.regex = /^[^\u4e00-\u9fa5]{0,}$/;
												o.regexText="证件格式错误,不能包含特殊字符,长度不能超过30";
											}
											o.focus();
										}}
										
								  },{
					        		   id : 'loadIdNo2',
									   xtype : 'textfield',
									   name : 'idno',
									   fieldLabel : '法人证件号码:',
									   labelAlign : "right",
									   allowBlank : false,
									   width : 280,
									   labelWidth : 90,
									   afterLabelTextTpl : required
					                },
					                {
					        		   id : 'contact2',
									   xtype : 'textfield',
									   name : 'contact',
									   fieldLabel : '联系人:',
									   labelAlign : "right",
									   allowBlank : false,
									   width : 280,
									   labelWidth : 90,
									   afterLabelTextTpl : required,
									   regex:/^([\u4e00-\u9fa5\.]){0,30}$/,
									   regexText:"只能输入中文，点，长度最大为30."
					                },
					                {
					        		   id : 'telephoneNo2',
									   xtype : 'textfield',
									   name : 'telephoneno',
									   fieldLabel : '联系人电话:',
									   labelAlign : "right",
									   allowBlank : false,
									   width : 280,
									   labelWidth : 90,
									   afterLabelTextTpl : required,
									   regex: /^1[3,5,8,7]\d{9}$/,
									   regexText:"只能录入手机号码，由11位数字组成"
					                },
					                
					                {
					        		   id : 'address2',
									   xtype : 'textfield',
									   name : 'address',
									   fieldLabel : '联系人地址:',
									   labelAlign : "right",
									   allowBlank : false,
									   width : 280,
									   labelWidth : 90,
									   afterLabelTextTpl : required,
									   regex:/^([\u4e00-\u9fa5a-zA-Z0-9_-])*$/,
									   regexText:"只能输入中文，字母，数字，下划."
					                }
					        ]
                      },{
					        title: '经办信息',
					        id : 'updateTransactorForm',
					        style : {
								'text-align' : 'left'
							},
					        region: 'center',     
					        xtype: 'form',
					        margins: '0 0 0 0',
					        layout:'form',
					        items:[{
										id : 'signName2',
										xtype : 'textfield',
										dataIndex : 'sign_Name1',
										fieldLabel : '经办人姓名',
										labelAlign : "right",
										allowBlank : false,
										width : 280,
										labelWidth : 100,
										afterLabelTextTpl : required,
										regex:/^([\u4e00-\u9fa5\.]){0,30}$/,
									    regexText:"只能输入中文，点，长度最大为30."
				                   },{
										id : 'signPhone2',
										xtype : 'textfield',
										dataIndex : 'sign_Phone1',
										fieldLabel : '经办人电话',
										labelAlign : "right",
										allowBlank : false,
										width : 280,
										labelWidth : 100,
										afterLabelTextTpl : required,
										regex: /^1[3,5,8,7]\d{9}$/,
										regexText:"只能录入手机号码，由11位数字组成"
								  } ,{
										id : 'signCardType2',
										xtype : 'combo',
										emptyText : '请选择',
										fieldLabel : '经办人证件类型',
										afterLabelTextTpl : required,
										valueField : 'value',
										displayField : 'name',
										editable : false,
										store : cardStore,
										allowBlank : false,
										width : 280,
										labelWidth : 100,
										labelAlign : "right",
										listeners :{select : function(combo, record,index){ 
											var val = record[0].get("value");
											var o = Ext.getCmp("signCardNo2");
											if(val==1){
												o.regex = /^(\d{15}$|^\d{18}$|^\d{17}(\d|X|x))$/;
												o.regexText="证件格式错误,长度不能超过18位";
											}else{
												o.regex = /^([\u4e00-\u9fa5a-zA-Z0-9_-]){0,30}$/;
												o.regex = /^[^\u4e00-\u9fa5]{0,}$/;
												o.regexText="证件格式错误,不能包含特殊字符,长度不超过30";
											}
											o.focus();
										}}
								  } ,{
										id : 'signCardNo2',
										xtype : 'textfield',
										dataIndex : 'signCardNo',
										fieldLabel : '经办人证件号码',
										labelAlign : "right",
										allowBlank : false,
										width : 280,
										labelWidth : 100,
										afterLabelTextTpl : required
				                 } 
					             ]
                    },{
    						region: 'south',     
					        xtype: 'buttongroup',
					        style : {
								'text-align' : 'center'
							},
							
					        items : [ {
							text : '更新',
							id : 'editNetworkButton2',
							margin : "0 0 0 250",
							handler : function() {
								// 单位零余额账号
								var zeroaccountcode2 = Ext.getCmp("zeroaccountcode2").getValue();
								// 账户名称
								var agencyName2 = Ext.getCmp("agencyName2").getValue();
								// 开户行
								var bankName2 = Ext.getCmp("bankName2").getValue();
								// 客户号
								var zeroagencyCode2 = Ext.getCmp("zeroagencyCode2").getValue();
								// 客户名称
								var customName2 = Ext.getCmp("customName2").getValue();
								// 所属机构
								var blongOrg2 = Ext.getCmp("blongOrg2").getValue();
								// 营业执照号码
								var liNo2 = Ext.getCmp("liNo2").getValue();
								// 企业组织机构代码
								var accounttypecode2 = Ext.getCmp("accounttypecode2").getValue();
								// 法人代表名称
								var loadName2 = Ext.getCmp("loadName2").getValue();
								// 法人证件类型
								var loadIdType2 = Ext.getCmp("loadIdType2").getValue();
								// 法人证件号码
								var loadIdNo2 = Ext.getCmp("loadIdNo2").getValue();
								// 联系人
								var contact2 = Ext.getCmp("contact2").getValue();
								// 联系人电话
								var telephoneNo2 = Ext.getCmp("telephoneNo2").getValue();
								// 联系人地址
								var address2 = Ext.getCmp("address2").getValue();
								// 经办人姓名
								var username2 = Ext.getCmp("signName2").getValue();
								// 经办人电话
								var signPhone2 = Ext.getCmp("signPhone2").getValue();
								// 经办人证件类型
								var signCardType2 = Ext.getCmp("signCardType2").getValue();
								// 经办人证件号码
								var signCardNo2 = Ext.getCmp("signCardNo2").getValue();
			
								if(zeroaccountcode2 == "" || zeroaccountcode2 == null){
									Ext.Msg.alert("系统提示", "单位零余额账号不能为空");
									return;
								}if((agencyName2 == "" || agencyName2 == null)&&(bankName2 == "" || bankName2 == null)){
									Ext.Msg.alert("系统提示", "请先查询该账户");
									return;
								}if(zeroagencyCode2 == "" || zeroagencyCode2 == null){
									Ext.Msg.alert("系统提示","客户号不能为空");
									return;
								}if(customName2 == "" || customName2 == null){
									Ext.Msg.alert("系统提示","客户名称不能为空");
									return
								}if(blongOrg2 == "" || blongOrg2 == null){
									Ext.Msg.alert("系统提示","所属机构不能为空");
									return;
								}if(liNo2 == "" || liNo2 == null){
									Ext.Msg.alert("系统提示","营业执照号码不能为空");
									return;
								}if(accounttypecode2 == "" || accounttypecode2 == null){
									Ext.Msg.alert("系统提示","企业组织机构代码不能为空");
									return;
								}if(loadName2 == "" || loadName2 == null){
									Ext.Msg.alert("系统提示","法人代表名称不能为空");
									return;
								}if(loadIdType2 == "" || loadIdType2 == null){
									Ext.Msg.alert("系统提示","法人证件类型不能为空");
									return;
								}if(loadIdNo2 == "" || loadIdNo2 == null){
									Ext.Msg.alert("系统提示","法人证件号码不能为空");
									return;
								}if(contact2 == "" || contact2 == null){
									Ext.Msg.alert("系统提示","联系人不能为空");
									return;
								}if(telephoneNo2 == "" || telephoneNo2 == null){
									Ext.Msg.alert("系统提示","联系人电话不能为空");
									return;
								}if(address2 == "" || address2 == null){
									Ext.Msg.alert("系统提示","联系人地址不能为空");
									return;
								}if(username2 == "" || username2 == null){
									Ext.Msg.alert("系统提示", "经办人姓名不能为空");
									return;
								}if(signPhone2 == "" || signPhone2 == null){
									Ext.Msg.alert("系统提示", "经办人电话不能为空");
									return;
								}if(signCardType2 == "" || signCardType2 == null){
									Ext.Msg.alert("系统提示", "经办人证件类型不能为空");
									return;
								}if(signCardNo2 == "" || signCardNo2 == null){
									Ext.Msg.alert("系统提示", "经办人证件号码不能为空");
									return;
								}
								
								if(!Ext.getCmp("updateAccountForm").isValid()||!Ext.getCmp("updateCustomerForm").isValid()||!Ext.getCmp("updateTransactorForm").isValid()){
									Ext.Msg.alert("系统提示", "录入信息有误，请先查正！");
									return ;
								}
								// 保存
								updateMsg();
							}
						}, {

							text : '取消',
							id : 'canceleditButton',
							handler : function() {
								Ext.getCmp("updateAccountForm").getForm().reset();
								Ext.getCmp("updateCustomerForm").getForm().reset();
							    Ext.getCmp("updateTransactorForm").getForm().reset();
								this.up('window').close();
							}
						}, ]
    }]
//			
			});
		}
	Ext.getCmp("updateAccountForm").getForm().reset();
	Ext.getCmp("updateCustomerForm").getForm().reset();
    Ext.getCmp("updateTransactorForm").getForm().reset();
	Ext.getCmp('updateAccountForm').getForm().loadRecord(records[0]);
	Ext.getCmp('updateCustomerForm').getForm().loadRecord(records[0]);
	editZeroProWindow.show();
}

/**
 * 查询用户信息并回显
 */
function queryAccountInfo(accountcode,update){
	if(accountcode == null || accountcode == ""){
		Ext.Msg.alert("系统提示", "查询数据为空！");
		return;
	}
	var myMask = new Ext.LoadMask(Ext.getBody(), {
		msg : '后台正在处理中，请稍后....',
		removeMask : true
	});
// myMask.show();
	Ext.Ajax.request({
		url : '/realware/queryAccountInfo.do',
		method : 'POST',
		timeout : 180000, // 设置为3分钟
// contentType : "application/json",
		params : {
// "ukey_code" : records[0].get('ukey_code')
			account_code : accountcode
		 },
		// 提交成功的回调函数
		success : function(response, options) {
			 var dto = Ext.decode(response.responseText);
		// var dto = new Function("return " + response.responseText)();
			  Ext.getCmp("agencyName").setValue(dto.account_name);
			  Ext.getCmp("bankName").setValue(dto.bank_code);
			  myMask.hide();
// addBuffetCounter();
// succAjax(response, myMask, true);
		},
		// 提交失败的回调函数
		failure : function(response, options) {
			failAjax(response, myMask);
			refreshData();
		}
	});
	
}

/**
 * 注销
 */
function cancleBuffetCounter() {
	var records = finPanel.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请选中一条网点信息！");
		return;
	} 
	if (records.length > 1) {
		Ext.Msg.alert("系统提示", "只能选择一条数据注销！");
		return;
	} 
	var myMask = new Ext.LoadMask(Ext.getBody(), {
		msg : '后台正在处理中，请稍后....',
		removeMask : true
	});
	
	Ext.Msg.confirm('系统提示','您确定注销此信息', function(e) {
		if (e == "yes") {
			
			var customno = records[0].get('customno');
			saveDel(customno);

		}
	});
}
/*******************************************************************************
 * 授权
 * 
 * @return
 */
function authorize(methodName,accountcode){
	var methodName = methodName;
	if (accountcode != null){
		var accountcode = accountcode;
	}
	var returnValue=0;// 0表示授权失败，1表示授权成功
	var proInfo = null;
			var me = this;
			var form = Ext.create('Ext.form.Panel', {
						layout : 'absolute',
						defaultType : 'textfield',
						border : false,
						bodyStyle : "background:#DFE9F6",
						items : [{
									fieldLabel : '授权柜员',
									id : "majorUserCode",
									fieldWidth : 40,
									labelWidth : 60,
									msgTarget : 'side',
									allowBlank : false,
									onBlur : onBlurS1,
									x : 5,
									y : 5,
									anchor : '-5' // anchor width by
													// percentage
								}, {
									fieldLabel : '柜员密码',
									id : "txtmajorUserCodePwd",
									fieldWidth : 40,
									labelWidth : 60,
									inputType : 'password',
									msgTarget : 'side',
									minLength : 6,
									maxLength : 6,
									allowBlank : false,
									x : 5,
									y : 35,
									anchor : '-5' // anchor width by
													// percentage
								}],
						dockedItems : [{
									xtype : 'toolbar',
									dock : 'bottom',
									ui : 'footer',
									layout : {
										pack : "end"
									},
									items : [{
												text : "确认",
												width : 80,
												handler : onConfirm,
												scope : me
											}, {
												text : "取消",
												width : 80,
												handler : onCancel,
												scope : me
											}]
								}]
	
					});
			var win = Ext.create('Ext.window.Window', {
						autoShow : true,
						title : '授权',
						width : 300,
						height : 130,
						layout : 'fit',
						plain : true,
						resizable : false,
						items : form
					});
			function onCancel() {
				win.close();
				returnValue=0;
			}
			function onConfirm() {				
				var myMask = new Ext.LoadMask(Ext.getBody(), {
							msg : '后台正在处理中，请稍后....',
							removeMask : true
						});
				myMask.show();
				Ext.Ajax.request({
							url : "/realware/checkUserByPasswordOrFinger.do",
							method : 'POST',
							timeout : 180000, // 设置为3分钟
							params : {
								majorUserCode: Ext.getCmp('majorUserCode').getValue(),
								majorUserCodePwd: Ext.getCmp("txtmajorUserCodePwd").getValue(),
								proInfo : proInfo
							},
							success : function(response, options) {
								returnValue=1;
								myMask.hide();
								win.close();
								if(methodName == "addmethod"){
									saveMsg();
								}else if(methodName == "delmethod"){
									saveDel(accountcode);
								}
							},
							failure : function(response, options) {
								failAjax(response, myMask);
								win.close();
								refreshData();
								returnValue=0;
							}
						});
				return returnValue;
			}
			function onBlurS1()
			{
				var myMask = new Ext.LoadMask(Ext.getBody(), {
					msg : '后台正在处理中，请稍后....',
					removeMask : true
				});
				myMask.show();
				Ext.getCmp('txtmajorUserCodePwd').hidden=true;
				Ext.Ajax.request({
					url : "/realware/checkUserByPasswordOrFinger.do",
					method : 'POST',
					timeout : 180000, // 设置为3分钟
					params : {
						majorUserCode: Ext.getCmp('majorUserCode').getValue(),
						onlyCharge : 1,// 强制主管授权
						confirmUser:1// 1是，0否
					},
					success : function(response, options) {		
						myMask.hide();
						userRole=response.responseText;
						if(userRole.indexOf("0")>-1)
						{
							Ext.getCmp('txtmajorUserCodePwd').disable(true);
							if(userRole!=null&&userRole.indexOf("0")>-1)
							{
								proInfo = fpDevObj.GetFeature(3);
						    	if(proInfo.length<=10)
						    	{
						    		returnValue=0;
						    		Ext.Msg.alert("系统提示", "获取指纹信息失败");
						    		return;
						    	}
							}		
						}
						else
						{
							Ext.getCmp('txtmajorUserCodePwd').enable(false);
						}
						returnValue=1;
					},
					failure : function(response, options) {
						failAjax(response, myMask);
						// win.close();
						// refreshData();
						// Ext.Msg.alert("系统提示",response.responseText);
						returnValue=0;
					}
				});
			}
	return returnValue;
}
function saveMsg(){

	// 客户号
	var agencycode = Ext.getCmp("zeroagencyCode").getValue();
	// 单位零余额账号
	var accountcode = Ext.getCmp("zeroaccountcode").getValue();
	// 用户名
	var username = Ext.getCmp("customName1").getValue();
	// 所属机构blongOrg
	var blongOrg = Ext.getCmp("blongOrg1").getValue();
	// 客户本地状态customStatus
	var customStatus = 1;
	// 营业执照号码
	var liNo = Ext.getCmp("liNo1").getValue();
	// 企业机构代码accounttypecode
	var accountTypeCode = Ext.getCmp("accounttypecode").getValue();
	// 法人名称loadName
	var loadName = Ext.getCmp("loadName1").getValue();
	// 法人证件类型loadIdType
	var loadIdType = Ext.getCmp("loadIdType").getValue();
	// 法人证件号码loadIdNo
	var loadIdNo = Ext.getCmp("loadIdNo").getValue();									
	// 签约人姓名
	var signName = Ext.getCmp("signName1").getValue();
	// 签约人电话
	var signPhone = Ext.getCmp("signPhone1").getValue();
	// 联系人contact
	var contact = Ext.getCmp("contact1").getValue();
	// 电话号码
	var phoneno = Ext.getCmp("telephoneNo").getValue();
	// 地址
	var address = Ext.getCmp("address").getValue();
	// 邮箱
// var email = Ext.getCmp("email").getValue();
	// 经办人证件类型
	var signCardType = Ext.getCmp("signCardType").getValue();
	// 经办人证件号码
	var signCardNo = Ext.getCmp("signCardNo").getValue();
	// 非空校验
	if(accountcode == null || accountcode == ""){
		Ext.Msg.alert("系统提示", "签约账号不能为空！");
		return;
	}else if(agencycode == null || agencycode == ""){
		Ext.Msg.alert("系统提示", "客户号不能为空，请先查询签约账号信息！");
		return;
	}else if(signName == null || signName == ""){
		Ext.Msg.alert("系统提示", "经办人姓名不能为空！");
		return;
	}else if(signPhone == null || signPhone == ""){
		Ext.Msg.alert("系统提示", "经办人电话不能为空！");
		return;
	}else if(signCardType == null || signCardType == ""){
		Ext.Msg.alert("系统提示", "经办人证件类型不能为空！");
		return;
	}else if(signCardNo == null || signCardNo == ""){
		Ext.Msg.alert("系统提示", "经办人证件号码不能为空！");
		return;
	}

	var myMask = new Ext.LoadMask(
			Ext.getBody(), {

				msg : '后台正在处理中，请稍后....',
				removeMask : true
			});
	myMask.show();
	Ext.Ajax.request({
		url : '/realware/addzeronopro.do',
		waitMsg : '后台正在处理中,请稍后....',
		timeout : 180000, // 设置为3分钟
		async : false,// 添加该属性即可同步,
		// jsonData : data,
		params : {
			agency_code : agencycode,
			account_code : accountcode,
			user_name : username,
			blongOrg : blongOrg,
			customStatus : customStatus,
			liNo : liNo,
			accountTypeCode : accountTypeCode,
			loadName : loadName,
			loadIdType : loadIdType,
			loadIdNo : loadIdNo,
			signName : signName,
			signPhone : signPhone,
			signCardType : signCardType,
			signCardNo : signCardNo,
			contact : contact,
			phone_no : phoneno,
			address : address
// e_mail : email
		},

		// 提交成功的回调函数
		success : function(response, options) {
			succAjax(response, myMask, true);
			Ext.getCmp("accountForm").getForm().reset();
			Ext.getCmp("customerForm").getForm().reset();
            Ext.getCmp("transactorForm").getForm().reset();
			Ext.getCmp("addWindow").close();

		},
		// 提交失败的回调函数
		failure : function(response, options) {
			failAjax(response, myMask);
			/*Ext.getCmp("accountForm").getForm().reset();
			Ext.getCmp("customerForm").getForm().reset();
            Ext.getCmp("transactorForm").getForm().reset();*/
			refreshData();
		}
	});

}


function queryAccountInfo1(accountcode,update){
	if(accountcode == null || accountcode == ""){
		Ext.Msg.alert("系统提示", "查询数据为空！");
		return;
	}
	var myMask = new Ext.LoadMask(Ext.getBody(), {
		msg : '后台正在处理中，请稍后....',
		removeMask : true
	});
// myMask.show();
	Ext.Ajax.request({
		url : '/realware/queryAccountInfo.do',
		method : 'POST',
		timeout : 180000, // 设置为3分钟
// contentType : "application/json",
		params : {
// "ukey_code" : records[0].get('ukey_code')
			account_code : accountcode
		 },
		// 提交成功的回调函数
		success : function(response, options) {
			 var dto = Ext.decode(response.responseText);
		// var dto = new Function("return " + response.responseText)();
			  Ext.getCmp("agencyName2").setValue(dto.account_name);
			  Ext.getCmp("bankName2").setValue(dto.bank_code);
			  myMask.hide();
// addBuffetCounter();
// succAjax(response, myMask, true);
		},
		// 提交失败的回调函数
		failure : function(response, options) {
			failAjax(response, myMask);
			refreshData();
		}
	});
	
}
function updateMsg(){

	// 客户号
	var agencycode2 = Ext.getCmp("zeroagencyCode2").getValue();
	// 单位零余额账号
	var accountcode2 = Ext.getCmp("zeroaccountcode2").getValue();
	// 用户名
	var username2 = Ext.getCmp("customName2").getValue();
	// 所属机构blongOrg
	var blongOrg2 = Ext.getCmp("blongOrg2").getValue();
	// 客户本地状态customStatus
	var customStatus = 1;
	// 营业执照号码
	var liNo2 = Ext.getCmp("liNo2").getValue();
	// 企业机构代码accounttypecode
	var accountTypeCode2 = Ext.getCmp("accounttypecode2").getValue();
	// 法人名称loadName
	var loadName2 = Ext.getCmp("loadName2").getValue();
	// 法人证件类型loadIdType
	var loadIdType2 = Ext.getCmp("loadIdType2").getValue();
	// 法人证件号码loadIdNo
	var loadIdNo2 = Ext.getCmp("loadIdNo2").getValue();									
	// 签约人姓名
	var signName2 = Ext.getCmp("signName2").getValue();
	// 签约人电话
	var signPhone2 = Ext.getCmp("signPhone2").getValue();
	// 联系人contact
	var contact2 = Ext.getCmp("contact2").getValue();
	// 电话号码
	var phoneno2 = Ext.getCmp("telephoneNo2").getValue();
	// 地址
	var address2 = Ext.getCmp("address2").getValue();
	// 邮箱
// var email = Ext.getCmp("email").getValue();
	// 经办人证件类型
	var signCardType2 = Ext.getCmp("signCardType2").getValue();
	// 经办人证件号码
	var signCardNo2 = Ext.getCmp("signCardNo2").getValue();
	// 非空校验
	if(accountcode2 == null || accountcode2 == ""){
		Ext.Msg.alert("系统提示", "签约账号不能为空！");
		return;
	}else if(agencycode2 == null || agencycode2 == ""){
		Ext.Msg.alert("系统提示", "客户号不能为空，请先查询签约账号信息！");
		return;
	}else if(signName2 == null || signName2 == ""){
		Ext.Msg.alert("系统提示", "经办人姓名不能为空！");
		return;
	}else if(signPhone2 == null || signPhone2 == ""){
		Ext.Msg.alert("系统提示", "经办人电话不能为空！");
		return;
	}else if(signCardType2 == null || signCardType2 == ""){
		Ext.Msg.alert("系统提示", "经办人证件类型不能为空！");
		return;
	}else if(signCardNo2 == null || signCardNo2 == ""){
		Ext.Msg.alert("系统提示", "经办人证件号码不能为空！");
		return;
	}

	var myMask = new Ext.LoadMask(
			Ext.getBody(), {

				msg : '后台正在处理中，请稍后....',
				removeMask : true
			});
	myMask.show();
	Ext.Ajax.request({
		url : '/realware/updateZeroAccountSign.do',
		waitMsg : '后台正在处理中,请稍后....',
		timeout : 180000, // 设置为3分钟
		async : false,// 添加该属性即可同步,
		// jsonData : data,
		params : {
			sign_id : Ext.getCmp("sign_id").getValue(),
			agency_code : agencycode2,
			account_code : accountcode2,
			user_name : username2,
			blongOrg : blongOrg2,
// customStatus : customStatus2,
			liNo : liNo2,
			accountTypeCode : accountTypeCode2,
			loadName : loadName2,
			loadIdType : loadIdType2,
			loadIdNo : loadIdNo2,
			signName : signName2,
			signPhone : signPhone2,
			signCardType : signCardType2,
			signCardNo : signCardNo2,
			contact : contact2,
			phone_no : phoneno2,
			address : address2
// e_mail : email
		},

		// 提交成功的回调函数
		success : function(response, options) {
			succAjax(response, myMask, true);
			Ext.getCmp("updateAccountForm").getForm().reset();
			Ext.getCmp("updateCustomerForm").getForm().reset();
		    Ext.getCmp("updateTransactorForm").getForm().reset();
			Ext.getCmp("editWindow").close();

		},
		// 提交失败的回调函数
		failure : function(response, options) {
			failAjax(response, myMask);
//			Ext.getCmp("updateAccountForm").getForm().reset();
//			Ext.getCmp("updateCustomerForm").getForm().reset();
//		    Ext.getCmp("updateTransactorForm").getForm().reset();
			refreshData();
		}
	});

}

//add by tian yanqing 检测给定字段值（包含中文长度）是否超出最大长度
function checkName(obj,len){
	var value = obj.value;
	var zw=value.match(/[^x00-xff]/g);
	if(""==value){
		return ;
	}
	var zwlen = zw==null?0:zw.length;
	var valLen = value.length+zwlen;
	if(valLen>len){
		obj.regex=/^([.]){0,len}$/;
		obj.regexText="输入的内容超过最大长度，最大长度为："+len+"，注：汉字长度为2";
	}else{
		obj.regex=/^([\u4e00-\u9fa5\.]){0,30}$/;
		obj.regexText="只能输入中文，点，长度最大为"+len+".";
	}
}

function saveDel(customno){
	var myMask = new Ext.LoadMask(Ext.getBody(), {
		msg : '后台正在处理中，请稍后....',
		removeMask : true
	});
	 myMask.show(); 
	 var jsonArray = [];
		Ext.Ajax.request({
			url : '/realware/updateSignUser.do',
			method : 'POST',
			timeout : 180000, // 设置为3分钟
			 contentType : "application/json",
			 params : {
				 customno : customno
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