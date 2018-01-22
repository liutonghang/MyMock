<%@ page language="java"  pageEncoding="UTF-8"%>
<%@ include file="common/taglibs.jsp"%>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
  <head>
    <title>直接支付凭证退款复核转账</title>
	<%@ include file="common/meta.jsp"%>
	<%@ include file="common/scripts.jsp"%>
	<script type="text/javascript" src="<%=path%>/resources/js/RefundTransferVoucherForHuNanABCM.js"></script>
  </head>
  <script type="text/javascript">
		var loadUrl = "<%=path%>/loadPayVoucher.do";
		var logUrl = "<%=path%>/loadTaskLog.do";
		var loadGrfURL = "<%=path%>/loadReportByCode.do";
		var loadDataURL="<%=path%>/loadReportData.do";
		var vtCode = "2203";   //直接支付退款通知书
		var account_type_right = "11";
		var accountType = "21";
		var backUrl = "<%=path%>/unsubmitVoucher.do";
   </script>
  <body></body>
</html>
