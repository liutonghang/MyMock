document.write('<scr'+ 'ipt type="text/javascript" src="/realware/js/view/common/Network.js"></scr'+ 'ipt>');
Ext.define("pb.ChooseBankWindow",{
	extend:"Ext.Window",
	alias:"widget.chooseBankWindow",
	width : 400,
	height : 310,
	layout : 'fit',
	resizable : false,
	modal : true,
	bankInfo:null,
	initComponent:function(){
		var me =this;
		Ext.apply(this,{
			items : [{
				xtype:"form",
				bodyPadding : 5,
				items : [ {
					layout : 'hbox',
					defaults : {
						margins : '3 10 0 0'
					},
					height : 35,
					items : [ {
						xtype : 'textfield',
						fieldLabel : '快速查找',
						labelWidth : 70,
						width : 250
					}, {
						text : '查询',
						xtype : 'button',
						handler : function() {
							 me.refreshData();
						}
					}

					]
				},			{
					title : '网点信息',
//					width : 376,
					height: 205,
					xtype : 'NetworkTree',
					listeners : {
						'itemdblclick' : function(view, record, item, index, e) {
							me.chooseNode(record);
						}
					}
				} ]
				
			}],
			buttons : [ {
				text : '确定',
				handler : function() {
					me.chooseNode();
				}
			}, {
				text : '取消',
				handler : function() {
					this.up('window').close();
				}
			} ]
		});
		this.addEvents({"afterchoose":true});
		this.callParent(arguments);
	},
	refreshData:function(){
		var filterAry=[];
		var queryKey = this.down("textfield").getValue();
		if(queryKey){
			filterAry.push({
				codeOrName:["=",queryKey]
			})
		}
		var data = Ext.encode(filterAry);
		this.down("NetworkTree").getStore().load({
			method : 'post',
			params : {
				start : 0,
				pageSize : 200,
				jsonMap : data
			}
		});
	},
	chooseNode:function(rec){
		var me =this;
		if(!rec){
			var records=this.down("NetworkTree").getSelectionModel().getSelection();
			if(!records||records.length<1){
				return;
			}else{
				rec = records[0];
			}
		}
		var bankInfo={
			bankId:rec.raw.id,
			bankcode: rec.raw.code,
			bankname : rec.raw.text,
			bankLevel : rec.raw.level			 
		}
		this.fireEvent("afterchoose",me,bankInfo);
		this.close();
	}
	
});


