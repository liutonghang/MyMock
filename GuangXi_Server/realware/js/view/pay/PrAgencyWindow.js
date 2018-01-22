/***
 * 功能模块维护窗口
 * @memberOf {TypeName} 
 */
Ext.define('pb.view.pay.PrAgencyWindow', {
	extend : 'Ext.window.Window',
	alias : 'widget.prAgencyWindow',
	layout : 'fit',
	autoHeight:true,
    width: 350,
    modal: true,
    title: '单位信息维护窗口',
	initComponent: function() {
		  var me = this;
		  Ext.applyIf(me, {
            items: [ {
            	xtype: 'form',
                frame: false,
                bodyPadding: 30,
                defaultType: 'textfield',
				items : [{
							id:'pr_agency_code',
							fieldLabel : '预算单位代码',
							xtype: 'textfield',
							name : 'name',
							labelWidth: 120,
							allowBlank : false
						}, {
							id:'pr_agency_name',
							fieldLabel : '预算单位名称',
							xtype: 'textfield',
							name : 'name',
							labelWidth: 120,
							allowBlank : false
						}, {
							id:'affirm_agency_code',
							fieldLabel : '确认单位代码',
							xtype: 'textfield',
							name : 'name',
							labelWidth: 120,
							allowBlank : false
						}, {
							id:'affirm_agency_name',
							fieldLabel : '确认单位名称',
							xtype: 'textfield',
							name : 'name',
							labelWidth: 120,
							allowBlank : false
						},{
			           		id: 'AgencyCode',
			           		anchor: '100%',
			           		readOnly :true,
			           		fieldLabel: '原单位代码'
						},{
			           		id: 'AgencyName',
			           		anchor: '100%',
			           		readOnly :true,
			           		fieldLabel: '原单位名称'
						},{
			           		id: 'CardNo',
			           		anchor: '100%',
			           		readOnly :true,
			           		fieldLabel: '卡号'
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
//			           	},{
//			           		id : 'AgencyCode',
//			           		anchor: '100%',
//			           		readOnly :true,
//			           		fieldLabel: '预算单位编码'
//			           	},{
//			           		id : 'AgencyName',
//			           		anchor: '100%',
//			           		readOnly :true,
//			           		fieldLabel: '预算单位名称'
			           	},{
			           		id : 'CardType',
			           		fieldLabel: '公务卡类型',
			           		readOnly :true,
			           		anchor: '100%'
			           	}],
				buttons : [ {
								id : 'parentSave',
								text : '确定'
							}, {
								id : 'agencyClose',
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
