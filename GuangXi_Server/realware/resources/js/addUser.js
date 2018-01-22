/*
 * 添加用户户
*/

Ext.require(['*']);

/**
 * 选择网点
 */
var bankid=null;
var loadBankCode ;
var loadBankName ;
var loadBankLevel ;

function addUserDialog(netState,networkPanel){
	if('002'==netState){
		var e_recordsr = networkPanel.getSelectionModel().getSelection();
		if (e_recordsr.length == 1) {
			loadBankCode=e_recordsr[0].raw.code;
			loadBankName=e_recordsr[0].raw.text;
			loadBankLevel=e_recordsr[0].raw.level;
			bankid = e_recordsr[0].get("id");
		}		
	}
	var addUserDialog = new Ext.FormPanel({
		id:'AddUserForm',	    
	    frame:true,
	   	//bodyStyle  : 'background:#FFF',
	   	bodyStyle: "background:#DFE9F6",
	    width: 350,
			items : [ {
				xtype:'fieldset',
            	title: '用户信息',
            	collapsible: true,
            	autoHeight:true,
				items:[
						{
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
							id : 'identityNo',
							fieldLabel : '身份证号',
							xtype:'textfield',
							msgTarget: 'side',
							maxLength:18,
							enforceMaxLength:true,
							regex : /^(\d{15}$|^\d{18}$|^\d{17}(\d|X|x))$/,
							regexText: "身份证编号格式错误"
            				
						},{
							id : 'UserNo',
							fieldLabel : '员工编号',
							xtype:'textfield',
							maxLength:40,
							enforceMaxLength:true,
							allowBlank: false
						},{
							id : 'UserName',
							fieldLabel : '员工姓名',
							xtype:'textfield',
							maxLength:40,
							enforceMaxLength:true,
							msgTarget: 'side',
							allowBlank: false
						},{
							id :'userType',
							xtype : 'combo',
							fieldLabel : '员工级别',
							dataIndex : 'fundTypeCode',
							displayField: 'name',
							emptyText: '请选择',
							valueField: 'value',
							editable :false,
							queryMode : 'local',
							store: userTypeStore,
							value:'2'
						},{
							id:'addUserAuthorise',
							name : 'authorise',
							fieldLabel : '是否可授权',
							xtype : 'checkbox',
							anchor: '100%',
							labelWidth: 100
						},{
							id : 'cellphone',
							fieldLabel : '手机号码',
							xtype:'textfield',
							msgTarget: 'side',
							regex : /^1\d{10}$/,
							regexText: "手机号格式错误"
						},{
							id : 'tellphone',
							fieldLabel : '电话号码',
							msgTarget: 'side',
							regex : /^0\d{2,3}-?\d{7,8}$/,
							xtype:'textfield',
							regexText: "电话号码格式错误"
						},{
							id : 'remark1',
							fieldLabel : '备注',
							xtype:'textfield'
						}
					]
			}],
			buttons : [{
					text : '确定',
					formBind: true,
					handler : function() {
						addUser(this.up('window'),netState,networkPanel);
						Ext.getCmp("AddUserForm").getForm().reset();
						this.up('window').close();							
					}
				}, {
					text : '取消',
					handler : function() {
						this.up('window').close();
					}
				}]
		});
	
	var dialog=Ext.widget('window', {
		title : '添加用户',
		width : 350,
		height : 340,
		layout : 'fit',
		resizable : false,
		modal : true,
		items : [ addUserDialog ]
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
//					width : 376,
					height: 205,
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


//根据网点信息加载网点
function loadNetWorkByNetMsg(id,netMsg){
	var jsonMap = "[{";
	var codeOrName = Ext.getCmp(netMsg).getValue();
	if (!Ext.isEmpty(codeOrName)) {
		var jsonStr = [];
		jsonStr[0] = "=";
		jsonStr[1] = codeOrName;
		jsonMap = jsonMap + "\"codeOrName\":" + Ext.encode(jsonStr) + ",";
	}

	data = jsonMap + "}]";

	Ext.getCmp(id).getStore().load({
				method : 'post',
				params : {
					start : 0,
					pageSize : 200,
					jsonMap : data
				}
			});
}


function addUser(win,netState,networkPanel) {
	var myMask = new Ext.LoadMask(Ext.getBody(), {
		msg : '后台正在处理中，请稍后....',
		removeMask : true
			// 完成后移除
		});
	myMask.show();
	// 提交到服务器操作
	Ext.Ajax.request({
				url : '/realware/addUser.do',
				method : 'POST',
				timeout : 180000, // 设置为3分钟
				params : {
					identityNo: Ext.getCmp('identityNo').getValue(),
					UserNo : Ext.getCmp('UserNo').getValue(),
					UserName : Ext.getCmp('UserName').getValue(),
					bankid : bankid,
					bankName:loadBankName,
					bankCode:loadBankCode,
					bankLevel:loadBankLevel,
					cellphone : Ext.getCmp('cellphone').getValue(),
					tellphone : Ext.getCmp('tellphone').getValue(),
					userType :Ext.getCmp('userType').getValue(),
					authorise:Ext.getCmp('addUserAuthorise').checked==true? 1: 0,
					remark : Ext.getCmp('remark1').getValue()
				},
				// 提交成功的回调函数
				success : function(response, options) {
					succAjax(response, myMask);
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
				},
				// 提交失败的回调函数
				failure : function(response, options) {
					failAjax(response, myMask);
				}
			});
}


