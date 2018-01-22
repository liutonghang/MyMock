/** 
* 自助柜面- 零余额账户签约
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
var fileds = [ "customno", "accountcode", "customname","belongorg", "isvalide","lino",
		"orgcode","loadername", "idtype","idno","signtel", "signname","signcardtype","signcardno", "contact",
		"telephoneno", "email","address","createdate","editdate","deldate" ];

/**
 * 列名
 */
var header = "客户号|customno,签约账号|accountcode|150,客户名称|customname,所属机构|belongorg,客户状态|isvalide,营业执照号码|lino," +
		"企业组织机构代码|orgcode,法人|loadername, 法人证件类型|idtype,法人证件号码|idno,经办人姓名|signname,经办人电话|signtel,经办人证件类型|signcardtype,经办人证件号码|signcardno," +
				"联系人|contact,电话|telephoneno,联系地址|address,电子邮箱地址|email,签约时间|createdate,更新时间|editdate,注销时间|deldate";

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
			title : '签约',
			bodyStyle : 'overflow-x:hidden',
			style : {
				'text-align' : 'center'
			},
			closeAction : 'close',
			width : 450,
			height : 400,
			autoScroll:true,
			resizable : false,
			modal : true,
			items : Ext.widget('form', {
				id : 'addForm',
				border : false,
				width : 400,
				height : 520,
				bodyPadding : 10,
				fieldDefaults : {
					labelAlign : 'right',
					labelWidth : 110
				},
				items : [ {
					layout : 'hbox',
					style : 'margin-bottom:3px;',
					bodyStyle : 'border-width: 0px 0px 0px 0px;',
					width : 420,
					items : [ {
						id : 'zeroaccountcode',
						dataIndex : 'account_code',
						fieldLabel : '签约账号',
						labelWidth : 110,
						width : 340,
						xtype : 'textfield',
						afterLabelTextTpl : required,
						regex:/^[0-9a-zA-Z]{0,32}$/,
						regexText: "账号输入格式错误,请输入数字,字母最大长度32."
					}, {
						id : 'queryButton1',
						style : 'margin-left:5px',
						text : '查询',
						xtype : 'button',
						width : 35,
						handler: function() {
						var accountcode = Ext.getCmp("zeroaccountcode").getValue();
						
						if(/^[0-9a-zA-Z]{0,32}$/.test(accountcode)){
							queryUser(accountcode,0);
						}else{
							Ext.Msg.alert("系统提示","签约账号只允许输入字母和数字,最大长度为32");
							return;
						}							
						}
					} ]
				} ,{
					id : 'zeroagencyCode',
					xtype : 'textfield',
					dataIndex : 'agency_code',
					fieldLabel : '客户号',
					width : 340,
					disabled : true
				} ,{
					id : 'customName1',
					xtype : 'textfield',
					dataIndex : 'user_name',
					fieldLabel : '客户名称',
					width : 340,
					disabled : true
				} ,{
					id : 'blongOrg1',
					xtype : 'textfield',
					dataIndex : 'blong_org',
					fieldLabel : '所属机构',
					width : 340,
					disabled : true
				} ,{
					id : 'liNo1',
					xtype : 'textfield',
					dataIndex : 'li_no',
					fieldLabel : '营业执照号码',
					width : 340,
					disabled : true
				} ,{
					id : 'accounttypecode',
					xtype : 'textfield',
					dataIndex : 'account_type_code',
					fieldLabel : '企业组织机构代码',
					width : 340,
					disabled : true
				} ,{
					id : 'loadName1',
					xtype : 'textfield',
					dataIndex : 'loader',
					fieldLabel : '法人代表名称',
					width : 340,
					disabled : true
				} ,{
					id : 'loadIdType',
					xtype : 'textfield',
					dataIndex : 'id_type',
					fieldLabel : '法人证件类型',
					width : 340,
					disabled : true
/*					listeners :{select : function(combo, record,index){ 
						var val = record[0].get("value");
						var o = Ext.getCmp("loadIdNo");
						if(val==1){
							o.regex = /^(\d{15}$|^\d{18}$|^\d{17}(\d|X|x))$/;
							o.regexText="证件格式错误";
						}else{
							o.regex = /^([\u4e00-\u9fa5a-zA-Z0-9_-])*$/;
							o.regexText="证件格式错误,不能包含特殊字符";
						}
					}}*/
				} ,{
					id : 'loadIdNo',
					xtype : 'textfield',
					dataIndex : 'id_no',
					fieldLabel : '法人证件号码',
					width : 340,
					disabled : true
			/*		regex : /^(\d{15}$|^\d{18}$|^\d{17}(\d|X|x))$/,
					regexText: "证件格式错误"*/
				} ,{
					id : 'signName1',
					xtype : 'textfield',
					dataIndex : 'sign_Name1',
					fieldLabel : '经办人姓名',
					width : 340,
					afterLabelTextTpl : required,
					regex:/^([\u4e00-\u9fa5a-zA-Z0-9_-]){0,30}$/,
					regexText:"只能输入中文，字母，数字，下划线，长度最大为30."
				} ,{
					id : 'signPhone1',
					xtype : 'textfield',
					dataIndex : 'sign_Phone1',
					fieldLabel : '经办人电话',
					width : 340,
					afterLabelTextTpl : required,
					regex : /^1[3,5,7,8]\d{9}$/,
					regexText: "只能录入手机号码，由11位数字组成"

				} ,{
					id : 'signCardType',
					xtype : 'combo',
					emptyText : '请选择',
					fieldLabel : '经办人证件类型',
					width : 340,
					afterLabelTextTpl : required,
					valueField : 'value',
					displayField : 'name',
					editable : false,
					store : cardStore,
					listeners :{select : function(combo, record,index){ 
						var val = record[0].get("value");
						var o = Ext.getCmp("signCardNo");
						if(val==1){
							o.regex = /^(\d{15}$|^\d{18}$|^\d{17}(\d|X|x))$/;
							o.regexText="证件格式错误,长度不能超过18位";
						}else{
							o.regex = /^([\u4e00-\u9fa5a-zA-Z0-9_-]){0,30}$/;
							o.regexText="证件格式错误,不能包含特殊字符,长度不超过30";
						}
					}}
				} ,{
					id : 'signCardNo',
					xtype : 'textfield',
					dataIndex : 'signCardNo',
					fieldLabel : '经办人证件号码',
					width : 340,
					afterLabelTextTpl : required,
					nforceMaxLength:true,
					regex : /^(\d{15}$|^\d{18}$|^\d{17}(\d|X|x))$/,
					regexText: "证件格式错误,长度不能超过18位"
				
				} ,{
					id : 'contact',
					xtype : 'textfield',
					dataIndex : 'contact',
					fieldLabel : '联系人',
					width : 340,
					disabled : true
				} ,{
					id : 'telephoneNo',
					xtype : 'textfield',
					dataIndex : 'telephone_no',
					fieldLabel : '电话',
					width : 340,
					disabled : true
				} ,{
					id : 'email',
					xtype : 'textfield',
					dataIndex : 'e_mail',
					fieldLabel : '邮箱',
					width : 340,
					disabled : true
				} ,{
					id : 'address',
					xtype : 'textfield',
					dataIndex : 'address',
					fieldLabel : '地址',
					width : 340,
					disabled : true
				}],
				buttonAlign : 'center',
				buttons : [{
							text : '添加',
							id : 'addNetworkButton1',
							handler : function() {
								//签约账号
								var zeroaccountcode = Ext.getCmp("zeroaccountcode").getValue();
								//客户号
								var zeroagencyCode = Ext.getCmp("zeroagencyCode").getValue();
								//经办人姓名
								var username = Ext.getCmp("signName1").getValue();
								//经办人电话
								var signPhone1 = Ext.getCmp("signPhone1").getValue();
								//经办人证件类型
								var signCardType = Ext.getCmp("signCardType").getValue();
								//经办人证件号码
								var signCardNo = Ext.getCmp("signCardNo").getValue();
			
								if(zeroaccountcode == "" || zeroaccountcode == null){
									Ext.Msg.alert("系统提示", "签约账号不能为空");
									return;
								}if(zeroagencyCode == "" || zeroagencyCode == null){
									Ext.Msg.alert("系统提示", "请先查询客户信息");
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
								if(!(Ext.getCmp("addForm").isValid())){
									Ext.Msg.alert("系统提示","录入格式有误,请先查证!");
									return;
								}
								//保存
								saveMsg();
//									var methodName = "addmethod";
//									authorize(methodName);
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
	if (!editZeroProWindow) {
		editZeroProWindow = Ext.widget('window', {
			id : "editWindow",
			title : '更新',
			bodyStyle : 'overflow-x:hidden;overflow-y:hidden',
			style : {
				'text-align' : 'center'
			},
			closeAction : 'close',
			width : 420,
			height : 310,
			resizable : false,
			modal : true,
			items : Ext.widget('form', {
				id : 'updateForm',
				border : false,
				width : 420,
				bodyPadding : 10,
				fieldDefaults : {
					labelAlign : 'right',
					labelWidth : 110
				},
				items : [ {
					id : 'zeroaccountcode2',
					fieldLabel : '签约账号',
					width : 340,
					xtype : 'textfield',
//					afterLabelTextTpl : required,
					disabled : true
				} ,{
					id : 'customName2',
					xtype : 'textfield',
					fieldLabel : '客户名称',
					width : 340,
					disabled : true
				} ,{
					id : 'loadName2',
					xtype : 'textfield',
					fieldLabel : '法人代表名称',
					width : 340,
					disabled : true
				} ,{
					id : 'loadIdNo2',
					xtype : 'textfield',
					fieldLabel : '法人证件号码',
					width : 340,
					disabled : true
				} ,{
					id : 'contact2',
					xtype : 'textfield',
					fieldLabel : '联系人',
					width : 340,
					disabled : true
				} ,{
					id : 'address2',
					xtype : 'textfield',
					fieldLabel : '地址',
					width : 340,
					disabled : true
				} ,{
					id : 'telephoneNo2',
					xtype : 'textfield',
					fieldLabel : '电话',
					width : 340,
					disabled : true
				} ,{
					id : 'email2',
					xtype : 'textfield',
					fieldLabel : '邮箱',
					width : 340,
					disabled : true
				}],
				buttonAlign : 'center',
				buttons : [{
							text : '更新',
							id : 'addNetworkButton2',
							handler : function() {
								if (this.up('form').getForm().isValid()) {
									//单位零余额账号
									var accountcode = Ext.getCmp("zeroaccountcode2").getValue();
									//用户名
									var username = Ext.getCmp("customName2").getValue();
									//法人名称loadName
									var loadName = Ext.getCmp("loadName2").getValue();
									//法人证件号码loadIdNo
									var loadIdNo = Ext.getCmp("loadIdNo2").getValue();	
									if(accountcode == ''||accountcode == null){
										Ext.Msg.alert("系统提示", "自助柜面客户信息更新失败！");
										Ext.getCmp('updateForm').getForm()
										.reset();
										Ext.getCmp("editWindow").close();
										return;
									}

									var myMask = new Ext.LoadMask(
											Ext.getBody(), {

												msg : '后台正在处理中，请稍后....',
												removeMask : true
											});
									myMask.show();
									Ext.Ajax.request({
										url : '/realware/updatezeronopro.do',
										waitMsg : '后台正在处理中,请稍后....',
										timeout : 180000, // 设置为3分钟
										async : false,// 添加该属性即可同步,
										// jsonData : data,
										params : {
											account_code : accountcode,
											user_name : username,
											loadName : loadName,
											loadIdNo : loadIdNo
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
	queryUser(accountcode,1)
	editZeroProWindow.show();
}
/**
 * 查询用户信息并回显
 */
function queryUser(accountcode,update){
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
		url : '/realware/queryUserByAccountcode.do',
		method : 'POST',
		timeout : 180000, // 设置为3分钟
//		contentType : "application/json",
		params : {
//			 "ukey_code" : records[0].get('ukey_code')	
			account_code : accountcode
		 },
		// 提交成功的回调函数
		success : function(response, options) {
//			 var dto = Ext.decode(response.responseText);
			 var dto = new Function("return " + response.responseText)();
			 if(update == 1){
				 setValueForUpdate(dto);
			 }else{
				 setValue(dto);
			 }
			 myMask.hide();
//			 addBuffetCounter();
//			succAjax(response, myMask, true);
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
	Ext.getCmp("zeroaccountcode2").setValue(obj.zeroaccountcode);
	Ext.getCmp("customName2").setValue(obj.user_name);
	Ext.getCmp("loadName2").setValue(obj.loader);
	Ext.getCmp("loadIdNo2").setValue(obj.id_no);
	Ext.getCmp("contact2").setValue(obj.contact);
	Ext.getCmp("address2").setValue(obj.address);
	Ext.getCmp("telephoneNo2").setValue(obj.telephone_no);
	Ext.getCmp("email2").setValue(obj.e_mail);
}
/**
 * 回显
 * @param obj
 * @return
 */
function setValue(obj) {
	Ext.getCmp("zeroagencyCode").setValue(obj.agency_code);
	Ext.getCmp("customName1").setValue(obj.user_name);
	Ext.getCmp("blongOrg1").setValue(obj.blong_org);
	Ext.getCmp("liNo1").setValue(obj.li_no);
	Ext.getCmp("accounttypecode").setValue(obj.account_type_code);
	Ext.getCmp("loadName1").setValue(obj.loader);
	Ext.getCmp("loadIdType").setValue(obj.id_type);
	Ext.getCmp("loadIdNo").setValue(obj.id_no);
	Ext.getCmp("contact").setValue(obj.contact);
	Ext.getCmp("telephoneNo").setValue(obj.telephone_no);
	Ext.getCmp("address").setValue(obj.address);
	Ext.getCmp("email").setValue(obj.e_mail);
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
	var myMask = new Ext.LoadMask(Ext.getBody(), {
		msg : '后台正在处理中，请稍后....',
		removeMask : true
	});
	
	Ext.Msg.confirm('系统提示','您确定注销此信息', function(e) {
		if (e == "yes") {
			
			var accountcode = records[0].get('accountcode');
			saveDel(accountcode);
//			var methodName = "delmethod";
//			authorize(methodName,accountcode);
		}
	});
}
/*******************************
 * 授权
 * @return
 */
function authorize(methodName,accountcode){
	var methodName = methodName;
	if (accountcode != null){
		var accountcode = accountcode;
	}
	var returnValue=0;//0表示授权失败，1表示授权成功
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
									anchor : '-5' // anchor width by percentage
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
									anchor : '-5' // anchor width by percentage
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
						onlyCharge : 1,//强制主管授权
						confirmUser:1//1是，0否
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
						//win.close();
						//refreshData();
						//Ext.Msg.alert("系统提示",response.responseText);
						returnValue=0;
					}
				});
			}
	return returnValue;
}
function saveMsg(){

	//客户号
	var agencycode = Ext.getCmp("zeroagencyCode").getValue();
	//单位零余额账号
	var accountcode = Ext.getCmp("zeroaccountcode").getValue();
	//用户名
	var username = Ext.getCmp("customName1").getValue();
	//所属机构blongOrg
	var blongOrg = Ext.getCmp("blongOrg1").getValue();
	//客户本地状态customStatus
	var customStatus = 1;
	//营业执照号码
	var liNo = Ext.getCmp("liNo1").getValue();
	//企业机构代码accounttypecode
	var accountTypeCode = Ext.getCmp("accounttypecode").getValue();
	//法人名称loadName
	var loadName = Ext.getCmp("loadName1").getValue();
	//法人证件类型loadIdType
	var loadIdType = Ext.getCmp("loadIdType").getValue();
	//法人证件号码loadIdNo
	var loadIdNo = Ext.getCmp("loadIdNo").getValue();									
	//签约人姓名
	var signName = Ext.getCmp("signName1").getValue();
	//签约人电话
	var signPhone = Ext.getCmp("signPhone1").getValue();
	//联系人contact
	var contact = Ext.getCmp("contact").getValue();
	//电话号码
	var phoneno = Ext.getCmp("telephoneNo").getValue();
	//地址
	var address = Ext.getCmp("address").getValue();
	//邮箱
	var email = Ext.getCmp("email").getValue();
	//经办人证件类型
	var signCardType = Ext.getCmp("signCardType").getValue();
	//经办人证件号码
	var signCardNo = Ext.getCmp("signCardNo").getValue();
	//非空校验
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
			address : address,
			e_mail : email
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
			url : '/realware/updateAutoSignAccount.do',
			method : 'POST',
			timeout : 180000, // 设置为3分钟
			 contentType : "application/json",
			 params : {
				 accountcode : accountcode,
				 tableName : 'PB_USER_ZERONO_PROPERTY'
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
