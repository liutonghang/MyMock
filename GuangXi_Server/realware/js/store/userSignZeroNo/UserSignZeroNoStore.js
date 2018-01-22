/**
 * 自助柜面 -  store
 */
Ext.define('pb.store.userSignZeroNo.UserSignZeroNoStore',{
	extend:'Ext.data.Store',
 	model:'pb.model.userSignZeroNo.UserSignZeroNoModel',
 	storeId:'store_userSignZeroNo',
	 proxy:{
		type:'ajax',
		actionMethods:{
			read:'POST'
		},
		url:'',
		reader:{
			type:'json',
			root:'root',
			totalProperty:'pageCount'
		}
	},
	autoLoad: false 
  
	
});