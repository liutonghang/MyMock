var timerID = null;
var timerRunning = false;
function stopclock() {
	if (timerRunning)
		clearTimeout(timerID);
	timerRunning = false;
}
function startclock() {
	stopclock();
	showtime();
	queryRemindInfos();
}
function showtime() {
	var now = new Date();
	var hours = now.getHours();
	var minutes = now.getMinutes();
	var seconds = now.getSeconds();
	var timeValue = "" + ((hours >= 12) ? "下午 " : "上午 ");
	timeValue += ((hours > 12) ? hours - 12 : hours);
	timeValue += ((minutes < 10) ? ":0" : ":") + minutes;
	timeValue += ((seconds < 10) ? ":0" : ":") + seconds;
	document.getElementById("thetime").value = timeValue;
	timerID = setTimeout("showtime()", 1000);
	timerRunning = true;
}



/**
 * 查询业务提醒
 * 
 * @param {Object}
 *            isReturn
 * @return {TypeName}
 */
function queryRemindInfos() {
	var ori_html = '<TABLE cellSpacing=0 cellPadding=2 width="95%" align=center border=0>';
	document.getElementById('REMIND').innerHTML = ori_html;
	var myMask = new Ext.LoadMask(Ext.getBody(), {
		msg : '后台正在处理中，请稍后....',
		removeMask : true
	});
	myMask.show();
	Ext.Ajax.request( {
		url : '/realware/loadRemindInfo.do',
		method : 'POST',
		timeout : 1800000, // 设置为3分钟
		success : function(response, options) {
			myMask.hide();
			if(response.responseText==""){
				return;
			}
			var msgArrays = Ext.decode(response.responseText);
			var message = '';
			if (msgArrays.length > 0) {
				Ext.Array.findBy(msgArrays,function(m){
					var str = "<TR><TD width='20%' colspan=2><a href='javascript:openMenu("+Ext.encode(m)+")' style='color:red'>" + m.name + "【待办数:"+ m.count + "】</a></TD></TR>";
					message = message + str;
				});
			}
			var html = document.all.REMIND.innerHTML.substring(0,document.all.REMIND.innerHTML.length - 8) + message + '</TBODY>';
			document.getElementById('REMIND').innerHTML = html;
		},
		failure : function(response, options) {
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
	});
	//先执行一次queryRemindInfos，之后每隔10分钟刷新一次
	setTimeout("queryRemindInfos()",1000*60*10);
}


/***
 * 打开界面
 * @param {Object} model
 */
function openMenu(model) {
	var contentTabs = parent.Ext.getCmp('contentTabs');
	var tab = contentTabs.getComponent(model.id);
	if (tab == undefined) {
		contentTabs.add( {
			id : model.id,
			title : '<span>'+ model.rea_name+'</span>',
			html : '<iframe scrolling=auto frameborder=0 width=100% height=100%  src=/realware/doGo.do?description='+model.jsp+'&id='+model.id+'></iframe>',
			border : false,
			closable : true
		});
	}
	var tab = parent.Ext.getCmp(model.id);
	tab.show();
	contentTabs.setActiveTab(model.id);
}