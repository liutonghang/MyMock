/***
 * 卡变更签章发送明细列表
 * @memberOf {TypeName} 
 */
Ext.define('pb.view.pay.PrCardChangeSendPanel', {
	extend : 'Ext.panel.Panel',
	alias : 'widget.prCardChangeSendPanel',
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
		var cols = [{
						xtype : 'rownumberer',
						width : 30,
						locked : true
					}, {
						text : '凭证号',
						dataIndex : 'card_info_code',
						width : 150,
						hidden : false
					}, {
						text : '明细id',
						dataIndex : 'card_detail_id',
						width : 100,
						hidden : true
					}, {
						text : '区县代码',
						dataIndex : 'admdiv_code',
						width : 100
					}, {
						text : '预算单位编码',
						dataIndex : 'agency_code',
						width : 100
					}, {
						text : '预算单位名称',
						dataIndex : 'agency_name',
						width : 200
					}, {
						text : '姓名',
						dataIndex : 'card_holder',
						width : 150
					}, {
						text : '身份证号',
						dataIndex : 'card_holder_no',
						width : 200
					}, {
						text : '卡号',
						dataIndex : 'card_no',
						width : 150
					}, {
						text : '发送时间',
						dataIndex : 'send_date',
						width : 150
					}, {
						text : '变更类型',
						dataIndex : 'card_change_type',
						width : 150,
						renderer : function(value) {
							if(value==1){
								return '变更卡号';
							}else if(value==2){
								return '变更单位';
							}else if(value==3){
								return '变更卡状态';
							}else{
								return '';
							}
						}
					}];
		return cols;
	}
});
	
