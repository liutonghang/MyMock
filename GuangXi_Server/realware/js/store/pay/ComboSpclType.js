/***
 * 专项资金类别
 */
Ext.define('pb.store.pay.ComboSpclType', {
	extend : 'Ext.data.Store',
	fields : ['name', 'value'],
	data : [{
				"name" : "农村义务教育资金 ",
				"value" : "01"
			},  {
				"name" : "新农村合作医疗补助资金  ",
				"value" : "02"
			}, {
				"name" : "家电下乡补贴资金",
				"value" : "03"
			}, {
				"name" : "汽车摩托车下乡补贴资金",
				"value" : "04"
			},  {
				"name" : "家电以旧换新补贴资金",
				"value" : "05"
			}, {
				"name" : "普及九年义务教育化债资金",
				"value" : "06"
			}, {
				"name" : "普及九年义务教育化债资金",
				"value" : "07"
			},  {
				"name" : "养殖业保险保费补贴资金",
				"value" : "08"
			}, {
				"name" : "化解乡村其他公益性债务补贴资金",
				"value" : "09"
			}, {
				"name" : "其他类别资金",
				"value" : "xx"
			}]
});