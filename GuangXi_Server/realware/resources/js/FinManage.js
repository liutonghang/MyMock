/*******************************************************************************
 * 财政维护
 */

/***
 * 引入需要使用的js文件
 */
document.write('<scr' + 'ipt type="text/javascript" src="/realware/resources/js/recommend.js"></scr' + 'ipt>');
document.write('<scr'+ 'ipt type="text/javascript" src="/realware/resources/js/share/importFile.js"></scr'+ 'ipt>');
document.write('<scr'+ 'ipt type="text/javascript" src="/realware/resources/js/ChooseAdmdivAndBank.js"></scr'+ 'ipt>');
document.write('<scr'+ 'ipt type="text/javascript" src="/realware/js/view/common/ImportFileWindow.js"></scr'+ 'ipt>');
document.write('<scr'+ 'ipt type="text/javascript" src="/realware/js/util/PageUtil.js"></scr'+ 'ipt>');

/**
 * 数据项
 */
var fileds = ["admdiv_code", "admdiv_name","admdiv_model", "manager_bank_code",
		"manager_bank_name", "fin_org_code", "tre_code", "create_date",
		"start_time", "end_time", "pay_bank_name", "pay_bank_no", "is_valid",
		"manager_bank_id","business_no","terminal_no","admdiv_id","ss_start_time","ss_end_time"];

/**
 * 列名
 */
var header = "财政编码|admdiv_code,财政名称|admdiv_name,主办行编码|manager_bank_code,主办行名称|manager_bank_name," +
			"财政机构代码|fin_org_code,商务号|business_no,终端号|terminal_no,国库主体代码|tre_code,创建日期|create_date," +
			"日始时间|start_time,日终时间|end_time,自助柜面日始时间|ss_start_time,自助柜面日终时间|ss_end_time,代理银行名称|pay_bank_name,代理银行行号|pay_bank_no";


var copeAdmdivStore = Ext.create('Ext.data.Store', {
				fields : [{
							name : 'admdiv_code'
						}, {
							name : 'admdiv_name'
						}],
				proxy : {
					type : 'ajax',
					url : '/realware/loadAllAdmdivCode.do',
					reader : {
						type : 'json'
					}
				},
				autoLoad : false
			});
var finPanel = null;

var no = false;

/*******************************************************************************
 * 加载界面
 */
Ext.onReady(function() {
	Ext.QuickTips.init();
	try {
		if(visble != undefined){
			no =visble;
		}
	}catch(Exception){
		
	}
	if (finPanel == null) {
		finPanel = getGrid(loadUrl, header, fileds, true, true);
		finPanel.setHeight(document.documentElement.scrollHeight - 35);
		if(no){
			Ext.getCmp("terminal_no").setVisible(false);
			Ext.getCmp("business_no").setVisible(false);
		}
		// 根据查询条件检索数据
		finPanel.getStore().on('beforeload', function(thiz, options) {
			if (null == options.params || options.params == undefined) {
				options.params = {};
			}
			options.params["filedNames"] = Ext.encode(fileds);
//			beforeload(Ext.getCmp("finManageQuery"), options, Ext.encode(fileds));
		});
	}
	Ext.create('Ext.Viewport', {
				id : 'finManageFrame',
				layout : 'fit',
				items : [Ext.create('Ext.panel.Panel', {
							tbar : [{
										id : 'buttongroup',
										xtype : 'buttongroup',
										items : [ {
											        id : 'importLicense',
											        text : '导入License',
													iconCls : 'import',
													scale : 'small',
													fileUpload : true,
													handler : function() {
													var me = this;
													//这里是把该功能定义了一个控件调用的时候直接创建控件调用init方法show就完成了控件的显示
													//var admdivCode = Ext.getCmp('admdivCode').getValue();
													var importwindow = Ext.create('pb.view.common.ImportFileWindow');
													importwindow.init("/realware/importLicense.do",me,"license");
													importwindow.show();
													}
										       }, {
													id : 'add',
													text : '新增',
													iconCls : 'add',
													scale : 'small',
													handler : function() {
														addAdmdiv();
													}
												}, {
													id : 'edit',
													text : '修改',
													iconCls : 'edit',
													scale : 'small',
													handler : function() {
														editAdmdiv();
													}
												}/*, {
													id : 'copy',
													text : '复制',
													iconCls : 'copy',
													scale : 'small',
													handler : function() {
														copyAdmdiv();
													}
												}*/,{
													id : 'import',
													text : '导入',
													iconCls : 'import',
													scale : 'small',
													handler : function() {
														importData();
													}
												},{
													id : 'export',
													text : '导出',
													iconCls : 'export',
													scale : 'small',
													handler : function() {
														exportData();
													}
												},{
													id : 'delete',
													text : '删除',
													iconCls : 'delete',
													scale : 'small',
													handler : function() {
														deleteAdmdiv();
													}
												}, {
													id : 'refresh',
													text : '刷新',
													iconCls : 'refresh',
													scale : 'small',
													handler : function() {
														refreshData();
													}
												
												}]
									}],
									items:finPanel
//							items : [{
//										title : "查询区",
//										items : finPanel
////										tbar : {
////											id : 'finManageQuery',
////											xtype : 'toolbar',
////											bodyPadding : 8,
////											layout : 'hbox',
////											defaults : {
////												margins : '3 5 0 0'
////											},
////											items : [{
////														id : 'taskState',
////														fieldLabel : '当前状态',
////														xtype : 'combo',
////														dataIndex : 'is_valid',
////														displayField : 'name',
////														emptyText : '请选择',
////														valueField : 'value',
////														labelWidth : 60,
////														store : comboState,
////														value : 1,
////														editable : false,
////														listeners : {
////															'select' : selectState
////														}
////													}]
////										}
//									}]
						})]
			});
//	selectState();
	refreshData();
});

