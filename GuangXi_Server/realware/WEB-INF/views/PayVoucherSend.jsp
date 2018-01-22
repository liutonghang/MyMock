<%@ page language="java" pageEncoding="UTF-8"%>
<%@ include file="common/taglibs.jsp"%>

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
	<head>
	

		<title>缴款通知回单发送财政</title>

		   <%@ include file="common/meta.jsp"%>
	       <%@ include file="common/scripts.jsp"%>
		<script type="text/javascript" src="<%=path%>/nontax/PayVoucherSend.js"></script>
	</head>
	<script type="text/javascript">
		var loadUrl = "<%=path%>/loadReceipt.do";
		var signAndSendUrl = "<%=path%>/signAndSend.do";
		var isRefund = false;
   </script>
	<body></body>
</html>
