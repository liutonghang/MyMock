/**
 * 数据项
 */
var fileds = "account_name,account_no,bank_code,bank_name,is_valid,admdiv_code," +
		"agency_code,fund_type_code,account_type_code,create_date"; // 数据项

/**
 * 列名
 */
var header = "账户名称|'account_name'|140,账号|'account_no'|100,网点编码|'bank_code'|100,网点名称|'bank_name',"
		+ "是否有效|'is_valid'|140,所属财政|'admdiv_code'|140,单位编码|'agency_code'";

/**
 * 所属财政下拉列表框
 */
var comboAdmdiv =  Ext.create('Ext.data.Store', {
	fields : ['admdiv_code', 'admdiv_name'],
	proxy: {        
			type: 'ajax',
			url : '/realware/loadAllAccountAdmdiv.do',        
			reader: {  
				root : 'root',
				type: 'json'
			}
	}
});
comboAdmdiv.load({
	method : 'post',
	params : {
		field : "admdiv_code,admdiv_name"
	}
}); 

Ext.require(['*']);

function refreshData() {
	var jsonMap = "[{";
	var accountname = Ext.getCmp('query_account_Name').getValue();
	var accountno = Ext.getCmp('query_account_No').getValue();
	var admdiv  = Ext.getCmp('query_admdiv_Code').getValue();
	var count = 0;
	if ("" != accountname && null != accountname) {
		var jsonStr = [];
		jsonStr[0] = "=";
		jsonStr[1] = accountname;
		jsonMap = jsonMap + "\"account_name\":" + Ext.encode(jsonStr) + ",";
		count++;
	}
	if ("" != accountno && null != accountno) {
		var jsonStr = [];
		jsonStr[0] = "LIKE";
		jsonStr[1] = accountno;
		jsonMap = jsonMap + "\"account_no\":" + Ext.encode(jsonStr) + ",";
		count++;
	}
	if("" != admdiv && null != admdiv){
		var jsonStr = [];
		jsonStr[0] = "=";
		jsonStr[1] = admdiv;
		jsonMap = jsonMap + "\"admdiv_code\":" + Ext.encode(jsonStr) + ",";
		count++;
	}
	var data = "";
	if(count > 0){
		data = jsonMap.substring(0, jsonMap.length - 1) + "}]";
	}else{
		data = jsonMap + "}]";
	}
	
	gridPanel1.getStore().load({
				method : 'post',
				params : {
					start : 0,
					pageSize : 200,
					filedNames : fileds,
					jsonMap : data
				}
	});
	
	Ext.getCmp('query_admdiv_Code').setValue("");
	Ext.getCmp('query_account_Name').setValue("");
	Ext.getCmp('query_account_No').setValue("");
} 