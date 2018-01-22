Ext.define("pb.RefundAndClearForm",{
	extend:"pb.AdvanceAndClearForm",
	tbar:[{
		id : 'refund',
		text : '撤销',
		iconCls : 'sign',
		scale : 'small',
		handler:function(){
			this.refundClear();
		}
	},{
		id : 'query',
		text : '明细查询',
		iconCls : 'look',
		scale : 'small',
		handler:function(){
			this.queryDetail();
		}
	},{
		id : 'refresh',
		text : '刷新',
		iconCls : 'refresh',
		scale : 'small',
		handler:function(){
			this.refreshData();
		}
	}],
	beforeCreateFilter:function(filterCfg){
		var me = this;
		filterCfg.items[0]={
			id : 'taskState',
			fieldLabel : '当前状态',
			xtype : 'combo',
			displayField : 'status_name',
			dataIndex : 'task_status',
			emptyText : '请选择',
			valueField : 'status_code',
			labelWidth : 60,
			value:"002", 
			editable : false,
			store:{
				fields : ['status_name', 'status_code'],
				data:[{
					status_name:"已垫款",
					status_code:"002"
				},{
					status_name:"已撤销", 
					status_code:"003"
				}]
			},
			listeners : {
				'change' : function(sender,value){
					me.changeState(value);
					me.refreshData();
				}
			}
		};		
	},
	changeState:function(state){
		if(state=="002"){
			this.setDisabled("refund",false);
		}else{
			this.setDisabled("refund");
		}
	},
	refundClear:function(){
		var me = this;
		this.doClear({
			url:"/realware/refundZeroToAdvanceClear.do",
			success:function(){
				me.alert("退款清算成功"); 
			}
		});
	}
});
