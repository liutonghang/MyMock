var Custom = function(){
	
	return {
	         signsend:function(grid){
	         var me = pb.app.getController("pay.RefundVoucherInputs");
	         var url = 'signAndSendPayVoucher.do';
		     var records = Ext.PageUtil.validSelect(Ext.getCmp(Ext.PageUtil.prefix + Ext.getCmp('taskState').getValue()));
		     if(records !=null) {
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
			 Ext.PageUtil.doRequestAjax(me,url,params);
		      }
	        },
	        sendagain:function(grid){
	        	 var me =  pb.app.getController("pay.RefundVoucherInputs");
				 var records = null;
				 records = Ext.PageUtil.validSelect(Ext.getCmp(Ext.PageUtil.prefix + Ext.getCmp('taskState').getValue()));
				 if(records !=null) {
					var ids = []; // 凭证主键字符串
					var lastVers = []; // 凭证lastVer字符串
					Ext.Array.each(records, function(model) {
						ids.push(model.get("pay_voucher_id"));
						lastVers.push(model.get("last_ver"));
					  });
				  var params = {
							billTypeId : records[0].get("bill_type_id"),
							billIds : Ext.encode(ids),
							last_vers : Ext.encode(lastVers)
					  };
				  Ext.PageUtil.doRequestAjax(me,'sendVoucherAgain.do',params);
				} 
	         },
	     	delvoucher : function(grid) {
	     		var billIds1 = [];
	     	   	 var reqVers1=[];
	     	   	var bill_type_id1="";
	     	
	        	var records = Ext.PageUtil.validSelect(Ext.getCmp(Ext.PageUtil.prefix + Ext.getCmp('taskState').getValue()));
	        	if (records == null) {
	        		Ext.Msg.alert("系统提示", "请选中一条凭证信息！");
	        		return;
	        	}
	        	 // 选中的凭证的id数组，要传到后台
	     		for (var i = 0; i < records.length; i++) {
	     			billIds1.push(records[i].get("pay_voucher_id"));
	     			reqVers1.push(records[i].get("last_ver"));
	     			}
	     		bill_type_id1 = records[0].get("bill_type_id");
	        	Ext.MessageBox.confirm('删除提示', '是否确定删除'+billIds1+'等凭证？', delVoucher);
	     	}
	}
	
}();
function delVoucher(id) {
	if (id == "yes") {
		var myMask = new Ext.LoadMask(Ext.getBody(), {
			msg : '后台正在处理中，请稍后....',
			removeMask : true
		// 完成后移除
				});
		myMask.show();
	var billIds1 = [];
   	var reqVers1=[];
   	var bill_type_id1="";
   	var thiz = pb.app.getController("pay.RefundVoucherInputs");
   	var records = Ext.PageUtil.validSelect(Ext.getCmp(Ext.PageUtil.prefix + Ext.getCmp('taskState').getValue()));
   // 选中的凭证的id数组，要传到后台
	for (var i = 0; i < records.length; i++) {
		billIds1.push(records[i].get("pay_voucher_id"));
		reqVers1.push(records[i].get("last_ver"));
	}
	bill_type_id1 = records[0].get("bill_type_id");
		Ext.Ajax.request( {
			url : '/realware/delRefundVoucher.do',
			method : 'POST',
			timeout : 180000, //设置为3分钟
			params : {
				billIds : Ext.encode(billIds1),
				billTypeId : bill_type_id1,
				last_vers :Ext.encode( reqVers1)
			},
			success : function(response, options) {
				Ext.PageUtil.succAjax(response,myMask,thiz);
			},
			failure : function(response, options) {
				Ext.PageUtil.failAjax(response,myMask,thiz);
			}
		});
	}
}

