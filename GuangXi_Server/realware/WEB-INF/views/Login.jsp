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
var loginModel = 1;
var loginModelName = "密码";
function checkLogin() {
	if (checkUserName()&&checkUserVerifyCode()) {
		// 提交到服务器操作
		Ext.Ajax.request({
			url : "<%=path%>/loginCheck.do",
			method : 'POST',
			form : "myForm",
			params : {
				userName : Ext.getDom("txtUserName").value,
				userPass : Ext.getDom("txtPassword").value,
				loginModel : loginModel
			},
			// 提交成功的回调函数
			success : function(response, options) {
				if (response.responseText == "OK") {
					window.location.href = "<%=path%>/index.do";
				} else if (response.responseText == "ERROR") {
					Ext.getDom("Validate").innerHTML = "<SPAN style='DISPLAY:inline;COLOR:red;font-size:12px'>用户"+loginModelName+"错误，请重新输入！</SPAN>";
				}else{
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

//登录模式切换事件
function modelChange(obj){
	Ext.getDom("Validate").innerHTML = "";
	if(obj.value == '2'){
		loginModel = 2;
		loginModelName = "验证码";
		Ext.getDom("labelPassWord").innerHTML = "验证码：";
	}else{
		loginModel = 1;
		loginModelName = "密码";
		Ext.getDom("labelPassWord").innerHTML = "密&nbsp;&nbsp;&nbsp;码：";
	} 
}



//校验用户名不能为空
function checkUserName() {
	if ("" == Ext.getDom("txtUserName").value) {
		Ext.getDom("Validate").innerHTML = "<SPAN style='DISPLAY:inline;COLOR:red;font-size:12px'>用户名不能为空！</SPAN>";
		return false;
	} else {
		Ext.getDom("Validate").innerHTML = "";
		return true;
	}
}

//校验验证码不能为空
function checkUserVerifyCode() {
	if ("" == Ext.getDom("txtPassword").value) {
		Ext.getDom("Validate").innerHTML = "<SPAN style='DISPLAY:inline;COLOR:red;font-size:12px'>"+loginModelName+"不能为空！</SPAN>";
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
	var user=document.getElementById("txtUserName");
	user.focus(false, 100); 
});
</script>
	<BODY id=userlogin_body>
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
													用户名：
												</td>
												<td class=user_main_input>
													<INPUT id="txtUserName" name="txtUserName" maxLength=20
														type="text" onblur="checkUserName()" />
												</td>
											</tr>
											<tr>
												<td class=user_main_text id="labelPassWord">
													验证码：
												</td>
												<td class=user_main_input>
													<INPUT id="txtPassword" name="txtPassword" type="password" onblur="checkUserVerifyCode()"  onkeydown="enterIn(event)"/>
												</td>
											</tr>
											<tr>
												<td class=user_main_text></td>
												<td class=user_main_text>
													<INPUT name="loginModel" type="radio" value="2" onclick="modelChange(this);" />验证码
													<INPUT name="loginModel" type="radio" onclick="modelChange(this);" value="1" checked/>密码
												</td>
											</tr>
											<tr><td/><td><DIV id="Validate"></DIV></td></tr>
										</table>
									</DIV>
								</LI>
								<LI class=user_main_r>
									<INPUT id="IbtnEnter" onclick="checkLogin()" type="button"
										name="IbtnEnter" />
								</LI>
							</UL>
						</DD>
					</DL>
				</div>
			</FORM>
		</center>
</html>
