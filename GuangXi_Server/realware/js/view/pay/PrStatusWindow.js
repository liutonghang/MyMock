/***
 * 功能模块维护窗口
 * @memberOf {TypeName} 
 */
Ext.define('pb.view.pay.PrStatusWindow', {
	extend : 'Ext.window.Window',
	alias : 'widget.prStatusWindow',
	layout : 'fit',
	autoHeight:true,
    width: 350,
    modal: true,
    title: '卡状态维护',
	initComponent: function() {
		  var me = this;
		  Ext.applyIf(me, {
            items: [ {
				xtype: 'form',
                frame: false,
                bodyPadding: 30,
                defaultType: 'textfield',
				items : [{
							id:'card_status',
							fieldLabel : '卡状态',
							xtype : 'combo',
							displayField : 'name',
							valueField : 'value',
							editable : false,
							enable : true,
							readOnly : false,
							store : Ext.create('Ext.data.Store', {
								fields : [ 'name', 'value' ],
								data : [  {
										"name" : "停用",
										"value" : "2"
									}, {
										"name" : "注销",
										"value" : "3"
									}]
								})
						},{
							id:'affirm_card_status',
							fieldLabel : '确认卡状态',
							xtype : 'combo',
							displayField : 'name',
							valueField : 'value',
							editable : false,
							enable : true,
							readOnly : false,
							store : Ext.create('Ext.data.Store', {
								fields : [ 'name', 'value' ],
								data : [ {
										"name" : "停用",
										"value" : "2"
									}, {
										"name" : "注销",
										"value" : "3"
									}]
								})
						},{
			           		id: 'OriStatus',
			           		anchor: '100%',
			           		readOnly :true,
			           		fieldLabel: '原状态'
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
			           	}
						],
				buttons : [ {
					id : 'parentSave',
					text : '确定'
				}, {
					id : 'statusClose',
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
