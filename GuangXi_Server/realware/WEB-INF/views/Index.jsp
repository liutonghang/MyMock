<%@ page language="java" pageEncoding="UTF-8"%>
<%@include file="CheckLogin.jsp"%>
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
		<link rel="icon" href="<%=path%>/favicon.ico" type="image/x-icon" />
		<link rel="shortcut icon" href="<%=path%>/favicon.ico" type="image/x-icon" />
		<title>财政国库资金电子化管理系统</title>
		<meta http-equiv="pragma" content="no-cache">
		<meta http-equiv="cache-control" content="no-cache">
		<meta http-equiv="expires" content="0">
		<meta http-equiv="keywords" content="keyword1,keyword2,keyword3">
		<meta http-equiv="description" content="This is my page">
		<link rel="stylesheet" type="text/css" href="<%=path%>/resources/css/ext-all.css" />
		<link rel="stylesheet" type="text/css" href="<%=path%>/resources/css/button.css" />
		<script type="text/javascript" src="<%=path%>/resources/js/ext-all-min.js" defer="defer"></script>
		<script type="text/javascript" src="<%=path%>/resources/js/ext-lang-zh_CN.js" defer="defer"></script>
		<script type="text/javascript" src="<%=path%>/resources/js/Index.js" defer="defer"></script>
	</head>
	<script type="text/javascript">
			var  loginModel = "${loginModel}";  //1密码登录
	</script>
	<body>
	</body>
</html>
