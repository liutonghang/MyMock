/**
 *   store
 */
Ext.define('pb.store.user.UserStore',{
	extend:'Ext.data.Store',
 	model:'pb.model.user.UserModel',
/*	 proxy:{
		type:'ajax',
		actionMethods:{
			read:'POST'
		},
		url:'/realwear/loadAutoSignAccounts.do',
		reader:{
			type:'json',
			root:'root',
			totalProperty:'pageCount'
		}
	},
	autoLoad: false*/
 	
 	data:[{
 		sign_id:'1',
 		user_name:'test',
 		zero_no:'12121',
 		zero_name:'testZero',
 		sign_date:'2014-11-13',
 		effective_date:'2014-11-13'
 	}]
 	
});