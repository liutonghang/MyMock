/**
 * * 关于文件的导出
 * 
 * @param {Object}
 *            isAll 是否全部导出
 * @param {String}
 *            url 请求的url
 * @param {String}
 *            type 导入文件的类型
 * @param {Array}
 *            header 要导出数据项
 */
function exportFile(url, type, header, gridPanel1) {
	var cgp = getCheckboxGroup(header);
	// 用来存放选中的数据
	var data = null;
	// 部分导入
	if (gridPanel1 != undefined) {
		var records = gridPanel1.getSelectionModel().getSelection();
		if (records.length == 0) {
			Ext.Msg.alert("系统提示", "没有可导出的数据！");
			return;
		}
		var jsonArray = [];
		Ext.Array.each(records, function(model) {
					jsonArray.push(model.data);
				});
		data = Ext.encode(jsonArray);
	}
	Ext.widget('window', {
		title : '导出对话框',
		id : 'exportWindow',
		width : 400,
		height : 420,
		modal : true,
		layout : 'fit',
		resizable : false,
		items : Ext.widget('form', {
					layout : 'form',
					border : false,
					width : 380,
					height : 300,
					bodyStyle : 'padding:20 5 5 5',
					frame : true,
					fieldDefaults : {
						labelAlign : 'right',
						labelWidth : 85
					},
					items : [{
								xtype : 'textfield',
								fieldLabel : "选择要导出的列"
							}, {
								id : 'checkAll',
								xtype : 'checkbox',
								fieldLabel : '全选/全不选',
								checked : true,
								handler : function() {
									checkAllOrCheckNo(cgp, this.checked);
								}
							}, cgp],
					buttons : [{
						text : '导出',
						formBind : true,
						handler : function() {
							var form = this.up('form').getForm();
							if (form.isValid()) {
								var checkedData = getChecked(cgp);
								if (checkedData[0] == '[]') {
									Ext.Msg.show({
												title : '提示',
												msg : "请选择要导出的列",
												buttons : Ext.Msg.OK,
												icon : Ext.MessageBox.ERROR
											});
									return;
								};
								form.submit({
											url : url,
											method : 'POST',
											timeout : 18000, // 设置为3分钟
											waitTitle : '提示',
											params : {
												"filedNames" : JSON.stringify(checkedData[0]),
												"remarkNames" : JSON.stringify(checkedData[1]),
												"checkedData" : JSON.stringify(checkedData),
												"type" : type,
												"records" : data
											},
											waitMsg : '正在导入文件，请您耐心等候...',
											success : function(form, action) {
												succForm(form, action);
												Ext.getCmp("uploadWindow").close();
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
 * 
 * @param {String} header 列英文名和列中文名
 */
function getCheckboxGroup(header) {
	// 列
	var headers = header.split(",");
	//存放数据
	var items = [];

	// 循环列
	for (var i = 0; i < headers.length; i++) {
		// 每列
		var h = headers[i];
		// 获得每列的属性
		var hs = headers[i].split("|");
		// 中文名
		var zname = hs[0];
		// 英文名
		var ename = hs[1];

		var col = {
			boxLabel : zname,
			name : ename,
			inputValue : ename,
			checked : true,
			anchor : "30%"
		};;
		items.push(col);
	}
	var cbp = new Ext.form.CheckboxGroup({
				columnWidth : 1,
				name : 'cbg',
				id : 'cbg',
				xtype : 'checkboxgroup',
				fieldLabel : '列名',
				columns : [.33, .33, .33],
				// anchor:"95%",
				msgTarget : "side",
				items : items
			});
	return cbp;
}
/**
 * 获得被选中的数据项
 * @param {Object} cgp 传入CheckboxGroup对象
 */
function getChecked(cgp) {
	//定义一个二维数组用来保存选中的数据内容
	var checkedData = new Array();
	checkedData[0] = new Array();//存放code
	checkedData[1] = new Array();//用来存放中文名
	cgp.items.each(function(f) {
				if (f.checked) {
					checkedData[0].push(f.name);
					checkedData[1].push(f.boxLabel);
				}
			});
	return checkedData;
}
/**
 * 全选/全部选
 * @param {Object} cgp
 * @param {Object} isChecked
 */
function checkAllOrCheckNo(cgp, isChecked) {
	cgp.items.each(function(f) {
				f.setValue(isChecked);
			});
}
