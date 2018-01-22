﻿//1、变量 GridReportCodeBase 指定了报表插件的下载位置与版本号，当客户端初次访问报表
//   时或插件版本升级后访问，将自动下载并安装 Grid++Report 报表插件。应将变量 
//   GridReportCodeBase 的值调整为与实际相符。
//2、codebase 等号后面的参数是 griectl.cab 的下载地址，可以是相对地址，一般从网站的
//   根目录开始寻址，griectl.cab 一定要存在于指定目录下。
//3、Version 等号后面的参数是插件安装包的版本号，如果有新版本插件安装包，应上传新版
//   本 griectl.cab 到服务器对应目录，并更新这里的版本号。
//4、更多详细信息请参考帮助中“报表插件(WEB报表)->在服务器部署插件安装包”部分
var GridReportCodeBase = 'codebase="/grbsctl5.cab#Version=5,8,14,428"';

//如果购买注册后，请用您的注册用户名与注册号替换下面变量中值
var UserName = 'zhongkejiangnan_ctjsoft_1710';
var SerialNo = 'ZSDN6LGRC4BCGT98GF099LFP93P8P9AAK79QWVD69Q8P9ECHG38JXD6L1RP9BAWQ90J475NJQK9';

var reportPanel = null;
//创建报表对象，报表对象是不可见的对象，详细请查看帮助中的 IGridppReport
function CreateReport(Name)
{
//	document.write('<OBJECT id="' + Name + '" classid="CLSID:50CA95AF-BDAA-4C69-A9C6-93E1136E68BC" ' + GridReportCodeBase + '" VIEWASTEXT></OBJECT>');
//	document.write('<script language="javascript" type="text/javascript">');
//	document.write(Name + '.Register("' + UserName + '", "' + SerialNo + '");');
//	document.write('</script>');
	if(reportPanel==null){
	//	reportPanel = document.parentWindow.parent.Ext.widget('form', {
		reportPanel = parent.Ext.widget('form', {
		renderTo : Ext.getBody(),
		region : 'center',
		frame : true,
		layout : 'fit',
		border : false,
		html : '<OBJECT id="' + Name + '" classid="CLSID:25240C9A-6AA5-416c-8CDA-801BBAF03928" ' + GridReportCodeBase + '" VIEWASTEXT></OBJECT><script language="javascript" type="text/javascript">'+
		Name + '.Register("' + UserName + '", "' + SerialNo + '");'+'</script>'
		});
	}
	return reportPanel;
}

function CreateShowReport(width,height)
{
//	document.write('<OBJECT id="' + Name + '" classid="CLSID:50CA95AF-BDAA-4C69-A9C6-93E1136E68BC" ' + GridReportCodeBase + '" VIEWASTEXT></OBJECT>');
//	document.write('<script language="javascript" type="text/javascript">');
//	document.write(Name + '.Register("' + UserName + '", "' + SerialNo + '");');
//	document.write('</script>');
	if(reportPanel==null){
	//	reportPanel = document.parentWindow.parent.Ext.widget('form', {
		reportPanel = Ext.widget('form', {
		renderTo : Ext.getBody(),
		html : '<OBJECT id="ReportViewer" classid="CLSID:25240C9A-6AA5-416c-8CDA-801BBAF03928" ' + GridReportCodeBase + '" width="'+width+'" height=" ' + height+ '" VIEWASTEXT>' +
		'</OBJECT><script language="javascript" type="text/javascript">ReportViewer.Register("' + UserName + '", "' + SerialNo + '");'+'</script>'
		});
	}
	return reportPanel;
}

//创建报表打印显示插件，详细请查看帮助中的 IGRPrintViewer
//ReportURL - 获取报表模板的URL
//DataURL - 获取报表数据的URL
function CreatePrintViewer(ReportURL, DataURL)
{
	document.write('<OBJECT classid="CLSID:9E4CCA44-17FC-402b-822C-BFA6CBA77C0C" '+ GridReportCodeBase + ' width="100%" height="100%" id="ReportViewer" VIEWASTEXT>');
	document.write('<param name="ReportURL" value="' + ReportURL + '">');
	document.write('<param name="DataURL" value="' + DataURL + '">');
	document.write('<param name="SerialNo" value="' + SerialNo + '">');
	document.write('<param name="UserName" value="' + UserName + '">');
	document.write('</OBJECT>');
}

//创建报表查询显示插件，详细请查看帮助中的 IGRDisplayViewer
//ReportURL - 获取报表模板的URL
//DataURL - 获取报表数据的URL
function CreateDisplayViewer(ReportURL, DataURL)
{
	document.write('<OBJECT classid="CLSID:E060AFE6-5EFF-4830-B7F0-093ECC08EF37" '+ GridReportCodeBase + ' width="100%" height="100%" id="ReportViewer" VIEWASTEXT>');
	document.write('<param name="ReportURL" value="' + ReportURL + '">');
	document.write('<param name="DataURL" value="' + DataURL + '">');
	document.write('<param name="SerialNo" value="' + SerialNo + '">');
	document.write('<param name="UserName" value="' + UserName + '">');
	document.write('</OBJECT>');
}

