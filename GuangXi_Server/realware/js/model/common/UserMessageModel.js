Ext.define('pb.model.common.UserMessageModel',{
   	extend:'Ext.data.Model',
   	fields:[ 
   	{
		name : 'sign_id',
		type : 'string'
	},
		{
		name : 'agency_code',
		type : 'string'
	}, { 
		name : 'agency_name',
		type : 'string'
	},{
		name : 'org_code',
		type : 'string'
	}, {
		name : 'account_code',
		type : 'double'
	}, {
		name : 'user_login_code',
		type : 'string'
	}, {
		name : 'user_name',
		type : 'string'
	}, {
		name : 'document_type',
		type : 'string'
	}, {
		name : 'paper_no',
		type : 'string'
	}, {
		name : 'phone_no',
		type : 'string'
	}, {
		name : 'address',
		type : 'string'
	}, {
		name : 'e_mail',
		type : 'string'
	}, {
		name : 'remark',
		type : 'string'
	} 
	 ]
});
