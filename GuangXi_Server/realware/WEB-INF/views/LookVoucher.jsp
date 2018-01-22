<%@ page language="java" pageEncoding="UTF-8"%>
<%
	String path = request.getContextPath();
	String basePath = request.getScheme() + "://"
			+ request.getServerName() + ":" + request.getServerPort()
			+ path + "/";
%>

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
	<head>
		<base href="<%=basePath%>">

		<title>凭证查看</title>

		<meta http-equiv="pragma" content="no-cache">
		<meta http-equiv="cache-control" content="no-cache">
		<meta http-equiv="expires" content="0">
		<meta http-equiv="keywords" content="keyword1,keyword2,keyword3">
		<meta http-equiv="description" content="This is my page">
		<link rel="stylesheet" type="text/css" href="<%=path%>/resources/css/ext-all.css" />
		<script type="text/javascript" src="<%=path%>/resources/js/ext-all-min.js"></script>
		<script type="text/javascript" src="<%=path%>/resources/js/ext-lang-zh_CN.js"></script>
		<style type="text/css">
.btn1_mouseout {
	border-right: #8DB6CD 1px solid;
	padding-right: 2px;
	border-top: #8DB6CD 1px solid;
	padding-left: 2px;
	font-size: 12px;
	filter: progid : DXImageTransform . Microsoft .
		Gradient(GradientType = 0, StartColorStr = #8DB6CD, EndColorStr =
		#8DB6CD);
	border-left: #8DB6CD 1px solid;
	cursor: hand;
	color: black;
	padding-top: 2px;
	border-bottom: #8DB6CD 1px solid;
	width: 70px;
	height: 21px;
}

.btn1_mouseover {
	border-right: #BABABA 1px solid;
	padding-right: 2px;
	border-top: #BABABA 1px solid;
	padding-left: 2px;
	font-size: 12px;
	filter: progid : DXImageTransform . Microsoft .
		Gradient(GradientType = 0, StartColorStr = #BABABA, EndColorStr =
		#BABABA);
	border-left: #BABABA 1px solid;
	cursor: hand;
	color: black;
	padding-top: 2px;
	border-bottom: #BABABA 1px solid;
	width: 70px;
	height: 21px;
}
</style>
</head>

<script type="text/javascript">
var evoucherUrl = '<%=request.getAttribute("evoucherUrl")%>';
var esatmpUrl = '<%=request.getAttribute("esatmpUrl")%>';
var certID = '<%=request.getAttribute("certID")%>';
var admivCode = '<%=request.getAttribute("admivCode")%>';
var year = <%=request.getAttribute("year")%>;
var vtCode = '<%=request.getAttribute("vtCode")%>';
var voucherNo = '<%=request.getAttribute("voucherNo")%>';
var xml = '<%=request.getAttribute("xml")%>';
var base64EncodeChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
var base64DecodeChars = new Array(
    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63,
    52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1,
    -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14,
    15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1,
    -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
    41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1);
function base64encode(str) {
    var out, i, len;
    var c1, c2, c3;

    len = str.length;
    i = 0;
    out = "";
    while (i < len) {
        c1 = str.charCodeAt(i++) & 0xff;
        if (i == len) {
            out += base64EncodeChars.charAt(c1 >> 2);
            out += base64EncodeChars.charAt((c1 & 0x3) << 4);
            out += "==";
            break;
        }
        c2 = str.charCodeAt(i++);
        if (i == len) {
            out += base64EncodeChars.charAt(c1 >> 2);
            out += base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
            out += base64EncodeChars.charAt((c2 & 0xF) << 2);
            out += "=";
            break;
        }
        c3 = str.charCodeAt(i++);
        out += base64EncodeChars.charAt(c1 >> 2);
        out += base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
        out += base64EncodeChars.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >> 6));
        out += base64EncodeChars.charAt(c3 & 0x3F);
    }
    return out;
}

