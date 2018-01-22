<%@ page language="java" pageEncoding="UTF-8"%>
<%@ include file="common/taglibs.jsp"%>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
	<head>
		<title>划款单退款登记</title>

		<%@ include file="common/meta.jsp"%>
		<%@ include file="common/scripts.jsp"%>
		<script type="text/javascript" src="<%=path%>/resources/js/RegisterRefundClearVoucher.js"></script>
	</head>
	 <script type="text/javascript">
		var loadUrl = "<%=path%>/loadClearPayVoucher4ClearBank.do";
		var registerClearVoucherUrl = "<%=path%>/registerRefundClearVoucher.do";
		var returnClearVoucherUrl = "<%=path%>/returnClearVoucherIsRegister.do";
		var vtCode='2302';
  </script>
	<body></body>
</html>
