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
var userid=null;
function editUserDialog(gridPanel){

	// 当前选中的数据
	var e_recordsr = gridPanel.getSelectionModel().getSelection();
	if (e_recordsr.length != 1) {
		Ext.Msg.alert("系统提示", "请选择一条数据！");
		return;
	}
	var tempUserType;
	for (var i=0;i<userTypeStore.data.items.length;i++){
		var itemName = userTypeStore.data.items[i].raw.name;
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
							id : 'identityNo',
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
							id : 'UserNo',
							fieldLabel : '员工编号',
							xtype:'textfield',
							labelWidth : 60,
							width:300,
							value : e_recordsr[0].get("user_code")
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
							emptyText: '请选择',
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
	                  	  formBind: true,
	                      handler: function() {
						  	if(Ext.getCmp('UserNo').getValue()==""){
								Ext.Msg.alert("系统提示", "员工编号不能为空！");
							}else if(Ext.getCmp('UserName').getValue()==""){
								Ext.Msg.alert("系统提示", "员工姓名不能为空！");
							}else{								
								editUser(this.up('window'));
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
		height : 320,
		layout : 'fit',
		resizable : false,
		modal : true,
		items : [ editUserDialog ]
	}).show();
}

//
function editUser(win) {
	var myMask = new Ext.LoadMask(Ext.getBody(), {
		msg : '后台正在处理中，请稍后....',
		removeMask : true
			// 完成后移除
		});
	myMask.show();
	// 提交到服务器操作
	Ext.Ajax.request({
				url : '/realware/editUserOfBank.do',
				method : 'POST',
				timeout : 180000, // 设置为3分钟
				params : {
					UserNo : Ext.getCmp('UserNo').getValue(),
					UserName : Ext.getCmp('UserName').getValue(),
					id : userid,
					bankcode : bankcode,
					bankname : bankname,
					cellphone : Ext.getCmp('cellphone').getValue(),
					tellphone : Ext.getCmp('tellphone').getValue(),
					remark : Ext.getCmp('remark2').getValue(),
					identityNo : Ext.getCmp('identityNo').getValue(),
					userType:Ext.getCmp('userType').getValue(),
					authorise:Ext.getCmp('addUserAuthorise').checked==true? 1: 0
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


function editUserPassword(gridPanel){

	// 当前选中的数据
	var e_recordsr = gridPanel.getSelectionModel().getSelection();
	if (e_recordsr.length != 1) {
		Ext.Msg.alert("系统提示", "请选择一条数据！");
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
									failForm(form, action);
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