function selectState() {
	var taskState = Ext.getCmp('taskState').getValue();
	if (1 == taskState) {
		Ext.getCmp('add').enable(false);
		Ext.getCmp('edit').enable(false);
		Ext.getCmp('logout').enable(false);
	} else if (0 == taskState) {
		Ext.getCmp('add').disable(false);
		Ext.getCmp('edit').disable(false);
		Ext.getCmp('logout').disable(false);
	}
	refreshData();
}

var comboStore = Ext.create('Ext.data.Store', {
			fields : ['id', 'code', 'name', 'codename'],
			proxy : {
				type : 'ajax',
				url : '/realware/loadAllNetwork.do?filedNames='+Ext.encode(["id","code","name","codename"]),
				reader : {
					type : 'json'
				}
			},
			autoLoad : true
		});
/**
 * 加载所有的区划模板 
 * 柯伟 
 * 2014-05-22 11:05
 */		
var admdivStore = Ext.create('Ext.data.Store', {
			fields : ['admdiv_code'],
			proxy : {
				type : 'ajax',
				url : '/realware/loadAllAdmdiv.do?filedNames='+Ext.encode(["admdiv_code"]),
				reader : {
					type : 'json'
				}
			},
			autoLoad : false
		});
/*******************************************************************************
 * 新增财政
 */
