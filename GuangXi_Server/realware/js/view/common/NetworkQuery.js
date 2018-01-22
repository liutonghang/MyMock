/***
 * 网点查询窗口
 * @memberOf {TypeName} 
 */
Ext.define('js.view.common.NetworkQuery', {
	extend : 'Ext.window.Window',
	alias : 'widget.netWorkQuery',			
	requires : [ 'js.view.common.Network'],
	layout : 'fit',
	modal : true,
	title : '网点查询',
	resizable : false,
	draggable : false,
	width : 400,
	height : 310,
	initComponent : function() {
		var me = this;
		Ext.applyIf(me, {
			items : [ {
				layout : 'border',
				items : [ {
					region : 'north',
					bodyPadding : 5,
					xtype : 'form',
					layout: {
        				type: 'table',
        				columns: 2
    				},
    				defaults : {
						labelWidth : 90,
						style : 'margin-left:5px;margin-bottom:5px;margin-right:5px;'
					},
					items : [
							{
							id : 'bankcode',
							xtype : 'textfield',
							fieldLabel : '快速查找',
							labelWidth: 70,
							width : 250
						}, {
							text : '查询',
							xtype : 'button',
							handler : function() {
							    loadNetWorkByNetMsg('loadnetworkTree','bankcode') ;
							}
						}
					 ]
				}, {
					region : 'center',
					title : '网点信息',
					xtype : 'form',
					bodyPadding : 0,
					layout: {
        				type: 'table',
        				columns: 2
    				},
    				defaults : {
						labelWidth : 90,
						width : 240,
						style : 'margin-left:5px;margin-bottom:5px;margin-right:35px;'
					},
					items : [{				
					id : 'loadnetworkTree',
					width :375,
					xtype : 'NetworkTree',
					isLoadAll:true,
					listeners : {
						'itemdblclick' : function(view, record, item,
								index, e) {
//							bankid= records[0].raw.id;
//							bankCode = records[0].raw.code;
//							bankName = records[0].raw.text;
//							bankLevel = records[0].raw.level; 
//							var codeandname=loadBankCode+" "+loadBankName;
//							Ext.getCmp('adduser_bank_code').setValue(codeandname);
//							this.up('window').close();								
						}
					}
				}]
				} ],
				buttons : [ {
					id : 'selectNetWork',
					text : '确认'
				},{
					text : '取消',
					handler : function() {
						me.close();
					}
				} ]
			} ]
		});
		me.callParent(arguments);
	}
	
});

//根据网点信息加载网点
function loadNetWorkByNetMsg(id,netMsg){
	var jsonMap = "[{";
	var codeOrName = Ext.getCmp(netMsg).getValue();
	if (!Ext.isEmpty(codeOrName)) {
		var jsonStr = [];
		jsonStr[0] = "=";
		jsonStr[1] = codeOrName;
		jsonMap = jsonMap + "\"codeOrName\":" + Ext.encode(jsonStr) + ",";
	}

	data = jsonMap + "}]";

	Ext.getCmp(id).getStore().load({
				method : 'post',
				params : {
					start : 0,
					pageSize : 200,
					jsonMap : data
				}
			});
}
