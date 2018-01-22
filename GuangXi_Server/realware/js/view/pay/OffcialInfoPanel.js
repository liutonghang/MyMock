/***
 * 支付凭证面板
 * @memberOf {TypeName} 
 */
Ext.define('pb.view.pay.OffcialInfoPanel', {
	extend : 'Ext.panel.Panel',
	alias : 'widget.offcialPanel',
	layout: {
        type: 'vbox',
        align: 'center'
    },
    shrinkWrap : 0,
	frame : false,
	initComponent : function() {
		var buttons = Ext.StatusUtil.getAllButtons(this.config.buttonList);
		this.UItitle = this.config.name;
		this.dockedItems = [{
			xtype : 'buttongroup', //按钮区
			items : buttons
			}].concat(this.dockedItems);
		this.callParent(arguments);
	},
	getCols : function() {
		var cols = [ {
			xtype : 'rownumberer',
			width : 30,
			locked : true
		}, {
			text : '区县代码',
			dataIndex : 'admdiv_code',
			width : 100
		}, {
			text : '持卡人姓名',
			dataIndex : 'card_holder',
			width : 100
		}, {
			text : '身份证号',
			dataIndex : 'card_holder_no',
			width : 200
		}, {
			text : '预算单位编码',
			dataIndex : 'agency_code',
			width : 120
		}, {
			text : '预算单位名称',
			dataIndex : 'agency_name',
			width : 300
		},{
			text : '发卡行编码',
			dataIndex : 'card_bank_code',
			width : 150
		},{
			text : '卡号',
			dataIndex : 'card_no',
			width : 150
		},{
			text : '核实状态',
			dataIndex : 'deal_status',
			width : 150,
			renderer : function(value) {
				if(value<"0501"){
					return '未核实';
				}else if(value=="0502"){
					return '核实不符';
				}else{
					return '核实相符';
				}
			}
		}];
		return cols;
	}
});
