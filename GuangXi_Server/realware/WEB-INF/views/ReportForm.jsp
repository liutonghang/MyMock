<%@ page language="java" pageEncoding="UTF-8"%>
<%
	String path = request.getContextPath();
	String basePath = request.getScheme() + "://"
			+ request.getServerName() + ":" + request.getServerPort()
			+ path + "/";
%>
<html xmlns="http://www.w3.org/1999/xhtml">
	<head>
		<title>Web报表(B/S报表)演示 - 打印显示控件展现报表(AJAX方式)</title>
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
		<link rel="stylesheet" type="text/css"
			href="<%=path%>/resources/css/ext-all.css">
		<link rel="stylesheet" type="text/css" href="<%=path%>/resources/css/button.css">
		<script type="text/javascript" src="<%=path%>/resources/js/ext-all-min.js"></script>
		<script type="text/javascript" src="<%=path%>/resources/js/ext-lang-zh_CN.js"></script>
		<script type="text/javascript" src="<%=path%>/js/util/PageUtil.js"></script>
		<script type="text/javascript">
		    //防止Ext控件被 ActiveX挡住
		    Ext.useShims = true;
		</script>
		
<style type="text/css">
html,body {
	margin: 0;
	height: 100%;
}
</style>
<script type="text/javascript">
//定义
var size = {};
size.width = document.documentElement.clientWidth;
size.height = 500;

var toolbar = new Ext.Toolbar( {
	id : 'check_bar',
	cls : 'top-toolbar',
	anchorSize : size,
	layout : {
		type : 'table',
		columns : 4
	},
	//enableOverflow  : true,
	y : 100
});

var gr_InstallPath = "<%=path%>"; //实际项目中应该写从根目录寻址的目录，如gr_InstallPath="/myapp/report/grinstall"; 
var gr_Version = "6,0,15,0331";
//报表插件目前只能在32位浏览器中使用
var _gr_platform = window.navigator.platform;
if (_gr_platform.indexOf("64") > 0) {
	Ext.Msg.alert("系统提示", "锐浪Grid++Report报表插件不能运行在64位浏览器中，相关报表与打印功能将无法正常运新，请改用32位浏览器！");
}
//区分浏览器(IE or not)
var _gr_agent = navigator.userAgent.toLowerCase();
var _gr_isIE = (_gr_agent.indexOf("msie") > 0) ? true : false;
var gr_CodeBase;
if (_gr_isIE)
	gr_CodeBase = 'codebase="' + gr_InstallPath + '/grbsctl6.cab#Version='
			+ gr_Version + '"';
else
	gr_CodeBase = '';
var typeid;
if (_gr_isIE)
	typeid = 'classid="CLSID:ABB64AAC-D7E8-4733-B052-1B141C92F3CE" ' + gr_CodeBase;
else
	typeid = 'type="application/x-grplugin6-printviewer"';
//以下注册号为本机开发测试注册号，报表访问地址为localhost时可以去掉试用标志
//购买注册后，请用您的注册用户名与注册号替换下面变量中值
var gr_UserName = 'zhongkejiangnan_ctjsoft_1710';
var gr_SerialNo = 'PVWZ6LXXX4TJSG6GGUA9AYF68A0FC6APH6998SW63AFC6P8FH3BNRW6YV5D6BPVX90U4G51INK5';

var reportCode = null;

