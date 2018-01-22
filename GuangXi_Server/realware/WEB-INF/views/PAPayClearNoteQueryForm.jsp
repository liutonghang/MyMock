<%@ page language="java" import="java.util.*" pageEncoding="UTF-8"%>
<%@ include file="common/taglibs.jsp"%>

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
  <head>
    <title>授权支付汇总清算额度通知单查询</title>
    
	<%@ include file="common/meta.jsp"%>
	<%@ include file="common/scripts.jsp"%>
	<script type="text/javascript" src="<%=path%>/resources/js/PAPayClearNoteQuery.js"></script>
  </head>
 	<script type="text/javascript">
		var loadUrl = "<%=path%>/loadPlanClearNote.do";
		var backUrl = "<%=path%>/returnVoucher.do";
		var logUrl = "<%=path%>/loadTaskLog.do";
   </script>
  <body>
  </body>
</html>
