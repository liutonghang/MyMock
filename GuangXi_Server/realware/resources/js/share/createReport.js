/*
 * loadGrfURL=xxx.do?admdiv=xxx 目前调函数前loadGrfURL还是xxx.do的形式
 * 
 */
 

/****
 * 请款、冲销、汇总公用的打印界面
 * @param {} bill_no
 * @param {} printSucURL
 * @param {} loadGrfURL
 * @param {} loadDataURL
 * @param {} reportcode
 * @param {} data
 * @param {} h
 */
function GridPrintDialog(bill_no,printSucURL,loadGrfURL,loadDataURL,reportcode,data,h){
	Ext.widget('window',{
		id : 'gridprint',
		title : '打印功能提示框',
		width : 280,
		height : h,
		layout : 'fit',
		resizable : false,
		modal : true,
		items :[Ext.widget('form', {
				renderTo : Ext.getBody(),
				layout : {
					type : 'absolute',
					padding : 20
				},
				resizable : false,
				modal : true,
				bodyPadding: 10,
				items:[
				{	
					xtype: 'button',
					text : '打印',
					height: 25,
					width: 60,
					x:50,
					y:20,
					handler : function(){
						PrintReport(loadGrfURL,loadDataURL,reportcode,data);
					}
				},				
				{
					xtype:'button',
					text : '打印成功',
					height: 25,
					width: 60,
					x: 50,
					y:75,
					handler : function(){
						if(bill_no!='undefined'&&printSucURL!='undefined'){
							var myMask = new Ext.LoadMask(Ext.getBody(), {
									msg : '后台正在处理中，请稍后....',
									removeMask : true // 完成后移除
							});
							myMask.show();
							Ext.Ajax.request({
								url : printSucURL,
								waitMsg : '后台正在处理中,请稍后....',
								method : 'POST',
								timeout : 180000, // 设置为3分钟
								async : false,// 添加该属性即可同步
								params : {
									billnos : bill_no
								},
								success : function(response, options) {
									succAjax(response,myMask);
									Ext.getCmp('gridprint').close();
									refreshData();
								},
								failure : function(response, options) {
									failAjax(response,myMask);
								}
							});
						}
					}
				},{
					xtype: 'button',
					text : '预览',
					height: 25,
					width: 60,
					x:150,
					y:20,
					handler : function(){
						PreViewReport(loadGrfURL,loadDataURL,reportcode,data);
					}
				},{
					xtype: 'button',
					text : '取消',
					height: 25,
					width: 60,
					x:150,
					y:75,
					handler : function(){
						this.up('window').close();
					}
				}]})	
				]	
	}).show();
	
}




/***
 * GRID++ 打印报表
 * @param {} loadGrfURL
 * @param {} loadDataURL
 * @param {} reportcode
 * @param {} data
 */
function PrintReport(loadGrfURL, loadDataURL, reportcode, data) {
	reportView(loadGrfURL, loadDataURL, reportcode, data, false);

}

/***
 * 预览打印
 * @param {} loadGrfURL
 * @param {} loadDataURL
 * @param {} reportcode
 * @param {} data
 */
function PreViewReport(loadGrfURL, loadDataURL, reportcode, data) {
	reportView(loadGrfURL, loadDataURL, reportcode, data, true);
}



/***
 * 打印界面
 * @param {} loadGrfURL
 * @param {} loadDataURL
 * @param {} reportcode
 * @param {} data
 * @param {} viewreport
 */
function reportView(loadGrfURL, loadDataURL, reportcode, data, viewreport) {
	var myMask = new Ext.LoadMask(Ext.getBody(), {
		msg : '后台正在处理中，请稍后....',
		removeMask : true
			// 完成后移除
		});
	myMask.show();
	Ext.Ajax.request({
				url : loadGrfURL,
				method : 'POST',
				timeout : 180000, // 设置为3分钟
				params : {
					reportCode : reportcode
				},
				success : function(response, options) {
					myMask.hide();
					var msg = response.responseText;
					if (msg.indexOf("失败") == -1) {
						report(loadDataURL, reportcode, msg, data,viewreport);
//						if (viewreport) {
//							Report.Report.PrintPreview(true);
//						} else {
//							Report.Report.Print(true);
//						}
					} else {
						Ext.Msg.show({
									title : '成功提示',
									msg : msg,
									buttons : Ext.Msg.OK,
									icon : Ext.MessageBox.INFO
								});
					}
				},
				failure : function(response, options) {
					failAjax(response,myMask);
				}
			});
}

