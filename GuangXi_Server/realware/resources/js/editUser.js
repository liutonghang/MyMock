/*
 * 修改用户户
*/

Ext.require(['*']);

Ext.apply(Ext.form.VTypes, {
      repetition: function(val, field) {     //返回true，则验证通过，否则验证失败
          if (field.repetition) {               //如果表单有使用repetition配置，repetition配置是一个JSON对象，该对象提供了一个名为targetCmpId的字段，该字段指定了需要进行比较的另一个组件ID。
              var cmp = Ext.getCmp(field.repetition.targetCmpId);   //通过targetCmpId的字段查找组件
              if (Ext.isEmpty(cmp)) {      //如果组件（表单）不存在，提示错误
                  Ext.MessageBox.show({
                      title: '错误',
                      msg: '发生异常错误，指定的组件未找到',
                      icon: Ext.Msg.ERROR,
                     buttons: Ext.Msg.OK
                 });
                 return false;
             }
             if (val == cmp.getValue()) {  //取得目标组件（表单）的值，与宿主表单的值进行比较。
                 return true;
             } else {
                 return false;
             }
         }
     },
     repetitionText: '输入的两次密码不一致！'
 });
 


Ext.override(Ext.tip.QuickTip, {
        helperElId: 'ext-quicktips-tip-helper',
        initComponent: function ()
        {
            var me = this;

            me.target = me.target || Ext.getDoc();
            me.targets = me.targets || {};
            me.callParent();

            // new stuff
            me.on('move', function ()
            {
                var offset = me.hasCls('x-tip-form-invalid') ? 35 : 12,
                    helperEl = Ext.fly(me.helperElId) || Ext.fly(
                        Ext.DomHelper.createDom({
                            tag: 'div',
                            id: me.helperElId,
                            style: {
                                position: 'absolute',
                                left: '-1000px',
                                top: '-1000px',
                                'font-size': '12px',
                                'font-family': 'tahoma, arial, verdana, sans-serif'
                            }
                        }, Ext.getBody())
                    );

                if (me.html && (me.html !== helperEl.getHTML() || me.getWidth() !== (helperEl.dom.clientWidth + offset)))
                {
                    helperEl.update(me.html);
                    me.setWidth(Ext.Number.constrain(helperEl.dom.clientWidth + offset, me.minWidth, me.maxWidth));
                }
            }, this);
        }
    });
    
