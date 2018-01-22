document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/Common_Validate.js"></scr' + 'ipt>');
var required = '<span style="color:red;font-weight:bold" data-qtip="Required">*</span>';
/*
 * 零余额维护
*/
Ext.define('pb.view.common.AccountGrid', {
	extend : 'Ext.grid.Panel',
	alias : 'widget.AccountGrid',
	title : '账户列表',
	hidColumns : [],
	columns : [
              	{ xtype:'rownumberer', width:30, locked:true},
               	{ dataIndex : 'account_id', hidden : true },
               	{ dataIndex : 'account_name', text : '账户名称', align : 'center' , width : 200},
               	{ dataIndex : 'account_no', text : '账号', align : 'center' , width : 150},
               	{ dataIndex : 'admdiv_code', text : '所属财政', align : 'center' , width : 150},
               	{ dataIndex : 'account_type_code', text : '账户类型', hidden : true},
               	{ dataIndex : 'bank_no', text : '', hidden : true},
               	{ dataIndex : 'bank_id', text : '', hidden : true},
               	{ dataIndex : 'bank_code', text : '银行代码'},
               	{ dataIndex : 'bank_name', text : '银行名称'},
               	{ dataIndex : 'fund_type_code', text : '资金性质', align : 'center' , width : 150},
               	{ dataIndex : 'pay_type_code', text : '支付方式', align : 'center' , width : 150},
               	{ dataIndex : 'agency_code', text : '单位编码', align : 'center' , width : 150},
               	{ dataIndex : 'agency_name', text : '单位名称', align : 'center' , width : 150},
               	{ dataIndex : 'is_samebank', text : '同行清算', align : 'center' , width : 60},
               	{ dataIndex : 'org_code', text : '机构代码', align : 'center' , width : 150},
               	{ dataIndex : 'is_valid', text : '是否有效', align : 'center' , width : 60, hidden : true},
               	{ dataIndex : 'is_cashpublic', text : '', hidden : true},
               	{ dataIndex : 'is_pbc', text : '人行账号', align : 'center', width : 60},
               //	{ dataIndex : 'amount', text : '账户余额', align : 'center' , width : 100},
               	{ dataIndex : 'finance_name', text : '财务人员名称', align : 'center' , width : 150},
               	{ dataIndex : 'finance_phone', text : '财务人员电话号码', align : 'center' , width : 150},
               	{ dataIndex : 'create_date', text : '创建日期', align : 'center' , width : 80}
               ],
    initColumns : function() {
    	var thiz = this;
    	Ext.each(this.columns, function(item, index) {
			if(!Ext.isEmpty(thiz.hidColumns)) {
				if(Ext.Array.indexOf(thiz.hidColumns, item.dataIndex) > -1) {
					item.hidden = true;
				}
			}
		});
    },
	getListFields : function () {
		var fields = [];
		/**
		 * 得到列表字段
		 */
		Ext.each(this.columns, function(item, index) {
			if(item.dataIndex && item.hidden !== true) {
				fields.push(item.dataIndex);
			}
		});
		/**
		 * account_id必须包含
		 */
		fields.push("account_id");
		return fields;
	},
	initComponent : function() {
		this.initColumns();
		var store = getStore('account/load.do', this.getListFields());
		store.on('beforeload', this.beforeload || Ext.emptyFn);
		Ext.apply(this, {
			selModel : {
				mode : 'multi',
				checkOnly : true,
				ignoreRightMouseSelection : true
			},
			selType : 'checkboxmodel',
			multiSelect : true,
			columns : this.columns,
            store: store,
            bbar : getPageToolbar(store)
		});
		this.callParent(arguments);
	},
	getSelections : function(silence) {
		var records = this.getSelectionModel().getSelection();
		if (records.length == 0) {
			if(!silence) {
				Ext.Msg.alert("系统提示", "请至少选择一条数据！");
			}
			return null;
		}
		return records;
	},
	delAccounts : function() {
		var grid = this;
		var records = grid.getSelections();
		if (!records) {
			return;
		}
		//选中的id数组，要传到后台
		var accounts = [];
		var accountNames = [];
		for (var i = 0; i < records.length; i++) {
			var raw = records[i].raw;
			accounts.push({account_id : raw.account_id, account_name : raw.account_name});
			accountNames.push(records[i].raw.account_name);
		}
		
		var delAccounts = function(accounts) {
			Ext.Ajax.request({
    			url : "account/remove.do",
    			method : 'POST',
    			params : {
    				accounts : Ext.JSON.encode(accounts)
    			},
    			success : function(response, options) {
    				var result = Ext.JSON.decode(response.responseText);
    				if(result.code == '1') {
    					Ext.Msg.alert('操作成功', '成功删除' + result.data.join(","));
    				} else {
    					Ext.Msg.alert('操作失败', (result.data.length > 0 ? '已删除' + result.data.join(",") : result.message));
    				}
    				grid.getStore().loadPage(1);
    			},
    			failure : function(response, options) {
    				Ext.Msg.alert('提示', '操作失败'); 
    			}
    	 });
		}
		
		Ext.MessageBox.confirm('删除提示', '是否确定删除<strong> ' + 
				accountNames.join(" , ") +' </strong>账户信息？', function(c) {
			if (c == "yes") {
				delAccounts(accounts);
			}
		});
	},
	
	openAddWin : function(account_type, hidColumns) {
		var win = this.initPropertyWin("添加账户", hidColumns);
		var form = win.show().down("form").getForm();
		win.down("form").down("[name='account_no']").setReadOnly(false);
		form.setValues({account_type_code : account_type});
	},
	openEditWin : function(account_id, hidColumns) {
		var win = this.initPropertyWin("编辑账户", hidColumns);
		var form = win.down("form").getForm();
		win.down("form").down("[name='account_no']").setReadOnly(false);
		Ext.Ajax.request({
				url : "account/get.do",
				method : 'POST',
				params : {
					account_id : account_id
				},
				success : function(response, options) {
					var account = Ext.JSON.decode(response.responseText);
					form.setValues(account);
					win.show();
				},
				failure : function(response, options) {
					Ext.Msg.alert('提示', '加载账户信息失败！'); 
				}
		 });
	},
	saveAccount : function() {
		var panel = this.up('form');
		var form = panel.getForm();
		var grid = panel.grid;
        if (form.isValid()) {
       	var params = form.getFieldValues();
       	var url = "account/edit.do";
       	var isEdit = true;
       	if(Ext.isEmpty(params['account_id'])) {
       		 url = 'account/add.do';
       		 isEdit = false;
       	}
       	for(var p in params) {
       		 if(Ext.isEmpty(params[p])) {
       			 delete params[p];
       		 } else {
       			 if(params[p] === false) {
           			 params[p] = 0;
           		 } else if(params[p] === true) {
           			 params[p] = 1;
           		 }
       		 }
       	 }
       	 params["menu_id"] = getmenuid();
       	 Ext.Ajax.request({
       			url : url,
       			method : 'POST',
       			params : params,
       			success : function(response, options) {
       				var result = Ext.JSON.decode(response.responseText);
       				if(result.code == '1') {
       					panel.up("window").close();
       					var store = panel.grid.getStore();
        				if(isEdit) {
        					store.reload();
        				} else {
        					// load page 1
        					store.loadPage(1);
        				}
       					Ext.Msg.alert('提示', '操作成功');
       				} else {
       					Ext.Msg.alert('提示', result.message); 
       				}
       			},
       			failure : function(response, options) {
       				Ext.Msg.alert('提示', "操作失败，请联系管理员！"); 
       			}
       	 	});
        }
	},
	getPropertyFields : function(fields, hidColumns) {
		var grid = this;
		Ext.Array.map(fields, function(field, index) {
			if(Ext.Array.indexOf(hidColumns, field.name) > -1) {
				field.xtype = 'hiddenfield';
			}
		});
		var _dispFields = [], _hiddenFields = []; 
		Ext.each(fields, function(field) {
			if(field.xtype == 'hiddenfield') {
				_hiddenFields.push(field);
			} else {
				_dispFields.push(field);
				if(field.combo) {
					var type = field.name.replace("_code", "");
					Ext.apply(field, {
						xtype : 'eletreepicker',
						eleType : type.toUpperCase(),
						listeners : {
							  expand : function(comboBox) {
							        comboBox.picker.setWidth(240);
							        comboBox.picker.setHeight(200);
								}
						}
					});
				}
			}
		});
		return _dispFields.concat(_hiddenFields);
	},
	initPropertyWin : function(title, hidColumns) {
		hidColumns = hidColumns || this.hidColumns
		var grid = this;
		var thiz = this;
		var accountTypeField = thiz.accountTypes ? {
		      name: 'account_type_code',
			  fieldLabel: '账户类型',
			  xtype: 'mytreepicker',
			  valueField: 'id',
			  displayField: 'text',
			  store: thiz.accountTypes,
	          allowBlank : false,
			  listeners : {
				  expand : function(comboBox) {
				        comboBox.picker.setWidth(240);
					},
			      select : function(picker, record) {
			    	  if(record.hasChildNodes()) {
			    		  picker.setValue("");
			    		  picker.setRawValue("");
			    	  }
			      }
			  }
			} : {
		    	xtype: 'hiddenfield',
		        name: 'account_type_code',
		        allowBlank : false
		    };
		var fields = [{
	    	xtype: 'textfield',
	    	afterLabelTextTpl : required,
	    	fieldLabel : '账户名称',
	    	labelWidth: 110,
	    	vtype:"accountName",
	        name: 'account_name',
	        afterLabelTextTpl : required,
	        allowBlank : false
	    }, {
	    	xtype: 'textfield',
	    	fieldLabel : '账号',
	    	labelWidth: 110,
	    	vtype:"accountId",
	    	afterLabelTextTpl : required,
	        name: 'account_no',
	        allowBlank : false
		}, {
	    	xtype: 'textfield',
	    	fieldLabel : '财务人员名称',
	    	labelWidth: 110,
	        name: 'finance_name',
	        regex:/^([\w\d\u4e00-\u9fa5]{1,60})$/,
			regexText :'财务人员名称只能是数字字母和汉字，长度不超过60',
	        allowBlank : true
	    }, {
	    	xtype: 'textfield',
	    	fieldLabel : '财务人员电话号码',
	    	labelWidth: 110,
	        name: 'finance_phone',
	        vtype:"commonPhone",
	        allowBlank : true
	    }, {
	    	xtype: 'combo',
	    	fieldLabel : '所属财政',
	        name: 'admdiv_code',
	        displayField : 'admdiv_name',
	        afterLabelTextTpl : required,
	        labelWidth: 110,
			emptyText : '请选择',
			valueField : 'admdiv_code',
			editable : false,
			store : comboAdmdiv,
	        allowBlank : false,
			listeners : {
				'change' : function(combo, newValue, oldValue) {
					var pickers = Ext.ComponentQuery.query("eletreepicker[combo=true]", 
							this.up("form"));
					Ext.each(pickers, function(picker) {
						picker.reload(newValue);
					});
				}
			}
	    }, accountTypeField, {
	    	xtype: 'textfield',
	    	fieldLabel : '银行行号',
	        name: 'bank_no',
	        regex:/^\d+$/,
			regexText : '收款行号只能是数字',
			afterLabelTextTpl : required,
			labelWidth: 110,
	        allowBlank : false
	    }, {
	    	xtype: 'hiddenfield',
	        name: 'bank_code'
	    }, {
	    	xtype: 'textfield',
	    	fieldLabel : '银行名称',
	        name: 'bank_name',
	        regex:/^([\w\d\u4e00-\u9fa5]{1,60})$/,
			regexText :'银行名称只能是数字字母和汉字，长度不超过60',
			afterLabelTextTpl : required,
			labelWidth: 110,
	        allowBlank : false
	    }, {
	    	xtype: 'textfield',
	    	fieldLabel : '资金性质',
	    	labelWidth: 110,
	        name: 'fund_type_code',
	        combo : true
	    }, {
	    	xtype: 'textfield',
	    	fieldLabel : '支付方式',
	    	labelWidth: 110,
	        name: 'pay_type_code',
	        combo : true
	    }, {
	    	xtype: 'textfield',
	    	fieldLabel : '单位编码',
	    	labelWidth: 110,
	        name: 'agency_code',
	        vtype:"commonId",
	        allowBlank : false,
	        allowBlank : false
	    }, {
	    	xtype: 'textfield',
	    	fieldLabel : '单位名称',
	    	labelWidth: 110,
	        name: 'agency_name',
	        vtype:"commonName",
	        allowBlank : false
	    }, {
	    	xtype: 'textfield',
	    	fieldLabel : '机构代码',
	        name: 'org_code',
	        regex:/^\d+$/,
			regexText : '机构类型只能是数字',
			afterLabelTextTpl : required, 
			labelWidth: 110,
	        allowBlank : false
	    }, {
	    	xtype : 'checkboxfield',
	    	fieldLabel : '是否同行',
	    	labelWidth: 110,
	    	name : 'is_samebank',
	    	inputValue : '1'
	    }, {
	    	xtype : 'checkboxfield',
	    	fieldLabel : '是否人行',
	    	labelWidth: 110,
	    	name : 'is_pbc',
	    	inputValue : '1'
	    }, {
	    	xtype : 'checkboxfield',
	    	fieldLabel : '是否有效',
	    	labelWidth: 110,
	    	name : 'is_valid',
	    	inputValue : '1',
	    	checked : true,
			hidden : true
	    }, {
	    	xtype: 'hiddenfield',
	        name: 'account_id'
	    }, {
	    	xtype: 'hiddenfield',
	        name: 'is_cashpublic'
	    }, {
	    	xtype: 'hiddenfield',
	        name: 'amount'
	    }, {
	    	xtype: 'hiddenfield',
	        name: 'create_date'
	    }, {
	    	xtype: 'hiddenfield',
	        name: 'bank_id'
	    }];
		fields = grid.getPropertyFields(fields, hidColumns);
		var form = {
				xtype : 'form',
				bodyPadding: 10,
				grid : grid,
			    defaultType: 'textfield',
			    defaults : {
			    	msgTarget: 'side'
			    },
			    items: fields,
			    buttonAlign : 'center',
			    buttons : [{
			    	align : 'center',
			    	text : '确定',
			    	formBind : true,
			    	handler : function() {
			    		//作用域改变
			    		this.up("form").grid.saveAccount.call(this);
			    	}
			    }, {
			    	text : '取消',
			    	handler : function() {
			    		this.up("window").close();
			    	}
			    }]
		};
		this.propertyWin = Ext.create('Ext.window.Window', {
			title : title,
		    height: 450 - (hidColumns.length * 20),
		    width: 400,
		    closeAction : 'destroy',
		    layout: 'fit',
		    items: [form]
		});
		return this.propertyWin;
	}
});