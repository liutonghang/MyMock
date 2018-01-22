/***
 * 功能模块维护窗口
 * @memberOf {TypeName} 
 */
Ext.define('pb.view.pay.OffiChangeWindow', {
	extend : 'Ext.window.Window',
	alias : 'widget.offiChangeWindow',
	layout : 'fit',
	autoHeight:true,
    width: 350,
    modal: true,
    title: '卡号维护窗口',
	initComponent: function() {
		  var me = this;
		  Ext.applyIf(me, {
            items: [ {
				xtype: 'form',
                frame: false,
                bodyPadding: 30,
                defaultType: 'textfield',
				items : [{
					id:'card_no',
					fieldLabel : '卡号',
					xtype: 'textfield',
					anchor: '100%',
					name : 'name',
//					regex:/^(628)[0-9]{13}$/,
//					regexText:'必须是数字且以628开头且长度为16位 .',
					labelWidth: 100,
					allowBlank : false
				}, {
					id:'affirm_card_no',
					fieldLabel : '确认卡号',
					xtype: 'textfield',
					anchor: '100%',
					name : 'name',
//					regex:/^(628)[0-9]{13}$/,
//					regexText:'必须是数字且以628开头且长度为16位 .',
					labelWidth: 100,
					allowBlank : false
				},{
	           		id: 'OriCardNo',
	           		anchor: '100%',
	           		readOnly :true,
	           		fieldLabel: '原卡号'
				},{
	           		id: 'CardHolder',
	           		anchor: '100%',
	           		readOnly :true,
	           		fieldLabel: '持卡人姓名'
	           	}, {
	           		id: 'CardHolderNo',
	           		fieldLabel: '身份证号码',
	           		maxLength:18,
	           		anchor: '100%',
	           		readOnly :true,
	           		enforceMaxLength:true,
	           		regex : /^(\d{15}$|^\d{18}$|^\d{17}(\d|X|x))$/,
	           		regexText: "身份证编号格式错误"
	           	},{
	           		id : 'AgencyCode',
	           		anchor: '100%',
	           		readOnly :true,
	           		fieldLabel: '预算单位编码'
	           	},{
	           		id : 'AgencyName',
	           		anchor: '100%',
	           		readOnly :true,
	           		fieldLabel: '预算单位名称'
	           	},{
	           		id : 'CardType',
	           		fieldLabel: '公务卡类型',
	           		readOnly :true,
	           		anchor: '100%',
	           		renderer : function(value) {
	    				if(value==1){
	    					return '个人卡';
	    				}else if(value==2){
	    					return '公用卡';
	    				}else{
	    					return '';
	    				}
	    			}
	           	}],
			buttons : [ {
				id : 'parentSave',
				text : '确定'
			}, {
				id : 'parentClose',
				text : '取消'
			} ]
		} ]
	})
	me.callParent(arguments);
	},
	getForm : function() {
		return this.down('form').getForm();
	}
});