var required = '<span style="color:red;font-weight:bold" data-qtip="Required">*</span>', createWindow;
function addAdmdiv() {
	if (!createWindow) {
		createWindow = Ext.widget('window', {
			title : '新增财政对话框',
			closeAction : 'hide',
			width : 400,
			height : no == true ? 400 : 450,
			layout : 'fit',
			resizable : true,
			modal : true,
			items : Ext.widget('form', {
				id : 'createForm',
				layout : {
					type : 'vbox',
					align : 'stretch'
				},
				border : false,
				width : 330,
				bodyPadding : 5,
				fieldDefaults : {
					labelAlign : 'right',
					labelWidth : 110
				},
				items : [{
							xtype :'panel',
							border:false,
							width:350,
							bodyPadding : 5,
							layout: 'hbox', 
							items:[{
										id : 'add_admdiv_code',
										xtype : 'textfield',
										fieldLabel : '模板财政',
										emptyText:'请点击【查询】选择',
										readOnly: 'true',
										width:300,
										msgTarget: 'side',
										allowBlank: false
									},
									{
										id : 'btn_admdiv_code',
										xtype : 'button',
										text : '查询',
										handler : function() {
											choseAdmdiv();						
										}											
									}]	
						},{
							id : 'admdiv_code1',
							xtype : 'textfield',
							fieldLabel : '财政编码',
							maxLength : 9,
							enforceMaxLength:true,
							allowBlank : false,
							msgTarget: 'side',
							regex : /^[0-9]*$/, 
							regexText: "财政编码格式只能为数字"
							
						}, {
							id : 'admdiv_name1',
							xtype : 'textfield',
							fieldLabel : '财政名称',
							afterLabelTextTpl : required,
							allowBlank : false
						},
//						{
//							id : 'admdiv_model1',
//							xtype : 'combo',
//							fieldLabel : '区划模板',
//							displayField : 'admdiv_code',
//							emptyText : '请选择',
//							valueField : 'admdiv_code',
//							store : admdivStore,
//							afterLabelTextTpl : required,
//							allowBlank : false,
//							editable : false
//						},
						{
							xtype:"panel",
							border:false,
							bodyPadding :"0 0 5 0 ", 
							layout:"hbox",
							items:[{
								id : 'manager_bank1',
								xtype : 'textfield',
								fieldLabel : '主办行',
								emptyText:'请点击【查询】选择',
								readOnly: 'true',
								afterLabelTextTpl : required,
								allowBlank : false,
								width:345,
								editable : false
							},{
								xtype:"button",
								text:"查询",
								handler:function(){
									var managerBankCmp = this.up("panel").down("textfield");
									choseBank(managerBankCmp);
								}
							}]
						},{
							id : 'fin_org_code1',
							xtype : 'textfield',
							fieldLabel : '财政机构代码',
							afterLabelTextTpl : required,
							allowBlank : false,
							msgTarget: 'side',
							regex : /^[0-9]*$/, 
							regexText: "财政机构代码格式只能为数字"
						}, {
							id : 'tre_code1',
							xtype : 'textfield',
							fieldLabel : '国库主体代码',
							afterLabelTextTpl : required,
							allowBlank : false,
							msgTarget: 'side',
							regex : /^[0-9]*$/, 
							regexText: "国库主体代码格式只能为数字"
						}, {
							id : 'pay_bank_name1',
							xtype : 'textfield',
							fieldLabel : '代理银行名称',
							afterLabelTextTpl : required,
							allowBlank : false
						}, {
							id : 'pay_bank_no1',
							xtype : 'textfield',
							fieldLabel : '代理银行行号',
							afterLabelTextTpl : required,
							allowBlank : false,
							msgTarget: 'side',
							regex : /^\d{12}$/, 
							regexText: "代理银行行号格式只能为数字并且为12位"
						}, {
							id : 'business_no1',
							xtype : 'textfield',
							fieldLabel : '商务号',
							//allowBlank : true,
							hidden : no,
							msgTarget: 'side',
							regex : /^[0-9]*$/, 
							regexText: "商务号格式只能为数字"
						}, {
							id : 'terminal_no1',
							xtype : 'textfield',
							fieldLabel : '终端号',
							hidden : no,
							msgTarget: 'side',
							regex : /^[0-9]*$/, 
							regexText: "终端号格式只能为数字"
						},new Ext.form.TimeField({
							id : 'start_time1',
							format : 'G:i:s',
							increment : 60,
							fieldLabel : '日始时间',
							afterLabelTextTpl : required,
							allowBlank : false
						}), new Ext.form.TimeField({
							id : 'end_time1',
							format : 'G:i:s',
							increment : 60,
							fieldLabel : '日终时间',
							afterLabelTextTpl : required,
							allowBlank : false
						}),new Ext.form.TimeField({
							id : 'ss_start_time1',
							format : 'G:i:s',
							increment : 60,
							fieldLabel : '自助柜面日始时间',
							allowBlank : true
						}), new Ext.form.TimeField({
							id : 'ss_end_time1',
							format : 'G:i:s',
							increment : 60,
							fieldLabel : '自助柜面日终时间',
							allowBlank : true
						})
						],
				buttons : [{
					text : '确定',
					handler : function() {
						var form = this.up('form').getForm();
						if (form.isValid()) {
							var add_admdiv_code = Ext.getCmp("add_admdiv_code").getValue();
							var admdiv_code = Ext.getCmp("admdiv_code1")
									.getValue();
							var admdiv_name = Ext.getCmp("admdiv_name1")
									.getValue();
//							var admdiv_model = Ext.getCmp("admdiv_model1")
//									.getValue();
							var managerBankCmp = Ext.getCmp("manager_bank1");
							var manager_bank_id = managerBankCmp.manager_bank_id;
							var manager_bank_code = managerBankCmp.manager_bank_code;
							var manager_bank_name= managerBankCmp.manager_bank_name;
							
							var fin_org_code = Ext.getCmp("fin_org_code1")
									.getValue();
							var tre_code = Ext.getCmp("tre_code1").getValue();
							var pay_bank_name = Ext.getCmp("pay_bank_name1")
									.getValue();
							var pay_bank_no = Ext.getCmp("pay_bank_no1")
									.getValue();
							var start_time = Ext.getCmp("start_time1")
									.getRawValue();
							var business_no = Ext.getCmp("business_no1")
									.getValue();
							var terminal_no = Ext.getCmp("terminal_no1")
									.getValue();
							var end_time = Ext.getCmp("end_time1")
									.getRawValue();
							var start = start_time.replace(":", "").replace(
									":", '');
							var end = end_time.replace(":", "")
									.replace(":", '');
							if (parseInt(start) >= parseInt(end)) {
								Ext.Msg.alert("系统提示", "日始时间不能大于或等于日终时间！");
								return;
							}
							//自助柜面日始时间日终时间
							var ss_start_time = Ext.getCmp("ss_start_time1").getRawValue();
							var ss_end_time = Ext.getCmp("ss_end_time1").getRawValue();
							var ss_start = ss_start_time.replace(":", "").replace(
									":", '');
							var ss_end = ss_end_time.replace(":", "")
									.replace(":", '');
							if (parseInt(ss_start) >= parseInt(ss_end)) {
								Ext.Msg.alert("系统提示", "自助柜面日始时间不能大于或等于日终时间！");
								return;
							}
							var data = "{\"admdiv_code\":\"" + admdiv_code
									+ "\",\"admdiv_name\":\"" + admdiv_name
//									+ "\",\"admdiv_model\":\"" + admdiv_model
									+ "\",\"manager_bank_id\":"
									+ manager_bank_id
									+ ",\"manager_bank_code\":\""
									+ manager_bank_code
									+ "\",\"manager_bank_name\":\""
									+ manager_bank_name
									+ "\",\"fin_org_code\":\"" + fin_org_code
									+ "\",\"tre_code\":\"" + tre_code
									+ "\",\"pay_bank_name\":\"" + pay_bank_name
									+ "\",\"pay_bank_no\":\"" + pay_bank_no
									+ "\",\"business_no\":\"" + business_no
									+ "\",\"terminal_no\":\"" + terminal_no
									+ "\",\"start_time\":\"" + start_time
									+ "\",\"end_time\":\"" + end_time
									+ "\",\"ss_start_time\":\"" + ss_start_time
									+ "\",\"ss_end_time\":\"" + ss_end_time + "\"}";
							form.submit( {
								url : '/realware/addFinInfo.do',
								method : 'POST',
								timeout : 180000,
								waitTitle : '提示',
								params : {
									jsonData : data,
									add_admdiv_code : add_admdiv_code.substring(0,add_admdiv_code.indexOf("_"))
								},
								waitMsg : '后台正在处理中，请您耐心等候...',
								success : function(form, action) {
									Ext.Msg.show( {
										title : '成功提示',
										msg : action.result.mess,
										buttons : Ext.Msg.OK,
										icon : Ext.MessageBox.INFO
									});
									form.reset()
									createWindow.close();
									refreshData();
								},
								failure : function(form, action) {
									Ext.Msg.show( {
										title : '失败提示',
										msg : action.response.responseText,
										buttons : Ext.Msg.OK,
										icon : Ext.MessageBox.ERROR
									});
									refreshData();
								}
						});
						}
					}
				}, {

					text : '取消',
					handler : function() {
						this.up('form').getForm().reset();
						this.up('window').close();
					}
				}]
			})
		});
	}
	createWindow.show();
	createWindow.on('close',function(){
    Ext.getCmp('createForm').getForm().reset();
});
}

