﻿<%@ page language="java" pageEncoding="UTF-8"%>
<%@ include file="common/taglibs.jsp"%>

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
	<head>
		<title>冲销凭证查询</title>

		<%@ include file="common/meta.jsp"%>
		<%@ include file="common/scripts.jsp"%>
		<script type="text/javascript" src="<%=path%>/resources/js/share/menuBtnStatus.js"></script>
		<script type="text/javascript" src="<%=path%>/resources/js/share/gridPanel.js"></script>
		<script type="text/javascript" src="<%=path%>/resources/js/share/json2String.js"></script>
		<script type="text/javascript" src="<%=path%>/resources/js/QueryWriteoffVoucher.js"></script>
	</head>
	<script type="text/javascript">
		var backUrl = "<%=path%>/returnVoucher.do";
		var logUrl = "<%=path%>/loadTaskLog.do";
   </script>
	<body></body>
</html>