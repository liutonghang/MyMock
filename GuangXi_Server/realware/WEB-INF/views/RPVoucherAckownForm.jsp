<%@ page language="java"  pageEncoding="UTF-8"%>
<%@ include file="common/taglibs.jsp"%>

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
  <head>
    
    <title>实拨凭证确认</title>
    
		<%@ include file="common/meta.jsp"%>
	    <%@ include file="common/scripts.jsp"%>
	    <script type="text/javascript" src="<%=path%>/resources/js/share/realvoucherBankNo.js"></script>
		<script type="text/javascript" src="<%=path%>/resources/js/RPVoucherAckownForm.js"></script>
  </head>
  <script type="text/javascript">
		var loadUrl = "<%=path%>/loadRealPayWithBankNo.do";
		var account_type_right = "5";
		var loadTaskLogUrl="<%=path%>/loadTaskLog.do";
		var bank_type=${bank_type};
   </script>
  <body></body>
</html>