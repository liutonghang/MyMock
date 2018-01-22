/**
 *   Model 
 */
Ext.define('pb.model.user.UserModel',{
	extend:'Ext.data.Model',
	fields:[ 
		{
			name:'sign_id',
			type : 'String'
		},{
			name:'user_name',
			type : 'String'
		},{
			name:'zero_no',
			type : 'String'
		},{
			name:'zero_name',
			type : 'String'
		},{
			name:'sign_date',
			type : 'String'
		},{
			name :'effective_date',
			type : 'String'
		}
	 ]
});