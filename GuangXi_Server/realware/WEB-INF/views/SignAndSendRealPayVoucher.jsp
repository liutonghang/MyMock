<%@ page language="java" pageEncoding="UTF-8"%>
<%@ include file="common/taglibs.jsp"%>

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
	<head>
	

		<title>实拨签章发送</title>

		   <%@ include file="common/meta.jsp"%>
	       <%@ include file="common/scripts.jsp"%>
		<script type="text/javascript" src="<%=path%>/resources/js/SignAndSendRealPayVoucher.js"></script>
	</head>
	<script type="text/javascript">
		var loadUrl = "<%=path%>/loadRealPay.do";
		var loadTaskLogUrl="<%=path%>/loadTaskLog.do";
		var account_type_right = "5";
		var signAndSendRealPayVoucherUrl = "<%=path%>/signAndSendRealPayVoucher.do";
		var isRefund = false;
   </script>
	<body></body>
</html>