</script>
</head>
<body style="margin: 0">
<script type="text/javascript">
Ext.onReady(function() {
	Ext.QuickTips.init();
	Ext.Ajax.request( {
		url : '/realware/loadReportCodeByMenuId.do',
		method : 'POST',
		timeout : 60000,
		success : function(response, options) {
			reportCode = response.responseText;
			Ext.create('Ext.Viewport', {
				layout : 'fit',
				items : [ {
					html : '<object id="ReportViewer" ' + typeid + ' width="100%" height="100%" VIEWASTEXT>' 
						+ '<param name="ReportURL" value="<%=path%>/loadReportByCode.do?reportCode='+reportCode+'">'
						+'<param name="DataURL" value="">'
						+ '<param name="AutoRun" value=false>'
						+ '<param name="ShowToolbar" value=true>'
						+ '<param name="SerialNo" value="' + gr_SerialNo + '">'
						+ '<param name="UserName" value="' + gr_UserName + '"></object>',
					title : '查询区',
					tbar : toolbar
				} ]
			});
	//		ReportViewer.Start();
			SetToolButtons(toolbar);
		},
		failure : function(response, options) {
			Ext.Msg.alert("系统提示", "加载菜单对应的报表编码失败，原因：" + response.responseText);
			return;
		}
	});
});
//记录查询条件id
var queryControlIds=[];
var total;
//初始化查询条件
SetToolButtons = function(tbr) {
	tbr.removeAll();
	Ext.Ajax.request({
		url : '/realware/loadConditionsByMenuId.do',
		method : 'POST',
		timeout : 10000, // 设置为10秒
		success : function(response, options) {
			total = (new Function("return " + response.responseText))();
			var arrays = new Array(total.length);
			for (var i = 0; i < total.length; i++) {
				if(total[i].is_showOnQueryPanel==false){
					continue;
				}
				queryControlIds.push(total[i].para_name+'_cid');
				
				//文本框
				if("0"==total[i].control_type){
					arrays[i] = Ext.create('Ext.form.field.Text',{
							fieldLabel : total[i].cnname,
							labelWidth : 60,
							//width : 140,
							id : total[i].para_name+'_cid'
						});
				}else if("1"==total[i].control_type){//下拉列表
							
					if(total[i].para_name.toUpperCase()=="ADMDIV_CODE"){
						var valueList = total[i].valueList;
						if(Ext.isEmpty(valueList)) {
							valueList = [];
						}
						var comboAdmdiv =  Ext.create('Ext.data.Store', {
							fields : ['admdiv_code', 'admdiv_name'],
							data : valueList
						});
						arrays[i] = Ext.create('Ext.form.ComboBox',{
							fieldLabel : '所属财政',
							labelWidth : 60,
							//width : 180,
							displayField : 'admdiv_name',
							emptyText : '请选择',
							valueField : 'admdiv_code',
							store : comboAdmdiv,
							id : 'ADMDIV_CODE_cid',
							value :valueList.length > 0 ? valueList[0].admdiv_code : null 						                           
						});	
					}else{
						var comboStore = Ext.create('Ext.data.Store', {
							fields : ['name', 'value']
						});				
						var enm_value=total[i].enum_value;
						var enm=[];
						enm=enm_value.split('+');
						var values=[];
						var fields=[];
						Ext.Array.each(enm,function(e){
							var strs=[];
							strs=e.split('#');
							values.push(strs[0]);
							fields.push(strs[1]);
						});
						
						for(var j=0;j<fields.length;j++){
							var model={};							
							model.name=fields[j];
							model.value=values[j];
							comboStore.add(model);
						}					
						
						arrays[i] = Ext.create('Ext.form.ComboBox',{
							id : total[i].para_name +'_cid',
							fieldLabel : total[i].cnname,
							labelWidth : 60,
							//width : 180,
							displayField : 'name',
							emptyText : '请选择',
							valueField : 'value',
							store : comboStore,
							queryMode: 'local'
						});
					};				
					
				}else if("6"==total[i].control_type){
					arrays[i] = Ext.create('Ext.form.field.Date',{
							fieldLabel : total[i].cnname,
							labelWidth : 60,
							//width : 180,
							format : 'Y-m-d',
							id : total[i].para_name +'_cid'
						});
				}				
			}
			arrays[total.length+1]=new Ext.Button({
				text : '查询',
				iconCls : 'refresh',
				scale : 'small',
				handler:function(){
					refreshData();
				}
			});
			tbr.add(arrays);
		//	refreshData();
		},
		failure : function() {
			Ext.Msg.alert("提示信息", "加载失败,请稍后重试！");
		}
	});
};

function refreshData(){
	ReportViewer.Start();
	var dataUrl="/realware/loadReportDataByMenuId.do";
	var params = {
			reportCode : reportCode,
			menu_id :  Ext.PageUtil.getMenuId()
	};
	var idValue; //条件id
	var para_name; //相应para_name
	var flag=true;
    var jsonMap="[{";   
    var errorMsg ="";
	Ext.Array.each(queryControlIds,function(cid){
		var para_name=cid.substring(0,cid.length-4);
		idValue=Ext.getCmp(cid).getValue();
		if(!Ext.isEmpty(idValue)){
			flag=false;
			if((para_name.indexOf("date")!=-1 || para_name.indexOf("DATE")!=-1)&& Ext.getCmp(cid).xtype =="datefield"){
				var dateValue=Todate(idValue);
				jsonMap = jsonMap +"\""+para_name+"\":[\""+encodeURI(encodeURI(dateValue))+"\"],";
			}else{
				jsonMap = jsonMap + "\""+para_name+"\":[\""+encodeURI(encodeURI(idValue))+"\"],";
			}			
		}else{
			for(var i = 0;i<total.length;i++){
				if(para_name == total[i].para_name&&total[i].is_must_input==true){
					errorMsg = total[i].cnname+" 为必输项！"
					Ext.Msg.alert("提示信息", errorMsg);	
					return;
				}
			}
		    if((para_name.indexOf("date")!=-1 || para_name.indexOf("DATE")!=-1)&& Ext.getCmp(cid).xtype !="datefield"){
				var myDate = new Date()
				idValue = '20150201'
				jsonMap = jsonMap +"\""+para_name+"\":[\""+encodeURI(encodeURI(idValue))+"\"],";
			}
		}
	});
	if(errorMsg.length>0){
		return;
	}
	if(","==(jsonMap.charAt(jsonMap.length-1))){
		jsonMap = jsonMap.substring(0, jsonMap.length-1);
	}
	jsonMap = jsonMap + "}]";
	params.jsonMap = jsonMap;
	ReportViewer.Stop();
	Ext.Ajax.request({
		url : dataUrl,
		method : 'POST',
		params : params,
        timeout : 180000, // 设置为3分钟
		success : function(response, options) {
		
			//if(response.responseText.length > 13){
				ReportViewer.Report.LoadDataFromXML(response.responseText); //加载报表数据
				ReportViewer.Start();
			//}
			
		},
		failure : function(response, options) {
			Ext.Msg.alert("提示信息", "加载数据失败！");
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
	if (Ext.isChrome || (Object.hasOwnProperty.call(window, "ActiveXObject") && !window.ActiveXObject )) {
		date = str[3] + "";
	} else {
		date = str[5] + "";
	}
	var day = str[2].length == 1 ? "0" + str[2] : str[2];
	date = date + month[str[1]] + "" + day;
	return date;
}
</script>
</body>
</html>