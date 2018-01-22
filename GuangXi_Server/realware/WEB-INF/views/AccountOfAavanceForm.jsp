<%@ page language="java" pageEncoding="UTF-8"%>
<%@ include file="common/taglibs.jsp"%>

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">

<%
String path = request.getContextPath();
String basePath = request.getScheme()+"://"+request.getServerName()+":"+request.getServerPort()+path+"/";
%>

<html>
	<head>
		<base href="<%=basePath%>">
		<title>垫支户维护</title>
		<!-- ExtJS -->
		<link rel="stylesheet" type="text/css" href="<%=path%>/resources/css/ext-all.css">
		<link rel="stylesheet" type="text/css" href="<%=path%>/resources/css/button.css">
		<script type="text/javascript" src="<%=path%>/resources/js/ext-all-min.js"></script>
		<script type="text/javascript" src="<%=path%>/resources/js/ext-lang-zh_CN.js"></script>
		<script type="text/javascript" src="<%=path%>/resources/js/AccountOfAdvance.js"></script>
	</head>
	<script type="text/javascript">
		var comboAdmdiv =  Ext.create('Ext.data.Store', {
			fields : ['admdiv_code', 'admdiv_name'],
			data : ${admList}
		});
		
		var comboAccountType =  Ext.create('Ext.data.Store', {
			fields : ['account_type_code', 'accont_type_name'],
			data : ${ifn:listToJson(advanceAccTypeList)}
		});	
				
		var loadUrl = "<%=path%>/loadAdvanceAccount.do";
		var directAccType = "21";   //直接支付垫支户类型
		var accreditAccType = "22";  //授权支付垫支户类型
   </script>
	<body></body>
</html>
