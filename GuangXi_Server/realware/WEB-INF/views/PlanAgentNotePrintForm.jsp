<%@ page language="java" import="java.util.*" pageEncoding="UTF-8"%>
<%@ include file="common/taglibs.jsp"%>

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
	<head>

		<title>授权额度通知单打印</title>
        <%@ include file="common/meta.jsp"%>
		<%@ include file="common/scripts.jsp"%>
		<script type="text/javascript" src="<%=path%>/resources/js/PlanAgentNotePrint.js"></script>
		<script type="text/javascript" src="<%=path%>/resources/js/printPlanVoucher.js"></script>
	</head>
	<script type="text/javascript">

		var loadUrl = "<%=path%>/loadBudgetNote.do";
		var backUrl = "<%=path%>/returnVoucher.do";
		var logUrl = "<%=path%>/loadTaskLog.do";
		var printUrl = "<%=path%>/printVoucherForDB.do";
//		var account_type_right = "14";
   </script>
	<body></body>
</html>
