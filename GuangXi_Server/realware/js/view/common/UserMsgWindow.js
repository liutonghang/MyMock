Ext.define('pb.view.common.UserMsgWindow', {
	extend : 'Ext.window.Window',
	alias : 'widget.userMsgWindow',
	resizable : false,
	draggable : false,
	layout : 'fit',
	width : 350,
	height : 370,
    defaults: {width: 300},
	modal : true,
	title : null,
	isEdit : null,
	valueChanged:false,
	initComponent : function() {
		var me = this;
		Ext.applyIf(me, {
			items : [ {
					xtype : 'form',
					frame: false,
	                bodyPadding: 10,
//	                defaults : {
//	                	margin : '2 0 3 0', padding : '0 0 0 0'
//	                },
					items : [
			  {
				id : 'sign_id',
				name : 'sign_id',
				fieldLabel : 'sign_id',
				xtype : 'textfield',
				hidden : true
			},{
				id : 'agency_code',
				name : 'agency_code',
				fieldLabel : '单位编码',
				xtype : 'textfield',
				regex : /^(\d{1,20})$/,
				regexText : "单位编码为不超过20位的数字",
				allowBlank : false
			},{
				id : 'agency_name',
				name : 'agency_name',
				fieldLabel : '单位名称',
				regex : /^([a-zA-Z0-9\u4e00-\u9fa5]{1,60})$/,
				regexText: "单位名称为不超过60位的汉字、字母、数字组合",
				xtype : 'textfield',
				allowBlank : false
			},{
				id : 'account_code',
				name : 'account_code',
				fieldLabel : '账号',
				xtype : 'textfield',
				regex : /^([a-zA-Z0-9]{1,20})$/,
				regexText: "账号为不超过20位的数字,字母組合",
				allowBlank : false
			},{
				id : 'org_code',
				name : 'org_code',
				fieldLabel : '组织机构代码',
				xtype : 'textfield',
				regex : /^(\d{1,12})$/,
				regexText: "组织机构代码为不超过12位的数字",
				allowBlank : false
			},{
				id : 'user_name',
				name : 'user_name',
				fieldLabel : '用户名称',
				regex : /^([a-zA-Z0-9\u4e00-\u9fa5]{1,60})$/,
				regexText: "单位名称不允许超过60位",
				xtype : 'textfield',
				allowBlank : false
			},{
				id : 'document_type',
				name : 'document_type',
				fieldLabel : '证件类型',
                editable : false,
                xtype : 'combo',
                value: "1",
				displayField : 'name',
				valueField : 'value',
				emptyText:'请选择',
				store : paperstore
                
            },{
				id : 'paper_no',
				name : 'paper_no',
				fieldLabel : '证件号码',
				xtype : 'textfield',
				regex: /(^\d{15}$)|(^\d{17}([0-9]|X)$)/,
				regexText: "不是有效的证件号码",
				allowBlank : false
			},{
				id:'phone_no',
				name:'phone_no',
				fieldLabel : '手机号码',
				xtype : 'textfield',
				regex : /^[1]\d{10}$/ ,
				regexText: "不是有效的手机号码",
				allowBlank : false
			},{
				id:'address',
				name:'address',
				fieldLabel : '联系地址',
				xtype : 'textfield',
				allowBlank : true
			},{
				id:'e_mail',
				name:'e_mail',
				fieldLabel : '电子邮箱',
				xtype : 'textfield',
			    regex : /^(\w)+(\.\w+)*@(\w)+((\.\w+)+)$/,
			    regexText : "不是有效的电子邮件地址",
				allowBlank : true
			}],
				buttons : [ {
					id : 'confirm',
					text : '确定'
				}, {
					id : 'cancle',
					text : '取消',
					handler : function() {
						this.up('window').close();
					}
				} ]
			} ]
		})
		me.callParent(arguments);
	},
	getForm : function() {
		return this.down('form').getForm();
	},
	setRecord : function(record) {
		this.dataRecord = record;
		this.getForm().loadRecord(record);
	},
	checkChange:function(){
		var rec= this.dataRecord;
		var values = this.getForm().getValues();
		for(key in values){
			var v= values[key];
			if(v!=rec.get(key)){
				return true;
			}
		}
		return false;
	},
	//设置只读及置灰样式
	setReadOnly : function(){
	        Ext.getCmp("agency_code").setReadOnly(true);
	        Ext.getCmp("agency_name").setReadOnly(true);
	        Ext.getCmp("account_code").setReadOnly(true);
		    Ext.getCmp("agency_code").addCls("x-item-disabled");
		    Ext.getCmp("agency_name").addCls("x-item-disabled");
		    Ext.getCmp("account_code").addCls("x-item-disabled");
		
	}
});
