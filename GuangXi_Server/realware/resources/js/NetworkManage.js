/*******************************************************************************
 * 主要用于网点维护
 * 
 * @type
 */

document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/recommend.js"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/share/impFile.js"></scr' + 'ipt>');

/**
 * 数据项
 */
var fileds = ["code", "name", "address", "linkname", "telephone", "code5",
		"code6", "code4", "id","enabled","virtual_user"]; // 数据项

/**
 * 列名
 */
var header = "网点编码|code,网点名称|name|140,地址|address|140,联系人|linkname,联系电话|telephone,"
		+ "负责人|code5,行长|code6,城市|code4,虚拟柜员|virtual_user";

var finPanel = null;
/**
 * 界面加载
 */

Ext.onReady(function() {
	Ext.QuickTips.init();
	Ext.Loader.setPath('Ext', 'js');
	Ext.syncRequire(['js.view.common.Network']);
	Ext.create('Ext.Viewport', {
		id : 'netWorkFrame',
		layout : 'border',
		items : [{
	        region: 'north',
	        items : [{id : 'buttongroup',
				xtype : 'buttongroup',
				items : [{
							id : 'add',
							text : '新增',
							iconCls : 'add',
							scale : 'small',
							handler : function() {
								addNetWork();
							}
						}, {
							id : 'edit',
							text : '修改',
							iconCls : 'edit',
							scale : 'small',
							handler : function() {
								editNetWork();
							}
						}, {
							id : 'delete',
							text : '删除',
							iconCls : 'delete',
							scale : 'small',
							handler : function() {
								deleteNetWork();
							}
						}, {
							id : 'input',
							text : '导入',
							iconCls : 'import',
							scale : 'small',
							fileUpload : true,
							handler : function() {
								importFile("/realware/importNetWorks.do");
							}
						}, {
							id : 'refresh',
							text : '刷新',
							iconCls : 'refresh',
							scale : 'small',
							handler : function() {
								refreshData();
							}
						}]},
	                 {
	     				id : 'networkQuery',
	    				title : "查询区",
	    				bodyPadding : 8,
	    				layout : 'hbox',
	    				defaults : {
	    					margins : '3 5 0 0'
	    				},
	    				items : [{
	    							id : 'codeOrName',
	    							dataIndex : 'code',
	    							fieldLabel : '网点编码/名称',
	    							symbol:"like",
	    							xtype : 'textfield',
	    							labelWidth : 90,
	    							width : 220
	    						}, {
	    							id : 'createDate',
	    							fieldLabel : '创建日期',
	    							xtype : 'datefield',
	    							dataIndex : "create_date",
	    							format : 'Ymd',
	    							symbol : '=',
	    							labelWidth : 70,
	    							width : 230,
	    							data_type : 'date'
	    						}]
	    			}]
	    }, {
			region : 'west',
			title : '网点信息',
			id : 'networkTree',
			width : 400,
			xtype : 'NetworkTree',
			isLoadAll:false,
            listeners : {
            	containerclick : function( thiz, e, eOpts ) {
            		Ext.getCmp('bankform').getForm().reset();
            	},
            	itemclick : function(view, record, item, index, e) {
					if(record == null) return ;
					var code = record.raw.code;
						Ext.Ajax.request({
										url : '/realware/loadDetialByCode.do',
										method : 'POST',
										timeout : 180000, // 设置为3分钟
										params : {
											code : code
										},
										success : function(response, options) {
											var bankDto = Ext.JSON.decode(response.responseText);
											Ext.getCmp('bankform').getForm().setValues(bankDto);	
											Ext.getCmp("idd").setValue(bankDto.bank_id);
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
			region : 'center',
			xtype : 'form',
			id : "bankform",
		    title: '基本信息',
		    bodyPadding: 20,
		    width: 350,
		    layout: 'anchor',
		    defaults: {
		        anchor: '50%'
		    },
		    // The fields
		    defaultType: 'textfield',
		    items: [{
				id : 'netCode',
				xtype : 'textfield',
				labelAlign : 'right',
				fieldLabel : '网点编码',
				name : 'bank_code',
				afterLabelTextTpl : required,
				regex : /^([0-9]{0,42})$/,
				regexText: "网点编码为数字且长度不允许超过42位",
				allowBlank : false
			}, {
				id : 'netName',
				xtype : 'textfield',
				labelAlign : 'right',
				fieldLabel : '网点名称',
				name : 'bank_name',
				afterLabelTextTpl : required,
				regex : /^([a-zA-Z0-9\u4e00-\u9fa5]{1,60})$/,
				regexText: "网点名称不允许超过60位",
				allowBlank : false
			}, {
				id : 'code42',
				xtype : 'textfield',
				labelAlign : 'right',
				fieldLabel : '网点行号',
				name : 'bank_no',
				afterLabelTextTpl : required,
				regex : /^([0-9]{0,12})$/,
				regexText: "网点行号只能是数字且长度不允许超过12位",
				allowBlank : false
			}, {
				id : 'virtual_user1',
				xtype : 'textfield',
				labelAlign : 'right',
				fieldLabel : '虚拟柜员',
				name : 'virtual_user',
				regex : /^([a-zA-Z0-9\u4e00-\u9fa5]{0,20})$/,
				regexText: "虚拟柜员不允许超过20位",
				allowBlank : true
			},{
				id : 'address1',
				xtype : 'textfield',
				labelAlign : 'right',
				fieldLabel : '地址',
				name : 'address',
				//afterLabelTextTpl : required,
				allowBlank : true
			}, {
				id : 'linkname1',
				xtype : 'textfield',
				labelAlign : 'right',
				fieldLabel : '联系人',
				name : 'linkman',
				allowBlank : true
			}, {
				id : 'telephone1',
				xtype : 'textfield',
				labelAlign : 'right',
				fieldLabel : '联系电话',
				name : 'telephone_number',
				regex : /^([0-9]{8,14})$/,
				regexText: "电话为数字且长度为8至14位",
				allowBlank : true
			}, {
				id : 'code51',
				xtype : 'textfield',
				labelAlign : 'right',
				fieldLabel : '负责人',
				name : 'person_in_charge',
				allowBlank : true
			}, {
				id : 'code61',
				xtype : 'textfield',
				labelAlign : 'right',
				fieldLabel : '行长',
				name : 'bank_president',
				regex : /^([a-zA-Z0-9\u4e00-\u9fa5]{1,42})$/,
				regexText: "行长名称不允许超过42位",
				allowBlank : true
			}, {
				id : 'code41',
				xtype : 'textfield',
				labelAlign : 'right',
				fieldLabel : '城市',
				name : 'city',
				regex : /^([a-zA-Z0-9\u4e00-\u9fa5]{1,42})$/,
				regexText: "城市名称不允许超过42位",
				allowBlank : true
			},{
				id : 'idd',
				name : 'id',
				xtype : 'hiddenfield'
			},{
					xtype : 'panel',
					id : 'bpanel',
					border : false,
//					bodyStyle: 'background:#b5b8c8',
					layout: {
					    type: 'hbox',
					    align: 'bottom',
					    pack: 'end'
					},
					defaults : {
						margins : '0 10 0 0'
					},
					items : [{
						xtype : 'button',
						id : 'save',
						text : '保存',
						width : 60
					},{
						xtype : 'button',
						id : 'cal',
						text : '取消',
						width : 60
					}]
				}
			]
		}]
	});
	bankFormSet(false);
	
});

/**
 * 设置表单是否可编辑
 */
function bankFormSet(isEanble){
	var bfds = Ext.ComponentQuery.query('button, textfield:not(hiddenfield)',Ext.getCmp('bankform'));
	Ext.Array.each(bfds,function(item){
		if(isEanble){
			item.enable(false);
		}else{
			item.disable(true);
		}
	});
}

function buttonSet(isEanble){
	if(isEanble){
		Ext.getCmp('add').enable();
		Ext.getCmp('edit').enable();
		Ext.getCmp('delete').enable();
		Ext.getCmp('input').enable();
		Ext.getCmp('networkTree').enable();//refresh
		Ext.getCmp('refresh').enable();
	}else{
		Ext.getCmp('add').disable();
		Ext.getCmp('edit').disable();
		Ext.getCmp('delete').disable();
		Ext.getCmp('input').disable();
		Ext.getCmp('networkTree').disable();
		Ext.getCmp('refresh').disable();
	}
}

/**
 * 重新绑定按钮事件
 * @param btn
 * @param handlerFn
 */
function replaceHandler(btn, handlerFn) {
	if(btn.handlerFn) {
		btn.un('click', btn.handlerFn);
	}
	btn.handlerFn = handlerFn;
	btn.on('click', btn.handlerFn);
}

/**
 * 数据来源
 */
var comboEnabledStore = Ext.create('Ext.data.Store', {
			fields : ['name', 'value'],
			data : [{
						"name" : "启用",
						"value" : 1
					}, {
						"name" : "停用",
						"value" : 0
					}, {
						"name" : "全部",
						"value" : null
					}]
		});
/*******************************************************************************
 * /** 选择条件
 */
function selectEnabledStore() {
	var taskState = Ext.getCmp("enabled").getValue();
	var add = Ext.getCmp("add");
	var edit = Ext.getCmp("edit");
	var invalid = Ext.getCmp("invalid");
	var input = Ext.getCmp("input");
	// 如果选中的是可用状态
	if ("1" == taskState || "-1" == taskState) {
		add.show();
		edit.show();
		invalid.show();
		input.show();
		// 不可用状态
	} else if ("0" == taskState) {
		add.hide();
		edit.hide();
		invalid.hide();
		input.hide();
	}
	refreshData();
}
/**
 * 新增网点
 */
// 必须输入提示
var required = '<span style="color:red;font-weight:bold" data-qtip="Required">*</span>', createWindow;
function addNetWork() {
	//表单可用
	bankFormSet(true);
	//新增、修改和删除按钮不可用
	buttonSet(false);
	//原值
	var oriValues = Ext.getCmp('bankform').getForm().getValues();
	Ext.getCmp('bankform').getForm().reset();
	//新增的取消
	replaceHandler(Ext.getCmp('cal'), function(){
		buttonSet(true);
		bankFormSet(false);
		//恢复原值
		Ext.getCmp('bankform').getForm().setValues(oriValues);
	});
	//新增的保存
	replaceHandler(Ext.getCmp('save'),function(){
		var record = Ext.getCmp("networkTree").getSelectionModel().getSelection();
		var superCode = null;
		if(record.length > 0){
			superCode = record[0].raw.code;
		}
		if (this.up('form').getForm().isValid()) {
			var code = Ext.getCmp("netCode").getValue();
			var name = Ext.getCmp("netName").getValue();
			var bankno = Ext.getCmp("code42").getValue();
			var virtualuser=Ext.getCmp("virtual_user1").getValue().trim();
			var address = Ext.getCmp("address1").getValue().trim();
			var linkname = Ext.getCmp("linkname1").getValue().trim();
			var telephone = Ext.getCmp("telephone1").getValue().trim();
			var principal = Ext.getCmp("code51").getValue().trim();
			var president = Ext.getCmp("code61").getValue().trim();
			var city = Ext.getCmp("code41").getValue().trim();
			var id = Ext.getCmp("idd").getValue();
			var data ={};
			data.code=code;
			data.name=name;
			data.address=address;
			data.linkname=linkname;
			data.bank_no=bankno;
			data.telephone=telephone;
			data.virtual_user=virtualuser;
			data.person_in_charge=principal;
			data.bank_president=president;
			data.id=id;
			data.city=city;

			var myMask = new Ext.LoadMask(Ext.getBody(), {
				msg : '后台正在处理中，请稍后....',
				removeMask : true
				//	 完成后移除								
					  });
			myMask.show();
			Ext.Ajax.request({
						url : '/realware/addNetWork.do',
						params : {
							superCode : superCode
						},
						method : 'POST',
						timeout : 180000, // 设置为3分钟
						jsonData : Ext.JSON.encode(data),
						// 提交成功的回调函数
						success : function(response, options) {
							var networktree = Ext.getCmp('networkTree');
							var selections = networktree.getSelectionModel().getSelection();
							var parentNode = null;
							if(selections && selections.length > 0) {
								parentNode = selections[0];
								parentNode.data.leaf = false;
							} else {
								parentNode = networktree.getRootNode();
							}
							parentNode.appendChild({
					       		code : code,
					       		text : name,
					       		leaf : true,
					       		iconCls : 'network'
					       	});
//							parentNode.expand();
							Ext.getCmp('bankform').getForm().reset();
							succAjax(response, myMask,false);
							buttonSet(true);
							bankFormSet(false);
						},
						// 提交失败的回调函数
						failure : function(response, options) {
							failAjax(response, myMask);
//							refreshData();
							buttonSet(true);
							bankFormSet(false);
						}
					});
		}
	});
}
/*******************************************************************************
 * 修改网点信息
 */
var required2 = '<span style="color:red;font-weight:bold" data-qtip="Required">*</span>', editWindow;

function editNetWork(operation) {
	buttonSet(false);
	bankFormSet(true);
	Ext.getCmp("netCode").disable();
	//原值
	var oriValues = Ext.getCmp('bankform').getForm().getValues();
	//修改的取消
	replaceHandler(Ext.getCmp('cal'), function(){
		buttonSet(true);
		bankFormSet(false);
		//恢复原值
		Ext.getCmp('bankform').getForm().setValues(oriValues);
	});

	//修改的保存
	replaceHandler(Ext.getCmp('save'), function(){
		if (this.up('form').getForm().isValid()) {
			var code = Ext.getCmp("netCode").getValue();
			var name = Ext.getCmp("netName").getValue();
			var virtualuser=Ext.getCmp("virtual_user1").getValue().trim();
			var address = Ext.getCmp("address1").getValue().trim();
			var bankno = Ext.getCmp("code42").getValue();
			var linkname = Ext.getCmp("linkname1").getValue().trim();
			var telephone = Ext.getCmp("telephone1").getValue().trim();
			var principal = Ext.getCmp("code51").getValue().trim();
			var president = Ext.getCmp("code61").getValue().trim();
			var city = Ext.getCmp("code41").getValue().trim();
			var id = Ext.getCmp("idd").getValue();
			oriValues.bank_code = code;
			oriValues.bank_name = name;
			oriValues.address = address;
			oriValues.virtual_user= virtualuser;
			oriValues.bank_no = bankno;
			oriValues.linkman = linkname;
			oriValues.telephone_number = telephone;
			oriValues.person_in_charge = principal;
			oriValues.bank_president = president;
			oriValues.city = city;
			
			var data ={};
			data.code=code;
			data.name=name;
			data.address=address;
			data.linkname=linkname;
			data.bank_no=bankno;
			data.telephone=telephone;
			data.virtual_user=virtualuser;
			data.person_in_charge=principal;
			data.bank_president=president;
			data.id=id;
			data.city=city;
			
			var myMask = new Ext.LoadMask(Ext.getBody(), {
				msg : '后台正在处理中，请稍后....',
				removeMask : true
				//	 完成后移除								
					  });
			myMask.show();
			Ext.Ajax.request({
						url : '/realware/editNetWork.do',
						method : 'POST',
						timeout : 180000, // 设置为3分钟
						jsonData : Ext.JSON.encode(data),
						// 提交成功的回调函数
						success : function(response, options) {
							Ext.getCmp('bankform').getForm().setValues(oriValues);
							var netTree = Ext.getCmp('networkTree');
							var nowNode = netTree.getSelectionModel().getSelection()[0];
							nowNode.set("text",name);
							succAjax(response, myMask,false);
							buttonSet(true);
							bankFormSet(false);
						},
						// 提交失败的回调函数
						failure : function(response, options) {
							failAjax(response, myMask);
//							refreshData();
							buttonSet(true);
							bankFormSet(false);
						}
					});
		}
	});

}

/**
 * 删除网点
 */
function deleteNetWork() {
	var myMask = new Ext.LoadMask(Ext.getBody(), {
		msg : '后台正在处理中，请稍后....',
		removeMask : true
			// 完成后移除
		});

	var records = Ext.getCmp("networkTree").getSelectionModel().getSelection();
	if (records.length != 1) {
		Ext.Msg.alert("系统提示", "请选中一条网点信息！");
		return;
	}
	var network = records[0];
	var altmsg = "确定要删除选中的网点吗？";
	if(!network.isLeaf()){
		altmsg = "确定要删除选中网点及下属网点么？"
	}
	// 弹窗是否确定进行删除
	Ext.Msg.confirm("系统提示",altmsg , function(e) {
				if (e == "yes") {
					var jsonArray = [];
					var code = network.raw.code;
					myMask.show();
					Ext.Ajax.request({
								url : '/realware/delNetWork.do',
								method : 'POST',
								timeout : 180000, // 设置为3分钟
								params : {
									code : code
								},
								// 提交成功的回调函数
								success : function(response, options) {
									var networktree = Ext.getCmp('networkTree');
									var a = networktree.getSelectionModel().getSelection();
							        a[0].remove();
							        
							        Ext.getCmp('bankform').getForm().reset();
							        Ext.Msg.show({
										title : '系统提示',
										msg : "删除成功！",
										buttons : Ext.Msg.OK,
										icon : Ext.MessageBox.INFO
									});
								},
								// 提交失败的回调函数
								failure : function(response, options) {
									failAjax(response, myMask);
									refreshData();
								},
								callback : function(response, options) {
									myMask.hide();
								}
							});
				}
			});
}


/*******************************************************************************
 * 刷新
 * 
 * @return
 */
function refreshData() {
		var jsonMap = "[{";
	var codeOrName = Ext.getCmp('codeOrName').getValue();
	if (!Ext.isEmpty(codeOrName)) {
		var jsonStr = [];
		jsonStr[0] = "=";
		jsonStr[1] = codeOrName;
		jsonMap = jsonMap + "\"codeOrName\":" + Ext.encode(jsonStr) + ",";
	}
	
	/**
	 * 日期不输入时，查询报错
	 * edit by liutianlong 2017年5月31日
	 */
	if(!Ext.isEmpty( Ext.getCmp("createDate").getValue())){
		var createDate = Todate( Ext.getCmp("createDate").getValue());
		if(!Ext.isEmpty(createDate)){
			var a = [];
			a[0] = "=";
			a[1] = createDate;
			a[2] = "date";
			a[3] = "yyyyMMdd";
			jsonMap = jsonMap + '"create_date":' + Ext.encode(a) + ","
		}
	}
	

	data = jsonMap + "}]";

	Ext.getCmp("networkTree").getSelectionModel().deselectAll();
	Ext.getCmp("networkTree").getStore().load({
				method : 'post',
				params : {
					start : 0,
					pageSize : 200,
					filedNames : JSON.stringify(fileds),
					jsonMap : data
				}
			});

}
