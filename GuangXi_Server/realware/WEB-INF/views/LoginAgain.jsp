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
	Ext.onReady(function() {
		window.parent.location.href = "/realware/login.do";
	});
</script>
	<body>
	</body>	
</html>

