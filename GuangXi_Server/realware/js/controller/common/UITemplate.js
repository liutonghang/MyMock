/***
 * 列表设置处理类（功能维护界面应用）
 * @memberOf {TypeName} 
 */
Ext.define('pb.controller.common.UITemplate', {
	extend : 'Ext.app.Controller',
	stores : [ 'common.UITemplates', 'common.UITemplateDetails' ],
	models : [ 'common.UITemplate', 'common.UITemplateDetail' ],
	requires : [ 'pb.view.common.UITemplateList' ],
	refs : [ {
		ref : 'uilist',  //当前应用的名
		selector : 'uilist' //控件别名
	} ],
	init : function() {
		this.control( {
			//左侧树双击事件
			'uilist gridpanel[id=templatepanel]' : {
				itemclick : function(t, record, item, index, e, eOpts) {
					this.getStore('common.UITemplateDetails').removeAll();
					this.getStore('common.UITemplateDetails').insert(0,record.details().data.items);
				}
			},
			//删除列表视图模型
			'uilist button[id=deleteUI]' : {
				click : this.onDelUI
			},
			//刷新列表视图模型
			'uilist button[id=refreshUI]' : {
				click : function() {
					this.getStore('common.UITemplates').load();
					this.getStore('common.UITemplateDetails').removeAll();
				}
			}
		});
	},
	//删除函数
	onDelUI : function(){
		
	}
});
