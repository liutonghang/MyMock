/*
 * **************************财政零余额*************************************************
 * 修改账户
 */
function editAdmdivZeroAccountDialog(gridPanel) {
	// 当前选中的数据
	var e_recordsr = gridPanel.getSelectionModel().getSelection();
	if (e_recordsr.length != 1) {
		Ext.Msg.alert("系统提示", "请选择一条数据！");
		return;
	}
	accountId =  e_recordsr[0].get("account_id");

	//设置bankId为原来的值
	bankid = e_recordsr[0].get("bank_id");
	var mis_valid_b = false;
	if ("有效" == e_recordsr[0].get("is_valid")) {
		mis_valid_b = true;
	}

	var editBankAccountDialog = new Ext.FormPanel({
		id : 'EadmdivZeroForm',
		frame:true,
	    bodyStyle:'padding:5px 5px 0 5px',
		defaultType: 'textfield',
		items : [{
				xtype: 'panel',
				border: 0,
				width: 350,
				layout: 'hbox',
				bodyStyle: "background:#DFE9F6;padding:0px 0px 5px 0px",
				items: [{
			        id: 'bank_code_form',
					name: 'bank_code',
					xtype: 'textfield',
					fieldLabel: '所属网点',
					readOnly: 'true',
					msgTarget: 'side',
					allowBlank: false,
					value: e_recordsr[0].get('bank_name')
				}]
				}
				,		
		         {
					fieldLabel : '账户名称',
					name : 'account_name',
					vtype:"accountName",
					allowBlank : false
				}
		         ,{
					fieldLabel : '账号',
					name : 'account_no',
					disabled : false,
					vtype:"accountId",
					allowBlank : false
				}
				,		
		         {
					fieldLabel : '财务人员名称',
					name : 'finance_name',
					vtype:"accountName",
					allowBlank : true
				}
		         ,{
					fieldLabel : '财务人员电话号码',
					name : 'finance_phone',
					vtype:"commonPhone",
					allowBlank : true
				}
				, {
					xtype : 'combo',
					fieldLabel : '所属财政',
					name : 'admdiv_code',
					displayField : 'admdiv_name',
					emptyText : '请选择',
					valueField : 'admdiv_code',
					allowBlank : false,
					editable : false,
					store : comboAdmdiv
				},
				{
					xtype : 'checkbox',
					fieldLabel : '是否有效',
					name : 'is_valid1',
					checked : true,
					hidden : true,
					getValue: function() {
						var v = 0;
			            if (this.checked) {
			                v = 1;
			              }
			            return v;
			        }
				}
				],
		buttons : [
		   {
			text : '确定',
			handler : function() {
				if(this.up("form").getForm().isValid()){
					editAdmdivZeroAccount(this.up('window'));
					Ext.getCmp('EadmdivZeroForm').getForm().reset();
					this.up('window').close();

				}
			}
		}, 
		{
			text : '取消',
			handler : function() {
				this.up('form').getForm().reset();
				this.up('window').close();
			}
		}
		]
	});
	editBankAccountDialog.getForm().loadRecord(e_recordsr[0]);
	
	var win1 = Ext.widget('window', {
		title : '修改账户',
		width : 400,
		autoHeight : true,
		layout : 'fit',
		resizable : false,
		modal : true,
		items : [ editBankAccountDialog ]
	}).show();
}

function editAdmdivZeroAccount(win) {
	var myMask = new Ext.LoadMask(Ext.getBody(), {
		msg : '后台正在处理中，请稍后....',
		removeMask : true
		});
	myMask.show();
	Ext.Ajax.request({
				url : 'editProvinceAdmdivZeroAccount.do',
				method : 'POST',
				timeout : 180000, // 设置为3分钟
				form : "editform",
				timeout : 3000,
				params : {
					account_name : Ext.getCmp('EadmdivZeroForm').getForm().findField('account_name').getValue(),
					account_no : Ext.getCmp('EadmdivZeroForm').getForm().findField('account_no').getValue(),
					finance_name : Ext.getCmp('EadmdivZeroForm').getForm().findField('finance_name').getValue(),
			        finance_phone : Ext.getCmp('EadmdivZeroForm').getForm().findField('finance_phone').getValue(),
					account_id : accountId,
					bankid : bankid,
					is_valid : Ext.getCmp('EadmdivZeroForm').getForm().findField('is_valid1').getValue(),
					admdiv_code : Ext.getCmp('EadmdivZeroForm').getForm().findField('admdiv_code').getValue()	
				},
				// 提交成功的回调函数
				success : function(response, options) {
					succAjax(response,myMask,true);
					refreshData();
				},
				// 提交失败的回调函数
				failure : function(response, options) {
					failAjax(response,myMask);
					refreshData();
				}
			});
}