<%@ page language="java" import="java.util.*" pageEncoding="UTF-8"%>
<%@ include file="common/taglibs.jsp"%>

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
  <head>
    <title>授权支付退款划款单发送（人行）</title>
    <%@ include file="common/meta.jsp"%>
	<%@ include file="common/scripts.jsp"%>
	<script type="text/javascript" src="<%=path%>/resources/js/ClearSendTIPS.js"></script>
  </head>
  <script type="text/javascript">
  	var loadClearUrl = "<%=path%>/loadClearPayVoucher.do";
  	var logUrl = "<%=path%>/loadTaskLog.do";
	var isInput = true;
	var payMount = false;
  </script>
	<body></body>
</html>
