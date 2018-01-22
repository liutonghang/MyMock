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
		<title>甘肃银行指纹登录界面(中正指纹仪)</title>
		<meta http-equiv="pragma" content="no-cache">
		<meta http-equiv="cache-control" content="no-cache">
		<meta http-equiv="expires" content="0">
		<meta http-equiv="keywords" content="keyword1,keyword2,keyword3">
		<meta http-equiv="description" content="This is my page">
		<link rel="icon" href="<%=path%>/favicon.ico" type="image/x-icon" />
		<link rel="shortcut icon" href="<%=path%>/favicon.ico" type="image/x-icon" />
		<link rel="stylesheet" type="text/css" href="<%=path%>/resources/css/login.css" />
		<link rel="stylesheet" type="text/css" href="<%=path%>/resources/css/ext-all.css">
		<script type="text/javascript" src="<%=path%>/resources/js/ext-all-min.js"></script>
		<script type="text/javascript" src="<%=path%>/resources/js/ext-lang-zh_CN.js"></script>
	
<script type="text/javascript">


var dwWaitTime = 10000; //超时时间（毫秒）

//获取当前路径
function getCurrentDirectory(){
	var locHref = location.href;
	var locArray = locHref.split("/");
  delete locArray[locArray.length-1];
  var dirTxt = locArray.join("//");
	var temp = dirTxt.substring(11);
	var newtemp="";
	//需要过滤空格%20 UNICODE显示
	var i;
	for(i=0 ;i < temp.length;i++)
	{
		if (temp.substr(i,3) == "%20")
		{
			newtemp = newtemp + " ";
			i=i+2;
		}else
		{
			newtemp = newtemp +temp.substr(i,1);
		}
	}
	//alert(newtemp);
  return newtemp;
}

var varSuccess = "成功";
var varFailed  = "失败";

var varGetTz   = "请先获取指纹特征";
var varGetMb   = "请先获取指纹模板";

var varNoEmpty = "客户信息不能为空";	
var varMax32   = "客户信息应不大于32";	
	
var varOpenDeviceFailed = "打开设备失败";
var varCancel           = "取消";
var varTimeout          = "超时"
var varReadImageFailed  = "采集失败";
var varUpImageFailed    = "上传失败";
var varGetTzFailed      = "提取特征失败";
var varGetMbFailed      = "合并模板失败";
var varParameterIllegal = "参数非法";     
var varIsGettingImage   = "已经在采集图像";  

function IsSuccess(tmp)
{
		if(tmp=="-1")
    {
    	alert(varOpenDeviceFailed);
    	return -1;
    }
    else if(tmp=="-2")
    {
    	alert(varCancel);
    	return -2;
    }
    else if(tmp=="-3")
    {
    	alert(varTimeout);
    	return -3;
    }
    else if(tmp=="-4")
    {
    	alert(varReadImageFailed);
    	return -4;
    }
    else if(tmp=="-5")
    {
    	alert(varUpImageFailed);
    	return -5;
    }
    else if(tmp=="-6")
    {
    	alert(varGetTzFailed);
    	return -10;
    }
    else if(tmp=="-7")
    {
    	alert(varGetMbFailed);
    	return -10;
    }
     else if(tmp=="-10")
    {
    	alert(varParameterIllegal);
    	return -10;
    }
    else if(tmp=="-11")
    {
    	alert(varIsGettingImage);
    	return -11;
    }	
    else
    {
    	return 0;
    }	
}
		

function Button_GetImage() {
	document.getElementById("img1").src ="miaxis.jpg";
	document.getElementById("img2").src ="miaxis.jpg";
	document.getElementById("img3").src ="miaxis.jpg";
	document.getElementById("showtext").value ="";
	var iDevIndex = document.getElementById("devNo").selectedIndex;
	if(iDevIndex == 0)
	{
		var img1 = fpDevObj.GetImage(iDevIndex,dwWaitTime);
	  if(IsSuccess(img1) == 0)
	  {
	  		document.getElementById("showtext").value =img1
				var curPath = getCurrentDirectory();
	   		fpDevObj.ImageToBmpFile(curPath+"Img.bmp",img1);
	   		document.getElementById("img1").src =curPath+"Img.bmp"
	   } 
 	}
 	else
 	{
 		alert("串口不支持采集图像");
 	}
}

var tz = 0;
var mb = 0;
function Button_GetMb() {
	document.getElementById("img1").src ="miaxis.jpg";
	document.getElementById("img2").src ="miaxis.jpg";
	document.getElementById("img3").src ="miaxis.jpg";
	document.getElementById("showtext").value ="";
	var iDevIndex = document.getElementById("devNo").selectedIndex;
	if(iDevIndex == 0)
	{
			mb  = fpDevObj.GetTemplate(iDevIndex,dwWaitTime);
			if(IsSuccess(mb) == 0)
			{
				var curPath = getCurrentDirectory();
				var mbImg1 =	fpDevObj.GetTemplateImage(1);
				fpDevObj.ImageToBmpFile(curPath+"ImgMb1.bmp",mbImg1);
				document.getElementById("img1").src =curPath+"ImgMb1.bmp";
			   		
				var mbImg2 =	fpDevObj.GetTemplateImage(2);
				fpDevObj.ImageToBmpFile(curPath+"ImgMb2.bmp",mbImg2);
				document.getElementById("img2").src =curPath+"ImgMb2.bmp";
			   		
				var mbImg3 =	fpDevObj.GetTemplateImage(3);
				fpDevObj.ImageToBmpFile(curPath+"ImgMb3.bmp",mbImg3);
				document.getElementById("img3").src =curPath+"ImgMb3.bmp";
			   		
				document.getElementById("showtext").value =mb 
			}
	}
	else
	{
		mb  = fpDevObj.GetComTemplate(iDevIndex,dwWaitTime);	
		if(IsSuccess(mb) == 0)
		{
			document.getElementById("showtext").value =mb;
		} 
	} 
}

