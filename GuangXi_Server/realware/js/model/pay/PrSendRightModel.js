/***
 * 公务卡信息模型
 */
Ext.define('pb.model.pay.PrSendRightModel', {
	extend : 'Ext.data.Model',
	fields : [ { 
		name : 'card_detail_id',
		type : 'int'
	},{ 
		name : 'card_detail_code',
		type : 'int'
	},{ 
		name : 'card_info_id',
		type : 'int'
	},{ 
		name : 'card_info_code',
		type : 'string'
	},{ 
		name : 'vt_code',
		type : 'string'
	},{ 
		name : 'admdiv_code',
		type : 'string'
	},{ 
		name : 'year',
		type : 'int'
	},{ 
		name : 'bill_type_id',
		type : 'int'
	},{ 
		name : 'biz_type_id',
		type : 'int'
	},{ 
		name : 'last_ver',
		type : 'int'
	},{ 
		name : 'str_voucher_id',
		type : 'string'
	},{ 
		name : 'card_holder',
		type : 'string'
	},{ 
		name : 'card_holder_rank',
		type : 'string'
	},{ 
		name : 'card_holder_no',
		type : 'string'
	},{ 
		name : 'card_no',
		type : 'string'
	},{ 
		name : 'agency_code',
		type : 'string'
	},{ 
		name : 'agency_name',
		type : 'string'
	},{ 
		name : 'card_made_date',
		type : 'string'
	},{ 
		name : 'card_end_date',
		type : 'string'
	},{ 
		name : 'deal_result',
		type : 'int'
	},{ 
		name : 'tmp_acc_no',
		type : 'string'
	},{ 
		name : 'tmp_acc_bank',
		type : 'string'
	},{ 
		name : 'card_status',
		type : 'int'
	},{ 
		name : 'add_word',
		type : 'string'
	},{ 
		name : 'hold1',
		type : 'string'
	},{ 
		name : 'hold2',
		type : 'string'
	},{ 
		name : 'hold3',
		type : 'string'
	},{ 
		name : 'hold4',
		type : 'string'
	},{ 
		name : 'receive_date',
		type : 'string'
	},{ 
		name : 'sal_kind',
		type : 'int'
	},{ 
		name : 'deal_status',
		type : 'int'
	},{ 
		name : 'card_holder_sex',
		type : 'string'
	},{ 
		name : 'check_flag',
		type : 'int'
	},{ 
		name : 'old_card_no',
		type : 'string'
	},{ 
		name : 'card_change_type',
		type : 'string'
	},{ 
		name : 'old_agency_code',
		type : 'string'
	},{ 
		name : 'old_agency_name',
		type : 'string'
	},{ 
		name : 'old_card_status',
		type : 'string'
	},{ 
		name : 'card_info_code',
		type : 'string'
	},{ 
		name : 'send_date',
		type : 'string'
	}]
});
