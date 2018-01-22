/**
 * 自助柜面 主面板 panel
 */
Ext.define('pb.view.userSignZeroNo.UserSignZeroNoPanel',{
	extend:'Ext.panel.Panel',
	alias:'widget.userSignZeroNoPanel',
	getCols:function(){
		var cols=[{
			xtype:'rownumberer',
			width:30, 
			locked:true
		},{
			text:'sign_id'
		}, {
			text:'用户名称',
			width : 130
		//	dataIndex:'user_name'
		},{
			text:'零余额账户',
			width : 130
		//	dataIndex:'zero_no'
		},{
			text:'零余额账户名称',
			width : 130
		//	dataIndex:'zero_name'
		},{
			text:'签约日期',
			width : 130
		//	dataIndex:'sign_date'
		},{
			text:'生效日期',
			width : 130
		//	dataIndex:'effective_date'
		}
		];
		return cols;
		
	}
});