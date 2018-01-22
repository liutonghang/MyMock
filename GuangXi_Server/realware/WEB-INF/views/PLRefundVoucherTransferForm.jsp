<%@ page language="java"  pageEncoding="UTF-8"%>
<%@ include file="common/taglibs.jsp"%>

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
  <head>
    
    <title>直接支付退款凭证复核转账（财政发来的退款凭证）</title>
    
	<%@ include file="common/meta.jsp"%>
	<%@ include file="common/scripts.jsp"%>
	<script type="text/javascript" src="<%=path%>/resources/js/RefundVoucherTransfer.js"></script>
  </head>
  <script type="text/javascript">
		var loadUrl = "<%=path%>/loadPayVoucher.do";
		var logUrl = "<%=path%>/loadTaskLog.do";
		var backUrl = "<%=path%>/returnVoucherNoWf.do";
		var accountType = "21";
  </script>
  <body></body>
</html>
