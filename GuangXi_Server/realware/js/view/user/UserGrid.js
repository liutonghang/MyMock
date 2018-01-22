Ext.define('pb.view.user.UserGrid',{
	extend: 'Ext.grid.Panel',
	alias:'widget.userGrid',
	store:'user.UserStore',
	initComponent: function() {
		this.columns =  [
	
	/*getCols : function() {
		var cols = [ */
		{
			xtype : 'rownumberer',
			width : 30,
			locked : true
		},
		{
			text:'signID',
			dataIndex:'sign_id'
		},{
			text:'用户名称',
			dataIndex:'user_name'
		},{
			text:'零余额账户',
			dataIndex:'zero_no'
		},{
			text:'零余额账户名称',
			dataIndex:'zero_name'
		},{
			text:'签约日期',
			dataIndex:'sign_date'
		},{
			text:'生效日期',
			dataIndex:'effective_date'
		}];
		this.callParent(arguments);
	//	return cols;
	}

	
});