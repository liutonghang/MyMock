/***
 * 文件导入窗口
 * @memberOf {TypeName} 
 */
Ext.define('pb.view.common.ImportFileWindow', {
	extend : 'Ext.window.Window',
	alias : 'widget.importfilewindow',
	layout : 'fit',
	title:'文件导入窗口',
	height : 130,
	width : 350,
	modal : true,
	/**
	 * 自定义方法
	 * @param {Object} url   请求路径
	 * @param {Object} mee    当前控制器对象
	 * @param {Object} type   文件类型
	 * @memberOf {TypeName} 
	 * @return {TypeName} 
	 */
	init : function(url, mee, type,isRefreshPage) {
		var me = this;
		// 如果没有传入类型，则默认为txt类型
		if (type == undefined)
			var type = 'txt';
		var form = {
			xtype : 'form',
			frame : true,
			bodyPadding : 10,
			items : [ {
				name : 'file',
				fieldLabel : '文件(.' + type + '格式)',
				xtype : 'filefield',
				id : 'uploadfilename',
				width : 350,
				labelWidth : 120,
				anchor: '100%',
				allowBlank : false,
				blankText : "请选择您要导入的.'+type+'文件",
				buttonText : '选择文件...'
			} ],
			buttons : [{
						text : '导入',
						formBind : true,
						handler : function() {
							var form = this.up('form').getForm();
							if (form.isValid()) {
								if (!Ext.getCmp("uploadfilename").getValue().match(
										"." + type + "$")) {
									Ext.Msg.show( {
										title : '提示',
										msg : "请选择" + type + "类型文件上传!",
										buttons : Ext.Msg.OK,
										icon : Ext.MessageBox.ERROR
									});
									return;
								};
								form.submit( {
									url : url,
									method : 'post',
									timeout : 18000, // 设置为3分钟
									waitTitle : '提示',
									waitMsg : '正在导入文件，请您耐心等候...',
									success : function(form, action) {
										Ext.PageUtil.succForm(form, action);
										me.close();
										if(mee && mee.refreshData) {
											mee.refreshData();
										}
										if(isRefreshPage){
											refreshPage();
										}
									},
									failure : function(form, action) {
										Ext.PageUtil.failForm(form, action);
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
					} ]
		};
	me.add(form);
},
getForm : function() {
	return this.down('form').getForm();
}
});
