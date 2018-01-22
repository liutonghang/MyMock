/***
 * 凭证打印窗口
 * @memberOf {TypeName} 
 */
Ext.define('pb.view.common.PrintVoucherWindow', {
	extend : 'Ext.window.Window',
	alias : 'widget.printvoucherwindow',
	title : '打印功能提示窗口',
	width : 350,
	height : 90,
	layout : 'fit',
	resizable : false,
	modal : true,
	/**
	 * 自定义方法
	 * @param {Object} records  选中记录
	 * @param {Object} ids       支付凭证id
	 * @param {Object} mee       当前控制器对象
	 * @param {Object} idName    id名称
	 * @param {Object} isFlow    是否走工作流
	 * @memberOf {TypeName} 
	 */
	init : function(records,ids,mee,idName,isFlow) {
		var me = this;
		var form = {
			xtype : 'form',
			frame : true,
			bodyPadding : 10,
				renderTo : Ext.getBody(),
			layout : {
				type : 'absolute',
				padding : 20
			},
			html : '<OBJECT CLASSID="clsid:4FC4CDDF-84E5-437C-8527-B23F6D70866C" style="position:absolute; visibility:hidden"  ID="CTJEstampOcx" CODEBASE="../Release/CTJEstampOcx.cab#version=1,0,0,0"></OBJECT>',
			bodyPadding : 10,
			items : [{
						xtype : 'button',
						text : '打印凭证',
						height : 25,
						width : 60,
						x : 20,
						y : 16,
						handler : function() {
							Ext.OCXUtil.doOCX(Ext.encode(ids), records[0].get("bill_type_id"),0,1);
						}
					},{
						xtype : 'button',
						text : '打印明细',
						height : 25,
						width : 60,
						x : 120,
						y : 16,
						handler : function() {
							Ext.OCXUtil.doOCX(Ext.encode(ids), records[0].get("bill_type_id"),1,1);
						}
					},{
						xtype : 'button',
						text : '打印成功',
						height : 25,
						width : 60,
						x : 220,
						y : 16,
						handler : function() {
							var myMask = new Ext.LoadMask(Ext.getBody(), {
										msg : '后台正在处理中，请稍后....',
										removeMask : true
									});
							myMask.show();
							Ext.Ajax.request({
								url : '/realware/printVoucherForDB.do',
								method : 'POST',
								timeout : 180000,
								params : {
									billIds : Ext.encode(ids),
									rePrint : isFlow,// 是否重复打印
									billTypeId : records[0].get("bill_type_id"),
									idName : idName,
									menu_id : Ext.PageUtil.getMenuId()
								},
								success : function(response, options) {
									Ext.PageUtil.succAjax(response,myMask);
									me.close();
									mee.refreshData();
								},
								failure : function(response, options) {
									Ext.PageUtil.failAjax(response,myMask);
								}
							})
						}
					}]

		};
	me.add(form);
}
});
