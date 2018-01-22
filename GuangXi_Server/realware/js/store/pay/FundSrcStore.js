/***
 * 专项资金，资金来源
 */
Ext.define('pb.store.pay.FundSrcStore', {
	extend : 'Ext.data.Store',
	fields : ['name', 'value'],
	data : [{
				"name" : "中央补助资金",
				"value" : "01"
			},{
				"name" : "地方配套资金",
				"value" : "02"
			}]
	});