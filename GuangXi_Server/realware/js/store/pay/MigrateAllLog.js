/***
 * 数据集合-- 迁入迁出操作日志
 */
Ext.define('pb.store.pay.MigrateAllLog', {
	extend : 'Ext.data.Store',
	model : 'pb.model.user.UserMigrateModel',
	storeId : 's_MigrateAllLog',
	proxy : {
		type : 'ajax',
		timeout : 180000,
		actionMethods : {
			read : 'POST' 
		},
		url : '/realware/loadMigrateAllLog.do',
		reader : {
			type : 'json',
			root : 'root',
			totalProperty: 'pageCount'
		}
	},listeners: {
            beforeload: function (store, options) {
                var params = { "filedNames": '["log_id","identity_no","user_code","out_date","out_bank_code","out_user_code","migrate_flag","in_date","in_user_code","in_bank_code"]',
                		inBankCode:Ext.getCmp("inBankCode").getValue(),outBankCode:Ext.getCmp("outBankCode").getValue()};
                Ext.apply(store.proxy.extraParams, params);
                
            }
        },
	autoLoad : false
});