/*******************************************************************************
 * 修改财政
 */
var required2 = '<span style="color:red;font-weight:bold" data-qtip="Required">*</span>', editWindow;

function editAdmdiv() {
	var records = finPanel.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请选中一条财政信息！");
		return;
	} else if (records.length > 1) {
		Ext.Msg.alert("系统提示", "每次只能修改一条财政信息");
		return;
	}

	var manager_bank_id = records[0].get('manager_bank_id');
	var manager_bank_code = records[0].get('manager_bank_code');
	var manager_bank_name = records[0].get('manager_bank_name');
	
	if (!editWindow) {
		editWindow = Ext.widget('window', {
			title : '修改财政对话框',
			closeAction : 'hide',
			width : 400,
			height : no == true ? 390 : 440,
			layout : 'fit',
			resizable : true,
			modal : true,
			items : Ext.widget('form', {
				id : 'editForm',
				layout : {
					type : 'vbox',
					align : 'stretch'
				},
				border : false,
				width : 340,
				bodyPadding : 5,
				fieldDefaults : {
					labelAlign : 'right',
					labelWidth : 110
				},
				items : [{
						    xtype: 'hiddenfield',
						 	name: 'admdiv_id',
						 	id:'admdiv_id'
			    		 },
				         {
							id : 'admdiv_code2',
							name : 'admdiv_code',
							xtype : 'textfield',
							fieldLabel : '财政编码',
							maxLength : 9, 
							afterLabelTextTpl : required2,
							readOnly : true,
							allowBlank : false
						}, {
							id : 'admdiv_name2',
							name : 'admdiv_name',
							xtype : 'textfield',
							fieldLabel : '财政名称',
							afterLabelTextTpl : required2,
							allowBlank : false
						},	{
							xtype:"panel",
							border:false,
							bodyPadding :"0 0 5 0 ", 
							layout:"hbox",
							items:[{
								id : 'manager_bank2',
								xtype : 'textfield',
								fieldLabel : '主办行',
								afterLabelTextTpl : required,
								allowBlank : false,
								width:345,
								editable : false
							},{
								xtype:"button",
								text:"查询",
								handler:function(){
									var managerBankCmp = this.up("panel").down("textfield");
									choseBank(managerBankCmp); 
								}
							}]
						}, {
							id : 'fin_org_code2',
							name : 'fin_org_code',
							xtype : 'textfield',
							fieldLabel : '财政机构代码',
							afterLabelTextTpl : required2,
							allowBlank : false,
							msgTarget: 'side',
							regex : /^[0-9]*$/, 
							regexText: "财政机构代码格式只能为数字"
						}, {
							id : 'tre_code2',
							name : 'tre_code',
							xtype : 'textfield',
							fieldLabel : '国库主体代码',
							afterLabelTextTpl : required2,
							allowBlank : false,
							msgTarget: 'side',
							regex : /^[0-9]*$/, 
							regexText: "国库主体代码格式只能为数字"
						}, {
							id : 'pay_bank_name2',
							name : 'pay_bank_name',
							xtype : 'textfield',
							fieldLabel : '代理银行名称',
							afterLabelTextTpl : required2,
							allowBlank : false
						}, {
							id : 'pay_bank_no2',
							name : 'pay_bank_no',
							xtype : 'textfield',
							fieldLabel : '代理银行行号',
							afterLabelTextTpl : required2,
							allowBlank : false,
							msgTarget: 'side',
							regex : /^\d{12}$/, 
							regexText: "代理银行行号格式只能为数字并且为12位"
						}, {
							id : 'business_no2',
							name:'business_no',
							xtype : 'textfield',
							fieldLabel : '商务号',
							//allowBlank : true
							hidden : no
							
						}, {
							id : 'terminal_no2',
							name:'terminal_no',
							xtype : 'textfield',
							fieldLabel : '终端号',
							//allowBlank : true
							hidden : no
						}, new Ext.form.TimeField({
									id : 'start_time2',
									name : 'start_time',
									format : 'G:i:s',
									increment : 60,
									fieldLabel : '日始时间',
									afterLabelTextTpl : required2,
									allowBlank : false
								}), new Ext.form.TimeField({
									id : 'end_time2',
									name : 'end_time',
									format : 'G:i:s',
									increment : 60,
									fieldLabel : '日终时间',
									afterLabelTextTpl : required2,
									allowBlank : false
								}),new Ext.form.TimeField({
									id : 'ss_start_time2',
									name : 'ss_start_time',
									format : 'G:i:s',
									increment : 60,
									fieldLabel : '自助柜面日始时间',
									allowBlank : true
								}), new Ext.form.TimeField({
									id : 'ss_end_time2',
									name : 'ss_end_time',
									format : 'G:i:s',
									increment : 60,
									fieldLabel : '自助柜面日终时间',
									allowBlank : true
								})],
				buttons : [{
					text : '确定',
					handler : function() {
						if (this.up('form').getForm().isValid()) {
							var admdiv_id = Ext.getCmp('admdiv_id').getValue();
							var admdiv_code = Ext.getCmp("admdiv_code2")
									.getValue();
							var admdiv_name = Ext.getCmp("admdiv_name2")
									.getValue();
							
							var managerBankCmp = Ext.getCmp("manager_bank2");
							var manager_bank_id = managerBankCmp.manager_bank_id;
							var manager_bank_code = managerBankCmp.manager_bank_code;
							var manager_bank_name= managerBankCmp.manager_bank_name;
							
							var fin_org_code = Ext.getCmp("fin_org_code2")
									.getValue();
							var tre_code = Ext.getCmp("tre_code2").getValue();
							var pay_bank_name = Ext.getCmp("pay_bank_name2")
									.getValue();
							var pay_bank_no = Ext.getCmp("pay_bank_no2")
									.getValue();
							var business_no = Ext.getCmp("business_no2")
									.getValue();
							var terminal_no = Ext.getCmp("terminal_no2")
									.getValue();
							var start_time = Ext.getCmp("start_time2")
									.getRawValue();
							var end_time = Ext.getCmp("end_time2").getRawValue();
							//自助柜面日期
							var ss_start_time = Ext.getCmp("ss_start_time2").getRawValue();
							var ss_end_time = Ext.getCmp("ss_end_time2").getRawValue();

							var data = "{\"admdiv_code\":\"" + admdiv_code
									+ "\",\"admdiv_id\":\"" + admdiv_id
									+ "\",\"admdiv_name\":\"" + admdiv_name
									+ "\",\"manager_bank_id\":"
									+ manager_bank_id
									+ ",\"manager_bank_code\":\""
									+ manager_bank_code
									+ "\",\"manager_bank_name\":\""
									+ manager_bank_name
									+ "\",\"fin_org_code\":\"" + fin_org_code
									+ "\",\"tre_code\":\"" + tre_code
									+ "\",\"pay_bank_name\":\"" + pay_bank_name
									+ "\",\"pay_bank_no\":\"" + pay_bank_no
									+ "\",\"business_no\":\"" + business_no
									+ "\",\"terminal_no\":\"" + terminal_no
									+ "\",\"create_date\":\""
									+ records[0].get('create_date')
									+ "\",\"is_valid\":\""
									+ records[0].get('is_valid')
									+ "\",\"ss_start_time\":\"" + ss_start_time
									+ "\",\"ss_end_time\":\"" + ss_end_time
									+ "\",\"start_time\":\"" + start_time
									+ "\",\"end_time\":\"" + end_time + "\"}";
							var myMask = new Ext.LoadMask(Ext.getBody(), {
									msg : '后台正在处理中，请稍后....',
									removeMask : true // 完成后移除
								});
							myMask.show();
							Ext.Ajax.request({
										url : '/realware/editFinInfo.do',
										waitMsg : '后台正在处理中,请稍后....',
										method : 'POST',
										timeout : 180000, // 设置为3分钟
										jsonData : data,
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
							this.up('form').getForm().reset();
							this.up('window').close();
						}
					}
				}, {

					text : '取消',
					handler : function() {
						this.up('form').getForm().reset();
						this.up('window').close();
					}
				}]
			})
		});	
	};
	var managerBankCmp = Ext.getCmp('manager_bank2');
	managerBankCmp.manager_bank_id = manager_bank_id;
	managerBankCmp.manager_bank_code = manager_bank_code;
	managerBankCmp.manager_bank_name = manager_bank_name;
	managerBankCmp.setValue(manager_bank_code+"_"+manager_bank_name);
	// 根据name绑定
	Ext.getCmp('editForm').getForm().loadRecord(records[0]);
//	Ext.getCmp('manager_bank2').setValue(records[0].get('manager_bank_code') + "_" + records[0].get('manager_bank_name'));
	editWindow.show();
}

/**
 * 注销财政
 */
function logoutAdmdiv() {
	var myMask = new Ext.LoadMask(Ext.getBody(), {
		msg : '后台正在处理中，请稍后....',
		removeMask : true // 完成后移除
	});
	
	var records = finPanel.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请选中一条财政信息！");
		return;
	}
	
	if(records.length == finPanel.store.data.length){
		Ext.Msg.alert("系统提示","该财政不允许注销！");
		return;
	}
	
	var admCodeStr = "";
	// 选中的凭证的id数组，要传到后台
	for (var i = 0; i < records.length; i++) {
		admCodeStr += records[i].get("admdiv_code");
		if (i < records.length - 1)
			admCodeStr += ",";
	}
	

	Ext.Msg.confirm("系统提示","是否要注销中的财政信息？",function(e) {
		if (e == "yes") {
			myMask.show();
			var jsonArray = [];
			Ext.Array.each(records, function(model){
				jsonArray.push(model.data);
			});
			var data = Ext.encode(jsonArray);
			myMask.show();

			Ext.Ajax.request({
				url : '/realware/cancelFinInfo.do',
				waitMsg : '后台正在处理中,请稍后....',
				method : 'POST',
				timeout : 180000, // 设置为3分钟
//				async : false,// 添加该属性即可同步,
	//              jsonData : data,
				params : {
					admCodeStr : admCodeStr
				},
				// 提交成功的回调函数
				success : function(response, options) {
					succAjax(response, myMask);
					refreshData();
				},
				// 提交失败的回调函数
				failure : function(response, options) {
					failAjax(response, myMask);
				}
		});
		}
	});
	


}

