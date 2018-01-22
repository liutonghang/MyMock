/***
 * 数据集合--迁入或者撤销迁出操作
 */
Ext.define('pb.store.pay.MigrateLog', {
	extend : 'Ext.data.Store',
	model : 'pb.model.user.UserMigrateModel',
	storeId : 's_MigrateLog',
	fields : [{
			name : 'log_id'
		},{
			name : 'identity_no'
		}, {
			name : 'user_code'
		}, {
			name : "out_date"
		}, {
			name : "out_bank_code"
		}, {
			name : "out_user_code"
		}, {
			name : "migrate_flag"
		}, {
			name : "in_date"
		}, {
			name : "in_user_code"
		}, {
			name : "in_bank_code"
		}],
	proxy : {
		type : 'ajax',
		timeout : 180000,
		actionMethods : {
			read : 'POST' 
		},
		url : '/realware/loadMigrateLog.do',
		extraParams : {
			filedNames : Ext.encode(["log_id","identity_no", "user_code",
					"out_date", "out_bank_code","out_user_code","migrate_flag","in_date","in_user_code","in_bank_code"])
		},
		reader : {
			type : 'json',
			root : 'root',
			totalProperty: 'pageCount'
		}
		
	},
//	listeners: {
//            beforeload: function (store, options) {
//                var params = {bankCode:Ext.getCmp("bankCode").getValue(),flag: Ext.getCmp("flag").getValue()};
//                Ext.apply(store.proxy.extraParams, params);
//            }
//        },
	autoLoad : false
});