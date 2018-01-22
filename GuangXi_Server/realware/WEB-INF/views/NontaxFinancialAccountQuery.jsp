<%@ page language="java" pageEncoding="UTF-8"%>
<%@ include file="common/taglibs.jsp"%>

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
	<head>
		<title>财政专户账户查询</title>

		<%@ include file="common/meta.jsp"%>
		<%@ include file="common/scripts.jsp"%>
		
		<script type="text/javascript" src="<%=path%>/nontax/NontaxAccountQuery.js"></script>
	</head>
	 <script type="text/javascript">
	 var loadUrl = "<%=path%>/nontaxLoadAccount.do";
     var acctTypeCode = "1";
     </script>
	<body></body>
</html>