/**
 * 删除财政
 */
function deleteAdmdiv() {
	var myMask = new Ext.LoadMask(Ext.getBody(), {
		msg : '后台正在处理中，请稍后....',
		removeMask : true // 完成后移除
	});
	var records = finPanel.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请选中一条财政信息！");
		return;
	}
//	var taskState = Ext.getCmp('taskState').getValue();
	if (records.length == finPanel.store.data.length && records.length == 1) {
		Ext.Msg.alert("系统提示", "仅剩最后一条财政信息,该财政不允许删除！");
		return;
	}
	
	var admCodeStr = "";
	// 选中的凭证的id数组，要传到后台
	for (var i = 0; i < records.length; i++) {
		admCodeStr += records[i].get("admdiv_code");
		if (i < records.length - 1)
			admCodeStr += ",";
	}
	
			//弹窗是否确定进行删除
	Ext.Msg.confirm("系统提示","是否要删除选中的财政信息？",function(e) {
		if (e == "yes") {
			myMask.show();
			var jsonArray = [];
			Ext.Array.each(records, function(model){
				jsonArray.push(model.data);
			});
			var data = Ext.encode(jsonArray);

			Ext.Ajax.request({
				url : '/realware/delFinInfo.do',
//				url : '/realware/delFinInfo_New.do',
				method : 'POST',
				timeout : 180000, // 设置为3分钟
//				async : false,// 添加该属性即可同步,
	//				jsonData : data,
				params : {
					admCodeStr : admCodeStr
				},
				// 提交成功的回调函数
				success : function(response, options) {
					succAjax(response, myMask);
					refreshData();
				},
				// 提交失败的回调函数
				failure : function(response, options) {
					failAjax(response, myMask);
				}
			});
		}
	});

}
/*******************************************************************************
 * 复制财政
 */
