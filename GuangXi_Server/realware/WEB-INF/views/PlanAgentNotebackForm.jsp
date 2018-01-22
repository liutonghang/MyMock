<%@ page language="java" pageEncoding="UTF-8"%>
<%@ include file="common/taglibs.jsp"%>

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
	<head>

		<title>授权额度通知单回单</title>

	    <%@ include file="common/meta.jsp"%>
		<%@ include file="common/scripts.jsp"%>

		<script type="text/javascript" src="<%=path%>/resources/js/PlanAgentNoteBack.js"></script>
	</head>
	<script type="text/javascript">
		var loadUrl = "<%=path%>/loadBudgetNote.do";
		var signPlanAgentNoteUrl = "<%=path%>/signAndSendPlanAgentNoteReturn.do";
		var backUrl = "<%=path%>/backPlanAgentNoteVouches.do";
   </script>
	<body></body>
</html>
