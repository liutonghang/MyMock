<%@ page language="java" import="java.util.*" pageEncoding="UTF-8"%>
<%@ include file="common/taglibs.jsp"%>

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
  <head>
    <title>授权额度通知单查询</title>
    
	<%@ include file="common/meta.jsp"%>
	<%@ include file="common/scripts.jsp"%>
	<script type="text/javascript" src="<%=path%>/resources/js/PlanAgentNoteQuery.js"></script>
  </head>
 	<script type="text/javascript">
		var loadUrl = "<%=path%>/loadBudgetNote.do";
		var backUrl = "<%=path%>/returnVoucher.do";
		var logUrl = "<%=path%>/loadTaskLog.do";
		//var vtCode = "5201";   //直接支付凭证类型
		//var account_type_right = "11";
   </script>
  <body>
  </body>
</html>

