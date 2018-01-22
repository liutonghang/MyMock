/***
 * 凭证排查转账状态数据(私有)
 */
Ext.define('pb.store.pay.ForwardStatus', {
	extend : 'Ext.data.Store',
	fields : ['name', 'value'],
	datatype : 1,
	data : [{
				"name" : "未转账",
				"value" : "0"
			}, {
				"name" : "已转账",
				"value" : "1"
			}]
});