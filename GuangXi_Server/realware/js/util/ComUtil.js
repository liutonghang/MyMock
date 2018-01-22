/***
 * 工具类
 */
Ext.define('Ext.ComUtil',{
		statics : {
				/*******************************************************************************
				 * 查询过滤条件 
				 * @param {}  tbr
				 * @param {}  options
				 */
				beforeload :function (tbr, options, model) {
					var jsonMap = "[{";
					if (tbr.items.length > 0) {
						for (var i = 0; i < tbr.items.length; i++) {
							var item = tbr.items.getAt(i);
							
							//如果没有值则直接掠过
							if( Ext.isEmpty( item.value ) ){
								continue;
							}
							var value = item.value;
							if( item.xtype =='datefield' ){
								value = Todate(item.value)
							}else if( typeof item.value == 'string'){
								value = encodeURI(item.value);
							}
							
							var symbol = item.symbol != undefined ? item.symbol : "=";
							//获得数据类型 string number date三个类型
							//如果是日期
							if( !Ext.isEmpty( Ext.isEmpty( item.data_type ) ) &&  item.data_type == 'date' ){
								var dataFormat = "" ;
								//如果没有配置日期格式则默认为yyyymmdd
								if( Ext.isEmpty( item.data_format ) ){
									dataFormat = 'yyyyMMdd';
								}else{
									dataFormat = item.data_format;
								}
								jsonMap = jsonMap + "\"" + item.dataIndex + "\":[\"" + symbol + "\",\"" +  value
									+ "\",\"date\",\"" + dataFormat + "\"],";
				
							}else if( !Ext.isEmpty( Ext.isEmpty( item.data_type ) ) &&  item.data_type == 'number' ){
								jsonMap = jsonMap + "\"" + item.dataIndex + "\":[\"" + symbol + "\",\"" +  value
									+ "\",\"number\"],";
				
							}
							else if ( Ext.isEmpty( Ext.isEmpty( item.data_type ) ) &&  item.data_type == 'number' ) { //原始的：}else if (item.value != undefined && !(typeof item.value == 'string' && item.value == "")) {
								//数字类型不用拼装单引号
								jsonMap = jsonMap + "\"" + item.dataIndex + "\":[\"" + symbol + "\"," + value + "],";
				
							}else if ( typeof value == 'string' ) {
								jsonMap = jsonMap + "\"" + item.dataIndex + "\":[\"" + symbol + "\",\"" + value + "\"],";
							}else {
								jsonMap = jsonMap + "\"" + item.dataIndex + "\":[\"" + symbol + "\"," + value + "],";
							}
						}
					}
					var data = jsonMap.substring(0, jsonMap.length - 1) + "}]";
					if (null == options.params || options.params == undefined) {
						options.params = [];
					}
					options.params["jsonMap"] = data;
					//数据项
					var filedNames = [];
					Ext.Array.each(model.getFields(), function(field) {
							filedNames.push(field.name);
						});
					options.params["filedNames"] = Ext.encode(filedNames);
				},
				
				
				getACVis : function(account_type_code){ //单位显示
					if(account_type_code == 12 || account_type_code == 120){ 
						return false;
					}
					return true;
				},
				
				getATCVis : function(account_type_code){ //账户类型显示
					if(account_type_code == 31){ 
						return false;
					}
					return true;
				},
				
				getFTCVis : function(account_type_code){ // 资金性质显示
					if(account_type_code == 4 || account_type_code ==31 || account_type_code ==5){
						return false;
					}
					return true;
				}

		}
});