///创建报表设计器插件，详细请查看帮助中的 IGRDesigner
//LoadReportURL - 读取报表模板的URL，运行时从此URL读入报表模板数据并加载到设计器插件
//SaveReportURL - 保存报表模板的URL，保存设计后的结果数据，由此URL的服务在WEB服务端将报表模板持久保存
//DataURL - 获取报表运行时数据的URL，在设计器中进入打印视图与查询视图时从此URL获取报表数据
function CreateDesigner(LoadReportURL, SaveReportURL, DataURL)
{
	document.write('<OBJECT classid="CLSID:76AB1C26-34A0-4898-A90B-74CCFF435C43" '+ GridReportCodeBase + ' width="100%" height="100%" id="ReportDesigner" VIEWASTEXT>');
	document.write('<param name="LoadReportURL" value="' + LoadReportURL + '">');
	document.write('<param name="SaveReportURL" value="' + SaveReportURL + '">');
	document.write('<param name="DataURL" value="' + DataURL + '">');
	document.write('<param name="SerialNo" value="' + SerialNo + '">');
	document.write('<param name="UserName" value="' + UserName + '">');
	document.write('</OBJECT>');
}

//用更多的参数创建报表打印显示插件，详细请查看帮助中的 IGRPrintViewer
//Width - 插件的显示宽度，"100%"为整个显示区域宽度，"500"表示500个屏幕像素点
//Height - 插件的显示高度，"100%"为整个显示区域高度，"500"表示500个屏幕像素点
//ReportURL - 获取报表模板的URL
//DataURL - 获取报表数据的URL
//AutoRun - 指定插件在创建之后是否自动生成并展现报表,值为false或true
//ExParams - 指定更多的插件属性阐述,形如: "<param name="%ParamName%" value="%Value%">"这样的参数串
function CreatePrintViewerEx(Width, Height, ReportURL, DataURL, AutoRun, ExParams)
{
	document.write('<OBJECT classid="CLSID:9E4CCA44-17FC-402b-822C-BFA6CBA77C0C" '+ GridReportCodeBase);
	document.write(' width="' + Width + '" height="' + Height + '" id="ReportViewer" VIEWASTEXT>');
	document.write('<param name="ReportURL" value="' + ReportURL + '">');
	document.write('<param name="DataURL" value="' + DataURL + '">');
	document.write('<param name="AutoRun" value="' + AutoRun + '">');
	document.write('<param name="SerialNo" value="' + SerialNo + '">');
	document.write('<param name="UserName" value="' + UserName + '">');
	document.write(ExParams);
	document.write('</OBJECT>');
}

//用更多的参数创建报表查询显示插件，详细请查看帮助中的 IGRDisplayViewer
//Width - 插件的显示宽度，"100%"为整个显示区域宽度，"500"表示500个屏幕像素点
//Height - 插件的显示高度，"100%"为整个显示区域高度，"500"表示500个屏幕像素点
//ReportURL - 获取报表模板的URL
//DataURL - 获取报表数据的URL
//AutoRun - 指定插件在创建之后是否自动生成并展现报表,值为false或true
//ExParams - 指定更多的插件属性阐述,形如: "<param name="%ParamName%" value="%Value%">"这样的参数串
function CreateDisplayViewerEx(Width, Height, ReportURL, DataURL, AutoRun, ExParams)
{
	document.write('<OBJECT classid="CLSID:E060AFE6-5EFF-4830-B7F0-093ECC08EF37" '+ GridReportCodeBase);
	document.write(' width="' + Width + '" height="' + Height + '" id="ReportViewer" VIEWASTEXT>');
	document.write('<param name="ReportURL" value="' + ReportURL + '">');
	document.write('<param name="DataURL" value="' + DataURL + '">');
	document.write('<param name="AutoRun" value="' + AutoRun + '">');
	document.write('<param name="SerialNo" value="' + SerialNo + '">');
	document.write('<param name="UserName" value="' + UserName + '">');
	document.write(ExParams);
	document.write('</OBJECT>');
}

///用更多的参数创建报表设计器插件，详细请查看帮助中的 IGRDesigner
//Width - 插件的显示宽度，"100%"为整个显示区域宽度，"500"表示500个屏幕像素点
//Height - 插件的显示高度，"100%"为整个显示区域高度，"500"表示500个屏幕像素点
//LoadReportURL - 读取报表模板的URL，运行时从此URL读入报表模板数据并加载到设计器插件
//SaveReportURL - 保存报表模板的URL，保存设计后的结果数据，由此URL的服务在WEB服务端将报表模板持久保存
//DataURL - 获取报表运行时数据的URL，在设计器中进入打印视图与查询视图时从此URL获取报表数据
function CreateDesignerEx(Width, Height, LoadReportURL, SaveReportURL, DataURL, ExParams)
{
	document.write('<OBJECT classid="CLSID:76AB1C26-34A0-4898-A90B-74CCFF435C43" '+ GridReportCodeBase);
	document.write(' width="' + Width + '" height="' + Height + '" id="ReportDesigner" VIEWASTEXT>');
	document.write('<param name="LoadReportURL" value="' + LoadReportURL + '">');
	document.write('<param name="SaveReportURL" value="' + SaveReportURL + '">');
	document.write('<param name="DataURL" value="' + DataURL + '">');
	document.write('<param name="SerialNo" value="' + SerialNo + '">');
	document.write('<param name="UserName" value="' + UserName + '">');
	document.write(ExParams);
	document.write('</OBJECT>');
}