function reportForShow(loadGrfURL, loadDataURL, height) {
	// 创建grid报表显示控件
	var panel = CreateShowReport('100%', height);
	ReportViewer.ReportURL = loadGrfURL;
	ReportViewer.DataURL = loadDataURL;
	ReportViewer.Start();
	return panel;
}



var reportStr = null;

function report(loadDataURL, reportcode, reportStr, data,viewreport) {
	// 创建grid报表控件
	CreateReport("Report");
	Report.Stop();
	Report.Report.LoadFromStr(reportStr);
	var params = {
			reportCode : reportcode
	};
	if (!Ext.isEmpty(data)) {
		params.jsonMap = data;
	}
	Ext.Ajax.request({
		url : loadDataURL,
		method : 'POST',
		params : params,
		success : function(response, options) {
			Report.Report.LoadDataFromXML(response.responseText); //加载报表数据
			Report.Start();
			if (viewreport) {
				Report.Report.PrintPreview(true);
			} else {
				Report.Report.Print(true);
			}
		},
		failure : function(response, options) {
			Ext.Msg.show({
				title : '失败提示',
				msg : response.responseText,
				buttons : Ext.Msg.OK,
				icon : Ext.MessageBox.ERROR
			});
		}
	});
}



// 1、变量 GridReportCodeBase 指定了报表插件的下载位置与版本号，当客户端初次访问报表
// 时或插件版本升级后访问，将自动下载并安装 Grid++Report 报表插件。应将变量
// GridReportCodeBase 的值调整为与实际相符。
// 2、codebase 等号后面的参数是 griectl.cab 的下载地址，可以是相对地址，一般从网站的
// 根目录开始寻址，griectl.cab 一定要存在于指定目录下。
// 3、Version 等号后面的参数是插件安装包的版本号，如果有新版本插件安装包，应上传新版
// 本 griectl.cab 到服务器对应目录，并更新这里的版本号。
// 4、更多详细信息请参考帮助中“报表插件(WEB报表)->在服务器部署插件安装包”部分
var GridReportCodeBase = 'codebase="/realware/grbsctl6.cab#Version=6,0,15,0331"';
var _gr_agent = navigator.userAgent.toLowerCase();
var _gr_isIE = (_gr_agent.indexOf("msie") > 0) ? true : false;
var typeid;
if (_gr_isIE)
	typeid = 'classid="CLSID:ABB64AAC-D7E8-4733-B052-1B141C92F3CE" ';
else
	typeid = 'type="application/x-grplugin6-printviewer"';
// 如果购买注册后，请用您的注册用户名与注册号替换下面变量中值
var UserName = 'zhongkejiangnan_ctjsoft_1710';
var SerialNo = 'PVWZ6LXXX4TJSG6GGUA9AYF68A0FC6APH6998SW63AFC6P8FH3BNRW6YV5D6BPVX90U4G51INK5';

