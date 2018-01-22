/***
 * 公务卡开卡主单列表
 * @memberOf {TypeName} 
 */
Ext.define('pb.view.pay.OfficialCardMakePanel', {
	extend : 'pb.view.pay.PayVoucherPanel',
	alias : 'widget.officialCardMakePanel',
	getCols : function() {
		var cols = [{
						xtype : 'rownumberer',
						width : 30,
						locked : true
//					}, {
//						text : '凭证号',
//						dataIndex : 'card_info_code',
//						width : 150,
//						hidden : false
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
						text : '信息类别',
						dataIndex : 'card_change_type',
						renderer : function(value){
							if(value == '1'){
								return '变更卡号';
							}else if(value == '2'){
								return '变更单位';
							}else if(value == '3'){
								return '变更卡状态';
							}else{
								return '新增卡';
							}
						},
						width : 150
					}, {
						text : '发送时间',
						dataIndex : 'send_date',
						width : 150
					}];
		return cols;
	}
});
	
