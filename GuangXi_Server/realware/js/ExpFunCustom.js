var Custom = function(){
	
	return {
		singsend2 : function(grid) {
			var url = '/realware/signAndSendAdjustAccreditVoucher.do';
			var me = pb.app.getController("pay.SignSendVouchers");
			var records = Ext.PageUtil.validSelect(Ext
					.getCmp(Ext.PageUtil.prefix
							+ Ext.getCmp('taskState').getValue()),1);
			if (records != null) {
				var ids = []; // 凭证主键字符串
				var lastVers = []; // 凭证lastVer字符串
				Ext.Array.each(records, function(model) {
							ids.push(model.get("pay_voucher_id"));
							lastVers.push(model.get("last_ver"));
						});
				var params = {
					billTypeId : records[0].get("bill_type_id"),
					billIds : Ext.encode(ids),
					last_vers : Ext.encode(lastVers),
					isFlow : false
				};
				Ext.PageUtil.doRequestAjax(me, url, params);
			}
		}
	}
}();