var required3 = '<span style="color:red;font-weight:bold" data-qtip="Required">*</span>', copyWindow;

function copyAdmdiv() {
	var records = finPanel.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请选中一条财政信息！");
		return;
	} else if (records.length > 1) {
		Ext.Msg.alert("系统提示", "每次只能修改一条财政信息");
		return;
	}

	if (!copyWindow) {
		copyWindow = Ext.widget('window', {
			title : '复制财政对话框',
			closeAction : 'hide',
			width : 400,
			height : no == true ? 350 : 390,
			layout : 'fit',
			resizable : true,
			modal : true,
			items : Ext.widget('form', {
				id : 'copyForm',
				layout : {
					type : 'vbox',
					align : 'stretch'
				},
				border : false,
				width : 340,
				bodyPadding : 5,
				fieldDefaults : {
					labelAlign : 'right',
					labelWidth : 85
				},
				items : [{
							id : 'admdiv_code3',
							name : 'admdiv_code',
							xtype : 'textfield',
							fieldLabel : '财政编码',
							afterLabelTextTpl : required3,
							allowBlank : false
						}, {
							id : 'admdiv_name3',
							name : 'admdiv_name',
							xtype : 'textfield',
							fieldLabel : '财政名称',
							afterLabelTextTpl : required3,
							allowBlank : false
						},/** {
							id : 'admdiv_model3',
							name : 'admdiv_model',
							xtype : 'combo',
							fieldLabel : '区划模板',
							displayField : 'admdiv_code',
							emptyText : '请选择',
							valueField : 'admdiv_code',
							store : admdivStore,
							afterLabelTextTpl : required3,
							allowBlank : false
						},**/ 
						{
							id : 'manager_bank3',
							name : 'manager_bank',
							xtype : 'combo',
							fieldLabel : '主办行',
							displayField : 'codename',
							emptyText : '请选择',
							valueField : 'id',
							store : comboStore,
							afterLabelTextTpl : required3,
							allowBlank : false
						}, {
							id : 'fin_org_code3',
							name : 'fin_org_code',
							xtype : 'textfield',
							fieldLabel : '组织机构代码',
							afterLabelTextTpl : required3,
							allowBlank : false
						}, {
							id : 'tre_code3',
							name : 'tre_code',
							xtype : 'textfield',
							fieldLabel : '国库主体代码',
							afterLabelTextTpl : required3,
							allowBlank : false
						}, {
							id : 'pay_bank_name3',
							name : 'pay_bank_name',
							xtype : 'textfield',
							fieldLabel : '代理银行名称',
							afterLabelTextTpl : required3,
							allowBlank : false
						}, {
							id : 'pay_bank_no3',
							name : 'pay_bank_no',
							xtype : 'textfield',
							fieldLabel : '代理银行行号',
							afterLabelTextTpl : required3,
							allowBlank : false
						}, {
							id : 'business_no3',
							name:'business_no',
							xtype : 'textfield',
							fieldLabel : '商务号',
							//allowBlank : true
							hidden : no
							
						}, {
							id : 'terminal_no3',
							name:'terminal_no',
							xtype : 'textfield',
							fieldLabel : '终端号',
							//allowBlank : true
							hidden : no
						}, new Ext.form.TimeField({
									id : 'start_time3',
									name : 'start_time',
									format : 'G:i:s',
									increment : 60,
									fieldLabel : '日始时间',
									afterLabelTextTpl : required3,
									allowBlank : false
								}), new Ext.form.TimeField({
									id : 'end_time3',
									name : 'end_time',
									format : 'G:i:s',
									increment : 60,
									fieldLabel : '日终时间',
									afterLabelTextTpl : required3,
									allowBlank : false
								})],
				buttons : [{
					text : '确定',
					handler : function() {
						if (this.up('form').getForm().isValid()) {
							var admdiv_code = Ext.getCmp("admdiv_code3")
									.getValue();
							var admdiv_name = Ext.getCmp("admdiv_name3")
									.getValue();
							var admdiv_model = Ext.getCmp("admdiv_model3")
									.getValue();
							var manager_bank_id = Ext.getCmp("manager_bank3")
									.getValue();
							var manager_bank = Ext.getCmp("manager_bank3").rawValue;
							var manager_bank_code = manager_bank.substring(0,
									manager_bank.indexOf("_"));
							var manager_bank_name = manager_bank
									.substring(manager_bank.indexOf("_")+1);
							var fin_org_code = Ext.getCmp("fin_org_code3")
									.getValue();
							var tre_code = Ext.getCmp("tre_code3").getValue();
							var pay_bank_name = Ext.getCmp("pay_bank_name3")
									.getValue();
							var pay_bank_no = Ext.getCmp("pay_bank_no3")
									.getValue();
							var business_no = Ext.getCmp("business_no3")
									.getValue();
							var terminal_no = Ext.getCmp("terminal_no3")
									.getValue();
							var start_time = Ext.getCmp("start_time3")
									.getRawValue();
							var end_time = Ext.getCmp("end_time3").getRawValue();

							var data = "{\"admdiv_code\":\"" + admdiv_code
									+ "\",\"admdiv_name\":\"" + admdiv_name
									+ "\",\"admdiv_model\":\"" + admdiv_model
									+ "\",\"manager_bank_id\":"
									+ manager_bank_id
									+ ",\"manager_bank_code\":\""
									+ manager_bank_code
									+ "\",\"manager_bank_name\":\""
									+ manager_bank_name
									+ "\",\"fin_org_code\":\"" + fin_org_code
									+ "\",\"tre_code\":\"" + tre_code
									+ "\",\"pay_bank_name\":\"" + pay_bank_name
									+ "\",\"pay_bank_no\":\"" + pay_bank_no
									+ "\",\"business_no\":\"" + business_no
									+ "\",\"terminal_no\":\"" + terminal_no
									+ "\",\"create_date\":\""
									+ records[0].get('create_date')
									+ "\",\"is_valid\":\""
									+ records[0].get('is_valid')
									+ "\",\"start_time\":\"" + start_time
									+ "\",\"end_time\":\"" + end_time + "\"}";
							var myMask = new Ext.LoadMask(Ext.getBody(), {
									msg : '后台正在处理中，请稍后....',
									removeMask : true // 完成后移除
								});
							myMask.show();
							Ext.Ajax.request({
										url : '/realware/copyFinInfo_New.do',
										waitMsg : '后台正在处理中,请稍后....',
										method : 'POST',
										timeout : 180000, // 设置为3分钟
										async : false,// 添加该属性即可同步,
										jsonData : data,
										// 提交成功的回调函数
										success : function(response, options) {
											succAjax(response, myMask);
											refreshData();
										},
										// 提交失败的回调函数
										failure : function(response, options) {
											failAjax(response, myMask);
										}
									});
							this.up('form').getForm().reset();
							this.up('window').close();
						}
					}
				}, {

					text : '取消',
					handler : function() {
						this.up('form').getForm().reset();
						this.up('window').close();
					}
				}]
			})
		});
	}
	// 根据name绑定
	Ext.getCmp('copyForm').getForm().loadRecord(records[0]);
	Ext.getCmp('manager_bank3').setValue(records[0].get('manager_bank_id'));
	copyWindow.show();
}
/*******************************************************************************
 * 刷新
 */
