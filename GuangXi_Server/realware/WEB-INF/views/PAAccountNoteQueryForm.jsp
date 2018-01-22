<%@ page language="java" import="java.util.*" pageEncoding="UTF-8"%>
<%@ include file="common/taglibs.jsp"%>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
  <head>
    <title>入账通知单查询</title>
	<%@ include file="common/meta.jsp"%>
	<%@ include file="common/scripts.jsp"%>
	<script type="text/javascript" src="<%=path%>/resources/js/AccountNoteQuery.js"></script>
	
  </head>
  <script type="text/javascript">
		var loadUrl = "<%=path%>/loadPayAccountNote.do";
		var loadTaskLogUrl="<%=path%>/loadTaskLog.do";
		var singAndSendAccountNoteUrl = "<%=path%>/signAndSendAccountNoteOrDaily.do";
		var sendAccountNoteUrl = "<%=path%>/sendVoucher.do";
		var sendAgainUrl = "<%=path%>/sendVoucherAgain.do"; 
   </script>
  <body>
  </body>
</html>
