/**
 * 自助柜面-  Model 
 */
Ext.define('pb.model.userSignZeroNo.UserSignZeroNoModel',{
	extend:'Ext.data.Model',
	fields:[ 
		{
			text:'sign_id',
			type : 'String'
		},{
			text:'用户名称',
			type : 'String'
		},{
			text:'零余额账户',
			type : 'String'
		},{
			text:'零余额账户名称',
			type : 'String'
		},{
			text:'签约日期',
			type : 'String'
		},{
			text:'生效日期',
			type : 'String'
		}
	 ]
});