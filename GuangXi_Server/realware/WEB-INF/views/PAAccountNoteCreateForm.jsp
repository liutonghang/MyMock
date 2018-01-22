<%@ page language="java" import="java.util.*" pageEncoding="UTF-8"%>
<%@ include file="common/taglibs.jsp"%>

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
  <head>
    <title>直接支付入账通知单</title>
    
	<%@ include file="common/meta.jsp"%>
	<%@ include file="common/scripts.jsp"%>
	<script type="text/javascript" src="<%=path%>/resources/js/AccountNoteCreateForm.js"></script>
  </head>
  <script type="text/javascript">
	var loadUrl = "<%=path%>/loadPayVoucherForAccountNote.do";//loadPayVoucher.do
	var loadTaskLogUrl="<%=path%>/loadTaskLog.do";
	var loadPayAccountNoteUrl= "<%=path%>/loadPayAccountNote.do";
   </script>
  <body>
  </body>
</html>