function Button_GetTz() {
	var iDevIndex = document.getElementById("devNo").selectedIndex;
	if(iDevIndex == 0)
	{
		tz  = fpDevObj.GetFeature(iDevIndex,dwWaitTime);
		if(IsSuccess(tz) == 0)
		{
				// 提交到服务器操作
		Ext.Ajax.request({
			url : "<%=path%>/loginFingerCheck.do",
			method : 'POST',
			form : "myForm",
			params : {
				fingerFeature : tz
			},
			// 提交成功的回调函数
			success : function(response, options) {
				if (response.responseText == "OK") {
					window.location.href = "<%=path%>/index.do";
				} else {
					Ext.getDom("Validate").innerHTML = "<SPAN style='DISPLAY:inline;COLOR:red;font-size:12px'>"+response.responseText+"</SPAN>";
				}
			},
			// 提交失败的回调函数
			failure : function(response, options) {
				Ext.getDom("Validate").innerHTML = "<SPAN style='DISPLAY:inline;COLOR:red;font-size:12px'>该用户已经注销，请重新访问！</SPAN>";
			}
		});
		} 
	}else{
		tz  = fpDevObj.GetComFeature(iDevIndex,dwWaitTime);
		if(IsSuccess(tz) == 0)
		{
				// 提交到服务器操作
		Ext.Ajax.request({
			url : "<%=path%>/loginFingerCheck.do",
			method : 'POST',
			form : "myForm",
			params : {
				fingerFeature : tz
			},
			// 提交成功的回调函数
			success : function(response, options) {
				if (response.responseText == "OK") {
					window.location.href = "<%=path%>/index.do";
				} else {
					Ext.getDom("Validate").innerHTML = "<SPAN style='DISPLAY:inline;COLOR:red;font-size:12px'>"+response.responseText+"</SPAN>";
				}
			},
			// 提交失败的回调函数
			failure : function(response, options) {
				alert("ds");
				Ext.getDom("Validate").innerHTML = "<SPAN style='DISPLAY:inline;COLOR:red;font-size:12px'>该用户已经注销，请重新访问！</SPAN>";
			}
		});
	} 
	} 
}

function Button_Match() {
	  if(tz==0)
	  {
	  	alert(varGetTz);
	  	return;
	  }
	  if(mb==0)
	  {
	  	alert(varGetMb);
	  	return;
	  }
    var ret = fpDevObj.FingerMatch(mb,tz,3);
    if(ret == 0)
    	alert(varSuccess);
    else
    	alert(ret);
}

function Button_GetDevVer() {
		var ret;
		var iDevIndex = document.getElementById("devNo").selectedIndex;
		if(iDevIndex == 0)
		{
   		ret = fpDevObj.GetDevVersion(iDevIndex);
  	}
  	else
  	{
  	 	ret = fpDevObj.GetComDevVersion(iDevIndex);
  	}
    alert(ret);
}

function Button_GetOcxVer() {
		var ret;
   	ret = fpDevObj.GetOcxVersion();
    alert(ret);
}

function Button_GetAlgVer() {
		var ret;
   	ret = fpDevObj.GetAlgVersion();
    alert(ret);
}





</script>
	<BODY id=userlogin_body>
		 <object classid="CLSID:0B6CD28F-5650-4FC9-877D-F8398F5A656F"
			codebase="mxCapacitiveDriver.ocx" id="fpDevObj" height=0 width=0>
		</object>
		<center>
			<div></div>
			<FORM id="myForm" name="myForm">
				<div id="user_login">
					<DL class="user_l">
						<DD id=user_top class="user_l">
							<UL class="user_l">
								<LI class=user_top_l></LI>
								<LI class=user_top_c></LI>
								<LI class=user_top_r></LI>
							</UL>
						</DD>
						<DD id=user_main class="user_l">
							<UL class="user_l">
								<LI class=user_main_l></LI>
								<LI class=user_main_c>
									<div id="btnlist" border="1">	
				<td class=user_main_text>
					设备端口：
				</td>
									
				<select NAME="TEMP" id="devNo" style="margin-top:22px;margin-left:0px !important;*margin-left:60px;width:140px;">
		　　		
				<option value="0" select=true>USB</option>
		　　		<option value="1">COM1</option>
		　　		<option value="2">COM2</option>
		　　		<option value="3">COM3</option>
						<option value="4">COM4</option>
　　		</select>
				<tr><td colspan="2" ><DIV id="Validate"></DIV></td></tr>
			</div>
								</LI>
								<LI class=user_main_r>
									<INPUT id="IbtnEnter" onclick="Button_GetTz()" type="button" name="IbtnEnter" onkeydown="enterIn(event)" />
								</LI>
							</UL>
						</DD>
					</DL>
				</div>
			</FORM>
		</center>
</html>

