<%@ page language="java" import="java.util.*" pageEncoding="UTF-8"%>
<%@ include file="common/taglibs.jsp"%>

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
  <head>

    
    <title>实拨退款拨款单查询</title>
    
	<%@ include file="common/meta.jsp"%>
	<%@ include file="common/scripts.jsp"%>
	<script type="text/javascript" src="<%=path%>/resources/js/RefRealpayVoucherQuery.js"></script>
  </head>
  <script type="text/javascript">
		var loadUrl = "<%=path%>/loadRealPay.do";
		var loadTaskLogUrl="<%=path%>/loadTaskLog.do";
		var serverPrint = "<%=path%>/printVoucherForDB.do";
		var vt_code = '3208';
   </script>
  <body>
  </body>
</html>