var reportPanel = null;
// 创建报表对象，报表对象是不可见的对象，详细请查看帮助中的 IGridppReport
function CreateReport(Name) {
	// document.write('<OBJECT id="' + Name + '"
	// classid="CLSID:50CA95AF-BDAA-4C69-A9C6-93E1136E68BC" ' +
	// GridReportCodeBase + '" VIEWASTEXT></OBJECT>');
	// document.write('<script language="javascript" type="text/javascript">');
	// document.write(Name + '.Register("' + UserName + '", "' + SerialNo +
	// '");');
	// document.write('</script>');
	if (reportPanel == null) {
		// reportPanel = document.parentWindow.parent.Ext.widget('form', {
		reportPanel = parent.Ext.widget('form', {
			renderTo : Ext.getBody(),
			region : 'center',
			frame : true,
			layout : 'fit',
			border : false,
			html : '<OBJECT id="'
					+ Name
					+ '" ' + typeid
					+ GridReportCodeBase
					+ '" VIEWASTEXT>'
					+ '<param name="AutoRun" value=false>'
					+ '<param name="ShowToolbar" value=true>'
					+ '<param name="SerialNo" value="' + SerialNo + '">'
					+ '<param name="UserName" value="' + UserName + '">'
					+ '</OBJECT>'
		});
	}
}

// 创建报表打印显示插件，详细请查看帮助中的 IGRPrintViewer
// ReportURL - 获取报表模板的URL
// DataURL - 获取报表数据的URL
function CreatePrintViewer(ReportURL, DataURL) {
	document
			.write('<OBJECT classid="CLSID:9E4CCA44-17FC-402b-822C-BFA6CBA77C0C" '
					+ GridReportCodeBase
					+ ' width="100%" height="100%" id="ReportViewer" VIEWASTEXT>');
	document.write('<param name="ReportURL" value="' + ReportURL + '">');
	document.write('<param name="DataURL" value="' + DataURL + '">');
	document.write('<param name="SerialNo" value="' + SerialNo + '">');
	document.write('<param name="UserName" value="' + UserName + '">');
	document.write('</OBJECT>');
}

// 创建报表查询显示插件，详细请查看帮助中的 IGRDisplayViewer
// ReportURL - 获取报表模板的URL
// DataURL - 获取报表数据的URL
function CreateDisplayViewer(ReportURL, DataURL) {
	document
			.write('<OBJECT classid="CLSID:E060AFE6-5EFF-4830-B7F0-093ECC08EF37" '
					+ GridReportCodeBase
					+ ' width="100%" height="100%" id="ReportViewer" VIEWASTEXT>');
	document.write('<param name="ReportURL" value="' + ReportURL + '">');
	document.write('<param name="DataURL" value="' + DataURL + '">');
	document.write('<param name="SerialNo" value="' + SerialNo + '">');
	document.write('<param name="UserName" value="' + UserName + '">');
	document.write('</OBJECT>');
}

// /创建报表设计器插件，详细请查看帮助中的 IGRDesigner
// LoadReportURL - 读取报表模板的URL，运行时从此URL读入报表模板数据并加载到设计器插件
// SaveReportURL - 保存报表模板的URL，保存设计后的结果数据，由此URL的服务在WEB服务端将报表模板持久保存
// DataURL - 获取报表运行时数据的URL，在设计器中进入打印视图与查询视图时从此URL获取报表数据
function CreateDesigner(LoadReportURL, SaveReportURL, DataURL) {
	document
			.write('<OBJECT classid="CLSID:76AB1C26-34A0-4898-A90B-74CCFF435C43" '
					+ GridReportCodeBase
					+ ' width="100%" height="100%" id="ReportDesigner" VIEWASTEXT>');
	document
			.write('<param name="LoadReportURL" value="' + LoadReportURL + '">');
	document
			.write('<param name="SaveReportURL" value="' + SaveReportURL + '">');
	document.write('<param name="DataURL" value="' + DataURL + '">');
	document.write('<param name="SerialNo" value="' + SerialNo + '">');
	document.write('<param name="UserName" value="' + UserName + '">');
	document.write('</OBJECT>');
}

