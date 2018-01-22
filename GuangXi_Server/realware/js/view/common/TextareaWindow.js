/**
 * 带多文本框的确认窗口,默认多文本框不能为空且最大长度40
 * @return {TypeName} 
 */
Ext.define('pb.view.common.TextareaWindow', {
	extend : 'Ext.window.Window',
	alias : 'widget.textareawindow',
	layout : 'fit',
	modal : true,
	width : 380,
	height : 150,
	resizable : false,
	textareaMaxLength : 40, // 多文本框最大长度
	textareaIsNull : false, // 多文本框是否可为空
	textareaValue : "",
	initComponent : function() {
		var me = this;
		Ext.applyIf(me, {
			items : [ {
				xtype: 'form',
                frame: true,
                bodyPadding: 10,
                items : [ {
                	xtype : 'textareafield',
					height : 65,
					width : 345,
					maxLength : me.textareaMaxLength,
					allowBlank : me.textareaIsNull,
					value : me.textareaValue
                } ],
                buttons : [ {
                	text : '确定',
					handler : function() {
                		if(me.getForm().isValid()){
                			var value = Ext.ComponentQuery.query('textareafield', me)[0].getValue();
                			if(/["'<>&]/.test(value)){
                				Ext.Msg.alert('系统提示',"退回原因不应含有\"'<>&等特殊字符!");
                			}else{
                			   me.fireEvent('confirmclick',me,value);
                			   me.close();
                			}
                			
                		}
					}
               	}, {
               		text : '取消',
					handler : function() {
						this.up('form').getForm().reset();	
						this.up('window').close();
					}
                } ]
			} ]
		});
		me.addEvents('confirmclick');
		me.callParent(arguments);
	},
	getForm : function() {
		return this.down('form').getForm();
	}
});
