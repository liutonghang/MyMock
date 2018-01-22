/*******************************************************************************
 * 公务卡信息模型
 */
Ext.define('pb.model.pay.OfficialInfoChangeModel', {
			extend : 'Ext.data.Model',
			fields : [{
						name : 'id',
						type : 'int'
					}, {
						name : 'card_holder_no',
						type : 'string'
					}, {
						name : 'card_holder',
						type : 'string'
					}, {
						name : 'old_card_no',
						type : 'string'
					}, {
						name : 'card_no',
						type : 'string'
					}, {
						name : 'agency_code',
						type : 'string'
					}, {
						name : 'agency_name',
						type : 'string'
					}, {
						name : 'card_status',
						type : 'string'
					}, {
						name : 'card_type',
						type : 'string'
					}, {
						name : 'receive_data',
						type : 'string'
					}, {
						name : 'admdiv_code',
						type : 'string'
					}]
		});
		