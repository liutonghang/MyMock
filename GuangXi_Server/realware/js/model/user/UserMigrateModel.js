/**
 *   Model 
 */
Ext.define('pb.model.user.UserMigrateModel',{
	extend:'Ext.data.Model',
	fields:[ {
			name:'log_id',
			type : 'String'
		},{
			name:'identity_no',
			type : 'String'
		},{
			name:'user_code',
			type : 'String'
		},{
			name:'out_bank_code',
			type : 'String'
		},{
			name:'out_user_code',
			type : 'String'
		},{
			name:'out_date',
			type : 'String'
		},{
			name:'in_bank_code',
			type : 'String'
		},{
			name :'in_user_code',
			type : 'String'
		},{
			name :'in_date',
			type : 'String'
		},{
			name :'migrate_flag',
			type : 'String'
		}
	 ]
});