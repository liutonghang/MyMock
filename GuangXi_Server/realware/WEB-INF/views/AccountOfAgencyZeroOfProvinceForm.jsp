<%@ page language="java" pageEncoding="UTF-8"%>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">

<%
String path = request.getContextPath();
String basePath = request.getScheme()+"://"+request.getServerName()+":"+request.getServerPort()+path+"/";
%>

<html>
	<head>
		<base href="<%=basePath%>">
		<title>全省单位零余额账户维护</title>
		<!-- ExtJS -->
		<link rel="stylesheet" type="text/css" href="<%=path%>/resources/css/ext-all.css">
		<link rel="stylesheet" type="text/css" href="<%=path%>/resources/css/button.css">
		<script type="text/javascript" src="<%=path%>/resources/js/ext-all-min.js"></script>
		<script type="text/javascript" src="<%=path%>/resources/js/ext-lang-zh_CN.js"></script>
		<script type="text/javascript" src="<%=path%>/resources/js/tasklog.js"></script>
		<script type="text/javascript" src="<%=path%>/resources/js/AccountOfAgencyZeroOfProvince.js"></script>
		<script type="text/javascript" src="<%=path%>/resources/js/Account_Add.js"></script>
		<script type="text/javascript" src="<%=path%>/resources/js/Account_Del.js"></script>
		<script type="text/javascript" src="<%=path%>/resources/js/Account_Edit.js"></script>
		<script type="text/javascript" src="<%=path%>/resources/js/AccountSyn.js"></script>
		<script type="text/javascript" src="<%=path%>/resources/js/QueryBalance.js"></script>
	</head>
	<script type="text/javascript">
	
		var comboAdmdiv =  Ext.create('Ext.data.Store', {
			fields : ['admdiv_code', 'admdiv_name'],
			data : ${admList}
		});
		
		var loadUrl = "<%=path%>/loadAllAgencyZeroAccount.do";
		var synUrl = "<%=path%>/accountSyn.do";
   </script>
	<body></body>
</html>
