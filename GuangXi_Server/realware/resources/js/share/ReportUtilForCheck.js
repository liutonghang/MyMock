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
function GridPrintDialog(loadGrfURL,loadDataURL,reportcode,data){
	CreateReport("Report");
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
function reportView(loadGrfURL, loadDataURL, reportcode, data) {
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
						report(loadDataURL, reportcode, msg, data);
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

var reportStr = null;

function report(loadDataURL, reportcode, reportStr, data) {
	Report.Stop();
	Report.Report.LoadFromStr(reportStr);
	var params = {
			reportCode : reportcode,
			billId : data
	};
	Ext.Ajax.request({
		url : loadDataURL,
		method : 'POST',
		params : params,
		success : function(response, options) {
			Report.Report.LoadDataFromXML(response.responseText); //加载报表数据
			//Report.Start();
			//Report.Report.PrintPreview(true);
			showwindow();
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
function showwindow(){
	var tempSize=Ext.getBody().getSize();
    var width = tempSize.width*0.97;
    var height =tempSize.height*0.88;
	Ext.widget('window',{
		id : 'gridprint',
		title : '异常排查信息框',
		width : width,
		height : height,
		layout : 'fit',
		resizable : false,
		modal : true,
 	 	items :[reportPanel],
 	 	listeners   : {'beforeclose': function ()
		 { 
    	   Ext.getCmp("gridprint").items.remove(reportPanel);
		     return true;
	     } } 
	}).show();
}
var GridReportCodeBase = 'codebase="/realware/grbsctl6.cab#Version=6,0,15,0331"';
var _gr_agent = navigator.userAgent.toLowerCase();
var _gr_isIE = (_gr_agent.indexOf("msie") > 0) ? true : false;
var typeid;
if (_gr_isIE)
	typeid = 'classid="CLSID:ABB64AAC-D7E8-4733-B052-1B141C92F3CE" ';
else
	typeid = 'type="application/x-grplugin6-printviewer"';
var UserName = 'zhongkejiangnan_ctjsoft_1710';
var SerialNo = 'PVWZ6LXXX4TJSG6GGUA9AYF68A0FC6APH6998SW63AFC6P8FH3BNRW6YV5D6BPVX90U4G51INK5';
var width='width="100%" ';
var height='height="100%" ';
var reportPanel = null;
function CreateReport(Name) {
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
				+ width
				+ height
				+ '" VIEWASTEXT></OBJECT><script language="javascript" type="text/javascript">'
				+ Name + '.Register("' + UserName + '", "' + SerialNo
				+ '");' + '</script>'
	});
}
