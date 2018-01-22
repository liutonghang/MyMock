/***
 * 工资卡号信息列表
 * @memberOf {TypeName} 
 */
Ext.define('pb.view.pay.OfficialInfoChangePanel', {
	id : 'OfficialInfoChangePanel',
	extend : 'pb.view.pay.PayVoucherPanel',
	alias : 'widget.officialInfoChangePanel',
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
			text : '姓名',
			dataIndex : 'card_holder',
			width : 100
		}, {
			text : '身份证号',
			dataIndex : 'card_holder_no',
			width : 200
		}, {
			text : '卡号',
			dataIndex : 'card_no',
			width : 200
		}, {
			text : '预算单位代码',
			dataIndex : 'agency_code',
			width : 200
		}, {
			text : '预算单位名称',
			dataIndex : 'agency_name',
			width : 200
		}, {
			text : '原单位代码',
			dataIndex : 'old_agency_code',
			width : 200
		}, {
			text : '原单位名称',
			dataIndex : 'old_agency_name',
			width : 200
		}, {
			text : '原卡号',
			dataIndex : 'ori_card_no',
			width : 200
		}, {
			text : '卡类型',
			dataIndex : 'card_type',
			width : 200,
			renderer : function(value) {
				if(value==1){
					return '个人卡';
				}else if(value==2){
					return '公用卡';
				}else{
					return '';
				}
			}
		}, {
			text : '卡状态',
			dataIndex : 'card_status',
			width : 200,
			renderer : function(value) {
				if(value==1){
					return '正常';
				}else if(value==2){
					return '停用';
				}else if(value==3){
					return '注销';
				}else{
					return '';
				}
			}
		}, {
			text : '原状态',
			dataIndex : 'old_card_status',
			width : 200,
			renderer : function(value) {
				if(value==1){
					return '正常';
				}else if(value==2){
					return '停用';
				}else if(value==3){
					return '注销';
				}else{
					return '';
				}
			}
		}];
		return cols;
	}
});
