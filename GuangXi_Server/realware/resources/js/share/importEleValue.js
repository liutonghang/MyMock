/**
 * 专用于导入基础要素
 * 需要指定级次
 * 
 * @param {Object}
 *            url 请求的url
 * @param {Object}
 *            type 导入文件的类型
 */
function importFile(url, type, admdiv) {
	// 如果没有传入类型，则默认为txt类型
	if (Ext.isEmpty(type)) {
		type = 'txt';
	}
	if (Ext.isEmpty(admdiv)) {
		admdiv = comboAdmdiv.data.length > 0 ? 
				comboAdmdiv.data.getAt(0).get("admdiv_code")
				: "";
	}
	Ext.widget('window', {
		title : '文件导入对话框',
		id : 'uploadWindow',
		width : 350,
		height : 200,
		modal : true,
		layout : 'fit',
		resizable : false,
		items : Ext.widget('form', {
					layout : 'form',
					fileUpload : true,
					border : false,
					width : 380,
					height : 100,
					bodyStyle : 'padding:10 10 5 5',
					frame : true,
					fieldDefaults : {
						labelAlign : 'right',
						labelWidth : 80
					},
					items : [{
								id:'admdivCode_',
								name:'admdivCode',
								fieldLabel : '所属财政',
								xtype : 'combo',
								displayField : 'admdiv_name',
								emptyText : '请选择',
								valueField : 'admdiv_code',
								labelWidth : 60,
								width : 34,
								store : comboAdmdiv,
								value : admdiv,
								editable : false
								}, {
								id : 'rule',
								name : 'rule',
								fieldLabel : ' 请输入级次规则(例如：\'1-1-1\')',
								xtype : 'textfield',
								value : '',
								labelWidth : 90
								},{
								name : 'file',
								fieldLabel : '文件(*.' + type + ')',
								xtype : 'filefield',
								id : 'uploadfilename',
								allowBlank : false,
								blankText : "请选择您要导入的.'+type+'文件",
								buttonText : '选择文件...'
								}
								],
					buttons : [{
						text : '导入',
						formBind : true,
						handler : function() {
							var form = this.up('form').getForm();
							if (form.isValid()) {
								if (!Ext.getCmp("uploadfilename").getValue()
										.match("." + type + "$")) {
									Ext.Msg.show({
												title : '提示',
												msg : "请选择" + type + "类型文件上传!",
												buttons : Ext.Msg.OK,
												icon : Ext.MessageBox.ERROR
											});
									return;
								};
									Ext.MessageBox.confirm('导入文件提示', '确认导入？', function(button,text){
									if(button=='yes'){
										form.submit({
											url : url,
											method : 'post',
											timeout : 18000, // 设置为3分钟
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