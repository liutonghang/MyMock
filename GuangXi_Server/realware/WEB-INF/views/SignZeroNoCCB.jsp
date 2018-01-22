<%@ page language="java" pageEncoding="UTF-8"%>
<%
	String path = request.getContextPath();  
%>

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
	<head> 
		<title>建行自助柜面客户签约</title>
		<link rel="stylesheet" type="text/css" href="<%=path%>/resources/css/ext-all.css">
		<link rel="stylesheet" type="text/css" href="<%=path%>/resources/css/button.css">
		<script type="text/javascript" src="<%=path%>/resources/js/ext-all-min.js"></script>
		<script type="text/javascript" src="<%=path%>/resources/js/ext-lang-zh_CN.js"></script>
		<script type="text/javascript" src="<%=path%>/resources/js/SignZeroNoCCB.js"></script>
	</head>
	<script type="text/javascript">
		var comboAdmdiv =  Ext.create('Ext.data.Store', {
				fields : ['admdiv_code', 'admdiv_name'],
				data : ${admList}
			});
		var loadUrl = "<%=path%>/loadSignAccountCCB.do";
	   </script> 
	<body>
	</body>
</html>