function base64decode(str) {
    var c1, c2, c3, c4;
    var i, len, out;

    len = str.length;
    i = 0;
    out = "";
    while (i < len) {
        /* c1 */
        do {
            c1 = base64DecodeChars[str.charCodeAt(i++) & 0xff];
        } while (i < len && c1 == -1);
        if (c1 == -1)
            break;

        /* c2 */
        do {
            c2 = base64DecodeChars[str.charCodeAt(i++) & 0xff];
        } while (i < len && c2 == -1);
        if (c2 == -1)
            break;

        out += String.fromCharCode((c1 << 2) | ((c2 & 0x30) >> 4));

        /* c3 */
        do {
            c3 = str.charCodeAt(i++) & 0xff;
            if (c3 == 61)
                return out;
            c3 = base64DecodeChars[c3];
        } while (i < len && c3 == -1);
        if (c3 == -1)
            break;

        out += String.fromCharCode(((c2 & 0XF) << 4) | ((c3 & 0x3C) >> 2));

        /* c4 */
        do {
            c4 = str.charCodeAt(i++) & 0xff;
            if (c4 == 61)
                return out;
            c4 = base64DecodeChars[c4];
        } while (i < len && c4 == -1);
        if (c4 == -1)
            break;
        out += String.fromCharCode(((c3 & 0x03) << 6) | c4);
    }
    return out;
}
//设置URL
function setUrl(evoucherUrl,estampUrl)
{
	try
	{    
		var ActiveX = document.getElementById("CTJEstampOcx");
		if (ActiveX) 
		{
			var ret = ActiveX.SetEvoucherServiceUrl(evoucherUrl);
			var ret = ActiveX.SetEstampServiceUrl(estampUrl);
			if(ret!=0){
            	alert(ActiveX.GetLastErr());
            }
		}
		else
		{
			alert("get ActiveX failure\n");
		}

	}
  catch(e){}
}
//初始化OCX
function init(certID,admivcode,year,vtCode) {
    try {
        var ActiveX = document.getElementById("CTJEstampOcx");
        if (ActiveX) {
            var ret = ActiveX.Initialize(certID, admivcode, year, vtCode,"0",2,1,0);
            if(ret!=0){
            	alert(ActiveX.GetLastErr());
            }
        }
        else {
            alert("get ActiveX failure\n");
        }
    }
    catch (e) { }
}
//添加凭证
function addVoucher(voucherNo,xml) {
    try {
        var ActiveX = document.getElementById("CTJEstampOcx");
        if (ActiveX) {
            var ret = ActiveX.AddVoucher(voucherNo,xml);
        }
        else {
            alert("get ActiveX failure\n");
        }
    }
    catch (e) { }
}

//显示凭证
function setCurrentVoucher(voucherNo) {
    try {
        var ActiveX = document.getElementById("CTJEstampOcx");
        if (ActiveX) {
            var ret = ActiveX.SetCurrentVoucher(voucherNo);
           	if(ret!=0){
            	alert(ActiveX.GetLastErr());
            }
        }
        else {
            alert("get ActiveX failure\n");
        }
    }
    catch (e) { }
}

//上一联
function pageUp() {
    try {
        var ActiveX = document.getElementById("CTJEstampOcx");
        if (ActiveX) {
            var ret = ActiveX.PageUp();
            if(ret!=0){
            	alert(ActiveX.GetLastErr());
            }
        }
        else {
            alert("get ActiveX failure\n");
        }

    }
    catch (e) { }
}
//下一联
function pageDown() {
    try {
        var ActiveX = document.getElementById("CTJEstampOcx");
        if (ActiveX) {
            var ret = ActiveX.PageDown();
            if(ret!=0){
            	alert(ActiveX.GetLastErr());
            }
        }
        else {
            alert("get ActiveX failure\n");
        }

    }
    catch (e) { }
}
//打印
function PrintAllVoucher()
{
		try{
			var ActiveX = document.getElementById("CTJEstampOcx");
			if (ActiveX) {
            var ret = ActiveX.PrintAllVoucher(certID,admivCode,year,vtCode,0,voucherNo); 
            if(ret!=0){
            	alert(ActiveX.GetLastErr());
            }
        }
        else {
            alert("get ActiveX failure\n");
        }

    }
    catch (e) { }
}
Ext.onReady(function() {
	setUrl(evoucherUrl,esatmpUrl);
	init(certID, admivCode, year, vtCode);
	addVoucher(voucherNo,xml);
	setCurrentVoucher(voucherNo);
	
});
</script>
	<body style="word-spacing: 0; margin: 0">
		<button class="btn1_mouseout"
			onmouseover="this.className='btn1_mouseover'"
			onmouseout="this.className='btn1_mouseout'"
			onclick="javascript:pageUp()">
			上一联
		</button>
		&nbsp;
		<button class="btn1_mouseout"
			onmouseover="this.className='btn1_mouseover'"
			onmouseout="this.className='btn1_mouseout'"
			onclick="javascript:pageDown()">
			下一联
		</button>
		&nbsp;
		<!-- <button class="btn1_mouseout"
			onmouseover="this.className='btn1_mouseover'"
			onmouseout="this.className='btn1_mouseout'"
			onclick="javascript:PrintAllVoucher()">
			打印
		</button>  -->
		<OBJECT CLASSID="clsid:4FC4CDDF-84E5-437C-8527-B23F6D70866C"
			style="width:'100%';height:'100%'" ID="CTJEstampOcx"
			CODEBASE="../Release/CTJEstampOcx.cab#version=1,0,0,0"></OBJECT>
		<br>
	</body>
</html>
