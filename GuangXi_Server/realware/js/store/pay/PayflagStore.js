/*********************************************************************8
 * 转现标志 1 现金，2 网点操作账户，3 ABIS91
 * 直接支付没有现金 、而中央专项资金只有现金、和网点操作账户
 */		
Ext.define('pb.store.pay.PayflagStore',{
	extend : 'Ext.data.store',
	fields : ['name','value'],
	data : [{
		"name" : "网点操作账户",
		"value" : "2"
	},{
		"name" : "ABIS91",
		"value" : "3"
	}]
});