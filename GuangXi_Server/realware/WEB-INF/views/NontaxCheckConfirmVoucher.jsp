<%@ page language="java" pageEncoding="UTF-8"%>
<%@ include file="common/taglibs.jsp"%>

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
	<head>
	
		<title>收单行交易确认对账</title>

		   <%@ include file="common/meta.jsp"%>
	       <%@ include file="common/scripts.jsp"%>
		<script type="text/javascript" src="<%=path%>/nontax/NontaxCheckConfirmVoucher.js"></script>
	</head>
	<script type="text/javascript">
	    var url = "<%=path%>/nontaxLoadVoucher.do";
	    var vt_code = "2555";
   </script>
	<body></body>
</html>
