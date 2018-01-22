
var required = '<span style="color:red;font-weight:bold" data-qtip="Required">*</span>';
document.write('<scr'+ 'ipt type="text/javascript" src="/realware/js/util/PageUtil.js"></scr'+ 'ipt>');
document.write('<scr'+ 'ipt type="text/javascript" src="/realware/js/view/common/ImportFileWindow.js"></scr'+ 'ipt>');


/*
 * 行号
 */
var selIds = "";//id
var selNos = ""; //no

Ext.define('pb.view.common.BankNoGrid', {
	extend : 'Ext.grid.Panel',
	alias : 'widget.BankNoGrid',
	title : '行号列表',
	hidColumns : [],
	columns : [ {
		xtype : 'rownumberer',
		width : 30,
		locked : true
	},{
		dataIndex : 'id',
		hidden:true
	}, {
		dataIndex : 'bank_no',
		text : '行号',
		align : 'center',
		width : 150
	}, {
		dataIndex : 'bank_name',
		text : '银行名称',
		align : 'center',
		width : 200
	}, {
		dataIndex : 'city_code',
		text : '城市编码',
		align : 'center',
		width : 100
	}, {
		dataIndex : 'city_name',
		text : '城市名称',
		align : 'center',
		width : 150
	}, {
		dataIndex : 'bank_type',
		text : '银行类别',
		align : 'center',
		width : 100
	}, {
		dataIndex : 'bank_short_name',
		text : '银行简称',
		align : 'center',
		width : 150
	}, {
		dataIndex : 'address',
		text : '地址',
		align : 'center',
		width : 150
	} ],
	initColumns : function() {
		var thiz = this;
		Ext.each(this.columns, function(item, index) {
			if (!Ext.isEmpty(thiz.hidColumns)) {
				if (Ext.Array.indexOf(thiz.hidColumns, item.dataIndex) > -1) {
					item.hidden = true;
				}
			}
		});
	},
	getListFields : function() {
		var fields = [];
		/**
		 * 得到列表字段
		 */
		Ext.each(this.columns, function(item, index) {
			if (item.dataIndex ) {
				fields.push(item.dataIndex);
			}
		});
		return fields;
	},
	initComponent : function() {
		this.initColumns();
		var store = getStore(loadUrl, this.getListFields());
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
			store : store,
			bbar : getPageToolbar(store)
		});
		this.callParent(arguments);
	},
	getSelections : function(silence) {
		var records = this.getSelectionModel().getSelection();
		if (records.length == 0) {
			if (!silence) {
				Ext.Msg.alert("系统提示", "请至少选择一条数据！");
			}
			return null;
		}
		return records;
	},

	/*
	 * 删除
	 * @memberOf {TypeName} 
	 */
	delbankNos : function(){
		// 请求开始时，都先把selIds置空
		selIds = "";
		selNos = "";
		selNames = "";
		// 当前选中的数据
		var d_recordsr = this.getSelections();
		// 选中的凭证的id数组，要传到后台（可以选中多条）
		for (var i = 0; i < d_recordsr.length; i++) {
			selIds += d_recordsr[i].get("id");
			selNos += d_recordsr[i].get("bank_no");
			selNames +=d_recordsr[i].get("bank_name");
			if (i < d_recordsr.length - 1){
				selIds += ",";
				selNos += ",";
				selNames +=",";
			}
		}
		Ext.MessageBox.confirm('删除提示', '是否确定删除 '+selNames+'的行号信息？', delBankNo);
	},
	openAddWin : function(bank_no, hidColumns) {
		var win = this.initPropertyWin("添加行号", hidColumns);
		var form = win.show().down("form").getForm();

	},
	openEditWin : function(bank_no, hidColumns) {
		var win = this.initPropertyWin("修改行号", hidColumns);
		var form = win.down("form").getForm();
		form.setValues(bank_no.data);
		win.show();
	},
	saveBankNo : function() {
		var panel = this.up('form');
		var form = panel.getForm();
		var grid = panel.grid;
		if (form.isValid()) {
			var params = form.getFieldValues();
			var url = updateUrl;
			var isEdit = true;
			if (Ext.isEmpty(params['id'])) {
				url = addUrl;
				isEdit = false;
			}
			for ( var p in params) {
				if (Ext.isEmpty(params[p])) {
					delete params[p];
				} else {
					if (params[p] === false) {
						params[p] = 0;
					} else if (params[p] === true) {
						params[p] = 1;
					}
				}
			}
		params["menu_id"] = getmenuid();
		var myMask = new Ext.LoadMask(Ext.getBody(), {
			msg : '后台正在处理中，请稍后....',
			removeMask : true // 完成后移除
		});
		myMask.show();
			Ext.Ajax.request({
				url : url,
				method : 'POST',
				params : params,
				success : function(response, options) {
					myMask.hide();
					var result = Ext.JSON.decode(response.responseText);
					if (result.code == '1') {
						panel.up("window").close();
						var store = panel.grid.getStore();
						if (isEdit) {
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
					myMask.hide();
					Ext.Msg.alert('提示', "操作失败，请联系管理员！");
				}
			});
		}
	},
	getPropertyFields : function(fields, hidColumns) {
		var grid = this;
		Ext.Array.map(fields, function(field, index) {
			if (Ext.Array.indexOf(hidColumns, field.name) > -1) {
				field.xtype = 'hiddenfield';
			}
		});
		var _dispFields = [], _hiddenFields = [];
		Ext.each(fields, function(field) {
			if (field.xtype == 'hiddenfield') {
				_hiddenFields.push(field);
			} else {
				_dispFields.push(field);
				if (field.combo) {
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
	initPropertyWin : function(title) {
		var grid = this;
		var fields = [ {
			xtype : 'hiddenfield',
			name : 'id'
		}, {
			xtype : 'textfield',
			afterLabelTextTpl : required,
			fieldLabel : '行号',
			labelWidth : 110,
			name : 'bank_no',
			allowBlank : false
		}, {
			xtype : 'textfield',
			fieldLabel : '银行名称',
			labelWidth : 110,
			afterLabelTextTpl : required,
			name : 'bank_name',
			allowBlank : false
		}, {
			xtype : 'textfield',
			fieldLabel : '城市代码',
			labelWidth : 110,
			name : 'city_code',
			allowBlank : true
		}, {
			xtype : 'textfield',
			fieldLabel : '城市名称',
			labelWidth : 110,
			name : 'city_name',
			allowBlank : true
		}, {
			xtype : 'textfield',
			fieldLabel : '银行类别',
			labelWidth : 110,
			name : 'bank_type',
			allowBlank : true
		}, {
			xtype : 'textfield',
			fieldLabel : '银行简称',
			labelWidth : 110,
			name : 'bank_short_name',
			allowBlank : true
		}, {
			xtype : 'textfield',
			fieldLabel : '地址',
			labelWidth : 110,
			name : 'address',
			allowBlank : true
		} ];
		fields = grid.getPropertyFields(fields, hidColumns);
		var form = {
			xtype : 'form',
			bodyPadding : 10,
			grid : grid,
			defaultType : 'textfield',
			defaults : {
				msgTarget : 'side'
			},
			items : fields,
			buttonAlign : 'center',
			buttons : [ {
				align : 'center',
				text : '确定',
				handler : function() {
					// 作用域改变
					this.up("form").grid.saveBankNo.call(this);
				}
			}, {
				text : '取消',
				handler : function() {
					this.up("window").close();
				}
			} ]
		};
		this.propertyWin = Ext.create('Ext.window.Window', {
			title : title,
			height : 280,
			width : 400,
			closeAction : 'destroy',
			layout : 'fit',
			items : [ form ]
		});
		return this.propertyWin;
	}
});

function delBankNo(id) {
	var me = this;
	if (id == "yes") {
		var params = {
			selIds : selIds,
			selNos : selNos
		};
		Ext.PageUtil.doRequestAjax(me,delUrl,params);
	}
}