function refreshData() {
	finPanel.getStore().loadPage(1);
}


function importData(){
	Ext.widget('window', {
		title : '导入对话框',
		id : 'uploadWindow',
		width : 450,
		height : 120,
		modal : true,
		layout : 'fit',
		resizable : false,
		items : Ext.widget('form', {
			layout : 'form',
			fileUpload : true,
			items : [{
						name : 'file',
						fieldLabel : '文件(.admdata格式)',
						labelWidth: 120,
						xtype : 'filefield',
						id : 'uploadfilename',
						allowBlank : false,
						blankText : "请选择您要导入的.admdata文件",
						buttonText : '选择文件...'
					}],
			buttons : [{
				text : '导入',
				formBind : true,
				handler : function() {
					var form = this.up('form').getForm();
					if (form.isValid()) {
						if (!Ext.getCmp("uploadfilename").getValue()
								.match(".admdata$")) {
							Ext.Msg.show({
										title : '提示',
										msg : "请选择.admdata文件上传!",
										buttons : Ext.Msg.OK,
										icon : Ext.MessageBox.ERROR
									});
							return;
						};
						form.submit({
									url : '/realware/importAdmdivData.do',
									method : 'POST',
									timeout : 180000, // 设置为3分钟
									waitTitle : '提示',
									waitMsg : '正在导入文件，请您耐心等候...',
									success : function(form, action) {
										succForm(form, action);
										Ext.getCmp("uploadWindow").close();
										refreshData();
									},
									failure : function(form, action) {
										failForm(form, action);
									}
								});
					}
				}
			}, {
				text : '取消',
				handler : function() {
					this.up('form').getForm().reset();
					this.up('window').close();
				}
			}]
		})
	}).show();
}

/**
 * 导出财政相关配置
 * @memberOf {TypeName} 
 * @return {TypeName} 
 */
