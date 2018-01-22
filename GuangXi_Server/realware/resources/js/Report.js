/*
loadGrfURL=xxx.do?admdiv_code=xxx
目前调函数前loadGrfURL还是xxx.do的形式

*/


var reportStr = null;

function PrintReport(loadGrfURL, loadDataURL, reportcode, data) {
	reportView(loadGrfURL, loadDataURL, reportcode, data,false);
	
}
function PreViewReport(loadGrfURL, loadDataURL, reportcode, data) {
	reportView(loadGrfURL, loadDataURL, reportcode, data,true);
}

function reportView(loadGrfURL, loadDataURL, reportcode, data,viewreport){
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
						if(viewreport){
							Report.PrintPreview(true);
						}else{
							Report.Print(true);
						}
					} else {
						Ext.Msg.show({
									title : '失败提示',
									msg : msg,
									buttons : Ext.Msg.OK,
									icon : Ext.MessageBox.INFO
								});
					}
				},
				failure : function(response, options) {
					myMask.hide();
					var msg = (new Function("return " + response.responseText))();
					Ext.Msg.show({
								title : '失败提示',
								msg : msg.error,
								buttons : Ext.Msg.OK,
								icon : Ext.MessageBox.ERROR
							});
				}
			});
}

function reportForShow(loadGrfURL, loadDataURL, height){
	// 创建grid报表显示控件
	var panel =CreateShowReport('100%',height);
	ReportViewer.ReportURL=loadGrfURL;
	ReportViewer.DataURL=loadDataURL;
	ReportViewer.Start();
	return panel;
}

function report(loadDataURL, reportcode, reportStr, data) {
	// 创建grid报表控件
	CreateReport("Report");
	// var writeoffDate =toDate( Ext.getCmp("writeoffDate").getValue() );
	Report.LoadFromStr(reportStr);
	if(Ext.isEmpty(data)){
		Report.LoadDataFromURL(loadDataURL+ '?reportCode=' + reportcode);
	}else{
		Report.LoadDataFromURL(loadDataURL + '?reportCode=' + reportcode
			+ '&jsonMap=' + data);
	}	
}

//根据菜单和当前区划加载报表
function reportNew(loadDataURL, reportcode, reportStr, data) {
	// 创建grid报表控件
	CreateReport("Report");
	// var writeoffDate =toDate( Ext.getCmp("writeoffDate").getValue() );
	Report.LoadFromStr(reportStr);
	if(Ext.isEmpty(data)){
		Report.LoadDataFromURL(loadDataURL);
	}else{
		Report.LoadDataFromURL(loadDataURL + '?jsonMap=' + data);
	}	
}
