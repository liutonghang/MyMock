
/*******************************************************************************
 * 查看明细
 */
function lookPayRequest(grid, rowIndex, colIndex, node, e, record, rowEl) {
	
	var vouRecord = gridPanel1.getStore().getAt(rowIndex).data;
	reqPanel = getGrid("/realware/getPayRequestByVoucherId.do", reqHeader, reqFileds, true, true,"v_");
//	reqPanel.getStore().load({
//				method : 'post',
//				params : {
//					start : 0,
//					pageSize : 100,
//					filedNames : JSON.stringify(reqFileds),
//					id : vouRecord.pay_voucher_id
//				}
//			});
	
	reqPanel.getStore().on('beforeload', function(thiz, options) {
			var jsonMap = "[{";
			var id = vouRecord.pay_voucher_id;
			var jsonStr = [];
			jsonStr[0] = "=";
			jsonStr[1] = id;
			jsonMap = jsonMap + "\"pay_voucher_id\":" + Ext.encode(jsonStr) + ",";

			var jsonStr1 = [];
			jsonStr1[0] = "=";
			jsonStr1[1] = 0;
			//jsonMap = jsonMap + "\"is_clear_request\":" + Ext.encode(jsonStr1) + ",";
			var data = jsonMap.substring(0, jsonMap.length - 1) + "}]";
			if (null == options.params || options.params == undefined) {
				options.params = [];
				options.params["jsonMap"] = data;
				options.params["filedNames"] = JSON.stringify(reqFileds);
			} else {
				options.params["jsonMap"] = data;
				options.params["filedNames"] = JSON.stringify(reqFileds);
			}
		});

	reqPanel.getStore().load();
	
	
	Ext.widget('window', {
				id : 'reqWindow',
				title : '明细信息',
				width : 800,
				height : 480,
				layout : 'fit',
				resizable : true,
				draggable : true,
				autoScroll : true,
				modal : true,
				items : [reqPanel]
			}).show();
}