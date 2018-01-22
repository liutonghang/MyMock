﻿﻿﻿﻿/**
 * 非mvc方式加载列表前拼装查询条件
 * 注：对于>,<,>=,<=等比较符同时存在时，应在item的dataindex属性中增加一个额外的空格
 * 例如: pay_amount > 1 and pay_amout < 2,声明查询条件时，
 * 		两个查询框对应的dataindex分别为"pay_amount" 和 "pay_amount "
 */
function beforeload(tbr, options, filedNames) {
	var _condition = {};
	// JSP页面是否有account_type_right、is_onlyreq变量,有则加上过滤条件
	var someConditions = [
	                      { name : "account_type_right", data_type : "int", symbol : "="}, 
                    	  { name : "task_id", data_type : "int", symbol : "="}, 
                    	  { name : "is_onlyreq", data_type : "int", symbol : "="}
	                      ];
	Ext.Array.each(someConditions, function(condition) {
		if(window[condition.name]) {
			var value = null;
			switch(condition.data_type) {
				default : 
					value = window[condition.name];
			}
			_condition[condition.name] = [condition.symbol, value];
		}
	});
	//兼容旧代码中传入的vt_code参数  lfj 2015-01-28
	var vtCodes = ['vtCode', 'vt_code', 'vt_Code'];
	var vt_codeValue = null;
	Ext.Array.each(vtCodes, function(v) {
		if(window[v] && Ext.isString(window[v])) {
			vt_codeValue = window[v];
			return false;
		}
	});
	if(vt_codeValue) {
		_condition["vt_code"] = ["=", vt_codeValue];
	}
	if (tbr.items.length > 0) {
		for (var i = 0; i < tbr.items.length; i++) {
			var item = tbr.items.getAt(i);
			//如果没有值则直接掠过
			if( Ext.isEmpty( item.value ) 
				|| Ext.isEmpty( item.dataIndex )){
				continue;
			}
			var value = item.value;
			if( item.xtype =='datefield' ){
				//修改ie11下截取日期不正确的问题，直接取rawValue modify by cyq
				value = item.rawValue;
			}
			
			var symbol = item.symbol != undefined ? item.symbol : "=";
			//获得数据类型 string number date三个类型
			//如果是日期
			var data_type = item.data_type;
			if( data_type === 'date' ){
				// 暂时这样改
				value = item.rawValue;
				//如果没有配置日期格式则默认为yyyymmdd
				var dataFormat = item.data_format || "yyyyMMdd" ;
				_condition[item.dataIndex] = [symbol, value, "date", dataFormat];
			}else if(data_type === 'number' ) {
				//数字类型不用拼装单引号
				if(item.allowDecimals) {
					_condition[item.dataIndex] = [symbol, parseFloat(value), 'number'];
				} else {
					_condition[item.dataIndex] = [symbol, parseInt(value), 'number'];
				}
			} else {
				_condition[item.dataIndex] = [symbol, value];
			}
		}
	}
	if (null == options.params || options.params == undefined) {
		options.params = {};
	}
	var curUrl = window.location.href;
	var index = curUrl.indexOf("&id=") +4;
	var lastIndex = curUrl.indexOf("&", index);
	if(lastIndex == -1) {
		lastIndex = curUrl.length;
	}
	var id = curUrl.substring(index, lastIndex);
	options.params["menu_id"] = id; 
	options.params["jsonMap"] = Ext.encode([_condition]);
	options.params["filedNames"] = Ext.isString(filedNames) ? filedNames : Ext.encode(filedNames);
}
﻿﻿
/****
 * 设置按钮可见
 * @param {} admdiv_code
 * @param {} buttongroup
 */
function setBtnVisible(admdiv_code, buttongroup) {
	Ext.Ajax.request({
				url : '/realware/loadButton.do',
				method : 'POST',
				timeout : 10000, // 设置为10秒
				params : {
					admdiv_code : admdiv_code
				},
				success : function(response, options) {
					var b = (new Function("return " + response.responseText))();
					for (var i = 0; i < b.length; i++) {
						var btn = Ext.getCmp(b[i].button_id);
						if(btn) {
							btn.setVisible(b[i].visible == 1 ? true: false);
							btn.setText(b[i].button_name);
						}
					}
				},
				failure : function() {
					Ext.Msg.alert("提示信息", "初始化按钮显示异常！");
				}
			});
	//setButton(admdiv_code,buttongroup); //以后可注释
}

/*******************************************************************************
 * 预至界面已显示的按钮
 */
function setButton(admdiv_code,buttongroup) {
	var url = this.document.URL;
	var jsp = url.substring(url.indexOf("=") + 1, url.indexOf("&"));
	if (buttongroup==null || buttongroup.items.length == 0) {
		return;
	}
	var jsonMap = "[";
	for (var i = 0; i < buttongroup.items.length; i++) {
		var item = buttongroup.items.items[i];
		jsonMap += "{\"button_id\"=\"" + item.id + "\",\"button_name\"=\""
				+ item.text + "\",\"jsp_name\"=\"" + jsp
				+ "\",\"admdiv_code\"=\"" + admdiv_code + "\"},";
	}
	Ext.Ajax.request({
				url : '/realware/saveButton.do',
				method : 'POST',
				timeout : 10000, // 设置为10秒
				params : {
					admdiv_code:admdiv_code,
					data : jsonMap.substring(0, jsonMap.length - 1) + "]"
				}
			});
}



