<%@ page language="java" pageEncoding="UTF-8"%>
<%
	String path = request.getContextPath();  
	String basePath = request.getScheme()+"://"+request.getServerName()+":"+request.getServerPort()+path+"/";
%>

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
	<head> 
		<base href="<%=basePath%>">
		<title>自助柜面</title>
		<script type="text/javascript" src="<%=path%>/resources/js/ext-all-min.js"></script>
		<script type="text/javascript" src="<%=path%>/resources/js/ext-lang-zh_CN.js"></script>
		<script type="text/javascript">
//设置网页打印的页眉页脚为空
function pagesetup_null(){
	try{
var RegWsh = new ActiveXObject("WScript.Shell")

RegWsh.RegWrite("HKEY_CURRENT_USER\\Software\\Microsoft\\Internet Explorer\\PageSetup\\header","")

RegWsh.RegWrite("HKEY_CURRENT_USER\\Software\\Microsoft\\Internet Explorer\\PageSetup\\footer","")
}catch(e){}
}
	   </script> 
	</head>
	<body onload = "pagesetup_null()">
	<div>
		<div style = "margin-top:150px;margin-left:300px">
			<table>
				<tr><td>操作员代码：</td><td id="aa"></td></tr>
				<tr><td>密码：</td><td id="bb"></td></tr>
			</table>
		</div>
		</div>	
	</body>
</html>
