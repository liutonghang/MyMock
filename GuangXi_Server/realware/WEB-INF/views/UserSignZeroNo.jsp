<%@ page language="java" pageEncoding="UTF-8"%>
<%
	String path = request.getContextPath();  
	String basePath = request.getScheme()+"://"+request.getServerName()+":"+request.getServerPort()+path+"/";
%>

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
	<head> 
		<base href="<%=basePath%>">
		<title>自助柜面-零余额</title>
		
		<link rel="stylesheet" type="text/css" href="<%=path%>/resources/css/ext-all.css">
		<link rel="stylesheet" type="text/css" href="<%=path%>/resources/css/button.css">
		<script type="text/javascript" src="<%=path%>/resources/js/ext-all-min.js"></script>
		<script type="text/javascript" src="<%=path%>/resources/js/ext-lang-zh_CN.js"></script>
		<script type="text/javascript" src="<%=path%>/resources/js/BuffetCounter.js"></script>
	<%--  	<script type="text/javascript" src="<%=path%>/js/UserSignZeroNoForm.js" ></script> --%>
		<%-- <script type="text/javascript" src="<%=path%>/js/UserForm.js" > --%>
	</head>
	<script type="text/javascript">
	
		var loadUrl = "<%=path%>/loadAutoSignAccounts.do";
		
	   </script> 
	<body>
	</body>
</html>