function exportData(){
	var records = finPanel.getSelectionModel().getSelection();
	if (records.length == 0) {
		Ext.Msg.alert("系统提示", "请选中一条财政信息！");
		return;
	} else if (records.length > 1) {
		Ext.Msg.alert("系统提示", "每次只能选择一条财政信息");
		return;
	}

	var exportDateDialog = new Ext.FormPanel({
		id:'exportForm',
	    frame:true,
	    defaultType: 'checkbox',
		items : [ {
						id :'admdiv',
						fieldLabel : '区划',
						checked : true
					},{
						id :'reflectObject',
						fieldLabel : '字段映射',
						checked : true
					},{
						id :'bizType',
						fieldLabel : '单据引擎配置',
						checked : true
					},{
						id :'privateParameter',
						fieldLabel : '私有参数',
						checked : true
					},{
						id :'element',
						fieldLabel : '基础要素',
						checked : true
					},,{
						id :'publicParameter',
						fieldLabel : '公有参数',
						checked : false
					},{
						id :'account',
						fieldLabel : '账户',
						checked : false
					},{
						id :'stamp',
						fieldLabel : '印章',
						checked : false
					}
				],
		buttons: [
					{
                  	  text: '确定',
                      handler: function() {
						exportAmdivData(records);
						Ext.getCmp('exportForm').getForm().reset();
						this.up('window').close();
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
		title : '导出财政配置',
		width : 180,
		height : 300,
		id : 'exportwin',
		layout : 'fit',
		resizable : false,
		modal : true,
		items : [ exportDateDialog ]
	}).show();
}

function exportAmdivData(records){
	var admdivCode = records[0].get('admdiv_code');
	var admdiv = Ext.getCmp('admdiv').getValue();
	var reflectObject = Ext.getCmp('reflectObject').getValue();
	var bizType = Ext.getCmp('bizType').getValue();
	var privateParameter = Ext.getCmp('privateParameter').getValue();
	var element = Ext.getCmp('element').getValue();
	var publicParameter = Ext.getCmp('publicParameter').getValue();
	var account = Ext.getCmp('account').getValue();
	var stamp = Ext.getCmp('stamp').getValue();
	window.location.href = '/realware/exportAdmdivData.do?admdivCode='+admdivCode+'&&admdiv='+admdiv+'&&' +
	'reflectObject='+reflectObject+'&&bizType='+bizType+'&&privateParameter='+privateParameter+'&&' +
	'element='+element+'&&publicParameter='+publicParameter+'&&account='+account+'&&stamp='+stamp+'';
}

function choseAdmdiv(){
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
						id : 'admdivCode',
						xtype : 'textfield',
						fieldLabel : '财政编码',
						labelWidth: 70,
						width : 250
						}, {
							text : '查询',
							xtype : 'button',
							handler : function() {
								copeAdmdivStore.load( {
									params : {
										admdiv_code :Ext.getCmp('admdivCode').getValue()
									}
								});
							    
							}
						}
						]
				}, {
					xtype : 'gridpanel',
					id : 'gridAdmdiv',
					viewConfig : {
						enableTextSelection : true
						},
					height : 300,
					store :copeAdmdivStore,
					columns : [{
								text : '财政编码',
								dataIndex : 'admdiv_code',
								width : '200'
							}, {
								text : '财政名称',
								dataIndex : 'admdiv_name',
								width : '200'
					}],
					listeners : {
						'itemdblclick' : function(view, records, item,
								index, e) {
							var codeandname=records.get("admdiv_code")+"_"+records.get("admdiv_name");
							Ext.getCmp('add_admdiv_code').setValue(codeandname);
							this.up('window').close();								
						}
					}
				}],
				buttons : [{
					text : '确定',
					handler : function() {
						var records =Ext.getCmp('gridAdmdiv').getSelectionModel().getSelection();
						if(records.length<1){
							Ext.Msg.alert("系统提示","请选择模板财政！");
							return;
						}
							
						var codeandname=records[0].get("admdiv_code")+"_"+records[0].get("admdiv_name");
						Ext.getCmp('add_admdiv_code').setValue(codeandname);
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
	copeAdmdivStore.load();
}



function hiddenForm(url, fields,fields2,myMask){
    var body = Ext.getBody(),
    frame = body.createChild({
        tag:'iframe',
        cls:'x-hidden',
        id:'hiddenform-iframe',
        name:'hiddenform-iframe'
    }),
    form = body.createChild({
        tag:'form',
        cls:'x-hidden',
        id:'hiddenform-form',
        action: url,
        method : 'post',
        target : Ext.isIE6 ? 'hiddenform-iframe' : '_blank'
    });
//    
//    	for(var el in fields) {
//    		var _el = form.createChild({
//            tag:'input',
//            type:'text',
//            cls:'x-hidden',
//            id: 'hiddenform-' + el,
//            name: el
//        });
//    	document.getElementById("hiddenform-" + el).value = Ext.encode(fields[el]);
//    }
//    	for(var e2 in fields2) {
//    		var _e2= form.createChild({
//            tag:'input',
//            type:'text',
//            cls:'x-hidden',
//            id: 'hiddenform-' + e2,
//            name: e2
//        });
//    	document.getElementById("hiddenform-" + e2).value = Ext.encode(fields2[e2]);
//    }
    form.dom.submit();
    form.remove();
    frame.remove();
};
function choseBank(managerBankCmp) {
	new pb.ChooseBankWindow({
		listeners:{
			afterchoose:function(window,bankInfo){
				var codeandname=bankInfo.bankcode+" "+bankInfo.bankname;
				 managerBankCmp.setValue(codeandname);
				 managerBankCmp.manager_bank_id = bankInfo.bankId;
				 managerBankCmp.manager_bank_code = bankInfo.bankcode;
				 managerBankCmp.manager_bank_name = bankInfo.bankname;
			}
		}
	}).show()
}
