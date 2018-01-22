/**
 * 自助柜面 -  store
 */
Ext.define('pb.store.common.UserMessageStore',{
	extend:'Ext.data.Store',
 	model:'pb.model.common.UserMessageModel',
 	storeId:'store_userMessageNo',
	 proxy:{
		type:'ajax',
		actionMethods:{
			read:'POST'
		},
		url:'/realware/loadSignZeroUser.do'
	},
	autoLoad: false 
});