// 用更多的参数创建报表打印显示插件，详细请查看帮助中的 IGRPrintViewer
// Width - 插件的显示宽度，"100%"为整个显示区域宽度，"500"表示500个屏幕像素点
// Height - 插件的显示高度，"100%"为整个显示区域高度，"500"表示500个屏幕像素点
// ReportURL - 获取报表模板的URL
// DataURL - 获取报表数据的URL
// AutoRun - 指定插件在创建之后是否自动生成并展现报表,值为false或true
// ExParams - 指定更多的插件属性阐述,形如: "<param name="%ParamName%" value="%Value%">"这样的参数串
function CreatePrintViewerEx(Width, Height, ReportURL, DataURL, AutoRun,
		ExParams) {
	document
			.write('<OBJECT classid="CLSID:9E4CCA44-17FC-402b-822C-BFA6CBA77C0C" '
					+ GridReportCodeBase);
	document.write(' width="' + Width + '" height="' + Height
			+ '" id="ReportViewer" VIEWASTEXT>');
	document.write('<param name="ReportURL" value="' + ReportURL + '">');
	document.write('<param name="DataURL" value="' + DataURL + '">');
	document.write('<param name="AutoRun" value="' + AutoRun + '">');
	document.write('<param name="SerialNo" value="' + SerialNo + '">');
	document.write('<param name="UserName" value="' + UserName + '">');
	document.write(ExParams);
	document.write('</OBJECT>');
}

// 用更多的参数创建报表查询显示插件，详细请查看帮助中的 IGRDisplayViewer
// Width - 插件的显示宽度，"100%"为整个显示区域宽度，"500"表示500个屏幕像素点
// Height - 插件的显示高度，"100%"为整个显示区域高度，"500"表示500个屏幕像素点
// ReportURL - 获取报表模板的URL
// DataURL - 获取报表数据的URL
// AutoRun - 指定插件在创建之后是否自动生成并展现报表,值为false或true
// ExParams - 指定更多的插件属性阐述,形如: "<param name="%ParamName%" value="%Value%">"这样的参数串
function CreateDisplayViewerEx(Width, Height, ReportURL, DataURL, AutoRun,
		ExParams) {
	document
			.write('<OBJECT classid="CLSID:E060AFE6-5EFF-4830-B7F0-093ECC08EF37" '
					+ GridReportCodeBase);
	document.write(' width="' + Width + '" height="' + Height
			+ '" id="ReportViewer" VIEWASTEXT>');
	document.write('<param name="ReportURL" value="' + ReportURL + '">');
	document.write('<param name="DataURL" value="' + DataURL + '">');
	document.write('<param name="AutoRun" value="' + AutoRun + '">');
	document.write('<param name="SerialNo" value="' + SerialNo + '">');
	document.write('<param name="UserName" value="' + UserName + '">');
	document.write(ExParams);
	document.write('</OBJECT>');
}

// /用更多的参数创建报表设计器插件，详细请查看帮助中的 IGRDesigner
// Width - 插件的显示宽度，"100%"为整个显示区域宽度，"500"表示500个屏幕像素点
// Height - 插件的显示高度，"100%"为整个显示区域高度，"500"表示500个屏幕像素点
// LoadReportURL - 读取报表模板的URL，运行时从此URL读入报表模板数据并加载到设计器插件
// SaveReportURL - 保存报表模板的URL，保存设计后的结果数据，由此URL的服务在WEB服务端将报表模板持久保存
// DataURL - 获取报表运行时数据的URL，在设计器中进入打印视图与查询视图时从此URL获取报表数据
function CreateDesignerEx(Width, Height, LoadReportURL, SaveReportURL, DataURL,
		ExParams) {
	document
			.write('<OBJECT classid="CLSID:76AB1C26-34A0-4898-A90B-74CCFF435C43" '
					+ GridReportCodeBase);
	document.write(' width="' + Width + '" height="' + Height
			+ '" id="ReportDesigner" VIEWASTEXT>');
	document
			.write('<param name="LoadReportURL" value="' + LoadReportURL + '">');
	document
			.write('<param name="SaveReportURL" value="' + SaveReportURL + '">');
	document.write('<param name="DataURL" value="' + DataURL + '">');
	document.write('<param name="SerialNo" value="' + SerialNo + '">');
	document.write('<param name="UserName" value="' + UserName + '">');
	document.write(ExParams);
	document.write('</OBJECT>');
}