/***
 * 日期转换
 * @param {} num
 * @return {}
 */
function Todate(num) {
	num = num + "";
	var date = "";
	var month = new Array();
	month["Jan"] = '01';
	month["Feb"] = '02';
	month["Mar"] = '03';
	month["Apr"] = '04';
	month["May"] = '05';
	month["Jun"] = '06';
	month["Jul"] = '07';
	month["Aug"] = '08';
	month["Sep"] = '09';
	month["Oct"] = '10';
	month["Nov"] = '11';
	month["Dec"] = '12';
	var week = new Array();
	week["Mon"] = "一";
	week["Tue"] = "二";
	week["Wed"] = "三";
	week["Thu"] = "四";
	week["Fri"] = "五";
	week["Sat"] = "六";
	week["Sun"] = "日";
	str = num.split(" ");
	if (Ext.isChrome) {
		date = str[3] + "";
	} else {
		date = str[5] + "";
	}
	var day = str[2].length == 1 ? "0" + str[2] : str[2];
	date = date + month[str[1]] + "" + day;
	return date;
}




/**
 * Ajax请求操作成功后函数
 * @param {Object} response
 * @param {Object} options
 * @param {Object} myMask
 * @param {Object} remark 如果有remark则直接提醒remark
 */
function succAjax(response, myMask,isRef, remark) {
	if(myMask!=null||myMask!=undefined){
		myMask.hide();
	}
	
	var msg = response.responseText;
	if( !Ext.isEmpty(remark) ){
		msg = remark;
	}
	//session失效
	if (msg.indexOf("parent.window.location.href = 'login.do';") != -1) {
		Ext.Msg.alert('系统提示', 'session失效 请重新登陆！');
		parent.window.location.href = 'login.do';
	} else {
		Ext.Msg.show({
					title : '成功提示',
					msg : msg,
					buttons : Ext.Msg.OK,
					icon : Ext.MessageBox.INFO
				});
		if(isRef){
			refreshData();
		}
	}
}

/**
 * Ajax请求操作失败后函数
 * 
 * @param {Object}
 *            response
 * @param {Object}
 *            options
 * @param {Object}
 *            myMask
 */
function failAjax(response, myMask) {
	myMask.hide();
	if (response.status == -1) {
		Ext.Msg.alert("系统提示", "可能存在网络异常，检查后请重试...");
	} else {
		Ext.Msg.show({
					title : '失败提示',
					msg : response.responseText,
					buttons : Ext.Msg.OK,
					icon : Ext.MessageBox.ERROR
				});
	}
}


/***
 * 表单提交成功返回
 * @param {} form
 * @param {} action
 */
function succForm(form, action) {
	if (action.result.mess.indexOf("parent.window.location.href = 'login.do';") != -1) {
		Ext.Msg.alert('系统提示', 'session失效 请重新登陆！');
		parent.window.location.href = 'login.do';
	} else {
		Ext.Msg.show({
					title : '成功提示',
					msg : action.result.mess,
					buttons : Ext.Msg.OK,
					icon : Ext.MessageBox.INFO
				});
		form.reset();
	}
}

/***
 * 表单提交失败返回
 * @param {} form
 * @param {} action
 */
function failForm(form, action) {
	Ext.Msg.show({
				title : '失败提示',
				msg : action.result.mess,
				buttons : Ext.Msg.OK,
				icon : Ext.MessageBox.ERROR
			});
}


/*******************************************************************************
 * 表单校验提示框
 */
Ext.override(Ext.tip.QuickTip, {
	helperElId : 'ext-quicktips-tip-helper',
	initComponent : function() {
		var me = this;
		me.target = me.target || Ext.getDoc();
		me.targets = me.targets || {};
		me.callParent();
		// new stuff
		me.on('move', function() {
			var offset = me.hasCls('x-tip-form-invalid') ? 35 : 12, helperEl = Ext
					.fly(me.helperElId)
					|| Ext.fly(Ext.DomHelper.createDom({
								tag : 'div',
								id : me.helperElId,
								style : {
									position : 'absolute',
									left : '-1000px',
									top : '-1000px',
									'font-size' : '12px',
									'font-family' : 'tahoma, arial, verdana, sans-serif'
								}
							}, Ext.getBody()));
			if (me.html
					&& (me.html !== helperEl.getHTML() || me.getWidth() !== (helperEl.dom.clientWidth + offset))) {
				helperEl.update(me.html);
				me.setWidth(Ext.Number.constrain(helperEl.dom.clientWidth
								+ offset, me.minWidth, me.maxWidth));
			}
		}, this);
	}
});



//定义简单Map  
function getMap() {
	// map实现  
	var map = new Object();
	map.put = function(key, value) {
		var s = "map." + key + ' = "' + value + '";';
		eval(s);
	}
	map.get = function(key) {
		var v = eval("map." + key + ";");
		return v;
	}
	map.keySet = function() {
		var keySets = new Array();
		for (key in map) {
			if (!(typeof (map[key]) == "function")) {
				keySets.push(key);
			}
		}
		return keySets;
	}
	return map;
}

function getmenuid(){
	var curUrl = document.URL;
	var index = curUrl.indexOf("&id=") +4; 
	var lastIndex = curUrl.indexOf("&", index);
	if(lastIndex == -1) {
		lastIndex = curUrl.length;
	}
	var id = curUrl.substring(index, lastIndex); 
	return id;
}
