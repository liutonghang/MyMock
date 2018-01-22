/*
 * 添加用户户
*/

Ext.require(['*']);

function addUserDialog(){
	var addUserDialog = new Ext.FormPanel({
		id:'AddUserForm',	    
	    frame:true,
	   	bodyStyle  : 'background:#FFF',
	    width: 350,
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
							msgTarget: 'side',
							maxLength:18,
							enforceMaxLength:true,
							regex : /^(\d{15}$|^\d{18}$|^\d{17}(\d|X|x))$/,
							regexText: "身份证编号格式错误"
						},{
							id : 'UserNo',
							fieldLabel : '员工编号',
							xtype:'textfield'
						},{
							id : 'UserName',
							fieldLabel : '员工姓名',
							xtype:'textfield'
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
							xtype:'textfield',
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
						if (Ext.getCmp('UserNo').getValue() == "") {
							Ext.Msg.alert("系统提示", "员工编号不能為空！");
						} else if (Ext.getCmp('UserName').getValue() == "") {
							Ext.Msg.alert("系统提示", "员工姓名不能為空！");
						} else {
							addUser(this.up('window'));
							this.up('window').close();
						///////	Ext.getCmp("AddUserForm").getForm().reset();
						}
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
		height : 300,
		layout : 'fit',
		resizable : false,
		modal : true,
		items : [ addUserDialog ]
	}).show();
}

function addUser(win) {
	var myMask = new Ext.LoadMask(Ext.getBody(), {
		msg : '后台正在处理中，请稍后....',
		removeMask : true
			// 完成后移除
		});
	myMask.show();
	// 提交到服务器操作
	Ext.Ajax.request({
				url : '/realware/addUserOfBank.do',
				method : 'POST',
				timeout : 180000, // 设置为3分钟
				params : {
					UserNo : Ext.getCmp('UserNo').getValue(),
					UserName : Ext.getCmp('UserName').getValue(),
					cellphone : Ext.getCmp('cellphone').getValue(),
					tellphone : Ext.getCmp('tellphone').getValue(),
					remark : Ext.getCmp('remark1').getValue(),
					identityNo : Ext.getCmp('identityNo').getValue(),
					authorise:Ext.getCmp('addUserAuthorise').checked==true? 1: 0,
					userType:Ext.getCmp('userType').getValue()
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


