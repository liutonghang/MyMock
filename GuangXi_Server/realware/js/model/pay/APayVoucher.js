/***
 * 支付凭证模型
 */
Ext.define('pb.model.pay.APayVoucher', {
	extend : 'Ext.data.Model',
	fields : [ {
		name : 'urgent_flag',
		type : 'String'
	}, {
		name : 'actionBankno',
		type : 'String'
	},{
		name : 'payee_account_bank_no',
		type : 'string'
	}, {
		name : 'pay_voucher_code',
		type : 'string'
	}, {
		name : 'vou_date',
		type : 'string'
	}, {
		name : 'pay_amount',
		type : 'double'
	}, {
		name : 'pay_refund_amount',
		type : 'double'
	},{
		name : 'payee_account_no',
		type : 'string'
	}, {
		name : 'payee_account_name',
		type : 'string'
	}, {
		name : 'payee_account_bank',
		type : 'string'
	}, {
		name : 'pay_account_no',
		type : 'string'
	}, {
		name : 'pay_account_name',
		type : 'string'
	}, {
		name : 'pay_account_bank',
		type : 'string'
	}, {
		name : 'pay_bank_code',
		type : 'string'
	}, {
		name : 'pay_bank_name',
		type : 'string'
	}, {
		name : 'clear_bank_code',
		type : 'string'
	}, {
		name : 'clear_bank_name',
		type : 'string'
	}, {
		name : 'checkNo',
		type : 'string'
	}, {
		name : 'fund_deal_mode_code',
		type : 'string'
	}, {
		name : 'fund_deal_mode_name',
		type : 'string'
	}, {
		name : 'fund_type_code',
		type : 'string'
	}, {
		name : 'fund_type_name',
		type : 'string'
	}, {
		name : 'pay_type_code',
		type : 'string'
	}, {
		name : 'pay_type_name',
		type : 'string'
	}, {
		name : 'set_mode_code',
		type : 'string'
	}, {
		name : 'set_mode_name',
		type : 'string'
	}, {
		name : 'pay_summary_code',
		type : 'string'
	}, {
		name : 'pay_summary_name',
		type : 'string'
	}, {
		name : 'exp_func_code',
		type : 'string'
	}, {
		name : 'exp_func_name',
		type : 'string'
	}, {
		name : 'exp_eco_code',
		type : 'string'
	}, {
		name : 'exp_eco_name',
		type : 'string'
	}, {
		name : 'task_id',
		type : 'int'
	}, {
		name : 'pay_voucher_id',
		type : 'int'
	}, {
		name : 'bill_type_id',
		type : 'int'
	}, {
		name : 'last_ver',
		type : 'string'
	}, {
		name : 'return_reason',
		type : 'string'
	}, {
		name : 'pb_set_mode_code',
		type : 'string'
	}, {
		name : 'pb_set_mode_name',
		type : 'string'
	}, {
		name : 'pay_mgr_code',
		type : 'string'
	}, {
		name : 'pay_mgr_name',
		type : 'string'
	}, {
		name : 'audit_remark',
		type : 'string'
	}, {
		name : 'remark',
		type : 'string'
	}, {
		name : 'admdiv_code',
		type : 'string'
	}, {
		name : 'vt_code',
		type : 'string'
	}, {
		name : 'hold1',
		type : 'string'
	}, {
		name : 'hold2',
		type : 'string'
	}, {
		name : 'hold3',
		type : 'string'
	}, {
		name : 'hold4',
		type : 'string'
	}, {
		name : 'city_code',
		type : 'string'
	}, {
		name : 'bankbusinesstype',
		type : 'string'
	}, {
		name : 'agent_business_no',
		type : 'string'
	}, {
		name : 'ori_pay_voucher_code',
		type : 'string'
	}, {
		
		name : 'pay_date',
		type : 'date',
		//modify by cyq
		convert: function(v){
			if(!v){  
                 return "";  
            }  
			if(Ext.isDate(v)){
				 return new Date(v).format("Y-m-d H:i:s");  
			}else{  
				 return v;  
			}
		}
	}, {
		name : 'refund_type',
		type : 'int'
	}, {
		name : 'agency_code',
		type : 'string'
	}, {
		name : 'agency_name',
		type : 'string'
	}, {
		name : 'sup_dep_code',
		type : 'string'
	}, {
		name : 'sup_dep_name',
		type : 'string'
	}, {
		name : 'voucher_status',
		type : 'string'
	}, {
		name : 'voucher_status_des',
		type : 'string'
	}, {
		name : 'ori_voucher_id',
		type : 'int'
	}, {
		name : 'tax_bill_no',
		type : 'string'
	}, {
		name : 'taxayer_id',
		type : 'string'
	}, {
		name : 'tax_org_code',
		type : 'string'
	},
	 { 
		name : 'business_type',
		type : 'int'
	} ]
});
