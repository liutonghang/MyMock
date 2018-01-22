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
		<title>登录界面</title>
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
	</head>
<script type="text/javascript">
function checkLogin() {
	if (checkTellerCode() && checkUserCode()) {
		var proInfo = ABC_FingerReaderActiveXCtl.Func_GetProductInfo();
    	if(proInfo == "-1")
    	{
    		Ext.getDom("Validate").innerHTML = "<SPAN style='DISPLAY:inline;COLOR:red;font-size:12px'>获取硬件设备信息失败!</SPAN>";
    		return;
    	}
    	var finFeature  = ABC_FingerReaderActiveXCtl.Func_GetFingerFeature();
    	if(finFeature=="-1")
    	{
    		Ext.getDom("Validate").innerHTML = "<SPAN style='DISPLAY:inline;COLOR:red;font-size:12px'>获取指纹数据失败!</SPAN>";
    		return;
    	}
		// 提交到服务器操作
		Ext.Ajax.request({
			url : "<%=path%>/loginCheck.do",
			method : 'POST',
			form : "myForm",
			params : {
				userName : Ext.getDom("txtUserCode").value,
				tellerCode : Ext.getDom("txtTellerCode").value,
				fingerFeature : finFeature,
				productInfo : proInfo
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
				Ext.getDom("Validate").innerHTML = "<SPAN style='DISPLAY:inline;COLOR:red;font-size:12px'>后台数据访问失败！</SPAN>";
			}
		});
	}
}

//校验用户名不能为空
function checkUserCode() {
	var userCode = Ext.getDom("txtUserCode").value;
	if ("" == userCode) {
		Ext.getDom("Validate").innerHTML = "<SPAN style='DISPLAY:inline;COLOR:red;font-size:12px'>身份证号不能为空！</SPAN>";
		return false;
	} else {
		Ext.getDom("Validate").innerHTML = "";
		return true;
	}
}

function validateUserCode(){
	var userCode = Ext.getDom("txtUserCode").value;
	if ("" == userCode) {
		Ext.getDom("Validate").innerHTML = "<SPAN style='DISPLAY:inline;COLOR:red;font-size:12px'>身份证号不能为空！</SPAN>";
	} else {
		Ext.Ajax.request({
			url : "<%=path%>/checkTellerCode.do",
			method : 'POST',
			params : {
				userName : userCode
			},
			// 提交成功的回调函数
			success : function(response, options) {
				Ext.getDom("txtTellerCode").value =response.responseText;
				Ext.getDom("Validate").innerHTML = "";
			},
			// 提交失败的回调函数
			failure : function(response, options) {
				Ext.getDom("Validate").innerHTML = "<SPAN style='DISPLAY:inline;COLOR:red;font-size:12px'>"+response.responseText+"</SPAN>";
			}
		});
	}
}

//校验验证码不能为空
function checkTellerCode() {
	if ("" == Ext.getDom("txtTellerCode").value) {
		Ext.getDom("Validate").innerHTML = "<SPAN style='DISPLAY:inline;COLOR:red;font-size:12px'>终端号不能为空！</SPAN>";
		return false;
	} else {
		Ext.getDom("Validate").innerHTML = "";
		return true;
	}
}

//回车事件
function enterIn(evt){
	var event=evt?evt:(window.event?window.event:null);//兼容IE和FF
    if (event.keyCode==13){
     	event.returnValue = false ; 
    	checkLogin();
  	}
}
Ext.onReady(function() {
	//设置用户编码为焦点
	//myForm.child('#txtUserName').focus();
	var user=document.getElementById("txtUserCode");
	user.focus(false, 100); 
});
</script>
	<BODY id=userlogin_body>
		<OBJECT CLASSID="clsid:1C46791B-9C87-4497-8662-EC3C6AE931B9"
			id="ABC_FingerReaderActiveXCtl" height=0 width=0  CODEBASE="Finger.CAB">
		</OBJECT>
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
									<DIV class="user_main_box">
										<table>
											<tr>
												<td class=user_main_text>
													身份证号：
												</td>
												<td class=user_main_input>
													<INPUT id="txtUserCode" name="txtUserCode" maxLength=50
														type="text" onblur="validateUserCode()" />
												</td>
											</tr>
											<tr>
												<td class=user_main_text>
													终端号：
												</td>
												<td class=user_main_input>
													<INPUT id="txtTellerCode" name="txtTellerCode" type="text" onblur="checkTellerCode()"  onkeydown="enterIn(event)"/>
												</td>
											</tr>
											<tr><td colspan="2" ><DIV id="Validate"></DIV></td></tr>
										</table>
									</DIV>
								</LI>
								<LI class=user_main_r>
									<INPUT id="IbtnEnter" onclick="checkLogin()" type="button" name="IbtnEnter" />
								</LI>
							</UL>
						</DD>
					</DL>
				</div>
			</FORM>
		</center>
</html>