var bankcode=null;
var bankname=null;
var bankLevel;
var bankId;
var userid=null;
function editUserDialog(netState,gridPanel){

	// 当前选中的数据
	var e_recordsr = gridPanel.getSelectionModel().getSelection();
	if (e_recordsr.length != 1) {
		Ext.Msg.alert("系统提示", "请选择一条数据！");
		return;
	}
	if(e_recordsr[0].get("enabled")==0){
		Ext.Msg.alert("系统提示", "该用户已注销！");
		return;
	}
	var tempUserType=e_recordsr[0].get("user_type");
	for (var i=0;i<userTypeStore.data.items.length;i++){
		var itemName = userTypeStore.data.items[i].raw.value;
		if(e_recordsr[0].get("user_type")==itemName){
			tempUserType = userTypeStore.data.items[i].raw.value;
			break;
		}
	}
	var authoriseMsg =e_recordsr[0].get("authorise");
	var authoriseChecked = false;
	if(authoriseMsg.indexOf('checked=\'true\'')>-1){
		authoriseChecked = true;
	}
	bankcode=e_recordsr[0].get("bank_code");
	bankname=e_recordsr[0].get("bank_name");
	bankId = e_recordsr[0].get("bank_id");
	bankLevel = e_recordsr[0].get("bank_level");
	userid=e_recordsr[0].get("user_id");
	
	var editUserDialog = new Ext.FormPanel({
		id:'editUserForm',	    
	    frame:true,
	   	bodyStyle  : 'background:#FFF',
	    width: 400,
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
							width:400,
							layout: 'hbox', 
							defaults : {
								margins : '3 5 0 0'
							},
							items:[{
										id : 'user_edit_bank_code',
										xtype : 'textfield',
										fieldLabel : '所属网点',
										readOnly: 'true',
										labelWidth : 60,
										width:300,
										value : bankcode+bankname
									},
									{
										id : 'btn_bank_code',
										xtype : 'button',
										text : '查询',
										handler : function() {
											choseBank();						
										}											
									}]	
						},
						{
							id : 'UserNo',
							fieldLabel : '员工编号',
							xtype:'textfield',
							labelWidth : 60,
							width:300,
							value : e_recordsr[0].get("user_code")
						},{
							id : 'IdentityNo',
							fieldLabel : '身份证号',
							xtype:'textfield',
							labelWidth : 60,
							width:300,
							value : e_recordsr[0].get("identity_no"),
							msgTarget: 'side',
							maxLength:18,
							enforceMaxLength:true,
							regex : /^(\d{15}$|^\d{18}$|^\d{17}(\d|X|x))$/,
							regexText: "身份证编号格式错误"
						},{
							id : 'UserName',
							fieldLabel : '员工姓名',
							xtype:'textfield',
							labelWidth : 60,
							width:300,
							value : e_recordsr[0].get("user_name")
						},{
							id :'userType',
							xtype : 'combo',
							fieldLabel : '员工级别',
							dataIndex : 'fundTypeCode',
							displayField: 'name',
							emptyText: '请选择	',
							valueField: 'value',
							editable :false,
							queryMode : 'local',
							store: userTypeStore,
							labelWidth : 60,
							value:tempUserType
						},{
							id:'addUserAuthorise',
							name : 'authorise',
							fieldLabel : '是否可授权',
							xtype : 'checkbox',
							checked:authoriseChecked,
							anchor: '100%',
							labelWidth: 65
						},{
							id : 'cellphone',
							fieldLabel : '手机号码',
							xtype:'textfield',
							labelWidth : 60,
							width:300,
							value : e_recordsr[0].get("cellphone_number"),
							msgTarget: 'side',
							regex : /^1\d{10}$/,
							regexText: "手机号格式错误"
						},{
							id : 'tellphone',
							fieldLabel : '电话号码',
							xtype:'textfield',
							labelWidth : 60,
							width:300,
							value : e_recordsr[0].get("telephone_number"),
							msgTarget: 'side',
							regex : /^0\d{2,3}-?\d{7,8}$/,
							xtype:'textfield',
							regexText: "电话号码格式错误"
						},{
							id : 'remark2',
							fieldLabel : '备注',
							xtype:'textfield',
							labelWidth : 60,
							width:300,
							value : e_recordsr[0].get("remark")
						}
					]
			}
						
					],
			buttons: [
						{
	                  	  text: '确定',
	                      handler: function() {
						  	if(Ext.getCmp('UserNo').getValue()==""){
								Ext.Msg.alert("系统提示", "员工编号不能为空！");
							}else if(Ext.getCmp('UserName').getValue()==""){
								Ext.Msg.alert("系统提示", "员工姓名不能为空！");
							}else if(Ext.getCmp('user_edit_bank_code').getValue()==""){
								Ext.Msg.alert("系统提示", "所属网点不能为空！");
							}else{								
								editUser(this.up('window'),netState,gridPanel);
								Ext.getCmp("editUserForm").getForm().reset();
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
		title : '修改用户',
		width : 400,
		height : 350,
		layout : 'fit',
		resizable : false,
		modal : true,
		items : [ editUserDialog ]
	}).show();
}
/**
 * 选择网点
 */
function choseBank(){
	
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
							bankId= record.raw.id;
							bankcode =  record.raw.code;
							bankname =  record.raw.text;
							bankLevel = record.raw.level; 
							var codeandname=loadBankCode+" "+loadBankName;
							Ext.getCmp('user_edit_bank_code').setValue(codeandname);
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
						bankId= records[0].raw.id;
						bankcode = records[0].raw.code;
						bankname = records[0].raw.text;
						bankLevel = records[0].raw.level; 
						var codeandname=records[0].raw.code+" "+records[0].raw.text;
						Ext.getCmp('user_edit_bank_code').setValue(codeandname);
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

//
function editUser(win, netState, networkPanel) {
	var myMask = new Ext.LoadMask(Ext.getBody(), {
		msg : '后台正在处理中，请稍后....',
		removeMask : true
			// 完成后移除
		});
	myMask.show();
	// 提交到服务器操作
	Ext.Ajax.request({
				url : '/realware/editUser.do',
				method : 'POST',
				timeout : 180000, // 设置为3分钟
				params : {
					UserNo : Ext.getCmp('UserNo').getValue(),
					IdentityNo : Ext.getCmp('IdentityNo').getValue(), 
					UserName : Ext.getCmp('UserName').getValue(),
					id : userid,
					bankid:bankId,
					bankLevel:bankLevel,
					bankcode : bankcode,
					bankname : bankname,
					cellphone : Ext.getCmp('cellphone').getValue(),
					tellphone : Ext.getCmp('tellphone').getValue(),
					remark : Ext.getCmp('remark2').getValue(),
					userType:Ext.getCmp('userType').getValue(),
					authorise:Ext.getCmp('addUserAuthorise').checked==true? 1: 0
				},
				// 提交成功的回调函数
				success : function(response, options) {
					succAjax(response, myMask);
					if ('001' == netState) {
						refreshData();
					} else {
						var records = networkPanel.getSelectionModel()
								.getSelection();
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


function editUserPassword(gridPanel){

	// 当前选中的数据
	var e_recordsr = gridPanel.getSelectionModel().getSelection();
	if (e_recordsr.length != 1) {
		Ext.Msg.alert("系统提示", "请选择一条数据！");
		return;
	}
	if(e_recordsr[0].get("enabled")==0){
		Ext.Msg.alert("系统提示", "该用户已注销！");
		return;
	}
	var userName = e_recordsr[0].get("user_name");
	var userid = e_recordsr[0].get("user_id");
	var userCode = e_recordsr[0].get("user_code")
	var pwdWindow  = Ext.getCmp('pwdWindow');
	
	
//	if( pwdWindow != null ){
//		//清空表单
//		pwdWindow.down('form').getForm().reset();
//		pwdWindow.show();
//		return;
//	}
	
	var pwdWindow = Ext.create('Ext.window.Window', {
					id:'pwdWindow',
					title : '密码重置',
					width : 250,
					height : 178,
					layout : 'fit',
					resizable : false,
					closeAction : 'destroy',
					modal : true,
					items : [
						Ext.create('Ext.form.Panel', {
					    bodyPadding: 5,
					    url: '/realware/resetPassword.do',
					    layout: 'anchor',
					    defaults: {
					        anchor: '100%'
					    },
					
					    // The fields
					    defaultType: 'textfield',
					    items: [{
					    	xtype: 'hiddenfield',
					    	id:'editpwd_userid',
					        name: 'userid',
					        value: userid
					    },{
					    	id:'editpwd_usercode',
					        fieldLabel: '工号',
					        name: 'oldpassword',
					        labelWidth:80,
					        allowBlank: false,
					        value: userCode
					    },{
					    	id:'editpwd_name',
					        fieldLabel: '姓名',
					        name: 'name',
					        labelWidth:80,
					        allowBlank: false,
					        readOnly:true,
					        value: userName
					    },
					    	{
					    	id:'editPwd_newpassword',
					        fieldLabel: '新密码',
					        name: 'newpassword',
					        labelWidth:80,
					        allowBlank: false,
					        inputType:'password'
					    },{
					    	id:'editPwd_confirmpassword',
					        fieldLabel: '确认新密码',
					        name: 'confirmpassword',
					        labelWidth:80,
					        allowBlank: false,
					        inputType:'password',
					      	vtype: 'repetition',  //指定repetition验证类型
	                        repetition: { targetCmpId: 'editPwd_newpassword' }  //配置repetition验证，提供目标组件（表单）ID
					    }],
					
					    // Reset and Submit buttons
					    buttons: [{
					        text: '确定',
					        formBind: true, //only enabled once the form is valid
					        disabled: true,
					        handler: function() {
					        	
					            var form = this.up('form').getForm();
			            		form.submit({
								method : 'POST',
								timeout : 6000, // 设置为秒
								waitTitle : '提示',
								waitMsg : '正在修改密码，...',
								success : function(form, action) {
									succForm(form, action);
									Ext.getCmp("pwdWindow").close();
								},
								failure : function(form, action) {
									//适应failForm的处理，由异常处理不规范引起   lfj 2015-10-14
									var result = {result : {mess : action.response.responseText}};
									failForm(form, result);
								}
							});
											
					        }
					    },{
					        text: '取消',
					        handler: function() {
					           Ext.getCmp("pwdWindow").close();
					        }
					    }]
					})
					]
				});
	
	pwdWindow.show();
}

