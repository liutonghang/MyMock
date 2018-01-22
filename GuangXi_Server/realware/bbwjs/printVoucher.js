var Custom = function () {
	return {
		/*
		 * 请款打印
		 */
		print1 : function(grid){
			printImage(grid,'1')
		},
		/*
		 * 支付打印
		 */
		print2 : function(grid){
			printImage(grid,'0')
		},
		/*
		 * 冲销打印
		 */
		print3 : function(grid){
			printImage(grid,'22')
		}
	}
}();
/**
 * 
 * @param grid
 * @param type 交易类型
 */
function printImage(grid,type){
	var records = grid.getSelectionModel().getSelection();
	if (records.length !=1) {
		Ext.Msg.alert("系统提示", "请选中一条凭证信息！");
		return;
	} 
	var me = pb.getApplication().getController(controllers[2]);
	var voucher_no=records[0].get("pay_voucher_id");
	var condition = "[{\"trans_type\":[\""+type+"\"], \"admdiv_code\":[\"" + Ext.getCmp("admdivCode").getValue() + "\"],\"pay_voucher_id\":[\"" + voucher_no + "\"]}]";
	//GridPrintDialog('undefined','undefined','/realware/loadReportByCode.do','/realware/loadReportData.do',"12220111",data,100);
	Ext.ReportUtil.showPrintWindow(me,'/realware/loadReportByCode.do','/realware/loadReportData.do','12220111',condition);
}